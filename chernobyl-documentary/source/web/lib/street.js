// Street-level set dressing for daylight shots: balconies that match the procedural facades,
// leafing spring trees, detailed road / curb / sidewalk / lawn ground, Soviet cars
// (VAZ-2101 "Zhiguli"), the LAZ-695 bus and civilians in 1980s clothes.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { patchMaterial, ATM } from './atmos.js';
import { mulberry32 } from './util.js';
import { segGeo } from './people.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const f32 = Math.fround;

// --- JS port of the facade shader's integer hash, so geometry agrees with painted cells ---
export function hh(x, y, z) {
  const q = [x, y, z].map(v => (Math.floor(f32(v) + 0.5) + 4096) | 0);
  let h = (Math.imul(q[0], 1597334677) ^ Math.imul(q[1], 3812015801 | 0) ^ Math.imul(q[2], 2741869493 | 0)) >>> 0;
  h = Math.imul((h ^ (h >>> 16)) >>> 0, 2246822519 | 0) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 3266489917 | 0) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}
const fract = (x) => x - Math.floor(x);

function boxAt(w, h, d, x, y, z, color) {
  const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z);
  const n = g.attributes.position.count, c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.set([color.r, color.g, color.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}
function colorize(g, color) {
  const n = g.attributes.position.count, c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.set([color.r, color.g, color.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  if (g.index) g = g.toNonIndexed();
  return g;
}

// ---------------- balconies ----------------
// For each building, on the long face that has no stairwells, every balcony column painted by the
// facade shader gets a slab, a front rail panel and side panels; some are glazed by the owners,
// some carry washing lines. Returns { group, laundry: [{mesh, phase}] }.
export function buildBalconies(buildings, { seed = 5, laundryFrac = 0.12, glazedFrac = 0.28, washing = true } = {}) {
  const rnd = mulberry32(seed);
  const solid = [], glass = [], frames = [], cloth = [], spots = [];
  const concrete = new THREE.Color(0.3, 0.3, 0.29);
  for (const b of buildings) {
    const seedF = Math.floor(f32(f32(b.seed) * 7) + 0.5);
    const style = Math.floor(b.style + 0.5);
    const cellW = style > 2.5 ? 3.6 : 3.0;
    const stairSide = fract(f32(f32(b.seed) * f32(5.3))) > 0.5 ? 2 : 3;
    const face = stairSide === 2 ? 3 : 2;        // balconies on the other long face
    const Wd = b.w;
    const nC = Math.max(Math.floor(Wd / cellW), 1);
    const marg = (Wd - nC * cellW) * 0.5;
    const panelTint = [new THREE.Color(0.34, 0.34, 0.33), new THREE.Color(0.3, 0.32, 0.33), new THREE.Color(0.36, 0.35, 0.31)][Math.floor(rnd() * 3)];
    const parts = [];
    const partsG = [], partsF = [];
    for (let ci = 0; ci < nC; ci++) {
      if (!(hh(ci, 3, seedF) < 0.38)) continue;
      const u = marg + (ci + 0.5) * cellW;
      const lx = face === 2 ? u - Wd / 2 : Wd / 2 - u;
      for (let fl = 1; fl < b.floors; fl++) {
        const y0 = fl * 2.8;
        const bw = cellW - 0.32, dep = 1.05;
        const k = hh(ci, fl, seedF * 11 + 5);
        const tint = panelTint.clone().multiplyScalar(0.85 + 0.25 * hh(ci, fl, seedF * 3 + 1));
        parts.push(boxAt(bw + 0.06, 0.14, dep, lx, y0 - 0.07, dep / 2, concrete));
        parts.push(boxAt(bw, 1.0, 0.05, lx, y0 + 0.5, dep - 0.03, tint));
        parts.push(boxAt(0.05, 1.0, dep, lx - bw / 2, y0 + 0.5, dep / 2, tint));
        parts.push(boxAt(0.05, 1.0, dep, lx + bw / 2, y0 + 0.5, dep / 2, tint));
        parts.push(boxAt(bw + 0.08, 0.05, 0.1, lx, y0 + 1.02, dep - 0.03, new THREE.Color(0.14, 0.13, 0.12)));
        if (k < glazedFrac) {
          // owner-built glazing: timber frames, painted white or brown
          const fc = rnd() < 0.6 ? new THREE.Color(0.42, 0.41, 0.38) : new THREE.Color(0.12, 0.07, 0.04);
          const top = y0 + 2.62;
          partsG.push(boxAt(bw - 0.04, top - (y0 + 1.05), 0.012, lx, (top + y0 + 1.05) / 2, dep - 0.04, new THREE.Color(1, 1, 1)));
          for (let m = 0; m <= 4; m++) partsF.push(boxAt(0.055, top - (y0 + 1.05), 0.06, lx - bw / 2 + m * bw / 4, (top + y0 + 1.05) / 2, dep - 0.03, fc));
          partsF.push(boxAt(bw, 0.06, 0.07, lx, top, dep - 0.03, fc));
          partsF.push(boxAt(bw, 0.05, 0.07, lx, y0 + 1.9, dep - 0.03, fc));
          parts.push(boxAt(bw + 0.1, 0.06, dep + 0.05, lx, top + 0.03, dep / 2, new THREE.Color(0.2, 0.2, 0.2)));
        } else if (k > 0.5 && k < 0.8) {
          spots.push({ b, local: new THREE.Vector3(lx, y0, 0.55) });
        } else if (washing && k > 1 - laundryFrac) {
          // a washing line across the open balcony with a few items
          const n = 2 + Math.floor(rnd() * 3);
          for (let j = 0; j < n; j++) {
            const w = 0.35 + rnd() * 0.5, h = 0.4 + rnd() * 0.5;
            const x = lx - bw / 2 + 0.3 + (j + 0.5) * (bw - 0.6) / n;
            const pal = [[0.55, 0.55, 0.52], [0.5, 0.5, 0.5], [0.12, 0.2, 0.38], [0.38, 0.1, 0.08], [0.45, 0.38, 0.22], [0.2, 0.3, 0.18]];
            const c = pal[Math.floor(rnd() * pal.length)];
            cloth.push({ b, x, y: y0 + 1.85, z: dep - 0.25 - rnd() * 0.3, w, h, c: new THREE.Color(...c), phase: rnd() * 6.28 });
          }
        }
      }
    }
    const xf = new THREE.Matrix4().compose(V3(b.x, 0, b.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, b.rot, 0)), V3(1, 1, 1));
    const flip = new THREE.Matrix4().makeScale(1, 1, face === 2 ? 1 : -1);
    const off = new THREE.Matrix4().makeTranslation(0, 0, face === 2 ? b.d / 2 : -b.d / 2);
    const M = xf.clone().multiply(off).multiply(flip);
    for (const [list, out] of [[parts, solid], [partsG, glass], [partsF, frames]]) for (const g of list) {
      g.applyMatrix4(M);
      if (face !== 2) { const idx = g.index; if (idx) { const a = idx.array; for (let i = 0; i < a.length; i += 3) { const t = a[i]; a[i] = a[i + 2]; a[i + 2] = t; } } }
      out.push(g);
    }
    for (const c of cloth) if (c.b === b && !c.M) c.M = M;
    for (const sp of spots) if (sp.b === b && !sp.pos) { sp.pos = sp.local.clone().applyMatrix4(M); sp.out = new THREE.Vector3(0, 0, 1).transformDirection(M); }
  }
  const group = new THREE.Group();
  const add = (list, mat) => { if (!list.length) return; const m = new THREE.Mesh(mergeGeometries(list.map(g => g.index ? g.toNonIndexed() : g)), mat); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; group.add(m); };
  add(solid, patchMaterial(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }), { key: 'balc' }));
  add(frames, patchMaterial(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }), { key: 'balcf' }));
  add(glass, patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.022, 0.025), roughness: 0.05, metalness: 0.0, envMapIntensity: 1.6 }), { key: 'balcg' }));
  // laundry: each item a small cloth quad hanging from the line, swayed by a vertex shader
  const laundry = [];
  if (cloth.length) {
    const geos = [];
    for (const c of cloth) {
      const g = new THREE.PlaneGeometry(c.w, c.h, 4, 4); g.translate(0, -c.h / 2, 0);
      const n = g.attributes.position.count; const ph = new Float32Array(n).fill(c.phase); const top = new Float32Array(n);
      for (let i = 0; i < n; i++) top[i] = -g.attributes.position.getY(i) / c.h;
      g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1)); g.setAttribute('aHang', new THREE.BufferAttribute(top, 1));
      g.translate(c.x, c.y, c.z);
      g.applyMatrix4(c.M);
      geos.push(colorize(g, c.c));
    }
    const mat = patchMaterial(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide }), {
      key: 'laundry', uniforms: { uWindT: ATM.uTime },
      vertexHeader: 'attribute float aPhase; attribute float aHang; uniform float uWindT;',
      vertexMain: '',
    });
    mat.onBeforeCompile = ((prev) => (sh, r) => { prev(sh, r); sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      { float w = sin(uWindT * 2.1 + aPhase) * 0.6 + sin(uWindT * 3.7 + aPhase * 2.3) * 0.4; transformed.x += w * 0.05 * aHang; transformed.z += (w * 0.09 + 0.04) * aHang * aHang; }`); })(mat.onBeforeCompile);
    const m = new THREE.Mesh(mergeGeometries(geos), mat); m.castShadow = true; m.frustumCulled = false; group.add(m);
    laundry.push(m);
  }
  return { group, laundry, spots };
}

// ---------------- spring trees ----------------
function leafCanvas(seed, palette) {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); const rnd = mulberry32(seed);
  g.clearRect(0, 0, S, S);
  // a twig with young leaves: thin stems, ovate leaves with soft gradients
  g.strokeStyle = 'rgba(60,52,40,1)'; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(S * 0.5, S * 0.98); g.quadraticCurveTo(S * 0.45, S * 0.5, S * 0.52, S * 0.1); g.stroke();
  const n = 30 + Math.floor(rnd() * 10);
  for (let i = 0; i < n; i++) {
    const t = rnd();
    const bx = S * (0.5 + (rnd() - 0.5) * 0.12), by = S * (0.95 - t * 0.85);
    const ang = (rnd() - 0.5) * 2.6 - Math.PI / 2;
    const L = S * (0.07 + rnd() * 0.08) * (1 - t * 0.35), Wl = L * (0.45 + rnd() * 0.2);
    const ex = bx + Math.cos(ang) * L * 0.9, ey = by + Math.sin(ang) * L * 0.9;
    g.strokeStyle = 'rgba(70,72,40,1)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx, by); g.lineTo(ex, ey); g.stroke();
    g.save(); g.translate(ex, ey); g.rotate(ang);
    const p = palette[Math.floor(rnd() * palette.length)];
    const j = 0.85 + rnd() * 0.3;
    const grd = g.createLinearGradient(0, -Wl, 0, Wl);
    grd.addColorStop(0, `rgb(${p[0] * j * 0.8 | 0},${p[1] * j * 0.8 | 0},${p[2] * j * 0.8 | 0})`);
    grd.addColorStop(0.5, `rgb(${p[0] * j | 0},${p[1] * j | 0},${p[2] * j | 0})`);
    grd.addColorStop(1, `rgb(${p[0] * j * 0.7 | 0},${p[1] * j * 0.7 | 0},${p[2] * j * 0.7 | 0})`);
    g.fillStyle = grd;
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(L * 0.3, -Wl, L * 0.8, -Wl * 0.6, L, 0); g.bezierCurveTo(L * 0.8, Wl * 0.6, L * 0.3, Wl, 0, 0); g.fill();
    g.strokeStyle = `rgba(${p[0] * 1.15 | 0},${p[1] * 1.12 | 0},${p[2] | 0},0.6)`; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(L * 0.9, 0); g.stroke();
    g.restore();
  }
  return c;
}

const SPECIES = {
  // fresh lime-green young leaves (poplar / linden / birch in late April)
  poplar: { palette: [[120, 150, 50], [105, 140, 45], [140, 160, 60], [95, 125, 40]], bark: new THREE.Color(0.2, 0.19, 0.16), shape: 'columnar' },
  birch: { palette: [[130, 160, 55], [115, 150, 50], [150, 170, 70]], bark: new THREE.Color(0.55, 0.54, 0.5), shape: 'weeping' },
  linden: { palette: [[105, 135, 45], [90, 120, 40], [125, 150, 55]], bark: new THREE.Color(0.14, 0.12, 0.1), shape: 'round' },
  // apple and cherry in blossom in the village gardens (early May)
  apple: { palette: [[238, 234, 228], [242, 222, 226], [232, 238, 222], [246, 238, 236], [130, 160, 70]], bark: new THREE.Color(0.12, 0.1, 0.08), shape: 'round' },
};

// Build one tree: tapered branch cylinders (wood) + leaf cards with crown-spherical normals.
export function makeTreeGeo(seed, { height = 11, species = 'linden', leafiness = 0.75 } = {}) {
  const rnd = mulberry32(seed);
  const sp = SPECIES[species];
  const wood = [], leaves = [];
  const up = V3(0, 1, 0);
  const crownC = V3(0, height * 0.62, 0);
  const crownR = V3(height * (sp.shape === 'columnar' ? 0.2 : 0.36), height * 0.36, height * (sp.shape === 'columnar' ? 0.2 : 0.36));
  const seg = (a, b, r0, r1) => {
    const d = b.clone().sub(a), L = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, L, r0 > 0.06 ? 7 : 4, 1, true); g.translate(0, L / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, d.normalize())); g.translate(a.x, a.y, a.z);
    wood.push(g);
  };
  const leafCard = (p, s) => {
    const g = new THREE.PlaneGeometry(s, s * 1.15);
    g.rotateZ((rnd() - 0.5) * 1.2);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - 0.5) * 2.6, rnd() * 6.28, (rnd() - 0.5) * 1.2));
    g.applyQuaternion(q); g.translate(p.x, p.y, p.z);
    // crown normals: soft volumetric shading instead of flat card shading
    const n = g.attributes.normal, pos = g.attributes.position;
    for (let i = 0; i < n.count; i++) {
      const v = V3(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(crownC).divide(crownR).normalize();
      n.setXYZ(i, v.x, v.y * 0.8 + 0.2, v.z);
    }
    leaves.push(g);
  };
  const grow = (a, dir, len, r, depth) => {
    const n = 3;
    let p = a.clone(), d = dir.clone();
    for (let i = 0; i < n; i++) {
      d.add(V3((rnd() - 0.5) * 0.35, (rnd() - 0.3) * 0.2, (rnd() - 0.5) * 0.35)).normalize();
      if (sp.shape === 'columnar') d.lerp(up, 0.25).normalize();
      if (sp.shape === 'weeping' && depth >= 2) d.y -= 0.18, d.normalize();
      const q = p.clone().addScaledVector(d, len / n);
      const r1 = r * (1 - (i + 1) / n * 0.45);
      seg(p, q, r * (1 - i / n * 0.45), r1);
      if (depth >= 2 && rnd() < leafiness) {
        const m = depth === 3 ? 3 : 2;
        for (let k = 0; k < m; k++) leafCard(p.clone().lerp(q, rnd()).add(V3((rnd() - 0.5) * 0.5, (rnd() - 0.4) * 0.4, (rnd() - 0.5) * 0.5)), 0.55 + rnd() * 0.45);
      }
      p = q;
    }
    if (depth >= 3) {
      if (rnd() < leafiness) for (let k = 0; k < 3; k++) leafCard(p.clone().add(V3((rnd() - 0.5) * 0.7, (rnd() - 0.3) * 0.5, (rnd() - 0.5) * 0.7)), 0.6 + rnd() * 0.5);
      return;
    }
    const kids = depth === 0 ? 5 + Math.floor(rnd() * 2) : 3 + Math.floor(rnd() * 2);
    for (let k = 0; k < kids; k++) {
      const t = depth === 0 ? 1 : 0.45 + rnd() * 0.55;
      const az = rnd() * 6.28;
      const tilt = depth === 0 ? 0.28 + rnd() * 0.3 : 0.45 + rnd() * 0.4;
      const nd = dir.clone().lerp(V3(Math.cos(az), 0, Math.sin(az)), tilt).normalize();
      if (sp.shape === 'columnar') nd.lerp(up, 0.5).normalize();
      grow(a.clone().lerp(p, depth === 0 ? 0.55 + 0.45 * (k / kids) : t), nd, len * (depth === 0 ? 0.75 : 0.58) * (0.8 + rnd() * 0.4), r * 0.5, depth + 1);
    }
  };
  const trunkH = height * (sp.shape === 'columnar' ? 0.5 : 0.42);
  const lean = V3((rnd() - 0.5) * 0.12, 1, (rnd() - 0.5) * 0.12).normalize();
  grow(V3(0, 0, 0), lean, trunkH, height * (sp.shape === 'weeping' ? 0.011 : 0.015), 0);
  const w = mergeGeometries(wood.map(g => g.index ? g.toNonIndexed() : g));
  const l = leaves.length ? mergeGeometries(leaves.map(g => g.index ? g.toNonIndexed() : g)) : null;
  return { wood: w, leaves: l };
}

export const LEAF_AMB = { sky: { value: new THREE.Color(0.3, 0.33, 0.36) }, ground: { value: new THREE.Color(0.05, 0.055, 0.045) } };
const SWAY_GLSL = `#include <begin_vertex>
    { vec2 io = vec2(0.0);
      #ifdef USE_INSTANCING
        io = instanceMatrix[3].xz;
      #endif
      float ph = dot(position, vec3(0.9, 0.5, 0.7)) + io.x * 0.37 + io.y * 0.21;
      float a = smoothstep(2.0, 7.0, position.y);
      transformed += vec3(sin(uSwayT * 1.9 + ph), sin(uSwayT * 2.6 + ph * 1.3) * 0.6, cos(uSwayT * 1.7 + ph * 0.8)) * 0.035 * a; }`;
function leafMaterial(seed, species) {
  const tex = new THREE.CanvasTexture(leafCanvas(seed, SPECIES[species].palette));
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  // Lambert + analytic sky ambient: foliage is mostly overdraw, so its shader must stay cheap
  const mat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
  patchMaterial(mat, {
    key: 'leaf',
    uniforms: { uSwayT: ATM.uTime, uSkyAmb: LEAF_AMB.sky, uGndAmb: LEAF_AMB.ground },
    vertexHeader: 'uniform float uSwayT;',
    fragmentHeader: 'uniform vec3 uSkyAmb, uGndAmb;',
    fragmentReplace: [['#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n      normal = normalize(vNormal);']],
    // translucency: young leaves glow when backlit by the sun
    lightsEnd: `
      #if NUM_DIR_LIGHTS > 0
      { float bl = pow(clamp(-dot(geometryViewDir, directLight.direction), 0.0, 1.0), 3.0);
        reflectedLight.directDiffuse += directLight.color * diffuseColor.rgb * (0.12 + 1.1 * bl) * 0.55; }
      #endif
      reflectedLight.indirectDiffuse += diffuseColor.rgb * mix(uGndAmb, uSkyAmb, clamp(normalize(vWNrm).y * 0.5 + 0.5, 0.0, 1.0));`,
  });
  mat.onBeforeCompile = ((prev) => (sh, r) => { prev(sh, r); sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', SWAY_GLSL); })(mat.onBeforeCompile);
  return mat;
}

// Plant instanced trees of a few variants at [x, z, height, species?] positions.
export function buildTrees3D(list, { variants = 4, leafiness = 0.75, seed = 1 } = {}) {
  const group = new THREE.Group();
  const bySp = {};
  for (const t of list) (bySp[t[3] || 'linden'] ||= []).push(t);
  for (const [sp, arr] of Object.entries(bySp)) {
    const vs = [];
    for (let v = 0; v < variants; v++) vs.push(makeTreeGeo(seed * 31 + v * 7 + sp.length, { height: 10, species: sp, leafiness }));
    const barkMat = patchMaterial(new THREE.MeshStandardMaterial({ color: SPECIES[sp].bark, roughness: 0.95 }), { key: 'bark' });
    const lm = leafMaterial(seed + sp.length * 3, sp);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion();
    for (let v = 0; v < variants; v++) {
      const sel = arr.filter((_, i) => i % variants === v);
      if (!sel.length) continue;
      const iw = new THREE.InstancedMesh(vs[v].wood, barkMat, sel.length);
      const il = new THREE.InstancedMesh(vs[v].leaves || new THREE.BufferGeometry(), lm, sel.length); if (!vs[v].leaves) il.visible = false;
      sel.forEach(([x, z, h], i) => {
        q.setFromEuler(new THREE.Euler(0, (x * 12.9898 + z * 78.233) % 6.28, 0));
        m.compose(V3(x, 0, z), q, V3(h / 10, h / 10, h / 10));
        iw.setMatrixAt(i, m); il.setMatrixAt(i, m);
        // per-tree variation: vigour, hue (some still bare-ish and yellow, some deep green)
        const hv = Math.abs(Math.sin(x * 3.17 + z * 1.91)), hv2 = Math.abs(Math.sin(x * 0.71 - z * 2.33));
        il.setColorAt(i, new THREE.Color(0.85 + 0.3 * hv - 0.1 * hv2, 0.82 + 0.22 * hv2, 0.6 + 0.35 * hv * hv2));
      });
      il.name = 'leaves';
      for (const im of [iw, il]) { im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; group.add(im); }
    }
  }
  return group;
}

// ---------------- street ground ----------------
// A strip of road with curbs, tree verges, sidewalks and lawns, in a local frame:
// origin o, along-street unit d, right r. Lateral profile (metres from the centreline):
// road |l| < rw, verge to rw+vw, sidewalk to rw+vw+sw, then lawn.
export function streetGround(ctx, { o, d, length = [-60, 500], width = 90, rw = 7.5, vw = 4.0, sw = 3.5, seed = 3, snow = 0 }) {
  const r = V3(-d.z, 0, d.x);
  const L0 = length[0], L1 = length[1];
  const geo = new THREE.PlaneGeometry(L1 - L0, width * 2, 1, 1); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.9, specularIntensity: 0.25, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  patchMaterial(mat, {
    key: 'street',
    uniforms: { tNoise: { value: ctx.noiseTex }, uO: { value: o.clone() }, uD: { value: d.clone() }, uR: { value: r }, uProf: { value: new THREE.Vector3(rw, rw + vw, rw + vw + sw) }, uSnow: { value: snow } },
    fragmentHeader: `precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uO, uD, uR, uProf; uniform float uSnow; float gRoughS;
      float n2(vec2 p, float z){ return texture(tNoise, vec3(p, z)).r; }
      float hs(vec2 p){ return fract(sin(dot(floor(p), vec2(127.1, 311.7))) * 43758.5453); }`,
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      {
        vec3 q = vWPos - uO; float s = dot(q, uD), l = dot(q, uR); float al = abs(l);
        vec2 p = vec2(s, l);
        float big = n2(p * 0.013, 0.11), mid = n2(p * 0.09, 0.37), fine = n2(p * 0.9, 0.71), grit = n2(p * 7.0, 0.53);
        vec3 col; gRoughS = 0.9;
        if (al < uProf.x) {
          // asphalt: aggregate, patch repairs, tyre-polished lanes, faded centre dashes
          col = vec3(0.075, 0.075, 0.078) * (0.8 + 0.35 * big) * (0.88 + 0.24 * grit);
          float lane = abs(al - uProf.x * 0.5);
          col *= mix(0.86, 1.0, smoothstep(0.4, 1.3, lane));
          vec2 pc = floor(vec2(s / 7.0, l / 3.0)); float ph = hs(pc + 3.1);
          if (ph > 0.86) col *= 0.78;
          float crack = smoothstep(0.012, 0.0, abs(n2(p * 0.22, 0.83) - 0.5)) * smoothstep(0.45, 0.7, mid);
          col *= 1.0 - crack * 0.5;
          float dash = step(fract(s / 9.0), 0.4) * (1.0 - smoothstep(0.06, 0.09, al));
          col = mix(col, vec3(0.5, 0.5, 0.48) * (0.6 + 0.5 * fine), dash * 0.55 * smoothstep(0.3, 0.6, n2(p * 0.4, 0.2) + 0.25));
          float wet = smoothstep(0.62, 0.7, big) * 0.0;
          gRoughS = 0.82 - 0.1 * smoothstep(0.4, 1.3, -lane + 1.3);
        } else if (al < uProf.x + 0.32) {
          col = vec3(0.3, 0.3, 0.29) * (0.85 + 0.2 * fine) * (step(0.04, fract(s / 1.0)) * 0.15 + 0.85); // granite curb
        } else if (al < uProf.y) {
          // verge: young grass and bare soil, dandelions
          float g = smoothstep(0.35, 0.65, mid + (big - 0.5) * 0.5);
          col = mix(vec3(0.075, 0.062, 0.045), mix(vec3(0.055, 0.09, 0.028), vec3(0.1, 0.095, 0.05), smoothstep(0.5, 0.8, n2(p * 0.05, 0.19))), g) * (0.75 + 0.5 * fine);
          col = mix(col, vec3(0.55, 0.42, 0.05), step(0.82, n2(p * 3.1, 0.91)) * g * 0.7);
        } else if (al < uProf.z) {
          // sidewalk: older, lighter asphalt with joints
          col = vec3(0.13, 0.128, 0.125) * (0.82 + 0.3 * big) * (0.9 + 0.2 * grit);
          col *= 1.0 - smoothstep(0.03, 0.0, abs(fract(s / 6.0) - 0.5) - 0.47) * 0.3;
        } else {
          // lawn with trodden paths, dry patches from last year, young growth
          float g = smoothstep(0.3, 0.6, mid + (big - 0.5) * 0.6);
          float dry = smoothstep(0.45, 0.75, n2(p * 0.03, 0.29));
          vec3 grass = mix(vec3(0.05, 0.085, 0.026), vec3(0.11, 0.1, 0.05), dry * 0.7);
          col = mix(vec3(0.075, 0.064, 0.048), grass, g) * (0.7 + 0.55 * fine) * (0.8 + 0.4 * n2(p * 0.17, 0.44));
          col = mix(col, vec3(0.6, 0.48, 0.06), step(0.86, n2(p * 2.7, 0.15)) * g * 0.8);
          col = mix(col, vec3(0.7, 0.7, 0.68), step(0.93, n2(p * 4.1, 0.65)) * g * 0.4);
        }
        if (uSnow > 0.0) {
          // snow cover: drifts on lawns and verges, thinner and trodden on paths, tyre-free road
          float onRoad = 1.0 - step(uProf.x, al);
          float cov = mix(0.95, 0.55 + 0.4 * smoothstep(0.3, 0.7, mid), onRoad) * uSnow;
          vec3 sc = vec3(0.62, 0.63, 0.66) * (0.88 + 0.16 * fine) * (0.92 + 0.1 * big);
          col = mix(col, sc, cov); gRoughS = mix(gRoughS, 0.7, cov);
        }
        diffuseColor.rgb = col;
      }`],
    ['#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      roughnessFactor = gRoughS;`]],
  });
  const mesh = new THREE.Mesh(geo, mat);
  const c = o.clone().addScaledVector(d, (L0 + L1) / 2);
  mesh.position.set(c.x, 0.03, c.z);
  mesh.rotation.y = Math.atan2(-d.z, d.x);
  mesh.receiveShadow = true;
  // curbs (raised granite) along both road edges
  const group = new THREE.Group(); group.add(mesh);
  const curbMat = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.3, 0.3, 0.29), roughness: 0.85 }), { key: 'curb' });
  for (const side of [-1, 1]) {
    const cg = new THREE.BoxGeometry(L1 - L0, 0.16, 0.2);
    const cm = new THREE.Mesh(cg, curbMat);
    const cc = c.clone().addScaledVector(r, side * (rw + 0.1));
    cm.position.set(cc.x, 0.08, cc.z); cm.rotation.y = mesh.rotation.y; cm.castShadow = true; cm.receiveShadow = true;
    group.add(cm);
  }
  return { group, r };
}

