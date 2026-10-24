// PART II — "THE MORNING AFTER" (26–27 April 1986): dawn over Pripyat, a normal Saturday,
// helicopters over the reactor, the bus convoy, the evacuation, the empty city.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { buildBalconies, buildTrees3D, streetGround, makeCar, makeBus, makeCivilian, clipSpeed, contactShadow, forestFloor, LEAF_AMB } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { makeMi8 } from './lib/heli.js';
import { Dust } from './lib/fx.js';
import { VolumeFX } from './lib/volume.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildCity, buildForest, generateLayout } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { placeCamera } from './shots_plant.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);

// the reactor's smoke by day: sun-lit, faint fire glow at the base
export function dayPlume(ctx, scene, { steps = 110, density = 1.0, wind = [0.1, -0.56] } = {}) {
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: P(-260, 20, -640).toArray(), boxMax: P(420, 660, 200).toArray(), steps, shadowSteps: 3, albedo: 0.45 });
  scene.add(vol.mesh);
  return (t, camera, { sun, sunCol, amb, fire = 1, h = 600 }) => {
    vol.setPlumes([{ base: P(0, 46, 4).toArray(), r0: 16, spread: 0.32, height: h, density, rise: 6, wind, noiseScale: 1 / 65, fireH: 14, fireEmis: 5 * fire, seed: 0.2 }]);
    vol.setLighting({ firePos: P(2, 50, 4).toArray(), fireCol: [5 * fire, 1.7 * fire, 0.45 * fire], fireR: 30, fireShadowLen: 140, moonDir: sun.toArray(), moonCol: sunCol, ambTop: amb[0], ambBot: amb[1], ext: 0.08, minStep: 3 });
    vol.update(t + 900, Math.round(t * 24), camera);
  };
}

// ---------------- P1: dawn over Pripyat, the smoke on the horizon ----------------
export async function P1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(30, ctx.aspect), ctx.aspect, 3, 16000);
  const SUN = sunDir(72, 2.6);
  const sky = makeDaySky({ noiseTex: ctx.noiseTex });
  const su = sky.uniforms;
  su.uSunDir.value.copy(SUN); su.uSunCol.value.setRGB(1.6, 0.75, 0.32);
  su.uZenith.value.setRGB(0.028, 0.052, 0.13); su.uHorizon.value.setRGB(0.11, 0.12, 0.15); su.uDawn.value.setRGB(1.1, 0.42, 0.13); su.uDawnPow.value = 5;
  su.uCloudBright.value.setRGB(0.55, 0.36, 0.3); su.uCloudShade.value.setRGB(0.07, 0.075, 0.1); su.uCloudCover.value = 0.48; su.uSunDisk.value = 30;
  scene.add(sky);
  const city = buildCity(ctx, { litFrac: 0.045, spring: 0.55, lampGain: 0.6, lumGain: 30 });
  scene.add(city.group);
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.4; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  scene.add(buildForest(ctx, { center: [1200, 1300], radius: 2600, count: 26000, exclude: [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1000]] }));
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.52, 0.24), sunI: 2.2, skyColor: new THREE.Color(0.22, 0.25, 0.38), groundColor: new THREE.Color(0.05, 0.045, 0.04), hemiI: 0.55, center: V3(300, 0, 300), extent: 1500 });
  ATM.uMoonDir.value.copy(SUN);
  ATM.uFogColor.value.setRGB(0.05, 0.058, 0.08); ATM.uFogDensity.value = 0.00021; ATM.uFogHeight.value = 280; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(0.42, 0.17, 0.05); ATM.uGlowPow.value = 5;
  ATM.uMoonHalo.value.setRGB(0.4, 0.2, 0.08); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampGain.value = 1.2;
  const plume = dayPlume(ctx, scene);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.12, uLookSat: 1.05, uBloom: 0.06, uHalation: 0.08, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.9, 1.0, 1.14], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      const u = easeInOutSine(t / 9);
      const p = V3(-720, 165, -640).lerp(V3(-610, 150, -545), u);
      const yaw = THREE.MathUtils.degToRad(lerp(126, 129, u));
      const tg = p.clone().add(V3(Math.sin(yaw), -0.1, -Math.cos(yaw)).multiplyScalar(1000));
      placeCamera(camera, ctx, p, tg, { focal: 30, shake: 0.1, shakeFreq: 0.3, t, seed: 201 });
      plume(t, camera, { sun: SUN, sunCol: [1.25, 0.8, 0.52], amb: [[0.055, 0.065, 0.09], [0.035, 0.03, 0.028]], fire: 0.8 });
      return {};
    },
  };
}

