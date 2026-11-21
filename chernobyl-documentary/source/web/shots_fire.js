// Emergency response: S5 firefighters rushing in, S6 close-up, S7 hose team.
import * as THREE from 'three';
import { ATM } from './lib/atmos.js';
import { VolumeFX } from './lib/volume.js';
import { fbm1, noise1, smoothstep, clamp, lerp, easeInOutSine, mulberry32, fovFromFocalH } from './lib/util.js';
import { PLANT } from './lib/plant.js';
import { Streaks, Embers, Flames } from './lib/fx.js';
import { loadRig, makeFirefighter, pose, makeFireTruck } from './lib/people.js';
import { plantWorld, addFire, placeCamera, MOON_DIR } from './shots_plant.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (x, y, z) => V3(x, y, z).add(PLANT);
const yawTo = (dx, dz) => Math.atan2(dx, dz);

// Put world point P at normalised screen position (sx, sy) in [-1,1] (sy up), camera at pos.
function frameAt(camera, ctx, pos, P, sx, sy, focal, { shake = 0, shakeFreq = 0.8, t = 0, seed = 1 } = {}) {
  camera.fov = fovFromFocalH(focal, ctx.aspect); camera.updateProjectionMatrix();
  camera.position.copy(pos); camera.up.set(0, 1, 0); camera.lookAt(P);
  const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), th = tv * ctx.aspect;
  camera.rotateY(Math.atan(sx * th));
  camera.rotateX(Math.atan(-sy * tv));
  if (shake) {
    const D = THREE.MathUtils.degToRad;
    camera.rotateY(D(fbm1(t * shakeFreq, seed, 3) * shake)); camera.rotateX(D(fbm1(t * shakeFreq, seed + 9, 3) * shake * 0.8)); camera.rotateZ(D(fbm1(t * shakeFreq * 0.8, seed + 19, 3) * shake * 0.5));
  }
}

function aimBone(bone, worldDir) {
  bone.updateWorldMatrix(true, false);
  const parentQ = bone.parent.getWorldQuaternion(new THREE.Quaternion());
  const curQ = bone.getWorldQuaternion(new THREE.Quaternion());
  const curY = V3(0, 1, 0).applyQuaternion(curQ);
  const delta = new THREE.Quaternion().setFromUnitVectors(curY, worldDir.clone().normalize());
  bone.quaternion.copy(parentQ.invert().multiply(delta.multiply(curQ)));
  bone.updateWorldMatrix(false, true);
}

