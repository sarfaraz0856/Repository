import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, Cursor, FONT, Icon, hexA } from "./ui";
import site from "../public/site/site.json";

/* Real-website scenes: full-page screenshots of the official Protean site captured with Playwright,
   shown inside a browser window with smooth scroll, highlights and cursor. */

export const WIN = { x: 40, y: 30, w: 1840, h: 1020 };
const TABBAR = 48;
const URLBAR = 62;
export const PAGE_TOP = WIN.y + TABBAR + URLBAR;
export const SCALE = WIN.w / site.VW; // css px -> screen px
const PAGE_H = WIN.h - TABBAR - URLBAR;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);

/** Piecewise scroll (css px) from keyframes [frame, scrollY]. */
export const useScroll = (keys: [number, number][]) => {
  const f = useCurrentFrame();
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [fa, va] = keys[i - 1];
    const [fb, vb] = keys[i];
    if (f >= fb) v = vb;
    else if (f > fa) { v = va + (vb - va) * interpolate(f, [fa, fb], [0, 1], { ...clamp, easing: ease }); break; }
    else break;
  }
  return v;
};

export const toScreen = (x: number, y: number, scroll: number) => ({ x: WIN.x + x * SCALE, y: PAGE_TOP + (y - scroll) * SCALE });

export const Highlight: React.FC<{ box: { x: number; y: number; width: number; height: number }; scroll: number; from: number; to: number; color?: string; pad?: number; label?: string }> = ({ box, scroll, from, to, color = C.accent, pad = 8, label }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 10, to - 8, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const p = toScreen(box.x - pad, box.y - pad, scroll);
  const w = (box.width + pad * 2) * SCALE;
  const h = (box.height + pad * 2) * SCALE;
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y, width: w, height: h, opacity: o, border: `5px solid ${color}`, borderRadius: 12, boxShadow: `0 0 0 9999px rgba(0,0,0,0.38), 0 0 30px ${hexA(color, 0.8)}` }}>
      {label ? (
        <div style={{ position: "absolute", left: -5, top: -52, background: color, color: "#1B1300", fontFamily: FONT, fontWeight: 900, fontSize: 26, padding: "6px 16px", borderRadius: 10, whiteSpace: "nowrap" }}>{label}</div>
      ) : null}
    </div>
  );
};

export const BrowserWindow: React.FC<{ url: string; typed?: number; tabTitle: string; domainGlow?: number; domainColor?: string; children: React.ReactNode }> = ({ url, typed, tabTitle, domainGlow = 0, domainColor = C.accent, children }) => {
  const shown = typed === undefined ? url : url.slice(0, typed);
  const domain = url.replace("https://", "").split("/")[0];
  const sh = shown.replace("https://", "");
  const dShown = sh.slice(0, domain.length);
  const rest = sh.slice(domain.length);
  const caret = typed !== undefined && typed < url.length;
  return (
    <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", background: "#fff", fontFamily: FONT }}>
      <div style={{ height: TABBAR, background: "#DEE1E6", display: "flex", alignItems: "flex-end", paddingLeft: 16, gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignSelf: "center", marginRight: 14 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
        </div>
        <div style={{ background: "#fff", height: 38, borderRadius: "10px 10px 0 0", padding: "0 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 17, color: "#333", width: 360, whiteSpace: "nowrap", overflow: "hidden" }}>
          <Icon.globe size={18} color="#666" /> {tabTitle}
        </div>
      </div>
      <div style={{ height: URLBAR, background: "#fff", borderBottom: "1px solid #DADCE0", display: "flex", alignItems: "center", padding: "0 18px", gap: 16 }}>
        <div style={{ color: "#888", fontSize: 26 }}>←&nbsp;&nbsp;→&nbsp;&nbsp;⟳</div>
        <div style={{ flex: 1, height: 42, background: "#F1F3F4", borderRadius: 21, display: "flex", alignItems: "center", padding: "0 18px", gap: 10, fontSize: 21, color: "#555", whiteSpace: "nowrap", overflow: "hidden" }}>
          {typed === undefined || typed >= url.length ? <Icon.lock size={20} color="#3C4043" /> : null}
          <span style={{ color: "#202124", background: hexA(domainColor, 0.25 * domainGlow), outline: domainGlow > 0 ? `3px solid ${hexA(domainColor, domainGlow)}` : "none", borderRadius: 6, padding: "2px 4px" }}>{dShown}</span>
          <span>{rest}</span>
          {caret ? <span style={{ width: 2, height: 24, background: "#202124" }} /> : null}
        </div>
      </div>
      <div style={{ position: "relative", height: PAGE_H, overflow: "hidden", background: "#fff" }}>{children}</div>
    </div>
  );
};

export const PageShot: React.FC<{ src: string; scroll: number; opacity?: number }> = ({ src, scroll, opacity = 1 }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: -scroll * SCALE, width: WIN.w, opacity }} />
);

export const StepBadge: React.FC<{ step: string; title: string }> = ({ step, title }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 14], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", right: WIN.x + 24, top: PAGE_TOP + 18, opacity: o, display: "flex", alignItems: "center", gap: 0, fontFamily: FONT, boxShadow: "0 10px 30px rgba(0,0,0,0.35)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: C.accent, color: "#1B1300", fontWeight: 900, fontSize: 26, padding: "10px 18px" }}>{step}</div>
      <div style={{ background: "#0A1A33", color: "#fff", fontWeight: 800, fontSize: 26, padding: "10px 20px" }}>{title}</div>
    </div>
  );
};

