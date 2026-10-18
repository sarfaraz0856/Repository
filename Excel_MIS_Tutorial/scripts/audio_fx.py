#!/usr/bin/env python3
"""
Audio for the animated tutorial: offline TTS voice, synthesized sound effects,
and an original background-music bed. Everything is generated locally.

Voice: Kokoro-82M (Apache-2.0) via kokoro-onnx, Hindi voice. The narration is
Devanagari Hinglish; espeak-ng switches English technical words to English
phonemes automatically. Language-switch markers such as "(en)" are removed
before synthesis; otherwise they get spoken as extra syllables.

All SFX and the music are synthesized from scratch with numpy (no samples).
"""
import hashlib, json, os, re
import numpy as np
import soundfile as sf

SR = 48000
TTS_SR = 24000


# ------------------------------------------------------------------ TTS
class Voice:
    def __init__(self, model_dir, cache_dir, voice="hm_psi", speed=1.0):
        from kokoro_onnx import Kokoro
        import phonemizer
        self.k = Kokoro(f"{model_dir}/kokoro-v1.0.onnx", f"{model_dir}/voices-v1.0.bin")
        self.ph = phonemizer
        self.voice, self.speed = voice, speed
        self.cache = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def phonemes(self, text):
        t = text.replace("।", ".").replace("—", ",").replace("–", ",")
        p = self.ph.phonemize(t, "hi", preserve_punctuation=True, with_stress=True,
                              language_switch="remove-flags")
        return "".join(c for c in p if c in self.k.tokenizer.vocab).strip()

    def say(self, text):
        """Returns (path_to_wav_24k, seconds). Cached by text+voice+speed."""
        key = hashlib.md5(f"{self.voice}|{self.speed}|{text}".encode()).hexdigest()[:16]
        path = f"{self.cache}/{key}.wav"
        if os.path.exists(path):
            a, _ = sf.read(path, dtype="float32")
            return path, len(a) / TTS_SR
        parts = [s.strip() for s in re.split(r"(?<=[।!?])\s+", text) if s.strip()]
        chunks = []
        gap = np.zeros(int(TTS_SR * 0.30), dtype=np.float32)
        for i, s in enumerate(parts):
            a, sr = self.k.create(self.phonemes(s), voice=self.voice, speed=self.speed, is_phonemes=True)
            chunks.append(a.astype(np.float32))
            if i < len(parts) - 1:
                chunks.append(gap)
        a = np.concatenate(chunks)
        peak = float(np.abs(a).max()) or 1.0
        a = a * (0.89 / peak)
        sf.write(path, a, TTS_SR)
        return path, len(a) / TTS_SR


# ------------------------------------------------------------------ helpers
def _env(n, a, d):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(a, 1e-4)) * np.exp(-t / max(d, 1e-4))
    return e.astype(np.float32)


def _onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i in range(len(x)):
        s = (1 - a) * x[i] + a * s
        y[i] = s
    return y


def _lp_fast(x, fc):
    """Vectorised-ish one pole low-pass via cumulative filtering in blocks."""
    a = float(np.exp(-2 * np.pi * fc / SR))
    from itertools import accumulate
    return np.fromiter(accumulate(x * (1 - a), lambda s, v: a * s + v), dtype=np.float32, count=len(x))


rng = np.random.default_rng(7)


# ------------------------------------------------------------------ SFX
def sfx_click():
    """Mouse click: press + release transients."""
    n = int(SR * 0.12)
    out = np.zeros(n, np.float32)
    for t0, amp, f in ((0.0, 0.55, 3800), (0.065, 0.32, 3200)):
        i = int(t0 * SR)
        m = int(SR * 0.018)
        noise = rng.standard_normal(m).astype(np.float32)
        noise = noise - _lp_fast(noise, 1500)          # high-pass-ish
        ping = np.sin(2 * np.pi * f * np.arange(m) / SR).astype(np.float32)
        body = np.sin(2 * np.pi * 180 * np.arange(m) / SR).astype(np.float32) * 0.5
        e = _env(m, 0.0004, 0.0035)
        out[i:i + m] += amp * e * (0.6 * noise + 0.5 * ping + body)
    return out


def sfx_key():
    m = int(SR * 0.045)
    noise = rng.standard_normal(m).astype(np.float32)
    noise = noise - _lp_fast(noise, 900)
    thock = np.sin(2 * np.pi * rng.uniform(150, 230) * np.arange(m) / SR).astype(np.float32)
    e = _env(m, 0.0006, 0.006)
    return rng.uniform(0.16, 0.26) * e * (0.7 * noise + 0.6 * thock)


