// Reusable app screens for the documentary (all coordinates in 1920x1080 screen space unless noted).
import React from "react";
import { Button, Caret, Composer, IC, K, SANS, SERIF, SIDE_W, Spark, p01 } from "./ui";

const Main: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: SIDE_W, right: 0, top: 0, bottom: 0, ...style }}>{children}</div>
);
const X = (x: number) => x - SIDE_W;
const Svg: React.FC<{ d: string; s?: number; c?: string }> = ({ d, s = 22, c = K.sub }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

/** Screen-space targets for the cursor. */
export const T = {
  homeSend: [1543, 544] as [number, number],
  homeField: [800, 462] as [number, number],
  projSend: [1238, 476] as [number, number],
  projField: [520, 360] as [number, number],
  instrCard: [1620, 267] as [number, number],
  filesPlus: [1836, 378] as [number, number],
  menuUpload: [1690, 438] as [number, number],
  modalSave: [1289, 848] as [number, number],
  modalText: [900, 560] as [number, number],
  finderOpen: [1380, 822] as [number, number],
  finderRow: (i: number) => [900, 325 + i * 56] as [number, number],
  avatar: [120, 1030] as [number, number],
};

// ---------------------------------------------------------------- Home
export const Home: React.FC<{ f: number; text?: string; focus?: boolean; greeting?: string; file?: string }> = ({ f, text = "", focus = false, greeting = "Good evening", file }) => (
  <Main>
    <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Spark size={58} />
      <span style={{ fontFamily: SERIF, fontSize: 60, color: "#2B2A26" }}>{greeting}</span>
    </div>
    <Composer left={X(665)} top={330} width={920} height={160} text={text} f={f} focus={focus} file={file} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 530, display: "flex", justifyContent: "center", gap: 14 }}>
      {["Write", "Learn", "Code", "Life stuff", "Claude's choice"].map((c) => (
        <div key={c} style={{ border: `1px solid ${K.border}`, borderRadius: 12, padding: "10px 18px", fontSize: 19, color: "#3C3A35", background: K.page }}>{c}</div>
      ))}
    </div>
  </Main>
);

