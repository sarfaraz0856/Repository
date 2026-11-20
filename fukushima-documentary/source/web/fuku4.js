// FUKUSHIMA, chapter 4 – MELTDOWN. A cutaway of a BWR Mark I reactor building, cut in half at z = 0
// (the camera looks into the back half). Concrete building, the light-bulb drywell, the torus
// (suppression chamber) in the basement, the reactor pressure vessel with its core.
// FK4B: the water in the vessel boils away, the fuel is uncovered, glows red, orange, white and slumps
//        into the bottom of the vessel as corium.
// FK4C: wide view, hydrogen leaks from the drywell and collects under the roof of the building.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { bbColor } from './lib/fx.js';
import { fovFromFocalH, smoothstep, clamp, easeInOutSine, mulberry32 } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { dcam } from './fuku1.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lit = (c, r = 0.85, m = 0, extra = {}) => patchMaterial(new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(...c), roughness: r, metalness: m }, extra)), { key: 'fk4' });
const HALF = [Math.PI / 2, Math.PI];            // lathe / cylinder angles covering z <= 0

// cross-section polygon (x>0 side and mirrored x<0 side) between an outer and inner profile
function cutFace(outer, inner, mat, z = 0.03) {
  const g = new THREE.Group();
  for (const s of [1, -1]) {
    const pts = outer.map(([r, y]) => new THREE.Vector2(s * r, y)).concat(inner.slice().reverse().map(([r, y]) => new THREE.Vector2(s * r, y)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts)), mat); m.position.z = z; g.add(m);
  }
  return g;
}
const arcPts = (cx, cy, R, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [Math.max(0, cx + R * Math.cos(a)), cy + R * Math.sin(a)]; });

// water level in the vessel and fuel geometry
const CORE = { y0: 9.6, y1: 13.4, R: 2.5 };
const level = (t) => 19 - 11.2 * smoothstep(2, 13, t);
const tUncover = (y) => { // first time the level drops below y
  if (y >= 19) return -1e9; if (y <= 7.8) return 1e9;
  let lo = 2, hi = 13; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (level(m) > y) lo = m; else hi = m; } return hi;
};

