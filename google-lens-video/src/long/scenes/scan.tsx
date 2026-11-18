import React from 'react';
import {C, FONT_UI} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Bar, Brackets, Card, CheckDot, ChromeShade, Feed, IconTile, LensBottom, LensTop, Outline, Pill, ScanLine, ScreenChip, Sparks, StatusPill, vis} from '../kit';
import {BOXES, ptsIn, Subject} from '../subjects';

const S = sceneById('scan');
const L = local(S);
const B = BOXES.sneaker;

// sneaker geometry (same artwork as the 15 s video): placed at (31, 325), 340 px wide
const SNK = {x: 31, y: 325, k: 340 / 600};
const P = {
  upper: 'M58,226 C44,214 46,194 70,186 C110,173 170,164 220,150 C260,138 285,118 305,96 L318,82 C326,74 338,72 348,76 L372,86 C400,98 440,98 470,86 L500,74 C522,66 545,76 550,96 C556,130 564,180 566,222 Z',
  sole: 'M40,248 C40,232 58,224 88,224 L540,218 C560,218 572,230 572,246 L572,258 C572,268 564,274 548,274 L82,280 C56,280 40,268 40,256 Z',
  accent: 'M166,222 C238,200 330,160 432,116 C446,110 456,124 444,134 C364,184 272,216 206,228 Z',
  laces: 'M210,160 L310,90 L330,110 L232,176 Z',
  tongue: 'M300,100 C306,80 314,58 326,48 C338,40 356,42 362,52 L374,88 C350,96 322,100 300,100 Z',
};
const toScreen = (vx: number, vy: number): [number, number] => [SNK.x + vx * SNK.k, SNK.y + vy * SNK.k];

const FEATS = [
  {word: 'आकार', title: 'Shapes', color: C.blue},
  {word: 'रंग', title: 'Colors', color: C.red},
  {word: 'बनावट', title: 'Textures', color: C.yellow},
  {word: 'पैटर्न', title: 'Patterns', color: C.green},
  {word: 'संबंध', title: 'Relationships', color: C.blue},
];
const featWin = (i: number): [number, number] => [L.w(1, FEATS[i].word), i < 4 ? L.w(1, FEATS[i + 1].word) : L.c(2)];

const SneakerSvg: React.FC<{children: React.ReactNode; op?: number}> = ({children, op = 1}) => (
  <svg width={402} height={852} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: op}}>
    <g transform={`translate(${SNK.x},${SNK.y}) scale(${SNK.k})`}>{children}</g>
  </svg>
);

