import React from 'react';
import {EIO, ip} from '../../../anim';
import {U, UF, deep} from '../../theme';
import {sc, loc} from '../tl';
import {Processing, ScreenSeq, StatusScreen} from '../screens';
import {Header, Icon, Ledger, OnText, Panel, Row, X0, XW, vis} from '../kit';

const S = sc('s8'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => (
  <ScreenSeq f={f} seq={[
    [0, <Processing f={f} a={0} />],
    [L.c(5), <StatusScreen f={f} a={L.c(5)} kind="success" />],
    [L.c(7), <Processing f={f} a={L.c(7)} label="Taking a little longer…" />],
  ]} />
);

const Rack: React.FC<{x: number; f: number; seed: number}> = ({x, f, seed}) => (
  <div style={{position: 'absolute', left: x, top: 250, width: 190, height: 420, borderRadius: 16, background: 'linear-gradient(180deg,#132744,#0B1830)', border: '1.5px solid rgba(120,160,255,0.3)', padding: 12, boxSizing: 'border-box'}}>
    {Array.from({length: 8}).map((_, i) => (
      <div key={i} style={{height: 40, marginBottom: 8, borderRadius: 8, background: 'rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px'}}>
        {[0, 1, 2].map((k) => {
          const on = Math.sin(f / (3 + k) + i * 1.7 + seed * 2.3 + k) > 0.2;
          return <span key={k} style={{width: 9, height: 9, borderRadius: 5, background: on ? [U.green, U.cyan, U.saffron][k] : 'rgba(255,255,255,0.15)', boxShadow: on ? `0 0 8px ${[U.green, U.cyan, U.saffron][k]}` : undefined}} />;
        })}
        <span style={{flex: 1, height: 4, marginLeft: 8, borderRadius: 2, background: 'rgba(15,23,42,0.06)'}} />
      </div>
    ))}
  </div>
);

export const Stage: React.FC<{f: number}> = ({f}) => {
  const racks = vis(f, L.c(1) - 4, L.c(5), 14, 14);
  return (
    <>
      <Header f={f} dur={L.dur} n="08" title="HOW DOES MONEY TRANSFER SO FAST?" />
      <OnText f={f} a={4} b={L.c(1)} y={400} size={72} text="SO FAST… HOW?" />
      {racks > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: racks}}>
          <OnText f={f} a={L.c(1)} b={L.c(5)} y={150} size={44} text="AUTOMATED PROCESSING" />
          {[0, 1, 2].map((i) => <Rack key={i} x={X0 + 90 + i * 280} f={f} seed={i} />)}
          {f >= L.c(4) && [0, 1, 2, 3, 4].map((i) => {
            const t = ((f - L.c(4) - i * 6) % 24) / 24;
            if (f < L.c(4) + i * 6) return null;
            return <div key={i} style={{position: 'absolute', left: X0 + 140 + t * 660, top: 230 + i * 100, width: 40, height: 10, borderRadius: 5, background: U.cyan, boxShadow: `0 0 18px ${U.cyan}`, opacity: Math.sin(Math.PI * t)}} />;
          })}
          <OnText f={f} a={L.c(4)} b={L.c(5)} y={720} size={32} color={U.cyan} text="REAL-TIME COMMUNICATION" />
          <Panel x={X0 + 210} y={260} w={540} t={vis(f, L.c(2), L.c(3), 12, 10)} glow={U.red}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 70, height: 70, borderRadius: 35, background: 'rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="user" s={40} /></div>
              <div><div style={{fontSize: 24, fontWeight: 800}}>Manual approval</div><div style={{fontSize: 17, color: U.slate}}>No employee approves each payment</div></div>
              <div style={{marginLeft: 'auto', width: 50, height: 50, borderRadius: 25, background: U.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="cross" s={28} /></div>
            </div>
          </Panel>
          <Panel x={X0 + 210} y={260} w={540} t={vis(f, L.c(3), L.c(4), 12, 10)} glow={U.green}>
            <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: deep(U.green)}}>RULES-BASED, AUTOMATIC</div>
            {['Request received', 'Rules applied', 'Response sent'].map((t, i) => <Row key={t} t={ip(f, [L.c(3) + i * 10, L.c(3) + 12 + i * 10], [0, 1])} ok={f >= L.c(3) + 8 + i * 10} text={t} />)}
          </Panel>
        </div>
      )}
      {f >= L.c(5) - 4 && f < L.c(7) + 6 && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(5) - 4, L.c(7) + 6, 14, 12)}}>
          <Ledger x={1150} y={300} t={1} title="Sender A/c" from={5000} to={4900} at={L.w(5, 'Update')} f={f} w={300} />
          <Ledger x={1600} y={300} t={1} title="Receiver A/c" from={2000} to={2100} at={L.w(5, 'Update') + 8} f={f} w={300} />
          <OnText f={f} a={L.c(5) + 6} y={190} size={34} text="ACCOUNT RECORDS UPDATED" color={U.green} />
          {[['Electronic Communication', 'Electronic'], ['Automated Processing', 'Automated'], ['Standardized Protocols', 'Protocols']].map(([t, w], i) => (
            <div key={t} style={{position: 'absolute', left: X0 + 70 + i * 280, top: 520, width: 260, padding: '18px 10px', borderRadius: 18, textAlign: 'center', background: 'rgba(49,133,255,0.12)', border: `1.5px solid ${U.blue}`, fontFamily: UF.ui, fontSize: 20, fontWeight: 700, color: U.ink, opacity: ip(f, [L.w(6, w), L.w(6, w) + 12], [0, 1])}}>{t}</div>
          ))}
        </div>
      )}
      {f >= L.c(7) - 4 && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(7) - 4, L.dur, 14, 14)}}>
          <OnText f={f} a={L.c(7)} y={170} size={40} color={U.saffron} text="ACTUAL TRANSACTION TIME MAY VARY" />
          {[['Fast response', 0.3, U.green], ['Slower response', 0.85, U.saffron]].map(([t, w, c], i) => (
            <div key={t as string} style={{position: 'absolute', left: X0 + 80, top: 290 + i * 90, width: XW - 160, fontFamily: UF.ui}}>
              <div style={{fontSize: 18, fontWeight: 700, color: U.ink, marginBottom: 8}}>{t as string}</div>
              <div style={{height: 22, borderRadius: 11, background: 'rgba(15,23,42,0.06)'}}><div style={{width: `${(w as number) * 100 * ip(f, [L.c(7) + 6 + i * 10, L.c(7) + 40 + i * 10], [0, 1], EIO)}%`, height: '100%', borderRadius: 11, background: c as string}} /></div>
            </div>
          ))}
          {[['Internet connection', 'Internet'], ['Server load', 'Load'], ['Bank availability', 'Availability'], ['Technical conditions', 'Technical']].map(([t, w], i) => (
            <div key={t} style={{position: 'absolute', left: X0 + 40 + (i % 2) * 450, top: 520 + Math.floor(i / 2) * 100, width: 420, padding: '16px 20px', borderRadius: 16, background: 'rgba(255,153,51,0.12)', border: `1.5px solid ${U.saffron}`, fontFamily: UF.ui, fontSize: 21, fontWeight: 700, color: U.ink, opacity: ip(f, [L.w(8, w), L.w(8, w) + 12], [0, 1])}}>{t}</div>
          ))}
          <div style={{position: 'absolute', left: X0, top: 770, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: U.slate}}>Illustrative bars · no official timings implied</div>
        </div>
      )}
    </>
  );
};
