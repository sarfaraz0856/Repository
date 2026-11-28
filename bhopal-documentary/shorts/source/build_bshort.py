# Chernobyl YouTube Short (1080x1920): clips from the film cropped to 9:16, a new Hindi hook narration in the
# narrator's cloned voice, big Hindi subtitles, a title on top, a new score. Run from scratchpad/short.
import json, subprocess, os, sys
CFG = json.load(open(sys.argv[1])); SEC = CFG['sec']
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy.io import wavfile
S = "/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad"; R = "/home/user/Repository/bhopal-documentary"
import glob
CH = {c: glob.glob(f'{R}/chapter{c}/*.mp4')[0] for c in range(1, 16)}
DOC = f'{S}/doc'; W = CFG['work']; os.makedirs(W, exist_ok=True); GAP = 0.3; T0 = 0.2; TAIL = 1.6
HI = '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'; IN = '/usr/share/fonts/opentype/inter/'
lines = json.load(open(f'{DOC}/lines.json'))[SEC]
dur = [len(wavfile.read(f'{DOC}/G_{SEC}_{i}.wav')[1]) / 48000 for i in range(len(lines))]
starts = []; s = T0
for d in dur: starts.append(round(s, 3)); s += d + GAP
TOTAL = round(starts[-1] + dur[-1] + TAIL, 2)
# narration placement for mix.py
L = json.load(open(f'{DOC}/lines.json')); L[SEC] = [[starts[i], lines[i][1]] for i in range(len(lines))]; json.dump(L, open(f'{DOC}/lines.json', 'w'), ensure_ascii=False, indent=0)
# shots per line: (film time at 1x, crop centre 0..1, share of the line)
SHOTS = CFG['shots']
segs = []; cuts = []
for i, shots in enumerate(SHOTS):
    a = 0 if i == 0 else starts[i] - 0.15
    b = (starts[i + 1] - 0.15) if i + 1 < len(SHOTS) else TOTAL
    t = a
    for j, (ch, ft, cx, share) in enumerate(shots):
        d = (b - a) * share if j < len(shots) - 1 else b - t
        segs.append((ch, ft, cx, round(d, 3))); cuts.append(round(t, 3)); t += d
cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-y']
fc = []
for k, (ch, ft, cx, d) in enumerate(segs):
    src, st = CH[ch], ft
    cmd += ['-ss', f'{st:.3f}', '-t', f'{d + 0.05:.3f}', '-i', src]
    x = min(max(cx * 1920 - 303.75, 0), 1920 - 607.5)
    # a slow push-in on every shot
    fc.append(f'[{k}:v]crop=608:1080:{x:.0f}:0,scale=1188:2112:flags=lanczos,crop=1080:1920:(iw-ow)/2+0*t:(ih-oh)/2,'
              f"scale=w='1080*(1+0.035*t/{d:.2f})':h=-1:eval=frame:flags=bicubic,crop=1080:1920,setsar=1,fps=24,trim=0:{d:.3f},setpts=PTS-STARTPTS[v{k}]")
