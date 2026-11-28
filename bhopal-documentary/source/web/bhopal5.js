// BHOPAL, chapter 5 – THE HOSPITAL (Hamidia Hospital, the morning of 3 December 1984).
// F5A the hospital at dawn, crowds outside; F5B a corridor full of patients on the floor;
// F5C a doctor at a bed with water and eye drops; F5D a ward in the morning light.
import * as THREE from 'three';
import { ATM } from './lib/atmos.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit } from './lib/bhopal.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian, makeBus, makeCar } from './lib/street.js';

export const HOS = V3(300, 0, 1350);
const H = (x, y, z) => V3(HOS.x + x, y, HOS.z + z);
const glowM = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false });
function dcam(ctx, camera, o = V3(0, 0, 0)) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(o.x + x, y, o.z + z); camera.up.set(0, 1, 0); camera.lookAt(o.x + tx, ty, o.z + tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const DAWN = { az: 112, el: 6, sunCol: [1.0, 0.62, 0.34], sunI: 2.2, skyCol: [0.42, 0.48, 0.6], groundCol: [0.2, 0.16, 0.12], hemiI: 0.75, fog: [0.5, 0.46, 0.42], density: 0.0024, fogH: 60, glow: [0.8, 0.45, 0.2], halo: [0.9, 0.5, 0.25],
  sky: { uSunCol: [2.4, 1.4, 0.7], uZenith: [0.08, 0.11, 0.2], uHorizon: [0.42, 0.37, 0.33], uDawn: [0.7, 0.35, 0.14], uDawnPow: 3.5, uCloudBright: [0.9, 0.65, 0.45], uCloudShade: [0.32, 0.31, 0.34], uCloudCover: 0.35, uSunDisk: 60 } };

// a body under a sheet, lying on the floor or a bed
export function covered(g, x, y, z, ry, col, rnd) {
  const m = lit(col, 1, 0, 'cov' + col.join('')), skin = lit([0.26, 0.16, 0.1], 0.7, 0, 'covskin');
  const bg = new THREE.CapsuleGeometry(0.2, 1.25, 6, 12); bg.rotateZ(Math.PI / 2); bg.scale(1, 0.62, 1.25);
  const b = new THREE.Mesh(bg, m); b.rotation.y = ry; b.position.set(x, y + 0.14, z); b.castShadow = true; b.receiveShadow = true; g.add(b);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), skin); hd.position.set(x + Math.cos(ry) * 0.85, y + 0.16, z - Math.sin(ry) * 0.85); hd.castShadow = true; g.add(hd);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.1), lit([0.62, 0.6, 0.55], 1, 0, 'covsheet')); sheet.rotation.x = -Math.PI / 2; sheet.rotation.z = ry; sheet.position.set(x, y + 0.012, z); sheet.receiveShadow = true; g.add(sheet);
}
function hospitalBlock(scene) {
  const g = new THREE.Group(); g.position.copy(HOS); scene.add(g); const rnd = mulberry32(5);
  const wall = lit([0.62, 0.57, 0.46], 0.9, 0, 'hswall'), trim = lit([0.48, 0.4, 0.3], 0.9, 0, 'hstrim'), dark = lit([0.05, 0.045, 0.04], 0.9, 0, 'hsdark'), roof = lit([0.38, 0.35, 0.3], 0.9, 0, 'hsroof');
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(130, 12, 14), wall, 0, 6, -10);
  add(new THREE.BoxGeometry(131, 0.8, 15), trim, 0, 12.4, -10);
  add(new THREE.BoxGeometry(20, 15, 18), wall, 0, 7.5, -8); add(new THREE.BoxGeometry(21, 0.8, 19), trim, 0, 15.4, -8);
  // ground-floor verandah: columns and a deep shadow behind; upper floors: windows
  for (let x = -62; x <= 62; x += 4.2) { if (Math.abs(x) < 10) continue; add(new THREE.BoxGeometry(0.5, 3.6, 0.5), trim, x, 1.8, -2.6); }
  add(new THREE.BoxGeometry(124, 3.4, 0.1), dark, 0, 1.7, -3.05);
  add(new THREE.BoxGeometry(126, 0.4, 3), trim, 0, 3.8, -2.5);
  for (let f = 1; f < 3; f++) for (let x = -60; x <= 60; x += 4.2) { if (Math.abs(x) < 10) continue; add(new THREE.PlaneGeometry(1.4, 2.0), rnd() < 0.15 ? glowM(1.1, 0.95, 0.7) : dark, x, f * 4 + 2.1, -2.94); }
  add(new THREE.PlaneGeometry(6, 4.5), dark, 0, 2.6, 1.02);   // main entrance
  add(new THREE.BoxGeometry(12, 0.4, 6), trim, 0, 5.0, 3);    // porch
  for (const x of [-5.5, 5.5]) add(new THREE.BoxGeometry(0.6, 5, 0.6), trim, x, 2.5, 5.7);
  // compound wall and gate posts
  for (const [x, z, w, d] of [[-50, 60, 90, 0.4], [50, 60, 70, 0.4]]) add(new THREE.BoxGeometry(w, 1.8, d), trim, x, 0.9, z);
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(160, 70), lit([0.32, 0.27, 0.2], 1, 0, 'hsyard')); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.03, 25); yard.receiveShadow = true; g.add(yard);
  return g;
}

