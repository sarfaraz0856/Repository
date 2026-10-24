"""Procedural placeholder for Scene 01: empty Soviet avenue, two rows of 16-storey panel
blocks, overgrown trees, wet cracked asphalt, thick fog, slow forward dolly (5 s, 30 fps).

Usage: render.py OUT_DIR FIRST_FRAME LAST_FRAME_EXCLUSIVE [--test]
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

W, H = 1920, 1080
SS = 2
RW, RH = W * SS, H * SS
F = (RW / 2) / (36 / 48)          # 24 mm lens on full frame: tan(hfov/2) = 18/24
CAM_Y = 1.6
FPS = 30
DOLLY = 0.6                         # m/s forward
FADE_IN = 0.5                       # s, from black

FOG = np.array([0.715, 0.740, 0.735], np.float32)
ZENITH = np.array([0.580, 0.610, 0.620], np.float32)
FOG_L = 70.0

FX, DEPTH, BX = 22.0, 12.0, 64.0
INF = np.float32(np.inf)
f32 = np.float32


# ---------------------------------------------------------------- noise helpers
TN = 512


def make_noise(beta, seed, band=None):
    r = np.random.default_rng(seed)
    spec = np.fft.fft2(r.standard_normal((TN, TN)))
    fx = np.fft.fftfreq(TN)[:, None]
    fy = np.fft.fftfreq(TN)[None, :]
    f = np.sqrt(fx ** 2 + fy ** 2)
    f[0, 0] = 1
    if band is None:
        spec /= f ** beta
    else:
        spec *= np.exp(-((f - band[0]) / band[1]) ** 2)
    spec[0, 0] = 0
    x = np.real(np.fft.ifft2(spec))
    x = (x - x.mean()) / x.std()
    return np.clip(0.5 + 0.18 * x, 0, 1).astype(f32)


N1 = make_noise(1.0, 11)
N2 = make_noise(1.0, 22)
N3 = make_noise(0.55, 33)
BAND = make_noise(0, 44, band=(0.035, 0.012))


def samp(T, u, v):
    u = np.asarray(u, f32)
    v = np.asarray(v, f32)
    iu = np.floor(u)
    iv = np.floor(v)
    fu = u - iu
    fv = v - iv
    iu = iu.astype(np.int32) & (TN - 1)
    iv = (iv.astype(np.int32) & (TN - 1)) * TN
    iu1 = (iu + 1) & (TN - 1)
    iv1 = (iv + TN) & (TN * TN - 1)
    T = T.ravel()
    a = T.take(iv + iu)
    b = T.take(iv + iu1)
    c = T.take(iv1 + iu)
    d = T.take(iv1 + iu1)
    return a + (b - a) * fu + (c - a + (a - b - c + d) * fu) * fv


def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def hash3(i, j, k):
    h = (np.asarray(i).astype(np.int64) * 73856093) ^ (np.asarray(j).astype(np.int64) * 19349663) ^ (np.int64(k) * 83492791)
    h = (h ^ (h >> 13)) * 1274126177
    h = h ^ (h >> 16)
    return ((h & 0xFFFF) / 65535.0).astype(f32)


# ---------------------------------------------------------------- scene layout
def make_blocks(seed, z, gaps, storey_choices, n=14):
    r = np.random.default_rng(seed)
    out = []
    for i in range(n):
        length = r.choice([48.0, 60.0, 72.0])
        storeys = r.choice(storey_choices)
        out.append((z, length, 3.6 + storeys * 2.8 + 1.0, seed * 100 + i))
        z += length + r.uniform(*gaps)
    return np.array(out, np.float32)


RIGHT = make_blocks(1, -35.0, (20, 30), [16, 16, 16, 9])
LEFT = make_blocks(2, 14.0, (20, 30), [16, 16, 9, 16])
RIGHT_BACK = make_blocks(3, -10.0, (8, 16), [16, 12, 9])
LEFT_BACK = make_blocks(4, 4.0, (8, 16), [9, 16, 12])

# (side, x of plane, seed, bushes_only)
TREE_ROWS = [(1, 15.2, 2, False), (1, 10.6, 1, False),
             (-1, 15.6, 4, False), (-1, 10.4, 3, False)]

# street lamps: (side, z, tilt per metre of height, arm droop)
LAMPS = []
for s, z0 in ((1, 19.0), (-1, 36.0)):
    for k in range(7):
        tilt = [0.0, 0.025, 0.0, -0.02, 0.04, 0.0, 0.015][(k + (s > 0)) % 7]
        droop = [0.0, 0.0, 0.18, 0.0, 0.0, 0.25, 0.0][(k * 3 + (s > 0)) % 7]
        LAMPS.append((s, z0 + 34.0 * k, tilt, droop))

WISPS = [24.0, 42.0, 63.0, 90.0, 125.0]


# ---------------------------------------------------------------- geometry
def facade_hits(adx, dy, oy, cz, blocks, X, with_end):
    n = len(blocks)
    z0, L, Hb, bid = (blocks[:, i] for i in range(4))
    t = (X / adx).astype(f32)
    y = oy + t * dy
    z = cz + t
    i = np.searchsorted(z0, z, side="right") - 1
    ic = np.clip(i, 0, n - 1)
    inside = (i >= 0) & (z < z0[ic] + L[ic]) & (y >= 0) & (y < Hb[ic])
    front = (np.where(inside, t, INF), (z - z0[ic]).astype(f32), y.astype(f32), bid[ic], Hb[ic])
    if not with_end:
        return front, None
    j = np.where(i < 0, 0, ic + 1)
    jc = np.clip(j, 0, n - 1)
    te = (z0[jc] - cz).astype(f32)
    xe = te * adx
    ye = oy + te * dy
    ok = (~inside) & (j < n) & (te > 0) & (xe >= X) & (xe <= X + DEPTH) & (ye >= 0) & (ye < Hb[jc])
    end = (np.where(ok, te, INF), (xe - X).astype(f32), ye.astype(f32), bid[jc], Hb[jc])
    return front, end


def opaque_hits(dx, dy, oy, cz, ground):
    N = dx.size
    t = np.full(N, INF, f32)
    kind = np.zeros(N, np.int8)          # 0 sky, 1 ground, 2 facade, 3 end wall, 4 back row
    U = np.zeros(N, f32)
    V = np.zeros(N, f32)
    B = np.zeros(N, np.float64)
    HB = np.zeros(N, f32)
    if ground:
        g = np.nonzero(dy < -1e-6)[0]
        t[g] = oy / -dy[g]
        kind[g] = 1
    for side, front_blocks, back_blocks in ((1, RIGHT, RIGHT_BACK), (-1, LEFT, LEFT_BACK)):
        idx = np.nonzero(dx * side > 1e-6)[0]
        adx = np.abs(dx[idx])
        dyi = dy[idx]
        fr, en = facade_hits(adx, dyi, oy, cz, front_blocks, FX, True)
        bk, _ = facade_hits(adx, dyi, oy, cz, back_blocks, BX, False)
        for (tt, uu, vv, bb, hh), k in ((fr, 2), (en, 3), (bk, 4)):
            upd = tt < t[idx]
            sel = idx[upd]
            t[sel] = tt[upd]
            kind[sel] = k
            U[sel] = uu[upd]
            V[sel] = vv[upd]
            B[sel] = bb[upd]
            HB[sel] = hh[upd]
    return t, kind, U, V, B, HB


# ---------------------------------------------------------------- materials
def facade_albedo(u, v, bid, hb, end_wall):
    tone = 0.43 + 0.10 * hash3(bid, 3, 1)
    base_h = 3.6
    vv = v - base_h
    pw = 3.0
    col = np.floor(u / pw)
    row = np.floor(vv / 2.8)
    fu = u / pw - col
    fv = vv / 2.8 - row
    a = tone + 0.06 * (hash3(col, row, bid) - 0.5)
    seam = (np.minimum(fu, 1 - fu) * pw < 0.035) | (np.minimum(fv, 1 - fv) * 2.8 < 0.035)
    a = np.where(seam, a * 0.72, a)
    tint = np.ones(u.shape + (3,), f32)
    if not end_wall:
        win = (fu > 0.2) & (fu < 0.74) & (fv > 0.30) & (fv < 0.80) & (vv > 0) & (v < hb - 1.4)
        inner = (fu > 0.228) & (fu < 0.712) & (fv > 0.335) & (fv < 0.765)
        hw = hash3(col, row, bid + 7)
        glass = np.where(hw < 0.42, 0.10 + 0.06 * fv,
                         np.where(hw < 0.72, 0.035, np.where(hw < 0.86, 0.30, 0.21)))
        # loggias on every 4th/5th column pair: lighter slab under the opening
        loggia = (np.mod(col, 5) >= 3) & (vv > 0) & (v < hb - 1.4)
        slab = loggia & (fv < 0.30) & (fv > 0.05)
        a = np.where(slab, a * 1.12, a)
        a = np.where(win, np.where(inner, glass, 0.29), a)
        # streaks under windows
        under = (fu > 0.24) & (fu < 0.70) & (fv < 0.30) & (vv > 0)
        a = np.where(under, a * (0.86 + 0.1 * samp(N3, u * 40, v * 2)), a)
        gf = v < base_h
        door = gf & (np.mod(u, 6.0) > 1.0) & (np.mod(u, 6.0) < 4.6) & (v > 0.4) & (v < 3.0)
        a = np.where(gf, a * 0.78, a)
        a = np.where(door, 0.05 + 0.04 * hash3(np.floor(u / 6.0), 9, bid), a)
        glassy = win & inner & (hw >= 0.72) & (hw < 0.86)
        tint[glassy] = (0.92, 1.0, 1.06)
    else:
        a = a * 0.92
    a = np.where(v > hb - 1.3, a * 0.86, a)
    st = samp(N2, u * 10, v * 0.6)
    a = a * (1 - 0.30 * sstep(0.52, 0.80, st))
    a = a * (0.74 + 0.26 * sstep(0, 5, v))
    moss = sstep(3.0, 0.0, v) * sstep(0.45, 0.7, samp(N1, u * 20, v * 20))
    c = a[:, None] * tint
    c = c * (1 - 0.35 * moss[:, None]) + 0.35 * moss[:, None] * np.array([0.20, 0.24, 0.16], f32)
    return c


def sky_color(dx, dy, dn, cz):
    e = dy / dn
    c = FOG + (ZENITH - FOG) * sstep(0.0, 0.5, e)[:, None]
    safe = np.maximum(e, 0.02)
    cu = dx / dn / safe * 300 * 0.02
    cv = (1 / dn / safe * 300 + cz) * 0.02
    cl = (samp(N1, cu, cv) - 0.5) * 0.08 * sstep(0.03, 0.2, e)
    return c + cl[:, None]


def fog_mix(c, dist):
    f = (1 - np.exp(-(dist / FOG_L) ** 1.4)).astype(f32)
    return c + (FOG - c) * f[:, None]


def tree_layer(u, v, seed, bushes_only, time, dist):
    wind = 0.05 * np.sin(2 * np.pi * 0.35 * time + u * 0.4) * sstep(1, 6, v)
    uw = (u + wind) * 0.3                      # stretched along the row (seen at grazing angles)
    d1 = samp(N1, uw * 9 + seed * 131, v * 9)
    lod = np.clip(1 - dist / 70, 0.2, 1)
    d2 = samp(N3, uw * 28 + seed * 17, v * 28)
    lod2 = np.clip(1 - dist / 35, 0, 1)
    d3 = samp(N3, uw * 85 + seed * 7, v * 85)
    dens = d1 + (d2 - 0.5) * 0.7 * lod + (d3 - 0.5) * 0.45 * lod2
    bh = 1.1 * sstep(0.40, 0.68, samp(N1, u * 2.0 + 77 + seed * 5, seed * 19)) + 0.05
    bthr = 0.42 + 0.45 * np.clip(v / bh, 0, 1.5)
    alpha = sstep(bthr - 0.06, bthr + 0.04, dens + 0.05) * (v < bh * 1.4)
    if not bushes_only:
        nh = samp(N2, u * 1.2, seed * 37.0)
        h = 1.5 + 9.5 * sstep(0.34, 0.70, nh)
        has = h > 3.0
        bottom = 1.7 + 0.9 * samp(N2, u * 3, seed * 11 + 5)
        thr = 0.46 + 0.28 * sstep(h - 2.2, h, v) + 0.3 * (1 - sstep(bottom - 0.3, bottom + 0.7, v))
        canopy = sstep(thr - 0.08, thr + 0.05, dens) * (v < h) * has
        alpha = np.maximum(alpha, canopy)
        cell = np.floor(u / 3.7)
        tp = (cell + 0.2 + 0.6 * hash3(cell, seed, 5)) * 3.7
        trunk_h = bottom + 1.2
        trunk = (np.abs(u - tp) < 0.22) & (v < trunk_h) & has
        alpha = np.where(trunk, 1.0, alpha)
    else:
        trunk = np.zeros(u.shape, bool)
    shade = 0.62 + 0.38 * sstep(0.0, 6.0, v)
    leaf = np.array([0.20, 0.25, 0.17], f32)[None, :] * ((0.62 + 0.45 * d2 + 0.45 * (d3 - 0.5) * lod2) * shade)[:, None]
    leaf = np.where(trunk[:, None], np.array([0.16, 0.155, 0.145], f32), leaf)
    return alpha.astype(f32), leaf


def composite_trees(col, t_near, dx, dy, dn, oy, cz, time):
    for side, xt, seed, bushes in TREE_ROWS:
        idx = np.nonzero(dx * side > 1e-6)[0]
        tt = (xt / np.abs(dx[idx])).astype(f32)
        v = oy + tt * dy[idx]
        lim = 2.5 if bushes else 12.0
        ok = (tt < t_near[idx]) & (v > 0) & (v < lim)
        idx, tt, v = idx[ok], tt[ok], v[ok]
        dist = tt * dn[idx]
        a, c = tree_layer(cz + tt, v, seed, bushes, time, dist)
        c = fog_mix(c, dist)
        col[idx] = col[idx] + (c - col[idx]) * a[:, None]
        solid = a > 0.5
        t_near[idx[solid]] = tt[solid]
    return col, t_near


def opaque_colors(col, kind, U, V, B, HB, dx, dy, dn, cz):
    for k in (2, 3, 4):
        s = np.nonzero(kind == k)[0]
        if len(s):
            col[s] = facade_albedo(U[s], V[s], B[s] + (500 if k == 4 else 0), HB[s], k == 3) * (0.97 if k != 3 else 0.9)
    s = np.nonzero(kind == 0)[0]
    col[s] = sky_color(dx[s], dy[s], dn[s], cz)
    return col


def shade_no_ground(dx, dy, dn, oy, cz, time):
    t, kind, U, V, B, HB = opaque_hits(dx, dy, oy, cz, ground=False)
    col = np.zeros((dx.size, 3), f32)
    col = opaque_colors(col, kind, U, V, B, HB, dx, dy, dn, cz)
    hit = kind > 0
    col[hit] = fog_mix(col[hit], t[hit] * dn[hit])
    col, t = composite_trees(col, t, dx, dy, dn, oy, cz, time)
    return col


def ground_material(x, z, t):
    ax = np.abs(x)
    n_big = samp(N1, x * 4, z * 4)
    n_mid = samp(N2, x * 16, z * 16)
    w_fine = np.clip(1 - t / 18, 0, 1)
    n_fine = samp(N3, x * 90, z * 90)
    asph = 0.145 + 0.10 * (n_big - 0.5) + 0.06 * (n_mid - 0.5) + w_fine * 0.08 * (n_fine - 0.5)
    lod_c = np.clip(1 - t / 32, 0, 1)
    bnd = samp(BAND, x * 22, z * 22)
    crack = sstep(0.03, 0.0, np.abs(bnd - 0.5)) * sstep(0.42, 0.58, n_mid) * lod_c
    asph = asph * (1 - 0.6 * crack)
    c = np.stack([asph, asph, asph * 1.03], 1)
    weeds = np.clip(crack * 0.5 * sstep(0.5, 0.62, n_big) + sstep(5.4, 7.0, ax) * sstep(0.45, 0.62, n_mid), 0, 1)
    c = c + (np.array([0.17, 0.205, 0.13], f32) - c) * (weeds * 0.85)[:, None]
    # faded dashed centre line
    dash = (np.mod(z, 10.0) < 6.0).astype(f32)
    dash = dash + (0.6 - dash) * np.clip((t - 25) / 40, 0, 1)
    wear = sstep(0.32, 0.58, samp(N3, x * 60 + 9, z * 8))
    line = sstep(0.095, 0.07, ax) * dash * wear
    c = c + (np.array([0.60, 0.60, 0.57], f32) - c) * (line * 0.85)[:, None]
    # curb, sidewalk slabs, verge
    curb = (ax >= 7.0) & (ax < 7.25)
    walk = (ax >= 7.25) & (ax < 10.0)
    verge = ax >= 10.0
    slab = 0.33 + 0.07 * (n_mid - 0.5) + 0.05 * (samp(N3, np.floor(x / 1.5) * 7, np.floor(z / 1.5) * 7) - 0.5)
    seam = ((np.mod(z, 1.5) < 0.04) | (np.mod(x, 1.5) < 0.04)) & (t < 30)
    slab = np.where(seam, slab * 0.6, slab)
    c[curb] = (0.40 * (0.8 + 0.4 * n_mid[curb]))[:, None] * np.array([1, 1, 0.98], f32)
    c[walk] = slab[walk][:, None] * np.array([1, 1, 0.98], f32)
    grass_w = walk & (samp(N1, x * 6 + 31, z * 6) > 0.55)
    gcol = np.array([0.18, 0.215, 0.14], f32) * (0.75 + 0.5 * n_fine[:, None] * w_fine[:, None] + 0.25 * (1 - w_fine[:, None]))
    c[grass_w] = gcol[grass_w]
    dirt = np.array([0.24, 0.22, 0.19], f32)
    vmix = sstep(0.45, 0.6, n_big)[:, None]
    c[verge] = (gcol * (1 - vmix) + dirt * vmix)[verge]
    # wetness / reflectivity
    ruts = ((np.abs(ax - 1.9) < 0.6) | (np.abs(ax - 5.0) < 0.6)).astype(f32)
    pn = samp(N1, x * 9 + 100, z * 6) + 0.05 * ruts + 0.25 * (samp(N2, x * 2 + 50, z * 1.5) - 0.5)
    puddle = (sstep(0.70, 0.745, pn) * (ax < 6.8) * sstep(0.25, 0.45, ax)).astype(f32)
    return c, puddle, curb | walk, line


def render(time, test=False):
    cz = DOLLY * time
    px = (np.arange(RW, dtype=f32) + 0.5 - RW / 2) / F
    py = -(np.arange(RH, dtype=f32) + 0.5 - RH / 2) / F
    DX = np.broadcast_to(px[None, :], (RH, RW)).ravel()
    DY = np.broadcast_to(py[:, None], (RH, RW)).ravel()
    DN = np.sqrt(DX * DX + DY * DY + 1).astype(f32)
    N = DX.size

    t, kind, U, V, B, HB = opaque_hits(DX, DY, CAM_Y, cz, ground=True)
    col = np.zeros((N, 3), f32)
    col = opaque_colors(col, kind, U, V, B, HB, DX, DY, DN, cz)

    # ground with wet reflections
    g = np.nonzero(kind == 1)[0]
    tg = t[g]
    gx = tg * DX[g]
    gz = cz + tg
    alb, puddle, walk, line = ground_material(gx, gz, tg)
    cos_i = -DY[g] / DN[g]
    fres = (0.03 + 0.97 * (1 - cos_i) ** 5).astype(f32)
    ax = np.abs(gx)
    refl_w = np.where(ax < 7.0, (0.10 + 0.9 * fres) * (1 - 0.6 * line), np.where(walk, 0.5 * fres, 0.0)).astype(f32)
    refl_w = refl_w + (0.62 + 0.38 * fres - refl_w) * puddle
    rsel = refl_w > 0.01
    ri = g[rsel]
    rcol = shade_no_ground(DX[ri], -DY[ri], DN[ri], -CAM_Y, cz, time)
    sharp = np.zeros((N, 3), f32)
    mask = np.zeros(N, f32)
    sharp[ri] = rcol
    mask[ri] = 1
    s2 = sharp.reshape(RH, RW, 3)
    m2 = mask.reshape(RH, RW)
    rough = ndimage.uniform_filter1d(s2, 61, axis=0)
    rough = ndimage.uniform_filter1d(rough, 5, axis=1)
    mrough = ndimage.uniform_filter1d(ndimage.uniform_filter1d(m2, 61, axis=0), 5, axis=1)
    rough = (rough / np.maximum(mrough, 1e-4)[..., None]).reshape(N, 3)
    pr = puddle[rsel, None]
    refl = rough[ri] + (rcol * 0.88 - rough[ri]) * pr
    gcol = alb * (1 - 0.55 * puddle[:, None])
    gcol[rsel] = gcol[rsel] * (1 - refl_w[rsel, None]) + refl * refl_w[rsel, None]
    col[g] = gcol

    hit = kind > 0
    col[hit] = fog_mix(col[hit], t[hit] * DN[hit])
    col, t = composite_trees(col, t, DX, DY, DN, CAM_Y, cz, time)

    # street lamps (rendered in their screen-space column bands only)
    img = col.reshape(RH, RW, 3)
    tn2 = t.reshape(RH, RW)
    for side, zl, tilt, droop in LAMPS:
        te = zl - cz
        if te < 2:
            continue
        xs = np.array([5.9, 7.9]) * side
        c0, c1 = np.sort(xs / te * F + RW / 2).astype(int)
        r0 = int(RH / 2 - (9.2 - CAM_Y) / te * F)
        r1 = int(RH / 2 + CAM_Y / te * F) + 1
        c0, c1 = max(c0 - 2, 0), min(c1 + 2, RW)
        r0, r1 = max(r0 - 2, 0), min(r1, RH)
        if c0 >= c1 or r0 >= r1:
            continue
        x = (te * px[c0:c1])[None, :] * side
        y = CAM_Y + te * py[r0:r1][:, None]
        xp = 7.6 - tilt * y
        post = (np.abs(x - xp) < 0.085 + 0.03 * (y < 0.6)) & (y > 0) & (y < 8.6)
        top = 7.6 - tilt * 8.5
        ay = 8.45 - droop * np.clip((top - x) / 1.6, 0, 1)
        arm = (x < top) & (x > top - 1.6) & (np.abs(y - ay) < 0.075)
        hx = top - 1.6
        head = (x < hx + 0.1) & (x > hx - 0.45) & (y < ay + 0.05) & (y > ay - 0.2)
        m = (post | arm | head) & (te < tn2[r0:r1, c0:c1])
        if not m.any():
            continue
        dist = te * np.sqrt(1 + (px[c0:c1] ** 2)[None, :] + (py[r0:r1] ** 2)[:, None])
        rust = 0.85 + 0.3 * samp(N3, (x + zl) * 30, y * 30)
        lc = np.stack([0.23 * rust, 0.205 * rust, 0.185 * rust], -1)
        lc = fog_mix(lc.reshape(-1, 3), dist.ravel()).reshape(lc.shape)
        region = img[r0:r1, c0:c1]
        region[m] = lc[m]
        tn2[r0:r1, c0:c1] = np.where(m, te, tn2[r0:r1, c0:c1])

    # drifting fog banks at fixed depths (parallax as we dolly in)
    for zw in WISPS:
        tw = zw - cz
        x = tw * px[None, :] + 0.35 * time
        y = CAM_Y + tw * py[:, None]
        a = 0.26 * sstep(0.46, 0.74, samp(N1, (x * 0.6 + zw * 3) * 1.0, np.maximum(y, 0) * 2.2 + zw)) * np.exp(-np.maximum(y, 0) / 9.0)
        a = np.where(tn2 > tw, a, 0)
        img += (FOG - img) * a[..., None].astype(f32)

    frame = img.reshape(H, SS, W, SS, 3).mean((1, 3))
    return post_process(frame, time)


def post_process(c, time):
    fi = int(round(time * FPS))
    bright = np.maximum(c - 0.66, 0)
    c = c + 0.25 * ndimage.gaussian_filter(bright, (14, 14, 0))
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
    r = np.random.default_rng(1000 + fi)
    grain = ndimage.gaussian_filter(r.standard_normal((H, W)).astype(f32), 0.65)
    grain = grain / grain.std()
    lum = (0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2])
    amp = 0.020 * (0.55 + 1.6 * lum * (1 - lum))
    chroma = ndimage.gaussian_filter(r.standard_normal((H, W, 3)).astype(f32), (0.8, 0.8, 0)) * 0.004
    c = c + (grain * amp)[..., None] + chroma
    c = c * min(1.0, time / FADE_IN)
    return (np.clip(c, 0, 1) * 255 + 0.5).astype(np.uint8)


if __name__ == "__main__":
    out, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    for fi in range(a, b):
        im = render(fi / FPS)
        Image.fromarray(im).save(f"{out}/f_{fi:04d}.png", compress_level=1)
        print("frame", fi, flush=True)
    import resource
    print("maxrss MB", resource.getrusage(resource.RUSAGE_SELF).ru_maxrss // 1024)
