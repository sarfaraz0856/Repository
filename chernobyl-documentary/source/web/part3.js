// THE LIQUIDATORS (April–November 1986): sand drops from Mi-8s, the Red Forest, the men on the
// roof of Unit 3 with 90 seconds each, the completed sarcophagus, and Pripyat under snow.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { forestFloor, makeLiquidator, clipSpeed, LEAF_AMB, contactShadow } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { makeMi8 } from './lib/heli.js';
import { Dust } from './lib/fx.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { placeCamera } from './shots_plant.js';
import { dayPlume, streetWorld, debugCam, bicycle } from './part2.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const FEX = [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1100], [PLANT.x + 400, PLANT.z + 420, 120]];
const atP = (s, l, y = 0) => P(s, y, l);   // debug camera in plant-local x/z

function sky(ctx, sun, o) {
  const sk = makeDaySky({ noiseTex: ctx.noiseTex });
  for (const [k, v] of Object.entries(o)) { const u = sk.uniforms[k]; if (u.value?.setRGB && Array.isArray(v)) u.value.setRGB(...v); else u.value = v; }
  sk.uniforms.uSunDir.value.copy(sun);
  return sk;
}
function atmosphere({ sun, fog, density, height, glow, glowPow = 6, halo }) {
  ATM.uMoonDir.value.copy(sun); ATM.uLampMapOn.value = 0; ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(...fog); ATM.uFogDensity.value = density; ATM.uFogHeight.value = height; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(sun.x, 0, sun.z).normalize(); ATM.uGlowCol.value.setRGB(...glow); ATM.uGlowPow.value = glowPow;
  ATM.uMoonHalo.value.setRGB(...(halo || glow)); ATM.uFireFog.value.setRGB(0, 0, 0);
}
function plantSet(ctx, scene, { forest = 60000, tint = null, floorRed = null } = {}) {
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  plant.ground.position.copy(PLANT).setY(0.02); scene.add(plant.ground);
  const fc = [PLANT.x - 900, PLANT.z - 700];
  scene.add(buildForest(ctx, { center: fc, radius: 2600, count: forest, exclude: FEX, tint }));
  scene.add(forestFloor(ctx, { center: fc, radius: 2600, exclude: FEX, redAt: floorRed }));
  return plant;
}