// ---------------------------------------------------------------- Projects list
export const ProjectsList: React.FC<{ f: number; mine?: boolean; press?: number }> = ({ mine, press = 0 }) => {
  const P = [
    ...(mine ? [["YouTube Content Assistant", "Help me research, plan and create high-quality YouTube content", "Updated just now"]] : []),
    ["Study notes", "Summaries and quiz questions for weekly topics", "Updated 2 days ago"],
    ["Trip planning", "Itineraries, budgets and packing lists", "Updated 5 days ago"],
    ["Newsletter drafts", "Monthly newsletter outlines and edits", "Updated 1 week ago"],
  ];
  return (
    <Main>
      <div style={{ position: "absolute", left: X(470), top: 62, fontFamily: SERIF, fontSize: 48 }}>Projects</div>
      <Button x={X(1570)} y={66} w={210} h={58} pressed={press}>+ New project</Button>
      <div style={{ position: "absolute", left: X(470), top: 160, width: 1310, height: 60, borderRadius: 12, border: `1px solid ${K.border}`, background: K.card, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", fontSize: 20, color: K.faint, boxSizing: "border-box" }}>
        <Svg d={IC.search} c={K.faint} /> Search projects...
      </div>
      {P.map(([t, d, u], i) => (
        <div key={t} style={{ position: "absolute", left: X(470) + (i % 2) * 670, top: 290 + Math.floor(i / 2) * 190, width: 640, height: 164, borderRadius: 16, border: `1px solid ${i === 0 && mine ? K.clay : K.border}`, background: K.card, padding: "24px 26px", boxSizing: "border-box" }}>
          <div style={{ fontSize: 23, fontWeight: 600 }}>{t}</div>
          <div style={{ fontSize: 19, color: K.sub, marginTop: 8 }}>{d}</div>
          <div style={{ fontSize: 16, color: K.faint, marginTop: 22 }}>{u}</div>
        </div>
      ))}
    </Main>
  );
};

// ---------------------------------------------------------------- Project page
export type PFile = { name: string; at?: number; kind?: "txt" | "csv" };
export const ProjectPage: React.FC<{
  f: number; instr?: string; files?: PFile[]; chats?: { t: string; at?: number; hl?: [number, number] }[]; text?: string; focus?: boolean;
  instrHover?: boolean; menu?: number; plusPress?: boolean; menuHl?: boolean; file?: string;
}> = ({ f, instr, files = [], chats = [], text = "", focus = false, instrHover, menu = 0, plusPress, menuHl, file }) => {
  const visible = files.filter((x) => x.at === undefined || f >= x.at);
  const used = Math.min(9, files.filter((x) => x.at === undefined || f >= x.at + 24).length * 2 + (instr ? 1 : 0));
  return (
    <Main>
      <div style={{ position: "absolute", left: X(400), top: 40, fontSize: 19, color: K.sub }}>‹ All projects</div>
      <div style={{ position: "absolute", left: X(400), top: 82, fontFamily: SERIF, fontSize: 46, display: "flex", alignItems: "center", gap: 18 }}>
        YouTube Content Assistant
        <span style={{ fontFamily: SANS, fontSize: 16, color: K.sub, border: `1px solid ${K.border}`, borderRadius: 8, padding: "3px 10px" }}>Private</span>
      </div>
      <div style={{ position: "absolute", left: X(400), top: 152, width: 880, fontSize: 20, color: K.sub }}>Help me research, plan and create high-quality YouTube content for my audience.</div>
      <Composer left={X(400)} top={232} width={880} height={190} f={f} text={text} focus={focus} file={file} />
      {chats.length === 0 ? (
        <div style={{ position: "absolute", left: X(400), top: 450, width: 880, textAlign: "center", fontSize: 19, color: K.faint }}>Start a chat to keep conversations organized and re-use project knowledge.</div>
      ) : (
        <div style={{ position: "absolute", left: X(400), top: 450, width: 880 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: K.sub, marginBottom: 12 }}>Chats in this project</div>
          {chats.map((c, i) => {
            if (c.at !== undefined && f < c.at) return null;
            const hl = c.hl && f >= c.hl[0] && f < c.hl[1] ? Math.min(p01(f, c.hl[0], 8), 1 - p01(f, c.hl[1] - 8, 8)) : 0;
            return (
              <div key={i} style={{ opacity: c.at !== undefined ? p01(f, c.at, 10) : 1, display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, border: `1px solid ${hl ? K.clay : K.border}`, background: hl ? "#FBEDE6" : K.card, marginBottom: 10, fontSize: 20, boxShadow: hl ? `0 0 0 ${3 * hl}px rgba(217,119,87,0.25)` : "none" }}>
                <Svg d={IC.chat} /> <span style={{ fontWeight: 500 }}>{c.t}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 16, color: K.faint }}>{c.at !== undefined ? "just now" : `${i + 1} days ago`}</span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ position: "absolute", left: X(1360), top: 30, width: 520, height: 860, borderRadius: 18, border: `1px solid ${K.border}`, background: K.side }}>
        <div style={{ position: "absolute", left: 24, top: 24, fontSize: 23, fontWeight: 600 }}>Project knowledge</div>
        <div style={{ position: "absolute", left: 24, top: 90, width: 472, height: 110, boxSizing: "border-box", borderRadius: 14, border: `1px solid ${K.border}`, background: instrHover ? K.hover : K.card, padding: "18px 22px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, fontWeight: 600 }}>
            {instr ? "Instructions" : "Set project instructions"}
            <Svg d={IC.pencil} s={24} />
          </div>
          <div style={{ fontSize: 17, color: K.sub, marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{instr ? instr.split("\n")[0] : "Optional · tailor Claude's responses"}</div>
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, top: 236, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, fontWeight: 600 }}>
          Files
          <div style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${K.border}`, background: plusPress ? K.hover : K.card, display: "grid", placeItems: "center", fontSize: 24, color: K.sub }}>+</div>
        </div>
        {visible.length === 0 ? (
          <div style={{ position: "absolute", left: 24, right: 24, top: 300, height: 220, borderRadius: 14, border: "1.5px dashed #D3CFC2", display: "grid", placeItems: "center", textAlign: "center", padding: 26, boxSizing: "border-box", fontSize: 18, color: K.sub, lineHeight: 1.5 }}>
            No knowledge added yet. Add PDFs, documents, or other text that Claude will reference in every project conversation.
          </div>
        ) : (
          files.map((x, i) => {
            if (x.at !== undefined && f < x.at) return null;
            const pr = x.at === undefined ? 1 : p01(f, x.at, 24);
            const csv = x.name.endsWith(".csv");
            return (
              <div key={x.name} style={{ position: "absolute", left: 24, right: 24, top: 300 + i * 70, height: 60, borderRadius: 12, border: `1px solid ${K.border}`, background: K.card, display: "flex", alignItems: "center", gap: 14, padding: "0 14px", opacity: p01(f, x.at ?? -99, 6), overflow: "hidden" }}>
                <div style={{ width: 30, height: 36, borderRadius: 5, background: csv ? "#2F8F5B" : "#5B6B8C", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>{csv ? "CSV" : "TXT"}</div>
                <div style={{ flex: 1, fontSize: 18, fontWeight: 500, whiteSpace: "nowrap" }}>{x.name}</div>
                <div style={{ fontSize: 15, color: pr < 1 ? K.sub : "#3E9B57", fontWeight: 600 }}>{pr < 1 ? `${Math.round(pr * 100)}%` : "✓"}</div>
                {pr < 1 ? <div style={{ position: "absolute", left: 0, bottom: 0, height: 4, width: `${pr * 100}%`, background: K.clay }} /> : null}
              </div>
            );
          })
        )}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 26, fontSize: 16, color: K.sub }}>
          <div style={{ height: 8, borderRadius: 4, background: "#E2DED2", overflow: "hidden", marginBottom: 8 }}><div style={{ width: `${used}%`, height: "100%", background: K.clay }} /></div>
          {used}% of project capacity used
        </div>
        {menu > 0 ? (
          <div style={{ position: "absolute", left: 200, top: 286, width: 290, background: K.card, borderRadius: 12, boxShadow: "0 12px 30px rgba(0,0,0,0.16)", border: `1px solid ${K.border}`, padding: 8, opacity: menu, fontSize: 19 }}>
            {["Upload from device", "Add text content"].map((m, i) => (
              <div key={m} style={{ padding: "12px 14px", borderRadius: 8, background: i === 0 && menuHl ? K.hover : "transparent" }}>{m}</div>
            ))}
          </div>
        ) : null}
      </div>
    </Main>
  );
};

// ---------------------------------------------------------------- Instructions modal (screen-space, render after Browser)
export const InstrModal: React.FC<{ f: number; openAt: number; closeAt?: number; text: string; focus: boolean; savePress?: boolean }> = ({ f, openAt, closeAt = 1e9, text, focus, savePress }) => {
  if (f < openAt || f >= closeAt + 8) return null;
  const o = Math.min(p01(f, openAt, 8), 1 - p01(f, closeAt, 8));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(20,18,14,${0.38 * o})` }} />
      <div style={{ position: "absolute", left: 470, top: 150, width: 980, height: 760, borderRadius: 20, background: K.card, boxShadow: "0 30px 80px rgba(0,0,0,0.25)", opacity: o, transform: `translateY(${(1 - o) * 16}px)`, fontFamily: SANS, color: K.text }}>
        <div style={{ position: "absolute", left: 36, top: 30, fontFamily: SERIF, fontSize: 36 }}>Set project instructions</div>
        <div style={{ position: "absolute", left: 36, right: 36, top: 88, fontSize: 19, color: K.sub, lineHeight: 1.45 }}>
          Provide Claude with relevant instructions and information for chats within YouTube Content Assistant.
        </div>
        <div style={{ position: "absolute", left: 36, right: 36, top: 150, height: 470, boxSizing: "border-box", borderRadius: 12, border: `${focus ? 2 : 1}px solid ${focus ? "#8FB4E8" : K.border}`, boxShadow: focus ? "0 0 0 4px rgba(120,160,230,0.18)" : "none", padding: "16px 20px", fontSize: 21, lineHeight: 1.5, overflow: "hidden" }}>
          <div style={{ whiteSpace: "pre-wrap", transform: `translateY(${-Math.max(0, text.split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(l.length / 74)), 0) - 13) * 31.5}px)` }}>
            {text ? text : <span style={{ color: K.faint }}>Think step by step and explain your reasoning...</span>}
            <Caret f={f} on={focus} />
          </div>
        </div>
        <Button x={980 - 36 - 250 - 140} y={670} w={125} dark={false}>Cancel</Button>
        <Button x={980 - 36 - 250} y={670} w={250} disabled={!text} pressed={savePress ? 1 : 0}>Save instructions</Button>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- macOS-style file dialog
export const Finder: React.FC<{ f: number; openAt: number; closeAt: number; files: string[]; sel: number[]; pressOpen?: boolean }> = ({ f, openAt, closeAt, files, sel, pressOpen }) => {
  if (f < openAt || f >= closeAt + 8) return null;
  const o = Math.min(p01(f, openAt, 8), 1 - p01(f, closeAt, 8));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(20,18,14,${0.25 * o})` }} />
      <div style={{ position: "absolute", left: 460, top: 230, width: 1000, height: 640, borderRadius: 16, background: "#F2F1EF", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", opacity: o, fontFamily: SANS, overflow: "hidden", color: "#222" }}>
        <div style={{ height: 56, background: "#E6E4E0", display: "flex", alignItems: "center", padding: "0 20px", gap: 9 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
          <div style={{ flex: 1, textAlign: "center", fontWeight: 600, fontSize: 19 }}>YouTube Scripts</div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 56, bottom: 0, width: 210, background: "#E9E7E3", padding: "18px 16px", fontSize: 18, color: "#555" }}>
          {["Desktop", "Documents", "Downloads", "YouTube Scripts"].map((d) => (
            <div key={d} style={{ padding: "9px 10px", borderRadius: 7, background: d === "YouTube Scripts" ? "#D6D3CD" : "transparent", color: d === "YouTube Scripts" ? "#222" : "#555" }}>{d}</div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 210, right: 0, top: 56, bottom: 90, padding: "14px 18px" }}>
          {files.map((n, i) => (
            <div key={n} style={{ height: 50, marginBottom: 6, borderRadius: 8, display: "flex", alignItems: "center", gap: 14, padding: "0 14px", fontSize: 19, background: sel.includes(i) ? "#2F6FDB" : "transparent", color: sel.includes(i) ? "#fff" : "#222" }}>
              <div style={{ width: 24, height: 30, borderRadius: 4, background: sel.includes(i) ? "#fff" : "#C9CED8" }} />
              {n}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 15, opacity: 0.7 }}>{12 + i * 3} KB</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 24, bottom: 24, display: "flex", gap: 12 }}>
          <div style={{ padding: "11px 24px", borderRadius: 9, background: "#fff", border: "1px solid #CCC", fontSize: 18 }}>Cancel</div>
          <div style={{ padding: "11px 30px", borderRadius: 9, background: pressOpen ? "#1E55B8" : "#2F6FDB", color: "#fff", fontSize: 18, fontWeight: 600 }}>Open</div>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- Settings → Capabilities → Skills
export const SKILLS = [
  { n: "title-writer", d: "5-6 YouTube title options with clarity, curiosity and accuracy checks" },
  { n: "hook-writer", d: "Opening hooks in different styles for one topic" },
  { n: "script-review", d: "Reviews a draft script for flow, clarity and pacing" },
  { n: "thumbnail-ideas", d: "Thumbnail concepts: composition, colors, subject, short text" },
  { n: "channel-report", d: "Turns an analytics CSV into a readable report card" },
];
export const skillRowY = (i: number) => 92 + 330 + i * 92;
export const SettingsSkills: React.FC<{ f: number; on: number[]; hlRow?: number; uploadHl?: boolean }> = ({ f, on, hlRow }) => (
  <Main>
    <div style={{ position: "absolute", left: X(400), top: 40, fontFamily: SERIF, fontSize: 46 }}>Settings</div>
    <div style={{ position: "absolute", left: X(400), top: 120, width: 220, fontSize: 20 }}>
      {["General", "Account", "Privacy", "Billing", "Capabilities", "Connectors"].map((t) => (
        <div key={t} style={{ padding: "11px 14px", borderRadius: 10, marginBottom: 4, background: t === "Capabilities" ? "#E6E2D6" : "transparent", fontWeight: t === "Capabilities" ? 600 : 400 }}>{t}</div>
      ))}
    </div>
    <div style={{ position: "absolute", left: X(680), top: 124, width: 1160 }}>
      <div style={{ fontSize: 26, fontWeight: 600 }}>Skills</div>
      <div style={{ fontSize: 19, color: K.sub, marginTop: 8, width: 900 }}>Repeatable instructions and resources Claude can use for specific tasks. Availability may depend on your plan.</div>
      <div style={{ position: "absolute", right: 0, top: 0, padding: "12px 20px", borderRadius: 12, background: K.dark, color: "#fff", fontSize: 18, fontWeight: 600 }}>+ Upload skill</div>
    </div>
    {SKILLS.map((s, i) => {
      const isOn = on.includes(i);
      return (
        <div key={s.n} style={{ position: "absolute", left: X(680), top: skillRowY(i) - 92, width: 1160, height: 78, borderRadius: 14, border: `1px solid ${hlRow === i ? K.clay : K.border}`, background: hlRow === i ? "#FBEDE6" : K.card, display: "flex", alignItems: "center", padding: "0 22px", gap: 18, boxSizing: "border-box" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#F3E3DB", display: "grid", placeItems: "center" }}><Svg d={IC.doc} c={K.clayDark} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 21, fontWeight: 600, fontFamily: "'SF Mono', Menlo, monospace" }}>{s.n}</div>
            <div style={{ fontSize: 17, color: K.sub }}>{s.d}</div>
          </div>
          <div style={{ width: 58, height: 32, borderRadius: 16, background: isOn ? K.clay : "#D6D2C6", position: "relative" }}>
            <div style={{ position: "absolute", top: 3, left: isOn ? 29 : 3, width: 26, height: 26, borderRadius: 13, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
      );
    })}
  </Main>
);

/** SKILL.md viewer (screen-space modal). */
export const SkillFile: React.FC<{ f: number; openAt: number; closeAt: number; lines: { t: string; hl?: [number, number] }[]; reveal: number }> = ({ f, openAt, closeAt, lines, reveal }) => {
  if (f < openAt || f >= closeAt + 8) return null;
  const o = Math.min(p01(f, openAt, 8), 1 - p01(f, closeAt, 8));
  const shown = Math.floor(Math.max(0, f - reveal) / 5);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(20,18,14,${0.35 * o})` }} />
      <div style={{ position: "absolute", left: 420, top: 150, width: 1080, height: 800, borderRadius: 18, background: K.card, opacity: o, boxShadow: "0 30px 80px rgba(0,0,0,0.25)", overflow: "hidden", fontFamily: SANS }}>
        <div style={{ height: 66, borderBottom: `1px solid ${K.border}`, display: "flex", alignItems: "center", padding: "0 26px", gap: 14, fontSize: 21, fontWeight: 600 }}>
          title-writer <span style={{ color: K.faint, fontWeight: 400 }}>/</span> <span style={{ fontFamily: "Menlo, monospace" }}>SKILL.md</span>
        </div>
        <div style={{ position: "absolute", left: 0, top: 66, bottom: 0, width: 230, background: K.side, padding: 20, fontSize: 18, fontFamily: "Menlo, monospace", color: K.sub }}>
          <div style={{ color: K.text, fontWeight: 700, marginBottom: 10 }}>title-writer/</div>
          <div style={{ padding: "6px 10px", background: "#E6E2D6", borderRadius: 6, color: K.text }}>SKILL.md</div>
          <div style={{ padding: "6px 10px" }}>examples.md</div>
          <div style={{ padding: "6px 10px" }}>checklist.md</div>
        </div>
        <div style={{ position: "absolute", left: 260, right: 30, top: 90, fontFamily: "Menlo, 'SF Mono', monospace", fontSize: 19, lineHeight: 1.65, color: "#2B2A26" }}>
          {lines.slice(0, shown).map((l, i) => {
            const hl = l.hl && f >= l.hl[0] && f < l.hl[1] ? Math.min(p01(f, l.hl[0], 8), 1 - p01(f, l.hl[1] - 8, 8)) : 0;
            return (
              <div key={i} style={{ whiteSpace: "pre", padding: "0 8px", borderRadius: 6, background: `rgba(217,119,87,${0.18 * hl})`, color: l.t.startsWith("#") || l.t.startsWith("---") || l.t.startsWith("name:") || l.t.startsWith("description:") ? K.clayDark : undefined }}>
                {l.t || " "}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- Studio-style analytics (recreated, sample data)
export const STUDIO_ROWS = [
  ["How to edit videos on mobile", "12.4K", "98K", "6.1%", "3:42"],
  ["Best free apps for creators", "8.9K", "120K", "3.2%", "2:58"],
  ["Channel banner size guide", "5.1K", "41K", "7.4%", "4:05"],
  ["Shorts vs long videos", "3.7K", "77K", "2.9%", "2:11"],
  ["Mobile se thumbnail kaise banaye", "6.3K", "54K", "5.8%", "3:26"],
];
export const studioNavY = (i: number) => 92 + 110 + i * 58;
export const Studio: React.FC<{ f: number; nav: number; advanced: number; range: string; exportMenu: number; csvHl?: boolean; colHl?: number }> = ({ f, nav, advanced, range, exportMenu, csvHl, colHl = -1 }) => (
  <div style={{ position: "absolute", inset: 0, background: "#F9F9F9", fontFamily: SANS, color: "#202020" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 68, background: "#fff", borderBottom: "1px solid #E5E5E5", display: "flex", alignItems: "center", padding: "0 28px", gap: 12, fontSize: 24, fontWeight: 700 }}>
      <div style={{ width: 34, height: 24, borderRadius: 6, background: "#E5322D", display: "grid", placeItems: "center" }}><div style={{ borderLeft: "10px solid #fff", borderTop: "7px solid transparent", borderBottom: "7px solid transparent" }} /></div>
      Studio
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 15, fontWeight: 600, color: "#B4232A", background: "#FDECEC", borderRadius: 8, padding: "6px 12px" }}>Recreated · sample data, not real</span>
    </div>
    <div style={{ position: "absolute", left: 0, top: 68, bottom: 0, width: 280, background: "#fff", borderRight: "1px solid #E5E5E5", paddingTop: 22 }}>
      {["Dashboard", "Content", "Analytics", "Comments", "Subtitles", "Earn"].map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 14, right: 14, top: studioNavY(i) - 92 - 68, height: 50, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 18px", fontSize: 20, background: i === nav ? "#F0F0F0" : "transparent", fontWeight: i === nav ? 600 : 400, color: i === nav ? "#C4302B" : "#333" }}>{t}</div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 320, right: 40, top: 100 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{nav === 2 ? "Channel analytics" : "Channel dashboard"}</div>
        <div style={{ flex: 1 }} />
        {nav === 2 ? <div style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${advanced ? "#C4302B" : "#CCC"}`, fontSize: 18, fontWeight: 600, background: "#fff" }}>Advanced mode</div> : null}
      </div>
      {nav === 2 && advanced < 1 ? (
        <div style={{ display: "flex", gap: 20, marginTop: 34, opacity: 1 - advanced }}>
          {[["Views", "48.2K"], ["Watch time (hours)", "3.1K"], ["Subscribers", "+620"]].map(([a, b]) => (
            <div key={a} style={{ flex: 1, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 14, padding: "24px 26px" }}>
              <div style={{ fontSize: 18, color: "#666" }}>{a}</div>
              <div style={{ fontSize: 40, fontWeight: 700, marginTop: 8 }}>{b}</div>
            </div>
          ))}
        </div>
      ) : null}
      {nav === 2 && advanced > 0 ? (
        <div style={{ marginTop: 26, opacity: advanced }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
            <div style={{ padding: "10px 18px", borderRadius: 10, background: "#fff", border: "1px solid #CCC", fontSize: 18 }}>{range} ⌄</div>
            <div style={{ padding: "10px 18px", borderRadius: 10, background: "#fff", border: "1px solid #CCC", fontSize: 18 }}>Content: Videos ⌄</div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 48, height: 48, borderRadius: 10, background: exportMenu > 0 ? "#EEE" : "#fff", border: "1px solid #CCC", display: "grid", placeItems: "center", fontSize: 24 }}>⤓</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 14, overflow: "hidden", fontSize: 19 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2.6fr 1fr 1fr 1fr 1fr", fontWeight: 600, background: "#FAFAFA" }}>
              {["Video", "Views", "Impressions", "CTR", "Avg view duration"].map((h, i) => (
                <div key={h} style={{ padding: "16px 18px", background: colHl === i ? "#FFE9C7" : "transparent" }}>{h}</div>
              ))}
            </div>
            {STUDIO_ROWS.map((r) => (
              <div key={r[0]} style={{ display: "grid", gridTemplateColumns: "2.6fr 1fr 1fr 1fr 1fr", borderTop: "1px solid #EEE" }}>
                {r.map((c, ci) => <div key={ci} style={{ padding: "15px 18px", background: colHl === ci ? "#FFF6E6" : "transparent" }}>{c}</div>)}
              </div>
            ))}
          </div>
          {exportMenu > 0 ? (
            <div style={{ position: "absolute", right: 0, top: 150, width: 380, background: "#fff", borderRadius: 12, boxShadow: "0 12px 30px rgba(0,0,0,0.16)", padding: 8, opacity: exportMenu, fontSize: 19 }}>
              {["Google Sheets", "Comma-separated values (.csv)"].map((m, i) => (
                <div key={m} style={{ padding: "13px 16px", borderRadius: 8, background: i === 1 && csvHl ? "#F0F0F0" : "transparent" }}>{m}</div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  </div>
);
/** Studio targets (screen). */
export const ST = { analytics: [150, studioNavY(2) + 25] as [number, number], advanced: [1790, 92 + 124] as [number, number], range: [415, 284] as [number, number], exportBtn: [1856, 286] as [number, number], csv: [1690, 425] as [number, number] };

// ---------------------------------------------------------------- CSV sheet (clean up private columns)
export const Sheet: React.FC<{ f: number; selAt: number; delAt: number }> = ({ f, selAt, delAt }) => {
  const head = ["Video title", "Views", "Impressions", "CTR", "Private notes"];
  const rows = STUDIO_ROWS.map((r, i) => [r[0], r[1], r[2], r[3], ["call sponsor +91 98xxx", "personal email draft", "client invoice #22", "home address note", "bank details"][i]]);
  const sel = f >= selAt && f < delAt;
  const gone = p01(f, delAt, 10);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: SANS, color: "#202020" }}>
      <div style={{ height: 60, borderBottom: "1px solid #E5E5E5", display: "flex", alignItems: "center", padding: "0 26px", gap: 14, fontSize: 21, fontWeight: 600 }}>
        <div style={{ width: 26, height: 30, borderRadius: 4, background: "#2F8F5B" }} /> channel-analytics.csv
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 15, color: "#B4232A", background: "#FDECEC", borderRadius: 8, padding: "6px 12px" }}>Sample data · not real</span>
      </div>
      <div style={{ position: "absolute", left: 40, top: 100, right: 40, fontSize: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: `60px 2.4fr 1fr 1fr 1fr ${1.8 * (1 - gone)}fr` }}>
          {["", ...head].map((h, i) => (
            <div key={i} style={{ padding: "12px 14px", background: i === 5 && sel ? "#CFE0FF" : "#F3F3F3", border: "1px solid #E2E2E2", fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap", opacity: i === 5 ? 1 - gone : 1 }}>{i === 0 ? "" : String.fromCharCode(64 + i)}{i ? ` · ${h}` : ""}</div>
          ))}
          {rows.map((r, ri) =>
            ["" + (ri + 2), ...r].map((c, ci) => (
              <div key={`${ri}-${ci}`} style={{ padding: "12px 14px", border: "1px solid #EEE", background: ci === 5 && sel ? "#E3EDFF" : ci === 0 ? "#F7F7F7" : "#fff", color: ci === 5 ? "#B4232A" : undefined, overflow: "hidden", whiteSpace: "nowrap", opacity: ci === 5 ? 1 - gone : 1 }}>{c}</div>
            )),
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- New project form
export const NewProject: React.FC<{ f: number; name: string; purpose: string; focusName: boolean; focusPurpose: boolean; press?: boolean }> = ({ f, name, purpose, focusName, focusPurpose, press }) => (
  <Main>
    <div style={{ position: "absolute", left: X(725), top: 100, fontFamily: SERIF, fontSize: 48 }}>Create a personal project</div>
    <div style={{ position: "absolute", left: X(725), top: 208, fontSize: 21, fontWeight: 600 }}>What are you working on?</div>
    <Field x={X(725)} y={250} w={800} h={66} value={name} placeholder="Name your project" focus={focusName} f={f} />
    <div style={{ position: "absolute", left: X(725), top: 348, fontSize: 21, fontWeight: 600 }}>What are you trying to achieve?</div>
    <Field x={X(725)} y={390} w={800} h={200} value={purpose} placeholder="Describe your project, goals, subject, etc..." focus={focusPurpose} f={f} multiline />
    <Button x={X(1175)} y={630} w={125} dark={false}>Cancel</Button>
    <Button x={X(1315)} y={630} w={210} disabled={!name} pressed={press ? 1 : 0}>Create project</Button>
  </Main>
);
const Field: React.FC<{ x: number; y: number; w: number; h: number; value: string; placeholder: string; focus: boolean; f: number; multiline?: boolean }> = ({ x, y, w, h, value, placeholder, focus, f, multiline }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 12, background: K.card, boxSizing: "border-box", border: `${focus ? 2 : 1}px solid ${focus ? "#8FB4E8" : K.border}`, boxShadow: focus ? "0 0 0 4px rgba(120,160,230,0.18)" : "none", padding: multiline ? "16px 18px" : "0 18px", display: multiline ? "block" : "flex", alignItems: "center", fontSize: 22, lineHeight: 1.45 }}>
    {value ? <span>{value}</span> : <span style={{ color: K.faint }}>{placeholder}</span>}
    <Caret f={f} on={focus} />
  </div>
);
