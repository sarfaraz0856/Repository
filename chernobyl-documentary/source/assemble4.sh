#!/bin/bash
# Chapter IV edit (65 s): hard cuts R1..R5, the last shot fades to black, 2 s black tail.
# Radiation flecks in the basement, six captions, soundtrack mastered to about -15 LUFS.
set -e
cd "$(dirname "$0")/out/part4"
printf "file 'R5_000.mov'\nfile 'R5_264.mov'\n" > R5_list.txt
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i R5_list.txt -c copy R5.mov
printf "file 'R2_000.mov'\nfile 'R2_096.mov'\nfile 'R2_192.mov'\n" > R2_list.txt
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i R2_list.txt -c copy R2.mov
OUT=${1:-chernobyl_part4.mp4}
T=titles
ffmpeg -hide_banner -loglevel warning -y \
  -i R1_000.mov -i R2.mov -i R3_000.mov -i R4_000.mov -i R5.mov \
  -thread_queue_size 256 -itsoffset 23.0 -framerate 24 -i ../part3/speckle/%04d.png \
  -thread_queue_size 256 -itsoffset 1.0 -framerate 24 -i $T/e0/%04d.png \
  -thread_queue_size 256 -itsoffset 6.2 -framerate 24 -i $T/e1/%04d.png \
  -thread_queue_size 256 -itsoffset 12.5 -framerate 24 -i $T/e2/%04d.png \
  -thread_queue_size 256 -itsoffset 24.5 -framerate 24 -i $T/e3/%04d.png \
  -thread_queue_size 256 -itsoffset 36.5 -framerate 24 -i $T/e4/%04d.png \
  -thread_queue_size 256 -itsoffset 48.5 -framerate 24 -i $T/e5/%04d.png \
  -thread_queue_size 256 -itsoffset 55.5 -framerate 24 -i $T/e6/%04d.png \
  -i soundtrack_raw.wav \
  -filter_complex "
    [0:v]trim=duration=11.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a1];
    [1:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a2];
    [2:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a3];
    [3:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a4];
    [4:v]trim=duration=16.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a5];
    [a1][a2][a3][a4][a5]concat=n=5:v=1:a=0,settb=1/24,fps=24,tpad=stop_mode=add:stop_duration=2:color=black[base];
    [5:v]trim=duration=12.0,format=rgba,colorchannelmixer=aa=0.5[sp];
    [base][sp]overlay=0:0:eof_action=pass:format=auto[s0];
    [s0][6:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][7:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][8:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][9:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][10:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4][11:v]overlay=0:0:eof_action=pass:format=auto[t5];
    [t5][12:v]overlay=0:0:eof_action=pass:format=auto[t6];
    [t6]fade=t=in:st=0:d=1.0,fade=t=out:st=61.4:d=1.6,format=yuv420p[v];
    [13:a]volume=1dB,alimiter=limit=0.85:attack=3:release=90:level=disabled,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[v]" -map "[a]" -t 65.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Chernobyl - The Silence" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT"