function buildReactor(ctx) {
  const scene = new THREE.Scene();
  ATM.uFogColor.value.setRGB(0, 0, 0); ATM.uFogDensity.value = 0.0; ATM.uFogHeight.value = 1e6; ATM.uFogBase.value = -6000;
  ATM.uGlowCol.value.setRGB(0, 0, 0); ATM.uMoonHalo.value.setRGB(0, 0, 0); ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;

  const concrete = lit([0.5, 0.5, 0.48], 0.9), concreteIn = lit([0.36, 0.37, 0.36], 0.95);
  const cutM = lit([0.78, 0.7, 0.55], 0.9), cutSteel = lit([0.85, 0.42, 0.18], 0.6);
  const earth = lit([0.2, 0.15, 0.1], 1), steel = lit([0.28, 0.32, 0.36], 0.45, 0.25, { side: THREE.DoubleSide });
  const linerM = lit([0.42, 0.44, 0.46], 0.6, 0.15, { side: THREE.DoubleSide });

  // backdrop
  const back = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.012, 0.016, 0.024), side: THREE.BackSide }));
  scene.add(back);

  // concrete box pieces; a tan cut face where a piece meets the cut plane
  const box = (x0, x1, y0, y1, z0, z1, m = concrete) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    b.castShadow = b.receiveShadow = true; scene.add(b);
    if (z1 >= 0) { const f = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), m === earth ? earth : cutM); f.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.03); scene.add(f); }
    return b;
  };
  const W = 23, T = 1.4;
  box(-W, W, -13, 47, -W - T, -W, concreteIn);           // back wall
  box(-W - T, -W, -13, 47, -W - T, 0);                   // side walls
  box(W, W + T, -13, 47, -W - T, 0);
  box(-W - T, W + T, 46, 47.4, -W - T, 0);               // roof
  box(-W - T, W + T, -14.4, -13, -W - T, 0);             // basement slab
  box(-W, -6.2, 33.6, 34.6, -W, 0); box(6.2, W, 33.6, 34.6, -W, 0);   // refuelling floor, around the drywell head
  box(-W, -10.5, 21.5, 22.3, -W, 0); box(10.5, W, 21.5, 22.3, -W, 0); // intermediate floors
  box(-W, -12.2, 9.5, 10.2, -W, 0); box(12.2, W, 9.5, 10.2, -W, 0);
  box(-W, W, -0.7, 0, -W, -20, concreteIn);
  // earth around the basement, and the ground
  box(-70, -W - T, -20, 0, -60, 0, earth); box(W + T, 70, -20, 0, -60, 0, earth);
  box(-70, 70, -24, -14.4, -60, 0, earth);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), lit([0.16, 0.18, 0.13], 1)); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.01, -150); scene.add(ground);
  // equipment silhouettes on the refuelling floor: the crane rails and the spent fuel pool
  box(-W, W, 42.5, 43.3, -W, -W + 0.8, steel); box(-W, W, 42.5, 43.3, -2, -1.2, steel);
  const pool = box(9, 19, 30, 34.7, -14, -4, concreteIn);
  const poolW = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 9.4), lit([0.1, 0.3, 0.5], 0.1)); poolW.rotation.x = -Math.PI / 2; poolW.position.set(14, 34.5, -9); scene.add(poolW);

  // drywell: light bulb in steel-lined concrete
  const dOut = arcPts(0, 9, 10.5, -Math.PI / 2, 0.61, 16).concat([[5.9, 23], [5.9, 31], [4.8, 32.7], [2.6, 33.6], [0, 33.9]]);
  const dIn = arcPts(0, 9, 9.2, -Math.PI / 2, 0.61, 16).concat([[4.6, 23], [4.6, 30.4], [3.6, 31.7], [1.8, 32.5], [0, 32.8]]);
  const liner = new THREE.Mesh(new THREE.LatheGeometry(dIn.map(([r, y]) => new THREE.Vector2(r, y)), 48, ...HALF), linerM); liner.receiveShadow = true; scene.add(liner);
  scene.add(cutFace(dOut, dIn, cutM));
  // pedestal under the vessel
  box(-2.6, -1.6, -0.2, 6.6, -2.2, 0, concreteIn); box(1.6, 2.6, -0.2, 6.6, -2.2, 0, concreteIn);

  // torus in the basement
  const R = 15, r = 4.4, ty = -7;
  const tor = new THREE.Mesh(new THREE.TorusGeometry(R, r, 24, 64, Math.PI), steel); tor.rotation.x = -Math.PI / 2; tor.position.y = ty; scene.add(tor);
  const torWater = new THREE.Mesh(new THREE.RingGeometry(R - 4.25, R + 4.25, 64, 1, 0, Math.PI), lit([0.08, 0.22, 0.36], 0.15)); torWater.rotation.x = -Math.PI / 2; torWater.position.y = ty + 0.3; scene.add(torWater);
  for (const s of [1, -1]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.12, r + 0.12, 40), cutSteel); ring.position.set(s * R, ty, 0.04); scene.add(ring);
    const wat = new THREE.Mesh(new THREE.CircleGeometry(r - 0.12, 40, Math.PI - 0.07, Math.PI + 0.14), lit([0.1, 0.28, 0.45], 0.2)); wat.position.set(s * R, ty, 0.035); scene.add(wat);
    // vent pipe from the drywell down into the torus
    const a = V3(s * 7.6, 2.5, -2.5), b = V3(s * 13.2, ty + 1.2, -2.5), d = b.clone().sub(a);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, d.length(), 16), steel); p.position.copy(a).add(b).multiplyScalar(0.5); p.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); scene.add(p);
  }

  // reactor pressure vessel
  const vOut = arcPts(0, 9.6, 3.25, -Math.PI / 2, 0, 10).concat(arcPts(0, 23.6, 3.25, 0, Math.PI / 2, 10));
  const vIn = arcPts(0, 9.6, 2.98, -Math.PI / 2, 0, 10).concat(arcPts(0, 23.6, 2.98, 0, Math.PI / 2, 10));
  const vessel = new THREE.Mesh(new THREE.LatheGeometry(vIn.map(([a, b]) => new THREE.Vector2(a, b)), 40, ...HALF), lit([0.3, 0.33, 0.36], 0.4, 0.3, { side: THREE.DoubleSide })); scene.add(vessel);
  scene.add(cutFace(vOut, vIn, cutSteel, 0.05));
  // steam lines leaving the vessel
  for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 9, 12), steel); p.rotation.z = Math.PI / 2; p.position.set(s * 7.5, 21, -2.4); scene.add(p); }

  // fuel: assemblies in the back half of the core, each in 8 vertical segments so the top can glow first
  const rnd = mulberry32(404), SEG = 8, segH = (CORE.y1 - CORE.y0) / SEG;
  const asm = [];
  for (let x = -CORE.R; x <= CORE.R; x += 0.34) for (let z = -0.17; z >= -CORE.R; z -= 0.34) if (x * x + z * z < CORE.R * CORE.R) asm.push([x, z, Math.hypot(x, z) / CORE.R]);
  const N = asm.length * SEG;
  const fuel = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, segH * 0.96, 0.26), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
  fuel.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  const segs = [];
  asm.forEach(([x, z, rr], i) => { for (let k = 0; k < SEG; k++) segs.push({ x, z, rr, y: CORE.y0 + segH * (k + 0.5), k, tu: 0, drop: rnd(), jit: (rnd() - 0.5) * 0.5, fx: x * (0.5 + 0.4 * rnd()), fz: z * (0.5 + 0.4 * rnd()) }); });
  segs.forEach(s => { s.tu = tUncover(s.y); });
  scene.add(fuel);
  // core plate and shroud
  const shroud = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 6.8, 36, 1, true, ...HALF), lit([0.36, 0.38, 0.4], 0.5, 0.2, { side: THREE.DoubleSide })); shroud.position.y = 11.6; scene.add(shroud);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.25, 36, 1, false, ...HALF), steel); plate.position.y = CORE.y0 - 0.15; scene.add(plate);

  // water in the vessel
  const waterM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.15, 0.4, 0.75), roughness: 0.1, transparent: true, opacity: 0.42, depthWrite: false, emissive: new THREE.Color(0.02, 0.06, 0.16) });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.95, 2.95, 1, 40, 1, false, ...HALF), waterM); scene.add(water);
  const waterFront = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 1), waterM); waterFront.position.z = 0.02; scene.add(waterFront);
  // boiling bubbles
  const NB = 500, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 0.85, 1.0), transparent: true, opacity: 0.6, depthWrite: false }), NB);
  const bubs = Array.from({ length: NB }, () => { const a = Math.PI / 2 + rnd() * Math.PI, rr = Math.sqrt(rnd()) * 2.7; return { x: rr * Math.sin(a), z: Math.min(-0.08, rr * Math.cos(a)), ph: rnd(), sp: 1.2 + rnd() * 2.2, s: 0.5 + rnd() }; });
  scene.add(bub);
  // corium in the lower head
  const coriumM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 0.8, 0.15), side: THREE.DoubleSide });
  const corium = new THREE.Mesh(new THREE.BufferGeometry(), coriumM); scene.add(corium);
  const corTop = new THREE.Mesh(new THREE.BufferGeometry(), coriumM); scene.add(corTop);
  let lastH = -1;
  const setCorium = (h) => {
    if (Math.abs(h - lastH) < 0.004) return; lastH = h;
    const Rh = 2.9, cy = 9.6, y0 = cy - Rh, yt = y0 + Math.max(h, 0.001);
    const pts = []; for (let i = 0; i <= 16; i++) { const y = y0 + (yt - y0) * i / 16; pts.push(new THREE.Vector2(Math.sqrt(Math.max(0, Rh * Rh - (y - cy) ** 2)), y)); }
    corium.geometry.dispose(); corium.geometry = new THREE.LatheGeometry(pts, 32, ...HALF);
    const rt = pts[16].x; corTop.geometry.dispose(); corTop.geometry = new THREE.CircleGeometry(rt, 32, Math.PI, Math.PI); corTop.rotation.x = -Math.PI / 2; corTop.position.y = yt;
    const front = new THREE.Shape(pts.map(p => new THREE.Vector2(p.x, p.y)).concat(pts.slice().reverse().map(p => new THREE.Vector2(-p.x, p.y))));
    corFront.geometry.dispose(); corFront.geometry = new THREE.ShapeGeometry(front);
  };
  const corFront = new THREE.Mesh(new THREE.BufferGeometry(), coriumM); corFront.position.z = 0.04; scene.add(corFront);

  // hydrogen under the roof
  const h2M = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.85, 0.45), transparent: true, opacity: 0, depthWrite: false });
  const h2 = new THREE.Mesh(new THREE.BoxGeometry(2 * W - 0.4, 11, W - 0.4), h2M); h2.position.set(0, 40.3, -W / 2); scene.add(h2);
  const NH = 900, hp = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.05, 0.45), transparent: true, opacity: 0.35, depthWrite: false }), NH);
  const hps = Array.from({ length: NH }, () => ({ a: rnd(), x: (rnd() - 0.5) * 9, z: -0.5 - rnd() * 6, ph: rnd(), sp: 0.25 + rnd() * 0.3, sx: (rnd() - 0.5) * 40, sz: -1 - rnd() * 20 }));
  scene.add(hp);

  // lights
  scene.add(new THREE.HemisphereLight(new THREE.Color(0.55, 0.6, 0.7), new THREE.Color(0.12, 0.1, 0.08), 0.9));
  const key = new THREE.DirectionalLight(new THREE.Color(1.0, 0.96, 0.9), 2.2); key.position.set(40, 70, 60); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 250 }); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(new THREE.Color(0.6, 0.7, 0.9), 0.7); fill.position.set(-50, 20, 40); scene.add(fill);
  const coreL = new THREE.PointLight(new THREE.Color(1, 0.4, 0.1), 0, 30, 1.6); coreL.position.set(0, 11.5, -1.0); scene.add(coreL);
  const cher = new THREE.PointLight(new THREE.Color(0.3, 0.55, 1.0), 6, 10, 1.6); cher.position.set(0, 11.5, -1.0); scene.add(cher);

  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = V3(1, 1, 1), P = V3(), col = [0, 0, 0], C = new THREE.Color();
  function setState(t) {
    const L = level(t);
    // water column from the bottom of the vessel to the level
    const wb = 6.7, wh = Math.max(0.01, L - wb);
    water.scale.y = wh; water.position.y = wb + wh / 2; waterFront.scale.y = wh; waterFront.position.y = wb + wh / 2;
    water.visible = waterFront.visible = L > wb + 0.05;
    // bubbles: violent boiling while the level falls
    const boil = 0.35 + 0.65 * smoothstep(1, 4, t);
    bubs.forEach((b, i) => {
      const yy = wb + 0.2 + ((b.ph + t * b.sp * 0.25) % 1) * (L - wb);
      const on = i < NB * boil && yy < L - 0.05 && L > wb + 0.3;
      P.set(b.x, yy, b.z); S.setScalar(on ? b.s : 0); M.compose(P, Q, S); bub.setMatrixAt(i, M);
    });
    bub.instanceMatrix.needsUpdate = true;
    // fuel temperature and slumping
    let heatSum = 0;
    const melt = smoothstep(14, 22, t);
    segs.forEach((s, i) => {
      const exposed = Math.max(0, t - s.tu);
      const heat = clamp(exposed / 7.5, 0, 1.15) * (1.05 - 0.35 * s.rr * s.rr);
      heatSum += heat;
      // slump: hot segments fall into the lower head, the centre first
      const f = smoothstep(0, 1, (melt - s.drop * 0.5 - s.rr * 0.35) / 0.5) * (heat > 0.75 ? 1 : 0);
      const pileY = 6.9 + s.k * 0.08 + s.jit * 0.2 + (1 - s.rr) * 0.4;
      P.set(s.x + (s.fx - s.x) * f, s.y + (pileY - s.y) * f, Math.min(-0.15, s.z + (s.fz - s.z) * f));
      S.set(1, 1 - 0.75 * f, 1); M.compose(P, Q, S); fuel.setMatrixAt(i, M);
      if (s.y < L && f === 0) C.setRGB(0.06 + 0.04 * s.rr, 0.1, 0.22);         // under water: Cherenkov blue tint
      else if (heat < 0.05) C.setRGB(0.12, 0.12, 0.13);
      else { bbColor(heat * 0.82, col); C.setRGB(col[0] * 0.8 + 0.1, col[1] * 0.7 + 0.06, col[2] * 0.6 + 0.05); }
      fuel.setColorAt(i, C);
    });
    fuel.instanceMatrix.needsUpdate = true; fuel.instanceColor.needsUpdate = true;
    const H = heatSum / segs.length;
    coreL.intensity = 14 * H * H + 2 * H; bbColor(Math.min(1, H), col); coreL.color.setRGB(col[0], col[1], col[2]).multiplyScalar(1 / Math.max(col[0], 0.01));
    cher.intensity = 6 * smoothstep(13, 5, t);
    setCorium(1.7 * smoothstep(15, 23, t));
    const pulse = 1 + 0.08 * Math.sin(t * 3.1) + 0.05 * Math.sin(t * 7.3);
    coriumM.color.setRGB(1.9 * pulse, 0.42 * pulse, 0.06);
    // hydrogen: leaks from the drywell head (t > 16) and fills the top of the building
    const fillK = smoothstep(17, 34, t);
    h2M.opacity = 0.32 * fillK; h2.scale.y = 0.25 + 0.75 * fillK; h2.position.y = 46 - 5.5 * h2.scale.y;
    hps.forEach((b, i) => {
      const on = t > 16 + b.ph * 4;
      const u = ((b.ph * 3.7 + t * b.sp * 0.12) % 1);
      const y = 33.9 + u * 12;
      const x = b.x + (b.sx - b.x) * smoothstep(0.3, 1, u), z = Math.min(-0.3, b.z + (b.sz - b.z) * smoothstep(0.3, 1, u));
      P.set(x, Math.min(y, 45.6), z); S.setScalar(on ? 1 - 0.5 * u : 0); M.compose(P, Q, S); hp.setMatrixAt(i, M);
    });
    hp.instanceMatrix.needsUpdate = true;
  }
  return { scene, setState };
}

