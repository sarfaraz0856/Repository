# SRT for the 15:57 extended cut: narration spans re-placed exactly as mix.py does, then mapped onto the cut.
import json, sys
from scipy.io import wavfile
lang, linesf, wavdir, out = sys.argv[1:5]
GAP = 0.36
L = json.load(open(linesf))
import os
SL = json.load(open('/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad/dub/slots.json'))
def dur(p, sec, i):
    if os.path.exists(p): r, x = wavfile.read(p, mmap=True); return len(x) / r
    return SL[sec][i] - 0.35   # clip no longer on disk: the line's slot
def spans(sec):
    prev, r = 0.0, []
    for i, (t0, txt) in enumerate(L[sec]):
        d = dur(f'{wavdir}/G_{sec}_{i}.wav', sec, i); s = max(t0, prev + GAP); prev = s + d; r.append((s, prev, txt))
    return r
# the cut: (kind, source start, length) in order
cut = [('intro', 0, 16.528), ('film', 0, 45.8333), ('cx1', 0, 50), ('film', 45.8333, 50), ('cx2', 0, 50), ('film', 95.8333, 50), ('cx3', 0, 50),
       ('film', 145.8333, 54.1667), ('cx4', 0, 50), ('film', 200, 150), ('cx5', 0, 50), ('film', 350, 250), ('cx6', 0, 50), ('film', 600, 40.1)]
src = {k: spans(k) for k in ['intro', 'full12', 'cx1', 'cx2', 'cx3', 'cx4', 'cx5', 'cx6']}
cues = []; off = 0.0
for kind, a, n in cut:
    for s, e, txt in src['full12' if kind == 'film' else kind]:
        if e <= a or s >= a + n: continue
        s2, e2 = max(s, a), min(e, a + n - 0.05)
        parts = [p.strip() for p in txt.split('|') if p.strip()]
        # group the pause-marked parts into cues of at most ~44 characters
        groups, cur = [], ''
        for p in parts:
            if cur and len(cur) + len(p) > 44: groups.append(cur); cur = p
            else: cur = (cur + ' ' + p).strip()
        groups.append(cur)
        tot = sum(len(g) for g in groups); t = s2
        for g in groups:
            d = (e2 - s2) * len(g) / tot; cues.append((off + t - a, off + t - a + d, g)); t += d
    off += n
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000); return f'{h:02}:{m:02}:{s:02},{ms:03}'
with open(out, 'w', encoding='utf-8') as f:
    for i, (a, b, g) in enumerate(cues, 1):
        b = max(b, a + 0.9)
        if i < len(cues): b = min(b, cues[i][0] - 0.02)
        f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{g}\n\n')
print(lang, len(cues), 'cues, last ends', ts(cues[-1][1]), 'total', off)
