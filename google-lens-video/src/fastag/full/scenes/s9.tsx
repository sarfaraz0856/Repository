import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {History} from '../screens';
import {Edges, Header, NodeBox, OnText, Panel, X0, XW, P, vis} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s9'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => (
  <History f={f} rows={[
    {t: 'Today · 09:41:02', place: 'Demo Toll Plaza', amt: '−₹95'},
    {t: 'Today · 09:41:05', place: 'Demo Toll Plaza', amt: '−₹95', col: U.red, flag: 'Duplicate?', at: L.c(3)},
    {t: 'Dispute raised', place: 'Complaint #DEMO-001', amt: '⏳', col: '#D97706', flag: 'Under review', at: L.w(4, 'Complaint')},
    {t: 'After verification', place: 'Refund', amt: '+₹95', col: U.green, flag: 'Refunded', at: L.w(6, 'Refund')},
  ]} />
);

const Spot: React.FC<{x: number; y: number; ok: boolean; t: number}> = ({x, y, ok, t}) => (
  <div style={{position: 'absolute', left: x - 34, top: y - 22, width: 68, height: 44, borderRadius: 8, background: '#fff', border: `3px solid ${ok ? U.green : U.red}`, opacity: t, transform: `scale(${0.8 + 0.2 * t})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: ok ? U.green : U.red, boxShadow: ok ? `0 0 24px ${U.green}` : undefined}}>{ok ? '✓' : '✕'}</div>
);

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(3));
  const B = vis(f, L.c(3) - 4, L.dur);
  return (
    <>
      <Header f={f} dur={L.dur} n="09" title="PROBLEMS & COMPLAINTS" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={56} text="SOMETHING WENT WRONG?" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(1)} b={L.c(2)} y={160} size={32} color={U.red} text="TAG NOT READ? DAMAGED OR IN THE WRONG PLACE" />
          <OnText f={f} a={L.c(2)} y={160} size={32} color={U.green} text="BEHIND THE REAR-VIEW MIRROR · CENTRE" />
          <div style={{position: 'absolute', left: 1000, top: 250, width: 740, height: 480, borderRadius: '46% 46% 16% 16% / 30% 30% 12% 12%', background: 'linear-gradient(170deg, rgba(191,219,254,0.95), rgba(147,197,253,0.75) 60%, rgba(96,165,250,0.7))', border: '16px solid #334155', opacity: on(L.c(1))}}>
            <div style={{position: 'absolute', left: '42%', top: 0, width: '16%', height: 64, background: '#334155', borderRadius: '0 0 10px 10px'}} />
            <div style={{position: 'absolute', left: '38%', top: 58, width: '24%', height: 42, borderRadius: 12, background: '#1F2937'}} />
          </div>
          <Spot x={1370} y={390} ok t={on(L.w(2, 'Mirror'))} />
          <Spot x={1120} y={620} ok={false} t={on(L.c(1) + 30)} />
          <Spot x={1620} y={650} ok={false} t={on(L.c(1) + 40)} />
          <div style={{position: 'absolute', left: 1370 - 120, top: 430, width: 240, textAlign: 'center', fontSize: 18, fontWeight: 800, color: deep(U.green), opacity: on(L.w(2, 'Mirror') + 8)}}>correct place</div>
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: X0 + 40, top: 180, width: 380}}>
            {[0, 1].map((i) => {
              const t = on(L.c(3) + i * 12);
              return <div key={i} style={{marginBottom: 14, padding: '14px 18px', borderRadius: 18, background: '#fff', borderLeft: `6px solid ${U.red}`, boxShadow: '0 10px 24px rgba(30,45,90,0.14)', fontSize: 18, color: U.ink, opacity: t, transform: `translateX(${(1 - t) * -20}px)`}}><b style={{color: deep(U.red)}}>−₹95</b> debited · Demo Toll Plaza · 09:41</div>;
            })}
            <div style={{fontSize: 22, fontWeight: 800, color: deep(U.red), opacity: on(L.c(3) + 26)}}>Same toll charged twice?</div>
          </div>
          <Edges f={f} live={f >= L.c(4)} edges={[[[1520, 260] as P, [1720, 470] as P, L.w(4, 'Issuer')], [[1720, 470] as P, [1520, 700] as P, L.w(6, 'Refund')]]} />
          <NodeBox x={1520} y={250} t={on(L.c(4))} label="Keep SMS & details" icon="mail" color={U.blue} w={220} />
          <NodeBox x={1740} y={470} t={on(L.w(4, 'Issuer'))} label="Issuer Bank" sub="complaint / dispute" icon="bank" color={U.saffron} w={200} />
          <NodeBox x={1520} y={700} t={on(L.w(6, 'Refund'))} label="Refund" sub="if found wrong" icon="check" color={U.green} w={200} active={f >= L.w(6, 'Refund')} />
          <Panel x={X0 + 40} y={480} w={380} t={on(L.c(5))} glow={U.blue}>
            <div style={{fontSize: 17, fontWeight: 700, letterSpacing: 2, color: '#0F3A8A'}}>NHAI HIGHWAY HELPLINE</div>
            <div style={{fontFamily: UF.head, fontSize: 64, fontWeight: 800, color: deep(U.blue)}}>1033</div>
          </Panel>
        </div>
      )}
    </>
  );
};
