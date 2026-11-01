// THE NEW SHELTER (2010 – November 2016): the New Safe Confinement built beside Unit 4, its scale
// seen from beneath, the slide over the old sarcophagus, and the finished arch at sunset.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCivilian } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { fovFromFocalH, smoothstep, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { PLANT } from './lib/plant.js';
import { placeCamera } from './shots_plant.js';
import { debugCam } from './part2.js';
import { sarcophagus, plantSet, crawlerCrane } from './part3.js';
import { makeArch } from './lib/arch.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const atP = (s, l, y = 0) => P(s, y, l);
const mat = (c, r = 0.8, m = 0, key = 'p10') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });
const PARK = 13, SITE = PARK + 327;      // arch centre over Unit 4, and where it was assembled (327 m along the rails)

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
// the shared set: the plant, the old shelter, the rails, the arch; the VT-2 stack came down in 2013
function nscSet(ctx, scene, { stack = false, clad = 1 } = {}) {
  const plant = plantSet(ctx, scene, { forest: 50000 });
  if (!stack) plant.root.children.forEach(o => { if (o.isGroup && Math.abs(o.position.x + 58) < 0.1 && Math.abs(o.position.z - 4) < 0.1) o.visible = false; });
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  const conc = mat([0.36, 0.35, 0.33], 0.95, 0, 'rails');
  for (const z of [-128.5, 128.5]) { const b = new THREE.Mesh(new THREE.BoxGeometry(520, 3, 6), conc); b.position.copy(P(180, 1.5, z)); b.castShadow = true; b.receiveShadow = true; scene.add(b); }
  const arch = makeArch({ clad }); scene.add(arch.group);
  return { plant, arch };
}

