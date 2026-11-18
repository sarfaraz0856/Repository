import React from 'react';
import {C, FONT_UI} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Brackets, Card, ChromeShade, Dot, Feed, IconTile, LensBottom, LensTop, Outline, ScanLine, ScreenChip, Sparks, StatusPill, vis} from '../kit';
import {BOXES, HomeScreen, Kind, LABEL, ptsIn, Reveal, seqBox, seqKind, SubjectSeq} from '../subjects';
import {LensGlyph} from '../../components/Icons';

const S = sceneById('intro');
const L = local(S);
const TAP = 44;
const REV: [number, number] = [50, 80];

const seq = (): [number, Kind][] => [
  [0, 'sneaker'],
  [L.w(1, 'plant'), 'plant'],
  [L.w(1, 'famous'), 'landmark'],
  [L.w(1, 'page'), 'notes'],
  [L.c(2), 'sneaker'],
];

export const Screen: React.FC<{f: number}> = ({f}) => {
  const sq = seq();
  const box = seqBox(f, sq);
  const kind = seqKind(f, sq);
  const focus = ip(f, [REV[1], REV[1] + 24], [9, 0], EIO);
  const br = ip(f, [REV[1] + 10, REV[1] + 40], [0, 1], EIO);
  const brOp = Math.min(ip(f, [REV[1] + 6, REV[1] + 16], [0, 1]), ip(f, [L.c(2) + 6, L.c(2) + 18], [1, 0]));
  const chipT = vis(f, L.c(1) - 2, L.c(2) + 4, 10, 8);
  const outline = ip(f, [L.c(2) + 8, L.c(2) + 36], [0, 1], EIO);
  const scanA = L.c(4);
  const scanP = ip(f, [scanA, scanA + 60], [0, 1], EIO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      {f < REV[1] + 2 && <HomeScreen f={f} tapAt={TAP} />}
      <Reveal f={f} a={REV[0]} b={REV[1]}>
        <Feed blur={focus}>
          <SubjectSeq f={f} seq={sq} />
        </Feed>
        <Sparks pts={ptsIn(BOXES[kind], 16, 2 + sq.findIndex((s) => s[1] === kind))} f={f} a={L.c(0) + 10} op={ip(f, [L.c(2) + 6, L.c(2) + 20], [1, 0])} />
        <Brackets box={{x: box.x - 10, y: box.y - 12, w: box.w + 20, h: box.h + 24}} t={br} op={brOp} />
        <ScreenChip cx={201} y={box.y - 56} t={chipT}>
          {LABEL[kind]}
        </ScreenChip>
        <Outline box={BOXES.sneaker} draw={outline} f={f} />
        <ScreenChip cx={201} y={BOXES.sneaker.y - 56} t={vis(f, L.c(2) + 24, L.dur + 30)}>
          Sneaker <span style={{color: C.faint}}>·</span> <span style={{color: C.blue}}>Visual match</span>
        </ScreenChip>
        <ScanLine box={BOXES.sneaker} p={scanP} op={vis(f, scanA, scanA + 62, 8, 10)} />
        <ChromeShade />
        <LensTop op={ip(f, [REV[1] - 14, REV[1] + 4], [0, 1])} />
        <LensBottom op={ip(f, [REV[1] - 8, REV[1] + 12], [0, 1])} />
        <StatusPill t={vis(f, L.c(3), L.c(4) + 40)} text="Analyzing image…" f={f} />
      </Reveal>
    </div>
  );
};

const CATS: {kind: Kind; word: string; title: string; desc: string; color: string; glyph: string}[] = [
  {kind: 'sneaker', word: 'product', title: 'A product', desc: 'Find visually similar items', color: C.blue, glyph: '👟'},
  {kind: 'plant', word: 'plant', title: 'A plant', desc: 'Explore possible matches', color: C.green, glyph: '🌿'},
  {kind: 'landmark', word: 'famous', title: 'A famous landmark', desc: 'Discover its history', color: C.yellow, glyph: '🏛'},
  {kind: 'notes', word: 'page', title: 'Handwritten notes', desc: 'Copy and search the text', color: C.red, glyph: '✍'},
];
const CHAPTERS = ['What is Google Lens?', 'How image scanning works', 'AI and object recognition', 'Visual search and results', 'Text recognition and translation', 'Real-world applications', 'How to use Google Lens', 'Conclusion'];

