// Chat engine for the "real Claude screen" documentary: user messages typed into the composer,
// Claude replies streaming word by word (serif, like the web app), optional artifact panel,
// plus overlays (callouts, chapter chip) and UI sound effects that follow the same timeline.
import React from "react";
import { Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Caret, Composer, IC, K, SANS, SERIF, SIDE_W, Spark, p01, typed } from "./ui";

export type Item = string | { t: string; tags?: string[]; hl?: [number, number] };
export type Block =
  | { k: "p" | "h" | "note"; t: string }
  | { k: "ol" | "ul"; items: Item[] }
  | { k: "table"; head: string[]; rows: string[][]; hl?: { row: number; from: number; to: number; tone?: "good" | "bad" }[] }
  | { k: "node"; w: number; n: React.ReactNode };
export type UMsg = { u: string; typeAt: number; send: number; cps?: number; file?: string };
export type CMsg = { at: number; blocks: Block[]; wps?: number };
export type Msg = UMsg | CMsg;
export type Artifact = { title: string; at: number; blocks: Block[]; wps?: number; v2?: { at: number; blocks: Block[] } };

const isU = (m: Msg): m is UMsg => (m as UMsg).u !== undefined;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const itemText = (it: Item) => (typeof it === "string" ? it : it.t);
const blockWords = (b: Block) =>
  b.k === "ol" || b.k === "ul" ? b.items.reduce((a, it) => a + words(itemText(it)) + 1, 0) : b.k === "table" ? 2 + b.rows.length * 3 : b.k === "node" ? b.w : words((b as { t: string }).t);
export const msgEnd = (m: CMsg) => m.at + Math.ceil((m.blocks.reduce((a, b) => a + blockWords(b), 0) / (m.wps ?? 15)) * 30);
const firstWords = (s: string, n: number) => s.split(/(\s+)/).filter(Boolean).reduce((acc, w) => (words(acc + w) <= n ? acc + w : acc), "");
export const typeLen = (txt: string, cps: number) => Math.ceil((txt.length / cps) * 30);

/** Inline **bold** support. */
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>
    {s.split(/(\*\*[^*]+\*\*)/).map((p, i) => (p.startsWith("**") ? <b key={i} style={{ fontWeight: 600 }}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>))}
  </>
);

