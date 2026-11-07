# CHERNOBYL — The Zone Today (2011–2019)

**File:** `Chernobyl_Part_XII_The_Zone_Today.mp4`, 1920×1080, 24 fps, 60 s.

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:15 | A summer day in Pripyat's amusement park. Groups of tourists walk past the rusting yellow Ferris wheel, among green trees. | **THE ZONE TODAY**, then **2011 / THE ZONE WAS OPENED TO VISITORS** |
| 0:15–0:30 | The empty Azure (Lazurny) swimming pool. Its tiled basin is dry and cracked, and light falls through the tall windows. | **THE AZURE SWIMMING POOL / LIQUIDATORS STILL SWAM HERE UNTIL 1996** |
| 0:30–0:45 | In the dark beneath the reactor, a torch beam finds the Elephant's Foot, a wrinkled mass of solidified molten fuel. | **THE ELEPHANT'S FOOT / MOLTEN FUEL BENEATH THE REACTOR, STILL DEADLY TODAY** |
| 0:45–1:00 | The checkpoint on the road into the zone, busy with tour buses and crowds of visitors. | **2019 / 124,000 PEOPLE VISITED THE EXCLUSION ZONE** |

## Historical notes

- **Tourism:** Ukraine officially opened the zone to organised tours in 2011. Visitor numbers rose sharply after the 2019 TV series *Chernobyl*, to about 124,000 that year.
- **The Azure pool** stayed in use by plant workers and liquidators for years after the evacuation, until about 1996.
- **The Elephant's Foot** is a mass of corium (melted fuel, concrete and sand) found in 1986 in a corridor beneath Unit 4. When it was found, a few minutes beside it could give a lethal dose. It is far less radioactive now, but still dangerous.

## Re-rendering

The scenes are in `../source/web/part12.js` (shots AA1–AA4). Render with `render_q12.sh` or `queue_runner.sh`, join with `join_chunks.sh part12 AA1 AA2 AA3 AA4`, then run `titles12.py`, `audio12.py` and `assemble12.sh`.
