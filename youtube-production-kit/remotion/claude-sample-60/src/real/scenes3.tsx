// Scenes 9-13 of the "real Claude screen" documentary (scene-local frames follow the narration).
import React from "react";
import { useSceneFrame } from "./warp";
import type { SceneProps } from "../full/kit";
import { Artifact, Callout, ChatView, Msg, chatGeo, chatTyping } from "./chat";
import { Home, ProjectPage, T } from "./screens";
import { Shell, path } from "./shell";
import { K, Ring, SANS, SERIF, Spark, p01, typed } from "./ui";
import { FILES, INSTR } from "./data";

const curText = (f: number, m: Msg) => ("u" in m ? typed(m.u, f, m.typeAt, m.cps ?? 16) : "");
const PROJ_URL = "claude.ai/project/youtube-content-assistant";

// ------------------------------------------------------------------ 9 · Analytics report card
const M9: Msg[] = [
  { u: "Is CSV ko analyze karke mera channel report card banao. Views, impressions, CTR, watch time aur subscribers summarize karo.", file: "channel-analytics.csv", typeAt: 90, send: 330, cps: 18 },
  {
    at: 348, wps: 4.5,
    blocks: [
      { k: "p", t: "Sample data ke basis par summary:" },
      { k: "table", head: ["Metric", "Value", "Change"], rows: [["Views", "48.2K", "+12%"], ["Impressions", "412K", "+8%"], ["CTR", "4.6%", "-0.4"], ["Watch time", "3.1K h", "+9%"], ["Subscribers", "+620", "+15%"]] },
      { k: "h", t: "Video-wise" },
      {
        k: "table", head: ["Video", "Impr.", "CTR", "Subs"],
        rows: [["How to edit videos on mobile", "98K", "6.1%", "+310"], ["Best free apps for creators", "120K", "3.2%", "+95"], ["Channel banner size guide", "41K", "7.4%", "+140"], ["Shorts vs long videos", "77K", "2.9%", "+40"]],
        hl: [{ row: 1, from: 730, to: 975, tone: "bad" }],
      },
    ],
  },
  { u: "Subscribers kahan se aaye aur improvement ke opportunities kya hain?", typeAt: 1170, send: 1262, cps: 24 },
  {
    at: 1278, wps: 9,
    blocks: [{
      k: "ul",
      items: [
        { t: "Sabse zyada subscribers **How to edit videos on mobile** se aaye (+310)", hl: [1290, 1420] },
        "Viewers ka interest **editing aur free tools** wale topics mein zyada",
        "Improve: **Best free apps** aur **Shorts vs long** ke title aur thumbnail",
      ],
    }],
  },
  { u: "Ek readable report card bana do.", typeAt: 1462, send: 1548, cps: 16 },
  { at: 1560, wps: 10, blocks: [{ k: "p", t: "Report card right side mein tayyar hai." }] },
];
const ART9: Artifact = {
  title: "Channel Report Card", at: 1566, wps: 18,
  blocks: [
    { k: "h", t: "Overall grade: B+" },
    { k: "table", head: ["Area", "Grade", "Note"], rows: [["Reach (impressions)", "A-", "Badh rahe hain"], ["Click-through (CTR)", "C+", "2 videos ka CTR kam"], ["Retention", "B", "Avg view 3:15"], ["Growth (subs)", "B+", "+620"]] },
    { k: "h", t: "Next steps" },
    { k: "ol", items: ["2 videos ke title + thumbnail test karo", "Editing aur free tools par aur videos", "Har video ke pehle 30 seconds improve karo"] },
    { k: "note", t: "Sample data · not real" },
  ],
};
export const R09: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const g = chatGeo(false, true);
  return (
    <Shell
      f={f} dur={dur} n={9} chapter="Analytics report card" url={f < 330 ? PROJ_URL : "claude.ai/chat/channel-report"} side={{ active: "Projects" }}
      screen={f < 330 ? <ProjectPage f={f} instr={INSTR} files={FILES} text={curText(f, M9[0])} focus={f >= 84} file={f >= 66 ? "channel-analytics.csv" : undefined} /> : <ChatView f={f} msgs={M9} title="Channel report" art={ART9} narrow />}
      over={
        <>
          <Callout f={f} from={20} to={300} x={420} y={640} w={660} title="Which videos are doing well?" lines={["And which ones need improvement?"]} />
          <Callout f={f} from={736} to={975} x={1320} y={150} w={560} tone="warn" title="High impressions, low CTR" lines={["Review the title and thumbnail"]} />
          <Callout f={f} from={990} to={1268} x={1320} y={150} w={560} title="Don't decide on CTR alone" lines={["Topic", "Traffic source", "Audience", "Video age"]} />
        </>
      }
      steps={[
        { from: 309, to: 722, n: 1, text: "CSV analyze: views · impressions · CTR · watch time · subs" },
        { from: 1561, to: 1703, n: 2, text: "Readable report card" },
        { from: 1703, to: dur + 20, n: 3, text: "Numbers → better decisions" },
      ]}
      cursor={path([0, [1300, 700]], [50, [441, 477]], [74, T.projField], [312, [1100, 470]], [322, T.projSend], [500, [1500, 820]], [1156, g.field], [1252, g.send], [1450, g.field], [1538, g.send], [1620, [1500, 760]])}
      clicks={[60, 84, 330, 1166, 1262, 1458, 1548]}
      typing={chatTyping(M9)}
    />
  );
};

