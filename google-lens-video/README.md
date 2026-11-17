# How Google Lens Works — 15 s UI animation (Remotion)

A 1920×1080, 30 fps, 450-frame (exactly 15 s) explainer video built with Remotion, React and TypeScript.
Rendered output: `../google_lens_ui_demo_15sec.mp4` (H.264 yuv420p video + AAC 320 kbps stereo audio).

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
