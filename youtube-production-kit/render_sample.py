#!/usr/bin/env python3
"""1-minute sample: montage of key scenes from the full video, with crossfades."""
import os, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__))
FRM = os.path.join(ROOT, "video_build", "frames")
# (scene index, seconds): intro, needs, create-channel, example, banner, visibility, recap
picks = [(0,12),(1,8),(6,10),(7,8),(12,8),(16,7),(19,11)]
TD = 0.6
assert round(sum(d for _,d in picks) - (len(picks)-1)*TD, 1) == 60.4
inputs, fc = [], []
for k,(i,d) in enumerate(picks):
    inputs += ["-loop","1","-framerate","30","-t",str(d),"-i",os.path.join(FRM,f"s{i:02d}.png")]
    fc.append(f"[{k}:v]scale=1920:1080,setsar=1,fps=30,format=yuv420p[c{k}]")
prev, run = "c0", picks[0][1]
for k in range(1,len(picks)):
    fc.append(f"[{prev}][c{k}]xfade=transition=fade:duration={TD}:offset={round(run-TD,3)}[x{k}]")
    prev, run = f"x{k}", run + picks[k][1] - TD
fc.append(f"[{prev}]fade=t=in:st=0:d=0.8,fade=t=out:st={round(run-0.8,3)}:d=0.8,trim=duration=60[v]")
out = os.path.join(ROOT, "SAMPLE-1min-YouTube-Channel-Tutorial.mp4")
subprocess.run(["ffmpeg","-y","-v","error",*inputs,
    "-f","lavfi","-i","anullsrc=channel_layout=stereo:sample_rate=48000",
    "-filter_complex",";".join(fc),"-map","[v]","-map",f"{len(picks)}:a",
    "-c:v","libx264","-preset","veryfast","-crf","21","-pix_fmt","yuv420p","-r","30",
    "-c:a","aac","-b:a","128k","-t","60","-movflags","+faststart",out], check=True)
print("DONE", out, round(os.path.getsize(out)/1e6,1), "MB")
