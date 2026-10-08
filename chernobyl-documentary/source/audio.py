# Sound design for the 55 s film, synthesized from scratch (48 kHz stereo).
import json, numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000; DUR = 55.0; N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(1986)

def env(points):
    xs, ys = zip(*points); return np.interp(t, xs, ys)
def filt(x, kind, f, order=2):
    if kind == 'bp': b, a = signal.butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], 'band')
    else: b, a = signal.butter(order, f / (SR / 2), kind)
    return signal.lfilter(b, a, x)
def noise(n=N): return rng.standard_normal(n)
def pink(n=N):
    w = rng.standard_normal(n)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; a = [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w) * 8
def brown(n=N):
    x = np.cumsum(rng.standard_normal(n)); x -= signal.lfilter([1], [1, -0.9995], x) * (1 - 0.9995)
    return filt(x, 'high', 15) / 40
def smoothrand(rate, n=N, seed=0):
    r = np.random.default_rng(seed); k = int(DUR * rate) + 4
    pts = r.standard_normal(k); xs = np.linspace(0, DUR, k)
    return np.interp(t, xs, pts)
def at(t0): return int(t0 * SR)
def place(buf, x, t0, gain=1.0):
    i = at(t0); j = min(N, i + len(x));
    if j > i: buf[i:j] += x[:j - i] * gain

L = np.zeros(N); R = np.zeros(N); REV = np.zeros(N)  # dry L/R and mono reverb send
def add(x, pan=0.0, gain=1.0, rev=0.0):
    global L, R, REV
    gl = np.cos((pan + 1) * np.pi / 4); gr = np.sin((pan + 1) * np.pi / 4)
    L += x * gain * gl * 1.4142; R += x * gain * gr * 1.4142; REV += x * gain * rev
def add_st(xl, xr, gain=1.0, rev=0.0):
    global L, R, REV
    L += xl * gain; R += xr * gain; REV += (xl + xr) * 0.5 * gain * rev

# ---------------- music: dark drone in D minor ----------------
def tone(freqs, amps, detune=0.12, n_h=5, seed=0):
    out = np.zeros(N); r = np.random.default_rng(seed)
    for f, a in zip(freqs, amps):
        for d in (-detune, detune):
            ph = r.uniform(0, 2 * np.pi)
            for h in range(1, n_h + 1):
                out += a / (h ** 1.6) * np.sin(2 * np.pi * (f + d) * h * t + ph * h)
    return out
drone = tone([36.71, 55.0, 73.42], [1.0, 0.7, 0.45], seed=1)
drone = filt(drone, 'low', 420)
drone *= 1 + 0.25 * smoothrand(0.4, seed=3)
tension = tone([77.78, 116.54], [0.5, 0.25], detune=0.2, seed=2)  # Eb2 / Bb2 rub against D
tension = filt(tension, 'low', 600)
dr_env = env([(0, 0), (3.0, 0.55), (9.0, 0.6), (13.5, 0.75), (16.8, 0.95), (16.86, 0.0), (17.45, 0.0), (18.5, 0.55), (37.8, 0.6), (38.05, 0.3), (46.5, 0.38), (49.0, 0.8), (53.0, 0.6), (55.0, 0.0)])
te_env = env([(0, 0), (9.5, 0), (12.0, 0.35), (16.8, 0.8), (16.86, 0), (20.0, 0), (24.0, 0.25), (38.0, 0.25), (38.05, 0.0), (47.0, 0.0), (49.0, 0.35), (54.5, 0.0)])
add(drone * dr_env * 0.065, 0, rev=0.25)
add(tension * te_env * 0.05, 0.15, rev=0.35)
# high airy pad (strings-like shimmer) in the aftermath and finale
air = filt(noise(), 'bp', (1800, 4200)) * (0.6 + 0.4 * smoothrand(0.3, seed=9))
air_env = env([(0, 0), (38.0, 0), (40.0, 0.5), (46.0, 0.4), (50.0, 0.7), (55.0, 0)])
add(air * air_env * 0.004, -0.2, rev=0.6)

# ---------------- wind ----------------
wl, wr = pink(), pink()
gust = 0.6 + 0.4 * np.tanh(smoothrand(0.25, seed=11))
wl = filt(wl, 'bp', (140, 900)) * gust; wr = filt(wr, 'bp', (140, 900)) * gust
w_env = env([(0, 0), (1.5, 0.5), (9.5, 0.5), (9.6, 0.15), (24.0, 0.1), (38.0, 0.12), (38.1, 0.75), (47.0, 0.7), (55.0, 0.0)])
add_st(wl * w_env, wr * w_env, 0.15, rev=0.1)

