// BHOPAL, chapter 3 – THE ESCAPE (about 1 AM, 3 December 1984).
// D3A people stumble out of the JP Nagar lane in the gas; D3B a main road full of people running, a truck;
// D3C people climbing a hill above the gas-filled city; D3D the cloud spreading over the old city from the air.
import * as THREE from 'three';
import { ATM } from './lib/atmos.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, STACK_TOP, ROAD_Z, MOON } from './lib/bhopal.js';
import { gasFX, gasPlume, laneProps } from './bhopal1.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian, clipSpeed, makeBus } from './lib/street.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
// a crowd of runners: each from a start point along a direction, with its own start time and pace
function crowd(scene, rig, list) {
  const vRun = clipSpeed(rig, 'Run'), vWalk = clipSpeed(rig, 'Walk');
  return list.map((p, i) => {
    const c = makeCivilian(rig, { seed: p.seed ?? 100 + i, kind: p.kind ?? null, india: true, bag: 'none' });
    scene.add(c.root); scene.add(c.ao);
    c.plan = p; c.v = (p.clip === 'Walk' ? vWalk : vRun) * (p.rate ?? 1);
    return c;
  });
}
const FLIP = Math.PI;
function runCrowd(cs, t, groundY = () => 0) {
  for (const c of cs) {
    const p = c.plan; const tt = Math.max(0, t - (p.t0 ?? 0));
    const pos = p.from.clone().addScaledVector(p.dir, tt * c.v * c.scale);
    pos.x += Math.sin(tt * 0.7 + (p.seed ?? 0)) * (p.weave ?? 0.25);
    pos.y = groundY(pos.x, pos.z);
    c.root.position.copy(pos); c.root.rotation.y = Math.atan2(p.dir.x, p.dir.z) + (p.flip ?? FLIP);
    c.root.visible = t >= (p.t0 ?? 0) - 0.01 || (p.t0 ?? 0) <= 0;
    c.ao.position.set(pos.x, pos.y + 0.045, pos.z);
    pose(c, p.clip ?? 'Run', t, { offset: p.seed * 0.37 % 1, rate: p.rate ?? 1 });
  }
}

// ---------------- D3A: out of the lane ----------------
export async function D3A(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0016, oldCity: false, mosque: false, litFrac: 0.05, lampGain: 3.0, moon: 0.22, laneCut: true });
  const { scene, camera } = W;
  laneProps(scene);
  const gas = gasFX(ctx, scene, { boxMin: [-40, 0, 60], boxMax: [40, 30, 225], steps: 72 });
  const rig = await loadRig(); const rnd = mulberry32(31);
  const plan = [];
  for (let i = 0; i < 14; i++) {
    const x = (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 1.3);
    plan.push({ seed: 300 + i, from: V3(x, 0, 120 + rnd() * 55), dir: V3(-x * 0.01, 0, 1).normalize(), t0: rnd() * 9, clip: rnd() < 0.25 ? 'Walk' : 'Run', rate: 0.75 + rnd() * 0.3, kind: rnd() < 0.15 ? 'child' : null, weave: 0.3 });
  }
  const cs = crowd(scene, rig, plan);
  const A = V3(-0.9, 1.5, 214), B = V3(-0.7, 1.45, 210);
  return {
    scene, camera,
    look: { uExposure: 2.3, uLookPow: 1.25, uLookSat: 0.9, uBloom: 0.1, uHalation: 0.14, uVignette: 0.7, uGrain: 0.06 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0.4, 2.0, 120), { focal: 30, shake: 0.18, shakeFreq: 0.6, t, seed: 3101 });
      runCrowd(cs, t);
      cs.forEach(c => { if (c.root.position.z > 212.5) c.root.visible = false; });
      gas.setGround({ center: [0, 0, 150], radius: 80, height: 2.4, density: 0.9, noiseScale: 1 / 3.2, drift: [0.15, 0.08, 1.4] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { dof: { focus: 12, focal: 30, fstop: 2.8 } };
    },
  };
}

