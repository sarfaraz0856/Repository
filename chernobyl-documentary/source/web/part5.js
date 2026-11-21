// THE RECKONING (autumn 1986 – July 1987): the Red Forest is bulldozed into trenches, a Pripyat
// classroom left as it was, Unit 1 restarted beside the sarcophagus, the trial in Chernobyl town,
// and Pripyat under snow with every window dark.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { patchMaterial, ATM, makeSky } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCar, makeBus, makeCivilian, makeLiquidator, clipSpeed, buildTrees3D, LEAF_AMB, forestFloor } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { VolumeFX } from './lib/volume.js';
import { Dust } from './lib/fx.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest, buildCity } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { placeCamera, plantWorld, MOON_DIR } from './shots_plant.js';
import { debugCam, placeWalker } from './part2.js';
import { sarcophagus } from './part3.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const atP = (s, l, y = 0) => P(s, y, l);
const mat = (c, r = 0.8, m = 0, key = 'p5') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });
const FEX = [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1100], [PLANT.x + 400, PLANT.z + 420, 120]];

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
function msaaLeaves(ctx, g) { if (ctx.msaa > 0) g.traverse(o => { if (o.isMesh && o.material.map && o.material.alphaTest) o.material.alphaToCoverage = true; }); return g; }

// ---------------- T1: autumn 1986, the Red Forest is bulldozed and buried ----------------
// A crawler bulldozer of the DT-75 / T-130 kind: tracks, engine hood, cab and a push blade.
function bulldozer() {
  const g = new THREE.Group();
  const yel = mat([0.42, 0.25, 0.04], 0.6, 0.2, 'dozer'), dark = mat([0.03, 0.03, 0.03], 0.8, 0.3, 'dozerdk'), steel = mat([0.2, 0.19, 0.18], 0.45, 0.7, 'dozerst');
  const glass = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.025, 0.03), roughness: 0.08 }), { key: 'dozerglass' });
  const B = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  for (const s of [-1, 1]) {                    // tracks with rounded ends, road wheels
    B(4.4, 0.75, 0.55, 0, 0.42, s * 1.15, dark);
    for (const x of [-2.2, 2.2]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.55, 16), dark); c.rotation.x = Math.PI / 2; c.position.set(x, 0.42, s * 1.15); c.castShadow = true; g.add(c); }
    for (let k = 0; k < 5; k++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 12), steel); w.rotation.x = Math.PI / 2; w.position.set(-1.6 + k * 0.8, 0.3, s * 1.15); g.add(w); }
  }
  B(4.2, 0.35, 1.7, 0, 0.9, 0, yel);            // frame
  B(2.4, 1.05, 1.5, 0.95, 1.6, 0, yel);         // engine hood
  B(0.12, 0.9, 1.3, 2.17, 1.55, 0, dark);       // radiator grille
  const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.1, 8), dark); ex.position.set(1.4, 2.6, -0.45); g.add(ex);
  B(1.5, 1.5, 1.6, -0.95, 2.05, 0, yel);        // cab
  B(1.55, 0.9, 1.4, -0.95, 2.25, 0, glass).scale.set(1, 1, 1.06);
  B(1.7, 0.08, 1.75, -0.95, 2.84, 0, yel);
  B(1.4, 0.5, 2.2, -2.1, 1.25, 0, yel);         // rear ripper housing
  // push blade on two arms, slightly curved (three facets)
  const blade = new THREE.Group(); blade.position.set(3.05, 0, 0); g.add(blade);
  for (const [y, a] of [[0.35, 0.25], [0.95, 0.0], [1.5, -0.3]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 3.4), yel); f.position.set(-a * 0.25, y, 0); f.rotation.z = a; f.castShadow = true; blade.add(f); }
  for (const s of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.2), yel); arm.position.set(-1.25, 0.55, s * 1.42); arm.rotation.z = 0.1; arm.castShadow = true; blade.add(arm); }
  return g;
}
export async function T1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(40, ctx.aspect), ctx.aspect, 0.3, 16000);
  const C = V3(-4200, 0, 6200);
  const SUN = sunDir(118, 9);
  const sk = daySky(ctx, SUN, { uSunCol: [2.3, 1.55, 0.95], uZenith: [0.06, 0.09, 0.17], uHorizon: [0.34, 0.3, 0.27], uDawn: [0.45, 0.24, 0.1], uDawnPow: 4, uCloudBright: [0.82, 0.7, 0.58], uCloudShade: [0.32, 0.31, 0.33], uCloudCover: 0.35, uSunDisk: 60 });
  scene.add(sk);
  // needle litter on the ground, rust-brown; the far forest fades from dead red to living green
  scene.add(forestFloor(ctx, { center: [C.x, C.z], radius: 1500, color: [0.07, 0.04, 0.022], y: 0.02 }));
  const rust = (x, z, r) => {
    const d = Math.hypot(x - C.x, z - C.z), k = smoothstep(500, 1100, d + (r - 0.5) * 300);
    const red = new THREE.Color(0.2 + r * 0.08, 0.085 + r * 0.03, 0.035), green = new THREE.Color(0.1, 0.13, 0.085);
    return red.lerp(green, k).multiplyScalar(0.7 + 0.4 * r);
  };
  scene.add(buildForest(ctx, { center: [C.x, C.z], radius: 1500, count: 42000, exclude: [[C.x, C.z, 150]], seed: 17, tint: rust }));
  // the stand around the clearing, in 3D
  const rnd = mulberry32(83);
  const trees = [];
  for (let k = 0; k < 420; k++) {
    const a = rnd() * Math.PI * 2, r = 34 + Math.pow(rnd(), 0.7) * 130;
    const x = C.x + Math.cos(a) * r, z = C.z + Math.sin(a) * r;
    if (x < C.x - 30 && Math.abs(z - (C.z + 22)) < 9) continue;      // keep the camera's line of sight open
    trees.push([x, z, 15 + rnd() * 7, 'redpine']);
  }
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.62, seed: 5 })));
  // fallen trunks across the clearing, a heap in front of the blade, the trench and its spoil
  const logM = mat([0.2, 0.12, 0.07], 0.95, 0, 'logs');
  const logs = [];
  const logGeo = new THREE.CylinderGeometry(0.2, 0.26, 1, 7); logGeo.rotateZ(Math.PI / 2);
  for (let k = 0; k < 46; k++) {
    const L = 9 + rnd() * 9, x = C.x - 20 + rnd() * 40, z = C.z - 22 + rnd() * 38;
    logs.push({ p: V3(x, 0.24, z), L, yaw: rnd() * Math.PI, s: 0.8 + rnd() * 0.5 });
  }
  const heap = [];
  for (let k = 0; k < 18; k++) heap.push({ dx: 4.0 + rnd() * 2.2, dy: 0.25 + Math.floor(k / 6) * 0.42 + rnd() * 0.1, dz: (rnd() - 0.5) * 3.2, L: 7 + rnd() * 7, yaw: (rnd() - 0.5) * 0.7 + Math.PI / 2 * (rnd() < 0.3 ? 1 : 0), s: 0.8 + rnd() * 0.4 });
  const logIM = new THREE.InstancedMesh(logGeo, logM, logs.length + heap.length); logIM.castShadow = true; logIM.receiveShadow = true; scene.add(logIM);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  logs.forEach((l, i) => { q.setFromEuler(new THREE.Euler(0, l.yaw, 0)); m4.compose(l.p, q, V3(l.L, l.s, l.s)); logIM.setMatrixAt(i, m4); });
  const trench = new THREE.Mesh(new THREE.PlaneGeometry(9, 70), mat([0.012, 0.008, 0.006], 1.0, 0, 'trench')); trench.rotation.x = -Math.PI / 2; trench.position.set(C.x + 26, 0.04, C.z); scene.add(trench);
  const sandM = mat([0.2, 0.16, 0.1], 1.0, 0, 'spoil');
  for (let k = 0; k < 7; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 10), sandM); m.scale.set(4.5, 2.2 + rnd(), 7); m.position.set(C.x + 34, -0.4, C.z - 30 + k * 10); m.castShadow = true; m.receiveShadow = true; scene.add(m); }
  const dozer = bulldozer(); dozer.rotation.y = -0.08; scene.add(dozer);
  // two liquidators by the trench, one with a dosimeter on a pole (an idle figure)
  const rig = await loadRig();
  const men = [makeLiquidator(rig, { seed: 31, shovel: true, helmet: 'cap' }), makeLiquidator(rig, { seed: 32, shovel: false, helmet: 'hat' })];
  men[0].root.position.set(C.x + 20, 0, C.z - 6); men[0].root.rotation.y = -1.9;
  men[1].root.position.set(C.x + 19, 0, C.z - 3.5); men[1].root.rotation.y = -1.3;
  for (const m of men) scene.add(m.root);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.72, 0.45), sunI: 2.6, skyColor: new THREE.Color(0.3, 0.36, 0.46), groundColor: new THREE.Color(0.07, 0.045, 0.03), hemiI: 0.08, center: C, extent: 120, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.07, 0.045, 0.03));
  LEAF_AMB.sky.value.setRGB(0.3, 0.3, 0.32); LEAF_AMB.ground.value.setRGB(0.08, 0.05, 0.03);
  atmosphere({ sun: SUN, fog: [0.36, 0.3, 0.25], density: 0.0032, height: 38, glow: [0.9, 0.55, 0.28], glowPow: 7, halo: [1.0, 0.6, 0.3] });
  // mist and dust drifting through the low sun
  const dust = new Dust(ctx, { n: 5000, center: C.clone().add(V3(-12, 4, 10)).toArray(), size: [50, 9, 40], drift: [0.25, 0.02, 0.1], color: [0.08, 0.06, 0.045], gain: 0.9, focus: 32, aperture: 0.01 });
  scene.add(dust.mesh);
  const camA = C.clone().add(V3(-46, 1.6, 23)), camB = C.clone().add(V3(-40, 1.7, 21.5));
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.18, uLookSat: 0.95, uBloom: 0.07, uHalation: 0.1, uVignette: 0.6, uGrain: 0.05, uShadowTint: [0.92, 1.0, 1.1], uHighTint: [1.07, 1.0, 0.88] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 12)), C.clone().add(V3(4, 2.4, 0)), { focal: 40, shake: 0.05, shakeFreq: 0.3, t, seed: 1011 });
      // the dozer pushes slowly east toward the trench, rocking on the logs
      const x = C.x - 9 + 0.55 * t;
      dozer.position.set(x, 0.02 + Math.abs(Math.sin(t * 2.3)) * 0.03, C.z + 1 - 0.04 * t); dozer.rotation.z = Math.sin(t * 1.7) * 0.012;
      heap.forEach((h, i) => { q.setFromEuler(new THREE.Euler(Math.sin(t * 0.8 + i) * 0.02, h.yaw, 0)); m4.compose(V3(x + h.dx * Math.cos(-0.08), h.dy, C.z + 1 - 0.04 * t + h.dz), q, V3(h.L, h.s, h.s)); logIM.setMatrixAt(logs.length + i, m4); });
      logIM.instanceMatrix.needsUpdate = true;
      pose(men[0], 'Idle', t, { offset: 0.3 }); pose(men[1], 'Idle', t, { offset: 1.4 });
      dust.update(camera);
      return debugCam(ctx, camera, (s, l, y = 0) => C.clone().add(V3(s, y, l))) || { dof: { focus: 44, focal: 40, fstop: 4 } };
    },
  };
}

