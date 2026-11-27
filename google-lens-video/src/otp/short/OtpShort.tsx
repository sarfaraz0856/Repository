import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/800.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {EIO, EO, ip} from '../../anim';
import {Phone} from '../../components/Phone';
import {OtpEntry, ScamPhone, SHOP} from '../full/screens';
import {CODE} from '../OtpSample';
import data from './timeline.json';

/** Vertical OTP Short (1080x1920). Dark graphite + neon look (matches the OTP thumbnails). */
type B = Record<string, number>;
const T = data as {fps: number; durationInFrames: number; cues: {id: string; from: number; dur: number}[]; beats: B};
const b = T.beats;
const NEON = '#39FF88', AMBER = '#FFC83D', RED = '#FF4D4D', VIOLET = '#9B7BFF', CYAN = '#38E1FF';
const HI = "'Noto Sans Devanagari', 'Inter', sans-serif", HEAD = "'Plus Jakarta Sans', 'Inter', sans-serif", UI = "'Inter', sans-serif";

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['800 20px "Plus Jakarta Sans"', '800 20px Inter', '600 20px Inter', '800 20px "Noto Sans Devanagari"'].map((x) => document.fonts.load(x, 'OTP कैसे 482913')))
      .finally(() => continueRender(h));
  }, [h]);
};
const vis = (f: number, a: number, z: number) => Math.min(ip(f, [a, a + 12], [0, 1], EO), ip(f, [z - 10, z], [1, 0], EIO));

/** top heading per section */
const Heading: React.FC<{f: number}> = ({f}) => {
  const H: [number, number, string, string, string][] = [
    [0, b.code - 6, 'ONLINE PAYMENT', 'OTP आया 📩', NEON],
    [b.code - 6, b.make - 4, '6-DIGIT CODE', 'सिर्फ़ कुछ minutes', NEON],
    [b.make - 4, b.route - 4, 'STEP 1', 'OTP कैसे बनता है?', VIOLET],
    [b.route - 4, b.check - 4, 'STEP 2', 'Phone तक कैसे आया?', CYAN],
    [b.check - 4, b.warn - 4, 'STEP 3', 'Bank कैसे check करता है?', NEON],
    [b.warn - 4, b.cta - 4, 'ध्यान दें ⚠️', 'OTP = सिर्फ़ आपका', AMBER],
    [b.cta - 4, T.durationInFrames + 20, 'FULL VIDEO', 'पूरा Process देखें 👇', NEON],
  ];
  return (
    <>
      {H.map(([a, z, k, t, c]) => {
        const o = vis(f, a, z);
        if (o <= 0.01) return null;
        return (
          <div key={k + t} style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * -20}px)`}}>
            <div style={{display: 'inline-block', padding: '8px 22px', borderRadius: 30, border: `3px solid ${c}`, color: c, fontFamily: HEAD, fontWeight: 800, fontSize: 34, letterSpacing: 4}}>{k}</div>
            <div style={{fontFamily: HI, fontWeight: 800, fontSize: 76, color: '#fff', marginTop: 18, textShadow: `0 0 30px ${c}55`}}>{t}</div>
          </div>
        );
      })}
    </>
  );
};

const Card: React.FC<{o: number; children: React.ReactNode; border?: string}> = ({o, children, border = 'rgba(255,255,255,0.12)'}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top: 1490, padding: '30px 34px', borderRadius: 34, background: 'rgba(20,26,38,0.92)', border: `3px solid ${border}`, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', opacity: o, transform: `translateY(${(1 - o) * 40}px)`, color: '#fff', fontFamily: UI}}>{children}</div>
);

const Bottom: React.FC<{f: number}> = ({f}) => {
  const tiles = (color: string, typed = 0) => (
    <div style={{display: 'flex', justifyContent: 'center', gap: 16}}>
      {CODE.split('').map((d, i) => <div key={i} style={{width: 118, height: 146, borderRadius: 22, border: `4px solid ${color}`, background: 'rgba(255,255,255,0.04)', boxShadow: `0 0 26px ${color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 92, opacity: i < typed || typed === 0 ? 1 : 0.35}}>{d}</div>)}
    </div>
  );
  const secs = Math.max(0, 300 - Math.floor(Math.max(0, f - b.timer) / 30));
  const settle = b.random + 30;
  const rolling = CODE.split('').map((d, i) => (f < settle + i * 4 ? String(Math.floor(Math.abs(Math.sin((f + i * 13) * 12.9898)) * 10) % 10) : d));
  const flow: [string, string, number][] = [['🖥️', 'Server', b.route], ['🔀', 'Gateway', b.gw], ['📡', 'Operator', b.op], ['📱', 'Phone', b.net + 10]];
  return (
    <>
      <Card o={vis(f, 6, b.sms)}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}><span style={{fontSize: 90}}>🛒</span>
          <div><div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 52}}>₹499 · {SHOP}</div><div style={{fontSize: 34, opacity: 0.75, marginTop: 6}}>Pay पर tap → OTP SMS</div></div></div>
      </Card>
      <Card o={vis(f, b.sms - 4, b.make - 4)} border={NEON}>
        {tiles(NEON)}
        <div style={{textAlign: 'center', marginTop: 22, fontFamily: HEAD, fontWeight: 800, fontSize: 46, color: AMBER, opacity: ip(f, [b.timer, b.timer + 10], [0, 1])}}>⏱ Valid for {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</div>
      </Card>
      <Card o={vis(f, b.make - 4, b.route - 4)} border={VIOLET}>
        <div style={{fontSize: 34, fontWeight: 800, color: VIOLET, letterSpacing: 2}}>🖥️ SERVER · Random Number Generator</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24}}>{rolling.map((d, i) => <div key={i} style={{width: 118, height: 140, borderRadius: 20, background: f >= settle + i * 4 ? '#4C1D95' : '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 84}}>{f >= b.random ? d : '–'}</div>)}</div>
      </Card>
      <Card o={vis(f, b.route - 4, b.check - 4)} border={CYAN}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          {flow.map(([e, t, at], i) => (
            <React.Fragment key={t}>
              {i > 0 && <span style={{fontSize: 50, color: f >= at ? CYAN : '#475569'}}>➜</span>}
              <div style={{textAlign: 'center', opacity: ip(f, [at - 6, at + 8], [0.3, 1])}}><div style={{fontSize: 82}}>{e}</div><div style={{fontSize: 30, fontWeight: 800, marginTop: 4}}>{t}</div></div>
            </React.Fragment>
          ))}
        </div>
      </Card>
      <Card o={vis(f, b.check - 4, b.warn - 4)} border={NEON}>
        {[['OTP सही है?', b.check + 10], ['Expire तो नहीं हुआ?', b.expire], ['पहले use तो नहीं हुआ?', b.used]].map(([t, at]) => (
          <div key={t as string} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '10px 0', opacity: ip(f, [(at as number) - 4, (at as number) + 8], [0, 1]), fontFamily: HI, fontWeight: 800, fontSize: 50}}>
            <span style={{width: 62, height: 62, borderRadius: 31, background: NEON, color: '#06280F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontSize: 38}}>✓</span>{t as string}
          </div>
        ))}
      </Card>
      <Card o={vis(f, b.warn - 4, b.share - 4)} border={AMBER}>
        <div style={{textAlign: 'center', fontFamily: HI, fontWeight: 800, fontSize: 62, lineHeight: 1.3}}>🏦 Bank <span style={{color: AMBER}}>कभी भी</span><br />OTP नहीं माँगता</div>
      </Card>
      <Card o={vis(f, b.share - 4, b.cta - 4)} border={RED}>
        <div style={{textAlign: 'center', fontFamily: HI, fontWeight: 800, fontSize: 62, lineHeight: 1.3}}>🔒 OTP किसी के साथ<br /><span style={{color: RED}}>SHARE मत करें</span></div>
      </Card>
      <Card o={vis(f, b.cta - 4, T.durationInFrames + 20)} border={NEON}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: HI, fontWeight: 800, fontSize: 52}}>OTP कैसे काम करता है – <span style={{color: NEON}}>Full Video</span></div>
          <div style={{display: 'inline-block', marginTop: 24, padding: '18px 48px', borderRadius: 50, background: RED, fontFamily: UI, fontWeight: 800, fontSize: 46, transform: `scale(${1 + 0.05 * Math.sin((f - b.cta) / 5)})`}}>🔔 Subscribe</div>
        </div>
      </Card>
    </>
  );
};