// ---------------- D3B: a main road full of people ----------------
function bazaar(scene, { z0 = 540, z1 = 860, half = 7 }) {
  const rnd = mulberry32(77); const g = new THREE.Group(); scene.add(g);
  const walls = [[0.42, 0.38, 0.3], [0.5, 0.47, 0.4], [0.32, 0.38, 0.4], [0.45, 0.32, 0.26], [0.38, 0.36, 0.32], [0.48, 0.42, 0.26]].map((c, i) => lit(c, 0.95, 0, 'bzw' + i));
  const shutter = lit([0.22, 0.23, 0.24], 0.55, 0.6, 'bzsh'), sign = lit([0.15, 0.2, 0.32], 0.7, 0, 'bzsign'), dark = lit([0.04, 0.035, 0.03], 0.9, 0, 'bzdark');
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  for (const side of [-1, 1]) {
    let z = z0;
    while (z < z1) {
      const w = 5 + rnd() * 4, d = 9 + rnd() * 4, st = 1 + Math.floor(rnd() * 3), h = st * 3.2 + 0.5;
      const x = side * (half + d / 2);
      add(new THREE.BoxGeometry(d, h, w), walls[Math.floor(rnd() * walls.length)], x, h / 2, z + w / 2);
      add(new THREE.PlaneGeometry(w * 0.8, 2.6), shutter, x - side * (d / 2 + 0.02), 1.3, z + w / 2, side > 0 ? -Math.PI / 2 : Math.PI / 2);
      if (rnd() < 0.6) add(new THREE.BoxGeometry(0.25, 0.8, w * 0.7), sign, x - side * (d / 2 + 0.12), 3.0, z + w / 2);
      for (let f = 1; f < st; f++) for (let k = 0; k < 2; k++) add(new THREE.PlaneGeometry(0.9, 1.3), dark, x - side * (d / 2 + 0.02), f * 3.2 + 1.4, z + w * (0.3 + 0.4 * k), side > 0 ? -Math.PI / 2 : Math.PI / 2);
      if (st > 1 && rnd() < 0.5) add(new THREE.BoxGeometry(1.0, 0.15, w * 0.7), walls[0], x - side * (d / 2 + 0.5), 3.3, z + w / 2);
      z += w + (rnd() < 0.12 ? 3 : 0.1);
    }
  }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(half * 2, z1 - z0 + 40), lit([0.035, 0.034, 0.036], 0.8, 0, 'bzroad')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.03, (z0 + z1) / 2); road.receiveShadow = true; g.add(road);
  // pole lamps on alternate sides, mostly sodium
  const lamps = [];
  for (let z = z0 + 10; z < z1; z += 28) { const s = (Math.round(z / 28) % 2) ? 1 : -1; const on = rnd() < 0.8; lamps.push([s * (half - 0.4), z, on]);
    add(new THREE.CylinderGeometry(0.08, 0.1, 7.5, 6), shutter, s * (half - 0.4), 3.75, z);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: on ? new THREE.Color(9, 4.6, 1.6) : new THREE.Color(0.05, 0.05, 0.05), fog: false })); b.position.set(s * (half - 1.4), 7.4, z); g.add(b);
    if (on) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.56, 0.22), 60, 26, 2); pl.position.set(s * (half - 1.4), 7.2, z); g.add(pl); } }
  return { g, lamps };
}
export async function D3B(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0016, basti: false, mosque: false, litFrac: 0.05, lampGain: 4.0, moon: 0.22, carve: [[-30, 30, 520, 880]] });
  const { scene, camera } = W;
  bazaar(scene, { z0: 540, z1: 860, half: 7 });
  const gas = gasFX(ctx, scene, { boxMin: [-30, 0, 520], boxMax: [30, 40, 880], steps: 72 });
  const rig = await loadRig(); const rnd = mulberry32(41);
  const plan = [];
  for (let i = 0; i < 46; i++) {
    const x = (rnd() - 0.5) * 11;
    plan.push({ seed: 400 + i, from: V3(x, 0, 600 + rnd() * 140), dir: V3((rnd() - 0.5) * 0.08, 0, 1).normalize(), t0: rnd() * 6 - 4, clip: rnd() < 0.3 ? 'Walk' : 'Run', rate: 0.7 + rnd() * 0.35, kind: rnd() < 0.18 ? 'child' : rnd() < 0.5 ? 'woman' : 'man', weave: 0.4 });
  }
  const cs = crowd(scene, rig, plan);
  const truck = makeBus({ color: new THREE.Color(0.45, 0.12, 0.06), cream: new THREE.Color(0.5, 0.48, 0.42), seed: 3 });
  scene.add(truck.group);
  const hl = new THREE.SpotLight(new THREE.Color(1.0, 0.9, 0.7), 900, 90, 0.45, 0.6, 2); scene.add(hl, hl.target);
  const A = V3(2.5, 2.4, 792), B = V3(2.0, 2.2, 786);
  return {
    scene, camera,
    look: { uExposure: 2.2, uLookPow: 1.26, uLookSat: 0.9, uBloom: 0.12, uHalation: 0.16, uVignette: 0.68, uGrain: 0.06 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-0.5, 2.6, 640), { focal: 32, shake: 0.12, shakeFreq: 0.5, t, seed: 3202 });
      runCrowd(cs, t);
      cs.forEach(c => { if (c.root.position.z > 790) c.root.visible = false; });
      const tz = 600 + t * 6.5; truck.group.position.set(-3.2, 0, tz); truck.group.rotation.y = 0;
      hl.position.set(-3.2, 1.3, tz + 5.5); hl.target.position.set(-3.2, 0, tz + 40);
      gas.setGround({ center: [0, 0, 690], radius: 170, height: 3.2, density: 0.55, noiseScale: 1 / 5, drift: [0.2, 0.08, 1.6] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { dof: { focus: 40, focal: 32, fstop: 4 } };
    },
  };
}

