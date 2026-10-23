#!/usr/bin/env bash
# Render full_stage.html (timeline.js) to MP4 in 4 parallel chunks, then concat and mux the soundtrack.
set -euo pipefail
cd "$(dirname "$0")/.."                      # ui_demo/
OUT=../video_build/full; mkdir -p "$OUT"
D=$(node -e "const s=require('fs').readFileSync('full/timeline.js','utf8');const TL=JSON.parse(s.slice(s.indexOf('=')+1).replace(/;\s*$/,''));console.log(TL.duration)")
F=$(python3 -c "print(round($D*30))"); N=${CHUNKS:-4}
echo "duration=$D frames=$F chunks=$N"
pids=()
for i in $(seq 0 $((N-1))); do
  f0=$(( i*F/N )); f1=$(( (i+1)*F/N ))
  START=$(python3 -c "print($f0/30)") DUR=$(python3 -c "print(($f1-$f0)/30)") PAGE=full/full_stage.html \
    node capture.cjs | ffmpeg -v error -y -f image2pipe -framerate 30 -c:v mjpeg -i - -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 30 "$OUT/chunk$i.mp4" &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p"; done
: > "$OUT/chunks.txt"; for i in $(seq 0 $((N-1))); do echo "file '$PWD/$OUT/chunk$i.mp4'" >> "$OUT/chunks.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/chunks.txt" -c copy "$OUT/video_noaudio.mp4"
ffmpeg -v error -y -i "$OUT/video_noaudio.mp4" -i "$OUT/mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  ../FINAL-Mobile-Se-YouTube-Channel-Kaise-Banaye-2026.mp4
ffprobe -v error -show_entries format=duration,size -of compact ../FINAL-Mobile-Se-YouTube-Channel-Kaise-Banaye-2026.mp4
