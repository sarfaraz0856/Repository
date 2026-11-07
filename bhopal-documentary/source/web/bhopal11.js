// BHOPAL, chapter 11 – THE NEXT GENERATION.
// L11A a mother with her baby in the lane; L11B a rehabilitation centre for children; L11C children walking to
// school; L11D boys playing cricket on open ground beside the plant, at dusk.
import * as THREE from 'three';
import { fovFromFocalH, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, TANKS, ROAD_Z } from './lib/bhopal.js';
import { laneProps } from './bhopal1.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian } from './lib/street.js';
import { MIDDAY } from './bhopal8.js';
import { MORNING } from './bhopal6.js';
import { dayStage } from './bhopal9.js';
import { ATM } from './lib/atmos.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const SOFT = { ...MORNING, el: 16, sunCol: [1.0, 0.82, 0.62], sunI: 2.4, density: 0.0016 };
// a swaddled baby held against the chest
function holdBaby(c) {
  const cloth = lit([0.8, 0.72, 0.6], 1, 0, 'swaddle'), skin = lit([0.5, 0.34, 0.24], 0.8, 0, 'babyskin');
  const g = new THREE.Group(); g.scale.setScalar(0.72); g.position.set(0.04, 1.2, -0.17); g.rotation.set(0.2, 0, 1.2);
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.26, 6, 12), cloth); b.castShadow = true; g.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), skin); h.position.set(0, 0.2, 0.02); g.add(h);
  c.root.add(g);
}

// ---------------- L11A: mother and baby ----------------
export async function L11A(ctx) {
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, laneCut: true, day: { ...SOFT, center: V3(0, 0, 160), extent: 80 } });
  const { scene, camera } = W; laneProps(scene);
  const rig = await loadRig(); const cs = [];
  const m = makeCivilian(rig, { seed: 2201, india: true, kind: 'woman', bag: 'none' }); m.root.position.set(1.6, 0, 160); m.root.rotation.y = 2.57; scene.add(m.root); holdBaby(m); cs.push(m);
  const k1 = makeCivilian(rig, { seed: 2202, india: true, kind: 'child', bag: 'none' }); k1.root.position.set(1.0, 0, 161.2); k1.root.rotation.y = 2.3; scene.add(k1.root); k1.off = 1; cs.push(k1);
  const A = V3(-1.2, 1.5, 165.5), B = V3(-0.8, 1.45, 163.6);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.08, uHalation: 0.1, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off || 0, rate: 0.6 }));
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(1.4, 1.2, 160.3), { focal: 35, shake: 0.03, shakeFreq: 0.3, t, seed: 11101 });
      return dcam(ctx, camera) || { dof: { focus: 4.5, focal: 35, fstop: 2.8 } };
    },
  };
}

