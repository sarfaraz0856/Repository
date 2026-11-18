"""Soundtrack for the UPI documentary sample (30 s): same instruments / sound-design language as the
Google Lens videos (pad, plucked arpeggio, soft kick & hats, whooshes, pings, taps), synced to the
beats in src/upi/timeline.json, with the narration (public/upi/vo) and automatic music ducking.
Output: public/upi/sample_soundtrack.wav (48 kHz stereo, -14 LUFS)."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'src', 'upi', 'timeline.json')))
FPS = TL['fps']; DUR = TL['durationInFrames'] / FPS; N = int(SR * DUR)
B = TL['beats']
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
fr = lambda x: x / FPS


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440.0 * 2 ** ((names[name[:-1]] + (int(name[-1]) + 1) * 12 - 69) / 12)


t_arr = lambda n: np.arange(n) / SR
def fft_filter(x, H):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); return np.fft.irfft(X * H(f), len(x))
lowpass = lambda x, fc, s=4: fft_filter(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * s)))
highpass = lambda x, fc, s=2: fft_filter(x, lambda f: 1 - 1 / np.sqrt(1 + (f / fc) ** (2 * s)))


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


# ---------------- music bed (same pad / arp / kick-hat palette as the Lens videos)
def pad_voice(freq, dur, detune=0.006):
    n = int(dur * SR); t = t_arr(n); l = np.zeros(n); r = np.zeros(n)
    for k, amp in [(1, 1.0), (2, 0.35), (3, 0.16), (4, 0.08), (5, 0.04)]:
        ph = rng.uniform(0, 2 * np.pi)
        l += amp * np.sin(2 * np.pi * freq * k * (1 - detune) * t + ph); r += amp * np.sin(2 * np.pi * freq * k * (1 + detune) * t + ph * 0.7)
    return l, r


t_net, t_title = fr(B['network']), fr(B['title'])
CH = [(0, 4, ['A3', 'C4', 'E4', 'G4'], 'A2'), (4, 8, ['F3', 'A3', 'C4', 'E4'], 'F2'), (8, t_net, ['C4', 'E4', 'G4', 'B4'], 'C2'),
      (t_net, t_net + 4, ['D3', 'F3', 'A3', 'C4'], 'D2'), (t_net + 4, t_title, ['G3', 'B3', 'D4', 'F#4'], 'G2'), (t_title, DUR, ['C4', 'E4', 'G4', 'B4', 'D5'], 'C2')]
pL = np.zeros(N); pR = np.zeros(N)
for s, e, notes, _ in CH:
    d = e - s + 0.8; n = int(d * SR); ev = env(n, 0.5, 0.4, 0.85, 0.9); i = int(s * SR)
    for nm in notes:
        l, r = pad_voice(note(nm), d); m = min(n, N - i); pL[i:i + m] += (l * ev)[:m]; pR[i:i + m] += (r * ev)[:m]
add((lowpass(pL, 1800), lowpass(pR, 1800)), 0, 0.045)
arp = [0, 2, 1, 3, 2, 1, 3, 2]; tt = 1.0; k = 0
while tt < DUR - 1.2:
    ch = next(c for c in CH if c[0] <= tt < c[1]); f0 = note(ch[2][arp[k % 8] % len(ch[2])]) * 2
    n = int(0.45 * SR); t = t_arr(n)
    add((np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(4 * np.pi * f0 * t)) * np.exp(-t * 9), tt, 0.028 * (0.6 if tt < t_net else 1.0), pan=0.35 if k % 2 else -0.35)
    tt += 0.25; k += 1
beat = t_net
while beat < t_title - 0.1:
    n = int(0.35 * SR); t = t_arr(n); f = 45 + 90 * np.exp(-t * 30)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11), beat, 0.07)
    n = int(0.06 * SR); add(highpass(rng.standard_normal(n), 7000) * np.exp(-t_arr(n) * 70), beat + 0.25, 0.025, 0.25)
    beat += 0.5
for s, e, _, root in CH:
    if s < t_net: continue
    n = int((e - s) * SR); t = t_arr(n); f0 = note(root)
    add((np.sin(2 * np.pi * f0 * t) + 0.25 * np.sin(4 * np.pi * f0 * t)) * env(n, 0.05, 0.1, 1.0, 0.3), s, 0.05)


# ---------------- sound effects
def whoosh(dur, f0, f1, gain, start, pan=0.0):
    n = int(dur * SR); add(bandpass_sweep(rng.standard_normal(n), f0, f1, q=2.2) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6, start, gain, pan)
def ping(freq, start, gain, decay=6.0, dur=1.2, pan=0.0):
    n = int(dur * SR); t = t_arr(n)
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 4)
    add(s * np.exp(-t * decay) * np.clip(t / 0.004, 0, 1), start, gain, pan)
def click(start, gain=0.12, freq=2400):
    n = int(0.05 * SR); t = t_arr(n); add((np.sin(2 * np.pi * freq * t) + 0.5 * rng.standard_normal(n)) * np.exp(-t * 160), start, gain)
def pop(start, gain=0.06, freq=900, pan=0.0):
    n = int(0.16 * SR); t = t_arr(n); f = freq * (1 + 0.6 * np.exp(-t * 40)); add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28), start, gain, pan)
def tap(start, gain=1.0): click(start, 0.11 * gain); pop(start + 0.015, 0.06 * gain, 700)
def blip(start, freq, gain=0.04, pan=0.0):
    n = int(0.09 * SR); t = t_arr(n); add(np.sin(2 * np.pi * freq * t) * np.exp(-t * 35), start, gain, pan)


whoosh(1.4, 250, 2600, 0.12, 0.0)                                   # cinematic opening
for k in range(int((fr(B['scanDetect']) - 0.6) / 0.55)):             # soft scanner sweep ticks
    blip(0.6 + k * 0.55, 1900, 0.012)
ping(note('A6'), fr(B['scanDetect']), 0.06, decay=12); ping(note('E7'), fr(B['scanDetect']) + 0.08, 0.05, decay=12)   # QR scan beep
for d in B['digits']: tap(fr(d))
tap(fr(B['payTap']), 1.2); whoosh(0.4, 600, 3000, 0.05, fr(B['payTap']))
for p in B['pinTaps']: tap(fr(p), 0.9)
tap(fr(B['pinSubmit']), 1.2)
# processing hum (subtle, filtered)
a, b = fr(B['processing']), fr(B['success'])
n = int((b - a) * SR); hum = lowpass(rng.standard_normal(n), 400) * env(n, 0.4, 0.1, 1.0, 0.4)
add(hum / (np.abs(hum).max() + 1e-9), a, 0.025)
for i in range(4): blip(fr(B['packetsOut'] + i * 8), 1400 + i * 120, 0.03, 0.4)
whoosh(1.0, 400, 3500, 0.10, fr(B['network']) - 0.3)
for k in ['nodeApp', 'nodePSP', 'nodeNPCI', 'nodeBanks']: pop(fr(B[k]), 0.05, 900 + 100 * ['nodeApp', 'nodePSP', 'nodeNPCI', 'nodeBanks'].index(k), 0.4)
# packet hops along the route
for (s0, s1, hops, f0) in [(B['flow'], B['debit'], 4, 1500), (B['debit'], B['credit'], 2, 1700), (B['credit'], B['success'], 4, 2000)]:
    for h in range(hops + 1): blip(fr(s0 + (s1 - s0) * h / hops), f0 + h * 80, 0.03, 0.3)
ping(note('E5'), fr(B['debit']) + 0.2, 0.05, decay=8)                # debit tick
ping(note('G5'), fr(B['credit']) + 0.2, 0.05, decay=8)               # credit tick
for j, nm in enumerate(['C6', 'E6', 'G6', 'C7']): ping(note(nm), fr(B['success']) + j * 0.07, 0.06, decay=4)   # success chime
# title hit
n = int(2.5 * SR); t = t_arr(n); fsub = 55 * (1 + 0.5 * np.exp(-t * 6))
add(np.sin(2 * np.pi * np.cumsum(fsub) / SR) * np.exp(-t * 2.2), t_title, 0.22)
whoosh(1.2, 5000, 300, 0.09, t_title - 0.5)
add(sum(np.sin(2 * np.pi * note(nm) * 2 * t + i) for i, nm in enumerate(['C5', 'E5', 'G5', 'B5', 'D6'])) * np.exp(-t * 1.0) * np.clip(t / 0.05, 0, 1), t_title + 0.1, 0.012)

# ---------------- master
t_all = np.arange(N) / SR
fade = np.clip((DUR - t_all) / 0.6, 0, 1); fade[:int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
L *= fade; R *= fade
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
L = np.tanh(1.2 * L) / np.tanh(1.2); R = np.tanh(1.2 * R) / np.tanh(1.2)
voice = np.zeros(N)
for c in TL['cues']:
    with wave.open(os.path.join(ROOT, 'public', c['file']), 'rb') as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    x /= np.abs(x).max() + 1e-9; i = int(fr(c['from']) * SR); m = min(len(x), N - i); voice[i:i + m] += x[:m]
win = int(0.05 * SR)
act = np.convolve((np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, 'same')) > 0.02).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
duck = 1 - 0.5 * np.clip(act, 0, 1)
L *= duck * 0.55; R *= duck * 0.55; L += voice * 0.9; R += voice * 0.9
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk; L *= 0.84; R *= 0.84
tmp = os.path.join(ROOT, 'public', 'upi', '_pre.wav')
with wave.open(tmp, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
out = os.path.join(ROOT, 'public', 'upi', 'sample_soundtrack.wav')
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
os.remove(tmp)
print('wrote', out)