const CatIcon: React.FC<{i: number}> = ({i}) => {
  const paths = [
    <path key="0" d="M3 15c3 0 5-2 7-5l2 1c1 2 4 3 8 3v3H3z" fill="#fff" />,
    <path key="1" d="M12 21V11M12 11c-5 0-7-4-7-8 4 0 7 3 7 8zm0 0c0-5 3-8 7-8 0 4-2 8-7 8z" stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" />,
    <path key="2" d="M12 3l2 5H10zM8 8h8v12H8zM5 20h14" stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" />,
    <path key="3" d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" />,
  ];
  return <svg width="28" height="28" viewBox="0 0 24 24">{paths[i]}</svg>;
};

export const Side: React.FC<{f: number}> = ({f}) => {
  const out = L.c(3);
  return (
    <>
      {CATS.map((c, i) => {
        const at = i === 0 ? L.w(1, 'product') : L.w(1, c.word);
        const t = vis(f, at - 4, out + 6, 14, 14);
        const active = f >= at && (i === 3 ? f < L.c(2) : f < (i < 3 ? L.w(1, CATS[i + 1].word) : 0));
        return (
          <Card key={c.kind} x={1290} y={238 + i * 150} w={500} h={124} t={t} style={{display: 'flex', alignItems: 'center', gap: 22, transform: `${t < 1 ? `translateX(${(1 - t) * 50}px)` : ''} scale(${active ? 1.03 : 1})`, boxShadow: active ? `0 24px 60px ${c.color}33, 0 0 0 2px ${c.color}66` : undefined}}>
            <IconTile color={c.color} size={64}><CatIcon i={i} /></IconTile>
            <div>
              <div style={{fontSize: 25, fontWeight: 700, color: C.ink}}>{c.title}</div>
              <div style={{fontSize: 18, color: C.sub, marginTop: 4}}>{c.desc}</div>
            </div>
          </Card>
        );
      })}
      {/* AI + visual search badge during sentence 3 */}
      <Card x={1290} y={420} w={500} t={vis(f, L.c(2) + 10, L.c(3) + 4)} dir="up" style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <LensGlyph size={44} />
          <span style={{fontSize: 26, fontWeight: 800, color: C.ink}}>Powered by</span>
        </div>
        {[['Artificial intelligence', C.blue], ['Visual search technology', C.green]].map(([t, c], i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 21, fontWeight: 600, color: C.ink, opacity: ip(f, [L.w(2, i ? 'visual' : 'artificial'), L.w(2, i ? 'visual' : 'artificial') + 12], [0.25, 1])}}>
            <Dot c={c} s={12} />
            {t}
          </div>
        ))}
      </Card>
      {/* chapter overview */}
      <Card x={1290} y={196} w={500} t={vis(f, L.c(4) - 4, L.dur, 16, 14)} pad={28} style={{}}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.4, color: C.faint, textTransform: 'uppercase', marginBottom: 14, fontFamily: FONT_UI}}>In this video</div>
        {CHAPTERS.map((ch, i) => {
          const t = ip(f, [L.c(4) + 6 + i * 5, L.c(4) + 20 + i * 5], [0, 1]);
          return (
            <div key={ch} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderTop: i ? '1px solid rgba(30,40,70,0.07)' : undefined, opacity: t, transform: `translateX(${(1 - t) * 20}px)`}}>
              <span style={{width: 34, height: 34, borderRadius: 17, background: [C.blue, C.red, C.yellow, C.green][(i + 1) % 4], color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{String(i + 2).padStart(2, '0')}</span>
              <span style={{fontSize: 20, fontWeight: 600, color: C.ink}}>{ch}</span>
            </div>
          );
        })}
      </Card>
    </>
  );
};
