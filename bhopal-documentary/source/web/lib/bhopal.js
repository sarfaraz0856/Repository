// BHOPAL, 1984: the set. Old Bhopal (dense low-rise houses, lanes, the Taj-ul-Masajid by the Upper
// Lake), the JP Nagar basti across the road from the plant, and the Union Carbide pesticide plant
// with its buried MIC tanks, the vent gas scrubber stack and the flare tower.
// World axes: plant at the origin, +z is south (towards the old city), +x is east. Metres.
import * as THREE from 'three';
import { patchMaterial, ATM, makeSky } from './atmos.js';
import { mulberry32 } from './util.js';
import { mergeGeos } from './city.js';

export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const C = (r, g, b) => new THREE.Color(r, g, b);
export function lit(c, r = 0.9, m = 0, key = 'bh') { return patchMaterial(new THREE.MeshStandardMaterial({ color: Array.isArray(c) ? C(...c) : c, roughness: r, metalness: m }), { key }); }
function glow(c) { return new THREE.MeshBasicMaterial({ color: C(...c), fog: false }); }

// key places
export const STACK_TOP = V3(-12, 33, -72);        // vent gas scrubber atmospheric vent, where the MIC escaped
export const TANKS = V3(-44, 0, -62);              // the buried MIC storage tanks (E610, E611, E619)
export const ROAD_Z = 78;                          // the road between the plant and JP Nagar
export const MOSQUE = V3(-640, 0, 1960);           // Taj-ul-Masajid
export const LAKE = { x: -1750, z: 2350, rx: 1050, rz: 900 };
export const MOON = V3(-0.62, 0.36, -0.30).normalize(); // a waxing moon low in the west after midnight

export const inLake = (x, z) => ((x - LAKE.x) / LAKE.rx) ** 2 + ((z - LAKE.z) / LAKE.rz) ** 2 < 1;

