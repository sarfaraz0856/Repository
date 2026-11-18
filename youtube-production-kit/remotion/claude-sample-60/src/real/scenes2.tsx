// Scenes 5-8 of the "real Claude screen" documentary (scene-local frames follow the narration).
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../full/kit";
import { Artifact, Callout, ChatView, Msg, chatGeo, chatTyping } from "./chat";
import { Finder, InstrModal, ProjectPage, SettingsSkills, Sheet, SkillFile, ST, Studio, T, skillRowY } from "./screens";
import { CLAUDE_TAB, Shell, path, segTyping, typedSeq } from "./shell";
import { K, Ring, SANS, Tab, p01, typed } from "./ui";
import { BASICS, FILES, INSTR, ROLE, SCRIPTS, SEGS5 } from "./data";

const curText = (f: number, m: Msg) => ("u" in m ? typed(m.u, f, m.typeAt, m.cps ?? 16) : "");

// ------------------------------------------------------------------ 5 · Teach Claude about your channel
export const R05: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <Shell
      f={f} dur={dur} n={5} chapter="Claude ko apna channel sikhao" url="claude.ai/project/youtube-content-assistant" side={{ active: "Projects" }}
      screen={<ProjectPage f={f} instr={f >= 1532 ? INSTR : ROLE + BASICS} instrHover={f >= 140 && f < 156} />}
      over={
        <>
          <Ring x={1384} y={212} w={472} h={110} f={f} from={24} to={150} r={14} />
          <Callout f={f} from={20} to={150} x={420} y={620} w={660} tone="warn" title="Sirf channel ka naam kaafi nahi" lines={["Apni content identity bhi explain karo"]} />
          <InstrModal f={f} openAt={156} closeAt={1532} text={typedSeq(ROLE + BASICS, SEGS5, f)} focus={f >= 256 && f < 1530} savePress={f >= 1528 && f < 1534} />
          <Callout f={f} from={262} to={636} x={1470} y={170} w={420} title="Ideal viewer" lines={["Uski problems kya hain?", "Video kyun dekhta hai?", "Video ke baad kya seekhe?"]} />
          <Callout f={f} from={640} to={1175} x={1470} y={170} w={420} title="Brand voice" lines={["Educational, entertaining ya documentary?", "Formal ya conversational?", "Short sentences ya detailed?"]} />
          <Callout f={f} from={1180} to={1515} x={1470} y={170} w={420} title="Workflow" lines={["Research", "Scriptwriting", "Title generation", "Analytics analysis"]} />
          <Ring x={1384} y={212} w={472} h={110} f={f} from={1545} to={1700} r={14} />
          <Callout f={f} from={1548} to={dur + 20} x={420} y={620} w={660} tone="ok" title="Claude = useful creative partner" lines={["Jitni clear identity, utni better help"]} />
        </>
      }
      steps={[
        { from: 255, to: 636, n: 1, text: "Ideal viewer" },
        { from: 636, to: 1175, n: 2, text: "Brand voice" },
        { from: 1175, to: 1532, n: 3, text: "Content workflow" },
      ]}
      cursor={path([0, [1300, 700]], [138, T.instrCard], [200, [1150, 560]], [248, T.modalText], [1490, [1180, 760]], [1518, T.modalSave], [1600, [1650, 340]])}
      clicks={[150, 256, 1530]}
      typing={segTyping(SEGS5)}
    />
  );
};

