"""
Placeholder frames (Pillow), used only when there is no clip/image for a scene.
Cinematic dark frames in the scene's mood colour with simple silhouettes and a
small grey 'PLACEHOLDER · S12 · ...' label. Drawn 10 % larger than 1920x1080
so the Ken Burns move never shows an edge.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PW, PH = 2112, 1188


# ------------------------------------------------------------------ helpers ---
def _vgrad(stops, w=PW, h=PH):
    """Vertical gradient from [(y_frac, (r,g,b)), ...]."""
    ys = np.array([s[0] for s in stops]) * (h - 1)
    cols = np.array([s[1] for s in stops], dtype=np.float32)
    y = np.arange(h)
    g = np.stack([np.interp(y, ys, cols[:, c]) for c in range(3)], axis=1)
    return np.repeat(g[:, None, :], w, axis=1)


def _glow(a, cx, cy, r, color, strength):
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
    g = np.exp(-d ** 2 * 2.2)[..., None] * strength
    return a + g * np.array(color, dtype=np.float32)


def _to_img(a):
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")


def _haze(img, top, bottom, color, amount):
    """Atmospheric haze band (stronger near 'top' y)."""
    a = np.asarray(img).astype(np.float32)
    y = np.arange(PH)[:, None, None]
    m = np.clip(1 - np.abs(y - top) / max(1, bottom - top), 0, 1) * amount
    a = a * (1 - m) + np.array(color, dtype=np.float32) * m
    return _to_img(a)


def _person(d, x, y, h, fill, child=False):
    hr = h * (0.09 if not child else 0.11)
    d.ellipse([x - hr, y - h, x + hr, y - h + 2 * hr], fill=fill)
    sw = h * 0.13
    d.polygon([(x - sw, y - h + 2.2 * hr), (x + sw, y - h + 2.2 * hr), (x + sw * 0.8, y - h * 0.45),
               (x - sw * 0.8, y - h * 0.45)], fill=fill)
    step = h * 0.08
    d.line([(x - sw * 0.4, y - h * 0.47), (x - sw * 0.4 - step, y)], fill=fill, width=max(2, int(h * 0.07)))
    d.line([(x + sw * 0.4, y - h * 0.47), (x + sw * 0.4 + step, y)], fill=fill, width=max(2, int(h * 0.07)))


def _windows(d, x0, y0, x1, y1, cols, rows, color, rng=None, alt=None, p=0.0):
    cw, rh = (x1 - x0) / cols, (y1 - y0) / rows
    for r in range(rows):
        for c in range(cols):
            col = alt if (rng is not None and alt is not None and rng.random() < p) else color
            d.rectangle([x0 + c * cw + cw * 0.22, y0 + r * rh + rh * 0.25, x0 + (c + 1) * cw - cw * 0.22,
                         y0 + (r + 1) * rh - rh * 0.25], fill=col)


def _pine(d, x, y, h, fill):
    for k in range(3):
        top = y - h + k * h * 0.22
        wdt = h * (0.22 + 0.1 * k)
        d.polygon([(x, top), (x - wdt / 2, top + h * 0.45), (x + wdt / 2, top + h * 0.45)], fill=fill)


def _tower_crane(d, x, y, h, jl, jr, fill, w=4):
    d.line([(x, y), (x, y - h)], fill=fill, width=w + 2)
    for k in range(int(h / 30)):                                 # mast lattice
        yy = y - k * 30
        d.line([(x - 6, yy), (x + 6, yy - 30)], fill=fill, width=1)
    d.line([(x - jl, y - h), (x + jr, y - h)], fill=fill, width=w)
    d.line([(x, y - h - h * 0.12), (x + jr * 0.9, y - h)], fill=fill, width=1)
    d.line([(x, y - h - h * 0.12), (x - jl, y - h)], fill=fill, width=1)
    d.rectangle([x - jl, y - h, x - jl + 26, y - h + 16], fill=fill)
    d.line([(x + jr * 0.6, y - h), (x + jr * 0.6, y - h * 0.55)], fill=fill, width=1)


def _iso_block(d, x, y, w, dep, h, top, front, side, win=None):
    """Simple oblique box: front face at (x, y) bottom-left, w wide, h tall, dep deep."""
    dx, dy = dep * 0.6, -dep * 0.45
    d.polygon([(x, y - h), (x + w, y - h), (x + w + dx, y - h + dy), (x + dx, y - h + dy)], fill=top)
    d.polygon([(x + w, y), (x + w + dx, y + dy), (x + w + dx, y - h + dy), (x + w, y - h)], fill=side)
    d.rectangle([x, y - h, x + w, y], fill=front)
    if win:
        rows = max(2, int(h / 22))
        cols = max(2, int(w / 18))
        _windows(d, x + 3, y - h + 4, x + w - 3, y - 3, cols, rows, win)


def _atom(d, cx, cy, r, color, width):
    for ang in (0, 60, 120):
        pts = []
        for k in range(181):
            t = 2 * math.pi * k / 180
            px, py = r * math.cos(t), r * 0.36 * math.sin(t)
            a = math.radians(ang)
            pts.append((cx + px * math.cos(a) - py * math.sin(a), cy + px * math.sin(a) + py * math.cos(a)))
        d.line(pts, fill=color, width=width)
    d.ellipse([cx - r * 0.12, cy - r * 0.12, cx + r * 0.12, cy + r * 0.12], fill=(175, 55, 40))


def _star(d, cx, cy, r, fill):
    pts = []
    for k in range(10):
        rr = r if k % 2 == 0 else r * 0.42
        a = -math.pi / 2 + k * math.pi / 5
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=fill)


def _pylon(d, x, y, h, fill, w=2):
    bw = h * 0.22
    top = y - h
    d.line([(x - bw / 2, y), (x - bw * 0.08, top)], fill=fill, width=w + 1)
    d.line([(x + bw / 2, y), (x + bw * 0.08, top)], fill=fill, width=w + 1)
    for k in range(8):
        f0, f1 = k / 8, (k + 1) / 8
        xl0, xr0 = x - bw / 2 * (1 - f0 * 0.84), x + bw / 2 * (1 - f0 * 0.84)
        xl1, xr1 = x - bw / 2 * (1 - f1 * 0.84), x + bw / 2 * (1 - f1 * 0.84)
        y0, y1 = y - h * f0, y - h * f1
        d.line([(xl0, y0), (xr1, y1)], fill=fill, width=1)
        d.line([(xr0, y0), (xl1, y1)], fill=fill, width=1)
    arms = []
    for k, frac in enumerate((0.82, 0.68)):
        ya = y - h * frac
        span = h * (0.38 if k == 0 else 0.3)
        d.line([(x - span, ya), (x + span, ya)], fill=fill, width=w + 1)
        arms += [(x - span, ya), (x + span, ya)]
    return arms


def _catenary(d, p0, p1, sag, fill, w=1):
    pts = []
    for k in range(41):
        t = k / 40
        pts.append((p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t + sag * 4 * t * (1 - t)))
    d.line(pts, fill=fill, width=w)


# ------------------------------------------------------------------- scenes ---
def _s10(rng):
    a = _vgrad([(0, (36, 24, 16)), (0.55, (176, 112, 58)), (0.78, (122, 80, 44)), (1, (26, 18, 12))])
    a = _glow(a, PW * 0.80, PH * 0.12, 520, (255, 196, 120), 0.55)
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    fx0, fx1, fy0, fy1 = PW * 0.26, PW * 0.95, PH * 0.10, PH * 0.80
    d.rectangle([fx0, fy0, fx1, fy1], fill=(66, 44, 30))
    d.rectangle([fx0 - 10, fy0 - 16, fx1 + 10, fy0], fill=(48, 32, 22))
    _windows(d, PW * 0.62, fy0 + 30, fx1 - 20, fy1 - 20, 9, 12, (40, 27, 19), rng, (98, 66, 40), 0.25)
    # mosaic mural: scientists + atom, then pixelated into tiles
    mx0, my0, mx1, my1 = int(PW * 0.29), int(PH * 0.14), int(PW * 0.59), int(PH * 0.70)
    mural = Image.new("RGB", (mx1 - mx0, my1 - my0), (128, 74, 42))
    md = ImageDraw.Draw(mural)
    mw, mh = mural.size
    md.rectangle([0, 0, mw, mh * 0.55], fill=(70, 88, 104))
    for k in range(9):
        md.line([(mw / 2, mh * 0.42), (mw * (k / 8), 0)], fill=(96, 112, 120), width=10)
    _atom(md, mw / 2, mh * 0.40, mw * 0.24, (232, 196, 132), 9)
    for sx, flip in ((mw * 0.16, 1), (mw * 0.84, -1)):
        md.ellipse([sx - 34, mh * 0.42, sx + 34, mh * 0.42 + 70], fill=(214, 170, 120))
        md.polygon([(sx - 70, mh * 0.55), (sx + 70, mh * 0.55), (sx + 90, mh), (sx - 90, mh)], fill=(226, 220, 204))
        md.line([(sx + 50 * flip, mh * 0.6), (sx + 130 * flip, mh * 0.36)], fill=(226, 220, 204), width=26)
    md.rectangle([0, mh * 0.9, mw, mh], fill=(150, 44, 34))
    small = mural.resize((mw // 16, mh // 16), Image.BILINEAR)
    sm = np.asarray(small).astype(np.float32) * rng.uniform(0.82, 1.12, size=(small.size[1], small.size[0], 1))
    tiles = Image.fromarray(np.clip(sm, 0, 255).astype(np.uint8)).resize((mw, mh), Image.NEAREST)
    td = ImageDraw.Draw(tiles)
    for x in range(0, mw, 16):
        td.line([(x, 0), (x, mh)], fill=(52, 38, 30), width=2)
    for y in range(0, mh, 16):
        td.line([(0, y), (mw, y)], fill=(52, 38, 30), width=2)
    img.paste(tiles, (mx0, my0))
    for k, bx in enumerate(np.linspace(PW * 0.635, PW * 0.9, 4)):
        d.rectangle([bx, fy0 + 6, bx + 64, fy0 + 380], fill=(156, 36, 28))
        d.polygon([(bx, fy0 + 380), (bx + 32, fy0 + 350), (bx + 64, fy0 + 380)], fill=(66, 44, 30))
        _star(d, bx + 32, fy0 + 60, 20, (214, 170, 80))
    d.rectangle([0, fy1, PW, PH], fill=(84, 56, 36))
    for k in range(16):
        x = rng.uniform(PW * 0.04, PW * 0.96)
        _person(d, x, PH * rng.uniform(0.9, 0.97), rng.uniform(100, 140), (28, 18, 13))
    return img


def _s11(rng):
    a = _vgrad([(0, (150, 104, 60)), (0.18, (190, 132, 74)), (0.2, (110, 82, 52)), (1, (34, 26, 18))])
    a = _glow(a, PW * 0.3, PH * 0.05, 600, (255, 200, 130), 0.35)
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    river = []
    for k in range(60):
        t = k / 59
        river.append((PW * (-0.05 + 1.1 * t), PH * (0.95 - 0.72 * t) + 60 * math.sin(t * 5)))
    for w, col in ((90, (150, 112, 70)), (60, (196, 150, 94))):
        d.line(river, fill=col, width=w)
    for _ in range(900):                                         # pine forest
        x, y = rng.uniform(0, PW), rng.uniform(PH * 0.22, PH)
        if (abs(x - PW * 0.55) < PW * 0.2 and abs(y - PH * 0.55) < PH * 0.2):
            continue
        _pine(d, x, y, 12 + (y / PH) ** 2 * 60, (34 + rng.integers(0, 14), 36 + rng.integers(0, 12), 22))
    d.ellipse([PW * 0.33, PH * 0.36, PW * 0.78, PH * 0.76], fill=(132, 98, 60))
    _iso_block(d, PW * 0.40, PH * 0.66, 320, 160, 180, (150, 140, 124), (104, 96, 84), (76, 70, 62))
    _iso_block(d, PW * 0.58, PH * 0.64, 200, 120, 260, (140, 130, 116), (96, 88, 78), (70, 64, 56))
    for k in range(9):                                          # scaffolding
        x = PW * 0.58 + k * 25
        d.line([(x, PH * 0.64), (x, PH * 0.64 - 300)], fill=(54, 44, 34), width=2)
    _tower_crane(d, PW * 0.48, PH * 0.62, 360, 120, 300, (32, 24, 18))
    _tower_crane(d, PW * 0.70, PH * 0.66, 430, 140, 260, (32, 24, 18))
    _tower_crane(d, PW * 0.36, PH * 0.70, 300, 90, 220, (36, 27, 20))
    return _haze(img, PH * 0.2, PH * 0.6, (180, 130, 80), 0.35)


def _s12(rng):
    a = _vgrad([(0, (140, 98, 58)), (0.2, (200, 146, 86)), (0.22, (112, 88, 60)), (1, (52, 40, 28))])
    a = _glow(a, PW * 0.85, PH * 0.02, 700, (255, 210, 140), 0.45)
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    for r, yb in enumerate(np.linspace(PH * 0.3, PH * 1.05, 6)):
        s = 0.45 + 0.75 * r / 5
        d.rectangle([0, yb + 6 * s, PW, yb + 34 * s], fill=(138, 116, 88))
        x = -rng.uniform(0, 160 * s)
        while x < PW:
            w = rng.choice([150, 240, 320]) * s
            h = rng.choice([60, 120, 190]) * s
            _iso_block(d, x, yb, w, 70 * s, h, (226, 204, 166), (186, 160, 124), (120, 100, 78), win=(140, 116, 90))
            for _ in range(3):
                tx = x + rng.uniform(0, w)
                d.ellipse([tx - 12 * s, yb + 2 * s, tx + 12 * s, yb + 22 * s], fill=(52, 60, 34))
            x += w + rng.uniform(90, 180) * s
    return _haze(img, PH * 0.22, PH * 0.55, (196, 150, 100), 0.4)


def _s13(rng):
    a = _vgrad([(0, (60, 42, 28)), (0.45, (186, 128, 70)), (0.62, (124, 88, 54)), (1, (54, 38, 26))])
    a = _glow(a, PW * 0.2, PH * 0.1, 600, (255, 200, 130), 0.45)
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    d.rectangle([PW * 0.14, PH * 0.3, PW * 0.86, PH * 0.62], fill=(150, 128, 100))
    d.rectangle([PW * 0.12, PH * 0.28, PW * 0.88, PH * 0.31], fill=(200, 180, 150))
    d.rectangle([PW * 0.18, PH * 0.34, PW * 0.82, PH * 0.56], fill=(58, 52, 50))
    for x in np.linspace(PW * 0.18, PW * 0.82, 26):
        d.line([(x, PH * 0.34), (x, PH * 0.56)], fill=(120, 106, 90), width=4)
    for k, x in enumerate(np.linspace(PW * 0.36, PW * 0.64, 8)):
        d.rectangle([x, PH * 0.2, x + 52, PH * 0.27], fill=(40, 30, 24))
    for x in (PW * 0.08, PW * 0.93):
        d.ellipse([x - 120, PH * 0.32, x + 120, PH * 0.56], fill=(46, 52, 30))
        d.rectangle([x - 8, PH * 0.5, x + 8, PH * 0.66], fill=(40, 30, 22))
    for k in range(14):
        y = PH * (0.66 + 0.024 * k * k / 6)
        d.line([(0, y), (PW, y)], fill=(112, 82, 52), width=2)
    bal = [(176, 62, 50), (86, 98, 128), (196, 156, 66), (150, 70, 96)]
    for k in range(10):
        x = rng.uniform(PW * 0.05, PW * 0.95)
        y = PH * rng.uniform(0.8, 0.96)
        _person(d, x, y, rng.uniform(150, 190), (32, 22, 16))
        if k % 2 == 0:
            cx = x + 70
            _person(d, cx, y, 95, (32, 22, 16), child=True)
            by = y - 95 - rng.uniform(80, 140)
            d.line([(cx + 6, y - 60), (cx + 18, by + 30)], fill=(30, 22, 16), width=2)
            d.ellipse([cx - 10, by - 28, cx + 46, by + 32], fill=bal[k % 4])
        else:
            px = x - 120
            d.ellipse([px - 46, y - 92, px + 46, y - 38], fill=(40, 30, 24))
            d.chord([px - 46, y - 112, px + 20, y - 52], 180, 360, fill=(40, 30, 24))
            for wx in (px - 30, px + 30):
                d.ellipse([wx - 16, y - 36, wx + 16, y - 4], outline=(30, 22, 16), width=4)
    return img


def _s14(rng):
    a = _vgrad([(0, (70, 48, 30)), (0.5, (200, 140, 76)), (0.56, (130, 96, 60)), (1, (60, 44, 28))])
    a = _glow(a, PW * 0.86, PH * 0.42, 420, (255, 200, 130), 0.5)
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    hx, hy = PW * 0.83, PH * 0.56                                 # plant on the horizon
    d.rectangle([hx - 90, hy - 50, hx + 60, hy], fill=(96, 70, 48))
    d.rectangle([hx + 60, hy - 30, hx + 150, hy], fill=(96, 70, 48))
    for k in range(10):
        col = (150, 84, 64) if k % 2 == 0 else (190, 160, 126)
        d.rectangle([hx - 6, hy - 50 - (k + 1) * 18, hx + 6, hy - 50 - k * 18], fill=col)
    for x0, x1, top in ((0, PW * 0.3, PH * 0.06), (PW * 0.5, PW * 0.68, PH * 0.16)):
        d.rectangle([x0, top, x1, PH * 0.6], fill=(120, 96, 72))
        _windows(d, x0 + 10, top + 10, x1 - 10, PH * 0.58, int((x1 - x0) / 40), int((PH * 0.58 - top) / 44), (70, 54, 40))
    d.rectangle([0, PH * 0.6, PW, PH], fill=(98, 76, 48))
    sx, sy = PW * 0.38, PH * 0.86                                 # swing frame
    col = (36, 26, 20)
    for lx in (sx - 260, sx + 260):
        d.line([(lx - 60, sy), (lx, sy - 330)], fill=col, width=10)
        d.line([(lx + 60, sy), (lx, sy - 330)], fill=col, width=10)
    d.line([(sx - 270, sy - 330), (sx + 270, sy - 330)], fill=col, width=12)
    for k, off in enumerate((-110, 110)):
        swing_x = sx + off + (60 if k == 0 else 0)
        d.line([(sx + off - 20, sy - 330), (swing_x - 20, sy - 90)], fill=col, width=3)
        d.line([(sx + off + 20, sy - 330), (swing_x + 20, sy - 90)], fill=col, width=3)
        d.rectangle([swing_x - 32, sy - 94, swing_x + 32, sy - 82], fill=col)
        if k == 0:
            _person(d, swing_x, sy - 40, 110, (30, 22, 16), child=True)
    dx, dy = PW * 0.72, PH * 0.9                                  # climbing dome
    for r in (170, 120, 70):
        d.arc([dx - r, dy - r, dx + r, dy + r], 180, 360, fill=col, width=5)
    for ang in range(180, 361, 30):
        d.line([(dx, dy), (dx + 170 * math.cos(math.radians(ang)), dy + 170 * math.sin(math.radians(ang)))], fill=col, width=4)
    for _ in range(6):
        _person(d, rng.uniform(PW * 0.05, PW * 0.95), PH * rng.uniform(0.9, 0.98), rng.uniform(80, 105), (30, 22, 16), child=True)
    return img


def _s15(rng):
    a = _vgrad([(0, (22, 28, 26)), (0.58, (124, 136, 120)), (0.62, (60, 66, 58)), (1, (24, 28, 24))])
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    hy = PH * 0.62
    xs = np.linspace(PW * 0.12, PW * 0.78, 4)
    d.rectangle([PW * 0.1, hy - 110, PW * 0.9, hy], fill=(66, 72, 66))
    for k, x in enumerate(xs):
        d.rectangle([x, hy - 230, x + 190, hy], fill=(78, 86, 78))
        d.rectangle([x + 20, hy - 250, x + 170, hy - 230], fill=(92, 100, 92))
        _windows(d, x + 10, hy - 210, x + 180, hy - 120, 8, 3, (54, 60, 54))
    cx = PW * 0.66
    for k in range(14):
        col = (138, 76, 66) if k % 2 == 0 else (196, 198, 186)
        d.rectangle([cx - 20 + k * 0.6, hy - 250 - (k + 1) * 30, cx + 20 - k * 0.6, hy - 250 - k * 30], fill=col)
    d.line([(cx - 60, hy - 250), (cx, hy - 640)], fill=(60, 66, 60), width=3)
    d.line([(cx + 60, hy - 250), (cx, hy - 640)], fill=(60, 66, 60), width=3)
    d.rectangle([0, hy, PW, PH], fill=(40, 46, 38))
    pyl = []
    for x, h in ((PW * 0.08, 620), (PW * 0.47, 520), (PW * 0.9, 600)):
        pyl.append(_pylon(d, x, PH * 0.98, h, (20, 24, 22)))
    for a0, a1 in zip(pyl[:-1], pyl[1:]):
        for p0, p1 in zip(a0, a1):
            _catenary(d, p0, p1, 70, (24, 28, 26), 2)
    return _haze(img, hy, PH * 0.9, (100, 112, 100), 0.25)


def _s16(rng):
    a = _vgrad([(0, (18, 22, 22)), (0.4, (46, 54, 54)), (0.42, (36, 42, 42)), (1, (20, 24, 24))])
    for x in (0.2, 0.5, 0.8):
        a = _glow(a, PW * x, PH * 0.05, 380, (200, 220, 220), 0.25)
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    d.rectangle([0, PH * 0.08, PW, PH * 0.12], fill=(30, 34, 34))
    for x in np.linspace(0, PW, 18):
        d.line([(x, PH * 0.12), (x, PH * 0.42)], fill=(28, 32, 32), width=6)
    cx, cy, rx, ry = PW * 0.5, PH * 0.68, PW * 0.40, PH * 0.27
    d.ellipse([cx - rx - 30, cy - ry - 20, cx + rx + 30, cy + ry + 20], fill=(70, 76, 76))
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(36, 40, 40))
    n = 50
    caps = 0
    for i in range(n):
        for j in range(n):
            u, v = (i + 0.5) / n * 2 - 1, (j + 0.5) / n * 2 - 1
            if u * u + v * v > 1:
                continue
            caps += 1
            x, y = cx + u * rx, cy + v * ry
            sx, sy = rx / n - 3.0, ry / n - 2.2
            shade = rng.uniform(0.85, 1.1)
            col = tuple(int(c * shade) for c in (150, 160, 156))
            if rng.random() < 0.015:
                col = (170, 120, 60)
            d.rectangle([x - sx, y - sy, x + sx, y + sy], fill=col)
            d.line([(x - sx, y - sy), (x + sx, y - sy)], fill=tuple(min(255, int(c * 1.25)) for c in col), width=1)
    _person(d, PW * 0.6, PH * 0.6, 120, (232, 234, 228))
    return img


def _desk_scene(rng, drawer):
    a = np.full((PH, PW, 3), 7, dtype=np.float32) + np.array([0, 1, 3], dtype=np.float32)
    lx, ly = (PW * 0.72, PH * 0.30) if not drawer else (PW * 0.25, PH * 0.22)
    a = _glow(a, lx, ly + 260, 620, (255, 168, 90), 0.42)
    img = _to_img(a)
    d = ImageDraw.Draw(img)
    if not drawer:
        lit = lambda c, k: tuple(int(v * k) for v in c)
        d.polygon([(0, PH * 0.55), (PW, PH * 0.52), (PW, PH), (0, PH)], fill=(40, 27, 18))
        fx0, fy0 = PW * 0.40, PH * 0.6
        d.polygon([(fx0, fy0), (fx0 + 520, fy0 - 20), (fx0 + 540, fy0 + 300), (fx0 + 20, fy0 + 320)], fill=lit((176, 140, 92), 0.9))
        d.polygon([(fx0 + 20, fy0 + 320), (fx0 + 540, fy0 + 300), (fx0 + 540, fy0 + 330), (fx0 + 20, fy0 + 352)], fill=(90, 70, 46))
        d.rectangle([fx0 + 90, fy0 + 60, fx0 + 400, fy0 + 150], outline=(170, 34, 28), width=6)
        f = _font(54)
        d.text((fx0 + 110, fy0 + 72), "СЕКРЕТНО", fill=(170, 34, 28), font=f)
        d.rectangle([fx0 + 280, fy0 + 190, fx0 + 480, fy0 + 250], outline=(150, 30, 26), width=4)
        d.polygon([(lx - 120, ly), (lx + 120, ly), (lx + 60, ly - 110), (lx - 60, ly - 110)], fill=(26, 40, 30))
        d.line([(lx, ly), (lx + 40, PH * 0.53)], fill=(30, 30, 30), width=10)
        d.ellipse([lx - 70, ly - 20, lx + 70, ly + 22], fill=(255, 214, 150))
        d.ellipse([PW * 0.22, PH * 0.66, PW * 0.32, PH * 0.72], fill=(60, 56, 54))
        d.line([(PW * 0.27, PH * 0.67), (PW * 0.33, PH * 0.65)], fill=(220, 210, 190), width=6)
        smoke = Image.new("L", (PW, PH), 0)
        sd = ImageDraw.Draw(smoke)
        for k in range(5):
            pts = [(PW * 0.33 + 40 * math.sin(t / 60 + k) + t * 0.15, PH * 0.64 - t) for t in range(0, 520, 8)]
            sd.line(pts, fill=60, width=10 + 6 * k)
        smoke = smoke.filter(ImageFilter.GaussianBlur(18))
        img = Image.composite(Image.new("RGB", (PW, PH), (150, 140, 130)), img, smoke)
    else:
        d.rectangle([PW * 0.3, PH * 0.3, PW * 0.78, PH], fill=(56, 58, 60))
        for k, y in enumerate((PH * 0.34, PH * 0.66)):
            d.rectangle([PW * 0.32, y, PW * 0.76, y + PH * 0.29], fill=(70, 72, 74), outline=(36, 38, 40), width=4)
            d.rectangle([PW * 0.48, y + 90, PW * 0.60, y + 116], fill=(150, 150, 146))
        kx, ky = PW * 0.54, PH * 0.38
        d.ellipse([kx - 16, ky - 16, kx + 16, ky + 16], fill=(20, 20, 22))
        d.rectangle([kx - 6, ky - 4, kx + 70, ky + 6], fill=(170, 160, 120))
        d.ellipse([kx + 60, ky - 26, kx + 112, ky + 26], outline=(170, 160, 120), width=8)
        hand = [(kx + 100, ky - 60), (kx + 240, ky - 120), (kx + 420, ky - 90), (kx + 430, ky + 80),
                (kx + 250, ky + 110), (kx + 130, ky + 60), (kx + 96, ky + 20)]
        d.polygon(hand, fill=(30, 22, 18))
        img = _to_img(_glow(np.asarray(img).astype(np.float32), lx, ly, 380, (255, 168, 90), 0.25))
    return img


_FONT_PATH = None


def _font(size):
    for cand in (_FONT_PATH, "DejaVuSans-Bold.ttf", r"C:\Windows\Fonts\arialbd.ttf"):
        if cand:
            try:
                return ImageFont.truetype(str(cand), size)
            except OSError:
                pass
    return ImageFont.load_default()


SCENE_FUNCS = {"S10": _s10, "S11": _s11, "S12": _s12, "S13": _s13, "S14": _s14, "S15": _s15,
               "S16": _s16, "S17": lambda r: _desk_scene(r, False), "S18": lambda r: _desk_scene(r, True)}


def make_placeholder(sid, caption, out_path, font_path=None):
    global _FONT_PATH
    _FONT_PATH = font_path
    rng = np.random.default_rng(int(sid[1:]))
    img = SCENE_FUNCS[sid](rng).filter(ImageFilter.GaussianBlur(1.0))
    a = np.asarray(img).astype(np.float32)
    a += rng.normal(0, 2.0, a.shape[:2])[..., None]
    img = _to_img(a)
    d = ImageDraw.Draw(img, "RGBA")
    f = _font(26)
    label = f"PLACEHOLDER · {sid} · {caption}"
    bb = d.textbbox((200, 150), label, font=f)
    d.rectangle([bb[0] - 12, bb[1] - 8, bb[2] + 12, bb[3] + 8], fill=(0, 0, 0, 110))
    d.text((200, 150), label, fill=(170, 170, 170, 190), font=f)
    img.save(out_path)
    return out_path
