import React from 'react';

export type SneakerPalette = {
  upper: [string, string]; // light, shade
  toe: string;
  accent: [string, string];
  sole: [string, string];
  outsole: string;
  lace: string;
  collar: string;
};

export const PALETTES: Record<string, SneakerPalette> = {
  hero: {
    upper: ['#FAFAF8', '#D5D8DE'],
    toe: '#E9EBEF',
    accent: ['#FF6A4D', '#D9362B'],
    sole: ['#FFFFFF', '#E3E4E8'],
    outsole: '#2A2E36',
    lace: '#FFFFFF',
    collar: '#2B2F38',
  },
  navy: {
    upper: ['#3B4B6E', '#1E2A44'],
    toe: '#2A3756',
    accent: ['#FFFFFF', '#D8DDE8'],
    sole: ['#FFFFFF', '#E2E4EA'],
    outsole: '#1A1D24',
    lace: '#F2F4F8',
    collar: '#141A2A',
  },
  black: {
    upper: ['#3A3D44', '#16181C'],
    toe: '#24262B',
    accent: ['#FF5A4A', '#C7271C'],
    sole: ['#F5F5F5', '#D6D7DB'],
    outsole: '#101114',
    lace: '#2E3036',
    collar: '#0D0E10',
  },
  sage: {
    upper: ['#E8EEE6', '#BFCBBE'],
    toe: '#D5DED3',
    accent: ['#3FB36A', '#23864A'],
    sole: ['#FFFDF6', '#E8E3D2'],
    outsole: '#7A6A52',
    lace: '#FFFFFF',
    collar: '#45503F',
  },
  sky: {
    upper: ['#F7F9FD', '#D1D9E8'],
    toe: '#E6ECF6',
    accent: ['#5C9BFF', '#2F6FE0'],
    sole: ['#FFFFFF', '#E1E5EE'],
    outsole: '#3A4458',
    lace: '#FFFFFF',
    collar: '#27324A',
  },
  sand: {
    upper: ['#EFE3D0', '#C9B497'],
    toe: '#DCCAB0',
    accent: ['#FBBC05', '#D89A00'],
    sole: ['#FFFFFF', '#E8E2D6'],
    outsole: '#5A4632',
    lace: '#FBF6EE',
    collar: '#4A3B2A',
  },
};

