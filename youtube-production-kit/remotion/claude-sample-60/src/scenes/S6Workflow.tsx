import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AIMark, Glass, Kicker } from "../components/ui";
import { prog, rise, sceneFade } from "../components/anim";
import { C, FONT } from "../theme";

const STEPS = ["RESEARCH", "SCRIPT", "THUMBNAIL", "ANALYTICS"];
const POS = [
  { x: 260, y: 300 },
  { x: 1360, y: 300 },
  { x: 1360, y: 700 },
  { x: 260, y: 700 },
];

export const S6Workflow: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const step = Math.max(1, Math.round((dur - 60) / 4));
  const pts = POS.map((p) => [p.x + 150, p.y + 60]);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur), fontFamily: FONT }}>
      <Kicker style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", ...rise(f, 4) }}>AI CONTENT ASSISTANT WORKFLOW</Kicker>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {pts.map((a, i) => {
          const b = pts[(i + 1) % 4];
          const p = prog(f, 20 + i * step, step);
          return (
            <g key={i}>
              <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * p} y2={a[1] + (b[1] - a[1]) * p} stroke="#9b7bff" strokeWidth={4} />
              {p > 0.05 && p < 1 ? <circle cx={a[0] + (b[0] - a[0]) * p} cy={a[1] + (b[1] - a[1]) * p} r={10} fill="#c4b5fd" /> : null}
            </g>
          );
        })}
        {pts.map((a, i) => (
          <line key={`c${i}`} x1={960} y1={540} x2={a[0]} y2={a[1]} stroke="rgba(196,181,253,0.25)" strokeWidth={2} strokeDasharray="8 10" strokeDashoffset={-f * 1.5} />
        ))}
      </svg>
      {STEPS.map((s, i) => (
        <Glass key={s} glow={prog(f, 20 + i * step, 12) * 0.8} style={{ position: "absolute", left: POS[i].x, top: POS[i].y, width: 300, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, ...rise(f, 10 + i * 6) }}>
          <span style={{ color: C.lav, marginRight: 12 }}>{i + 1}</span>
          {s}
        </Glass>
      ))}
      <Glass glow={0.7} style={{ position: "absolute", left: 800, top: 420, width: 320, height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...rise(f, 6) }}>
        <AIMark size={110} />
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 10 }}>AI Assistant</div>
      </Glass>
    </AbsoluteFill>
  );
};
