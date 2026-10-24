// Day / dawn sky: analytic gradient + sun disk and Mie glow + a lit cloud layer whose
// self-shadowing is estimated by sampling the cloud density toward the sun. Linear HDR.
import * as THREE from 'three';
import { ATM, FOG_GLSL } from './atmos.js';

export function sunDir(azimuthDeg, elevationDeg) {
  // azimuth clockwise from north; world: x = east, z = south
  const a = THREE.MathUtils.degToRad(azimuthDeg), e = THREE.MathUtils.degToRad(elevationDeg);
  return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)).normalize();
}

export function makeDaySky(opts = {}) {
  const uniforms = Object.assign({
    tNoise: { value: opts.noiseTex },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Color(1, 0.8, 0.6) },
    uZenith: { value: new THREE.Color(0.05, 0.09, 0.2) },
    uHorizon: { value: new THREE.Color(0.35, 0.36, 0.4) },
    uDawn: { value: new THREE.Color(0.0, 0.0, 0.0) },   // warm band toward the sun at the horizon
    uCloudBright: { value: new THREE.Color(0.9, 0.85, 0.8) },
    uCloudShade: { value: new THREE.Color(0.25, 0.27, 0.32) },
    uCloudCover: { value: 0.5 },
    uCloudScale: { value: 1.0 },
    uCloudSharp: { value: 1.0 },
    uSunDisk: { value: 40.0 },
    uDawnPow: { value: 3.0 },
    uGroundCol: { value: new THREE.Color(0, 0, 0) },
    uGroundOn: { value: 0.0 },
    uWind: { value: new THREE.Vector2(0.003, 0.0015) },
  }, ATM);
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){ vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz); vec4 p = projectionMatrix * viewMatrix * vec4(cameraPosition + vDir * 9000.0, 1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */`
      precision highp sampler3D;
      uniform sampler3D tNoise;
      uniform vec3 uSunDir, uSunCol, uZenith, uHorizon, uDawn, uCloudBright, uCloudShade, uGroundCol;
      uniform float uGroundOn;
      uniform float uCloudCover, uCloudScale, uCloudSharp, uSunDisk, uDawnPow, uTime;
      uniform vec2 uWind;
      ${FOG_GLSL}
      varying vec3 vDir;
      float dens(vec2 p){
        float n = (texture(tNoise, vec3(p * 0.8, 0.21)).r - 0.5) * 3.0 * 0.55
                + (texture(tNoise, vec3(p * 2.1, 0.63)).r - 0.5) * 3.0 * 0.3
                + (texture(tNoise, vec3(p * 5.3, 0.83)).g - 0.5) * 0.4
                + (texture(tNoise, vec3(p * 11.0, 0.47)).b - 0.5) * 0.18;
        n = n * 0.5 + 0.5;
        return smoothstep(1.0 - uCloudCover - 0.12 / uCloudSharp, 1.0 - uCloudCover + 0.22 / uCloudSharp, n);
      }
      void main(){
        vec3 d = normalize(vDir);
        float up = max(d.y, 0.0);
        float cs = dot(d, uSunDir);
        vec3 hdir = normalize(vec3(d.x, 0.0, d.z)); vec3 hsun = normalize(vec3(uSunDir.x, 0.0, uSunDir.z) + 1e-5);
        float az = max(dot(hdir, hsun), 0.0);
        vec3 col = mix(uHorizon, uZenith, pow(up, 0.5));
        col += uDawn * pow(az, uDawnPow) * exp(-up * 6.0);
        // Mie glow around the sun
        col += uSunCol * (pow(max(cs, 0.0), 8.0) * 0.25 + pow(max(cs, 0.0), 64.0) * 0.6 + pow(max(cs, 0.0), 600.0) * 3.0);
        float sunDisk = smoothstep(0.99985, 0.99993, cs) * uSunDisk;
        // clouds
        float cov = 0.0; vec3 cloud = vec3(0.0);
        if (d.y > 0.004) {
          vec2 p = d.xz / (d.y + 0.07) * 0.11 * uCloudScale + uWind * uTime;
          float c = dens(p);
          vec2 toSun = normalize(uSunDir.xz + 1e-5) * 0.035;
          float cS = dens(p + toSun), cS2 = dens(p + toSun * 2.5);
          float shade = clamp(1.0 - (cS * 0.55 + cS2 * 0.45) * 0.85, 0.0, 1.0);
          float edge = (1.0 - c);
          vec3 lit = mix(uCloudShade, uCloudBright, shade);
          lit += uSunCol * pow(max(cs, 0.0), 12.0) * edge * 1.8;    // silver lining near the sun
          lit += uDawn * pow(az, uDawnPow * 0.67) * exp(-up * 3.0) * (0.4 + 0.6 * shade);
          cloud = lit; cov = c * smoothstep(0.0, 0.07, d.y);
        }
        col = mix(col + sunDisk, cloud, cov);
        float hz = exp(-up * 9.0);
        col = mix(col, fogColorDir(d), hz * 0.8);
        if (uGroundOn > 0.5) col = mix(col, uGroundCol, smoothstep(0.0, -0.06, d.y));
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.BackSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
  mesh.frustumCulled = false; mesh.renderOrder = -100; mesh.uniforms = uniforms;
  return mesh;
}

// Sun + sky fill for a day/dawn scene; returns {sun, hemi}
export function dayLights(scene, { dir, sunColor, sunI = 3, skyColor, groundColor, hemiI = 1, center = new THREE.Vector3(), extent = 400, mapSize = 4096, near = 100, far = 8000 }) {
  const sun = new THREE.DirectionalLight(sunColor, sunI);
  sun.position.copy(center).addScaledVector(dir, 3000); sun.target.position.copy(center);
  sun.castShadow = true; sun.shadow.mapSize.set(mapSize, mapSize);
  const c = sun.shadow.camera; c.left = -extent; c.right = extent; c.top = extent; c.bottom = -extent; c.near = near; c.far = far;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 1.2;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(skyColor, groundColor, hemiI);
  scene.add(hemi);
  return { sun, hemi };
}

// Image-based lighting from the sky dome: prefiltered environment for reflections + sky fill
export function envFromSky(renderer, sky, groundCol) {
  const sc = new THREE.Scene();
  const m = new THREE.Mesh(sky.geometry, sky.material); m.frustumCulled = false; sc.add(m);
  const u = sky.uniforms;
  const was = u.uGroundOn.value; u.uGroundOn.value = 1; if (groundCol) u.uGroundCol.value.copy(groundCol);
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(sc, 0, 0.5, 50);
  u.uGroundOn.value = was; pm.dispose();
  return rt.texture;
}
