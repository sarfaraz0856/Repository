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
import {Network, PacketsOut, Shop, Subtitles, Title} from './stage';
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

const Backdrop: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 80% at 30% 50%, #0F2547 0%, ${U.navy} 60%), ${U.navy}`}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(49,133,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(49,133,255,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px'}} />
    <div style={{position: 'absolute', left: 1180, top: 160, width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${U.blue}33 0%, transparent 65%)`}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)'}} />
  </AbsoluteFill>
);

export const UPISample: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const enter = ip(f, [0, 18], [0, 1]);
  const fadeOut = ip(f, [UT.durationInFrames - 16, UT.durationInFrames - 1], [0, 1], EIO);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: U.navy}}>
      <Audio src={staticFile('upi/sample_soundtrack.wav')} />
      <Backdrop />
      <AbsoluteFill style={{opacity: enter}}>
        <Phone x={PHONE_CX - 215} y={100} scale={PHONE_SCALE} screen={<UPIScreen f={f} />} />
      </AbsoluteFill>
      <Shop f={f} />
      <PacketsOut f={f} />
      <Network f={f} />
      <Title f={f} />
      <Subtitles f={f} />
      <AbsoluteFill style={{background: '#000', opacity: ip(f, [0, 10], [1, 0]) + fadeOut * 0.6}} />
    </AbsoluteFill>
  );
};
