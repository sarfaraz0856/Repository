import { Easing, interpolate } from "remotion";
const ease = Easing.bezier(0.16, 1, 0.3, 1);
/** 0→1 over `len` frames starting at `at`. */
export const prog = (f: number, at: number, len = 18) =>
  interpolate(f, [at, at + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
/** Fade + rise style for an element appearing at frame `at`. */
export const rise = (f: number, at: number, dist = 30, len = 18) => {
  const p = prog(f, at, len);
  return { opacity: p, translate: `0px ${(1 - p) * dist}px` } as const;
};
/** Fade the whole scene in and out. */
export const sceneFade = (f: number, dur: number, inLen = 12, outLen = 12) =>
  Math.min(prog(f, 0, inLen), 1 - prog(f, dur - outLen, outLen));
