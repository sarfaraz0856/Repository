// BHOPAL, chapter 7 – THE TOLL.
// H7A the cremation ghat by the river, many pyres; H7B rows of fresh graves; H7C a field of diyas, lit one by one,
// for the dead; H7D the city at dusk with smoke rising from the pyres.
import * as THREE from 'three';
import { ATM } from './lib/atmos.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, MOON } from './lib/bhopal.js';
import { gasFX } from './bhopal1.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian } from './lib/street.js';
import { Flames } from './lib/fx.js';
import { VolumeFX } from './lib/volume.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const OVERCAST = { az: 200, el: 28, sunCol: [0.9, 0.86, 0.8], sunI: 1.2, skyCol: [0.6, 0.62, 0.66], groundCol: [0.25, 0.22, 0.18], hemiI: 1.3, fog: [0.55, 0.55, 0.55], density: 0.0016, fogH: 80, glow: [0.3, 0.3, 0.3], halo: [0.3, 0.3, 0.3],
  sky: { uSunCol: [1.2, 1.1, 1.0], uZenith: [0.3, 0.33, 0.38], uHorizon: [0.6, 0.6, 0.6], uDawn: [0, 0, 0], uCloudBright: [0.7, 0.7, 0.7], uCloudShade: [0.4, 0.41, 0.43], uCloudCover: 0.85, uSunDisk: 10 } };
const GHAT = V3(-1400, 0, 400);      // on the river bank, west of the old city
const mourners = async (scene, n, seed, area, white = 0.6) => {
  const rig = await loadRig(); const rnd = mulberry32(seed); const cs = [];
  for (let i = 0; i < n; i++) {
    const w = rnd() < white;
    const c = makeCivilian(rig, { seed: seed * 10 + i, india: true, kind: rnd() < 0.7 ? 'man' : 'woman', bag: 'none', outfit: w ? { top: [0.72, 0.71, 0.68], leg: [0.7, 0.69, 0.66] } : null });
    c.root.position.set(area[0] + rnd() * (area[1] - area[0]), area[4] ?? 0, area[2] + rnd() * (area[3] - area[2])); c.root.rotation.y = (area[5] ?? 0) + (rnd() - 0.5) * 1.2; scene.add(c.root); c.off = rnd() * 3; cs.push(c);
  }
  return cs;
};

