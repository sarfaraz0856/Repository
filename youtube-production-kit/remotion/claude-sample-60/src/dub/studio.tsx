// Recreated YouTube Studio + watch page screens for the dub tutorial. Coordinates are absolute
// (screen space, 1920x1080, page starts at Y0 below the browser chrome) so the cursor can be
// pointed at real element positions. Interface is a recreation for the demo, not a screenshot.
import React from "react";
import { Img, staticFile } from "remotion";
import { Caret, K, SANS, Y0, p01 } from "../real/ui";

export const S = {
  bg: "#FFFFFF", page: "#F9F9F9", line: "#E5E5E5", text: "#0F0F0F", sub: "#606060", faint: "#909090",
  blue: "#065FD4", red: "#E5322D", hover: "#F2F2F2", green: "#2BA640", dark: "#0F0F0F",
};
export const sy = (y: number) => Y0 + y; // page y -> screen y

const Ico: React.FC<{ d: string; size?: number; color?: string; w?: number }> = ({ d, size = 26, color = S.sub, w = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
export const SI = {
  dash: "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z",
  content: "M4 6h16v12H4zM10 9l5 3l-5 3z",
  analytics: "M5 20V10M12 20V4M19 20v-7",
  community: "M5 5h14v10H9l-4 4z",
  subtitles: "M3 6h18v12H3zM7 11h4M13 11h4M7 14h7M16 14h1",
  copyright: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM15 9.5a3.5 3.5 0 1 0 0 5",
  earn: "M12 3v18M16 7H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8",
  custom: "M4 20l6-6M14 4l6 6l-8 8l-6-6z",
  audio: "M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3a3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3a3 3 0 0 1 3 3z",
  settings: "M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM19 12l2-1l-1-3l-2 0l-1-2l1-2l-3-1l-1 2h-2l-1-2l-3 1l1 2l-1 2l-2 0l-1 3l2 1v0l-2 1l1 3l2 0l1 2l-1 2l3 1l1-2h2l1 2l3-1l-1-2l1-2l2 0l1-3z",
  feedback: "M5 5h14v10H9l-4 4zM12 8v3M12 13v.5",
  search: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14zM20 20l-4-4",
  menu: "M4 7h16M4 12h16M4 17h16",
  upload: "M12 16V5M7 10l5-5l5 5M5 19h14",
  check: "M5 12l4 4l10-10",
  back: "M15 5l-7 7l7 7",
  more: "M12 6v.5M12 12v.5M12 18v.5",
  gear: "M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
};
export { Ico };

/** Red play mark + "Studio" wordmark (generic recreation). */
export const StudioLogo: React.FC<{ size?: number }> = ({ size = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 * size }}>
    <div style={{ width: 38 * size, height: 27 * size, borderRadius: 8 * size, background: S.red, display: "grid", placeItems: "center" }}>
      <div style={{ width: 0, height: 0, borderLeft: `${11 * size}px solid #fff`, borderTop: `${7 * size}px solid transparent`, borderBottom: `${7 * size}px solid transparent`, marginLeft: 3 * size }} />
    </div>
    <span style={{ fontSize: 26 * size, fontWeight: 700, letterSpacing: -0.6, color: S.text }}>Studio</span>
  </div>
);

export const Avatar: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: "linear-gradient(135deg,#D97757,#B4532F)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: size * 0.46, fontFamily: SANS, ...style }}>S</div>
);

export const NAV = ["Dashboard", "Content", "Analytics", "Community", "Subtitles", "Copyright", "Earn", "Customization", "Audio library"] as const;
const NAV_IC = [SI.dash, SI.content, SI.analytics, SI.community, SI.subtitles, SI.copyright, SI.earn, SI.custom, SI.audio];
export const NAV_W = 290;
export const navY = (i: number) => 262 + i * 56; // page y of item centre
export const navPt = (i: number) => [150, sy(navY(i))] as [number, number];
export const SETTINGS_PT = [150, sy(988 - 116)] as [number, number];

const TopBar: React.FC<{ search?: string }> = ({ search }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 72, background: S.bg, borderBottom: `1px solid ${S.line}`, display: "flex", alignItems: "center", padding: "0 26px", gap: 22 }}>
    <Ico d={SI.menu} color={S.text} />
    <StudioLogo />
    <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 720, height: 46, borderRadius: 10, border: `1px solid ${S.line}`, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", color: S.faint, fontSize: 18 }}>
        <Ico d={SI.search} size={22} /> {search ?? "Search across your channel"}
      </div>
    </div>
    <div style={{ border: `1px solid ${S.line}`, borderRadius: 10, padding: "8px 16px", fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: S.red, fontSize: 22, lineHeight: 0 }}>+</span> CREATE
    </div>
    <Avatar size={42} />
  </div>
);

