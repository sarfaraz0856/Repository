import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AIMark, AppWindow, Glass, Pill } from "../components/ui";
import { prog, rise, sceneFade } from "../components/anim";
import { C, FONT } from "../theme";

const PROMPT = "Suggest 5 video ideas for my YouTube channel.";
const CARDS = [
  { t: "TRENDING VIDEO IDEAS", lines: ["Idea 1 · based on your niche", "Idea 2 · audience question", "Idea 3 · best performer follow-up"] },
  { t: "SCRIPT OUTLINE", lines: ["Hook (0:00-0:20)", "3 main points", "CTA + next video"] },
  { t: "CONTENT STRATEGY", lines: ["1 long video / week", "3 Shorts from it", "Fix low-CTR titles"] },
];

export const S4Ideas: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - 12) / 1.3)));
  const sent = f > 12 + PROMPT.length * 1.3 + 8;
  const thinking = sent && f < 150;
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <AppWindow style={{ left: 110, top: 90, width: 1700, height: 900 }} active="Projects" title="Claude AI · MY YOUTUBE AI ASSISTANT">
        <div style={{ padding: "34px 48px", fontFamily: FONT }}>
          <div style={{ marginLeft: "auto", width: "fit-content", maxWidth: 1100, background: "rgba(124,92,255,0.25)", border: `2px solid ${C.violet}`, borderRadius: 22, padding: "20px 28px", fontSize: 34, fontWeight: 700, opacity: sent ? 1 : 0 }}>{PROMPT}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26, opacity: sent ? 1 : 0 }}>
            <AIMark size={64} glow={thinking ? 1 : 0.4} />
            <div style={{ fontSize: 26, color: C.mut }}>
              {thinking ? `Reading project context${".".repeat(1 + (Math.floor(f / 8) % 3))}` : "Based on your channel details, scripts and analytics:"}
            </div>
            <Pill color="rgba(124,92,255,0.35)" style={{ marginLeft: "auto", fontSize: 18 }}>Example output</Pill>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 26, marginTop: 30 }}>
            {CARDS.map((c, i) => (
              <Glass key={c.t} glow={0.3} style={{ padding: "28px 30px", minHeight: 360, ...rise(f, 150 + i * 22, 40) }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.lav, letterSpacing: 2 }}>{c.t}</div>
                {c.lines.map((l, j) => (
                  <div key={l} style={{ fontSize: 28, marginTop: 22, display: "flex", gap: 12, ...rise(f, 168 + i * 22 + j * 8, 14) }}>
                    <span style={{ color: C.violet }}>●</span>
                    {l}
                  </div>
                ))}
              </Glass>
            ))}
          </div>
          <div style={{ position: "absolute", left: 48, right: 48, bottom: 36, height: 84, border: `2px solid ${C.line}`, borderRadius: 20, background: "rgba(14,13,19,0.55)", fontSize: 30, padding: "22px 26px", color: sent ? C.mut : C.white }}>
            {sent ? "Reply to Claude…" : typed}
            <span style={{ opacity: !sent && Math.floor(f / 10) % 2 === 0 ? 1 : 0, color: C.lav }}>|</span>
          </div>
        </div>
      </AppWindow>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, height: 0, opacity: prog(f, 0, 1) }} />
    </AbsoluteFill>
  );
};