// soft contact shadow decal (ambient occlusion under cars and people)
let AO_TEX = null;
export function contactShadow(w, l, strength = 0.75) {
  if (!AO_TEX) {
    const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
    const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(0.55, 'rgba(0,0,0,0.6)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    AO_TEX = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), new THREE.MeshBasicMaterial({ map: AO_TEX, transparent: true, opacity: strength, depthWrite: false, color: 0x000000 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.045; m.renderOrder = 1;
  return m;
}

// ---------------- VAZ-2101 "Zhiguli" ----------------
export function makeCar({ color = new THREE.Color(0.5, 0.5, 0.48), seed = 1 } = {}) {
  const g = new THREE.Group();
  const paint = patchMaterial(new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.25 }), { key: 'carpaint' });
  const glass = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.012, 0.014, 0.016), roughness: 0.04, metalness: 0.0, envMapIntensity: 1.5 }), { key: 'carglass' });
  const chrome = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.7, 0.7, 0.7), roughness: 0.18, metalness: 1.0 }), { key: 'carchrome' });
  const rubber = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.85 }), { key: 'carrubber' });
  const dark = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.015, 0.015, 0.015), roughness: 0.6 }), { key: 'cardark' });
  const red = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.3, 0.01, 0.01), roughness: 0.3, emissive: new THREE.Color(0, 0, 0) }), { key: 'cartail' });
  const lens = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.75, 0.75, 0.72), roughness: 0.05, metalness: 0.6 }), { key: 'carlens' });
  const ext = (pts, width, bevel, mat, y0 = 0) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const eg = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 });
    eg.translate(0, 0, -(width - 2 * bevel) / 2);
    const m = new THREE.Mesh(eg, mat); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  // car local frame: +x forward, y up, z right; length 4.07, width 1.61
  const body = [[-2.0, 0.3], [-2.03, 0.55], [-2.0, 0.82], [-1.9, 0.86], [-1.25, 0.9], [0.98, 0.9], [1.9, 0.84], [2.02, 0.78], [2.04, 0.5], [2.0, 0.3], [1.6, 0.3]];
  // front wheel arch (centre x=1.21), then floor, rear arch (centre -1.21)
  for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; body.push([1.21 + Math.cos(a) * 0.37, 0.28 + Math.sin(a) * 0.36]); }
  body.push([0.84, 0.24], [-0.84, 0.24]);
  for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; body.push([-1.21 + Math.cos(a) * 0.37, 0.28 + Math.sin(a) * 0.36]); }
  body.push([-1.58, 0.3]);
  ext(body, 1.61, 0.05, paint);
  // greenhouse: glass volume, roof panel and pillars in body colour
  ext([[-1.22, 0.9], [-0.78, 1.37], [0.33, 1.4], [0.96, 0.9]], 1.36, 0.04, glass);
  ext([[-0.8, 1.35], [-0.76, 1.405], [0.32, 1.43], [0.36, 1.37]], 1.39, 0.03, paint);
  const pillar = (a, b, w, zOff) => {
    const d = V3(b[0] - a[0], b[1] - a[1], 0); const L = d.length();
    for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(L, w, 0.05), paint); m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, s * zOff); m.rotation.z = Math.atan2(d.y, d.x); m.castShadow = true; g.add(m); }
  };
  pillar([0.96, 0.92], [0.34, 1.39], 0.07, 0.685); pillar([-0.12, 0.92], [-0.12, 1.41], 0.08, 0.69); pillar([-1.2, 0.92], [-0.78, 1.37], 0.16, 0.685);
  // chrome: bumpers with over-riders, window trim, door handles; grille; lights
  for (const x of [2.08, -2.07]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 1.66), chrome); b.position.set(x, 0.44, 0); g.add(b); for (const z of [-0.45, 0.45]) { const o = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.06), chrome); o.position.set(x, 0.47, z); g.add(o); } }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.82), dark); grille.position.set(2.1, 0.66, 0); g.add(grille);
  for (let k = 0; k < 4; k++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.84), chrome); bar.position.set(2.115, 0.6 + k * 0.04, 0); g.add(bar); }
  for (const z of [-0.805, 0.805]) { const strip = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.025, 0.02), chrome); strip.position.set(0, 0.62, z * 1.0); g.add(strip); }
  for (const z of [-0.6, 0.6]) {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 18), lens); hl.rotation.z = Math.PI / 2; hl.position.set(2.1, 0.66, z); g.add(hl);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.012, 6, 18), chrome); rim.rotation.y = Math.PI / 2; rim.position.set(2.12, 0.66, z); g.add(rim);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.32), red); tl.position.set(-2.09, 0.68, z * 1.05); g.add(tl);
  }
  for (const z of [-0.81, 0.81]) { const tr = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.02, 0.02), chrome); tr.position.set(-0.12, 0.905, z * 0.86); g.add(tr); for (const x of [0.25, -0.5]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), chrome); h.position.set(x, 0.8, z); g.add(h); } }
  // wheels: tyre + chrome hub cap
  const tyre = new THREE.CylinderGeometry(0.29, 0.29, 0.17, 22); tyre.rotateX(Math.PI / 2);
  const cap = new THREE.CylinderGeometry(0.16, 0.17, 0.18, 16); cap.rotateX(Math.PI / 2);
  for (const x of [1.21, -1.21]) for (const z of [-0.7, 0.7]) {
    const t = new THREE.Mesh(tyre, rubber); t.position.set(x, 0.29, z); t.castShadow = true; g.add(t);
    const c = new THREE.Mesh(cap, chrome); c.position.set(x, 0.29, z); g.add(c);
  }
  const under = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 1.4), dark); under.position.set(0, 0.28, 0); g.add(under);
  const ao = contactShadow(4.6, 2.3, 0.85); ao.rotation.z = 0; g.add(ao);
  g.traverse(o => { o.frustumCulled = false; });
  return { group: g, tailMat: red, headLens: lens };
}

