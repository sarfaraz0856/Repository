"""Small DSP toolkit (numpy/scipy): IO, filters, noise, reverb, loudness, limiter."""
import json
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48000


# ------------------------------------------------------------------- tools ---
def ffmpeg_bin(name="ffmpeg"):
    path = shutil.which(name)
    if not path:
        raise RuntimeError(
            f"{name} was not found. On Windows run:  winget install Gyan.FFmpeg\n"
            "then CLOSE and REOPEN the terminal so the new PATH is picked up.")
    return path


def run(cmd, capture=False):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise RuntimeError("Command failed:\n" + " ".join(map(str, cmd)) + "\n" + r.stderr[-3000:])
    return r if capture else None


def read_audio(path, channels=2, sr=SR):
    """Decode any audio file with ffmpeg -> float32 array (n, channels)."""
    r = subprocess.run([ffmpeg_bin(), "-v", "error", "-i", str(path), "-f", "f32le",
                        "-ac", str(channels), "-ar", str(sr), "-"], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f"Could not decode {path}: {r.stderr.decode(errors='replace')[-500:]}")
    x = np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, channels)
    return x.copy()


def write_wav(path, x, subtype="PCM_24"):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    if subtype.startswith("PCM") and np.max(np.abs(x)) >= 1.0:
        subtype = "FLOAT"           # never clip a stem on export
    sf.write(str(path), x.astype(np.float32), SR, subtype=subtype)
    return subtype


def probe_duration(path):
    r = run([ffmpeg_bin("ffprobe"), "-v", "error", "-show_entries", "format=duration",
             "-of", "json", str(path)], capture=True)
    return float(json.loads(r.stdout)["format"]["duration"])


# ----------------------------------------------------------------- helpers ---
def db(x):
    return 10.0 ** (x / 20.0)


def secs(n):
    return int(round(n * SR))


def tvec(n):
    return np.arange(n, dtype=np.float64) / SR


def stereo(x):
    return np.stack([x, x], axis=1) if x.ndim == 1 else x


def pan(mono, p):
    """Constant-power pan, p in [-1, 1] (scalar or per-sample array)."""
    a = (np.asarray(p) + 1.0) * np.pi / 4.0
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def fade(x, fin=0.0, fout=0.0):
    """Sine-shaped fade in/out (no hard cuts)."""
    x = x.copy()
    n = len(x)
    for length, rev in ((fin, False), (fout, True)):
        k = min(secs(length), n)
        if k <= 1:
            continue
        ramp = np.sin(np.linspace(0, np.pi / 2, k)) ** 2
        if rev:
            ramp = ramp[::-1]
            sl = slice(n - k, n)
        else:
            sl = slice(0, k)
        x[sl] *= ramp[:, None] if x.ndim == 2 else ramp
    return x


def fit_len(x, n):
    if len(x) >= n:
        return x[:n]
    pad = np.zeros((n - len(x),) + x.shape[1:], dtype=x.dtype)
    return np.concatenate([x, pad])


def place(track, snd, t0):
    """Add snd into track starting at time t0 (seconds); clips at both ends."""
    i0 = secs(t0)
    s0 = max(0, -i0)
    i0 = max(0, i0)
    n = min(len(track) - i0, len(snd) - s0)
    if n > 0:
        track[i0:i0 + n] += snd[s0:s0 + n] if snd.ndim == track.ndim else stereo(snd[s0:s0 + n])


def automation(n, points):
    """Piece-wise linear curve from [(time, value), ...]."""
    ts = np.array([p[0] for p in points]) * SR
    vs = np.array([p[1] for p in points])
    return np.interp(np.arange(n), ts, vs)


# ------------------------------------------------------------------ filters ---
def _sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output="sos")


def lowpass(x, f, order=2):
    return signal.sosfilt(_sos("lowpass", f, order), x, axis=0)


def highpass(x, f, order=2):
    return signal.sosfilt(_sos("highpass", f, order), x, axis=0)


def bandpass(x, lo, hi, order=2):
    return signal.sosfilt(_sos("bandpass", [lo, hi], order), x, axis=0)


def resonator(x, f, q):
    """Narrow 2-pole resonance (for metallic / wooden / formant colour)."""
    b, a = signal.iirpeak(f, q, fs=SR)
    return signal.lfilter(b, a, x, axis=0)


