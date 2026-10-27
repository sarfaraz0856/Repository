import * as THREE from 'three';
import { makeSky, patchMaterial, ATM } from './lib/atmos.js';
import { VolumeFX } from './lib/volume.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOut, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildCity, buildForest } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { S2, S3, S4, S10 } from './shots_plant.js';
import { PTEST } from './shots_people_test.js';
import { S5, S6, S7 } from './shots_fire.js';
import { S8, S9 } from './shots_after.js';
import { P1, P2, P3, P4, P5, P6, P7 } from './part2.js';
import { Q1, Q2, Q3, Q4, Q5 } from './part3.js';
import { R1, R2, R3, R4, R5 } from './part4.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const MOON_DIR = V3(0.615, 0.292, 0.733).normalize();

function baseScene(ctx, { focal = 35, near = 1, far = 15000 } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(focal, ctx.aspect), ctx.aspect, near, far);
  const sky = makeSky({ noiseTex: ctx.noiseTex });
  scene.add(sky);
  ATM.uMoonDir.value.copy(MOON_DIR);
  return { scene, camera, sky };
}

function moonLight(scene, { intensity = 0.5, shadow = false, center = V3(0, 0, 0), extent = 900, mapSize = 2048 } = {}) {
  const moon = new THREE.DirectionalLight(new THREE.Color(0.62, 0.72, 1.0), intensity);
  moon.position.copy(center).addScaledVector(MOON_DIR, 3000);
  moon.target.position.copy(center);
  scene.add(moon, moon.target);
  if (shadow) {
    moon.castShadow = true;
    moon.shadow.mapSize.set(mapSize, mapSize);
    const c = moon.shadow.camera; c.left = -extent; c.right = extent; c.top = extent; c.bottom = -extent; c.near = 100; c.far = 7000;
    moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.5; moon.shadow.radius = 2;
  }
  return moon;
}

// Camera helper: position/target + focal + handheld noise (deg) + roll
function placeCamera(camera, ctx, pos, target, { focal, roll = 0, shake = 0, shakeFreq = 0.6, t = 0, seed = 1, pos2 = 0 } = {}) {
  camera.position.copy(pos);
  if (pos2) camera.position.add(V3(fbm1(t * shakeFreq * 0.7, seed + 50, 2), fbm1(t * shakeFreq * 0.7, seed + 60, 2), fbm1(t * shakeFreq * 0.7, seed + 70, 2)).multiplyScalar(pos2));
  camera.lookAt(target);
  if (shake) {
    const yaw = fbm1(t * shakeFreq, seed, 3) * shake, pitch = fbm1(t * shakeFreq, seed + 9, 3) * shake * 0.8, rl = fbm1(t * shakeFreq * 0.8, seed + 19, 3) * shake * 0.6;
    camera.rotateY(THREE.MathUtils.degToRad(yaw)); camera.rotateX(THREE.MathUtils.degToRad(pitch)); camera.rotateZ(THREE.MathUtils.degToRad(rl + roll));
  } else if (roll) camera.rotateZ(THREE.MathUtils.degToRad(roll));
  if (focal) { camera.fov = fovFromFocalH(focal, ctx.aspect); camera.updateProjectionMatrix(); }
}

// ---------------- S1: aerial over Pripyat toward the plant ----------------
async function S1(ctx) {
  const { scene, camera, sky } = baseScene(ctx, { focal: 32, near: 3, far: 14000 });
  const city = buildCity(ctx, { litFrac: 0.075, spring: 0.35 });
  scene.add(city.group);
  const plant = buildPlant(ctx, {});
  scene.add(plant.root);
  plant.setState(0, {});
  const forest = buildForest(ctx, { center: [1200, 1300], radius: 2600, count: 26000, exclude: [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1000]] });
  scene.add(forest);
  moonLight(scene, { intensity: 0.32, shadow: true, center: V3(300, 0, 300), extent: 1500, mapSize: 4096 });
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.10, 0.13, 0.2), new THREE.Color(0.03, 0.025, 0.02), 0.25));
  // atmosphere
  ATM.uFogColor.value.setRGB(0.0045, 0.006, 0.0105);
  ATM.uFogDensity.value = 0.00028; ATM.uFogHeight.value = 260; ATM.uFogBase.value = 0;
  const toPlant = V3(PLANT.x, 0, PLANT.z).normalize();
  ATM.uGlowDir.value.copy(toPlant); ATM.uGlowCol.value.setRGB(0.018, 0.009, 0.004); ATM.uGlowPow.value = 10;
  ATM.uMoonHalo.value.setRGB(0.012, 0.014, 0.02);
  ATM.uLampGain.value = 6.0;
  sky.uniforms.uSkyGlowDir.value.copy(toPlant); sky.uniforms.uSkyGlowCol.value.setRGB(0.03, 0.014, 0.006); sky.uniforms.uSkyGlowPow.value = 6;
  sky.uniforms.uCloudCover.value = 0.7; sky.uniforms.uCloudLit.value.setRGB(0.018, 0.021, 0.03); sky.uniforms.uMoonCol.value.setRGB(0.22, 0.24, 0.28);
  const target0 = V3(PLANT.x - 200, 30, PLANT.z - 400);
  return {
    scene, camera,
    look: { uExposure: 1.3, uLookPow: 1.35, uLookSat: 1.1, uBloom: 0.06, uGrain: 0.05, uVignette: 0.6 },
    update(t) {
      const u = t / 9.5;
      const p = V3(-760, 172, -700).lerp(V3(-640, 160, -585), easeInOutSine(u));
      const tg = target0.clone().add(V3(0, -205, 0));
      placeCamera(camera, ctx, p, tg, { focal: 38, shake: 0.12, shakeFreq: 0.35, t, seed: 3 });
      return {};
    },
  };
}

