#!/bin/bash
# Joins the 13 chapter masters into the finished film.
# Usage: final_join.sh OUT START END VBITRATE SCALE GAINS...   (chapters START..END, gains in dB for those chapters)
set -e
S=/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad; C=$S/chernobyl/out; R=/home/user/Repository/chernobyl-documentary
OUT=$1; A=$2; B=$3; VB=$4; SC=$5; shift 5; GAINS=("$@")
src() { if [ "$1" = 1 ]; then echo $R/Chernobyl_26_April_1986_Documentary.mp4; else echo $C/part$1/chernobyl_part$1.mp4; fi; }
IN=""; FC=""; CC=""; i=0
for ch in $(seq $A $B); do
  IN="$IN -i $(src $ch)"; g=${GAINS[$i]}
  FC="$FC[$i:v]settb=1/24,fps=24,scale=$SC:flags=lanczos,setsar=1,format=yuv420p[v$i];[$i:a]volume=${g}dB,aformat=sample_rates=48000:channel_layouts=stereo[a$i];"
  CC="$CC[v$i][a$i]"; i=$((i+1))
done
FC="$FC${CC}concat=n=$i:v=1:a=1[v][ac];[ac]alimiter=limit=0.7:attack=3:release=90:level=disabled[a]"
for p in 1 2; do
  nice ffmpeg -hide_banner -loglevel warning -y $IN -filter_complex "$FC" -map "[v]" -map "[a]" \
    -c:v libx264 -preset slow -b:v $VB -maxrate 4.5M -bufsize 9M -pass $p -passlogfile $S/fj_$(basename $OUT) \
    -profile:v high -level 4.1 -pix_fmt yuv420p -tune grain -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 128k -ar 48000 -movflags +faststart -metadata title="Chernobyl 1986" "$OUT"
done
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
