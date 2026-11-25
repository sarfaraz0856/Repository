# Channel video production – standing preferences

Tech explainer videos for the creator's YouTube channel (so far: Google Lens, UPI, FASTag, OTP).
Code: `google-lens-video/` (Remotion). Finished outputs: `UPI_Documentary/`, `FASTag_Documentary/`, etc.

## Language of deliverables (IMPORTANT)
- Every write-up / read-me / instructions / summary in the upload kit must be given in **both Hinglish AND English**
  (e.g. `00-read-me-pehle.txt` in Hinglish + `00-read-me-first-english.txt` in English; same for checklists and notes).
- Titles, descriptions and chapters: Hindi (main) + Hinglish (Roman) + English.
- Subtitles: Hindi (Devanagari), English and Hinglish (Roman) SRT – Hinglish is uploaded as "Hindi (Latin)".
- Chat replies to the creator: Hindi/Hinglish.

## Voice & narration
- Always the creator's own cloned voice (Chatterbox Multilingual, `scripts/make_voice.py`, same reference clip and settings).
- Narration in conversational **Hinglish** (English words where natural), never heavy/formal Hindi.
- Ending: "अगर आपको ये video अच्छा लगा हो… like / share / subscribe … Thank you!"
- QC every line with speech recognition; re-record lines with dropped / repeated / garbled words; trim junk sound after the last word.
- When the creator lists timestamps, fix the voice at those exact times, then re-check them.

## Video style & workflow
- 30 s sample first → wait for approval → full video (target 8–10 min, ≥ 8 min for mid-roll ads).
- 1920×1080, 30 fps, H.264 + AAC, -14 LUFS. No burned-in subtitles. Soft background music (no harsh ticks/hats/buzz),
  smooth ducking under the voice.

## Every video must look & sound DIFFERENT (avoid YouTube "mass-produced / repetitive content")
YouTube's monetization policy penalises channels whose videos look template-made. From the next video onward
(Google Lens, UPI, FASTag and OTP all used the same light background + same phone layout + same music – do NOT repeat that):
- **Background / colour theme:** new for every video (e.g. dark navy, warm paper/beige, teal gradient, isometric grid,
  night-city, illustrated landscape…). Never reuse the previous video's `Backdrop` as-is.
- **Layout:** vary where things sit (phone left / right / centre / no phone at all; full-screen diagrams, split screen,
  device mock-ups other than a phone – ATM, laptop, car dashboard, etc.).
- **Typography & accent colours:** a different heading font / accent palette per video.
- **Intro & title card:** a different hook style each time (cold-open story, question, quick stats, animated map…),
  and a different title-card animation.
- **Scene transitions & motion style:** vary (slide, zoom, wipe, morph) instead of the same fade.
- **Music:** different key, tempo and instrument set per video (not the same pad + pluck loop); different SFX palette.
- **Narration structure:** vary chapter order/format (e.g. myth-vs-fact segment, real-life story, quiz, comparison table),
  not always the identical 10-scene pattern; add a genuine original insight or example in every video.
- **Thumbnails:** a different visual style per video (not always the same blue gradient + headline-left layout).
- Keep a short note in each video's folder of the theme chosen, and check it differs from the previous videos.
- Before starting a new video, tell the creator which new look/theme is planned.
- Illustrative data only (non-payable QR, made-up IDs); never imply affiliation with NPCI/NHAI/banks/apps.
- **Never use the word "Demo" in names** (no "Demo Bank", "Demo Store", "DEMO 1234", "@demo").
  Use realistic-looking but fictional names instead, e.g. bank "SBK Bank" (initials-style, creator approved; avoid look-alikes of real lenders such as HDB/HDFC), shop "Kiran Electronics" /
  "Sharma General Store", vehicle "MH 12 KX 4821"-style plates, UPI ID like "sharmastore@sbkbank".
  Do not use real bank/app/brand names for the made-up entities. A small "illustrative" note on screen is fine.

## Upload kit (ZIP)
- One ZIP with folders: `01-upload-…` (video, 3 thumbnails, SRTs, title/description/tags txt),
  `02-…-english-dub-pack.zip` (English dub WAV = exact video length, English thumbnail, English SRT, English title/description),
  `03-extra-files-upload-nahi-karna` (voice-only WAV, script, notes, 30 s Short teaser), plus read-me files.
- Every upload file gets an SEO file name: lowercase keywords joined by "-" (e.g. `fastag-kaise-kaam-karta-hai-…-hindi.mp4`).
- 3 thumbnails + 3 matching titles for YouTube "Test & Compare"; check YouTube limits (title ≤ 100, description ≤ 5000, tags ≤ 500).
- Files over 100 MB stay out of git (deliver them directly).
