// Chernobyl NPP (V.I. Lenin), second stage: units 3 & 4 with block V and the VT-2 vent
// stack, the long turbine hall, units 1 & 2, switchyard pylons, floodlights, and the
// unit 5/6 construction site with two unfinished hyperbolic cooling towers.
// Unit 4's central hall is built from panels so it can be blown apart deterministically.
import * as THREE from 'three';
import { patchMaterial, ATM } from './atmos.js';
import { mulberry32, smoothstep, clamp } from './util.js';
import { mergeGeos } from './city.js';

export const PLANT = new THREE.Vector3(2150, 0, 2250); // world position of unit 4 reactor centre

// ---------- industrial facade ----------
export function makeIndustrialMaterial(noiseTex) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  patchMaterial(mat, {
    key: 'industrial',
    uniforms: { tNoise: { value: noiseTex }, uTimeF: ATM.uTime },
    vertexHeader: `attribute vec4 aP; attribute vec4 aW; varying vec4 vFac; varying vec4 vP; varying vec4 vW; varying float vFace;`,
    vertexMain: `
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      vec3 lm = position * sc;
      vP = aP; vW = aW;
      if (abs(normal.x) > 0.5) { vFac = vec4(lm.z + sc.z * 0.5, lm.y, 0.0, sc.z); vFace = 0.0; }
      else if (abs(normal.z) > 0.5) { vFac = vec4(lm.x + sc.x * 0.5, lm.y, 0.0, sc.x); vFace = 2.0; }
      else { vFac = vec4(lm.x, lm.z, 1.0, sc.y); vFace = 4.0; }
      vFac.y += aW.w;`,
    fragmentHeader: `
      precision highp sampler3D; uniform sampler3D tNoise; uniform float uTimeF;
      varying vec4 vFac; varying vec4 vP; varying vec4 vW; varying float vFace;
      float hh(vec3 p){ ivec3 q = ivec3(floor(p + 0.5)) + ivec3(4096); uint h = uint(q.x) * 1597334677u ^ uint(q.y) * 3812015801u ^ uint(q.z) * 2741869493u; h = (h ^ (h >> 16u)) * 2246822519u; h ^= h >> 13u; h *= 3266489917u; h ^= h >> 16u; return float(h) * (1.0 / 4294967296.0); }
      vec3 gEm; float gR;`,
    fragmentReplace: [
      ['#include <color_fragment>', `#include <color_fragment>
      gEm = vec3(0.0); gR = 0.9;
      {
        float seed = floor(vP.x * 7.0 + 0.5), pw = vP.y, ph = vP.z, style = floor(vP.w + 0.5);
        if (vFace > 3.5) {
          float n = texture(tNoise, vec3(vWPos.xz * 0.02, vP.x)).r;
          diffuseColor.rgb = vec3(0.05) * (0.7 + 0.6 * n); gR = 0.8;
        } else {
          float u = vFac.x, y = vFac.y;
          float pu = u / pw, pv = y / ph;
          float pid = hh(vec3(floor(pu), floor(pv), seed));
          vec3 c = vec3(0.36, 0.36, 0.345) * (0.88 + 0.16 * pid);
          float n1 = texture(tNoise, vec3(u * 0.03, y * 0.02, vP.x + vFace * 0.1)).r;
          float st = texture(tNoise, vec3(u * 0.25, y * 0.008, vP.x * 0.3)).g;
          c *= 0.7 + 0.45 * n1;
          c *= mix(1.0, 0.62, smoothstep(0.5, 0.85, st));
          c *= mix(0.6, 1.0, smoothstep(0.0, 8.0, y));
          float topStain = smoothstep(vFac.w + vW.w - 4.0, vFac.w + vW.w, y);
          c *= 1.0 - topStain * 0.35;
          float sx = min(fract(pu), 1.0 - fract(pu)) * pw, sy = min(fract(pv), 1.0 - fract(pv)) * ph;
          c *= 1.0 - (1.0 - smoothstep(0.0, 0.06, sx)) * 0.35 - (1.0 - smoothstep(0.0, 0.05, sy)) * 0.3;
          if (style > 0.5 && style < 1.5) { // ribbed reactor-block panels
            c *= 0.92 + 0.08 * smoothstep(0.3, 0.5, abs(fract(u / 1.2) - 0.5) * 2.0);
          }
          // glazing band(s)
          float y0 = vW.x, y1 = vW.y, litF = vW.z;
          if (y > y0 && y < y1) {
            float mx = fract(u / 1.5), my = fract((y - y0) / 1.2);
            bool fr = mx < 0.05 || mx > 0.95 || my < 0.06;
            float seg = floor(u / 12.0);
            float lit = step(hh(vec3(seg, floor((y - y0) / 6.0), seed * 3.0)), litF);
            if (fr) { c = vec3(0.18, 0.18, 0.17); }
            else {
              c = vec3(0.02, 0.022, 0.025); gR = 0.12;
              float fl = 0.55 + 0.45 * hh(vec3(floor(u / 1.5), floor((y - y0) / 1.2), seed));
              float col6 = smoothstep(0.0, 0.08, abs(fract(u / 6.0) - 0.5) * 2.0 - 0.84);
              float dirt = 0.6 + 0.4 * texture(tNoise, vec3(u * 0.05, y * 0.08, vP.x)).r;
              gEm += vec3(0.72, 0.9, 1.0) * lit * fl * 0.16 * (1.0 - col6 * 0.8) * dirt;
            }
          }
          // office-style punched windows (style 2)
          if (style > 1.5) {
            float cw = 3.0, fh = 3.3;
            float cx = fract(u / cw) * cw, fy = fract(y / fh) * fh;
            if (cx > 0.7 && cx < 2.3 && fy > 1.0 && fy < 2.5 && y > 3.0 && y < vFac.w + vW.w - 1.5) {
              c = vec3(0.02);
              float wid = hh(vec3(floor(u / cw), floor(y / fh), seed));
              gEm += vec3(0.85, 0.95, 1.0) * step(wid, litF) * 0.6;
              gR = 0.12;
            }
          }
          diffuseColor.rgb = c;
        }
      }`],
      ['#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
       roughnessFactor = gR;`],
      ['#include <normal_fragment_maps>', `#include <normal_fragment_maps>
       if (vFace < 3.5) {
         // grooves at panel joints: tilt the normal across the joint (in view space)
         float pw = vP.y, ph = vP.z;
         float fu = fract(vFac.x / pw), fv = fract(vFac.y / ph);
         float gu = (smoothstep(0.0, 0.012, fu) - 1.0) + smoothstep(0.988, 1.0, fu);
         float gv = (smoothstep(0.0, 0.015, fv) - 1.0) + smoothstep(0.985, 1.0, fv);
         vec3 wn = normalize(vWNrm);
         vec3 tU = normalize(cross(vec3(0.0, 1.0, 0.0), wn)); vec3 tV = vec3(0.0, 1.0, 0.0);
         float bumpN = texture(tNoise, vec3(vFac.x * 0.4, vFac.y * 0.4, vP.x)).g - 0.5;
         vec3 nW = normalize(wn + tU * gu * 0.8 + tV * gv * 0.8 + (tU * bumpN + tV * bumpN) * 0.08);
         normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
       }`],
      ['#include <emissivemap_fragment>', `#include <emissivemap_fragment>
       totalEmissiveRadiance += gEm;`],
    ],
  });
  return mat;
}

// Collect boxes into one instanced mesh with per-instance facade params.
class BoxSet {
  constructor() { this.items = []; }
  // centre x,z, base y, size w(x) h d(z); params
  add(x, y, z, w, h, d, { seed = Math.random() * 100, pw = 6, ph = 6, style = 0, band = [0, 0], lit = 0, rotY = 0 } = {}) {
    this.items.push({ x, y, z, w, h, d, seed, pw, ph, style, band, lit, rotY });
  }
  build(material) {
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const n = this.items.length;
    const aP = new Float32Array(n * 4), aW = new Float32Array(n * 4);
    const im = new THREE.InstancedMesh(geo, material, n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    this.items.forEach((b, i) => {
      e.set(0, b.rotY, 0); q.setFromEuler(e);
      m.compose(new THREE.Vector3(b.x, b.y, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
      im.setMatrixAt(i, m);
      aP.set([b.seed, b.pw, b.ph, b.style], i * 4);
      aW.set([b.band[0], b.band[1], b.lit, b.y], i * 4);
    });
    geo.setAttribute('aP', new THREE.InstancedBufferAttribute(aP, 4));
    geo.setAttribute('aW', new THREE.InstancedBufferAttribute(aW, 4));
    im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
    return im;
  }
}

// beam between two points (box), returns matrix
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0);
function beamMatrix(a, b, t) {
  const d = new THREE.Vector3().subVectors(b, a); const L = d.length();
  _q.setFromUnitVectors(_up, d.clone().normalize());
  return new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), _q, new THREE.Vector3(t, L, t));
}
function instancedBeams(list, material, colors) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const im = new THREE.InstancedMesh(geo, material, list.length);
  list.forEach((mm, i) => { im.setMatrixAt(i, mm); if (colors) im.setColorAt(i, colors[i]); });
  im.castShadow = true; im.frustumCulled = false;
  return im;
}

// Lattice vent stack (VT-2 style) with central pipe, red/white marking and red aviation lights.
function ventStack(baseY, topY, wBase, wTop, mat, pipeMat, rnd) {
  const g = new THREE.Group();
  const beams = [], cols = [];
  const red = new THREE.Color(0.55, 0.08, 0.05), white = new THREE.Color(0.75, 0.75, 0.72);
  const levels = 10;
  const hw = (y) => THREE.MathUtils.lerp(wBase, wTop, (y - baseY) / (topY - baseY)) / 2;
  const corner = (y, k) => { const h = hw(y); const s = [[1, 1], [-1, 1], [-1, -1], [1, -1]][k]; return new THREE.Vector3(s[0] * h, y, s[1] * h); };
  const colAt = (y) => { const f = (y - baseY) / (topY - baseY); const band = Math.floor(f * 10); return (f > 0.55 && band % 2 === 0) ? red : (f > 0.55 ? white : white); };
  for (let k = 0; k < 4; k++) { // legs per level segment for colour banding
    for (let l = 0; l < levels; l++) {
      const y0 = baseY + (topY - baseY) * l / levels, y1 = baseY + (topY - baseY) * (l + 1) / levels;
      beams.push(beamMatrix(corner(y0, k), corner(y1, k), 0.55)); cols.push(colAt((y0 + y1) / 2));
    }
  }
  for (let l = 0; l <= levels; l++) {
    const y = baseY + (topY - baseY) * l / levels;
    for (let k = 0; k < 4; k++) { beams.push(beamMatrix(corner(y, k), corner(y, (k + 1) % 4), 0.35)); cols.push(colAt(y)); }
    if (l < levels) {
      const y1 = baseY + (topY - baseY) * (l + 1) / levels;
      for (let k = 0; k < 4; k++) {
        beams.push(beamMatrix(corner(y, k), corner(y1, (k + 1) % 4), 0.22)); cols.push(colAt((y + y1) / 2));
        beams.push(beamMatrix(corner(y1, k), corner(y, (k + 1) % 4), 0.22)); cols.push(colAt((y + y1) / 2));
      }
    }
  }
  g.add(instancedBeams(beams, mat, cols));
  // central pipe with banding at the top
  const pipeH = topY - baseY + 2;
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.0, pipeH, 20, 12, true), pipeMat);
  pipe.position.y = baseY + pipeH / 2; pipe.castShadow = true;
  g.add(pipe);
  // aviation lights
  const lights = [];
  for (const y of [topY + 1, baseY + (topY - baseY) * 0.66, baseY + (topY - baseY) * 0.33]) {
    for (let k = 0; k < 4; k++) { const c = corner(Math.min(y, topY), k); lights.push(new THREE.Vector3(c.x * 1.05, y, c.z * 1.05)); }
  }
  return { group: g, lights };
}

// Hyperbolic cooling-tower shell, built up to `built` of full height with a ragged top.
function coolingTower(R0, Rmin, H, built, mat, rnd) {
  const pts = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const y = H * i / steps;
    if (y > H * built + 0.01) break;
    const waist = 0.72;
    const t = (y / H - waist);
    const r = Math.sqrt(Rmin * Rmin + (t * t) * ((R0 * R0 - Rmin * Rmin) / (waist * waist)));
    pts.push(new THREE.Vector2(r, y));
  }
  const geo = new THREE.LatheGeometry(pts, 64);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  // the shell is open (double sided)
  mat.side = THREE.DoubleSide;
  return mesh;
}

function towerCrane(h, jib, mat, rotY) {
  const g = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.BoxGeometry(2, h, 2), mat); mast.position.y = h / 2; g.add(mast);
  const j = new THREE.Mesh(new THREE.BoxGeometry(jib, 1.6, 1.6), mat); j.position.set(jib * 0.3, h + 1, 0); g.add(j);
  const cj = new THREE.Mesh(new THREE.BoxGeometry(2.2, 6, 2.2), mat); cj.position.set(0, h + 4, 0); g.add(cj);
  g.rotation.y = rotY;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, tip: [new THREE.Vector3(0, h + 7.5, 0), new THREE.Vector3(jib * 0.8, h + 1.8, 0)] };
}

function pylon(h, mat) { // simple lattice pylon for 750 kV lines
  const beams = [];
  const c = (y, k, w) => { const s = [[1, 1], [-1, 1], [-1, -1], [1, -1]][k]; return new THREE.Vector3(s[0] * w, y, s[1] * w); };
  const wAt = (y) => THREE.MathUtils.lerp(4.5, 1.2, y / h);
  const lv = 6;
  for (let l = 0; l < lv; l++) {
    const y0 = h * l / lv, y1 = h * (l + 1) / lv;
    for (let k = 0; k < 4; k++) { beams.push(beamMatrix(c(y0, k, wAt(y0)), c(y1, k, wAt(y1)), 0.3)); beams.push(beamMatrix(c(y0, k, wAt(y0)), c(y1, (k + 1) % 4, wAt(y1)), 0.15)); }
  }
  beams.push(beamMatrix(new THREE.Vector3(-14, h, 0), new THREE.Vector3(14, h, 0), 0.6));
  beams.push(beamMatrix(new THREE.Vector3(-10, h * 0.82, 0), new THREE.Vector3(10, h * 0.82, 0), 0.4));
  return beams;
}

export function buildPlant(ctx, opts = {}) {
  const { noiseTex } = ctx;
  const rnd = mulberry32(4);
  const root = new THREE.Group();
  root.position.copy(PLANT);
  const indMat = makeIndustrialMaterial(noiseTex);
  const bs = new BoxSet();
  const S = () => rnd() * 100;
  // --- turbine hall (north), x from -560 to 90 ---
  bs.add(-235, 0, -70, 650, 31, 51, { seed: S(), pw: 6, ph: 6, style: 0, band: [16, 27], lit: 0.75 });
  // roof monitors (skylight ridge)
  bs.add(-235, 31, -70, 640, 3.2, 9, { seed: S(), pw: 6, ph: 3.2, style: 0, band: [0.6, 2.8], lit: 0.5 });
  // --- deaerator stack between turbine hall and reactor blocks ---
  bs.add(-235, 0, -38.5, 640, 49, 12, { seed: S(), pw: 6, ph: 6, style: 0, band: [37, 41], lit: 0.35 });
  // --- reactor block unit 4 (lower part); central hall is panelised below ---
  bs.add(0, 0, 4, 72, 47.5, 72, { seed: S(), pw: 6, ph: 6, style: 1 });
  // --- block V between units 3 and 4 with the stack base ---
  bs.add(-58, 0, 4, 44, 44, 58, { seed: S(), pw: 6, ph: 6, style: 1 });
  // --- unit 3 reactor block + its central hall (intact) ---
  bs.add(-116, 0, 4, 72, 47.5, 72, { seed: S(), pw: 6, ph: 6, style: 1 });
  bs.add(-116, 47.5, 4, 50, 23.8, 60, { seed: S(), pw: 6, ph: 6, style: 1 });
  // --- units 1 & 2 (first stage), further west ---
  for (const ux of [-330, -455]) {
    bs.add(ux, 0, 4, 70, 46, 70, { seed: S(), pw: 6, ph: 6, style: 1 });
    bs.add(ux, 46, 4, 48, 24, 58, { seed: S(), pw: 6, ph: 6, style: 1 });
  }
  bs.add(-392, 0, 4, 55, 40, 52, { seed: S(), pw: 6, ph: 6, style: 1 });
  // auxiliary / chemical / diesel buildings, admin building (office windows)
  bs.add(70, 0, 60, 40, 20, 46, { seed: S(), pw: 6, ph: 5, style: 0 });
  bs.add(-170, 0, 80, 60, 16, 36, { seed: S(), pw: 6, ph: 4, style: 0 });
  bs.add(-260, 0, -170, 90, 22, 26, { seed: S(), pw: 3, ph: 3.3, style: 2, lit: 0.22 });
  bs.add(-120, 0, -190, 50, 12, 30, { seed: S(), pw: 6, ph: 4, style: 0 });
  bs.add(250, 0, -190, 30, 14, 40, { seed: S(), pw: 6, ph: 4, style: 0, band: [8, 11], lit: 0.4 });
  bs.add(110, 0, -150, 26, 9, 18, { seed: S(), pw: 6, ph: 4, style: 2, lit: 0.3 });
  const plantBoxes = bs.build(indMat);
  root.add(plantBoxes);

  // --- unit 4 central hall as panels (walls + roof), base at 47.5, top 71.3 ---
  const CH = { x0: -25, x1: 25, z0: -26, z1: 34, y0: 47.5, y1: 71.3, pw: 6.25, ph: 5.95 };
  const panels = [];
  const nx = Math.round((CH.x1 - CH.x0) / CH.pw), nz = Math.round((CH.z1 - CH.z0) / 6), ny = 4;
  const pwX = (CH.x1 - CH.x0) / nx, pwZ = (CH.z1 - CH.z0) / nz, phY = (CH.y1 - CH.y0) / ny;
  const th = 0.5;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = CH.x0 + (i + 0.5) * pwX, y = CH.y0 + (j + 0.5) * phY;
      panels.push({ p: new THREE.Vector3(x, y, CH.z0), s: new THREE.Vector3(pwX, phY, th), wall: 'N', i, j });
      panels.push({ p: new THREE.Vector3(x, y, CH.z1), s: new THREE.Vector3(pwX, phY, th), wall: 'S', i, j });
    }
    for (let k = 0; k < nz; k++) {
      const z = CH.z0 + (k + 0.5) * pwZ, y = CH.y0 + (j + 0.5) * phY;
      panels.push({ p: new THREE.Vector3(CH.x0, y, z), s: new THREE.Vector3(th, phY, pwZ), wall: 'W', i: k, j });
      panels.push({ p: new THREE.Vector3(CH.x1, y, z), s: new THREE.Vector3(th, phY, pwZ), wall: 'E', i: k, j });
    }
  }
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    panels.push({ p: new THREE.Vector3(CH.x0 + (i + 0.5) * pwX, CH.y1, CH.z0 + (k + 0.5) * pwZ), s: new THREE.Vector3(pwX, 0.8, pwZ), wall: 'R', i, j: k });
  }
  // upper east facade of the lower block (destroyed down to ~20 m)
  for (let j = 0; j < 5; j++) for (let k = 0; k < 12; k++) {
    panels.push({ p: new THREE.Vector3(36, 20 + (j + 0.5) * 5.5, -32 + (k + 0.5) * 6), s: new THREE.Vector3(0.6, 5.5, 6), wall: 'E2', i: k, j });
  }
  const prnd = mulberry32(1986);
  // per wall column: how many rows survive (from the bottom). Jagged, heavier damage to the east/north.
  const keepRows = {};
  const keepOf = (wall, i) => {
    const key = wall + i;
    if (keepRows[key] !== undefined) return keepRows[key];
    const r = prnd();
    let k = 0;
    if (wall === 'W') k = 2 + Math.floor(r * 2.2);                 // west wall mostly stands
    else if (wall === 'S') k = i > nx * 0.6 ? Math.floor(r * 2) : 1 + Math.floor(r * 2.4);
    else if (wall === 'N') k = i > nx * 0.55 ? Math.floor(r * 1.6) : 1 + Math.floor(r * 2.2);
    else if (wall === 'E') k = Math.floor(r * 1.3);
    else if (wall === 'E2') k = (i > 3 && i < 10) ? 0 : Math.floor(r * 2.5);
    keepRows[key] = k; return k;
  };
  for (const pn of panels) {
    if (pn.wall === 'R') pn.gone = true;
    else {
      const k = keepOf(pn.wall, pn.i);
      pn.gone = pn.j >= k;
      // the top surviving panel of a column is broken off irregularly
      pn.broken = !pn.gone && pn.j === k - 1 && pn.wall !== 'E2' ? 0.35 + prnd() * 0.6 : 1;
    }
    const cx = (CH.x0 + CH.x1) / 2, cz = (CH.z0 + CH.z1) / 2;
    const out = new THREE.Vector3(pn.p.x - cx, 0, pn.p.z - cz).normalize();
    const up = pn.wall === 'R' ? 16 + prnd() * 30 : 6 + prnd() * 16;
    const sideV = pn.wall === 'R' ? 3 + prnd() * 12 : 6 + prnd() * 14;
    pn.v = new THREE.Vector3(out.x * sideV + (prnd() - 0.5) * 8, up, out.z * sideV + (prnd() - 0.5) * 8);
    if (pn.wall === 'E2') pn.v.set(10 + prnd() * 12, 4 + prnd() * 10, (prnd() - 0.5) * 8);
    pn.w = new THREE.Vector3(prnd() - 0.5, prnd() - 0.5, prnd() - 0.5).normalize();
    pn.wspd = 1.5 + prnd() * 5;
    pn.delay = (pn.wall === 'E2' ? 0.08 : 0.0) + prnd() * 0.12;
    pn.landY = pn.wall === 'E2' ? 0.3 : (Math.abs(pn.p.x + pn.v.x * 1.5) < 36 ? 47.5 : 31);
    pn.tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler((prnd() - 0.5) * 0.12, 0, (prnd() - 0.5) * 0.16));
  }
  const panelMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x8d8c88, roughness: 0.9 }), { key: 'panel' });
  const panelMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), panelMat, panels.length);
  panelMesh.castShadow = true; panelMesh.receiveShadow = true; panelMesh.frustumCulled = false;
  const pcol = new THREE.Color();
  panels.forEach((pn, i) => { pcol.setScalar(0.75 + prnd() * 0.3); panelMesh.setColorAt(i, pcol); });
  root.add(panelMesh);

  // --- ruins (appear after the explosion): interior floors, steel frames, debris heaps ---
  const ruins = new THREE.Group();
  const darkMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x2b2a28, roughness: 0.95 }), { key: 'dark' });
  const steelMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x3a3836, roughness: 0.7, metalness: 0.4 }), { key: 'steel' });
  const rr = mulberry32(44);
  const ruinBeams = [];
  for (let i = 0; i <= nx; i++) { // steel columns along N and S walls, some bent
    for (const z of [CH.z0, CH.z1]) {
      const h = 6 + rr() * 18;
      const bend = new THREE.Vector3((rr() - 0.5) * 6, 0, (rr() - 0.5) * 6);
      const a = new THREE.Vector3(CH.x0 + i * pwX, CH.y0, z);
      ruinBeams.push(beamMatrix(a, a.clone().add(new THREE.Vector3(0, h * 0.6, 0)), 0.7));
      ruinBeams.push(beamMatrix(a.clone().add(new THREE.Vector3(0, h * 0.6, 0)), a.clone().add(new THREE.Vector3(0, h, 0)).add(bend), 0.6));
    }
  }
  for (let k = 0; k < 14; k++) { // fallen trusses across the hall
    const a = new THREE.Vector3(CH.x0 + rr() * 50, CH.y0 + rr() * 10, CH.z0 + rr() * 60);
    const b = a.clone().add(new THREE.Vector3((rr() - 0.5) * 30, (rr() - 0.3) * 12, (rr() - 0.5) * 30));
    ruinBeams.push(beamMatrix(a, b, 0.8));
  }
  ruins.add(instancedBeams(ruinBeams, steelMat));
  // debris heaps (rubble) on the hall floor, the east side and surrounding roofs
  const rubbleGeo = new THREE.BoxGeometry(1, 1, 1);
  const rubble = [];
  for (let k = 0; k < 260; k++) {
    let x, y, z;
    const zone = rr();
    if (zone < 0.45) { x = CH.x0 + rr() * 50; z = CH.z0 + rr() * 60; y = CH.y0 + rr() * 3; }
    else if (zone < 0.75) { x = 36 + rr() * 30; z = -32 + rr() * 72; y = rr() * 4; }
    else { x = -10 + rr() * 50; z = -60 + rr() * 25; y = 31 + rr() * 1.5; }
    const s = 1 + rr() * 3.5;
    const mm = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((rr() - 0.5) * 0.9, rr() * 6, (rr() - 0.5) * 0.9)), new THREE.Vector3(s * 1.6, s * (0.12 + rr() * 0.2), s * (0.8 + rr() * 0.8)));
    rubble.push(mm);
  }
  const rubMesh = new THREE.InstancedMesh(rubbleGeo, darkMat, rubble.length);
  rubble.forEach((mm, i) => rubMesh.setMatrixAt(i, mm));
  rubMesh.castShadow = true; rubMesh.receiveShadow = true; rubMesh.frustumCulled = false;
  ruins.add(rubMesh);
  // exposed floors on the east side
  for (let j = 0; j < 5; j++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(14 + rr() * 8, 0.6, 66), darkMat);
    f.position.set(31 - rr() * 4, 20 + j * 5.5, 4); f.castShadow = true; ruins.add(f);
  }
  // core glow: the open reactor shaft, emissive, plus the tilted upper shield ("Elena")
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.3, 0.06).multiplyScalar(2.2) });
  const core = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 1, 24), coreMat);
  core.position.set(0, CH.y0 - 0.2, 4); core.visible = false; ruins.add(core);
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, 3, 32), darkMat);
  shield.position.set(1, CH.y0 + 3.5, 4); shield.rotation.set(1.2, 0.3, 0.2); shield.castShadow = true; shield.visible = false; ruins.add(shield);
  ruins.visible = false;
  root.add(ruins);

  // --- clutter: parapets, rooftop units, stair towers, ducts, masts (breaks up the boxes) ---
  {
    const cl = new BoxSet();
    const crnd = mulberry32(808);
    const par = (x0, x1, z0, z1, y) => { // parapet ring on a roof
      const t = 0.35, h = 1.3;
      cl.add((x0 + x1) / 2, y, z0, x1 - x0, h, t, { seed: crnd() * 99, pw: 6, ph: 1.3 });
      cl.add((x0 + x1) / 2, y, z1, x1 - x0, h, t, { seed: crnd() * 99, pw: 6, ph: 1.3 });
      cl.add(x0, y, (z0 + z1) / 2, t, h, z1 - z0, { seed: crnd() * 99, pw: 6, ph: 1.3 });
      cl.add(x1, y, (z0 + z1) / 2, t, h, z1 - z0, { seed: crnd() * 99, pw: 6, ph: 1.3 });
    };
    par(-560, 90, -95.5, -44.5, 31); par(-555, 85, -44.5, -32.5, 49);
    par(-36, 36, -32, 40, 47.5); par(-80, -36, -25, 33, 44); par(-152, -80, -32, 40, 47.5); par(-141, -91, -26, 34, 71.3);
    for (const ux of [-330, -455]) { par(ux - 35, ux + 35, -31, 39, 46); par(ux - 24, ux + 24, -25, 33, 70); }
    // rooftop ventilation units on the turbine hall and deaerator
    for (let x = -540; x < 80; x += 22 + crnd() * 18) {
      const w = 4 + crnd() * 6, d = 3 + crnd() * 5, h = 2 + crnd() * 3.5;
      cl.add(x, 31, -95 + 8 + crnd() * 30, w, h, d, { seed: crnd() * 99, pw: 3, ph: 2 });
      if (crnd() < 0.5) cl.add(x + 8, 49, -38.5 + (crnd() - 0.5) * 6, 3 + crnd() * 3, 1.5 + crnd() * 3, 3, { seed: crnd() * 99, pw: 3, ph: 2 });
    }
    // units on reactor-block roofs (unit 3/4 lower roofs)
    for (let k = 0; k < 26; k++) {
      const onU4 = k % 2 === 0;
      const x = (onU4 ? 0 : -116) + (crnd() - 0.5) * 64, z = 4 + (crnd() - 0.5) * 64;
      if (Math.abs(x - (onU4 ? 0 : -116)) < 26 && Math.abs(z - 4) < 31) continue; // not inside central halls
      cl.add(x, 47.5, z, 3 + crnd() * 7, 1.5 + crnd() * 4, 3 + crnd() * 6, { seed: crnd() * 99, pw: 3, ph: 2 });
    }
    // external stair / elevator towers
    cl.add(37.5, 0, -18, 7, 52, 8, { seed: 11, pw: 3, ph: 3, style: 2, lit: 0.25 });
    cl.add(-36, 0, 42, 8, 50, 7, { seed: 12, pw: 3, ph: 3, style: 2, lit: 0.2 });
    cl.add(-154, 0, -10, 7, 52, 8, { seed: 13, pw: 3, ph: 3, style: 2, lit: 0.2 });
    cl.add(91.5, 0, -60, 6, 34, 7, { seed: 14, pw: 3, ph: 3, style: 2, lit: 0.3 });
    // large ducts between deaerator and reactor blocks
    for (const x of [-20, 18, -130, -100]) cl.add(x, 38, -28, 5, 4, 10, { seed: crnd() * 99, pw: 2, ph: 2 });
    root.add(cl.build(indMat));
    // masts / lightning rods on roofs
    const mastMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x4a4a48, roughness: 0.6, metalness: 0.4 }), { key: 'mast' });
    const masts = [];
    for (const [x, y, z, h] of [[30, 47.5, 36, 12], [-30, 47.5, -28, 10], [80, 31, -50, 9], [-200, 31, -90, 9], [-300, 49, -40, 8], [-140, 71.3, 30, 7], [-90, 47.5, 36, 10]]) {
      masts.push(beamMatrix(new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + h, z), 0.25));
    }
    root.add(instancedBeams(masts, mastMat));
  }
  // --- vent stack VT-2 on block V ---
  const latMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.2 }), { key: 'lattice' });
  const pipeMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x9a9a96, roughness: 0.8, side: THREE.DoubleSide }), { key: 'pipe' });
  const vt2 = ventStack(44, 150, 17, 6.5, latMat, pipeMat, rnd);
  vt2.group.position.set(-58, 0, 4);
  root.add(vt2.group);
  const vt1 = ventStack(46, 150, 17, 6.5, latMat, pipeMat, rnd);
  vt1.group.position.set(-392, 0, 4);
  root.add(vt1.group);
  const aviation = [...vt2.lights.map(p => p.clone().add(new THREE.Vector3(-58, 0, 4))), ...vt1.lights.map(p => p.clone().add(new THREE.Vector3(-392, 0, 4)))];

  // --- unit 5/6 construction site with cooling towers ---
  const ctMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x77766f, roughness: 0.95, side: THREE.DoubleSide }), { key: 'ctower' });
  const ct1 = coolingTower(62, 42, 150, 0.62, ctMat, rnd); ct1.position.set(980, 0, 1180); root.add(ct1);
  const ct2 = coolingTower(62, 42, 150, 0.3, ctMat, rnd); ct2.position.set(1130, 0, 1020); root.add(ct2);
  const craneMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x5a5040, roughness: 0.8 }), { key: 'crane' });
  const cranes = [towerCrane(110, 60, craneMat, 0.6), towerCrane(70, 45, craneMat, 2.2), towerCrane(85, 50, craneMat, -0.8)];
  cranes[0].group.position.set(905, 0, 1110); cranes[1].group.position.set(1180, 0, 950); cranes[2].group.position.set(760, 0, 860);
  for (const c of cranes) { root.add(c.group); for (const t of c.tip) aviation.push(t.clone().applyMatrix4(c.group.matrix.compose(c.group.position, c.group.quaternion, c.group.scale))); }
  // unit 5 building under construction
  const bs2 = new BoxSet();
  bs2.add(760, 0, 980, 70, 38, 60, { seed: 3, pw: 6, ph: 6, style: 1 });
  bs2.add(680, 0, 950, 140, 22, 40, { seed: 5, pw: 6, ph: 6, style: 0 });
  root.add(bs2.build(indMat));

  // --- switchyard pylons & lines heading north-west ---
  const pyl = [];
  const pylMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x55565a, roughness: 0.7, metalness: 0.3 }), { key: 'pylon' });
  const pylPos = [];
  for (let line = 0; line < 3; line++) {
    for (let k = 0; k < 9; k++) {
      const x = -260 + line * 120 - k * 150, z = -260 - k * 170;
      pylPos.push([x, z]);
      for (const mm of pylon(42, pylMat)) pyl.push(new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.72, 0)), new THREE.Vector3(1, 1, 1)), mm));
    }
  }
  root.add(instancedBeams(pyl, pylMat));
  // wires (catenaries) between pylons
  const wirePts = [];
  for (let line = 0; line < 3; line++) for (let k = 0; k < 8; k++) {
    const a = pylPos[line * 9 + k], b = pylPos[line * 9 + k + 1];
    for (const off of [-12, 0, 12]) {
      const ox = Math.cos(-0.72) * off, oz = -Math.sin(-0.72) * off;
      const N = 12;
      for (let s = 0; s < N; s++) {
        const t0 = s / N, t1 = (s + 1) / N;
        const sag = (t) => 4 * 7 * t * (1 - t);
        wirePts.push(a[0] + ox + (b[0] - a[0]) * t0, 42 - sag(t0), a[1] + oz + (b[1] - a[1]) * t0);
        wirePts.push(a[0] + ox + (b[0] - a[0]) * t1, 42 - sag(t1), a[1] + oz + (b[1] - a[1]) * t1);
      }
    }
  }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wirePts, 3));
  root.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x0a0a0a })));

  // --- pipes on racks between buildings ---
  const pipeMeshes = [];
  const pMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x6d6b66, roughness: 0.6, metalness: 0.3 }), { key: 'pipes' });
  const addPipe = (a, b, r) => { const d = new THREE.Vector3().subVectors(b, a); const L = d.length(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 12), pMat); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(_up, d.normalize()); c.castShadow = true; root.add(c); pipeMeshes.push(c); };
  for (const zz of [-102, -106]) addPipe(new THREE.Vector3(-500, 6, zz), new THREE.Vector3(160, 6, zz), 0.9);
  for (const zz of [-102, -106]) addPipe(new THREE.Vector3(160, 6, zz), new THREE.Vector3(160, 6, 70), 0.9);
  
  addPipe(new THREE.Vector3(40, 3, 50), new THREE.Vector3(160, 3, 50), 1.6);
  // rack supports
  const rack = [];
  for (let x = -480; x <= 160; x += 18) rack.push(beamMatrix(new THREE.Vector3(x, 0, -104), new THREE.Vector3(x, 7.5, -104), 0.5));
  root.add(instancedBeams(rack, pMat));

  // --- floodlight poles (sodium) ---
  const floods = [];
  const fl = (x, z, h = 24) => floods.push({ x, z, h });
  for (let x = -520; x <= 180; x += 70) { fl(x, -125); fl(x, 75); }
  for (let z = -100; z <= 60; z += 60) { fl(170, z); }
  fl(250, 200); fl(150, 260); fl(-50, 150); fl(320, -40);
  const poleGeo = new THREE.CylinderGeometry(0.25, 0.4, 1, 6); poleGeo.translate(0, 0.5, 0);
  const fpMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x5f5e5a, roughness: 0.8 }), { key: 'fpole' });
  const poles = new THREE.InstancedMesh(poleGeo, fpMat, floods.length);
  floods.forEach((f, i) => poles.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(f.x, 0, f.z), new THREE.Quaternion(), new THREE.Vector3(1, f.h, 1))));
  poles.frustumCulled = false; root.add(poles);
  // wall lights on buildings (small lamps)
  const wallLamps = [];
  for (let x = -540; x <= 80; x += 24) { wallLamps.push([x, 9, -95.8]); wallLamps.push([x, 22, -95.8]); }
  for (let z = -90; z <= -48; z += 14) wallLamps.push([90.6, 9, z]);
  for (let z = -28; z <= 36; z += 16) wallLamps.push([36.4, 6, z]);
  for (let x = -30; x <= 30; x += 15) wallLamps.push([x, 6, 40.4]);
  // glow points for all lamps (sodium), aviation lights (red)
  const gp = [], gc = [];
  const na = new THREE.Color(1.0, 0.52, 0.16);
  for (const f of floods) { gp.push(f.x, f.h + 0.5, f.z); gc.push(na.r * 90, na.g * 90, na.b * 90); }
  for (const w of wallLamps) { gp.push(...w); gc.push(na.r * 40, na.g * 40, na.b * 40); }
  const avStart = gp.length / 3;
  for (const a of aviation) { gp.push(a.x, a.y, a.z); gc.push(60, 3, 1.5); }
  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
  glowGeo.setAttribute('color', new THREE.Float32BufferAttribute(gc, 3));
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: (ctx.RH || ctx.H) / 2 }, uSize: { value: opts.glowSize ?? 1.2 }, uGain: { value: 1.0 }, uAvBlink: { value: 1.0 }, uAvStart: { value: avStart }, uFogDensity: ATM.uFogDensity },
    vertexShader: `attribute vec3 color; varying vec3 vC; varying float vR; uniform float uSize, uScale, uAvBlink, uAvStart, uFogDensity;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        float ps = uSize * 2.2 * uScale * projectionMatrix[1][1] / -mv.z; gl_PointSize = clamp(ps, 2.5, 48.0); vR = clamp(ps / 2.5, 0.03, 1.0);
        vC = color * (float(gl_VertexID) >= uAvStart ? uAvBlink : 1.0) * exp(-uFogDensity * 0.9 * -mv.z); }`,
    fragmentShader: `varying vec3 vC; varying float vR; uniform float uGain;
      void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p) * 2.0; if (r > 1.0) discard;
        float core = smoothstep(0.5, 0.0, r); float a = core + exp(-r * r * 8.0) * 0.25;
        gl_FragColor = vec4(vC * a * vR * vR * 0.06 * uGain, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glows = new THREE.Points(glowGeo, glowMat); glows.frustumCulled = false; root.add(glows);
  // lamp light map for the plant grounds
  const B = { x0: PLANT.x - 800, z0: PLANT.z - 700, size: 1600 };
  const lc = document.createElement('canvas'); lc.width = lc.height = 1024;
  const lg = lc.getContext('2d'); lg.fillStyle = 'black'; lg.fillRect(0, 0, 1024, 1024); lg.globalCompositeOperation = 'lighter';
  const kk = 1024 / B.size;
  const blob = (x, z, r, a) => { const X = (x + PLANT.x - B.x0) * kk, Z = (z + PLANT.z - B.z0) * kk; const g = lg.createRadialGradient(X, Z, 0, X, Z, r * kk); g.addColorStop(0, `rgba(255,140,50,${a})`); g.addColorStop(0.4, `rgba(255,140,50,${a * 0.45})`); g.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = g; lg.beginPath(); lg.arc(X, Z, r * kk, 0, 7); lg.fill(); };
  for (const f of floods) blob(f.x, f.z, 40, 0.6);
  for (const w of wallLamps) blob(w[0] + (w[0] > 80 ? 4 : 0), w[2] - (w[2] < -90 ? 5 : 0), 12, 0.45);
  const lampTex = new THREE.CanvasTexture(lc); lampTex.colorSpace = THREE.NoColorSpace;

  // ground for the plant area: concrete/asphalt yards, fields
  const wet = { value: new THREE.Vector4(0, 0, 0, 0) }; // x,z centre (world), radius, amount
  const groundMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), {
    key: 'plantground',
    uniforms: { tNoise: { value: noiseTex }, uWet: wet },
    fragmentHeader: `precision highp sampler3D; uniform sampler3D tNoise; uniform vec4 uWet; float gWet;`,
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      {
        vec3 lp = vWPos - vec3(${PLANT.x.toFixed(1)}, 0.0, ${PLANT.z.toFixed(1)});
        float n = texture(tNoise, vec3(vWPos.xz * 0.01, 0.3)).r;
        float n2 = texture(tNoise, vec3(vWPos.xz * 0.07, 0.6)).g;
        float yard = step(-600.0, lp.x) * step(lp.x, 260.0) * step(-150.0, lp.z) * step(lp.z, 140.0);
        float road = max(step(abs(lp.z + 118.0), 6.0), step(abs(lp.x - 150.0), 6.0)) * step(-600.0, lp.x) * step(lp.x, 400.0);
        vec3 field = vec3(0.07, 0.075, 0.055) * (0.6 + 0.8 * n);
        vec3 conc = vec3(0.24, 0.235, 0.22) * (0.75 + 0.4 * n2);
        vec3 c = mix(field, conc, yard);
        c = mix(c, vec3(0.06), road);
        float wn = texture(tNoise, vec3(vWPos.xz * 0.035, 0.11)).r;
        gWet = uWet.w * smoothstep(0.55, 0.75, wn + 0.25 * (1.0 - smoothstep(0.0, uWet.z, length(vWPos.xz - uWet.xy)))) * (1.0 - smoothstep(uWet.z * 0.6, uWet.z, length(vWPos.xz - uWet.xy)));
        c *= mix(1.0, 0.45, gWet);
        diffuseColor.rgb = c;
      }`], ['#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.22 + 0.25 * texture(tNoise, vec3(vWPos.xz * 0.12, 0.77)).g, gWet);`]],
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.position.y = 0.02; ground.receiveShadow = true;
  ground.position.sub(PLANT).setY(0.02);

  // cooling pond / channel (south-east)
  const waterMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x020304, roughness: 0.08, metalness: 0.0 }), {
    key: 'water',
    fragmentReplace: [['#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      { vec3 V = normalize(vWPos - cameraPosition); vec3 R = reflect(V, vec3(0.0, 1.0, 0.0));
        float fres = 0.02 + 0.98 * pow(1.0 - max(-V.y, 0.0), 5.0);
        totalEmissiveRadiance += fogColorDir(R) * fres * 1.6; }`]],
  });
  const pond = new THREE.Mesh(new THREE.PlaneGeometry(2600, 1400), waterMat);
  pond.rotation.x = -Math.PI / 2; pond.position.set(900, 0.06, 1900);
  root.add(pond);
  const channel = new THREE.Mesh(new THREE.PlaneGeometry(1400, 90), waterMat);
  channel.rotation.x = -Math.PI / 2; channel.position.set(400, 0.06, 420);
  root.add(channel);

  return {
    root, ground, wet, lampTex, lampBounds: B, panels, panelMesh, ruins, CH, aviation, glowMat, floods, wallLamps,
    // world-space helpers
    W: (x, y, z) => new THREE.Vector3(x, y, z).add(PLANT),
    // unit 4 state: tExp = time of the main explosion (null: intact). destroyed: final state.
    setState(t, { tExp = null, destroyed = false, tPre = null } = {}) {
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
      const g = -9.81, k = 0.25;
      panels.forEach((pn, i) => {
        let tau = -1;
        if (destroyed) tau = 1e3; else if (tExp !== null) tau = t - tExp - pn.delay;
        if (!pn.gone || tau <= 0) {
          q.identity(); p.copy(pn.p); s.copy(pn.s);
          if (!pn.gone && pn.broken < 1 && tau > 0) {
            s.y = pn.s.y * pn.broken; p.y = pn.p.y - pn.s.y * 0.5 + s.y * 0.5; q.copy(pn.tilt);
          }
          if (tPre !== null && pn.wall === 'R' && t > tPre) {
            const k2 = clamp((t - tPre - pn.delay * 0.5) / 0.55, 0, 1);
            const bump = Math.sin(Math.PI * k2) * (1.0 + 1.5 * pn.wspd / 6.5);
            p.y += bump; q.setFromAxisAngle(pn.w, bump * 0.03);
          }
        } else {
          const ek = (1 - Math.exp(-k * tau)) / k;
          p.set(pn.p.x + pn.v.x * ek, pn.p.y + pn.v.y * ek + g * (tau / k - ek / k), pn.p.z + pn.v.z * ek);
          if (p.y < pn.landY || tau > 60) {
            // landed: lie flat-ish where it fell; far-flung ones disappear below ground
            if (pn.landY < 1 || tau > 60) { p.y = -50; }
            else p.y = pn.landY + 0.4;
            q.setFromAxisAngle(pn.w, pn.wspd * Math.min(tau, 3));
          } else q.setFromAxisAngle(pn.w, pn.wspd * tau);
          s.copy(pn.s).multiplyScalar(0.42);
        }
        m.compose(p, q, s); panelMesh.setMatrixAt(i, m);
      });
      panelMesh.instanceMatrix.needsUpdate = true;
      ruins.visible = destroyed || (tExp !== null && t > tExp + 0.05);
    },
  };
}
