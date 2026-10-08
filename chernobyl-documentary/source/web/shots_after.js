// Aftermath: S8 abandoned Pripyat yard and playground, S9 the Ferris wheel.
import * as THREE from 'three';
import { makeSky, patchMaterial, ATM } from './lib/atmos.js';
import { VolumeFX } from './lib/volume.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildCity, generateLayout } from './lib/city.js';
import { buildPlant, PLANT } from './lib/plant.js';
import { Dust } from './lib/fx.js';
import { placeCamera, MOON_DIR } from './shots_plant.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);

function paint(c, rough = 0.7, metal = 0.3, key = 'pg') { return patchMaterial(new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal }), { key }); }
function tube(a, b, r, m) { const d = b.clone().sub(a); const L = d.length(); const g = new THREE.CylinderGeometry(r, r, L, 8); const mesh = new THREE.Mesh(g, m); mesh.position.copy(a).add(b).multiplyScalar(0.5); mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); mesh.castShadow = true; return mesh; }

// Soviet playground: swings, carousel, arched climbing ladder, sandbox with "mushroom" canopy, slide
function playground(rnd) {
  const g = new THREE.Group();
  const red = paint(new THREE.Color(0.32, 0.05, 0.035), 0.75, 0.25, 'pgred');
  const yel = paint(new THREE.Color(0.42, 0.3, 0.05), 0.75, 0.25, 'pgyel');
  const blu = paint(new THREE.Color(0.06, 0.12, 0.26), 0.75, 0.25, 'pgblu');
  const steel = paint(new THREE.Color(0.22, 0.22, 0.21), 0.55, 0.6, 'pgsteel');
  const wood = paint(new THREE.Color(0.16, 0.1, 0.06), 0.9, 0.0, 'pgwood');
  // swings: A-frames at x=0 and x=3.2, top bar at 2.6 m
  const sw = new THREE.Group();
  for (const x of [0, 3.4]) { sw.add(tube(V3(x, 0, -1.1), V3(x, 2.6, 0), 0.045, blu)); sw.add(tube(V3(x, 0, 1.1), V3(x, 2.6, 0), 0.045, blu)); }
  sw.add(tube(V3(-0.1, 2.6, 0), V3(3.5, 2.6, 0), 0.05, blu));
  const seats = [];
  for (const x of [0.9, 2.5]) {
    const s = new THREE.Group(); s.position.set(x, 2.6, 0);
    s.add(tube(V3(-0.22, 0, 0), V3(-0.22, -2.05, 0), 0.008, steel)); s.add(tube(V3(0.22, 0, 0), V3(0.22, -2.05, 0), 0.008, steel));
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.24), wood); seat.position.set(0, -2.07, 0); seat.castShadow = true; s.add(seat);
    sw.add(s); seats.push(s);
  }
  sw.position.set(-6, 0, -3); sw.rotation.y = 0.3; g.add(sw);
  // carousel
  const car = new THREE.Group();
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 28), red); plat.position.y = 0.32; plat.castShadow = true; car.add(plat);
  car.add(tube(V3(0, 0, 0), V3(0, 0.95, 0), 0.06, steel));
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; const p0 = V3(Math.cos(a) * 1.35, 0.36, Math.sin(a) * 1.35); car.add(tube(p0, V3(Math.cos(a) * 0.3, 0.95, Math.sin(a) * 0.3), 0.025, yel)); }
  car.position.set(1.5, 0, 2.5); g.add(car);
  // arched climbing ladder
  const arch = new THREE.Group();
  for (const z of [-0.6, 0.6]) {
    const pts = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * i / 16; pts.push(V3(Math.cos(a) * 1.6, Math.sin(a) * 1.9, z)); }
    arch.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.035, 6), yel));
  }
  for (let i = 1; i < 16; i++) { const a = Math.PI * i / 16; arch.add(tube(V3(Math.cos(a) * 1.6, Math.sin(a) * 1.9, -0.6), V3(Math.cos(a) * 1.6, Math.sin(a) * 1.9, 0.6), 0.022, steel)); }
  arch.position.set(-1.5, 0, -7.5); arch.rotation.y = 0.15; g.add(arch);
  // sandbox + mushroom canopy
  const sb = new THREE.Group();
  for (const [x, z, w, d] of [[0, -1.5, 3.1, 0.12], [0, 1.5, 3.1, 0.12], [-1.5, 0, 0.12, 3.1], [1.5, 0, 0.12, 3.1]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), wood); b.position.set(x, 0.14, z); sb.add(b); }
  sb.add(tube(V3(0, 0, 0), V3(0, 2.1, 0), 0.06, steel));
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.7, 20, 1, true), red); cap.position.y = 2.35; cap.material.side = THREE.DoubleSide; cap.castShadow = true; sb.add(cap);
  sb.position.set(6, 0, -4); g.add(sb);
  // slide
  const sl = new THREE.Group();
  sl.add(tube(V3(0, 0, 0), V3(0, 2.0, 0), 0.04, steel)); sl.add(tube(V3(0.6, 0, 0), V3(0.6, 2.0, 0), 0.04, steel));
  for (let k = 1; k < 7; k++) sl.add(tube(V3(0, k * 0.3, 0), V3(0.6, k * 0.3, 0), 0.02, steel));
  const chute = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 3.3), blu); chute.position.set(0.3, 1.0, 1.55); chute.rotation.x = 0.66; chute.castShadow = true; sl.add(chute);
  sl.position.set(5, 0, 5); sl.rotation.y = -0.6; g.add(sl);
  // benches
  for (const [x, z, r] of [[-9, 4, 0.2], [9, 1.5, -1.2]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.4), wood); b.position.set(x, 0.45, z); b.rotation.y = r; g.add(b); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group: g, seats };
}

