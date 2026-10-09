"""
Synthesized ambiences, sound effects and music (numpy/scipy, 48 kHz stereo).
Every function returns a float array of shape (n, 2). Absolute level does not
matter here: mix.py loudness-normalises each sound before applying its level.
"""
import zlib

import numpy as np

from audio_utils import (bandpass, colored_noise, highpass, lowpass, osc_phase, pan,
                         polyblep_saw, resonator, reverb, secs, smooth_random, stereo, tvec)


def rng_for(name, seed=0):
    return np.random.default_rng(zlib.crc32(name.encode()) + seed)


def _env_exp(n, tau, attack=0.0005):
    t = tvec(n)
    return (1 - np.exp(-t / attack)) * np.exp(-t / tau)


def _add(dst, src, i0):
    if i0 >= len(dst):
        return
    s0 = max(0, -i0)
    i0 = max(0, i0)
    k = min(len(dst) - i0, len(src) - s0)
    if k > 0:
        dst[i0:i0 + k] += src[s0:s0 + k]


# ================================================================== wind ===
def wind_bed(dur, seed=0):
    """Light breeze: pink/brown noise, 150-1200 Hz, slowly moving level and colour,
    a few soft swells, light stereo width."""
    rng = rng_for("wind", seed)
    n = secs(dur)
    common = colored_noise(n, rng, 1.6)
    out = np.zeros((n, 2))
    swells = np.zeros(n)
    t = tvec(n)
    for c in rng.uniform(4, dur - 3, size=max(2, int(dur / 13))):
        w = rng.uniform(1.8, 3.5)
        swells += rng.uniform(0.5, 1.0) * np.exp(-0.5 * ((t - c) / w) ** 2)
    for ch in range(2):
        src = 0.8 * common + 0.5 * colored_noise(n, rng, 1.6)
        low = bandpass(src, 150, 420)
        mid = bandpass(src, 320, 800)
        high = bandpass(src, 650, 1200)
        w_low = 0.75 + 0.25 * smooth_random(n, rng, 0.05, 0.2)
        w_mid = np.clip(0.5 + 0.4 * smooth_random(n, rng, 0.05, 0.2), 0.08, None)
        w_high = np.clip(0.25 + 0.25 * smooth_random(n, rng, 0.05, 0.2) + 0.45 * swells, 0.03, None)
        vol = 10 ** ((2.5 * smooth_random(n, rng, 0.05, 0.15) + 4.5 * swells) / 20)
        out[:, ch] = (low * w_low + mid * w_mid * 0.8 + high * w_high * 0.7) * vol
    return out


def gust(dur=2.8, seed=0):
    """Wind gust: noise swell over 1.5 s, brighter at the peak, moving L -> R."""
    rng = rng_for("gust", seed)
    n = secs(dur)
    t = tvec(n)
    peak = 1.5
    env = np.where(t < peak, np.sin(np.pi / 2 * t / peak) ** 2,
                   np.cos(np.pi / 2 * np.clip((t - peak) / (dur - peak), 0, 1)) ** 1.6)
    common = colored_noise(n, rng, 1.2)
    out = np.zeros((n, 2))
    s = t / dur
    for ch, g in enumerate((1 - 0.35 * s, 0.65 + 0.35 * s)):
        src = 0.75 * common + 0.6 * colored_noise(n, rng, 1.2)
        sig = bandpass(src, 150, 700) * env + bandpass(src, 500, 2200) * env ** 2 * 0.9
        out[:, ch] = sig * g
    return out


def room_tone(dur, seed=0):
    rng = rng_for("room", seed)
    n = secs(dur)
    out = np.zeros((n, 2))
    for ch in range(2):
        x = 0.6 * colored_noise(n, rng, 2.0) + 0.4 * lowpass(colored_noise(n, rng, 1.0), 1200)
        out[:, ch] = lowpass(highpass(x, 40), 900) * (1 + 0.1 * smooth_random(n, rng, 0.05, 0.15))
    return out


