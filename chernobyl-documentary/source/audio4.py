# Chapter IV sound (helpers shared with audio2.py): score (string ensemble + piano in D minor) and sound design for the
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

SR = 48000; DUR = 65.0; N = int(SR * DUR)
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
SECS = [(0, 11), (11, 23), (23, 35), (35, 47), (47, 63)]
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


# ================= THE SILENCE (60 s) =================
#  0-11 R1 night checkpoint | 11-23 R2 May Day | 23-35 R3 basement | 35-47 R4 village | 47-58 R5 the fire dies
CH4 = [(0.0, 11.2, ['D2', 'A2', 'F3']), (35.0, 39.0, ['G2', 'D3', 'Bb3']), (39.0, 43.0, ['Eb3', 'Bb3', 'G4']), (43.0, 47.2, ['D3', 'A3', 'F4']),
       (47.0, 53.0, ['Bb2', 'F3', 'D4']), (53.0, 63.0, ['D2', 'A2', 'D3', 'F3'])]
add(strings(CH4, env([(0, 0), (1.5, 0.45), (10.6, 0.45), (11.2, 0), (35, 0), (36.5, 0.55), (46.5, 0.6), (48, 0.5), (56, 0.45), (60, 0.3), (63.5, 0)]), bright=2200, seed=21), -0.1, 0.055, rev=0.55)
trem = 0.6 + 0.4 * np.sin(2 * np.pi * 7.0 * t) ** 2
add(strings([(23.0, 35.2, ['C2', 'Db2', 'G2', 'Ab2'])], env([(0, 0), (23, 0), (24, 0.6), (34, 0.9), (35.1, 0), (60, 0)]), bright=1200, seed=22, trem=trem), 0.1, 0.07, rev=0.4)
add(strings([(0, 11.2, ['D1']), (47, 63.0, ['D1'])], env([(0, 0), (2, 0.5), (10.8, 0.5), (11.2, 0), (47, 0), (49, 0.5), (61, 0.3), (64, 0)]), bright=600, seed=23), 0, 0.07, rev=0.3)
for t0, nm, v in [(36.0, 'D5', 0.4), (37.4, 'Bb4', 0.38), (38.8, 'G4', 0.4), (40.4, 'Eb5', 0.35), (41.8, 'D5', 0.4), (43.4, 'A4', 0.4), (45.0, 'F4', 0.42),
                  (49.0, 'D4', 0.4), (51.5, 'F4', 0.35), (54.0, 'D4', 0.45), (56.5, 'A4', 0.38), (58.0, 'F4', 0.36), (59.6, 'D4', 0.45), (59.62, 'D3', 0.3)]:
    piano(t0, nm, v, dur=6.0)
add(PIANO, 0.1, 0.08, rev=0.6)

wl, wr = pink(seed=41), pink(seed=42)
gust = 0.6 + 0.4 * np.tanh(smoothrand(0.25, seed=43))
wl = filt(wl, 'bp', (150, 900)) * gust; wr = filt(wr, 'bp', (150, 900)) * gust
w_env = env([(0, 0), (1, 0.35), (11, 0.35), (11.2, 0.1), (23, 0.1), (23.2, 0), (35, 0), (35.2, 0.45), (47, 0.45), (47.2, 0.3), (62, 0.25), (64.5, 0)])
add_st(wl * w_env, wr * w_env, 0.12, rev=0.1)

# R1: spring night: frogs in the marsh, the far rumble of the fire, a crackle of militia radio
frogs = np.zeros(N); r = np.random.default_rng(51)
for k in range(140):
    t0 = r.uniform(0, 10.8); f0 = r.uniform(700, 1500); n = int(r.uniform(0.05, 0.12) * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f0 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * r.uniform(25, 45) * tt))) * np.sin(np.pi * tt / tt[-1])
    place(frogs, filt(x, 'bp', (500, 3000)) * r.uniform(0.2, 1.0), t0)
add(frogs, 0.3, 0.012, rev=0.6)
rum = filt(brown(seed=52), 'low', 120) * env([(0, 0), (0.5, 1), (10.8, 1), (11.2, 0), (60, 0)])
add(rum, 0, 0.05, rev=0.3)
for t0, d in [(4.2, 0.9), (8.1, 0.7)]:
    n = int(d * SR); x = filt(rng.standard_normal(n), 'bp', (400, 3200)) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 13 * np.arange(n) / SR)))
    x *= np.minimum(np.arange(n) / (0.01 * SR), 1) * np.minimum((n - np.arange(n)) / (0.03 * SR), 1)
    tmp = np.zeros(N); place(tmp, x, t0); add(tmp, -0.4, 0.015, rev=0.3)

# R2: a brass band march in B-flat, echoing down the avenue; crowd and feet
band = np.zeros(N); bpm = 112; beat = 60 / bpm
def brass(f, d, g, seed):
    n = int(d * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt + h) / h ** 1.1 for h in range(1, 10)) * np.minimum(tt / 0.03, 1) * np.exp(-tt / (d * 1.2))
    return filt(x, 'low', 2400) * g
