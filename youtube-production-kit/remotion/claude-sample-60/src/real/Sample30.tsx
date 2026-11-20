// 30 s sample in the new "real Claude screen" style: Scene 4 (create a Project), synced to the
// recorded narration (audio/real_s30.wav = full mix from 176.7 s + cursor clicks and key ticks).
import React from "react";
import { AbsoluteFill, Composition, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import {
  Browser, Button, Composer, Cursor, DemoTag, IC, Input, K, Ring, SANS, SERIF, SIDE_W, Sidebar, Spark, StepChip,
  Caret, p01, sideItemY, sy, typed,
} from "./ui";

export const S30 = {
  DUR: 930,
  clicks: [118, 168, 210, 372, 688, 798],
  name: { txt: "YouTube Content Assistant", at: 222, cps: 14 },
  purpose: { txt: "Help me research, plan and create high-quality YouTube content for my audience.", at: 528, cps: 16 },
  role: {
    txt: "Role: Tum mere YouTube content strategy assistant ho. Tumhara kaam hai mujhe engaging scripts, better video ideas, compelling titles aur thumbnail concepts banane mein madad karna.",
    at: 830, cps: 20,
  },
};
const { name, purpose, role } = S30;

const Fade: React.FC<{ f: number; from: number; to?: number; children: React.ReactNode }> = ({ f, from, to = 1e9, children }) => {
  if (f < from || f >= to) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: p01(f, from, 6) }}>{children}</div>;
};
const Main: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: SIDE_W, right: 0, top: 0, bottom: 0 }}>{children}</div>
);
const X = (x: number) => x - SIDE_W; // screen x → main-area x

const Home: React.FC<{ f: number }> = ({ f }) => (
  <Main>
    <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Spark size={58} />
      <span style={{ fontFamily: SERIF, fontSize: 60, fontWeight: 400, color: "#2B2A26" }}>Good evening</span>
    </div>
    <Composer left={X(665)} top={330} width={920} f={f} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 530, display: "flex", justifyContent: "center", gap: 14 }}>
      {["Write", "Learn", "Code", "Life stuff", "Claude's choice"].map((c) => (
        <div key={c} style={{ border: `1px solid ${K.border}`, borderRadius: 12, padding: "10px 18px", fontSize: 19, color: "#3C3A35", background: K.page }}>{c}</div>
      ))}
    </div>
  </Main>
);

