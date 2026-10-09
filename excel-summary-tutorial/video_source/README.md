# Video generator

Rebuilds `Excel_SUMIF_SUMIFS_Tutorial_Hindi.mp4` from scratch.

- `script.py`: scenes, Hinglish subtitles, Hindi narration text and on-screen actions
- `engine.py`: Excel-style screen renderer; SUMIFS/SUMIF/SUM are calculated live from the sheet data
- `tts.py`: system-generated Hindi voice (Kokoro `hm_omega`, offline, speed 1.15)
- `ribbon365.py`: Microsoft 365-style title bar and ribbon
- `make.py`: builds the 1.15x timeline and the audio mix
- `build.py` / `audio.py` / `render.py`: timeline, music + SFX mix, parallel frame rendering

```bash
pip install kokoro-onnx soundfile pillow numpy
# download kokoro-v1.0.int8.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases
python3 tts.py
python3 make.py
mkdir -p chunks; for i in 0 1 2 3; do python3 render.py $i 4 & done; wait
printf "file 'chunks/c%02d.mp4'\n" 0 1 2 3 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-16:TP=-1.5,aresample=48000 -c:a aac -b:a 192k -shortest final.mp4
```
