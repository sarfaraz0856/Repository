# YouTube thumbnail, 1280x720: a graded, cropped film frame with a dark ramp behind three text lines.
# Usage: python3 make_thumb.py SRC.png OUT.jpg CX CY ZOOM L|R "LINE1" "LINE2" "BANNER" [BRIGHTNESS]
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
src, out, cx, cy, zoom, side, l1, l2, l3 = sys.argv[1:10]; BR = float(sys.argv[10]) if len(sys.argv) > 10 else 1.15
cx, cy, zoom = float(cx), float(cy), float(zoom)
im = Image.open(src).convert('RGB'); w, h = 1920 / zoom, 1080 / zoom
fx = 0.62 if side == 'L' else 0.38
x0 = min(max(cx - w * fx, 0), 1920 - w); y0 = min(max(cy - h * 0.55, 0), 1080 - h)
im = im.crop((int(x0), int(y0), int(x0 + w), int(y0 + h))).resize((1280, 720), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.18); im = ImageEnhance.Brightness(im).enhance(BR); im = ImageEnhance.Color(im).enhance(1.25)
a = np.asarray(im).astype(np.float32) / 255
yy, xx = np.mgrid[0:720, 0:1280] / np.array([720, 1280])[:, None, None]
u = xx if side == 'L' else 1 - xx
vig = 1 - 0.5 * np.clip(((xx - 0.5) ** 2 * 1.6 + (yy - 0.5) ** 2 * 2.2), 0, 1)
ramp = np.clip(1 - u / 0.62, 0, 1) ** 1.6 * 0.78
a = a * vig[..., None] * (1 - ramp[..., None])
im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
def isdeva(s): return any('ऀ' <= c <= 'ॿ' for c in s)
def font(s, size):
    return ImageFont.truetype('/usr/share/fonts/truetype/freefont/FreeSansBold.ttf' if isdeva(s) else '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf', size)
def place(y, s, f, fill, sw, banner=False):
    bw = d.textlength(s, font=f); x = 52 if side == 'L' else 1280 - 52 - bw
    if banner:
        bb = d.textbbox((x, y), s, font=f); d.rounded_rectangle((bb[0] - 22, bb[1] - 16, bb[2] + 22, bb[3] + 16), radius=10, fill=(205, 20, 20))
        d.text((x, y), s, font=f, fill=(255, 255, 255))
    else:
        d.text((x, y), s, font=f, fill=fill, stroke_width=sw, stroke_fill=(0, 0, 0))
place(80, l1, font(l1, 132), (255, 255, 255), 7)
place(232, l2, font(l2, 84 if isdeva(l2) else 76), (255, 206, 40), 6)
place(372, l3, font(l3, 46), None, 0, banner=True)
im.save(out, quality=95)
