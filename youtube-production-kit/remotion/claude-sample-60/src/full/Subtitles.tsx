import React from "react";
import { useCurrentFrame } from "remotion";
import { SUBS } from "./timing";
import { FF } from "./fonts";

/** Burned-in Hindi-Hinglish subtitles: max two lines, inside the bottom safe area. */
export const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const cur = SUBS.find((s) => f >= s.from && f < s.to);
  if (!cur) return null;
  const fade = Math.min(1, (f - cur.from) / 4, (cur.to - f) / 4);
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 44, display: "flex", justifyContent: "center", opacity: fade }}>
      <div
        style={{
          fontFamily: FF,
          fontSize: 40,
          lineHeight: 1.38,
          fontWeight: 600,
          color: "#fff",
          textAlign: "center",
          background: "rgba(10,9,14,0.78)",
          border: "1px solid rgba(196,181,253,0.18)",
          borderRadius: 16,
          padding: "10px 26px",
          maxWidth: 1500,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};
