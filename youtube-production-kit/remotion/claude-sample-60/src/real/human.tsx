// Human-looking mouse pointer. Same stops as <Cursor> ([frame, x, y] = "be here by this frame"),
// but the hand behaves like a person's: it rests, then makes a quick slightly curved move
// (minimum-jerk speed, length from distance), overshoots a long move a little and corrects,
// keeps a tiny tremor while resting, steadies itself for clicks, and drifts off a clicked
// element during long pauses. Everything is deterministic (no Math.random).
import React from "react";

/** [frame, x, y, moveFrames?]: moveFrames forces a straight, exact-length move (drags). */
export type HP = [number, number, number] | [number, number, number, number];
export const hpath = (...stops: ([number, [number, number]] | [number, [number, number], number])[]): HP[] =>
  stops.map(([fr, [x, y], ml]) => (ml ? [fr, x, y, ml] : [fr, x, y]));

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const mj = (t: number) => t * t * t * (10 - 15 * t + 6 * t * t); // minimum-jerk profile
const sstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const moveLen = (d: number) => Math.round(Math.min(26, Math.max(7, 6 + 5 * Math.log2(1 + d / 50))));
const clampX = (x: number) => Math.min(1870, Math.max(40, x));
const clampY = (y: number) => Math.min(1040, Math.max(100, y));

type Seg = { a: number; b: number; s: number; x0: number; y0: number; x1: number; y1: number; cx: number; cy: number; ox: number; oy: number; os: boolean };

const build = (raw: HP[], clicks: number[], holds: [number, number][]) => {
  const pts = raw.map((p) => [...p] as number[]);
  for (let i = 1; i < pts.length; i++) pts[i][0] = Math.max(pts[i][0], pts[i - 1][0] + 1);
  const busy = (a: number, b: number) => [...clicks.filter((c) => c >= a && c <= b), ...holds.filter(([h0, h1]) => h1 >= a && h0 <= b).map(([, h1]) => h1)];
  // Drift off a clicked element when a pause is long (people let go of the target).
  const out: number[][] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, x0, y0] = pts[i];
    const [b, x1, y1, ml1] = pts[i + 1];
    const leave = b - (ml1 ?? moveLen(Math.hypot(x1 - x0, y1 - y0)));
    const used = busy(a, leave);
    const from = Math.max(a, ...used) + 10;
    if (leave - from > 80) {
      const h = hash(a * 0.37 + i);
      const fx = clampX(x0 + (h < 0.5 ? 1 : -1) * (26 + 28 * hash(a + 3))), fy = clampY(y0 + 24 + 30 * hash(a + 7));
      out.push([from + moveLen(Math.hypot(fx - x0, fy - y0)) + Math.round(10 * h), fx, fy]);
    }
    out.push(pts[i + 1]);
  }
  const segs: Seg[] = [];
  for (let i = 0; i < out.length - 1; i++) {
    const [a, x0, y0] = out[i];
    const [b, x1, y1, ml] = out[i + 1];
    const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1;
    const len = Math.min(b - a, ml ?? moveLen(d));
    const nx = -dy / d, ny = dx / d;
    const k = ml ? 0 : (0.07 + 0.1 * hash(i + a * 0.01)) * (hash(i * 3.1 + a) < 0.45 ? -1 : 1);
    const os = !ml && d > 220;
    const ov = Math.min(16, 0.035 * d);
    segs.push({
      a, b, s: b - len, x0, y0, x1, y1,
      cx: (x0 + x1) / 2 + nx * d * k, cy: (y0 + y1) / 2 + ny * d * k,
      ox: os ? (dx / d) * ov + nx * (hash(a + 11) - 0.5) * 8 : 0, oy: os ? (dy / d) * ov + ny * (hash(a + 13) - 0.5) * 8 : 0, os,
    });
  }
  return { first: out[0], segs };
};

const posAt = (f: number, first: number[], segs: Seg[]): [number, number] => {
  let x = first[1], y = first[2];
  for (const g of segs) {
    if (f < g.s) break;
    if (f >= g.b) { x = g.x1; y = g.y1; continue; }
    const t = (f - g.s) / (g.b - g.s);
    const bez = (u: number, ex: number, ey: number): [number, number] => {
      const v = 1 - u;
      return [v * v * g.x0 + 2 * v * u * g.cx + u * u * ex, v * v * g.y0 + 2 * v * u * g.cy + u * u * ey];
    };
    if (g.os) {
      const T = 0.8;
      if (t < T) [x, y] = bez(mj(Math.pow(t / T, 0.85)), g.x1 + g.ox, g.y1 + g.oy);
      else { const c = mj((t - T) / (1 - T)); x = g.x1 + g.ox * (1 - c); y = g.y1 + g.oy * (1 - c); }
    } else [x, y] = bez(mj(Math.pow(t, 0.85)), g.x1, g.y1);
    break;
  }
  return [x, y];
};

/** Pointer position at frame f (exported so the motion can be checked numerically). */
export const cursorPos = (f: number, path: HP[], clicks: number[], holds: [number, number][] = []): [number, number] => {
  const { first, segs } = build(path, clicks, holds);
  let [x, y] = posAt(f, first, segs);
  // Resting tremor: fades out while moving, around clicks and during drags.
  let q = 1;
  for (const g of segs) q = Math.min(q, sstep(0, 6, f < g.s ? g.s - f : f > g.b ? f - g.b : 0));
  for (const c of clicks) q = Math.min(q, sstep(3, 12, Math.abs(f - c)));
  for (const [h0, h1] of holds) q = Math.min(q, sstep(0, 8, f < h0 ? h0 - f : f > h1 ? f - h1 : 0));
  x += q * 2.2 * (Math.sin(f * 0.061 + 1.3) + 0.6 * Math.sin(f * 0.17 + 0.4));
  y += q * 1.8 * (Math.sin(f * 0.047 + 2.1) + 0.6 * Math.sin(f * 0.13 + 4.0));
  return [x, y];
};

export const HumanCursor: React.FC<{ f: number; path: HP[]; clicks: number[]; holds?: [number, number][] }> = ({ f, path, clicks, holds = [] }) => {
  if (!path.length) return null;
  const [x, y] = cursorPos(f, path, clicks, holds);
  const press = clicks.some((c) => f >= c && f < c + 4) || holds.some(([h0, h1]) => f >= h0 && f < h1);
  return (
    <>
      {clicks.map((c) => {
        const t = (f - c) / 14;
        if (t < 0 || t > 1) return null;
        return <div key={c} style={{ position: "absolute", left: x - 6 - 30 * t, top: y - 6 - 30 * t, width: 12 + 60 * t, height: 12 + 60 * t, borderRadius: "50%", background: `rgba(217,119,87,${0.45 * (1 - t)})` }} />;
      })}
      <svg width={34} height={46} viewBox="0 0 17 23" style={{ position: "absolute", left: x - 3, top: y - 2, transform: `scale(${press ? 0.88 : 1})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.3))" }}>
        <path d="M1.5 1.2 L1.5 18.5 L5.6 14.6 L8.4 21 L11.3 19.8 L8.6 13.6 L14.2 13.6 Z" fill="#111" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
      </svg>
    </>
  );
};
