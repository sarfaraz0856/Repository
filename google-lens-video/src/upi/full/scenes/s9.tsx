import React from 'react';
import {EIO, ip} from '../../../anim';
import {U, UF} from '../../theme';
import {sc, loc} from '../tl';
import {StatusScreen} from '../screens';
import {Header, Ledger, NodeBox, OnText, Panel, X0, XW, vis} from '../kit';

const S = sc('s9'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <StatusScreen f={f} a={L.c(1)} kind="success" sub={f >= L.c(2) ? 'Customer credit: done · Bank settlement: later, separately' : 'Receiver credited within seconds'} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const top = vis(f, L.c(1) - 4, L.dur, 14, 14);
  const bot = vis(f, L.c(3) - 4, L.dur, 14, 14);
  const ab = Math.round(10000 * ip(f, [L.c(3), L.c(3) + 60], [0, 1], EIO));
  const ba = Math.round(7000 * ip(f, [L.c(4), L.c(4) + 50], [0, 1], EIO));
  const net = ip(f, [L.c(7), L.c(7) + 30], [0, 1], EIO);
  return (
    <>
      <Header f={f} dur={L.dur} n="09" title="INSTANT CREDIT VS BANK SETTLEMENT" />
      <OnText f={f} a={4} b={L.c(1)} y={420} size={60} text="WHAT FEW PEOPLE KNOW…" />
      <Panel x={X0} y={120} w={XW} h={300} t={top} glow={U.green}>
        <div style={{fontSize: 17, fontWeight: 700, letterSpacing: 3, color: U.green}}>LAYER 1 · CUSTOMER PAYMENT — REAL TIME</div>
        <div style={{position: 'absolute', left: 0, top: 80, width: '100%'}}>
          <Ledger x={250} y={0} t={1} title="Sender A/c (Bank A)" from={5000} to={4900} at={L.c(1) + 10} f={f} w={340} />
          <Ledger x={710} y={0} t={1} title="Receiver A/c (Bank B)" from={2000} to={2100} at={L.c(1) + 24} f={f} w={340} />
          <div style={{position: 'absolute', left: 0, top: 120, width: '100%', textAlign: 'center', fontSize: 22, fontWeight: 800, color: U.green, opacity: ip(f, [L.c(1) + 30, L.c(1) + 44], [0, 1])}}>INSTANT CUSTOMER CREDIT ✓</div>
        </div>
      </Panel>
      <Panel x={X0} y={440} w={XW} h={430} t={bot} glow={U.saffron}>
        <div style={{fontSize: 17, fontWeight: 700, letterSpacing: 3, color: U.saffron}}>LAYER 2 · INTERBANK SETTLEMENT</div>
        <div style={{position: 'absolute', left: 0, top: 60, width: '100%', height: 360}}>
          <NodeBox x={150} y={110} t={1} label="Bank A" icon="bank" color={U.cyan} w={180} />
          <NodeBox x={810} y={110} t={1} label="Bank B" icon="bank" color={U.green} w={180} />
          <svg width={XW} height={260} style={{position: 'absolute', left: 0, top: 0}}>
            <line x1={250} y1={85} x2={710} y2={85} stroke={U.cyan} strokeWidth={4} strokeOpacity={ip(f, [L.c(3), L.c(3) + 10], [0, 1])} markerEnd="url(#ar)" />
            <line x1={710} y1={140} x2={250} y2={140} stroke={U.green} strokeWidth={4} strokeOpacity={ip(f, [L.c(4), L.c(4) + 10], [0, 1])} markerEnd="url(#ar2)" />
            <defs>
              <marker id="ar" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={U.cyan} /></marker>
              <marker id="ar2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={U.green} /></marker>
            </defs>
          </svg>
          <div style={{position: 'absolute', left: 300, top: 40, width: 360, textAlign: 'center', fontSize: 20, fontWeight: 700, opacity: ip(f, [L.c(3), L.c(3) + 10], [0, 1])}}>Bank A owes Bank B: <b style={{color: U.cyan, fontVariantNumeric: 'tabular-nums'}}>₹{ab.toLocaleString('en-IN')}</b></div>
          <div style={{position: 'absolute', left: 300, top: 150, width: 360, textAlign: 'center', fontSize: 20, fontWeight: 700, opacity: ip(f, [L.c(4), L.c(4) + 10], [0, 1])}}>Bank B owes Bank A: <b style={{color: U.green, fontVariantNumeric: 'tabular-nums'}}>₹{ba.toLocaleString('en-IN')}</b></div>
          <div style={{position: 'absolute', left: 0, top: 210, width: '100%', display: 'flex', justifyContent: 'center', gap: 20, opacity: ip(f, [L.c(6), L.c(6) + 14], [0, 1])}}>
            {[['NPCI', 'computes settlement'], ['RBI settlement system', 'banks settle balances']].map(([a, b]) => (
              <div key={a} style={{padding: '10px 18px', borderRadius: 14, background: 'rgba(255,153,51,0.12)', border: `1.5px solid ${U.saffron}`, textAlign: 'center'}}><div style={{fontSize: 19, fontWeight: 800}}>{a}</div><div style={{fontSize: 14, color: 'rgba(255,255,255,0.65)'}}>{b}</div></div>
            ))}
          </div>
          <div style={{position: 'absolute', left: 0, top: 300, width: '100%', textAlign: 'center', fontFamily: UF.head, fontSize: 32, fontWeight: 800, opacity: net}}>
            ₹10,000 − ₹7,000 = <span style={{color: U.saffron}}>₹3,000</span> <span style={{fontSize: 20, fontFamily: UF.ui, fontWeight: 600, color: 'rgba(255,255,255,0.75)'}}>Bank A → Bank B (net)</span>
          </div>
        </div>
      </Panel>
      <OnText f={f} a={L.c(2)} b={L.c(3) - 2} y={470} size={34} color={U.saffron} text="CREDIT ≠ SETTLEMENT · TWO DIFFERENT PROCESSES" />
      <div style={{position: 'absolute', left: X0, top: 880, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: 'rgba(255,255,255,0.5)', opacity: bot}}>Simplified illustrative example · conceptual roles · no settlement schedule implied</div>
    </>
  );
};
