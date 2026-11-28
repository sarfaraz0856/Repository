# Fukushima chapter score and sound, all synthesised.
# Usage: python3 fk_audio.py SPEC.json OUT.wav
#   SPEC: {"dur": s, "key": 0..11 (semitones above D), "mood": "calm|tense|dark|hope", "amb": ["sea","wind","room","night","birds"],
#          "events": [["quake", t, dur], ["wave", t, dur], ["boom", t, size], ["heli", t, dur], ["alarm", t, dur],
#                     ["spray", t, dur], ["hit", t], ["riser", t, dur], ["tick", t, dur]]}
import sys, json, numpy as np
from scipy import signal
from scipy.io import wavfile
SP = json.load(open(sys.argv[1])); OUT = sys.argv[2]
SR = 48000; DUR = SP['dur']; N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(311)
def env(p): xs, ys = zip(*p); return np.interp(t, xs, ys)
def lp(x, f, o=2): b, a = signal.butter(o, min(f, SR / 2.2) / (SR / 2)); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f0, f1): b, a = signal.butter(2, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def pink(n):
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; a = [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, noise(n)) * 8
def brown(n): x = np.cumsum(noise(n)); return hp(x, 15) / 60
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def slow(rate, n, seed):
    r = np.random.default_rng(seed); k = int(n / SR * rate) + 4
    return np.interp(np.arange(n) / SR, np.linspace(0, n / SR, k), r.standard_normal(k))
L = np.zeros(N); R = np.zeros(N)
def add(x, t0=0.0, pan=0.0, g=1.0):
    i = int(t0 * SR); m = min(N - i, len(x))
    if m <= 0: return
    gl = np.cos((pan + 1) * np.pi / 4) * 1.414; gr = np.sin((pan + 1) * np.pi / 4) * 1.414
    L[i:i + m] += x[:m] * g * gl; R[i:i + m] += x[:m] * g * gr
def fade(n, a=0.5, b=0.5):
    e = np.ones(n); na, nb = int(a * SR), int(b * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nb: e[-nb:] = np.minimum(e[-nb:], np.linspace(1, 0, nb))
    return e
K = SP.get('key', 0); mood = SP.get('mood', 'tense')
# ---- pad: a slow minor progression of detuned saws, low-passed, for the whole chapter
PROG = {'calm': [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 60]],
        'tense': [[50, 57, 60, 65], [49, 56, 61, 64], [46, 53, 58, 61], [45, 52, 57, 61]],
        'dark': [[38, 50, 53, 57], [37, 49, 52, 56], [34, 46, 49, 53], [36, 48, 51, 55]],
        'hope': [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]}[mood]
seg = 7.5; s0 = 0.0; k = 0; padL = np.zeros(N); padR = np.zeros(N)
while s0 < DUR:
    i0 = int(s0 * SR); i1 = min(N, int((s0 + seg + 1.2) * SR)); n = i1 - i0; tt = np.arange(n) / SR
    e = np.minimum(1, tt / 1.2) * np.clip((seg + 1.2 - tt) / 1.2, 0, 1)
    for j, m in enumerate(PROG[k % 4]):
        for d, side in [(-0.08, 0), (0.09, 1)]:
            x = signal.sawtooth(2 * np.pi * hz(m + K + d) * tt + j) * e * (0.05 if m < 45 else 0.035)
            (padL if side == 0 else padR)[i0:i1] += x
    s0 += seg; k += 1
cut = {'calm': 1400, 'tense': 1100, 'dark': 800, 'hope': 1800}[mood]
padL = lp(lp(padL, cut), cut * 1.3); padR = lp(lp(padR, cut), cut * 1.3)
pe = env([(0, 0), (2.5, 0.8), (DUR - 2.5, 1.0), (DUR, 0.3)])
L += padL * pe; R += padR * pe
# low drone
dr = np.sin(2 * np.pi * hz(26 + K) * t) * 0.09 + np.sin(2 * np.pi * hz(38 + K) * t) * 0.05
add(lp(dr * (0.6 + 0.4 * slow(0.2, N, 3)), 200) * pe, 0, 0, 0.9)
# a soft piano-like motif for calm/hope
if mood in ('calm', 'hope'):
    notes = [62, 65, 69, 67, 65, 64, 62, 57]
    for q in range(int(DUR / 1.6)):
        m = notes[q % len(notes)] + K + 12; n = int(3.2 * SR); tt = np.arange(n) / SR
        x = (np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(4 * np.pi * hz(m) * tt)) * np.exp(-tt * 1.6) * 0.05
        add(x, 1.0 + q * 1.6, pan=0.3 * np.sin(q), g=1.0)
# ---- ambience beds
for a in SP.get('amb', []):
    if a == 'sea':
        w = lp(pink(N), 900) * (0.5 + 0.5 * np.clip(np.sin(2 * np.pi * t / 7.0) * 0.8 + slow(0.3, N, 5) * 0.4, -1, 1)) * 0.06
        add(w, 0, -0.3); add(lp(pink(N), 1400) * 0.025, 0, 0.4)
    if a == 'wind': add(bp(pink(N), 200, 1400) * (0.5 + 0.5 * np.abs(slow(0.25, N, 7))) * 0.05, 0, 0.2)
    if a == 'room':
        h = (np.sin(2 * np.pi * 50 * t) * 0.6 + np.sin(2 * np.pi * 100 * t) * 0.3 + np.sin(2 * np.pi * 150 * t) * 0.15) * 0.012
        add(h, 0, 0); add(hp(noise(N), 3000) * 0.004, 0, 0)
    if a == 'night':
        cr = np.zeros(N)
        for q in range(int(DUR * 3)):
            i = int(rng.uniform(0, DUR) * SR); n = int(0.08 * SR); tt = np.arange(n) / SR
            cr[i:i + n] += (np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 30 * tt) > 0))[:max(0, min(n, N - i))] * 0.01
        add(cr, 0, 0.5); add(lp(pink(N), 400) * 0.02, 0, 0)
    if a == 'birds':
        for q in range(int(DUR / 3)):
            n = int(0.25 * SR); tt = np.arange(n) / SR; f0 = rng.uniform(2500, 4200)
            x = np.sin(2 * np.pi * (f0 + 900 * np.sin(2 * np.pi * 12 * tt)) * tt) * np.exp(-tt * 9) * 0.012
            add(x, rng.uniform(0, DUR - 1), rng.uniform(-0.8, 0.8))
