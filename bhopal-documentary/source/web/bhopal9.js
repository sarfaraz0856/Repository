// BHOPAL, chapter 9 – THE SETTLEMENT (1989 – 2010).
// J9A the Supreme Court in New Delhi; J9B survivors protesting; J9C a queue at a compensation office;
// J9D a court in Bhopal, June 2010, the verdict.
import * as THREE from 'three';
import { ATM, makeSky } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights } from './lib/daysky.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { V3, lit } from './lib/bhopal.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian, makeCar } from './lib/street.js';
import { MIDDAY } from './bhopal8.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
// a simple sunlit outdoor world: ground, sky, sun, haze
export function dayStage(ctx, D, { ground = [0.3, 0.27, 0.22], extent = 120, center = V3(0, 0, 0) } = {}) {
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(30, ctx.aspect, 0.3, 6000);
  const sun = sunDir(D.az, D.el); const sk = makeDaySky({ noiseTex: ctx.noiseTex }); sk.uniforms.uSunDir.value.copy(sun);
  for (const [k, v] of Object.entries(D.sky || {})) { const u = sk.uniforms[k]; if (u.value?.setRGB && Array.isArray(v)) u.value.setRGB(...v); else u.value = v; }
  scene.add(sk);
  dayLights(scene, { dir: sun, sunColor: new THREE.Color(...D.sunCol), sunI: D.sunI, skyColor: new THREE.Color(...D.skyCol), groundColor: new THREE.Color(...D.groundCol), hemiI: D.hemiI, center, extent, near: 100, far: 7000 });
  ATM.uMoonDir.value.copy(sun); ATM.uLampMapOn.value = 0; ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(...D.fog); ATM.uFogDensity.value = D.density; ATM.uFogHeight.value = D.fogH; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(sun.x, 0, sun.z).normalize(); ATM.uGlowCol.value.setRGB(...D.glow); ATM.uGlowPow.value = 6; ATM.uMoonHalo.value.setRGB(...D.halo); ATM.uFireFog.value.setRGB(0, 0, 0);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), lit(ground, 1, 0, 'stgnd' + ground.join(''))); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g);
  return { scene, camera, sun };
}
const crowdAt = async (scene, n, seed, area, opts = {}) => {
  const rig = await loadRig(); const rnd = mulberry32(seed); const cs = [];
  for (let i = 0; i < n; i++) {
    const kind = opts.women ? (rnd() < 0.8 ? 'woman' : 'man') : (rnd() < 0.5 ? 'woman' : 'man');
    const c = makeCivilian(rig, { seed: seed * 10 + i, india: true, kind, bag: 'none' });
    c.root.position.set(area[0] + rnd() * (area[1] - area[0]), 0, area[2] + rnd() * (area[3] - area[2])); c.root.rotation.y = (area[4] ?? 0) + (rnd() - 0.5) * (area[5] ?? 0.8); scene.add(c.root); c.off = rnd() * 3; cs.push(c);
  }
  return cs;
};
// placards: plain boards on sticks (no legible text)
function placards(scene, cs, rnd) {
  const cols = [[0.7, 0.7, 0.66], [0.6, 0.2, 0.15], [0.65, 0.55, 0.2]].map((c, i) => lit(c, 0.9, 0, 'plc' + i)), ink = lit([0.05, 0.05, 0.05], 0.9, 0, 'plink'), stick = lit([0.3, 0.2, 0.1], 0.9, 0, 'plstick');
  cs.forEach(c => {
    if (rnd() < 0.45) return;
    const g = new THREE.Group(); g.position.copy(c.root.position).add(V3(0.25, 0, 0)); g.rotation.y = c.root.rotation.y + Math.PI; scene.add(g);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.2, 6), stick); st.position.y = 1.1; g.add(st);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.02), cols[Math.floor(rnd() * 3)]); b.position.y = 2.25; b.castShadow = true; g.add(b);
    for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.5 - k * 0.08, 0.05, 0.022), ink); l.position.set(0, 2.38 - k * 0.12, 0); g.add(l); }
  });
}

