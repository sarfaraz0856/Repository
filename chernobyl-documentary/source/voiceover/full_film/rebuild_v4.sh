#!/bin/bash
# After the gate-free R1 render: rebuild chapter 4, the 1080p Part A, and the narrated films that contain it.
set -e
S=/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad
C=$S/chernobyl; D=$S/doc; R=/home/user/Repository/chernobyl-documentary
cd $C
cp out/part4/chernobyl_part4.mp4 out/part4/chernobyl_part4_withgate.mp4
./assemble4.sh > /dev/null
ffprobe -v error -show_entries format=duration -of csv=p=0 out/part4/chernobyl_part4.mp4
# non-narrated 1080p Part A (chapters I-VII), the source picture for the narrated cut
./final_join.sh out/film_partA_1080p.mp4 1 7 1680k 1920:1080 1.5 -0.5 3.4 -2.0 -1.8 -2.1 -1.5
cp out/film_partA_1080p.mp4 $R/Chernobyl_1986_Full_Film_Part_A_1080p.mp4
# narrated: full 720p (no credits) and 1080p Part A, with the new announcement line
V="[0:v][1:v]concat=n=2:v=1:a=0,setpts=(PTS-STARTPTS)/1.2"
enc() { # out start picture_dur scale vbitrate maxrate pad
  for p in 1 2; do
    nice ffmpeg -hide_banner -loglevel warning -y -i $R/Chernobyl_1986_Full_Film_Part_A_1080p.mp4 -i $R/Chernobyl_1986_Full_Film_Part_B_1080p.mp4 -ss $2 -i $D/fin_full12_v4.wav \
      -filter_complex "$V,trim=start=$2:duration=$3,setpts=PTS-STARTPTS$7,scale=$4:flags=lanczos,format=yuv420p[v]" \
      -map "[v]" -map 2:a -r 28.8 -c:v libx264 -preset slow -b:v $5 -maxrate $6 -bufsize 8M -pass $p -passlogfile $D/fe4_$(basename $1) \
      -profile:v high -tune grain -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
      -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart -metadata title="Chernobyl 1986 (Hindi narration)" "$1"
  done
  rm -f -- $D/fe4_$(basename $1)*
  ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$1"
}
enc $D/v4_full_720p.mp4 0 638.6 1280:720 1000k 3M ",tpad=stop_mode=add:stop_duration=1.5:color=black"
enc $D/v4_partA_1080p.mp4 0 350 1920:1080 2000k 5M ""
echo NARRATED_DONE
# non-narrated 13-minute 720p film, so it also shows the shot without the gate
cd $C && ./final_join.sh out/film_13min_720p.mp4 1 13 840k 1280:720 1.5 -0.5 3.4 -2.0 -1.8 -2.1 -1.5 -0.3 -2.0 -1.0 -2.5 0.4 -1.5
echo ALL_DONE
