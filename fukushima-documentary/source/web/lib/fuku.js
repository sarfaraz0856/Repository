// FUKUSHIMA DAIICHI, 2011: the set. The site was cut down from a 35 m coastal bluff to 10 m above the sea.
// Units 1-4 stand in a row in the south group, units 5-6 about 450 m to the north. Each unit has a box-shaped
// reactor building (painted pale blue with white clouds) and, on the sea side, a long turbine hall. Two
// breakwater arms enclose the harbour; the Pacific lies to the east.
// World axes: x = east (sea at x > 0), z = south, y = up. Metres. Unit 1's reactor building is at z = 0.
import * as THREE from 'three';
import { patchMaterial, ATM, FOG_GLSL } from './atmos.js';
import { mulberry32 } from './util.js';
import { makeDaySky } from './daysky.js';

export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const C = (r, g, b) => new THREE.Color(r, g, b);
export function lit(c, r = 0.9, m = 0, key = 'fk') { return patchMaterial(new THREE.MeshStandardMaterial({ color: Array.isArray(c) ? C(...c) : c, roughness: r, metalness: m }), { key }); }

export const SITE_Y = 10;                     // plant grade above sea level
export const SHORE_X = 0;                     // top of the sea-side revetment
// reactor building centres (x, z); turbine halls sit 62 m further east
export const UNITS = [
  { n: 1, x: -95, z: 0, w: 42, h: 46 }, { n: 2, x: -95, z: 70, w: 46, h: 48 }, { n: 3, x: -95, z: 140, w: 46, h: 48 }, { n: 4, x: -95, z: 210, w: 46, h: 48 },
  { n: 5, x: -95, z: -430, w: 46, h: 48 }, { n: 6, x: -95, z: -520, w: 50, h: 52 },
];
export const STACKS = [V3(-150, 0, 35), V3(-150, 0, 175), V3(-150, 0, -475)];

// ---- terrain: sea floor below 0, the 10 m terrace, then the 35 m bluff with forest inland
export function groundHeight(x, z) {
  const n = Math.sin(x * 0.011 + z * 0.007) * 3 + Math.sin(z * 0.023 - x * 0.004) * 2 + Math.sin((x + z) * 0.05) * 0.7;
  const bluff = 35 + n;
  // terrace edge (west) at x = -330 .. -270, a little wavy
  const ex = -300 + Math.sin(z * 0.006) * 25;
  const t = THREE.MathUtils.smoothstep(x, ex - 30, ex + 30);
  let h = THREE.MathUtils.lerp(bluff, SITE_Y, t);
  // the site ends at the shore; north and south of the site the bluff runs to the sea as a cliff
  const inSite = THREE.MathUtils.smoothstep(z, -760, -700) * (1 - THREE.MathUtils.smoothstep(z, 360, 420));
  const cliffTop = bluff;
  h = THREE.MathUtils.lerp(cliffTop, h, inSite);
  // into the sea
  const sx = SHORE_X + (1 - inSite) * (-20 + Math.sin(z * 0.01) * 15);
  const s = THREE.MathUtils.smoothstep(x, sx - 2, sx + 22);
  return THREE.MathUtils.lerp(h, -8 - (x - sx) * 0.02, s);
}

function terrainMesh() {
  const g = new THREE.PlaneGeometry(3400, 3400, 340, 340); g.rotateX(-Math.PI / 2); g.translate(-900, 0, -100);
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = groundHeight(x, z); p.setY(i, y);
    // grass/forest floor on the bluff, concrete-grey gravel on the site, wet sand at the shore
    const site = y < SITE_Y + 1.5 && y > SITE_Y - 1.5 && x > -330;
    const gp = Math.sin(x * 0.031) * Math.sin(z * 0.027 + 1.3) > 0.35 || x < -250;
    let c = site ? (gp ? [0.2, 0.24, 0.13] : [0.33, 0.33, 0.31]) : y > 15 ? [0.12, 0.15, 0.08] : [0.3, 0.27, 0.22];
    if (y < 1.5) c = [0.22, 0.2, 0.17];
    col.set(c, i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = patchMaterial(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), { key: 'fkterrain' });
  const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; return mesh;
}

