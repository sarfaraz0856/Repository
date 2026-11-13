#!/bin/bash
# Joins the extended cut: the narrated 1.2x film (Part A 0-350 s + Part B 350-640.1 s) with the six new chapters
# inserted at chapter boundaries. The first chapter is untouched.
#   after I    45.833 s   CX1 How it happened        after II   95.833 s   CX2 The world finds out
#   after III 145.833 s   CX3 The bio-robots         after IV  200.000 s   CX4 Hospital No. 6
#   after VII 350.000 s   CX5 The lost city          after XII 600.000 s   CX6 The lesson
# Usage: ./ext_final.sh REPO_CHERNOBYL_DIR CX_DIR WORK_DIR OUT_1080 OUT_720
set -e
R=$1; C=$2; T=$3; O1=$4; O7=$5; mkdir -p "$T"
A=$R/Chernobyl-Disaster-Documentary-in-Hindi-1080p-Part-A.mp4; B=$R/Chernobyl-Disaster-Documentary-in-Hindi-1080p-Part-B.mp4
ENC="-c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 28.8 -c:a pcm_s16le -ar 48000 -ac 2"
cut() { # src start dur out  (short audio fades so the joins never click)
  ffmpeg -nostdin -v error -y -ss $2 -t $3 -i "$1" -af "afade=t=in:d=0.02,afade=t=out:st=$(python3 -c "print($3-0.03)"):d=0.03" $ENC "$4"; }
cut $A 0       45.8333 $T/o01.mkv
cut $A 45.8333 50      $T/o02.mkv
cut $A 95.8333 50      $T/o03.mkv
cut $A 145.8333 54.1667 $T/o04.mkv
cut $A 200     150     $T/o05.mkv
cut $B 0       250     $T/o06.mkv
cut $B 250     $(python3 -c "print($(ffprobe -v error -show_entries format=duration -of csv=p=0 $B)-250)") $T/o07.mkv
for k in 1 2 3 4 5 6; do ffmpeg -nostdin -v error -y -i $C/cx$k/cx_final_cx$k.mp4 -af "afade=t=in:d=0.02,afade=t=out:st=49.97:d=0.03" $ENC $T/n0$k.mkv; done
: > $T/list.txt
for f in o01 n01 o02 n02 o03 n03 o04 n04 o05 n05 o06 n06 o07; do echo "file '$T/$f.mkv'" >> $T/list.txt; done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i $T/list.txt -c copy $T/joined.mkv
ffprobe -v error -show_entries format=duration -of csv=p=0 $T/joined.mkv
# 1080p master (two-pass, sized for upload) and a 720p copy under 100 MB
enc() { # out scale vbitrate maxrate abitrate
  for p in 1 2; do
    nice ffmpeg -nostdin -hide_banner -loglevel warning -y -i $T/joined.mkv -vf "scale=$2:flags=lanczos,format=yuv420p" -r 28.8 \
      -c:v libx264 -preset slow -b:v $3 -maxrate $4 -bufsize 8M -pass $p -passlogfile $T/pl_$(basename $1) -profile:v high -tune grain \
      -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
      $([ $p = 1 ] && echo "-an -f mp4 /dev/null" || echo "-af loudnorm=I=-15:TP=-1.5:LRA=14 -c:a aac -b:a $5 -ar 48000 -movflags +faststart -metadata title=Chernobyl_1986_Extended_Hindi $1")
  done; ffprobe -v error -show_entries format=duration,size -of default=nw=1 $1; }
enc $O1 1920:1080 3200k 7M 160k
enc $O7 1280:720 700k 2M 96k
