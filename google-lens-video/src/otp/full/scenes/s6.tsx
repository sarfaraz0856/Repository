import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {OtpEntry, SHOP, BANK} from '../screens';
import {Edges, Header, NodeBox, OnText, Panel, Packet, Row, X0, XW, P, vis} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';
import {CODE} from '../../OtpSample';

const S = sc('s6'); const L = loc(S);
const N: Record<string, P> = {app: [1060, 260], srv: [1680, 260]};

export const Screen: React.FC<{f: number}> = ({f}) => <OtpEntry f={f} typeAt={L.c(0) + 20} failAt={f < L.c(6) ? L.c(4) : 1e9} okAt={L.c(6)} resendFrom={-900} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4)), B = vis(f, L.c(4) - 4, L.c(6)), C = vis(f, L.c(6) - 4, L.c(8)), D = vis(f, L.c(8) - 4, L.dur);
  const tries = [L.c(4) + 10, L.c(4) + 30, L.c(5)];
  return (
    <>
      <Header f={f} dur={L.dur} n="06" title="HOW THE BANK CHECKS IT" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={56} text="YOU ENTERED THE OTP…" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A}}>
          <Edges f={f} live edges={[[N.app, N.srv, L.c(1)]]} />
          <NodeBox x={N.app[0]} y={N.app[1]} t={on(L.c(1))} label="App" sub="sends what you typed" icon="phone" color={U.blue} w={210} />
          <NodeBox x={N.srv[0]} y={N.srv[1]} t={on(L.c(1) + 8)} label="Auth Server" icon="server" color="#7C5CFF" w={210} active={f >= L.c(2)} />
          <Packet f={f} pts={[N.app, N.srv]} a={L.c(1) + 10} b={L.c(1) + 50} color={U.cyan} label="🔒" />
          <Panel x={X0 + 160} y={440} w={XW - 320} t={on(L.c(2))} glow={U.green}>
            <div style={{fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#0F3A8A', marginBottom: 4}}>SERVER CHECKS</div>
            <Row t={on(L.c(2) + 10)} ok text="Code matches" size={26} />
            <Row t={on(L.w(3, 'Expire'))} ok text="Not expired" size={26} />
            <Row t={on(L.w(3, 'पहले'))} ok text="Not used before" size={26} />
          </Panel>
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(4)} y={190} size={40} color={U.red} text="WRONG OTP? ATTEMPTS ARE LIMITED" />
          <div style={{position: 'absolute', left: X0, top: 330, width: XW, display: 'flex', justifyContent: 'center', gap: 30}}>
            {tries.map((t, i) => <div key={i} style={{width: 150, height: 150, borderRadius: 75, background: f >= t ? '#FEE2E2' : '#fff', border: `4px solid ${f >= t ? U.red : 'rgba(15,23,42,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, fontWeight: 800, color: U.red, boxShadow: '0 12px 28px rgba(30,45,90,0.12)'}}>{f >= t ? '✕' : i + 1}</div>)}
          </div>
          <div style={{position: 'absolute', left: 1370 - 260, top: 560, width: 520, padding: '22px 0', borderRadius: 22, background: '#0F172A', color: '#fff', textAlign: 'center', fontSize: 28, fontWeight: 800, opacity: on(L.w(5, 'Block'))}}>🔒 OTP blocked · try again later</div>
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: 1370 - 170, top: 210, width: 340, height: 340, borderRadius: 170, background: `linear-gradient(140deg, #16A34A, ${U.green})`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: on(L.c(6)), transform: `scale(${0.85 + 0.15 * on(L.c(6))})`, boxShadow: '0 24px 50px rgba(34,197,94,0.35)'}}>
            <div style={{fontSize: 120, fontWeight: 800, lineHeight: 1}}>✓</div><div style={{fontSize: 30, fontWeight: 800}}>Approved</div>
          </div>
          <div style={{position: 'absolute', left: 1370 - 230, top: 620, width: 460, padding: '18px 0', borderRadius: 18, background: '#fff', border: `3px dashed ${U.red}`, textAlign: 'center', opacity: on(L.c(7))}}>
            <span style={{fontFamily: 'monospace', fontSize: 34, fontWeight: 800, color: U.slate, textDecoration: 'line-through'}}>{CODE}</span>
            <span style={{fontSize: 24, fontWeight: 800, color: deep(U.red), marginLeft: 16}}>USED · won't work again</span>
          </div>
        </div>
      )}
      {D > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: D, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: X0 + 60, top: 200, width: XW - 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: on(L.c(8))}}>
            <span style={{padding: '16px 22px', borderRadius: 16, background: '#fff', fontFamily: 'monospace', fontSize: 34, fontWeight: 800, boxShadow: '0 10px 24px rgba(30,45,90,0.12)'}}>{CODE}</span>
            <span style={{fontSize: 34}}>🔗</span>
            <span style={{padding: '16px 22px', borderRadius: 16, background: U.green, color: '#fff', fontSize: 26, fontWeight: 800}}>₹499 · {SHOP}</span>
          </div>
          <div style={{position: 'absolute', left: X0, top: 300, width: XW, textAlign: 'center', fontSize: 24, fontWeight: 800, color: deep(U.red), opacity: on(L.w(8, 'दूसरे'))}}>✕ won't work for any other payment</div>
          <Panel x={X0 + 140} y={430} w={XW - 280} t={on(L.c(9))} glow={U.blue}>
            <div style={{padding: '8px 14px', borderRadius: 12, background: '#F1F5F9', fontSize: 18, color: U.slate}}>🔒 secure.{BANK.toLowerCase().replace(' ', '')}.example/verify</div>
            <div style={{fontFamily: UF.head, fontSize: 30, fontWeight: 800, marginTop: 14}}>Card payment verification</div>
            <div style={{fontSize: 20, color: U.slate, marginTop: 6}}>Often done on your bank's own secure page</div>
          </Panel>
          <OnText f={f} a={L.c(10)} y={760} size={30} color={'#7C5CFF'} text="LOGIN OTP ↔ THAT SAME LOGIN SESSION ONLY" />
        </div>
      )}
    </>
  );
};
