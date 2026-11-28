# Hindi voiceover

`Chernobyl_1986_Hindi_Narration.mp4` is the joined 1:55 film with Hindi narration.

- **Voice:** Piper TTS, voice `hi_IN-pratham-medium` (an open model, run locally with `piper-tts`), length scale 1.05.
- **Lines and timings:** `lines.json` holds the text. `mix.py` holds the start times, placed so that nothing is spoken over the explosion (0:16.8–0:20), the loudspeaker announcement (1:20–1:27) or the final card.
- **Voice processing:** 75 Hz high-pass, warmth at 160 Hz, presence at 3.2 kHz, 3:1 compression, and a short room reverb.
- **Ducking:** the music and effects drop 7 dB under speech (9 dB during the fire scenes), with a 120 ms attack, 600 ms release and 250 ms look-ahead. They rise 1–1.5 dB in the silent beats.
- **Master:** −15 LUFS integrated, −1.9 dBTP.

```bash
python3 tts.py pratham 1.05      # -> pratham_NN.wav, one file per line
ffmpeg -i ../out/chernobyl_2min.mp4 -vn -ac 2 -ar 48000 -c:a pcm_f32le bed.wav
python3 mix.py                   # -> mix_pre.wav
ffmpeg -i mix_pre.wav -af "volume=-2.0dB,alimiter=limit=0.8:attack=5:release=120:level=disabled" mix.wav
```
