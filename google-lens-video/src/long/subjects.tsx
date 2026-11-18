import React from 'react';
import {C, FONT_UI} from '../theme';
import {EIO, ip} from '../anim';
import {CameraScene} from '../components/LensScreen';
import {PALETTES, Sneaker} from '../components/Sneaker';
import {LensGlyph, MicIcon, SearchIcon} from '../components/Icons';
import {DeskBg, GardenBg, Landmark, Menu, Notes, OutdoorBg, Plant, PrintedPage, Sign, WallBg, Jacket, Chair, Watch, Mug} from './art';
import {Box, SH, SW} from './kit';

export type Kind = 'sneaker' | 'plant' | 'landmark' | 'notes' | 'page' | 'sign' | 'menu' | 'jacket' | 'chair' | 'watch' | 'mug';

export const BOXES: Record<Kind, Box> = {
  sneaker: {x: 28, y: 318, w: 346, h: 202},
  plant: {x: 66, y: 206, w: 270, h: 356},
  landmark: {x: 92, y: 182, w: 218, h: 342},
  notes: {x: 46, y: 200, w: 310, h: 392},
  page: {x: 40, y: 186, w: 322, h: 418},
  sign: {x: 26, y: 262, w: 350, h: 228},
  menu: {x: 52, y: 200, w: 298, h: 376},
  jacket: {x: 76, y: 226, w: 250, h: 270},
  chair: {x: 76, y: 226, w: 250, h: 270},
  watch: {x: 76, y: 226, w: 250, h: 270},
  mug: {x: 76, y: 226, w: 250, h: 270},
};
export const LABEL: Record<Kind, string> = {
  sneaker: 'Sneaker', plant: 'Plant', landmark: 'Landmark', notes: 'Handwritten notes', page: 'Printed text', sign: 'Sign',
  menu: 'Menu', jacket: 'Clothing', chair: 'Furniture', watch: 'Accessory', mug: 'Everyday object',
};

/** deterministic feature points inside a box */
export const ptsIn = (b: Box, n = 18, seed = 1): [number, number][] =>
  Array.from({length: n}).map((_, i) => {
    const a = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const r = Math.sin((i + 1) * 78.233 * seed) * 12543.123;
    return [b.x + 18 + (a - Math.floor(a)) * (b.w - 36), b.y + 18 + (r - Math.floor(r)) * (b.h - 36)];
  });

export const lerpBox = (a: Box, b: Box, t: number): Box => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t});

const ProductScene: React.FC<{children: React.ReactNode}> = ({children}) => (
  <>
    <CameraScene />
    <div style={{position: 'absolute', left: 101, top: 246, width: 200, height: 200}}>{children}</div>
  </>
);

