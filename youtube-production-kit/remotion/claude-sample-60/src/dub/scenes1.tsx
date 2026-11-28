// Dub tutorial, scenes 1-6. Every animation is anchored to a narration line (a(k, frac)), so the
// scenes follow the measured voice timing in src/dub/timing.ts without any time-warp.
import React from "react";
import { useCurrentFrame } from "remotion";
import type { SceneProps } from "../full/kit";
import { at } from "../full/kit";
import { Callout, ChatView, Msg, chatGeo, chatTyping } from "../real/chat";
import { Shell, path } from "../real/shell";
import { K, Ring, SERIF, p01 } from "../real/ui";
import { BI, BIcon, BoardShell, Card, Mark, MiniWave, Pill, Title, rise } from "./boards";
import {
  Dashboard, FE_CARD_Y, GEAR_PT, S, SETTINGS_PT, Settings, Studio, Thumb, VIDEOS, Watch, menuItemPt, setItemPt, setTabPt, sy,
} from "./studio";

const YT_TAB = [{ t: "YouTube", kind: "studio" as const }];
const STUDIO_TAB = [{ t: "Channel dashboard - Studio", kind: "studio" as const }];
const useA = (L: SceneProps["L"]) => (k: number, fr = 0) => at(L, k, fr);

// ------------------------------------------------------------------ 1 · Intro
const COUNTRIES = ["USA", "UK", "Canada", "Australia", "Nigeria", "Philippines", "Singapore", "UAE"];
const AGENDA = ["Translate the script", "Make the English voice", "Sync the audio", "Upload in Studio", "English title & description", "English subtitles"];
export const D01: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const partB = f >= a(4) - 8;
  const out = 1 - p01(f, a(4) - 14, 10);
  return (
    <BoardShell f={f} dur={dur} n={1} chapter="Intro">
      {!partB ? (
        <div style={{ position: "absolute", inset: 0, opacity: out }}>
          <div style={{ position: "absolute", left: 130, top: 200, ...rise(f, 6) }}>
            <div style={{ position: "relative" }}>
              <Thumb img={VIDEOS[0].img} w={820} />
              <div style={{ position: "absolute", right: 22, bottom: 20 }}><Pill tone="dark">Audio: Hindi only</Pill></div>
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 26, alignItems: "center", ...rise(f, a(0, 0.4)) }}>
              {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ width: 54, height: 54, borderRadius: 27, background: ["#E9B9A6", "#D97757", "#C9A27E", "#B4532F", "#E3C9A8"][i] }} />)}
              <span style={{ fontSize: 26, color: K.sub, marginLeft: 8 }}>Viewers who understand Hindi</span>
            </div>
          </div>
          <div style={{ position: "absolute", left: 1080, top: 190, width: 720, height: 560, ...rise(f, a(1)) }}>
            <div style={{ position: "absolute", left: 250, top: 170 }}><BIcon d={BI.globe} size={220} color={K.clay} /></div>
            {COUNTRIES.map((c, i) => {
              const ang = (i / COUNTRIES.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <div key={c} style={{ position: "absolute", left: 300 + Math.cos(ang) * 300, top: 260 + Math.sin(ang) * 230, transform: "translate(-50%,-50%)", ...rise(f, a(1, 0.15) + i * 6) }}>
                  <Pill>{c}</Pill>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 1150, top: 800, display: "flex", gap: 18, ...rise(f, a(2)) }}>
            <Pill tone="bad"><span style={{ textDecoration: "line-through" }}>Upload a second video</span></Pill>
            <Pill tone="ok">Same video</Pill>
          </div>
          <Card x={130} y={808} w={820} h={180} style={{ padding: "22px 28px", ...rise(f, a(3)) }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: K.sub, letterSpacing: 1 }}>MULTI-LANGUAGE AUDIO</div>
            {[["Hindi (original)", "#8C8A82", 1.3], ["English", K.clay, 2.1]].map(([t, c, s], i) => (
              <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, ...rise(f, a(3, 0.2) + i * 12, 10) }}>
                <div style={{ width: 210, fontSize: 22, fontWeight: 600 }}>{t}</div>
                <MiniWave w={520} h={34} color={c as string} seed={s as number} bars={70} />
              </div>
            ))}
          </Card>
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0 }}>
          <Card x={260} y={170} w={1400} h={700} style={{ textAlign: "center", ...rise(f, a(4) - 4, 30, 16) }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 64 }}>
              <Pill tone="dark">HI</Pill><span style={{ fontSize: 44, color: K.clay, lineHeight: "58px" }}>→</span><Pill tone="clay">EN</Pill>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 76, marginTop: 30, lineHeight: 1.1 }}>How to Dub Your YouTube Video<br />in English</div>
            <div style={{ fontSize: 28, color: K.sub, marginTop: 18 }}>Step by step · 2026</div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, margin: "44px 90px 0" }}>
              {AGENDA.map((t, i) => (
                <div key={t} style={{ ...rise(f, a(5, 0.08) + i * Math.round((L[5]?.d ?? 180) * 0.13), 14, 10) }}>
                  <Pill><span style={{ color: K.clay, fontWeight: 800 }}>{i + 1}</span>{t}</Pill>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", ...rise(f, a(6, 0.1)) }}>
            <Pill tone="clay">Real example: my 11:12 video, dubbed in English</Pill>
          </div>
        </div>
      )}
    </BoardShell>
  );
};