# ================================================================= S10 ====
def flags(dur, seed=0):
    """Two flags: irregular 6-10 Hz flaps of filtered noise, high-passed at 500 Hz."""
    rng = rng_for("flags", seed)
    n = secs(dur)
    out = np.zeros((n, 2))
    for p in (-0.45, 0.4):
        gust_env = np.clip(0.65 + 0.35 * smooth_random(n, rng, 0.08, 0.3), 0.2, 1.0)
        rate = 8.0 + 1.6 * smooth_random(n, rng, 0.1, 0.4)
        env = np.zeros(n)
        t = rng.uniform(0, 0.1)
        while t < dur:
            i = secs(t)
            if i >= n:
                break
            snap = rng.random() < 0.07
            L = secs(0.035 if snap else 0.07)
            tau = 0.006 if snap else rng.uniform(0.008, 0.02)
            amp = gust_env[i] * rng.uniform(0.45, 1.0) * (1.8 if snap else 1.0)
            _add(env, amp * _env_exp(L, tau, 0.003), i)
            t += rng.uniform(0.8, 1.25) / rate[i]
        body = bandpass(rng.standard_normal(n), 500, 2500)
        crisp = bandpass(rng.standard_normal(n), 2000, 5000)
        rustle = bandpass(rng.standard_normal(n), 900, 5000) * 0.07 * gust_env
        sig = lowpass(highpass(body * env + 0.15 * crisp * env ** 1.5 + rustle, 500), 4500, order=4)
        out += pan(sig, p)
    return reverb(out, rt60=0.7, wet=0.18, predelay=0.012, seed=3)[:n]


VOWELS = {"a": (730, 1090, 2440), "e": (530, 1840, 2480), "i": (300, 2200, 2950),
          "o": (570, 840, 2410), "u": (320, 870, 2240), "@": (500, 1500, 2500)}


def _syllable(f0, dur, vowel, female, rng):
    n = secs(dur)
    t = tvec(n)
    contour = f0 * (1 + 0.08 * np.sin(np.pi * t / dur + rng.uniform(-1, 1))) * (1 - 0.06 * t / dur)
    src = lowpass(polyblep_saw(contour), 900, order=1) + 0.06 * rng.standard_normal(n)
    F = np.array(VOWELS[vowel]) * (1.17 if female else 1.0) * rng.uniform(0.95, 1.05)
    y = (resonator(src, F[0], F[0] / 90) + 0.55 * resonator(src, F[1], F[1] / 110)
         + 0.25 * resonator(src, min(F[2], 3500), F[2] / 150))
    if rng.random() < 0.5:                                   # consonant onset
        k = secs(rng.uniform(0.02, 0.05))
        y[:k] += bandpass(rng.standard_normal(k), 1800, 4500) * np.std(y) * 0.6
    a, r = min(secs(0.03), n // 3), min(secs(0.05), n // 3)
    env = np.ones(n)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[-r:] = np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    y *= env
    return y / (np.sqrt(np.mean(y ** 2)) + 1e-9)


def babble(dur, voices, seed=0, lp=2400, rt=1.3, wet=0.4, name="crowd"):
    """Distant crowd murmur: many overlapping formant-filtered 'syllables'."""
    rng = rng_for(name, seed)
    n = secs(dur + 0.5)
    out = np.zeros((n, 2))
    for _ in range(voices):
        female = rng.random() < 0.45
        f0 = rng.uniform(175, 240) if female else rng.uniform(95, 145)
        mono = np.zeros(n)
        t = rng.uniform(-0.5, 1.5)
        while t < dur:
            for _ in range(rng.integers(3, 10)):
                d = rng.uniform(0.11, 0.26)
                if t >= 0:
                    syl = _syllable(f0 * rng.uniform(0.93, 1.08), d, rng.choice(list(VOWELS)), female, rng)
                    _add(mono, syl * rng.uniform(0.5, 1.0), secs(t))
                t += d * rng.uniform(0.95, 1.15)
            t += rng.uniform(0.25, 1.6)
        out += pan(mono, rng.uniform(-0.85, 0.85)) * 10 ** (rng.uniform(-12, 0) / 20)
    out = lowpass(bandpass(out, 300, 3000), lp)
    out = reverb(out, rt60=rt, wet=wet, predelay=0.03, seed=5)
    return out[:secs(dur)]


# ================================================================= S11 ====
def _clank(rng, base):
    L = secs(0.9)
    t = tvec(L)
    ratios = np.array([1.0, 1.52, 2.11, 2.73, 3.41]) * rng.uniform(0.97, 1.03, 5)
    y = np.zeros(L)
    for k, r in enumerate(ratios):
        fk = base * r
        if fk > 3600:
            continue
        dec = rng.uniform(0.03, 0.25) / (1 + 0.3 * k)
        y += rng.uniform(0.3, 1.0) / (1 + 0.5 * k) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.3)) * np.exp(-t / dec)
    y += highpass(rng.standard_normal(L) * np.exp(-t / 0.006), 800) * 1.0
    return y * (1 - np.exp(-t / 0.0008))


