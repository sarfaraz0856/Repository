# Rendering pipeline

Requirements: Node 18+, Playwright with Chromium (WebGL2 runs on CPU through SwiftShader, so no GPU is needed), Python 3 with numpy, scipy and Pillow, and ffmpeg.

```bash
npm install three@0.186.1
node gen_noise.js                      # builds web/assets/noise3d_128.bin (tileable 3D noise for the smoke)
curl -L -o web/assets/Soldier.glb \
  https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb   # mocap rig (skeleton + clips only)
node render.js S3 --stills 0,70,120    # preview frames -> out/stills/
./render_all.sh                        # renders S1..S10 -> out/S*.mov (about 3-4 h on 4 CPU cores)
python3 titles.py out/titles           # title-card PNG sequences
node lampcurve.mjs && python3 audio.py # sound design -> out/soundtrack_raw.wav
ffmpeg -i out/soundtrack_raw.wav -c:a pcm_s24le out/soundtrack.wav
./assemble.sh                          # final edit -> out/chernobyl_final.mp4
```

## Layout

- `web/main.js` is the runtime. It loads one shot, renders frame N on request, and returns raw RGBA pixels.
- `web/lib/post.js` holds the HDR pipeline: MSAA or supersampled scene, low-res volumes, camera motion blur, depth of field, bloom, halation, AgX tone mapping, split-tone grade, film grain and gate weave.
- `web/lib/volume.js` ray-marches smoke and fire: plumes with fire-light self-shadowing, the explosion fireball, and ground smoke. Beacon and alarm lights scatter visibly in the smoke.
- `web/lib/city.js` builds Pripyat: a microdistrict layout, procedural panel-block facades (windows, curtains, TV flicker, entrance lamps, broken glass), roads, the lamp light map and trees.
- `web/lib/plant.js` builds the ChNPP: units 1–4, the turbine hall, the VT-1 and VT-2 lattice stacks, cooling towers under construction, pylons, floodlights, and unit 4's destructible central hall with its ruins.
- `web/lib/fx.js` has the flames, ballistic debris, embers and dust. `web/lib/people.js` has the firefighters (mocap skeleton dressed in period gear) and the ZIL fire tankers.
- The shots live in `web/shots.js` (S1), `web/shots_plant.js` (S2, S3, S4, S10), `web/shots_fire.js` (S5, S6, S7) and `web/shots_after.js` (S8, S9).

Everything is a pure function of time, so any frame can be rendered on its own.

## Part II (shots P1–P7)

```bash
node render.js P2 --stills 0,96,180            # preview
./render_q.sh P1:0:216 P2:0:96 P2:96:192 ...    # chunked renders -> out/part2/SHOT_aaa.mov
                                                #   (P1 and P3 can also go through render_all.sh: SHOTS="P1 P3")
python3 titles2.py                              # captions -> out/part2/titles/
python3 audio2.py                               # score + sound -> out/part2/soundtrack_raw.wav
./assemble2.sh                                  # final edit -> out/part2/chernobyl_part2.mp4
```

- `web/part2.js` defines the Part II shots. `streetWorld()` is one avenue on Pripyat's south-eastern edge, used for P2, P4, P5, P6 and P7 at different times of day.
- `web/lib/daysky.js` provides the day and dawn sky (sun disk, Mie glow, self-shadowed clouds), sun and sky lights, and `envFromSky()` (a PMREM environment for image-based lighting).
- `web/lib/street.js` holds the balconies (a JS port of the facade shader's cell hash, so the geometry lines up with the painted windows), washing lines, 3D spring trees with translucent leaves and per-tree colour, the textured road, kerbs, verges and lawns, the VAZ-2101 and LAZ-695, the civilians, and the forest floor.
- `web/lib/heli.js` builds the Mi-8 with its rotor discs and sling load.
- About 20–35 s per frame on 4 CPU cores at 2× supersampling. Background jobs should stay under 2 h, which is why shots are rendered in chunks.