async function emergencyWorld(ctx, { cam, focal = 35, near = 0.5, far = 6000 } = {}) {
  const W = await plantWorld(ctx, { focal, city: false, fog: 0.0011, moon: 0.08, floodGain: 0.0, lampGain: 0.35, near, far });
  const { scene, plant, sky } = W;
  plant.setState(0, { destroyed: true });
  sky.uniforms.uSkyGlowDir.value.set(-0.6, 0, -0.8).normalize(); sky.uniforms.uSkyGlowCol.value.setRGB(0.05, 0.018, 0.006);
  plant.wet.value.set(PLANT.x + 175, PLANT.z - 40, 70, 1);
  const fire = addFire(ctx, W, { emberCount: 900, plumeDensity: 1.15, steps: 52 });
  const GF = [[100, 0.2, -28, 3.2, 5.5], [106, 0.2, -41, 2.4, 3.6], [108, 0.2, -11, 2.0, 3.2], [124, 0.2, -18, 1.6, 2.4], [96, 0.2, -19, 2.6, 4.2]];
  const gFlames = new Flames(ctx, GF.map(([x, y, z, w, h], i) => ({ pos: L(x, y, z).toArray(), w, h, seed: 40 + i * 2.3, gain: 1.2 })));
  scene.add(gFlames.mesh);
  const gEmbers = new Embers(ctx, { n: 380, sources: GF.map(([x, y, z, w]) => ({ pos: L(x, y, z).toArray(), r: w * 0.4 })), rise: [2, 6], life: [2, 5], wind: [1.8, 0, -0.8], size: [0.03, 0.09], gain: 1.6, swirl: 1.2 });
  scene.add(gEmbers.mesh);
  // low drifting smoke around the base, separate fine-stepped volume
  const gvol = new VolumeFX({ noiseTex: ctx.noiseTex, post: ctx.post, boxMin: L(20, 0, -120).toArray(), boxMax: L(260, 30, 60).toArray(), steps: 44, shadowSteps: 2, albedo: 0.55 });
  scene.add(gvol.mesh);
  // trucks
  const rig = await loadRig();
  const trucks = [];
  for (const [x, z, tx, tz] of [[184, -52, 110, -30], [194, -20, 120, -12]]) {
    const tr = makeFireTruck(ctx);
    tr.group.position.copy(L(x, 0, z)); tr.group.rotation.y = yawTo(tx - x, tz - z);
    scene.add(tr.group); trucks.push(tr);
    // headlights as one spot each
    const hl = new THREE.SpotLight(new THREE.Color(1.0, 0.85, 0.62), 900, 0, THREE.MathUtils.degToRad(24), 0.5, 2);
    hl.position.copy(L(x, 1.4, z)).add(V3(Math.sin(tr.group.rotation.y), 0, Math.cos(tr.group.rotation.y)).multiplyScalar(3.5));
    hl.target.position.copy(L(tx, 0, tz)); scene.add(hl, hl.target); tr.headlight = hl;
    // rotating blue beacon
    const bl = new THREE.SpotLight(new THREE.Color(0.25, 0.42, 1.0), 0, 0, THREE.MathUtils.degToRad(11), 0.35, 2);
    bl.position.copy(tr.group.localToWorld(tr.beaconPos.clone())); scene.add(bl, bl.target); tr.beacon = bl;
  }
  // red alarm beacon on the turbine hall east end
  const alarm = new THREE.SpotLight(new THREE.Color(1.0, 0.06, 0.03), 0, 0, THREE.MathUtils.degToRad(13), 0.35, 2);
  alarm.position.copy(L(91.2, 10, -62)); scene.add(alarm, alarm.target);
  const alarmLamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.05, 0.02) }));
  alarmLamp.position.copy(alarm.position); scene.add(alarmLamp);
  // key fire light at the east rubble, casting shadows toward the trucks
  const key = new THREE.SpotLight(new THREE.Color(1.0, 0.46, 0.15), 0, 0, THREE.MathUtils.degToRad(50), 0.8, 2);
  key.position.copy(L(99, 3.2, -28)); key.target.position.copy(L(220, 0, -60));
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.near = 2; key.shadow.camera.far = 220; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.05;
  scene.add(key, key.target);
  const fill = new THREE.PointLight(new THREE.Color(1.0, 0.45, 0.15), 0, 0, 2); fill.position.copy(L(101, 2.2, -26)); scene.add(fill);
  // hoses from truck A toward the building
  const hoseMat = W.plant.root.children[0].material.clone ? new THREE.MeshStandardMaterial({ color: new THREE.Color(0.16, 0.14, 0.1), roughness: 0.85 }) : null;
  const hoses = [];
  for (const pts of [[[181, -49], [168, -44], [150, -40], [134, -38], [118, -38]], [[182, -54], [170, -56], [152, -50], [138, -46], [124, -44]], [[191, -18], [176, -16], [160, -14], [140, -12]]]) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z], i) => L(x + noise1(i * 1.7, 5) * 2, 0.07, z + noise1(i * 2.3, 9) * 2)));
    const h = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.045, 6, false), hoseMat); h.castShadow = true; h.receiveShadow = true; scene.add(h); hoses.push(h);
  }
  const animate = (t, camera) => {
    // beacons rotate (~1.4 rev/s), flash when facing camera
    trucks.forEach((tr, i) => {
      const a = t * 8.8 + i * 2.1;
      const dir = V3(Math.cos(a), -0.08, Math.sin(a));
      tr.beacon.intensity = 2600;
      tr.beacon.target.position.copy(tr.beacon.position).add(dir.clone().multiplyScalar(20));
      tr.beacon.target.updateMatrixWorld();
      const toCam = camera.position.clone().sub(tr.beacon.position); toCam.y = 0; toCam.normalize();
      const facing = Math.max(0, dir.x * toCam.x + dir.z * toCam.z);
      tr.beaconMat.color.setRGB(0.25, 0.45, 1.0).multiplyScalar(3 + 60 * Math.pow(facing, 10));
      tr.facing = facing; tr.dir = dir;
    });
    const aa = t * 6.3 + 1.0;
    const adir = V3(Math.cos(aa), -0.12, Math.sin(aa));
    alarm.intensity = 3200; alarm.target.position.copy(alarm.position).add(adir.clone().multiplyScalar(20)); alarm.target.updateMatrixWorld();
    const toCamA = camera.position.clone().sub(alarm.position); toCamA.y = 0; toCamA.normalize();
    const facingA = Math.max(0, adir.x * toCamA.x + adir.z * toCamA.z);
    alarmLamp.material.color.setRGB(1, 0.05, 0.02).multiplyScalar(4 + 70 * Math.pow(facingA, 10));
    const fl = 0.8 + 0.2 * fbm1(t * 4.0, 77, 3) + 0.1 * fbm1(t * 11, 78, 2);
    key.intensity = 1500 * fl; fill.intensity = 450 * (0.85 + 0.15 * fbm1(t * 3.3, 79, 3));
    gEmbers.update(t, camera);
    fire.update(t + 40, camera, { gain: 1, plumeH: 520, column: 0, emberGain: 1 });
    gvol.setPlumes([{ base: L(100, 0, -28).toArray(), r0: 2.5, spread: 0.45, height: 30, density: 0.7, rise: 3, wind: [0.5, -0.2], noiseScale: 1 / 9, fireH: 1.5, fireEmis: 2, seed: 0.4 }, { base: L(96, 0, -19).toArray(), r0: 2, spread: 0.5, height: 28, density: 0.6, rise: 2.5, wind: [0.6, -0.2], noiseScale: 1 / 8, fireH: 1.2, fireEmis: 2, seed: 0.8 }]);
    gvol.setGround({ center: L(140, 0, -30).toArray(), radius: 125, height: 4.5, density: 0.26, noiseScale: 1 / 22, drift: [2.2, 0.25, -0.6] });
    gvol.setLighting({ firePos: L(99, 2, -28).toArray(), fireCol: [2.4 * fl, 0.85 * fl, 0.24 * fl], fireR: 12, fireShadowLen: 30, moonDir: MOON_DIR.toArray(), moonCol: [0.01, 0.012, 0.018], ambTop: [0.002, 0.0022, 0.0035], ambBot: [0.004, 0.002, 0.001], ext: 0.09, minStep: 0.8 });
    gvol.setLights([
      ...trucks.map(tr => ({ pos: tr.beacon.position.toArray(), range: 26, color: [0.6, 1.0, 2.6], cone: Math.cos(THREE.MathUtils.degToRad(11)), dir: tr.dir.toArray() })),
      { pos: alarm.position.toArray(), range: 30, color: [3.2, 0.18, 0.08], cone: Math.cos(THREE.MathUtils.degToRad(13)), dir: adir.toArray() },
      { pos: trucks[0].headlight.position.toArray(), range: 30, color: [1.4, 1.15, 0.85], cone: Math.cos(THREE.MathUtils.degToRad(24)), dir: trucks[0].headlight.target.position.clone().sub(trucks[0].headlight.position).normalize().toArray() },
    ]);
    gvol.update(t, Math.round(t * 24), camera);
  };
  return { ...W, fire, gvol, trucks, rig, alarm, key, animate };
}

