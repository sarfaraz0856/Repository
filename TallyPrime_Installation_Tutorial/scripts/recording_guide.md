# Recording Guide — TallyPrime Installation Tutorial

**Goal:** Capture a genuine screen recording of a real TallyPrime download + install on a real Windows PC. Nothing in this tutorial should be simulated or re-created in an editor.

> ⚠️ This project was authored in a Linux cloud environment with **no Windows, no display, and no TallyPrime**. Real screen recording MUST be done by you on a Windows PC. This guide tells you exactly how.

---

## 1. What you need
- A **Windows 10/11, 64-bit** PC with administrator rights.
- A **stable internet** connection (for the official download).
- A **screen recorder** (pick one):
  - **Xbox Game Bar** (built into Windows): press `Win + G`, then record. Good for quick capture.
  - **OBS Studio** (free, recommended): full control, 1920×1080 @ 30 FPS. Download from obsproject.com.
  - **PowerPoint → Insert → Screen Recording** (if you have Office).
- A **microphone** for voiceover (can be recorded separately — see voiceover_script.md).

## 2. Recorder settings
- Resolution: **1920×1080**
- Frame rate: **30 FPS**
- Capture: full screen (or the specific app window for installer close-ups)
- Cursor: **visible** (so viewers can follow clicks)
- Audio: record system audio OFF during narration if doing a separate voiceover; mic optional during capture

## 3. Before you hit record (prep checklist)
- Clean the desktop — hide personal icons, set a neutral wallpaper.
- Close email, chat, notifications (enable **Focus Assist / Do Not Disturb**).
- Set display scaling to 100% so Tally's UI is sharp.
- Open the browser fresh; clear unrelated tabs.
- Have the official page ready: `tallysolutions.com/download`.
- **On recording day, note the live version number, file name/size, and SHA-256** (these are [VERIFY LIVE] in the script).

---

## 4. Scene-by-scene capture plan

| Scene | Open this | Must be visible | Click / type | Verify | Pause? |
|---|---|---|---|---|---|
| 1 Intro | Desktop | Clean desktop | — | 1080p | Pause recording, do VO over it |
| 2 What is Tally | Slide/illustration | Captions only | — | No fake Tally UI | VO-only |
| 3 System prep | `Win+R` → `winver` | Windows version box | type `winver`, Enter | Version line visible | Pause after box shows |
| 4 Official site | Browser | Address bar padlock + `tallysolutions.com` | navigate to Download | Genuine site | — |
| 5 Download | Download page | Version, Download button, progress, Downloads folder | click Download; `Win+E` → Downloads | Real file name/size | Trim long wait |
| 6 Verify | PowerShell + file Properties | `Get-FileHash` output; Digital Signatures tab | run hash cmd; right-click→Properties | Hash matches official | Pause on output |
| 7 Install | Setup file | UAC prompt; Install New; App Path; progress; Start button | double-click; Yes; Install New; Install | Each real screen | Trim progress bar |
| 8 First launch | TallyPrime startup | Real startup screen/options | click Start TallyPrime | Install ≠ activation | Pause on screen |
| 9 Educational mode | Startup options | Education/learning option; Gateway | choose learning option | Date-rule note | — |
| 10 Company setup | Create Company | Company form (sample data) | type FAKE sample only | "Sample data" watermark | — |
| 11 Verify install | Gateway of Tally | Working app; Start-menu search | search "TallyPrime" | App actually opens | — |
| 12 Mistakes | Slide | Numbered list | — | — | VO-only |
| 13 Conclusion | End slide | Recap + subscribe | — | — | VO-only |

---

## 5. Recording tips
- Record each scene as a **separate clip** named `sceneNN_title.mp4` into `recordings/`.
- Do actions **slowly** — move the mouse deliberately so editing can zoom on clicks.
- If a step fails on camera, **re-record it**; do not fake the result.
- For the download wait and install progress, keep recording but you'll **speed-ramp** these in editing.
- Keep a short pause (2–3 s) before and after each click for clean cuts.

## 6. If you cannot screen-record right now
- You can still produce an **audio-only + slides** version using the voiceover script, clearly labelled as a walkthrough without live footage.
- Do **not** substitute fabricated screenshots or an HTML re-creation of Tally. If live footage is missing, the corresponding scene stays marked as **PENDING REAL CAPTURE** in the QA checklist.

---

## 7. Files you will produce
```
recordings/scene03_system_prep.mp4
recordings/scene04_official_site.mp4
recordings/scene05_download.mp4
recordings/scene06_verify.mp4
recordings/scene07_install.mp4
recordings/scene08_first_launch.mp4
recordings/scene09_education_mode.mp4
recordings/scene10_company_setup.mp4
recordings/scene11_verify_install.mp4
```
(Scenes 1, 2, 12, 13 can be slides + voiceover.)
