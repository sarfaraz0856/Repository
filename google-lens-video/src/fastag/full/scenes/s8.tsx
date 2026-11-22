import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AppHome, Recharge} from '../screens';
import {Edges, Header, NodeBox, OnText, Panel, X0, XW, P, vis} from '../../../upi/full/kit';
import {EIO, EO, ip} from '../../../anim';

const S = sc('s8'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => f < L.c(4)
  ? <Recharge f={f} payAt={L.w(2, 'UPI')} okAt={L.w(2, 'UPI') + 18} />
  : <AppHome f={f} from={40} to={540} at={L.c(4) + 50} hi="Recharge" />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4));
  const B = vis(f, L.c(4) - 4, L.dur);
  const fill = ip(f, [L.c(1) + 10, L.c(2)], [0.08, 0.8], EIO);
  return (
    <>
      <Header f={f} dur={L.dur} n="08" title="HOW FASTAG RECHARGE WORKS" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={60} text="RECHARGE" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          {/* prepaid wallet filling up */}
          <div style={{position: 'absolute', left: 1370 - 110, top: 170, width: 220, opacity: on(L.c(1))}}>
            <div style={{height: 220, borderRadius: 30, border: `6px solid ${U.blue}`, position: 'relative', overflow: 'hidden', background: '#fff'}}>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fill * 100}%`, background: `linear-gradient(180deg, ${U.cyan}, ${U.blue})`}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 800, color: fill > 0.5 ? '#fff' : U.ink}}>₹</div>
            </div>
            <div style={{textAlign: 'center', marginTop: 10, fontSize: 22, fontWeight: 800, color: deep(U.blue)}}>Prepaid wallet</div>
          </div>
          <div style={{position: 'absolute', left: X0 + 20, top: 520, width: XW - 40, display: 'flex', justifyContent: 'space-between'}}>
            {[['🏦', "Issuer bank's app", 'Issuer'], ['💻', 'Net banking', 'Net'], ['📱', 'UPI payment apps', 'UPI']].map(([e, l, w]) => {
              const t = on(L.w(2, w));
              return <div key={l} style={{width: 285, padding: '20px 0', borderRadius: 22, background: '#fff', boxShadow: '0 12px 28px rgba(30,45,90,0.14)', textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 18}px)`}}><div style={{fontSize: 54}}>{e}</div><div style={{fontSize: 21, fontWeight: 800, color: U.ink, marginTop: 6}}>{l}</div></div>;
            })}
          </div>
          <OnText f={f} a={L.c(3)} y={760} size={28} color={U.green} text="SOME BANKS ALSO LET YOU LINK A BANK ACCOUNT DIRECTLY" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B}}>
          <Edges f={f} live edges={[[[1110, 400] as P, [1630, 400] as P, L.c(4)]]} />
          <NodeBox x={1080} y={400} t={on(L.c(4))} label="Recharge done" icon="check" color={U.green} w={210} />
          <NodeBox x={1660} y={400} t={on(L.c(4) + 10)} label="Balance updated" sub="can take a little time" icon="clock" color={U.saffron} w={230} active={f >= L.c(4) + 50} />
          <Panel x={X0 + 160} y={600} w={XW - 320} t={on(L.c(5))} glow={U.blue}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <div style={{fontSize: 60}}>🛣️</div>
              <div><div style={{fontFamily: UF.head, fontSize: 30, fontWeight: 800}}>Long trip ahead?</div><div style={{fontSize: 22, color: U.slate, marginTop: 4}}>Recharge a little before you leave.</div></div>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
};
