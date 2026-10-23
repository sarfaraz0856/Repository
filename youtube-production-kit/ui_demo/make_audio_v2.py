#!/usr/bin/env python3
"""Full soundtrack for the 60s UI sample: Hindi voice-over (Kokoro TTS, hm_omega),
SFX (whooshes, pops, taps, typing, chime) and a soft synthesized music bed that
ducks under the voice. Run with a Python that has kokoro-onnx + soundfile.
Env: KOKORO_DIR = folder with kokoro-v1.0.int8.onnx and voices-v1.0.bin"""
import os, subprocess, json
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "..", "video_build", "ui_audio"); os.makedirs(BUILD, exist_ok=True)
SR, DUR = 48000, 60.0
N = int(SR * DUR)
VOICE = os.environ.get("VOICE", "hm_omega")

# (start, latest end, text) — windows match the on-screen steps in ui_sample.html
LINES = [
 (0.7, 5.1,  "आज हम सिर्फ़ मोबाइल फ़ोन से, यूट्यूब चैनल बनाना सीखेंगे।"),
 (5.3, 12.3, "सबसे पहले अपने फ़ोन में यूट्यूब ऐप खोलिए। होम स्क्रीन पर, यूट्यूब आइकन पर टैप कीजिए।"),
 (12.7, 21.3,"ऐप खुलने के बाद, नीचे राइट कोने में, 'यू' पर टैप कीजिए। यहाँ आपकी प्रोफ़ाइल फ़ोटो दिखती है।"),
 (21.6, 28.5,"यहाँ आपके नाम के नीचे, 'क्रिएट चैनल' का ऑप्शन है। उस पर टैप कीजिए।"),
 (28.8, 36.1,"अब अपने चैनल का नाम लिखिए। जैसे, स्मार्ट लर्निंग हिंदी।"),
 (36.4, 43.0,"फिर एक यूनिक हैंडल चुनिए। अगर 'अवेलेबल' लिखा आए, तो यह हैंडल आपका हो सकता है।"),
 (43.2, 48.6,"सब सही है? तो 'क्रिएट चैनल' पर टैप कीजिए।"),
 (48.9, 55.9,"बधाई हो! आपका यूट्यूब चैनल बन गया है। अब प्रोफ़ाइल फ़ोटो और बैनर लगाइए।"),
 (56.1, 59.3,"पूरी वीडियो ज़रूर देखिए!"),
]

def resample(a, sr_in):
    raw = os.path.join(BUILD, "_tmp_in.wav"); out = os.path.join(BUILD, "_tmp_out.wav")
    sf.write(raw, a, sr_in)
    subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-ar",str(SR),"-ac","1",out], check=True)
    b, _ = sf.read(out, dtype="float32"); return b

# ---------- voice ----------
k = Kokoro(os.path.join(os.environ["KOKORO_DIR"], "kokoro-v1.0.int8.onnx"),
           os.path.join(os.environ["KOKORO_DIR"], "voices-v1.0.bin"))
voice = np.zeros(N, np.float32); vmask = np.zeros(N, np.float32); report = []
for (a, b, text) in LINES:
    avail, speed = b - a, 1.0
    for _ in range(4):
        aud, sr = k.create(text, voice=VOICE, speed=speed, lang="hi")
        d = len(aud) / sr
        if d <= avail or speed >= 1.3: break
        speed = min(1.3, speed * d / avail * 1.03)
    clip = resample(aud, sr)
    clip = clip / (np.abs(clip).max() + 1e-9) * 0.89
    s = int(a * SR); e = min(N, s + len(clip))
    voice[s:e] += clip[:e - s]; vmask[s:e] = 1.0
    report.append({"start": a, "dur": round(len(clip) / SR, 2), "window": round(avail, 2), "speed": round(speed, 2)})

# ---------- sfx ----------
sfx = np.zeros(N, np.float32); rng = np.random.default_rng(3)
def add(sig, t, gain=1.0):
    s = int(t * SR); e = min(N, s + len(sig)); sfx[s:e] += gain * sig[:e - s]
