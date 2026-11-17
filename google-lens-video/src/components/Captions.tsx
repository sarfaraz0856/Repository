import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT_HEAD, FONT_UI, T} from '../theme';
import {EIO, ip} from '../anim';

type Stage = {from: number; to: number; kicker: string; color: string; lines: React.ReactNode[]; sub?: string};

const Dot: React.FC<{c: string}> = ({c}) => <span style={{color: c}}>.</span>;

const STAGES: Stage[] = [
  {from: 6, to: T.scanStart, kicker: 'Visual search explained', color: C.blue, lines: ['HOW GOOGLE', 'LENS WORKS'], sub: 'Point your camera. Let AI understand what you see.'},
  {from: T.scanStart + 2, to: T.aiStart, kicker: 'Step 01 · Capture', color: C.red, lines: ['SCANNING', 'OBJECT...'], sub: 'The camera locks focus and maps edges, depth and shape in real time.'},
  {from: T.aiStart + 2, to: T.resultsStart, kicker: 'Step 02 · Understand', color: C.yellow, lines: ['AI', 'RECOGNITION'], sub: 'Vision models detect the object and compare it with billions of images.'},
  {from: T.resultsStart + 2, to: T.finalStart, kicker: 'Step 03 · Match', color: C.green, lines: ['FIND SIMILAR', 'PRODUCTS'], sub: 'Visual search surfaces matching products, prices and stores instantly.'},
  {
    from: T.finalStart + 2,
    to: 999,
    kicker: 'Search what you see',
    color: C.blue,
    lines: [
      <>SCAN<Dot c={C.blue} /></>,
      <>SEARCH<Dot c={C.red} /></>,
      <>DISCOVER<Dot c={C.green} /></>,
    ],
  },
];

const StageView: React.FC<{s: Stage; f: number}> = ({s, f}) => {
  if (f < s.from || f > s.to) return null;
  const exitT = ip(f, [s.to - 10, s.to], [0, 1], EIO);
  const enter = (d: number) => ip(f, [s.from + d, s.from + d + 18], [0, 1]);
  const item = (d: number): React.CSSProperties => {
    const t = enter(d);
    return {
      opacity: t * (1 - exitT),
      transform: `translateY(${(1 - t) * 36 - exitT * 18}px)`,
      filter: `blur(${(1 - t) * 8 + exitT * 6}px)`,
    };
  };
  return (
    <div style={{position: 'absolute', left: 110, top: 0, height: 1080, width: 590, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <div style={{...item(0), display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26}}>
        <div style={{width: 10, height: 10, borderRadius: 5, background: s.color, boxShadow: `0 0 12px ${s.color}`}} />
        <span style={{fontFamily: FONT_UI, fontSize: 19, fontWeight: 600, letterSpacing: 3.5, textTransform: 'uppercase', color: C.sub}}>{s.kicker}</span>
      </div>
      {s.lines.map((l, i) => {
        const isScanDots = s.kicker.startsWith('Step 01') && i === 1;
        return (
          <div key={i} style={{...item(4 + i * 4), fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 70, lineHeight: 1.04, letterSpacing: -1.5, color: C.ink, whiteSpace: 'nowrap'}}>
            {isScanDots ? (
              <>
                OBJECT
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((f - s.from) / 4 - d * 1.1)), color: [C.blue, C.red, C.yellow][d]}}>.</span>
                ))}
              </>
            ) : (
              l
            )}
          </div>
        );
      })}
      {s.sub && (
        <div style={{...item(14), fontFamily: FONT_UI, fontSize: 23, lineHeight: 1.5, color: C.sub, marginTop: 26, maxWidth: 500}}>{s.sub}</div>
      )}
    </div>
  );
};

const STEPS = [
  {label: 'Open', c: C.blue, a: 0, b: T.scanStart},
  {label: 'Scan', c: C.red, a: T.scanStart, b: T.aiStart},
  {label: 'Recognize', c: C.yellow, a: T.aiStart, b: T.resultsStart},
  {label: 'Discover', c: C.green, a: T.resultsStart, b: T.finalStart},
];

const Progress: React.FC<{f: number}> = ({f}) => {
  const op = ip(f, [20, 40], [0, 1]);
  return (
    <div style={{position: 'absolute', left: 110, top: 920, display: 'flex', gap: 14, opacity: op}}>
      {STEPS.map((s) => {
        const p = ip(f, [s.a, s.b], [0, 1], (t) => t);
        const active = f >= s.a;
        return (
          <div key={s.label} style={{width: 120}}>
            <div style={{height: 5, borderRadius: 3, background: 'rgba(30,40,70,0.10)', overflow: 'hidden'}}>
              <div style={{width: `${p * 100}%`, height: '100%', background: s.c, borderRadius: 3}} />
            </div>
            <div style={{marginTop: 10, fontFamily: FONT_UI, fontSize: 15, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: active ? C.ink : C.faint}}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {STAGES.map((s, i) => (
        <StageView key={i} s={s} f={f} />
      ))}
      <Progress f={f} />
    </>
  );
};