// ---------------- LAZ-695 city bus ----------------
// ~9.2 m, rounded roof with the rear "cap" air intake, two-tone cream and colour.
export function makeBus({ color = new THREE.Color(0.55, 0.32, 0.06), cream = new THREE.Color(0.62, 0.58, 0.48), seed = 1 } = {}) {
  const g = new THREE.Group();
  const paint = patchMaterial(new THREE.MeshPhysicalMaterial({ color, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.35 }), { key: 'buspaint' });
  const paint2 = patchMaterial(new THREE.MeshPhysicalMaterial({ color: cream, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.35 }), { key: 'buspaint2' });
  const glass = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.028, 0.03, 0.032), roughness: 0.05, envMapIntensity: 1.4 }), { key: 'busglass' });
  const chrome = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.6, 0.6, 0.6), roughness: 0.25, metalness: 1.0 }), { key: 'buschrome' });
  const rubber = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.85 }), { key: 'busrubber' });
  const dark = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.6 }), { key: 'busdark' });
  const lensM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.9, 0.7) });
  const L = 9.19, W = 2.5;
  const ext = (pts, width, bevel, mat) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const eg = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8 });
    eg.translate(0, 0, -(width - 2 * bevel) / 2);
    const m = new THREE.Mesh(eg, mat); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  // lower body (below the windows), +x forward
  ext([[-4.6, 0.42], [-4.62, 1.22], [4.5, 1.22], [4.62, 1.02], [4.62, 0.42]], W, 0.12, paint);
  // window band: glass volume with a raked windscreen
  ext([[-4.52, 1.2], [-4.48, 2.2], [4.22, 2.22], [4.58, 1.2]], W - 0.14, 0.05, glass);
  // roof: shallow and rounded, cream; small rear air-intake hump
  ext([[-4.55, 2.17], [-4.45, 2.36], [4.1, 2.4], [4.28, 2.18]], W, 0.17, paint2);
  ext([[-4.5, 2.38], [-4.36, 2.74], [-3.35, 2.76], [-3.05, 2.42]], 1.3, 0.1, paint2);
  // cream belt line all round, window pillars, front centre pillar, route-board above the screen
  for (const s of [-1, 1]) {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(9.15, 0.1, 0.03), paint2); belt.position.set(0, 1.17, s * (W / 2 + 0.005)); g.add(belt);
    for (let k = 0; k <= 7; k++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.0, 0.03), paint2); p.position.set(-4.3 + k * 1.17, 1.71, s * (W / 2 - 0.055)); g.add(p); }
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.07, 0.03), chrome); skirt.position.set(0, 0.5, s * (W / 2 + 0.01)); g.add(skirt);
  }
  const fbelt = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, W - 0.1), paint2); fbelt.position.set(4.75, 1.12, 0); g.add(fbelt);
  const cpil = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.1), paint2); cpil.position.set(4.42, 1.72, 0); cpil.rotation.z = 0.35; g.add(cpil);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 1.5), dark); board.position.set(4.23, 2.3, 0); g.add(board);
  // doors (front overhang and mid) on the right side (+z): glazed leaves with rubber seams
  for (const x of [3.6, 0.2]) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.9, 0.03), glass); d.position.set(x, 1.27, W / 2 + 0.012); g.add(d);
    for (const dx of [-0.58, 0, 0.58]) { const seam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.036), rubber); seam.position.set(x + dx, 1.27, W / 2 + 0.016); g.add(seam); }
  }
  // dark wheel arches
  const archG = new THREE.CylinderGeometry(0.62, 0.62, 0.04, 20, 1, false, -Math.PI / 2, Math.PI); archG.rotateX(Math.PI / 2);
  for (const x of [2.85, -1.9]) for (const s of [-1, 1]) { const a = new THREE.Mesh(archG, dark); a.position.set(x, 0.42, s * (W / 2 + 0.008)); g.add(a); }
  // front: headlights, indicator lamps, bumper
  for (const z of [-0.9, 0.9]) {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), lensM); hl.rotation.z = Math.PI / 2; hl.position.set(4.76, 0.78, z); g.add(hl);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.015, 6, 16), chrome); rim.rotation.y = Math.PI / 2; rim.position.set(4.785, 0.78, z); g.add(rim);
    const ind = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.14), patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.5, 0.3, 0.05), roughness: 0.3 }), { key: 'busind' })); ind.position.set(4.76, 0.98, z * 1.08); g.add(ind);
  }
  const bump = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 2.5), chrome); bump.position.set(4.82, 0.5, 0); g.add(bump);
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 1.2), dark); grille.position.set(4.755, 0.72, 0); g.add(grille);
  for (let k = 0; k < 3; k++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 1.22), chrome); bar.position.set(4.765, 0.65 + k * 0.07, 0); g.add(bar); }
  const rbump = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 2.5), chrome); rbump.position.set(-4.82, 0.5, 0); g.add(rbump);
  for (const z of [-0.95, 0.95]) { const tl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.22), patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.3, 0.01, 0.01), roughness: 0.3 }), { key: 'bustail' })); tl.position.set(-4.76, 0.85, z); g.add(tl); }
  // wheels
  const tyre = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 22); tyre.rotateX(Math.PI / 2);
  const hub = new THREE.CylinderGeometry(0.25, 0.25, 0.32, 14); hub.rotateX(Math.PI / 2);
  for (const x of [2.85, -1.9]) for (const z of [-1.05, 1.05]) {
    const t = new THREE.Mesh(tyre, rubber); t.position.set(x, 0.48, z); t.castShadow = true; g.add(t);
    const h = new THREE.Mesh(hub, dark); h.position.set(x, 0.48, z); g.add(h);
  }
  const under = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.3, 2.2), dark); under.position.set(0, 0.5, 0); g.add(under);
  const ao = contactShadow(10.5, 3.4, 0.85); g.add(ao);
  g.traverse(o => { o.frustumCulled = false; });
  return { group: g, headMat: lensM, length: L, width: W };
}

