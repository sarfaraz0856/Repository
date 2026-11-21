# Score for the Chernobyl Short: D-minor pad, low ostinato, taiko on every cut, a blast + braam on the hook,
# a riser into the last line, and a final boom. Usage: audio_short.py DUR "cut,cut,..." BOOM_T RISER_END OUT
import sys, numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = float(sys.argv[1]); cuts = [float(c) for c in sys.argv[2].split(',')]; BOOM = float(sys.argv[3]); REND = float(sys.argv[4])
N = int(SR * DUR); t = np.arange(N) / SR; rng = np.random.default_rng(1986)
def env(p): xs, ys = zip(*p); return np.interp(t, xs, ys)
def lp(x, f): b, a = signal.butter(2, f / (SR / 2)); return signal.lfilter(b, a, x)
def hp(x, f): b, a = signal.butter(2, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f0, f1): b, a = signal.butter(2, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, n, ph=0.0): return signal.sawtooth(2 * np.pi * f * np.arange(n) / SR + ph)
L = np.zeros(N); R = np.zeros(N)
def add(t0, s, gl=1.0, gr=1.0):
    i = int(t0 * SR); m = min(N - i, len(s))
    if m > 0: L[i:i + m] += s[:m] * gl; R[i:i + m] += s[:m] * gr
prog = [[38, 50, 53, 57, 62], [34, 46, 50, 53, 58], [31, 43, 50, 55, 58], [33, 45, 52, 57, 61]]
seg = 6.4; pad = np.zeros((N, 2)); k = 0; s0 = 0.0
while s0 < DUR:
    notes = prog[k % 4]; i0 = int(s0 * SR); i1 = min(N, int((s0 + seg + 0.4) * SR)); n = i1 - i0; tt = np.arange(n) / SR
    e = np.minimum(1, tt / 0.5) * np.clip((seg + 0.4 - tt) / 0.4, 0, 1)
    for j, m in enumerate(notes):
        for d, side in [(-0.12, 0), (0.13, 1)]:
            pad[i0:i1, side] += saw(hz(m + d), n, j + d) * e * (0.1 if m < 45 else 0.065)
    s0 += seg; k += 1
for c in range(2): pad[:, c] = lp(lp(pad[:, c], 1100), 1500)
L += pad[:, 0] * env([(0, .5), (6, .7), (40, 1.0), (DUR, .8)]); R += pad[:, 1] * env([(0, .5), (6, .7), (40, 1.0), (DUR, .8)])
step = 60 / 100 / 4; tn = 4.0; roots = [38, 34, 31, 33]
while tn < REND - 0.1:
    root = roots[int(tn // seg) % 4]; kk = int(round((tn - 4.0) / step)) % 4
    n = int(.17 * SR); tt = np.arange(n) / SR
    s = (saw(hz(root + [0, 0, 12, 0][kk]), n) + saw(hz(root + [0, 0, 12, 0][kk]) * 1.004, n, 1)) * np.exp(-tt * 14) * np.minimum(1, tt / .006)
    add(tn, lp(s, 900) * (0.15 if kk == 0 else 0.1)); tn += step
def taiko(g=1.0, f0=70):
    n = int(1.6 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * (f0 * 0.62 + f0 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 5.5) + lp(rng.standard_normal(n), 700) * np.exp(-tt * 28) * .6) * g
for c in cuts: add(c, taiko(1.0, 62))
def braam(dur, g=1.0, notes=(26, 38, 45)):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.tanh(sum(saw(hz(m), n, j) + saw(hz(m) * 1.006, n, j + 2) for j, m in enumerate(notes)) * 1.6)
    out = np.zeros(n); zi = np.zeros(2)
    for kx in range(0, n, 2400):
        b, a = signal.butter(2, (250 + 2200 * np.exp(-tt[kx] * 1.6) * min(1, tt[kx] / 0.08)) / (SR / 2))
        out[kx:kx + 2400], zi = signal.lfilter(b, a, s[kx:kx + 2400], zi=zi)
    return out * np.exp(-tt * 0.9) * np.minimum(1, tt / 0.02) * g * .32
def boom(g=1.0, dur=4.0, sub=34):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (sub + 90 * np.exp(-tt * 9)) * tt) * np.exp(-tt * 1.3) * 1.2
    rum = lp(np.cumsum(rng.standard_normal(n)) / 60, 260); rum -= lp(rum, 15); s += rum * np.exp(-tt * 0.9) * 0.9
    s += bp(rng.standard_normal(n), 600, 5000) * np.exp(-tt * 9) * .5
    cr = (rng.random(n) < 60 / SR) * rng.standard_normal(n); s += hp(signal.lfilter(np.exp(-np.arange(200) / 30), [1], cr), 1800) * np.exp(-tt * 1.6) * .35
    return s * g * np.minimum(1, tt / 0.003)
add(BOOM, boom(1.3, 4.5)); add(BOOM, braam(3.0, 1.0))
add(REND, boom(1.2, 2.5, 30)); add(REND, braam(2.0, 1.1, (26, 38, 50)))
i0, i1 = int((REND - 3.2) * SR), int(REND * SR); n = i1 - i0; tt = np.arange(n) / SR
nz = rng.standard_normal(n); out = np.zeros(n); zi = np.zeros(4)
for kx in range(0, n, 2400):
    f = 300 * (25 ** (tt[kx] / tt[-1])); b, a = signal.butter(2, [f / (SR / 2), min(.95, f * 2.5 / (SR / 2))], 'band')
    out[kx:kx + 2400], zi = signal.lfilter(b, a, nz[kx:kx + 2400], zi=zi)
ph = 2 * np.pi * np.cumsum(110 * 2 ** (2 * tt / tt[-1])) / SR
ri = (out * 0.5 + np.sin(ph) * 0.12) * (tt / tt[-1]) ** 2; L[i0:i1] += ri; R[i0:i1] += ri
rate = env([(0, 2), (20, 6), (REND, 12), (DUR, 0)]); ck = np.zeros(N); ck[rng.random(N) < rate / SR] = 1
ck = bp(signal.lfilter(np.exp(-np.arange(80) / 12), [1], ck), 1500, 6000) * 0.2; L += ck; R += np.roll(ck, 30)
def ir(t60, seed):
    n = int(t60 * SR); r = np.random.default_rng(seed).standard_normal(n) * np.exp(-6.9 * np.arange(n) / SR / t60); r = lp(r, 4500); return r / np.sqrt(np.sum(r ** 2))
L = L + signal.fftconvolve(L, ir(2.2, 1))[:N] * .3; R = R + signal.fftconvolve(R, ir(2.2, 2))[:N] * .3
x = np.stack([L, R], 1) * env([(0, 1), (DUR - 1.5, 1), (DUR, 0)])[:, None]
x = np.tanh(x / np.abs(x).max() * 1.4) / np.tanh(1.4) * 0.85
wavfile.write(sys.argv[5], SR, x.astype(np.float32))
