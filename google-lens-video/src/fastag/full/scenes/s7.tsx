import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AppHome} from '../screens';
import {Header, OnText, Panel, Row, X0, XW, vis} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';
import {Car} from '../../FastagSample';
import {Sticker} from '../art';

const S = sc('s7'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => {
  const s = f < L.c(1) ? 'active' : f < L.w(2, 'Blacklist') ? 'low' : f < L.c(6) ? 'blacklisted' : 'active';
  return <AppHome f={f} from={40} to={540} at={L.c(6) + 10} status={s} hi={f >= L.c(6) ? 'Recharge' : undefined} />;
};

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4));
  const B = vis(f, L.c(4) - 4, L.c(6));
  const C = vis(f, L.c(6) - 4, L.dur);
  const ROAD = 250;
  return (
    <>
      <Header f={f} dur={L.dur} n="07" title="LOW BALANCE, BLACKLIST & KYC" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          {/* stopped at a closed barrier */}
          <div style={{position: 'absolute', left: 900, top: ROAD + 140, width: 940, height: 50, background: 'linear-gradient(180deg,#9AA6B8,#7C889B)', borderRadius: 8}} />
          <div style={{position: 'absolute', left: 1500, top: ROAD + 70, width: 26, height: 70, borderRadius: 6, background: '#334155'}} />
          <div style={{position: 'absolute', left: 1512 - 170, top: ROAD + 78, width: 170, height: 12, borderRadius: 6, backgroundImage: 'repeating-linear-gradient(90deg,#EF4444 0 22px,#fff 22px 44px)'}} />
          <div style={{position: 'absolute', left: 0, top: 0, transform: 'scale(0.8)', transformOrigin: `1300px ${ROAD + 140}px`}}>
            <Car x={1000 + 120 * on(4)} y={ROAD} f={0} tagGlow={0} />
          </div>
          <div style={{position: 'absolute', left: 1560, top: ROAD - 20, padding: '10px 16px', borderRadius: 14, background: U.red, color: '#fff', fontWeight: 800, fontSize: 20, opacity: on(L.c(0) + 20)}}>✕ Payment not possible</div>
          <Panel x={X0 + 120} y={470} w={XW - 240} t={on(L.c(1))}>
            <div style={{fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#0F3A8A', marginBottom: 4}}>COMMON REASONS</div>
            <Row t={on(L.c(1))} ok={false} text="Low balance in the wallet" />
            <Row t={on(L.w(2, 'Blacklist'))} ok={false} text="Tag in Low-balance / Blacklist status" />
            <Row t={on(L.w(3, 'KYC'))} ok={false} text="KYC not completed" />
            <Row t={on(L.w(3, 'Vehicle'))} ok={false} text="Vehicle details don't match" />
          </Panel>
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(4)} y={170} size={44} color={U.blue} text="ONE VEHICLE · ONE FASTAG" />
          <div style={{position: 'absolute', left: 1080, top: 280, display: 'flex', gap: 60, alignItems: 'center'}}>
            {[0, 1].map((i) => (
              <div key={i} style={{position: 'relative', opacity: on(L.c(4) + 8 + i * 8)}}>
                <Sticker w={260} glow={i === 0 ? 0.6 : 0} />
                {i === 1 && <svg width={260} height={162} style={{position: 'absolute', inset: 0}}><line x1={20} y1={20} x2={20 + 220 * on(L.w(4, 'Active'))} y2={20 + 122 * on(L.w(4, 'Active'))} stroke={U.red} strokeWidth={12} strokeLinecap="round" /></svg>}
                <div style={{textAlign: 'center', marginTop: 10, fontSize: 20, fontWeight: 800, color: i ? deep(U.red) : deep(U.green)}}>{i ? 'Extra tag ✕' : 'Active tag ✓'}</div>
              </div>
            ))}
          </div>
          <OnText f={f} a={L.c(4) + 20} b={L.c(5)} y={560} size={22} color={U.slate} text="NHAI policy: only one active FASTag per vehicle" />
          <Panel x={X0 + 140} y={620} w={XW - 280} t={on(L.c(5))} glow={U.red}>
            <div style={{fontSize: 26, fontWeight: 800}}>No valid FASTag?</div>
            <div style={{fontSize: 21, color: U.slate, marginTop: 6}}>You may have to pay <b style={{color: deep(U.red)}}>more than the normal toll</b>. Check the latest official rules.</div>
          </Panel>
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C}}>
          <Panel x={X0 + 160} y={300} w={XW - 320} t={on(L.c(6))} glow={U.green}>
            <div style={{fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#0F3A8A', marginBottom: 4}}>BEFORE YOUR TRIP</div>
            <Row t={on(L.w(6, 'Balance'))} ok text="Check wallet balance" size={26} />
            <Row t={on(L.w(6, 'Status'))} ok text="Check tag status (Active)" size={26} />
            <Row t={on(L.c(7))} ok text="After recharge, status turns Active again" size={26} />
          </Panel>
        </div>
      )}
    </>
  );
};
