import React from 'react';
import {FONT_UI} from '../theme';
import {SH, SW} from './kit';

// ---------------------------------------------------------------- camera backgrounds (screen units)
export const GardenBg: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #B9CDB2 0%, #9DB596 50%, #7E9A78 62%, #C9BBA4 63%, #B3A58D 100%)'}}>
    {[[60, 180, 120, '#E8F2D8'], [330, 140, 150, '#DCEBC9'], [210, 90, 90, '#F4F8E8'], [40, 420, 140, '#8FAE84'], [360, 400, 120, '#A7C29A']].map(([x, y, r, c], i) => (
      <div key={i} style={{position: 'absolute', left: (x as number) - (r as number), top: (y as number) - (r as number), width: (r as number) * 2, height: (r as number) * 2, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 70%)`, opacity: 0.75}} />
    ))}
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.28) 100%)'}} />
  </div>
);

export const OutdoorBg: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #8EC0F2 0%, #BCD9F6 45%, #E9EEF2 62%, #CFC7B8 63%, #B9AF9E 100%)'}}>
    <div style={{position: 'absolute', left: -20, top: 120, width: 200, height: 60, borderRadius: 40, background: 'rgba(255,255,255,0.75)', filter: 'blur(8px)'}} />
    <div style={{position: 'absolute', left: 250, top: 190, width: 180, height: 46, borderRadius: 40, background: 'rgba(255,255,255,0.6)', filter: 'blur(8px)'}} />
    <svg width={SW} height={SH} style={{position: 'absolute', inset: 0}}>
      <path d="M0,540 L0,470 L40,470 L40,440 L80,440 L80,480 L120,480 L120,520 L0,540 Z" fill="#A9B5C2" opacity="0.7" />
      <path d="M402,540 L402,460 L360,460 L360,430 L320,430 L320,480 L285,480 L285,520 Z" fill="#A9B5C2" opacity="0.7" />
      {Array.from({length: 9}).map((_, i) => <line key={i} x1={i * 50 - 20} y1={SH} x2={201 + (i - 4) * 12} y2={540} stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />)}
    </svg>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.22) 100%)'}} />
  </div>
);

export const DeskBg: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #C79F74 0%, #B08458 55%, #94693F 100%)'}}>
    <svg width={SW} height={SH} style={{position: 'absolute', inset: 0, opacity: 0.18}}>
      {Array.from({length: 26}).map((_, i) => (
        <path key={i} d={`M-20,${i * 36} C120,${i * 36 + 14} 260,${i * 36 - 12} 430,${i * 36 + 8}`} stroke="#5A3A1C" strokeWidth={1 + (i % 3)} fill="none" />
      ))}
    </svg>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 30% 25%, rgba(255,240,220,0.35), transparent 60%), radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.3) 100%)'}} />
  </div>
);

export const WallBg: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #D9D4CC 0%, #C9C2B8 100%)'}}>
    <svg width={SW} height={SH} style={{position: 'absolute', inset: 0, opacity: 0.25}}>
      {Array.from({length: 22}).map((_, r) => Array.from({length: 5}).map((__, c) => (
        <rect key={`${r}-${c}`} x={c * 96 - (r % 2) * 48} y={r * 40} width={92} height={36} rx={3} fill="none" stroke="#8C8173" strokeWidth="1.5" />
      )))}
    </svg>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.3) 100%)'}} />
  </div>
);

// ---------------------------------------------------------------- subjects
export const Plant: React.FC<{width: number}> = ({width}) => (
  <svg width={width} height={(width * 400) / 300} viewBox="0 0 300 400" style={{overflow: 'visible', display: 'block'}}>
    <defs>
      <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4FA35A" /><stop offset="1" stopColor="#1F6B33" /></linearGradient>
      <linearGradient id="pot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#D9825A" /><stop offset="0.5" stopColor="#E9A27D" /><stop offset="1" stopColor="#B9603C" /></linearGradient>
      <radialGradient id="pshadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#000" stopOpacity="0.4" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="150" cy="392" rx="110" ry="14" fill="url(#pshadow)" />
    {[['M150,290 C140,230 120,200 90,170', -1], ['M150,290 C155,220 170,170 205,140', 1], ['M150,290 C150,240 148,200 150,120', 0], ['M150,290 C130,250 90,240 60,250', -1], ['M150,290 C175,255 215,245 245,255', 1]].map(([d], i) => (
      <path key={i} d={d as string} stroke="#2E7D3A" strokeWidth="5" fill="none" strokeLinecap="round" />
    ))}
    {[[90, 165, -30, 1], [205, 135, 25, 1.05], [150, 112, 0, 0.95], [58, 248, -70, 0.85], [245, 250, 70, 0.85]].map(([x, y, rot, s], i) => (
      <g key={i} transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
        <path d="M0,0 C-48,-10 -62,-70 -30,-104 C-10,-122 10,-122 30,-104 C62,-70 48,-10 0,0 Z" fill="url(#leaf)" />
        <path d="M0,0 L0,-110" stroke="#9ED39F" strokeWidth="2" opacity="0.6" />
        {[-1, 1].map((sd) => [30, 55, 80].map((yy, k) => (
          <path key={`${sd}${k}`} d={`M${sd * 12},${-yy} L${sd * 52},${-yy + 18}`} stroke="#E6EFE0" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        )))}
      </g>
    ))}
    <path d="M85,285 L215,285 L200,385 C198,392 192,395 185,395 L115,395 C108,395 102,392 100,385 Z" fill="url(#pot)" />
    <rect x="78" y="276" width="144" height="22" rx="6" fill="#C96F48" />
  </svg>
);

export const Landmark: React.FC<{width: number}> = ({width}) => (
  <svg width={width} height={(width * 480) / 300} viewBox="0 0 300 480" style={{overflow: 'visible', display: 'block'}}>
    <defs>
      <linearGradient id="stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E7DCC8" /><stop offset="0.6" stopColor="#D8CAB0" /><stop offset="1" stopColor="#B9A98C" /></linearGradient>
      <linearGradient id="roof" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5E7A8C" /><stop offset="1" stopColor="#3D5566" /></linearGradient>
    </defs>
    <path d="M150,8 L178,120 L122,120 Z" fill="url(#roof)" />
    <rect x="146" y="0" width="8" height="16" fill="#C9A44C" />
    <rect x="108" y="118" width="84" height="20" fill="#CDBEA2" />
    <rect x="114" y="136" width="72" height="110" fill="url(#stone)" />
    <circle cx="150" cy="190" r="28" fill="#F7F3EA" stroke="#8E7B5C" strokeWidth="5" />
    <path d="M150,190 L150,172 M150,190 L163,197" stroke="#3D3426" strokeWidth="3.5" strokeLinecap="round" />
    <rect x="96" y="244" width="108" height="16" fill="#CDBEA2" />
    <rect x="102" y="258" width="96" height="200" fill="url(#stone)" />
    {[0, 1].map((r) => [0, 1, 2].map((c) => (
      <path key={`${r}${c}`} d={`M${116 + c * 26},${300 + r * 70} v-22 a10,10 0 0 1 20,0 v22 z`} fill="#6E6A63" opacity="0.75" />
    )))}
    <path d="M128,458 v-36 a22,22 0 0 1 44,0 v36 z" fill="#4E4A44" />
    <rect x="60" y="456" width="180" height="16" rx="2" fill="#BFB29A" />
    {Array.from({length: 12}).map((_, i) => <line key={i} x1="102" y1={270 + i * 16} x2="198" y2={270 + i * 16} stroke="#A8987C" strokeOpacity="0.35" strokeWidth="1" />)}
  </svg>
);

/** Handwritten notes (scribbled ink strokes on lined paper) */
export const Notes: React.FC<{width: number}> = ({width}) => {
  const lines = Array.from({length: 9});
  return (
    <svg width={width} height={(width * 400) / 320} viewBox="0 0 320 400" style={{overflow: 'visible', display: 'block'}}>
      <g transform="rotate(-4 160 200)">
        <rect x="10" y="10" width="300" height="380" rx="6" fill="#FFFDF6" style={{filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.3))'}} />
        <line x1="54" y1="10" x2="54" y2="390" stroke="#EA4335" strokeOpacity="0.5" strokeWidth="2" />
        {lines.map((_, i) => <line key={i} x1="10" y1={70 + i * 36} x2="310" y2={70 + i * 36} stroke="#8AB4F8" strokeOpacity="0.55" strokeWidth="1.4" />)}
        <path d="M70,52 c8,-14 14,-14 16,0 c4,-12 10,-14 14,0 m10,-6 c10,-6 18,0 10,8 c-8,6 2,8 12,0 m10,-10 l0,14 m10,-14 c10,-4 18,6 6,12" stroke="#1F3A8A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {lines.slice(0, 8).map((_, i) => {
          const y = 64 + i * 36;
          const len = 200 - ((i * 37) % 80);
          let d = `M70,${y}`;
          for (let x = 0; x < len; x += 12) d += ` q3,${-9 - ((x + i) % 5)} 6,0 q3,${6 + ((x * 3 + i) % 4)} 6,0`;
          return <path key={i} d={d} stroke="#1F3A8A" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />;
        })}
      </g>
    </svg>
  );
};

/** Printed page with real text; LINES gives OCR geometry in page units (viewBox 300 x 390) */
export const PAGE_LINES = [
  {y: 52, h: 22, text: 'Visual Search Basics', size: 19, w: 214, bold: true},
  {y: 92, h: 14, text: 'A camera image can act as a search', size: 12.5, w: 238},
  {y: 114, h: 14, text: 'query. Software detects objects,', size: 12.5, w: 218},
  {y: 136, h: 14, text: 'reads printed text and compares', size: 12.5, w: 222},
  {y: 158, h: 14, text: 'visual features with indexed images.', size: 12.5, w: 246},
  {y: 196, h: 16, text: 'Key steps', size: 14, w: 80, bold: true},
  {y: 222, h: 14, text: '1. Capture a clear photo.', size: 12.5, w: 172},
  {y: 244, h: 14, text: '2. Detect text and objects.', size: 12.5, w: 186},
  {y: 266, h: 14, text: '3. Show relevant results.', size: 12.5, w: 176},
];
export const PrintedPage: React.FC<{width: number; hi?: number[]}> = ({width, hi = []}) => (
  <svg width={width} height={(width * 390) / 300} viewBox="0 0 300 390" style={{overflow: 'visible', display: 'block'}}>
    <rect x="0" y="0" width="300" height="390" rx="4" fill="#FFFFFF" style={{filter: 'drop-shadow(0 12px 22px rgba(0,0,0,0.32))'}} />
    {PAGE_LINES.map((l, i) => (
      <g key={i}>
        {hi[i] > 0 && <rect x={24} y={l.y - l.h + 1} width={l.w * hi[i]} height={l.h + 5} rx={3} fill="#8AB4F8" opacity={0.45} />}
        <text x={26} y={l.y} fontFamily={FONT_UI} fontSize={l.size} fontWeight={l.bold ? 700 : 400} fill="#202124">{l.text}</text>
      </g>
    ))}
    {[300, 322, 344].map((y, i) => <rect key={i} x={26} y={y} width={230 - i * 40} height={7} rx={3} fill="#DADCE0" />)}
  </svg>
);

/** Street sign: Spanish text morphing into English with progress t (0..1) */
export const SIGN_TEXT = {
  es: ['BIENVENIDOS', 'AL MUSEO', 'Entrada por la puerta lateral'],
  en: ['WELCOME', 'TO THE MUSEUM', 'Entrance through the side door'],
};
export const Sign: React.FC<{width: number; t?: number}> = ({width, t = 0}) => {
  const line = (i: number, y: number, size: number, weight: number) => (
    <g>
      <text x="170" y={y} textAnchor="middle" fontFamily={FONT_UI} fontSize={size} fontWeight={weight} fill="#fff" opacity={1 - t}>{SIGN_TEXT.es[i]}</text>
      <text x="170" y={y} textAnchor="middle" fontFamily={FONT_UI} fontSize={size} fontWeight={weight} fill="#fff" opacity={t}>{SIGN_TEXT.en[i]}</text>
    </g>
  );
  return (
    <svg width={width} height={(width * 240) / 340} viewBox="0 0 340 240" style={{overflow: 'visible', display: 'block'}}>
      <rect x="160" y="200" width="20" height="60" fill="#5F6368" />
      <rect x="4" y="4" width="332" height="200" rx="16" fill="#1A4F8B" style={{filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.35))'}} />
      <rect x="14" y="14" width="312" height="180" rx="10" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" />
      {line(0, 78, 36, 800)}
      {line(1, 122, 30, 700)}
      <line x1="60" y1="142" x2="280" y2="142" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
      {line(2, 172, 15, 500)}
    </svg>
  );
};

export const MENU = {
  es: {title: 'Menú del día', items: [['Sopa de tomate', '6,50'], ['Pollo asado', '12,90'], ['Tarta de manzana', '5,20']]},
  en: {title: 'Menu of the day', items: [['Tomato soup', '6.50'], ['Roast chicken', '12.90'], ['Apple tart', '5.20']]},
};
export const Menu: React.FC<{width: number; t?: number}> = ({width, t = 0}) => (
  <svg width={width} height={(width * 360) / 280} viewBox="0 0 280 360" style={{overflow: 'visible', display: 'block'}}>
    <rect x="0" y="0" width="280" height="360" rx="10" fill="#FBF6EA" style={{filter: 'drop-shadow(0 12px 22px rgba(0,0,0,0.32))'}} />
    <rect x="12" y="12" width="256" height="336" rx="6" fill="none" stroke="#B08B4F" strokeWidth="2" />
    {(['es', 'en'] as const).map((k) => (
      <g key={k} opacity={k === 'es' ? 1 - t : t}>
        <text x="140" y="66" textAnchor="middle" fontFamily={FONT_UI} fontSize="24" fontWeight="800" fill="#5A3E1B">{MENU[k].title}</text>
        {MENU[k].items.map(([name, price], i) => (
          <g key={i}>
            <text x="34" y={130 + i * 62} fontFamily={FONT_UI} fontSize="17" fontWeight="600" fill="#3B2A14">{name}</text>
            <text x="246" y={130 + i * 62} textAnchor="end" fontFamily={FONT_UI} fontSize="16" fontWeight="700" fill="#8A5A1C">€{price}</text>
          </g>
        ))}
      </g>
    ))}
    {[0, 1, 2].map((i) => <line key={i} x1="34" y1={146 + i * 62} x2="246" y2={146 + i * 62} stroke="#B08B4F" strokeOpacity="0.3" strokeDasharray="3 4" />)}
  </svg>
);

// ---------------------------------------------------------------- category products (viewBox 200 x 200)
const Wrap: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{display: 'block', overflow: 'visible'}}>
    <ellipse cx="100" cy="186" rx="70" ry="9" fill="#000" opacity="0.18" />
    {children}
  </svg>
);
export const Jacket: React.FC<{size: number}> = ({size}) => (
  <Wrap size={size}>
    <defs><linearGradient id="jk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5C7CB8" /><stop offset="1" stopColor="#2E4A7E" /></linearGradient></defs>
    <path d="M70,24 L100,38 L130,24 L170,44 L186,150 L160,156 L156,100 L154,178 L46,178 L44,100 L40,156 L14,150 L30,44 Z" fill="url(#jk)" />
    <path d="M100,38 L100,178" stroke="#1E3258" strokeWidth="3" />
    <path d="M70,24 L100,62 L130,24" stroke="#C9D6EE" strokeWidth="4" fill="none" />
    <rect x="62" y="120" width="26" height="6" rx="3" fill="#1E3258" /><rect x="112" y="120" width="26" height="6" rx="3" fill="#1E3258" />
  </Wrap>
);
export const Chair: React.FC<{size: number}> = ({size}) => (
  <Wrap size={size}>
    <defs><linearGradient id="ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2C14E" /><stop offset="1" stopColor="#D99A1E" /></linearGradient></defs>
    <path d="M56,30 C56,18 144,18 144,30 L140,104 L60,104 Z" fill="url(#ch)" />
    <path d="M44,104 L156,104 L150,124 L50,124 Z" fill="#E3AA2E" />
    {[[58, 124, 50, 182], [142, 124, 150, 182], [80, 124, 84, 172], [120, 124, 116, 172]].map(([a, b, c, d], i) => <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="#6B4A22" strokeWidth="6" strokeLinecap="round" />)}
  </Wrap>
);
export const Watch: React.FC<{size: number}> = ({size}) => (
  <Wrap size={size}>
    <rect x="76" y="14" width="48" height="172" rx="14" fill="#3C4043" />
    <circle cx="100" cy="100" r="50" fill="#DADCE0" />
    <circle cx="100" cy="100" r="42" fill="#fff" stroke="#9AA0A6" strokeWidth="3" />
    <path d="M100,100 L100,70 M100,100 L120,110" stroke="#202124" strokeWidth="4" strokeLinecap="round" />
    <circle cx="100" cy="100" r="4" fill="#EA4335" />
  </Wrap>
);
export const Mug: React.FC<{size: number}> = ({size}) => (
  <Wrap size={size}>
    <defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7FB8F2" /><stop offset="1" stopColor="#3D7FD1" /></linearGradient></defs>
    <path d="M140,80 c34,0 34,56 0,56" stroke="#3D7FD1" strokeWidth="12" fill="none" />
    <path d="M44,60 L148,60 L140,176 C139,182 134,184 128,184 L64,184 C58,184 53,182 52,176 Z" fill="url(#mg)" />
    <ellipse cx="96" cy="60" rx="52" ry="10" fill="#2D5E9E" />
    <path d="M78,40 c-8,-10 8,-14 0,-26 M104,40 c-8,-10 8,-14 0,-26" stroke="#9AA0A6" strokeWidth="3" fill="none" opacity="0.6" />
  </Wrap>
);
