"""Surah Al-Kawthar vertical short (1080x1920) on real sunset footage, text synced per ayah.

- Opens directly on ayah 1 (ta'awwudh and basmala are cut), recitation sped up to 1.1x
  with pitch kept.
- Background: real phone footage of a sunset over the sea (Adobe Stock #835719321,
  free licence; not committed, put it in clips/sunset_beach.mov), played in slow motion.
- Fonts (not committed, put them in fonts/): KFGQPC Uthmanic Hafs (verses, Madinah
  mushaf style), Aref Ruqaa Bold (surah name), Cormorant Garamond (English).

Usage: python3 render.py recitation.mp3 out.mp4 [preview_seconds ...]
"""
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC_AUDIO = sys.argv[1]
OUT = sys.argv[2]
PREVIEW = sys.argv[3:]
WORK = os.path.join(HERE, 'work')
os.makedirs(WORK, exist_ok=True)

W, H, FPS = 1080, 1920, 30
WHITE = (255, 253, 246)
SOFT = (240, 238, 232)

def font(name, size, weight=None):
    f = ImageFont.truetype(os.path.join(HERE, 'fonts', name), size, layout_engine=ImageFont.Layout.RAQM)
    if weight:
        f.set_variation_by_axes([weight])
    return f

QURAN_FONT = 'KFGQPC-Uthmanic-Hafs.ttf'
F_TITLE = font('ArefRuqaa-Bold.ttf', 92)
F_SUB = font('CormorantGaramond[wght].ttf', 36, 600)
F_TR = font('CormorantGaramond[wght].ttf', 50, 600)

TITLE_AR = "سورة الكوثر"
TITLE_EN = "SURAH AL-KAWTHAR"

# --- timeline in the original recitation (seconds), from silence detection -----
SEGS = [
    # start, end, arabic (Uthmani), english, ayah no (0 = not an ayah)
    (0.54, 6.09, "أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيۡطَٰنِ ٱلرَّجِيمِ", "", 0),
    (6.43, 12.42, "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ", "", 0),
    (13.43, 20.10, "إِنَّآ أَعۡطَيۡنَٰكَ ٱلۡكَوۡثَرَ", "Indeed, We have granted you al-Kawthar.", 1),
    (20.87, 24.14, "فَصَلِّ لِرَبِّكَ وَٱنۡحَرۡ", "So pray to your Lord and sacrifice.", 2),
    (24.93, 30.52, "إِنَّ شَانِئَكَ هُوَ ٱلۡأَبۡتَرُ", "Indeed, your enemy is the one cut off.", 3),
    (31.16, 37.12, "صَدَقَ ٱللَّهُ ٱلۡعَظِيمُ", "Allah the Almighty has spoken the truth.", 0),
]
DIGITS = "٠١٢٣٤٥٦٧٨٩"  # the Hafs font draws these as ayah-end ornaments

AUDIO_START = 13.25  # just before ayah 1: skip the ta'awwudh and the basmala
TEMPO = 1.1
TAIL = 1.5           # seconds of silence added at the end for the closing card
SEGS = [((s - AUDIO_START) / TEMPO, (e - AUDIO_START) / TEMPO, ar, en, n)
        for (s, e, ar, en, n) in SEGS if s > AUDIO_START]
AUDIO = os.path.join(WORK, 'recitation.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{AUDIO_START}', '-i', SRC_AUDIO,
                '-af', f'atempo={TEMPO},afade=t=in:d=0.04,apad=pad_dur={TAIL}',
                '-c:a', 'pcm_s16le', AUDIO], check=True)

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', AUDIO, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
DUR = len(raw) / 2 / 16000
NFR = int(math.ceil(DUR * FPS))

# --- footage: one continuous slow-motion shot -----------------------------------
CLIP = os.path.join(HERE, 'clips', 'sunset_beach.mov')

def probe_duration(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                                capture_output=True, text=True, check=True).stdout)

def build_footage():
    use = probe_duration(CLIP) - 0.05
    slow = DUR / use  # about 2x: every frame of the 60 fps source is shown once
    base = os.path.join(WORK, 'footage.mp4')
    vf = (f"setpts=(PTS-STARTPTS)*{slow:.5f},fps={FPS},"
          f"crop='min(iw,ih*9/16)':ih:'(iw-min(iw,ih*9/16))*0.5':0,"
          f"scale={W}:{H}:flags=lanczos,eq=contrast=1.04:saturation=1.06,setsar=1,format=yuv420p")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-t', f'{use:.3f}', '-i', CLIP, '-an', '-vf', vf,
                    '-t', f'{DUR:.3f}', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', base], check=True)
    print(f'footage: {DUR:.2f}s, speed x{1 / slow:.2f}', flush=True)
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
        ar = ar + " " + DIGITS[ayah]
    for size in range(112, 76, -4):  # largest size that keeps the verse on one line
        fnt = font(QURAN_FONT, size)
        if d.textlength(ar, font=fnt, direction='rtl') <= 900:
            break
    lines = wrap(d, ar, fnt, 900, True)
    lh = int(fnt.size * 1.8)
    y, bottom = 50, 0
    for ln in lines:
        kw = dict(font=fnt, anchor='ma', direction='rtl', language='ar')
        d.text((W // 2, y), ln, fill=WHITE, stroke_width=1, stroke_fill=WHITE, **kw)
        bottom = d.textbbox((W // 2, y), ln, **kw)[3]
        y += lh
    y = bottom + 40
    for ln in wrap(d, en, F_TR, 900, False):
        d.text((W // 2, y), ln, font=F_TR, fill=SOFT, anchor='ma')
        y += 62
    return with_shadow(lay.crop((0, 0, W, y + 30)))

def header_layer():
    lay = Image.new('RGBA', (W, 420), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.text((W // 2, 250), TITLE_AR, font=F_TITLE, fill=WHITE, anchor='mm', direction='rtl', language='ar')
    d.text((W // 2, 345), TITLE_EN, font=F_SUB, fill=WHITE + (215,), anchor='mm')
    return with_shadow(lay, 8, 0.8, 3)

def outro_layer():
    lay = Image.new('RGBA', (W, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.text((W // 2, 70), "شارك الأجر", font=font('ArefRuqaa-Bold.ttf', 64), fill=WHITE, anchor='mm',
           direction='rtl', language='ar')
    d.text((W // 2, 140), "Share the reward", font=font('CormorantGaramond[wght].ttf', 40, 600), fill=SOFT,
           anchor='mm')
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
LEAD = 0.3  # text appears this long before the line is recited

def card_alpha(i, t):
    s = SEGS[i][0]
    a_in = ease((t - (s - LEAD)) / 0.3) if s > LEAD else 1  # the first verse is on screen from frame one
    if i + 1 < len(SEGS):
        nxt = SEGS[i + 1][0] - LEAD
        a_out = 1 - ease((t - (nxt - 0.28)) / 0.28)
    else:
        a_out = 1
    return min(a_in, a_out)

def overlay(img, t):
    img.alpha_composite(SHADE)
    img.alpha_composite(HEADER)
    for i, card in enumerate(CARDS):
        a = card_alpha(i, t)
        if a > 0.003:
            img.alpha_composite(with_alpha(card, a), (0, int(TEXT_CY - card.height / 2)))
    if t > SEGS[-1][1] + 0.05:
        img.alpha_composite(with_alpha(OUTRO, ease((t - SEGS[-1][1] - 0.05) / 0.45)), (0, 1280))
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
    base = os.path.join(WORK, 'footage.mp4')
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
