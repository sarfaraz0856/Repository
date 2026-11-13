# English channel logo (800x800) and banner (2560x1440; text inside YouTube's 1546x423 safe area).
import numpy as np, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
B = sys.argv[1]
SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
DISP = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'; MED = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'; SEMI = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
AMBER = (255, 178, 70); CREAM = (255, 244, 226)
def F(p, s): return ImageFont.truetype(p, s)
def spaced_w(d, s, f, tr): return sum(d.textlength(c, font=f) for c in s) + tr * (len(s) - 1)
def spaced(im, x, y, s, f, fill, tr, glow=None, gb=16, ga=0.6):
    W, H = im.size
    if glow:
        g = Image.new('L', (W, H), 0); gd = ImageDraw.Draw(g); xx = x
        for c in s: gd.text((xx, y), c, font=f, fill=255); xx += gd.textlength(c, font=f) + tr
        g = g.filter(ImageFilter.GaussianBlur(gb)); im.paste(Image.new('RGB', (W, H), glow), (0, 0), g.point(lambda v: int(v * ga)))
    d = ImageDraw.Draw(im); xx = x
    for c in s: d.text((xx, y), c, font=f, fill=fill); xx += d.textlength(c, font=f) + tr
def cspaced(im, y, s, f, fill, tr, cx=None, **k):
    d = ImageDraw.Draw(im); w = spaced_w(d, s, f, tr); cx = im.size[0] / 2 if cx is None else cx; spaced(im, cx - w / 2, y, s, f, fill, tr, **k); return w
def grade(im, br=1.0):
    im = ImageEnhance.Contrast(im).enhance(1.15); im = ImageEnhance.Color(im).enhance(1.12); return ImageEnhance.Brightness(im).enhance(br)
# ---------------- banner ----------------
W, H = 2560, 1440
def fit(im, w, h, cx):
    s = h / im.height; im = im.resize((int(im.width * s), h), Image.LANCZOS); x0 = int(min(max(cx * im.width - w / 2, 0), im.width - w)); return im.crop((x0, 0, x0 + w, h))
L = fit(grade(Image.open(f'{B}/ch_fire.png').convert('RGB'), 1.1), 1400, H, 0.62)
R = fit(grade(Image.open(f'{B}/bh_plume.png').convert('RGB'), 1.2), 1400, H, 0.55)
a = np.zeros((H, W, 3), np.float32); a[:, :1400] = np.asarray(L); m = np.clip(np.arange(1400) / 300, 0, 1)[None, :, None]
a[:, 1160:] = a[:, 1160:] * (1 - m) + np.asarray(R).astype(np.float32) * m
a /= 255; yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
a *= (1 - 0.86 * np.exp(-(((xx - 0.5) / 0.27) ** 2 + ((yy - 0.5) / 0.17) ** 2)))[..., None]   # dark lens behind the title
a *= (1 - 0.45 * np.clip((xx - 0.5) ** 2 * 2 + (yy - 0.5) ** 2 * 3, 0, 1))[..., None]
im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
cy = 720
cspaced(im, cy - 180, 'CINEMATIC  DOCUMENTARIES  IN  HINDI', F(SEMI, 30), AMBER, 9)
d = ImageDraw.Draw(im)
w = cspaced(im, cy - 128, 'ITIHAAS KE SAAYE', F(SERIF, 128), CREAM, 10, glow=AMBER, gb=24, ga=0.5)
for sx in (-1, 1):                                               # amber rules with a small diamond in the middle
    d.line((W / 2 + sx * 40, cy + 62, W / 2 + sx * (w / 2 - 10), cy + 62), fill=AMBER, width=3)
