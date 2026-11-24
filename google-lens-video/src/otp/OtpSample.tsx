import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/600.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {EIO, EO, ip} from '../anim';
import {Phone} from '../components/Phone';
import {Backdrop} from '../upi/UPISample';
import {GLASS, U, UF, deep} from '../upi/theme';
import {Bar, Tap} from '../upi/full/screens';
import {Icon} from '../upi/full/kit';
import {OB, OTL} from './timeline';

export const CODE = '482913';            // illustrative OTP
const SW = 402;

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '800 20px "Plus Jakarta Sans"', '600 20px "Noto Sans Devanagari"']
      .map((x) => document.fonts.load(x, 'OTP 482913 ₹499')))
      .finally(() => continueRender(h));
  }, [h]);
};

export const SmsText: React.FC<{size?: number; codeHi?: number}> = ({size = 16, codeHi = 0}) => (
  <span style={{fontSize: size, lineHeight: 1.45, color: U.ink}}>
    <b style={{background: `rgba(49,133,255,${0.18 * codeHi})`, color: codeHi > 0.5 ? deep(U.blue) : U.ink, borderRadius: 6, padding: '0 3px', letterSpacing: 1}}>{CODE}</b> is your OTP for ₹499 at Demo Store. Valid for 5 minutes. Do not share it with anyone. – Demo Bank
  </span>
);