// ---- the pale-blue-and-cloud pattern of the reactor buildings
function cloudTexture(seed = 1) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; const c = cv.getContext('2d');
  c.fillStyle = '#9cc3dc'; c.fillRect(0, 0, 1024, 512);
  const rnd = mulberry32(seed);
  for (let k = 0; k < 26; k++) {
    const x = rnd() * 1024, y = 60 + rnd() * 380, s = 30 + rnd() * 60;
    c.fillStyle = 'rgba(245,248,250,0.97)';
    for (let j = 0; j < 7; j++) { c.beginPath(); c.ellipse(x + (j - 3) * s * 0.55, y + Math.sin(j * 1.7) * s * 0.18 - (j % 2) * s * 0.25, s * (0.5 + rnd() * 0.25), s * (0.38 + rnd() * 0.2), 0, 0, Math.PI * 2); c.fill(); }
  }
  // panel joints
  c.strokeStyle = 'rgba(60,80,95,0.25)'; c.lineWidth = 2;
  for (let x = 0; x < 1024; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 512); c.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping; return t;
}
function panelTexture(base = '#c9ccc9', lines = 'rgba(70,75,75,0.3)', rows = 10) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d');
  c.fillStyle = base; c.fillRect(0, 0, 512, 256);
  c.strokeStyle = lines; c.lineWidth = 2;
  for (let y = 0; y < 256; y += 256 / rows) { c.beginPath(); c.moveTo(0, y); c.lineTo(512, y); c.stroke(); }
  for (let x = 0; x < 512; x += 32) { c.strokeStyle = 'rgba(70,75,75,0.12)'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 256); c.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const texMat = (map, key, r = 0.85) => patchMaterial(new THREE.MeshStandardMaterial({ map, roughness: r }), { key });

// A reactor building. Returns {group, top} where top is the refuelling-floor storey (the part that blew off).
function reactorBuilding(u, mats) {
  const g = new THREE.Group(); g.position.set(u.x, SITE_Y, u.z);
  const low = u.h * 0.62, up = u.h - low;
  const base = new THREE.Mesh(new THREE.BoxGeometry(u.w, low, u.w), mats.concrete); base.position.y = low / 2;
  // refuelling floor storey: the cloud pattern on all four walls
  const tm = mats.cloud.clone(); tm.map = mats.cloud.map.clone(); tm.map.needsUpdate = true; tm.map.repeat.set(u.w / 46, 1);
  const top = new THREE.Mesh(new THREE.BoxGeometry(u.w, up, u.w), [tm, tm, mats.roof, mats.concrete, tm, tm]); top.position.y = low + up / 2;
  // a band of louvres / a darker strip between the two
  const band = new THREE.Mesh(new THREE.BoxGeometry(u.w + 0.3, 1.2, u.w + 0.3), mats.dark); band.position.y = low;
  // crane rail housing on the roof, vents
  const rh = new THREE.Mesh(new THREE.BoxGeometry(u.w * 0.9, 1.4, 3), mats.roof); rh.position.set(0, u.h + 0.7, -u.w * 0.3);
  for (const o of [base, top, band, rh]) { o.castShadow = o.receiveShadow = true; g.add(o); }
  // annex on the west side
  const an = new THREE.Mesh(new THREE.BoxGeometry(18, low * 0.7, u.w * 0.8), mats.concrete); an.position.set(-u.w / 2 - 9, low * 0.35, 0); an.castShadow = an.receiveShadow = true; g.add(an);
  return { group: g, top, base };
}
function turbineHall(u, mats) {
  const g = new THREE.Group(); g.position.set(u.x + 62, SITE_Y, u.z);
  const L = 66, D = 44, H = 28;
  const tm = mats.panel.clone(); tm.map = mats.panel.map.clone(); tm.map.needsUpdate = true; tm.map.repeat.set(L / 40, 1);
  const b = new THREE.Mesh(new THREE.BoxGeometry(D, H, L), [tm, tm, mats.roof, mats.concrete, tm, tm]); b.position.y = H / 2;
  const roofTop = new THREE.Mesh(new THREE.BoxGeometry(D * 0.6, 4, L * 0.92), mats.roof2); roofTop.position.y = H + 2;
  for (const o of [b, roofTop]) { o.castShadow = o.receiveShadow = true; g.add(o); }
  // the sea-side lower block with the seawater pumps in front
  const lb = new THREE.Mesh(new THREE.BoxGeometry(14, 12, L * 0.9), mats.concrete); lb.position.set(D / 2 + 7, 6, 0); lb.castShadow = lb.receiveShadow = true; g.add(lb);
  return g;
}
function stack(p, mats, H = 120) {
  const g = new THREE.Group(); g.position.set(p.x, SITE_Y, p.z);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, H, 20), mats.stack); tube.position.y = H / 2; tube.castShadow = true; g.add(tube);
  // the lattice tower round it: four legs and K-bracing as thin boxes
  const legs = [], s0 = 9, s1 = 3.2, M = mats.steel;
  const pt = (i, y) => { const s = THREE.MathUtils.lerp(s0, s1, y / H); return V3((i & 1 ? 1 : -1) * s, y, (i & 2 ? 1 : -1) * s); };
  const beam = (a, b, r = 0.25) => { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.BoxGeometry(r, d.length(), r), M); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); m.castShadow = true; g.add(m); };
  for (let i = 0; i < 4; i++) beam(pt(i, 0), pt(i, H * 0.92), 0.45);
  const ring = [0, 1, 3, 2];
  for (let y = 0; y < H * 0.9; y += 10) for (let k = 0; k < 4; k++) {
    const a = ring[k], b = ring[(k + 1) % 4];
    beam(pt(a, y), pt(b, y + 10)); beam(pt(b, y), pt(a, y + 10)); beam(pt(a, y + 10), pt(b, y + 10), 0.2);
  }
  // red/white bands near the top
  for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(1.66 - k * 0.02, 1.7 - k * 0.02, 5, 20), k % 2 ? mats.white : mats.red); b.position.y = H - 2.5 - k * 5; g.add(b); }
  return g;
}

