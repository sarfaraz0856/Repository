OUTPUT FOLDER
=============

mis_tutorial_animated.mp4
  Video : 1920x1080, 30 fps, 16:9, H.264
  Audio : AAC 48 kHz stereo, loudness-normalised to about -14 LUFS (YouTube level)
  Length: about 12-13 minutes (exact value: see the QA checklist / ffprobe)

WHAT IT IS - PLEASE READ BEFORE PUBLISHING
  * ANIMATED RECREATION of Microsoft Excel 365, NOT a live screen recording.
    The Excel window is drawn with HTML/CSS and rendered frame by frame. The
    title bar of every frame says "Animated recreation - AI voice".
  * The worksheets on screen are rendered from workbook/Sales_MIS_Report.xlsx
    itself: column widths, row heights, merged cells, colours, number formats,
    and the real formula of the selected cell in the formula bar. KPI, region,
    product, pivot and slicer numbers all come from the workbook data and match
    scripts/qa_checklist.md.
  * VOICE IS AI-GENERATED: Kokoro-82M text-to-speech (open source, Apache-2.0),
    Hindi male voice "hm_psi", run offline. It is not a human narrator. Say so
    in the YouTube description (and tick YouTube's "altered or synthetic
    content" disclosure if it applies to your upload).
  * Sound effects (mouse clicks, key presses, whoosh, chime) and the background
    music are synthesised from scratch by scripts/audio_fx.py - no third-party
    samples or tracks. Music ducks automatically under the voice.
  * Pivot Tables / charts / slicers shown are a visual walkthrough of the steps
    in scripts/recording_guide.md; the .xlsx itself still has no native pivots
    (openpyxl cannot create them). Build them in Excel 365 using those steps.

SUBTITLES
  subtitles/subtitles.srt is SYNCHRONISED to this video (timings come from the
  real voice clip lengths). Upload it to YouTube as the caption track, or keep
  the burned-in captions only.

VOICE QA
  scripts/voice_qa.md - every narration clip was translated back to English by
  Whisper (offline) from the audio alone, to check it is intelligible.

REBUILD / CHANGE THINGS
  python3 scripts/build_video.py
  - Narration text and screen actions: BEATS section of scripts/build_video.py
  - Pronunciation of English words: scripts/pronunciation.py
  - Other voice: MIS_VOICE=hf_alpha python3 scripts/build_video.py
    (Hindi voices: hm_psi, hm_omega, hf_alpha, hf_beta)
  - Excel look: scripts/excel_ui.py
  Needs: kokoro-onnx + model files, Chromium (Playwright), FFmpeg, openpyxl,
  numpy, soundfile, Pillow. Paths are set at the top of build_video.py.

REAL-RECORDING VERSION (optional)
  For a version made from genuine Excel screen captures and a human voice,
  follow scripts/recording_guide.md and scripts/editing_guide.md.
