// Plant shots: S2 calm reactor, S3 explosion, S4 burning ruin, S10 final wide.
import * as THREE from 'three';
import { makeSky, patchMaterial, ATM } from './lib/atmos.js';
import { VolumeFX } from './lib/volume.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOut, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildCity, buildForest } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { Flames, Debris, Embers, glowColumn } from './lib/fx.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const MOON_DIR = V3(0.615, 0.292, 0.733).normalize();
const L = (x, y, z) => V3(x, y, z).add(PLANT); // plant-local -> world

export function placeCamera(camera, ctx, pos, target, { focal, roll = 0, shake = 0, shakeFreq = 0.6, t = 0, seed = 1, jolt = 0, joltFreq = 9 } = {}) {
  camera.position.copy(pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  const D = THREE.MathUtils.degToRad;
  let yaw = 0, pitch = 0, rl = roll;
  if (shake) { yaw += fbm1(t * shakeFreq, seed, 3) * shake; pitch += fbm1(t * shakeFreq, seed + 9, 3) * shake * 0.8; rl += fbm1(t * shakeFreq * 0.8, seed + 19, 3) * shake * 0.5; }
  if (jolt) { yaw += fbm1(t * joltFreq, seed + 101, 2) * jolt; pitch += fbm1(t * joltFreq, seed + 111, 2) * jolt * 1.2; rl += fbm1(t * joltFreq, seed + 121, 2) * jolt * 0.6; }
  camera.rotateY(D(yaw)); camera.rotateX(D(pitch)); camera.rotateZ(D(rl));
  if (focal) { camera.fov = fovFromFocalH(focal, ctx.aspect); camera.updateProjectionMatrix(); }
}

// Roof / ruin fire locations (plant local)
export const FIRE_SPOTS = [
  // ruin of the central hall
  { pos: [-8, 48.5, 0], w: 12, h: 24 }, { pos: [6, 48.5, 12], w: 14, h: 30 }, { pos: [14, 48, -12], w: 10, h: 20 }, { pos: [-16, 49, 20], w: 9, h: 16 }, { pos: [2, 49, -2], w: 18, h: 36 },
  // east side rubble
  { pos: [40, 2, 10], w: 6, h: 8 }, { pos: [44, 1, -14], w: 5, h: 7 },
  // turbine hall roof near unit 4
  { pos: [10, 31.5, -60], w: 8, h: 11 }, { pos: [-14, 31.5, -76], w: 10, h: 13 }, { pos: [28, 31.5, -84], w: 6, h: 9 }, { pos: [-34, 31.5, -58], w: 7, h: 10 }, { pos: [-60, 31.5, -80], w: 6, h: 8 }, { pos: [48, 31.5, -66], w: 5, h: 7 },
  // block V / unit 3 roof
  { pos: [-52, 44.5, -12], w: 7, h: 9 }, { pos: [-70, 44.5, 18], w: 6, h: 8 }, { pos: [-96, 47.8, -20], w: 5, h: 7 },
  // deaerator stack roof
  { pos: [-6, 49.2, -40], w: 6, h: 8 }, { pos: [22, 49.2, -38], w: 5, h: 7 },
];

export async function plantWorld(ctx, opts = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(opts.focal || 50, ctx.aspect), ctx.aspect, opts.near ?? 2, opts.far ?? 16000);
  const sky = makeSky({ noiseTex: ctx.noiseTex });
  scene.add(sky);
  ATM.uMoonDir.value.copy(MOON_DIR);
  const plant = buildPlant(ctx, { glowSize: opts.glowSize ?? 1.2 });
  scene.add(plant.root);
  plant.ground.position.copy(PLANT).setY(0.02);
  scene.add(plant.ground);
  if (opts.city) {
    const city = buildCity(ctx, { litFrac: opts.cityLit ?? 0.07 });
    city.group.traverse(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width > 10000) o.visible = false; });
    scene.add(city.group);
  }
  const forest = buildForest(ctx, { center: [PLANT.x - 900, PLANT.z - 700], radius: 2400, count: 18000, exclude: [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1100], [PLANT.x + 400, PLANT.z + 420, 120]] });
  scene.add(forest);
  // lamp lightmap of the plant grounds
  ATM.uLampMap.value = plant.lampTex; ATM.uLampMapOn.value = 1; ATM.uLampGain.value = opts.lampGain ?? 5.0;
  ATM.uLampBounds.value.set(plant.lampBounds.x0, plant.lampBounds.z0, plant.lampBounds.size, plant.lampBounds.size);
  // moon
  const moon = new THREE.DirectionalLight(new THREE.Color(0.62, 0.72, 1.0), opts.moon ?? 0.3);
  moon.position.copy(L(0, 0, 0)).addScaledVector(MOON_DIR, 3000); moon.target.position.copy(L(-60, 0, -40));
  moon.castShadow = true; moon.shadow.mapSize.set(4096, 4096);
  const sc = moon.shadow.camera; sc.left = -700; sc.right = 700; sc.top = 700; sc.bottom = -700; sc.near = 1000; sc.far = 5000;
  moon.shadow.bias = -0.0009; moon.shadow.normalBias = 1.6;
  scene.add(moon, moon.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.08, 0.1, 0.16), new THREE.Color(0.02, 0.018, 0.015), 0.3));
  // sodium floodlights on unit 3/4 facades
  const floods = [];
  for (const [pos, tgt, I] of [[[150, 24, 120], [20, 40, 20], 1800000], [[-40, 24, 150], [-50, 40, 30], 1400000], [[170, 24, -125], [60, 20, -80], 1200000], [[110, 24, -190], [-40, 25, -100], 1200000]]) {
    const sp = new THREE.SpotLight(new THREE.Color(1.0, 0.55, 0.2), I * (opts.floodGain ?? 1) / 220, 0, THREE.MathUtils.degToRad(26), 0.7, 2);
    sp.position.copy(L(...pos)); sp.target.position.copy(L(...tgt));
    scene.add(sp, sp.target); floods.push(sp);
  }
  // atmosphere defaults near the plant
  ATM.uFogColor.value.setRGB(0.004, 0.0055, 0.0095);
  ATM.uFogDensity.value = opts.fog ?? 0.0007; ATM.uFogHeight.value = 200; ATM.uFogBase.value = 0;
  ATM.uMoonHalo.value.setRGB(0.01, 0.012, 0.018);
  ATM.uGlowCol.value.setRGB(0, 0, 0);
  sky.uniforms.uCloudCover.value = 0.72; sky.uniforms.uCloudLit.value.setRGB(0.016, 0.019, 0.027); sky.uniforms.uMoonCol.value.setRGB(0.22, 0.24, 0.28);
  return { scene, camera, sky, plant, moon, floods };
}