d.polygon([(W / 2, cy + 52), (W / 2 + 10, cy + 62), (W / 2, cy + 72), (W / 2 - 10, cy + 62)], fill=AMBER)
cspaced(im, cy + 92, 'The nights history must never forget', F(MED, 46), (236, 228, 214), 1)
cspaced(im, cy + 160, 'CHERNOBYL 1986   •   BHOPAL 1984   •   NEW STORIES EVERY MONTH', F(SEMI, 24), (196, 186, 170), 6)
im.save(f'{B}/v2/Channel-Banner-2560x1440.png'); im.save(f'{B}/v2/Channel-Banner-2560x1440.jpg', quality=93)
pv = im.copy(); pd = ImageDraw.Draw(pv)
pd.rectangle((507, 508, 2053, 931), outline=(0, 255, 120), width=4); pd.rectangle((0, 508, 2559, 931), outline=(80, 160, 255), width=3)
pd.text((520, 940), 'green box: visible on all devices', font=F(MED, 26), fill=(0, 255, 120))
pv.resize((1280, 720), Image.LANCZOS).save(f'{B}/v2/Banner-Safe-Area-Preview.jpg', quality=88)
# ---------------- logo ----------------
S = 800; yy, xx = np.mgrid[0:S, 0:S] / S
base = np.zeros((S, S, 3), np.float32)
r = np.sqrt((xx - 0.5) ** 2 + (yy - 0.42) ** 2)
base += np.array([0.20, 0.13, 0.07]) * np.exp(-(r / 0.38) ** 2)[..., None] + np.array([0.035, 0.03, 0.03])
smoke = grade(Image.open(f'{B}/bh_plume.png').convert('L'), 1.0).resize((int(1920 * S / 1080 * 1.3), int(S * 1.3)))
cx = int(0.56 * smoke.width); smoke = np.asarray(smoke.crop((cx - S // 2, 0, cx + S // 2, S))).astype(np.float32) / 255
smoke = np.asarray(Image.fromarray((smoke * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10))).astype(np.float32) / 255
base += (smoke ** 1.6 * 0.14)[..., None] * np.array([1.0, 0.8, 0.6])
lg = Image.fromarray((np.clip(base, 0, 1) * 255).astype(np.uint8))
# the monogram: a tall serif I with its long shadow (saaya) falling to the lower right
f = F(SERIF, 520); d = ImageDraw.Draw(lg); bb = d.textbbox((0, 0), 'I', font=f)
gx = (S - (bb[2] - bb[0])) / 2 - bb[0]; gy = 330 - (bb[3] - bb[1]) / 2 - bb[1]
mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).text((gx, gy), 'I', font=f, fill=255)
mk = np.asarray(mask).astype(np.float32) / 255; foot = gy + bb[3]
sh = np.zeros((S, S), np.float32)
for i in range(1, 140):                                        # shear the letter into a long fading shadow
    t = i / 140; dx, dy = int(i * 1.55), int(i * 0.42)
    m2 = np.roll(np.roll(mk, dx, 1), -int(i * 0.0), 0)
    sh = np.maximum(sh, m2 * (1 - t) * 0.55 * (np.arange(S)[:, None] > foot - 70 - dy * 0)[...] )
shadow = Image.fromarray((sh * 255).astype(np.uint8)).transform((S, S), Image.AFFINE, (1, 0.9, -0.9 * foot, 0, 1, 0), resample=Image.BICUBIC)
shadow = shadow.filter(ImageFilter.GaussianBlur(4))

g = mask.filter(ImageFilter.GaussianBlur(26)); lg.paste(Image.new('RGB', (S, S), AMBER), (0, 0), g.point(lambda v: int(v * 0.75)))
lg.paste(Image.new('RGB', (S, S), CREAM), (0, 0), mask)
d = ImageDraw.Draw(lg)
d.ellipse((34, 34, S - 34, S - 34), outline=AMBER, width=12); d.ellipse((60, 60, S - 60, S - 60), outline=(120, 84, 36), width=2)
cspaced(lg, 560, 'ITIHAAS', F(DISP, 70), CREAM, 10)
cspaced(lg, 645, 'KE SAAYE', F(SEMI, 38), AMBER, 12)
cm = Image.new('L', (S, S), 0); ImageDraw.Draw(cm).ellipse((0, 0, S - 1, S - 1), fill=255)
rnd = Image.new('RGBA', (S, S), (0, 0, 0, 0)); rnd.paste(lg, (0, 0), cm)
lg.save(f'{B}/v2/Channel-Logo-800x800.png'); rnd.save(f'{B}/v2/Channel-Logo-800x800-round.png')
sm = Image.new('RGB', (520, 180), (18, 18, 18))
for sz, x in ((160, 10), (98, 200), (48, 330), (24, 410)):
    r2 = rnd.resize((sz, sz), Image.LANCZOS); sm.paste(r2, (x, (180 - sz) // 2), r2)
sm.save(f'{B}/v2/logo_sizes.png'); print('ok')
