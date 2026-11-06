// BHOPAL, chapter 13 – THE MEMORIAL.
// N13A the mother-and-child statue opposite the plant (Ruth Kupferschmidt, 1985), morning; N13B murals on the
// plant wall; N13C a remembrance museum, belongings in glass cases; N13D the statue at dusk, garlands and candles.
import * as THREE from 'three';
import { fovFromFocalH, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, ROAD_Z } from './lib/bhopal.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian } from './lib/street.js';
import { MORNING } from './bhopal6.js';
import { ATM } from './lib/atmos.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const face = (dx, dz) => Math.atan2(dx, dz) + Math.PI;
export const STATUE = V3(22, 0, 96);

// a stylised mother holding a baby, a child clinging to her side, on a plinth
export function statue(scene, p, ry = 0) {
  const g = new THREE.Group(); g.position.copy(p); g.rotation.y = ry; scene.add(g);
  const stone = lit([0.56, 0.54, 0.5], 0.85, 0, 'stone'), plinth = lit([0.36, 0.34, 0.31], 0.9, 0, 'plinth');
  const add = (geo, m, x, y, z, rx = 0, ry2 = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry2, rz); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(4.4, 0.3, 4.4), plinth, 0, 0.15, 0); add(new THREE.BoxGeometry(2.0, 1.8, 2.0), plinth, 0, 1.2, 0);
  const B = 2.1;
  // the mother: a long robe, a bowed head, a raised arm holding the baby
  const prof = [[0.0, 0], [0.62, 0], [0.55, 0.6], [0.44, 1.3], [0.36, 1.8], [0.3, 2.1], [0.16, 2.25], [0.0, 2.28]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = add(new THREE.LatheGeometry(prof, 28), stone, 0, B, 0); body.scale.set(1, 1, 0.75);
  add(new THREE.SphereGeometry(0.24, 20, 16), stone, 0, B + 2.4, 0.08).scale.set(0.95, 1.15, 1);      // the bowed, veiled head
  for (const sx of [-1, 1]) add(new THREE.CapsuleGeometry(0.085, 0.5, 6, 10), stone, sx * 0.3, B + 1.88, 0.24, -0.93, 0, sx * 0.25);   // arms
  add(new THREE.CapsuleGeometry(0.15, 0.42, 8, 12), stone, 0.04, B + 1.66, 0.46, 0, 0, 1.45);          // the baby, held across her
  add(new THREE.SphereGeometry(0.12, 14, 12), stone, -0.3, B + 1.74, 0.46);
  // the child clinging at her side
  const cp = [[0.0, 0], [0.28, 0], [0.24, 0.4], [0.2, 0.8], [0.14, 1.0], [0.0, 1.02]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(cp, 20), stone, 0.62, B, 0.15);
  add(new THREE.SphereGeometry(0.15, 16, 12), stone, 0.6, B + 1.14, 0.18, 0, 0, -0.3);
  add(new THREE.CapsuleGeometry(0.05, 0.4, 6, 8), stone, 0.42, B + 0.8, 0.22, 0, 0, 1.1);
  return g;
}
function memorialGarden(scene) {
  const hedge = lit([0.1, 0.17, 0.06], 1, 0, 'hedge'), rail = lit([0.08, 0.08, 0.09], 0.5, 0.6, 'mrail'), path = lit([0.45, 0.4, 0.33], 0.95, 0, 'mpath');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  const P = STATUE;
  const pv = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), path); pv.rotation.x = -Math.PI / 2; pv.position.set(P.x, 0.04, P.z); pv.receiveShadow = true; scene.add(pv);
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(14, 0.8, 0.8), hedge, P.x, 0.4, P.z + s * 7); add(new THREE.BoxGeometry(0.8, 0.8, 14), hedge, P.x + s * 7, 0.4, P.z); }
  for (let i = -6; i <= 6; i += 0.5) add(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 4), rail, P.x + i, 0.6, P.z - 7.6);
}

