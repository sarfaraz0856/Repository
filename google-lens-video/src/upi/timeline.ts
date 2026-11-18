import data from './timeline.json';

export type UCue = {file: string; text: string; from: number; dur: number};
type Beats = {
  scanDetect: number; amountScreen: number; digits: number[]; payTap: number; pinScreen: number; pinTaps: number[]; pinSubmit: number;
  processing: number; packetsOut: number; shopOut: number; network: number; mobile: number; nodeApp: number; nodePSP: number; nodeNPCI: number; nodeBanks: number;
  flow: number; debit: number; credit: number; confirm: number; success: number; title: number; end: number;
};
export const UT = data as {fps: number; durationInFrames: number; cues: UCue[]; beats: Beats};
export const BT = UT.beats;
