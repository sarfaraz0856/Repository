"""Offline Hindi/Hinglish narration with Kokoro TTS (kokoro-onnx, Hindi voice).
Each phrase is synthesized separately, silence-trimmed and placed on the 60 s timeline, which gives
exact phrase timings for the SRT subtitles and for syncing on-screen highlights.
Usage: python3 make_voiceover.py <model_dir> <narration_lines.json> <out_dir> [--voice hm_omega]
"""
import json, sys, argparse, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ap = argparse.ArgumentParser()
ap.add_argument("model_dir"); ap.add_argument("lines"); ap.add_argument("out_dir")
ap.add_argument("--voice"); ap.add_argument("--max_speed", type=float, default=1.28)
a = ap.parse_args()
cfg = json.load(open(a.lines)); voice = a.voice or cfg["voice"]
k = Kokoro(f"{a.model_dir}/kokoro-v1.0.onnx", f"{a.model_dir}/voices-v1.0.bin")
SR = 24000; TOTAL = 60.0; TAIL = 0.25

def trim(x, thr=0.012, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx): return x
    s = max(0, idx[0] - int(pad * SR)); e = min(len(x), idx[-1] + int(pad * SR))
    y = x[s:e].copy(); f = int(0.01 * SR)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

def gap_after(text):
    return 0.22 if text.rstrip()[-1:] in ".?!,।" and text.rstrip()[-1:] != "," else 0.14

def synth(phrases, speed):
    return [trim(k.create(dev, voice=voice, speed=speed, lang="hi")[0].astype(np.float32)) for _, dev in phrases]

track = np.zeros(int(TOTAL * SR), np.float32); timings = []; report = []
for s in cfg["scenes"]:
    budget = s["end"] - s["start"] - s["lead"] - TAIL
    gaps = sum(gap_after(p[0]) for p in s["phrases"][:-1])
    speed = 1.0
    for _ in range(3):
        clips = synth(s["phrases"], speed)
        speech = sum(len(c) for c in clips) / SR
        if speech + gaps <= budget + 1e-3 or speed >= a.max_speed: break
        speed = min(a.max_speed, speed * (speech / (budget - gaps)) * 1.02)
    t = s["start"] + s["lead"]
    for (lat, dev), c in zip(s["phrases"], clips):
        i = int(round(t * SR)); track[i:i + len(c)] += c[: len(track) - i]
        timings.append({"scene": s["id"], "start": round(t, 3), "end": round(t + len(c) / SR, 3), "text": lat})
        t += len(c) / SR + gap_after(lat)
    end = timings[-1]["end"]
    report.append({"scene": s["id"], "speed": round(speed, 3), "speech_end": round(end, 2), "window_end": s["end"], "fits": end <= s["end"] - 0.05})

peak = np.max(np.abs(track)); track = track / peak * 0.89
sf.write(f"{a.out_dir}/narration_{voice}.wav", track, SR, subtype="PCM_16")
json.dump({"voice": voice, "timings": timings, "scenes": report}, open(f"{a.out_dir}/narration_timings_{voice}.json", "w"), indent=1, ensure_ascii=False)
for r in report: print(r)
