"""Surah An-Nas vertical short: 1080x1920, text synced per ayah to the recitation.

Background: Sheikh Zayed Grand Mosque, Abu Dhabi, at sunset (Adobe Stock #203084543,
free licence; not committed, download it to bg/szgm_sunset.jpg) with a very slow push-in;
verses sit on a frosted-glass panel. Fonts go in fonts/ (Amiri Quran, Amiri, Cinzel, Poppins).

Usage: python3 render.py recitation.mp3 out.mp4 [preview_seconds ...]"""
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = sys.argv[1]
OUT = sys.argv[2]
PREVIEW = sys.argv[3:]  # optional list of times (s) to dump PNG previews instead of video

W, H, FPS = 1080, 1920, 30
GOLD = (232, 200, 114)
GOLD_LIGHT = (246, 226, 168)
CREAM = (236, 231, 218)

def font(name, size, raqm=True):
    return ImageFont.truetype(os.path.join(HERE, 'fonts', name), size,
                              layout_engine=ImageFont.Layout.RAQM if raqm else ImageFont.Layout.BASIC)

F_TITLE = font('Amiri-Bold.ttf', 84)
F_LATIN = font('Cinzel[wght].ttf', 34)
F_LATIN_S = font('Cinzel[wght].ttf', 28)
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

def ease(t):
    t = min(1, max(0, t))
    return t * t * (3 - 2 * t)

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', AUDIO, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
DUR = len(raw) / 2 / 16000
NFR = int(math.ceil(DUR * FPS))

# --- static layers ------------------------------------------------------------
SS = 1.25          # background canvas supersampling, leaves room for the push-in
PHOTO_TOP = 770    # where the photo starts on the 1080x1920 frame
PHOTO_W = 1500     # photo width on the frame (both minarets just fit)

