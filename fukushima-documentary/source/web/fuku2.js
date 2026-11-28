// FUKUSHIMA, chapter 2 – THE EARTHQUAKE (14:46, 11 March 2011) and chapter 4 – BLACKOUT.
// A BWR main control room: a long run of light grey-green bench boards with mimic lines and
// lamp tiles, a tall vertical board behind, operators in navy work clothes and white helmets.
// FK2A: the room as the quake hits: everything shakes, lights flicker, ceiling tiles fall, dust.
// FK2B: the plant from the hills shaking, the pylons and lines swaying.
// FK4A: 15:41, station blackout: the room is dark, operators read gauges by torchlight.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeCivilian } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { Dust } from './lib/fx.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { fukuWorld } from './lib/fuku.js';
import { dcam, MARCH_SKY, SUN_1446 } from './fuku1.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (c, r = 0.8, m = 0, key = 'fk2') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });

// mimic diagram for the vertical board: pipes and valves in coloured lines on pale green
function mimicTex(seed) {
  const W = 2048, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const rnd = mulberry32(seed);
  g.fillStyle = '#9fae9f'; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 128) { g.fillStyle = '#8a998b'; g.fillRect(x, 0, 3, H); }
  const cols = ['#c23b2b', '#2f5fa8', '#d9a62a', '#2d8a4a', '#222'];
  for (let k = 0; k < 60; k++) {
    g.strokeStyle = cols[Math.floor(rnd() * cols.length)]; g.lineWidth = 4 + rnd() * 5;
    let x = rnd() * W, y = 60 + rnd() * (H - 120); g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 4; s++) { if (s % 2) y = 60 + rnd() * (H - 120); else x = clamp(x + (rnd() - 0.5) * 500, 10, W - 10); g.lineTo(x, y); }
    g.stroke();
  }
  for (let k = 0; k < 120; k++) { const x = rnd() * W, y = 40 + rnd() * (H - 80); g.fillStyle = '#eee'; g.fillRect(x - 9, y - 9, 18, 18); g.strokeStyle = '#333'; g.lineWidth = 2; g.strokeRect(x - 9, y - 9, 18, 18); }
  for (let k = 0; k < 40; k++) { const x = rnd() * W, y = 15 + rnd() * 20; g.fillStyle = '#f4f4ee'; g.fillRect(x, y, 60, 14); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

async function controlRoomFK(ctx) {
  const scene = new THREE.Scene();
  const O = V3(0, -5000, 0);
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const boardM = mat([0.55, 0.6, 0.55], 0.55, 0, 'fkboard'), floorM = mat([0.32, 0.33, 0.31], 0.45, 0, 'fkfloor'), wallM = mat([0.62, 0.62, 0.58], 0.85, 0, 'fkwall'), ceilM = mat([0.7, 0.7, 0.68], 0.9, 0, 'fkceil');
  const box = (w, h, d, x, y, z, m, parent = room) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; parent.add(b); return b; };
  box(32, 0.2, 22, 0, -0.1, 0, floorM); box(32, 0.2, 22, 0, 4.2, 0, ceilM);
  box(0.2, 4.2, 22, -16, 2.1, 0, wallM); box(0.2, 4.2, 22, 16, 2.1, 0, wallM); box(32, 4.2, 0.2, 0, 2.1, 11, wallM); box(32, 4.2, 0.2, 0, 2.1, -9.9, wallM);
  // tall vertical board along the back wall with the mimic diagram
  const vb = box(28, 3.0, 0.6, 0, 1.5, -9.4, boardM);
  const mim = new THREE.Mesh(new THREE.PlaneGeometry(27.6, 1.5), new THREE.MeshStandardMaterial({ map: mimicTex(7), roughness: 0.6 }));
  mim.position.set(0, 2.15, -9.09); room.add(mim);
  // bench boards: sloped desks in front of it, in three sections with a slight angle
  const lampGeo = new THREE.PlaneGeometry(0.06, 0.04);
  const lampCols = [new THREE.Color(1.0, 0.97, 0.85), new THREE.Color(1.0, 0.2, 0.12), new THREE.Color(0.25, 1.0, 0.35), new THREE.Color(1.0, 0.75, 0.2)];
  const rnd = mulberry32(5);
  const lamps = new THREE.InstancedMesh(lampGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), 12000); let li = 0;
  const lampBase = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  const benches = [];
  for (const [x, z, a, w] of [[-9.5, -6.4, 0.18, 9], [0, -7.0, 0, 9.5], [9.5, -6.4, -0.18, 9]]) {
    const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = a; room.add(b); benches.push(b);
    box(w, 0.95, 1.1, 0, 0.475, 0, boardM, b);
    const top = box(w, 0.06, 0.9, 0, 1.08, -0.1, boardM, b); top.rotation.x = 0.42;
    const back = box(w, 0.9, 0.12, 0, 1.6, -0.55, boardM, b); back.rotation.x = -0.12;
    // switches on the slope
    for (let k = 0; k < Math.floor(w / 0.32); k++) {
      const sw = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), mat(k % 6 === 0 ? [0.6, 0.06, 0.04] : [0.08, 0.08, 0.08], 0.5, 0, 'fksw'));
      sw.position.set(-w / 2 + 0.2 + k * 0.32, 1.13, -0.1 + (k % 2) * 0.18); sw.rotation.x = 0.42; b.add(sw);
    }
    // lamp tiles and gauges on the upright part
    for (let r = 0; r < 9; r++) for (let c = 0; c < Math.floor(w / 0.08); c++) {
      if (rnd() < 0.45 || li >= 12000) continue;
      const p = V3(-w / 2 + 0.1 + c * 0.08, 1.3 + r * 0.06, -0.48).applyEuler(b.rotation).add(b.position);
      q.setFromEuler(new THREE.Euler(-0.12, a, 0)); m4.compose(p, q, V3(1, 1, 1)); lamps.setMatrixAt(li, m4);
      const roll = rnd(); const col = lampCols[roll < 0.78 ? 0 : 1 + Math.floor(rnd() * 3)].clone().multiplyScalar(rnd() < 0.55 ? 2.5 + rnd() * 4 : 0.12);
      lamps.setColorAt(li, col); lampBase.push(col.clone()); li++;
    }
    for (let k = 0; k < Math.floor(w / 0.7); k++) { const gg = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), mat([0.92, 0.92, 0.86], 0.3, 0, 'fkgauge')); gg.position.set(-w / 2 + 0.4 + k * 0.7, 1.92, -0.6); gg.rotation.x = -0.12; b.add(gg); }
  }
  lamps.count = li; room.add(lamps);
  // shift supervisor desk and chairs
  const deskM = mat([0.48, 0.5, 0.48], 0.5, 0, 'fkdesk');
  box(3.2, 0.75, 1.2, 0, 0.375, -1.5, deskM); box(3.2, 0.04, 1.2, 0, 0.77, -1.5, mat([0.3, 0.3, 0.3], 0.4, 0, 'fkdesktop'));
  const paper = []; for (let k = 0; k < 8; k++) { const p = box(0.21, 0.004, 0.3, -1.2 + k * 0.33, 0.795, -1.5 + (k % 2) * 0.2, mat([0.92, 0.92, 0.9], 0.9, 0, 'fkpaper')); p.rotation.y = (k - 4) * 0.2; paper.push(p); }
  const binders = []; for (let k = 0; k < 10; k++) binders.push(box(0.06, 0.3, 0.24, 0.6 + k * 0.07, 0.94, -1.95, mat([[0.1, 0.2, 0.5], [0.5, 0.1, 0.1], [0.15, 0.15, 0.15]][k % 3], 0.7, 0, 'fkbind')));
  for (const [x, z] of [[-1.0, -0.6], [0.9, -0.6], [-8, -5.2], [6, -5.4]]) { const ch = new THREE.Group(); ch.position.set(x, 0, z); room.add(ch); box(0.5, 0.08, 0.5, 0, 0.48, 0, mat([0.15, 0.17, 0.25], 0.6, 0, 'fkchair'), ch); box(0.5, 0.55, 0.06, 0, 0.8, 0.24, mat([0.15, 0.17, 0.25], 0.6, 0, 'fkchair'), ch); box(0.06, 0.45, 0.06, 0, 0.23, 0, mat([0.3, 0.3, 0.3], 0.4, 0.6, 'fkleg'), ch); }
  // ceiling: a grid of tiles (some fall in the quake) and fluorescent panels
  const tileM = mat([0.78, 0.78, 0.76], 0.95, 0, 'fktile');
  const tiles = [];
  for (let i = -7; i <= 7; i++) for (let j = -5; j <= 4; j++) {
    if (rnd() > 0.06) continue;
    const tl = box(1.18, 0.03, 1.18, i * 1.2 + 0.6, 4.07, j * 1.2 + 0.6, tileM);
    tiles.push({ m: tl, t0: 4.5 + rnd() * 6, home: tl.position.clone(), spin: V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(4) });
  }
  const fluoM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 1.0, 0.97).multiplyScalar(4) });
  for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.3), fluoM); f.rotation.x = Math.PI / 2; f.position.set(i * 3.4, 4.0, j * 2.8); room.add(f); }
  const lights = [];
  for (const [x, z] of [[-9, -4], [0, -4], [9, -4], [-9, 4], [0, 4], [9, 4]]) { const pl = new THREE.PointLight(new THREE.Color(0.97, 1.0, 0.97), 14, 18, 1.6); pl.position.set(x, 3.8, z); room.add(pl); lights.push(pl); }
  const key = new THREE.SpotLight(new THREE.Color(0.97, 1.0, 0.97), 70, 34, 1.0, 0.8, 1.5); key.position.set(0, 3.95, -1); key.target.position.set(0, 0, -7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); room.add(key, key.target);
  const hemi = new THREE.HemisphereLight(new THREE.Color(0.52, 0.54, 0.52), new THREE.Color(0.16, 0.15, 0.14), 0.65); scene.add(hemi);
  // emergency lights (used in the blackout): small warm lamps over the doors
  const emer = [];
  for (const [x, z] of [[-15.7, 6], [15.7, 6], [0, 10.7]]) { const e = new THREE.PointLight(new THREE.Color(1.0, 0.75, 0.45), 0, 12, 1.8); e.position.set(x, 3.4, z); room.add(e); emer.push(e); }
  // operators: navy work clothes, white helmets
  const rig = await loadRig();
  const ops = [];
  const helmetM = mat([0.9, 0.9, 0.88], 0.35, 0, 'fkhelm');
  for (const [x, z, yaw, seed] of [[-8.2, -5.0, Math.PI + 0.15, 3001], [-1.2, -5.6, Math.PI, 3002], [2.4, -5.5, Math.PI - 0.05, 3003], [8.0, -4.9, Math.PI - 0.2, 3004], [0.3, -0.3, Math.PI + 0.4, 3005]]) {
    const c = makeCivilian(rig, { seed, kind: 'man', bag: 'none' });
    c.root.traverse(o => { if (o.isMesh && o.material.color) { const k = o.material.color; const skin = k.r > 0.2 && k.r > k.g * 1.12 && k.g > k.b * 1.03; if (!skin && k.r + k.g + k.b > 0.08) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.1, 0.13, 0.24), 0.85); } } });
    const head = c.root.getObjectByName('mixamorigHead');
    if (head) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.135, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), helmetM); const s = 1 / c.root.scale.x; h.scale.setScalar(s); h.position.set(0, 0.13 * s, 0.01 * s); head.add(h); }
    c.root.position.copy(O).add(V3(x, 0, z)); c.root.rotation.y = yaw; scene.add(c.root, c.ao); c.ao.position.set(c.root.position.x, O.y + 0.045, c.root.position.z);
    ops.push(c);
  }
  ATM.uFogColor.value.setRGB(0, 0, 0); ATM.uFogDensity.value = 0.0; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -6000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  const setLamps = (fn) => { const c = new THREE.Color(); for (let i = 0; i < li; i++) { fn(i, lampBase[i], c); lamps.setColorAt(i, c); } lamps.instanceColor.needsUpdate = true; };
  return { scene, room, O, ops, lights, key, hemi, fluoM, lamps, setLamps, tiles, paper, binders, emer };
}