def tone(f, amp, decay, length, f2=None):
    tt = np.arange(int(length * SR)) / SR
    fr = f if f2 is None else f + (f2 - f) * tt / length
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return (amp * np.sin(ph) * np.exp(-decay * tt)).astype(np.float32)
def whoosh(length=0.55, lo=300, hi=4000, amp=0.22):
    n = int(length * SR); x = rng.standard_normal(n)
    X = np.fft.rfft(x); fq = np.fft.rfftfreq(n, 1 / SR)
    X[(fq < lo) | (fq > hi)] = 0; y = np.fft.irfft(X, n)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    y = y / (np.abs(y).max() + 1e-9) * env * amp; return y.astype(np.float32)
W, Wsoft = whoosh(), whoosh(0.45, 600, 6000, 0.12)
for t in [10.2, 12.2, 21.2, 28.4, 48.4]: add(W, t)                       # screen changes
for t in [7.0, 16.5, 24.0, 29.6, 36.3, 43.2, 50.2]: add(Wsoft, t)        # zoom-ins
for t in [5.0, 12.4, 21.4, 28.6, 36.2, 43.0, 48.6, 56.0]: add(tone(660, .14, 30, .12, 990), t)  # step pops
for t in [9.0, 20.0, 27.0, 30.6, 36.6, 46.0]:                              # taps
    add(tone(1900, .30, 70, .09), t); add(tone(950, .18, 50, .09), t)
def ticks(a, b, n):
    for i in range(1, n + 1): add(tone(3400, .09, 140, .04), a + i * (b - a) / n)
ticks(31.2, 34.8, len("Smart Learning Hindi")); ticks(37.4, 40.2, len("@SmartLearningHindi"))
add(tone(1320, .10, 12, .25), 40.6)                                        # available ping
for i, f in enumerate([784, 988, 1175, 1568]): add(tone(f, .15, 5, .9), 48.8 + i * .11)  # success chime
add(whoosh(1.2, 200, 3000, .18), 0.2)                                      # intro swell

# ---------- music bed (C - G - Am - F, 96 BPM) ----------
beat = 60 / 96; bar = 4 * beat
chords = [[130.81,164.81,196.0],[98.0,123.47,146.83],[110.0,130.81,164.81],[87.31,110.0,130.81]]
music = np.zeros(N, np.float32); t_all = np.arange(N) / SR
for ci in range(int(DUR / bar) + 1):
    ch = chords[ci % 4]; s = int(ci * bar * SR); n = int(bar * SR); e = min(N, s + n)
    if s >= N: break
    tt = np.arange(e - s) / SR
    env = np.minimum(1, tt / .4) * np.minimum(1, (bar - tt) / .5)
    pad = sum(np.sin(2*np.pi*f*tt) + .5*np.sin(2*np.pi*f*1.003*tt) + .25*np.sin(2*np.pi*2*f*tt) for f in ch)
    music[s:e] += (pad * env * .045).astype(np.float32)
    for j in range(8):                                                     # gentle plucked arpeggio
        f = ch[j % 3] * (4 if j % 4 == 3 else 2); ps = s + int(j * beat / 2 * SR)
        pl = tone(f, .05, 6, .5); pe = min(N, ps + len(pl)); music[ps:pe] += pl[:pe - ps]
# ducking: smooth voice mask -> music gain 1.0 (no voice) .. 0.35 (voice)
k_len = int(.25 * SR); ker = np.ones(k_len) / k_len
vm = np.convolve(vmask, ker, mode="same")
music *= (1 - .65 * np.clip(vm, 0, 1)).astype(np.float32)
fade = np.minimum(1, t_all / 1.0) * np.minimum(1, (DUR - t_all) / 1.5)
music *= fade.astype(np.float32)

mix = voice * 1.0 + sfx * 0.9 + music * 0.55
mix = mix / (np.abs(mix).max() + 1e-9) * 0.95
raw = os.path.join(BUILD, "ui_mix_raw.wav"); sf.write(raw, np.stack([mix, mix], 1), SR)
final = os.path.join(BUILD, "ui_mix.wav")
subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-af","loudnorm=I=-14:TP=-1.5:LRA=11","-ar",str(SR),final], check=True)
for name, sig in [("voice_only.wav", voice), ("music_only.wav", music), ("sfx_only.wav", sfx)]:
    sf.write(os.path.join(BUILD, name), sig, SR)
print(json.dumps(report, ensure_ascii=False)); print("audio ->", final)
