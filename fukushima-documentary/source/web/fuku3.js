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