// seismic motion: a P-wave rattle from ~2.5 s, the main S-wave shaking from ~4 s, building to a peak
function quake(t, seed) {
  const amp = smoothstep(2.4, 3.2, t) * 0.25 + smoothstep(3.8, 6.0, t) * 0.75 - smoothstep(15.5, 18.0, t) * 0.4;
  const f = (s, fr) => fbm1(t * fr, seed + s, 3);
  return { amp, x: f(1, 3.1) * amp * 0.06, y: f(2, 4.3) * amp * 0.025, z: f(3, 2.7) * amp * 0.05, rx: f(4, 3.3) * amp * 0.006, rz: f(5, 2.9) * amp * 0.008 };
}

// ---------------- FK2A: the control room at 14:46 ----------------
export async function FK2A(ctx) {
  const C = await controlRoomFK(ctx);
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(24, ctx.aspect), ctx.aspect, 0.05, 200);
  const { O } = C;
  const dust = new Dust(ctx, { n: 2500, center: [O.x, O.y + 2.0, O.z - 3], size: [18, 4, 14], seed: 21, drift: [0.05, -0.12, 0.02], color: [0.9, 0.9, 0.85], gain: 0, focus: 6, aperture: 0.03 });
  C.scene.add(dust.mesh);
  const camA = O.clone().add(V3(-5.5, 1.62, 5.5)), camB = O.clone().add(V3(-4.2, 1.6, 4.4));
  const rnd = mulberry32(77);
  const flick = Array.from({ length: 6 }, () => rnd() * 10);
  return {
    scene: C.scene, camera,
    look: { uExposure: 0.82, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.1, uHalation: 0.12, uVignette: 0.6, uGrain: 0.055, uShadowTint: [0.96, 1.02, 1.0], uHighTint: [1.0, 1.02, 0.98] },
    update(t) {
      const Q = quake(t, 31);
      C.room.position.set(O.x + Q.x, O.y + Q.y, O.z + Q.z); C.room.rotation.set(Q.rx, 0, Q.rz);
      // lights flicker during the strongest shaking
      const fl = (i) => 1 - (Q.amp > 0.6 ? 0.7 * (Math.sin(t * 37 + flick[i] * 9) > 0.55 ? 1 : 0) * smoothstep(0.6, 1, Q.amp) : 0);
      C.lights.forEach((l, i) => { l.intensity = 14 * fl(i); }); C.key.intensity = 70 * fl(0); C.fluoM.color.setRGB(4, 4, 3.9).multiplyScalar(0.25 + 0.75 * fl(1));
      // alarms: red lamps start flashing as the reactors scram
      const blink = Math.sin(t * 9) > 0 ? 1 : 0.15;
      C.setLamps((i, b, c) => { c.copy(b); if (t > 5 && b.r > 1.5 && b.g < 0.6 * b.r) c.multiplyScalar(blink * 1.6); if (t > 5.5 && i % 17 === 0) c.setRGB(4 * blink, 0.6 * blink, 0.3 * blink); });
      // ceiling tiles fall, papers and binders slide
      for (const T of C.tiles) { const s = Math.max(0, t - T.t0); T.m.position.copy(T.home); T.m.rotation.set(0, 0, 0); if (s > 0) { T.m.position.y = Math.max(0.03, T.home.y - 4.9 * s * s); T.m.rotation.set(T.spin.x * Math.min(s, 0.8), 0, T.spin.z * Math.min(s, 0.8)); } }
      C.binders.forEach((b, i) => { b.rotation.z = smoothstep(6 + i * 0.3, 7 + i * 0.3, t) * (i % 2 ? 1.3 : -1.3); });
      C.paper.forEach((p, i) => { p.position.x += Q.x * 0.02 * (i % 3 - 1); });
      dust.uniforms.uGain.value = smoothstep(4.5, 8, t) * 0.5;
      // operators: grabbing the boards (idle pose while shaking is all we have, with a sway)
      C.ops.forEach((c, i) => { pose(c, 'Idle', t, { offset: i * 1.3, rate: 1 }); c.root.rotation.z = Q.rz * 3; });
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 18)), O.clone().add(V3(0.5, 1.5, -8)), { focal: 24, shake: 0.06, shakeFreq: 0.3, t, seed: 2201, jolt: Q.amp * 1.2, joltFreq: 7 });
      return dcam(ctx, camera) || { dof: { focus: 8, focal: 24, fstop: 2.8 } };
    },
  };
}

