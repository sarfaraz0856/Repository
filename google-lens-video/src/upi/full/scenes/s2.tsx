import React from 'react';
import {EIO, ip} from '../../../anim';
import {U, UF} from '../../theme';
import {sc, loc} from '../tl';
import {AppHome} from '../screens';
import {Edges, Header, Icon, NodeBox, OnText, Panel, Packet, X0, XW, vis, P} from '../kit';

const S = sc('s2'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => {
  let hi = -1;
  if (f >= L.w(6, 'UPI ID')) hi = 5;
  if (f >= L.w(6, 'Mobile')) hi = 2;
  if (f >= L.w(6, 'QR')) hi = 0;
  if (f >= L.c(7)) hi = -1;
  const bank = f >= L.c(7) ? 0.6 + 0.4 * Math.sin(f / 6) : 1;
  return <AppHome f={f} hi={hi} showBank={bank} />;
};

export const Stage: React.FC<{f: number}> = ({f}) => {
  const word = (w: string) => ip(f, [L.w(1, w), L.w(1, w) + 12], [0, 1]);
  const big = vis(f, 0, L.c(3), 16, 14);
  const hub: P = [1370, 470];
  const banks: P[] = [[1000, 220], [960, 400], [960, 580], [1000, 760]];
  const apps: [string, P][] = [['Google Pay', [1740, 220]], ['PhonePe', [1780, 400]], ['BHIM', [1780, 580]], ['Paytm', [1740, 760]]];
  const netA = L.c(3), netB = L.c(4);
  const before = vis(f, L.c(4) - 4, L.c(7), 14, 14);
  const strike = ip(f, [L.c(5), L.c(5) + 16], [0, 1], EIO);
  const opts: [string, string, string][] = [['UPI ID', 'sharma.store@demo', 'UPI ID'], ['Mobile Number', '98XXXXXX10', 'Mobile'], ['QR Code', 'Scan & Pay', 'QR']];
  return (
    <>
      <Header f={f} dur={L.dur} n="02" title="WHAT EXACTLY IS UPI?" />
      {/* U P I → full form */}
      {big > 0.01 && (
        <div style={{position: 'absolute', left: X0, top: 250, width: XW, textAlign: 'center', opacity: big, fontFamily: UF.head}}>
          <div style={{fontSize: f < L.c(1) ? 220 : 150, fontWeight: 800, letterSpacing: 20, color: '#fff', lineHeight: 1, textShadow: `0 0 60px ${U.blue}`}}>UPI</div>
          {[['U', 'NIFIED', 'Unified'], ['P', 'AYMENTS', 'Payments'], ['I', 'NTERFACE', 'Interface']].map(([a, b, w]) => (
            <div key={a} style={{fontSize: 54, fontWeight: 800, letterSpacing: 4, marginTop: 8, opacity: word(w), transform: `translateX(${(1 - word(w)) * 30}px)`}}>
              <span style={{color: U.cyan}}>{a}</span><span style={{color: '#fff'}}>{b}</span>
            </div>
          ))}
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 28, padding: '10px 22px', borderRadius: 30, background: `${U.saffron}22`, border: `1.5px solid ${U.saffron}`, fontFamily: UF.ui, fontSize: 22, fontWeight: 700, color: '#fff', opacity: ip(f, [L.w(2, 'NPCI'), L.w(2, 'NPCI') + 14], [0, 1])}}>
            Developed by <b style={{color: U.saffron}}>NPCI</b> · National Payments Corporation of India
          </div>
        </div>
      )}
      {/* common network */}
      {f >= netA - 4 && f < netB + 14 && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, netA - 4, netB + 14, 14, 14)}}>
          <Edges f={f} live edges={[...banks.map((b, i): [P, P, number] => [b, hub, netA + 10 + i * 4]), ...apps.map(([, p], i): [P, P, number] => [hub, p, netA + 20 + i * 4])]} />
          {banks.map((b, i) => <NodeBox key={i} x={b[0]} y={b[1]} w={170} t={ip(f, [netA + i * 4, netA + 12 + i * 4], [0, 1])} label={`Bank ${i + 1}`} icon="bank" color={U.cyan} />)}
          {apps.map(([n, p], i) => <NodeBox key={n} x={p[0]} y={p[1]} w={170} t={ip(f, [netA + 14 + i * 4, netA + 26 + i * 4], [0, 1])} label={n} sub="e.g. UPI app" icon="phone" color={U.blue} />)}
          <NodeBox x={hub[0]} y={hub[1]} w={230} big t={ip(f, [netA + 6, netA + 20], [0, 1])} label="UPI Network" sub="common rails" icon="switch" color={U.saffron} active />
          {[0, 1, 2].map((i) => <Packet key={i} f={f} pts={[banks[i + 1], hub, apps[i][1]]} a={netA + 40 + i * 14} b={netA + 80 + i * 14} color={U.cyan} />)}
          <OnText f={f} a={netA + 30} b={netB + 14} y={860} size={30} color={U.cyan} text="ONE INTEROPERABLE PAYMENT NETWORK" />
        </div>
      )}
      {/* before vs UPI */}
      <Panel x={X0 + 20} y={210} w={430} t={before}>
        <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.6)'}}>BEFORE</div>
        {[['Account Number', '0012 3456 7890', 'Account'], ['IFSC Code', 'DEMO0001234', 'IFSC'], ['Other bank details', 'Name, branch…', 'Details']].map(([k, v, w]) => (
          <div key={k} style={{marginTop: 14, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', opacity: ip(f, [L.w(4, w), L.w(4, w) + 12], [0, 1])}}>
            <div style={{fontSize: 14, color: 'rgba(255,255,255,0.6)'}}>{k}</div>
            <div style={{fontSize: 22, fontWeight: 700, fontFamily: 'monospace'}}>{v}</div>
          </div>
        ))}
        <div style={{position: 'absolute', left: 20, right: 20, top: '52%', height: 5, borderRadius: 3, background: U.red, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />
      </Panel>
      <Panel x={X0 + 500} y={210} w={430} t={vis(f, L.c(6) - 4, L.c(7), 14, 14)} glow={U.green}>
        <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: U.green}}>WITH UPI – ANY ONE OF</div>
        {opts.map(([k, v, w]) => (
          <div key={k} style={{marginTop: 14, padding: '12px 14px', borderRadius: 14, background: 'rgba(34,197,94,0.10)', border: `1px solid ${U.green}55`, opacity: ip(f, [L.w(6, w), L.w(6, w) + 12], [0, 1])}}>
            <div style={{fontSize: 14, color: 'rgba(255,255,255,0.6)'}}>{k}</div>
            <div style={{fontSize: 22, fontWeight: 700}}>{v}</div>
          </div>
        ))}
      </Panel>
      <OnText f={f} a={L.c(5)} b={L.c(7)} y={760} size={34} text="SIMPLER PAYMENT INITIATION" color={U.green} />
      {/* money stays in the bank */}
      {f >= L.c(7) - 4 && (() => {
        const t = vis(f, L.c(7) - 4, L.dur, 14, 14);
        const app: P = [1100, 470], bank: P = [1660, 300], net: P = [1660, 650];
        return (
          <div style={{position: 'absolute', inset: 0, opacity: t}}>
            <Edges f={f} live={f >= L.c(8)} edges={[[app, bank, L.c(7) + 8], [app, net, L.c(8)]]} />
            <NodeBox x={app[0]} y={app[1]} w={240} big t={ip(f, [L.c(7), L.c(7) + 14], [0, 1])} label="Payment App" sub="the interface" icon="phone" color={U.blue} active={f >= L.c(8)} />
            <NodeBox x={bank[0]} y={bank[1]} w={240} big t={ip(f, [L.c(7) + 6, L.c(7) + 20], [0, 1])} label="Your Bank Account" sub="₹5,000 – money stays here" icon="bank" color={U.green} active={f < L.c(8)} />
            <NodeBox x={net[0]} y={net[1]} w={240} big t={ip(f, [L.c(8), L.c(8) + 14], [0, 1])} label="UPI Network" icon="switch" color={U.saffron} />
            <OnText f={f} a={L.c(7) + 10} y={150} size={30} color={U.green} text="MONEY NORMALLY STAYS IN YOUR LINKED BANK ACCOUNT" />
            <div style={{position: 'absolute', left: X0, top: 830, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: 'rgba(255,255,255,0.5)'}}>Regular bank-account UPI payment · some UPI products work differently</div>
          </div>
        );
      })()}
    </>
  );
};
