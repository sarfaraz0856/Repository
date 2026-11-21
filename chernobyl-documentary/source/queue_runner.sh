#!/bin/bash
# Works through queue.txt ("SHOT:a:b:partN" per line), one chunk at a time, and stops starting new
# chunks after STOP_MIN minutes so that each background job stays under two hours. Finished lines
# move to queue_done.txt. Run it again to continue.
cd "$(dirname "$0")"
STOP_MIN=${STOP_MIN:-55}
start=$(date +%s)
while true; do
  line=$(head -n1 queue.txt 2>/dev/null); [ -z "$line" ] && { echo "QUEUE EMPTY $(date +%T)" >> out/render.log; break; }
  el=$(( ($(date +%s) - start) / 60 )); [ $el -ge $STOP_MIN ] && { echo "RUNNER PAUSE $(date +%T) after ${el} min" >> out/render.log; break; }
  IFS=: read s a b part <<< "$line"
  mkdir -p out/$part
  echo "=== $s:$a:$b start $(date +%T)" >> out/render.log
  node render.js $s --frames $a:$b --out out/$part/${s}_$(printf %03d $a).mov >> out/render_${s}.log 2>&1; rc=$?
  echo "=== $s:$a:$b done $(date +%T) rc=$rc" >> out/render.log
  [ $rc -ne 0 ] && { echo "RUNNER STOP on error" >> out/render.log; break; }
  tail -n +2 queue.txt > queue.tmp && mv queue.tmp queue.txt; echo "$line" >> queue_done.txt
done
