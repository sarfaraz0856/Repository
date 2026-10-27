// THE SILENCE (28 April – 10 May 1986): the sealed zone at night, May Day parades in the
// fallout, the three volunteers in the flooded basement, an evacuated village of the 30 km zone,
// and the night the core fire finally went out.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { patchMaterial, ATM, makeSky } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights, envFromSky } from './lib/daysky.js';
import { makeCar, makeCivilian, makeLiquidator, clipSpeed, buildTrees3D, LEAF_AMB, contactShadow } from './lib/street.js';
import { loadRig, pose } from './lib/people.js';
import { VolumeFX } from './lib/volume.js';
import { fovFromFocalH, fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { buildForest } from './lib/city.js';
import { PLANT } from './lib/plant.js';
import { placeCamera, plantWorld, addFire, MOON_DIR } from './shots_plant.js';
import { streetWorld, debugCam, placeWalker } from './part2.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z) => V3(x, y, z).add(PLANT);
const atP = (s, l, y = 0) => P(s, y, l);
const mat = (c, r = 0.8, m = 0, key = 'p4') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });

// waving cloth (flags, banners) and a vertex sway shared through ATM.uTime
function clothMaterial(color, key) {
  const m = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...color), roughness: 0.85, side: THREE.DoubleSide }), { key, uniforms: { uWT: ATM.uTime }, vertexHeader: 'uniform float uWT;' });
  m.onBeforeCompile = ((prev) => (sh, r) => { prev(sh, r); sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    { float u = uv.x; vec2 io = vec2(0.0);
      #ifdef USE_INSTANCING
        io = instanceMatrix[3].xz;
      #endif
      float ph = io.x * 0.7 + io.y * 0.4;
      transformed.z += (sin(uWT * 5.5 - u * 7.0 + ph) * 0.09 + sin(uWT * 3.1 - u * 4.0 + ph) * 0.05) * u; }`); })(m.onBeforeCompile);
  return m;
}

// ---------------- R1: the zone is sealed. A militia checkpoint, the ruin glowing beyond ----------------
export async function R1(ctx) {
  const W = await plantWorld(ctx, { focal: 85, city: false, fog: 0.0009, floodGain: 0.0, lampGain: 0.4, moon: 0.1, near: 0.3 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.3;
  const fire = addFire(ctx, W, { emberCount: 200, roofFires: false, fireLight: 0.6, plumeDensity: 1.1 });
  sky.uniforms.uSkyGlowDir.value.set(1, 0, 0.3).normalize(); sky.uniforms.uSkyGlowCol.value.setRGB(0.02, 0.008, 0.003);
  // the road west of the plant with the checkpoint
  const C = P(-720, 0, 380); const toPlant = P(0, 0, 0).sub(C).setY(0).normalize(); const side = V3(-toPlant.z, 0, toPlant.x);
  const yaw = Math.atan2(-toPlant.z, toPlant.x);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(900, 7), mat([0.035, 0.035, 0.037], 0.75, 0, 'r1road')); road.rotation.x = -Math.PI / 2; road.rotation.z = yaw;
  road.position.copy(C).addScaledVector(toPlant, 300).setY(0.06); road.receiveShadow = true; scene.add(road);
  // boom gate: striped pole on a post with counterweight; a sentry box
  const gate = new THREE.Group(); gate.position.copy(C).addScaledVector(side, 4.2); gate.rotation.y = yaw + Math.PI / 2; scene.add(gate);
  const red = mat([0.4, 0.03, 0.02], 0.5, 0, 'gred'), white = mat([0.55, 0.55, 0.53], 0.5, 0, 'gwhite'), grey = mat([0.12, 0.12, 0.12], 0.8, 0, 'ggrey');
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.3), grey); post.position.y = 0.55; gate.add(post);
  for (let k = 0; k < 8; k++) { const seg = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.12), k % 2 ? red : white); seg.position.set(0.45 + k * 0.9, 1.05, 0); seg.castShadow = true; gate.add(seg); }
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 1.8), mat([0.16, 0.18, 0.15], 0.8, 0, 'booth')); box.position.copy(C).addScaledVector(side, 6.5).addScaledVector(toPlant, -3).setY(1.2); box.rotation.y = yaw; box.castShadow = true; scene.add(box);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.75, 0.4).multiplyScalar(0.7) })); win.position.copy(box.position).addScaledVector(side, -0.91).setY(1.6); win.rotation.y = yaw - Math.PI / 2; scene.add(win);
  // militia car with its blue beacon, parked by the gate
  const car = makeCar({ color: new THREE.Color(0.5, 0.42, 0.1) }); car.group.position.copy(C).addScaledVector(side, -3.4).addScaledVector(toPlant, -6); car.group.rotation.y = yaw + 0.1; scene.add(car.group);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.16, 12), new THREE.MeshBasicMaterial({ color: 0x3366ff })); beacon.position.set(-0.2, 1.53, 0); car.group.add(beacon);
  const blue = new THREE.PointLight(new THREE.Color(0.25, 0.4, 1.0), 0, 30, 2); blue.position.copy(car.group.position).setY(1.8); scene.add(blue);
  // a militiaman by the gate
  const rig = await loadRig();
  const man = makeLiquidator(rig, { seed: 5, shovel: false, helmet: 'cap' });
  man.root.position.copy(C).addScaledVector(side, 2.0).addScaledVector(toPlant, -1.2); man.root.rotation.y = Math.atan2(toPlant.x, toPlant.z) + 2.6; scene.add(man.root);
  const camA = C.clone().addScaledVector(toPlant, -11).addScaledVector(side, -0.6).setY(1.3), camB = camA.clone().addScaledVector(toPlant, 1.2);
  return {
    scene, camera,
    look: { uExposure: 1.3, uLookPow: 1.28, uLookSat: 0.95, uBloom: 0.08, uHalation: 0.12, uVignette: 0.68 },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 11)), P(-60, 95, 30), { focal: 40, shake: 0.06, shakeFreq: 0.35, t, seed: 911 });
      const ph = (t * 1.6) % 1; const on = ph < 0.18 || (ph > 0.3 && ph < 0.42) ? 1 : 0;
      beacon.material.color.setRGB(0.25, 0.4, 1.0).multiplyScalar(on ? 40 : 0.4); blue.intensity = on ? 220 : 0;
      pose(man, 'Idle', t, { offset: 0.4 });
      fire.update(t + 400, camera, { gain: 0.6, plumeH: 560, column: 0, flameGain: 0.6, volMoon: [0.03, 0.035, 0.045], volAmb: [0.003, 0.0035, 0.005] });
      return debugCam(ctx, camera, atP) || { dof: { focus: 11, focal: 40, fstop: 2.8 } };
    },
  };
}

// ---------------- R2: May Day. The parade went ahead. ----------------
export async function R2(ctx) {
  const SUN = sunDir(165, 52);
  const W = await streetWorld(ctx, {
    sun: SUN, plume: false, washing: true,
    sky: { uSunCol: [2.2, 2.05, 1.85], uZenith: [0.05, 0.1, 0.24], uHorizon: [0.3, 0.32, 0.35], uDawn: [0.02, 0.015, 0.01], uDawnPow: 4,
      uCloudBright: [0.85, 0.84, 0.82], uCloudShade: [0.5, 0.53, 0.58], uCloudCover: 0.14, uSunDisk: 60 },
  });
  const { scene, st } = W; const { at, D, R } = st;
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(85, ctx.aspect), ctx.aspect, 0.3, 16000);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.95, 0.87), sunI: 3.3, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: at(150, 0), extent: 200, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, W.sky, new THREE.Color(0.06, 0.065, 0.055));
  LEAF_AMB.sky.value.setRGB(0.26, 0.29, 0.33);
  ATM.uMoonDir.value.copy(SUN); ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(0.3, 0.32, 0.35); ATM.uFogDensity.value = 0.0007; ATM.uFogHeight.value = 160; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(0.3, 0.26, 0.18); ATM.uGlowPow.value = 6;
  ATM.uMoonHalo.value.setRGB(0.25, 0.22, 0.17); ATM.uFireFog.value.setRGB(0, 0, 0);
  const rig = await loadRig();
  const vWalk = clipSpeed(rig, 'Walk');
  const rnd = mulberry32(51);
  const marchers = [];
  const ROWS = 26, COLS = 6;
  const poleM = mat([0.3, 0.22, 0.12], 0.7, 0, 'pole4');
  const flagM = clothMaterial([0.5, 0.02, 0.02], 'flag');
  const flagGeo = new THREE.PlaneGeometry(1.3, 0.85, 12, 4); flagGeo.translate(0.65, 0, 0);
  const banGeo = new THREE.PlaneGeometry(3.2, 0.9, 20, 3); banGeo.translate(1.6, 0, 0);
  const balloonM = [mat([0.55, 0.04, 0.03], 0.35, 0, 'balr'), mat([0.6, 0.6, 0.58], 0.35, 0, 'balw'), mat([0.55, 0.45, 0.05], 0.35, 0, 'baly')];
  const F = D.clone().negate();                 // marching west-north-west, toward the camera
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const kind = rnd() < 0.42 ? 'man' : rnd() < 0.86 ? 'woman' : 'child';
    const p = makeCivilian(rig, { seed: 600 + r * COLS + c, kind, bag: 'none' });
    scene.add(p.root, p.ao);
    const m = { c: p, s0: 30 + r * 2.4 + (rnd() - 0.5) * 0.4, l: -5.5 + c * 2.2 + (rnd() - 0.5) * 0.4, rate: 0.9 + rnd() * 0.06, off: rnd() * 2, props: [] };
    const roll = rnd();
    if (roll < 0.22 && kind !== 'child') {     // a flag on a pole
      const g = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.6, 6), poleM); pole.position.y = 1.3; g.add(pole);
      const fl = new THREE.Mesh(flagGeo, flagM); fl.position.y = 2.2; g.add(fl); g.traverse(o => { o.castShadow = true; }); scene.add(g); m.props.push({ g, dl: 0.32, h: 0.6 });
    } else if (roll < 0.36) {                   // balloons on strings
      const g = new THREE.Group(); const n = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), balloonM[Math.floor(rnd() * 3)]); b.scale.set(1, 1.18, 1); b.position.set((rnd() - 0.5) * 0.35, 2.6 + rnd() * 0.5, (rnd() - 0.5) * 0.3); g.add(b);
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, b.position.y - 1.0, 3), poleM); s.position.set(b.position.x * 0.5, (b.position.y + 1.0) / 2, b.position.z * 0.5); g.add(s); }
      scene.add(g); m.props.push({ g, dl: 0.3, h: 0, bob: true });
    }
    marchers.push(m);
  }
  // banners across the column every few rows, carried between two poles
  const banners = [];
  for (const r of [3, 11, 19]) {
    const g = new THREE.Group(); const b = new THREE.Mesh(banGeo, clothMaterial([0.48, 0.03, 0.025], 'banner')); b.position.set(0, 2.5, 0); g.add(b);
    for (const x of [0, 3.2]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.0, 6), poleM); pl.position.set(x, 1.5, 0); g.add(pl); }
    g.traverse(o => { o.castShadow = true; }); scene.add(g); banners.push({ g, s0: 30 + r * 2.4 - 1.1, l: -2.0 });
  }
  const camA = at(-12, 20, 7.5), camB = at(-12.6, 19.7, 7.3);
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.16, uLookSat: 0.95, uBloom: 0.05, uHalation: 0.06, uVignette: 0.5, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.05, 1.0, 0.92] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 12)), at(50, -1.0, 1.4), { focal: 85, shake: 0.05, shakeFreq: 0.35, t, seed: 922 });
      const yawF = Math.atan2(F.x, F.z);
      for (const m of marchers) {
        const s = m.s0 - vWalk * m.rate * m.c.scale * t;
        const pos = at(s, m.l); m.c.root.position.copy(pos); m.c.root.rotation.y = yawF; m.c.ao.position.set(pos.x, 0.045, pos.z);
        pose(m.c, 'Walk', t, { offset: m.off, rate: m.rate });
        for (const pr of m.props) {
          pr.g.position.copy(pos).addScaledVector(R, -pr.dl * (m.l > 0 ? 1 : 1)).add(V3(0, pr.bob ? Math.sin(t * 2 + m.off) * 0.05 : Math.abs(Math.sin(t * 3.2 + m.off)) * 0.04, 0));
          pr.g.rotation.y = Math.atan2(-R.z, R.x) + Math.PI + Math.sin(t * 0.8 + m.off) * 0.15;
        }
      }
      for (const b of banners) { const s = b.s0 - vWalk * 0.92 * t; b.g.position.copy(at(s, b.l)); b.g.rotation.y = Math.atan2(R.z, -R.x); }
      return debugCam(ctx, camera, at) || { dof: { focus: 48, focal: 85, fstop: 4 } };
    },
  };
}

// ---------------- R3: the flooded basement under the reactor, three volunteers ----------------
export async function R3(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(24, ctx.aspect), ctx.aspect, 0.05, 400);
  const O = V3(0, -1000, 0);                    // a set of its own, far from everything
  const conc = mat([0.16, 0.16, 0.15], 0.9, 0, 'bconc');
  const steelM = mat([0.12, 0.11, 0.1], 0.5, 0.7, 'bsteel');
  const W_ = 3.4, H_ = 2.8, L_ = 60;
  const room = new THREE.Group(); room.position.copy(O); scene.add(room);
  const wall = (w, h, d, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), conc); b.position.set(x, y, z); b.receiveShadow = true; b.castShadow = true; room.add(b); };
  wall(W_ + 1, 0.4, L_, 0, -0.2, -L_ / 2); wall(W_ + 1, 0.4, L_, 0, H_ + 0.2, -L_ / 2);
  wall(0.4, H_, L_, -W_ / 2 - 0.2, H_ / 2, -L_ / 2); wall(0.4, H_, L_, W_ / 2 + 0.2, H_ / 2, -L_ / 2);
  for (let k = 0; k < 12; k++) wall(W_, 0.35, 0.5, 0, H_ - 0.17, -3 - k * 5);       // ceiling beams
  for (const [x, y, r] of [[-1.35, 2.2, 0.16], [-1.35, 1.75, 0.11], [1.4, 2.35, 0.2], [1.38, 1.55, 0.08]]) {
    const pp = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L_, 10), steelM); pp.rotation.x = Math.PI / 2; pp.position.set(x, y, -L_ / 2); pp.castShadow = true; room.add(pp);
  }
  for (let k = 0; k < 10; k++) { const v = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 14), steelM); v.position.set(1.15, 2.35, -6 - k * 5.5); v.rotation.y = Math.PI / 2; room.add(v); }
  // radioactive water, knee to waist deep
  const waterM = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.006, 0.008, 0.008), roughness: 0.06, metalness: 0.0 }), {
    key: 'bwater', uniforms: { uWT: ATM.uTime },
    fragmentHeader: 'uniform float uWT;',
    fragmentReplace: [['#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      { vec2 p = vWPos.xz; float a = sin(p.x * 3.1 + uWT * 1.3) * 0.5 + sin(p.y * 2.3 - uWT * 1.7) * 0.5 + sin((p.x + p.y) * 5.7 + uWT * 2.1) * 0.25;
        float b = cos(p.x * 2.7 - uWT * 1.1) * 0.5 + cos(p.y * 3.3 + uWT * 1.5) * 0.5;
        normal = normalize(normal + mat3(viewMatrix) * (vec3(a, 0.0, b) * 0.06)); }`]],
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(W_, L_, 1, 1), waterM); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.85, -L_ / 2); room.add(water);
  ATM.uFogColor.value.setRGB(0.0, 0.0, 0.0); ATM.uFogDensity.value = 0.02; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -2000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  // the three men: dark wetsuits, helmets with lamps
  const rig = await loadRig();
  const men = [];
  const lamps = [];
  for (let k = 0; k < 3; k++) {
    const c = makeLiquidator(rig, { seed: 700 + k, shovel: false, helmet: 'hat' });
    c.root.traverse(o => { if (o.isMesh && o.material.color) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.35); } });
    scene.add(c.root);
    const sp = new THREE.SpotLight(new THREE.Color(1.0, 0.92, 0.75), 0, 30, THREE.MathUtils.degToRad(16), 0.5, 2);
    sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.camera.near = 0.2; sp.shadow.camera.far = 30; sp.shadow.bias = -0.0005;
    scene.add(sp, sp.target); lamps.push(sp);
    men.push({ c, z0: -4.0 - k * 1.8, x: [-0.55, 0.6, -0.1][k], off: k * 0.6 });
  }
  // mist in the corridor so the lamp beams show
  const vol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: O.clone().add(V3(-W_ / 2, 0.85, -L_)).toArray(), boxMax: O.clone().add(V3(W_ / 2, H_, 0)).toArray(), steps: 64, shadowSteps: 2, albedo: 0.8 });
  scene.add(vol.mesh);
  const fill = new THREE.PointLight(new THREE.Color(1.0, 0.9, 0.75), 4, 12, 2); scene.add(fill);
  const camA = O.clone().add(V3(0.25, 1.55, 0.2)), camB = O.clone().add(V3(0.15, 1.5, -2.3));
  return {
    scene, camera,
    look: { uExposure: 2.4, uLookPow: 1.3, uLookSat: 0.6, uBloom: 0.1, uHalation: 0.14, uVignette: 0.8, uGrain: 0.09, uShadowTint: [0.92, 1.0, 1.1], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      const p = camA.clone().lerp(camB, easeInOutSine(t / 12));
      placeCamera(camera, ctx, p, p.clone().add(V3(0.05, -0.15, -6)), { focal: 24, shake: 0.35, shakeFreq: 0.7, t, seed: 933 });
      fill.position.copy(p).add(V3(0.4, 0.3, 0.6));
      const vl = [];
      men.forEach((m, k) => {
        const z = m.z0 - 0.42 * t; const pos = O.clone().add(V3(m.x + Math.sin(t * 0.7 + k) * 0.05, 0.0, z));
        m.c.root.position.copy(pos); m.c.root.rotation.y = Math.PI + Math.sin(t * 0.5 + k) * 0.12;
        pose(m.c, 'Walk', t, { offset: m.off, rate: 0.42 });
        const head = pos.clone().add(V3(0, 1.72, 0)); const dir = V3(Math.sin(t * 0.9 + k * 2) * 0.25, -0.12 + Math.sin(t * 0.6 + k) * 0.05, -1).normalize();
        lamps[k].position.copy(head); lamps[k].target.position.copy(head).addScaledVector(dir, 10); lamps[k].intensity = 60 * (0.9 + 0.1 * noise1(t * 7, k));
        if (vl.length < 3) vl.push({ pos: head.toArray(), range: 14, color: [0.5, 0.46, 0.38], cone: Math.cos(THREE.MathUtils.degToRad(16)), dir: dir.toArray() });
      });
      vol.setGround({ center: O.clone().add(V3(0, 0.85, -L_ / 2)).toArray(), radius: L_ * 0.7, height: 1.2, density: 0.25, noiseScale: 0.5, drift: [0.05, 0.02, -0.1] });
      vol.setLights(vl);
      vol.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: [0, 1, 0], moonCol: [0, 0, 0], ambTop: [0.0, 0.0, 0.0], ambBot: [0.0, 0.0, 0.0], ext: 0.3, minStep: 0.15 });
      vol.update(t, Math.round(t * 24), camera);
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(l, y, -s))) || {};
    },
  };
}