// ------------------------------------------------------------------ 10 · Title Writer
const M10: Msg[] = [
  { u: "title-writer skill use karo. Topic: Mobile se YouTube channel kaise banaye. 6 title options do.", typeAt: 120, send: 320, cps: 16 },
  {
    at: 335, wps: 5.5,
    blocks: [
      { k: "p", t: "Topic: **Mobile se YouTube channel kaise banaye**" },
      {
        k: "ol",
        items: [
          { t: "Mobile Se YouTube Channel Kaise Banaye (2026 Step by Step)", tags: ["Search"], hl: [910, 1132] },
          { t: "Sirf Phone Se Channel Shuru Karo: Full Beginner Guide", tags: ["Benefit"], hl: [830, 910] },
          { t: "YouTube Channel Banane Se Pehle Ye 5 Galtiyan Mat Karna", tags: ["Curiosity"], hl: [750, 830] },
          { t: "10 Minute Mein Apna YouTube Channel Setup Karo", tags: ["Benefit"] },
          { t: "Mobile vs Laptop: Channel Banane Ka Sabse Aasaan Tarika", tags: ["Curiosity"] },
          { t: "Free Mein YouTube Channel Kaise Banaye (Hindi)", tags: ["Search"] },
        ],
      },
    ],
  },
  { u: "Title 1 ko thoda chhota karo, language natural rakho, clickbait nahi.", typeAt: 1140, send: 1265, cps: 18 },
  { at: 1280, wps: 9, blocks: [{ k: "p", t: "Refined options:" }, { k: "ol", items: ["Mobile Se YouTube Channel Kaise Banaye (Step by Step)", "Phone Se YouTube Channel Banao: Easy Guide", "YouTube Channel Kaise Banaye Mobile Se (2026)"] }] },
];
export const R10: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const g = chatGeo(false, true);
  return (
    <Shell
      f={f} dur={dur} n={10} chapter="Title Writer" url={f < 320 ? PROJ_URL : "claude.ai/chat/title-options"} side={{ active: "Projects" }}
      screen={f < 320 ? <ProjectPage f={f} instr={INSTR} files={FILES} text={curText(f, M10[0])} focus={f >= 110} /> : <ChatView f={f} msgs={M10} title="Title options" narrow />}
      over={
        <>
          <Callout f={f} from={540} to={736} x={1320} y={150} w={560} tone="ok" title="Every title should be:" lines={["Clear", "Interesting", "True to the actual video content"]} />
          <Callout f={f} from={745} to={985} x={1320} y={150} w={560} title="Ask Claude to compare" lines={["Which builds curiosity?", "Which has a specific benefit?", "Which is search-friendly?"]} />
          <Callout f={f} from={992} to={1132} x={1320} y={150} w={560} tone="ok" title="Compare and pick the best option" />
          <Callout f={f} from={1525} to={dur + 20} x={1320} y={150} w={560} tone="warn" title="AI scores and predictions are not guarantees" lines={["Actual YouTube performance may differ"]} />
        </>
      }
      steps={[
        { from: 14, to: 330, n: 1, text: "Title Writer: 6 options for one topic" },
        { from: 1135, to: 1372, n: 2, text: "Refine: shorter · natural · no clickbait" },
        { from: 1372, to: 1521, n: 3, text: "Test + feedback = consistent workflow" },
      ]}
      cursor={path([0, [1300, 700]], [100, T.projField], [300, [1100, 470]], [310, T.projSend], [420, [1500, 800]], [1124, g.field], [1255, g.send], [1350, [1500, 760]])}
      clicks={[110, 320, 1134, 1265]}
      typing={chatTyping(M10)}
    />
  );
};

