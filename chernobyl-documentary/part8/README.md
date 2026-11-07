# CHERNOBYL — The Last Reactor (1990s–2000)

**File:** `Chernobyl_Part_VIII_The_Last_Reactor.mp4`, 1920×1080, 24 fps, 60 s. The joined film is `../Chernobyl_1986_Full_Film.mp4`.

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:15 | Rain on the sarcophagus over Unit 4. The concrete is stained and streaked, and dark cracks run down its walls. | **THE LAST REACTOR**, then **THE 1990s / THE HASTILY BUILT SARCOPHAGUS WAS CRACKING** |
| 0:15–0:30 | A control room of the plant: operators at the long desk below walls of indicator lamps and the round core map. | **30 NOVEMBER 1996 / UNIT 1 WAS SHUT DOWN** |
| 0:30–0:45 | Close on the core map. Its lamps go out from the centre outwards until the whole map is dark. | **15 DECEMBER 2000, 13:17 / THE LAST REACTOR, UNIT 3, WAS SHUT DOWN** |
| 0:45–1:00 | The plant at dusk from the north. Its windows go dark one block after another, leaving only the red lights on the stack. | **AFTER 23 YEARS / THE CHERNOBYL PLANT FELL SILENT** |

## Historical notes

- **The sarcophagus** (the "Object Shelter") was built in about six months in 1986. By the 1990s it was cracked and leaking, and parts of it were at risk of collapse.
- **Unit 2** was closed after the turbine-hall fire of October 1991. **Unit 1** was shut down on 30 November 1996.
- **Unit 3**, the last working reactor, was shut down on 15 December 2000 at 13:17, at a ceremony linked live to Kyiv, as Ukraine had agreed with the G7.
- The plant's first unit had started up in 1977, so it was 23 years from first power to final shutdown.

## Re-rendering

The scenes are in `../source/web/part8.js` (shots W1–W4).

- `render_q8.sh` (or `queue_runner.sh` with `queue.txt`) renders the shots in chunks, and `join_chunks.sh part8 W1 W2 W3 W4` joins them.
- `titles8.py` makes the captions, and `make_capband.py` makes the soft band behind the W3 caption.
- `audio8.py` makes the score and sound.
- `assemble8.sh` makes the edit.