def construction(dur, seed=0):
    """Far-away building site: metallic clanks + low rumble + diesel, low-passed, reverb."""
    rng = rng_for("construction", seed)
    n = secs(dur)
    clanks = np.zeros((n, 2))
    t = 0.3
    while t < dur - 0.3:
        p = rng.uniform(-0.7, 0.7)
        amp = 10 ** (rng.uniform(-10, 0) / 20)
        if rng.random() < 0.3:                                # hammering
            base = rng.uniform(800, 1500)
            gap = rng.uniform(0.32, 0.5)
            for j in range(rng.integers(3, 6)):
                _add(clanks, pan(_clank(rng, base * rng.uniform(0.99, 1.01)), p) * amp * rng.uniform(0.8, 1.0),
                     secs(t + j * gap))
            t += gap * 5
        else:
            _add(clanks, pan(_clank(rng, rng.uniform(800, 1500)), p) * amp, secs(t))
        t += rng.exponential(0.9) + 0.15
    rumble = np.stack([highpass(lowpass(colored_noise(n, rng, 2.0), 150), 30) for _ in range(2)], axis=1)
    rumble *= (1 + 0.2 * smooth_random(n, rng, 0.05, 0.2))[:, None]
    f = 26 * (1 + 0.03 * smooth_random(n, rng, 0.1, 0.5))
    diesel = lowpass(polyblep_saw(f) * (1 + 0.3 * np.sin(osc_phase(f / 2))), 250)
    machinery = np.stack([bandpass(colored_noise(n, rng, 1.0), 200, 800) for _ in range(2)], axis=1)
    bed = rumble * 0.12 + stereo(diesel) * 0.05 + machinery * 0.03
    out = lowpass(clanks * 0.7 + bed, 2000, order=4)
    return reverb(out, rt60=1.6, wet=0.4, predelay=0.05, size=2.0, seed=7)[:n]


def crane(dur=3.0, seed=0):
    """Crane motor: ~55 Hz sawtooth + harmonics, low-passed, slow pitch rise then fall."""
    rng = rng_for("crane", seed)
    n = secs(dur)
    t = tvec(n)
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    f = 55 * (1 + 0.18 * shape) * (1 + 0.004 * smooth_random(n, rng, 3, 6))
    motor = polyblep_saw(f) + 0.5 * polyblep_saw(f * 2.003) + 0.25 * np.sign(np.sin(osc_phase(f / 2)))
    motor = lowpass(motor, 400, order=4)
    whine = np.sin(osc_phase(f * 11.0)) * 0.04
    rattle = bandpass(rng.standard_normal(n), 200, 900) * (0.5 + 0.5 * np.sin(osc_phase(f / 4))) ** 2 * 0.15
    env = 0.7 + 0.3 * shape
    sig = lowpass((motor + whine + rattle) * env, 1800)
    return reverb(pan(sig, 0.3), rt60=1.8, wet=0.45, predelay=0.04, size=2.0, seed=7)[:n]


# ================================================================= S12 ====
def _bird_phrase(rng):
    kind = rng.choice(["chirp", "trill", "whistle", "tweet"])
    parts = []
    if kind == "chirp":
        for _ in range(rng.integers(3, 7)):
            d = rng.uniform(0.04, 0.08)
            t = tvec(secs(d))
            f1 = rng.uniform(2800, 3800)
            f = f1 + f1 * rng.uniform(0.25, 0.5) * (t / d) ** 0.7
            ph = osc_phase(f)
            parts.append((np.sin(ph) + 0.12 * np.sin(2 * ph)) * np.sin(np.pi * t / d) ** 2)
            parts.append(np.zeros(secs(rng.uniform(0.05, 0.1))))
    elif kind == "trill":
        rate = rng.uniform(14, 20)
        fb = rng.uniform(3800, 5200)
        for _ in range(rng.integers(10, 18)):
            d = 0.6 / rate
            t = tvec(secs(d))
            ph = osc_phase(fb * (1 - 0.12 * t / d))
            parts.append(np.sin(ph) * np.sin(np.pi * t / d) ** 2)
            parts.append(np.zeros(secs(1 / rate - d)))
    elif kind == "whistle":
        for f0 in (rng.uniform(2400, 2800), rng.uniform(2900, 3300)):
            d = rng.uniform(0.12, 0.18)
            t = tvec(secs(d))
            ph = osc_phase(f0 + 40 * np.sin(2 * np.pi * 30 * t))
            parts.append(np.sin(ph) * np.sin(np.pi * t / d) ** 1.5)
            parts.append(np.zeros(secs(0.05)))
    else:
        for _ in range(rng.integers(1, 4)):
            d = 0.035
            t = tvec(secs(d))
            ph = osc_phase(6000 - 2500 * t / d)
            parts.append(np.sin(ph) * np.sin(np.pi * t / d) ** 2)
            parts.append(np.zeros(secs(rng.uniform(0.08, 0.15))))
    return np.concatenate(parts)


