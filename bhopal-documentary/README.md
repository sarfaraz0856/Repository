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

## Chapter 3 – The Escape (`chapter3/`, 60 s, 1080p)

Around 1 am on 3 December, people wake up choking and run into the lanes; many run with the wind, straight into the cloud; the heavy gas sinks into the low ground; the cloud spreads over the old city with no proper warning.

## Chapter 4 – The Station (`chapter4/`, 60 s, 1080p)

The gas reaches Bhopal Junction after 1 am while a crowded express train waits at the platform; deputy station superintendent Ghulam Dastagir sends the train away ahead of time and stays at his post to warn other stations.

## Chapter 5 – The Hospital (`chapter5/`, 60 s, 1080p)

By the morning of 3 December thousands have reached Hamidia Hospital; with no room left, patients lie in the corridors and on the floors; the doctors do not know which gas it was or how to treat it; in the first few days tens of thousands need treatment.

## Chapter 6 – The Morning (`chapter6/`, 60 s, 1080p)

Dawn on 3 December: the lanes have fallen silent, with shoes, bundles and bicycles left behind where people fled or fell; by then the cloud has drifted away (about 40 tonnes of gas escaped in roughly two hours); thousands of animals died too, and the leaves on the trees turned yellow and fell.

## Chapter 7 – The Toll (`chapter7/`, 60 s, 1080p)

The pyres at Chhola Vishram Ghat burn for days; at Jhada Kabristan graves are dug in long rows; 3,787 dead is the official figure of the Madhya Pradesh government, while other estimates put the deaths at about 8,000 in the first weeks; more than 500,000 people were injured.

## Chapter 8 – Warren Anderson (`chapter8/`, 60 s, 1080p)

On 7 December 1984 Union Carbide's chairman arrives in Bhopal and is arrested; he is held at the company guest house for only a few hours, released on bail the same day and flown out on a state government plane; he never returned to face trial, was declared an absconder, and died in the USA in 2014.

## Chapter 9 – The Settlement (`chapter9/`, 60 s, 1080p)

On 14 February 1989 the Supreme Court approves a settlement of $470 million; the survivors were never asked and take to the streets; most victims receive about 25,000 rupees, years later; on 7 June 2010 seven former executives are convicted, sentenced to two years and given bail the same day.
