// BHOPAL, chapter 4 – THE STATION (Bhopal Junction, about 1 AM, 3 December 1984).
// E4A the station in the gas; E4B the packed express waiting at the platform; E4C the deputy station
// superintendent's office (Ghulam Dastagir); E4D the train pulls out into the night.
import * as THREE from 'three';
import { ATM } from './lib/atmos.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit } from './lib/bhopal.js';
import { gasFX } from './bhopal1.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian, clipSpeed } from './lib/street.js';

export const ST = V3(1400, 0, 1000);           // station origin: tracks run along x
const glowM = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false });
function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(ST.x + x, y, ST.z + z); camera.up.set(0, 1, 0); camera.lookAt(ST.x + tx, ty, ST.z + tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const S = (x, y, z) => V3(ST.x + x, y, ST.z + z);

function boardTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 384; const g = c.getContext('2d');
  g.fillStyle = '#e8c21e'; g.fillRect(0, 0, 1024, 384); g.strokeStyle = '#111'; g.lineWidth = 14; g.strokeRect(10, 10, 1004, 364);
  g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 120px FreeSans, sans-serif'; g.fillText('भोपाल', 512, 120);
  g.font = 'bold 110px FreeSans, sans-serif'; g.fillText('BHOPAL', 512, 270);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// an ICF-type coach, 22 m, maroon; windows: some lit, most dark
function coach(rnd, { lit: litFrac = 0.4, loco = false } = {}) {
  const g = new THREE.Group();
  const body = lit(loco ? [0.42, 0.1, 0.05] : [0.3, 0.07, 0.05], 0.55, 0.15, loco ? 'trloco' : 'trbody');
  const roof = lit([0.22, 0.22, 0.23], 0.6, 0.3, 'trroof'), under = lit([0.05, 0.05, 0.05], 0.8, 0.3, 'trunder'), cream = lit([0.55, 0.5, 0.38], 0.6, 0.1, 'trcream');
  const L = loco ? 17 : 22;
  const b = new THREE.Mesh(new THREE.BoxGeometry(L, 2.9, 3.2), body); b.position.y = 2.55; b.castShadow = true; b.receiveShadow = true; g.add(b);
  const r = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, L, 18, 1, false, -0.9, 1.8), roof); r.rotation.z = Math.PI / 2; r.rotation.x = 0; r.position.y = 3.25; r.scale.set(1, 1, 0.92); g.add(r);
  const u = new THREE.Mesh(new THREE.BoxGeometry(L - 1, 0.7, 2.6), under); u.position.y = 0.95; g.add(u);
  for (const x of [-L / 2 + 3, L / 2 - 3]) { const bg = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.7, 2.4), under); bg.position.set(x, 0.55, 0); g.add(bg); }
  if (loco) { const band = new THREE.Mesh(new THREE.BoxGeometry(L + 0.02, 0.5, 3.22), cream); band.position.y = 2.2; g.add(band); const hl = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), glowM(30, 26, 18)); hl.position.set(L / 2 + 0.02, 3.3, 0); hl.rotation.y = Math.PI / 2; g.add(hl); g.userData.head = hl; }
  else {
    const dark = lit([0.03, 0.03, 0.035], 0.3, 0.1, 'trwin'); const warm = glowM(1.4, 1.0, 0.55);
    for (const side of [-1, 1]) for (let i = 0; i < 9; i++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), rnd() < litFrac ? warm : dark); w.position.set(-L / 2 + 2.2 + i * 2.2, 2.85, side * 1.61); w.rotation.y = side > 0 ? 0 : Math.PI; g.add(w); }
    for (const side of [-1, 1]) for (const x of [-L / 2 + 0.6, L / 2 - 0.6]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.9), dark); d.position.set(x, 2.25, side * 1.611); d.rotation.y = side > 0 ? 0 : Math.PI; g.add(d); }
  }
  return g;
}
export function makeTrain(n, rnd) {
  const g = new THREE.Group(); let x = 0;
  const loco = coach(rnd, { loco: true }); loco.position.x = x - 8.5; g.add(loco); x -= 17.6;
  for (let i = 0; i < n; i++) { const c = coach(rnd, { lit: 0.45 }); c.position.x = x - 11; g.add(c); x -= 22.4; }
  const tail = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), glowM(20, 1, 0.6)); tail.position.set(x - 0.02, 1.4, 0.9); tail.rotation.y = -Math.PI / 2; g.add(tail);
  g.userData.length = -x; g.userData.head = loco.userData.head;
  return g;
}
// station: building on the south side, platform 1 with a canopy, two tracks, a second island platform
export function stationSet(scene) {
  const g = new THREE.Group(); g.position.copy(ST); scene.add(g); const rnd = mulberry32(19);
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  const stone = lit([0.5, 0.42, 0.32], 0.9, 0, 'stbuild'), red = lit([0.4, 0.17, 0.12], 0.9, 0, 'stred'), plat = lit([0.32, 0.31, 0.29], 0.95, 0, 'stplat');
  const iron = lit([0.12, 0.13, 0.12], 0.6, 0.5, 'stiron'), sheet = lit([0.25, 0.25, 0.26], 0.5, 0.4, 'stsheet'), dark = lit([0.03, 0.025, 0.02], 0.9, 0, 'stdark');
  const ball = lit([0.18, 0.15, 0.12], 1, 0, 'stballast'), rail = lit([0.35, 0.35, 0.36], 0.3, 0.8, 'strail'), slp = lit([0.16, 0.14, 0.12], 0.9, 0, 'stsleeper');
  // platform 1 (z 6..14), building beyond it (z 14..30)
  add(new THREE.BoxGeometry(420, 0.9, 8), plat, 0, 0.45, 10);
  add(new THREE.BoxGeometry(110, 9, 16), stone, 0, 4.5, 22);
  add(new THREE.BoxGeometry(112, 0.6, 17), red, 0, 9.2, 22);
  for (let i = -6; i <= 6; i++) { add(new THREE.PlaneGeometry(3.2, 3.4), dark, i * 8.2, 2.6, 13.98, Math.PI); add(new THREE.CircleGeometry(1.6, 16, 0, Math.PI), dark, i * 8.2, 4.3, 13.98, Math.PI); add(new THREE.PlaneGeometry(1.4, 1.8), rnd() < 0.3 ? glowM(1.2, 0.9, 0.5) : dark, i * 8.2, 7.0, 13.98, Math.PI); }
  add(new THREE.BoxGeometry(14, 14, 16), stone, -30, 7, 22); add(new THREE.BoxGeometry(14, 14, 16), stone, 30, 7, 22);
  // canopy over platform 1
  for (let x = -150; x <= 150; x += 9) add(new THREE.CylinderGeometry(0.12, 0.14, 4.6, 8), iron, x, 3.2, 8);
  const can = add(new THREE.BoxGeometry(310, 0.18, 9), sheet, 0, 5.5, 10); can.rotation.x = -0.05;
  // tracks: line 1 at z = 2.5, line 2 at z = -4, island platform 2 at z -10
  for (const z of [2.5, -4]) {
    add(new THREE.BoxGeometry(900, 0.4, 3.6), ball, 0, 0.2, z);
    for (const o of [-0.84, 0.84]) add(new THREE.BoxGeometry(900, 0.17, 0.08), rail, 0, 0.62, z + o);
    const sl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 0.16, 2.7), slp, 1400); const m4 = new THREE.Matrix4();
    for (let i = 0; i < 1400; i++) { m4.makeTranslation(-450 + i * 0.64, 0.45, z); sl.setMatrixAt(i, m4); } sl.receiveShadow = true; g.add(sl);
  }
  add(new THREE.BoxGeometry(300, 0.9, 7), plat, 0, 0.45, -10);
  for (let x = -120; x <= 120; x += 12) add(new THREE.CylinderGeometry(0.1, 0.12, 4.4, 8), iron, x, 3.1, -10);
  add(new THREE.BoxGeometry(250, 0.15, 6), sheet, 0, 5.3, -10);
  // benches, trunks, a tea stall, the station board
  const wood = lit([0.25, 0.16, 0.09], 0.8, 0, 'stwood');
  for (let x = -60; x <= 60; x += 15) { add(new THREE.BoxGeometry(2.2, 0.08, 0.5), wood, x, 1.38, 11.5); add(new THREE.BoxGeometry(2.2, 0.5, 0.06), wood, x, 1.65, 11.75); }
  for (let i = 0; i < 12; i++) add(new THREE.BoxGeometry(0.8, 0.45, 0.5), lit([[0.1, 0.12, 0.25], [0.3, 0.08, 0.06], [0.1, 0.1, 0.1]][i % 3], 0.6, 0.2, 'sttrunk' + (i % 3)), -40 + rnd() * 80, 1.13, 7.4 + rnd() * 3);
  add(new THREE.BoxGeometry(3, 2.2, 2), lit([0.3, 0.2, 0.12], 0.8, 0, 'ststall'), 25, 2.0, 12);
  const bm = new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: 0.6 });
  add(new THREE.BoxGeometry(4.2, 1.6, 0.12), iron, -12, 4.0, 7.2); const bd = add(new THREE.PlaneGeometry(4.0, 1.5), bm, -12, 4.0, 7.13, Math.PI); bd.castShadow = false; const bd2 = add(new THREE.PlaneGeometry(4.0, 1.5), bm, -12, 4.0, 7.27); bd2.castShadow = false;
  for (const x of [-13.6, -10.4]) add(new THREE.BoxGeometry(0.1, 3.5, 0.1), iron, x, 2.6, 7.2);
  // lights: tube lights under the canopy, a few bulbs
  const tubes = [];
  for (let x = -130; x <= 130; x += 18) { add(new THREE.BoxGeometry(1.2, 0.05, 0.08), glowM(4, 4.4, 4.2), x, 5.3, 10); const pl = new THREE.PointLight(new THREE.Color(0.85, 0.95, 0.9), 45, 18, 2); pl.position.set(x, 5.0, 10); g.add(pl); tubes.push(pl); }
  for (let x = -100; x <= 100; x += 24) { add(new THREE.BoxGeometry(1.2, 0.05, 0.08), glowM(4, 4.4, 4.2), x, 5.1, -10); const pl = new THREE.PointLight(new THREE.Color(0.85, 0.95, 0.9), 30, 16, 2); pl.position.set(x, 4.8, -10); g.add(pl); }
  return g;
}
function crowdOn(scene, rig, n, seed, area) {
  const rnd = mulberry32(seed); const cs = [];
  for (let i = 0; i < n; i++) {
    const c = makeCivilian(rig, { seed: seed * 10 + i, india: true, kind: rnd() < 0.15 ? 'child' : rnd() < 0.45 ? 'woman' : 'man', bag: rnd() < 0.4 ? 'sack' : 'none' });
    c.root.position.copy(S(area[0] + rnd() * (area[1] - area[0]), area[4], area[2] + rnd() * (area[3] - area[2]))); c.root.rotation.y = rnd() * 6.28; scene.add(c.root); c.off = rnd() * 3; cs.push(c);
  }
  return cs;
}