// ---------------- J9A: the Supreme Court ----------------
function supremeCourt(scene) {
  const g = new THREE.Group(); scene.add(g);
  const red = lit([0.48, 0.24, 0.17], 0.9, 0, 'scred'), cream = lit([0.68, 0.62, 0.5], 0.9, 0, 'sccream'), dark = lit([0.12, 0.12, 0.13], 0.5, 0.3, 'scdome'), win = lit([0.06, 0.06, 0.07], 0.3, 0.2, 'scwin');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(150, 3, 40), red, 0, 1.5, 0);
  add(new THREE.BoxGeometry(44, 18, 34), cream, 0, 12, 0);
  for (const x of [-48, 48]) { add(new THREE.BoxGeometry(56, 14, 26), cream, x, 10, 2); add(new THREE.BoxGeometry(56, 3, 27), red, x, 4.5, 2); }
  add(new THREE.CylinderGeometry(10, 10, 6, 32), cream, 0, 24, -2);
  const d = add(new THREE.SphereGeometry(10.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), dark, 0, 27, -2); d.scale.y = 1.15;
  add(new THREE.CylinderGeometry(0.3, 0.5, 5, 8), dark, 0, 41, -2);
  for (let i = -5; i <= 5; i++) add(new THREE.CylinderGeometry(0.75, 0.85, 14, 14), cream, i * 3.8, 10, 17.5);     // colonnade
  add(new THREE.BoxGeometry(44, 2.2, 4), cream, 0, 18.1, 17.5);
  for (const x of [-48, 48]) for (let i = -5; i <= 5; i++) for (const y of [6, 11.5]) add(new THREE.PlaneGeometry(1.8, 2.6), win, x + i * 4.6, y, 15.01);
  add(new THREE.BoxGeometry(30, 0.4, 14), red, 0, 0.2, 26);   // steps
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(260, 140), lit([0.16, 0.24, 0.1], 1, 0, 'sclawn')); lawn.rotation.x = -Math.PI / 2; lawn.position.set(0, 0.02, 80); lawn.receiveShadow = true; g.add(lawn);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(12, 120), lit([0.5, 0.42, 0.33], 0.95, 0, 'scpath')); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.03, 90); g.add(path);
  return g;
}
export async function J9A(ctx) {
  const { scene, camera } = dayStage(ctx, { ...MIDDAY, az: 160, el: 38 }, { center: V3(0, 0, 20), extent: 160 });
  supremeCourt(scene);
  const A = V3(-40, 3.5, 150), B = V3(-26, 4.5, 118);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.9, uBloom: 0.06, uHalation: 0.08, uVignette: 0.58, uGrain: 0.04 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 18, 0), { focal: 32, shake: 0.03, shakeFreq: 0.3, t, seed: 9101 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- J9B: survivors protesting ----------------
export async function J9B(ctx) {
  const { scene, camera } = dayStage(ctx, { ...MIDDAY, az: 140, el: 30 }, { ground: [0.32, 0.28, 0.22], center: V3(0, 0, 0), extent: 60 });
  const wall = lit([0.6, 0.55, 0.45], 0.9, 0, 'pwall');
  for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(14, 6 + (i % 3) * 3, 10), wall); b.position.set(-56 + i * 15, 4, -24); b.castShadow = true; b.receiveShadow = true; scene.add(b); }
  const cs = await crowdAt(scene, 70, 91, [-18, 18, -12, 14, Math.PI, 0.6], { women: true });
  placards(scene, cs, mulberry32(92));
  const A = V3(8, 1.7, 26), B = V3(4, 1.75, 20);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.92, uBloom: 0.06, uHalation: 0.08, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-2, 1.8, -4), { focal: 30, shake: 0.08, shakeFreq: 0.4, t, seed: 9202 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera) || { dof: { focus: 18, focal: 30, fstop: 4 } };
    },
  };
}

