import * as THREE from 'three';
import { Post } from './lib/post.js';
import { ATM } from './lib/atmos.js';
import { fbm1 } from './lib/util.js';
import { SHOTS } from './shots.js';

const params = new URLSearchParams(location.search);
const W = +(params.get('w') || 1920), H = +(params.get('h') || 1080);
const shotName = params.get('shot') || 'TEST';
const FPS = 24;

const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
if (params.get('noshadow')) renderer.shadowMap.enabled = false;

async function loadNoise() {
  const buf = await (await fetch('/web/assets/noise3d_128.bin')).arrayBuffer();
  const tex = new THREE.Data3DTexture(new Uint8Array(buf), 128, 128, 128);
  tex.format = THREE.RGBAFormat; tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1; tex.needsUpdate = true;
  return tex;
}

const ctx = { THREE, renderer, W, H, aspect: W / H, FPS, ATM, params };
let shot = null, post = null;

async function init() {
  ctx.noiseTex = await loadNoise();
  const def = SHOTS[shotName];
  if (!def) throw new Error('unknown shot ' + shotName);
  const ss = +(params.get('ss') || def.ss || 1);
  const msaa = params.get('msaa') !== null ? +params.get('msaa') : (def.msaa ?? 4);
  post = new Post(renderer, W, H, { volScale: def.volScale ?? 0.5, samples: msaa, dofSamples: def.dofSamples ?? 56, ss });
  ctx.msaa = msaa;
  ctx.post = post; ctx.ss = ss; ctx.RH = H * ss;
  shot = await def.build(ctx);
  shot.duration = def.duration;
  // warm up shader compilation
  renderer.compile(shot.scene, shot.camera);
  window.shotInfo = { name: shotName, duration: def.duration, frames: Math.round(def.duration * FPS) };
  window.ready = true;
}

const prevVP = new THREE.Matrix4();
function renderAt(frame) {
  const t = frame / FPS;
  ATM.uTime.value = t;
  // camera at shutter-open (180 deg shutter) for motion blur
  let useMB = shot.motionBlur !== false;
  if (useMB) {
    shot.update(t - 0.5 / FPS, frame, true);
    shot.camera.updateMatrixWorld(true);
    prevVP.multiplyMatrices(shot.camera.projectionMatrix, shot.camera.matrixWorldInverse);
  }
  const ro = shot.update(t, frame, false) || {};
  shot.camera.updateMatrixWorld(true);
  const weave = [fbm1(frame * 0.37, 11, 2) * 0.35, fbm1(frame * 0.41, 23, 2) * 0.35];
  const flick = 1.0 + fbm1(frame * 0.9, 5, 2) * 0.012;
  const look = Object.assign({}, shot.look || {}, ro.look || {});
  look.uExposure = (look.uExposure ?? 1) * flick;
  post.render(shot.scene, shot.camera, {
    look, frame, fade: ro.fade ?? 0, weave, volumes: shot.volumes !== false && !window.__novol,
    prevViewProj: useMB ? prevVP : null, dof: ro.dof || shot.dof || null,
  });
}

const gl = renderer.getContext();
const px = new Uint8Array(W * H * 4);
window.renderFrame = (frame) => {
  renderAt(frame);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < px.length; i += CH) s += String.fromCharCode.apply(null, px.subarray(i, i + CH));
  return btoa(s);
};
const px1 = new Uint8Array(4);
window.timeFrame = (frame) => { const t0 = performance.now(); renderAt(frame); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); return performance.now() - t0; };

init().catch(e => { console.error('INIT ERROR', e.stack || e); window.initError = String(e.stack || e); });
// debug: render frame and read HDR composite values at pixel coords (x,y from top-left, in output px)
window.probe = (frame, pts) => {
  renderAt(frame);
  const out = [];
  const buf = new Uint16Array(4);
  const h2f = (h) => { const s = (h & 0x8000) ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff; if (e === 0) return s * Math.pow(2, -14) * (f / 1024); if (e === 31) return f ? NaN : s * Infinity; return s * Math.pow(2, e - 15) * (1 + f / 1024); };
  for (const [x, y] of pts) {
    renderer.readRenderTargetPixels(post.rtA, x, H - 1 - y, 1, 1, buf);
    out.push([x, y, h2f(buf[0]).toFixed(5), h2f(buf[1]).toFixed(5), h2f(buf[2]).toFixed(5)]);
  }
  return out;
};
