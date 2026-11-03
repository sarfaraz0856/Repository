# Hindi narration for the full film (1.2x cut)

These files make `../../../Chernobyl_1986_Hindi_Narrated_Film.mp4`: the whole 13-chapter film played at 1.2x speed (10:50), with Hindi narration in the director's own cloned voice.

## How the voice is made

1. **Base speech:** `synth_piper.py` reads every line of `lines_full.json` with Piper TTS (`hi_IN-pratham-medium`), phrase by phrase.
   - Settings: length scale 0.90, noise 0.667, noise-w 0.85.
   - Pauses are added after each phrase, scaled ×0.833 to match the 1.2x pace. Speech is generated at that pace natively, never time-stretched.
2. **Voice cloning:** each line goes through FreeVC-24, a voice-conversion model (Coqui TTS, `voice_conversion_models/multilingual/vctk/freevc24`). It takes the director's voice from a 54-second reference recording.
   - The recording is private and is not included here.
3. **Polish:** each line is processed with ffmpeg:
   - 70 Hz high-pass, light de-noise and de-essing
   - +4 dB at 125 Hz, −2.5 dB at 320 Hz, +1.8 dB at 2.8 kHz, and a high shelf at 9 kHz
   - 2.5:1 compression
4. **Mix:** `mix.py` places each line at its start time ÷ 1.2, with at least 0.36 s between lines.
   - It adds a small room and a soft long hall.
   - It ducks the music bed 8.5 dB under speech, using a 0.15 s attack and 0.8 s release.
   - `fitcheck.py` checks that no line runs past its chapter, the explosion, the evacuation announcement or THE END.
5. **Soundtrack:** the film's soundtrack is sped up 1.2x with Rubber Band at the same pitch.
6. **Picture:** the picture is sped up 1.2x with every frame kept, at 28.8 fps. The master is −15 LUFS.
7. **Encode:** `encode_final.sh` writes the 720p film and the two 1080p parts.
