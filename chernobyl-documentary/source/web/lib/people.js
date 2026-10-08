// Firefighters: motion-captured skeleton (Mixamo rig from three.js examples) dressed in
// period-appropriate gear built from primitives attached to bones: heavy canvas coat and
// trousers, rubber boots, mittens, a Soviet fire helmet with crest and neck flap, and an
// oxygen breathing apparatus (KIP-8 style) on some. ZIL-130 style fire tankers.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { patchMaterial, ATM } from './atmos.js';
import { mulberry32 } from './util.js';

let RIG = null;
export async function loadRig() {
  if (RIG) return RIG;
  const gltf = await new GLTFLoader().loadAsync('/web/assets/Soldier.glb');
  RIG = { scene: gltf.scene, clips: Object.fromEntries(gltf.animations.map(a => [a.name, a])) };
  return RIG;
}

function mat(color, rough = 0.95, metal = 0, key = 'ff') {
  return patchMaterial(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }), { key });
}

// tapered capsule along +Y from 0 to len (meters), elliptical cross-section via sx/sz
function segGeo(len, r0, r1, { sx = 1, sz = 1, seg = 10, caps = true } = {}) {
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 3, false);
  g.translate(0, len / 2, 0);
  g.scale(sx, 1, sz);
  if (!caps) return [g];
  const cap0 = new THREE.SphereGeometry(r0, seg, 6); cap0.scale(sx, 0.8, sz);
  const cap1 = new THREE.SphereGeometry(r1, seg, 6); cap1.scale(sx, 0.8, sz); cap1.translate(0, len, 0);
  return [g, cap0, cap1];
}

function helmetGroup(m) {
  const g = new THREE.Group();
  // one lathed shell: dome -> slight waist -> flared brim (wider at the back via scale)
  const prof = [];
  for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI * 0.5; prof.push(new THREE.Vector2(Math.sin(a) * 0.138, Math.cos(a) * 0.15)); }
  prof.push(new THREE.Vector2(0.142, -0.012), new THREE.Vector2(0.158, -0.03), new THREE.Vector2(0.168, -0.036));
  const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), m.helmet);
  shell.scale.set(1.0, 1.0, 1.12); g.add(shell);
  // low ridge (comb) running front to back, following the dome
  const ridgeCurve = new THREE.EllipseCurve(0, 0, 0.142, 0.155, Math.PI * 0.06, Math.PI * 0.94, false, 0);
  const pts = ridgeCurve.getPoints(24).map(p => new THREE.Vector3(0, p.y, p.x * 1.12));
  const ridge = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.011, 6, false), m.helmet);
  g.add(ridge);
  // leather neck flap at the back
  const flap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.175, 0.13, 16, 1, true, Math.PI * 0.65, Math.PI * 0.7), m.flap);
  flap.position.set(0, -0.09, -0.01); flap.scale.set(1, 1, 1.1); g.add(flap);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.material.side = THREE.DoubleSide; } });
  return g;
}

const SEG = [
  // bone, child, r0, r1, material, opts
  ['mixamorigSpine', 'mixamorigSpine1', 0.17, 0.18, 'coat', { sx: 1.25, sz: 0.85, caps: false }],
  ['mixamorigSpine1', 'mixamorigSpine2', 0.18, 0.19, 'coat', { sx: 1.25, sz: 0.88, caps: false }],
  ['mixamorigSpine2', 'mixamorigNeck', 0.19, 0.12, 'coat', { sx: 1.3, sz: 0.9, caps: false }],
  ['mixamorigNeck', 'mixamorigHead', 0.075, 0.07, 'skin', {}],
  ['mixamorigLeftArm', 'mixamorigLeftForeArm', 0.072, 0.064, 'coat', {}],
  ['mixamorigLeftForeArm', 'mixamorigLeftHand', 0.064, 0.058, 'coat', {}],
  ['mixamorigRightArm', 'mixamorigRightForeArm', 0.072, 0.064, 'coat', {}],
  ['mixamorigRightForeArm', 'mixamorigRightHand', 0.064, 0.058, 'coat', {}],
  ['mixamorigLeftUpLeg', 'mixamorigLeftLeg', 0.095, 0.075, 'trousers', {}],
  ['mixamorigLeftLeg', 'mixamorigLeftFoot', 0.072, 0.07, 'boot', {}],
  ['mixamorigRightUpLeg', 'mixamorigRightLeg', 0.095, 0.075, 'trousers', {}],
  ['mixamorigRightLeg', 'mixamorigRightFoot', 0.072, 0.07, 'boot', {}],
];