// ---------------- S5: firefighters rushing toward the reactor ----------------
export async function S5(ctx) {
  const E = await emergencyWorld(ctx, { focal: 26 });
  const { scene, camera, rig } = E;
  const runners = [];
  const paths = [
    { from: [221, -62], to: [140, -36], delay: 0.0, clip: 'Run', speed: 4.6, seed: 1 },
    { from: [226, -55], to: [146, -30], delay: 0.5, clip: 'Run', speed: 4.4, seed: 2 },
    { from: [213, -70], to: [140, -44], delay: 1.0, clip: 'Run', speed: 4.7, seed: 3 },
    { from: [186, -25], to: [130, -18], delay: 0.2, clip: 'Run', speed: 4.3, seed: 4 },
    { from: [178, -49], to: [160, -44], delay: 0.0, clip: 'Walk', speed: 1.35, seed: 5 },
    { from: [188, -12], to: [188, -12], delay: 0.0, clip: 'Idle', speed: 0, seed: 6, face: [100, -2] },
    { from: [170, -32], to: [126, -26], delay: 0.0, clip: 'Run', speed: 4.5, seed: 7 },
  ];
  for (const p of paths) {
    const ff = makeFirefighter(rig, { seed: p.seed, apparatus: p.seed % 2 === 1 });
    scene.add(ff.root); runners.push({ ff, ...p });
  }
  return {
    scene, camera, dof: null,
    look: { uExposure: 1.05, uLookPow: 1.22, uLookSat: 1.08, uBloom: 0.08, uHalation: 0.14, uVignette: 0.62, uGrain: 0.055 },
    update(t) {
      const p = L(234, 1.5, -68).lerp(L(216, 1.5, -60), t / 5.5);
      p.y += Math.abs(Math.sin(t * Math.PI * 2.4)) * 0.035;
      placeCamera(camera, ctx, p, L(40, 30, -8), { focal: 26, shake: 1.0, shakeFreq: 1.2, t, seed: 51, jolt: 0.3, joltFreq: 4.8 });
      for (const r of runners) {
        const a = V3(r.from[0], 0, r.from[1]), b = V3(r.to[0], 0, r.to[1]);
        const dir = b.clone().sub(a); const len = dir.length(); if (len > 0) dir.normalize();
        const tt = Math.max(0, t - r.delay);
        const d = Math.min(tt * r.speed, len);
        const pos = a.clone().addScaledVector(dir, d);
        r.ff.root.position.copy(L(pos.x, 0, pos.z));
        const face = r.face ? V3(r.face[0] - r.from[0], 0, r.face[1] - r.from[1]) : dir;
        r.ff.root.rotation.y = yawTo(face.x, face.z);
        pose(r.ff, r.clip, t, { offset: r.seed * 0.37 });
      }
      E.animate(t, camera);
      return {};
    },
  };
}

