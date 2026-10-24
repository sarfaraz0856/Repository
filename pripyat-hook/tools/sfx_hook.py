"""Hook sound effects synthesized from scratch (48 kHz stereo, peak-normalised to -1 dBFS):
curtain flutter, rusty metal creak, Geiger counter, pre-blast rumble, the explosion, a distant
bus engine, a wind gust and the title hit. No samples are used, so nothing can trigger Content ID.
"""
import numpy as np
from scipy import signal

from audio_synth import SR, convolve_stereo, reverb_ir, smooth_random, tv_bandpass

rng = np.random.default_rng(8686)


def _norm(y):
    return y / np.max(np.abs(y)) * 0.89


def _fade(y, fin, fout):
    t = np.arange(len(y)) / SR
    env = np.clip(t / max(fin, 1e-3), 0, 1) * np.clip((len(y) / SR - t) / max(fout, 1e-3), 0, 1)
    return y * (env[:, None] if y.ndim == 2 else env)


def _space(dry, rt, wet, lp0=6000, lp1=1200, pre=0.02, pan=0.5):
    st = dry if dry.ndim == 2 else np.stack([dry * pan, dry * (1 - pan)], 1) * 2
    ir = reverb_ir(rt * 1.3, rt, rng, lp_start=lp0, lp_end=lp1, predelay=pre)
    st = np.vstack([st, np.zeros((len(ir), 2))])
    w = convolve_stereo(st, ir)
    return st + wet * w * (np.sqrt(np.mean(st ** 2)) / max(np.sqrt(np.mean(w ** 2)), 1e-12))


def _bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def _lp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2))
    return signal.lfilter(b, a, x)


def _hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def curtain_flutter(dur=2.4):
    """Thin curtain flapping in the draught from a broken window."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = _bp(rng.standard_normal(n), 120, 1400)
    flap = smooth_random(int(dur * 9), dur, 0.05, rng)
    y = x / np.std(x) * (0.2 + 0.8 * flap ** 2) * np.sin(np.pi * t / dur) ** 1.5
    return _norm(_fade(_space(y, 0.9, 0.35), 0.3, 0.4))


def metal_creak(dur=1.5, rate0=18.0, rate1=55.0, distance=0.6):
    """Rusty pivot: stick-slip impulses exciting a few sharp metal resonances."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    wob = smooth_random(int(dur * 6) + 2, dur, 0.08, rng)
    rate = rate0 + (rate1 - rate0) * np.sin(np.pi * t / dur) ** 0.8 * (0.85 + 0.3 * wob)
    ph = np.cumsum(rate) / SR
    ticks = np.diff(np.floor(ph), prepend=0) > 0
    src = ticks * (0.6 + 0.4 * rng.random(n))
    y = np.zeros(n)
    for fc, q, g in ((820, 30, 1.0), (1530, 35, 0.7), (2470, 40, 0.45), (3900, 45, 0.25)):
        b, a = signal.iirpeak(fc * (0.97 + 0.06 * rng.random()) / (SR / 2), q)
        y += g * signal.lfilter(b, a, src)
    y += 0.15 * _bp(rng.standard_normal(n), 600, 3000) * np.sin(np.pi * t / dur)
    y = _lp(y, 4200)
    return _norm(_fade(_space(y, 1.8, distance, lp0=4000, lp1=900, pre=0.04, pan=0.4), 0.15, 0.4))


