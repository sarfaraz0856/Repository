import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AppWindow, AIMark } from "../components/ui";
import { prog, rise } from "../components/anim";
import { C, FONT } from "../theme";

export const S7Outro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = 1 - prog(f, dur - 24, 24);
  return (
    <AbsoluteFill style={{ opacity: Math.min(prog(f, 0, 12), out), fontFamily: FONT }}>
      <AppWindow style={{ left: 360, top: 110, width: 1200, height: 520, opacity: 0.55 }} active="Projects">
        <div style={{ display: "flex", justifyContent: "center", marginTop: 110 }}>
          <AIMark size={170} />
        </div>
      </AppWindow>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center" }}>
        <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: -2, color: C.white, ...rise(f, 8, 40, 22) }}>
          CLAUDE AI <span style={{ background: "linear-gradient(90deg,#c4b5fd,#7c5cff)", WebkitBackgroundClip: "text", color: "transparent" }}>FOR YOUTUBE CREATORS</span>
        </div>
        <div style={{ fontSize: 38, fontWeight: 700, color: C.lav, letterSpacing: 4, marginTop: 18, ...rise(f, 24) }}>YOUR PERSONAL AI CONTENT ASSISTANT</div>
        <div style={{ height: 5, width: interpolate(prog(f, 34, 30), [0, 1], [0, 900]), margin: "26px auto 0", borderRadius: 3, background: "linear-gradient(90deg,#7c5cff,#c4b5fd)" }} />
      </div>
    </AbsoluteFill>
  );
};
