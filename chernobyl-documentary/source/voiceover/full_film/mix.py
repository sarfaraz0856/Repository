# Documentary mix: polished voice lines placed on the cut, a small room plus a soft long hall on the voice,
# the music bed ducked under speech with a smooth look-ahead envelope.
import sys, json, numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000
import os; GAP = float(os.environ.get('GAP', '0.45'))
pre, sec, bedf, out, hall, explo = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]), sys.argv[6] == '1'
L = json.load(open('lines.json'))[sec]
_, bed = wavfile.read(bedf); bed = bed.astype(np.float64)
N = len(bed); voice = np.zeros(N); spans = []; prev = 0.0
for i, (t0, _) in enumerate(L):
    _, x = wavfile.read(f'{pre}_{sec}_{i}.wav'); x = x.astype(np.float64)
    s = max(t0, prev + GAP)
    i0 = int(s * SR); voice[i0:i0 + len(x)] += x[:N - i0]
    prev = s + len(x) / SR; spans.append((s, prev)); print(f'{s:6.2f}-{prev:6.2f}')
if explo: assert spans[2][1] < float(os.environ.get('EXPLO', '16.85')), 'line runs into the explosion'
rng = np.random.default_rng(5)
def ir(t60, n, lp):
    h = rng.standard_normal(int(n * SR)) * np.exp(-6.9 * np.arange(int(n * SR)) / SR / t60)
    b, a = signal.butter(2, lp / (SR / 2)); h = signal.lfilter(b, a, h); return h / np.sqrt(np.sum(h ** 2))
v = voice + signal.fftconvolve(voice, ir(0.25, 0.5, 5000))[:N] * 0.10 + signal.fftconvolve(voice, ir(1.6, 2.5, 3500))[:N] * hall
act = np.zeros(N)
for s, e in spans: act[int(max(0, s - 0.3) * SR):int((e + 0.25) * SR)] = 1.0
env = np.zeros(N); y = 0.0; aa, ar = np.exp(-64 / (0.15 * SR)), np.exp(-64 / (0.8 * SR))
for k in range(0, N, 64):
    tg = act[k]; c = aa if tg > y else ar; y = tg + (y - tg) * c; env[k:k + 64] = y
tt = np.arange(N) / SR
B = os.environ.get('BOOST')   # "t_end,ramp,bed_db,duck_db": lift the music bed and duck it less up to t_end
if B:
    te, rp, bdb, ddb = map(float, B.split(','))
    w = np.clip((te + rp - tt) / rp, 0, 1)
    g = 10 ** ((-(8.5 - (8.5 - ddb) * w) * env + bdb * w) / 20)
else:
    g = 10 ** (-8.5 * env / 20)
spk = act > 0.5
v *= 10 ** (-14.5 / 20) / np.sqrt(np.mean(voice[spk] ** 2))
mix = bed * g[:, None] + v[:, None]
if len(sys.argv) < 8:
    end = int(min(N / SR, spans[-1][1] + 2.2) * SR); mix = mix[:end]
    fo = int(1.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
wavfile.write(out, SR, mix.astype(np.float32))
