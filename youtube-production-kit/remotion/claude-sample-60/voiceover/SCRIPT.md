# Claude AI for YouTube: 60-second sample, voiceover script

Voice: the same cloned voice as the earlier sample (Chatterbox Multilingual zero-shot, reference = setting-2 clips from accent-samples.mp3; exaggeration 0.35, cfg 0.3, temperature 0.5). Fitted to 60 s with a 1.075x tempo.
TTS input is `narration.json` (Devanagari, English words written phonetically). Hinglish reading version:

| Scene | Time | Voiceover |
|---|---|---|
| 1 Hook | 0:00 | Kya aap jaante ho ki Claude AI aapke YouTube channel ke liye ek personal team member ki tarah kaam kar sakta hai? |
| 2 Understands | 0:08 | Ek aisa AI jo aapke channel ka niche, audience, writing style aur content strategy samajh sake, taaki aapko har baar sab kuch dobara na batana pade. |
| 3 Projects | 0:17 | Iske liye Claude mein Projects feature hai. Yahan aap apne channel ki details, purani video scripts aur YouTube Analytics ki files add kar sakte ho. |
| 4 Ideas | 0:27 | Ab jab bhi aap video ideas ya scripts maangoge, Claude aapke diye hue context ke aadhaar par zyada relevant suggestions taiyaar kar sakega. |
| 5 Skills | 0:36 | Aur Claude Skills ki madad se aap title writing, thumbnail ideas, engaging hooks aur analytics reports jaise kaamon ke liye reusable workflows bana sakte ho. |
| 6 Workflow | 0:45 | Yaani Claude aapke liye ek AI content assistant ban sakta hai, jo aapka content creation workflow aasaan kare. |
| 7 Outro | 0:53 | Aur aage hum ise step by step setup karna seekhenge. |

Rebuild: `python tools/build_audio.py <clips_dir>` (writes src/timing.ts, public/audio/*.wav, out/*.srt), then
`npx remotion render ClaudeSample60 out/claude_ai_sample_60sec.mp4 --codec=h264 --audio-codec=aac --crf=18`.