// breakwaters: long rubble mounds (a trapezoid prism) with a concrete crown and tetrapods on the sea face
function prism(L, wb, wt, h) {
  const sh = new THREE.Shape(); sh.moveTo(-wb / 2, 0); sh.lineTo(wb / 2, 0); sh.lineTo(wt / 2, h); sh.lineTo(-wt / 2, h); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false }); g.translate(0, 0, -L / 2); g.computeVertexNormals(); return g;
}
function breakwater(pts, mats, w = 26, h = 7) {
  const g = new THREE.Group(), rnd = mulberry32(pts.length * 7);
  const tetra = new THREE.TetrahedronGeometry(1.6, 0);
  for (let i = 1; i < pts.length; i++) {
    const a = V3(pts[i - 1][0], 0, pts[i - 1][1]), b = V3(pts[i][0], 0, pts[i][1]), d = b.clone().sub(a), L = d.length();
    const ry = Math.atan2(d.x, d.z), mid = a.clone().add(b).multiplyScalar(0.5);
    const mound = new THREE.Mesh(prism(L + 6, w, w * 0.35, h + 10), mats.rubble); mound.position.copy(mid); mound.position.y = -10; mound.rotation.y = ry;
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, 2.2, L + 4), mats.concreteL); crown.position.copy(mid); crown.position.y = h + 1.1; crown.rotation.y = ry;
    for (const o of [mound, crown]) { o.castShadow = o.receiveShadow = true; g.add(o); }
    const im = new THREE.InstancedMesh(tetra, mats.tetra, Math.ceil(L / 2.2) * 2); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const side = V3(Math.cos(ry), 0, -Math.sin(ry)); let n = 0;
    for (let s0 = -L / 2; s0 < L / 2; s0 += 2.2) for (const sd of [1, -1]) {
      const p = mid.clone().addScaledVector(d.clone().normalize(), s0).addScaledVector(side, sd * (w * 0.28 + rnd() * 2)); p.y = h - 1.5 + rnd() * 1.5;
      e.set(rnd() * 6, rnd() * 6, rnd() * 6); q.setFromEuler(e); m.compose(p, q, V3(1, 1, 1)); im.setMatrixAt(n++, m);
    }
    im.count = n; im.castShadow = im.receiveShadow = true; g.add(im);
  }
  return g;
}

