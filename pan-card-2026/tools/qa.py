# Flag clips that look truncated: too many chars/sec, or Whisper transcript much shorter than the script line.
import json, os, sys, wave
import numpy as np, soundfile as sf
from faster_whisper import WhisperModel

S = sys.argv[1]
only = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None
d = json.load(open(f"{S}/tts/script.json"))
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
bad = []
for sc in d:
    for i, (t, _e) in enumerate(sc["s"]):
        name = f"s{sc['id']:02d}_{i:02d}"
        if only and name not in only:
            continue
        a, sr = sf.read(f"{S}/vo/{name}.wav", dtype="float32")
        dur = len(a) / sr
        cps = len(t) / dur
        n = int(len(a) * 16000 / sr)
        a16 = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)
        seg, _ = m.transcribe(a16, language="hi", beam_size=1)
        tr = " ".join(s.text for s in seg).strip()
        words_src = len(t.split())
        words_tr = len(tr.split())
        cov = words_tr / words_src
        flag = cps > 16.8 or cov < 0.72
        print(f"{name} cps={cps:.1f} cov={cov:.2f} {'BAD' if flag else ''} | {tr}", flush=True)
        if flag:
            bad.append(name)
open(f"{S}/redo.txt", "w").write("\n".join(bad))
print("BAD:", " ".join(bad))
