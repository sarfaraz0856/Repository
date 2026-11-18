import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT_UI, SCREEN, T} from '../theme';
import {EIO, EO, ip, mblur, win} from '../anim';
import {LensGlyph, MicIcon, SearchIcon} from './Icons';
import {PALETTES, Sneaker} from './Sneaker';

const W = SCREEN.w; // 402
const H = SCREEN.h; // 852

// Sneaker placement inside the screen
const SN = {w: 340, x: 31, y: 325};
const SCALE = SN.w / 600;
const BOX = {x: 40, y: 330, w: 326, h: 178};
const LENS_ICON = {x: 342, y: 672}; // lens icon in the home search widget

const SPARKS: [number, number][] = [
  [80, 200], [150, 182], [222, 158], [300, 100], [338, 58], [402, 98], [470, 92], [540, 112],
  [522, 182], [440, 196], [360, 168], [280, 200], [196, 214], [118, 236], [262, 248], [400, 244],
  [500, 240], [96, 262], [330, 140], [472, 150], [560, 200], [60, 214],
];
const SPARK_COLORS = [C.blue, C.red, C.yellow, C.green];

export const StatusBar: React.FC<{dark?: boolean}> = ({dark}) => {
  const col = dark ? '#1a1f2b' : '#fff';
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: W, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 34px 0', boxSizing: 'border-box', fontFamily: FONT_UI, fontWeight: 600, fontSize: 16, color: col, zIndex: 20}}>
      <span>9:41</span>
      <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
        <svg width="18" height="12" viewBox="0 0 18 12">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="1" fill={col} />
          ))}
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 11.5l2.2-2.6a3.4 3.4 0 0 0-4.4 0z M8 2a10 10 0 0 1 7 2.8l-1.5 1.7a7.7 7.7 0 0 0-11 0L1 4.8A10 10 0 0 1 8 2z M8 5.6a6.4 6.4 0 0 1 4.5 1.8L11 9a4.2 4.2 0 0 0-6 0L3.5 7.4A6.4 6.4 0 0 1 8 5.6z" fill={col} />
        </svg>
        <div style={{width: 26, height: 12, border: `1.5px solid ${col}`, borderRadius: 4, padding: 1.5, boxSizing: 'border-box', opacity: 0.95}}>
          <div style={{width: '78%', height: '100%', background: col, borderRadius: 1.5}} />
        </div>
      </div>
    </div>
  );
};

