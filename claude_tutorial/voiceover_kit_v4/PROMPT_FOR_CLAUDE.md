# Task for Claude: add my cloned voice to this tutorial video

Paste this whole file into the chat or session where my voice clone is set up, and attach the files listed below.

## What you are getting

| File | What it is |
|---|---|
| `claude_ep01_v4_music_only.mp4` | The finished video (1920×1080, 30 fps, **14:30.53**). It has picture plus quiet background music and sound effects, and **no voice**. |
| `voiceover_script_v4.json` | The script: **74 lines**. Each line has `id`, `start`, `slot_seconds`, `target_seconds`, and the text in `devanagari`, `hinglish` and `english`. |
| `VOICEOVER_SCRIPT_v4.md` | The same script, readable by a human (chapter by chapter). |
| `lines_devanagari.txt` / `lines_hinglish.txt` | One line per clip: `id<TAB>text`. Easy to feed to a TTS or voice-clone tool. |
| `add_my_voice.py` | Puts the clips onto the video in sync, ducks the music, normalises loudness and exports the final MP4. Needs Python 3 and FFmpeg only. |
| `claude_ep01_v4.en.ass` / `.en.srt` / `.hinglish.srt` | Captions: optional to burn in (`.ass`) or to upload to YouTube (`.srt`). |

## What I want

1. **Use my cloned voice** (already set up in this chat or session) to speak **every one of the 74 lines**, in Hindi/Hinglish.
   - Feed the **Devanagari** text (`lines_devanagari.txt`) to the voice model. It gives the best Hindi pronunciation.
   - Make **one audio file per line**, named exactly by its id: `i1.wav`, `i2.wav`, `h1.wav`, … `o2.wav`. Put them all in a folder `voice/`.
   - Tone: confident, friendly teacher. Speak continuously and naturally, with no long pauses: the video is built for non-stop narration.
2. **Fit the timing.** Each clip should last about `target_seconds` and **must not exceed `slot_seconds`**.
   - If a clip is too long, regenerate it a little faster (or with the voice tool's speed set to about 1.05–1.1).
   - Small differences are fine: `add_my_voice.py` speeds clips up by up to 15% or slows them down by up to 6% automatically.
3. **Build the final video:**
   ```bash
   python3 add_my_voice.py --video claude_ep01_v4_music_only.mp4 --script voiceover_script_v4.json \
       --voice voice --out claude_ep01_final_with_my_voice.mp4
   # optional: burn English captions too (re-encodes the video, slower)
   python3 add_my_voice.py --video claude_ep01_v4_music_only.mp4 --script voiceover_script_v4.json \
       --voice voice --out claude_ep01_final_with_my_voice_captions.mp4 --captions claude_ep01_v4.en.ass
   ```
   The script prints one row per line: `ok`, `MISSING`, or `OVERRUNS by Xs`. Fix any line that is MISSING or OVERRUNS (regenerate it shorter or faster) and run again.
4. **Check the result:** watch 3 spots: 0:00 (intro), 10:24 (Claude Code install), 12:05 (bug fix). The voice should match what's on screen. Then give me the final MP4.

## Important timing notes

- The visuals (highlights, cursor, info cards, terminal demo) are timed to each line's `start`. Keep each clip in its own slot and the video stays in sync.
- Lines `epause` (11:12) and `fpause` (11:59) are said while the terminal is fast-forwarding. Keep them short and natural.
- Don't change the order of lines or merge them. If a sentence must be shortened to fit, keep the meaning.
- Facts in the script were checked against Anthropic's Help Center and Claude Code docs. Don't add new feature claims.
