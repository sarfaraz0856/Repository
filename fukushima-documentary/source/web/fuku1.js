// FUKUSHIMA, chapter 1 – THE QUIET COAST. FK1: the plant on the Pacific coast from the air, an afternoon in March.
import * as THREE from 'three';
import { fovFromFocalH, easeInOutSine } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { sunDir } from './lib/daysky.js';
import { fukuWorld, V3 } from './lib/fuku.js';

export function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
export const MARCH_SKY = { uZenith: [0.1, 0.2, 0.42], uHorizon: [0.55, 0.6, 0.68], uCloudBright: [1.15, 1.12, 1.08], uCloudShade: [0.45, 0.48, 0.55], uCloudCover: 0.55, uCloudScale: 1.2, uSunCol: [1.2, 1.05, 0.9] };
export const SUN_1446 = sunDir(222, 33);

export async function FK1(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1446, sky: MARCH_SKY, fog: 0.00016, sunI: 4.2, hemiI: 0.9 });
  const { scene, camera, ocean } = W;
  const A = V3(820, 210, 640), B = V3(700, 185, 560);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 1.0, uBloom: 0.05, uHalation: 0.05, uVignette: 0.45, uGrain: 0.035 },
    update(t) {
      const k = easeInOutSine(t / 14);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-200, 60, -120), { focal: 30, shake: 0.03, shakeFreq: 0.25, t, seed: 11 });
      return dcam(ctx, camera) || {};
    },
  };
}

// FK1B: along the row of units 1-4 from the shore road, the cloud-painted reactor buildings in afternoon light
export async function FK1B(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1446, sky: MARCH_SKY, fog: 0.00016, sunI: 4.2, hemiI: 0.9 });
  const { scene, camera } = W;
  const A = V3(70, 22, 380), B = V3(55, 22, 335);
  return { scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 1.0, uBloom: 0.05, uHalation: 0.05, uVignette: 0.5, uGrain: 0.035 },
    update(t) { placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-90, 34, 60), { focal: 32, shake: 0.03, shakeFreq: 0.3, t, seed: 12 }); return dcam(ctx, camera) || {}; } };
}
// FK1C: the plant from the sea, at the height of a fishing boat
export async function FK1C(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1446, sky: MARCH_SKY, fog: 0.00018, sunI: 4.2, hemiI: 0.9 });
  const { scene, camera } = W;
  const A = V3(760, 7, 220), B = V3(700, 7.5, 160);
  return { scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 1.0, uBloom: 0.05, uHalation: 0.05, uVignette: 0.5, uGrain: 0.035 },
    update(t) { placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-100, 30, 40), { focal: 45, roll: Math.sin(t * 0.7) * 0.6, shake: 0.15, shakeFreq: 0.35, t, seed: 13 }); return dcam(ctx, camera) || {}; } };
}
// FK1D: a slow push towards the unit 4 refuelling floor, where its fuel sat in the pool
export async function FK1D(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1446, sky: MARCH_SKY, fog: 0.00016, sunI: 4.2, hemiI: 0.9 });
  const { scene, camera } = W;
  const A = V3(120, 70, 330), B = V3(40, 62, 280);
  return { scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 1.0, uBloom: 0.05, uHalation: 0.05, uVignette: 0.55, uGrain: 0.035 },
    update(t) { placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-95, 45, 210), { focal: 40, shake: 0.03, shakeFreq: 0.25, t, seed: 14 }); return dcam(ctx, camera) || {}; } };
}
