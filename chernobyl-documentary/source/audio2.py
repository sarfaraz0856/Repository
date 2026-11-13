# Part II sound: score (string ensemble + piano in D minor) and sound design for the
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
SECS = [(0, 8), (8, 16), (16, 24), (24, 32), (32, 41), (41, 49), (49, 58)]
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

# score: chords (t0, t1, notes)
CH = [
    (0.0, 4.2, ['D3', 'A3', 'F4']), (4.2, 8.4, ['Bb2', 'F3', 'D4']),
    (8.4, 12.2, ['F3', 'C4', 'A4']), (12.2, 16.0, ['C3', 'G3', 'E4']),
    (24.4, 32.2, ['G2', 'D3', 'Bb3']),
    (32.2, 34.6, ['D3', 'A3', 'F4']), (34.6, 37.0, ['G2', 'D3', 'Bb3', 'G4']), (37.0, 39.4, ['Bb2', 'F3', 'D4']), (39.4, 41.6, ['A2', 'E3', 'C#4' if False else 'Db4']),
    (41.6, 44.0, ['D3', 'A3', 'F4', 'D5']), (44.0, 46.4, ['Bb2', 'F3', 'D4', 'F5']), (46.4, 48.8, ['F2', 'C3', 'A3', 'C5']), (48.8, 51.6, ['A2', 'E3', 'Db4', 'E5']),
    (51.6, 58.5, ['D3', 'A3', 'F4', 'A5']),
]
s_env = env([(0, 0), (1.0, 0.45), (8.0, 0.5), (9.0, 0.6), (15.6, 0.6), (16.2, 0.0), (24.3, 0.0), (26.0, 0.28), (31.8, 0.3), (32.4, 0.55),
             (41.0, 0.8), (46.0, 0.95), (49.0, 1.0), (52.0, 0.55), (57.0, 0.32), (59.5, 0.0), (60, 0)])
add(strings(CH, s_env, bright=2400, seed=3), -0.15, 0.055, rev=0.55)
# a second, higher desk in the swell (octave doubling) for width
CH_hi = [(c[0], c[1], [n[:-1] + str(int(n[-1]) + 1) for n in c[2][1:]]) for c in CH if c[0] >= 32]
add(strings(CH_hi, env([(0, 0), (34.0, 0), (38.0, 0.35), (46.0, 0.55), (50.0, 0.5), (53.0, 0.25), (56.0, 0.15), (59.0, 0)]), bright=3200, seed=4), 0.25, 0.035, rev=0.65)
# basses: long low D pedal under P1 and the finale
bass = strings([(0.0, 8.4, ['D2']), (8.4, 16.0, ['F2']), (32.2, 41.6, ['D2']), (41.6, 51.6, ['D2']), (51.6, 58.5, ['D2'])],
               env([(0, 0), (2, 0.4), (15.6, 0.4), (16.2, 0), (32, 0), (34, 0.5), (49, 0.7), (58, 0.35), (60, 0)]), bright=900, seed=5)
add(bass, 0, 0.06, rev=0.3)
# P3 tension: low cluster with bowed tremolo
trem = 0.6 + 0.4 * np.sin(2 * np.pi * 7.5 * t) ** 2
ten = strings([(16.0, 24.2, ['D2', 'Eb2', 'A2', 'Bb2'])], env([(0, 0), (16.0, 0), (17.5, 0.5), (22.0, 0.8), (24.0, 0.3), (24.4, 0), (60, 0)]), bright=1100, seed=6, trem=trem)
add(ten, 0.1, 0.07, rev=0.4)
# piano: sparse motif
for t0, nm, v in [(1.2, 'A4', 0.55), (2.4, 'F4', 0.45), (3.6, 'E4', 0.45), (4.8, 'D4', 0.6), (6.6, 'C5', 0.4), (7.4, 'A4', 0.45),
                  (9.2, 'C5', 0.5), (10.2, 'A4', 0.42), (11.2, 'F4', 0.45), (12.6, 'G4', 0.45), (13.6, 'E4', 0.45), (14.6, 'C4', 0.5),
                  (33.0, 'D5', 0.42), (34.8, 'Bb4', 0.4), (37.2, 'F4', 0.42), (39.6, 'E4', 0.45),
                  (42.0, 'A4', 0.5), (43.2, 'F4', 0.42), (44.4, 'D4', 0.45), (46.6, 'C5', 0.42), (49.0, 'E4', 0.45), (50.2, 'Db4', 0.4),
                  (52.6, 'A4', 0.45), (54.0, 'F4', 0.4), (55.6, 'D4', 0.55), (55.62, 'D3', 0.35)]:
    piano(t0, nm, v, dur=6.0)
