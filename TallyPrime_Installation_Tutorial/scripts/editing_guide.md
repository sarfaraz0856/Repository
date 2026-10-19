# Editing Guide — TallyPrime Installation Tutorial

**Target:** 1920×1080, 30 FPS, 16:9, MP4 (H.264 + AAC), 12–15 minutes.
**Editors you can use:** DaVinci Resolve (free), Shotcut (free), CapCut, Premiere Pro, or FFmpeg for simple joins.

> 🎬 **Edit status:** No footage exists yet, so no edit/render has been done. This guide is ready to follow once `recordings/` and `audio/` are populated.

---

## 1. Project setup
- New project at **1920×1080, 30 FPS**.
- Create a bin/folder structure matching `recordings/`, `audio/`, `assets/`.
- Import all `sceneNN_*.mp4` clips and `sceneNN.wav` voiceover takes.

## 2. Assemble scenes in order
Lay clips on the timeline in scene order 1→13 (see `tallyprime_installation_script.md` timing table). For VO-only scenes (1, 2, 12, 13) place a title/illustration slide from `assets/`.

## 3. Sync narration
- Drop each `sceneNN.wav` under its matching clip.
- Nudge audio so instructions land **as the action happens** (e.g. "Yes dabaiye" exactly when the UAC prompt is on screen).
- Keep a consistent ~0.3 s lead so narration slightly precedes the click.

## 4. Remove dead air & long waits
- Cut silences > 1 s between sentences.
- **Speed-ramp** the download progress (Scene 5) and install progress (Scene 7) to 4×–8× so each stays a few seconds.
- Remove any fumbles/re-takes.

## 5. Captions & titles
- Add **section titles** at each scene start (lower-third or full card): "Download", "Install", "Educational Mode", etc.
- Burn-in **key captions** (e.g. "Install ≠ License Activation", the voucher-date rule, "SAMPLE DATA — FOR LEARNING ONLY").
- Add subtitles from `subtitles/tallyprime_subtitles.srt` (re-time against final narration — see below).
- **Do not** place text over installer buttons or important dialogs.

## 6. Highlights & zooms
- Subtle zoom/pan on: the address bar padlock, the hash output, each installer button as it's clicked.
- Optional click-highlight (soft circle) on the cursor at decision points.
- Keep animations subtle; avoid flashy transitions — simple cuts/dissolves.

## 7. Audio cleanup
- Noise reduction on the voiceover; normalize to about **−16 LUFS** (YouTube target).
- Background music bed at **−26 to −30 dB** under narration; duck under voice.
- Ensure labels remain readable and audio is clear throughout.

## 8. Subtitle re-timing
The provided `.srt` is a **draft** timed to the script estimates. After the final cut:
- Export/auto-generate timings from the real narration, or
- Manually adjust each cue to match the final audio, then re-import.

## 9. Export settings
- Format: **MP4**, codec **H.264**, audio **AAC 320 kbps**.
- Resolution **1920×1080**, **30 FPS**, bitrate ~12–16 Mbps (VBR).
- Output to `output/tallyprime_installation_tutorial.mp4`.

### FFmpeg reference (simple concat of finished scene clips)
```bash
# 1) list.txt lists each clip:  file 'recordings/scene03_system_prep.mp4'  (etc.)
ffmpeg -f concat -safe 0 -i list.txt -c:v libx264 -r 30 -s 1920x1080 \
  -c:a aac -b:a 320k output/tallyprime_installation_tutorial.mp4
```
(Only works when all clips share codec/params; otherwise re-encode each first.)

## 10. Missing-footage policy
If any scene's real capture is missing, **do not fabricate it**. Leave a clearly labelled "PENDING CAPTURE" placeholder card and record the gap in `qa_checklist.md`. Never export an empty/placeholder MP4 and call it the finished tutorial.

---

## Missing scenes tracker (fill in during edit)
- [ ] Scene 3 — system prep
- [ ] Scene 4 — official site
- [ ] Scene 5 — download
- [ ] Scene 6 — verify
- [ ] Scene 7 — install
- [ ] Scene 8 — first launch
- [ ] Scene 9 — educational mode
- [ ] Scene 10 — company setup
- [ ] Scene 11 — verify install