const Nav: React.FC<{ active?: number; hover?: number; settingsHover?: boolean }> = ({ active = 0, hover, settingsHover }) => (
  <div style={{ position: "absolute", left: 0, top: 72, bottom: 0, width: NAV_W, background: S.bg, borderRight: `1px solid ${S.line}` }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22 }}>
      <Avatar size={88} />
      <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }}>Your channel</div>
      <div style={{ fontSize: 15, color: S.sub, marginTop: 2 }}>Sujan</div>
    </div>
    {NAV.map((n, i) => (
      <div key={n} style={{ position: "absolute", left: 10, right: 10, top: navY(i) - 72 - 24, height: 48, borderRadius: 10, display: "flex", alignItems: "center", gap: 18, padding: "0 18px", fontSize: 18,
        background: i === active ? S.hover : i === hover ? "#F7F7F7" : "transparent", color: i === active ? S.red : S.text, fontWeight: i === active ? 600 : 400 }}>
        <Ico d={NAV_IC[i]} size={24} color={i === active ? S.red : S.sub} /> <span style={{ color: S.text }}>{n}</span>
      </div>
    ))}
    {[["Settings", SI.settings], ["Send feedback", SI.feedback]].map(([t, d], i) => (
      <div key={t} style={{ position: "absolute", left: 10, right: 10, top: 988 - 72 - 140 + i * 56, height: 48, borderRadius: 10, display: "flex", alignItems: "center", gap: 18, padding: "0 18px", fontSize: 18, background: i === 0 && settingsHover ? S.hover : "transparent" }}>
        <Ico d={d} size={24} /> {t}
      </div>
    ))}
  </div>
);

/** Studio page frame: top bar + left nav + main area (children positioned in screen-x, page-y). */
export const Studio: React.FC<{ active?: number; hover?: number; settingsHover?: boolean; children?: React.ReactNode }> = ({ active, hover, settingsHover, children }) => (
  <div style={{ position: "absolute", inset: 0, background: S.bg, fontFamily: SANS, color: S.text }}>
    <TopBar />
    <Nav active={active} hover={hover} settingsHover={settingsHover} />
    <div style={{ position: "absolute", left: NAV_W, right: 0, top: 72, bottom: 0, background: S.bg }}>
      <div style={{ position: "absolute", left: -NAV_W, top: -72, width: 1920, height: 988 }}>{children}</div>
    </div>
  </div>
);

