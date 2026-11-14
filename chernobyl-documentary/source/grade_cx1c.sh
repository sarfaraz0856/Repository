#!/bin/bash
# The core map in CX1C is almost pure white, so its caption could not be read. This darkens the lower third of
# its two chunks (a soft black gradient) before ext_chapter.sh 1, keeping the chunks' own H.264 4:4:4 format so the
# assembly's stream-copy concat accepts them. Run once, in the render folder, after CX1C is rendered.
set -e
cd "$(dirname "$0")/out/cx1"
python3 -c "
from PIL import Image; import numpy as np
h=1080; y=np.arange(h)/h; a=np.clip((y-0.5)/0.28,0,1)**1.3*0.78
im=np.zeros((h,1920,4),np.uint8); im[...,3]=(a[:,None]*255).astype(np.uint8); Image.fromarray(im).save('grad.png')"
for f in CX1C_000 CX1C_180; do
  [ -f ${f}_orig.mov ] || mv $f.mov ${f}_orig.mov
  ffmpeg -v error -y -i ${f}_orig.mov -i grad.png -filter_complex "[0:v][1:v]overlay=0:0:format=auto,format=yuv444p" \
    -c:v libx264 -preset medium -crf 10 -pix_fmt yuv444p -r 24 -video_track_timescale 12288 $f.mov
done
