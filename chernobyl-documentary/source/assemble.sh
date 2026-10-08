#!/bin/bash
# Edit: S1..S8 hard cuts, S9 -> S10 one-second dissolve, three title overlays, fade in/out,
# soundtrack (+4 dB into a limiter), H.264 High 1080p24 + AAC 320k.
set -e
cd "$(dirname "$0")/out"
OUT=${1:-chernobyl_final.mp4}
ffmpeg -hide_banner -loglevel warning -y \
  -i S1.mov -i S2.mov -i S3.mov -i S4.mov -i S5.mov -i S6.mov -i S7.mov -i S8.mov -i S9.mov -i S10.mov \
  -thread_queue_size 256 -itsoffset 2.0 -framerate 24 -i titles/t1/%04d.png \
  -thread_queue_size 256 -itsoffset 9.9 -framerate 24 -i titles/t2/%04d.png \
  -thread_queue_size 256 -itsoffset 48.5 -framerate 24 -i titles/t3/%04d.png \
  -i soundtrack.wav \
  -filter_complex "
    [0:v]trim=duration=9.5,setpts=PTS-STARTPTS,format=yuv444p[a0];
    [1:v]trim=duration=4.5,setpts=PTS-STARTPTS,format=yuv444p[a1];
    [2:v]trim=duration=6.0,setpts=PTS-STARTPTS,format=yuv444p[a2];
    [3:v]trim=duration=4.0,setpts=PTS-STARTPTS,format=yuv444p[a3];
    [4:v]trim=duration=5.5,setpts=PTS-STARTPTS,format=yuv444p[a4];
    [5:v]trim=duration=4.5,setpts=PTS-STARTPTS,format=yuv444p[a5];
    [6:v]trim=duration=4.0,setpts=PTS-STARTPTS,format=yuv444p[a6];
    [7:v]trim=duration=5.0,setpts=PTS-STARTPTS,format=yuv444p[a7];
    [8:v]trim=duration=5.0,setpts=PTS-STARTPTS,format=yuv444p[a8];
    [9:v]trim=duration=8.0,setpts=PTS-STARTPTS,format=yuv444p[a9];
    [a8][a9]xfade=transition=fade:duration=1.0:offset=4.0[b89];
    [a0][a1][a2][a3][a4][a5][a6][a7][b89]concat=n=9:v=1:a=0,settb=1/24,fps=24[base];
    [base][10:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][11:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][12:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3]fade=t=in:st=0:d=1.2,fade=t=out:st=53.4:d=1.6,format=yuv420p[v];
    [13:a]volume=4dB,alimiter=limit=0.76:attack=3:release=90:level=disabled,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[v]" -map "[a]" -t 55.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 13M -bufsize 26M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Chernobyl - 26 April 1986" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT"
