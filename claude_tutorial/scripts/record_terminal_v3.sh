#!/usr/bin/env bash
# Genuine screen recording of a real terminal session (Xvfb + xterm + FFmpeg x11grab).
# Usage: record_terminal_v3.sh <inner_script> <demo_dir> <out_name>   (writes recordings/<out_name>.mp4 + _marks.txt)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; INNER="$1"; DEMO="$2"; NAME="$3"
OUT="$ROOT/recordings/$NAME.mp4"; LOG="$ROOT/recordings/${NAME}_marks.txt"
W=1600; H=900; DISP=:98
[ -e "$OUT" ] && { echo "refusing to overwrite $OUT"; exit 1; }
rm -f "$LOG"
Xvfb $DISP -screen 0 ${W}x${H}x24 -nolisten tcp 2>/dev/null & XPID=$!; sleep 1
export DISPLAY=$DISP
ffmpeg -loglevel error -y -f x11grab -framerate 30 -video_size ${W}x${H} -draw_mouse 0 -i $DISP -c:v libx264 -preset veryfast -crf 14 -pix_fmt yuv420p "$OUT" & FPID=$!
echo "rec_start $(date +%s.%N)" >> "$LOG"; sleep 0.5
xterm -geometry 82x23+0+0 -fa 'JetBrains Mono' -fs 22 -bg '#141413' -fg '#ECEAE3' -bc -b 28 \
      -xrm 'XTerm*borderWidth:0' -xrm 'XTerm*scrollBar:false' -xrm 'XTerm*cursorColor:#D97757' \
      -e bash "$INNER" "$LOG" "$DEMO" 2>/dev/null
sleep 0.3; kill -INT $FPID; wait $FPID || true; kill $XPID || true
echo "saved $OUT"
