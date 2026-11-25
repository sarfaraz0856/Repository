import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {ScamPhone} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, X0, XW, P, vis} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s8'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <ScamPhone f={f} linkAt={L.c(4)} simAt={L.c(5)} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(4)), B = vis(f, L.c(4) - 4, L.c(5)), C = vis(f, L.c(5) - 4, L.c(8)), D = vis(f, L.c(8) - 4, L.dur);
  const tw: P = [1370, 330], you: P = [1080, 640], bad: P = [1660, 640];
  return (
    <>
      <Header f={f} dur={L.dur} n="08" title="HOW OTP FRAUD HAPPENS" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={54} color={U.red} text="FRAUDSTERS WANT YOUR OTP" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(1)} y={170} size={40} color={U.red} text="① A CALL ASKING FOR YOUR OTP" />
          <div style={{position: 'absolute', left: X0, top: 280, width: XW, display: 'flex', justifyContent: 'center', gap: 20}}>
            {[['🏦', '"I\'m from your bank"', 'Bank'], ['📦', '"Delivery team"', 'Delivery'], ['🪪', '"KYC update"', 'KYC']].map(([e, t, w]) => <div key={t} style={{width: 280, padding: '22px 0', borderRadius: 22, background: '#fff', border: `3px solid ${U.red}55`, textAlign: 'center', boxShadow: '0 12px 28px rgba(30,45,90,0.12)', opacity: on(L.w(2, w))}}><div style={{fontSize: 56}}>{e}</div><div style={{fontSize: 22, fontWeight: 800, color: U.ink, marginTop: 6}}>{t}</div></div>)}
          </div>
          <div style={{position: 'absolute', left: X0 + 80, top: 560, width: XW - 160, padding: '26px 0', borderRadius: 24, background: '#0F172A', color: '#fff', textAlign: 'center', fontFamily: UF.head, fontSize: 36, fontWeight: 800, opacity: on(L.c(3)), boxShadow: '0 20px 40px rgba(15,23,42,0.3)'}}>🏦 A bank never asks for your OTP</div>
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(4)} y={170} size={40} color={U.red} text="② A FAKE LINK / WEBSITE" />
          <div style={{position: 'absolute', left: X0 + 120, top: 300, width: XW - 240, padding: 30, borderRadius: 26, background: '#fff', boxShadow: '0 14px 32px rgba(30,45,90,0.15)', opacity: on(L.c(4) + 6)}}>
            <div style={{padding: '10px 16px', borderRadius: 12, background: '#FEE2E2', color: '#B91C1C', fontSize: 22, fontWeight: 700}}>⚠ navyug-bank-kyc-update.example</div>
            <div style={{fontSize: 26, color: U.ink, marginTop: 18, fontWeight: 700}}>Looks like the bank… but it is not.</div>
            <div style={{fontSize: 22, color: U.slate, marginTop: 6}}>Whatever OTP you type here goes to the fraudster.</div>
          </div>
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C}}>
          <OnText f={f} a={L.c(5)} y={170} size={40} color={U.red} text="③ SIM SWAP" />
          <Edges f={f} live={f >= L.c(6)} color={U.red} edges={[[tw, bad, L.c(5) + 20]]} />
          <NodeBox x={tw[0]} y={tw[1]} t={on(L.c(5))} label="Mobile network" icon="antenna" color={U.cyan} w={220} />
          <NodeBox x={you[0]} y={you[1]} t={on(L.c(5) + 6)} label="Your phone" sub="📵 no service" icon="phone" color="#64748B" w={220} />
          <NodeBox x={bad[0]} y={bad[1]} t={on(L.c(5) + 16)} label="Fraudster's new SIM" sub="same number" icon="warn" color={U.red} w={240} active={f >= L.c(6)} />
          <Packet f={f} pts={[tw, bad]} a={L.c(6) + 4} b={L.c(6) + 40} color={U.red} label="OTP" />
          <OnText f={f} a={L.c(7)} y={820} size={28} color={U.blue} text="NETWORK SUDDENLY GONE? CALL YOUR OPERATOR NOW" />
        </div>
      )}
      {D > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: D, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(8)} y={170} size={40} color={U.red} text="④ SCREEN-SHARE APPS" />
          <div style={{position: 'absolute', left: X0, top: 290, width: XW, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, opacity: on(L.c(8) + 6)}}>
            <div style={{width: 200, height: 260, borderRadius: 30, border: '8px solid #0F172A', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 34, fontWeight: 800}}>OTP<br />482913</div>
            <div style={{fontSize: 60, color: U.red}}>⇢</div>
            <div style={{fontSize: 130}}>👀</div>
          </div>
          <div style={{position: 'absolute', left: X0 + 100, top: 600, width: XW - 200, padding: '22px 0', borderRadius: 22, background: '#FEF2F2', border: `3px solid ${U.red}`, textAlign: 'center', fontSize: 28, fontWeight: 800, color: deep(U.red), opacity: on(L.c(9))}}>✕ Never install a remote-access app because a stranger asked</div>
          <div style={{position: 'absolute', left: X0 + 100, top: 740, width: XW - 200, padding: '20px 0', borderRadius: 22, background: '#fff', border: `3px solid ${U.blue}`, textAlign: 'center', fontSize: 26, fontWeight: 800, color: deep(U.blue), opacity: on(L.c(10))}}>📞 Fake "customer care" numbers online → use only the official website</div>
        </div>
      )}
    </>
  );
};
