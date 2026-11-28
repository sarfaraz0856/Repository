// THE LAST REACTOR (1990s – 15 December 2000): the sarcophagus decaying in the rain, the unit
// control room on the day Unit 1 stopped, the core map going dark as the last reactor was shut
// down, and the plant's windows going out one by one.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCivilian } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { Dust } from './lib/fx.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { PLANT, PLANT_LIT } from './lib/plant.js';
import { placeCamera, plantWorld, MOON_DIR } from './shots_plant.js';
import { debugCam } from './part2.js';
import { sarcophagus, plantSet } from './part3.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const atP = (s, l, y = 0) => P(s, y, l);
const mat = (c, r = 0.8, m = 0, key = 'p8') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });

function daySky(ctx, sun, o) {
  const sk = makeDaySky({ noiseTex: ctx.noiseTex });
  for (const [k, v] of Object.entries(o)) { const u = sk.uniforms[k]; if (u.value?.setRGB && Array.isArray(v)) u.value.setRGB(...v); else u.value = v; }
  sk.uniforms.uSunDir.value.copy(sun);
  return sk;
}
function atmosphere({ sun, fog, density, height, glow, glowPow = 6, halo }) {
  ATM.uMoonDir.value.copy(sun); ATM.uLampMapOn.value = 0; ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(...fog); ATM.uFogDensity.value = density; ATM.uFogHeight.value = height; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(sun.x, 0, sun.z).normalize(); ATM.uGlowCol.value.setRGB(...glow); ATM.uGlowPow.value = glowPow;
  ATM.uMoonHalo.value.setRGB(...(halo || glow)); ATM.uFireFog.value.setRGB(0, 0, 0);
}

