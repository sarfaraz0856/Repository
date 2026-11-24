#!/bin/bash
# run_short.sh KEY : builds one Short from cfg_KEY.json (timeline, score, narration mix, picture)
set -e
S=/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad; cd $S/short; K=$1; W=w_$K
SEC=$(python3 -c "import json;print(json.load(open('cfg_$K.json'))['sec'])")
python3 build_bshort.py cfg_$K.json | head -1
TOT=$(python3 -c "import json;print(json.load(open('$W/timeline.json'))['TOTAL'])")
CUTS=$(python3 -c "import json;t=json.load(open('$W/timeline.json'));print(','.join(str(c) for c in t['cuts'][1:]))")
REND=$(python3 -c "import json;t=json.load(open('$W/timeline.json'));print(round(t['starts'][-1]-0.15,2))")
python3 audio_short.py $TOT "$CUTS" 0.08 $REND $W/score.wav
ffmpeg -nostdin -v error -y -i $W/score.wav -af "loudnorm=I=-19:TP=-3:LRA=20,aresample=48000" -ac 2 -c:a pcm_f32le $S/doc/bed_$SEC.wav
(cd $S/doc && BOOST="$TOT,1,3.5,4.5" GAP=0.3 python3 mix.py G $SEC bed_$SEC.wav $S/short/$W/mix_raw.wav 0.03 0 full > /dev/null)
ffmpeg -nostdin -v error -y -i $W/mix_raw.wav -af "alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-14:TP=-1.0:LRA=11,aresample=48000" -c:a pcm_s16le $W/mix.wav
cp $W/mix.wav w/mix.wav 2>/dev/null || true
python3 -c "
import json,subprocess;c=json.load(open('$W/cmd.json'));c=[x.replace('w/mix.wav','$W/mix.wav') for x in c];subprocess.run(c,check=True)"
rm -f $S/doc/bed_$SEC.wav
OUT=$(python3 -c "import json;print(json.load(open('cfg_$K.json'))['out'])")
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $OUT
