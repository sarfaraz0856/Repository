import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {OtpEntry, SENDER} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, X0, XW, P, vis} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s5'); const L = loc(S);
const N: Record<string, P> = {srv: [990, 400], gw: [1240, 400], op: [1490, 400], ph: [1740, 400]};

export const Screen: React.FC<{f: number}> = ({f}) => <OtpEntry f={f} smsAt={L.c(4)} autoAt={L.w(6, 'Autofill')} resendFrom={L.c(1)} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(5)), B = vis(f, L.c(5) - 4, L.c(7)), C = vis(f, L.c(7) - 4, L.dur);
  return (
    <>
      <Header f={f} dur={L.dur} n="05" title="HOW IT REACHES YOUR PHONE" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A}}>
          <OnText f={f} a={6} b={L.c(1)} y={200} size={44} text="FROM SERVER TO YOUR PHONE" />
          <Edges f={f} live={f >= L.c(1)} edges={[[N.srv, N.gw, L.c(1)], [N.gw, N.op, L.c(2)], [N.op, N.ph, L.c(3)]]} />
          <NodeBox x={N.srv[0]} y={N.srv[1]} t={on(L.c(1) - 6)} label="Auth Server" icon="server" color="#7C5CFF" w={200} active={f >= L.c(1) && f < L.c(2)} />
          <NodeBox x={N.gw[0]} y={N.gw[1]} t={on(L.c(1) + 4)} label="SMS Gateway" icon="switch" color={U.saffron} w={200} active={f >= L.c(1) + 20 && f < L.c(3)} />
          <NodeBox x={N.op[0]} y={N.op[1]} t={on(L.c(2))} label="SMS Center" sub="telecom operator" icon="antenna" color={U.cyan} w={200} active={f >= L.c(2) + 20 && f < L.c(4)} />
          <NodeBox x={N.ph[0]} y={N.ph[1]} t={on(L.c(3))} label="Your Phone" icon="phone" color={U.green} w={200} active={f >= L.c(4)} />
          <Packet f={f} pts={[N.srv, N.gw]} a={L.c(1) + 10} b={L.c(1) + 40} color={U.cyan} label="✉" />
          <Packet f={f} pts={[N.gw, N.op]} a={L.c(2) + 10} b={L.c(2) + 40} color={U.cyan} label="✉" />
          <Packet f={f} pts={[N.op, N.ph]} a={L.w(3, 'Deliver') - 10} b={L.w(3, 'Deliver') + 20} color={U.green} label="✉" />
          <OnText f={f} a={L.w(3, 'Store')} b={L.c(4)} y={560} size={28} color={U.cyan} text="STORE → FORWARD → DELIVER" />
          <OnText f={f} a={L.c(4)} y={560} size={34} color={U.green} text="⚡ USUALLY WITHIN SECONDS" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(5)} y={170} size={38} color={U.blue} text="CHECK WHO SENT IT" />
          {[[SENDER, 'registered sender ID of the bank', true], ['+91 98XXX XX107', 'a random number', false]].map(([n, s, ok], i) => (
            <div key={n as string} style={{position: 'absolute', left: X0 + 60 + i * 440, top: 280, width: 400, padding: 24, borderRadius: 24, background: '#fff', border: `3px solid ${ok ? U.green : U.red}`, boxShadow: '0 12px 28px rgba(30,45,90,0.13)', opacity: on(L.c(5) + i * 14)}}>
              <div style={{fontFamily: 'monospace', fontSize: 30, fontWeight: 800, color: U.ink}}>{n as string}</div>
              <div style={{fontSize: 19, color: U.slate, marginTop: 6}}>{s as string}</div>
              <div style={{fontSize: 24, fontWeight: 800, marginTop: 10, color: ok ? deep(U.green) : deep(U.red)}}>{ok ? '✓ expected for bank OTPs' : '✕ be careful'}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: X0 + 160, top: 560, width: XW - 320, padding: '22px 26px', borderRadius: 22, background: '#E0F2FE', color: '#0369A1', fontSize: 26, fontWeight: 800, textAlign: 'center', opacity: on(L.c(6))}}>✨ OTP Autofill: the phone reads the code from the SMS and fills it in</div>
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(7)} y={170} size={38} color={U.saffron} text="SOMETIMES IT TAKES LONGER" />
          <div style={{position: 'absolute', left: X0, top: 290, width: XW, display: 'flex', justifyContent: 'center', gap: 30}}>
            {[['⏳', 'Network busy', L.w(7, 'Busy')], ['✈️', 'Roaming', L.c(8)]].map(([e, t, at]) => (
              <div key={t as string} style={{width: 330, padding: '28px 0', borderRadius: 24, background: '#fff', boxShadow: '0 12px 28px rgba(30,45,90,0.13)', textAlign: 'center', opacity: on(at as number)}}><div style={{fontSize: 70}}>{e as string}</div><div style={{fontSize: 28, fontWeight: 800, color: U.ink, marginTop: 8}}>{t as string}</div></div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 1370 - 200, top: 600, width: 400, padding: '20px 0', borderRadius: 20, background: f >= L.w(9, 'Active') ? U.blue : '#CBD5E1', color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 28, opacity: on(L.c(9))}}>↻ Resend OTP {f >= L.w(9, 'Active') ? '' : '(0:30)'}</div>
        </div>
      )}
    </>
  );
};