// ---- the sea: displaced grid with a moving tsunami front, a fresnel sky reflection and sun glint
export function makeOcean(ctx, { size = 9000, seg = 420, near = [-300, 2700, -1000, 1400], nearSeg = [600, 480] } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, seg, seg); geo.rotateX(-Math.PI / 2); geo.translate(size / 2 - 300, 0, 0);
  const ngeo = new THREE.PlaneGeometry(near[1] - near[0], near[3] - near[2], nearSeg[0], nearSeg[1]); ngeo.rotateX(-Math.PI / 2); ngeo.translate((near[0] + near[1]) / 2, 0, (near[2] + near[3]) / 2);
  const uniforms = Object.assign({
    uSunDir: { value: V3(0, 1, 0) }, uSunCol: { value: C(1, 0.9, 0.8) },
    uDeep: { value: C(0.012, 0.03, 0.04) }, uShallow: { value: C(0.04, 0.08, 0.075) }, uSkyRef: { value: C(0.45, 0.5, 0.55) },
    uChop: { value: 1.0 },
    // tsunami: front x position (moving west), height, width; uDraw = drawdown of the sea before it
    uHole: { value: new THREE.Vector4(near[0] + 2, near[1] - 2, near[2] + 2, near[3] - 2) }, uHoleOn: { value: 0 }, uTsuX: { value: 99999 }, uTsuH: { value: 0 }, uTsuW: { value: 120 }, uDraw: { value: 0 }, uFoam: { value: 0 },
  }, ATM);
  const WAVES = /* glsl */`
    uniform float uTime, uChop, uTsuX, uTsuH, uTsuW, uDraw;
    float swell(vec2 p){
      float h = 0.0;
      h += sin(dot(p, vec2(-0.012, 0.004)) + uTime * 0.55) * 0.55;
      h += sin(dot(p, vec2(-0.021, -0.011)) + uTime * 0.8) * 0.3;
      h += sin(dot(p, vec2(-0.045, 0.02)) + uTime * 1.3) * 0.12;
      return h * uChop;
    }
    float tsunami(vec2 p){
      // a long-crested bore travelling west (towards -x): a steep, slightly overhanging front with a churning
      // crest, a long plateau behind, and the sea drawn down ahead of it
      float d = p.x - uTsuX;                    // < 0 ahead of the front (shoreward), > 0 behind
      float wob = 1.0 + 0.08 * sin(p.y * 0.013 + 1.3) + 0.05 * sin(p.y * 0.041);
      float dd = d - 18.0 * sin(p.y * 0.006 + 0.7) - 9.0 * sin(p.y * 0.021);
      float front = smoothstep(-uTsuW * 0.5, uTsuW * 0.08, dd);
      float plateau = exp(-max(dd - uTsuW, 0.0) / 1400.0);
      float crest = exp(-pow((dd - 12.0) / 16.0, 2.0)) * 0.22;
      float churn = (sin(p.y * 0.21 + uTime * 2.3) * sin(p.x * 0.17 - uTime * 1.7) + sin(p.y * 0.53 - uTime * 3.1) * 0.5) * 0.06 * smoothstep(-10.0, 30.0, dd) * exp(-max(dd, 0.0) / 400.0);
      float h = uTsuH * (front * plateau + crest * front + churn) * wob;
      h -= uDraw * (1.0 - front) * smoothstep(-1400.0, -200.0, dd);
      return h;
    }
    float seaH(vec2 p){ return swell(p) + tsunami(p); }`;
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      ${WAVES}
      varying vec3 vWPos;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        wp.y += seaH(wp.xz);
        vWPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      precision highp float;
      ${WAVES}
      ${FOG_GLSL}
      uniform vec3 uSunDir, uSunCol, uDeep, uShallow, uSkyRef;
      uniform float uFoam, uHoleOn;
      uniform vec4 uHole;
      varying vec3 vWPos;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      float ripple(vec2 p){
        float r = 0.0, a = 0.5; mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
        for (int i = 0; i < 5; i++){ r += vnoise(p + uTime * vec2(0.25, 0.1) * float(i + 1)) * a; p = m * p * 2.03; a *= 0.5; }
        return r;
      }
      void main(){
        vec2 p = vWPos.xz;
        if (uHoleOn > 0.5 && p.x > uHole.x && p.x < uHole.y && p.y > uHole.z && p.y < uHole.w) discard;
        float e = 1.5;
        float hx = seaH(p + vec2(e, 0.0)) - seaH(p - vec2(e, 0.0));
        float hz = seaH(p + vec2(0.0, e)) - seaH(p - vec2(0.0, e));
        vec3 n = normalize(vec3(-hx, 2.0 * e, -hz));
        float dist = length(vWPos - cameraPosition);
        float rs = 0.35 * uChop * exp(-dist / 1800.0);
        vec2 q = p * 0.09;
        float r0 = ripple(q), rx = ripple(q + vec2(0.07, 0.0)), rz = ripple(q + vec2(0.0, 0.07));
        n = normalize(n + vec3(-(rx - r0), 0.0, -(rz - r0)) * rs * 14.0);
        vec3 v = normalize(cameraPosition - vWPos);
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
        vec3 refl = reflect(-v, n);
        vec3 sky = mix(uSkyRef * 0.7, uSkyRef * 1.15, clamp(refl.y * 2.0, 0.0, 1.0));
        float spec = pow(max(dot(refl, uSunDir), 0.0), 300.0) * 6.0 + pow(max(dot(refl, uSunDir), 0.0), 30.0) * 0.15;
        float th = tsunami(p);
        vec3 body = mix(uDeep, uShallow, clamp(0.3 + th * 0.04, 0.0, 1.0)) * (0.6 + 0.4 * max(dot(n, uSunDir), 0.0));
        float slope0 = length(vec2(hx, hz)) / (2.0 * e);
        fres *= 1.0 - 0.75 * smoothstep(0.25, 0.9, slope0);
        vec3 col = mix(body, sky, fres) + uSunCol * spec;
        // foam: on the steep tsunami front, at the breakwaters and the shore, and as streaks on the plateau
        float d = p.x - uTsuX;
        float slope = length(vec2(hx, hz)) / (2.0 * e);
        float fd = p.x - uTsuX;
        float fface = step(0.5, uTsuH) * smoothstep(-22.0, -4.0, fd) * (1.0 - smoothstep(8.0, 70.0, fd)) * smoothstep(0.3, 0.6, ripple(p * 0.05 + vec2(uTime * 0.3, 0.0)) + 0.25);
        float fm = fface * (0.45 + 0.55 * smoothstep(0.4, 0.75, ripple(p * vec2(0.01, 0.12) + vec2(0.0, uTime * 0.1)))) + smoothstep(0.45, 0.9, slope) * step(0.5, uTsuH) * 0.35 + uFoam * smoothstep(0.0, 300.0, d) * exp(-d / 700.0) * smoothstep(0.45, 0.75, ripple(p * 0.02 + vec2(uTime * 0.05, 0.0)));
        fm = clamp(fm, 0.0, 1.0) * (0.6 + 0.4 * r0);
        col = mix(col, vec3(0.75, 0.77, 0.76) * (0.5 + 0.5 * max(uSunDir.y, 0.0)) , fm * 0.85);
        col = applyFog(col, cameraPosition, vWPos);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.receiveShadow = false;
  const far = mesh; const nmat = mat.clone(); nmat.uniforms = uniforms; 
  const farU = Object.assign({}, uniforms, { uHoleOn: { value: 1 } }); mat.uniforms = farU;
  const nearMesh = new THREE.Mesh(ngeo, nmat); nearMesh.frustumCulled = false;
  const grp = new THREE.Group(); grp.add(far, nearMesh);
  grp.uniforms = uniforms;
  return grp;
}