async function testShot(ctx) {
  const { scene, camera, sky } = baseScene(ctx, { focal: 35, near: 1, far: 12000 });
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: [-250, 0, -800], boxMax: [250, 450, -250], steps: 64, shadowSteps: 4 });
  scene.add(vol.mesh);
  return { scene, camera, look: { uExposure: 1.6 }, update(t) { camera.position.set(0, 25, 200); camera.lookAt(0, 120, -500); vol.update(t, 0, camera); return {}; } };
}

export const SHOTS = {
  TEST: { duration: 2, build: testShot },
  PTEST: { duration: 2, build: PTEST },
  S1: { duration: 9.5, build: S1, ss: 2, msaa: 0, volScale: 0.25 },
  S2: { duration: 4.5, build: S2, ss: 1, msaa: 4, volScale: 0.5 },
  S3: { duration: 6.0, build: S3, ss: 1, msaa: 4, volScale: 0.4 },
  S4: { duration: 4.0, build: S4, ss: 1, msaa: 4, volScale: 0.4 },
  S5: { duration: 5.5, build: S5, ss: 1, msaa: 4, volScale: 0.35 },
  S6: { duration: 4.5, build: S6, ss: 1, msaa: 4, volScale: 0.35 },
  S7: { duration: 4.0, build: S7, ss: 1, msaa: 4, volScale: 0.35 },
  S8: { duration: 5.0, build: S8, ss: 1, msaa: 4, volScale: 0.4 },
  S9: { duration: 5.0, build: S9, ss: 1, msaa: 4, volScale: 0.4 },
  S10: { duration: 8.0, build: S10, ss: 1, msaa: 4, volScale: 0.4 },
  P1: { duration: 9.0, build: P1, ss: 2, msaa: 0, volScale: 0.35 },
  P2: { duration: 8.0, build: P2, ss: 2, msaa: 0, volScale: 0.3 },
  P3: { duration: 8.0, build: P3, ss: 2, msaa: 0, volScale: 0.4 },
  P4: { duration: 8.0, build: P4, ss: 1, msaa: 4, volScale: 0.3 },
  P5: { duration: 9.0, build: P5, ss: 1, msaa: 4, volScale: 0.3 },
  P6: { duration: 8.0, build: P6, ss: 1, msaa: 4, volScale: 0.3 },
  P7: { duration: 10.0, build: P7, ss: 1, msaa: 4, volScale: 0.3 },
  Q1: { duration: 11.0, build: Q1, ss: 1, msaa: 4, volScale: 0.4 },
  Q2: { duration: 9.0, build: Q2, ss: 1, msaa: 4, volScale: 0.35 },
  Q3: { duration: 13.0, build: Q3, ss: 1, msaa: 4, volScale: 0.3 },
  Q4: { duration: 11.0, build: Q4, ss: 1, msaa: 4, volScale: 0.3 },
  Q5: { duration: 15.0, build: Q5, ss: 1, msaa: 4, volScale: 0.3 },
  R1: { duration: 11.0, build: R1, ss: 1, msaa: 4, volScale: 0.35 },
  R2: { duration: 12.0, build: R2, ss: 1, msaa: 4, volScale: 0.3 },
  R3: { duration: 12.0, build: R3, ss: 1, msaa: 4, volScale: 0.5 },
  R4: { duration: 12.0, build: R4, ss: 1, msaa: 4, volScale: 0.3 },
  R5: { duration: 16.0, build: R5, ss: 1, msaa: 4, volScale: 0.4 },
};
