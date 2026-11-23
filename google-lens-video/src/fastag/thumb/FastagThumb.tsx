import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/700.css';
import '@fontsource/noto-sans-devanagari/800.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {U, UF} from '../../upi/theme';
import {Car} from '../FastagSample';
import {Sticker} from '../full/art';

type V = 'A' | 'B' | 'C';
const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['800 20px "Plus Jakarta Sans"', '800 20px Inter', '600 20px Inter', '800 20px "Noto Sans Devanagari"', '700 20px "Noto Sans Devanagari"']
      .map((x) => document.fonts.load(x, 'FASTag कैसे काम करता है ₹95')))
      .finally(() => continueRender(h));
  }, [h]);
};
const shadow = '0 6px 0 rgba(0,0,0,0.35), 0 12px 40px rgba(0,0,0,0.5)';
const Chip: React.FC<{children: React.ReactNode; bg: string}> = ({children, bg}) => (
  <span style={{fontFamily: UF.head, fontWeight: 800, fontSize: 28, color: '#fff', background: bg, padding: '10px 18px', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>{children}</span>
);

/** toll gantry + barrier + car, drawn for the 1280x720 canvas */
const Toll: React.FC<{x: number}> = ({x}) => (
  <>
    <div style={{position: 'absolute', left: x, top: 470, width: 560, height: 70, background: 'linear-gradient(180deg,#64748B,#475569)', borderRadius: 10}} />
    <div style={{position: 'absolute', left: x + 220, top: 150, width: 300, height: 58, borderRadius: 12, background: '#1D4ED8', color: '#fff', fontFamily: UF.head, fontWeight: 800, fontSize: 26, letterSpacing: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>TOLL <span style={{fontSize: 15, padding: '4px 8px', borderRadius: 8, background: U.green}}>FASTag</span></div>
    {[x + 236, x + 488].map((px) => <div key={px} style={{position: 'absolute', left: px, top: 208, width: 16, height: 262, background: '#CBD5E1'}} />)}
    <div style={{position: 'absolute', left: x + 346, top: 210, width: 50, height: 28, borderRadius: 8, background: '#0F172A', border: `3px solid ${U.cyan}`, boxShadow: `0 0 26px ${U.cyan}`}} />
    {[0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', left: x + 371 - 40 - k * 36, top: 250 + k * 30, width: 80 + k * 72, height: 40 + k * 36, borderRadius: '50%', borderBottom: `5px solid ${U.cyan}`, opacity: 0.9 - k * 0.25}} />)}
    <div style={{position: 'absolute', left: x + 520, top: 400, width: 24, height: 70, borderRadius: 6, background: '#1E293B'}} />
    <div style={{position: 'absolute', left: x + 532 - 160, top: 404, width: 160, height: 12, borderRadius: 6, backgroundImage: 'repeating-linear-gradient(90deg,#EF4444 0 22px,#fff 22px 44px)', transformOrigin: '100% 50%', transform: 'rotate(72deg)'}} />
    <div style={{position: 'absolute', left: 0, top: 0, transform: 'scale(1.05)', transformOrigin: `${x + 200}px 470px`}}><Car x={x + 60} y={318} f={0} tagGlow={1} /></div>
  </>
);

export const FastagThumb: React.FC<{v: V}> = ({v}) => {
  useFonts();
  const head = {
    A: <>FASTag कैसे<br /><span style={{color: '#FFD43B'}}>काम करता है?</span></>,
    B: <>बिना रुके Toll<br /><span style={{color: '#FFD43B'}}>कैसे कटा?</span></>,
    C: <>इस Sticker में<br /><span style={{color: '#FFD43B'}}>क्या छुपा है?</span></>,
  }[v];
  const bottom = {
    A: 'RFID · NETC · Bank – पूरी जानकारी हिंदी में',
    B: 'Toll Plaza → NPCI → Bank · Behind the Scenes',
    C: 'बिना Battery के कैसे चलता है FASTag?',
  }[v];
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(ellipse 90% 120% at 78% 50%, #1F4FB8 0%, #0E2A6B 45%, #070F2A 100%)'}}>
      {[[1060, 110, U.saffron], [1180, 650, U.green], [700, 720, U.cyan], [120, 60, U.blue]].map(([x, y, c], i) => (
        <div key={i} style={{position: 'absolute', left: (x as number) - 260, top: (y as number) - 260, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 65%)`, opacity: 0.3}} />
      ))}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1.4px, transparent 1.5px)', backgroundSize: '26px 26px', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 40%, #000 100%)'}} />

      {v === 'A' && <Toll x={700} />}
      {v === 'B' && (
        <>
          <Toll x={740} />
          <div style={{position: 'absolute', left: 760, top: 540, width: 480, padding: '16px 20px', borderRadius: 22, background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', transform: 'rotate(-3deg)', fontFamily: UF.ui}}>
            <div style={{fontSize: 16, color: U.sub, fontWeight: 700}}>✉ SMS · now</div>
            <div style={{fontSize: 30, fontWeight: 800, color: '#C81E1E', marginTop: 4}}>₹95 debited</div>
            <div style={{fontSize: 17, color: U.ink}}>FASTag toll · Demo Toll Plaza</div>
          </div>
        </>
      )}
      {v === 'C' && (
        <>
          <div style={{position: 'absolute', left: 760, top: 150, transform: 'rotate(-4deg) scale(1.0)'}}><Sticker w={470} cut={1} chipGlow={1} /></div>
          <div style={{position: 'absolute', left: 960, top: 470, padding: '12px 20px', borderRadius: 16, background: U.red, color: '#fff', fontFamily: UF.head, fontWeight: 800, fontSize: 30, whiteSpace: 'nowrap', boxShadow: '0 14px 34px rgba(0,0,0,0.45)', transform: 'rotate(4deg)'}}>🔋✕ NO BATTERY</div>
          <div style={{position: 'absolute', left: 790, top: 520, padding: '10px 18px', borderRadius: 14, background: U.cyan, color: '#04263A', fontFamily: UF.head, fontWeight: 800, fontSize: 26, boxShadow: '0 14px 34px rgba(0,0,0,0.45)'}}>RFID CHIP</div>
        </>
      )}

      <div style={{position: 'absolute', left: 56, top: 66, width: 700}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 22px 10px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
          <span style={{width: 44, height: 44, borderRadius: 22, background: `linear-gradient(135deg, ${U.blue}, ${U.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: UF.head, fontWeight: 800, fontSize: 16}}>TAG</span>
          <span style={{fontFamily: UF.head, fontWeight: 800, fontSize: 32, color: U.ink, letterSpacing: -0.5}}>FASTag Explained</span>
        </div>
        <div style={{fontFamily: UF.hi, fontWeight: 800, fontSize: 92, lineHeight: 1.2, color: '#FFFFFF', marginTop: 26, textShadow: shadow, whiteSpace: 'nowrap'}}>{head}</div>
        <div style={{display: 'flex', gap: 14, marginTop: 28}}>
          <Chip bg={U.blue}>RFID</Chip>
          <Chip bg={U.saffron}>NETC</Chip>
          <Chip bg={U.green}>NO STOP ✓</Chip>
        </div>
      </div>
      <div style={{position: 'absolute', left: 56, bottom: 40, fontFamily: UF.hi, fontWeight: 700, fontSize: 28, color: 'rgba(255,255,255,0.92)'}}>{bottom}</div>
    </AbsoluteFill>
  );
};

export const FastagThumbA: React.FC = () => <FastagThumb v="A" />;
export const FastagThumbB: React.FC = () => <FastagThumb v="B" />;
export const FastagThumbC: React.FC = () => <FastagThumb v="C" />;