// ---------------- the street: one avenue seen full (P2), with the buses (P5) and empty (P7) ----------------
// An avenue on the south-east edge of Pripyat that points straight at the plant, 2.4 km away.
export function streetSite() {
  const S = V3(520, 0, 470);
  const D = sunDir(112, 0).setY(0).normalize();   // runs east-south-east, into the morning sun
  const R = V3(-D.z, 0, D.x);
  const at = (s, l, y = 0) => S.clone().addScaledVector(D, s).addScaledVector(R, l).setY(y);
  return { S, D, R, at, rot: Math.atan2(-D.z, D.x) };
}
// pick a building seed whose stairwells are on the yard side, so balconies face the avenue
function seedFacing(base, wantStairSide) {
  for (let k = 0; k < 200; k++) {
    const sd = base + k * 0.731;
    const ss = (Math.fround(Math.fround(sd) * Math.fround(5.3)) % 1) > 0.5 ? 2 : 3;
    if (ss === wantStairSide) return sd;
  }
  return base;
}
const STREET_BLDG = [
  // s, l, w, d, floors, style
  [-85, -31, 110, 12.5, 9, 1], [55, -31, 140, 12.5, 9, 1], [192, -38, 30, 18, 16, 3], [292, -31, 110, 12.5, 9, 1], [398, -30, 70, 12.5, 5, 2],
  [-60, 29, 70, 12.5, 5, 2], [30, 29, 80, 12.5, 5, 2], [142, 30, 120, 12.5, 5, 2], [262, 38, 30, 18, 16, 3], [360, 31, 100, 12.5, 9, 1],
];
export async function streetWorld(ctx, { sun, sky: skyOpts, litFrac = 0, broken = 0, spring = 0.9, leafiness = 0.75, washing = true, plume = true, plumeOpts = {} }) {
  const scene = new THREE.Scene();
  const st = streetSite();
  const { S, D, R, at, rot } = st;
  const sky = makeDaySky({ noiseTex: ctx.noiseTex });
  for (const [k, v] of Object.entries(skyOpts)) { const u = sky.uniforms[k]; if (u.value?.setRGB && Array.isArray(v)) u.value.setRGB(...v); else u.value = v; }
  sky.uniforms.uSunDir.value.copy(sun);
  scene.add(sky);
  // the avenue's own blocks replace the generic layout along the corridor
  const lay = generateLayout(1986);
  const rel = (x, z) => { const q = V3(x - S.x, 0, z - S.z); return [q.dot(D), q.dot(R)]; };
  lay.buildings = lay.buildings.filter(b => { const [s, l] = rel(b.x, b.z); const rr = Math.max(b.w, b.d) * 0.5; return !(s > -900 - rr && s < 560 + rr && Math.abs(l) < 44 + rr); });
  const mine = STREET_BLDG.map(([s, l, w, d, floors, style], i) => {
    const c = at(s, l);
    return { x: c.x, z: c.z, w, d, h: floors * 2.8 + 1.2, floors, style, rot, seed: seedFacing(13.7 + i * 9.13, l < 0 ? 3 : 2), lit: 0 };
  });
  lay.buildings.push(...mine);
  const a0 = at(-400, 0), a1 = at(900, 0);
  lay.roads.push({ a: [a0.x, a0.z], b: [a1.x, a1.z], w: 15 });
  const ex = []; for (let s = -260; s <= 620; s += 40) { const c = at(s, 0); ex.push([c.x, c.z, 60]); }
  const city = buildCity(ctx, { layout: lay, litFrac, lampsOff: true, spring, treeExclude: ex, facade: { day: 1, broken, entrGain: 0 } });
  scene.add(city.group);
  const balc = buildBalconies(mine, { washing, laundryFrac: washing ? 0.14 : 0 });
  scene.add(balc.group);
  const ground = streetGround(ctx, { o: S, d: D, length: [-300, 1000], width: 44 });
  scene.add(ground.group);
  // trees: lindens on the verges, poplars and birches on the lawns
  const rnd = mulberry32(42);
  const trees = [];
  for (let s = -60; s < 470; s += 8 + rnd() * 2.5) for (const side of [-1, 1]) {
    if (rnd() < 0.12) continue;
    const c = at(s + rnd() * 2, side * (9.6 + rnd() * 0.5));
    trees.push([c.x, c.z, 8.5 + rnd() * 3.5, 'linden']);
  }
  for (let k = 0; k < 46; k++) {
    const s = -60 + rnd() * 500, side = rnd() < 0.5 ? -1 : 1, l = side * (16.5 + rnd() * 6);
    const c = at(s, l); trees.push([c.x, c.z, 10 + rnd() * 7, rnd() < 0.55 ? 'birch' : 'poplar']);
  }
  scene.add(buildTrees3D(trees, { leafiness, seed: 3 }));
  // the plant on the horizon and its smoke
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  const FEX = [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1000]];
  scene.add(buildForest(ctx, { center: [1200, 1300], radius: 2600, count: 70000, exclude: FEX }));
  scene.add(forestFloor(ctx, { center: [1200, 1300], radius: 2600, exclude: FEX }));
  const pl = plume ? dayPlume(ctx, scene, Object.assign({ steps: 72 }, plumeOpts)) : null;
  return { scene, st, sky, city, balc, plant, plume: pl, trees };
}

// debug: ?dcam=s,l,y,ts,tl,ty,focal views the street set from anywhere
function debugCam(ctx, camera, at) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [s, l, y, ts, tl, ty, f] = v.split(',').map(Number);
  camera.position.copy(at(s, l, y)); camera.up.set(0, 1, 0); camera.lookAt(at(ts, tl, ty));
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix();
  return { dof: null };
}

function placeWalker(c, rig, { from, to, t, speed, clip = 'Walk', offset = 0, rate = 1 }) {
  const d = to.clone().sub(from); const L = d.length(); d.normalize();
  const tt = Math.max(t, 0);
  const pos = from.clone().addScaledVector(d, Math.min(tt * speed * c.scale, L));
  c.root.position.copy(pos); c.root.rotation.y = Math.atan2(d.x, d.z);
  c.ao.position.set(pos.x, 0.045, pos.z);
  pose(c, clip, t, { offset, rate });
}

