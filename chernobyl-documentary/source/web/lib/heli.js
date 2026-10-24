// Mi-8 transport helicopter (olive drab, five-blade main rotor, port-side tail rotor) with an
// optional sling load: the crews of 27 April dropped sand, boron and lead onto the open reactor.
import * as THREE from 'three';
import { patchMaterial } from './atmos.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

function rotorTexture(blades = 5) {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); g.clearRect(0, 0, S, S);
  g.translate(S / 2, S / 2);
  // stroboscopic blades: soft dark wedges, faint full disc
  const grd = g.createRadialGradient(0, 0, S * 0.03, 0, 0, S * 0.5);
  grd.addColorStop(0, 'rgba(255,255,255,0.0)'); grd.addColorStop(0.08, 'rgba(255,255,255,0.22)'); grd.addColorStop(0.96, 'rgba(255,255,255,0.1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.beginPath(); g.arc(0, 0, S / 2, 0, 7); g.fill();
  for (let b = 0; b < blades; b++) {
    const a0 = b * Math.PI * 2 / blades;
    for (let k = 0; k < 14; k++) {
      const a = a0 - k * 0.028;
      g.strokeStyle = `rgba(255,255,255,${0.55 * Math.exp(-k * 0.28)})`; g.lineWidth = 9;
      g.beginPath(); g.moveTo(Math.cos(a) * S * 0.05, Math.sin(a) * S * 0.05); g.lineTo(Math.cos(a) * S * 0.495, Math.sin(a) * S * 0.495); g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  return t;
}

export function makeMi8({ sling = true, color = new THREE.Color(0.075, 0.085, 0.05) } = {}) {
  const g = new THREE.Group();
  const paint = patchMaterial(new THREE.MeshStandardMaterial({ color, roughness: 0.62 }), { key: 'heli' });
  const belly = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.16, 0.2, 0.22), roughness: 0.6 }), { key: 'helibelly' });
  const glass = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.025, 0.03), roughness: 0.06, envMapIntensity: 1.5 }), { key: 'heliglass' });
  const dark = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.02, 0.02, 0.02), roughness: 0.7 }), { key: 'helidark' });
  const steel = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.25, 0.25, 0.24), roughness: 0.4, metalness: 0.8 }), { key: 'helisteel' });
  const ext = (pts, width, bevel, mat, z = 0) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const eg = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12 });
    eg.translate(0, 0, -(width - 2 * bevel) / 2 + z);
    const m = new THREE.Mesh(eg, mat); m.castShadow = true; g.add(m); return m;
  };
  // fuselage (local +x forward): rounded cabin, glazed nose, tapering into the tail boom
  ext([[-2.2, 0.75], [5.6, 0.75], [7.5, 1.0], [8.5, 1.7], [8.45, 2.35], [7.6, 2.95], [5.8, 3.05], [-1.6, 3.05], [-3.6, 2.75], [-3.8, 1.6]], 2.35, 0.42, paint);
  const keel = ext([[-2.0, 0.62], [5.4, 0.62], [7.2, 0.9], [7.0, 1.1], [-2.2, 1.1]], 2.2, 0.3, belly);
  // cockpit glazing on the nose
  ext([[6.9, 1.9], [8.2, 1.85], [8.25, 2.35], [7.5, 2.85], [6.4, 2.9]], 2.42, 0.12, glass);
  ext([[7.6, 1.15], [8.35, 1.5], [8.3, 1.75], [7.4, 1.6]], 1.4, 0.08, glass);
  // round cabin windows (five each side) and the sliding door
  const winG = new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16); winG.rotateX(Math.PI / 2);
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const w = new THREE.Mesh(winG, glass); w.position.set(4.6 - k * 1.25, 2.15, s * 1.43); g.add(w); }
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.7, 0.04), dark); door.position.set(4.3, 1.7, -1.44); g.add(door);
  // engine and gearbox housing on top, exhausts
  ext([[-1.0, 3.0], [5.2, 3.0], [5.6, 3.5], [4.8, 4.05], [0.2, 4.05], [-0.8, 3.7]], 1.9, 0.35, paint);
  for (const s of [-1, 1]) { const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.9, 12), dark); ex.rotation.z = Math.PI / 2 - 0.4; ex.position.set(-0.6, 3.55, s * 0.95); g.add(ex); }
  // tail boom, fin, stabilisers
  const boomL = 8.6; const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.72, boomL, 16), paint);
  boom.rotation.z = Math.PI / 2 + 0.035; boom.position.set(-3.6 - boomL / 2, 2.45, 0); boom.castShadow = true; g.add(boom);
  ext([[-12.0, 2.4], [-11.2, 2.4], [-12.1, 4.3], [-13.0, 5.0], [-13.4, 4.9], [-12.8, 4.1]], 0.32, 0.08, paint);
  for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 1.4), paint); st.position.set(-10.6, 2.55, s * 0.75); g.add(st); }
  // landing gear: twin nose wheels, main wheels on struts
  const wheel = new THREE.CylinderGeometry(0.33, 0.33, 0.22, 16); wheel.rotateX(Math.PI / 2);
  for (const z of [-0.25, 0.25]) { const w = new THREE.Mesh(wheel, dark); w.position.set(6.6, 0.33, z); g.add(w); }
  const nstrut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6), steel); nstrut.position.set(6.6, 0.7, 0); g.add(nstrut);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16).rotateX(Math.PI / 2), dark); w.position.set(-0.6, 0.45, s * 2.0); g.add(w);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6), steel); st.position.set(-0.6, 1.0, s * 1.55); st.rotation.x = s * 0.9; g.add(st);
    const st2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.7, 6), steel); st2.position.set(0.1, 1.0, s * 1.55); st2.rotation.set(s * 0.9, 0, 0.5); g.add(st2);
    // external fuel tanks
    const tank = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 2.6, 6, 14), paint); tank.rotation.z = Math.PI / 2; tank.position.set(1.4, 1.25, s * 1.55); g.add(tank);
  }
  // rotor mast + hub
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.7, 10), steel); mast.position.set(1.6, 4.35, 0); g.add(mast);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 12), dark); hub.position.set(1.6, 4.7, 0); g.add(hub);
  // rotor discs (drawn after the volumes on layer 2, so smoke behind them stays behind)
  const tex = rotorTexture(5);
  const discMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.03, 0.032, 0.028), alphaMap: tex, transparent: true, opacity: 0.4, depthWrite: false, depthTest: false, side: THREE.DoubleSide });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(10.65, 64), discMat); disc.rotation.x = -Math.PI / 2; disc.position.set(1.6, 4.78, 0); disc.layers.set(2); g.add(disc);
  const tdisc = new THREE.Mesh(new THREE.CircleGeometry(1.95, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.03, 0.03, 0.03), alphaMap: rotorTexture(3), transparent: true, opacity: 0.3, depthWrite: false, depthTest: false, side: THREE.DoubleSide }));
  tdisc.position.set(-12.7, 4.3, -0.42); tdisc.layers.set(2); g.add(tdisc);
  // blades also exist as geometry so they cast a flickering shadow and catch the light
  const blades = new THREE.Group(); blades.position.copy(disc.position);
  for (let b = 0; b < 5; b++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.05, 0.52), dark); bl.position.x = 5.4; const arm = new THREE.Group(); arm.rotation.y = b * Math.PI * 2 / 5; arm.add(bl); blades.add(arm); }
  blades.visible = false; g.add(blades);
  // sling load: cable to a cargo net of sand bags
  let load = null;
  if (sling) {
    load = new THREE.Group(); load.position.set(0.8, 0.6, 0);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 24, 4), dark); cable.position.y = -12; load.add(cable);
    const sack = patchMaterial(new THREE.MeshStandardMaterial({ color: new THREE.Color(0.2, 0.17, 0.12), roughness: 0.95 }), { key: 'sack' });
    const bag = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 10), sack); bag.scale.set(1.1, 0.8, 1.0); bag.position.y = -25; load.add(bag);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.5; const r = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 4), dark); r.position.set(Math.cos(a) * 0.6, -24, Math.sin(a) * 0.6); r.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); load.add(r); }
    g.add(load);
  }
  g.traverse(o => { o.frustumCulled = false; if (o.isMesh && o.layers.mask === 1) o.castShadow = true; });
  return {
    group: g, load,
    update(t) {
      disc.rotation.z = t * 0.9;    // stroboscopic drift of the blades on film
      tdisc.rotation.z = -t * 2.3;
      if (load) { load.rotation.z = Math.sin(t * 0.9) * 0.04; load.rotation.x = Math.sin(t * 0.7 + 1) * 0.03; }
    },
  };
}