// ---- trees on the bluff
function forest(count = 26000, seed = 7) {
  const rnd = mulberry32(seed);
  const geo = new THREE.ConeGeometry(1, 1, 6, 1); geo.translate(0, 0.5, 0);
  const mat = patchMaterial(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), { key: 'fkpine' });
  const im = new THREE.InstancedMesh(geo, mat, count); const m = new THREE.Matrix4(), col = new THREE.Color();
  let n = 0;
  for (let i = 0; i < count * 4 && n < count; i++) {
    const x = -2300 + rnd() * 2200, z = -1700 + rnd() * 3200, y = groundHeight(x, z);
    if (y < 20) continue;
    const h = 9 + rnd() * 9, r = 2 + rnd() * 1.6;
    m.makeScale(r, h, r); m.setPosition(x, y - 0.5, z); im.setMatrixAt(n, m);
    col.setRGB(0.05 + rnd() * 0.03, 0.075 + rnd() * 0.035, 0.04 + rnd() * 0.02); im.setColorAt(n, col); n++;
  }
  im.count = n; im.castShadow = true; im.receiveShadow = true; return im;
}

// ---- site clutter: tanks, small buildings, roads, a car park, power line towers
function clutter(mats) {
  const g = new THREE.Group(), rnd = mulberry32(11);
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.castShadow = o.receiveShadow = true; g.add(o); return o; };
  // heavy-oil tanks near the shore (south), and the earthquake-proof building west of unit 2
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(9, 9, 12, 28), mats.tank, -10 - i * 24, SITE_Y + 6, 300);
  add(new THREE.BoxGeometry(40, 12, 30), mats.concreteL, -270, SITE_Y + 6, 80);
  add(new THREE.BoxGeometry(60, 9, 40), mats.concreteL, -230, SITE_Y + 4.5, -200);
  add(new THREE.BoxGeometry(30, 16, 22), mats.concrete, -200, SITE_Y + 8, 250);
  // seawater pump pits along the shore in front of each turbine hall
  for (const u of UNITS) { for (let k = -2; k <= 2; k++) add(new THREE.CylinderGeometry(0.9, 0.9, 5, 10), mats.pump, -5 + (k % 2) * 2, SITE_Y + 2.5, u.z + k * 7); }
  // service buildings, workshops, warehouses filling the site (kept clear of the units and roads)
  const busy = (x, z, r) => UNITS.some(u => Math.abs(x - u.x - 25) < 70 + r && Math.abs(z - u.z) < 40 + r) || Math.abs(x + 170) < 8 + r || Math.abs(x + 20) < 8 + r;
  const bm = [[0.72, 0.72, 0.69], [0.66, 0.64, 0.58], [0.78, 0.78, 0.76], [0.6, 0.62, 0.64]].map((c, i) => lit(c, 0.9, 0, 'fkbld' + i));
  const roofs = [[0.25, 0.38, 0.5], [0.45, 0.45, 0.45], [0.55, 0.3, 0.22], [0.3, 0.42, 0.35]].map((c, i) => lit(c, 0.7, 0.2, 'fkbr' + i));
  for (let i = 0, n = 0; i < 400 && n < 70; i++) {
    const x = -290 + rnd() * 280, z = -720 + rnd() * 1060, w = 10 + rnd() * 30, d = 10 + rnd() * 24, h = 5 + rnd() * rnd() * 18;
    if (busy(x, z, Math.max(w, d) / 2)) continue;
    add(new THREE.BoxGeometry(w, h, d), bm[n % 4], x, SITE_Y + h / 2, z);
    add(new THREE.BoxGeometry(w + 0.4, 0.5, d + 0.4), roofs[(n * 7) % 4], x, SITE_Y + h + 0.25, z); n++;
  }
  // a cluster of water tanks and pipe racks
  for (let i = 0; i < 12; i++) add(new THREE.CylinderGeometry(5, 5, 11, 20), mats.tank, -260 + (i % 4) * 12, SITE_Y + 5.5, 150 + Math.floor(i / 4) * 12);
  for (const u of UNITS) add(new THREE.BoxGeometry(1.5, 1.5, 30), mats.steel, u.x - 40, SITE_Y + 8, u.z + 28);
  // a car park with rows of cars
  const car = new THREE.BoxGeometry(1.8, 1.4, 4.4);
  const carCols = [[0.8, 0.8, 0.78], [0.1, 0.1, 0.11], [0.5, 0.52, 0.55], [0.6, 0.1, 0.08], [0.15, 0.2, 0.35]].map((c, i) => lit(c, 0.4, 0.3, 'fkcar' + i));
  for (let r = 0; r < 6; r++) for (let k = 0; k < 22; k++) if (rnd() < 0.8) add(car, carCols[Math.floor(rnd() * 5)], -250 + k * 3.2, SITE_Y + 0.7, -110 + r * 9, Math.PI / 2);
  // roads on the site
  const rd = lit([0.12, 0.12, 0.12], 0.9, 0, 'fkroad');
  add(new THREE.BoxGeometry(10, 0.2, 1100), rd, -170, SITE_Y + 0.1, -150);
  add(new THREE.BoxGeometry(10, 0.2, 1100), rd, -20, SITE_Y + 0.1, -150);
  for (const z of [-130, 260, -340]) add(new THREE.BoxGeometry(160, 0.2, 9), rd, -95, SITE_Y + 0.1, z);
  // switchyard and power line towers going inland
  for (let k = 0; k < 6; k++) {
    const x = -340 - k * 220, z = -60 + k * 30, y = groundHeight(x, z);
    const tw = new THREE.Group(); tw.position.set(x, y, z); g.add(tw);
    for (const [sx, sz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.4, 50, 0.4), mats.steel); l.position.set(sx * 0.6, 25, sz * 0.6); l.rotation.set(-sz * 0.03, 0, sx * 0.03); tw.add(l); }
    for (const yy of [38, 44, 49]) { const a = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 18), mats.steel); a.position.y = yy; tw.add(a); }
  }
  return g;
}

