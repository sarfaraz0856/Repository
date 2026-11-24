"""Full OTP documentary soundtrack: the same soft music bed and smooth ducking as the UPI documentary,
scene-1 effects exactly as in the approved OTP 30 s sample, scene effects for scenes 2-11 (synced to the same
word timings as the visuals) and the narration.
Output: public/otp/full_soundtrack.wav (48 kHz stereo, -14 LUFS) and public/otp/narration_only.wav.
English dub (later): OTP_DUB=en reads public/otp/vo_en/ and writes full_soundtrack_en.wav."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
DUB = os.environ.get('OTP_DUB', '')
VO_DIR = 'otp/vo_' + DUB + '/' if DUB else 'otp/vo/'
SUF = '_' + DUB if DUB else ''
SR = 48000
FT = json.load(open(os.path.join(ROOT, 'src', 'otp', 'full_timeline.json')))
B = json.load(open(os.path.join(ROOT, 'src', 'otp', 'timeline.json')))['beats']
FPS = FT['fps']; DUR = FT['durationInFrames'] / FPS; N = int(SR * DUR)
SC = {s['id']: s for s in FT['scenes']}
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


def pad_voice(freq, dur, detune=0.006):
    n = int(dur * SR); t = t_arr(n); l = np.zeros(n); r = np.zeros(n)
    for k, amp in [(1, 1.0), (2, 0.35), (3, 0.16), (4, 0.08), (5, 0.04)]:
        ph = rng.uniform(0, 2 * np.pi)
        l += amp * np.sin(2 * np.pi * freq * k * (1 - detune) * t + ph); r += amp * np.sin(2 * np.pi * freq * k * (1 + detune) * t + ph * 0.7)
    return l, r


# ---------------- music bed: sample's opening chords for scene 1, then a 4-chord loop, final C chord
t_q, t_title, s1end = fr(B['q1']) - 0.6, fr(B['title']), 30.0
t_net = t_q
CH = [(0, 4, ['A3', 'C4', 'E4', 'G4'], 'A2'), (4, 8, ['F3', 'A3', 'C4', 'E4'], 'F2'), (8, t_q, ['C4', 'E4', 'G4', 'B4'], 'C2'),
      (t_q, t_q + 4, ['D3', 'F3', 'A3', 'C4'], 'D2'), (t_q + 4, t_title, ['G3', 'B3', 'D4', 'F#4'], 'G2'), (t_title, s1end, ['C4', 'E4', 'G4', 'B4', 'D5'], 'C2')]
LOOP = [(['A3', 'C4', 'E4', 'G4'], 'A2'), (['F3', 'A3', 'C4', 'E4'], 'F2'), (['C4', 'E4', 'G4', 'B4'], 'C2'), (['G3', 'B3', 'D4', 'F#4'], 'G2')]
s12 = SC['s10']; last = s12['cues'][-1]; fin = fr(last['from'] + last['dur'])
t0 = s1end; k = 0
while t0 < fin - 0.5:
    e = min(t0 + 4.0, fin)
    CH.append((t0, e, LOOP[k % 4][0], LOOP[k % 4][1])); t0 = e; k += 1
CH.append((fin, DUR, ['C4', 'E4', 'G4', 'B4', 'D5'], 'C2'))
pL = np.zeros(N); pR = np.zeros(N)
for s, e, notes, _ in CH:
    d = e - s + 0.9; n = int(d * SR); ev = env(n, 0.5, 0.4, 0.85, 1.0); i = int(s * SR)
    for nm in notes:
        l, r = pad_voice(note(nm), d); m = min(n, N - i); pL[i:i + m] += (l * ev)[:m]; pR[i:i + m] += (r * ev)[:m]
add((lowpass(pL, 1800), lowpass(pR, 1800)), 0, 0.045)

ENERGY = {'s1': 0.6, 's2': 0.5, 's3': 0.65, 's4': 0.75, 's5': 0.8, 's6': 0.7, 's7': 0.6, 's8': 0.55, 's9': 0.5, 's10': 0.75}
pt, pv = [], []
for s in FT['scenes']:
    pt += [fr(s['from']) + 1.5, fr(s['from'] + s['dur']) - 1.5]; pv += [ENERGY[s['id']]] * 2
energy = lambda t: float(np.interp(t, pt, pv))
arp = [0, 2, 1, 3, 2, 1, 3, 2]; tt = 1.0; k = 0
while tt < fin - 0.3:   # soft, slower plucks (was 4 notes/s an octave higher - tiring over 10 minutes)
    ch = next(c for c in CH if c[0] <= tt < c[1]); f0 = note(ch[2][arp[k % 8] % len(ch[2])])
    n = int(0.9 * SR); t = t_arr(n)
    add((np.sin(2 * np.pi * f0 * t) + 0.12 * np.sin(4 * np.pi * f0 * t)) * np.exp(-t * 4.5) * np.clip(t / 0.012, 0, 1), tt, 0.02 * energy(tt), pan=0.25 if k % 2 else -0.25)
    tt += 0.5; k += 1
beat = s1end   # the approved sample has no kick drum
while beat < fin:
    g = energy(beat) if beat >= s1end else (1.0 if beat < t_title else 0)
    if g >= 0.7:
        w = (g - 0.6) / 0.4 if beat >= s1end else 1.0
        n = int(0.35 * SR); t = t_arr(n); fq = 45 + 90 * np.exp(-t * 30)
        add(np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-t * 11), beat, 0.045 * w)
    beat += 1.0


# ---------------- effects
def whoosh(dur, f0, f1, gain, start, pan=0.0):
    n = int(dur * SR); add(bandpass_sweep(rng.standard_normal(n), f0, f1, q=2.2) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6, start, gain, pan)
def ping(freq, start, gain, decay=6.0, dur=1.2, pan=0.0):
    n = int(dur * SR); t = t_arr(n)
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 4)
    add(s * np.exp(-t * decay) * np.clip(t / 0.004, 0, 1), start, gain, pan)
def click(start, gain=0.12, freq=1500):
    n = int(0.05 * SR); t = t_arr(n); add((np.sin(2 * np.pi * freq * t) + 0.1 * lowpass(rng.standard_normal(n), 3000)) * np.exp(-t * 160) * np.clip(t / 0.002, 0, 1), start, gain * 0.7)
def pop(start, gain=0.05, freq=900, pan=0.0):
    n = int(0.16 * SR); t = t_arr(n); f = freq * (1 + 0.6 * np.exp(-t * 40)); add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28), start, gain, pan)
def tap(start, gain=1.0): click(start, 0.11 * gain); pop(start + 0.015, 0.06 * gain, 700)
def blip(start, freq, gain=0.03, pan=0.0):   # soft rounded tick, pitched down
    n = int(0.12 * SR); t = t_arr(n); add(np.sin(2 * np.pi * freq * 0.55 * t) * np.exp(-t * 30) * np.clip(t / 0.006, 0, 1), start, gain * 0.6, pan)
def chime(start, g=0.055):
    for j, nm in enumerate(['C5', 'E5', 'G5', 'C6']): ping(note(nm), start + j * 0.07, g * 0.7, decay=4)
def buzz(start, g=0.05):   # soft low two-note 'error' tone (replaces the harsh square-wave buzz)
    for j, f in enumerate((330, 262)):
        n = int(0.32 * SR); t = t_arr(n); add(np.sin(2 * np.pi * f * t) * np.exp(-t * 7) * np.clip(t / 0.01, 0, 1), start + j * 0.14, g * 0.9)


# scene 1 – identical recipe to the approved OTP sample
whoosh(1.4, 250, 2600, 0.10, 0.0)
click(fr(B['tap']), 0.08); pop(fr(B['tap']) + 0.015, 0.05, 700)
whoosh(0.5, 600, 2400, 0.04, fr(B['otpScreen']))
ping(note('A5'), fr(B['sms']), 0.05, decay=9); ping(note('E6'), fr(B['sms']) + 0.1, 0.045, decay=9)
ping(note('C6'), fr(B['code']) + 0.1, 0.03, decay=7)
for k3, d3 in enumerate(B['digits']): click(fr(d3), 0.07, 1300 + 40 * k3)
chime(fr(B['success']), 0.05)
whoosh(0.9, 400, 3000, 0.07, fr(B['q1']) - 0.5)
for k3 in ('q1', 'q2', 'q3'): pop(fr(B[k3]), 0.05, 760)
n = int(2.5 * SR); t = t_arr(n); fsub = 55 * (1 + 0.5 * np.exp(-t * 6))
add(np.sin(2 * np.pi * np.cumsum(fsub) / SR) * np.exp(-t * 2.2), t_title, 0.2); whoosh(1.2, 5000, 300, 0.08, t_title - 0.5)


# helpers mirroring src/upi/full/tl.ts
def c(sid, i): return fr(SC[sid]['cues'][i]['from'])
def w(sid, i, word):
    q = SC[sid]['cues'][i]; txt = q['text']; idx = max(0, txt.find(word))
    return fr(round(q['from'] + q['dur'] * idx / len(txt)))


for s in FT['scenes'][1:]:
    whoosh(1.0, 400, 3200, 0.09, fr(s['from']) - 0.45)          # scene transition
def sms(t0):
    ping(note('A5'), t0, 0.045, decay=9); ping(note('E6'), t0 + 0.1, 0.04, decay=9)
def keys(t0, n=6, step=4 / 30):
    for k2 in range(n): click(t0 + k2 * step, 0.06, 1300 + 40 * k2)
# s2: what is OTP
for i in (2, 4, 5): pop(c('s2', i), 0.04, 780)
keys(c('s2', 6) + 0.4); chime(c('s2', 7) + 1.3, 0.04)
# s3: parts appear + packets
for i in (1, 2, 3, 4, 5): pop(c('s3', i), 0.04, 700 + 40 * i)
chime(c('s3', 6) + 0.5, 0.035)
# s4: random digits roll, settle; combinations; hash
for k2 in range(10): click(w('s4', 1, 'Random') + k2 * 0.12, 0.035, 900 + 60 * k2)
ping(note('A5'), w('s4', 1, 'Random') + 1.4, 0.04, decay=8)
whoosh(0.8, 300, 2500, 0.04, c('s4', 5) + 0.2); ping(note('C6'), c('s4', 5) + 1.7, 0.035, decay=6)
pop(c('s4', 6), 0.04, 760); whoosh(0.6, 2000, 500, 0.04, w('s4', 8, 'Hash')); ping(note('G5'), w('s4', 8, 'Hash') + 0.6, 0.035, decay=7)
# s5: message hops, SMS arrives, autofill, resend
for i in (1, 2): whoosh(0.6, 800, 2800, 0.035, c('s5', i) + 0.3)
sms(c('s5', 4)); ping(note('E6'), w('s5', 6, 'Autofill'), 0.03, decay=10); keys(w('s5', 6, 'Autofill') + 1.0)
tap(w('s5', 9, 'Active'))
# s6: checks, wrong attempts, approve, used
for k2 in range(3): ping(note('E5'), c('s6', 2) + 0.4 + k2 * 0.5, 0.03, decay=10)
buzz(c('s6', 4) + 0.35, 0.04); buzz(c('s6', 4) + 1.0, 0.04); buzz(c('s6', 5), 0.04)
chime(c('s6', 6), 0.05); pop(c('s6', 7), 0.04, 600)
# s7: authenticator, key share, match
ping(note('C6'), c('s7', 1), 0.03, decay=8); whoosh(0.7, 600, 2400, 0.035, w('s7', 3, 'Secret'))
ping(note('E5'), c('s7', 5) + 1.3, 0.035, decay=8); ping(note('E5'), c('s7', 6) + 1.0, 0.035, decay=8); chime(w('s7', 7, 'Match'), 0.045)
# s8: fraud
buzz(c('s8', 1) + 0.3, 0.04); pop(c('s8', 3), 0.05, 520); buzz(c('s8', 4) + 0.3, 0.04); buzz(c('s8', 6) + 0.3, 0.04); buzz(c('s8', 9), 0.04)
# s9: tips
for i in (1, 2, 3, 4, 5, 6): pop(c('s9', i), 0.035, 780)
chime(c('s9', 7) + 0.4, 0.04)
# s10: future, recap, like / subscribe
ping(note('C6'), w('s10', 1, 'Passkeys'), 0.035, decay=5); sms(w('s10', 5, 'Phone')); chime(w('s10', 6, 'Approve'), 0.045)
tap(w('s10', 7, 'Like')); tap(w('s10', 7, 'Subscribe')); ping(note('C6'), w('s10', 7, 'Subscribe') + 0.2, 0.035, decay=6)
n = int(3.0 * SR); t = t_arr(n); fsub = 55 * (1 + 0.5 * np.exp(-t * 6))
add(np.sin(2 * np.pi * np.cumsum(fsub) / SR) * np.exp(-t * 1.8), fin - 0.3, 0.2); whoosh(1.2, 5000, 300, 0.08, fin - 0.8)
add(sum(np.sin(2 * np.pi * note(nm) * 2 * t + i) for i, nm in enumerate(['C5', 'E5', 'G5', 'B5', 'D6'])) * np.exp(-t * 0.8) * np.clip(t / 0.05, 0, 1), fin, 0.012)

# ---------------- master
t_all = np.arange(N) / SR
fade = np.clip((DUR - t_all) / 1.4, 0, 1); fade[:int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
L *= fade; R *= fade
L = lowpass(L, 6500, 2); R = lowpass(R, 6500, 2)
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
voice = np.zeros(N)
for s in FT['scenes']:
    for q in s['cues']:
        with wave.open(os.path.join(ROOT, 'public', q['file'].replace('otp/vo/', VO_DIR)), 'rb') as wv:
            x = np.frombuffer(wv.readframes(wv.getnframes()), np.int16).astype(float) / 32768
        x /= np.abs(x).max() + 1e-9; i = int(fr(q['from']) * SR); m = min(len(x), N - i); voice[i:i + m] += x[:m]
# ducking envelope at a 100 Hz control rate: voice-activity gate held across word gaps (1.2 s) then
# smoothed (0.6 s) -> the music dips once per sentence instead of pumping between words
hop = SR // 100; nf = N // hop
rms = np.sqrt((voice[:nf * hop] ** 2).reshape(nf, hop).mean(1))
gate = (np.convolve(rms, np.ones(5) / 5, 'same') > 0.02).astype(float)
# English lines are shorter than the Hindi ones -> longer pauses between lines; hold the dip
# across pauses up to ~3 s there, so the music doesn't swell up and drop again between sentences
HOLD = 320 if DUB == 'en' else 120; SMOOTH = 100 if DUB == 'en' else 60
gate = (np.convolve(gate, np.ones(HOLD), 'same') > 0).astype(float)
act = np.convolve(gate, np.hanning(SMOOTH) / np.hanning(SMOOTH).sum(), 'same')
act = np.interp(np.arange(N) / hop, np.arange(nf), act)
duck = 1 - 0.45 * np.clip(act, 0, 1)
L *= duck * 0.42; R *= duck * 0.42; L += voice * 0.9; R += voice * 0.9
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk; L *= 0.84; R *= 0.84


def write(path, l, r):
    with wave.open(path, 'wb') as wv:
        wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((np.stack([l, r], 1) * 32767).astype(np.int16).tobytes())


tmp = os.path.join(ROOT, 'public', 'otp', '_pre.wav'); write(tmp, L, R)
out = os.path.join(ROOT, 'public', 'otp', f'full_soundtrack{SUF}.wav')
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
os.remove(tmp)
v = voice / (np.abs(voice).max() + 1e-9) * 0.9
tmp2 = os.path.join(ROOT, 'public', 'otp', '_nar.wav'); write(tmp2, v, v)
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp2, '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', os.path.join(ROOT, 'public', 'otp', f'narration_only{SUF}.wav')], check=True)
os.remove(tmp2)
print('wrote', out, f'{DUR:.1f}s')
