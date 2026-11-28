// FUKUSHIMA, chapter 5 – THE EXPLOSIONS. FK5A unit 1 (12 March, 15:36); FK5B unit 3 (14 March, 11:01), seen from the
// hills to the south like the TV camera that filmed them; FK5C the wrecked units from the air with steam rising.
import * as THREE from 'three';
import { VolumeFX } from './lib/volume.js';
import { easeInOutSine, smoothstep, lerp, clamp } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { sunDir } from './lib/daysky.js';
import { fukuWorld, V3, blowTop, UNITS, SITE_Y } from './lib/fuku.js';
import { dcam, MARCH_SKY } from './fuku1.js';

const GREY_SKY = Object.assign({}, MARCH_SKY, { uZenith: [0.22, 0.25, 0.3], uHorizon: [0.55, 0.57, 0.6], uCloudCover: 0.8, uCloudBright: [0.95, 0.95, 0.96], uCloudShade: [0.45, 0.46, 0.5] });
function smokeFX(ctx, scene, sun, box, { albedo = 0.6 } = {}) {
  const v = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: box[0], boxMax: box[1], steps: 96, shadowSteps: 4, albedo });
  scene.add(v.mesh);
  v.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: sun.toArray(), moonCol: [2.4, 2.3, 2.2], ambTop: [0.55, 0.58, 0.64], ambBot: [0.3, 0.3, 0.3], ext: 0.06, minStep: 1.5 });
  return v;
}
// an explosion that bursts sideways from the top of a building and then climbs as a column
function burst(u, te, t, { big = 1, dark = 0 } = {}) {
  const k = t - te; if (k < 0) return null;
  const grow = 1 - Math.exp(-k / (0.7 * big));
  return { base: [u.x, SITE_Y + u.h * 0.75, u.z], r0: (8 + 30 * big) * grow, spread: 0.55 + 0.25 * big, height: (25 + 230 * big) * smoothstep(0, 9 * big, k) + 15 * grow,
           density: (1.4 + dark) * (0.35 + 0.65 * Math.exp(-k / 14)), rise: 6 + 10 * big * Math.exp(-k / 4), wind: [0.35, -0.25], noiseScale: 1 / (18 + 14 * big), seed: 0.3 + big };
}
function explosionShot(unitIndex, { te = 4, big = 1, fireball = false, sun, cam, focal = 80 }) {
  return async (ctx) => {
    const W = fukuWorld(ctx, { sun, sky: GREY_SKY, fog: 0.0003, fogColor: [0.5, 0.52, 0.55], sunI: 2.0, hemiI: 1.3 });
    const { scene, camera, units, mats } = W;
    if (unitIndex === 2) blowTop(units[0], mats);         // unit 1 is already a ruin by the time unit 3 goes
    const u = units[unitIndex];
    const v = smokeFX(ctx, scene, sun, [[u.x - 500, 0, u.z - 700], [u.x + 500, 700, u.z + 300]]);
    let ruin = null;
    return { scene, camera,
      look: { uExposure: 1.15, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.06, uHalation: 0.08, uVignette: 0.55, uGrain: 0.05 },
      update(t) {
        if (t >= te && !ruin) ruin = blowTop(u, mats);
        if (t < te && ruin) { ruin.visible = false; u.top.visible = true; }
        if (ruin) ruin.visible = t >= te;
        const p = burst(u, te, t, { big, dark: fireball ? 0.6 : 0 });
        v.setPlumes(p ? [p] : []);
        v.setFireball(fireball && t >= te && t < te + 1.2 ? { center: [u.x, SITE_Y + u.h * 0.8, u.z], radius: 18 + 30 * (t - te), density: 1.5, temp: 1.2 * (1 - (t - te) / 1.2), emis: 6 } : null);
        v.update(t, Math.round(t * 24), camera);
        const jolt = smoothstep(te, te + 0.1, t) * (1 - smoothstep(te + 0.2, te + 1.5, t)) * 0.9;
        placeCamera(camera, ctx, cam[0].clone().lerp(cam[1], easeInOutSine(t / 18)), V3(u.x, SITE_Y + 40, u.z), { focal, shake: 0.12, shakeFreq: 0.4, jolt, t, seed: 50 + unitIndex });
        return dcam(ctx, camera) || {};
      } };
  };
}
export const FK5A = explosionShot(0, { te: 5, big: 0.75, sun: sunDir(240, 22), cam: [V3(-500, 95, 1700), V3(-495, 95, 1690)], focal: 95 });
export const FK5B = explosionShot(2, { te: 4, big: 1.4, fireball: true, sun: sunDir(160, 38), cam: [V3(-560, 95, 1750), V3(-555, 95, 1740)], focal: 85 });
// FK5C: the wrecked units 1, 3 and 4 from the air, steam still rising
export async function FK5C(ctx) {
  const sun = sunDir(150, 30);
  const W = fukuWorld(ctx, { sun, sky: GREY_SKY, fog: 0.0003, fogColor: [0.5, 0.52, 0.55], sunI: 2.0, hemiI: 1.3 });
  const { scene, camera, units, mats } = W;
  for (const i of [0, 2, 3]) blowTop(units[i], mats);
  const v = smokeFX(ctx, scene, sun, [[-400, 0, -300], [300, 400, 500]], { albedo: 0.75 });
  const A = V3(260, 170, 420), B = V3(210, 150, 330);
  return { scene, camera,
    look: { uExposure: 1.15, uLookPow: 1.2, uLookSat: 0.8, uBloom: 0.05, uHalation: 0.06, uVignette: 0.58, uGrain: 0.05 },
    update(t) {
      v.setPlumes([0, 1, 2].map(i => { const u = units[[0, 2, 1][i]]; return { base: [u.x, SITE_Y + u.h * 0.65, u.z], r0: 8, spread: 0.35, height: 90 + i * 20, density: 0.45, rise: 4, wind: [0.4, -0.3], noiseScale: 1 / 14, seed: i * 0.7 }; }));
      v.update(t, Math.round(t * 24), camera);
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-95, 30, 110), { focal: 34, shake: 0.06, shakeFreq: 0.3, t, seed: 55 });
      return dcam(ctx, camera) || {};
    } };
}
