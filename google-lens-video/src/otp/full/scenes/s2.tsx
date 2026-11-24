import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {LoginScreen} from '../screens';
import {Header, OnText, Panel, Row, X0, XW, vis, NodeBox} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s2'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <LoginScreen f={f} otpAt={L.c(6)} okAt={L.c(7) + 40} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4));
  const B = vis(f, L.c(4) - 4, L.c(5));
  const C = vis(f, L.c(5) - 4, L.c(8));
  const D = vis(f, L.c(8) - 4, L.dur);
  return (
    <>
      <Header f={f} dur={L.dur} n="02" title="WHAT IS AN OTP?" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: X0, top: 170, width: XW, textAlign: 'center', opacity: on(L.c(1))}}>
            <div style={{fontFamily: UF.head, fontSize: 82, fontWeight: 800, color: U.ink, whiteSpace: 'nowrap'}}><span style={{color: deep(U.blue)}}>O</span>ne-<span style={{color: deep(U.blue)}}>T</span>ime <span style={{color: deep(U.blue)}}>P</span>assword</div>
            <div style={{fontSize: 26, color: U.slate, marginTop: 6, opacity: on(L.w(1, 'सिर्फ़'))}}>a password that works only once</div>
          </div>
          {[['🔑', 'Normal password', 'same for a long time', '#64748B', L.c(2)], ['🔢', 'OTP', 'new every time · expires in minutes', U.blue, L.w(2, 'OTP')]].map(([e, t, s, c, at], i) => (
            <div key={t as string} style={{position: 'absolute', left: X0 + 40 + i * 450, top: 470, width: 420, padding: 26, borderRadius: 26, background: '#fff', boxShadow: '0 14px 32px rgba(30,45,90,0.14)', border: i ? `3px solid ${U.blue}` : undefined, opacity: on(at as number), transform: `translateY(${(1 - on(at as number)) * 20}px)`}}>
              <div style={{fontSize: 54}}>{e as string}</div>
              <div style={{fontFamily: UF.head, fontSize: 32, fontWeight: 800, color: deep(c as string), marginTop: 6}}>{t as string}</div>
              <div style={{fontSize: 20, color: U.slate, marginTop: 6}}>{s as string}</div>
              {i === 1 && <div style={{marginTop: 12, fontSize: 22, fontWeight: 800, color: deep(U.saffron), opacity: on(L.c(3))}}>⏱ expires in ~5 minutes</div>}
            </div>
          ))}
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(4)} y={190} size={40} color={U.blue} text="WHERE YOU SEE OTPs" />
          <div style={{position: 'absolute', left: X0 + 40, top: 320, width: XW - 80, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22}}>
            {[['💳', 'Online payment', 'Online'], ['🏦', 'Bank login', 'Bank'], ['📱', 'App sign-up', 'Sign'], ['🔁', 'Password reset', 'Reset']].map(([e, t, w]) => {
              const x = on(L.w(4, w));
              return <div key={t} style={{padding: '24px 26px', borderRadius: 22, background: '#fff', boxShadow: '0 12px 28px rgba(30,45,90,0.13)', display: 'flex', alignItems: 'center', gap: 18, opacity: x, transform: `scale(${0.9 + 0.1 * x})`}}><span style={{fontSize: 50}}>{e}</span><span style={{fontSize: 28, fontWeight: 800, color: U.ink}}>{t}</span></div>;
            })}
          </div>
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C}}>
          <OnText f={f} a={L.c(5)} y={170} size={42} color={U.blue} text="TWO-FACTOR AUTHENTICATION" />
          <NodeBox x={1130} y={430} t={on(L.w(6, 'Password'))} label="Something you know" sub="your password" icon="key" color="#64748B" w={280} big />
          <div style={{position: 'absolute', left: 1330, top: 400, fontFamily: UF.head, fontSize: 60, fontWeight: 800, color: U.slate, opacity: on(L.w(6, 'Phone'))}}>+</div>
          <NodeBox x={1610} y={430} t={on(L.w(6, 'Phone'))} label="Something you have" sub="your phone (OTP)" icon="phone" color={U.blue} w={280} big active={f >= L.c(6)} />
          <Panel x={X0 + 120} y={620} w={XW - 240} t={on(L.c(7))} glow={U.green}>
            <Row t={on(L.c(7))} ok={false} text="Password stolen…" size={26} />
            <Row t={on(L.c(7) + 30)} ok text="…but without your phone's OTP, no entry" size={26} />
          </Panel>
        </div>
      )}
      {D > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: D}}>
          <NodeBox x={1130} y={480} t={on(L.w(8, 'Email'))} label="Email OTP" sub="many apps" icon="mail" color={U.cyan} w={260} big />
          <NodeBox x={1610} y={480} t={on(L.w(8, 'SMS'))} label="SMS OTP" sub="most common in banking" icon="phone" color={U.green} w={280} big active />
        </div>
      )}
    </>
  );
};
