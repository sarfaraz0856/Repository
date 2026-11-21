// BHOPAL, chapter 2 – WHAT WENT WRONG (the evening of 2 December 1984, inside the plant).
// C2A the control room: the tank 610 pressure gauge climbs; C2B the refrigeration unit, idle since June;
// C2C the flare tower with a pipe section removed for repair, the scrubber on standby;
// C2D the water curtain falls short of the vent stack while the gas pours out above it.
import * as THREE from 'three';
import { ATM, makeSky } from './lib/atmos.js';
import { fovFromFocalH, fbm1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, STACK_TOP, TANKS, ROAD_Z, MOON } from './lib/bhopal.js';
import { gasFX, gasPlume } from './bhopal1.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian } from './lib/street.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const glowM = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), fog: false });

// ---------------- control room ----------------
function panelTexture() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 768; const g = c.getContext('2d');
  g.fillStyle = '#7d8a80'; g.fillRect(0, 0, 2048, 768);
  const rnd = mulberry32(7);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 16; i++) {
    const x = 70 + i * 122, y = 90 + row * 220;
    g.fillStyle = '#3a3f3b'; g.fillRect(x - 52, y - 52, 104, 140);
    g.fillStyle = '#e8e4d8'; g.beginPath(); g.arc(x, y, 44, 0, 7); g.fill();
    g.strokeStyle = '#222'; g.lineWidth = 2; for (let k = 0; k <= 10; k++) { const a = Math.PI * (0.75 + 1.5 * k / 10); g.beginPath(); g.moveTo(x + Math.cos(a) * 36, y + Math.sin(a) * 36); g.lineTo(x + Math.cos(a) * 43, y + Math.sin(a) * 43); g.stroke(); }
    const a = Math.PI * (0.75 + 1.5 * rnd() * 0.7); g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 34, y + Math.sin(a) * 34); g.stroke();
    g.fillStyle = '#ddd'; g.font = '15px sans-serif'; g.textAlign = 'center'; g.fillText(['PI', 'TI', 'FI', 'LI'][(i + row) % 4] + '-' + (600 + row * 20 + i), x, y + 72);
  }
  // a band of chart recorders
  for (let i = 0; i < 6; i++) { const x = 140 + i * 320; g.fillStyle = '#222'; g.fillRect(x, 690, 200, 60); g.fillStyle = '#efe8d6'; g.fillRect(x + 8, 696, 184, 48); g.strokeStyle = '#a22'; g.beginPath(); for (let k = 0; k < 184; k += 4) g.lineTo(x + 8 + k, 720 + Math.sin(k * 0.07 + i) * 12 * rnd()); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function gaugeTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = '#2b302d'; g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = '#ece7da'; g.beginPath(); g.arc(512, 512, 440, 0, 7); g.fill();
  g.strokeStyle = '#1b1b1b'; g.lineWidth = 6; g.beginPath(); g.arc(512, 512, 440, 0, 7); g.stroke();
  // 0..55 psig over 270 degrees, red zone above 40
  g.strokeStyle = '#b3201a'; g.lineWidth = 34; g.beginPath(); g.arc(512, 512, 370, Math.PI * (0.75 + 1.5 * 40 / 55), Math.PI * 2.25); g.stroke();
  g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let p = 0; p <= 55; p += 1) {
    const a = Math.PI * (0.75 + 1.5 * p / 55), big = p % 5 === 0;
    g.lineWidth = big ? 7 : 3; g.strokeStyle = '#111'; g.beginPath(); g.moveTo(512 + Math.cos(a) * (big ? 330 : 355), 512 + Math.sin(a) * (big ? 330 : 355)); g.lineTo(512 + Math.cos(a) * 395, 512 + Math.sin(a) * 395); g.stroke();
    if (big) { g.font = 'bold 54px sans-serif'; g.fillText(String(p), 512 + Math.cos(a) * 270, 512 + Math.sin(a) * 270); }
  }
  g.font = 'bold 50px sans-serif'; g.fillText('TANK 610', 512, 600); g.font = '40px sans-serif'; g.fillText('PRESSURE  psig', 512, 658);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export async function C2A(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.05, 200);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uLampGain.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const wall = lit([0.36, 0.42, 0.36], 0.9, 0, 'crwall'), floor = lit([0.2, 0.21, 0.2], 0.6, 0, 'crfloor'), ceil = lit([0.45, 0.45, 0.43], 0.95, 0, 'crceil');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  add(new THREE.PlaneGeometry(14, 10), floor, 0, 0, 0, -Math.PI / 2);
  add(new THREE.PlaneGeometry(14, 10), ceil, 0, 3.3, 0, Math.PI / 2);
  add(new THREE.PlaneGeometry(14, 3.3), wall, 0, 1.65, -3.2);
  add(new THREE.PlaneGeometry(10, 3.3), wall, -7, 1.65, 0, 0, Math.PI / 2);
  add(new THREE.PlaneGeometry(10, 3.3), wall, 7, 1.65, 0, 0, -Math.PI / 2);
  add(new THREE.PlaneGeometry(14, 3.3), wall, 0, 1.65, 5, 0, Math.PI);
  // the board along the back wall, the sloped desk in front of it
  const pm = lit([1, 1, 1], 0.55, 0.1, 'crpanel'); pm.map = panelTexture();
  add(new THREE.BoxGeometry(9.2, 2.1, 0.3), lit([0.3, 0.34, 0.31], 0.6, 0.2, 'crbox'), 0, 1.6, -3.0);
  add(new THREE.PlaneGeometry(9.0, 1.9 * 768 / 2048 * 9 / 1.9 * 0.42), pm, 0, 1.75, -2.84);
  const desk = add(new THREE.BoxGeometry(9.0, 0.85, 0.9), lit([0.32, 0.36, 0.33], 0.6, 0.2, 'crdesk'), 0, 0.42, -2.3);
  const slope = add(new THREE.BoxGeometry(9.0, 0.06, 0.6), lit([0.25, 0.28, 0.26], 0.5, 0.2, 'crslope'), 0, 0.95, -2.45, 0.5);
  // indicator lamps and switches on the sloped desk
  const rnd = mulberry32(3);
  for (let i = 0; i < 70; i++) { const on = rnd() < 0.35; const l = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), on ? glowM(...(rnd() < 0.5 ? [3, 0.4, 0.2] : [0.4, 2.5, 0.6])) : lit([0.1, 0.1, 0.1], 0.5, 0, 'crlampoff')); l.position.set(-4.3 + i * 0.125, 0.99 - 0.0, -2.42); l.rotation.x = 0.5 + Math.PI / 2; scene.add(l); }
  // the hero gauge, larger, on the desk upright
  const gm = new THREE.MeshStandardMaterial({ map: gaugeTexture(), roughness: 0.35 });
  const gauge = add(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 40), lit([0.18, 0.2, 0.19], 0.4, 0.5, 'crgbez'), 1.35, 1.32, -2.62, Math.PI / 2);
  const face = add(new THREE.CircleGeometry(0.19, 48), gm, 1.35, 1.32, -2.585);
  const needle = new THREE.Group(); needle.position.set(1.35, 1.32, -2.575); scene.add(needle);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.16, 0.004), lit([0.05, 0.05, 0.05], 0.4, 0, 'crneedle')); nd.position.y = 0.07; needle.add(nd);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 12), lit([0.6, 0.1, 0.08], 0.4, 0.3, 'crhub')); hub.rotation.x = Math.PI / 2; needle.add(hub);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.19, 48), new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.12, roughness: 0.05, transmission: 0, color: 0xffffff })); glass.position.set(1.35, 1.32, -2.565); scene.add(glass);
  // a phone, a logbook, a tea glass, a chair
  add(new THREE.BoxGeometry(0.22, 0.09, 0.2), lit([0.05, 0.05, 0.05], 0.4, 0, 'crphone'), -0.8, 0.9, -1.95);
  add(new THREE.BoxGeometry(0.32, 0.025, 0.24), lit([0.55, 0.52, 0.45], 0.9, 0, 'crbook'), 0.2, 0.86, -1.95, 0, 0.2);
  add(new THREE.CylinderGeometry(0.03, 0.025, 0.09, 12), lit([0.5, 0.35, 0.2], 0.2, 0, 'crtea'), 0.55, 0.9, -1.92);
  add(new THREE.BoxGeometry(0.5, 0.06, 0.5), lit([0.1, 0.09, 0.08], 0.6, 0, 'crchair'), -0.2, 0.5, -1.2);
  add(new THREE.BoxGeometry(0.5, 0.55, 0.05), lit([0.1, 0.09, 0.08], 0.6, 0, 'crchair2'), -0.2, 0.8, -0.95);
  // window to the plant: sodium glow outside
  add(new THREE.PlaneGeometry(2.6, 1.2), glowM(0.5, 0.28, 0.1), -5.5, 1.9, -3.18);
  // fluorescent tubes
  for (const [x, z] of [[-3.5, -1.5], [0, -1.5], [3.5, -1.5], [-3.5, 2], [0, 2], [3.5, 2]]) {
    add(new THREE.BoxGeometry(1.25, 0.04, 0.08), glowM(4, 4.4, 4.2), x, 3.26, z);
    const pl = new THREE.PointLight(new THREE.Color(0.9, 1.0, 0.95), 5.5, 9, 2); pl.position.set(x, 3.0, z); scene.add(pl);
  }
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.5, 0.55, 0.52), new THREE.Color(0.12, 0.12, 0.1), 0.25));
  // the shift operator at the board
  const rig = await loadRig();
  const op = makeCivilian(rig, { seed: 21, kind: 'man', india: true, bag: 'none' }); op.root.position.set(0.9, 0, -1.55); op.root.rotation.y = 0.15; scene.add(op.root);
  const op2 = makeCivilian(rig, { seed: 34, kind: 'man', india: true, bag: 'none' }); op2.root.position.set(-2.6, 0, -1.4); op2.root.rotation.y = -0.4; scene.add(op2.root);
  const pressure = t => { const p = 2 + 8 * smoothstep(2.5, 8, t) + 45 * smoothstep(8.5, 13.5, t) ** 1.4; return Math.min(p, 55) + 0.25 * fbm1(t * 6, 3, 2); };
  const A = V3(0.4, 1.62, 1.9), B = V3(1.3, 1.37, -1.86);
  return {
    scene, camera,
    look: { uExposure: 1.25, uLookPow: 1.22, uLookSat: 0.85, uBloom: 0.08, uHalation: 0.1, uVignette: 0.6, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(clamp((t - 1) / 12, 0, 1));
      const pos = A.clone().lerp(B, k); const tgt = V3(lerp(0.4, 1.35, k), lerp(1.3, 1.32, k), -2.6);
      placeCamera(camera, ctx, pos, tgt, { focal: lerp(28, 45, k), shake: 0.05, shakeFreq: 0.3, t, seed: 2101 });
      needle.rotation.z = -(Math.PI * (0.75 + 1.5 * pressure(t) / 55) - Math.PI * 1.5);
      pose(op, 'Idle', t, { offset: 0.2 }); pose(op2, 'Idle', t, { offset: 1.1 });
      return dcam(ctx, camera) || { dof: { focus: pos.distanceTo(V3(1.35, 1.32, -2.6)), focal: lerp(28, 45, k), fstop: 2.8 } };
    },
  };
}

