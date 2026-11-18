import React from 'react';
import {C, FONT_UI} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Bar, Brackets, Card, ChromeShade, Feed, LensBottom, LensTop, Outline, ScanLine, ScreenChip, Sheet, StatusPill, Tap, vis} from '../kit';
import {BOXES, Kind, RESULTS, ResultGrid, SheetHeader, Subject, SubjectSeq, seqBox, seqKind} from '../subjects';
import {PALETTES, Sneaker} from '../../components/Sneaker';
import {Chair, Jacket, Mug, Watch} from '../art';

const S = sceneById('results');
const L = local(S);
const B = BOXES.sneaker;
const TABS = [
  {word: 'जूते', tab: 'Similar'},
  {word: 'लिस्टिंग', tab: 'Products'},
  {word: 'शॉपिंग', tab: 'Shopping'},
  {word: 'वेब', tab: 'Web'},
];
const tabIdx = (f: number) => {
  let k = 0;
  TABS.forEach((t, i) => { if (f >= L.w(2, t.word)) k = i; });
  return k;
};
const catSeq = (): [number, Kind][] => [
  [0, 'sneaker'],
  [L.w(4, 'कपड़ों'), 'jacket'],
  [L.w(4, 'फ़र्नीचर'), 'chair'],
  [L.w(4, 'एक्सेसरीज़'), 'watch'],
  [L.w(4, 'रोज़मर्रा'), 'mug'],
  [L.c(5), 'sneaker'],
];

const Rows: React.FC<{f: number; kind: number; a: number}> = ({f, kind, a}) => {
  const rows = kind === 1
    ? RESULTS.map((r) => [r.name, `${r.store} · In stock`, r.price])
    : kind === 2
      ? [['Stridewear', 'Free delivery · 4.8 ★', '$89.99'], ['RunHub', 'Delivery in 2 days · 4.7 ★', '$92.00'], ['Footlane', 'Store pickup · 4.6 ★', '$94.50'], ['Kickstore', 'Delivery in 3 days · 4.5 ★', '$95.00']]
      : [['How to style white sneakers', 'stylejournal.example', ''], ['Running vs. lifestyle sneakers', 'runnersguide.example', ''], ['Caring for knit uppers', 'shoecare.example', ''], ['Low-top sneaker trends', 'trendnotes.example', '']];
  return (
    <div style={{padding: '8px 16px 0'}}>
      {rows.map(([t, s, p], i) => {
        const tt = ip(f, [a + i * 4, a + 12 + i * 4], [0, 1]);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: '1px solid #F1F3F4', opacity: tt, transform: `translateX(${(1 - tt) * 18}px)`}}>
            <div style={{width: 64, height: 48, borderRadius: 10, background: kind === 3 ? ['#E8F0FE', '#FCE8E6', '#FEF7E0', '#E6F4EA'][i] : '#F1F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              {kind === 3 ? <span style={{fontSize: 20, fontWeight: 800, color: [C.blue, C.red, '#B06000', C.green][i]}}>¶</span> : <Sneaker id={`row${kind}${i}`} width={60} palette={PALETTES[RESULTS[i].pal]} shadow={false} />}
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{t}</div>
              <div style={{fontSize: 12, color: kind === 3 ? '#188038' : C.faint, marginTop: 2}}>{s}</div>
            </div>
            {p && <span style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{p}</span>}
          </div>
        );
      })}
    </div>
  );
};

