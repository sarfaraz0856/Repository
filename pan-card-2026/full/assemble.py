"""Assemble the full video: concat segments, mix voice + ducked music + light clicks/whoosh, -14 LUFS, 1.1x speed.
Also writes Hindi / Hinglish / English SRT files (timed for the 1.1x output).
Usage: python assemble.py <timeline.json> <voice_dir> <seg_dir> <music.wav> <out_dir> <basename>
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

TLF, VOICE, SEGD, MUSIC, OUTD, BASE = sys.argv[1:7]
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(TLF))
script = json.load(open(f"{HERE}/script.json"))
SPEED = 1.1
SR = 48000
total = TL["total"]
n = int(total * SR) + SR
os.makedirs(OUTD, exist_ok=True)
CARDS = {"A", "F", "F2", "I"}


def load(p):
    a, sr = sf.read(p, dtype="float32")
    if a.ndim > 1:
        a = a.mean(1)
    if sr != SR:
        a = np.interp(np.linspace(0, len(a) - 1, int(len(a) * SR / sr)), np.arange(len(a)), a).astype(np.float32)
    return a


voice = np.zeros(n, np.float32)
fx = np.zeros(n, np.float32)
tt = np.arange(int(0.05 * SR)) / SR
click = (np.sin(2 * np.pi * 2300 * tt) * np.exp(-tt * 130) * 0.18).astype(np.float32)
rng = np.random.default_rng(5)
wh = rng.standard_normal(int(0.45 * SR))
wh = (np.convolve(wh, np.ones(60) / 60, mode="same") * np.sin(np.pi * np.linspace(0, 1, len(wh))) ** 2 * 0.16).astype(np.float32)


def put(buf, sig, t):
    s = int(t * SR)
    e = min(len(buf), s + len(sig))
    if s < e:
        buf[s:e] += sig[: e - s]


for name in TL["order"]:
    sg = TL["segments"][name]
    off = sg["offset"]
    for ln in sg["lines"]:
        put(voice, load(f"{VOICE}/line_{ln['idx'] + 1:03d}.wav"), off + ln["start"])
    if name != "A":
        put(fx, wh, max(0, off - 0.2))
    cj = f"{SEGD}/{name}.mp4.clicks.json"
    if os.path.exists(cj):
        for c in json.load(open(cj)):
            put(fx, click, off + c)

sf.write(f"{SEGD}/voice_full.wav", voice, SR)
sf.write(f"{SEGD}/fx_full.wav", fx, SR)

# concat video segments with the concat FILTER (each trimmed to its exact timeline length -> stays in sync)
out = f"{OUTD}/{BASE}.mp4"
vin, vf = [], []
for k, name in enumerate(TL["order"]):
    vin += ["-i", f"{SEGD}/{name}.mp4"]
    d = TL["segments"][name]["dur"]
    vf.append(f"[{k}:v]fps=30,format=yuv420p,setsar=1,tpad=stop_mode=clone:stop_duration=1,trim=0:{d},setpts=PTS-STARTPTS[s{k}]")
nv = len(TL["order"])
vf.append("".join(f"[s{k}]" for k in range(nv)) + f"concat=n={nv}:v=1:a=0,fade=t=out:st={total - 0.7}:d=0.7,setpts=PTS/{SPEED}[v]")
subprocess.run([
    "ffmpeg", "-v", "error", "-y", *vin,
    "-i", f"{SEGD}/voice_full.wav", "-i", MUSIC, "-i", f"{SEGD}/fx_full.wav",
    "-filter_complex",
    ";".join(vf) + ";"
    f"[{nv}:a]aformat=channel_layouts=stereo,atrim=0:{total},asplit=2[vo][key];"
    f"[{nv + 1}:a]aformat=channel_layouts=stereo,atrim=0:{total},asetpts=PTS-STARTPTS,volume=0.15[m];"
    f"[m][key]sidechaincompress=threshold=0.02:ratio=4:attack=30:release=1200[md];"
    f"[{nv + 2}:a]aformat=channel_layouts=stereo,atrim=0:{total},volume=0.8[fx];"
    f"[vo][md][fx]amix=inputs=3:normalize=0,afade=t=out:st={total - 1.0}:d=1.0,"
    f"loudnorm=I=-14:TP=-1.5:LRA=7,atempo={SPEED}[a]",
    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out,
], check=True)


def ts(sec):
    ms = int(round(sec * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


for col, suffix in ((1, "hindi"), (2, "hinglish"), (3, "english")):
    with open(f"{OUTD}/{BASE}-{suffix}.srt", "w", encoding="utf-8") as fh:
        k = 0
        for name in TL["order"]:
            sg = TL["segments"][name]
            for ln in sg["lines"]:
                k += 1
                a = (sg["offset"] + ln["start"]) / SPEED
                z = (sg["offset"] + ln["end"]) / SPEED
                fh.write(f"{k}\n{ts(a)} --> {ts(z)}\n{script[ln['idx']][col]}\n\n")
print("written", out)