def sfx_whoosh(dur=0.75):
    n = int(SR * dur)
    noise = rng.standard_normal(n).astype(np.float32)
    t = np.linspace(0, 1, n, dtype=np.float32)
    env = np.sin(np.pi * t) ** 2
    lo = _lp_fast(noise, 2600) - _lp_fast(noise, 350)
    return (0.22 * env * lo).astype(np.float32)


def sfx_pop():
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    f = 700 + 500 * t / t[-1]
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (0.12 * np.sin(ph) * _env(n, 0.002, 0.03)).astype(np.float32)


def sfx_chime():
    n = int(SR * 0.9)
    out = np.zeros(n, np.float32)
    for t0, f in ((0.0, 1046.5), (0.12, 1568.0)):
        i = int(t0 * SR)
        m = n - i
        tt = np.arange(m) / SR
        tone = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
        out[i:] += (0.11 * tone * _env(m, 0.003, 0.28)).astype(np.float32)
    return out


SFX = {"click": sfx_click, "key": sfx_key, "whoosh": sfx_whoosh, "pop": sfx_pop, "chime": sfx_chime}


def render_sfx(events, total):
    """events: list of (time_s, kind). Returns mono float32 at SR."""
    out = np.zeros(int(total * SR) + SR, np.float32)
    cache = {}
    for t, kind in events:
        if kind == "key":
            s = sfx_key()
        else:
            if kind not in cache:
                cache[kind] = SFX[kind]()
            s = cache[kind]
        i = int(t * SR)
        out[i:i + len(s)] += s[: max(0, len(out) - i)]
    return out[: int(total * SR)]


# ------------------------------------------------------------------ music
def _midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def render_music(total, bpm=84):
    """Original calm instrumental: soft pad + pluck arpeggio + sine bass.

    Progression (C major): C - Am - F - G, two bars each, with a different
    arpeggio pattern on alternating cycles. Returns stereo float32 at SR.
    """
    beat = 60.0 / bpm
    bar = 4 * beat
    prog = [(48, [60, 64, 67, 72]), (45, [57, 60, 64, 69]),
            (41, [53, 57, 60, 65]), (43, [55, 59, 62, 67])]
    n = int(total * SR)
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    t_all = 0.0
    cyc = 0
    patterns = [[0, 1, 2, 3, 2, 1, 2, 3], [0, 2, 1, 3, 2, 3, 1, 2]]
    while t_all < total:
        for root, chord in prog:
            seg = 2 * bar
            i0 = int(t_all * SR)
            if i0 >= n:
                break
            m = min(int(seg * SR) + int(SR * 1.5), n - i0)
            tt = np.arange(m) / SR
            # pad
            env = np.minimum(1, tt / 1.2) * np.where(tt < seg, 1.0, np.exp(-(tt - seg) / 0.6))
            pad = np.zeros(m, np.float32)
            for k, note in enumerate(chord[:3]):
                f = _midi(note)
                pad += (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 1.003 * tt + k)).astype(np.float32)
            pad *= (0.045 * env).astype(np.float32)
            # bass on beats 1 and 3
            bass = np.zeros(m, np.float32)
            for b in range(0, 8, 2):
                j = int(b * beat * SR)
                if j >= m:
                    break
                k = min(m - j, int(beat * 1.8 * SR))
                tb = np.arange(k) / SR
                bass[j:j + k] += (0.10 * np.sin(2 * np.pi * _midi(root) * tb) * _env(k, 0.01, 0.55)).astype(np.float32)
            # pluck arpeggio, eighth notes
            arp = np.zeros(m, np.float32)
            pat = patterns[cyc % 2]
            for e8 in range(16):
                j = int(e8 * beat / 2 * SR)
                if j >= m:
                    break
                note = chord[pat[e8 % 8]] + 12
                k = min(m - j, int(0.9 * SR))
                tp = np.arange(k) / SR
                f = _midi(note)
                tri = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * tp))
                vel = 0.030 if e8 % 2 == 0 else 0.022
                arp[j:j + k] += (vel * tri * _env(k, 0.002, 0.22)).astype(np.float32)
            L[i0:i0 + m] += pad + bass + arp * 0.8
            R[i0:i0 + m] += pad + bass + arp * 1.1
            t_all += seg
        cyc += 1
    # gentle overall low-pass for warmth + fade in/out
    L = _lp_fast(L, 5200)
    R = _lp_fast(R, 5200)
    fade = np.ones(n, np.float32)
    fi, fo = int(2.0 * SR), int(4.0 * SR)
    fade[:fi] = np.linspace(0, 1, fi)
    fade[-fo:] = np.linspace(1, 0, fo)
    st = np.stack([L * fade, R * fade], axis=1)
    return st / (np.abs(st).max() + 1e-9) * 0.5
