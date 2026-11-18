"""Generate soft background music + sound effects (original, synthesized) and mix the final soundtrack.

Usage: python make_audio.py
Reads output/PAN_Card_Cloned_Voiceover.wav and src/timeline.json, writes build_audio/final_mix.wav
"""
import json, os, subprocess
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
tl = json.load(open(f"{ROOT}/src/timeline.json"))
total = tl["total"] / tl["fps"]
os.makedirs(f"{ROOT}/build_audio", exist_ok=True)
rng = np.random.default_rng(7)


def note(m):  # midi -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, r):
    e = np.ones(n)
    a, r = int(a * SR), int(r * SR)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    return e


# ---------- music: gentle I–vi–IV–V pad + soft plucked arpeggio, 84 BPM ----------
bpm = 84
beat = 60 / bpm
bar = beat * 4
chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]  # C Am F G
n_total = int((total + 2) * SR)
music = np.zeros((n_total, 2))
t_bar = np.arange(int(bar * SR)) / SR
nbars = int(np.ceil((total + 2) / bar))
for k in range(nbars):
    ch = chords[k % 4]
    s = int(k * bar * SR)
    seg = np.zeros(len(t_bar))
    for m in ch + [ch[0] - 12]:
        f = note(m)
        seg += 0.16 * (np.sin(2 * np.pi * f * t_bar) + 0.25 * np.sin(2 * np.pi * 2 * f * t_bar + 0.3))
    seg *= env(len(t_bar), 0.6, 0.6)
    e = min(n_total, s + len(seg))
    music[s:e, 0] += seg[: e - s]
    music[s:e, 1] += seg[: e - s]
    # arpeggio (8th notes), panned slightly
    arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12] * 2
    for j, m in enumerate(arp):
        st = s + int(j * beat / 2 * SR)
        L = int(0.9 * SR)
        tt = np.arange(L) / SR
        f = note(m)
        pl = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 3 * f * tt)) * np.exp(-tt * 5.5) * 0.09
        e2 = min(n_total, st + L)
        if e2 <= st:
            continue
        pan = 0.35 if j % 2 else -0.35
        music[st:e2, 0] += pl[: e2 - st] * (1 - pan)
        music[st:e2, 1] += pl[: e2 - st] * (1 + pan)
# soft low-pass smoothing
kernel = np.ones(6) / 6
for c in range(2):
    music[:, c] = np.convolve(music[:, c], kernel, mode="same")
music = music[: int(total * SR)]
fade = int(3 * SR)
music[:fade] *= np.linspace(0, 1, fade)[:, None]
music[-fade:] *= np.linspace(1, 0, fade)[:, None]
music /= np.max(np.abs(music)) + 1e-9
sf.write(f"{ROOT}/build_audio/music.wav", (music * 0.8).astype(np.float32), SR)

# ---------- sfx ----------
sfx = np.zeros((int(total * SR), 2))


def add(sig, at):
    s = int(at * SR)
    e = min(len(sfx), s + len(sig))
    if s >= len(sfx):
        return
    sfx[s:e, 0] += sig[: e - s]
    sfx[s:e, 1] += sig[: e - s]


def whoosh(d=0.55):
    n = int(d * SR)
    noise = rng.standard_normal(n)
    # sweep a simple one-pole low-pass cutoff up then down
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        x = i / n
        a = 0.02 + 0.25 * np.sin(np.pi * x) ** 2
        y += a * (noise[i] - y)
        out[i] = y
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * 0.9


def pop(f=880, d=0.18):
    tt = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * f * tt * (1 + 0.6 * np.exp(-tt * 40))) * np.exp(-tt * 26) * 0.5


def chime():
    tt = np.arange(int(1.6 * SR)) / SR
    return sum(np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 3) for m in (76, 79, 84)) * 0.18


W = whoosh()
for sc in tl["scenes"]:
    st = sc["from"] / tl["fps"]
    if sc["id"] > 1:
        add(W, max(0, st - 0.25))
    add(pop(1046 if sc["id"] % 2 else 880), st + 0.35)  # step badge appears
add(chime(), 0.2)
last = tl["scenes"][-1]
add(chime(), (last["from"] + last["beats"][-1]) / tl["fps"])
sf.write(f"{ROOT}/build_audio/sfx.wav", (sfx * 0.9).astype(np.float32), SR)

# ---------- mix: voice prominent, music ducked under voice, sfx subtle ----------
vo = f"{ROOT}/output/PAN_Card_Cloned_Voiceover.wav"
subprocess.run([
    "ffmpeg", "-v", "error", "-y",
    "-i", vo, "-i", f"{ROOT}/build_audio/music.wav", "-i", f"{ROOT}/build_audio/sfx.wav",
    "-filter_complex",
    "[0:a]aformat=channel_layouts=stereo,asplit=2[v][vk];"
    "[1:a]volume=0.20[m];"
    "[m][vk]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];"
    "[2:a]volume=0.35[s];"
    "[v][md][s]amix=inputs=3:normalize=0,alimiter=limit=0.89[out]",
    "-map", "[out]", "-ar", "48000", f"{ROOT}/build_audio/final_mix.wav",
], check=True)
print("mix done")
