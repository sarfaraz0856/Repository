// Scenes 1-4 of the "real Claude screen" documentary. Frame numbers are scene-local and follow the
// measured narration (src/full/timing.ts).
import React from "react";
import { useSceneFrame } from "./warp";
import type { SceneProps } from "../full/kit";
import { Callout, ChatView, Msg, chatGeo, chatTyping } from "./chat";
import { Home, InstrModal, NewProject, ProjectPage, ProjectsList, T } from "./screens";
import { Shell, path, sideTarget, segTyping, typedSeq } from "./shell";
import { K, Ring, SANS, SERIF, Spark, p01, sideItemY, sy, typed } from "./ui";
import { BASICS, FILES, INSTR, NAME, PURPOSE, ROLE } from "./data";

const isTyping = (f: number, m: Msg) => "u" in m && f >= m.typeAt && f < m.send;
const curText = (f: number, m: Msg) => ("u" in m ? typed(m.u, f, m.typeAt, m.cps ?? 16) : "");

// ------------------------------------------------------------------ 1 · Intro
const M1: Msg[] = [
  { u: "Har hafte ek achhi YouTube video banane mein itni mehnat kyun lagti hai?", typeAt: 44, send: 232, cps: 16 },
  {
    at: 252, wps: 4.2,
    blocks: [
      { k: "p", t: "Kyunki ek video ke peeche kaafi steps hote hain:" },
      { k: "ol", items: ["**Topic** dhoondhna", "**Research** karna", "**Script** likhna", "**Title aur thumbnail** banana", "**Publish** karna", "**Performance analyze** karna"] },
    ],
  },
  { u: "Kya koi AI mere channel aur audience ko samajh kar har step mein help kar sakta hai?", typeAt: 660, send: 1000, cps: 16 },
  { at: 1018, wps: 9, blocks: [{ k: "p", t: "Haan! Agar aap mujhe apne channel ka sahi context dein, to main ideas, research, scripts, titles, thumbnails aur analytics mein aapki madad kar sakta hoon." }] },
];
const AGENDA = ["Projects", "Custom instructions", "Reference files", "Skills", "Video ideas", "Thumbnails", "Analytics"];

