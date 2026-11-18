import React from 'react';
import {C, FONT_UI} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Bar, Brackets, Card, ChromeShade, Dot, Feed, IconTile, LensBottom, LensMode, LensTop, Outline, ScreenChip, Sheet, Sparks, StatusPill, vis} from '../kit';
import {BOXES, Kind, ptsIn, ResultGrid, SheetHeader, Subject, SubjectSeq, seqBox, seqKind} from '../subjects';
import {DeskBg, PrintedPage} from '../art';

const S = sceneById('uses');
const L = local(S);

const seq = (): [number, Kind][] => [
  [0, 'sneaker'],
  [L.c(1), 'plant'],
  [L.c(2), 'landmark'],
  [L.c(3), 'sneaker'],
  [L.w(4, 'मेन्यू'), 'menu'],
  [L.w(4, 'कॉपी'), 'page'],
  [L.w(4, 'आस-पास'), 'sneaker'],
  [L.c(5), 'mug'],
];

const Collage: React.FC = () => {
  const kinds: Kind[] = ['plant', 'landmark', 'sneaker', 'menu'];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0E1116', padding: '120px 12px 0', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: 330, gap: 10}}>
      {kinds.map((k) => (
        <div key={k} style={{position: 'relative', borderRadius: 18, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -6, top: -40, width: 402, height: 852, transform: 'scale(0.47)', transformOrigin: '0 0'}}><Subject kind={k} /></div>
        </div>
      ))}
    </div>
  );
};

