import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/800.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';

/** OTP thumbnails – deliberately a different look from the UPI / FASTag thumbnails:
 *  dark graphite background, neon digit tiles, centred composition. */
type V = 'A' | 'B' | 'C' | 'EN';
const NEON = '#39FF88', AMBER = '#FFC83D', RED = '#FF4D4D', VIOLET = '#9B7BFF';
const HI = "'Noto Sans Devanagari', 'Inter', sans-serif", HEAD = "'Plus Jakarta Sans', 'Inter', sans-serif";

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['800 20px "Plus Jakarta Sans"', '800 20px Inter', '700 20px Inter', '800 20px "Noto Sans Devanagari"']
      .map((x) => document.fonts.load(x, 'OTP कैसे 482913')))
      .finally(() => continueRender(h));
  }, [h]);
};

const Digits: React.FC<{color: string; size?: number; y: number; code?: string}> = ({color, size = 118, y, code = '482913'}) => (
  <div style={{position: 'absolute', top: y, width: '100%', display: 'flex', justifyContent: 'center', gap: size * 0.16}}>
    {code.split('').map((d, i) => (
      <div key={i} style={{width: size * 0.82, height: size, borderRadius: size * 0.16, background: 'rgba(255,255,255,0.04)', border: `4px solid ${color}`, boxShadow: `0 0 28px ${color}88, inset 0 0 22px ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: size * 0.66, color: '#fff', textShadow: `0 0 18px ${color}`}}>{d}</div>
    ))}
  </div>
);

export const OtpThumb: React.FC<{v: V}> = ({v}) => {
  useFonts();
  const accent = v === 'B' ? AMBER : v === 'C' ? VIOLET : NEON;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(ellipse 80% 90% at 50% 40%, #1B2230 0%, #0B0E14 70%, #05070A 100%)'}}>
      {/* subtle circuit lines */}
      <svg width={1280} height={720} style={{position: 'absolute', inset: 0, opacity: 0.18}}>
        {Array.from({length: 9}).map((_, i) => <path key={i} d={`M ${-40 + i * 160} 720 L ${60 + i * 160} 600 L ${60 + i * 160} 520`} stroke={accent} strokeWidth={2} fill="none" />)}
        {Array.from({length: 9}).map((_, i) => <circle key={i} cx={60 + i * 160} cy={520} r={5} fill={accent} />)}
      </svg>
      <div style={{position: 'absolute', left: '50%', top: 300, width: 900, height: 300, marginLeft: -450, borderRadius: '50%', background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`}} />

      {v === 'B' && (
        <>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 26, backgroundImage: `repeating-linear-gradient(-45deg, ${AMBER} 0 30px, #111 30px 60px)`}} />
          <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 26, backgroundImage: `repeating-linear-gradient(-45deg, ${AMBER} 0 30px, #111 30px 60px)`}} />
        </>
      )}

      {/* headline */}
      <div style={{position: 'absolute', top: v === 'C' ? 40 : 56, width: '100%', textAlign: 'center', fontFamily: v === 'EN' ? HEAD : HI, fontWeight: 800, fontSize: v === 'EN' ? 96 : 92, lineHeight: 1.1, color: '#fff', letterSpacing: v === 'EN' ? -1 : 0, textShadow: '0 8px 30px rgba(0,0,0,0.7)'}}>
        {v === 'A' && <>OTP <span style={{color: NEON}}>कैसे काम</span> करता है?</>}
        {v === 'B' && <><span style={{color: AMBER}}>OTP Fraud</span> से कैसे बचें?</>}
        {v === 'C' && <>6 Digit का Code<br /><span style={{color: VIOLET}}>कहाँ से आता है?</span></>}
        {v === 'EN' && <>How <span style={{color: NEON}}>OTP</span> Really Works</>}
      </div>

      {v !== 'C' && <Digits color={accent} y={v === 'B' ? 250 : 245} code={v === 'B' ? '••••••' : '482913'} />}
      {v === 'B' && (
        <div style={{position: 'absolute', top: 420, width: '100%', display: 'flex', justifyContent: 'center', gap: 22, fontFamily: "'Inter', sans-serif"}}>
          {['📞 Fake call', '🔗 Fake link', '📶 SIM swap'].map((t) => <span key={t} style={{padding: '14px 26px', borderRadius: 18, background: 'rgba(255,77,77,0.14)', border: `3px solid ${RED}`, color: '#fff', fontWeight: 800, fontSize: 34}}>{t}</span>)}
        </div>
      )}
      {v === 'C' && (
        <div style={{position: 'absolute', top: 300, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: "'Inter', sans-serif"}}>
          {[['🖥️', 'Server'], ['📡', 'Network'], ['📱', 'Phone']].map(([e, t], i) => (
            <React.Fragment key={t}>
              {i > 0 && <span style={{fontSize: 70, color: VIOLET, textShadow: `0 0 20px ${VIOLET}`}}>➜</span>}
              <div style={{width: 230, padding: '22px 0', borderRadius: 26, background: 'rgba(255,255,255,0.05)', border: `3px solid ${VIOLET}`, boxShadow: `0 0 30px ${VIOLET}55`, textAlign: 'center'}}>
                <div style={{fontSize: 80}}>{e}</div><div style={{fontSize: 32, fontWeight: 800, color: '#fff', marginTop: 6}}>{t}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* bottom line */}
      <div style={{position: 'absolute', bottom: v === 'B' ? 58 : 46, width: '100%', textAlign: 'center', fontFamily: v === 'EN' ? "'Inter', sans-serif" : HI, fontWeight: 800, fontSize: 36, color: v === 'B' ? AMBER : 'rgba(255,255,255,0.92)'}}>
        {v === 'A' && <>SMS → Server → Verify · <span style={{color: NEON}}>पूरी जानकारी हिंदी में</span></>}
        {v === 'B' && <>Bank कभी OTP नहीं माँगता ⚠️</>}
        {v === 'C' && <>Random Number · Hash · TOTP</>}
        {v === 'EN' && <>From server to your phone · explained</>}
      </div>
    </AbsoluteFill>
  );
};

export const OtpThumbA: React.FC = () => <OtpThumb v="A" />;
export const OtpThumbB: React.FC = () => <OtpThumb v="B" />;
export const OtpThumbC: React.FC = () => <OtpThumb v="C" />;
export const OtpThumbEN: React.FC = () => <OtpThumb v="EN" />;
