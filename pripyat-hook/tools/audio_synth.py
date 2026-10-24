"""Synthesize the hook's music bed, wind bed and the distant crow caw (48 kHz stereo).

music_hook.wav : dark ambient drone, 0:00-0:46, starts at 0:00, ends at 0:42 (title hit)
wind_hook.wav  : empty-city wind howl, 2 s fade-in, runs the whole hook
crow.wav       : one distant crow caw with concrete-building echoes
"""
import sys
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
rng = np.random.default_rng(1986)


def smooth_random(n_points, duration, sigma_s, rng):
    """Slow random curve in [0, 1] sampled at SR."""
    ctrl = rng.random(n_points)
    x = np.linspace(0, duration, n_points)
    t = np.arange(int(duration * SR)) / SR
    y = np.interp(t, x, ctrl)
    k = int(sigma_s * 200)
    y_ds = y[::240]  # 200 Hz control rate
    y_ds = np.convolve(np.pad(y_ds, k, mode="edge"), signal.windows.gaussian(2 * k + 1, k / 2) / (k * 1.2533), "same")[k:-k]
    y = np.interp(t, np.arange(len(y_ds)) * 240 / SR, y_ds)
    y -= y.min()
    return y / max(y.max(), 1e-9)


def reverb_ir(seconds, rt60, rng, lp_start=9000, lp_end=1500, predelay=0.02):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for ch in range(2):
        noise = rng.standard_normal(n)
        decay = 10 ** (-3 * t / rt60)
        # darken the tail: crossfade between a bright and a dark copy
        b1, a1 = signal.butter(2, lp_start / (SR / 2))
        b2, a2 = signal.butter(2, lp_end / (SR / 2))
        bright, dark = signal.lfilter(b1, a1, noise), signal.lfilter(b2, a2, noise)
        mix = np.clip(t / seconds, 0, 1)
        ir[:, ch] = (bright * (1 - mix) + dark * mix) * decay
    pd = int(predelay * SR)
    ir = np.vstack([np.zeros((pd, 2)), ir])
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
    return ir


def convolve_stereo(x, ir):
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)


def saw_drone(f0, t, cutoff, cents, amp, rng):
    """Band-limited saw built from harmonics, with a time-varying low-pass (cutoff array)."""
    f = f0 * 2 ** (cents / 1200) * (1 + 0.0008 * np.sin(2 * np.pi * 0.07 * t + rng.random() * 6))
    phase = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros_like(t)
    n_max = int(2400 / f0)
    for n in range(1, n_max + 1):
        lp = 1 / (1 + (n * f0 / cutoff) ** 4)
        out += (1 / n) * lp * np.sin(n * phase + rng.random() * 2 * np.pi)
    return amp * out


def music(duration=46.0, end_at=42.0):
    t = np.arange(int(duration * SR)) / SR
    lfo1 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.031 * t)
    lfo2 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.047 * t + 1.3)
    tension = np.clip((t - 28) / (end_at - 28), 0, 1) ** 1.5  # build toward the title hit
    L = np.zeros_like(t)
    R = np.zeros_like(t)
    D1, A1, D2 = 36.71, 55.0, 73.42
    for cents, pan in ((-7, 0.7), (6, 0.3)):
        v = saw_drone(D1, t, 320 + 200 * lfo1 + 300 * tension, cents, 0.55, rng)
        L += v * pan; R += v * (1 - pan)
        v = saw_drone(A1, t, 380 + 200 * lfo2 + 350 * tension, cents * 0.8, 0.34, rng)
        L += v * (1 - pan); R += v * pan
    v = saw_drone(D2, t, 450 + 150 * lfo1 + 300 * tension, 3, 0.2, rng)
    L += v; R += v
    # eerie high tones: minor third, fifth, and a dissonant minor second for the build
    def tone(freq, start, peak, amp, pan):
        env = np.clip((t - start) / (peak - start), 0, 1) ** 2
        vib = 1 + 0.0018 * np.sin(2 * np.pi * 0.21 * t + freq)
        s = amp * env * np.sin(2 * np.pi * np.cumsum(freq * vib) / SR) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * t + freq))
        return s * pan, s * (1 - pan)
    for args in ((146.83, 0, 3, 0.09, 0.45), (174.61, 0, 5, 0.07, 0.55), (349.23, 0, 8, 0.06, 0.35), (440.0, 6, 18, 0.045, 0.65), (311.13, 26, 41, 0.05, 0.5), (587.33, 30, 41.5, 0.02, 0.4)):
        l, r = tone(*args)
        L += l; R += r
    # air: band-passed pink-ish noise, breathing slowly
    b, a = signal.butter(2, [350 / (SR / 2), 1800 / (SR / 2)], "band")
    air = signal.lfilter(b, a, rng.standard_normal((len(t), 2)), axis=0) * 0.03 * (0.6 + 0.4 * lfo2)[:, None]
    # sub rumble
    b, a = signal.butter(2, 55 / (SR / 2))
    sub = signal.lfilter(b, a, rng.standard_normal(len(t))) * 0.4
    dry = np.stack([L, R], 1) + air + sub[:, None]
    wet = convolve_stereo(dry, reverb_ir(5.0, 4.2, rng))
    y = 0.65 * dry + 0.9 * wet * (np.sqrt(np.mean(dry ** 2)) / max(np.sqrt(np.mean(wet ** 2)), 1e-9))
    y *= (1 + 0.6 * tension)[:, None]
    env = np.clip(t / 0.8, 0, 1)                       # gentle start at 0:00
    env *= np.clip((end_at - t) / 0.25, 0, 1)          # stops with the 0:42 title hit
    y *= env[:, None]
    b, a = signal.butter(2, 28 / (SR / 2), "high")
    y = signal.lfilter(b, a, y, axis=0)
    return y / np.max(np.abs(y)) * 0.89


