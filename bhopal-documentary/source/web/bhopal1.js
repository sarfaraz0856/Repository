// BHOPAL, chapter 1 – THE NIGHT (2–3 December 1984).
// BH1 the sleeping city from the air; BH2 the Union Carbide plant; BH3 the gas escaping from the
// vent stack; BH4 a lane in JP Nagar as the gas creeps in.
import * as THREE from 'three';
import { ATM } from './lib/atmos.js';
import { VolumeFX } from './lib/volume.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, STACK_TOP, ROAD_Z, MOON } from './lib/bhopal.js';

const at = (s, l, y = 0) => V3(s, y, l);
function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}

// the gas: a plume from the vent stack bending south on the wind, and a dense layer flowing over the ground
export function gasFX(ctx, scene, { boxMin, boxMax, steps = 80 }) {
  const v = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin, boxMax, steps, shadowSteps: 4, albedo: 0.86 });
  scene.add(v.mesh);
  v.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: MOON.toArray(), moonCol: [0.03, 0.032, 0.04], ambTop: [0.0035, 0.0038, 0.0048], ambBot: [0.007, 0.0042, 0.0018], ext: 0.05, minStep: 0.6 });
  v.setLights([
    { pos: [-20, 26, -10], range: 140, color: [3.2, 1.7, 0.6], cone: Math.cos(0.75), dir: V3(-20, -26, -60).normalize().toArray() },
    { pos: [0, 20, 30], range: 120, color: [2.2, 1.2, 0.4], cone: Math.cos(0.75), dir: V3(10, -20, -60).normalize().toArray() },
    { pos: [0, 8.5, ROAD_Z + 7], range: 40, color: [1.6, 0.85, 0.3] },
  ]);
  return v;
}
function gasPlume(amount, t) {
  // amount 0..1: how much of the release is under way
  return { base: STACK_TOP.toArray(), r0: 0.7 + 1.6 * amount, spread: 0.28 + 0.12 * amount, height: 8 + 70 * amount, density: 0.25 + 1.3 * amount, rise: 6, wind: [0.15, 1.05], noiseScale: 1 / 14, seed: 0.4 };
}

// ---------------- BH1: Bhopal asleep, from the air ----------------
export async function BH1(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.00055, litFrac: 0.06, lampGain: 5.5, moon: 0.34 });
  const { scene, camera } = W;
  const A = V3(-420, 152, 2660), B = V3(-438, 138, 2530);
  return {
    scene, camera,
    look: { uExposure: 2.7, uLookPow: 1.28, uLookSat: 0.95, uBloom: 0.11, uHalation: 0.12, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 14);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-470, -80, 0), { focal: 30, shake: 0.08, shakeFreq: 0.3, t, seed: 101 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- BH2: the plant at night, the first wisp ----------------
export async function BH2(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0011, oldCity: false, mosque: false, litFrac: 0.05, lampGain: 6, moon: 0.24 });
  const { scene, camera } = W;
  const gas = gasFX(ctx, scene, { boxMin: [-90, 0, -150], boxMax: [90, 110, 120], steps: 72 });
  const A = V3(-150, 34, 70), B = V3(-128, 30, 52);
  return {
    scene, camera,
    look: { uExposure: 2.0, uLookPow: 1.28, uLookSat: 0.95, uBloom: 0.1, uHalation: 0.14, uVignette: 0.66, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 14);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-22, 10, -88), { focal: 32, shake: 0.05, shakeFreq: 0.3, t, seed: 202 });
      const amt = 0.06 * smoothstep(6, 13, t);
      gas.setPlumes(amt > 0.001 ? [gasPlume(amt, t)] : []); gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { dof: { focus: 160, focal: 30, fstop: 4 } };
    },
  };
}

// ---------------- BH3: the gas escapes ----------------
export async function BH3(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0012, oldCity: false, mosque: false, litFrac: 0.05, lampGain: 6, moon: 0.22 });
  const { scene, camera } = W;
  const gas = gasFX(ctx, scene, { boxMin: [-120, 0, -130], boxMax: [120, 120, 160], steps: 96 });
  const A = V3(36, 1.8, 66), B = V3(30, 2.0, 60);
  return {
    scene, camera,
    look: { uExposure: 2.0, uLookPow: 1.28, uLookSat: 0.92, uBloom: 0.12, uHalation: 0.16, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 16);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-14, lerp(24, 30, k), -70), { focal: 26, shake: 0.12, shakeFreq: 0.45, t, seed: 303 });
      const amt = lerp(0.35, 1.0, smoothstep(0, 9, t));
      gas.setPlumes([gasPlume(amt, t)]);
      gas.setGround({ center: [-10, 0, lerp(-50, 10, t / 16)], radius: lerp(40, 110, t / 16), height: 4.5, density: 0.62 * smoothstep(2, 11, t), noiseScale: 1 / 9, drift: [0.3, 0.15, 2.2] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { dof: { focus: 130, focal: 26, fstop: 4 } };
    },
  };
}

