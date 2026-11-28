// BHOPAL, chapter 6 – THE MORNING (3 December 1984).
// G6A the JP Nagar lane at dawn, silent, belongings left behind; G6B a main road strewn with shoes, bundles,
// bicycles; G6C the plant by day, the tank almost empty; G6D the city from the air in the morning haze, the
// trees yellowed by the gas.
import * as THREE from 'three';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, STACK_TOP, TANKS } from './lib/bhopal.js';
import { laneProps } from './bhopal1.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian } from './lib/street.js';
import { covered } from './bhopal5.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
export const MORNING = { az: 118, el: 9, sunCol: [1.0, 0.7, 0.45], sunI: 2.3, skyCol: [0.45, 0.5, 0.6], groundCol: [0.22, 0.18, 0.13], hemiI: 0.8, fog: [0.55, 0.52, 0.47], density: 0.0026, fogH: 50, glow: [0.7, 0.45, 0.25], halo: [0.8, 0.5, 0.3],
  sky: { uSunCol: [2.2, 1.4, 0.8], uZenith: [0.1, 0.14, 0.24], uHorizon: [0.5, 0.46, 0.42], uDawn: [0.5, 0.3, 0.15], uDawnPow: 4, uCloudBright: [0.85, 0.72, 0.58], uCloudShade: [0.36, 0.35, 0.37], uCloudCover: 0.3, uSunDisk: 50 } };
const YELLOW = [0.2, 0.17, 0.05];

// scattered belongings: chappals, bundles, a bicycle on its side, a basket, a cot pushed over
export function debris(scene, rnd, area, n = 40) {
  const g = new THREE.Group(); scene.add(g);
  const [x0, x1, z0, z1] = area;
  const chap = [[0.12, 0.1, 0.08], [0.3, 0.12, 0.08], [0.1, 0.12, 0.25], [0.35, 0.3, 0.25]].map((c, i) => lit(c, 0.8, 0, 'chap' + i));
  const bund = [[0.5, 0.15, 0.1], [0.2, 0.25, 0.4], [0.5, 0.45, 0.3], [0.15, 0.3, 0.2], [0.55, 0.5, 0.45]].map((c, i) => lit(c, 1, 0, 'bund' + i));
  const steel = lit([0.1, 0.1, 0.11], 0.4, 0.7, 'bike');
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0), r = rnd() * 6.28;
    if (rnd() < 0.55) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.26), chap[Math.floor(rnd() * 4)]); s.position.set(x, 0.015, z); s.rotation.y = r; s.castShadow = true; g.add(s); }
    else if (rnd() < 0.8) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), bund[Math.floor(rnd() * 5)]); b.scale.set(1.4, 0.42, 1.0); b.position.set(x, 0.1, z); b.rotation.y = r; b.castShadow = true; g.add(b); }
    else {
      const bk = new THREE.Group(); bk.position.set(x, 0.33, z); bk.rotation.set(Math.PI / 2, 0, r); g.add(bk);
      for (const dx of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.02, 6, 24), steel); w.position.x = dx; bk.add(w); }
      const fr = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.1, 6), steel); fr.rotation.z = Math.PI / 2; fr.position.y = 0.15; bk.add(fr);
      const fr2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.6, 6), steel); fr2.rotation.z = 0.9; fr2.position.set(-0.1, 0.1, 0); bk.add(fr2);
    }
  }
  return g;
}

// ---------------- G6A: the lane at dawn ----------------
export async function G6A(ctx) {
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, laneCut: true, treeTint: YELLOW, day: { ...MORNING, center: V3(0, 0, 160), extent: 120 } });
  const { scene, camera } = W;
  laneProps(scene); const rnd = mulberry32(61);
  debris(scene, rnd, [-2.2, 2.2, 110, 200], 50);
  const A = V3(0.6, 1.5, 205), B = V3(0.3, 1.45, 196);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.08, uHalation: 0.1, uVignette: 0.6, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 1.0, 120), { focal: 30, shake: 0.04, shakeFreq: 0.3, t, seed: 6101 });
      return dcam(ctx, camera) || { dof: { focus: 10, focal: 30, fstop: 4 } };
    },
  };
}

// ---------------- G6B: the main road the morning after ----------------
export async function G6B(ctx) {
  const { bazaarSet } = await import('./bhopal3.js');
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0, treeTint: YELLOW, carve: [[-30, 30, 520, 880]], day: { ...MORNING, center: V3(0, 0, 700), extent: 150 } });
  const { scene, camera } = W;
  bazaarSet(scene, { z0: 540, z1: 860, half: 7 }); const rnd = mulberry32(62);
  scene.traverse(o => { if (o.isPointLight) o.visible = false; if (o.isMesh && o.material?.isMeshBasicMaterial) o.visible = false; });
  debris(scene, rnd, [-6, 6, 600, 790], 110);
  for (let i = 0; i < 10; i++) covered(scene, -5 + rnd() * 10, 0.02, 620 + rnd() * 150, rnd() * 6.28, [[0.55, 0.52, 0.46], [0.5, 0.15, 0.1], [0.2, 0.25, 0.4]][i % 3], rnd);
  const rig = await loadRig(); const cs = [];
  for (let i = 0; i < 6; i++) { const c = makeCivilian(rig, { seed: 1100 + i, india: true, bag: 'none' }); c.root.position.set(-4 + rnd() * 8, 0, 650 + rnd() * 120); c.root.rotation.y = rnd() * 6.28; scene.add(c.root); c.off = rnd() * 3; cs.push(c); }
  const A = V3(2.5, 1.8, 800), B = V3(1.5, 1.7, 788);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.08, uHalation: 0.1, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-0.5, 1.2, 660), { focal: 30, shake: 0.04, shakeFreq: 0.3, t, seed: 6202 });
      cs.forEach(c => pose(c, 'Walk', t * 0.6, { offset: c.off, rate: 0.6 }));
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- G6C: the plant by day ----------------
export async function G6C(ctx) {
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, treeTint: YELLOW, day: { ...MORNING, el: 14, center: V3(-20, 0, -80), extent: 200, density: 0.0011 } });
  const { scene, camera } = W;
  const A = V3(70, 26, 40), B = V3(52, 22, 22);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.82, uBloom: 0.07, uHalation: 0.1, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(TANKS.x, 4, TANKS.z), { focal: 30, shake: 0.04, shakeFreq: 0.3, t, seed: 6303 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- G6D: the city from the air, morning haze ----------------
export async function G6D(ctx) {
  const W = bhopalWorld(ctx, { litFrac: 0, treeTint: YELLOW, day: { ...MORNING, el: 12, center: V3(0, 0, 1200), extent: 900, density: 0.0006, fogH: 120 } });
  const { scene, camera } = W;
  const A = V3(-420, 240, 2700), B = V3(-400, 215, 2520);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.07, uHalation: 0.1, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-460, -80, 0), { focal: 30, shake: 0.05, shakeFreq: 0.25, t, seed: 6404 });
      return dcam(ctx, camera) || { fade: smoothstep(13.6, 15, t) * 0 };
    },
  };
}
