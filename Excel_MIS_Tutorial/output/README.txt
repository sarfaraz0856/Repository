OUTPUT FOLDER
=============

mis_tutorial_animated.mp4  (DELIVERED)
  - 1920x1080, 30 fps, 16:9, H.264 MP4, ~13.5 minutes.
  - An ANIMATED RECREATION of Excel 365 (HTML/CSS rendered to frames with a
    moving cursor, highlights and scene badges), NOT a live Excel screen
    recording. Every frame carries a watermark stating this.
  - Content is the real, validated workbook data (same formulas and numbers
    as workbook/Sales_MIS_Report.xlsx; see scripts/qa_checklist.md).
  - The full Hinglish narration is burned in as on-screen captions. There is
    NO audio track: no local TTS is available and the vidIQ credit balance was
    insufficient to synthesize voice/music at build time.
  - Built reproducibly by scripts/build_video.py (Chromium + FFmpeg).

TO ADD VOICE / MUSIC LATER
  - The caption timing is paced to natural speaking speed, so it is a ready
    sync-bed. Generate the Hinglish voiceover (see scripts/voiceover_script.md),
    then mux per scripts/editing_guide.md (ffmpeg -map video -map audio).
  - A real Microsoft Excel 365 screen-recorded version can replace the
    animation using scripts/recording_guide.md.
