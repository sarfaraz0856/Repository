import data from './timeline.json';

export type Cue = {file: string; text: string; from: number; dur: number};
export type SceneData = {id: string; title: string; from: number; dur: number; cues: Cue[]};

export const TL = data as {fps: number; durationInFrames: number; scenes: SceneData[]};
export const SCENES = TL.scenes;
export const sceneById = (id: string) => SCENES.find((s) => s.id === id)!;

/** Scene-local helper: cue starts/ends and word timings in frames relative to the scene start */
export const local = (s: SceneData) => {
  const c = (i: number) => s.cues[i].from - s.from;
  const e = (i: number) => s.cues[i].from + s.cues[i].dur - s.from;
  /** approximate local frame at which `word` is spoken inside cue i (by character position) */
  const w = (i: number, word: string, nth = 0) => {
    const t = s.cues[i].text;
    let idx = -1;
    for (let k = 0; k <= nth; k++) idx = t.indexOf(word, idx + 1);
    if (idx < 0) idx = 0;
    return Math.round(c(i) + (s.cues[i].dur * idx) / t.length);
  };
  return {c, e, w, dur: s.dur, n: s.cues.length};
};
