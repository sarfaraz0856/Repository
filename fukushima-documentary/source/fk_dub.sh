#!/bin/bash
# Fukushima English dub track: English lines in the narrator's cloned voice over the same score and effects as the
# Hindi film, each chapter cut to exactly the picture's length -> out/Fukushima-English-Dub.wav (409.4 s, 48 kHz)
set -e
S=/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad; C=$S/chernobyl/out/fkcut
cd $S/dub; mkdir -p out w
LIM="alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=18,aresample=48000"
: > w/fk_list.txt
for i in $(seq 0 12); do
  k=fk$i; LC=$(python3 -c "import json;print(json.load(open('$C/$k.json'))['LC'])")
  ffmpeg -nostdin -v error -y -i $C/$k/score.wav -af "loudnorm=I=-19:TP=-3:LRA=20,aresample=48000" -ac 2 -c:a pcm_f32le w/bed_$k.wav
  GAP=0.3 python3 mix.py G $k w/bed_$k.wav w/mix_$k.wav 0.045 0 full > /dev/null
  ffmpeg -nostdin -v error -y -i w/mix_$k.wav -af "$LIM,apad,atrim=0:$LC,afade=t=out:st=$(python3 -c "print($LC-1.0)"):d=1.0" -ac 2 -ar 48000 -c:a pcm_f32le w/seg_$k.wav
  echo "file '$PWD/w/seg_$k.wav'" >> w/fk_list.txt
done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i w/fk_list.txt -ac 2 -ar 48000 -c:a pcm_s16le out/Fukushima-English-Dub.wav
ffprobe -v error -show_entries format=duration,size -of csv=p=0 out/Fukushima-English-Dub.wav
ffmpeg -nostdin -hide_banner -i out/Fukushima-English-Dub.wav -af ebur128 -f null - 2>&1 | grep " I:" | tail -1