function ferrisWheel() {
  const g = new THREE.Group();
  const yel = paint(new THREE.Color(0.4, 0.28, 0.04), 0.7, 0.3, 'fwyel');
  const steel = paint(new THREE.Color(0.25, 0.25, 0.24), 0.6, 0.5, 'fwsteel');
  const R = 12.4, H = 14.2, W = 1.8;
  const wheel = new THREE.Group(); wheel.position.set(0, H, 0);
  for (const z of [-W / 2, W / 2]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.09, 6, 96), yel); rim.position.z = z; wheel.add(rim);
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(R * 0.82, 0.06, 6, 80), yel); rim2.position.z = z; wheel.add(rim2);
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; wheel.add(tube(V3(0, 0, z), V3(Math.cos(a) * R, Math.sin(a) * R, z), 0.05, yel)); }
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, b = (k + 1) * Math.PI / 8; wheel.add(tube(V3(Math.cos(a) * R * 0.82, Math.sin(a) * R * 0.82, z), V3(Math.cos(b) * R, Math.sin(b) * R, z), 0.035, yel)); }
  }
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; wheel.add(tube(V3(Math.cos(a) * R, Math.sin(a) * R, -W / 2), V3(Math.cos(a) * R, Math.sin(a) * R, W / 2), 0.04, yel)); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, W + 0.6, 16), steel); hub.rotation.x = Math.PI / 2; wheel.add(hub);
  // gondolas hang below the rim axles
  const gondolas = [];
  for (let k = 0; k < 16; k++) {
    const a = k * Math.PI / 8 + Math.PI / 16;
    const gd = new THREE.Group(); gd.position.set(Math.cos(a) * R, H + Math.sin(a) * R, 0);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.75, 1.2), yel); cab.position.y = -1.55; gd.add(cab);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.12, 12), yel); roof.position.y = -0.35; gd.add(roof);
    for (const [x, z] of [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.5], [0.55, 0.5]]) gd.add(tube(V3(x, -1.2, z), V3(x * 0.8, -0.35, z * 0.8), 0.02, steel));
    gd.add(tube(V3(0, 0, 0), V3(0, -0.35, 0), 0.03, steel));
    g.add(gd); gondolas.push(gd);
  }
  g.add(wheel);
  // A-frame supports on both sides
  for (const z of [-(W / 2 + 0.9), W / 2 + 0.9]) {
    g.add(tube(V3(-5.5, 0, z * 1.6), V3(0, H, z * 0.55), 0.18, steel));
    g.add(tube(V3(5.5, 0, z * 1.6), V3(0, H, z * 0.55), 0.18, steel));
    g.add(tube(V3(-3.3, H * 0.4, z * 1.25), V3(3.3, H * 0.4, z * 1.25), 0.08, steel));
  }
  const base = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 7), paint(new THREE.Color(0.2, 0.2, 0.19), 0.9, 0, 'fwbase')); base.position.y = 0.2; g.add(base);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group: g, gondolas };
}