const HomeScreen: React.FC<{f: number}> = ({f}) => {
  const press = 1 - 0.1 * Math.sin(Math.PI * ip(f, [38, 50], [0, 1], EIO));
  const ripple = ip(f, [40, 62], [0, 1], EO);
  const apps = [
    ['#4285F4', '#7BAAF7'], ['#EA4335', '#F28B82'], ['#FBBC05', '#FDD663'], ['#34A853', '#81C995'],
  ];
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(165deg, #BFD3FF 0%, #E3D7FF 45%, #FFE1D2 100%)', fontFamily: FONT_UI}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.6), transparent 50%)'}} />
      <div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center', color: '#fff', textShadow: '0 2px 12px rgba(40,50,110,0.25)'}}>
        <div style={{fontSize: 18, fontWeight: 600, opacity: 0.95}}>Tuesday, November 17</div>
        <div style={{fontSize: 92, fontWeight: 300, letterSpacing: -2, lineHeight: 1.05}}>9:41</div>
      </div>
      {/* Search widget */}
      <div style={{position: 'absolute', left: 22, top: 640, width: W - 44, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.82)', boxShadow: '0 10px 30px rgba(60,70,130,0.18)', display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box', gap: 12}}>
        <SearchIcon size={22} color="#5f6675" />
        <span style={{flex: 1, color: '#6b7280', fontSize: 18}}>Search</span>
        <MicIcon size={24} />
        <div style={{position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press})`}}>
          <div style={{position: 'absolute', width: 40, height: 40, borderRadius: 20, background: `rgba(66,133,244,${0.35 * (1 - ripple)})`, transform: `scale(${1 + ripple * 1.6})`}} />
          <LensGlyph size={30} />
        </div>
      </div>
      {/* Dock */}
      <div style={{position: 'absolute', left: 30, top: 742, width: W - 60, display: 'flex', justifyContent: 'space-between'}}>
        {apps.map(([a, b], i) => (
          <div key={i} style={{width: 66, height: 66, borderRadius: 18, background: `linear-gradient(140deg, ${b}, ${a})`, boxShadow: '0 8px 18px rgba(40,50,110,0.18)'}} />
        ))}
      </div>
    </div>
  );
};

// Scene is oversized so the camera view can be re-framed without exposing edges
export const CameraScene: React.FC = () => (
  <div style={{position: 'absolute', left: -70, top: -40, width: W + 140, height: H + 260}}>
    {/* wall */}
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #DCD6CD 0%, #CFC7BB 52%, #BDB4A6 56%, #A9A196 100%)'}} />
    {/* floor plane */}
    <div style={{position: 'absolute', left: 0, top: 510, width: '100%', height: H + 260 - 510, background: 'linear-gradient(180deg, #C2BBAF 0%, #AFA79A 40%, #8E877C 100%)'}} />
    <div style={{position: 'absolute', left: 0, top: 506, width: '100%', height: 10, background: 'linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.10), rgba(0,0,0,0))'}} />
    {/* window light */}
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 25% 20%, rgba(255,250,240,0.55), transparent 60%)'}} />
    {/* plant silhouette, defocused */}
    <div style={{position: 'absolute', left: 370, top: 190, width: 140, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(70,110,80,0.55), transparent 65%)', filter: 'blur(14px)'}} />
    <div style={{position: 'absolute', left: 30, top: 260, width: 160, height: 240, borderRadius: 20, background: 'rgba(255,255,255,0.25)', filter: 'blur(16px)'}} />
    {/* vignette */}
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.28) 100%)'}} />
  </div>
);

const Brackets: React.FC<{f: number}> = ({f}) => {
  const t = ip(f, [T.scanStart + 4, T.scanStart + 32], [0, 1], EIO);
  const from = {x: 34, y: 150, w: W - 68, h: 520};
  const b = {
    x: from.x + (BOX.x - 12 - from.x) * t,
    y: from.y + (BOX.y - 14 - from.y) * t,
    w: from.w + (BOX.w + 24 - from.w) * t,
    h: from.h + (BOX.h + 28 - from.h) * t,
  };
  const op = Math.min(ip(f, [T.scanStart, T.scanStart + 10], [0, 1]), ip(f, [T.aiStart + 2, T.aiStart + 14], [1, 0], EIO));
  if (op <= 0) return null;
  const L = 34;
  const s = {stroke: '#fff', strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const r = 14;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: op, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))'}}>
      <path {...s} d={`M${b.x},${b.y + L} V${b.y + r} Q${b.x},${b.y} ${b.x + r},${b.y} H${b.x + L}`} />
      <path {...s} d={`M${b.x + b.w - L},${b.y} H${b.x + b.w - r} Q${b.x + b.w},${b.y} ${b.x + b.w},${b.y + r} V${b.y + L}`} />
      <path {...s} d={`M${b.x + b.w},${b.y + b.h - L} V${b.y + b.h - r} Q${b.x + b.w},${b.y + b.h} ${b.x + b.w - r},${b.y + b.h} H${b.x + b.w - L}`} />
      <path {...s} d={`M${b.x + L},${b.y + b.h} H${b.x + r} Q${b.x},${b.y + b.h} ${b.x},${b.y + b.h - r} V${b.y + b.h - L}`} />
    </svg>
  );
};

const ScanLine: React.FC<{f: number}> = ({f}) => {
  const a = T.scanStart + 22;
  const b = T.aiStart - 6;
  const op = win(f, a, b, 8, 10);
  if (op <= 0) return null;
  // Down sweep then up sweep, smooth ease-in-out
  const mid = (a + b) / 2;
  const p = f < mid ? ip(f, [a, mid], [0, 1], EIO) : ip(f, [mid, b], [1, 0], EIO);
  const goingDown = f < mid;
  const y = BOX.y - 10 + p * (BOX.h + 20);
  const trail = 70;
  return (
    <div style={{position: 'absolute', left: BOX.x - 10, top: BOX.y - 14, width: BOX.w + 20, height: BOX.h + 28, overflow: 'hidden', opacity: op, borderRadius: 18}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          top: y - (BOX.y - 14) - (goingDown ? trail : 0),
          height: trail,
          background: goingDown
            ? 'linear-gradient(180deg, rgba(66,133,244,0) 0%, rgba(120,170,255,0.38) 100%)'
            : 'linear-gradient(0deg, rgba(66,133,244,0) 0%, rgba(120,170,255,0.38) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          top: y - (BOX.y - 14) - 1.5,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #fff 15%, #E8F0FE 50%, #fff 85%, transparent)',
          boxShadow: '0 0 14px 4px rgba(120,170,255,0.9), 0 0 30px 8px rgba(66,133,244,0.45)',
        }}
      />
    </div>
  );
};

const Sparks: React.FC<{f: number}> = ({f}) => {
  const out = ip(f, [T.aiStart + 4, T.aiStart + 18], [1, 0], EIO);
  if (out <= 0) return null;
  return (
    <>
      {SPARKS.map(([vx, vy], i) => {
        const start = T.scanStart + 34 + ((i * 7) % 22) * 2;
        const a = ip(f, [start, start + 10], [0, 1]);
        const tw = 0.75 + 0.25 * Math.sin((f - start) / 5 + i);
        const x = SN.x + vx * SCALE;
        const y = SN.y + vy * SCALE;
        const col = SPARK_COLORS[i % 4];
        const size = 7 + (i % 3);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#fff',
              border: `2px solid ${col}`,
              boxShadow: `0 0 10px 2px ${col}`,
              opacity: a * tw * out,
              transform: `scale(${0.4 + 0.6 * a})`,
            }}
          />
        );
      })}
    </>
  );
};

const Outline: React.FC<{f: number}> = ({f}) => {
  const a = T.aiStart + 2;
  const draw = ip(f, [a, a + 26], [0, 1], EIO);
  if (draw <= 0) return null;
  const per = 2 * (BOX.w + BOX.h);
  const glow = 0.6 + 0.4 * Math.sin((f - a) / 8);
  const fill = ip(f, [a + 10, a + 30], [0, 1]);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id="og" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.blue} />
          <stop offset="0.35" stopColor={C.green} />
          <stop offset="0.65" stopColor={C.yellow} />
          <stop offset="1" stopColor={C.red} />
        </linearGradient>
        <filter id="oglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={26} fill="rgba(255,255,255,0.08)" opacity={fill} />
      <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={26} fill="none" stroke="url(#og)" strokeWidth={8} opacity={0.55 * glow * draw} filter="url(#oglow)" strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
      <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={26} fill="none" stroke="url(#og)" strokeWidth={3.5} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} strokeLinecap="round" />
    </svg>
  );
};

const ObjectChip: React.FC<{f: number}> = ({f}) => {
  const a = T.aiStart + 18;
  const t = ip(f, [a, a + 16], [0, 1]);
  if (t <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: BOX.y - 58, display: 'flex', justifyContent: 'center', opacity: t, transform: `translateY(${(1 - t) * 12}px) scale(${0.92 + 0.08 * t})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.94)', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', fontFamily: FONT_UI, fontSize: 15, fontWeight: 600, color: C.ink}}>
        <div style={{width: 9, height: 9, borderRadius: 5, background: C.green, boxShadow: `0 0 8px ${C.green}`}} />
        Sneaker
        <span style={{color: C.faint, fontWeight: 500}}>·</span>
        <span style={{color: C.blue}}>98% match</span>
      </div>
    </div>
  );
};

