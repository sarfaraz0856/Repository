import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AppHome, SmsInbox} from '../screens';
import {Edges, Header, Ledger, NodeBox, OnText, Packet, X0, XW, P} from '../../../upi/full/kit';
import {EIO, EO, ip} from '../../../anim';
import {Car} from '../../FastagSample';
import {Waves} from '../art';

const S = sc('s5'); const L = loc(S);
const N: Record<string, P> = {plaza: [1010, 640], acq: [1260, 640], netc: [1510, 640], iss: [1770, 640]};
const READER_X = 1430, ROAD = 330;

export const Screen: React.FC<{f: number}> = ({f}) => f < L.c(10) - 4
  ? <AppHome f={f} from={500} to={405} at={L.w(8, 'Debit')} />
  : <SmsInbox f={f} msgs={[{at: L.c(10), text: '₹95 debited from your FASTag wallet (DEMO 1234) for toll at Demo Toll Plaza. Avl bal ₹405.', col: U.red}]} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const read = L.w(2, 'Read'), open = L.w(5, 'Barrier');
  // car: arrives with line 2, waits gently under the reader, leaves when the barrier opens
  const carX = f < read ? 900 + (READER_X - 246 - 900) * ip(f, [L.c(2) - 10, read], [0, 1], (t) => 1 - Math.pow(1 - t, 1.6))
    : f < open ? READER_X - 246 : READER_X - 246 + 700 * ip(f, [open + 4, open + 40], [0, 1], (t) => t * t);
  const scan = f >= read - 8 && f < read + 20;
  const arm = ip(f, [open, open + 10], [0, 1], EIO);
  const st = on(L.c(3)), list = on(L.c(4));
  const valid = on(L.w(5, 'Valid'));
  return (
    <>
      <Header f={f} dur={L.dur} n="05" title="THE JOURNEY AT THE TOLL PLAZA" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={56} text="STEP BY STEP" />
      {/* wallet + toll */}
      <div style={{position: 'absolute', left: X0, top: 120, width: XW, display: 'flex', justifyContent: 'center', gap: 20, fontFamily: UF.ui, opacity: on(L.c(1))}}>
        {[['Wallet balance', '₹500', U.blue], ['Toll (illustrative)', '₹95', U.red]].map(([a, b, c]) => (
          <span key={a} style={{padding: '8px 18px', borderRadius: 14, background: '#fff', boxShadow: '0 8px 20px rgba(30,45,90,0.12)', fontSize: 18, color: U.slate, fontWeight: 600}}>{a}: <b style={{color: deep(c), fontSize: 22}}>{b}</b></span>
        ))}
      </div>
      {/* lane */}
      <div style={{position: 'absolute', left: 880, top: 0, width: 1000, height: 560, overflow: 'hidden', opacity: on(L.c(2) - 14)}}>
        <div style={{position: 'absolute', left: -880, top: 0, width: 1920, height: 560}}>
          <div style={{position: 'absolute', left: 880, top: ROAD + 140, width: 1000, height: 60, background: 'linear-gradient(180deg,#9AA6B8,#7C889B)'}} />
          <div style={{position: 'absolute', left: READER_X - 140, top: 200, width: 280, height: 46, borderRadius: 12, background: '#1E3A8A', color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UF.ui}}>FASTag LANE</div>
          {[READER_X - 130, READER_X + 115].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 246, width: 14, height: ROAD + 140 - 246, background: '#B8C2D2'}} />)}
          <div style={{position: 'absolute', left: READER_X - 28, top: 248, width: 56, height: 32, borderRadius: 8, background: '#0F172A', border: `3px solid ${scan ? U.cyan : '#334155'}`, boxShadow: scan ? `0 0 20px ${U.cyan}` : undefined}} />
          <Waves f={f} x={READER_X} y={280} on={scan} len={90} />
          <div style={{position: 'absolute', left: READER_X + 220, top: ROAD + 80, width: 26, height: 60, borderRadius: 6, background: '#334155'}} />
          <div style={{position: 'absolute', left: READER_X + 232 - 150, top: ROAD + 86, width: 150, height: 12, borderRadius: 6, backgroundImage: 'repeating-linear-gradient(90deg,#EF4444 0 22px,#fff 22px 44px)', transformOrigin: '100% 50%', transform: `rotate(${arm * 78}deg)`}} />
          <div style={{position: 'absolute', left: 0, top: 0, transform: 'scale(0.8)', transformOrigin: `${READER_X}px ${ROAD + 140}px`}}>
            <Car x={carX} y={ROAD} f={f} tagGlow={Math.sin(Math.PI * ip(f, [read - 6, read + 18], [0, 1]))} />
          </div>
        </div>
      </div>
      {/* status check */}
      <div style={{position: 'absolute', left: 1650, top: 290, width: 210, padding: 14, borderRadius: 16, background: '#fff', boxShadow: '0 12px 30px rgba(30,45,90,0.18)', fontFamily: UF.ui, opacity: st * ip(f, [L.c(6), L.c(6) + 12], [1, 0]), transform: `translateY(${(1 - st) * 14}px)`}}>
        <div style={{fontSize: 14, color: U.slate, fontWeight: 700}}>STATUS CHECK</div>
        <div style={{fontSize: 15, marginTop: 6, color: U.ink}}>Tag: DEMO 1234</div>
        <div style={{fontSize: 14, marginTop: 6, color: U.slate, opacity: list}}>📋 updated status list</div>
        <div style={{fontSize: 18, marginTop: 8, fontWeight: 800, color: deep(U.green), opacity: valid}}>✓ Valid · Car (VC4)</div>
      </div>
      {/* money flow */}
      <Edges f={f} live={f >= L.c(7)} edges={[[N.plaza, N.acq, L.c(6)], [N.acq, N.netc, L.c(7)], [N.netc, N.iss, L.w(7, 'Issuer')]]} />
      <NodeBox x={N.plaza[0]} y={N.plaza[1]} t={on(L.c(6) - 6)} label="Plaza System" icon="server" color="#7C5CFF" active={f >= L.c(6) && f < L.c(7)} w={190} />
      <NodeBox x={N.acq[0]} y={N.acq[1]} t={on(L.c(6))} label="Acquirer Bank" icon="bank" color={U.blue} active={f >= L.c(6) && f < L.c(8)} w={190} />
      <NodeBox x={N.netc[0]} y={N.netc[1]} t={on(L.w(7, 'NPCI'))} label="NPCI · NETC" icon="switch" color={U.saffron} active={f >= L.w(7, 'NPCI') && f < L.c(8)} w={190} />
      <NodeBox x={N.iss[0]} y={N.iss[1]} t={on(L.w(7, 'Issuer'))} label="Issuer Bank" icon="wallet" color={U.green} active={f >= L.c(8) && f < L.c(9)} w={190} />
      <Packet f={f} pts={[N.plaza, N.acq, N.netc, N.iss]} a={L.c(6) + 6} b={L.c(8) - 6} color={U.cyan} label="₹95" />
      <Ledger x={N.iss[0]} y={720} t={on(L.c(8) - 10)} title="Your FASTag wallet" from={500} to={405} at={L.w(8, 'Debit')} f={f} w={230} />
      <Ledger x={N.acq[0]} y={720} t={on(L.c(9) - 6)} title="Toll plaza account" from={0} to={95} at={L.w(9, 'Toll') + 10} f={f} w={230} />
      <Packet f={f} pts={[N.iss, N.netc, N.acq]} a={L.c(9)} b={L.c(9) + 50} color={U.green} label="₹95" />
      <OnText f={f} a={L.c(9)} b={L.c(11)} y={860} size={28} color={U.blue} text="SETTLEMENT: MONEY REACHES THE TOLL PLAZA'S ACCOUNT" />
      <OnText f={f} a={L.c(11)} b={L.c(12)} y={860} size={28} color={U.saffron} text="BARRIER OPENS FAST · THE SMS CAN COME A LITTLE LATER" />
      <div style={{position: 'absolute', left: 940, top: 200, padding: '10px 16px', borderRadius: 14, background: '#fff', boxShadow: '0 10px 24px rgba(30,45,90,0.16)', fontFamily: UF.ui, fontSize: 18, fontWeight: 800, color: U.ink, opacity: on(L.c(12))}}>📷 plate & class check</div>
      <OnText f={f} a={L.c(12)} b={L.c(13)} y={860} size={28} color={U.blue} text="CAMERAS CAN ALSO CHECK NUMBER PLATE & CLASS" />
      <OnText f={f} a={L.c(13)} y={860} size={32} color={U.green} text="⏱ USUALLY DONE IN JUST A FEW SECONDS" />
      <div style={{position: 'absolute', left: X0, top: 940, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: U.slate, opacity: on(L.c(1))}}>Simplified, illustrative flow · amounts are examples</div>
    </>
  );
};