// ---------------- F5A: the hospital at dawn ----------------
export async function F5A(ctx) {
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0.0, day: { ...DAWN, center: HOS, extent: 160 }, carve: [[HOS.x - 90, HOS.x + 90, HOS.z - 30, HOS.z + 70]] });
  const { scene, camera } = W;
  const hb = hospitalBlock(scene); const rnd = mulberry32(9);
  const rig = await loadRig(); const cs = [];
  for (let i = 0; i < 70; i++) {
    const c = makeCivilian(rig, { seed: 600 + i, india: true, kind: rnd() < 0.12 ? 'child' : rnd() < 0.5 ? 'woman' : 'man', bag: rnd() < 0.2 ? 'sack' : 'none' });
    c.root.position.copy(H(-45 + rnd() * 90, 0, 2 + rnd() * 40)); c.root.rotation.y = rnd() * 6.28; scene.add(c.root); c.off = rnd() * 3; cs.push(c);
  }
  for (let i = 0; i < 26; i++) covered(hb, -40 + rnd() * 80, 0.03, 6 + rnd() * 30, rnd() * 3.14, [[0.55, 0.52, 0.46], [0.5, 0.15, 0.1], [0.2, 0.25, 0.4], [0.45, 0.4, 0.2]][i % 4], rnd);
  const truck = makeBus({ color: new THREE.Color(0.2, 0.3, 0.2), cream: new THREE.Color(0.45, 0.44, 0.38), seed: 4 }); truck.group.position.copy(H(30, 0, 48)); truck.group.rotation.y = 1.4; scene.add(truck.group);
  for (const [x, z, r, col] of [[-25, 50, 0.3, [0.6, 0.6, 0.56]], [-15, 52, -0.2, [0.15, 0.15, 0.16]]]) { const car = makeCar({ color: new THREE.Color(...col) }); car.group.position.copy(H(x, 0, z)); car.group.rotation.y = r; scene.add(car.group); }
  const A = H(-38, 9, 78), B = H(-28, 7.5, 70);
  return {
    scene, camera,
    look: { uExposure: 1.15, uLookPow: 1.2, uLookSat: 0.9, uBloom: 0.08, uHalation: 0.1, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), H(0, 3, 0), { focal: 28, shake: 0.05, shakeFreq: 0.3, t, seed: 5101 });
      cs.forEach((c, i) => pose(c, i % 5 === 0 ? 'Walk' : 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera, HOS) || {};
    },
  };
}

