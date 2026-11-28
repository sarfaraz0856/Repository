// BHOPAL, chapter 14 – THE LESSON.
// O14A a circular parliament house in Delhi (the laws that followed); O14B a modern chemical plant with alarms,
// wind socks and safety drills; O14C Bhopal today from the air, the Upper Lake; O14D the lakeside at sunset.
import * as THREE from 'three';
import { fovFromFocalH, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, LAKE, MOSQUE } from './lib/bhopal.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian, makeCar } from './lib/street.js';
import { MIDDAY } from './bhopal8.js';
import { MORNING } from './bhopal6.js';
import { dayStage } from './bhopal9.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const face = (dx, dz) => Math.atan2(dx, dz) + Math.PI;
const CLEAR = { ...MIDDAY, az: 150, el: 40, density: 0.0005, sky: { ...MIDDAY.sky, uCloudCover: 0.25 } };
// daylight water over the lake
export function dayLake(scene, y = 0.08, col = [0.16, 0.22, 0.26]) {
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(...col), roughness: 0.22, metalness: 0.1 });
  const w = new THREE.Mesh(new THREE.CircleGeometry(1, 96), m); w.rotation.x = -Math.PI / 2; w.scale.set(LAKE.rx, LAKE.rz, 1); w.position.set(LAKE.x, y, LAKE.z); w.receiveShadow = true; scene.add(w);
  return w;
}