def geiger(dur, rate0=3.0, rate1=20.0):
    """DP-5 style counter: random clicks speeding up."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    rate = rate0 + (rate1 - rate0) * (t / dur) ** 1.5
    hits = np.nonzero(rng.random(n) < rate / SR)[0]
    return _clicks(hits, n)


def geiger_ticks(times, dur):
    n = int(dur * SR)
    return _clicks((np.asarray(times) * SR).astype(int), n)


def _clicks(hits, n):
    k = int(0.004 * SR)
    kt = np.arange(k) / SR
    y = np.zeros(n)
    for i in hits:
        c = np.exp(-kt / 0.0006) * np.sin(2 * np.pi * (2900 + 400 * rng.random()) * kt) + \
            0.6 * np.exp(-kt / 0.0002) * rng.standard_normal(k)
        m = min(k, n - i)
        y[i:i + m] += c[:m] * (0.7 + 0.3 * rng.random())
    y = _hp(y, 600)
    return _norm(_space(y, 0.35, 0.15, lp0=9000, lp1=3000, pre=0.005))


def rumble(dur):
    """Low ground rumble swelling up to the blast."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = 0.15 + 0.85 * (t / dur) ** 2
    sub = np.sin(2 * np.pi * np.cumsum(36 + 4 * t / dur) / SR)
    chans = []
    for _ in range(2):
        x = _lp(rng.standard_normal(n), 90, 4)
        chans.append((x / np.std(x) + 0.6 * sub) * env)
    return _norm(_fade(np.stack(chans, 1), 0.5, 0.05))


def boom(dur=4.5):
    """The blast: transient crack, low body, falling sub, debris crackle and a long outdoor tail."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    tr = _lp(rng.standard_normal(n), 3500) * np.exp(-t / 0.025)
    body = _lp(rng.standard_normal(n), 220, 4) * np.exp(-t / 0.9)
    f = 55 * np.exp(-t / 1.2) + 26
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.4) * np.minimum(1, t / 0.008)
    cr = (rng.random(n) < 70 / SR * np.exp(-t / 1.5)) * rng.standard_normal(n) * 4
    cr = _lp(_hp(cr, 1500), 6000)
    y = sum(g * c / np.max(np.abs(c)) for g, c in ((0.7, tr), (0.9, body), (1.0, sub), (0.25, cr)))
    y = np.tanh(1.5 * y) / np.tanh(1.5)
    return _norm(_fade(_space(y, 3.0, 0.5, lp0=3000, lp1=600, pre=0.03), 0.0, 1.0))


def engine_hum(dur):
    """Distant diesel bus engines idling, heard as an echo of the evacuation."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f0 = 26 * (1 + 0.01 * (smooth_random(int(dur * 3) + 2, dur, 0.2, rng) - 0.5))
    ph = 2 * np.pi * np.cumsum(f0) / SR
    y = sum(k ** -0.8 * np.sin(k * ph + rng.random() * 6) for k in range(1, 15))
    y *= 0.8 + 0.2 * smooth_random(int(dur * 12), dur, 0.03, rng)
    y = _lp(y, 450, 4)
    return _norm(_fade(_space(y, 1.5, 0.7, lp0=2000, lp1=500, pre=0.05), 0.8, 0.8))


def gust(dur=2.6):
    """A single wind gust with a faint whistle."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.sin(np.pi * t / dur) ** 2
    x = rng.standard_normal(n)
    fc = 380 + 300 * env
    y = _bp(x, 200, 1600) / 3 + tv_bandpass(x, fc, 12) * 0.6
    y = y * env
    st = np.stack([y, np.roll(y, int(0.013 * SR))], 1)
    return _norm(_fade(st, 0.3, 0.3))


TITLE_PRE = 0.8


def title_hit(dur=4.0):
    """Reverse swell into a deep hit; the hit lands TITLE_PRE seconds into the file."""
    n_pre = int(TITLE_PRE * SR)
    n = int(dur * SR)
    tp = np.arange(n_pre) / SR
    swell = _hp(rng.standard_normal(n_pre), 1800) * (tp / TITLE_PRE) ** 3
    swell = swell / np.max(np.abs(swell)) * 0.35
    t = np.arange(n) / SR
    f = 46 * np.exp(-t / 0.8) + 28
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.3) * np.minimum(1, t / 0.006)
    thump = _lp(rng.standard_normal(n), 160, 4) * np.exp(-t / 0.18)
    hit = sub / np.max(np.abs(sub)) + 0.6 * thump / np.max(np.abs(thump))
    y = np.concatenate([swell, hit])
    return _norm(_fade(_space(y, 2.2, 0.45, lp0=3000, lp1=500, pre=0.02), 0.05, 1.2))
