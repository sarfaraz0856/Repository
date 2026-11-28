# Fukushima: join the cold open and 12 chapters into the film, make the 720p copy, subtitles and the upload text.
# Usage: python3 fk_kit.py OUTDIR   (run from chernobyl/; needs out/fkcut/fk0..fk12.mp4 + .json)
import sys, os, json, subprocess, re
S = '/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad'
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
SECS = [f'fk{i}' for i in range(13)]
NAMES = ['Cold open', 'The Quiet Coast', 'The Great Earthquake', 'The Wave', 'Station Blackout', 'The Meltdown', 'The First Explosion',
         'Three Reactors', 'The Fukushima 50', 'Water from the Sky', 'The Empty Towns', 'The Water Problem', 'The Lesson']
L = json.load(open(f'{S}/doc/lines.json')); EN = json.load(open('fk_en.json'))
info = {s: json.load(open(f'out/fkcut/{s}.json')) for s in SECS}
off = {}; t = 0.0
for s in SECS: off[s] = t; t += info[s]['LC']
TOTAL = t
M = f'{OUT}/Fukushima-Documentary-in-Hindi-1080p.mp4'; M7 = f'{OUT}/Fukushima-Documentary-in-Hindi-720p.mp4'
lst = f'{OUT}/list.txt'; open(lst, 'w').write(''.join(f"file '{os.path.abspath(f'out/fkcut/{s}.mp4')}'\n" for s in SECS))
title = 'Fukushima 2011 (Hindi documentary)'
subprocess.run(['ffmpeg', '-v', 'warning', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-map', '0:v', '-map', '0:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                '-ar', '48000', '-movflags', '+faststart', '-metadata', f'title={title}', M], check=True)
os.remove(lst)
for p in (1, 2):
    c = ['nice', 'ffmpeg', '-v', 'warning', '-y', '-i', M, '-vf', 'scale=1280:720:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-b:v', '1500k',
         '-maxrate', '3M', '-bufsize', '6M', '-pass', str(p), '-passlogfile', f'{OUT}/p720', '-profile:v', 'high']
    c += (['-an', '-f', 'mp4', '/dev/null'] if p == 1 else ['-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', '-metadata', f'title={title}', M7])
    subprocess.run(c, check=True)
for f in os.listdir(OUT):
    if f.startswith('p720'): os.remove(f'{OUT}/{f}')
def ts(x):
    x = max(0, x); return f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round((x % 1) * 1000)) % 1000:03d}'
NUM = [('ग्यारह मार्च, दो हज़ार ग्यारह', '11 मार्च, 2011'), ('दो बजकर छियालीस मिनट', '2:46'), ('बारह मार्च', '12 मार्च'), ('तीन बजकर छत्तीस मिनट', '3:36'),
       ('चौदह मार्च', '14 मार्च'), ('पंद्रह मार्च', '15 मार्च'), ('सत्रह मार्च', '17 मार्च'), ('दो हज़ार तेईस', '2023'), ('यूनिट एक, दो और तीन', 'यूनिट 1, 2 और 3'),
       ('चार, पाँच और छह', '4, 5 और 6'), ('यूनिट चार', 'यूनिट 4'), ('यूनिट एक से चार', 'यूनिट 1 से 4'), ('यूनिट एक', 'यूनिट 1'), ('यूनिट तीन', 'यूनिट 3'), ('यूनिट दो', 'यूनिट 2'),
       ('फिर दो और तीन', 'फिर 2 और 3'), ('रिक्टर स्केल पर, नौ', 'रिक्टर स्केल पर, 9'), ('पचास मिनट', '50 मिनट'), ('छह मीटर', '6 मीटर'), ('चौदह से पंद्रह मीटर', '14 से 15 मीटर'),
       ('दो हज़ार डिग्री', '2,000 डिग्री'), ('दो किलोमीटर, फिर दस, फिर बीस', '2 किलोमीटर, फिर 10, फिर 20'), ('डेढ़ लाख', '1.5 लाख'), ('लेवल सात', 'लेवल 7'),
       ('हज़ार से ज़्यादा', '1,000 से ज़्यादा'), ('सौ किलोमीटर', '100 किलोमीटर'), ('तीस से चालीस साल', '30 से 40 साल'), ('छह मिनट', '6 मिनट'), ('छह रिएक्टर', '6 रिएक्टर')]
hi = []; en = []; chap = []
for s, name in zip(SECS, NAMES):
    o = off[s]; st = info[s]['starts']; du = info[s]['dur']; chap.append((o, name))
    for i, (t0, txt) in enumerate(L[s]):
        for a, b in NUM: txt = txt.replace(a, b)
        ph = [p.strip() for p in txt.split('|')]; tot = sum(len(p) for p in ph); tt = o + st[i] + 0.05
        groups = []; cur = ''
        for p in ph:
            if cur and len(cur) + len(p) > 46: groups.append(cur); cur = p
            else: cur = (cur + ' ' + p).strip()
        groups.append(cur)
        for g in groups:
            d = du[i] * len(g) / max(1, tot); hi.append([tt, tt + d + 0.2, g]); tt += d
        e = EN[s][i]; parts = [e] if len(e) <= 84 else [x.strip() for x in re.split(r'(?<=[.,]) (?=[A-Z\"])', e, 1)]
        tt = o + st[i] + 0.05; tl = sum(len(p) for p in parts)
        for p in parts: d = du[i] * len(p) / tl; en.append([tt, tt + d + 0.2, p]); tt += d
for cues in (hi, en):
    for k in range(len(cues) - 1): cues[k][1] = min(cues[k][1], cues[k + 1][0] - 0.02)
open(f'{OUT}/Fukushima-Subtitles-Hindi.srt', 'w').write(''.join(f'{k + 1}\n{ts(a)} --> {ts(b)}\n{x}\n\n' for k, (a, b, x) in enumerate(hi)))
open(f'{OUT}/Fukushima-Subtitles-English.srt', 'w').write(''.join(f'{k + 1}\n{ts(a)} --> {ts(b)}\n{x}\n\n' for k, (a, b, x) in enumerate(en)))
mmss = lambda x: f'{int(x // 60)}:{int(x % 60):02d}'
chap[0] = (0.0, 'Cold open')
CH = '\n'.join(f'{mmss(o)} {n}' for o, n in chap)
json.dump(dict(total=TOTAL, chapters=chap), open(f'{OUT}/timing.json', 'w'))
print('TOTAL', round(TOTAL, 2)); print(CH)
