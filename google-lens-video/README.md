# How Google Lens Works — 15 s UI animation (Remotion)

A 1920×1080, 30 fps, 450-frame (exactly 15 s) explainer video built with Remotion, React and TypeScript.
Rendered output: `../google_lens_ui_demo_15sec.mp4` (H.264 yuv420p video + AAC 320 kbps stereo audio with Hindi voiceover).

## Timeline
| Frames | Time | Scene |
|---|---|---|
| 0–90 | 0–3 s | Phone zooms in, title "HOW GOOGLE LENS WORKS", Lens camera opens with a circular reveal |
| 90–180 | 3–6 s | Focus pull, scan brackets, scanning line, feature dots, "SCANNING OBJECT...", live analysis panel |
| 180–300 | 6–10 s | Glowing detection outline, AI hub with connecting lines and data pulses to Object Detection / AI Image Recognition / Visual Search |
| 300–390 | 10–13 s | Results sheet slides up in the phone, matching product cards, "FIND SIMILAR PRODUCTS" |
| 390–450 | 13–15 s | Full interface, "SCAN. SEARCH. DISCOVER.", slow push-in and cinematic fade-out |

All artwork (phone, sneaker, icons) is original SVG/CSS. Fonts: Inter and Plus Jakarta Sans (bundled through @fontsource, no network needed).

## Audio
`public/soundtrack.wav` is an original soundtrack generated in code by `scripts/make_audio.py` (numpy only):
a soft chord pad that changes with each scene, a plucked arpeggio from 3 s, a light kick, bass and hats in the AI/results section,
and UI sound effects timed to the animation frames (zoom whoosh, tap, camera reveal, focus beep, scan sweep, glints,
outline shimmer, card pops, check-mark chimes, results swoosh, final three-note chord). Mastered to about -14 LUFS and faded out with the picture.
Regenerate with `python3 scripts/make_audio.py`.

## Hindi voiceover
Generated offline with Piper TTS, voice `hi_IN-pratham-medium` (`scripts/make_voiceover.sh` → `public/voiceover/vo_1..5.wav`),
then mixed into `soundtrack.wav` by `scripts/make_audio.py`, which lowers the music about 6 dB while the narrator speaks.

| Start | Line |
|---|---|
| 0.55 s | गूगल लेंस कैसे काम करता है? |
| 3.20 s | कैमरा, ऑब्जेक्ट को स्कैन करता है। |
| 6.15 s | फिर एआई उसे पहचानकर, अरबों तस्वीरों से मिलान करता है। |
| 10.20 s | और आपको मिलते हैं, मिलते-जुलते प्रोडक्ट्स। |
| 12.80 s | स्कैन करें, सर्च करें, खोजें! |

**License note:** the Piper `pratham` voice's training data is licensed CC BY-NC-SA 4.0 (non-commercial).
For commercial use, replace the five WAVs in `public/voiceover/` with a commercially licensed recording or TTS voice
(48 kHz mono, same file names), then run `python3 scripts/make_audio.py` and `npm run render`.

## Commands
```bash
npm install
npm run studio   # preview in Remotion Studio
npm run render   # writes out/google_lens_ui_demo_15sec.mp4
```

## Structure
- `src/GoogleLensDemo.tsx`: main composition (intro zoom, push-in, fades)
- `src/components/LensScreen.tsx`: phone screen (home screen, Lens camera, scanning, outline, results sheet)
- `src/components/AINetwork.tsx`: AI processing hub, connector lines, recognition cards
- `src/components/ScanPanel.tsx`, `ResultsPanel.tsx`, `Captions.tsx`: side panels and typography
- `src/components/Sneaker.tsx`: vector sneaker with colour palettes
- `src/theme.ts`, `src/anim.ts`: timing, layout constants, easing and motion-blur helpers

---

# 6-minute explainer (`GoogleLensExplainer6min`)

Full-length documentary built on the same visual identity, phone design, fonts, colours, instruments and narrator.
Output: `../google_lens_complete_explainer_6min.mp4` (1920×1080, 30 fps, 10,800 frames, H.264 + AAC).

- **Narration:** Hindi, same Piper voice `hi_IN-pratham-medium` at length-scale 0.9 with the same processing chain.
  Script with timings: `narration/NARRATION_SCRIPT_6min.md` (source: `narration/script_6min.json`; on-screen subtitles use the Hindi text).
- **Phone:** 1.19× larger than in the 15 s video (fully inside the frame, never moves after the opening fade-in).
- **Timeline:** `scripts/build_timeline.py` lays the 51 narration lines into 9 chapters (exactly 10,800 frames) → `src/long/timeline.json`.
  Animations are keyed to the sentence and word timings in that file, so visuals follow the voice.
- **Soundtrack:** `scripts/make_audio_long.py` loops the 15 s chord progression and instruments for 6 minutes, re-uses the same
  sound-effect designs at the matching UI events, mixes the narration with ~6 dB music ducking and normalises to -14 LUFS.

Rebuild everything:
```bash
pip install piper-tts numpy
PIPER_MODEL_DIR=/tmp/piper python3 scripts/make_narration_6min.py --speed 0.9   # voice lines (downloads model manually, see make_voiceover.sh)
python3 scripts/build_timeline.py
python3 scripts/make_audio_long.py
npm run render:long
```
Code: `src/long/` (`LongVideo.tsx`, `kit.tsx`, `subjects.tsx`, `art.tsx`, `scenes/*.tsx`).
Product names, stores and results shown are illustrative mockups, not real search results.
The `pratham` voice is licensed CC BY-NC-SA 4.0 (non-commercial); replace the WAVs in `public/long/vo/` for commercial use.