// ---------------- W1: the 1990s. The sarcophagus, built in haste, is decaying ----------------
export async function W1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(45, ctx.aspect), ctx.aspect, 2, 16000);
  const SUN = sunDir(200, 25);
  const sk = daySky(ctx, SUN, { uSunCol: [0.9, 0.9, 0.92], uZenith: [0.13, 0.14, 0.16], uHorizon: [0.28, 0.28, 0.29], uDawn: [0.0, 0.0, 0.0], uDawnPow: 4, uCloudBright: [0.5, 0.5, 0.51], uCloudShade: [0.27, 0.27, 0.29], uCloudCover: 0.95, uSunDisk: 0 });
  scene.add(sk);
  plantSet(ctx, scene, { forest: 50000 });
  // the shell, stained with rust; gaps in the roof and between the walls
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  shell.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.2, 0.13, 0.09), 0.35); } });
  const holeM = new THREE.MeshBasicMaterial({ color: 0x020202 });
  const rnd = mulberry32(8);
  for (let k = 0; k < 14; k++) { const h = new THREE.Mesh(new THREE.PlaneGeometry(2 + rnd() * 5, 1 + rnd() * 3), holeM); h.rotation.x = -Math.PI / 2; h.position.copy(P(-28 + rnd() * 60, 63.25, -30 + rnd() * 64)); scene.add(h); }
  for (let k = 0; k < 6; k++) { const h = new THREE.Mesh(new THREE.PlaneGeometry(0.6 + rnd(), 3 + rnd() * 8), holeM); h.position.copy(P(-20 + rnd() * 50, 30 + rnd() * 20, 43.1)); scene.add(h); }
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(0.9, 0.92, 0.96), sunI: 0.6, skyColor: new THREE.Color(0.42, 0.44, 0.48), groundColor: new THREE.Color(0.08, 0.08, 0.08), hemiI: 0.45, center: P(0, 0, 0), extent: 300, near: 200, far: 9000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.08, 0.08, 0.08)); scene.environmentIntensity = 0.8;
  atmosphere({ sun: SUN, fog: [0.27, 0.27, 0.28], density: 0.0006, height: 300, glow: [0, 0, 0] });
  const rain = new Dust(ctx, { n: 16000, center: P(140, 80, 160).toArray(), size: [200, 120, 200], drift: [0.6, -9.0, 0.3], color: [0.12, 0.12, 0.13], gain: 0.8, focus: 230, aperture: 0.003 });
  scene.add(rain.mesh);
  const camA = P(250, 120, 210), camB = P(205, 115, 255);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.12, uLookSat: 0.6, uBloom: 0.04, uHalation: 0.05, uVignette: 0.6, uGrain: 0.055, uShadowTint: [0.95, 1.0, 1.06], uHighTint: [1.0, 1.0, 1.0] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(0, 40, 0), { focal: 45, shake: 0.08, shakeFreq: 0.3, t, seed: 1311 });
      rain.update(camera);
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- the unit control room (BShchU) shared by W2 and W3 ----------------
function cartogramTex(seed, n = 48) {
  // the core map: a circle of channel lamps on the panel, mostly white, some coloured
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); const rnd = mulberry32(seed);
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
  const cells = [];
  const step = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (i + 0.5) * step, y = (j + 0.5) * step, r = Math.hypot(x - S / 2, y - S / 2);
    if (r > S * 0.47) continue;
    const roll = rnd(); const col = roll < 0.06 ? [255, 70, 50] : roll < 0.12 ? [80, 255, 120] : roll < 0.16 ? [255, 210, 80] : [235, 240, 255];
    cells.push({ x, y, r, col });
  }
  return { cells, step, S, canvas: c, g };
}
function drawCartogram(ct, cutR) {
  const { g, S, step, cells } = ct;
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
  for (const c of cells) {
    const on = c.r > cutR ? 1 : 0;
    const k = on ? 1 : 0.06;
    g.fillStyle = `rgb(${c.col[0] * k | 0},${c.col[1] * k | 0},${c.col[2] * k | 0})`;
    g.fillRect(c.x - step * 0.3, c.y - step * 0.3, step * 0.6, step * 0.6);
  }
}
async function controlRoom(ctx) {
  const scene = new THREE.Scene();
  const O = V3(0, -5000, 0);
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const panelM = mat([0.2, 0.25, 0.22], 0.6, 0, 'cpanel'), floorM = mat([0.16, 0.13, 0.11], 0.5, 0, 'cfloor'), wallM = mat([0.38, 0.38, 0.36], 0.8, 0, 'cwall'), ceilM = mat([0.42, 0.42, 0.4], 0.9, 0, 'cceil');
  const box = (w, h, d, x, y, z, m, parent = room) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; parent.add(b); return b; };
  box(24, 0.2, 18, 0, -0.1, 0, floorM); box(24, 0.2, 18, 0, 4.6, 0, ceilM);
  box(0.2, 4.6, 18, -12, 2.3, 0, wallM); box(0.2, 4.6, 18, 12, 2.3, 0, wallM); box(24, 4.6, 0.2, 0, 2.3, 9, wallM);
  // the curved wall of panels at the front: vertical sections on an arc
  const lampGeo = new THREE.PlaneGeometry(0.035, 0.035);
  const lampCols = [new THREE.Color(1.0, 0.95, 0.8), new THREE.Color(1.0, 0.25, 0.15), new THREE.Color(0.3, 1.0, 0.4), new THREE.Color(1.0, 0.7, 0.2)];
  const rnd = mulberry32(3);
  const lamps = new THREE.InstancedMesh(lampGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), 9000); let li = 0;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  const R = 11, N = 20;
  for (let k = 0; k < N; k++) {
    const a = -0.85 + 1.7 * (k + 0.5) / N;
    const x = Math.sin(a) * R, z = -Math.cos(a) * R + 3;
    const sec = new THREE.Group(); sec.position.set(x, 0, z); sec.rotation.y = -a; room.add(sec);
    box(1.0, 3.6, 0.4, 0, 1.8, 0, panelM, sec);
    box(1.0, 0.9, 0.7, 0, 0.45, 0.35, panelM, sec);
    // gauges and switch rows
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const gg = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), mat([0.85, 0.85, 0.8], 0.3, 0, 'gauge')); gg.position.set(-0.3 + c * 0.3, 2.7 + r * 0.22, 0.205); sec.add(gg); }
    for (let r = 0; r < 26 && li < 9000; r++) for (let c = 0; c < 12; c++) {
      if (rnd() < 0.35) continue;
      const p = V3(-0.42 + c * 0.075, 1.0 + r * 0.06, 0.206).applyEuler(sec.rotation).add(sec.position);
      q.setFromEuler(new THREE.Euler(0, -a, 0)); m4.compose(p, q, V3(1, 1, 1)); lamps.setMatrixAt(li, m4);
      const col = lampCols[rnd() < 0.8 ? 0 : 1 + Math.floor(rnd() * 3)].clone().multiplyScalar(rnd() < 0.5 ? 3 + rnd() * 6 : 0.15);
      lamps.setColorAt(li, col); li++;
    }
  }
  lamps.count = li; room.add(lamps);
  // the core map ("cartogram") in the middle of the arc, and its lamps on a canvas texture
  const ct = cartogramTex(11); drawCartogram(ct, -1);
  const ctTex = new THREE.CanvasTexture(ct.canvas); ctTex.colorSpace = THREE.SRGBColorSpace;
  const cartoM = new THREE.MeshBasicMaterial({ map: ctTex, color: new THREE.Color(5, 5, 5) });
  const carto = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), cartoM); carto.position.set(0, 2.3, -7.45); room.add(carto);
  box(2.6, 2.6, 0.1, 0, 2.3, -7.52, mat([0.05, 0.06, 0.055], 0.6, 0, 'cartobg'));
  // the operators' desk in front of the arc, with chairs
  const deskM = mat([0.26, 0.3, 0.27], 0.5, 0, 'cdesk');
  for (const [x, z, a] of [[-3.0, -4.6, 0.25], [0, -5.0, 0], [3.0, -4.6, -0.25]]) {
    const d = new THREE.Group(); d.position.set(x, 0, z); d.rotation.y = a; room.add(d);
    box(2.6, 0.8, 0.9, 0, 0.4, 0, deskM, d); const top = box(2.6, 0.05, 0.6, 0, 0.92, -0.15, deskM, d); top.rotation.x = 0.35;
    for (let k = 0; k < 14; k++) { const key = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 10), mat(k % 5 === 0 ? [0.5, 0.05, 0.03] : [0.08, 0.08, 0.08], 0.5, 0, 'key')); key.position.set(-1.1 + k * 0.17, 0.95, -0.15); key.rotation.x = 0.35; d.add(key); }
  }
  for (const [x, z] of [[-3.0, -3.6], [0.4, -3.9], [3.2, -3.5]]) { const ch = new THREE.Group(); ch.position.set(x, 0, z); room.add(ch); box(0.5, 0.08, 0.5, 0, 0.48, 0, mat([0.12, 0.12, 0.13], 0.6, 0, 'chair'), ch); box(0.5, 0.55, 0.06, 0, 0.8, 0.24, mat([0.12, 0.12, 0.13], 0.6, 0, 'chair'), ch); box(0.06, 0.45, 0.06, 0, 0.23, 0, mat([0.2, 0.2, 0.2], 0.4, 0.6, 'chairleg'), ch); }
  // fluorescent ceiling panels
  const fluoM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 1.0, 0.95).multiplyScalar(4) });
  for (let i = -3; i <= 3; i++) for (let j = -2; j <= 3; j++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.3), fluoM); f.rotation.x = Math.PI / 2; f.position.set(i * 3.0, 4.49, j * 2.6); room.add(f); }
  const lights = [];
  for (const [x, z] of [[-6, -4], [0, -4], [6, -4], [-6, 3], [0, 3], [6, 3]]) { const pl = new THREE.PointLight(new THREE.Color(0.95, 1.0, 0.95), 14, 16, 1.6); pl.position.copy(O).add(V3(x, 4.2, z)); scene.add(pl); lights.push(pl); }
  const key = new THREE.SpotLight(new THREE.Color(0.95, 1.0, 0.95), 60, 30, 0.9, 0.8, 1.5); key.position.copy(O).add(V3(0, 4.3, -1)); key.target.position.copy(O).add(V3(0, 0, -6)); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.5, 0.52, 0.5), new THREE.Color(0.15, 0.13, 0.11), 0.6));
  // operators in white coats and caps
  const rig = await loadRig();
  const ops = [];
  for (const [x, z, yaw, seed] of [[-2.6, -3.3, Math.PI + 0.3, 2001], [0.6, -3.6, Math.PI - 0.1, 2002], [4.2, -2.9, Math.PI - 0.6, 2003]]) {
    const c = makeCivilian(rig, { seed, kind: 'man', bag: 'none' });
    c.root.traverse(o => { if (o.isMesh && o.material.color) { const k = o.material.color; const skin = k.r > 0.2 && k.r > k.g * 1.12 && k.g > k.b * 1.03; if (!skin && k.r + k.g + k.b > 0.08) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.62, 0.63, 0.62), 0.85); } } });
    c.root.position.copy(O).add(V3(x, 0, z)); c.root.rotation.y = yaw; scene.add(c.root, c.ao); c.ao.position.set(c.root.position.x, O.y + 0.045, c.root.position.z);
    ops.push(c);
  }
  ATM.uFogColor.value.setRGB(0, 0, 0); ATM.uFogDensity.value = 0.0; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -6000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  return { scene, O, ops, ct, ctTex, lights, fluoM, lamps };
}

