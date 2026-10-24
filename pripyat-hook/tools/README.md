# Pripyat hook: build scripts

Scene 01 aur Scene 02 ki saari files inhi scripts se bani hain. Inhe agle scenes ke liye reuse kar sakte ho.

| Script | Kya karta hai |
|---|---|
| `voice.py` | Kokoro TTS (`hm_omega`, Hindi) se line banata hai aur "..." wala pause set karta hai (text, speed, pause arguments) |
| `audio_synth.py` | Hook ka drone (0:00 se 0:42), wind howl (0:00 se 0:46) aur distant crow caw synthesize karta hai |
| `mix.py` | Cue sheet ke levels par Scene 01 mix karta hai (wind 15%, crow 10%, music 10%) aur result −14 LUFS par aata hai |
| `render.py` | Scene 01 placeholder visual: foggy Soviet avenue, slow forward dolly, 1080p30 |
| `scene02_audio.py` | Scene 02: room tone (12%), page flutter at 0:08 (20%), voice, aur 0:05 se continue hota wind/drone bed |
| `render_s02.py` | Scene 02 placeholder visual: abandoned classroom, floor par khuli kitaab, push-in, panna 0:08 par uthta hai |
| `ai_clip_s02.py` | Scene 02 final: ChatGPT still se 5 s clip (push-in, panna 0:08 par uthta hai, dhool, same grade) |

```bash
pip install kokoro-onnx soundfile scipy pyloudnorm
# Model files: github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
python3 voice.py MODELS_DIR work/voice_raw.wav
ffmpeg -i work/voice_raw.wav -af "aresample=48000,rubberband=pitch=0.917:formant=preserved,highpass=f=75,equalizer=f=160:t=q:w=1.0:g=2.5,equalizer=f=3200:t=q:w=1.2:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,aformat=channel_layouts=stereo" -c:a pcm_f32le work/voice_proc.wav
python3 audio_synth.py work
python3 mix.py work out
python3 render.py frames 0 150      # frames ko 4 processes mein split kar sakte ho
ffmpeg -framerate 30 -i frames/f_%04d.png -i out/Scene01_mix_WITH_VOICE.wav -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac -b:a 256k out.mp4
# Scene 02
python3 voice.py MODELS_DIR work/voice_raw_s02.wav "स्कूल में बच्चों की किताबें... आज भी खुली पड़ी हैं।" 0.97 0.5   # + same ffmpeg chain -> work/voice_proc_s02.wav
python3 scene02_audio.py work out02
python3 render_s02.py frames02 0 150
python3 ai_clip_s02.py Scene02_source_chatgpt.png frames02ai 0 150   # final clip from the ChatGPT image
```