// ------------------------------------------------------------------ 6 · Reference files + analytics CSV
const STUDIO_TAB: Tab = { t: "Channel analytics - Studio", kind: "studio" };
const SHEET_TAB: Tab = { t: "channel-analytics.csv", kind: "sheet" };
const colAt = (f: number) => (f >= 1340 && f < 1545 ? Math.floor((f - 1340) / 41) : -1);
export const R06: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const active = f < 815 ? 0 : f < 1555 ? 1 : f < 1800 ? 2 : 0;
  const tabs = f < 1548 ? [CLAUDE_TAB, STUDIO_TAB] : [CLAUDE_TAB, STUDIO_TAB, SHEET_TAB];
  const sel = f >= 400 ? [0, 1, 2] : f >= 370 ? [0, 1] : f >= 340 ? [0] : [];
  const scripts = SCRIPTS.map((name, i) => ({ name, at: 450 + i * 12 }));
  const screen =
    active === 1 ? (
      <Studio f={f} nav={f < 960 ? 0 : 2} advanced={p01(f, 1040, 10)} range={f < 1130 ? "Last 28 days" : "Last 90 days"} exportMenu={f >= 1184 && f < 1246 ? p01(f, 1184, 6) : 0} csvHl={f >= 1210} colHl={colAt(f)} />
    ) : active === 2 ? (
      <Sheet f={f} selAt={1600} delAt={1680} />
    ) : f < 1800 ? (
      <ProjectPage f={f} instr={INSTR} files={scripts} plusPress={f >= 176 && f < 186} menu={f >= 184 && f < 300 ? p01(f, 184, 6) : 0} menuHl={f >= 270} />
    ) : (
      <ProjectPage f={f} instr={INSTR} files={[...SCRIPTS.map((name) => ({ name })), { name: "channel-analytics.csv", at: 1812 }]} />
    );
  return (
    <Shell
      f={f} dur={dur} n={6} chapter="Reference files + Analytics CSV" tabs={tabs} active={active}
      url={active === 1 ? "studio.youtube.com/channel/analytics" : active === 2 ? "Downloads/channel-analytics.csv" : "claude.ai/project/youtube-content-assistant"}
      download={f >= 1246 && f < 1336 ? p01(f, 1246, 8) * (1 - p01(f, 1326, 10)) : 0}
      side={active === 0 ? { active: "Projects" } : null}
      screen={screen}
      over={
        <>
          <Ring x={1812} y={354} w={48} h={48} f={f} from={24} to={180} r={10} />
          <Finder f={f} openAt={306} closeAt={446} files={[...SCRIPTS, "shorts-hooks.txt", "random-notes.txt"]} sel={sel} pressOpen={f >= 438 && f < 446} />
          <Callout f={f} from={462} to={612} x={420} y={640} w={660} title="Best videos ki scripts add karo" lines={["Jab aapke account mein file upload available ho"]} />
          <Ring x={1384} y={422} w={472} h={200} f={f} from={630} to={792} r={14} />
          <Callout f={f} from={630} to={792} x={420} y={640} w={660} tone="ok" title="Claude better samjhega" lines={["Writing patterns", "Explanations", "Content structure"]} />
          <Callout f={f} from={1340} to={1545} x={320} y={760} w={980} title="CSV mein kya hota hai?" lines={["Video titles · views · impressions · click-through rate · watch time"]} />
          <Callout f={f} from={1562} to={1792} x={420} y={620} w={760} tone="warn" title="Sirf zaroori data share karo" lines={["Private notes, contact details aur personal info pehle remove karo"]} />
          <Callout f={f} from={1812} to={dur + 20} x={420} y={620} w={660} tone="ok" title="Ab teeno cheezein ready hain" lines={["✓ Channel instructions", "✓ Sample scripts", "✓ Analytics data"]} />
        </>
      }
      steps={[
        { from: 14, to: 801, n: 1, text: "Project files: best scripts" },
        { from: 801, to: 1548, n: 2, text: "Studio → Analytics → Advanced → Export CSV" },
        { from: 1548, to: 1793, n: 3, text: "Private data hatao" },
      ]}
      cursor={path(
        [0, [1300, 700]], [160, T.filesPlus], [262, T.menuUpload], [330, T.finderRow(0)], [362, T.finderRow(1)], [392, T.finderRow(2)], [428, T.finderOpen], [520, [1500, 760]],
        [640, [1620, 520]], [798, [565, 26]], [950, ST.analytics], [1030, ST.advanced], [1092, ST.range], [1170, ST.exportBtn], [1228, ST.csv], [1330, [1200, 600]],
        [1360, [500, 352]], [1400, [960, 352]], [1440, [1160, 352]], [1480, [1360, 352]], [1520, [1600, 352]], [1545, [867, 26]], [1590, [1468, 216]], [1670, [1468, 300]],
        [1790, [263, 26]], [1860, [1620, 600]],
      )}
      clicks={[180, 300, 340, 370, 400, 440, 815, 960, 1040, 1100, 1180, 1240, 1555, 1600, 1680, 1800]}
    />
  );
};