// ---------------- P2: Saturday morning, 26 April. Life as usual. ----------------
export async function P2(ctx) {
  const SUN = sunDir(116, 13);
  const W = await streetWorld(ctx, {
    sun: SUN,
    sky: { uSunCol: [2.4, 1.9, 1.3], uZenith: [0.05, 0.1, 0.23], uHorizon: [0.3, 0.3, 0.3], uDawn: [0.35, 0.2, 0.08], uDawnPow: 4,
      uCloudBright: [0.8, 0.79, 0.76], uCloudShade: [0.3, 0.33, 0.38], uCloudCover: 0.22, uSunDisk: 60 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(70, ctx.aspect), ctx.aspect, 0.3, 16000);
  const sunC = new THREE.Color(1.0, 0.86, 0.68);
  const L = dayLights(scene, { dir: SUN, sunColor: sunC, sunI: 3.4, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.08, center: at(110, 0), extent: 260, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.06, 0.065, 0.055));
  scene.environmentIntensity = 1.0;
  ATM.uMoonDir.value.copy(SUN);
  ATM.uFogColor.value.setRGB(0.15, 0.17, 0.19); ATM.uFogDensity.value = 0.0008; ATM.uFogHeight.value = 70; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(1.3, 0.92, 0.52); ATM.uGlowPow.value = 9;
  ATM.uMoonHalo.value.setRGB(0.9, 0.7, 0.45); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampGain.value = 0;
  // parked cars and one coming down the avenue
  const carCols = [[0.62, 0.62, 0.6], [0.5, 0.42, 0.28], [0.2, 0.33, 0.45], [0.32, 0.035, 0.03], [0.1, 0.22, 0.14], [0.55, 0.36, 0.06], [0.42, 0.42, 0.4]];
  const cars = [];
  const park = [[22, 6.3, 1], [36.5, 6.3, 1], [61, 6.3, 1], [118, 6.3, 1], [44, -6.3, -1], [151, -6.3, -1], [205, 6.3, 1]];
  park.forEach(([s, l, dir], i) => {
    const c = makeCar({ color: new THREE.Color(...carCols[i % carCols.length]), seed: i });
    c.group.position.copy(at(s, l)); const fd = D.clone().multiplyScalar(dir);
    c.group.rotation.y = Math.atan2(-fd.z, fd.x) + (i % 3 - 1) * 0.015;
    scene.add(c.group); cars.push(c);
  });
  const mover = makeCar({ color: new THREE.Color(0.55, 0.55, 0.53), seed: 9 });
  scene.add(mover.group);
  // people
  const rig = await loadRig();
  const vWalk = clipSpeed(rig, 'Walk');
  const people = [];
  const walk = (s0, l, dir, { kind = null, seed, bag = null, rate = 1, delay = 0, dist = 80 } = {}) => {
    const c = makeCivilian(rig, { seed, kind, bag });
    const from = at(s0, l), to = at(s0 + dir * dist, l);
    scene.add(c.root, c.ao);
    people.push({ c, from, to, speed: vWalk * rate, rate, offset: seed * 0.41, delay });
  };
  // left sidewalk (camera side), right sidewalk, a crossing pair
  walk(24, -12.6, 1, { seed: 1, kind: 'woman', bag: 'handbag' });
  walk(30, -13.6, 1, { seed: 2, kind: 'child', rate: 1.05 });
  walk(31, -13.0, 1, { seed: 3, kind: 'woman' });
  walk(78, -12.8, -1, { seed: 4, kind: 'man', bag: 'case', rate: 0.95 });
  walk(96, -13.5, -1, { seed: 5, kind: 'man' });
  walk(120, -12.7, 1, { seed: 6, kind: 'woman', rate: 0.9 });
  walk(44, 13.0, -1, { seed: 7, kind: 'woman', bag: 'handbag', rate: 0.95 });
  walk(58, 13.6, 1, { seed: 8, kind: 'man' });
  walk(70, 12.9, -1, { seed: 9, kind: 'child', rate: 1.1 });
  walk(71, 13.5, -1, { seed: 10, kind: 'woman' });
  walk(105, 13.2, 1, { seed: 11, kind: 'man', rate: 1.05 });
  walk(140, 12.8, -1, { seed: 12, kind: 'woman' });
  walk(165, -13.2, -1, { seed: 13, kind: 'man' });
  walk(190, 13.4, -1, { seed: 14, kind: 'man', bag: 'case' });
  // kids on the lawn
  const kids = [];
  for (let k = 0; k < 3; k++) { const c = makeCivilian(rig, { seed: 30 + k, kind: 'child' }); scene.add(c.root, c.ao); kids.push(c); }
  const standers = [];
  for (const [s, l, seed, kind, face] of [[66, -19.5, 40, 'woman', 1], [66.8, -20.3, 41, 'woman', -1], [133, 20, 42, 'man', 1]]) {
    const c = makeCivilian(rig, { seed, kind }); const p = at(s, l); c.root.position.copy(p); c.ao.position.set(p.x, 0.045, p.z);
    const fd = (face > 0 ? R.clone().negate() : D.clone()); c.root.rotation.y = Math.atan2(fd.x, fd.z); scene.add(c.root, c.ao); standers.push({ c, seed });
  }
  if (ctx.params.get('hide')) { const hs = ctx.params.get('hide').split(','); scene.traverse(o => { if (hs.includes(o.name)) o.visible = false; }); }
  const camA = at(-34, -13.9, 1.56), camB = at(-32.6, -13.75, 1.55);
  return {
    scene, camera,
    look: { uExposure: 0.92, uLookPow: 1.12, uLookSat: 0.92, uBloom: 0.06, uHalation: 0.07, uVignette: 0.5, uGrain: 0.04, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      const u = easeInOutSine(t / 8);
      const p = camA.clone().lerp(camB, u);
      const tg = at(220, -2.5, 6.5);
      placeCamera(camera, ctx, p, tg, { focal: 70, shake: 0.05, shakeFreq: 0.35, t, seed: 202 });
      for (const w of people) placeWalker(w.c, rig, { from: w.from, to: w.to, t: t - w.delay, speed: w.speed, offset: w.offset, rate: w.rate });
      kids.forEach((c, k) => {
        const a = t * (0.9 + k * 0.15) + k * 2.1; const ctr = at(88, 19 + k * 0.5);
        const pos = ctr.clone().addScaledVector(D, Math.cos(a) * 3.2).addScaledVector(R, Math.sin(a) * 1.8);
        const vel = D.clone().multiplyScalar(-Math.sin(a) * 3.2).addScaledVector(R, Math.cos(a) * 1.8);
        c.root.position.copy(pos); c.root.rotation.y = Math.atan2(vel.x, vel.z); c.ao.position.set(pos.x, 0.045, pos.z);
        pose(c, 'Run', t, { offset: k * 0.3, rate: 0.85 });
      });
      for (const s of standers) pose(s.c, 'Idle', t, { offset: s.seed * 0.7 });
      const ms = 250 - t * 10.5; mover.group.position.copy(at(ms, -3.4)); mover.group.rotation.y = Math.atan2(D.z, -D.x);
      W.plume && W.plume(t, camera, { sun: SUN, sunCol: [2.3, 2.15, 1.9], amb: [[0.16, 0.19, 0.25], [0.1, 0.1, 0.1]], fire: 0.15 });
      return debugCam(ctx, camera, at) || { dof: { focus: 40, focal: 70, fstop: 2.0 } };
    },
  };
}

// ---------------- P3: the ruin of Unit 4 by daylight, a Mi-8 over the smoke ----------------
export async function P3(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(85, ctx.aspect), ctx.aspect, 3, 16000);
  const SUN = sunDir(205, 44);
  const sky = makeDaySky({ noiseTex: ctx.noiseTex });
  const su = sky.uniforms;
  su.uSunDir.value.copy(SUN); su.uSunCol.value.setRGB(2.2, 2.05, 1.85);
  su.uZenith.value.setRGB(0.05, 0.1, 0.22); su.uHorizon.value.setRGB(0.3, 0.32, 0.35); su.uDawn.value.setRGB(0.02, 0.015, 0.01);
  su.uCloudBright.value.setRGB(0.78, 0.77, 0.75); su.uCloudShade.value.setRGB(0.3, 0.33, 0.38); su.uCloudCover.value = 0.3; su.uSunDisk.value = 60;
  scene.add(sky);
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  plant.ground.position.copy(PLANT).setY(0.02); scene.add(plant.ground);
  const FEX = [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1100], [PLANT.x + 400, PLANT.z + 420, 120]];
  scene.add(buildForest(ctx, { center: [PLANT.x - 900, PLANT.z - 700], radius: 2600, count: 70000, exclude: FEX }));
  scene.add(forestFloor(ctx, { center: [PLANT.x - 900, PLANT.z - 700], radius: 2600, exclude: FEX }));
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.88), sunI: 3.3, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: P(-60, 0, 0), extent: 520, near: 200, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sky, new THREE.Color(0.06, 0.065, 0.055));
  ATM.uMoonDir.value.copy(SUN); ATM.uLampMapOn.value = 0; ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(0.26, 0.29, 0.34); ATM.uFogDensity.value = 0.0003; ATM.uFogHeight.value = 300; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(0.35, 0.3, 0.22); ATM.uGlowPow.value = 6;
  ATM.uMoonHalo.value.setRGB(0.3, 0.27, 0.22); ATM.uFireFog.value.setRGB(0, 0, 0);
  const plume = dayPlume(ctx, scene, { steps: 96, density: 1.15, wind: [-0.36, -0.46] });
  const heli = makeMi8({ sling: true });
  scene.add(heli.group);
  const camA = P(760, 120, 520), camB = P(744, 121, 530), tgt = P(-20, 88, 0);
  const fwd = tgt.clone().sub(camA).normalize(); const right = V3(-fwd.z, 0, fwd.x).normalize();
  const mid = camA.clone().lerp(tgt, 0.55).add(V3(0, 14, 0));
  return {
    scene, camera,
    look: { uExposure: 0.78, uLookPow: 1.18, uLookSat: 0.92, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.05, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      const u = easeInOutSine(t / 8);
      placeCamera(camera, ctx, camA.clone().lerp(camB, u), tgt, { focal: 85, shake: 0.05, shakeFreq: 0.4, t, seed: 303 });
      const hp = mid.clone().addScaledVector(right, lerp(-70, 40, t / 8)).add(V3(0, Math.sin(t * 0.6) * 1.5, 0));
      heli.group.position.copy(hp);
      heli.group.rotation.set(0, Math.atan2(-right.z, right.x), 0); heli.group.rotateZ(-0.06); heli.group.rotateX(Math.sin(t * 0.5) * 0.02);
      heli.update(t);
      plume(t, camera, { sun: SUN, sunCol: [2.2, 2.05, 1.85], amb: [[0.17, 0.2, 0.26], [0.1, 0.09, 0.08]], fire: 0.22, h: 640 });
      return { dof: null };
    },
  };
}

