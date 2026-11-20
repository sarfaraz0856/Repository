// Per-scene wrapper: browser + Claude sidebar, then overlays (callouts, step chip, chapter, cursor, sounds).
import React from "react";
import { Browser, Cursor, DemoTag, K, Sidebar, StepChip, Tab, p01, sideItemY, sy, typed } from "./ui";
import { Chapter, Sfx, Typing } from "./chat";

export const CLAUDE_TAB: Tab = { t: "Claude", kind: "claude" };
export const sideTarget = (i: number) => [160, sy(sideItemY(i) + 24)] as [number, number];
export type P = [number, number, number];
/** Build a cursor path from [frame, [x,y]] stops. */
export const path = (...stops: [number, [number, number]][]): P[] => stops.map(([fr, [x, y]]) => [fr, x, y]);

export const Shell: React.FC<{
  f: number; dur: number; n: number; chapter: string; url: string; tabs?: Tab[]; active?: number; download?: number;
  side?: { active?: string; hover?: string } | null; screen: React.ReactNode; over?: React.ReactNode;
  steps?: { from: number; to: number; n: number; text: string }[]; cursor: P[]; clicks: number[]; typing?: Typing[];
}> = ({ f, dur, n, chapter, url, tabs, active, download, side = {}, screen, over, steps = [], cursor, clicks, typing = [] }) => (
  <div style={{ position: "absolute", inset: 0, background: K.page, opacity: Math.min(p01(f, 0, 6), 1 - p01(f, dur - 4, 4)) }}>
    <Browser url={url} tabs={tabs ?? [CLAUDE_TAB]} active={active} download={download}>
      {side ? <Sidebar active={side.active} hover={side.hover} /> : null}
      {screen}
    </Browser>
    {over}
    <StepChip f={f} steps={steps} />
    <Chapter f={f} n={n} title={chapter} />
    <Cursor f={f} path={cursor} clicks={clicks} />
    <DemoTag />
    <Sfx clicks={clicks} typing={typing} />
  </div>
);

/** Text typed across several segments (each appended after the previous one). */
export const typedSeq = (base: string, segs: { t: string; at: number; cps?: number }[], f: number) =>
  base + segs.map((s) => typed(s.t, f, s.at, s.cps ?? 18)).join("");
export const segTyping = (segs: { t: string; at: number; cps?: number }[]): Typing[] => segs.map((s) => ({ at: s.at, len: Math.ceil((s.t.length / (s.cps ?? 18)) * 30) }));
