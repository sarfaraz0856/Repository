// Dub tutorial, scenes 7-12 (sync board, YouTube Studio upload flow, checks, recap).
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../full/kit";
import { at } from "../full/kit";
import { Callout } from "../real/chat";
import { Shell } from "../real/shell";
import { hpath } from "../real/human";
import { K, Ring, SERIF, p01, typed } from "../real/ui";
import { BI, BIcon, BoardShell, Card, Mark, MiniWave, Pill, Title, rise } from "./boards";
import {
  ADD_LANG_PT, ALT_YES_PT, AudioUpload, GEAR_PT, LangPicker, LangRow, S, SubEditor, SubMenu, SubType, SubtitlesList, Studio, TitleDesc, VIDEOS, VideoDetails,
  VideoLanguages, Watch, Thumb, audioPublishPt, cellPt, langOptPt, menuItemPt, navPt, selectFilePt, stContinuePt, subMenuPt, subRowPt, sy, tdDescPt, tdPublishPt,
  tdTitlePt, withTimingPt, LROW_Y, LANG_COLS,
} from "./studio";

const useA = (L: SceneProps["L"]) => (k: number, fr = 0) => at(L, k, fr);
const STUDIO_TAB = [{ t: "Video languages - Studio", kind: "studio" as const }];
const HI_ROW: LangRow = { lang: "Hindi", note: "Video language", audio: "original", title: "published", subs: "published" };