// ---------------- Y1: 2012. The arch takes shape beside the reactor ----------------
export async function Y1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(50, ctx.aspect), ctx.aspect, 2, 16000);
  const SUN = sunDir(160, 30);
  const sk = daySky(ctx, SUN, { uSunCol: [1.6, 1.55, 1.45], uZenith: [0.08, 0.11, 0.2], uHorizon: [0.3, 0.31, 0.33], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4, uCloudBright: [0.75, 0.75, 0.74], uCloudShade: [0.36, 0.38, 0.42], uCloudCover: 0.6, uSunDisk: 30 });
  scene.add(sk);
  const { arch } = nscSet(ctx, scene, { stack: true, clad: 0.45 });
  arch.group.position.copy(P(SITE, 3, 0));
  const craneMat = mat([0.45, 0.3, 0.06], 0.7, 0, 'demag2');
  const cr1 = crawlerCrane(120, 1.2, craneMat); cr1.position.copy(P(SITE + 110, 0, 150)); cr1.rotation.y = Math.PI * 0.75; scene.add(cr1);
  const cr2 = crawlerCrane(110, 1.1, craneMat); cr2.position.copy(P(SITE - 40, 0, -160)); cr2.rotation.y = -Math.PI * 0.4; scene.add(cr2);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.96, 0.9), sunI: 2.2, skyColor: new THREE.Color(0.35, 0.4, 0.5), groundColor: new THREE.Color(0.07, 0.07, 0.06), hemiI: 0.15, center: P(SITE - 120, 0, 0), extent: 420, near: 200, far: 9000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.07, 0.07, 0.06));
  atmosphere({ sun: SUN, fog: [0.3, 0.32, 0.35], density: 0.0005, height: 300, glow: [0.25, 0.22, 0.17] });
  const camA = P(760, 40, 560), camB = P(735, 42, 585);
  return {
    scene, camera,
    look: { uExposure: 0.85, uLookPow: 1.15, uLookSat: 0.85, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.04, 1.0, 0.95] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(160, 50, 0), { focal: 50, shake: 0.04, shakeFreq: 0.3, t, seed: 1511 });
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- Y2: the scale of it, from beneath the open end ----------------
export async function Y2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(20, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(150, 28);
  const sk = daySky(ctx, SUN, { uSunCol: [1.8, 1.7, 1.55], uZenith: [0.06, 0.1, 0.22], uHorizon: [0.3, 0.32, 0.35], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4, uCloudBright: [0.85, 0.85, 0.84], uCloudShade: [0.4, 0.42, 0.48], uCloudCover: 0.4, uSunDisk: 40 });
  scene.add(sk);
  const { arch } = nscSet(ctx, scene, { clad: 1 });
  arch.group.position.copy(P(SITE, 3, 0));
  // workers in orange vests, small under the steel
  const rig = await loadRig();
  const men = [];
  for (const [x, z, yaw, seed] of [[-96, -20, 1.2, 3001], [-99, -14, 2.4, 3002], [-104, 6, 0.4, 3003], [-92, 30, 3.0, 3004]]) {
    const c = makeCivilian(rig, { seed, kind: 'man', bag: 'none' });
    c.root.traverse(o => { if (o.isMesh && o.material.color) { const k = o.material.color; if (!(k.r > 0.2 && k.r > k.g * 1.12 && k.g > k.b * 1.03) && k.r + k.g + k.b > 0.1) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.7, 0.25, 0.02), 0.8); } } });
    c.root.position.copy(P(SITE + x, 0, z)); c.root.rotation.y = yaw; scene.add(c.root, c.ao); c.ao.position.set(c.root.position.x, 0.045, c.root.position.z); men.push(c);
  }
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.96, 0.9), sunI: 2.6, skyColor: new THREE.Color(0.35, 0.4, 0.5), groundColor: new THREE.Color(0.07, 0.07, 0.06), hemiI: 0.15, center: P(SITE, 0, 0), extent: 220, near: 200, far: 9000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.07, 0.07, 0.06));
  atmosphere({ sun: SUN, fog: [0.3, 0.32, 0.35], density: 0.0004, height: 300, glow: [0.25, 0.22, 0.17] });
  const camA = P(SITE - 140, 1.6, -60), camB = P(SITE - 132, 1.6, -54);
  return {
    scene, camera,
    look: { uExposure: 0.85, uLookPow: 1.15, uLookSat: 0.85, uBloom: 0.06, uHalation: 0.08, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.04, 1.0, 0.95] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(SITE - 60, lerp(30, 70, easeInOutSine(t / 15)), 20), { focal: 20, shake: 0.06, shakeFreq: 0.3, t, seed: 1522 });
      men.forEach((c, i) => pose(c, 'Idle', t, { offset: i * 0.9 }));
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- Y3: November 2016. The arch slides 327 m over the old shelter ----------------
export async function Y3(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(35, ctx.aspect), ctx.aspect, 2, 16000);
  const SUN = sunDir(185, 14);
  const sk = daySky(ctx, SUN, { uSunCol: [1.3, 1.2, 1.05], uZenith: [0.1, 0.12, 0.16], uHorizon: [0.29, 0.3, 0.31], uDawn: [0.05, 0.03, 0.02], uDawnPow: 4, uCloudBright: [0.6, 0.6, 0.6], uCloudShade: [0.3, 0.31, 0.33], uCloudCover: 0.75, uSunDisk: 0 });
  scene.add(sk);
  const { arch } = nscSet(ctx, scene, { clad: 1 });
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.88), sunI: 1.6, skyColor: new THREE.Color(0.4, 0.44, 0.5), groundColor: new THREE.Color(0.07, 0.07, 0.06), hemiI: 0.25, center: P(170, 0, 0), extent: 450, near: 200, far: 9000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.07, 0.07, 0.06));
  atmosphere({ sun: SUN, fog: [0.29, 0.3, 0.31], density: 0.0005, height: 200, glow: [0.08, 0.07, 0.05] });
  const camA = P(-420, 300, 620), camB = P(-380, 290, 640);
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.15, uLookSat: 0.75, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.95, 1.0, 1.06], uHighTint: [1.03, 1.0, 0.95] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(140, 20, 0), { focal: 35, shake: 0.04, shakeFreq: 0.3, t, seed: 1533 });
      arch.group.position.copy(P(lerp(SITE, PARK, smoothstep(1.0, 13.5, t)), 3, 0));
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- Y4: the arch in place, catching the last of the sun ----------------
export async function Y4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(60, ctx.aspect), ctx.aspect, 2, 16000);
  const SUN = sunDir(248, 5);
  const sk = daySky(ctx, SUN, { uSunCol: [3.0, 1.5, 0.55], uZenith: [0.03, 0.05, 0.11], uHorizon: [0.26, 0.17, 0.12], uDawn: [1.0, 0.45, 0.15], uDawnPow: 3, uCloudBright: [0.85, 0.45, 0.22], uCloudShade: [0.1, 0.08, 0.1], uCloudCover: 0.4, uSunDisk: 60 });
  scene.add(sk);
  const { arch } = nscSet(ctx, scene, { clad: 1 });
  arch.group.position.copy(P(PARK, 3, 0));
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.55, 0.25), sunI: 2.6, skyColor: new THREE.Color(0.2, 0.22, 0.32), groundColor: new THREE.Color(0.04, 0.03, 0.025), hemiI: 0.1, center: P(0, 0, 0), extent: 350, near: 200, far: 9000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.03, 0.025, 0.02));
  atmosphere({ sun: SUN, fog: [0.1, 0.07, 0.06], density: 0.0005, height: 150, glow: [1.0, 0.5, 0.2], glowPow: 8, halo: [1.2, 0.6, 0.2] });
  const camA = P(-560, 28, 560), camB = P(-536, 29, 548);
  return {
    scene, camera,
    look: { uExposure: 0.9, uLookPow: 1.2, uLookSat: 0.95, uBloom: 0.09, uHalation: 0.12, uVignette: 0.62, uGrain: 0.05, uShadowTint: [0.9, 1.0, 1.15], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(10, 50, 0), { focal: 60, shake: 0.03, shakeFreq: 0.3, t, seed: 1544 });
      return debugCam(ctx, camera, atP) || { fade: smoothstep(13.2, 14.8, t) };
    },
  };
}