/** Full camera frame (background + subject) for a subject kind */
export const Subject: React.FC<{kind: Kind; t?: number; pal?: string; dim?: number}> = ({kind, t = 0, pal = 'hero', dim = 0}) => {
  let el: React.ReactNode;
  switch (kind) {
    case 'sneaker':
      el = (<><CameraScene /><div style={{position: 'absolute', left: 31, top: 325}}><Sneaker id={`subj-${pal}`} width={340} palette={PALETTES[pal]} /></div></>);
      break;
    case 'plant':
      el = (<><GardenBg /><div style={{position: 'absolute', left: 86, top: 218}}><Plant width={230} /></div></>);
      break;
    case 'landmark':
      el = (<><OutdoorBg /><div style={{position: 'absolute', left: 106, top: 194}}><Landmark width={190} /></div></>);
      break;
    case 'notes':
      el = (<><DeskBg /><div style={{position: 'absolute', left: 61, top: 220}}><Notes width={280} /></div></>);
      break;
    case 'page':
      el = (<><DeskBg /><div style={{position: 'absolute', left: 51, top: 200}}><PrintedPage width={300} /></div></>);
      break;
    case 'sign':
      el = (<><WallBg /><div style={{position: 'absolute', left: 36, top: 276}}><Sign width={330} t={t} /></div></>);
      break;
    case 'menu':
      el = (<><DeskBg /><div style={{position: 'absolute', left: 66, top: 212}}><Menu width={270} t={t} /></div></>);
      break;
    case 'jacket':
      el = <ProductScene><Jacket size={200} /></ProductScene>;
      break;
    case 'chair':
      el = <ProductScene><Chair size={200} /></ProductScene>;
      break;
    case 'watch':
      el = <ProductScene><Watch size={200} /></ProductScene>;
      break;
    case 'mug':
      el = <ProductScene><Mug size={200} /></ProductScene>;
      break;
  }
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {el}
      {dim > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(8,10,20,${0.62 * dim})`}} />}
    </div>
  );
};

/** Crossfading stack of subjects. seq: [startFrame, kind][] ascending */
export const SubjectSeq: React.FC<{f: number; seq: [number, Kind][]; xf?: number; extra?: Partial<Record<Kind, {t?: number; pal?: string; dim?: number}>>}> = ({f, seq, xf = 12, extra = {}}) => {
  let k = 0;
  for (let i = 0; i < seq.length; i++) if (f >= seq[i][0]) k = i;
  const items: React.ReactNode[] = [];
  const cur = seq[k];
  const t = ip(f, [cur[0], cur[0] + xf], [0, 1], EIO);
  if (k > 0 && t < 1) items.push(<Subject key={'p' + (k - 1)} kind={seq[k - 1][1]} {...extra[seq[k - 1][1]]} />);
  items.push(
    <div key={'c' + k} style={{position: 'absolute', inset: 0, opacity: k === 0 ? 1 : t}}>
      <Subject kind={cur[1]} {...extra[cur[1]]} />
    </div>,
  );
  return <>{items}</>;
};

/** Box of the active subject, smoothly interpolated at changes */
export const seqBox = (f: number, seq: [number, Kind][], xf = 14): Box => {
  let k = 0;
  for (let i = 0; i < seq.length; i++) if (f >= seq[i][0]) k = i;
  if (k === 0) return BOXES[seq[0][1]];
  const t = ip(f, [seq[k][0], seq[k][0] + xf], [0, 1], EIO);
  return lerpBox(BOXES[seq[k - 1][1]], BOXES[seq[k][1]], t);
};
export const seqKind = (f: number, seq: [number, Kind][]): Kind => {
  let k = 0;
  for (let i = 0; i < seq.length; i++) if (f >= seq[i][0]) k = i;
  return seq[k][1];
};

/** Phone home screen with a search widget; tapping the lens icon at `tapAt` */
export const LENS_ICON = {x: 342, y: 672};
export const HomeScreen: React.FC<{f: number; tapAt: number; typed?: string}> = ({f, tapAt, typed}) => {
  const press = 1 - 0.1 * Math.sin(Math.PI * ip(f, [tapAt - 8, tapAt + 4], [0, 1], EIO));
  const ripple = ip(f, [tapAt - 6, tapAt + 16], [0, 1]);
  const apps = [['#4285F4', '#7BAAF7'], ['#EA4335', '#F28B82'], ['#FBBC05', '#FDD663'], ['#34A853', '#81C995']];
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(165deg, #BFD3FF 0%, #E3D7FF 45%, #FFE1D2 100%)', fontFamily: FONT_UI}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.6), transparent 50%)'}} />
      <div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center', color: '#fff', textShadow: '0 2px 12px rgba(40,50,110,0.3)'}}>
        <div style={{fontSize: 18, fontWeight: 600}}>Tuesday, November 17</div>
        <div style={{fontSize: 92, fontWeight: 300, letterSpacing: -2, lineHeight: 1.05}}>9:41</div>
      </div>
      <div style={{position: 'absolute', left: 22, top: 640, width: SW - 44, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.86)', boxShadow: '0 10px 30px rgba(60,70,130,0.18)', display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box', gap: 12}}>
        <SearchIcon size={22} color="#5f6675" />
        <span style={{flex: 1, color: typed ? C.ink : '#6b7280', fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden'}}>{typed || 'Search'}</span>
        <MicIcon size={24} />
        <div style={{position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press})`}}>
          <div style={{position: 'absolute', width: 40, height: 40, borderRadius: 20, background: `rgba(66,133,244,${0.35 * (1 - ripple)})`, transform: `scale(${1 + ripple * 1.6})`}} />
          <LensGlyph size={30} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 30, top: 742, width: SW - 60, display: 'flex', justifyContent: 'space-between'}}>
        {apps.map(([a, b], i) => <div key={i} style={{width: 66, height: 66, borderRadius: 18, background: `linear-gradient(140deg, ${b}, ${a})`, boxShadow: '0 8px 18px rgba(40,50,110,0.18)'}} />)}
      </div>
    </div>
  );
};

