"""Procedural placeholder for Scene 02 (0:05-0:10): abandoned Soviet classroom seen from a
low angle near the floor (28 mm), an open textbook sharp in the foreground, overturned desks,
old green chalkboard soft in the background, grey daylight and dust through tall dirty windows
on the left. Slow push-in toward the chalkboard; one page lifts at 0:08 (3.0 s into the shot).

Usage: render_s02.py OUT_DIR FIRST_FRAME LAST_FRAME_EXCLUSIVE
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
from render import samp, sstep, hash3, N1, N2, N3

f32 = np.float32
W, H = 1920, 1080
SS = 2
RW, RH = W * SS, H * SS
FPS = 30
FOCAL_MM, FSTOP = 28.0, 2.8
F = (RW / 2) / (18.0 / FOCAL_MM)
YAW, PITCH = np.radians(-10.0), np.radians(-5.0)
CAM0 = np.array([0.35, 0.38, 0.0])
PUSH = 0.15                       # metres over the shot, toward the chalkboard
LIFT_AT, LIFT_LEN = 2.95, 0.95    # page lift (SFX at 3.0 s)

X0, X1, Y1, Z0, Z1 = -3.4, 3.4, 3.3, -1.5, 8.0
WINDOWS = [(1.0, 2.6), (3.6, 5.2), (6.2, 7.6)]
WY0, WY1, TRANSOM = 0.9, 3.0, 2.25
LIGHT = np.array([0.85, -0.45, -0.05])
LIGHT = (LIGHT / np.linalg.norm(LIGHT)).astype(f32)
EXTERIOR = np.array([0.93, 0.95, 0.92], f32)

RIGHT = np.array([np.cos(YAW), 0, -np.sin(YAW)])
FWD = np.array([np.sin(YAW) * np.cos(PITCH), np.sin(PITCH), np.cos(YAW) * np.cos(PITCH)])
UP = np.array([-np.sin(YAW) * np.sin(PITCH), np.cos(PITCH), -np.cos(YAW) * np.sin(PITCH)])
HFWD = np.array([np.sin(YAW), 0, np.cos(YAW)])

# materials
FLOOR, CEIL, WALL_L, WALL_R, WALL_B, WALL_F = 1, 2, 3, 4, 5, 6
DESK, METAL, CHAIRW, PAGE, COVER, EDGE, PAPER, PLANT = 10, 11, 12, 20, 21, 22, 23, 24


def rot_y(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rot_x(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def rot_z(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


# ---------------------------------------------------------------- scene objects
OBJECTS = []


def obb(C, R, he, mat, seed, mat_top=None, uv_off=(0.0, 0.0), color=None):
    OBJECTS.append(dict(kind="obb", C=np.asarray(C, float), R=np.asarray(R, float), he=np.asarray(he, float),
                        mat=mat, mat_top=mat if mat_top is None else mat_top, seed=seed,
                        uv_off=np.asarray(uv_off, float), color=color))


def quad(P0, au, av, u_rng, v_rng, mat, seed, uv=(1, 0, 1, 0), store=True):
    q = dict(kind="quad", P0=np.asarray(P0, float), au=np.asarray(au, float), av=np.asarray(av, float),
             u_rng=u_rng, v_rng=v_rng, mat=mat, seed=seed, uv=uv)
    if store:
        OBJECTS.append(q)
    return q


DESK_PARTS = ([((0, 0.745, 0), (0.55, 0.015, 0.25), DESK), ((0, 0.6, 0.225), (0.5, 0.11, 0.008), DESK),
               ((0, 0.12, 0), (0.5, 0.012, 0.012), METAL)]
              + [((sx, 0.365, sz), (0.016, 0.365, 0.016), METAL) for sx in (-0.5, 0.5) for sz in (-0.2, 0.2)]
              + [((sx, 0.12, 0), (0.014, 0.014, 0.2), METAL) for sx in (-0.5, 0.5)])
CHAIR_PARTS = ([((0, 0.43, 0), (0.2, 0.015, 0.19), CHAIRW), ((0, 0.70, -0.17), (0.19, 0.09, 0.012), CHAIRW)]
               + [((sx, 0.21, sz), (0.012, 0.21, 0.012), METAL) for sx in (-0.17, 0.17) for sz in (-0.16, 0.16)]
               + [((sx, 0.62, -0.17), (0.012, 0.2, 0.012), METAL) for sx in (-0.17, 0.17)])
POSES = {"up": np.eye(3), "side": rot_z(np.pi / 2), "back": rot_x(-np.pi / 2), "down": rot_x(np.pi)}
SHADOW_CASTERS = []


def furniture(parts, x, z, yaw_deg, pose, seed):
    Rt = rot_y(np.radians(yaw_deg)) @ POSES[pose]
    corners = []
    for c, he, _ in parts:
        for sx in (-1, 1):
            for sy in (-1, 1):
                for sz in (-1, 1):
                    corners.append(Rt @ (np.array(c) + np.array(he) * (sx, sy, sz)))
    T = np.array([x, -min(p[1] for p in corners), z])
    for k, (c, he, mat) in enumerate(parts):
        obb(T + Rt @ np.array(c), Rt, he, mat, seed * 10 + k)
        if max(he) > 0.1:
            SHADOW_CASTERS.append(OBJECTS[-1])


for i, (x, z, yaw, pose) in enumerate([(-1.1, 2.7, 25, "down"), (1.0, 3.3, -8, "up"), (-0.2, 4.4, 65, "back"),
                                       (1.9, 5.3, 5, "up"), (-2.1, 5.4, -12, "up"), (0.6, 6.2, -30, "down"),
                                       (-1.0, 6.9, 3, "up"), (2.2, 7.1, 0, "up")]):
    furniture(DESK_PARTS, x, z, yaw, pose, 100 + i)
for i, (x, z, yaw, pose) in enumerate([(1.0, 2.3, 40, "side"), (1.6, 2.9, -15, "up"), (-2.3, 3.8, 70, "side"),
                                       (1.1, 4.2, 10, "up"), (-0.9, 5.6, -20, "up"), (0.0, 5.0, 120, "side")]):
    furniture(CHAIR_PARTS, x, z, yaw, pose, 200 + i)

HERO_C = np.array([0.27, 0.0, 1.30])
HERO_YAW = np.radians(40.0)
HERO_A = np.array([np.cos(HERO_YAW), 0, -np.sin(HERO_YAW)])   # across the spread
HERO_B = np.array([np.sin(HERO_YAW), 0, np.cos(HERO_YAW)])     # along the spine
Y_AX = np.array([0.0, 1.0, 0.0])
HERO_SEED = 7


def open_book(C, yaw, seed, cover_color):
    R = rot_y(yaw)
    a, b = R[:, 0], R[:, 2]
    obb(C + Y_AX * 0.0015, R, (0.215, 0.0015, 0.147), COVER, seed, color=cover_color)
    obb(C + a * -0.1085 + Y_AX * 0.0095, R, (0.0965, 0.0065, 0.14), EDGE, seed + 1, mat_top=PAGE, uv_off=(-0.1085, 0))
    obb(C + a * 0.1085 + Y_AX * 0.008, R, (0.0965, 0.005, 0.14), EDGE, seed + 2, mat_top=PAGE, uv_off=(0.1085, 0))
    for side, top in ((-1, 0.016), (1, 0.013)):
        g = side * 0.012 * a + (top - 0.004) * Y_AX
        L = np.linalg.norm(g)
        quad(C + Y_AX * 0.004, g / L, b, (0, L), (-0.14, 0.14), PAGE, seed + 3, uv=(side * 0.012 / L, 0, 1, 0))


open_book(HERO_C, HERO_YAW, HERO_SEED, (0.36, 0.13, 0.10))
open_book(np.array([-0.95, 0.0, 2.65]), np.radians(100), 31, (0.14, 0.22, 0.32))
open_book(np.array([1.55, 0.0, 4.75]), np.radians(-20), 41, (0.18, 0.27, 0.20))
for k, (x, z, yaw, he, col) in enumerate([(0.95, 1.9, 20, (0.085, 0.01, 0.11), (0.15, 0.22, 0.33)),
                                         (-0.5, 1.75, -35, (0.085, 0.012, 0.11), (0.33, 0.14, 0.11)),
                                         (-1.7, 3.6, 10, (0.1, 0.015, 0.13), (0.22, 0.24, 0.18)),
                                         (0.4, 3.2, 75, (0.085, 0.009, 0.11), (0.30, 0.24, 0.14))]):
    obb((x, he[1], z), rot_y(np.radians(yaw)), he, COVER, 300 + k, color=col)
for k, (x, z, yaw) in enumerate([(-0.25, 1.48, 15), (0.78, 1.58, -40), (1.25, 2.4, 70), (-1.4, 2.1, 5),
                                 (0.1, 2.9, -20), (-0.7, 3.6, 50), (1.6, 3.9, 30), (-1.9, 3.0, -60),
                                 (0.5, 4.8, 10), (-1.2, 5.3, 80), (-0.15, 2.05, 110), (1.05, 1.15, 25)]):
    R = rot_y(np.radians(yaw))
    quad(np.array([x, 0.0012 + 0.0002 * k, z]) - R[:, 0] * 0.105, R[:, 0], R[:, 2], (0, 0.21), (-0.1485, 0.1485), PAPER, 400 + k)

TUFTS = [(-0.35, 1.0, 0.09), (0.85, 1.35, 0.13), (-0.9, 1.9, 0.07), (1.45, 2.0, 0.15), (0.15, 2.4, 0.06),
         (-1.6, 3.3, 0.16), (0.6, 3.7, 0.1), (-0.3, 6.0, 0.14), (2.3, 3.1, 0.12), (-2.6, 4.6, 0.18)]


# ---------------------------------------------------------------- rays
_px = (np.arange(RW, dtype=f32) + 0.5 - RW / 2) / F
_py = -(np.arange(RH, dtype=f32) + 0.5 - RH / 2) / F
DX = (_px[None, :] * RIGHT[0] + _py[:, None] * UP[0] + FWD[0]).astype(f32)
DY = (_px[None, :] * RIGHT[1] + _py[:, None] * UP[1] + FWD[1]).astype(f32)
DZ = (_px[None, :] * RIGHT[2] + _py[:, None] * UP[2] + FWD[2]).astype(f32)
_n = np.sqrt(DX * DX + DY * DY + DZ * DZ)
DX /= _n
DY /= _n
DZ /= _n
del _n


def cam_pos(time):
    return CAM0 + HFWD * PUSH * (time / 5.0)


def page_angle(time):
    th = 0.4 + 1.0 * np.sin(2 * np.pi * 0.45 * time) ** 2
    e = (time - LIFT_AT) / LIFT_LEN
    if 0 < e < 1:
        th += 24.0 * np.sin(np.pi * e) ** 1.3 * (1 + 0.12 * np.sin(2 * np.pi * 6 * (time - LIFT_AT)) * (1 - e))
    return np.radians(th)


def screen_box(points, O):
    v = np.asarray(points) - O
    zc = v @ FWD
    if np.all(zc < 0.05):
        return None
    if np.any(zc < 0.05):
        return 0, RH, 0, RW
    px = RW / 2 + (v @ RIGHT) / zc * F
    py = RH / 2 - (v @ UP) / zc * F
    c0, c1 = int(max(px.min() - 3, 0)), int(min(px.max() + 3, RW))
    r0, r1 = int(max(py.min() - 3, 0)), int(min(py.max() + 3, RH))
    if c0 >= c1 or r0 >= r1:
        return None
    return r0, r1, c0, c1


class GBuf:
    def __init__(self):
        self.t = np.full((RH, RW), np.inf, f32)
        self.mat = np.zeros((RH, RW), np.int8)
        self.u = np.zeros((RH, RW), f32)
        self.v = np.zeros((RH, RW), f32)
        self.seed = np.zeros((RH, RW), f32)
        self.nx = np.zeros((RH, RW), f32)
        self.ny = np.zeros((RH, RW), f32)
        self.nz = np.zeros((RH, RW), f32)

    def write(self, sl, m, t, mat, u, v, seed, n):
        for name, val in (("t", t), ("u", u), ("v", v), ("nx", n[0]), ("ny", n[1]), ("nz", n[2])):
            arr = getattr(self, name)[sl]
            arr[m] = val[m] if np.ndim(val) else val
        self.mat[sl][m] = mat[m] if np.ndim(mat) else mat
        self.seed[sl][m] = seed


def room(g, O):
    t = np.full((RH, RW), np.inf, f32)
    mat = np.zeros((RH, RW), np.int8)
    for ax, D, lo, hi, m_lo, m_hi in ((1, DY, 0.0, Y1, FLOOR, CEIL), (0, DX, X0, X1, WALL_L, WALL_R),
                                      (2, DZ, Z0, Z1, WALL_F, WALL_B)):
        o = O[ax]
        with np.errstate(divide="ignore", invalid="ignore"):
            tl = np.where(D < 0, (lo - o) / D, np.inf)
            th = np.where(D > 0, (hi - o) / D, np.inf)
        for tt, mm in ((tl, m_lo), (th, m_hi)):
            upd = tt < t
            t[upd] = tt[upd]
            mat[upd] = mm
    g.t[:] = t
    g.mat[:] = mat
    P = (O[0] + t * DX, O[1] + t * DY, O[2] + t * DZ)
    for m, (ui, vi), nrm in ((FLOOR, (0, 2), (0, 1, 0)), (CEIL, (0, 2), (0, -1, 0)), (WALL_L, (2, 1), (1, 0, 0)),
                             (WALL_R, (2, 1), (-1, 0, 0)), (WALL_B, (0, 1), (0, 0, -1)), (WALL_F, (0, 1), (0, 0, 1))):
        s = mat == m
        g.u[s] = P[ui][s]
        g.v[s] = P[vi][s]
        g.nx[s], g.ny[s], g.nz[s] = nrm


def hit_obb(g, ob, O):
    corners = [ob["C"] + ob["R"] @ (ob["he"] * np.array([sx, sy, sz])) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]
    box = screen_box(corners, O)
    if box is None:
        return
    r0, r1, c0, c1 = box
    sl = (slice(r0, r1), slice(c0, c1))
    R, he = ob["R"], ob["he"]
    Ol = (O - ob["C"]) @ R
    D = [DX[sl], DY[sl], DZ[sl]]
    Dl = [D[0] * R[0, k] + D[1] * R[1, k] + D[2] * R[2, k] for k in range(3)]
    tmin = np.full(D[0].shape, -np.inf, f32)
    tmax = np.full(D[0].shape, np.inf, f32)
    axis = np.zeros(D[0].shape, np.int8)
    with np.errstate(divide="ignore", invalid="ignore"):
        for k in range(3):
            inv = 1.0 / np.where(np.abs(Dl[k]) < 1e-9, 1e-9, Dl[k])
            t1 = (-he[k] - Ol[k]) * inv
            t2 = (he[k] - Ol[k]) * inv
            near = np.minimum(t1, t2)
            far = np.maximum(t1, t2)
            upd = near > tmin
            axis[upd] = k
            tmin = np.maximum(tmin, near)
            tmax = np.minimum(tmax, far)
    m = (tmax >= tmin) & (tmin > 0) & (tmin < g.t[sl])
    if not m.any():
        return
    Pl = [Ol[k] + tmin * Dl[k] for k in range(3)]
    sign = np.zeros(D[0].shape, f32)
    for k in range(3):
        sign = np.where(axis == k, -np.sign(Dl[k]), sign)
    n = [sum(np.where(axis == k, sign * R[j, k], 0) for k in range(3)) for j in range(3)]
    top = (axis == 1) & (sign > 0)
    u = np.where(axis == 0, Pl[2], np.where(axis == 1, Pl[0] + ob["uv_off"][0], Pl[0]))
    v = np.where(axis == 0, Pl[1], np.where(axis == 1, Pl[2] + ob["uv_off"][1], Pl[1]))
    mat = np.where(top, ob["mat_top"], ob["mat"]).astype(np.int8)
    g.write(sl, m, tmin, mat, u, v, ob["seed"], n)


def hit_quad(g, q, O, alpha_fn=None):
    P0, au, av = q["P0"], q["au"], q["av"]
    (u0, u1), (v0, v1) = q["u_rng"], q["v_rng"]
    corners = [P0 + au * uu + av * vv for uu in (u0, u1) for vv in (v0, v1)]
    box = screen_box(corners, O)
    if box is None:
        return
    r0, r1, c0, c1 = box
    sl = (slice(r0, r1), slice(c0, c1))
    nrm = np.cross(au, av)
    D = (DX[sl], DY[sl], DZ[sl])
    den = D[0] * nrm[0] + D[1] * nrm[1] + D[2] * nrm[2]
    with np.errstate(divide="ignore", invalid="ignore"):
        t = ((P0 - O) @ nrm) / den
    rel = [O[k] + t * D[k] - P0[k] for k in range(3)]
    uu = rel[0] * au[0] + rel[1] * au[1] + rel[2] * au[2]
    vv = rel[0] * av[0] + rel[1] * av[1] + rel[2] * av[2]
    m = (t > 0) & (uu >= u0) & (uu <= u1) & (vv >= v0) & (vv <= v1) & (t < g.t[sl])
    if alpha_fn is not None:
        m &= alpha_fn(uu, vv)
    if not m.any():
        return
    flip = -np.sign(den)
    n = [nrm[k] * flip for k in range(3)]
    su, ou, sv, ov = q["uv"]
    g.write(sl, m, t.astype(f32), q["mat"], (uu * su + ou).astype(f32), (vv * sv + ov).astype(f32), q["seed"], n)


def tuft_alpha(seed, width, height):
    r = np.random.default_rng(seed)
    blades = [(r.uniform(-0.4, 0.4) * width, r.uniform(-0.6, 0.6) * width, r.uniform(0.45, 1.0) * height,
               r.uniform(0.004, 0.008)) for _ in range(14)]

    def fn(u, v):
        m = np.zeros(u.shape, bool)
        for bx, lean, h, w in blades:
            vn = np.clip(v / h, 0, 1)
            m |= (np.abs(u - (bx + lean * vn ** 2)) < w * (1 - vn)) & (v < h) & (v >= 0)
        return m
    return fn


# ---------------------------------------------------------------- materials
def window_mask(z, y, soft):
    m = np.zeros(z.shape, f32)
    for z0, z1 in WINDOWS:
        zc = 0.5 * (z0 + z1)
        i = np.nonzero(np.abs(z - zc) < 0.5 * (z1 - z0) + soft)[0]
        if not len(i):
            continue
        zi, yi, si = z[i], y[i], soft[i]
        o = sstep(-si, si, zi - z0 - 0.07) * sstep(-si, si, z1 - 0.07 - zi) * \
            sstep(-si, si, yi - WY0 - 0.07) * sstep(-si, si, WY1 - 0.07 - yi)
        o = o * sstep(0.03 - si, 0.03 + si, np.abs(zi - zc)) * sstep(0.03 - si, 0.03 + si, np.abs(yi - TRANSOM))
        m[i] = np.maximum(m[i], o)
    return m


def shaft(P):
    """Daylight beam through the left windows reaching point(s) P (unoccluded)."""
    px, py, pz = (np.asarray(a, f32) for a in P)
    tb = (px - f32(X0)) / LIGHT[0]
    wz = pz - tb * LIGHT[2]
    wy = py - tb * LIGHT[1]
    out = np.zeros(px.shape, f32)
    c = np.nonzero((wz > WINDOWS[0][0] - 0.6) & (wz < WINDOWS[-1][1] + 0.6) & (wy > WY0 - 0.6) & (wy < WY1 + 0.6))[0]
    if len(c):
        soft = 0.012 + 0.045 * tb[c]
        dirt = 0.72 + 0.22 * samp(N1, wz[c] * 5, wy[c] * 5)
        out[c] = window_mask(wz[c], wy[c], soft) * dirt
    return out


def wall_paint(u, v, seed, top_y=1.55):
    lower = v < top_y
    base = np.where(lower[:, None], np.array([0.46, 0.57, 0.51], f32), np.array([0.71, 0.71, 0.67], f32))
    stripe = (v > top_y) & (v < top_y + 0.035)
    base[stripe] = (0.30, 0.38, 0.34)
    p = samp(N1, u * 3 + seed, v * 3) + 0.3 * (samp(N3, u * 12, v * 12) - 0.5)
    thr = np.where(lower, 0.60, 0.64)
    peeled = p > thr
    rim = (p > thr - 0.018) & ~peeled
    plaster = np.array([0.58, 0.55, 0.49], f32) * (0.85 + 0.3 * samp(N2, u * 20, v * 20))[:, None]
    c = np.where(peeled[:, None], plaster, base)
    c = np.where(rim[:, None], np.minimum(base * 1.18, 1), c)
    inner = peeled & (p < thr + 0.02)
    c[inner] *= 0.7
    stain = sstep(0.55, 0.8, samp(N2, u * 6 + seed * 3, v * 0.35)) * sstep(1.0, 3.2, v)
    c = c * (1 - 0.3 * stain[:, None]) + 0.3 * stain[:, None] * np.array([0.42, 0.38, 0.30], f32)
    c *= (0.82 + 0.18 * samp(N3, u * 2, v * 2))[:, None]
    base_board = v < 0.1
    c[base_board] = (0.20, 0.15, 0.11)
    return c


def shade_albedo(g, idx, O, tsel, time):
    """Albedo (and emission) for the pixel list idx (flat indices)."""
    mat = g.mat.ravel()[idx]
    u = g.u.ravel()[idx]
    v = g.v.ravel()[idx]
    seed = g.seed.ravel()[idx]
    alb = np.zeros((len(idx), 3), f32)
    emit = np.zeros((len(idx), 3), f32)
    lod = np.clip(1 - (tsel - 1.0) / 4.0, 0, 1)

    s = mat == FLOOR
    if s.any():
        x, z, tt = u[s], v[s], tsel[s]
        bi = np.floor(x / 0.11)
        fb = x / 0.11 - bi
        tone = 0.80 + 0.35 * hash3(bi, 1, 5)
        grain = samp(N2, x * 30 + bi * 7, z * 2.0)
        wood = np.array([0.33, 0.27, 0.20], f32) * (tone * (0.85 + 0.3 * grain))[:, None]
        joint = np.mod(z + 2.0 * hash3(bi, 2, 9), 2.0) < 0.012
        seam = (fb < 0.04) | (fb > 0.96) | joint
        dust = sstep(0.35, 0.7, samp(N1, x * 1.5, z * 1.5)) * 0.35 + 0.25
        c = wood * (1 - dust[:, None]) + dust[:, None] * np.array([0.43, 0.42, 0.39], f32)
        moss = seam & (samp(N1, x * 9 + 40, z * 9) > 0.62)
        c[seam] *= 0.35
        c[moss] = np.array([0.19, 0.26, 0.13], f32) * (0.8 + 0.4 * samp(N3, x[moss] * 60, z[moss] * 60))[:, None]
        patchy = samp(N1, x * 2 + 17, z * 2) > 0.55
        flakes = (samp(N3, x * 160, z * 160) > 0.86) & patchy & (np.clip(1 - tt / 6, 0, 1) > 0)
        c[flakes] = (0.55, 0.64, 0.57)
        chips = (samp(N2, x * 200 + 5, z * 200) > 0.88) & patchy
        c[chips] = c[chips] * 0.4 + 0.6 * np.array([0.66, 0.64, 0.58], f32)
        far = np.clip((tt - 2.0) / 5.0, 0, 1)[:, None]
        c = c * (1 - far * 0.5) + far * 0.5 * np.array([0.30, 0.28, 0.24], f32)
        ao = 0.65 + 0.35 * sstep(0.0, 0.7, np.minimum(np.minimum(x - X0, X1 - x), Z1 - z))
        alb[s] = c * ao[:, None]

    for m_id, sd in ((WALL_B, 3.0), (WALL_R, 5.0), (WALL_F, 7.0)):
        s = mat == m_id
        if s.any():
            alb[s] = wall_paint(u[s], v[s], sd)
    s = mat == WALL_B
    if s.any():
        x, y = u[s], v[s]
        board = (np.abs(x) < 1.8) & (y > 0.95) & (y < 2.15)
        frame = board & ~((np.abs(x) < 1.75) & (y > 1.0) & (y < 2.1))
        smudge = samp(N1, x * 2 + 9, y * 2) * 0.6 + 0.4 * samp(N3, x * 18, y * 18)
        green = np.array([0.13, 0.21, 0.17], f32) * (0.8 + 0.45 * smudge)[:, None]
        chalk = sstep(0.62, 0.75, samp(N2, x * 9, y * 26)) * (y > 1.3)
        green = green + chalk[:, None] * np.array([0.10, 0.11, 0.10], f32)
        c = alb[s]
        c[board] = green[board]
        c[frame] = (0.30, 0.22, 0.15)
        portrait = (np.abs(x) < 0.35) & (y > 2.35) & (y < 2.95)
        c[portrait] = np.minimum(c[portrait] * 1.12, 1)
        alb[s] = c

    s = mat == WALL_L
    if s.any():
        z, y = u[s], v[s]
        c = wall_paint(z, y, 1.0)
        open_ = np.zeros(z.shape, bool)
        glass = np.zeros(z.shape, bool)
        for z0, z1 in WINDOWS:
            o = (z > z0) & (z < z1) & (y > WY0) & (y < WY1)
            open_ |= o
            g_ = o & (z > z0 + 0.07) & (z < z1 - 0.07) & (y > WY0 + 0.07) & (y < WY1 - 0.07)
            zc = 0.5 * (z0 + z1)
            g_ &= (np.abs(z - zc) > 0.03) & (np.abs(y - TRANSOM) > 0.03)
            glass |= g_
        c[open_ & ~glass] = (0.30, 0.31, 0.29)
        pane = np.floor(z / 0.45) * 7 + np.floor(y / 0.7)
        broken = hash3(pane, 3, 3) < 0.3
        trees = sstep(0.5, 0.62, samp(N2, z * 1.2, y * 1.2)) * sstep(2.6, 1.6, y)
        ext = EXTERIOR[None, :] * (1 - 0.22 * trees[:, None])
        dirt = np.where(broken, 1.0, 0.66 + 0.2 * samp(N1, z * 5, y * 5) - 0.12 * sstep(0.5, 0.8, samp(N2, z * 14, y * 0.8)))
        e = ext * dirt[:, None] * 1.25
        em = np.zeros((len(z), 3), f32)
        em[glass] = e[glass]
        alb[s] = np.where(glass[:, None], 0, c)
        emit[s] = em

    s = mat == CEIL
    if s.any():
        alb[s] = wall_paint(u[s] * 0.7, v[s] * 0.7 + 3.0, 11.0) * 0.95

    s = mat == DESK
    if s.any():
        gr = samp(N2, u[s] * 2 + seed[s], v[s] * 40)
        c = np.array([0.33, 0.24, 0.16], f32) * (0.75 + 0.45 * gr)[:, None]
        dust = 0.35 + 0.2 * samp(N1, u[s] * 8, v[s] * 8)
        alb[s] = c * (1 - dust[:, None]) + dust[:, None] * np.array([0.44, 0.43, 0.40], f32)
    s = mat == METAL
    if s.any():
        rust = sstep(0.55, 0.75, samp(N3, u[s] * 25 + seed[s], v[s] * 25))
        c = np.array([0.21, 0.25, 0.23], f32)[None, :] * (1 - rust[:, None]) + rust[:, None] * np.array([0.32, 0.20, 0.12], f32)
        alb[s] = c * (0.85 + 0.3 * samp(N1, u[s] * 12, v[s] * 12))[:, None]
    s = mat == CHAIRW
    if s.any():
        gr = samp(N2, u[s] * 2 + seed[s], v[s] * 35)
        c = np.array([0.40, 0.29, 0.19], f32) * (0.75 + 0.4 * gr)[:, None]
        alb[s] = c * 0.65 + 0.35 * np.array([0.45, 0.44, 0.41], f32)

    s = mat == PAGE
    if s.any():
        alb[s] = page_albedo(u[s], v[s], seed[s], lod[s], time)
    s = mat == EDGE
    if s.any():
        alb[s] = np.array([0.72, 0.68, 0.58], f32) * (0.85 + 0.25 * samp(N3, u[s] * 300, v[s] * 900))[:, None]
    s = mat == COVER
    if s.any():
        cols = np.zeros((s.sum(), 3), f32)
        for ob in OBJECTS:
            if ob.get("color") is not None:
                cols[seed[s] == ob["seed"]] = ob["color"]
        wear = 0.8 + 0.35 * samp(N1, u[s] * 30 + seed[s], v[s] * 30)
        alb[s] = cols * wear[:, None] * 0.8 + 0.2 * np.array([0.42, 0.41, 0.38], f32)
    s = mat == PAPER
    if s.any():
        uu, vv, sd = u[s], v[s], seed[s]
        c = np.array([0.76, 0.74, 0.68], f32) * (0.85 + 0.2 * samp(N1, uu * 20 + sd, vv * 20))[:, None]
        lined = (np.mod(vv + 0.15, 0.009) < 0.0011) & (hash3(sd, 4, 4) > 0.4) & (lod[s] > 0.2)
        c[lined] *= 0.8
        dust = 0.25 + 0.25 * samp(N2, uu * 5 + sd, vv * 5)
        alb[s] = c * (1 - dust[:, None]) + dust[:, None] * np.array([0.45, 0.44, 0.40], f32)
    s = mat == PLANT
    if s.any():
        alb[s] = np.array([0.20, 0.28, 0.13], f32) * (0.7 + 0.5 * samp(N3, u[s] * 200 + seed[s], v[s] * 60))[:, None]
    return alb, emit


def page_albedo(s, w, seed, lod, time):
    a = np.abs(s)
    paper = np.array([0.80, 0.77, 0.67], f32)[None, :] * (0.9 + 0.12 * samp(N1, s * 40 + seed, w * 40))[:, None]
    fox = sstep(0.74, 0.85, samp(N3, s * 260 + seed, w * 260))
    paper = paper * (1 - 0.25 * fox[:, None]) + 0.25 * fox[:, None] * np.array([0.55, 0.42, 0.28], f32)
    edge = np.minimum(0.205 - a, 0.14 - np.abs(w))
    paper *= (0.78 + 0.22 * sstep(0.0, 0.012, edge))[:, None]
    paper *= (0.68 + 0.32 * sstep(0.0, 0.022, a))[:, None]
    text = (a > 0.026) & (a < 0.19) & (np.abs(w) < 0.125)
    row = np.floor((w + 0.125) / 0.0068)
    fw = (w + 0.125) / 0.0068 - row
    line_end = 0.19 - 0.12 * (hash3(row, seed, 2) < 0.1) * hash3(row, seed, 3)
    words = samp(N3, a * 350 + row * 17 + seed, row * 31) > 0.36
    glyph = samp(N2, a * 2400 + seed, w * 2400 + row * 3) > 0.42
    ink = text & (fw > 0.22) & (fw < 0.72) & words & glyph & (a < line_end)
    pic = (s < 0) & (a > 0.06) & (a < 0.17) & (w > 0.02) & (w < 0.115) & (seed == HERO_SEED + 9)
    ink &= ~pic
    pic_frame = pic & ((a < 0.063) | (a > 0.167) | (w < 0.023) | (w > 0.112))
    pic_tone = 0.45 + 0.4 * sstep(0.45, 0.6, samp(N1, s * 45, w * 45))
    c = paper.copy()
    k = lod[:, None]
    ink_col = np.array([0.20, 0.19, 0.18], f32)
    c[ink] = c[ink] * (1 - 0.7 * k[ink]) + 0.7 * k[ink] * ink_col
    c[text & ~ink] = c[text & ~ink] * (1 - 0.12 * (1 - k[text & ~ink]))
    c[pic] = paper[pic] * pic_tone[pic][:, None]
    c[pic_frame] = ink_col
    if seed.size and np.any(seed == HERO_SEED + 1):
        under = (seed == HERO_SEED + 1)
        c[under] *= 1 - 0.45 * np.sin(page_angle(time) - np.radians(0.4))
    return c * 0.92 + 0.04


# ---------------------------------------------------------------- lighting
WIN_C = [np.array([X0, 0.5 * (WY0 + WY1), 0.5 * (z0 + z1)], f32) for z0, z1 in WINDOWS]
WIN_A = [(z1 - z0) * (WY1 - WY0) for z0, z1 in WINDOWS]


def irradiance(P, N):
    E = 0.20 + 0.06 * N[1]
    for C, A in zip(WIN_C, WIN_A):
        L = [C[k] - P[k] for k in range(3)]
        d2 = L[0] ** 2 + L[1] ** 2 + L[2] ** 2
        d = np.sqrt(d2)
        cos_s = np.maximum(0, (N[0] * L[0] + N[1] * L[1] + N[2] * L[2]) / d)
        cos_w = np.maximum(0, -L[0] / d)
        E = E + 0.85 * cos_s * cos_w * A / (np.pi * d2 + A)
    return E


def floor_shadow(P):
    """1 = lit, 0 = shadowed, for floor points, by the big furniture panels."""
    lit = np.ones(P[0].shape, f32)
    Dl = -LIGHT
    for ob in SHADOW_CASTERS:
        c = ob["C"]
        reach = np.linalg.norm(ob["he"]) + c[1] / -LIGHT[1] * np.linalg.norm(LIGHT[[0, 2]]) + 0.1
        foot = c[[0, 2]] + LIGHT[[0, 2]] * (c[1] / -LIGHT[1])
        cand = np.nonzero((np.abs(P[0] - foot[0]) < reach) & (np.abs(P[2] - foot[1]) < reach))[0]
        if not len(cand):
            continue
        R, he = ob["R"], ob["he"]
        Ol = [sum((P[j][cand] - c[j]) * R[j, k] for j in range(3)) for k in range(3)]
        Dk = [Dl @ R[:, k] for k in range(3)]
        tmin = np.full(len(cand), -np.inf, f32)
        tmax = np.full(len(cand), np.inf, f32)
        for k in range(3):
            if abs(Dk[k]) < 1e-9:
                inside = np.abs(Ol[k]) <= he[k]
                tmax = np.where(inside, tmax, -np.inf)
                continue
            t1 = (-he[k] - Ol[k]) / Dk[k]
            t2 = (he[k] - Ol[k]) / Dk[k]
            tmin = np.maximum(tmin, np.minimum(t1, t2))
            tmax = np.minimum(tmax, np.maximum(t1, t2))
        hit = (tmax >= np.maximum(tmin, 0)) & (tmax > 0)
        lit[cand[hit]] = 0
    return lit


# ---------------------------------------------------------------- frame
def render(time):
    O = cam_pos(time).astype(f32)
    g = GBuf()
    room(g, O)
    for ob in OBJECTS:
        (hit_obb if ob["kind"] == "obb" else hit_quad)(g, ob, O)
    th = page_angle(time)
    lift_dir = np.cos(th) * -HERO_A + np.sin(th) * Y_AX
    hinge = HERO_C - HERO_A * 0.012 + Y_AX * 0.0163
    lq = quad(hinge, lift_dir, HERO_B, (0, 0.193), (-0.14, 0.14), PAGE, HERO_SEED + 9, uv=(-1, -0.012, 1, 0), store=False)
    hit_quad(g, lq, O)
    hr = RIGHT * np.array([1, 0, 1])
    hr /= np.linalg.norm(hr)
    for k, (x, z, h) in enumerate(TUFTS):
        base = np.array([x, 0.0, z])
        q = quad(base, hr, Y_AX, (-0.6 * h, 0.6 * h), (0, h), PLANT, 500 + k, store=False)
        fn = tuft_alpha(500 + k, 0.6 * h, h)
        hit_quad(g, q, O, alpha_fn=lambda uu, vv, fn=fn: fn(uu, vv))

    t = g.t.ravel()
    idx = np.arange(t.size)
    P = (O[0] + t * DX.ravel(), O[1] + t * DY.ravel(), O[2] + t * DZ.ravel())
    plant = g.mat == PLANT                      # thin leaves: light them like they face the sky
    g.nx[plant], g.ny[plant], g.nz[plant] = 0, 1, 0
    N = (g.nx.ravel(), g.ny.ravel(), g.nz.ravel())
    alb, emit = shade_albedo(g, idx, O, t, time)
    E = irradiance(P, N)
    ndl = -(N[0] * LIGHT[0] + N[1] * LIGHT[1] + N[2] * LIGHT[2])
    sun = np.zeros(t.size, f32)
    lit = np.nonzero(ndl > 0.01)[0]
    sun[lit] = shaft((P[0][lit], P[1][lit], P[2][lit])) * ndl[lit]
    fl = np.nonzero((g.mat.ravel() == FLOOR) & (sun > 0.01))[0]
    if len(fl):
        sun[fl] *= floor_shadow((P[0][fl], P[1][fl], P[2][fl]))
    col = alb * (E + 0.85 * sun)[:, None] * np.array([1.06, 1.08, 1.08], f32) + emit
    img = col.reshape(RH, RW, 3).reshape(H, SS, W, SS, 3).mean((1, 3))
    depth = g.t.reshape(H, SS, W, SS).min((1, 3))

    # haze with daylight beams, evaluated at quarter resolution
    q = 2
    tq = depth[::q, ::q]
    Dq = (DX[::SS * q, ::SS * q], DY[::SS * q, ::SS * q], DZ[::SS * q, ::SS * q])
    sigma, nsm = 0.035, 12
    tm = np.minimum(tq, 10.0)
    scat = np.zeros(tq.shape, f32)
    for i in range(nsm):
        ti = (i + 0.5) / nsm * tm
        Q = (O[0] + ti * Dq[0], O[1] + ti * Dq[1], O[2] + ti * Dq[2])
        beam = shaft(tuple(a.ravel() for a in Q)).reshape(tq.shape)
        inside = (Q[1] > 0) & (Q[0] > X0)
        scat += np.exp(-sigma * ti) * sigma * (tm / nsm) * (0.40 + 2.6 * beam * inside)
    scat = ndimage.zoom(ndimage.gaussian_filter(scat, 1.0), q, order=1)[:H, :W]
    trans = np.exp(-sigma * np.minimum(depth, 10.0))
    img = img * trans[..., None] + scat[..., None] * np.array([0.80, 0.83, 0.80], f32)

    # depth of field focused on the book
    fd = np.linalg.norm(HERO_C + Y_AX * 0.01 - O) * 1000
    d = np.maximum(depth, 0.05) * 1000
    coc = (FOCAL_MM ** 2 / FSTOP) * np.abs(d - fd) / (d * (fd - FOCAL_MM)) / 36.0 * W
    sig = np.clip(coc / 2.4, 0, 14)
    levels = [0, 1.0, 2.0, 3.5, 5.5, 8.0, 11.0, 14.0]
    stack = []
    for sl in levels:
        if sl == 0:
            stack.append(img)
            continue
        wgt = (sig >= 0.6 * sl).astype(f32)
        num, den = img * wgt[..., None], wgt
        if sl >= 4:
            num = num.reshape(H // 2, 2, W // 2, 2, 3).mean((1, 3))
            den = den.reshape(H // 2, 2, W // 2, 2).mean((1, 3))
            num = ndimage.gaussian_filter(num, (sl / 2, sl / 2, 0), truncate=3.0)
            den = ndimage.gaussian_filter(den, sl / 2, truncate=3.0)
            num = ndimage.zoom(num, (2, 2, 1), order=1)
            den = ndimage.zoom(den, 2, order=1)
        else:
            num = ndimage.gaussian_filter(num, (sl, sl, 0), truncate=3.0)
            den = ndimage.gaussian_filter(den, sl, truncate=3.0)
        stack.append(np.where(den[..., None] > 0.05, num / np.maximum(den, 1e-4)[..., None], stack[-1]))
    # piecewise-linear blend between neighbouring blur levels
    lv = np.array(levels, f32)
    k = np.clip(np.searchsorted(lv, sig) - 1, 0, len(lv) - 2)
    frac = np.clip((sig - lv[k]) / (lv[k + 1] - lv[k]), 0, 1)
    out = np.zeros_like(img)
    for i in range(len(lv) - 1):
        m = (k == i)[..., None]
        out += np.where(m, stack[i] * (1 - frac[..., None]) + stack[i + 1] * frac[..., None], 0)
    img = out

    img = dust_motes(img, O, time, fd)
    return post(img, time)


MOTES = np.random.default_rng(77).random((1400, 6))


def dust_motes(img, O, time, fd):
    p = np.stack([X0 + 0.2 + MOTES[:, 0] * 5.6, 0.03 + MOTES[:, 1] * 2.8, 0.25 + MOTES[:, 2] * 7.0], 1)
    ph = MOTES[:, 3:] * 2 * np.pi
    p = p + np.stack([0.012 * time + 0.02 * np.sin(0.7 * time + ph[:, 0]),
                      0.004 * time + 0.015 * np.sin(0.5 * time + ph[:, 1]),
                      0.006 * time + 0.02 * np.sin(0.6 * time + ph[:, 2])], 1)
    v = p - O
    zc = v @ FWD
    ok = zc > 0.12
    p, v, zc = p[ok], v[ok], zc[ok]
    xs = W / 2 + (v @ RIGHT) / zc * F / SS
    ys = H / 2 - (v @ UP) / zc * F / SS
    beam = shaft((p[:, 0], p[:, 1], p[:, 2]))
    bright = 0.03 + 0.85 * beam
    d = zc * 1000
    coc = (FOCAL_MM ** 2 / FSTOP) * np.abs(d - fd) / (d * (fd - FOCAL_MM)) / 36.0 * W
    sig = np.clip(coc / 2.4, 0.6, 16)
    out = img.copy()
    for x, y, s, b in zip(xs, ys, sig, bright):
        r = int(3 * s) + 2
        x0, x1, y0, y1 = int(x) - r, int(x) + r + 1, int(y) - r, int(y) + r + 1
        if x1 <= 0 or y1 <= 0 or x0 >= W or y0 >= H or b < 0.05:
            continue
        xx = np.arange(max(x0, 0), min(x1, W))
        yy = np.arange(max(y0, 0), min(y1, H))
        k = np.exp(-(((xx[None, :] - x) ** 2 + (yy[:, None] - y) ** 2) / (2 * s * s)))
        amp = b * 0.55 / (1 + s * s / 2.0)
        out[yy[0]:yy[-1] + 1, xx[0]:xx[-1] + 1] += (amp * k)[..., None] * np.array([0.95, 0.97, 0.93], f32)
    return out


def post(c, time):
    fi = int(round(time * FPS))
    bright = np.maximum(c - 0.7, 0)
    c = c + 0.30 * ndimage.gaussian_filter(bright, (16, 16, 0))
    lum = (0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2])[..., None]
    c = lum + 0.62 * (c - lum)
    c = c * np.array([0.955, 1.0, 0.985], f32)
    shadow = (1 - np.clip(lum, 0, 1)) ** 3
    c = c + shadow * np.array([-0.012, 0.004, 0.010], f32)
    c = np.clip(c, 0, 1)
    c = 0.72 * c + 0.28 * c * c * (3 - 2 * c)
    c = 0.035 + 0.94 * c
    yy, xx = np.mgrid[0:H, 0:W]
    r2 = ((xx - W / 2) / (W / 2)) ** 2 * 0.8 + ((yy - H / 2) / (H / 2)) ** 2 * 0.6
    c = c * 0.95 * (1 - 0.24 * r2)[..., None]
    c = ndimage.gaussian_filter(c, (0.45, 0.45, 0))
    r = np.random.default_rng(2000 + fi)
    grain = ndimage.gaussian_filter(r.standard_normal((H, W)).astype(f32), 0.65)
    grain = grain / grain.std()
    lum = 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
    amp = 0.020 * (0.55 + 1.6 * lum * (1 - lum))
    chroma = ndimage.gaussian_filter(r.standard_normal((H, W, 3)).astype(f32), (0.8, 0.8, 0)) * 0.004
    c = c + (grain * amp)[..., None] + chroma
    return (np.clip(c, 0, 1) * 255 + 0.5).astype(np.uint8)


if __name__ == "__main__":
    out, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    for fi in range(a, b):
        Image.fromarray(render(fi / FPS)).save(f"{out}/f_{fi:04d}.png", compress_level=1)
        print("frame", fi, flush=True)