export const R01: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const g = chatGeo(false);
  const card = p01(f, 1135, 16);
  return (
    <Shell
      f={f} dur={dur} n={1} chapter="Intro" url={f < 232 ? "claude.ai/new" : "claude.ai/chat/video-workflow"}
      screen={f < 232 ? <Home f={f} text={curText(f, M1[0])} focus={f >= 36} /> : <ChatView f={f} msgs={M1} title="YouTube video workflow" project="" />}
      over={
        card > 0 ? (
          <>
            <div style={{ position: "absolute", inset: 0, background: `rgba(24,22,18,${0.55 * card})` }} />
            <div style={{ position: "absolute", left: 360, top: 200, width: 1200, height: 640, borderRadius: 28, background: K.page, opacity: card, transform: `translateY(${(1 - card) * 30}px)`, boxShadow: "0 40px 100px rgba(0,0,0,0.35)", fontFamily: SANS, textAlign: "center" }}>
              <div style={{ marginTop: 70, display: "flex", justifyContent: "center", transform: `rotate(${(1 - card) * -40}deg)` }}><Spark size={96} /></div>
              <div style={{ fontFamily: SERIF, fontSize: 70, marginTop: 26, color: "#2B2A26" }}>Claude AI for YouTube Creators</div>
              <div style={{ fontSize: 28, color: K.sub, marginTop: 14 }}>Apna personal content assistant setup karo · step by step</div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, margin: "46px 80px 0" }}>
                {AGENDA.map((a, i) => {
                  const o = p01(f, 1330 + i * 32, 10);
                  return (
                    <div key={a} style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)`, border: `1.5px solid ${K.border}`, background: K.card, borderRadius: 14, padding: "12px 22px", fontSize: 24, fontWeight: 600 }}>
                      <span style={{ color: K.clay, marginRight: 8 }}>{i + 1}</span>{a}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 36, opacity: p01(f, 1600, 12), display: "inline-block", background: K.clay, color: "#fff", borderRadius: 999, padding: "12px 28px", fontSize: 24, fontWeight: 700 }}>
                Sirf theory nahi · har feature ka practical example
              </div>
            </div>
          </>
        ) : null
      }
      cursor={path([0, [1200, 760]], [28, T.homeField], [180, [1180, 600]], [222, T.homeSend], [400, [1500, 700]], [640, g.field], [960, [1300, 900]], [990, g.send], [1100, [1600, 760]])}
      clicks={[36, 232, 650, 1000]}
      typing={chatTyping(M1)}
    />
  );
};

// ------------------------------------------------------------------ 2 · What is Claude
const M2: Msg[] = [
  { u: "Is document ko padh kar 5 key points simple Hinglish mein batao.", file: "video-notes.pdf", typeAt: 300, send: 470, cps: 16 },
  {
    at: 488, wps: 12,
    blocks: [
      { k: "p", t: "**Key points:**" },
      { k: "ul", items: ["Video ka main idea: beginners ke liye mobile editing", "3 free apps compare kiye gaye hain", "Har app ke pros aur cons simple words mein", "Export settings: 1080p, 30 fps", "Ending: viewers ke liye practice task"] },
    ],
  },
  { u: "Mere liye ek video script likh do.", typeAt: 618, send: 700, cps: 16 },
  { at: 720, wps: 10, blocks: [{ k: "p", t: "Zaroor! Lekin pehle thoda batayiye: video kis topic par hai? Aapki audience kaun hai? Language aur video length kya honi chahiye?" }] },
  { u: "Main technology videos banata hoon. Style: Hindi-Hinglish. Audience: beginners. Main easy examples ke saath topics explain karta hoon.", typeAt: 940, send: 1272, cps: 14 },
  {
    at: 1290, wps: 9,
    blocks: [
      { k: "p", t: "Perfect! Ab main aapke style mein likh sakta hoon:" },
      { k: "ol", items: ["**Hook:** ek simple sawaal, jaise 'Kya aapka phone bhi slow hai?'", "**Examples:** roz ki life se 3 aasaan examples", "**Language:** chhote Hinglish sentences", "**Ending:** viewers ke liye ek clear next step"] },
    ],
  },
];
export const R02: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const g = chatGeo(false, true);
  return (
    <Shell
      f={f} dur={dur} n={2} chapter="Claude AI kya hai?" url={f < 470 ? "claude.ai/new" : "claude.ai/chat/key-points"}
      screen={f < 470 ? <Home f={f} text={curText(f, M2[0])} focus={isTyping(f, M2[0])} file={f >= 296 ? "video-notes.pdf" : undefined} /> : <ChatView f={f} msgs={M2} title="Document ke key points" project="" narrow />}
      over={
        <>
          <Ring x={895} y={305} w={460} h={86} f={f} from={110} to={290} r={14} />
          <Callout f={f} from={118} to={290} x={860} y={700} w={560} title="Claude = AI assistant" lines={["Anthropic ne develop kiya hai"]} />
          <Callout f={f} from={300} to={600} x={1370} y={130} w={500} title="Claude kya kar sakta hai?" lines={["Likhna", "Jaankari samajhna", "Documents analyze karna", "Creative kaam mein help"]} />
          <Callout f={f} from={760} to={930} x={1320} y={160} w={560} tone="warn" title="Context nahi = generic jawab" lines={["Topic? Audience? Language? Length?"]} />
          <Callout f={f} from={1300} to={1462} x={1320} y={160} w={560} tone="ok" title="Sahi context = relevant content" lines={["Niche · style · audience · examples"]} />
        </>
      }
      steps={[{ from: 1467, to: dur + 20, n: 1, text: "Pehle AI ko apne channel ke baare mein sikhao" }]}
      cursor={path([0, [1300, 800]], [120, [1300, 780]], [282, [706, 545]], [300, T.homeField], [455, T.homeSend], [560, [1500, 700]], [600, g.field], [690, g.send], [920, g.field], [1262, g.send], [1360, [1500, 820]])}
      clicks={[290, 470, 610, 700, 936, 1272]}
      typing={chatTyping(M2)}
    />
  );
};

// ------------------------------------------------------------------ 3 · Why Projects
const LONG = "Mera channel tech niche ka hai. Audience beginners hai. Language Hindi-Hinglish. Video 8-10 minute ki. Writing style simple aur friendly. Ab ek nayi script likho.";
const M3a: Msg[] = [
  { u: LONG, typeAt: 130, send: 415, cps: 18 },
  { at: 432, wps: 10, blocks: [{ k: "p", t: "Zaroor! Ye raha script ka outline: ek strong hook, teen main points aur ek clear ending." }] },
];
const M3b: Msg[] = [
  { u: "Agli video ke liye 3 topic ideas do.", typeAt: 1290, send: 1420, cps: 14 },
  { at: 1440, wps: 10, blocks: [{ k: "p", t: "Aapki beginner audience aur Hinglish style ke hisaab se:" }, { k: "ol", items: ["Mobile se YouTube Shorts kaise banaye", "Free video editing apps: honest comparison", "Pehle 100 subscribers ke liye 5 tips"] }] },
];
export const R03: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const screen =
    f < 415 ? <Home f={f} text={curText(f, M3a[0])} focus={isTyping(f, M3a[0])} />
    : f < 700 ? <ChatView f={f} msgs={M3a} title="Script outline" project="" narrow />
    : f < 905 ? <ProjectsList f={f} mine />
    : f < 1420 ? <ProjectPage f={f} instr={INSTR} files={FILES} text={curText(f, M3b[0])} focus={f >= 1280} instrHover={f >= 915 && f < 1010} />
    : <ChatView f={f} msgs={M3b} title="Topic ideas" narrow />;
  return (
    <Shell
      f={f} dur={dur} n={3} chapter="Projects kyun?" url={f < 415 ? "claude.ai/new" : f < 700 ? "claude.ai/chat/script-outline" : f < 905 ? "claude.ai/projects" : "claude.ai/project/youtube-content-assistant"}
      side={{ active: f >= 700 ? "Projects" : undefined, hover: f >= 680 && f < 700 ? "Projects" : undefined }}
      screen={screen}
      over={
        <>
          <Callout f={f} from={440} to={642} x={1320} y={150} w={560} tone="warn" title="Har nayi chat mein yahi sab dobara?" lines={["Chat 1: niche, audience, language, style...", "Chat 2: niche, audience, language, style...", "Chat 3: phir se wahi..."]} />
          <Ring x={14} y={sy(sideItemY(2))} w={302} h={48} f={f} from={650} to={706} r={10} />
          <Callout f={f} from={712} to={880} x={1240} y={790} w={600} title="Solution: Claude Projects" lines={["Jahan ye feature aapke account par available ho"]} />
          <Ring x={1384} y={212} w={472} h={110} f={f} from={915} to={1012} r={14} />
          <Ring x={1384} y={422} w={472} h={270} f={f} from={1012} to={1132} r={14} />
          <Callout f={f} from={900} to={1132} x={420} y={640} w={640} title="Project = dedicated workspace" lines={["Instructions + reference materials", "ek hi jagah organized"]} />
          <Callout f={f} from={1450} to={1602} x={1320} y={160} w={560} tone="ok" title="Context dobara likhne ki zaroorat nahi" lines={["Project ki instructions apne aap use hoti hain"]} />
          <Callout f={f} from={1610} to={dur + 20} x={1320} y={160} w={560} tone="warn" title="AI output hamesha review karo" lines={["Saved context ke baad bhi AI galti kar sakta hai"]} />
          <Ring x={400} y={1038} w={860} h={30} f={f} from={1615} to={dur + 20} r={8} />
        </>
      }
      steps={[{ from: 1135, to: 1272, n: 1, text: "1 channel = 1 Project" }]}
      cursor={path([0, [1200, 760]], [118, T.homeField], [395, [1200, 560]], [405, T.homeSend], [520, [1500, 720]], [690, sideTarget(2)], [720, [600, 600]], [890, [790, 464]], [930, T.instrCard], [1030, [1620, 520]], [1270, T.projField], [1400, [1100, 470]], [1412, T.projSend], [1500, [1500, 820]])}
      clicks={[124, 415, 700, 900, 1280, 1420]}
      typing={[...chatTyping(M3a), ...chatTyping(M3b)]}
    />
  );
};

// ------------------------------------------------------------------ 4 · Create the project
const S4 = { name: { at: 222, cps: 14 }, purpose: { at: 528, cps: 16 } };
const SEG4 = [{ t: ROLE, at: 830, cps: 20 }, { t: BASICS, at: 1355, cps: 22 }];
export const R04: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const nm = typed(NAME, f, S4.name.at, S4.name.cps), pu = typed(PURPOSE, f, S4.purpose.at, S4.purpose.cps);
  const screen =
    f < 118 ? <Home f={f} />
    : f < 172 ? <ProjectsList f={f} press={f >= 168 ? 1 : 0} />
    : f < 692 ? <NewProject f={f} name={nm} purpose={pu} focusName={f >= 210 && f < 372} focusPurpose={f >= 372 && f < 688} press={f >= 688} />
    : <ProjectPage f={f} instr={f >= 1562 ? ROLE + BASICS : undefined} instrHover={f >= 790 && f < 805} />;
  return (
    <Shell
      f={f} dur={dur} n={4} chapter="Project create karo"
      url={f < 118 ? "claude.ai/new" : f < 172 ? "claude.ai/projects" : f < 692 ? "claude.ai/projects/create" : "claude.ai/project/youtube-content-assistant"}
      side={{ active: f >= 118 ? "Projects" : undefined, hover: f >= 104 && f < 118 ? "Projects" : undefined }}
      screen={screen}
      over={
        <>
          <Ring x={14} y={sy(sideItemY(2))} w={302} h={48} f={f} from={84} to={124} r={10} />
          <Ring x={1570} y={sy(66)} w={210} h={58} f={f} from={134} to={174} r={12} />
          <Ring x={1384} y={212} w={472} h={110} f={f} from={716} to={800} r={14} />
          <InstrModal f={f} openAt={804} closeAt={1562} text={typedSeq("", SEG4, f)} focus={f >= 812 && f < 1560} savePress={f >= 1558 && f < 1564} />
          <Ring x={1384} y={212} w={472} h={110} f={f} from={1575} to={1720} r={14} />
          <Callout f={f} from={1590} to={dur + 20} x={420} y={620} w={660} tone="ok" title="Jitna clear context, utne better results" lines={["Claude ke liye aapke goals samajhna aasaan"]} />
        </>
      }
      steps={[
        { from: 24, to: 300, n: 1, text: "Projects  →  New project" },
        { from: 300, to: 692, n: 2, text: "Project ka naam + purpose likho" },
        { from: 700, to: 1349, n: 3, text: "Project Instructions: Claude ka role" },
        { from: 1349, to: dur + 20, n: 4, text: "Niche · audience · language · style" },
      ]}
      cursor={path(
        [0, [1310, 760]], [86, [1300, 740]], [114, sideTarget(2)], [130, sideTarget(2)], [160, [1675, 187]], [176, [1675, 187]], [204, [900, 375]], [300, [940, 392]],
        [362, [900, 532]], [520, [1000, 562]], [676, [1300, 632]], [686, [1420, 750]], [720, [1420, 750]], [790, [1640, 267]], [860, [1640, 267]], [900, [1500, 760]],
        [1330, [1180, 700]], [1525, [1180, 700]], [1548, T.modalSave], [1600, [1650, 340]],
      )}
      clicks={[118, 168, 210, 372, 688, 798, 1560]}
      typing={[{ at: S4.name.at, len: Math.ceil((NAME.length / 14) * 30) }, { at: S4.purpose.at, len: Math.ceil((PURPOSE.length / 16) * 30) }, ...segTyping(SEG4)]}
    />
  );
};