export const VIDEOS = [
  { t: "Claude AI Ko YouTube Content Assistant Kaise Banaye (Step by Step 2026)", img: "dub/thumbA.png", d: "11:12", langs: "1", mod: "Nov 20, 2026" },
  { t: "Claude vs ChatGPT: YouTube Creators Ke Liye Kaun Better Hai?", img: "dub/thumbB.png", d: "9:48", langs: "1", mod: "Nov 12, 2026" },
  { t: "Mobile Se YouTube Channel Kaise Banaye 2026 | Full Guide", img: "dub/thumbC.png", d: "12:05", langs: "1", mod: "Nov 02, 2026" },
];
export const Thumb: React.FC<{ img: string; w: number; d?: string; style?: React.CSSProperties }> = ({ img, w, d, style }) => (
  <div style={{ position: "relative", width: w, height: (w * 9) / 16, borderRadius: 8, overflow: "hidden", background: "#222", flexShrink: 0, ...style }}>
    <Img src={staticFile(img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    {d ? <div style={{ position: "absolute", right: 6, bottom: 6, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 4, padding: "1px 5px" }}>{d}</div> : null}
  </div>
);

/** Dashboard (simple). */
export const Dashboard: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 330, top: 100, fontSize: 32, fontWeight: 700 }}>Channel dashboard</div>
    <div style={{ position: "absolute", left: 330, top: 170, width: 620, height: 520, border: `1px solid ${S.line}`, borderRadius: 14, padding: 26, boxSizing: "border-box" }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>Latest video performance</div>
      <Thumb img={VIDEOS[0].img} w={566} style={{ marginTop: 18 }} />
      <div style={{ fontSize: 18, marginTop: 14, lineHeight: 1.35 }}>{VIDEOS[0].t}</div>
    </div>
    <div style={{ position: "absolute", left: 980, top: 170, width: 600, height: 250, border: `1px solid ${S.line}`, borderRadius: 14, padding: 26, boxSizing: "border-box" }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>Channel analytics</div>
      {[["Views (last 28 days)", "12.4K"], ["Watch time (hours)", "640"], ["Subscribers", "+218"]].map(([a, b], i) => (
        <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: 18, marginTop: i ? 14 : 22, color: S.sub }}><span>{a}</span><b style={{ color: S.text }}>{b}</b></div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 980, top: 440, width: 600, height: 250, border: `1px solid ${S.line}`, borderRadius: 14, padding: 26, boxSizing: "border-box" }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>Creator Insider</div>
      <div style={{ fontSize: 17, color: S.sub, marginTop: 14, lineHeight: 1.5 }}>Reach viewers in more languages with multi-language audio and translated titles.</div>
    </div>
  </>
);

/** Channel subtitles list. Row centre (screen) = rowPt(i). */
export const SUB_ROW_Y = (i: number) => 290 + i * 128;
export const subRowPt = (i: number) => [760, sy(SUB_ROW_Y(i) + 56)] as [number, number];
export const SubtitlesList: React.FC<{ hover?: number }> = ({ hover }) => (
  <>
    <div style={{ position: "absolute", left: 330, top: 100, fontSize: 32, fontWeight: 700 }}>Channel subtitles</div>
    <div style={{ position: "absolute", left: 330, top: 160, display: "flex", gap: 34, fontSize: 18, color: S.sub }}>
      {["All", "Drafts", "Published"].map((t, i) => <div key={t} style={{ paddingBottom: 12, borderBottom: i === 0 ? `3px solid ${S.text}` : "none", color: i === 0 ? S.text : S.sub, fontWeight: i === 0 ? 600 : 400 }}>{t}</div>)}
    </div>
    <div style={{ position: "absolute", left: 330, right: 60, top: 230, height: 50, borderTop: `1px solid ${S.line}`, borderBottom: `1px solid ${S.line}`, display: "flex", alignItems: "center", fontSize: 16, color: S.sub }}>
      <span style={{ width: 1020 }}>Video</span><span style={{ width: 220 }}>Languages</span><span>Modified on</span>
    </div>
    {VIDEOS.map((v, i) => (
      <div key={v.t} style={{ position: "absolute", left: 330, right: 60, top: SUB_ROW_Y(i), height: 116, display: "flex", alignItems: "center", gap: 22, borderBottom: `1px solid ${S.line}`, background: hover === i ? S.hover : "transparent", fontSize: 18 }}>
        <Thumb img={v.img} w={176} d={v.d} />
        <div style={{ width: 800, lineHeight: 1.35 }}>{v.t}</div>
        <div style={{ width: 220 }}>{v.langs}</div>
        <div style={{ color: S.sub }}>{v.mod}</div>
      </div>
    ))}
  </>
);

/** Per-video languages page. */
export type Cell = "add" | "original" | "published" | "uploading" | "auto" | "none";
export type LangRow = { lang: string; note?: string; audio: Cell; title: Cell; subs: Cell };
export const LANG_COLS = { lang: 330, mod: 690, audio: 930, title: 1200, subs: 1540 };
export const LROW_Y = (i: number) => 310 + i * 86;
export const cellPt = (row: number, col: "audio" | "title" | "subs") => [LANG_COLS[col] + 40, sy(LROW_Y(row) + 43)] as [number, number];
export const ADD_LANG_PT = [440, sy(194)] as [number, number];
const CellView: React.FC<{ c: Cell; hl?: boolean }> = ({ c, hl }) => {
  if (c === "add") return <span style={{ color: S.blue, fontWeight: 700, fontSize: 17, letterSpacing: 0.4, background: hl ? "#E8F0FE" : "transparent", padding: "8px 14px", borderRadius: 8 }}>ADD</span>;
  if (c === "original") return <span style={{ color: S.sub }}>Original</span>;
  if (c === "published") return <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ico d={SI.check} size={22} color={S.green} w={2.6} />Published</span>;
  if (c === "uploading") return <span style={{ color: S.sub }}>Processing…</span>;
  if (c === "auto") return <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.3 }}><span>Auto-dubbed</span><span style={{ color: S.sub, fontSize: 15 }}>Published</span></span>;
  return <span style={{ color: S.faint }}>-</span>;
};
export const VideoLanguages: React.FC<{ rows: LangRow[]; hl?: { row: number; col: "audio" | "title" | "subs" }; video?: number }> = ({ rows, hl, video = 0 }) => (
  <>
    <div style={{ position: "absolute", left: 330, top: 92, display: "flex", alignItems: "center", gap: 18 }}>
      <Ico d={SI.back} color={S.text} />
      <Thumb img={VIDEOS[video].img} w={112} />
      <div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>Video languages</div>
        <div style={{ fontSize: 16, color: S.sub, marginTop: 4, width: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{VIDEOS[video].t}</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 330, top: 170, height: 48, padding: "0 22px", borderRadius: 10, background: S.dark, color: "#fff", display: "flex", alignItems: "center", fontSize: 17, fontWeight: 700, letterSpacing: 0.4 }}>ADD LANGUAGE</div>
    <div style={{ position: "absolute", left: 330, right: 60, top: 254, height: 50, borderTop: `1px solid ${S.line}`, borderBottom: `1px solid ${S.line}`, fontSize: 16, color: S.sub }}>
      {(["Language", "Modified on", "Audio", "Title & description", "Subtitles"] as const).map((t, i) => (
        <span key={t} style={{ position: "absolute", left: [LANG_COLS.lang, LANG_COLS.mod, LANG_COLS.audio, LANG_COLS.title, LANG_COLS.subs][i] - 330, top: 14 }}>{t}</span>
      ))}
    </div>
    {rows.map((r, i) => (
      <div key={r.lang} style={{ position: "absolute", left: 330, right: 60, top: LROW_Y(i), height: 86, borderBottom: `1px solid ${S.line}`, fontSize: 18 }}>
        <div style={{ position: "absolute", left: 0, top: 18, lineHeight: 1.3 }}><div style={{ fontWeight: 600 }}>{r.lang}</div>{r.note ? <div style={{ fontSize: 15, color: S.sub }}>{r.note}</div> : null}</div>
        <div style={{ position: "absolute", left: LANG_COLS.mod - 330, top: 30, color: S.sub }}>{r.audio === "add" && r.title === "add" ? "-" : "Nov 28, 2026"}</div>
        {(["audio", "title", "subs"] as const).map((c) => (
          <div key={c} style={{ position: "absolute", left: LANG_COLS[c] - 330 + (r[c] === "add" ? 0 : 14), top: r[c] === "auto" ? 18 : 28 }}>
            <CellView c={r[c]} hl={hl?.row === i && hl.col === c} />
          </div>
        ))}
      </div>
    ))}
  </>
);