// ---------------- L11B: the rehabilitation centre ----------------
function wheelchair(scene, x, z, ry) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const steel = lit([0.5, 0.5, 0.52], 0.35, 0.8, 'wcsteel'), seat = lit([0.08, 0.1, 0.2], 0.8, 0, 'wcseat');
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 28), steel); w.rotation.y = Math.PI / 2; w.position.set(s * 0.3, 0.3, 0); g.add(w); }
  const st = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.45), seat); st.position.set(0, 0.5, 0.02); g.add(st);
  const bk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.04), seat); bk.position.set(0, 0.75, -0.2); bk.rotation.x = -0.12; g.add(bk);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), steel); f.position.set(s * 0.22, 0.25, 0.28); g.add(f); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
}
export async function L11B(ctx) {
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 200);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const wall = lit([0.7, 0.66, 0.5], 0.95, 0, 'rcwall'), dado = lit([0.25, 0.45, 0.42], 0.9, 0, 'rcdado'), floor = lit([0.42, 0.38, 0.33], 0.7, 0, 'rcfloor');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.PlaneGeometry(14, 14), floor, 0, 0, -5, -Math.PI / 2); add(new THREE.PlaneGeometry(14, 14), wall, 0, 3.6, -5, Math.PI / 2);
  add(new THREE.PlaneGeometry(14, 3.6), wall, 0, 1.8, -12); add(new THREE.PlaneGeometry(14, 3.6), wall, -7, 1.8, -5, 0, Math.PI / 2); add(new THREE.PlaneGeometry(14, 3.6), wall, 7, 1.8, -5, 0, -Math.PI / 2);
  add(new THREE.PlaneGeometry(14, 1.0), dado, 0, 0.5, -11.98); add(new THREE.PlaneGeometry(14, 1.0), dado, -6.98, 0.5, -5, 0, Math.PI / 2);
  // windows with daylight
  const sky = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.0), fog: false });
  for (const z of [-9, -5, -1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), sky); w.position.set(6.98, 2.0, z); w.rotation.y = -Math.PI / 2; scene.add(w); }
  const sun = new THREE.DirectionalLight(new THREE.Color(1.0, 0.9, 0.75), 2.2); sun.position.set(12, 8, -4); sun.target.position.set(0, 0, -6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.7, 0.7, 0.66), new THREE.Color(0.3, 0.26, 0.2), 0.9));
  // play mats, blocks, a ball, parallel bars
  const mats = [[0.7, 0.2, 0.15], [0.2, 0.35, 0.65], [0.85, 0.7, 0.15], [0.2, 0.55, 0.3]].map((c, i) => lit(c, 0.9, 0, 'rcmat' + i));
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(1.4, 0.05, 1.4), mats[i], -2.1 + (i % 2) * 1.4, 0.025, -7.2 + Math.floor(i / 2) * 1.4);
  const rnd = mulberry32(112);
  for (let i = 0; i < 9; i++) add(new THREE.BoxGeometry(0.16, 0.16, 0.16), mats[i % 4], -2.6 + rnd() * 2.4, 0.13, -7.6 + rnd() * 2.2, 0, rnd() * 3);
  add(new THREE.SphereGeometry(0.16, 16, 12), mats[0], -0.6, 0.21, -5.8);
  const steel = lit([0.6, 0.6, 0.62], 0.35, 0.8, 'rcbars');
  for (const x of [2.6, 3.4]) { add(new THREE.CylinderGeometry(0.025, 0.025, 3, 8), steel, x, 0.85, -7, Math.PI / 2); for (const z of [-8.4, -5.6]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), steel, x, 0.42, z); }
  wheelchair(scene, 4.8, -9.5, -0.6); wheelchair(scene, -4.8, -10.5, 0.4);
  const rig = await loadRig(); const cs = [];
  const kids = [[-2.0, -7.0, 2.6], [-1.0, -6.4, -2.4], [3.0, -7.6, Math.PI], [-3.2, -8.6, 0.4], [0.2, -8.8, 0.2]];
  kids.forEach(([x, z, r], i) => { const c = makeCivilian(rig, { seed: 2300 + i, india: true, kind: 'child', bag: 'none' }); c.root.position.set(x, 0, z); c.root.rotation.y = r; scene.add(c.root); c.off = i * 0.7; cs.push(c); });
  for (const [x, z, r, s] of [[-1.4, -7.8, 2.2, 2310], [3.0, -6.6, Math.PI, 2311]]) { const c = makeCivilian(rig, { seed: s, india: true, kind: 'woman', bag: 'none' }); c.root.position.set(x, 0, z); c.root.rotation.y = r; scene.add(c.root); c.off = s % 3; cs.push(c); }
  const walker = cs[2];
  const A = V3(-4.8, 1.55, -1.2), B = V3(-3.8, 1.5, -2.4);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.18, uLookSat: 0.92, uBloom: 0.08, uHalation: 0.1, uVignette: 0.58, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach(c => pose(c, c === walker ? 'Walk' : 'Idle', t, { offset: c.off, rate: c === walker ? 0.45 : 0.8 }));
      walker.root.position.z = -8.2 + 0.12 * t; cs[6].root.position.z = walker.root.position.z + 1.0;
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0.4, 0.9, -7.4), { focal: 28, shake: 0.03, shakeFreq: 0.3, t, seed: 11202 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- L11C: walking to school ----------------
export async function L11C(ctx) {
  const { scene, camera } = dayStage(ctx, { ...SOFT, az: 100, el: 20, sky: { ...MORNING.sky, uDawn: [0.3, 0.2, 0.1] } }, { ground: [0.34, 0.3, 0.24], extent: 70 });
  const wall = lit([0.75, 0.62, 0.42], 0.9, 0, 'scwall'), trim = lit([0.45, 0.2, 0.12], 0.9, 0, 'sctrim'), dark = lit([0.08, 0.07, 0.06], 0.9, 0, 'scdark'), green = lit([0.12, 0.2, 0.08], 1, 0, 'sctree');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.BoxGeometry(40, 7, 9), wall, 0, 3.5, -30); add(new THREE.BoxGeometry(41, 0.5, 10), trim, 0, 7.2, -30); add(new THREE.BoxGeometry(40, 0.3, 2), trim, 0, 3.6, -25);
  for (let x = -18; x <= 18; x += 3) { add(new THREE.PlaneGeometry(1.4, 1.6), dark, x, 5.4, -25.49); if (Math.abs(x) > 2) add(new THREE.PlaneGeometry(1.4, 1.6), dark, x, 1.9, -25.49); }
  add(new THREE.PlaneGeometry(2.4, 3), dark, 0, 1.5, -25.48);
  for (const x of [-26, -14, 14, 26]) add(new THREE.BoxGeometry(0.6, 2.2, 0.6), trim, x, 1.1, -12);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(11, 2.2, 0.3), wall, s * 20, 1.1, -12);
  for (const [x, z] of [[-30, -20], [30, -18], [-24, 4]]) { add(new THREE.CylinderGeometry(0.3, 0.4, 4, 8), trim, x, 2, z); const c = add(new THREE.IcosahedronGeometry(3.4, 1), green, x, 6, z); c.scale.y = 0.8; }
  const rig = await loadRig(); const cs = []; const rnd = mulberry32(113);
  for (let i = 0; i < 26; i++) {
    const girl = rnd() < 0.5;
    const c = makeCivilian(rig, { seed: 2400 + i, india: true, kind: 'child', bag: 'none', outfit: { top: girl ? [0.65, 0.72, 0.85] : [0.88, 0.88, 0.86], leg: girl ? [0.12, 0.16, 0.35] : [0.15, 0.18, 0.3] } });
    c.x0 = -6 + rnd() * 12; c.z0 = 16 + rnd() * 30; c.sp = 0.9 + rnd() * 0.3; c.root.rotation.y = (rnd() - 0.5) * 0.15; c.off = rnd() * 3;
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.12), lit([[0.6, 0.15, 0.1], [0.1, 0.2, 0.5], [0.15, 0.4, 0.2]][i % 3], 0.8, 0, 'sbag' + (i % 3)));
    bag.scale.setScalar(100); bag.position.set(0, 10, 16); c.bones.mixamorigSpine2.add(bag); scene.add(c.root); cs.push(c);
  }
  const A = V3(5, 1.2, 30), B = V3(3, 1.25, 22);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.18, uLookSat: 0.95, uBloom: 0.08, uHalation: 0.1, uVignette: 0.58, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach(c => { c.root.position.set(c.x0, 0, c.z0 - c.sp * t); pose(c, 'Walk', t, { offset: c.off, rate: c.sp }); });
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 2, -20), { focal: 30, shake: 0.04, shakeFreq: 0.35, t, seed: 11303 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- L11D: cricket beside the plant at dusk ----------------
export async function L11D(ctx) {
  const DUSK = { ...MORNING, az: 255, el: 6, sunCol: [1.0, 0.6, 0.32], sunI: 2.2, density: 0.0018, glow: [0.8, 0.45, 0.2], sky: { ...MORNING.sky, uDawn: [0.65, 0.32, 0.12], uDawnPow: 3 } };
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, carve: [[-80, 10, 90, 150]], day: { ...DUSK, center: V3(-30, 0, 100), extent: 120 } });
  const { scene, camera } = W;
  const wood = lit([0.7, 0.6, 0.4], 0.8, 0, 'stumps');
  for (const z of [104, 124]) for (const dx of [-0.11, 0, 0.11]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.71, 6), wood); s.position.set(-30 + dx, 0.355, z); s.castShadow = true; scene.add(s); }
  const rig = await loadRig(); const cs = []; const rnd = mulberry32(114);
  const spots = [[-30, 103.2, 0, 'Idle'], [-30.4, 126, Math.PI, 'Run'], [-38, 112, 0.9, 'Idle'], [-22, 116, -1.2, 'Idle'], [-34, 98, 0.3, 'Idle'], [-26, 132, Math.PI, 'Idle'], [-44, 122, 1.8, 'Idle'], [-31, 101.6, 0, 'Idle']];
  spots.forEach(([x, z, r, cl], i) => { const c = makeCivilian(rig, { seed: 2500 + i, india: true, kind: i === 7 ? 'man' : 'child', bag: 'none' }); c.root.position.set(x, 0, z); c.root.rotation.y = r; c.clip = cl; c.off = rnd() * 3; scene.add(c.root); cs.push(c); });
  const bat = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.03), wood); bat.scale.setScalar(100); bat.position.set(0, 30, 0); cs[0].bones.mixamorigRightHand.add(bat);
  const bowler = cs[1];
  const A = V3(-25, 1.3, 121), B = V3(-26.5, 1.3, 118);
  return {
    scene, camera,
    look: { uExposure: 1.2, uLookPow: 1.2, uLookSat: 0.9, uBloom: 0.1, uHalation: 0.14, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15); const ph = (t % 7.5) / 7.5;
      bowler.root.position.z = 132 - ph * 8; bowler.clip = ph < 0.8 ? 'Run' : 'Idle';
      cs.forEach(c => pose(c, c.clip, t, { offset: c.off }));
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-30.5, 1.6, 100), { focal: 35, shake: 0.03, shakeFreq: 0.3, t, seed: 11404 });
      return dcam(ctx, camera) || {};
    },
  };
}
