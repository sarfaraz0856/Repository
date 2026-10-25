# Chapter III sound (helpers shared with audio2.py): score (string ensemble + piano in D minor) and sound design for the
# 60 s film, all synthesized (48 kHz stereo float WAV).
#   0-9   P1 dawn aerial       birds, wind, piano + pad
#   8-16  P2 Saturday street   birds, distant voices, a car, footsteps; warmer harmony
#   16-24 P3 reactor, Mi-8     rotor + turbine, wind, low tension cluster
#   24-32 P4 loudspeaker       PA chime and the announcement echoing between blocks
#   32-41 P5 the buses         idling diesels, crowd murmur, footsteps, door hiss; strings swell
#   41-49 P6 the convoy        buses passing below, one after another
#   48-60 P7 empty avenue      wind, laundry, faint Geiger clicks, last piano notes
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
SECS = [(0, 11), (11, 20), (20, 33), (33, 43), (43, 50), (50, 57), (57, 59)]
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
birdsong(0.6, 8.6, 0.6, 1, 0.012, -0.5); birdsong(1.5, 8.4, 0.4, 2, 0.008, 0.6)
birdsong(8.2, 16.0, 0.9, 3, 0.02, -0.3); birdsong(8.5, 16.0, 0.7, 4, 0.015, 0.5); birdsong(8.0, 16.0, 0.5, 5, 0.009, 0.0)
birdsong(24.2, 31.5, 0.4, 6, 0.008, 0.4)
birdsong(48.5, 58.0, 0.25, 7, 0.006, -0.4)


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
add(crowd(8.6, 16.0, 14, 21, 1600), -0.2, 0.012, rev=0.5)       # far-off voices on the avenue
add(crowd(32.2, 41.0, 60, 22, 2200), 0.1, 0.032, rev=0.45)        # the crowd at the buses
add(crowd(32.2, 41.0, 40, 23, 1500), -0.3, 0.022, rev=0.5)


def steps(t0, t1, period, gain, seed, bright=(1800, 7000)):
    r = np.random.default_rng(seed); buf = np.zeros(N); tt = t0
    while tt < t1:
        n = int(0.14 * SR); x = r.standard_normal(n)
        thud = filt(x, 'bp', (100, 700)) * np.exp(-np.arange(n) / SR / 0.025)
        scuff = filt(x, 'bp', bright) * np.exp(-np.arange(n) / SR / 0.04) * 0.5
        place(buf, (thud + scuff) * r.uniform(0.6, 1.0), tt); tt += period * r.uniform(0.95, 1.05)
    return buf
for k, (a, b, p, g) in enumerate([(9.0, 16.0, 0.55, 0.03), (9.3, 16.0, 0.52, 0.02), (10.0, 16.0, 0.6, 0.014)]):
    add(steps(a, b, p, g, 30 + k), -0.2 + k * 0.25, g * 2.0, rev=0.3)
for k in range(10):
    add(steps(32.3 + k * 0.13, 41.0, 0.5 + k * 0.02, 1.0, 40 + k), -0.6 + k * 0.13, 0.04, rev=0.35)


def engine(f_curve, rough=0.3, seed=0):
    r = np.random.default_rng(seed)
    ph = 2 * np.pi * np.cumsum(f_curve) / SR
    x = sum(np.sin(h * ph + r.uniform(0, 6)) / h ** 0.8 for h in range(1, 12))
    x *= 1 + rough * smoothrand(18, seed=seed + 1)
    return x
car_f = env([(0, 30), (60, 30)]) * (1 + 0.04 * smoothrand(1, seed=51))
car = engine(car_f, 0.25, 52) + filt(noise(seed=53), 'bp', (200, 2500)) * 0.8
car_env = env([(0, 0), (9.5, 0), (11.5, 0.2), (14.0, 0.8), (15.0, 1.0), (16.0, 0.0), (60, 0)])
add_pan(filt(car, 'low', 2500) * car_env, env([(0, -0.6), (11, -0.6), (16, 0.1), (60, 0.1)]), 0.012, rev=0.3)


def geiger(rate_env, seed=0):
    r = np.random.default_rng(seed)
    imp = (r.random(N) < rate_env / SR).astype(float) * r.uniform(0.6, 1.0, N)
    k = np.exp(-np.arange(int(0.004 * SR)) / SR / 0.0006) * np.sin(2 * np.pi * 3100 * np.arange(int(0.004 * SR)) / SR)
    return filt(signal.fftconvolve(imp, k)[:N], 'high', 900)
