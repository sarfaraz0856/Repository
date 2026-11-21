# CHERNOBYL — Nature Returns (late 1990s–2000s)

**File:** `Chernobyl_Part_IX_Nature_Returns.mp4`, 1920×1080, 24 fps, 60 s. The joined film is `../Chernobyl_1986_Full_Film.mp4`.

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:15 | Misty morning in an abandoned village meadow. A herd of Przewalski's horses grazes in front of the pine forest. | **NATURE RETURNS**, then **1998 / PRZEWALSKI'S HORSES WERE RELEASED INTO THE ZONE** |
| 0:15–0:30 | A snowy, overgrown avenue in Pripyat. A pack of wolves trots down the middle of the empty road. | **WITHOUT PEOPLE / WOLVES, ELK AND DEER MULTIPLIED** |
| 0:30–0:45 | An aerial view of Pripyat, where pine forest now fills the yards and streets between the blocks. | **PRIPYAT / THE CITY WAS DISAPPEARING INTO THE FOREST** |
| 0:45–1:00 | Dusk at the cooling pond. An elk stands in the shallow water, with the plant and its red warning lights behind. | **THE COOLING POND / THE ZONE BECAME AN ACCIDENTAL WILDLIFE REFUGE** |

## Historical notes

- **Przewalski's horses**, a rare wild horse, were released into the zone in 1998 as an experiment. The herd survived and grew.
- **Wildlife:** studies in the 2010s found populations of wolves, elk, roe deer and wild boar in the zone similar to, or larger than, those in nearby nature reserves. The absence of people mattered more than the radiation.
- **Pripyat** is now largely hidden by trees that have grown through its courtyards, pavements and roads.
- **The cooling pond** of the plant, about 22 km², was gradually drained after 2014.

## Re-rendering

The scenes are in `../source/web/part9.js` (shots X1–X4). The animals are built in `../source/web/lib/animals.js`.

- `render_q9.sh` (or `queue_runner.sh`) renders the shots in chunks, and `join_chunks.sh part9 X1 X2 X3 X4` joins them.
- `titles9.py` makes the captions.
- `audio9.py` makes the score and sound.
- `assemble9.sh` makes the edit.
