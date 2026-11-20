"""Join converted lines into one voiceover with natural pauses; write exact word timings (Hinglish words) for the video."""
import json, re, numpy as np, soundfile as sf
from lines_p3 import LINES
SR = 16000
PARA_START = {3, 6, 10, 13, 18, 20, 24, 27}
def trim(x, thr_db=-38):
    h = 160; e = np.array([20*np.log10(np.sqrt(np.mean(x[i:i+h]**2)) + 1e-9) for i in range(0, len(x)-h, h)])
    on = np.where(e > e.max() + thr_db + 10)[0]
    if not len(on): return x
    a, b = max(0, on[0]*h - 800), min(len(x), (on[-1]+1)*h + 1600)
    return x[a:b]
out, words, t = [np.zeros(int(0.3*SR))], [], 0.3
for i, (roman, _) in enumerate(LINES):
    if i in PARA_START: out.append(np.zeros(int(0.35*SR))); t += 0.35
    x = trim(sf.read(f'lines_vc/{i:02d}.wav')[0])
    x = x / (np.sqrt(np.mean(x**2)) + 1e-9) * 0.08                # same loudness for every line
    d = len(x) / SR; ws = roman.split(); L = [len(re.sub(r'[^\w]', '', w)) + 1 for w in ws]; tot = sum(L); acc = 0
    for w, l in zip(ws, L):
        words.append({'w': w, 's': round(t + 0.05 + (d - 0.15) * acc / tot, 3), 'e': round(t + 0.05 + (d - 0.15) * (acc + l) / tot, 3)}); acc += l
    out.append(x); t += d
    gap = 0.45 if roman[-1] in '.!' else 0.3 if roman[-1] == ':' else 0.2
    out.append(np.zeros(int(gap*SR))); t += gap
y = np.concatenate(out); y = y / np.max(np.abs(y)) * 0.9
sf.write('vo_p3_16k.wav', y, SR)
json.dump(words, open('words_p3.json', 'w'), ensure_ascii=False, indent=0)
print('voiceover %.1fs, words %d' % (len(y)/SR, len(words)))
