"""Soundtrack for the 6-minute explainer: the SAME instruments and sound effects as the
15 s video (scripts/make_audio.py), extended seamlessly to 360 s, plus the Hindi narration
(public/long/vo/*.wav) with automatic music ducking. Event times come from src/long/timeline.json,
using the same word-timing rule as the visuals (src/long/timeline.ts).
Output: public/long/soundtrack_6min.wav (48 kHz stereo, about -14 LUFS)."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'src', 'long', 'timeline.json')))
FPS = TL['fps']
DUR = TL['durationInFrames'] / FPS
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
SC = {s['id']: s for s in TL['scenes']}


def fr(x): return x / FPS
def sstart(sid): return fr(SC[sid]['from'])
def cue(sid, i): return fr(SC[sid]['cues'][i]['from'])
def cend(sid, i): c = SC[sid]['cues'][i]; return fr(c['from'] + c['dur'])
def word(sid, i, w):
    c = SC[sid]['cues'][i]; t = c['text']; idx = max(0, t.find(w))
    return fr(round(c['from'] + c['dur'] * idx / len(t)))


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + (o + 1) * 12 - 69) / 12)


def t_arr(n): return np.arange(n) / SR


def fft_filter(x, H):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * H(f), len(x))
def lowpass(x, fc, s=4): return fft_filter(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * s)))
def highpass(x, fc, s=2): return fft_filter(x, lambda f: 1 - 1 / np.sqrt(1 + (f / fc) ** (2 * s)))


def bandpass_sweep(x, f0, f1, q=3.0, block=1024):
    out = np.zeros(len(x) + block); win = np.hanning(block); hop = block // 2
    freqs = np.fft.rfftfreq(block, 1 / SR); xp = np.concatenate([x, np.zeros(block)])
    for b in range(max(1, (len(x) - block) // hop + 1) + 1):
        s = b * hop; seg = xp[s:s + block] * win; p = min(1.0, s / max(1, len(x)))
        fc = f0 * (f1 / f0) ** p
        out[s:s + block] += np.fft.irfft(np.fft.rfft(seg) * np.exp(-0.5 * ((freqs - fc) / (fc / q)) ** 2), block)
    return out[:len(x)]


def env_adsr(n, a, d, s, r_):
    e = np.ones(n) * s; ai, di, ri = min(int(a * SR), n), int(d * SR), min(int(r_ * SR), n)
    e[:ai] = np.linspace(0, 1, ai, endpoint=False)
    if di and ai + di <= n: e[ai:ai + di] = np.linspace(1, s, di)
    if ri: e[n - ri:] *= np.linspace(1, 0, ri) ** 1.5
    return e


def add(sig, start, gain=1.0, pan=0.0, buf=None):
    bl, br = buf if buf else (L, R)
    i = int(start * SR)
    if i >= N or i < 0: return
    l, r = sig if isinstance(sig, tuple) else (sig, sig)
    n = min(len(l), N - i)
    gl = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2); gr = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    bl[i:i + n] += l[:n] * gl; br[i:i + n] += r[:n] * gr


# ---------------------------------------------------------------- music bed (same instruments, looped)
def pad_voice(freq, dur, detune=0.006):
    n = int(dur * SR); t = t_arr(n); l = np.zeros(n); r = np.zeros(n)
    for k, amp in [(1, 1.0), (2, 0.35), (3, 0.16), (4, 0.08), (5, 0.04)]:
        ph = rng.uniform(0, 2 * np.pi)
        l += amp * np.sin(2 * np.pi * freq * k * (1 - detune) * t + ph)
        r += amp * np.sin(2 * np.pi * freq * k * (1 + detune) * t + ph * 0.7)
    trem = 1 + 0.06 * np.sin(2 * np.pi * 0.25 * t)
    return l * trem, r * trem


LOOP = [  # the 15 s progression, each chord held 4 s (2 bars @ 120 BPM)
    (['F3', 'A3', 'C4', 'E4', 'G4'], 'F2'), (['A3', 'C4', 'E4', 'G4', 'B4'], 'A2'), (['C4', 'E4', 'G4', 'B4', 'D5'], 'C2'),
    (['D3', 'F3', 'A3', 'C4', 'E4'], 'D2'), (['F3', 'A3', 'C4', 'E4', 'G4'], 'F2'), (['G3', 'B3', 'D4', 'F#4', 'A4'], 'G2'),
    (['C4', 'E4', 'G4', 'B4', 'D5'], 'C2'),
]
BAR = 4.0
CHORDS = []
t0 = 0.0; k = 0
while t0 < DUR:
    notes, root = LOOP[k % len(LOOP)]
    CHORDS.append((t0, min(t0 + BAR, DUR), notes, root)); t0 += BAR; k += 1
# finish on C major under the final title
fin = sstart('outro') + fr(SC['outro']['cues'][-1]['from'] + SC['outro']['cues'][-1]['dur'] - SC['outro']['from'])
CHORDS = [c for c in CHORDS if c[0] < fin - 0.5]
CHORDS[-1] = (CHORDS[-1][0], fin, CHORDS[-1][2], CHORDS[-1][3])
CHORDS.append((fin, DUR, ['C4', 'E4', 'G4', 'B4', 'D5'], 'C2'))

padL = np.zeros(N); padR = np.zeros(N)
for s, e, notes, _ in CHORDS:
    dur = e - s + 0.8; n = int(dur * SR); env = env_adsr(n, 0.6, 0.4, 0.85, 0.9); i = int(s * SR)
    for nm in notes:
        l, r = pad_voice(note(nm), dur); m = min(n, N - i)
        padL[i:i + m] += (l * env)[:m]; padR[i:i + m] += (r * env)[:m]
padL = lowpass(padL, 1800); padR = lowpass(padR, 1800)
add((padL, padR), 0, 0.045)

# energy per scene (smoothly interpolated -> no abrupt changes)
ENERGY = {'intro': 0.45, 'what': 0.55, 'scan': 0.75, 'ai': 1.0, 'results': 0.9, 'text': 0.6, 'uses': 0.8, 'howto': 0.65, 'outro': 0.5}
pts_t, pts_v = [], []
for s in TL['scenes']:
    pts_t += [fr(s['from']) + 1.5, fr(s['from'] + s['dur']) - 1.5]; pts_v += [ENERGY[s['id']]] * 2
energy = lambda t: float(np.interp(t, pts_t, pts_v))

# plucked arpeggio, 8th notes
arp = [0, 2, 1, 3, 2, 4, 3, 1]; tt = 2.0; k = 0
while tt < fin - 0.25:
    ch = next(c for c in CHORDS if c[0] <= tt < c[1])
    f0 = note(ch[2][arp[k % 8]]) * 2; n = int(0.45 * SR); t = t_arr(n)
    tone = (np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(4 * np.pi * f0 * t) + 0.08 * np.sin(6 * np.pi * f0 * t)) * np.exp(-t * 9)
    add(tone, tt, 0.03 * (0.75 + 0.25 * (k % 2 == 0)) * (0.5 + 0.5 * energy(tt)), pan=0.35 if k % 2 else -0.35)
    tt += 0.25; k += 1

# sub bass, kick and hats scaled by energy
for s, e, _, root in CHORDS:
    if s >= fin: break
    g = energy(s)
    if g < 0.7: continue
    n = int((e - s) * SR); t = t_arr(n); f0 = note(root)
    b = (np.sin(2 * np.pi * f0 * t) + 0.25 * np.sin(4 * np.pi * f0 * t)) * env_adsr(n, 0.05, 0.1, 1.0, 0.2)
    b *= 0.35 + 0.65 * np.clip(((t + s) % 0.5) / 0.18, 0, 1)
    add(b, s, 0.06 * (g - 0.6) / 0.4)
beat = 0.0
while beat < fin:
    g = energy(beat)
    if g >= 0.7:
        w = (g - 0.6) / 0.4
        n = int(0.35 * SR); t = t_arr(n); f = 45 + 90 * np.exp(-t * 30)
        add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11), beat, (0.09 if int(beat * 2) % 2 == 0 else 0.06) * w)
        n = int(0.06 * SR); add(highpass(rng.standard_normal(n), 7000) * np.exp(-t_arr(n) * 70), beat + 0.25, 0.03 * w, pan=0.25)
    beat += 0.5

# ---------------------------------------------------------------- sound effects (same designs as the 15 s video)
def whoosh(dur, f0, f1, gain, start, pan=0.0):
    n = int(dur * SR); y = bandpass_sweep(rng.standard_normal(n), f0, f1, q=2.2)
    add(y * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6, start, gain, pan)
def ping(freq, start, gain, decay=6.0, dur=1.2, pan=0.0, harm=True):
    n = int(dur * SR); t = t_arr(n); s = np.sin(2 * np.pi * freq * t)
    if harm: s += 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 4) + 0.15 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 8)
    add(s * np.exp(-t * decay) * np.clip(t / 0.004, 0, 1), start, gain, pan)
def click(start, gain=0.14, freq=2400):
    n = int(0.05 * SR); t = t_arr(n); add((np.sin(2 * np.pi * freq * t) + 0.5 * rng.standard_normal(n)) * np.exp(-t * 160), start, gain)
def pop(start, gain=0.06, freq=900, pan=0.0):
    n = int(0.16 * SR); t = t_arr(n); f = freq * (1 + 0.6 * np.exp(-t * 40))
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28), start, gain, pan)
def sweep(start, dur):
    whoosh(dur / 2, 900, 3800, 0.08, start, -0.1); whoosh(dur / 2, 3800, 900, 0.08, start + dur / 2, 0.1)
def shimmer(start, gain=0.03):
    for j, nm in enumerate(['C6', 'E6', 'G6', 'B6']): ping(note(nm), start + j * 0.06, gain, decay=5)
def tap(start): click(start, 0.13); pop(start + 0.02, 0.07, 700)


# scene transitions
for s in TL['scenes'][1:]:
    whoosh(1.0, 400, 3000, 0.10, fr(s['from']) - 0.5)
whoosh(1.2, 300, 3200, 0.16, 0.0)
# intro
s0 = sstart('intro')
tap(fr(44)); whoosh(0.9, 500, 5000, 0.14, fr(50)); ping(note('G5'), fr(80), 0.045, decay=4)
for i, w in enumerate(['प्रोडक्ट', 'पौधा', 'मशहूर', 'हाथ']): pop(word('intro', 1, w), 0.06, 900 + i * 120, 0.4)
shimmer(cue('intro', 2) + 0.3); sweep(cue('intro', 4), 2.0)
# what
sb = sstart('what')
tap(word('what', 1, 'कैमरे') - fr(4)); tap(word('what', 1, 'मौजूदा')); tap(word('what', 1, 'मौजूदा') + fr(34))
for i, w in enumerate(['चीज़ों', 'इमारतों', 'टेक्स्ट', 'अनुवाद', 'प्रोडक्ट्स']): pop(word('what', 3, w), 0.06, 800 + i * 110, 0.45)
whoosh(0.8, 300, 2600, 0.10, cue('what', 4))
# scan
cap = word('scan', 0, 'कैप्चर'); click(cap, 0.16); whoosh(0.3, 3000, 8000, 0.08, cap)
ping(note('E6'), cue('scan', 0) + 0.9, 0.05, decay=10); ping(note('A6'), cue('scan', 0) + 1.03, 0.05, decay=10)
sweep(cue('scan', 1) - fr(30), fr(50))
for i, w in enumerate(['आकार', 'रंग', 'बनावट', 'पैटर्न', 'संबंध']): pop(word('scan', 1, w), 0.05, 1000 + i * 120, 0.4)
for i in range(16): ping(note(['C7', 'E7', 'G7', 'D7'][i % 4]), cue('scan', 2) + fr(30) + fr(((i * 7) % 16) * 2), 0.014, decay=18, dur=0.4, pan=((i % 5) - 2) / 3, harm=False)
shimmer(cue('scan', 3) + fr(4))
for i, w in enumerate(['रंग', 'स्टाइल', 'डिज़ाइन']): pop(word('scan', 4, w), 0.06, 1100 + i * 120, 0)
whoosh(0.7, 2000, 500, 0.07, cue('scan', 5) + fr(10))
# ai
shimmer(cue('ai', 0) + fr(20), 0.025)
for i in range(3): ping(note(['E6', 'G6', 'C7'][i]), cue('ai', 2) + fr(20 + i * 8) + 1.2, 0.04, decay=7, pan=0.5)
for i in range(4): pop(cue('ai', 3) + fr(i * 6), 0.05, 900 + i * 100, 0)
whoosh(0.8, 300, 2600, 0.12, cue('ai', 4) + fr(8))
# results
whoosh(0.8, 300, 2600, 0.14, cue('results', 0) + fr(30)); whoosh(0.7, 2600, 300, 0.10, cue('results', 1) - fr(6))
sweep(cue('results', 1) + fr(14), fr(46)); whoosh(0.8, 300, 2600, 0.14, cue('results', 2) - fr(6))
for i, w in enumerate(['जूते', 'लिस्टिंग', 'शॉपिंग', 'वेब']): pop(word('results', 2, w), 0.06, 900 + i * 120, 0.3)
for i, w in enumerate(['कपड़ों', 'फ़र्नीचर', 'एक्सेसरीज़', 'रोज़मर्रा']): pop(word('results', 4, w), 0.06, 1000 + i * 110, 0.5)
tap(word('results', 5, 'कैमरे'))
# text
sweep(cue('text', 1), fr(50))
for w in ['कॉपी', 'सर्च कर', 'अनुवाद']: tap(word('text', 2, w) + fr(2))
ping(note('C6'), word('text', 2, 'कॉपी') + fr(22), 0.05, decay=6)
shimmer(word('text', 4, 'अनुवाद'), 0.035); whoosh(0.7, 300, 2600, 0.10, word('text', 5, 'कॉपी'))
# uses
for i in range(1, 5): whoosh(0.6, 600, 3500, 0.07, cue('uses', i) - 0.2)
for i in range(1, 4): shimmer(cue('uses', i) + fr(16), 0.022)
shimmer(word('uses', 4, 'मेन्यू') + fr(20), 0.03)
ping(note('A4'), cue('uses', 5) + fr(10), 0.05, decay=3)
# howto
ta = word('howto', 1, 'आइकॉन'); tap(ta); whoosh(0.9, 500, 5000, 0.12, ta + fr(6))
ga = word('howto', 2, 'मौजूदा'); tap(ga); tap(ga + fr(40))
ca = word('howto', 3, 'कैप्चर'); click(ca, 0.16); whoosh(0.3, 3000, 8000, 0.08, ca)
whoosh(0.8, 300, 2600, 0.14, cue('howto', 4) + fr(30))
for i, w in enumerate(['प्रोडक्ट्स', 'कॉपी', 'अनुवाद', 'और जानकारी']): pop(word('howto', 5, w), 0.06, 900 + i * 120, 0)
# outro
for i, w in enumerate(['कंप्यूटर', 'आर्टिफ़िशियल', 'टेक्स्ट', 'विज़ुअल']): pop(word('outro', 0, w), 0.06, 900 + i * 120, 0.4)
whoosh(1.0, 6000, 400, 0.08, fin - 0.6)
for i, nm in enumerate(['C6', 'E6', 'G6']): ping(note(nm), fin + fr(10 + i * 8), 0.07, decay=2.2, dur=2.0)
n = int(3.0 * SR); t = t_arr(n)
add(sum(np.sin(2 * np.pi * note(nm) * 2 * t + i) for i, nm in enumerate(['C5', 'E5', 'G5', 'B5', 'D6'])) * np.exp(-t * 1.0) * np.clip(t / 0.05, 0, 1), fin + 0.2, 0.012)

# ---------------------------------------------------------------- master: bed, ducking, narration
t_all = np.arange(N) / SR
fade = np.ones(N); fade[:int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR))
fo = t_all >= DUR - 1.6
fade[fo] = np.cos(np.clip((t_all[fo] - (DUR - 1.6)) / 1.6, 0, 1) * np.pi / 2) ** 2
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max()); L /= peak; R /= peak
L = np.tanh(1.2 * L) / np.tanh(1.2); R = np.tanh(1.2 * R) / np.tanh(1.2)

voice = np.zeros(N)
for s in TL['scenes']:
    for c in s['cues']:
        with wave.open(os.path.join(ROOT, 'public', c['file']), 'rb') as w:
            assert w.getframerate() == SR
            x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        x /= np.abs(x).max() + 1e-9
        i = int(fr(c['from']) * SR); m = min(len(x), N - i)
        voice[i:i + m] += x[:m]
win = int(0.05 * SR)
rms = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode='same'))
act = np.convolve((rms > 0.02).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), mode='same')
duck = 1 - 0.5 * np.clip(act, 0, 1)
L *= duck * 0.55; R *= duck * 0.55
L += voice * 0.9; R += voice * 0.9
peak = max(np.abs(L).max(), np.abs(R).max()); L /= peak; R /= peak
L *= 10 ** (-1.5 / 20); R *= 10 ** (-1.5 / 20)

tmp = os.path.join(ROOT, 'public', 'long', '_premaster.wav')
with wave.open(tmp, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
out = os.path.join(ROOT, 'public', 'long', 'soundtrack_6min.wav')
# loudness-normalise to -14 LUFS (true peak -1.5 dB); same target as the 15 s mix
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
os.remove(tmp)
print('wrote', out, f'{DUR:.1f}s')