// ---------------- Q1: a Mi-8 drops its load into the reactor ----------------
export async function Q1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(70, ctx.aspect), ctx.aspect, 3, 16000);
  const SUN = sunDir(198, 46);
  const sk = sky(ctx, SUN, { uSunCol: [2.1, 1.95, 1.75], uZenith: [0.05, 0.095, 0.2], uHorizon: [0.3, 0.31, 0.33], uDawn: [0.02, 0.015, 0.01], uCloudBright: [0.8, 0.79, 0.77], uCloudShade: [0.36, 0.38, 0.42], uCloudCover: 0.42, uSunDisk: 50 });
  scene.add(sk);
  plantSet(ctx, scene);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.88), sunI: 3.0, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: P(-40, 0, 0), extent: 450, near: 200, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.06, 0.065, 0.055));
  atmosphere({ sun: SUN, fog: [0.27, 0.3, 0.34], density: 0.00038, height: 300, glow: [0.32, 0.28, 0.2] });
  const plume = dayPlume(ctx, scene, { steps: 96, density: 1.1, wind: [-0.36, -0.46] });
  const heli = makeMi8({ sling: true }); scene.add(heli.group);
  const heli2 = makeMi8({ sling: true }); scene.add(heli2.group);
  // the released load: a fresh bag mesh following a ballistic path
  const sack = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.2, 0.17, 0.12), roughness: 0.95 }), { key: 'sack' });
  const bag = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 10), sack); bag.scale.set(1.1, 0.8, 1.0); bag.visible = false; scene.add(bag);
  const camA = P(560, 100, 380), camB = P(548, 102, 392), tgt = P(14, 142, 14);
  const T_REL = 3.6, G = 9.81;
  const hpos = (t) => P(36 - 1.5 * t - (t > 3.6 ? (t - 3.6) * 2.5 : 0), 166 + Math.sin(t * 0.7) * 0.8 + (t > T_REL ? (t - T_REL) * (t - T_REL) * 0.35 : 0), 36 - 1.5 * t);
  return {
    scene, camera,
    look: { uExposure: 0.85, uLookPow: 1.16, uLookSat: 0.9, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.05, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 11)), tgt, { focal: 70, shake: 0.06, shakeFreq: 0.4, t, seed: 811 });
      const hp = hpos(t); heli.group.position.copy(hp);
      heli.group.rotation.set(0, Math.PI * 0.85, 0); heli.group.rotateZ(t > T_REL ? -0.08 * smoothstep(T_REL, T_REL + 2, t) : 0.03); heli.update(t);
      if (heli.load) heli.load.visible = t < T_REL;
      // second helicopter waiting its turn further out
      heli2.group.position.copy(P(-210 + 3 * t, 240, -150 + 1.2 * t)); heli2.group.rotation.set(0, -0.4, 0); heli2.group.rotateZ(0.04); heli2.update(t + 1.7);
      // fall: released from 25 m under the helicopter with the helicopter's velocity
      const p0 = hpos(T_REL).add(V3(0, -25, 0)); const v0 = hpos(T_REL + 0.05).sub(hpos(T_REL)).multiplyScalar(20);
      const tf = t - T_REL; const pb = p0.clone().addScaledVector(v0, tf).add(V3(0, -0.5 * G * tf * tf, 0));
      const hit = pb.y < PLANT.y + 50;
      bag.visible = tf > 0 && !hit; bag.position.copy(pb); bag.rotation.set(tf * 0.6, tf * 0.3, 0);
      const tHit = T_REL + Math.sqrt(2 * (p0.y - (PLANT.y + 50)) / G);
      const k = t - tHit;
      const land = p0.clone().addScaledVector(v0, tHit - T_REL);
      if (k > 0) plume.vol.setFireball({ center: V3(land.x, PLANT.y + 52 + k * 3, land.z).toArray(), radius: 7 + 24 * (1 - Math.exp(-k * 1.4)), density: 1.1 * Math.exp(-k * 0.35), temp: 0, emis: 0 });
      else plume.vol.setFireball(null);
      plume(t, camera, { sun: SUN, sunCol: [2.1, 1.95, 1.75], amb: [[0.16, 0.19, 0.25], [0.1, 0.09, 0.08]], fire: 0.25, h: 640 });
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- Q2: the vehicle graveyard ----------------
// Buses, fire engines and helicopters that worked in the zone were too contaminated to use again
// and were left in fields such as Rassokha.
export async function Q2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(50, ctx.aspect), ctx.aspect, 1, 16000);
  const SUN = sunDir(215, 24);
  const sk = sky(ctx, SUN, { uSunCol: [1.3, 1.2, 1.05], uZenith: [0.1, 0.12, 0.16], uHorizon: [0.29, 0.3, 0.31], uDawn: [0.03, 0.02, 0.01], uCloudBright: [0.6, 0.6, 0.6], uCloudShade: [0.3, 0.31, 0.33], uCloudCover: 0.8, uSunDisk: 0 });
  scene.add(sk);
  const C = [-2400, -2600];
  const field = forestFloor(ctx, { center: C, radius: 1200, color: [0.07, 0.075, 0.045], y: 0.05 });
  scene.add(field);
  scene.add(buildForest(ctx, { center: C, radius: 1600, count: 40000, exclude: [[C[0], C[1], 330]], seed: 9 }));
  scene.add(forestFloor(ctx, { center: C, radius: 1600, exclude: [[C[0], C[1], 330]], y: 0.3 }));
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.88), sunI: 1.5, skyColor: new THREE.Color(0.4, 0.44, 0.5), groundColor: new THREE.Color(0.07, 0.07, 0.06), hemiI: 0.2, center: V3(C[0], 0, C[1]), extent: 160, near: 100, far: 6000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.07, 0.07, 0.06));
  atmosphere({ sun: SUN, fog: [0.29, 0.3, 0.31], density: 0.001, height: 120, glow: [0.08, 0.07, 0.05] });
  const rnd = mulberry32(21);
  const dull = (c) => new THREE.Color(...c).multiplyScalar(0.7);
  const { makeBus } = await import('./lib/street.js');
  const { makeFireTruck } = await import('./lib/people.js');
  const LIV = [[[0.42, 0.06, 0.04], [0.6, 0.56, 0.46]], [[0.55, 0.36, 0.05], [0.6, 0.56, 0.46]], [[0.08, 0.16, 0.34], [0.6, 0.57, 0.48]], [[0.58, 0.3, 0.04], [0.58, 0.3, 0.04]]];
  for (let row = 0; row < 4; row++) for (let k = 0; k < 14; k++) {
    const lv = LIV[Math.floor(rnd() * LIV.length)];
    const b = makeBus({ color: dull(lv[0]), cream: dull(lv[1]) });
    b.group.position.set(C[0] - 60 + k * 3.4 + rnd() * 0.3, 0, C[1] - 40 + row * 13 + rnd() * 0.6);
    b.group.rotation.y = Math.PI / 2 + (rnd() - 0.5) * 0.06; b.headMat.color.setRGB(0.08, 0.08, 0.075); scene.add(b.group);
  }
  for (let k = 0; k < 9; k++) {
    const tr = makeFireTruck(ctx, { seed: k }); tr.beaconMat.color.setRGB(0.05, 0.06, 0.1);
    tr.group.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial) o.material.color.setRGB(0.06, 0.06, 0.055); });
    tr.group.traverse(o => { if (o.isMesh && o.material.color && o.material !== tr.beaconMat) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.75); } });
    tr.group.position.set(C[0] - 58 + k * 3.6, 0, C[1] + 16 + rnd()); tr.group.rotation.y = Math.PI + (rnd() - 0.5) * 0.05; scene.add(tr.group);
  }
  for (let k = 0; k < 4; k++) {
    const h = makeMi8({ sling: false, parked: true }); h.group.position.set(C[0] - 30 + k * 26, 0.0, C[1] + 34); h.group.rotation.y = -0.3 + k * 0.2; h.update(k * 3.1); scene.add(h.group);
  }
  const camA = V3(C[0] + 30, 6.5, C[1] - 92), camB = V3(C[0] + 22, 6.8, C[1] - 86);
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.18, uLookSat: 0.75, uBloom: 0.04, uHalation: 0.05, uVignette: 0.6, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.06], uHighTint: [1.03, 1.0, 0.95] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 9)), V3(C[0] - 22, 2.5, C[1] - 12), { focal: 50, shake: 0.03, shakeFreq: 0.3, t, seed: 822 });
      return debugCam(ctx, camera, (s, l, y = 0) => V3(C[0] + s, y, C[1] + l)) || { dof: { focus: 60, focal: 50, fstop: 4 } };
    },
  };
}

