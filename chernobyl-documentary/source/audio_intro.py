# Score for the new cold open (16.5 s, already at final speed): a cinematic cue in D minor.
#  0.0-3.4  dark string pad, sparse low piano, faint heartbeat and geiger
#  4.44     first flash in the picture -> boom;  5.48 the reactor blows -> big explosion + braam
#  5.5-8.8  low string ostinato under Bb -> Gm;  8.8-12.6 taiko drums drive it, pad climbs to A
#  12.6-15.2 riser and drum roll;  15.2 final boom + braam, ringing out into the film.
import numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 16.5; N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(426)
def env(p): xs, ys = zip(*p); return np.interp(t, xs, ys)
def lp(x, f): b, a = signal.butter(2, f / (SR / 2)); return signal.lfilter(b, a, x)
def hp(x, f): b, a = signal.butter(2, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f0, f1): b, a = signal.butter(2, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
L = np.zeros(N); R = np.zeros(N)
def add(t0, s, gl=1.0, gr=1.0):
    i = int(t0 * SR); m = min(N - i, len(s))
    if m > 0: L[i:i + m] += s[:m] * gl; R[i:i + m] += s[:m] * gr
def saw(f, n, ph=0.0):
    tt = np.arange(n) / SR; return signal.sawtooth(2 * np.pi * f * tt + ph)

# --- string pad: detuned saw stacks, chords Dm | Bb | Gm | A | Dm
chords = [(0.0, 5.48, [38, 50, 53, 57, 62]), (5.48, 7.2, [34, 46, 50, 53, 58]), (7.2, 8.8, [31, 43, 50, 55, 58]),
          (8.8, 12.6, [33, 45, 52, 57, 61]), (12.6, 15.2, [34, 46, 53, 58, 62]), (15.2, 16.5, [38, 50, 57, 62, 65])]
pad = np.zeros((N, 2))
for s0, s1, notes in chords:
    i0 = int(s0 * SR); i1 = min(N, int((s1 + 0.35) * SR)); n = i1 - i0
    tt = np.arange(n) / SR
    e = np.minimum(1, tt / 0.6) * np.clip((s1 + 0.35 - s0 - tt) / 0.35, 0, 1)
    for k, m in enumerate(notes):
        for d, side in [(-0.12, 0), (0.0, None), (0.13, 1)]:
            v = saw(hz(m + d), n, k + d) * e * (0.09 if m < 45 else 0.06)
            if side is None: pad[i0:i1, 0] += v * .5; pad[i0:i1, 1] += v * .5
            else: pad[i0:i1, side] += v
cut = env([(0, 600), (5.4, 900), (8.8, 1400), (12.6, 2200), (15.2, 2600), (16.5, 1200)])
for c in range(2):  # time-varying low-pass in blocks
    out = np.zeros(N); zi = None
    for k in range(0, N, 4800):
        b, a = signal.butter(2, cut[k] / (SR / 2))
        if zi is None: zi = signal.lfilter_zi(b, a) * 0
        out[k:k + 4800], zi = signal.lfilter(b, a, pad[k:k + 4800, c], zi=zi)
    pad[:, c] = out
pad *= env([(0, 0), (1.2, .55), (5.3, .7), (8.8, .8), (12.6, 1), (15.2, 1.1), (16.5, .8)])[:, None]
L += pad[:, 0]; R += pad[:, 1]

# --- low piano, sparse, before the blast
def piano(m, dur=2.5, g=.35):
    n = int(dur * SR); tt = np.arange(n) / SR; f = hz(m)
    s = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (2.2 + h * 1.3)) / h ** 1.3 for h in range(1, 7))
    return s * g * np.minimum(1, tt / 0.004)
for t0, m in [(0.3, 38), (1.45, 41), (2.6, 45), (3.4, 38), (3.4, 50)]:
    add(t0, piano(m), .9, 1.1)

