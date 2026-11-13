#!/bin/bash
# Joins the 15 one-minute chapters into the full film.
#   $OUT/Bhopal-Gas-Tragedy-Documentary-in-Hindi.mp4        1080p master for YouTube (video copied, audio re-encoded once)
#   $OUT/Bhopal-Gas-Tragedy-Documentary-in-Hindi-720p.mp4   720p copy under 100 MB (two-pass x264)
# Usage: ./join_full.sh REPO_BHOPAL_DIR OUT_DIR
set -e
R=$1; OUT=$2; mkdir -p "$OUT"
L="$OUT/chapters.txt"; : > "$L"
for n in $(seq 1 15); do f=$(ls "$R"/chapter$n/*.mp4); echo "file '$f'" >> "$L"; done
M="$OUT/Bhopal-Gas-Tragedy-Documentary-in-Hindi.mp4"
# Every chapter is already mastered to -15 LUFS; the audio is decoded across the joins and re-encoded once, so the
# chapter boundaries have no AAC priming gaps.
ffmpeg -hide_banner -loglevel warning -y -f concat -safe 0 -i "$L" -map 0:v -map 0:a -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -metadata title="Bhopal Gas Tragedy (Hindi documentary)" "$M"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$M"
S="$OUT/Bhopal-Gas-Tragedy-Documentary-in-Hindi-720p.mp4"
for p in 1 2; do
  nice ffmpeg -hide_banner -loglevel warning -y -i "$M" -vf "scale=1280:720:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset slow -b:v 740k -maxrate 2M -bufsize 4M -pass $p -passlogfile "$OUT/p720" -profile:v high \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 112k -ar 48000 -movflags +faststart \
    -metadata title="Bhopal Gas Tragedy (Hindi documentary)" $([ $p = 1 ] && echo "-an -f mp4 /dev/null" || echo "$S")
done
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$S"
