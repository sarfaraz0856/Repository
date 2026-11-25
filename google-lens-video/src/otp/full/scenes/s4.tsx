import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {OtpEntry, SHOP} from '../screens';
import {Header, Icon, OnText, Panel, X0, XW, vis} from '../../../upi/full/kit';
import {EIO, EO, ip} from '../../../anim';
import {CODE} from '../../OtpSample';

const S = sc('s4'); const L = loc(S);
const HASH = '9f2c71e0…b48a';

export const Screen: React.FC<{f: number}> = ({f}) => <OtpEntry f={f} resendFrom={L.c(1)} title="Sending OTP…" />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4)), B = vis(f, L.c(4) - 4, L.c(6)), C = vis(f, L.c(6) - 4, L.dur);
  const settle = L.w(1, 'Random') + 36;
  const digits = CODE.split('').map((d, i) => (f < settle + i * 4 ? String(Math.floor(Math.abs(Math.sin((f + i * 13) * 12.9898)) * 10) % 10) : d));
  const combos = Math.round(ip(f, [L.c(5) + 6, L.c(5) + 50], [0, 1000000], EIO));
  const hashed = f >= L.w(8, 'Hash');
  return (
    <>
      <Header f={f} dur={L.dur} n="04" title="HOW AN OTP IS CREATED" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={56} text="WHERE DOES THE CODE COME FROM?" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: 1370 - 300, top: 220, width: 600, padding: 30, borderRadius: 30, background: '#0F172A', boxShadow: '0 24px 50px rgba(30,45,90,0.3)', opacity: on(L.c(1)), color: '#fff'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 700, color: '#93C5FD'}}><Icon k="server" s={26} /> AUTH SERVER · Navyug Bank</div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24}}>
              {digits.map((d, i) => <div key={i} style={{width: 72, height: 92, borderRadius: 16, background: f >= settle + i * 4 ? '#1D4ED8' : '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UF.head, fontSize: 52, fontWeight: 800}}>{f >= L.w(1, 'Random') ? d : '–'}</div>)}
            </div>
          </div>
          <OnText f={f} a={L.c(2)} b={L.c(3)} y={540} size={34} color={U.blue} text="RANDOM · HARD TO PREDICT" />
          <OnText f={f} a={L.c(3)} y={540} size={32} color={'#7C5CFF'} text="SECURE RANDOM NUMBER GENERATOR" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: X0, top: 200, width: XW, display: 'flex', justifyContent: 'center', gap: 26}}>
            {[['4 digits', '0000–9999'], ['6 digits', 'most common'], ['8 digits', 'some systems']].map(([t, s], i) => (
              <div key={t} style={{width: 250, padding: '24px 0', borderRadius: 24, background: '#fff', textAlign: 'center', boxShadow: i === 1 ? `0 0 0 4px ${U.blue}55, 0 16px 34px rgba(30,45,90,0.18)` : '0 12px 28px rgba(30,45,90,0.13)', opacity: on(L.c(4) + i * 8), transform: `scale(${i === 1 && f >= L.w(4, 'ज़्यादातर') ? 1.08 : 1})`}}>
                <div style={{fontFamily: UF.head, fontSize: 40, fontWeight: 800, color: i === 1 ? deep(U.blue) : U.ink}}>{t}</div><div style={{fontSize: 19, color: U.slate, marginTop: 4}}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{position: 'absolute', left: X0, top: 470, width: XW, textAlign: 'center', opacity: on(L.c(5))}}>
            <div style={{fontSize: 24, color: U.slate, fontWeight: 700}}>6 digits = possible codes</div>
            <div style={{fontFamily: UF.head, fontSize: 110, fontWeight: 800, color: deep(U.blue), fontVariantNumeric: 'tabular-nums'}}>{combos.toLocaleString('en-IN')}</div>
            <div style={{fontSize: 26, fontWeight: 800, color: deep(U.green), opacity: on(L.w(5, 'Guess'))}}>guessing the right one is very hard</div>
          </div>
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C, fontFamily: UF.ui}}>
          <Panel x={X0 + 90} y={180} w={XW - 180} t={on(L.c(6))} glow={'#7C5CFF'}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700, letterSpacing: 2, color: '#0F3A8A'}}><Icon k="db" s={0} />OTP DATABASE · one record</div>
            {[['User', 'aarav.k21', L.w(7, 'User')], ['Transaction', `₹499 · ${SHOP}`, L.w(7, 'Transaction')], ['OTP', hashed ? HASH : CODE, L.c(6) + 10], ['Expires at', '09:46 (in 5 min)', L.w(7, 'Expire')]].map(([k, v, at]) => (
              <div key={k as string} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 4px', borderBottom: '1px solid rgba(15,23,42,0.08)', opacity: on(at as number), fontSize: 24}}>
                <span style={{color: U.slate}}>{k as string}</span><b style={{color: k === 'OTP' && hashed ? deep('#7C5CFF') : U.ink, fontFamily: k === 'OTP' ? 'monospace' : undefined}}>{v as string}</b>
              </div>
            ))}
          </Panel>
          {f >= L.c(8) - 6 && (
            <div style={{position: 'absolute', left: X0 + 90, top: 560, width: XW - 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: on(L.c(8))}}>
              <span style={{padding: '14px 20px', borderRadius: 16, background: '#fff', fontFamily: 'monospace', fontSize: 30, fontWeight: 800, boxShadow: '0 10px 24px rgba(30,45,90,0.12)'}}>{CODE}</span>
              <span style={{fontSize: 34, color: U.slate}}>→</span>
              <span style={{padding: '14px 20px', borderRadius: 16, background: '#7C5CFF', color: '#fff', fontWeight: 800, fontSize: 24}}>HASH ⚙</span>
              <span style={{fontSize: 34, color: U.slate}}>→</span>
              <span style={{padding: '14px 20px', borderRadius: 16, background: '#fff', fontFamily: 'monospace', fontSize: 26, fontWeight: 800, color: deep('#7C5CFF'), boxShadow: '0 10px 24px rgba(30,45,90,0.12)'}}>{HASH}</span>
            </div>
          )}
          <OnText f={f} a={L.c(9)} b={L.c(10)} y={700} size={30} color={'#7C5CFF'} text="A DIGITAL FINGERPRINT · CAN'T BE TURNED BACK EASILY" />
          <OnText f={f} a={L.c(10)} b={L.c(11)} y={700} size={30} color={U.green} text="DATABASE LEAKED? THE REAL OTP ISN'T THERE" />
          <OnText f={f} a={L.c(11)} y={700} size={34} color={U.saffron} text="⏱ EXPIRY: USUALLY 5–10 MINUTES" />
        </div>
      )}
    </>
  );
};