// ------------------------------------------------------------------ 2 · What is multi-language audio
export const D02: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const gear = a(3, 0.18), audioItem = a(3, 0.42), eng = a(3, 0.68);
  const menu: 0 | 1 | 2 = f >= gear && f < audioItem ? 1 : f >= audioItem && f < eng + 8 ? 2 : 0;
  const track: 0 | 1 = f >= eng ? 1 : 0;
  const m0 = menuItemPt(0), m2 = menuItemPt(2);
  return (
    <Shell
      f={f} dur={dur} n={2} chapter="What is multi-language audio?" url="youtube.com/watch?v=claude-ai-assistant" tabs={YT_TAB} side={null}
      screen={<Watch f={f} menu={menu} track={track} hoverItem={menu === 1 ? 0 : menu === 2 ? 2 : undefined} progress={0.18 + (f / dur) * 0.1} badge={track ? Math.min(p01(f, eng + 6, 10), 1 - p01(f, a(5), 12)) : 0} />}
      over={
        <>
          <Callout f={f} from={a(1)} to={a(2) + 10} x={1384} y={150} w={500} title="One video, nothing duplicated" lines={["Same link", "Same views", "Same comments"]} />
          <div style={{ position: "absolute", left: 1384, top: 520, width: 500, opacity: Math.min(p01(f, a(2), 12), 1 - p01(f, a(4) - 10, 10)) }}>
            <Card x={0} y={0} w={500} style={{ padding: "22px 26px", position: "relative" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: K.sub, letterSpacing: 1 }}>AUDIO TRACKS IN THIS VIDEO</div>
              {[["Hindi", "#8C8A82", 1.3], ["English", K.clay, 2.1]].map(([t, c, s], i) => (
                <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, ...rise(f, a(2, 0.25) + i * 14, 10) }}>
                  <div style={{ width: 100, fontSize: 22, fontWeight: 600 }}>{t}</div>
                  <MiniWave w={320} h={30} color={c as string} seed={s as number} bars={44} />
                </div>
              ))}
            </Card>
          </div>
          <Callout f={f} from={a(4)} to={a(5) + 6} x={1384} y={560} w={500} title="YouTube can pick the track that matches the viewer's language" />
          <Callout f={f} from={a(5)} to={dur} x={1384} y={560} w={500} tone="ok" title="One video, viewers in many countries" lines={["Hindi + English audience on the same upload"]} />
          <Ring x={GEAR_PT[0] - 24} y={GEAR_PT[1] - 24} w={48} h={48} r={24} f={f} from={a(3) - 6} to={gear + 4} />
        </>
      }
      cursor={path([0, [900, 560]], [a(3), [1100, 700]], [gear - 4, GEAR_PT], [audioItem - 4, m0], [eng - 4, m2], [eng + 30, [1000, 600]])}
      clicks={[gear, audioItem, eng]}
    />
  );
};