# ---- events
for ev in SP.get('events', []):
    kind, t0 = ev[0], ev[1]
    if kind == 'quake':
        d = ev[2]; n = int(d * SR); tt = np.arange(n) / SR
        e = np.minimum(1, tt / 2.0) ** 2 * np.clip((d - tt) / 3.0, 0, 1) * (0.7 + 0.3 * slow(1.5, n, 11))
        add(lp(brown(n), 90) * e * 1.6, t0, 0); add(lp(brown(n), 300) * e * 0.5, t0, 0.3)
        for q in range(int(d * 2)):   # creaks and rattles
            m = int(0.3 * SR); x = bp(noise(m), rng.uniform(300, 1800), 2600) * np.exp(-np.arange(m) / SR * 12) * 0.12
            add(x, t0 + rng.uniform(1.5, d - 1), rng.uniform(-0.9, 0.9))
    if kind == 'wave':
        d = ev[2]; n = int(d * SR); tt = np.arange(n) / SR
        e = np.minimum(1, tt / (d * 0.6)) ** 2 * np.clip((d - tt) / 2.5, 0, 1)
        pk = pink(n); add((lp(pk, 600) * (1 - tt / d) + lp(pk, 1500) * (tt / d)) * e * 0.35, t0, -0.2); add(lp(brown(n), 120) * e * 1.2, t0, 0.2)
    if kind == 'boom':
        g = ev[2] if len(ev) > 2 else 1.0; n = int(7 * SR); tt = np.arange(n) / SR
        thump = np.sin(2 * np.pi * (55 * np.exp(-tt * 1.5) + 28) * tt) * np.exp(-tt * 1.4) * 0.7
        rumble = lp(brown(n), 160) * np.exp(-tt * 0.5) * 1.5 + lp(noise(n), 2500) * np.exp(-tt * 3.0) * 0.25
        add((thump + rumble) * g, t0 + 0.25, 0)   # sound reaches the far camera a moment later
    if kind == 'heli':
        d = ev[2]; n = int(d * SR); tt = np.arange(n) / SR
        chop = (0.5 + 0.5 * np.sin(2 * np.pi * 3.6 * tt)) ** 6
        x = lp(noise(n), 700) * chop * 0.25 + np.sin(2 * np.pi * 21 * tt) * chop * 0.15 + bp(noise(n), 2000, 5000) * 0.015
        add(x * fade(n, 2.5, 2.5), t0, 0.2)
    if kind == 'alarm':
        d = ev[2]; n = int(d * SR); tt = np.arange(n) / SR
        x = np.sign(np.sin(2 * np.pi * 880 * tt)) * (np.sin(2 * np.pi * 1.6 * tt) > 0) * 0.02
        add(lp(x, 3000) * fade(n, 0.1, 1.0), t0, -0.5)
    if kind == 'spray':
        d = ev[2]; n = int(d * SR); add(bp(noise(n), 800, 6000) * 0.05 * fade(n, 1.0, 1.0), t0, 0.1)
    if kind == 'hit':
        n = int(5 * SR); tt = np.arange(n) / SR
        x = np.sin(2 * np.pi * 42 * tt) * np.exp(-tt * 1.2) * 0.5 + lp(noise(n), 300) * np.exp(-tt * 2.5) * 0.3
        add(x, t0, 0)
    if kind == 'riser':
        d = ev[2]; n = int(d * SR); tt = np.arange(n) / SR
        x = bp(noise(n), 300, 4000) * (tt / d) ** 2 * 0.12 + np.sin(2 * np.pi * (80 + 300 * (tt / d) ** 2) * tt) * (tt / d) ** 2 * 0.06
        add(x, t0, 0)
    if kind == 'tick':
        d = ev[2]
        for q in range(int(d * 6)):
            if rng.random() < 0.6:
                m = int(0.01 * SR); add(hp(noise(m), 2000) * 0.15, t0 + q / 6 + rng.uniform(0, 0.1), 0.4)
# light room reverb on everything
def ir(t60, n): h = rng.standard_normal(int(n * SR)) * np.exp(-6.9 * np.arange(int(n * SR)) / SR / t60); return lp(h, 4000) / np.sqrt(np.sum(h ** 2))
L = L + signal.fftconvolve(L, ir(2.2, 3.0))[:N] * 0.25; R = R + signal.fftconvolve(R, ir(2.3, 3.0))[:N] * 0.25
y = np.stack([L, R], 1); y = y / max(1e-6, np.max(np.abs(y))) * 0.7
fe = np.ones(N); nf = int(0.8 * SR); fe[-nf:] = np.linspace(1, 0, nf); fe[:int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR))
wavfile.write(OUT, SR, (y * fe[:, None]).astype(np.float32))