// ---------------- interiors: a corridor, a treatment bed, a ward ----------------
function interior(ctx, { len = 40, wid = 4, hgt = 4, side = 'arches', sunAz = 0.9 }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 400);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const wall = lit([0.6, 0.58, 0.5], 0.95, 0, 'inwall'), dado = lit([0.3, 0.42, 0.38], 0.8, 0, 'indado'), floor = lit([0.36, 0.33, 0.28], 0.7, 0, 'infloor'), ceil = lit([0.6, 0.6, 0.57], 0.95, 0, 'inceil');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.PlaneGeometry(wid, len), floor, 0, 0, -len / 2, -Math.PI / 2);
  add(new THREE.PlaneGeometry(wid, len), ceil, 0, hgt, -len / 2, Math.PI / 2);
  add(new THREE.PlaneGeometry(len, hgt), wall, -wid / 2, hgt / 2, -len / 2, 0, Math.PI / 2);
  add(new THREE.PlaneGeometry(len, 1.2), dado, -wid / 2 + 0.01, 0.6, -len / 2, 0, Math.PI / 2);
  add(new THREE.PlaneGeometry(wid, hgt), wall, 0, hgt / 2, -len, 0, 0);
  // the outer wall on +x: openings (arches or tall windows) letting in the low sun
  for (let z = -2; z > -len + 1; z -= 4) {
    add(new THREE.BoxGeometry(0.4, hgt, 0.7), wall, wid / 2 + 0.2, hgt / 2, z);
    add(new THREE.BoxGeometry(0.4, side === 'arches' ? 0.9 : 1.6, 3.3), wall, wid / 2 + 0.2, hgt - (side === 'arches' ? 0.45 : 0.8), z - 2);
    if (side !== 'arches') add(new THREE.BoxGeometry(0.4, 0.9, 3.3), wall, wid / 2 + 0.2, 0.45, z - 2);
  }
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(len + 20, 30), glowM(2.6, 2.1, 1.6)); outside.position.set(wid / 2 + 6, 6, -len / 2); outside.rotation.y = -Math.PI / 2; scene.add(outside);
  const sun = new THREE.DirectionalLight(new THREE.Color(1.0, 0.75, 0.5), 3.2); sun.position.set(wid / 2 + 30, 14, -len / 2 + 30 * Math.cos(sunAz)); sun.target.position.set(0, 0, -len / 2);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); const c = sun.shadow.camera; c.left = -len; c.right = len; c.top = len; c.bottom = -len; c.near = 1; c.far = 120; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.5, 0.52, 0.55), new THREE.Color(0.2, 0.16, 0.12), 0.5));
  const fill = new THREE.PointLight(new THREE.Color(0.9, 0.85, 0.75), 6, 20, 2); fill.position.set(0, hgt - 0.4, -len * 0.3); scene.add(fill);
  return { scene, camera, add };
}
export async function F5B(ctx) {
  const I = interior(ctx, { len: 44, wid: 4.2, hgt: 4.2, side: 'arches' }); const { scene, camera } = I;
  const rnd = mulberry32(13); const g = new THREE.Group(); scene.add(g);
  for (let z = -3; z > -42; z -= 1.15) if (rnd() < 0.85) covered(g, -1.15 + (rnd() - 0.5) * 0.2, 0, z, Math.PI + (rnd() - 0.5) * 0.25, [[0.6, 0.58, 0.52], [0.5, 0.15, 0.1], [0.2, 0.25, 0.42], [0.42, 0.38, 0.18], [0.15, 0.3, 0.2]][Math.floor(rnd() * 5)], rnd);
  for (let z = -6; z > -40; z -= 2.6) if (rnd() < 0.5) covered(g, 1.15, 0, z, 0, [0.55, 0.52, 0.46], rnd);
  const rig = await loadRig(); const cs = [];
  for (let i = 0; i < 14; i++) {
    const nurse = i % 4 === 0;
    const c = makeCivilian(rig, { seed: 700 + i, india: true, kind: nurse ? 'woman' : rnd() < 0.5 ? 'woman' : 'man', bag: 'none', outfit: nurse ? { top: [0.75, 0.75, 0.72], leg: [0.75, 0.75, 0.72] } : null });
    c.root.position.set(0.2 + (rnd() - 0.5) * 1.2, 0, -5 - rnd() * 34); c.root.rotation.y = rnd() * 6.28; scene.add(c.root); c.off = rnd() * 3; cs.push(c);
  }
  const A = V3(0.4, 1.65, -0.5), B = V3(0.3, 1.6, -6.5);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.1, uHalation: 0.12, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-0.2, 1.0, -30), { focal: 30, shake: 0.06, shakeFreq: 0.35, t, seed: 5202 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera) || { dof: { focus: 8, focal: 30, fstop: 2.8 } };
    },
  };
}
export async function F5C(ctx) {
  const I = interior(ctx, { len: 16, wid: 7, hgt: 4.2, side: 'windows', sunAz: 1.2 }); const { scene, camera, add } = I;
  const steel = lit([0.5, 0.52, 0.5], 0.4, 0.6, 'f5steel'), white = lit([0.7, 0.7, 0.67], 0.9, 0, 'f5white');
  const g = new THREE.Group(); scene.add(g); const rnd = mulberry32(17);
  // an iron bed with a patient, a side table with a water jug, steel bowl, bottles and cotton
  add(new THREE.BoxGeometry(0.95, 0.12, 2.0), white, 0, 0.62, -6); for (const [x, z] of [[-0.45, -5.05], [0.45, -5.05], [-0.45, -6.95], [0.45, -6.95]]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 8), steel, x, 0.31, z);
  add(new THREE.BoxGeometry(0.95, 0.5, 0.04), steel, 0, 0.95, -7.0);
  covered(g, 0, 0.62, -6, Math.PI / 2, [0.6, 0.58, 0.52], rnd);
  add(new THREE.BoxGeometry(0.6, 0.75, 0.45), steel, 0.95, 0.375, -5.2);
  add(new THREE.CylinderGeometry(0.09, 0.07, 0.24, 14), steel, 0.85, 0.87, -5.15);
  add(new THREE.CylinderGeometry(0.15, 0.09, 0.07, 18), steel, 1.08, 0.79, -5.3);
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), lit([0.4, 0.25, 0.1], 0.2, 0, 'f5bottle'), 0.75 + i * 0.07, 0.81, -5.0);
  add(new THREE.CylinderGeometry(0.015, 0.015, 1.9, 6), steel, -0.65, 0.95, -5.1); add(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 10), lit([0.7, 0.7, 0.68], 0.3, 0, 'f5drip'), -0.65, 1.8, -5.1);
  for (let i = 0; i < 3; i++) { add(new THREE.BoxGeometry(0.95, 0.12, 2.0), white, -2.2, 0.62, -3 - i * 2.6); covered(g, -2.2, 0.62, -3 - i * 2.6, Math.PI / 2, [0.55, 0.52, 0.46], rnd); }
  const rig = await loadRig();
  const doc = makeCivilian(rig, { seed: 801, india: true, kind: 'man', bag: 'none', outfit: { top: [0.78, 0.78, 0.76], leg: [0.15, 0.15, 0.17] } }); doc.root.position.set(0.95, 0, -6.2); doc.root.rotation.y = -1.6; scene.add(doc.root);
  const nurse = makeCivilian(rig, { seed: 802, india: true, kind: 'woman', bag: 'none', outfit: { top: [0.76, 0.76, 0.74], leg: [0.76, 0.76, 0.74] } }); nurse.root.position.set(-0.9, 0, -6.6); nurse.root.rotation.y = 1.5; scene.add(nurse.root);
  const A = V3(1.9, 1.55, -2.4), B = V3(1.6, 1.45, -3.4);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.1, uHalation: 0.12, uVignette: 0.64, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0.2, 0.95, -6.0), { focal: 32, shake: 0.05, shakeFreq: 0.3, t, seed: 5303 });
      pose(doc, 'Idle', t, { offset: 0.3 }); pose(nurse, 'Idle', t, { offset: 1.7 });
      return dcam(ctx, camera) || { dof: { focus: A.clone().lerp(B, k).distanceTo(V3(0.2, 0.95, -6)), focal: 32, fstop: 2.4 } };
    },
  };
}
export async function F5D(ctx) {
  const I = interior(ctx, { len: 30, wid: 10, hgt: 4.6, side: 'windows', sunAz: 1.0 }); const { scene, camera, add } = I;
  const steel = lit([0.5, 0.52, 0.5], 0.4, 0.6, 'f5steel'), white = lit([0.7, 0.7, 0.67], 0.9, 0, 'f5white');
  const g = new THREE.Group(); scene.add(g); const rnd = mulberry32(23);
  for (const x of [-3.4, 2.6]) for (let z = -3; z > -28; z -= 2.4) {
    add(new THREE.BoxGeometry(0.95, 0.12, 2.0), white, x, 0.62, z); for (const [dx, dz] of [[-0.45, 0.95], [0.45, 0.95], [-0.45, -0.95], [0.45, -0.95]]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 8), steel, x + dx, 0.31, z + dz);
    covered(g, x, 0.62, z, Math.PI / 2, [[0.6, 0.58, 0.52], [0.52, 0.5, 0.45], [0.25, 0.3, 0.45]][Math.floor(rnd() * 3)], rnd);
    if (rnd() < 0.5) covered(g, x + (x < 0 ? 1.1 : -1.1), 0, z, Math.PI / 2 + 0.1, [0.5, 0.15, 0.1], rnd);
  }
  const fan = new THREE.Group(); fan.position.set(0, 4.2, -12); scene.add(fan); for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.01, 0.12), lit([0.4, 0.4, 0.38], 0.5, 0.3, 'f5fan')); b.position.x = 0.38; const h = new THREE.Group(); h.rotation.y = k * 2.094; h.add(b); fan.add(h); }
  const rig = await loadRig(); const cs = [];
  for (let i = 0; i < 8; i++) { const c = makeCivilian(rig, { seed: 900 + i, india: true, kind: rnd() < 0.6 ? 'woman' : 'man', bag: 'none' }); c.root.position.set(-0.5 + rnd() * 1.4, 0, -4 - rnd() * 22); c.root.rotation.y = rnd() * 6.28; scene.add(c.root); c.off = rnd() * 3; cs.push(c); }
  const A = V3(-0.4, 2.4, -0.8), B = V3(-0.2, 2.2, -3.0);
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.12, uHalation: 0.14, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 0.9, -24), { focal: 26, shake: 0.04, shakeFreq: 0.3, t, seed: 5404 });
      fan.rotation.y = t * 1.6; cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera) || { fade: smoothstep(13.6, 15, t) * 0 };
    },
  };
}