// ---------------- R4: an evacuated village in the 30 km zone, gardens in blossom ----------------
function khata(rnd, mats) {
  const g = new THREE.Group();
  const w = 7 + rnd() * 2.5, d = 5.5 + rnd() * 1.5, h = 2.7;
  const wallM = rnd() < 0.55 ? mats.lime : mats.log;
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM); b.position.y = h / 2; b.castShadow = true; b.receiveShadow = true; g.add(b);
  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.35, d + 0.2), mats.plinth); base.position.y = 0.17; g.add(base);
  // gable roof as an extruded triangle, overhanging
  const rh = 2.4 + rnd() * 0.6; const sh = new THREE.Shape([new THREE.Vector2(-d / 2 - 0.5, 0), new THREE.Vector2(0, rh), new THREE.Vector2(d / 2 + 0.5, 0)]);
  const rg = new THREE.ExtrudeGeometry(sh, { depth: w + 0.8, bevelEnabled: false }); rg.translate(0, 0, -(w + 0.8) / 2); rg.rotateY(Math.PI / 2);
  const roof = new THREE.Mesh(rg, rnd() < 0.5 ? mats.tin : mats.shingle); roof.position.y = h; roof.castShadow = true; roof.receiveShadow = true; g.add(roof);
  const gable = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(0, rh - 0.3), new THREE.Vector2(d / 2, 0)])), mats.board);
  for (const sx of [-1, 1]) { const gb = gable.clone(); gb.rotation.y = sx * Math.PI / 2; gb.position.set(sx * (w / 2 + 0.01), h, 0); g.add(gb); }
  // windows with painted frames and shutters on the street side (+z)
  const nW = Math.max(2, Math.round(w / 2.6));
  for (let k = 0; k < nW; k++) {
    const x = -w / 2 + (k + 0.5) * w / nW;
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.95, 0.04), mats.glass); glass.position.set(x, 1.55, d / 2 + 0.01); g.add(glass);
    for (const [fw, fh, fx, fy] of [[0.9, 0.08, 0, 0.5], [0.9, 0.1, 0, -0.5], [0.08, 1.05, -0.44, 0], [0.08, 1.05, 0.44, 0], [0.05, 0.95, 0, 0]]) { const fr = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, 0.06), mats.frame); fr.position.set(x + fx, 1.55 + fy, d / 2 + 0.03); g.add(fr); }
    for (const sx of [-1, 1]) { const shu = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.0, 0.04), mats.shutter); shu.position.set(x + sx * 0.66, 1.55, d / 2 + 0.03); g.add(shu); }
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.95, 0.05), mats.board); door.position.set(w / 2 - 1.1, 0.98, d / 2 + 0.02); g.add(door);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), mats.plinth); ch.position.set(-w * 0.2, h + rh * 0.7, -0.6); ch.castShadow = true; g.add(ch);
  return { group: g, w, d };
}
export async function R4(ctx) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fovFromFocalH(50, ctx.aspect), ctx.aspect, 0.3, 16000);
  const SUN = sunDir(262, 20);
  const sk = makeDaySky({ noiseTex: ctx.noiseTex });
  const so = { uSunCol: [2.4, 1.9, 1.3], uZenith: [0.05, 0.1, 0.22], uHorizon: [0.3, 0.29, 0.28], uDawn: [0.3, 0.17, 0.07], uDawnPow: 4, uCloudBright: [0.85, 0.8, 0.74], uCloudShade: [0.4, 0.42, 0.46], uCloudCover: 0.25, uSunDisk: 60 };
  for (const [k, v] of Object.entries(so)) { const u = sk.uniforms[k]; if (u.value?.setRGB && Array.isArray(v)) u.value.setRGB(...v); else u.value = v; }
  sk.uniforms.uSunDir.value.copy(SUN); scene.add(sk);
  const O = V3(-6000, 0, -2500);
  // ground: dirt road through grass, worn tracks
  const gm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  patchMaterial(gm, {
    key: 'village', uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: O } },
    fragmentHeader: 'precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 p = vWPos.xz - uO.xz; float n = texture(tNoise, vec3(p * 0.02, 0.3)).r, n2 = texture(tNoise, vec3(p * 0.15, 0.6)).g, n3 = texture(tNoise, vec3(p * 0.9, 0.2)).b;
        float road = 1.0 - smoothstep(1.8, 2.6, abs(p.y + (n - 0.5) * 2.0));
        float rut = (1.0 - smoothstep(0.15, 0.45, abs(abs(p.y) - 0.85))) * road;
        vec3 grass = mix(vec3(0.05, 0.085, 0.025), vec3(0.1, 0.11, 0.05), smoothstep(0.4, 0.8, n2)) * (0.75 + 0.5 * n3);
        grass = mix(grass, vec3(0.55, 0.45, 0.06), step(0.88, n3) * 0.6);
        vec3 dirt = vec3(0.075, 0.06, 0.045) * (0.8 + 0.35 * n2) * (1.0 - 0.25 * rut);
        diffuseColor.rgb = mix(grass, dirt, road); }`]],
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), gm); ground.rotation.x = -Math.PI / 2; ground.position.copy(O); ground.receiveShadow = true; scene.add(ground);
  const mats = {
    lime: mat([0.55, 0.55, 0.52], 0.95, 0, 'klime'), log: mat([0.16, 0.12, 0.09], 0.95, 0, 'klog'), plinth: mat([0.2, 0.2, 0.19], 0.95, 0, 'kplin'),
    tin: mat([0.22, 0.24, 0.24], 0.5, 0.6, 'ktin'), shingle: mat([0.1, 0.09, 0.08], 0.9, 0, 'kshing'), board: mat([0.14, 0.11, 0.08], 0.9, 0, 'kboard'),
    glass: patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.022, 0.025), roughness: 0.08 }), { key: 'kglass' }),
    frame: mat([0.6, 0.6, 0.58], 0.7, 0, 'kframe'), shutter: mat([0.12, 0.25, 0.4], 0.7, 0, 'kshut'),
  };
  const rnd = mulberry32(64);
  const trees = [];
  const fenceGeo = []; const fenceM = mat([0.2, 0.17, 0.13], 0.95, 0, 'fence');
  for (const side of [-1, 1]) for (let k = 0; k < 7; k++) {
    const x = -90 + k * 26 + (rnd() - 0.5) * 6, z = side * (17 + rnd() * 4);
    const h = khata(rnd, mats); h.group.position.copy(O).add(V3(x, 0, z)); h.group.rotation.y = side > 0 ? Math.PI : 0; h.group.rotation.y += (rnd() - 0.5) * 0.08; scene.add(h.group);
    // picket fence along the road in front of each yard, with a gate gap
    for (let f = -11; f <= 11; f += 0.32) { if (Math.abs(f - 2) < 0.9) continue; const pk = new THREE.BoxGeometry(0.09, 1.25 + 0.06 * Math.sin(f * 9), 0.03); pk.translate(x + f, 0.62, z - side * 9.0); fenceGeo.push(pk); }
    for (const yy of [0.35, 1.0]) { const rail = new THREE.BoxGeometry(22, 0.07, 0.05); rail.translate(x, yy, z - side * 8.95); fenceGeo.push(rail); }
    for (let k2 = 0; k2 < 3; k2++) trees.push([O.x + x + (rnd() - 0.5) * 16, O.z + z - side * (4 + rnd() * 3), 5 + rnd() * 2.5, 'apple']);
  }
  const fence = new THREE.Mesh(mergeGeometries(fenceGeo.map(g => g.toNonIndexed())), fenceM); fence.position.copy(O); fence.castShadow = true; fence.receiveShadow = true; scene.add(fence);
  for (let k = 0; k < 18; k++) trees.push([O.x - 120 + rnd() * 220, O.z + (rnd() < 0.5 ? -1 : 1) * (40 + rnd() * 30), 11 + rnd() * 6, rnd() < 0.5 ? 'birch' : 'linden']);
  const tg = buildTrees3D(trees, { leafiness: 0.9, seed: 7 });
  if (ctx.msaa > 0) tg.traverse(o => { if (o.isMesh && o.material.map && o.material.alphaTest) o.material.alphaToCoverage = true; });
  scene.add(tg);
  scene.add(buildForest(ctx, { center: [O.x, O.z], radius: 1400, count: 30000, exclude: [[O.x, O.z, 480]], seed: 11 }));
  // a well with a sweep beam, and the road barrier at the far end of the village
  const well = new THREE.Group(); well.position.copy(O).add(V3(8, 0, -8));
  const wb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), mats.log); wb.position.y = 0.45; well.add(wb);
  const wp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 4.5, 6), mats.board); wp.position.set(1.5, 2.25, 0); well.add(wp);
  const sweep = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 9, 6), mats.board); sweep.position.set(1.5, 4.3, 0); sweep.rotation.z = 1.1; well.add(sweep);
  well.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(well);
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1.0, 0.82, 0.6), sunI: 2.8, skyColor: new THREE.Color(0.3, 0.38, 0.5), groundColor: new THREE.Color(0.06, 0.06, 0.05), hemiI: 0.06, center: O, extent: 140, near: 100, far: 7000 });
  scene.environment = envFromSky(ctx.renderer, sk, new THREE.Color(0.06, 0.07, 0.05));
  LEAF_AMB.sky.value.setRGB(0.3, 0.32, 0.35);
  ATM.uMoonDir.value.copy(SUN); ATM.uLampMapOn.value = 0; ATM.uLampGain.value = 0;
  ATM.uFogColor.value.setRGB(0.3, 0.29, 0.28); ATM.uFogDensity.value = 0.0006; ATM.uFogHeight.value = 80; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(SUN.x, 0, SUN.z).normalize(); ATM.uGlowCol.value.setRGB(0.8, 0.55, 0.3); ATM.uGlowPow.value = 8;
  ATM.uMoonHalo.value.setRGB(0.7, 0.5, 0.3); ATM.uFireFog.value.setRGB(0, 0, 0);
  const camA = O.clone().add(V3(-112, 1.5, -2.2)), camB = O.clone().add(V3(-106, 1.5, -2.0));
  return {
    scene, camera,
    look: { uExposure: 0.95, uLookPow: 1.15, uLookSat: 0.92, uBloom: 0.06, uHalation: 0.08, uVignette: 0.55, uGrain: 0.045, uShadowTint: [0.94, 1.0, 1.08], uHighTint: [1.06, 1.0, 0.9] },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 12)), O.clone().add(V3(60, 2.6, 0.5)), { focal: 50, shake: 0.04, shakeFreq: 0.3, t, seed: 944 });
      return debugCam(ctx, camera, (s, l, y = 0) => O.clone().add(V3(s, y, l))) || { dof: { focus: 40, focal: 50, fstop: 4 } };
    },
  };
}

// ---------------- R5: 10 May. The fire in the core is out. ----------------
export async function R5(ctx) {
  const W = await plantWorld(ctx, { focal: 70, city: true, fog: 0.0008, floodGain: 0.0, lampGain: 0.5, moon: 0.12 });
  const { scene, camera, plant, sky } = W;
  plant.setState(0, { destroyed: true }); plant.glowMat.uniforms.uGain.value = 0.25;
  const fire = addFire(ctx, W, { emberCount: 80, roofFires: false, fireLight: 0.3, plumeDensity: 0.7, flames: false });
  sky.uniforms.uSkyGlowDir.value.set(-0.6, 0, -0.8).normalize(); sky.uniforms.uSkyGlowCol.value.setRGB(0.008, 0.004, 0.002);
  const camA = P(-520, 70, 640), camB = P(-498, 70, 618);
  return {
    scene, camera,
    look: { uExposure: 1.55, uLookPow: 1.3, uLookSat: 0.9, uBloom: 0.08, uHalation: 0.12, uVignette: 0.7 },
    update(t) {
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 16)), P(-20, 70, 0), { focal: 70, shake: 0.03, shakeFreq: 0.3, t, seed: 955 });
      const g = 0.45 * (1 - smoothstep(1.5, 10.0, t)) + 0.04;   // the glow dies away
      fire.update(t + 700, camera, { gain: g, plumeH: 420, column: 0, flameGain: 0, volMoon: [0.035, 0.04, 0.05], volAmb: [0.003, 0.0035, 0.0055] });
      return debugCam(ctx, camera, atP) || {};
    },
  };
}
