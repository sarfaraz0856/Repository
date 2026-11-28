// Time-warp: the scenes were authored against the first narration (timing_v1). When the narration is
// regenerated, each scene's frame is mapped piecewise-linearly through the line starts/ends so every
// animation stays on the same words. Sounds placed by scenes are mapped the other way.
import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

export type Warp = { toOld: (f: number) => number; toNew: (f: number) => number };
const ident: Warp = { toOld: (f) => f, toNew: (f) => f };
export const WarpCtx = createContext<Warp>(ident);
export const useWarp = () => useContext(WarpCtx);
/** Scene-local frame in the authoring (v1) time base. */
export const useSceneFrame = () => {
  const f = useCurrentFrame();
  return useWarp().toOld(f);
};

const lerp = (xs: number[], ys: number[], x: number) => {
  if (x <= xs[0]) return ys[0] + (x - xs[0]);
  for (let i = 0; i < xs.length - 1; i++) {
    if (x <= xs[i + 1]) {
      const t = xs[i + 1] === xs[i] ? 0 : (x - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] + t * (ys[i + 1] - ys[i]);
    }
  }
  return ys[ys.length - 1] + (x - xs[xs.length - 1]);
};
/** Build a warp from matching scene-local line beats in the old and new timing. */
export const makeWarp = (oldL: { s: number; d: number }[], oldDur: number, newL: { s: number; d: number }[], newDur: number): Warp => {
  const o = [0, ...oldL.flatMap((b) => [b.s, b.s + b.d]), oldDur];
  const n = [0, ...newL.flatMap((b) => [b.s, b.s + b.d]), newDur];
  return { toOld: (f) => lerp(n, o, f), toNew: (f) => lerp(o, n, f) };
};
export const WarpProvider: React.FC<{ warp: Warp; children: React.ReactNode }> = ({ warp, children }) => <WarpCtx.Provider value={warp}>{children}</WarpCtx.Provider>;
