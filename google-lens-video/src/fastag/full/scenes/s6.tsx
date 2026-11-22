import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {History} from '../screens';
import {Edges, Header, NodeBox, OnText, Panel, X0, XW, P, vis} from '../../../upi/full/kit';
import {EIO, EO, ip} from '../../../anim';

const S = sc('s6'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => (
  <History f={f} rows={[
    {t: 'Today · 09:41 · Class VC4 (Car)', place: 'Demo Toll Plaza', amt: '−₹95'},
    {t: 'Yesterday · 18:10 · Class VC4 (Car)', place: 'Demo Plaza East', amt: '−₹60'},
    {t: 'Yesterday · 18:10 · Class VC7 (Truck)', place: 'Demo Plaza East', amt: '−₹320', col: U.red, flag: 'Wrong class?', at: L.c(5)},
  ]} />
);

const CLS: [string, string, string, number, number][] = [
  ['🚗', 'Car / Jeep / Van', 'Car', 95, 0], ['🚐', 'Light Commercial', 'Light', 150, 1], ['🚌', 'Bus', 'Bus', 320, 2], ['🚚', 'Truck', 'Truck', 320, 3],
];

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4));
  const B = vis(f, L.c(4) - 4, L.dur);
  const max = 320;
  return (
    <>
      <Header f={f} dur={L.dur} n="06" title="HOW THE TOLL AMOUNT IS DECIDED" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={56} text="WHO DECIDES THE AMOUNT?" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: X0 + 20, top: 170, width: XW - 40, display: 'flex', justifyContent: 'space-between'}}>
            {CLS.map(([e, label, w]) => {
              const t = on(L.w(1, w));
              const big = f >= L.c(3) && (w === 'Truck' || w === 'Car');
              return (
                <div key={label} style={{width: 205, padding: '18px 0', borderRadius: 22, background: '#fff', boxShadow: big ? `0 0 0 3px ${U.blue}55, 0 16px 34px rgba(30,45,90,0.2)` : '0 12px 28px rgba(30,45,90,0.14)', textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 20}px) scale(${big ? 1.05 : 1})`}}>
                  <div style={{fontSize: 64}}>{e}</div><div style={{fontSize: 19, fontWeight: 800, color: U.ink, marginTop: 6}}>{label}</div>
                </div>
              );
            })}
          </div>
          <Panel x={X0 + 60} y={430} w={XW - 120} t={on(L.c(2))}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, letterSpacing: 2, color: '#0F3A8A', marginBottom: 12}}><span>DEMO TOLL PLAZA · FEE BY CLASS</span><span style={{color: U.slate, letterSpacing: 0, fontWeight: 600}}>illustrative rates</span></div>
            {CLS.map(([e, label, w, fee, i]) => {
              const t = ip(f, [L.c(2) + 8 + i * 6, L.c(2) + 30 + i * 6], [0, 1], EIO);
              const hi = f >= L.c(3) && (w === 'Truck' || w === 'Car');
              return (
                <div key={label} style={{display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0'}}>
                  <span style={{width: 40, fontSize: 30}}>{e}</span>
                  <div style={{flex: 1, height: 30, borderRadius: 10, background: 'rgba(15,23,42,0.06)'}}>
                    <div style={{width: `${(fee / max) * 100 * t}%`, height: '100%', borderRadius: 10, background: hi ? `linear-gradient(90deg, ${U.blue}, ${U.cyan})` : '#94A3B8'}} />
                  </div>
                  <span style={{width: 80, textAlign: 'right', fontSize: 22, fontWeight: 800, color: hi ? deep(U.blue) : U.ink, opacity: t}}>₹{fee}</span>
                </div>
              );
            })}
          </Panel>
          <OnText f={f} a={L.c(3)} b={L.c(4)} y={860} size={34} color={U.blue} text="BIGGER VEHICLE → HIGHER TOLL" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: X0, top: 200, width: XW, display: 'flex', justifyContent: 'center', gap: 24}}>
            {[['↩️', 'Return journey', 'Return'], ['📅', 'Monthly pass', 'Monthly']].map(([e, l, w]) => {
              const t = on(L.w(4, w));
              return <div key={l} style={{padding: '18px 30px', borderRadius: 20, background: '#fff', boxShadow: '0 12px 28px rgba(30,45,90,0.14)', fontSize: 26, fontWeight: 800, color: U.ink, opacity: t, transform: `translateY(${(1 - t) * 16}px)`}}>{e} {l}</div>;
            })}
          </div>
          <OnText f={f} a={L.c(4) + 10} b={L.c(5)} y={320} size={24} color={U.slate} text="options available at some plazas · rules can change" />
          <Edges f={f} edges={[[[1130, 620] as P, [1610, 620] as P, L.w(5, 'Complaint')]]} />
          <NodeBox x={1100} y={620} t={on(L.c(5))} label="Wrong class charged?" sub="keep the SMS / details" icon="warn" color={U.red} w={240} />
          <NodeBox x={1640} y={620} t={on(L.w(5, 'Issuer'))} label="Issuer Bank" sub="raise a complaint" icon="bank" color={U.green} w={220} />
        </div>
      )}
    </>
  );
};
