#!/usr/bin/env bash
# Final assembly for the full episode (v3).
#   output/claude_ai_full_episode01_v3.mp4               English captions burned in (main deliverable)
#   output/claude_ai_full_episode01_v3_softsubs.mp4      no burned captions; English + Hinglish subtitle tracks
#   output/claude_ai_full_episode01_v3_music_sfx_only.mp4 picture + music/SFX, no narration (for a human voice-over)
# Usage: RENDER_DIR=<dir with video_clean.mp4> assemble_v3.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; R="${RENDER_DIR:?}"; O="$ROOT/output"; A="$ROOT/assets/audio"; SUB="$ROOT/subtitles/claude_ai_full_episode01_v3"
M="$O/claude_ai_full_episode01_v3.mp4"; S="$O/claude_ai_full_episode01_v3_softsubs.mp4"; N="$O/claude_ai_full_episode01_v3_music_sfx_only.mp4"
for f in "$M" "$S" "$N"; do [ -e "$f" ] && { echo "refusing to overwrite $f"; exit 1; }; done
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$R/video_clean.mp4")
J=$(ffmpeg -hide_banner -i "$A/mix_premaster_v3.flac" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
read -r mI mTP mLRA mTh off <<<"$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")"
ffmpeg -loglevel error -y -i "$A/mix_premaster_v3.flac" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$mI:measured_TP=$mTP:measured_LRA=$mLRA:measured_thresh=$mTh:offset=$off:linear=true,aresample=48000" -t "$DUR" "$R/mix_final_v3.wav"
python3 - "$A" "$R" <<'PY'
import sys, soundfile as sf, numpy as np
A, R = sys.argv[1:3]; m, sr = sf.read(f"{A}/music_bed_original_v3.flac"); s, _ = sf.read(f"{A}/sfx_only_v3.flac")
x = m * 2 * 10 ** (-13 / 20) * 10 ** (-4 / 20) + s * 2 * 0.5
x /= max(1.0, np.abs(x).max() / 0.97); sf.write(f"{R}/nv_pre_v3.wav", x.astype(np.float32), sr, subtype="PCM_24")
PY
ffmpeg -loglevel error -y -i "$R/nv_pre_v3.wav" -af "loudnorm=I=-20:TP=-2:LRA=11,aresample=48000" -t "$DUR" "$R/nv_final_v3.wav"
# main: burn English captions (re-encode video once)
ffmpeg -loglevel error -y -i "$R/video_clean.mp4" -i "$R/mix_final_v3.wav" -map 0:v:0 -map 1:a:0 -vf "ass=$SUB.en.ass" \
  -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -t "$DUR" -movflags +faststart \
  -metadata title="Claude AI Complete Guide – Episode 01: Interface, Tools & Claude Code" -metadata:s:a:0 language=hin "$M"
ffmpeg -loglevel error -y -i "$R/video_clean.mp4" -i "$R/mix_final_v3.wav" -i "$SUB.en.srt" -i "$SUB.hinglish.srt" -map 0:v:0 -map 1:a:0 -map 2:s:0 -map 3:s:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -c:s mov_text -metadata:s:s:0 language=eng -metadata:s:s:0 title="English" \
  -metadata:s:s:1 language=hin -metadata:s:s:1 title="Hinglish" -metadata:s:a:0 language=hin -t "$DUR" -movflags +faststart "$S"
ffmpeg -loglevel error -y -i "$R/video_clean.mp4" -i "$R/nv_final_v3.wav" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -t "$DUR" -movflags +faststart "$N"
ls -la "$O"/claude_ai_full_episode01_v3*
