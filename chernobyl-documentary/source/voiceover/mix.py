# Voiceover + bed mix: narration placed on the cut list, EQ/compression/room on the voice,
# music and effects ducked under speech (sidechain envelope), bed lifted in the silent beats.
import numpy as np, json
from scipy import signal
from scipy.io import wavfile
SR = 48000
sr, bed = wavfile.read('bed.wav'); bed = bed.astype(np.float64); N = len(bed); t = np.arange(N) / SR
starts = [3.0, 8.6, 14.2, 20.0, 24.4, 29.75, 34.9, 39.2, 43.6, 56.0, 60.4, 63.3, 69.5, 74.7, 78.4, 87.2, 91.3, 96.1, 99.5, 103.6]
voice = np.zeros(N)
def filt(x, kind, f, order=2):
    if kind == 'bp': b, a = signal.butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], 'band')
    else: b, a = signal.butter(order, f / (SR / 2), kind)
    return signal.lfilter(b, a, x)
def peq(x, f0, gain_db, q):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return signal.lfilter(b, a, x)
ends = []
for i, s in enumerate(starts):
    r, x = wavfile.read(f'pratham_{i:02d}.wav'); x = x.astype(np.float64) / 32768.0
    x = signal.resample_poly(x, SR, r)
    i0 = int(s * SR); voice[i0:i0 + len(x)] += x[:N - i0]
    ends.append(s + len(x) / SR)
for s, e in zip(starts, ends): print(f'{s:6.2f} - {e:6.2f}')
# voice chain: rumble cut, warmth, presence, gentle compression, short room
v = filt(voice, 'high', 75)
v = peq(v, 160, 2.5, 0.8); v = peq(v, 350, -1.5, 1.0); v = peq(v, 3200, 2.0, 1.0); v = peq(v, 7500, -2.0, 1.2)
env = np.sqrt(signal.lfilter([0.002], [1, -0.998], v ** 2) + 1e-12)
thr = np.percentile(env[env > 1e-4], 70); ratio = 3.0
g = np.where(env > thr, (thr * (env / thr) ** (1 / ratio)) / env, 1.0)
g = signal.lfilter([0.01], [1, -0.99], g)
v = v * g
rng = np.random.default_rng(3); n = int(0.6 * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.09); ir = filt(ir, 'low', 4500); ir /= np.sqrt(np.sum(ir ** 2))
v = v + signal.fftconvolve(v, ir)[:N] * 0.12
v /= np.max(np.abs(v)) + 1e-9
# sidechain ducking of the bed: -9 dB under speech, 120 ms attack, 600 ms release, 250 ms look-ahead
act = np.zeros(N)
for s, e in zip(starts, ends): act[int((s - 0.25) * SR):int((e + 0.15) * SR)] = 1.0
a_att, a_rel = np.exp(-1 / (0.12 * SR)), np.exp(-1 / (0.6 * SR))
sm = np.zeros(N); y = 0.0
for k in range(0, N, 64):
    tgt = act[k]; c = a_att ** 64 if tgt > y else a_rel ** 64
    y = tgt + (y - tgt) * c; sm[k:k + 64] = y
duck_db = -7.0 * sm - 2.0 * sm * np.interp(t, [0, 19.5, 20, 38, 38.5, 116], [0, 0, 1, 1, 0, 0])
# lift the bed in the big silent beats: explosion, the announcement, the final card
lift = np.interp(t, [0, 16.5, 17.0, 23.5, 24.5, 79.9, 80.2, 86.9, 87.2, 107.8, 108.6, 116], [0, 0, 1.5, 1.5, 0, 0, 1.5, 1.5, 0, 0, 1.0, 1.0])
bed_g = 10 ** ((duck_db + lift) / 20)
spk = act > 0.5
vr = np.sqrt(np.mean(v[spk] ** 2)); v *= 10 ** (-15.0 / 20) / vr        # speech at -15 dBFS RMS
mix = bed * bed_g[:, None] + v[:, None]
mix = filt(mix.T, 'high', 22).T
for (a0, a1, n) in [(3, 8, 'opening'), (20, 24, 'ruin'), (24.4, 29.4, 'fire'), (63.3, 69, 'street'), (69.5, 74, 'heli'), (87.2, 90.4, 'buses'), (103.6, 107, 'dusk')]:
    i, j = int(a0 * SR), int(a1 * SR)
    print(n, 'voice %.1f dB, bed (ducked) %.1f dB' % (20 * np.log10(np.sqrt(np.mean(v[i:j] ** 2))), 20 * np.log10(np.sqrt(np.mean((bed[i:j] * bed_g[i:j, None]) ** 2)))))
wavfile.write('mix_pre.wav', SR, mix.astype(np.float32))
wavfile.write('voice_only.wav', SR, (v * 0.7).astype(np.float32))
print('ok')
