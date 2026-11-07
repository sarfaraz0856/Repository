#!/bin/bash
# Epilogue edit (60 s): the arch at night, the last flight over Pripyat, then black: two closing cards,
# THE END and the credits. The film ends in silence on black.
set -e
cd "$(dirname "$0")/out/part13"
OUT=${1:-chernobyl_part13.mp4}
T=titles
ffmpeg -hide_banner -loglevel warning -y \
  -i AB1_all.mov -i AB2_all.mov \
  -thread_queue_size 256 -itsoffset 1.0 -framerate 24 -i $T/e0/%04d.png \
  -thread_queue_size 256 -itsoffset 5.4 -framerate 24 -i $T/e1/%04d.png \
  -thread_queue_size 256 -itsoffset 16.2 -framerate 24 -i $T/e2/%04d.png \
  -thread_queue_size 256 -itsoffset 30.6 -framerate 24 -i $T/c1/%04d.png \
  -thread_queue_size 256 -itsoffset 36.4 -framerate 24 -i $T/c2/%04d.png \
  -thread_queue_size 256 -itsoffset 42.2 -framerate 24 -i $T/end/%04d.png \
  -thread_queue_size 256 -itsoffset 46.8 -framerate 24 -i $T/cr1/%04d.png \
  -thread_queue_size 256 -itsoffset 52.6 -framerate 24 -i $T/cr2/%04d.png \
  -i soundtrack_raw.wav \
  -filter_complex "
    [0:v]trim=duration=15.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a1];
    [1:v]trim=duration=15.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a2];
    [a1][a2]concat=n=2:v=1:a=0,settb=1/24,fps=24,tpad=stop_mode=add:stop_duration=30:color=black[base];
    [base][2:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][3:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][4:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][5:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][6:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4][7:v]overlay=0:0:eof_action=pass:format=auto[t5];
    [t5][8:v]overlay=0:0:eof_action=pass:format=auto[t6];
    [t6][9:v]overlay=0:0:eof_action=pass:format=auto[t7];
    [t7]fade=t=in:st=0:d=1.0,fade=t=out:st=59.0:d=0.9,format=yuv420p[v];
    [10:a]volume=0dB,alimiter=limit=0.85:attack=3:release=90:level=disabled,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[v]" -map "[a]" -t 60.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Chernobyl - Epilogue" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT"