add(geiger(env([(0, 0), (16.5, 0), (17, 2), (24, 3), (24.1, 0), (49, 0), (50, 1.5), (56, 4), (58.5, 1), (60, 0)]), seed=130), 0.2, 0.1, rev=0.05)

def creak(t0, f0=300, d=0.9, seed=0):
    r = np.random.default_rng(seed); n = int(d * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.15 * np.sin(2 * np.pi * 6 * tt) + 0.2 * tt / d)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * r.random(n) ** 3)
    x = filt(x, 'bp', (400, 3000)) * np.sin(np.pi * tt / d) ** 2
    tmp = np.zeros(N); place(tmp, x, t0); return tmp
add(creak(51.4, 290, 0.9, 141), -0.3, 0.024, rev=0.8)
add(creak(54.8, 340, 0.8, 142), 0.4, 0.016, rev=0.8)


def hit(t0, g, decay=3.0, seed=0):
    n = int(decay * 2.2 * SR); tt = np.arange(n) / SR
    f = 30 + 18 * np.exp(-tt / 0.4)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (decay * 0.35)) * np.minimum(tt / 0.01, 1)
    tmp = np.zeros(N); place(tmp, sub, t0); return tmp * g
add(hit(2.2, 0.08), 0, rev=0.6)
add(hit(51.0, 0.1, 4.0), 0, rev=0.7)


def ir(sec, seed):
    r = np.random.default_rng(seed); n = int(sec * SR); tt = np.arange(n) / SR
    x = r.standard_normal(n) * np.exp(-tt / (sec / 6.9))
    x = filt(x, 'low', 5000) * 0.6 + filt(x, 'low', 1200) * 0.4
    for d, g in [(0.023, 0.5), (0.041, 0.35), (0.067, 0.3), (0.093, 0.2)]: x[int(d * SR)] += g * 3
    return x / np.sqrt(np.sum(x ** 2))
REV = filt(REV, 'high', 60)
L += signal.fftconvolve(REV, ir(3.0, 1))[:N] * 0.5; R += signal.fftconvolve(REV, ir(3.0, 2))[:N] * 0.5

# ================= THE LIQUIDATORS (60 s) =================
#  0-11 Q1 Mi-8 drop | 11-20 Q2 vehicle graveyard | 20-33 Q3 roof | 33-44 Q4 sarcophagus | 43-58 Q5 winter
CH3 = [(0.0, 11.0, ['D2', 'A2', 'D3', 'F3']), (11.0, 15.5, ['G2', 'D3', 'Bb3']), (15.5, 20.2, ['D2', 'A2', 'F3']),
       (33.0, 36.0, ['Bb2', 'F3', 'D4']), (36.0, 39.0, ['F2', 'C3', 'A3']), (39.0, 42.0, ['C3', 'G3', 'E4']), (42.0, 46.0, ['D3', 'A3', 'F4']),
       (46.0, 50.5, ['Bb2', 'F3', 'D4', 'F4']), (50.5, 57.5, ['D3', 'A3', 'F4', 'A4'])]
s_env = env([(0, 0), (1.5, 0.4), (10.5, 0.5), (11.2, 0.55), (19.6, 0.55), (20.3, 0.0), (32.8, 0.0), (34.5, 0.5), (41.5, 0.9), (44.0, 0.85), (51.0, 0.6), (56.0, 0.35), (59.0, 0)])
add(strings(CH3, s_env, bright=2300, seed=13), -0.15, 0.055, rev=0.55)
add(strings([(c[0], c[1], [n[:-1] + str(int(n[-1]) + 1) for n in c[2][1:]]) for c in CH3 if c[0] >= 33], env([(0, 0), (35, 0), (40, 0.4), (44, 0.55), (52, 0.3), (57, 0.12), (59, 0)]), bright=3200, seed=14), 0.25, 0.035, rev=0.65)
add(strings([(0, 20.2, ['D1']), (33.0, 57.5, ['D2'])], env([(0, 0), (2, 0.5), (19.5, 0.5), (20.3, 0), (33, 0), (36, 0.5), (56, 0.3), (59, 0)]), bright=700, seed=15), 0, 0.07, rev=0.3)
trem = 0.6 + 0.4 * np.sin(2 * np.pi * 8.0 * t) ** 2
add(strings([(20.0, 33.2, ['D2', 'Eb2', 'A2', 'Bb2', 'E3'])], env([(0, 0), (20.0, 0), (21.0, 0.6), (31.5, 0.9), (33.0, 0.2), (33.4, 0), (60, 0)]), bright=1400, seed=16, trem=trem), 0.1, 0.07, rev=0.4)
# pulse under the roof scene (a heartbeat-like low drum, 76 bpm)
hb = np.zeros(N)
for k in range(17):
    for o, g in [(0, 1.0), (0.26, 0.55)]:
        n = int(0.3 * SR); x = np.sin(2 * np.pi * 46 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / 0.07)
        place(hb, x * g, 20.2 + k * 60 / 76 + o)
