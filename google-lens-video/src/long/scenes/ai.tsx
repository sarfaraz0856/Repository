import React from 'react';
import {C, FONT_UI} from '../../theme';
import {cubic, EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Bar, Card, ChromeShade, Feed, IconTile, LensBottom, LensTop, Outline, ScreenChip, Sheet, StatusPill, vis} from '../kit';
import {BOXES, Subject} from '../subjects';
import {PALETTES, Sneaker} from '../../components/Sneaker';
import {Chair, Jacket, Landmark, Mug, Plant, Watch} from '../art';

const S = sceneById('ai');
const L = local(S);
const B = BOXES.sneaker;

const TrainingGrid: React.FC<{f: number}> = ({f}) => {
  const items: [React.ReactNode, string][] = [
    [<Sneaker key="a" id="tg1" width={84} shadow={false} />, 'sneaker'], [<Plant key="b" width={44} />, 'plant'], [<Mug key="c" size={60} />, 'mug'],
    [<Sneaker key="d" id="tg2" width={84} palette={PALETTES.navy} shadow={false} />, 'sneaker'], [<Chair key="e" size={60} />, 'chair'], [<Landmark key="f" width={36} />, 'tower'],
    [<Watch key="g" size={60} />, 'watch'], [<Sneaker key="h" id="tg3" width={84} palette={PALETTES.black} shadow={false} />, 'sneaker'], [<Jacket key="i" size={60} />, 'jacket'],
    [<Sneaker key="j" id="tg4" width={84} palette={PALETTES.sage} shadow={false} />, 'sneaker'], [<Mug key="k" size={60} />, 'mug'], [<Plant key="l" width={44} />, 'plant'],
  ];
  const scroll = ip(f, [L.c(1), L.c(2)], [0, -120], (v) => v);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F1F3F6', fontFamily: FONT_UI, overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 120 + scroll, left: 14, right: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8}}>
        {[...items, ...items].map(([el, lab], i) => {
          const t = ip(f, [L.c(1) + (i % 12) * 2, L.c(1) + 10 + (i % 12) * 2], [0, 1]);
          return (
            <div key={i} style={{height: 118, borderRadius: 12, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: t}}>
              <div style={{height: 76, display: 'flex', alignItems: 'center'}}>{el}</div>
              <span style={{fontSize: 11, fontWeight: 700, color: C.blue, background: '#E8F0FE', padding: '2px 8px', borderRadius: 8}}>{lab}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 112, background: 'linear-gradient(180deg, #F1F3F6 80%, rgba(241,243,246,0))'}}>
        <div style={{position: 'absolute', top: 66, width: '100%', textAlign: 'center', fontSize: 18, fontWeight: 700, color: C.ink}}>Training examples</div>
      </div>
    </div>
  );
};

const SceneGraph: React.FC<{f: number}> = ({f}) => {
  const a = L.c(3);
  const op = vis(f, a, L.c(4) + 4, 12, 10);
  if (op <= 0.01) return null;
  const nodes: [number, number, string, string][] = [[150, 380, 'Laces', C.green], [280, 368, 'Upper', C.blue], [200, 492, 'Sole', C.yellow], [330, 560, 'Floor', C.red]];
  const edges: [number, number, string][] = [[0, 1, 'part of'], [1, 2, 'attached to'], [2, 3, 'resting on']];
  return (
    <svg width={402} height={852} style={{position: 'absolute', inset: 0, opacity: op}}>
      {edges.map(([p, q, lab], i) => {
        const d = ip(f, [a + 10 + i * 10, a + 30 + i * 10], [0, 1], EIO);
        const [x1, y1] = nodes[p], [x2, y2] = nodes[q];
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * d} y2={y1 + (y2 - y1) * d} stroke="#fff" strokeWidth={3} />
            <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 8} fontFamily={FONT_UI} fontSize={13} fontWeight={700} fill="#fff" opacity={d} style={{paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.6)', strokeWidth: 3}}>{lab}</text>
          </g>
        );
      })}
      {nodes.map(([x, y, lab, c], i) => {
        const t = ip(f, [a + i * 6, a + 12 + i * 6], [0, 1]);
        return (
          <g key={lab} opacity={t}>
            <circle cx={x} cy={y} r={11} fill={c} stroke="#fff" strokeWidth={3} />
            <text x={x} y={y + 30} textAnchor="middle" fontFamily={FONT_UI} fontSize={14} fontWeight={800} fill="#fff" style={{paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.6)', strokeWidth: 3}}>{lab}</text>
          </g>
        );
      })}
    </svg>
  );
};

