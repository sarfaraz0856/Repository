import React from 'react';
import {EIO, EO, ip} from '../../anim';
import {U, UF, deep} from '../../upi/theme';
import {Bar, Tap} from '../../upi/full/screens';
import {Icon} from '../../upi/full/kit';
import {CODE} from '../OtpSample';

/** Illustrative bank app + OTP screens. Fictional names: Navyug Bank, Kiran Electronics. */
export const BANK = 'Navyug Bank';
export const SHOP = 'Kiran Electronics';
export const SENDER = 'VM-NAVYUG';

const Brand: React.FC<{title: string; sub?: string}> = ({title, sub = `${BANK} · illustrative app`}) => (
  <div style={{position: 'absolute', top: 58, left: 0, right: 0, height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', boxSizing: 'border-box'}}>
    <div style={{width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, #7C5CFF, ${U.blue})`, color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>N</div>
    <div><div style={{fontSize: 19, fontWeight: 800, color: U.ink}}>{title}</div><div style={{fontSize: 12.5, color: U.sub}}>{sub}</div></div>
  </div>
);

const Field: React.FC<{y: number; label: string; value: string; hi?: boolean}> = ({y, label, value, hi}) => (
  <div style={{position: 'absolute', top: y, left: 18, right: 18, padding: '12px 16px', borderRadius: 16, background: '#fff', border: `2px solid ${hi ? U.blue : 'rgba(15,23,42,0.08)'}`}}>
    <div style={{fontSize: 13, color: U.sub}}>{label}</div><div style={{fontSize: 18, fontWeight: 700, color: U.ink, marginTop: 2, letterSpacing: value.startsWith('•') ? 3 : 0}}>{value}</div>
  </div>
);

/** login: user id + password, then OTP step */
export const LoginScreen: React.FC<{f: number; otpAt?: number; okAt?: number}> = ({f, otpAt = 1e9, okAt = 1e9}) => {
  const otp = ip(f, [otpAt, otpAt + 14], [0, 1], EO);
  const ok = ip(f, [okAt, okAt + 14], [0, 1], EO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <Brand title="Login" />
      <Field y={150} label="User ID" value="aarav.k21" />
      <Field y={232} label="Password" value="••••••••••" hi={otp < 0.5} />
      <div style={{position: 'absolute', top: 330, left: 18, right: 18, opacity: otp}}>
        <div style={{fontSize: 14, color: U.sub, marginBottom: 8}}>Step 2 · OTP sent to +91 XXXXX X1234</div>
        <div style={{display: 'flex', gap: 8}}>{CODE.split('').map((d, i) => <div key={i} style={{flex: 1, height: 54, borderRadius: 12, background: '#fff', border: `2px solid ${U.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: U.ink}}>{f >= otpAt + 12 + i * 4 ? d : ''}</div>)}</div>
      </div>
      <div style={{position: 'absolute', top: 720, left: 18, right: 18, padding: '18px 0', borderRadius: 18, background: U.blue, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 20}}>{otp > 0.5 ? 'Verify & Login' : 'Continue'}</div>
      {ok > 0.01 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg,#16A34A,${U.green})`, opacity: ok, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 260}}>
        <div style={{width: 110, height: 110, borderRadius: 55, background: '#fff', color: U.green, fontSize: 60, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 28}}>Logged in securely</div></div>}
    </div>
  );
};

/** OTP entry with SMS banner (at smsAt), optional autofill chip (at autoAt), digits (at typeAt), result */
export const OtpEntry: React.FC<{f: number; smsAt?: number; autoAt?: number; typeAt?: number; okAt?: number; failAt?: number; resendFrom?: number; title?: string}> =
  ({f, smsAt = 1e9, autoAt = 1e9, typeAt = 1e9, okAt = 1e9, failAt = 1e9, resendFrom = 0, title = 'Enter OTP'}) => {
  const banner = ip(f, [smsAt, smsAt + 14], [0, 1], EO) * ip(f, [Math.min(typeAt, autoAt) + 20, Math.min(typeAt, autoAt) + 34], [1, 0]);
  const auto = ip(f, [autoAt, autoAt + 12], [0, 1], EO) * ip(f, [autoAt + 40, autoAt + 50], [1, 0]);
  const t0 = Math.min(typeAt, autoAt + 30);
  const typed = Math.max(0, Math.min(6, Math.floor((f - t0) / 4) + 1));
  const ok = ip(f, [okAt, okAt + 14], [0, 1], EO);
  const fail = f >= failAt;
  const resend = Math.max(0, 30 - Math.floor(Math.max(0, f - resendFrom) / 30));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center'}}>
        <div style={{width: 70, height: 70, margin: '0 auto', borderRadius: 22, background: `linear-gradient(135deg, ${U.blue}, #7C5CFF)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="lock" s={38} /></div>
        <div style={{fontSize: 24, fontWeight: 800, color: U.ink, marginTop: 18}}>{title}</div>
        <div style={{fontSize: 15, color: U.sub, marginTop: 6}}>Sent to +91 XXXXX X1234</div>
      </div>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 9}}>
        {CODE.split('').map((d, i) => {
          const on = f >= t0 && i < typed;
          return <div key={i} style={{width: 50, height: 62, borderRadius: 14, background: '#fff', border: `2px solid ${fail ? U.red : on ? U.blue : 'rgba(15,23,42,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: U.ink}}>{on ? (fail ? '•' : d) : ''}</div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontSize: 15, color: fail ? U.red : U.sub, fontWeight: fail ? 700 : 400}}>{fail ? 'Incorrect OTP · 2 attempts left' : resend > 0 ? `Resend OTP in 0:${String(resend).padStart(2, '0')}` : 'Resend OTP'}</div>
      {auto > 0.01 && <div style={{position: 'absolute', top: 470, left: 60, right: 60, padding: '12px 0', borderRadius: 14, background: '#E0F2FE', color: '#0369A1', textAlign: 'center', fontWeight: 800, fontSize: 16, opacity: auto}}>From Messages: {CODE} · tap to fill</div>}
      <div style={{position: 'absolute', top: 54, left: 12, right: 12, padding: '14px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.98)', boxShadow: '0 14px 34px rgba(0,0,0,0.22)', opacity: banner, transform: `translateY(${(1 - banner) * -60}px)`, zIndex: 9}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: U.sub}}><span style={{width: 24, height: 24, borderRadius: 7, background: U.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13}}>✉</span><b style={{color: U.ink}}>{SENDER}</b><span style={{marginLeft: 'auto'}}>now</span></div>
        <div style={{marginTop: 8, fontSize: 15, lineHeight: 1.45, color: U.ink}}><b>{CODE}</b> is your OTP for ₹499 at {SHOP}. Valid for 5 minutes. Do not share it with anyone. – {BANK}</div>
      </div>
      {ok > 0.01 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg,#16A34A,${U.green})`, opacity: ok, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 240}}>
        <div style={{width: 110, height: 110, borderRadius: 55, background: '#fff', color: U.green, fontSize: 60, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 28}}>Verified</div><div style={{fontSize: 16, opacity: 0.9, marginTop: 8}}>Payment / login approved</div></div>}
    </div>
  );
};

/** authenticator app: codes refresh every 30 s (ring), account rows */
export const AuthApp: React.FC<{f: number}> = ({f}) => {
  const period = 900; // visually compressed: 30 s on screen = 30 s real
  const t = (f % period) / period;
  const codes = ['731 904', '208 551', '664 019', '915 372'];
  const k = Math.floor(f / period) % codes.length;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0F172A', fontFamily: UF.ui, color: '#fff'}}>
      <Bar />
      <div style={{position: 'absolute', top: 66, left: 22, fontSize: 21, fontWeight: 800}}>Authenticator</div>
      <div style={{position: 'absolute', top: 96, left: 22, fontSize: 12.5, opacity: 0.6}}>illustrative app</div>
      {[[BANK, codes[k]], ['Email account', codes[(k + 1) % 4]], ['Cloud storage', codes[(k + 2) % 4]]].map(([acc, code], i) => (
        <div key={acc} style={{position: 'absolute', top: 140 + i * 120, left: 16, right: 16, padding: '16px 18px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div><div style={{fontSize: 14, opacity: 0.7}}>{acc}</div><div style={{fontSize: 36, fontWeight: 800, letterSpacing: 2, color: i === 0 ? '#93C5FD' : '#fff', fontVariantNumeric: 'tabular-nums'}}>{code}</div></div>
          <svg width={40} height={40} viewBox="0 0 40 40"><circle cx={20} cy={20} r={16} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={5} /><circle cx={20} cy={20} r={16} fill="none" stroke={t > 0.8 ? U.red : U.cyan} strokeWidth={5} strokeDasharray={`${100.5 * (1 - t)} 100.5`} transform="rotate(-90 20 20)" /></svg>
        </div>
      ))}
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontSize: 13, opacity: 0.6}}>New code every 30 seconds · works offline</div>
    </div>
  );
};

/** scam phone: incoming call (callAt..linkAt), fake page (linkAt..simAt), no-service (simAt..) */
export const ScamPhone: React.FC<{f: number; linkAt: number; simAt: number}> = ({f, linkAt, simAt}) => {
  if (f < linkAt) return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1E293B,#0F172A)', fontFamily: UF.ui, color: '#fff'}}>
      <Bar />
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center'}}>
        <div style={{fontSize: 16, opacity: 0.7}}>Incoming call</div>
        <div style={{fontSize: 30, fontWeight: 800, marginTop: 8}}>+91 98XXX XX107</div>
        <div style={{fontSize: 16, color: '#FCA5A5', marginTop: 8}}>"Sir, main bank se bol raha hoon…"</div>
      </div>
      <div style={{position: 'absolute', top: 420, left: 30, right: 30, padding: 16, borderRadius: 18, background: 'rgba(239,68,68,0.15)', border: `2px solid ${U.red}`, fontSize: 16, textAlign: 'center'}}>⚠️ Asks for your OTP? It's a scam.</div>
      <div style={{position: 'absolute', bottom: 90, left: 0, right: 0, display: 'flex', justifyContent: 'space-around'}}>
        <div style={{width: 74, height: 74, borderRadius: 37, background: U.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30}}>✕</div>
        <div style={{width: 74, height: 74, borderRadius: 37, background: U.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>✆</div>
      </div>
    </div>
  );
  if (f < simAt) return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 60, left: 14, right: 14, padding: '10px 14px', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C', fontSize: 14, fontWeight: 700}}>⚠ navyug-bank-kyc-update.example</div>
      <div style={{position: 'absolute', top: 140, width: '100%', textAlign: 'center', fontSize: 22, fontWeight: 800, color: U.ink}}>KYC Update – Enter OTP</div>
      <div style={{position: 'absolute', top: 200, left: 30, right: 30, padding: 20, borderRadius: 18, background: '#fff', border: '2px dashed #FCA5A5', textAlign: 'center', color: U.sub, fontSize: 16}}>Fake website · looks real<br />but is not the bank</div>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 9}}>{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{width: 46, height: 56, borderRadius: 12, background: '#fff', border: '2px solid #FCA5A5'}} />)}</div>
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontSize: 13, color: U.sub}}>Illustrative example of a phishing page</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(165deg,#334155,#1E293B)', fontFamily: UF.ui, color: '#fff'}}>
      <div style={{position: 'absolute', top: 16, left: 34, fontSize: 15, fontWeight: 700, color: '#FCA5A5'}}>No Service</div>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontSize: 92, fontWeight: 700}}>9:41</div>
      <div style={{position: 'absolute', top: 290, left: 24, right: 24, padding: 18, borderRadius: 20, background: 'rgba(239,68,68,0.18)', border: `2px solid ${U.red}`, fontSize: 16, lineHeight: 1.5, textAlign: 'center'}}>📵 Network suddenly gone?<br />Call your operator right away.</div>
    </div>
  );
};

