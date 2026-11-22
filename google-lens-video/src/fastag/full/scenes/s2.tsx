import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AppHome} from '../screens';
import {Edges, Header, NodeBox, OnText, Panel, X0, XW, P, vis} from '../../../upi/full/kit';
import {EIO, EO, ip} from '../../../anim';
import {Sticker} from '../art';

const S = sc('s2'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <AppHome f={f} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const A = vis(f, L.c(1) - 6, L.c(4));          // sticker + link chain
  const B = vis(f, L.c(4) - 4, L.c(7));          // NETC / NPCI / 2021
  const C = vis(f, L.c(7) - 4, L.c(8));          // queues
  const D = vis(f, L.c(8) - 4, L.dur);           // documents
  const N: Record<string, P> = {car: [1040, 700], tag: [1370, 700], wal: [1700, 700]};
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  return (
    <>
      <Header f={f} dur={L.dur} n="02" title="WHAT IS FASTAG?" />
      <OnText f={f} a={6} b={L.c(1) - 4} y={440} size={66} text="WHAT IS FASTAG?" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A}}>
          <div style={{position: 'absolute', left: 1370 - 170, top: 190, transform: `scale(${0.9 + 0.1 * on(L.c(1))}) rotate(-3deg)`}}>
            <Sticker w={340} glow={Math.sin(Math.PI * ip(f, [L.w(1, 'RFID'), L.w(1, 'RFID') + 30], [0, 1]))} />
          </div>
          <OnText f={f} a={L.w(1, 'RFID')} b={L.c(4)} y={440} size={34} color={U.blue} text="AN RFID STICKER ON THE WINDSHIELD" />
          <Edges f={f} live={f >= L.c(3)} edges={[[N.car, N.tag, L.c(2)], [N.tag, N.wal, L.w(2, 'Prepaid')]]} />
          <NodeBox x={N.car[0]} y={N.car[1]} t={on(L.c(2))} label="Your vehicle" sub={'DEMO 1234'} icon="car" color={U.blue} />
          <NodeBox x={N.tag[0]} y={N.tag[1]} t={on(L.c(2) + 6)} label="FASTag" sub="unique tag ID" icon="tag" color={U.green} active={f >= L.c(2)} />
          <NodeBox x={N.wal[0]} y={N.wal[1]} t={on(L.w(2, 'Prepaid'))} label="Wallet / Account" sub="prepaid or bank-linked" icon="wallet" color={U.saffron} w={220} />
          <OnText f={f} a={L.c(3)} b={L.c(4)} y={830} size={34} color={U.green} text="AUTOMATIC TOLL PAYMENT · NO STOPPING" />
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B}}>
          <Panel x={X0 + 60} y={200} w={XW - 120} t={on(L.c(4))} glow={U.blue}>
            <div style={{fontSize: 18, fontWeight: 700, letterSpacing: 4, color: '#0F3A8A'}}>PART OF</div>
            <div style={{fontFamily: UF.head, fontSize: 44, fontWeight: 800, marginTop: 6}}><span style={{color: deep(U.blue)}}>NETC</span> · National Electronic Toll Collection</div>
          </Panel>
          <Panel x={X0 + 60} y={410} w={XW - 120} t={on(L.c(5))} glow={U.saffron}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <div style={{width: 64, height: 64, borderRadius: 18, background: U.saffron, color: '#fff', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>NPCI</div>
              <div><div style={{fontSize: 30, fontWeight: 800}}>Developed by NPCI</div><div style={{fontSize: 19, color: U.slate, marginTop: 4}}>the same organisation behind UPI</div></div>
            </div>
          </Panel>
          <Panel x={X0 + 60} y={600} w={XW - 120} t={on(L.c(6))} glow={U.green}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
              <div style={{fontFamily: UF.head, fontSize: 52, fontWeight: 800, color: deep(U.green), whiteSpace: 'nowrap'}}>Feb 2021</div>
              <div style={{fontSize: 24, fontWeight: 700}}>FASTag made mandatory for most vehicles in India</div>
            </div>
          </Panel>
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C, fontFamily: UF.ui}}>
          {[['CASH LANE', 7, U.red, 'slow · long queue'], ['FASTag LANE', 2, U.green, 'no stopping']].map(([label, n, col, sub], r) => {
            const e = on(L.c(7) + (r as number) * 10);
            return (
              <div key={label as string} style={{position: 'absolute', left: X0 + 40, top: 330 + (r as number) * 230, width: XW - 80, opacity: e, transform: `translateX(${(1 - e) * 30}px)`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 800, color: deep(col as string)}}><span>{label as string}</span><span style={{fontWeight: 600, color: U.slate}}>{sub as string}</span></div>
                <div style={{marginTop: 12, height: 110, borderRadius: 20, background: 'linear-gradient(180deg,#A3AEC0,#8794A8)', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20, overflow: 'hidden'}}>
                  {Array.from({length: n as number}).map((_, i) => <span key={i} style={{fontSize: 62, transform: `translateX(${r ? ((f - L.c(7)) * 6) % 900 : 0}px) scaleX(-1)`}}>🚗</span>)}
                </div>
              </div>
            );
          })}
          <OnText f={f} a={L.c(7) + 20} y={820} size={30} color={U.blue} text="SHORTER QUEUES · NO CASH HASSLE" />
        </div>
      )}
      {D > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: D, fontFamily: UF.ui}}>
          <OnText f={f} a={L.c(8)} y={200} size={40} color={U.blue} text="TO GET A FASTAG YOU NEED" />
          <div style={{position: 'absolute', left: X0, top: 330, width: XW, display: 'flex', justifyContent: 'center', gap: 40}}>
            {[['📄', 'Vehicle RC', 'RC'], ['🪪', 'KYC documents', 'KYC']].map(([e, l, w]) => {
              const t = on(L.w(8, w));
              return <div key={l} style={{width: 300, padding: '30px 0', borderRadius: 26, background: '#fff', boxShadow: '0 14px 32px rgba(30,45,90,0.15)', textAlign: 'center', opacity: t, transform: `translateY(${(1 - t) * 20}px)`}}><div style={{fontSize: 90}}>{e}</div><div style={{fontSize: 28, fontWeight: 800, color: U.ink, marginTop: 10}}>{l}</div></div>;
            })}
          </div>
          <OnText f={f} a={L.w(8, 'KYC') + 20} y={720} size={26} color={U.slate} text="tag gets linked to your vehicle number" />
        </div>
      )}
    </>
  );
};
