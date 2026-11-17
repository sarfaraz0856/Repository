# How Google Lens Works — 15 s UI animation (Remotion)

A 1920×1080, 30 fps, 450-frame (exactly 15 s) explainer video built with Remotion, React and TypeScript.
Rendered output: `../google_lens_ui_demo_15sec.mp4` (H.264, yuv420p).

## Timeline
| Frames | Time | Scene |
|---|---|---|
| 0–90 | 0–3 s | Phone zooms in, title "HOW GOOGLE LENS WORKS", Lens camera opens with a circular reveal |
| 90–180 | 3–6 s | Focus pull, scan brackets, scanning line, feature dots, "SCANNING OBJECT...", live analysis panel |
| 180–300 | 6–10 s | Glowing detection outline, AI hub with connecting lines and data pulses to Object Detection / AI Image Recognition / Visual Search |
| 300–390 | 10–13 s | Results sheet slides up in the phone, matching product cards, "FIND SIMILAR PRODUCTS" |
| 390–450 | 13–15 s | Full interface, "SCAN. SEARCH. DISCOVER.", slow push-in and cinematic fade-out |

All artwork (phone, sneaker, icons) is original SVG/CSS. Fonts: Inter and Plus Jakarta Sans (bundled through @fontsource, no network needed).

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