/** circular reveal wrapper from the home lens icon */
export const Reveal: React.FC<{f: number; a: number; b: number; children: React.ReactNode}> = ({f, a, b, children}) => {
  if (f < a) return null;
  const r = ip(f, [a, b], [0, 1], EIO) * 1000;
  return <div style={{position: 'absolute', inset: 0, clipPath: f < b ? `circle(${r}px at ${LENS_ICON.x}px ${LENS_ICON.y}px)` : undefined}}>{children}</div>;
};

export const RESULTS = [
  {pal: 'hero', name: 'AeroRun Knit', price: '$89.99', store: 'Stridewear'},
  {pal: 'sky', name: 'CloudStep Runner', price: '$112.50', store: 'RunHub'},
  {pal: 'sand', name: 'Velocity Low', price: '$74.00', store: 'Footlane'},
  {pal: 'black', name: 'Urban Court', price: '$65.00', store: 'Kickstore'},
];

/** 2x2 product grid used inside the results sheet */
export const ResultGrid: React.FC<{f: number; a: number}> = ({f, a}) => (
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 16px 0'}}>
    {RESULTS.map((r, i) => {
      const t = ip(f, [a + i * 5, a + i * 5 + 16], [0, 1]);
      return (
        <div key={r.name} style={{borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #ECEEF2', boxShadow: '0 4px 12px rgba(30,40,70,0.07)', opacity: t, transform: `translateY(${(1 - t) * 26}px)`}}>
          <div style={{height: 100, background: 'linear-gradient(160deg,#F4F6FA,#E6EAF1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Sneaker id={`lg${i}`} width={146} palette={PALETTES[r.pal]} />
          </div>
          <div style={{padding: '8px 10px 10px'}}>
            <div style={{fontSize: 13.5, fontWeight: 600, color: C.ink}}>{r.name}</div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 3, alignItems: 'baseline'}}>
              <span style={{fontSize: 15, fontWeight: 700, color: C.ink}}>{r.price}</span>
              <span style={{fontSize: 11.5, color: C.faint}}>{r.store}</span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export const SheetHeader: React.FC<{title: string; tabs?: string[]; active?: number}> = ({title, tabs = ['All', 'Products', 'Shopping', 'Web'], active = 0}) => (
  <>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px 0'}}>
      <span style={{fontSize: 20, fontWeight: 700, color: C.ink}}>{title}</span>
      <span style={{fontSize: 12, fontWeight: 600, color: C.faint}}>Illustrative</span>
    </div>
    <div style={{display: 'flex', gap: 8, padding: '10px 18px 0'}}>
      {tabs.map((t, i) => (
        <span key={t} style={{fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 16, background: i === active ? '#E8F0FE' : '#F1F3F6', color: i === active ? C.blue : '#4a5262'}}>{t}</span>
      ))}
    </div>
  </>
);

/** Photo gallery grid (for "choose an existing picture") */
export const Gallery: React.FC<{f: number; pickAt: number}> = ({f, pickAt}) => {
  const tiles: React.ReactNode[] = [
    <Sneaker key="s" id="gal" width={110} />, <Plant key="p" width={60} />, <Landmark key="l" width={48} />, <Mug key="m" size={80} />,
    <Chair key="c" size={80} />, <Watch key="w" size={80} />, <Jacket key="j" size={80} />, <Menu key="mn" width={64} />, <Notes key="n" width={70} />,
  ];
  const bgs = ['#E9EDF4', '#D7E6CF', '#CFE1F5', '#E9E1D4', '#F4E8C8', '#E3E6EA', '#D9E2F2', '#EFE6D5', '#E8E4D8'];
  const pick = ip(f, [pickAt, pickAt + 10], [0, 1]);
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: '14px 14px 0'}}>
      {tiles.map((t, i) => (
        <div key={i} style={{height: 116, borderRadius: 10, background: bgs[i], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: i === 0 && pick > 0 ? `0 0 0 ${4 * pick}px ${C.blue}` : undefined, transform: i === 0 ? `scale(${1 - 0.04 * Math.sin(Math.PI * pick)})` : undefined}}>
          {t}
        </div>
      ))}
    </div>
  );
};
