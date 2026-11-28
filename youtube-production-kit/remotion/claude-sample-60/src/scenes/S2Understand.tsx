import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AIMark, Glass, Kicker } from "../components/ui";
import { prog, rise, sceneFade } from "../components/anim";
import { C, FONT } from "../theme";

const CARDS = [
  { t: "CHANNEL NICHE", s: "Tech tutorials in Hindi", x: 170, y: 250 },
  { t: "TARGET AUDIENCE", s: "Beginners, 18-30", x: 1270, y: 250 },
  { t: "WRITING STYLE", s: "Simple Hinglish, friendly", x: 170, y: 640 },
  { t: "CONTENT STRATEGY", s: "2 long + 4 Shorts / week", x: 1270, y: 640 },
];

export const S2Understand: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Kicker style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", ...rise(f, 4) }}>AI JO AAPKA CHANNEL SAMJHE</Kicker>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {CARDS.map((c, i) => {
          const p = prog(f, 30 + i * 32 + 14, 24);
          const x1 = c.x + 240, y1 = c.y + 75;
          return <line key={i} x1={x1} y1={y1} x2={x1 + (960 - x1) * p} y2={y1 + (540 - y1) * p} stroke="#9b7bff" strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-f} opacity={0.8} />;
        })}
      </svg>
      <Glass glow={0.5 + 0.3 * Math.sin(f / 15)} style={{ position: "absolute", left: 760, top: 370, width: 400, height: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...rise(f, 10) }}>
        <AIMark size={150} />
        <div style={{ fontSize: 32, fontWeight: 900, marginTop: 14 }}>Claude AI</div>
        <div style={{ fontSize: 22, color: C.mut, marginTop: 6 }}>{Math.round(prog(f, 40, 130) * 100)}% context</div>
      </Glass>
      {CARDS.map((c, i) => {
        const at = 30 + i * 32;
        const lit = prog(f, at + 30, 14);
        return (
          <Glass key={c.t} glow={lit * 0.6} style={{ position: "absolute", left: c.x, top: c.y, width: 480, padding: "26px 32px", ...rise(f, at, 40) }}>
            <div style={{ fontFamily: FONT, fontSize: 22, letterSpacing: 3, color: C.lav, fontWeight: 800 }}>0{i + 1}</div>
            <div style={{ fontSize: 36, fontWeight: 900, marginTop: 6 }}>{c.t}</div>
            <div style={{ fontSize: 24, color: C.mut, marginTop: 6 }}>e.g. {c.s}</div>
          </Glass>
        );
      })}
    </AbsoluteFill>
  );
};
