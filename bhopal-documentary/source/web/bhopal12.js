// BHOPAL, chapter 12 – THE FIGHT.
// M12A survivors (mostly women) meeting in a courtyard; M12B the long march to Delhi along a highway;
// M12C the candle march on the anniversary night; M12D the march from above.
import * as THREE from 'three';
import { fovFromFocalH, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit } from './lib/bhopal.js';
import { loadRig, pose } from './lib/people.js';
import { makeCivilian } from './lib/street.js';
import { MIDDAY } from './bhopal8.js';
import { dayStage } from './bhopal9.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}
const face = (dx, dz) => Math.atan2(dx, dz) + Math.PI;    // rotation.y that makes a figure face (dx, dz)

// ---------------- M12A: the women's meeting ----------------
export async function M12A(ctx) {
  const { scene, camera } = dayStage(ctx, { ...MIDDAY, az: 130, el: 48 }, { ground: [0.38, 0.32, 0.25], extent: 40 });
  const walls = [[0.62, 0.52, 0.38], [0.5, 0.55, 0.52], [0.66, 0.6, 0.5]].map((c, i) => lit(c, 0.95, 0, 'cyw' + i)), dark = lit([0.05, 0.04, 0.035], 0.9, 0, 'cyd'), tin = lit([0.25, 0.25, 0.26], 0.5, 0.4, 'cytin');
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; scene.add(o); return o; };
  for (let i = 0; i < 5; i++) { add(new THREE.BoxGeometry(5, 3.2, 4), walls[i % 3], -10 + i * 5, 1.6, -9); add(new THREE.PlaneGeometry(0.9, 1.9), dark, -10 + i * 5 + 0.8, 0.95, -6.99); add(new THREE.BoxGeometry(5.2, 0.08, 5), tin, -10 + i * 5, 3.3, -8.7); }
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { add(new THREE.BoxGeometry(4, 3.2, 5), walls[(i + 1) % 3], s * 14, 1.6, -4 + i * 5.2); add(new THREE.PlaneGeometry(0.9, 1.9), dark, s * 11.99, 0.95, -4 + i * 5.2, -s * Math.PI / 2); }
  const line = lit([0.6, 0.6, 0.6], 0.8, 0, 'cyline'); const cl = [[0.6, 0.15, 0.1], [0.15, 0.3, 0.55], [0.7, 0.6, 0.2]].map((c, i) => lit(c, 1, 0, 'cycl' + i));
  const rope = add(new THREE.CylinderGeometry(0.01, 0.01, 16, 4), line, 0, 2.6, -5.5); rope.rotation.z = Math.PI / 2;
  for (let i = 0; i < 9; i++) add(new THREE.PlaneGeometry(0.7, 0.9), cl[i % 3], -6 + i * 1.5, 2.15, -5.5);
  const rig = await loadRig(); const cs = []; const rnd = mulberry32(121);
  const SP = V3(0, 0, -3.5);
  const sp = makeCivilian(rig, { seed: 2601, india: true, kind: 'woman', bag: 'none', outfit: { top: [0.85, 0.85, 0.82], leg: [0.85, 0.85, 0.82] } }); sp.root.position.copy(SP); sp.root.rotation.y = face(0, 1); scene.add(sp.root); sp.off = 0; cs.push(sp);
  for (let i = 0; i < 30; i++) {
    const a = -1.1 + (i % 10) / 9 * 2.2, r = 3.2 + Math.floor(i / 10) * 1.0 + rnd() * 0.3;
    const x = SP.x + Math.sin(a) * r, z = SP.z + Math.cos(a) * r;
    const c = makeCivilian(rig, { seed: 2610 + i, india: true, kind: rnd() < 0.85 ? 'woman' : 'man', bag: 'none' }); c.root.position.set(x, 0, z); c.root.rotation.y = face(SP.x - x, SP.z - z) + (rnd() - 0.5) * 0.3; c.off = rnd() * 3; scene.add(c.root); cs.push(c);
  }
  const A = V3(-3.2, 3.5, 6.2), B = V3(-2.0, 3.1, 5.0);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.92, uBloom: 0.06, uHalation: 0.08, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach(c => pose(c, 'Idle', t, { offset: c.off }));
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(0, 1.2, -3.5), { focal: 35, shake: 0.04, shakeFreq: 0.35, t, seed: 12101 });
      return dcam(ctx, camera) || { dof: { focus: 10, focal: 35, fstop: 5.6 } };
    },
  };
}