// ---------------- BH4: a lane in JP Nagar, the gas creeping in ----------------
function laneProps(scene) {
  const rnd = mulberry32(44);
  const wallM = [[0.3, 0.26, 0.2], [0.36, 0.33, 0.27], [0.22, 0.28, 0.3], [0.33, 0.22, 0.17], [0.27, 0.27, 0.24], [0.38, 0.32, 0.2]].map((c, i) => lit(c, 0.95, 0, 'bhlw' + i));
  const tin = lit([0.2, 0.2, 0.21], 0.55, 0.45, 'bhlt'); tin.side = THREE.DoubleSide;
  const tile = lit([0.3, 0.14, 0.09], 0.8, 0, 'bhltl'); tile.side = THREE.DoubleSide;
  const door = lit([0.05, 0.04, 0.035], 0.9, 0, 'bhld'), wood = lit([0.22, 0.14, 0.08], 0.9, 0, 'bhwood');
  const cloth = [[0.45, 0.1, 0.08], [0.15, 0.2, 0.4], [0.5, 0.45, 0.3], [0.2, 0.35, 0.2]].map((c, i) => lit(c, 1, 0, 'bhcl' + i));
  const g = new THREE.Group();
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  const roofGeo = (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0.5, 0.06); s.lineTo(-0.5, 0.5); return new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5); })();
  for (const side of [-1, 1]) {
    let z = 96;
    while (z < 210) {
      const w = 4 + rnd() * 2.5, d = 4.5 + rnd() * 2, h = 2.3 + rnd() * 0.5, x = side * (2.6 + d / 2 + rnd() * 0.4);
      add(new THREE.BoxGeometry(d, h, w), wallM[Math.floor(rnd() * 6)], x, h / 2, z + w / 2);
      const r = add(roofGeo, rnd() < 0.6 ? tin : tile, x + side * 0.1, h, z + w / 2); r.scale.set(d + 0.7, 1.4, w + 0.3); r.rotation.y = side > 0 ? Math.PI : 0;
      add(new THREE.PlaneGeometry(0.9, 1.8), door, x - side * (d / 2 + 0.01), 0.9, z + w * 0.5, side > 0 ? -Math.PI / 2 : Math.PI / 2);
      if (rnd() < 0.5) add(new THREE.BoxGeometry(0.06, 0.5, 0.7), wood, x - side * (d / 2 + 0.03), 1.4, z + w * 0.2);
      z += w + 0.2;
    }
  }
  // charpais (string cots) in the lane, two with sleepers under quilts
  const cot = (x, z, ry, sleeper, c) => {
    const k = new THREE.Group(); k.position.set(x, 0, z); k.rotation.y = ry; g.add(k);
    for (const [sx, sz] of [[-0.85, -0.42], [0.85, -0.42], [-0.85, 0.42], [0.85, 0.42]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 6), wood); l.position.set(sx, 0.22, sz); k.add(l); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.07, 0.95), lit([0.32, 0.28, 0.2], 1, 0, 'bhweave')); top.position.y = 0.46; top.castShadow = true; k.add(top);
    if (sleeper) {
      const q = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.25, 6, 12), cloth[c]); q.rotation.z = Math.PI / 2; q.scale.set(1, 1, 1.15); q.position.set(0.05, 0.68, 0); q.castShadow = true; k.add(q);
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.55), lit([0.6, 0.58, 0.52], 1, 0, 'bhpil')); pil.position.set(-0.75, 0.56, 0); k.add(pil);
    }
  };
  cot(-1.3, 168, 0.1, true, 0); cot(1.4, 150, -0.05, true, 1); cot(-1.4, 128, 0.15, false, 2);
  // hand pump, a bicycle frame, a clothes line
  add(new THREE.CylinderGeometry(0.08, 0.1, 1.1, 8), lit([0.12, 0.2, 0.14], 0.5, 0.6, 'bhpump'), 1.9, 0.55, 182);
  add(new THREE.BoxGeometry(0.6, 0.05, 0.05), lit([0.12, 0.2, 0.14], 0.5, 0.6, 'bhpump2'), 1.9, 1.05, 182.2);
  add(new THREE.CylinderGeometry(0.015, 0.015, 5.4, 4), wood, 0, 2.1, 140).rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) { const c = add(new THREE.PlaneGeometry(0.7, 0.9), cloth[i], 0, 1.65, 138.2 + i * 1.2, Math.PI / 2); c.material = c.material.clone(); c.material.side = THREE.DoubleSide; }
  // a single bulb over a doorway
  const bulb = add(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(14, 9, 4) }), -2.7, 2.15, 158);
  const pl = new THREE.PointLight(new THREE.Color(1.0, 0.7, 0.35), 9, 14, 2); pl.position.set(-2.4, 2.1, 158); scene.add(pl);
  scene.add(g);
  return g;
}
export async function BH4(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0016, oldCity: false, mosque: false, litFrac: 0.03, lampGain: 3.0, moon: 0.22, laneCut: true });
  const { scene, camera } = W;
  laneProps(scene);
  const gas = gasFX(ctx, scene, { boxMin: [-40, 0, 60], boxMax: [40, 30, 215], steps: 72 });
  const A = V3(0.4, 1.45, 206), B = V3(0.2, 1.4, 199);
  return {
    scene, camera,
    look: { uExposure: 2.3, uLookPow: 1.25, uLookSat: 0.9, uBloom: 0.1, uHalation: 0.14, uVignette: 0.7, uGrain: 0.06 },
    update(t) {
      const k = easeInOutSine(t / 16);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 3.5, 40), { focal: 28, shake: 0.08, shakeFreq: 0.35, t, seed: 404 });
      const front = lerp(78, 196, smoothstep(1, 15.5, t));
      gas.setGround({ center: [0, 0, front - 70], radius: 72, height: lerp(1.2, 2.6, t / 16), density: 1.1, noiseScale: 1 / 3.2, drift: [0.15, 0.08, 1.4] });
      gas.setPlumes([gasPlume(1.0, t)]);
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { dof: { focus: 30, focal: 28, fstop: 2.8 }, fade: smoothstep(13.6, 16, t) };
    },
  };
}