const Overlays: React.FC<{f: number}> = ({f}) => {
  const w = (i: number) => {
    const [a, b] = featWin(i);
    return vis(f, a - 2, b + 6, 10, 10);
  };
  const swatches: [number, number, string][] = [[150, 190, '#F2F2F0'], [330, 160, '#E8453C'], [300, 252, '#FFFFFF'], [520, 160, '#D9DBE0'], [420, 82, '#2B2F38']];
  return (
    <>
      {/* shapes: contour */}
      <SneakerSvg op={w(0)}>
        {[P.upper, P.sole, P.tongue].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#7FD3FF" strokeWidth={4.5} strokeDasharray="1400" strokeDashoffset={1400 * (1 - ip(f, [featWin(0)[0], featWin(0)[0] + 24], [0, 1], EIO))} style={{filter: 'drop-shadow(0 0 6px #4FC3F7)'}} />
        ))}
      </SneakerSvg>
      {/* colors: sampled swatches */}
      {swatches.map(([vx, vy, col], i) => {
        const [x, y] = toScreen(vx, vy);
        const t = w(1) * ip(f, [featWin(1)[0] + i * 3, featWin(1)[0] + 10 + i * 3], [0, 1]);
        if (t <= 0.01) return null;
        const up = i % 2 === 0;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 6, top: y - 6, width: 12, height: 12, borderRadius: 6, border: '2.5px solid #fff', boxShadow: '0 0 6px rgba(0,0,0,0.4)', opacity: t}} />
            <div style={{position: 'absolute', left: x - 20, top: up ? y - 64 : y + 22, width: 40, height: 36, borderRadius: 10, background: col, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', opacity: t, transform: `scale(${0.6 + 0.4 * t})`}} />
          </React.Fragment>
        );
      })}
      {/* texture: magnifier */}
      {w(2) > 0.01 && (() => {
        const [x, y] = toScreen(250, 175);
        return (
          <div style={{position: 'absolute', left: x - 70, top: y - 190, width: 140, height: 140, borderRadius: 70, border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', overflow: 'hidden', opacity: w(2), background: 'repeating-linear-gradient(45deg, #ECEDEF 0 6px, #D6D8DD 6px 9px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0 6px, transparent 6px 12px)', backgroundBlendMode: 'multiply', transform: `scale(${0.7 + 0.3 * w(2)})`}}>
            <div style={{position: 'absolute', bottom: 10, width: '100%', textAlign: 'center', fontFamily: FONT_UI, fontSize: 13, fontWeight: 700, color: C.ink}}>Knit texture</div>
          </div>
        );
      })()}
      {/* patterns: repeated lace highlights */}
      {[[228, 148], [248, 137], [266, 125], [282, 113], [296, 101]].map(([vx, vy], i) => {
        const [x, y] = toScreen(vx, vy);
        const t = w(3) * ip(f, [featWin(3)[0] + i * 4, featWin(3)[0] + 10 + i * 4], [0, 1]);
        return <div key={i} style={{position: 'absolute', left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: 7, border: `3px solid ${C.green}`, boxShadow: `0 0 10px ${C.green}`, opacity: t}} />;
      })}
      {/* relationships: part graph */}
      {w(4) > 0.01 && (() => {
        const nodes: [number, number, string][] = [[270, 120, 'Laces'], [420, 160, 'Upper'], [300, 250, 'Sole'], [520, 110, 'Heel']];
        const pts = nodes.map(([vx, vy]) => toScreen(vx, vy));
        const edges = [[0, 1], [1, 2], [1, 3], [0, 2]];
        const d = ip(f, [featWin(4)[0], featWin(4)[0] + 24], [0, 1], EIO);
        return (
          <svg width={402} height={852} style={{position: 'absolute', inset: 0, opacity: w(4)}}>
            {edges.map(([a, b], i) => <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[a][0] + (pts[b][0] - pts[a][0]) * d} y2={pts[a][1] + (pts[b][1] - pts[a][1]) * d} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="6 5" />)}
            {pts.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={8} fill={[C.blue, C.red, C.yellow, C.green][i]} stroke="#fff" strokeWidth={3} />
                <text x={x} y={y - 16} textAnchor="middle" fontFamily={FONT_UI} fontSize={14} fontWeight={700} fill="#fff" style={{paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.55)', strokeWidth: 3}}>{nodes[i][2]}</text>
              </g>
            ))}
          </svg>
        );
      })()}
    </>
  );
};

const Segmentation: React.FC<{f: number}> = ({f}) => {
  const a = L.c(2);
  const op = vis(f, a, L.c(3) + 20, 12, 16);
  if (op <= 0.01) return null;
  const parts: [string, string][] = [[P.upper, C.blue], [P.sole, C.yellow], [P.accent, C.red], [P.tongue, C.green], [P.laces, C.green]];
  const sweep = ip(f, [a, a + 40], [0, 1], EIO);
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: 402 * sweep + 10, height: 852, overflow: 'hidden', opacity: op}}>
        <SneakerSvg>
          {parts.map(([d, c], i) => <path key={i} d={d} fill={c} fillOpacity={0.42} stroke={c} strokeWidth={3} />)}
        </SneakerSvg>
      </div>
      {/* pixel grid */}
      <div style={{position: 'absolute', left: B.x, top: B.y, width: B.w, height: B.h, opacity: op * 0.55, backgroundImage: 'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)', backgroundSize: '14px 14px', borderRadius: 18}} />
    </>
  );
};

