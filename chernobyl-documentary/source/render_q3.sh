#!/bin/bash
# Render chunks "SHOT:a:b" sequentially into out/part3/SHOT_a.mov (each job kept under ~2 h).
cd "$(dirname "$0")"
for spec in "$@"; do
  IFS=: read s a b <<< "$spec"
  echo "=== $spec start $(date +%T)" >> out/render.log
  node render.js $s --frames $a:$b --out out/part3/${s}_$(printf %03d $a).mov >> out/render_${s}.log 2>&1
  echo "=== $spec done $(date +%T) rc=$?" >> out/render.log
done
echo "QUEUE DONE $(date +%T) $*" >> out/render.log
