#!/usr/bin/env python3
"""Find the Kokoro voice style (blend + pitch shift) that sounds closest to a reference recording,
measured by cosine similarity of WeSpeaker speaker embeddings. Not a true clone: a best match.
Usage: KOKORO_DIR=... SPK_MODEL=... python match_voice.py ref.wav out_dir"""
import os, sys, json, subprocess, numpy as np, soundfile as sf, sherpa_onnx
from kokoro_onnx import Kokoro
ref, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
cfg = sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=os.environ["SPK_MODEL"], num_threads=4)
ext = sherpa_onnx.SpeakerEmbeddingExtractor(cfg)
def to16k(a, sr):
    p, q = os.path.join(out, "_a.wav"), os.path.join(out, "_b.wav"); sf.write(p, a, sr)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-ac", "1", "-ar", "16000", q], check=True)
    return sf.read(q, dtype="float32")[0]
def emb(a16):
    s = ext.create_stream(); s.accept_waveform(16000, a16); s.input_finished()
    e = np.array(ext.compute(s)); return e / np.linalg.norm(e)
r, rsr = sf.read(ref, dtype="float32"); r = r if r.ndim == 1 else r.mean(1)
E = emb(to16k(r, rsr))
kd = os.environ["KOKORO_DIR"]; k = Kokoro(os.path.join(kd, "kokoro-v1.0.int8.onnx"), os.path.join(kd, "voices-v1.0.bin"))
V = dict(np.load(os.path.join(kd, "voices-v1.0.bin")))
if os.environ.get("ONLY") == "male": V = {n: v for n, v in V.items() if len(n) > 1 and n[1] == "m"}
TXT = "नमस्ते दोस्तों, आज मैं आपको एक बहुत काम की बात बताने वाला हूँ। इसे ध्यान से सुनिए, क्योंकि ये आपके चैनल के लिए बहुत ज़रूरी है।"
def synth(style, shift=0.0):
    a, sr = k.create(TXT, voice=style, speed=1.0, lang="hi")
    if shift:  # pitch shift in semitones, duration kept
        f = 2 ** (shift / 12); p, q = os.path.join(out, "_p.wav"), os.path.join(out, "_q.wav"); sf.write(p, a, sr)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-af", f"asetrate={int(sr*f)},aresample={sr},atempo={1/f:.5f}", q], check=True)
        a, sr = sf.read(q, dtype="float32")
    return a, sr
def score(style, shift=0.0):
    a, sr = synth(style, shift); return float(np.dot(emb(to16k(a, sr)), E))
# 1) every built-in voice
base = {n: score(V[n]) for n in sorted(V)}
rank = sorted(base.items(), key=lambda x: -x[1]); print("top voices:", [(n, round(s, 3)) for n, s in rank[:8]], flush=True)
# 2) blend search over the top 6
top = [n for n, _ in rank[:6]]; rng = np.random.default_rng(0)
best_w = np.eye(6)[0]; best = rank[0][1]
for it in range(70):
    w = rng.dirichlet(np.ones(6) * 0.6) if it < 40 else np.clip(best_w + rng.normal(0, 0.12, 6), 0, None)
    w = w / w.sum(); st = sum(wi * V[n] for wi, n in zip(w, top)).astype(np.float32); s = score(st)
    if s > best: best, best_w = s, w; print(f"  blend {it}: {s:.3f}", flush=True)
style = sum(wi * V[n] for wi, n in zip(best_w, top)).astype(np.float32)
# 3) pitch
pbest, pshift = best, 0.0
for sh in [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 2]:
    s = score(style, sh)
    if s > pbest: pbest, pshift = s, float(sh)
print(f"pitch {pshift:+} st -> {pbest:.3f}", flush=True)
np.save(os.path.join(out, "my_voice_style.npy"), style)
a, sr = synth(style, pshift); sf.write(os.path.join(out, "match_preview.wav"), a, sr)
a0, sr0 = synth(V["hm_omega"]); sf.write(os.path.join(out, "old_voice_preview.wav"), a0, sr0)
json.dump({"top": rank[:8], "blend_voices": top, "weights": [round(x, 3) for x in best_w], "pitch_semitones": pshift,
           "similarity_best": round(pbest, 3), "similarity_hm_omega": round(base["hm_omega"], 3), "similarity_best_single": round(rank[0][1], 3)},
          open(os.path.join(out, "match.json"), "w"), indent=1, ensure_ascii=False)
print(open(os.path.join(out, "match.json")).read())
