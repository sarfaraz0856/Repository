import data from './timeline.json';

export type FCue = {file: string; text: string; from: number; dur: number};
type Beats = {
  gantry: number; read: number; ok: number; barrierUp: number; carOut: number; chip: number; sms: number; debit: number; roadOut: number;
  cash: number; card: number; stop: number; how: number; qOut: number; windshield: number; sticker: number; title: number; end: number;
};
export const FTL = data as {fps: number; durationInFrames: number; cues: FCue[]; beats: Beats};
export const FB = FTL.beats;
