"""Vertical OTP Short soundtrack: a lighter, faster bed (D minor, 104 BPM, soft marimba-like plucks + warm pad + soft kick),
SFX synced to src/otp/short/timeline.json, narration with smooth ducking.
Output: public/otp/short/short_soundtrack.wav (48 kHz stereo, -14 LUFS)."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'src', 'otp', 'short', 'timeline.json')))
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


# ---------------- music bed (different from the documentary: D minor, 104 BPM, marimba plucks)
BEAT = 60 / 104
PROG = [['D3', 'F3', 'A3', 'C4'], ['A#2', 'D3', 'F3', 'A3'], ['F3', 'A3', 'C4', 'E4'], ['C3', 'E3', 'G3', 'A#3']]
BAR = 4 * BEAT
pL = np.zeros(N); pR = np.zeros(N); tt = 0.0; k = 0
while tt < DUR:
    notes = PROG[k % 4]; d = BAR + 0.8; n = int(d * SR); ev = env(n, 0.35, 0.4, 0.8, 0.9); i = int(tt * SR)
    for nm in notes:
        l, r = pad_voice(note(nm), d); m = min(n, N - i); pL[i:i + m] += (l * ev)[:m]; pR[i:i + m] += (r * ev)[:m]
    tt += BAR; k += 1
add((lowpass(pL, 1500), lowpass(pR, 1500)), 0, 0.035)
pat = [0, 2, 3, 2, 1, 3, 2, 3]; tt = 0.4; k = 0
while tt < DUR - 1.2:
    ch = PROG[int(tt // BAR) % 4]; f0 = note(ch[pat[k % 8]]) * 2
    n = int(0.5 * SR); t = t_arr(n)
    mar = (np.sin(2 * np.pi * f0 * t) + 0.25 * np.sin(2 * np.pi * f0 * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 9) * np.clip(t / 0.003, 0, 1)
    add(mar, tt, 0.022 if k % 2 == 0 else 0.015, pan=0.3 if k % 2 else -0.3)
    tt += BEAT / 2; k += 1
tt = BAR; 
while tt < DUR - 1.5:                          # very soft kick on beats 1 and 3 (no hats / ticks)
    n = int(0.3 * SR); t = t_arr(n); fk = 50 * (1 + 1.2 * np.exp(-t * 30))
    add(lowpass(np.sin(2 * np.pi * np.cumsum(fk) / SR) * np.exp(-t * 11), 300), tt, 0.09)
    tt += 2 * BEAT


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


def click(start, gain=0.08, freq=1500):
    n = int(0.05 * SR); t = t_arr(n); add((np.sin(2 * np.pi * freq * t) + 0.1 * lowpass(rng.standard_normal(n), 3000)) * np.exp(-t * 160) * np.clip(t / 0.002, 0, 1), start, gain)
f = fr
whoosh(1.0, 300, 2600, 0.08, 0.0)
click(f(B['tap'])); pop(f(B['tap']) + 0.015, 0.05, 700)
ping(note('A5'), f(B['sms']), 0.05, decay=9); ping(note('E6'), f(B['sms']) + 0.1, 0.045, decay=9)
ping(note('D6'), f(B['code']) + 0.1, 0.03, decay=7)
whoosh(0.7, 400, 3000, 0.06, f(B['make']) - 0.35)
for j in range(6): click(f(B['random']) + 1.0 + j * 0.133, 0.05, 1200 + 60 * j)
whoosh(0.7, 3000, 400, 0.06, f(B['route']) - 0.35)
for k2 in ('route', 'gw', 'op'): pop(f(B[k2]), 0.045, 820)
pop(f(B['net']) + 0.33, 0.05, 980)
whoosh(0.7, 400, 3000, 0.06, f(B['check']) - 0.35)
for k2 in ('check', 'expire', 'used'): pop(f(B[k2]) + 0.33, 0.045, 760)
chime(f(B['ok']), 0.045)
whoosh(0.8, 2600, 300, 0.06, f(B['warn']) - 0.4)
ping(note('A4'), f(B['warn']), 0.04, decay=5); ping(note('G#4'), f(B['warn']) + 0.18, 0.035, decay=5)
pop(f(B['share']), 0.05, 600)
whoosh(0.9, 300, 3000, 0.07, f(B['cta']) - 0.45); chime(f(B['cta']) + 0.1, 0.04)

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
os.makedirs(os.path.join(ROOT, 'public', 'otp', 'short'), exist_ok=True)
tmp = os.path.join(ROOT, 'public', 'otp', 'short', '_pre.wav')
with wave.open(tmp, 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
out = os.path.join(ROOT, 'public', 'otp', 'short', 'short_soundtrack.wav')
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
os.remove(tmp); print('wrote', out)
