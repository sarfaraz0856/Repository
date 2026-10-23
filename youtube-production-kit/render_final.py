#!/usr/bin/env python3
"""Fast single-pass render: 20 pre-rendered scene PNGs -> 1080p/30fps MP4 with
crossfade transitions, global fade in/out, and a clean silent audio track."""
import os, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__))
FRM  = os.path.join(ROOT, "video_build", "frames")

# durations per scene (sum = 720s = 12:00)
durs = [30, 23,22, 45, 42,18, 55,20, 30,30, 25,20, 60, 60, 60, 35,25, 45, 45, 30]
assert len(durs)==20 and sum(durs)==720, (len(durs), sum(durs))
TD = 0.6  # crossfade duration

inputs = []
for i in range(20):
    inputs += ["-loop","1","-framerate","30","-t",str(durs[i]),
               "-i", os.path.join(FRM, f"s{i:02d}.png")]

# normalize each input
fc = []
for i in range(20):
    fc.append(f"[{i}:v]scale=1920:1080,setsar=1,fps=30,format=yuv420p[c{i}]")

# xfade chain
prev = "c0"; running = durs[0]
for i in range(1,20):
    off = round(running - TD, 3)
    out = f"x{i}"
    fc.append(f"[{prev}][c{i}]xfade=transition=fade:duration={TD}:offset={off}[{out}]")
    prev = out
    running = running + durs[i] - TD

total = round(running, 3)   # 720 - 19*TD
# global fade in/out on the final stream
fc.append(f"[{prev}]fade=t=in:st=0:d=0.8,fade=t=out:st={round(total-0.8,3)}:d=0.8[v]")
filt = ";".join(fc)

out = os.path.join(ROOT, "YouTube-Channel-Tutorial-VIDEO-1080p.mp4")
cmd = ["ffmpeg","-y", *inputs,
       "-f","lavfi","-i","anullsrc=channel_layout=stereo:sample_rate=48000",
       "-filter_complex", filt,
       "-map","[v]","-map","20:a",
       "-c:v","libx264","-preset","veryfast","-crf","21","-pix_fmt","yuv420p","-r","30",
       "-c:a","aac","-b:a","128k","-shortest","-movflags","+faststart", out]
print(f"scenes=20 total={total}s (~{int(total//60)}:{int(total%60):02d})", flush=True)
subprocess.run(cmd, check=True)
sz = os.path.getsize(out)/1e6
print(f"DONE: {out} ({sz:.1f} MB)", flush=True)
