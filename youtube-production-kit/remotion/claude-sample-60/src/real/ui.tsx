// "Screen recording" style kit: a faithful-looking recreation of the Claude web app (light theme)
// inside a desktop browser, drawn at ~1.3x so it stays readable on phones. Layout uses absolute
// coordinates so the cursor can be pointed at real element positions.
import React from "react";
import { Easing, interpolate } from "remotion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/source-serif-4/400.css";
import "@fontsource/source-serif-4/500.css";
import "@fontsource/source-serif-4/600.css";

export const SANS = "Inter, system-ui, sans-serif";
export const SERIF = "'Source Serif 4', Georgia, serif";
export const K = {
  page: "#FAF9F5",
  side: "#F3F1EA",
  border: "#E4E1D6",
  card: "#FFFFFF",
  text: "#1F1E1B",
  sub: "#6F6C64",
  faint: "#A29F95",
  clay: "#D97757",
  clayDark: "#C2603F",
  dark: "#262624",
  hover: "#EAE7DD",
};
export const Y0 = 92; // top of the web page, below the browser chrome
export const SIDE_W = 330;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const p01 = (f: number, a: number, len = 12) => interpolate(f, [a, a + len], [0, 1], { ...clamp, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
export const typed = (txt: string, f: number, start: number, cps = 16) =>
  txt.slice(0, Math.max(0, Math.min(txt.length, Math.floor(((f - start) / 30) * cps))));
export const typeEnd = (txt: string, start: number, cps = 16) => start + Math.ceil((txt.length / cps) * 30);
export const Caret: React.FC<{ f: number; on: boolean }> = ({ f, on }) =>
  on ? <span style={{ display: "inline-block", width: 2, height: "1.1em", marginLeft: 1, verticalAlign: "-0.15em", background: K.text, opacity: Math.floor(f / 15) % 2 === 0 ? 1 : 0 }} /> : null;

/** Claude-style orange spark mark. */
export const Spark: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = K.clay }) => {
  const lens = [46, 40, 47, 38, 45, 41, 47, 39, 44, 42, 46, 38];
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      {lens.map((L, i) => (
        <path key={i} transform={`rotate(${i * 30 + (i % 2) * 4})`} d={`M -4.5 0 L -1.6 ${-L} Q 0 ${-L - 3} 1.6 ${-L} L 4.5 0 Z`} fill={color} />
      ))}
      <circle r={7} fill={color} />
    </svg>
  );
};