const Screen: React.FC<{f: number}> = ({f}) => {
  if (f >= b.warn - 4 && f < b.cta - 4) return <ScamPhone f={f} linkAt={1e9} simAt={1e9} />;
  const ok = f >= b.check - 4 ? b.ok : 1e9;
  return <OtpEntry f={f} smsAt={b.sms} typeAt={f >= b.check - 4 ? b.type : 1e9} okAt={ok} resendFrom={0} />;
};

export const OtpShort: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #1B2230 0%, #0B0E14 70%, #05070A 100%)'}}>
      <Audio src={staticFile('otp/short/short_soundtrack.wav')} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.14}}>
        {Array.from({length: 8}).map((_, i) => <path key={i} d={`M ${-60 + i * 160} 1920 L ${40 + i * 160} 1780 L ${40 + i * 160} 1700`} stroke={NEON} strokeWidth={3} fill="none" />)}
      </svg>
      <div style={{position: 'absolute', left: '50%', top: 900, width: 1000, height: 1000, marginLeft: -500, marginTop: -500, borderRadius: '50%', background: `radial-gradient(circle, ${NEON}22 0%, transparent 65%)`}} />
      <Heading f={f} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
        <Phone x={540 - 215} y={470} scale={1.3} screen={<Screen f={f} />} />
      </div>
      <Bottom f={f} />
      <AbsoluteFill style={{background: '#05070A', opacity: ip(f, [0, 8], [1, 0])}} />
      <AbsoluteFill style={{background: '#05070A', opacity: ip(f, [T.durationInFrames - 14, T.durationInFrames - 1], [0, 1])}} />
    </AbsoluteFill>
  );
};