// ---------------- houses ----------------
const WALLS = [[0.56, 0.53, 0.47], [0.55, 0.49, 0.33], [0.36, 0.43, 0.5], [0.55, 0.41, 0.38], [0.42, 0.24, 0.17], [0.4, 0.39, 0.36], [0.5, 0.5, 0.42], [0.3, 0.42, 0.36]];
function prismGeo() {
  // unit gable roof: base 1x1 at y=0, ridge along x at y=1
  const g = new THREE.BufferGeometry();
  const p = [-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 1, 0, -0.5, 1, 0, -0.5, 0, 0.5, 0.5, 0, 0.5];
  const idx = [0, 3, 2, 0, 2, 1, 4, 5, 2, 4, 2, 3, 0, 4, 3, 1, 2, 5];
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(idx);
  const ng = g.toNonIndexed(); ng.computeVertexNormals(); return ng;
}
// Winding arterial roads through the old city (polylines), with lamps along them.
export function makeRoads(seed = 9) {
  const rnd = mulberry32(seed), roads = [];
  for (let i = 0; i < 8; i++) {                         // north-south
    let x = -1250 + i * 390 + (rnd() - 0.5) * 120, z = 470, h = (rnd() - 0.5) * 0.3; const pts = [[x, z]];
    while (z < 3400) { h += (rnd() - 0.5) * 0.18; h *= 0.92; x += Math.sin(h) * 40; z += Math.cos(h) * 40; if (!inLake(x, z)) pts.push([x, z]); else break; }
    roads.push({ pts, w: 13 });
  }
  for (let j = 0; j < 5; j++) {                         // east-west
    let z = 900 + j * 560 + (rnd() - 0.5) * 120, x = -1500, h = Math.PI / 2 + (rnd() - 0.5) * 0.2; const pts = [];
    while (x < 1900) { h += (rnd() - 0.5) * 0.16; h = Math.PI / 2 + (h - Math.PI / 2) * 0.9; x += Math.sin(h) * 40; z += Math.cos(h) * 40; if (!inLake(x, z)) pts.push([x, z]); }
    roads.push({ pts, w: 12 });
  }
  return roads;
}
function roadIndex(roads) {
  const cell = 60, map = new Map();
  for (const r of roads) for (let i = 1; i < r.pts.length; i++) {
    const [ax, az] = r.pts[i - 1], [bx, bz] = r.pts[i];
    for (let cx = Math.floor(Math.min(ax, bx) / cell) - 1; cx <= Math.floor(Math.max(ax, bx) / cell) + 1; cx++)
      for (let cz = Math.floor(Math.min(az, bz) / cell) - 1; cz <= Math.floor(Math.max(az, bz) / cell) + 1; cz++) {
        const k = cx + ',' + cz; if (!map.has(k)) map.set(k, []); map.get(k).push([ax, az, bx, bz, r.w]);
      }
  }
  return (x, z) => {
    const l = map.get(Math.floor(x / cell) + ',' + Math.floor(z / cell)); if (!l) return 1e9;
    let best = 1e9;
    for (const [ax, az, bx, bz, w] of l) {
      const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t) - w / 2);
    }
    return best;
  };
}
// Returns {group, windows:[{p,n}], count}
export function buildHouses(ctx, { regions, seed = 3, litFrac = 0.04, roads = [] }) {
  const rnd = mulberry32(seed);
  const boxes = [], roofs = [], wins = [];
  const roadD = roadIndex(roads);
  const emit = (R, cx, cz, ry, plot) => {
    const { storeys = [1, 3], tin = 0 } = R;
    if (inLake(cx, cz) || (R.skip && R.skip(cx, cz)) || roadD(cx, cz) < plot * 0.45) return;
    if (rnd() < (R.empty ?? 0.05)) return;
    const w = plot * (0.72 + rnd() * 0.26), d = plot * (0.72 + rnd() * 0.26);
    const ns = storeys[0] + Math.floor(rnd() * (storeys[1] - storeys[0] + 1) * rnd());
    const shack = rnd() < tin;
    const h = shack ? 2.3 + rnd() * 0.5 : ns * 3.05 + 0.6 + rnd() * 0.4;
    ry += (rnd() - 0.5) * 0.08;
    const wc = WALLS[Math.floor(rnd() * WALLS.length)]; const v = 0.75 + rnd() * 0.35;
    const col = shack ? [0.32 * v, 0.26 * v, 0.2 * v] : [wc[0] * v, wc[1] * v, wc[2] * v];
    boxes.push({ x: cx, z: cz, w, d, h, ry, col });
    if (shack) roofs.push({ x: cx, z: cz, w: w + 0.5, d: d + 0.4, y: h, h: 0.9 + rnd() * 0.4, ry: ry + (rnd() < 0.5 ? 0 : Math.PI / 2), col: rnd() < 0.6 ? [0.2, 0.2, 0.21] : [0.3, 0.14, 0.09] });
    else if (rnd() < 0.3) boxes.push({ x: cx + (rnd() - 0.5) * w * 0.4, z: cz + (rnd() - 0.5) * d * 0.4, w: 2.6, d: 2.8, h: h + 2.6, ry, col });
    const nearRoad = roadD(cx, cz) < plot * 1.6;
    if (rnd() < litFrac * (shack ? 0.6 : 1) * (nearRoad ? 3 : 1)) {
      const side = Math.floor(rnd() * 4); const a = ry + side * Math.PI / 2;
      const n = V3(Math.sin(a), 0, Math.cos(a)); const half = (side % 2 ? w : d) * 0.5 + 0.03;
      const fl = shack ? 0 : Math.floor(rnd() * ns);
      const tng = V3(n.z, 0, -n.x).multiplyScalar((rnd() - 0.5) * (side % 2 ? d : w) * 0.5);
      wins.push({ p: V3(cx, 1.2 + fl * 3.05 + (shack ? -0.2 : 0), cz).addScaledVector(n, half).add(tng), n, warm: rnd() < 0.8, k: 0.5 + rnd() });
    }
  };
  for (const R of regions) {
    const { x0, x1, z0, z1, plot, street = 8 } = R;
    // the region is split into neighbourhoods (Voronoi cells), each with its own street grid angle
    const np = R.patches || 1;
    const seeds = Array.from({ length: np }, (_, i) => ({ x: np === 1 ? (x0 + x1) / 2 : x0 + rnd() * (x1 - x0), z: np === 1 ? (z0 + z1) / 2 : z0 + rnd() * (z1 - z0), a: (R.rot ?? 0) + (np === 1 ? 0 : (rnd() - 0.5) * 1.2), p: plot * (0.88 + rnd() * 0.24) }));
    const nearest = (x, z) => { let b = 0, bd = 1e18; for (let i = 0; i < np; i++) { const d = (seeds[i].x - x) ** 2 + (seeds[i].z - z) ** 2; if (d < bd) { bd = d; b = i; } } return b; };
    const reach = np === 1 ? Math.hypot(x1 - x0, z1 - z0) / 2 + 10 : Math.sqrt((x1 - x0) * (z1 - z0) / np) * 1.6;
    seeds.forEach((sd, si) => {
      const ca = Math.cos(sd.a), sa = Math.sin(sd.a), p = sd.p; const n = Math.ceil(reach / p);
      for (let i = -n; i <= n; i++) {
        if (((i % street) + street) % street === street - 1) continue;
        for (let j = -n; j <= n; j++) {
          if (((j % street) + street) % street === street - 1) continue;
          const lx = i * p + (rnd() - 0.5) * p * 0.22, lz = j * p + (rnd() - 0.5) * p * 0.22;
          const x = sd.x + lx * ca + lz * sa, z = sd.z - lx * sa + lz * ca;
          if (x < x0 || x > x1 || z < z0 || z > z1) continue;
          if (np > 1 && nearest(x, z) !== si) continue;
          emit(R, x, z, sd.a, p);
        }
      }
    });
  }
  const group = new THREE.Group();
  const bg = new THREE.BoxGeometry(1, 1, 1); bg.translate(0, 0.5, 0);
  const bm = lit([1, 1, 1], 0.95, 0, 'bhhouse');
  const bi = new THREE.InstancedMesh(bg, bm, boxes.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = V3(1, 1, 1), p = V3(0, 0, 0), up = V3(0, 1, 0), col = new THREE.Color();
  boxes.forEach((b, i) => { q.setFromAxisAngle(up, b.ry); m4.compose(p.set(b.x, 0, b.z), q, s.set(b.w, b.h, b.d)); bi.setMatrixAt(i, m4); bi.setColorAt(i, col.setRGB(...b.col)); });
  bi.receiveShadow = true; bi.castShadow = !!(ctx.houseShadows); group.add(bi);
  if (roofs.length) {
    const rm = lit([1, 1, 1], 0.6, 0.3, 'bhroof'); rm.side = THREE.DoubleSide;
    const ri = new THREE.InstancedMesh(prismGeo(), rm, roofs.length);
    roofs.forEach((r, i) => { q.setFromAxisAngle(up, r.ry); m4.compose(p.set(r.x, r.y, r.z), q, s.set(r.w, r.h, r.d)); ri.setMatrixAt(i, m4); ri.setColorAt(i, col.setRGB(...r.col)); });
    ri.receiveShadow = true; group.add(ri);
  }
  if (wins.length) {
    const wg = new THREE.PlaneGeometry(0.9, 1.15);
    const wm = glow([1, 1, 1], 'bhwin');
    const wi = new THREE.InstancedMesh(wg, wm, wins.length);
    wins.forEach((w, i) => {
      q.setFromUnitVectors(V3(0, 0, 1), w.n); m4.compose(w.p, q, s.set(1, 1, 1)); wi.setMatrixAt(i, m4);
      const k = w.k * 2.2; wi.setColorAt(i, w.warm ? col.setRGB(1.0 * k, 0.62 * k, 0.28 * k) : col.setRGB(0.75 * k, 0.9 * k, 1.0 * k));
    });
    group.add(wi);
  }
  return { group, count: boxes.length, windows: wins };
}

// ---------------- trees (neem / peepal crowns) ----------------
export function buildTrees(ctx, { list }) {
  const g = new THREE.Group(); const n = list.length; if (!n) return g;
  const blob = (r, x, y, z) => { const b = new THREE.IcosahedronGeometry(r, 1); b.translate(x, y, z); return b; };
  const crown = mergeGeos([blob(0.75, 0, 0, 0), blob(0.55, 0.55, -0.15, 0.2), blob(0.6, -0.45, -0.1, -0.3), blob(0.5, 0.1, 0.35, 0.35), blob(0.45, -0.2, -0.3, 0.5)]);
  const trunk = new THREE.CylinderGeometry(0.18, 0.28, 1, 6); trunk.translate(0, 0.5, 0);
  const cm = lit([1, 1, 1], 0.95, 0, 'bhcrown'), tm = lit([0.08, 0.06, 0.045], 0.95, 0, 'bhtrunk');
  const ci = new THREE.InstancedMesh(crown, cm, n), ti = new THREE.InstancedMesh(trunk, tm, n);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  list.forEach((t, i) => {
    const r = t.r, h = t.h;
    m4.compose(V3(t.x, h - r * 0.35, t.z), q.setFromAxisAngle(V3(0, 1, 0), t.x * 0.3), V3(r * 1.15, r * 0.8, r)); ci.setMatrixAt(i, m4);
    ci.setColorAt(i, col.setRGB(0.05 + 0.03 * Math.sin(t.x), 0.09 + 0.03 * Math.cos(t.z), 0.035));
    m4.compose(V3(t.x, 0, t.z), q.identity(), V3(1, h - r * 0.9, 1)); ti.setMatrixAt(i, m4);
  });
  ci.castShadow = false; ci.receiveShadow = true; g.add(ci, ti);
  return g;
}

// ---------------- Taj-ul-Masajid ----------------
export function buildMosque() {
  const g = new THREE.Group();
  const stone = lit([0.42, 0.2, 0.15], 0.85, 0, 'bhstone'), white = lit([0.62, 0.6, 0.56], 0.6, 0, 'bhwhite');
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(130, 3, 110), stone, 0, 1.5, 10);                    // plinth
  add(new THREE.BoxGeometry(110, 18, 34), stone, 0, 12, -28);                     // prayer hall
  for (let i = -1; i <= 1; i++) {                                                 // three domes on drums
    add(new THREE.CylinderGeometry(i ? 8 : 11, i ? 8 : 11, 5, 20), white, i * 30, 23.5, -28);
    const d = add(new THREE.SphereGeometry(i ? 9 : 12.5, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), white, i * 30, 26, -28); d.scale.y = 1.25;
    add(new THREE.ConeGeometry(0.6, 5, 8), white, i * 30, 26 + (i ? 9 : 12.5) * 1.25 + 2, -28);
  }
  for (const sx of [-1, 1]) {                                                     // two great minarets
    const x = sx * 62, z = -28;
    add(new THREE.CylinderGeometry(4.2, 5.0, 56, 8), stone, x, 31, z);
    for (const y of [22, 40, 56]) add(new THREE.CylinderGeometry(5.6, 5.6, 1.2, 8), white, x, y, z);
    add(new THREE.CylinderGeometry(3.4, 3.4, 6, 8), white, x, 62, z);
    const d = add(new THREE.SphereGeometry(3.8, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), white, x, 65, z); d.scale.y = 1.4;
    add(new THREE.ConeGeometry(0.4, 4, 6), white, x, 71.5, z);
  }
  for (const [x, z, w, d] of [[-60, 40, 6, 70], [60, 40, 6, 70], [0, 72, 126, 6]]) add(new THREE.BoxGeometry(w, 9, d), stone, x, 7.5, z); // courtyard cloisters
  g.position.copy(MOSQUE); g.rotation.y = 0.15;
  return g;
}

