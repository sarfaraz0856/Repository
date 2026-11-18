export const U = {
  navy: '#07111F',
  navy2: '#0C1B33',
  blue: '#3185FF',
  cyan: '#00D9FF',
  green: '#22C55E',
  white: '#FFFFFF',
  saffron: '#FF9933',
  red: '#F04438',
  ink: '#0F172A',
  sub: '#64748B',
  line: 'rgba(148,180,255,0.18)',
  slate: '#475569',
};
/** Google-Lens-video style light glass */
export const GLASS = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,255,255,0.62))',
  border: '1px solid rgba(255,255,255,0.95)',
  boxShadow: '0 24px 60px rgba(30,45,90,0.13), 0 4px 14px rgba(30,45,90,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
  backdropFilter: 'blur(18px)',
};
/** readable (darker) versions of accent colours for text on the light background */
export const deep = (c: string) => ({'#00D9FF': '#0284C7', '#22C55E': '#15803D', '#FF9933': '#C2410C', '#3185FF': '#1D4ED8', '#F04438': '#C81E1E'} as Record<string, string>)[c] ?? c;
export const UF = {
  ui: "'Inter', system-ui, sans-serif",
  head: "'Plus Jakarta Sans', 'Inter', sans-serif",
  hi: "'Noto Sans Devanagari', 'Inter', sans-serif",
};
