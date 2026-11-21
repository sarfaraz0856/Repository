# Channel logo (800x800) and banner (2560x1440, text inside YouTube's 1546x423 safe area) from film frames.
import numpy as np, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
B = sys.argv[1]; NAME_HI, NAME_EN, TAG_HI, TAG_EN = sys.argv[2:6]
DEV = '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'; DEVR = '/usr/share/fonts/truetype/freefont/FreeSans.ttf'
EN = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'; ENR = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
AMBER = (255, 176, 64)
def F(p, s): return ImageFont.truetype(p, s, layout_engine=ImageFont.Layout.RAQM)
def grade(im, br=1.0):
    im = ImageEnhance.Contrast(im).enhance(1.15); im = ImageEnhance.Color(im).enhance(1.15); return ImageEnhance.Brightness(im).enhance(br)
# ---------- banner ----------
W, H = 2560, 1440
L = grade(Image.open(f'{B}/ch_fire.png').convert('RGB'), 1.15); R = grade(Image.open(f'{B}/bh_plume.png').convert('RGB'), 1.25)
def fit(im, w, h, cx):
    s = h / im.height; im = im.resize((int(im.width * s), h), Image.LANCZOS); x0 = int(min(max(cx * im.width - w / 2, 0), im.width - w)); return im.crop((x0, 0, x0 + w, h))
bg = Image.new('RGB', (W, H)); bg.paste(fit(L, 1400, H, 0.62), (0, 0)); right = fit(R, 1400, H, 0.55)
m = np.clip((np.arange(1400) - 0) / 260, 0, 1)[None, :, None]
a = np.asarray(bg).astype(np.float32); r = np.asarray(right).astype(np.float32)
a[:, 1160:2560] = a[:, 1160:2560] * (1 - m) + r * m
a /= 255; yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
dark = 1 - 0.82 * np.exp(-(((xx - 0.5) / 0.30) ** 2 + ((yy - 0.5) / 0.20) ** 2))   # dark band behind the text
vig = 1 - 0.35 * np.clip((xx - 0.5) ** 2 * 2 + (yy - 0.5) ** 2 * 2.4, 0, 1)
a = a * dark[..., None] * vig[..., None]
im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
def ctext(y, s, font, fill, sw=0, glow=False):
    w = d.textlength(s, font=font); x = (W - w) / 2
    if glow:
        g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).text((x, y), s, font=font, fill=255); g = g.filter(ImageFilter.GaussianBlur(18))
        im.paste(Image.new('RGB', (W, H), AMBER), (0, 0), g.point(lambda v: int(v * 0.55)))
    ImageDraw.Draw(im).text((x, y), s, font=font, fill=fill, stroke_width=sw, stroke_fill=(0, 0, 0))
ctext(500, NAME_HI, F(DEV, 150), (255, 244, 225), 2, glow=True)
ctext(690, NAME_EN.upper(), F(EN, 62), AMBER)
d = ImageDraw.Draw(im); d.line((W / 2 - 330, 784, W / 2 + 330, 784), fill=(255, 176, 64, 255), width=3)
ctext(800, TAG_HI, F(DEVR, 50), (235, 228, 215))
ctext(866, TAG_EN, F(ENR, 30), (200, 192, 180))
im.save(f'{B}/Channel-Banner-2560x1440.png'); im.convert('RGB').save(f'{B}/Channel-Banner-2560x1440.jpg', quality=93)
# safe-area preview (what shows on phones / TV / desktop)
pv = im.copy(); pd = ImageDraw.Draw(pv)
pd.rectangle((507, 508, 2053, 931), outline=(0, 255, 120), width=4); pd.rectangle((0, 508, 2559, 931), outline=(80, 160, 255), width=3)
pv.resize((1280, 720)).save(f'{B}/banner_preview.jpg', quality=88)
# ---------- logo ----------
S = 800; st = grade(Image.open(f'{B}/bh_plume.png').convert('RGB'), 1.2)
s = S / st.height * 1.25; st = st.resize((int(st.width * s), int(st.height * s)), Image.LANCZOS)
cx = int(0.56 * st.width); st = st.crop((cx - S // 2, 0, cx + S // 2, S))
a = np.asarray(st).astype(np.float32) / 255; yy, xx = np.mgrid[0:S, 0:S] / S
a *= (0.38 + 0.25 * (1 - yy))[..., None]
lg = Image.fromarray((a * 255).astype(np.uint8)); ld = ImageDraw.Draw(lg)
ld.ellipse((40, 40, S - 40, S - 40), outline=AMBER, width=14)
f = F(DEV, 470); t = 'इ'; bb = ld.textbbox((0, 0), t, font=f); x = (S - (bb[2] - bb[0])) / 2 - bb[0]; y = (S - (bb[3] - bb[1])) / 2 - bb[1] + 10
g = Image.new('L', (S, S), 0); ImageDraw.Draw(g).text((x, y), t, font=f, fill=255); g = g.filter(ImageFilter.GaussianBlur(22))
lg.paste(Image.new('RGB', (S, S), AMBER), (0, 0), g.point(lambda v: int(v * 0.7)))
ImageDraw.Draw(lg).text((x, y), t, font=f, fill=(255, 244, 225))
mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).ellipse((0, 0, S - 1, S - 1), fill=255)
out = Image.new('RGBA', (S, S), (0, 0, 0, 0)); out.paste(lg, (0, 0), mask)
lg.save(f'{B}/Channel-Logo-800x800.png'); out.save(f'{B}/Channel-Logo-800x800-round.png')
sm = Image.new('RGB', (420, 140), (24, 24, 24)); sm.paste(out.resize((120, 120)), (10, 10), out.resize((120, 120))); sm.paste(out.resize((48, 48)), (160, 46), out.resize((48, 48))); sm.paste(out.resize((24, 24)), (240, 58), out.resize((24, 24)))
sm.save(f'{B}/logo_sizes.png')
print('ok')