// buses: LAZ-695 two-tone liveries and Ikarus-style yellow-orange
const BUS_LIVERY = [
  [[0.42, 0.06, 0.04], [0.6, 0.56, 0.46]], [[0.55, 0.36, 0.05], [0.6, 0.56, 0.46]], [[0.08, 0.16, 0.34], [0.6, 0.57, 0.48]],
  [[0.58, 0.3, 0.04], [0.58, 0.3, 0.04]], [[0.5, 0.42, 0.06], [0.6, 0.57, 0.48]], [[0.14, 0.26, 0.16], [0.58, 0.55, 0.45]],
];
function busColumn(scene, at, D, { from = 20, n = 22, gap = 12.6, l = -5.0, seed = 5, dir = -1 } = {}) {
  const rnd = mulberry32(seed); const buses = [];
  const F = D.clone().multiplyScalar(dir);
  for (let k = 0; k < n; k++) {
    const lv = BUS_LIVERY[Math.floor(rnd() * BUS_LIVERY.length)];
    const b = makeBus({ color: new THREE.Color(...lv[0]), cream: new THREE.Color(...lv[1]), seed: k });
    const s = from + k * gap + (rnd() - 0.5) * 1.5;
    b.group.position.copy(at(s, l + (rnd() - 0.5) * 0.3));
    b.group.rotation.y = Math.atan2(-F.z, F.x) + (rnd() - 0.5) * 0.02;
    scene.add(b.group); buses.push({ b, s });
  }
  return buses;
}

