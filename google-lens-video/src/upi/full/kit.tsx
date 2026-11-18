import React from 'react';
import {EIO, EO, ip} from '../../anim';
import {U, UF, GLASS, deep} from '../theme';

export const X0 = 890, XW = 960; // stage area
export type P = [number, number];

export const vis = (f: number, a: number, b = 1e9, fin = 14, fout = 12) => Math.min(ip(f, [a, a + fin], [0, 1]), ip(f, [b - fout, b], [1, 0], EIO));

export const Header: React.FC<{f: number; dur: number; n: string; title: string}> = ({f, dur, n, title}) => {
  const t = vis(f, 4, dur, 16, 14);
  return (
    <div style={{position: 'absolute', left: X0, top: 64, width: XW, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: t, transform: `translateY(${(1 - t) * -10}px)`, fontFamily: UF.ui}}>
      <span style={{fontFamily: UF.head, fontWeight: 800, fontSize: 22, color: '#fff', background: U.blue, padding: '4px 12px', borderRadius: 10}}>{n}</span>
      <span style={{fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#0F3A8A'}}>{title}</span>
    </div>
  );
};

export const Panel: React.FC<{x: number; y: number; w: number; h?: number; t: number; children?: React.ReactNode; style?: React.CSSProperties; glow?: string}> = ({x, y, w, h, t, children, style, glow}) => {
  if (t <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', padding: 22, borderRadius: 24, ...GLASS, border: glow ? `2px solid ${glow}88` : GLASS.border, boxShadow: glow ? `0 20px 50px ${glow}33, ${GLASS.boxShadow}` : GLASS.boxShadow, opacity: t, transform: `translateY(${(1 - t) * 24}px)`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined, fontFamily: UF.ui, color: U.ink, ...style}}>
      {children}
    </div>
  );
};

/** big on-screen English text */
export const OnText: React.FC<{f: number; a: number; b?: number; y: number; text: string; size?: number; color?: string; x?: number; w?: number}> = ({f, a, b = 1e9, y, text, size = 46, color = U.ink, x = X0, w = XW}) => {
  const t = vis(f, a, b, 16, 12);
  if (t <= 0.01) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: UF.head, fontWeight: 800, fontSize: size, letterSpacing: 1.5, color: deep(color), opacity: t, transform: `translateY(${(1 - t) * 18}px)`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined, textShadow: '0 6px 24px rgba(255,255,255,0.8)'}}>{text}</div>;
};

export const Icon: React.FC<{k: string; s?: number}> = ({k, s = 30}) => {
  const st = {stroke: '#fff', strokeWidth: 1.9, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const paths: Record<string, React.ReactNode> = {
    bank: <path d="M12 2L2 7v2h20V7zM4 10h3v8H4zm6.5 0h3v8h-3zM17 10h3v8h-3zM2 19h20v3H2z" fill="#fff" />,
    phone: <><rect x="6" y="2" width="12" height="20" rx="3" {...st} /><text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily="Inter">₹</text></>,
    server: <>{[3, 10, 17].map((y) => <g key={y}><rect x="3" y={y} width="18" height="5" rx="1.5" {...st} /><circle cx="7" cy={y + 2.5} r="1" fill="#fff" /></g>)}</>,
    switch: <><circle cx="12" cy="12" r="3.2" fill="#fff" />{[[12, 2], [22, 12], [12, 22], [2, 12]].map(([x, y], i) => <g key={i}><line x1="12" y1="12" x2={x} y2={y} {...st} /><circle cx={x} cy={y} r="1.8" fill="#fff" /></g>)}</>,
    shield: <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z M8.5 12l2.5 2.5 4.5-5" {...st} />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" {...st} /><path d="M8 10V7a4 4 0 0 1 8 0v3" {...st} /></>,
    user: <><circle cx="12" cy="8" r="4" {...st} /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" {...st} /></>,
    store: <><path d="M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6" {...st} /></>,
    qr: <><rect x="3" y="3" width="7" height="7" {...st} /><rect x="14" y="3" width="7" height="7" {...st} /><rect x="3" y="14" width="7" height="7" {...st} /><path d="M14 14h3v3h-3zM18 18h3v3h-3z" fill="#fff" /></>,
    clock: <><circle cx="12" cy="12" r="9" {...st} /><path d="M12 7v5l3 2" {...st} /></>,
    warn: <><path d="M12 3l10 18H2z" {...st} /><path d="M12 10v5M12 18v.5" {...st} /></>,
    check: <path d="M5 12.5l4.2 4.2L19 7" {...st} strokeWidth={3} />,
    cross: <path d="M6 6l12 12M18 6L6 18" {...st} strokeWidth={3} />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" {...st} /><path d="M3 7l9 6 9-6" {...st} /></>,
    db: <><ellipse cx="12" cy="5" rx="8" ry="3" {...st} /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" {...st} /></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{paths[k]}</svg>;
};

export const NodeBox: React.FC<{x: number; y: number; t: number; label: string; sub?: string; icon: string; color: string; active?: boolean; w?: number; big?: boolean}> = ({x, y, t, label, sub, icon, color, active, w = 200, big}) => {
  if (t <= 0.01) return null;
  const h = big ? 150 : sub ? 120 : 100;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 22, background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.78))', border: `2px solid ${active ? color : 'rgba(255,255,255,0.95)'}`, boxShadow: active ? `0 0 0 4px ${color}33, 0 20px 44px ${color}44` : GLASS.boxShadow, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: t, transform: `scale(${(0.85 + 0.15 * t) * (active ? 1.05 : 1)})`, fontFamily: UF.ui, zIndex: 2}}>
      <div style={{width: big ? 60 : 46, height: big ? 60 : 46, borderRadius: 15, background: `linear-gradient(140deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${color}55`}}><Icon k={icon} s={big ? 34 : 26} /></div>
      <div style={{fontSize: big ? 23 : 18, fontWeight: 800, color: U.ink, textAlign: 'center', lineHeight: 1.1}}>{label}</div>
      {sub && <div style={{fontSize: 13, color: U.slate, fontWeight: 600, textAlign: 'center'}}>{sub}</div>}
    </div>
  );
};

