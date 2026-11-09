#!/bin/bash
# Cuts a ~3-minute promo (for YouTube ads) from the finished chapters: the main points of the story, each cut on a
# narration-line boundary, joined with 0.5 s dissolves, ending on a call to action that points to the full film.
# Usage: ./make_promo.sh REPO_BHOPAL_DIR WORK_DIR CTA_VOICE_WAV MUSIC_BH15_WAV ENDCARD_PNG OUT_MP4
set -e
R=$1; T=$2; VOICE=$3; BED=$4; CARD=$5; OUT=$6; mkdir -p "$T"
# chapter start end   (the main points, in story order)
SEGS="1 0.0 12.6
1 20.0 27.6
1 35.5 41.0
1 45.0 52.3
2 19.1 26.0
2 30.5 42.3
3 4.5 11.0
3 17.1 29.3
4 30.5 43.1
4 44.9 50.2
5 30.5 36.4
7 30.5 50.0
8 22.5 41.0
9 22.5 35.0
10 45.5 56.8
15 30.5 42.2
15 45.5 53.6"
ENC="-c:v libx264 -preset medium -crf 15 -pix_fmt yuv420p -r 24 -c:a pcm_s16le -ar 48000 -ac 2"
n=0; : > "$T/list"
while read c a b; do
  f=$(ls "$R"/chapter$c/*.mp4); o=$(printf "$T/seg%02d.mkv" $n)
  ffmpeg -v error -y -ss $a -to $b -i "$f" $ENC "$o"; echo "$o" >> "$T/list"; n=$((n+1))
done <<< "$SEGS"
# end card: the statue at night (chapter 15, 45-53 s, no captions there), dimmed, with the call to action and the
# chapter's score under the new narration line
f=$(ls "$R"/chapter15/*.mp4); o=$(printf "$T/seg%02d.mkv" $n)
ffmpeg -v error -y -ss 45 -t 8 -i "$f" -loop 1 -t 8 -i "$CARD" -ss 45 -t 8 -i "$BED" -i "$VOICE" -filter_complex "
  [0:v]eq=brightness=-0.08:saturation=0.8,format=yuv420p[bg];
  [1:v]format=rgba,fade=t=in:st=0.6:d=0.8:alpha=1[ov]; [bg][ov]overlay=0:0,fade=t=out:st=7.0:d=1.0[v];
  [2:a]volume=-9dB,afade=t=out:st=6.5:d=1.5[m]; [3:a]adelay=900|900,apad,atrim=0:8,aformat=channel_layouts=stereo[vo];
  [m][vo]amix=inputs=2:normalize=0,aformat=sample_rates=48000:channel_layouts=stereo[a]" -map "[v]" -map "[a]" $ENC "$o"
echo "$o" >> "$T/list"
# dissolve everything together
mapfile -t F < "$T/list"; N=${#F[@]}; X=0.5
IN=""; for f in "${F[@]}"; do IN="$IN -i $f"; done
FC=""; off=0; prevv="[0:v]"; preva="[0:a]"
for ((i=1;i<N;i++)); do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${F[$((i-1))]}")
  off=$(python3 -c "print(round($off + $d - $X, 3))")
  FC="$FC${prevv}[$i:v]xfade=transition=fade:duration=$X:offset=$off[v$i];${preva}[$i:a]acrossfade=d=$X[a$i];"
  prevv="[v$i]"; preva="[a$i]"; off=$(python3 -c "print(round($off, 3))")
done
FC="$FC${preva}alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=14,aresample=48000[aout]"
ffmpeg -v error -y $IN -filter_complex "$FC" -map "$prevv" -map "[aout]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -profile:v high -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k -movflags +faststart \
  -metadata title="Bhopal Gas Tragedy - Trailer" "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
