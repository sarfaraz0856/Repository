import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../../theme";
import { FF } from "../fonts";
import { prog } from "../../components/anim";
import { at, Check, Desk, fadeScene, Orb, Panel, Pointer, Sample, SceneProps, show, Tag, typed, caret } from "../kit";

// ---------------- Scene 9: analytics report card ----------------
const PTS = [22, 30, 26, 41, 38, 52, 47, 60, 56, 71, 66, 80];
const VID = [
  ["Mobile video editing guide", "98K", "6.1%", "+310"],
  ["Free apps for creators", "120K", "3.2%", "+95"],
  ["Banner size guide", "41K", "7.4%", "+140"],
];
export const S09: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const draw = prog(f, at(L, 1), 50);
  const report = prog(f, at(L, 6), 18);
  const path = PTS.map((v, i) => `${i === 0 ? "M" : "L"} ${40 + i * 62} ${250 - v * 2.6}`).join(" ");
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 90, top: 46, display: "flex", gap: 14 }}>
        <Tag style={show(f, at(L, 0))}>ANALYZE PERFORMANCE</Tag>
        <Tag color="rgba(124,92,255,0.35)" style={show(f, at(L, 3))}>IDENTIFY OPPORTUNITIES</Tag>
        <Tag color="rgba(124,92,255,0.35)" style={show(f, at(L, 7))}>IMPROVE YOUR CONTENT STRATEGY</Tag>
      </div>
      <div style={{ opacity: 1 - report * 0.85 }}>
        <div style={{ position: "absolute", left: 90, top: 120, display: "flex", gap: 18 }}>
          {[
            ["VIEWS", "48.2K"],
            ["IMPRESSIONS", "412K"],
            ["CTR", "4.6%"],
            ["WATCH TIME", "3.1K h"],
            ["SUBSCRIBERS", "+620"],
          ].map(([k, v], i) => (
            <Panel key={k} glow={k === "CTR" && f > at(L, 3) ? 0.7 : 0} style={{ width: 330, padding: "18px 22px", ...show(f, at(L, 2, 0.1 + i * 0.15)) }}>
              <div style={{ fontSize: 20, letterSpacing: 2, color: C.lav, fontWeight: 800 }}>{k}</div>
              <div style={{ fontSize: 44, fontWeight: 900 }}>{v}</div>
            </Panel>
          ))}
        </div>
        <Panel style={{ position: "absolute", left: 90, top: 290, width: 820, height: 330, padding: "16px 20px", ...show(f, at(L, 1)) }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800 }}>Views over time</div>
            <Sample style={{ marginLeft: "auto" }} text="Fictional sample numbers" />
          </div>
          <svg width={780} height={270}>
            {[0, 1, 2, 3].map((g) => <line key={g} x1={30} x2={760} y1={40 + g * 60} y2={40 + g * 60} stroke="rgba(196,181,253,0.1)" />)}
            <path d={path} fill="none" stroke="#9b7bff" strokeWidth={5} strokeDasharray={1200} strokeDashoffset={1200 * (1 - draw)} strokeLinejoin="round" />
          </svg>
        </Panel>
        <Panel style={{ position: "absolute", left: 950, top: 290, width: 880, padding: "16px 20px", ...show(f, at(L, 2)) }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr .8fr .8fr", fontSize: 22, fontWeight: 900, color: C.lav }}>
            {["Video", "Impressions", "CTR", "Subs"].map((h) => <div key={h} style={{ padding: "8px 10px" }}>{h}</div>)}
          </div>
          {VID.map((r, i) => {
            const flag = i === 1 && f > at(L, 3, 0.3);
            const top = i === 0 && f > at(L, 5, 0.2);
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr .8fr .8fr", fontSize: 25, borderTop: `1px solid ${C.line}`, borderRadius: 10, background: flag ? "rgba(255,77,106,0.18)" : top ? "rgba(74,222,128,0.14)" : "transparent", outline: flag ? "2px solid #ff4d6a" : top ? "2px solid #4ade80" : "none" }}>
                {r.map((c, j) => <div key={j} style={{ padding: "14px 10px", fontWeight: j === 0 ? 700 : 600 }}>{c}</div>)}
              </div>
            );
          })}
          <div style={{ fontSize: 24, marginTop: 12, color: C.red, fontWeight: 800, ...show(f, at(L, 3, 0.5)) }}>High impressions + low CTR → review title & thumbnail</div>
          <div style={{ fontSize: 24, marginTop: 6, color: C.green, fontWeight: 800, ...show(f, at(L, 5, 0.3)) }}>Most subscribers → learn from this topic</div>
        </Panel>
        <Panel style={{ position: "absolute", left: 950, top: 610, width: 880, padding: "18px 22px", ...show(f, at(L, 4)) }}>
          <div style={{ fontSize: 22, letterSpacing: 2, color: C.lav, fontWeight: 800 }}>DON'T JUDGE ON CTR ALONE. ALSO CHECK</div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {["Topic", "Traffic source", "Audience", "Video age"].map((t, i) => <Tag key={t} color="rgba(255,255,255,0.1)" style={{ fontSize: 24, ...show(f, at(L, 4, 0.4 + i * 0.12)) }}>{t}</Tag>)}
          </div>
        </Panel>
      </div>
      <Panel glow={0.7} style={{ position: "absolute", left: 360, top: 140, width: 1200, height: 720, padding: "34px 40px", opacity: report, scale: String(0.94 + 0.06 * report) }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 46, fontWeight: 900 }}>📊 Channel Report Card</div>
          <Sample style={{ marginLeft: "auto" }} text="Example layout" />
        </div>
        {[
          ["Summary", "Views, impressions, CTR, watch time, subscribers"],
          ["Videos to fix", "Good impressions, low CTR: try new packaging"],
          ["Top converters", "Topics that brought the most subscribers"],
          ["Opportunities", "Topics viewers showed more interest in"],
          ["Next actions", "3 decisions for the next 4 videos"],
        ].map(([h, d], i) => (
          <div key={h} style={{ display: "flex", gap: 20, alignItems: "baseline", marginTop: 22, ...show(f, at(L, 6, 0.15 + i * 0.12), 16) }}>
            <div style={{ width: 280, fontSize: 30, fontWeight: 900, color: C.lav }}>{h}</div>
            <div style={{ fontSize: 30, fontWeight: 600 }}>{d}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 40, bottom: 30, fontSize: 32, fontWeight: 900, color: C.green, ...show(f, at(L, 7)) }}>Numbers → better decisions</div>
      </Panel>
    </AbsoluteFill>
  );
};

