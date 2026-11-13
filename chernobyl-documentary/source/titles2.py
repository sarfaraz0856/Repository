# Part II captions: same look as Part I (white Inter Display, tracking, soft glow, focus-in),
# plus two-line lower-third captions with a lighter second line.
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from titles import W, H, FPS, SS, FONTS, smooth

def layer(rows, yc):
    # rows: [(text, font_file, size, tracking_em, gap_after)] stacked, block centred at yc (fraction of H)
    img = Image.new('L', (W * SS, H * SS), 0); d = ImageDraw.Draw(img)
    fonts = [ImageFont.truetype(FONTS + f, sz * SS) for _, f, sz, _, _ in rows]
    caps = [ft.getbbox('H') for ft in fonts]
    heights = [c[3] - c[1] for c in caps]
    total = sum(heights) + sum(r[4] * SS for r in rows[:-1])
    y = yc * H * SS - total / 2
    for (txt, f, sz, trk, gap), ft, cb, hgt in zip(rows, fonts, caps, heights):
        tr = trk * sz * SS
        w = sum(ft.getlength(c) for c in txt) + tr * (len(txt) - 1)
        x = (W * SS - w) / 2
        for c in txt:
            d.text((x, y - cb[1]), c, font=ft, fill=255); x += ft.getlength(c) + tr
        y += hgt + gap * SS
    return img.resize((W, H), Image.LANCZOS)

def render(name, rows, yc, dur, fin, fout, out_dir, scale=(1.0, 1.015), glow=1.0, shadow=0.0):
    base = layer(rows, yc)
    os.makedirs(out_dir, exist_ok=True)
    n = int(round(dur * FPS))
    g1 = base.filter(ImageFilter.GaussianBlur(9)); g2 = base.filter(ImageFilter.GaussianBlur(30)); g3 = base.filter(ImageFilter.GaussianBlur(22))
    cy = yc * H
    for f in range(n):
        tt = f / FPS
        a = smooth(tt / fin) * (1 - smooth((tt - (dur - fout)) / fout))
        k = tt / dur; sc = scale[0] + (scale[1] - scale[0]) * (1 - (1 - k) ** 2)
        blur = 4.0 * (1 - smooth(tt / (fin * 1.1)))
        inv = 1.0 / sc; cx = W / 2
        tf = lambda im: im.transform((W, H), Image.AFFINE, (inv, 0, cx - inv * cx, 0, inv, cy - inv * cy), resample=Image.BICUBIC)
        s = tf(base)
        if blur > 0.05: s = s.filter(ImageFilter.GaussianBlur(blur))
        A = np.asarray(s, dtype=np.float32) / 255.0
        G = (np.asarray(tf(g1), dtype=np.float32) / 255.0) * 0.34 * glow + (np.asarray(tf(g2), dtype=np.float32) / 255.0) * 0.2 * glow
        Wt = np.clip(A + G * (1 - A), 0, 1)
        Sh = np.clip(np.asarray(tf(g3), dtype=np.float32) / 255.0 * 2.2, 0, 1) * shadow
        alpha = np.clip(Wt + Sh * (1 - Wt), 0, 1)
        wf = np.where(alpha > 1e-4, Wt / np.maximum(alpha, 1e-4), 1.0)
        rgba = np.zeros((H, W, 4), dtype=np.uint8)
        rgba[..., 0] = np.round(255 * wf); rgba[..., 1] = np.round(250 * wf); rgba[..., 2] = np.round(242 * wf)
        rgba[..., 3] = np.round(alpha * a * 255).astype(np.uint8)
        Image.fromarray(rgba, 'RGBA').save(f'{out_dir}/{f:04d}.png', compress_level=1)
    print(name, n, 'frames')

if __name__ == '__main__':
    out = 'out/part2/titles'; only = sys.argv[1:]
    SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
    if not only or 'c0a' in only: render('c0a', [('PART II', MD, 40, 0.62, 0)], 0.42, 5.2, 1.1, 1.0, f'{out}/c0a')
    if not only or 'c0b' in only: render('c0b', [('THE MORNING AFTER', SB, 96, 0.22, 0)], 0.515, 5.6, 1.4, 1.1, f'{out}/c0b', scale=(1.0, 1.02))
    if not only or 'c1' in only: render('c1', [('SATURDAY, 26 APRIL 1986', SB, 50, 0.3, 22), ('LIFE IN PRIPYAT WENT ON AS USUAL', RG, 30, 0.32, 0)], 0.8, 5.8, 1.0, 1.0, f'{out}/c1', shadow=0.38)
    if not only or 'c2' in only: render('c2', [('27 APRIL 1986, 13:10', SB, 50, 0.3, 22), ('THE EVACUATION IS ANNOUNCED', RG, 30, 0.32, 0)], 0.8, 5.8, 1.0, 1.0, f'{out}/c2', shadow=0.38)
    if not only or 'c3' in only: render('c3', [('49,360 RESIDENTS', SB, 54, 0.3, 22), ('ABOUT 1,200 BUSES', RG, 32, 0.34, 0)], 0.8, 6.4, 1.0, 1.1, f'{out}/c3', shadow=0.38)
    if not only or 'c4' in only: render('c4', [('THEY WERE TOLD THEY WOULD', SB, 50, 0.26, 18), ('RETURN IN THREE DAYS', SB, 50, 0.26, 0)], 0.8, 6.2, 1.1, 1.1, f'{out}/c4', shadow=0.38)
    if not only or 'c5' in only: render('c5', [('THEY NEVER RETURNED', SB, 84, 0.24, 0)], 0.5, 6.0, 1.6, 1.4, f'{out}/c5', scale=(1.0, 1.025))
