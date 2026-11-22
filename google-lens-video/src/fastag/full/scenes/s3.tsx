import React from 'react';
import {U, UF} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AppHome} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, X0, XW, P} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s3'); const L = loc(S);
const N: Record<string, P> = {tag: [1010, 330], reader: [1360, 330], plaza: [1720, 330], acq: [1720, 680], netc: [1360, 680], iss: [1010, 680]};

export const Screen: React.FC<{f: number}> = ({f}) => <AppHome f={f} hi={f >= L.c(5) && f < L.c(6) ? 'Tag details' : undefined} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const ap = {tag: L.c(1), reader: L.c(2), plaza: L.c(3), acq: L.c(4), iss: L.c(5), netc: L.w(6, 'NPCI')};
  const act = (k: keyof typeof ap) => {
    const order: (keyof typeof ap)[] = ['tag', 'reader', 'plaza', 'acq', 'iss', 'netc'];
    const i = order.indexOf(k);
    if (f >= L.c(6) + 30) return true;
    return f >= L.c(i + 1) && (i === 5 || f < L.c(i + 2));
  };
  const E = (a: keyof typeof ap, b: keyof typeof ap): [P, P, number] => [N[a], N[b], Math.max(ap[a], ap[b])];
  const live = f >= L.c(6) + 10;
  const route: P[] = [N.tag, N.reader, N.plaza, N.acq, N.netc, N.iss];
  return (
    <>
      <Header f={f} dur={L.dur} n="03" title="THE MAIN COMPONENTS" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={60} text="WHO DOES WHAT?" />
      <Edges f={f} live={live} edges={[E('tag', 'reader'), E('reader', 'plaza'), E('plaza', 'acq'), E('acq', 'netc'), E('netc', 'iss')]} />
      <NodeBox x={N.tag[0]} y={N.tag[1]} t={on(ap.tag)} label="FASTag" sub="unique Tag ID" icon="tag" color={U.green} active={act('tag')} />
      <NodeBox x={N.reader[0]} y={N.reader[1]} t={on(ap.reader)} label="RFID Reader" sub="antenna above the lane" icon="antenna" color={U.cyan} active={act('reader')} w={220} />
      <NodeBox x={N.plaza[0]} y={N.plaza[1]} t={on(ap.plaza)} label="Plaza System" sub="lane computer" icon="server" color="#7C5CFF" active={act('plaza')} w={210} />
      <NodeBox x={N.acq[0]} y={N.acq[1]} t={on(ap.acq)} label="Acquirer Bank" sub="toll plaza's bank" icon="bank" color={U.blue} active={act('acq')} w={210} />
      <NodeBox x={N.netc[0]} y={N.netc[1]} t={on(ap.netc)} big w={250} label="NPCI · NETC" sub="routes the messages" icon="switch" color={U.saffron} active={act('netc')} />
      <NodeBox x={N.iss[0]} y={N.iss[1]} t={on(ap.iss)} label="Issuer Bank" sub="your FASTag wallet" icon="wallet" color={U.green} active={act('iss')} w={210} />
      {live && [0, 1].map((i) => {
        const per = 70, a = L.c(6) + 10 + i * 35 + Math.floor((f - L.c(6) - 10 - i * 35) / per) * per;
        return <Packet key={i} f={f} pts={i ? [...route].reverse() : route} a={a} b={a + 60} color={i ? U.green : U.cyan} label="✉" />;
      })}
      <OnText f={f} a={L.c(6) + 30} b={L.c(7)} y={850} size={30} color={U.cyan} text="TAG • READER • PLAZA • ACQUIRER • NETC • ISSUER" />
      <div style={{position: 'absolute', left: X0, top: 830, width: XW, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontFamily: UF.ui, opacity: on(L.c(7))}}>
        {['Bank A tag', 'Bank B tag', 'Bank C tag'].map((b, i) => <span key={b} style={{padding: '10px 18px', borderRadius: 14, background: '#fff', boxShadow: '0 8px 20px rgba(30,45,90,0.12)', fontSize: 20, fontWeight: 800, color: U.ink, opacity: on(L.c(7) + i * 6)}}>🏷️ {b}</span>)}
        <span style={{fontSize: 30, color: U.slate}}>→</span>
        <span style={{padding: '10px 18px', borderRadius: 14, background: U.green, color: '#fff', fontSize: 20, fontWeight: 800, opacity: on(L.w(7, 'Toll'))}}>✓ every FASTag plaza</span>
      </div>
      <div style={{position: 'absolute', left: X0, top: 140, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: U.slate, opacity: on(L.c(1))}}>Simplified view of the NETC (FASTag) system</div>
    </>
  );
};