// ---------------- Q3: the roof by the stack, 90 seconds each ----------------
export async function Q3(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(24, ctx.aspect), ctx.aspect, 0.15, 16000);
  const SUN = sunDir(205, 32);
  const sk = sky(ctx, SUN, { uSunCol: [1.2, 1.15, 1.05], uZenith: [0.09, 0.11, 0.15], uHorizon: [0.3, 0.31, 0.32], uDawn: [0.0, 0.0, 0.0], uCloudBright: [0.6, 0.6, 0.6], uCloudShade: [0.3, 0.31, 0.33], uCloudCover: 0.85, uSunDisk: 0 });
  scene.add(sk);
  const plant = plantSet(ctx, scene, { forest: 30000 });
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.97, 0.92), sunI: 1.4, skyColor: new THREE.Color(0.4, 0.44, 0.5), groundColor: new THREE.Color(0.08, 0.08, 0.07), hemiI: 0.25, center: P(-58, 44, 4), extent: 80, near: 100, far: 6000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.08, 0.08, 0.07));
  atmosphere({ sun: SUN, fog: [0.3, 0.31, 0.33], density: 0.0007, height: 200, glow: [0.1, 0.1, 0.09] });
  // roof dressing on block V (roof at 44 m, x -80..-36, z -25..33): graphite blocks, broken
  // panels and twisted beams thrown out by the explosion; a low parapet; the stair-house door
  const rnd = mulberry32(33);
  const blockG = new THREE.BoxGeometry(0.25, 0.25, 0.6);
  const graphite = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.05, 0.05, 0.05), roughness: 0.7, metalness: 0.2 }), { key: 'graphite' });
  const blocks = new THREE.InstancedMesh(blockG, graphite, 520);
  const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const debris = [];
  let n = 0;
  while (n < 520) {
    const x = -78 + rnd() * 41, z = -22 + rnd() * 53;
    if (Math.abs(x + 58) < 9.5 && Math.abs(z - 4) < 9.5 && !(Math.abs(x + 58) > 7 || Math.abs(z - 4) > 7)) continue;
    if (x < -72 && z > 18) continue;            // keep the doorway clear
    const dens = 0.35 + 0.65 * smoothstep(-75, -40, x);
    if (rnd() > dens) continue;
    q.setFromEuler(new THREE.Euler(rnd() * 0.6, rnd() * 6.28, rnd() * 0.6));
    const sc = 0.7 + rnd() * 0.9;
    m4.compose(P(x, 44.12, z), q, V3(sc, sc, sc)); blocks.setMatrixAt(n++, m4); debris.push([x, z]);
  }
  blocks.castShadow = true; blocks.receiveShadow = true; scene.add(blocks);
  const conc = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.28, 0.28, 0.27), roughness: 0.9 }), { key: 'roofconc' });
  const steel = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.12, 0.1, 0.09), roughness: 0.6, metalness: 0.6 }), { key: 'roofsteel' });
  for (let k = 0; k < 40; k++) {
    const x = -70 + rnd() * 32, z = -20 + rnd() * 50;
    if (Math.abs(x + 58) < 10 && Math.abs(z - 4) < 10) continue;
    const pnl = new THREE.Mesh(new THREE.BoxGeometry(0.8 + rnd() * 1.8, 0.12, 0.6 + rnd() * 1.4), conc);
    pnl.position.copy(P(x, 44.15 + rnd() * 0.2, z)); pnl.rotation.set(rnd() * 0.4, rnd() * 6, rnd() * 0.4); pnl.castShadow = true; pnl.receiveShadow = true; scene.add(pnl);
  }
  for (let k = 0; k < 22; k++) {
    const a = P(-68 + rnd() * 30, 44.1, -18 + rnd() * 46); const L = 1 + rnd() * 3;
    const b = a.clone().add(V3((rnd() - 0.5) * L, rnd() * 1.2, (rnd() - 0.5) * L));
    const d = b.clone().sub(a); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, d.length(), 5), steel);
    c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); c.castShadow = true; scene.add(c);
  }
  const roofTop = new THREE.Mesh(new THREE.BoxGeometry(44, 0.1, 58), patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.09, 0.09, 0.09), roughness: 0.85 }), { key: 'roofbit' }));
  roofTop.position.copy(P(-58, 44.05, 4)); roofTop.receiveShadow = true; scene.add(roofTop);
  for (const [x, z, w, d] of [[-58, -25, 44, 0.3], [-58, 33, 44, 0.3], [-36.2, 4, 0.3, 58]]) { const pw = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, d), conc); pw.position.copy(P(x, 44.35, z)); pw.castShadow = true; scene.add(pw); }
  const stairs = new THREE.Mesh(new THREE.BoxGeometry(5, 3.2, 5), conc); stairs.position.copy(P(-80.5, 45.6, 27)); stairs.castShadow = true; scene.add(stairs);
  // the men
  const rig = await loadRig();
  const vRun = clipSpeed(rig, 'Run');
  const men = [];
  const door = P(-77.2, 44.1, 24.0);
  for (let k = 0; k < 6; k++) {
    const c = makeLiquidator(rig, { seed: 400 + k, helmet: k % 2 ? 'hat' : 'cap' }); scene.add(c.root, c.ao);
    const edge = P(-39.5 - rnd() * 1.5, 44.1, 8 + k * 3.6 + rnd() * 1.5);
    men.push({ c, edge, t0: 0.15 + k * 0.85 + rnd() * 0.3, rate: 0.92 + rnd() * 0.12 });
  }
  // thrown debris arcs over the edge when each man arrives
  const throwG = new THREE.BoxGeometry(0.25, 0.25, 0.5);
  const thrown = men.map(() => { const b = new THREE.Mesh(throwG, graphite); b.castShadow = true; b.visible = false; scene.add(b); return b; });
  const plume = dayPlume(ctx, scene, { steps: 80, density: 0.3, wind: [-0.25, -0.4] });
  const camA = P(-79.6, 45.62, 26.2), camB = P(-79.2, 45.6, 25.9);
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.25, uLookSat: 0.55, uBloom: 0.05, uHalation: 0.08, uVignette: 0.75, uGrain: 0.11, uShadowTint: [0.95, 1.0, 1.05], uHighTint: [1.04, 1.0, 0.94] },
    update(t) {
      const tg = P(-40, 45.2, 12 + Math.sin(t * 0.3) * 2);
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 13)), tg, { focal: 24, shake: 0.45, shakeFreq: 0.9, jolt: 0.25, joltFreq: 6, t, seed: 833 });
      men.forEach((m, k) => {
        const run = door.distanceTo(m.edge) / (vRun * m.rate * m.c.scale);
        const pauseT = 1.4;
        let tt = t - m.t0; const cyc = run * 2 + pauseT + 0.6;
        tt = ((tt % cyc) + cyc) % cyc;
        const vis = t >= m.t0 || true;
        let pos, dir, clip, off = k * 0.3;
        if (tt < run) { pos = door.clone().lerp(m.edge, tt / run); dir = m.edge.clone().sub(door); clip = 'Run'; }
        else if (tt < run + pauseT) { pos = m.edge.clone(); dir = m.edge.clone().sub(door); clip = 'Idle'; }
        else if (tt < run * 2 + pauseT) { const u = (tt - run - pauseT) / run; pos = m.edge.clone().lerp(door, u); dir = door.clone().sub(m.edge); clip = 'Run'; }
        else { pos = door.clone(); dir = door.clone().sub(m.edge); clip = 'Idle'; }
        if (t < m.t0) { pos = door.clone(); dir = m.edge.clone().sub(door); clip = 'Idle'; }
        const hidden = t < m.t0 || (tt >= run * 2 + pauseT);
        m.c.root.visible = !hidden; m.c.ao.visible = !hidden;
        m.c.root.position.copy(pos); m.c.root.rotation.y = Math.atan2(dir.x, dir.z); m.c.ao.position.set(pos.x, PLANT.y + 44.16, pos.z);
        pose(m.c, clip, t, { offset: off, rate: clip === 'Run' ? m.rate : 1 });
        // the block he heaves over the parapet
        const th = tt - run - 0.35;
        const b = thrown[k];
        if (t >= m.t0 && th > 0 && th < 2.2) {
          b.visible = true;
          const o = m.edge.clone().add(V3(0.5, 1.2, 0));
          b.position.copy(o).add(V3(th * 4.5, th * 3.2 - 4.9 * th * th, th * 0.4)); b.rotation.set(th * 5, th * 3, 0);
        } else b.visible = false;
      });
      plume(t, camera, { sun: SUN, sunCol: [1.2, 1.15, 1.05], amb: [[0.22, 0.23, 0.26], [0.12, 0.12, 0.11]], fire: 0.0, h: 300, density: 0.25 });
      return debugCam(ctx, camera, atP) || { dof: { focus: 14, focal: 24, fstop: 5.6 } };
    },
  };
}

