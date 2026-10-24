"""Surah An-Nas vertical short (1080x1920) on real stock footage, text synced per ayah.

Footage (Adobe Stock, free licence; not committed, put the files in clips/).
BG=sunset (default):
  sunset_beach.mov #835719321 sunset over the sea, played at half speed (60 fps source)
BG=montage:
  haram.mov      #774469748  Masjid al-Haram, King Abdul Aziz gate, Makkah
  qiblatayn.mov  #1353238707 Masjid al-Qiblatayn courtyard, Madinah
  katara.mov     #475374010  Katara mosque, Doha
  aerial_v.mov   #536823962  aerial view of a mosque
  szgm_d2n.mov   #430839541  Sheikh Zayed Grand Mosque, day-to-night time-lapse
  szgm_tl.mov    #317099983  Sheikh Zayed Grand Mosque, dusk time-lapse
  szgm_lit.mov   #793952640  Sheikh Zayed Grand Mosque, night time-lapse
  moon.mov       #350772387  full moon rise time-lapse
Shots change in the pauses between ayat with a dissolve.

Usage: [BG=sunset|montage] python3 render.py recitation.mp3 out.mp4 [preview_seconds ...]
"""
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = sys.argv[1]
OUT = sys.argv[2]
PREVIEW = sys.argv[3:]
WORK = os.path.join(HERE, 'work')
os.makedirs(WORK, exist_ok=True)

W, H, FPS = 1080, 1920, 30
WHITE = (255, 253, 246)
SOFT = (236, 236, 236)

def font(name, size):
    return ImageFont.truetype(os.path.join(HERE, 'fonts', name), size, layout_engine=ImageFont.Layout.RAQM)

F_TITLE = font('Amiri-Bold.ttf', 66)
F_SUB = font('Poppins-SemiBold.ttf', 30)
F_TR = font('Poppins-SemiBold.ttf', 40)

# --- timeline (seconds), from silence detection on the recitation -------------
SEGS = [
    # start, end, arabic, english, ayah no (0 = not an ayah)
    (0.68, 6.14, "أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ",
     "I seek refuge in Allah from Satan, the accursed.", 0),
    (6.58, 12.57, "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
     "In the name of Allah, the Most Gracious, the Most Merciful.", 0),
    (13.57, 20.55, "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
     "Say, “I seek refuge in the Lord of mankind,", 1),
    (21.35, 25.67, "مَلِكِ ٱلنَّاسِ", "the King of mankind,", 2),
    (26.63, 31.38, "إِلَـٰهِ ٱلنَّاسِ", "the God of mankind,", 3),
    (32.15, 39.62, "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
     "from the evil of the retreating whisperer —", 4),
    (40.66, 47.90, "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
     "who whispers into the hearts of mankind —", 5),
    (48.74, 55.60, "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ", "from among the jinn and mankind.”", 6),
    (56.76, 64.40, "صَدَقَ ٱللَّهُ ٱلْعَظِيمُ", "Allah the Almighty has spoken the truth.", 0),
]
DIGITS = "٠١٢٣٤٥٦٧٨٩"

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', AUDIO, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
DUR = len(raw) / 2 / 16000
NFR = int(math.ceil(DUR * FPS))

# --- footage edit -------------------------------------------------------------
def gap_mid(i):
    """Middle of the pause before SEGS[i]."""
    return (SEGS[i - 1][1] + SEGS[i][0]) / 2

BG = os.environ.get('BG', 'sunset')
# clip, source start (s), horizontal crop position (0 = left, 1 = right), first segment index it covers, speed
EDITS = {
    'sunset': [  # one real sunset clip in slow motion, re-entered at a few pauses
        ('sunset_beach.mov', 0.0, 0.5, 0, 0.5),   # ta'awwudh .. ayah 1
        ('sunset_beach.mov', 1.0, 0.5, 3, 0.5),   # ayat 2-4
        ('sunset_beach.mov', 3.0, 0.5, 6, 0.5),   # ayat 5-6
        ('sunset_beach.mov', 5.0, 0.5, 8, 0.5),   # sadaqa Allah
    ],
    'montage': [
        ('haram.mov', 1.5, 0.72, 0, 1),      # ta'awwudh
        ('qiblatayn.mov', 5.0, 0.5, 1, 1),   # basmala
        ('katara.mov', 0.0, 0.5, 2, 1),      # ayah 1
        ('aerial_v.mov', 0.5, 0.5, 3, 1),    # ayat 2-3
        ('szgm_d2n.mov', 0.0, 0.5, 5, 1),    # ayah 4
        ('szgm_tl.mov', 0.0, 0.5, 6, 1),     # ayah 5
        ('szgm_lit.mov', 0.0, 0.5, 7, 1),    # ayah 6
        ('moon.mov', 0.0, 0.72, 8, 1),       # sadaqa Allah
    ],
}
SHOTS = EDITS[BG]
XF = 1.0 if BG == 'sunset' else 0.5  # dissolve length
CUTS = [0.0] + [gap_mid(s[3]) for s in SHOTS[1:]] + [DUR]