// ---------------- the Union Carbide plant ----------------
function cyl(r, h, m, seg = 16) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, m) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.castShadow = true; o.receiveShadow = true; return o; }
function pipe(a, b, r, m) {
  const d = b.clone().sub(a); const L = d.length();
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), m); o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); o.castShadow = true; return o;
}
function frame(g, x, z, nx, nz, nl, bay, lh, m, deckM) {
  // a steel structure: columns, beams and grating decks
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) { const c = box(0.35, nl * lh, 0.35, m); c.position.set(x + i * bay, nl * lh / 2, z + j * bay); g.add(c); }
  for (let l = 1; l <= nl; l++) {
    const y = l * lh;
    for (let i = 0; i <= nx; i++) { const b = box(0.25, 0.35, nz * bay, m); b.position.set(x + i * bay, y, z + nz * bay / 2); g.add(b); }
    for (let j = 0; j <= nz; j++) { const b = box(nx * bay, 0.35, 0.25, m); b.position.set(x + nx * bay / 2, y, z + j * bay); g.add(b); }
    if (deckM && l < nl) { const dk = box(nx * bay, 0.08, nz * bay, deckM); dk.position.set(x + nx * bay / 2, y + 0.2, z + nz * bay / 2); g.add(dk); }
  }
}
export function buildPlant(ctx) {
  const g = new THREE.Group(); const rnd = mulberry32(84);
  const steel = lit([0.22, 0.23, 0.24], 0.55, 0.6, 'bhsteel'), rust = lit([0.25, 0.16, 0.1], 0.7, 0.3, 'bhrust');
  const conc = lit([0.42, 0.41, 0.38], 0.95, 0, 'bhconc'), paint = lit([0.6, 0.6, 0.57], 0.6, 0.2, 'bhpaint');
  const green = lit([0.18, 0.26, 0.2], 0.7, 0.2, 'bhgreen'), yellow = lit([0.55, 0.45, 0.12], 0.6, 0.2, 'bhyel');
  const earth = lit([0.19, 0.16, 0.12], 1.0, 0, 'bhearth'), shed = lit([0.33, 0.33, 0.32], 0.5, 0.5, 'bhshed');
  const shedD = lit([0.33, 0.33, 0.32], 0.5, 0.5, 'bhshedd'); shedD.side = THREE.DoubleSide;
  const lamps = [];
  // concrete yard
  const yard = box(520, 0.2, 440, lit([0.2, 0.195, 0.18], 0.95, 0, 'bhyard')); yard.position.set(0, 0.1, -150); yard.castShadow = false; g.add(yard);
  // boundary wall, gate on the south side
  for (const [x, z, w, d] of [[-255, -150, 1, 440], [255, -150, 1, 440], [0, -370, 510, 1], [-145, 70, 220, 1], [145, 70, 220, 1]]) { const wl = box(w, 2.6, d, conc); wl.position.set(x, 1.3, z); g.add(wl); }
  // MIC storage: three horizontal tanks under a concrete bunker with an earth mound
  const bunker = box(34, 2.2, 22, conc); bunker.position.set(TANKS.x, 1.1, TANKS.z); g.add(bunker);
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(19, 25, 2, 4, 1), earth); mound.rotation.y = Math.PI / 4; mound.scale.set(1.1, 1, 0.75); mound.position.set(TANKS.x, 0.9, TANKS.z); g.add(mound);
  for (let k = -1; k <= 1; k++) {
    const man = cyl(0.8, 0.9, paint); man.position.set(TANKS.x + k * 9, 2.6, TANKS.z); g.add(man);
    const v = cyl(0.12, 3, steel, 8); v.position.set(TANKS.x + k * 9 + 1.2, 3.6, TANKS.z - 1.5); g.add(v);
    g.add(pipe(V3(TANKS.x + k * 9 + 1.2, 5.1, TANKS.z - 1.5), V3(TANKS.x + k * 9 + 1.2, 5.1, TANKS.z - 9), 0.12, steel));
  }
  // MIC production structure north of the tanks
  frame(g, -66, -128, 4, 3, 4, 6, 6, steel, lit([0.16, 0.16, 0.16], 0.8, 0.5, 'bhdeck'));
  for (const [x, y, z, r, h] of [[-60, 6, -122, 1.6, 8], [-52, 6, -116, 1.2, 10], [-44, 12, -122, 1.0, 9], [-58, 18, -112, 0.9, 6], [-48, 0, -110, 2.0, 12]]) { const v = cyl(r, h, paint); v.position.set(x, y + h / 2, z); g.add(v); }
  // the vent gas scrubber and its atmospheric vent stack (~33 m), and the flare tower
  const vgsBase = box(6, 1.2, 6, conc); vgsBase.position.set(STACK_TOP.x, 0.6, STACK_TOP.z); g.add(vgsBase);
  const vgs = cyl(1.3, 17, paint, 20); vgs.position.set(STACK_TOP.x, 9.7, STACK_TOP.z); g.add(vgs);
  const stack = cyl(0.42, STACK_TOP.y - 18, steel, 12); stack.position.set(STACK_TOP.x, 18 + (STACK_TOP.y - 18) / 2, STACK_TOP.z); g.add(stack);
  for (let y = 4; y < STACK_TOP.y; y += 3.2) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 4, 16), steel); ring.rotation.x = Math.PI / 2; ring.position.set(STACK_TOP.x, y, STACK_TOP.z); if (y < 18) g.add(ring); }
  const lad = box(0.5, STACK_TOP.y, 0.08, steel); lad.position.set(STACK_TOP.x + 1.5, STACK_TOP.y / 2, STACK_TOP.z); g.add(lad);
  const flare = cyl(0.55, 34, steel, 12); flare.position.set(14, 17, -96); g.add(flare);
  for (let k = 0; k < 3; k++) { const a = k * 2.1; g.add(pipe(V3(14 + Math.cos(a) * 9, 0, -96 + Math.sin(a) * 9), V3(14, 26, -96), 0.08, steel)); } // guy wires
  // relief headers from the tanks to the scrubber, pipe racks across the plant
  g.add(pipe(V3(TANKS.x + 9, 5.1, TANKS.z - 9), V3(STACK_TOP.x, 5.1, TANKS.z - 9), 0.3, rust));
  g.add(pipe(V3(STACK_TOP.x, 5.1, TANKS.z - 9), V3(STACK_TOP.x, 5.1, STACK_TOP.z - 1.4), 0.3, rust));
  g.add(pipe(V3(STACK_TOP.x, 5.1, STACK_TOP.z - 1.4), V3(STACK_TOP.x, 1.8, STACK_TOP.z - 1.4), 0.3, rust));
  g.add(pipe(V3(STACK_TOP.x + 0.9, 17, STACK_TOP.z), V3(14, 17, -96), 0.22, rust));
  for (const [x0, z0, x1, z1] of [[-200, -40, 200, -40], [40, -200, 40, -40], [-200, -180, 40, -180]]) {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 8);
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n;
      const bent = box(Math.abs(z1 - z0) > 1 ? 5 : 0.3, 0.3, Math.abs(z1 - z0) > 1 ? 0.3 : 5, steel); bent.position.set(x, 6, z); g.add(bent);
      for (const o of [-2.4, 2.4]) { const c = box(0.3, 6, 0.3, steel); c.position.set(x + (Math.abs(z1 - z0) > 1 ? o : 0), 3, z + (Math.abs(z1 - z0) > 1 ? 0 : o)); g.add(c); }
    }
    for (const [o, r, m] of [[-1.5, 0.35, rust], [-0.4, 0.25, steel], [0.6, 0.45, paint], [1.6, 0.2, yellow]]) {
      const a = V3(x0 + (Math.abs(z1 - z0) > 1 ? o : 0), 6.5 + r, z0 + (Math.abs(z1 - z0) > 1 ? 0 : o)), b = V3(x1 + (Math.abs(z1 - z0) > 1 ? o : 0), 6.5 + r, z1 + (Math.abs(z1 - z0) > 1 ? 0 : o));
      g.add(pipe(a, b, r, m));
    }
  }
  // the Sevin (carbaryl) unit: a tall steel and sheet building with towers
  const sevin = box(56, 20, 34, shed); sevin.position.set(110, 10, -150); g.add(sevin);
  frame(g, 70, -120, 3, 2, 5, 6, 6, steel, null);
  for (const [x, z, r, h] of [[150, -120, 2.2, 30], [158, -128, 1.6, 26], [86, -186, 3, 14]]) { const t = cyl(r, h, paint); t.position.set(x, h / 2, z); g.add(t); }
  // tank farm and spheres
  for (let i = 0; i < 6; i++) { const t = cyl(6, 10, i % 3 ? paint : green, 24); t.position.set(150 + (i % 3) * 16, 5, -40 - Math.floor(i / 3) * 18); g.add(t); }
  for (let i = 0; i < 2; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 14), paint); s.position.set(-150 + i * 16, 8, -60); s.castShadow = true; g.add(s); for (let k = 0; k < 4; k++) { const l = cyl(0.3, 4, steel, 6); l.position.set(-150 + i * 16 + Math.cos(k * 1.57) * 4, 2, -60 + Math.sin(k * 1.57) * 4); g.add(l); } }
  // warehouses with pitched sheet roofs
  for (let i = 0; i < 3; i++) {
    const w = box(60, 8, 22, conc); w.position.set(-160, 4, -170 - i * 34); g.add(w);
    const r = new THREE.Mesh(prismGeo(), shedD); r.scale.set(62, 4, 24); r.position.set(-160, 8, -170 - i * 34); r.castShadow = true; g.add(r);
  }
  // control room / offices near the gate with a few lit windows
  const off = box(60, 7.5, 16, lit([0.5, 0.49, 0.45], 0.9, 0, 'bhoff')); off.position.set(70, 3.75, 30); g.add(off);
  const wm = glow([1.6, 1.25, 0.8], 'bhoffwin');
  for (let i = 0; i < 9; i++) if (rnd() < 0.55) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), wm); w.position.set(46 + i * 6, 2.0 + (i % 2) * 3.4, 38.05); g.add(w); }
  // more process units with vessels, and small sodium lamps on the structures
  const lampsOn = [];
  for (const [x, z, nx, nz, nl] of [[-130, -122, 3, 2, 3], [10, -175, 3, 3, 4], [-70, -235, 4, 2, 3], [100, -250, 3, 2, 4], [-200, -110, 2, 2, 2], [170, -200, 2, 3, 3]]) {
    frame(g, x, z, nx, nz, nl, 6, 6, steel, lit([0.16, 0.16, 0.16], 0.8, 0.5, 'bhdeck'));
    for (let k = 0; k < 3; k++) { const r = 0.9 + rnd() * 1.4, h = 6 + rnd() * 10, v = cyl(r, h, rnd() < 0.5 ? paint : green); v.position.set(x + 3 + rnd() * (nx * 6 - 6), h / 2 + (rnd() < 0.4 ? 6 : 0), z + 3 + rnd() * (nz * 6 - 6)); g.add(v); }
    for (let l = 1; l <= nl; l++) lampsOn.push([x + rnd() * nx * 6, l * 6 + 0.6, z + (rnd() < 0.5 ? 0 : nz * 6)]);
    lamps.push({ x: x + nx * 3, z: z + nz * 3, on: true, sodium: true, r: 34 });
  }
  for (let i = 0; i < 40; i++) { const d = cyl(0.3, 0.9, i % 3 ? [rust, paint, green][i % 3] : yellow, 10); d.position.set(-20 + (i % 8) * 0.75, 0.45, -30 - Math.floor(i / 8) * 0.75); g.add(d); }
  for (const [x, z] of [[-20, -96], [-28, -100], [-4, -48], [6, -52]]) { const t = cyl(1.4, 4.5, paint, 14); t.rotation.z = Math.PI / 2; t.position.set(x, 1.6, z); g.add(t); }
  lampsOn.push([STACK_TOP.x + 1.6, 18.4, STACK_TOP.z], [TANKS.x - 10, 3.6, TANKS.z + 9], [TANKS.x + 12, 3.6, TANKS.z + 9], [-66, 24.4, -128], [-42, 24.4, -110], [14, 30, -96]);
  const slm = glow([10, 5.2, 1.8]);
  for (const [x, y, z] of lampsOn) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.3), slm); b.position.set(x, y, z); g.add(b); }
  g.userData.structLamps = lampsOn;
  // water tower
  const wt = cyl(5, 6, conc, 20); wt.position.set(-200, 24, 0); g.add(wt);
  for (let k = 0; k < 6; k++) { const l = cyl(0.35, 21, conc, 6); l.position.set(-200 + Math.cos(k * 1.05) * 3.8, 10.5, Math.sin(k * 1.05) * 3.8); g.add(l); }
  // lamps: pole lamps along the plant roads and the main road outside
  const bulbs = [];
  for (let x = -230; x <= 230; x += 46) for (const z of [-20, -210, -330]) { lamps.push({ x, z, on: rnd() < 0.85, sodium: true, r: 26 }); bulbs.push([x, 9, z, 1]); }
  for (let x = -600; x <= 600; x += 40) { lamps.push({ x, z: ROAD_Z + 7, on: rnd() < 0.7, sodium: rnd() < 0.6, r: 22 }); bulbs.push([x, 8, ROAD_Z + 7, lamps[lamps.length - 1].on ? 1 : 0, lamps[lamps.length - 1].sodium]); }
  const poleM = lit([0.15, 0.15, 0.15], 0.6, 0.5, 'bhpole');
  const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.09, 0.12, 9, 6).translate(0, 4.5, 0), poleM, bulbs.length);
  const bulbG = new THREE.SphereGeometry(0.28, 8, 6), bS = glow([1, 1, 1], 'bhbulb'), bI = new THREE.InstancedMesh(bulbG, bS, bulbs.length);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  bulbs.forEach((b, i) => {
    m4.makeTranslation(b[0], 0, b[2]); poles.setMatrixAt(i, m4); m4.makeTranslation(b[0], b[1], b[2]); bI.setMatrixAt(i, m4);
    bI.setColorAt(i, b[3] ? (b[4] === false ? col.setRGB(6, 7.5, 7) : col.setRGB(9, 4.6, 1.6)) : col.setRGB(0.05, 0.05, 0.05));
  });
  g.add(poles, bI);
  return { group: g, lamps };
}