// ------------------------------------------------------------------ 7 · Step 3 sync
const TL = { x: 120, y: 250, w: 1680, lab: 230 };
const HI = [[0.02, 0.13], [0.17, 0.12], [0.33, 0.15], [0.52, 0.11], [0.67, 0.14], [0.85, 0.11]];
export const D07: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const W = TL.w - TL.lab - 40;
  const fix = p01(f, a(2, 0.55), 16);
  const lanes = [
    { t: "Video", y: 0 },
    { t: "Hindi voice", y: 1 },
    { t: "English voice", y: 2 },
    { t: "Music", y: 3 },
    { t: "Sound effects", y: 4 },
  ];
  const laneY = (i: number) => TL.y + 70 + i * 104;
  const exportO = p01(f, a(6) - 4, 14);
  const switchO = Math.min(p01(f, a(5), 12), 1 - p01(f, a(6) - 8, 8));
  const fx = a(2, 0.55);
  const clipX = (k: number) => TL.x + TL.lab + HI[k][0] * W;
  const edge0 = clipX(3) + HI[3][1] * 1.25 * W - 4, edge1 = clipX(3) + HI[3][1] * 0.98 * W - 4;
  const engY = laneY(2) + 42;
  return (
    <BoardShell
      f={f} dur={dur} n={7} chapter="Step 3: Sync the audio" steps={[{ from: a(0), to: dur, n: 3, text: "Sync the audio" }]}
      cursor={hpath(
        [0, [960, 1000]], [a(0, 0.5), [700, laneY(0) + 42]], [a(1, 0.12), [clipX(0) + 30, engY]], [a(1, 0.12) + 46, [clipX(5) + 30, engY]],
        [a(2, 0.2), [clipX(3) + 90, engY]], [fx - 8, [edge0, engY]], [fx + 16, [edge1, engY], 18], [a(3, 0.4), [clipX(3) + 70, engY + 6]],
        [a(4, 0.25), [760, laneY(3) + 42]], [a(4, 0.65), [980, laneY(4) + 42]], [a(5, 0.3), [250, laneY(1) + 42]],
        [a(6, 0.15), [720, 457]], [a(6, 0.55), [720, 523]], [a(7, 0.15), [720, 590]], [a(7, 0.45), [760, 674]], [dur, [760, 674]],
      )}
      clicks={[]}
      holds={[[fx - 3, fx + 17]]}
    >
      <div style={{ position: "absolute", left: 120, top: 120, ...rise(f, a(0)) }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 3, color: K.clay }}>STEP 3 · MOST IMPORTANT</div>
        <div style={{ fontFamily: SERIF, fontSize: 56, marginTop: 4 }}>Put every English line where the Hindi line starts</div>
      </div>
      <Card x={TL.x} y={TL.y} w={TL.w} h={600} style={{ opacity: 1 - 0.7 * exportO }}>
        <div style={{ position: "absolute", left: TL.lab, right: 40, top: 22, height: 30, display: "flex", justifyContent: "space-between", fontSize: 17, color: K.faint, fontFamily: "monospace" }}>
          {["0:00", "2:00", "4:00", "6:00", "8:00", "10:00", "11:12"].map((t) => <span key={t}>{t}</span>)}
        </div>
        {lanes.map((ln, i) => {
          const show = i < 2 ? 1 : i === 2 ? p01(f, a(1), 12) : p01(f, a(4) + (i - 3) * 14, 12);
          const muted = i === 1 && switchO > 0;
          return (
            <div key={ln.t} style={{ position: "absolute", left: 0, right: 0, top: laneY(i) - TL.y, height: 84, opacity: show * (muted ? 0.35 : 1) }}>
              <div style={{ position: "absolute", left: 30, top: 26, fontSize: 22, fontWeight: 600, width: 190 }}>{ln.t}{muted ? <span style={{ color: K.faint, fontSize: 16 }}>  (muted)</span> : null}</div>
              <div style={{ position: "absolute", left: TL.lab, width: W, top: 8, height: 68, borderRadius: 12, background: "#F3F1EA" }} />
              {i === 0 ? (
                <div style={{ position: "absolute", left: TL.lab, width: W, top: 8, height: 68, display: "flex", gap: 3, overflow: "hidden", borderRadius: 12 }}>
                  {Array.from({ length: 11 }).map((_, k) => <Thumb key={k} img={VIDEOS[0].img} w={121} style={{ borderRadius: 0 }} />)}
                </div>
              ) : null}
              {i === 1 || i === 2
                ? HI.map(([s, d], k) => {
                    const long = i === 2 && k === 3;
                    const dd = i === 2 ? (long ? d * (1.25 - 0.27 * fix) : d * 0.92) : d;
                    const drop = i === 2 ? p01(f, a(1, 0.1) + k * 8, 10) : 1;
                    const over = long && fix < 1 && f >= a(2);
                    return (
                      <div key={k} style={{ position: "absolute", left: TL.lab + s * W, width: dd * W, top: 14 - (1 - drop) * 30, height: 56, opacity: drop, borderRadius: 10,
                        background: i === 1 ? "#8C8A82" : over ? "#D6453D" : K.clay, display: "flex", alignItems: "center", padding: "0 10px", overflow: "hidden", boxSizing: "border-box" }}>
                        <MiniWave w={dd * W - 20} h={30} color="rgba(255,255,255,0.75)" seed={1 + k * 0.4 + i} bars={Math.max(8, Math.round(dd * 120))} />
                        {long && fix > 0.2 ? <div style={{ position: "absolute", right: 6, top: -2, background: "#fff", color: K.text, fontWeight: 800, fontSize: 16, borderRadius: 6, padding: "1px 6px", opacity: fix }}>1.1x</div> : null}
                      </div>
                    );
                  })
                : null}
              {i >= 3 ? (
                <div style={{ position: "absolute", left: TL.lab, width: W, top: 14, height: 56, borderRadius: 10, background: i === 3 ? "#C9A27E" : "#7E8FA8", overflow: "hidden", padding: "0 10px", boxSizing: "border-box", display: "flex", alignItems: "center" }}>
                  <MiniWave w={W - 20} h={i === 3 ? 22 : 34} color="rgba(255,255,255,0.7)" seed={i * 1.7} bars={i === 3 ? 160 : 60} />
                </div>
              ) : null}
            </div>
          );
        })}
        {f >= a(1) && f < a(2) + 30
          ? HI.map(([s], k) => <div key={k} style={{ position: "absolute", left: TL.lab + s * W, top: laneY(1) - TL.y + 4, height: 180, borderLeft: `2px dashed ${K.clay}`, opacity: p01(f, a(1), 10) * (1 - p01(f, a(2), 30)) }} />)
          : null}
      </Card>
      <Callout f={f} from={a(2)} to={a(3)} x={1240} y={930 - 120} w={560} title="Line too long for its slot?" lines={["Speed it up a little, or shorten the translation"]} />
      <Callout f={f} from={a(3)} to={a(4)} x={1240} y={930 - 120} w={560} tone="warn" title="Not too fast" lines={["Above about 1.2x the voice sounds unnatural"]} />
      <Callout f={f} from={a(4) + 10} to={a(5)} x={1240} y={930 - 120} w={560} title="Add the same music and sound effects" lines={["as the original video"]} />
      <Callout f={f} from={a(5)} to={a(6)} x={1240} y={930 - 120} w={560} tone="ok" title="Viewer picks English: the whole audio switches" lines={["Not just the voice"]} />
      {exportO > 0 ? (
        <Card x={460} y={330} w={1000} h={470} style={{ padding: "36px 46px", opacity: exportO, transform: `translateY(${(1 - exportO) * 30}px)` }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Export the final English audio</div>
          {[
            ["Length", "11:12 = video 11:12", a(6, 0.1)],
            ["Loudness", "about the same as the original (-14 LUFS)", a(6, 0.5)],
            ["Format", "WAV or MP3, audio only (no video)", a(7, 0.1)],
          ].map(([k, v, t]) => (
            <div key={k as string} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 30, fontSize: 28, ...rise(f, t as number, 14, 10) }}>
              <Mark ok /><b style={{ width: 170 }}>{k}</b><span style={{ color: K.sub }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 34, ...rise(f, a(7, 0.4)) }}><Pill tone="dark"><BIcon d={BI.wave} size={30} color="#fff" />my-video-english-dub.wav</Pill></div>
        </Card>
      ) : null}
    </BoardShell>
  );
};