// ---------------- E4A: the station in the gas ----------------
export async function E4A(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0016, basti: false, mosque: false, litFrac: 0.05, lampGain: 4.0, moon: 0.22, carve: [[ST.x - 500, ST.x + 500, ST.z - 40, ST.z + 60]] });
  const { scene, camera } = W;
  stationSet(scene);
  const gas = gasFX(ctx, scene, { boxMin: [ST.x - 200, 0, ST.z - 60], boxMax: [ST.x + 200, 30, ST.z + 70], steps: 72 });
  gas.setLights([{ pos: S(0, 5, 10).toArray(), range: 80, color: [0.9, 1.0, 0.95] }]);
  const rig = await loadRig(); const cs = crowdOn(scene, rig, 26, 7, [-50, 50, 7, 13, 0.9]);
  const A = S(60, 3.2, -22), B = S(48, 2.8, -20);
  return {
    scene, camera,
    look: { uExposure: 2.1, uLookPow: 1.26, uLookSat: 0.9, uBloom: 0.11, uHalation: 0.14, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), S(-10, 4, 10), { focal: 30, shake: 0.06, shakeFreq: 0.3, t, seed: 4101 });
      cs.forEach((c, i) => pose(c, i % 4 ? 'Idle' : 'Walk', t, { offset: c.off }));
      gas.setGround({ center: S(40, 0, 0).toArray(), radius: 150, height: 2.4, density: lerp(0.08, 0.3, t / 15), noiseScale: 1 / 6, drift: [1.2, 0.1, 0.3] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- E4B: the express waiting at the platform ----------------
export async function E4B(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0018, basti: false, mosque: false, litFrac: 0.05, lampGain: 4.0, moon: 0.22, carve: [[ST.x - 500, ST.x + 500, ST.z - 40, ST.z + 60]] });
  const { scene, camera } = W;
  stationSet(scene);
  const rnd = mulberry32(8); const train = makeTrain(12, rnd); train.position.copy(S(120, 0.62, 2.5)); scene.add(train);
  const gas = gasFX(ctx, scene, { boxMin: [ST.x - 160, 0, ST.z - 30], boxMax: [ST.x + 160, 20, ST.z + 30], steps: 64 });
  const rig = await loadRig(); const cs = crowdOn(scene, rig, 34, 9, [-40, 30, 6.8, 13, 0.9]);
  const A = S(-34, 2.4, 9.5), B = S(-26, 2.3, 9.8);
  return {
    scene, camera,
    look: { uExposure: 2.0, uLookPow: 1.25, uLookSat: 0.9, uBloom: 0.11, uHalation: 0.14, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), S(30, 2.2, 6), { focal: 28, shake: 0.08, shakeFreq: 0.35, t, seed: 4202 });
      cs.forEach((c, i) => pose(c, 'Idle', t, { offset: c.off }));
      gas.setGround({ center: S(0, 0, 5).toArray(), radius: 140, height: 3.2, density: 0.32, noiseScale: 1 / 4, drift: [1.0, 0.05, 0.2] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { dof: { focus: 20, focal: 28, fstop: 2.8 } };
    },
  };
}

