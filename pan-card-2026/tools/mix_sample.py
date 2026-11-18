"""Mix the 30-sec sample: picked voice takes + soft music (ducked) + very light click/whoosh, -14 LUFS, then 1.1x speed.
Usage: python mix_sample.py <scratchpad> <intro.mp4> <capture.mp4> <out.mp4>
"""
import json, subprocess, sys
import numpy as np, soundfile as sf

S, INTRO, CAP, OUT = sys.argv[1:5]
ROOT = __file__.rsplit("/tools/", 1)[0]
T = json.load(open(f"{S}/s30/timeline.json"))
SR = 48000
n = int(T["total"] * SR)
voice = np.zeros(n)
for i, (ln, k) in enumerate(zip(T["lines"], T["pick"])):
    a, sr = sf.read(f"{S}/s30/l{i:02d}_t{k}.wav", dtype="float32")
    a = np.interp(np.linspace(0, len(a) - 1, int(len(a) * SR / sr)), np.arange(len(a)), a)
    s = int(ln["start"] * SR)
    voice[s:s + len(a)] += a[: n - s]

sfx = np.zeros(n)
def put(sig, t):
    s = int(t * SR); e = min(n, s + len(sig)); sfx[s:e] += sig[: e - s]
tt = np.arange(int(0.06 * SR)) / SR
click = np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 120) * 0.25
L = T["lines"]
for t in (L[1]["start"] + 0.1, L[2]["start"] + 2.2, L[3]["start"] + 5.4, L[6]["start"] + 1.5, L[7]["start"] + 0.6,
          L[9]["start"] + 0.3, L[9]["start"] + 1.9, L[9]["start"] + 3.6, L[10]["start"] + 1.6):
    put(click, t)
rng = np.random.default_rng(3)
w = rng.standard_normal(int(0.5 * SR)); w = np.convolve(w, np.ones(40) / 40, mode="same") * np.sin(np.pi * np.linspace(0, 1, len(w))) ** 2 * 0.25
put(w, T["siteStart"] - 0.25)

sf.write(f"{ROOT}/build_audio/s_voice.wav", voice.astype(np.float32), SR)
sf.write(f"{ROOT}/build_audio/s_sfx.wav", sfx.astype(np.float32), SR)
dur = T["total"]
subprocess.run([
    "ffmpeg", "-v", "error", "-y",
    "-i", INTRO, "-i", CAP,
    "-i", f"{ROOT}/build_audio/s_voice.wav", "-i", f"{ROOT}/build_audio/music.wav", "-i", f"{ROOT}/build_audio/s_sfx.wav",
    "-filter_complex",
    # video: intro + capture, cut to total, fade out, then 1.1x
    f"[0:v]fps=30,format=yuv420p,setsar=1[v0];[1:v]fps=30,format=yuv420p,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0,trim=0:{dur},setpts=PTS-STARTPTS,"
    f"fade=t=out:st={dur - 0.6}:d=0.6,setpts=PTS/1.1[v];"
    # audio: steady medium music, sidechain-ducked under voice (slow release so it never pumps up in pauses)
    f"[2:a]aformat=channel_layouts=stereo,asplit=2[vo][key];"
    f"[3:a]atrim=0:{dur},asetpts=PTS-STARTPTS,volume=0.16[m];"
    f"[m][key]sidechaincompress=threshold=0.02:ratio=4:attack=30:release=1200[md];"
    f"[4:a]aformat=channel_layouts=stereo,volume=0.6[fx];"
    f"[vo][md][fx]amix=inputs=3:normalize=0,afade=t=out:st={dur - 0.8}:d=0.8,"
    f"loudnorm=I=-14:TP=-1.5:LRA=7,atempo=1.1[a]",
    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-r", "30",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", OUT,
], check=True)
print("ok")
