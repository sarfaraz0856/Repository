#!/bin/bash
# Bhopal chapter 1 edit (60 s): hard cuts BH1..BH4 (rendered in chunks), fade in from black, the lane
# fades out at the end. Five captions; the soundtrack is the score with the Hindi narration mixed in.
set -e
cd "$(dirname "$0")/out/bh1"
OUT=${1:-bhopal_ch1.mp4}
T=titles
ls BH1_000.mov BH1_168.mov BH2_000.mov BH2_168.mov BH3_000.mov BH3_128.mov BH3_256.mov BH4_000.mov BH4_128.mov BH4_256.mov | sed "s/.*/file '&'/" > chunks.txt
ffmpeg -hide_banner -loglevel warning -y \
  -f concat -safe 0 -i chunks.txt \
  -thread_queue_size 256 -itsoffset 1.0 -framerate 24 -i $T/e0/%04d.png \
  -thread_queue_size 256 -itsoffset 6.0 -framerate 24 -i $T/e1/%04d.png \
  -thread_queue_size 256 -itsoffset 15.2 -framerate 24 -i $T/e2/%04d.png \
  -thread_queue_size 256 -itsoffset 30.0 -framerate 24 -i $T/e3/%04d.png \
  -thread_queue_size 256 -itsoffset 46.0 -framerate 24 -i $T/e4/%04d.png \
  -i mix_bh1.wav \
  -filter_complex "
    [0:v]settb=1/24,fps=24,format=yuv444p[base];
    [base][1:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][2:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][3:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][4:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][5:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4]fade=t=in:st=0:d=1.2,format=yuv420p[v];
    [6:a]alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=18,aresample=48000[a]" \
  -map "[v]" -map "[a]" -t 60.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Bhopal 1984 - The Night" "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
