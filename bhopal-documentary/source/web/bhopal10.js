// BHOPAL, chapter 10 – THE POISON STAYS.
// K10A the abandoned plant today, overgrown; K10B the solar evaporation ponds; K10C a hand pump in the basti,
// the water yellowish; K10D the plant and the colonies around it from the air.
import * as THREE from 'three';
import { fovFromFocalH, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, STACK_TOP, TANKS, ROAD_Z } from './lib/bhopal.js';
import { laneProps } from './bhopal1.js';
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
export const HAZY = { ...MIDDAY, az: 200, el: 34, sunCol: [1.0, 0.9, 0.75], fog: [0.66, 0.64, 0.6], density: 0.0012, sky: { ...MIDDAY.sky, uHorizon: [0.68, 0.65, 0.6], uCloudCover: 0.2 } };

// weeds, shrubs and young trees taking the plant back
export function overgrowth(scene, rnd, area, n = 400, clear = null) {
  const [x0, x1, z0, z1] = area; const g = new THREE.Group(); scene.add(g);
  const greens = [[0.12, 0.18, 0.06], [0.16, 0.2, 0.07], [0.2, 0.2, 0.08], [0.1, 0.14, 0.05]].map((c, i) => lit(c, 1, 0, 'weed' + i));
  const dry = lit([0.36, 0.3, 0.16], 1, 0, 'dryweed');
  const bush = new THREE.IcosahedronGeometry(1, 1), tuft = new THREE.ConeGeometry(0.35, 0.9, 5);
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0);
    if (clear && Math.hypot(x - clear[0], z - clear[1]) < clear[2]) continue;
    if (rnd() < 0.6) { const m = new THREE.Mesh(tuft, rnd() < 0.4 ? dry : greens[Math.floor(rnd() * 4)]); const s = 0.6 + rnd() * 1.2; m.scale.set(s, s * (0.7 + rnd()), s); m.position.set(x, 0.3 * s, z); m.castShadow = true; g.add(m); }
    else { const m = new THREE.Mesh(bush, greens[Math.floor(rnd() * 4)]); const s = 0.4 + rnd() * 0.9; m.scale.set(s * 1.3, s * 0.7, s * 1.2); m.position.set(x, s * 0.5, z); m.rotation.y = rnd() * 6; m.castShadow = true; m.receiveShadow = true; g.add(m); }
  }
  return g;
}

