#!/bin/bash
# New cold open for the extended cut (16.5 s, final speed, 28.8 fps): four hard cuts from the film and CX2,
# graded darker, the channel name over the first shot, the CHERNOBYL / DOCUMENTARY title over the last, then a boom and a dip to black into the film's own opening.
# Usage: ./make_intro.sh PART_A_MP4 CX2_FINAL_MP4 OUT_MP4     (run after audio_intro.py and narrate.sh intro)
set -e
A=$1; C=$2; OUT=$3; W=out/intro
python3 - <<'PY'
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/inter/'
im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
def spaced(y, txt, font, sp, fill):
    w = sum(d.textlength(c, font=font) for c in txt) + sp * (len(txt) - 1); x = (1920 - w) / 2
    for c in txt: d.text((x, y), c, font=font, fill=fill); x += d.textlength(c, font=font) + sp
spaced(470, 'ITIHAAS KE SAAYE', ImageFont.truetype(F + 'InterDisplay-SemiBold.otf', 64), 14, (255, 255, 255, 255))
spaced(570, 'PRESENTS', ImageFont.truetype(F + 'InterDisplay-Regular.otf', 30), 18, (225, 225, 225, 235))
im.save('out/intro/brand.png')
im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
spaced(395, 'CHERNOBYL', ImageFont.truetype(F + 'InterDisplay-Bold.otf', 150), 34, (255, 255, 255, 255))
d.rectangle((810, 590, 1110, 593), fill=(200, 60, 40, 255))
spaced(622, 'DOCUMENTARY', ImageFont.truetype(F + 'InterDisplay-SemiBold.otf', 54), 28, (240, 240, 240, 255))
from PIL import ImageFilter
sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(im.getchannel('A').filter(ImageFilter.GaussianBlur(14)).point(lambda a: int(a * 0.75)))
im = Image.alpha_composite(sh, im); im.save('out/intro/title.png')
PY
G="eq=saturation=0.85:contrast=1.06:brightness=-0.03,vignette=PI/4.5,scale=1920:1080,fps=28.8,format=yuv420p"
ffmpeg -nostdin -v error -y \
  -ss 36.0 -t 3.4 -i "$A" -ss 12.0 -t 5.4 -i "$A" -ss 24.5 -t 3.8 -i "$A" -ss 46.0 -t 3.9 -i "$C" \
  -loop 1 -t 3.4 -i $W/brand.png -loop 1 -t 3.9 -i $W/title.png -i $W/mix_intro.wav -filter_complex "
  [0:v]$G,setpts=PTS-STARTPTS,zoompan=z='1+0.0006*on':d=1:s=1920x1080:fps=28.8[a0];
  [4:v]format=rgba,fade=t=in:st=0.5:d=0.6:alpha=1,fade=t=out:st=2.6:d=0.5:alpha=1,setpts=PTS-STARTPTS[br];
  [a0][br]overlay=0:0:shortest=1[a];
  [1:v]$G,setpts=PTS-STARTPTS[b]; [2:v]$G,setpts=PTS-STARTPTS[c];
  [3:v]$G,eq=brightness=-0.06,setpts=PTS-STARTPTS[d0];
  [5:v]format=rgba,fade=t=in:st=0.7:d=0.5:alpha=1,setpts=PTS-STARTPTS[t];
  [d0][t]overlay=0:0:shortest=1[d];
  [a][b][c][d]concat=n=4:v=1:a=0,fade=t=in:d=0.4,fade=t=out:st=15.9:d=0.6,trim=0:16.5[v];
  [6:a]apad,atrim=0:16.5,alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=14,aresample=48000[au]" \
  -map "[v]" -map "[au]" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k -t 16.5 "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
