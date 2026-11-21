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
import {FB, FTL} from './timeline';

const PHONE_SCALE = 1.19; // same enlarged phone as the UPI / Google Lens videos
const PHONE_CX = 540;
const SW = 402;
export const TOLL = '₹95'; // illustrative toll amount
const BAL = '₹405';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(['400 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '800 20px "Plus Jakarta Sans"', '600 20px "Noto Sans Devanagari"']
      .map((x) => document.fonts.load(x, 'FASTag ₹95 टोल')))
      .finally(() => continueRender(h));
  }, [h]);
};

// ------------------------------------------------------------------ phone: lock screen -> toll SMS
const LockScreen: React.FC<{f: number}> = ({f}) => {
  const nav = ip(f, [FB.gantry - 10, FB.gantry + 10], [0, 1], EO) * ip(f, [FB.sms - 8, FB.sms + 4], [1, 0]);
  const sms = ip(f, [FB.sms, FB.sms + 16], [0, 1], EO);
  const hi = ip(f, [FB.debit, FB.debit + 10], [0, 1]);
  const pulse = 1 + 0.03 * Math.sin(Math.PI * ip(f, [FB.debit, FB.debit + 14], [0, 1]));
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: UF.ui, color: '#fff', background: 'linear-gradient(165deg, #1E3A8A 0%, #2563EB 45%, #0EA5E9 100%)'}}>
      <div style={{position: 'absolute', top: 0, left: 0, width: SW, height: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 34px 0', boxSizing: 'border-box', fontWeight: 600, fontSize: 16}}>
        <span>9:41</span><span>5G ▮▮▮</span>
      </div>
      <div style={{position: 'absolute', top: 92, width: '100%', textAlign: 'center', fontSize: 19, fontWeight: 600, opacity: 0.9}}>Monday, 14 July</div>
      <div style={{position: 'absolute', top: 116, width: '100%', textAlign: 'center', fontSize: 92, fontWeight: 700, letterSpacing: -2}}>9:41</div>
      {/* driving / navigation card */}
      <div style={{position: 'absolute', top: 300, left: 18, right: 18, padding: '16px 18px', borderRadius: 22, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', opacity: nav, transform: `translateY(${(1 - nav) * 14}px)`, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 46, height: 46, borderRadius: 14, background: '#fff', color: U.blue, fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>↑</div>
        <div><div style={{fontSize: 15, opacity: 0.85}}>Driving · Highway</div><div style={{fontSize: 20, fontWeight: 700}}>Toll Plaza ahead · 200 m</div></div>
      </div>
      {/* SMS notification */}
      <div style={{position: 'absolute', top: 290, left: 14, right: 14, padding: '16px 18px', borderRadius: 24, background: 'rgba(255,255,255,0.96)', color: U.ink, boxShadow: '0 14px 34px rgba(0,0,0,0.25)', opacity: sms, transform: `translateY(${(1 - sms) * -40}px) scale(${pulse})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: U.sub}}>
          <span style={{width: 26, height: 26, borderRadius: 8, background: U.green, color: '#fff', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✉</span>
          <span style={{fontWeight: 700, color: U.ink}}>MESSAGES</span><span style={{marginLeft: 'auto'}}>now</span>
        </div>
        <div style={{marginTop: 10, fontSize: 17, lineHeight: 1.45}}>
          <b style={{background: `rgba(240,68,56,${0.14 * hi})`, color: hi > 0.5 ? '#C81E1E' : U.ink, borderRadius: 6, padding: '0 4px'}}>{TOLL} debited</b> from your FASTag wallet for toll at <b>Demo Toll Plaza</b>. Available balance {BAL}.
        </div>
        <div style={{marginTop: 8, fontSize: 12, color: U.sub}}>Illustrative message</div>
      </div>
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontSize: 14, opacity: 0.75}}>Swipe up to open</div>
    </div>
  );
};

// ------------------------------------------------------------------ car (side view, facing right)
const Car: React.FC<{x: number; y: number; f: number; tagGlow: number}> = ({x, y, f, tagGlow}) => {
  const spin = (x * 1.6) % 360;
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} 122)`}>
      <circle r={30} fill="#1F2937" /><circle r={15} fill="#CBD5E1" />
      <g transform={`rotate(${spin})`}>{[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-2} y={-14} width={4} height={10} rx={2} fill="#64748B" transform={`rotate(${a})`} />)}</g>
    </g>
  );
  return (
    <svg width={330} height={160} viewBox="0 0 330 160" style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
      <ellipse cx={165} cy={152} rx={150} ry={9} fill="rgba(30,40,80,0.22)" />
      <path d="M 18 112 L 18 84 Q 20 66 44 62 L 92 56 L 140 18 Q 150 12 166 12 L 228 12 Q 244 12 254 22 L 290 58 Q 318 64 320 88 L 320 112 Q 320 124 306 124 L 24 124 Q 18 124 18 112 Z" fill={`url(#body)`} />
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EF4444" /><stop offset="1" stopColor="#B91C1C" /></linearGradient>
      </defs>
      {/* windows */}
      <path d="M 104 58 L 146 24 Q 152 20 162 20 L 184 20 L 184 58 Z" fill="#BFDBFE" />
      <path d="M 192 20 L 226 20 Q 238 20 246 28 L 278 58 L 192 58 Z" fill="#93C5FD" />
      {/* FASTag sticker on the windshield (behind the rear-view mirror) */}
      <rect x={236} y={30} width={20} height={13} rx={2} fill="#fff" stroke={`rgba(34,197,94,${0.4 + 0.6 * tagGlow})`} strokeWidth={2 + 2 * tagGlow} transform="rotate(45 246 36)" />
      {tagGlow > 0.02 && <circle cx={246} cy={36} r={14 + 10 * tagGlow} fill="none" stroke={U.green} strokeWidth={2} opacity={tagGlow} />}
      <rect x={26} y={84} width={20} height={9} rx={3} fill="#FDE68A" />
      <rect x={300} y={78} width={18} height={10} rx={3} fill="#FEF9C3" />
      <line x1={190} y1={62} x2={190} y2={118} stroke="rgba(0,0,0,0.15)" strokeWidth={2} />
      {wheel(80)}{wheel(258)}
    </svg>
  );
};

// ------------------------------------------------------------------ toll plaza
const ROAD_Y = 760;
const READER_X = 1440;
const Road: React.FC<{f: number}> = ({f}) => {
  const out = ip(f, [FB.roadOut, FB.roadOut + 16], [1, 0], EIO);
  if (out <= 0.01) return null;
  const g = ip(f, [FB.gantry, FB.gantry + 20], [0, 1], EO);
  // car path: drive in, ease through the reader (no stop), speed away
  const read = FB.read, carX = (() => {
    const x0 = 760, xr = READER_X - 246, xEnd = 2050;
    if (f <= read) return x0 + (xr - x0) * ip(f, [8, read], [0, 1], (t) => 1 - Math.pow(1 - t, 1.6));
    return xr + (xEnd - xr) * ip(f, [read, FB.carOut + 18], [0, 1], (t) => t * t * 0.55 + t * 0.45);
  })();
  const tagGlow = Math.sin(Math.PI * ip(f, [read - 6, read + 18], [0, 1]));
  const ok = ip(f, [FB.ok, FB.ok + 10], [0, 1], EO) * ip(f, [FB.carOut + 10, FB.carOut + 24], [1, 0]);
  const arm = ip(f, [FB.barrierUp, FB.barrierUp + 8], [0, 1], EIO) * ip(f, [FB.carOut + 26, FB.carOut + 40], [1, 0], EIO);
  const waves = f >= read - 8 && f < read + 22;
  return (
    <div style={{position: 'absolute', left: 860, top: 0, width: 1060, height: 1080, overflow: 'hidden', opacity: out, fontFamily: UF.ui}}>
      <div style={{position: 'absolute', left: 40, top: 96, width: 940, textAlign: 'center', fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#0F3A8A', opacity: ip(f, [4, 24], [0, 1])}}>ON THE HIGHWAY</div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1060, height: 1080, transform: 'translateX(-860px)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(1.25)', transformOrigin: '1370px 900px'}}>
        {/* road */}
        <div style={{position: 'absolute', left: 860, top: ROAD_Y + 140, width: 1060, height: 90, background: 'linear-gradient(180deg,#9AA6B8,#7C889B)'}} />
        <div style={{position: 'absolute', left: 860, top: ROAD_Y + 182, width: 1060, height: 6, backgroundImage: 'linear-gradient(90deg,#fff 0 50%, transparent 50% 100%)', backgroundSize: '80px 6px', backgroundPositionX: -f * 6, opacity: 0.85}} />
        {/* toll gantry */}
        <div style={{opacity: g, transform: `translateY(${(1 - g) * 20}px)`}}>
          <div style={{position: 'absolute', left: READER_X - 190, top: 300, width: 380, height: 70, borderRadius: 14, background: 'linear-gradient(180deg,#1E3A8A,#1E40AF)', boxShadow: '0 20px 40px rgba(30,45,90,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontWeight: 800, fontSize: 30, letterSpacing: 3}}>
            TOLL PLAZA
            <span style={{fontSize: 16, letterSpacing: 1, padding: '5px 10px', borderRadius: 8, background: U.green}}>FASTag LANE</span>
          </div>
          {[READER_X - 170, READER_X + 150].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 370, width: 20, height: ROAD_Y + 140 - 370, background: 'linear-gradient(90deg,#CBD5E1,#94A3B8)'}} />)}
          {/* RFID reader */}
          <div style={{position: 'absolute', left: READER_X - 34, top: 372, width: 68, height: 44, borderRadius: 10, background: '#0F172A', border: `3px solid ${waves ? U.cyan : '#334155'}`, boxShadow: waves ? `0 0 24px ${U.cyan}` : undefined, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>READER</div>
          {waves && [0, 1, 2].map((k) => {
            const t = ((f - (read - 8)) / 10 + k / 3) % 1;
            return <div key={k} style={{position: 'absolute', left: READER_X - 30 - t * 60, top: 410 + t * 120, width: 60 + t * 120, height: 60 + t * 120, borderRadius: '50%', borderBottom: `4px solid ${U.cyan}`, opacity: 1 - t}} />;
          })}
          {/* barrier */}
          <div style={{position: 'absolute', left: READER_X + 250, top: ROAD_Y + 40, width: 34, height: 100, borderRadius: 8, background: '#334155'}} />
          <div style={{position: 'absolute', left: READER_X + 266 - 170, top: ROAD_Y + 48, width: 170, height: 14, borderRadius: 7, backgroundImage: 'repeating-linear-gradient(90deg,#EF4444 0 26px,#fff 26px 52px)', transformOrigin: '100% 50%', transform: `rotate(${arm * 78}deg)`, boxShadow: '0 4px 10px rgba(0,0,0,0.2)'}} />
          {/* verified badge */}
          <div style={{position: 'absolute', left: READER_X - 120, top: 470, width: 240, padding: '12px 0', borderRadius: 16, background: U.green, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 24, opacity: ok, transform: `scale(${0.8 + 0.2 * ok})`, boxShadow: '0 14px 30px rgba(34,197,94,0.4)'}}>✓ Tag read · Paid</div>
        </div>
        <Car x={carX} y={ROAD_Y} f={f} tagGlow={tagGlow} />
      </div>
      </div>
    </div>
  );
};

const ChipFly: React.FC<{f: number}> = ({f}) => {
  const chip = ip(f, [FB.chip, FB.sms], [0, 1], EIO);
  if (chip <= 0 || chip >= 1) return null;
  const x0 = 1370 + (READER_X - 1370) * 1.25, y0 = 900 - (900 - 470) * 1.25; // badge position inside the 1.25x road scene
  const x = x0 + (PHONE_CX + 40 - x0) * chip, y = y0 - Math.sin(Math.PI * chip) * 200 + (380 - y0) * chip;
  return <div style={{position: 'absolute', left: x - 50, top: y - 22, padding: '8px 14px', borderRadius: 14, background: '#fff', color: deep(U.red), fontFamily: UF.ui, fontWeight: 800, fontSize: 22, boxShadow: '0 10px 24px rgba(30,45,90,0.25)', opacity: Math.min(1, chip * 8, (1 - chip) * 8)}}>−{TOLL}</div>;
};

// ------------------------------------------------------------------ "no cash, no card, no stopping?"
const Questions: React.FC<{f: number}> = ({f}) => {
  const out = ip(f, [FB.qOut, FB.qOut + 14], [1, 0], EIO);
  if (f < FB.cash - 10 || out <= 0.01) return null;
  const items: [string, string, number][] = [['💵', 'No cash', FB.cash], ['💳', 'No card', FB.card], ['🛑', 'No stopping', FB.stop]];
  const q = ip(f, [FB.how, FB.how + 14], [0, 1], EO);
  return (
    <div style={{position: 'absolute', left: 900, top: 0, width: 940, height: 1080, opacity: out, fontFamily: UF.ui}}>
      <div style={{position: 'absolute', top: 320, width: '100%', display: 'flex', justifyContent: 'center', gap: 30}}>
        {items.map(([icon, label, at]) => {
          const e = ip(f, [at - 6, at + 12], [0, 1], EO), x = ip(f, [at + 6, at + 16], [0, 1], EO);
          return (
            <div key={label} style={{...GLASS, width: 250, height: 250, borderRadius: 32, position: 'relative', opacity: e, transform: `translateY(${(1 - e) * 30}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
              <div style={{fontSize: 84}}>{icon}</div>
              <div style={{fontSize: 28, fontWeight: 800, color: U.ink}}>{label}</div>
              <svg width={250} height={250} style={{position: 'absolute', left: 0, top: 0}}>
                <line x1={72} y1={40} x2={72 + 106 * x} y2={40 + 106 * x} stroke={U.red} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
              </svg>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: UF.head, fontWeight: 800, fontSize: 64, color: U.ink, opacity: q, transform: `scale(${0.9 + 0.1 * q})`}}>
        So how was the toll <span style={{color: deep(U.blue)}}>paid?</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ windshield close-up with the sticker
const Windshield: React.FC<{f: number}> = ({f}) => {
  const a = ip(f, [FB.windshield, FB.windshield + 20], [0, 1], EO);
  const out = ip(f, [FB.title - 10, FB.title + 6], [1, 0], EIO);
  if (f < FB.windshield || out <= 0.01) return null;
  const s = ip(f, [FB.sticker - 4, FB.sticker + 14], [0, 1], EO);
  const pulse = 0.5 + 0.5 * Math.sin((f - FB.sticker) / 6);
  return (
    <div style={{position: 'absolute', left: 900, top: 0, width: 940, height: 1080, opacity: a * out, fontFamily: UF.ui}}>
      <div style={{position: 'absolute', top: 160, width: '100%', textAlign: 'center', fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#0F3A8A'}}>ON YOUR WINDSHIELD</div>
      {/* windshield glass */}
      <div style={{position: 'absolute', left: 90, top: 240, width: 760, height: 520, borderRadius: '46% 46% 16% 16% / 30% 30% 12% 12%', background: 'linear-gradient(170deg, rgba(191,219,254,0.95), rgba(147,197,253,0.75) 60%, rgba(96,165,250,0.7))', border: '16px solid #334155', boxShadow: '0 30px 60px rgba(30,45,90,0.25), inset 0 0 60px rgba(255,255,255,0.5)', transform: `scale(${0.92 + 0.08 * a})`}}>
        <div style={{position: 'absolute', left: '42%', top: 0, width: '16%', height: 70, background: '#334155', borderRadius: '0 0 10px 10px'}} />
        <div style={{position: 'absolute', left: '40%', top: 64, width: '20%', height: 44, borderRadius: 12, background: '#1F2937'}} />
        {/* sticker */}
        <div style={{position: 'absolute', left: 300, top: 150, width: 160, height: 104, borderRadius: 12, background: '#fff', boxShadow: `0 0 ${10 + 30 * s * pulse}px rgba(34,197,94,${0.7 * s}), 0 10px 24px rgba(0,0,0,0.2)`, transform: `scale(${1 + 0.35 * s}) rotate(-2deg)`, transformOrigin: '50% 30%', overflow: 'hidden'}}>
          <div style={{height: 30, background: `linear-gradient(90deg, ${U.blue}, ${U.green})`, color: '#fff', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 1}}>FASTag</div>
          <svg width={160} height={74} viewBox="0 0 160 74">
            {Array.from({length: 22}).map((_, i) => <rect key={i} x={10 + i * 4.5} y={12} width={i % 3 ? 2 : 3} height={34} fill="#0F172A" />)}
            <rect x={116} y={12} width={34} height={34} rx={4} fill="none" stroke={U.saffron} strokeWidth={2} />
            <rect x={124} y={20} width={18} height={18} rx={2} fill={U.saffron} opacity={0.8} />
            <text x={80} y={64} textAnchor="middle" fontSize={9} fill="#64748B" fontFamily="Inter">illustrative tag</text>
          </svg>
        </div>
      </div>
      <div style={{position: 'absolute', top: 820, width: '100%', textAlign: 'center', fontFamily: UF.head, fontWeight: 800, fontSize: 52, color: U.ink, opacity: s}}>
        What does this <span style={{color: deep(U.green)}}>sticker</span> do?
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ title
const Title: React.FC<{f: number}> = ({f}) => {
  const a = FB.title;
  const t1 = ip(f, [a, a + 20], [0, 1], EO), t2 = ip(f, [a + 10, a + 30], [0, 1], EO), line = ip(f, [a + 6, a + 34], [0, 1], EIO);
  if (f < a) return null;
  return (
    <div style={{position: 'absolute', left: 880, top: 330, width: 980, textAlign: 'center'}}>
      <div style={{fontFamily: UF.head, fontWeight: 800, fontSize: 98, letterSpacing: 2, color: U.ink, opacity: t1, transform: `translateY(${(1 - t1) * 30}px)`, filter: t1 < 1 ? `blur(${(1 - t1) * 10}px)` : undefined, textShadow: '0 10px 40px rgba(255,255,255,0.9)'}}>
        HOW <span style={{background: `linear-gradient(90deg, ${U.blue}, ${U.green})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>FASTag</span> WORKS
      </div>
      <div style={{height: 4, width: 560 * line, margin: '10px auto 0', borderRadius: 2, background: `linear-gradient(90deg, ${U.saffron}, #fff, ${U.green})`}} />
      <div style={{fontFamily: UF.ui, fontWeight: 700, fontSize: 28, letterSpacing: 7, color: '#0F3A8A', marginTop: 24, opacity: t2, transform: `translateY(${(1 - t2) * 16}px)`}}>THE TECHNOLOGY BEHIND CASHLESS TOLLS</div>
      <div style={{fontFamily: UF.ui, fontSize: 16, color: U.slate, marginTop: 40, opacity: t2}}>Amounts, names and messages shown are illustrative.</div>
    </div>
  );
};

export const FastagSample: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const enter = ip(f, [0, 18], [0, 1]);
  const fadeOut = ip(f, [FTL.durationInFrames - 16, FTL.durationInFrames - 1], [0, 1], EIO);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#F8FAFD'}}>
      <Audio src={staticFile('fastag/sample_soundtrack.wav')} />
      <Backdrop />
      <AbsoluteFill style={{opacity: enter}}>
        <Phone x={PHONE_CX - 215} y={100} scale={PHONE_SCALE} screen={<LockScreen f={f} />} />
      </AbsoluteFill>
      <Road f={f} />
      <ChipFly f={f} />
      <Questions f={f} />
      <Windshield f={f} />
      <Title f={f} />
      <AbsoluteFill style={{background: '#F8FAFD', opacity: ip(f, [0, 10], [1, 0])}} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut * 0.6}} />
    </AbsoluteFill>
  );
};