# ---------------- plant hum + steam (S2) ----------------
hum = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(100, 1), (200, 0.5), (300, 0.25), (400, 0.12)])
hum *= 1 + 0.1 * smoothrand(3, seed=21)
hum_env = env([(0, 0), (9.4, 0), (9.6, 0.6), (14.0, 0.7), (16.85, 0.9), (16.9, 0), (55, 0)])
add(filt(hum, 'low', 900) * hum_env * 0.013, 0.1, rev=0.2)
steam = filt(noise(), 'bp', (2500, 9000)) * (0.7 + 0.3 * smoothrand(1.5, seed=22))
st_env = env([(0, 0), (9.5, 0), (9.6, 0.4), (14.0, 0.4), (15.55, 0.4), (15.6, 1.4), (17.0, 0.8), (17.3, 0.0), (55, 0)])
add(steam * st_env * 0.01, 0.3, rev=0.2)

# ---------------- pre-explosion rumble + first explosion (S3) ----------------
rum = filt(brown(), 'low', 90)
rum_env = env([(0, 0), (14.0, 0), (15.5, 0.6), (15.55, 1.2), (16.8, 0.9), (16.85, 0), (55, 0)])
shudder = 1 + 0.5 * np.sin(2 * np.pi * 9 * t)
add(rum * rum_env * shudder * 0.09, 0, rev=0.2)
def boom(dur, f0, f1, decay, noise_lp=(3000, 150), noise_amt=1.0, seed=0):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt / (decay * 0.35))
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / decay)
    r = np.random.default_rng(seed); nz = r.standard_normal(n)
    # time-varying lowpass: blockwise
    out = np.zeros(n); blk = 2048; zi = None
    for k in range(0, n, blk):
        fc = noise_lp[1] + (noise_lp[0] - noise_lp[1]) * np.exp(-(k / SR) / (decay * 0.3))
        b, a = signal.butter(2, fc / (SR / 2), 'low')
        if zi is None: zi = signal.lfilter_zi(b, a) * 0
        out[k:k + blk], zi = signal.lfilter(b, a, nz[k:k + blk], zi=zi)
    out *= np.exp(-tt / (decay * 0.8)) * np.minimum(tt / 0.004, 1)
    return sub * 0.9 + out * noise_amt
b1 = boom(3.0, 70, 38, 0.7, (1500, 120), 0.8, seed=5)
tmp = np.zeros(N); place(tmp, b1, 15.55); add(tmp, 0, 0.2, rev=0.5)
hiss = filt(noise(int(1.6 * SR)), 'bp', (900, 6000)) * np.exp(-np.arange(int(1.6 * SR)) / SR / 0.5)
tmp = np.zeros(N); place(tmp, hiss, 15.6); add(tmp, 0.1, 0.05, rev=0.4)

# ---------------- main explosion: flash at 16.85, sound arrives 17.45 ----------------
b2 = boom(7.0, 55, 24, 2.4, (4000, 110), 1.3, seed=7)
tmp = np.zeros(N); place(tmp, b2, 17.45); add(tmp, 0, 0.3, rev=0.7)
# debris rain / crackle 17.5-22
def crackle(rate_env, bw=(800, 6000), seed=0, decay=0.004):
    r = np.random.default_rng(seed)
    imp = (r.random(N) < rate_env / SR).astype(float) * r.uniform(0.3, 1.0, N) * np.sign(r.standard_normal(N))
    k = np.exp(-np.arange(int(decay * 8 * SR)) / SR / decay)
    x = signal.fftconvolve(imp, k)[:N]
    return filt(x, 'bp', bw)
deb = crackle(env([(0, 0), (17.5, 0), (17.6, 400), (19.5, 120), (23.0, 15), (25, 0), (55, 0)]), (500, 5000), seed=8, decay=0.006)
add(deb, -0.2, 0.25, rev=0.4)
glass = crackle(env([(0, 0), (17.55, 0), (17.6, 300), (18.6, 30), (19.5, 0), (55, 0)]), (3000, 11000), seed=9, decay=0.002)
add(glass, 0.3, 0.12, rev=0.5)

# ---------------- fire: roar + crackle (S4-S7) ----------------
roar_l, roar_r = filt(brown(), 'low', 320), filt(brown(), 'low', 320)
mod = 0.7 + 0.3 * np.tanh(smoothrand(2.0, seed=31))
fire_env = env([(0, 0), (17.6, 0), (19.0, 0.6), (20.0, 0.8), (24.0, 0.8), (24.1, 1.0), (29.5, 1.0), (29.6, 0.7), (34.0, 0.7), (34.1, 1.1), (38.0, 1.1), (38.02, 0.0), (47.0, 0.0), (48, 0.12), (53, 0.1), (55, 0)])
add_st(roar_l * mod * fire_env, roar_r * mod * fire_env, 0.75, rev=0.15)
fc = crackle(env([(0, 0), (18, 0), (20, 40), (24, 60), (38, 70), (38.02, 0), (47, 0), (48, 6), (54, 4), (55, 0)]), (900, 7000), seed=32, decay=0.003)
add(fc, 0.1, 0.25, rev=0.2)
pops = crackle(env([(0, 0), (19, 0), (20, 3), (38, 4), (38.02, 0), (55, 0)]), (150, 2000), seed=33, decay=0.02)
add(pops, -0.1, 0.5, rev=0.3)