const Icon: React.FC<{ d: string; size?: number; color?: string }> = ({ d, size = 24, color = K.sub }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
export const IC = {
  chat: "M4 5h16v11H9l-5 4z",
  folder: "M3 7h6l2 2h10v10H3z",
  art: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  plus: "M12 5v14M5 12h14",
  search: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14zM20 20l-4-4",
  back: "M15 5l-7 7l7 7",
  pencil: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4",
  lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
  tools: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
  clock: "M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16zM12 8v4l3 2",
};

/** Desktop browser frame (light Chrome-like). */
export type Tab = { t: string; kind: "claude" | "studio" | "sheet" };
const TabIcon: React.FC<{ kind: Tab["kind"] }> = ({ kind }) =>
  kind === "claude" ? <Spark size={18} /> : kind === "studio" ? (
    <div style={{ width: 20, height: 14, borderRadius: 4, background: "#E5322D", display: "grid", placeItems: "center" }}><div style={{ width: 0, height: 0, borderLeft: "6px solid #fff", borderTop: "4px solid transparent", borderBottom: "4px solid transparent" }} /></div>
  ) : <div style={{ width: 16, height: 18, borderRadius: 3, background: "#2F8F5B" }} />;

/** Desktop browser frame (light Chrome-like) with tabs and an optional download chip. */
export const Browser: React.FC<{ url: string; tabs?: Tab[]; active?: number; download?: number; children?: React.ReactNode }> = ({
  url, tabs = [{ t: "Claude", kind: "claude" }], active = 0, download = 0, children,
}) => (
  <div style={{ position: "absolute", inset: 0, background: K.page, fontFamily: SANS, color: K.text, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 44, background: "#DFDDD8", display: "flex", alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 9, padding: "0 20px", alignSelf: "center" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
      </div>
      {tabs.map((tb, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 14 : 4, width: 270, height: 36, background: i === active ? "#F6F5F2" : "transparent", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontSize: 16, color: i === active ? K.text : K.sub, whiteSpace: "nowrap", overflow: "hidden" }}>
          <TabIcon kind={tb.kind} /> {tb.t}
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 44, height: 48, background: "#F6F5F2", borderBottom: `1px solid ${K.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 18 }}>
      <span style={{ color: K.faint, fontSize: 22, letterSpacing: 6 }}>‹ › ⟳</span>
      <div style={{ flex: 1, height: 34, borderRadius: 17, background: "#ECEAE4", display: "flex", alignItems: "center", gap: 8, padding: "0 16px", fontSize: 17, color: K.sub }}>
        <Icon d={IC.lock} size={16} /> {url}
      </div>
      <div style={{ width: 34, height: 34, borderRadius: 17, display: "grid", placeItems: "center", background: download > 0 ? "#DCE8FA" : "transparent", color: "#2B63C9", fontSize: 20, fontWeight: 700 }}>⤓</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: Y0, bottom: 0 }}>{children}</div>
    {download > 0 ? (
      <div style={{ position: "absolute", right: 16, top: 96, width: 420, background: "#fff", borderRadius: 14, boxShadow: "0 12px 34px rgba(0,0,0,0.18)", padding: "16px 20px", opacity: download, display: "flex", alignItems: "center", gap: 14, fontSize: 18 }}>
        <div style={{ width: 34, height: 40, borderRadius: 5, background: "#2F8F5B", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>CSV</div>
        <div><div style={{ fontWeight: 600 }}>channel-analytics.csv</div><div style={{ color: K.sub, fontSize: 15 }}>18.4 KB · Done</div></div>
      </div>
    ) : null}
  </div>
);

export const SIDE_ITEMS = ["New chat", "Chats", "Projects", "Artifacts"] as const;
export const sideItemY = (i: number) => 84 + i * 54; // relative to page top
/** Page-relative y → screen y */
export const sy = (y: number) => Y0 + y;

export const Sidebar: React.FC<{ active?: string; hover?: string }> = ({ active, hover }) => (
  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: SIDE_W, background: K.side, borderRight: `1px solid ${K.border}` }}>
    <div style={{ position: "absolute", left: 26, top: 22, fontFamily: SERIF, fontSize: 32, fontWeight: 500 }}>Claude</div>
    {SIDE_ITEMS.map((name, i) => {
      const on = active === name || hover === name;
      const icon = [IC.plus, IC.chat, IC.folder, IC.art][i];
      return (
        <div
          key={name}
          style={{
            position: "absolute", left: 14, right: 14, top: sideItemY(i), height: 48, borderRadius: 10,
            background: active === name ? "#E6E2D6" : on ? K.hover : "transparent",
            display: "flex", alignItems: "center", gap: 14, padding: "0 14px", fontSize: 21, fontWeight: i === 0 ? 600 : 500,
            color: i === 0 ? K.clayDark : K.text,
          }}
        >
          {i === 0 ? (
            <div style={{ width: 30, height: 30, borderRadius: 15, background: K.clay, display: "grid", placeItems: "center" }}>
              <Icon d={IC.plus} size={18} color="#fff" />
            </div>
          ) : (
            <Icon d={icon} />
          )}
          {name}
        </div>
      );
    })}
    <div style={{ position: "absolute", left: 28, top: 330, fontSize: 16, color: K.sub, fontWeight: 600 }}>Recents</div>
    {["Weekly upload plan", "Thumbnail text ideas", "Shorts hook rewrite", "Video script outline", "Comment reply drafts"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 28, right: 20, top: 368 + i * 44, fontSize: 19, color: "#3C3A35", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {t}
      </div>
    ))}
    <div style={{ position: "absolute", left: 14, right: 14, bottom: 18, height: 64, borderRadius: 12, display: "flex", alignItems: "center", gap: 14, padding: "0 12px" }}>
      <div style={{ width: 40, height: 40, borderRadius: 20, background: "#3D3B36", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 18 }}>S</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Sujan</div>
        <div style={{ fontSize: 15, color: K.sub }}>Pro plan</div>
      </div>
    </div>
  </div>
);

export const Composer: React.FC<{ left: number; top: number; width: number; height?: number; text?: string; f?: number; focus?: boolean; placeholder?: string; file?: string }> = ({
  left, top, width, height, text = "", f = 0, focus = false, placeholder = "How can I help you today?", file,
}) => (
  <div
    style={{
      position: "absolute", left, top, width, height, minHeight: height ? undefined : 150, boxSizing: height ? "border-box" : "content-box", background: K.card, borderRadius: 22,
      border: `1px solid ${focus ? "#CFCBBE" : K.border}`, boxShadow: "0 6px 24px rgba(40,35,20,0.07)", padding: "22px 26px 70px", fontSize: 22, lineHeight: 1.4, overflow: "hidden",
      fontFamily: SANS, color: K.text,
    }}
  >
    <div style={{ position: "absolute", left: 26, right: 26, top: 20, bottom: 66, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
      <div>
        {file ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: K.side, border: `1px solid ${K.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 16, marginRight: 10, verticalAlign: "2px" }}>
            <b style={{ color: file.endsWith(".csv") ? "#2F8F5B" : "#5B6B8C" }}>{file.split(".").pop()?.toUpperCase()}</b> {file}
          </span>
        ) : null}
        {text ? <span>{text}</span> : <span style={{ color: K.faint }}>{placeholder}</span>}
        <Caret f={f} on={focus} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 20, bottom: 16, display: "flex", gap: 10 }}>
      {[IC.plus, IC.tools, IC.clock].map((d) => (
        <div key={d} style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${K.border}`, display: "grid", placeItems: "center", background: K.card }}>
          <Icon d={d} size={20} />
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", right: 20, bottom: 16, display: "flex", gap: 14, alignItems: "center" }}>
      <span style={{ fontSize: 18, color: K.sub }}>Opus 5.5 · Medium ⌄</span>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: text ? K.clay : "#E9B9A6", display: "grid", placeItems: "center", color: "#fff", fontSize: 24, fontWeight: 700 }}>↑</div>
    </div>
  </div>
);

export const Button: React.FC<{ x: number; y: number; w: number; h?: number; dark?: boolean; pressed?: number; disabled?: boolean; children: React.ReactNode }> = ({
  x, y, w, h = 56, dark = true, pressed = 0, disabled, children,
}) => (
  <div
    style={{
      position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12, display: "grid", placeItems: "center",
      fontSize: 20, fontWeight: 600,
      background: dark ? (disabled ? "#9C9A93" : pressed > 0 ? "#000" : K.dark) : pressed > 0 ? K.hover : K.card,
      color: dark ? "#fff" : K.text, border: dark ? "none" : `1px solid ${K.border}`,
      transform: `scale(${1 - 0.03 * pressed})`,
    }}
  >
    {children}
  </div>
);

export const Input: React.FC<{ x: number; y: number; w: number; h: number; value: string; placeholder: string; focus: boolean; f: number; multiline?: boolean; size?: number }> = ({
  x, y, w, h, value, placeholder, focus, f, multiline, size = 22,
}) => (
  <div
    style={{
      position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12, background: K.card, boxSizing: "border-box",
      border: `${focus ? 2 : 1}px solid ${focus ? "#8FB4E8" : K.border}`, boxShadow: focus ? "0 0 0 4px rgba(120,160,230,0.18)" : "none",
      padding: multiline ? "16px 18px" : "0 18px", display: multiline ? "block" : "flex", alignItems: "center", fontSize: size, lineHeight: 1.45,
    }}
  >
    {value ? <span>{value}</span> : <span style={{ color: K.faint }}>{placeholder}</span>}
    <Caret f={f} on={focus} />
  </div>
);

/** Soft clay highlight ring that pulses around a target element. */
export const Ring: React.FC<{ x: number; y: number; w: number; h: number; f: number; from: number; to: number; r?: number }> = ({ x, y, w, h, f, from, to, r = 16 }) => {
  const o = Math.min(p01(f, from, 10), 1 - p01(f, to - 10, 10));
  if (o <= 0) return null;
  const pulse = 0.5 + 0.5 * Math.sin((f - from) / 7);
  return (
    <div
      style={{
        position: "absolute", left: x - 8, top: y - 8, width: w + 16, height: h + 16, borderRadius: r + 6, opacity: o,
        border: `3px solid ${K.clay}`, boxShadow: `0 0 ${18 + 14 * pulse}px rgba(217,119,87,${0.35 + 0.25 * pulse})`,
      }}
    />
  );
};

/** Tutorial step chip, bottom-left, outside the app chrome. */
export const StepChip: React.FC<{ f: number; steps: { from: number; to: number; n: number; text: string }[] }> = ({ f, steps }) => (
  <>
    {steps.map((s) => {
      const o = Math.min(p01(f, s.from, 12), 1 - p01(f, s.to - 10, 10));
      if (o <= 0) return null;
      return (
        <div
          key={s.n}
          style={{
            position: "absolute", right: 36, bottom: 40, opacity: o, transform: `translateY(${(1 - p01(f, s.from, 12)) * 24}px)`,
            background: "rgba(31,30,27,0.94)", color: "#fff", borderRadius: 999, padding: "14px 26px 14px 16px",
            display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontSize: 24, fontWeight: 600, boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 19, background: K.clay, display: "grid", placeItems: "center", fontSize: 20 }}>{s.n}</div>
          {s.text}
        </div>
      );
    })}
  </>
);

/** macOS arrow cursor that glides between keyframes [frame, x, y] with click ripples. */
export const Cursor: React.FC<{ f: number; path: [number, number, number][]; clicks: number[] }> = ({ f, path, clicks }) => {
  let x = path[0][1], y = path[0][2];
  for (let i = 0; i < path.length - 1; i++) {
    const [a, x0, y0] = path[i], [b, x1, y1] = path[i + 1];
    if (f >= a && f <= b) {
      const t = interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
      x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t;
    } else if (f > b) { x = x1; y = y1; }
  }
  const press = clicks.some((c) => f >= c && f < c + 4);
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

export const DemoTag: React.FC = () => (
  <div style={{ position: "absolute", right: 22, bottom: 16, fontFamily: SANS, fontSize: 14, color: "rgba(60,58,53,0.45)", letterSpacing: 0.5 }}>Recreated demo · interface may differ</div>
);
