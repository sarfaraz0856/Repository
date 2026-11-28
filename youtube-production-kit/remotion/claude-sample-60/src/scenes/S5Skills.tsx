import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AIMark, Glass, Kicker } from "../components/ui";
import { prog, rise, sceneFade } from "../components/anim";
import { C, FONT } from "../theme";

const SKILLS = [
  { t: "TITLE WRITER", s: "5-6 titles, score /10", icon: "T" },
  { t: "THUMBNAIL IDEAS", s: "Visual, text, colours", icon: "▣" },
  { t: "HOOK GENERATOR", s: "10 hook styles", icon: "⚡" },
  { t: "ANALYTICS REPORT", s: "CSV → report card", icon: "▤" },
];

export const S5Skills: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const step = Math.max(1, Math.round(dur / 6));
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur), fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 100, textAlign: "center" }}>
        <Kicker style={rise(f, 4)}>CLAUDE SKILLS</Kicker>
        <div style={{ fontSize: 64, fontWeight: 900, color: C.white, marginTop: 10, ...rise(f, 12) }}>Reusable workflows</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {SKILLS.map((_, i) => {
          const x = 255 + i * 470;
          const p = prog(f, 30 + i * step + 10, 20);
          return <line key={i} x1={x} y1={650} x2={x + (960 - x) * p} y2={650 + (880 - 650) * p} stroke="#9b7bff" strokeWidth={3} opacity={0.7} />;
        })}
      </svg>
      {SKILLS.map((s, i) => {
        const at = 30 + i * step;
        const on = prog(f, at + 8, 14);
        return (
          <Glass key={s.t} glow={on * 0.9} style={{ position: "absolute", left: 85 + i * 470, top: 330, width: 340, height: 320, padding: 30, ...rise(f, at, 40) }}>
            <div style={{ width: 78, height: 78, borderRadius: 20, background: `rgba(124,92,255,${0.2 + 0.5 * on})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: C.white }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 26 }}>{s.t}</div>
            <div style={{ fontSize: 22, color: C.mut, marginTop: 10 }}>{s.s}</div>
            <div style={{ position: "absolute", left: 30, bottom: 26, display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 800, color: on > 0.5 ? C.green : C.mut }}>
              <span style={{ width: 46, height: 26, borderRadius: 99, background: on > 0.5 ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.12)", position: "relative" }}>
                <span style={{ position: "absolute", top: 3, left: 3 + 20 * on, width: 20, height: 20, borderRadius: 99, background: on > 0.5 ? C.green : "#888" }} />
              </span>
              {on > 0.5 ? "ACTIVE" : "OFF"}
            </div>
          </Glass>
        );
      })}
      <div style={{ position: "absolute", left: 900, top: 840, ...rise(f, 20) }}>
        <AIMark size={120} glow={0.5 + 0.5 * prog(f, 30 + 4 * step, 20)} />
      </div>
    </AbsoluteFill>
  );
};
