"""Sequential narration for the full-length video (v3+), offline Kokoro TTS (Hindi voice).
Scenes follow one another: scene start = previous scene end + scene["pre"]. Each phrase is
[id, hinglish_subtitle, devanagari_tts_text, english_caption]; an empty TTS text is a silent hold (PAUSE s).
Writes narration<tag>_<voice>.wav and narration_timings<tag>_<voice>.json (phrase + scene times, total).
Usage: python3 make_voiceover_seq.py <model_dir> <lines.json> <out_dir> --tag _v3
"""
import json, argparse, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ap = argparse.ArgumentParser()
ap.add_argument("model_dir"); ap.add_argument("lines"); ap.add_argument("out_dir"); ap.add_argument("--tag", default="")
a = ap.parse_args()
cfg = json.load(open(a.lines)); voice = cfg["voice"]; speed = cfg.get("speed", 1.0)
k = Kokoro(f"{a.model_dir}/kokoro-v1.0.onnx", f"{a.model_dir}/voices-v1.0.bin")
SR = 24000; PAUSE = 1.6

def trim(x, thr=0.012, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx): return x
    s = max(0, idx[0] - int(pad * SR)); e = min(len(x), idx[-1] + int(pad * SR))
    y = x[s:e].copy(); f = int(0.01 * SR)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

def gap_after(text):
    return 0.34 if text.rstrip()[-1:] in ".?!:" else 0.16

clips, timings, scenes = [], [], []
t = 0.0
for s in cfg["scenes"]:
    t += s.get("pre", 0.6); s0 = t
    for pid, lat, dev, en in s["phrases"]:
        if not dev:
            timings.append({"id": pid, "scene": s["id"], "start": round(t, 3), "end": round(t + PAUSE, 3), "text": "", "en": "", "pause": True})
            t += PAUSE; continue
        c = trim(k.create(dev, voice=voice, speed=speed, lang="hi")[0].astype(np.float32))
        clips.append((t, c))
        timings.append({"id": pid, "scene": s["id"], "start": round(t, 3), "end": round(t + len(c) / SR, 3), "text": lat, "en": en})
        t += len(c) / SR + gap_after(lat)
    t += s.get("post", 0.4)
    scenes.append({"id": s["id"], "start": round(s0, 3), "end": round(t, 3)})
total = round(np.ceil(t * 30) / 30, 3)
track = np.zeros(int(total * SR) + SR, np.float32)
for st, c in clips:
    i = int(round(st * SR)); track[i:i + len(c)] += c
track = track[: int(total * SR)]; track = track / np.max(np.abs(track)) * 0.89
sf.write(f"{a.out_dir}/narration{a.tag}_{voice}.wav", track, SR, subtype="PCM_16")
json.dump({"voice": voice, "speed": speed, "total": total, "scenes": scenes, "timings": timings},
          open(f"{a.out_dir}/narration_timings{a.tag}_{voice}.json", "w"), indent=1, ensure_ascii=False)
print("total", total, "s;", len([x for x in timings if not x.get("pause")]), "phrases")
for sc in scenes: print(f"  {sc['id']:<11} {sc['start']:7.2f} → {sc['end']:7.2f}")