export const Blocks: React.FC<{ blocks: Block[]; budget: number; f: number; size?: number }> = ({ blocks, budget, f, size = 23 }) => {
  let left = budget;
  const out: React.ReactNode[] = [];
  blocks.forEach((b, bi) => {
    if (left <= 0) return;
    const w = blockWords(b);
    const n = Math.min(left, w);
    left -= w;
    if (b.k === "node") {
      if (n >= w) out.push(<div key={bi}>{b.n}</div>);
    } else if (b.k === "p" || b.k === "h" || b.k === "note") {
      const txt = n >= w ? b.t : firstWords(b.t, n);
      if (b.k === "h") out.push(<div key={bi} style={{ fontFamily: SANS, fontWeight: 700, fontSize: size + 1, margin: "18px 0 8px" }}><Rich s={txt} /></div>);
      else if (b.k === "note")
        out.push(<div key={bi} style={{ fontSize: size - 2, color: K.sub, fontStyle: "italic", margin: "10px 0" }}><Rich s={txt} /></div>);
      else out.push(<div key={bi} style={{ margin: "0 0 12px" }}><Rich s={txt} /></div>);
    } else if (b.k === "ol" || b.k === "ul") {
      let m = n;
      const lis: React.ReactNode[] = [];
      b.items.forEach((it, ii) => {
        if (m <= 0) return;
        const t = itemText(it), iw = words(t) + 1;
        const shown = m >= iw ? t : firstWords(t, m - 1);
        m -= iw;
        const o: { hl?: [number, number]; tags?: string[] } = typeof it === "string" ? {} : it;
        const hl = o.hl && f >= o.hl[0] && f < o.hl[1] ? Math.min(p01(f, o.hl[0], 8), 1 - p01(f, o.hl[1] - 8, 8)) : 0;
        lis.push(
          <div key={ii} style={{ display: "flex", gap: 12, margin: "0 0 10px", padding: "6px 10px", marginLeft: -10, borderRadius: 10, background: `rgba(217,119,87,${0.13 * hl})`, boxShadow: hl ? `inset 0 0 0 2px rgba(217,119,87,${0.8 * hl})` : "none" }}>
            <span style={{ minWidth: 26, color: K.sub }}>{b.k === "ol" ? `${ii + 1}.` : "•"}</span>
            <span>
              <Rich s={shown} />
              {o.tags && m >= 0 ? o.tags.map((tg) => (
                <span key={tg} style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: K.clayDark, background: "#F6E4DC", borderRadius: 6, padding: "3px 8px", marginLeft: 10, verticalAlign: "2px" }}>{tg}</span>
              )) : null}
            </span>
          </div>,
        );
      });
      out.push(<div key={bi} style={{ margin: "4px 0 10px" }}>{lis}</div>);
    } else {
      const tb = b as Extract<Block, { k: "table" }>;
      const rowsShown = Math.max(0, Math.min(tb.rows.length, Math.floor((n - 2) / 3)));
      out.push(
        <div key={bi} style={{ border: `1px solid ${K.border}`, borderRadius: 12, overflow: "hidden", margin: "6px 0 14px", fontFamily: SANS, fontSize: size - 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: `2.4fr repeat(${tb.head.length - 1}, 1fr)`, background: K.side, fontWeight: 600 }}>
            {tb.head.map((h) => <div key={h} style={{ padding: "10px 14px" }}>{h}</div>)}
          </div>
          {tb.rows.slice(0, rowsShown).map((r, ri) => {
            const h = (tb.hl ?? []).find((x) => x.row === ri && f >= x.from && f < x.to);
            const o = h ? Math.min(p01(f, h.from, 8), 1 - p01(f, h.to - 8, 8)) : 0;
            const col = h?.tone === "good" ? "74,160,90" : "217,90,70";
            return (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: `2.4fr repeat(${tb.head.length - 1}, 1fr)`, borderTop: `1px solid ${K.border}`, background: `rgba(${col},${0.12 * o})`, boxShadow: o ? `inset 0 0 0 2px rgba(${col},${0.8 * o})` : "none" }}>
                {r.map((c, ci) => <div key={ci} style={{ padding: "9px 14px" }}>{c}</div>)}
              </div>
            );
          })}
        </div>,
      );
    }
  });
  return <>{out}</>;
};

