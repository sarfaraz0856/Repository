# Join the 4 parts back into the full video (lossless)

The 4 parts are the original 14:30 video (`claude_ep01_v4_music_only.mp4`), cut without re-encoding.
Joining them gives back the original exactly: same 26,116 frames, identical picture.

```bash
ffmpeg -f concat -safe 0 -i join_list.txt -c copy claude_ep01_v4_music_only.mp4
```

| Part | Starts at (in the full video) | Length |
|---|---|---|
| part1.mp4 | 0:00 | 4:01.7 |
| part2.mp4 | 4:01.7 | 3:13.6 |
| part3.mp4 | 7:15.3 | 3:10.0 |
| part4.mp4 | 10:25.3 | 4:05.3 |

After joining, run `add_my_voice.py` on the joined file as described in PROMPT_FOR_CLAUDE.md.
