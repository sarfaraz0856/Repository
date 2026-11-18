import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "./ui";

/* 3 YouTube thumbnails (1280x720) on top of real Protean screenshots. */
export const Thumb: React.FC<{ v: number }> = ({ v }) => {
  const bg = v === 2 ? "thumb_docs.jpg" : "thumb_form.jpg";
  const big = v === 1 ? ["PAN CARD", "ONLINE APPLY"] : v === 2 ? ["AADHAAR", "DOB PROOF NAHI!"] : ["NAYA FORM 93", "PAN CARD 2026"];
  const tag = v === 1 ? "2026 • FORM 93" : v === 2 ? "NEW RULES 2026" : "STEP BY STEP";
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#111" }}>
      <Img src={staticFile(bg)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) blur(1.5px)", scale: "1.08" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "absolute", left: 60, top: 60, background: "#FF8A00", color: "#1B1300", fontWeight: 900, fontSize: 40, padding: "10px 22px", borderRadius: 12 }}>{tag}</div>
      <div style={{ position: "absolute", left: 60, top: 170, color: "#fff", fontWeight: 900, fontSize: 118, lineHeight: 1.0, letterSpacing: -2, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>
        {big[0]}
        <br />
        <span style={{ color: v === 2 ? "#FF4D4D" : "#FFB020" }}>{big[1]}</span>
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 60, color: "#fff", fontWeight: 800, fontSize: 40, background: "rgba(0,0,0,0.55)", padding: "10px 20px", borderRadius: 12 }}>
        Protean (NSDL) official site se
      </div>
    </AbsoluteFill>
  );
};