# -------------------------------------------------------------------- noise ---
def colored_noise(n, rng, exponent=1.0, channels=1):
    """1/f^exponent noise via FFT (exponent 1 = pink, 2 = brown), normalised to rms 1."""
    out = []
    for _ in range(channels):
        spec = np.fft.rfft(rng.standard_normal(n))
        f = np.fft.rfftfreq(n, 1 / SR)
        f[0] = f[1]
        spec /= f ** (exponent / 2.0)
        y = np.fft.irfft(spec, n)
        y /= np.sqrt(np.mean(y ** 2)) + 1e-12
        out.append(y)
    return out[0] if channels == 1 else np.stack(out, axis=1)


def smooth_random(n, rng, fmin=0.05, fmax=0.2, k=4):
    """Slowly wandering curve in about [-1, 1] (sum of slow sines with random phase)."""
    t = tvec(n)
    y = np.zeros(n)
    for _ in range(k):
        y += np.sin(2 * np.pi * rng.uniform(fmin, fmax) * t + rng.uniform(0, 2 * np.pi))
    return y / np.sqrt(k / 2.0) / 1.4


def polyblep_saw(freq):
    """Band-limited sawtooth for a per-sample frequency array."""
    dt = np.asarray(freq, dtype=np.float64) / SR
    phase = np.mod(np.cumsum(dt), 1.0)
    y = 2.0 * phase - 1.0
    m = phase < dt
    t = phase[m] / dt[m]
    y[m] -= t + t - t * t - 1.0
    m = phase > 1.0 - dt
    t = (phase[m] - 1.0) / dt[m]
    y[m] -= t * t + t + t + 1.0
    return y


def osc_phase(freq):
    return 2 * np.pi * np.cumsum(np.asarray(freq, dtype=np.float64)) / SR


# ------------------------------------------------------------------- reverb ---
_IR_CACHE = {}


def make_ir(rt60, seed=1, predelay=0.01, damping=0.5, size=1.0):
    """Synthetic stereo impulse response: early reflections + decaying diffuse tail,
    with highs decaying faster than lows."""
    key = (round(rt60, 3), seed, round(predelay, 4), round(damping, 3), round(size, 3))
    if key in _IR_CACHE:
        return _IR_CACHE[key]
    rng = np.random.default_rng(seed)
    n = secs(rt60 * 1.15 + predelay + 0.05)
    t = tvec(n)
    chans = []
    for ch in range(2):
        noise = rng.standard_normal(n)
        lo = lowpass(noise, 500)
        mid = bandpass(noise, 500, 3000)
        hi = highpass(noise, 3000)
        rts = (rt60 * 1.15, rt60, max(0.15, rt60 * (1 - 0.65 * damping)))
        tail = sum(b * 10 ** (-3 * t / r) for b, r in zip((lo, mid, hi), rts))
        tail *= 1 - np.exp(-t / (0.012 * size + 0.003))          # diffusion build-up
        er = np.zeros(n)
        for _ in range(9):
            d = rng.uniform(0.004, 0.07) * size
            i = secs(d)
            if i < n:
                er[i] += rng.choice([-1, 1]) * rng.uniform(0.3, 1.0) * np.exp(-d / (0.05 * size + 0.01))
        er = lowpass(er, 6000)
        ir = 0.6 * er + tail * 0.35
        ir = np.concatenate([np.zeros(secs(predelay)), ir])[:n]
        chans.append(ir)
    ir = np.stack(chans, axis=1)
    ir /= np.sqrt(np.sum(ir ** 2) / 2.0) + 1e-12
    _IR_CACHE[key] = ir
    return ir


def reverb(x, rt60=1.2, wet=0.25, predelay=0.01, damping=0.5, size=1.0, seed=1, keep_len=False):
    """Convolution reverb. Returns dry*(1-wet) + wet*reverb, length = input + tail."""
    x = stereo(x)
    ir = make_ir(rt60, seed, predelay, damping, size)
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c]) for c in range(2)], axis=1)
    dry = np.zeros_like(y)
    dry[:len(x)] = x
    # match the reverb energy to the dry energy so 'wet' behaves like a balance knob
    ex, ey = np.sqrt(np.mean(x ** 2)) + 1e-12, np.sqrt(np.mean(y ** 2)) + 1e-12
    out = dry * (1 - wet) + y * (ex / ey) * wet * 1.6
    return out[:len(x)] if keep_len else out


# ----------------------------------------------------------------- loudness ---
_K1 = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_K2 = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def _kweight(x):
    y = signal.lfilter(*_K1, x, axis=0)
    return signal.lfilter(*_K2, y, axis=0)


