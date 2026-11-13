// BHOPAL, chapter 8 – WARREN ANDERSON (7 December 1984 and after).
// I8A a small plane lands at Bhopal airport; I8B the company guest house under police guard; I8C the plane
// takes off again the same day; I8D an empty courtroom: he never came back to face trial.
import * as THREE from 'three';
import { ATM } from './lib/atmos.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit } from './lib/bhopal.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian, makeCar } from './lib/street.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
export const MIDDAY = { az: 170, el: 42, sunCol: [1.0, 0.94, 0.85], sunI: 2.6, skyCol: [0.55, 0.62, 0.75], groundCol: [0.28, 0.24, 0.18], hemiI: 1.0, fog: [0.62, 0.64, 0.68], density: 0.0007, fogH: 120, glow: [0.3, 0.28, 0.24], halo: [0.4, 0.36, 0.3],
  sky: { uSunCol: [2.2, 2.0, 1.7], uZenith: [0.12, 0.2, 0.38], uHorizon: [0.62, 0.62, 0.62], uDawn: [0, 0, 0], uCloudBright: [0.95, 0.93, 0.9], uCloudShade: [0.45, 0.47, 0.52], uCloudCover: 0.3, uSunDisk: 30 } };
const AIR = V3(-2600, 0, -1600);   // the airport, north-west of the city
const A_ = (x, y, z) => V3(AIR.x + x, y, AIR.z + z);

export function makePlane() {
  const g = new THREE.Group(); const white = lit([0.75, 0.75, 0.74], 0.4, 0.2, 'plwhite'), stripe = lit([0.12, 0.2, 0.42], 0.5, 0.2, 'plblue'), dark = lit([0.05, 0.05, 0.06], 0.3, 0.2, 'pldark');
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.CylinderGeometry(0.85, 0.75, 11, 18), white, 0, 1.8, 0, 0, 0, Math.PI / 2);
  add(new THREE.ConeGeometry(0.85, 1.8, 18), white, 6.4, 1.8, 0, 0, 0, -Math.PI / 2);
  add(new THREE.ConeGeometry(0.75, 2.6, 18), white, -6.8, 2.0, 0, 0, 0, Math.PI / 2);
  add(new THREE.BoxGeometry(11.5, 0.06, 0.2), stripe, 0, 1.75, 0.84); add(new THREE.BoxGeometry(11.5, 0.06, 0.2), stripe, 0, 1.75, -0.84);
  add(new THREE.BoxGeometry(2.2, 0.18, 16), white, 0.5, 1.3, 0);
  for (const z of [-3, 3]) { add(new THREE.CylinderGeometry(0.45, 0.4, 2.6, 14), white, 1.2, 1.25, z, 0, 0, Math.PI / 2); const p = add(new THREE.BoxGeometry(0.06, 2.2, 0.18), dark, 2.6, 1.25, z); p.userData.prop = true; }
  add(new THREE.BoxGeometry(1.6, 2.4, 0.12), white, -6.7, 3.5, 0, 0, 0, 0.35);
  add(new THREE.BoxGeometry(1.2, 0.1, 5), white, -7.0, 2.4, 0);
  for (let i = 0; i < 6; i++) for (const z of [-0.84, 0.84]) add(new THREE.PlaneGeometry(0.35, 0.3), dark, 3.5 - i * 1.1, 2.1, z * 1.002, 0, z > 0 ? 0 : Math.PI);
  add(new THREE.BoxGeometry(0.8, 0.3, 1.4), dark, 5.6, 2.3, 0);
  for (const [x, z] of [[4.5, 0], [0.8, -2.8], [0.8, 2.8]]) add(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 12), dark, x, 0.25, z, Math.PI / 2);
  return g;
}
function airport(scene) {
  const g = new THREE.Group(); g.position.copy(AIR); scene.add(g);
  const tarmac = lit([0.2, 0.2, 0.21], 0.9, 0, 'aptarmac'), wall = lit([0.62, 0.6, 0.54], 0.9, 0, 'apwall'), glass = lit([0.1, 0.13, 0.16], 0.2, 0.4, 'apglass'), paint = lit([0.8, 0.8, 0.78], 0.8, 0, 'appaint');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  const rw = add(new THREE.BoxGeometry(2400, 0.1, 45), tarmac, 0, 0.05, 0);
  for (let x = -1100; x <= 1100; x += 60) add(new THREE.BoxGeometry(30, 0.02, 0.9), paint, x, 0.11, 0);
  add(new THREE.BoxGeometry(260, 0.1, 140), tarmac, 0, 0.05, 110);
  add(new THREE.BoxGeometry(80, 8, 20), wall, 0, 4, 200); add(new THREE.BoxGeometry(70, 3, 0.2), glass, 0, 4.6, 189.85);
  add(new THREE.CylinderGeometry(3, 3.2, 18, 12), wall, 50, 9, 200); add(new THREE.CylinderGeometry(4.2, 4.2, 3.2, 12), glass, 50, 19.6, 200);
  return g;
}

