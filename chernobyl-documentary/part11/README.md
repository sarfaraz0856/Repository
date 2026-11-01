# CHERNOBYL — The Cost

**File:** `Chernobyl_Part_XI_The_Cost.mp4`, 1920×1080, 24 fps, 60 s. The joined film is `../Chernobyl_1986_Full_Film.mp4`.

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:15 | A grey morning at a bronze memorial: five firefighters in helmets and protective suits on a dark plinth, with red carnations at its foot. A few people stand and look. | **THE COST**, then **"TO THOSE WHO SAVED THE WORLD" / THE MEMORIAL TO THE FIREFIGHTERS AND LIQUIDATORS** |
| 0:15–0:30 | Rows of dark granite headstones in mist, with red carnations on the graves. | **MITINO CEMETERY, MOSCOW / 31 DIED IN THE FIRST WEEKS, 28 OF THEM FROM RADIATION SICKNESS** |
| 0:30–0:45 | A long avenue lined on both sides with village name signs, each struck through with a red line. | **THE ALLEY OF VANISHED VILLAGES / ABOUT 350,000 PEOPLE WERE RESETTLED** |
| 0:45–1:00 | Night. Rows of small candles burn on a dark step. | **THE FULL TOLL IS STILL DEBATED / ESTIMATES RANGE FROM 4,000 TO 60,000 DEATHS OR MORE** |

## Historical notes

- **"To those who saved the world"** is the memorial outside the Chernobyl fire station, unveiled in 2006, for the firefighters and liquidators.
- **Mitino cemetery** in Moscow holds the graves of the firefighters and operators who died of acute radiation sickness in Hospital No. 6. Two men died on the night of the explosion, and 28 died of radiation sickness in the weeks after.
- **The Alley of Vanished Villages** in the town of Chernobyl has a crossed-out sign for each of the settlements evacuated and abandoned after the accident. About 350,000 people were eventually resettled from the contaminated areas of Ukraine, Belarus and Russia.
- **The death toll** remains disputed. The WHO-led Chernobyl Forum (2005) projected up to about 4,000 eventual cancer deaths among the most exposed groups. Other studies have given far higher figures, in the tens of thousands.

## Re-rendering

The scenes are in `../source/web/part11.js` (shots Z1–Z4).

- `render_q11.sh` (or `queue_runner.sh`) renders the shots in chunks, and `join_chunks.sh part11 Z1 Z2 Z3 Z4` joins them.
- `titles11.py` makes the captions.
- `audio11.py` makes the score and sound.
- `assemble11.sh` makes the edit.
