import React from 'react';
import {ip} from '../../../anim';
import {U, UF, deep} from '../../theme';
import {sc, loc} from '../tl';
import {History, ScreenSeq, StatusScreen} from '../screens';
import {Edges, Header, Icon, Ledger, NodeBox, OnText, Packet, Panel, X0, XW, vis, P} from '../kit';

const S = sc('s10'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => (
  <ScreenSeq f={f} seq={[
    [0, <StatusScreen f={f} a={0} kind="success" />],
    [L.w(0, 'Fail'), <StatusScreen f={f} a={L.w(0, 'Fail')} kind="failed" />],
    [L.w(0, 'Pending'), <StatusScreen f={f} a={L.w(0, 'Pending')} kind="pending" />],
    [L.c(2), <StatusScreen f={f} a={L.c(2)} kind="failed" sub="Something went wrong (demo)" />],
    [L.c(4), <StatusScreen f={f} a={L.c(4)} kind="pending" />],
    [L.c(7), <History f={f} reversedAt={L.w(7, 'Reversal')} hi={1} />],
    [L.c(8), <History f={f} reversedAt={0} hi={0} />],
  ]} />
);

export const Stage: React.FC<{f: number}> = ({f}) => {
  const reasons: [string, string, string][] = [['Bank server unavailable', 'Server', 'server'], ['Weak internet', 'Internet', 'switch'], ['Wrong UPI PIN', 'PIN', 'lock'], ['Insufficient balance', 'Balance', 'bank'], ['Transaction limit', 'Limit', 'warn'], ['Technical timeout', 'Timeout', 'clock']];
  const ph: P = [1000, 520], np: P = [1370, 520], bk: P = [1740, 520];
  const brk = f >= L.c(3) + 30;
  return (
    <>
      <Header f={f} dur={L.dur} n="10" title="WHY DO UPI PAYMENTS SOMETIMES FAIL?" />
      <div style={{position: 'absolute', left: X0, top: 330, width: XW, display: 'flex', justifyContent: 'center', gap: 20, opacity: vis(f, 4, L.c(2), 14, 12), fontFamily: UF.head}}>
        {[['SUCCESSFUL', U.green, 0], ['PENDING', '#F59E0B', L.w(0, 'Pending')], ['FAILED', U.red, L.w(0, 'Fail')]].map(([t, c, a]) => (
          <div key={t as string} style={{padding: '22px 30px', borderRadius: 20, border: `2px solid ${c}`, background: `${c}22`, color: U.ink, fontSize: 34, fontWeight: 800, opacity: ip(f, [a as number, (a as number) + 12], [0.25, 1])}}>{t as string}</div>
        ))}
      </div>
      {reasons.map(([t, w, ic], i) => (
        <Panel key={t} x={X0 + 20 + (i % 2) * 470} y={190 + Math.floor(i / 2) * 200} w={450} h={170} t={vis(f, L.w(2, w), L.c(3), 12, 12)} glow={U.red}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, height: '100%'}}>
            <div style={{width: 64, height: 64, borderRadius: 18, background: `${U.red}cc`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={ic} s={34} /></div>
            <div style={{fontSize: 25, fontWeight: 800}}>{t}</div>
          </div>
        </Panel>
      ))}
      {f >= L.c(3) - 4 && f < L.c(7) && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(3) - 4, L.c(7), 14, 12)}}>
          <Edges f={f} live edges={[[ph, np, L.c(3)], [np, bk, L.c(3) + 4]]} />
          <NodeBox x={ph[0]} y={ph[1]} t={1} label="Your App" icon="phone" color={U.blue} w={190} />
          <NodeBox x={np[0]} y={np[1]} t={1} label="UPI Network" icon="switch" color={U.saffron} w={190} />
          <NodeBox x={bk[0]} y={bk[1]} t={1} label="Your Bank" icon="bank" color={U.cyan} w={190} active={f >= L.c(3) + 26} />
          <Packet f={f} pts={[ph, np, bk]} a={L.c(3)} b={L.c(3) + 26} color={U.cyan} />
          <Ledger x={bk[0]} y={bk[1] + 80} t={ip(f, [L.c(3) + 20, L.c(3) + 30], [0, 1])} title="Your A/c" from={5000} to={4900} at={L.c(3) + 26} f={f} />
          {brk && <Packet f={f} pts={[bk, [1555, 520]]} a={L.c(3) + 30} b={L.c(3) + 56} color={U.green} label="✓" />}
          {f >= L.c(3) + 56 && <div style={{position: 'absolute', left: 1500, top: 470, width: 100, height: 100, borderRadius: 50, background: `${U.red}33`, border: `3px solid ${U.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5}}><Icon k="cross" s={50} /></div>}
          <OnText f={f} a={L.c(3) + 56} b={L.c(4)} y={720} size={30} color={U.red} text="RESPONSE DID NOT REACH THE APP" />
          <OnText f={f} a={L.c(4)} b={L.c(5)} y={720} size={38} color="#F59E0B" text="STATUS: PENDING" />
          <OnText f={f} a={L.c(5)} b={L.c(6)} y={720} size={38} color={U.green} text="MONEY IS NOT LOST" />
          <OnText f={f} a={L.c(6)} b={L.c(7)} y={720} size={32} color={U.cyan} text="RECORDS VERIFIED → FINAL STATUS" />
        </div>
      )}
      {f >= L.c(7) - 4 && f < L.c(8) + 4 && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(7) - 4, L.c(8) + 4, 14, 10)}}>
          <OnText f={f} a={L.c(7)} y={220} size={40} text="FAILED BUT DEBITED? → REVERSAL" />
          <Ledger x={1370} y={360} t={1} title="Your A/c" from={4900} to={5000} at={L.w(7, 'Reversal')} f={f} w={380} />
          <div style={{position: 'absolute', left: X0, top: 500, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 19, color: U.slate}}>As per applicable rules · illustrative example</div>
        </div>
      )}
      <Panel x={X0 + 120} y={250} w={720} t={vis(f, L.c(8) - 2, L.dur, 14, 14)} glow={U.saffron}>
        <div style={{fontFamily: UF.head, fontSize: 36, fontWeight: 800, color: deep(U.saffron)}}>CHECK STATUS BEFORE RETRYING</div>
        <div style={{display: 'flex', gap: 16, marginTop: 20}}>
          {['Transaction history', 'Bank statement'].map((t) => <div key={t} style={{flex: 1, padding: 16, borderRadius: 14, background: 'rgba(34,197,94,0.12)', border: `1px solid ${U.green}`, fontSize: 20, fontWeight: 700}}>✓ {t}</div>)}
        </div>
        <div style={{marginTop: 16, padding: 16, borderRadius: 14, background: 'rgba(240,68,56,0.12)', border: `1px solid ${U.red}`, fontSize: 20, fontWeight: 700}}>✕ Paying again immediately → possible duplicate payment</div>
        <div style={{marginTop: 16, fontSize: 19, color: U.slate, opacity: ip(f, [L.c(9), L.c(9) + 14], [0, 1])}}>Need help? Use only the official support of your payment app or bank.</div>
      </Panel>
    </>
  );
};
