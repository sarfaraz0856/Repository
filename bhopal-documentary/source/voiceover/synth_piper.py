# Pratham (Piper) phrase-by-phrase, with natural pauses: 0.55 s after a full stop, 0.3 s after a comma break.
import sys, json, io, wave, numpy as np
from piper import PiperVoice, SynthesisConfig
from scipy.io import wavfile
D = '/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad/tts/vits-piper-hi_IN-pratham-medium/'
v = PiperVoice.load(D + 'hi_IN-pratham-medium.onnx', config_path=D + 'hi_IN-pratham-medium.onnx.json')
ls, ns, nw, tag = float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
PZ = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
L = json.load(open('lines.json'))
def syn(t):
    b = io.BytesIO()
    with wave.open(b, 'wb') as w: v.synthesize_wav(t, w, syn_config=SynthesisConfig(length_scale=ls, noise_scale=ns, noise_w_scale=nw))
    b.seek(0)
    with wave.open(b) as w: sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    idx = np.where(np.abs(x) > 0.01)[0]; return x[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)], sr
for sec in sys.argv[5].split(','):
    for i, (t0, txt) in enumerate(L[sec]):
        out = []
        for ph in [p.strip() for p in txt.split('|')]:
            x, sr = syn(ph); out += [x, np.zeros(int((0.55 if ph.endswith('।') else 0.3) * PZ * sr))]
        y = np.concatenate(out[:-1]); wavfile.write(f'{tag}_{sec}_{i}.wav', sr, (np.clip(y, -1, 1) * 32767).astype(np.int16))
        print(tag, sec, i, round(len(y) / sr, 2))
