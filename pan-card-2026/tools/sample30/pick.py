# Whisper-check both takes and pick the cleanest (highest word coverage, sane speed, no long silences).
import json, sys, difflib, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
S = sys.argv[1]
lines = json.load(open(f"{S}/s30/lines.json"))
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
pick = []
for i, (hi, _h, _e) in enumerate(lines):
    best = None
    for k in (0, 1):
        f = f"{S}/s30/l{i:02d}_t{k}.wav"
        a, sr = sf.read(f, dtype="float32")
        n = int(len(a) * 16000 / sr)
        a16 = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)
        seg, _ = m.transcribe(a16, language="hi", beam_size=5)
        tr = " ".join(s.text for s in seg).strip()
        sim = difflib.SequenceMatcher(None, hi.replace("।", "").replace("?", ""), tr).ratio()
        cps = len(hi) / (len(a) / sr)
        score = sim - (0.3 if cps > 17 or cps < 8 else 0)
        print(f"l{i:02d} t{k} sim={sim:.2f} cps={cps:.1f} | {tr}")
        if best is None or score > best[0]:
            best = (score, k)
    pick.append(best[1])
json.dump(pick, open(f"{S}/s30/pick.json", "w"))
print("pick", pick)