const Matches: React.FC<{f: number; a: number; title: string; rows: [string, string, number][]}> = ({f, a, title, rows}) => (
  <>
    <SheetHeader title={title} tabs={['Example result']} active={0} />
    {rows.map(([n, d, p], i) => {
      const t = ip(f, [a + i * 6, a + 16 + i * 6], [0, 1]);
      return (
        <div key={n} style={{margin: '12px 16px 0', padding: 12, borderRadius: 14, border: '1px solid #ECEEF2', opacity: t, transform: `translateY(${(1 - t) * 16}px)`}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{n}</span>
            {p > 0 && <span style={{fontSize: 13, fontWeight: 700, color: C.green}}>{p}% similar</span>}
          </div>
          <div style={{fontSize: 12.5, color: C.faint, marginTop: 3}}>{d}</div>
          {p > 0 && <div style={{marginTop: 8}}><Bar p={(p / 100) * t} color={C.green} h={5} /></div>}
        </div>
      );
    })}
  </>
);

export const Screen: React.FC<{f: number}> = ({f}) => {
  const sq = seq();
  const kind = seqKind(f, sq);
  const box = seqBox(f, sq);
  const collage = vis(f, -10, L.c(1) + 6, 1, 14);
  const menuT = ip(f, [L.w(4, 'मेन्यू') + 20, L.w(4, 'मेन्यू') + 44], [0, 1], EIO);
  const lim = f >= L.c(5) - 4;
  const qAt = L.w(6, 'क्वालिटी'), lAt = L.w(6, 'रोशनी'), iAt = L.w(6, 'उपलब्ध');
  const blur = lim ? 3 + 5 * vis(f, qAt, lAt + 4, 10, 10) : 0;
  const dim = lim ? 0.55 + 0.4 * vis(f, lAt, iAt + 4, 10, 10) : 0;
  const plantSheet = vis(f, L.c(1) + 40, L.c(2), 18, 12);
  const lmSheet = vis(f, L.c(2) + 40, L.c(3), 18, 12);
  const prodSheet = vis(f, L.c(3) + 36, L.c(4), 18, 12);
  const sheetT = Math.max(plantSheet, lmSheet, prodSheet);
  const pageHi = [0, 1, 2, 3, 4].map((i) => ip(f, [L.w(4, 'कॉपी') + 10 + i * 4, L.w(4, 'कॉपी') + 20 + i * 4], [0, 1]));
  const mode: LensMode = kind === 'menu' ? 'Translate' : kind === 'page' ? 'Text' : 'Search';
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `201px ${box.y + box.h / 2}px`, transform: `translateY(${-150 * sheetT}px) scale(${1 - 0.15 * sheetT})`}}>
        <Feed blur={blur}>
          <SubjectSeq f={f} seq={sq} extra={{menu: {t: menuT}, mug: {dim}}} />
          {kind === 'page' && (
            <div style={{position: 'absolute', inset: 0}}>
              <DeskBg />
              <div style={{position: 'absolute', left: 51, top: 200}}><PrintedPage width={300} hi={pageHi} /></div>
            </div>
          )}
        </Feed>
        {!lim && <Brackets box={{x: box.x - 10, y: box.y - 12, w: box.w + 20, h: box.h + 24}} t={1} op={vis(f, L.c(1), L.c(5), 12, 10)} />}
        <Outline box={BOXES.plant} draw={ip(f, [L.c(1) + 16, L.c(1) + 40], [0, 1], EIO)} f={f} op={kind === 'plant' ? 1 : 0} />
        <Outline box={BOXES.landmark} draw={ip(f, [L.c(2) + 16, L.c(2) + 40], [0, 1], EIO)} f={f} op={kind === 'landmark' ? 1 : 0} />
        <Outline box={BOXES.sneaker} draw={ip(f, [L.c(3) + 10, L.c(3) + 34], [0, 1], EIO)} f={f} op={kind === 'sneaker' && f < L.c(4) ? 1 : 0} />
        <Sparks pts={ptsIn(BOXES.sneaker, 18, 7)} f={f} a={L.w(4, 'आस-पास')} op={kind === 'sneaker' && f >= L.c(4) ? 1 : 0} />
        <ScreenChip cx={201} y={box.y - 58} t={vis(f, L.c(1) + 10, L.c(5), 10, 10) * (1 - sheetT)}>
          {kind === 'plant' ? 'Plant · possible matches' : kind === 'landmark' ? 'Landmark · possible match' : kind === 'menu' ? (menuT > 0.5 ? 'Menu · translated' : 'Menu · Spanish') : kind === 'page' ? 'Copy printed text' : f >= L.c(4) ? 'Objects around you' : 'Product · similar items'}
        </ScreenChip>
        {lim && <ScreenChip cx={201} y={BOXES.mug.y - 58} t={vis(f, L.c(5) + 10, L.dur + 30, 10, 10)} dot={C.yellow}>Low confidence</ScreenChip>}
      </div>
      <ChromeShade />
      <LensTop />
      <LensBottom mode={mode} op={1 - sheetT} />
      <StatusPill t={vis(f, L.c(5) + 4, L.dur + 30)} text={f >= iAt ? 'Limited information available' : f >= lAt ? 'Low light detected' : f >= qAt ? 'Image is blurry' : 'Results may vary'} f={f} />
      <Sheet t={plantSheet} top={420}><Matches f={f} a={L.c(1) + 50} title="Possible matches" rows={[['Monstera deliciosa', 'Swiss cheese plant · care tips', 92], ['Philodendron', 'Related species', 71], ['Similar plants', 'Images from the web', 0]]} /></Sheet>
      <Sheet t={lmSheet} top={420}><Matches f={f} a={L.c(2) + 50} title="Possible match" rows={[['Historic clock tower', 'Landmark · example', 88], ['History', 'When and why it was built', 0], ['Visiting info', 'Hours, directions and photos', 0]]} /></Sheet>
      <Sheet t={prodSheet} top={420}><SheetHeader title="Similar items" active={1} /><ResultGrid f={f} a={L.c(3) + 44} /></Sheet>
      {collage > 0.01 && <div style={{position: 'absolute', inset: 0, opacity: collage}}><Collage /></div>}
    </div>
  );
};

