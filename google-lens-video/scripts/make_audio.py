"""Generates the original soundtrack (music bed + UI sound effects) for the
15 s Google Lens explainer. Every event is aligned to the video's frame timeline
(30 fps). Output: public/soundtrack.wav (48 kHz, 16-bit stereo).
Run: python3 scripts/make_audio.py
"""
import os
import wave
import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
FPS = 30
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def fr(frame):
    return frame / FPS


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + (o + 1) * 12 - 69) / 12)


def t_arr(n):
    return np.arange(n) / SR


def lowpass_fft(x, cutoff, slope=4):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(X, len(x))


def highpass_fft(x, cutoff, slope=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / np.sqrt(1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(X, len(x))


def bandpass_sweep(x, f_start, f_end, q=3.0, block=1024):
    """Time-varying band-pass via overlapping FFT blocks (Hann window, 50 % overlap)."""
    out = np.zeros(len(x) + block)
    win = np.hanning(block)
    hop = block // 2
    nblocks = max(1, (len(x) - block) // hop + 1)
    freqs = np.fft.rfftfreq(block, 1 / SR)
    xp = np.concatenate([x, np.zeros(block)])
    for b in range(nblocks + 1):
        s = b * hop
        seg = xp[s:s + block] * win
        p = min(1.0, s / max(1, len(x)))
        fc = f_start * (f_end / f_start) ** p
        bw = fc / q
        H = np.exp(-0.5 * ((freqs - fc) / bw) ** 2)
        out[s:s + block] += np.fft.irfft(np.fft.rfft(seg) * H, block)
    return out[:len(x)]


def env_adsr(n, a, d, s, r_):
    e = np.ones(n) * s
    ai, di, ri = int(a * SR), int(d * SR), int(r_ * SR)
    ai = min(ai, n)
    e[:ai] = np.linspace(0, 1, ai, endpoint=False) if ai else e[:ai]
    if di and ai + di <= n:
        e[ai:ai + di] = np.linspace(1, s, di)
    if ri:
        ri = min(ri, n)
        e[n - ri:] *= np.linspace(1, 0, ri) ** 1.5
    return e


def add(sig, start, gain=1.0, pan=0.0):
    """Mix a mono signal (or (l, r) tuple) into the master at time `start` seconds."""
    i = int(start * SR)
    if i >= N:
        return
    if isinstance(sig, tuple):
        l, r = sig
    else:
        l = r = sig
    n = min(len(l), N - i)
    gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i:i + n] += l[:n] * gl
    R[i:i + n] += r[:n] * gr


# ---------------------------------------------------------------- music bed
def pad_voice(freq, dur, detune=0.006):
    n = int(dur * SR)
    t = t_arr(n)
    l = np.zeros(n)
    r = np.zeros(n)
    for k, amp in [(1, 1.0), (2, 0.35), (3, 0.16), (4, 0.08), (5, 0.04)]:
        ph = rng.uniform(0, 2 * np.pi)
        l += amp * np.sin(2 * np.pi * freq * k * (1 - detune) * t + ph)
        r += amp * np.sin(2 * np.pi * freq * k * (1 + detune) * t + ph * 0.7)
    trem = 1 + 0.06 * np.sin(2 * np.pi * 0.25 * t)
    return l * trem, r * trem


# chords aligned with the scenes (seconds)
CHORDS = [
    (0.0, 3.0, ['F3', 'A3', 'C4', 'E4', 'G4'], 'F2'),
    (3.0, 6.0, ['A3', 'C4', 'E4', 'G4', 'B4'], 'A2'),
    (6.0, 8.0, ['C4', 'E4', 'G4', 'B4', 'D5'], 'C2'),
    (8.0, 10.0, ['D3', 'F3', 'A3', 'C4', 'E4'], 'D2'),
    (10.0, 11.5, ['F3', 'A3', 'C4', 'E4', 'G4'], 'F2'),
    (11.5, 13.0, ['G3', 'B3', 'D4', 'F#4', 'A4'], 'G2'),
    (13.0, 15.0, ['C4', 'E4', 'G4', 'B4', 'D5'], 'C2'),
]

pad_l = np.zeros(N)
pad_r = np.zeros(N)
for (s, e, notes, _) in CHORDS:
    dur = e - s + 0.6
    n = int(dur * SR)
    env = env_adsr(n, 0.45, 0.4, 0.85, 0.7)
    i = int(s * SR)
    for nm in notes:
        l, r = pad_voice(note(nm), dur)
        m = min(n, N - i)
        pad_l[i:i + m] += (l * env)[:m]
        pad_r[i:i + m] += (r * env)[:m]
pad_l = lowpass_fft(pad_l, 1800)
pad_r = lowpass_fft(pad_r, 1800)
pad_gain = np.interp(np.arange(N) / SR, [0, 1.0, 3, 6, 13, 13.3, 15], [0.0, 0.55, 0.6, 0.5, 0.5, 0.75, 0.75])
add((pad_l * pad_gain, pad_r * pad_gain), 0, 0.045)

# Sub bass from 6 s (soft sine on chord root, 8th-note sidechain feel)
for (s, e, _, root) in CHORDS:
    if s < 6.0:
        continue
    n = int((e - s) * SR)
    t = t_arr(n)
    f0 = note(root)
    b = np.sin(2 * np.pi * f0 * t) + 0.25 * np.sin(2 * np.pi * 2 * f0 * t)
    beat = 0.5
    duck = 0.35 + 0.65 * np.clip(((t + s) % beat) / 0.18, 0, 1)
    b *= env_adsr(n, 0.02, 0.1, 1.0, 0.08) * duck
    add(b, s, 0.06)

# Plucked arpeggio (8th notes at 120 BPM) from 3 s to 13 s
step = 0.25
arp_pattern = [0, 2, 1, 3, 2, 4, 3, 1]
tt = 3.0
k = 0
while tt < 13.0 - 1e-6:
    chord = next(c for c in CHORDS if c[0] <= tt < c[1])
    nm = chord[2][arp_pattern[k % 8]]
    f0 = note(nm) * 2
    n = int(0.45 * SR)
    t = t_arr(n)
    tone = np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(2 * np.pi * 2 * f0 * t) + 0.08 * np.sin(2 * np.pi * 3 * f0 * t)
    tone *= np.exp(-t * 9)
    vel = 0.75 + 0.25 * (k % 2 == 0)
    ramp = np.interp(tt, [3, 4, 12, 13], [0.4, 1.0, 1.0, 0.6])
    add(tone, tt, 0.035 * vel * ramp, pan=0.35 if k % 2 else -0.35)
    tt += step
    k += 1

# Soft kick + hats in the AI / results sections (6 s .. 13 s)
for b_i in range(int((13 - 6) / 0.5)):
    st = 6.0 + b_i * 0.5
    n = int(0.35 * SR)
    t = t_arr(n)
    f = 45 + 90 * np.exp(-t * 30)
    kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    add(kick, st, 0.09 if b_i % 2 == 0 else 0.06)
    n = int(0.06 * SR)
    hat = highpass_fft(rng.standard_normal(n), 7000) * np.exp(-t_arr(n) * 70)
    add(hat, st + 0.25, 0.035, pan=0.25)

# ---------------------------------------------------------------- sound effects
def whoosh(dur, f0, f1, gain, start, pan=0.0):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    y = bandpass_sweep(x, f0, f1, q=2.2)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    add(y * e, start, gain, pan)


def ping(freq, start, gain, decay=6.0, dur=1.2, pan=0.0, harm=True):
    n = int(dur * SR)
    t = t_arr(n)
    s = np.sin(2 * np.pi * freq * t)
    if harm:
        s += 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 4) + 0.15 * np.sin(2 * np.pi * freq * 3.0 * t) * np.exp(-t * 8)
    s *= np.exp(-t * decay) * np.clip(t / 0.004, 0, 1)
    add(s, start, gain, pan)


def click(start, gain, freq=2400):
    n = int(0.05 * SR)
    t = t_arr(n)
    s = (np.sin(2 * np.pi * freq * t) + 0.5 * rng.standard_normal(n)) * np.exp(-t * 160)
    add(s, start, gain)


def pop(start, gain, freq=900, pan=0.0):
    n = int(0.16 * SR)
    t = t_arr(n)
    f = freq * (1 + 0.6 * np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)
    add(s, start, gain, pan)


# 0-3 s : intro
whoosh(1.2, 300, 3200, 0.22, 0.0)                  # phone zooms in
ping(note('C6'), fr(30), 0.05, decay=3)            # title settles
click(fr(40), 0.16)                                # tap on the lens icon
pop(fr(41), 0.12, 700)
whoosh(0.9, 500, 5000, 0.18, fr(48))               # circular camera reveal
ping(note('G5'), fr(76), 0.05, decay=4)            # Lens UI ready

# 3-6 s : scanning
pop(fr(94), 0.07, 1300)                            # brackets appear
ping(note('E6'), fr(112), 0.07, decay=10)          # focus lock beep (two-tone)
ping(note('A6'), fr(116), 0.07, decay=10)
# scan line sweep: down then up (frames 112 -> 143 -> 174)
n = int(fr(31) * SR)
whoosh(fr(31), 900, 3800, 0.10, fr(112), pan=-0.1)
whoosh(fr(31), 3800, 900, 0.10, fr(143), pan=0.1)
# feature-point glints (match the sparkle timings in LensScreen)
for i in range(22):
    start = 90 + 34 + ((i * 7) % 22) * 2
    ping(note(['C7', 'E7', 'G7', 'D7'][i % 4]), fr(start), 0.018, decay=18, dur=0.4, pan=((i % 5) - 2) / 3, harm=False)

# 6-10 s : AI recognition
whoosh(0.9, 2000, 7000, 0.07, fr(182))             # outline shimmer
for j, nm in enumerate(['C6', 'E6', 'G6', 'B6']):
    ping(note(nm), fr(184) + j * 0.06, 0.035, decay=5)
pop(fr(198), 0.10, 1100)                           # "Sneaker" label
whoosh(0.5, 400, 2500, 0.08, fr(194), pan=0.3)     # connector line draws
ping(note('C5'), fr(202), 0.06, decay=3, pan=0.3)  # AI hub blooms
for i, frame in enumerate([226, 236, 246]):        # node cards slide in
    pop(fr(frame), 0.08, 800 + i * 150, pan=0.5)
for i, frame in enumerate([270, 280, 290]):        # cards complete (check marks)
    ping(note(['E6', 'G6', 'C7'][i]), fr(frame), 0.06, decay=7, pan=0.5)

# 10-13 s : results
whoosh(0.8, 300, 2600, 0.20, fr(298))              # results sheet slides up
for i, frame in enumerate([314, 319, 324, 329]):   # phone product cards
    pop(fr(frame), 0.05, 1200 + i * 120, pan=-0.05)
for i, frame in enumerate([318, 325, 332]):        # right-hand result cards
    whoosh(0.35, 1500, 5000, 0.07, fr(frame), pan=0.55)
    pop(fr(frame + 6), 0.05, 1000 + i * 100, pan=0.55)

# 13-15 s : final
whoosh(1.0, 6000, 400, 0.10, fr(386))              # transition into the final chord
for i, (frame, nm) in enumerate([(396, 'C6'), (400, 'E6'), (404, 'G6')]):  # SCAN. SEARCH. DISCOVER.
    ping(note(nm), fr(frame), 0.07, decay=2.2, dur=2.0)
n = int(2.0 * SR)
t = t_arr(n)
shimmer = sum(np.sin(2 * np.pi * note(nm) * 2 * t + i) for i, nm in enumerate(['C5', 'E5', 'G5', 'B5', 'D6']))
add(shimmer * np.exp(-t * 1.4) * np.clip(t / 0.05, 0, 1), fr(392), 0.012)

# ---------------------------------------------------------------- master
t_all = np.arange(N) / SR
fade = np.ones(N)
fade_in = int(0.03 * SR)
fade[:fade_in] = np.linspace(0, 1, fade_in)
fo = t_all >= 14.0  # cinematic fade-out matching the picture (frames 420-450)
fade[fo] = np.cos(np.clip((t_all[fo] - 14.0) / 1.0, 0, 1) * np.pi / 2) ** 2
L *= fade
R *= fade

# gentle soft-clip of the music + SFX bed
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak, R / peak
L, R = np.tanh(1.2 * L) / np.tanh(1.2), np.tanh(1.2 * R) / np.tanh(1.2)

# ---------------------------------------------------------------- Hindi voiceover
# Lines are produced by scripts/make_voiceover.sh (48 kHz mono WAVs). Start times in seconds,
# placed at the start of each scene so the narration matches the on-screen captions.
VO_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'voiceover')
VO_CUES = [(0.55, 'vo_1.wav'), (3.20, 'vo_2.wav'), (6.15, 'vo_3.wav'), (10.20, 'vo_4.wav'), (12.80, 'vo_5.wav')]


