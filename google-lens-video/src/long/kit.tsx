import React from 'react';
import {C, FONT_UI} from '../theme';
import {EIO, EO, ip} from '../anim';
import {Check, LensGlyph, SearchIcon} from '../components/Icons';

export const SW = 402; // phone screen width (design units)
export const SH = 852; // phone screen height

export type Box = {x: number; y: number; w: number; h: number};

export const glass: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,255,255,0.56))',
  backdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 24px 60px rgba(30,45,90,0.12), 0 4px 14px rgba(30,45,90,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
};

/** enter (from a) / exit (to b) envelope */
export const vis = (f: number, a: number, b = 1e9, fin = 14, fout = 12) =>
  Math.min(ip(f, [a, a + fin], [0, 1]), ip(f, [b - fout, b], [1, 0], EIO));

export const rise = (t: number, d = 24): React.CSSProperties => ({
  opacity: t,
  transform: `translateY(${(1 - t) * d}px)`,
  filter: t < 0.999 ? `blur(${(1 - t) * 6}px)` : undefined,
});
export const slideX = (t: number, d = 50): React.CSSProperties => ({
  opacity: t,
  transform: `translateX(${(1 - t) * d}px)`,
  filter: t < 0.999 ? `blur(${(1 - t) * 6}px)` : undefined,
});

export const Abs: React.FC<{x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);

export const Card: React.FC<{x: number; y: number; w: number; h?: number; t: number; pad?: number; radius?: number; dir?: 'up' | 'x'; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, h, t, pad = 24, radius = 26, dir = 'x', style, children}) => {
  if (t <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', padding: pad, borderRadius: radius, fontFamily: FONT_UI, ...glass, ...(dir === 'x' ? slideX(t) : rise(t)), ...style}}>
      {children}
    </div>
  );
};

export const IconTile: React.FC<{color: string; size?: number; children?: React.ReactNode}> = ({color, size = 56, children}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, flexShrink: 0, background: `linear-gradient(140deg, ${color}AA, ${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 18px ${color}44`, color: '#fff'}}>
    {children}
  </div>
);

export const Bar: React.FC<{p: number; color?: string; h?: number; bg?: string}> = ({p, color = C.blue, h = 6, bg = 'rgba(30,40,70,0.08)'}) => (
  <div style={{height: h, borderRadius: h, background: bg, overflow: 'hidden'}}>
    <div style={{width: `${Math.max(0, Math.min(1, p)) * 100}%`, height: '100%', borderRadius: h, background: `linear-gradient(90deg, ${color}99, ${color})`}} />
  </div>
);

export const CheckDot: React.FC<{on: boolean; size?: number; color?: string}> = ({on, size = 26, color = C.green}) => (
  <span style={{width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: on ? color : 'rgba(30,40,70,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? 1 : 0.85})`}}>
    {on && <Check size={size * 0.65} />}
  </span>
);

export const Pill: React.FC<{text: React.ReactNode; color?: string; bg?: string; size?: number; style?: React.CSSProperties}> = ({text, color = C.ink, bg = 'rgba(255,255,255,0.95)', size = 15, style}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: `${size * 0.45}px ${size * 0.95}px`, borderRadius: 999, background: bg, color, fontFamily: FONT_UI, fontWeight: 600, fontSize: size, whiteSpace: 'nowrap', ...style}}>{text}</span>
);

export const Dot: React.FC<{c: string; s?: number}> = ({c, s = 9}) => <span style={{width: s, height: s, borderRadius: s, background: c, boxShadow: `0 0 8px ${c}`, display: 'inline-block', flexShrink: 0}} />;

// ---------------------------------------------------------------- phone-screen widgets (402 x 852 units)

/** Corner brackets interpolating from the full viewfinder to `box` with progress t */
export const Brackets: React.FC<{box: Box; t: number; op: number; color?: string}> = ({box, t, op, color = '#fff'}) => {
  if (op <= 0.001) return null;
  const from = {x: 34, y: 150, w: SW - 68, h: 520};
  const b = {x: from.x + (box.x - from.x) * t, y: from.y + (box.y - from.y) * t, w: from.w + (box.w - from.w) * t, h: from.h + (box.h - from.h) * t};
  const L = 32, r = 14;
  const s = {stroke: color, strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const};
  return (
    <svg width={SW} height={SH} style={{position: 'absolute', inset: 0, opacity: op, filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))'}}>
      <path {...s} d={`M${b.x},${b.y + L} V${b.y + r} Q${b.x},${b.y} ${b.x + r},${b.y} H${b.x + L}`} />
      <path {...s} d={`M${b.x + b.w - L},${b.y} H${b.x + b.w - r} Q${b.x + b.w},${b.y} ${b.x + b.w},${b.y + r} V${b.y + L}`} />
      <path {...s} d={`M${b.x + b.w},${b.y + b.h - L} V${b.y + b.h - r} Q${b.x + b.w},${b.y + b.h} ${b.x + b.w - r},${b.y + b.h} H${b.x + b.w - L}`} />
      <path {...s} d={`M${b.x + L},${b.y + b.h} H${b.x + r} Q${b.x},${b.y + b.h} ${b.x},${b.y + b.h - r} V${b.y + b.h - L}`} />
    </svg>
  );
};