const ScanPill: React.FC<{f: number}> = ({f}) => {
  const op = win(f, T.scanStart + 8, T.aiStart + 4, 10, 10);
  if (op <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 120, left: 0, width: W, display: 'flex', justifyContent: 'center', opacity: op}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderRadius: 22, background: 'rgba(20,24,32,0.55)', backdropFilter: 'blur(10px)', color: '#fff', fontFamily: FONT_UI, fontSize: 15, fontWeight: 500}}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{transform: `rotate(${f * 12}deg)`}}>
          <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" fill="none" />
          <path d="M8 2a6 6 0 0 1 6 6" stroke="#8AB4F8" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
        Scanning object…
      </div>
    </div>
  );
};

const LensChrome: React.FC<{f: number}> = ({f}) => {
  const op = ip(f, [64, 80], [0, 1]);
  const ctl = Math.min(ip(f, [70, 88], [0, 1]), ip(f, [T.resultsStart, T.resultsStart + 14], [1, 0], EIO));
  return (
    <>
      <div style={{position: 'absolute', top: 56, left: 0, width: W, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', boxSizing: 'border-box', opacity: op, fontFamily: FONT_UI, color: '#fff'}}>
        <div style={{width: 40, height: 40, borderRadius: 20, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px', borderRadius: 22, background: 'rgba(255,255,255,0.92)', color: C.ink, fontWeight: 600, fontSize: 18, boxShadow: '0 4px 14px rgba(0,0,0,0.15)'}}>
          <LensGlyph size={26} />
          Lens
        </div>
        <div style={{width: 40, height: 40, borderRadius: 20, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexDirection: 'column'}}>
          {[0, 1, 2].map((i) => <div key={i} style={{width: 4, height: 4, borderRadius: 2, background: '#fff'}} />)}
        </div>
      </div>
      <div style={{position: 'absolute', top: 690, left: 0, width: W, opacity: ctl, transform: `translateY(${(1 - ctl) * 20}px)`, fontFamily: FONT_UI}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 46px'}}>
          <div style={{width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#9aa6b8,#5b6475)', border: '2px solid rgba(255,255,255,0.85)'}} />
          <div style={{width: 84, height: 84, borderRadius: 42, background: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 70, height: 70, borderRadius: 35, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.25)'}}>
              <SearchIcon size={32} color={C.blue} sw={2.8} />
            </div>
          </div>
          <div style={{width: 46, height: 46, borderRadius: 23, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M13 2L5 13h6l-1 9 8-11h-6z" fill="#fff" /></svg>
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 10, marginTop: 22, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>
          <span style={{padding: '7px 14px'}}>Translate</span>
          <span style={{padding: '7px 16px', background: '#fff', color: C.ink, borderRadius: 18}}>Search</span>
          <span style={{padding: '7px 14px'}}>Homework</span>
        </div>
      </div>
    </>
  );
};

const RESULTS = [
  {pal: 'hero', name: 'AeroRun Knit', price: '$89.99', store: 'Stridewear'},
  {pal: 'sky', name: 'CloudStep Runner', price: '$112.50', store: 'RunHub'},
  {pal: 'sand', name: 'Velocity Low', price: '$74.00', store: 'Footlane'},
  {pal: 'black', name: 'Urban Court', price: '$65.00', store: 'Kickstore'},
];

const SHEET_TOP = 372;
const sheetY = (f: number) => ip(f, [T.resultsStart, T.resultsStart + 26], [H - SHEET_TOP + 20, 0], EO);

const ResultsSheet: React.FC<{f: number}> = ({f}) => {
  const y = sheetY(f);
  if (f < T.resultsStart) return null;
  const blur = mblur(sheetY, f, 0.06, 6);
  return (
    <div style={{position: 'absolute', left: 0, top: SHEET_TOP, width: W, height: H - SHEET_TOP + 40, transform: `translateY(${y}px)`, background: '#FFFFFF', borderRadius: '28px 28px 0 0', boxShadow: '0 -12px 40px rgba(0,0,0,0.22)', fontFamily: FONT_UI, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
      <div style={{width: 44, height: 5, borderRadius: 3, background: '#D5D9E0', margin: '10px auto 0'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px 0'}}>
        <span style={{fontSize: 20, fontWeight: 700, color: C.ink}}>Visual matches</span>
        <span style={{fontSize: 14, fontWeight: 600, color: C.blue}}>See all</span>
      </div>
      <div style={{display: 'flex', gap: 8, padding: '10px 18px 0'}}>
        {['All', 'Products', 'Shopping', 'Similar'].map((t, i) => (
          <span key={t} style={{fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 16, background: i === 0 ? '#E8F0FE' : '#F1F3F6', color: i === 0 ? C.blue : '#4a5262'}}>{t}</span>
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 16px 0'}}>
        {RESULTS.map((r, i) => {
          const s = T.resultsStart + 14 + i * 5;
          const t = ip(f, [s, s + 18], [0, 1]);
          return (
            <div key={r.name} style={{borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #ECEEF2', boxShadow: '0 4px 12px rgba(30,40,70,0.07)', opacity: t, transform: `translateY(${(1 - t) * 30}px)`}}>
              <div style={{height: 104, background: 'linear-gradient(160deg,#F4F6FA,#E6EAF1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Sneaker id={`sh${i}`} width={150} palette={PALETTES[r.pal]} />
              </div>
              <div style={{padding: '8px 10px 10px'}}>
                <div style={{fontSize: 13.5, fontWeight: 600, color: C.ink}}>{r.name}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 3, alignItems: 'baseline'}}>
                  <span style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{r.price}</span>
                  <span style={{fontSize: 11.5, color: C.faint}}>{r.store}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const LensScreen: React.FC = () => {
  const f = useCurrentFrame();
  // Lens app opens with a circular reveal from the lens icon
  const reveal = ip(f, [48, 78], [0, 1], EIO);
  const radius = reveal * 1000;
  // Focus pull
  const focus = ip(f, [T.scanStart, T.scanStart + 22], [9, 0], EIO);
  // Results: camera view moves up to make room for the results sheet
  const camT = ip(f, [T.resultsStart, T.resultsStart + 26], [0, 1], EO);
  const camY = -160 * camT;
  const camS = 1 - 0.18 * camT;
  const objectY = BOX.y + BOX.h / 2;

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
      {f < 80 && <HomeScreen f={f} />}
      {f >= 48 && (
        <div style={{position: 'absolute', inset: 0, clipPath: f < 78 ? `circle(${radius}px at ${LENS_ICON.x}px ${LENS_ICON.y}px)` : undefined}}>
          <div style={{position: 'absolute', inset: 0, transformOrigin: `${W / 2}px ${objectY}px`, transform: `translateY(${camY}px) scale(${camS})`}}>
            <div style={{position: 'absolute', inset: 0, filter: focus > 0.05 ? `blur(${focus}px)` : undefined, transform: `scale(${1 + focus * 0.004})`}}>
              <CameraScene />
              <div style={{position: 'absolute', left: SN.x, top: SN.y}}>
                <Sneaker id="hero" width={SN.w} />
              </div>
            </div>
            <Sparks f={f} />
            <ScanLine f={f} />
            <Brackets f={f} />
            <Outline f={f} />
            <ObjectChip f={f} />
          </div>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 75%, rgba(0,0,0,0.35) 100%)'}} />
          <LensChrome f={f} />
          <ScanPill f={f} />
          <ResultsSheet f={f} />
        </div>
      )}
      <StatusBar dark={f < 62} />
    </div>
  );
};

export {BOX, SN};