// ---------------- H7A: the cremation ghat ----------------
export async function H7A(ctx) {
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0, day: { ...OVERCAST, center: GHAT, extent: 120 } });
  const { scene, camera } = W;
  const g = new THREE.Group(); g.position.copy(GHAT); scene.add(g);
  const stone = lit([0.45, 0.42, 0.36], 0.95, 0, 'ghstone'), ash = lit([0.18, 0.17, 0.16], 1, 0, 'ghash'), wood = lit([0.28, 0.18, 0.1], 0.9, 0, 'ghwood');
  // river and the stepped bank
  const water = new THREE.Mesh(new THREE.PlaneGeometry(600, 200), lit([0.12, 0.13, 0.13], 0.15, 0.4, 'ghwater')); water.rotation.x = -Math.PI / 2; water.position.set(0, -2.6, -110); g.add(water);
  for (let i = 0; i < 6; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(200, 0.45, 2.2), stone); st.position.set(0, -0.45 * i - 0.2, -10 - i * 2.2); st.receiveShadow = true; g.add(st); }
  const plat = new THREE.Mesh(new THREE.BoxGeometry(200, 0.3, 40), stone); plat.position.set(0, 0.15, 10); plat.receiveShadow = true; g.add(plat);
  // pyres: stacked logs, burning
  const rnd = mulberry32(71); const fl = []; const pyres = [];
  for (let i = 0; i < 14; i++) {
    const x = -70 + (i % 7) * 20 + (rnd() - 0.5) * 4, z = 2 + Math.floor(i / 7) * 14 + (rnd() - 0.5) * 3; pyres.push([x, z]);
    const pa = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 2.2), ash); pa.position.set(x, 0.32, z); g.add(pa);
    for (let k = 0; k < 7; k++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 6), wood); l.rotation.z = Math.PI / 2; l.rotation.y = (k % 2) * Math.PI / 2 + (rnd() - 0.5) * 0.2; l.position.set(x + (rnd() - 0.5) * 0.4, 0.42 + Math.floor(k / 2) * 0.2, z + (rnd() - 0.5) * 0.4); l.castShadow = true; g.add(l); }
    fl.push({ pos: [GHAT.x + x, 0.9, GHAT.z + z], w: 2.6, h: 3.4 + rnd() * 1.5, seed: i * 1.7, gain: 0.9 });
  }
  const flames = new Flames(ctx, fl); scene.add(flames.mesh);
  for (const [x, z] of pyres.slice(0, 6)) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.5, 0.18), 120, 26, 2); pl.position.set(GHAT.x + x, 2.5, GHAT.z + z); scene.add(pl); }
  const smoke = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: [GHAT.x - 110, 0, GHAT.z - 40], boxMax: [GHAT.x + 110, 140, GHAT.z + 60], steps: 72, shadowSteps: 4, albedo: 0.55 }); scene.add(smoke.mesh);
  smoke.setLighting({ firePos: [GHAT.x, 3, GHAT.z + 8], fireCol: [2.5, 1.0, 0.3], fireR: 40, fireShadowLen: 60, moonDir: [0.2, 0.9, 0.3], moonCol: [0.5, 0.5, 0.52], ambTop: [0.35, 0.36, 0.38], ambBot: [0.2, 0.18, 0.16], ext: 0.06, minStep: 1.0 });
  const cs = await mourners(scene, 34, 71, [GHAT.x - 75, GHAT.x + 60, GHAT.z + 10, GHAT.z + 28, 0.3, Math.PI]);
  const A = V3(GHAT.x + 48, 3.0, GHAT.z + 48), B = V3(GHAT.x + 36, 2.6, GHAT.z + 40);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.82, uBloom: 0.1, uHalation: 0.12, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      ATM.uTime.value = t;
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(GHAT.x - 20, 6, GHAT.z), { focal: 30, shake: 0.05, shakeFreq: 0.3, t, seed: 7101 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      smoke.setPlumes([
        { base: [GHAT.x - 40, 1.5, GHAT.z + 5], r0: 6, spread: 0.32, height: 120, density: 0.7, rise: 3, wind: [0.25, -0.1], noiseScale: 1 / 14, fireH: 0, fireEmis: 0, seed: 0.3 },
        { base: [GHAT.x + 0, 1.5, GHAT.z + 10], r0: 6, spread: 0.32, height: 110, density: 0.65, rise: 3, wind: [0.25, -0.1], noiseScale: 1 / 14, fireH: 0, fireEmis: 0, seed: 0.6 },
        { base: [GHAT.x + 40, 1.5, GHAT.z + 6], r0: 6, spread: 0.32, height: 110, density: 0.6, rise: 3, wind: [0.25, -0.1], noiseScale: 1 / 14, fireH: 0, fireEmis: 0, seed: 0.9 },
      ]);
      smoke.setGround({ center: [GHAT.x, 0, GHAT.z + 10], radius: 110, height: 4, density: 0.15, noiseScale: 1 / 10, drift: [0.4, 0.1, -0.2] });
      smoke.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- H7B: the graveyard ----------------
export async function H7B(ctx) {
  const GY = V3(1600, 0, 2200);
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0, carve: [[GY.x - 120, GY.x + 120, GY.z - 120, GY.z + 120]], day: { ...OVERCAST, center: GY, extent: 140 } });
  const { scene, camera } = W;
  const earth = lit([0.3, 0.22, 0.15], 1, 0, 'gyearth'), old = lit([0.2, 0.19, 0.14], 1, 0, 'gyold'), stone = lit([0.55, 0.53, 0.48], 0.9, 0, 'gystone');
  const rnd = mulberry32(72); const g = new THREE.Group(); g.position.copy(GY); scene.add(g);
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), lit([0.2, 0.18, 0.13], 1, 0, 'gyyard')); yard.rotation.x = -Math.PI / 2; yard.position.y = 0.02; yard.receiveShadow = true; g.add(yard);
  const mound = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const mi = new THREE.InstancedMesh(mound, earth, 600), m4 = new THREE.Matrix4(); let n = 0;
  for (let r = 0; r < 24; r++) for (let c = 0; c < 25; c++) { if (n >= 600) break; m4.compose(V3(-60 + c * 2.4 + (rnd() - 0.5) * 0.3, 0, -40 + r * 3.4 + (rnd() - 0.5) * 0.3), new THREE.Quaternion(), V3(0.75, 0.38, 1.3)); mi.setMatrixAt(n++, m4); }
  mi.count = n; mi.castShadow = true; mi.receiveShadow = true; g.add(mi);
  for (let i = 0; i < 160; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.1), stone); s.position.set(-60 + Math.floor(rnd() * 25) * 2.4, 0.35, -41.4 + Math.floor(rnd() * 24) * 3.4); s.castShadow = true; g.add(s); }
  const cs = await mourners(scene, 28, 72, [GY.x - 45, GY.x - 5, GY.z + 6, GY.z + 20, 0, Math.PI], 0.8);
  const A = V3(GY.x + 12, 2.4, GY.z + 30), B = V3(GY.x + 6, 2.1, GY.z + 25);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.8, uBloom: 0.07, uHalation: 0.1, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(GY.x - 22, 0.2, GY.z - 12), { focal: 30, shake: 0.04, shakeFreq: 0.3, t, seed: 7202 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- H7C: diyas for the dead ----------------
export async function H7C(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 500);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), lit([0.05, 0.045, 0.04], 0.9, 0, 'dyfloor')); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const N = 3600, rnd = mulberry32(73);
  const clay = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.035, 0.035, 12), lit([0.32, 0.15, 0.08], 0.9, 0, 'dyclay'), N);
  const flame = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(30, 12, 3), fog: false }), N);
  const order = [], m4 = new THREE.Matrix4();
  for (let i = 0; i < N; i++) { const r = 0.7 + Math.sqrt(rnd()) * 16, a = rnd() * 6.283; order.push([Math.cos(a) * r, Math.sin(a) * r * 0.9 - 6, r]); }
  order.sort((p, q) => p[2] - q[2]);
  order.forEach(([x, z], i) => { m4.makeTranslation(x, 0.018, z); clay.setMatrixAt(i, m4); m4.compose(V3(x, 0.06, z), new THREE.Quaternion(), V3(1, 1.8, 1)); flame.setMatrixAt(i, m4); });
  scene.add(clay, flame);
  const glows = []; for (let i = 0; i < 6; i++) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.55, 0.2), 0, 12, 2); scene.add(pl); glows.push(pl); }
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.02, 0.025, 0.04), new THREE.Color(0.01, 0.008, 0.006), 0.3));
  return {
    scene, camera,
    look: { uExposure: 1.3, uLookPow: 1.22, uLookSat: 0.9, uBloom: 0.16, uHalation: 0.2, uVignette: 0.7, uGrain: 0.05 },
    update(t) {
      const lit = Math.floor(N * smoothstep(0.5, 13.5, t) ** 1.6);
      flame.count = Math.max(1, lit); clay.count = Math.max(1, Math.min(N, lit + 400));
      const p = lerp(0.6, 16, smoothstep(0.5, 13.5, t));
      glows.forEach((pl, i) => { const a = i * 1.047; pl.position.set(Math.cos(a) * p * 0.6, 1.2, Math.sin(a) * p * 0.55 - 6); pl.intensity = 1.5 + 6 * smoothstep(0, 14, t); });
      const cam = V3(0, lerp(1.0, 9, easeInOutSine(t / 15)), lerp(1.2, 14, easeInOutSine(t / 15)));
      placeCamera(camera, ctx, cam, V3(0, 0, -6), { focal: 35, shake: 0.03, shakeFreq: 0.3, t, seed: 7303 });
      return dcam(ctx, camera) || { dof: { focus: cam.distanceTo(V3(0, 0, -6)), focal: 35, fstop: 2.8 } };
    },
  };
}