// ------------------------------------------------------------------ 8 · Step 4 upload in Studio
const DUB_FILE = "claude-ai-youtube-assistant-english-dub.wav";
export const D08: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const cNav = a(1, 0.55), cRow = a(3, 0.5), cAdd = a(4, 0.18), typeAt = a(4, 0.32), cEng = a(4, 0.78);
  const cAudio = a(5, 0.6), cSel = a(6, 0.15), upA = a(6, 0.3), upB = a(6, 0.92), cPub = a(7, 0.82);
  const page = f < cNav ? 0 : f < cRow ? 1 : 2;
  const rows: LangRow[] = [HI_ROW];
  if (f >= cEng) rows.push({ lang: "English", audio: f >= cPub ? "published" : "add", title: "add", subs: "add" });
  const modalO = f >= cAudio && f < cPub + 10 ? Math.min(p01(f, cAudio, 10), 1 - p01(f, cPub, 10)) : 0;
  const phase: 0 | 1 | 2 = f < upA ? 0 : f < upB ? 1 : 2;
  const cPlay = upB + 14;
  const play = phase === 2 && f >= cPlay ? Math.min(1, (f - cPlay) / Math.max(30, a(7, 0.7) - cPlay)) * 0.35 : 0;
  const pickO = f >= cAdd && f < cEng + 6 ? 1 : 0;
  const q = typed("Eng", f, typeAt, 7);
  const a1 = cellPt(1, "audio");
  return (
    <Shell
      human f={f} dur={dur} n={8} chapter="Step 4: Upload in YouTube Studio" url={page === 0 ? "studio.youtube.com/channel/dashboard" : page === 1 ? "studio.youtube.com/channel/translations" : "studio.youtube.com/video/translations"}
      tabs={STUDIO_TAB} side={null} steps={[{ from: a(0), to: dur, n: 4, text: "Upload in YouTube Studio" }]}
      screen={
        <Studio active={page === 0 ? 0 : 4} hover={f >= cNav - 24 && f < cNav ? 4 : undefined}>
          {page === 0 ? null : page === 1 ? <SubtitlesList hover={f >= cRow - 24 ? 0 : undefined} /> : <VideoLanguages rows={rows} hl={f >= a(5) && f < cAudio ? { row: 1, col: "audio" } : undefined} />}
          {page === 0 ? <DashboardLite /> : null}
          {pickO ? <LangPicker f={f} query={q} focus={f >= typeAt - 4} hover={f >= cEng - 20 ? 0 : undefined} /> : null}
          {modalO > 0 ? <AudioUpload o={modalO} phase={phase} p={phase === 1 ? (f - upA) / (upB - upA) : 1} play={play} pressed={f >= cPub && f < cPub + 5} file={DUB_FILE} /> : null}
        </Studio>
      }
      over={
        <>
          <Callout f={f} from={a(2)} to={a(3)} x={330} y={sy(470)} w={560} title="Some accounts show it as 'Languages'" />
          <Ring x={a1[0] - 46} y={a1[1] - 26} w={92} h={52} r={10} f={f} from={a(5)} to={cAudio + 4} />
          <Callout f={f} from={a(7, 0.1)} to={a(7, 0.75)} x={1380} y={140} w={500} tone="warn" title="Listen first: is the sync right?" />
          <Callout f={f} from={a(8)} to={dur} x={1300} y={sy(560)} w={560} tone="ok" title="English audio track added" lines={["Viewers can now pick English"]} />
        </>
      }
      cursor={hpath(
        [0, [1000, 600]], [a(1, 0.1), [700, 420]], [cNav - 8, navPt(4)], [a(2, 0.35), [640, sy(500)]], [a(3, 0.15), [subRowPt(0)[0] + 260, subRowPt(0)[1] + 190]], [a(3, 0.32), [subRowPt(0)[0] + 120, subRowPt(0)[1] + 95]],
        [cRow - 10, subRowPt(0)], [cAdd - 8, ADD_LANG_PT], [cEng - 10, langOptPt(0)],
        [a(5, 0.3), [a1[0], a1[1] + 60]], [cAudio - 6, a1], [cSel - 8, selectFilePt], [a(6, 0.6), [1150, 640]], [cPlay - 7, [479, sy(531)]], [a(7, 0.75), [900, sy(560)]],
        [cPub - 8, audioPublishPt], [a(8, 0.3), [1480, sy(600)]], [dur, [1480, sy(600)]],
      )}
      clicks={[cNav, cRow, cAdd, cEng, cAudio, cSel, cPlay, cPub]}
      typing={[{ at: typeAt, len: 14 }]}
    />
  );
};
const DashboardLite: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 330, top: 100, fontSize: 32, fontWeight: 700 }}>Channel dashboard</div>
    <div style={{ position: "absolute", left: 330, top: 170, width: 620, height: 520, border: `1px solid ${S.line}`, borderRadius: 14, padding: 26, boxSizing: "border-box" }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>Latest video performance</div>
      <Thumb img={VIDEOS[0].img} w={566} style={{ marginTop: 18 }} />
    </div>
  </>
);

