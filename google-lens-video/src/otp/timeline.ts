import data from './timeline.json';

export type OCue = {file: string; text: string; from: number; dur: number};
type Beats = {
  checkout: number; tap: number; otpScreen: number; sms: number; code: number; timer: number; type: number; digits: number[];
  verify: number; success: number; smsOut: number; q1: number; q2: number; q3: number; title: number; end: number;
};
export const OTL = data as {fps: number; durationInFrames: number; cues: OCue[]; beats: Beats};
export const OB = OTL.beats;