export const UserBubble: React.FC<{ text: string; file?: string }> = ({ text, file }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", margin: "8px 0 26px" }}>
    {file ? <FileChip name={file} /> : null}
    <div style={{ maxWidth: "80%", background: "#EFECE3", borderRadius: 18, padding: "16px 22px", fontFamily: SANS, fontSize: 21, lineHeight: 1.45 }}>{text}</div>
  </div>
);
export const FileChip: React.FC<{ name: string; style?: React.CSSProperties }> = ({ name, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, background: K.card, border: `1px solid ${K.border}`, borderRadius: 12, padding: "10px 16px", marginBottom: 10, fontFamily: SANS, fontSize: 18, ...style }}>
    <div style={{ width: 36, height: 42, borderRadius: 6, background: name.endsWith(".csv") ? "#2F8F5B" : "#5B6B8C", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{name.split(".").pop()?.toUpperCase()}</div>
    <div>
      <div style={{ fontWeight: 600 }}>{name}</div>
      <div style={{ color: K.sub, fontSize: 15 }}>{name.endsWith(".csv") ? "CSV · 24 rows" : "Text · 1,840 words"}</div>
    </div>
  </div>
);

/** Geometry of the bottom composer in chat view (screen coordinates). */
export const chatGeo = (art: boolean, narrow = false) => {
  const left = art ? 380 : narrow ? 400 : 330 + (1590 - 900) / 2, width = art ? 700 : narrow ? 860 : 900, h = 170, top = 1080 - 48 - h;
  return { left, width, top, h, send: [left + width - 42, top + h - 38] as [number, number], field: [left + 160, top + 40] as [number, number] };
};

export const ChatView: React.FC<{ f: number; msgs: Msg[]; title: string; art?: Artifact; project?: string; narrow?: boolean }> = ({ f, msgs, title, art, project = "YouTube Content Assistant", narrow }) => {
  const artOn = !!art && f >= art.at;
  const g = chatGeo(artOn, narrow);
  const typing = msgs.find((m) => isU(m) && f >= m.typeAt && f < m.send) as UMsg | undefined;
  const lastSend = Math.max(-1, ...msgs.filter(isU).filter((m) => f >= m.send).map((m) => m.send));
  const nextC = lastSend >= 0 ? (msgs.find((m) => !isU(m) && m.at >= lastSend) as CMsg | undefined) : undefined;
  const pendingC = nextC && f < nextC.at;
  const lastC = msgs.reduce((acc, m, i) => (!isU(m) && f >= m.at ? i : acc), -1);
  return (
    <div style={{ position: "absolute", left: SIDE_W, right: 0, top: 0, bottom: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, borderBottom: `1px solid ${K.border}`, display: "flex", alignItems: "center", padding: "0 30px", gap: 12, fontFamily: SANS, fontSize: 19, color: K.sub }}>
        {project ? <><span>{project}</span><span>/</span></> : null}
        <span style={{ color: K.text, fontWeight: 600 }}>{title}</span>
        <div style={{ flex: 1 }} />
        <div style={{ border: `1px solid ${K.border}`, borderRadius: 10, padding: "8px 16px", color: K.text, fontSize: 17 }}>Share</div>
      </div>
      <div
        style={{
          position: "absolute", left: g.left - SIDE_W, width: g.width, top: 72, bottom: 1080 - 92 - g.top + 18 + 92, overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "flex-end", fontFamily: SERIF, fontSize: 23, lineHeight: 1.5, color: K.text,
        }}
      >
        {msgs.map((m, i) => {
          if (isU(m)) return f >= m.send ? <UserBubble key={i} text={m.u} file={m.file} /> : null;
          if (f < m.at) return null;
          const budget = Math.floor(((f - m.at) / 30) * (m.wps ?? 15));
          const streaming = f < msgEnd(m);
          return (
            <div key={i} style={{ margin: "0 0 22px", opacity: p01(f, m.at, 6) }}>
              <Blocks blocks={m.blocks} budget={budget} f={f} />
              {i === lastC ? <div style={{ marginTop: 4, transform: streaming ? `rotate(${f * 6}deg)` : "none", width: 30 }}><Spark size={30} /></div> : null}
            </div>
          );
        })}
        {pendingC ? (
          <div style={{ margin: "0 0 22px", display: "flex", alignItems: "center", gap: 12, color: K.sub, fontFamily: SANS, fontSize: 19 }}>
            <div style={{ transform: `rotate(${f * 8}deg) scale(${0.9 + 0.1 * Math.sin(f / 4)})` }}><Spark size={30} /></div>
          </div>
        ) : null}
      </div>
      <Composer left={g.left - SIDE_W} top={g.top - 92} width={g.width} height={g.h} text={typing ? typed(typing.u, f, typing.typeAt, typing.cps ?? 16) : ""} f={f} focus={!!typing} placeholder="Reply to Claude..." file={typing?.file} />
      <div style={{ position: "absolute", left: g.left - SIDE_W, width: g.width, top: g.top - 92 + g.h + 12, textAlign: "center", fontFamily: SANS, fontSize: 15, color: K.faint }}>
        Claude can make mistakes. Please double-check responses.
      </div>
      {artOn && art ? <ArtifactPanel f={f} art={art} /> : null}
    </div>
  );
};

export const ArtifactPanel: React.FC<{ f: number; art: Artifact }> = ({ f, art }) => {
  const v2 = art.v2 && f >= art.v2.at;
  const cur = v2 && art.v2 ? art.v2 : art;
  const budget = Math.floor(((f - cur.at) / 30) * (art.wps ?? 22));
  return (
    <div style={{ position: "absolute", left: 1110 - SIDE_W, right: 20, top: 80, bottom: 24, background: K.card, border: `1px solid ${K.border}`, borderRadius: 18, boxShadow: "0 10px 40px rgba(40,35,20,0.08)", opacity: p01(f, art.at, 10), overflow: "hidden" }}>
      <div style={{ height: 64, borderBottom: `1px solid ${K.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 14, fontFamily: SANS }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={K.sub} strokeWidth={1.8}><path d={IC.doc} /></svg>
        <span style={{ fontSize: 20, fontWeight: 600 }}>{art.title}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 16, color: K.sub, border: `1px solid ${K.border}`, borderRadius: 8, padding: "4px 10px", background: v2 ? "#F6E4DC" : "transparent" }}>{v2 ? "Version 2" : "Version 1"}</span>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 84, bottom: 20, overflow: "hidden", fontFamily: SERIF, fontSize: 22, lineHeight: 1.5, color: K.text }}>
        <Blocks blocks={cur.blocks} budget={budget} f={f} size={22} />
      </div>
    </div>
  );
};

/** Floating tutorial callout card (info = dark, warn = amber). */
export const Callout: React.FC<{ f: number; from: number; to: number; x: number; y: number; w?: number; tone?: "info" | "warn" | "ok"; title: string; lines?: string[] }> = ({
  f, from, to, x, y, w = 520, tone = "info", title, lines = [],
}) => {
  const o = Math.min(p01(f, from, 12), 1 - p01(f, to - 10, 10));
  if (o <= 0) return null;
  const bg = tone === "warn" ? "#FFF6E0" : tone === "ok" ? "#EAF6EC" : "rgba(31,30,27,0.95)";
  const fg = tone === "info" ? "#fff" : K.text;
  const bar = tone === "warn" ? "#E0A100" : tone === "ok" ? "#3E9B57" : K.clay;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - p01(f, from, 12)) * 20}px)`, background: bg, color: fg, borderRadius: 16, padding: "20px 24px 20px 28px", fontFamily: SANS, boxShadow: "0 18px 40px rgba(0,0,0,0.18)", borderLeft: `6px solid ${bar}`, boxSizing: "border-box" }}>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 20, marginTop: 10, opacity: p01(f, from + 10 + i * 12, 10), color: tone === "info" ? "#E9E6DD" : "#3C3A35" }}>{l}</div>
      ))}
    </div>
  );
};