// ---------------- J9C: the compensation office ----------------
export async function J9C(ctx) {
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 200);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const wall = lit([0.6, 0.6, 0.52], 0.95, 0, 'cowall'), wood = lit([0.3, 0.18, 0.09], 0.6, 0, 'cowood'), floor = lit([0.32, 0.3, 0.27], 0.7, 0, 'cofloor'), paper = lit([0.75, 0.72, 0.62], 0.9, 0, 'copaper'), grille = lit([0.15, 0.16, 0.15], 0.5, 0.5, 'cogrille');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.PlaneGeometry(12, 20), floor, 0, 0, -6, -Math.PI / 2); add(new THREE.PlaneGeometry(12, 20), wall, 0, 4, -6, Math.PI / 2);
  add(new THREE.PlaneGeometry(12, 4), wall, 0, 2, -16); add(new THREE.PlaneGeometry(20, 4), wall, -6, 2, -6, 0, Math.PI / 2); add(new THREE.PlaneGeometry(20, 4), wall, 6, 2, -6, 0, -Math.PI / 2);
  add(new THREE.BoxGeometry(12, 1.1, 0.8), wood, 0, 0.55, -12);                                  // the counter
  for (let x = -5.5; x <= 5.5; x += 0.25) add(new THREE.BoxGeometry(0.02, 1.4, 0.02), grille, x, 1.8, -12.3);
  for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.6, 0.12, 0.45), paper, -4.5 + i * 1.8, 1.16, -12.2, 0, (i - 3) * 0.1);
  for (let i = 0; i < 8; i++) for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(0.35, 0.04, 0.28), paper, -5.4 + i * 0.4, 1.0 + k * 0.05, -14.2);   // files on the shelf
  add(new THREE.BoxGeometry(4, 2.2, 0.5), wood, -3.5, 1.1, -15.6);
  for (const x of [-4, 0, 4]) { add(new THREE.BoxGeometry(1.2, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4.3, 4.1), fog: false }), x, 3.95, -8); const pl = new THREE.PointLight(new THREE.Color(0.9, 1.0, 0.95), 12, 12, 2); pl.position.set(x, 3.7, -8); scene.add(pl); }
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.55, 0.56, 0.52), new THREE.Color(0.2, 0.18, 0.15), 0.6));
  // the queue: survivors waiting, clerks behind the counter
  const rig = await loadRig(); const rnd = mulberry32(93); const cs = [];
  for (let i = 0; i < 22; i++) { const c = makeCivilian(rig, { seed: 1700 + i, india: true, kind: rnd() < 0.55 ? 'woman' : 'man', bag: rnd() < 0.3 ? 'sack' : 'none' }); c.root.position.set(-1.2 + (i % 2) * 0.9 + (rnd() - 0.5) * 0.2, 0, -10.8 + Math.floor(i / 2) * 0.9); c.root.rotation.y = 0 + (rnd() - 0.5) * 0.3; scene.add(c.root); c.off = rnd() * 3; cs.push(c); }
  for (let i = 0; i < 3; i++) { const c = makeCivilian(rig, { seed: 1750 + i, india: true, kind: 'man', bag: 'none', outfit: { top: [0.62, 0.6, 0.55], leg: [0.2, 0.2, 0.22] } }); c.root.position.set(-3 + i * 3, 0, -13.2); c.root.rotation.y = Math.PI; scene.add(c.root); c.off = rnd() * 3; cs.push(c); }
  const A = V3(3.4, 1.8, -1.0), B = V3(2.4, 1.7, -4.0);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.08, uHalation: 0.1, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-0.8, 1.3, -11.5), { focal: 30, shake: 0.04, shakeFreq: 0.3, t, seed: 9303 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- J9D: the verdict, June 2010 ----------------
export async function J9D(ctx) {
  const SUMMER = { ...MIDDAY, az: 120, el: 55, sunCol: [1.0, 0.92, 0.8], sunI: 3.0, fog: [0.7, 0.66, 0.6], density: 0.0009, sky: { ...MIDDAY.sky, uHorizon: [0.7, 0.66, 0.6], uCloudCover: 0.15 } };
  const { scene, camera } = dayStage(ctx, SUMMER, { ground: [0.34, 0.3, 0.24], extent: 80 });
  const wall = lit([0.66, 0.6, 0.48], 0.9, 0, 'cwall'), trim = lit([0.5, 0.36, 0.24], 0.9, 0, 'ctrim'), dark = lit([0.06, 0.05, 0.05], 0.9, 0, 'cdark');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.BoxGeometry(70, 11, 16), wall, 0, 5.5, -18); add(new THREE.BoxGeometry(71, 0.7, 17), trim, 0, 11.2, -18);
  for (let x = -32; x <= 32; x += 4) { add(new THREE.BoxGeometry(0.6, 4, 0.6), trim, x, 2, -9.6); add(new THREE.PlaneGeometry(1.6, 2.2), dark, x + 2, 7.4, -9.99); }
  add(new THREE.BoxGeometry(68, 4, 0.1), dark, 0, 2, -10.1);
  const cs = await crowdAt(scene, 60, 94, [-20, 20, -6, 14, 0, 6.28]);
  placards(scene, cs, mulberry32(95));
  // press cameras on tripods
  const steel = lit([0.08, 0.08, 0.09], 0.4, 0.6, 'tripod');
  for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.position.set(-8 + i * 4, 0, 2 + (i % 2)); scene.add(g); for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 6), steel); l.position.set(Math.cos(k * 2.1) * 0.25, 0.75, Math.sin(k * 2.1) * 0.25); l.rotation.set(Math.sin(k * 2.1) * 0.3, 0, -Math.cos(k * 2.1) * 0.3); g.add(l); } const cam = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.5), steel); cam.position.y = 1.6; cam.rotation.y = Math.PI; g.add(cam); }
  for (const [x, z] of [[-26, 18], [-20, 22], [24, 20]]) { const car = makeCar({ color: new THREE.Color(0.75, 0.75, 0.72) }); car.group.position.set(x, 0, z); car.group.rotation.y = 0.3; scene.add(car.group); }
  const A = V3(-14, 4.5, 34), B = V3(-8, 3.6, 26);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.9, uBloom: 0.06, uHalation: 0.08, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 3, -10), { focal: 30, shake: 0.06, shakeFreq: 0.35, t, seed: 9404 });
      cs.forEach((c, i) => pose(c, i % 4 ? 'Idle' : 'Walk', t, { offset: c.off, rate: 0.6 }));
      return dcam(ctx, camera) || {};
    },
  };
}