// ---------------- civilians ----------------
const CSEG = [
  ['mixamorigNeck', 'mixamorigHead', 0.045, 0.042, 'skin', {}],
  ['mixamorigLeftArm', 'mixamorigLeftForeArm', 0.05, 0.043, 'sleeve', {}],
  ['mixamorigLeftForeArm', 'mixamorigLeftHand', 0.042, 0.034, 'sleeveLo', {}],
  ['mixamorigRightArm', 'mixamorigRightForeArm', 0.05, 0.043, 'sleeve', {}],
  ['mixamorigRightForeArm', 'mixamorigRightHand', 0.042, 0.034, 'sleeveLo', {}],
  ['mixamorigLeftUpLeg', 'mixamorigLeftLeg', 0.08, 0.06, 'legUp', {}],
  ['mixamorigLeftLeg', 'mixamorigLeftFoot', 0.056, 0.045, 'legLo', {}],
  ['mixamorigRightUpLeg', 'mixamorigRightLeg', 0.08, 0.06, 'legUp', {}],
  ['mixamorigRightLeg', 'mixamorigRightFoot', 0.056, 0.045, 'legLo', {}],
];
const CLOTH = {
  jackets: [[0.12, 0.11, 0.1], [0.16, 0.13, 0.09], [0.06, 0.07, 0.1], [0.2, 0.19, 0.17], [0.1, 0.12, 0.08], [0.24, 0.2, 0.14], [0.08, 0.08, 0.08]],
  shirts: [[0.5, 0.5, 0.48], [0.32, 0.38, 0.46], [0.42, 0.4, 0.3], [0.5, 0.47, 0.4]],
  trousers: [[0.06, 0.06, 0.065], [0.1, 0.09, 0.08], [0.05, 0.06, 0.1], [0.12, 0.11, 0.1]],
  dresses: [[0.3, 0.06, 0.06], [0.1, 0.16, 0.32], [0.14, 0.24, 0.16], [0.4, 0.33, 0.2], [0.36, 0.2, 0.26], [0.45, 0.42, 0.38], [0.22, 0.1, 0.2]],
  kids: [[0.4, 0.06, 0.04], [0.07, 0.15, 0.4], [0.45, 0.36, 0.05], [0.1, 0.28, 0.12], [0.4, 0.2, 0.3]],
  hair: [[0.05, 0.035, 0.025], [0.025, 0.02, 0.018], [0.12, 0.08, 0.04], [0.22, 0.16, 0.08], [0.3, 0.27, 0.22]],
  skin: [[0.42, 0.28, 0.22], [0.48, 0.33, 0.26], [0.38, 0.25, 0.19]],
};
const pick = (rnd, a) => new THREE.Color(...a[Math.floor(rnd() * a.length)]);
function cmat(color, rough = 0.9, key = 'civ') { return patchMaterial(new THREE.MeshStandardMaterial({ color, roughness: rough }), { key }); }

