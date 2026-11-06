# BHOPAL — 2–3 December 1984 (Hindi documentary, in progress)

A documentary about the Bhopal gas tragedy, planned at about 15 minutes. It uses the same pipeline as the Chernobyl film in `../chernobyl-documentary/`:

- Every frame is rendered in code from 3D scenes (three.js / WebGL), with ray-marched volumetric gas.
- The score and sound effects are synthesised.
- The Hindi narration is in the creator's cloned voice: Piper TTS converted with FreeVC.

## Chapter 1 – The Night (`chapter1/`, 60 s, 1080p)

| Time | Shot | Caption |
|---|---|---|
| 0:00–0:14 | Old Bhopal from the air at night: dense low-rise houses and lanes, a few lit windows, sodium street lamps, with the Taj-ul-Masajid in the foreground. | **BHOPAL**, then **2 DECEMBER 1984 / A CITY OF NEARLY 900,000 PEOPLE WAS ASLEEP** |
| 0:14–0:28 | The Union Carbide plant under its sodium lights: the process structures, the bunker over the buried MIC tanks, and the vent gas scrubber stack, from which a first wisp rises. | **THE UNION CARBIDE PESTICIDE PLANT / TANK 610 HELD 42 TONNES OF METHYL ISOCYANATE (MIC)** |
| 0:28–0:44 | From the ground by the gate: a white column of gas pours from the stack, and a low cloud spreads across the plant. | **AFTER MIDNIGHT, 3 DECEMBER / THE GAS ESCAPED FROM THE VENT STACK** |
| 0:44–1:00 | A lane in JP Nagar, opposite the plant: sleepers on charpais and a single bulb, as the gas rolls in along the ground. Fade to black. | **HEAVIER THAN AIR / IT CREPT INTO THE HOMES OF THE SLEEPING CITY** |

## Source

- `source/web/lib/bhopal.js` builds the set: the old city, the basti, the plant and the mosque.
- `source/web/bhopal1.js` defines shots BH1–BH4.
- `source/titles_bh1.py` makes the captions, `source/audio_bh1.py` the score and sound, and `source/assemble_bh1.sh` the edit.
- `source/voiceover/lines_ch1.json` holds the Hindi narration lines.

## Chapter 2 – What Went Wrong (`chapter2/`, 60 s, 1080p)

The control room at about 11 pm as the pressure in tank 610 rises; the refrigeration unit, shut down since June 1984; the flare tower (down for repair) and the vent gas scrubber (on standby); the water curtain, which could not reach the top of the vent stack.