export const Screen: React.FC<{f: number}> = ({f}) => {
  const grid = vis(f, L.c(1) - 6, L.c(2) + 6, 14, 14);
  const tiles = vis(f, L.c(2) + 10, L.c(3), 12, 12);
  const sim = ip(f, [L.c(4) + 10, L.c(4) + 34], [0, 1], EIO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <Feed><Subject kind="sneaker" /></Feed>
      {/* computer vision grid */}
      <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(0), L.c(1), 16, 12) * 0.6, backgroundImage: 'linear-gradient(rgba(138,180,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(138,180,248,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      <Outline box={B} draw={ip(f, [L.c(0) + 20, L.c(0) + 50], [0, 1], EIO)} f={f} />
      {/* feature tiles */}
      {tiles > 0.01 && Array.from({length: 24}).map((_, i) => {
        const cx = i % 6, cy = Math.floor(i / 6);
        const on = ip(f, [L.c(2) + 10 + i * 2, L.c(2) + 20 + i * 2], [0, 1]);
        return <div key={i} style={{position: 'absolute', left: B.x + cx * (B.w / 6), top: B.y + cy * (B.h / 4), width: B.w / 6 - 3, height: B.h / 4 - 3, border: '1.5px solid rgba(255,255,255,0.7)', background: `${[C.blue, C.red, C.yellow, C.green][(i * 5) % 4]}${on > 0.5 ? '40' : '10'}`, opacity: tiles * on, borderRadius: 4}} />;
      })}
      <ScreenChip cx={201} y={B.y - 58} t={vis(f, L.c(2) + 40, L.c(3), 12, 10)}>Sneaker <span style={{color: C.faint}}>·</span> <span style={{color: C.blue}}>97%</span></ScreenChip>
      <SceneGraph f={f} />
      <ChromeShade />
      <LensTop />
      <LensBottom op={1 - sim} />
      <StatusPill t={vis(f, L.c(0) + 10, L.c(1))} text="Computer vision: understanding the image" f={f} />
      <Sheet t={sim} top={430}>
        <div style={{padding: '12px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: 19, fontWeight: 700, color: C.ink}}>Visually similar</span>
          <span style={{fontSize: 12, fontWeight: 700, color: '#B06000', background: '#FEF7E0', padding: '4px 10px', borderRadius: 10}}>Not identical</span>
        </div>
        {[['sky', 0.94], ['sand', 0.89], ['navy', 0.86]].map(([p, s], i) => {
          const t = ip(f, [L.c(4) + 24 + i * 6, L.c(4) + 40 + i * 6], [0, 1]);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, margin: '12px 16px 0', padding: 10, borderRadius: 16, border: '1px solid #ECEEF2', opacity: t, transform: `translateY(${(1 - t) * 20}px)`}}>
              <div style={{width: 100, height: 64, borderRadius: 12, background: '#F1F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Sneaker id={`sim${i}`} width={92} palette={PALETTES[p as string]} shadow={false} /></div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 14, fontWeight: 600, color: C.ink}}>Similarity {(s as number).toFixed(2)}</div>
                <div style={{marginTop: 8}}><Bar p={(s as number) * t} color={C.green} h={6} /></div>
              </div>
            </div>
          );
        })}
      </Sheet>
      {grid > 0.01 && <div style={{position: 'absolute', inset: 0, opacity: grid}}><TrainingGrid f={f} /></div>}
    </div>
  );
};

