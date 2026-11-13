// The New Safe Confinement: a steel arch 257 m wide, 108 m high and 162 m long, with stainless
// outer cladding, an inner skin, and the 12 m deep lattice truss between them showing at the ends.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { patchMaterial } from './atmos.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// arch profile across the span: z from -S/2 to S/2, y = H (1 - (2z/S)^2)^k
function profile(S, H, n, k = 0.55) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const u = -1 + 2 * i / n; const z = u * S / 2; pts.push([z, H * Math.pow(Math.max(0, 1 - u * u), k)]); }
  return pts;
}
// a skin: the profile swept along x over the arch's length
function skin(pts, L, flip) {
  const g = new THREE.BufferGeometry(); const pos = [], uv = [], idx = [];
  const n = pts.length;
  let acc = 0; const along = [0];
  for (let i = 1; i < n; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); along.push(acc); }
  for (const x of [-L / 2, L / 2]) for (let i = 0; i < n; i++) { pos.push(x, pts[i][1], pts[i][0]); uv.push(x + L / 2, along[i]); }
  for (let i = 0; i < n - 1; i++) { const a = i, b = i + 1, c = n + i, d = n + i + 1; if (flip) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function tube(a, b, r) {
  const d = b.clone().sub(a), L = d.length();
  const g = new THREE.CylinderGeometry(r, r, L, 6, 1, true); g.translate(0, L / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize())); g.translate(a.x, a.y, a.z);
  return g;
}

export function makeArch({ S = 257, H = 108, L = 162, depth = 12, clad = 1 } = {}) {
  const g = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.62, 0.64, 0.66), roughness: 0.32, metalness: 0.85, side: THREE.DoubleSide });
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); white.needsUpdate = true;
  steel.map = white;            // only so that the shader gets UVs (vMapUv) for the panel seams
  patchMaterial(steel, {
    key: 'nsc', uniforms: { uClad: { value: clad } },
    fragmentHeader: 'uniform float uClad;',
    fragmentReplace: [['#include <color_fragment>', `#include <color_fragment>
      { vec2 q = vMapUv; float seamA = smoothstep(0.0, 0.06, abs(fract(q.x / 6.0) - 0.5) - 0.48), seamB = smoothstep(0.0, 0.08, abs(fract(q.y / 3.0) - 0.5) - 0.48);
        diffuseColor.rgb *= 1.0 - 0.35 * max(seamA, seamB);
        diffuseColor.rgb *= 0.92 + 0.08 * fract(sin(dot(floor(q / vec2(6.0, 3.0)), vec2(12.9, 78.2))) * 43758.5);
        if (q.x > uClad * ${L.toFixed(1)}) discard; }`]],
  });
  const inner = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.45, 0.46, 0.47), roughness: 0.6, metalness: 0.6, side: THREE.DoubleSide });
  const outerPts = profile(S, H, 96), innerPts = profile(S - 2 * depth, H - depth, 96);
  const outer = new THREE.Mesh(skin(outerPts, L, false), steel); outer.castShadow = true; outer.receiveShadow = true; g.add(outer);
  const inn = new THREE.Mesh(skin(innerPts, L, true), inner); inn.receiveShadow = true; g.add(inn);
  // the lattice: arch chords every 12.5 m along the length, with diagonal bracing between the skins
  const lat = [];
  const nArch = Math.round(L / 12.5);
  const P = (pts, i, x) => V3(x, pts[i][1], pts[i][0]);
  for (let a = 0; a <= nArch; a++) {
    const x = -L / 2 + a * L / nArch;
    for (let i = 0; i < 96; i += 2) {
      lat.push(tube(P(outerPts, i, x), P(outerPts, i + 2, x), 0.45), tube(P(innerPts, i, x), P(innerPts, i + 2, x), 0.45));
      lat.push(tube(P(outerPts, i, x), P(innerPts, i + 2, x), 0.25), tube(P(innerPts, i, x), P(outerPts, i, x), 0.25));
    }
  }
  const latM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.32, 0.34, 0.33), roughness: 0.55, metalness: 0.6 });
  const lattice = new THREE.Mesh(mergeGeometries(lat), latM); lattice.castShadow = true; g.add(lattice);
  // the two concrete foundation beams the arch slides on
  return { group: g, steelMat: steel, lattice };
}
