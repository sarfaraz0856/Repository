#!/bin/bash
# assemble_bh.sh DIR "TITLE" CHUNK... : one 60 s Bhopal chapter from rendered chunks (in order), five captions
# at the standard offsets (e0 1.0, e1 6.4, e2 16.2, e3 31.2, e4 46.2; override with CAPS="..."), fade in, a fade out
# at the end (FADEOUT=1), and DIR/mix_<DIR>.wav (score + narration) mastered to -15 LUFS -> DIR/bhopal_<DIR>.mp4
set -e
D=$1; TITLE=$2; shift 2
cd "$(dirname "$0")/out/$D"
printf "file '%s'\n" "$@" > chunks.txt
read -r -a C <<< "${CAPS:-1.0 6.4 16.2 31.2 46.2}"
FO=""; [ "${FADEOUT:-1}" = 1 ] && FO=",fade=t=out:st=58.4:d=1.6"
ffmpeg -hide_banner -loglevel warning -y \
  -f concat -safe 0 -i chunks.txt \
  -thread_queue_size 256 -itsoffset ${C[0]} -framerate 24 -i titles/e0/%04d.png \
  -thread_queue_size 256 -itsoffset ${C[1]} -framerate 24 -i titles/e1/%04d.png \
  -thread_queue_size 256 -itsoffset ${C[2]} -framerate 24 -i titles/e2/%04d.png \
  -thread_queue_size 256 -itsoffset ${C[3]} -framerate 24 -i titles/e3/%04d.png \
  -thread_queue_size 256 -itsoffset ${C[4]} -framerate 24 -i titles/e4/%04d.png \
  -i mix_$D.wav \
  -filter_complex "
    [0:v]settb=1/24,fps=24,format=yuv444p[base];
    [base][1:v]overlay=0:0:eof_action=pass:format=auto[t0];
    [t0][2:v]overlay=0:0:eof_action=pass:format=auto[t1];
    [t1][3:v]overlay=0:0:eof_action=pass:format=auto[t2];
    [t2][4:v]overlay=0:0:eof_action=pass:format=auto[t3];
    [t3][5:v]overlay=0:0:eof_action=pass:format=auto[t4];
    [t4]fade=t=in:st=0:d=1.0$FO,format=yuv420p[v];
    [6:a]alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=18,aresample=48000[a]" \
  -map "[v]" -map "[a]" -t 60.0 \
  -c:v libx264 -preset slow -crf 18 -maxrate 12M -bufsize 24M -profile:v high -level 4.1 -pix_fmt yuv420p \
  -x264-params "aq-mode=3:psy-rd=1.0,0.15:deblock=-1,-1" -tune grain \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -metadata title="$TITLE" bhopal_$D.mp4
ffprobe -v error -show_entries format=duration,size -of default=nw=1 bhopal_$D.mp4
ffmpeg -hide_banner -loglevel error -y -i bhopal_$D.mp4 -vf "fps=1/5,scale=480:-1,tile=4x3" -frames:v 1 contact_$D.jpg
