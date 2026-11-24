import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {OtpEntry} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, P, vis} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s10'); const L = loc(S);
const R: Record<string, P> = {srv: [1000, 400], gw: [1250, 400], ph: [1500, 400], chk: [1750, 400]};

export const Screen: React.FC<{f: number}> = ({f}) => <OtpEntry f={f} smsAt={L.w(5, 'Phone') - 10} typeAt={L.c(6)} okAt={L.w(6, 'Approve')} resendFrom={-900} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4)), B = vis(f, L.c(4) - 4, L.c(7)), C = vis(f, L.c(7) - 4, L.dur + 30);
  const like = on(L.w(7, 'Like')), sub = on(L.w(7, 'Subscribe')), ty = on(L.c(8) + 10);
  return (
    <>
      <Header f={f} dur={L.dur} n="10" title="THE FUTURE & SUMMARY" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A}}>
          <OnText f={f} a={6} y={180} size={44} color={'#7C5CFF'} text="NEW WAYS TO LOG IN" />
          <NodeBox x={1150} y={430} t={on(L.w(1, 'Passkeys'))} label="Passkeys" sub="no code to type" icon="key" color={'#7C5CFF'} w={260} big />
          <NodeBox x={1590} y={430} t={on(L.w(1, 'Biometric'))} label="Biometric" sub="fingerprint / face" icon="finger" color={U.blue} w={260} big />
          <OnText f={f} a={L.c(2)} b={L.c(3)} y={620} size={30} color={U.green} text="MUCH HARDER TO TRICK ON FAKE WEBSITES" />
          <OnText f={f} a={L.c(3)} y={620} size={32} color={U.blue} text="TODAY, OTP IS STILL AN IMPORTANT LAYER 🛡" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B}}>
          <OnText f={f} a={L.c(4)} y={180} size={40} color={U.blue} text="RECAP" />
          <Edges f={f} live edges={[[R.srv, R.gw, L.c(5)], [R.gw, R.ph, L.w(5, 'Phone')], [R.ph, R.chk, L.c(6)]]} />
          <NodeBox x={R.srv[0]} y={R.srv[1]} t={on(L.c(4))} label="Random OTP" sub="saved with expiry" icon="server" color="#7C5CFF" w={210} />
          <NodeBox x={R.gw[0]} y={R.gw[1]} t={on(L.c(5))} label="Gateway + network" icon="antenna" color={U.saffron} w={210} />
          <NodeBox x={R.ph[0]} y={R.ph[1]} t={on(L.w(5, 'Phone'))} label="Your phone" icon="phone" color={U.blue} w={200} />
          <NodeBox x={R.chk[0]} y={R.chk[1]} t={on(L.c(6))} label="Check & approve" icon="check" color={U.green} w={210} active={f >= L.w(6, 'Approve')} />
          <Packet f={f} pts={[R.srv, R.gw, R.ph]} a={L.c(5)} b={L.w(5, 'Phone') + 10} color={U.cyan} label="✉" />
          <Packet f={f} pts={[R.ph, R.chk]} a={L.c(6) + 10} b={L.w(6, 'Approve')} color={U.green} label="🔒" />
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C}}>
          <div style={{position: 'absolute', left: 880, top: 330, width: 980, textAlign: 'center'}}>
            <div style={{fontFamily: UF.head, fontWeight: 800, fontSize: 88, letterSpacing: 2, whiteSpace: 'nowrap', color: U.ink, opacity: on(L.c(7) - 10), textShadow: '0 10px 40px rgba(255,255,255,0.9)'}}>
              HOW <span style={{background: `linear-gradient(90deg, ${U.blue}, #7C5CFF)`, WebkitBackgroundClip: 'text', color: 'transparent'}}>OTP</span> WORKS
            </div>
            <div style={{fontFamily: UF.ui, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: '#0F3A8A', marginTop: 18, opacity: on(L.c(7))}}>SIX DIGITS · ONE BIG SECURITY SYSTEM</div>
          </div>
          <div style={{position: 'absolute', left: 880, top: 600, width: 980, display: 'flex', justifyContent: 'center', gap: 26, fontFamily: UF.ui}}>
            <span style={{padding: '16px 34px', borderRadius: 40, background: U.blue, color: '#fff', fontWeight: 800, fontSize: 30, opacity: like, transform: `scale(${0.8 + 0.2 * like})`}}>👍 Like</span>
            <span style={{padding: '16px 34px', borderRadius: 40, background: U.red, color: '#fff', fontWeight: 800, fontSize: 30, opacity: sub, transform: `scale(${0.8 + 0.2 * sub})`}}>🔔 Subscribe</span>
          </div>
          <div style={{position: 'absolute', left: 880, top: 740, width: 980, textAlign: 'center', fontFamily: UF.head, fontWeight: 800, fontSize: 56, color: deep(U.green), opacity: ty}}>Thank you!</div>
        </div>
      )}
    </>
  );
};