// ---------------- W2: 30 November 1996, Unit 1 is shut down ----------------
export async function W2(ctx) {
  const C = await controlRoom(ctx);
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(24, ctx.aspect), ctx.aspect, 0.05, 200);
  const { O } = C;
  const camA = O.clone().add(V3(-6.5, 1.65, 6.5)), camB = O.clone().add(V3(-4.5, 1.6, 5.2));
  return {
    scene: C.scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.15, uLookSat: 0.75, uBloom: 0.1, uHalation: 0.12, uVignette: 0.6, uGrain: 0.055, uShadowTint: [0.96, 1.02, 1.0], uHighTint: [1.0, 1.02, 0.98] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(0.5, 1.6, -7)), { focal: 24, shake: 0.06, shakeFreq: 0.3, t, seed: 1322 });
      C.ops.forEach((c, i) => pose(c, 'Idle', t, { offset: i * 1.3 }));
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 9, focal: 24, fstop: 2.8 } };
    },
  };
}

// ---------------- W3: 15 December 2000, 13:17. The core map goes dark ----------------
export async function W3(ctx) {
  const C = await controlRoom(ctx);
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(50, ctx.aspect), ctx.aspect, 0.05, 200);
  const { O } = C;
  const camA = O.clone().add(V3(1.4, 1.5, -2.6)), camB = O.clone().add(V3(1.0, 1.5, -3.4));
  let lastCut = -2;
  return {
    scene: C.scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.18, uLookSat: 0.8, uBloom: 0.14, uHalation: 0.16, uVignette: 0.66, uGrain: 0.06, uShadowTint: [0.96, 1.02, 1.0], uHighTint: [1.0, 1.02, 0.98] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(-0.2, 2.1, -7.8)), { focal: 32, shake: 0.05, shakeFreq: 0.3, t, seed: 1333 });
      C.ops.forEach((c, i) => pose(c, 'Idle', t, { offset: i * 1.3 }));
      // the rods go in: the map goes dark from the centre outwards, from about 5 s
      const cut = smoothstep(5.0, 11.0, t) * C.ct.S * 0.5;
      if (Math.abs(cut - lastCut) > 0.5) { drawCartogram(C.ct, cut); C.ctTex.needsUpdate = true; lastCut = cut; }
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 5.6, focal: 32, fstop: 2.8 } };
    },
  };
}