// ---------------- the refrigeration unit, idle ----------------
function fridgeUnit(scene) {
  const g = new THREE.Group(); g.position.set(TANKS.x + 26, 0, TANKS.z + 4); scene.add(g);
  const blue = lit([0.14, 0.24, 0.36], 0.6, 0.3, 'frblue'), steel = lit([0.3, 0.31, 0.32], 0.5, 0.6, 'frsteel'), conc = lit([0.4, 0.39, 0.36], 0.95, 0, 'frconc');
  const rust = lit([0.3, 0.16, 0.08], 0.8, 0.3, 'frrust');
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(9, 0.4, 5), conc, 0, 0.2, 0);
  add(new THREE.BoxGeometry(3.2, 1.6, 1.6), blue, -2.2, 1.2, 0);                       // compressor
  add(new THREE.CylinderGeometry(0.55, 0.55, 1.6, 20), blue, 0.3, 1.0, 0, 0, 0, Math.PI / 2); // motor
  add(new THREE.CylinderGeometry(0.5, 0.5, 4.0, 20), steel, 0.6, 2.4, 1.4, 0, 0, Math.PI / 2); // condenser / chiller shells
  add(new THREE.CylinderGeometry(0.42, 0.42, 3.4, 20), steel, 0.6, 2.4, -1.4, 0, 0, Math.PI / 2);
  for (const z of [-1.4, 1.4]) for (const x of [-1, 2.2]) add(new THREE.BoxGeometry(0.2, 2, 0.2), steel, x, 1.2, z);
  // the brine lines to the tanks, cut: two blind flanges with a gap, a spool piece lying on the ground
  add(new THREE.CylinderGeometry(0.12, 0.12, 3, 10), rust, -5.5, 1.3, 0.6, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 16), steel, -4.0, 1.3, 0.6, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 10), rust, -2.6 + 0.0, 1.3, 0.6 + 0.0, 0, 0, Math.PI / 2).position.x = -8.0;
  add(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 16), steel, -7.25, 1.3, 0.6, 0, 0, Math.PI / 2);
  add(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 10), rust, -5.2, 0.14, 2.4, 0, 0.5, Math.PI / 2);
  // empty refrigerant cylinders taken away: only their cradle remains
  add(new THREE.BoxGeometry(2.2, 0.15, 0.8), steel, 3.6, 0.5, -1.8);
  return g;
}
export async function C2B(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0013, oldCity: false, mosque: false, litFrac: 0.05, lampGain: 6, moon: 0.22 });
  const { scene, camera } = W;
  const fu = fridgeUnit(scene);
  const pl = new THREE.PointLight(new THREE.Color(1.0, 0.58, 0.24), 120, 30, 2); pl.position.copy(fu.position).add(V3(3, 7, 6)); scene.add(pl);
  const O = fu.position;
  const A = O.clone().add(V3(13, 3.4, 13)), B = O.clone().add(V3(9, 2.6, 9.5));
  return {
    scene, camera,
    look: { uExposure: 2.1, uLookPow: 1.28, uLookSat: 0.92, uBloom: 0.1, uHalation: 0.14, uVignette: 0.7, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), O.clone().add(V3(-1.5, 1.4, 0)), { focal: 30, shake: 0.06, shakeFreq: 0.3, t, seed: 2202 });
      return dcam(ctx, camera) || { dof: { focus: A.clone().lerp(B, k).distanceTo(O), focal: 32, fstop: 2.8 } };
    },
  };
}