// ------------------------------------------------------------------ 7 · Ideas and script outline
const M7: Msg[] = [
  { u: "Mere channel ki audience aur pichhle video topics ke aadhaar par 5 naye video ideas suggest karo.", typeAt: 275, send: 495, cps: 16 },
  {
    at: 515, wps: 9,
    blocks: [
      { k: "p", t: "Aapki beginner audience aur pichhle topics ke basis par 5 ideas:" },
      { k: "ol", items: ["**Mobile se YouTube Shorts kaise banaye** · sirf phone se, step by step", "**Free video editing apps: honest comparison** · top 3 apps", "**Pehle 100 subscribers: 7 common galtiyan**", "**Title aur tags ke basics** · beginners ke liye SEO", "**Free tools se thumbnail kaise banaye**"] },
    ],
  },
  { u: "Idea 2 ke liye ek engaging introduction aur detailed script outline banao.", typeAt: 1125, send: 1300, cps: 16 },
  { at: 1312, wps: 10, blocks: [{ k: "p", t: "Ye raha intro aur script outline, right side mein dekhiye." }] },
  { u: "Examples add karo aur language aur aasaan karo.", typeAt: 1400, send: 1500, cps: 18 },
  { at: 1515, wps: 10, blocks: [{ k: "p", t: "Done! Har section mein ek real example add kiya aur sentences chhote kar diye." }] },
];
const ART7: Artifact = {
  title: "Script outline: Free video editing apps", at: 1320, wps: 16,
  blocks: [
    { k: "h", t: "Hook (0:00 - 0:20)" }, { k: "p", t: "Kya aap bhi editing apps ke chakkar mein confuse ho? Aaj teen free apps ko honestly compare karenge." },
    { k: "h", t: "Intro" }, { k: "p", t: "Main kaun hoon, aur is video ke baad aap kya kar paoge." },
    { k: "h", t: "Main content" }, { k: "ol", items: ["App 1: features, pros, cons", "App 2: features, pros, cons", "App 3: features, pros, cons"] },
    { k: "h", t: "Conclusion" }, { k: "p", t: "Kaunsa app kis ke liye best hai, plus next video ka teaser." },
  ],
  v2: {
    at: 1525,
    blocks: [
      { k: "h", t: "Hook (0:00 - 0:20)" }, { k: "p", t: "Kya aapka 30 second ka Short export hote hi blur ho jaata hai? Aaj iska simple solution dekhte hain." },
      { k: "h", t: "Intro" }, { k: "p", t: "Aaj teen free apps try karenge, ek hi clip ke saath." },
      { k: "h", t: "Main content" }, { k: "ol", items: ["App 1: ek travel clip edit karke dekhenge", "App 2: text aur music add karna", "App 3: 1080p export test"] },
      { k: "h", t: "Conclusion" }, { k: "p", t: "Example: agar aap bilkul naye ho, App 2 se shuru karo." },
    ],
  },
};
export const R07: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const g = chatGeo(false, true), ga = chatGeo(true);
  return (
    <Shell
      f={f} dur={dur} n={7} chapter="Video ideas + script" url={f < 495 ? "claude.ai/project/youtube-content-assistant" : "claude.ai/chat/video-ideas"} side={{ active: "Projects" }}
      screen={f < 495 ? <ProjectPage f={f} instr={INSTR} files={FILES} text={curText(f, M7[0])} focus={f >= 160} /> : <ChatView f={f} msgs={M7} title="Video ideas" art={ART7} narrow />}
      over={
        <Callout f={f} from={705} to={1110} x={1320} y={150} w={560} tone="warn" title="AI ideas apne aap trending nahi hote" lines={["Evaluate karo:", "• Audience demand", "• Search interest", "• Channel goals"]} />
      }
      steps={[
        { from: 144, to: 512, n: 1, text: "Project ke andar nayi chat" },
        { from: 1120, to: 1590, n: 2, text: "Intro + detailed script outline" },
        { from: 1590, to: dur + 20, n: 3, text: "Research + planning assistant" },
      ]}
      cursor={path([0, [1300, 700]], [150, T.projField], [470, [1150, 470]], [485, T.projSend], [600, [1500, 800]], [1108, g.field], [1288, g.send], [1386, ga.field], [1490, ga.send], [1580, [1500, 700]])}
      clicks={[160, 495, 1118, 1300, 1396, 1500]}
      typing={chatTyping(M7)}
    />
  );
};

