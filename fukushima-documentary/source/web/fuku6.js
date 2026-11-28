// FUKUSHIMA, chapter 6 – THE FIGHT. 17–19 March 2011.
// FK6A: a CH-47 of the Self-Defense Forces flies over unit 3 and lets go of its bucket of sea water; most of it
//        blows away as mist. FK6B: a boom truck sprays a jet of water up onto the wrecked top of unit 3.
// FK6C: the workers who stayed (the "Fukushima 50") walk along the site road in white suits and masks.
import * as THREE from 'three';
import { patchMaterial } from './lib/atmos.js';
import { VolumeFX } from './lib/volume.js';
import { easeInOutSine, smoothstep, clamp, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { sunDir } from './lib/daysky.js';
import { fukuWorld, V3, blowTop, UNITS, SITE_Y } from './lib/fuku.js';
import { loadRig, pose } from './lib/people.js';
import { makeLiquidator } from './lib/street.js';
import { makeChinook } from './lib/chinook.js';
import { dcam, MARCH_SKY } from './fuku1.js';

const GREY_SKY = Object.assign({}, MARCH_SKY, { uZenith: [0.24, 0.27, 0.32], uHorizon: [0.56, 0.58, 0.6], uCloudCover: 0.75, uCloudBright: [0.95, 0.95, 0.96], uCloudShade: [0.46, 0.47, 0.5] });
const SUN = sunDir(150, 32);
const lit = (c, r = 0.7, m = 0, key = 'fk6') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });

function world(ctx) {
  const W = fukuWorld(ctx, { sun: SUN, sky: GREY_SKY, fog: 0.0003, fogColor: [0.5, 0.52, 0.55], sunI: 2.0, hemiI: 1.3 });
  for (const i of [0, 2, 3]) blowTop(W.units[i], W.mats);
  return W;
}
function steam(ctx, scene, box, n = [0, 2, 3], steps = 80) {
  const v = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: box[0], boxMax: box[1], steps, shadowSteps: 4, albedo: 0.78 });
  scene.add(v.mesh);
  v.setLighting({ firePos: [0, -1e5, 0], fireCol: [0, 0, 0], moonDir: SUN.toArray(), moonCol: [2.4, 2.3, 2.2], ambTop: [0.55, 0.58, 0.64], ambBot: [0.3, 0.3, 0.3], ext: 0.06, minStep: 1.5 });
  const plumes = n.map((i, k) => { const u = UNITS[i]; return { base: [u.x, SITE_Y + u.h * 0.65, u.z], r0: 7, spread: 0.35, height: 70 + k * 15, density: 0.35, rise: 3.5, wind: [0.45, -0.25], noiseScale: 1 / 14, seed: k * 0.7 + 0.2 }; });
  return (t, camera) => { v.setPlumes(plumes); v.update(t, Math.round(t * 24), camera); };
}

