import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/600.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {EIO, ip} from '../../anim';
import {Phone} from '../../components/Phone';
import {Backdrop} from '../../upi/UPISample';
import {OtpPhone, Intro, CodeCard, Questions, Title} from '../OtpSample';
import {FT} from './tl';
import {SCENES} from './scenes';

const S1_END = 900;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '800 20px "Plus Jakarta Sans"', '600 20px "Noto Sans Devanagari"'].map((x) => document.fonts.load(x, 'OTP 482913 ₹499')))
      .finally(() => continueRender(h));
  }, [h]);
};

const sceneAt = (f: number) => FT.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);

const ScreenRouter: React.FC<{f: number}> = ({f}) => {
  const k = Math.max(0, sceneAt(f));
  const s = FT.scenes[k];
  const lf = f - s.from;
  const render = (idx: number, frame: number) => {
    const sc = FT.scenes[idx];
    if (sc.id === 's1') return <OtpPhone f={frame} />;
    const Sc = SCENES[sc.id].Screen;
    return <Sc f={frame - sc.from} />;
  };
  if (k > 0 && lf < 16) {
    return (
      <div style={{position: 'absolute', inset: 0}}>
        {render(k - 1, f)}
        <div style={{position: 'absolute', inset: 0, opacity: ip(lf, [0, 16], [0, 1], EIO)}}>{render(k, f)}</div>
      </div>
    );
  }
  return render(k, f);
};

export const OtpFull: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const total = FT.durationInFrames;
  const s1fade = ip(f, [S1_END - 14, S1_END + 4], [1, 0], EIO);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#F8FAFD'}}>
      <Audio src={staticFile('otp/full_soundtrack.wav')} />
      <Backdrop />
      <AbsoluteFill style={{opacity: ip(f, [0, 18], [0, 1])}}>
        <Phone x={540 - 215} y={100} scale={1.19} screen={<ScreenRouter f={f} />} />
      </AbsoluteFill>
      {f < S1_END + 6 && (
        <AbsoluteFill style={{opacity: s1fade}}>
          <Intro f={f} />
          <CodeCard f={f} />
          <Questions f={f} />
          <Title f={f} />
        </AbsoluteFill>
      )}
      {FT.scenes.map((s) => {
        if (s.id === 's1') return null;
        const lf = f - s.from;
        if (lf < 0 || lf >= s.dur) return null;
        const St = SCENES[s.id].Stage;
        return <AbsoluteFill key={s.id}><St f={lf} /></AbsoluteFill>;
      })}
      <AbsoluteFill style={{background: '#F8FAFD', opacity: ip(f, [0, 10], [1, 0])}} />
      <AbsoluteFill style={{background: '#05070C', opacity: ip(f, [total - 40, total - 1], [0, 1], EIO)}} />
    </AbsoluteFill>
  );
};
