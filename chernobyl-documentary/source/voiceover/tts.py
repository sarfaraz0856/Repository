import sys, json, wave, numpy as np
from piper import PiperVoice, SynthesisConfig
voice = sys.argv[1]; ls = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
d = f'vits-piper-hi_IN-{voice}-medium'
v = PiperVoice.load(f'{d}/hi_IN-{voice}-medium.onnx', config_path=f'{d}/hi_IN-{voice}-medium.onnx.json')
lines = json.load(open('lines.json'))
for i, (t0, t1, txt) in enumerate(lines):
    fn = f'{voice}_{i:02d}.wav'
    with wave.open(fn, 'wb') as w:
        v.synthesize_wav(txt, w, syn_config=SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.7))
    with wave.open(fn) as w: dur = w.getnframes() / w.getframerate()
    print(f'{i:2d} slot {t1-t0:4.1f}s speech {dur:4.1f}s {"OVER" if dur > t1-t0 else ""}')
