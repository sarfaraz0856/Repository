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

const HI = "'Noto Sans Devanagari', 'Inter', sans-serif";

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['800 20px "Plus Jakarta Sans"', '800 20px Inter', '600 20px Inter', '800 20px "Noto Sans Devanagari"'].map((x) => document.fonts.load(x, 'कैसे काम करता है Google Lens')))
      .finally(() => continueRender(h));
  }, [h]);
};

const Screen: React.FC = () => {
  const B = BOXES.sneaker;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', fontFamily: FONT_UI}}>
      <Subject kind="sneaker" />
      <Sparks pts={ptsIn(B, 16, 4)} f={200} a={0} />
      <Brackets box={{x: B.x - 10, y: B.y - 12, w: B.w + 20, h: B.h + 24}} t={1} op={1} />
      <Outline box={B} draw={1} f={0} />
      <ScreenChip cx={201} y={B.y - 58} t={1}>
        Sneaker <span style={{color: C.faint}}>·</span> <span style={{color: C.blue}}>98% match</span>
      </ScreenChip>
      <ChromeShade />
      <LensTop />
      <LensBottom />
    </div>
  );
};

export const Thumbnail: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(ellipse 90% 120% at 78% 50%, #1F4FB8 0%, #0E2A6B 45%, #070F2A 100%)'}}>
      {/* soft colour glows */}
      {[[1040, 120, C.green], [1180, 640, C.yellow], [760, 700, C.red], [120, 60, C.blue]].map(([x, y, c], i) => (
        <div key={i} style={{position: 'absolute', left: (x as number) - 260, top: (y as number) - 260, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 65%)`, opacity: 0.28}} />
      ))}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1.4px, transparent 1.5px)', backgroundSize: '26px 26px', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 40%, #000 100%)'}} />

      {/* phone */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720}}>
        <div style={{position: 'absolute', left: 980 - 960, top: 380 - 540, width: 1920, height: 1080, transform: 'scale(0.80) rotate(-7deg)', transformOrigin: '960px 540px'}}>
          <Phone screen={<Screen />} />
        </div>
      </div>

      {/* floating result card */}
      <div style={{position: 'absolute', left: 1010, top: 470, width: 250, padding: 14, borderRadius: 22, background: 'rgba(255,255,255,0.96)', boxShadow: '0 20px 50px rgba(0,0,0,0.45)', transform: 'rotate(4deg)', fontFamily: FONT_UI}}>
        <div style={{height: 110, borderRadius: 14, background: 'linear-gradient(160deg,#F4F6FA,#E3E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Sneaker id="th1" width={190} palette={PALETTES.sky} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
          <span style={{fontSize: 22, fontWeight: 800, color: C.ink}}>Similar match</span>
          <span style={{fontSize: 18, fontWeight: 800, color: '#fff', background: C.green, padding: '3px 10px', borderRadius: 10}}>94%</span>
        </div>
      </div>

      {/* headline */}
      <div style={{position: 'absolute', left: 56, top: 70, width: 690}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 20px 10px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
          <LensGlyph size={44} />
          <span style={{fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 34, color: C.ink, letterSpacing: -0.5}}>Google Lens</span>
        </div>
        <div style={{fontFamily: HI, fontWeight: 800, fontSize: 104, lineHeight: 1.18, color: '#FFFFFF', marginTop: 26, textShadow: '0 6px 0 rgba(0,0,0,0.35), 0 12px 40px rgba(0,0,0,0.5)'}}>
          कैसे काम
          <br />
          <span style={{color: '#FFD43B'}}>करता है?</span>
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 30}}>
          {[['SCAN', C.blue], ['SEARCH', C.red], ['DISCOVER', C.green]].map(([t, c]) => (
            <span key={t} style={{fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 30, color: '#fff', background: c, padding: '10px 18px', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>{t}</span>
          ))}
        </div>
      </div>
      {/* bottom strip */}
      <div style={{position: 'absolute', left: 56, bottom: 40, fontFamily: HI, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.92)'}}>
        AI Visual Search · पूरी जानकारी हिंदी में
      </div>
    </AbsoluteFill>
  );
};
