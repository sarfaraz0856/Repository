import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AppHome, DEMO} from '../screens';
import {Header, NodeBox, OnText, Panel, Row, X0, XW, vis, Edges, P} from '../../../upi/full/kit';
import {EO, EIO, ip} from '../../../anim';
import {Sticker, Waves} from '../art';

const S = sc('s4'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <AppHome f={f} hi={f >= L.c(5) ? 'Tag details' : undefined} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(1));
  const B = vis(f, L.c(1) - 4, L.c(7));
  const C = vis(f, L.c(7) - 4, L.dur);
  const cut = ip(f, [L.w(2, 'Chip'), L.w(2, 'Chip') + 20], [0, 1], EIO);
  const down = f >= L.c(3) && f < L.c(5) + 10;
  const chipGlow = ip(f, [L.c(4), L.c(4) + 20], [0, 1]) * ip(f, [L.c(6) + 20, L.c(6) + 40], [1, 0.4]);
  const up = f >= L.c(5) && f < L.c(6) + 20;
  const idT = on(L.w(5, 'ID'));
  return (
    <>
      <Header f={f} dur={L.dur} n="04" title="HOW RFID WORKS (NO BATTERY!)" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: 1370 - 90, top: 300, width: 180, height: 100, borderRadius: 18, border: `8px solid ${U.ink}`, boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', right: -22, top: 26, width: 14, height: 32, borderRadius: 4, background: U.ink}} />
            <div style={{position: 'absolute', left: 10, top: 10, width: 40, height: 64, borderRadius: 6, background: U.red, opacity: 0.6}} />
          </div>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <line x1={1270} y1={290} x2={1270 + 220 * on(L.w(0, 'Battery'))} y2={290 + 120 * on(L.w(0, 'Battery'))} stroke={U.red} strokeWidth={12} strokeLinecap="round" />
          </svg>
          <OnText f={f} a={L.w(0, 'Battery')} y={480} size={52} text="NO BATTERY INSIDE?" color={U.red} />
          <OnText f={f} a={L.w(0, 'कैसे')} y={570} size={40} text="THEN HOW DOES IT WORK?" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(1)} b={L.c(3)} y={150} size={36} color={U.blue} text="RFID = RADIO FREQUENCY IDENTIFICATION" />
          {/* reader */}
          <div style={{position: 'absolute', left: 1370 - 110, top: 230, width: 220, height: 70, borderRadius: 16, background: '#0F172A', border: `3px solid ${down ? U.cyan : '#334155'}`, boxShadow: down ? `0 0 30px ${U.cyan}` : undefined, color: '#fff', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: on(L.c(3) - 10)}}>RFID READER</div>
          <Waves f={f} x={1370} y={300} on={down} len={150} />
          <Waves f={f} x={1370} y={470} on={up} dir={-1} color={U.green} len={130} />
          {up && <div style={{position: 'absolute', left: 1370 + 80, top: 360, padding: '8px 14px', borderRadius: 12, background: U.green, color: '#fff', fontWeight: 800, fontSize: 18, opacity: idT, fontFamily: 'monospace'}}>ID: {DEMO.tid.slice(0, 13)}…</div>}
          {f >= L.c(4) && f < L.c(5) + 10 && <div style={{position: 'absolute', left: 1370 - 210, top: 380, padding: '8px 14px', borderRadius: 12, background: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: 18, opacity: on(L.c(4))}}>⚡ energy from radio waves</div>}
          <div style={{position: 'absolute', left: 1370 - 210, top: 470, transform: `scale(${0.95 + 0.05 * on(L.c(1))})`}}>
            <Sticker w={420} cut={cut} chipGlow={chipGlow} />
          </div>
          <OnText f={f} a={L.c(2)} b={L.c(3)} y={760} size={32} color={U.saffron} text="A TINY CHIP + A THIN ANTENNA" />
          <OnText f={f} a={L.c(6)} b={L.c(7)} y={760} size={34} color={U.green} text="PASSIVE RFID · NO BATTERY · NO CHARGING" />
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C}}>
          <Panel x={X0 + 30} y={190} w={390} t={on(L.c(7))} glow={U.blue}>
            <div style={{fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#0F3A8A', marginBottom: 6}}>STORED ON THE TAG</div>
            <Row t={on(L.c(7) + 4)} ok={true} text="Unique Tag ID" />
            <Row t={on(L.c(7) + 10)} ok={false} text="Your money" />
            <Row t={on(L.c(7) + 16)} ok={false} text="Bank details" />
          </Panel>
          <Edges f={f} live={f >= L.c(8) + 10} edges={[[[1520, 560], [1700, 380] as P, L.c(8)], [[1520, 560], [1700, 740] as P, L.c(8) + 6]]} />
          <NodeBox x={1440} y={560} t={on(L.c(8))} label="Tag ID" sub="just an identity" icon="tag" color={U.green} w={180} />
          <NodeBox x={1720} y={370} t={on(L.c(8) + 6)} label="NETC servers" icon="switch" color={U.saffron} w={180} />
          <NodeBox x={1720} y={750} t={on(L.c(8) + 10)} label="Banks" sub="wallet & debit" icon="bank" color={U.blue} w={180} />
          <OnText f={f} a={L.c(8) + 16} y={880} size={30} color={deep(U.blue)} text="THE REAL WORK HAPPENS ON SERVERS" />
        </div>
      )}
    </>
  );
};