export function makeCivilian(rig, { seed = 1, kind = null, bag = null } = {}) {
  const rnd = mulberry32(seed * 7919 + 13);
  kind = kind || (rnd() < 0.45 ? 'man' : rnd() < 0.8 ? 'woman' : 'child');
  const root = SkeletonUtils.clone(rig.scene);
  root.traverse(o => { if (o.isMesh) o.visible = false; });
  const bones = {}; root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const skin = cmat(pick(rnd, CLOTH.skin), 0.7, 'civskin');
  let top, sleeve, legUp, legLo, shoe;
  const jacket = rnd() < 0.6;
  if (kind === 'man') {
    top = cmat(jacket ? pick(rnd, CLOTH.jackets) : pick(rnd, CLOTH.shirts));
    sleeve = top; legUp = cmat(pick(rnd, CLOTH.trousers)); legLo = legUp;
  } else if (kind === 'woman') {
    const dress = pick(rnd, CLOTH.dresses);
    top = cmat(jacket ? pick(rnd, CLOTH.jackets).multiplyScalar(1.2) : dress); sleeve = top;
    legUp = cmat(dress); legLo = cmat(new THREE.Color(0.36, 0.26, 0.2), 0.6, 'civtights');
  } else {
    top = cmat(pick(rnd, CLOTH.kids)); sleeve = top; legUp = cmat(pick(rnd, CLOTH.trousers)); legLo = rnd() < 0.4 ? skin : legUp;
  }
  shoe = cmat(new THREE.Color(0.02, 0.018, 0.016), 0.5, 'civshoe');
  const m = { top, sleeve, sleeveLo: kind === 'man' && !jacket && rnd() < 0.5 ? skin : sleeve, legUp, legLo, skin };
  const add = (bone, mesh) => { mesh.scale.multiplyScalar(100); mesh.position.multiplyScalar(100); mesh.castShadow = true; bones[bone].add(mesh); return mesh; };
  for (const [b, c, r0, r1, mk, o] of CSEG) {
    const len = bones[c].position.length() / 100;
    for (const gg of segGeo(len, r0, r1, o)) {
      const mesh = new THREE.Mesh(gg, m[mk]);
      mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), bones[c].position.clone().normalize());
      add(b, mesh);
    }
  }
  // one smooth torso from the waist to the base of the neck (lathe profile, elliptical section)
  {
    const len = ['mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'].reduce((a, n) => a + bones[n].position.length() / 100, 0);
    const fem = kind === 'woman' ? 1 : 0;
    const prof = [[0.0, 0.0], [0.125 + fem * 0.01, 0.0], [0.13, 0.12], [0.142 - fem * 0.01, 0.32], [0.152, 0.6], [0.155, 0.8], [0.14, 0.92], [0.09, 0.99], [0.05, 1.02], [0.0, 1.02]]
      .map(([r, y]) => new THREE.Vector2(r, y * len));
    const tg = new THREE.LatheGeometry(prof, 20); tg.scale(1.24, 1, 0.78);
    const torso = new THREE.Mesh(tg, top); torso.position.set(0, -0.02, 0); add('mixamorigSpine', torso);
  }
  // hips; women wear a skirt / dress flaring to the knee
  const pel = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.24, 14), kind === 'woman' ? legUp : legUp);
  pel.scale.set(1.12, 1, 0.82); pel.position.set(0, 0.0, 0); add('mixamorigHips', pel);
  if (kind === 'woman') {
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.27, 0.52, 18, 1, true), legUp); sk.material.side = THREE.DoubleSide;
    sk.scale.set(1.1, 1, 0.9); sk.position.set(0, -0.3, 0.0); add('mixamorigHips', sk);
  }
  if (jacket && kind !== 'child') {
    const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.2, 0.18, 14, 1, true), top); hem.material.side = THREE.DoubleSide;
    hem.scale.set(1.15, 1, 0.86); hem.position.set(0, 0.02, 0); add('mixamorigHips', hem);
  }
  for (const s of ['mixamorigLeftArm', 'mixamorigRightArm']) add(s, new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 10), top));
  // head, hair or cap / headscarf
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), skin); head.scale.set(0.8, 1.06, 0.95); head.position.set(0, 0.095, 0.012); add('mixamorigHead', head);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), skin); nose.scale.set(0.8, 1.2, 1); nose.position.set(0, 0.085, 0.102); add('mixamorigHead', nose);
  for (const ex of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), skin); ear.scale.set(0.5, 1.2, 0.9); ear.position.set(ex * 0.08, 0.09, 0.0); add('mixamorigHead', ear); }
  const hairC = pick(rnd, CLOTH.hair);
  const elder = rnd() < 0.18;
  if (kind === 'woman' && elder) {
    const sc = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), cmat(pick(rnd, CLOTH.dresses).multiplyScalar(1.3)));
    sc.scale.set(1.0, 1.1, 1.08); sc.position.set(0, 0.1, -0.005); sc.rotation.x = -0.35; add('mixamorigHead', sc);
  } else {
    const hm = cmat(hairC, 0.6, 'civhair');
    const long = kind === 'woman';
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.097, 14, 10, 0, Math.PI * 2, 0, Math.PI * (long ? 0.66 : 0.5)), hm);
    hair.scale.set(1.0, 1.08, 1.08); hair.position.set(0, 0.105, -0.008); hair.rotation.x = -0.45; add('mixamorigHead', hair);
    if (long) { const bun = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), hm); bun.position.set(0, 0.14, -0.08); add('mixamorigHead', bun); }
    if (kind === 'man' && rnd() < 0.3) {
      const capM = cmat(pick(rnd, CLOTH.jackets));
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16), capM); cap.position.set(0, 0.19, 0.0); cap.scale.set(1, 1, 1.12); add('mixamorigHead', cap);
      const peak = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.012, 0.07), capM); peak.position.set(0, 0.17, 0.11); add('mixamorigHead', peak);
    }
  }
  // hands, shoes
  for (const h of ['mixamorigLeftHand', 'mixamorigRightHand']) { const hd = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.03), skin); hd.position.set(0, 0.05, 0); add(h, hd); }
  for (const [f, t] of [['mixamorigLeftFoot', 'mixamorigLeftToeBase'], ['mixamorigRightFoot', 'mixamorigRightToeBase']]) {
    const dir = bones[t].position.clone(); const len = dir.length() / 100; dir.normalize();
    const bt = new THREE.Mesh(new THREE.BoxGeometry(0.085, len + 0.07, 0.075), shoe); bt.geometry.translate(0, (len + 0.07) / 2 - 0.035, 0);
    bt.quaternion.setFromUnitVectors(V3(0, 1, 0), dir); add(f, bt);
  }
  // bags: handbag, string bag (avoska) or briefcase in the right hand
  bag = bag === 'none' ? null : bag ?? (rnd() < 0.45 ? (kind === 'woman' ? 'handbag' : kind === 'man' ? 'case' : null) : null);
  if (bag) {
    const bm = cmat(bag === 'case' ? new THREE.Color(0.06, 0.035, 0.02) : pick(rnd, CLOTH.jackets), 0.6, 'civbag');
    const dims = bag === 'case' ? [0.09, 0.3, 0.4] : bag === 'suitcase' ? [0.14, 0.36, 0.5] : bag === 'sack' ? [0.26, 0.38, 0.26] : [0.09, 0.2, 0.28];
    const bx = new THREE.Mesh(new THREE.BoxGeometry(...dims), bm); bx.position.set(0, 0.12 + dims[1] / 2, 0.0);
    bx.rotation.z = Math.PI; add('mixamorigRightHand', bx);
  }
  const mixer = new THREE.AnimationMixer(root);
  const actions = {}; for (const [k, clip] of Object.entries(rig.clips)) actions[k] = mixer.clipAction(clip);
  root.traverse(o => { o.frustumCulled = false; });
  const scale = kind === 'child' ? 0.58 + rnd() * 0.12 : (kind === 'woman' ? 0.93 : 0.98) + rnd() * 0.07;
  root.scale.setScalar(scale);
  const ao = contactShadow(0.9, 0.9, 0.5);
  return { root, mixer, actions, bones, kind, scale, ao };
}

