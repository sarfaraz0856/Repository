import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AIMark, AppWindow, Kicker, YouTubeIcon } from "../components/ui";
import { prog, rise, sceneFade } from "../components/anim";
import { C, FONT } from "../theme";

export const S1Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const line = prog(f, 30, 40);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur, 15) }}>
      <div style={{ position: "absolute", left: 200, top: 300, ...rise(f, 8) }}>
        <YouTubeIcon size={260} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="dl" x1="0" x2="1">
            <stop offset="0" stopColor="#ff4d6a" />
            <stop offset="1" stopColor="#9b7bff" />
          </linearGradient>
        </defs>
        {[-40, 0, 40].map((o, i) => (
          <path key={i} d={`M 470 ${390 + o} C 700 ${300 + o * 2}, 900 ${480 - o}, 1110 ${400 + o}`} stroke="url(#dl)" strokeWidth={4} fill="none" strokeDasharray="900" strokeDashoffset={900 * (1 - line)} opacity={0.85} />
        ))}
        {[0, 1, 2].map((i) => {
          const t = ((f - 50 + i * 20) % 60) / 60;
          return f > 50 ? <circle key={i} cx={470 + 640 * t} cy={390 + Math.sin(t * Math.PI) * -30} r={7} fill="#c4b5fd" opacity={1 - t * 0.5} /> : null;
        })}
      </svg>
      <AppWindow style={{ left: 1110, top: 210, width: 640, height: 430, ...rise(f, 18) }} active="Projects">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 60 }}>
          <AIMark size={130} glow={0.6 + 0.4 * Math.sin(f / 12)} />
          <div style={{ fontFamily: FONT, fontSize: 22, color: C.lav, marginTop: 18, textAlign: "center", fontWeight: 700 }}>Channel context loaded</div>
        </div>
      </AppWindow>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: FONT }}>
        <Kicker style={{ ...rise(f, 60) }}>CLAUDE AI FOR YOUTUBE</Kicker>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: -2, color: C.white, marginTop: 14, ...rise(f, 72, 40, 22) }}>
          YOUR PERSONAL{" "}
          <span style={{ background: "linear-gradient(90deg,#c4b5fd,#7c5cff)", WebkitBackgroundClip: "text", color: "transparent" }}>AI TEAM MEMBER</span>
        </div>
        <div style={{ height: 6, width: interpolate(prog(f, 100, 30), [0, 1], [0, 760]), margin: "18px auto 0", borderRadius: 3, background: "linear-gradient(90deg,#7c5cff,#c4b5fd)" }} />
      </div>
    </AbsoluteFill>
  );
};
