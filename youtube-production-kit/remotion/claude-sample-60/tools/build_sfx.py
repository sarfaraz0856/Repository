"""UI sound effects for the Claude-screen documentary: a soft mouse click and a 20 s keyboard-typing bed."""
import os, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000; rng = np.random.default_rng(5)
def burst(ln, amp, dec, lp):
    t = np.arange(int(ln * SR)) / SR; x = rng.standard_normal(len(t))
    return np.convolve(x, np.ones(lp) / lp, mode="same") * amp * np.exp(-dec * t)
click = np.zeros(int(0.12 * SR)); a = burst(.025, .7, 260, 3); click[:len(a)] += a
b = burst(.03, .45, 220, 3); o = int(.1 * SR * .9 / 9 * 1); click[int(.05 * SR):int(.05 * SR) + len(b)] += b
typing = np.zeros(int(20 * SR)); t = 0.0
while t < 19.8:
    k = burst(.03, .5 if rng.random() > .12 else .7, 300, 5 if rng.random() > .12 else 9) * (0.75 + 0.5 * rng.random())
    i = int(t * SR); typing[i:i + len(k)] += k; t += 1 / 16 * (0.6 + 0.8 * rng.random())
os.makedirs(os.path.join(ROOT, "public/audio"), exist_ok=True)
for name, x in (("sfx_click.wav", click), ("sfx_typing.wav", typing)):
    x = x / (np.abs(x).max() + 1e-9) * 0.8
    sf.write(os.path.join(ROOT, "public/audio", name), np.stack([x, x], 1).astype(np.float32), SR)
print("ok")