// ---------------- Scene 10: Title Writer ----------------
const TOPIC = "Mobile se YouTube channel kaise banaye";
const TITLES = [
  ["Mobile Se YouTube Channel Kaise Banaye (2026 Step by Step)", "Search"],
  ["Sirf Phone Se Channel Shuru Karo: Full Beginner Guide", "Benefit"],
  ["YouTube Channel Banane Se Pehle Ye 5 Galtiyan Mat Karna", "Curiosity"],
  ["10 Minute Mein Apna YouTube Channel Setup Karo", "Specific"],
  ["Mobile vs Laptop: Channel Banane Ka Sabse Aasaan Tarika", "Compare"],
  ["Free Mein YouTube Channel Kaise Banaye (Hindi)", "Search"],
];
export const S10: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const pick = f > at(L, 5, 0.6);
  const refined = f > at(L, 6, 0.8);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 90, top: 46, display: "flex", gap: 14 }}>
        <Tag style={show(f, at(L, 0))}>TITLE WRITER</Tag>
        <Tag color="rgba(124,92,255,0.35)" style={show(f, at(L, 5))}>GENERATE • COMPARE • REFINE</Tag>
      </div>
      <Desk style={{ left: 60, top: 110, width: 1800, height: 770 }} active="Projects" title="Claude AI · Title Writer workflow">
        <div style={{ padding: "26px 40px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", ...show(f, at(L, 2)) }}>
            <div style={{ fontSize: 26, color: C.mut }}>Topic</div>
            <div style={{ flex: 1, fontSize: 32, fontWeight: 800, background: "rgba(14,13,19,0.55)", border: `2px solid ${C.violet}`, borderRadius: 14, padding: "12px 18px" }}>
              {typed(TOPIC, f, at(L, 2, 0.2), 30)}
              {caret(f, f < at(L, 3))}
            </div>
            <Sample text="Example output" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
            {TITLES.map(([t, kind], i) => {
              const sel = pick && i === 0;
              const txt = sel && refined ? "Mobile Se YouTube Channel Kaise Banaye (Step by Step)" : t;
              return (
                <Panel key={i} glow={sel ? 0.9 : 0} style={{ padding: "16px 20px", ...show(f, at(L, 3, 0.1 + i * 0.12), 20), opacity: prog(f, at(L, 3, 0.1 + i * 0.12), 16) * (pick && !sel ? 0.5 : 1) }}>
                  <div style={{ fontSize: 27, fontWeight: 800, minHeight: 72, lineHeight: 1.3 }}>{txt}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
                    <Tag color="rgba(124,92,255,0.35)" style={{ fontSize: 20, padding: "4px 12px", ...show(f, at(L, 4, 0.1 + i * 0.12), 8) }}>{kind}</Tag>
                    {["Clarity", "Relevance"].map((m, j) => (
                      <div key={m} style={{ fontSize: 19, color: C.mut, display: "flex", alignItems: "center", gap: 6 }}>
                        {m}
                        <span style={{ width: 70, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, display: "inline-block" }}>
                          <span style={{ display: "block", height: "100%", width: `${[90, 70, 75, 80, 65, 85][i] - j * 8}%`, background: C.violet, borderRadius: 4, opacity: prog(f, at(L, 4, 0.5), 20) }} />
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            {["Make it shorter", "More natural", "Remove clickbait"].map((t, i) => <Tag key={t} color="rgba(124,92,255,0.35)" style={{ fontSize: 24, ...show(f, at(L, 6, 0.15 + i * 0.2)) }}>{t}</Tag>)}
            <Tag color="rgba(74,222,128,0.25)" style={{ fontSize: 24, color: C.green, ...show(f, at(L, 7)) }}>↻ test + feedback = consistent</Tag>
          </div>
        </div>
      </Desk>
      <div style={{ position: "absolute", left: 0, right: 0, top: 890, textAlign: "center", ...show(f, at(L, 8)) }}>
        <Tag color="rgba(255,77,106,0.85)" style={{ fontSize: 26 }}>AI scores or predictions ≠ guaranteed YouTube performance</Tag>
      </div>
      <Pointer f={f} path={[[at(L, 5, 0.2), 1500, 840], [at(L, 5, 0.55), 640, 330], [at(L, 6, 0.6), 640, 330]]} clicks={[at(L, 5, 0.58)]} hideAt={at(L, 7)} />
    </AbsoluteFill>
  );
};

// ---------------- Scene 11: hooks + thumbnails ----------------
const HOOKS = [
  ["QUESTION", "Kya aap bhi channel banane se pehle confuse ho?"],
  ["SURPRISING OBSERVATION", "Zyada tar naye channel ek hi galti karte hain."],
  ["PROBLEM → SOLUTION", "Views nahi aa rahe? Pehle ye ek setting check karo."],
  ["DIRECT EDUCATIONAL", "Aaj main aapko 5 steps mein poora setup dikhaunga."],
];
const Thumb: React.FC<{ bg: string; text: string; sub: string; layout: number }> = ({ bg, text, sub, layout }) => (
  <div style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 14, background: bg, position: "relative", overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)" }}>
    {layout === 0 && <div style={{ position: "absolute", right: 18, bottom: 0, width: 110, height: 150, borderRadius: "55px 55px 0 0", background: "rgba(255,255,255,0.85)" }} />}
    {layout === 1 && <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 6, background: "#fff" }} />}
    {layout === 2 && <div style={{ position: "absolute", right: 24, top: 30, width: 120, height: 120, borderRadius: 24, background: "#ff1f3d" }} />}
    {layout === 3 && <div style={{ position: "absolute", right: 20, top: 24, width: 150, height: 100, borderRadius: 10, background: "rgba(0,0,0,0.5)", border: "3px solid #ffd400" }} />}
    <div style={{ position: "absolute", left: 18, top: 18, fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 3px 10px rgba(0,0,0,0.6)", maxWidth: "62%" }}>{text}</div>
    <div style={{ position: "absolute", left: 18, bottom: 16, fontSize: 20, fontWeight: 900, background: "#ffd400", color: "#111", padding: "4px 10px", borderRadius: 8 }}>{sub}</div>
  </div>
);
export const S11: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const thumbs = prog(f, at(L, 5), 18);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 90, top: 46, display: "flex", gap: 14 }}>
        <Tag style={show(f, at(L, 2))}>INTRO HOOK GENERATOR</Tag>
        <Tag color="rgba(124,92,255,0.35)" style={show(f, at(L, 5))}>THUMBNAIL IDEATOR</Tag>
        <Tag color="rgba(124,92,255,0.35)" style={show(f, at(L, 0))}>CREATE BETTER FIRST IMPRESSIONS</Tag>
      </div>
      <div style={{ opacity: 1 - thumbs }}>
        <Panel style={{ position: "absolute", left: 90, top: 130, width: 1740, padding: "20px 28px", fontSize: 30, fontWeight: 800, ...show(f, at(L, 1)) }}>
          ⏱ First few seconds decide: <span style={{ color: C.lav }}>"Should I keep watching?"</span>
        </Panel>
        <div style={{ position: "absolute", left: 90, top: 260, width: 1740, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {HOOKS.map(([k, t], i) => {
            const chosen = i === 2 && f > at(L, 4, 0.5);
            return (
              <Panel key={k} glow={chosen ? 0.9 : 0} style={{ padding: "24px 28px", minHeight: 190, ...show(f, at(L, 3, 0.05 + i * 0.22), 24), opacity: prog(f, at(L, 3, 0.05 + i * 0.22), 16) * (f > at(L, 4, 0.5) && !chosen ? 0.55 : 1) }}>
                <div style={{ fontSize: 22, letterSpacing: 3, color: C.lav, fontWeight: 900 }}>{k} HOOK</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10, lineHeight: 1.3 }}>"{t}"</div>
                {chosen ? <div style={{ fontSize: 22, color: C.green, fontWeight: 800, marginTop: 8 }}>✓ Fits my channel style</div> : null}
              </Panel>
            );
          })}
        </div>
      </div>
      <div style={{ opacity: thumbs }}>
        <div style={{ position: "absolute", left: 90, top: 130, width: 1740, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 20 }}>
          {[
            { bg: "linear-gradient(135deg,#3b1d8f,#7c5cff)", text: "CHANNEL SETUP", sub: "SIRF MOBILE", layout: 0, c: "Face + bold text" },
            { bg: "linear-gradient(90deg,#20304f 50%,#5a1f3d 50%)", text: "BEFORE   AFTER", sub: "SAME PHONE", layout: 1, c: "Before / after split" },
            { bg: "linear-gradient(135deg,#111,#2b2b2b)", text: "5 GALTIYAN", sub: "MAT KARNA", layout: 2, c: "Single bold object" },
            { bg: "linear-gradient(135deg,#0f3a3a,#1b6b5d)", text: "YE SETTING", sub: "ON KARO", layout: 3, c: "Screenshot + highlight" },
          ].map((t, i) => (
            <div key={i} style={show(f, at(L, 6, 0.1 + i * 0.18), 24)}>
              <Thumb {...t} />
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 10, color: C.white }}>{t.c}</div>
            </div>
          ))}
        </div>
        <Panel style={{ position: "absolute", left: 90, top: 470, width: 1100, padding: "22px 28px", ...show(f, at(L, 7)) }}>
          <div style={{ fontSize: 22, letterSpacing: 3, color: C.lav, fontWeight: 900 }}>EACH CONCEPT INCLUDES</div>
          <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            {["Visual composition", "Background colors", "Main subject", "Short thumbnail text"].map((t, i) => <Tag key={t} color="rgba(255,255,255,0.1)" style={{ fontSize: 26, ...show(f, at(L, 7, 0.15 + i * 0.18)) }}>{t}</Tag>)}
          </div>
        </Panel>
        <Panel style={{ position: "absolute", left: 1230, top: 470, width: 600, padding: "22px 28px", ...show(f, at(L, 8)) }}>
          {["Readability", "Accuracy", "Visual clarity"].map((t, i) => <Check key={t} label={t} on={prog(f, at(L, 8, 0.2 + i * 0.2), 6)} style={{ marginBottom: 14 }} />)}
        </Panel>
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...show(f, at(L, 9, 0.3)) }}>
          <Tag style={{ fontSize: 30, padding: "12px 30px" }}>Final creative judgment = the creator</Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 12: complete workflow ----------------