// ------------------------------------------------------------------ 3 · Who gets the feature
export const D03: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const cSet = a(2, 0.12), cChan = a(2, 0.45), cTab = a(2, 0.8);
  const setO = p01(f, cSet, 10);
  return (
    <Shell
      f={f} dur={dur} n={3} chapter="Who gets this feature?" url="studio.youtube.com/channel/dashboard" tabs={STUDIO_TAB} side={null}
      screen={
        <Studio active={0} settingsHover={f >= cSet - 20 && f < cSet}>
          <Dashboard />
          {f >= cSet ? <Settings o={setO} item={f >= cChan ? 1 : 0} tab={f >= cTab ? 2 : 0} open={f >= a(3) ? 1 : 0} /> : null}
        </Studio>
      }
      over={
        <>
          <Callout f={f} from={a(0, 0.2)} to={a(2)} x={1240} y={760} w={600} tone="warn" title="Not on every channel yet" />
          <Callout f={f} from={a(1)} to={a(2)} x={1240} y={880} w={600} title="Rolling out gradually · needs Advanced features" />
          <Ring x={330 + 290} y={sy(FE_CARD_Y(2))} w={1260 - 290 - 30} h={116} f={f} from={a(3)} to={a(4) + 4} />
          <Callout f={f} from={a(3, 0.3)} to={a(4)} x={1240} y={130} w={600} title="Check: Advanced features" lines={["Settings > Channel > Feature eligibility", "Start with phone verification if needed"]} />
          <Callout f={f} from={a(4)} to={a(5)} x={1240} y={130} w={600} tone="warn" title="No Audio option for your video?" lines={["The feature has not reached your channel yet"]} />
          <Callout f={f} from={a(5)} to={dur} x={1240} y={130} w={600} tone="ok" title="You can still add in English:" lines={["Title and description", "Subtitles"]} />
        </>
      }
      cursor={path([0, [1100, 620]], [cSet - 6, SETTINGS_PT], [cChan - 6, setItemPt(1)], [cTab - 6, setTabPt(2)], [a(3, 0.3), [1300, sy(FE_CARD_Y(2) + 58)]], [dur, [1300, sy(FE_CARD_Y(2) + 58)]])}
      clicks={[cSet, cChan, cTab]}
    />
  );
};

