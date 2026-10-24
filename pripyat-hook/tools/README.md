# Pripyat hook: build scripts

**Final hook** (`../hook-final/`) aapke `export.mp4` se `hook_audio.py`, `hook_video.py` aur `report_pdf.py` ke through bana hai. Scene 01 aur Scene 02 ke pehle wale drafts baaki scripts se bane the.

## Final hook

| Script | Kya karta hai |
|---|---|
| `voice.py` | Kokoro TTS (`hm_omega`, Hindi) se ek line banata hai. Arguments: text, speed, aur "..." ka pause (`-1` dene par natural pause rehta hai) |
| `hook_audio.py` | Voice ke hisaab se timeline banata hai, aur poora mix bhi: drone ducking ke saath, wind, saare SFX. Voice peak −3.5 dB, mix −14 LUFS |
| `sfx_hook.py` | Parda, metal creak, Geiger, rumble, dhamaka, bus engine, hawa ka jhonka, title hit (sab synthesize kiye hue) |
| `audio_synth.py` | Drone, wind howl, crow caw |
| `scene02_audio.py` | Room tone aur page flutter (functions), aur pehle wala Scene 02 mix |
| `hook_video.py` | Export ke shots ko timeline par re-time karta hai. Saath mein fade-in, dhamake ka flash/shake, CHERNOBYL title, grade, 1080p25 14 Mbps |
| `report_pdf.py` | A4 review report |
| `fonts/BebasNeue-Regular.ttf` | Title font (SIL Open Font License, `fonts/OFL-BebasNeue.txt`) |

```bash
pip install kokoro-onnx soundfile scipy pyloudnorm reportlab
# Model files: github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
CHAIN="aresample=48000,rubberband=pitch=0.917:formant=preserved,highpass=f=75,equalizer=f=160:t=q:w=1.0:g=2.5,equalizer=f=3200:t=q:w=1.2:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,aformat=channel_layouts=stereo"
# har line ke liye (text, pause aur speed ../hook-final/voice_lines/lines.tsv mein hain):
python3 voice.py MODELS_DIR voice/raw_01.wav "<text>" <speed> <pause> && ffmpeg -i voice/raw_01.wav -af "$CHAIN" -c:a pcm_f32le voice/v_01.wav
python3 hook_audio.py voice out                      # timeline.json + mixes + stems
python3 hook_video.py export.mp4 out/timeline.json fonts/BebasNeue-Regular.ttf out
ffmpeg -i out/HOOK_FINAL_video_only.mp4 -i out/HOOK_mix_WITH_VOICE.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest HOOK_FINAL_WITH_VOICE.mp4
```

## Pehle wale drafts (Scene 01 / Scene 02)

| Script | Kya karta hai |
|---|---|
| `mix.py` | Scene 01 ka mix (wind 15%, crow 10%, music 10%) |
| `render.py` | Scene 01 ka placeholder visual: foggy Soviet avenue, slow forward dolly, 1080p30 |
| `render_s02.py` | Scene 02 ka placeholder visual: abandoned classroom |
| `ai_clip_s02.py` | ChatGPT still se Scene 02 ka 5 s clip |
