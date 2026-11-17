#!/usr/bin/env bash
# Generates the Hindi voiceover lines with Piper (offline neural TTS, voice: hi_IN-pratham-medium).
# Requires: pip install piper-tts, ffmpeg. Model is downloaded on first run.
set -euo pipefail
cd "$(dirname "$0")/.."
MODEL_DIR="${PIPER_MODEL_DIR:-/tmp/piper}"
MODEL="$MODEL_DIR/hi_IN-pratham-medium.onnx"
mkdir -p "$MODEL_DIR" public/voiceover
if [ ! -f "$MODEL" ]; then
  base=https://huggingface.co/rhasspy/piper-voices/resolve/main/hi/hi_IN/pratham/medium
  curl -sSfL -o "$MODEL" "$base/hi_IN-pratham-medium.onnx"
  curl -sSfL -o "$MODEL.json" "$base/hi_IN-pratham-medium.onnx.json"
fi
LINES=(
  "गूगल लेंस कैसे काम करता है?"
  "कैमरा, ऑब्जेक्ट को स्कैन करता है।"
  "फिर एआई उसे पहचानकर, अरबों तस्वीरों से मिलान करता है।"
  "और आपको मिलते हैं, मिलते-जुलते प्रोडक्ट्स।"
  "स्कैन करें, सर्च करें, खोजें!"
)
SPEED=(0.9 0.9 0.9 0.9 0.82)
for i in "${!LINES[@]}"; do
  n=$((i + 1))
  tmp="$(mktemp --suffix=.wav)"
  printf '%s\n' "${LINES[$i]}" | python3 -m piper -m "$MODEL" --length-scale "${SPEED[$i]}" -f "$tmp" 2>/dev/null
  # trim silence, clean low end, gentle compression, resample to 48 kHz
  ffmpeg -nostdin -v error -y -i "$tmp" -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,aresample=48000:resampler=soxr" -ac 1 "public/voiceover/vo_$n.wav"
  rm -f "$tmp"
  echo "vo_$n.wav $(ffprobe -v error -show_entries format=duration -of csv=p=0 public/voiceover/vo_$n.wav)s  ${LINES[$i]}"
done
