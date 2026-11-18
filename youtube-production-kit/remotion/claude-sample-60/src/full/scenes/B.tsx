import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../theme";
import { FF } from "../fonts";
import { prog } from "../../components/anim";
import { at, Bubble, Check, Desk, fadeScene, Heading, Orb, Panel, Pointer, Sample, SceneProps, show, Tag, typed, caret } from "../kit";

// ---------------- Scene 5: teach Claude about your channel ----------------
const Slider: React.FC<{ left: string; right: string; v: number; f: number; st: number }> = ({ left, right, v, f, st }) => (
  <div style={{ marginTop: 20, ...show(f, st) }}>
    <div style={{ display: "flex", fontSize: 24, color: C.mut, fontWeight: 700 }}>
      <span>{left}</span>
      <span style={{ marginLeft: "auto" }}>{right}</span>
    </div>
    <div style={{ position: "relative", height: 12, background: "rgba(255,255,255,0.1)", borderRadius: 6, marginTop: 10 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100 * prog(f, st + 8, 24)}%`, background: "linear-gradient(90deg,#7c5cff,#c4b5fd)", borderRadius: 6 }} />
      <div style={{ position: "absolute", top: -9, left: `calc(${v * 100 * prog(f, st + 8, 24)}% - 15px)`, width: 30, height: 30, borderRadius: 99, background: "#fff" }} />
    </div>
  </div>
);
export const S05: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const merge = prog(f, at(L, 9, 0.15), 24);
  const col = (i: number): React.CSSProperties => ({ position: "absolute", top: 210 + merge * 20, left: 90 + i * 590, width: 560, height: 650, padding: "28px 30px", scale: String(1 - merge * 0.04) });
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <Heading kicker="CONTENT IDENTITY" title="TEACH CLAUDE ABOUT YOUR CHANNEL" f={f} />
      <Panel glow={merge * 0.6} style={{ ...col(0), ...show(f, at(L, 2)) }}>
        <div style={{ fontSize: 24, letterSpacing: 3, color: C.lav, fontWeight: 800 }}>KNOW YOUR AUDIENCE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 20 }}>
          <svg width="96" height="96" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="23" fill="rgba(124,92,255,0.3)" stroke="#9b7bff" strokeWidth="2" />
            <circle cx="24" cy="19" r="7" fill="#c4b5fd" />
            <path d="M10 39c3-8 9-11 14-11s11 3 14 11" fill="#c4b5fd" />
          </svg>
          <div style={{ fontSize: 32, fontWeight: 900 }}>Ideal viewer</div>
        </div>
        {[
          ["Problems they face", 0.0],
          ["Why they watch you", 0.35],
          ["What they should learn", 0.7],
        ].map(([t, fr]) => (
          <Panel key={t as string} style={{ marginTop: 18, padding: "16px 20px", fontSize: 27, fontWeight: 700, ...show(f, at(L, 3, fr as number)) }}>❓ {t}</Panel>
        ))}
      </Panel>
      <Panel glow={merge * 0.6} style={{ ...col(1), ...show(f, at(L, 4)) }}>
        <div style={{ fontSize: 24, letterSpacing: 3, color: C.lav, fontWeight: 800 }}>DEFINE YOUR BRAND VOICE</div>
        <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
          {["Educational", "Entertaining", "Documentary"].map((t, i) => {
            const pick = i === 0 && f > at(L, 5, 0.8);
            return <Tag key={t} color={pick ? C.purple : "rgba(255,255,255,0.1)"} style={{ fontSize: 24, border: pick ? "2px solid #c4b5fd" : "2px solid transparent", ...show(f, at(L, 5, i * 0.25)) }}>{t}</Tag>;
          })}
        </div>
        <Slider left="Formal" right="Conversational" v={0.8} f={f} st={at(L, 6)} />
        <Slider left="Short sentences" right="Detailed" v={0.35} f={f} st={at(L, 6, 0.5)} />
        <Panel style={{ marginTop: 26, padding: "16px 20px", fontSize: 25, color: C.mut, lineHeight: 1.35, ...show(f, at(L, 6, 0.7)) }}>
          Example: "Dekhiye, ye setting yahan milti hai. Ek click, aur ho gaya."
        </Panel>
      </Panel>
      <Panel glow={merge * 0.6} style={{ ...col(2), ...show(f, at(L, 7)) }}>
        <div style={{ fontSize: 24, letterSpacing: 3, color: C.lav, fontWeight: 800 }}>BUILD YOUR CONTENT WORKFLOW</div>
        {["Research", "Scriptwriting", "Title generation", "Analytics analysis"].map((t, i) => (
          <Check key={t} label={t} on={prog(f, at(L, 8, 0.1 + i * 0.2), 6)} style={{ marginTop: 28, ...show(f, at(L, 7, 0.4)) }} />
        ))}
      </Panel>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", ...show(f, at(L, 9, 0.3)) }}>
        <Tag style={{ fontSize: 30, padding: "12px 30px" }}>= YOUR CHANNEL PROFILE · a more useful creative partner</Tag>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 6: reference files + analytics export ----------------
const ROWS = [
  ["How to edit videos on mobile", "12.4K", "98K", "6.1%"],
  ["Best free apps for creators", "8.9K", "120K", "3.2%"],
  ["Channel banner size guide", "5.1K", "41K", "7.4%"],
  ["Shorts vs long videos", "3.7K", "77K", "2.9%"],
];
export const S06: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const studio = prog(f, at(L, 4), 18);
  const table = prog(f, at(L, 7), 18);
  const privacy = prog(f, at(L, 8), 14);
  const done = prog(f, at(L, 9), 16);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 90, top: 46, display: "flex", gap: 14 }}>
        <Tag style={show(f, at(L, 0))}>ADD REFERENCE SCRIPTS</Tag>
        <Tag color="rgba(124,92,255,0.35)" style={show(f, at(L, 4))}>UPLOAD ANALYTICS CSV</Tag>
        <Tag color="rgba(255,77,106,0.6)" style={show(f, at(L, 8))}>REMOVE SENSITIVE DATA</Tag>
      </div>
      {/* Project files panel */}
      <Desk style={{ left: 60, top: 110, width: 1800, height: 770, opacity: 1 - studio * (1 - done) }} active="Projects" title="Claude AI · YouTube Content Assistant">
        <div style={{ padding: "34px 44px" }}>
          <div style={{ fontSize: 40, fontWeight: 900 }}>Project files</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, marginTop: 24 }}>
            {["best-video-1-script.txt", "best-video-2-script.txt", "best-video-3-script.txt"].map((n, i) => {
              const st = at(L, 2, 0.15 + i * 0.2);
              const up = prog(f, st + 6, 26);
              return (
                <Panel key={n} glow={up >= 1 ? 0.3 : 0} style={{ padding: "22px 24px", ...show(f, st) }}>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>📄 {n}</div>
                  <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 6, marginTop: 16, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${up * 100}%`, background: up >= 1 ? C.green : "linear-gradient(90deg,#7c5cff,#c4b5fd)" }} />
                  </div>
                  <div style={{ fontSize: 22, marginTop: 8, color: up >= 1 ? C.green : C.mut, fontWeight: 700 }}>{up >= 1 ? "✓ Added" : `Uploading ${Math.round(up * 100)}%`}</div>
                </Panel>
              );
            })}
          </div>
          <Panel style={{ marginTop: 26, padding: "22px 26px", fontSize: 28, ...show(f, at(L, 3)) }}>
            Claude learns: <b style={{ color: C.lav }}>writing patterns</b> · <b style={{ color: C.lav }}>explanations</b> · <b style={{ color: C.lav }}>content structure</b>
          </Panel>
          <div style={{ display: "flex", gap: 22, marginTop: 30, ...show(f, at(L, 9)) }}>
            {["Channel instructions", "Sample scripts", "Analytics data"].map((t, i) => (
              <Check key={t} label={t} on={prog(f, at(L, 9, 0.15 + i * 0.2), 6)} />
            ))}
          </div>
        </div>
      </Desk>
      {/* Studio-inspired analytics */}
      <Desk style={{ left: 60, top: 110, width: 1800, height: 770, opacity: studio * (1 - done) }} active="Analytics" title="Studio analytics (illustration)" items={["Dashboard", "Content", "Analytics", "Comments"]}>
        <div style={{ padding: "30px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 38, fontWeight: 900 }}>Channel analytics</div>
            <Sample />
            <div style={{ marginLeft: "auto", padding: "12px 22px", borderRadius: 14, fontSize: 26, fontWeight: 800, border: `2px solid ${f > at(L, 5, 0.4) ? C.violet : C.line}`, background: f > at(L, 5, 0.4) ? "rgba(124,92,255,0.3)" : "transparent" }}>Advanced mode</div>
            <div style={{ padding: "12px 22px", borderRadius: 14, fontSize: 26, fontWeight: 700, border: `2px solid ${C.line}` }}>{f > at(L, 5, 0.75) ? "Lifetime ▾" : "Last 28 days ▾"}</div>
            <div style={{ width: 58, height: 58, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, border: `2px solid ${f > at(L, 6, 0.3) ? C.violet : C.line}`, background: f > at(L, 6, 0.3) ? "rgba(124,92,255,0.3)" : "transparent" }}>⬇</div>
          </div>
          <Panel style={{ position: "absolute", right: 40, top: 110, width: 420, padding: "16px 20px", fontSize: 26, zIndex: 5, ...show(f, at(L, 6, 0.35)), opacity: prog(f, at(L, 6, 0.35), 10) * (1 - table) }}>
            <div style={{ color: C.mut, fontSize: 20 }}>Export current view</div>
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(124,92,255,0.3)", fontWeight: 800 }}>Comma-separated values (.csv)</div>
          </Panel>
          <div style={{ marginTop: 26, borderRadius: 18, overflow: "hidden", border: `2px solid ${C.line}`, opacity: 0.35 + 0.65 * table }}>
            <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr 1fr 1fr", background: "rgba(255,255,255,0.08)", fontSize: 24, fontWeight: 900, color: C.lav }}>
              {["Video title", "Views", "Impressions", "CTR"].map((h) => (
                <div key={h} style={{ padding: "14px 18px" }}>{h}</div>
              ))}
            </div>
            {ROWS.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr 1fr 1fr", borderTop: `1px solid ${C.line}`, fontSize: 25, ...show(f, at(L, 7, 0.1 + i * 0.12), 10) }}>
                {r.map((c, j) => (
                  <div key={j} style={{ padding: "14px 18px", fontWeight: j === 0 ? 700 : 600 }}>{c}</div>
                ))}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr 1fr 1fr", borderTop: `1px solid ${C.line}`, fontSize: 25, opacity: table }}>
              <div style={{ padding: "14px 18px", fontWeight: 700, color: privacy > 0.5 ? C.mut : C.white, textDecoration: privacy > 0.5 ? "line-through" : "none" }}>Private note: personal contact info</div>
              <div style={{ padding: "14px 18px", gridColumn: "span 3", color: C.red, fontWeight: 800, opacity: privacy }}>🛡 Remove before upload</div>
            </div>
          </div>
        </div>
      </Desk>
      <Pointer f={f} path={[[at(L, 5), 1500, 820], [at(L, 5, 0.35), 1350, 205], [at(L, 5, 0.6), 1350, 205], [at(L, 5, 0.7), 1580, 205], [at(L, 6, 0.2), 1730, 205], [at(L, 6, 0.6), 1600, 265], [at(L, 6, 0.95), 1600, 265]]} clicks={[at(L, 5, 0.38), at(L, 5, 0.72), at(L, 6, 0.25), at(L, 6, 0.65)]} hideAt={at(L, 7)} />
    </AbsoluteFill>
  );
};

// ---------------- Scene 7: ideas → outline → script ----------------
const IDEAS = [
  "Mobile se YouTube Shorts kaise banaye",
  "Free video editing apps: honest comparison",
  "Pehli 1000 subscribers ki planning",
  "Thumbnail mein 5 common galtiyan",
  "Channel analytics beginners ke liye",
];
const ASK1 = "Mere channel ki audience aur pichhle video topics ke aadhaar par 5 naye video ideas suggest karo.";
const ASK2 = "Is idea ke liye ek engaging introduction aur detailed script outline banao.";
export const S07: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const phase2 = prog(f, at(L, 7), 16);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 90, top: 46, display: "flex", gap: 14 }}>
        <Tag style={show(f, at(L, 0))}>IDEAS → OUTLINE → SCRIPT</Tag>
        <Tag color="rgba(255,77,106,0.6)" style={show(f, at(L, 5))}>REVIEW BEFORE PUBLISHING</Tag>
      </div>
      <Desk style={{ left: 60, top: 110, width: 1800, height: 770 }} active="Projects" title="Claude AI · YouTube Content Assistant · New chat">
        <div style={{ padding: "28px 40px" }}>
          <div style={{ opacity: 1 - phase2 }}>
            <Bubble me style={{ fontSize: 30, ...show(f, at(L, 2)) }}>
              {typed(ASK1, f, at(L, 2, 0.02), 34)}
              {caret(f, f < at(L, 3))}
            </Bubble>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, ...show(f, at(L, 3)) }}>
              <Orb size={58} glow={f < at(L, 3, 0.4) ? 1 : 0.4} />
              <div style={{ fontSize: 26, color: C.mut }}>{f < at(L, 3, 0.4) ? `Using project context${".".repeat(1 + (Math.floor(f / 8) % 3))}` : "Ideas based on your project context:"}</div>
              <Sample style={{ marginLeft: "auto" }} text="Example output" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 18 }}>
              {IDEAS.map((t, i) => (
                <Panel key={t} style={{ padding: "18px 20px", fontSize: 27, fontWeight: 800, ...show(f, at(L, 3, 0.4 + i * 0.1), 20) }}>
                  <span style={{ color: C.lav }}>{i + 1}.</span> {t}
                </Panel>
              ))}
              <Panel style={{ padding: "16px 20px", fontSize: 23, ...show(f, at(L, 6)) }}>
                {["Audience demand", "Search interest", "Channel goals"].map((m, i) => (
                  <div key={m} style={{ marginBottom: 8 }}>
                    <div style={{ color: C.mut }}>{m}</div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${[70, 55, 85][i] * prog(f, at(L, 6, 0.2 + i * 0.2), 20)}%`, background: C.violet, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </Panel>
            </div>
            <div style={{ marginTop: 16, fontSize: 26, color: C.red, fontWeight: 800, ...show(f, at(L, 5)) }}>⚠ AI ideas are not automatically trending or guaranteed. Evaluate them first.</div>
          </div>
          <div style={{ position: "absolute", inset: "28px 40px", opacity: phase2 }}>
            <Panel glow={0.5} style={{ padding: "14px 20px", fontSize: 28, fontWeight: 800, width: "fit-content" }}>✓ Selected: {IDEAS[0]}</Panel>
            <Bubble me style={{ fontSize: 30, marginTop: 16 }}>
              {typed(ASK2, f, at(L, 7, 0.1), 34)}
            </Bubble>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 20 }}>
              {[
                ["HOOK", "Sawal + problem, 20 sec"],
                ["MAIN CONTENT", "3 steps, real screen, examples"],
                ["CONCLUSION", "Recap + next video"],
              ].map(([h, d], i) => (
                <Panel key={h} style={{ padding: "22px 24px", ...show(f, at(L, 7, 0.55 + i * 0.12)) }}>
                  <div style={{ fontSize: 24, letterSpacing: 3, color: C.lav, fontWeight: 900 }}>{h}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{d}</div>
                </Panel>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
              {["+ Add examples", "Simpler language", "More engaging"].map((t, i) => (
                <Tag key={t} color="rgba(124,92,255,0.35)" style={{ fontSize: 26, ...show(f, at(L, 8, 0.15 + i * 0.25)) }}>{t}</Tag>
              ))}
            </div>
            <div style={{ marginTop: 22, fontSize: 30, fontWeight: 900, color: C.green, ...show(f, at(L, 9)) }}>Claude = useful research & planning assistant</div>
          </div>
        </div>
      </Desk>
      <Pointer f={f} path={[[at(L, 7, 0.0), 1400, 820], [at(L, 7, 0.08), 700, 330], [at(L, 8), 700, 330]]} clicks={[at(L, 7, 0.09)]} hideAt={at(L, 7, 0.3)} />
    </AbsoluteFill>
  );
};

// ---------------- Scene 8: understanding Skills ----------------
const SK = ["Title Writer", "Hook Writer", "Thumbnail Ideas", "Analytics Report", "Script Review", "Channel Analysis"];
export const S08: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <Heading kicker="CLAUDE SKILLS" title="REUSABLE AI WORKFLOWS" f={f} />
      <Panel style={{ position: "absolute", left: 90, top: 220, width: 760, padding: "26px 30px", ...show(f, at(L, 1)) }}>
        <div style={{ fontSize: 24, color: C.lav, fontWeight: 800, letterSpacing: 3 }}>SKILL =</div>
        <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, lineHeight: 1.35 }}>Reusable instructions + resources for one task, done the same way every time</div>
      </Panel>
      <Panel style={{ position: "absolute", left: 90, top: 450, width: 760, padding: "22px 30px", ...show(f, at(L, 3)) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, fontSize: 24, color: C.mut, textDecoration: f > at(L, 3, 0.5) ? "line-through" : "none" }}>Long prompt, written again every week…</div>
          <div style={{ fontSize: 40, color: C.lav }}>→</div>
          <div style={{ flex: 1, fontSize: 28, fontWeight: 900, ...show(f, at(L, 3, 0.5)) }}>Structured workflow</div>
        </div>
      </Panel>
      <Panel style={{ position: "absolute", left: 90, top: 600, width: 760, padding: "22px 30px", ...show(f, at(L, 4)) }}>
        <div style={{ fontSize: 24, color: C.lav, fontWeight: 800, letterSpacing: 3 }}>A GOOD TITLE BALANCES</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          {["Clarity", "Curiosity", "Accuracy", "Audience relevance"].map((t, i) => (
            <div key={t} style={{ fontSize: 26, fontWeight: 700 }}>
              {t}
              <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 6 }}>
                <div style={{ height: "100%", width: `${80 * prog(f, at(L, 4, 0.2 + i * 0.15), 18)}%`, background: C.violet, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 920, top: 220, width: 910, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {SK.map((s, i) => {
          const st = i < 4 ? at(L, 2, 0.1 + i * 0.2) : at(L, 5, 0.3 + (i - 4) * 0.3);
          const on = prog(f, st + 10, 12);
          return (
            <Panel key={s} glow={on * 0.7} style={{ padding: "24px 26px", height: 150, ...show(f, st) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 52, height: 52, borderRadius: 14, background: `rgba(124,92,255,${0.25 + 0.5 * on})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✦</span>
                <span style={{ fontSize: 30, fontWeight: 900 }}>{s}</span>
              </div>
              <div style={{ fontSize: 22, color: C.mut, marginTop: 14 }}>SKILL.md · instructions · examples</div>
            </Panel>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 920, top: 760, width: 910, ...show(f, at(L, 6)) }}>
        <Tag color="rgba(255,212,0,0.25)" style={{ fontSize: 24, color: "#ffe680", border: "1px solid #ffd400" }}>ⓘ Availability depends on your Claude product, plan and environment</Tag>
      </div>
      <div style={{ position: "absolute", left: 920, top: 830, ...show(f, at(L, 7)) }}>
        <Tag style={{ fontSize: 26 }}>📁 Organize skills in your creator workflow</Tag>
      </div>
    </AbsoluteFill>
  );
};
