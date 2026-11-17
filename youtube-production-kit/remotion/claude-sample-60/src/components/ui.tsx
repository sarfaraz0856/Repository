import React from "react";
import { C, FONT } from "../theme";

export const Glass: React.FC<{ style?: React.CSSProperties; glow?: number; children?: React.ReactNode }> = ({ style, glow = 0, children }) => (
  <div
    style={{
      background: "linear-gradient(160deg, rgba(40,34,62,0.88), rgba(22,20,32,0.92))",
      border: `2px solid ${glow > 0 ? `rgba(155,123,255,${0.35 + 0.5 * glow})` : C.line}`,
      borderRadius: 26,
      boxShadow: `0 30px 70px rgba(0,0,0,0.45), 0 0 ${60 * glow}px rgba(124,92,255,${0.45 * glow})`,
      fontFamily: FONT,
      color: C.white,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.purple, style }) => (
  <span style={{ background: color, color: "#fff", fontWeight: 800, fontSize: 24, padding: "8px 18px", borderRadius: 999, letterSpacing: 1, fontFamily: FONT, ...style }}>{children}</span>
);

/** Abstract assistant mark (original shape, not a brand logo). */
export const AIMark: React.FC<{ size?: number; glow?: number }> = ({ size = 120, glow = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 ${18 * glow}px rgba(155,123,255,0.8))` }}>
    <defs>
      <linearGradient id="am" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c4b5fd" />
        <stop offset="1" stopColor="#7c5cff" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#am)" opacity="0.18" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="url(#am)" strokeWidth="5" />
    <circle cx="50" cy="50" r="10" fill="url(#am)" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <circle key={a} cx={50 + 30 * Math.cos((a * Math.PI) / 180)} cy={50 + 30 * Math.sin((a * Math.PI) / 180)} r="5" fill="#f5f3ff" />
    ))}
  </svg>
);

export const YouTubeIcon: React.FC<{ size?: number }> = ({ size = 200 }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70" style={{ filter: "drop-shadow(0 0 30px rgba(255,40,60,0.55))" }}>
    <rect x="0" y="0" width="100" height="70" rx="18" fill="#ff1f3d" />
    <path d="M40 20 L68 35 L40 50 Z" fill="#fff" />
  </svg>
);

export const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({ x, y, click = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 50 }}>
    <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: 999, border: `3px solid rgba(196,181,253,${0.9 * click})`, scale: String(0.6 + 0.8 * click) }} />
    <svg width="38" height="46" viewBox="0 0 19 23" style={{ position: "absolute", left: -3, top: -2, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
      <path d="M1 1 L1 18 L5.5 14 L9 21.5 L12 20 L8.6 12.8 L14.5 12.8 Z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  </div>
);

/** Illustrative desktop window with a sidebar, inspired by an AI chat app layout. */
export const AppWindow: React.FC<{
  style?: React.CSSProperties;
  active?: string;
  children?: React.ReactNode;
  title?: string;
}> = ({ style, active, children, title = "Claude AI" }) => (
  <Glass style={{ position: "absolute", overflow: "hidden", padding: 0, ...style }}>
    <div style={{ height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: `1px solid ${C.line}`, background: "rgba(14,13,19,0.6)" }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c, opacity: 0.85 }} />
      ))}
      <span style={{ marginLeft: 18, fontSize: 22, color: C.mut, fontWeight: 600 }}>{title}</span>
      <span style={{ marginLeft: "auto", fontSize: 18, color: C.mut, border: `1px solid ${C.line}`, padding: "4px 12px", borderRadius: 99 }}>Illustration</span>
    </div>
    <div style={{ position: "absolute", top: 56, bottom: 0, left: 0, width: 280, borderRight: `1px solid ${C.line}`, padding: "26px 18px", background: "rgba(14,13,19,0.35)" }}>
      {["New chat", "Projects", "Artifacts", "Customize"].map((s) => (
        <div
          key={s}
          style={{
            fontSize: 26,
            padding: "14px 18px",
            borderRadius: 14,
            marginBottom: 8,
            color: active === s ? C.white : C.mut,
            background: active === s ? "rgba(124,92,255,0.28)" : "transparent",
            border: active === s ? `2px solid ${C.violet}` : "2px solid transparent",
            fontWeight: active === s ? 800 : 600,
          }}
        >
          {s}
        </div>
      ))}
      <div style={{ marginTop: 26, fontSize: 18, color: C.mut, letterSpacing: 2 }}>RECENTS</div>
      {[0.7, 0.55, 0.62].map((w, i) => (
        <div key={i} style={{ height: 12, width: `${w * 100}%`, background: "rgba(196,181,253,0.12)", borderRadius: 6, margin: "16px 18px 0" }} />
      ))}
    </div>
    <div style={{ position: "absolute", top: 56, bottom: 0, left: 280, right: 0 }}>{children}</div>
  </Glass>
);

export const Kicker: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: C.lav, ...style }}>{children}</div>
);