// ---------------- N13A: the statue in the morning ----------------
export async function N13A(ctx) {
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, carve: [[10, 34, 84, 110]], day: { ...MORNING, el: 14, center: STATUE, extent: 80, density: 0.0018 } });
  const { scene, camera } = W;
  statue(scene, STATUE, Math.PI); memorialGarden(scene);
  const C = V3(STATUE.x, 3.5, STATUE.z);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.82, uBloom: 0.08, uHalation: 0.1, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const a = -0.55 + t * 0.045, r = 10.5 - t * 0.12;
      placeCamera(camera, ctx, V3(C.x + Math.sin(a) * r, 2.2, C.z - Math.cos(a) * r), C, { focal: 32, shake: 0.03, shakeFreq: 0.3, t, seed: 13101 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- N13B: murals on the plant wall ----------------
function muralTex(seed) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d'); const r = mulberry32(seed);
  const pal = ['#d8c8a0', '#b23a2a', '#2c3e6b', '#e0a52a', '#1d1d1d', '#3f7a4a', '#f2efe6'];
  x.fillStyle = pal[0]; x.fillRect(0, 0, 1024, 256);
  const bg = [1, 2, 3, 5, 6]; for (let i = 0; i < 6; i++) { x.fillStyle = pal[bg[Math.floor(r() * 5)]]; x.fillRect(i * 170 + r() * 20, 0, 160, 256); }
  for (let i = 0; i < 9; i++) {           // faces and raised hands, painted flat
    const cx = 60 + i * 110 + r() * 20, cy = 130 + r() * 30; if (r() < 0.35) continue; x.fillStyle = pal[4];
    x.beginPath(); x.ellipse(cx, cy - 40, 26, 32, 0, 0, 6.3); x.fill(); x.fillRect(cx - 30, cy - 8, 60, 120);
    x.fillStyle = pal[6]; x.beginPath(); x.arc(cx - 9, cy - 46, 4, 0, 6.3); x.arc(cx + 9, cy - 46, 4, 0, 6.3); x.fill();
    if (r() < 0.6) { x.fillStyle = pal[4]; x.fillRect(cx + 26, cy - 90, 12, 90); x.beginPath(); x.arc(cx + 32, cy - 96, 14, 0, 6.3); x.fill(); }
  }
  x.fillStyle = 'rgba(40,30,20,0.25)'; for (let i = 0; i < 400; i++) x.fillRect(r() * 1024, r() * 256, 2 + r() * 6, 1 + r() * 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export async function N13B(ctx) {
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, day: { ...MORNING, el: 24, az: 140, center: V3(0, 0, 70), extent: 80, density: 0.0014 } });
  const { scene, camera } = W;
  const wall = lit([0.55, 0.5, 0.42], 0.95, 0, 'muwall');
  const W0 = new THREE.Mesh(new THREE.BoxGeometry(80, 3.2, 0.4), wall); W0.position.set(-10, 1.6, 68); W0.castShadow = W0.receiveShadow = true; scene.add(W0);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshStandardMaterial({ map: muralTex(131 + i), roughness: 0.95 }));
    m.position.set(-35 + i * 10.4, 1.55, 68.21); m.receiveShadow = true; scene.add(m);
  }
  const rig = await loadRig(); const c = makeCivilian(rig, { seed: 2901, india: true, kind: 'man', bag: 'none' }); scene.add(c.root);
  const A = V3(-4, 1.6, 75.5), B = V3(-14, 1.6, 74.5);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.18, uLookSat: 0.95, uBloom: 0.07, uHalation: 0.1, uVignette: 0.6, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      c.root.position.set(-26 + t * 1.25, 0, 71); c.root.rotation.y = face(1, 0); pose(c, 'Walk', t, { rate: 0.9 });
      const cam = A.clone().lerp(B, k);
      placeCamera(camera, ctx, cam, V3(cam.x - 6, 1.5, 68), { focal: 28, shake: 0.03, shakeFreq: 0.3, t, seed: 13202 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- N13C: the remembrance museum ----------------
export async function N13C(ctx) {
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 200);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const wall = lit([0.5, 0.46, 0.4], 0.95, 0, 'mswall'), floor = lit([0.18, 0.12, 0.08], 0.6, 0, 'msfloor'), frame = lit([0.05, 0.05, 0.05], 0.6, 0, 'msframe');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.PlaneGeometry(10, 20), floor, 0, 0, -6, -Math.PI / 2); add(new THREE.PlaneGeometry(10, 20), wall, 0, 3.4, -6, Math.PI / 2);
  add(new THREE.PlaneGeometry(10, 3.4), wall, 0, 1.7, -16); add(new THREE.PlaneGeometry(20, 3.4), wall, -5, 1.7, -6, 0, Math.PI / 2); add(new THREE.PlaneGeometry(20, 3.4), wall, 5, 1.7, -6, 0, -Math.PI / 2);
  // photographs: grey prints in black frames, lit by spots
  const rnd = mulberry32(133);
  const prints = [0.3, 0.45, 0.6].map((v, i) => lit([v, v * 0.97, v * 0.92], 0.9, 0, 'print' + i));
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
    const z = -1.5 - i * 2.2, w = 0.9 + rnd() * 0.5, h = 0.7 + rnd() * 0.4;
    add(new THREE.BoxGeometry(0.04, h + 0.08, w + 0.08), frame, s * 4.97, 1.75, z);
    add(new THREE.PlaneGeometry(w, h), prints[Math.floor(rnd() * 3)], s * 4.94, 1.75, z, 0, -s * Math.PI / 2);
    const sp = new THREE.SpotLight(new THREE.Color(1.0, 0.85, 0.65), 9, 6, 0.5, 0.6, 2); sp.position.set(s * 3.8, 3.3, z); sp.target.position.set(s * 5, 1.7, z); scene.add(sp, sp.target);
  }
  // glass cases with belongings: chappals, a pair of glasses, a child's frock, a steel tiffin
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, transparent: true, opacity: 0.25, thickness: 0.02 });
  const base = lit([0.12, 0.1, 0.08], 0.7, 0, 'casebase');
  const objs = [lit([0.3, 0.12, 0.08], 0.8, 0, 'o0'), lit([0.6, 0.15, 0.2], 1, 0, 'o1'), lit([0.6, 0.6, 0.62], 0.3, 0.9, 'o2'), lit([0.08, 0.06, 0.05], 0.5, 0.2, 'o3')];
  const cases = [];
  for (let i = 0; i < 3; i++) {
    const z = -3 - i * 3.6; add(new THREE.BoxGeometry(1.2, 0.95, 0.8), base, 0, 0.475, z);
    const gc = add(new THREE.BoxGeometry(1.2, 0.5, 0.8), glass, 0, 1.2, z); gc.castShadow = false;
    add(new THREE.BoxGeometry(0.11, 0.025, 0.26), objs[0], -0.3, 0.97, z, 0, 0.3); add(new THREE.BoxGeometry(0.11, 0.025, 0.26), objs[0], -0.15, 0.97, z + 0.05, 0, 0.1);
    if (i === 0) { const f = add(new THREE.ConeGeometry(0.22, 0.4, 12), objs[1], 0.25, 0.97, z, -Math.PI / 2); f.scale.z = 0.3; }
    if (i === 1) { add(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16), objs[2], 0.25, 1.08, z); add(new THREE.TorusGeometry(0.04, 0.006, 6, 16), objs[3], 0.0, 0.98, z, -Math.PI / 2); add(new THREE.TorusGeometry(0.04, 0.006, 6, 16), objs[3], 0.09, 0.98, z, -Math.PI / 2); }
    if (i === 2) add(new THREE.BoxGeometry(0.4, 0.04, 0.3), objs[1], 0.25, 0.98, z);
    const sp = new THREE.SpotLight(new THREE.Color(1.0, 0.9, 0.75), 10, 5, 0.35, 0.5, 2); sp.position.set(0, 3.3, z); sp.target.position.set(0, 1, z); sp.castShadow = true; scene.add(sp, sp.target);
    cases.push(z);
  }
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.4, 0.37, 0.34), new THREE.Color(0.14, 0.11, 0.08), 1.0));
  const rig = await loadRig(); const cs = [];
  for (const [x, z, dx, dz, s] of [[-0.9, -3.2, 1, 0, 3001], [2.6, -8.0, 1, 0, 3002], [-2.8, -10.2, -1, 0, 3003]]) { const c = makeCivilian(rig, { seed: s, india: true, bag: 'none' }); c.root.position.set(x, 0, z); c.root.rotation.y = face(dx, dz); scene.add(c.root); c.off = s % 5; cs.push(c); }
  const A = V3(1.8, 1.55, 1.5), B = V3(1.2, 1.5, -0.4);
  return {
    scene, camera,
    look: { uExposure: 1.4, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.1, uHalation: 0.14, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off, rate: 0.5 }));
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-0.4, 1.0, -6), { focal: 30, shake: 0.03, shakeFreq: 0.3, t, seed: 13303 });
      return dcam(ctx, camera) || { dof: { focus: 4.0, focal: 30, fstop: 2.8 } };
    },
  };
}

