import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT } from "./ui";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Orange intro card. */
export const IntroCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = (at: number) => interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#FF9A1F 0%,#F26B0F 100%)", fontFamily: FONT, color: "#fff", justifyContent: "center", paddingLeft: 140 }}>
      <div style={{ opacity: a(4), translate: `0px ${(1 - a(4)) * 20}px`, fontSize: 34, fontWeight: 800, letterSpacing: 3, background: "rgba(0,0,0,0.18)", alignSelf: "flex-start", padding: "8px 20px", borderRadius: 10 }}>
        PROTEAN (NSDL) OFFICIAL WEBSITE
      </div>
      <div style={{ opacity: a(10), translate: `0px ${(1 - a(10)) * 24}px`, fontSize: 120, fontWeight: 900, lineHeight: 1.02, marginTop: 30, letterSpacing: -2 }}>
        PAN Card Online
        <br />
        Apply 2026
      </div>
      <div style={{ opacity: a(22), fontSize: 46, fontWeight: 800, marginTop: 30, color: "#1B1300" }}>Step by Step • New Form No. 93</div>
      <div style={{ position: "absolute", left: 140, bottom: 90, opacity: a(30), fontSize: 32, fontWeight: 800 }}>Learn Vexa • @learn_vexa</div>
    </AbsoluteFill>
  );
};
