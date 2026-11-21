// FUKUSHIMA, chapter 7 – THE EMPTY TOWNS, and chapter 8 – THE LESSON.
// FK7A: the main street of a town in the evacuation zone (Futaba), years later: shuttered shops, weeds in the
//        asphalt, utility poles and wires, the arch over the road that promised "a bright future".
// FK7B: the site from the air in the late 2010s: a field of grey water tanks over the bluff.
// FK7C: the frozen-soil wall: rows of frosted freezing pipes in the gravel beside the reactor buildings.
// FK8A: dusk over the plant from the sea.
import * as THREE from 'three';
import { patchMaterial, ATM } from './lib/atmos.js';
import { makeDaySky, sunDir, dayLights } from './lib/daysky.js';
import { easeInOutSine, smoothstep, clamp, mulberry32, fovFromFocalH } from './lib/util.js';
import { placeCamera } from './shots_plant.js';
import { fukuWorld, V3, blowTop, UNITS, SITE_Y, groundHeight } from './lib/fuku.js';
import { dcam, MARCH_SKY } from './fuku1.js';

const lit = (c, r = 0.85, m = 0, key = 'fk7') => patchMaterial(new THREE.MeshStandardMaterial({ color: Array.isArray(c) ? new THREE.Color(...c) : c, roughness: r, metalness: m }), { key });
const OVERCAST = Object.assign({}, MARCH_SKY, { uZenith: [0.28, 0.32, 0.38], uHorizon: [0.6, 0.62, 0.64], uCloudCover: 0.7, uCloudBright: [1.0, 1.0, 1.0], uCloudShade: [0.5, 0.52, 0.55] });

function textTex(lines, { w = 1024, h = 256, bg = '#e8e4d8', fg = '#1d2a6b', font = 'bold 150px IPAGothic', border = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (border) { g.strokeStyle = border; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20); }
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, w / 2, h * (i + 0.5) / lines.length, w - 40));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const texMat = (t, key, r = 0.8) => patchMaterial(new THREE.MeshStandardMaterial({ map: t, roughness: r }), { key });

