// Post pipeline: scene (MSAA HDR) -> volumes (low-res, premultiplied) -> composite -> foreground
// particles -> camera motion blur -> depth of field -> bloom -> filmic grade + grain -> canvas.
import * as THREE from 'three';

const VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const triGeo = new THREE.BufferGeometry();
triGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
triGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));

class Pass {
  constructor(fragmentShader, uniforms, defines = {}) {
    this.material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader, uniforms, defines, depthTest: false, depthWrite: false });
    this.mesh = new THREE.Mesh(triGeo, this.material);
    this.mesh.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
    this.camera = new THREE.Camera();
    this.uniforms = this.material.uniforms;
  }
  render(renderer, target) {
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.camera);
  }
}

const DEPTH_FN = /* glsl */`
uniform float uNear, uFar;
float viewDepth(float d){ // perspective depth [0,1] -> positive view distance (z)
  float ndc = d * 2.0 - 1.0;
  return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear));
}`;

const COMPOSITE_FS = /* glsl */`
uniform sampler2D tScene, tVol;
uniform float uVolOn, uSS;
uniform vec2 uHiRes, uVolRes;
varying vec2 vUv;
void main(){
  vec4 s;
  if (uSS > 2.5) { // 3x3 or 4x4 box: average 4 bilinear taps
    vec2 o = 0.25 * uSS / uHiRes;
    s = 0.25 * (texture2D(tScene, vUv + vec2(-o.x, -o.y)) + texture2D(tScene, vUv + vec2(o.x, -o.y)) + texture2D(tScene, vUv + vec2(-o.x, o.y)) + texture2D(tScene, vUv + vec2(o.x, o.y)));
  } else s = texture2D(tScene, vUv);
  vec2 vt = 0.85 / uVolRes;
  vec4 v = (texture2D(tVol, vUv + vec2(vt.x, vt.y)) + texture2D(tVol, vUv + vec2(-vt.x, vt.y)) + texture2D(tVol, vUv + vec2(vt.x, -vt.y)) + texture2D(tVol, vUv + vec2(-vt.x, -vt.y))) * 0.25 * uVolOn;
  gl_FragColor = vec4(s.rgb * (1.0 - v.a) + v.rgb, 1.0);
}`;

const MB_FS = /* glsl */`
uniform sampler2D tColor, tDepth;
uniform mat4 uInvViewProj, uPrevViewProj;
uniform vec2 uRes;
uniform float uMaxPx;
varying vec2 vUv;
void main(){
  float d = texture2D(tDepth, vUv).r;
  vec4 ndc = vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
  vec4 wp = uInvViewProj * ndc; wp /= wp.w;
  vec4 pp = uPrevViewProj * wp;
  vec2 prevUv = (pp.xy / pp.w) * 0.5 + 0.5;
  vec2 vel = vUv - prevUv;
  float len = length(vel * uRes);
  if (len > uMaxPx) vel *= uMaxPx / len;
  if (len < 0.35) { gl_FragColor = vec4(texture2D(tColor, vUv).rgb, 1.0); return; }
  vec3 acc = vec3(0.0);
  const int N = 12;
  for (int i = 0; i < N; i++) {
    float t = (float(i) + 0.5) / float(N) - 0.5;
    acc += texture2D(tColor, vUv + vel * t).rgb;
  }
  gl_FragColor = vec4(acc / float(N), 1.0);
}`;

const DOF_FS = /* glsl */`
uniform sampler2D tColor, tDepth;
uniform vec2 uRes;
uniform float uFocus, uCocScale, uMaxCoc;
varying vec2 vUv;
${DEPTH_FN}
float coc(float z){ return min(uCocScale * abs(1.0 / uFocus - 1.0 / max(z, 0.01)), uMaxCoc); }
void main(){
  float zc = viewDepth(texture2D(tDepth, vUv).r);
  float cc = coc(zc);
  vec3 c0 = texture2D(tColor, vUv).rgb;
  float w0 = 1.0 / max(cc * cc, 1.0);
  vec3 acc = c0 * w0; float wsum = w0;
  for (int i = 0; i < SAMPLES; i++) {
    float r = sqrt((float(i) + 0.5) / float(SAMPLES));
    float a = float(i) * 2.39996323;
    float dist = r * uMaxCoc;
    vec2 suv = vUv + vec2(cos(a), sin(a)) * dist / uRes;
    float zs = viewDepth(texture2D(tDepth, suv).r);
    float cs = coc(zs);
    float cm = (zs > zc) ? min(cs, cc) : cs;
    float w = smoothstep(dist - 1.5, dist + 0.5, cm) / max(cm * cm, 1.0);
    acc += texture2D(tColor, suv).rgb * w; wsum += w;
  }
  gl_FragColor = vec4(acc / wsum, 1.0);
}`;