// Fire setup shared by burning shots
export function addFire(ctx, W, { flames = true, embers = true, plume = true, glow = true, fireGain = 1, emberCount = 700, plumeDensity = 1.1, fireLight = 1, roofFires = true, boxMin = [-380, 20, -420], boxMax = [200, 600, 160], steps = 72 } = {}) {
  const { scene, plant } = W;
  const out = {};
  const spots = FIRE_SPOTS.filter((f, i) => roofFires || i < 7);
  if (flames) {
    out.flames = new Flames(ctx, spots.map((f, i) => ({ pos: L(...f.pos).toArray(), w: f.w, h: f.h, seed: i * 3.17, gain: fireGain })));
    scene.add(out.flames.mesh);
  }
  // key fire lights
  out.fireLight = new THREE.PointLight(new THREE.Color(1.0, 0.45, 0.14), 0, 0, 2);
  out.fireLight.position.copy(L(2, 60, 4));
  scene.add(out.fireLight);
  out.roofLight = new THREE.PointLight(new THREE.Color(1.0, 0.42, 0.12), 0, 0, 2);
  out.roofLight.position.copy(L(0, 40, -70));
  if (roofFires) scene.add(out.roofLight);
  if (plume) {
    out.vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: L(...boxMin).toArray(), boxMax: L(...boxMax).toArray(), steps, shadowSteps: 4, albedo: 0.42 });
    scene.add(out.vol.mesh);
  }
  if (embers) {
    out.embers = new Embers(ctx, { n: emberCount, sources: spots.map(f => ({ pos: L(...f.pos).toArray(), r: f.w * 0.5 })), rise: [4, 12], life: [3, 9], wind: [-1.5, 0, -2], size: [0.06, 0.2], gain: 1.4, swirl: 4 });
    scene.add(out.embers.mesh);
  }
  
  out.update = (t, camera, { gain = 1, plumeH = 520, column = 0.06, emberGain = 1, flameGain = 1, groundSmoke = null, volMoon = [0.012, 0.015, 0.022], volAmb = [0.0015, 0.0018, 0.003] } = {}) => {
    const fl = 0.85 + 0.15 * fbm1(t * 3.1, 7, 3) + 0.08 * fbm1(t * 9, 3, 2);
    out.fireLight.intensity = 11000 * gain * fireLight * fl;
    out.roofLight.intensity = 5000 * gain * fireLight * (0.85 + 0.15 * fbm1(t * 2.7, 13, 3));
    if (out.flames) out.flames.uniforms.uGain.value = flameGain;
    if (out.vol) {
      out.vol.setPlumes([
        { base: L(0, 46, 4).toArray(), r0: 13, spread: 0.3, height: plumeH, density: plumeDensity, rise: 9, wind: [-0.32, -0.42], noiseScale: 1 / 75, fireH: 18, fireEmis: 7 * gain, seed: 0.2 },
        { base: L(-10, 31, -66).toArray(), r0: 9, spread: 0.35, height: Math.min(plumeH, 260), density: 0.6 * plumeDensity, rise: 6, wind: [-0.4, -0.35], noiseScale: 1 / 50, fireH: 6, fireEmis: 3 * gain, seed: 0.7 },
      ]);
      out.vol.setLighting({ firePos: L(2, 50, 4).toArray(), fireCol: [7 * gain * fl, 2.3 * gain * fl, 0.6 * gain * fl], fireR: 30, fireShadowLen: 160,
        moonDir: MOON_DIR.toArray(), moonCol: volMoon, ambTop: volAmb, ambBot: [0.006, 0.0025, 0.001], ext: 0.07, minStep: 2.5 });
      out.vol.update(t, Math.round(t * 24), camera);
    }
    if (out.embers) out.embers.update(t, camera, { gain: emberGain });
    if (out.column) out.column.uniforms.uGain.value = column;
    if (out.vol && groundSmoke) out.vol.setGround(groundSmoke);
    // fog glow from the fire
    ATM.uFirePos.value.copy(L(0, 60, 4));
    ATM.uFireFog.value.setRGB(0.009 * gain * fl, 0.0033 * gain * fl, 0.0009 * gain * fl);
    ATM.uFireFogR.value = 60;
  };
  return out;
}