export const Screen: React.FC<{f: number}> = ({f}) => {
  // sheet: up during sentence 1, down for the re-scan in sentence 2, up again in 3-4
  const s1 = Math.min(ip(f, [L.c(0) + 30, L.c(0) + 54], [0, 1], EIO), ip(f, [L.c(1) - 6, L.c(1) + 12], [1, 0], EIO));
  const s2 = Math.min(ip(f, [L.c(2) - 6, L.c(2) + 16], [0, 1], EIO), ip(f, [L.c(4) - 8, L.c(4) + 10], [1, 0], EIO));
  const sheetT = Math.max(s1, s2);
  const camT = sheetT;
  const ti = tabIdx(f);
  const inCats = f >= L.c(4) - 4;
  const sq = catSeq();
  const kind = inCats ? seqKind(f, sq) : 'sneaker';
  const box = inCats ? seqBox(f, sq) : B;
  const showAt = L.w(5, 'कैमरे');
  const about = f >= L.c(3) - 4;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `201px ${B.y + B.h / 2}px`, transform: `translateY(${-170 * camT}px) scale(${1 - 0.18 * camT})`}}>
        <Feed>{inCats ? <SubjectSeq f={f} seq={sq} /> : <Subject kind="sneaker" />}</Feed>
        <Outline box={B} draw={ip(f, [0, 24], [0, 1], EIO)} f={f} op={kind === 'sneaker' && f < L.c(1) + 4 ? 1 : f >= L.c(2) - 6 && f < L.c(4) ? 1 : 0} />
        <Brackets box={{x: box.x - 10, y: box.y - 12, w: box.w + 20, h: box.h + 24}} t={1} op={Math.max(vis(f, L.c(1) + 4, L.c(2) - 2, 10, 10), vis(f, L.c(4) - 2, L.dur + 40, 10, 10))} />
        <ScanLine box={B} p={ip(f, [L.c(1) + 14, L.c(1) + 60], [0, 1], EIO)} op={vis(f, L.c(1) + 14, L.c(1) + 62, 8, 8)} />
        <ScreenChip cx={201} y={box.y - 58} t={inCats ? vis(f, L.c(4) + 4, L.dur + 30, 10, 10) : vis(f, 6, L.c(1) + 2, 10, 8)}>
          {inCats ? (kind === 'sneaker' ? 'Show, don’t describe' : kind === 'jacket' ? 'Clothing' : kind === 'chair' ? 'Furniture' : kind === 'watch' ? 'Accessory' : 'Everyday object') : 'Sneaker · Visual match'}
        </ScreenChip>
      </div>
      <ChromeShade />
      <LensTop />
      <LensBottom op={1 - sheetT} press={Math.sin(Math.PI * ip(f, [showAt - 4, showAt + 8], [0, 1]))} />
      <Tap x={201} y={732} f={f} at={showAt} />
      <StatusPill t={vis(f, L.c(0), L.c(0) + 40)} text="Finding visual matches…" f={f} />
      <Sheet t={sheetT} top={380}>
        {f < L.c(1) + 12 ? (
          <>
            <SheetHeader title="Visual matches" active={0} />
            <ResultGrid f={f} a={L.c(0) + 46} />
          </>
        ) : about ? (
          <>
            <SheetHeader title="About this style" tabs={['Overview', 'Where to buy']} active={f >= L.c(3) + 50 ? 1 : 0} />
            {f < L.c(3) + 50 ? (
              <div style={{padding: '14px 18px', fontSize: 14.5, lineHeight: 1.55, color: C.sub, opacity: ip(f, [L.c(3), L.c(3) + 14], [0, 1])}}>
                <div style={{fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 6}}>Low-top knit running sneaker</div>
                Lightweight knit upper, cushioned sole and a contrasting side stripe. Often styled as an everyday casual shoe.
                <div style={{fontSize: 12, color: C.faint, marginTop: 10}}>Illustrative example</div>
              </div>
            ) : (
              <Rows f={f} kind={2} a={L.c(3) + 50} />
            )}
          </>
        ) : (
          <>
            <SheetHeader title="Results" tabs={TABS.map((t) => t.tab)} active={ti} />
            {ti === 0 ? <ResultGrid f={f} a={L.w(2, 'जूते')} /> : <Rows f={f} kind={ti} a={L.w(2, TABS[ti].word)} />}
          </>
        )}
      </Sheet>
    </div>
  );
};

const CATS = [
  {word: 'कपड़ों', title: 'Clothing', el: <Jacket size={92} />},
  {word: 'फ़र्नीचर', title: 'Furniture', el: <Chair size={92} />},
  {word: 'एक्सेसरीज़', title: 'Accessories', el: <Watch size={92} />},
  {word: 'रोज़मर्रा', title: 'Everyday objects', el: <Mug size={92} />},
];

