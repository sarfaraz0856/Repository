# Epilogue sound (60 s): night ambience under the two last shots, then the score alone over the closing cards,
# THE END and the credits, ending in silence. All synthesized (48 kHz stereo float WAV).
#   0-15  AB1 the arch at night     crickets, the hum of the arch's ventilation, far wind
#   15-30 AB2 the last flight       night wind over the forest, an owl
#   30-42 closing cards             strings and piano alone
#   42-60 THE END, credits          the opening theme on piano, a last low D, silence
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000; DUR = 60.0; N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(1987)

def env(points):
    xs, ys = zip(*points); return np.interp(t, xs, ys)
def filt(x, kind, f, order=2):
    if kind == 'bp': b, a = signal.butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], 'band')
    else: b, a = signal.butter(order, f / (SR / 2), kind)
    return signal.lfilter(b, a, x)
def noise(n=N, seed=None): return (np.random.default_rng(seed) if seed is not None else rng).standard_normal(n)
def pink(n=N, seed=None):
    w = noise(n, seed)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; a = [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w) * 8
def brown(n=N, seed=None):
    x = np.cumsum(noise(n, seed)); x -= signal.lfilter([1], [1, -0.9995], x) * (1 - 0.9995)
    return filt(x, 'high', 15) / 40
def smoothrand(rate, n=N, seed=0):
    r = np.random.default_rng(seed); k = int(DUR * rate) + 4
    return np.interp(t, np.linspace(0, DUR, k), r.standard_normal(k))
def at(t0): return int(t0 * SR)
def place(buf, x, t0, gain=1.0):
    i = at(t0)
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x))
    if j > i: buf[i:j] += x[:j - i] * gain

L = np.zeros(N); R = np.zeros(N); REV = np.zeros(N)
import inspect
STATS = []
SECS = [(0, 15), (15, 30), (30, 42), (42, 60)]
def _stat(x):
    ln = inspect.stack()[2].lineno
    STATS.append((ln, [20 * np.log10(np.sqrt(np.mean(x[int(a * SR):int(b * SR)] ** 2)) + 1e-12) for a, b in SECS]))
def add(x, pan=0.0, gain=1.0, rev=0.0):
    global L, R, REV
    _stat(x * gain)
    gl = np.cos((pan + 1) * np.pi / 4); gr = np.sin((pan + 1) * np.pi / 4)
    L += x * gain * gl * 1.4142; R += x * gain * gr * 1.4142; REV += x * gain * rev
def add_st(xl, xr, gain=1.0, rev=0.0):
    global L, R, REV
    _stat(xl * gain)
    L += xl * gain; R += xr * gain; REV += (xl + xr) * 0.5 * gain * rev
def add_pan(x, pan_curve, gain=1.0, rev=0.0):
    global L, R, REV
    _stat(x * gain)
    gl = np.cos((pan_curve + 1) * np.pi / 4); gr = np.sin((pan_curve + 1) * np.pi / 4)
    L += x * gain * gl * 1.4142; R += x * gain * gr * 1.4142; REV += x * gain * rev

NOTE = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
def hz(name):
    n, o = name[:-1], int(name[-1]); return 440.0 * 2 ** ((NOTE[n] + 12 * (o + 1) - 69) / 12)

# ---------------- string ensemble ----------------
def strings(chords, gain_env, bright=2600, seed=0, trem=None):
    # chords: [(t0, t1, [notes])]; each note = 3 detuned saw-ish voices with vibrato; crossfaded chords
    r = np.random.default_rng(seed); out = np.zeros(N)
    for (t0, t1, notes) in chords:
        i0, i1 = max(0, at(t0 - 1.2)), min(N, at(t1 + 1.8))
        tt = t[i0:i1]
        e = np.clip((tt - (t0 - 1.2)) / 2.2, 0, 1) ** 1.5 * np.clip(((t1 + 1.8) - tt) / 2.4, 0, 1) ** 1.2
        seg = np.zeros(i1 - i0)
        for nm in notes:
            f = hz(nm)
            for v in range(3):
                det = 1 + (v - 1) * 0.0022 + r.uniform(-0.0006, 0.0006)
                vib = 1 + 0.0035 * np.sin(2 * np.pi * (4.6 + r.uniform(-0.4, 0.4)) * tt + r.uniform(0, 6.28))
                ph = 2 * np.pi * np.cumsum(f * det * vib) / SR + r.uniform(0, 6.28)
                for h in range(1, 14):
                    if f * h > 9000: break
                    seg += np.sin(h * ph) / h * (0.9 if h % 2 else 0.7)
        out[i0:i1] += seg * e / np.sqrt(len(notes) * 3)
    out = filt(out, 'low', bright); out = filt(out, 'high', 70)
    if trem is not None: out *= trem
    return out * gain_env