// ---------------- W4: the plant goes quiet: its windows go dark from east to west ----------------
export async function W4(ctx) {
  const W = await plantWorld(ctx, { focal: 40, city: false, fog: 0.0008, floodGain: 0.6, lampGain: 6.0, moon: 0.28, near: 1 });
  const { scene, camera, plant, sky, floods } = W;
  plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0;
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  sky.uniforms.uSkyGlowCol.value.setRGB(0, 0, 0);
  const avM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.05, 0.02).multiplyScalar(60) });
  for (const p of plant.aviation || []) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), avM); m.position.copy(p).add(PLANT); scene.add(m); }
  const snow = new Dust(ctx, { n: 12000, center: P(-480, 40, -480).toArray(), size: [240, 90, 240], drift: [0.4, -1.3, 0.3], color: [0.05, 0.055, 0.065], gain: 1.0, focus: 600, aperture: 0.003 });
  scene.add(snow.mesh);
  const floodI = floods.map(f => f.intensity);
  const camA = P(-640, 26, -620), camB = P(-628, 26.5, -608);
  return {
    scene, camera,
    look: { uExposure: 2.1, uLookPow: 1.3, uLookSat: 0.85, uBloom: 0.1, uHalation: 0.14, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(-200, 30, -70), { focal: 40, shake: 0.03, shakeFreq: 0.3, t, seed: 1344 });
      PLANT_LIT.cut.value = PLANT.x + lerp(400, -700, smoothstep(2.0, 11.0, t));
      ATM.uLampGain.value = 6.0 * (1 - 0.85 * smoothstep(6.0, 12.0, t));
      floods.forEach((f, i) => { f.intensity = floodI[i] * (1 - smoothstep(4 + i, 6 + i, t)); });
      const on = (t % 1.5) < 0.75; avM.color.setRGB(1.0, 0.05, 0.02).multiplyScalar(on ? 60 : 3);
      snow.update(camera);
      return debugCam(ctx, camera, atP) || { fade: smoothstep(13.2, 14.8, t) };
    },
  };
}
