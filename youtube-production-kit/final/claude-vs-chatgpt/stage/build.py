"""Build timeline.js, SRTs and the soundtrack for the Claude vs ChatGPT video from the voice clips."""
import json, hashlib, os, subprocess, sys
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.dirname(HERE)
exec(open(os.path.join(HERE, "lines.py"), encoding="utf-8").read())
SR = 48000; GAP, SCENE_GAP, LEAD = 0.45, 1.1, 0.8
SCENE = {"i3": "intro2"}

def clip(text):
    f = os.path.join(SP, "clone_out", hashlib.md5(text.encode()).hexdigest() + ".wav")
    if not os.path.exists(f): return None
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

lines, clips, t, prev = [], [], LEAD, None
for lid, scene, dev, en in L:
    scene = SCENE.get(lid, scene)
    if prev is not None: t += SCENE_GAP if scene != prev else GAP
    c = clip(dev); d = len(c) / SR if c is not None else len(dev) / 14.0
    lines.append(dict(id=lid, scene=scene, start=round(t, 3), end=round(t + d, 3), dev=dev, en=en)); clips.append(c)
    t += d; prev = scene
D = round(t + 2.5, 2)
scenes = {}
for l in lines: scenes.setdefault(l["scene"], [l["start"] - 0.35, None])
names = list(scenes)
for k, n in enumerate(names): scenes[n][1] = scenes[names[k + 1]][0] if k + 1 < len(names) else D + 5
scenes[names[0]][0] = -1
open(os.path.join(HERE, "timeline.js"), "w", encoding="utf-8").write("window.TL=" + json.dumps(dict(duration=D, lines=lines, scenes=scenes), ensure_ascii=False) + ";")

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
for key, name in (("dev", "hindi"), ("en", "english")):
    with open(os.path.join(HERE, f"{name}.srt"), "w", encoding="utf-8") as f:
        for k, l in enumerate(lines, 1): f.write(f"{k}\n{ts(l['start'])} --> {ts(l['end'])}\n{l[key]}\n\n")
chap = [("intro", "Introduction"), ("basics", "Claude vs ChatGPT: Basic Intro"), ("price", "Round 1: Price & Plans"), ("writing", "Round 2: Writing"),
        ("coding", "Round 3: Coding"), ("docs", "Round 4: Long Documents"), ("images", "Round 5: Images"), ("features", "Round 6: Extra Features"),
        ("score", "Final Scorecard"), ("verdict", "Which One Should You Choose?"), ("tip", "My Tip & Safety"), ("outro", "Outro")]
with open(os.path.join(HERE, "chapters.txt"), "w") as f:
    for sc, title in chap:
        st = 0 if sc == "intro" else int(scenes[sc][0] + 0.35)
        f.write(f"{st // 60}:{st % 60:02d} {title}\n")
missing = [l["id"] for l, c in zip(lines, clips) if c is None]
print(json.dumps(dict(duration=D, mmss=f"{int(D // 60)}:{int(D % 60):02d}", missing=missing)))
if missing or "--no-audio" in sys.argv: sys.exit(0)

# ---------- audio: voice + soft pops on reveals + gentle music bed, ducked; -14 LUFS ----------
N = int(D * SR); voice = np.zeros(N, np.float32); vmask = np.zeros(N, np.float32)
for l, c in zip(lines, clips):
    s = int(l["start"] * SR); e = min(N, s + len(c)); voice[s:e] += c[:e - s]; vmask[s:e] = 1
voice /= np.abs(voice).max() + 1e-9
def tone(f, amp, dec, ln, f2=None):
    tt = np.arange(int(ln * SR)) / SR; fr = f if f2 is None else f + (f2 - f) * tt / ln
    return (amp * np.sin(2 * np.pi * np.cumsum(np.full_like(tt, 1.0) * fr) / SR) * np.exp(-dec * tt)).astype(np.float32)
rng = np.random.default_rng(5)
def noise(ln, lo, hi, amp):
    n = int(ln * SR); x = rng.standard_normal(n); X = np.fft.rfft(x); fq = np.fft.rfftfreq(n, 1 / SR)
    X[(fq < lo) | (fq > hi)] = 0; y = np.fft.irfft(X, n); env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return (y / (np.abs(y).max() + 1e-9) * env * amp).astype(np.float32)
sfx = np.zeros(N, np.float32)
def put(sig, at, g=1.0):
    s = int(at * SR); e = min(N, s + len(sig))
    if 0 <= s < N: sfx[s:e] += g * sig[:e - s]
whoosh = noise(.5, 300, 4000, .16); pop = tone(660, .10, 30, .12, 990)
chime = np.zeros(int(1.4 * SR), np.float32)
for i, f in enumerate([784, 988, 1175, 1568]):
    c = tone(f, .12, 5, .9); s = int(i * .11 * SR); chime[s:s + len(c)] += c
for n in names[1:]: put(whoosh, scenes[n][0] + 0.1)
for l in lines: put(pop, l["start"] - 0.05, .8)
WIN = {"w3": 3.5, "c3": 4, "d3": 1.5, "m1": 1.5, "f3": 2}
for l in lines:
    if l["id"] in WIN: put(chime, l["start"] + WIN[l["id"]], .9)
beat = 60 / 96; bar = 4 * beat
prog = [[130.81, 164.81, 196.0], [110.0, 130.81, 164.81], [87.31, 110.0, 130.81], [98.0, 123.47, 146.83]]
music = np.zeros(N, np.float32)
for ci in range(int(D / bar) + 1):
    s = int(ci * bar * SR)
    if s >= N: break
    ch = prog[ci % 4]; e = min(N, s + int(bar * SR)); tt = np.arange(e - s) / SR
    env = np.minimum(1, tt / .5) * np.minimum(1, (bar - tt) / .6)
    pad = sum(np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 1.003 * tt) + .2 * np.sin(2 * np.pi * 2 * f * tt) for f in ch)
    music[s:e] += (pad * env * .04).astype(np.float32)
    for j in range(8):
        f = ch[j % 3] * (4 if j % 4 == 3 else 2); ps = s + int(j * beat / 2 * SR); pl = tone(f, .04, 6, .5); pe = min(N, ps + len(pl))
        if ps < N: music[ps:pe] += pl[:pe - ps]
ker = np.ones(int(.3 * SR)) / int(.3 * SR); vm = np.convolve(vmask, ker, mode="same")
music *= (1 - .7 * np.clip(vm, 0, 1)).astype(np.float32)
ta_ = np.arange(N) / SR; music *= (np.minimum(1, ta_ / 1.5) * np.minimum(1, (D - ta_) / 2.0)).astype(np.float32)
mix = voice + sfx * .8 + music * .5; mix = mix / (np.abs(mix).max() + 1e-9) * .95
raw = os.path.join(HERE, "mix_raw.wav"); sf.write(raw, np.stack([mix, mix], 1), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), os.path.join(HERE, "mix.wav")], check=True)
print("audio ok")
