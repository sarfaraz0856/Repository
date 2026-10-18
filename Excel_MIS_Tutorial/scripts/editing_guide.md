# Editing Guide — Sales MIS Report Tutorial

## Target specs
| Setting | Value |
|---|---|
| Resolution | 1920×1080 |
| Frame rate | 30 fps |
| Aspect ratio | 16:9 |
| Output format | MP4 (H.264 video, AAC audio) |
| Target duration | 12–15 minutes |

## Two versions

1. **Animated version (built):** `output/mis_tutorial_animated.mp4` is produced by `scripts/build_video.py`. It has an animated Excel 365 recreation, an AI voice, synthesized SFX and music, and burned-in plus `.srt` captions. Rebuild it with `python3 scripts/build_video.py`. See `output/README.txt`.
2. **Real-recording version (manual):** the rest of this guide covers editing genuine Excel 365 screen captures with a human voice.

## Status of source media (real-recording version)
- **Screen recordings:** NONE yet. `recordings/` is empty. Real Excel 365 clips must be recorded first (see `recording_guide.md`). Do **not** render a video from placeholders or fake Excel UI.
- **Audio:** PENDING. Human voiceover not yet recorded (see `voiceover_script.md`).
- Because both are missing, **the final video cannot be rendered yet.** This guide prepares the workflow so that once real clips + audio exist, assembly is straightforward.

## Editing principles (what to do / avoid)
**Do:** clean hard cuts between scenes; readable lower-third captions for formulas and KPI values; subtle 1.05–1.15× zoom-ins when highlighting a formula bar; keep Excel at 120–130% zoom so text is legible; consistent font for captions.
**Avoid:** excessive animations, fake Excel UI, fabricated/edited formula results, unnecessary sound effects, distracting transitions, unreadable (too-small) formulas.

## Scene/clip map (assemble in this order)
1. Clip 01 Intro + dashboard teaser → VO-01
2. Clip 02 Raw data → VO-02
3. Clip 03 Excel Table → VO-03
4. Clip 04 Sales Amount formula → VO-04
5. Clip 05 KPI summary → VO-05
6. Clip 06 Region SUMIFS → VO-06
7. Clip 07 Pivot Table → VO-07
8. Clip 08 Charts → VO-08
9. Clip 09 Slicers (insert) → VO-09
10. Clip 10 Slicer filter test → (part of VO-09)
11. Clip 11 Refresh → VO-11
12. Clip 12 Final dashboard + outro → VO-10 (formatting) then VO-12

## FFmpeg environment check
FFmpeg 6.1.1 is available in this environment and was verified. Because there are no real clips to inspect yet, no probe/concat has been run on actual media. The commands below are ready for when clips land in `recordings/`.

### 1. Probe each recorded clip (confirm 1920×1080 / 30 fps)
```bash
for f in recordings/*.mp4; do
  echo "== $f =="
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate,codec_name \
    -of default=noprint_wrappers=1 "$f"
done
```

### 2. Normalize any clip that is not exactly 1080p30
```bash
ffmpeg -i recordings/clipXX.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1" \
  -r 30 -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 192k recordings_norm/clipXX.mp4
```

### 3. Concatenate normalized clips (same codec/params)
```bash
# build list.txt: one line per clip -> file 'recordings_norm/clipXX.mp4'
ffmpeg -f concat -safe 0 -i list.txt -c copy output/mis_tutorial_video.mp4
```

### 4. Mux the final narration track (if audio is edited separately)
```bash
ffmpeg -i output/mis_tutorial_video.mp4 -i audio/narration_full.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  output/mis_tutorial_final.mp4
```

### 5. Burn-in subtitles (only after sync is done — see QA)
```bash
ffmpeg -i output/mis_tutorial_final.mp4 \
  -vf "subtitles=subtitles/subtitles.srt:force_style='FontSize=22,Outline=1'" \
  -c:v libx264 -crf 18 -c:a copy output/mis_tutorial_final_subbed.mp4
```

## Final export settings
- Container MP4, video H.264 High profile, CRF 18, `-pix_fmt yuv420p` (YouTube-safe), 30 fps CFR.
- Audio AAC 192 kbps, 48 kHz, loudness normalized to about −14 LUFS for YouTube.

## Before you call it "done"
- [ ] Every clip is real Excel 365 footage (no simulation).
- [ ] All formula results on screen match the verified numbers in `qa_checklist.md`.
- [ ] Narration is a real human voice.
- [ ] Subtitles are genuinely synchronized to the final cut (not the draft).
- [ ] Final file is 1920×1080, 30 fps, 16:9, MP4, 12–15 min.
Do not publish or mark complete until all boxes are checked.