# ---------------- piano ----------------
def piano_note(f, dur=4.0, vel=1.0, seed=0):
    r = np.random.default_rng(seed); n = int(dur * SR); tt = np.arange(n) / SR
    B = 0.0004; x = np.zeros(n)
    for h in range(1, 12):
        fh = f * h * np.sqrt(1 + B * h * h)
        if fh > 12000: break
        tau = 2.2 / h ** 0.75 * (220 / max(f, 110)) ** 0.25
        x += np.sin(2 * np.pi * fh * tt + r.uniform(0, 6.28)) * np.exp(-tt / tau) / h ** 1.1 * (1 + 0.3 * (h == 2))
    hammer = filt(r.standard_normal(n), 'bp', (1500, 6000)) * np.exp(-tt / 0.008) * 0.25
    x = (x + hammer) * np.minimum(tt / 0.003, 1) * vel
    x *= np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    return filt(x, 'low', 5000)
PIANO = np.zeros(N)
def piano(t0, name, vel=0.7, dur=5.0):
    place(PIANO, piano_note(hz(name), dur, vel, seed=int(t0 * 100)), t0)


def chirp(f0, f1, d, seed):
    r = np.random.default_rng(seed); n = int(d * SR); tt = np.arange(n) / SR
    f = f0 + (f1 - f0) * (tt / d) + 300 * np.sin(2 * np.pi * r.uniform(18, 40) * tt)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2
def birdsong(t0, t1, density, seed, gain=1.0, pan=0.0):
    r = np.random.default_rng(seed); buf = np.zeros(N); tt = t0
    while tt < t1:
        k = r.integers(3, 9); base = r.uniform(2600, 5200); up = r.random() < 0.5
        for j in range(k):
            d = r.uniform(0.04, 0.13); f0 = base * r.uniform(0.85, 1.15); f1 = f0 * (r.uniform(1.1, 1.5) if up else r.uniform(0.6, 0.9))
            place(buf, chirp(f0, f1, d, seed * 100 + j + int(tt * 10)), tt, r.uniform(0.5, 1.0))
            tt += d + r.uniform(0.03, 0.1)
        tt += r.exponential(1.0 / density)
    add(filt(buf, 'high', 1800), pan, gain * 2.5, rev=0.35)


VOW = [(730, 1090, 2440), (530, 1840, 2480), (270, 2290, 3010), (570, 840, 2410), (440, 1020, 2240), (300, 870, 2240)]
def voice(t0, d, f0=140, seed=0, syl=4.5):
    r = np.random.default_rng(seed); n = int(d * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.08 * np.sin(2 * np.pi * 0.7 * tt + r.uniform(0, 6)) + 0.03 * r.standard_normal(n).cumsum() / np.sqrt(n))
    src = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) + 0.3 * r.standard_normal(n)
    out = np.zeros(n); blk = int(SR / syl)
    for k in range(0, n, blk):
        F = VOW[r.integers(len(VOW))]
        seg = src[k:k + blk]
        y = sum(filt(seg, 'bp', (fm * 0.85, fm * 1.15)) * g for fm, g in zip(F, (1.0, 0.6, 0.25)))
        m = len(y); y *= np.sin(np.pi * np.arange(m) / m) ** 0.7 * (r.random() > 0.15)
        out[k:k + m] += y
    out *= np.minimum(1, tt / 0.05) * np.minimum(1, (d - tt) / 0.2)
    tmp = np.zeros(N); place(tmp, out, t0); return tmp
