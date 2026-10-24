#!/bin/bash
# Part II edit (60 s): P1 dissolves into P2, hard cuts P2..P6, P6 dissolves into P7, P7 fades
# to black, 2 s black tail. Seven caption overlays. Soundtrack +3 dB into a limiter.
set -e
cd "$(dirname "$0")/out/part2"
OUT=${1:-chernobyl_part2.mp4}
# join chunked renders per shot (stream copy)
for s in P2 P4 P5 P6 P7; do
  ls ${s}_*.mov | sed "s/^/file '/; s/$/'/" > ${s}_list.txt
  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i ${s}_list.txt -c copy ${s}.mov
done
cp -f ../P1.mov P1.mov; cp -f ../P3.mov P3.mov
T=titles
ffmpeg -hide_banner -loglevel warning -y \
  -i P1.mov -i P2.mov -i P3.mov -i P4.mov -i P5.mov -i P6.mov -i P7.mov \
  -thread_queue_size 256 -itsoffset 1.2 -framerate 24 -i $T/c0a/%04d.png \
  -thread_queue_size 256 -itsoffset 2.2 -framerate 24 -i $T/c0b/%04d.png \
  -thread_queue_size 256 -itsoffset 9.4 -framerate 24 -i $T/c1/%04d.png \
  -thread_queue_size 256 -itsoffset 25.2 -framerate 24 -i $T/c2/%04d.png \
  -thread_queue_size 256 -itsoffset 33.2 -framerate 24 -i $T/c3/%04d.png \
  -thread_queue_size 256 -itsoffset 42.0 -framerate 24 -i $T/c4/%04d.png \
  -thread_queue_size 256 -itsoffset 51.0 -framerate 24 -i $T/c5/%04d.png \
  -i soundtrack_raw.wav \
  -filter_complex "
    [0:v]trim=duration=9.0,setpts=PTS-STARTPTS,format=yuv444p[a1];
    [1:v]trim=duration=8.0,setpts=PTS-STARTPTS,format=yuv444p[a2];
    [2:v]trim=duration=8.0,setpts=PTS-STARTPTS,format=yuv444p[a3];
    [3:v]trim=duration=8.0,setpts=PTS-STARTPTS,format=yuv444p[a4];
    [4:v]trim=duration=9.0,setpts=PTS-STARTPTS,format=yuv444p[a5];
    [5:v]trim=duration=8.0,setpts=PTS-STARTPTS,format=yuv444p[a6];
    [6:v]trim=duration=10.0,setpts=PTS-STARTPTS,format=yuv444p[a7];
    [a1][a2]xfade=transition=fade:duration=1.0:offset=8.0[b12];
    [b12][a3][a4][a5][a6]concat=n=5:v=1:a=0,settb=1/24,fps=24[b6];
    [b6][a7]xfade=transition=fade:duration=1.0:offset=48.0,tpad=stop_mode=add:stop_duration=2:color=black[base];
    [base][7:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][8:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][9:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][10:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][11:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4][12:v]overlay=0:0:eof_action=pass:format=auto[t5];
    [t5][13:v]overlay=0:0:eof_action=pass:format=auto[t6];
    [t6]fade=t=in:st=0:d=1.0,format=yuv420p[v];
    [14:a]volume=3dB,alimiter=limit=0.8:attack=3:release=90:level=disabled,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map "[v]" -map "[a]" -t 60.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  -metadata title="Chernobyl - Part II: The Morning After" "$OUT"
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT"
