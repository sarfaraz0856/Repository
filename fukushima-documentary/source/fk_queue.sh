#!/bin/bash
# Renders Fukushima shots in 168-frame chunks -> out/fk/SHOT_aaa.mov; a chunk with a .done marker is skipped.
# Usage: fk_queue.sh "FK1:336 FK1B:432 ..."   (stops starting new chunks after STOP_MIN minutes)
cd "$(dirname "$0")"; T0=$(date +%s); STOP=${STOP_MIN:-105}
for spec in $1; do
  s=${spec%%:*}; n=${spec##*:}
  for ((a=0; a<n; a+=168)); do
    b=$((a+168 < n ? a+168 : n)); f=out/fk/${s}_$(printf %03d $a)
    [ -f $f.done ] && continue
    [ $(( ($(date +%s) - T0) / 60 )) -ge $STOP ] && { echo "STOP time"; exit 0; }
    if [ -n "$RW" ]; then nice node render.js $s --frames $a:$b --w $RW --h $RH --out $PWD/$f.lo.mov > $f.log 2>&1 && nice ffmpeg -v error -y -i $PWD/$f.lo.mov -vf scale=1920:1080:flags=lanczos -c:v libx264 -preset veryfast -crf 14 -pix_fmt yuv420p $PWD/$f.mov && rm -f -- $PWD/$f.lo.mov && touch $f.done; else nice node render.js $s --frames $a:$b --out $PWD/$f.mov > $f.log 2>&1 && touch $f.done; fi && echo "ok $f $(tail -1 $f.log | awk '{print $NF}')"
  done
done
echo ALL_DONE
