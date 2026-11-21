// THE ZONE TODAY (2011 – 2019): visitors at the Ferris wheel, the Azure swimming pool, the
// "Elephant's Foot" under the reactor by torchlight, and the checkpoint crowded with tour buses.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCivilian, makeBus, clipSpeed, buildTrees3D, LEAF_AMB } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { Dust } from './lib/fx.js';
import { VolumeFX } from './lib/volume.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest, buildCity, generateLayout } from './lib/city.js';
import { PLANT } from './lib/plant.js';
import { placeCamera } from './shots_plant.js';
import { debugCam, placeWalker } from './part2.js';
import { ferrisWheel } from './shots_after.js';
import { V1 } from './part7.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (c, r = 0.8, m = 0, key = 'p12') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });
const BRIGHT = [[0.5, 0.08, 0.05], [0.08, 0.22, 0.45], [0.55, 0.42, 0.06], [0.1, 0.35, 0.15], [0.45, 0.2, 0.35], [0.6, 0.3, 0.05], [0.12, 0.12, 0.14]];

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
// a visitor of the 2010s, in a bright jacket
function tourist(rig, seed, rnd) {
  const c = makeCivilian(rig, { seed, kind: rnd() < 0.55 ? 'man' : 'woman', bag: 'none' });
  const col = new THREE.Color(...BRIGHT[Math.floor(rnd() * BRIGHT.length)]);
  let n = 0; c.root.traverse(o => { if (o.isMesh && o.material.color) { const k = o.material.color; const skin = k.r > 0.2 && k.r > k.g * 1.12 && k.g > k.b * 1.03; if (!skin && n++ < 2) { o.material = o.material.clone(); o.material.color.copy(col); } } });
  return c;
}

