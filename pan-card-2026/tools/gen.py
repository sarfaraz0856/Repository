# Generate the user's cloned voiceover (user confirmed the reference voice and channel are their own).
import sys, os, json, torch
import numpy as np, soundfile as sf
from TTS.api import TTS
torch.set_num_threads(4)
S = sys.argv[1]
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10**9
# Optional: file with clip names (e.g. s04_01) to regenerate in smaller chunks
REDO = set(open(sys.argv[3]).read().split()) if len(sys.argv) > 3 else set()
script = json.load(open(f"{S}/tts/script.json"))
os.makedirs(f"{S}/vo", exist_ok=True)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
refs = [f"{S}/ref/ref_{x}.wav" for x in "abc"]
n = 0
for sc in script:
    for i, (t, _en) in enumerate(sc["s"]):
        if n >= limit:
            sys.exit(0)
        n += 1
        out = f"{S}/vo/s{sc['id']:02d}_{i:02d}.wav"
        if os.path.exists(out):
            continue
        # XTTS Hindi limit is ~150 chars: split long lines at commas into balanced chunks
        chunks = [t]
        if out.split("/")[-1][:-4] in REDO:
            # regenerate in comma-separated pieces (merging very short ones) to avoid early stops
            pieces = [p.strip() for p in t.replace("।", "।,").split(",") if p.strip()]
            chunks = []
            for p in pieces:
                if chunks and (len(chunks[-1]) < 30 or len(p) < 20):
                    chunks[-1] = chunks[-1] + ", " + p
                else:
                    chunks.append(p)
            chunks = [c.replace("।,", "।") for c in chunks]
        elif len(t) > 140:
            parts = [p.strip() for p in t.split(",")]
            best = None
            for k in range(1, len(parts)):
                a, b = ", ".join(parts[:k]) + ",", ", ".join(parts[k:])
                m = max(len(a), len(b))
                if best is None or m < best[0]:
                    best = (m, [a, b])
            chunks = best[1]
        audio = []
        for j, c in enumerate(chunks):
            wav = tts.tts(text=c, language="hi", speaker_wav=refs, split_sentences=True,
                          temperature=0.65, speed=1.0)
            audio.extend(list(wav))
            if j < len(chunks) - 1:
                audio.extend([0.0] * int(24000 * 0.22))
        sf.write(out + ".tmp.wav", np.array(audio, dtype=np.float32), 24000)
        os.replace(out + ".tmp.wav", out)
        print("done", out, flush=True)