async function aftermathWorld(ctx, { site, siteClear = 140, focal = 35, extraBuildings = [], near = 0.3, far = 9000 }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(focal, ctx.aspect), ctx.aspect, near, far);
  const sky = makeSky({ noiseTex: ctx.noiseTex });
  scene.add(sky);
  ATM.uMoonDir.value.copy(MOON_DIR);
  const layout = generateLayout(1986);
  layout.buildings = layout.buildings.filter(b => Math.hypot(b.x - site.x, b.z - site.z) > siteClear).concat(extraBuildings);
  const city = buildCity(ctx, { layout, litFrac: 0.0, lampsOff: true, spring: 0.25, facade: { broken: 0.16, entrGain: 0 } });
  scene.add(city.group);
  // the distant plant: dark silhouettes, smoke column lit from below
  const plant = buildPlant(ctx, {});
  plant.setState(0, { destroyed: true });
  plant.glowMat.uniforms.uGain.value = 0.35;
  scene.add(plant.root);
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: P(-380, 20, -420).toArray(), boxMax: P(200, 600, 160).toArray(), steps: 48, shadowSteps: 3, albedo: 0.45 });
  scene.add(vol.mesh);
  const moon = new THREE.DirectionalLight(new THREE.Color(0.6, 0.7, 1.0), 0.12);
  moon.position.copy(site).addScaledVector(MOON_DIR, 2000); moon.target.position.copy(site);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  const sc = moon.shadow.camera; sc.left = -180; sc.right = 180; sc.top = 180; sc.bottom = -180; sc.near = 500; sc.far = 4000;
  moon.shadow.bias = -0.0008; moon.shadow.normalBias = 0.8;
  scene.add(moon, moon.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.07, 0.085, 0.13), new THREE.Color(0.015, 0.012, 0.01), 0.14));
  // horizon glow toward the plant
  const toPlant = V3(PLANT.x - site.x, 0, PLANT.z - site.z).normalize();
  ATM.uFogColor.value.setRGB(0.0045, 0.0055, 0.009);
  ATM.uFogDensity.value = 0.0012; ATM.uFogHeight.value = 70; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.copy(toPlant); ATM.uGlowCol.value.setRGB(0.045, 0.014, 0.004); ATM.uGlowPow.value = 14;
  ATM.uMoonHalo.value.setRGB(0.01, 0.012, 0.016);
  ATM.uFirePos.value.set(0, -1e5, 0); ATM.uFireFog.value.setRGB(0, 0, 0);
  sky.uniforms.uSkyGlowDir.value.copy(toPlant); sky.uniforms.uSkyGlowCol.value.setRGB(0.11, 0.034, 0.008); sky.uniforms.uSkyGlowPow.value = 12;
  sky.uniforms.uCloudCover.value = 0.75; sky.uniforms.uCloudLit.value.setRGB(0.009, 0.011, 0.017); sky.uniforms.uMoonCol.value.setRGB(0.12, 0.14, 0.18); sky.uniforms.uHorizon.value.setRGB(0.004, 0.005, 0.008); sky.uniforms.uZenith.value.setRGB(0.001, 0.0014, 0.0028);
  const update = (t, camera) => {
    vol.setPlumes([{ base: P(0, 46, 4).toArray(), r0: 13, spread: 0.3, height: 560, density: 1.1, rise: 9, wind: [-0.32, -0.42], noiseScale: 1 / 75, fireH: 26, fireEmis: 16, seed: 0.2 }]);
    vol.setLighting({ firePos: P(2, 50, 4).toArray(), fireCol: [16, 5.2, 1.4], fireR: 40, fireShadowLen: 160, moonDir: MOON_DIR.toArray(), moonCol: [0.02, 0.024, 0.032], ambTop: [0.002, 0.0024, 0.0038], ambBot: [0.005, 0.002, 0.0008], ext: 0.07, minStep: 4 });
    vol.update(t + 600, Math.round(t * 24), camera);
  };
  return { scene, camera, sky, city, plant, vol, update, toPlant, layout };
}