// ---------------- P5: 27 April, afternoon. The buses. ----------------
export async function P5(ctx) {
  const SUN = sunDir(180, 52);   // 14:00 Moscow time is solar noon at Pripyat
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false,
    sky: { uSunCol: [2.2, 2.05, 1.85], uZenith: [0.05, 0.1, 0.24], uHorizon: [0.3, 0.32, 0.35], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4,
      uCloudBright: [0.85, 0.84, 0.82], uCloudShade: [0.5, 0.53, 0.58], uCloudCover: 0.16, uSunDisk: 60 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(70, ctx.aspect), ctx.aspect, 0.3, 16000);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.87), sunI: 3.3, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: at(120, 10), extent: 220, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.06, 0.065, 0.055));
  LEAF_AMB.sky.value.setRGB(0.26, 0.29, 0.33);
  ATM.uMoonDir.value.copy(SUN);
  ATM.uFogColor.value.setRGB(0.3, 0.32, 0.35); ATM.uFogDensity.value = 0.0009; ATM.uFogHeight.value = 160; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(0.3, 0.26, 0.18); ATM.uGlowPow.value = 6;
  ATM.uMoonHalo.value.setRGB(0.25, 0.22, 0.17); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampGain.value = 0;
  const buses = busColumn(scene, at, D, { from: 162, n: 22, gap: -12.6, l: 5.0, dir: 1 });
  const rig = await loadRig();
  const vWalk = clipSpeed(rig, 'Walk');
  const rnd = mulberry32(77);
  const people = [];
  // residents walk from their entrances to the bus doors with what they could carry
  const bags = ['suitcase', 'suitcase', 'sack', 'handbag', 'case', null];
  for (let k = 0; k < 44; k++) {
    const bi = Math.floor(rnd() * 7); const bs = buses[bi].s;
    const door = at(bs + 3.4 - (rnd() < 0.4 ? 3.3 : 0), 6.9);
    const start = at(bs + 3 + (rnd() - 0.5) * 26, 15 + rnd() * 8);
    const kind = rnd() < 0.4 ? 'man' : rnd() < 0.82 ? 'woman' : 'child';
    const c = makeCivilian(rig, { seed: 100 + k, kind, bag: kind === 'child' ? null : bags[Math.floor(rnd() * bags.length)] });
    scene.add(c.root, c.ao);
    const rate = 0.95 + rnd() * 0.2;
    // stagger: some already close to the bus, some still coming out
    const total = start.distanceTo(door) / (vWalk * rate * c.scale);
    people.push({ c, from: start, to: door, rate, delay: -rnd() * total, total, offset: rnd() * 3, cycle: total + 1.5 + rnd() * 4 });
  }
  // a few waiting by the doors
  const waiting = [];
  for (let k = 0; k < 16; k++) {
    const bi = k % 6; const bs = buses[bi].s;
    const c = makeCivilian(rig, { seed: 200 + k, kind: k % 3 === 0 ? 'man' : 'woman', bag: k % 2 ? 'suitcase' : 'sack' });
    const p = at(bs + 3.4 + (rnd() - 0.5) * 3, 8.0 + rnd() * 1.8);
    c.root.position.copy(p); c.ao.position.set(p.x, 0.045, p.z);
    const fd = R.clone().multiplyScalar(-1).add(D.clone().multiplyScalar((rnd() - 0.5) * 1.2)); c.root.rotation.y = Math.atan2(fd.x, fd.z);
    scene.add(c.root, c.ao); waiting.push({ c, seed: k });
  }
  if (ctx.params.get('hide')) { const hs = ctx.params.get('hide').split(','); scene.traverse(o => { if (hs.includes(o.name)) o.visible = false; }); }
  const camA = at(212, 12.9, 1.62), camB = at(210.4, 12.7, 1.6);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.14, uLookSat: 0.86, uBloom: 0.05, uHalation: 0.06, uVignette: 0.5, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      const u = easeInOutSine(t / 9);
      placeCamera(camera, ctx, camA.clone().lerp(camB, u), at(100, 4.2, 3.0), { focal: 70, shake: 0.06, shakeFreq: 0.4, t, seed: 505 });
      for (const w of people) {
        const tt = (t - w.delay) % w.cycle;             // a steady stream: once aboard, another family sets out
        const vis = tt < w.total + 0.3;
        w.c.root.visible = vis; w.c.ao.visible = vis;
        if (vis) placeWalker(w.c, rig, { from: w.from, to: w.to, t: tt, speed: vWalk * w.rate, offset: w.offset, rate: w.rate });
      }
      for (const s of waiting) pose(s.c, 'Idle', t, { offset: s.seed * 0.7 });
      return debugCam(ctx, camera, at) || { dof: { focus: 40, focal: 70, fstop: 2.8 } };
    },
  };
}

