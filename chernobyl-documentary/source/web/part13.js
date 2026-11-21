// EPILOGUE: the arch under the stars, and Pripyat from the air at night, the same flight as the
// film's first shot, now over a dark city lost in the forest.
import * as THREE from 'three';
import { ATM, makeSky } from './lib/atmos.js';
import { fovFromFocalH, smoothstep, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest, buildCity, generateLayout } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { placeCamera, plantWorld, MOON_DIR } from './shots_plant.js';
import { debugCam } from './part2.js';
import { sarcophagus } from './part3.js';
import { makeArch } from './lib/arch.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const atP = (s, l, y = 0) => P(s, y, l);
const FEX = [[0, 0, 1350], [PLANT.x - 150, PLANT.z, 760], [PLANT.x + 1000, PLANT.z + 1100, 520], [PLANT.x + 900, PLANT.z + 1900, 1100], [PLANT.x + 400, PLANT.z + 420, 120]];

// a field of stars on a large sphere around the set
function stars(center, n = 6000, R = 9000, seed = 7) {
  const rnd = mulberry32(seed); const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = rnd(), v = 0.04 + rnd() * 0.96; const th = u * Math.PI * 2, ph = Math.asin(v);
    pos.set([center.x + Math.cos(th) * Math.cos(ph) * R, center.y + Math.sin(ph) * R, center.z + Math.sin(th) * Math.cos(ph) * R], i * 3);
    const b = Math.pow(rnd(), 6) * 6 + 0.25; const w = rnd();
    col.set([b * (0.85 + 0.15 * w), b * 0.92, b * (1.05 - 0.15 * w)], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false });
  const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
}

// ---------------- AB1: the arch over Unit 4, under the stars ----------------
export async function AB1(ctx) {
  const W = await plantWorld(ctx, { focal: 35, city: false, fog: 0.0004, floodGain: 0.0, lampGain: 3.0, moon: 0.25, near: 1 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0;
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  plant.root.children.forEach(o => { if (o.isGroup && Math.abs(o.position.x + 58) < 0.1 && Math.abs(o.position.z - 4) < 0.1) o.visible = false; });
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  const arch = makeArch({}); arch.group.position.copy(P(13, 3, 0)); scene.add(arch.group);
  // the arch is lit from below by a row of floodlights along its foot
  for (const z of [-140, 140]) for (const x of [-60, 13, 86]) { const sp = new THREE.SpotLight(new THREE.Color(0.85, 0.92, 1.0), 2.4e5 / 220, 0, THREE.MathUtils.degToRad(40), 0.8, 2); sp.position.copy(P(x, 4, z)); sp.target.position.copy(P(x, 70, z * 0.2)); scene.add(sp, sp.target); }
  sky.uniforms.uCloudCover.value = 0.12; sky.uniforms.uSkyGlowCol.value.setRGB(0, 0, 0);
  scene.add(stars(P(0, 0, 0)));
  const camA = P(-520, 6, 470), camB = P(-505, 6.5, 455);
  return {
    scene, camera,
    look: { uExposure: 1.6, uLookPow: 1.3, uLookSat: 0.85, uBloom: 0.08, uHalation: 0.12, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(0, lerp(70, 140, easeInOutSine(t / 15)), 0), { focal: 35, shake: 0.03, shakeFreq: 0.3, t, seed: 1811 });
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- AB2: the opening flight again: Pripyat at night, dark, in the forest ----------------
export async function AB2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(38, ctx.aspect), ctx.aspect, 3, 14000);
  const sky = makeSky({ noiseTex: ctx.noiseTex }); scene.add(sky);
  ATM.uMoonDir.value.copy(MOON_DIR);
  const layout = generateLayout(1986);
  const city = buildCity(ctx, { layout, litFrac: 0.0, lampsOff: true, spring: 1.0, facade: { broken: 0.4, entrGain: 0 } });
  scene.add(city.group);
  const ex = layout.buildings.map(b => [b.x, b.z, Math.max(b.w, b.d) * 0.55 + 4]).concat(FEX.slice(1));
  scene.add(buildForest(ctx, { center: [0, 0], radius: 1300, count: 60000, exclude: ex, seed: 71 }));
  scene.add(buildForest(ctx, { center: [1200, 1300], radius: 2600, count: 30000, exclude: FEX, seed: 72 }));
  const plant = buildPlant(ctx, {}); plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0; scene.add(plant.root);
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  plant.root.children.forEach(o => { if (o.isGroup && Math.abs(o.position.x + 58) < 0.1 && Math.abs(o.position.z - 4) < 0.1) o.visible = false; });
  const arch = makeArch({}); arch.group.position.copy(P(13, 3, 0)); scene.add(arch.group);
  const avM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.05, 0.02).multiplyScalar(80) });
  for (const p of plant.aviation || []) { if (Math.abs(p.x + 58) < 20) continue; const m = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), avM); m.position.copy(p).add(PLANT); scene.add(m); }
  const moon = new THREE.DirectionalLight(new THREE.Color(0.62, 0.72, 1.0), 0.35);
  moon.position.copy(V3(300, 0, 300)).addScaledVector(MOON_DIR, 3000); moon.target.position.set(300, 0, 300);
  moon.castShadow = true; moon.shadow.mapSize.set(4096, 4096);
  const sc = moon.shadow.camera; sc.left = -1500; sc.right = 1500; sc.top = 1500; sc.bottom = -1500; sc.near = 100; sc.far = 7000; moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.5;
  scene.add(moon, moon.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.1, 0.13, 0.2), new THREE.Color(0.03, 0.025, 0.02), 0.25));
  scene.add(stars(V3(0, 0, 0), 5000, 9000, 11));
  ATM.uFogColor.value.setRGB(0.0045, 0.006, 0.0105); ATM.uFogDensity.value = 0.00028; ATM.uFogHeight.value = 260; ATM.uFogBase.value = 0;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0.012, 0.014, 0.02); ATM.uLampGain.value = 0; ATM.uFirePos.value.set(0, -1e5, 0); ATM.uFireFog.value.setRGB(0, 0, 0);
  sky.uniforms.uSkyGlowCol.value.setRGB(0, 0, 0); sky.uniforms.uCloudCover.value = 0.25; sky.uniforms.uCloudLit.value.setRGB(0.018, 0.021, 0.03); sky.uniforms.uMoonCol.value.setRGB(0.22, 0.24, 0.28);
  const target0 = V3(PLANT.x - 200, 30, PLANT.z - 400);
  return {
    scene, camera,
    look: { uExposure: 1.8, uLookPow: 1.35, uLookSat: 0.9, uBloom: 0.06, uGrain: 0.05, uVignette: 0.62 },
    update(t) {
      // the same path as the film's first shot, flown more slowly
      const p = V3(-760, 172, -700).lerp(V3(-640, 160, -585), easeInOutSine(t / 15));
      placeCamera(camera, ctx, p, target0.clone().add(V3(0, -205, 0)), { focal: 38, shake: 0.12, shakeFreq: 0.35, t, seed: 3 });
      return debugCam(ctx, camera, (s, l, y = 0) => V3(s, y, l)) || { fade: smoothstep(13.0, 15.0, t) };
    },
  };
}