// ---------------- the empty town ----------------
const SHOPS = ['薬局', '食堂', '酒店', '理容', '電器', '米穀店', '時計店', '書店', '呉服', '写真館', '菓子店', '金物店', '寿司', '花屋'];
function townScene(ctx) {
  const scene = new THREE.Scene(), rnd = mulberry32(707);
  const SUN = sunDir(200, 28);
  const sky = makeDaySky({ noiseTex: ctx.noiseTex });
  for (const [k, v] of Object.entries(OVERCAST)) { const u = sky.uniforms[k]; if (u.value?.setRGB && Array.isArray(v)) u.value.setRGB(...v); else u.value = v; }
  sky.uniforms.uSunDir.value.copy(SUN); scene.add(sky);
  ATM.uFogColor.value.setRGB(0.6, 0.62, 0.64); ATM.uFogDensity.value = 0.004; ATM.uFogHeight.value = 80; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.copy(SUN); ATM.uGlowCol.value.setRGB(0.15, 0.14, 0.12); ATM.uGlowPow.value = 5; ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  dayLights(scene, { dir: SUN, sunColor: new THREE.Color(1, 0.95, 0.88), sunI: 1.6, skyColor: new THREE.Color(0.55, 0.6, 0.68), groundColor: new THREE.Color(0.25, 0.23, 0.2), hemiI: 1.5, center: V3(0, 0, -60), extent: 140, near: 100, far: 6000 });
  const add = (o) => { o.castShadow = o.receiveShadow = true; scene.add(o); return o; };
  const box = (sx, sy, sz, m, x, y, z, ry = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.set(x, y, z); b.rotation.y = ry; return add(b); };
  // ground and the road (runs along -z), edge lines, gutters
  const grass = lit([0.2, 0.24, 0.12], 1, 0, 'fk7g');
  const g0 = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), grass); g0.rotation.x = -Math.PI / 2; g0.position.z = -200; add(g0);
  const asphalt = lit([0.17, 0.17, 0.17], 0.95, 0, 'fk7a'), paint = lit([0.75, 0.75, 0.72], 0.8, 0, 'fk7p'), conc = lit([0.5, 0.5, 0.48], 0.9, 0, 'fk7c');
  box(7.4, 0.06, 420, asphalt, 0, 0.03, -170);
  for (const s of [-1, 1]) { box(0.15, 0.07, 420, paint, s * 3.4, 0.04, -170); box(1.6, 0.05, 420, conc, s * 4.6, 0.025, -170); }
  // shops and houses on both sides
  const walls = [[0.82, 0.8, 0.74], [0.72, 0.7, 0.66], [0.6, 0.58, 0.52], [0.78, 0.74, 0.64], [0.55, 0.5, 0.42], [0.86, 0.85, 0.82]].map((c, i) => lit(c, 0.9, 0, 'fk7w' + i));
  const roofs = [[0.13, 0.15, 0.19], [0.18, 0.18, 0.2], [0.3, 0.2, 0.14], [0.22, 0.26, 0.3]].map((c, i) => lit(c, 0.6, 0.1, 'fk7r' + i));
  const glass = lit([0.04, 0.05, 0.06], 0.15, 0, 'fk7gl'), shutter = lit([0.55, 0.56, 0.55], 0.6, 0.4, 'fk7sh'), frame = lit([0.35, 0.33, 0.3], 0.6, 0.2, 'fk7fr');
  const gable = (w, d, h, m) => { // triangular prism roof along x
    const sh = new THREE.Shape([new THREE.Vector2(-d / 2 - 0.5, 0), new THREE.Vector2(d / 2 + 0.5, 0), new THREE.Vector2(0, h)]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: w + 1, bevelEnabled: false }); geo.translate(0, 0, -(w + 1) / 2); geo.rotateY(Math.PI / 2);
    return new THREE.Mesh(geo, m);
  };
  let shopI = 0;
  for (const s of [-1, 1]) {
    let z = 6;
    while (z > -260) {
      const w = 7 + rnd() * 5, d = 9 + rnd() * 4, two = rnd() < 0.7, H = two ? 6.2 : 3.4, shop = rnd() < 0.6;
      const gap = rnd() < 0.15 ? 4 + rnd() * 6 : 0.6;
      const cz = z - w / 2, cx = s * (5.6 + d / 2 + rnd() * 1.5);
      const wm = walls[Math.floor(rnd() * walls.length)];
      const grp = new THREE.Group(); grp.position.set(cx, 0, cz); grp.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(grp);
      const b = (sx, sy, sz, m, x, y, zz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); o.position.set(x, y, zz); o.castShadow = o.receiveShadow = true; grp.add(o); return o; };
      // local: +z faces the road, x along the street
      b(w, H, d, wm, 0, H / 2, 0);
      const r = gable(w, d, 1.6 + rnd() * 1.0, roofs[Math.floor(rnd() * roofs.length)]); r.position.y = H; r.rotation.y = 0; r.castShadow = true; grp.add(r);
      if (shop) {
        b(w * 0.9, 2.6, 0.08, rnd() < 0.7 ? shutter : glass, 0, 1.35, d / 2 + 0.04);
        const t = textTex([SHOPS[shopI++ % SHOPS.length]], { w: 1024, h: 256, bg: ['#f2efe6', '#203c7a', '#7a1f1f', '#e9d9a6'][Math.floor(rnd() * 4)], fg: rnd() < 0.5 ? '#1b1b1b' : '#fdfbf2' });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, w * 0.2), texMat(t, 'fk7sign' + shopI)); sign.position.set(0, 3.25, d / 2 + 0.12); grp.add(sign);
        b(w * 0.95, 0.12, 1.1, frame, 0, 2.9, d / 2 + 0.5);    // awning
      } else { b(1.0, 2.0, 0.06, glass, -w * 0.3, 1.0, d / 2 + 0.03); b(1.6, 1.0, 0.06, glass, w * 0.15, 1.6, d / 2 + 0.03); }
      if (two) for (let k = 0; k < 2; k++) b(1.6, 1.1, 0.06, glass, (k - 0.5) * w * 0.5, 4.6, d / 2 + 0.03);
      if (rnd() < 0.25) { const tl = b(1.2, 0.2, 0.9, roofs[0], (rnd() - 0.5) * w, 0.1, d / 2 + 1.5); tl.rotation.set(rnd(), rnd(), rnd()); } // fallen tiles
      z -= w + gap;
    }
  }
  // utility poles and wires
  const pole = lit([0.62, 0.62, 0.6], 0.8, 0, 'fk7pole'), wireM = lit([0.05, 0.05, 0.05], 0.6, 0, 'fk7wire');
  const tops = [];
  for (let z = 0; z > -260; z -= 32) for (const s of [-1, 1]) {
    const x = s * 4.9, p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 11, 10), pole); p.position.set(x, 5.5, z); add(p);
    box(1.8, 0.12, 0.12, pole, x, 9.6, z); box(1.2, 0.1, 0.1, pole, x, 8.6, z);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12), conc); tr.position.set(x + s * 0.4, 7.6, z); add(tr);
    tops.push([s, z]);
  }
  for (const s of [-1, 1]) for (const [dx, y] of [[-0.8, 9.7], [0, 9.7], [0.8, 9.7], [-0.5, 8.7], [0.5, 8.7]]) {
    const zs = tops.filter(q => q[0] === s).map(q => q[1]);
    for (let i = 0; i + 1 < zs.length; i++) {
      const a = V3(s * 4.9 + dx, y, zs[i]), b = V3(s * 4.9 + dx, y, zs[i + 1]), pts = [];
      for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push(a.clone().lerp(b, u).add(V3(0, -0.6 * 4 * u * (1 - u), 0))); }
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.012, 3), wireM));
    }
  }
  // the arch across the road
  const archY = 6.2, archZ = -70, steelB = lit([0.3, 0.33, 0.38], 0.5, 0.4, 'fk7arch');
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, archY + 1.8, 12), steelB); p.position.set(s * 5.4, (archY + 1.8) / 2, archZ); add(p); }
  const at = textTex(['原子力明るい未来のエネルギー'], { w: 2048, h: 200, bg: '#f4f2ea', fg: '#1f3a8a', font: 'bold 120px IPAGothic', border: '#1f3a8a' });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(11.4, 1.1, 0.25), [steelB, steelB, steelB, steelB, texMat(at, 'fk7at'), texMat(at, 'fk7at2')]); panel.position.set(0, archY + 1.2, archZ); add(panel);
  // weeds: clumps in the gutters, along the walls and in cracks in the asphalt
  const blade = new THREE.ConeGeometry(0.05, 1, 3, 1); blade.translate(0, 0.5, 0);
  const NW = 26000, weeds = new THREE.InstancedMesh(blade, patchMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, side: THREE.DoubleSide }), { key: 'fk7weed' }), NW);
  const M = new THREE.Matrix4(), col = new THREE.Color(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  for (let i = 0; i < NW; i++) {
    let x, z = 8 - rnd() * 270; const r = rnd();
    if (r < 0.55) x = (rnd() < 0.5 ? -1 : 1) * (3.8 + rnd() * 1.8); else if (r < 0.9) x = (rnd() < 0.5 ? -1 : 1) * (5.4 + rnd() * 2.5); else { x = (rnd() - 0.5) * 6.6; z = Math.floor(z / 9) * 9 + rnd() * 0.5; }
    const h = (0.2 + rnd() * 0.7) * (Math.abs(x) > 5.4 ? 1.5 : Math.abs(x) < 3.4 ? 0.5 : 1);
    E.set((rnd() - 0.5) * 0.7, rnd() * 6.3, (rnd() - 0.5) * 0.7); Q.setFromEuler(E);
    M.compose(V3(x, 0, z), Q, V3(0.5 + rnd() * 0.6, h, 0.5 + rnd() * 0.6)); weeds.setMatrixAt(i, M);
    col.setRGB(0.12 + rnd() * 0.12, 0.2 + rnd() * 0.12, 0.06 + rnd() * 0.04); if (rnd() < 0.25) col.setRGB(0.32, 0.28, 0.15); weeds.setColorAt(i, col);
  }
  weeds.receiveShadow = true; scene.add(weeds);
  // an abandoned car and a bicycle against a wall
  const carM = lit([0.75, 0.75, 0.73], 0.4, 0.3, 'fk7car');
  box(1.7, 1.0, 3.6, carM, -2.4, 0.7, -38); box(1.5, 0.6, 2.0, glass, -2.4, 1.45, -38.3);
  return scene;
}

