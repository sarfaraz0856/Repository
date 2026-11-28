import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../../theme";
import { FF } from "../fonts";
import { prog } from "../../components/anim";
import { at, Bubble, Desk, fadeScene, Heading, Orb, Panel, Pointer, SceneProps, show, Tag, typed, caret, YT } from "../kit";

// ---------------- Scene 1: cinematic intro ----------------
const STAGES = ["TOPIC", "RESEARCH", "SCRIPT", "TITLE + THUMBNAIL", "PUBLISH", "ANALYTICS"];
export const S01: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const merge = prog(f, at(L, 2, 0.35), 40);
  const titleOn = at(L, 4);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 860, top: 70, ...show(f, 6), opacity: prog(f, 6, 16) * (1 - prog(f, titleOn - 10, 14) * 0.6) }}>
        <YT size={200} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {STAGES.map((_, i) => {
          const x = 160 + i * 290 + 125, y = 330;
          const p = merge;
          return <line key={i} x1={x} y1={y + 60} x2={x + (960 - x) * p} y2={y + 60 + (620 - y - 60) * p} stroke="#9b7bff" strokeWidth={3} opacity={0.75 * prog(f, at(L, 2, 0.3), 10) * (1 - prog(f, titleOn - 10, 14))} />;
        })}
      </svg>
      {STAGES.map((s, i) => {
        const st = at(L, 1, 0.08 + i * 0.14);
        const lift = prog(f, titleOn - 10, 16);
        return (
          <Panel key={s} glow={merge * 0.6} style={{ position: "absolute", left: 160 + i * 290, top: 330 - lift * 40, width: 250, height: 120, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 28, fontWeight: 900, padding: 12, ...show(f, st), opacity: prog(f, st, 16) * (1 - lift) }}>
            <div>
              <div style={{ fontSize: 20, color: C.lav, letterSpacing: 2 }}>0{i + 1}</div>
              {s}
            </div>
          </Panel>
        );
      })}
      <div style={{ position: "absolute", left: 960 - 90, top: 560, ...show(f, at(L, 2, 0.3)), opacity: prog(f, at(L, 2, 0.3), 16) * (1 - prog(f, titleOn - 10, 14)) }}>
        <Orb size={180} glow={0.6 + 0.4 * Math.sin(f / 14)} />
        <div style={{ textAlign: "center", fontSize: 30, fontWeight: 900, marginTop: 8, ...show(f, at(L, 3)) }}>Claude AI</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: prog(f, titleOn, 20) * (1 - prog(f, at(L, 5, 0.1), 14) * 0.35) }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: C.lav }}>BUILD YOUR PERSONAL AI CONTENT ASSISTANT</div>
        <div style={{ fontSize: 112, fontWeight: 900, letterSpacing: -3, marginTop: 14, lineHeight: 1.02 }}>
          CLAUDE AI
          <br />
          <span style={{ background: "linear-gradient(90deg,#c4b5fd,#7c5cff)", WebkitBackgroundClip: "text", color: "transparent" }}>FOR YOUTUBE CREATORS</span>
        </div>
        <div style={{ height: 6, width: interpolate(prog(f, titleOn + 20, 30), [0, 1], [0, 900]), margin: "22px auto 0", borderRadius: 3, background: "linear-gradient(90deg,#7c5cff,#c4b5fd)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", padding: "0 160px" }}>
        {["Projects", "Instructions", "Reference Files", "Skills", "Video Ideas", "Thumbnails", "Analytics"].map((t, i) => (
          <Tag key={t} color="rgba(124,92,255,0.35)" style={{ fontSize: 28, ...show(f, at(L, 5, 0.05 + i * 0.11), 20) }}>{t}</Tag>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center", gap: 24, ...show(f, at(L, 6, 0.4)) }}>
        <Tag color="rgba(255,255,255,0.12)">THEORY</Tag>
        <Tag color={C.purple}>+ PRACTICAL EXAMPLES</Tag>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 2: what is Claude ----------------
const CAPS = ["Writing", "Understanding information", "Document analysis", "Creative help"];
const CTX = [
  { k: "NICHE", v: "Technology" },
  { k: "LANGUAGE", v: "Hindi-Hinglish" },
  { k: "AUDIENCE", v: "Beginners" },
  { k: "VIDEO STYLE", v: "Easy examples" },
];
export const S02: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const fly = (i: number) => prog(f, at(L, 6, 0.1 + i * 0.12), 22);
  const meter = prog(f, at(L, 6, 0.2), 60);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <Heading kicker="BASICS" title="WHAT IS CLAUDE AI?" f={f} />
      <Desk style={{ left: 90, top: 210, width: 1060, height: 650, ...show(f, at(L, 1)) }} active="New chat">
        <div style={{ padding: "40px 46px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Orb size={86} />
            <div>
              <div style={{ fontSize: 40, fontWeight: 900 }}>Claude</div>
              <div style={{ fontSize: 24, color: C.mut }}>AI assistant · developed by Anthropic</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 34 }}>
            {CAPS.map((c, i) => (
              <Panel key={c} style={{ padding: "20px 22px", fontSize: 28, fontWeight: 800, ...show(f, at(L, 2, 0.1 + i * 0.2)) }}>✦ {c}</Panel>
            ))}
          </div>
          <div style={{ position: "absolute", left: 46, right: 46, bottom: 34, height: 86, border: `2px solid ${C.line}`, borderRadius: 20, background: "rgba(14,13,19,0.55)", fontSize: 28, padding: "24px 24px", color: C.mut }}>
            Context: {CTX.filter((_, i) => fly(i) > 0.95).map((c) => c.v).join(" · ") || "…"}
          </div>
        </div>
      </Desk>
      <div style={{ position: "absolute", left: 1210, top: 220, width: 620, ...show(f, at(L, 3)) }}>
        <Panel style={{ padding: "26px 30px", opacity: 1 - prog(f, at(L, 4, 0.1), 14) * 0.5 }}>
          <div style={{ fontSize: 26, color: C.mut }}>Biggest benefit?</div>
          <div style={{ fontSize: 36, fontWeight: 900, textDecoration: prog(f, at(L, 4), 10) > 0.5 ? "line-through" : "none", color: prog(f, at(L, 4), 10) > 0.5 ? C.mut : C.white }}>Just writing scripts</div>
        </Panel>
        <Panel glow={prog(f, at(L, 4, 0.3), 16)} style={{ padding: "26px 30px", marginTop: 20, ...show(f, at(L, 4, 0.3)) }}>
          <div style={{ fontSize: 26, color: C.lav, fontWeight: 800 }}>Real benefit</div>
          <div style={{ fontSize: 44, fontWeight: 900 }}>Right CONTEXT</div>
        </Panel>
      </div>
      {CTX.map((c, i) => {
        const p = fly(i);
        const x0 = 1220 + (i % 2) * 310, y0 = 560 + Math.floor(i / 2) * 120;
        return (
          <Panel key={c.k} style={{ position: "absolute", left: x0 + (520 - x0) * p, top: y0 + (790 - y0) * p, width: 290, padding: "14px 18px", scale: String(1 - 0.5 * p), opacity: prog(f, at(L, 5, 0.1 + i * 0.18), 14) * (1 - prog(f, at(L, 6, 0.1 + i * 0.12) + 18, 6)) }}>
            <div style={{ fontSize: 18, letterSpacing: 2, color: C.lav, fontWeight: 800 }}>{c.k}</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{c.v}</div>
          </Panel>
        );
      })}
      <div style={{ position: "absolute", left: 1210, top: 800, width: 620, ...show(f, at(L, 6, 0.6)) }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2 }}>CONTEXT = BETTER RELEVANCE</div>
        <div style={{ height: 16, background: "rgba(255,255,255,0.08)", borderRadius: 8, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${20 + 75 * meter}%`, height: "100%", background: "linear-gradient(90deg,#7c5cff,#c4b5fd)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 1210, top: 560, width: 620, ...show(f, at(L, 7)) }}>
        <Panel glow={0.8} style={{ padding: "26px 30px", fontSize: 34, fontWeight: 900, textAlign: "center" }}>Step 1: Teach AI about your channel</Panel>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 3: why Projects ----------------
const REPEAT = ["My niche is technology…", "My audience is beginners…", "Write in Hindi-Hinglish…", "Video length 10 minutes…", "My writing style is…"];
export const S03: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const right = prog(f, at(L, 3), 20);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <Heading kicker="CLAUDE PROJECTS" title="ONE WORKSPACE. REUSABLE CONTEXT." f={f} />
      <Panel style={{ position: "absolute", left: 90, top: 220, width: 820, height: 640, padding: "28px 32px", ...show(f, at(L, 0)) }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 900 }}>Without a Project</div>
          <Tag color="rgba(255,77,106,0.35)" style={{ marginLeft: "auto", fontSize: 22 }}>REPEAT EVERY CHAT</Tag>
        </div>
        {[0, 1].map((chat) => (
          <div key={chat} style={{ marginTop: 22, ...show(f, at(L, 1 + chat, 0.05)) }}>
            <div style={{ fontSize: 22, color: C.mut, marginBottom: 8 }}>Chat {chat + 1}</div>
            <Bubble me style={{ marginLeft: 0, fontSize: 24, padding: "14px 20px" }}>
              {REPEAT.filter((_, i) => f > at(L, 1 + chat, 0.1 + i * 0.15)).join(" ")}
            </Bubble>
          </div>
        ))}
        <div style={{ position: "absolute", left: 32, bottom: 26, fontSize: 26, color: C.red, fontWeight: 800, ...show(f, at(L, 2, 0.5)) }}>⏱ Time-consuming · same instructions again</div>
      </Panel>
      <Panel glow={right * 0.7} style={{ position: "absolute", left: 1000, top: 220, width: 830, height: 640, padding: "28px 32px", ...show(f, at(L, 3)) }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 900 }}>With a Project</div>
          <Tag style={{ marginLeft: "auto", fontSize: 22 }}>WHERE AVAILABLE</Tag>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 24, ...show(f, at(L, 4)) }}>
          <Panel style={{ flex: 1, padding: 18, fontSize: 26, fontWeight: 800 }}>📝 Instructions</Panel>
          <Panel style={{ flex: 1, padding: 18, fontSize: 26, fontWeight: 800 }}>📂 Reference files</Panel>
        </div>
        <div style={{ fontSize: 24, color: C.lav, marginTop: 24, fontWeight: 800, ...show(f, at(L, 5)) }}>📁 YouTube Channel Project</div>
        {["Video ideas", "Script draft", "Title options"].map((c, i) => (
          <div key={c} style={{ marginTop: 14, ...show(f, at(L, 6, 0.1 + i * 0.25)) }}>
            <Panel style={{ padding: "14px 20px", fontSize: 26, display: "flex" }}>
              💬 {c} <span style={{ marginLeft: "auto", color: C.green, fontWeight: 800 }}>✓ context loaded</span>
            </Panel>
          </div>
        ))}
        <div style={{ position: "absolute", left: 32, bottom: 26, fontSize: 26, color: C.green, fontWeight: 800, ...show(f, at(L, 7)) }}>Less repetition · faster start</div>
      </Panel>
      <div style={{ position: "absolute", left: 0, right: 0, top: 870, textAlign: "center", ...show(f, at(L, 8)) }}>
        <Tag color="rgba(255,77,106,0.85)" style={{ fontSize: 28 }}>⚠ Always review AI output: it can still make mistakes</Tag>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Scene 4: create project ----------------
const FIELDS = [
  ["CHANNEL NAME", "Your channel name"],
  ["NICHE", "Technology tutorials"],
  ["TARGET AUDIENCE", "Beginners"],
  ["LANGUAGE", "Hindi-Hinglish"],
  ["CONTENT STYLE", "Simple, step by step"],
  ["UPLOAD FREQUENCY", "2 videos / week"],
];
const NAME = "YouTube Content Assistant";
const PURPOSE = "Help me research, plan and create high-quality YouTube content for my audience.";
const ROLE = "Tum mere YouTube content strategy assistant ho. Tumhara kaam: engaging scripts, better video ideas, compelling titles aur thumbnail concepts banane mein madad.";
export const S04: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const instr = prog(f, at(L, 5), 18);
  const clickNew = at(L, 1, 0.5);
  return (
    <AbsoluteFill style={{ opacity: fadeScene(f, dur), fontFamily: FF }}>
      <div style={{ position: "absolute", left: 90, top: 46, display: "flex", gap: 16 }}>
        <Tag style={{ ...show(f, at(L, 1)) }}>STEP 1: CREATE PROJECT</Tag>
        <Tag color="rgba(124,92,255,0.35)" style={{ ...show(f, at(L, 5)) }}>STEP 2: ADD INSTRUCTIONS</Tag>
      </div>
      <Desk style={{ left: 60, top: 110, width: 1800, height: 770 }} active={f > at(L, 1, 0.2) ? "Projects" : "New chat"}>
        <div style={{ padding: "34px 44px", opacity: 1 - instr }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 46, fontWeight: 900 }}>Projects</div>
            <div style={{ marginLeft: "auto", background: C.purple, padding: "16px 30px", borderRadius: 16, fontSize: 30, fontWeight: 800 }}>+ New project</div>
          </div>
          <Panel style={{ marginTop: 30, padding: "28px 34px", ...show(f, clickNew + 6) }}>
            <div style={{ fontSize: 24, color: C.mut }}>Project name</div>
            <div style={{ fontSize: 42, fontWeight: 900, marginTop: 8, minHeight: 56 }}>
              {typed(NAME, f, at(L, 2, 0.35), 22)}
              {caret(f, f > at(L, 2, 0.3) && f < at(L, 3))}
            </div>
            <div style={{ fontSize: 24, color: C.mut, marginTop: 24 }}>What are you trying to achieve?</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, minHeight: 90, lineHeight: 1.35 }}>
              {typed(PURPOSE, f, at(L, 4, 0.05), 40)}
              {caret(f, f > at(L, 3, 0.5) && f < at(L, 5))}
            </div>
            <div style={{ marginTop: 18, display: "inline-block", background: C.purple, padding: "12px 30px", borderRadius: 14, fontSize: 28, fontWeight: 800, ...show(f, at(L, 4, 0.85)) }}>Create project</div>
          </Panel>
        </div>
        <div style={{ position: "absolute", inset: 0, padding: "30px 40px", opacity: instr }}>
          <div style={{ fontSize: 40, fontWeight: 900 }}>Project instructions</div>
          <Panel style={{ marginTop: 18, padding: "20px 26px", fontSize: 29, lineHeight: 1.4, minHeight: 150 }}>
            <span style={{ color: C.lav, fontWeight: 800 }}>Role: </span>
            {typed(ROLE, f, at(L, 7, 0.02), 34)}
            {caret(f, f > at(L, 6) && f < at(L, 8))}
          </Panel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 20 }}>
            {FIELDS.map(([k, v], i) => {
              const st = at(L, 8, 0.05 + i * 0.13);
              return (
                <div key={k} style={show(f, st, 20)}>
                  <div style={{ fontSize: 21, letterSpacing: 2, color: C.lav, fontWeight: 800 }}>{k}</div>
                  <div style={{ marginTop: 6, fontSize: 28, fontWeight: 700, background: "rgba(14,13,19,0.55)", border: `2px solid ${C.line}`, borderRadius: 14, padding: "12px 16px" }}>{typed(v, f, st + 6, 30)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 22, fontSize: 28, fontWeight: 800, color: C.green, ...show(f, at(L, 9, 0.2)) }}>✓ Clear context → Claude understands your goals better</div>
        </div>
      </Desk>
      <Pointer f={f} path={[[at(L, 1), 1500, 800], [at(L, 1, 0.3), 260, 330], [at(L, 1, 0.45), 260, 330], [clickNew - 4, 1660, 220], [at(L, 2), 1660, 220], [at(L, 2, 0.2), 900, 420]]} clicks={[at(L, 1, 0.32), clickNew]} hideAt={at(L, 2, 0.3)} />
    </AbsoluteFill>
  );
};
