# Bhopal chapter 1 sound (THE NIGHT, 60 s): score and sound design, all synthesized (48 kHz stereo float WAV).
#   0-14  BH1 the city asleep    crickets, distant dogs, a train horn far off, a soft low chord
#   14-28 BH2 the plant          50 Hz electrical hum, a compressor, the first hiss from the stack
#   28-44 BH3 the gas escapes    a relief valve gives, a rising roar of venting gas, a low pulse
#   44-60 BH4 the lane           the roar muffled behind the houses, a dog whimpering, a thin high string; fade
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
SECS = [(0, 15), (15, 30), (30, 45), (45, 60)]
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




# ================= NATURE RETURNS (60 s) =================
CHB = [(0.0, 7.2, ['A1', 'E2', 'C3']), (7.0, 14.2, ['F1', 'C2', 'A2', 'E3']),
       (14.0, 21.2, ['D2', 'A2', 'F3']), (21.0, 28.2, ['Bb1', 'F2', 'D3', 'E3']),
       (28.0, 36.2, ['A1', 'E2', 'Bb2', 'F3']), (36.0, 44.2, ['D2', 'Ab2', 'F3']),
       (44.0, 52.2, ['F1', 'C2', 'B2', 'E3']), (52.0, 60.0, ['A1', 'E2', 'C3', 'E4'])]
add(strings(CHB, env([(0, 0), (3, 0.35), (13.5, 0.4), (14.5, 0.3), (27.5, 0.4), (29, 0.55), (43.5, 0.65), (45, 0.45), (55, 0.45), (59.5, 0)]), bright=1800, seed=81), -0.1, 0.06, rev=0.6)
for t0, nm, v in [(2.0, 'E4', 0.26), (4.4, 'C4', 0.26), (7.2, 'A3', 0.3), (10.4, 'B3', 0.26), (15.5, 'F4', 0.24), (19.0, 'E4', 0.24), (23.5, 'D4', 0.26),
                  (47.0, 'C5', 0.22), (50.5, 'B4', 0.22), (54.5, 'A4', 0.3), (54.52, 'A3', 0.2)]:
    piano(t0, nm, v, dur=6.5)
add(PIANO, 0.1, 0.07, rev=0.65)

# BH1: night ambience: crickets, wind, dogs barking far off, a train horn from the station
crk = np.zeros(N); r = np.random.default_rng(611)
for k in range(220):
    t0 = r.uniform(0, 30); f0 = r.uniform(3800, 5200); n = int(r.uniform(0.15, 0.5) * SR); tt = np.arange(n) / SR
    place(crk, np.sin(2 * np.pi * f0 * tt) * (np.sin(2 * np.pi * r.uniform(14, 22) * tt) > 0.3) * np.sin(np.pi * tt / tt[-1]) * r.uniform(0.2, 1), t0)
add(crk * env([(0, 0), (1, 1), (27, 1), (29.5, 0.15), (60, 0.1)]), 0.3, 0.006, rev=0.4)
wl, wr = pink(seed=612), pink(seed=613)
gust = 0.6 + 0.4 * np.tanh(smoothrand(0.2, seed=614))
add_st(filt(wl, 'bp', (120, 900)) * gust, filt(wr, 'bp', (120, 900)) * gust, 0.07, rev=0.1)
def bark(t0, f0, seed, n_b=2, gain=0.02, pan=0.0, lp=1800):
    r = np.random.default_rng(seed); tmp = np.zeros(N); tt0 = t0
    for k in range(n_b):
        n = int(0.16 * SR); tt = np.arange(n) / SR
        x = signal.sawtooth(2 * np.pi * np.cumsum(f0 * (1.15 - 0.4 * tt / 0.16)) / SR) * 0.6 + 0.6 * r.standard_normal(n)
        x = filt(x, 'bp', (350, 2600)) * np.exp(-tt / 0.06) * np.clip(tt / 0.008, 0, 1)
        place(tmp, x, tt0); tt0 += r.uniform(0.28, 0.45)
    add(filt(tmp, 'low', lp), pan, gain, rev=0.8)
bark(3.2, 420, 621, 3, 0.014, -0.5); bark(6.0, 520, 622, 2, 0.01, 0.6, 1400); bark(11.8, 400, 623, 2, 0.009, -0.2, 1200)
n = int(3.0 * SR); tt = np.arange(n) / SR
horn = (signal.sawtooth(2 * np.pi * 311 * tt) + 0.8 * signal.sawtooth(2 * np.pi * 370 * tt)) * np.clip(tt / 0.2, 0, 1) * np.clip((tt[-1] - tt) / 0.6, 0, 1)
tmp = np.zeros(N); place(tmp, filt(horn, 'low', 900), 8.4); add(tmp, 0.5, 0.008, rev=0.95)

