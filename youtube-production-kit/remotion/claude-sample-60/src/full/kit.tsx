// Shared building blocks for the full documentary. Visual identity matches the 60s sample
// (charcoal / purple / lavender / white); desktop UI is drawn ~20% larger than in the sample.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { FF } from "./fonts";
import { prog } from "../components/anim";

export type Beat = { s: number; d: number };
export type SceneProps = { dur: number; L: Beat[] };
/** Frame (scene-local) at fraction `frac` through line k. */
export const at = (L: Beat[], k: number, frac = 0) => {
  const b = L[Math.min(k, L.length - 1)];
  return Math.round(b.s + b.d * frac);
};
export const show = (f: number, start: number, dist = 34, len = 16) => {
  const p = prog(f, start, len);
  return { opacity: p, translate: `0px ${(1 - p) * dist}px` } as const;
};
export const fadeScene = (f: number, dur: number) => Math.min(prog(f, 0, 14), 1 - prog(f, dur - 14, 14));
export const typed = (txt: string, f: number, start: number, cps = 26) => {
  const n = Math.max(0, Math.min(txt.length, Math.floor(((f - start) / 30) * cps)));
  return txt.slice(0, n);
};
export const caret = (f: number, on: boolean) => <span style={{ opacity: on && Math.floor(f / 12) % 2 === 0 ? 1 : 0, color: C.lav }}>|</span>;

export const Panel: React.FC<{ style?: React.CSSProperties; glow?: number; children?: React.ReactNode }> = ({ style, glow = 0, children }) => (
  <div
    style={{
      background: "linear-gradient(160deg, rgba(40,34,62,0.9), rgba(22,20,32,0.94))",
      border: `2px solid ${glow > 0 ? `rgba(155,123,255,${0.35 + 0.55 * glow})` : C.line}`,
      borderRadius: 28,
      boxShadow: `0 30px 70px rgba(0,0,0,0.45), 0 0 ${70 * glow}px rgba(124,92,255,${0.45 * glow})`,
      fontFamily: FF,
      color: C.white,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Tag: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.purple, style }) => (
  <span style={{ display: "inline-block", background: color, color: "#fff", fontWeight: 800, fontSize: 26, padding: "8px 20px", borderRadius: 999, letterSpacing: 1, fontFamily: FF, ...style }}>{children}</span>
);

export const Heading: React.FC<{ kicker?: string; title: string; f: number; start?: number; style?: React.CSSProperties }> = ({ kicker, title, f, start = 0, style }) => (
  <div style={{ position: "absolute", left: 90, top: 60, fontFamily: FF, ...style }}>
    {kicker ? <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 5, color: C.lav, ...show(f, start) }}>{kicker}</div> : null}
    <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: -1.5, color: C.white, marginTop: 6, ...show(f, start + 6) }}>{title}</div>
  </div>
);

