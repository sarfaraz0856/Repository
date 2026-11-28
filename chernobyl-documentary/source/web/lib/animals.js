// Procedural four-legged animals of the zone: Przewalski's horse, grey wolf and elk (moose).
// A body, neck and head of scaled primitives; two-segment legs with a simple walk / graze cycle.
import * as THREE from 'three';
import { patchMaterial } from './atmos.js';
import { mulberry32 } from './util.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (c, r = 0.95, key = 'animal') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r }), { key });

const KINDS = {
  // shoulder height, body length, colours, proportions
  horse: { h: 1.3, len: 2.0, coat: [0.42, 0.29, 0.15], belly: [0.6, 0.5, 0.36], leg: [0.07, 0.05, 0.04], mane: [0.08, 0.06, 0.04], muzzle: [0.62, 0.55, 0.45], neck: 0.85, head: 0.62, girth: 0.36, tail: 'hair' },
  wolf: { h: 0.78, len: 1.15, coat: [0.32, 0.3, 0.27], belly: [0.55, 0.52, 0.47], leg: [0.4, 0.37, 0.33], mane: [0.2, 0.19, 0.17], muzzle: [0.45, 0.42, 0.38], neck: 0.35, head: 0.3, girth: 0.17, tail: 'bushy' },
  elk: { h: 1.85, len: 2.5, coat: [0.1, 0.075, 0.055], belly: [0.14, 0.1, 0.07], leg: [0.42, 0.38, 0.32], mane: [0.06, 0.045, 0.035], muzzle: [0.12, 0.09, 0.07], neck: 0.75, head: 0.75, girth: 0.5, tail: 'short', antlers: true },
};