export const Note: React.FC<{ at: number; to: number; color?: string; icon?: React.ReactNode; title: string; text?: string; x: number; y: number; w?: number }> = ({ at, to, color = C.accent, icon, title, text, x, y, w = 620 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 12, to - 8, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o, translate: `0px ${(1 - Math.min(1, o * 1.2)) * 14}px`, fontFamily: FONT, background: "#0A1A33", border: `3px solid ${color}`, borderRadius: 18, padding: "22px 26px", display: "flex", gap: 18, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}>
      <div style={{ flexShrink: 0 }}>{icon ?? <Icon.warn size={48} color={color} />}</div>
      <div>
        <div style={{ color, fontSize: 32, fontWeight: 900 }}>{title}</div>
        {text ? <div style={{ color: "#E6EEFF", fontSize: 26, marginTop: 6, lineHeight: 1.35 }}>{text}</div> : null}
      </div>
    </div>
  );
};

/* ---------- Scene 3 on the real website ---------- */
export const SiteS3: React.FC<{ b: number[]; e: number[]; dur: number }> = ({ b, e }) => {
  const f = useCurrentFrame();
  const url = "https://tinpan.proteantech.in/services/pan/pan-index.html";
  const typeStart = b[1] + 4;
  const typeEnd = typeStart + 60;
  const typed = Math.floor(interpolate(f, [typeStart, typeEnd], [0, url.length], clamp));
  const loadAt = typeEnd + 14;
  const pageO = interpolate(f, [loadAt, loadAt + 14], [0, 1], clamp);
  const hb = site.home.boxes;
  const sidebar = { x: 163, y: hb.knowStatus!.y - 295, width: 268, height: 560 };
  const scroll = useScroll([[0, 0], [b[3], 0], [b[3] + 30, 230], [b[4] - 10, 230], [b[4] + 20, 0]]);
  const domainGlow = interpolate(f, [loadAt + 20, loadAt + 30, e[1] + 4, e[1] + 14, b[4] + 24, b[4] + 34], [0, 1, 1, 0, 0, 1], clamp);
  const pk = (bx: { x: number; y: number; width: number; height: number }, at: number, sc: number, click = false) => {
    const p = toScreen(bx.x + bx.width * 0.5, bx.y + bx.height * 0.6, sc);
    return { at, x: p.x, y: p.y, click };
  };
  const zoom = interpolate(f, [b[3] + 24, b[3] + 44, b[4] - 12, b[4] + 12], [1, 1.3, 1.3, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
     <AbsoluteFill style={{ scale: `${zoom}`, transformOrigin: "460px 640px" }}>
      <BrowserWindow url={url} typed={f < loadAt ? typed : undefined} tabTitle={f < loadAt ? "New Tab" : "Apply for PAN Card, Track Status…"} domainGlow={domainGlow} domainColor={f > b[4] ? C.green : C.accent}>
        {f < loadAt ? (
          <AbsoluteFill style={{ background: "#fff", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
            <div style={{ fontSize: 34, color: "#5F6368", fontWeight: 600 }}>New Tab</div>
          </AbsoluteFill>
        ) : null}
        <PageShot src="site/home.png" scroll={scroll} opacity={pageO} />
      </BrowserWindow>
      <Highlight box={sidebar} scroll={scroll} from={b[3] + 34} to={e[3] + 10} label="PAN Services" />
      <Cursor
        points={[
          { at: b[0], x: 1100, y: 600 },
          { at: b[1], x: 520, y: WIN.y + TABBAR + URLBAR / 2 + 4, click: true },
          { at: b[3] + 30, x: 1000, y: 700 },
          pk(hb.knowStatus!, b[3] + 60, 230),
          pk(hb.aoCodes!, b[3] + 110, 230),
          pk(hb.docsReq!, b[3] + 150, 230),
          { at: b[4] + 30, x: 700, y: WIN.y + TABBAR + URLBAR / 2 + 6 },
        ]}
      />
     </AbsoluteFill>
      <StepBadge step="STEP 1" title="Open the Official Website" />
      <Note at={b[2]} to={e[2] + 6} color={C.cyan} icon={<Icon.download size={48} color={C.cyan} />} title="Direct link in Description ↓" text="tinpan.proteantech.in" x={1180} y={560} />
      <Note at={b[4]} to={e[4] + 20} color={C.red} icon={<Icon.shield size={48} color={C.red} />} title="Apply only on the official website" text="Never enter your Aadhaar number or personal details on unknown websites." x={1140} y={540} w={680} />

    </AbsoluteFill>
  );
};