def crowd(t0, t1, nvoices, seed, dist_lp=2500):
    r = np.random.default_rng(seed); buf = np.zeros(N)
    for k in range(nvoices):
        s = r.uniform(t0, t1 - 1.0); d = r.uniform(0.8, 2.6)
        buf += voice(s, min(d, t1 - s), f0=r.choice([110, 125, 140, 190, 210, 240, 280]) * r.uniform(0.9, 1.1), seed=seed * 1000 + k, syl=r.uniform(3.5, 5.5)) * r.uniform(0.3, 1.0)
    return filt(buf, 'low', dist_lp)


def steps(t0, t1, period, gain, seed, bright=(1800, 7000)):
    r = np.random.default_rng(seed); buf = np.zeros(N); tt = t0
    while tt < t1:
        n = int(0.14 * SR); x = r.standard_normal(n)
        thud = filt(x, 'bp', (100, 700)) * np.exp(-np.arange(n) / SR / 0.025)
        scuff = filt(x, 'bp', bright) * np.exp(-np.arange(n) / SR / 0.04) * 0.5
        place(buf, (thud + scuff) * r.uniform(0.6, 1.0), tt); tt += period * r.uniform(0.95, 1.05)
    return buf


def engine(f_curve, rough=0.3, seed=0):
    r = np.random.default_rng(seed)
    ph = 2 * np.pi * np.cumsum(f_curve) / SR
    x = sum(np.sin(h * ph + r.uniform(0, 6)) / h ** 0.8 for h in range(1, 12))
    x *= 1 + rough * smoothrand(18, seed=seed + 1)
    return x


def geiger(rate_env, seed=0):
    r = np.random.default_rng(seed)
    imp = (r.random(N) < rate_env / SR).astype(float) * r.uniform(0.6, 1.0, N)
    k = np.exp(-np.arange(int(0.004 * SR)) / SR / 0.0006) * np.sin(2 * np.pi * 3100 * np.arange(int(0.004 * SR)) / SR)
    return filt(signal.fftconvolve(imp, k)[:N], 'high', 900)

def creak(t0, f0=300, d=0.9, seed=0):
    r = np.random.default_rng(seed); n = int(d * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.15 * np.sin(2 * np.pi * 6 * tt) + 0.2 * tt / d)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * r.random(n) ** 3)
    x = filt(x, 'bp', (400, 3000)) * np.sin(np.pi * tt / d) ** 2
    tmp = np.zeros(N); place(tmp, x, t0); return tmp


def hit(t0, g, decay=3.0, seed=0):
    n = int(decay * 2.2 * SR); tt = np.arange(n) / SR
    f = 30 + 18 * np.exp(-tt / 0.4)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (decay * 0.35)) * np.minimum(tt / 0.01, 1)
    tmp = np.zeros(N); place(tmp, sub, t0); return tmp * g


def ir(sec, seed):
    r = np.random.default_rng(seed); n = int(sec * SR); tt = np.arange(n) / SR
    x = r.standard_normal(n) * np.exp(-tt / (sec / 6.9))
    x = filt(x, 'low', 5000) * 0.6 + filt(x, 'low', 1200) * 0.4
    for d, g in [(0.023, 0.5), (0.041, 0.35), (0.067, 0.3), (0.093, 0.2)]: x[int(d * SR)] += g * 3
    return x / np.sqrt(np.sum(x ** 2))




# ================= EPILOGUE (60 s) =================
CH13 = [(0.0, 7.5, ['D2', 'A2', 'F3']), (7.5, 15.2, ['Bb1', 'F2', 'D3']),
        (15.0, 22.5, ['G2', 'D3', 'Bb3']), (22.5, 30.2, ['A2', 'E3', 'Db4']),
        (30.0, 36.0, ['Bb1', 'F2', 'D3', 'F3']), (36.0, 42.2, ['G1', 'D2', 'Bb2', 'D3']),
        (42.0, 50.0, ['D2', 'A2', 'D3', 'F3', 'A3']), (50.0, 58.0, ['D2', 'A2', 'D3', 'Gb3', 'A3'])]
