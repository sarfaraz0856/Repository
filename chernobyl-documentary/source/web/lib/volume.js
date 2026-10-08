// Raymarched participating media: smoke/steam plumes with fire at the base, an explosion
// fireball, and low-lying drifting smoke. Rendered on layer 1 into a reduced-resolution
// premultiplied buffer, terminated against the opaque scene depth.
import * as THREE from 'three';

const VS = /* glsl */`
varying vec3 vWorld;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;

const FS = /* glsl */`
precision highp sampler3D;
uniform sampler3D tNoise;
uniform sampler2D tDepth;
uniform vec2 uVolRes;
uniform float uNear, uFar, uTime, uFrame, uExt, uMinStep;
uniform vec3 uBoxMin, uBoxMax, uCamFwd;
uniform vec4 uPA[3], uPB[3], uPC[3], uPD[3];
uniform int uPlumes;
uniform vec4 uFbA, uFbB;
uniform vec4 uGsA, uGsB, uGsC;
uniform vec3 uFirePos, uFireCol;
uniform float uFireR, uFireShadowLen;
uniform vec3 uMoonDir, uMoonCol, uAmbTop, uAmbBot;
uniform vec4 uLpos[4], uLcol[4], uLdir[4];
uniform int uLcount;
varying vec3 vWorld;

float viewDepth(float d){ float ndc = d * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear)); }
vec4 nz(vec3 p){ return texture(tNoise, p); }
vec2 boxHit(vec3 ro, vec3 rd){
  vec3 inv = 1.0 / rd; vec3 a = (uBoxMin - ro) * inv, b = (uBoxMax - ro) * inv;
  vec3 mn = min(a, b), mx = max(a, b);
  return vec2(max(max(mn.x, mn.y), mn.z), min(min(mx.x, mx.y), mx.z));
}
vec3 blackbody(float t){
  t = clamp(t, 0.0, 1.2);
  vec3 c = mix(vec3(1.0, 0.16, 0.02), vec3(1.0, 0.42, 0.07), smoothstep(0.0, 0.4, t));
  c = mix(c, vec3(1.0, 0.72, 0.36), smoothstep(0.4, 0.8, t));
  c = mix(c, vec3(1.0, 0.93, 0.82), smoothstep(0.8, 1.1, t));
  return c * (0.08 + 2.5 * t * t * t);
}

float plumeD(int i, vec3 p, inout vec3 emis, bool cheap){
  vec4 A = uPA[i], B = uPB[i], C = uPC[i], D = uPD[i];
  vec3 q = p - A.xyz;
  float h = q.y;
  if (h < -A.w * 0.6 || h > B.y) return 0.0;
  float hn = clamp(h / B.y, 0.0, 1.0);
  vec2 c = C.xz * max(h, 0.0) * (0.12 + 0.88 * hn);
  float r = A.w + B.x * max(h, 0.0);
  vec2 dxz = q.xz - c;
  float dist = length(dxz) / r;
  if (dist > 1.35) return 0.0;
  float ns = C.w;
  vec3 np = vec3(dxz.x, h - uTime * B.w, dxz.y) * ns + vec3(D.w * 0.37);
  vec4 w = nz(np * 0.29 + vec3(0.17, 0.0, 0.53));
  np += (w.a - 0.5) * 2.2 * vec3(1.0, 0.7, 1.0);
  float base = clamp((nz(np).r - 0.50) * 3.0, 0.0, 1.0);
  float sh = 1.0 - smoothstep(0.2, 1.15, dist + (0.5 - base) * 0.6);
  sh *= smoothstep(-A.w * 0.6, A.w * 0.5, h);
  sh *= 1.0 - smoothstep(0.65, 1.0, hn);
  float d = sh - (1.0 - base) * 0.42;
  if (!cheap && d > -0.15) {
    float det = nz(np * 2.9 + vec3(0.31, 0.47, 0.11)).g;
    d -= (1.0 - det) * 0.24 * (1.0 - 0.4 * sh);
  }
  d = clamp(d * 2.4, 0.0, 1.0);
  if (!cheap && D.x > 0.0 && h < D.x * 1.5) {
    float fh = 1.0 - smoothstep(0.0, D.x, h + (0.5 - base) * D.x * 0.8);
    float core = 1.0 - smoothstep(0.0, 0.85, dist);
    emis += blackbody(0.35 + 0.65 * fh * core) * D.y * fh * core * (0.5 + base);
  }
  return d * B.z;
}

