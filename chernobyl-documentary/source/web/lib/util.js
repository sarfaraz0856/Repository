// Deterministic helpers: every animated value in the film is a pure function of time.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOut = (t) => { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
export const easeInOutSine = (t) => { t = clamp(t, 0, 1); return -(Math.cos(Math.PI * t) - 1) / 2; };

function hash1(i, seed) {
  let h = (i * 374761393 + seed * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h >>> 0) / 4294967296) * 2 - 1;
}
// Smooth 1D value noise in [-1,1].
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  return hash1(i, seed) * (1 - u) + hash1(i + 1, seed) * u;
}
export function fbm1(x, seed = 0, oct = 3) {
  let s = 0, a = 0.5, n = 0;
  for (let i = 0; i < oct; i++) { s += a * noise1(x, seed + i * 17); n += a; x *= 2.07; a *= 0.5; }
  return s / n;
}

// Focal length (mm) on a Super35 sensor -> vertical FOV in degrees for a given aspect.
export function fovFromFocal(mm, aspect, sensorW = 24.89) {
  const sensorH = sensorW / aspect;
  return 2 * Math.atan(sensorH / (2 * mm)) * 180 / Math.PI;
}
export function fovFromFocalH(mm, aspect, sensorW = 24.89) {
  // keep horizontal FOV defined by focal; return vertical fov
  const hfov = 2 * Math.atan(sensorW / (2 * mm));
  return 2 * Math.atan(Math.tan(hfov / 2) / aspect) * 180 / Math.PI;
}