add(PIANO, 0.1, 0.08, rev=0.6)

# ---------------- wind (always present, shaped per scene) ----------------
wl, wr = pink(seed=11), pink(seed=12)
gust = 0.6 + 0.4 * np.tanh(smoothrand(0.25, seed=13))
wl = filt(wl, 'bp', (150, 1000)) * gust; wr = filt(wr, 'bp', (150, 1000)) * gust
w_env = env([(0, 0), (1.5, 0.35), (8.0, 0.35), (9.0, 0.15), (16.0, 0.15), (16.2, 0.55), (24.0, 0.5), (24.2, 0.2), (41.0, 0.2), (41.2, 0.45), (48.0, 0.45), (49.5, 0.6), (58.0, 0.5), (60, 0)])
add_st(wl * w_env, wr * w_env, 0.12, rev=0.1)

# ---------------- birds ----------------
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

# ---------------- voices (wordless: voiced formant babble) ----------------
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

# ---------------- footsteps ----------------
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

# ---------------- a car passing on the avenue (P2) ----------------
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

# ---------------- Mi-8 (P3): blade slap, gearbox, turbine whine; crosses left to right ----------------
heli = np.zeros(N)
i0, i1 = at(16.0), at(24.2); tt = t[i0:i1] - 16.0
bp = 16.0 * (1 + 0.01 * np.sin(2 * np.pi * 0.3 * tt))           # 5 blades x 192 rpm
phase = np.cumsum(bp) / SR
slap = np.exp(-((phase % 1.0) * 12) ) * (1 + 0.3 * np.sin(2 * np.pi * phase / 5))
body = filt(noise(i1 - i0, 61), 'low', 600) * slap * 2.5 + np.sin(2 * np.pi * np.cumsum(bp) / SR) * 0.6
whine = np.sin(2 * np.pi * 3150 * (1 + 0.004 * np.sin(2 * np.pi * 0.5 * tt)) * tt) * 0.08 + np.sin(2 * np.pi * 6290 * tt) * 0.03
whine += filt(noise(i1 - i0, 62), 'bp', (2500, 7000)) * 0.15
dist = np.clip(1.0 - np.abs(tt - 4.8) / 7.0, 0.25, 1.0)
heli[i0:i1] = (filt(body, 'low', 1400) + whine * dist) * np.minimum(1, tt / 0.5) * np.minimum(1, (8.2 - tt) / 0.3) * dist
add_pan(heli, env([(0, -0.7), (16.0, -0.7), (24.0, 0.6), (60, 0.6)]), 0.09, rev=0.35)

# ---------------- PA chime + the announcement echoing between the blocks (P4) ----------------
def bell(f, d=1.6, seed=0):
    n = int(d * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * m * tt) * a * np.exp(-tt / (0.9 / m ** 0.5)) for m, a in [(1, 1), (2.0, 0.35), (3.01, 0.15), (4.2, 0.06)])
    return x * np.minimum(tt / 0.004, 1)
def horn(x):  # small horn loudspeaker: band-limited, a little distorted
    y = filt(x, 'bp', (420, 3600), 2)
    return np.tanh(y * 2.2) / 2.2
pa = np.zeros(N)
for k, f in enumerate([783.99, 659.25, 523.25]):
    place(pa, bell(f, 1.8, k), 25.0 + k * 0.62, 0.8)
ann = np.zeros(N)
for s0, d in [(27.0, 1.6), (28.8, 1.3), (30.3, 1.4)]:
    ann += voice(s0, d, f0=112, seed=int(s0 * 10), syl=4.8)
pa += ann * 0.9
pa = horn(pa)
echo = np.zeros(N)
for dl, g in [(0.0, 1.0), (0.13, 0.45), (0.29, 0.32), (0.52, 0.22), (0.81, 0.12)]:
    echo[at(dl):] += pa[:N - at(dl)] * g
pa_env = env([(0, 0), (24.8, 0), (25.0, 1), (32.0, 1), (32.3, 0), (60, 0)])
add(echo * pa_env, 0.15, 0.13, rev=0.7)

# ---------------- buses: idling diesels and door hiss (P5), passing column (P6) ----------------
idle = np.zeros(N)
for k in range(5):
    f = 34 * (1 + 0.03 * k) * (1 + 0.02 * smoothrand(0.5, seed=70 + k))
    idle += engine(f, 0.45, 80 + k) * (1.0 / (1 + k * 0.6))
