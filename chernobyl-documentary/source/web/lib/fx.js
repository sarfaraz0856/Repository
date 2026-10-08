// Effects: procedural flames (billboards), streak particles (debris, embers, sparks, water),
// drifting dust with defocus. Every state is a closed-form function of time.
import * as THREE from 'three';
import { mulberry32, clamp, smoothstep, noise1 } from './util.js';
import { ATM, FOG_GLSL } from './atmos.js';

// ---------------- flames ----------------
// instances: [{pos:[x,y,z], w, h, seed, gain}] ; camera-facing around Y, additive.
export class Flames {
  constructor(ctx, list, { layer = 0 } = {}) {
    const n = list.length;
    const geo = new THREE.InstancedBufferGeometry();
    const base = new THREE.PlaneGeometry(1, 1); base.translate(0, 0.5, 0);
    geo.index = base.index; geo.setAttribute('position', base.attributes.position); geo.setAttribute('uv', base.attributes.uv);
    this.aPos = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); // xyz, seed
    this.aSize = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); // w, h, gain, born
    geo.setAttribute('aPos', this.aPos); geo.setAttribute('aSize', this.aSize);
    geo.instanceCount = n;
    this.list = list;
    list.forEach((f, i) => { this.aPos.setXYZW(i, ...f.pos, f.seed ?? i * 1.37); this.aSize.setXYZW(i, f.w, f.h, f.gain ?? 1, f.born ?? -1e3); });
    this.uniforms = { tNoise: { value: ctx.noiseTex }, uTime: ATM.uTime, uGain: { value: 1 }, uFogDensity: ATM.uFogDensity };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */`
        attribute vec4 aPos; attribute vec4 aSize; varying vec2 vUv; varying float vSeed; varying float vGain; varying float vFog; varying float vAge;
        uniform float uTime, uFogDensity;
        void main(){
          vUv = uv; vSeed = aPos.w;
          float age = uTime - aSize.w; vAge = age;
          float grow = smoothstep(0.0, 1.2, age);
          vGain = aSize.z * grow;
          vec3 c = aPos.xyz;
          vec3 toCam = cameraPosition - c; toCam.y = 0.0; toCam = normalize(toCam);
          vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCam));
          float h = aSize.y * (0.4 + 0.6 * grow);
          vec3 wp = c + right * (position.x * aSize.x) + vec3(0.0, position.y * h, 0.0) + toCam * 0.5;
          vec4 mv = viewMatrix * vec4(wp, 1.0);
          vFog = exp(-uFogDensity * 0.9 * -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        precision highp sampler3D;
        uniform sampler3D tNoise; uniform float uTime, uGain;
        varying vec2 vUv; varying float vSeed; varying float vGain; varying float vFog; varying float vAge;
        vec3 bb(float t){ t = clamp(t, 0.0, 1.2);
          vec3 c = mix(vec3(1.0, 0.16, 0.02), vec3(1.0, 0.42, 0.07), smoothstep(0.0, 0.4, t));
          c = mix(c, vec3(1.0, 0.72, 0.36), smoothstep(0.4, 0.8, t));
          c = mix(c, vec3(1.0, 0.93, 0.82), smoothstep(0.8, 1.1, t));
          return c * (0.1 + 2.6 * t * t * t); }
        void main(){
          if (vGain <= 0.0) discard;
          vec2 p = vUv;
          float x = (p.x - 0.5) * 2.0;
          float y = p.y;
          vec3 q = vec3(x * 0.8 + vSeed, y * 1.6 - uTime * 1.9, vSeed * 0.37 + uTime * 0.12);
          float n1 = texture(tNoise, q * 0.42).r;
          float n2 = texture(tNoise, q * 1.25 + 0.37).g;
          float n3 = texture(tNoise, q * 3.0 + 0.71).b;
          float n = (n1 - 0.62) * 3.0 + (n2 - 0.5) * 1.3 + (n3 - 0.5) * 0.6;
          float shape = 1.0 - abs(x + (n2 - 0.5) * 0.5 * y) * (1.1 + y * 1.3) - y * 1.0 + n * (0.28 + 0.7 * y);
          float m = smoothstep(0.0, 0.22, shape) * smoothstep(0.0, 0.06, y);
          if (m < 0.01) discard;
          float temp = clamp(shape * 1.5, 0.0, 1.1) * (1.0 - 0.35 * y);
          float flick = 0.85 + 0.3 * texture(tNoise, vec3(vSeed, uTime * 0.9, 0.2)).r;
          vec3 col = bb(temp) * m * vGain * uGain * flick * 3.0;
          gl_FragColor = vec4(col * vFog, 1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.layers.set(layer);
    this.mesh.renderOrder = 5;
  }
  setBorn(i, t) { this.aSize.setW(i, t); this.aSize.needsUpdate = true; }
}

// ---------------- streak particles ----------------
// Camera-facing quads stretched between the particle's position at shutter open and close.
// Depth-tested manually against the opaque scene depth (rendered on layer 2 after volumes).
export class Streaks {
  constructor(ctx, n, { layer = 2, minPx = 1.2, additive = true } = {}) {
    this.n = n;
    const geo = new THREE.InstancedBufferGeometry();
    const base = new THREE.PlaneGeometry(1, 1);
    geo.index = base.index; geo.setAttribute('position', base.attributes.position); geo.setAttribute('uv', base.attributes.uv);
    this.aA = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); // pos at shutter open, size
    this.aB = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); // pos at shutter close, unused
    this.aC = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); // rgb, alpha
    for (const a of [this.aA, this.aB, this.aC]) a.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aA', this.aA); geo.setAttribute('aB', this.aB); geo.setAttribute('aC', this.aC);
    geo.instanceCount = n;
    const post = ctx.post;
    this.uniforms = {
      tDepth: { value: post.rtScene.depthTexture }, uRes: { value: new THREE.Vector2(ctx.W, ctx.H) }, uNear: { value: 1 }, uFar: { value: 1000 },
      uPx: { value: 2 / ctx.H }, uMinPx: { value: minPx }, uFogDensity: ATM.uFogDensity, uManualDepth: { value: layer === 2 ? 1 : 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */`
        attribute vec4 aA; attribute vec4 aB; attribute vec4 aC;
        uniform float uPx, uMinPx, uFogDensity;
        varying vec4 vC; varying vec2 vUv; varying float vZ; varying float vThin;
        void main(){
          vec4 a = viewMatrix * vec4(aA.xyz, 1.0), b = viewMatrix * vec4(aB.xyz, 1.0);
          vec4 pa = projectionMatrix * a, pb = projectionMatrix * b;
          if (pa.w < 0.2 || pb.w < 0.2) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vC = vec4(0.0); vUv = uv; vZ = 0.0; vThin = 0.0; return; }
          vec2 sa = pa.xy / pa.w, sb = pb.xy / pb.w;
          float asp = projectionMatrix[1][1] / projectionMatrix[0][0];
          vec2 d = (sb - sa) * vec2(asp, 1.0);
          float len = length(d);
          vec2 dir = len > 1e-6 ? d / len : vec2(1.0, 0.0);
          vec2 nrm = vec2(-dir.y, dir.x);
          float zc = -(a.z + b.z) * 0.5;
          float wNdc = aA.w * projectionMatrix[1][1] / max(zc, 0.1);
          float wMin = uMinPx * uPx;
          float w = max(wNdc, wMin);
          vThin = clamp(wNdc / wMin, 0.05, 1.0);
          float t = position.y + 0.5;
          vec2 s = mix(sa, sb, t) + (nrm * position.x * w + dir * (position.y) * w) * vec2(1.0 / asp, 1.0);
          float zw = mix(pa.w, pb.w, t), zz = mix(pa.z / pa.w, pb.z / pb.w, t);
          gl_Position = vec4(s * zw, zz * zw, zw);
          float energy = w / max(w + len * 0.5, 1e-6);
          vC = vec4(aC.rgb * vThin * exp(-uFogDensity * 0.9 * zc) * mix(1.0, energy, 0.6), aC.a);
          vUv = uv; vZ = zc;
        }`,
      fragmentShader: /* glsl */`
        uniform sampler2D tDepth; uniform vec2 uRes; uniform float uNear, uFar, uManualDepth;
        varying vec4 vC; varying vec2 vUv; varying float vZ; varying float vThin;
        float viewDepth(float d){ float ndc = d * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear)); }
        void main(){
          if (vC.a <= 0.0) discard;
          float r = abs(vUv.x - 0.5) * 2.0;
          float a = 1.0 - smoothstep(0.3, 1.0, r);
          float e = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
          float vis = 1.0;
          if (uManualDepth > 0.5) {
            float sd = viewDepth(texture2D(tDepth, gl_FragCoord.xy / uRes).r);
            vis = smoothstep(0.0, 2.0, sd - vZ + 1.0);
          }
          gl_FragColor = vec4(vC.rgb * a * e * vis * vC.a, 1.0);
        }`,
      transparent: true, depthTest: layer !== 2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.material = mat;
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.layers.set(layer);
    this.mesh.renderOrder = 20;
  }
  set(i, a, b, size, r, g, bl, alpha = 1) {
    this.aA.setXYZW(i, a.x, a.y, a.z, size); this.aB.setXYZW(i, b.x, b.y, b.z, 0); this.aC.setXYZW(i, r, g, bl, alpha);
  }
  hide(i) { this.aC.setW(i, 0); }
  commit(camera) {
    this.aA.needsUpdate = this.aB.needsUpdate = this.aC.needsUpdate = true;
    this.uniforms.uNear.value = camera.near; this.uniforms.uFar.value = camera.far;
  }
}

// blackbody-ish ramp for particles (t: 0..1.2)
export function bbColor(t, out = [0, 0, 0]) {
  t = clamp(t, 0, 1.2);
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  let c = mix([1.0, 0.16, 0.02], [1.0, 0.42, 0.07], smoothstep(0, 0.4, t));
  c = mix(c, [1.0, 0.72, 0.36], smoothstep(0.4, 0.8, t));
  c = mix(c, [1.0, 0.93, 0.82], smoothstep(0.8, 1.1, t));
  const k = 0.1 + 2.6 * t * t * t;
  out[0] = c[0] * k; out[1] = c[1] * k; out[2] = c[2] * k;
  return out;
}

// Ballistic glowing debris (burning graphite / fragments) launched at tExp.
export class Debris {
  constructor(ctx, { n = 1500, origin, tExp, seed = 9, speed = [25, 95], spread = 0.9, drag = 0.35, landY = (x, z) => 0, gain = 1, life = [4, 20], size = [0.25, 0.9], bias = [0, 0, 0] }) {
    this.streaks = new Streaks(ctx, n, { layer: 2, minPx: 1.4 });
    const rnd = mulberry32(seed);
    this.p = [];
    for (let i = 0; i < n; i++) {
      const th = rnd() * Math.PI * 2, up = Math.pow(rnd(), 0.6);
      const el = THREE.MathUtils.lerp(Math.PI * 0.5, Math.PI * 0.5 - spread, Math.pow(rnd(), 0.8));
      const sp = THREE.MathUtils.lerp(speed[0], speed[1], Math.pow(rnd(), 1.5));
      const v = new THREE.Vector3(Math.cos(th) * Math.cos(el) + bias[0], Math.sin(el) + bias[1], Math.sin(th) * Math.cos(el) + bias[2]).multiplyScalar(sp * (0.7 + 0.6 * rnd()));
      const o = origin.clone().add(new THREE.Vector3((rnd() - 0.5) * 16, (rnd() - 0.2) * 8, (rnd() - 0.5) * 16));
      const k = drag * (0.6 + rnd() * 0.8);
      const part = { o, v, k, delay: rnd() * 0.25, temp: 0.55 + rnd() * 0.6, size: THREE.MathUtils.lerp(size[0], size[1], rnd() ** 2), life: THREE.MathUtils.lerp(life[0], life[1], rnd()), tLand: null, pLand: null, bright: rnd() < 0.08 ? 3 : 1 };
      // find landing time numerically
      let tl = null;
      for (let t = 0.05; t < 40; t += 0.05) { const q = this.pos(part, t); if (q.y < landY(q.x, q.z) && t > 0.2) { tl = t; break; } }
      if (tl !== null) { part.tLand = tl; part.pLand = this.pos(part, tl); part.pLand.y = landY(part.pLand.x, part.pLand.z) + 0.2; }
      this.p.push(part);
    }
    this.tExp = tExp; this.gain = gain;
    this.mesh = this.streaks.mesh;
  }
  pos(p, t) {
    const g = -9.81, k = p.k, ek = (1 - Math.exp(-k * t)) / k;
    return new THREE.Vector3(p.o.x + p.v.x * ek, p.o.y + p.v.y * ek + g * (t / k - ek / k), p.o.z + p.v.z * ek);
  }
  update(t, camera, shutter = 1 / 48) {
    const col = [0, 0, 0];
    for (let i = 0; i < this.p.length; i++) {
      const p = this.p[i];
      const tt = t - this.tExp - p.delay;
      if (tt <= 0 || tt > p.life + (p.tLand ?? 0)) { this.streaks.hide(i); continue; }
      const ta = Math.max(tt - shutter, 0);
      let a, b, landed = false;
      if (p.tLand !== null && tt >= p.tLand) { a = p.pLand; b = p.pLand.clone().add(new THREE.Vector3(0.001, 0, 0)); landed = true; }
      else { a = this.pos(p, ta); b = this.pos(p, tt); if (p.tLand !== null && ta >= p.tLand) a = p.pLand; }
      // temperature: hot at launch, cools in flight, embers keep glowing after landing
      let temp = p.temp * (0.55 + 0.45 * Math.exp(-tt / 1.2));
      if (landed) temp *= Math.exp(-(tt - p.tLand) / (p.life * 0.8)) * 0.8;
      temp *= 1 - smoothstep(p.life * 0.7, p.life, tt - (landed ? p.tLand : 0));
      const flick = 0.8 + 0.2 * noise1(tt * 6 + i, i);
      bbColor(temp * flick, col);
      const g = this.gain * p.bright * (landed ? 0.7 : 1);
      this.streaks.set(i, a, b, p.size, col[0] * g, col[1] * g, col[2] * g, 1);
    }
    this.streaks.commit(camera);
  }
}

// Rising embers from fire sources (continuous, looping lifetimes).
export class Embers {
  constructor(ctx, { n = 600, sources, seed = 5, rise = [3, 9], life = [3, 8], spread = 8, wind = [1.5, 0, -1], size = [0.05, 0.16], gain = 1, layer = 2, swirl = 3 }) {
    this.streaks = new Streaks(ctx, n, { layer, minPx: 1.1 });
    const rnd = mulberry32(seed);
    this.p = [];
    for (let i = 0; i < n; i++) {
      const s = sources[Math.floor(rnd() * sources.length)];
      this.p.push({
        s: new THREE.Vector3(...s.pos).add(new THREE.Vector3((rnd() - 0.5) * (s.r ?? spread) * 2, rnd() * 2, (rnd() - 0.5) * (s.r ?? spread) * 2)),
        rise: THREE.MathUtils.lerp(rise[0], rise[1], rnd()), life: THREE.MathUtils.lerp(life[0], life[1], rnd()), phase: rnd(),
        size: THREE.MathUtils.lerp(size[0], size[1], rnd() ** 2), temp: 0.32 + rnd() * 0.4, seed: rnd() * 100,
      });
    }
    this.wind = new THREE.Vector3(...wind); this.gain = gain; this.swirl = swirl;
    this.mesh = this.streaks.mesh;
  }
  posAt(p, age) {
    const sw = this.swirl;
    return new THREE.Vector3(
      p.s.x + this.wind.x * age + Math.sin(age * 1.3 + p.seed) * sw * Math.min(age, 1) + noise1(age * 0.8, p.seed) * sw,
      p.s.y + p.rise * age - 0.15 * age * age,
      p.s.z + this.wind.z * age + Math.cos(age * 1.1 + p.seed * 2) * sw * Math.min(age, 1) + noise1(age * 0.8, p.seed + 7) * sw);
  }
  update(t, camera, { gain = 1, shutter = 1 / 48 } = {}) {
    const col = [0, 0, 0];
    for (let i = 0; i < this.p.length; i++) {
      const p = this.p[i];
      const age = ((t / p.life + p.phase) % 1) * p.life;
      if (age < shutter) { this.streaks.hide(i); continue; }
      const a = this.posAt(p, age - shutter), b = this.posAt(p, age);
      let temp = p.temp * (1 - smoothstep(0.3 * p.life, p.life, age));
      temp *= 0.75 + 0.25 * noise1(age * 9 + p.seed, i);
      bbColor(temp, col);
      const g = this.gain * gain * smoothstep(0, 0.3, age);
      this.streaks.set(i, a, b, p.size, col[0] * g, col[1] * g, col[2] * g, 1);
    }
    this.streaks.commit(camera);
  }
}

// Fine drifting dust/ash for the aftermath, lit by a key light; out-of-focus particles get
// larger, fainter discs (cheap bokeh) based on a focus distance.
export class Dust {
  constructor(ctx, { n = 3000, center, size = [60, 20, 60], seed = 3, drift = [0.3, -0.05, 0.1], color = [0.6, 0.7, 0.9], gain = 1, focus = 10, aperture = 0.02 }) {
    const rnd = mulberry32(seed);
    const pos = new Float32Array(n * 3), rs = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      pos.set([(rnd() - 0.5) * size[0], (rnd() - 0.5) * size[1], (rnd() - 0.5) * size[2]], i * 3);
      rs.set([rnd(), rnd(), rnd(), 0.5 + rnd()], i * 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aR', new THREE.BufferAttribute(rs, 4));
    this.uniforms = {
      uTime: ATM.uTime, uCenter: { value: new THREE.Vector3(...center) }, uBox: { value: new THREE.Vector3(...size) }, uDrift: { value: new THREE.Vector3(...drift) },
      uColor: { value: new THREE.Vector3(...color) }, uGain: { value: gain }, uFocus: { value: focus }, uAperture: { value: aperture }, uScale: { value: ctx.H / 2 },
      tDepth: { value: ctx.post.rtScene.depthTexture }, uRes: { value: new THREE.Vector2(ctx.W, ctx.H) }, uNear: { value: 1 }, uFar: { value: 1000 },
      uLightPos: { value: new THREE.Vector3(0, 100, 0) }, uLightCol: { value: new THREE.Vector3(0, 0, 0) }, uLightR: { value: 30 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */`
        attribute vec4 aR; uniform float uTime, uFocus, uAperture, uScale, uLightR; uniform vec3 uCenter, uBox, uDrift, uColor, uLightPos, uLightCol;
        varying vec3 vC; varying float vZ; varying float vSoft;
        void main(){
          vec3 p = position + uDrift * uTime * (0.6 + 0.8 * aR.x) + vec3(sin(uTime * 0.7 + aR.y * 40.0), sin(uTime * 0.5 + aR.z * 30.0) * 0.6, cos(uTime * 0.6 + aR.x * 50.0)) * 0.4;
          p = mod(p + uBox * 0.5, uBox) - uBox * 0.5;
          vec3 wp = uCenter + p;
          vec4 mv = viewMatrix * vec4(wp, 1.0);
          float z = -mv.z; vZ = z;
          gl_Position = projectionMatrix * mv;
          float coc = uAperture * abs(z - uFocus) / max(z, 0.1) * uScale * 2.0;
          float base = 0.012 * aR.w * projectionMatrix[1][1] * uScale / max(z, 0.1);
          float ps = max(base, 1.0) + coc;
          gl_PointSize = clamp(ps, 1.0, 60.0);
          float area = max(base, 1.0) / ps;
          float dl = length(wp - uLightPos);
          vec3 lit = uColor + uLightCol / (1.0 + dl * dl / (uLightR * uLightR));
          vC = lit * area * area * (0.4 + 0.6 * aR.y);
          vSoft = clamp(coc / 6.0, 0.0, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform sampler2D tDepth; uniform vec2 uRes; uniform float uNear, uFar, uGain;
        varying vec3 vC; varying float vZ; varying float vSoft;
        float viewDepth(float d){ float ndc = d * 2.0 - 1.0; return (2.0 * uNear * uFar) / (uFar + uNear - ndc * (uFar - uNear)); }
        void main(){
          vec2 q = gl_PointCoord - 0.5; float r = length(q) * 2.0; if (r > 1.0) discard;
          float disc = mix(1.0 - smoothstep(0.2, 1.0, r), smoothstep(1.0, 0.85, r) * (0.75 + 0.25 * r), vSoft);
          float sd = viewDepth(texture2D(tDepth, gl_FragCoord.xy / uRes).r);
          float vis = smoothstep(0.0, 1.0, sd - vZ);
          gl_FragColor = vec4(vC * disc * vis * uGain, 1.0);
        }`,
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Points(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.layers.set(2);
  }
  update(camera) { this.uniforms.uNear.value = camera.near; this.uniforms.uFar.value = camera.far; }
}

// Soft additive light column (ionised-air glow reported by witnesses above the open reactor).
export function glowColumn(ctx, { pos, radius = 10, height = 300, color = [0.25, 0.4, 0.9] }) {
  const geo = new THREE.CylinderGeometry(radius, radius * 1.6, height, 32, 1, true); geo.translate(0, height / 2, 0);
  const u = { uColor: { value: new THREE.Vector3(...color) }, uGain: { value: 0 }, uH: { value: height }, uTime: ATM.uTime };
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); vY = position.y; gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uGain, uH, uTime; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.0); float h = vY / uH;
        float a = f * (1.0 - smoothstep(0.1, 1.0, h)) * smoothstep(0.0, 0.05, h) * (0.85 + 0.15 * sin(uTime * 3.0 + h * 12.0));
        gl_FragColor = vec4(uColor * a * uGain, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos); mesh.frustumCulled = false; mesh.renderOrder = 6;
  mesh.uniforms = u;
  return mesh;
}
