import React from 'react';
import {U, UF} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {LoginScreen} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, X0, XW, P} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s3'); const L = loc(S);
const N: Record<string, P> = {app: [1010, 330], srv: [1370, 330], gw: [1730, 330], op: [1550, 660], ph: [1150, 660]};

export const Screen: React.FC<{f: number}> = ({f}) => <LoginScreen f={f} otpAt={L.c(5)} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const ap = {app: L.c(1), srv: L.c(2), gw: L.c(3), op: L.c(4), ph: L.c(5)};
  const order: (keyof typeof ap)[] = ['app', 'srv', 'gw', 'op', 'ph'];
  const act = (k: keyof typeof ap) => { const i = order.indexOf(k); return f >= L.c(6) || (f >= L.c(i + 1) && f < L.c(i + 2)); };
  const E = (a: keyof typeof ap, b: keyof typeof ap): [P, P, number] => [N[a], N[b], Math.max(ap[a], ap[b])];
  const live = f >= L.c(6);
  return (
    <>
      <Header f={f} dur={L.dur} n="03" title="THE MAIN PARTS" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={60} text="WHO DOES WHAT?" />
      <Edges f={f} live={live} edges={[E('app', 'srv'), E('srv', 'gw'), E('gw', 'op'), E('op', 'ph')]} />
      <NodeBox x={N.app[0]} y={N.app[1]} t={on(ap.app)} label="App / Website" sub="login or payment" icon="web" color={U.blue} active={act('app')} w={220} />
      <NodeBox x={N.srv[0]} y={N.srv[1]} t={on(ap.srv)} big w={250} label="Auth Server" sub="makes & checks the OTP" icon="server" color="#7C5CFF" active={act('srv')} />
      <NodeBox x={N.gw[0]} y={N.gw[1]} t={on(ap.gw)} label="SMS Gateway" sub="forwards the message" icon="switch" color={U.saffron} active={act('gw')} w={220} />
      <NodeBox x={N.op[0]} y={N.op[1]} t={on(ap.op)} label="Telecom Operator" sub="mobile network" icon="antenna" color={U.cyan} active={act('op')} w={230} />
      <NodeBox x={N.ph[0]} y={N.ph[1]} t={on(ap.ph)} label="Your Phone" sub="OTP arrives here" icon="phone" color={U.green} active={act('ph')} w={210} />
      {live && [0, 1].map((i) => {
        const per = 80, a = L.c(6) + i * 40 + Math.floor((f - L.c(6) - i * 40) / per) * per;
        return <Packet key={i} f={f} pts={[N.app, N.srv, N.gw, N.op, N.ph]} a={a} b={a + 70} color={U.cyan} label="🔒" />;
      })}
      <OnText f={f} a={L.c(6)} b={L.c(7)} y={850} size={30} color={U.cyan} text="SECURED AT EVERY STEP" />
      <OnText f={f} a={L.c(7)} y={850} size={30} color={U.blue} text="NOW, STEP BY STEP →" />
      <div style={{position: 'absolute', left: X0, top: 140, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: U.slate, opacity: on(L.c(1))}}>Simplified view of an SMS OTP system</div>
    </>
  );
};
