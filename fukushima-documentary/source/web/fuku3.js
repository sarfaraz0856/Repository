// FUKUSHIMA, chapter 3 – THE WAVE. FK3A: the sea draws back, then the wall of water comes in over the breakwater.
import * as THREE from 'three';
import { easeInOutSine, smoothstep, lerp } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { sunDir } from './lib/daysky.js';
import { fukuWorld, V3 } from './lib/fuku.js';
import { dcam, MARCH_SKY } from './fuku1.js';

export const SUN_1535 = sunDir(232, 25);
export const STORM_SKY = Object.assign({}, MARCH_SKY, { uZenith: [0.1, 0.13, 0.2], uHorizon: [0.4, 0.42, 0.45], uCloudCover: 0.85, uCloudBright: [0.85, 0.85, 0.87], uCloudShade: [0.18, 0.19, 0.22], uSunCol: [0.5, 0.45, 0.4] });

export function tsunamiState(ocean, t, { x0 = 2600, x1 = -60, t0 = 0, t1 = 14, H = 14 } = {}) {
  const k = smoothstep(t0, t1, t) ;
  ocean.uniforms.uTsuX.value = lerp(x0, x1, k);
  ocean.uniforms.uTsuH.value = H;
  ocean.uniforms.uTsuW.value = 60;
  ocean.uniforms.uDraw.value = 3.5;
  ocean.uniforms.uFoam.value = 1;
  ocean.uniforms.uChop.value = 1.6;
}

export async function FK3A(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1535, sky: STORM_SKY, fog: 0.00022, fogColor: [0.34, 0.36, 0.39], sunI: 1.6, hemiI: 1.1, sunCol: [0.85, 0.8, 0.75] });
  const { scene, camera, ocean } = W;
  const A = V3(-6, 13.6, 262), B = V3(-5, 13.4, 258);
  return {
    scene, camera,
    look: { uExposure: 1.25, uLookPow: 1.22, uLookSat: 0.85, uBloom: 0.04, uHalation: 0.05, uVignette: 0.6, uGrain: 0.05 },
    update(t) {
      tsunamiState(ocean, t, { x0: 2400, x1: -40, t0: 0, t1: 15 });
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 16)), V3(600, 24, 40), { focal: 20, shake: 0.12 + 0.6 * smoothstep(10, 15, t), shakeFreq: 0.5, t, seed: 31 });
      return dcam(ctx, camera) || {};
    },
  };
}

// FK3B: from high over the sea to the north, the white line of the wave reaches the breakwater
export async function FK3B(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1535, sky: STORM_SKY, fog: 0.0002, fogColor: [0.34, 0.36, 0.39], sunI: 1.6, hemiI: 1.1, sunCol: [0.85, 0.8, 0.75] });
  const { scene, camera, ocean } = W;
  const A = V3(700, 260, -900), B = V3(620, 230, -820);
  return { scene, camera,
    look: { uExposure: 1.25, uLookPow: 1.22, uLookSat: 0.85, uBloom: 0.04, uHalation: 0.05, uVignette: 0.6, uGrain: 0.05 },
    update(t) {
      tsunamiState(ocean, t, { x0: 1900, x1: 120, t0: 0, t1: 18 });
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(150, 0, 80), { focal: 28, shake: 0.08, shakeFreq: 0.4, t, seed: 32 });
      return dcam(ctx, camera) || {};
    } };
}
// FK3C: on the site behind the turbine halls: the sea pours between the buildings
export async function FK3C(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1535, sky: STORM_SKY, fog: 0.00025, fogColor: [0.34, 0.36, 0.39], sunI: 1.6, hemiI: 1.1, sunCol: [0.85, 0.8, 0.75] });
  const { scene, camera, ocean } = W;
  const A = V3(-140, 22, 255), B = V3(-138, 21, 250);
  return { scene, camera,
    look: { uExposure: 1.25, uLookPow: 1.22, uLookSat: 0.85, uBloom: 0.04, uHalation: 0.05, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      tsunamiState(ocean, t, { x0: 300, x1: -400, t0: 0, t1: 16, H: 14.5 });
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-20, 12, 240), { focal: 24, shake: 0.2 + 0.4 * smoothstep(3, 8, t), shakeFreq: 0.6, t, seed: 33 });
      return dcam(ctx, camera) || {};
    } };
}
// FK3D: after the wave: the site under water, the sea still running back out over the breakwater
export async function FK3D(ctx) {
  const W = fukuWorld(ctx, { sun: SUN_1535, sky: STORM_SKY, fog: 0.00028, fogColor: [0.32, 0.34, 0.37], sunI: 1.4, hemiI: 1.0, sunCol: [0.85, 0.8, 0.75] });
  const { scene, camera, ocean } = W;
  const A = V3(380, 120, 420), B = V3(330, 105, 380);
  return { scene, camera,
    look: { uExposure: 1.2, uLookPow: 1.22, uLookSat: 0.8, uBloom: 0.04, uHalation: 0.05, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      ocean.uniforms.uTsuX.value = -900; ocean.uniforms.uTsuH.value = 12.2 - 2.0 * smoothstep(0, 18, t); ocean.uniforms.uTsuW.value = 60;
      ocean.uniforms.uDraw.value = 0; ocean.uniforms.uFoam.value = 1; ocean.uniforms.uChop.value = 1.8;
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-60, 8, 80), { focal: 30, shake: 0.06, shakeFreq: 0.3, t, seed: 34 });
      return dcam(ctx, camera) || {};
    } };
}
