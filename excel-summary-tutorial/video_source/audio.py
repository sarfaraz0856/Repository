import numpy as np, soundfile as sf
SR = 24000
rng = np.random.default_rng(7)
def env(n, a=0.002, decay=0.02):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / decay)
def key():
    n = int(0.03 * SR); x = rng.standard_normal(n); x = np.diff(x, prepend=0); return x * env(n, 0.0005, 0.004) * 0.05 * rng.uniform(0.6, 1.0)
def click():
    n = int(0.05 * SR); x = np.diff(rng.standard_normal(n), prepend=0)
    y = x * env(n, 0.0003, 0.003) * 0.16; y[int(0.035 * SR):] += x[:n - int(0.035 * SR)] * env(n - int(0.035 * SR), 0.0003, 0.003) * 0.08; return y
def whoosh():
    n = int(0.7 * SR); x = rng.standard_normal(n); k = np.ones(40) / 40; x = np.convolve(x, k, "same")
    t = np.linspace(0, 1, n); return x * np.sin(np.pi * t) ** 2 * 0.09
def chime():
    out = np.zeros(int(1.2 * SR)); t = np.arange(len(out)) / SR
    for f, d in ((1046.5, 0), (1568, 0.09)):
        s = int(d * SR); tt = t[: len(out) - s]
        out[s:] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt / 0.35) * np.minimum(1, tt / 0.005) * 0.05
    return out
def tick():
    t = np.arange(int(0.25 * SR)) / SR; return np.sin(2 * np.pi * 880 * t) * np.exp(-t / 0.06) * 0.04
def music(total):
    # soft four-chord pad (Cmaj7 - Am7 - Fmaj7 - G6) with a gentle arpeggio
    chords = [[261.6, 329.6, 392.0, 493.9], [220.0, 261.6, 329.6, 392.0], [174.6, 220.0, 261.6, 329.6], [196.0, 246.9, 293.7, 329.6]]
    bar = 4.0; n = int(bar * SR); t = np.arange(n) / SR; loop = []
    for ch in chords:
        pad = sum(np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t + 0.3) for f in ch) / len(ch)
        e = np.minimum(1, t / 0.8) * np.minimum(1, (bar - t) / 0.8); x = pad * e * 0.5
        for i in range(8):
            f = ch[i % 4] * 2; s = int(i * bar / 8 * SR); tt = t[: n - s]
            x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.4) * np.minimum(1, tt / 0.004) * 0.18
        loop.append(x)
    loop = np.concatenate(loop); reps = int(np.ceil(total * SR / len(loop)))
    m = np.tile(loop, reps)[: int(total * SR)]
    fade = int(3 * SR); m[:fade] *= np.linspace(0, 1, fade); m[-fade:] *= np.linspace(1, 0, fade)
    return m * 0.035
def mix(voice, sfx, total, out):
    N = int((total + 1) * SR); vo = np.zeros(N); fx = np.zeros(N)
    for t, path in voice:
        a, sr = sf.read(path); assert sr == SR; a = a / (np.max(np.abs(a)) + 1e-9) * 0.85
        s = int(t * SR); vo[s:s + len(a)] += a[: N - s]
    gens = {"key": key, "click": click, "whoosh": whoosh, "chime": chime, "tick": tick}
    for t, k in sfx:
        x = gens[k](); s = int(t * SR); fx[s:s + len(x)] += x[: N - s]
    m = music(N / SR)
    # duck the music while the narrator speaks
    env_ = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(SR // 4) / (SR // 4), "same")
    duck = 1 - 0.45 * np.clip(env_ * 3, 0, 1)
    y = vo + fx + m * duck
    y = y / max(1.0, np.max(np.abs(y)) / 0.97)
    sf.write(out, y.astype(np.float32), SR)
