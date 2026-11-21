# CHERNOBYL — Epilogue

**File:** `Chernobyl_Part_XIII_Epilogue.mp4`, 1920×1080, 24 fps, 60 s. This is the film's last chapter.

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:15 | Night under the stars. The steel arch over Unit 4 glows in its floodlights. | **EPILOGUE**, then **TODAY / THE NEW ARCH STANDS OVER THE RUINS OF UNIT 4** |
| 0:15–0:30 | The same flight over Pripyat as the film's very first shot, but now the city is dark and lost in forest. Only the red lights on the plant's stack shine in the distance. The picture fades to black. | **PRIPYAT / ONCE HOME TO 49,360 PEOPLE. TODAY, TO NO ONE** |
| 0:30–1:00 | Closing cards on black. | **PARTS OF THE ZONE WILL STAY CONTAMINATED FOR THOUSANDS OF YEARS**, then **IN MEMORY OF ALL WHO PAID THE PRICE**, then **THE END**, then **CHERNOBYL 1986 / A DOCUMENTARY IN THIRTEEN CHAPTERS** and the credits |

## Historical notes

- **Pripyat** had 49,360 residents when it was evacuated on 27 April 1986.
- **Long-term contamination:** caesium-137 and strontium-90 decay over decades, but plutonium isotopes near the plant have half-lives of thousands of years (about 24,000 for plutonium-239), so parts of the zone will stay contaminated for millennia.

## Re-rendering

The scenes are in `../source/web/part13.js` (shots AB1, AB2). Render with `render_q13.sh` or `queue_runner.sh`, join with `join_chunks.sh part13 AB1 AB2`, then run `titles13.py`, `audio13.py` and `assemble13.sh`.