// ------------------------------------------------------------------ 9 · Step 5 English title & description
const EN_T = "How to Turn Claude AI Into Your YouTube Content Assistant (Step by Step Process)";
const EN_D = "Don't use Claude AI like a normal chatbot. In this video I show you, step by step, how to set up Claude as your personal YouTube content assistant.\n\nChapters\n0:00 Intro\n0:55 What is Claude AI?\n1:43 Why Projects matter\n2:40 Create a Project";
const HI_D = "Claude AI ko sirf ek normal chatbot ki tarah use mat kijiye. Is video mein maine step by step dikhaya hai…\n\nChapters\n0:00 Intro\n0:55 Claude AI kya hai?\n1:43 Projects kyun zaroori hain?";
export const D09: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const cAdd = a(1, 0.6), tA = a(2, 0.08), tB = a(2, 0.92), cDesc = a(3, 0.04), dA = a(3, 0.1), dB = a(3, 0.95), cPub = a(5, 0.35);
  const rows: LangRow[] = [HI_ROW, { lang: "English", audio: "published", title: f >= cPub ? "published" : "add", subs: "add" }];
  const o = f >= cAdd && f < cPub + 10 ? Math.min(p01(f, cAdd, 10), 1 - p01(f, cPub, 10)) : 0;
  const title = typed(EN_T, f, tA, (EN_T.length * 30) / Math.max(30, tB - tA));
  const desc = typed(EN_D, f, dA, (EN_D.length * 30) / Math.max(30, dB - dA));
  const t1 = cellPt(1, "title");
  return (
    <Shell
      human f={f} dur={dur} n={9} chapter="Step 5: English title & description" url="studio.youtube.com/video/translations" tabs={STUDIO_TAB} side={null}
      steps={[{ from: a(0), to: dur, n: 5, text: "English title & description" }]}
      screen={
        <Studio active={4}>
          <VideoLanguages rows={rows} hl={f >= a(0, 0.5) && f < cAdd ? { row: 1, col: "title" } : undefined} />
          {o > 0 ? <TitleDesc o={o} f={f} title={title} desc={desc} focus={f < cDesc ? (f >= tA - 6 ? "t" : null) : "d"} pressed={f >= cPub && f < cPub + 5} origT={VIDEOS[0].t} origD={HI_D} /> : null}
        </Studio>
      }
      over={
        <>
          <Ring x={t1[0] - 46} y={t1[1] - 26} w={92} h={52} r={10} f={f} from={a(1)} to={cAdd + 4} />
          <Callout f={f} from={a(2, 0.2)} to={a(3)} x={1070} y={96} w={560} title="Use the words English viewers search for" />
          <Callout f={f} from={a(3, 0.2)} to={a(4)} x={1070} y={96} w={560} title="English summary, chapters and links" />
          <Callout f={f} from={a(4)} to={a(5)} x={1070} y={96} w={560} tone="ok" title="Found in English search" lines={["English viewers see the title in English"]} />
        </>
      }
      cursor={hpath([0, [1100, 700]], [a(0, 0.6), [t1[0] - 220, t1[1] + 10]], [cAdd - 8, t1], [tA - 10, tdTitlePt], [cDesc - 8, tdDescPt], [a(4, 0.3), [tdDescPt[0] + 160, tdDescPt[1] + 120]], [cPub - 8, tdPublishPt], [dur, [1300, 760]])}
      clicks={[cAdd, tA - 6, cDesc, cPub]}
      typing={[{ at: tA, len: tB - tA }, { at: dA, len: dB - dA }]}
    />
  );
};