export const Screen: React.FC<{f: number}> = ({f}) => {
  const capAt = L.w(0, 'कैप्चर');
  const focus = ip(f, [L.c(0), L.c(0) + 26], [7, 0], EIO);
  const flash = Math.sin(Math.PI * ip(f, [capAt, capAt + 10], [0, 1]));
  const outline = ip(f, [L.c(3) + 4, L.c(3) + 30], [0, 1], EIO);
  const attrs = [
    {word: 'रंग', text: 'Color · White & red', y: B.y - 112},
    {word: 'स्टाइल', text: 'Style · Running', y: B.y + B.h + 18},
    {word: 'डिज़ाइन', text: 'Design · Low-top', y: B.y + B.h + 66},
  ];
  const fly = ip(f, [L.c(5) + 10, L.c(5) + 40], [0, 1], EIO);
  const queryT = ip(f, [L.c(5) + 30, L.c(5) + 50], [0, 1]);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <Feed blur={f < capAt ? focus : 0}>
        <Subject kind="sneaker" />
      </Feed>
      <Brackets box={{x: B.x - 10, y: B.y - 12, w: B.w + 20, h: B.h + 24}} t={ip(f, [L.c(0) + 4, L.c(0) + 34], [0, 1], EIO)} op={vis(f, L.c(0), L.c(3) + 8, 10, 12)} />
      <ScanLine box={B} p={ip(f, [L.c(1) - 30, L.c(1) + 20], [0, 1], EIO)} op={vis(f, L.c(1) - 30, L.c(1) + 24, 8, 8)} />
      <Overlays f={f} />
      <Segmentation f={f} />
      <Sparks pts={ptsIn(B, 16, 5)} f={f} a={L.c(2) + 30} op={vis(f, L.c(2) + 30, L.c(3) + 10)} />
      <Outline box={B} draw={outline} f={f} op={1 - fly * 0.3} />
      <ScreenChip cx={201} y={B.y - 58} t={vis(f, L.c(3) + 22, L.c(4) - 2, 12, 10)}>
        Footwear <span style={{color: C.faint}}>·</span> <span style={{color: C.blue}}>97% confidence</span>
      </ScreenChip>
      {attrs.map((a, i) => {
        const t = vis(f, L.w(4, a.word), L.dur + 30, 12, 10);
        // in the last sentence the chips fly into the query bar
        const ty = a.y + (640 - a.y) * fly;
        return (
          <div key={a.text} style={{position: 'absolute', left: 0, width: 402, top: ty, display: 'flex', justifyContent: 'center', opacity: t * (1 - fly), transform: `scale(${1 - 0.4 * fly})`}}>
            <Pill text={<><span style={{width: 9, height: 9, borderRadius: 5, background: [C.red, C.blue, C.green][i]}} />{a.text}</>} size={15} style={{boxShadow: '0 6px 16px rgba(0,0,0,0.2)'}} />
          </div>
        );
      })}
      <ChromeShade />
      <LensTop />
      <LensBottom op={1 - queryT} press={Math.sin(Math.PI * ip(f, [capAt - 4, capAt + 8], [0, 1]))} />
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.75}} />
      <StatusPill t={vis(f, L.c(2) - 4, L.c(3) + 10)} text="Machine learning model running…" f={f} />
      {queryT > 0.01 && (
        <div style={{position: 'absolute', left: 22, top: 640, width: 358, height: 62, borderRadius: 31, background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', boxSizing: 'border-box', opacity: queryT, transform: `translateY(${(1 - queryT) * 20}px)`, fontFamily: FONT_UI}}>
          <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" stroke={C.blue} strokeWidth="2.6" fill="none" /><path d="M15.5 15.5L20 20" stroke={C.blue} strokeWidth="2.6" strokeLinecap="round" /></svg>
          <span style={{fontSize: 15.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap'}}>white · red · running · low-top</span>
        </div>
      )}
    </div>
  );
};

const STEPS = ['Capture', 'Features', 'Model', 'Classify', 'Query'];
const stepAt = (f: number) => (f < L.c(1) ? 0 : f < L.c(2) ? 1 : f < L.c(3) ? 2 : f < L.c(5) ? 3 : 4);

export const Side: React.FC<{f: number}> = ({f}) => {
  const cur = stepAt(f);
  const cardY = 300;
  return (
    <>
      {/* pipeline tracker */}
      <Card x={1290} y={170} w={510} h={92} t={vis(f, 0, L.dur, 18, 14)} pad={18} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {STEPS.map((s, i) => (
          <div key={s} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 86}}>
            <div style={{width: 30, height: 30, borderRadius: 15, background: i <= cur ? [C.blue, C.red, C.yellow, C.green, C.blue][i] : 'rgba(30,40,70,0.08)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === cur ? `0 0 0 5px ${[C.blue, C.red, C.yellow, C.green, C.blue][i]}33` : undefined}}>{i + 1}</div>
            <span style={{fontSize: 14, fontWeight: 700, color: i <= cur ? C.ink : C.faint}}>{s}</span>
          </div>
        ))}
      </Card>
      {/* capture */}
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(0), L.c(1), 16, 12)} pad={28}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.ink, marginBottom: 10}}>Step 1 · Capture an image</div>
        {['Camera focuses on the object', 'Frame is captured', 'Image sent for analysis'].map((t, i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderTop: i ? '1px solid rgba(30,40,70,0.07)' : undefined}}>
            <CheckDot on={f > L.c(0) + 20 + i * 18} size={28} />
            <span style={{fontSize: 20, color: C.ink, fontWeight: 500}}>{t}</span>
          </div>
        ))}
      </Card>
      {/* features */}
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(1) - 4, L.c(2), 16, 12)} pad={26}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.ink, marginBottom: 8}}>Visual information</div>
        {FEATS.map((ft, i) => {
          const [a, b] = featWin(i);
          const active = f >= a && f < b;
          return (
            <div key={ft.title} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 14, background: active ? `${ft.color}14` : 'transparent', opacity: f >= a ? 1 : 0.4}}>
              <IconTile color={ft.color} size={40}><span style={{fontSize: 16, fontWeight: 800}}>{ft.title[0]}</span></IconTile>
              <span style={{flex: 1, fontSize: 21, fontWeight: 600, color: C.ink}}>{ft.title}</span>
              <CheckDot on={f >= a + 8} size={26} />
            </div>
          );
        })}
      </Card>
      {/* ML / pixels */}
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(2) - 4, L.c(3), 16, 12)} pad={26}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.ink}}>Machine learning analysis</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, marginTop: 18}}>
          {Array.from({length: 72}).map((_, i) => {
            const on = ip(f, [L.c(2) + (i % 12) * 2 + Math.floor(i / 12) * 3, L.c(2) + 10 + (i % 12) * 2 + Math.floor(i / 12) * 3], [0, 1]);
            const hue = [C.blue, C.red, C.yellow, C.green][(i * 7 + Math.floor(i / 5)) % 4];
            return <div key={i} style={{height: 28, borderRadius: 5, background: hue, opacity: 0.12 + 0.6 * on * (0.4 + 0.6 * (((i * 37) % 10) / 10))}} />;
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 17, color: C.sub}}>
          <span>Sample pixel</span>
          <span style={{fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>R 232 · G 69 · B 60</span>
        </div>
        <div style={{marginTop: 14}}><Bar p={ip(f, [L.c(2), L.c(3) - 10], [0, 1], EIO)} color={C.blue} h={8} /></div>
      </Card>
      {/* detection + attributes + query */}
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(3) - 4, L.dur, 16, 14)} pad={26}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase'}}>Detected</div>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8}}>
          <span style={{fontSize: 32, fontWeight: 800, color: C.ink}}>Footwear</span>
          <span style={{fontSize: 22, fontWeight: 800, color: C.green}}>{Math.round(ip(f, [L.c(3) + 10, L.c(3) + 50], [0, 97], EIO))}%</span>
        </div>
        <div style={{marginTop: 10}}><Bar p={ip(f, [L.c(3) + 10, L.c(3) + 50], [0, 0.97], EIO)} color={C.green} h={8} /></div>
        {[['Color', 'White & red', 'रंग'], ['Style', 'Running', 'स्टाइल'], ['Design', 'Low-top', 'डिज़ाइन']].map(([k, v, word], i) => {
          const t = ip(f, [L.w(4, word), L.w(4, word) + 14], [0, 1]);
          return (
            <div key={k} style={{display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid rgba(30,40,70,0.07)', marginTop: i ? 0 : 16, opacity: t, transform: `translateX(${(1 - t) * 16}px)`}}>
              <span style={{fontSize: 20, color: C.sub}}>{k}</span>
              <span style={{fontSize: 20, fontWeight: 700, color: C.ink}}>{v}</span>
            </div>
          );
        })}
        <div style={{marginTop: 14, padding: '12px 16px', borderRadius: 16, background: '#E8F0FE', color: C.blue, fontSize: 18, fontWeight: 700, opacity: ip(f, [L.c(5) + 30, L.c(5) + 50], [0, 1])}}>Next: search for “white red running sneaker”</div>
      </Card>
    </>
  );
};
