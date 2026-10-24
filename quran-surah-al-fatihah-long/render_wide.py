"""Surah Al-Fatihah horizontal long-form video (1920x1080), text synced per ayah.

- Opens with a title card, then the recitation from the Bismillah (ayah 1 in the
  Madinah mushaf; the ta'awwudh is cut), at natural speed, and a closing card.
- Background: a real photo of an open Quran on a rehal in a mosque
  (Adobe Stock #175296660, free licence; not committed, put it in bg/quran_mosque.jpg)
  with a very slow push-in. The Quran stays in the upper half, the text sits below it.
- Both Arabic and English are on screen for every ayah.
- Fonts (not committed, put them in fonts/): KFGQPC Uthmanic Hafs (verses, Madinah
  mushaf style), Aref Ruqaa Bold (surah name), Cormorant Garamond (English).

Usage: python3 render_wide.py recitation.mp3 out.mp4 [preview_seconds ...]
"""
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC_AUDIO = sys.argv[1]
OUT = sys.argv[2]
PREVIEW = sys.argv[3:]
WORK = os.path.join(HERE, 'work_wide')
os.makedirs(WORK, exist_ok=True)

W, H, FPS = 1920, 1080, 30
WHITE = (255, 253, 246)
SOFT = (240, 238, 232)
PHOTO = os.path.join(HERE, 'bg', 'quran_mosque.jpg')

def font(name, size, weight=None):
    f = ImageFont.truetype(os.path.join(HERE, 'fonts', name), size, layout_engine=ImageFont.Layout.RAQM)
    if weight:
        f.set_variation_by_axes([weight])
    return f

QURAN_FONT = 'KFGQPC-Uthmanic-Hafs.ttf'
TITLE_AR = "سورة الفاتحة"
TITLE_EN = "SURAH AL-FATIHAH"
HOOK_AR = "أعظم سورة في القرآن الكريم"
HOOK_EN = "The greatest surah of the Holy Quran"

# --- timeline in the original recitation (seconds), from silence detection -----
SEGS = [
    # start, end, arabic (Uthmani), english, ayah no (0 = not an ayah)
    (6.51, 12.22, "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
     "In the name of Allah, the Most Gracious, the Most Merciful.", 1),
    (13.18, 17.46, "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
     "All praise is for Allah, Lord of all the worlds,", 2),
    (18.09, 21.48, "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ", "the Most Gracious, the Most Merciful,", 3),
    (22.08, 25.89, "مَٰلِكِ يَوۡمِ ٱلدِّينِ", "Master of the Day of Judgement.", 4),
    (26.51, 31.39, "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ",
     "You alone we worship, and You alone we ask for help.", 5),
    (31.96, 36.40, "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ", "Guide us along the straight path,", 6),
    # ayah 7 is recited in two breaths, so it is shown as two cards
    (37.05, 41.46, "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ",
     "the path of those You have blessed —", 0),
    (41.90, 54.28, "غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ",
     "not those who earned Your anger, nor those who went astray.", 7),
    (55.24, 61.60, "صَدَقَ ٱللَّهُ ٱلۡعَظِيمُ", "Allah the Almighty has spoken the truth.", 0),
]
DIGITS = "٠١٢٣٤٥٦٧٨٩"  # the Hafs font draws these as ayah-end ornaments

AUDIO_START = 6.25   # in the pause after the ta'awwudh, just before the Bismillah
TEMPO = 1.0          # natural speed; there is no 60-second limit on a long-form video
INTRO = 5.0          # title card before the recitation
OUTRO = 5.5          # closing card after it
SEGS = [(INTRO + (s - AUDIO_START) / TEMPO, INTRO + (e - AUDIO_START) / TEMPO, ar, en, n)
        for (s, e, ar, en, n) in SEGS if s > AUDIO_START]
REC_END = SEGS[-1][1]

AUDIO = os.path.join(WORK, 'recitation.wav')
af = f'afade=t=in:d=0.04,adelay={int(INTRO * 1000)}|{int(INTRO * 1000)},apad=pad_dur={OUTRO}'
if abs(TEMPO - 1.0) > 1e-6:
    af = f'atempo={TEMPO},' + af
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{AUDIO_START}', '-i', SRC_AUDIO,
                '-af', af, '-c:a', 'pcm_s16le', AUDIO], check=True)

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', AUDIO, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
DUR = len(raw) / 2 / 16000
NFR = int(math.ceil(DUR * FPS))