export function makeFirefighter(rig, { seed = 1, apparatus = true, coatColor = null } = {}) {
  const rnd = mulberry32(seed);
  const root = SkeletonUtils.clone(rig.scene);
  root.traverse(o => { if (o.isMesh) o.visible = false; });
  const bones = {}; root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const shade = 0.85 + rnd() * 0.3;
  const m = {
    coat: mat(coatColor || new THREE.Color(0.11 * shade, 0.1 * shade, 0.075 * shade), 0.96, 0, 'ffcoat'),
    trousers: mat(new THREE.Color(0.08 * shade, 0.075 * shade, 0.06 * shade), 0.96, 0, 'fftr'),
    boot: mat(new THREE.Color(0.02, 0.02, 0.02), 0.45, 0, 'ffboot'),
    skin: mat(new THREE.Color(0.09, 0.06, 0.05), 0.75, 0, 'ffskin'),
    glove: mat(new THREE.Color(0.06, 0.05, 0.04), 0.9, 0, 'ffglove'),
    helmet: mat(new THREE.Color(0.16, 0.15, 0.13), 0.42, 0.55, 'ffhelm'),
    flap: mat(new THREE.Color(0.05, 0.045, 0.04), 0.9, 0, 'ffflap'),
    gear: mat(new THREE.Color(0.06, 0.07, 0.06), 0.6, 0.3, 'ffgear'),
    belt: mat(new THREE.Color(0.03, 0.025, 0.02), 0.6, 0, 'ffbelt'),
  };
  const add = (bone, mesh) => { mesh.scale.multiplyScalar(100); mesh.position.multiplyScalar(100); mesh.castShadow = true; bones[bone].add(mesh); return mesh; };
  for (const [b, c, r0, r1, mk, o] of SEG) {
    const len = bones[c].position.length() / 100;
    for (const g of segGeo(len, r0, r1, o)) {
      const mesh = new THREE.Mesh(g, m[mk]);
      // align +Y to the child direction (Mixamo bones mostly point +Y already)
      const dir = bones[c].position.clone().normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      add(b, mesh);
    }
  }
  // pelvis + coat skirt (flared), belt
  const pel = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.25, 0.5, 14, 1, false), m.coat);
  pel.scale.set(1.15, 1, 0.84); pel.position.set(0, -0.15, 0); add('mixamorigHips', pel);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.05, 16, 1, true), m.belt);
  belt.scale.set(1.17, 1, 0.86); belt.position.set(0, 0.12, 0); add('mixamorigHips', belt);
  // shoulders
  for (const s of ['mixamorigLeftArm', 'mixamorigRightArm']) {
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), m.coat); add(s, sh);
  }
  // raised collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.135, 0.16, 14, 1, true), m.coat);
  collar.position.set(0, 0.05, -0.005); collar.material.side = THREE.DoubleSide; add('mixamorigNeck', collar);
  // head + helmet
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.092, 14, 10), m.flap);
  head.scale.set(0.95, 1.08, 1.05); head.position.set(0, 0.095, 0.012); add('mixamorigHead', head);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.3, Math.PI * 0.45), m.skin);
  face.position.set(0, 0.085, 0.03); add('mixamorigHead', face);
  const helm = helmetGroup(m); helm.position.set(0, 0.105, -0.005); helm.rotation.x = -0.06; add('mixamorigHead', helm);
  // mittens
  for (const h of ['mixamorigLeftHand', 'mixamorigRightHand']) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.13, 0.045), m.glove); g.position.set(0, 0.07, 0); add(h, g);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.06, 10), m.glove); cuff.position.set(0, -0.005, 0); add(h, cuff);
  }
  // boots: foot box toward the toe
  for (const [f, t] of [['mixamorigLeftFoot', 'mixamorigLeftToeBase'], ['mixamorigRightFoot', 'mixamorigRightToeBase']]) {
    const dir = bones[t].position.clone(); const len = dir.length() / 100; dir.normalize();
    const bt = new THREE.Mesh(new THREE.BoxGeometry(0.11, len + 0.08, 0.1), m.boot);
    bt.geometry.translate(0, (len + 0.08) / 2 - 0.04, 0);
    bt.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); add(f, bt);
  }
  // breathing apparatus on the back + hose
  if (apparatus) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.14), m.gear);
    box.position.set(0, 0.05, -0.2); add('mixamorigSpine2', box);

  }
  // hatchet holster on the belt
  const hat = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.09), m.belt); hat.position.set(0.2, 0.0, 0.08); add('mixamorigHips', hat);
  const mixer = new THREE.AnimationMixer(root);
  const actions = {};
  for (const [k, clip] of Object.entries(rig.clips)) { actions[k] = mixer.clipAction(clip); }
  root.traverse(o => { o.frustumCulled = false; });
  return { root, mixer, actions, bones, materials: m };
}