# BH2: the plant: 50 Hz hum with harmonics, a compressor thrum, then the first hiss
hum = sum(np.sin(2 * np.pi * 50 * h * t + h) / h for h in range(1, 7)) * (1 + 0.1 * smoothrand(0.5, seed=631))
add(hum * env([(0, 0), (13.5, 0), (15, 1), (27.5, 1), (29, 0.6), (44, 0.6), (45, 0.15), (60, 0.1)]), 0.1, 0.012, rev=0.3)
comp = filt(brown(seed=632), 'low', 220) * (0.6 + 0.4 * np.sin(2 * np.pi * 7.5 * t) ** 2)
add(comp * env([(0, 0), (14, 0), (15, 1), (28, 1), (29, 0.5), (44, 0.4), (45, 0), (60, 0)]), -0.2, 0.05, rev=0.2)
hissL, hissR = filt(noise(seed=641), 'bp', (900, 9000)), filt(noise(seed=642), 'bp', (900, 9000))
roarL, roarR = filt(brown(seed=643), 'bp', (60, 700)), filt(brown(seed=644), 'bp', (60, 700))
flut = 0.75 + 0.25 * np.tanh(smoothrand(3.0, seed=645))
h_env = env([(0, 0), (23, 0), (27.5, 0.12), (28.4, 0.15), (28.6, 0.8), (36, 1.0), (43.8, 1.0), (44.2, 0.3), (60, 0.35)])
r_env = env([(0, 0), (28.4, 0), (29.5, 0.6), (40, 1.0), (43.8, 1.0), (44.2, 0.5), (60, 0.6)])
muffle = env([(0, 1), (44, 1), (44.3, 0), (60, 0)])
hs_l = hissL * flut * h_env; hs_r = hissR * flut * h_env
hs_l = hs_l * muffle + filt(hs_l, 'low', 700) * (1 - muffle) * 2.5; hs_r = hs_r * muffle + filt(hs_r, 'low', 700) * (1 - muffle) * 2.5
add_st(hs_l, hs_r, 0.05, rev=0.25)
add_st(roarL * r_env * flut, roarR * r_env * flut, 0.12, rev=0.3)
# BH3: the relief valve gives: a metallic bang and creak, then a slow low pulse under the roar
add(hit(28.45, 0.16, decay=1.6, seed=651), 0, rev=0.7)
tmp = np.zeros(N); place(tmp, creak(0, 180, 1.4, seed=652), 29.0); add(tmp, -0.3, 0.03, rev=0.6)
pulse = np.sin(2 * np.pi * 42 * t) * np.exp(-((t % 1.25) / 0.18)) * env([(0, 0), (30, 0), (34, 0.8), (58, 1), (60, 0)])
add(pulse, 0, 0.09, rev=0.2)
# BH4: a dog whimpering somewhere in the lane, a thin high string over everything
n = int(1.4 * SR); tt = np.arange(n) / SR
wh = np.sin(2 * np.pi * np.cumsum(900 + 300 * np.sin(np.pi * tt / tt[-1])) / SR) * np.sin(np.pi * tt / tt[-1]) ** 1.5
tmp = np.zeros(N); place(tmp, filt(wh, 'bp', (500, 2500)), 49.5); place(tmp, filt(wh, 'bp', (500, 2500)) * 0.7, 52.2); add(tmp, 0.4, 0.008, rev=0.7)
hi = np.sin(2 * np.pi * hz('E5') * t + 0.3 * np.sin(2 * np.pi * 5 * t)) * env([(0, 0), (45, 0), (49, 1), (58, 1), (60, 0)])
add(hi, 0, 0.004, rev=0.8)

add(hit(1.0, 0.07), 0, rev=0.6)

REV = filt(REV, 'high', 60)
L += signal.fftconvolve(REV, ir(3.2, 1))[:N] * 0.5; R += signal.fftconvolve(REV, ir(3.2, 2))[:N] * 0.5
mix = np.stack([L, R], 1)
mix *= env([(0, 0), (0.8, 1), (57.5, 1), (60.0, 0)])[:, None]
mix = filt(mix.T, 'high', 22).T
mix /= np.max(np.abs(mix))
a = np.abs(mix); thr = 0.6
mix = np.where(a > thr, np.sign(mix) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), mix)
mix /= np.max(np.abs(mix)); mix *= 10 ** (-1.2 / 20)
wavfile.write('out/bh1/soundtrack_raw.wav', SR, mix.astype(np.float32))
print('written')