const LOOK = { uExposure: 1.0, uLookPow: 1.15, uLookSat: 0.95, uBloom: 0.22, uHalation: 0.18, uVignette: 0.6, uGrain: 0.04, uShadowTint: [0.92, 0.98, 1.08], uHighTint: [1.04, 1.0, 0.95] };

// ---------------- FK4B: the core uncovers and melts (22 s) ----------------
export async function FK4B(ctx) {
  const R = buildReactor(ctx);
  const camera = new THREE.PerspectiveCamera(35, ctx.aspect, 0.1, 1500);
  const A = V3(70, 34, 165), B = V3(16, 14, 48), TA = V3(0, 16, -6), TB = V3(0, 10.8, -1.5);
  return { scene: R.scene, camera, look: LOOK,
    update(t) {
      R.setState(t);
      const k = easeInOutSine(clamp(t / 22, 0, 1));
      placeCamera(camera, ctx, A.clone().lerp(B, k), TA.clone().lerp(TB, k), { focal: 35, shake: 0.02, shakeFreq: 0.2, t, seed: 4402 });
      return dcam(ctx, camera) || {};
    } };
}

// ---------------- FK4C: hydrogen collects under the roof (16 s) ----------------
export async function FK4C(ctx) {
  const R = buildReactor(ctx);
  const camera = new THREE.PerspectiveCamera(35, ctx.aspect, 0.1, 1500);
  const A = V3(-30, 30, 120), B = V3(-55, 34, 175), TA = V3(0, 26, -8), TB = V3(0, 17, -8);
  return { scene: R.scene, camera, look: LOOK,
    update(t) {
      R.setState(22 + t);
      const k = easeInOutSine(clamp(t / 16, 0, 1));
      placeCamera(camera, ctx, A.clone().lerp(B, k), TA.clone().lerp(TB, k), { focal: 35, shake: 0.02, shakeFreq: 0.2, t, seed: 4403 });
      return dcam(ctx, camera) || {};
    } };
}
