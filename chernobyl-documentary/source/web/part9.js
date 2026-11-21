// NATURE RETURNS (1998 – 2000s): Przewalski's horses grazing in a misty meadow, wolves trotting
// down a Pripyat avenue in the snow, the city disappearing into the forest, and an elk in the
// plant's cooling pond at dusk.
import * as THREE from 'three';
import { patchMaterial, ATM, makeSky } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { buildTrees3D, LEAF_AMB, forestFloor } from './lib/street.js';
import { Dust } from './lib/fx.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest, buildCity, generateLayout } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { placeCamera } from './shots_plant.js';
import { streetWorld, debugCam } from './part2.js';
import { sarcophagus } from './part3.js';
import { khata } from './part4.js';
import { makeAnimal } from './lib/animals.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const mat = (c, r = 0.8, m = 0, key = 'p9') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });
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
function meadow(ctx, O, { col = [0.08, 0.1, 0.035], dry = [0.2, 0.17, 0.07] } = {}) {
  const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  patchMaterial(gm, {
    key: 'meadow9', uniforms: { tNoise: { value: ctx.noiseTex }, uA: { value: new THREE.Vector3(...col) }, uB: { value: new THREE.Vector3(...dry) } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uA, uB;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz; float n = texture(tNoise, vec3(p * 0.01, 0.3)).r, n2 = texture(tNoise, vec3(p * 0.12, 0.6)).g, n3 = texture(tNoise, vec3(p * 1.1, 0.2)).b;
        vec3 c = mix(uA, uB, smoothstep(0.4, 0.75, n * 0.7 + n2 * 0.3)) * (0.7 + 0.55 * n3);
        diffuseColor.rgb = c; }`]],
  });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), gm); g.rotation.x = -Math.PI / 2; g.position.copy(O); g.receiveShadow = true;
  return g;
}

// ---------------- X1: 1998. Przewalski's horses graze in the zone ----------------
export async function X1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(85, ctx.aspect), ctx.aspect, 0.5, 16000);
  const SUN = sunDir(80, 6);
  const sk = daySky(ctx, SUN, { uSunCol: [2.6, 1.7, 0.95], uZenith: [0.06, 0.09, 0.18], uHorizon: [0.36, 0.31, 0.27], uDawn: [0.6, 0.3, 0.12], uDawnPow: 4, uCloudBright: [0.9, 0.7, 0.5], uCloudShade: [0.36, 0.34, 0.36], uCloudCover: 0.25, uSunDisk: 70 });
  scene.add(sk);
  const O = V3(9000, 0, -7000);
  scene.add(meadow(ctx, O));
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1500, count: 32000, exclude: [[O.x, O.z, 380]], seed: 61 }));
  const rnd = mulberry32(91);
  const trees = [];
  for (let k = 0; k < 40; k++) { const a = rnd() * 6.28, r = 120 + rnd() * 220; trees.push([O.x + Math.cos(a) * r, O.z + Math.sin(a) * r, 10 + rnd() * 8, rnd() < 0.7 ? 'birch' : 'linden']); }
  for (let k = 0; k < 120; k++) trees.push([O.x - 60 + rnd() * 120, O.z - 120 - rnd() * 80, 0.8 + rnd() * 1.6, 'birch']);   // scrub
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.95, seed: 17 })));
  // the remains of a farmstead at the edge of the meadow
  const mats = { lime: mat([0.45, 0.44, 0.41], 0.95, 0, 'klime'), log: mat([0.12, 0.09, 0.07], 0.95, 0, 'klog'), plinth: mat([0.18, 0.18, 0.17], 0.95, 0, 'kplin'), tin: mat([0.2, 0.17, 0.14], 0.7, 0.4, 'ktin'), shingle: mat([0.09, 0.08, 0.07], 0.9, 0, 'kshing'), board: mat([0.12, 0.1, 0.07], 0.9, 0, 'kboard'), glass: mat([0.01, 0.01, 0.01], 0.9, 0, 'kglass'), frame: mat([0.3, 0.3, 0.28], 0.8, 0, 'kframe'), shutter: mat([0.1, 0.16, 0.22], 0.8, 0, 'kshut') };
  const h = khata(rnd, mats); h.group.position.copy(O).add(V3(30, 0, -150)); h.group.rotation.y = 0.3; scene.add(h.group);
  const herd = [];
  for (const [x, z, yaw, gait, seed] of [[-8, -40, 0.4, 'graze', 1], [-2, -46, -0.3, 'graze', 2], [6, -38, 2.9, 'graze', 3], [-14, -52, 0.9, 'graze', 4], [12, -50, 3.6, 'stand', 5], [2, -58, 0.1, 'walk', 6], [-20, -44, 1.6, 'graze', 7]]) {
    const a = makeAnimal('horse', { seed, scale: seed === 6 ? 0.7 : 1 }); a.root.position.copy(O).add(V3(x, 0, z)); a.root.rotation.y = yaw; scene.add(a.root); herd.push({ a, gait, x, z, yaw });
  }
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.7, 0.42), sunI: 2.8, skyColor: new THREE.Color(0.3, 0.36, 0.48), groundColor: new THREE.Color(0.06, 0.06, 0.04), hemiI: 0.08, center: O.clone().add(V3(0, 0, -50)), extent: 120, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.06, 0.06, 0.04));
  LEAF_AMB.sky.value.setRGB(0.3, 0.3, 0.32); LEAF_AMB.ground.value.setRGB(0.06, 0.05, 0.035);
  atmosphere({ sun: SUN, fog: [0.42, 0.36, 0.3], density: 0.0024, height: 12, glow: [1.0, 0.6, 0.3], glowPow: 7, halo: [1.2, 0.7, 0.35] });
  const camA = O.clone().add(V3(-48, 1.3, 30)), camB = O.clone().add(V3(-44, 1.3, 26));
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.18, uLookSat: 0.95, uBloom: 0.08, uHalation: 0.12, uVignette: 0.6, uGrain: 0.05, uShadowTint: [0.92, 1.0, 1.1], uHighTint: [1.08, 1.0, 0.86] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(-2, 1.2, -47)), { focal: 85, shake: 0.05, shakeFreq: 0.3, t, seed: 1411 });
      for (const hd of herd) {
        if (hd.gait === 'walk') { const d = V3(Math.cos(hd.yaw), 0, -Math.sin(hd.yaw)); hd.a.root.position.copy(O).add(V3(hd.x, 0, hd.z)).addScaledVector(d, t * 0.9); }
        hd.a.update(t, { gait: hd.gait, phase: hd.x * 0.1 });
      }
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(s, y, l))) || { dof: { focus: 70, focal: 85, fstop: 4 } };
    },
  };
}

// ---------------- X2: winter. Wolves trot down the avenue ----------------
export async function X2(ctx) {
  const SUN = sunDir(200, 12);
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false, washing: false, leafiness: 0.0, spring: 0.0, snow: 1, broken: 0.45,
    sky: { uSunCol: [0.5, 0.5, 0.52], uZenith: [0.16, 0.17, 0.19], uHorizon: [0.3, 0.3, 0.31], uDawn: [0.0, 0.0, 0.0], uDawnPow: 4,
      uCloudBright: [0.42, 0.42, 0.43], uCloudShade: [0.27, 0.27, 0.29], uCloudCover: 0.95, uSunDisk: 0 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(85, ctx.aspect), ctx.aspect, 0.2, 16000);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(0.9, 0.92, 0.98), sunI: 0.35, skyColor: new THREE.Color(0.42, 0.44, 0.48), groundColor: new THREE.Color(0.3, 0.3, 0.31), hemiI: 0.5, center: at(120, 0), extent: 220, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.25, 0.25, 0.26)); scene.environmentIntensity = 0.8;
  atmosphere({ sun: SUN, fog: [0.27, 0.28, 0.3], density: 0.003, height: 160, glow: [0.0, 0.0, 0.0] });
  W.city.facadeMat.userData.u.uDay.value = 0.35;
  // saplings grown up through the snow on the road
  const rnd = mulberry32(5);
  const young = []; for (let k = 0; k < 90; k++) { const c = at(60 + rnd() * 220, (rnd() - 0.5) * 28); young.push([c.x, c.z, 2 + rnd() * 5, 'birch']); }
  scene.add(msaaLeaves(ctx, buildTrees3D(young, { leafiness: 0.0, seed: 31 })));
  const wolves = [0, 1, 2].map(k => { const w = makeAnimal('wolf', { seed: 20 + k, scale: 1 + (k === 0 ? 0.08 : 0) }); scene.add(w.root); return w; });
  const snow = new Dust(ctx, { n: 9000, center: at(140, -2, 6).toArray(), size: [40, 14, 40], drift: [0.35, -1.1, 0.25], color: [0.5, 0.5, 0.52], gain: 1.1, focus: 14, aperture: 0.01 });
  scene.add(snow.mesh);
  const yaw = Math.atan2(-D.z, D.x);     // facing up the avenue, toward the camera
  const camA = at(172, -6.2, 0.8), camB = at(170, -6.0, 0.8);
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.1, uLookSat: 0.65, uBloom: 0.05, uHalation: 0.06, uVignette: 0.62, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.08], uHighTint: [1.02, 1.0, 0.98] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), at(118, 3.0, 0.7), { focal: 85, shake: 0.04, shakeFreq: 0.3, t, seed: 1422 });
      wolves.forEach((w, k) => {
        const s = 88 + k * 5 + 2.4 * t; const l = [0.8, -1.6, 2.6][k] + Math.sin(t * 0.4 + k) * 0.6;
        w.root.position.copy(at(s, l, 0)); w.root.rotation.y = yaw + Math.sin(t * 0.4 + k) * 0.08;
        w.update(t, { gait: 'trot', phase: k * 0.37 });
      });
      snow.update(camera);
      return debugCam(ctx, camera, at) || { dof: { focus: 52, focal: 85, fstop: 4 } };
    },
  };
}

// ---------------- X3: Pripyat from the air, disappearing into the forest ----------------
export async function X3(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(32, ctx.aspect), ctx.aspect, 3, 16000);
  const SUN = sunDir(210, 45);
  const sk = daySky(ctx, SUN, { uSunCol: [2.2, 2.05, 1.85], uZenith: [0.04, 0.09, 0.24], uHorizon: [0.3, 0.33, 0.37], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4, uCloudBright: [0.9, 0.9, 0.88], uCloudShade: [0.45, 0.48, 0.55], uCloudCover: 0.3, uSunDisk: 60 });
  scene.add(sk);
  const layout = generateLayout(1986);
  const city = buildCity(ctx, { layout, litFrac: 0, lampsOff: true, spring: 1.0, facade: { day: 1, broken: 0.4, entrGain: 0 } });
  scene.add(city.group);
  city.facadeMat.userData.u.uDay.value = 1.0;
  // the forest has grown through the courtyards and over the roads (but not through the blocks)
  const ex = layout.buildings.map(b => [b.x, b.z, Math.max(b.w, b.d) * 0.55 + 4]).concat(FEX.slice(1));
  const green = (x, z, r) => new THREE.Color(0.075 + 0.04 * r, 0.11 + 0.05 * r, 0.05).multiplyScalar(0.9 + 0.3 * r);
  scene.add(buildForest(ctx, { center: [0, 0], radius: 1300, count: 60000, exclude: ex, seed: 71, tint: green }));
  scene.add(buildForest(ctx, { center: [1200, 1300], radius: 2600, count: 50000, exclude: FEX, seed: 72 }));
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.87), sunI: 3.0, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.08, center: V3(0, 0, 0), extent: 1100, near: 100, far: 9000, mapSize: 4096 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.06, 0.07, 0.05));
  atmosphere({ sun: SUN, fog: [0.32, 0.35, 0.39], density: 0.0003, height: 300, glow: [0.3, 0.27, 0.2] });
  const pA = V3(-700, 210, -620), pB = V3(-600, 200, -520);
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.16, uLookSat: 0.95, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      placeCamera(camera, ctx, pA.clone().lerp(pB, easeInOutSine(t / 15)), V3(250, -40, 250), { focal: 32, shake: 0.08, shakeFreq: 0.3, t, seed: 1433 });
      return debugCam(ctx, camera, (s, l, y = 0) => V3(s, y, l)) || {};
    },
  };
}

// ---------------- X4: dusk. An elk in the cooling pond, the plant across the water ----------------
export async function X4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(70, ctx.aspect), ctx.aspect, 0.5, 16000);
  const SUN = sunDir(255, 2.5);
  const sk = daySky(ctx, SUN, { uSunCol: [3.0, 1.3, 0.4], uZenith: [0.02, 0.03, 0.065], uHorizon: [0.16, 0.1, 0.075], uDawn: [1.1, 0.42, 0.13], uDawnPow: 3, uCloudBright: [0.7, 0.32, 0.15], uCloudShade: [0.05, 0.045, 0.055], uCloudCover: 0.45, uSunDisk: 60 });
  scene.add(sk);
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  plant.ground.position.copy(PLANT).setY(0.02); scene.add(plant.ground);
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  scene.add(buildForest(ctx, { center: [PLANT.x + 1200, PLANT.z + 1200], radius: 2400, count: 30000, exclude: FEX.concat([[PLANT.x + 1100, PLANT.z + 1000, 700]]), seed: 81 }));
  scene.add(forestFloor(ctx, { center: [PLANT.x + 1200, PLANT.z + 1200], radius: 2400, exclude: [[PLANT.x + 1100, PLANT.z + 1000, 660]], color: [0.04, 0.045, 0.025], y: 0.05 }));
  // the cooling pond: still, dark water that mirrors the sky
  const waterM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.01, 0.012, 0.014), roughness: 0.04, metalness: 0.0 });
  patchMaterial(waterM, { key: 'pond', uniforms: { uWT: ATM.uTime }, fragmentHeader: 'uniform float uWT;', fragmentReplace: [['#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      { vec2 p = vWPos.xz; float a = sin(p.x * 0.9 + uWT * 0.6) * 0.5 + sin(p.y * 1.3 - uWT * 0.8) * 0.5, b = cos(p.x * 1.1 - uWT * 0.5) * 0.5 + cos(p.y * 0.7 + uWT * 0.7) * 0.5;
        normal = normalize(normal + mat3(viewMatrix) * (vec3(a, 0.0, b) * 0.015)); }`]] });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), waterM); water.rotation.x = -Math.PI / 2; water.position.copy(P(1100, 0.12, 1000)); scene.add(water);
  const reeds = []; const rnd = mulberry32(13);
  for (let k = 0; k < 40; k++) reeds.push([PLANT.x + 1805 + rnd() * 30, PLANT.z + 1640 + rnd() * 80, 0.8 + rnd() * 1.4, 'linden']);
  scene.add(msaaLeaves(ctx, buildTrees3D(reeds, { leafiness: 0.9, seed: 41 })));
  const elk = makeAnimal('elk', { seed: 3 }); elk.root.position.copy(P(1752, -0.15, 1652)); elk.root.rotation.y = 0.785; scene.add(elk.root);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.42, 0.14), sunI: 2.0, skyColor: new THREE.Color(0.12, 0.13, 0.2), groundColor: new THREE.Color(0.03, 0.025, 0.02), hemiI: 0.1, center: P(1779, 0, 1679), extent: 60, near: 100, far: 9000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.02, 0.018, 0.016));
  LEAF_AMB.sky.value.setRGB(0.12, 0.1, 0.1); LEAF_AMB.ground.value.setRGB(0.03, 0.025, 0.02);
  atmosphere({ sun: SUN, fog: [0.08, 0.06, 0.06], density: 0.0005, height: 120, glow: [1.0, 0.42, 0.14], glowPow: 8, halo: [1.2, 0.5, 0.16] });
  const avM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.05, 0.02).multiplyScalar(60) });
  for (const p of plant.aviation || []) { const m = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), avM); m.position.copy(p).add(PLANT); scene.add(m); }
  const camA = P(1800, 1.5, 1700), camB = P(1797, 1.5, 1702);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.95, uBloom: 0.09, uHalation: 0.12, uVignette: 0.65, uGrain: 0.05, uShadowTint: [0.9, 1.0, 1.15], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(500, 40, 400), { focal: 70, shake: 0.04, shakeFreq: 0.3, t, seed: 1444 });
      elk.update(t, { gait: 'stand' });
      const on = (t % 1.5) < 0.75; avM.color.setRGB(1.0, 0.05, 0.02).multiplyScalar(on ? 60 : 3);
      return debugCam(ctx, camera, (s, l, y = 0) => P(s, y, l)) || { dof: { focus: 68, focal: 70, fstop: 5.6 }, fade: smoothstep(13.2, 14.8, t) };
    },
  };
}