add(hb, 0, 0.16, rev=0.15)
for t0, nm, v in [(44.5, 'A4', 0.45), (45.7, 'F4', 0.4), (46.9, 'D4', 0.45), (48.6, 'C5', 0.38), (50.2, 'Bb4', 0.4), (51.6, 'A4', 0.45), (53.2, 'F4', 0.4), (54.8, 'D4', 0.5), (54.82, 'D3', 0.32)]:
    piano(t0, nm, v, dur=6.0)
add(PIANO, 0.1, 0.08, rev=0.6)

# wind per scene
wl, wr = pink(seed=31), pink(seed=32)
gust = 0.6 + 0.4 * np.tanh(smoothrand(0.25, seed=33))
wl = filt(wl, 'bp', (150, 1000)) * gust; wr = filt(wr, 'bp', (150, 1000)) * gust
w_env = env([(0, 0), (1, 0.4), (11, 0.4), (11.2, 0.7), (20, 0.7), (20.2, 0.35), (33, 0.35), (33.2, 0.5), (43, 0.5), (44, 0.9), (57, 0.8), (59, 0)])
add_st(wl * w_env, wr * w_env, 0.12, rev=0.1)

# Q1: the Mi-8 close by, the second one far; the load hits the ruin (sound arrives ~2 s later)
heli = np.zeros(N); i0, i1 = 0, at(11.3); tt = t[i0:i1]
bp = 16.0 * (1 + 0.01 * np.sin(2 * np.pi * 0.3 * tt)); phase = np.cumsum(bp) / SR
slap = np.exp(-((phase % 1.0) * 12)) * (1 + 0.3 * np.sin(2 * np.pi * phase / 5))
body = filt(noise(i1 - i0, 41), 'low', 650) * slap * 2.6 + np.sin(2 * np.pi * np.cumsum(bp) / SR) * 0.6
whine = np.sin(2 * np.pi * 3150 * tt) * 0.08 + np.sin(2 * np.pi * 6290 * tt) * 0.03 + filt(noise(i1 - i0, 42), 'bp', (2500, 7000)) * 0.15
heli[i0:i1] = (filt(body, 'low', 1500) + whine) * np.minimum(1, tt / 0.6) * np.minimum(1, (11.3 - tt) / 0.4)
add_pan(heli, env([(0, -0.1), (11, -0.3), (60, -0.3)]), 0.085, rev=0.35)
def thud(t0, g, decay=1.6, seed=0):
    n = int(decay * 2.5 * SR); tt2 = np.arange(n) / SR
    f = 38 + 30 * np.exp(-tt2 / 0.15)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt2 / (decay * 0.3)) + filt(np.random.default_rng(seed).standard_normal(n), 'low', 900) * np.exp(-tt2 / 0.25) * 0.6
    x *= np.minimum(tt2 / 0.005, 1); tmp = np.zeros(N); place(tmp, x, t0); return tmp * g
add(thud(10.1, 0.3, 1.8, 51), 0.0, rev=0.7)

# Q2: an open field of dead machines: wind, metal ticking and a slow creak, crows far off
def caw(t0, seed):
    r = np.random.default_rng(seed); out = np.zeros(N)
    for k in range(r.integers(2, 4)):
        n = int(0.32 * SR); tt2 = np.arange(n) / SR
        src = signal.sawtooth(2 * np.pi * np.cumsum(560 + 120 * np.sin(np.pi * tt2 / 0.32)) / SR) + 0.5 * r.standard_normal(n)
        y = filt(src, 'bp', (900, 2200)) * np.sin(np.pi * tt2 / 0.32) ** 1.5
        place(out, y, t0 + k * 0.45)
    return out