# ---------------- siren (distant, then closer in S5) ----------------
ph = np.cumsum(775 + 275 * np.sin(2 * np.pi * t / 3.6 - 1.2)) / SR
siren = sum(np.sin(2 * np.pi * h * ph) / h ** 1.3 for h in range(1, 6))
siren = filt(siren, 'low', 2200)
si_env = env([(0, 0), (20.5, 0), (22.5, 0.25), (24.0, 0.45), (29.5, 0.55), (29.6, 0.3), (34.0, 0.3), (38.0, 0.25), (38.02, 0), (55, 0)])
add(siren * si_env * 0.04, -0.4, rev=0.6)

# ---------------- footsteps on wet ground (S5) ----------------
steps = np.zeros(N)
r = np.random.default_rng(41)
for start, period, g0 in [(24.0, 0.35, 1.0), (24.5, 0.36, 0.8), (25.0, 0.34, 0.7), (24.2, 0.37, 0.5)]:
    k = 0
    while True:
        tt0 = start + k * period + r.uniform(-0.02, 0.02)
        if tt0 > 29.4: break
        dist = 1 + (tt0 - start) * 4.6
        n = int(0.18 * SR); x = r.standard_normal(n)
        thud = filt(x, 'bp', (120, 900)) * np.exp(-np.arange(n) / SR / 0.035)
        spl = filt(x, 'bp', (2000, 9000)) * np.exp(-np.arange(n) / SR / 0.07) * 0.6
        place(steps, (thud + spl) * g0 / (0.5 + dist * 0.12), tt0)
        k += 1
add(steps, 0.05, 0.25, rev=0.2)
# radio squelch bursts
for t0, d in [(25.6, 0.9), (31.2, 0.6), (35.4, 0.8)]:
    n = int(d * SR); x = filt(rng.standard_normal(n), 'bp', (400, 3200)) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 13 * np.arange(n) / SR)))
    x *= np.minimum(np.arange(n) / (0.01 * SR), 1) * np.minimum((n - np.arange(n)) / (0.03 * SR), 1)
    tmp = np.zeros(N); place(tmp, x, t0); add(tmp, 0.5, 0.02, rev=0.2)

# ---------------- breathing through a respirator (S6) ----------------
br = np.zeros(N)
for k in range(3):
    t0 = 29.8 + k * 1.45
    for (o, d, g, band) in [(0.0, 0.65, 0.8, (350, 1600)), (0.75, 0.6, 1.0, (250, 1300))]:
        n = int(d * SR); x = filt(rng.standard_normal(n), 'bp', band)
        e = np.sin(np.pi * np.arange(n) / n) ** 1.5
        place(br, x * e * g, t0 + o)
add(br, 0.0, 0.05, rev=0.05)
hb = np.zeros(N)
for k in range(6):
    for o, g in [(0, 1.0), (0.28, 0.6)]:
        n = int(0.25 * SR); x = np.sin(2 * np.pi * 48 * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / 0.06)
        place(hb, x * g, 29.7 + k * 0.78 + o)
add(hb, 0, 0.12, rev=0.05)

# ---------------- water jet + steam sizzle (S7) ----------------
jet = filt(noise(), 'bp', (1200, 9000)) * (0.8 + 0.2 * smoothrand(6, seed=51))
jet_env = env([(0, 0), (34.0, 0), (34.1, 1.0), (37.9, 1.0), (38.0, 0), (55, 0)])
add(jet * jet_env * 0.012, -0.25, rev=0.15)
sizzle = crackle(env([(0, 0), (34.2, 0), (34.5, 900), (38.0, 900), (38.02, 0), (55, 0)]), (3000, 12000), seed=52, decay=0.0015)
add(sizzle, 0.2, 0.06, rev=0.2)

# ---------------- Geiger counter ----------------
def geiger(rate_env, seed=0):
    r = np.random.default_rng(seed)
    imp = (r.random(N) < rate_env / SR).astype(float) * r.uniform(0.6, 1.0, N)
    k = np.exp(-np.arange(int(0.004 * SR)) / SR / 0.0006) * np.sin(2 * np.pi * 3100 * np.arange(int(0.004 * SR)) / SR)
    return filt(signal.fftconvolve(imp, k)[:N], 'high', 900)