def _block_power(x, block=0.4, hop=0.1):
    """Mean-square K-weighted power per block, summed over channels (BS.1770)."""
    x = x if x.ndim == 2 else x[:, None]
    y = _kweight(x.astype(np.float64))
    p = np.sum(y ** 2, axis=1)
    bl, hp = secs(block), secs(hop)
    if len(p) < bl:
        p = np.concatenate([p, np.zeros(bl - len(p))])
    c = np.concatenate([[0.0], np.cumsum(p)])
    starts = np.arange(0, len(p) - bl + 1, hp)
    return (c[starts + bl] - c[starts]) / bl


def lufs(x):
    """Integrated loudness (BS.1770-4, gated). Stereo counts both channels."""
    z = _block_power(x)
    lk = -0.691 + 10 * np.log10(z + 1e-20)
    z = z[lk > -70]
    if len(z) == 0:
        return -70.0
    rel = -0.691 + 10 * np.log10(np.mean(z)) - 10
    z2 = z[-0.691 + 10 * np.log10(z) > rel]
    return float(-0.691 + 10 * np.log10(np.mean(z2)))


def momentary(x, hop=0.1):
    """Momentary loudness (400 ms) every hop seconds."""
    return -0.691 + 10 * np.log10(_block_power(x, 0.4, hop) + 1e-20)


def normalize_lufs(x, target):
    l = lufs(x)
    if l <= -69:
        return x
    return x * db(target - l)


# ------------------------------------------------------------------ limiter ---
def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)


def limiter(x, ceiling_db=-2.0, lookahead=0.005, release=0.08):
    """Look-ahead true-peak limiter (4x oversampled detection)."""
    up = signal.resample_poly(x, 4, 1, axis=0)
    pk = np.max(np.abs(up), axis=1)
    n = len(x)
    pk = np.max(pk[:n * 4].reshape(n, 4), axis=1) if len(pk) >= n * 4 else np.max(np.abs(x), axis=1)
    ceil = db(ceiling_db)
    req = np.minimum(1.0, ceil / (pk + 1e-12))
    la = max(3, secs(lookahead))
    g = minimum_filter1d(req, size=2 * la + 1, mode="nearest")
    g = uniform_filter1d(g, size=la, mode="nearest")
    a = np.exp(-1.0 / (release * SR))
    rel = signal.lfilter([1 - a], [1, -a], g, zi=[g[0] * a])[0]
    g = np.minimum(g, rel)
    return x * g[:, None], float(np.min(g))


# ---------------------------------------------------------------- loudnorm ---
def _parse_loudnorm(stderr):
    m = re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", stderr, flags=re.S)
    if not m:
        raise RuntimeError("loudnorm output not found:\n" + stderr[-2000:])
    return json.loads(m[-1])


def loudnorm_two_pass(src, dst, target_i=-14.0, target_tp=-1.5, lra=20.0):
    """ffmpeg loudnorm, two passes. Returns (pass1 stats, pass2 stats)."""
    ff = ffmpeg_bin()
    base = f"loudnorm=I={target_i}:TP={target_tp}:LRA={lra}"
    r1 = run([ff, "-hide_banner", "-nostats", "-i", src, "-af", base + ":print_format=json",
              "-f", "null", "-"], capture=True)
    m = _parse_loudnorm(r1.stderr)
    second = (f"{base}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
              f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
              f"offset={m['target_offset']}:linear=true:print_format=json")
    r2 = run([ff, "-hide_banner", "-nostats", "-y", "-i", src, "-af", second, "-ar", str(SR),
              "-c:a", "pcm_f32le", dst], capture=True)
    return m, _parse_loudnorm(r2.stderr)


def ebur128(path):
    """Measure a file with ffmpeg's ebur128 filter -> dict(I, LRA, TP)."""
    r = run([ffmpeg_bin(), "-hide_banner", "-nostats", "-i", path, "-vn",
             "-af", "ebur128=peak=true", "-f", "null", "-"], capture=True)
    s = r.stderr[r.stderr.rfind("Summary:"):]
    get = lambda pat: float(re.search(pat, s, flags=re.S).group(1))
    return dict(I=get(r"I:\s+(-?[\d.]+) LUFS"), LRA=get(r"LRA:\s+(-?[\d.]+) LU"),
                TP=get(r"True peak:.*?Peak:\s+(-?[\d.inf]+) dBFS"))
