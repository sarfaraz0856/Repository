"""Scene 02 final clip from the ChatGPT still: slow push-in toward the chalkboard, the open
book's right page lifting slightly at 0:08 (in sync with the page-flutter SFX), dust drifting
in the window light, and the same cold grade, vignette and grain as Scene 01/02.

Usage: ai_clip_s02.py SOURCE_IMAGE OUT_DIR   (writes OUT_DIR/f_0000.png ... f_0149.png)
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

f32 = np.float32
W, H, FPS, NF = 1920, 1080, 30, 150
UP = 2                                   # work on a 2x Lanczos upscale of the still
ANCHOR = np.array([1150.0, 275.0])       # chalkboard centre (source px): the push-in target
ZOOM = 1.075
LIFT_AT, LIFT_LEN, LIFT_PX = 2.95, 0.95, 26.0
# top sheet of the book's right page (source px): spine-top, outer-top, outer-bottom, spine-bottom
PAGE = np.array([(1047, 643), (1331, 682), (1410, 822), (951, 768)], float)


def homography(dst):
    """3x3 matrix mapping the unit square (s, w) onto the quad dst."""
    src = [(0, 0), (1, 0), (1, 1), (0, 1)]
    A = []
    for (s, w), (x, y) in zip(src, dst):
        A.append([s, w, 1, 0, 0, 0, -x * s, -x * w, -x])
        A.append([0, 0, 0, s, w, 1, -y * s, -y * w, -y])
    _, _, vt = np.linalg.svd(np.array(A))
    return vt[-1].reshape(3, 3) / vt[-1][-1]


def apply_h(M, x, y):
    d = M[2, 0] * x + M[2, 1] * y + M[2, 2]
    return (M[0, 0] * x + M[0, 1] * y + M[0, 2]) / d, (M[1, 0] * x + M[1, 1] * y + M[1, 2]) / d


def lift_amount(t):
    a = 0.06 * np.sin(2 * np.pi * 0.45 * t) ** 2          # the page trembles in the draught
    e = (t - LIFT_AT) / LIFT_LEN
    if 0 < e < 1:
        a += np.sin(np.pi * e) ** 1.3 * (1 + 0.12 * np.sin(2 * np.pi * 6 * (t - LIFT_AT)) * (1 - e))
    return a * LIFT_PX * UP


def sample(img, x, y):
    return np.stack([ndimage.map_coordinates(img[..., c], [y, x], order=1, mode="nearest") for c in range(3)], -1)


def lift_page(base, t, Hm, Hinv):
    L = lift_amount(t)
    if L < 0.05:
        return base
    quad = PAGE * UP
    x0, x1 = int(quad[:, 0].min()) - 4, int(quad[:, 0].max()) + 4
    y0, y1 = int(quad[:, 1].min() - L) - 6, int(quad[:, 1].max()) + 6
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(float)

    def disp(s, w):
        s = np.clip(s, 0, 1)
        w = np.clip(w, 0, 1)
        return -0.22 * L * s ** 2, -L * s ** 1.7 * (0.8 + 0.2 * (1 - w))

    qx, qy = xx.copy(), yy.copy()
    for _ in range(3):                    # solve q + disp(q) = p for the lifted page
        s, w = apply_h(Hinv, qx, qy)
        dx, dy = disp(s, w)
        qx, qy = xx - dx, yy - dy
    s, w = apply_h(Hinv, qx, qy)
    edge = 0.004 * UP
    inside = (np.clip(s / edge, 0, 1) * np.clip((1 - s) / edge, 0, 1) *
              np.clip(w / edge, 0, 1) * np.clip((1 - w) / edge, 0, 1))
    region = base[y0:y1, x0:x1].copy()
    page = sample(base, qx, qy) * (1 + 0.07 * np.clip(s, 0, 1) * L / (LIFT_PX * UP))[..., None]
    s0, w0 = apply_h(Hinv, xx, yy)
    f = 0.03
    under = np.clip(s0 / f, 0, 1) * np.clip((1 - s0) / f, 0, 1) * np.clip(w0 / f, 0, 1) * np.clip((1 - w0) / f, 0, 1)
    near = ndimage.gaussian_filter(inside, 3 * UP)          # soft shadow hugging the lifted sheet
    shade = 1 - 0.42 * under * np.clip(near * 1.6, 0, 1) * min(1.0, L / (LIFT_PX * UP))
    region = region * shade[..., None]
    region = region * (1 - inside[..., None]) + page * inside[..., None]
    out = base.copy()
    out[y0:y1, x0:x1] = region
    return out


def beam_mask(shape, scale):
    m = Image.new("L", (shape[1], shape[0]), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(m).polygon([tuple(p * scale) for p in np.array([(40, 0), (730, 0), (1120, 640), (380, 720)])], fill=255)
    return ndimage.gaussian_filter(np.asarray(m, f32) / 255, 70 * scale)


def frame_transform(t):
    z = 1 + (ZOOM - 1) * t / 5.0
    sx = 1672 * UP / z / W
    sy = 941 * UP / z / H
    x0 = ANCHOR[0] * UP * (1 - 1 / z)
    y0 = ANCHOR[1] * UP * (1 - 1 / z)
    return z, (sx, 0, x0, 0, sy, y0)


MOTES = np.random.default_rng(2002).random((360, 7))


def dust(img, light, t, z):
    """Floating dust: far motes are fine points, near ones soft blurred specks; brighter in light."""
    out = img
    for x0, y0, d, vx, vy, ph, sz in MOTES:
        px = x0 * 1672 + (vx * 14 - 4) * t + 6 * np.sin(0.35 * t * 2 * np.pi * (0.5 + ph) + ph * 6)
        py = y0 * 941 + (vy * 10 - 7) * t + 4 * np.sin(0.27 * t * 2 * np.pi * (0.5 + sz) + ph * 3)
        zf = z ** (1 + 1.2 * (1 - d))                      # near motes spread faster as we push in
        sxp = (ANCHOR[0] + (px - ANCHOR[0]) * zf) / 1672 * W
        syp = (ANCHOR[1] + (py - ANCHOR[1]) * zf) / 941 * H
        if not (-30 < sxp < W + 30 and -30 < syp < H + 30):
            continue
        lv = light[int(np.clip(syp / 4, 0, light.shape[0] - 1)), int(np.clip(sxp / 4, 0, light.shape[1] - 1))]
        sig = 0.7 + 0.6 * sz if d > 0.25 else 3 + 7 * (0.25 - d) / 0.25
        b = (0.05 + 0.55 * lv) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.8 + ph) * t + ph * 9) ** 2)
        b *= 0.9 / (1 + sig * sig / 2.5)
        if b < 0.004:
            continue
        r = int(3 * sig) + 2
        xa, xb = max(int(sxp) - r, 0), min(int(sxp) + r + 1, W)
        ya, yb = max(int(syp) - r, 0), min(int(syp) + r + 1, H)
        if xa >= xb or ya >= yb:
            continue
        xs = np.arange(xa, xb)
        ys = np.arange(ya, yb)
        k = np.exp(-(((xs[None, :] - sxp) ** 2 + (ys[:, None] - syp) ** 2) / (2 * sig * sig)))
        out[ya:yb, xa:xb] += (b * k)[..., None] * np.array([0.96, 0.97, 0.93], f32)
    return out


def grade(c, fi):
    lum = (0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2])[..., None]
    c = lum + 0.68 * (c - lum)
    c = c * np.array([0.955, 1.0, 0.985], f32)
    c = c + (1 - np.clip(lum, 0, 1)) ** 3 * np.array([-0.012, 0.004, 0.010], f32)
    c = np.clip(c, 0, 1)
    c = 0.8 * c + 0.2 * c * c * (3 - 2 * c)
    c = 0.03 + 0.94 * c
    yy, xx = np.mgrid[0:H, 0:W]
    r2 = ((xx - W / 2) / (W / 2)) ** 2 * 0.8 + ((yy - H / 2) / (H / 2)) ** 2 * 0.6
    c = c * 0.95 * (1 - 0.24 * r2)[..., None]
    r = np.random.default_rng(3000 + fi)
    g = ndimage.gaussian_filter(r.standard_normal((H, W)).astype(f32), 0.65)
    g /= g.std()
    lum = 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
    c = c + (g * 0.020 * (0.55 + 1.6 * lum * (1 - lum)))[..., None]
    c = c + ndimage.gaussian_filter(r.standard_normal((H, W, 3)).astype(f32), (0.8, 0.8, 0)) * 0.004
    return (np.clip(c, 0, 1) * 255 + 0.5).astype(np.uint8)


def main(src, out, first=0, last=NF):
    im = Image.open(src).convert("RGB")
    assert im.size == (1672, 941), im.size
    base = np.asarray(im.resize((1672 * UP, 941 * UP), Image.LANCZOS), f32) / 255
    Hm = homography(PAGE * UP)
    Hinv = np.linalg.inv(Hm)
    beam = beam_mask(base.shape, UP)
    haze_tex = ndimage.gaussian_filter(np.random.default_rng(5).random((300, 540)).astype(f32), 9)
    haze_tex = (haze_tex - haze_tex.min()) / (haze_tex.max() - haze_tex.min())
    for fi in range(first, last):
        t = fi / FPS
        frame = lift_page(base, t, Hm, Hinv)
        z, aff = frame_transform(t)
        img8 = Image.fromarray((np.clip(frame, 0, 1) * 255 + 0.5).astype(np.uint8))
        view = img8.transform((W, H), Image.AFFINE, aff, resample=Image.BICUBIC)
        view = view.filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=2))
        c = np.asarray(view, f32) / 255
        # drifting haze in the window light
        bm = np.asarray(Image.fromarray((beam * 255).astype(np.uint8)).transform((W, H), Image.AFFINE, aff, resample=Image.BILINEAR), f32) / 255
        shift = int(t * 9)
        ht = np.roll(haze_tex, shift, axis=1)
        ht = np.asarray(Image.fromarray((ht * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), f32) / 255
        c = c + (0.055 * bm * (0.5 + ht))[..., None] * np.array([0.92, 0.95, 0.92], f32)
        lum = 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
        light = ndimage.gaussian_filter(lum[::4, ::4], 12)
        light = np.clip((light - 0.25) / 0.5, 0, 1)
        c = dust(c, light, t, z)
        Image.fromarray(grade(c, fi)).save(f"{out}/f_{fi:04d}.png", compress_level=1)
        print("frame", fi, flush=True)


if __name__ == "__main__":
    a = sys.argv[3:5]
    main(sys.argv[1], sys.argv[2], *(int(v) for v in a))
