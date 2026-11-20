import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AppWindow, Cursor, Glass, Pill } from "../components/ui";
import { prog, rise, sceneFade } from "../components/anim";
import { C, FONT } from "../theme";

const NAME = "MY YOUTUBE AI ASSISTANT";
const FILES = [
  { n: "Channel Details.md", k: "DOC" },
  { n: "Previous Scripts.zip", k: "ZIP" },
  { n: "YouTube Analytics.csv", k: "CSV" },
];

export const S3Projects: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  // cursor path: to Projects (sidebar) → to New project button → idle
  const cx = interpolate(f, [0, 30, 60, 90], [1400, 290, 290, 1530], { extrapolateRight: "clamp" });
  const cy = interpolate(f, [0, 30, 60, 90], [800, 345, 345, 300], { extrapolateRight: "clamp" });
  const click1 = prog(f, 32, 8) * (1 - prog(f, 44, 10));
  const click2 = prog(f, 92, 8) * (1 - prog(f, 104, 10));
  const active = f >= 34 ? "Projects" : "New chat";
  const typed = NAME.slice(0, Math.max(0, Math.floor((f - 110) / 1.6)));
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <AppWindow style={{ left: 110, top: 90, width: 1700, height: 900 }} active={active}>
        <div style={{ padding: "36px 48px", fontFamily: FONT }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 44, fontWeight: 900 }}>Projects</div>
            <div style={{ marginLeft: "auto", background: C.purple, padding: "14px 28px", borderRadius: 14, fontSize: 26, fontWeight: 800, boxShadow: `0 0 ${30 * click2}px rgba(155,123,255,0.9)` }}>+ New project</div>
          </div>
          <Glass style={{ marginTop: 34, padding: "30px 36px", ...rise(f, 100) }}>
            <div style={{ fontSize: 22, color: C.mut }}>Project name</div>
            <div style={{ fontSize: 40, fontWeight: 900, marginTop: 10, minHeight: 52, letterSpacing: 1 }}>
              {typed}
              <span style={{ opacity: f > 110 && typed.length < NAME.length ? 1 : 0, color: C.lav }}>|</span>
            </div>
          </Glass>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 26, marginTop: 30 }}>
            {FILES.map((fl, i) => {
              const at = 170 + i * 34;
              const up = prog(f, at + 6, 30);
              const done = up >= 1;
              return (
                <Glass key={fl.n} glow={done ? 0.35 : 0} style={{ padding: "26px 28px", ...rise(f, at) }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 64, height: 76, borderRadius: 12, background: "rgba(124,92,255,0.25)", border: `2px solid ${C.violet}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.lav }}>{fl.k}</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{fl.n}</div>
                  </div>
                  <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 6, marginTop: 22, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${up * 100}%`, background: done ? C.green : "linear-gradient(90deg,#7c5cff,#c4b5fd)" }} />
                  </div>
                  <div style={{ fontSize: 20, color: done ? C.green : C.mut, marginTop: 10, fontWeight: 700 }}>{done ? "✓ Uploaded" : `Uploading… ${Math.round(up * 100)}%`}</div>
                </Glass>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150, marginTop: 34, ...rise(f, 250) }}>
            {[42, 58, 50, 76, 64, 90, 82, 110, 96, 128, 118, 140].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h * prog(f, 255 + i * 3, 20), borderRadius: 8, background: i > 8 ? "linear-gradient(180deg,#c4b5fd,#7c5cff)" : "rgba(196,181,253,0.25)" }} />
            ))}
            <Pill color="rgba(124,92,255,0.35)" style={{ alignSelf: "flex-start", fontSize: 18 }}>Sample chart · not real data</Pill>
          </div>
        </div>
      </AppWindow>
      <Cursor x={cx} y={cy} click={Math.max(click1, click2)} />
    </AbsoluteFill>
  );
};
