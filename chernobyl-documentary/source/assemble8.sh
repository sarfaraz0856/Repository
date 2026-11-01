#!/bin/bash
# Chapter VIII edit (60 s): hard cuts W1..W4, fade in from black, the dark plant fades out at the end.
# Five captions, soundtrack mastered to about -15 LUFS.
set -e
cd "$(dirname "$0")/out/part8"
OUT=${1:-chernobyl_part8.mp4}
T=titles
ffmpeg -hide_banner -loglevel warning -y \
  -i W1_all.mov -i W2_all.mov -i W3_all.mov -i W4_all.mov \
  -thread_queue_size 256 -itsoffset 1.0 -framerate 24 -i $T/e0/%04d.png \
  -thread_queue_size 256 -itsoffset 6.4 -framerate 24 -i $T/e1/%04d.png \
  -thread_queue_size 256 -itsoffset 16.2 -framerate 24 -i $T/e2/%04d.png \
  -thread_queue_size 256 -itsoffset 31.2 -framerate 24 -i $T/e3/%04d.png \
  -thread_queue_size 256 -itsoffset 46.2 -framerate 24 -i $T/e4/%04d.png \
  -i soundtrack_raw.wav \
  -loop 1 -framerate 24 -t 60 -i capband.png \
  -filter_complex "
    [0:v]trim=duration=15.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a1];
    [1:v]trim=duration=15.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a2];
    [2:v]trim=duration=15.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a3];
    [3:v]trim=duration=15.0,setpts=PTS-STARTPTS,settb=1/24,format=yuv444p[a4];
    [a1][a2][a3][a4]concat=n=4:v=1:a=0,settb=1/24,fps=24[base];
    [base][4:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][5:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][6:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][10:v]overlay=0:0:format=auto:enable='between(t,30.0,44.99)'[t2b];
    [t2b][7:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][8:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4]fade=t=in:st=0:d=1.0,fade=t=out:st=58.2:d=1.6,format=yuv420p[v];
    [9:a]volume=0dB,alimiter=limit=0.85:attack=3:release=90:level=disabled,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[v]" -map "[a]" -t 60.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Chernobyl - The Last Reactor" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT"
