import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, hexA } from "./ui";

/** Shared scene frame: background, step header, demo label, fade in/out (no black frames: fades to bg). */
export const Shell: React.FC<{
  dur: number;
  step: string;
  title: string;
  demo?: string | false;
  children: React.ReactNode;
}> = ({ dur, step, title, demo = "DEMONSTRATION GRAPHIC • NOT THE OFFICIAL WEBSITE", children }) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const head = interpolate(f, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {/* header */}
        <div style={{ position: "absolute", left: 80, top: 52, display: "flex", alignItems: "center", gap: 22, opacity: head }}>
          {step ? (
            <div style={{ background: C.accent, color: "#1B1300", fontWeight: 900, fontSize: 28, padding: "10px 22px", borderRadius: 12, letterSpacing: 1.5 }}>
              {step}
            </div>
          ) : null}
          <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: -0.5 }}>{title}</div>
        </div>
        {demo ? (
          <div style={{ position: "absolute", right: 80, top: 64, fontSize: 18, fontWeight: 700, color: C.sub, letterSpacing: 1.2, border: `1.5px solid ${hexA("#B9C8E3", 0.4)}`, padding: "6px 14px", borderRadius: 8, opacity: head }}>
            {demo}
          </div>
        ) : null}
        <AbsoluteFill style={{ top: 140, bottom: 170, left: 80, right: 80, width: "auto", height: "auto", justifyContent: "center" }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Persistent background (rendered once, under every scene: stable, no motion). */
export const Background: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(1400px 900px at 70% 20%, ${C.bg2}, ${C.bg1})` }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${hexA("#FFFFFF", 0.035)} 1px, transparent 1px), linear-gradient(90deg, ${hexA("#FFFFFF", 0.035)} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})` }} />
  </AbsoluteFill>
);

/** English subtitle bar for the current sentence. */
export const Subtitle: React.FC<{ text: string; from: number; to: number }> = ({ text, from, to }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 5, to - 3, to + 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f < from || f > to + 2) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ maxWidth: 1500, background: "rgba(0,0,0,0.72)", color: "#fff", fontFamily: FONT, fontSize: 36, fontWeight: 600, lineHeight: 1.3, padding: "12px 28px", borderRadius: 12, textAlign: "center" }}>
        {text}
      </div>
    </div>
  );
};