// ---------------------------------------------------------------- neural network panel
const LAYERS = [3, 5, 6, 5, 3];
const NX = 1310, NW = 470, NY = 200, NH = 330;
const nodePos = (l: number, i: number): [number, number] => {
  const n = LAYERS[l];
  return [NX + 70 + (l * (NW - 140)) / (LAYERS.length - 1), NY + 40 + ((i + 0.5) * (NH - 80)) / n];
};

const Network: React.FC<{f: number}> = ({f}) => {
  const active = f >= L.c(1) - 10 && f < L.c(3) + 20;
  const flow = (f - L.c(1)) / 26;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {LAYERS.slice(0, -1).map((n, l) => Array.from({length: n}).map((_, i) => Array.from({length: LAYERS[l + 1]}).map((__, j) => {
        const [x1, y1] = nodePos(l, i), [x2, y2] = nodePos(l + 1, j);
        return <line key={`${l}-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8AB4F8" strokeOpacity={0.28} strokeWidth={1.2} />;
      })))}
      {active && LAYERS.slice(0, -1).map((n, l) => Array.from({length: 4}).map((_, k) => {
        const i = (k * 3 + l) % n, j = (k * 2 + l + 1) % LAYERS[l + 1];
        const [x1, y1] = nodePos(l, i), [x2, y2] = nodePos(l + 1, j);
        const t = ((flow - l * 0.25 + k * 0.37) % 1 + 1) % 1;
        const col = [C.blue, C.red, C.yellow, C.green][(k + l) % 4];
        return <circle key={`p${l}-${k}`} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={4.5} fill={col} opacity={Math.sin(Math.PI * t)} style={{filter: `drop-shadow(0 0 5px ${col})`}} />;
      }))}
      {LAYERS.map((n, l) => Array.from({length: n}).map((_, i) => {
        const [x, y] = nodePos(l, i);
        const pulse = active ? 0.5 + 0.5 * Math.sin(f / 6 - l * 0.9 + i) : 0.3;
        const col = [C.blue, C.red, C.yellow, C.green, C.blue][l];
        return <circle key={`n${l}-${i}`} cx={x} cy={y} r={10} fill="#fff" stroke={col} strokeWidth={3} style={{filter: `drop-shadow(0 0 ${6 * pulse}px ${col})`}} />;
      }))}
    </svg>
  );
};

export const Side: React.FC<{f: number}> = ({f}) => {
  const netT = vis(f, L.c(0) - 4, L.c(4), 18, 14);
  const cardY = 560;
  return (
    <>
      <Card x={1290} y={170} w={510} h={380} t={netT} pad={20}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase'}}>Neural network</div>
        <div style={{position: 'absolute', left: 14, top: 168, width: 46, height: 46, borderRadius: 10, background: '#F1F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Sneaker id="nin" width={44} shadow={false} /></div>
        <div style={{position: 'absolute', right: 12, bottom: 18, fontSize: 13, fontWeight: 700, color: C.sub}}>output</div>
        <div style={{position: 'absolute', left: 18, bottom: 18, fontSize: 13, fontWeight: 700, color: C.sub}}>input</div>
      </Card>
      {netT > 0.01 && <div style={{position: 'absolute', inset: 0, opacity: netT, transform: `translateX(${(1 - netT) * 50}px)`}}><Network f={f} /></div>}
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(0) + 6, L.c(1), 16, 12)} pad={26} style={{display: 'flex', gap: 18, alignItems: 'center'}}>
        <IconTile color={C.blue} size={64}>
          <svg width="34" height="34" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#fff" strokeWidth="2" fill="none" /><circle cx="12" cy="12" r="3.5" fill="#fff" /></svg>
        </IconTile>
        <div>
          <div style={{fontSize: 27, fontWeight: 800, color: C.ink}}>Computer vision</div>
          <div style={{fontSize: 18, color: C.sub, marginTop: 4, lineHeight: 1.4}}>A field of AI focused on understanding images and videos</div>
        </div>
      </Card>
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(1) - 2, L.c(2), 16, 12)} pad={26}>
        <div style={{fontSize: 25, fontWeight: 800, color: C.ink}}>Learning from examples</div>
        <div style={{display: 'flex', gap: 14, marginTop: 16}}>
          {[['Labeled images', C.blue], ['Patterns learned', C.green]].map(([t, c], i) => (
            <div key={t} style={{flex: 1, padding: 16, borderRadius: 16, background: `${c}12`}}>
              <div style={{fontSize: 30, fontWeight: 800, color: c as string, fontVariantNumeric: 'tabular-nums'}}>{i === 0 ? Math.round(ip(f, [L.c(1), L.c(2) - 10], [0, 1], EIO) * 100) + 'k+' : Math.round(ip(f, [L.c(1) + 20, L.c(2) - 10], [0, 1], EIO) * 100) + '%'}</div>
              <div style={{fontSize: 16, color: C.sub, marginTop: 4}}>{t}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize: 13, color: C.faint, marginTop: 10}}>Illustrative numbers</div>
      </Card>
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(2) - 2, L.c(3), 16, 12)} pad={26}>
        <div style={{fontSize: 25, fontWeight: 800, color: C.ink, marginBottom: 6}}>Possible objects</div>
        {[['Sneaker', 0.97, C.green], ['Boot', 0.02, C.yellow], ['Sandal', 0.01, C.red]].map(([n, p, c], i) => {
          const t = ip(f, [L.c(2) + 20 + i * 8, L.c(2) + 60 + i * 8], [0, 1], EIO);
          return (
            <div key={n as string} style={{padding: '10px 0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 600, color: C.ink}}><span>{n}</span><span style={{fontVariantNumeric: 'tabular-nums'}}>{Math.round((p as number) * 100 * t)}%</span></div>
              <div style={{marginTop: 8}}><Bar p={(p as number) * t} color={c as string} h={8} /></div>
            </div>
          );
        })}
      </Card>
      <Card x={1290} y={cardY} w={510} t={vis(f, L.c(3) - 2, L.c(4), 16, 12)} pad={26}>
        <div style={{fontSize: 25, fontWeight: 800, color: C.ink, marginBottom: 6}}>How parts relate</div>
        {[['Laces', 'part of', 'Upper'], ['Upper', 'attached to', 'Sole'], ['Sole', 'resting on', 'Floor']].map(([a, r, b], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', fontSize: 19, opacity: ip(f, [L.c(3) + 10 + i * 10, L.c(3) + 24 + i * 10], [0, 1])}}>
            <span style={{fontWeight: 700, color: C.ink}}>{a}</span>
            <span style={{color: C.blue, fontWeight: 600, background: '#E8F0FE', padding: '3px 10px', borderRadius: 10}}>{r}</span>
            <span style={{fontWeight: 700, color: C.ink}}>{b}</span>
          </div>
        ))}
      </Card>
      <Card x={1290} y={260} w={510} t={vis(f, L.c(4) - 2, L.dur, 16, 14)} pad={28}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.ink}}>Similarity, not exact copies</div>
        <div style={{display: 'flex', gap: 12, marginTop: 18}}>
          {[['Identical picture', '✕', C.red, 0.35], ['Visual similarity', '✓', C.green, 1], ['Context', '✓', C.blue, 1]].map(([t, m, c, o]) => (
            <div key={t as string} style={{flex: 1, padding: '16px 12px', borderRadius: 16, background: `${c}12`, textAlign: 'center', opacity: o as number}}>
              <div style={{fontSize: 30, fontWeight: 800, color: c as string}}>{m}</div>
              <div style={{fontSize: 16, fontWeight: 600, color: C.ink, marginTop: 6}}>{t}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize: 18, color: C.sub, marginTop: 18, lineHeight: 1.45}}>Matches are ranked by how visually alike they are, then refined with context.</div>
      </Card>
    </>
  );
};
