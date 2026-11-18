import React from 'react';
import {C} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Brackets, Card, ChromeShade, Dot, Feed, IconTile, LensBottom, LensTop, Outline, ScreenChip, Sparks, vis} from '../kit';
import {BOXES, Kind, LABEL, ptsIn, SubjectSeq, seqBox, seqKind} from '../subjects';
import {LensGlyph} from '../../components/Icons';

const S = sceneById('outro');
const L = local(S);
const last = L.e(L.n - 1);

const seq = (): [number, Kind][] => [
  [0, 'sneaker'],
  [L.c(1), 'plant'],
  [L.c(1) + Math.round((L.e(1) - L.c(1)) / 2), 'landmark'],
  [L.c(2), 'page'],
  [L.c(2) + Math.round((L.e(2) - L.c(2)) / 2), 'sign'],
  [L.c(3), 'sneaker'],
];

export const Screen: React.FC<{f: number}> = ({f}) => {
  const sq = seq();
  const kind = seqKind(f, sq);
  const box = seqBox(f, sq);
  const k = sq.findIndex((s, i) => f >= s[0] && (i === sq.length - 1 || f < sq[i + 1][0]));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <Feed><SubjectSeq f={f} seq={sq} extra={{sign: {t: ip(f, [sq[4][0] + 20, sq[4][0] + 44], [0, 1], EIO)}}} /></Feed>
      <Sparks pts={ptsIn(BOXES[kind], 16, 11 + k)} f={f} a={sq[k][0] + 6} />
      <Brackets box={{x: box.x - 10, y: box.y - 12, w: box.w + 20, h: box.h + 24}} t={1} op={vis(f, L.c(1), L.c(3) + 8, 12, 12)} />
      <Outline box={BOXES.sneaker} draw={ip(f, [L.c(3) + 6, L.c(3) + 34], [0, 1], EIO)} f={f} op={kind === 'sneaker' && f >= L.c(3) ? 1 : 0} />
      <Outline box={BOXES.sneaker} draw={ip(f, [6, 30], [0, 1], EIO)} f={f} op={f < L.c(1) ? 1 : 0} />
      <ScreenChip cx={201} y={box.y - 58} t={vis(f, 10, L.dur + 30, 12, 10)}>{kind === 'sign' ? 'Translated' : LABEL[kind]}</ScreenChip>
      <ChromeShade />
      <LensTop />
      <LensBottom mode={kind === 'sign' ? 'Translate' : kind === 'page' ? 'Text' : 'Search'} />
    </div>
  );
};

const TECH = [
  {w: 'कंप्यूटर', t: 'Computer vision', c: C.blue},
  {w: 'आर्टिफ़िशियल', t: 'Artificial intelligence', c: C.red},
  {w: 'टेक्स्ट', t: 'Text recognition', c: C.yellow},
  {w: 'विज़ुअल', t: 'Visual search', c: C.green},
];
const EXAMPLES: [string, string][] = [['Objects', C.blue], ['Plants', C.green], ['Landmarks', C.yellow], ['Text', C.red], ['Translation', C.blue], ['Products', C.green]];

export const Side: React.FC<{f: number}> = ({f}) => (
  <>
    {TECH.map((t, i) => {
      const at = L.w(0, t.w);
      return (
        <Card key={t.t} x={1290} y={210 + i * 140} w={510} h={118} t={vis(f, at - 4, L.c(1) + 4, 14, 12)} style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <IconTile color={t.c} size={58}><span style={{fontSize: 22, fontWeight: 800}}>{i + 1}</span></IconTile>
          <span style={{fontSize: 25, fontWeight: 700, color: C.ink}}>{t.t}</span>
        </Card>
      );
    })}
    <Card x={1290} y={300} w={510} t={vis(f, L.c(1) - 2, L.c(3), 16, 12)} pad={30}>
      <div style={{display: 'flex', gap: 14}}>
        <div style={{flex: 1, padding: 18, borderRadius: 18, background: 'rgba(30,40,70,0.05)', textAlign: 'center', opacity: 0.6}}>
          <div style={{fontSize: 34, fontWeight: 800, color: C.faint}}>Aa</div>
          <div style={{fontSize: 18, fontWeight: 600, color: C.sub, marginTop: 6}}>Search with words</div>
        </div>
        <div style={{flex: 1, padding: 18, borderRadius: 18, background: '#E8F0FE', textAlign: 'center', opacity: ip(f, [L.c(1) + 20, L.c(1) + 36], [0.3, 1])}}>
          <div style={{display: 'flex', justifyContent: 'center'}}><LensGlyph size={42} /></div>
          <div style={{fontSize: 18, fontWeight: 700, color: C.blue, marginTop: 6}}>Explore with images</div>
        </div>
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22, opacity: ip(f, [L.c(2), L.c(2) + 20], [0, 1])}}>
        {['Identify objects', 'Translate text', 'Find products'].map((t, i) => (
          <span key={t} style={{fontSize: 17, fontWeight: 700, padding: '8px 14px', borderRadius: 16, background: ['#E6F4EA', '#FCE8E6', '#FEF7E0'][i], color: ['#137333', '#A50E0E', '#B06000'][i]}}>{t}</span>
        ))}
      </div>
    </Card>
    <Card x={1290} y={330} w={510} t={vis(f, L.c(3) - 2, last + 20, 16, 14)} pad={30} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      {[['Physical world', C.green], ['AI', C.blue], ['Digital knowledge', C.red]].map(([t, c], i) => (
        <React.Fragment key={t}>
          <div style={{textAlign: 'center', opacity: ip(f, [L.c(3) + i * 14, L.c(3) + 16 + i * 14], [0, 1])}}>
            <div style={{width: 64, height: 64, margin: '0 auto', borderRadius: 32, background: `${c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Dot c={c} s={22} /></div>
            <div style={{fontSize: 17, fontWeight: 700, color: C.ink, marginTop: 10, width: 120}}>{t}</div>
          </div>
          {i < 2 && <span style={{fontSize: 30, color: C.faint}}>⇄</span>}
        </React.Fragment>
      ))}
    </Card>
    {/* final: example chips around */}
    {EXAMPLES.map(([t, c], i) => {
      const a = last + 16 + i * 5;
      const tt = vis(f, a, L.dur + 60, 16, 1);
      return (
        <Card key={t} x={1300 + (i % 2) * 250} y={300 + Math.floor(i / 2) * 140} w={232} h={110} t={tt} dir="up" pad={16} style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Dot c={c} s={14} />
          <span style={{fontSize: 22, fontWeight: 700, color: C.ink}}>{t}</span>
        </Card>
      );
    })}
  </>
);