// ---------------- the lamp light map ----------------
export function lampMap(lamps, B) {
  const S = 2048, c = document.createElement('canvas'); c.width = c.height = S; const gx = c.getContext('2d');
  gx.fillStyle = 'black'; gx.fillRect(0, 0, S, S); gx.globalCompositeOperation = 'lighter';
  const k = S / B.size;
  for (const l of lamps) {
    if (!l.on) continue;
    const x = (l.x - B.x0) * k, z = (l.z - B.z0) * k, r = (l.r || 20) * k;
    const grd = gx.createRadialGradient(x, z, 0, x, z, r); const cc = l.sodium ? [255, 150, 60] : [170, 205, 190];
    grd.addColorStop(0, `rgba(${cc},0.6)`); grd.addColorStop(0.35, `rgba(${cc},0.26)`); grd.addColorStop(1, 'rgba(0,0,0,0)');
    gx.fillStyle = grd; gx.beginPath(); gx.arc(x, z, r, 0, 7); gx.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

// ---------------- the world ----------------
export function bhopalWorld(ctx, { focal = 35, near = 1, far = 9000, city = true, basti = true, oldCity = true, mosque = true, moon = 0.22, fog = 0.0011, litFrac = 0.04, lampGain = 3.0, laneCut = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, ctx.aspect, near, far);
  const sky = makeSky({ noiseTex: ctx.noiseTex }); scene.add(sky);
  ATM.uMoonDir.value.copy(MOON);
  sky.uniforms.uCloudCover.value = 0.28; sky.uniforms.uCloudLit.value.setRGB(0.02, 0.022, 0.03); sky.uniforms.uMoonCol.value.setRGB(0.3, 0.31, 0.33);
  sky.uniforms.uSkyGlowDir.value.set(0, 0, 1); sky.uniforms.uSkyGlowCol.value.setRGB(0.012, 0.007, 0.003); sky.uniforms.uSkyGlowPow.value = 3;
  sky.uniforms.uHorizon.value.setRGB(0.009, 0.0095, 0.012);
  // ground
  const gm = lit([0.075, 0.066, 0.052], 1.0, 0, 'bhground');
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14000, 14000), gm); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 1500); ground.receiveShadow = true; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(2400, 11), lit([0.03, 0.03, 0.032], 0.8, 0, 'bhroad')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.04, ROAD_Z); road.receiveShadow = true; scene.add(road);
  // lake
  const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 64), lit([0.01, 0.012, 0.016], 0.08, 0.6, 'bhlake'));
  lake.rotation.x = -Math.PI / 2; lake.scale.set(LAKE.rx, LAKE.rz, 1); lake.position.set(LAKE.x, 0.05, LAKE.z); scene.add(lake);
  const plant = buildPlant(ctx); scene.add(plant.group);
  const lamps = plant.lamps.slice();
  const rnd = mulberry32(17);
  if (city) {
    const regions = [];
    if (basti) regions.push({ x0: -320, x1: 340, z0: ROAD_Z + 14, z1: 470, plot: 6.2, street: 9, main: 40, storeys: [1, 1], tin: 0.75, empty: 0.03, rot: 0.03, skip: laneCut ? (x, z) => Math.abs(x) < 13 && z < 216 : null });
    if (oldCity) {
      const skipMosque = (x, z) => Math.hypot(x - MOSQUE.x, z - MOSQUE.z) < 110;
      regions.push({ x0: -1500, x1: 1700, z0: 480, z1: 1500, plot: 9, street: 7, storeys: [1, 3], tin: 0.25, rot: -0.05, patches: 26, skip: skipMosque });
      regions.push({ x0: -1500, x1: 1900, z0: 1500, z1: 3400, plot: 10.5, street: 7, storeys: [1, 3], tin: 0.12, rot: 0.08, patches: 40, skip: skipMosque });
      regions.push({ x0: -1400, x1: 1600, z0: -1400, z1: -420, plot: 13, street: 6, storeys: [1, 2], tin: 0.3, empty: 0.35, patches: 12 });
    }
    const roads = oldCity ? makeRoads(9) : [];
    const H = buildHouses(ctx, { regions, seed: 5, litFrac, roads });
    scene.add(H.group);
    // the arterial roads: asphalt ribbons with lamps every ~32 m (many dark in 1984)
    const rm = lit([0.028, 0.028, 0.03], 0.85, 0, 'bhroad2'); const bulbs = [];
    for (const r of roads) {
      const pos = [], idx = []; let acc = 0;
      for (let i = 0; i < r.pts.length; i++) {
        const [x, z] = r.pts[i], [nx, nz] = r.pts[Math.min(i + 1, r.pts.length - 1)], [px, pz] = r.pts[Math.max(i - 1, 0)];
        let dx = nx - px, dz = nz - pz; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
        pos.push(x - dz * r.w / 2, 0.05, z + dx * r.w / 2, x + dz * r.w / 2, 0.05, z - dx * r.w / 2);
        if (i) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i);
        if (i) acc += Math.hypot(x - px, z - pz);
        if (acc > 32) { acc = 0; const sd = (bulbs.length % 2 ? 1 : -1) * (r.w / 2 + 1); const lx = x - dz * sd, lz = z + dx * sd; const on = rnd() < 0.72, sod = rnd() < 0.6;
          lamps.push({ x: lx, z: lz, on, sodium: sod, r: 20 }); bulbs.push([lx, lz, on, sod]); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, rm); m.receiveShadow = true; scene.add(m);
    }
    if (bulbs.length) {
      const bI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 8, 6), glow([1, 1, 1]), bulbs.length), m4 = new THREE.Matrix4(), cc = new THREE.Color();
      bulbs.forEach((b, i) => { m4.makeTranslation(b[0], 8, b[1]); bI.setMatrixAt(i, m4); bI.setColorAt(i, b[2] ? (b[3] ? cc.setRGB(9, 4.6, 1.6) : cc.setRGB(6, 7.5, 7)) : cc.setRGB(0.03, 0.03, 0.03)); });
      scene.add(bI);
    }
    const trees = [];
    for (let i = 0; i < 2600; i++) { const x = -1700 + rnd() * 3600, z = -500 + rnd() * 3900; if (inLake(x, z) || (Math.abs(x) < 260 && z < 75 && z > -380)) continue; trees.push({ x, z, r: 3 + rnd() * 4, h: 7 + rnd() * 7 }); }
    scene.add(buildTrees(ctx, { list: trees }));
  }
  if (mosque) scene.add(buildMosque());
  const B = { x0: -2000, z0: -900, size: 4600 };
  ATM.uLampMap.value = lampMap(lamps, B); ATM.uLampMapOn.value = 1; ATM.uLampGain.value = lampGain;
  ATM.uLampBounds.value.set(B.x0, B.z0, B.size, B.size);
  // moon + sky light
  const ml = new THREE.DirectionalLight(C(0.62, 0.7, 0.95), moon);
  ml.position.copy(MOON).multiplyScalar(3000); ml.target.position.set(0, 0, 0);
  ml.castShadow = true; ml.shadow.mapSize.set(4096, 4096);
  const sc = ml.shadow.camera; sc.left = -420; sc.right = 420; sc.top = 420; sc.bottom = -420; sc.near = 1500; sc.far = 4600; ml.shadow.bias = -0.0008; ml.shadow.normalBias = 1.0;
  scene.add(ml, ml.target);
  scene.add(new THREE.HemisphereLight(C(0.09, 0.1, 0.14), C(0.025, 0.02, 0.015), 0.35));
  // plant floodlights (sodium)
  for (const [pos, tgt, I] of [[[-20, 26, -10], [-40, 0, -70], 9e5], [[60, 24, -100], [40, 0, -150], 7e5], [[-90, 22, -150], [-60, 6, -110], 7e5], [[0, 20, 30], [10, 0, -30], 4e5], [[-120, 18, -60], [-120, 0, -120], 5e5], [[40, 18, -220], [60, 0, -260], 5e5]]) {
    const sp = new THREE.SpotLight(C(1.0, 0.56, 0.22), I / 220, 0, THREE.MathUtils.degToRad(38), 0.75, 2);
    sp.position.set(...pos); sp.target.position.set(...tgt); scene.add(sp, sp.target);
  }
  // hazy winter night
  ATM.uFogColor.value.setRGB(0.006, 0.0062, 0.0075); ATM.uFogDensity.value = fog; ATM.uFogHeight.value = 120; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.set(0, 0, 1); ATM.uGlowCol.value.setRGB(0.004, 0.0024, 0.0012); ATM.uGlowPow.value = 3;
  ATM.uMoonHalo.value.setRGB(0.012, 0.013, 0.016); ATM.uFirePos.value.set(0, -1e5, 0); ATM.uFireFog.value.setRGB(0, 0, 0);
  return { scene, camera, sky, plant, moonLight: ml };
}