// Ground speed (m/s at scale 1) implied by an in-place locomotion clip: while a foot is planted
// its position relative to the hips moves backward at exactly the walking speed.
export function clipSpeed(rig, clipName) {
  const root = SkeletonUtils.clone(rig.scene);
  const mixer = new THREE.AnimationMixer(root);
  const clip = rig.clips[clipName]; const act = mixer.clipAction(clip); act.play();
  const bones = {}; root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const N = 96, T = clip.duration, samp = [];
  const w = new THREE.Vector3(), h = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    act.time = T * i / N; mixer.update(0); root.updateMatrixWorld(true);
    bones.mixamorigHips.getWorldPosition(h);
    const f = ['mixamorigLeftToeBase', 'mixamorigRightToeBase'].map(n => { bones[n].getWorldPosition(w); return [w.z - h.z, w.y]; });
    samp.push(f);
  }
  const vs = [];
  for (let k = 0; k < 2; k++) {
    const ymin = Math.min(...samp.map(s => s[k][1]));
    for (let i = 0; i < N; i++) {
      const a = samp[i][k], b = samp[(i + 1) % N][k];
      if (a[1] < ymin + 0.03 && b[1] < ymin + 0.03) vs.push(-(b[0] - a[0]) / (T / N));
    }
  }
  vs.sort((a, b) => a - b);
  return vs.length ? Math.abs(vs[Math.floor(vs.length / 2)]) : 1.3;
}

