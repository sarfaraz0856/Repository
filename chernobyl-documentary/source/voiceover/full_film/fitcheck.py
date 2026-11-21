import json, wave, sys
L = json.load(open('lines.json'))['full12']
P = sys.argv[1] if len(sys.argv) > 1 else 'qf'
GAP = 0.36
bounds = [0, 55, 115, 175, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780]
lim = {2: 16.8, 13: 80.0, 18: 108.6}   # 1x-time hard limits for the explosion, the announcement and the ch2 title
prev = 0; bad = 0
for i, (t0, txt) in enumerate(L):
    with wave.open(f'{P}_full12_{i}.wav') as w: d = w.getnframes() / w.getframerate()
    s = max(t0, prev + GAP); e = s + d; prev = e
    ch = max(k for k in range(13) if bounds[k] <= t0 * 1.2) + 1
    end_lim = (bounds[ch] - 0.8) / 1.2
    if ch == 13: end_lim = 762.0 / 1.2
    if i in lim: end_lim = min(end_lim, lim[i] / 1.2)
    late = s - t0
    flag = ('OVER %.2f' % (e - end_lim)) if e > end_lim else ''
    if flag or late > 1.5: bad += 1; print(f'{i:2d} ch{ch:2d} start {t0:6.2f}->{s:6.2f} end {e:6.2f} lim {end_lim:6.2f} {flag} late {late:.1f} | {txt[:40]}')
print('problems', bad)