const USE: {cue: number; title: string; desc: string; color: string; icon: string}[] = [
  {cue: 1, title: 'Identify plants', desc: 'Scan an unfamiliar plant to explore possible matches and care tips.', color: C.green, icon: 'M12 21V11M12 11c-5 0-7-4-7-8 4 0 7 3 7 8zm0 0c0-5 3-8 7-8 0 4-2 8-7 8z'},
  {cue: 2, title: 'Explore landmarks', desc: 'Recognize a famous place and discover its history.', color: C.yellow, icon: 'M12 3l2 5H10zM8 8h8v12H8zM5 20h14'},
  {cue: 3, title: 'Shop by image', desc: 'Find similar items without knowing the brand or model.', color: C.blue, icon: 'M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0'},
];

export const Side: React.FC<{f: number}> = ({f}) => {
  const qAt = L.w(6, 'क्वालिटी'), lAt = L.w(6, 'रोशनी'), iAt = L.w(6, 'उपलब्ध');
  return (
    <>
      <Card x={1290} y={260} w={510} t={vis(f, 4, L.c(1), 16, 12)} pad={28}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase', marginBottom: 12}}>Everyday situations</div>
        {[['Plants', C.green], ['Landmarks', C.yellow], ['Products', C.blue], ['Menus & text', C.red]].map(([t, c], i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', fontSize: 22, fontWeight: 600, color: C.ink, opacity: ip(f, [8 + i * 8, 22 + i * 8], [0, 1])}}>
            <Dot c={c} s={13} /> {t}
          </div>
        ))}
      </Card>
      {USE.map((u) => (
        <Card key={u.title} x={1290} y={300} w={510} t={vis(f, L.c(u.cue) - 2, L.c(u.cue + 1), 16, 12)} pad={30}>
          <IconTile color={u.color} size={70}><svg width="36" height="36" viewBox="0 0 24 24"><path d={u.icon} stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" /></svg></IconTile>
          <div style={{fontSize: 30, fontWeight: 800, color: C.ink, marginTop: 18}}>{u.title}</div>
          <div style={{fontSize: 20, color: C.sub, marginTop: 8, lineHeight: 1.45}}>{u.desc}</div>
          <div style={{fontSize: 14, color: C.faint, marginTop: 16}}>Illustrative example · not real search results</div>
        </Card>
      ))}
      {[['Translate menus', 'मेन्यू', C.red], ['Copy printed text', 'कॉपी', C.yellow], ['Search objects around you', 'आस-पास', C.green]].map(([t, w, c], i) => {
        const at = L.w(4, w as string);
        return (
          <Card key={t as string} x={1290} y={260 + i * 150} w={510} h={124} t={vis(f, at - 4, L.c(5), 14, 12)} style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <IconTile color={c as string} size={56}><span style={{fontSize: 20, fontWeight: 800}}>{i + 1}</span></IconTile>
            <span style={{fontSize: 24, fontWeight: 700, color: C.ink}}>{t}</span>
          </Card>
        );
      })}
      <Card x={1290} y={260} w={510} t={vis(f, L.c(5) - 2, L.dur, 16, 14)} pad={28}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 34, height: 34, borderRadius: 17, background: C.yellow, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20}}>!</span>
          <span style={{fontSize: 27, fontWeight: 800, color: C.ink}}>AI isn’t always perfect</span>
        </div>
        <div style={{fontSize: 18, color: C.sub, marginTop: 10}}>Results can vary depending on:</div>
        {[['Image quality', qAt, C.blue], ['Lighting', lAt, C.red], ['Information available', iAt, C.green]].map(([t, at, c]) => {
          const on = f >= (at as number);
          return (
            <div key={t as string} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, padding: '12px 14px', borderRadius: 14, background: on ? `${c}14` : 'rgba(30,40,70,0.04)', opacity: on ? 1 : 0.45}}>
              <Dot c={c as string} s={12} />
              <span style={{fontSize: 21, fontWeight: 700, color: C.ink}}>{t}</span>
            </div>
          );
        })}
      </Card>
    </>
  );
};