def read_wav_mono(path):
    with wave.open(path, 'rb') as w:
        assert w.getframerate() == SR and w.getsampwidth() == 2, path
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
    return x


voice = np.zeros(N)
if all(os.path.exists(os.path.join(VO_DIR, f)) for _, f in VO_CUES):
    for start, fname in VO_CUES:
        x = read_wav_mono(os.path.join(VO_DIR, fname))
        x = x / (np.abs(x).max() + 1e-9)
        i = int(start * SR)
        n = min(len(x), N - i)
        voice[i:i + n] += x[:n]
    # duck the music/SFX bed ~6 dB while the narrator speaks (smooth attack/release)
    win = int(0.05 * SR)
    rms = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode='same'))
    active = (rms > 0.02).astype(np.float64)
    smooth = int(0.25 * SR)
    active = np.convolve(active, np.ones(smooth) / smooth, mode='same')
    duck = 1 - 0.5 * np.clip(active, 0, 1)
    L *= duck * 0.55
    R *= duck * 0.55
    vfade = np.clip((15.0 - t_all) / 0.15, 0, 1)
    L += voice * 0.9 * vfade
    R += voice * 0.9 * vfade

# normalise
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak, R / peak
target = 10 ** (-1.5 / 20)  # peak -1.5 dBFS, about -14.5 LUFS integrated with the voiceover
L *= target
R *= target

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'soundtrack.wav')
pcm = (np.stack([L, R], axis=1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', os.path.abspath(out), f'{DUR:.2f}s')
