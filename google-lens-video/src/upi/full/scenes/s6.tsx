import React from 'react';
import {ip} from '../../../anim';
import {U, UF, deep} from '../../theme';
import {sc, loc} from '../tl';
import {PayScreen, Processing, ScreenSeq, StatusScreen} from '../screens';
import {Edges, Header, Ledger, NodeBox, OnText, Packet, X0, XW, P} from '../kit';

const S = sc('s6'); const L = loc(S);
const N: Record<string, P> = {app: [975, 330], psp: [975, 600], npci: [1330, 470], sb: [1330, 760], rb: [1720, 760], rcv: [1720, 330]};

export const Screen: React.FC<{f: number}> = ({f}) => (
  <ScreenSeq f={f} seq={[
    [0, <PayScreen f={f} payAt={L.c(3) + 4} />],
    [L.c(3) + 12, <Processing f={f} a={L.c(3) + 12} />],
    [L.c(12), <StatusScreen f={f} a={L.c(12)} kind="success" />],
  ]} />
);

const STEPS = ['Request', 'Route', 'Validate', 'Checks', 'Debit', 'Credit req.', 'Credit', 'Status'];

export const Stage: React.FC<{f: number}> = ({f}) => {
  const stepStart = [L.c(3), L.c(4), L.c(6), L.c(7), L.c(8), L.c(9), L.c(10), L.c(11)];
  let cur = -1;
  stepStart.forEach((s, i) => { if (f >= s) cur = i; });
  const show = ip(f, [L.c(2), L.c(2) + 16], [0, 1]);
  const on = (a: number) => ip(f, [a, a + 14], [0, 1]);
  const act = (k: string) => (k === 'app' && (cur === 0 || cur === 7)) || (k === 'psp' && (cur === 1 || cur === 7)) || (k === 'npci' && [1, 5, 7].includes(cur)) || (k === 'sb' && cur >= 2 && cur <= 4) || (k === 'rb' && cur >= 5 && cur <= 6) || (k === 'rcv' && cur === 6) || f >= L.c(13);
  const req: P[] = [N.app, N.psp, N.npci, N.sb];
  return (
    <>
      <Header f={f} dur={L.dur} n="06" title="THE ACTUAL UPI TRANSACTION JOURNEY" />
      <OnText f={f} a={4} b={L.c(2)} y={380} size={70} text="BEHIND THE SCENES" />
      <OnText f={f} a={L.c(1)} b={L.c(2)} y={480} size={120} color={U.cyan} text="?" />
      {show > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: show}}>
          {/* step bar */}
          <div style={{position: 'absolute', left: X0, top: 118, width: XW, display: 'flex', justifyContent: 'center', gap: 8, fontFamily: UF.ui}}>
            {STEPS.map((s, i) => (
              <div key={s} style={{display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 18, background: i === cur ? U.cyan : i < cur ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)', color: i === cur ? U.navy : i < cur ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 14.5, fontWeight: 700, border: `1px solid ${i <= cur ? 'transparent' : 'rgba(255,255,255,0.12)'}`}}>
                <span>{i < cur ? '✓' : i + 1}</span>{s}
              </div>
            ))}
          </div>
          <Edges f={f} live={f >= L.c(3)} edges={[[N.app, N.psp, L.c(2)], [N.psp, N.npci, L.c(2) + 4], [N.npci, N.sb, L.c(2) + 8], [N.npci, N.rb, L.c(2) + 12], [N.rb, N.rcv, L.c(2) + 16]]} />
          <NodeBox x={N.app[0]} y={N.app[1]} t={on(L.c(2))} label="Payment App" sub="sender" icon="phone" color={U.blue} active={act('app')} />
          <NodeBox x={N.psp[0]} y={N.psp[1]} t={on(L.c(2) + 4)} label="PSP" sub="Payment Service Provider" icon="server" color="#7C5CFF" active={act('psp')} w={210} />
          <NodeBox x={N.npci[0]} y={N.npci[1]} t={on(L.c(2) + 6)} big w={240} label="NPCI UPI Switch" sub="routes messages" icon="switch" color={U.saffron} active={act('npci')} />
          <NodeBox x={N.sb[0]} y={N.sb[1] - 30} t={on(L.c(2) + 8)} label="Sender Bank" sub="core banking" icon="bank" color={U.cyan} active={act('sb')} />
          <NodeBox x={N.rb[0]} y={N.rb[1] - 30} t={on(L.c(2) + 12)} label="Receiver Bank" sub="core banking" icon="bank" color={U.green} active={act('rb')} />
          <NodeBox x={N.rcv[0]} y={N.rcv[1]} t={on(L.c(2) + 16)} label="Receiver" sub={f >= L.c(10) + 20 ? '+₹100 received' : 'Sharma General Store'} icon="store" color={U.green} active={act('rcv')} />
          <Ledger x={N.sb[0]} y={N.sb[1] + 38} t={on(L.c(2) + 12)} title="Sender A/c" from={5000} to={4900} at={L.w(8, 'Debit')} f={f} />
          <Ledger x={N.rb[0]} y={N.rb[1] + 38} t={on(L.c(2) + 16)} title="Receiver A/c" from={2000} to={2100} at={L.w(10, 'Credit')} f={f} />
          <Packet f={f} pts={req.slice(0, 2)} a={L.c(3) + 10} b={L.c(4)} color={U.cyan} />
          <Packet f={f} pts={[N.psp, N.npci]} a={L.c(4)} b={L.c(5)} color={U.cyan} />
          <Packet f={f} pts={[N.npci, N.sb]} a={L.c(5)} b={L.c(6)} color={U.cyan} />
          <Packet f={f} pts={[N.sb, N.npci, N.rb]} a={L.c(9)} b={L.c(10)} color={U.blue} label="₹" />
          <Packet f={f} pts={[N.rb, N.rcv]} a={L.c(10) + 10} b={L.c(10) + 34} color={U.green} label="✓" />
          <Packet f={f} pts={[N.rb, N.npci, N.psp, N.app]} a={L.c(11)} b={L.c(12)} color={U.green} label="✓" />
          {cur >= 2 && cur <= 3 && (
            <div style={{position: 'absolute', left: N.sb[0] + 130, top: N.sb[1] - 110, padding: '10px 14px', borderRadius: 14, background: '#fff', border: `1px solid ${U.cyan}`, fontFamily: UF.ui, fontSize: 15, color: U.ink, lineHeight: 1.7, zIndex: 4}}>
              {[['Authentication', 'Authentication'], ['Available balance', 'Balance'], ['Transaction limits', 'Limits'], ['Security checks', 'Security']].map(([t, w]) => (
                <div key={t} style={{opacity: cur === 2 ? 0.5 : ip(f, [L.w(7, w), L.w(7, w) + 10], [0.4, 1])}}>{cur === 3 && f >= L.w(7, w) + 6 ? '✓ ' : '• '}{t}</div>
              ))}
            </div>
          )}
          <div style={{position: 'absolute', left: X0, top: 915, width: XW, display: 'flex', justifyContent: 'center', gap: 24, fontFamily: UF.ui, fontSize: 15, color: U.slate}}>
            <span><b style={{color: deep(U.cyan)}}>■</b> instruction</span><span><b style={{color: deep(U.green)}}>■</b> confirmation</span><span>Simplified transaction flow · illustrative balances</span>
          </div>
        </div>
      )}
      <OnText f={f} a={L.c(13) + 10} y={200} size={28} color={U.cyan} text="SECURE MESSAGES • BANK SYSTEMS • REAL-TIME UPDATES" />
    </>
  );
};
