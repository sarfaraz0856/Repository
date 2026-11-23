# Channel video production – standing preferences

Tech explainer videos for the creator's YouTube channel (so far: Google Lens, UPI, FASTag).
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
- 1920×1080, 30 fps, H.264 + AAC, -14 LUFS. Light Google-Lens-style background, enlarged phone, no burned-in subtitles.
- Soft background music (no harsh ticks/hats/buzz), smooth ducking under the voice.
- Illustrative data only (Demo names, non-payable QR, demo IDs); never imply affiliation with NPCI/NHAI/banks/apps.

## Upload kit (ZIP)
- One ZIP with folders: `01-upload-…` (video, 3 thumbnails, SRTs, title/description/tags txt),
  `02-…-english-dub-pack.zip` (English dub WAV = exact video length, English thumbnail, English SRT, English title/description),
  `03-extra-files-upload-nahi-karna` (voice-only WAV, script, notes, 30 s Short teaser), plus read-me files.
- Every upload file gets an SEO file name: lowercase keywords joined by "-" (e.g. `fastag-kaise-kaam-karta-hai-…-hindi.mp4`).
- 3 thumbnails + 3 matching titles for YouTube "Test & Compare"; check YouTube limits (title ≤ 100, description ≤ 5000, tags ≤ 500).
- Files over 100 MB stay out of git (deliver them directly).
