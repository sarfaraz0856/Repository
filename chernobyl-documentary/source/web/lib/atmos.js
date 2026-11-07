// Shared atmosphere: height fog with directional glow, moon halo and analytic in-scattering
// from one fire point light. Injected into every lit material so the whole frame agrees.
import * as THREE from 'three';

export const ATM = {
  uFogColor: { value: new THREE.Color(0.004, 0.006, 0.011) },
  uFogDensity: { value: 0.0006 },
  uFogBase: { value: 0.0 },
  uFogHeight: { value: 180.0 },
  uGlowDir: { value: new THREE.Vector3(1, 0, 0) },
  uGlowCol: { value: new THREE.Color(0, 0, 0) },
  uGlowPow: { value: 6.0 },
  uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
  uMoonHalo: { value: new THREE.Color(0, 0, 0) },
  uFirePos: { value: new THREE.Vector3(0, -1e5, 0) },
  uFireFog: { value: new THREE.Color(0, 0, 0) },
  uFireFogR: { value: 30.0 },
  uLampMap: { value: null },
  uLampMapOn: { value: 0 },
  uLampBounds: { value: new THREE.Vector4(-1000, -1000, 2000, 2000) }, // x0, z0, sizeX, sizeZ
  uLampGain: { value: 1.0 },
  uTime: { value: 0 },
};

export const FOG_GLSL = /* glsl */`
uniform vec3 uFogColor, uGlowCol, uMoonHalo, uFireFog;
uniform vec3 uGlowDir, uMoonDir, uFirePos;
uniform float uFogDensity, uFogBase, uFogHeight, uGlowPow, uFireFogR;
float fogAmount(vec3 ro, vec3 wp){
  vec3 v = wp - ro; float dist = length(v); vec3 dir = v / max(dist, 1e-4);
  float k = uFogDensity * exp(-(ro.y - uFogBase) / uFogHeight);
  float a = dir.y * dist / uFogHeight;
  float integ = abs(a) > 1e-4 ? k * dist * (1.0 - exp(-a)) / a : k * dist;
  return 1.0 - exp(-max(integ, 0.0));
}
vec3 fogColorDir(vec3 dir){
  float g = pow(max(dot(normalize(vec3(dir.x, max(dir.y, 0.0) * 0.6, dir.z)), uGlowDir), 0.0), uGlowPow);
  float m = pow(max(dot(dir, uMoonDir), 0.0), 24.0);
  return uFogColor + uGlowCol * g + uMoonHalo * m;
}
vec3 fireInscatter(vec3 ro, vec3 dir, float dist){
  vec3 lo = uFirePos - ro; float b = dot(lo, dir);
  float h2 = max(dot(lo, lo) - b * b, 1.0);
  float h = sqrt(h2 + uFireFogR * uFireFogR);
  float I = (atan((dist - b) / h) - atan(-b / h)) / h;
  return uFireFog * I * uFireFogR;
}
vec3 applyFog(vec3 col, vec3 ro, vec3 wp){
  vec3 v = wp - ro; float dist = length(v); vec3 dir = v / max(dist, 1e-4);
  float f = fogAmount(ro, wp);
  col = mix(col, fogColorDir(dir), f);
  col += fireInscatter(ro, dir, dist) * (0.35 + 0.65 * f);
  return col;
}`;

const LAMP_GLSL = /* glsl */`
uniform sampler2D uLampMap; uniform float uLampMapOn, uLampGain; uniform vec4 uLampBounds;
vec3 lampLight(vec3 wp, vec3 n){
  if (uLampMapOn < 0.5) return vec3(0.0);
  vec2 xz = wp.xz + n.xz * 3.0;
  vec2 uv = (xz - uLampBounds.xy) / uLampBounds.zw;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec3(0.0);
  vec3 l = texture2D(uLampMap, uv).rgb;
  float hf = exp(-max(wp.y - 5.0, 0.0) / 7.0);
  float up = n.y > 0.5 ? 1.0 : 0.55;
  return l * l * hf * up * uLampGain;
}`;

