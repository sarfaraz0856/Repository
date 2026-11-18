import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export const C = {
  bg1: "#0A1A33",
  bg2: "#10284D",
  panel: "#13305C",
  panel2: "#1A3B6E",
  line: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  sub: "#B9C8E3",
  accent: "#FFB020",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#3B82F6",
  cyan: "#38BDF8",
};

export const FONT = "Inter, 'Inter Display', 'DejaVu Sans', sans-serif";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 progress starting at frame `at`, over `len` frames. */
export const useProg = (at: number, len = 14) => {
  const f = useCurrentFrame();
  return interpolate(f, [at, at + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
};

/** Fade + small rise. Stable after entry (no continuous motion). */
export const Appear: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dy?: number;
}> = ({ at, children, style, dy = 18 }) => {
  const p = useProg(at);
  return (
    <div style={{ opacity: p, translate: `0px ${(1 - p) * dy}px`, ...style }}>
      {children}
    </div>
  );
};

/** Active between [from, to): returns 0..1 glow amount with fade in/out. */
export const useActive = (from: number, to: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [from, from + 8, to - 6, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const Panel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: number;
  color?: string;
}> = ({ children, style, glow = 0, color = C.accent }) => (
  <div
    style={{
      background: `linear-gradient(180deg, ${C.panel2}, ${C.panel})`,
      border: `2px solid ${glow > 0 ? color : C.line}`,
      borderColor: glow > 0 ? hexA(color, 0.25 + glow * 0.75) : C.line,
      boxShadow: glow > 0 ? `0 0 ${28 * glow}px ${hexA(color, 0.45 * glow)}` : "0 10px 30px rgba(0,0,0,0.25)",
      borderRadius: 22,
      padding: 28,
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

export function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const Tag: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.accent,
  style,
}) => (
  <span
    style={{
      display: "inline-block",
      background: hexA(color, 0.16),
      color,
      border: `2px solid ${hexA(color, 0.6)}`,
      borderRadius: 999,
      padding: "6px 18px",
      fontWeight: 700,
      fontSize: 24,
      letterSpacing: 1,
      ...style,
    }}
  >
    {children}
  </span>
);

/* ---------------- Icons (simple inline SVG) ---------------- */
type IP = { size?: number; color?: string };
export const Icon = {
  id: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2.3" />
      <path d="M5.5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 10h5M14 13.5h4" />
    </svg>
  ),
  cake: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4M8 13h3M8 16.5h7" />
    </svg>
  ),
  home: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  phone: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="6.5" y="2" width="11" height="20" rx="2.2" />
      <path d="M10.5 18.5h3" />
    </svg>
  ),
  mail: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M3 6.5l9 6.5 9-6.5" />
    </svg>
  ),
  photo: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 19c1.2-2.6 3.1-3.8 5.5-3.8s4.3 1.2 5.5 3.8" />
    </svg>
  ),
  sign: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M3 17c2.5-6 4.5-9 6-9 2.5 0-1.5 9 1 9 1.5 0 2.5-3 4-3s1 2.5 2.5 2.5S19 15 21 15M3 21h18" />
    </svg>
  ),
  doc: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M6 2.5h8l5 5V21a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21z" />
      <path d="M14 2.5V8h5M9 12.5h7M9 16h7" />
    </svg>
  ),
  upload: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M12 16V4M7 9l5-5 5 5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  download: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M12 4v12M7 11l5 5 5-5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  shield: ({ size = 56, color = C.green }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  ),
  lock: ({ size = 56, color = C.green }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  warn: ({ size = 56, color = C.accent }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9}>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18v.01" />
    </svg>
  ),
  check: ({ size = 40, color = C.green }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6}>
      <circle cx="12" cy="12" r="10" strokeWidth={1.8} />
      <path d="M7.5 12.5l3 3 6-6.5" />
    </svg>
  ),
  cross: ({ size = 40, color = C.red }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6}>
      <circle cx="12" cy="12" r="10" strokeWidth={1.8} />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
    </svg>
  ),
  card: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 9.5h19M6 15h4" />
    </svg>
  ),
  bank: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M3 9.5L12 4l9 5.5M4.5 10v8M9.5 10v8M14.5 10v8M19.5 10v8M3 20.5h18" />
    </svg>
  ),
  search: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
  ),
  globe: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  ),
  mailbox: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="3" y="6" width="18" height="13" rx="1.5" />
      <path d="M3 7l9 6 9-6" />
      <path d="M7 3.5h10" />
    </svg>
  ),
  rupee: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9}>
      <path d="M6 4h12M6 8.5h12M9 4c5 0 6.5 1.5 6.5 4.5S13 13 8 13l7.5 8" />
    </svg>
  ),
  thumb: ({ size = 56, color = C.text }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M7 10v11H3V10zM7 10l4-7c1.7 0 2.5 1 2.2 2.8L12.5 9.5H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 21H7" />
    </svg>
  ),
  bell: ({ size = 56, color = C.text }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2.5H4zM10 21a2 2 0 0 0 4 0" />
    </svg>
  ),
  share: ({ size = 56, color = C.text }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4" />
    </svg>
  ),
  comment: ({ size = 56, color = C.text }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M4 4.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" />
    </svg>
  ),
  refresh: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9}>
      <path d="M20 11a8 8 0 0 0-14.5-4.5L3 9M3 4v5h5M4 13a8 8 0 0 0 14.5 4.5L21 15M21 20v-5h-5" />
    </svg>
  ),
  edit: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9}>
      <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />
    </svg>
  ),
  plus: ({ size = 56, color = C.cyan }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v9M7.5 12h9" />
    </svg>
  ),
};

/** Animated cursor that glides between points; clicks (ripple) on arrival. */
export const Cursor: React.FC<{ points: { at: number; x: number; y: number; click?: boolean }[] }> = ({ points }) => {
  const f = useCurrentFrame();
  if (points.length === 0) return null;
  let x = points[0].x, y = points[0].y;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (f >= b.at) { x = b.x; y = b.y; continue; }
    if (f > b.at - 16) {
      const t = interpolate(f, [b.at - 16, b.at], [0, 1], { easing: Easing.bezier(0.45, 0, 0.2, 1) });
      x = a.x + (b.x - a.x) * t; y = a.y + (b.y - a.y) * t;
    } else { x = a.x; y = a.y; }
    break;
  }
  const opacity = interpolate(f, [points[0].at - 10, points[0].at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ripples = points.filter((p) => p.click && f >= p.at && f < p.at + 20);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none", opacity }}>
      {ripples.map((p, i) => {
        const r = interpolate(f, [p.at, p.at + 20], [6, 46]);
        const o = interpolate(f, [p.at, p.at + 20], [0.9, 0]);
        return (
          <div key={i} style={{ position: "absolute", left: p.x - r, top: p.y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `4px solid ${C.accent}`, opacity: o }} />
        );
      })}
      <svg style={{ position: "absolute", left: x - 4, top: y - 2 }} width={44} height={52} viewBox="0 0 22 26">
        <path d="M2 1.5v19l5-4.5 3.4 7.4 3.3-1.5-3.3-7.2 6.8-.3z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Masked/blurred placeholder used instead of any real personal data. */
export const Masked: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <span style={{ filter: "blur(5px)", userSelect: "none", ...style }}>{text}</span>
);
