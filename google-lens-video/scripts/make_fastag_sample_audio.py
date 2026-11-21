"""FASTag sample (30 s) soundtrack: same soft music bed as the UPI documentary (pad + gentle plucks),
car / toll-plaza sound effects synced to src/fastag/timeline.json, the narration and smooth ducking.
Output: public/fastag/sample_soundtrack.wav (48 kHz stereo, -14 LUFS)."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'src', 'fastag', 'timeline.json')))
FPS = TL['fps']; DUR = TL['durationInFrames'] / FPS; N = int(SR * DUR); B = TL['beats']
fr = lambda x: x / FPS
rng = np.random.default_rng(21)
L = np.zeros(N); R = np.zeros(N)


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440.0 * 2 ** ((names[name[:-1]] + (int(name[-1]) + 1) * 12 - 69) / 12)


t_arr = lambda n: np.arange(n) / SR
def fft_filter(x, H):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); return np.fft.irfft(X * H(f), len(x))
lowpass = lambda x, fc, s=4: fft_filter(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * s)))


def bandpass_sweep(x, f0, f1, q=3.0, block=1024):
    out = np.zeros(len(x) + block); win = np.hanning(block); hop = block // 2
    freqs = np.fft.rfftfreq(block, 1 / SR); xp = np.concatenate([x, np.zeros(block)])
    for b in range(max(1, (len(x) - block) // hop + 1) + 1):
        s = b * hop; p = min(1.0, s / max(1, len(x))); fc = f0 * (f1 / f0) ** p
        out[s:s + block] += np.fft.irfft(np.fft.rfft(xp[s:s + block] * win) * np.exp(-0.5 * ((freqs - fc) / (fc / q)) ** 2), block)
    return out[:len(x)]


def env(n, a, d, s, r):
    e = np.ones(n) * s; ai, di, ri = min(int(a * SR), n), int(d * SR), min(int(r * SR), n)
    e[:ai] = np.linspace(0, 1, ai, endpoint=False)
    if di and ai + di <= n: e[ai:ai + di] = np.linspace(1, s, di)
    if ri: e[n - ri:] *= np.linspace(1, 0, ri) ** 1.5
    return e


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N or i < 0: return
    l, r = sig if isinstance(sig, tuple) else (sig, sig)
    n = min(len(l), N - i)
    L[i:i + n] += l[:n] * gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    R[i:i + n] += r[:n] * gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)


def pad_voice(freq, dur, detune=0.006):
    n = int(dur * SR); t = t_arr(n); l = np.zeros(n); r = np.zeros(n)
    for k, amp in [(1, 1.0), (2, 0.35), (3, 0.16), (4, 0.08), (5, 0.04)]:
        ph = rng.uniform(0, 2 * np.pi)
        l += amp * np.sin(2 * np.pi * freq * k * (1 - detune) * t + ph); r += amp * np.sin(2 * np.pi * freq * k * (1 + detune) * t + ph * 0.7)
    return l, r


# ---------------- music bed (same instruments as the UPI documentary)
t_q, t_title = fr(B['cash']) - 0.4, fr(B['title'])
CH = [(0, 4, ['A3', 'C4', 'E4', 'G4']), (4, 8, ['F3', 'A3', 'C4', 'E4']), (8, t_q, ['C4', 'E4', 'G4', 'B4']),
      (t_q, t_q + 4, ['D3', 'F3', 'A3', 'C4']), (t_q + 4, t_title, ['G3', 'B3', 'D4', 'F#4']), (t_title, DUR, ['C4', 'E4', 'G4', 'B4', 'D5'])]
pL = np.zeros(N); pR = np.zeros(N)
for s, e, notes in CH:
    d = e - s + 0.9; n = int(d * SR); ev = env(n, 0.5, 0.4, 0.85, 1.0); i = int(s * SR)
    for nm in notes:
        l, r = pad_voice(note(nm), d); m = min(n, N - i); pL[i:i + m] += (l * ev)[:m]; pR[i:i + m] += (r * ev)[:m]
add((lowpass(pL, 1800), lowpass(pR, 1800)), 0, 0.045)
arp = [0, 2, 1, 3, 2, 1, 3, 2]; tt = 1.0; k = 0
while tt < t_title - 0.3:
    ch = next(c for c in CH if c[0] <= tt < c[1]); f0 = note(ch[2][arp[k % 8] % len(ch[2])])
    n = int(0.9 * SR); t = t_arr(n)
    add((np.sin(2 * np.pi * f0 * t) + 0.12 * np.sin(4 * np.pi * f0 * t)) * np.exp(-t * 4.5) * np.clip(t / 0.012, 0, 1), tt, 0.02, pan=0.25 if k % 2 else -0.25)
    tt += 0.5; k += 1


# ---------------- effects
def whoosh(dur, f0, f1, gain, start, pan=0.0):
    n = int(dur * SR); add(bandpass_sweep(rng.standard_normal(n), f0, f1, q=2.2) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6, start, gain, pan)
def ping(freq, start, gain, decay=6.0, dur=1.2, pan=0.0):
    n = int(dur * SR); t = t_arr(n)
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 4)
    add(s * np.exp(-t * decay) * np.clip(t / 0.004, 0, 1), start, gain, pan)
def pop(start, gain=0.05, freq=900, pan=0.0):
    n = int(0.16 * SR); t = t_arr(n); f = freq * (1 + 0.6 * np.exp(-t * 40)); add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28), start, gain, pan)
def chime(start, g=0.05):
    for j, nm in enumerate(['C5', 'E5', 'G5', 'C6']): ping(note(nm), start + j * 0.07, g * 0.7, decay=4)


whoosh(1.4, 250, 2600, 0.10, 0.0)
# car engine: low filtered rumble that follows the car (fades in, dips while easing through, rises as it speeds away)
a, b = 0.2, fr(B['carOut']) + 1.6; n = int((b - a) * SR); t = t_arr(n)
rpm = np.interp(t + a, [a, fr(B['read']) - 0.5, fr(B['read']) + 0.3, fr(B['carOut']), b], [38, 34, 32, 52, 58])
hum = np.sin(2 * np.pi * np.cumsum(rpm) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(rpm) / SR) + 0.25 * lowpass(rng.standard_normal(n), 300)
pan_car = np.interp(t + a, [a, fr(B['read']), b], [-0.6, 0.1, 0.9])
e = env(n, 0.8, 0.1, 1.0, 1.0)
add((hum * e * np.cos((pan_car + 1) * np.pi / 4) * np.sqrt(2), hum * e * np.sin((pan_car + 1) * np.pi / 4) * np.sqrt(2)), a, 0.05)
# reader reads the tag: two soft beeps, then verified chime
ping(note('E6'), fr(B['read']), 0.035, decay=14, pan=0.3); ping(note('E6'), fr(B['read']) + 0.12, 0.035, decay=14, pan=0.3)
ping(note('A5'), fr(B['ok']), 0.045, decay=8, pan=0.3)
# barrier lifts: soft mechanical swoosh
whoosh(0.5, 300, 1200, 0.05, fr(B['barrierUp']), 0.4)
whoosh(0.9, 500, 2600, 0.07, fr(B['carOut']) - 0.1, 0.7)            # car passes
whoosh(0.7, 2400, 600, 0.05, fr(B['chip']), -0.3)                  # payment chip flies to the phone
chime(fr(B['sms']), 0.05)                                          # SMS arrives
for k in ('cash', 'card', 'stop'): pop(fr(B[k]), 0.05, 760)       # question cards
whoosh(0.9, 400, 3000, 0.07, fr(B['windshield']) - 0.3)
ping(note('G5'), fr(B['sticker']) + 0.1, 0.04, decay=5)
n = int(2.5 * SR); t = t_arr(n); fsub = 55 * (1 + 0.5 * np.exp(-t * 6))
add(np.sin(2 * np.pi * np.cumsum(fsub) / SR) * np.exp(-t * 2.2), t_title, 0.2); whoosh(1.2, 5000, 300, 0.08, t_title - 0.5)

# ---------------- master (same as the UPI documentary: gentle low-pass on the bed, smooth ducking)
t_all = np.arange(N) / SR
fade = np.clip((DUR - t_all) / 1.2, 0, 1); L *= fade; R *= fade
L = lowpass(L, 6500, 2); R = lowpass(R, 6500, 2)
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
voice = np.zeros(N)
for q in TL['cues']:
    with wave.open(os.path.join(ROOT, 'public', q['file']), 'rb') as wv:
        x = np.frombuffer(wv.readframes(wv.getnframes()), np.int16).astype(float) / 32768
    x /= np.abs(x).max() + 1e-9; i = int(fr(q['from']) * SR); m = min(len(x), N - i); voice[i:i + m] += x[:m]
hop = SR // 100; nf = N // hop
rms = np.sqrt((voice[:nf * hop] ** 2).reshape(nf, hop).mean(1))
gate = (np.convolve(rms, np.ones(5) / 5, 'same') > 0.02).astype(float)
gate = (np.convolve(gate, np.ones(120), 'same') > 0).astype(float)
act = np.convolve(gate, np.hanning(60) / np.hanning(60).sum(), 'same')
act = np.interp(np.arange(N) / hop, np.arange(nf), act)
duck = 1 - 0.45 * np.clip(act, 0, 1)
L *= duck * 0.42; R *= duck * 0.42; L += voice * 0.9; R += voice * 0.9
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk; L *= 0.84; R *= 0.84
os.makedirs(os.path.join(ROOT, 'public', 'fastag'), exist_ok=True)
tmp = os.path.join(ROOT, 'public', 'fastag', '_pre.wav')
with wave.open(tmp, 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
out = os.path.join(ROOT, 'public', 'fastag', 'sample_soundtrack.wav')
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
os.remove(tmp); print('wrote', out)
