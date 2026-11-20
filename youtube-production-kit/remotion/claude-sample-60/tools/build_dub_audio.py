"""English dub: place English clips at the Hindi line starts (from src/full/timing.ts), same music + sound design,
write public/audio/full_mix_en.wav and out/claude_ai_youtube_full.en.srt. Usage: build_dub_audio.py <en_wav_dir> <script_en.txt>"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN, SCRIPT = sys.argv[1], sys.argv[2]
SR, FPS = 48000, 30
T = open(os.path.join(ROOT, "src", "full", "timing.ts")).read()
TOTAL = int(re.search(r"TOTAL = (\d+)", T).group(1)); TOTAL_S = TOTAL / FPS
SC = [dict(scene=i + 1, fr=int(a), dur=int(b)) for i, (a, b) in enumerate(re.findall(r'\{"from": (\d+), "dur": (\d+)\}', T.split("export const LINES")[0]))]
HL = [dict(scene=int(a), start=int(b) / FPS, hdur=int(c) / FPS) for a, b, c in re.findall(r'\{"scene": (\d+), "from": (\d+), "dur": (\d+)\}', T)]
TXT = [l.strip() for l in open(SCRIPT, encoding="utf-8") if l.strip()]
assert len(TXT) == len(HL) == 116
def load(path, tempo=1.0):
    af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"
    if tempo > 1.005: af = f"atempo={tempo:.4f}," + af
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", af, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
clips, lines, prev_end, fits = [], [], 0.0, []
for i, h in enumerate(HL):
    nxt = HL[i + 1]["start"] if i + 1 < len(HL) else TOTAL_S - 2.0
    c = load(os.path.join(EN, f"line_{i + 1:03d}.wav"))
    start = max(h["start"], prev_end + 0.15)
    room = nxt - start - 0.12
    tempo = 1.0
    if len(c) / SR > room:
        tempo = min(1.2, (len(c) / SR) / max(room, 0.5)); c = load(os.path.join(EN, f"line_{i + 1:03d}.wav"), tempo)
    clips.append(c); lines.append(dict(scene=h["scene"], start=start, dur=len(c) / SR, sub=TXT[i])); prev_end = start + len(c) / SR
    fits.append((i + 1, round(tempo, 3), round(start - h["start"], 2)))
scenes = SC
# subtitle cues: at most ~78 characters (two lines), split at punctuation, then at word boundaries
def chunks(text, maxc=78):
    parts = [p.strip() for p in re.split(r"(?<=[।?!,.:])\s+", text) if p.strip()]
    out = []
    for p in parts:
        if out and len(out[-1]) + 1 + len(p) <= maxc: out[-1] += " " + p
        elif len(p) <= maxc: out.append(p)
        else:
            cur = ""
            for w in p.split():
                if cur and len(cur) + 1 + len(w) > maxc: out.append(cur); cur = w
                else: cur = (cur + " " + w).strip()
            if cur: out.append(cur)
    return out
subs = []
for l in lines:
    cs = chunks(l["sub"]); tot = sum(len(c) for c in cs); s = l["start"]
    for c in cs:
        d = l["dur"] * len(c) / tot; subs.append(dict(a=s, b=s + d, text=c)); s += d

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
with open(os.path.join(ROOT, "out", "claude_ai_youtube_full.en.srt"), "w", encoding="utf-8") as f:
    for k, s in enumerate(subs, 1): f.write(f"{k}\n{ts(s['a'])} --> {ts(s['b'])}\n{s['text']}\n\n")

# ---------------- audio ----------------
NS = int(TOTAL_S * SR); voice = np.zeros(NS, np.float32); vmask = np.zeros(NS, np.float32)
for l, c in zip(lines, clips):
    a = int(l["start"] * SR); b = min(NS, a + len(c)); voice[a:b] += c[:b - a]; vmask[a:b] = 1
voice /= np.abs(voice).max() + 1e-9
rng = np.random.default_rng(7)
def tone(fq, amp, dec, ln, f2=None):
    tt = np.arange(int(ln * SR)) / SR; fr = fq if f2 is None else fq + (f2 - fq) * tt / ln
    return (amp * np.sin(2 * np.pi * np.cumsum(np.full_like(tt, 1.0) * fr) / SR) * np.exp(-dec * tt)).astype(np.float32)
def noise(ln, lo, hi, amp):
    n = int(ln * SR); x = rng.standard_normal(n); X = np.fft.rfft(x); fq = np.fft.rfftfreq(n, 1 / SR)
    X[(fq < lo) | (fq > hi)] = 0; y = np.fft.irfft(X, n); env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return (y / (np.abs(y).max() + 1e-9) * env * amp).astype(np.float32)
sfx = np.zeros(NS, np.float32)
def put(sig, sec, g=1.0):
    a = int(sec * SR); b = min(NS, a + len(sig))
    if 0 <= a < NS: sfx[a:b] += g * sig[:b - a]
whoosh, pop = noise(.6, 250, 3500, .14), tone(700, .05, 30, .12, 1050)
impact = tone(55, .5, 3.5, 1.6)                                          # soft cinematic low hit at the start
put(impact, 0.25, .9)
for s in scenes[1:]: put(whoosh, s["fr"] / FPS - 0.12)
for l in lines: put(pop, l["start"] + 0.05, .55)                       # soft UI tick as each beat's elements appear
proc = np.concatenate([tone(1800 + 300 * (k % 3), .025, 60, .05) for k in range(10)])
for sc, k in ((7, 3), (9, 1), (10, 3), (11, 6)):                       # "processing" chirps where AI output appears
    l = [x for x in lines if x["scene"] == sc][k]; put(proc, l["start"] + 0.4, .8)
chime = np.zeros(int(1.6 * SR), np.float32)
for i, fq in enumerate([523.25, 659.25, 783.99, 1046.5]):
    c = tone(fq, .1, 4, 1.2); a = int(i * .1 * SR); chime[a:a + len(c)] += c
put(chime, [x for x in lines if x["scene"] == 13][-1]["start"] + 0.2, .9)
beat = 60 / 90; bar = 4 * beat
progs = [[[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [164.81, 207.65, 246.94]],
         [[174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [220.0, 261.63, 329.63], [246.94, 293.66, 369.99]]]
music = np.zeros(NS, np.float32)
for ci in range(int(TOTAL_S / bar) + 1):
    a = int(ci * bar * SR)
    if a >= NS: break
    ch = progs[(ci // 16) % 2][ci % 4]; b = min(NS, a + int(bar * SR)); tt = np.arange(b - a) / SR
    env = np.minimum(1, tt / .6) * np.minimum(1, (bar - tt) / .7)
    pad = sum(np.sin(2 * np.pi * fq * tt) + .45 * np.sin(2 * np.pi * fq * 1.004 * tt) + .15 * np.sin(2 * np.pi * 2 * fq * tt) for fq in ch)
    music[a:b] += (pad * env * .035).astype(np.float32)
    for j in range(8):
        fq = ch[j % 3] * (4 if j % 4 == 3 else 2); p = a + int(j * beat / 2 * SR); pl = tone(fq, .03, 6, .5); e = min(NS, p + len(pl))
        if p < NS: music[p:e] += pl[:e - p]
ker = np.ones(int(.35 * SR)) / int(.35 * SR); vm = np.convolve(vmask, ker, mode="same")
music *= (1 - .68 * np.clip(vm, 0, 1)).astype(np.float32)
ta = np.arange(NS) / SR; fade = np.minimum(1, ta / 1.0) * np.minimum(1, (TOTAL_S - ta) / 2.5)
mix = (voice + sfx * .7 + music * .5) * fade.astype(np.float32); mix /= np.abs(mix).max() + 1e-9
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
raw = os.path.join(ROOT, "out", "full_mix_en_raw.wav"); sf.write(raw, np.stack([mix, mix], 1) * .95, SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), os.path.join(ROOT, "public", "audio", "full_mix_en.wav")], check=True)
os.remove(raw)
print(json.dumps(dict(total=TOTAL_S, sped=[f for f in fits if f[1] > 1], late=[f for f in fits if f[2] > 0.05])))
