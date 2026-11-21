#!/bin/bash
# Chapter III edit (60 s): hard cuts Q1..Q4, Q4 dissolves into Q5, Q5 fades to black, 2 s black tail.
# Radiation flecks over the roof shot, seven captions, soundtrack mastered to about -15 LUFS.
set -e
cd "$(dirname "$0")/out/part3"
OUT=${1:-chernobyl_part3.mp4}
T=titles
ffmpeg -hide_banner -loglevel warning -y \
  -i Q1_000.mov -i Q2_000.mov -i Q3_000.mov -i Q4_000.mov -i Q5_000.mov \
  -thread_queue_size 256 -itsoffset 20.0 -framerate 24 -i speckle/%04d.png \
  -thread_queue_size 256 -itsoffset 1.0 -framerate 24 -i $T/d0/%04d.png \
  -thread_queue_size 256 -itsoffset 6.6 -framerate 24 -i $T/d1/%04d.png \
  -thread_queue_size 256 -itsoffset 12.0 -framerate 24 -i $T/d2/%04d.png \
  -thread_queue_size 256 -itsoffset 21.5 -framerate 24 -i $T/d3/%04d.png \
  -thread_queue_size 256 -itsoffset 34.5 -framerate 24 -i $T/d4/%04d.png \
  -thread_queue_size 256 -itsoffset 44.5 -framerate 24 -i $T/d5/%04d.png \
  -thread_queue_size 256 -itsoffset 51.5 -framerate 24 -i $T/d6/%04d.png \
  -i soundtrack_raw.wav \
  -filter_complex "
    [0:v]trim=duration=11.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a1];
    [1:v]trim=duration=9.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a2];
    [2:v]trim=duration=13.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a3];
    [3:v]trim=duration=11.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a4];
    [4:v]trim=duration=15.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a5];
    [a1][a2][a3][a4]concat=n=4:v=1:a=0,settb=1/24,fps=24[b4];
    [b4][a5]xfade=transition=fade:duration=1.0:offset=43.0,tpad=stop_mode=add:stop_duration=2:color=black[base];
    [5:v]format=rgba,colorchannelmixer=aa=0.55[sp];
    [base][sp]overlay=0:0:eof_action=pass:format=auto[s0];
    [s0][6:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][7:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][8:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][9:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][10:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4][11:v]overlay=0:0:eof_action=pass:format=auto[t5];
    [t5][12:v]overlay=0:0:eof_action=pass:format=auto[t6];
    [t6]fade=t=in:st=0:d=1.0,format=yuv420p[v];
    [13:a]volume=-1dB,alimiter=limit=0.85:attack=3:release=90:level=disabled,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[v]" -map "[a]" -t 60.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Chernobyl - The Liquidators" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT"