// ---------------- O14A: the parliament house ----------------
export async function O14A(ctx) {
  const { scene, camera } = dayStage(ctx, CLEAR, { ground: [0.3, 0.28, 0.22], extent: 140 });
  const sand = lit([0.66, 0.5, 0.38], 0.9, 0, 'parlsand'), cream = lit([0.72, 0.66, 0.55], 0.9, 0, 'parlcream'), dark = lit([0.1, 0.08, 0.07], 0.9, 0, 'parldark'), lawn = lit([0.16, 0.25, 0.1], 1, 0, 'parllawn');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  const R = 55;
  add(new THREE.CylinderGeometry(R + 4, R + 4, 2, 96), sand, 0, 1, 0);
  add(new THREE.CylinderGeometry(R - 3, R - 3, 16, 96), dark, 0, 10, 0);
  add(new THREE.CylinderGeometry(R + 1, R + 1, 1.6, 96), cream, 0, 18.8, 0);
  add(new THREE.CylinderGeometry(R - 8, R - 2, 4, 96), sand, 0, 21.5, 0);
  add(new THREE.CylinderGeometry(14, 16, 8, 48), cream, 0, 25, 0);
  const col = new THREE.CylinderGeometry(0.55, 0.6, 16, 12);
  const cols = new THREE.InstancedMesh(col, cream, 144); const m4 = new THREE.Matrix4();
  for (let i = 0; i < 144; i++) { const a = i / 144 * Math.PI * 2; m4.makeTranslation(Math.cos(a) * R, 10, Math.sin(a) * R); cols.setMatrixAt(i, m4); }
  cols.castShadow = true; cols.receiveShadow = true; scene.add(cols);
  const l = new THREE.Mesh(new THREE.RingGeometry(R + 4, R + 90, 96), lawn); l.rotation.x = -Math.PI / 2; l.position.y = 0.03; l.receiveShadow = true; scene.add(l);
  const flag = add(new THREE.CylinderGeometry(0.12, 0.15, 14, 8), lit([0.8, 0.8, 0.8], 0.4, 0.6, 'flagpole'), 0, 36, 0);
  const A = V3(70, 3, 200), B = V3(45, 4, 170);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.9, uBloom: 0.06, uHalation: 0.08, uVignette: 0.58, uGrain: 0.04 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 14, 0), { focal: 30, shake: 0.03, shakeFreq: 0.3, t, seed: 14101 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- O14B: a modern plant, safety drill ----------------
export async function O14B(ctx) {
  const { scene, camera } = dayStage(ctx, { ...CLEAR, az: 210, el: 30 }, { ground: [0.36, 0.36, 0.35], extent: 80 });
  const white = lit([0.8, 0.8, 0.78], 0.4, 0.3, 'mtank'), steel = lit([0.5, 0.52, 0.55], 0.35, 0.8, 'msteel'), yellow = lit([0.85, 0.65, 0.05], 0.6, 0.2, 'myellow'), green = lit([0.1, 0.45, 0.25], 0.6, 0.1, 'mgreen'), red = lit([0.75, 0.08, 0.05], 0.5, 0.2, 'mred');
  const add = (geo, m, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  for (let i = 0; i < 4; i++) { add(new THREE.CylinderGeometry(4, 4, 12, 40), white, -18 + i * 11, 6, -26); add(new THREE.CylinderGeometry(4.05, 4.05, 0.5, 40), green, -18 + i * 11, 3, -26); }
  for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.35, 0.35, 50, 12), [steel, yellow, green][i], 0, 13 + i * 0.9, -19, 0, Math.PI / 2);
  add(new THREE.BoxGeometry(50, 0.6, 0.15), yellow, 0, 0.3, -18);                                      // a bund wall
  // the alarm mast with a siren and a wind sock
  add(new THREE.CylinderGeometry(0.12, 0.16, 12, 10), steel, 14, 6, -8);
  add(new THREE.CylinderGeometry(0.45, 0.25, 0.7, 16), red, 14, 11.6, -8, Math.PI / 2);
  const sock = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.2, 16, 1, true), new THREE.MeshStandardMaterial({ color: new THREE.Color(0.95, 0.35, 0.05), side: THREE.DoubleSide, roughness: 0.8 })); sock.rotation.z = Math.PI / 2; scene.add(sock);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 0.6, 0.2), fog: false })); beacon.position.set(14, 12.2, -8); scene.add(beacon);
  // assembly-point sign: a green board on a post
  add(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), steel, -6, 1.1, 4); add(new THREE.BoxGeometry(1.2, 0.8, 0.05), green, -6, 2.4, 4);
  const rig = await loadRig(); const cs = []; const rnd = mulberry32(142);
  const hat = new THREE.SphereGeometry(0.15, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 14; i++) {
    const c = makeCivilian(rig, { seed: 3100 + i, india: true, kind: 'man', bag: 'none', outfit: { top: [0.12, 0.2, 0.45], leg: [0.12, 0.2, 0.45] } });
    const h = new THREE.Mesh(hat, i % 4 === 0 ? yellow : white); h.scale.setScalar(100); h.position.set(0, 12, 0); c.bones.mixamorigHead.add(h);
    c.x0 = -10 + rnd() * 14; c.z0 = -14 + rnd() * 6; c.off = rnd() * 3; c.root.rotation.y = face(0.4, 1); scene.add(c.root); cs.push(c);
  }
  const A = V3(-14, 1.7, 14), B = V3(-10, 1.7, 11);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.95, uBloom: 0.08, uHalation: 0.1, uVignette: 0.58, uGrain: 0.04 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach(c => { const d = Math.min(t * 1.2, 14); c.root.position.set(c.x0 + d * 0.37, 0, c.z0 + d * 0.93); pose(c, d < 14 ? 'Walk' : 'Idle', t, { offset: c.off, rate: 1.0 }); });
      sock.position.set(14.9 + Math.sin(t * 2) * 0.05, 10.6, -8); sock.rotation.y = 0.3 * Math.sin(t * 0.7);
      beacon.material.color.setRGB(Math.sin(t * 9) > 0 ? 8 : 0.4, 0.4, 0.1);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 4, -12), { focal: 28, shake: 0.04, shakeFreq: 0.35, t, seed: 14202 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- O14C: Bhopal today from the air ----------------
export async function O14C(ctx) {
  const W = bhopalWorld(ctx, { litFrac: 0, day: { ...CLEAR, el: 30, center: V3(-900, 0, 1900), extent: 1300, density: 0.00035, fogH: 200 } });
  const { scene, camera } = W; dayLake(scene, 9);
  const A = V3(-400, 420, 3600), B = V3(-700, 380, 3500);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.92, uBloom: 0.06, uHalation: 0.08, uVignette: 0.58, uGrain: 0.04 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-1300, 0, 2000), { focal: 28, shake: 0.04, shakeFreq: 0.25, t, seed: 14303 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- O14D: the lakeside at sunset ----------------
export async function O14D(ctx) {
  const SUNSET = { ...MORNING, az: 260, el: 5, sunCol: [1.0, 0.55, 0.28], sunI: 2.0, density: 0.0007, fogH: 80, glow: [0.85, 0.45, 0.2], sky: { ...MORNING.sky, uDawn: [0.75, 0.36, 0.14], uDawnPow: 3, uCloudCover: 0.35 } };
  // a promenade on the eastern shore of the lake
  const S = V3(LAKE.x + LAKE.rx * 0.92, 0, LAKE.z + 150);
  const W = bhopalWorld(ctx, { litFrac: 0.02, carve: [[S.x - 60, S.x + 60, S.z - 160, S.z + 160]], day: { ...SUNSET, center: S, extent: 160 } });
  const { scene, camera } = W; dayLake(scene, 0.08, [0.4, 0.32, 0.28]);
  const walk = lit([0.5, 0.44, 0.36], 0.9, 0, 'prom'), rail = lit([0.1, 0.1, 0.1], 0.5, 0.6, 'promrail');
  const p = new THREE.Mesh(new THREE.PlaneGeometry(8, 320), walk); p.rotation.x = -Math.PI / 2; p.position.set(S.x + 4, 0.1, S.z); p.receiveShadow = true; scene.add(p);
  for (let z = -160; z < 160; z += 2) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), rail); r.position.set(S.x - 0.1, 0.6, S.z + z); scene.add(r); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 320), rail); top.position.set(S.x - 0.1, 1.1, S.z); scene.add(top);
  for (let z = -150; z < 150; z += 24) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5, 8), rail); l.position.set(S.x + 7.5, 2.5, S.z + z); scene.add(l); }
  // boats on the water
  const hull = lit([0.7, 0.68, 0.62], 0.6, 0, 'boat'), sail = lit([0.85, 0.82, 0.75], 1, 0, 'sail');
  const boats = [];
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Group(); const h = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 4.5), hull); h.position.y = 0.25; b.add(h);
    if (i % 2 === 0) { const s = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 3), sail); s.scale.z = 0.1; s.position.y = 3; b.add(s); }
    b.position.set(S.x - 40 - i * 45, 0.05, S.z - 80 + i * 50); b.rotation.y = i; b.v = 0.4 + i * 0.1; scene.add(b); boats.push(b);
  }
  const rig = await loadRig(); const cs = []; const rnd = mulberry32(144);
  for (let i = 0; i < 26; i++) {
    const c = makeCivilian(rig, { seed: 3200 + i, india: true, bag: 'none' }); const dir = rnd() < 0.5 ? 1 : -1;
    c.x0 = S.x + 1.5 + rnd() * 5; c.z0 = S.z - 60 + rnd() * 110; c.dir = dir; c.sp = 0.9 + rnd() * 0.4; c.off = rnd() * 3; c.root.rotation.y = face(0, dir); scene.add(c.root); cs.push(c);
  }
  const A = V3(S.x + 6, 1.7, S.z + 62), B = V3(S.x + 5.5, 1.7, S.z + 54);
  return {
    scene, camera,
    look: { uExposure: 1.1, uLookPow: 1.2, uLookSat: 0.95, uBloom: 0.12, uHalation: 0.16, uVignette: 0.62, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach(c => { c.root.position.set(c.x0, 0.1, c.z0 + c.dir * c.sp * t); pose(c, 'Walk', t, { offset: c.off, rate: c.sp }); });
      boats.forEach(b => { b.position.z += 0; b.position.x -= 0; b.rotation.z = 0.03 * Math.sin(t * 1.3 + b.v * 9); });
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(S.x - 30, 1.6, S.z - 40), { focal: 30, shake: 0.03, shakeFreq: 0.3, t, seed: 14404 });
      return dcam(ctx, camera) || {};
    },
  };
}
