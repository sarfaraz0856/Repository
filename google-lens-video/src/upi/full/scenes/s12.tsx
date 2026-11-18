import React from 'react';
import {EIO, ip} from '../../../anim';
import {U, UF, deep} from '../../theme';
import {sc, loc} from '../tl';
import {PayScreen, Processing, Scanner, ScreenSeq, StatusScreen} from '../screens';
import {Edges, Header, Ledger, NodeBox, OnText, Packet, X0, XW, vis, P} from '../kit';

const S = sc('s12'); const L = loc(S);
const HUB: P = [1370, 480];
const RING: [string, string, string, string, P][] = [['Payer App', 'phone', U.blue, '', [1010, 250]], ['PSP', 'server', '#7C5CFF', '', [1010, 710]], ['Sender Bank', 'bank', U.cyan, '', [1730, 710]], ['Receiver Bank', 'bank', U.green, '', [1730, 250]]];

export const Screen: React.FC<{f: number}> = ({f}) => (
  <ScreenSeq f={f} seq={[
    [0, <Scanner f={f} det={L.w(0, 'Scan') + 10} />],
    [L.c(1), <PayScreen f={f} payAt={L.w(1, 'Button')} />],
    [L.c(2), <Processing f={f} a={L.c(2)} />],
    [L.c(3), <StatusScreen f={f} a={L.c(3)} kind="success" />],
  ]} />
);

export const Stage: React.FC<{f: number}> = ({f}) => {
  const net = vis(f, 4, L.c(6), 14, 16);
  const end = L.e(L.n - 1);
  const title1 = ip(f, [end - 10, end + 14], [0, 1]);
  const like = vis(f, L.c(6), end + 10, 14, 12);
  return (
    <>
      <Header f={f} dur={L.c(6)} n="12" title="THE COMPLETE UPI JOURNEY" />
      {net > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: net}}>
          <Edges f={f} live={f >= L.c(1)} edges={RING.map(([, , , , p], i): [P, P, number] => [p, HUB, 10 + i * 6])} />
          {RING.map(([n, ic, c, , p], i) => <NodeBox key={n} x={p[0]} y={p[1]} t={ip(f, [6 + i * 6, 20 + i * 6], [0, 1])} label={n} icon={ic} color={c} w={200} active={f >= L.c(3)} />)}
          <NodeBox x={HUB[0]} y={HUB[1]} big w={240} t={ip(f, [4, 18], [0, 1])} label="NPCI UPI Switch" icon="switch" color={U.saffron} active />
          <Packet f={f} pts={[RING[0][4], HUB, RING[2][4]]} a={L.w(1, 'Button')} b={L.w(1, 'Button') + 40} color={U.cyan} />
          <Packet f={f} pts={[RING[2][4], HUB, RING[3][4]]} a={L.w(2, 'Debit')} b={L.w(2, 'Credit')} color={U.blue} label="₹" />
          <Packet f={f} pts={[RING[3][4], HUB, RING[0][4]]} a={L.w(2, 'Status')} b={L.w(2, 'Status') + 40} color={U.green} label="✓" />
          <Ledger x={RING[2][4][0]} y={RING[2][4][1] + 70} t={ip(f, [L.c(2), L.c(2) + 12], [0, 1])} title="Sender A/c" from={5000} to={4900} at={L.w(2, 'Debit')} f={f} />
          <Ledger x={RING[3][4][0]} y={RING[3][4][1] - 160} t={ip(f, [L.c(2), L.c(2) + 12], [0, 1])} title="Receiver A/c" from={2000} to={2100} at={L.w(2, 'Credit')} f={f} />
          <OnText f={f} a={L.c(4)} b={L.c(6)} y={870} size={28} color={U.cyan} text="FROM LOCAL SHOPS TO ONLINE SHOPPING" />
        </div>
      )}
      {/* a QR that grows into a connected network */}
      {f >= L.c(5) - 4 && f < L.c(6) + 10 && (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(5) - 4, L.c(6) + 10, 14, 12)}}>
          {Array.from({length: 46}).map((_, i) => {
            const a = (i * 137.5 * Math.PI) / 180, r = 40 + Math.sqrt(i) * 62;
            const x = 1370 + Math.cos(a) * r * 1.25, y = 480 + Math.sin(a) * r * 0.85;
            const t = ip(f, [L.c(5) + i, L.c(5) + 10 + i], [0, 1]);
            return <g key={i} opacity={t}><line x1={1370} y1={480} x2={x} y2={y} stroke={U.blue} strokeOpacity={0.25} /><circle cx={x} cy={y} r={6} fill={[U.cyan, U.green, U.saffron, U.blue][i % 4]} style={{filter: 'drop-shadow(0 0 6px #00D9FF)'}} /></g>;
          })}
        </svg>
      )}
      <OnText f={f} a={L.c(5) + 10} b={L.c(6)} y={150} size={30} text="A CONNECTED FINANCIAL NETWORK" />
      {/* like + subscribe */}
      {like > 0.01 && (
        <div style={{position: 'absolute', left: X0, top: 380, width: XW, display: 'flex', justifyContent: 'center', gap: 30, opacity: like * (1 - title1), fontFamily: UF.ui}}>
          {[['👍  Like', U.blue, 'Like'], ['🔔  Subscribe', U.red, 'Subscribe']].map(([t, c, w]) => {
            const at = L.w(6, w);
            const done = f >= at + 6;
            return <div key={t} style={{padding: '22px 40px', borderRadius: 40, background: done ? c : '#fff', border: `2px solid ${c}`, color: done ? '#fff' : U.ink, fontSize: 34, fontWeight: 800, transform: `scale(${1 + 0.1 * Math.sin(Math.PI * ip(f, [at, at + 12], [0, 1]))})`, boxShadow: done ? `0 0 40px ${c}88` : undefined}}>{done && w === 'Subscribe' ? '✓ Subscribed' : t}</div>;
          })}
        </div>
      )}
      {/* final title */}
      {title1 > 0.01 && (
        <div style={{position: 'absolute', left: X0, top: 300, width: XW, textAlign: 'center'}}>
          <div style={{fontFamily: UF.head, fontWeight: 800, fontSize: 170, letterSpacing: 12, opacity: title1, transform: `translateY(${(1 - title1) * 30}px)`, background: `linear-gradient(90deg, ${U.cyan}, ${U.green})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>UPI</div>
          <div style={{height: 4, width: 520 * ip(f, [end, end + 30], [0, 1], EIO), margin: '6px auto 0', borderRadius: 2, background: `linear-gradient(90deg, ${U.saffron}, #fff, ${U.green})`}} />
          <div style={{fontFamily: UF.head, fontWeight: 800, fontSize: 46, color: U.ink, marginTop: 22, opacity: ip(f, [end + 8, end + 26], [0, 1])}}>MORE THAN JUST A PAYMENT APP</div>
          <div style={{fontFamily: UF.ui, fontWeight: 700, fontSize: 24, letterSpacing: 7, color: deep(U.cyan), marginTop: 18, opacity: ip(f, [end + 18, end + 36], [0, 1])}}>THE TECHNOLOGY BEHIND INSTANT PAYMENTS</div>
        </div>
      )}
    </>
  );
};
