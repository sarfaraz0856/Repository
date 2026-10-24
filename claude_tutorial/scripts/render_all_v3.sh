#!/usr/bin/env bash
# Renders the full v3 episode (no captions) in N parallel segments and joins them losslessly.
# Usage: render_all_v3.sh <timings.json> <framesA_dir> <framesB_dir> <work_dir> [workers=4]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; TIM="$1"; A="$2"; B="$3"; W="$4"; NW="${5:-4}"
TOTAL=$(python3 -c "import json;print(round(json.load(open('$TIM'))['total']*30))")
mkdir -p "$W"; : > "$W/list.txt"; PIDS=()
for ((k=0;k<NW;k++)); do
  F0=$((TOTAL*k/NW)); F1=$((TOTAL*(k+1)/NW))
  node "$HERE/render_frames_v3.js" "$TIM" "$A" "$B" "$W/seg$k.mp4" $F0 $F1 > "$W/seg$k.log" 2>&1 & PIDS+=($!)
  echo "file 'seg$k.mp4'" >> "$W/list.txt"
done
for p in "${PIDS[@]}"; do wait $p; done
ffmpeg -loglevel error -y -f concat -safe 0 -i "$W/list.txt" -c copy "$W/video_clean.mp4"
echo "frames expected $TOTAL, got $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$W/video_clean.mp4")"