def city(dur, seed=0):
    """Light traffic far away (brown noise < 300 Hz) + short bird chirps 2-6 kHz."""
    rng = rng_for("city", seed)
    n = secs(dur)
    t = tvec(n)
    swell = np.full(n, 0.5)
    for c in np.arange(rng.uniform(0, 2), dur + 2, 2.8):
        swell += rng.uniform(0.3, 0.8) * np.exp(-0.5 * ((t - c - rng.uniform(-0.7, 0.7)) / rng.uniform(0.8, 1.5)) ** 2)
    traffic = np.stack([highpass(lowpass(colored_noise(n, rng, 2.0), 300), 35) for _ in range(2)], axis=1) * swell[:, None]
    hiss = np.stack([bandpass(colored_noise(n, rng, 1.0), 400, 1600) for _ in range(2)], axis=1) * swell[:, None] * 0.12
    birds = np.zeros((n, 2))
    tb = rng.uniform(0.2, 1.0)
    while tb < dur - 0.5:
        ph = _bird_phrase(rng)
        _add(birds, pan(ph, rng.uniform(-0.8, 0.8)) * 10 ** (rng.uniform(-14, 0) / 20), secs(tb))
        tb += rng.uniform(0.6, 2.2)
    birds = reverb(highpass(birds, 1800), rt60=0.9, wet=0.25, predelay=0.015, seed=11)[:n]
    return traffic * 0.6 + hiss + birds * 0.22


def car(dur=4.0, seed=0):
    """Old car passing: 40-60 Hz engine buzz with Doppler drop, panned L -> R."""
    rng = rng_for("car", seed)
    n = secs(dur)
    t = tvec(n)
    tc, v, d, c = dur / 2, 12.0, 6.0, 343.0
    x = v * (t - tc)
    r = np.sqrt(x ** 2 + d ** 2)
    vr = v * x / r
    dop = c / (c + vr)
    f = 47 * (1 + 0.01 * smooth_random(n, rng, 1, 4)) * dop
    eng = (polyblep_saw(f) * 0.6 + polyblep_saw(f * 2) * 0.25) * (1 + 0.3 * np.sin(osc_phase(f / 2)))
    eng = lowpass(eng, 900)
    exhaust = lowpass(rng.standard_normal(n), 400) * (0.5 + 0.5 * np.sin(osc_phase(f))) ** 2 * 0.4
    tire = bandpass(rng.standard_normal(n), 200, 1800) * 0.12
    amp = d / r
    src = eng + exhaust
    src = lowpass(src, 1200) * (1 - amp) + src * amp
    sig = src * amp + tire * amp ** 1.3
    p = np.clip(x / np.sqrt(x ** 2 + (d * 0.8) ** 2), -0.95, 0.95)
    return reverb(pan(sig, p), rt60=0.6, wet=0.15, predelay=0.01, seed=13)[:n]


# ================================================================= S13/14 ==
def _creak(rng, up):
    length = rng.uniform(0.38, 0.5)
    n = secs(length)
    t = tvec(n)
    f0, f1 = (600, 900) if up else (880, 620)
    f0 *= rng.uniform(0.96, 1.04)
    f1 *= rng.uniform(0.96, 1.04)
    f = f0 + (f1 - f0) * (t / length) ** 0.8
    f *= 1 + 0.01 * lowpass(rng.standard_normal(n), 60)
    ph = osc_phase(f)
    y = sum(a * np.sin(k * ph) for k, a in enumerate([1, 0.5, 0.3, 0.15, 0.08], start=1))
    rough = np.clip(0.7 + 2.5 * lowpass(rng.standard_normal(n), 45), 0.1, 1.3)
    y = y * rough + 0.03 * bandpass(rng.standard_normal(n), 1000, 4000)
    y = y + 0.4 * resonator(y, 1450, 12) + 0.25 * resonator(y, 2300, 14)
    env = np.sin(np.pi * t / length) ** 0.7
    return lowpass(highpass(y * env, 400), 3500)


