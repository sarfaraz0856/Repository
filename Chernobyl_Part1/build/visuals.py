"""
Picture: source selection (clip > image > placeholder), colour look, Ken Burns,
crossfades, film grain, vignette, screen text (Pillow PNGs) and H.264 encode.

Frames are rendered in Python and piped to ffmpeg. The timeline is split into
contiguous chunks rendered in parallel, then joined in one final encode.
"""
import hashlib
import json
import math
import re
import subprocess
import urllib.request
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import get_context
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import config as C
from audio_utils import ffmpeg_bin, probe_duration, run

W, H, FPS = C.W, C.H, C.FPS
VIDEO_EXT = {".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"}
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp"}


# ------------------------------------------------------------------ sources ---
def _match(folder, sid, exts):
    """Files whose name contains the scene number as a separate number (e.g. 'scene10', 'S10_v2')."""
    num = sid[1:]
    if not folder.exists():
        return None
    hits = [p for p in sorted(folder.iterdir())
            if p.suffix.lower() in exts and num in re.findall(r"\d+", p.stem)]
    return hits[0] if hits else None


def find_sources(scenes):
    out = {}
    for sc in scenes:
        clip = _match(C.CLIPS, sc["id"], VIDEO_EXT)
        img = _match(C.IMAGES, sc["id"], IMAGE_EXT)
        if clip:
            out[sc["id"]] = dict(kind="clip", path=str(clip))
        elif img:
            out[sc["id"]] = dict(kind="image", path=str(img))
        else:
            out[sc["id"]] = dict(kind="placeholder", path=None)
    return out


# --------------------------------------------------------------------- font ---
def get_font(log=print):
    """Oswald from Google Fonts (downloaded once), else Arial Bold, else DejaVu."""
    C.FONTS.mkdir(parents=True, exist_ok=True)
    dst = C.FONTS / "Oswald-wght.ttf"
    if dst.exists() and dst.stat().st_size > 50000:
        return dst, "Oswald (Google Fonts)"
    for url in C.FONT_URLS:
        try:
            tmp = dst.with_suffix(".part")
            urllib.request.urlretrieve(url, tmp)
            if tmp.stat().st_size > 50000 and tmp.read_bytes()[:4] in (b"\x00\x01\x00\x00", b"OTTO", b"true"):
                tmp.replace(dst)
                return dst, "Oswald (Google Fonts)"
            tmp.unlink(missing_ok=True)
        except Exception as e:
            log(f"    font download failed from {url[:60]}...: {str(e)[:80]}")
    for f in C.FONT_FALLBACKS:
        if Path(f).exists():
            return Path(f), Path(f).name
    raise RuntimeError("No usable font found (Oswald download failed and Arial Bold is missing).")


def _font(path, size, weight=None):
    f = ImageFont.truetype(str(path), size)
    if weight:
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
    return f


