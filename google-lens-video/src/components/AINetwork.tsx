import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT_HEAD, FONT_UI, SCREEN, T} from '../theme';
import {cubic, EIO, ip} from '../anim';
import {glass} from './Glass';
import {Check, IconBox} from './Icons';
import {BOX} from './LensScreen';

const OBJ: [number, number] = [SCREEN.x + BOX.x + BOX.w, SCREEN.y + BOX.y + BOX.h / 2]; // ~ (1125, 533)
const HUB: [number, number] = [1300, OBJ[1]];
const HUB_R = 48;
const CARD_X = 1430;
const CARD_W = 390;
const CARD_H = 128;
const GAP = 196;

const NODES = [
  {title: 'Object Detection', sub: '1 object · bounding box', kind: 'detect' as const, grad: [C.blue, '#6EA0F7'], dy: -GAP},
  {title: 'AI Image Recognition', sub: 'Sneaker · running shoe', kind: 'brain' as const, grad: [C.red, '#F28B82'], dy: 0},
  {title: 'Visual Search', sub: 'Matching 1.2B images', kind: 'search' as const, grad: [C.green, '#7DCB92'], dy: GAP},
];

const A = T.aiStart;
const pathPts = (dy: number): [[number, number], [number, number], [number, number], [number, number]] => {
  const p0: [number, number] = [HUB[0] + HUB_R, HUB[1]];
  const p3: [number, number] = [CARD_X, HUB[1] + dy];
  return [p0, [p0[0] + 60, p0[1]], [p3[0] - 70, p3[1]], p3];
};

export const AINetwork: React.FC = () => {
  const f = useCurrentFrame();
  const out = ip(f, [T.resultsStart - 14, T.resultsStart + 2], [1, 0], EIO);
  if (f < A + 10 || out <= 0) return null;
  const outX = (1 - out) * 40;

  const l0 = ip(f, [A + 14, A + 30], [0, 1], EIO);
  const hub = ip(f, [A + 22, A + 40], [0, 1]);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: out, transform: `translateX(${outX}px)`, filter: out < 1 ? `blur(${(1 - out) * 6}px)` : undefined}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="ln" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.blue} stopOpacity="0.9" />
            <stop offset="1" stopColor={C.green} stopOpacity="0.9" />
          </linearGradient>
          <filter id="lglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {/* object -> hub */}
        <line x1={OBJ[0]} y1={OBJ[1]} x2={OBJ[0] + (HUB[0] - HUB_R - OBJ[0]) * l0} y2={HUB[1]} stroke="url(#ln)" strokeWidth={3} strokeLinecap="round" />
        <circle cx={OBJ[0]} cy={OBJ[1]} r={7 * l0} fill="#fff" stroke={C.blue} strokeWidth={3} />
        {NODES.map((n, i) => {
          const s = A + 38 + i * 10;
          const d = ip(f, [s, s + 18], [0, 1], EIO);
          const pts = pathPts(n.dy);
          const dStr = `M${pts[0][0]},${pts[0][1]} C${pts[1][0]},${pts[1][1]} ${pts[2][0]},${pts[2][1]} ${pts[3][0]},${pts[3][1]}`;
          const len = 300;
          return (
            <g key={i}>
              <path d={dStr} stroke={n.grad[0]} strokeOpacity={0.35} strokeWidth={7} fill="none" filter="url(#lglow)" strokeDasharray={len} strokeDashoffset={len * (1 - d)} pathLength={len} />
              <path d={dStr} stroke={n.grad[0]} strokeWidth={2.6} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - d)} pathLength={len} strokeLinecap="round" />
              {/* travelling data pulses */}
              {f > s + 18 &&
                [0, 0.5].map((off, k) => {
                  const t = (((f - s - 18) / 26 + off) % 1 + 1) % 1;
                  const [x, y] = cubic(t, ...pts);
                  const a = Math.sin(Math.PI * t);
                  return <circle key={k} cx={x} cy={y} r={5} fill="#fff" stroke={n.grad[0]} strokeWidth={2.5} opacity={a} style={{filter: `drop-shadow(0 0 6px ${n.grad[0]})`}} />;
                })}
            </g>
          );
        })}
        {/* pulses object -> hub */}
        {f > A + 30 &&
          [0, 0.33, 0.66].map((off, k) => {
            const t = (((f - A - 30) / 22 + off) % 1 + 1) % 1;
            const x = OBJ[0] + (HUB[0] - HUB_R - OBJ[0]) * t;
            const col = [C.blue, C.yellow, C.red][k];
            return <circle key={k} cx={x} cy={HUB[1]} r={4.5} fill={col} opacity={Math.sin(Math.PI * t)} style={{filter: `drop-shadow(0 0 6px ${col})`}} />;
          })}
      </svg>

      {/* AI hub */}
      <div style={{position: 'absolute', left: HUB[0] - HUB_R, top: HUB[1] - HUB_R, width: HUB_R * 2, height: HUB_R * 2, borderRadius: HUB_R, ...glass, opacity: hub, transform: `scale(${0.6 + 0.4 * hub})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={HUB_R * 2 + 30} height={HUB_R * 2 + 30} style={{position: 'absolute', left: -15, top: -15, transform: `rotate(${f * 3}deg)`}}>
          {[C.blue, C.red, C.yellow, C.green].map((c, i) => {
            const ang = (i / 4) * Math.PI * 2;
            const r = HUB_R + 10;
            const cx = HUB_R + 15 + Math.cos(ang) * r;
            const cy = HUB_R + 15 + Math.sin(ang) * r;
            return <circle key={c} cx={cx} cy={cy} r={5} fill={c} style={{filter: `drop-shadow(0 0 5px ${c})`}} />;
          })}
          <circle cx={HUB_R + 15} cy={HUB_R + 15} r={HUB_R + 10} fill="none" stroke="rgba(66,133,244,0.25)" strokeWidth={1.5} strokeDasharray="3 6" />
        </svg>
        <span style={{fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 30, background: `linear-gradient(135deg, ${C.blue}, ${C.green})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>AI</span>
      </div>

      {/* Node cards */}
      {NODES.map((n, i) => {
        const s = A + 46 + i * 10;
        const t = ip(f, [s, s + 20], [0, 1]);
        const prog = ip(f, [s + 12, s + 44], [0, 1], EIO);
        const done = prog >= 1;
        return (
          <div key={n.title} style={{position: 'absolute', left: CARD_X, top: HUB[1] + n.dy - CARD_H / 2, width: CARD_W, height: CARD_H, borderRadius: 26, padding: '0 24px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 20, fontFamily: FONT_UI, opacity: t, transform: `translateX(${(1 - t) * 40}px)`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined, ...glass}}>
            <div style={{width: 64, height: 64, borderRadius: 18, flexShrink: 0, background: `linear-gradient(140deg, ${n.grad[1]}, ${n.grad[0]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${n.grad[0]}55`}}>
              <IconBox kind={n.kind} size={34} />
            </div>
            <div style={{flex: 1}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{fontSize: 20.5, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', marginRight: 10}}>{n.title}</span>
                <span style={{width: 26, height: 26, flexShrink: 0, borderRadius: 13, background: done ? C.green : 'rgba(30,40,70,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${done ? 1 : 0.85})`}}>
                  {done && <Check size={17} />}
                </span>
              </div>
              <div style={{fontSize: 16, color: C.sub, marginTop: 4}}>{n.sub}</div>
              <div style={{height: 6, borderRadius: 3, background: 'rgba(30,40,70,0.08)', marginTop: 12, overflow: 'hidden'}}>
                <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${n.grad[1]}, ${n.grad[0]})`}} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