// ------------------------------------------------------------------ 8 · Skills
const SKILL_MD: { t: string; hl?: [number, number] }[] = [
  { t: "---" }, { t: "name: title-writer" }, { t: "description: YouTube title options for a given topic" }, { t: "---" }, { t: "" },
  { t: "# Title Writer" }, { t: "For every topic, write 6 title options." }, { t: "" }, { t: "## Each title must balance" },
  { t: "- Clarity: viewer turant samjhe video kis baare mein hai", hl: [680, 760] },
  { t: "- Curiosity: click karne ki ek wajah ho", hl: [740, 820] },
  { t: "- Accuracy: wahi promise karo jo video mein hai", hl: [800, 880] },
  { t: "- Audience relevance: beginners, Hinglish search terms", hl: [860, 915] },
  { t: "" }, { t: "## Output" }, { t: "Table: title | style (curiosity / benefit / search) | notes" }, { t: "" }, { t: "## Avoid" }, { t: "- Clickbait aur misleading claims" },
];
export const R08: React.FC<SceneProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const on = [0, 1, ...(f >= 990 ? [2] : []), ...(f >= 1040 ? [3] : []), ...(f >= 1090 ? [4] : [])];
  const tog = (i: number) => [1789, skillRowY(i) + 39] as [number, number];
  return (
    <Shell
      f={f} dur={dur} n={8} chapter="Claude Skills" url={f < 86 ? "claude.ai/project/youtube-content-assistant" : "claude.ai/settings/capabilities"} side={{ active: f < 86 ? "Projects" : undefined }}
      screen={f < 86 ? <ProjectPage f={f} instr={INSTR} files={FILES} /> : <SettingsSkills f={f} on={on} hlRow={f >= 380 && f < 476 ? 0 : undefined} />}
      over={
        <>
          {f >= 44 && f < 90 ? (
            <div style={{ position: "absolute", left: 14, top: 770, width: 300, background: K.card, borderRadius: 14, border: `1px solid ${K.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.16)", padding: 8, fontFamily: SANS, fontSize: 19, opacity: p01(f, 44, 6) }}>
              {["Settings", "Language", "Get help", "Log out"].map((m, i) => (
                <div key={m} style={{ padding: "11px 14px", borderRadius: 8, background: i === 0 && f >= 66 ? K.hover : "transparent" }}>{m}</div>
              ))}
            </div>
          ) : null}
          <Callout f={f} from={150} to={366} x={1240} y={890} w={600} title="Skill = reusable instructions + resources" lines={["Ek particular task, har baar same tareeke se"]} />
          <SkillFile f={f} openAt={476} closeAt={920} lines={SKILL_MD} reveal={482} />
          <Callout f={f} from={500} to={662} x={1520} y={170} w={380} title="Har baar lamba prompt? Nahi." lines={["Ek structured workflow, baar baar use karo"]} />
          <Callout f={f} from={670} to={915} x={1520} y={170} w={380} tone="ok" title="Achha title balance karta hai" lines={["Clarity", "Curiosity", "Accuracy", "Audience relevance"]} />
          <Callout f={f} from={930} to={1152} x={1240} y={890} w={600} title="Aur bhi reusable workflows" lines={["Script review · intro writing · thumbnails · channel analysis"]} />
          <Callout f={f} from={1160} to={1352} x={1240} y={890} w={600} tone="warn" title="Availability alag ho sakti hai" lines={["Claude product, plan aur environment par depend"]} />
        </>
      }
      steps={[{ from: 1358, to: dur + 20, n: 1, text: "Skills ko apne workflow mein organize karo" }]}
      cursor={path([0, [1300, 700]], [32, T.avatar], [62, [120, 800]], [140, [1200, 520]], [370, [1100, skillRowY(0) + 39]], [600, [1530, 640]], [905, [1560, 960]], [978, tog(2)], [1028, tog(3)], [1078, tog(4)], [1200, [1500, 760]])}
      clicks={[40, 80, 470, 920, 990, 1040, 1090]}
    />
  );
};
