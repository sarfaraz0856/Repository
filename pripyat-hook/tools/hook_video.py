"""Re-time the user's hook edit (export.mp4) to the voice timeline from hook_audio.py and finish it:
0.5 s fade from black, clips trimmed or slowed (frame-blended, never below 50 %) to their scenes,
the scene 05 cut to the dosimeter in the "..." pause, a flash and shake on the reactor blast, the
CHERNOBYL title card, one light cold grade + gentle vignette + grain, 1080p25 at 14 Mbps.

Usage: hook_video.py EXPORT.mp4 TIMELINE.json FONT.ttf OUT_DIR
Writes OUT_DIR/HOOK_FINAL_video_only.mp4 and OUT_DIR/title.png.
"""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FPS = 25
# shot boundaries in the user's export (seconds; found with ffmpeg scene detection)
SRC = {"01": (0.0, 7.0), "02": (7.0, 12.0), "03": (12.0, 16.04), "04": (16.04, 22.0),
       "05": (22.0, 24.0), "06": (24.0, 31.0), "07": (31.0, 37.08), "08": (37.08, 45.52)}


def title_png(font_path, path):
    W, H = 1920, 1080
    font = ImageFont.truetype(font_path, 168)
    text, track = "CHERNOBYL", 26
    widths = [font.getbbox(ch)[2] - font.getbbox(ch)[0] for ch in text]
    total = sum(widths) + track * (len(text) - 1)
    layer = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(layer)
    x = (W - total) / 2
    top = font.getbbox("C")[1]
    hgt = font.getbbox("C")[3] - top
    for ch, w in zip(text, widths):
        d.text((x - font.getbbox(ch)[0], (H - hgt) / 2 - top), ch, font=font, fill=255)
        x += w + track
    glow = layer.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.45))
    alpha = Image.fromarray(np.maximum(np.asarray(layer), np.asarray(glow)).astype(np.uint8))
    img = Image.new("RGBA", (W, H), (236, 238, 234, 0))
    img.putalpha(alpha)
    img.save(path)


def segments(tl):
    sc, ev = tl["scenes"], tl["events"]
    bounds = {"01": (0.0, sc["02"]), "02": (sc["02"], sc["03"]), "03": (sc["03"], sc["04"]),
              "04": (sc["04"], ev["cut05"]), "05": (ev["cut05"], sc["06"]), "06": (sc["06"], sc["07"]),
              "07": (sc["07"], sc["08"]), "08": (sc["08"], sc["09"])}
    out = []
    for k, (a, b) in bounds.items():
        s0, s1 = SRC[k]
        s1 -= 1 / FPS                                   # never touch the first frame of the next shot
        dur = round(b - a, 3)
        speed = min(1.0, (s1 - s0) / dur)
        assert speed >= 0.5, (k, speed)                 # Notes: never below 50 %
        out.append(dict(key=k, abs=(a, b), src=(s0, s0 + dur * speed), dur=dur, speed=round(speed, 3)))
    return out


def main(export, tl_path, font, outdir):
    tl = json.load(open(tl_path))
    segs = segments(tl)
    title_at, end = tl["scenes"]["09"], tl["end"]
    tdur = round(end - title_at, 3)
    boom_rel = tl["events"]["boom"] - tl["scenes"]["06"]
    title_png(font, f"{outdir}/title.png")

    parts = [f"[0:v]split={len(segs)}" + "".join(f"[v{i}]" for i in range(len(segs)))]
    for i, s in enumerate(segs):
        a, b = s["src"]
        f = f"[v{i}]trim=start={a:.3f}:end={b + 0.2:.3f},setpts=PTS-STARTPTS"
        if s["speed"] < 0.999:
            f += f",setpts=PTS/{s['speed']:.4f},framerate=fps={FPS}:interp_start=0:interp_end=255:scene=100"
        f += f",fps={FPS},trim=duration={s['dur']:.3f},setpts=PTS-STARTPTS"
        if s["key"] == "06":                          # the blast: two-step flash and a decaying shake
            T = boom_rel
            sh = f"gte(t,{T:.3f})*exp(-(t-{T:.3f})*5)"
            f += (f",crop=1872:1053:x='24+18*sin(t*63)*{sh}':y='13+12*cos(t*71)*{sh}',scale=1920:1080"
                  f",eq=brightness=0.30:enable='between(t,{T:.3f},{T + 0.06:.3f})'"
                  f",eq=brightness=0.14:enable='between(t,{T + 0.06:.3f},{T + 0.18:.3f})'")
        f += f",format=yuv420p,setsar=1[s{i}]"
        parts.append(f)
    parts.append(f"color=c=black:s=1920x1080:r={FPS}:d={tdur:.3f},format=yuva420p[bg]")
    parts.append(f"[1:v]format=rgba,fade=t=in:st=0:d=0.15:alpha=1,fade=t=out:st={tdur - 0.6:.3f}:d=0.5:alpha=1[tt]")
    parts.append(f"[bg][tt]overlay=0:0:shortest=1,trim=duration={tdur:.3f},format=yuv420p,setsar=1[st]")
    parts.append("".join(f"[s{i}]" for i in range(len(segs))) + f"[st]concat=n={len(segs) + 1}:v=1:a=0,"
                 "eq=saturation=0.86:contrast=1.03,colorbalance=rs=-0.02:bs=0.02:rm=-0.015:bm=0.01,"
                 "vignette=angle=PI/6,noise=c0s=5:c0f=t,fade=t=in:st=0:d=0.5,format=yuv420p[out]")
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", export,
           "-loop", "1", "-framerate", str(FPS), "-t", f"{tdur:.3f}", "-i", f"{outdir}/title.png",
           "-filter_complex", ";".join(parts), "-map", "[out]", "-an", "-r", str(FPS),
           "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-b:v", "14M", "-maxrate", "16M",
           "-bufsize", "16M", "-g", "50", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
           "-t", f"{end:.3f}", f"{outdir}/HOOK_FINAL_video_only.mp4"]
    subprocess.run(cmd, check=True)
    json.dump(segs, open(f"{outdir}/segments.json", "w"), indent=1)
    for s in segs:
        print(s)


if __name__ == "__main__":
    main(*sys.argv[1:5])
