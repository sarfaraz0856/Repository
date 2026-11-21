import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/700.css';
import '@fontsource/noto-sans-devanagari/800.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {Phone} from '../../components/Phone';
import {DemoQR} from '../QR';
import {StatusScreen, Scanner} from '../full/screens';
import {U, UF} from '../theme';

type V = 'A' | 'B' | 'C' | 'EN';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['800 20px "Plus Jakarta Sans"', '800 20px Inter', '600 20px Inter', '800 20px "Noto Sans Devanagari"', '700 20px "Noto Sans Devanagari"']
      .map((x) => document.fonts.load(x, 'UPI कैसे काम करता है ₹100')))
      .finally(() => continueRender(h));
  }, [h]);
};

const shadow = '0 6px 0 rgba(0,0,0,0.35), 0 12px 40px rgba(0,0,0,0.5)';

const Chip: React.FC<{children: React.ReactNode; bg: string; size?: number}> = ({children, bg, size = 30}) => (
  <span style={{fontFamily: UF.head, fontWeight: 800, fontSize: size, color: '#fff', background: bg, padding: '10px 18px', borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>{children}</span>
);

const Node: React.FC<{x: number; y: number; label: string; c: string; icon: string}> = ({x, y, label, c, icon}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 132, padding: '12px 8px', borderRadius: 18, background: 'rgba(255,255,255,0.96)', boxShadow: '0 14px 34px rgba(0,0,0,0.4)', textAlign: 'center', fontFamily: UF.ui}}>
    <div style={{width: 46, height: 46, margin: '0 auto', borderRadius: 14, background: c, color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
    <div style={{marginTop: 8, fontSize: 20, fontWeight: 800, color: U.ink}}>{label}</div>
  </div>
);

export const UPIThumb: React.FC<{v: V}> = ({v}) => {
  useFonts();
  const en = v === 'EN';
  const head: React.ReactNode = {
    A: <>UPI कैसे काम<br /><span style={{color: '#FFD43B'}}>करता है?</span></>,
    B: <>₹100 सिर्फ़<br /><span style={{color: '#FFD43B'}}>2 Second में?</span></>,
    C: <>QR Scan के पीछे<br /><span style={{color: '#FFD43B'}}>क्या होता है?</span></>,
    EN: <>How UPI<br /><span style={{color: '#FFD43B'}}>Really Works</span></>,
  }[v];
  const bottom = {
    A: 'QR Scan से Bank तक · पूरी जानकारी हिंदी में',
    B: 'पैसा इतनी Fast कैसे पहुँचता है? · Behind the Scenes',
    C: 'Phone → NPCI → Bank · पूरा सफ़र',
    EN: 'From QR Scan to Bank Account · Explained',
  }[v];
  const scanScreen = v === 'C';
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(ellipse 90% 120% at 78% 50%, #1F4FB8 0%, #0E2A6B 45%, #070F2A 100%)'}}>
      {[[1060, 110, U.saffron], [1180, 650, U.green], [700, 720, U.cyan], [120, 60, U.blue]].map(([x, y, c], i) => (
        <div key={i} style={{position: 'absolute', left: (x as number) - 260, top: (y as number) - 260, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 65%)`, opacity: 0.3}} />
      ))}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1.4px, transparent 1.5px)', backgroundSize: '26px 26px', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 40%, #000 100%)'}} />

      {/* network flow behind the phone (B, C) */}
      {(v === 'B' || v === 'C') && (
        <>
          <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
            <path d="M 840 200 C 950 120, 1080 120, 1150 190" stroke="#FFD43B" strokeWidth={6} fill="none" strokeDasharray="14 12" />
            <path d="M 1150 330 C 1180 430, 1160 520, 1130 590" stroke="#FFD43B" strokeWidth={6} fill="none" strokeDasharray="14 12" />
          </svg>
          <Node x={v === 'C' ? 1128 : 1090} y={190} label="NPCI" c={U.saffron} icon="⇄" />
          <Node x={v === 'C' ? 1128 : 1060} y={560} label="Bank" c={U.green} icon="🏦" />
        </>
      )}

      {/* phone */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720}}>
        <div style={{position: 'absolute', left: (v === 'A' || en ? 990 : v === 'C' ? 940 : 905) - 960, top: 385 - 540, width: 1920, height: 1080, transform: `scale(0.80) rotate(${v === 'A' || en ? -7 : -4}deg)`, transformOrigin: '960px 540px'}}>
          <Phone screen={scanScreen ? <Scanner f={200} det={0} /> : <StatusScreen f={100} a={0} kind="success" sub="Paid in seconds" />} />
        </div>
      </div>

      {/* QR card (A, EN) */}
      {(v === 'A' || en) && (
        <div style={{position: 'absolute', left: 1030, top: 440, padding: 14, borderRadius: 22, background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.45)', transform: 'rotate(5deg)'}}>
          <DemoQR size={170} seed={7} />
        </div>
      )}
      {/* speed badge (B) */}
      {v === 'B' && (
        <div style={{position: 'absolute', left: 1040, top: 395, padding: '12px 20px', borderRadius: 18, background: U.green, color: '#fff', fontFamily: UF.head, fontWeight: 800, fontSize: 34, boxShadow: '0 14px 34px rgba(0,0,0,0.45)', transform: 'rotate(4deg)'}}>⚡ PAID</div>
      )}

      {/* headline */}
      <div style={{position: 'absolute', left: 56, top: 66, width: 720}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 22px 10px 12px', borderRadius: 40, background: 'rgba(255,255,255,0.95)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
          <span style={{width: 44, height: 44, borderRadius: 22, background: `linear-gradient(135deg, ${U.saffron}, ${U.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: UF.head, fontWeight: 800, fontSize: 24}}>₹</span>
          <span style={{fontFamily: UF.head, fontWeight: 800, fontSize: 32, color: U.ink, letterSpacing: -0.5}}>{en ? 'UPI Explained' : 'UPI Payment'}</span>
        </div>
        <div style={{fontFamily: en ? UF.head : UF.hi, fontWeight: 800, fontSize: en ? 112 : v === 'C' ? 86 : 100, lineHeight: en ? 1.05 : 1.2, letterSpacing: en ? -2 : 0, color: '#FFFFFF', marginTop: 26, textShadow: shadow}}>{head}</div>
        <div style={{display: 'flex', gap: 14, marginTop: 30}}>
          <Chip bg={U.blue}>SCAN</Chip>
          <Chip bg={U.saffron}>PIN</Chip>
          <Chip bg={U.green}>PAID ✓</Chip>
        </div>
      </div>
      <div style={{position: 'absolute', left: 56, bottom: 40, fontFamily: en ? UF.ui : UF.hi, fontWeight: 700, fontSize: 29, color: 'rgba(255,255,255,0.92)'}}>{bottom}</div>
    </AbsoluteFill>
  );
};

export const UPIThumbA: React.FC = () => <UPIThumb v="A" />;
export const UPIThumbB: React.FC = () => <UPIThumb v="B" />;
export const UPIThumbC: React.FC = () => <UPIThumb v="C" />;
export const UPIThumbEN: React.FC = () => <UPIThumb v="EN" />;