// ---------------- M12B: the march to Delhi ----------------
export async function M12B(ctx) {
  const { scene, camera } = dayStage(ctx, { ...MIDDAY, az: 75, el: 22, sunCol: [1.0, 0.86, 0.68], fog: [0.7, 0.66, 0.6], density: 0.0016, sky: { ...MIDDAY.sky, uHorizon: [0.72, 0.66, 0.58], uCloudCover: 0.15 } }, { ground: [0.4, 0.34, 0.22], extent: 120 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 2000), lit([0.12, 0.12, 0.13], 0.9, 0, 'hwy')); road.rotation.x = -Math.PI / 2; road.position.y = 0.02; road.receiveShadow = true; scene.add(road);
  const paint = lit([0.7, 0.7, 0.66], 0.8, 0, 'hwyline');
  for (let z = -900; z < 300; z += 9) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 3), paint); d.rotation.x = -Math.PI / 2; d.position.set(0, 0.03, z); scene.add(d); }
  const trunk = lit([0.25, 0.18, 0.12], 1, 0, 'hwtrunk'), leaf = [[0.14, 0.2, 0.07], [0.18, 0.22, 0.08]].map((c, i) => lit(c, 1, 0, 'hwleaf' + i)), white = lit([0.75, 0.72, 0.65], 1, 0, 'hwwhite');
  const rnd = mulberry32(122);
  for (let z = -800; z < 200; z += 14) for (const s of [-1, 1]) {
    const x = s * (9 + rnd() * 2);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 4, 8), trunk); tr.position.set(x, 2, z); tr.castShadow = true; scene.add(tr);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1.0, 8), white); band.position.set(x, 0.5, z); scene.add(band);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(3.2 + rnd(), 1), leaf[Math.floor(rnd() * 2)]); c.position.set(x, 6 + rnd(), z); c.scale.y = 0.75; c.castShadow = true; scene.add(c);
  }
  const rig = await loadRig(); const cs = [];
  for (let i = 0; i < 60; i++) {
    const row = Math.floor(i / 3), col = i % 3;
    const c = makeCivilian(rig, { seed: 2700 + i, india: true, kind: rnd() < 0.7 ? 'woman' : 'man', bag: rnd() < 0.4 ? 'sack' : 'none' });
    c.x0 = -1.6 + col * 1.6 + (rnd() - 0.5) * 0.5; c.z0 = -row * 1.6 - (rnd() * 0.4); c.off = rnd() * 3; c.root.rotation.y = face(0, 1); scene.add(c.root); cs.push(c);
  }
  // the banner carried at the front
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.9), lit([0.75, 0.68, 0.5], 1, 0, 'banner')); banner.material.side = THREE.DoubleSide; banner.castShadow = true; scene.add(banner);
  const ink = lit([0.5, 0.08, 0.06], 1, 0, 'bannerink'); const inks = [];
  for (let k = 0; k < 2; k++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(2.4 - k * 0.6, 0.12), ink); l.material.side = THREE.DoubleSide; scene.add(l); inks.push(l); }
  const poles = [0, 1].map(() => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6), trunk); scene.add(p); return p; });
  const SPEED = 0.9;
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.18, uLookSat: 0.9, uBloom: 0.08, uHalation: 0.1, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const z0 = SPEED * t;
      cs.forEach(c => { c.root.position.set(c.x0, 0, c.z0 + z0); pose(c, 'Walk', t, { offset: c.off, rate: 0.85 }); });
      const bz = z0 + 0.7; banner.position.set(0, 1.95, bz); inks.forEach((l, k) => l.position.set(0, 2.1 - k * 0.25, bz + 0.01));
      poles[0].position.set(-1.6, 1.2, bz); poles[1].position.set(1.6, 1.2, bz);
      const cam = V3(lerp(5.5, 4.0, easeInOutSine(t / 15)), 1.4, z0 + lerp(13, 11, easeInOutSine(t / 15)));
      placeCamera(camera, ctx, cam, V3(-0.5, 1.5, z0 - 6), { focal: 35, shake: 0.06, shakeFreq: 0.5, t, seed: 12202 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- M12C / M12D: the candle march ----------------
async function candleMarch(ctx, n = 160) {
  const W = bhopalWorld(ctx, { basti: false, mosque: false, litFrac: 0.05, carve: [[-30, 30, 520, 880]] });
  const { scene } = W;
  const { bazaarSet } = await import('./bhopal3.js');
  bazaarSet(scene, { z0: 540, z1: 860, half: 7 });
  const rig = await loadRig(); const cs = []; const rnd = mulberry32(123);
  const fl = new THREE.MeshBasicMaterial({ color: new THREE.Color(40, 16, 4), fog: false });
  const wax = lit([0.85, 0.82, 0.72], 0.6, 0, 'wax');
  for (let i = 0; i < n; i++) {
    const c = makeCivilian(rig, { seed: 2800 + i, india: true, bag: 'none' });
    c.x0 = -5.5 + rnd() * 11; c.z0 = 600 + rnd() * 120 + Math.abs(c.x0) * 0.5; c.off = rnd() * 3; c.root.rotation.y = face(0, 1) + (rnd() - 0.5) * 0.2; scene.add(c.root);
    if (rnd() < 0.8) { const g = new THREE.Group(); g.scale.setScalar(100); g.position.set(0, 8, 2); c.bones.mixamorigRightHand.add(g);
      const cd = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), wax); g.add(cd); const f = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), fl); f.scale.y = 1.8; f.position.y = 0.09; g.add(f); }
    cs.push(c);
  }
  const glows = []; for (let i = 0; i < 6; i++) { const pl = new THREE.PointLight(new THREE.Color(1.0, 0.6, 0.25), 6, 14, 2); scene.add(pl); glows.push(pl); }
  return { W, cs, glows };
}
const MARCH_SPEED = 0.55;
function marchUpdate(cs, glows, t) {
  const dz = MARCH_SPEED * t;
  cs.forEach(c => { c.root.position.set(c.x0, 0, c.z0 + dz); pose(c, 'Walk', t, { offset: c.off, rate: 0.6 }); });
  glows.forEach((pl, i) => pl.position.set(-4 + (i % 3) * 4, 1.6, 615 + Math.floor(i / 3) * 50 + dz));
}
export async function M12C(ctx) {
  const { W, cs, glows } = await candleMarch(ctx);
  const { scene, camera } = W;
  return {
    scene, camera,
    look: { uExposure: 1.35, uLookPow: 1.2, uLookSat: 0.9, uBloom: 0.16, uHalation: 0.2, uVignette: 0.66, uGrain: 0.055 },
    update(t) {
      marchUpdate(cs, glows, t);
      const dz = MARCH_SPEED * t;
      placeCamera(camera, ctx, V3(lerp(2.5, 1.2, easeInOutSine(t / 15)), 1.55, 732 + dz), V3(-0.5, 1.3, 690 + dz), { focal: 32, shake: 0.05, shakeFreq: 0.4, t, seed: 12303 });
      return dcam(ctx, camera) || { dof: { focus: 8, focal: 32, fstop: 2.8 } };
    },
  };
}
export async function M12D(ctx) {
  const { W, cs, glows } = await candleMarch(ctx, 220);
  const { scene, camera } = W;
  return {
    scene, camera,
    look: { uExposure: 1.35, uLookPow: 1.2, uLookSat: 0.9, uBloom: 0.16, uHalation: 0.2, uVignette: 0.66, uGrain: 0.055 },
    update(t) {
      marchUpdate(cs, glows, t);
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, V3(lerp(4, 6, k), lerp(17, 26, k), lerp(766, 775, k)), V3(0, 0, 680), { focal: 30, shake: 0.03, shakeFreq: 0.25, t, seed: 12404 });
      return dcam(ctx, camera) || {};
    },
  };
}