export const Edges: React.FC<{f: number; edges: [P, P, number][]; live?: boolean; color?: string}> = ({f, edges, live, color = U.cyan}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, zIndex: 1}}>
    {edges.map(([a, b, at], i) => {
      const t = ip(f, [at, at + 16], [0, 1], EIO);
      if (t <= 0) return null;
      const x2 = a[0] + (b[0] - a[0]) * t, y2 = a[1] + (b[1] - a[1]) * t;
      return (
        <g key={i}>
          <line x1={a[0]} y1={a[1]} x2={x2} y2={y2} stroke={U.blue} strokeOpacity={0.3} strokeWidth={8} strokeLinecap="round" />
          <line x1={a[0]} y1={a[1]} x2={x2} y2={y2} stroke={live ? color : '#5B7CC9'} strokeWidth={2.5} strokeDasharray="8 8" strokeDashoffset={live ? -(f * 2) % 16 : 0} />
        </g>
      );
    })}
  </svg>
);

const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const along = (pts: P[], t: number): P => {
  const segs = pts.length - 1;
  const x = Math.min(segs - 1e-6, Math.max(0, t * segs));
  const i = Math.floor(x);
  return lerp(pts[i], pts[i + 1], EIO(x - i));
};

export const Packet: React.FC<{f: number; pts: P[]; a: number; b: number; color: string; label?: string}> = ({f, pts, a, b, color, label = '🔒'}) => {
  if (f < a || f > b + 4) return null;
  const [x, y] = along(pts, ip(f, [a, b], [0, 1], (v) => v));
  return <div style={{position: 'absolute', left: x - 28, top: y - 18, width: 56, height: 36, borderRadius: 10, background: color, boxShadow: `0 0 24px ${color}, 0 0 50px ${color}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: U.navy, fontFamily: UF.ui, zIndex: 3}}>{label}</div>;
};

export const Ledger: React.FC<{x: number; y: number; t: number; title: string; from: number; to: number; at: number; f: number; w?: number}> = ({x, y, t, title, from, to, at, f, w = 220}) => {
  if (t <= 0.01) return null;
  const p = ip(f, [at, at + 22], [0, 1], EIO);
  const val = Math.round(from + (to - from) * p);
  const d = to - from;
  const col = d < 0 ? U.red : U.green;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, padding: '10px 14px', borderRadius: 16, background: '#fff', border: `2px solid ${f >= at ? col : 'rgba(30,45,90,0.12)'}`, boxShadow: GLASS.boxShadow, fontFamily: UF.ui, opacity: t, boxSizing: 'border-box', zIndex: 2}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: U.slate, fontWeight: 600}}><span>{title}</span><span>ledger</span></div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4}}>
        <span style={{fontSize: 24, fontWeight: 800, color: U.ink, fontVariantNumeric: 'tabular-nums'}}>₹{val.toLocaleString('en-IN')}</span>
        {d !== 0 && <span style={{fontSize: 17, fontWeight: 800, color: col, opacity: ip(f, [at, at + 8], [0, 1])}}>{d < 0 ? '−' : '+'}₹{Math.abs(d).toLocaleString('en-IN')}</span>}
      </div>
    </div>
  );
};

export const Row: React.FC<{t: number; ok?: boolean | null; text: string; color?: string; size?: number}> = ({t, ok, text, color = U.green, size = 21}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', opacity: t, transform: `translateX(${(1 - t) * 16}px)`}}>
    <span style={{width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: ok === null || ok === undefined ? 'rgba(15,23,42,0.08)' : ok ? color : U.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{ok === true ? <Icon k="check" s={18} /> : ok === false ? <Icon k="cross" s={16} /> : null}</span>
    <span style={{fontSize: size, fontWeight: 600, color: U.ink}}>{text}</span>
  </div>
);

export const pop = (f: number, a: number) => ip(f, [a, a + 14], [0, 1], EO);