// Water particles with drag: each one is emitted at time te from emit(te) and drifts with the wind,
// falling at a terminal speed; it swells into mist as it ages.
class Spray {
  constructor({ n, emit, t0 = 0, t1 = 1e9, loop = 0, k = 1.2, vt = 8, wind = [0, 0, 0], size = 0.4, grow = 1.2, ground = 0, color = [0.86, 0.88, 0.9], opacity = 0.2, seed = 1 }) {
    Object.assign(this, { n, emit, t0, t1, loop, k, vt, wind: V3(...wind), size, grow, ground });
    const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(...color), roughness: 1, transparent: true, opacity, depthWrite: false, emissive: new THREE.Color(...color).multiplyScalar(0.35) });
    this.mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), patchMaterial(m, { key: 'spray' + seed }), n);
    this.mesh.frustumCulled = false;
    const r = mulberry32(seed);
    this.p = Array.from({ length: n }, () => ({ u: r(), j: V3(r() - 0.5, r() - 0.5, r() - 0.5), s: 0.5 + r(), d: V3(r() - 0.5, r() - 0.5, r() - 0.5) }));
    this.M = new THREE.Matrix4(); this.Q = new THREE.Quaternion(); this.S = V3(); this.P = V3();
  }
  update(t) {
    const { k, vt, wind, M, Q, S, P } = this;
    this.p.forEach((q, i) => {
      let te, a;
      if (this.loop) { a = ((t - q.u * this.loop) % this.loop + this.loop) % this.loop; te = t - a; }
      else { te = this.t0 + q.u * (this.t1 - this.t0); a = t - te; }
      let vis = a >= 0;
      if (vis) {
        const e = this.emit(te, q), f = (1 - Math.exp(-k * a)) / k;
        P.copy(e.p).addScaledVector(wind, a).addScaledVector(e.v.clone().sub(wind), f);
        P.y = e.p.y - vt * a + (vt + e.v.y) * f;
        if (P.y < this.ground) vis = false;
        S.setScalar(this.size * q.s * (1 + this.grow * a));
      }
      if (!vis) S.setScalar(0);
      M.compose(P, Q, S); this.mesh.setMatrixAt(i, M);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

// ---------------- FK6A: the CH-47 water drop over unit 3 (16 s) ----------------
export async function FK6A(ctx) {
  const W = world(ctx); const { scene, camera } = W;
  const u3 = UNITS[2];
  const heli = makeChinook({ bucket: true, line: 22 }); scene.add(heli.group);
  const V = V3(15, 0, 0), H0 = V3(u3.x - 15 * 8.5, 100, u3.z);
  const heliAt = (t) => H0.clone().addScaledVector(V, t).add(V3(0, Math.sin(t * 0.5) * 0.8, 0));
  const bucketAt = (t) => heliAt(t).add(V3(-5.5, -heli.bucketDepth + 0.6, 0));
  const spray = new Spray({ n: 5000, t0: 7.6, t1: 10.4, k: 1.1, vt: 9, wind: [5, 0, 3], size: 0.45, grow: 1.1, ground: SITE_Y + 1, opacity: 0.11, seed: 61,
    emit: (te, q) => ({ p: bucketAt(te).add(q.j.clone().multiplyScalar(2.2)), v: V.clone().multiplyScalar(0.8).add(q.d.clone().multiplyScalar(6)).add(V3(0, -8, 0)) }) });
  scene.add(spray.mesh);
  const st = steam(ctx, scene, [[-300, 0, -200], [300, 420, 450]]);
  const camA = V3(-20, 62, 720), camB = V3(-24, 62, 708);
  return { scene, camera,
    look: { uExposure: 1.12, uLookPow: 1.2, uLookSat: 0.82, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.055 },
    update(t) {
      const hp = heliAt(t);
      heli.group.position.copy(hp); heli.group.rotation.set(0, 0, -0.07 + 0.05 * smoothstep(7, 11, t)); heli.update(t);
      if (heli.load) heli.load.rotation.z = -0.22 + Math.sin(t * 0.8) * 0.04;
      spray.update(t); st(t, camera);
      const tgt = hp.clone().lerp(V3(u3.x, SITE_Y + 50, u3.z), 0.45);
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 16)), tgt, { focal: 95, shake: 0.12, shakeFreq: 0.45, t, seed: 601 });
      return dcam(ctx, camera) || {};
    } };
}