// Patch a built-in lit material: custom fog + lamp lightmap + optional extra hook code.
export function patchMaterial(mat, opts = {}) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, renderer) => {
    Object.assign(shader.uniforms, ATM, opts.uniforms || {});
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\n' + (opts.vertexHeader || ''))
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 aWP = vec4(transformed, 1.0);
        vec3 aWN = objectNormal;
        #ifdef USE_INSTANCING
          aWP = instanceMatrix * aWP; aWN = mat3(instanceMatrix) * aWN;
        #endif
        aWP = modelMatrix * aWP; vWPos = aWP.xyz; vWNrm = normalize(mat3(modelMatrix) * aWN);
        ${opts.vertexMain || ''}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNrm;\n' + FOG_GLSL + LAMP_GLSL + (opts.fragmentHeader || ''))
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        reflectedLight.directDiffuse += lampLight(vWPos, normalize(vWNrm)) * diffuseColor.rgb;
        ${opts.lightsEnd || ''}`)
      .replace('#include <fog_fragment>', `gl_FragColor.rgb = applyFog(gl_FragColor.rgb, cameraPosition, vWPos);`);
    if (opts.fragmentReplace) for (const [a, b] of opts.fragmentReplace) shader.fragmentShader = shader.fragmentShader.replace(a, b);
    if (prev) prev(shader, renderer);
  };
  mat.customProgramCacheKey = () => (opts.key || 'atm') + (mat.type);
  mat.fog = false;
  return mat;
}

// Night sky dome: layered overcast with moon breaking through, horizon light pollution
// and a directional glow (city / fire). Writes linear HDR.
export function makeSky(opts = {}) {
  const uniforms = Object.assign({
    tNoise: { value: opts.noiseTex },
    uZenith: { value: new THREE.Color(0.0015, 0.0022, 0.0045) },
    uHorizon: { value: new THREE.Color(0.006, 0.0075, 0.011) },
    uCloudLit: { value: new THREE.Color(0.02, 0.024, 0.032) },
    uCloudDark: { value: new THREE.Color(0.002, 0.0025, 0.0035) },
    uCloudCover: { value: 0.62 },
    uCloudScale: { value: 1.0 },
    uMoonCol: { value: new THREE.Color(0.18, 0.2, 0.24) },
    uSkyGlowDir: { value: new THREE.Vector3(1, 0, 0) },
    uSkyGlowCol: { value: new THREE.Color(0, 0, 0) },
    uSkyGlowPow: { value: 4.0 },
    uWind: { value: new THREE.Vector2(0.004, 0.002) },
  }, ATM);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){ vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4(cameraPosition + vDir * 9000.0, 1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */`
      precision highp sampler3D;
      uniform sampler3D tNoise;
      uniform vec3 uZenith, uHorizon, uCloudLit, uCloudDark, uMoonCol, uSkyGlowCol, uSkyGlowDir;
      uniform float uCloudCover, uCloudScale, uSkyGlowPow, uTime;
      uniform vec2 uWind;
      ${FOG_GLSL}
      varying vec3 vDir;
      float cl(vec2 p){ return texture(tNoise, vec3(p, 0.37)).r; }
      void main(){
        vec3 d = normalize(vDir);
        float up = max(d.y, 0.0);
        vec3 col = mix(uHorizon, uZenith, pow(up, 0.45));
        // cloud layer projected on a plane
        vec3 cloud = vec3(0.0); float cov = 0.0;
        if (d.y > 0.005) {
          vec2 p = d.xz / (d.y + 0.08) * 0.11 * uCloudScale + uWind * uTime;
          float n = (texture(tNoise, vec3(p * 0.8, 0.21)).r - 0.5) * 3.0 * 0.55 + (texture(tNoise, vec3(p * 2.1, 0.63)).r - 0.5) * 3.0 * 0.3 + (texture(tNoise, vec3(p * 5.3, 0.83)).g - 0.5) * 0.35;
          n = n * 0.5 + 0.5;
          cov = smoothstep(1.0 - uCloudCover - 0.15, 1.0 - uCloudCover + 0.25, n);
          float thick = smoothstep(0.4, 0.95, n);
          float m = pow(max(dot(d, uMoonDir), 0.0), 6.0);
          vec3 lit = mix(uCloudLit, uCloudDark, thick) + uMoonCol * m * (1.0 - thick) * 0.6;
          float g = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), uSkyGlowDir), 0.0), uSkyGlowPow) * exp(-up * 5.0);
          lit += uSkyGlowCol * g * (0.6 + 0.8 * thick);
          cloud = lit;
          cov *= smoothstep(0.0, 0.08, d.y);
        }
        // moon disc + halo through thin cloud
        float md = dot(d, uMoonDir);
        vec3 moon = uMoonCol * (smoothstep(0.99985, 0.99992, md) * 60.0 + pow(max(md, 0.0), 220.0) * 1.5 + pow(max(md, 0.0), 18.0) * 0.12);
        col += moon * (1.0 - cov * 0.92);
        col = mix(col, cloud, cov);
        float g2 = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), uSkyGlowDir), 0.0), uSkyGlowPow) * exp(-up * 7.0);
        col += uSkyGlowCol * g2 * 0.6;
        // horizon haze consistent with ground fog
        float hz = exp(-up * 10.0);
        col = mix(col, fogColorDir(d), hz * 0.85);
        col += fireInscatter(cameraPosition, d, 6000.0) * 0.6;
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.BackSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -100;
  mesh.uniforms = uniforms;
  return mesh;
}