export const Orb: React.FC<{ size?: number; glow?: number }> = ({ size = 140, glow = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 ${20 * glow}px rgba(155,123,255,0.85))` }}>
    <defs>
      <linearGradient id="orbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c4b5fd" />
        <stop offset="1" stopColor="#7c5cff" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#orbg)" opacity="0.18" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="url(#orbg)" strokeWidth="5" />
    <circle cx="50" cy="50" r="10" fill="url(#orbg)" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <circle key={a} cx={50 + 30 * Math.cos((a * Math.PI) / 180)} cy={50 + 30 * Math.sin((a * Math.PI) / 180)} r="5" fill="#f5f3ff" />
    ))}
  </svg>
);

export const YT: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70" style={{ filter: "drop-shadow(0 0 30px rgba(255,40,60,0.5))" }}>
    <rect x="0" y="0" width="100" height="70" rx="18" fill="#ff1f3d" />
    <path d="M40 20 L68 35 L40 50 Z" fill="#fff" />
  </svg>
);

export const Pointer: React.FC<{ path: [number, number, number][]; f: number; clicks?: number[]; hideAt?: number }> = ({ path, f, clicks = [], hideAt }) => {
  // path: [frame, x, y] keyframes (scene-local)
  const fr = path.map((p) => p[0]);
  const x = interpolate(f, fr, path.map((p) => p[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, fr, path.map((p) => p[2]), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c = Math.max(0, ...clicks.map((k) => prog(f, k, 6) * (1 - prog(f, k + 8, 10))));
  const vis = prog(f, path[0][0], 8) * (hideAt === undefined ? 1 : 1 - prog(f, hideAt, 10));
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 60, opacity: vis }}>
      <div style={{ position: "absolute", left: -30, top: -30, width: 60, height: 60, borderRadius: 999, border: `3px solid rgba(196,181,253,${0.9 * c})`, scale: String(0.6 + 0.8 * c) }} />
      <svg width="44" height="54" viewBox="0 0 19 23" style={{ position: "absolute", left: -3, top: -2, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
        <path d="M1 1 L1 18 L5.5 14 L9 21.5 L12 20 L8.6 12.8 L14.5 12.8 Z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Large illustrative desktop app window (sidebar + content). */
export const Desk: React.FC<{ style?: React.CSSProperties; active?: string; title?: string; children?: React.ReactNode; items?: string[] }> = ({
  style,
  active,
  title = "Claude AI",
  children,
  items = ["New chat", "Projects", "Artifacts", "Customize"],
}) => (
  <Panel style={{ position: "absolute", overflow: "hidden", padding: 0, ...style }}>
    <div style={{ height: 66, display: "flex", alignItems: "center", gap: 12, padding: "0 26px", borderBottom: `1px solid ${C.line}`, background: "rgba(14,13,19,0.6)" }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} style={{ width: 16, height: 16, borderRadius: 99, background: c, opacity: 0.85 }} />
      ))}
      <span style={{ marginLeft: 20, fontSize: 26, color: C.mut, fontWeight: 600 }}>{title}</span>
      <span style={{ marginLeft: "auto", fontSize: 20, color: C.mut, border: `1px solid ${C.line}`, padding: "5px 14px", borderRadius: 99 }}>Illustration</span>
    </div>
    <div style={{ position: "absolute", top: 66, bottom: 0, left: 0, width: 330, borderRight: `1px solid ${C.line}`, padding: "30px 20px", background: "rgba(14,13,19,0.35)" }}>
      {items.map((s) => (
        <div
          key={s}
          style={{
            fontSize: 31,
            padding: "16px 20px",
            borderRadius: 16,
            marginBottom: 10,
            color: active === s ? C.white : C.mut,
            background: active === s ? "rgba(124,92,255,0.28)" : "transparent",
            border: active === s ? `2px solid ${C.violet}` : "2px solid transparent",
            fontWeight: active === s ? 800 : 600,
          }}
        >
          {s}
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", top: 66, bottom: 0, left: 330, right: 0 }}>{children}</div>
  </Panel>
);

export const Bubble: React.FC<{ me?: boolean; style?: React.CSSProperties; children: React.ReactNode }> = ({ me, style, children }) => (
  <div
    style={{
      maxWidth: 1100,
      marginLeft: me ? "auto" : 0,
      background: me ? "rgba(124,92,255,0.26)" : "rgba(255,255,255,0.05)",
      border: `2px solid ${me ? C.violet : C.line}`,
      borderRadius: 24,
      padding: "20px 28px",
      fontSize: 32,
      lineHeight: 1.35,
      fontFamily: FF,
      color: C.white,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Field: React.FC<{ label: string; value: string; style?: React.CSSProperties; hl?: number }> = ({ label, value, style, hl = 0 }) => (
  <div style={{ fontFamily: FF, ...style }}>
    <div style={{ fontSize: 22, letterSpacing: 2, color: C.lav, fontWeight: 800 }}>{label}</div>
    <div style={{ marginTop: 8, fontSize: 30, fontWeight: 700, background: "rgba(14,13,19,0.55)", border: `2px solid ${hl > 0 ? C.violet : C.line}`, borderRadius: 14, padding: "14px 18px", minHeight: 62 }}>{value}</div>
  </div>
);

export const Check: React.FC<{ on: number; label: string; style?: React.CSSProperties }> = ({ on, label, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FF, fontSize: 32, fontWeight: 700, color: C.white, ...style }}>
    <span style={{ width: 40, height: 40, borderRadius: 10, border: `3px solid ${on > 0.5 ? C.green : C.line}`, background: on > 0.5 ? "rgba(74,222,128,0.2)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontSize: 28 }}>{on > 0.5 ? "✓" : ""}</span>
    {label}
  </div>
);

export const Sample: React.FC<{ style?: React.CSSProperties; text?: string }> = ({ style, text = "Sample data · not real" }) => (
  <span style={{ display: "inline-block", fontFamily: FF, fontSize: 20, fontWeight: 800, color: C.lav, border: `1px solid ${C.violet}`, borderRadius: 99, padding: "5px 14px", background: "rgba(124,92,255,0.18)", ...style }}>{text}</span>
);