// ---------------- D3C: up the hill, above the gas ----------------
const HILL = { x: -950, z: 820, r: 420, h: 58 };
const hillY = (x, z) => { const d = Math.hypot(x - HILL.x, z - HILL.z) / HILL.r; return d >= 1 ? 0 : HILL.h * (0.5 + 0.5 * Math.cos(Math.PI * d)) * (1 + 0.04 * Math.sin(x * 0.05) * Math.cos(z * 0.04)); };
function hillMesh() {
  const g = new THREE.PlaneGeometry(HILL.r * 2.2, HILL.r * 2.2, 160, 160); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + HILL.x, z = p.getZ(i) + HILL.z; p.setY(i, hillY(x, z)); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, lit([0.085, 0.075, 0.055], 1, 0, 'bhhill')); m.position.set(HILL.x, 0.02, HILL.z); m.receiveShadow = true; return m;
}
export async function D3C(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0009, basti: false, mosque: false, litFrac: 0.06, lampGain: 5.0, moon: 0.3, hill: HILL });
  const { scene, camera } = W;
  scene.add(hillMesh());
  // scrub on the hill
  const rnd = mulberry32(55); const bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lit([0.05, 0.07, 0.035], 1, 0, 'bhbush'), 500); const m4 = new THREE.Matrix4();
  for (let i = 0; i < 500; i++) { const a = rnd() * 6.283, r = rnd() * HILL.r * 0.95; const x = HILL.x + Math.cos(a) * r, z = HILL.z + Math.sin(a) * r; const s = 0.25 + rnd() * 0.6; if (Math.abs(a) < 0.5 && r < HILL.r * 0.7) continue; m4.compose(V3(x, hillY(x, z) + s * 0.3, z), new THREE.Quaternion(), V3(s, s * 0.7, s)); bush.setMatrixAt(i, m4); }
  scene.add(bush);
  // the gas lying over the low city to the east
  const gas = gasFX(ctx, scene, { boxMin: [-700, 0, 300], boxMax: [900, 40, 1500], steps: 64 });
  gas.setLights([{ pos: [0, 30, 800], range: 1400, color: [0.8, 0.45, 0.16] }]);
  const rig = await loadRig(); const plan = [];
  for (let i = 0; i < 18; i++) {
    const a = -0.22 + rnd() * 0.44, r0 = HILL.r * (0.36 + rnd() * 0.12); const from = V3(HILL.x + Math.cos(a) * r0, 0, HILL.z + Math.sin(a) * r0);
    plan.push({ seed: 500 + i, from, dir: V3(HILL.x - from.x, 0, HILL.z - from.z).normalize(), t0: rnd() * 4 - 3, clip: 'Walk', rate: 0.8 + rnd() * 0.3, kind: rnd() < 0.2 ? 'child' : rnd() < 0.5 ? 'woman' : 'man', weave: 0.2 });
  }
  const cs = crowd(scene, rig, plan);
  const cam0 = V3(HILL.x + HILL.r * 0.3, 0, HILL.z + 10); cam0.y = hillY(cam0.x, cam0.z) + 1.7;
  const A = cam0.clone(), B = cam0.clone().add(V3(-4, 0.3, -2));
  return {
    scene, camera,
    look: { uExposure: 2.4, uLookPow: 1.28, uLookSat: 0.92, uBloom: 0.11, uHalation: 0.14, uVignette: 0.66, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(HILL.x + 700, -8, HILL.z + 60), { focal: 30, shake: 0.06, shakeFreq: 0.3, t, seed: 3303 });
      runCrowd(cs, t, hillY);
      gas.setGround({ center: [150, 0, 900], radius: 900, height: 5, density: 0.26, noiseScale: 1 / 40, drift: [0.6, 0.1, 1.2] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- D3D: the cloud over the old city ----------------
export async function D3D(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0005, litFrac: 0.06, lampGain: 5.5, moon: 0.3 });
  const { scene, camera } = W;
  const gas = gasFX(ctx, scene, { boxMin: [-1500, 0, -300], boxMax: [1700, 80, 2600], steps: 80 });
  gas.setLights([{ pos: [0, 60, 1400], range: 2600, color: [0.25, 0.14, 0.05] }]);
  const A = V3(900, 420, 2900), B = V3(760, 400, 2700);
  return {
    scene, camera,
    look: { uExposure: 2.7, uLookPow: 1.28, uLookSat: 0.92, uBloom: 0.12, uHalation: 0.14, uVignette: 0.64, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-200, -40, 600), { focal: 28, shake: 0.06, shakeFreq: 0.25, t, seed: 3404 });
      const reach = lerp(1900, 2500, t / 15);
      gas.setGround({ center: [0, 0, -500], radius: reach, height: 12, density: 0.22, noiseScale: 1 / 90, drift: [0.5, 0.1, 3.0] });
      gas.setPlumes([gasPlume(1.0, t)]);
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { fade: 0 };
    },
  };
}
export const bazaarSet = bazaar;