// ---------------- P6: the convoy leaves; the smoke on the horizon ----------------
export async function P6(ctx) {
  const SUN = sunDir(232, 40);
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false, leafiness: 0.75,
    sky: { uSunCol: [2.3, 2.1, 1.8], uZenith: [0.05, 0.1, 0.23], uHorizon: [0.3, 0.31, 0.33], uDawn: [0.05, 0.035, 0.02], uDawnPow: 4,
      uCloudBright: [0.85, 0.84, 0.82], uCloudShade: [0.45, 0.48, 0.53], uCloudCover: 0.2, uSunDisk: 60 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(35, ctx.aspect), ctx.aspect, 1, 16000);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.93, 0.83), sunI: 3.2, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: at(200, 0), extent: 420, near: 100, far: 8000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.06, 0.065, 0.055));
  LEAF_AMB.sky.value.setRGB(0.26, 0.29, 0.33);
  ATM.uMoonDir.value.copy(SUN); ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(0.3, 0.32, 0.35); ATM.uFogDensity.value = 0.00055; ATM.uFogHeight.value = 160; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(0.3, 0.25, 0.17); ATM.uGlowPow.value = 6;
  ATM.uMoonHalo.value.setRGB(0.25, 0.22, 0.17); ATM.uFireFog.value.setRGB(0, 0, 0);
  // the column, heading west-north-west out of town at ~30 km/h
  const rnd = mulberry32(61);
  const col = [];
  for (let k = 0; k < 34; k++) {
    const lv = BUS_LIVERY[Math.floor(rnd() * BUS_LIVERY.length)];
    const b = makeBus({ color: new THREE.Color(...lv[0]), cream: new THREE.Color(...lv[1]), seed: k });
    b.group.rotation.y = Math.atan2(D.z, -D.x);
    scene.add(b.group); col.push({ b, off: k * 21 + (rnd() - 0.5) * 3, lat: -3.7 + (rnd() - 0.5) * 0.25 });
  }
  const lead = makeCar({ color: new THREE.Color(0.55, 0.42, 0.12) }); lead.group.rotation.y = Math.atan2(D.z, -D.x); scene.add(lead.group);
  const camA = at(-62, -1.0, 34), camB = at(-58, -1.2, 33.2);
  const tgt = at(170, -2.5, 0);
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.22, uLookSat: 0.88, uBloom: 0.05, uHalation: 0.06, uVignette: 0.5, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      const u = easeInOutSine(t / 8);
      placeCamera(camera, ctx, camA.clone().lerp(camB, u), tgt, { focal: 70, shake: 0.04, shakeFreq: 0.3, t, seed: 606 });
      const head = 70 - 8.0 * t;
      for (const c of col) c.b.group.position.copy(at(head + c.off, c.lat));
      lead.group.position.copy(at(head - 16, -3.6));
      return debugCam(ctx, camera, at) || { dof: { focus: 120, focal: 70, fstop: 4 } };
    },
  };
}