const PROJECTS = [
  ["Study notes", "Summaries and quiz questions for weekly topics", "Updated 2 days ago"],
  ["Trip planning", "Itineraries, budgets and packing lists", "Updated 5 days ago"],
  ["Newsletter drafts", "Monthly newsletter outlines and edits", "Updated 1 week ago"],
  ["Recipe ideas", "Quick dinners with what is in the fridge", "Updated 2 weeks ago"],
];
const Projects: React.FC<{ f: number }> = ({ f }) => (
  <Main>
    <div style={{ position: "absolute", left: X(470), top: 62, fontFamily: SERIF, fontSize: 48 }}>Projects</div>
    <Button x={X(1570)} y={66} w={210} h={58} pressed={f >= 168 && f < 172 ? 1 : 0}>+ New project</Button>
    <div style={{ position: "absolute", left: X(470), top: 160, width: 1310, height: 60, borderRadius: 12, border: `1px solid ${K.border}`, background: K.card, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", fontSize: 20, color: K.faint }}>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={K.faint} strokeWidth={1.8}><path d={IC.search} /></svg>
      Search projects...
    </div>
    <div style={{ position: "absolute", left: X(1580), top: 238, fontSize: 18, color: K.sub }}>Sort by <b style={{ color: K.text, fontWeight: 600 }}>Activity ⌄</b></div>
    {PROJECTS.map(([t, d, u], i) => (
      <div key={t} style={{ position: "absolute", left: X(470) + (i % 2) * 670, top: 290 + Math.floor(i / 2) * 190, width: 640, height: 164, borderRadius: 16, border: `1px solid ${K.border}`, background: K.card, padding: "24px 26px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 23, fontWeight: 600 }}>{t}</div>
        <div style={{ fontSize: 19, color: K.sub, marginTop: 8 }}>{d}</div>
        <div style={{ fontSize: 16, color: K.faint, marginTop: 22 }}>{u}</div>
      </div>
    ))}
  </Main>
);

const NewProject: React.FC<{ f: number }> = ({ f }) => {
  const nm = typed(name.txt, f, name.at, name.cps), pu = typed(purpose.txt, f, purpose.at, purpose.cps);
  return (
    <Main>
      <div style={{ position: "absolute", left: X(725), top: 100, fontFamily: SERIF, fontSize: 48 }}>Create a personal project</div>
      <div style={{ position: "absolute", left: X(725), top: 208, fontSize: 21, fontWeight: 600 }}>What are you working on?</div>
      <Input x={X(725)} y={250} w={800} h={66} value={nm} placeholder="Name your project" focus={f >= 210 && f < 372} f={f} />
      <div style={{ position: "absolute", left: X(725), top: 348, fontSize: 21, fontWeight: 600 }}>What are you trying to achieve?</div>
      <Input x={X(725)} y={390} w={800} h={200} value={pu} placeholder="Describe your project, goals, subject, etc..." focus={f >= 372 && f < 688} f={f} multiline />
      <Button x={X(1175)} y={630} w={125} dark={false}>Cancel</Button>
      <Button x={X(1315)} y={630} w={210} disabled={!nm} pressed={f >= 688 && f < 692 ? 1 : 0}>Create project</Button>
    </Main>
  );
};

const ProjectPage: React.FC<{ f: number }> = ({ f }) => (
  <Main>
    <div style={{ position: "absolute", left: X(400), top: 40, fontSize: 19, color: K.sub, display: "flex", alignItems: "center", gap: 6 }}>‹ All projects</div>
    <div style={{ position: "absolute", left: X(400), top: 82, fontFamily: SERIF, fontSize: 46, display: "flex", alignItems: "center", gap: 18 }}>
      {name.txt}
      <span style={{ fontFamily: SANS, fontSize: 16, color: K.sub, border: `1px solid ${K.border}`, borderRadius: 8, padding: "3px 10px" }}>Private</span>
    </div>
    <div style={{ position: "absolute", left: X(400), top: 152, width: 880, fontSize: 20, color: K.sub }}>{purpose.txt}</div>
    <Composer left={X(400)} top={232} width={880} f={f} />
    <div style={{ position: "absolute", left: X(400), top: 420, width: 880, textAlign: "center", fontSize: 19, color: K.faint }}>
      Start a chat to keep conversations organized and re-use project knowledge.
    </div>
    <div style={{ position: "absolute", left: X(1360), top: 30, width: 520, height: 860, borderRadius: 18, border: `1px solid ${K.border}`, background: K.side }}>
      <div style={{ position: "absolute", left: 24, top: 24, fontSize: 23, fontWeight: 600 }}>Project knowledge</div>
      <div style={{ position: "absolute", left: 24, top: 90, width: 472, height: 110, boxSizing: "border-box", borderRadius: 14, border: `1px solid ${K.border}`, background: f >= 790 && f < 805 ? K.hover : K.card, padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, fontWeight: 600 }}>
          Set project instructions
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={K.sub} strokeWidth={1.8}><path d={IC.pencil} /></svg>
        </div>
        <div style={{ fontSize: 17, color: K.sub, marginTop: 8 }}>Optional · tailor Claude's responses</div>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 236, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, fontWeight: 600 }}>
        Files
        <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${K.border}`, background: K.card, display: "grid", placeItems: "center", fontSize: 24, color: K.sub }}>+</div>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 300, height: 220, borderRadius: 14, border: `1.5px dashed #D3CFC2`, display: "grid", placeItems: "center", textAlign: "center", padding: 26, boxSizing: "border-box", fontSize: 18, color: K.sub, lineHeight: 1.5 }}>
        No knowledge added yet. Add PDFs, documents, or other text that Claude will reference in every project conversation.
      </div>
    </div>
  </Main>
);

const InstructionsModal: React.FC<{ f: number }> = ({ f }) => {
  const o = p01(f, 804, 8);
  const txt = typed(role.txt, f, role.at, role.cps);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(20,18,14,${0.38 * o})` }} />
      <div style={{ position: "absolute", left: 470, top: 230, width: 980, height: 620, borderRadius: 20, background: K.card, boxShadow: "0 30px 80px rgba(0,0,0,0.25)", opacity: o, transform: `translateY(${(1 - o) * 16}px)`, fontFamily: SANS, color: K.text }}>
        <div style={{ position: "absolute", left: 36, top: 30, fontFamily: SERIF, fontSize: 36 }}>Set project instructions</div>
        <div style={{ position: "absolute", left: 36, right: 36, top: 90, fontSize: 19, color: K.sub, lineHeight: 1.45 }}>
          Provide Claude with relevant instructions and information for chats within {name.txt}. This will work alongside your preferences and the selected style in a chat.
        </div>
        <div style={{ position: "absolute", left: 36, right: 36, top: 180, height: 300, boxSizing: "border-box", borderRadius: 12, border: "2px solid #8FB4E8", boxShadow: "0 0 0 4px rgba(120,160,230,0.18)", padding: "18px 20px", fontSize: 22, lineHeight: 1.5 }}>
          {txt ? txt : <span style={{ color: K.faint }}>Think step by step and explain your reasoning...</span>}
          <Caret f={f} on={f >= 812} />
        </div>
        <Button x={980 - 36 - 250 - 140} y={520} w={125} dark={false}>Cancel</Button>
        <Button x={980 - 36 - 250} y={520} w={250} disabled={!txt}>Save instructions</Button>
      </div>
    </>
  );
};

export const Sample30: React.FC = () => {
  const f = useCurrentFrame();
  const projY = sy(sideItemY(2) + 24);
  const path: [number, number, number][] = [
    [0, 1310, 760], [86, 1300, 740], [114, 160, projY], [130, 160, projY],
    [160, 1675, sy(95)], [176, 1675, sy(95)], [204, 900, sy(283)], [300, 940, sy(300)],
    [362, 900, sy(440)], [520, 1000, sy(470)], [676, 1300, sy(540)], [686, 1420, sy(658)],
    [720, 1420, sy(658)], [790, 1640, sy(175)], [860, 1640, sy(175)], [880, 1500, 760],
  ];
  const fadeOut = 1 - p01(f, S30.DUR - 14, 14);
  return (
    <AbsoluteFill style={{ background: K.page, opacity: Math.min(p01(f, 0, 8), fadeOut) }}>
      <Browser url={f < 118 ? "claude.ai/new" : f < 168 ? "claude.ai/projects" : f < 688 ? "claude.ai/projects/create" : "claude.ai/project/youtube-content-assistant"}>
        <Sidebar active={f >= 118 ? "Projects" : undefined} hover={f >= 104 && f < 118 ? "Projects" : undefined} />
        <Fade f={f} from={0} to={118}><Home f={f} /></Fade>
        <Fade f={f} from={118} to={172}><Projects f={f} /></Fade>
        <Fade f={f} from={172} to={692}><NewProject f={f} /></Fade>
        <Fade f={f} from={692}><ProjectPage f={f} /></Fade>
      </Browser>
      <Ring x={14} y={sy(sideItemY(2))} w={SIDE_W - 28} h={48} f={f} from={84} to={124} r={10} />
      <Ring x={1570} y={sy(66)} w={210} h={58} f={f} from={134} to={174} r={12} />
      <Ring x={1384} y={sy(120)} w={472} h={110} f={f} from={716} to={800} r={14} />
      {f >= 798 ? <InstructionsModal f={f} /> : null}
      <StepChip
        f={f}
        steps={[
          { from: 24, to: 300, n: 1, text: "Projects  →  New project" },
          { from: 300, to: 692, n: 2, text: "Project ka naam + purpose likho" },
          { from: 700, to: S30.DUR + 20, n: 3, text: "Project Instructions set karo" },
        ]}
      />
      <Cursor f={f} path={path} clicks={S30.clicks} />
      <DemoTag />
      <Audio src={staticFile("audio/real_s30.wav")} />
    </AbsoluteFill>
  );
};

export const Sample30Composition: React.FC = () => (
  <Composition id="ClaudeRealSample30" component={Sample30} durationInFrames={S30.DUR} fps={30} width={1920} height={1080} />
);
