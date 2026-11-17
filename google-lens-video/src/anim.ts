import {Easing, interpolate} from 'remotion';

export const EO = Easing.bezier(0.16, 1, 0.3, 1); // smooth ease-out
export const EIO = Easing.bezier(0.65, 0, 0.35, 1); // smooth ease-in-out
export const EI = Easing.bezier(0.55, 0, 0.75, 0.2);

export const ip = (
  f: number,
  inR: [number, number],
  outR: [number, number],
  ease: (t: number) => number = EO,
) =>
  interpolate(f, inR, outR, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** Visibility window: fades in at a, out ending at b */
export const win = (f: number, a: number, b: number, fin = 12, fout = 12) =>
  Math.min(ip(f, [a, a + fin], [0, 1]), ip(f, [b - fout, b], [1, 0], EIO));

/** Directional motion blur amount derived from per-frame velocity */
export const mblur = (fn: (f: number) => number, f: number, k = 0.3, max = 10) =>
  Math.min(Math.abs(fn(f) - fn(f - 1)) * k, max);

export const cubic = (
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] => {
  const u = 1 - t;
  const a = u * u * u,
    b = 3 * u * u * t,
    c = 3 * u * t * t,
    d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
};