const DOWN_FS = /* glsl */`
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uFirst;
varying vec2 vUv;
vec3 s(vec2 o){ vec3 c = texture2D(tSrc, vUv + o * uTexel).rgb; return c; }
float karis(vec3 c){ return 1.0 / (1.0 + dot(c, vec3(0.2126, 0.7152, 0.0722))); }
void main(){
  vec3 a = s(vec2(-2, 2)), b = s(vec2(0, 2)), c = s(vec2(2, 2));
  vec3 d = s(vec2(-2, 0)), e = s(vec2(0, 0)), f = s(vec2(2, 0));
  vec3 g = s(vec2(-2, -2)), h = s(vec2(0, -2)), i = s(vec2(2, -2));
  vec3 j = s(vec2(-1, 1)), k = s(vec2(1, 1)), l = s(vec2(-1, -1)), m = s(vec2(1, -1));
  vec3 r;
  if (uFirst > 0.5) {
    // Karis average on first downsample to tame fireflies
    vec3 g0 = (a + b + d + e) * 0.25, g1 = (b + c + e + f) * 0.25, g2 = (d + e + g + h) * 0.25, g3 = (e + f + h + i) * 0.25, g4 = (j + k + l + m) * 0.25;
    float w0 = karis(g0), w1 = karis(g1), w2 = karis(g2), w3 = karis(g3), w4 = karis(g4);
    r = (g0 * w0 * 0.125 + g1 * w1 * 0.125 + g2 * w2 * 0.125 + g3 * w3 * 0.125 + g4 * w4 * 0.5) / (w0 * 0.125 + w1 * 0.125 + w2 * 0.125 + w3 * 0.125 + w4 * 0.5);
  } else {
    r = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  }
  gl_FragColor = vec4(max(r, 0.0), 1.0);
}`;

const UP_FS = /* glsl */`
uniform sampler2D tLow, tHigh; uniform vec2 uTexel; uniform float uRadius;
varying vec2 vUv;
void main(){
  vec2 t = uTexel * uRadius;
  vec3 c = texture2D(tLow, vUv).rgb * 4.0;
  c += (texture2D(tLow, vUv + vec2(-t.x, 0)).rgb + texture2D(tLow, vUv + vec2(t.x, 0)).rgb + texture2D(tLow, vUv + vec2(0, t.y)).rgb + texture2D(tLow, vUv + vec2(0, -t.y)).rgb) * 2.0;
  c += texture2D(tLow, vUv + vec2(-t.x, t.y)).rgb + texture2D(tLow, vUv + vec2(t.x, t.y)).rgb + texture2D(tLow, vUv + vec2(-t.x, -t.y)).rgb + texture2D(tLow, vUv + vec2(t.x, -t.y)).rgb;
  gl_FragColor = vec4(c / 16.0 + texture2D(tHigh, vUv).rgb, 1.0);
}`;

