import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/600.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {EIO, ip} from '../anim';
import {Phone} from '../components/Phone';
import {U} from './theme';
import {UPIScreen} from './screens';
import {Network, PacketsOut, Shop, Title} from './stage';
import {UT} from './timeline';

const PHONE_SCALE = 1.19; // same enlarged phone as the 6-minute Google Lens video
const PHONE_CX = 540;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '800 20px "Plus Jakarta Sans"', '600 20px "Noto Sans Devanagari"'].map((x) => document.fonts.load(x, 'कल्पना कीजिए UPI ₹100')))
      .finally(() => continueRender(h));
  }, [h]);
};

/** Same backdrop as the Google Lens documentary: soft light gradient, four gentle colour glows, dot grid */
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(135deg, #F8FAFD 0%, #EEF2F9 48%, #F5F2FA 100%)'}}>
    {[[260, 180, 900, '#4285F4'], [1700, 240, 760, '#34A853'], [1600, 940, 820, '#FBBC05'], [360, 980, 760, '#EA4335']].map(([x, y, s, c], i) => (
      <div key={i} style={{position: 'absolute', left: (x as number) - (s as number) / 2, top: (y as number) - (s as number) / 2, width: s as number, height: s as number, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: 0.2}} />
    ))}
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(60,80,120,0.16) 1.3px, transparent 1.4px)', backgroundSize: '32px 32px', WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, #000 0%, transparent 85%)', opacity: 0.5}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(40,55,90,0.10) 100%)'}} />
  </AbsoluteFill>
);

export const UPISample: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const enter = ip(f, [0, 18], [0, 1]);
  const fadeOut = ip(f, [UT.durationInFrames - 16, UT.durationInFrames - 1], [0, 1], EIO);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#F8FAFD'}}>
      <Audio src={staticFile('upi/sample_soundtrack.wav')} />
      <Backdrop />
      <AbsoluteFill style={{opacity: enter}}>
        <Phone x={PHONE_CX - 215} y={100} scale={PHONE_SCALE} screen={<UPIScreen f={f} />} />
      </AbsoluteFill>
      <Shop f={f} />
      <PacketsOut f={f} />
      <Network f={f} />
      <Title f={f} />
      <AbsoluteFill style={{background: '#F8FAFD', opacity: ip(f, [0, 10], [1, 0])}} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut * 0.6}} />
    </AbsoluteFill>
  );
};