// ---------------- S6: close-up, a firefighter looks up at the reactor ----------------
export async function S6(ctx) {
  const E = await emergencyWorld(ctx, { focal: 24, near: 0.12, far: 2500 });
  const { scene, camera, rig } = E;
  const ff = makeFirefighter(rig, { seed: 11, apparatus: true });
  const pos = L(156, 0, -36);
  ff.root.position.copy(pos); ff.root.rotation.y = yawTo(-1, 0.22);
  scene.add(ff.root);
  const ff2 = makeFirefighter(rig, { seed: 12, apparatus: false });
  ff2.root.position.copy(L(146, 0, -30)); ff2.root.rotation.y = yawTo(-1, 0.4); scene.add(ff2.root);
  const near = new Embers(ctx, { n: 220, sources: [{ pos: L(154, -1, -35).toArray(), r: 6 }], rise: [0.4, 1.4], life: [4, 8], wind: [1.2, 0, 0.5], size: [0.012, 0.03], gain: 1.6, swirl: 0.8 });
  scene.add(near.mesh);
  return {
    scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 1.08, uBloom: 0.09, uHalation: 0.16, uVignette: 0.66, uGrain: 0.055 },
    update(t) {
      pose(ff, 'Idle', t, { offset: 0.8 });
      // head tilts up toward the burning hall
      const head = ff.bones.mixamorigHead, neck = ff.bones.mixamorigNeck;
      neck.rotation.x -= 0.28; head.rotation.x -= 0.22 + 0.04 * Math.sin(t * 0.7);
      ff.root.updateMatrixWorld(true);
      pose(ff2, 'Idle', t, { offset: 0.2 });
      const hp = new THREE.Vector3(); ff.bones.mixamorigHead.getWorldPosition(hp);
      const back = V3(Math.sin(ff.root.rotation.y), 0, Math.cos(ff.root.rotation.y)).multiplyScalar(-1);
      const right = V3(Math.cos(ff.root.rotation.y), 0, -Math.sin(ff.root.rotation.y));
      const camPos = hp.clone().addScaledVector(back, 1.05 - t * 0.05).addScaledVector(right, 0.32).add(V3(0, 0.06, 0));
      frameAt(camera, ctx, camPos, hp.clone().add(V3(0, 0.02, 0)), 0.42, -0.62, 24, { shake: 0.3, shakeFreq: 0.8, t, seed: 61 });
      E.animate(t, camera);
      near.update(t, camera);
      return { dof: { focus: 140, focal: 24, fstop: 1.4, maxCoc: 18 } };
    },
  };
}