// ------------------------------------------------------------------ 10 · Step 6 English subtitles
const CUES: [string, string][] = [
  ["00:00:01,200 --> 00:00:04,421", "If you're a YouTube creator, you know how much work goes into a good video."],
  ["00:00:04,990 --> 00:00:08,100", "First, you have to find a good topic."],
  ["00:00:08,100 --> 00:00:13,400", "Then you research, write the script, prepare the title and thumbnail,"],
  ["00:00:13,400 --> 00:00:16,700", "and after publishing, you analyze its performance too."],
];
export const D10: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const cAdd = a(1, 0.3), cUp = a(1, 0.75), cWith = a(2, 0.15), cCont = a(2, 0.4), cPub = a(2, 0.9), cYes = a(4, 0.45);
  const details = f >= a(4);
  const rows: LangRow[] = [HI_ROW, { lang: "English", audio: "published", title: "published", subs: f >= cPub ? "published" : "add" }];
  const menuO = f >= cAdd && f < cUp + 4 ? 1 : 0;
  const typeO = f >= cUp && f < cCont + 8 ? Math.min(p01(f, cUp, 10), 1 - p01(f, cCont, 8)) : 0;
  const edO = f >= cCont && f < cPub + 10 ? Math.min(p01(f, cCont, 10), 1 - p01(f, cPub, 10)) : 0;
  const s1 = cellPt(1, "subs");
  return (
    <Shell
      human f={f} dur={dur} n={10} chapter="Step 6: English subtitles" url={details ? "studio.youtube.com/video/edit" : "studio.youtube.com/video/translations"} tabs={STUDIO_TAB} side={null}
      steps={[{ from: a(0), to: dur, n: 6, text: "English subtitles" }]}
      screen={
        <Studio active={details ? 1 : 4}>
          {details ? <VideoDetails yes={f >= cYes} /> : <VideoLanguages rows={rows} hl={f >= a(0, 0.5) && f < cAdd ? { row: 1, col: "subs" } : undefined} />}
          {!details && menuO ? <SubMenu o={1} hover={f >= cUp - 16 ? 0 : undefined} /> : null}
          {!details && typeO > 0 ? <SubType o={typeO} sel={f >= cWith ? 0 : -1} pressed={f >= cCont && f < cCont + 5} /> : null}
          {!details && edO > 0 ? <SubEditor o={edO} f={f - cCont} cues={CUES} pressed={f >= cPub && f < cPub + 5} file="claude-ai-youtube-assistant-english.srt" /> : null}
        </Studio>
      }
      over={
        <>
          <Ring x={s1[0] - 46} y={s1[1] - 26} w={92} h={52} r={10} f={f} from={a(0, 0.5)} to={cAdd + 4} />
          <Callout f={f} from={a(3)} to={a(4)} x={1300} y={sy(560)} w={560} tone="ok" title="Subtitles help people who watch without sound" />
          <Ring x={320} y={sy(428)} w={1000} h={176} r={14} f={f} from={a(4, 0.2)} to={dur} />
          <Callout f={f} from={a(4, 0.3)} to={dur} x={1370} y={sy(470)} w={480} tone="warn" title="Used an AI voice or a voice clone?" lines={["Answer Yes here. It is the safe choice."]} />
        </>
      }
      cursor={hpath([0, [1100, 700]], [a(0, 0.6), [s1[0] - 240, s1[1] + 8]], [cAdd - 8, s1], [cUp - 8, subMenuPt(0)], [cWith - 8, withTimingPt], [cCont - 8, stContinuePt], [cPub - 8, tdPublishPt], [a(3, 0.4), [1500, sy(590)]], [a(4, 0.1), [800, 600]], [cYes - 8, ALT_YES_PT], [dur, [700, 700]])}
      clicks={[cAdd, cUp, cWith, cCont, cPub, cYes]}
    />
  );
};

