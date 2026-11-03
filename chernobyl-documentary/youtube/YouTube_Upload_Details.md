# YouTube upload details

All upload text is in [`Chernobyl-YouTube-Notes.txt`](Chernobyl-YouTube-Notes.txt): the title, description, tags, settings and notes.

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