# --------------------------------------------------------------- screen text ---
def _text_canvas(text, font, tracking):
    """White text + soft drop shadow on a transparent canvas.
    Returns (RGBA image, origin_x, baseline_y, advance width)."""
    ascent, descent = font.getmetrics()
    adv = [font.getlength(ch) for ch in text]
    width = sum(adv) + tracking * max(0, len(text) - 1)
    pad = 40
    cw, ch = int(math.ceil(width)) + 2 * pad, ascent + descent + 2 * pad
    mask = Image.new("L", (cw, ch), 0)
    d = ImageDraw.Draw(mask)
    x = pad
    for c, a in zip(text, adv):
        d.text((x, pad), c, fill=255, font=font)
        x += a + tracking
    shadow = Image.new("L", (cw, ch), 0)
    shadow.paste(mask, (3, 4))
    shadow = shadow.filter(ImageFilter.GaussianBlur(7))
    sh = np.asarray(shadow).astype(np.float32) / 255 * 0.62
    tx = np.asarray(mask).astype(np.float32) / 255 * C.TEXT_OPACITY
    alpha = tx + sh * (1 - tx)
    rgb = np.where(alpha[..., None] > 0, (255 * tx / np.maximum(alpha, 1e-6))[..., None], 0)
    rgba = np.dstack([np.repeat(rgb, 3, axis=2), alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA"), pad, pad + ascent, width + tracking, mask.getbbox()


def render_text_pngs(texts, font_path, out_dir):
    """Write every screen-text layer as a transparent PNG + a JSON layout file."""
    out_dir.mkdir(parents=True, exist_ok=True)
    layout = []
    left, bottom = C.TEXT_MARGIN, H - C.TEXT_MARGIN
    for t in texts:
        tf = _font(font_path, t["size"], 500)
        track = 3 if t["size"] < 60 else 10
        if "sub" not in t:
            img, ox, base, _, bb = _text_canvas(t["title"], tf, track)
            fn = out_dir / f"{t['name']}.png"
            img.save(fn)
            layout.append(dict(file=fn.name, x=left - bb[0], y=bottom - bb[3], t0=t["abs0"], t1=t["abs1"]))
            continue
        # title + sub line (with optional count-up of the first number)
        sf_ = _font(font_path, t["sub_size"], 400)
        full, ox, base, _, bbf = _text_canvas(t["sub"], sf_, 1)
        sub_y = bottom - bbf[3]
        sub_x = left - bbf[0]
        timg, tox, tbase, _, tbb = _text_canvas(t["title"], tf, track)
        title_y = (sub_y + bbf[1]) - 22 - tbb[3]
        fn = out_dir / f"{t['name']}_title.png"
        timg.save(fn)
        layout.append(dict(file=fn.name, x=left - tbb[0], y=title_y, t0=t["abs0"], t1=t["abs1"]))
        cnt = t.get("count")
        if not cnt:
            fn = out_dir / f"{t['name']}_sub.png"
            full.save(fn)
            layout.append(dict(file=fn.name, x=sub_x, y=sub_y, t0=t["abs0"], t1=t["abs1"]))
            continue
        num_final = f"{cnt['value']:,}"
        rest = t["sub"][len(num_final):]
        _, _, _, num_adv, _ = _text_canvas(num_final, sf_, 1)
        rimg, _, _, _, _ = _text_canvas(rest, sf_, 1)
        fn = out_dir / f"{t['name']}_rest.png"
        rimg.save(fn)
        layout.append(dict(file=fn.name, x=sub_x + int(round(num_adv)), y=sub_y, t0=t["abs0"], t1=t["abs1"]))
        frames = int(round(cnt["seconds"] * FPS))
        seq = []
        for k in range(frames + 1):
            e = 1 - (1 - min(1.0, k / frames)) ** 3                   # ease-out
            val = int(round(cnt["value"] * e / 10.0)) * 10
            nimg, _, _, _, _ = _text_canvas(f"{val:,}", sf_, 1)
            fn = out_dir / f"{t['name']}_num_{k:03d}.png"
            nimg.save(fn)
            seq.append(fn.name)
        layout.append(dict(seq=seq, x=sub_x, y=sub_y, t0=t["abs0"], t1=t["abs1"]))
    (out_dir / "layout.json").write_text(json.dumps(layout, indent=1), encoding="utf-8")
    return layout


# ---------------------------------------------------------------- colour look --
def _glow(a, amount, color):
    hl = np.clip(a - 0.55, 0, 1)
    h, w = a.shape[:2]
    small = Image.fromarray((hl * 255).astype(np.uint8)).resize((max(1, w // 4), max(1, h // 4)), Image.BILINEAR)
    small = small.filter(ImageFilter.GaussianBlur(4)).resize((w, h), Image.BILINEAR)
    return a + np.asarray(small).astype(np.float32) / 255 * amount * np.array(color, dtype=np.float32)


def grade(rgb_u8, look):
    """Apply the scene look to a uint8 RGB array; returns uint8."""
    a = rgb_u8.astype(np.float32) / 255.0
    if look == "warm":                         # nostalgic: warm, soft, saturation 0.85
        a *= np.array([1.05, 1.0, 0.89], dtype=np.float32)
        l = (a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32))[..., None]
        a = l + 0.85 * (a - l)
        a = 0.5 + (a - 0.5) * 0.92 + 0.02
        a = _glow(a, 0.35, (1.0, 0.85, 0.65))
    elif look == "neutral_cool":
        a *= np.array([0.97, 1.0, 1.04], dtype=np.float32)
        l = (a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32))[..., None]
        a = l + 0.9 * (a - l)
    elif look == "cold_dark":                  # cold, dark, saturation 0.6, bluish shadows
        a *= 0.85 * np.array([0.93, 0.98, 1.06], dtype=np.float32)
        l = (a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32))[..., None]
        a = l + 0.6 * (a - l)
        a += (1 - np.clip(l, 0, 1)) ** 2 * np.array([-0.004, 0.006, 0.03], dtype=np.float32)
        a = 0.4 + (a - 0.4) * 1.05
    return (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)


# -------------------------------------------------------------------- clips ---
def conform_clip(src, dur, out):
    """Scale/crop to 1920x1080 @30 fps, exactly `dur` seconds. Slow down if short
    (never below 0.65x), then hold the last frame. Returns a description."""
    clip_len = probe_duration(src)
    frames = int(round(dur * FPS))
    speed = 1.0 if clip_len >= dur else max(clip_len / dur, 0.65)
    slowed = clip_len / speed
    hold = max(0.0, dur - slowed)
    vf = (f"setpts=PTS/{speed:.5f},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
          f"crop={W}:{H},tpad=stop_mode=clone:stop_duration={hold + 1:.3f},format=yuv420p")
    run([ffmpeg_bin(), "-v", "error", "-y", "-i", src, "-an", "-vf", vf, "-frames:v", frames,
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", out])
    desc = f"clip {Path(src).name} ({clip_len:.1f} s)"
    if speed < 1:
        desc += f", slowed to {speed:.2f}x"
    if hold > 0.01:
        desc += f", last frame held {hold:.1f} s"
    return desc


class ClipReader:
    def __init__(self, path):
        self.path, self.proc, self.next, self.last = path, None, None, None

    def get(self, idx):
        if self.proc is None or idx != self.next:
            self.close()
            self.proc = subprocess.Popen([ffmpeg_bin(), "-v", "error", "-ss", f"{idx / FPS:.4f}", "-i", self.path,
                                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                                         stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            self.next = idx
        buf = self.proc.stdout.read(W * H * 3)
        self.next += 1
        if len(buf) == W * H * 3:
            self.last = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        return self.last if self.last is not None else np.zeros((H, W, 3), np.uint8)

    def close(self):
        if self.proc:
            self.proc.kill()
            self.proc.wait()
            self.proc = None


# ----------------------------------------------------------------- renderer ---
def _ease(p):
    p = min(1.0, max(0.0, p))
    return 0.7 * p + 0.3 * (0.5 - 0.5 * math.cos(math.pi * p))


def _smooth01(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


class Renderer:
    def __init__(self, plan):
        self.plan = plan
        self.scenes = plan["scenes"]
        self.total_frames = plan["total_frames"]
        self.src = {}
        for sc in self.scenes:
            if sc["kind"] == "clip":
                self.src[sc["id"]] = ClipReader(sc["render_path"])
            else:
                img = Image.open(sc["render_path"]).convert("RGB")
                k = max(W / img.width, H / img.height)
                if k < 1 / 1.25:                       # very large source: shrink once for speed/quality
                    f = (1 / 1.15) / k
                    img = img.resize((int(img.width * f), int(img.height * f)), Image.LANCZOS)
                self.src[sc["id"]] = Image.fromarray(grade(np.asarray(img), sc["look"]))
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / math.sqrt(2)
        self.vignette = (1 - 0.42 * np.clip((r - 0.3) / 0.7, 0, 1) ** 1.7)[..., None].astype(np.float32)
        rng = np.random.default_rng(1234)
        from scipy.ndimage import gaussian_filter
        self.grain = []
        for _ in range(8):
            g = gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.7)
            self.grain.append((g / g.std() * 4.0)[..., None])
        self.texts = []
        tdir = Path(plan["text_dir"])
        for L in plan["text_layout"]:
            files = L["seq"] if "seq" in L else [L["file"]]
            layers = []
            for fn in files:
                a = np.asarray(Image.open(tdir / fn).convert("RGBA")).astype(np.float32)
                layers.append((a[..., :3], a[..., 3:4] / 255.0))
            self.texts.append(dict(L, layers=layers))
        frng = np.random.default_rng(18)
        self.flicker = [(frng.uniform(0.3, 4.4), frng.uniform(0.06, 0.2), frng.uniform(0.06, 0.18)) for _ in range(6)]

    def _scene_rgb(self, sc, t, n):
        if sc["kind"] == "clip":
            idx = n - int(round(sc["ext_start"] * FPS))
            return grade(self.src[sc["id"]].get(max(0, idx)), sc["look"]).astype(np.float32)
        img = self.src[sc["id"]]
        m = C.MOTIONS[sc["motion"]]
        e = _ease((t - sc["ext_start"]) / (sc["ext_end"] - sc["ext_start"]))
        z = m["z"][0] + (m["z"][1] - m["z"][0]) * e
        u = m["u"][0] + (m["u"][1] - m["u"][0]) * e
        v = m["v"][0] + (m["v"][1] - m["v"][0]) * e
        k = max(W / img.width, H / img.height)
        ww, wh = W / (k * z), H / (k * z)
        x0, y0 = u * (img.width - ww), v * (img.height - wh)
        out = img.transform((W, H), Image.Transform.AFFINE, (ww / W, 0, x0, 0, wh / H, y0),
                            resample=Image.Resampling.BICUBIC)
        return np.asarray(out).astype(np.float32)

    def _brightness(self, t):
        b = _smooth01(t / C.FADE_IN) if t < C.FADE_IN else 1.0
        last = self.scenes[-1]
        if t >= last["start"]:
            rel = t - last["start"]
            for t0, d, depth in self.flicker:             # lamp flicker (small random dips)
                if t0 <= rel < t0 + d:
                    b *= 1 - depth * math.sin(math.pi * (rel - t0) / d)
            b *= 1 + 0.012 * math.sin(rel * 37.0) * math.sin(rel * 13.0)
            b *= 1 - _smooth01((rel - C.S18_BLACK_FROM) / (C.S18_BLACK_TO - C.S18_BLACK_FROM))
        return b

    def frame(self, n):
        t = n / FPS
        active = [sc for sc in self.scenes if sc["ext_start"] <= t < sc["ext_end"]]
        if not active:
            active = [self.scenes[-1]]
        img = self._scene_rgb(active[0], t, n)
        if len(active) > 1:
            nxt = active[1]
            a = _smooth01((t - nxt["ext_start"]) / (nxt["start"] - nxt["ext_start"]) / 2)
            img = img * (1 - a) + self._scene_rgb(nxt, t, n) * a
        b = self._brightness(t)
        if b <= 0.001:
            img = np.zeros((H, W, 3), np.float32)
        else:
            img = img * self.vignette * b + self.grain[n % 8] * min(1.0, b * 1.5)
        for L in self.texts:
            if not (L["t0"] <= t < L["t1"]):
                continue
            op = min(_smooth01((t - L["t0"]) / C.TEXT_FADE), _smooth01((L["t1"] - t) / C.TEXT_FADE))
            k = min(len(L["layers"]) - 1, int((t - L["t0"]) * FPS)) if len(L["layers"]) > 1 else 0
            rgb, al = L["layers"][k]
            x, y = L["x"], L["y"]
            h, w = al.shape[:2]
            ys, xs = max(0, y), max(0, x)
            ye, xe = min(H, y + h), min(W, x + w)
            if ye <= ys or xe <= xs:
                continue
            sl = (slice(ys, ye), slice(xs, xe))
            ll = (slice(ys - y, ye - y), slice(xs - x, xe - x))
            a = al[ll] * op
            img[sl] = img[sl] * (1 - a) + rgb[ll] * a
        return np.clip(img + 0.5, 0, 255).astype(np.uint8)

    def close(self):
        for s in self.src.values():
            if isinstance(s, ClipReader):
                s.close()


# ------------------------------------------------------------------- encode ---
def _render_chunk(job):
    plan_path, n0, n1, out = job
    plan = json.loads(Path(plan_path).read_text(encoding="utf-8"))
    R = Renderer(plan)
    ff = subprocess.Popen([ffmpeg_bin(), "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast",
                           "-crf", "10", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    for n in range(n0, n1):
        ff.stdin.write(R.frame(n).tobytes())
        if (n - n0) % 150 == 0:
            print(f"      chunk {Path(out).stem}: frame {n - n0}/{n1 - n0}", flush=True)
    ff.stdin.close()
    ff.wait()
    R.close()
    if ff.returncode != 0:
        raise RuntimeError(f"ffmpeg failed while encoding {out}")
    return out


def _fingerprint(plan):
    """Changes whenever the plan, a source picture, the text or the picture code changes."""
    h = hashlib.sha1(json.dumps(plan, sort_keys=True).encode())
    for sc in plan["scenes"]:
        p = Path(sc["src_file"])
        h.update(p.read_bytes() if p.suffix.lower() in IMAGE_EXT else f"{p.stat().st_size}-{p.stat().st_mtime}".encode())
    for f in sorted(Path(plan["text_dir"]).glob("*.png")):
        h.update(f.read_bytes())
    for f in ("visuals.py", "config.py", "placeholders.py"):
        h.update((C.BUILD / f).read_bytes())
    return h.hexdigest()


def render_video(plan, workers, log=print, force=False):
    """Render all frames into intermediate chunks; returns the concat list file.
    Re-uses the previous render when nothing that affects the picture has changed."""
    vdir = C.WORK / "video"
    vdir.mkdir(parents=True, exist_ok=True)
    plan_path = vdir / "plan.json"
    plan_path.write_text(json.dumps(plan, indent=1), encoding="utf-8")
    fp, fp_file, lst = _fingerprint(plan), vdir / "fingerprint.txt", vdir / "chunks.txt"
    if not force and fp_file.exists() and lst.exists() and fp_file.read_text() == fp:
        chunks = [Path(l.split("'")[1]) for l in lst.read_text(encoding="utf-8").splitlines() if l.strip()]
        if chunks and all(c.exists() for c in chunks):
            log("    picture unchanged since the last build - re-using the rendered frames (use --force to re-render)")
            return lst
    fp_file.unlink(missing_ok=True)
    N = plan["total_frames"]
    edges = np.linspace(0, N, workers + 1).astype(int)
    jobs = [(str(plan_path), int(a), int(b), str(vdir / f"chunk_{i:02d}.mp4"))
            for i, (a, b) in enumerate(zip(edges[:-1], edges[1:])) if b > a]
    log(f"    rendering {N} frames in {len(jobs)} parallel chunks ...")
    with ProcessPoolExecutor(max_workers=len(jobs), mp_context=get_context("spawn")) as ex:
        outs = list(ex.map(_render_chunk, jobs))
    lst.write_text("".join(f"file '{Path(o).as_posix()}'\n" for o in outs), encoding="utf-8")
    fp_file.write_text(fp)
    return lst


def render_stills(plan, times, out_dir):
    """Render single frames straight from the renderer (for quick checks)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    R = Renderer(plan)
    paths = []
    for t in times:
        p = out_dir / f"frame_{t:05.1f}s.jpg"
        Image.fromarray(R.frame(int(round(t * FPS)))).save(p, quality=92)
        paths.append(p)
    R.close()
    return paths


def final_encode(chunk_list, audio_wav, out, total, log=print):
    run([ffmpeg_bin(), "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", chunk_list, "-i", audio_wav,
         "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-preset", "slow", "-crf", str(C.VIDEO_CRF),
         "-maxrate", C.VIDEO_MAXRATE, "-bufsize", "16M", "-pix_fmt", "yuv420p", "-profile:v", "high",
         "-r", str(FPS), "-g", str(FPS * 2), "-c:a", "aac", "-b:a", C.AUDIO_BITRATE, "-ar", str(C.SR), "-ac", "2",
         "-t", f"{total:.3f}", "-movflags", "+faststart", out])