export const Side: React.FC<{f: number}> = ({f}) => {
  const ti = tabIdx(f);
  const listT = vis(f, L.c(0) + 30, L.c(4), 16, 14);
  return (
    <>
      <div style={{position: 'absolute', left: 1290, top: 176, opacity: listT, transform: `translateY(${(1 - listT) * 16}px)`, fontFamily: FONT_UI}}>
        <div style={{fontSize: 32, fontWeight: 800, color: C.ink}}>Matching results</div>
        <div style={{display: 'flex', gap: 8, marginTop: 14}}>
          {TABS.map((t, i) => {
            const on = f >= L.w(2, t.word) && i === ti && f < L.c(3);
            return <span key={t.tab} style={{fontSize: 16, fontWeight: 700, padding: '7px 14px', borderRadius: 16, background: on ? C.blue : 'rgba(30,40,70,0.07)', color: on ? '#fff' : C.sub}}>{t.tab}</span>;
          })}
        </div>
      </div>
      {RESULTS.slice(0, 3).map((r, i) => {
        const t = Math.min(vis(f, L.c(0) + 40 + i * 6, L.c(4), 16, 14), 1);
        const m = [98, 94, 91][i];
        return (
          <Card key={r.name} x={1290} y={290 + i * 162} w={510} h={146} t={t} pad={12} style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 160, height: 120, borderRadius: 18, background: 'linear-gradient(160deg,#FFFFFF,#E9EDF4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Sneaker id={`rs${i}`} width={140} palette={PALETTES[r.pal]} />
            </div>
            <div style={{flex: 1, paddingRight: 12}}>
              <div style={{fontSize: 21, fontWeight: 700, color: C.ink}}>{r.name}</div>
              <div style={{fontSize: 15, color: C.sub, marginTop: 3}}>{f >= L.c(3) + 50 ? `Available at ${r.store}` : r.store}</div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>
                <span style={{fontSize: 23, fontWeight: 800, color: C.ink}}>{r.price}</span>
                <span style={{fontSize: 14, fontWeight: 700, color: C.green, background: 'rgba(52,168,83,0.12)', padding: '4px 10px', borderRadius: 12}}>{m}% match</span>
              </div>
              <div style={{marginTop: 8}}><Bar p={ip(f, [L.c(0) + 50 + i * 6, L.c(0) + 80 + i * 6], [0, m / 100])} color={C.green} h={5} /></div>
            </div>
          </Card>
        );
      })}
      <div style={{position: 'absolute', left: 1290, top: 790, width: 510, fontFamily: FONT_UI, fontSize: 15, color: C.faint, opacity: listT}}>Illustrative mockup · not real search results</div>
      {CATS.map((c, i) => {
        const at = L.w(4, c.word);
        const t = vis(f, at - 4, L.c(5) + 4, 14, 12);
        const next = i < 3 ? L.w(4, CATS[i + 1].word) : L.c(5);
        const active = f >= at && f < next;
        return (
          <Card key={c.title} x={1290 + (i % 2) * 262} y={250 + Math.floor(i / 2) * 262} w={248} h={240} t={t} dir="up" pad={16} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: active ? `0 20px 50px rgba(66,133,244,0.25), 0 0 0 2px ${C.blue}88` : undefined}}>
            {c.el}
            <span style={{fontSize: 21, fontWeight: 700, color: C.ink}}>{c.title}</span>
          </Card>
        );
      })}
      <Card x={1290} y={320} w={510} t={vis(f, L.c(5) - 2, L.dur, 16, 14)} pad={28}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase'}}>Describe vs. show</div>
        <div style={{marginTop: 16, padding: '14px 16px', borderRadius: 16, background: 'rgba(234,67,53,0.08)', color: '#A50E0E', fontSize: 18, lineHeight: 1.45}}>
          “low white shoe with a red curved stripe and a thick white sole…”
        </div>
        <div style={{marginTop: 14, padding: '14px 16px', borderRadius: 16, background: 'rgba(52,168,83,0.10)', color: '#137333', fontSize: 21, fontWeight: 700, opacity: ip(f, [L.w(5, 'कैमरे'), L.w(5, 'कैमरे') + 14], [0, 1])}}>
          ✓ Point the camera. Done.
        </div>
      </Card>
    </>
  );
};