// ---------------- S8: abandoned yard, playground, drifting dust ----------------
export async function S8(ctx) {
  const lay0 = generateLayout(1986);
  const site = new THREE.Vector3(...[0, 0, 0]);
  { const [x, z] = lay0.toW(410, 335); site.set(x, 0, z); }
  const u = V3(PLANT.x - site.x, 0, PLANT.z - site.z).normalize(); const v = V3(-u.z, 0, u.x);
  const rot = Math.atan2(-u.z, u.x);
  const slab = (off, along, len, floors, seed) => { const c = site.clone().addScaledVector(v, off).addScaledVector(u, along); return { x: c.x, z: c.z, w: len, d: 12.5, h: floors * 2.8 + 1.2, floors, style: 1, rot, seed, lit: 0 }; };
  const extra = [slab(-34, 10, 140, 9, 11.3), slab(36, -10, 120, 9, 23.7), slab(36, 105, 26, 16, 31.1), slab(-40, -95, 60, 5, 41.9)];
  const A = await aftermathWorld(ctx, { site, extraBuildings: extra, focal: 32 });
  const { scene, camera } = A;
  const rnd = mulberry32(8);
  const pg = playground(rnd);
  pg.group.position.copy(site).addScaledVector(u, 4); pg.group.rotation.y = rot;
  scene.add(pg.group);
  // one flickering street lamp at the edge of the yard
  const lampPos = site.clone().addScaledVector(v, -10).addScaledVector(u, 14).setY(8.8);
  const pole = tube(lampPos.clone().setY(0), lampPos.clone().setY(9.2), 0.13, paint(new THREE.Color(0.25, 0.25, 0.24), 0.8, 0, 'lpole')); scene.add(pole);
  const lum = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.7), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 1.0, 0.9) }));
  lum.position.copy(lampPos).addScaledVector(v, 1.2); scene.add(lum);
  const lamp = new THREE.SpotLight(new THREE.Color(0.75, 1.0, 0.9), 0, 0, THREE.MathUtils.degToRad(55), 0.6, 2);
  lamp.position.copy(lum.position); lamp.target.position.copy(lum.position).setY(0).addScaledVector(v, 2);
  lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.camera.near = 0.5; lamp.shadow.camera.far = 40; lamp.shadow.bias = -0.0004;
  scene.add(lamp, lamp.target);
  const dust = new Dust(ctx, { n: 6000, center: site.clone().addScaledVector(u, -12).setY(4).toArray(), size: [36, 9, 36], drift: [0.35, -0.04, 0.18], color: [0.03, 0.034, 0.042], gain: 1.0, focus: 11, aperture: 0.012 });
  scene.add(dust.mesh);
  const camA = site.clone().addScaledVector(u, -26).addScaledVector(v, -6).setY(1.55);
  const camB = site.clone().addScaledVector(u, -17).addScaledVector(v, -4).setY(1.5);
  return {
    scene, camera,
    look: { uExposure: 1.4, uLookPow: 1.3, uLookSat: 0.85, uBloom: 0.07, uHalation: 0.1, uVignette: 0.72, uGrain: 0.06 },
    update(t) {
      const k = easeInOutSine(t / 5);
      const p = camA.clone().lerp(camB, k);
      const tgt = site.clone().addScaledVector(u, 60).setY(9);
      placeCamera(camera, ctx, p, tgt, { focal: 32, shake: 0.12, shakeFreq: 0.4, t, seed: 81 });
      // lamp flicker: mostly off, occasional sputter
      const f = fbm1(t * 7, 91, 2), f2 = noise1(t * 23, 92);
      const on = (t % 5.0 > 1.2 && t % 5.0 < 3.9) ? 1 : 0.15;
      const I = Math.max(0, on * (0.55 + 0.45 * f) * (f2 > -0.65 ? 1 : 0.08));
      lamp.intensity = 900 * I; lum.material.color.setRGB(0.8, 1.0, 0.9).multiplyScalar(2 + 70 * I);
      dust.uniforms.uLightPos.value.copy(lum.position); dust.uniforms.uLightCol.value.set(0.9 * I, 1.15 * I, 1.05 * I); dust.uniforms.uLightR.value = 7;
      dust.update(camera);
      // swing drifts in the wind
      pg.seats.forEach((s, i) => { s.rotation.x = Math.sin(t * 1.5 + i * 1.7) * (i === 0 ? 0.16 : 0.05); });
      A.update(t, camera);
      return {};
    },
  };
}

// ---------------- S9: the Ferris wheel ----------------
export async function S9(ctx) {
  const lay0 = generateLayout(1986);
  const site = new THREE.Vector3();
  { const [x, z] = lay0.toW(175, -25); site.set(x, 0, z); }
  const A = await aftermathWorld(ctx, { site, siteClear: 45, focal: 28 });
  const { scene, camera } = A;
  const fw = ferrisWheel();
  const u = A.toPlant;
  fw.group.position.copy(site); fw.group.rotation.y = Math.atan2(u.x, u.z) + Math.PI / 2 + 0.5;
  scene.add(fw.group);
  const dust = new Dust(ctx, { n: 5000, center: site.clone().addScaledVector(u, -26).setY(5).toArray(), size: [30, 10, 30], drift: [0.3, -0.03, 0.2], color: [0.035, 0.035, 0.04], gain: 1.0, focus: 30, aperture: 0.01 });
  scene.add(dust.mesh);
  const camA = site.clone().addScaledVector(u, -34).add(V3(0, 1.2, 0)).addScaledVector(V3(-u.z, 0, u.x), 6);
  const camB = site.clone().addScaledVector(u, -29).add(V3(0, 1.0, 0)).addScaledVector(V3(-u.z, 0, u.x), 5);
  return {
    scene, camera,
    look: { uExposure: 1.3, uLookPow: 1.3, uLookSat: 0.85, uBloom: 0.07, uHalation: 0.1, uVignette: 0.72, uGrain: 0.06 },
    update(t) {
      const k = easeInOutSine(t / 4.5);
      placeCamera(camera, ctx, camA.clone().lerp(camB, k), site.clone().add(V3(0, lerp(13, 15, k), 0)).addScaledVector(u, 10), { focal: 28, shake: 0.1, shakeFreq: 0.35, t, seed: 91 });
      fw.gondolas.forEach((g, i) => { g.rotation.z = Math.sin(t * 0.9 + i) * 0.03; });
      dust.update(camera);
      A.update(t, camera);
      return {};
    },
  };
}