def swing(dur=8.0, seed=0, period=1.6):
    """Playground swing: soft metal squeak every ~1.6 s, gliding 600 <-> 900 Hz."""
    rng = rng_for("swing", seed)
    n = secs(dur)
    out = np.zeros((n, 2))
    k, t = 0, 0.25
    while t < dur - 0.5:
        _add(out, pan(_creak(rng, up=(k % 2 == 0)), -0.25) * rng.uniform(0.75, 1.0), secs(t))
        k += 1
        t = 0.25 + k * period + rng.uniform(-0.05, 0.05)
    return reverb(out, rt60=0.7, wet=0.2, predelay=0.01, seed=17)[:n]


# ================================================================= S15/16 ==
def hum_plant(dur, seed=0):
    """Low industrial hum: 50 Hz + 100/150 Hz harmonics + soft filtered noise."""
    rng = rng_for("hum_plant", seed)
    n = secs(dur)
    t = tvec(n)
    tone = sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.3)) for f, a in
               [(50, 1.0), (50.13, 0.5), (100, 0.55), (100.21, 0.3), (150, 0.32), (200, 0.12), (250, 0.07), (300, 0.05)])
    tone *= 1 + 0.08 * smooth_random(n, rng, 0.1, 0.4)
    noise = np.stack([lowpass(colored_noise(n, rng, 1.0), 700) * 0.25 + bandpass(colored_noise(n, rng, 1.0), 300, 1200) * 0.08
                      for _ in range(2)], axis=1)
    return reverb(stereo(tone * 0.5) + noise, rt60=1.6, wet=0.35, predelay=0.03, seed=19)[:n]


def powerline(dur=6.0, seed=0):
    """Thin 100 Hz power-line buzz with harmonics, high-passed, a little corona crackle."""
    rng = rng_for("powerline", seed)
    n = secs(dur)
    f = 100 * (1 + 0.0005 * smooth_random(n, rng, 0.2, 1))
    ph = osc_phase(f)
    buzz = sum(rng.uniform(0.5, 1.0) / k ** 0.6 * np.sin(k * ph + rng.uniform(0, 6.3)) for k in range(1, 41))
    buzz = highpass(buzz, 350) * (0.8 + 0.2 * smooth_random(n, rng, 0.3, 1.5))
    out = np.zeros((n, 2))
    out[:, 0] = buzz
    out[secs(0.0003):, 1] = buzz[:n - secs(0.0003)]
    for ch in range(2):
        cr = np.zeros(n)
        for tt in np.cumsum(rng.exponential(1 / 8, size=int(dur * 12))):
            if tt < dur:
                cr[secs(tt)] = rng.uniform(-1, 1)
        out[:, ch] += bandpass(cr, 2000, 6000) * 0.6
    return out


def reactor_hall(dur, seed=0):
    """Deep reactor-hall hum: 40-60 Hz drone + ventilation air, big reverb."""
    rng = rng_for("reactor_hall", seed)
    n = secs(dur)
    t = tvec(n)
    drone = sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.3)) for f, a in
                [(42, 1.0), (45, 0.8), (47.3, 0.4), (50, 0.7), (90, 0.35), (100, 0.4), (150, 0.2), (200, 0.1)])
    drone *= 1 + 0.1 * smooth_random(n, rng, 0.05, 0.2)
    vent = np.stack([lowpass(bandpass(colored_noise(n, rng, 1.0), 150, 2500), 1800) * (0.9 + 0.1 * smooth_random(n, rng, 0.1, 0.5))
                     + lowpass(colored_noise(n, rng, 1.5), 120) * 0.3 for _ in range(2)], axis=1)
    return reverb(stereo(drone * 0.35) + vent * 0.35, rt60=3.5, wet=0.55, predelay=0.04, size=2.5, seed=23)[:n]


def _footstep(rng):
    L = secs(0.35)
    t = tvec(L)

    def hit(a, thump):
        y = lowpass(rng.standard_normal(L) * np.exp(-t / 0.004), 4000) * a
        y += np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.035) * thump * a
        for f in np.array([2100, 2650, 3150, 3700, 4200]) * rng.uniform(0.94, 1.06, 5):
            y += rng.uniform(0.2, 0.6) * np.sin(2 * np.pi * f * t) * np.exp(-t / rng.uniform(0.03, 0.09)) * 0.5 * a
        return y * (1 - np.exp(-t / 0.0005))

    y = hit(1.0, 0.8)
    _add(y, hit(0.5, 0.3), secs(rng.uniform(0.035, 0.06)))
    return y


