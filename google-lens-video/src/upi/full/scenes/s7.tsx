import React from 'react';
import {EIO, ip} from '../../../anim';
import {U, UF, deep} from '../../theme';
import {sc, loc} from '../tl';
import {AppHome, PayScreen, ScreenSeq, StatusScreen} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, X0, XW, P} from '../kit';

const S = sc('s7'); const L = loc(S);
const APPS: P[] = [[985, 230], [985, 410], [985, 590], [985, 770]];
const BANKS: P[] = [[1760, 200], [1760, 345], [1760, 490], [1760, 635], [1760, 780]];
const HUB: P = [1370, 490];

export const Screen: React.FC<{f: number}> = ({f}) => (
  <ScreenSeq f={f} seq={[
    [0, <AppHome f={f} hi={1} />],
    [L.c(6), <PayScreen f={f} name="Ravi K. (demo)" vpa="ravi.k@otherapp-demo" amount="250" payAt={L.c(6) + 40} />],
    [L.c(7), <StatusScreen f={f} a={L.c(7)} kind="success" sub="Different app · different bank – still works" />],
  ]} />
);

export const Stage: React.FC<{f: number}> = ({f}) => {
  const nodes = ip(f, [L.c(1), L.c(1) + 20], [0, 1]);
  const mesh = Math.min(ip(f, [L.c(2), L.c(2) + 20], [0, 1], EIO), ip(f, [L.c(3), L.c(3) + 16], [1, 0], EIO));
  const hub = ip(f, [L.c(3), L.c(3) + 18], [0, 1], EIO);
  return (
    <>
      <Header f={f} dur={L.dur} n="07" title="WHAT IS NPCI AND WHY IS IT IMPORTANT?" />
      <OnText f={f} a={4} b={L.c(1)} y={400} size={110} color={U.saffron} text="NPCI ?" />
      {nodes > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: nodes}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {mesh > 0.01 && APPS.map((a, i) => BANKS.map((b, j) => <line key={`${i}${j}`} x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * mesh} y2={a[1] + (b[1] - a[1]) * mesh} stroke={U.red} strokeOpacity={0.55} strokeWidth={2} />))}
          </svg>
          {hub > 0.01 && <Edges f={f} live={f >= L.c(4)} edges={[...APPS.map((a): [P, P, number] => [a, HUB, L.c(3)]), ...BANKS.map((b): [P, P, number] => [HUB, b, L.c(3) + 6])]} />}
          {APPS.map((a, i) => <NodeBox key={i} x={a[0]} y={a[1]} w={170} t={1} label={`App ${'ABCD'[i]}`} sub="UPI app" icon="phone" color={U.blue} active={f >= L.c(6) && i === 0} />)}
          {BANKS.map((b, i) => <NodeBox key={i} x={b[0]} y={b[1]} w={160} t={1} label={`Bank ${i + 1}`} icon="bank" color={U.cyan} active={f >= L.c(6) && i === 3} />)}
          <NodeBox x={HUB[0]} y={HUB[1]} big w={240} t={hub} label="NPCI UPI Switch" sub="network junction" icon="switch" color={U.saffron} active={f >= L.c(4)} />
          {f >= L.c(4) && f < L.c(6) && [0, 1, 2, 3].map((i) => {
            const per = 44, a0 = L.c(4) + i * 11, a = a0 + Math.floor((f - a0) / per) * per;
            return <Packet key={i} f={f} pts={[APPS[i], HUB, BANKS[(i * 2 + 1) % 5]]} a={a} b={a + 36} color={[U.cyan, U.green, U.blue, U.saffron][i]} label="✉" />;
          })}
          {f >= L.c(6) && <Packet f={f} pts={[APPS[0], HUB, BANKS[3]]} a={L.c(6) + 10} b={L.c(6) + 50} color={U.green} label="₹" />}
        </div>
      )}
      <OnText f={f} a={L.c(2) + 10} b={L.c(3) + 4} y={880} size={34} color={U.red} text="EVERY APP ↔ EVERY BANK = TOO COMPLEX" />
      <OnText f={f} a={L.c(3) + 14} b={L.c(5)} y={880} size={34} color={U.green} text="INTEROPERABILITY" />
      <OnText f={f} a={L.c(5)} b={L.c(6)} y={880} size={30} color={U.saffron} text="AN INTELLIGENT NETWORK JUNCTION" />
      <OnText f={f} a={L.c(6)} b={L.dur} y={880} size={30} color={U.cyan} text="ONE CONNECTED PAYMENT ECOSYSTEM" />
      <div style={{position: 'absolute', left: X0, top: 120, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: U.slate, opacity: nodes}}>Generic apps and banks · conceptual network</div>
    </>
  );
};
