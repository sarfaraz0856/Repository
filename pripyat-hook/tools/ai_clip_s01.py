"""Scene 01 clip from the ChatGPT still: a slow steady forward dolly down the centre of the road
with real parallax (the near road moves more than the fogged far end), fog drifting gently near
the vanishing point and the leaves swaying slightly. Frames are left ungraded so the hook's
single grade (and the fade from black) is applied once, by hook_video.py or the ffmpeg encode.

The scene is treated as a corridor: the road is a ground plane and the trees/blocks on both sides
are vertical planes, so each pixel's depth comes from its offset to the vanishing point.

Usage: ai_clip_s01.py SOURCE_IMAGE OUT_DIR FIRST LAST [SECONDS]
"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

f32 = np.float32
W, H, FPS = 1920, 1080, 25
SW, SH = 1672, 941
VP = np.array([832.0, 605.0])        # vanishing point of the road (source px)
SIDE = 7.0                           # sides (trees, blocks) as vertical planes: depth = SIDE / |x - vp|
NEAR_SCALE = 1.22                    # how much the bottom of the road grows by the end of the shot
SWAY_PX, SWAY_HZ = 0.9, 0.4


def depth(x, y):
    zg = 1.0 / np.maximum(y - VP[1], 1e-3)
    zs = SIDE / np.maximum(np.abs(x - VP[0]), 1e-3)
    return np.minimum(zg, zs)


def smooth_noise(shape, sigma, seed):
    n = ndimage.gaussian_filter(np.random.default_rng(seed).standard_normal(shape).astype(f32), sigma)
    return n / n.std()


def main(src, out, first, last, seconds=5.4):
    img = np.asarray(Image.open(src).convert("RGB"), f32) / 255
    assert img.shape[:2] == (SH, SW), img.shape
    coef = [ndimage.spline_filter(img[..., c], order=3) for c in range(3)]
    nf = int(round(seconds * FPS))
    dz_end = (1 - 1 / NEAR_SCALE) * depth(VP[0], SH - 1)

    # leaves: greenish, saturated pixels get a tiny smooth sway
    mx, mn = img.max(2), img.min(2)
    veg = ((img[..., 1] - np.maximum(img[..., 0], img[..., 2]) > 0.015) & (mx - mn > 0.06)).astype(f32)
    veg = ndimage.gaussian_filter(veg, 2.0)
    n1, n2, n3, n4 = (smooth_noise((SH, SW), 22, s) for s in (1, 2, 3, 4))

    # drifting fog, strongest around the vanishing point
    fog_col = img[520:600, 780:880].reshape(-1, 3).mean(0)
    fog_tex = smooth_noise((270, 960), 14, 9)
    yy, xx = np.mgrid[0:H, 0:W].astype(f32)
    vpo = VP * np.array([W / SW, H / SH])
    r = np.hypot((xx - vpo[0]) / 1.4, yy - vpo[1])
    fog_w = 0.85 * np.exp(-(r / 260) ** 1.6) + 0.15 * np.exp(-((yy - vpo[1]) / 160) ** 2)

    ux = xx * (SW / W)
    uy = yy * (SH / H)
    for fi in range(first, last):
        t = fi / FPS
        dz = dz_end * t / seconds
        px, py = ux.copy(), uy.copy()
        for _ in range(3):                         # source point that lands on this output pixel
            z = depth(px, py)
            s = z / np.maximum(z - dz, 1e-9)
            px = VP[0] + (ux - VP[0]) / s
            py = VP[1] + (uy - VP[1]) / s
        ph = 2 * np.pi * SWAY_HZ * t
        coords = np.stack([py, px])
        v = ndimage.map_coordinates(veg, coords, order=1)
        sx = ndimage.map_coordinates(n1 * np.sin(ph) + n2 * np.cos(ph), coords, order=1)
        sy = ndimage.map_coordinates(n3 * np.sin(ph + 1) + n4 * np.cos(ph + 1), coords, order=1)
        px = px + SWAY_PX * v * sx
        py = py + 0.4 * SWAY_PX * v * sy
        frame = np.stack([ndimage.map_coordinates(c, [py, px], order=3, mode="nearest", prefilter=False)
                          for c in coef], -1)
        ft = np.roll(fog_tex, int(t * 10), axis=1)
        ft = np.asarray(Image.fromarray(((ft * 0.15 + 0.5).clip(0, 1) * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), f32) / 255
        a = (0.10 * fog_w * (1 + 1.3 * (ft - 0.5))).clip(0, 0.2)
        frame = frame * (1 - a[..., None]) + fog_col * a[..., None]
        Image.fromarray((np.clip(frame, 0, 1) * 255 + 0.5).astype(np.uint8)).save(f"{out}/f_{fi:04d}.png", compress_level=1)
        print("frame", fi, flush=True)


if __name__ == "__main__":
    a = sys.argv
    main(a[1], a[2], int(a[3]), int(a[4]), *(float(v) for v in a[5:6]))