# --- heartbeat (faint) up to the blast, geiger clicks rising
tb = 0.6
while tb < 5.3:
    for dt, g in [(0, .4), (0.28, .28)]:
        n = int(.5 * SR); tt = np.arange(n) / SR
        add(tb + dt, np.sin(2 * np.pi * (45 + 50 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 14) * g)
    tb += 0.95 - 0.06 * tb
rate = env([(0, 1), (3.4, 4), (8.8, 8), (12.6, 14), (14.8, 2), (16.5, 0)])
cl = rng.random(N) < rate / SR; ck = np.zeros(N); ck[cl] = 1
ck = bp(signal.lfilter(np.exp(-np.arange(80) / 12), [1], ck), 1500, 6000) * 0.25
L += ck; R += np.roll(ck, 30)

# --- low string ostinato (16ths) from the blast on
step = 60 / 100 / 4   # 100 bpm sixteenths
seq = {5.48: 38, 7.2: 31, 8.8: 33, 12.6: 34}
keys = sorted(seq)
tn = 5.9
while tn < 15.1:
    root = seq[[k for k in keys if k <= tn][-1]]
    k = int(round((tn - 5.9) / step)) % 4
    m = root + [0, 0, 12, 0][k]
    n = int(.17 * SR); tt = np.arange(n) / SR
    s = (saw(hz(m), n) + saw(hz(m) * 1.004, n, 1)) * np.exp(-tt * 14) * np.minimum(1, tt / .006)
    s = lp(s, 900) * (0.16 if k == 0 else 0.11) * (1.25 if tn > 8.8 else 1)
    add(tn, s, 1.05 if k % 2 else .95, .95 if k % 2 else 1.05)
    tn += step

# --- drums
def taiko(g=1.0, f0=70):
    n = int(1.6 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (f0 * 0.62 + f0 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 5.5)
    s += lp(rng.standard_normal(n), 700) * np.exp(-tt * 28) * .6
    return s * g
beat = 60 / 100
for c, g in [(3.4, .7), (8.8, 1.0), (12.6, 1.0)]: add(c, taiko(1.3, 60))
tk = 8.8 + beat
while tk < 12.55:   # boom . boom-boom . pattern
    add(tk, taiko(.75)); add(tk + beat * .5, taiko(.5, 85), .8, 1.2); tk += beat
k = 0; tk = 12.6 + beat * .5
while tk < 15.15:   # accelerating roll into the final hit
    add(tk, taiko(.35 + .45 * (tk - 12.6) / 2.6, 90), 1.1 if k % 2 else .9, .9 if k % 2 else 1.1)
    tk += max(0.06, beat / 2 * (1 - (tk - 12.6) / 3.0)); k += 1

# --- braams: distorted low saws with an opening filter
def braam(dur, g=1.0, notes=(26, 38, 45)):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(saw(hz(m), n, j) + saw(hz(m) * 1.006, n, j + 2) for j, m in enumerate(notes))
    s = np.tanh(s * 1.6)
    out = np.zeros(n); zi = None
    for k in range(0, n, 2400):
        f = 250 + 2200 * np.exp(-tt[k] * 1.6) * np.minimum(1, tt[k] / 0.08)
        b, a = signal.butter(2, f / (SR / 2))
        if zi is None: zi = np.zeros(2)
        out[k:k + 2400], zi = signal.lfilter(b, a, s[k:k + 2400], zi=zi)
    return out * np.exp(-tt * 0.9) * np.minimum(1, tt / 0.02) * g * .32

# --- explosions: sub drop + rumble + debris crackle
def boom(g=1.0, dur=4.0, sub=34):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (sub + 90 * np.exp(-tt * 9)) * tt) * np.exp(-tt * 1.3) * 1.2
    rum = lp(np.cumsum(rng.standard_normal(n)) / 60, 260); rum -= lp(rum, 15)
    s += rum * np.exp(-tt * 0.9) * 0.9
    s += bp(rng.standard_normal(n), 600, 5000) * np.exp(-tt * 9) * .5          # blast crack
    cr = (rng.random(n) < 60 / SR) * rng.standard_normal(n)
    s += hp(signal.lfilter(np.exp(-np.arange(200) / 30), [1], cr), 1800) * np.exp(-tt * 1.6) * .35
    return s * g * np.minimum(1, tt / 0.003)
add(4.44, boom(.55, 2.5, 40))
add(5.48, boom(1.25, 4.5), 1.0, .95); add(5.48, braam(3.2, 1.0))
add(15.2, boom(1.35, 2.0, 30)); add(15.2, braam(1.4, 1.2, (26, 38, 50)))

# --- riser into the final hit: filtered noise sweep + rising tone
ri = np.zeros(N); i0, i1 = int(12.6 * SR), int(15.2 * SR); n = i1 - i0; tt = np.arange(n) / SR
nz = rng.standard_normal(n); out = np.zeros(n); zi = np.zeros(4)
for k in range(0, n, 2400):
    f = 300 * (25 ** (tt[k] / tt[-1]))
    b, a = signal.butter(2, [f / (SR / 2), min(.95, f * 2.5 / (SR / 2))], 'band')
    out[k:k + 2400], zi = signal.lfilter(b, a, nz[k:k + 2400], zi=zi)
fr = 110 * 2 ** (2 * tt / tt[-1]); ph = 2 * np.pi * np.cumsum(fr) / SR
ri[i0:i1] = (out * 0.5 + np.sin(ph) * 0.12 + np.sin(ph * 1.5) * .06) * (tt / tt[-1]) ** 2
L += ri; R += np.roll(ri, 240)

# --- reverb (stereo, decorrelated noise IR)
def ir(t60, seed):
    n = int(t60 * SR); r = np.random.default_rng(seed).standard_normal(n) * np.exp(-6.9 * np.arange(n) / SR / t60)
    r = lp(r, 4500); return r / np.sqrt(np.sum(r ** 2))
wl = signal.fftconvolve(L, ir(2.4, 1))[:N]; wr = signal.fftconvolve(R, ir(2.4, 2))[:N]
L = L + wl * .32; R = R + wr * .32
fade = env([(0, 0), (0.1, 1), (15.9, 1), (16.5, 0.4)])
x = np.stack([L, R], 1) * fade[:, None]
x = np.tanh(x / np.abs(x).max() * 1.4) / np.tanh(1.4) * 0.85
wavfile.write('out/intro/soundtrack_raw.wav', SR, x.astype(np.float32))
print('ok', x.shape, np.abs(x).max())