// a child's bicycle left lying on its side
function bicycle() {
  const g = new THREE.Group();
  const frameM = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.32, 0.05, 0.04), roughness: 0.45, metalness: 0.3 }), { key: 'bike' });
  const steel = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.5, 0.5, 0.5), roughness: 0.3, metalness: 0.9 }), { key: 'bikesteel' });
  const rub = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.8 }), { key: 'bikerub' });
  const tb = (a, b, r, m) => { const d = b.clone().sub(a); const L = d.length(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), m); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); c.castShadow = true; g.add(c); };
  const R0 = 0.25;
  for (const x of [-0.42, 0.42]) {
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(R0, 0.022, 8, 36), rub); tyre.position.set(x, R0, 0); tyre.castShadow = true; g.add(tyre);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R0 - 0.025, 0.008, 6, 36), steel); rim.position.set(x, R0, 0); g.add(rim);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; tb(V3(x, R0, 0), V3(x + Math.cos(a) * (R0 - 0.03), R0 + Math.sin(a) * (R0 - 0.03), 0), 0.002, steel); }
  }
  const bb = V3(-0.02, 0.24, 0), seat = V3(-0.14, 0.6, 0), head = V3(0.32, 0.58, 0);
  tb(V3(-0.42, R0, 0), bb, 0.013, frameM); tb(V3(-0.42, R0, 0), seat, 0.012, frameM); tb(bb, seat, 0.016, frameM); tb(seat, head, 0.016, frameM); tb(bb, head, 0.018, frameM); tb(head, V3(0.42, R0, 0), 0.014, frameM);
  tb(head, head.clone().add(V3(-0.02, 0.14, 0)), 0.012, steel); tb(V3(0.28, 0.72, -0.24), V3(0.28, 0.72, 0.24), 0.011, steel);
  const sd = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.09), rub); sd.position.copy(seat).add(V3(0, 0.04, 0)); g.add(sd);
  const ch = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 6, 20), steel); ch.position.copy(bb); g.add(ch);
  g.traverse(o => { o.frustumCulled = false; });
  return g;
}

// ---------------- P7: the same avenue at dusk, empty ----------------
export async function P7(ctx) {
  const SUN = sunDir(291.5, 3.2);
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false, washing: true,
    sky: { uSunCol: [3.4, 1.5, 0.45], uZenith: [0.018, 0.03, 0.075], uHorizon: [0.2, 0.12, 0.08], uDawn: [1.5, 0.55, 0.16], uDawnPow: 4,
      uCloudBright: [0.9, 0.42, 0.2], uCloudShade: [0.06, 0.05, 0.07], uCloudCover: 0.34, uSunDisk: 80 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(32, ctx.aspect), ctx.aspect, 0.2, 16000);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.42, 0.13), sunI: 2.6, skyColor: new THREE.Color(0.1, 0.12, 0.2), groundColor: new THREE.Color(0.03, 0.025, 0.02), hemiI: 0.04, center: at(60, 0), extent: 260, near: 100, far: 9000, mapSize: 4096 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.02, 0.018, 0.016));
  LEAF_AMB.sky.value.setRGB(0.07, 0.07, 0.1); LEAF_AMB.ground.value.setRGB(0.015, 0.012, 0.01);
  ATM.uMoonDir.value.copy(SUN); ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(0.04, 0.038, 0.045); ATM.uFogDensity.value = 0.0005; ATM.uFogHeight.value = 120; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(1.2, 0.5, 0.16); ATM.uGlowPow.value = 9;
  ATM.uMoonHalo.value.setRGB(1.4, 0.6, 0.2); ATM.uFireFog.value.setRGB(0, 0, 0);
  W.city.facadeMat.envMapIntensity = 0.3; W.city.facadeMat.userData.u.uDay.value = 0.45;
  // what was left behind
  const bike = bicycle(); bike.position.copy(at(154, -13.6, 0.0)); bike.rotation.set(0, Math.atan2(-R.z, R.x) + 0.35, 0); bike.rotateX(0.32); bike.position.y = 0.02;
  scene.add(bike);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.4, 0.05, 0.03), roughness: 0.5 }), { key: 'ball' }));
  ball.position.copy(at(138, -16.2, 0.11)); ball.castShadow = true; scene.add(ball);
  const case1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.16), patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.12, 0.07, 0.04), roughness: 0.6 }), { key: 'case' }));
  case1.position.copy(at(122, -8.9, 0.2)); case1.rotation.y = 0.4; case1.castShadow = true; scene.add(case1);
  // dust and pollen hanging in the low sun
  const dust = new Dust(ctx, { n: 5000, center: at(140, -2, 3).toArray(), size: [40, 6, 40], drift: [0.15, -0.02, 0.1], color: [0.0, 0.0, 0.0], gain: 1.2, focus: 30, aperture: 0.012 });
  dust.uniforms.uLightR.value = 1e6; scene.add(dust.mesh);
  if (ctx.params.get('hide')) { const hs = ctx.params.get('hide').split(','); scene.traverse(o => { if (hs.includes(o.name)) o.visible = false; }); }
  const camA = at(164, -11.9, 0.95), camB = at(161.5, -11.8, 0.95);
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.2, uLookSat: 0.95, uBloom: 0.09, uHalation: 0.12, uVignette: 0.65, uGrain: 0.05, uShadowTint: [0.9, 1.0, 1.15], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      const u = easeInOutSine(t / 10);
      placeCamera(camera, ctx, camA.clone().lerp(camB, u), at(-200, -4.5, 5), { focal: 32, shake: 0.05, shakeFreq: 0.3, t, seed: 707 });
      dust.uniforms.uLightPos.value.copy(camera.position).addScaledVector(SUN, 500);
      dust.uniforms.uLightCol.value.set(0.9, 0.42, 0.14);
      dust.update(camera);
      return debugCam(ctx, camera, at) || { dof: { focus: 10, focal: 32, fstop: 2.8 }, fade: smoothstep(8.2, 10.0, t) };
    },
  };
}