/** SMS inbox with highlighted amount + merchant */
export const SmsRead: React.FC<{f: number; amtAt: number; unknownAt: number}> = ({f, amtAt, unknownAt}) => {
  const hi = ip(f, [amtAt, amtAt + 12], [0, 1]);
  const u = ip(f, [unknownAt, unknownAt + 14], [0, 1], EO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontSize: 15, color: U.sub}}>Messages · {SENDER}</div>
      <div style={{position: 'absolute', top: 120, left: 18, right: 50, padding: '14px 16px', borderRadius: '20px 20px 20px 6px', background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.1)', fontSize: 16, lineHeight: 1.5, color: U.ink}}>
        {CODE} is your OTP for <b style={{background: `rgba(245,158,11,${0.3 * hi})`, borderRadius: 4}}>₹499</b> at <b style={{background: `rgba(245,158,11,${0.3 * hi})`, borderRadius: 4}}>{SHOP}</b>. Valid for 5 minutes. Do not share it with anyone. – {BANK}
      </div>
      <div style={{position: 'absolute', top: 300, left: 18, right: 50, padding: '14px 16px', borderRadius: '20px 20px 20px 6px', background: '#fff', borderLeft: `5px solid ${U.red}`, boxShadow: '0 6px 16px rgba(30,45,90,0.1)', fontSize: 16, lineHeight: 1.5, color: U.ink, opacity: u}}>
        605218 is your OTP for <b>₹24,999</b> at <b>an unknown merchant</b>… <span style={{color: U.red, fontWeight: 800}}>You didn't start this? Ignore & tell your bank.</span>
      </div>
    </div>
  );
};
