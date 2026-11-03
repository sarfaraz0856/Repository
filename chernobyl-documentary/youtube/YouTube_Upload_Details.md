# YouTube upload details

This folder holds the following files:

- [`Chernobyl-YouTube-Text.txt`](Chernobyl-YouTube-Text.txt): the title, tags, description and pinned comment.
- [`Chernobyl-YouTube-Notes.txt`](Chernobyl-YouTube-Notes.txt): the upload settings and tips.
- [`Chernobyl-Narration-Script-Hindi.txt`](Chernobyl-Narration-Script-Hindi.txt): the full Hindi narration, with timings.
- [`Chernobyl-Hindi-Subtitles.srt`](Chernobyl-Hindi-Subtitles.srt): Hindi subtitles timed to the final film.

| What | File |
|---|---|
| **Video to upload (1080p, 10:40)** | `Chernobyl-Disaster-Documentary-in-Hindi.mp4`. It is 171 MB, too large for GitHub, so it was sent in chat. It is the two 1080p parts joined. |
| Video (720p, 10:40) | `../Chernobyl-Disaster-Documentary-in-Hindi-720p.mp4` |
| Thumbnail A (recommended) | `Chernobyl-Thumbnail-A.jpg` |
| Thumbnail B | `Chernobyl-Thumbnail-B.jpg` |
| Thumbnail C | `Chernobyl-Thumbnail-C.jpg` |

**Title:** Chernobyl Disaster Documentary in Hindi | What Really Happened in 1986?

To rebuild the 1080p upload file from the two parts:

```bash
printf "file 'Chernobyl-Disaster-Documentary-in-Hindi-1080p-Part-A.mp4'\nfile 'Chernobyl-Disaster-Documentary-in-Hindi-1080p-Part-B.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy -movflags +faststart Chernobyl-Disaster-Documentary-in-Hindi.mp4
```