// a Japanese fire department boom (water tower) truck: red cab and body, white stripe, articulated boom
function boomTruck() {
  const g = new THREE.Group();
  const red = lit([0.62, 0.05, 0.04], 0.5, 0.1, 'fk6red'), white = lit([0.82, 0.82, 0.8], 0.6, 0, 'fk6wh'), dark = lit([0.04, 0.04, 0.04], 0.7, 0, 'fk6dk'), glass = lit([0.03, 0.04, 0.05], 0.1, 0, 'fk6gl'), steel = lit([0.5, 0.5, 0.5], 0.4, 0.6, 'fk6st');
  const box = (sx, sy, sz, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
  box(2.3, 2.1, 2.45, red, 3.9, 1.95, 0); box(0.05, 0.9, 2.1, glass, 5.06, 2.4, 0); box(2.2, 0.15, 2.47, white, 3.9, 1.5, 0);
  box(6.8, 1.8, 2.45, red, -0.6, 1.8, 0); box(6.8, 0.15, 2.47, white, -0.6, 1.4, 0);
  box(9.6, 0.4, 2.2, dark, 0.4, 0.75, 0);
  for (const x of [3.8, -1.6, -3.0]) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.4, 18).rotateX(Math.PI / 2), dark); w.position.set(x, 0.52, s * 1.05); g.add(w); }
  for (const x of [2.4, -3.6]) for (const s of [-1, 1]) box(0.3, 0.9, 0.3, steel, x, 0.45, s * 1.6);
  const turret = new THREE.Group(); turret.position.set(-2.4, 2.9, 0); g.add(turret);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.5, 16), steel); turret.add(base);
  const boom1 = new THREE.Group(); boom1.position.y = 0.3; turret.add(boom1);
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.55, 0.5), white); b1.position.x = 6; b1.castShadow = true; boom1.add(b1);
  const boom2 = new THREE.Group(); boom2.position.x = 12; boom1.add(boom2);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.42, 0.4), white); b2.position.x = 5; b2.castShadow = true; boom2.add(b2);
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.9, 10), steel); noz.rotation.z = -Math.PI / 2; noz.position.x = 10.4; boom2.add(noz);
  const tip = new THREE.Object3D(); tip.position.x = 10.9; boom2.add(tip);
  boom1.rotation.z = 0.95; boom2.rotation.z = -0.55;
  // the pump truck behind it and a hose
  return { group: g, tip };
}

// ---------------- FK6B: water cannon onto unit 3 (16 s) ----------------
export async function FK6B(ctx) {
  const W = world(ctx); const { scene, camera } = W;
  const u3 = UNITS[2];
  const trucks = [];
  for (const [x, z, ry] of [[-150, 128, 0], [-152, 150, 0.12]]) { const T = boomTruck(); T.group.position.set(x, SITE_Y, z); T.group.rotation.y = ry; scene.add(T.group); T.group.updateMatrixWorld(true); trucks.push(T); }
  const rig = await loadRig();
  const men = [];
  for (let k = 0; k < 4; k++) { const c = suitUp(makeLiquidator(rig, { seed: 820 + k, shovel: false, helmet: 'cap' })); c.root.position.set(-160 + k * 1.8, SITE_Y, 120 + (k % 2) * 3); c.root.rotation.y = 1.2 + k * 0.2; c.ao.position.set(c.root.position.x, SITE_Y + 0.04, c.root.position.z); scene.add(c.root, c.ao); men.push(c); }
  const jets = trucks.map((T, j) => {
    const p0 = T.tip.getWorldPosition(V3()), aim = V3(u3.x - 6 + j * 4, SITE_Y + u3.h + 6, u3.z + (j ? 6 : -4));
    const d = aim.clone().sub(p0); const tf = 1.6; const v = V3(d.x / tf, d.y / tf + 0.5 * 9.8 * tf, d.z / tf);
    const s = new Spray({ n: 2600, loop: 2.4, k: 0.25, vt: 30, wind: [3, 0, 2], size: 0.22, grow: 1.0, ground: SITE_Y + 0.5, opacity: 0.4, seed: 70 + j,
      emit: (te, q) => ({ p: p0.clone().add(q.j.clone().multiplyScalar(0.25)), v: v.clone().add(q.d.clone().multiplyScalar(1.8 + 2 * q.u)) }) });
    scene.add(s.mesh); return s;
  });
  const st = steam(ctx, scene, [[-200, 0, 0], [100, 320, 300]], [2, 3], 48);
  const camA = V3(-192, 12.6, 104), camB = V3(-188, 12.8, 110);
  return { scene, camera,
    look: { uExposure: 1.1, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.05 },
    update(t) {
      jets.forEach(s => s.update(t)); st(t, camera);
      men.forEach((c, i) => pose(c, 'Idle', t, { offset: i * 1.7 }));
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 16)), V3(-136, 22.5, 140), { focal: 26, shake: 0.08, shakeFreq: 0.35, t, seed: 602 });
      return dcam(ctx, camera) || {};
    } };
}