for t0, s0 in [(12.4, 61), (15.8, 62), (18.3, 63)]: add(caw(t0, s0), 0.5 - (s0 % 2), 0.04, rev=0.8)
add(creak(13.6, 230, 1.2, 64), -0.3, 0.05, rev=0.8)
add(creak(17.2, 260, 0.9, 65), 0.4, 0.04, rev=0.8)

# Q3: the roof: boots on debris, breathing behind respirators, shovels, blocks hitting below
for k in range(6):
    st0 = 20.2 + 0.15 + k * 0.85
    add(steps(st0, 33.0, 0.31 + 0.01 * k, 1.0, 70 + k, bright=(1500, 8000)), -0.5 + k * 0.2, 0.08 / (1 + 0.3 * k), rev=0.25)
br = np.zeros(N)
for k in range(9):
    t0 = 20.6 + k * 1.35
    for (o, d, g, band) in [(0.0, 0.5, 0.8, (350, 1700)), (0.6, 0.5, 1.0, (250, 1300))]:
        n = int(d * SR); x = filt(rng.standard_normal(n), 'bp', band) * np.sin(np.pi * np.arange(n) / n) ** 1.5
        place(br, x * g, t0 + o)
add(br, 0.05, 0.06, rev=0.08)
for k, t0 in enumerate([23.1, 24.4, 25.6, 26.9, 28.3, 29.5, 31.0]):
    n = int(0.35 * SR); x = filt(noise(n, 80 + k), 'bp', (1200, 6000)) * np.exp(-np.arange(n) / SR / 0.12)
    tmp = np.zeros(N); place(tmp, x, t0); add(tmp, 0.3, 0.06, rev=0.3)
    add(thud(t0 + 1.4, 0.08, 0.8, 90 + k), 0.4, rev=0.5)
add(geiger(env([(0, 0), (0.5, 3), (10.8, 4), (11.0, 1), (19.8, 2), (20.2, 60), (32.8, 75), (33.0, 1), (43, 0.5), (44, 1.5), (57, 2.5), (59, 0)]), seed=95), 0.2, 0.12, rev=0.05)

# Q4: dusk at the site: crane diesels, distant clanks echoing off the walls
crane = engine(np.full(N, 32.0) * (1 + 0.02 * smoothrand(0.4, seed=101)), 0.4, 102)
add(filt(crane, 'low', 500) * env([(0, 0), (33, 0), (33.5, 1), (43, 1), (44, 0), (60, 0)]), -0.3, 0.0075, rev=0.4)
for k, t0 in enumerate([34.2, 36.1, 37.9, 40.3, 42.0]):
    n = int(1.2 * SR); tt2 = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * tt2) * a for f, a in [(612, 1), (1490, 0.5), (2730, 0.3), (3960, 0.15)]) * np.exp(-tt2 / 0.25) * np.minimum(tt2 / 0.002, 1)
    tmp = np.zeros(N); place(tmp, x, t0); add(tmp, -0.4 + 0.2 * k, 0.025, rev=0.9)

# title hits
add(hit(1.0, 0.08), 0, rev=0.6)
add(hit(51.5, 0.1, 4.0), 0, rev=0.7)

REV = filt(REV, 'high', 60)
L += signal.fftconvolve(REV, ir(3.0, 1))[:N] * 0.5; R += signal.fftconvolve(REV, ir(3.0, 2))[:N] * 0.5
mix = np.stack([L, R], 1)
mix *= env([(0, 0), (0.8, 1), (58.2, 1), (60.0, 0)])[:, None]
mix = filt(mix.T, 'high', 22).T
mix /= np.max(np.abs(mix))
thr = 0.55; a = np.abs(mix)
mix = np.where(a > thr, np.sign(mix) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), mix)
mix /= np.max(np.abs(mix)); mix *= 10 ** (-1.2 / 20)
wavfile.write('out/part3/soundtrack_raw.wav', SR, mix.astype(np.float32))
print('written', mix.shape)
print('line   S1     S2     S3     S4     S5     S6     S7')
for ln, v in STATS: print(str(ln).ljust(5), '  '.join('%6.1f' % x for x in v))
