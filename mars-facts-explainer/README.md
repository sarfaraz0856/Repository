# 10 Mind-Blowing Facts About Mars (animated explainer)

**Format:** 1920x1080 (16:9), 30 fps, 90 s, H.264 + AAC

| File | Use |
|---|---|
| `10_Mind_Blowing_Facts_About_Mars.mp4` | Final video with music bed and transition sound effects |
| `10_Mind_Blowing_Facts_About_Mars_NO_AUDIO.mp4` | Same video, silent (add your own voiceover or music) |
| `thumbnail_frame.jpg` | Title card frame for a thumbnail |

## Timeline

| Time | Scene |
|---|---|
| 0:00 to 0:07 | Title card: 10 Mind-Blowing Facts About Mars |
| 0:07 to 1:21 | Facts 1 to 10, 7.4 s each |
| 1:21 to 1:30 | Closing card: comment your favourite fact and subscribe |

Fact start times: 1 at 0:07.0, 2 at 0:14.4, 3 at 0:21.8, 4 at 0:29.2, 5 at 0:36.6,
6 at 0:44.0, 7 at 0:51.4, 8 at 0:58.8, 9 at 1:06.2, 10 at 1:13.6.

## Style

Warm golden cream background (no plain white), dark ink text, gold accents and gold
line drawings (Mars, rover, canyon, swirling dust, Ingenuity helicopter, orbits, clock,
ice caps, meteorite path). Text is large, and there are no em dashes anywhere.

## Rebuilding

The animation is a deterministic HTML/SVG scene (`src/mars.html`, driven by `render(t)`).

```bash
cd src
NODE_PATH=$(npm root -g) node render.js <outdir>       # renders part0..3.mp4 + parts.txt
python3 audio.py <outdir>/music.wav                    # music bed + SFX
ffmpeg -f concat -safe 0 -i <outdir>/parts.txt -c copy video.mp4
ffmpeg -i video.mp4 -i <outdir>/music.wav -c:v copy -c:a aac -b:a 192k -shortest final.mp4
```

`stills.js <outdir> <t1> <t2> ...` grabs preview PNGs at given seconds.