# --- background: still photo with a very slow push-in --------------------------
SS = 1.18  # working copy is this much wider than the frame, leaving room to zoom
def load_photo():
    src = Image.open(PHOTO).convert('RGB')
    sw, sh = src.size
    ch = sw * H / W
    src = src.resize((int(W * SS), int(H * SS)), Image.LANCZOS, box=(0, 0, sw, ch))  # top crop: Quran sits high
    a = np.asarray(src, np.float32) / 255
    a = a * np.array([0.88, 0.92, 1.02])                      # take the red cast down
    a = np.clip((a - 0.5) * 1.08 + 0.5, 0, 1) * 0.70          # contrast, darker for white text
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))

BG = load_photo()

def camera(t):
    sw, sh = BG.size
    z = 1 / SS + (1 - 1 / SS) * 0.45 * (t / DUR)   # push in slowly, never past the edges
    cw, chh = sw * z, sh * z
    cx, cy = sw / 2, sh * 0.5
    box = (cx - cw / 2, cy - chh / 2, cx + cw / 2, cy + chh / 2)
    return BG.resize((W, H), Image.BICUBIC, box=box, reducing_gap=2.0).convert('RGBA')

# --- overlay ------------------------------------------------------------------
TEXT_CY = 790

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

def with_shadow(lay, radius=10, alpha=0.9, dy=5):
    a = lay.getchannel('A').filter(ImageFilter.GaussianBlur(radius)).point(lambda v: int(v * alpha))
    sh = Image.new('RGBA', lay.size, (0, 0, 0, 0))
    sh.putalpha(a)
    out = Image.new('RGBA', lay.size, (0, 0, 0, 0))
    out.alpha_composite(sh, (0, dy))
    out.alpha_composite(lay)
    return out