// ------------------------------------------------------------------ phone
export const OtpPhone: React.FC<{f: number}> = ({f}) => {
  const banner = ip(f, [OB.sms, OB.sms + 14], [0, 1], EO) * ip(f, [OB.type + 10, OB.type + 24], [1, 0]);
  const typed = OB.digits.filter((d) => f >= d).length;
  const verifying = f >= OB.verify && f < OB.success;
  const ok = ip(f, [OB.success, OB.success + 14], [0, 1], EO);
  const resend = Math.max(0, 30 - Math.floor(Math.max(0, f - OB.otpScreen) / 30));
  if (f < OB.otpScreen) {
    return (
      <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
        <Bar dark />
        <div style={{position: 'absolute', top: 62, left: 22, fontSize: 20, fontWeight: 800, color: U.ink}}>Checkout</div>
        <div style={{position: 'absolute', top: 92, left: 22, fontSize: 13, color: U.sub}}>Demo Store · illustrative</div>
        <div style={{position: 'absolute', top: 130, left: 18, right: 18, padding: 18, borderRadius: 22, background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.08)', display: 'flex', gap: 16, alignItems: 'center'}}>
          <div style={{width: 84, height: 84, borderRadius: 18, background: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44}}>🎧</div>
          <div><div style={{fontSize: 18, fontWeight: 800, color: U.ink}}>Wireless Earbuds</div><div style={{fontSize: 14, color: U.sub, marginTop: 4}}>Qty 1</div><div style={{fontSize: 22, fontWeight: 800, color: U.ink, marginTop: 6}}>₹499</div></div>
        </div>
        <div style={{position: 'absolute', top: 270, left: 18, right: 18, padding: 18, borderRadius: 20, background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.08)'}}>
          {[['Card', '•••• 4321'], ['Amount', '₹499']].map(([a, b]) => <div key={a} style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 16}}><span style={{color: U.sub}}>{a}</span><b style={{color: U.ink}}>{b}</b></div>)}
        </div>
        <div style={{position: 'absolute', top: 720, left: 18, right: 18, padding: '18px 0', borderRadius: 18, background: U.blue, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 21}}>Pay ₹499</div>
        <Tap x={201} y={750} f={f} at={OB.tap} />
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center'}}>
        <div style={{width: 70, height: 70, margin: '0 auto', borderRadius: 22, background: `linear-gradient(135deg, ${U.blue}, #7C5CFF)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="lock" s={38} /></div>
        <div style={{fontSize: 24, fontWeight: 800, color: U.ink, marginTop: 18}}>Enter OTP</div>
        <div style={{fontSize: 15, color: U.sub, marginTop: 6}}>Sent to +91 XXXXX X1234</div>
      </div>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 9}}>
        {CODE.split('').map((d, i) => {
          const on = i < typed, cur = i === typed && !verifying && ok === 0;
          return <div key={i} style={{width: 50, height: 62, borderRadius: 14, background: '#fff', border: `2px solid ${on ? U.blue : cur ? U.cyan : 'rgba(15,23,42,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: U.ink, boxShadow: on ? `0 6px 16px ${U.blue}33` : undefined}}>{on ? d : ''}</div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontSize: 15, color: U.sub}}>Resend OTP in 0:{String(resend).padStart(2, '0')}</div>
      {verifying && <div style={{position: 'absolute', top: 480, width: '100%', textAlign: 'center', fontSize: 17, fontWeight: 700, color: U.blue}}>Verifying…</div>}
      {/* SMS banner */}
      <div style={{position: 'absolute', top: 14, left: 12, right: 12, padding: '14px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.98)', boxShadow: '0 14px 34px rgba(0,0,0,0.22)', opacity: banner, transform: `translateY(${(1 - banner) * -60}px)`, zIndex: 9}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: U.sub}}>
          <span style={{width: 24, height: 24, borderRadius: 7, background: U.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13}}>✉</span>
          <b style={{color: U.ink}}>MESSAGES</b><span style={{marginLeft: 'auto'}}>now</span>
        </div>
        <div style={{marginTop: 8}}><SmsText size={15} codeHi={ip(f, [OB.code, OB.code + 10], [0, 1])} /></div>
      </div>
      {ok > 0.01 && (
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg,#16A34A,${U.green})`, color: '#fff', opacity: ok, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 220}}>
          <div style={{width: 110, height: 110, borderRadius: 55, background: '#fff', color: U.green, fontSize: 60, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.7 + 0.3 * ok})`}}>✓</div>
          <div style={{fontSize: 26, fontWeight: 800, marginTop: 30}}>Payment Successful</div>
          <div style={{fontSize: 56, fontWeight: 800, marginTop: 8}}>₹499</div>
          <div style={{fontSize: 15, opacity: 0.9, marginTop: 10}}>Demo Store · illustrative</div>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ stage: online payment intro
export const Intro: React.FC<{f: number}> = ({f}) => {
  const a = ip(f, [4, 24], [0, 1], EO), out = ip(f, [OB.sms - 8, OB.sms + 6], [1, 0], EIO);
  if (out <= 0.01) return null;
  const tap = Math.sin(Math.PI * ip(f, [OB.tap - 4, OB.tap + 10], [0, 1]));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: a * out, fontFamily: UF.ui}}>
      <div style={{position: 'absolute', left: 900, top: 120, width: 940, textAlign: 'center', fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#0F3A8A'}}>ONLINE PAYMENT</div>
      <div style={{...GLASS, position: 'absolute', left: 1070, top: 260, width: 600, padding: 34, borderRadius: 30, boxSizing: 'border-box', textAlign: 'center', transform: `translateY(${(1 - a) * 24}px)`}}>
        <div style={{fontSize: 90}}>🛒</div>
        <div style={{fontFamily: UF.head, fontSize: 44, fontWeight: 800, color: U.ink, marginTop: 8}}>₹499 · Demo Store</div>
        <div style={{fontSize: 20, color: U.slate, marginTop: 6}}>Card •••• 4321</div>
        <div style={{margin: '26px auto 0', width: 300, padding: '18px 0', borderRadius: 18, background: U.blue, color: '#fff', fontWeight: 800, fontSize: 26, transform: `scale(${1 - 0.06 * tap})`, boxShadow: `0 12px 28px ${U.blue}55`}}>Pay ₹499</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ stage: big SMS card with code + timer
export const CodeCard: React.FC<{f: number}> = ({f}) => {
  const a = ip(f, [OB.sms - 4, OB.sms + 16], [0, 1], EO);
  const out = ip(f, [OB.smsOut, OB.smsOut + 14], [1, 0], EIO);
  if (a <= 0.01 || out <= 0.01) return null;
  const codeHi = ip(f, [OB.code, OB.code + 10], [0, 1]);
  const secs = Math.max(0, 300 - Math.floor(Math.max(0, f - OB.timer) / 30));
  const ring = ip(f, [OB.timer, OB.timer + 30], [0, 1], EO);
  const ok = ip(f, [OB.success, OB.success + 12], [0, 1], EO);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: a * out, fontFamily: UF.ui}}>
      <div style={{position: 'absolute', left: 900, top: 120, width: 940, textAlign: 'center', fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#0F3A8A'}}>ONE-TIME PASSWORD</div>
      <div style={{...GLASS, position: 'absolute', left: 960, top: 200, width: 820, padding: 30, borderRadius: 30, boxSizing: 'border-box', transform: `translateY(${(1 - a) * 24}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, color: U.slate, fontWeight: 700}}>
          <span style={{width: 34, height: 34, borderRadius: 10, background: U.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✉</span> SMS · Demo Bank
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 26}}>
          {CODE.split('').map((d, i) => {
            const typed = f >= OB.digits[i];
            return <div key={i} style={{width: 92, height: 112, borderRadius: 20, background: '#fff', border: `3px solid ${ok > 0.5 ? U.green : typed ? U.blue : codeHi > 0.5 ? U.cyan : 'rgba(15,23,42,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UF.head, fontSize: 64, fontWeight: 800, color: U.ink, boxShadow: codeHi > 0.5 ? `0 10px 26px ${U.blue}33` : undefined, transform: `scale(${typed && f < OB.digits[i] + 8 ? 1.08 : 1})`}}>{d}</div>;
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 22, fontSize: 18, color: U.slate}}>6-digit code · use it only once</div>
      </div>
      {/* validity timer */}
      <div style={{position: 'absolute', left: 1370 - 230, top: 610, width: 460, display: 'flex', alignItems: 'center', gap: 22, opacity: ring}}>
        <svg width={110} height={110} viewBox="0 0 110 110">
          <circle cx={55} cy={55} r={46} fill="none" stroke="rgba(15,23,42,0.1)" strokeWidth={10} />
          <circle cx={55} cy={55} r={46} fill="none" stroke={U.saffron} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${289 * secs / 300} 289`} transform="rotate(-90 55 55)" />
        </svg>
        <div><div style={{fontSize: 20, fontWeight: 700, color: U.slate}}>Valid for</div><div style={{fontFamily: UF.head, fontSize: 48, fontWeight: 800, color: deep(U.saffron)}}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</div></div>
      </div>
      <div style={{position: 'absolute', left: 1370 - 160, top: 760, width: 320, padding: '14px 0', borderRadius: 18, background: U.green, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 26, opacity: ok, transform: `scale(${0.85 + 0.15 * ok})`, boxShadow: '0 14px 30px rgba(34,197,94,0.35)'}}>✓ OTP verified</div>
    </div>
  );
};

// ------------------------------------------------------------------ stage: three questions
export const Questions: React.FC<{f: number}> = ({f}) => {
  const out = ip(f, [OB.title - 10, OB.title + 4], [1, 0], EIO);
  if (f < OB.q1 - 10 || out <= 0.01) return null;
  const Q: [string, string, string, number][] = [
    ['server', 'Where is the code made?', '#7C5CFF', OB.q1], ['phone', 'How does it reach your phone?', U.blue, OB.q2], ['shield', 'How does the bank check it?', U.green, OB.q3],
  ];
  return (
    <div style={{position: 'absolute', left: 900, top: 0, width: 940, height: 1080, opacity: out, fontFamily: UF.ui}}>
      <div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        {Q.map(([ic, text, col, at], i) => {
          const e = ip(f, [at - 6, at + 14], [0, 1], EO);
          return (
            <div key={text} style={{...GLASS, width: 700, padding: '22px 28px', borderRadius: 26, display: 'flex', alignItems: 'center', gap: 22, opacity: e, transform: `translateX(${(1 - e) * 40}px)`, boxSizing: 'border-box'}}>
              <div style={{width: 64, height: 64, borderRadius: 18, background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icon k={ic} s={36} /></div>
              <div style={{fontFamily: UF.head, fontSize: 34, fontWeight: 800, color: U.ink}}><span style={{color: deep(col)}}>{i + 1}.</span> {text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ title
export const Title: React.FC<{f: number}> = ({f}) => {
  const a = OB.title;
  const t1 = ip(f, [a, a + 20], [0, 1], EO), t2 = ip(f, [a + 10, a + 30], [0, 1], EO), line = ip(f, [a + 6, a + 34], [0, 1], EIO);
  if (f < a) return null;
  return (
    <div style={{position: 'absolute', left: 880, top: 330, width: 980, textAlign: 'center'}}>
      <div style={{fontFamily: UF.head, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: U.ink, opacity: t1, transform: `translateY(${(1 - t1) * 30}px)`, filter: t1 < 1 ? `blur(${(1 - t1) * 10}px)` : undefined, textShadow: '0 10px 40px rgba(255,255,255,0.9)'}}>
        HOW <span style={{background: `linear-gradient(90deg, ${U.blue}, #7C5CFF)`, WebkitBackgroundClip: 'text', color: 'transparent'}}>OTP</span> WORKS
      </div>
      <div style={{height: 4, width: 520 * line, margin: '10px auto 0', borderRadius: 2, background: `linear-gradient(90deg, ${U.blue}, #fff, #7C5CFF)`}} />
      <div style={{fontFamily: UF.ui, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: '#0F3A8A', marginTop: 24, opacity: t2, transform: `translateY(${(1 - t2) * 16}px)`}}>THE TECHNOLOGY BEHIND ONE-TIME PASSWORDS</div>
      <div style={{fontFamily: UF.ui, fontSize: 16, color: U.slate, marginTop: 40, opacity: t2}}>Codes, numbers and messages shown are illustrative.</div>
    </div>
  );
};

export const OtpSample: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const enter = ip(f, [0, 18], [0, 1]);
  const fadeOut = ip(f, [OTL.durationInFrames - 16, OTL.durationInFrames - 1], [0, 1], EIO);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#F8FAFD'}}>
      <Audio src={staticFile('otp/sample_soundtrack.wav')} />
      <Backdrop />
      <AbsoluteFill style={{opacity: enter}}>
        <Phone x={540 - 215} y={100} scale={1.19} screen={<OtpPhone f={f} />} />
      </AbsoluteFill>
      <Intro f={f} />
      <CodeCard f={f} />
      <Questions f={f} />
      <Title f={f} />
      <AbsoluteFill style={{background: '#F8FAFD', opacity: ip(f, [0, 10], [1, 0])}} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut * 0.6}} />
    </AbsoluteFill>
  );
};
