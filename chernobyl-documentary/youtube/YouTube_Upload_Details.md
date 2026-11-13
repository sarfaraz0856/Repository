# YouTube upload details

This folder holds the following files:

- [`Chernobyl-Title-Tags-Description.txt`](Chernobyl-Title-Tags-Description.txt): the title, tags, description and pinned comment.
- [`Chernobyl-Upload-Notes.txt`](Chernobyl-Upload-Notes.txt): the upload settings and tips.
- [`Chernobyl-Narration-Script-Hindi.txt`](Chernobyl-Narration-Script-Hindi.txt): the full Hindi narration, with timings.
- [`Chernobyl-Subtitles-Hindi.srt`](Chernobyl-Subtitles-Hindi.srt): Hindi subtitles timed to the final film.
- [`Chernobyl-Subtitles-English.srt`](Chernobyl-Subtitles-English.srt): English subtitles, with the same timings.

| What | File |
|---|---|
| **Video to upload (1080p, 10:40)** | `Chernobyl-Disaster-Documentary-in-Hindi.mp4`. It is 171 MB, too large for GitHub, so it was sent in chat. It is the two 1080p parts joined. |
| Video (720p, 10:40) | `../Chernobyl-Disaster-Documentary-in-Hindi-720p.mp4` |
| Thumbnail A (recommended) | `Chernobyl-Documentary-Thumbnail-A.jpg` |
| Thumbnail B | `Chernobyl-Documentary-Thumbnail-B.jpg` |
| Thumbnail C | `Chernobyl-Documentary-Thumbnail-C.jpg` |

**Title:** Chernobyl Disaster Documentary in Hindi | What Really Happened in 1986?

To rebuild the 1080p upload file from the two parts:

```bash
printf "file 'Chernobyl-Disaster-Documentary-in-Hindi-1080p-Part-A.mp4'\nfile 'Chernobyl-Disaster-Documentary-in-Hindi-1080p-Part-B.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy -movflags +faststart Chernobyl-Disaster-Documentary-in-Hindi.mp4
```