mel = ['F4', 'Bb4', 'D5', 'F5', 'D5', 'C5', 'Bb4', 'C5', 'D5', 'Eb5', 'F5', 'D5', 'C5', 'A4', 'Bb4', 'F4']
for k in range(int(12.0 / beat)):
    t0 = 11.0 + k * beat
    place(band, brass(hz('Bb1') if k % 2 == 0 else hz('F2'), beat * 0.8, 1.0, k), t0)                    # tuba oom
    if k % 2: place(band, brass(hz('D3'), beat * 0.45, 0.5, k) + brass(hz('F3'), beat * 0.45, 0.5, k), t0)  # pah
    place(band, brass(hz(mel[k % len(mel)]), beat * 0.9, 0.55, k + 100), t0)
    n = int(0.12 * SR); sn = filt(rng.standard_normal(n), 'bp', (1500, 7000)) * np.exp(-np.arange(n) / SR / 0.04)
    if k % 2 == 1: place(band, sn * 0.9, t0)
band = filt(band, 'low', 3000)
add(band * env([(0, 0), (11, 0), (11.4, 1), (22.6, 1), (23, 0), (60, 0)]), -0.2, 0.025, rev=0.6)
add(crowd(11.0, 23.0, 70, 61, 2200), 0.1, 0.03, rev=0.5)
for k in range(8): add(steps(11.0 + k * 0.07, 23.0, 0.54, 1.0, 62 + k), -0.6 + k * 0.17, 0.025, rev=0.35)

# R3: the basement: wading, drips, breathing, a deep hum, the Geiger counter racing
slosh = np.zeros(N)
for k in range(3):
    tt0 = 23.2 + k * 0.4
    while tt0 < 35:
        n = int(0.45 * SR); x = filt(noise(n, int(tt0 * 100) + k), 'bp', (200, 2500)) * np.sin(np.pi * np.arange(n) / n) ** 2
        place(slosh, x, tt0); tt0 += 1.4 + 0.1 * k
add(slosh, 0.0, 0.05, rev=0.6)
drips = np.zeros(N); r = np.random.default_rng(71)
for k in range(28):
    t0 = r.uniform(23, 35); n = int(0.06 * SR); tt = np.arange(n) / SR
    place(drips, np.sin(2 * np.pi * r.uniform(900, 1700) * tt * (1 + 3 * tt)) * np.exp(-tt / 0.012), t0)
add(drips, 0.3, 0.02, rev=0.9)
br = np.zeros(N)
for k in range(8):
    t0 = 23.4 + k * 1.45
    for (o, d, g, band_) in [(0.0, 0.55, 0.8, (350, 1700)), (0.65, 0.55, 1.0, (250, 1300))]:
        n = int(d * SR); x = filt(rng.standard_normal(n), 'bp', band_) * np.sin(np.pi * np.arange(n) / n) ** 1.5
        place(br, x * g, t0 + o)
add(br, 0.0, 0.06, rev=0.15)
hum = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(50, 1), (100, 0.5), (150, 0.25)])
add(filt(hum, 'low', 400) * env([(0, 0), (23, 0), (23.3, 1), (34.8, 1), (35, 0), (60, 0)]), 0, 0.012, rev=0.5)
add(geiger(env([(0, 0), (23, 0), (23.2, 25), (34.8, 60), (35, 0), (47, 0), (48, 1), (61, 1), (62.5, 0), (65, 0)]), seed=72), 0.2, 0.1, rev=0.1)

# R4: the village: birds that do not know, a dog far away, a gate swinging
birdsong(35.2, 46.8, 0.9, 81, 0.02, -0.4); birdsong(35.5, 46.8, 0.6, 82, 0.014, 0.5)
def bark(t0, seed):
    r = np.random.default_rng(seed); out = np.zeros(N)
    for k in range(r.integers(2, 4)):
        n = int(0.18 * SR); tt = np.arange(n) / SR
        src = signal.sawtooth(2 * np.pi * np.cumsum(420 - 200 * tt / 0.18) / SR) + 0.6 * r.standard_normal(n)
        place(out, filt(src, 'bp', (400, 1800)) * np.exp(-tt / 0.06), t0 + k * 0.32)
    return filt(out, 'low', 1500)
add(bark(38.6, 83), 0.6, 0.04, rev=0.9); add(bark(43.9, 84), 0.6, 0.032, rev=0.9)
add(creak(40.8, 330, 1.0, 85), -0.4, 0.03, rev=0.7)

# R5: the core dies down: a last crackle fading, night wind
fc = np.zeros(N); r = np.random.default_rng(91)
for k in range(80):
    t0 = 47 + r.exponential(2.0)
    if t0 > 60: continue
    n = int(0.02 * SR); place(fc, filt(r.standard_normal(n), 'bp', (800, 5000)) * np.exp(-np.arange(n) / SR / 0.004) * r.uniform(0.2, 1), t0)
add(fc, 0.2, 0.06, rev=0.4)

add(hit(1.0, 0.08), 0, rev=0.6)
add(hit(55.5, 0.1, 4.0), 0, rev=0.7)

REV = filt(REV, 'high', 60)
L += signal.fftconvolve(REV, ir(3.0, 1))[:N] * 0.5; R += signal.fftconvolve(REV, ir(3.0, 2))[:N] * 0.5
mix = np.stack([L, R], 1)
mix *= env([(0, 0), (0.8, 1), (63.2, 1), (65.0, 0)])[:, None]
mix = filt(mix.T, 'high', 22).T
mix /= np.max(np.abs(mix))
thr = 0.55; a = np.abs(mix)
mix = np.where(a > thr, np.sign(mix) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), mix)
mix /= np.max(np.abs(mix)); mix *= 10 ** (-1.2 / 20)
wavfile.write('out/part4/soundtrack_raw.wav', SR, mix.astype(np.float32))
print('written')
print('line   S1     S2     S3     S4     S5')
for ln, v in STATS: print(str(ln).ljust(5), '  '.join('%6.1f' % x for x in v))