idle = filt(idle, 'low', 700) + filt(noise(seed=90), 'bp', (80, 400)) * 0.6
id_env = env([(0, 0), (32.1, 0), (32.3, 1.0), (40.8, 1.0), (41.0, 0.0), (60, 0)])
add_st(idle * id_env, filt(idle, 'low', 500) * id_env, 0.014, rev=0.2)
for t0 in [33.8, 36.9, 39.2]:
    n = int(0.7 * SR); x = filt(noise(n, int(t0)), 'bp', (1500, 7000)) * np.exp(-np.arange(n) / SR / 0.25) * np.minimum(np.arange(n) / (0.01 * SR), 1)
    tmp = np.zeros(N); place(tmp, x, t0); add(tmp, 0.4, 0.02, rev=0.3)
col = np.zeros(N)
tl = np.clip(t - 41.0, 0, None)
for k in range(14):                                   # the column approaching the camera (as in P6)
    sk = 70 + 21 * k - 8.0 * tl                        # bus position along the avenue, camera at s = -60
    d = np.sqrt((sk + 60) ** 2 + 34.0 ** 2)
    g = (34.0 / d) ** 1.3
    dop = 1 + 8.0 * (sk + 60) / d / 340
    col += engine(70 * (1 + 0.015 * k) * dop, 0.35, 100 + k) * g
col = filt(col, 'low', 1200) + filt(noise(seed=110), 'bp', (150, 1500)) * 0.25 * env([(0, 0), (41.0, 0), (41.5, 1), (48.5, 1), (49.2, 0), (60, 0)])
add(col * env([(0, 0), (41.0, 0), (41.4, 1), (48.4, 1), (49.4, 0), (60, 0)]), 0.0, 0.019, rev=0.25)

# ---------------- empty city (P7): laundry flutter, a distant creak, Geiger ----------------
flap = filt(noise(seed=120), 'bp', (300, 2500)) * (0.5 + 0.5 * np.tanh(3 * smoothrand(3, seed=121)))
add(flap * env([(0, 0), (48.5, 0), (50, 0.6), (58, 0.5), (60, 0)]), 0.5, 0.008, rev=0.3)
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

# ---------------- title hits (soft, low) ----------------
def hit(t0, g, decay=3.0, seed=0):
    n = int(decay * 2.2 * SR); tt = np.arange(n) / SR
    f = 30 + 18 * np.exp(-tt / 0.4)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (decay * 0.35)) * np.minimum(tt / 0.01, 1)
    tmp = np.zeros(N); place(tmp, sub, t0); return tmp * g
add(hit(2.2, 0.08), 0, rev=0.6)
add(hit(51.0, 0.1, 4.0), 0, rev=0.7)

# ---------------- reverb ----------------
def ir(sec, seed):
    r = np.random.default_rng(seed); n = int(sec * SR); tt = np.arange(n) / SR
    x = r.standard_normal(n) * np.exp(-tt / (sec / 6.9))
    x = filt(x, 'low', 5000) * 0.6 + filt(x, 'low', 1200) * 0.4
    for d, g in [(0.023, 0.5), (0.041, 0.35), (0.067, 0.3), (0.093, 0.2)]: x[int(d * SR)] += g * 3
    return x / np.sqrt(np.sum(x ** 2))
REV = filt(REV, 'high', 60)
L += signal.fftconvolve(REV, ir(3.0, 1))[:N] * 0.5; R += signal.fftconvolve(REV, ir(3.0, 2))[:N] * 0.5

# ---------------- master ----------------
mix = np.stack([L, R], 1)
mix *= env([(0, 0), (0.8, 1), (58.4, 1), (60.0, 0)])[:, None]
mix = filt(mix.T, 'high', 22).T
mix /= np.max(np.abs(mix))
thr = 0.55
a = np.abs(mix)
mix = np.where(a > thr, np.sign(mix) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), mix)
mix /= np.max(np.abs(mix)); mix *= 10 ** (-1.2 / 20)
wavfile.write('out/part2/soundtrack_raw.wav', SR, mix.astype(np.float32))
print('written', mix.shape, 'peak', float(np.max(np.abs(mix))))
print('line   P1     P2     P3     P4     P5     P6     P7')
for ln, v in STATS: print(str(ln).ljust(5), '  '.join('%6.1f' % x for x in v))