/** Chapter chip, top-right, at the start of each scene. */
export const Chapter: React.FC<{ f: number; n: number; title: string }> = ({ f, n, title }) => {
  const o = Math.min(p01(f, 4, 12), 1 - p01(f, 110, 14));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", right: 36, top: 112, opacity: o, transform: `translateX(${(1 - p01(f, 4, 12)) * 40}px)`, display: "flex", alignItems: "center", gap: 14, background: "rgba(31,30,27,0.94)", color: "#fff", borderRadius: 14, padding: "12px 22px 12px 14px", fontFamily: SANS, boxShadow: "0 14px 36px rgba(0,0,0,0.22)" }}>
      <div style={{ background: K.clay, borderRadius: 9, padding: "6px 10px", fontWeight: 700, fontSize: 20 }}>{String(n).padStart(2, "0")}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{title}</div>
    </div>
  );
};

/** UI sounds that follow the on-screen actions. */
export type Typing = { at: number; len: number };
export const Sfx: React.FC<{ clicks?: number[]; typing?: Typing[] }> = ({ clicks = [], typing = [] }) => (
  <>
    {clicks.map((c, i) => (
      <Sequence key={`c${i}`} from={c} durationInFrames={12} layout="none">
        <Audio src={staticFile("audio/sfx_click.wav")} volume={0.55} />
      </Sequence>
    ))}
    {typing.map((t, i) => (
      <Sequence key={`t${i}`} from={t.at} durationInFrames={Math.max(1, t.len)} layout="none">
        <Audio src={staticFile("audio/sfx_typing.wav")} volume={0.32} trimBefore={(i * 37) % 120} />
      </Sequence>
    ))}
  </>
);
/** Typing ranges for every user message in a chat. */
export const chatTyping = (msgs: Msg[]): Typing[] => msgs.filter(isU).map((m) => ({ at: m.typeAt, len: Math.min(m.send - m.typeAt - 6, typeLen(m.u, m.cps ?? 16)) }));
export const chatSends = (msgs: Msg[]) => msgs.filter(isU).map((m) => m.send);
export const useF = () => useCurrentFrame();
export { Caret };
