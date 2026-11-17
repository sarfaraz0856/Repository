import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT_UI, T} from '../theme';
import {EIO, ip, mblur} from '../anim';
import {glass} from './Glass';
import {Check} from './Icons';

const A = T.scanStart + 10;
const B = T.aiStart;
const xOf = (f: number) => ip(f, [A, A + 22], [70, 0]) + ip(f, [B - 12, B], [0, -30], EIO);

export const ScanPanel: React.FC = () => {
  const f = useCurrentFrame();
  const op = Math.min(ip(f, [A, A + 18], [0, 1]), ip(f, [B - 12, B], [1, 0], EIO));
  if (op <= 0) return null;
  const blur = mblur(xOf, f, 0.4, 8);
  const edges = Math.round(ip(f, [A + 14, B - 16], [0, 1248], EIO));
  const depth = ip(f, [A + 20, B - 14], [0, 1], EIO);
  const locked = f > T.scanStart + 24;
  const row = (d: number): React.CSSProperties => {
    const t = ip(f, [A + 8 + d, A + 24 + d], [0, 1]);
    return {opacity: t, transform: `translateY(${(1 - t) * 14}px)`};
  };
  const label: React.CSSProperties = {fontSize: 19, color: C.sub, fontWeight: 500};
  const val: React.CSSProperties = {fontSize: 21, color: C.ink, fontWeight: 700};
  const line: React.CSSProperties = {display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid rgba(30,40,70,0.08)'};
  return (
    <div style={{position: 'absolute', left: 1300, top: 330, width: 470, borderRadius: 30, padding: '28px 32px 18px', boxSizing: 'border-box', fontFamily: FONT_UI, opacity: op, transform: `translateX(${xOf(f)}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, ...glass}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
        <span style={{fontSize: 24, fontWeight: 700, color: C.ink}}>Live analysis</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: C.red, letterSpacing: 1.5}}>
          <span style={{width: 10, height: 10, borderRadius: 5, background: C.red, opacity: 0.55 + 0.45 * Math.sin(f / 4)}} />
          LIVE
        </span>
      </div>
      <div style={{...line, ...row(0)}}>
        <span style={label}>Auto-focus</span>
        <span style={{...val, display: 'flex', alignItems: 'center', gap: 8, color: locked ? C.green : C.ink}}>
          {locked && (
            <span style={{width: 24, height: 24, borderRadius: 12, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Check size={16} />
            </span>
          )}
          {locked ? 'Locked' : 'Adjusting'}
        </span>
      </div>
      <div style={{...line, ...row(5)}}>
        <span style={label}>Edge points</span>
        <span style={{...val, fontVariantNumeric: 'tabular-nums'}}>{edges.toLocaleString('en-US')}</span>
      </div>
      <div style={{...line, ...row(10), flexDirection: 'column', alignItems: 'stretch', gap: 12}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span style={label}>Depth mapping</span>
          <span style={{...val, fontVariantNumeric: 'tabular-nums'}}>{Math.round(depth * 100)}%</span>
        </div>
        <div style={{height: 8, borderRadius: 4, background: 'rgba(30,40,70,0.08)', overflow: 'hidden'}}>
          <div style={{width: `${depth * 100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${C.blue}, ${C.green})`}} />
        </div>
      </div>
      <div style={{...line, ...row(15), borderBottom: 'none'}}>
        <span style={label}>Lighting</span>
        <span style={val}>Balanced</span>
      </div>
    </div>
  );
};
