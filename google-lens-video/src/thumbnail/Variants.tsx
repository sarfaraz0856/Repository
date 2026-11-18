import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/700.css';
import '@fontsource/noto-sans-devanagari/800.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {C, FONT_HEAD, FONT_UI} from '../theme';
import {Phone} from '../components/Phone';
import {LensGlyph} from '../components/Icons';
import {PALETTES, Sneaker} from '../components/Sneaker';
import {Brackets, ChromeShade, LensBottom, LensTop, Outline, ScreenChip, Sparks} from '../long/kit';
import {BOXES, ptsIn, Subject} from '../long/subjects';
import {Landmark, Menu, Plant} from '../long/art';

const HI = "'Noto Sans Devanagari', 'Inter', sans-serif";
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['800 20px "Plus Jakarta Sans"', '800 20px Inter', '600 20px Inter', '800 20px "Noto Sans Devanagari"', '700 20px "Noto Sans Devanagari"'].map((x) => document.fonts.load(x, 'फोटो से कुछ भी सर्च AI ने कैसे पहचाना')))
      .finally(() => continueRender(h));
  }, [h]);
};

const Check: React.FC<{c: string; s?: number}> = ({c, s = 34}) => (
  <span style={{width: s, height: s, borderRadius: s / 2, background: c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

// ---------------------------------------------------------------- B: "Photo से कुछ भी Search!"
const PlantScreen: React.FC = () => {
  const B = BOXES.plant;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', fontFamily: FONT_UI}}>
      <Subject kind="plant" />
      <Sparks pts={ptsIn(B, 16, 9)} f={200} a={0} />
      <Brackets box={{x: B.x - 10, y: B.y - 12, w: B.w + 20, h: B.h + 24}} t={1} op={1} />
      <Outline box={B} draw={1} f={0} />
      <ScreenChip cx={201} y={B.y - 56} t={1}>Plant <span style={{color: C.faint}}>·</span> <span style={{color: C.green}}>Monstera</span></ScreenChip>
      <ChromeShade />
      <LensTop />
      <LensBottom />
    </div>
  );
};

export const ThumbB: React.FC = () => {
  useFonts();
  const tiles: [React.ReactNode, string, string][] = [
    [<Plant key="p" width={74} />, 'Plant', C.green],
    [<Landmark key="l" width={58} />, 'Landmark', C.yellow],
    [<Sneaker key="s" id="tb" width={120} shadow={false} />, 'Shopping', C.blue],
    [<Menu key="m" width={70} t={1} />, 'Translate', C.red],
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'linear-gradient(135deg, #FFFFFF 0%, #EAF1FF 55%, #FFF4DC 100%)'}}>
      {[[1100, 90, C.blue], [1220, 650, C.yellow], [80, 680, C.green]].map(([x, y, c], i) => (
        <div key={i} style={{position: 'absolute', left: (x as number) - 280, top: (y as number) - 280, width: 560, height: 560, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 65%)`, opacity: 0.22}} />
      ))}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720}}>
        <div style={{position: 'absolute', left: 860 - 960, top: 390 - 540, width: 1920, height: 1080, transform: 'scale(0.78) rotate(5deg)', transformOrigin: '960px 540px'}}>
          <Phone screen={<PlantScreen />} />
        </div>
      </div>
      {tiles.map(([el, t, c], i) => (
        <div key={t} style={{position: 'absolute', left: 1045, top: 70 + i * 152, width: 205, height: 134, borderRadius: 22, background: '#fff', boxShadow: '0 16px 40px rgba(30,45,90,0.22)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, border: `3px solid ${c}`}}>
          <div style={{height: 82, display: 'flex', alignItems: 'center'}}>{el}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_UI, fontSize: 21, fontWeight: 800, color: C.ink}}><Check c={c} s={24} />{t}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 56, top: 66, width: 640}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 20px 10px 12px', borderRadius: 40, background: C.ink}}>
          <LensGlyph size={42} />
          <span style={{fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 32, color: '#fff'}}>Google Lens</span>
        </div>
        <div style={{fontFamily: HI, fontWeight: 800, fontSize: 112, lineHeight: 1.12, color: C.ink, marginTop: 22, letterSpacing: -1}}>
          Photo से
          <br />
          <span style={{color: C.blue}}>कुछ भी</span>
          <br />
          <span style={{color: '#fff', background: C.red, padding: '0 18px', borderRadius: 18, boxDecorationBreak: 'clone'}}>Search!</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- C: "AI ने कैसे पहचाना?"
export const ThumbC: React.FC = () => {
  useFonts();
  const feats: [string, string][] = [['Shape', C.blue], ['Color', C.red], ['Style', C.yellow], ['Sneaker 97%', C.green]];
  const NX = 770, NY = 140;
  const layers = [3, 5, 5, 3];
  const pos = (l: number, i: number): [number, number] => [NX + l * 90, NY + 30 + ((i + 0.5) * 200) / layers[l]];
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(ellipse 80% 110% at 75% 45%, #2A1B5C 0%, #120B33 50%, #05040F 100%)'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(138,180,248,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(138,180,248,0.10) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      {/* neural net */}
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
        {layers.slice(0, -1).map((n, l) => Array.from({length: n}).map((_, i) => Array.from({length: layers[l + 1]}).map((__, j) => {
          const [x1, y1] = pos(l, i), [x2, y2] = pos(l + 1, j);
          return <line key={`${l}${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8AB4F8" strokeOpacity={0.35} strokeWidth={1.4} />;
        })))}
        {layers.map((n, l) => Array.from({length: n}).map((_, i) => {
          const [x, y] = pos(l, i); const c = [C.blue, C.red, C.yellow, C.green][l];
          return <circle key={`n${l}${i}`} cx={x} cy={y} r={11} fill="#0B0820" stroke={c} strokeWidth={4} style={{filter: `drop-shadow(0 0 8px ${c})`}} />;
        }))}
      </svg>
      {/* scanned sneaker card */}
      <div style={{position: 'absolute', left: 760, top: 400, width: 470, height: 270, borderRadius: 30, background: 'linear-gradient(160deg,#FFFFFF,#E3E8F0)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-4deg)'}}>
        <Sneaker id="tc" width={400} palette={PALETTES.hero} />
        <div style={{position: 'absolute', inset: 18, borderRadius: 22, border: '5px solid transparent', background: `linear-gradient(white,white) padding-box, linear-gradient(135deg, ${C.blue}, ${C.green}, ${C.yellow}, ${C.red}) border-box`, WebkitMask: 'linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor'} as React.CSSProperties} />
        <div style={{position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', padding: '8px 18px', borderRadius: 24, background: C.green, color: '#fff', fontFamily: FONT_UI, fontWeight: 800, fontSize: 26, whiteSpace: 'nowrap', boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>✓ Sneaker · 97%</div>
      </div>
      {/* feature chips */}
      {feats.slice(0, 3).map(([t, c], i) => (
        <div key={t} style={{position: 'absolute', left: 1072, top: 132 + i * 72, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px 9px 10px', borderRadius: 30, background: 'rgba(255,255,255,0.95)', fontFamily: FONT_UI, fontWeight: 800, fontSize: 23, color: C.ink, boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
          <Check c={c} s={28} />{t}
        </div>
      ))}
      {/* headline */}
      <div style={{position: 'absolute', left: 56, top: 70, width: 680}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 20px 10px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.95)'}}>
          <LensGlyph size={42} />
          <span style={{fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 32, color: C.ink}}>Google Lens</span>
        </div>
        <div style={{fontFamily: HI, fontWeight: 800, fontSize: 118, lineHeight: 1.12, color: '#fff', marginTop: 22, textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>
          AI ने कैसे
          <br />
          <span style={{color: '#FFD43B'}}>पहचाना?</span>
        </div>
        <div style={{fontFamily: HI, fontWeight: 700, fontSize: 34, color: 'rgba(255,255,255,0.9)', marginTop: 22}}>सिर्फ़ 1 Photo से 🤯</div>
      </div>
    </AbsoluteFill>
  );
};