// ------------------------------------------------------------------ 11 · Check + common mistakes
const MISTAKES = [
  "Audio length different from the video",
  "No background music in the English track",
  "Music or content that is not in the original audio",
  "Using the AI translation without reading it",
];
export const D11: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const board = f >= a(3) - 6;
  const gear = a(1, 0.15), audioItem = a(1, 0.38), eng = a(1, 0.62);
  const menu: 0 | 1 | 2 = f >= gear && f < audioItem ? 1 : f >= audioItem && f < eng + 8 ? 2 : 0;
  const track: 0 | 1 = f >= eng ? 1 : 0;
  const seek = [a(2, 0.12), a(2, 0.42), a(2, 0.72)];
  const SEEK = [0.04, 0.5, 0.95];
  const barY = sy(22 + 720 - 58 + 2), barX = (m: number) => 70 + 20 + m * 1240;
  const si = seek.filter((c) => f >= c).length - 1;
  const prog = si < 0 ? 0.05 : Math.min(0.99, SEEK[si] + (f - seek[si]) * 0.00004);
  if (board)
    return (
      <BoardShell
        f={f} dur={dur} n={11} chapter="Check + common mistakes"
        cursor={hpath([0, [1268, barY]], [a(3, 0.3), [900, 260]], ...MISTAKES.map((_, i) => [a(4 + i, 0.25), [120 + (i % 2) * 850 + 470, 330 + Math.floor(i / 2) * 290 + 170]] as [number, [number, number]]), [dur, [1060, 950]])}
      >
        <Title f={f} at={a(3) - 6} kicker="AVOID THESE" text="Common mistakes" />
        {MISTAKES.map((m, i) => (
          <Card key={m} x={120 + (i % 2) * 850} y={330 + Math.floor(i / 2) * 290} w={810} h={250} style={{ padding: "40px 44px", ...rise(f, a(4 + i)) }}>
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <Mark ok={false} size={52} />
              <div><div style={{ fontSize: 24, fontWeight: 700, color: K.clay }}>MISTAKE {i + 1}</div><div style={{ fontSize: 34, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>{m}</div></div>
            </div>
            {i === 2 ? <div style={{ fontSize: 22, color: K.sub, marginTop: 18, marginLeft: 74 }}>YouTube may remove that audio track</div> : null}
          </Card>
        ))}
      </BoardShell>
    );
  return (
    <Shell
      human f={f} dur={dur} n={11} chapter="Check + common mistakes" url="youtube.com/watch?v=claude-ai-assistant" tabs={[{ t: "YouTube", kind: "studio" }]} side={null}
      screen={<Watch f={f} menu={menu} track={track} hoverItem={menu === 1 ? 0 : menu === 2 ? 2 : undefined} progress={prog} badge={track ? p01(f, eng + 6, 10) : 0} markers={f >= seek[0] ? f - seek[0] + 1 : 0} markGap={seek[1] - seek[0]} />}
      over={<Callout f={f} from={a(0, 0.2)} to={a(1)} x={1384} y={560} w={500} title="Open your video and test the English track" />}
      cursor={hpath([0, [900, 560]], [a(0, 0.3), [1500, 640]], [gear - 6, GEAR_PT], [audioItem - 6, menuItemPt(0)], [eng - 6, menuItemPt(2)], [eng + 34, [1000, 600]], ...seek.map((c, i) => [c - 7, [barX(SEEK[i]), barY]] as [number, [number, number]]), [dur, [1268, barY]])}
      clicks={[gear, audioItem, eng, ...seek]}
    />
  );
};

// ------------------------------------------------------------------ 12 · Recap + outro
const LIKE_PT = [797, 380] as const, SUB_PT = [1083, 380] as const;
const RECAP = ["Check multi-language audio on your channel", "Translate the script", "Make the English voice", "Sync it with the video", "Final audio with music", "Upload audio, title, description, subtitles"];
export const D12: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const when = [a(1), a(1, 0.55), a(2), a(2, 0.35), a(2, 0.7), a(3)];
  const outro = f >= a(5) - 6;
  const cLike = a(5, 0.3), cSub = a(5, 0.62);
  const liked = f >= cLike, subbed = f >= cSub;
  return (
    <BoardShell
      f={f} dur={dur} n={12} chapter="Recap"
      cursor={hpath(
        [0, [960, 1000]], ...when.map((w, i) => [w + 8, [460, 382 + i * 96]] as [number, [number, number]]), [a(4, 0.3), [1530, 520]],
        [cLike - 8, [LIKE_PT[0], LIKE_PT[1]]], [cSub - 8, [SUB_PT[0], SUB_PT[1]]], [a(6, 0.3), [1260, 700]], [dur, [1260, 700]],
      )}
      clicks={[cLike, cSub]}
    >
      {!outro ? (
        <>
          <Title f={f} at={a(0)} kicker="RECAP" text="Dub your video in 6 steps" />
          <Card x={120} y={300} w={1080} h={650} style={{ padding: "34px 46px" }}>
            {RECAP.map((r, i) => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 22, height: 96, borderBottom: i < 5 ? `1px solid ${K.border}` : "none", ...rise(f, when[i], 16, 10) }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: K.clay, color: "#fff", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 800 }}>{i + 1}</div>
                <div style={{ fontSize: 30, fontWeight: 600 }}>{r}</div>
              </div>
            ))}
          </Card>
          <Card x={1260} y={300} w={540} h={650} style={{ padding: "50px 40px", textAlign: "center", ...rise(f, a(4)) }}>
            <Thumb img={VIDEOS[0].img} w={460} />
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40 }}><Pill tone="dark">Hindi</Pill><Pill tone="clay">English</Pill></div>
            <div style={{ fontFamily: SERIF, fontSize: 48, marginTop: 34, lineHeight: 1.15 }}>1 video,<br />2 languages</div>
          </Card>
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 26, ...rise(f, a(5) - 6) }}>
            <Pill tone={liked ? "clay" : "plain"} style={{ fontSize: 34, padding: "18px 36px", width: 220, justifyContent: "center", boxSizing: "border-box" }}>{liked ? "Liked" : "Like"}</Pill>
            <Pill tone={subbed ? "plain" : "dark"} style={{ fontSize: 34, padding: "18px 36px", width: 300, justifyContent: "center", boxSizing: "border-box", transform: `scale(${1 + 0.06 * Math.max(0, Math.sin((f - a(5)) / 6)) * (f < cSub ? 1 : 0)})` }}>{subbed ? "Subscribed" : "Subscribe"}</Pill>
          </div>
          <div style={{ fontSize: 30, color: K.sub, marginTop: 30, ...rise(f, a(5, 0.4)) }}>More YouTube and AI tutorials every week</div>
          <div style={{ fontFamily: SERIF, fontSize: 84, marginTop: 70, textAlign: "center", lineHeight: 1.15, ...rise(f, a(6), 30, 18) }}>See you in the next video.<br /><span style={{ color: K.clay }}>Thank you!</span></div>
        </div>
      )}
    </BoardShell>
  );
};
export { LROW_Y, LANG_COLS, MiniWave };
