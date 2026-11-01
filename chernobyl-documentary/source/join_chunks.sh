#!/bin/bash
# join_chunks.sh partN SHOT...  — concatenates SHOT_000/120/240.mov into SHOT_all.mov (stream copy)
cd "$(dirname "$0")/out/$1"; shift
for s in "$@"; do printf "file '${s}_000.mov'\nfile '${s}_120.mov'\nfile '${s}_240.mov'\n" > ${s}_all.txt; ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i ${s}_all.txt -c copy ${s}_all.mov; done