// The refuelling floor after a hydrogen explosion: walls and roof gone, the bare steel frame left, rubble on top.
export function blowTop(u, mats, { frame = true, rubble = 1 } = {}) {
  u.top.visible = false;
  const g = new THREE.Group(); g.position.copy(u.group.position); g.position.y += u.h * 0.62;
  const H = u.h * 0.38, w = u.w, n = 6, rnd = mulberry32(u.n * 13);
  const beam = (x, y, z, sx, sy, sz, rx = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mats.steelDark); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); m.castShadow = true; g.add(m); };
  if (frame) for (let i = 0; i <= n; i++) for (const side of [-1, 1]) {
    const p = -w / 2 + (w * i) / n, bent = rnd() < 0.3 ? (rnd() - 0.5) * 0.5 : 0, hh = H * (0.55 + rnd() * 0.45);
    beam(p, hh / 2, side * w / 2, 0.6, hh, 0.6, bent, 0); beam(side * w / 2, hh / 2, p, 0.6, hh, 0.6, 0, bent);
    if (rnd() < 0.5) beam(p, hh * 0.6, side * w / 2, w / n, 0.4, 0.4, 0, (rnd() - 0.5) * 0.6);
  }
  for (let k = 0; k < 60 * rubble; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1 + rnd() * 4, 0.4 + rnd(), 1 + rnd() * 4), rnd() < 0.5 ? mats.concrete : mats.dark); m.position.set((rnd() - 0.5) * w * 0.9, rnd() * 1.5, (rnd() - 0.5) * w * 0.9); m.rotation.set(rnd(), rnd() * 3, rnd()); m.castShadow = m.receiveShadow = true; g.add(m); }
  // torn panels hanging on the outside of the lower building
  for (let k = 0; k < 8; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(4 + rnd() * 5, 3 + rnd() * 6), mats.panelTorn); const side = rnd() < 0.5 ? -1 : 1; m.position.set(side * (w / 2 + 0.3), -2 - rnd() * 6, (rnd() - 0.5) * w * 0.8); m.rotation.set(rnd() * 0.4, Math.PI / 2, (rnd() - 0.5) * 0.6); g.add(m); }
  u.group.parent.add(g); return g;
}

