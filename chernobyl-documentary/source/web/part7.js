// THE ZONE (the 1990s): the checkpoint at the edge of the exclusion zone, a looted Pripyat flat,
// the same avenue as in 1986 now overgrown, and the silent Duga radar in the forest.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCar, makeCivilian, buildTrees3D, LEAF_AMB, forestFloor } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { Dust } from './lib/fx.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest } from './lib/city.js';
import { placeCamera } from './shots_plant.js';
import { streetWorld, debugCam, bicycle } from './part2.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (c, r = 0.8, m = 0, key = 'p7') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });

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
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

// ---------------- V1: the checkpoint on the road into the zone ----------------
export async function V1(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(40, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(160, 22);
  const sk = daySky(ctx, SUN, { uSunCol: [1.2, 1.15, 1.05], uZenith: [0.12, 0.14, 0.18], uHorizon: [0.3, 0.31, 0.32], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4, uCloudBright: [0.62, 0.62, 0.62], uCloudShade: [0.3, 0.31, 0.34], uCloudCover: 0.85, uSunDisk: 0 });
  scene.add(sk);
  const O = V3(8000, 0, 8000);
  const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
  patchMaterial(gm, {
    key: 'v1ground', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz - uO.xz; float n = texture(tNoise, vec3(p * 0.03, 0.2)).r, n2 = texture(tNoise, vec3(p * 0.4, 0.5)).g, n3 = texture(tNoise, vec3(p * 2.0, 0.7)).b;
        float road = 1.0 - smoothstep(3.6, 4.0, abs(p.x)); float shoulder = 1.0 - smoothstep(4.0, 6.5, abs(p.x));
        float line = (1.0 - smoothstep(0.05, 0.08, abs(p.x))) * step(0.5, fract(p.y / 6.0));
        vec3 grass = mix(vec3(0.09, 0.09, 0.05), vec3(0.14, 0.12, 0.07), smoothstep(0.3, 0.8, n2)) * (0.75 + 0.5 * n3);
        vec3 grav = vec3(0.14, 0.13, 0.12) * (0.8 + 0.4 * n3);
        vec3 asph = vec3(0.06, 0.06, 0.062) * (0.8 + 0.4 * n2) * (1.0 + 0.4 * step(0.82, n3));
        vec3 c = mix(grass, grav, shoulder); c = mix(c, asph, road); c = mix(c, vec3(0.45, 0.44, 0.4), line * 0.8);
        diffuseColor.rgb = c; }`]],
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), gm); ground.rotation.x = -Math.PI / 2; ground.position.copy(O); ground.receiveShadow = true; scene.add(ground);
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1400, count: 36000, exclude: [-300, -240, -180, -120, -60, 0, 60, 120].map(z => [O.x, O.z + z, 48]), seed: 31 }));
  const rnd = mulberry32(17);
  const trees = [];
  for (let k = 0; k < 60; k++) { const s = rnd() < 0.5 ? -1 : 1; trees.push([O.x + s * (16 + rnd() * 26), O.z - 120 + rnd() * 200, 12 + rnd() * 8, rnd() < 0.6 ? 'birch' : 'poplar']); }
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.35, seed: 4 })));
  // the barrier, the guard post, concrete blocks, the warning sign
  const red = mat([0.42, 0.04, 0.03], 0.55, 0, 'v1red'), white = mat([0.55, 0.55, 0.52], 0.55, 0, 'v1white'), conc = mat([0.3, 0.29, 0.27], 0.95, 0, 'v1conc'), dark = mat([0.08, 0.08, 0.08], 0.7, 0.3, 'v1dark');
  const gate = new THREE.Group(); gate.position.copy(O).add(V3(-4.6, 0, 0)); scene.add(gate);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.35), dark); post.position.y = 0.55; gate.add(post);
  for (let k = 0; k < 9; k++) { const seg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.13, 0.13), k % 2 ? red : white); seg.position.set(0.45 + k * 0.9, 1.05, 0); seg.castShadow = true; gate.add(seg); }
  const booth = new THREE.Group(); booth.position.copy(O).add(V3(-8.5, 0, 3)); scene.add(booth);
  const bb = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 2.6), mat([0.32, 0.36, 0.3], 0.85, 0, 'booth7')); bb.position.y = 1.3; bb.castShadow = true; bb.receiveShadow = true; booth.add(bb);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 3.0), dark); roof.position.y = 2.68; roof.castShadow = true; booth.add(roof);
  const bwin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 1.6), patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.03, 0.035, 0.04), roughness: 0.08 }), { key: 'bwin' })); bwin.position.set(1.61, 1.6, 0); booth.add(bwin);
  for (const [x, z] of [[2.2, -14], [-2.4, -20], [2.0, 14], [-2.2, 20]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.9, 0.9), conc); b.position.copy(O).add(V3(x, 0.45, z)); b.castShadow = true; b.receiveShadow = true; scene.add(b); }
  const trefoil = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c9a512'; g.fillRect(0, 0, w, h); g.strokeStyle = '#111'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#111'; g.translate(w / 2, h / 2);
    for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 3; g.beginPath(); g.moveTo(Math.cos(a - 0.52) * 24, Math.sin(a - 0.52) * 24); g.arc(0, 0, 92, a - 0.52, a + 0.52); g.arc(0, 0, 24, a + 0.52, a - 0.52, true); g.fill(); }
    g.beginPath(); g.arc(0, 0, 15, 0, 7); g.fill();
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshStandardMaterial({ map: trefoil, roughness: 0.6 })); sign.position.copy(O).add(V3(6.0, 2.3, -6)); sign.rotation.y = -0.25; sign.castShadow = true; scene.add(sign);
  for (const dx of [-0.55, 0.55]) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.0, 6), dark); sp.position.copy(sign.position).add(V3(dx * Math.cos(0.25), -0.8, dx * Math.sin(0.25))); scene.add(sp); }
  // a car stopped at the barrier; the guard sweeps it with a dosimeter
  const car = makeCar({ color: new THREE.Color(0.18, 0.24, 0.22) }); car.group.position.copy(O).add(V3(1.8, 0, 6.2)); car.group.rotation.y = Math.PI / 2 * 0 + Math.PI; scene.add(car.group);
  const rig = await loadRig();
  const guard = makeCivilian(rig, { seed: 1501, kind: 'man', bag: 'none' }); guard.root.traverse(o => { if (o.isMesh && o.material.color) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.09, 0.11, 0.07), 0.8); } });
  guard.root.position.copy(O).add(V3(-0.6, 0, 4.4)); guard.root.rotation.y = 1.2; scene.add(guard.root, guard.ao); guard.ao.position.set(guard.root.position.x, 0.045, guard.root.position.z);
  const g2 = makeCivilian(rig, { seed: 1502, kind: 'man', bag: 'none' }); g2.root.traverse(o => { if (o.isMesh && o.material.color) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.09, 0.11, 0.07), 0.8); } });
  g2.root.position.copy(O).add(V3(-7.0, 0, 5.2)); g2.root.rotation.y = 2.4; scene.add(g2.root, g2.ao); g2.ao.position.set(g2.root.position.x, 0.045, g2.root.position.z);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(0.95, 0.95, 0.97), sunI: 0.8, skyColor: new THREE.Color(0.4, 0.43, 0.48), groundColor: new THREE.Color(0.08, 0.08, 0.07), hemiI: 0.35, center: O, extent: 80, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.08, 0.08, 0.07));
  LEAF_AMB.sky.value.setRGB(0.32, 0.34, 0.37); LEAF_AMB.ground.value.setRGB(0.07, 0.07, 0.06);
  atmosphere({ sun: SUN, fog: [0.3, 0.31, 0.32], density: 0.0025, height: 80, glow: [0.06, 0.06, 0.05] });
  const camA = O.clone().add(V3(5.2, 1.45, 24)), camB = O.clone().add(V3(4.3, 1.45, 20.5));
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.15, uLookSat: 0.75, uBloom: 0.04, uHalation: 0.05, uVignette: 0.6, uGrain: 0.055, uShadowTint: [0.95, 1.0, 1.06], uHighTint: [1.02, 1.0, 0.97] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(-1.5, 1.6, -30)), { focal: 40, shake: 0.06, shakeFreq: 0.3, t, seed: 1211 });
      pose(guard, 'Idle', t, { offset: 0.2 }); pose(g2, 'Idle', t, { offset: 1.7 });
      guard.root.rotation.y = 1.2 + Math.sin(t * 0.5) * 0.35;
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 16, focal: 40, fstop: 4 } };
    },
  };
}

// ---------------- V2: a looted flat in Pripyat ----------------
function blocksCard() {
  return canvasTex(1024, 512, (g, W, H) => {
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#cfd9e4'); grd.addColorStop(1, '#ece8de'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    const rnd = mulberry32(5);
    for (let k = 0; k < 9; k++) { const x = k * 120 + rnd() * 40, w = 90 + rnd() * 60, h = 140 + rnd() * 200; g.fillStyle = `rgb(${170 + rnd() * 20 | 0},${168 + rnd() * 20 | 0},${160 + rnd() * 20 | 0})`; g.fillRect(x, H - h, w, h);
      g.fillStyle = 'rgba(60,70,80,0.5)'; for (let r = 0; r < h / 18; r++) for (let c = 0; c < w / 16; c++) if (rnd() < 0.9) g.fillRect(x + 4 + c * 16, H - h + 8 + r * 18, 8, 9); }
    for (let k = 0; k < 120; k++) { g.fillStyle = `rgba(${70 + rnd() * 50 | 0},${100 + rnd() * 50 | 0},${40 + rnd() * 20 | 0},0.6)`; g.beginPath(); g.arc(rnd() * W, H - rnd() * 120, 14 + rnd() * 30, 0, 7); g.fill(); }
  });
}
export async function V2(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(24, ctx.aspect), ctx.aspect, 0.05, 200);
  const O = V3(0, -4000, 0);
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const X0 = -2.4, X1 = 2.4, Z0 = -3.0, Z1 = 3.0, H = 2.7;
  // faded wallpaper with a repeating pattern, torn away in sheets, damp beneath
  const wallM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  patchMaterial(wallM, {
    key: 'paper7', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec3 p = vWPos - uO; vec2 q = vec2(p.x + p.z, p.y);
        float n = texture(tNoise, p * 0.5 + 0.1).r, n2 = texture(tNoise, p * 2.3 + 0.3).g, n3 = texture(tNoise, p * 0.12).b;
        vec2 c = fract(q / vec2(0.16, 0.22)) - 0.5; float motif = smoothstep(0.16, 0.1, length(c * vec2(1.0, 1.4)));
        float stripe = smoothstep(0.02, 0.0, abs(fract(q.x / 0.32) - 0.5) - 0.47);
        vec3 paper = mix(vec3(0.42, 0.38, 0.27), vec3(0.3, 0.22, 0.15), motif * 0.6 + stripe * 0.3) * (0.85 + 0.2 * n2);
        vec3 plaster = vec3(0.32, 0.31, 0.28) * (0.8 + 0.3 * n2);
        float torn = smoothstep(0.56, 0.6, n * 0.65 + n3 * 0.45 + (1.0 - smoothstep(0.0, 1.2, p.y)) * 0.15);
        vec3 col = mix(paper, plaster, torn);
        col *= mix(1.0, 0.65, smoothstep(0.55, 0.75, n3) * smoothstep(1.5, 2.7, p.y));
        diffuseColor.rgb = col; }`]],
  });
  const floorM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  patchMaterial(floorM, {
    key: 'parquet7', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz - uO.xz; vec2 cell = floor(p / 0.3); float ch = mod(cell.x + cell.y, 2.0);
        vec2 f = fract(p / 0.3); float plank = floor((ch > 0.5 ? f.x : f.y) * 4.0); float h = fract(sin(dot(cell, vec2(12.9, 78.2)) + plank * 7.1) * 43758.5);
        float n = texture(tNoise, vec3(p * 0.4, 0.3)).r, n2 = texture(tNoise, vec3(p * 2.0, 0.6)).g;
        vec3 wood = vec3(0.2, 0.12, 0.06) * (0.75 + 0.4 * h) * (0.85 + 0.3 * n2);
        wood = mix(wood, vec3(0.13, 0.12, 0.1), smoothstep(0.5, 0.8, n) * 0.7);       // grit, plaster dust
        diffuseColor.rgb = wood; }`]],
  });
  const box = (w, h, d, x, y, z, m, parent = room) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; parent.add(b); return b; };
  box(X1 - X0 + 0.4, 0.2, Z1 - Z0 + 0.4, 0, -0.1, 0, floorM);
  box(X1 - X0 + 0.4, 0.2, Z1 - Z0 + 0.4, 0, H + 0.1, 0, mat([0.5, 0.49, 0.46], 0.95, 0, 'ceil7'));
  box(0.2, H, Z1 - Z0, X0 - 0.1, H / 2, 0, wallM); box(0.2, H, Z1 - Z0, X1 + 0.1, H / 2, 0, wallM);
  box(X1 - X0, H, 0.2, 0, H / 2, Z1 + 0.1, wallM);
  // far wall: window and balcony door, glass mostly gone
  const DX0 = 0.4, DX1 = 1.3, WX0 = -1.6, WX1 = 0.25, SILL = 0.85, TOP = 2.25;
  const fz = Z0 - 0.1;
  box(WX0 - X0, H, 0.2, (X0 + WX0) / 2, H / 2, fz, wallM);
  box(WX1 - WX0, SILL, 0.2, (WX0 + WX1) / 2, SILL / 2, fz, wallM);
  box(DX0 - WX1, H, 0.2, (WX1 + DX0) / 2, H / 2, fz, wallM);
  box(X1 - DX1, H, 0.2, (DX1 + X1) / 2, H / 2, fz, wallM);
  box(DX1 - WX0, H - TOP, 0.2, (WX0 + DX1) / 2, (H + TOP) / 2, fz, wallM);
  const frM = mat([0.42, 0.4, 0.36], 0.8, 0, 'frame7');
  for (const [w, h, x, y] of [[WX1 - WX0, 0.07, (WX0 + WX1) / 2, SILL + 0.03], [WX1 - WX0, 0.07, (WX0 + WX1) / 2, TOP - 0.03], [0.07, TOP - SILL, (WX0 + WX1) / 2, (SILL + TOP) / 2], [0.07, TOP, DX0 + 0.03, TOP / 2], [0.07, TOP, DX1 - 0.03, TOP / 2], [DX1 - DX0, 0.07, (DX0 + DX1) / 2, 1.1]]) box(w, h, 0.08, x, y, fz, frM);
  const door = box(0.85, 2.15, 0.05, DX1 + 0.4, 1.08, Z0 + 0.35, frM); door.rotation.y = -1.1;
  // the balcony outside and the city beyond
  const balc = box(3.4, 0.12, 1.3, 0.2, -0.06, Z0 - 0.9, mat([0.3, 0.29, 0.27], 0.95, 0, 'balc7'));
  box(3.4, 1.0, 0.05, 0.2, 0.5, Z0 - 1.55, mat([0.25, 0.24, 0.22], 0.9, 0, 'balcwall'));
  const card = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ map: blocksCard(), color: new THREE.Color(2.8, 2.8, 2.8), fog: false }));
  card.position.set(0, -6, -26); room.add(card);
  // what was left: a wall unit with its doors torn off, a sofa slashed open, a television face down, a chair on its side, a radiator, papers and glass
  const wood = mat([0.16, 0.1, 0.06], 0.6, 0, 'veneer'), cloth = mat([0.22, 0.16, 0.12], 1.0, 0, 'sofa'), iron = mat([0.3, 0.29, 0.27], 0.7, 0.3, 'rad');
  box(0.5, 2.1, 2.6, X1 - 0.27, 1.05, 0.4, wood);
  for (let k = 0; k < 4; k++) box(0.04, 0.15, 2.5, X1 - 0.52, 0.4 + k * 0.5, 0.4, mat([0.12, 0.08, 0.05], 0.7, 0, 'shelf'));
  const dr = box(0.6, 0.9, 0.03, X1 - 1.2, 0.05, 1.6, wood); dr.rotation.set(-Math.PI / 2, 0, 0.4);
  box(0.9, 0.42, 2.0, X0 + 0.5, 0.21, 0.6, cloth); box(0.2, 0.5, 2.0, X0 + 0.1, 0.65, 0.6, cloth);
  const cush = box(0.5, 0.15, 0.6, X0 + 1.4, 0.08, -0.6, cloth); cush.rotation.y = 0.7;
  const tv = box(0.55, 0.45, 0.45, 0.4, 0.23, 0.9, mat([0.12, 0.08, 0.05], 0.5, 0, 'tv')); tv.rotation.set(0.0, 0.5, Math.PI * 0.5);
  const chair = new THREE.Group(); chair.position.set(-0.6, 0.22, -0.4); chair.rotation.set(0, 0.8, Math.PI / 2); room.add(chair);
  box(0.42, 0.04, 0.42, 0, 0, 0, wood, chair); box(0.42, 0.45, 0.04, 0, 0.24, -0.2, wood, chair); for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) box(0.03, 0.42, 0.03, x, -0.21, z, wood, chair);
  for (let k = 0; k < 9; k++) box(0.06, 0.55, 0.08, WX0 + 0.25 + k * 0.17, 0.4, Z0 + 0.08, iron);
  const paperM = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.55, 0.53, 0.48), roughness: 0.9, side: THREE.DoubleSide }), { key: 'paper7b' });
  const rnd = mulberry32(27);
  for (let k = 0; k < 50; k++) { const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.29), paperM); pp.rotation.set(-Math.PI / 2, 0, rnd() * 6.28); pp.position.set(X0 + 0.3 + rnd() * 4.2, 0.004 + k * 0.0003, Z0 + 0.3 + rnd() * 5.2); pp.receiveShadow = true; room.add(pp); }
  const glassM = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.3, 0.33, 0.33), roughness: 0.05, metalness: 0.1 }), { key: 'shard' });
  for (let k = 0; k < 24; k++) { const sh = new THREE.Mesh(new THREE.CircleGeometry(0.04 + rnd() * 0.06, 3), glassM); sh.rotation.set(-Math.PI / 2, 0, rnd() * 6); sh.position.set(WX0 + rnd() * 2.2, 0.006, Z0 + 0.2 + rnd() * 1.2); room.add(sh); }
  // light: a bright summer afternoon, low sun straight in through the window and the open door
  const SUN = V3(0.15, -0.45, 1.0).normalize();
  const sun = new THREE.DirectionalLight(new THREE.Color(1.0, 0.86, 0.66), 4.5);
  sun.position.copy(O).addScaledVector(SUN, -25); sun.target.position.copy(O);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  const sc = sun.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 5; sc.far = 60; sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.55, 0.55, 0.52), new THREE.Color(0.25, 0.18, 0.12), 0.5));
  for (const [x, z, I] of [[-0.7, -2.2, 2.2], [0.8, -2.2, 2.2], [0, 1.5, 0.9]]) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.9, 0.78), I, 8, 1.5); pl.position.copy(O).add(V3(x, 1.3, z)); scene.add(pl); }
  ATM.uFogColor.value.setRGB(0, 0, 0); ATM.uFogDensity.value = 0.0; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -5000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  const dust = new Dust(ctx, { n: 2500, center: O.clone().add(V3(-0.3, 1.3, -0.5)).toArray(), size: [3, 2.4, 4], drift: [0.02, -0.01, 0.03], color: [0.2, 0.18, 0.15], gain: 0.45, focus: 3, aperture: 0.015 });
  scene.add(dust.mesh);
  const camA = O.clone().add(V3(1.2, 1.4, 2.7)), camB = O.clone().add(V3(0.5, 1.35, 2.3));
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.8, uBloom: 0.09, uHalation: 0.13, uVignette: 0.62, uGrain: 0.06, uShadowTint: [0.95, 1.0, 1.08], uHighTint: [1.07, 1.0, 0.88] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(-0.5, 0.9, -3)), { focal: 24, shake: 0.08, shakeFreq: 0.3, t, seed: 1222 });
      dust.update(camera);
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { dof: { focus: 3.5, focal: 24, fstop: 2.8 } };
    },
  };
}

// ---------------- V3: the same avenue, a decade on: the forest has come into the streets ----------------
export async function V3s(ctx) {
  const SUN = sunDir(150, 48);
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false, washing: false, leafiness: 1.0, spring: 1.0, broken: 0.45,
    sky: { uSunCol: [2.2, 2.05, 1.85], uZenith: [0.05, 0.1, 0.24], uHorizon: [0.3, 0.32, 0.35], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4,
      uCloudBright: [0.85, 0.84, 0.82], uCloudShade: [0.5, 0.53, 0.58], uCloudCover: 0.22, uSunDisk: 60 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(32, ctx.aspect), ctx.aspect, 0.2, 16000);
  // saplings and scrub pushing through the asphalt and the pavements; tall grass on the verges
  const rnd = mulberry32(77);
  const young = [], scrub = [];
  for (let k = 0; k < 140; k++) { const s = 40 + rnd() * 260, l = (rnd() - 0.5) * 30; const c = at(s, l); young.push([c.x, c.z, 2.5 + rnd() * 5, rnd() < 0.6 ? 'birch' : 'poplar']); }
  for (let k = 0; k < 500; k++) { const s = 40 + rnd() * 240, l = (rnd() - 0.5) * 34; const c = at(s, l); scrub.push([c.x, c.z, 0.7 + rnd() * 1.4, rnd() < 0.5 ? 'linden' : 'birch']); }
  scene.add(msaaLeaves(ctx, buildTrees3D(young, { leafiness: 1.0, seed: 21 })));
  scene.add(msaaLeaves(ctx, buildTrees3D(scrub, { leafiness: 1.0, seed: 22 })));
  // moss and grass over the road
  const moss = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, transparent: true, depthWrite: false });
  const S = st.S;
  patchMaterial(moss, {
    key: 'moss7', uniforms: { tNoise: { value: ctx.noiseTex } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz; float n = texture(tNoise, vec3(p * 0.05, 0.3)).r, n2 = texture(tNoise, vec3(p * 0.6, 0.6)).g, n3 = texture(tNoise, vec3(p * 3.0, 0.9)).b;
        float cover = smoothstep(0.38, 0.62, n * 0.7 + n2 * 0.3);
        diffuseColor.rgb = mix(vec3(0.06, 0.08, 0.025), vec3(0.12, 0.13, 0.05), n3);
        diffuseColor.a = cover * 0.95; }`]],
  });
  const mossPlane = new THREE.Mesh(new THREE.PlaneGeometry(40, 400), moss); mossPlane.rotation.x = -Math.PI / 2; mossPlane.rotation.z = -Math.atan2(D.x, D.z) + 0; mossPlane.position.copy(at(170, 0, 0.03)); mossPlane.receiveShadow = true; scene.add(mossPlane);
  mossPlane.rotation.set(-Math.PI / 2, 0, Math.atan2(D.x, D.z));
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.87), sunI: 3.2, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: at(150, 0), extent: 200, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.06, 0.065, 0.055));
  LEAF_AMB.sky.value.setRGB(0.26, 0.29, 0.33);
  atmosphere({ sun: SUN, fog: [0.3, 0.32, 0.35], density: 0.0007, height: 160, glow: [0.3, 0.26, 0.18] });
  // the bicycle from 1986, rusted, half in the grass
  const bike = bicycle(); bike.position.copy(at(154, -13.6, 0.0)); bike.rotation.set(0, Math.atan2(-R.z, R.x) + 0.35, 0); bike.rotateX(1.35); bike.position.y = 0.12;
  bike.traverse(o => { if (o.isMesh && o.material.color) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0.18, 0.08, 0.04), 0.7); } }); scene.add(bike);
  const camA = at(164, -11.9, 1.25), camB = at(160.5, -11.8, 1.25);
  return {
    scene, camera,
    look: { uExposure: 0.92, uLookPow: 1.16, uLookSat: 0.95, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), at(-200, -4.5, 5), { focal: 32, shake: 0.04, shakeFreq: 0.3, t, seed: 1233 });
      return debugCam(ctx, camera, at) || { dof: { focus: 14, focal: 32, fstop: 4 } };
    },
  };
}