def probe_duration(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                                capture_output=True, text=True, check=True).stdout)

def build_footage():
    segs = []
    for i, (clip, ss, cx, _, speed) in enumerate(SHOTS):
        a = CUTS[i] - (XF / 2 if i else 0)
        b = CUTS[i + 1] + (XF / 2 if i + 1 < len(SHOTS) else 0)
        need = b - a
        src = os.path.join(HERE, 'clips', clip)
        avail = probe_duration(src) - ss - 0.05
        use = min(avail, need * speed)
        slow = need / use  # 1/speed, or more to stretch a slightly short clip
        out = os.path.join(WORK, f'shot_{BG}_{i}.mp4')
        vf = (f"setpts=(PTS-STARTPTS)*{slow:.5f},fps={FPS},"
              f"crop='min(iw,ih*9/16)':ih:'(iw-min(iw,ih*9/16))*{cx}':0,"
              f"scale={W}:{H}:flags=lanczos,eq=contrast=1.04:saturation=1.06,setsar=1,format=yuv420p")
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ss}', '-t', f'{use:.3f}', '-i', src, '-an',
                        '-vf', vf, '-t', f'{need:.3f}', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', out],
                       check=True)
        segs.append(out)
        print(f'shot {i} {clip}: {a:.2f}-{b:.2f}s  speed x{1 / slow:.2f}', flush=True)
    # dissolve chain
    args, chain, prev = [], [], '[0:v]'
    for s in segs:
        args += ['-i', s]
    for i in range(1, len(segs)):
        lab = f'[v{i}]'
        chain.append(f"{prev}[{i}:v]xfade=transition=fade:duration={XF}:offset={CUTS[i] - XF / 2:.3f}{lab}")
        prev = lab
    base = os.path.join(WORK, f'footage_{BG}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', ';'.join(chain), '-map', prev,
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-pix_fmt', 'yuv420p', base], check=True)
    return base

# --- overlay ------------------------------------------------------------------
def ease(t):
    t = min(1, max(0, t))
    return t * t * (3 - 2 * t)

def wrap(draw, text, fnt, maxw, rtl):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if cur and draw.textlength(t, font=fnt, direction='rtl' if rtl else None) > maxw:
            lines.append(cur); cur = w
        else:
            cur = t
    lines.append(cur)
    return lines

def with_shadow(lay, radius=9, alpha=0.85, dy=4):
    a = lay.getchannel('A').filter(ImageFilter.GaussianBlur(radius)).point(lambda v: int(v * alpha))
    sh = Image.new('RGBA', lay.size, (0, 0, 0, 0))
    sh.putalpha(a)
    out = Image.new('RGBA', lay.size, (0, 0, 0, 0))
    out.alpha_composite(sh, (0, dy))
    out.alpha_composite(lay)
    return out

def text_block(ar, en, ayah):
    lay = Image.new('RGBA', (W, 700), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    if ayah:
        ar = ar + " ۝" + DIGITS[ayah]
    for size in range(96, 72, -4):  # largest size that keeps the verse on one line
        fnt = font('AmiriQuran-Regular.ttf', size)
        if d.textlength(ar, font=fnt, direction='rtl') <= 900:
            break
    lines = wrap(d, ar, fnt, 900, True)
    lh = int(fnt.size * 1.75)
    y, bottom = 40, 0
    for ln in lines:
        d.text((W // 2, y), ln, font=fnt, fill=WHITE, anchor='ma', direction='rtl', language='ar')
        bottom = d.textbbox((W // 2, y), ln, font=fnt, anchor='ma', direction='rtl', language='ar')[3]
        y += lh
    y = bottom + 46
    for ln in wrap(d, en, F_TR, 880, False):
        d.text((W // 2, y), ln, font=F_TR, fill=SOFT, anchor='ma')
        y += 56
    return with_shadow(lay.crop((0, 0, W, y + 30)))

def header_layer():
    lay = Image.new('RGBA', (W, 420), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.text((W // 2, 250), "سُورَةُ ٱلنَّاسِ", font=F_TITLE, fill=WHITE, anchor='mm', direction='rtl', language='ar')
    d.text((W // 2, 322), "SURAH AN-NAS", font=F_SUB, fill=WHITE + (200,), anchor='mm')
    return with_shadow(lay, 8, 0.8, 3)

def outro_layer():
    lay = Image.new('RGBA', (W, 200), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.text((W // 2, 60), "شارِك الأجر", font=font('Amiri-Bold.ttf', 56), fill=WHITE, anchor='mm',
           direction='rtl', language='ar')
    d.text((W // 2, 124), "Share the reward", font=F_SUB, fill=SOFT, anchor='mm')
    return with_shadow(lay, 8, 0.8, 3)

TEXT_CY = 1070

def shade_layer():
    """Plain darkening: overall dim, title area, a soft band behind the verse, bottom for the app UI."""
    y = np.linspace(0, H, H)[:, None]
    top = np.clip(1 - y / 520, 0, 1) ** 1.5 * 0.55
    band = np.exp(-((y - TEXT_CY) / 300) ** 2) * 0.42
    bot = np.clip((y - 1480) / 440, 0, 1) ** 1.3 * 0.6
    a = 1 - (1 - 0.14) * (1 - top) * (1 - band) * (1 - bot)
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., 3] = np.repeat((np.clip(a, 0, 1) * 255).astype(np.uint8), W, axis=1)
    return Image.fromarray(arr, 'RGBA')

def with_alpha(img, k):
    if k >= 0.999:
        return img
    out = img.copy()
    out.putalpha(img.getchannel('A').point(lambda v: int(v * k)))
    return out

SHADE = shade_layer()
HEADER = header_layer()
OUTRO = outro_layer()
CARDS = [text_block(a, e, n) for (_, _, a, e, n) in SEGS]

def card_alpha(i, t):
    s = SEGS[i][0]
    a_in = ease((t - (s - 0.35)) / 0.35)
    if i + 1 < len(SEGS):
        nxt = SEGS[i + 1][0] - 0.35
        a_out = 1 - ease((t - (nxt - 0.3)) / 0.3)
    else:
        a_out = 1
    return min(a_in, a_out)

def overlay(img, t):
    img.alpha_composite(SHADE)
    img.alpha_composite(with_alpha(HEADER, ease(t / 0.6)), (0, 0))
    for i, card in enumerate(CARDS):
        a = card_alpha(i, t)
        if a > 0.003:
            img.alpha_composite(with_alpha(card, a), (0, int(TEXT_CY - card.height / 2)))
    if t > SEGS[-1][1] + 0.1:
        img.alpha_composite(with_alpha(OUTRO, ease((t - SEGS[-1][1] - 0.1) / 0.5)), (0, 1300))
    return img

def frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield Image.frombytes('RGB', (W, H), b)
    p.wait()

if __name__ == '__main__':
    base = os.path.join(WORK, f'footage_{BG}.mp4')
    if not (PREVIEW and os.path.exists(base)):
        base = build_footage()
    if PREVIEW:
        for ts in PREVIEW:
            b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', ts, '-i', base, '-frames:v', '1', '-f', 'rawvideo',
                                '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
            img = Image.frombytes('RGB', (W, H), b).convert('RGBA')
            overlay(img, float(ts)).convert('RGB').save(os.path.join(HERE, f'prev_{ts}.png'))
        sys.exit()
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y',
                           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-i', AUDIO,
                           '-filter:a', 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p',
                           '-profile:v', 'high', '-movflags', '+faststart',
                           '-c:a', 'aac', '-b:a', '192k', '-shortest', OUT], stdin=subprocess.PIPE)
    for fi, fr in enumerate(frames(base)):
        if fi >= NFR:
            break
        ff.stdin.write(overlay(fr.convert('RGBA'), fi / FPS).convert('RGB').tobytes())
        if fi % 300 == 0:
            print(f'{fi}/{NFR}', flush=True)
    ff.stdin.close(); ff.wait()
    print('done', ff.returncode)