export async function FK7A(ctx) {
  const scene = townScene(ctx);
  const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 0.1, 3000);
  return { scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.18, uLookSat: 0.72, uBloom: 0.04, uHalation: 0.05, uVignette: 0.6, uGrain: 0.05, uShadowTint: [0.95, 1.0, 1.05] },
    update(t) {
      const z = -6 - 1.0 * t;
      placeCamera(camera, ctx, V3(0.4, 1.55, z), V3(0, 4.2, z - 60), { focal: 28, shake: 0.08, shakeFreq: 0.3, t, seed: 701 });
      return dcam(ctx, camera) || {};
    } };
}

// ---------------- the tank field ----------------
function siteLater(ctx, opts = {}) {
  const W = fukuWorld(ctx, Object.assign({ sun: sunDir(170, 35), sky: MARCH_SKY, fog: 0.0002, sunI: 3.4, hemiI: 1.0 }, opts));
  blowTop(W.units[0], W.mats, { rubble: 0.6 });
  // unit 3: the curved roof (fuel handling cover) built over the refuelling floor
  const u3 = W.units[2]; u3.top.visible = false;
  const cov = new THREE.Mesh(new THREE.CylinderGeometry(u3.w * 0.55, u3.w * 0.55, u3.w * 1.25, 32, 1, false, -Math.PI / 2, Math.PI), lit([0.82, 0.83, 0.82], 0.6, 0.2, 'fk7cov'));
  cov.rotation.x = Math.PI / 2; cov.scale.set(1, 1, 0.45); cov.position.copy(u3.group.position); cov.position.y += u3.h * 0.62; cov.castShadow = true; u3.group.parent.add(cov);
  for (const i of [3]) blowTop(W.units[i], W.mats, { frame: false, rubble: 0 });
  return W;
}
function tankField(W, rnd) {
  const areas = [[-720, -360, -260, 40], [-700, -380, 120, 420], [-300, -200, -330, -150]];
  const geo = new THREE.CylinderGeometry(6, 6, 12, 24); geo.translate(0, 6, 0);
  const N = 1100, tanks = new THREE.InstancedMesh(geo, lit([0.8, 0.8, 0.78], 0.55, 0.3, 'fk7tank'), N);
  const M = new THREE.Matrix4(), col = new THREE.Color(); let n = 0;
  for (const [x0, x1, z0, z1] of areas) for (let x = x0; x < x1 && n < N; x += 13.5) for (let z = z0; z < z1 && n < N; z += 13.5) {
    if (rnd() < 0.06) continue;
    const y = Math.min(groundHeight(x, z), x > -330 ? SITE_Y : 99);
    M.makeScale(1, 0.95 + rnd() * 0.2, 1); M.setPosition(x, y - 0.2, z); tanks.setMatrixAt(n, M);
    const k = rnd(); col.setRGB(...(k < 0.55 ? [0.78, 0.79, 0.78] : k < 0.85 ? [0.55, 0.6, 0.66] : [0.42, 0.5, 0.42])); tanks.setColorAt(n++, col);
  }
  tanks.count = n; tanks.castShadow = tanks.receiveShadow = true; W.scene.add(tanks);
  // clear the forest where the tanks stand
  W.scene.traverse(o => {
    if (!o.isInstancedMesh || o === tanks || !o.material.customProgramCacheKey?.().startsWith('fkpine')) return;
    const m = new THREE.Matrix4(), p = V3();
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); p.setFromMatrixPosition(m); if (areas.some(([x0, x1, z0, z1]) => p.x > x0 - 15 && p.x < x1 + 15 && p.z > z0 - 15 && p.z < z1 + 15)) { m.makeScale(0, 0, 0); o.setMatrixAt(i, m); } }
    o.instanceMatrix.needsUpdate = true;
  });
  // flattened pads under the tanks
  for (const [x0, x1, z0, z1] of areas) { const pad = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 16, 1, z1 - z0 + 16), lit([0.45, 0.45, 0.43], 1, 0, 'fk7pad')); pad.position.set((x0 + x1) / 2 - 6, Math.min(groundHeight((x0 + x1) / 2, (z0 + z1) / 2), x1 > -330 ? SITE_Y : 99) - 0.45, (z0 + z1) / 2 - 6); pad.receiveShadow = true; W.scene.add(pad); }
  return tanks;
}

