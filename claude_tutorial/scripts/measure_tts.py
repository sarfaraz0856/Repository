"""Synthesize each narration phrase once at speed 1.0 and report durations (used to fit lines into scene windows)."""
import json, sys, numpy as np
from kokoro_onnx import Kokoro
M = sys.argv[1]  # dir with kokoro-v1.0.onnx + voices-v1.0.bin
cfg = json.load(open(sys.argv[2]))
k = Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
for s in cfg["scenes"]:
    tot = 0
    for lat, dev in s["phrases"]:
        a, sr = k.create(dev, voice=cfg["voice"], speed=1.0, lang="hi")
        tot += len(a) / sr
    print(s["id"], "window", s["end"] - s["start"], "speech@1.0", round(tot, 2))