/** Language picker dropdown under ADD LANGUAGE. */
export const LANG_OPTS = ["English", "English (India)", "English (United Kingdom)", "French", "German"];
export const langOptPt = (i: number) => [520, sy(300 + i * 52 + 26)] as [number, number];
export const LangPicker: React.FC<{ f: number; query: string; focus: boolean; hover?: number }> = ({ f, query, focus, hover }) => {
  const opts = query ? LANG_OPTS.filter((o) => o.toLowerCase().startsWith(query.toLowerCase())) : LANG_OPTS;
  return (
    <div style={{ position: "absolute", left: 330, top: 226, width: 440, background: "#fff", borderRadius: 12, boxShadow: "0 10px 34px rgba(0,0,0,0.22)", paddingBottom: 8 }}>
      <div style={{ margin: "12px 14px 6px", height: 50, borderRadius: 8, border: `2px solid ${focus ? S.blue : S.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", fontSize: 18 }}>
        <Ico d={SI.search} size={20} /> {query ? <span>{query}</span> : <span style={{ color: S.faint }}>Search</span>}<Caret f={f} on={focus} />
      </div>
      {opts.map((o, i) => (
        <div key={o} style={{ height: 52, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 18, background: hover === i ? S.hover : "transparent" }}>{o}</div>
      ))}
    </div>
  );
};

/** Generic modal on a dim backdrop. */
export const Modal: React.FC<{ o: number; x: number; y: number; w: number; h: number; title: string; children?: React.ReactNode; footer?: React.ReactNode }> = ({ o, x, y, w, h, title, children, footer }) => (
  <>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 988, background: `rgba(0,0,0,${0.45 * o})` }} />
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#fff", borderRadius: 16, opacity: o, transform: `translateY(${(1 - o) * 26}px)`, boxShadow: "0 24px 70px rgba(0,0,0,0.3)", overflow: "hidden" }}>
      <div style={{ height: 76, borderBottom: `1px solid ${S.line}`, display: "flex", alignItems: "center", padding: "0 30px", fontSize: 24, fontWeight: 700 }}>{title}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 76, bottom: footer ? 84 : 0 }}>{children}</div>
      {footer ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 84, borderTop: `1px solid ${S.line}`, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, padding: "0 28px" }}>{footer}</div> : null}
    </div>
  </>
);
export const Btn: React.FC<{ children: React.ReactNode; dark?: boolean; dim?: boolean; pressed?: boolean }> = ({ children, dark = true, dim, pressed }) => (
  <div style={{ height: 46, padding: "0 22px", borderRadius: 10, display: "flex", alignItems: "center", fontSize: 17, fontWeight: 700, letterSpacing: 0.4,
    background: dark ? (dim ? "#C9C9C9" : pressed ? "#000" : S.dark) : "transparent", color: dark ? "#fff" : S.text, transform: pressed ? "scale(0.96)" : "none" }}>{children}</div>
);

/** Simple waveform bars (deterministic). */
export const Wave: React.FC<{ w: number; h: number; color?: string; seed?: number; progress?: number; bars?: number }> = ({ w, h, color = S.blue, seed = 1, progress = 1, bars = 90 }) => (
  <div style={{ width: w, height: h, display: "flex", alignItems: "center", gap: 2 }}>
    {Array.from({ length: bars }).map((_, i) => {
      const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.61 * seed + seed) * Math.cos(i * 0.23 + seed * 2));
      return <div key={i} style={{ flex: 1, height: h * v, borderRadius: 2, background: i / bars <= progress ? color : "#D5D5D5" }} />;
    })}
  </div>
);

/** Audio upload dialog: phase 0 = drop zone, 1 = uploading (p 0..1), 2 = preview ready. */
export const AUDIO_MODAL = { x: 430, y: 150, w: 1060, h: 700 };
export const selectFilePt = [960, sy(150 + 76 + 330)] as [number, number];
export const audioPublishPt = [430 + 1060 - 90, sy(150 + 700 - 42)] as [number, number];
export const AudioUpload: React.FC<{ o: number; phase: 0 | 1 | 2; p: number; play: number; pressed?: boolean; file: string }> = ({ o, phase, p, play, pressed, file }) => (
  <Modal o={o} {...AUDIO_MODAL} title="Add audio track · English" footer={<><Btn dark={false}>CANCEL</Btn><Btn dim={phase < 2} pressed={pressed}>PUBLISH</Btn></>}>
    {phase === 0 ? (
      <div style={{ position: "absolute", inset: 30, border: `2px dashed ${S.line}`, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: S.hover, display: "grid", placeItems: "center" }}><Ico d={SI.upload} size={56} color={S.faint} /></div>
        <div style={{ fontSize: 22 }}>Drag and drop an audio file to upload</div>
        <div style={{ fontSize: 16, color: S.sub }}>Audio only · about the same length as the video</div>
        <Btn>SELECT FILE</Btn>
      </div>
    ) : (
      <div style={{ position: "absolute", inset: 30 }}>
        <div style={{ display: "flex", gap: 28 }}>
          <div style={{ position: "relative" }}>
            <Thumb img={VIDEOS[0].img} w={520} />
            {phase === 2 ? (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 44, background: "linear-gradient(transparent,rgba(0,0,0,0.75))", display: "flex", alignItems: "flex-end", padding: "0 12px 8px", gap: 12, color: "#fff", fontSize: 14 }}>
                <span>▶</span>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.35)", borderRadius: 2, marginBottom: 6 }}><div style={{ width: `${play * 100}%`, height: 4, background: S.red, borderRadius: 2 }} /></div>
                <span>English</span>
              </div>
            ) : null}
          </div>
          <div style={{ flex: 1, fontSize: 18 }}>
            <div style={{ color: S.sub, fontSize: 15 }}>File</div>
            <div style={{ fontWeight: 600, marginTop: 4, wordBreak: "break-all" }}>{file}</div>
            <div style={{ color: S.sub, fontSize: 15, marginTop: 18 }}>Language</div>
            <div style={{ marginTop: 4 }}>English</div>
            <div style={{ color: S.sub, fontSize: 15, marginTop: 18 }}>Length</div>
            <div style={{ marginTop: 4 }}>11:12 <span style={{ color: S.green }}>· matches video</span></div>
          </div>
        </div>
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: S.sub, marginBottom: 10 }}>
            <span>{phase === 1 ? `Uploading… ${Math.round(p * 100)}%` : "Upload complete · checks done"}</span><span>{phase === 2 ? "Preview with video" : ""}</span>
          </div>
          {phase === 1 ? (
            <div style={{ height: 8, background: S.hover, borderRadius: 4 }}><div style={{ width: `${p * 100}%`, height: 8, background: S.blue, borderRadius: 4 }} /></div>
          ) : (
            <Wave w={1000} h={70} progress={play} seed={2.3} bars={120} />
          )}
        </div>
      </div>
    )}
  </Modal>
);

/** Title & description modal (original on the left, English on the right). */
export const TD_MODAL = { x: 290, y: 100, w: 1340, h: 800 };
export const tdPublishPt = [290 + 1340 - 90, sy(100 + 800 - 42)] as [number, number];
export const tdTitlePt = [1260, sy(100 + 76 + 110)] as [number, number];
export const tdDescPt = [1260, sy(100 + 76 + 330)] as [number, number];
export const TitleDesc: React.FC<{ o: number; f: number; title: string; desc: string; focus: "t" | "d" | null; pressed?: boolean; origT: string; origD: string }> = ({ o, f, title, desc, focus, pressed, origT, origD }) => (
  <Modal o={o} {...TD_MODAL} title="Title & description · English" footer={<><Btn dark={false}>CANCEL</Btn><Btn dim={!title} pressed={pressed}>PUBLISH</Btn></>}>
    <div style={{ position: "absolute", left: 30, top: 24, width: 600 }}>
      <div style={{ fontSize: 16, color: S.sub, fontWeight: 600 }}>ORIGINAL (HINDI)</div>
      <div style={{ marginTop: 14, border: `1px solid ${S.line}`, borderRadius: 10, padding: "14px 16px", fontSize: 18, lineHeight: 1.4, background: S.page }}>{origT}</div>
      <div style={{ marginTop: 18, border: `1px solid ${S.line}`, borderRadius: 10, padding: "14px 16px", fontSize: 17, lineHeight: 1.5, background: S.page, height: 380, whiteSpace: "pre-wrap", overflow: "hidden", color: S.sub }}>{origD}</div>
    </div>
    <div style={{ position: "absolute", left: 670, top: 24, width: 640 }}>
      <div style={{ fontSize: 16, color: S.sub, fontWeight: 600 }}>ENGLISH</div>
      <div style={{ marginTop: 14, border: `2px solid ${focus === "t" ? S.blue : S.line}`, borderRadius: 10, padding: "8px 16px 14px", minHeight: 84, boxSizing: "border-box", fontSize: 18, lineHeight: 1.4 }}>
        <div style={{ fontSize: 14, color: S.sub }}>Title (required)</div>{title}<Caret f={f} on={focus === "t"} />
      </div>
      <div style={{ marginTop: 18, border: `2px solid ${focus === "d" ? S.blue : S.line}`, borderRadius: 10, padding: "8px 16px 14px", height: 380, boxSizing: "border-box", fontSize: 17, lineHeight: 1.5, whiteSpace: "pre-wrap", overflow: "hidden" }}>
        <div style={{ fontSize: 14, color: S.sub }}>Description</div>{desc}<Caret f={f} on={focus === "d"} />
      </div>
    </div>
  </Modal>
);

/** Small dropdown menu (subtitles ADD options). */
export const SUB_MENU = ["Upload file", "Auto-sync", "Type manually", "Auto-translate"];
export const subMenuPt = (i: number) => [1640, sy(LROW_Y(1) + 70 + 8 + i * 52 + 26)] as [number, number];
export const SubMenu: React.FC<{ o: number; hover?: number }> = ({ o, hover }) => (
  <div style={{ position: "absolute", left: 1520, top: LROW_Y(1) + 70, width: 300, background: "#fff", borderRadius: 12, boxShadow: "0 10px 34px rgba(0,0,0,0.22)", padding: "8px 0", opacity: o }}>
    {SUB_MENU.map((t, i) => <div key={t} style={{ height: 52, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 18, background: hover === i ? S.hover : "transparent" }}>{t}</div>)}
  </div>
);

/** "With timing / Without timing" dialog. */
export const ST_MODAL = { x: 590, y: 250, w: 740, h: 440 };
export const withTimingPt = [680, sy(250 + 76 + 70)] as [number, number];
export const stContinuePt = [590 + 740 - 100, sy(250 + 440 - 42)] as [number, number];
export const SubType: React.FC<{ o: number; sel: number; pressed?: boolean }> = ({ o, sel, pressed }) => (
  <Modal o={o} {...ST_MODAL} title="Upload file" footer={<><Btn dark={false}>BACK</Btn><Btn dim={sel < 0} pressed={pressed}>CONTINUE</Btn></>}>
    {["With timing", "Without timing"].map((t, i) => (
      <div key={t} style={{ position: "absolute", left: 60, top: 46 + i * 92, display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, border: `2px solid ${sel === i ? S.blue : S.sub}`, display: "grid", placeItems: "center", marginTop: 2 }}>
          {sel === i ? <div style={{ width: 14, height: 14, borderRadius: 7, background: S.blue }} /> : null}
        </div>
        <div><div style={{ fontSize: 20, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 16, color: S.sub, marginTop: 4 }}>{i === 0 ? "File has timecodes, like .srt" : "Plain text transcript"}</div></div>
      </div>
    ))}
  </Modal>
);

/** Subtitle editor preview with cue list. */
export const SubEditor: React.FC<{ o: number; f: number; cues: [string, string][]; pressed?: boolean; file: string }> = ({ o, f, cues, pressed, file }) => (
  <Modal o={o} {...TD_MODAL} title="Subtitles · English" footer={<><Btn dark={false}>CANCEL</Btn><Btn pressed={pressed}>PUBLISH</Btn></>}>
    <div style={{ position: "absolute", left: 30, top: 20, width: 640 }}>
      <div style={{ fontSize: 15, color: S.sub }}>{file}</div>
      {cues.map(([t, c], i) => (
        <div key={i} style={{ marginTop: 12, border: `1px solid ${S.line}`, borderRadius: 10, padding: "10px 14px", opacity: p01(f, i * 5, 8) }}>
          <div style={{ fontSize: 14, color: S.blue, fontWeight: 600 }}>{t}</div>
          <div style={{ fontSize: 17, marginTop: 4 }}>{c}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 710, top: 20 }}>
      <div style={{ position: "relative" }}>
        <Thumb img={VIDEOS[0].img} w={600} />
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 22, textAlign: "center" }}>
          <span style={{ background: "rgba(0,0,0,0.78)", color: "#fff", fontSize: 19, padding: "4px 10px", lineHeight: 1.6 }}>{cues[0]?.[1]}</span>
        </div>
      </div>
    </div>
  </Modal>
);

/** Settings modal with Channel > Feature eligibility. */
export const SET_MODAL = { x: 330, y: 110, w: 1260, h: 780 };
export const SET_ITEMS = ["General", "Channel", "Upload defaults", "Permissions", "Community", "Agreements"];
export const setItemPt = (i: number) => [450, sy(110 + 76 + 30 + i * 56 + 24)] as [number, number];
export const SET_TABS = ["Basic info", "Advanced settings", "Feature eligibility"];
export const setTabPt = (i: number) => [[720, 900, 1110][i], sy(110 + 76 + 46)] as [number, number];
export const FE_CARD_Y = (i: number) => 110 + 76 + 120 + i * 136; // page y
export const Settings: React.FC<{ o: number; item: number; tab: number; open?: number }> = ({ o, item, tab, open = 0 }) => (
  <Modal o={o} {...SET_MODAL} title="Settings">
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, borderRight: `1px solid ${S.line}`, paddingTop: 30 }}>
      {SET_ITEMS.map((t, i) => <div key={t} style={{ height: 48, margin: "0 0 8px", display: "flex", alignItems: "center", padding: "0 26px", fontSize: 18, background: i === item ? S.hover : "transparent", fontWeight: i === item ? 600 : 400 }}>{t}</div>)}
    </div>
    {item === 1 ? (
      <div style={{ position: "absolute", left: 290, right: 30, top: 0, bottom: 0 }}>
        <div style={{ display: "flex", gap: 40, fontSize: 18, marginTop: 30, borderBottom: `1px solid ${S.line}` }}>
          {SET_TABS.map((t, i) => <div key={t} style={{ paddingBottom: 12, borderBottom: i === tab ? `3px solid ${S.blue}` : "3px solid transparent", color: i === tab ? S.blue : S.text, fontWeight: i === tab ? 600 : 400 }}>{t}</div>)}
        </div>
        {tab === 2
          ? [
              ["Standard features", "Upload videos, add subtitles and titles", "Enabled"],
              ["Intermediate features", "Phone verification unlocks these", "Enabled"],
              ["Advanced features", "Needed for multi-language audio", "Enabled"],
            ].map(([a, b, c], i) => (
              <div key={a} style={{ position: "absolute", left: 0, right: 0, top: FE_CARD_Y(i) - 110 - 76, height: 116, border: `1px solid ${S.line}`, borderRadius: 12, padding: "20px 24px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20, background: i === 2 && open ? "#F4F8FF" : "#fff" }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: "#E6F4EA", display: "grid", placeItems: "center" }}><Ico d={SI.check} size={26} color={S.green} w={2.6} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 20, fontWeight: 600 }}>{a}</div><div style={{ fontSize: 16, color: S.sub, marginTop: 4 }}>{b}</div></div>
                <div style={{ color: S.green, fontWeight: 600, fontSize: 18 }}>{c}</div>
              </div>
            ))
          : <div style={{ marginTop: 30, fontSize: 18, color: S.sub }}>Channel name and description</div>}
      </div>
    ) : (
      <div style={{ position: "absolute", left: 290, top: 30, fontSize: 18, color: S.sub }}>Default currency, advanced options</div>
    )}
  </Modal>
);

/** Video details page section with the altered-content question. */
export const ALT_YES_PT = [420, sy(640)] as [number, number];
export const VideoDetails: React.FC<{ yes: boolean }> = ({ yes }) => (
  <>
    <div style={{ position: "absolute", left: 330, top: 100, fontSize: 32, fontWeight: 700 }}>Video details</div>
    <div style={{ position: "absolute", left: 330, top: 170, width: 980 }}>
      <div style={{ border: `1px solid ${S.line}`, borderRadius: 10, padding: "8px 16px 14px", fontSize: 18 }}><div style={{ fontSize: 14, color: S.sub }}>Title (required)</div>{VIDEOS[0].t}</div>
      <div style={{ border: `1px solid ${S.line}`, borderRadius: 10, padding: "8px 16px 14px", fontSize: 17, marginTop: 16, height: 150, color: S.sub, lineHeight: 1.5 }}><div style={{ fontSize: 14 }}>Description</div>Claude AI ko sirf ek normal chatbot ki tarah use mat kijiye. Is video mein maine step by step dikhaya hai…</div>
      <div style={{ marginTop: 34, fontSize: 22, fontWeight: 700 }}>Altered content</div>
      <div style={{ marginTop: 8, fontSize: 17, color: S.sub, lineHeight: 1.5 }}>Does this video include realistic altered or synthetic content, such as an AI-generated voice?</div>
      {["Yes", "No"].map((t, i) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18, fontSize: 19 }}>
          <div style={{ width: 26, height: 26, borderRadius: 13, border: `2px solid ${(i === 0) === yes ? S.blue : S.sub}`, display: "grid", placeItems: "center" }}>{(i === 0) === yes ? <div style={{ width: 14, height: 14, borderRadius: 7, background: S.blue }} /> : null}</div>{t}
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 1370, top: 170 }}><Thumb img={VIDEOS[0].img} w={480} d="11:12" /></div>
  </>
);

// ------------------------------------------------------------------ watch page / player
export const PLAYER = { x: 70, y: 22, w: 1280, h: 720 }; // page coords
export const GEAR_PT = [PLAYER.x + PLAYER.w - 74, sy(PLAYER.y + PLAYER.h - 30)] as [number, number];
export const MENU = { x: PLAYER.x + PLAYER.w - 420, w: 400 };
export const menuItemPt = (i: number, rows = 4) => [MENU.x + 200, sy(PLAYER.y + PLAYER.h - 64 - rows * 58 + i * 58 + 29)] as [number, number];
/** menu: 0 closed, 1 main settings, 2 audio track list. track: 0 hindi, 1 english. */
export const Watch: React.FC<{ f: number; menu: 0 | 1 | 2; track: 0 | 1; hoverItem?: number; progress?: number; badge?: number; markers?: number }> = ({ f, menu, track, hoverItem, progress = 0.22, badge = 0, markers = 0 }) => {
  const P = PLAYER;
  const main = [["Audio track", track ? "English" : "Hindi (original)"], ["Subtitles/CC", "Off"], ["Playback speed", "Normal"], ["Quality", "1080p HD"]];
  const tracks = ["Hindi (original)", "English"];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: S.text }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 0 }} />
      <div style={{ position: "absolute", left: P.x, top: P.y, width: P.w, height: P.h, borderRadius: 14, overflow: "hidden", background: "#000" }}>
        <Img src={staticFile(VIDEOS[0].img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 58, height: 5, background: "rgba(255,255,255,0.3)", borderRadius: 3 }}>
          <div style={{ width: `${progress * 100}%`, height: 5, background: S.red, borderRadius: 3 }} />
          {markers > 0 ? [0.04, 0.5, 0.95].map((m, i) => (
            <div key={m} style={{ position: "absolute", left: `${m * 100}%`, top: -54, transform: "translateX(-50%)", opacity: p01(markers, i * 14, 10), display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ background: S.green, color: "#fff", fontSize: 16, fontWeight: 700, borderRadius: 8, padding: "5px 10px" }}>✓ {["Start", "Middle", "End"][i]}</div>
              <div style={{ width: 2, height: 22, background: S.green }} />
            </div>
          )) : null}
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 14, display: "flex", alignItems: "center", gap: 22, color: "#fff", fontSize: 18 }}>
          <span style={{ fontSize: 22 }}>❚❚</span><span>{`${Math.floor((progress * 672) / 60)}:${String(Math.floor((progress * 672) % 60)).padStart(2, "0")} / 11:12`}</span>
          <div style={{ flex: 1 }} />
          <span style={{ border: "2px solid #fff", borderRadius: 4, fontSize: 13, fontWeight: 700, padding: "0 4px" }}>CC</span>
          <div style={{ width: 40, height: 40, borderRadius: 20, display: "grid", placeItems: "center", background: menu ? "rgba(255,255,255,0.2)" : "transparent", transform: `rotate(${menu ? 30 : 0}deg)` }}><Ico d={SI.gear} size={28} color="#fff" w={2} /></div>
          <span style={{ fontSize: 20 }}>⛶</span>
        </div>
        {badge > 0 ? (
          <div style={{ position: "absolute", left: 24, top: 22, opacity: badge, background: "rgba(0,0,0,0.72)", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 20, fontWeight: 600 }}>Audio track: {tracks[track]}</div>
        ) : null}
        {menu ? (
          <div style={{ position: "absolute", left: MENU.x - P.x, width: MENU.w, bottom: 64, background: "rgba(28,28,28,0.94)", borderRadius: 14, padding: "10px 0", color: "#fff", fontSize: 19 }}>
            {menu === 1
              ? main.map(([a, b], i) => (
                  <div key={a} style={{ height: 58, display: "flex", alignItems: "center", padding: "0 22px", background: hoverItem === i ? "rgba(255,255,255,0.12)" : "transparent" }}>
                    <span style={{ flex: 1 }}>{a}</span><span style={{ color: "#ccc" }}>{b} ›</span>
                  </div>
                ))
              : [["‹ Audio track", ""], ...tracks.map((t, i) => [t, i === track ? "✓" : ""]), ["", ""]].map(([a, b], i) => (
                  <div key={i} style={{ height: 58, display: "flex", alignItems: "center", padding: "0 22px", borderBottom: i === 0 ? "1px solid rgba(255,255,255,0.2)" : "none", background: hoverItem === i ? "rgba(255,255,255,0.12)" : "transparent", fontWeight: i === 0 ? 600 : 400 }}>
                    <span style={{ width: 30 }}>{b}</span><span>{a}</span>
                  </div>
                ))}
          </div>
        ) : null}
      </div>
      <div style={{ position: "absolute", left: P.x, top: P.y + P.h + 20, width: P.w, fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>{VIDEOS[0].t}</div>
      <div style={{ position: "absolute", left: P.x, top: P.y + P.h + 112, display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar size={52} />
        <div><div style={{ fontSize: 19, fontWeight: 600 }}>Sujan</div><div style={{ fontSize: 15, color: S.sub }}>Tech tutorials in Hindi</div></div>
        <div style={{ marginLeft: 20, background: S.dark, color: "#fff", borderRadius: 22, padding: "10px 20px", fontSize: 17, fontWeight: 600 }}>Subscribe</div>
        <div style={{ marginLeft: 18, background: S.hover, borderRadius: 22, padding: "10px 20px", fontSize: 17 }}>Like · 1.2K</div>
      </div>
      <div style={{ position: "absolute", left: P.x + P.w + 34, top: P.y, width: 500 }}>
        {VIDEOS.slice(1).concat(VIDEOS.slice(0, 1)).map((v, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <Thumb img={v.img} w={230} d={v.d} />
            <div style={{ fontSize: 16, lineHeight: 1.35, fontWeight: 600 }}>{v.t}<div style={{ fontWeight: 400, color: S.sub, fontSize: 14, marginTop: 6 }}>Sujan</div></div>
          </div>
        ))}
      </div>
    </div>
  );
};
export { K };