const FINAL_FS = /* glsl */`
uniform sampler2D tColor, tBloom;
uniform vec2 uRes, uWeave;
uniform float uExposure, uBloom, uHalation, uVignette, uCA, uGrain, uFrame, uSat, uFade, uContrast, uLookPow, uLookSat;
uniform vec3 uLift, uGain, uGammaV, uShadowTint, uHighTint;
varying vec2 vUv;

vec3 agxContrast(vec3 x){ vec3 x2 = x * x; vec3 x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 agx(vec3 v){
  const mat3 m = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                      0.0784335999999992, 0.878468636469772, 0.0784336,
                      0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  const float lo = -12.47393, hi = 4.026069;
  v = m * v;
  v = clamp(log2(max(v, 1e-10)), lo, hi);
  v = (v - lo) / (hi - lo);
  return agxContrast(v);
}
vec3 agxEotf(vec3 v){
  const mat3 mi = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                       -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                       -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
  return mi * v;
}
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y); }

void main(){
  vec2 uv = vUv + uWeave;
  vec2 d = uv - 0.5;
  vec3 col;
  col.r = texture2D(tColor, uv - d * uCA).r;
  col.g = texture2D(tColor, uv).g;
  col.b = texture2D(tColor, uv + d * uCA).b;
  vec3 bl = texture2D(tBloom, uv).rgb / 7.0;
  col = mix(col, bl, uBloom);
  float bll = dot(bl, vec3(0.2126, 0.7152, 0.0722));
  col += uHalation * vec3(1.0, 0.28, 0.08) * max(bl - 0.25 * vec3(bll), 0.0) * smoothstep(0.05, 1.5, bll);
  col *= uExposure;
  float asp = uRes.x / uRes.y;
  float vr = length(d * vec2(asp, 1.0) * 0.82);
  col *= mix(1.0, smoothstep(1.05, 0.25, vr), uVignette);
  col = agx(col);
  { // AgX look: power + saturation (pushes night shadows down)
    float lw = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = pow(max(col, 0.0), vec3(uLookPow));
    float lw2 = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = lw2 + uLookSat * (col - lw2);
  }
  col = agxEotf(col);
  col = clamp(col, 0.0, 1.0);
  // split-tone grade in display space
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, col * uShadowTint, (1.0 - smoothstep(0.0, 0.45, l)));
  col = mix(col, col * uHighTint, smoothstep(0.35, 1.0, l));
  col = col * uGain + uLift * (1.0 - col);
  col = pow(max(col, 0.0), 1.0 / uGammaV);
  col = mix(vec3(0.5), col, uContrast);
  l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(l), col, uSat);
  // film grain: soft, luma dependent, slight chroma
  vec2 gp = gl_FragCoord.xy / 1.35 + vec2(uFrame * 37.7, uFrame * 91.3);
  float g = vnoise(gp) * 0.65 + vnoise(gp * 1.9 + 13.1) * 0.35 - 0.5;
  vec3 gc = vec3(vnoise(gp + 71.0), vnoise(gp + 151.0), vnoise(gp + 231.0)) - 0.5;
  float amp = uGrain * (0.55 + 1.6 * l * (1.0 - l));
  col += amp * (g + gc * 0.25);
  col *= 1.0 - uFade;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

export class Post {
  constructor(renderer, W, H, opts = {}) {
    this.renderer = renderer; this.W = W; this.H = H;
    const volScale = opts.volScale ?? 0.5;
    const ss = this.ss = opts.ss ?? 1;
    const hf = THREE.HalfFloatType;
    const depthTexture = new THREE.DepthTexture(W * ss, H * ss, THREE.FloatType);
    this.rtScene = new THREE.WebGLRenderTarget(W * ss, H * ss, { type: hf, samples: opts.samples ?? 4, depthTexture });
    this.rtScene.texture.minFilter = this.rtScene.texture.magFilter = THREE.LinearFilter;
    this.rtVol = new THREE.WebGLRenderTarget(Math.round(W * volScale), Math.round(H * volScale), { type: hf, depthBuffer: false });
    this.rtVol.texture.minFilter = this.rtVol.texture.magFilter = THREE.LinearFilter;
    this.rtA = new THREE.WebGLRenderTarget(W, H, { type: hf, depthBuffer: false });
    this.rtB = new THREE.WebGLRenderTarget(W, H, { type: hf, depthBuffer: false });
    this.rtC = new THREE.WebGLRenderTarget(W, H, { type: hf, depthBuffer: false });
    this.down = []; this.up = [];
    let w = W, h = H;
    for (let i = 0; i < 7; i++) {
      w = Math.max(1, Math.floor(w / 2)); h = Math.max(1, Math.floor(h / 2));
      const o = { type: hf, depthBuffer: false };
      this.down.push(new THREE.WebGLRenderTarget(w, h, o));
      this.up.push(new THREE.WebGLRenderTarget(w, h, o));
    }
    for (const rt of [...this.down, ...this.up, this.rtA, this.rtB, this.rtC]) { rt.texture.minFilter = rt.texture.magFilter = THREE.LinearFilter; }
    this.composite = new Pass(COMPOSITE_FS, { tScene: { value: null }, tVol: { value: this.rtVol.texture }, uVolOn: { value: 1 }, uSS: { value: ss }, uHiRes: { value: new THREE.Vector2(W * ss, H * ss) }, uVolRes: { value: new THREE.Vector2(this.rtVol.width, this.rtVol.height) } });
    this.mb = new Pass(MB_FS, { tColor: { value: null }, tDepth: { value: depthTexture }, uInvViewProj: { value: new THREE.Matrix4() }, uPrevViewProj: { value: new THREE.Matrix4() }, uRes: { value: new THREE.Vector2(W, H) }, uMaxPx: { value: 48 } });
    this.dof = new Pass(DOF_FS, { tColor: { value: null }, tDepth: { value: depthTexture }, uRes: { value: new THREE.Vector2(W, H) }, uFocus: { value: 10 }, uCocScale: { value: 1 }, uMaxCoc: { value: 12 }, uNear: { value: 0.1 }, uFar: { value: 1000 } }, { SAMPLES: opts.dofSamples ?? 56 });
    this.downPass = new Pass(DOWN_FS, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uFirst: { value: 0 } });
    this.upPass = new Pass(UP_FS, { tLow: { value: null }, tHigh: { value: null }, uTexel: { value: new THREE.Vector2() }, uRadius: { value: 1 } });
    this.final = new Pass(FINAL_FS, {
      tColor: { value: null }, tBloom: { value: null }, uRes: { value: new THREE.Vector2(W, H) }, uWeave: { value: new THREE.Vector2() },
      uExposure: { value: 1 }, uBloom: { value: 0.06 }, uHalation: { value: 0.08 }, uVignette: { value: 0.55 }, uCA: { value: 0.0018 }, uGrain: { value: 0.045 },
      uFrame: { value: 0 }, uSat: { value: 0.95 }, uFade: { value: 0 }, uContrast: { value: 1.0 }, uLookPow: { value: 1.0 }, uLookSat: { value: 1.0 },
      uLift: { value: new THREE.Vector3(0.010, 0.014, 0.022) }, uGain: { value: new THREE.Vector3(1, 1, 1) }, uGammaV: { value: new THREE.Vector3(1, 1, 1) },
      uShadowTint: { value: new THREE.Vector3(0.92, 1.0, 1.12) }, uHighTint: { value: new THREE.Vector3(1.06, 1.0, 0.92) },
    });
    this.clearColor = new THREE.Color(0, 0, 0);
  }

  // look: plain object of final-grade params; cam: camera; prevVP: Matrix4 of the camera at shutter open
  render(scene, camera, opt) {
    const r = this.renderer;
    const { look = {}, prevViewProj = null, dof = null, frame = 0, fade = 0, weave = [0, 0], volumes = true } = opt;
    r.setClearColor(this.clearColor, 1);
    // 1) opaque + embedded transparents
    camera.layers.set(0);
    r.setRenderTarget(this.rtScene); r.clear(true, true, true);
    r.render(scene, camera);
    // 2) volumes at reduced resolution
    if (volumes) {
      camera.layers.set(1);
      r.setClearColor(this.clearColor, 0);
      r.setRenderTarget(this.rtVol); r.clear(true, false, false);
      r.render(scene, camera);
      r.setClearColor(this.clearColor, 1);
    }
    // 3) composite volumes over scene
    this.composite.uniforms.tScene.value = this.rtScene.texture;
    this.composite.uniforms.uVolOn.value = volumes ? 1 : 0;
    this.composite.render(r, this.rtA);
    // 4) foreground particles, manually depth tested in their shaders
    camera.layers.set(2);
    r.setRenderTarget(this.rtA);
    r.autoClear = false; r.render(scene, camera); r.autoClear = true;
    camera.layers.set(0);
    let src = this.rtA;
    // 5) camera motion blur
    if (prevViewProj) {
      const u = this.mb.uniforms;
      u.tColor.value = src.texture;
      u.uInvViewProj.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).invert();
      u.uPrevViewProj.value.copy(prevViewProj);
      this.mb.render(r, this.rtB); src = this.rtB;
    }
    // 6) depth of field
    if (dof) {
      const u = this.dof.uniforms;
      u.tColor.value = src.texture; u.uFocus.value = dof.focus; u.uMaxCoc.value = dof.maxCoc ?? 14;
      u.uNear.value = camera.near; u.uFar.value = camera.far;
      // CoC in pixels: f^2/(N*(S-f)) * |1/S-1/z|*S ... expressed as scale on |1/S - 1/z|
      const f = dof.focal / 1000, N = dof.fstop, S = dof.focus, sensor = 0.02489;
      u.uCocScale.value = (f * f / (N * (1 - f / S))) * 0.5 / sensor * this.W;
      const dst = src === this.rtB ? this.rtC : this.rtB;
      this.dof.render(r, dst); src = dst;
    }
    // 7) bloom chain
    let prev = src;
    for (let i = 0; i < this.down.length; i++) {
      const u = this.downPass.uniforms;
      u.tSrc.value = prev.texture; u.uTexel.value.set(1 / prev.width, 1 / prev.height); u.uFirst.value = i === 0 ? 1 : 0;
      this.downPass.render(r, this.down[i]); prev = this.down[i];
    }
    let low = this.down[this.down.length - 1];
    for (let i = this.down.length - 2; i >= 0; i--) {
      const u = this.upPass.uniforms;
      u.tLow.value = low.texture; u.tHigh.value = this.down[i].texture; u.uTexel.value.set(1 / low.width, 1 / low.height); u.uRadius.value = 1.0;
      this.upPass.render(r, this.up[i]); low = this.up[i];
    }
    // 8) final grade to canvas
    const u = this.final.uniforms;
    u.tColor.value = src.texture; u.tBloom.value = this.up[0].texture;
    u.uFrame.value = frame; u.uFade.value = fade; u.uWeave.value.set(weave[0] / this.W, weave[1] / this.H);
    // bloom chain sums 7 levels; normalise
    for (const k of Object.keys(look)) {
      if (!u[k]) continue;
      const v = look[k];
      if (Array.isArray(v)) u[k].value.set(...v); else u[k].value = v;
    }
    this.final.render(r, null);
  }
}