// ---------------- H7D: the city at dusk, smoke from the pyres ----------------
export async function H7D(ctx) {
  const DUSK = { ...OVERCAST, az: 250, el: 3, sunCol: [1.0, 0.5, 0.25], sunI: 1.4, skyCol: [0.35, 0.36, 0.45], hemiI: 0.6, fog: [0.45, 0.38, 0.34], density: 0.00035, fogH: 120,
    sky: { uSunCol: [2.0, 1.0, 0.45], uZenith: [0.08, 0.1, 0.18], uHorizon: [0.5, 0.36, 0.28], uDawn: [0.7, 0.32, 0.12], uDawnPow: 3, uCloudBright: [0.8, 0.5, 0.35], uCloudShade: [0.3, 0.26, 0.28], uCloudCover: 0.6, uSunDisk: 40 } };
  const W = bhopalWorld(ctx, { litFrac: 0, day: { ...DUSK, center: V3(-600, 0, 1200), extent: 900 } });
  const { scene, camera } = W;
  const smoke = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: [-1600, 0, 200], boxMax: [400, 500, 2600], steps: 72, shadowSteps: 4, albedo: 0.55 }); scene.add(smoke.mesh);
  smoke.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: [-0.9, 0.12, 0.3], moonCol: [0.7, 0.4, 0.2], ambTop: [0.2, 0.2, 0.24], ambBot: [0.12, 0.1, 0.09], ext: 0.05, minStep: 3 });
  const A = V3(200, 230, 2700), B = V3(150, 210, 2520);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.22, uLookSat: 0.85, uBloom: 0.09, uHalation: 0.12, uVignette: 0.64, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-900, 40, 600), { focal: 30, shake: 0.05, shakeFreq: 0.25, t, seed: 7404 });
      smoke.setPlumes([
        { base: [GHAT.x, 1, GHAT.z + 10], r0: 18, spread: 0.3, height: 420, density: 0.5, rise: 4, wind: [0.35, 0.2], noiseScale: 1 / 45, seed: 0.2 },
        { base: [-500, 1, 1700], r0: 12, spread: 0.3, height: 300, density: 0.45, rise: 4, wind: [0.35, 0.2], noiseScale: 1 / 40, seed: 0.5 },
        { base: [-200, 1, 900], r0: 10, spread: 0.3, height: 260, density: 0.4, rise: 4, wind: [0.35, 0.2], noiseScale: 1 / 40, seed: 0.8 },
      ]);
      smoke.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { fade: smoothstep(13.6, 15, t) * 0 };
    },
  };
}
