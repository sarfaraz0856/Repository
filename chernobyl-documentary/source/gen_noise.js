// Precompute a tileable 128^3 RGBA8 noise volume for smoke/fire raymarching.
// R: Perlin-Worley billow, G: Worley fbm (f=4), B: Worley fbm (f=8), A: Perlin fbm (warp).
const fs = require('fs');
const N = 128;
function hash3(x, y, z, s) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + s * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const mod = (a, n) => ((a % n) + n) % n;
function grad(ix, iy, iz, s, x, y, z) {
  const h = Math.floor(hash3(ix, iy, iz, s) * 12);
  const g = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]][h];
  return g[0] * x + g[1] * y + g[2] * z;
}
const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
function perlin(x, y, z, p, s) { // periodic with period p
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const X0 = mod(xi, p), X1 = mod(xi + 1, p), Y0 = mod(yi, p), Y1 = mod(yi + 1, p), Z0 = mod(zi, p), Z1 = mod(zi + 1, p);
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(grad(X0, Y0, Z0, s, xf, yf, zf), grad(X1, Y0, Z0, s, xf - 1, yf, zf), u),
             l(grad(X0, Y1, Z0, s, xf, yf - 1, zf), grad(X1, Y1, Z0, s, xf - 1, yf - 1, zf), u), v),
           l(l(grad(X0, Y0, Z1, s, xf, yf, zf - 1), grad(X1, Y0, Z1, s, xf - 1, yf, zf - 1), u),
             l(grad(X0, Y1, Z1, s, xf, yf - 1, zf - 1), grad(X1, Y1, Z1, s, xf - 1, yf - 1, zf - 1), u), v), w);
}
function perlinFbm(x, y, z, f0, oct, s) {
  let sum = 0, a = 1, norm = 0, f = f0;
  for (let i = 0; i < oct; i++) { sum += a * perlin(x * f, y * f, z * f, f, s + i); norm += a; a *= 0.5; f *= 2; }
  return sum / norm; // ~[-0.7,0.7]
}
function worley(x, y, z, c, s) { // x,y,z in [0,1); c cells per tile; returns F1 in cell units
  const px = x * c, py = y * c, pz = z * c;
  const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
  let d = 1e9;
  for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = ix + dx, cy = iy + dy, cz = iz + dz;
    const hx = mod(cx, c), hy = mod(cy, c), hz = mod(cz, c);
    const fx = cx + hash3(hx, hy, hz, s), fy = cy + hash3(hx, hy, hz, s + 7), fz = cz + hash3(hx, hy, hz, s + 13);
    const ddx = fx - px, ddy = fy - py, ddz = fz - pz;
    const dd = ddx * ddx + ddy * ddy + ddz * ddz;
    if (dd < d) d = dd;
  }
  return Math.sqrt(d);
}
function worleyFbm(x, y, z, c, s) {
  const a = 1 - Math.min(1, worley(x, y, z, c, s));
  const b = 1 - Math.min(1, worley(x, y, z, c * 2, s + 31));
  const d = 1 - Math.min(1, worley(x, y, z, c * 4, s + 63));
  return a * 0.625 + b * 0.25 + d * 0.125;
}
const remap = (v, a, b, c, d) => c + (v - a) / (b - a) * (d - c);
const clamp01 = v => Math.max(0, Math.min(1, v));
const out = new Uint8Array(N * N * N * 4);
let i = 0;
for (let z = 0; z < N; z++) {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N, w = z / N;
    const pf = perlinFbm(u, v, w, 4, 5, 1) * 0.5 + 0.5;
    const wf = worleyFbm(u, v, w, 4, 101);
    const pw = clamp01(remap(pf, wf - 1, 1, 0, 1));
    const w8 = worleyFbm(u, v, w, 8, 201);
    const pfb = perlinFbm(u, v, w, 2, 4, 301) * 0.5 + 0.5;
    out[i++] = Math.round(clamp01(pw) * 255);
    out[i++] = Math.round(clamp01(wf) * 255);
    out[i++] = Math.round(clamp01(w8) * 255);
    out[i++] = Math.round(clamp01(pfb) * 255);
  }
  if (z % 16 === 0) process.stdout.write(`z=${z} `);
}
fs.mkdirSync(__dirname + '/web/assets', { recursive: true });
fs.writeFileSync(__dirname + '/web/assets/noise3d_128.bin', out);
console.log('\nwrote', out.length);