float fireballD(vec3 p, inout vec3 emis, bool cheap){
  if (uFbB.w < 0.5) return 0.0;
  vec3 q = p - uFbA.xyz; float R = uFbA.w;
  float r = length(q * vec3(1.0, 0.8, 1.0)) / R;
  if (r > 1.6) return 0.0;
  vec3 np = q / R * 0.42 + vec3(0.37, 0.11 - uTime * 0.03, 0.73);
  float nb = clamp((nz(np).r - 0.5) * 3.0, 0.0, 1.0);
  float nd = cheap ? 0.5 : nz(np * 2.3).g;
  float edge = r + (0.5 - nb) * 0.75 + (0.5 - nd) * 0.3;
  float d = 1.0 - smoothstep(0.45, 1.2, edge);
  if (!cheap) {
    float tmp = uFbB.y * (1.0 - smoothstep(0.0, 1.05, edge));
    emis += blackbody(tmp) * uFbB.z * d * (0.4 + nb);
  }
  return d * uFbB.x;
}

float groundD(vec3 p, bool cheap){
  if (uGsB.w < 0.5) return 0.0;
  vec3 q = p - uGsA.xyz;
  float rr = length(q.xz) / uGsA.w;
  if (rr > 1.0 || q.y > uGsB.x * 3.0 || q.y < -1.0) return 0.0;
  vec3 np = vec3(q.x - uTime * uGsC.x, q.y * 1.4 - uTime * uGsC.y, q.z - uTime * uGsC.z) * uGsB.z;
  vec4 w = nz(np * 0.37 + 0.21);
  np += (w.a - 0.5) * 1.5;
  float n = clamp((nz(np).r - 0.5) * 3.0, 0.0, 1.0);
  float hf = exp(-max(q.y, 0.0) / uGsB.x);
  float d = clamp((n - 0.3) * 1.7, 0.0, 1.0) * hf * (1.0 - smoothstep(0.55, 1.0, rr));
  return d * uGsB.y;
}

float densityAt(vec3 p, inout vec3 emis, bool cheap){
  float d = 0.0;
  for (int i = 0; i < 3; i++) { if (i >= uPlumes) break; d += plumeD(i, p, emis, cheap); }
  d += fireballD(p, emis, cheap);
  d += groundD(p, cheap);
  return d;
}

float hg(float c, float g){ float g2 = g * g; return (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * c, 1.5); }

vec3 inscatter(vec3 p, vec3 rd){
  vec3 L = vec3(0.0); vec3 dummy = vec3(0.0);
  vec3 toF = uFirePos - p; float dF = length(toF); vec3 lF = toF / max(dF, 1e-3);
  float segF = min(dF, uFireShadowLen);
  float od = 0.0;
  for (int k = 0; k < SH_STEPS; k++) {
    float s = segF * (float(k) + 0.5) / float(SH_STEPS);
    od += densityAt(p + lF * s, dummy, true);
  }
  od *= segF / float(SH_STEPS) * uExt;
  float att = 1.0 / (1.0 + dF * dF / (uFireR * uFireR));
  L += uFireCol * att * exp(-od) * (0.55 * hg(dot(rd, lF), 0.35) + 0.45);
  float odm = densityAt(p + uMoonDir * 14.0, dummy, true) * 14.0 + densityAt(p + uMoonDir * 40.0, dummy, true) * 26.0;
  L += uMoonCol * exp(-odm * uExt) * (0.6 * hg(dot(rd, uMoonDir), 0.45) + 0.4);
  float hgt = clamp((p.y - uBoxMin.y) / max(uBoxMax.y - uBoxMin.y, 1.0), 0.0, 1.0);
  L += mix(uAmbBot, uAmbTop, hgt);
  for (int i = 0; i < 4; i++) {
    if (i >= uLcount) break;
    vec3 tl = uLpos[i].xyz - p; float dl = length(tl); vec3 ll = tl / max(dl, 1e-3);
    float a = 1.0 / (1.0 + dl * dl / (uLpos[i].w * uLpos[i].w));
    float cone = 1.0;
    if (uLcol[i].w > -1.5) cone = smoothstep(uLcol[i].w, mix(uLcol[i].w, 1.0, 0.35), dot(-ll, uLdir[i].xyz));
    L += uLcol[i].rgb * a * cone * (0.7 * hg(dot(rd, ll), 0.55) + 0.3);
  }
  return L;
}