def footsteps(dur=4.5, steps=6, interval=0.55, seed=0):
    """Six steps on a metal floor in a big hall."""
    rng = rng_for("footsteps", seed)
    n = secs(dur)
    out = np.zeros((n, 2))
    for k in range(steps):
        p = -0.25 + 0.5 * k / max(1, steps - 1)
        _add(out, pan(_footstep(rng), p) * rng.uniform(0.85, 1.0), secs(k * interval * rng.uniform(0.98, 1.02)))
    return reverb(out, rt60=3.0, wet=0.45, predelay=0.025, size=2.5, seed=23)[:n]


# ================================================================= S17/18 ==
def _tick(rng, tock):
    L = secs(0.12)
    t = tvec(L)
    exc = rng.standard_normal(L) * np.exp(-t / 0.0015)
    s = 0.92 if tock else 1.0
    y = (resonator(exc, 2400 * s, 14) + 0.6 * resonator(exc, 3100 * s, 12)
         + 0.5 * resonator(exc, 950 * s, 5) + 0.3 * highpass(exc, 3000))
    return y * np.exp(-t / 0.025)


def clock(dur=15.0, seed=0):
    """One soft wooden tick per second (tick / tock)."""
    rng = rng_for("clock", seed)
    n = secs(dur + 0.3)
    out = np.zeros((n, 2))
    for k in range(int(round(dur))):
        _add(out, pan(_tick(rng, k % 2 == 1), 0.35), secs(k))
    return reverb(out, rt60=0.5, wet=0.18, predelay=0.006, seed=29)[:n]


def paper(dur=0.8, seed=0):
    """Paper rustle: high-passed noise swish + crinkly random spikes."""
    rng = rng_for("paper", seed)
    n = secs(dur)
    t = tvec(n)
    hump = np.sin(np.pi * t / dur) ** 1.2
    y = bandpass(rng.standard_normal(n), 1500, 8000) * 0.12 * hump
    for _ in range(rng.integers(70, 120)):
        while True:
            tt = rng.uniform(0, dur)
            if rng.random() < np.sin(np.pi * tt / dur):
                break
        L = secs(rng.uniform(0.0005, 0.004))
        burst = rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 3 + 1)) * rng.uniform(0.1, 1.0) ** 2
        _add(y, burst, secs(tt))
    y = highpass(y, 1000)
    return reverb(pan(y, -0.15), rt60=0.45, wet=0.15, predelay=0.005, seed=29)[:n]


def _metal_click(rng, scale=1.0, amp=1.0):
    L = secs(0.08)
    t = tvec(L)
    y = rng.standard_normal(L) * np.exp(-t / 0.0006)
    for f in np.array([3200, 4700, 6100, 7600]) * scale * rng.uniform(0.97, 1.03, 4):
        y += rng.uniform(0.2, 0.5) * np.sin(2 * np.pi * f * t) * np.exp(-t / rng.uniform(0.006, 0.02))
    y += 0.4 * np.sin(2 * np.pi * 1200 * scale * t) * np.exp(-t / 0.02)
    return y * amp


def key_lock(dur=0.7, seed=0):
    """Key in a lock: two clicks 40 ms apart, then a small mechanical turn + latch."""
    rng = rng_for("key", seed)
    n = secs(dur)
    y = np.zeros(n)
    _add(y, _metal_click(rng, 1.0, 1.0), 0)
    _add(y, _metal_click(rng, 1.05, 0.8), secs(0.040))
    t = 0.12
    while t < 0.40:                                           # turning: tiny grains
        L = secs(0.0004) + 1
        g = bandpass(rng.standard_normal(L + 40), 1500, 5000)[:L] * rng.uniform(0.1, 0.5) * (0.5 + (t - 0.12) / 0.28)
        _add(y, g, secs(t))
        t += rng.uniform(1 / 300, 1 / 150)
    _add(y, _metal_click(rng, 0.7, 1.1), secs(0.42))
    L = secs(0.1)
    _add(y, 0.5 * np.sin(2 * np.pi * 600 * tvec(L)) * np.exp(-tvec(L) / 0.03), secs(0.42))
    return reverb(pan(y, 0.1), rt60=0.6, wet=0.18, predelay=0.005, seed=31)[:n]


