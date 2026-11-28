from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import numpy as np, sys
IN = '/usr/share/fonts/opentype/inter/'; HI = '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'
def base(p, bright=1.5, contrast=1.25, shift=0, side='left', dark=0.8):
    im = Image.open(p).convert('RGB').resize((1280, 720), Image.LANCZOS)
    if shift: im = im.transform(im.size, Image.AFFINE, (1, 0, shift, 0, 1, 0), Image.BICUBIC)
    im = ImageEnhance.Brightness(im).enhance(bright); im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(1.25)
    a = np.zeros((720, 1280), np.float32); x = np.linspace(0, 1, 1280)
    g = np.clip((0.62 - x) / 0.45, 0, 1) if side == 'left' else np.clip((x - 0.38) / 0.45, 0, 1)
    a[:] = g ** 1.3 * dark; a = np.maximum(a, np.clip((np.linspace(0, 1, 720) - 0.75) / 0.25, 0, 1)[:, None] * 0.5)
    sh = Image.fromarray((a * 255).astype(np.uint8)); return Image.composite(Image.new('RGB', im.size), im, sh)
def text(im, xy, s, font, fill, stroke=6, anchor='la', shadow=True):
    d = ImageDraw.Draw(im)
    if shadow:
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((xy[0] + 6, xy[1] + 8), s, font=font, fill=(0, 0, 0, 200), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 200))
        im.paste(sh.filter(ImageFilter.GaussianBlur(8)), (0, 0), sh.filter(ImageFilter.GaussianBlur(8)))
    d.text(xy, s, font=font, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))
def box(im, xy, s, font, bg, fg=(255, 255, 255), pad=(22, 12)):
    d = ImageDraw.Draw(im); l, t, r, b = d.textbbox(xy, s, font=font)
    d.rectangle((l - pad[0], t - pad[1], r + pad[0], b + pad[1]), fill=bg); d.text(xy, s, font=font, fill=fg)
Y = (255, 214, 0); W = (255, 255, 255); RED = (214, 30, 30)
# A: the explosion
im = base('fa.png', 1.3, 1.3, shift=-520, side='left', dark=0.85).convert('RGB')
box(im, (60, 60), '26 APRIL 1986  •  1:23 AM', ImageFont.truetype(IN + 'Inter-Black.otf', 38), RED)
text(im, (55, 160), 'CHERNOBYL', ImageFont.truetype(IN + 'InterDisplay-Black.otf', 150), Y, 8)
text(im, (60, 345), 'की असली', ImageFont.truetype(HI, 120), W, 7)
text(im, (60, 490), 'कहानी', ImageFont.truetype(HI, 140), W, 7)
im.save('Chernobyl-Extended-Thumbnail-A.jpg', quality=92)
# B: the firefighter
im = base('fb.png', 1.6, 1.25, side='right', dark=0.8).convert('RGB')
im = im.transpose(Image.FLIP_LEFT_RIGHT) if False else im
text(im, (1230, 70), 'वे कभी', ImageFont.truetype(HI, 130), W, 7, anchor='ra')
text(im, (1230, 230), 'घर नहीं', ImageFont.truetype(HI, 130), W, 7, anchor='ra')
text(im, (1230, 390), 'लौटे', ImageFont.truetype(HI, 150), Y, 8, anchor='ra')
f = ImageFont.truetype(IN + 'Inter-Black.otf', 40); d = ImageDraw.Draw(im); s = 'CHERNOBYL FIREFIGHTERS'
l, t, r, b = d.textbbox((0, 0), s, font=f); box(im, (1230 - (r - l), 600), s, f, RED)
im.save('Chernobyl-Extended-Thumbnail-B.jpg', quality=92)
# C: the helicopter over the burning reactor
im = base('fc.png', 1.7, 1.3, shift=-330, side='left', dark=0.85).convert('RGB')
text(im, (55, 70), 'दुनिया का', ImageFont.truetype(HI, 105), W, 7)
text(im, (55, 200), 'सबसे बड़ा', ImageFont.truetype(HI, 105), W, 7)
text(im, (55, 330), 'परमाणु हादसा', ImageFont.truetype(HI, 112), Y, 8)
box(im, (70, 560), 'CHERNOBYL 1986', ImageFont.truetype(IN + 'Inter-Black.otf', 62), RED)
im.save('Chernobyl-Extended-Thumbnail-C.jpg', quality=92)