// Pose a firefighter at time t: clip name, cycle offset, speed (playback rate)
export function pose(ff, clip, t, { offset = 0, rate = 1 } = {}) {
  const a = ff.actions[clip];
  if (ff.current !== clip) { for (const x of Object.values(ff.actions)) x.stop(); a.play(); ff.current = clip; }
  const d = a.getClip().duration;
  a.time = (((t * rate + offset) % d) + d) % d;
  a.weight = 1;
  ff.mixer.update(0);
}

// ZIL-130 style fire tanker (AC-40), ~7.6 m long. Returns group + light anchors (local).
export function makeFireTruck(ctx, { seed = 1 } = {}) {
  const g = new THREE.Group();
  const red = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.42, 0.025, 0.02), roughness: 0.42, metalness: 0.15 }), { key: 'truckred' });
  const white = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.55, 0.55, 0.52), roughness: 0.5 }), { key: 'truckwhite' });
  const black = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.8 }), { key: 'truckblack' });
  const chrome = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.5, 0.5, 0.5), roughness: 0.25, metalness: 0.9 }), { key: 'truckchrome' });
  const glass = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.01, 0.012, 0.015), roughness: 0.08, metalness: 0.0 }), { key: 'truckglass' });
  const B = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  // truck faces +Z (front). Frame, hood, fenders, cab, body
  B(1.9, 0.25, 7.2, black, 0, 0.75, 0);
  const hood = B(1.05, 0.85, 1.7, red, 0, 1.35, 2.75);
  const hoodTop = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.7, 16, 1, false, -Math.PI / 2, Math.PI), red); hoodTop.rotation.x = Math.PI / 2; hoodTop.rotation.z = Math.PI / 2; hoodTop.position.set(0, 1.77, 2.75); hoodTop.scale.set(1, 1, 0.4); g.add(hoodTop);
  const grille = B(0.95, 0.6, 0.06, chrome, 0, 1.3, 3.61);
  for (const sx of [-1, 1]) {
    const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.42, 16, 1, false, 0, Math.PI), red);
    fender.rotation.z = Math.PI / 2; fender.rotation.y = Math.PI / 2; fender.position.set(sx * 0.82, 1.0, 2.75); g.add(fender);
    B(0.42, 0.06, 1.3, red, sx * 0.82, 1.02, 2.75);
  }
  B(2.25, 1.55, 1.45, red, 0, 1.75, 1.25);              // cab
  B(2.05, 0.55, 0.05, glass, 0, 2.2, 1.99);              // windscreen
  for (const sx of [-1, 1]) B(0.05, 0.5, 0.9, glass, sx * 1.13, 2.2, 1.3);
  B(2.3, 0.08, 1.5, red, 0, 2.55, 1.25);                 // cab roof
  B(2.45, 1.9, 4.3, red, 0, 1.85, -1.6);                 // tank / equipment body
  B(2.47, 0.12, 4.32, white, 0, 1.35, -1.6);             // white stripe
  for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) B(0.02, 1.2, 1.2, red, sx * 1.235, 1.95, -0.25 - k * 1.35); // shutter panels
  B(0.5, 0.1, 4.0, chrome, 0, 2.86, -1.6);               // ladder rails
  for (let k = 0; k < 10; k++) B(0.5, 0.04, 0.05, chrome, 0, 2.9, -3.4 + k * 0.4);
  B(2.0, 0.18, 0.2, chrome, 0, 0.82, 3.68);              // bumper
  // wheels (front single, rear dual)
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20); wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 12); hubGeo.rotateZ(Math.PI / 2);
  for (const [z, dual] of [[2.75, false], [-1.3, true], [-2.65, true]]) for (const sx of [-1, 1]) {
    for (const dx of dual ? [0, 0.3] : [0]) {
      const w = new THREE.Mesh(wheelGeo, black); w.position.set(sx * (0.95 + dx), 0.5, z); w.castShadow = true; g.add(w);
      const h = new THREE.Mesh(hubGeo, red); h.position.copy(w.position); g.add(h);
    }
  }
  // headlights (emissive) + beacon housing
  const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.85, 0.6).multiplyScalar(30) });
  for (const sx of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), headMat); hl.rotation.x = Math.PI / 2; hl.position.set(sx * 0.78, 1.42, 3.4); g.add(hl); }
  const beaconMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.45, 1.0).multiplyScalar(8) });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 14), beaconMat); beacon.position.set(0, 2.72, 1.5); g.add(beacon);
  const siren = B(0.25, 0.14, 0.3, chrome, 0.5, 2.66, 1.5);
  g.traverse(o => { o.frustumCulled = false; });
  return { group: g, beaconMat, beaconPos: new THREE.Vector3(0, 2.72, 1.5), headPos: [new THREE.Vector3(-0.78, 1.42, 3.45), new THREE.Vector3(0.78, 1.42, 3.45)] };
}