// ---------------- N13D: the statue at dusk, garlands and candles ----------------
export async function N13D(ctx) {
  const DUSK = { ...MORNING, az: 250, el: 3, sunCol: [1.0, 0.5, 0.25], sunI: 1.3, hemiI: 0.5, density: 0.0016, sky: { ...MORNING.sky, uDawn: [0.7, 0.32, 0.12], uDawnPow: 3, uZenith: [0.06, 0.08, 0.16] } };
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0.03, carve: [[10, 34, 84, 110]], day: { ...DUSK, center: STATUE, extent: 80 } });
  const { scene, camera } = W;
  statue(scene, STATUE, Math.PI); memorialGarden(scene);
  const rnd = mulberry32(134);
  const mari = [lit([0.95, 0.5, 0.05], 1, 0, 'mari0'), lit([0.9, 0.7, 0.05], 1, 0, 'mari1')];
  const bead = new THREE.SphereGeometry(0.045, 8, 6);
  for (let k = 0; k < 3; k++) for (let i = 0; i <= 30; i++) { const u = i / 30 * 2 - 1, x = u * (0.85 - k * 0.12); const b = new THREE.Mesh(bead, mari[(i + k) % 2]); b.position.set(STATUE.x - x, 2.04 - (0.32 + k * 0.08) * (1 - u * u), STATUE.z - 1.05 - k * 0.02); scene.add(b); }
  const fl = new THREE.MeshBasicMaterial({ color: new THREE.Color(40, 16, 4), fog: false }), wax = lit([0.85, 0.82, 0.72], 0.6, 0, 'wax2');
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI - Math.PI, r = 1.4 + rnd() * 1.6; const x = STATUE.x + Math.cos(a) * r * 1.2, z = STATUE.z + Math.sin(a) * r;
    const cd = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14 + rnd() * 0.1, 8), wax); cd.position.set(x, 0.38, z); scene.add(cd);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), fl); f.scale.y = 1.8; f.position.set(x, 0.52, z); scene.add(f);
  }
  for (let i = 0; i < 4; i++) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.55, 0.22), 5, 9, 2); pl.position.set(STATUE.x - 2 + i * 1.3, 0.8, STATUE.z - 2.4); scene.add(pl); }
  const C = V3(STATUE.x, 2.6, STATUE.z);
  return {
    scene, camera,
    look: { uExposure: 1.25, uLookPow: 1.22, uLookSat: 0.9, uBloom: 0.14, uHalation: 0.18, uVignette: 0.66, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, V3(C.x + lerp(1.5, 0.6, k), lerp(0.9, 1.5, k), C.z - lerp(5.6, 7.8, k)), V3(C.x, lerp(0.9, 3.4, k), C.z), { focal: 32, shake: 0.03, shakeFreq: 0.3, t, seed: 13404 });
      return dcam(ctx, camera) || {};
    },
  };
}
