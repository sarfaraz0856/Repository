#!/usr/bin/env python3
"""Tone-match a synthetic voice to a reference recording: build a smoothed EQ curve from the ratio of
their long-term average spectra (voiced frames only), apply it as an FIR filter, and report the speaker
similarity before and after. Usage: SPK_MODEL=... python eq_match.py ref.wav tts.wav out_dir"""
import os, sys, json, subprocess, numpy as np, soundfile as sf, sherpa_onnx
ref, tts, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True); SR = 24000
def load(p):
    q = os.path.join(out, "_l.wav"); subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-ac", "1", "-ar", str(SR), q], check=True)
    return sf.read(q, dtype="float32")[0]
def ltas(a, n=2048):
    hop = n // 4; w = np.hanning(n); frames = [a[i:i + n] for i in range(0, len(a) - n, hop)]
    rms = np.array([np.sqrt((f ** 2).mean()) for f in frames]); keep = rms > np.percentile(rms, 40)
    S = np.array([np.abs(np.fft.rfft(f * w)) ** 2 for f, k in zip(frames, keep) if k]); return S.mean(0)
r, t = load(ref), load(tts); fq = np.fft.rfftfreq(2048, 1 / SR)
ratio_db = 10 * np.log10((ltas(r) + 1e-12) / (ltas(t) + 1e-12))
# smooth in 1/3-octave bands, normalise at 1 kHz, clamp, flat outside 80 Hz–10 kHz
sm = np.zeros_like(ratio_db)
for i, f in enumerate(fq):
    lo, hi = f / 2 ** (1 / 6), f * 2 ** (1 / 6); m = (fq >= lo) & (fq <= hi); sm[i] = ratio_db[m].mean() if m.any() else 0
sm -= np.interp(1000, fq, sm); sm = np.clip(sm, -10, 10); sm[(fq < 80) | (fq > 10000)] = 0
H = 10 ** (sm / 20); h = np.fft.irfft(H); h = np.roll(h, len(h) // 2) * np.hanning(len(h))
def eq(a): y = np.convolve(a, h, mode="same"); return (y / (np.abs(y).max() + 1e-9) * 0.9).astype(np.float32)
cfg = sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=os.environ["SPK_MODEL"], num_threads=4); ext = sherpa_onnx.SpeakerEmbeddingExtractor(cfg)
def emb(a):
    p, q = os.path.join(out, "_e.wav"), os.path.join(out, "_f.wav"); sf.write(p, a, SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-ar", "16000", q], check=True)
    s = ext.create_stream(); s.accept_waveform(16000, sf.read(q, dtype="float32")[0]); s.input_finished()
    e = np.array(ext.compute(s)); return e / np.linalg.norm(e)
E = emb(r); before = float(emb(t) @ E); te = eq(t); after = float(emb(te) @ E)
np.save(os.path.join(out, "eq_fir.npy"), h.astype(np.float32)); sf.write(os.path.join(out, "tts_eq.wav"), te, SR)
bands = {f"{int(f)}Hz": round(float(np.interp(f, fq, sm)), 1) for f in [100, 200, 400, 1000, 2000, 4000, 8000]}
print(json.dumps({"similarity_before": round(before, 3), "similarity_after": round(after, 3), "eq_db": bands}))
