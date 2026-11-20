"""Speak every Part 3 line with Kokoro (Hindi male base voice) -> lines_src/NN.wav"""
import os, soundfile as sf
from kokoro_onnx import Kokoro
from lines_p3 import LINES
os.makedirs('lines_src', exist_ok=True)
k = Kokoro('models/kokoro-v1.0.onnx', 'models/voices-v1.0.bin')
for i, (_, hi) in enumerate(LINES):
    s, sr = k.create(hi, voice='hm_omega', speed=1.0, lang='hi')
    sf.write(f'lines_src/{i:02d}.wav', s, sr)
print('lines', len(LINES))
