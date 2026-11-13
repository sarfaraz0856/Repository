// New camera passes over existing Chernobyl scenes, for the extended cut (chapters CX1-CX6).
// A variant keeps the scene's own animation (run forward, stretched to 15 s) but takes the camera from a different
// point of the original path (by default the path played backwards), then zooms and turns it a little.
import * as THREE from 'three';
const Y = new THREE.Vector3(0, 1, 0);
export function variant(base, o = {}) {
  const D = base.duration, T = o.dur ?? 15;
  return async (ctx) => {
    const s = await base.build(ctx);
    const pos = new THREE.Vector3(), quat = new THREE.Quaternion();
    const v = Object.create(s);
    v.update = (t, frame, mb) => {
      const u = Math.min(Math.max(t / T, 0), 1);
      const a0 = o.a0 ?? 0, a1 = o.a1 ?? D;                       // animation window, played forward
      const c0 = o.c0 ?? D, c1 = o.c1 ?? 0;                       // camera window (default: reversed path)
      s.update(c0 + (c1 - c0) * u, frame, mb);
      const cam = s.camera; pos.copy(cam.position); quat.copy(cam.quaternion); const fov = cam.fov;
      const r = s.update(a0 + (a1 - a0) * u, frame, mb) || {};
      cam.position.copy(pos); cam.quaternion.copy(quat);
      if (o.yaw) cam.rotateOnWorldAxis(Y, (o.yaw * Math.PI) / 180);
      if (o.pitch) cam.rotateX((o.pitch * Math.PI) / 180);
      const z = (o.zoom ?? 1) * (1 + (o.push ?? 0) * u);
      cam.fov = (2 * Math.atan(Math.tan((fov * Math.PI) / 360) / z) * 180) / Math.PI; cam.updateProjectionMatrix();
      cam.updateMatrixWorld(true);
      if (r.dof && r.dof.focal) r.dof = { ...r.dof, focal: r.dof.focal * z };
      return r;
    };
    return v;
  };
}
