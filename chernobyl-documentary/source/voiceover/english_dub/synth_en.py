# English dub base speech (Piper en_US-ryan-high), phrase by phrase; speeds a line up (to a limit) when it would overrun its slot.
import json, io, wave, sys, numpy as np
from piper import PiperVoice, SynthesisConfig
from scipy.io import wavfile
D = '../tts/vits-piper-en_US-ryan-high/'
v = PiperVoice.load(D + 'en_US-ryan-high.onnx', config_path=D + 'en_US-ryan-high.onnx.json')
L = json.load(open('lines.json')); SL = json.load(open('slots.json'))
def syn(t, ls):
    b = io.BytesIO()
    with wave.open(b, 'wb') as w: v.synthesize_wav(t, w, syn_config=SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.8))
    b.seek(0)
    with wave.open(b) as w: sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    idx = np.where(np.abs(x) > 0.01)[0]; return x[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)], sr
secs = sys.argv[1].split(',') if len(sys.argv) > 1 else list(L)
ONLY = sys.argv[2].split(",") if len(sys.argv) > 2 else None
for sec in secs:
    for i, (t0, txt) in enumerate(L[sec]):
        if ONLY and str(i) not in ONLY: continue
        slot = SL[sec][i]
        for ls, pz in [(0.95, 0.8), (0.9, 0.7), (0.86, 0.6), (0.82, 0.5), (0.78, 0.4)]:
            out = []
            for ph in [p.strip() for p in txt.split('|')]:
                x, sr = syn(ph, ls); out += [x, np.zeros(int((0.5 if ph[-1] in '.?' else 0.25) * pz * sr))]
            y = np.concatenate(out[:-1])
            if len(y) / sr <= slot - 0.1: break
        wavfile.write(f'E_{sec}_{i}.wav', sr, (np.clip(y, -1, 1) * 32767).astype(np.int16))
        d = len(y) / sr; print(sec, i, ls, round(d, 2), round(slot, 2), 'OVER' if d > slot - 0.1 else '')
