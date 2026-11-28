// BHOPAL, chapter 15 – EPILOGUE.
// P15A dusk over the Upper Lake; P15B the dead plant at night under the moon; P15C a single diya among others;
// P15D the mother-and-child statue against the night sky, fading to black.
import * as THREE from 'three';
import { fovFromFocalH, smoothstep, clamp, lerp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { bhopalWorld, V3, lit, LAKE, STACK_TOP, TANKS } from './lib/bhopal.js';
import { MORNING } from './bhopal6.js';
import { dayLake } from './bhopal14.js';
import { statue, STATUE } from './bhopal13.js';
import { ATM } from './lib/atmos.js';

function dcam(ctx, camera) {
  const v = ctx.params.get('dcam'); if (!v) return null;
  const [x, y, z, tx, ty, tz, f] = v.split(',').map(Number);
  camera.position.set(x, y, z); camera.up.set(0, 1, 0); camera.lookAt(tx, ty, tz);
  camera.fov = fovFromFocalH(f, ctx.aspect); camera.updateProjectionMatrix(); return {};
}

// ---------------- P15A: dusk over the Upper Lake ----------------
export async function P15A(ctx) {
  const DUSK = { ...MORNING, az: 262, el: 2, sunCol: [1.0, 0.45, 0.2], sunI: 1.4, hemiI: 0.55, density: 0.0005, fogH: 120, glow: [0.9, 0.42, 0.18],
    sky: { ...MORNING.sky, uSunCol: [2.4, 1.0, 0.4], uZenith: [0.07, 0.09, 0.2], uHorizon: [0.6, 0.38, 0.28], uDawn: [0.8, 0.34, 0.12], uDawnPow: 3, uCloudCover: 0.4, uCloudBright: [0.9, 0.5, 0.32] } };
  const W = bhopalWorld(ctx, { litFrac: 0, day: { ...DUSK, center: V3(-1300, 0, 2200), extent: 1200 } });
  const { scene, camera } = W; dayLake(scene, 9, [0.42, 0.3, 0.26]);
  const A = V3(-520, 120, 2600), B = V3(-560, 110, 2520);
  return {
    scene, camera,
    look: { uExposure: 1.1, uLookPow: 1.2, uLookSat: 0.95, uBloom: 0.12, uHalation: 0.16, uVignette: 0.64, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(-2200, 40, 2200), { focal: 30, shake: 0.03, shakeFreq: 0.25, t, seed: 15101 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- P15B: the dead plant at night ----------------
export async function P15B(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0013, oldCity: false, mosque: false, litFrac: 0.01, lampGain: 0, moon: 0.26 });
  const { scene, camera } = W;
  scene.traverse(o => { if (o.isPointLight) o.visible = false; if (o.isMesh && o.material?.isMeshBasicMaterial) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); if (o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) < 3) o.visible = false; } });
  const A = V3(40, 2.0, 60), B = V3(28, 2.4, 40);
  return {
    scene, camera,
    look: { uExposure: 2.2, uLookPow: 1.28, uLookSat: 0.8, uBloom: 0.08, uHalation: 0.12, uVignette: 0.7, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(STACK_TOP.x, 14, STACK_TOP.z), { focal: 30, shake: 0.03, shakeFreq: 0.25, t, seed: 15202 });
      return dcam(ctx, camera) || {};
    },
  };
}

// ---------------- P15C: a single diya ----------------
export async function P15C(ctx) {
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.02, 200);
  ATM.uFogDensity.value = 0.0; ATM.uLampMapOn.value = 0; ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), lit([0.06, 0.05, 0.045], 0.95, 0, 'p15floor')); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const clay = lit([0.34, 0.16, 0.08], 0.9, 0, 'p15clay'), oil = lit([0.25, 0.18, 0.05], 0.2, 0, 'p15oil');
  const fl = new THREE.MeshBasicMaterial({ color: new THREE.Color(30, 12, 3), fog: false });
  const rnd = mulberry32(153); const flames = [];
  const diya = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), clay); b.material.side = THREE.DoubleSide; b.scale.y = 0.6; b.position.y = 0.036; b.castShadow = true; g.add(b);
    const o = new THREE.Mesh(new THREE.CircleGeometry(0.052, 20), oil); o.rotation.x = -Math.PI / 2; o.position.y = 0.026; g.add(o);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), fl); f.scale.set(1, 2.4, 1); f.position.set(0.045, 0.058, 0); g.add(f); flames.push(f);
    return g;
  };
  diya(0, 0);
  for (let i = 0; i < 40; i++) { const a = rnd() * 6.28, r = 0.4 + rnd() * 3; diya(Math.cos(a) * r, -Math.abs(Math.sin(a)) * r - 0.3); }
  const pl = new THREE.PointLight(new THREE.Color(1.0, 0.55, 0.2), 0.6, 3, 2); pl.position.set(0.045, 0.12, 0); pl.castShadow = true; scene.add(pl);
  const fill = new THREE.PointLight(new THREE.Color(1.0, 0.5, 0.2), 3, 6, 2); fill.position.set(0, 0.4, -1.8); scene.add(fill);
  return {
    scene, camera,
    look: { uExposure: 1.4, uLookPow: 1.22, uLookSat: 0.9, uBloom: 0.18, uHalation: 0.22, uVignette: 0.72, uGrain: 0.05 },
    update(t) {
      flames.forEach((f, i) => { const s = 1 + 0.12 * Math.sin(t * 11 + i * 3) + 0.06 * Math.sin(t * 23 + i); f.scale.set(1, 2.4 * s, 1); });
      pl.intensity = 0.6 * (1 + 0.1 * Math.sin(t * 13));
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, V3(lerp(0.75, 0.5, k), lerp(0.3, 0.2, k), lerp(1.0, 0.7, k)), V3(0.0, 0.04, -0.15), { focal: 40, shake: 0.002, shakeFreq: 0.3, t, seed: 15303 });
      return dcam(ctx, camera) || { dof: { focus: camera.position.distanceTo(V3(0, 0.04, 0)), focal: 40, fstop: 2.0 } };
    },
  };
}

// ---------------- P15D: the statue at night ----------------
export async function P15D(ctx) {
  const W = bhopalWorld(ctx, { fog: 0.0012, oldCity: false, mosque: false, litFrac: 0.03, lampGain: 0, moon: 0.3, carve: [[10, 34, 84, 110]] });
  const { scene, camera } = W;
  statue(scene, STATUE, Math.PI);
  const C = V3(STATUE.x, 3.3, STATUE.z);
  return {
    scene, camera,
    look: { uExposure: 2.2, uLookPow: 1.28, uLookSat: 0.8, uBloom: 0.08, uHalation: 0.12, uVignette: 0.72, uGrain: 0.055 },
    update(t) {
      const k = easeInOutSine(t / 15);
      placeCamera(camera, ctx, V3(C.x + lerp(-2.0, -1.0, k), lerp(0.8, 1.2, k), C.z - lerp(9, 6.5, k)), V3(C.x, lerp(3.2, 3.6, k), C.z), { focal: 30, shake: 0.02, shakeFreq: 0.25, t, seed: 15404 });
      return dcam(ctx, camera) || {};
    },
  };
}