const FLOW = ["PROJECT SETUP", "CHANNEL CONTEXT", "VIDEO RESEARCH", "SCRIPTWRITING", "TITLE GENERATION", "THUMBNAIL CONCEPT", "PUBLISH", "ANALYTICS"];
const FLOW_AT = [[1, 0.2], [2, 0.2], [3, 0.3], [4, 0.4], [5, 0.3], [6, 0.3], [7, 0.15], [7, 0.55]] as const;
export const S12: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const pos = FLOW.map((_, i) => {
    const a = (-90 + i * 45) * (Math.PI / 180);
    return [960 + Math.cos(a) * 640, 470 + Math.sin(a) * 280] as const;
  });
  const loop = prog(f, at(L, 8), 30);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", fontSize: 30, letterSpacing: 6, fontWeight: 900, color: C.lav, ...show(f, at(L, 0)) }}>YOUR COMPLETE AI CONTENT WORKFLOW</div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {pos.map((p, i) => {
          const q = pos[(i + 1) % pos.length];
          const st = at(L, FLOW_AT[i][0], FLOW_AT[i][1]);
          const pr = i === pos.length - 1 ? loop : prog(f, st + 10, 24);
          return <line key={i} x1={p[0]} y1={p[1]} x2={p[0] + (q[0] - p[0]) * pr} y2={p[1] + (q[1] - p[1]) * pr} stroke={i === pos.length - 1 ? "#4ade80" : "#9b7bff"} strokeWidth={4} opacity={0.85} />;
        })}
        {pos.map((p, i) => <line key={`r${i}`} x1={960} y1={470} x2={p[0]} y2={p[1]} stroke="rgba(196,181,253,0.18)" strokeWidth={2} strokeDasharray="8 10" strokeDashoffset={-f * 1.5} />)}
      </svg>
      {FLOW.map((s, i) => {
        const st = at(L, FLOW_AT[i][0], FLOW_AT[i][1]);
        const on = prog(f, st, 12);
        return (
          <Panel key={s} glow={on * 0.8} style={{ position: "absolute", left: pos[i][0] - 185, top: pos[i][1] - 46, width: 370, height: 92, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 27, fontWeight: 900, opacity: 0.35 + 0.65 * on }}>
            <span style={{ color: C.lav, marginRight: 10 }}>{i + 1}</span>
            {s}
          </Panel>
        );
      })}
      <Panel glow={0.7} style={{ position: "absolute", left: 960 - 200, top: 470 - 130, width: 400, height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...show(f, at(L, 0, 0.3)) }}>
        <Orb size={110} glow={0.6 + 0.4 * Math.sin(f / 14)} />
        <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>Claude AI</div>
        <div style={{ fontSize: 22, color: C.lav, marginTop: 4, textAlign: "center", ...show(f, at(L, 9, 0.2)) }}>assists · does not replace you</div>
      </Panel>
      <div style={{ position: "absolute", left: 1500, top: 830, ...show(f, at(L, 8)) }}>
        <Tag style={{ fontSize: 28 }}>= an organized system</Tag>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 13: conclusion ----------------
