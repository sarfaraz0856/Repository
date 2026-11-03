#!/bin/bash
# The narrated 1.2x film ending after THE END (no credits): picture cut at 638.6 s, then 1.5 s of black.
set -e
D=/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad/doc
R=/home/user/Repository/chernobyl-documentary
A=$D/fin_full12_v3.wav
V="[0:v][1:v]concat=n=2:v=1:a=0,setpts=(PTS-STARTPTS)/1.2"
enc() { # out start picture_dur scale vbitrate maxrate
  for p in 1 2; do
    nice ffmpeg -hide_banner -loglevel warning -y -i $R/Chernobyl_1986_Full_Film_Part_A_1080p.mp4 -i $R/Chernobyl_1986_Full_Film_Part_B_1080p.mp4 -ss $2 -i $A \
      -filter_complex "$V,trim=start=$2:duration=$3,setpts=PTS-STARTPTS,tpad=stop_mode=add:stop_duration=1.5:color=black,scale=$4:flags=lanczos,format=yuv420p[v]" \
      -map "[v]" -map 2:a -r 28.8 -c:v libx264 -preset slow -b:v $5 -maxrate $6 -bufsize 8M -pass $p -passlogfile $D/fe3_$(basename $1) \
      -profile:v high -tune grain -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
      -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart -metadata title="Chernobyl 1986 (Hindi narration)" "$1"
  done
  rm -f -- $D/fe3_$(basename $1)*
  ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$1"
}
enc $D/v3_full_720p.mp4 0 638.6 1280:720 1000k 3M
enc $D/v3_partB_1080p.mp4 350 288.6 1920:1080 2000k 5M