// ---------------- S2: the plant, minutes before ----------------
export async function S2(ctx) {
  const W = await plantWorld(ctx, { focal: 45, city: false, fog: 0.0008 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, {});
  // steam from the deaerator / turbine roof vents
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: L(-140, 30, -130).toArray(), boxMax: L(120, 230, 40).toArray(), steps: 48, shadowSteps: 2, albedo: 0.92 });
  scene.add(vol.mesh);
  sky.uniforms.uSkyGlowDir.value.set(-0.7, 0, -0.7).normalize(); sky.uniforms.uSkyGlowCol.value.setRGB(0.012, 0.007, 0.004);
  return {
    scene, camera, look: { uExposure: 1.45, uLookPow: 1.3, uLookSat: 1.05, uBloom: 0.07, uVignette: 0.62 },
    update(t) {
      const u = t / 4.5;
      const p = L(420, 14, -380).lerp(L(405, 14, -366), easeInOutSine(u));
      placeCamera(camera, ctx, p, L(-60, 62, -20), { focal: 45, shake: 0.05, shakeFreq: 0.4, t, seed: 21 });
      vol.setPlumes([
        { base: L(-20, 49, -38).toArray(), r0: 3, spread: 0.35, height: 150, density: 0.35, rise: 5, wind: [-0.6, -0.2], noiseScale: 1 / 22, seed: 0.3 },
        { base: L(-120, 33, -70).toArray(), r0: 2.5, spread: 0.4, height: 120, density: 0.25, rise: 4, wind: [-0.5, -0.3], noiseScale: 1 / 18, seed: 0.6 },
      ]);
      vol.setLighting({ firePos: L(150, 24, 120).toArray(), fireCol: [0.25, 0.12, 0.04], fireR: 120, fireShadowLen: 60, moonDir: MOON_DIR.toArray(), moonCol: [0.02, 0.024, 0.032], ambTop: [0.003, 0.0035, 0.005], ambBot: [0.004, 0.003, 0.0025], ext: 0.08, minStep: 1.2 });
      vol.setLights([{ pos: L(170, 24, -125).toArray(), range: 90, color: [0.35, 0.17, 0.05], cone: -2 }, { pos: L(110, 24, -190).toArray(), range: 90, color: [0.35, 0.17, 0.05], cone: -2 }]);
      vol.update(t, Math.round(t * 24), camera);
      return {};
    },
  };
}