fc.append(''.join(f'[v{k}]' for k in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=0[base]')
# ---- overlays: gradients + title, subtitles, end card
def font(p, s): return ImageFont.truetype(p, s)
def stroke_text(d, xy, txt, f, fill, sw=7, anchor='ma'): d.text(xy, txt, font=f, fill=fill, anchor=anchor, stroke_width=sw, stroke_fill=(0, 0, 0))
g = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); px = g.load()
for y in range(1920):
    a = 0
    if y < 430: a = int(200 * (1 - y / 430) ** 1.3)
    if y > 1220: a = max(a, int(min(1, (y - 1220) / 210) ** 1.2 * 255))
    for x in range(1080): px[x, y] = (0, 0, 0, a)
d = ImageDraw.Draw(g)
fs = 92
while ImageDraw.Draw(g).textlength(CFG['title'], font=font(IN + 'Inter-Black.otf', fs)) > 990: fs -= 4
stroke_text(d, (540, 150 + (92 - fs) // 2), CFG['title'], font(IN + 'Inter-Black.otf', fs), (255, 214, 0), 8)
stroke_text(d, (540, 268), CFG['sub'], font(HI, 64), (255, 255, 255), 6)
g.save(f'{W}/grad.png')
subs = []
for i, (t0, txt) in enumerate(L[SEC]):
    ph = [p.strip() for p in txt.split('|')]; tot = sum(len(p) for p in ph); t = t0
    for j, p in enumerate(ph):
        dd = dur[i] * len(p) / tot; end = t + dd + (GAP if j == len(ph) - 1 else 0.05)
        im = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); f = font(HI, 76)
        words = p.split(); rows = ['']
        for w_ in words:
            test = (rows[-1] + ' ' + w_).strip()
            if dr.textlength(test, font=f) > 930 and rows[-1]: rows.append(w_)
            else: rows[-1] = test
        col = (255, 214, 0) if (i == 0 and j == 0) or i == len(L[SEC]) - 1 else (255, 255, 255)
        y0 = 1290 - (len(rows) - 1) * 50
        for r_, row in enumerate(rows): stroke_text(dr, (540, y0 + r_ * 100), row, f, col, 8)
        fn = f'{W}/sub_{i}_{j}.png'; im.save(fn); subs.append((fn, round(t - 0.05, 3), round(min(end, TOTAL), 3))); t += dd + 0.2
# end card: a red SUBSCRIBE button
im = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); f = font(IN + 'Inter-Black.otf', 58)
if CFG.get('link'):
    f2 = font(HI, 64); dr.rounded_rectangle((150, 860, 930, 1060), 26, fill=(220, 20, 20, 255))
    dr.text((540, 912), 'पूरी वीडियो देखें', font=f2, fill='white', anchor='mm'); dr.text((540, 1004), '▼  नीचे लिंक पर क्लिक करें  ▼', font=font(HI, 46), fill=(255, 235, 120), anchor='mm')
else:
    dr.rounded_rectangle((300, 900, 780, 1020), 22, fill=(220, 20, 20, 255)); dr.text((540, 960), 'SUBSCRIBE', font=f, fill='white', anchor='mm')
im.save(f'{W}/sub_end.png'); END0 = round(TOTAL - (5.0 if CFG.get('link') else 2.6), 2)
subs = [(fn, a_, min(b_, subs[k + 1][1] - 0.02) if k + 1 < len(subs) else b_) for k, (fn, a_, b_) in enumerate(subs)]
n0 = len(segs)
cmd += ['-loop', '1', '-t', str(TOTAL), '-i', f'{W}/grad.png']
SUBS_ON = not CFG.get('nosubs')
for fn, a, b in (subs if SUBS_ON else []): cmd += ['-loop', '1', '-t', str(TOTAL), '-i', fn]
cmd += ['-loop', '1', '-t', str(TOTAL), '-i', f'{W}/sub_end.png']
fc.append(f'[base][{n0}:v]overlay=0:0[o0]')
last = 'o0'
for k, (fn, a, b) in enumerate(subs if SUBS_ON else []):
    fc.append(f"[{n0 + 1 + k}:v]fade=t=in:st={a}:d=0.08:alpha=1[s{k}];[{last}][s{k}]overlay=0:0:enable='between(t,{a},{b})'[o{k + 1}]"); last = f'o{k + 1}'
ke = n0 + 1 + (len(subs) if SUBS_ON else 0)
fc.append(f"[{ke}:v]fade=t=in:st={END0}:d=0.25:alpha=1[se];[{last}][se]overlay=0:0:enable='gte(t,{END0})',fade=t=out:st={TOTAL - 0.4}:d=0.4,format=yuv420p[vout]")
cmd += ['-i', f'{W}/mix.wav', '-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', f'{ke + 1}:a', '-t', str(TOTAL),
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', '24',
        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', CFG['out']]
def ts(x):
    x = max(0, x); h = int(x // 3600); m = int(x % 3600 // 60); sec = x % 60
    return f'{h:02d}:{m:02d}:{int(sec):02d},{int(round((sec - int(sec)) * 1000)) % 1000:03d}'
OFF = 0.1
hp = []; t_ph = []
for i, (t0, txt) in enumerate(L[SEC]):
    ph = [p.strip() for p in txt.split('|')]; tot = sum(len(p) for p in ph); t = t0 + OFF
    for j, p in enumerate(ph):
        dd = dur[i] * len(p) / tot; hp.append((t, t + dd + (0.25 if j == len(ph) - 1 else 0.15), p)); t += dd + 0.2
open(f"{W}/hi.srt", 'w').write(''.join(f'{k + 1}\n{ts(a)} --> {ts(min(b, TOTAL))}\n{p}\n\n' for k, (a, b, p) in enumerate(hp)))
if CFG.get('en'):
    open(f"{W}/en.srt", 'w').write(''.join(f'{i + 1}\n{ts(L[SEC][i][0] + OFF)} --> {ts(min(L[SEC][i][0] + OFF + dur[i] + 0.25, TOTAL))}\n{e}\n\n' for i, e in enumerate(CFG['en'])))
json.dump({'TOTAL': TOTAL, 'starts': starts, 'cuts': cuts, 'boom': 0.55}, open(f'{W}/timeline.json', 'w'))
json.dump(cmd, open(f'{W}/cmd.json', 'w'))
print('TOTAL', TOTAL, 'segments', len(segs), 'subs', len(subs)); print('starts', starts)