// Dark canopy floor under the instanced pine forest, so gaps between cones read as forest
// shade from the air. Same circle + exclusion zones as buildForest.
export function forestFloor(ctx, { center, radius, exclude = [], y = 0.4, color = [0.022, 0.03, 0.018], redAt = null }) {
  const ex = exclude.slice(0, 8); while (ex.length < 8) ex.push([0, 0, 0]);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });
  patchMaterial(mat, {
    key: 'forestfloor',
    uniforms: { tNoise: { value: ctx.noiseTex }, uC: { value: new THREE.Vector3(center[0], center[1], radius) }, uEx: { value: ex.map(e => new THREE.Vector3(...e)) }, uCol: { value: new THREE.Vector3(...color) }, uRed: { value: new THREE.Vector3(...(redAt || [0, 0, -1])) } },
    fragmentHeader: `precision highp sampler3D; uniform sampler3D tNoise; uniform vec3 uC; uniform vec3 uEx[8]; uniform vec3 uCol; uniform vec3 uRed;`,
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      {
        vec2 p = vWPos.xz; float m = 1.0 - smoothstep(uC.z - 60.0, uC.z, length(p - uC.xy));
        for (int i = 0; i < 8; i++) if (uEx[i].z > 0.0) m *= smoothstep(uEx[i].z - 30.0, uEx[i].z + 25.0, length(p - uEx[i].xy));
        float n = texture(tNoise, vec3(p * 0.004, 0.37)).r, n2 = texture(tNoise, vec3(p * 0.05, 0.61)).g;
        if (m < 0.5 + (n2 - 0.5) * 0.4) discard;
        vec3 fc = uCol;
        if (uRed.z > 0.0) fc = mix(vec3(0.075, 0.035, 0.015), uCol, smoothstep(uRed.z * 0.6, uRed.z * 1.1, length(p - uRed.xy) + (n - 0.5) * 300.0));
        diffuseColor.rgb = fc * (0.6 + 0.6 * n) * (0.75 + 0.5 * n2);
      }`]],
  });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2.2, radius * 2.2), mat);
  g.rotation.x = -Math.PI / 2; g.position.set(center[0], y, center[1]); g.receiveShadow = true;
  return g;
}

// Liquidator, 1986: khaki work suit, lead apron front and back, cloth cap or hard hat, the white
// "Lepestok" respirator over the face, rubber gloves and boots; carries a shovel.
export function makeLiquidator(rig, { seed = 1, shovel = true, helmet = null } = {}) {
  const rnd = mulberry32(seed * 104729 + 7);
  const root = SkeletonUtils.clone(rig.scene);
  root.traverse(o => { if (o.isMesh) o.visible = false; });
  const bones = {}; root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const sh = 0.85 + rnd() * 0.3;
  const suitC = [[0.13, 0.13, 0.08], [0.1, 0.11, 0.08], [0.16, 0.15, 0.11], [0.2, 0.2, 0.19]][Math.floor(rnd() * 4)];
  const suit = cmat(new THREE.Color(...suitC).multiplyScalar(sh), 0.95, 'liqsuit');
  const lead = cmat(new THREE.Color(0.07, 0.075, 0.07), 0.6, 'liqlead');
  const skin = cmat(new THREE.Color(0.42, 0.28, 0.22), 0.7, 'civskin');
  const white = cmat(new THREE.Color(0.62, 0.62, 0.6), 0.9, 'liqresp');
  const rubber = cmat(new THREE.Color(0.03, 0.03, 0.03), 0.5, 'liqrub');
  const m = { top: suit, sleeve: suit, sleeveLo: suit, legUp: suit, legLo: suit, skin };
  const add = (bone, mesh) => { mesh.scale.multiplyScalar(100); mesh.position.multiplyScalar(100); mesh.castShadow = true; bones[bone].add(mesh); return mesh; };
  for (const [b, c, r0, r1, mk, o] of CSEG) {
    const len = bones[c].position.length() / 100;
    for (const gg of segGeo(len, r0 * 1.12, r1 * 1.12, o)) { const mesh = new THREE.Mesh(gg, m[mk]); mesh.quaternion.setFromUnitVectors(V3(0, 1, 0), bones[c].position.clone().normalize()); add(b, mesh); }
  }
  const len = ['mixamorigSpine1', 'mixamorigSpine2', 'mixamorigNeck'].reduce((a, n) => a + bones[n].position.length() / 100, 0);
  const prof = [[0.0, 0.0], [0.14, 0.0], [0.145, 0.12], [0.155, 0.32], [0.165, 0.6], [0.165, 0.8], [0.15, 0.92], [0.1, 0.99], [0.05, 1.02], [0.0, 1.02]].map(([r, y]) => new THREE.Vector2(r, y * len));
  const tg = new THREE.LatheGeometry(prof, 20); tg.scale(1.24, 1, 0.8);
  const torso = new THREE.Mesh(tg, suit); torso.position.set(0, -0.02, 0); add('mixamorigSpine', torso);
  // lead plates (apron) front and back, strapped over the shoulders
  for (const z of [0.115, -0.115]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.03), lead); pl.position.set(0, 0.24, z); add('mixamorigSpine1', pl); }
  const pel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.26, 14), suit); pel.scale.set(1.12, 1, 0.84); add('mixamorigHips', pel);
  for (const s2 of ['mixamorigLeftArm', 'mixamorigRightArm']) add(s2, new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), suit));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), skin); head.scale.set(0.8, 1.06, 0.95); head.position.set(0, 0.095, 0.012); add('mixamorigHead', head);
  // respirator: white petal over nose and mouth
  const resp = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), white); resp.rotation.x = Math.PI / 2; resp.scale.set(1, 1, 0.55); resp.position.set(0, 0.055, 0.075); add('mixamorigHead', resp);
  helmet = helmet ?? (rnd() < 0.5 ? 'hat' : 'cap');
  if (helmet === 'hat') {
    const hm = cmat([new THREE.Color(0.45, 0.4, 0.1), new THREE.Color(0.5, 0.5, 0.48), new THREE.Color(0.4, 0.12, 0.05)][Math.floor(rnd() * 3)], 0.5, 'liqhat');
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), hm); dome.position.set(0, 0.13, 0.0); dome.scale.set(1, 0.9, 1.1); add('mixamorigHead', dome);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.14, 0.012, 18), hm); brim.position.set(0, 0.13, 0.01); brim.scale.set(1, 1, 1.15); add('mixamorigHead', brim);
  } else {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), suit); cap.position.set(0, 0.11, -0.005); cap.scale.set(1, 1, 1.08); add('mixamorigHead', cap);
  }
  for (const h of ['mixamorigLeftHand', 'mixamorigRightHand']) { const gl = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.12, 0.04), rubber); gl.position.set(0, 0.06, 0); add(h, gl); }
  for (const [f, t] of [['mixamorigLeftFoot', 'mixamorigLeftToeBase'], ['mixamorigRightFoot', 'mixamorigRightToeBase']]) {
    const dir = bones[t].position.clone(); const ln = dir.length() / 100; dir.normalize();
    const bt = new THREE.Mesh(new THREE.BoxGeometry(0.1, ln + 0.08, 0.09), rubber); bt.geometry.translate(0, (ln + 0.08) / 2 - 0.04, 0);
    bt.quaternion.setFromUnitVectors(V3(0, 1, 0), dir); add(f, bt);
  }
  if (shovel) {
    const wood = cmat(new THREE.Color(0.2, 0.14, 0.08), 0.8, 'shovelw'); const steel = cmat(new THREE.Color(0.25, 0.25, 0.24), 0.5, 'shovels');
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.25, 6), wood); shaft.position.y = 0.0; g.add(shaft);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.02), steel); blade.position.y = -0.76; g.add(blade);
    g.position.set(0, 0.08, 0.03); g.rotation.z = 0.25; add('mixamorigRightHand', g);
  }
  const mixer = new THREE.AnimationMixer(root);
  const actions = {}; for (const [k, clip] of Object.entries(rig.clips)) actions[k] = mixer.clipAction(clip);
  root.traverse(o => { o.frustumCulled = false; });
  root.scale.setScalar(0.97 + rnd() * 0.06);
  return { root, mixer, actions, bones, scale: root.scale.x, ao: contactShadow(0.9, 0.9, 0.5) };
}