// ---------------- S3: the explosion ----------------
export async function S3(ctx) {
  const W = await plantWorld(ctx, { focal: 30, city: true, fog: 0.00065 });
  const { scene, camera, plant, sky } = W;
  const tPre = 1.55, tExp = 2.85;
  const fire = addFire(ctx, W, { emberCount: 500, plumeDensity: 1.0 });
  // explosion-specific: flash light, fireball and debris
  const flash = new THREE.PointLight(new THREE.Color(1.0, 0.66, 0.38), 0, 0, 2);
  flash.position.copy(L(0, 66, 4)); scene.add(flash);
  const landY = (x, z) => {
    const lx = x - PLANT.x, lz = z - PLANT.z;
    if (lx > -560 && lx < 90 && lz > -96 && lz < -44) return 31;
    if (lx > -36 && lx < 36 && lz > -32 && lz < 40) return 47.5;
    if (lx > -152 && lx < -36 && lz > -32 && lz < 40) return 44;
    return 0.3;
  };
  const debris = new Debris(ctx, { n: 800, origin: L(0, 62, 4), tExp, speed: [14, 75], spread: 1.25, drag: 0.3, landY, gain: 4.5, life: [5, 16], size: [0.7, 2.4], bias: [0.35, -0.1, -0.3] });
  scene.add(debris.mesh);
  const sparks = new Debris(ctx, { n: 900, origin: L(0, 64, 4), tExp: tExp + 0.02, seed: 21, speed: [40, 140], spread: 1.35, drag: 0.9, landY, gain: 6, life: [0.6, 2.4], size: [0.25, 0.6] });
  scene.add(sparks.mesh);
  // fires start as burning debris lands
  if (fire.flames) fire.flames.list.forEach((f, i) => fire.flames.setBorn(i, tExp + 0.35 + (i % 7) * 0.22 + (i > 6 ? 0.6 : 0)));
  sky.uniforms.uSkyGlowDir.value.set(-0.6, 0, -0.8).normalize();
  return {
    scene, camera, look: { uExposure: 1.35, uLookPow: 1.28, uLookSat: 1.05, uBloom: 0.08, uHalation: 0.12, uVignette: 0.6 },
    update(t) {
      const tau = t - tExp, tp = t - tPre;
      plant.setState(t, { tExp, tPre });
      // camera: tripod-like on the canal bank, shock arrives ~0.6 s after the flash
      const ts = tau - 0.6;
      const jolt = ts > 0 ? 1.6 * Math.exp(-ts / 0.55) : 0;
      const jolt1 = (tp - 0.45) > 0 && tau < 0 ? 0.35 * Math.exp(-(tp - 0.45) / 0.4) : 0;
      placeCamera(camera, ctx, L(470, 13, 560), L(-20, 82, -10), { focal: 30, shake: 0.06, shakeFreq: 0.5, t, seed: 31, jolt: jolt + jolt1, joltFreq: 11 });
      // light: first explosion (steam) glow, then the main flash
      const pre = tp > 0 ? Math.exp(-tp / 0.18) * 0.35 + Math.exp(-tp / 0.9) * 0.05 : 0;
      const fl = tau > 0 ? (Math.exp(-tau / 0.09) * 1.0 + Math.exp(-tau / 0.5) * 0.3 + Math.exp(-tau / 2.5) * 0.06) : 0;
      flash.intensity = (pre + fl) * 2.6e6;
      const burn = smoothstep(0.2, 3.0, tau);
      fire.update(t, camera, { gain: tau > 0 ? 0.35 + 0.65 * burn : 0, plumeH: tau > 0 ? Math.min(30 + 150 * tau, 520) : 0.01, column: 0, emberGain: burn, flameGain: 1 });
      // fireball and steam puff via plume slot 3
      const v = fire.vol;
      if (tau > 0) {
        const R = 5 + 32 * (1 - Math.exp(-tau / 0.2));
        v.setFireball({ center: L(0, 60 + 22 * (1 - Math.exp(-tau / 0.7)) + 7 * tau, 4).toArray(), radius: R, density: 0.45 + 0.9 * smoothstep(0.1, 2.0, tau), temp: 0.95 * Math.exp(-tau / 1.1) + 0.12, emis: 120 * Math.exp(-tau / 0.7) + 6 });
      } else v.setFireball(null);
      const plumes = v.uniforms.uPlumes.value;
      if (tp > 0 && tau < 6) {
        const k = 1 - Math.exp(-tp / 0.35);
        v.uniforms.uPlumes.value = plumes + 0; // keep 2 fire plumes; add steam puff
        const i = 2;
        v.uniforms.uPlumes.value = 3;
        v.uniforms.uPA.value[i].set(...L(0, 70, 4).toArray(), 10);
        v.uniforms.uPB.value[i].set(0.45, 15 + 75 * k, 0.9 * Math.exp(-Math.max(tau, 0) / 2.5), 14);
        v.uniforms.uPC.value[i].set(-0.3, 0, -0.3, 1 / 26);
        v.uniforms.uPD.value[i].set(0, 0, 0, 0.9);
      }
      if (tau <= 0) { // before the main blast: only the steam puff (if any)
        v.uniforms.uPB.value[0].z = 0; v.uniforms.uPB.value[1].z = 0;
        if (tp > 0) { v.uniforms.uPlumes.value = 3; v.uniforms.uPD.value[0].y = 0; v.uniforms.uPD.value[1].y = 0; }
      }
      v.setLights([{ pos: L(0, 66, 4).toArray(), range: 120, color: [(pre + fl) * 30, (pre + fl) * 19, (pre + fl) * 10], cone: -2 }]);
      ATM.uFireFog.value.setRGB(ATM.uFireFog.value.r + (pre + fl) * 0.05, ATM.uFireFog.value.g + (pre + fl) * 0.032, ATM.uFireFog.value.b + (pre + fl) * 0.016);
      debris.update(t, camera); sparks.update(t, camera);
      return {};
    },
  };
}