// ------------------------------------------------------------------ 11 · Hooks + thumbnails
const Thumbs: React.FC = () => {
  const box: React.CSSProperties = { width: 228, height: 128, borderRadius: 10, position: "relative", overflow: "hidden", fontFamily: SANS, fontWeight: 900, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" };
  return (
    <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
      <div style={{ ...box, background: "linear-gradient(135deg,#5B3FD1,#9B7BFF)" }}>
        <div style={{ position: "absolute", left: 18, bottom: -10, width: 70, height: 70, borderRadius: 35, background: "#F2C9A8" }} />
        <div style={{ position: "absolute", left: 6, bottom: -60, width: 96, height: 80, borderRadius: 40, background: "#2B2A26" }} />
        <div style={{ position: "absolute", right: 22, top: 30, width: 46, height: 84, borderRadius: 8, background: "#111", border: "3px solid #ddd" }} />
        <div style={{ position: "absolute", left: 10, top: 8, color: "#FFD43B", fontSize: 22, lineHeight: 1 }}>SIRF<br />MOBILE</div>
      </div>
      <div style={{ ...box, background: "#111" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, right: 0, background: "linear-gradient(135deg,#FFE7A3,#FFB86B)" }} />
        <div style={{ position: "absolute", left: 30, top: 34, width: 40, height: 70, borderRadius: 7, background: "#444", filter: "blur(2px)" }} />
        <div style={{ position: "absolute", right: 34, top: 34, width: 40, height: 70, borderRadius: 7, background: "#222" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", color: "#fff", fontSize: 19, textShadow: "0 2px 4px #000" }}>SAME PHONE</div>
      </div>
      <div style={{ ...box, background: "#FAFAFA", border: "1px solid #ddd" }}>
        <div style={{ position: "absolute", left: 74, top: 38, width: 84, height: 52, borderRadius: 5, background: "#888" }} />
        <div style={{ position: "absolute", left: 62, top: 90, width: 108, height: 8, borderRadius: 3, background: "#666" }} />
        <div style={{ position: "absolute", left: 66, top: 62, width: 100, height: 10, background: "#E5322D", transform: "rotate(35deg)" }} />
        <div style={{ position: "absolute", left: 66, top: 62, width: 100, height: 10, background: "#E5322D", transform: "rotate(-35deg)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 6, textAlign: "center", color: "#111", fontSize: 19 }}>NO LAPTOP</div>
      </div>
    </div>
  );
};
const M11: Msg[] = [
  { u: "Topic: Mobile se YouTube channel kaise banaye. 4 alag opening hooks do: question, surprising observation, problem-solution, direct educational.", typeAt: 262, send: 520, cps: 18 },
  {
    at: 535, wps: 6.5,
    blocks: [{
      k: "ol",
      items: [
        { t: "\"Kya aap bhi sochte ho ki YouTube channel ke liye laptop zaroori hai?\"", tags: ["Question"] },
        { t: "\"Mere aadhe se zyada videos sirf ek phone se bane hain.\"", tags: ["Surprising"] },
        { t: "\"Channel banate hi settings mein atak gaye? Agle 8 minute mein sab clear.\"", tags: ["Problem-solution"], hl: [870, 1040] },
        { t: "\"Is video mein hum mobile se channel banayenge, step by step.\"", tags: ["Direct"] },
      ],
    }],
  },
  { u: "Ab is topic ke liye 3 thumbnail concepts do.", typeAt: 1050, send: 1125, cps: 20 },
  { at: 1140, wps: 10, blocks: [{ k: "p", t: "Teen concepts, details aur rough sketches right side mein:" }] },
];
const ART11: Artifact = {
  title: "Thumbnail concepts", at: 1150, wps: 12,
  blocks: [
    {
      k: "table", head: ["Concept", "Composition", "Background", "Text"],
      rows: [["1. Face + phone", "Face left, phone right", "Purple gradient", "SIRF MOBILE"], ["2. Before / After", "Split screen", "Dark vs bright", "SAME PHONE"], ["3. No laptop", "Laptop crossed out", "Clean white", "NO LAPTOP"]],
    },
    { k: "p", t: "Rough sketches:" },
    { k: "node", w: 6, n: <Thumbs /> },
  ],
};
export const R11: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const g = chatGeo(false, true);
  return (
    <Shell
      f={f} dur={dur} n={11} chapter="Intro hooks + Thumbnails" url={f < 520 ? PROJ_URL : "claude.ai/chat/hooks-thumbnails"} side={{ active: "Projects" }}
      screen={f < 520 ? <ProjectPage f={f} instr={INSTR} files={FILES} text={curText(f, M11[0])} focus={f >= 250} /> : <ChatView f={f} msgs={M11} title="Hooks + thumbnails" art={ART11} narrow />}
      over={
        <>
          <Callout f={f} from={240} to={505} x={420} y={640} w={660} title="The first few seconds matter most" lines={["Viewers decide whether to keep watching"]} />
          <Callout f={f} from={640} to={862} x={1320} y={150} w={560} title="One topic, different hook styles" lines={["Question", "Surprising observation", "Problem-solution", "Direct educational"]} />
          <Callout f={f} from={875} to={1040} x={1320} y={150} w={560} tone="ok" title="Pick a hook that fits your style" />
          <Callout f={f} from={1585} to={1776} x={1150} y={760} w={700} tone="warn" title="Check before the final thumbnail" lines={["Readability · Accuracy · Visual clarity"]} />
          <Callout f={f} from={1785} to={dur + 20} x={1150} y={760} w={700} tone="ok" title="The final creative call is yours" lines={["Take ideas from AI, you decide"]} />
        </>
      }
      steps={[
        { from: 13, to: 520, n: 1, text: "Opening hooks brainstorm" },
        { from: 1045, to: 1581, n: 2, text: "Thumbnail ideation" },
      ]}
      cursor={path([0, [1300, 700]], [240, T.projField], [495, [1100, 470]], [505, T.projSend], [620, [1500, 820]], [1034, g.field], [1115, g.send], [1250, [1500, 820]])}
      clicks={[250, 520, 1044, 1125]}
      typing={chatTyping(M11)}
    />
  );
};

// ------------------------------------------------------------------ 12 · Complete workflow
const CHATS12 = [
  { t: "Video ideas", at: 505, hl: [505, 642] as [number, number] },
  { t: "Script outline: Free video editing apps", at: 648, hl: [648, 884] as [number, number] },
  { t: "Title options", at: 890, hl: [890, 1018] as [number, number] },
  { t: "Thumbnail concepts", at: 1024, hl: [1024, 1173] as [number, number] },
  { t: "Channel report card", at: 1179, hl: [1179, 1416] as [number, number] },
];
export const R12: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  return (
    <Shell
      f={f} dur={dur} n={12} chapter="Complete workflow" url={PROJ_URL} side={{ active: "Projects" }}
      screen={<ProjectPage f={f} instr={INSTR} files={FILES} chats={CHATS12} />}
      over={
        <>
          <Ring x={392} y={166} w={900} h={66} f={f} from={131} to={268} r={12} />
          <Ring x={1384} y={212} w={472} h={480} f={f} from={268} to={499} r={14} />
          <Callout f={f} from={1420} to={1528} x={420} y={300} w={840} tone="ok" title="One organized system" lines={["✓ Project setup   ✓ Channel context   ✓ Ideas", "✓ Script   ✓ Titles   ✓ Thumbnails   ✓ Analytics"]} />
          <Callout f={f} from={1535} to={dur + 20} x={420} y={300} w={840} title="Claude does not replace creativity" lines={["It helps with planning · drafting · analysis · repetitive tasks"]} />
        </>
      }
      steps={[
        { from: 131, to: 268, n: 1, text: "Dedicated Project setup" },
        { from: 268, to: 499, n: 2, text: "Audience + brand voice + reference files" },
        { from: 499, to: 642, n: 3, text: "Topic brainstorm" },
        { from: 642, to: 884, n: 4, text: "Research outline + intro + script" },
        { from: 884, to: 1018, n: 5, text: "Title Writer" },
        { from: 1018, to: 1173, n: 6, text: "Thumbnail ideation" },
        { from: 1173, to: 1416, n: 7, text: "Learn from analytics after publishing" },
      ]}
      cursor={path([0, [1300, 700]], [131, [760, 200]], [280, [1620, 330]], [499, [760, 604]], [648, [760, 666]], [890, [760, 728]], [1024, [760, 790]], [1179, [760, 852]], [1420, [1500, 760]])}
      clicks={[]}
    />
  );
};

// ------------------------------------------------------------------ 13 · Recap + outro
const RECAP = [
  { t: "Projects", d: "Organize relevant context", at: 336 },
  { t: "Skills", d: "Streamline repeated tasks", at: 490 },
  { t: "Analytics", d: "Informed content decisions", at: 667 },
];
export const R13: React.FC<SceneProps> = ({ dur }) => {
  const f = useSceneFrame();
  const card = p01(f, 14, 16);
  const liked = f >= 1180, subbed = f >= 1250;
  return (
    <Shell
      f={f} dur={dur} n={13} chapter="Recap" url="claude.ai/new"
      screen={<Home f={f} />}
      over={
        <>
          <div style={{ position: "absolute", inset: 0, background: `rgba(24,22,18,${0.55 * card})` }} />
          <div style={{ position: "absolute", left: 260, top: 150, width: 1400, height: 800, borderRadius: 28, background: K.page, opacity: card, transform: `translateY(${(1 - card) * 30}px)`, boxShadow: "0 40px 100px rgba(0,0,0,0.35)", fontFamily: SANS, textAlign: "center" }}>
            <div style={{ marginTop: 50, display: "flex", justifyContent: "center" }}><Spark size={70} /></div>
            <div style={{ fontFamily: SERIF, fontSize: 56, marginTop: 14 }}>Not just a chatbot, a structured content assistant</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 44 }}>
              {RECAP.map((r) => {
                const o = p01(f, r.at, 12);
                return (
                  <div key={r.t} style={{ width: 360, padding: "28px 24px", borderRadius: 20, background: K.card, border: `1.5px solid ${K.border}`, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: K.clayDark }}>{r.t}</div>
                    <div style={{ fontSize: 22, color: K.sub, marginTop: 10 }}>{r.d}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 34, marginTop: 40, fontSize: 25, fontWeight: 600 }}>
              {["Review content", "Verify facts", "Keep your creativity original"].map((t, i) => (
                <div key={t} style={{ opacity: p01(f, 875 + i * 40, 10), display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: "#3E9B57", color: "#fff", display: "grid", placeItems: "center", fontSize: 20 }}>✓</span>{t}
                </div>
              ))}
            </div>
            <div style={{ opacity: p01(f, 1380, 14), fontFamily: SERIF, fontSize: 40, marginTop: 70, color: "#2B2A26" }}>See you in the next video. Thank you!</div>
          </div>
          {f >= 1094 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 862, display: "flex", justifyContent: "center", gap: 24, opacity: p01(f, 1094, 12), fontFamily: SANS }}>
              <div style={{ width: 200, height: 70, borderRadius: 35, background: liked ? K.clay : "#ECEAE4", color: liked ? "#fff" : K.text, display: "grid", placeItems: "center", fontSize: 27, fontWeight: 700, transform: `scale(${f >= 1180 && f < 1190 ? 0.94 : 1})` }}>{liked ? "Liked" : "Like"}</div>
              <div style={{ width: 260, height: 70, borderRadius: 35, background: subbed ? "#555" : "#E5322D", color: "#fff", display: "grid", placeItems: "center", fontSize: 27, fontWeight: 700, transform: `scale(${f >= 1250 && f < 1260 ? 0.94 : 1})` }}>{subbed ? "Subscribed" : "Subscribe"}</div>
            </div>
          ) : null}
        </>
      }
      cursor={path([0, [1300, 760]], [1100, [1300, 900]], [1170, [818, 897]], [1240, [1072, 897]], [1330, [1300, 960]])}
      clicks={[1180, 1250]}
    />
  );
};