/** Photoreal-styled side-profile sneaker (original vector artwork). viewBox 600x320 */
export const Sneaker: React.FC<{
  palette?: SneakerPalette;
  id: string;
  width: number;
  shadow?: boolean;
}> = ({palette = PALETTES.hero, id, width, shadow = true}) => {
  const p = palette;
  const g = (n: string) => `${id}-${n}`;
  const laces = [
    [228, 148],
    [248, 137],
    [266, 125],
    [282, 113],
    [296, 101],
  ];
  return (
    <svg width={width} height={(width * 320) / 600} viewBox="0 0 600 320" style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id={g('upper')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.upper[0]} />
          <stop offset="1" stopColor={p.upper[1]} />
        </linearGradient>
        <linearGradient id={g('accent')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={p.accent[0]} />
          <stop offset="1" stopColor={p.accent[1]} />
        </linearGradient>
        <linearGradient id={g('sole')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sole[0]} />
          <stop offset="1" stopColor={p.sole[1]} />
        </linearGradient>
        <linearGradient id={g('shine')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={g('window')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE3FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7FA9E8" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id={g('shadow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.42" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id={g('soft')} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {shadow && <ellipse cx="305" cy="290" rx="290" ry="22" fill={`url(#${g('shadow')})`} />}

      {/* Outsole */}
      <path d="M46,262 L568,256 C572,270 566,284 548,288 L84,292 C60,292 46,280 46,262 Z" fill={p.outsole} />
      {Array.from({length: 22}).map((_, i) => (
        <rect key={i} x={70 + i * 22} y={284} width={10} height={5} rx={2} fill="#000" opacity={0.25} />
      ))}

      {/* Midsole */}
      <path
        d="M40,248 C40,232 58,224 88,224 L540,218 C560,218 572,230 572,246 L572,258 C572,268 564,274 548,274 L82,280 C56,280 40,268 40,256 Z"
        fill={`url(#${g('sole')})`}
      />
      <path d="M70,262 C200,258 380,254 560,250" stroke="#000" strokeOpacity="0.08" strokeWidth="2" fill="none" />
      {/* Cushion window */}
      <rect x="430" y="232" width="96" height="24" rx="12" fill={`url(#${g('window')})`} opacity="0.85" />
      <rect x="436" y="235" width="84" height="6" rx="3" fill="#fff" opacity="0.6" />

      {/* Upper */}
      <path
        d="M58,226 C44,214 46,194 70,186 C110,173 170,164 220,150 C260,138 285,118 305,96 L318,82 C326,74 338,72 348,76 L372,86 C400,98 440,98 470,86 L500,74 C522,66 545,76 550,96 C556,130 564,180 566,222 Z"
        fill={`url(#${g('upper')})`}
      />
      {/* Toe cap */}
      <path d="M58,226 C44,214 46,194 70,186 C96,178 122,174 146,172 C132,192 130,212 138,226 Z" fill={p.toe} />
      <path d="M140,224 C132,208 134,190 148,174" stroke="#000" strokeOpacity="0.12" strokeWidth="1.6" strokeDasharray="4 4" fill="none" />
      {/* Heel counter */}
      <path d="M488,118 C510,106 538,98 552,104 C558,140 562,184 566,222 L486,224 C478,190 478,150 488,118 Z" fill={p.toe} />
      <path d="M492,122 C484,152 484,190 490,220" stroke="#000" strokeOpacity="0.12" strokeWidth="1.6" strokeDasharray="4 4" fill="none" />
      {/* Heel pull tab */}
      <path d="M540,74 C552,70 560,78 558,92 L552,104 C548,92 544,82 540,74 Z" fill={p.accent[1]} />

      {/* Side accent sweep */}
      <path
        d="M166,222 C238,200 330,160 432,116 C446,110 456,124 444,134 C364,184 272,216 206,228 Z"
        fill={`url(#${g('accent')})`}
      />
      <path d="M190,222 C262,202 340,168 430,126" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />

      {/* Tongue */}
      <path d="M300,100 C306,80 314,58 326,48 C338,40 356,42 362,52 L374,88 C350,96 322,100 300,100 Z" fill={p.upper[0]} />
      <path d="M318,56 C330,46 348,46 356,54" stroke={p.accent[0]} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Collar opening */}
      <path d="M366,90 C398,106 450,104 478,90 L502,78 C490,72 470,78 450,84 C420,92 394,94 366,90 Z" fill={p.collar} />

      {/* Eyelets & laces */}
      {laces.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x + 6} cy={y + 10} r="3.4" fill="#000" opacity="0.35" />
          <path d={`M${x - 14},${y - 8} C${x - 4},${y - 4} ${x + 6},${y + 4} ${x + 14},${y + 12}`} stroke="#000" strokeOpacity="0.18" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d={`M${x - 14},${y - 10} C${x - 4},${y - 6} ${x + 6},${y + 2} ${x + 14},${y + 10}`} stroke={p.lace} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        </g>
      ))}

      {/* Stitch lines on upper */}
      <path d="M74,198 C130,184 190,172 236,158" stroke="#000" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      {/* Global lighting */}
      <path
        d="M58,226 C44,214 46,194 70,186 C110,173 170,164 220,150 C260,138 285,118 305,96 L318,82 C326,74 338,72 348,76 L372,86 C400,98 440,98 470,86 L500,74 C522,66 545,76 550,96 C556,130 564,180 566,222 Z"
        fill={`url(#${g('shine')})`}
      />
      <path d="M80,190 C140,176 200,166 250,148" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" fill="none" filter={`url(#${g('soft')})`} />
      <path d="M60,236 C200,232 380,228 560,226" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" fill="none" />
    </svg>
  );
};
