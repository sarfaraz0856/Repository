# Title cards: white Inter Display, wide tracking, soft glow; focus-in + slow drift + fades.
# Output: RGBA PNG sequences (1920x1080) per title.
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 24
SS = 2  # supersample for crisp edges
FONTS = '/usr/share/fonts/opentype/inter/'

def text_layer(lines, font_file, size, tracking_em, line_gap=1.45):
    font = ImageFont.truetype(FONTS + font_file, size * SS)
    trk = tracking_em * size * SS
    img = Image.new('L', (W * SS, H * SS), 0)
    d = ImageDraw.Draw(img)
    asc, desc = font.getmetrics()
    cap_h = font.getbbox('H')[3] - font.getbbox('H')[1]
    widths = []
    for ln in lines:
        w = sum(font.getlength(c) for c in ln) + trk * (len(ln) - 1)
        widths.append(w)
    lh = size * SS * line_gap
    total_h = cap_h + lh * (len(lines) - 1)
    y0 = (H * SS - total_h) / 2 - font.getbbox('H')[1]
    for i, ln in enumerate(lines):
        x = (W * SS - widths[i]) / 2
        y = y0 + i * lh
        for c in ln:
            d.text((x, y), c, font=font, fill=255)
            x += font.getlength(c) + trk
    img = img.resize((W, H), Image.LANCZOS)
    return img, max(widths) / SS

def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)

def render(name, lines, font_file, size, tracking, dur, fin, fout, out_dir, scale=(1.0, 1.025)):
    base, width = text_layer(lines, font_file, size, tracking)
    print(name, 'text width px', round(width))
    os.makedirs(out_dir, exist_ok=True)
    n = int(round(dur * FPS))
    glow1 = base.filter(ImageFilter.GaussianBlur(10))
    glow2 = base.filter(ImageFilter.GaussianBlur(34))
    for f in range(n):
        t = f / FPS
        a = smooth(t / fin) * (1 - smooth((t - (dur - fout)) / fout))
        k = t / dur
        sc = scale[0] + (scale[1] - scale[0]) * (1 - (1 - k) ** 2)
        blur = 5.0 * (1 - smooth(t / (fin * 1.1)))
        def tf(img):
            # scale about the frame centre
            inv = 1.0 / sc
            cx, cy = W / 2, H / 2
            return img.transform((W, H), Image.AFFINE, (inv, 0, cx - inv * cx, 0, inv, cy - inv * cy), resample=Image.BICUBIC)
        s = tf(base)
        if blur > 0.05:
            s = s.filter(ImageFilter.GaussianBlur(blur))
        g1, g2 = tf(glow1), tf(glow2)
        A = np.asarray(s, dtype=np.float32) / 255.0
        G = (np.asarray(g1, dtype=np.float32) / 255.0) * 0.38 + (np.asarray(g2, dtype=np.float32) / 255.0) * 0.22
        alpha = np.clip(A + G * (1 - A), 0, 1) * a
        rgba = np.zeros((H, W, 4), dtype=np.uint8)
        rgba[..., 0] = 255; rgba[..., 1] = 250; rgba[..., 2] = 242
        rgba[..., 3] = np.round(alpha * 255).astype(np.uint8)
        Image.fromarray(rgba, 'RGBA').save(f'{out_dir}/{f:04d}.png', compress_level=1)
    return n

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'out/titles'
    render('t1', ['CHERNOBYL'], 'InterDisplay-SemiBold.otf', 148, 0.30, 5.0, 1.4, 1.1, f'{out}/t1')
    render('t2', ['26 APRIL 1986'], 'InterDisplay-Medium.otf', 74, 0.42, 3.8, 0.9, 0.8, f'{out}/t2', scale=(1.0, 1.015))
    render('t3', ['THE WORLD’S WORST', 'NUCLEAR DISASTER'], 'InterDisplay-SemiBold.otf', 82, 0.20, 5.5, 1.5, 1.2, f'{out}/t3', scale=(1.0, 1.02))