// ---------------- K10A: the abandoned plant ----------------
export async function K10A(ctx) {
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, day: { ...HAZY, center: V3(-30, 0, -60), extent: 160 } });
  const { scene, camera } = W; const rnd = mulberry32(101);
  overgrowth(scene, rnd, [-90, 40, -110, 40], 1400, [-10, -15, 7]);
  const A = V3(-6, 1.6, -8), B = V3(-14, 1.7, -22);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.8, uBloom: 0.06, uHalation: 0.08, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(TANKS.x, 6, TANKS.z), { focal: 28, shake: 0.03, shakeFreq: 0.3, t, seed: 10101 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- K10B: the solar evaporation ponds ----------------
export async function K10B(ctx) {
  const { scene, camera } = dayStage(ctx, { ...HAZY, az: 230, el: 26 }, { ground: [0.3, 0.27, 0.2], extent: 120 });
  const water = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.06, 0.07, 0.035), roughness: 0.12, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.1 });
  const bund = lit([0.36, 0.31, 0.24], 1, 0, 'bund'), liner = lit([0.03, 0.03, 0.03], 0.5, 0, 'liner'), crust = lit([0.3, 0.29, 0.22], 1, 0, 'crust');
  const add = (geo, m, x, y, z, rx = 0, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.receiveShadow = true; o.castShadow = true; scene.add(o); return o; };
  for (const [cx, cz] of [[0, -60], [-150, -60]]) {
    add(new THREE.PlaneGeometry(130, 90), water, cx, 0.4, cz, -Math.PI / 2);
    for (const s of [-1, 1]) { add(new THREE.BoxGeometry(136, 1.6, 4), bund, cx, 0.8, cz + s * 47); add(new THREE.BoxGeometry(4, 1.6, 98), bund, cx + s * 67, 0.8, cz); }
    for (let i = 0; i < 18; i++) add(new THREE.PlaneGeometry(3 + Math.random() * 6, 0.8 + Math.random() * 1.5), liner, cx - 60 + Math.random() * 120, 1.25 + Math.random() * 0.2, cz + 44.9, -0.6);
    for (let i = 0; i < 6; i++) add(new THREE.CircleGeometry(1 + Math.random() * 3, 12), crust, cx - 55 + Math.random() * 110, 0.42, cz - 40 + Math.random() * 80, -Math.PI / 2);
  }
  const rnd = mulberry32(102); overgrowth(scene, rnd, [-80, 80, -9, 2], 160);
  // children walking along the bund
  const rig = await loadRig(); const cs = [];
  for (let i = 0; i < 3; i++) { const c = makeCivilian(rig, { seed: 2000 + i, india: true, kind: i === 2 ? 'woman' : 'man', bag: 'none' }); c.root.scale.setScalar(i === 2 ? 1 : 0.7); c.root.position.set(-20 + i * 1.6, 1.6, -13); c.root.rotation.y = -Math.PI / 2 + Math.PI; scene.add(c.root); c.off = i; cs.push(c); }
  const A = V3(46, 16, 34), B = V3(36, 13, 26);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.8, uBloom: 0.06, uHalation: 0.08, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15);
      cs.forEach((c, i) => { c.root.position.x = -20 + i * 1.6 + t * 0.9; pose(c, 'Walk', t, { offset: c.off }); });
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-10, 0, -45), { focal: 30, shake: 0.03, shakeFreq: 0.3, t, seed: 10202 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- K10C: the hand pump ----------------
function handPump(scene, p) {
  const g = new THREE.Group(); g.position.copy(p); scene.add(g);
  const iron = lit([0.14, 0.2, 0.17], 0.5, 0.6, 'pumpiron'), conc = lit([0.42, 0.4, 0.36], 1, 0, 'pumpconc');
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.18, 24), conc); plat.position.y = 0.09; plat.receiveShadow = true; g.add(plat);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.0, 12), iron); body.position.y = 0.68; body.castShadow = true; g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), iron); head.position.y = 1.25; head.castShadow = true; g.add(head);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), iron); spout.rotation.x = Math.PI / 2; spout.position.set(0, 0.95, 0.24); g.add(spout);
  const arm = new THREE.Group(); arm.position.set(0, 1.3, -0.1); g.add(arm);
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), iron); h.rotation.x = Math.PI / 2; h.position.z = -0.5; h.castShadow = true; arm.add(h);
  const wmat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.55, 0.45, 0.18), roughness: 0.1, transmission: 0.3, transparent: true, opacity: 0.75 });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.62, 8), wmat); stream.position.set(0, 0.62, 0.4); g.add(stream);
  const pot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), lit([0.6, 0.45, 0.25], 0.5, 0.7, 'brasspot')); pot.scale.y = 0.85; pot.position.set(0, 0.34, 0.42); pot.castShadow = true; g.add(pot);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), wmat); pool.rotation.x = -Math.PI / 2; pool.position.set(0.3, 0.19, 0.6); g.add(pool);
  return { g, arm, stream };
}
export async function K10C(ctx) {
  const W = bhopalWorld(ctx, { oldCity: false, mosque: false, litFrac: 0, laneCut: true, day: { ...HAZY, el: 40, center: V3(0, 0, 160), extent: 80 } });
  const { scene, camera } = W; laneProps(scene);
  const PP = V3(1.2, 0, 150); const hide = [];
  scene.traverse(o => { if (o.isMesh && o.geometry?.boundingSphere !== undefined) { const p = o.getWorldPosition(V3(0, 0, 0)); if (Math.hypot(p.x - PP.x, p.z - PP.z) < 2.6 && p.y < 1.6) hide.push(o); } });
  hide.forEach(o => { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius < 3) o.visible = false; });
  const P = handPump(scene, PP);
  const rig = await loadRig(); const cs = [];
  const w = makeCivilian(rig, { seed: 2101, india: true, kind: 'woman', bag: 'none' }); w.root.position.set(1.2, 0, 149.0); w.root.rotation.y = Math.PI; scene.add(w.root); cs.push(w);
  for (let i = 0; i < 3; i++) { const c = makeCivilian(rig, { seed: 2110 + i, india: true, kind: 'woman', bag: 'none' }); c.root.position.set(2.5 + i * 0.15, 0, 151.4 + i * 0.9); c.root.rotation.y = 0.5; scene.add(c.root); c.off = i; cs.push(c); }
  const A = V3(-1.4, 1.5, 155.4), B = V3(-1.0, 1.45, 154.4);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.82, uBloom: 0.06, uHalation: 0.08, uVignette: 0.62, uGrain: 0.05 },
    update(t) {
      const k = easeInOutSine(t / 15); const ph = Math.sin(t * Math.PI * 1.4);
      P.arm.rotation.x = 0.35 * ph; P.stream.scale.y = 0.7 + 0.3 * Math.abs(ph);
      cs.forEach((c, i) => pose(c, 'Idle', t, { offset: c.off || 0 }));
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(1.2, 0.7, 150.3), { focal: 30, shake: 0.03, shakeFreq: 0.3, t, seed: 10303 });
      return dcam(ctx, camera) || { dof: { focus: 5.2, focal: 30, fstop: 2.8 } };
    },
  };
}

// ---------------- K10D: the plant and the colonies from the air ----------------
export async function K10D(ctx) {
  const W = bhopalWorld(ctx, { litFrac: 0, day: { ...HAZY, center: V3(0, 0, 60), extent: 500, density: 0.0007, fogH: 140 } });
  const { scene, camera } = W; const rnd = mulberry32(104);
  overgrowth(scene, rnd, [-90, 40, -110, 40], 900);
  const C = V3(-20, 0, 0);
  return {
    scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.82, uBloom: 0.06, uHalation: 0.08, uVignette: 0.6, uGrain: 0.045 },
    update(t) {
      const a = 0.9 + t * 0.022, r = 330 - t * 4;
      placeCamera(camera, ctx, V3(C.x + Math.sin(a) * r, 190 - t * 2, C.z + Math.cos(a) * r), V3(C.x, 0, C.z + 40), { focal: 30, shake: 0.04, shakeFreq: 0.25, t, seed: 10404 });
      return dcam(ctx, camera) || {};
    },
  };
}