// ---------------- AA1: the Ferris wheel in summer, with visitors ----------------
export async function AA1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(28, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(160, 50);
  const sk = daySky(ctx, SUN, { uSunCol: [2.2, 2.05, 1.85], uZenith: [0.04, 0.09, 0.24], uHorizon: [0.3, 0.33, 0.37], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4, uCloudBright: [0.9, 0.9, 0.88], uCloudShade: [0.45, 0.48, 0.55], uCloudCover: 0.3, uSunDisk: 60 });
  scene.add(sk);
  const lay0 = generateLayout(1986);
  const site = new THREE.Vector3(); { const [x, z] = lay0.toW(175, -25); site.set(x, 0, z); }
  const layout = generateLayout(1986); layout.buildings = layout.buildings.filter(b => Math.hypot(b.x - site.x, b.z - site.z) > 45);
  const city = buildCity(ctx, { layout, litFrac: 0.0, lampsOff: true, spring: 1.0, facade: { day: 1, broken: 0.4, entrGain: 0 } });
  scene.add(city.group); city.facadeMat.userData.u.uDay.value = 1.0;
  const fw = ferrisWheel();
  const toPlant = V3(PLANT.x - site.x, 0, PLANT.z - site.z).normalize(); const side = V3(-toPlant.z, 0, toPlant.x);
  fw.group.position.copy(site); fw.group.rotation.y = Math.atan2(toPlant.x, toPlant.z) + Math.PI / 2 + 0.5; scene.add(fw.group);
  fw.group.traverse(o => { if (o.isMesh && o.material.color) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.3, 0.14, 0.06), 0.35); } });   // rust
  const rnd = mulberry32(12);
  const trees = [];
  for (let k = 0; k < 90; k++) { const a = rnd() * 6.28, r = 22 + rnd() * 50; trees.push([site.x + Math.cos(a) * r, site.z + Math.sin(a) * r, 8 + rnd() * 9, rnd() < 0.6 ? 'birch' : 'poplar']); }
  for (let k = 0; k < 60; k++) { const a = rnd() * 6.28, r = 12 + rnd() * 30; trees.push([site.x + Math.cos(a) * r, site.z + Math.sin(a) * r, 1 + rnd() * 3, 'birch']); }
  scene.add(msaaLeaves(ctx, buildTrees3D(trees.filter(([x, z]) => V3(x - site.x, 0, z - site.z).dot(toPlant) > -18 || Math.abs(V3(x - site.x, 0, z - site.z).dot(side)) > 14), { leafiness: 1.0, seed: 19 })));
  // a tour group with its guide
  const rig = await loadRig();
  const group = [];
  for (let k = 0; k < 11; k++) {
    const c = tourist(rig, 4000 + k, rnd);
    const p = site.clone().addScaledVector(toPlant, -16 + rnd() * 5).addScaledVector(side, -4 + rnd() * 8);
    c.root.position.copy(p); c.root.rotation.y = Math.atan2(toPlant.x, toPlant.z) + (rnd() - 0.5) * 0.9; scene.add(c.root, c.ao); c.ao.position.set(p.x, 0.045, p.z); group.push({ c, off: rnd() * 3 });
  }
  const guide = makeCivilian(rig, { seed: 4100, kind: 'man', bag: 'none' }); const gp = site.clone().addScaledVector(toPlant, -9).addScaledVector(side, 3);
  guide.root.position.copy(gp); guide.root.rotation.y = Math.atan2(-toPlant.x, -toPlant.z); scene.add(guide.root, guide.ao); guide.ao.position.set(gp.x, 0.045, gp.z);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.87), sunI: 3.2, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: site, extent: 90, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.06, 0.065, 0.055));
  LEAF_AMB.sky.value.setRGB(0.26, 0.29, 0.33);
  atmosphere({ sun: SUN, fog: [0.3, 0.32, 0.35], density: 0.0007, height: 160, glow: [0.3, 0.26, 0.18] });
  const camA = site.clone().addScaledVector(toPlant, -34).addScaledVector(side, 9).setY(1.6), camB = site.clone().addScaledVector(toPlant, -30).addScaledVector(side, 7).setY(1.6);
  return {
    scene, camera,
    look: { uExposure: 0.92, uLookPow: 1.16, uLookSat: 0.95, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, camA.clone().lerp(camB, k), site.clone().add(V3(0, lerp(5, 7, k), 0)).addScaledVector(toPlant, 2), { focal: 28, shake: 0.06, shakeFreq: 0.3, t, seed: 1711 });
      group.forEach(g => pose(g.c, 'Idle', t, { offset: g.off })); pose(guide, 'Idle', t, { offset: 0.5 });
      fw.gondolas.forEach((g, i) => { g.rotation.z = Math.sin(t * 0.9 + i) * 0.03; });
      return debugCam(ctx, camera, (s, l, y = 0) => site.clone().add(V3(s, y, l))) || { dof: { focus: 24, focal: 28, fstop: 4 } };
    },
  };
}