def text_block(ar, en, ayah):
    lay = Image.new('RGBA', (W, 460), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    if ayah:
        ar = ar + " " + DIGITS[ayah]
    for size in range(104, 72, -4):  # largest size that keeps the verse on one line
        fnt = font(QURAN_FONT, size)
        if d.textlength(ar, font=fnt, direction='rtl') <= 1560:
            break
    lines = wrap(d, ar, fnt, 1560, True)
    lh = int(fnt.size * 1.8)
    y, bottom = 30, 0
    for ln in lines:
        kw = dict(font=fnt, anchor='ma', direction='rtl', language='ar')
        d.text((W // 2, y), ln, fill=WHITE, stroke_width=1, stroke_fill=WHITE, **kw)
        bottom = d.textbbox((W // 2, y), ln, **kw)[3]
        y += lh
    y = bottom + 38
    ftr = font('CormorantGaramond[wght].ttf', 54, 600)
    for ln in wrap(d, en, ftr, 1500, False):
        d.text((W // 2, y), ln, font=ftr, fill=SOFT, anchor='ma')
        y += 66
    return with_shadow(lay.crop((0, 0, W, y + 20)))

def header_layer():
    lay = Image.new('RGBA', (W, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.text((W // 2, 95), TITLE_AR, font=font('ArefRuqaa-Bold.ttf', 62), fill=WHITE, anchor='mm',
           direction='rtl', language='ar')
    d.text((W // 2, 152), TITLE_EN, font=font('CormorantGaramond[wght].ttf', 30, 600), fill=WHITE + (210,),
           anchor='mm')
    return with_shadow(lay, 8, 0.85, 3)

def title_card():
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.text((W // 2, 470), TITLE_AR, font=font('ArefRuqaa-Bold.ttf', 138), fill=WHITE, anchor='mm',
           direction='rtl', language='ar')
    d.text((W // 2, 585), TITLE_EN, font=font('CormorantGaramond[wght].ttf', 54, 600), fill=WHITE + (225,),
           anchor='mm')
    d.line([(W / 2 - 230, 650), (W / 2 + 230, 650)], fill=WHITE + (120,), width=2)
    d.text((W // 2, 725), HOOK_AR, font=font('ArefRuqaa-Bold.ttf', 50), fill=WHITE, anchor='mm',
           direction='rtl', language='ar')
    d.text((W // 2, 800), HOOK_EN, font=font('CormorantGaramond[wght].ttf', 44, 600), fill=SOFT, anchor='mm')
    return with_shadow(lay)

def outro_card():
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.text((W // 2, 520), "شارك الأجر", font=font('ArefRuqaa-Bold.ttf', 104), fill=WHITE, anchor='mm',
           direction='rtl', language='ar')
    d.text((W // 2, 625), "Share the reward", font=font('CormorantGaramond[wght].ttf', 54, 600), fill=SOFT,
           anchor='mm')
    d.line([(W / 2 - 200, 690), (W / 2 + 200, 690)], fill=WHITE + (120,), width=2)
    d.text((W // 2, 755), "اشترك ليصلك القرآن الكريم كل يوم", font=font('ArefRuqaa-Bold.ttf', 44),
           fill=WHITE, anchor='mm', direction='rtl', language='ar')
    d.text((W // 2, 825), "Subscribe for daily Quran", font=font('CormorantGaramond[wght].ttf', 42, 600),
           fill=SOFT, anchor='mm')
    return with_shadow(lay)

def shade_layer():
    """Plain darkening: top for the title, a soft band behind the verse, bottom edge."""
    y = np.linspace(0, H, H)[:, None]
    top = np.clip(1 - y / 300, 0, 1) ** 1.4 * 0.35
    band = np.exp(-((y - TEXT_CY) / 250) ** 2) * 0.46
    bot = np.clip((y - 900) / 180, 0, 1) * 0.3
    a = 1 - (1 - top) * (1 - band) * (1 - bot)
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., 3] = np.repeat((np.clip(a, 0, 1) * 255).astype(np.uint8), W, axis=1)
    return Image.fromarray(arr, 'RGBA')

def card_shade(k):
    """Even dim for the title and closing cards."""
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., 3] = int(150 * k)
    return Image.fromarray(arr, 'RGBA')

def with_alpha(img, k):
    if k >= 0.999:
        return img
    out = img.copy()
    out.putalpha(img.getchannel('A').point(lambda v: int(v * k)))
    return out

SHADE = shade_layer()
HEADER = header_layer()
TITLE = title_card()
OUTROC = outro_card()
CARDS = [text_block(a, e, n) for (_, _, a, e, n) in SEGS]
LEAD = 0.3

def card_alpha(i, t):
    s = SEGS[i][0]
    a_in = ease((t - (s - LEAD)) / 0.35)
    if i + 1 < len(SEGS):
        nxt = SEGS[i + 1][0] - LEAD
        a_out = 1 - ease((t - (nxt - 0.3)) / 0.3)
    else:
        a_out = 1 - ease((t - (REC_END + 0.6)) / 0.5)
    return min(a_in, a_out)

def overlay(img, t):
    intro_k = 1 - ease((t - (INTRO - 1.2)) / 1.0)            # title card fades out
    outro_k = ease((t - (REC_END + 0.8)) / 1.0)              # closing card fades in
    verses_k = min(1 - intro_k, 1 - outro_k)
    if verses_k > 0.003:
        img.alpha_composite(with_alpha(SHADE, verses_k))
        img.alpha_composite(with_alpha(HEADER, verses_k))
        for i, card in enumerate(CARDS):
            a = card_alpha(i, t) * verses_k
            if a > 0.003:
                img.alpha_composite(with_alpha(card, a), (0, int(TEXT_CY - card.height / 2)))
    if intro_k > 0.003:
        img.alpha_composite(card_shade(intro_k))
        img.alpha_composite(with_alpha(TITLE, intro_k))
    if outro_k > 0.003:
        img.alpha_composite(card_shade(outro_k))
        img.alpha_composite(with_alpha(OUTROC, outro_k))
    return img

def render_bytes(fi):
    return overlay(camera(fi / FPS), fi / FPS).convert('RGB').tobytes()

if __name__ == '__main__':
    if PREVIEW:
        for ts in PREVIEW:
            t = float(ts)
            overlay(camera(t), t).convert('RGB').save(os.path.join(HERE, f'wprev_{ts}.png'))
        sys.exit()
    from multiprocessing import Pool
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y',
                           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-i', AUDIO,
                           '-filter:a', 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
                           '-profile:v', 'high', '-movflags', '+faststart',
                           '-c:a', 'aac', '-b:a', '192k', '-shortest', OUT], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for i, b in enumerate(pool.imap(render_bytes, range(NFR), chunksize=8)):
            ff.stdin.write(b)
            if i % 300 == 0:
                print(f'{i}/{NFR}', flush=True)
    ff.stdin.close(); ff.wait()
    print('done', ff.returncode)
