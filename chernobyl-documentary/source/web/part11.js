// THE COST: the memorial to the firefighters and liquidators, the graves of the first victims at
// Mitino, the alley of vanished villages, and candles at night.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { patchMaterial, ATM, makeSky } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCivilian, buildTrees3D, LEAF_AMB, forestFloor } from './lib/street.js';
import { loadRig, pose, makeFirefighter } from './lib/people.js';
import { Flames } from './lib/fx.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest } from './lib/city.js';
import { placeCamera } from './shots_plant.js';
import { debugCam } from './part2.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (c, r = 0.8, m = 0, key = 'p11') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });

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
function overcast(ctx, scene, SUN, { cover = 0.92, bright = 0.55 } = {}) {
  const sk = daySky(ctx, SUN, { uSunCol: [1.0, 0.98, 0.95], uZenith: [0.13, 0.14, 0.17], uHorizon: [0.3, 0.3, 0.31], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4, uCloudBright: [bright, bright, bright + 0.01], uCloudShade: [0.28, 0.29, 0.31], uCloudCover: cover, uSunDisk: 0 });
  scene.add(sk); return sk;
}
function plainGround(ctx, O, col, key) {
  const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  patchMaterial(gm, {
    key, uniforms: { tNoise: { value: ctx.noiseTex }, uC: { value: new THREE.Vector3(...col) } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uC;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz; float n = texture(tNoise, vec3(p * 0.03, 0.3)).r, n2 = texture(tNoise, vec3(p * 0.5, 0.6)).g, n3 = texture(tNoise, vec3(p * 2.0, 0.2)).b;
        diffuseColor.rgb = uC * (0.7 + 0.5 * n) * (0.8 + 0.3 * n2) * (0.85 + 0.2 * n3); }`]],
  });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), gm); g.rotation.x = -Math.PI / 2; g.position.copy(O); g.receiveShadow = true; return g;
}
// a bunch of red carnations lying on stone
function carnations(rnd, n = 9) {
  const g = new THREE.Group();
  const red = mat([0.45, 0.02, 0.02], 0.7, 0, 'carnation'), stem = mat([0.06, 0.12, 0.04], 0.8, 0, 'stem');
  const yaw = rnd() * 6.28;
  for (let k = 0; k < n; k++) {
    const a = yaw + (rnd() - 0.5) * 0.4; const L = 0.45 + rnd() * 0.15, off = (rnd() - 0.5) * 0.12;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, L, 4), stem); s.rotation.z = Math.PI / 2; s.rotation.y = a; s.position.set(Math.cos(a) * L / 2 + off * Math.sin(a), 0.02, -Math.sin(a) * L / 2 + off * Math.cos(a)); g.add(s);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), red); f.scale.set(1, 0.7, 1); f.position.set(Math.cos(a) * L + off * Math.sin(a), 0.04, -Math.sin(a) * L + off * Math.cos(a)); f.castShadow = true; g.add(f);
  }
  return g;
}

// ---------------- Z1: the memorial "To Those Who Saved the World" ----------------
export async function Z1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(40, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(200, 30);
  const sk = overcast(ctx, scene, SUN, { cover: 0.75, bright: 0.7 });
  const O = V3(-9000, 0, 9000);
  scene.add(plainGround(ctx, O, [0.1, 0.11, 0.06], 'z1ground'));
  const paving = new THREE.Mesh(new THREE.CircleGeometry(16, 48), mat([0.3, 0.29, 0.27], 0.85, 0, 'paving')); paving.rotation.x = -Math.PI / 2; paving.position.copy(O).setY(0.02); paving.receiveShadow = true; scene.add(paving);
  const granite = mat([0.07, 0.07, 0.075], 0.35, 0.1, 'granite');
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(9, 1.2, 3.4), granite); plinth.position.copy(O).setY(0.6); plinth.castShadow = true; plinth.receiveShadow = true; scene.add(plinth);
  const step = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 4.4), granite); step.position.copy(O).setY(0.125); step.receiveShadow = true; scene.add(step);
  // the bronze figures: firefighters and liquidators with hoses, a pilot, a scientist
  const rig = await loadRig();
  const bronze = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.32, 0.2, 0.1), roughness: 0.38, metalness: 0.9 });
  const figs = [];
  for (const [x, z, yaw, clip, ft, seed] of [[-3.0, 0.2, -0.2, 'Walk', 0.3, 1], [-1.6, -0.4, 0.15, 'Idle', 0.0, 2], [0.0, 0.3, 0.0, 'Walk', 0.7, 3], [1.6, -0.3, -0.25, 'Run', 0.2, 4], [3.0, 0.2, 0.3, 'Idle', 1.1, 5]]) {
    const f = makeFirefighter(rig, { seed, apparatus: seed % 2 === 0 });
    f.root.traverse(o => { if (o.isMesh) { o.material = bronze; o.castShadow = true; } });
    f.root.position.copy(O).add(V3(x, 1.2, z)); f.root.rotation.y = Math.PI + yaw; f.root.scale.multiplyScalar(1.3); scene.add(f.root);
    pose(f, clip, ft); figs.push(f);
  }
  const rnd = mulberry32(17);
  for (let k = 0; k < 14; k++) { const c = carnations(rnd, 5 + Math.floor(rnd() * 8)); c.position.copy(O).add(V3(-4.5 + rnd() * 9, 0.25, 2.0 + rnd() * 0.25)); scene.add(c); }
  const trees = [];
  for (let k = 0; k < 40; k++) { const a = rnd() * 6.28, r = 22 + rnd() * 40; trees.push([O.x + Math.cos(a) * r, O.z + Math.sin(a) * r, 11 + rnd() * 6, rnd() < 0.6 ? 'birch' : 'linden']); }
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.6, seed: 3 })));
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1200, count: 20000, exclude: [[O.x, O.z, 90]], seed: 7 }));
  const people = [];
  for (const [x, z, yaw, seed, kind] of [[-2.2, 4.4, Math.PI, 3101, 'woman'], [1.0, 5.0, Math.PI + 0.3, 3102, 'man'], [2.6, 4.6, Math.PI - 0.2, 3103, 'woman']]) {
    const c = makeCivilian(rig, { seed, kind, bag: 'none' }); c.root.position.copy(O).add(V3(x, 0, z)); c.root.rotation.y = yaw; scene.add(c.root, c.ao); c.ao.position.set(c.root.position.x, 0.045, c.root.position.z); people.push(c);
  }
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.97, 0.93), sunI: 1.4, skyColor: new THREE.Color(0.4, 0.43, 0.48), groundColor: new THREE.Color(0.08, 0.08, 0.07), hemiI: 0.3, center: O, extent: 40, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.08, 0.08, 0.07));
  LEAF_AMB.sky.value.setRGB(0.32, 0.34, 0.37); LEAF_AMB.ground.value.setRGB(0.07, 0.07, 0.06);
  atmosphere({ sun: SUN, fog: [0.3, 0.31, 0.33], density: 0.002, height: 80, glow: [0.05, 0.05, 0.04] });
  const camA = O.clone().add(V3(-6, 1.5, 17)), camB = O.clone().add(V3(-3, 1.45, 14.5));
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.15, uLookSat: 0.8, uBloom: 0.05, uHalation: 0.07, uVignette: 0.6, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.06], uHighTint: [1.04, 1.0, 0.95] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(0, 2.4, 0)), { focal: 40, shake: 0.05, shakeFreq: 0.3, t, seed: 1611 });
      people.forEach((c, i) => pose(c, 'Idle', t, { offset: i * 1.1 }));
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 15, focal: 40, fstop: 4 } };
    },
  };
}

// ---------------- Z2: Mitino cemetery, Moscow: the graves of the first victims ----------------
export async function Z2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(50, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(190, 18);
  const sk = overcast(ctx, scene, SUN, { cover: 0.95, bright: 0.5 });
  const O = V3(9000, 0, 9000);
  scene.add(plainGround(ctx, O, [0.12, 0.12, 0.09], 'z2ground'));
  const granite = mat([0.035, 0.035, 0.04], 0.18, 0.15, 'blackgranite'), grey = mat([0.3, 0.3, 0.29], 0.9, 0, 'kerb');
  const rnd = mulberry32(23);
  const stones = [], kerbs = [];
  for (let row = 0; row < 3; row++) for (let k = 0; k < 14; k++) {
    const x = -20 + k * 3.0, z = -row * 4.2;
    const s = new THREE.BoxGeometry(0.9, 1.25 + rnd() * 0.15, 0.14); s.translate(x, 0.65, z - 1.2); stones.push(s.toNonIndexed());
    const kb = new THREE.BoxGeometry(1.4, 0.18, 2.4); kb.translate(x, 0.09, z); kerbs.push(kb.toNonIndexed());
    if (rnd() < 0.8) { const c = carnations(rnd, 4 + Math.floor(rnd() * 8)); c.position.copy(O).add(V3(x + (rnd() - 0.5) * 0.5, 0.2, z - 0.3 + (rnd() - 0.5) * 0.6)); scene.add(c); }
  }
  const st = new THREE.Mesh(mergeGeometries(stones), granite); st.position.copy(O); st.castShadow = true; st.receiveShadow = true; scene.add(st);
  const kbm = new THREE.Mesh(mergeGeometries(kerbs), grey); kbm.position.copy(O); kbm.receiveShadow = true; scene.add(kbm);
  const trees = [];
  for (let k = 0; k < 50; k++) trees.push([O.x - 40 + rnd() * 80, O.z - 18 - rnd() * 30, 12 + rnd() * 6, 'birch']);
  for (let k = 0; k < 16; k++) trees.push([O.x - 30 + rnd() * 60, O.z + 6 + rnd() * 6, 12 + rnd() * 6, 'birch']);
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.2, seed: 9 })));
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1200, count: 16000, exclude: [[O.x, O.z, 120]], seed: 9 }));
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(0.95, 0.96, 1.0), sunI: 0.5, skyColor: new THREE.Color(0.42, 0.44, 0.48), groundColor: new THREE.Color(0.1, 0.1, 0.09), hemiI: 0.45, center: O, extent: 40, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.1, 0.1, 0.09));
  LEAF_AMB.sky.value.setRGB(0.35, 0.36, 0.38); LEAF_AMB.ground.value.setRGB(0.09, 0.09, 0.08);
  atmosphere({ sun: SUN, fog: [0.3, 0.3, 0.31], density: 0.004, height: 60, glow: [0, 0, 0] });
  const camA = O.clone().add(V3(-24, 1.2, 3.2)), camB = O.clone().add(V3(-16, 1.2, 3.0));
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.12, uLookSat: 0.65, uBloom: 0.04, uHalation: 0.05, uVignette: 0.62, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.06], uHighTint: [1.0, 1.0, 1.0] },
    update(t) {
      const p = camA.clone().lerp(camB, easeInOutSine(t / 15));
      placeCamera(camera, ctx, p, p.clone().add(V3(9, -0.4, -6)), { focal: 50, shake: 0.04, shakeFreq: 0.3, t, seed: 1622 });
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(s, y, l))) || { dof: { focus: 5.5, focal: 50, fstop: 2.8 } };
    },
  };
}

// ---------------- Z3: the alley of the vanished villages ----------------
function villageSign(seed) {
  const W = 256, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const rnd = mulberry32(seed);
  g.fillStyle = '#e6e3dc'; g.fillRect(0, 0, W, H); g.strokeStyle = '#222'; g.lineWidth = 6; g.strokeRect(5, 5, W - 10, H - 10);
  // a name too small to read: a row of dark strokes
  g.fillStyle = '#1b1b1b'; let x = 30 + rnd() * 20; const n = 6 + Math.floor(rnd() * 6);
  for (let k = 0; k < n; k++) { const w = 8 + rnd() * 9; g.fillRect(x, 50 + rnd() * 4, w, 24 + rnd() * 6); x += w + 4 + rnd() * 3; }
  g.strokeStyle = '#b01010'; g.lineWidth = 10; g.beginPath(); g.moveTo(14, H - 14); g.lineTo(W - 14, 14); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export async function Z3(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(35, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(230, 14);
  const sk = overcast(ctx, scene, SUN, { cover: 0.85, bright: 0.6 });
  const O = V3(-9000, 0, -9000);
  scene.add(plainGround(ctx, O, [0.13, 0.11, 0.06], 'z3ground'));
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 300), mat([0.22, 0.21, 0.2], 0.9, 0, 'z3path')); path.rotation.x = -Math.PI / 2; path.position.copy(O).setY(0.02); path.receiveShadow = true; scene.add(path);
  const postM = mat([0.08, 0.08, 0.08], 0.6, 0.4, 'signpost');
  for (let k = 0; k < 64; k++) {
    const side = k % 2 ? 1 : -1, z = -k * 2.4 - (k % 2) * 1.2;
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshStandardMaterial({ map: villageSign(300 + k), roughness: 0.7 }));
    sg.position.copy(O).add(V3(side * 2.4, 1.5, z)); sg.rotation.y = -side * 0.5; sg.castShadow = true; scene.add(sg);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), postM); post.position.copy(O).add(V3(side * 2.4, 0.75, z)); scene.add(post);
  }
  const rnd = mulberry32(31);
  const trees = [];
  for (let k = 0; k < 90; k++) { const side = rnd() < 0.5 ? -1 : 1; trees.push([O.x + side * (6 + rnd() * 14), O.z + 10 - rnd() * 180, 12 + rnd() * 6, rnd() < 0.7 ? 'birch' : 'linden']); }
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.35, seed: 13 })));
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1200, count: 20000, exclude: [[O.x, O.z - 80, 120]], seed: 13 }));
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.9, 0.78), sunI: 1.0, skyColor: new THREE.Color(0.42, 0.44, 0.48), groundColor: new THREE.Color(0.1, 0.09, 0.07), hemiI: 0.35, center: O.clone().add(V3(0, 0, -40)), extent: 70, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.09, 0.08, 0.07));
  LEAF_AMB.sky.value.setRGB(0.35, 0.33, 0.3); LEAF_AMB.ground.value.setRGB(0.09, 0.08, 0.06);
  atmosphere({ sun: SUN, fog: [0.3, 0.29, 0.28], density: 0.006, height: 40, glow: [0.2, 0.15, 0.1] });
  const camA = O.clone().add(V3(0.3, 1.6, 6)), camB = O.clone().add(V3(0.0, 1.6, -6));
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.14, uLookSat: 0.75, uBloom: 0.04, uHalation: 0.06, uVignette: 0.62, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.06], uHighTint: [1.05, 1.0, 0.93] },
    update(t) {
      const p = camA.clone().lerp(camB, easeInOutSine(t / 15));
      placeCamera(camera, ctx, p, p.clone().add(V3(0, -0.1, -20)), { focal: 35, shake: 0.06, shakeFreq: 0.3, t, seed: 1633 });
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 8, focal: 35, fstop: 4 } };
    },
  };
}

// ---------------- Z4: candles at night at the foot of the memorial ----------------
export async function Z4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(65, ctx.aspect), ctx.aspect, 0.05, 2000);
  const sky = makeSky({ noiseTex: ctx.noiseTex }); scene.add(sky);
  sky.uniforms.uCloudCover.value = 0.7; sky.uniforms.uCloudLit.value.setRGB(0.01, 0.012, 0.018); sky.uniforms.uMoonCol.value.setRGB(0.05, 0.05, 0.06); sky.uniforms.uSkyGlowCol.value.setRGB(0, 0, 0);
  const O = V3(-9000, 0, 9000);
  const granite = mat([0.05, 0.05, 0.055], 0.3, 0.1, 'granite4');
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(9, 1.2, 3.4), granite); plinth.position.copy(O).setY(0.6); plinth.receiveShadow = true; scene.add(plinth);
  const step = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 4.4), granite); step.position.copy(O).setY(0.125); step.receiveShadow = true; scene.add(step);
  const paving = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat([0.12, 0.12, 0.11], 0.6, 0, 'paving4')); paving.rotation.x = -Math.PI / 2; paving.position.copy(O).setY(0.01); paving.receiveShadow = true; scene.add(paving);
  // lampadas: red glass cups with a flame inside, along the step and on the paving
  const rnd = mulberry32(41);
  const glassM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.5, 0.03, 0.02), roughness: 0.15, transparent: true, opacity: 0.7, emissive: new THREE.Color(0.6, 0.06, 0.02), emissiveIntensity: 1.5 });
  const spots = [];
  for (let k = 0; k < 70; k++) {
    const x = -4.7 + rnd() * 9.4, z = 1.75 + rnd() * 0.42, y = 0.25;
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.09, 12), glassM); cup.position.copy(O).add(V3(x, y + 0.045, z)); scene.add(cup);
    spots.push({ pos: O.clone().add(V3(x, y + 0.07, z)).toArray(), w: 0.025, h: 0.06, seed: k * 1.7 });
  }
  const flames = new Flames(ctx, spots); scene.add(flames.mesh);
  const lights = [];
  for (const [x, z] of [[-3, 2.4], [0, 2.6], [3, 2.4], [-1.5, 3.6], [1.8, 3.8]]) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.45, 0.2), 1.6, 6, 2); pl.position.copy(O).add(V3(x, 0.4, z)); scene.add(pl); lights.push(pl); }
  for (let k = 0; k < 10; k++) { const c = carnations(rnd, 5 + Math.floor(rnd() * 6)); c.position.copy(O).add(V3(-4 + rnd() * 8, 0.25, 1.8 + rnd() * 0.2)); scene.add(c); }
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.03, 0.035, 0.05), new THREE.Color(0.01, 0.008, 0.006), 0.4));
  ATM.uFogColor.value.setRGB(0.004, 0.005, 0.008); ATM.uFogDensity.value = 0.01; ATM.uFogHeight.value = 50; ATM.uFogBase.value = 0;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0; ATM.uLampGain.value = 0;
  const camA = O.clone().add(V3(-2.2, 0.75, 7.2)), camB = O.clone().add(V3(1.4, 0.7, 6.8));
  return {
    scene, camera,
    look: { uExposure: 1.6, uLookPow: 1.25, uLookSat: 0.95, uBloom: 0.14, uHalation: 0.2, uVignette: 0.7, uGrain: 0.06 },
    update(t) {
      const p = camA.clone().lerp(camB, easeInOutSine(t / 15));
      placeCamera(camera, ctx, p, O.clone().add(V3(p.x - O.x + 0.3, 0.35, 2.4)), { focal: 40, shake: 0.04, shakeFreq: 0.3, t, seed: 1644 });
      lights.forEach((l, i) => { l.intensity = 1.6 * (0.8 + 0.2 * fbm1(t * 6 + i * 3, 50 + i, 2)); });
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 4.4, focal: 40, fstop: 2.8 }, fade: smoothstep(13.2, 14.8, t) };
    },
  };
}
