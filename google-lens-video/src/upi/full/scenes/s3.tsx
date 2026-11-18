import React from 'react';
import {U, UF, deep} from '../../theme';
import {sc, loc} from '../tl';
import {PayScreen} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, X0, XW, P} from '../kit';
import {ip} from '../../../anim';

const S = sc('s3'); const L = loc(S);
const N: Record<string, P> = {app: [985, 250], psp: [985, 520], rem: [985, 790], npci: [1370, 520], ppsp: [1755, 520], rcv: [1755, 250], ben: [1755, 790]};

export const Screen: React.FC<{f: number}> = ({f}) => <PayScreen f={f} payAt={L.w(8, 'Button')} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1]);
  const ap = {app: L.c(1), psp: L.w(2, 'Payment'), ppsp: L.c(3), rem: L.c(4), ben: L.c(5), npci: L.w(6, 'NPCI'), rcv: L.c(5) + 10};
  const act = (k: string) => {
    if (f >= L.c(8)) return true;
    if (k === 'app') return f >= L.c(1) && f < L.c(2);
    if (k === 'psp' || k === 'ppsp') return f >= L.c(2) && f < L.c(4);
    if (k === 'rem') return f >= L.c(4) && f < L.c(5);
    if (k === 'ben' || k === 'rcv') return f >= L.c(5) && f < L.c(6);
    if (k === 'npci') return f >= L.c(6);
    return false;
  };
  const E = (a: string, b: string): [P, P, number] => [N[a], N[b], Math.max(ap[a as keyof typeof ap], ap[b as keyof typeof ap])];
  const live = f >= L.c(7);
  return (
    <>
      <Header f={f} dur={L.dur} n="03" title="THE MAIN COMPONENTS OF UPI" />
      <OnText f={f} a={6} b={L.c(1)} y={420} size={64} text="THE UPI ECOSYSTEM" />
      <Edges f={f} live={live} edges={[E('app', 'psp'), E('psp', 'npci'), E('npci', 'rem'), E('npci', 'ppsp'), E('ppsp', 'rcv'), E('npci', 'ben')]} />
      <NodeBox x={N.app[0]} y={N.app[1]} t={on(ap.app)} label="Payer App" sub="you start here" icon="phone" color={U.blue} active={act('app')} />
      <NodeBox x={N.psp[0]} y={N.psp[1]} t={on(ap.psp)} label="Payer PSP" sub="Payment Service Provider" icon="server" color="#7C5CFF" active={act('psp')} w={220} />
      <NodeBox x={N.rem[0]} y={N.rem[1]} t={on(ap.rem)} label="Remitter Bank" sub="Sender's bank" icon="bank" color={U.cyan} active={act('rem')} />
      <NodeBox x={N.npci[0]} y={N.npci[1]} t={on(ap.npci)} big w={250} label="NPCI UPI Switch" sub="routing & coordination" icon="switch" color={U.saffron} active={act('npci')} />
      <NodeBox x={N.ppsp[0]} y={N.ppsp[1]} t={on(ap.ppsp)} label="Payee PSP" sub="receiver's side" icon="server" color="#7C5CFF" active={act('ppsp')} w={190} />
      <NodeBox x={N.rcv[0]} y={N.rcv[1]} t={on(ap.rcv)} label="Receiver" sub="merchant / person" icon="store" color={U.green} active={act('rcv')} w={190} />
      <NodeBox x={N.ben[0]} y={N.ben[1]} t={on(ap.ben)} label="Beneficiary Bank" sub="Receiver's bank" icon="bank" color={U.green} active={act('ben')} w={200} />
      {live && [0, 1, 2, 3].map((i) => {
        const routes: P[][] = [[N.app, N.psp, N.npci, N.rem], [N.rem, N.npci, N.ben], [N.ben, N.npci, N.ppsp, N.rcv], [N.npci, N.psp, N.app]];
        const per = 50, a = L.c(7) + i * 14 + Math.floor((f - L.c(7) - i * 14) / per) * per;
        return <Packet key={i} f={f} pts={routes[i]} a={a} b={a + 40} color={[U.cyan, U.blue, U.green, U.green][i]} label="✉" />;
      })}
      <OnText f={f} a={L.c(8)} y={880} size={30} color={U.cyan} text="APP • PSP • NPCI • BANKS" />
      <div style={{position: 'absolute', left: X0, top: 140, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: U.slate, opacity: ip(f, [L.c(1), L.c(1) + 14], [0, 1])}}>Simplified view · in some transactions one organisation can play more than one role</div>
    </>
  );
};