// Soviet street loudspeaker horn ("kolokol"): flared horn, driver can, bracket
function loudspeaker() {
  const g = new THREE.Group();
  const m = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.13, 0.145, 0.13), roughness: 0.5, metalness: 0.45 }), { key: 'horn' });
  const inner = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.05, 0.05, 0.05), roughness: 0.8, side: THREE.BackSide }), { key: 'horninner' });
  const prof = []; for (let i = 0; i <= 16; i++) { const u = i / 16; prof.push(new THREE.Vector2(0.055 + 0.25 * Math.pow(u, 2.2), u * 0.58)); }
  const horn = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), m); horn.material.side = THREE.FrontSide; horn.castShadow = true;
  const hornIn = new THREE.Mesh(new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p.x * 0.97, p.y)), 32), inner);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.012, 8, 40), m); lip.rotation.x = Math.PI / 2; lip.position.y = 0.58;
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.17, 20), m); can.position.y = -0.07; can.castShadow = true;
  const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.04, 20), m); capB.position.y = -0.17;
  const h = new THREE.Group(); h.add(horn, hornIn, lip, can, capB);
  h.rotation.z = -Math.PI / 2; // horn axis along +x
  g.add(h);
  const brk = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.05), m); brk.position.set(-0.05, -0.12, 0); g.add(brk);
  g.traverse(o => { o.frustumCulled = false; });
  return g;
}

// ---------------- P4: 27 April, 13:10. The announcement. ----------------
export async function P4(ctx) {
  const SUN = sunDir(168, 50);
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false,
    sky: { uSunCol: [2.2, 2.05, 1.85], uZenith: [0.05, 0.1, 0.24], uHorizon: [0.3, 0.32, 0.35], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4,
      uCloudBright: [0.85, 0.84, 0.82], uCloudShade: [0.5, 0.53, 0.58], uCloudCover: 0.16, uSunDisk: 60 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(100, ctx.aspect), ctx.aspect, 0.3, 16000);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.87), sunI: 3.3, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: at(45, -20), extent: 120, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.06, 0.065, 0.055));
  LEAF_AMB.sky.value.setRGB(0.26, 0.29, 0.33);
  ATM.uMoonDir.value.copy(SUN); ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(0.3, 0.32, 0.35); ATM.uFogDensity.value = 0.0005; ATM.uFogHeight.value = 200; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(0.3, 0.26, 0.18); ATM.uGlowPow.value = 6;
  ATM.uMoonHalo.value.setRGB(0.25, 0.22, 0.17); ATM.uFireFog.value.setRGB(0, 0, 0);
  // a pole on the verge carrying two horns, wire running down
  const poleM = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.36, 0.36, 0.34), roughness: 0.8 }), { key: 'hpole' });
  const base = at(40, -16.2);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 8.2, 12), poleM); pole.position.copy(base).setY(4.1); pole.castShadow = true; scene.add(pole);
  const hA = loudspeaker(); hA.position.copy(base).setY(7.2).addScaledVector(R, 0.18); hA.rotation.y = Math.atan2(-R.z, R.x) + 0.35; hA.rotateZ(-0.18); scene.add(hA);
  const hB = loudspeaker(); hB.position.copy(base).setY(7.0).addScaledVector(D, 0.18); hB.rotation.y = Math.atan2(-D.z, D.x) - 0.25; hB.rotateZ(-0.2); scene.add(hB);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 7.0, 4), new THREE.MeshBasicMaterial({ color: 0x050505 })); wire.position.copy(base).setY(3.6).addScaledVector(R, 0.12).addScaledVector(D, -0.08); scene.add(wire);
  // residents come out on their balconies to listen
  const rig = await loadRig();
  const listeners = [];
  const spots = W.balc.spots.filter(sp => sp.pos && Math.abs(sp.pos.clone().sub(st.S).dot(D) - 40) < 14 && sp.pos.clone().sub(st.S).dot(R) < 0 && sp.pos.y > 8 && sp.pos.y < 24);
  spots.slice(0, 5).forEach((sp, k) => {
    const c = makeCivilian(rig, { seed: 300 + k, kind: k % 3 === 2 ? 'man' : 'woman', bag: 'none' });
    c.root.position.copy(sp.pos); c.root.rotation.y = Math.atan2(sp.out.x, sp.out.z); c.ao.visible = false;
    scene.add(c.root); listeners.push({ c, k });
  });
  const camA = at(30.6, -13.3, 1.5), camB = at(31.4, -13.6, 1.5);
  const tgt = base.clone().setY(6.9).addScaledVector(R, -0.6);
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.16, uLookSat: 0.9, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      const u = easeInOutSine(t / 8);
      placeCamera(camera, ctx, camA.clone().lerp(camB, u), tgt, { focal: lerp(80, 90, u), shake: 0.05, shakeFreq: 0.35, t, seed: 404 });
      for (const l of listeners) pose(l.c, 'Idle', t, { offset: l.k * 0.9 });
      return debugCam(ctx, camera, at) || { dof: { focus: camera.position.distanceTo(hA.position), focal: lerp(80, 90, u), fstop: 1.6, maxCoc: 18 } };
    },
  };
}
