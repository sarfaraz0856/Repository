// CH-47 tandem-rotor transport helicopter in Japan Ground Self-Defense Force olive drab, with an orange
// water bucket on a long line. On 17 March 2011 two of them dropped sea water on unit 3.
// Local axes: +x forward, +y up. Metres.
import * as THREE from 'three';
import { patchMaterial } from './atmos.js';

function rotorTexture(blades = 3) {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); g.translate(S / 2, S / 2);
  const grd = g.createRadialGradient(0, 0, S * 0.03, 0, 0, S * 0.5);
  grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.08, 'rgba(255,255,255,0.2)'); grd.addColorStop(0.96, 'rgba(255,255,255,0.09)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.beginPath(); g.arc(0, 0, S / 2, 0, 7); g.fill();
  for (let b = 0; b < blades; b++) {
    const a0 = b * Math.PI * 2 / blades;
    for (let k = 0; k < 14; k++) { const a = a0 - k * 0.03; g.strokeStyle = `rgba(255,255,255,${0.55 * Math.exp(-k * 0.28)})`; g.lineWidth = 11; g.beginPath(); g.moveTo(Math.cos(a) * S * 0.05, Math.sin(a) * S * 0.05); g.lineTo(Math.cos(a) * S * 0.495, Math.sin(a) * S * 0.495); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

export function makeChinook({ bucket = true, line = 22 } = {}) {
  const g = new THREE.Group();
  const M = (c, r = 0.6, m = 0, key = 'ch47') => patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(...c), roughness: r, metalness: m }), { key });
  const paint = M([0.1, 0.11, 0.07], 0.62, 0, 'ch47p'), dark = M([0.02, 0.02, 0.02], 0.7, 0, 'ch47d'), glass = M([0.02, 0.025, 0.03], 0.08, 0, 'ch47g');
  const steel = M([0.25, 0.25, 0.24], 0.4, 0.8, 'ch47s'), orange = M([0.85, 0.32, 0.05], 0.7, 0, 'ch47o'), white = M([0.8, 0.8, 0.78], 0.6, 0, 'ch47w');
  const ext = (pts, width, bevel, mat) => {
    const eg = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))), { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12 });
    eg.translate(0, 0, -(width - 2 * bevel) / 2); const m = new THREE.Mesh(eg, mat); g.add(m); return m;
  };
  // long boxy fuselage, the nose with its glazing, the rear ramp rising into the aft pylon
  ext([[-7.6, 1.0], [6.4, 1.0], [7.9, 1.5], [8.6, 2.3], [8.4, 3.0], [7.3, 3.6], [-6.0, 3.6], [-7.8, 2.4]], 3.4, 0.45, paint);
  ext([[7.4, 2.6], [8.45, 2.45], [8.3, 3.05], [7.2, 3.5]], 3.42, 0.1, glass);
  ext([[7.9, 1.6], [8.55, 2.2], [8.4, 2.4], [7.6, 1.85]], 2.2, 0.06, glass);
  // forward pylon (low) and aft pylon (tall)
  ext([[4.3, 3.5], [8.0, 3.5], [7.6, 4.1], [6.6, 4.45], [4.6, 4.2]], 1.6, 0.3, paint);
  ext([[-8.2, 2.6], [-3.6, 3.5], [-3.4, 4.6], [-5.6, 5.9], [-7.6, 5.9], [-8.6, 4.4]], 2.0, 0.35, paint);
  // engine nacelles either side of the aft pylon
  for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 3.0, 6, 14), paint); n.rotation.z = Math.PI / 2; n.position.set(-5.8, 4.6, s * 1.45); g.add(n); }
  // sponsons along the lower sides, windows, wheels
  for (const s of [-1, 1]) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.95, 0.6), paint); sp.position.set(0.2, 1.45, s * 1.95); g.add(sp);
    for (let k = 0; k < 6; k++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.05), glass); w.position.set(5.0 - k * 1.7, 2.75, s * 1.73); g.add(w); }
    const hino = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), M([0.75, 0.1, 0.08], 0.6, 0, 'ch47r')); hino.position.set(-2.8, 2.6, s * 1.74); hino.rotation.y = s > 0 ? 0 : Math.PI; g.add(hino);
    for (const x of [4.6, -4.2]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16).rotateX(Math.PI / 2), dark); w.position.set(x, 0.62, s * 1.5); g.add(w); }
  }
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 2.2), white); stripe.position.set(-4, 3.62, 0); g.add(stripe);
  // rotor heads and counter-rotating discs (radius 9.1 m)
  const tex = rotorTexture(3), discs = [];
  for (const [x, y, dir] of [[6.5, 4.75, 1], [-6.6, 6.1, -1]]) {
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), dark); hub.position.set(x, y - 0.15, 0); g.add(hub);
    const d = new THREE.Mesh(new THREE.CircleGeometry(9.1, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.03, 0.03, 0.03), alphaMap: tex, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }));
    d.rotation.x = -Math.PI / 2; d.position.set(x, y, 0); d.layers.set(2); g.add(d); discs.push([d, dir]);
  }
  // water bucket: long line to an orange collapsible bucket
  let load = null;
  if (bucket) {
    load = new THREE.Group(); load.position.set(0, 1.0, 0);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, line, 4), dark); cable.position.y = -line / 2; load.add(cable);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.0, 1.8, 20, 1, true), orange); b.material.side = THREE.DoubleSide; b.position.y = -line - 3.0; load.add(b);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; const r = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.6, 3), dark); r.position.set(Math.cos(a) * 0.7, -line - 1.0, Math.sin(a) * 0.7); r.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); load.add(r); }
    g.add(load);
  }
  g.traverse(o => { o.frustumCulled = false; if (o.isMesh && o.layers.mask === 1) o.castShadow = true; });
  return {
    group: g, load, bucketDepth: line + 3.9,
    update(t) {
      for (const [d, dir] of discs) d.rotation.z = dir * t * 0.8;
      if (load) { load.rotation.z = Math.sin(t * 0.8) * 0.05; load.rotation.x = Math.sin(t * 0.6 + 1) * 0.03; }
    },
  };
}
