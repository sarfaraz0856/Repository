"""Original procedural music bed + UI sound effects + narration mix (numpy only, no samples or stock audio).
Music is ducked under the voice (envelope follower on the narration), then the final mix is loudness-normalised
with FFmpeg (EBU R128, -14 LUFS integrated, -1.5 dBTP) by assemble_video.sh.
Usage: python3 make_audio.py <narration_48k_mono.wav> <out_dir>
"""
import sys, numpy as np, soundfile as sf

SR = 48000; DUR = 60.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def fft_filter(x, lo=None, hi=None, slope=0.15):
    """Smooth band-limit in the frequency domain (soft edges avoid ringing)."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if hi: g *= 1 / (1 + (f / hi) ** (2 / slope * 0.1))
    if lo: g *= 1 - 1 / (1 + (f / lo) ** (2 / slope * 0.1))
    return np.fft.irfft(X * g, len(x))

def env_adsr(n, a, r):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

def place(buf, clip, at, gain=1.0):
    i = int(at * SR); j = min(len(buf), i + len(clip))
    if i < len(buf): buf[i:j] += clip[: j - i] * gain

midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------------- music ----------------
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
chords = [[48, 55, 59, 62, 64], [45, 52, 55, 59, 60], [41, 48, 52, 55, 57], [43, 50, 53, 57, 59]]  # Cmaj9 Am9 Fmaj9 G13sus-ish
pad = np.zeros(N); pluck = np.zeros(N); bass = np.zeros(N); perc = np.zeros(N)
nbars = int(np.ceil(DUR / BAR)) + 1
for b in range(nbars):
    ch = chords[b % 4]; t0 = b * BAR; n = int(BAR * SR * 1.15)
    tt = np.arange(n) / SR
    tone = np.zeros(n)
    for m in ch[1:]:
        for det in (-0.07, 0.07):
            f = midi(m + 12) * (1 + det / 100)
            tone += np.sin(2 * np.pi * f * tt + rng.uniform(0, 6.28)) * 0.5 + 0.18 * np.sin(4 * np.pi * f * tt)
    place(pad, tone * env_adsr(n, 0.9, 0.9) / 10, t0)
    # bass: root on beat 1 and the "and" of 3
    for off, ln in ((0, 1.6), (2.5 * BEAT, 1.2)):
        nb = int(ln * SR); tb = np.arange(nb) / SR
        bl = np.sin(2 * np.pi * midi(ch[0] - 12) * tb) * np.exp(-tb * 2.2) * env_adsr(nb, 0.01, 0.2)
        place(bass, bl, t0 + off)
    # pluck arpeggio (8th notes)
    pattern = [1, 2, 3, 4, 3, 2, 4, 3]
    for k, idx in enumerate(pattern):
        np_ = int(0.5 * SR); tp = np.arange(np_) / SR; f = midi(ch[idx] + 12)
        pl = (np.sin(2 * np.pi * f * tp) + 0.3 * np.sin(4 * np.pi * f * tp)) * np.exp(-tp * 9) * env_adsr(np_, 0.004, 0.05)
        place(pluck, pl, t0 + k * BEAT / 2, 0.55 if k % 2 == 0 else 0.4)
    # soft kick on 1 & 3, shaker on 8ths
    for beat in (0, 2):
        nk = int(0.35 * SR); tk = np.arange(nk) / SR
        kick = np.sin(2 * np.pi * (48 + 70 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 9)
        place(perc, kick, t0 + beat * BEAT, 0.9)
    for k in range(8):
        ns = int(0.06 * SR); sh = rng.standard_normal(ns) * np.exp(-np.arange(ns) / SR * 70)
        place(perc, sh, t0 + k * BEAT / 2, 0.10 if k % 2 else 0.06)
pad = fft_filter(pad, hi=2200); pluck = fft_filter(pluck, hi=3500); perc[:] = perc
music = 0.55 * pad + 0.32 * pluck + 0.55 * bass + 0.35 * perc
# arrangement: soft intro, drop percussion under the terminal demo for focus, outro fade
lvl = np.interp(t_all, [0, 1.0, 29.5, 30.5, 42.5, 43.5, 58.0, 59.85, 60], [0, 1, 1, 0.8, 0.8, 1, 1, 0.0, 0])
music *= lvl
music /= np.max(np.abs(music)) + 1e-9

# ---------------- SFX ----------------
sfx = np.zeros(N)
def whoosh(d=0.7, up=True):
    n = int(d * SR); x = rng.standard_normal(n); tt = np.arange(n) / SR
    # sweep: blend of low- and high-passed noise over time
    lo = fft_filter(x, hi=900); hi_ = fft_filter(x, lo=1800, hi=7000)
    k = tt / d if up else 1 - tt / d
    y = lo * (1 - k) + hi_ * k
    return y * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2
def click():
    n = int(0.05 * SR); tt = np.arange(n) / SR
    c = np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 260) + 0.6 * np.sin(2 * np.pi * 1300 * (tt - 0.022)) * np.exp(-np.clip(tt - 0.022, 0, None) * 300) * (tt > 0.022)
    return c
def shimmer(d=1.6):
    n = int(d * SR); tt = np.arange(n) / SR; y = np.zeros(n)
    for i, m in enumerate([84, 88, 91, 95, 98]):
        y += np.sin(2 * np.pi * midi(m) * tt) * np.exp(-tt * 2.5) * (tt > i * 0.05)
    return y * env_adsr(n, 0.02, 0.4) / 5
def ding():
    n = int(1.2 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318.5 * tt) + 0.4 * np.sin(2 * np.pi * 2637 * tt)) * np.exp(-tt * 4)
w = whoosh(); place(sfx, w / np.max(np.abs(w)), 0.0, 0.35)
place(sfx, shimmer(), 0.25, 0.9)
for at in (29.85, 42.75, 52.75):
    w = whoosh(0.65); place(sfx, w / np.max(np.abs(w)), at, 0.32)
for at in (10.5, 17.3, 20.15, 25.3):   # cursor clicks in the demo UI (same times as graphics/scenes.html CLICKS)
    place(sfx, click(), at, 0.35)
place(sfx, shimmer(1.2), 53.0, 0.7)
place(sfx, ding(), 58.2, 0.22)

# ---------------- mix with ducking ----------------
voice, vsr = sf.read(sys.argv[1]); assert vsr == SR, "narration must be 48 kHz"
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
# envelope follower (50 ms window) -> duck music by ~9 dB while speaking
win = int(0.05 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
speaking = np.clip(env / 0.02, 0, 1)
sm = int(0.25 * SR); speaking = np.convolve(speaking, np.ones(sm) / sm, mode="same")
duck = 10 ** (-9 * speaking / 20)
MUSIC_GAIN = 10 ** (-13 / 20)   # music sits ~20 dB below the voice while speaking
mix_m = music * MUSIC_GAIN * duck
mix = voice * 0.9 + mix_m + sfx * 0.5
mix /= max(1.0, np.max(np.abs(mix)) / 0.97)
stereo = np.stack([mix, mix], axis=1)
# subtle stereo width on music only
stereo[:, 0] += 0.06 * np.roll(mix_m, 240); stereo[:, 1] -= 0.06 * np.roll(mix_m, 240)
out = sys.argv[2]
sf.write(f"{out}/mix_premaster.flac", stereo.astype(np.float32), SR, subtype="PCM_24")
sf.write(f"{out}/music_bed_original.flac", np.stack([music, music], 1).astype(np.float32) * 0.5, SR, subtype="PCM_16")
sf.write(f"{out}/sfx_only.flac", np.stack([sfx, sfx], 1).astype(np.float32) * 0.5, SR, subtype="PCM_16")
# report voice vs music level while speaking
sp = speaking > 0.8
v_rms = 20 * np.log10(np.sqrt(np.mean(voice[sp] ** 2)) + 1e-9); m_rms = 20 * np.log10(np.sqrt(np.mean(mix_m[sp] ** 2)) + 1e-9)
print(f"voice RMS while speaking {v_rms:.1f} dBFS, music under voice {m_rms:.1f} dBFS, gap {v_rms - m_rms:.1f} dB")
