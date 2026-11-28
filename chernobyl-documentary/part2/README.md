# CHERNOBYL — Part II: The Morning After (26–27 April 1986)

**File:** `Chernobyl_Part_II_The_Morning_After.mp4`
**Format:** 1920×1080 (16:9), 24 fps, 60 s, H.264 High + AAC 320 kbps, 48 kHz stereo.

This is the second part of the series. Part I (`../Chernobyl_26_April_1986_Documentary.mp4`) covered the night of the explosion. Part II covers the next 36 hours: dawn over Pripyat, a Saturday when life went on as usual, helicopters over the open reactor, the evacuation announcement, the buses, and the empty city.

As in Part I, every frame was rendered from 3D scenes built for this film (three.js / WebGL, ray-marched volumetric smoke). The music and all sound effects were synthesised in code. The film contains no stock footage, no AI-generated video and no copyrighted music.

## What is new compared with Part I

Part I took place at night. Part II is mostly daylight, which shows far more detail, so the set was extended:

- **Physical daylight:** an analytic sky with a sun disk and self-shadowed clouds, image-based lighting from that sky, low morning haze with sun glow, and dappled shadows through leaves.
- **Street-level Pripyat:** real balconies that match the windows painted on the facades, some glazed by their owners and some with washing on the line. Tulle and coloured curtains show in the windows by day. Roads, granite kerbs, verges and lawns are textured, with dandelions and patches of dry grass.
- **Spring trees:** limes, poplars and birches built in 3D with young lime-green leaves. Each tree varies slightly in colour, the leaves glow when backlit, and they move in the wind.
- **People:** Pripyat residents in 1980s clothes (jackets, dresses, headscarves, caps) carrying suitcases, sacks and handbags. Their movement is motion-captured.
- **Vehicles:** VAZ-2101 "Zhiguli" cars, LAZ-695 buses in two-tone liveries, and an olive Mi-8 helicopter with a sling load.

## Edit / shot list

| Time | Shot | What you see |
|---|---|---|
| 0:00–0:09 | Dawn, 26 April | An aerial drift over Pripyat at first light. A few windows are still lit, mist lies over the forest, and on the horizon the smoke from Unit 4 leans north in the low sun. **THE MORNING AFTER** |
| 0:08–0:16 | Saturday morning | A tree-lined avenue against the morning sun. Women and children walk to the shops and to school, a Zhiguli drives past, and there is washing on the balconies. **SATURDAY, 26 APRIL 1986 / LIFE IN PRIPYAT WENT ON AS USUAL** |
| 0:16–0:24 | The ruin by day | A telephoto shot of the destroyed reactor building. Black smoke and white steam rise from the open core past the striped vent stack. A Mi-8 crosses the smoke with a load of sand hanging below. |
| 0:24–0:32 | 13:10 | Street loudspeakers on a pole in front of an apartment block. A chime sounds, then the announcement echoes between the buildings. **27 APRIL 1986, 13:10 / THE EVACUATION IS ANNOUNCED** |
| 0:32–0:41 | The buses | The same avenue at noon. A column of buses waits at the kerb, and residents carry suitcases and bundles out to the doors. **49,360 RESIDENTS / ABOUT 1,200 BUSES** |
| 0:41–0:49 | The convoy | Seen from above, the column of buses fills the avenue as it leaves. **THEY WERE TOLD THEY WOULD RETURN IN THREE DAYS** |
| 0:48–1:00 | Dusk | The same avenue, empty, looking into the setting sun. A child's bicycle stands on the pavement, washing still hangs on the balconies, and dust drifts in the light. **THEY NEVER RETURNED**, then fade to black. |

## Historical notes

- **26 April was a normal Saturday.** Children went to school (Soviet schools held Saturday classes), weddings went ahead, and people sunbathed and fished. Nobody had told them anything yet.
- **The smoke drifted north-west and north** on 26–27 April, toward Belarus and later Scandinavia, where the release was first detected. It is shown leaning north.
- **Helicopters:** Mi-8 and Mi-6 crews began dropping sand, clay, boron carbide, dolomite and lead into the reactor on 27 April. Over the following days they dropped about 5,000 tonnes.
- **The announcement:** at about 13:10 on 27 April, radio and street loudspeakers told residents to gather documents, essentials and food "for three days". The evacuation began at 14:00 (solar noon in Pripyat, which is why the sun is high and in the south in that shot) and took about three and a half hours.
- **Figures:** Pripyat had about 49,360 residents. About 1,200 buses, many of them brought in from Kyiv, took part in the evacuation.
- **Nobody came back to live there.** Pripyat lies inside the exclusion zone and has stood empty since 27 April 1986.
- **Buses:** LAZ-695s like the ones shown were the standard Soviet city bus. Liveries varied by fleet.
- **No signage or lettering** appears in the film apart from the captions. The announcement is heard as a muffled, echoing voice with no actual words.

## Sound

- **Score:** a string ensemble in D minor with a sparse piano line. The harmony is warm during the Saturday scene, tightens into a dissonant tremolo cluster over the reactor, nearly drops out for the announcement, and swells through the evacuation. The film ends on one low D.
- **Sound design:** dawn birdsong and wind; distant voices, footsteps and a passing car; a Mi-8 with its 16 Hz blade slap and turbine whine; a three-tone PA chime with echoes off the buildings; idling diesels, door hiss and the murmur of a crowd; the column of approaching buses, with the right Doppler shift for the camera position; flapping washing, a creak and faint Geiger clicks in the empty city.

## Re-rendering

The full pipeline is in `../source/`. The Part II scenes are `web/part2.js` (shots P1–P7) and use `web/lib/daysky.js`, `web/lib/street.js` and `web/lib/heli.js`. Supporting scripts:

- `render_q.sh SHOT:a:b …` renders frame ranges in chunks.
- `titles2.py` makes the captions.
- `audio2.py` makes the score and sound.
- `assemble2.sh` makes the final edit.

See `../source/HOW_TO_RENDER.md` for setup.

## Credits

- 3D rendering uses three.js (MIT licence).
- Human motion comes from the Mixamo motion-capture clips that ship with the three.js "Soldier" example rig. Only the skeleton and animations are used. The figures and clothing were modelled for this film.
- The typeface is Inter Display (SIL Open Font License).
- All other models, textures, effects, the music and every sound were made procedurally for this film.
