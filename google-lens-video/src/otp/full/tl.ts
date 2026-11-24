import data from '../full_timeline.json';
import {OCue as FCue} from '../timeline';

export type FScene = {id: string; title: string; from: number; dur: number; cues: FCue[]};
export const FT = data as {fps: number; durationInFrames: number; scenes: FScene[]};
export const sc = (id: string) => FT.scenes.find((s) => s.id === id)!;

/** scene-local helpers: c(i) cue start, e(i) cue end, w(i, word) when a word is spoken */
export const loc = (s: FScene) => {
  const c = (i: number) => s.cues[i].from - s.from;
  const e = (i: number) => s.cues[i].from + s.cues[i].dur - s.from;
  const w = (i: number, word: string, nth = 0) => {
    const t = s.cues[i].text;
    let idx = -1;
    for (let k = 0; k <= nth; k++) idx = t.indexOf(word, idx + 1);
    if (idx < 0) idx = 0;
    return Math.round(c(i) + (s.cues[i].dur * idx) / t.length);
  };
  return {c, e, w, dur: s.dur, n: s.cues.length};
};