let gid = 0;
/** Glowing four-colour detection outline drawn with progress `draw` */
export const Outline: React.FC<{box: Box; draw: number; op?: number; f: number; radius?: number}> = ({box, draw, op = 1, f, radius = 24}) => {
  const id = React.useMemo(() => `ol${gid++}`, []);
  if (draw <= 0.001 || op <= 0.001) return null;
  const per = 2 * (box.w + box.h);
  const glow = 0.65 + 0.35 * Math.sin(f / 9);
  return (
    <svg width={SW} height={SH} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: op}}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.blue} />
          <stop offset="0.35" stopColor={C.green} />
          <stop offset="0.65" stopColor={C.yellow} />
          <stop offset="1" stopColor={C.red} />
        </linearGradient>
        <filter id={id + 'g'} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={radius} fill="none" stroke={`url(#${id})`} strokeWidth={8} opacity={0.5 * glow} filter={`url(#${id}g)`} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={radius} fill="none" stroke={`url(#${id})`} strokeWidth={3.5} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} strokeLinecap="round" />
    </svg>
  );
};

/** Scanning line sweeping through box; p in 0..1 (top->bottom) */
export const ScanLine: React.FC<{box: Box; p: number; op: number; down?: boolean}> = ({box, p, op, down = true}) => {
  if (op <= 0.001) return null;
  const y = p * box.h;
  const trail = 70;
  return (
    <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, overflow: 'hidden', opacity: op, borderRadius: 18}}>
      <div style={{position: 'absolute', left: 0, width: '100%', top: down ? y - trail : y, height: trail, background: `linear-gradient(${down ? 180 : 0}deg, rgba(66,133,244,0) 0%, rgba(120,170,255,0.36) 100%)`}} />
      <div style={{position: 'absolute', left: 0, width: '100%', top: y - 1.5, height: 3, background: 'linear-gradient(90deg, transparent, #fff 15%, #E8F0FE 50%, #fff 85%, transparent)', boxShadow: '0 0 14px 4px rgba(120,170,255,0.9), 0 0 30px 8px rgba(66,133,244,0.45)'}} />
    </div>
  );
};

const SPARK_COLORS = [C.blue, C.red, C.yellow, C.green];
/** Lens-style feature dots on a set of points, appearing from frame a */
export const Sparks: React.FC<{pts: [number, number][]; f: number; a: number; op?: number}> = ({pts, f, a, op = 1}) => {
  if (op <= 0.001 || f < a) return null;
  return (
    <>
      {pts.map(([x, y], i) => {
        const st = a + ((i * 7) % pts.length) * 2;
        const t = ip(f, [st, st + 10], [0, 1]);
        const tw = 0.75 + 0.25 * Math.sin((f - st) / 5 + i);
        const col = SPARK_COLORS[i % 4];
        const size = 7 + (i % 3);
        return <div key={i} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: '#fff', border: `2px solid ${col}`, boxShadow: `0 0 10px 2px ${col}`, opacity: t * tw * op, transform: `scale(${0.4 + 0.6 * t})`}} />;
      })}
    </>
  );
};