add(strings(CH13, env([(0, 0), (2, 0.35), (14.5, 0.4), (15.5, 0.4), (29.5, 0.5), (31, 0.65), (41.5, 0.7), (43, 0.6), (52, 0.5), (57.5, 0.2), (59.0, 0)]), bright=2400, seed=111), -0.1, 0.06, rev=0.6)
add(strings([(30, 58, ['D1'])], env([(0, 0), (30, 0), (32, 0.5), (55, 0.4), (58.5, 0)]), bright=500, seed=112), 0, 0.08, rev=0.3)
for t0, nm, v in [(31.0, 'A4', 0.36), (32.6, 'F4', 0.34), (34.2, 'D4', 0.38), (36.2, 'Bb4', 0.34), (37.8, 'A4', 0.36), (39.6, 'D4', 0.4),
                  (43.0, 'D5', 0.34), (44.6, 'A4', 0.32), (46.2, 'F4', 0.34), (48.0, 'E4', 0.32), (49.8, 'F4', 0.34), (51.6, 'D4', 0.38),
                  (53.6, 'A3', 0.34), (55.4, 'D4', 0.42), (55.42, 'D3', 0.3), (55.44, 'A2', 0.24)]:
    piano(t0, nm, v, dur=6.0)
add(PIANO, 0.1, 0.09, rev=0.7)

wl, wr = pink(seed=941), pink(seed=942)
gust = 0.6 + 0.4 * np.tanh(smoothrand(0.25, seed=943))
wl = filt(wl, 'bp', (160, 1200)) * gust; wr = filt(wr, 'bp', (160, 1200)) * gust
w_env = env([(0, 0), (0.8, 0.25), (15, 0.25), (15.2, 0.45), (29, 0.45), (30.5, 0), (60, 0)])
add_st(wl * w_env, wr * w_env, 0.12, rev=0.1)

# AB1: crickets, the arch's ventilation
cr = np.zeros(N); r = np.random.default_rng(951)
for k in range(260):
    t0 = r.uniform(0, 14.8); n = int(0.04 * SR); tt = np.arange(n) / SR
    place(cr, np.sin(2 * np.pi * r.uniform(4200, 4800) * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 60 * tt))) * np.sin(np.pi * tt / tt[-1]) * r.uniform(0.2, 1), t0)
add(cr, 0.3, 0.006, rev=0.5)
vent = filt(brown(seed=952), 'bp', (60, 300)) + 0.3 * np.sin(2 * np.pi * 100 * t)
add(vent * env([(0, 0), (0.5, 1), (14.8, 1), (15, 0), (60, 0)]), 0, 0.012, rev=0.6)
# AB2: an owl over the forest
for t0 in [19.0, 19.5, 24.2]:
    n = int(0.45 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * np.cumsum(380 - 40 * tt / 0.45) / SR) * np.sin(np.pi * tt / tt[-1]) ** 1.5
    tmp = np.zeros(N); place(tmp, x, t0); add(tmp, -0.5, 0.012, rev=0.9)
# THE END: a low bell
def bell(t0, f0):
    n = int(8 * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f0 * p * tt) * np.exp(-tt / d) * a for p, d, a in [(0.5, 4.5, 0.6), (1.0, 3.4, 1.0), (1.19, 2.6, 0.5), (1.5, 2.0, 0.35), (2.0, 1.5, 0.3), (2.6, 1.0, 0.2)])
    tmp = np.zeros(N); place(tmp, x * np.minimum(1, tt / 0.003), t0); return tmp
add(bell(42.2, 147), 0.0, 0.03, rev=0.9)
add(hit(1.0, 0.07), 0, rev=0.6)

REV = filt(REV, 'high', 60)
L += signal.fftconvolve(REV, ir(3.0, 1))[:N] * 0.5; R += signal.fftconvolve(REV, ir(3.0, 2))[:N] * 0.5
mix = np.stack([L, R], 1)
mix *= env([(0, 0), (0.8, 1), (57.0, 1), (59.6, 0), (60.0, 0)])[:, None]
mix = filt(mix.T, 'high', 22).T
mix /= np.max(np.abs(mix))
thr = 0.55; a = np.abs(mix)
mix = np.where(a > thr, np.sign(mix) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), mix)
mix /= np.max(np.abs(mix)); mix *= 10 ** (-1.2 / 20)
wavfile.write('out/part13/soundtrack_raw.wav', SR, mix.astype(np.float32))
print('written')