// ---------------- E4C: the deputy station superintendent's office ----------------
export async function E4C(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 300);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const wall = lit([0.48, 0.44, 0.34], 0.95, 0, 'ofwall'), floor = lit([0.22, 0.18, 0.14], 0.8, 0, 'offloor'), wood = lit([0.25, 0.15, 0.08], 0.6, 0, 'ofwood');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.PlaneGeometry(8, 7), floor, 0, 0, 0, -Math.PI / 2); add(new THREE.PlaneGeometry(8, 7), wall, 0, 3.6, 0, Math.PI / 2);
  add(new THREE.PlaneGeometry(8, 3.6), wall, 0, 1.8, -3.0); add(new THREE.PlaneGeometry(7, 3.6), wall, -4, 1.8, 0, 0, Math.PI / 2); add(new THREE.PlaneGeometry(7, 3.6), wall, 4, 1.8, 0, 0, -Math.PI / 2);
  // window onto the platform: misty sodium/white glow, bars
  add(new THREE.PlaneGeometry(2.4, 1.6), glowM(0.55, 0.5, 0.38), 2.0, 2.0, -2.99);
  for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(0.03, 1.6, 0.03), lit([0.05, 0.05, 0.05], 0.5, 0.5, 'ofbar'), 1.0 + i * 0.4, 2.0, -2.97);
  // desk with a black telephone, a ledger, a lantern, a block instrument (the token machine), a wall clock, a ceiling fan
  add(new THREE.BoxGeometry(2.0, 0.08, 1.0), wood, -0.4, 0.8, -1.6); for (const [x, z] of [[-1.3, -1.2], [0.5, -1.2], [-1.3, -2.0], [0.5, -2.0]]) add(new THREE.BoxGeometry(0.08, 0.8, 0.08), wood, x, 0.4, z);
  const phone = add(new THREE.BoxGeometry(0.24, 0.1, 0.2), lit([0.03, 0.03, 0.03], 0.3, 0.1, 'ofphone'), -0.9, 0.89, -1.55);
  add(new THREE.BoxGeometry(0.45, 0.05, 0.32), lit([0.55, 0.5, 0.42], 0.9, 0, 'ofledger'), -0.2, 0.86, -1.5, 0, 0.1);
  add(new THREE.BoxGeometry(0.4, 0.5, 0.3), lit([0.3, 0.12, 0.08], 0.5, 0.3, 'ofblock'), 0.3, 1.09, -1.8);
  const clock = add(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24), lit([0.6, 0.58, 0.5], 0.5, 0.1, 'ofclock'), -2.0, 2.8, -2.97, Math.PI / 2);
  const fan = new THREE.Group(); fan.position.set(0, 3.3, 0); scene.add(fan); for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.01, 0.12), lit([0.4, 0.4, 0.38], 0.5, 0.3, 'offan')); b.position.x = 0.35; const h = new THREE.Group(); h.rotation.y = k * 2.094; h.add(b); fan.add(h); }
  add(new THREE.BoxGeometry(1.2, 2.0, 0.5), wood, -3.4, 1.0, -2.6);
  add(new THREE.BoxGeometry(1.6, 1.0, 0.03), lit([0.6, 0.55, 0.45], 0.9, 0, 'ofchart'), -1.6, 2.0, -2.98);
  add(new THREE.BoxGeometry(0.6, 0.8, 0.02), lit([0.62, 0.58, 0.5], 0.9, 0, 'ofcal'), 3.95, 2.0, -1.0, 0, -Math.PI / 2);
  const bulb = add(new THREE.SphereGeometry(0.06, 10, 8), glowM(12, 8, 3.5), -0.4, 2.6, -1.0);
  const pl = new THREE.PointLight(new THREE.Color(1.0, 0.72, 0.38), 14, 9, 2); pl.position.set(-0.4, 2.55, -1.0); pl.castShadow = true; scene.add(pl);
  const win = new THREE.PointLight(new THREE.Color(0.8, 0.85, 0.75), 6, 8, 2); win.position.set(2.0, 2.0, -2.5); scene.add(win);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.3, 0.28, 0.22), new THREE.Color(0.08, 0.06, 0.04), 0.2));
  const rig = await loadRig();
  const man = makeCivilian(rig, { seed: 77, kind: 'man', india: true, bag: 'none' }); man.root.position.set(-0.7, 0, -0.85); man.root.rotation.y = 3.75; scene.add(man.root);
  const A = V3(2.2, 1.6, 2.4), B = V3(1.4, 1.55, 1.5);
  return {
    scene, camera,
    look: { uExposure: 1.4, uLookPow: 1.22, uLookSat: 0.88, uBloom: 0.1, uHalation: 0.12, uVignette: 0.66, uGrain: 0.06 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-0.5, 1.35, -1.3), { focal: 32, shake: 0.05, shakeFreq: 0.3, t, seed: 4303 });
      fan.rotation.y = t * 1.5; pose(man, 'Idle', t, { offset: 0.5 });
      return dcam(ctx, camera) || { dof: { focus: A.clone().lerp(B, k).distanceTo(V3(-0.6, 1.4, -0.9)), focal: 32, fstop: 2.2 } };
    },
  };
}