gg = geiger(env([(0, 0), (24, 0), (25, 1.5), (34, 4), (38.0, 4), (38.1, 7), (43, 9), (47, 12), (51, 20), (53.5, 14), (54.6, 3), (55, 0)]), seed=61)
add(gg, 0.15, 0.12, rev=0.05)

# ---------------- aftermath: lamp buzz synced to flicker, swing creaks, gondola creaks ----------------
lamp = np.array(json.load(open('out/lamp_curve.json')))
li = np.zeros(N); i0, i1 = at(38.0), at(43.0)
li[i0:i1] = np.interp((np.arange(i1 - i0) / SR), np.arange(len(lamp)) / 1000, lamp)
buzz = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(100, 1), (200, 0.6), (300, 0.5), (500, 0.3), (700, 0.2)])
buzz += filt(noise(), 'bp', (2000, 6000)) * 0.4 * (li > 0.3)
add(buzz * li * 0.012, -0.35, rev=0.2)
pops2 = np.abs(np.diff(np.concatenate([[0], (li > 0.3).astype(float)])))
add(filt(signal.fftconvolve(pops2, np.exp(-np.arange(400) / 60) * rng.standard_normal(400))[:N], 'high', 1500), -0.35, 0.25, rev=0.3)
def creak(t0, f0=900, d=0.42, g=1.0, seed=0):
    r = np.random.default_rng(seed); n = int(d * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.15 * np.sin(2 * np.pi * 7 * tt) + 0.25 * tt / d)
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * r.random(n) ** 3)
    x = filt(x, 'bp', (500, 3500)) * np.sin(np.pi * tt / d) ** 2
    tmp = np.zeros(N); place(tmp, x * g, t0); return tmp
for k in range(3):
    tt0 = 38.0 + (np.pi / 2 + k * np.pi) / 1.5
    if tt0 < 42.8: add(creak(tt0, 820 + 90 * (k % 2), 0.45, 1.0, seed=70 + k), 0.25, 0.022, rev=0.5)
for tt0, f0 in [(43.6, 260), (45.2, 310), (46.4, 240)]:
    add(creak(tt0, f0, 0.8, 1.0, seed=int(tt0)), -0.1, 0.02, rev=0.7)

# ---------------- title hits ----------------
def hit(t0, g, decay=3.5, f0=48, f1=30, seed=0):
    n = int((decay * 2.2) * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt / 0.4)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (decay * 0.35)) * np.minimum(tt / 0.01, 1)
    body = sum(np.sin(2 * np.pi * 73.42 * h * tt + h) / h ** 1.2 for h in range(1, 8))
    body = filt(body, 'low', 500) * np.exp(-tt / (decay * 0.25)) * np.minimum(tt / 0.03, 1) * 0.3
    tmp = np.zeros(N); place(tmp, sub + body, t0); return tmp * g
add(hit(2.0, 0.13, 3.5, seed=81), 0, rev=0.6)
add(hit(9.9, 0.08, 2.8, seed=82), 0, rev=0.6)
add(hit(48.5, 0.22, 4.5, seed=83), 0, rev=0.7)

# ---------------- reverb (synthetic outdoor/hall IR) ----------------
def ir(sec, seed):
    r = np.random.default_rng(seed); n = int(sec * SR); tt = np.arange(n) / SR
    x = r.standard_normal(n) * np.exp(-tt / (sec / 6.9))
    x = filt(x, 'low', 5000) * 0.6 + filt(x, 'low', 1200) * 0.4
    for d, g in [(0.023, 0.5), (0.041, 0.35), (0.067, 0.3), (0.093, 0.2)]: x[int(d * SR)] += g * 3
    return x / np.sqrt(np.sum(x ** 2))
REV = filt(REV, 'high', 60)
rl = signal.fftconvolve(REV, ir(3.4, 1))[:N]; rr = signal.fftconvolve(REV, ir(3.4, 2))[:N]
L += rl * 0.55; R += rr * 0.55

# ---------------- master ----------------
mix = np.stack([L, R], 1)
mix *= env([(0, 0), (0.6, 1), (53.8, 1), (55.0, 0)])[:, None]
mix = filt(mix.T, 'high', 22).T
mix /= np.max(np.abs(mix))
thr = 0.55  # soft-knee peak limiting above about -5 dBFS
a = np.abs(mix)
mix = np.where(a > thr, np.sign(mix) * (thr + (1 - thr) * np.tanh((a - thr) / (1 - thr))), mix)
mix /= np.max(np.abs(mix)); mix *= 10 ** (-1.2 / 20)
wavfile.write('out/soundtrack_raw.wav', SR, mix.astype(np.float32))
print('written', mix.shape, 'peak', np.max(np.abs(mix)))