// ---------------- FK2B: the plant from the hills as the ground shakes ----------------
export async function FK2B(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1446, sky: MARCH_SKY, fog: 0.00018, sunI: 4.2, hemiI: 0.9 });
  const { scene, camera } = W;
  const A = V3(-330, 150, 760), B = V3(-310, 145, 730);
  return { scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.9, uBloom: 0.05, uHalation: 0.05, uVignette: 0.55, uGrain: 0.045 },
    update(t) {
      const Q = quake(t, 41);
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-80, 30, 90), { focal: 42, shake: 0.05, shakeFreq: 0.25, t, seed: 2202, jolt: Q.amp * 1.6, joltFreq: 6 });
      return dcam(ctx, camera) || {};
    } };
}

// ---------------- FK4A: station blackout, operators with torches ----------------
export async function FK4A(ctx) {
  const C = await controlRoomFK(ctx);
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(28, ctx.aspect), ctx.aspect, 0.05, 200);
  const { O } = C;
  C.lights.forEach(l => { l.intensity = 0; }); C.key.intensity = 0; C.fluoM.color.setRGB(0.01, 0.01, 0.01); C.hemi.intensity = 0.12;
  C.emer.forEach(e => { e.intensity = 8; });
  // almost every lamp dead; a handful still lit on battery
  C.setLamps((i, b, c) => { c.copy(b).multiplyScalar(i % 23 === 0 ? 0.6 : 0.0); });
  // torches held by two operators
  const torches = [];
  for (const [i, aim] of [[1, V3(-1.6, 1.2, -6.6)], [2, V3(2.2, 1.4, -6.8)]]) {
    const s = new THREE.SpotLight(new THREE.Color(1.0, 0.95, 0.85), 40, 14, 0.3, 0.55, 1.6); s.castShadow = true; s.shadow.mapSize.set(1024, 1024);
    s.target.position.copy(O).add(aim); C.scene.add(s, s.target); torches.push({ s, op: C.ops[i], aim: aim.clone() });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 6, 5) })); C.scene.add(lens); torches[torches.length - 1].lens = lens;
  }
  const camA = O.clone().add(V3(-3.6, 1.5, 1.2)), camB = O.clone().add(V3(-2.8, 1.5, 0.2));
  return {
    scene: C.scene, camera,
    look: { uExposure: 1.15, uLookPow: 1.2, uLookSat: 0.7, uBloom: 0.18, uHalation: 0.2, uVignette: 0.7, uGrain: 0.08, uShadowTint: [0.9, 0.98, 1.08], uHighTint: [1.05, 1.0, 0.94] },
    update(t) {
      C.ops.forEach((c, i) => pose(c, 'Idle', t, { offset: i * 1.3 }));
      for (const [k, T] of torches.entries()) {
        const hp = T.op.root.position.clone().add(V3(0.25 * (k ? -1 : 1), 1.35, -0.3));
        T.s.position.copy(hp); T.lens.position.copy(hp); T.lens.lookAt(camera.position);
        const sweep = V3(Math.sin(t * 0.35 + k * 2) * 1.6, Math.sin(t * 0.6 + k) * 0.35, 0);
        T.s.target.position.copy(O).add(T.aim).add(sweep);
        T.s.intensity = 40 * (1 + 0.04 * Math.sin(t * 23 + k));
      }
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 18)), O.clone().add(V3(0.2, 1.4, -7.5)), { focal: 28, shake: 0.08, shakeFreq: 0.3, t, seed: 4401 });
      return dcam(ctx, camera) || { dof: { focus: 5, focal: 28, fstop: 2.2 } };
    },
  };
}