// ---------------- T2: a Pripyat classroom, left as it was ----------------
function skyCard() {
  // what the windows look onto: a pale autumn sky over the tops of birches, overexposed
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const rnd = mulberry32(12);
  const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#dfe6ee'); grd.addColorStop(1, '#f6f2e8'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 140; k++) { const x = rnd() * W, y = H * (0.55 + rnd() * 0.5), r = 10 + rnd() * 26; g.fillStyle = `rgba(${150 + rnd() * 50 | 0},${130 + rnd() * 40 | 0},${70 + rnd() * 30 | 0},0.35)`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function schoolDesk(m) {
  // the Soviet "parta": a slanted double desk with its bench fixed to the same frame
  const g = new THREE.Group();
  const B = (w, h, d, x, y, z, mm, rx = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mm); b.position.set(x, y, z); b.rotation.x = rx; b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  B(1.2, 0.035, 0.5, 0, 0.76, -0.02, m.top, 0.14);
  B(1.2, 0.035, 0.1, 0, 0.79, -0.31, m.top);
  B(1.2, 0.28, 0.03, 0, 0.6, 0.22, m.frame);
  B(1.16, 0.03, 0.42, 0, 0.6, 0.0, m.frame);
  for (const s of [-1, 1]) { B(0.05, 0.05, 1.05, s * 0.57, 0.04, 0.15, m.frame); B(0.05, 0.76, 0.05, s * 0.57, 0.4, -0.15, m.frame); B(0.05, 0.42, 0.05, s * 0.57, 0.22, 0.58, m.frame); }
  B(1.2, 0.035, 0.3, 0, 0.43, 0.58, m.top);
  B(1.2, 0.3, 0.03, 0, 0.66, 0.74, m.top, -0.15);
  return g;
}
export async function T2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(26, ctx.aspect), ctx.aspect, 0.05, 200);
  const O = V3(0, -2000, 0);
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const X0 = -4.5, X1 = 4.5, Z0 = -6.5, Z1 = 6.5, H = 3.5;
  // walls: oil-painted green dado below, whitewash above, both peeling
  const wallM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
  patchMaterial(wallM, {
    key: 'classwall', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec3 p = vWPos - uO; float n = texture(tNoise, p * 0.35 + 0.1).r, n2 = texture(tNoise, p * 1.7 + 0.3).g, n3 = texture(tNoise, p * 0.08).b;
        vec3 dado = vec3(0.16, 0.25, 0.21), wash = vec3(0.52, 0.51, 0.47), plaster = vec3(0.3, 0.27, 0.23);
        vec3 c = mix(dado, wash, step(1.55, p.y)); c = mix(c, c * 0.6, smoothstep(1.53, 1.56, p.y) * (1.0 - smoothstep(1.56, 1.6, p.y)));
        float peel = smoothstep(0.62, 0.66, n * 0.7 + n2 * 0.3 + (n3 - 0.5) * 0.3);
        c = mix(c, plaster, peel); c *= 0.85 + 0.25 * n2;
        c *= mix(1.0, 0.7, smoothstep(2.8, 3.5, p.y) * n3);      // damp stains under the ceiling
        diffuseColor.rgb = c; }`]],
  });
  const floorM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
  patchMaterial(floorM, {
    key: 'classfloor', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz - uO.xz; float board = floor(p.x / 0.12); float h = fract(sin(board * 12.9898) * 43758.5);
        float n = texture(tNoise, vec3(p.x * 0.3, p.y * 0.02 + h, 0.4)).r, n2 = texture(tNoise, vec3(p * 0.5, 0.8)).g;
        vec3 c = vec3(0.2, 0.12, 0.07) * (0.75 + 0.4 * h) * (0.8 + 0.4 * n);
        c *= 1.0 - 0.5 * smoothstep(0.004, 0.0, abs(fract(p.x / 0.12) - 0.5) - 0.48);
        c = mix(c, vec3(0.16, 0.15, 0.13), smoothstep(0.55, 0.8, n2) * 0.6);   // dust and grit
        diffuseColor.rgb = c; }`]],
  });
  const ceilM = mat([0.5, 0.49, 0.46], 0.95, 0, 'classceil');
  const box = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; room.add(b); return b; };
  box(X1 - X0 + 0.6, 0.2, Z1 - Z0 + 0.6, 0, -0.1, 0, floorM);
  box(X1 - X0 + 0.6, 0.2, Z1 - Z0 + 0.6, 0, H + 0.1, 0, ceilM);
  box(0.3, H, Z1 - Z0, X1 + 0.15, H / 2, 0, wallM);
  box(X1 - X0, H, 0.3, 0, H / 2, Z0 - 0.15, wallM);
  box(X1 - X0, H, 0.3, 0, H / 2, Z1 + 0.15, wallM);
  // window wall (west): three tall windows
  const WINZ = [-3.6, 0, 3.6], WW = 2.0, SILL = 0.9, TOP = 3.05;
  box(0.4, SILL, Z1 - Z0, X0 - 0.2, SILL / 2, 0, wallM);
  box(0.4, H - TOP, Z1 - Z0, X0 - 0.2, (H + TOP) / 2, 0, wallM);
  const edges = [Z0, ...WINZ.flatMap(z => [z - WW / 2, z + WW / 2]), Z1];
  for (let k = 0; k < edges.length; k += 2) box(0.4, TOP - SILL, edges[k + 1] - edges[k], X0 - 0.2, (TOP + SILL) / 2, (edges[k] + edges[k + 1]) / 2, wallM);
  const frameM = mat([0.45, 0.44, 0.4], 0.8, 0, 'winframe');
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.08, depthWrite: false });
  for (const z of WINZ) {
    for (const [w, h, d, y, dz] of [[0.08, 0.08, WW, SILL + 0.04, 0], [0.08, 0.08, WW, TOP - 0.04, 0], [0.08, TOP - SILL, 0.08, (TOP + SILL) / 2, -WW / 2 + 0.04], [0.08, TOP - SILL, 0.08, (TOP + SILL) / 2, WW / 2 - 0.04], [0.07, TOP - SILL, 0.06, (TOP + SILL) / 2, 0], [0.07, 0.06, WW, 2.35, 0]]) box(w, h, d, X0 - 0.12, y, z + dz, frameM);
    const sill = box(0.35, 0.05, WW + 0.1, X0 + 0.05, SILL, z, frameM);
    // some panes still glazed, most broken out
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(WW / 2 - 0.08, 0.6), glassM); pane.position.set(X0 - 0.12, 2.68, z - WW / 4); pane.rotation.y = Math.PI / 2; room.add(pane);
  }
  const card = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshBasicMaterial({ map: skyCard(), color: new THREE.Color(3.2, 3.2, 3.2), fog: false }));
  card.position.set(X0 - 12, 3, 0); card.rotation.y = Math.PI / 2; room.add(card);
  // chalkboard, the teacher's desk, empty portrait frames, hanging globe lamps
  const board = box(4.0, 1.3, 0.05, 0.2, 1.75, Z0 + 0.03, mat([0.025, 0.045, 0.035], 0.85, 0, 'chalkb'));
  for (const [w, h, x, y] of [[4.16, 0.08, 0.2, 2.44], [4.16, 0.08, 0.2, 1.06], [0.08, 1.46, -1.88, 1.75], [0.08, 1.46, 2.28, 1.75]]) box(w, h, 0.07, x, y, Z0 + 0.05, mat([0.18, 0.12, 0.07], 0.7, 0, 'bframe'));
  box(4.0, 0.05, 0.12, 0.2, 1.08, Z0 + 0.1, mat([0.18, 0.12, 0.07], 0.7, 0, 'bframe'));
  for (const x of [-1.6, 0.2, 2.0]) { const f = box(0.55, 0.7, 0.03, x, 2.95, Z0 + 0.02, mat([0.12, 0.09, 0.06], 0.6, 0, 'pframe')); const inner = box(0.43, 0.58, 0.02, x, 2.95, Z0 + 0.04, wallM); }
  const deskM = { top: mat([0.11, 0.17, 0.12], 0.6, 0, 'desktop'), frame: mat([0.06, 0.06, 0.055], 0.7, 0.3, 'deskframe') };
  const tdesk = new THREE.Group(); tdesk.position.set(2.6, 0, Z0 + 1.6); room.add(tdesk);
  for (const [w, h, d, x, y, z] of [[1.4, 0.04, 0.7, 0, 0.76, 0], [0.04, 0.74, 0.66, -0.68, 0.37, 0], [0.45, 0.74, 0.66, 0.46, 0.37, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat([0.2, 0.13, 0.08], 0.6, 0, 'tdesk')); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; tdesk.add(b); }
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), mat([0.12, 0.2, 0.3], 0.5, 0, 'globe')); globe.position.set(-0.3, 1.04, 0); tdesk.add(globe);
  const gst = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.06, 0.26, 8), mat([0.1, 0.08, 0.05], 0.5, 0.4, 'gst')); gst.position.set(-0.3, 0.9, 0); tdesk.add(gst);
  for (const [x, z] of [[-2, -3.2], [2, -3.2], [-2, 1.8], [2, 1.8]]) {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 4), mat([0.03, 0.03, 0.03])); cord.position.set(x, H - 0.3, z); room.add(cord);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), mat([0.55, 0.55, 0.52], 0.3, 0, 'lampglobe')); lamp.position.set(x, H - 0.75, z); lamp.castShadow = true; room.add(lamp);
  }
  // twelve double desks in three rows; books, open exercise books, papers on the floor
  const rnd = mulberry32(19);
  const bookM = [[0.35, 0.06, 0.04], [0.06, 0.15, 0.3], [0.32, 0.25, 0.06], [0.1, 0.22, 0.1]].map((c, i) => mat(c, 0.8, 0, 'book' + i));
  const paperM = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.62, 0.6, 0.55), roughness: 0.9, side: THREE.DoubleSide }), { key: 'paper' });
  for (let c = 0; c < 3; c++) for (let r = 0; r < 5; r++) {
    const d = schoolDesk(deskM); const x = -2.6 + c * 2.35 + (rnd() - 0.5) * 0.08, z = -3.7 + r * 1.65 + (rnd() - 0.5) * 0.08;
    d.position.set(x, 0, z); d.rotation.y = (rnd() - 0.5) * 0.06; room.add(d);
    if (r === 4 && c === 0) { d.rotation.z = 1.35; d.position.y = 0.45; d.position.x -= 0.4; }   // one desk tipped over
    for (let k = 0; k < 3; k++) if (rnd() < 0.55) {
      const bx = x + (rnd() - 0.5) * 0.9, bz = z - 0.05 + (rnd() - 0.5) * 0.2;
      if (rnd() < 0.5) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.02 + rnd() * 0.02, 0.24), bookM[Math.floor(rnd() * 4)]); b.position.set(bx, 0.81, bz); b.rotation.set(0.14, (rnd() - 0.5) * 0.6, 0); b.castShadow = true; room.add(b); }
      else { const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.22), paperM); pp.rotation.set(-Math.PI / 2 + 0.14, 0, (rnd() - 0.5) * 0.5); pp.position.set(bx, 0.8, bz); room.add(pp); }
    }
  }
  for (let k = 0; k < 40; k++) { const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.29), paperM); pp.rotation.set(-Math.PI / 2, 0, rnd() * 6.28); pp.position.set(-4 + rnd() * 8, 0.005 + k * 0.0004, -5.5 + rnd() * 11); pp.receiveShadow = true; room.add(pp); }
  // light: the low autumn sun through the windows, a soft bounce from the room itself
  const SUN = V3(1.0, -0.42, -0.32).normalize();
  const sun = new THREE.DirectionalLight(new THREE.Color(1.0, 0.82, 0.62), 5.5);
  sun.position.copy(O).addScaledVector(SUN, -30); sun.target.position.copy(O);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  const sc = sun.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 5; sc.far = 60; sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.55, 0.55, 0.52), new THREE.Color(0.22, 0.16, 0.11), 0.55));
  for (const [x, z, I] of [[-3.0, -3.0, 2.5], [-3.0, 2.5, 2.5], [1.5, 0, 1.5]]) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.9, 0.78), I, 12, 1.5); pl.position.copy(O).add(V3(x, 1.4, z)); scene.add(pl); }
  ATM.uFogColor.value.setRGB(0.0, 0.0, 0.0); ATM.uFogDensity.value = 0.0; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -3000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  // shafts of light: a thin haze in the room, lit by three cones through the windows
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: O.clone().add(V3(X0, 0, Z0)).toArray(), boxMax: O.clone().add(V3(X1, H, Z1)).toArray(), steps: 56, shadowSteps: 2, albedo: 0.85 });
  scene.add(vol.mesh);
  const vl = WINZ.map(z => { const c = O.clone().add(V3(X0, (SILL + TOP) / 2, z)); return { pos: c.clone().addScaledVector(SUN, -14).toArray(), range: 30, color: [2.2, 1.8, 1.35], cone: Math.cos(Math.atan(1.0 / 14)), dir: SUN.toArray() }; });
  const dust = new Dust(ctx, { n: 4000, center: O.clone().add(V3(-1.5, 1.6, 0)).toArray(), size: [6, 3, 12], drift: [0.03, -0.01, 0.02], color: [0.25, 0.22, 0.18], gain: 0.4, focus: 5, aperture: 0.015 });
  scene.add(dust.mesh);
  const camA = O.clone().add(V3(3.6, 1.32, 6.0)), camB = O.clone().add(V3(2.9, 1.3, 5.3));
  return {
    scene, camera,
    look: { uExposure: 1.2, uLookPow: 1.2, uLookSat: 0.8, uBloom: 0.08, uHalation: 0.12, uVignette: 0.62, uGrain: 0.06, uShadowTint: [0.95, 1.0, 1.08], uHighTint: [1.07, 1.0, 0.88] },
    update(t) {
      const p = camA.clone().lerp(camB, easeInOutSine(t / 12));
      placeCamera(camera, ctx, p, O.clone().add(V3(-0.6, 1.05, -6)), { focal: 26, shake: 0.08, shakeFreq: 0.3, t, seed: 1022 });
      vol.setGround({ center: O.clone().add(V3(0, 0, 0)).toArray(), radius: 12, height: H, density: 0.1, noiseScale: 0.9, drift: [0.02, 0.005, 0.01] });
      vol.setLights(vl);
      vol.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: [0, 1, 0], moonCol: [0, 0, 0], ambTop: [0.004, 0.004, 0.004], ambBot: [0.003, 0.003, 0.003], ext: 0.3, minStep: 0.12 });
      vol.update(t, Math.round(t * 24), camera);
      dust.update(camera);
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 6.5, focal: 26, fstop: 2.8 } };
    },
  };
}