def drawer(seed=0):
    """Metal drawer: short slide, then low thud (~80 Hz) + short metal rattle.
    Returns (sound, impact_offset_seconds)."""
    rng = rng_for("drawer", seed)
    pre = 0.35
    n = secs(pre + 1.15)
    y = np.zeros(n)
    ns = secs(pre)
    ts = tvec(ns)
    slide = bandpass(rng.standard_normal(ns), 250, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * ts))
    y[:ns] += slide * (ts / pre) ** 1.5 * 0.25
    L = secs(1.0)
    t = tvec(L)
    f = 65 + 30 * np.exp(-t / 0.03)
    hit = np.sin(osc_phase(f)) * np.exp(-t / 0.07)
    for fr, a in ((180, 0.45), (260, 0.3), (420, 0.2)):          # cabinet body
        hit += a * np.sin(2 * np.pi * fr * t) * np.exp(-t / 0.11) * (1 - np.exp(-t / 0.001))
    hit += lowpass(rng.standard_normal(L) * np.exp(-t / 0.003), 5000) * 0.7
    for f0, d in zip((420, 610, 890, 1330), (0.35, 0.3, 0.25, 0.2)):
        hit += 0.15 * np.sin(2 * np.pi * f0 * t) * np.exp(-t / d) * (1 - np.exp(-t / 0.002))
    for k in range(6):
        hit_t = rng.uniform(0.005, 0.16)
        ping = sum(rng.uniform(0.2, 0.5) * np.sin(2 * np.pi * fr * tvec(secs(0.08))) * np.exp(-tvec(secs(0.08)) / rng.uniform(0.02, 0.05))
                   for fr in rng.uniform(1800, 5200, 3))
        _add(hit, ping * 0.35 * (1 - k / 7), secs(hit_t))
    _add(y, hit, ns)
    return reverb(pan(y, 0.05), rt60=0.7, wet=0.22, predelay=0.006, seed=31)[:n], pre


# ================================================================= music ===
def _midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


_NOTE_CACHE = {}


def piano_note(midi, vel, dur, seed=0):
    """Additive piano tone: inharmonic partials, two detuned strings, two-stage decay,
    soft hammer thump, damper release at note end."""
    key = (midi, round(vel, 2), round(dur, 2))
    if key in _NOTE_CACHE:
        return _NOTE_CACHE[key]
    rng = np.random.default_rng(midi * 1000 + int(vel * 100) + seed)
    f0 = _midi_hz(midi)
    n = secs(dur + 0.5)
    t = tvec(n)
    B = 0.00015 * 2 ** ((midi - 60) / 24)
    tau0 = np.interp(midi, [36, 60, 84], [6.0, 3.2, 1.2])
    y = np.zeros(n)
    for k in range(1, 19):
        fk = k * f0 * np.sqrt(1 + B * k * k)
        if fk > 6000:
            break
        a = (1 / k ** (2.1 - 0.6 * vel)) * (abs(np.sin(np.pi * k * 0.13)) + 0.05)
        tk = tau0 / (1 + 0.35 * (k - 1))
        env = 0.65 * np.exp(-t / (tk * 0.18)) + 0.35 * np.exp(-t / tk)
        ph = rng.uniform(0, 6.3)
        s = np.sin(2 * np.pi * fk * t + ph)
        if k <= 6:
            s = (s + 0.7 * np.sin(2 * np.pi * fk * (1 + rng.uniform(-1, 1) * 0.0007) * t + ph + 0.5)) / 1.7
        y += a * env * s
    y += lowpass(rng.standard_normal(n) * np.exp(-t / 0.006), 500 + 2500 * vel) * 0.03 * vel
    y *= 1 - np.exp(-t / 0.002)
    rel = t > dur
    y[rel] *= np.exp(-(t[rel] - dur) / 0.12)
    y *= vel
    _NOTE_CACHE[key] = y
    return y


CHORDS = [("Am", 45, [57, 60, 64, 69], [57, 60, 64]),
          ("F", 41, [57, 60, 65, 69], [57, 60, 65]),
          ("C", 48, [55, 60, 64, 67], [55, 60, 64]),
          ("G", 43, [55, 59, 62, 67], [55, 59, 62])]
MELODY_A = [[(0, 76, 2), (2, 72, 2)], [(0, 69, 3), (3, 72, 1)], [(0, 67, 2), (2, 76, 2)], [(0, 74, 4)]]
MELODY_B = [[(0, 72, 1.5), (1.5, 71, 0.5), (2, 69, 2)], [(0, 72, 2), (2, 77, 2)], [(0, 76, 3), (3, 74, 1)], [(0, 71, 2), (2, 74, 2)]]