// ---------------- I8A: the plane lands ----------------
export async function I8A(ctx) {
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0, day: { ...MIDDAY, center: A_(0, 0, 60), extent: 300 } });
  const { scene, camera } = W;
  airport(scene); const plane = makePlane(); scene.add(plane);
  const rig = await loadRig(); const rnd = mulberry32(81); const cs = [];
  for (let i = 0; i < 14; i++) { const police = i < 8; const c = makeCivilian(rig, { seed: 1500 + i, india: true, kind: 'man', bag: 'none', outfit: police ? { top: [0.5, 0.42, 0.28], leg: [0.5, 0.42, 0.28] } : null }); c.root.position.copy(A_(-30 + rnd() * 30, 0, 70 + rnd() * 20)); c.root.rotation.y = (rnd() - 0.5) * 0.8; scene.add(c.root); c.off = rnd() * 3; cs.push(c); }
  for (const [x, z, col] of [[-40, 95, [0.75, 0.75, 0.72]], [-48, 98, [0.75, 0.75, 0.72]], [-56, 96, [0.3, 0.32, 0.2]]]) { const car = makeCar({ color: new THREE.Color(...col) }); car.group.position.copy(A_(x, 0, z)); car.group.rotation.y = 0.1; scene.add(car.group); }
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.9, uBloom: 0.06, uHalation: 0.08, uVignette: 0.58, uGrain: 0.04 },
    update(t) {
      // touchdown at ~4 s, then rollout and a turn toward the apron
      const tt = t;
      const x = lerp(700, -60, smoothstep(0, 12, tt) ** 0.8), y = Math.max(0, lerp(40, 0, smoothstep(0, 4.2, tt)));
      plane.position.copy(A_(x, y, lerp(0, 20, smoothstep(9, 15, tt)))); plane.rotation.y = Math.PI + lerp(0, -0.5, smoothstep(10, 15, tt)); plane.rotation.z = y > 0 ? -0.05 : 0;
      plane.traverse(o => { if (o.userData.prop) o.rotation.x = t * 40; });
      placeCamera(camera, ctx, A_(-20, 3, 115), plane.position.clone().add(V3(0, 2, 0)), { focal: lerp(70, 35, smoothstep(0, 12, t)), shake: 0.05, shakeFreq: 0.3, t, seed: 8101 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- I8B: the guest house under guard ----------------
export async function I8B(ctx) {
  const GH = V3(-1100, 0, -300);
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0, day: { ...MIDDAY, az: 200, el: 30, center: GH, extent: 120 } });
  const { scene, camera } = W;
  const g = new THREE.Group(); g.position.copy(GH); scene.add(g);
  const wall = lit([0.7, 0.66, 0.56], 0.9, 0, 'ghwall'), trim = lit([0.4, 0.3, 0.2], 0.8, 0, 'ghtrim'), roof = lit([0.45, 0.2, 0.12], 0.8, 0, 'ghroof'), lawn = lit([0.14, 0.2, 0.08], 1, 0, 'ghlawn'), dark = lit([0.05, 0.045, 0.04], 0.9, 0, 'ghdark');
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.PlaneGeometry(160, 140), lawn, 0, 0.03, 20).rotation.x = -Math.PI / 2;
  add(new THREE.BoxGeometry(32, 6.5, 14), wall, 0, 3.25, -8);
  const r = add(new THREE.ConeGeometry(21, 5, 4), roof, 0, 8.6, -8, Math.PI / 4); r.scale.set(1.05, 1, 0.5);
  add(new THREE.BoxGeometry(34, 0.3, 4), trim, 0, 3.6, -0.6);
  for (let x = -15; x <= 15; x += 3.75) add(new THREE.CylinderGeometry(0.2, 0.22, 3.4, 10), wall, x, 1.7, 1.2);
  for (let x = -12; x <= 12; x += 4) add(new THREE.PlaneGeometry(1.4, 2.2), dark, x, 1.6, -0.98);
  add(new THREE.BoxGeometry(4, 0.1, 30), lit([0.45, 0.4, 0.32], 0.95, 0, 'ghpath'), 0, 0.05, 20);
  for (const [x, z] of [[-20, 15], [22, 10], [-25, -20], [26, -22]]) { const t = add(new THREE.CylinderGeometry(0.3, 0.4, 5, 8), trim, x, 2.5, z); const c = add(new THREE.IcosahedronGeometry(3.4, 1), lit([0.12, 0.2, 0.08], 1, 0, 'ghtree'), x, 6.5, z); }
  const jeep = makeCar({ color: new THREE.Color(0.28, 0.3, 0.2) }); jeep.group.position.copy(GH).add(V3(6, 0, 30)); jeep.group.rotation.y = 1.4; scene.add(jeep.group);
  const car = makeCar({ color: new THREE.Color(0.75, 0.75, 0.72) }); car.group.position.copy(GH).add(V3(-4, 0, 26)); car.group.rotation.y = 1.7; scene.add(car.group);
  const rig = await loadRig(); const rnd = mulberry32(82); const cs = [];
  for (let i = 0; i < 6; i++) { const c = makeCivilian(rig, { seed: 1600 + i, india: true, kind: 'man', bag: 'none', outfit: { top: [0.5, 0.42, 0.28], leg: [0.5, 0.42, 0.28] } }); c.root.position.copy(GH).add(V3(-8 + i * 3.2, 0, 5 + rnd() * 3)); c.root.rotation.y = Math.PI + rnd() * 0.6 - 0.3; scene.add(c.root); c.off = rnd() * 3; cs.push(c); }
  const A = GH.clone().add(V3(16, 2.2, 48)), B = GH.clone().add(V3(10, 2.0, 40));
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.9, uBloom: 0.06, uHalation: 0.08, uVignette: 0.6, uGrain: 0.04 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), GH.clone().add(V3(0, 3, -4)), { focal: 32, shake: 0.04, shakeFreq: 0.3, t, seed: 8202 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- I8C: the plane leaves ----------------
export async function I8C(ctx) {
  const AFT = { ...MIDDAY, az: 240, el: 14, sunCol: [1.0, 0.75, 0.5], sky: { ...MIDDAY.sky, uSunCol: [2.2, 1.5, 0.9], uHorizon: [0.62, 0.55, 0.48], uDawn: [0.3, 0.18, 0.08], uDawnPow: 4 } };
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0, day: { ...AFT, center: A_(0, 0, 60), extent: 400 } });
  const { scene, camera } = W;
  airport(scene); const plane = makePlane(); scene.add(plane);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.9, uBloom: 0.08, uHalation: 0.1, uVignette: 0.6, uGrain: 0.04 },
    update(t) {
      // take-off roll toward +x, rotation at ~7 s, climbing away
      const s = 0.5 * 3.2 * Math.max(0, t) ** 2; const x = -300 + s; const y = Math.max(0, (t - 7) * 9 + 1.2 * Math.max(0, t - 7) ** 2);
      plane.position.copy(A_(x, y, 0)); plane.rotation.y = 0; plane.rotation.z = t > 6.5 ? 0.12 : 0;
      plane.traverse(o => { if (o.userData.prop) o.rotation.x = t * 60; });
      placeCamera(camera, ctx, A_(-120, 2.2, 60), plane.position.clone().add(V3(0, 2, 0)), { focal: lerp(35, 85, smoothstep(4, 15, t)), shake: 0.04, shakeFreq: 0.3, t, seed: 8303 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- I8D: the empty courtroom ----------------
export async function I8D(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 200);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const wood = lit([0.3, 0.17, 0.08], 0.55, 0, 'ctwood'), panel = lit([0.24, 0.14, 0.07], 0.6, 0, 'ctpanel'), wall = lit([0.62, 0.6, 0.52], 0.95, 0, 'ctwall'), floor = lit([0.3, 0.25, 0.2], 0.6, 0, 'ctfloor');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.PlaneGeometry(14, 18), floor, 0, 0, -6, -Math.PI / 2); add(new THREE.PlaneGeometry(14, 18), wall, 0, 6, -6, Math.PI / 2);
  add(new THREE.PlaneGeometry(14, 6), wall, 0, 3, -15); add(new THREE.PlaneGeometry(18, 6), wall, -7, 3, -6, 0, Math.PI / 2); add(new THREE.PlaneGeometry(18, 6), wall, 7, 3, -6, 0, -Math.PI / 2);
  add(new THREE.BoxGeometry(14, 2.2, 0.1), panel, 0, 1.1, -14.9);
  add(new THREE.BoxGeometry(6, 1.3, 1.2), wood, 0, 1.25, -12.8); add(new THREE.BoxGeometry(6.4, 0.6, 2.2), wood, 0, 0.3, -12.8);   // the bench, on a dais
  add(new THREE.BoxGeometry(0.9, 1.8, 0.8), lit([0.35, 0.08, 0.06], 0.7, 0, 'ctchair'), 0, 1.5, -13.8);
  add(new THREE.BoxGeometry(1.4, 1.2, 1.4), wood, 4.5, 0.6, -10);                                                                  // the witness box
  add(new THREE.BoxGeometry(1.4, 1.2, 1.4), wood, -4.5, 0.6, -10);                                                                 // the accused's dock, empty
  for (let r = 0; r < 5; r++) add(new THREE.BoxGeometry(8, 0.9, 0.5), wood, 0, 0.45, -6 + r * 1.6);
  add(new THREE.BoxGeometry(0.8, 0.8, 0.06), lit([0.6, 0.58, 0.5], 0.5, 0.1, 'ctclock'), 0, 4.6, -14.9);
  for (const x of [-6.95, 6.95]) for (let z = -13; z < 0; z += 4) { const w = add(new THREE.PlaneGeometry(1.6, 2.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.2, 1.9), fog: false }), x, 3.4, z, 0, x < 0 ? Math.PI / 2 : -Math.PI / 2); w.castShadow = false; }
  const fans = []; for (const z of [-11, -5]) { const fan = new THREE.Group(); fan.position.set(0, 5.6, z); scene.add(fan); fans.push(fan); for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.01, 0.13), lit([0.4, 0.4, 0.38], 0.5, 0.3, 'ctfan')); b.position.x = 0.4; const h = new THREE.Group(); h.rotation.y = k * 2.094; h.add(b); fan.add(h); } }
  const sun = new THREE.DirectionalLight(new THREE.Color(1.0, 0.9, 0.75), 4.5); sun.position.set(-20, 12, -6); sun.target.position.set(0, 0, -8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const c = sun.shadow.camera; c.left = -15; c.right = 15; c.top = 15; c.bottom = -15; c.near = 1; c.far = 60; scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.6, 0.58, 0.52), new THREE.Color(0.25, 0.2, 0.15), 1.5));
  for (const z of [-11, -5, 0]) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.85, 0.65), 22, 14, 2); pl.position.set(0, 5.2, z); scene.add(pl); }
  const A = V3(0, 1.7, 1.5), B = V3(0, 1.6, -3.0);
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.08, uHalation: 0.1, uVignette: 0.64, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(lerp(0, -3.6, k), lerp(1.4, 1.0, k), -11), { focal: lerp(30, 40, k), shake: 0.03, shakeFreq: 0.3, t, seed: 8404 });
      fans.forEach((f, i) => f.rotation.y = t * 1.2 + i);
      return dcam(ctx, camera) || {};
    },
  };
}
