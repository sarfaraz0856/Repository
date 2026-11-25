import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AuthApp} from '../screens';
import {Header, Icon, OnText, X0, XW, vis} from '../../../upi/full/kit';
import {EIO, EO, ip} from '../../../anim';
import {DemoQR} from '../../../upi/QR';

const S = sc('s7'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <AuthApp f={f} />;

const Calc: React.FC<{x: number; title: string; icon: string; color: string; t: number; f: number; at: number}> = ({x, title, icon, color, t, f, at}) => (
  <div style={{position: 'absolute', left: x, top: 230, width: 400, padding: 26, borderRadius: 26, background: '#fff', boxShadow: '0 14px 32px rgba(30,45,90,0.15)', opacity: t, transform: `translateY(${(1 - t) * 20}px)`, fontFamily: UF.ui}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}><div style={{width: 48, height: 48, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={icon} s={28} /></div><b style={{fontSize: 26, color: U.ink}}>{title}</b></div>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, fontSize: 22, fontWeight: 700, color: U.slate}}>🔑 secret key <span>+</span> 🕘 current time</div>
    <div style={{fontSize: 22, color: U.slate, marginTop: 10}}>↓ same calculation</div>
    <div style={{fontFamily: UF.head, fontSize: 56, fontWeight: 800, color: deep(U.blue), marginTop: 6, opacity: ip(f, [at, at + 12], [0, 1])}}>731 904</div>
  </div>
);

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(3)), B = vis(f, L.c(3) - 4, L.c(5)), C = vis(f, L.c(5) - 4, L.c(8)), D = vis(f, L.c(8) - 4, L.dur);
  const ring = (f % 900) / 900;
  const key = ip(f, [L.w(3, 'Secret'), L.w(3, 'Secret') + 30], [0, 1], EIO);
  return (
    <>
      <Header f={f} dur={L.dur} n="07" title="AUTHENTICATOR APP OTP (TOTP)" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <OnText f={f} a={6} y={180} size={46} color={'#7C5CFF'} text="OTP WITHOUT ANY SMS" />
          <div style={{position: 'absolute', left: 1370 - 130, top: 290, opacity: on(L.c(1))}}>
            <svg width={260} height={260} viewBox="0 0 260 260"><circle cx={130} cy={130} r={110} fill="#fff" stroke="rgba(15,23,42,0.08)" strokeWidth={18} /><circle cx={130} cy={130} r={110} fill="none" stroke={U.cyan} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${691 * (1 - ring)} 691`} transform="rotate(-90 130 130)" /><text x={130} y={142} textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight={800} fontSize={44} fill="#0F172A">30 sec</text></svg>
          </div>
          <OnText f={f} a={L.w(1, 'Internet')} b={L.c(2)} y={600} size={30} color={U.green} text="NEW CODE EVERY 30 SECONDS · WORKS OFFLINE ✈" />
          <OnText f={f} a={L.c(2)} y={600} size={32} color={'#7C5CFF'} text="TOTP = TIME-BASED ONE-TIME PASSWORD" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(3)} y={170} size={40} color={U.blue} text="ONE-TIME SETUP" />
          <div style={{position: 'absolute', left: 980, top: 280, width: 300, padding: 20, borderRadius: 24, background: '#fff', textAlign: 'center', boxShadow: '0 14px 32px rgba(30,45,90,0.15)', opacity: on(L.c(3))}}>
            <div style={{fontSize: 20, fontWeight: 800, color: U.ink}}>🌐 Website</div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 12, opacity: on(L.w(4, 'QR'))}}><DemoQR size={170} seed={11} /></div>
          </div>
          <div style={{position: 'absolute', left: 1460, top: 280, width: 300, padding: 20, borderRadius: 24, background: '#0F172A', color: '#fff', textAlign: 'center', boxShadow: '0 14px 32px rgba(30,45,90,0.2)', opacity: on(L.c(3) + 8)}}>
            <div style={{fontSize: 20, fontWeight: 800}}>📱 Your app</div>
            <div style={{fontSize: 90, marginTop: 20}}>{f >= L.w(4, 'Save') ? '🔑' : '📷'}</div>
            <div style={{fontSize: 18, opacity: 0.8}}>{f >= L.w(4, 'Save') ? 'secret key saved' : 'scan the QR'}</div>
          </div>
          <div style={{position: 'absolute', left: 1290 + 150 * key - 30, top: 380, fontSize: 60, opacity: key > 0 && key < 1 ? 1 : 0}}>🔑</div>
          <OnText f={f} a={L.w(3, 'Secret')} y={620} size={30} color={U.saffron} text="BOTH SIDES SHARE ONE SECRET KEY" />
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C}}>
          <Calc x={X0 + 50} title="Your app" icon="phone" color={U.blue} t={on(L.c(5))} f={f} at={L.c(5) + 40} />
          <Calc x={X0 + 510} title="Server" icon="server" color="#7C5CFF" t={on(L.c(6))} f={f} at={L.c(6) + 30} />
          <div style={{position: 'absolute', left: 1370 - 180, top: 640, width: 360, padding: '18px 0', borderRadius: 20, background: U.green, color: '#fff', textAlign: 'center', fontFamily: UF.ui, fontWeight: 800, fontSize: 30, opacity: on(L.w(7, 'Match')), boxShadow: '0 14px 30px rgba(34,197,94,0.35)'}}>✓ Codes match → Login</div>
        </div>
      )}
      {D > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: D, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(8)} y={180} size={38} color={U.saffron} text="PHONE TIME MUST BE CORRECT" />
          <div style={{position: 'absolute', left: X0 + 80, top: 300, width: XW - 160, height: 60, borderRadius: 30, background: 'rgba(15,23,42,0.06)', opacity: on(L.c(9))}}>
            <div style={{position: 'absolute', left: '35%', width: '30%', height: '100%', borderRadius: 30, background: `${U.green}55`, border: `3px solid ${U.green}`, boxSizing: 'border-box'}} />
            <div style={{position: 'absolute', left: '50%', top: -16, width: 4, height: 92, background: U.ink}} />
          </div>
          <div style={{position: 'absolute', left: X0, top: 400, width: XW, textAlign: 'center', fontSize: 26, fontWeight: 800, color: deep(U.green), opacity: on(L.c(9) + 10)}}>a small time difference is still accepted</div>
          <div style={{position: 'absolute', left: X0, top: 480, width: XW, textAlign: 'center', fontSize: 80, opacity: on(L.c(8)) * ip(f, [L.c(10) - 10, L.c(10)], [1, 0])}}>🕘 ⇄ 🕘</div>
          <div style={{position: 'absolute', left: X0 + 120, top: 520, width: XW - 240, padding: '24px 28px', borderRadius: 24, background: '#fff', border: `3px solid ${U.green}`, boxShadow: '0 14px 30px rgba(30,45,90,0.14)', opacity: on(L.c(10))}}>
            <div style={{fontFamily: UF.head, fontSize: 32, fontWeight: 800, color: deep(U.green)}}>🛡 Not tied to your SIM</div>
            <div style={{fontSize: 22, color: U.slate, marginTop: 6}}>so a SIM-swap fraud can't receive these codes</div>
          </div>
        </div>
      )}
    </>
  );
};
