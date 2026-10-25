// Pripyat, April 1986: microdistricts of 5/9/16-storey precast panel blocks, avenues with
// mercury street lamps, bare spring trees, yards. Facades are procedural (windows, panel
// seams, entrance lamps, balconies) so hundreds of buildings cost one draw call.
import * as THREE from 'three';
import { patchMaterial, ATM } from './atmos.js';
import { mulberry32 } from './util.js';

export const CITY_BOUNDS = { x0: -1300, z0: -1300, size: 2600 };

// ---------- facade material ----------
export function makeFacadeMaterial(noiseTex, opts = {}) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.0 });
  const uniforms = {
    tNoise: { value: noiseTex },
    uWinGain: { value: opts.winGain ?? 1.0 },
    uEntrGain: { value: opts.entrGain ?? 1.0 },
    uBroken: { value: opts.broken ?? 0.0 },
    uDay: { value: opts.day ?? 0.0 },
    uSnow: { value: opts.snow ?? 0.0 },
    uTimeF: ATM.uTime,
  };
  mat.userData.u = uniforms;
  patchMaterial(mat, {
    key: 'facade',
    uniforms,
    vertexHeader: `attribute vec4 aB; varying vec4 vFac; varying vec4 vB; varying float vFace;`,
    vertexMain: `
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
      vec3 lm = position * sc;
      vB = aB;
      if (abs(normal.x) > 0.5) { vFac = vec4(lm.z + sc.z * 0.5, lm.y, 0.0, sc.z); vFace = normal.x > 0.0 ? 0.0 : 1.0; }
      else if (abs(normal.z) > 0.5) { vFac = vec4(lm.x + sc.x * 0.5, lm.y, 0.0, sc.x); vFace = normal.z > 0.0 ? 2.0 : 3.0; }
      else { vFac = vec4(lm.x, lm.z, 1.0, sc.y); vFace = 4.0; }
      if (normal.x < -0.5) vFac.x = sc.z - vFac.x;
      if (normal.z < -0.5) vFac.x = sc.x - vFac.x;`,
    fragmentHeader: `
      precision highp sampler3D;
      uniform sampler3D tNoise; uniform float uWinGain, uEntrGain, uBroken, uTimeF, uDay, uSnow;
      varying vec4 vFac; varying vec4 vB; varying float vFace;
      float hh(vec3 p){ ivec3 q = ivec3(floor(p + 0.5)) + ivec3(4096); uint h = uint(q.x) * 1597334677u ^ uint(q.y) * 3812015801u ^ uint(q.z) * 2741869493u; h = (h ^ (h >> 16u)) * 2246822519u; h ^= h >> 13u; h *= 3266489917u; h ^= h >> 16u; return float(h) * (1.0 / 4294967296.0); }
      vec3 gWinEmit; float gGlass; float gRough;
    `,
    fragmentReplace: [
      ['#include <color_fragment>', `#include <color_fragment>
      gWinEmit = vec3(0.0); gGlass = 0.0; gRough = 0.92;
      {
        float seed = floor(vB.x * 7.0 + 0.5); float floors = floor(vB.y + 0.5); float litF = vB.z; float style = floor(vB.w + 0.5);
        vec3 wn = normalize(vWNrm);
        if (vFace > 3.5) {
          // roof: bitumen with ponding
          float n = texture(tNoise, vec3(vWPos.xz * 0.013, vB.x)).r;
          diffuseColor.rgb = mix(vec3(0.045, 0.045, 0.047) * (0.75 + 0.5 * n), vec3(0.62, 0.63, 0.66) * (0.9 + 0.15 * n), uSnow);
          gRough = 0.75;
        } else {
          float floorH = 2.8;
          float u = vFac.x, y = vFac.y, Wd = vFac.w;
          float cellW = (style > 2.5) ? 3.6 : 3.0;
          float nC = max(floor(Wd / cellW), 1.0);
          float marg = (Wd - nC * cellW) * 0.5;
          float cu = (u - marg) / cellW;
          float ci = floor(cu); float cx = fract(cu) * cellW;
          float fl = floor(y / floorH); float fy = y - fl * floorH;
          float topY = floors * floorH + 0.6;
          bool inGrid = cu >= 0.0 && cu < nC && fl >= 0.0 && fl < floors && y < topY - 0.6;
          float secCells = 6.0 + floor(fract(vB.x * 3.7) * 3.0);
          float inSec = mod(ci, secCells);
          float stairSide = fract(vB.x * 5.3) > 0.5 ? 2.0 : 3.0;
          bool stair = abs(inSec - floor(secCells * 0.5)) < 0.5 && (vFace == stairSide || (Wd < 30.0 && vFace == stairSide));
          // concrete panel albedo
          float pid = hh(vec3(floor(cu * 0.5), fl, seed * 13.0 + vFace));
          vec3 conc = (style > 1.5 && style < 2.5) ? vec3(0.34, 0.34, 0.33) : vec3(0.27, 0.27, 0.265);
          conc *= 0.86 + 0.18 * pid;
          float n1 = texture(tNoise, vec3(u * 0.045, y * 0.03, vB.x + vFace * 0.17)).r;
          float streak = texture(tNoise, vec3(u * 0.35, y * 0.012, vB.x * 0.7 + 0.5)).g;
          conc *= 0.78 + 0.35 * n1;
          conc *= mix(1.0, 0.82, smoothstep(0.55, 0.85, streak));
          conc *= mix(0.7, 1.0, smoothstep(0.0, 3.5, y));
          // seams
          float sx = min(fract(cu * 0.5), 1.0 - fract(cu * 0.5)) * cellW * 2.0;
          float sy = min(fy, floorH - fy);
          float seam = 1.0 - (1.0 - smoothstep(0.0, 0.05, sx)) * 0.35 - (1.0 - smoothstep(0.0, 0.04, sy)) * 0.3;
          vec3 col = conc * seam;
          if (inGrid) {
            float ww = stair ? 1.0 : 1.5; float wh = stair ? 1.0 : 1.45; float sill = stair ? 1.6 : 0.85;
            float fyy = stair ? mod(y + 1.4, floorH) : fy;
            float flw = stair ? floor((y + 1.4) / floorH) : fl;
            bool balcony = !stair && hh(vec3(ci, 3.0, seed)) < 0.38 && fl > 0.5 && vFace != stairSide;
            if (balcony) { ww = 2.1; }
            float x0 = (cellW - ww) * 0.5;
            float lx = cx - x0, ly = fyy - sill;
            if (balcony && fyy < 1.05) {
              // balcony railing panel (often light ribbed sheet)
              col = mix(col, vec3(0.3, 0.31, 0.33) * (0.8 + 0.3 * pid), step(0.0, cx - 0.15) * step(cx, cellW - 0.15));
            }
            bool entrance = stair && fl < 0.5;
            if (entrance) {
              // entrance door with canopy lamp
              float dx = cx - (cellW * 0.5 - 0.8);
              if (dx > 0.0 && dx < 1.6 && y < 2.2) { col = vec3(0.05, 0.04, 0.035); }
              float ld = length(vec2(cx - cellW * 0.5, y - 2.75));
              float lampOn = step(0.25, hh(vec3(ci, 9.0, seed)));
              gWinEmit += vec3(1.0, 0.82, 0.55) * uEntrGain * lampOn * (smoothstep(0.18, 0.0, ld) * 40.0 + exp(-ld * 1.6) * 0.35 * step(y, 2.75));
            } else if (lx > 0.0 && lx < ww && ly > 0.0 && ly < wh && flw < floors) {
              float fr = 0.07;
              bool frame = lx < fr || lx > ww - fr || ly < fr || ly > wh - fr;
              float mul = stair ? 0.5 : (balcony ? 0.38 : 0.62);
              bool mull = abs(lx - ww * mul) < 0.035 || (!stair && abs(ly - wh * 0.72) < 0.03 && lx < ww * mul);
              float wid = hh(vec3(ci + 0.5, flw, seed * 31.0 + vFace * 7.0));
              float broken = step(hh(vec3(ci, flw, seed * 3.0 + vFace)), uBroken);
              if (frame || mull) {
                col = vec3(0.2, 0.19, 0.18) * (0.8 + 0.2 * pid);
              } else {
                gGlass = 1.0 - broken;
                col = vec3(0.015, 0.016, 0.018);
                float lit = step(wid, litF) * (1.0 - broken);
                if (stair) lit = step(hh(vec3(ci, flw, seed * 5.0)), litF * 2.5) * (1.0 - broken);
                float typ = hh(vec3(ci, flw, seed * 17.0 + 3.0));
                vec3 lc = typ < 0.62 ? vec3(1.0, 0.6, 0.3) : (typ < 0.86 ? vec3(0.95, 0.85, 0.7) : vec3(0.55, 0.68, 1.0));
                if (stair) lc = vec3(0.85, 0.95, 0.9);
                float inten = 0.35 + 0.9 * hh(vec3(ci, flw, seed * 23.0 + 1.0));
                if (typ >= 0.86) inten *= 0.55 + 0.45 * sin(uTimeF * 9.0 + wid * 50.0) * sin(uTimeF * 3.7 + wid * 20.0);
                // curtains and interior falloff
                float cw = 0.15 + 0.3 * hh(vec3(ci, flw, seed * 41.0));
                float cmask = smoothstep(cw, cw - 0.05, lx / ww) + smoothstep(1.0 - cw, 1.0 - cw + 0.05, lx / ww);
                float folds = 0.6 + 0.4 * abs(sin(lx * 38.0 + wid * 10.0));
                float trans = mix(1.0, 0.28 * folds, clamp(cmask, 0.0, 1.0));
                float tulle = (hh(vec3(ci, flw, seed * 43.0)) > 0.4) ? 0.72 + 0.1 * sin(lx * 90.0) : 1.0;
                float grad = 0.65 + 0.35 * smoothstep(0.0, wh, ly) * (1.0 - smoothstep(wh * 0.8, wh, ly) * 0.5);
                gWinEmit += lc * inten * trans * tulle * grad * lit * uWinGain;
                if (uDay > 0.0) {
                  // by day the room is dark; tulle and drapes catch the light at the glass
                  float dr = hh(vec3(ci, flw, seed * 47.0));
                  vec3 drape = dr < 0.3 ? vec3(0.16, 0.05, 0.035) : (dr < 0.55 ? vec3(0.13, 0.1, 0.05) : (dr < 0.75 ? vec3(0.06, 0.09, 0.05) : vec3(0.15, 0.13, 0.1)));
                  vec3 room = vec3(0.012, 0.011, 0.01) * grad;
                  vec3 tl = vec3(0.2, 0.2, 0.19) * (0.75 + 0.25 * abs(sin(lx * 60.0 + wid * 7.0)));
                  vec3 dc = mix(room, tl, (tulle < 0.99 ? 1.0 : 0.0) * 0.8);
                  dc = mix(dc, drape * folds, clamp(cmask, 0.0, 1.0));
                  col = mix(col, dc, uDay);
                }
                if (broken > 0.5) {
                  // empty frame, dark interior, a few shards
                  col = vec3(0.004);
                  float sh = step(0.82, hh(vec3(floor(lx * 9.0), floor(ly * 9.0), seed)));
                  gGlass = sh;
                }
              }
            }
          }
          if (y > topY - 0.6) col *= 0.9; // attic band
          diffuseColor.rgb = col;
          gRough = mix(0.92, 0.08, gGlass);
        }
      }`],
      ['#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
       roughnessFactor = gRough;`],
      ['#include <emissivemap_fragment>', `#include <emissivemap_fragment>
       totalEmissiveRadiance += gWinEmit;
       {
         vec3 V = normalize(vWPos - cameraPosition); vec3 R = reflect(V, normalize(vWNrm));
         float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-V, normalize(vWNrm)), 0.0), 5.0);
         totalEmissiveRadiance += fogColorDir(R) * fres * gGlass * 2.2 * (1.0 - uDay);
       }`],
    ],
  });
  return mat;
}

// ---------- tree texture ----------
function treeCanvas(seed, spring = 0.35) {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const rnd = mulberry32(seed);
  g.clearRect(0, 0, S, S);
  g.lineCap = 'round';
  function branch(x, y, ang, len, w, depth) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    g.strokeStyle = `rgba(${40 + depth * 3},${36 + depth * 3},${32 + depth * 2},1)`;
    g.lineWidth = w;
    g.beginPath(); g.moveTo(x, y);
    const mx = (x + x2) / 2 + (rnd() - 0.5) * len * 0.2, my = (y + y2) / 2 + (rnd() - 0.5) * len * 0.2;
    g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
    if (depth >= 7 || len < 4) {
      if (rnd() < spring) { g.fillStyle = `rgba(${55 + rnd() * 25},${62 + rnd() * 30},${30 + rnd() * 15},0.95)`; g.beginPath(); g.arc(x2, y2, 2 + rnd() * 4, 0, 7); g.fill(); }
      return;
    }
    const n = depth < 2 ? 3 : 2 + (rnd() < 0.5 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = ang + (rnd() - 0.5) * 1.3 + (i - (n - 1) / 2) * 0.35;
      branch(x2, y2, a, len * (0.66 + rnd() * 0.16), Math.max(w * 0.62, 0.7), depth + 1);
    }
  }
  const trunkTop = S * (0.62 + rnd() * 0.1);
  g.strokeStyle = 'rgb(35,31,28)'; g.lineWidth = 14;
  g.beginPath(); g.moveTo(S / 2, S); g.lineTo(S / 2 + (rnd() - 0.5) * 10, trunkTop); g.stroke();
  branch(S / 2, trunkTop, -Math.PI / 2, S * 0.17, 10, 0);
  branch(S / 2, trunkTop + 20, -Math.PI / 2 - 0.6, S * 0.13, 7, 1);
  branch(S / 2, trunkTop + 30, -Math.PI / 2 + 0.6, S * 0.13, 7, 1);
  return c;
}

export function makeTreeMaterial(seed = 7, spring = 0.35) {
  const tex = new THREE.CanvasTexture(treeCanvas(seed, spring));
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
  const mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.95, alphaToCoverage: true });
  patchMaterial(mat, { key: 'tree' });
  return mat;
}

// crossed quads, base at y=0, height 1, width 1
export function treeGeometry() {
  const g1 = new THREE.PlaneGeometry(1, 1); g1.translate(0, 0.5, 0);
  const g2 = g1.clone(); g2.rotateY(Math.PI / 2);
  const g3 = g1.clone(); g3.rotateY(Math.PI / 4);
  const merged = mergeGeos([g1, g2, g3]);
  return merged;
}
export function mergeGeos(list) {
  let nPos = 0, nIdx = 0;
  for (const g of list) { nPos += g.attributes.position.count; nIdx += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(nPos * 3), nor = new Float32Array(nPos * 3), uv = new Float32Array(nPos * 2), idx = new Uint32Array(nIdx);
  let po = 0, io = 0;
  for (const g of list) {
    const p = g.attributes.position, n = g.attributes.normal, t = g.attributes.uv;
    pos.set(p.array, po * 3); if (n) nor.set(n.array, po * 3); if (t) uv.set(t.array, po * 2);
    if (g.index) { for (let i = 0; i < g.index.count; i++) idx[io++] = g.index.array[i] + po; }
    else { for (let i = 0; i < p.count; i++) idx[io++] = i + po; }
    po += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

// ---------- layout ----------
export function generateLayout(seed = 1986) {
  const rnd = mulberry32(seed);
  const ang = THREE.MathUtils.degToRad(-17);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const toW = (x, z) => [x * ca - z * sa, x * sa + z * ca];
  const xs = [-1000, -690, -380, -60, 260, 560, 880];
  const zs = [-950, -660, -380, -90, 200, 470, 760];
  const roads = []; // {a, b, w}
  for (let i = 0; i < xs.length; i++) roads.push({ a: toW(xs[i], zs[0] - 120), b: toW(xs[i], zs[zs.length - 1] + 120), w: i === 3 ? 34 : 24 });
  for (let j = 0; j < zs.length; j++) roads.push({ a: toW(xs[0] - 120, zs[j]), b: toW(xs[xs.length - 1] + 120, zs[j]), w: j === 3 ? 34 : 24 });
  const buildings = [];
  const yards = []; // playground / tree spots (world)
  const add = (lx, lz, w, d, floors, style, rotExtra = 0) => {
    const [x, z] = toW(lx, lz);
    const h = floors * 2.8 + 1.2;
    buildings.push({ x, z, w, d, h, floors, style, rot: -ang + rotExtra, seed: rnd() * 100, lit: 0 });
  };
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const x0 = xs[i] + 30, x1 = xs[i + 1] - 30, z0 = zs[j] + 30, z1 = zs[j + 1] - 30;
    const bw = x1 - x0, bd = z1 - z0;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const p = rnd();
    if (i === 3 && j === 3) { // central square: palace of culture + hotel (low, wide)
      add(cx - 40, cz - 30, 90, 50, 4, 2); add(cx + 70, cz + 50, 60, 18, 5, 2); add(cx - 70, cz + 70, 70, 16, 9, 1);
      yards.push({ lx: cx + 40, lz: cz - 60, w: 50, d: 40, toW });
      continue;
    }
    if (p < 0.35) { // perimeter slabs + tower
      const L1 = Math.min(bw * (0.62 + rnd() * 0.2), 160);
      add(x0 + 8 + L1 / 2, z0 + 10, L1, 12.5, 9, 1);
      const L2 = Math.min(bw * (0.5 + rnd() * 0.3), 150);
      add(x1 - 8 - L2 / 2, z1 - 10, L2, 12.5, rnd() < 0.5 ? 9 : 5, rnd() < 0.5 ? 1 : 2);
      add(x1 - 22, z0 + 55, 26, 26, 16, 3);
      if (rnd() < 0.6) add(x0 + 30, cz + 20, 12.5, Math.min(bd * 0.45, 90), 9, 1);
      add(cx + 5, cz + 5, 42, 30, 2, 2);
      yards.push({ lx: cx - 30, lz: cz - 35, w: 40, d: 30, toW });
    } else if (p < 0.65) { // parallel slabs
      const n = 3;
      for (let k = 0; k < n; k++) {
        const L = Math.min(bw * (0.7 + rnd() * 0.15), 170);
        add(cx + (rnd() - 0.5) * 20, z0 + 15 + k * (bd - 30) / (n - 1), L, 12.5, rnd() < 0.75 ? 9 : 5, rnd() < 0.7 ? 1 : 2);
      }
      yards.push({ lx: cx, lz: z0 + 15 + (bd - 30) / 4, w: 60, d: 25, toW });
      yards.push({ lx: cx, lz: z0 + 15 + (bd - 30) * 3 / 4, w: 60, d: 25, toW });
    } else if (p < 0.85) { // 16-storey towers staggered
      const pts = [[x0 + 30, z0 + 30], [x1 - 30, z0 + 40], [cx, cz], [x0 + 40, z1 - 30], [x1 - 35, z1 - 35]];
      for (const [px, pz] of pts) if (rnd() < 0.85) add(px, pz, rnd() < 0.5 ? 26 : 38, 18, 16, 3, rnd() < 0.5 ? 0 : Math.PI / 2);
      yards.push({ lx: cx - 60, lz: cz + 10, w: 40, d: 40, toW });
    } else { // school + 5-storey
      add(cx, cz, 90, 18, 3, 2);
      add(cx, z0 + 12, Math.min(bw * 0.8, 160), 12, 5, 1);
      add(x0 + 15, cz, 12, Math.min(bd * 0.6, 120), 9, 1);
      yards.push({ lx: cx, lz: z1 - 30, w: 70, d: 35, toW });
    }
  }
  return { roads, buildings, yards, toW, ang };
}

// ---------- ground texture + lamp map ----------
function drawGround(layout, B) {
  const S = 2048, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const k = S / B.size;
  const P = (x, z) => [(x - B.x0) * k, (z - B.z0) * k];
  // base: soil/grass, mottled
  g.fillStyle = 'rgb(46,46,38)'; g.fillRect(0, 0, S, S);
  const rnd = mulberry32(5);
  for (let i = 0; i < 9000; i++) {
    const x = rnd() * S, y = rnd() * S, r = 4 + rnd() * 30;
    g.fillStyle = `rgba(${30 + rnd() * 35},${32 + rnd() * 30},${22 + rnd() * 20},0.25)`;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  // yards paths & sidewalks around buildings
  for (const b of layout.buildings) {
    const [px, pz] = P(b.x, b.z);
    g.save(); g.translate(px, pz); g.rotate(b.rot);
    g.fillStyle = 'rgb(88,87,82)';
    g.fillRect(-(b.w / 2 + 4) * k, -(b.d / 2 + 4) * k, (b.w + 8) * k, (b.d + 8) * k);
    g.fillStyle = 'rgb(58,58,56)';
    g.fillRect(-(b.w / 2 + 14) * k, -(b.d / 2 + 16) * k, (b.w + 28) * k, 7 * k);
    g.restore();
  }
  // roads: sidewalk band, curb, asphalt
  for (const r of layout.roads) {
    const [ax, az] = P(...r.a), [bx, bz] = P(...r.b);
    g.lineCap = 'butt';
    g.strokeStyle = 'rgb(92,92,88)'; g.lineWidth = (r.w + 10) * k; g.beginPath(); g.moveTo(ax, az); g.lineTo(bx, bz); g.stroke();
    g.strokeStyle = 'rgb(40,40,41)'; g.lineWidth = r.w * k; g.beginPath(); g.moveTo(ax, az); g.lineTo(bx, bz); g.stroke();
  }
  // asphalt texture speckle
  const id = g.getImageData(0, 0, S, S); const d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(id, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

export function lampPositions(layout, spacing = 34) {
  const lamps = [];
  const rnd = mulberry32(77);
  for (const r of layout.roads) {
    const dx = r.b[0] - r.a[0], dz = r.b[1] - r.a[1];
    const L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz, nz = ux;
    for (let s = 10; s < L; s += spacing) {
      for (const side of (r.w > 30 ? [-1, 1] : [1])) {
        const off = (r.w / 2 + 1.5) * side;
        const x = r.a[0] + ux * s + nx * off, z = r.a[1] + uz * s + nz * off;
        // arm points over the road
        lamps.push({ x, z, ax: -nx * side, az: -nz * side, sodium: rnd() < 0.18, on: rnd() > 0.04 });
      }
    }
  }
  return lamps;
}

function drawLampMap(lamps, B, gain = 1) {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = 'black'; g.fillRect(0, 0, S, S);
  g.globalCompositeOperation = 'lighter';
  const k = S / B.size;
  for (const l of lamps) {
    if (!l.on) continue;
    const x = (l.x + l.ax * 1.8 - B.x0) * k, z = (l.z + l.az * 1.8 - B.z0) * k;
    const r = 20 * k;
    const grd = g.createRadialGradient(x, z, 0, x, z, r);
    const col = l.sodium ? [255, 150, 60] : [170, 205, 190];
    grd.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${0.55 * gain})`);
    grd.addColorStop(0.35, `rgba(${col[0]},${col[1]},${col[2]},${0.25 * gain})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(x, z, r, 0, 7); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

// ---------- assemble ----------
export function buildCity(ctx, opts = {}) {
  const { noiseTex } = ctx;
  const group = new THREE.Group();
  const layout = opts.layout || generateLayout(opts.seed || 1986);
  const B = CITY_BOUNDS;
  const rnd = mulberry32(99);
  // buildings
  const facadeMat = makeFacadeMaterial(noiseTex, opts.facade || {});
  const skipTree = opts.treeExclude ? (x, z) => opts.treeExclude.some(([ex, ez, er]) => Math.hypot(x - ex, z - ez) < er) : () => false;
  const boxGeo = new THREE.BoxGeometry(1, 1, 1); boxGeo.translate(0, 0.5, 0);
  const n = layout.buildings.length;
  const aB = new Float32Array(n * 4);
  const bm = new THREE.InstancedMesh(boxGeo, facadeMat, n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  layout.buildings.forEach((b, i) => {
    e.set(0, b.rot, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(b.x, 0, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
    bm.setMatrixAt(i, m);
    aB.set([b.seed, b.floors, opts.litFrac ?? 0.07, b.style], i * 4);
  });
  boxGeo.setAttribute('aB', new THREE.InstancedBufferAttribute(aB, 4));
  bm.castShadow = true; bm.receiveShadow = true;
  bm.frustumCulled = false;
  group.add(bm);
  // roof machine rooms
  const roofMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x6f6e6a, roughness: 0.9 }), { key: 'roofbox' });
  const roofBoxes = [];
  for (const b of layout.buildings) {
    if (b.floors < 9) continue;
    const nSec = Math.max(1, Math.round(b.w / 24));
    for (let s = 0; s < nSec; s++) {
      const off = (s + 0.5) / nSec - 0.5;
      roofBoxes.push({ b, off, w: 4 + rnd() * 2, d: 5, h: 2.6 });
    }
  }
  const roofGeo = new THREE.BoxGeometry(1, 1, 1); roofGeo.translate(0, 0.5, 0);
  const rm = new THREE.InstancedMesh(roofGeo, roofMat, roofBoxes.length);
  roofBoxes.forEach((r, i) => {
    const b = r.b;
    e.set(0, b.rot, 0); q.setFromEuler(e);
    const lx = r.off * b.w;
    const x = b.x + Math.cos(b.rot) * lx, z = b.z - Math.sin(b.rot) * lx;
    m.compose(new THREE.Vector3(x, b.h, z), q, new THREE.Vector3(r.w, r.h, r.d));
    rm.setMatrixAt(i, m);
  });
  rm.castShadow = true; rm.frustumCulled = false;
  group.add(rm);
  // ground
  const groundTex = drawGround(layout, B);
  const lamps = lampPositions(layout);
  if (opts.lampsOff) lamps.forEach(l => l.on = false);
  const lampTex = drawLampMap(lamps, B, opts.lampGain ?? 1);
  ATM.uLampMap.value = lampTex; ATM.uLampMapOn.value = opts.lampsOff ? 0 : 1;
  ATM.uLampBounds.value.set(B.x0, B.z0, B.size, B.size);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const outer = new THREE.Color(0.03, 0.033, 0.026);
  patchMaterial(groundMat, {
    key: 'cityground',
    uniforms: { tGround: { value: groundTex }, uB: { value: new THREE.Vector4(B.x0, B.z0, B.size, B.size) }, uOuter: { value: outer }, tNoise: { value: noiseTex }, uSnowG: { value: opts.snow ?? 0 } },
    fragmentHeader: `precision highp sampler3D; uniform sampler2D tGround; uniform vec4 uB; uniform vec3 uOuter; uniform sampler3D tNoise; uniform float uSnowG;`,
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      {
        vec2 uv = (vWPos.xz - uB.xy) / uB.zw;
        vec3 gc = texture2D(tGround, uv).rgb;
        float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
        float n = texture(tNoise, vec3(vWPos.xz * 0.004, 0.5)).r;
        vec3 fieldC = uOuter * (0.6 + 0.8 * n);
        diffuseColor.rgb = mix(fieldC, gc, inside);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.6, 0.61, 0.64) * (0.85 + 0.2 * n), uSnowG);
      }`]],
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14000, 14000, 1, 1), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  group.add(ground);
  // lamps: poles + arms (instanced), luminaires as emissive boxes
  const poleGeo = new THREE.CylinderGeometry(0.11, 0.16, 9.5, 6); poleGeo.translate(0, 4.75, 0);
  const poleMat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0x8a8984, roughness: 0.8 }), { key: 'pole' });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, lamps.length);
  const armGeo = new THREE.BoxGeometry(0.08, 0.08, 2.0); armGeo.translate(0, 9.35, 1.0);
  const arms = new THREE.InstancedMesh(armGeo, poleMat, lamps.length);
  const lumGeo = new THREE.BoxGeometry(0.32, 0.16, 0.7); lumGeo.translate(0, 9.25, 2.0);
  const lumMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lums = new THREE.InstancedMesh(lumGeo, lumMat, lamps.length);
  const cHg = new THREE.Color(0.75, 1.0, 0.92).multiplyScalar(opts.lumGain ?? 60);
  const cNa = new THREE.Color(1.0, 0.55, 0.18).multiplyScalar(opts.lumGain ?? 60);
  const cOff = new THREE.Color(0.02, 0.02, 0.02);
  lamps.forEach((l, i) => {
    const yaw = Math.atan2(l.ax, l.az);
    e.set(0, yaw, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(l.x, 0, l.z), q, new THREE.Vector3(1, 1, 1));
    poles.setMatrixAt(i, m); arms.setMatrixAt(i, m); lums.setMatrixAt(i, m);
    lums.setColorAt(i, l.on ? (l.sodium ? cNa : cHg) : cOff);
  });
  for (const im of [poles, arms, lums]) { im.frustumCulled = false; group.add(im); }
  poles.castShadow = true;
  // lamp glow sprites (embedded halo, helps at distance where the luminaire is sub-pixel)
  const glowGeo = new THREE.BufferGeometry();
  const gp = [], gc = [];
  for (const l of lamps) if (l.on) { gp.push(l.x + l.ax * 2, 9.15, l.z + l.az * 2); const c = l.sodium ? cNa : cHg; gc.push(c.r, c.g, c.b); }
  glowGeo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
  glowGeo.setAttribute('color', new THREE.Float32BufferAttribute(gc, 3));
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uSize: { value: opts.glowSize ?? 1.0 }, uGain: { value: opts.glowGain ?? 1.0 }, uScale: { value: (ctx.RH || ctx.H) / 2 }, uFogDensity: ATM.uFogDensity },
    vertexShader: `attribute vec3 color; varying vec3 vC; varying float vR; uniform float uSize, uScale, uFogDensity;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        float ps = uSize * 1.6 * uScale * projectionMatrix[1][1] / -mv.z; gl_PointSize = clamp(ps, 2.5, 40.0); vR = clamp(ps / 2.5, 0.03, 1.0);
        vC = color * exp(-uFogDensity * 0.9 * -mv.z); }`,
    fragmentShader: `varying vec3 vC; varying float vR; uniform float uGain;
      void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p) * 2.0; if (r > 1.0) discard;
        float a = smoothstep(0.55, 0.0, r) + exp(-r * r * 7.0) * 0.3;
        gl_FragColor = vec4(vC * uGain * a * vR * vR * 0.05, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glows = new THREE.Points(glowGeo, glowMat);
  glows.frustumCulled = false;
  if (!opts.lampsOff) group.add(glows);
  // trees: along roads and in yards
  const treeMats = [makeTreeMaterial(7, opts.spring ?? 0.4), makeTreeMaterial(19, opts.spring ?? 0.4), makeTreeMaterial(31, opts.spring ?? 0.4)];
  const tgeo = treeGeometry();
  const trees = [[], [], []];
  for (const r of layout.roads) {
    const dx = r.b[0] - r.a[0], dz = r.b[1] - r.a[1];
    const L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = -uz, nz = ux;
    for (let s = 5; s < L; s += 9 + rnd() * 5) for (const side of [-1, 1]) {
      if (rnd() < 0.25) continue;
      const off = (r.w / 2 + 7 + rnd() * 3) * side;
      const tx = r.a[0] + ux * s + nx * off, tz = r.a[1] + uz * s + nz * off, tk = Math.floor(rnd() * 3), th = 9 + rnd() * 8;
      if (!skipTree(tx, tz)) trees[tk].push([tx, tz, th]);
    }
  }
  for (const b of layout.buildings) {
    const cnt = Math.floor(b.w / 9);
    for (let k = 0; k < cnt; k++) {
      const lx = (k + 0.5) / cnt * b.w - b.w / 2 + (rnd() - 0.5) * 4;
      const lz = (b.d / 2 + 8 + rnd() * 18) * (rnd() < 0.5 ? -1 : 1);
      const x = b.x + Math.cos(b.rot) * lx + Math.sin(b.rot) * lz, z = b.z - Math.sin(b.rot) * lx + Math.cos(b.rot) * lz;
      const tk = Math.floor(rnd() * 3), th = 8 + rnd() * 10;
      if (!skipTree(x, z)) trees[tk].push([x, z, th]);
    }
  }
  for (let ti = 0; ti < 3; ti++) {
    const list = trees[ti];
    const im = new THREE.InstancedMesh(tgeo, treeMats[ti], list.length);
    list.forEach(([x, z, h], i) => {
      e.set(0, rnd() * Math.PI, 0); q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(h * (0.75 + rnd() * 0.3), h, h * (0.75 + rnd() * 0.3)));
      im.setMatrixAt(i, m);
    });
    im.castShadow = true; im.frustumCulled = false;
    group.add(im);
  }
  return { group, layout, lamps, facadeMat, buildingsMesh: bm };
}

// ---------- forest (pines) for the countryside between Pripyat and the plant ----------
export function buildForest(ctx, { center = [1000, 1000], radius = 2500, count = 16000, exclude = [], seed = 3, tint = null } = {}) {
  const rnd = mulberry32(seed);
  const geo = new THREE.ConeGeometry(1, 1, 6, 1); geo.translate(0, 0.5, 0);
  const trunk = new THREE.CylinderGeometry(0.08, 0.1, 0.35, 4); trunk.translate(0, 0.0, 0);
  const mat = patchMaterial(new THREE.MeshStandardMaterial({ color: tint ? 0xffffff : 0x1a2318, roughness: 1.0, flatShading: true }), { key: 'pine' });
  const im = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let n = 0;
  for (let i = 0; i < count * 3 && n < count; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * radius;
    const x = center[0] + Math.cos(a) * r, z = center[1] + Math.sin(a) * r;
    let bad = false;
    for (const ex of exclude) { if (Math.hypot(x - ex[0], z - ex[1]) < ex[2]) { bad = true; break; } }
    if (bad) continue;
    // clumpy distribution
    const cl = Math.sin(x * 0.004 + 1.3) * Math.sin(z * 0.005 + 0.7);
    if (cl < -0.35 && rnd() < 0.8) continue;
    const h = 14 + rnd() * 12;
    e.set(0, rnd() * 6, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(x, 3 + rnd() * 2, z), q, new THREE.Vector3(h * 0.22, h, h * 0.22));
    if (tint) im.setColorAt(n, tint(x, z, rnd()));
    im.setMatrixAt(n++, m);
  }
  im.count = n;
  im.frustumCulled = false; im.castShadow = false; im.receiveShadow = true;
  return im;
}
