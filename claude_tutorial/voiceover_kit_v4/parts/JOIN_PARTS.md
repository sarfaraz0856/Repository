# Join the 6 parts back into the full video (lossless)

The 6 parts are the original 14:30 video (`claude_ep01_v4_music_only.mp4`), cut without re-encoding.
Each part is under 30 MB. Joining them gives back the original exactly: same 26,116 frames, identical picture.

```bash
ffmpeg -f concat -safe 0 -i join_list.txt -c copy claude_ep01_v4_music_only.mp4
```

| Part | Starts at (in the full video) | Length | Size |
|---|---|---|---|
| part1.mp4 | 0:00 | 2:15 | 18 MB |
| part2.mp4 | 2:15 | 1:47 | 14 MB |
| part3.mp4 | 4:02 | 3:14 | 26 MB |
| part4.mp4 | 7:15 | 3:10 | 18 MB |
| part5.mp4 | 10:25 | 1:53 | 21 MB |
| part6.mp4 | 12:19 | 2:12 | 13 MB |

After joining, run `add_my_voice.py` on the joined file as described in PROMPT_FOR_CLAUDE.md.