/** Floating label chip centred at (cx, y) inside the screen */
export const ScreenChip: React.FC<{cx: number; y: number; t: number; children: React.ReactNode; dot?: string}> = ({cx, y, t, children, dot = C.green}) => {
  if (t <= 0.001) return null;
  return (
    <div style={{position: 'absolute', left: cx - 200, width: 400, top: y, display: 'flex', justifyContent: 'center', opacity: t, transform: `translateY(${(1 - t) * 10}px) scale(${0.92 + 0.08 * t})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 15px', borderRadius: 22, background: 'rgba(255,255,255,0.95)', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', fontFamily: FONT_UI, fontSize: 15, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap'}}>
        <Dot c={dot} />
        {children}
      </div>
    </div>
  );
};

export const StatusPill: React.FC<{t: number; text: string; f: number; y?: number}> = ({t, text, f, y = 120}) => {
  if (t <= 0.001) return null;
  return (
    <div style={{position: 'absolute', top: y, left: 0, width: SW, display: 'flex', justifyContent: 'center', opacity: t}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderRadius: 22, background: 'rgba(20,24,32,0.58)', backdropFilter: 'blur(10px)', color: '#fff', fontFamily: FONT_UI, fontSize: 15, fontWeight: 500}}>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{transform: `rotate(${f * 12}deg)`}}>
          <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" fill="none" />
          <path d="M8 2a6 6 0 0 1 6 6" stroke="#8AB4F8" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
        {text}
      </div>
    </div>
  );
};

/** Lens top bar */
export const LensTop: React.FC<{op?: number}> = ({op = 1}) => (
  <div style={{position: 'absolute', top: 56, left: 0, width: SW, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', boxSizing: 'border-box', opacity: op, fontFamily: FONT_UI, color: '#fff'}}>
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
);

export type LensMode = 'Translate' | 'Search' | 'Text';
/** Lens bottom controls (gallery, shutter, flash, mode tabs) */
export const LensBottom: React.FC<{op?: number; mode?: LensMode; press?: number; galleryHi?: number}> = ({op = 1, mode = 'Search', press = 0, galleryHi = 0}) => {
  if (op <= 0.001) return null;
  return (
    <div style={{position: 'absolute', top: 690, left: 0, width: SW, opacity: op, fontFamily: FONT_UI}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 46px'}}>
        <div style={{width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#9aa6b8,#5b6475)', border: `2px solid rgba(255,255,255,${0.85})`, boxShadow: galleryHi > 0 ? `0 0 0 ${4 * galleryHi}px rgba(66,133,244,0.7)` : undefined, transform: `scale(${1 + 0.08 * galleryHi})`}} />
        <div style={{width: 84, height: 84, borderRadius: 42, background: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 70, height: 70, borderRadius: 35, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', transform: `scale(${1 - 0.1 * press})`}}>
            {mode === 'Translate' ? (
              <span style={{fontWeight: 800, fontSize: 22, color: C.blue}}>文A</span>
            ) : mode === 'Text' ? (
              <span style={{fontWeight: 800, fontSize: 24, color: C.blue}}>Tt</span>
            ) : (
              <SearchIcon size={32} color={C.blue} sw={2.8} />
            )}
          </div>
        </div>
        <div style={{width: 46, height: 46, borderRadius: 23, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M13 2L5 13h6l-1 9 8-11h-6z" fill="#fff" /></svg>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', gap: 10, marginTop: 22, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>
        {(['Translate', 'Search', 'Text'] as LensMode[]).map((m) => (
          <span key={m} style={m === mode ? {padding: '7px 16px', background: '#fff', color: C.ink, borderRadius: 18} : {padding: '7px 14px'}}>{m}</span>
        ))}
      </div>
    </div>
  );
};

/** Bottom sheet sliding up to `top` with progress t */
export const Sheet: React.FC<{t: number; top: number; children?: React.ReactNode}> = ({t, top, children}) => {
  if (t <= 0.001) return null;
  const y = (1 - t) * (SH - top + 30);
  return (
    <div style={{position: 'absolute', left: 0, top, width: SW, height: SH - top + 40, transform: `translateY(${y}px)`, background: '#fff', borderRadius: '28px 28px 0 0', boxShadow: '0 -12px 40px rgba(0,0,0,0.22)', fontFamily: FONT_UI, overflow: 'hidden'}}>
      <div style={{width: 44, height: 5, borderRadius: 3, background: '#D5D9E0', margin: '10px auto 0'}} />
      {children}
    </div>
  );
};

/** Finger tap indicator */
export const Tap: React.FC<{x: number; y: number; f: number; at: number}> = ({x, y, f, at}) => {
  const t = ip(f, [at - 8, at + 22], [0, 1], (v) => v);
  if (t <= 0 || t >= 1) return null;
  const press = Math.sin(Math.PI * ip(f, [at - 8, at + 8], [0, 1], EIO));
  const ring = ip(f, [at, at + 22], [0, 1], EO);
  return (
    <>
      <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.55)', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', opacity: press * 0.95, transform: `scale(${0.8 + 0.2 * press})`}} />
      <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, border: `3px solid ${C.blue}`, opacity: f >= at ? 1 - ring : 0, transform: `scale(${1 + ring * 1.4})`}} />
    </>
  );
};

/** Camera feed wrapper: background + subject, with focus blur */
export const Feed: React.FC<{blur?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({blur = 0, children, style}) => (
  <div style={{position: 'absolute', inset: 0, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transform: blur > 0.05 ? `scale(${1 + blur * 0.004})` : undefined, ...style}}>{children}</div>
);

/** Darkening gradients that keep the Lens chrome readable over the camera */
export const ChromeShade: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 75%, rgba(0,0,0,0.35) 100%)'}} />
);
