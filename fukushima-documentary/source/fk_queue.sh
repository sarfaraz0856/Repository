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
    nice node render.js $s --frames $a:$b --out $PWD/$f.mov > $f.log 2>&1 && touch $f.done && echo "ok $f $(tail -1 $f.log | awk '{print $NF}')"
  done
done
echo ALL_DONE
