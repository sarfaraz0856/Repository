"""Surah An-Nas vertical short: 1080x1920, text synced per ayah to the recitation."""
import math, os, subprocess, sys, random
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

F_QURAN = font('AmiriQuran-Regular.ttf', 100)
F_QURAN_S = font('AmiriQuran-Regular.ttf', 88)
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

# --- audio envelope for the glow pulse ---------------------------------------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', AUDIO, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
pcm = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
DUR = len(pcm) / 16000
NFR = int(math.ceil(DUR * FPS))
hop = 16000 // FPS
rms = np.array([np.sqrt(np.mean(pcm[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(NFR)])
rms = rms / (np.percentile(rms, 95) + 1e-9)
sm = np.zeros_like(rms)
for i in range(NFR):  # attack/release smoothing
    prev = sm[i - 1] if i else 0
    k = 0.35 if rms[i] > prev else 0.06
    sm[i] = prev + k * (rms[i] - prev)
ENV = np.clip(sm, 0, 1.2)

# --- static layers ------------------------------------------------------------
def gradient_bg():
    y = np.linspace(0, 1, H)[:, None]
    top = np.array([5, 14, 26]); mid = np.array([9, 38, 44]); bot = np.array([3, 8, 15])
    c = np.where(y < 0.55, top + (mid - top) * (y / 0.55), mid + (bot - mid) * ((y - 0.55) / 0.45))
    img = np.repeat(c[:, None, :], W, axis=1)
    # radial vignette
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H * 0.45) / (H * 0.6)) ** 2)
    img = img * np.clip(1.15 - 0.55 * r, 0.35, 1.1)[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')

def star_points(cx, cy, r_out, r_in, n=8, rot=0):
    pts = []
    for i in range(2 * n):
        r = r_out if i % 2 == 0 else r_in
        a = rot + math.pi * i / n
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def pattern_tile(height):
    """Islamic 8-point star lattice, thin gold lines, transparent."""
    lay = Image.new('RGBA', (W, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    s = 180
    col = GOLD + (26,)
    for gy in range(-1, height // s + 2):
        for gx in range(-1, W // s + 2):
            cx, cy = gx * s + (s / 2 if gy % 2 else 0), gy * s
            d.polygon(star_points(cx, cy, 62, 40, 8, math.pi / 8), outline=col, width=2)
            d.polygon(star_points(cx, cy, 30, 21, 8, 0), outline=GOLD + (18,), width=1)
            d.line([(cx + 62, cy), (cx + s / 2 - 62 + s / 2 - 62, cy)], fill=GOLD + (10,), width=1)
    # fade pattern toward the middle so text stays clean
    return lay

def radial(size, color, power=2.2):
    yy, xx = np.mgrid[0:size, 0:size]
    r = np.sqrt((xx - size / 2) ** 2 + (yy - size / 2) ** 2) / (size / 2)
    a = np.clip(1 - r, 0, 1) ** power
    arr = np.zeros((size, size, 4), np.uint8)
    arr[..., :3] = color
    arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')

def mosque_layer():
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    base = 1862
    def dome(cx, w, h, top):
        d.rectangle([cx - w / 2, top + h * 0.55, cx + w / 2, base], fill=255)
        d.ellipse([cx - w / 2, top, cx + w / 2, top + h * 1.1], fill=255)
        d.polygon([(cx - w * 0.16, top + h * 0.12), (cx, top - h * 0.35), (cx + w * 0.16, top + h * 0.12)], fill=255)
        d.line([(cx, top - h * 0.35), (cx, top - h * 0.62)], fill=255, width=5)
        d.ellipse([cx - 9, top - h * 0.72, cx + 9, top - h * 0.54], fill=255)
    def minaret(cx, w, top):
        d.rectangle([cx - w / 2, top, cx + w / 2, base], fill=255)
        for k, yb in enumerate([top + 50, top + 150]):
            d.rectangle([cx - w / 2 - 10, yb, cx + w / 2 + 10, yb + 13], fill=255)
        d.polygon([(cx - w / 2 - 3, top + 2), (cx, top - 95), (cx + w / 2 + 3, top + 2)], fill=255)
        d.line([(cx, top - 95), (cx, top - 125)], fill=255, width=4)
    dome(540, 300, 170, 1660)
    dome(318, 160, 100, 1745)
    dome(762, 160, 100, 1745)
    d.rectangle([170, 1790, 910, base], fill=255)
    minaret(110, 38, 1620)
    minaret(970, 38, 1620)
    d.rectangle([0, base, W, H], fill=255)
    # arches (cut-outs) along the base
    for x in range(222, 860, 64):
        d.rounded_rectangle([x, 1812, x + 28, 1862], radius=14, fill=0)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    edge = m.filter(ImageFilter.MaxFilter(7))
    glow = edge.filter(ImageFilter.GaussianBlur(10))
    g = Image.new('RGBA', (W, H), GOLD + (0,)); g.putalpha(glow.point(lambda v: int(v * 0.45)))
    lay.alpha_composite(g)
    rim = Image.new('RGBA', (W, H), GOLD + (0,)); rim.putalpha(Image.fromarray(
        np.clip(np.asarray(edge, np.int16) - np.asarray(m, np.int16), 0, 255).astype(np.uint8)).point(lambda v: int(v * 0.85)))
    lay.alpha_composite(rim)
    body = Image.new('RGBA', (W, H), (3, 9, 16, 0))
    # body slightly lighter at top for depth
    grad = np.linspace(0.92, 1.0, H)[:, None] * np.ones((1, W))
    body.putalpha(Image.fromarray((np.asarray(m, np.float32) * grad).astype(np.uint8)))
    lay.alpha_composite(body)
    return lay

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
    fnt = F_QURAN if len(ar) < 40 else F_QURAN_S
    lines = wrap(d, ar, fnt, 940, True)
    lh = int(fnt.size * 1.75)
    y = 60
    shadow = Image.new('RGBA', lay.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    for ln in lines:
        sd.text((W // 2, y + 6), ln, font=fnt, fill=(0, 0, 0, 200), anchor='ma', direction='rtl', language='ar')
        d.text((W // 2, y), ln, font=fnt, fill=GOLD_LIGHT, anchor='ma', direction='rtl', language='ar')
        y += lh
    bottom = max(d.textbbox((W // 2, yy), ln, font=fnt, anchor='ma', direction='rtl', language='ar')[3]
                 for yy, ln in zip(range(60, y, lh), lines))
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

BG = gradient_bg()
PAT = pattern_tile(H + 400)
# soften pattern behind the text zone
mask = np.ones((H + 400, W), np.float32)
yy = np.arange(H + 400)[:, None]
PAT_FADE = None
GLOW = radial(1100, GOLD, 2.4)
MOSQUE = mosque_layer()
HEADER = header_layer()
OUTRO = outro_layer()
CARDS = [text_block(a, e, n) for (_, _, a, e, n) in SEGS]
SPARK = radial(36, GOLD_LIGHT, 1.6)

rnd = random.Random(114)
PARTS = [dict(x=rnd.uniform(0, W), y=rnd.uniform(0, H), v=rnd.uniform(10, 34), s=rnd.uniform(0.25, 1.0),
              ph=rnd.uniform(0, 6.28), f=rnd.uniform(0.6, 1.6), dx=rnd.uniform(-6, 6)) for _ in range(70)]

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
    img = BG.copy()
    # drifting pattern
    off = int((t * 7) % 360)
    img.alpha_composite(PAT.crop((0, 400 - off, W, 400 - off + H)))
    # audio-reactive glow behind the text
    g = with_alpha(GLOW, 0.18 + 0.30 * float(ENV[min(fi, NFR - 1)]))
    img.alpha_composite(g, (W // 2 - 550, 940 - 550))
    # particles
    for p in PARTS:
        y = (p['y'] - p['v'] * t) % (H + 60) - 30
        x = p['x'] + p['dx'] * math.sin(t * 0.5 + p['ph']) * 4
        tw = 0.45 + 0.55 * (0.5 + 0.5 * math.sin(t * p['f'] * 2 + p['ph']))
        sz = int(10 + 26 * p['s'])
        sp = with_alpha(SPARK.resize((sz, sz)), tw * (0.35 + 0.5 * p['s']))
        img.alpha_composite(sp, (int(x - sz / 2), int(y - sz / 2)))
    img.alpha_composite(MOSQUE)
    # header fades in at start
    img.alpha_composite(with_alpha(HEADER, ease(t / 0.8)))
    # verse cards
    for i, card in enumerate(CARDS):
        a, dy = card_alpha_offset(i, t)
        if a <= 0.003:
            continue
        top = int(960 - card.height / 2 + dy)
        img.alpha_composite(with_alpha(card, a), (0, max(0, top)))
    # ayah progress dots
    d = ImageDraw.Draw(img)
    cur = active_ayah(t)
    for k in range(1, 7):
        x = W / 2 + (k - 3.5) * 44
        y = 470
        if k <= cur:
            d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=GOLD + (255,))
        else:
            d.ellipse([x - 7, y - 7, x + 7, y + 7], outline=GOLD + (150,), width=2)
    # outro
    if t > SEGS[-1][1] + 0.1:
        a = ease((t - SEGS[-1][1] - 0.1) / 0.6)
        img.alpha_composite(with_alpha(OUTRO, a), (0, int(1330 + (1 - a) * 30)))
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