// ---------------- the flare tower, out for repair ----------------
export async function C2C(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0012, oldCity: false, mosque: false, litFrac: 0.05, lampGain: 6, moon: 0.22 });
  const { scene, camera } = W;
  // the spool between the scrubber and the flare is out: two blind ends and the corroded section on the ground
  const steel = lit([0.3, 0.31, 0.32], 0.5, 0.6, 'flsteel'), rust = lit([0.32, 0.17, 0.08], 0.85, 0.3, 'flrust');
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  // stubs of the line from the scrubber and at the flare, each ending in a blind flange; the gap between is empty
  const a = V3(STACK_TOP.x + 0.9, 17, STACK_TOP.z), b = V3(14, 17, -96), d = b.clone().sub(a).normalize();
  for (const [p0, sgn] of [[a, 1], [b, -1]]) {
    const p1 = p0.clone().addScaledVector(d, sgn * 4.0);
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 4.0, 12), rust); stub.position.copy(p0).lerp(p1, 0.5); stub.quaternion.setFromUnitVectors(V3(0, 1, 0), d); stub.castShadow = true; scene.add(stub);
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 20), steel); fl.position.copy(p1); fl.quaternion.setFromUnitVectors(V3(0, 1, 0), d); scene.add(fl);
  }
  add(new THREE.CylinderGeometry(0.22, 0.22, 4.4, 12), rust, 5.5, 0.3, -82, 0, 0.9, Math.PI / 2);
  // scaffold and a ladder left at the base
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.06, 6, 0.06), steel, 12 + (i % 2) * 2, 3, -94 + Math.floor(i / 2) * 2);
  for (const y of [2, 4, 6]) add(new THREE.BoxGeometry(2.2, 0.05, 2.2), lit([0.3, 0.22, 0.12], 0.9, 0, 'flplank'), 13, y, -93);
  // hide the continuous pipe from the base set between scrubber and flare
  scene.traverse(o => { if (o.isMesh && o.geometry?.parameters?.radiusTop === 0.22 && Math.abs(o.position.y - 17) < 0.5) o.visible = false; });
  const pl = new THREE.PointLight(new THREE.Color(1.0, 0.58, 0.24), 400, 60, 2); pl.position.set(2, 10, -70); scene.add(pl);
  const A = V3(38, 6, -46), B = V3(31, 7.5, -53);
  return {
    scene, camera,
    look: { uExposure: 2.0, uLookPow: 1.28, uLookSat: 0.92, uBloom: 0.1, uHalation: 0.14, uVignette: 0.7, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      // tilt up from the spool on the ground, along the tower to its top
      const tgt = V3(1.5, lerp(11, 15, k), -84);
      placeCamera(camera, ctx, A.clone().lerp(B, k), tgt, { focal: 30, shake: 0.06, shakeFreq: 0.3, t, seed: 2303 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- the water curtain falls short ----------------
function waterSpray(n, nozzles) {
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: new THREE.Color(1.6, 1.3, 1.0), size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false;
  const rnd = mulberry32(5), seeds = Array.from({ length: n }, () => [rnd(), rnd(), rnd(), rnd()]);
  pts.update = t => {
    for (let i = 0; i < n; i++) {
      const s = seeds[i], nz = nozzles[i % nozzles.length]; const life = 2.3; const age = ((t + s[0] * life) % life);
      const v = nz.v * (0.9 + 0.2 * s[1]); const dir = nz.dir.clone().add(V3((s[2] - 0.5) * 0.12, 0, (s[3] - 0.5) * 0.12)).normalize();
      pos[i * 3] = nz.p.x + dir.x * v * age; pos[i * 3 + 1] = nz.p.y + dir.y * v * age - 4.9 * age * age; pos[i * 3 + 2] = nz.p.z + dir.z * v * age;
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = -10;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}
export async function C2D(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0013, oldCity: false, mosque: false, litFrac: 0.05, lampGain: 6, moon: 0.22 });
  const { scene, camera } = W;
  const gas = gasFX(ctx, scene, { boxMin: [-90, 0, -130], boxMax: [90, 120, 120], steps: 84 });
  const toStack = (x, z) => V3(STACK_TOP.x - x, 0, STACK_TOP.z - z).normalize();
  const noz = [[6, -50], [-28, -48], [-2, -46]].map(([x, z]) => { const d = toStack(x, z); return { p: V3(x, 1.2, z), dir: V3(d.x * 0.62, 0.78, d.z * 0.62).normalize(), v: 17 }; });
  const spray = waterSpray(9000, noz); scene.add(spray);
  const rig = await loadRig(); const crew = [];
  noz.forEach((nz, i) => { const c = makeCivilian(rig, { seed: 60 + i, kind: 'man', india: true, bag: 'none' }); c.root.position.copy(nz.p).setY(0).addScaledVector(nz.dir.clone().setY(0).normalize(), -0.8); c.root.rotation.y = Math.atan2(nz.dir.x, nz.dir.z); scene.add(c.root); crew.push(c); });
  const hoseM = lit([0.4, 0.3, 0.15], 0.8, 0, 'hose');
  noz.forEach(nz => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 8), hoseM); h.rotation.z = Math.PI / 2; h.rotation.y = 0.3; h.position.copy(nz.p).setY(0.06).add(V3(6, 0, 3)); scene.add(h); });
  const A = V3(26, 1.5, -24), B = V3(22, 1.6, -28);
  return {
    scene, camera,
    look: { uExposure: 2.0, uLookPow: 1.28, uLookSat: 0.9, uBloom: 0.12, uHalation: 0.16, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-12, lerp(14, 22, k), -70), { focal: 24, shake: 0.1, shakeFreq: 0.4, t, seed: 2404 });
      spray.update(t);
      crew.forEach((c, i) => pose(c, 'Idle', t, { offset: i * 0.7 }));
      gas.setPlumes([gasPlume(0.85, t)]);
      gas.setGround({ center: [-10, 0, -40], radius: 70, height: 3.5, density: 0.35, noiseScale: 1 / 9, drift: [0.3, 0.15, 2.0] });
      gas.update(t, Math.round(t * 24), camera);
      return dcam(ctx, camera) || {};
    },
  };
}