// white protective suit (Tyvek), hood, full-face mask: recolour a liquidator rig
function suitUp(c) {
  const white = lit([0.8, 0.81, 0.82], 0.85, 0, 'tyvek'), mask = lit([0.06, 0.06, 0.07], 0.4, 0, 'ffmask');
  c.root.traverse(o => {
    if (!o.isMesh || !o.material?.customProgramCacheKey) return;
    const k = o.material.customProgramCacheKey();
    if (k.startsWith('liqsuit')) o.material = white;
    else if (k.startsWith('liqlead')) o.visible = false;
    else if (k.startsWith('liqresp')) o.visible = false;
  });
  // full-face mask with a clear visor and twin filters, worn over the hood
  const add = (mesh, x, y, z) => { mesh.scale.multiplyScalar(100); mesh.position.set(x * 100, y * 100, z * 100); c.bones.mixamorigHead.add(mesh); return mesh; };
  const face = add(new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12, -Math.PI / 2, Math.PI, 0, Math.PI * 0.8), mask), 0, 0.08, 0.05); face.scale.z *= 0.75;
  const visor = add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10, -Math.PI * 0.4, Math.PI * 0.8, Math.PI * 0.2, Math.PI * 0.3), lit([0.35, 0.4, 0.45], 0.05, 0.3, 'visor')), 0, 0.085, 0.062);
  for (const s of [-1, 1]) { const f = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.035, 12), mask), s * 0.045, 0.03, 0.12); f.rotation.x = Math.PI / 2; f.rotation.z = s * 0.5; }
  return c;
}

// ---------------- FK6C: the workers who stayed (16 s) ----------------
export async function FK6C(ctx) {
  const W = world(ctx); const { scene, camera } = W;
  const rig = await loadRig();
  const men = [];
  for (let k = 0; k < 6; k++) {
    const c = suitUp(makeLiquidator(rig, { seed: 900 + k, shovel: false, helmet: 'cap' }));
    scene.add(c.root, c.ao); men.push({ c, x: -171.5 + (k % 2) * 1.6 + (k % 3) * 0.3, z0: 206 - k * 3.0 - (k % 2) * 1.2, sp: 1.25 + (k % 3) * 0.05 });
  }
  const st = steam(ctx, scene, [[-200, 0, 0], [100, 320, 300]], [2, 3], 40);
  const camA = V3(-172, 11.2, 236), camB = V3(-171.6, 11.3, 234);
  return { scene, camera,
    look: { uExposure: 1.08, uLookPow: 1.22, uLookSat: 0.78, uBloom: 0.05, uHalation: 0.06, uVignette: 0.6, uGrain: 0.06 },
    update(t) {
      men.forEach(({ c, x, z0, sp }, i) => {
        const z = z0 + sp * t; c.root.position.set(x, SITE_Y, z); c.root.rotation.y = 0; c.ao.position.set(x, SITE_Y + 0.04, z);
        pose(c, 'Walk', t, { offset: i * 0.37, rate: 1 });
      });
      st(t, camera);
      placeCamera(camera, ctx, camA.clone().lerp(camB, easeInOutSine(t / 16)), V3(-168, 13, 200), { focal: 45, shake: 0.1, shakeFreq: 0.4, t, seed: 603 });
      return dcam(ctx, camera) || { dof: { focus: 18, focal: 45, fstop: 4 } };
    } };
}
