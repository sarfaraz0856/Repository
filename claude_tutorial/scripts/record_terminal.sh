#!/usr/bin/env bash
# Genuine screen recording of a real Claude Code CLI session: Xvfb virtual display + xterm + FFmpeg x11grab.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEMO="${DEMO_DIR:-$ROOT/assets/demo_project_todo-app}"
OUT="$ROOT/recordings/claude_code_terminal_raw.mp4"; LOG="$ROOT/recordings/claude_code_terminal_marks.txt"
W=1600; H=900; DISP=:99
[ -e "$OUT" ] && { echo "refusing to overwrite $OUT"; exit 1; }
rm -f "$LOG"
Xvfb $DISP -screen 0 ${W}x${H}x24 -nolisten tcp & XPID=$!; sleep 1
export DISPLAY=$DISP
ffmpeg -loglevel error -y -f x11grab -framerate 30 -video_size ${W}x${H} -draw_mouse 0 -i $DISP -c:v libx264 -preset veryfast -crf 14 -pix_fmt yuv420p "$OUT" & FPID=$!
echo "rec_start $(date +%s.%N)" >> "$LOG"; sleep 0.5
xterm -geometry 86x30+0+0 -fa 'JetBrains Mono' -fs 21 -bg '#0f1419' -fg '#e6e1cf' -bc -b 28 \
      -xrm 'XTerm*borderWidth:0' -xrm 'XTerm*scrollBar:false' -xrm 'XTerm*cursorColor:#ffb454' \
      -e bash "$ROOT/scripts/terminal_demo_inner.sh" "$LOG" "$DEMO"
sleep 0.3; kill -INT $FPID; wait $FPID || true; kill $XPID || true
echo "saved $OUT"; cat "$LOG"
