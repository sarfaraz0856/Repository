#!/bin/bash
# English dub track for the extended cut: English lines (Piper en_US-ryan-high -> FreeVC to the narrator's voice -> same EQ as
# the Hindi), mixed over the same music-and-effects beds, cut exactly like ext_final.sh. -> out/Chernobyl-English-Dub.wav
set -e
S=/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad; R=/home/user/Repository/chernobyl-documentary
C=$S/chernobyl/out; cd $S/dub; mkdir -p out w
EQ="highpass=f=70,afftdn=nf=-42:nr=8,deesser=i=0.35,equalizer=f=125:t=q:w=0.9:g=4,equalizer=f=320:t=q:w=1.2:g=-2.5,equalizer=f=2800:t=q:w=1.2:g=1.8,highshelf=f=9000:g=1.2,acompressor=threshold=-24dB:ratio=2.5:attack=10:release=180:makeup=2,aresample=48000"
for f in V_*.wav; do ffmpeg -nostdin -v error -y -i $f -af "$EQ" -c:a pcm_f32le G_${f#V_}; done
LN="loudnorm=I=-19:TP=-3:LRA=20,aresample=48000"
F32="-ac 2 -ar 48000 -c:a pcm_f32le"
# beds
ffmpeg -nostdin -v error -y -i $C/intro/soundtrack_raw.wav -af "$LN" $F32 w/bed_intro.wav
ffmpeg -nostdin -v error -y -i $R/Chernobyl_1986_Full_Film_Part_A_1080p.mp4 -i $R/Chernobyl_1986_Full_Film_Part_B_1080p.mp4 \
  -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1,rubberband=tempo=1.2,aresample=48000,$LN" $F32 w/bed_full12.wav
for k in 1 2 3 4 5 6; do ffmpeg -nostdin -v error -y -i $C/cx$k/soundtrack_raw.wav -af "rubberband=tempo=1.2,aresample=48000,$LN" $F32 w/bed_cx$k.wav; done
# mixes
BOOST="16.5,0.3,3,4" GAP=0.36 python3 mix.py G intro w/bed_intro.wav w/mix_intro.wav 0.045 0 full | tr '\n' ' '; echo
BOOST="50,3,2.5,5.0" GAP=0.36 python3 mix.py G full12 w/bed_full12.wav w/mix_full12.wav 0.045 0 full | tr '\n' ' '; echo
for k in 1 2 3 4 5 6; do GAP=0.36 python3 mix.py G cx$k w/bed_cx$k.wav w/mix_cx$k.wav 0.045 0 full | tr '\n' ' '; echo; done
LIM="alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=14,aresample=48000"
# segments, same lengths and order as the picture
ffmpeg -nostdin -v error -y -i w/mix_intro.wav -af "apad,atrim=0:16.5,$LIM,apad,atrim=0:16.528,afade=t=out:st=16.47:d=0.03" $F32 w/n00.wav
ffmpeg -nostdin -v error -y -i w/mix_full12.wav -af "atrim=0:638.6,afade=t=out:st=635.3:d=3.3,$LIM,apad,atrim=0:640.1" $F32 w/film.wav
for k in 1 2 3 4 5 6; do ffmpeg -nostdin -v error -y -i w/mix_cx$k.wav -af "apad,atrim=0:50,$LIM,afade=t=in:d=0.02,afade=t=out:st=49.97:d=0.03" $F32 w/n0$k.wav; done
cut() { ffmpeg -nostdin -v error -y -ss $1 -t $2 -i w/film.wav -af "afade=t=in:d=0.02,afade=t=out:st=$(python3 -c "print($2-0.03)"):d=0.03" $F32 w/$3.wav; }
cut 0 45.8333 o01; cut 45.8333 50 o02; cut 95.8333 50 o03; cut 145.8333 54.1667 o04; cut 200 150 o05; cut 350 250 o06; cut 600 40.1 o07
: > w/list.txt; for f in n00 o01 n01 o02 n02 o03 n03 o04 n04 o05 n05 o06 n06 o07; do echo "file '$PWD/w/$f.wav'" >> w/list.txt; done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i w/list.txt -af "loudnorm=I=-15:TP=-1.5:LRA=14,aresample=48000,apad,atrim=0:956.739" -ac 2 -ar 48000 -c:a pcm_s16le out/Chernobyl-English-Dub.wav
ffmpeg -nostdin -v error -y -i out/Chernobyl-English-Dub.wav -c:a libmp3lame -b:a 320k out/Chernobyl-English-Dub.mp3
for f in out/*; do ffprobe -v error -show_entries format=duration,size -of csv=p=0 $f; done
ffmpeg -nostdin -hide_banner -i out/Chernobyl-English-Dub.wav -af ebur128 -f null - 2>&1 | grep " I:" | tail -1