def load_photo():
    """Wide mosque panorama placed low in the frame; sky extended upward, floor fades to dark."""
    cw, chh = int(W * SS), int(H * SS)
    src = Image.open(os.path.join(HERE, 'bg', 'szgm_sunset.jpg')).convert('RGB')
    pw = int(PHOTO_W * SS)
    ph = round(src.height * pw / src.width)
    ph_img = src.resize((pw, ph), Image.LANCZOS).crop(((pw - cw) // 2, 0, (pw - cw) // 2 + cw, ph))
    a = np.asarray(ph_img, np.float32)
    top = int(PHOTO_TOP * SS)
    canvas = np.zeros((chh, cw, 3), np.float32)
    # sky above the photo: continue the photo's own sky colours, deepening toward the top
    sky = a[:40].mean(0)
    k = np.ones(81) / 81
    sky = np.stack([np.convolve(np.pad(sky[:, c], 40, mode='edge'), k, 'valid') for c in range(3)], 1)
    yy = np.linspace(0, 1, top)[:, None, None]
    deep = np.array([28, 26, 58], np.float32)
    canvas[:top] = deep + (sky[None] - deep) * (yy ** 0.8)
    canvas[top:top + ph] = a
    # seam blend over the first rows of the photo
    blend = 90
    ramp = np.linspace(0, 1, blend)[:, None, None]
    canvas[top:top + blend] = sky[None] * (1 - ramp) + a[:blend] * ramp
    # below the photo: floor colour fading to near black
    rest = chh - (top + ph)
    if rest > 0:
        floor = a[-30:].mean(0)
        yy = np.linspace(0, 1, rest)[:, None, None]
        canvas[top + ph:] = floor[None] * (1 - yy) * 0.6 + np.array([6, 6, 12]) * yy
        fade = 120
        r = np.linspace(0, 1, fade)[:, None, None]
        canvas[top + ph - fade:top + ph] = a[-fade:] * (1 - r * 0.4)
    c = canvas / 255
    c = np.clip((c - 0.5) * 1.06 + 0.5, 0, 1) * 0.84
    c = c + np.random.default_rng(114).normal(0, 0.006, c.shape)   # fine grain, avoids banding
    return Image.fromarray((np.clip(c, 0, 1) * 255).astype(np.uint8))

def shade_layer():
    """Darken top (title) and bottom (Shorts UI) bands plus a soft vignette."""
    y = np.linspace(0, 1, H)[:, None]
    top = np.clip(1 - y / 0.30, 0, 1) ** 1.6 * 0.55
    bot = np.clip((y - 0.70) / 0.30, 0, 1) ** 1.4 * 0.75
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
    vig = np.clip((r - 0.65) / 0.6, 0, 1) * 0.5
    a = 1 - (1 - top) * (1 - bot) * (1 - vig)
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., 3] = (np.clip(a, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')

def star_points(cx, cy, r_out, r_in, n=8, rot=0):
    pts = []
    for i in range(2 * n):
        r = r_out if i % 2 == 0 else r_in
        a = rot + math.pi * i / n
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def header_layer():
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    cx, cy = W // 2, 300
    bw, bh = 640, 150
    box = [cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2]
    d.rounded_rectangle(box, radius=75, fill=(4, 16, 26, 170), outline=GOLD + (230,), width=3)
    d.rounded_rectangle([box[0] + 12, box[1] + 12, box[2] - 12, box[3] - 12], radius=63, outline=GOLD + (110,), width=1)
    for sx in (box[0], box[2]):
        d.polygon(star_points(sx, cy, 24, 11, 8, math.pi / 8), fill=GOLD + (240,))
        d.polygon(star_points(sx, cy, 10, 5, 8, math.pi / 8), fill=(4, 16, 26, 255))
    d.text((cx, cy + 6), "سُورَةُ ٱلنَّاسِ", font=F_TITLE, fill=GOLD_LIGHT, anchor='mm', direction='rtl', language='ar')
    d.text((cx, cy + bh / 2 + 52), "SURAH AN-NAS  ·  114", font=F_LATIN, fill=GOLD + (220,), anchor='mm')
    return lay

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

def text_block(ar, en, ayah):
    """Pre-render one verse card (arabic + divider + translation), returns (img, top_y)."""
    lay = Image.new('RGBA', (W, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    if ayah:
        ar = ar + "\u00A0\u06DD" + DIGITS[ayah]
    # largest size (100..76) that keeps the verse on one line, else wrap at 76
    for size in range(100, 74, -4):
        fnt = font('AmiriQuran-Regular.ttf', size)
        if d.textlength(ar, font=fnt, direction='rtl') <= 900:
            break
    lines = wrap(d, ar, fnt, 900, True)
    lh = int(fnt.size * 1.75)
    y = 36
    shadow = Image.new('RGBA', lay.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    for ln in lines:
        sd.text((W // 2, y + 6), ln, font=fnt, fill=(0, 0, 0, 200), anchor='ma', direction='rtl', language='ar')
        d.text((W // 2, y), ln, font=fnt, fill=GOLD_LIGHT, anchor='ma', direction='rtl', language='ar')
        y += lh
    bottom = max(d.textbbox((W // 2, yy), ln, font=fnt, anchor='ma', direction='rtl', language='ar')[3]
                 for yy, ln in zip(range(36, y, lh), lines))
    y = bottom + 40
    # divider
    d.line([(W / 2 - 170, y), (W / 2 - 22, y)], fill=GOLD + (170,), width=2)
    d.line([(W / 2 + 22, y), (W / 2 + 170, y)], fill=GOLD + (170,), width=2)
    d.polygon([(W / 2, y - 11), (W / 2 + 11, y), (W / 2, y + 11), (W / 2 - 11, y)], fill=GOLD + (230,))
    y += 46
    for ln in wrap(d, en, F_TR, 900, False):
        sd.text((W // 2, y + 3), ln, font=F_TR, fill=(0, 0, 0, 200), anchor='ma')
        d.text((W // 2, y), ln, font=F_TR, fill=CREAM, anchor='ma')
        y += 58
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    shadow.alpha_composite(lay)
    shadow = shadow.crop((0, 0, W, y + 20))
    return shadow

def outro_layer():
    lay = Image.new('RGBA', (W, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.rounded_rectangle([W / 2 - 300, 30, W / 2 + 300, 190], radius=30, fill=(4, 16, 26, 190), outline=GOLD + (200,), width=2)
    d.text((W / 2, 85), "شارِك الأجر", font=font('Amiri-Bold.ttf', 60), fill=GOLD_LIGHT, anchor='mm', direction='rtl', language='ar')
    d.text((W / 2, 150), "SHARE THE REWARD", font=F_LATIN_S, fill=CREAM, anchor='mm')
    return lay

def with_alpha(img, k):
    if k >= 0.999:
        return img
    out = img.copy()
    out.putalpha(img.getchannel('A').point(lambda v: int(v * k)))
    return out

PHOTO = load_photo()
SHADE = shade_layer()
HEADER = header_layer()
OUTRO = outro_layer()
CARDS = [text_block(a, e, n) for (_, _, a, e, n) in SEGS]

# frosted-glass panel that holds the verse
PANEL_H = max(c.height for c in CARDS) + 16
PANEL_CY = 530 + PANEL_H // 2
PANEL_BOX = (40, PANEL_CY - PANEL_H // 2, W - 40, PANEL_CY + PANEL_H // 2)
PANEL_MASK = Image.new('L', (PANEL_BOX[2] - PANEL_BOX[0], PANEL_BOX[3] - PANEL_BOX[1]), 0)
ImageDraw.Draw(PANEL_MASK).rounded_rectangle([0, 0, PANEL_MASK.width - 1, PANEL_MASK.height - 1], radius=44, fill=255)
PANEL_TINT = Image.new('RGBA', PANEL_MASK.size, (6, 10, 24, 0))
PANEL_TINT.putalpha(PANEL_MASK.point(lambda v: int(v * 0.52)))
PANEL_EDGE = Image.new('RGBA', (W, H), (0, 0, 0, 0))
_d = ImageDraw.Draw(PANEL_EDGE)
_d.rounded_rectangle(PANEL_BOX, radius=44, outline=GOLD + (150,), width=2)
_d.rounded_rectangle([PANEL_BOX[0] + 10, PANEL_BOX[1] + 10, PANEL_BOX[2] - 10, PANEL_BOX[3] - 10],
                     radius=36, outline=GOLD + (55,), width=1)

def camera(t):
    """Very slow push-in toward the main dome."""
    sw, sh = PHOTO.size
    z = 1.0 - 0.045 * ease(t / DUR)                        # fraction of the canvas shown
    cw, ch = sw * z, sh * z
    cx, cy = sw / 2, sh * 0.62
    cy = min(max(cy, ch / 2), sh - ch / 2)
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return PHOTO.resize((W, H), Image.BICUBIC, box=box, reducing_gap=2.0).convert('RGBA')

def card_alpha_offset(i, t):
    s, e = SEGS[i][0], SEGS[i][1]
    nxt = SEGS[i + 1][0] if i + 1 < len(SEGS) else DUR + 5
    a_in = ease((t - (s - 0.35)) / 0.5)
    out_end = min(nxt - 0.08, DUR + 5)
    a_out = 1 - ease((t - (out_end - 0.38)) / 0.38) if i + 1 < len(SEGS) else 1
    a = min(a_in, a_out)
    dy = (1 - a_in) * 40 - (1 - a_out) * 25
    return a, dy

def active_ayah(t):
    n = 0
    for s, _, _, _, k in SEGS:
        if k and t >= s - 0.35:
            n = k
    return n

def frame(fi):
    t = fi / FPS
    img = camera(t)
    img.alpha_composite(SHADE)
    # frosted panel: blur what is behind it, tint it, gold rim
    k = ease(t / 0.8)
    glass = img.crop(PANEL_BOX).filter(ImageFilter.GaussianBlur(22))
    glass.alpha_composite(PANEL_TINT)
    glass.putalpha(PANEL_MASK.point(lambda v: int(v * k)))
    img.alpha_composite(glass, PANEL_BOX[:2])
    img.alpha_composite(with_alpha(PANEL_EDGE, k))
    img.alpha_composite(with_alpha(HEADER, k))
    # verse cards
    for i, card in enumerate(CARDS):
        a, dy = card_alpha_offset(i, t)
        if a <= 0.003:
            continue
        top = int(PANEL_CY - card.height / 2 + dy)
        img.alpha_composite(with_alpha(card, a), (0, max(0, top)))
    # ayah progress dots
    d = ImageDraw.Draw(img)
    cur = active_ayah(t)
    for n in range(1, 7):
        x = W / 2 + (n - 3.5) * 44
        y = 470
        if n <= cur:
            d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=GOLD + (255,))
        else:
            d.ellipse([x - 7, y - 7, x + 7, y + 7], outline=GOLD + (170,), width=2)
    # outro
    if t > SEGS[-1][1] + 0.1:
        a = ease((t - SEGS[-1][1] - 0.1) / 0.6)
        img.alpha_composite(with_alpha(OUTRO, a), (0, int(PANEL_BOX[3] + 40 + (1 - a) * 30)))
    return img.convert('RGB')

def render_bytes(fi):
    return frame(fi).tobytes()

if __name__ == '__main__':
    if PREVIEW:
        for ts in PREVIEW:
            frame(int(float(ts) * FPS)).save(os.path.join(os.path.dirname(OUT), f'prev_{ts}.png'))
        sys.exit()
    from multiprocessing import Pool
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y',
                           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-i', AUDIO,
                           '-filter:a', 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
                           '-profile:v', 'high', '-movflags', '+faststart',
                           '-c:a', 'aac', '-b:a', '192k', '-shortest', OUT], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for i, b in enumerate(pool.imap(render_bytes, range(NFR), chunksize=8)):
            ff.stdin.write(b)
            if i % 300 == 0:
                print(f'{i}/{NFR}', flush=True)
    ff.stdin.close(); ff.wait()
    print('done', ff.returncode)