export function makeAnimal(kind = 'horse', { seed = 1, scale = 1 } = {}) {
  const K = KINDS[kind]; const rnd = mulberry32(seed);
  const tint = 0.88 + rnd() * 0.24;
  const coat = mat(K.coat.map(c => c * tint), 0.95, 'coat'), belly = mat(K.belly.map(c => c * tint), 0.95, 'belly'), legM = mat(K.leg, 0.9, 'leg'), maneM = mat(K.mane, 1.0, 'mane'), muzM = mat(K.muzzle, 0.9, 'muzzle');
  const root = new THREE.Group(); root.scale.setScalar(scale);
  const body = new THREE.Group(); root.add(body);
  const H = K.h, L = K.len, G = K.girth;
  const legLen = H * (kind === 'elk' ? 0.64 : 0.58);                         // the body's underside sits at about the leg length
  const by = legLen + G * 0.9;
  const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), coat); torso.scale.set(L * 0.5, G, G * 0.78); torso.position.y = by; body.add(torso);
  const under = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), belly); under.scale.set(L * 0.42, G * 0.7, G * 0.8); under.position.set(0, by - G * 0.3, 0); body.add(under);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), coat); chest.scale.set(G * 1.0, G * 1.05, G * 0.8); chest.position.set(L * 0.36, by + G * 0.08, 0); body.add(chest);
  const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), coat); rump.scale.set(G * 0.95, G * 0.98, G * 0.8); rump.position.set(-L * 0.36, by + G * 0.05, 0); body.add(rump);
  if (kind === 'elk') { const hump = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), coat); hump.scale.set(G * 0.9, G * 0.7, G * 0.6); hump.position.set(L * 0.3, by + G * 0.8, 0); body.add(hump); }
  // neck and head on a pivot at the withers
  const neckPivot = new THREE.Group(); neckPivot.position.set(L * 0.42, by + G * 0.35, 0); body.add(neckPivot);
  const NL = K.neck;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(G * 0.42, G * 0.7, NL, 12), coat); neck.position.set(0, NL / 2, 0); neckPivot.add(neck);
  neckPivot.rotation.z = kind === 'wolf' ? -0.9 : -0.55;
  const headPivot = new THREE.Group(); headPivot.position.set(0, NL, 0); neckPivot.add(headPivot);
  const HL = K.head;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), coat); skull.scale.set(HL * 0.36, HL * 0.3, HL * 0.26); headPivot.add(skull);
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(HL * (kind === 'wolf' ? 0.1 : 0.17), HL * 0.24, HL * 0.75, 10), muzM); muzzle.rotation.z = -Math.PI / 2; muzzle.position.set(HL * 0.42, -HL * 0.08, 0); headPivot.add(muzzle);
  headPivot.rotation.z = kind === 'wolf' ? 0.9 : -0.75;
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(HL * 0.08, HL * (kind === 'wolf' ? 0.32 : 0.24), 6), coat); ear.position.set(-HL * 0.12, HL * 0.3, s * HL * 0.13); ear.rotation.x = s * 0.25; headPivot.add(ear); }
  if (kind === 'horse') { const mane = new THREE.Mesh(new THREE.BoxGeometry(0.06, NL * 1.02, G * 0.5), maneM); mane.position.set(-G * 0.45, NL / 2, 0); neckPivot.add(mane); }
  if (K.antlers) for (const s of [-1, 1]) {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.4, 6), mat([0.35, 0.3, 0.22], 0.8, 'antler')); beam.position.set(-HL * 0.05, HL * 0.32, s * 0.2); beam.rotation.x = s * 1.1; headPivot.add(beam);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.6), mat([0.35, 0.3, 0.22], 0.8, 'antler')); palm.position.set(-HL * 0.05, HL * 0.5, s * 0.55); palm.rotation.x = s * 0.35; headPivot.add(palm);
  }
  // tail
  const tailPivot = new THREE.Group(); tailPivot.position.set(-L * 0.48, by + G * 0.4, 0); body.add(tailPivot);
  const tlen = kind === 'horse' ? 0.75 : kind === 'wolf' ? 0.42 : 0.15;
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(kind === 'wolf' ? 0.07 : 0.03, kind === 'horse' ? 0.09 : 0.05, tlen, 8), kind === 'horse' ? maneM : coat); tail.position.y = -tlen / 2; tailPivot.add(tail);
  tailPivot.rotation.z = kind === 'wolf' ? -0.5 : -0.15;
  // legs: hip and knee pivots
  const legs = [];
  for (const [fx, fz, ph] of [[1, 1, 0.25], [1, -1, 0.75], [-1, 1, 0.0], [-1, -1, 0.5]]) {
    const hip = new THREE.Group(); hip.position.set(fx * L * 0.36, legLen, fz * G * 0.55); body.add(hip);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(G * 0.2, G * 0.34, legLen * 0.52, 8), fx > 0 ? coat : coat); up.position.y = -legLen * 0.26; hip.add(up);
    const knee = new THREE.Group(); knee.position.y = -legLen * 0.5; hip.add(knee);
    const lo = new THREE.Mesh(new THREE.CylinderGeometry(G * 0.1, G * 0.13, legLen * 0.52, 8), legM); lo.position.y = -legLen * 0.25; knee.add(lo);
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(G * 0.13, G * 0.15, 0.06, 8), mat([0.03, 0.03, 0.03], 0.6, 'hoof')); hoof.position.y = -legLen * 0.5 + 0.03; knee.add(hoof);
    legs.push({ hip, knee, ph, front: fx > 0 });
  }
  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const cycle = { horse: 0.95, wolf: 1.7, elk: 0.75 }[kind];
  return {
    root, kind,
    // gait: 'walk' | 'trot' | 'graze' | 'stand'; t in seconds
    update(t, { gait = 'graze', phase = 0 } = {}) {
      const f = gait === 'trot' ? cycle * 1.9 : cycle;
      const moving = gait === 'walk' || gait === 'trot';
      const amp = gait === 'trot' ? 0.5 : 0.35;
      for (const l of legs) {
        const a = 2 * Math.PI * (f * t + l.ph + phase);
        l.hip.rotation.z = moving ? Math.sin(a) * amp : 0;
        l.knee.rotation.z = moving ? (l.front ? -1 : 1) * Math.max(0, Math.sin(a + 1.2)) * amp * 1.4 : 0;
      }
      body.position.y = moving ? Math.abs(Math.sin(2 * Math.PI * f * t * 2 + phase)) * 0.02 * H : 0;
      const graze = gait === 'graze' ? 1 : 0;
      neckPivot.rotation.z = (kind === 'wolf' ? -0.9 : -0.55) - graze * (kind === 'elk' ? 1.4 : 1.55) + (moving ? Math.sin(2 * Math.PI * f * t * 2) * 0.04 : 0);
      headPivot.rotation.z = (kind === 'wolf' ? 0.9 : -0.75) - graze * 0.3 + graze * Math.sin(t * 3.1 + seed) * 0.08;
      tailPivot.rotation.x = Math.sin(t * (kind === 'horse' ? 1.7 : 2.6) + seed) * (kind === 'horse' ? 0.25 : 0.12);
    },
  };
}
