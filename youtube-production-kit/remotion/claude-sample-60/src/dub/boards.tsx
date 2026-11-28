// Explainer "board" building blocks for the dub tutorial (warm page, white cards), in the same
// visual language as the Claude-screen video overlays.
import React from "react";
import { Chapter, Sfx, Typing } from "../real/chat";
import { Cursor, K, SANS, SERIF, StepChip, p01 } from "../real/ui";
import type { P } from "../real/shell";

export const BoardShell: React.FC<{
  f: number; dur: number; n: number; chapter: string; children?: React.ReactNode;
  steps?: { from: number; to: number; n: number; text: string }[]; cursor?: P[]; clicks?: number[]; typing?: Typing[];
}> = ({ f, dur, n, chapter, children, steps = [], cursor, clicks = [], typing = [] }) => (
  <div style={{ position: "absolute", inset: 0, background: K.page, fontFamily: SANS, color: K.text, overflow: "hidden", opacity: Math.min(p01(f, 0, 6), 1 - p01(f, dur - 4, 4)) }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(60,50,30,0.07) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
    {children}
    <StepChip f={f} steps={steps} />
    <Chapter f={f} n={n} title={chapter} />
    {cursor ? <Cursor f={f} path={cursor} clicks={clicks} /> : null}
    <Sfx clicks={clicks} typing={typing} />
  </div>
);

/** Fade + rise in. */
export const rise = (f: number, at: number, dist = 26, len = 14): React.CSSProperties => {
  const p = p01(f, at, len);
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

export const Card: React.FC<{ x: number; y: number; w: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: K.card, border: `1.5px solid ${K.border}`, borderRadius: 24, boxShadow: "0 18px 50px rgba(40,35,20,0.08)", boxSizing: "border-box", ...style }}>{children}</div>
);

export const Title: React.FC<{ f: number; at: number; kicker?: string; text: string; y?: number }> = ({ f, at, kicker, text, y = 120 }) => (
  <div style={{ position: "absolute", left: 120, top: y, ...rise(f, at) }}>
    {kicker ? <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 3, color: K.clay }}>{kicker}</div> : null}
    <div style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 500, marginTop: 6, letterSpacing: -0.5 }}>{text}</div>
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; tone?: "clay" | "dark" | "ok" | "bad" | "plain"; style?: React.CSSProperties }> = ({ children, tone = "plain", style }) => {
  const bg = { clay: K.clay, dark: K.dark, ok: "#E6F4EA", bad: "#FDE8E6", plain: K.card }[tone];
  const fg = { clay: "#fff", dark: "#fff", ok: "#1E7B3A", bad: "#B3261E", plain: K.text }[tone];
  return <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: bg, color: fg, border: tone === "plain" ? `1.5px solid ${K.border}` : "none", borderRadius: 999, padding: "12px 24px", fontSize: 24, fontWeight: 600, ...style }}>{children}</div>;
};

export const Mark: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 34 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: ok ? "#3E9B57" : "#D6453D", color: "#fff", display: "grid", placeItems: "center", fontSize: size * 0.58, fontWeight: 800, flexShrink: 0 }}>{ok ? "✓" : "✕"}</div>
);

/** Small deterministic waveform. */
export const MiniWave: React.FC<{ w: number; h: number; color: string; seed: number; bars?: number }> = ({ w, h, color, seed, bars = 40 }) => (
  <div style={{ width: w, height: h, display: "flex", alignItems: "center", gap: 2 }}>
    {Array.from({ length: bars }).map((_, i) => (
      <div key={i} style={{ flex: 1, height: h * (0.2 + 0.8 * Math.abs(Math.sin(i * 0.7 * seed + seed) * Math.cos(i * 0.31 + seed))), borderRadius: 2, background: color }} />
    ))}
  </div>
);

/** Simple line icons. */
export const BI = {
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  robot: "M7 8h10v10H7zM12 4v4M9.5 12h.01M14.5 12h.01M10 15h4M4 12v3M20 12v3",
  clone: "M8 8h11v11H8zM5 16V5h11",
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  wave: "M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9c-4.5-1-8-4-8-9V6z",
};
export const BIcon: React.FC<{ d: string; size?: number; color?: string }> = ({ d, size = 44, color = K.clay }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
