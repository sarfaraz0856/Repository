#!/bin/bash
cd "$(dirname "$0")"
for s in ${SHOTS:-S1 S2 S3 S4 S5 S6 S7 S8 S9 S10}; do
  echo "=== $s start $(date +%T)" >> out/render.log
  node render.js $s --out out/$s.mov >> out/render_$s.log 2>&1
  echo "=== $s done $(date +%T) rc=$?" >> out/render.log
done
echo "ALL DONE $(date +%T)" >> out/render.log
