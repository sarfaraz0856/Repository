"""Build the voiceover track, timeline.json and the English SRT from per-sentence voice clips.

Usage: python build_timeline.py <scratchpad_dir> [--estimate]
--estimate: no audio needed; uses character-count estimates (for previewing layouts).
"""
import json, os, subprocess, sys, wave

FPS = 30
LEAD = 18      # frames before the first sentence of a scene
GAP = 12       # frames between sentences
TAIL = 27      # frames after the last sentence of a scene
SR = 24000

S = sys.argv[1]
estimate = "--estimate" in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
script = json.load(open(f"{S}/tts/script.json"))


def dur_seconds(path, text):
    if estimate:
        return max(1.5, len(text) * 0.058)
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()


scenes, clips = [], []
t = 0  # frames
for sc in script:
    start = t
    beats, ends, en = [], [], []
    cur = LEAD
    for i, (hi, eng) in enumerate(sc["s"]):
        p = f"{S}/vo/s{sc['id']:02d}_{i:02d}.wav"
        d = dur_seconds(p, hi)
        df = int(round(d * FPS))
        beats.append(cur)
        ends.append(cur + df)
        en.append(eng)
        clips.append((p, (start + cur) / FPS))
        cur += df + GAP
    dur = cur - GAP + TAIL
    scenes.append({"id": sc["id"], "title": sc["title"], "from": start, "dur": dur,
                   "beats": beats, "ends": ends, "en": en})
    t += dur

total = t
json.dump({"fps": FPS, "total": total, "scenes": scenes},
          open(f"{ROOT}/src/timeline.json", "w"), indent=1, ensure_ascii=False)
print("total seconds", total / FPS)

# SRT
def ts(sec):
    ms = int(round(sec * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

out_dir = f"{ROOT}/output"
os.makedirs(out_dir, exist_ok=True)
n = 0
with open(f"{out_dir}/PAN_Card_English_Subtitles.srt", "w") as f:
    for sc in scenes:
        for b, e, txt in zip(sc["beats"], sc["ends"], sc["en"]):
            n += 1
            f.write(f"{n}\n{ts((sc['from'] + b) / FPS)} --> {ts((sc['from'] + e) / FPS)}\n{txt}\n\n")

if estimate:
    sys.exit(0)

# Voiceover track: place every clip at its exact start time (adelay), mix, normalise.
inputs, filt = [], []
for k, (p, st) in enumerate(clips):
    inputs += ["-i", p]
    ms = int(round(st * 1000))
    filt.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=mono,adelay={ms}:all=1[a{k}]")
mix = "".join(f"[a{k}]" for k in range(len(clips)))
filt.append(f"{mix}amix=inputs={len(clips)}:normalize=0,apad=whole_dur={total / FPS:.3f},"
            f"highpass=f=60,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,"
            f"loudnorm=I=-16:TP=-1.5:LRA=9[out]")
open(f"{S}/vo_filter.txt", "w").write(";\n".join(filt))
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex_script", f"{S}/vo_filter.txt",
                "-map", "[out]", "-ar", "48000", "-ac", "1", f"{out_dir}/PAN_Card_Cloned_Voiceover.wav"], check=True)
print("voiceover written")
