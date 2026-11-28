# CHERNOBYL — The New Shelter (2010–2016)

**File:** `Chernobyl_Part_X_The_New_Shelter.mp4`, 1920×1080, 24 fps, 60 s. The joined film is `../Chernobyl_1986_Full_Film.mp4`.

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:15 | A grey day at the construction site west of the plant. The steel arch is half clad, with tall cranes beside it and the old ventilation stack behind. | **THE NEW SHELTER**, then **2010–2016 / A NEW STEEL ARCH WAS BUILT BESIDE THE RUIN** |
| 0:15–0:30 | Looking up from beneath the finished arch: its huge curved underside against the clouds. | **THE NEW SAFE CONFINEMENT / 257 M WIDE, 108 M HIGH, 36,000 TONNES OF STEEL** |
| 0:30–0:45 | From high above, the arch slides along its rails from the assembly site until it covers the old sarcophagus over Unit 4. | **NOVEMBER 2016 / IT WAS SLID 327 METRES ON RAILS, OVER THE OLD SARCOPHAGUS** |
| 0:45–1:00 | Sunset. The arch stands over the sarcophagus, lit warm by the low sun. | **IT IS DESIGNED / TO LAST 100 YEARS** |

## Historical notes

- **The New Safe Confinement** was built by the Novarka consortium and paid for through the international Chernobyl Shelter Fund, managed by the EBRD. It cost about €1.5 billion.
- It was assembled on a clean site west of the reactor, to keep the workers' radiation doses low, and then slid into place over Unit 4 in November 2016. It is the largest movable land-based structure ever built.
- Inside it, remote-controlled cranes are meant to take apart the unstable old sarcophagus. The arch is designed to last 100 years.

## Re-rendering

The scenes are in `../source/web/part10.js` (shots Y1–Y4). The arch is built in `../source/web/lib/arch.js`.

- `render_q10.sh` (or `queue_runner.sh`) renders the shots in chunks, and `join_chunks.sh part10 Y1 Y2 Y3 Y4` joins them.
- `titles10.py` makes the captions.
- `audio10.py` makes the score and sound.
- `assemble10.sh` makes the edit.
