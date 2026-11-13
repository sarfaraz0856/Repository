#!/bin/bash
# Builds one new chapter of the extended cut (cxN), ready to drop into the 1.2x narrated film:
#   1. picture + captions + score at 1x (assemble_bh.sh, music only)
#   2. speed to 1.2x like the rest of the film (every frame kept, 28.8 fps; score time-stretched at the same pitch)
#   3. the Hindi narration (already voiced as G_cxN_i.wav, timed for 1.2x in lines.json) mixed over the score
# -> out/cxN/cx_final_cxN.mp4 (50 s, 1080p, 28.8 fps, -15 LUFS)
# Usage: ./ext_chapter.sh N    (run in the render folder; DOC = folder with lines.json, mix.py and G_*.wav)
set -e
cd "$(dirname "$0")"; N=$1; D=cx$N; DOC=${DOC:-../doc}
TITLE=$(python3 -c "import re;print(re.search(r\"$N: \['([^']+)'\", open('titles_cx.py').read()).group(1))")
cp out/$D/soundtrack_raw.wav out/$D/mix_$D.wav
./assemble_bh.sh $D "Chernobyl - $TITLE" ${D^^}A_000.mov ${D^^}A_180.mov ${D^^}B_000.mov ${D^^}B_180.mov \
  ${D^^}C_000.mov ${D^^}C_180.mov ${D^^}D_000.mov ${D^^}D_180.mov > out/$D/assemble.log 2>&1
M=out/$D/bhopal_$D.mp4
ffmpeg -v error -y -i $M -map 0:a -af "rubberband=tempo=1.2,aresample=48000" -ac 2 -c:a pcm_f32le out/$D/bed12_raw.wav
ffmpeg -v error -y -i out/$D/bed12_raw.wav -af "loudnorm=I=-19:TP=-3:LRA=20,aresample=48000" -ac 2 -c:a pcm_f32le $DOC/bed_$D.wav
(cd $DOC && GAP=0.36 python3 mix.py G $D bed_$D.wav "$OLDPWD/out/$D/mix12_$D.wav" 0.045 0 full | tr '\n' ' '; echo)
ffmpeg -v error -y -i $M -i out/$D/mix12_$D.wav -filter_complex \
  "[0:v]setpts=PTS/1.2,fps=28.8[v];[1:a]atrim=0:50,alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=14,aresample=48000[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -t 50 out/$D/cx_final_$D.mp4
rm -f $DOC/bed_$D.wav out/$D/bed12_raw.wav
ffprobe -v error -show_entries format=duration,size -of default=nw=1 out/$D/cx_final_$D.mp4