// ---------------- Q4: the sarcophagus, completed, November dusk ----------------
function sarcophagus() {
  const g = new THREE.Group();
  const conc = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.3, 0.3, 0.29), roughness: 0.95 }), { key: 'sarcconc' });
  const dark = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.15, 0.15, 0.15), roughness: 0.7, metalness: 0.5 }), { key: 'sarcsteel' });
  const B = (w, h, d, x, y, z, m = conc) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y + h / 2, z); b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  // north: the stepped "cascade" wall
  for (let k = 0; k < 4; k++) B(80, 52 - k * 11, 7, 2, 0, -33 - k * 7 - 3.5);
  // east: buttressed wall with counterforts
  B(9, 58, 76, 41, 0, 3);
  for (let k = 0; k < 6; k++) B(5, 40, 3, 47.5, 0, -30 + k * 13);
  // south: wall up to the roof
  B(76, 56, 6, 2, 0, 40);
  // roof: big pipes laid across, plus steel plates
  for (let k = 0; k < 26; k++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 74, 10), dark); p.rotation.x = Math.PI / 2; p.position.set(-30 + k * 2.55, 62.5, 3); p.castShadow = true; g.add(p); }
  B(70, 0.4, 72, 2, 61.6, 3, dark);
  // the western stepped "beam" supporting the roof, and the stack stays as it was
  B(6, 66, 76, -36, 0, 3);
  return g;
}
function crawlerCrane(boomL, boomAng, mat) {
  const g = new THREE.Group();
  const add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  add(new THREE.BoxGeometry(14, 3, 9), 0, 1.5, 0);
  add(new THREE.BoxGeometry(9, 5, 7), -1, 5.5, 0);
  add(new THREE.BoxGeometry(5, 3.5, 7.5), -6, 4.5, 0);
  // lattice boom approximated by four chords and batten plates
  const boom = new THREE.Group(); boom.position.set(3, 7, 0); boom.rotation.z = boomAng; g.add(boom);
  for (const [dy, dz] of [[0.9, 0.9], [-0.9, 0.9], [0.9, -0.9], [-0.9, -0.9]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(boomL, 0.25, 0.25), mat); c.position.set(boomL / 2, dy, dz); c.castShadow = true; boom.add(c); }
  for (let k = 0; k < boomL / 4; k++) for (const dz of [0.9, -0.9]) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.15), mat); d.position.set(k * 4 + 2, 0, dz); d.rotation.z = 0.75 * (k % 2 ? 1 : -1); boom.add(d); }
  const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 30, 4), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  hook.position.set(boomL, -15, 0); boom.add(hook); hook.rotation.z = -boomAng;
  return g;
}
export async function Q4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(100, ctx.aspect), ctx.aspect, 5, 16000);
  const SUN = sunDir(238, 2.5);
  const sk = sky(ctx, SUN, { uSunCol: [3.0, 1.3, 0.4], uZenith: [0.02, 0.03, 0.065], uHorizon: [0.16, 0.1, 0.075], uDawn: [1.1, 0.42, 0.13], uDawnPow: 3, uCloudBright: [0.7, 0.32, 0.15], uCloudShade: [0.05, 0.045, 0.055], uCloudCover: 0.55, uSunDisk: 60 });
  scene.add(sk);
  const plant = plantSet(ctx, scene, { forest: 50000 });
  // unit 4 is enclosed: hide nothing, the shell simply surrounds the ruin
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  const craneMat = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.45, 0.3, 0.06), roughness: 0.7 }), { key: 'demag' });
  const cr1 = crawlerCrane(110, 1.15, craneMat); cr1.position.copy(P(80, 0, -40)); cr1.rotation.y = Math.PI * 0.95; scene.add(cr1);
  const cr2 = crawlerCrane(95, 1.05, craneMat); cr2.position.copy(P(20, 0, -95)); cr2.rotation.y = Math.PI * 0.5; scene.add(cr2);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.42, 0.14), sunI: 2.0, skyColor: new THREE.Color(0.12, 0.13, 0.2), groundColor: new THREE.Color(0.03, 0.025, 0.02), hemiI: 0.08, center: P(0, 0, 0), extent: 300, near: 200, far: 9000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.02, 0.018, 0.016));
  atmosphere({ sun: SUN, fog: [0.05, 0.045, 0.05], density: 0.0005, height: 150, glow: [1.0, 0.42, 0.14], glowPow: 8, halo: [1.2, 0.5, 0.16] });
  // work lights on the cranes and the site
  const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.75, 0.45).multiplyScalar(40) });
  const redM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.05, 0.02).multiplyScalar(30) });
  for (const p of [P(78, 9, -44), P(18, 9, -99), P(60, 2, -70), P(-20, 2, -80), P(46, 58, -20)]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), lampM); l.position.copy(p); scene.add(l); }
  for (const p of [P(80 + Math.cos(1.15) * 110 * Math.cos(Math.PI * 0.95), 7 + Math.sin(1.15) * 110, -40 - Math.cos(1.15) * 110 * Math.sin(Math.PI * 0.95))]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), redM); l.position.copy(p); scene.add(l); }
  const plume = dayPlume(ctx, scene, { steps: 70, density: 0.15, wind: [-0.2, -0.3] });
  const camA = P(640, 36, 250), camB = P(628, 36.5, 262), tgt = P(-10, 48, 0);
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.2, uLookSat: 0.95, uBloom: 0.09, uHalation: 0.12, uVignette: 0.65, uGrain: 0.05, uShadowTint: [0.9, 1.0, 1.15], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 11)), tgt, { focal: 100, shake: 0.03, shakeFreq: 0.3, t, seed: 844 });
      plume(t, camera, { sun: SUN, sunCol: [2.4, 1.0, 0.35], amb: [[0.04, 0.045, 0.07], [0.03, 0.02, 0.015]], fire: 0.0, h: 220, density: 0.12 });
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- Q5: winter. The avenue under snow. ----------------
export async function Q5(ctx) {
  const SUN = sunDir(200, 12);
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false, washing: false, leafiness: 0.0, spring: 0.0, snow: 1,
    sky: { uSunCol: [0.5, 0.5, 0.52], uZenith: [0.16, 0.17, 0.19], uHorizon: [0.3, 0.3, 0.31], uDawn: [0.0, 0.0, 0.0], uDawnPow: 4,
      uCloudBright: [0.42, 0.42, 0.43], uCloudShade: [0.27, 0.27, 0.29], uCloudCover: 0.95, uSunDisk: 0 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(32, ctx.aspect), ctx.aspect, 0.2, 16000);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(0.9, 0.92, 0.98), sunI: 0.35, skyColor: new THREE.Color(0.42, 0.44, 0.48), groundColor: new THREE.Color(0.3, 0.3, 0.31), hemiI: 0.5, center: at(120, 0), extent: 220, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.25, 0.25, 0.26));
  scene.environmentIntensity = 0.8;
  atmosphere({ sun: SUN, fog: [0.27, 0.28, 0.3], density: 0.0028, height: 160, glow: [0.0, 0.0, 0.0] });
  W.city.facadeMat.userData.u.uDay.value = 0.35;
  const bike = bicycle(); bike.position.copy(at(154, -13.6, 0.0)); bike.rotation.set(0, Math.atan2(-R.z, R.x) + 0.35, 0); bike.rotateX(0.32); bike.position.y = 0.02; scene.add(bike);
  const snow = new Dust(ctx, { n: 9000, center: at(140, -6, 6).toArray(), size: [40, 14, 40], drift: [0.35, -1.1, 0.25], color: [0.5, 0.5, 0.52], gain: 1.1, focus: 9, aperture: 0.01 });
  scene.add(snow.mesh);
  const camA = at(164, -11.9, 1.25), camB = at(160.5, -11.8, 1.25);
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.1, uLookSat: 0.7, uBloom: 0.05, uHalation: 0.06, uVignette: 0.6, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.08], uHighTint: [1.02, 1.0, 0.98] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), at(-200, -4.5, 5), { focal: 32, shake: 0.04, shakeFreq: 0.3, t, seed: 855 });
      snow.update(camera);
      return debugCam(ctx, camera, at) || { dof: { focus: 12, focal: 32, fstop: 2.8 }, fade: smoothstep(13.4, 15.0, t) };
    },
  };
}