export async function FK7B(ctx) {
  const W = siteLater(ctx); const { scene, camera } = W;
  tankField(W, mulberry32(77));
  const A = V3(-420, 230, 780), B = V3(-470, 210, 560);
  return { scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.88, uBloom: 0.04, uHalation: 0.05, uVignette: 0.5, uGrain: 0.04 },
    update(t) {
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 18)), V3(-420, 20, 60).lerp(V3(-380, 20, -60), easeInOutSine(t / 18)), { focal: 30, shake: 0.04, shakeFreq: 0.25, t, seed: 702 });
      return dcam(ctx, camera) || {};
    } };
}

// ---------------- the ice wall ----------------
export async function FK7C(ctx) {
  const W = siteLater(ctx, { sun: sunDir(230, 28) }); const { scene, camera } = W;
  const rnd = mulberry32(88);
  const frost = lit([0.88, 0.92, 0.96], 0.9, 0, 'fk7frost'), steel = lit([0.45, 0.47, 0.5], 0.5, 0.5, 'fk7st'), gravel = lit([0.42, 0.4, 0.37], 1, 0, 'fk7gr');
  const X = -132;                                  // the wall runs north-south west of the reactor buildings
  const strip = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 300), gravel); strip.position.set(X, SITE_Y + 0.1, 100); strip.receiveShadow = true; scene.add(strip);
  const head = new THREE.CylinderGeometry(0.22, 0.22, 1.0, 12); head.translate(0, 0.5, 0);
  const N = 300, heads = new THREE.InstancedMesh(head, frost, N), M = new THREE.Matrix4();
  for (let i = 0; i < N; i++) { M.makeScale(1 + rnd() * 0.15, 0.8 + rnd() * 0.5, 1 + rnd() * 0.15); M.setPosition(X + (i % 2 ? 0.6 : -0.6), SITE_Y + 0.2, -40 + Math.floor(i / 2) * 1.0); heads.setMatrixAt(i, M); }
  heads.castShadow = true; scene.add(heads);
  // brine headers along the row, frosted, with a few thin feed pipes looping into each head
  for (const [dx, y, r] of [[-1.4, SITE_Y + 1.0, 0.18], [1.4, SITE_Y + 1.0, 0.18], [0, SITE_Y + 1.6, 0.25]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 150, 12), frost); p.rotation.x = Math.PI / 2; p.position.set(X + dx, y, 35); p.castShadow = true; scene.add(p);
  }
  const loopG = new THREE.TorusGeometry(0.45, 0.04, 6, 12, Math.PI);
  const loops = new THREE.InstancedMesh(loopG, frost, N); const q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < N; i++) { e.set(0, Math.PI / 2, 0); q.setFromEuler(e); M.compose(V3(X + (i % 2 ? 0.6 : -0.6), SITE_Y + 1.15, -40 + Math.floor(i / 2) * 1.0), q, V3(1, 1, 1)); loops.setMatrixAt(i, M); }
  scene.add(loops);
  // a few supports
  for (let z = -40; z < 110; z += 6) { const s = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 0.12), steel); s.position.set(X, SITE_Y + 0.9, z); scene.add(s); }
  const A = V3(X - 4.5, SITE_Y + 1.7, -48), B = V3(X - 3.6, SITE_Y + 2.1, -30);
  return { scene, camera,
    look: { uExposure: 1.05, uLookPow: 1.2, uLookSat: 0.85, uBloom: 0.05, uHalation: 0.06, uVignette: 0.55, uGrain: 0.045 },
    update(t) {
      const k = easeInOutSine(t / 14);
      placeCamera(camera, ctx, A.clone().lerp(B, k), V3(X + 1, SITE_Y + 6, 60), { focal: 26, shake: 0.06, shakeFreq: 0.3, t, seed: 703 });
      return dcam(ctx, camera) || { dof: { focus: 12, focal: 26, fstop: 5.6 } };
    } };
}