// ---------------- S7: hose team fighting the fire ----------------
export async function S7(ctx) {
  const E = await emergencyWorld(ctx, { focal: 40 });
  const { scene, camera, rig } = E;
  const target = L(100, 0.8, -28);
  const crew = [];
  for (const [x, z, seed] of [[116, -33, 21], [117.6, -34.1, 22]]) {
    const ff = makeFirefighter(rig, { seed, apparatus: seed === 21 });
    ff.root.position.copy(L(x, 0, z));
    const d = target.clone().sub(ff.root.position); ff.root.rotation.y = yawTo(d.x, d.z);
    scene.add(ff.root); crew.push(ff);
  }
  const nozzleHose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([L(115.4, 1.2, -32.4), L(117.2, 1.0, -34), L(119, 0.08, -36), L(130, 0.07, -37), L(150, 0.07, -38)]), 60, 0.045, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color(0.16, 0.14, 0.1), roughness: 0.85 }));
  scene.add(nozzleHose);
  // water jet particles
  const N = 700;
  const jet = new Streaks(ctx, N, { layer: 2, minPx: 1.0 });
  scene.add(jet.mesh);
  const rnd = mulberry32(7);
  const P = Array.from({ length: N }, () => ({ ph: rnd(), sp: 0.9 + rnd() * 0.2, sx: (rnd() - 0.5) * 0.06, sy: (rnd() - 0.5) * 0.06, size: 0.02 + rnd() * 0.05, b: 0.4 + rnd() * 0.6 }));
  return {
    scene, camera,
    look: { uExposure: 0.85, uLookPow: 1.34, uLookSat: 1.08, uBloom: 0.08, uHalation: 0.14, uVignette: 0.64, uGrain: 0.055 },
    update(t) {
      for (const ff of crew) {
        pose(ff, 'Idle', t, { offset: 0.5 });
        const fwd = V3(Math.sin(ff.root.rotation.y), 0, Math.cos(ff.root.rotation.y));
        const right = V3(Math.cos(ff.root.rotation.y), 0, -Math.sin(ff.root.rotation.y));
        ff.root.updateMatrixWorld(true);
        aimBone(ff.bones.mixamorigRightArm, fwd.clone().multiplyScalar(0.55).add(V3(0, -0.75, 0)).addScaledVector(right, -0.15));
        aimBone(ff.bones.mixamorigRightForeArm, fwd.clone().multiplyScalar(0.9).add(V3(0, 0.25, 0)).addScaledVector(right, -0.35));
        aimBone(ff.bones.mixamorigLeftArm, fwd.clone().multiplyScalar(0.75).add(V3(0, -0.55, 0)).addScaledVector(right, 0.15));
        aimBone(ff.bones.mixamorigLeftForeArm, fwd.clone().multiplyScalar(0.95).add(V3(0, 0.2, 0)).addScaledVector(right, 0.3));
        ff.bones.mixamorigSpine1.rotation.x += 0.12;
      }
      const ff = crew[0];
      const nz = new THREE.Vector3(); ff.bones.mixamorigLeftHand.getWorldPosition(nz);
      const fwd = target.clone().sub(nz).normalize();
      const v0 = fwd.clone().multiplyScalar(15).add(V3(0, 4.0, 0));
      const g = V3(0, -9.81, 0);
      const sh = 1 / 48;
      for (let i = 0; i < N; i++) {
        const p = P[i];
        const life = 1.35;
        const age = ((t / life + p.ph) % 1) * life;
        const v = v0.clone().multiplyScalar(p.sp).add(V3(p.sx * 19, p.sy * 19, p.sx * 10));
        const at = (a) => nz.clone().addScaledVector(v, a).addScaledVector(g, 0.5 * a * a);
        const A = at(Math.max(age - sh * 2.5, 0)), B = at(age);
        if (B.y < 0.05) { jet.hide(i); continue; }
        const k = p.b * (0.5 + 0.5 * (1 - age / life)) * 0.35;
        jet.set(i, A, B, p.size * (1 + age * 2), k * 1.0, k * 0.8, k * 0.62, 1);
      }
      jet.commit(camera);
      const p = L(126.5, 1.5, -42.5).lerp(L(125, 1.52, -41.3), easeInOutSine(t / 4));
      placeCamera(camera, ctx, p, L(70, 12, -14), { focal: 32, shake: 0.8, shakeFreq: 1.0, t, seed: 71, jolt: 0.2, joltFreq: 5 });
      E.animate(t, camera);
      ATM.uFireFog.value.multiplyScalar(0.6);
      return {};
    },
  };
}
