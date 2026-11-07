#!/bin/bash
# narrate.sh SECTION OUTDIR : cloned-voice narration for one chapter, mixed over OUTDIR/soundtrack_raw.wav
# -> OUTDIR/mix_SECTION.wav. Lines come from lines.json[SECTION] (already synthesised as qf_SECTION_i.wav).
set -e
SEC=$1; OUT=$2
S=/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad
cd $S/doc
N=$(python3 -c "import json;print(len(json.load(open('lines.json'))['$SEC']))")
cd $S && TTS_HOME=$S/vc/models COQUI_TOS_AGREED=1 nice vcenv/bin/python - <<PY 2>&1 | grep -v -i "warn\|^\s" | tail -1
from TTS.api import TTS
tts = TTS("voice_conversion_models/multilingual/vctk/freevc24")
for i in range($N): tts.voice_conversion_to_file(source_wav=f'doc/qf_${SEC}_{i}.wav', target_wav='vc/ref/ref.wav', file_path=f'doc/vc_qf_${SEC}_{i}.wav')
print('converted $N')
PY
cd $S/doc
EQ="highpass=f=70,afftdn=nf=-42:nr=8,deesser=i=0.35,equalizer=f=125:t=q:w=0.9:g=4,equalizer=f=320:t=q:w=1.2:g=-2.5,equalizer=f=2800:t=q:w=1.2:g=1.8,highshelf=f=9000:g=1.2,acompressor=threshold=-24dB:ratio=2.5:attack=10:release=180:makeup=2,aresample=48000"
for i in $(seq 0 $((N-1))); do ffmpeg -hide_banner -loglevel error -y -i vc_qf_${SEC}_$i.wav -af "$EQ" -c:a pcm_f32le G_${SEC}_$i.wav; done
ffmpeg -hide_banner -loglevel error -y -i $OUT/soundtrack_raw.wav -af "loudnorm=I=-19:TP=-3:LRA=20,aresample=48000" -ac 2 -ar 48000 -c:a pcm_f32le bed_${SEC}.wav
GAP=0.36 python3 mix.py G $SEC bed_${SEC}.wav $OUT/mix_${SEC}.wav 0.045 0 full | tr '\n' ' '; echo
rm -f -- bed_${SEC}.wav