// ---------------- FK8A: dusk over the plant from the sea ----------------
const DUSK_SKY = { uZenith: [0.08, 0.12, 0.26], uHorizon: [0.95, 0.55, 0.32], uCloudBright: [1.3, 0.85, 0.6], uCloudShade: [0.25, 0.2, 0.28], uCloudCover: 0.45, uCloudScale: 1.2, uSunCol: [1.6, 0.8, 0.4] };
export async function FK8A(ctx) {
  const W = siteLater(ctx, { sun: sunDir(262, 4), sky: DUSK_SKY, fog: 0.00022, fogColor: [0.55, 0.42, 0.38], sunI: 2.2, sunCol: [1.0, 0.6, 0.35], hemiSky: [0.35, 0.38, 0.55], hemiGround: [0.15, 0.12, 0.1], hemiI: 0.8 });
  const { scene, camera } = W;
  tankField(W, mulberry32(77));
  // site lights coming on
  const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 4.5, 2.6) });
  const lampG = new THREE.SphereGeometry(0.7, 8, 6), rnd = mulberry32(12);
  for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(lampG, lampM); m.position.set(-260 + rnd() * 250, SITE_Y + 6 + rnd() * 20, -120 + rnd() * 400); scene.add(m); }
  const A = V3(560, 95, 520), B = V3(450, 85, 430);
  return { scene, camera,
    look: { uExposure: 1.0, uLookPow: 1.2, uLookSat: 0.95, uBloom: 0.1, uHalation: 0.12, uVignette: 0.55, uGrain: 0.045, uHighTint: [1.06, 1.0, 0.92] },
    update(t) {
      placeCamera(camera, ctx, A.clone().lerp(B, easeInOutSine(t / 20)), V3(-110, 30, 90), { focal: 34, shake: 0.04, shakeFreq: 0.2, t, seed: 801 });
      return dcam(ctx, camera) || {};
    } };
}