export function fukuWorld(ctx, opts = {}) {
  const { sun, sky: skyOpts = {}, fog = 0.00028, fogColor = [0.42, 0.46, 0.52] } = opts;
  const scene = new THREE.Scene();
  const sky = makeDaySky({ noiseTex: ctx.noiseTex });
  for (const [k, v] of Object.entries(skyOpts)) { const u = sky.uniforms[k]; if (u.value?.setRGB && Array.isArray(v)) u.value.setRGB(...v); else u.value = v; }
  sky.uniforms.uSunDir.value.copy(sun); scene.add(sky);
  ATM.uFogColor.value.setRGB(...fogColor); ATM.uFogDensity.value = fog; ATM.uFogHeight.value = 260; ATM.uFogBase.value = 0;
  ATM.uGlowDir.value.copy(sun); ATM.uGlowCol.value.setRGB(0.25, 0.22, 0.18); ATM.uGlowPow.value = 5;
  ATM.uFireFog.value.setRGB(0, 0, 0); ATM.uLampMapOn.value = 0;
  const mats = {
    concrete: lit([0.6, 0.6, 0.58], 0.9, 0, 'fkconc'), concreteL: lit([0.68, 0.68, 0.66], 0.9, 0, 'fkconcL'),
    roof: lit([0.42, 0.43, 0.43], 0.85, 0, 'fkroof'), roof2: lit([0.32, 0.35, 0.36], 0.8, 0.1, 'fkroof2'), dark: lit([0.2, 0.22, 0.24], 0.8, 0, 'fkdark'),
    cloud: texMat(cloudTexture(3), 'fkcloud'), panel: texMat(panelTexture(), 'fkpanel'),
    stack: lit([0.7, 0.7, 0.68], 0.7, 0.2, 'fkstack'), steel: lit([0.45, 0.46, 0.46], 0.6, 0.5, 'fksteel'),
    red: lit([0.6, 0.08, 0.05], 0.7, 0, 'fkred'), white: lit([0.85, 0.85, 0.83], 0.7, 0, 'fkwhite'),
    rubble: lit([0.27, 0.27, 0.26], 1, 0, 'fkrub'), steelDark: lit([0.18, 0.17, 0.16], 0.7, 0.5, 'fksd'), panelTorn: (() => { const m = lit([0.55, 0.65, 0.72], 0.9, 0, 'fkpt'); m.side = THREE.DoubleSide; return m; })(), tetra: lit([0.55, 0.55, 0.52], 0.95, 0, 'fktet'), tank: lit([0.75, 0.75, 0.72], 0.6, 0.2, 'fktank'), pump: lit([0.2, 0.3, 0.45], 0.6, 0.4, 'fkpump'),
  };
  const root = new THREE.Group(); scene.add(root);
  root.add(terrainMesh());
  const units = UNITS.map(u => { const r = reactorBuilding(u, mats); root.add(r.group); root.add(turbineHall(u, mats)); return { ...u, ...r }; });
  for (const p of STACKS) root.add(stack(p, mats, p.z < -300 ? 120 : 120));
  root.add(breakwater([[30, 330], [260, 330], [520, 160], [610, -40]], mats));
  root.add(breakwater([[25, -760], [300, -700], [470, -420]], mats));
  root.add(clutter(mats));
  const rev = new THREE.Mesh(new THREE.BoxGeometry(6, SITE_Y + 6, 1120), mats.concrete); rev.position.set(SHORE_X + 3, (SITE_Y - 6) / 2, -170); rev.castShadow = rev.receiveShadow = true; root.add(rev);
  root.add(forest(opts.trees ?? 26000));
  const ocean = makeOcean(ctx); scene.add(ocean);
  ocean.uniforms.uSunDir.value.copy(sun);
  const { sunCol = [1.0, 0.92, 0.82], sunI = 3.2, hemiSky = [0.45, 0.5, 0.6], hemiGround = [0.2, 0.18, 0.15], hemiI = 1.1 } = opts;
  const sl = new THREE.DirectionalLight(C(...sunCol), sunI); sl.position.copy(sun).multiplyScalar(3000); sl.target.position.set(-100, 0, -100);
  sl.castShadow = true; sl.shadow.mapSize.set(4096, 4096); const sc = sl.shadow.camera; sc.left = -900; sc.right = 900; sc.top = 900; sc.bottom = -900; sc.near = 100; sc.far = 7000;
  sl.shadow.bias = -0.0006; sl.shadow.normalBias = 1.5; scene.add(sl, sl.target);
  scene.add(new THREE.HemisphereLight(C(...hemiSky), C(...hemiGround), hemiI));
  const camera = new THREE.PerspectiveCamera(40, ctx.aspect, 2, 20000);
  return { scene, camera, sky, ocean, units, mats, sunLight: sl };
}