void main(){
  vec3 ro = cameraPosition;
  vec3 rd = normalize(vWorld - ro);
  vec2 th = boxHit(ro, rd);
  float t0 = max(th.x, 0.0), t1 = th.y;
  vec2 suv = gl_FragCoord.xy / uVolRes;
  float sd = texture(tDepth, suv).r;
  if (sd < 0.99999) t1 = min(t1, viewDepth(sd) / max(dot(rd, uCamFwd), 1e-3));
  if (t1 <= t0) { gl_FragColor = vec4(0.0); return; }
  float len = t1 - t0;
  int n = int(min(float(STEPS), ceil(len / uMinStep)));
  float dt = len / float(n);
  float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))) + uFrame * 0.6180339);
  float t = t0 + dt * jit;
  vec3 scat = vec3(0.0); float T = 1.0;
  for (int i = 0; i < STEPS; i++) {
    if (i >= n) break;
    vec3 p = ro + rd * t;
    vec3 emis = vec3(0.0);
    float dens = densityAt(p, emis, false);
    if (dens > 0.003 || dot(emis, emis) > 1e-6) {
      float sig = max(dens * uExt, 1e-5);
      float Ts = exp(-sig * dt);
      vec3 Lin = dens > 0.003 ? inscatter(p, rd) * ALBEDO : vec3(0.0);
      scat += T * (Lin * (1.0 - Ts) + emis * dt * 0.02 * (0.3 + 0.7 * min(dens * 4.0, 1.0)));
      T *= Ts;
      if (T < 0.015) break;
    }
    t += dt;
  }
  gl_FragColor = vec4(scat, 1.0 - T);
}`;

export class VolumeFX {
  constructor({ noiseTex, post, boxMin, boxMax, steps = 64, shadowSteps = 4, albedo = 0.75 }) {
    const v4 = () => new THREE.Vector4();
    this.uniforms = {
      tNoise: { value: noiseTex }, tDepth: { value: post.rtScene.depthTexture },
      uVolRes: { value: new THREE.Vector2(post.rtVol.width, post.rtVol.height) },
      uNear: { value: 0.1 }, uFar: { value: 1000 }, uTime: { value: 0 }, uFrame: { value: 0 }, uExt: { value: 0.05 }, uMinStep: { value: 1.0 },
      uBoxMin: { value: new THREE.Vector3(...boxMin) }, uBoxMax: { value: new THREE.Vector3(...boxMax) }, uCamFwd: { value: new THREE.Vector3() },
      uPA: { value: [v4(), v4(), v4()] }, uPB: { value: [v4(), v4(), v4()] }, uPC: { value: [v4(), v4(), v4()] }, uPD: { value: [v4(), v4(), v4()] }, uPlumes: { value: 0 },
      uFbA: { value: v4() }, uFbB: { value: v4() },
      uGsA: { value: v4() }, uGsB: { value: v4() }, uGsC: { value: v4() },
      uFirePos: { value: new THREE.Vector3() }, uFireCol: { value: new THREE.Vector3() }, uFireR: { value: 40 }, uFireShadowLen: { value: 200 },
      uMoonDir: { value: new THREE.Vector3(0, 1, 0) }, uMoonCol: { value: new THREE.Vector3() },
      uAmbTop: { value: new THREE.Vector3() }, uAmbBot: { value: new THREE.Vector3() },
      uLpos: { value: [v4(), v4(), v4(), v4()] }, uLcol: { value: [v4(), v4(), v4(), v4()] }, uLdir: { value: [v4(), v4(), v4(), v4()] }, uLcount: { value: 0 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: FS, uniforms: this.uniforms,
      defines: { STEPS: steps, SH_STEPS: shadowSteps, ALBEDO: albedo.toFixed(3) },
      side: THREE.BackSide, transparent: true, depthTest: false, depthWrite: false,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
    });
    const size = new THREE.Vector3(...boxMax).sub(new THREE.Vector3(...boxMin));
    const center = new THREE.Vector3(...boxMin).add(new THREE.Vector3(...boxMax)).multiplyScalar(0.5);
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), this.material);
    this.mesh.position.copy(center);
    this.mesh.frustumCulled = false;
    this.mesh.layers.set(1);
    this.mesh.renderOrder = 10;
  }
  // plume: {base:[x,y,z], r0, spread, height, density, rise, wind:[x,z], noiseScale, fireH, fireEmis, seed}
  setPlumes(list) {
    const u = this.uniforms;
    u.uPlumes.value = list.length;
    list.forEach((p, i) => {
      u.uPA.value[i].set(p.base[0], p.base[1], p.base[2], p.r0);
      u.uPB.value[i].set(p.spread, p.height, p.density, p.rise);
      u.uPC.value[i].set(p.wind[0], 0, p.wind[1], p.noiseScale);
      u.uPD.value[i].set(p.fireH || 0, p.fireEmis || 0, 0, p.seed || 0);
    });
  }
  setFireball(fb) {
    const u = this.uniforms;
    if (!fb) { u.uFbB.value.w = 0; return; }
    u.uFbA.value.set(fb.center[0], fb.center[1], fb.center[2], fb.radius);
    u.uFbB.value.set(fb.density, fb.temp, fb.emis, 1);
  }
  setGround(g) {
    const u = this.uniforms;
    if (!g) { u.uGsB.value.w = 0; return; }
    u.uGsA.value.set(g.center[0], g.center[1], g.center[2], g.radius);
    u.uGsB.value.set(g.height, g.density, g.noiseScale, 1);
    u.uGsC.value.set(g.drift[0], g.drift[1], g.drift[2], 0);
  }
  // lights: [{pos:[x,y,z], range, color:[r,g,b], cone: cos or -2 for point, dir:[x,y,z]}]
  setLights(list) {
    const u = this.uniforms;
    u.uLcount.value = list.length;
    list.forEach((l, i) => {
      u.uLpos.value[i].set(l.pos[0], l.pos[1], l.pos[2], l.range);
      u.uLcol.value[i].set(l.color[0], l.color[1], l.color[2], l.cone ?? -2);
      const d = l.dir || [0, -1, 0];
      u.uLdir.value[i].set(d[0], d[1], d[2], 0);
    });
  }
  setLighting({ firePos, fireCol, fireR = 40, fireShadowLen = 200, moonDir, moonCol, ambTop, ambBot, ext, minStep }) {
    const u = this.uniforms;
    if (firePos) u.uFirePos.value.set(...firePos);
    if (fireCol) u.uFireCol.value.set(...fireCol);
    u.uFireR.value = fireR; u.uFireShadowLen.value = fireShadowLen;
    if (moonDir) u.uMoonDir.value.set(...moonDir).normalize();
    if (moonCol) u.uMoonCol.value.set(...moonCol);
    if (ambTop) u.uAmbTop.value.set(...ambTop);
    if (ambBot) u.uAmbBot.value.set(...ambBot);
    if (ext !== undefined) u.uExt.value = ext;
    if (minStep !== undefined) u.uMinStep.value = minStep;
  }
  update(t, frame, camera) {
    const u = this.uniforms;
    u.uTime.value = t; u.uFrame.value = frame;
    u.uNear.value = camera.near; u.uFar.value = camera.far;
    camera.getWorldDirection(u.uCamFwd.value);
  }
}