def nostalgic_music(dur, seed=0, bpm=70):
    """Soft piano Am-F-C-G (~70 BPM) with a quiet string pad and reverb."""
    rng = rng_for("music", seed)
    beat = 60.0 / bpm
    bar = 4 * beat
    bars = int(np.ceil(dur / bar)) + 1
    n = secs(bars * bar + 4)
    piano = np.zeros((n, 2))
    pad = np.zeros((n, 2))
    arp = [0, 1, 2, 3, 2, 1, 2, 1]
    for b in range(bars):
        name, bass, voicing, pad_notes = CHORDS[b % 4]
        t0 = b * bar
        section = (b // 4) % 5
        melody = None if section in (0,) or b >= bars - 2 else (MELODY_A if section in (1, 3) else MELODY_B)
        arp_vel = 0.30 if melody else 0.38
        hum = lambda: rng.uniform(-0.008, 0.008)
        _add(piano, pan(piano_note(bass, 0.42, bar * 1.02), -0.3), secs(t0 + hum()))
        _add(piano, pan(piano_note(bass + 12, 0.25, bar * 1.02), -0.2), secs(t0 + 0.012))
        for i, idx in enumerate(arp):
            m = voicing[idx]
            tt = t0 + i * beat / 2 + hum()
            v = arp_vel * rng.uniform(0.85, 1.1) * (1.1 if i == 0 else 1.0)
            _add(piano, pan(piano_note(m, round(v, 2), round(bar - i * beat / 2, 2)), (m - 62) / 30), secs(tt))
        if melody:
            for off, m, beats in melody[b % 4]:
                v = 0.5 * rng.uniform(0.92, 1.05)
                _add(piano, pan(piano_note(m, round(v, 2), round(beats * beat * 1.05, 2)), 0.15), secs(t0 + off * beat + hum()))
        # string pad for this chord (overlaps into the next bar for a smooth change)
        L = secs(bar + 1.2)
        tt = tvec(L)
        env = np.minimum(1, tt / 0.7) * np.clip((bar + 1.2 - tt) / 0.9, 0, 1)
        vib = 1 + 0.0015 * np.sin(2 * np.pi * 4.5 * tt + rng.uniform(0, 6.3))
        chord = np.zeros((L, 2))
        for j, m in enumerate(pad_notes):
            for d in (-0.004, 0.0, 0.004):
                chord += pan(polyblep_saw(np.full(L, _midi_hz(m) * (1 + d)) * vib), 0.6 * (d / 0.004) * (1 if j % 2 else -1))
        _add(pad, lowpass(chord, 1400, order=2) * env[:, None], secs(t0 - 0.3))
    pad *= 0.32 * np.sqrt(np.mean(piano ** 2)) / (np.sqrt(np.mean(pad ** 2)) + 1e-9)
    piano = lowpass(piano, 4500)
    mix = reverb(piano + pad, rt60=2.3, wet=0.3, predelay=0.02, seed=37)
    return mix[:secs(dur)]


def dark_drone(dur, seed=0):
    """Dark drone: ~55 Hz and ~82 Hz tones with slow beating + moving filtered noise."""
    rng = rng_for("drone", seed)
    n = secs(dur)
    t = tvec(n)
    tones = sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.3)) for f, a in
                [(55.0, 1.0), (55.35, 0.7), (82.4, 0.6), (82.1, 0.45), (110.0, 0.3), (164.8, 0.18), (220.3, 0.07)])
    tones *= 0.85 + 0.15 * smooth_random(n, rng, 0.03, 0.12)
    noise = np.stack([bandpass(colored_noise(n, rng, 1.2), 80, 300) * (0.6 + 0.4 * smooth_random(n, rng, 0.04, 0.15))
                      + bandpass(colored_noise(n, rng, 1.2), 250, 700) * np.clip(0.3 + 0.3 * smooth_random(n, rng, 0.04, 0.15), 0, None)
                      for _ in range(2)], axis=1)
    return reverb(stereo(tones * 0.4) + noise * 0.25, rt60=3.0, wet=0.35, predelay=0.03, seed=41)[:n]


SYNTHS = {
    "flags": lambda d: flags(d),
    "crowd_far": lambda d: babble(d, voices=18, lp=2200, rt=1.4, wet=0.45, name="crowd_far"),
    "construction": lambda d: construction(d),
    "crane": lambda d: crane(d),
    "city": lambda d: city(d),
    "car": lambda d: car(d),
    "square": lambda d: babble(d, voices=26, lp=2800, rt=1.2, wet=0.35, name="square"),
    "swing": lambda d: swing(d),
    "gust": lambda d: gust(d),
    "hum_plant": lambda d: hum_plant(d),
    "powerline": lambda d: powerline(d),
    "reactor_hall": lambda d: reactor_hall(d),
    "footsteps": lambda d: footsteps(max(d, 4.5)),
    "clock": lambda d: clock(d),
    "paper": lambda d: paper(d),
    "key": lambda d: key_lock(d),
    "room_tone": lambda d: room_tone(d),
}
