// THE LONG SHADOW (1987–1991): the old villagers who came home to the zone, a children's ward in
// the years of thyroid cancer, the fire in Unit 2's turbine hall, and the Ferris wheel under snow
// in the month the Soviet Union ended.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCivilian, clipSpeed, buildTrees3D, LEAF_AMB } from './lib/street.js';
import { loadRig, pose, makeFireTruck } from './lib/people.js';
import { VolumeFX } from './lib/volume.js';
import { Dust, Flames, Embers } from './lib/fx.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest, buildCity, generateLayout } from './lib/city.js';
import { PLANT } from './lib/plant.js';
import { placeCamera, plantWorld, MOON_DIR } from './shots_plant.js';
import { debugCam, placeWalker } from './part2.js';
import { sarcophagus } from './part3.js';
import { khata } from './part4.js';
import { ferrisWheel } from './shots_after.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const atP = (s, l, y = 0) => P(s, y, l);
const mat = (c, r = 0.8, m = 0, key = 'p6') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });

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

// ---------------- U1: the samosely. An old woman back in her village, smoke from one chimney ----------------
function hen(rnd) {
  const g = new THREE.Group();
  const c = rnd() < 0.5 ? [0.45, 0.4, 0.33] : [0.3, 0.14, 0.06];
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), mat(c, 0.95, 0, 'hen')); body.scale.set(1.3, 1, 0.9); body.position.y = 0.25; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat(c, 0.95, 0, 'hen')); head.position.set(0.2, 0.42, 0); g.add(head);
  const comb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.02), mat([0.5, 0.03, 0.02], 0.7, 0, 'comb')); comb.position.set(0.21, 0.5, 0); g.add(comb);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 8), mat(c, 0.95, 0, 'hen')); tail.position.set(-0.22, 0.36, 0); tail.rotation.z = 0.9; g.add(tail);
  for (const z of [-0.05, 0.05]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 4), mat([0.5, 0.4, 0.1], 0.8, 0, 'henleg')); l.position.set(0, 0.08, z); g.add(l); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, head };
}
export async function U1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(50, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(282, 11);
  const sk = daySky(ctx, SUN, { uSunCol: [2.6, 1.8, 1.05], uZenith: [0.05, 0.09, 0.2], uHorizon: [0.34, 0.3, 0.26], uDawn: [0.5, 0.26, 0.1], uDawnPow: 4, uCloudBright: [0.9, 0.7, 0.5], uCloudShade: [0.36, 0.34, 0.36], uCloudCover: 0.3, uSunDisk: 60 });
  scene.add(sk);
  const O = V3(-6000, 0, -2500);
  const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  patchMaterial(gm, {
    key: 'village6', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz - uO.xz; float n = texture(tNoise, vec3(p * 0.02, 0.3)).r, n2 = texture(tNoise, vec3(p * 0.15, 0.6)).g, n3 = texture(tNoise, vec3(p * 0.9, 0.2)).b;
        float road = 1.0 - smoothstep(1.8, 2.6, abs(p.y + (n - 0.5) * 2.0));
        float rut = (1.0 - smoothstep(0.15, 0.45, abs(abs(p.y) - 0.85))) * road;
        vec3 grass = mix(vec3(0.07, 0.085, 0.025), vec3(0.13, 0.12, 0.05), smoothstep(0.35, 0.8, n2)) * (0.75 + 0.5 * n3);
        vec3 dirt = vec3(0.075, 0.06, 0.045) * (0.8 + 0.35 * n2) * (1.0 - 0.25 * rut);
        float bed = step(abs(p.x - 6.0), 7.0) * step(-24.0, p.y) * step(p.y, -11.5);             // her vegetable garden
        float row = 0.5 + 0.5 * sin(p.y * 6.0);
        vec3 soil = mix(vec3(0.05, 0.035, 0.025), vec3(0.04, 0.07, 0.02), row * (0.6 + 0.4 * n3));
        diffuseColor.rgb = mix(mix(grass, dirt, road), soil, bed); }`]],
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), gm); ground.rotation.x = -Math.PI / 2; ground.position.copy(O); ground.receiveShadow = true; scene.add(ground);
  const mats = {
    lime: mat([0.55, 0.55, 0.52], 0.95, 0, 'klime'), log: mat([0.16, 0.12, 0.09], 0.95, 0, 'klog'), plinth: mat([0.2, 0.2, 0.19], 0.95, 0, 'kplin'),
    tin: mat([0.22, 0.24, 0.24], 0.5, 0.6, 'ktin'), shingle: mat([0.1, 0.09, 0.08], 0.9, 0, 'kshing'), board: mat([0.14, 0.11, 0.08], 0.9, 0, 'kboard'),
    glass: patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.022, 0.025), roughness: 0.08 }), { key: 'kglass' }),
    frame: mat([0.6, 0.6, 0.58], 0.7, 0, 'kframe'), shutter: mat([0.12, 0.25, 0.4], 0.7, 0, 'kshut'),
  };
  const rnd = mulberry32(66);
  const trees = []; const fenceGeo = [];
  let home = null;
  for (const side of [-1, 1]) for (let k = 0; k < 7; k++) {
    const x = -90 + k * 26 + (rnd() - 0.5) * 6, z = side * (17 + rnd() * 4);
    const h = khata(rnd, mats); h.group.position.copy(O).add(V3(x, 0, z)); h.group.rotation.y = side > 0 ? Math.PI : 0; scene.add(h.group);
    if (side < 0 && k === 3) home = { x, z, h };
    for (let f = -11; f <= 11; f += 0.32) { if (Math.abs(f - 2) < 0.9) continue; const pk = new THREE.BoxGeometry(0.09, 1.25 + 0.06 * Math.sin(f * 9), 0.03); pk.translate(x + f, 0.62, z - side * 9.0); fenceGeo.push(pk); }
    for (const yy of [0.35, 1.0]) { const rail = new THREE.BoxGeometry(22, 0.07, 0.05); rail.translate(x, yy, z - side * 8.95); fenceGeo.push(rail); }
    for (let k2 = 0; k2 < 3; k2++) trees.push([O.x + x + (rnd() - 0.5) * 16, O.z + z - side * (4 + rnd() * 3), 5 + rnd() * 2.5, 'orchard']);
  }
  const fence = new THREE.Mesh(mergeGeometries(fenceGeo.map(g => g.toNonIndexed())), mat([0.2, 0.17, 0.13], 0.95, 0, 'fence')); fence.position.copy(O); fence.castShadow = true; fence.receiveShadow = true; scene.add(fence);
  for (let k = 0; k < 18; k++) trees.push([O.x - 120 + rnd() * 220, O.z + (rnd() < 0.5 ? -1 : 1) * (40 + rnd() * 30), 11 + rnd() * 6, rnd() < 0.5 ? 'birch' : 'linden']);
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.95, seed: 8 })));
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1400, count: 30000, exclude: [[O.x, O.z, 480]], seed: 11 }));
  // her yard: a washing line, a bench, hens; the chimney smokes
  const H = O.clone().add(V3(home.x, 0, home.z));
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 8, 4), mat([0.1, 0.1, 0.1])); line.rotation.z = Math.PI / 2; line.position.copy(H).add(V3(-2, 2.0, 6.5)); scene.add(line);
  const clothM = [[0.55, 0.53, 0.5], [0.4, 0.1, 0.08], [0.15, 0.22, 0.4]].map((c, i) => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: 0.9, side: THREE.DoubleSide }), { key: 'cloth' + i }));
  const clothes = [];
  for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.7 + rnd() * 0.3, 0.8 + rnd() * 0.3), clothM[k % 3]); c.position.copy(H).add(V3(-5 + k * 1.6, 1.55, 6.5)); c.castShadow = true; scene.add(c); clothes.push(c); }
  for (const x of [-6, 2]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.1, 6), mats.board); post.position.copy(H).add(V3(x, 1.05, 6.5)); scene.add(post); }
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.4), mats.board); bench.position.copy(H).add(V3(2.5, 0.45, 3.4)); bench.castShadow = true; scene.add(bench);
  const hens = []; for (let k = 0; k < 4; k++) { const hh = hen(rnd); hh.g.position.copy(H).add(V3(-1 + rnd() * 5, 0, 5.5 + rnd() * 2)); hh.g.rotation.y = rnd() * 6.28; scene.add(hh.g); hens.push({ ...hh, ph: rnd() * 6 }); }
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: H.clone().add(V3(-12, 4, -14)).toArray(), boxMax: H.clone().add(V3(14, 34, 8)).toArray(), steps: 48, shadowSteps: 2, albedo: 0.8 });
  scene.add(vol.mesh);
  const chimTop = H.clone().add(V3(home.h.w * 0.2, 2.7 + 3.2, 0.6));
  // she walks home along the fence, slowly
  const rig = await loadRig();
  const babushka = makeCivilian(rig, { seed: 1301, kind: 'woman', bag: 'none' }); scene.add(babushka.root, babushka.ao);
  babushka.root.traverse(o => { if (o.isMesh && o.material.color) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.8); } });
  const vWalk = clipSpeed(rig, 'Walk');
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.72, 0.44), sunI: 2.8, skyColor: new THREE.Color(0.3, 0.36, 0.48), groundColor: new THREE.Color(0.06, 0.05, 0.04), hemiI: 0.07, center: H, extent: 120, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.06, 0.06, 0.045));
  LEAF_AMB.sky.value.setRGB(0.3, 0.3, 0.32); LEAF_AMB.ground.value.setRGB(0.06, 0.05, 0.035);
  atmosphere({ sun: SUN, fog: [0.34, 0.3, 0.26], density: 0.0008, height: 80, glow: [0.9, 0.55, 0.28], glowPow: 8, halo: [1.0, 0.6, 0.3] });
  const camA = H.clone().add(V3(-9, 1.6, 33)), camB = H.clone().add(V3(-5.5, 1.6, 32.5));
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.16, uLookSat: 0.95, uBloom: 0.06, uHalation: 0.09, uVignette: 0.58, uGrain: 0.05, uShadowTint: [0.93, 1.0, 1.08], uHighTint: [1.07, 1.0, 0.88] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), H.clone().add(V3(1.0, 4.2, 2)), { focal: 35, shake: 0.04, shakeFreq: 0.3, t, seed: 1111 });
      placeWalker(babushka, rig, { from: H.clone().add(V3(-11, 0, 15.5)), to: H.clone().add(V3(2.6, 0, 15.5)), t, speed: vWalk * 0.55, rate: 0.55 });
      clothes.forEach((c, i) => { c.rotation.x = Math.sin(t * 1.3 + i) * 0.15; });
      hens.forEach(h => { const peck = Math.max(0, Math.sin(t * 2.2 + h.ph)); h.g.rotation.z = -peck * 0.5; });
      vol.setPlumes([{ base: chimTop.toArray(), r0: 0.35, spread: 0.12, height: 26, density: 0.5, rise: 0.9, wind: [0.35, 0.1], noiseScale: 1 / 2.5, seed: 0.4 }]);
      vol.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: SUN.toArray(), moonCol: [2.4, 1.7, 1.0], ambTop: [0.12, 0.13, 0.16], ambBot: [0.06, 0.05, 0.04], ext: 0.3, minStep: 0.2 });
      vol.update(t, Math.round(t * 24), camera);
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(s, y, l))) || { dof: { focus: 18, focal: 35, fstop: 4 } };
    },
  };
}

// ---------------- U2: a children's ward in the 1990s ----------------
function wardCard() {
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const rnd = mulberry32(31);
  const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#e8ecf0'); grd.addColorStop(1, '#eef0ee'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 60; k++) { const x = rnd() * W, w = 20 + rnd() * 40, h = 30 + rnd() * 90; g.fillStyle = 'rgba(140,150,160,0.35)'; g.fillRect(x, H - h, w, h); }   // blocks across the yard
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function ironBed(m) {
  const g = new THREE.Group();
  const tubeY = (x, z, h) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h, 8), m.iron); t.position.set(x, h / 2, z); t.castShadow = true; g.add(t); };
  const rail = (x0, x1, y, z) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, x1 - x0, 8), m.iron); t.rotation.z = Math.PI / 2; t.position.set((x0 + x1) / 2, y, z); g.add(t); };
  for (const [x, h] of [[-0.95, 1.1], [0.95, 0.85]]) { for (const z of [-0.42, 0.42]) tubeY(x, z, h); for (const y of [h - 0.03, h * 0.55]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.84, 8), m.iron); t.rotation.x = Math.PI / 2; t.position.set(x, y, 0); g.add(t); } }
  for (const z of [-0.42, 0.42]) rail(-0.95, 0.95, 0.42, z);
  const matt = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.14, 0.82), m.sheet); matt.position.y = 0.52; matt.castShadow = true; matt.receiveShadow = true; g.add(matt);
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.6), m.sheet); pillow.position.set(-0.68, 0.64, 0); pillow.rotation.z = 0.12; pillow.castShadow = true; g.add(pillow);
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.86), m.blanket); blanket.position.set(0.3, 0.61, 0); blanket.castShadow = true; blanket.receiveShadow = true; g.add(blanket);
  return g;
}
export async function U2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(28, ctx.aspect), ctx.aspect, 0.05, 200);
  const O = V3(0, -3000, 0);
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const X0 = -3.6, X1 = 3.6, Z0 = -8, Z1 = 8, H = 3.3;
  const wallM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  patchMaterial(wallM, {
    key: 'wardwall', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec3 p = vWPos - uO; float n = texture(tNoise, p * 0.4 + 0.2).r, n2 = texture(tNoise, p * 2.1).g;
        vec2 q = vec2(p.x + p.z, p.y);
        float grout = max(smoothstep(0.0, 0.006, abs(fract(q.x / 0.15) - 0.5) - 0.48), smoothstep(0.0, 0.006, abs(fract(q.y / 0.15) - 0.5) - 0.48));
        vec3 tile = mix(vec3(0.42, 0.52, 0.5), vec3(0.3, 0.33, 0.31), grout) * (0.92 + 0.12 * n2);
        vec3 wash = vec3(0.6, 0.6, 0.57) * (0.9 + 0.15 * n);
        diffuseColor.rgb = mix(tile, wash, step(1.6, p.y)); }`]],
  });
  const floorM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
  patchMaterial(floorM, {
    key: 'wardfloor', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz - uO.xz; float n = texture(tNoise, vec3(p * 0.3, 0.4)).r, n2 = texture(tNoise, vec3(p * 1.4, 0.8)).g;
        diffuseColor.rgb = vec3(0.24, 0.1, 0.07) * (0.8 + 0.3 * n) * (0.9 + 0.15 * n2); }`]],
  });
  const ceilM = mat([0.6, 0.6, 0.58], 0.95, 0, 'wardceil');
  const box = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; room.add(b); return b; };
  box(X1 - X0 + 0.6, 0.2, Z1 - Z0 + 0.6, 0, -0.1, 0, floorM);
  box(X1 - X0 + 0.6, 0.2, Z1 - Z0 + 0.6, 0, H + 0.1, 0, ceilM);
  box(0.3, H, Z1 - Z0, X1 + 0.15, H / 2, 0, wallM);
  box(X1 - X0, H, 0.3, 0, H / 2, Z0 - 0.15, wallM);
  box(X1 - X0, H, 0.3, 0, H / 2, Z1 + 0.15, wallM);
  const WINZ = [-5.4, -1.8, 1.8, 5.4], WW = 1.8, SILL = 0.85, TOP = 2.9;
  box(0.4, SILL, Z1 - Z0, X0 - 0.2, SILL / 2, 0, wallM);
  box(0.4, H - TOP, Z1 - Z0, X0 - 0.2, (H + TOP) / 2, 0, wallM);
  const edges = [Z0, ...WINZ.flatMap(z => [z - WW / 2, z + WW / 2]), Z1];
  for (let k = 0; k < edges.length; k += 2) box(0.4, TOP - SILL, edges[k + 1] - edges[k], X0 - 0.2, (TOP + SILL) / 2, (edges[k] + edges[k + 1]) / 2, wallM);
  const frameM = mat([0.6, 0.6, 0.57], 0.6, 0, 'wframe');
  const curtM = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.5, 0.48, 0.42), roughness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), { key: 'curtain' });
  for (const z of WINZ) {
    for (const [w, h, d, y, dz] of [[0.08, 0.08, WW, SILL + 0.04, 0], [0.08, 0.08, WW, TOP - 0.04, 0], [0.08, TOP - SILL, 0.08, (TOP + SILL) / 2, -WW / 2 + 0.04], [0.08, TOP - SILL, 0.08, (TOP + SILL) / 2, WW / 2 - 0.04], [0.07, TOP - SILL, 0.06, (TOP + SILL) / 2, 0], [0.07, 0.06, WW, 2.3, 0]]) box(w, h, d, X0 - 0.12, y, z + dz, frameM);
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.5, TOP - SILL + 0.3, 6, 1), curtM); c.position.set(X0 + 0.05, (TOP + SILL) / 2 + 0.1, z + s * (WW / 2 + 0.05)); c.rotation.y = Math.PI / 2; room.add(c); }
  }
  const card = new THREE.Mesh(new THREE.PlaneGeometry(44, 16), new THREE.MeshBasicMaterial({ map: wardCard(), color: new THREE.Color(2.6, 2.7, 2.8), fog: false }));
  card.position.set(X0 - 14, 3, 0); card.rotation.y = Math.PI / 2; room.add(card);
  // ten iron beds, head to the wall, bedside cabinets; a drip stand; a teddy bear and a book on one bed
  const m = { iron: mat([0.62, 0.62, 0.6], 0.5, 0.3, 'iron'), sheet: mat([0.66, 0.66, 0.64], 0.9, 0, 'sheet'), blanket: mat([0.32, 0.38, 0.5], 0.95, 0, 'blanket') };
  const cab = mat([0.58, 0.58, 0.55], 0.6, 0, 'cab');
  const beds = [];
  for (const side of [-1, 1]) for (let k = 0; k < 5; k++) {
    const b = ironBed(m); const z = -6.4 + k * 3.2;
    b.position.set(side * (X1 - 1.05) * (side > 0 ? 1 : 0.92), 0, z); b.rotation.y = side > 0 ? Math.PI : 0; room.add(b); beds.push(b);
    box(0.45, 0.75, 0.42, side * (X1 - 0.3) * (side > 0 ? 1 : 0.98), 0.375, z + 1.0, cab);
  }
  const bear = new THREE.Group(); const fur = mat([0.32, 0.2, 0.1], 1.0, 0, 'fur');
  for (const [r, x, y, z] of [[0.11, 0, 0.11, 0], [0.08, 0, 0.27, 0], [0.03, 0, 0.35, -0.06], [0.03, 0, 0.35, 0.06], [0.04, 0.06, 0.06, -0.09], [0.04, 0.06, 0.06, 0.09], [0.035, 0.04, 0.16, -0.11], [0.035, 0.04, 0.16, 0.11]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), fur); s.position.set(x, y, z); s.castShadow = true; bear.add(s); }
  bear.position.set(-0.65, 0.68, 0.05); bear.rotation.y = Math.PI / 2 - 0.3; beds[2].add(bear);
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.22), mat([0.45, 0.1, 0.06], 0.8, 0, 'book6')); book.position.set(0.2, 0.645, 0.15); book.rotation.y = 0.4; beds[2].add(book);
  const drip = new THREE.Group(); drip.position.set(X0 + 1.9, 0, -0.1); room.add(drip);
  for (const [h, y] of [[1.9, 0.95]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, h, 6), m.iron); p.position.y = y; drip.add(p); }
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 12), m.iron); foot.position.y = 0.02; drip.add(foot);
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 10), patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.7, 0.72, 0.74), roughness: 0.1, transparent: true, opacity: 0.6 }), { key: 'bottle' })); bottle.position.set(0.12, 1.75, 0); drip.add(bottle);
  // light: a grey winter morning through the windows
  const SUN = V3(1.0, -0.5, 0.15).normalize();
  const sun = new THREE.DirectionalLight(new THREE.Color(0.95, 0.97, 1.0), 1.6);
  sun.position.copy(O).addScaledVector(SUN, -30); sun.target.position.copy(O);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 6;
  const sc = sun.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 5; sc.far = 60; sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.7, 0.72, 0.75), new THREE.Color(0.3, 0.22, 0.18), 0.5));
  for (const z of WINZ) { const pl = new THREE.PointLight(new THREE.Color(0.9, 0.93, 1.0), 2.2, 9, 1.5); pl.position.copy(O).add(V3(X0 + 0.8, 1.8, z)); scene.add(pl); }
  ATM.uFogColor.value.setRGB(0.0, 0.0, 0.0); ATM.uFogDensity.value = 0.0; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -4000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  const camA = O.clone().add(V3(0.35, 1.25, 7.3)), camB = O.clone().add(V3(0.1, 1.22, 4.6));
  return {
    scene, camera,
    look: { uExposure: 0.8, uLookPow: 1.18, uLookSat: 0.7, uBloom: 0.07, uHalation: 0.1, uVignette: 0.6, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.08], uHighTint: [1.0, 1.0, 1.02] },
    update(t) {
      const p = camA.clone().lerp(camB, easeInOutSine(t / 15));
      placeCamera(camera, ctx, p, O.clone().add(V3(-0.4, 0.75, -6.5)), { focal: 28, shake: 0.06, shakeFreq: 0.3, t, seed: 1122 });
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 6, focal: 28, fstop: 2.8 } };
    },
  };
}

// ---------------- U3: 11 October 1991, fire in the turbine hall of Unit 2 ----------------
export async function U3(ctx) {
  const W = await plantWorld(ctx, { focal: 60, city: false, fog: 0.0009, floodGain: 0.5, lampGain: 5.0, moon: 0.2, near: 1 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.0;
  plant.root.traverse(o => { if (o.isLineSegments) o.visible = false; });
  const shell = sarcophagus(); shell.position.copy(PLANT); scene.add(shell);
  // fire on the turbine hall roof above Unit 2's turbines
  const spots = [[-330, 31.5, -62, 12, 18], [-348, 31.5, -78, 10, 14], [-312, 31.5, -84, 8, 12], [-365, 31.5, -66, 7, 10], [-296, 31.5, -70, 6, 9], [-338, 31.5, -90, 9, 13]];
  const flames = new Flames(ctx, spots.map(([x, y, z, w, h], i) => ({ pos: P(x, y, z).toArray(), w, h, seed: i * 2.3 })));
  scene.add(flames.mesh);
  const embers = new Embers(ctx, { n: 400, sources: spots.map(([x, y, z, w]) => ({ pos: P(x, y, z).toArray(), r: w * 0.5 })), rise: [4, 12], life: [3, 8], wind: [-1.2, 0, 1.0], size: [0.06, 0.2], gain: 1.4, swirl: 4 });
  scene.add(embers.mesh);
  const fireLight = new THREE.PointLight(new THREE.Color(1.0, 0.45, 0.14), 0, 0, 2); fireLight.position.copy(P(-330, 45, -72)); scene.add(fireLight);
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: P(-460, 30, -280).toArray(), boxMax: P(-200, 400, -20).toArray(), steps: 64, shadowSteps: 4, albedo: 0.42 });
  scene.add(vol.mesh);
  // fire engines below the hall, beacons turning
  const trucks = [];
  for (let k = 0; k < 4; k++) { const tr = makeFireTruck(ctx, { seed: 60 + k }); tr.group.position.copy(P(-370 + k * 22, 0, -128 - (k % 2) * 6)); tr.group.rotation.y = Math.PI + (k - 1.5) * 0.15; scene.add(tr.group); trucks.push(tr); }
  const blues = trucks.map(tr => { const l = new THREE.PointLight(new THREE.Color(0.25, 0.4, 1.0), 0, 40, 2); l.position.copy(tr.group.position).setY(4); scene.add(l); return l; });
  sky.uniforms.uSkyGlowDir.value.set(-0.3, 0, -1).normalize(); sky.uniforms.uSkyGlowCol.value.setRGB(0.06, 0.02, 0.006);
  const camA = P(-520, 22, -470), camB = P(-508, 22.5, -458);
  return {
    scene, camera,
    look: { uExposure: 1.5, uLookPow: 1.3, uLookSat: 1.0, uBloom: 0.1, uHalation: 0.14, uVignette: 0.68, uGrain: 0.055 },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), P(-330, 40, -80), { focal: 60, shake: 0.04, shakeFreq: 0.3, t, seed: 1133 });
      const fl = 0.85 + 0.15 * fbm1(t * 3.1, 7, 3) + 0.08 * fbm1(t * 9, 3, 2);
      fireLight.intensity = 9000 * fl;
      vol.setPlumes([{ base: P(-330, 32, -74).toArray(), r0: 14, spread: 0.35, height: 340, density: 1.0, rise: 8, wind: [-0.25, -0.5], noiseScale: 1 / 50, fireH: 10, fireEmis: 5, seed: 0.3 }]);
      vol.setLighting({ firePos: P(-330, 38, -74).toArray(), fireCol: [7 * fl, 2.3 * fl, 0.6 * fl], fireR: 30, fireShadowLen: 160, moonDir: MOON_DIR.toArray(), moonCol: [0.012, 0.015, 0.022], ambTop: [0.0015, 0.0018, 0.003], ambBot: [0.006, 0.0025, 0.001], ext: 0.07, minStep: 2.5 });
      vol.update(t, Math.round(t * 24), camera);
      embers.update(t, camera, { gain: 1 });
      ATM.uFirePos.value.copy(P(-330, 45, -74)); ATM.uFireFog.value.setRGB(0.009 * fl, 0.0033 * fl, 0.0009 * fl); ATM.uFireFogR.value = 60;
      trucks.forEach((tr, i) => { const ph = (t * 1.5 + i * 0.37) % 1; const on = ph < 0.2 || (ph > 0.32 && ph < 0.44); tr.beaconMat.color.setRGB(0.25, 0.45, 1.0).multiplyScalar(on ? 40 : 0.5); blues[i].intensity = on ? 300 : 0; });
      return debugCam(ctx, camera, atP) || {};
    },
  };
}

// ---------------- U4: December 1991. The Ferris wheel under snow. ----------------
export async function U4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(28, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(215, 6);
  const sk = daySky(ctx, SUN, { uSunCol: [0.5, 0.45, 0.45], uZenith: [0.12, 0.13, 0.16], uHorizon: [0.26, 0.25, 0.26], uDawn: [0.06, 0.04, 0.03], uDawnPow: 4, uCloudBright: [0.36, 0.35, 0.36], uCloudShade: [0.22, 0.22, 0.24], uCloudCover: 0.95, uSunDisk: 0 });
  scene.add(sk);
  const lay0 = generateLayout(1986);
  const site = new THREE.Vector3(); { const [x, z] = lay0.toW(175, -25); site.set(x, 0, z); }
  const layout = generateLayout(1986); layout.buildings = layout.buildings.filter(b => Math.hypot(b.x - site.x, b.z - site.z) > 45);
  const city = buildCity(ctx, { layout, litFrac: 0.0, lampsOff: true, spring: 0.0, snow: 1, facade: { broken: 0.16, entrGain: 0 } });
  scene.add(city.group);
  city.facadeMat.userData.u.uDay.value = 0.35;
  const fw = ferrisWheel();
  const toPlant = V3(PLANT.x - site.x, 0, PLANT.z - site.z).normalize();
  fw.group.position.copy(site); fw.group.rotation.y = Math.atan2(toPlant.x, toPlant.z) + Math.PI / 2 + 0.5; scene.add(fw.group);
  // snow lying on the wheel's base and the gondola roofs
  const snowM = mat([0.6, 0.61, 0.64], 0.9, 0, 'snowcap');
  fw.gondolas.forEach(g => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.08, 12), snowM); cap.position.y = -0.27; g.add(cap); });
  const snow = new Dust(ctx, { n: 9000, center: site.clone().addScaledVector(toPlant, -20).setY(6).toArray(), size: [44, 16, 44], drift: [0.3, -1.0, 0.2], color: [0.45, 0.45, 0.47], gain: 1.1, focus: 30, aperture: 0.008 });
  scene.add(snow.mesh);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(0.9, 0.9, 0.95), sunI: 0.25, skyColor: new THREE.Color(0.4, 0.42, 0.46), groundColor: new THREE.Color(0.28, 0.28, 0.3), hemiI: 0.45, center: site, extent: 120, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.22, 0.22, 0.23)); scene.environmentIntensity = 0.7;
  atmosphere({ sun: SUN, fog: [0.24, 0.24, 0.26], density: 0.0026, height: 160, glow: [0, 0, 0] });
  const side = V3(-toPlant.z, 0, toPlant.x);
  const camA = site.clone().addScaledVector(toPlant, -36).addScaledVector(side, 7).setY(1.4), camB = site.clone().addScaledVector(toPlant, -30).addScaledVector(side, 5.5).setY(1.3);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.1, uLookSat: 0.6, uBloom: 0.05, uHalation: 0.06, uVignette: 0.62, uGrain: 0.055, uShadowTint: [0.95, 1.0, 1.08], uHighTint: [1.0, 1.0, 1.0] },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, camA.clone().lerp(camB, k), site.clone().add(V3(0, lerp(12, 14.5, k), 0)).addScaledVector(toPlant, 10), { focal: 28, shake: 0.06, shakeFreq: 0.3, t, seed: 1144 });
      fw.gondolas.forEach((g, i) => { g.rotation.z = Math.sin(t * 0.9 + i) * 0.03; });
      snow.update(camera);
      return debugCam(ctx, camera, (s, l, y = 0) => site.clone().add(V3(s, y, l))) || { dof: { focus: 34, focal: 28, fstop: 4 }, fade: smoothstep(13.2, 14.8, t) };
    },
  };
}