// ---------------- E4D: the train pulls out ----------------
export async function E4D(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0018, basti: false, mosque: false, litFrac: 0.05, lampGain: 4.0, moon: 0.22, carve: [[ST.x - 500, ST.x + 500, ST.z - 40, ST.z + 60]] });
  const { scene, camera } = W;
  stationSet(scene);
  const rnd = mulberry32(8); const train = makeTrain(12, rnd); scene.add(train);
  const gas = gasFX(ctx, scene, { boxMin: [ST.x - 300, 0, ST.z - 30], boxMax: [ST.x + 300, 20, ST.z + 30], steps: 64 });
  const rig = await loadRig(); const cs = crowdOn(scene, rig, 14, 11, [-60, -20, 8, 13, 0.9]);
  const A = S(-60, 2.0, 7.6), B = S(-62, 2.0, 7.4);
  return {
    scene, camera,
    look: { uExposure: 2.0, uLookPow: 1.25, uLookSat: 0.9, uBloom: 0.12, uHalation: 0.15, uVignette: 0.7, uGrain: 0.055 },
    update(t) {
      // the train accelerates away to the east (+x), the last coaches pass the camera
      const x = 120 + 0.6 * Math.max(0, t) ** 2 + 2 * t;
      train.position.copy(S(x, 0.62, 2.5));
      placeCamera(camera, ctx, A.clone().lerp(B, t / 15), S(lerp(20, 180, smoothstep(0, 15, t)), 2.0, 2.0), { focal: 30, shake: 0.06, shakeFreq: 0.3, t, seed: 4404 });
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      gas.setGround({ center: S(0, 0, 5).toArray(), radius: 260, height: 2.0, density: 0.55, noiseScale: 1 / 5, drift: [1.0, 0.05, 0.2] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || { fade: smoothstep(13.6, 15, t) * 0 };
    },
  };
}
