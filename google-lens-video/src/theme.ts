export const FPS = 30;
export const DURATION = 450; // exactly 15 s
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const C = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
  ink: '#1A1F2B',
  sub: '#5B6475',
  faint: '#8A93A6',
};

export const FONT_UI = "'Inter', system-ui, sans-serif";
export const FONT_HEAD = "'Plus Jakarta Sans', 'Inter', sans-serif";

// Phone geometry (composition coordinates)
export const PHONE = {w: 430, h: 880, x: 745, y: 100, inset: 14};
export const SCREEN = {
  w: PHONE.w - PHONE.inset * 2, // 402
  h: PHONE.h - PHONE.inset * 2, // 852
  x: PHONE.x + PHONE.inset, // 759
  y: PHONE.y + PHONE.inset, // 114
};

// Timeline (frames)
export const T = {
  introEnd: 90,
  scanStart: 90,
  aiStart: 180,
  resultsStart: 300,
  finalStart: 390,
  fadeStart: 420,
};
