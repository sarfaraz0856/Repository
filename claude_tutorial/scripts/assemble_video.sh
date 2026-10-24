#!/usr/bin/env bash
# Final assembly: loudness-normalise the mix (two-pass EBU R128 to -14 LUFS / -1.5 dBTP) and mux with the
# rendered video. Outputs:
#   output/claude_ai_interface_sample_60s.mp4              burned-in Hinglish captions (main sample)
#   output/claude_ai_interface_sample_60s_clean_softsub.mp4 no burned captions, SRT as a selectable track
#   output/claude_ai_interface_sample_60s_music_sfx_only.mp4 same picture, no narration (to record your own voice)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; R="${RENDER_DIR:?set RENDER_DIR to the folder with video_caps.mp4 / video_clean.mp4}"
O="$ROOT/output"; A="$ROOT/assets/audio"; SRT="$ROOT/subtitles/claude_ai_interface_sample_60s.hinglish.srt"
for f in "$O/claude_ai_interface_sample_60s.mp4" "$O/claude_ai_interface_sample_60s_clean_softsub.mp4" "$O/claude_ai_interface_sample_60s_music_sfx_only.mp4"; do
  [ -e "$f" ] && { echo "refusing to overwrite $f"; exit 1; }; done
norm(){ # $1 in.wav  $2 out.wav
  local J; J=$(ffmpeg -hide_banner -i "$1" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  local mI mTP mLRA mTh off
  mI=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
  read -r mI mTP mLRA mTh off <<<"$mI"
  ffmpeg -loglevel error -y -i "$1" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$mI:measured_TP=$mTP:measured_LRA=$mLRA:measured_thresh=$mTh:offset=$off:linear=true,aresample=48000" -t 60 "$2"
}
norm "$A/mix_premaster.flac" "$R/mix_final.wav"
# music + sfx only: re-mix without narration at the same relative levels
python3 - "$A" "$R" <<'PY'
import sys, soundfile as sf, numpy as np
A, R = sys.argv[1:3]; m, sr = sf.read(f"{A}/music_bed_original.flac"); s, _ = sf.read(f"{A}/sfx_only.flac")
x = m * 2 * 10 ** (-13 / 20) * 10 ** (-4 / 20) + s * 2 * 0.5   # music undocked but slightly lower
x /= max(1.0, np.abs(x).max() / 0.97); sf.write(f"{R}/nv_pre.wav", x.astype(np.float32), sr, subtype="PCM_24")
PY
ffmpeg -loglevel error -y -i "$R/nv_pre.wav" -af "loudnorm=I=-20:TP=-2:LRA=11,aresample=48000" -t 60 "$R/nv_final.wav"
enc(){ ffmpeg -loglevel error -y -i "$1" -i "$2" "${@:4}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$3"; }
enc "$R/video_caps.mp4"  "$R/mix_final.wav" "$O/claude_ai_interface_sample_60s.mp4" -metadata title="Claude AI Interface Explained (Sample)" -metadata:s:a:0 language=hin
ffmpeg -loglevel error -y -i "$R/video_clean.mp4" -i "$R/mix_final.wav" -i "$SRT" -map 0:v:0 -map 1:a:0 -map 2:s:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -c:s mov_text -metadata:s:s:0 language=hin -metadata:s:s:0 title="Hinglish" \
  -metadata:s:a:0 language=hin -t 60 -movflags +faststart "$O/claude_ai_interface_sample_60s_clean_softsub.mp4"
enc "$R/video_clean.mp4" "$R/nv_final.wav" "$O/claude_ai_interface_sample_60s_music_sfx_only.mp4"
ls -la "$O"
