import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {EIO, ip, EO} from './anim';
import {T} from './theme';
import {Background} from './components/Background';
import {Phone} from './components/Phone';
import {Captions} from './components/Captions';
import {ScanPanel} from './components/ScanPanel';
import {AINetwork} from './components/AINetwork';
import {ResultsPanel} from './components/ResultsPanel';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const families = ['400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '800 20px "Plus Jakarta Sans"', '700 20px "Plus Jakarta Sans"'];
    Promise.all(families.map((ff) => document.fonts.load(ff)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const GoogleLensDemo: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();

  // Intro: phone glides in with a smooth zoom
  const phoneIn = ip(f, [0, 34], [0, 1], EO);
  const phoneScale = 0.78 + 0.22 * phoneIn;
  const phoneY = (1 - phoneIn) * 70;
  const phoneBlur = (1 - ip(f, [0, 22], [0, 1])) * 10;

  // Final: gentle cinematic push-in + fade-out
  const push = 1 + 0.03 * ip(f, [T.finalStart - 10, 450], [0, 1], EIO);
  const fadeOut = ip(f, [T.fadeStart, 449], [0, 1], EIO);
  const fadeIn = ip(f, [0, 12], [1, 0]);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background />
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 50%'}}>
        <AbsoluteFill
          style={{
            transform: `translateY(${phoneY}px) scale(${phoneScale})`,
            transformOrigin: '960px 540px',
            opacity: phoneIn,
            filter: phoneBlur > 0.1 ? `blur(${phoneBlur}px)` : undefined,
          }}
        >
          <Phone />
        </AbsoluteFill>
        <ScanPanel />
        <AINetwork />
        <ResultsPanel />
        <Captions />
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#F8FAFD', opacity: fadeIn}} />
      <AbsoluteFill style={{background: '#05070C', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
