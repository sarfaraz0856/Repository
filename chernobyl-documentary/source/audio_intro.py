# Score for the new cold open (16.5 s, already at final speed): a low drone, a heartbeat, a geiger counter that
# speeds up, a hit on every cut and a long boom into the film's title.
import numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 16.5; N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(426)
def env(p): xs, ys = zip(*p); return np.interp(t, xs, ys)
def lp(x, f): b, a = signal.butter(2, f / (SR / 2)); return signal.lfilter(b, a, x)
def bp(x, f0, f1): b, a = signal.butter(2, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
L = np.zeros(N); R = np.zeros(N)
# drone: A minor-ish cluster, slowly swelling
for f, g, ph in [(55, .30, 0), (82.4, .16, 1), (110.6, .10, 2), (164.8, .05, 3), (220.0, .03, 4)]:
    v = np.sin(2 * np.pi * f * t + ph + 0.4 * np.sin(2 * np.pi * 0.11 * t + ph)) * g
    L += v * (1 + 0.1 * np.sin(ph)); R += v * (1 - 0.1 * np.sin(ph))
dr = env([(0, 0), (1.5, .6), (12, 1), (16.5, .7)]); L *= dr; R *= dr
# dark wind
w = lp(rng.standard_normal(N), 500) * 0.25 * env([(0, .2), (8, .6), (16.5, .4)]); L += w; R += np.roll(w, 900)
# heartbeat, getting faster
tb, beats = 0.6, []
while tb < 12.0: beats += [tb, tb + 0.28]; tb += 1.15 - 0.035 * tb
def hit(t0, f=50, dec=7, g=1.0, n=0.0):
    i = int(t0 * SR); m = min(N - i, int(2.5 * SR)); tt = np.arange(m) / SR
    s = np.sin(2 * np.pi * (f + 60 * np.exp(-tt * 25)) * tt) * np.exp(-tt * dec) * g
    if n: s += lp(rng.standard_normal(m), 900) * np.exp(-tt * dec * 1.5) * n
    return i, s
for b in beats:
    i, s = hit(b, 45, 14, 0.55); L[i:i + len(s)] += s; R[i:i + len(s)] += s
# geiger clicks, rate rising
rate = env([(0, 1), (3.4, 3), (8.8, 9), (12.6, 18), (14.5, 4), (16.5, 0)])
cl = rng.random(N) < rate / SR
ck = np.zeros(N); ck[cl] = 1; ck = bp(signal.lfilter(np.exp(-np.arange(80) / 12), [1], ck), 1500, 6000) * 0.5
L += ck; R += np.roll(ck, 30)
# hits on the cuts, and the big boom
for c, g in [(3.4, 1.2), (8.8, 0.9), (12.6, 0.9)]:
    i, s = hit(c, 38, 3.2, g, 0.5); L[i:i + len(s)] += s; R[i:i + len(s)] += s
i, s = hit(15.2, 32, 1.4, 1.5, 0.9); L[i:i + len(s)] += s[:N - i]; R[i:i + len(s)] += s[:N - i]
# reverse swell into the boom
sw = lp(rng.standard_normal(N), 3000) * env([(13.2, 0), (15.15, .5), (15.2, 0)]) ** 2; L += sw; R += sw
fade = env([(0, 0), (0.15, 1), (15.8, 1), (16.5, 0.35)])
x = np.stack([L, R], 1) * fade[:, None]; x /= np.abs(x).max() / 0.8
wavfile.write('out/intro/soundtrack_raw.wav', SR, x.astype(np.float32))