// ------------------------------------------------------------------ 4 · Auto dubbing vs your own dub
export const D04: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const warnO = p01(f, a(6), 14);
  return (
    <BoardShell f={f} dur={dur} n={4} chapter="Auto dubbing vs your own dub">
      <Title f={f} at={a(0)} kicker="TWO WAYS" text="How do you make the dub?" y={110} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * warnO }}>
        <Card x={120} y={300} w={800} h={560} style={{ padding: "40px 46px", ...rise(f, a(1)) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><BIcon d={BI.robot} size={56} /><div style={{ fontSize: 40, fontWeight: 700 }}>Automatic dubbing</div></div>
          <div style={{ fontSize: 26, color: K.sub, marginTop: 18, lineHeight: 1.4 }}>YouTube's AI creates the translated audio for you</div>
          <div style={{ display: "flex", gap: 14, marginTop: 30, ...rise(f, a(2)) }}><Pill>27 languages</Pill><Pill>Labelled "auto-dubbed"</Pill></div>
          <div style={{ display: "flex", gap: 14, marginTop: 26, alignItems: "center", fontSize: 26, ...rise(f, a(3)) }}><Mark ok /> Easy, almost no work</div>
          <div style={{ display: "flex", gap: 14, marginTop: 16, alignItems: "center", fontSize: 26, ...rise(f, a(3, 0.3)) }}><Mark ok={false} /> Less control over voice and translation</div>
        </Card>
        <Card x={1000} y={300} w={800} h={560} style={{ padding: "40px 46px", border: f >= a(5) ? `3px solid ${K.clay}` : undefined, ...rise(f, a(4)) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><BIcon d={BI.mic} size={56} /><div style={{ fontSize: 40, fontWeight: 700 }}>Your own dub</div></div>
          <div style={{ fontSize: 26, color: K.sub, marginTop: 18, lineHeight: 1.4 }}>You decide the script, the voice and the timing</div>
          {["Your translation", "Your voice", "Your timing"].map((t, i) => (
            <div key={t} style={{ display: "flex", gap: 14, marginTop: i ? 16 : 30, alignItems: "center", fontSize: 26, ...rise(f, a(4, 0.3) + i * 10) }}><Mark ok /> {t}</div>
          ))}
          <div style={{ marginTop: 30, ...rise(f, a(5)) }}><Pill tone="clay">Today's method · full control over quality</Pill></div>
        </Card>
      </div>
      {warnO > 0 ? (
        <div style={{ position: "absolute", left: 260, top: 330, width: 1400, opacity: warnO, transform: `translateY(${(1 - warnO) * 30}px)` }}>
          <Card x={0} y={0} w={1400} style={{ padding: "36px 44px", position: "relative", borderLeft: "8px solid #E0A100" }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>Auto dub already there? Delete it first</div>
            <div style={{ marginTop: 26, border: `1px solid ${S.line}`, borderRadius: 14, height: 90, display: "flex", alignItems: "center", padding: "0 28px", gap: 40, fontSize: 24, background: "#fff" }}>
              <b style={{ width: 160 }}>English</b>
              <span style={{ color: S.sub, width: 380 }}>Audio: Auto-dubbed · Published</span>
              <div style={{ flex: 1 }} />
              <span style={{ color: "#B3261E", fontWeight: 700, border: "2px solid #B3261E", borderRadius: 10, padding: "8px 18px", boxShadow: `0 0 ${12 + 8 * Math.sin(f / 6)}px rgba(217,69,61,0.35)` }}>DELETE</span>
            </div>
            <div style={{ fontSize: 24, color: K.sub, marginTop: 22 }}>Then upload your own English audio for that language.</div>
          </Card>
        </div>
      ) : null}
    </BoardShell>
  );
};

// ------------------------------------------------------------------ 5 · Step 1 translate
const ASK = "Is SRT file ki har line ka natural English translation do, word by word nahi. Har line apne time slot mein fit honi chahiye, isliye English short aur clear rakho.";
export const D05: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const typeAt = a(1, 0.2), send = a(4, 0.02);
  const cps = Math.max(10, (ASK.length * 30) / Math.max(60, send - typeAt - 14));
  const msgs: Msg[] = [
    { u: ASK, file: "my-video-hindi.srt", typeAt, send, cps },
    {
      at: send + 20, wps: 9,
      blocks: [
        { k: "p", t: "Ye rahi English translation. Har line apne Hindi time slot ke andar rakhi hai:" },
        {
          k: "table", head: ["Time", "Hindi", "English"],
          rows: [
            ["00:01", "Aapki video sirf Hindi mein hai…", "Your video is only in Hindi…"],
            ["00:06", "Lekin agar wahi video English mein…", "But if it also plays in English…"],
            ["00:11", "Dusri video upload karne ki zaroorat…", "No second upload needed."],
            ["00:15", "Ek hi video mein dusri language…", "One video, a second audio track."],
          ],
        },
        { k: "note", t: "Lines ko short rakha hai taaki dub natural speed par fit ho." },
      ],
    },
  ];
  const g = chatGeo(false, true);
  return (
    <Shell
      f={f} dur={dur} n={5} chapter="Step 1: Translate the script" url="claude.ai/chat/english-dub" side={{ active: "Chats" }}
      screen={<ChatView f={f} msgs={msgs} title="English dub translation" project="" narrow />}
      steps={[{ from: a(0), to: dur, n: 1, text: "Translate the script" }]}
      over={
        <>
          <Callout f={f} from={a(2)} to={a(3)} x={1320} y={200} w={560} title="Natural translation" lines={["Not word by word"]} />
          <Callout f={f} from={a(3)} to={a(5)} x={1320} y={200} w={560} tone="warn" title="Important trick: keep English lines short" lines={["English is often longer than Hindi", "Long lines will not fit the Hindi timing"]} />
          <Callout f={f} from={a(5)} to={a(6)} x={1320} y={200} w={560} title="Give the timing with every line" lines={["An SRT file already has it"]} />
          <Callout f={f} from={a(6)} to={a(7)} x={1320} y={200} w={560} tone="warn" title="Read it yourself and check:" lines={["Technical words", "Names", "Numbers"]} />
          <Callout f={f} from={a(7)} to={dur} x={1320} y={200} w={560} tone="ok" title="Better translation = more natural dub" />
        </>
      }
      cursor={path([0, [1000, 700]], [typeAt - 12, g.field], [send - 8, g.send], [send + 40, [1100, 640]])}
      clicks={[typeAt - 6, send]}
      typing={chatTyping(msgs)}
    />
  );
};

// ------------------------------------------------------------------ 6 · Step 2 English voice
const OPTS = [
  { ic: BI.mic, t: "Record yourself", d: "Best if your English is good" },
  { ic: BI.robot, t: "AI voice tool", d: "Paste the English script, get a voiceover" },
  { ic: BI.clone, t: "Clone your own voice", d: "The dub still sounds like you" },
];
const FILES = ["line_001.wav", "line_002.wav", "line_003.wav", "line_004.wav", "line_005.wav", "line_006.wav"];
export const D06: React.FC<SceneProps> = ({ dur, L }) => {
  const f = useCurrentFrame();
  const a = useA(L);
  const listO = p01(f, a(5) - 6, 14);
  return (
    <BoardShell f={f} dur={dur} n={6} chapter="Step 2: English voice" steps={[{ from: a(0), to: dur, n: 2, text: "Make the English voice" }]}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - listO }}>
        <Title f={f} at={a(0)} kicker="STEP 2" text="Get the English voice ready" />
        {OPTS.map((o, i) => (
          <Card key={o.t} x={120 + i * 570} y={330} w={530} h={360} style={{ padding: "40px 40px", ...rise(f, a(1 + i)) }}>
            <BIcon d={o.ic} size={70} />
            <div style={{ fontSize: 36, fontWeight: 700, marginTop: 24 }}>{o.t}</div>
            <div style={{ fontSize: 25, color: K.sub, marginTop: 14, lineHeight: 1.4 }}>{o.d}</div>
          </Card>
        ))}
        <div style={{ position: "absolute", left: 1260, top: 730, ...rise(f, a(4)) }}>
          <Pill tone="bad"><BIcon d={BI.shield} size={30} color="#B3261E" />Only your own voice, or with permission</Pill>
        </div>
      </div>
      {listO > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: listO }}>
          <Title f={f} at={a(5) - 6} kicker="ONE FILE PER LINE" text="Then listen to every line" />
          <Card x={120} y={310} w={1680} h={620} style={{ padding: "26px 40px" }}>
            {FILES.map((n, i) => {
              const checkAt = a(6, 0.05) + i * Math.round((L[6]?.d ?? 150) * 0.13);
              const bad = i === 3 || i === 5;
              const fixed = f >= a(7, 0.25 + (i === 5 ? 0.2 : 0));
              const checked = f >= checkAt;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 30, height: 94, borderBottom: i < 5 ? `1px solid ${K.border}` : "none", ...rise(f, a(5) + i * 6, 12, 10) }}>
                  <div style={{ width: 220, fontSize: 26, fontWeight: 600, fontFamily: "monospace" }}>{n}</div>
                  <MiniWave w={820} h={46} color={bad && checked && !fixed ? "#D6453D" : K.clay} seed={1.1 + i * 0.37} bars={90} />
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, fontSize: 24, opacity: checked ? 1 : 0 }}>
                    {bad && !fixed ? <><Mark ok={false} /><span style={{ color: "#B3261E" }}>{i === 3 ? "Repeated word" : "Noise at the end"}</span></> : <><Mark ok /><span style={{ color: "#1E7B3A" }}>{bad ? "Regenerated, clean" : "Clean"}</span></>}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      ) : null}
    </BoardShell>
  );
};