export const S13: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const end = at(L, 6);
  const out = 1 - prog(f, dur - 30, 30);
  const finale = prog(f, end, 20);
  return (
    <AbsoluteFill style={{ opacity: Math.min(prog(f, 0, 14), out), fontFamily: FF }}>
      <div style={{ opacity: 1 - finale }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontSize: 30, letterSpacing: 6, color: C.lav, fontWeight: 900, ...show(f, at(L, 0)) }}>RECAP: STRUCTURED CONTENT ASSISTANT</div>
        <div style={{ position: "absolute", left: 160, right: 160, top: 200, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 30 }}>
          {[
            ["📁", "PROJECTS", "Organize relevant context", 1],
            ["✦", "SKILLS", "Streamline repeated tasks", 2],
            ["📊", "ANALYTICS", "More informed decisions", 3],
          ].map(([i, t, d, k]) => (
            <Panel key={t as string} glow={0.5} style={{ padding: "34px 30px", textAlign: "center", ...show(f, at(L, k as number), 30) }}>
              <div style={{ fontSize: 64 }}>{i}</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 10 }}>{t}</div>
              <div style={{ fontSize: 28, color: C.mut, marginTop: 8 }}>{d}</div>
            </Panel>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", gap: 30 }}>
          {["Review content", "Verify facts", "Stay original"].map((t, i) => <Check key={t} label={t} on={prog(f, at(L, 4, 0.15 + i * 0.25), 6)} style={show(f, at(L, 4))} />)}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", gap: 24, ...show(f, at(L, 5)) }}>
          <Tag color="rgba(255,255,255,0.12)" style={{ fontSize: 34, padding: "14px 34px" }}>👍 LIKE</Tag>
          <Tag color="#e0002b" style={{ fontSize: 34, padding: "14px 40px", scale: String(1 + 0.06 * Math.sin(Math.max(0, f - at(L, 5, 0.5)) / 6) * prog(f, at(L, 5, 0.5), 10)) }}>SUBSCRIBE</Tag>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: finale }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Orb size={150} />
        </div>
        <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: -3, marginTop: 20 }}>
          CLAUDE AI <span style={{ background: "linear-gradient(90deg,#c4b5fd,#7c5cff)", WebkitBackgroundClip: "text", color: "transparent" }}>FOR YOUTUBE CREATORS</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 8, color: C.lav, marginTop: 18 }}>CREATE SMARTER. WORK BETTER.</div>
        <div style={{ height: 6, width: interpolate(prog(f, end + 20, 30), [0, 1], [0, 900]), margin: "26px auto 0", borderRadius: 3, background: "linear-gradient(90deg,#7c5cff,#c4b5fd)" }} />
      </div>
    </AbsoluteFill>
  );
};