// ---------------- T3: 1 October 1986, Unit 1 runs again beside the sarcophagus ----------------
export async function T3(ctx) {
  const W = await plantWorld(ctx, { focal: 50, city: false, fog: 0.0008, floodGain: 1.0, lampGain: 6.0, moon: 0.3, near: 1 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0;
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  sky.uniforms.uSkyGlowCol.value.setRGB(0.0, 0.0, 0.0);
  // the road in along the south side, and the shift bus coming in with its headlights on
  const road = new THREE.Mesh(new THREE.PlaneGeometry(1400, 8), mat([0.03, 0.03, 0.032], 0.7, 0, 't3road')); road.rotation.x = -Math.PI / 2; road.position.copy(P(-300, 0.08, 300)); road.receiveShadow = true; scene.add(road);
  const bus = makeBus({ color: new THREE.Color(0.5, 0.3, 0.05), cream: new THREE.Color(0.55, 0.52, 0.44) }); bus.group.rotation.y = 0; scene.add(bus.group);
  bus.headMat.color.setRGB(1.0, 0.9, 0.7).multiplyScalar(40);
  const beams = [];
  for (const s of [-1, 1]) { const sp = new THREE.SpotLight(new THREE.Color(1.0, 0.88, 0.65), 900, 120, THREE.MathUtils.degToRad(22), 0.5, 2); scene.add(sp, sp.target); beams.push({ sp, s }); }
  // the windows of the bus glow faintly from inside
  const cabin = new THREE.PointLight(new THREE.Color(1.0, 0.8, 0.55), 30, 8, 2); scene.add(cabin);
  // blinking aviation lights on both stacks
  const avM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.05, 0.02).multiplyScalar(60) });
  const av = (plant.aviation || []).map(p => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), avM); m.position.copy(p).add(PLANT); scene.add(m); return m; });
  const camA = P(-720, 28, 560), camB = P(-706, 28.5, 548);
  return {
    scene, camera,
    look: { uExposure: 2.3, uLookPow: 1.3, uLookSat: 0.95, uBloom: 0.1, uHalation: 0.14, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 12)), P(-230, 36, 0), { focal: 40, shake: 0.03, shakeFreq: 0.3, t, seed: 1033 });
      const bx = -560 + 8.5 * t; bus.group.position.copy(P(bx, 0, 302)); bus.group.rotation.y = 0;
      const fwd = V3(1, 0, 0);
      for (const b of beams) { b.sp.position.copy(bus.group.position).add(V3(6.0, 1.0, b.s * 0.8)); b.sp.target.position.copy(b.sp.position).addScaledVector(fwd, 20).add(V3(0, -1.5, 0)); }
      cabin.position.copy(bus.group.position).add(V3(0, 2.0, 0));
      const on = (t % 1.5) < 0.75; avM.color.setRGB(1.0, 0.05, 0.02).multiplyScalar(on ? 60 : 3);
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- T4: July 1987, the trial at the House of Culture in Chernobyl town ----------------
function houseOfCulture(m) {
  const g = new THREE.Group();
  const B = (w, h, d, x, y, z, mm = m.wall) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mm); b.position.set(x, y + h / 2, z); b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  B(46, 11, 15, 0, 0, 0);                        // main block, front face at z = 7.5
  B(22, 3.2, 13, 0, 11, -1);                      // attic over the hall
  B(47, 0.6, 16, 0, 11, 0, m.trim);              // cornice
  B(22.6, 0.5, 13.6, 0, 14.2, -1, m.trim);
  // tall windows on two floors, white frames
  for (let k = 0; k < 14; k++) {
    const x = -21 + k * 3.23; if (Math.abs(x) < 10.5) continue;
    for (const [y, h] of [[1.2, 3.2], [5.8, 3.8]]) { B(1.6, h, 0.1, x, y, 7.52, m.glass); B(1.8, 0.14, 0.14, x, y - 0.07, 7.56, m.trim); B(1.8, 0.14, 0.14, x, y + h, 7.56, m.trim); B(0.08, h, 0.12, x, y, 7.58, m.trim); }
  }
  // portico: six square columns, an entablature, a plain pediment band; glazed entrance behind
  B(21, 8.6, 0.1, 0, 0.9, 7.52, m.glass);
  for (let k = 0; k < 6; k++) B(0.9, 8.6, 0.9, -9 + k * 3.6, 0.9, 11.2, m.trim);
  B(21.6, 1.6, 5.2, 0, 9.5, 9.6, m.trim);
  B(21.6, 0.9, 0.4, 0, 11.1, 12.0, m.wall);
  for (let k = 0; k < 4; k++) B(23 - k * 0.0, 0.3, 6.6 - k * 0.6, 0, k * 0.3, 10.4 - k * 0.3, m.step);   // steps
  B(48, 0.9, 17, 0, 0, 0, m.step);              // plinth
  return g;
}
export async function T4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(40, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(250, 42);
  const sk = daySky(ctx, SUN, { uSunCol: [2.3, 2.15, 1.95], uZenith: [0.04, 0.09, 0.24], uHorizon: [0.3, 0.33, 0.37], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4, uCloudBright: [0.9, 0.9, 0.88], uCloudShade: [0.45, 0.48, 0.55], uCloudCover: 0.3, uSunDisk: 60 });
  scene.add(sk);
  const O = V3(6500, 0, -4000);
  const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
  patchMaterial(gm, {
    key: 't4ground', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz - uO.xz; float n = texture(tNoise, vec3(p * 0.03, 0.2)).r, n2 = texture(tNoise, vec3(p * 0.4, 0.5)).g, n3 = texture(tNoise, vec3(p * 2.0, 0.7)).b;
        float sq = (1.0 - smoothstep(30.0, 30.6, abs(p.x))) * (1.0 - smoothstep(0.0, 0.6, p.y - 34.0)) * step(-10.0, p.y);
        float road = 1.0 - smoothstep(4.0, 4.6, abs(p.y - 40.0));
        float slab = smoothstep(0.0, 0.03, abs(fract(p.x / 2.0) - 0.5) - 0.47) + smoothstep(0.0, 0.03, abs(fract(p.y / 2.0) - 0.5) - 0.47);
        vec3 grass = mix(vec3(0.06, 0.09, 0.03), vec3(0.11, 0.12, 0.05), smoothstep(0.3, 0.8, n2)) * (0.75 + 0.5 * n3);
        vec3 pav = vec3(0.15, 0.148, 0.14) * (0.8 + 0.3 * n2) * (1.0 - 0.35 * clamp(slab, 0.0, 1.0));
        vec3 asph = vec3(0.07, 0.07, 0.072) * (0.85 + 0.3 * n3);
        vec3 c = mix(grass, pav, sq); c = mix(c, asph, road);
        diffuseColor.rgb = c; }`]],
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), gm); ground.rotation.x = -Math.PI / 2; ground.position.copy(O); ground.receiveShadow = true; scene.add(ground);
  const ms = { wall: mat([0.5, 0.45, 0.36], 0.9, 0, 'hcwall'), trim: mat([0.6, 0.58, 0.53], 0.85, 0, 'hctrim'), step: mat([0.3, 0.29, 0.27], 0.9, 0, 'hcstep'),
    glass: patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.025, 0.03, 0.035), roughness: 0.06 }), { key: 'hcglass' }) };
  const hc = houseOfCulture(ms); hc.position.copy(O).add(V3(0, 0, -18)); scene.add(hc);
  const rnd = mulberry32(74);
  const trees = [];
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) trees.push([O.x + s * (33 + rnd() * 3), O.z - 14 + k * 8 + rnd() * 2, 11 + rnd() * 4, 'linden']);
  for (let k = 0; k < 20; k++) trees.push([O.x - 90 + k * 9 + rnd() * 3, O.z + 47 + rnd() * 3, 10 + rnd() * 4, k % 3 ? 'linden' : 'poplar']);
  for (let k = 0; k < 14; k++) trees.push([O.x + (rnd() < 0.5 ? -1 : 1) * (40 + rnd() * 60), O.z - 40 - rnd() * 40, 13 + rnd() * 5, rnd() < 0.5 ? 'poplar' : 'birch']);
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.95, seed: 9 })));
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1300, count: 24000, exclude: [[O.x, O.z, 240]], seed: 23 }));
  // a bus and the militia car at the kerb; people waiting on the steps and on the square
  const bus = makeBus({ color: new THREE.Color(0.48, 0.42, 0.08), cream: new THREE.Color(0.6, 0.57, 0.48) }); bus.group.position.copy(O).add(V3(-30, 0, 36.8)); bus.group.rotation.y = Math.PI; scene.add(bus.group);
  const car = makeCar({ color: new THREE.Color(0.55, 0.45, 0.1) }); car.group.position.copy(O).add(V3(13, 0, 37)); car.group.rotation.y = Math.PI; scene.add(car.group);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.12, 1.66), mat([0.05, 0.12, 0.35], 0.5, 0, 'milstripe')); stripe.position.set(0, 0.72, 0); car.group.add(stripe);
  const rig = await loadRig();
  const people = [];
  const spots = [];
  for (let k = 0; k < 9; k++) spots.push([O.x - 9 + rnd() * 18, O.z - 3.8 + rnd() * 2.5, rnd() * 6.28]);
  for (let k = 0; k < 10; k++) spots.push([O.x - 18 + rnd() * 36, O.z + 2 + rnd() * 16, rnd() * 6.28]);
  spots.forEach(([x, z, yaw], i) => { const c = makeCivilian(rig, { seed: 900 + i, kind: rnd() < 0.6 ? 'man' : 'woman', bag: rnd() < 0.3 ? 'handbag' : 'none' }); c.root.position.set(x, 0, z); c.root.rotation.y = yaw; scene.add(c.root, c.ao); c.ao.position.set(x, 0.045, z); people.push({ c, off: rnd() * 3 }); });
  const walkers = [];
  for (let k = 0; k < 4; k++) { const c = makeCivilian(rig, { seed: 940 + k, kind: k % 2 ? 'woman' : 'man', bag: 'none' }); scene.add(c.root, c.ao); walkers.push({ c, from: O.clone().add(V3(-26 + k * 15, 0, 33 - k)), to: O.clone().add(V3(-3 + k * 2, 0, -2)), off: k * 0.7 }); }
  const vWalk = clipSpeed(rig, 'Walk');
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.87), sunI: 3.2, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: O, extent: 90, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.07, 0.07, 0.06));
  LEAF_AMB.sky.value.setRGB(0.28, 0.31, 0.35); LEAF_AMB.ground.value.setRGB(0.05, 0.055, 0.045);
  atmosphere({ sun: SUN, fog: [0.32, 0.35, 0.39], density: 0.0006, height: 150, glow: [0.3, 0.27, 0.2] });
  const camA = O.clone().add(V3(-16, 1.65, 58)), camB = O.clone().add(V3(-12.5, 1.65, 53));
  return {
    scene, camera,
    look: { uExposure: 0.78, uLookPow: 1.16, uLookSat: 0.9, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.05, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 12)), O.clone().add(V3(0, 5.5, -10)), { focal: 40, shake: 0.05, shakeFreq: 0.3, t, seed: 1044 });
      for (const p of people) pose(p.c, 'Idle', t, { offset: p.off });
      for (const w of walkers) placeWalker(w.c, rig, { from: w.from, to: w.to, t, speed: vWalk * 0.9, offset: w.off, rate: 0.9 });
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 52, focal: 40, fstop: 5.6 } };
    },
  };
}

// ---------------- T5: Pripyat under snow at night. Not one window lit. ----------------
export async function T5(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(32, ctx.aspect), ctx.aspect, 3, 14000);
  const sky = makeSky({ noiseTex: ctx.noiseTex }); scene.add(sky);
  ATM.uMoonDir.value.copy(MOON_DIR);
  const city = buildCity(ctx, { litFrac: 0.0, lampsOff: true, spring: 0.0, snow: 1 });
  scene.add(city.group);
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  const avM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.05, 0.02).multiplyScalar(80) });
  for (const p of plant.aviation || []) { const m = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), avM); m.position.copy(p).add(PLANT); scene.add(m); }
  const snowPine = (x, z, r) => new THREE.Color(0.2, 0.21, 0.23).multiplyScalar(0.7 + 0.6 * r);
  scene.add(buildForest(ctx, { center: [1200, 1300], radius: 2600, count: 26000, exclude: FEX, tint: snowPine }));
  const moon = new THREE.DirectionalLight(new THREE.Color(0.62, 0.72, 1.0), 0.5);
  moon.position.copy(V3(300, 0, 300)).addScaledVector(MOON_DIR, 3000); moon.target.position.set(300, 0, 300);
  moon.castShadow = true; moon.shadow.mapSize.set(4096, 4096);
  const sc = moon.shadow.camera; sc.left = -1500; sc.right = 1500; sc.top = 1500; sc.bottom = -1500; sc.near = 100; sc.far = 7000; moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.5;
  scene.add(moon, moon.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.12, 0.15, 0.22), new THREE.Color(0.05, 0.05, 0.06), 0.3));
  city.facadeMat.userData.u.uSnow.value = 1;
  ATM.uFogColor.value.setRGB(0.008, 0.01, 0.016); ATM.uFogDensity.value = 0.0005; ATM.uFogHeight.value = 260; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(PLANT.x, 0, PLANT.z).normalize(); ATM.uGlowCol.value.setRGB(0.0, 0.0, 0.0); ATM.uMoonHalo.value.setRGB(0.016, 0.018, 0.026);
  ATM.uLampGain.value = 0; ATM.uFirePos.value.set(0, -1e5, 0); ATM.uFireFog.value.setRGB(0, 0, 0);
  sky.uniforms.uSkyGlowCol.value.setRGB(0, 0, 0); sky.uniforms.uCloudCover.value = 0.6; sky.uniforms.uCloudLit.value.setRGB(0.02, 0.024, 0.034); sky.uniforms.uMoonCol.value.setRGB(0.26, 0.28, 0.32);
  const pA = V3(-420, 150, -520), pB = V3(-330, 140, -430);
  const snow = new Dust(ctx, { n: 14000, center: V3(-330, 120, -420).toArray(), size: [220, 120, 220], drift: [0.6, -1.4, 0.4], color: [0.06, 0.065, 0.075], gain: 1.0, focus: 120, aperture: 0.004 });
  scene.add(snow.mesh);
  return {
    scene, camera,
    look: { uExposure: 1.45, uLookPow: 1.3, uLookSat: 0.75, uBloom: 0.07, uGrain: 0.055, uVignette: 0.65, uShadowTint: [0.92, 1.0, 1.12] },
    update(t) {
      const p = pA.clone().lerp(pB, easeInOutSine(t / 12));
      placeCamera(camera, ctx, p, V3(PLANT.x - 400, -120, PLANT.z - 600), { focal: 32, shake: 0.1, shakeFreq: 0.3, t, seed: 1055 });
      snow.update(camera);
      return debugCam(ctx, camera, (s, l, y = 0) => V3(s, y, l)) || { fade: smoothstep(9.8, 11.6, t) };
    },
  };
}
