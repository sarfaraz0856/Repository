# CHERNOBYL — The Reckoning (autumn 1986 – July 1987)

**File:** `Chernobyl_Part_V_The_Reckoning.mp4`, 1920×1080, 24 fps, 60 s. The joined film with all five chapters is `../Chernobyl_1986_Full_Film.mp4` (5:00).

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:12 | Morning mist in the Red Forest. The dead Scots pines have turned ginger-brown. A crawler bulldozer pushes felled trunks toward a trench while two liquidators watch. | **THE RECKONING**, then **AUTUMN 1986 / THE DEAD RED FOREST WAS BULLDOZED AND BURIED** |
| 0:12–0:24 | A Pripyat classroom. Low sun through the broken windows, double desks with books and exercise books still on them, empty portrait frames, peeling paint, papers on the floor. | **PRIPYAT / THE CLASSROOMS WERE LEFT AS THEY WERE** |
| 0:24–0:36 | The plant at night. Units 1 and 2 are lit, the sarcophagus stands beyond, red aviation lights blink on both stacks, and the shift bus drives in. | **1 OCTOBER 1986 / UNIT 1 WAS RESTARTED, BESIDE THE RUIN** |
| 0:36–0:48 | A summer morning in Chernobyl town. People wait on the square in front of the House of Culture, where the trial was held. A militia car is parked at the kerb. | **JULY 1987, CHERNOBYL / THREE PLANT MANAGERS WERE SENTENCED TO 10 YEARS** |
| 0:48–1:00 | Pripyat from the air on a winter night. Snow covers the city and not one window is lit. Only the plant's stack lights blink on the horizon. The film fades to black. | **PRIPYAT'S LIGHTS / NEVER CAME BACK ON** |

## Historical notes

- **The Red Forest:** the pine forest west of the plant took one of the highest doses of fallout. The trees died within days and their needles turned red-brown. In 1986–87 the dead trees were bulldozed and buried in trenches.
- **Pripyat's schools** were left as they were on the day of the evacuation, 27 April 1986.
- **The restart:** Unit 1 went back into operation on 1 October 1986 and Unit 2 in November 1986, alongside the entombed Unit 4. Unit 3 followed in December 1987.
- **The trial** was held in July 1987 in the House of Culture in Chernobyl town. The plant director Viktor Bryukhanov, chief engineer Nikolai Fomin and deputy chief engineer Anatoly Dyatlov were each sentenced to 10 years in a labour camp. Three other officials received shorter sentences.
- **Pripyat** has stood empty since the evacuation.

## Re-rendering

The scenes are in `../source/web/part5.js` (shots T1–T5). The dead pines are the `redpine` species in `web/lib/street.js`.

- `render_q5.sh SHOT:a:b …` renders frame ranges in chunks.
- `titles5.py` makes the captions.
- `audio5.py` makes the score and sound.
- `assemble5.sh` makes the edit.