// ---------------- S4: the burning ruin ----------------
export async function S4(ctx) {
  const W = await plantWorld(ctx, { focal: 55, city: false, fog: 0.0009, moon: 0.1, floodGain: 0.5 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, { destroyed: true });
  const fire = addFire(ctx, W, { emberCount: 900 });
  sky.uniforms.uSkyGlowDir.value.set(-0.6, 0, -0.8).normalize(); sky.uniforms.uSkyGlowCol.value.setRGB(0.06, 0.02, 0.006);
  return {
    scene, camera, look: { uExposure: 1.0, uLookPow: 1.22, uLookSat: 1.05, uBloom: 0.08, uHalation: 0.14, uVignette: 0.62 },
    update(t) {
      const u = t / 4;
      const p = L(205, 16, 225).lerp(L(196, 17, 214), easeInOutSine(u));
      placeCamera(camera, ctx, p, L(-5, 62, -5), { focal: 55, shake: 0.35, shakeFreq: 0.9, t, seed: 41 });
      fire.update(t + 20, camera, { gain: 1, plumeH: 520, column: 0.06, groundSmoke: { center: L(60, 0, 80).toArray(), radius: 260, height: 14, density: 0.5, noiseScale: 1 / 45, drift: [-3, 0.4, -2] } });
      const dbg = new URLSearchParams(location.search).get('dbg') || '';
      if (dbg.includes('nofire')) { fire.fireLight.intensity = 0; fire.roofLight.intensity = 0; }
      if (dbg.includes('noflood')) W.floods.forEach(f => f.intensity = 0);
      if (dbg.includes('nomoon')) W.moon.intensity = 0;
      if (dbg.includes('nolamp')) ATM.uLampGain.value = 0;
      if (dbg.includes('nofog')) { ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uFogDensity.value = 0; }
      return {};
    },
  };
}

// ---------------- S10: final wide, the ruin in darkness ----------------
export async function S10(ctx) {
  const W = await plantWorld(ctx, { focal: 100, city: true, fog: 0.0008, floodGain: 0.0, lampGain: 0.6, moon: 0.12 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, { destroyed: true });
  const fire = addFire(ctx, W, { emberCount: 300, roofFires: false, fireLight: 0.6, plumeDensity: 1.2 });
  sky.uniforms.uSkyGlowDir.value.set(-0.6, 0, -0.8).normalize(); sky.uniforms.uSkyGlowCol.value.setRGB(0.016, 0.007, 0.003);
  plant.glowMat.uniforms.uGain.value = 0.25;
  return {
    scene, camera, look: { uExposure: 1.25, uLookPow: 1.3, uLookSat: 0.95, uBloom: 0.08, uHalation: 0.12, uVignette: 0.7 },
    update(t) {
      const u = t / 8;
      const p = L(760, 30, 700).lerp(L(700, 32, 745), easeInOutSine(u));
      placeCamera(camera, ctx, p, L(-40, 120, -40), { focal: 85, shake: 0.03, shakeFreq: 0.3, t, seed: 101 });
      fire.update(t + 300, camera, { gain: 0.7, plumeH: 540, column: 0, flameGain: 0.8, volMoon: [0.035, 0.04, 0.05], volAmb: [0.003, 0.0035, 0.0055] });
      ATM.uFireFog.value.multiplyScalar(0.5);
      return {};
    },
  };
}
