#!/bin/bash
# Chapter V edit (60 s): hard cuts T1..T5, fade in from black, the snowbound city fades out at the end.
# Six captions, soundtrack mastered to about -15 LUFS.
set -e
cd "$(dirname "$0")/out/part5"
printf "file 'T1_000.mov'\nfile 'T1_144.mov'\n" > T1_list.txt
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i T1_list.txt -c copy T1.mov
OUT=${1:-chernobyl_part5.mp4}
T=titles
ffmpeg -hide_banner -loglevel warning -y \
  -i T1.mov -i T2_000.mov -i T3_000.mov -i T4_000.mov -i T5_000.mov \
  -thread_queue_size 256 -itsoffset 1.0 -framerate 24 -i $T/e0/%04d.png \
  -thread_queue_size 256 -itsoffset 6.0 -framerate 24 -i $T/e1/%04d.png \
  -thread_queue_size 256 -itsoffset 13.3 -framerate 24 -i $T/e2/%04d.png \
  -thread_queue_size 256 -itsoffset 25.3 -framerate 24 -i $T/e3/%04d.png \
  -thread_queue_size 256 -itsoffset 37.3 -framerate 24 -i $T/e4/%04d.png \
  -thread_queue_size 256 -itsoffset 49.6 -framerate 24 -i $T/e5/%04d.png \
  -i soundtrack_raw.wav \
  -filter_complex "
    [0:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a1];
    [1:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a2];
    [2:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a3];
    [3:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a4];
    [4:v]trim=duration=12.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a5];
    [a1][a2][a3][a4][a5]concat=n=5:v=1:a=0,settb=1/24,fps=24[base];
    [base][5:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][6:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][7:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][8:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][9:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4][10:v]overlay=0:0:eof_action=pass:format=auto[t5];
    [t5]fade=t=in:st=0:d=1.0,fade=t=out:st=58.2:d=1.6,format=yuv420p[v];
    [11:a]volume=0dB,alimiter=limit=0.85:attack=3:release=90:level=disabled,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[v]" -map "[a]" -t 60.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Chernobyl - The Reckoning" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT"
