import sys, pickle, subprocess
import engine as E
from engine import F, SANSB, SANS, W, H
from PIL import Image, ImageDraw
FPS = 30
f_hin = F(SANSB, 33)
f_en  = F(SANS, 29)
def blend(img, box, color, alpha, radius=10):
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0)); ImageDraw.Draw(ov).rounded_rectangle(box, radius=radius, fill=color + (int(alpha),)); img.alpha_composite(ov)
def draw_block(img, lines, font, lh, bottom, fill):
    if not lines: return bottom
    tw = max(font.getlength(l) for l in lines) + 48; th = len(lines) * lh + 16
    x0 = (W - tw) / 2; y0 = bottom - th
    blend(img, [x0, y0, x0 + tw, y0 + th], (0, 0, 0), 185)
    d = ImageDraw.Draw(img)
    for i, l in enumerate(lines): d.text((W / 2, y0 + 8 + i * lh + lh / 2), l, font=font, fill=fill, anchor="mm")
    return y0
def active(cues, T):
    for a, b, t in cues:
        if a <= T < b: return t
    return None
def frame_bytes(st, ht, et, cache):
    base = E.render_frame(st, None, cache).convert("RGBA")
    bottom = draw_block(base, ht.split("\n") if ht else [], f_hin, 42, 1002, (255, 255, 255))
    draw_block(base, et.split("\n") if et else [], f_en, 36, bottom - 8, (255, 232, 150))
    return base.convert("RGB")
def run(idx, f0, f1, ops, hin, en):
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080", "-r", str(FPS),
           "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", f"chunks_dual/c{idx:02d}.mp4"]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE); cache = {}; last = None; frame = None
    for f in range(f0, f1):
        T = f / FPS; st = E.state_at(ops, T); ht = active(hin, T); et = active(en, T)
        key = (repr(st), ht, et)
        if key != last: frame = frame_bytes(st, ht, et, cache).tobytes(); last = key
        p.stdin.write(frame)
    p.stdin.close(); p.wait()
if __name__ == "__main__":
    d = pickle.load(open("tl.pkl", "rb")); de = pickle.load(open("tl_en.pkl", "rb"))
    i, n = int(sys.argv[1]), int(sys.argv[2]); N = int(d["total"] * FPS)
    run(i, N * i // n, N * (i + 1) // n, d["ops"], d["subs"], de["subs"])
