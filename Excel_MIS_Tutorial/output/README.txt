OUTPUT FOLDER
=============

mis_tutorial_no_voice.mp4   (UPLOAD THIS ONE)
  Same video with NO voiceover and NO burned-in subtitles: background music + sound
  effects (mouse clicks, key presses, whoosh, chime) only. 1920x1080, 30 fps, 10:45,
  -16 LUFS, true peak -3 dBFS. Title bar watermark: "Animated recreation".
  Build: MIS_MODE=novoice python3 scripts/build_video.py

  Captions for it (upload separately in YouTube Studio -> Subtitles):
    subtitles/youtube_english.srt   - English
    subtitles/youtube_hinglish.srt  - Hinglish (choose "Hindi (Latin)" or Hindi)
  Each cue stays on screen for its whole step. Build: python3 scripts/make_subtitles.py

  thumbnails/thumbnail_A_raw_to_dashboard.jpg, _B_kpi_dashboard.jpg, _C_pivot_slicer.jpg
    1280x720 for YouTube "Test & compare". Build: python3 scripts/make_thumbnails.py
  youtube/YouTube_Upload_Kit.pdf (A4) - title, description with chapters, tags,
    hashtags, upload settings, practice-file sharing steps.
    Build: python3 scripts/make_upload_kit.py

  Practice files for viewers (share via Google Drive, link goes in the description):
    practice/Sales_MIS_Practice.xlsx - same 180 rows and dashboard layout as the video,
      results removed. Start_Here sheet: 9 tasks with video times + a 16-point
      self-check (Correct / Check again, score out of 16). Yellow cells = fill in.
    practice/Sales_MIS_Solution.xlsx - the finished workbook shown in the video.
    Build: python3 scripts/make_practice_file.py

mis_tutorial_animated.mp4   (earlier version, kept)
  With AI voice and burned-in Hinglish captions; subtitles/subtitles.srt belongs to it.

mis_tutorial_animated.mp4
  Video : 1920x1080, 30 fps, 16:9, H.264
  Audio : AAC 48 kHz stereo, loudness-normalised to about -14 LUFS (YouTube level)
  Length: 10 min 45 s (645 s) - played 1.15x faster than the first AI-voice build;
          the opening title card is 2 seconds

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
    Hindi male voice "hm_psi", run offline (speed 1.135). It is not a human narrator. Say so
    in the YouTube description (and tick YouTube's "altered or synthetic
    content" disclosure if it applies to your upload).
  * On-screen text (cards, labels, dialogs) is English; the captions/subtitles are
    Hinglish (romanised).
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
