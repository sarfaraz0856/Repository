#!/bin/bash
# CX5A (the empty flat) has a bright window behind the chapter title and the first caption, so neither could be
# read. This lowers the shot's exposure a little and lays a soft dark band from the middle of the frame down,
# keeping the chunks' own H.264 4:4:4 format for the assembly's stream-copy concat. Run once before ext_chapter.sh 5.
set -e
cd "$(dirname "$0")/out/cx5"
python3 -c "
from PIL import Image; import numpy as np
h=1080; y=np.arange(h)/h; a=np.clip((y-0.36)/0.16,0,1)**1.2*0.62
im=np.zeros((h,1920,4),np.uint8); im[...,3]=(a[:,None]*255).astype(np.uint8); Image.fromarray(im).save('grad.png')"
for f in CX5A_000 CX5A_180; do
  [ -f ${f}_orig.mov ] || mv $f.mov ${f}_orig.mov
  ffmpeg -v error -y -i ${f}_orig.mov -i grad.png -filter_complex "[0:v]eq=gamma=0.85:brightness=-0.04[b];[b][1:v]overlay=0:0:format=auto,format=yuv444p" \
    -c:v libx264 -preset medium -crf 10 -pix_fmt yuv444p -r 24 -video_track_timescale 12288 $f.mov
done
