# Claude AI & Claude Code Complete Guide — 60-second sample

Sample episode: **"Claude AI Interface Explained: Where to Find Every Important Option"** (Hindi / Hinglish).

## v2 (current): built on your real Claude screen

| Path | What |
|---|---|
| `output/claude_ai_interface_sample_60s_v2.mp4` | **v2 sample**: your real Claude home screen (shown as Pro, model Opus 5.5) + genuine Claude Code recording; 1920×1080, 30 fps, 60.0 s, burned-in Hinglish captions |
| `output/claude_ai_interface_sample_60s_v2_clean_softsub.mp4` | Same, captions as a selectable SRT track |
| `output/claude_ai_interface_sample_60s_v2_music_sfx_only.mp4` | No narration, for your own voice-over |
| `output/QC_report_v2_A4.pdf` | v2 production + QC report (A4) |
| `voiceover/narration_v2.md`, `subtitles/claude_ai_interface_sample_60s_v2.hinglish.srt` | v2 narration and subtitles |
| `storyboard_v2.md` | v2 shot list |
| `assets/user_screenshots/claude_home_user_original.png` | Your original screenshot (unchanged) |
| `graphics/claude_home_pro_plate.png` | 1080p plate made from it (Pro label, Opus 5.5): `scripts/prepare_screenshot_plate.py` |
| `graphics/scenes_v2.html`, `graphics/thumbnail_concept_v2_1280x720.png` | v2 scene renderer and thumbnail |

v2 rebuild: `prepare_screenshot_plate.py` → `make_voiceover.py … narration_lines_v2.json voiceover --max_speed 1.18 --tag _v2`
→ `make_captions.py` → `SCENES_HTML=scenes_v2.html node render_frames.js …` → `make_audio.py … audio_cues_v2.json _v2`
→ `VERSION=_v2 RENDER_DIR=… assemble_video.sh` → `qc_check.py` → `make_report_v2.py`.

## v1 (first sample, illustrative demo UI)

| Path | What |
|---|---|
| `output/claude_ai_interface_sample_60s.mp4` | **The sample**: 1920×1080, 30 fps, 60.0 s, H.264 + AAC, burned-in Hinglish captions |
| `output/claude_ai_interface_sample_60s_clean_softsub.mp4` | Same, without burned-in captions; SRT included as a selectable subtitle track |
| `output/claude_ai_interface_sample_60s_music_sfx_only.mp4` | No narration, for recording a human voice-over at the same timings |
| `output/QC_report_A4.pdf` | Production and QC report (A4) |
| `output/qc_results.json` | Raw automated QC results |
| `subtitles/claude_ai_interface_sample_60s.hinglish.srt` | Hinglish subtitles |
| `voiceover/narration.md` | Final narration (Hinglish + Devanagari TTS script) with timings |
| `voiceover/narration_hm_omega.wav` | Narration stem (Kokoro TTS, Hindi voice) |
| `storyboard.md` | Shot-by-shot storyboard, terminal time-map, list of verified interface facts |
| `recording_checklist.md` | Real screen recordings you still need to capture (to replace the demo-UI scenes) |
| `recordings/claude_code_terminal_raw.mp4` | **Genuine** screen recording of Claude Code CLI 2.1.310 (fictional demo project) |
| `assets/demo_project_todo-app/` | The fictional demo project used in the terminal demo |
| `assets/audio/` | Original procedural music bed, SFX stem, premaster mix |
| `graphics/scenes.html` | Scene renderer (all motion graphics, demo UI, highlights, captions) |
| `graphics/thumbnail_concept_1280x720.png` | Thumbnail concept |
| `scripts/` | Everything used to build the video (see below) |

## Rebuild pipeline

```bash
# 0) one-time: offline Hindi TTS
pip install kokoro-onnx soundfile
#    model files: kokoro-v1.0.onnx + voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
# 1) genuine terminal recording (Xvfb + xterm + ffmpeg x11grab); needs a logged-in `claude` CLI
scripts/record_terminal.sh
ffmpeg -i recordings/claude_code_terminal_raw.mp4 -vf crop=1518:700:0:0 -q:v 2 $TERM_FRAMES/f%04d.jpg
# 2) narration (phrase-by-phrase, auto-fitted to scene windows) and captions
python3 scripts/make_voiceover.py $MODEL_DIR scripts/narration_lines.json voiceover --max_speed 1.22
python3 scripts/make_captions.py voiceover/narration_timings_hm_omega.json subtitles/claude_ai_interface_sample_60s.hinglish.srt subtitles/captions_burnin.json
# 3) frames -> two silent masters (with / without captions)
node scripts/render_frames.js subtitles/captions_burnin.json $TERM_FRAMES $RENDER_DIR/video_caps.mp4 $RENDER_DIR/video_clean.mp4
# 4) music + sfx + ducked mix, loudness normalisation, mux
ffmpeg -i voiceover/narration_hm_omega.wav -ar 48000 -ac 1 narr48.wav && python3 scripts/make_audio.py narr48.wav assets/audio
RENDER_DIR=$RENDER_DIR scripts/assemble_video.sh
# 5) QC
python3 scripts/qc_check.py output/claude_ai_interface_sample_60s.mp4 subtitles/claude_ai_interface_sample_60s.hinglish.srt voiceover/narration_timings_hm_omega.json output/qc_results.json
```

Scripts refuse to overwrite existing recordings and outputs. Rename old files before rebuilding.