// ---------------- V4: the Duga over-the-horizon radar, silent in the forest ----------------
function dugaArray({ length = 460, height = 135, towers = 32 } = {}) {
  const g = new THREE.Group();
  const steel = mat([0.26, 0.27, 0.27], 0.6, 0.6, 'duga'), rust = mat([0.24, 0.15, 0.1], 0.8, 0.3, 'dugarust');
  const geos = [], geosR = [];
  const add = (geo, x, y, z, rz = 0, list = geos) => { geo.rotateZ(rz); geo.translate(x, y, z); list.push(geo.toNonIndexed()); };
  for (let k = 0; k <= towers; k++) {
    const x = -length / 2 + k * length / towers, h = height * (k % 4 === 0 ? 1 : 0.94);
    for (const z of [-2.5, 2.5]) add(new THREE.BoxGeometry(0.5, h, 0.5), x, h / 2, z);
    for (let y = 6; y < h; y += 9) { add(new THREE.BoxGeometry(0.15, 0.15, 5.0), x, y, 0); add(new THREE.BoxGeometry(0.12, 12.4, 0.12), x, y + 4.5, 0, 0.0, geosR); }
  }
  for (let y = 8; y < height; y += 7.5) for (const z of [-2.5, 2.5]) add(new THREE.BoxGeometry(length, 0.16, 0.16), 0, y, z);
  // the antenna elements: rows of short dipole tubes on the front face
  for (let y = 12; y < height - 6; y += 10) for (let x = -length / 2 + 4; x < length / 2; x += 8) { const c = new THREE.CylinderGeometry(0.12, 0.12, 6.5, 6); add(c, x, y, -3.4, Math.PI / 2 * 0); }
  for (let x = -length / 2; x < length / 2; x += 14.4) add(new THREE.BoxGeometry(0.1, Math.hypot(14.4, 9), 0.1), x + 7.2, height / 2, 2.5, Math.atan2(14.4, 9));
  const m = new THREE.Mesh(mergeGeometries(geos), steel); m.castShadow = true; m.receiveShadow = true; g.add(m);
  const m2 = new THREE.Mesh(mergeGeometries(geosR), rust); m2.castShadow = true; g.add(m2);
  return g;
}
export async function V4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(35, ctx.aspect), ctx.aspect, 0.5, 16000);
  const SUN = sunDir(95, 7);
  const sk = daySky(ctx, SUN, { uSunCol: [2.2, 1.5, 0.95], uZenith: [0.06, 0.09, 0.17], uHorizon: [0.34, 0.3, 0.27], uDawn: [0.5, 0.26, 0.1], uDawnPow: 4, uCloudBright: [0.82, 0.7, 0.58], uCloudShade: [0.32, 0.31, 0.33], uCloudCover: 0.4, uSunDisk: 60 });
  scene.add(sk);
  const O = V3(-9000, 0, -9000);
  scene.add(forestFloor(ctx, { center: [O.x, O.z], radius: 1500, color: [0.05, 0.055, 0.03], y: 0.02 }));
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1500, count: 45000, exclude: [[O.x, O.z - 40, 70], [O.x, O.z + 140, 140], [O.x, O.z + 380, 230], [O.x - 180, O.z - 20, 60], [O.x + 180, O.z - 20, 60]], seed: 41 }));
  const rnd = mulberry32(51);
  const trees = [];
  for (let k = 0; k < 160; k++) { const sd = rnd() < 0.5 ? -1 : 1, x = O.x + sd * (45 + rnd() * 160), z = O.z + 200 + rnd() * 420; trees.push([x, z, 9 + rnd() * 9, rnd() < 0.7 ? 'birch' : 'poplar']); }
  scene.add(msaaLeaves(ctx, buildTrees3D(trees, { leafiness: 0.9, seed: 13 })));
  const duga = dugaArray(); duga.position.copy(O).add(V3(0, 0, -40)); scene.add(duga);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.72, 0.45), sunI: 2.6, skyColor: new THREE.Color(0.3, 0.36, 0.46), groundColor: new THREE.Color(0.05, 0.05, 0.04), hemiI: 0.08, center: O, extent: 300, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.05, 0.05, 0.04));
  LEAF_AMB.sky.value.setRGB(0.3, 0.3, 0.32); LEAF_AMB.ground.value.setRGB(0.05, 0.05, 0.035);
  atmosphere({ sun: SUN, fog: [0.36, 0.33, 0.3], density: 0.0015, height: 45, glow: [0.9, 0.55, 0.28], glowPow: 7, halo: [1.0, 0.6, 0.3] });
  const camA = O.clone().add(V3(-40, 1.7, 560)), camB = O.clone().add(V3(-26, 1.8, 540));
  return {
    scene, camera,
    look: { uExposure: 0.92, uLookPow: 1.18, uLookSat: 0.85, uBloom: 0.07, uHalation: 0.1, uVignette: 0.62, uGrain: 0.05, uShadowTint: [0.92, 1.0, 1.1], uHighTint: [1.07, 1.0, 0.88] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 15)), O.clone().add(V3(10, 78, -40)), { focal: 35, shake: 0.04, shakeFreq: 0.3, t, seed: 1244 });
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || { fade: smoothstep(13.2, 14.8, t) };
    },
  };
}