// ---------------- AA2: the "Azure" (Lazurny) swimming pool ----------------
export async function AA2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(20, ctx.aspect), ctx.aspect, 0.05, 400);
  const O = V3(0, -6000, 0);
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const X0 = -14, X1 = 14, Z0 = -26, Z1 = 26, H = 11;
  const box = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; room.add(b); return b; };
  // tiles: pale blue-green in the tank, white on the deck, all filthy
  const tileM = (base, key) => { const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }); patchMaterial(m, { key, uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O }, uB: { value: new THREE.Vector3(...base) } }, fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO, uB;', fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec3 p = vWPos - uO; float n = texture(tNoise, p * 0.12 + 0.3).r, n2 = texture(tNoise, p * 0.9).g;
        vec2 q = abs(vWNrm.y) > 0.5 ? p.xz : (abs(vWNrm.x) > 0.5 ? p.zy : p.xy);
        float grout = max(smoothstep(0.0, 0.01, abs(fract(q.x / 0.2) - 0.5) - 0.47), smoothstep(0.0, 0.01, abs(fract(q.y / 0.2) - 0.5) - 0.47));
        vec3 c = mix(uB, uB * 0.45, grout); c = mix(c, vec3(0.12, 0.1, 0.07), smoothstep(0.45, 0.85, n) * 0.85); c *= 0.85 + 0.25 * n2;
        diffuseColor.rgb = c; }`]] }); return m; };
  const deckM = tileM([0.55, 0.55, 0.52], 'pooldeck'), tankM = tileM([0.3, 0.5, 0.5], 'pooltank'), wallM = mat([0.42, 0.41, 0.38], 0.9, 0, 'poolwall');
  // deck around a 25 m tank 2–5 m deep
  const PX = 8, PZ = 13;
  box(X1 - X0, 0.4, Z1 - PZ, 0, -0.2, (Z1 + PZ) / 2, deckM); box(X1 - X0, 0.4, -PZ - Z0, 0, -0.2, (Z0 - PZ) / 2, deckM);
  box(X1 - PX, 0.4, 2 * PZ, (X1 + PX) / 2, -0.2, 0, deckM); box(-PX - X0, 0.4, 2 * PZ, (X0 - PX) / 2, -0.2, 0, deckM);
  box(2 * PX, 0.3, 2 * PZ, 0, -4.15, 0, tankM);
  box(0.3, 4, 2 * PZ, -PX - 0.15, -2, 0, tankM); box(0.3, 4, 2 * PZ, PX + 0.15, -2, 0, tankM); box(2 * PX, 4, 0.3, 0, -2, -PZ - 0.15, tankM); box(2 * PX, 4, 0.3, 0, -2, PZ + 0.15, tankM);
  box(0.3, H, Z1 - Z0, X1 + 0.15, H / 2, 0, wallM); box(X1 - X0, H, 0.3, 0, H / 2, Z0 - 0.15, wallM); box(X1 - X0, H, 0.3, 0, H / 2, Z1 + 0.15, wallM);
  box(X1 - X0 + 0.6, 0.4, Z1 - Z0 + 0.6, 0, H + 0.2, 0, mat([0.3, 0.3, 0.29], 0.9, 0, 'poolceil'));
  // the west wall is all window: mullions, most glass gone
  const frM = mat([0.2, 0.2, 0.2], 0.6, 0.5, 'poolframe');
  for (let z = Z0; z <= Z1; z += 3.25) box(0.25, H, 0.25, X0, H / 2, z, frM);
  for (const y of [0.9, 4.2, 7.5, 10.6]) box(0.2, 0.2, Z1 - Z0, X0, y, 0, frM);
  box(0.4, 0.9, Z1 - Z0, X0 - 0.2, 0.45, 0, wallM);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(140, 50), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 3.1, 3.0), fog: false })); card.position.set(X0 - 30, 8, 0); card.rotation.y = Math.PI / 2; room.add(card);
  // the diving tower: three concrete platforms on a column at the deep end, and the old clock above the wall
  const conc = mat([0.4, 0.39, 0.37], 0.9, 0, 'tower');
  box(1.2, 10.5, 1.2, 0, 1.0, -PZ - 2.2, conc);
  for (const [y, len] of [[3.0, 3.2], [5.5, 3.8], [8.0, 4.4]]) box(2.2, 0.3, len, 0, y, -PZ - 2.2 + len / 2, conc);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), mat([0.6, 0.6, 0.58], 0.5, 0, 'clock')); clock.position.set(0, 9.3, Z1 - 0.05); clock.rotation.y = Math.PI; room.add(clock);
  const rnd = mulberry32(5);
  for (let k = 0; k < 40; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.2 + rnd() * 0.6, 0.05 + rnd() * 0.1, 0.2 + rnd() * 0.6), rnd() < 0.5 ? conc : deckM); d.position.set(-PX + rnd() * 2 * PX, -3.95, -PZ + rnd() * 2 * PZ); d.rotation.y = rnd() * 3; room.add(d); }
  const SUN = V3(1.0, -0.45, 0.2).normalize();
  const sun = new THREE.DirectionalLight(new THREE.Color(1.0, 0.92, 0.8), 3.0); sun.position.copy(O).addScaledVector(SUN, -60); sun.target.position.copy(O);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); const sc = sun.shadow.camera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 10; sc.far = 140; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.6, 0.62, 0.62), new THREE.Color(0.2, 0.18, 0.15), 0.7));
  ATM.uFogColor.value.setRGB(0, 0, 0); ATM.uFogDensity.value = 0.0; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -7000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  const dust = new Dust(ctx, { n: 4000, center: O.clone().add(V3(-4, 4, 0)).toArray(), size: [16, 8, 40], drift: [0.05, -0.01, 0.03], color: [0.15, 0.14, 0.12], gain: 0.5, focus: 18, aperture: 0.01 });
  scene.add(dust.mesh);
  const camA = O.clone().add(V3(6, 2.2, 24)), camB = O.clone().add(V3(3, 2.0, 21));
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.16, uLookSat: 0.75, uBloom: 0.07, uHalation: 0.1, uVignette: 0.6, uGrain: 0.055, uShadowTint: [0.95, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.93] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(-1, 2.5, -20)), { focal: 20, shake: 0.05, shakeFreq: 0.3, t, seed: 1722 });
      dust.update(camera);
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 22, focal: 20, fstop: 4 } };
    },
  };
}

// ---------------- AA3: the "Elephant's Foot", by torchlight ----------------
export async function AA3(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(35, ctx.aspect), ctx.aspect, 0.03, 200);
  const O = V3(0, -7000, 0);
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const conc = mat([0.13, 0.12, 0.11], 0.95, 0, 'basement');
  const box = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; room.add(b); return b; };
  box(8, 0.3, 14, 0, -0.15, -4, conc); box(8, 0.3, 14, 0, 3.6, -4, conc); box(0.3, 3.6, 14, -4, 1.8, -4, conc); box(0.3, 3.6, 14, 4, 1.8, -4, conc); box(8, 3.6, 0.3, 0, 1.8, -11, conc);
  for (const x of [-2.6, 1.8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 14, 10), mat([0.12, 0.08, 0.05], 0.7, 0.5, 'bpipe')); p.rotation.x = Math.PI / 2; p.position.set(x, 3.1, -4); room.add(p); }
  // the corium flow: a slumped, wrinkled mass of black-brown glass that ran down from the core and set
  const geo = new THREE.SphereGeometry(1, 96, 64);
  const pos = geo.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const sl = Math.max(0, -v.y);
    const r = 1 + 0.07 * Math.sin(v.x * 5 + v.y * 3) * Math.sin(v.z * 4 - v.y * 2) + 0.025 * Math.sin(v.y * 14 + v.x * 3) + 0.35 * sl * sl;
    v.multiplyScalar(r); v.y = v.y * 0.8 + 0.2; pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const coriumM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.05, 0.035, 0.025), roughness: 0.25, metalness: 0.2 });
  const foot = new THREE.Mesh(geo, coriumM); foot.scale.set(1.0, 1.1, 0.9); foot.position.set(0.2, 0.75, -8.4); foot.castShadow = true; foot.receiveShadow = true; room.add(foot);
  const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.75, 1.8, 24), coriumM); drip.position.set(0.15, 2.7, -8.5); room.add(drip);
  // the torch, held by the camera; a few dosimeter flickers of dust in the beam
  const torch = new THREE.SpotLight(new THREE.Color(1.0, 0.95, 0.85), 80, 30, THREE.MathUtils.degToRad(15), 0.5, 2);
  torch.castShadow = true; torch.shadow.mapSize.set(2048, 2048); scene.add(torch, torch.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.02, 0.02, 0.02), new THREE.Color(0.01, 0.01, 0.01), 0.3));
  ATM.uFogColor.value.setRGB(0, 0, 0); ATM.uFogDensity.value = 0.03; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -8000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: O.clone().add(V3(-4, 0, -11)).toArray(), boxMax: O.clone().add(V3(4, 3.6, 3)).toArray(), steps: 48, shadowSteps: 2, albedo: 0.8 });
  scene.add(vol.mesh);
  const camA = O.clone().add(V3(-0.8, 1.55, 1.5)), camB = O.clone().add(V3(-0.4, 1.5, -1.8));
  return {
    scene, camera,
    look: { uExposure: 2.0, uLookPow: 1.3, uLookSat: 0.6, uBloom: 0.08, uHalation: 0.12, uVignette: 0.8, uGrain: 0.09, uShadowTint: [0.92, 1.0, 1.1], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      const p = camA.clone().lerp(camB, easeInOutSine(t / 15));
      const aim = O.clone().add(V3(0.2 + Math.sin(t * 0.7) * 0.6, 1.0 + Math.sin(t * 0.5) * 0.4, -8.4));
      placeCamera(camera, ctx, p, O.clone().add(V3(0.1, 1.1, -8.4)), { focal: 35, shake: 0.3, shakeFreq: 0.7, t, seed: 1733 });
      torch.position.copy(p).add(V3(0.25, -0.15, 0)); torch.target.position.copy(aim); torch.intensity = 80 * (0.92 + 0.08 * noise1(t * 9, 4));
      const dir = aim.clone().sub(torch.position).normalize();
      vol.setGround({ center: O.clone().add(V3(0, 0, -4)).toArray(), radius: 12, height: 3.6, density: 0.12, noiseScale: 0.8, drift: [0.02, 0.01, -0.02] });
      vol.setLights([{ pos: torch.position.toArray(), range: 20, color: [0.6, 0.57, 0.5], cone: Math.cos(THREE.MathUtils.degToRad(15)), dir: dir.toArray() }]);
      vol.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: [0, 1, 0], moonCol: [0, 0, 0], ambTop: [0, 0, 0], ambBot: [0, 0, 0], ext: 0.3, minStep: 0.12 });
      vol.update(t, Math.round(t * 24), camera);
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 8, focal: 35, fstop: 2.8 } };
    },
  };
}

// ---------------- AA4: 2019. The checkpoint crowded with tour buses ----------------
export async function AA4(ctx) {
  const base = await V1(ctx);
  const { scene, camera } = base;
  const O = V3(8000, 0, 8000);
  const rnd = mulberry32(44);
  // minibuses and coaches queuing at the barrier
  const vehicles = [];
  for (let k = 0; k < 5; k++) {
    const b = makeBus({ color: new THREE.Color(...BRIGHT[k % BRIGHT.length]).multiplyScalar(1.2), cream: new THREE.Color(0.62, 0.62, 0.6) });
    b.group.scale.setScalar(k % 2 ? 0.75 : 1.0); b.group.position.copy(O).add(V3(1.9, 0, 18 + k * 13)); b.group.rotation.y = Math.PI / 2 * 0 + Math.PI; scene.add(b.group); vehicles.push(b);
  }
  // visitors on the verge, waiting for their passports to be checked
  const rig = await loadRig();
  const crowd = [];
  for (let k = 0; k < 26; k++) {
    const c = tourist(rig, 5000 + k, rnd);
    const p = O.clone().add(V3(-4.2 - rnd() * 4, 0, 4 + rnd() * 24)); c.root.position.copy(p); c.root.rotation.y = rnd() * 6.28; scene.add(c.root, c.ao); c.ao.position.set(p.x, 0.045, p.z); crowd.push({ c, off: rnd() * 3 });
  }
  const camA = O.clone().add(V3(-16, 1.7, 58)), camB = O.clone().add(V3(-14, 1.7, 53));
  return {
    scene, camera, look: base.look,
    update(t) {
      base.update(t);
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(-1, 1.6, 2)), { focal: 40, shake: 0.05, shakeFreq: 0.3, t, seed: 1744 });
      crowd.forEach(g => pose(g.c, 'Idle', t, { offset: g.off }));
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 30, focal: 40, fstop: 5.6 } };
    },
  };
}