def tv_bandpass(x, fc, q):
    """Time-varying resonant band-pass, coefficients updated every 128 samples."""
    out = np.zeros_like(x)
    zi = np.zeros(2)
    blk = 128
    for i in range(0, len(x), blk):
        w0 = 2 * np.pi * fc[i] / SR
        alpha = np.sin(w0) / (2 * q)
        b = np.array([alpha, 0, -alpha]) / (1 + alpha)
        a = np.array([1, -2 * np.cos(w0) / (1 + alpha), (1 - alpha) / (1 + alpha)])
        out[i:i + blk], zi = signal.lfilter(b, a, x[i:i + blk], zi=zi)
    return out


def wind(duration=46.0):
    n = int(duration * SR)
    t = np.arange(n) / SR
    gust = 0.35 + 0.65 * smooth_random(int(duration / 1.6), duration, 1.4, rng)
    chans = []
    shared = rng.standard_normal(n)
    for ch in range(2):
        noise = 0.55 * shared + 0.83 * rng.standard_normal(n)
        b, a = signal.butter(2, [70 / (SR / 2), 900 / (SR / 2)], "band")
        base = signal.lfilter(b, a, noise) * (0.45 + 0.55 * gust)
        drift = smooth_random(int(duration / 2.5), duration, 1.0, rng)
        fc1 = 300 + 280 * gust + 60 * drift
        fc2 = fc1 * 1.52 + 40 * (1 - drift)
        howl = tv_bandpass(noise, fc1, 14) * 1.0 + tv_bandpass(noise, fc2, 18) * 0.55
        howl *= gust ** 1.8
        b, a = signal.butter(2, 120 / (SR / 2))
        rumble = signal.lfilter(b, a, rng.standard_normal(n)) * 2.0 * gust
        chans.append(base / np.std(base) * 0.6 + howl / np.std(howl) * 0.5 + rumble / np.std(rumble) * 0.25)
    y = np.stack(chans, 1)
    env = np.clip(t / 2.0, 0, 1) ** 1.5 * np.clip((duration - t) / 1.0, 0, 1)
    y *= env[:, None]
    return y / np.max(np.abs(y)) * 0.89


def crow():
    dur = 0.42
    n = int(dur * SR)
    tau = np.arange(n) / SR
    f = np.where(tau < 0.07, 540 + 110 * tau / 0.07, 650 - 170 * np.clip((tau - 0.07) / (dur - 0.07), 0, None) ** 1.3)
    jit = np.interp(tau, np.linspace(0, dur, 40), rng.standard_normal(40))
    f = f * (1 + 0.025 * jit)
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(n_ ** -0.55 * np.sin(n_ * ph) for n_ in range(1, int(9000 / 650)))
    src *= 1 + 0.4 * np.sin(ph / 2)                       # period doubling = crow rasp
    b, a = signal.butter(2, [900 / (SR / 2), 4200 / (SR / 2)], "band")
    rasp = signal.lfilter(b, a, rng.standard_normal(n)) * (0.5 + 0.5 * np.cos(ph)) ** 4
    src = src / np.std(src) + 0.45 * rasp / np.std(rasp)
    voc = 0.12 * src
    for fc, q, g in ((1250, 2.5, 1.0), (2150, 3.0, 0.7), (3300, 4.0, 0.35)):
        b, a = signal.iirpeak(fc / (SR / 2), q)
        voc += g * signal.lfilter(b, a, src)
    env = np.minimum(1, tau / 0.022) * np.clip((dur - tau) / 0.12, 0, 1) * (1 - 0.25 * tau / dur)
    caw = voc * env
    # distance: air absorption, outdoor slap echoes off the blocks, diffuse tail
    b, a = signal.butter(4, 2900 / (SR / 2))
    caw = signal.lfilter(b, a, caw)
    b, a = signal.butter(2, 380 / (SR / 2), "high")
    caw = signal.lfilter(b, a, caw)
    total = int(2.6 * SR)
    out = np.zeros((total, 2))
    out[:n, 0] += caw * 0.62
    out[:n, 1] += caw * 0.38
    b, a = signal.butter(2, 1800 / (SR / 2))
    dull = signal.lfilter(b, a, caw)
    for delay, g, pan in ((0.21, 0.30, 0.3), (0.37, 0.17, 0.7), (0.55, 0.08, 0.4)):
        d = int(delay * SR)
        out[d:d + n, 0] += dull * g * pan
        out[d:d + n, 1] += dull * g * (1 - pan)
    wet = convolve_stereo(out, reverb_ir(2.4, 1.9, rng, lp_start=4000, lp_end=900, predelay=0.03))
    y = out * 0.55 + wet * 0.9 * (np.sqrt(np.mean(out ** 2)) / np.sqrt(np.mean(wet ** 2)))
    y *= np.clip((total / SR - np.arange(total) / SR) / 0.3, 0, 1)[:, None]
    return y / np.max(np.abs(y)) * 0.89


if __name__ == "__main__":
    jobs = {"crow": crow, "wind_hook": wind, "music_hook": music}
    for name, fn in ((k, jobs[k]) for k in (sys.argv[2:] or jobs)):
        y = fn()
        sf.write(f"{sys.argv[1]}/{name}.wav", y.astype(np.float32), SR, subtype="FLOAT")
        print(name, "%.2fs" % (len(y) / SR))
