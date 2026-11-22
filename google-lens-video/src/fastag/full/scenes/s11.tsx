import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {AppHome} from '../screens';
import {Edges, Header, NodeBox, OnText, Packet, P, vis} from '../../../upi/full/kit';
import {EIO, EO, ip} from '../../../anim';

const S = sc('s11'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <AppHome f={f} from={500} to={405} at={L.w(4, 'Debit')} />;

const R1: Record<string, P> = {tag: [1000, 360], reader: [1260, 360], plaza: [1520, 360], gate: [1780, 360]};
const R2: Record<string, P> = {acq: [1100, 640], netc: [1400, 640], iss: [1700, 640]};

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const A = vis(f, 4, L.c(3));
  const B = vis(f, L.c(3) - 4, L.c(5));
  const C = vis(f, L.c(5) - 4, L.dur + 30);
  const km = Math.round(ip(f, [L.c(1) + 20, L.c(2)], [0, 42]));
  const like = on(L.w(6, 'Like')), sub = on(L.w(6, 'Subscribe')), ty = on(L.c(7) + 10);
  return (
    <>
      <Header f={f} dur={L.dur} n="11" title="THE FUTURE & SUMMARY" />
      <OnText f={f} a={6} b={L.c(1)} y={440} size={54} text="WHAT'S NEXT?" />
      {A > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: A, fontFamily: UF.ui}}>
          <div style={{position: 'absolute', left: 1330, top: 150, fontSize: 90, opacity: on(L.w(1, 'Satellite')), transform: `translateX(${Math.sin(f / 30) * 10}px)`}}>🛰️</div>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: on(L.w(1, 'GNSS'))}}>
            <line x1={1380} y1={260} x2={1100 + 500 * ip(f, [L.c(1) + 20, L.c(2)], [0, 1], EIO)} y2={470} stroke={U.cyan} strokeWidth={3} strokeDasharray="8 8" />
            <path d="M 960 520 Q 1370 420 1800 520" fill="none" stroke="#94A3B8" strokeWidth={26} strokeLinecap="round" />
          </svg>
          <div style={{position: 'absolute', left: 1080 + 500 * ip(f, [L.c(1) + 20, L.c(2)], [0, 1], EIO), top: 440, fontSize: 52, transform: 'scaleX(-1)', opacity: on(L.w(1, 'GNSS'))}}>🚗</div>
          <div style={{position: 'absolute', left: 1180, top: 600, width: 380, padding: '12px 0', borderRadius: 16, background: '#fff', boxShadow: '0 12px 30px rgba(30,45,90,0.16)', textAlign: 'center', opacity: on(L.w(1, 'GNSS') + 10)}}>
            <div style={{fontSize: 16, color: U.slate, fontWeight: 700}}>DISTANCE-BASED TOLL (being tested)</div>
            <div style={{fontSize: 34, fontWeight: 800, color: deep(U.blue)}}>{km} km</div>
          </div>
          <div style={{position: 'absolute', left: 1040, top: 760, display: 'flex', alignItems: 'center', gap: 18, opacity: on(L.c(2))}}>
            <span style={{fontSize: 54}}>📷</span>
            <span style={{padding: '8px 16px', borderRadius: 8, background: '#FEF9C3', border: '3px solid #0F172A', fontFamily: 'monospace', fontSize: 30, fontWeight: 800}}>DEMO 1234</span>
            <span style={{fontSize: 22, fontWeight: 800, color: deep(U.green)}}>✓ number plate read</span>
          </div>
        </div>
      )}
      {B > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: B}}>
          <OnText f={f} a={L.c(3)} y={170} size={40} color={U.blue} text="RECAP" />
          <Edges f={f} live edges={[[R1.tag, R1.reader, L.w(3, 'Reader')], [R1.reader, R1.plaza, L.w(3, 'Plaza')], [R1.plaza, R1.gate, L.w(3, 'Barrier')], [R2.acq, R2.netc, L.w(4, 'NETC')], [R2.netc, R2.iss, L.w(4, 'Issuer')]]} />
          <NodeBox x={R1.tag[0]} y={R1.tag[1]} t={on(L.c(3))} label="Tag ID" icon="tag" color={U.green} w={170} />
          <NodeBox x={R1.reader[0]} y={R1.reader[1]} t={on(L.w(3, 'Reader'))} label="Reader" icon="antenna" color={U.cyan} w={170} />
          <NodeBox x={R1.plaza[0]} y={R1.plaza[1]} t={on(L.w(3, 'Plaza'))} label="Status check" icon="server" color="#7C5CFF" w={170} />
          <NodeBox x={R1.gate[0]} y={R1.gate[1]} t={on(L.w(3, 'Barrier'))} label="Barrier opens" icon="check" color={U.green} w={170} active={f >= L.w(3, 'Barrier')} />
          <NodeBox x={R2.acq[0]} y={R2.acq[1]} t={on(L.c(4))} label="Acquirer Bank" icon="bank" color={U.blue} w={190} />
          <NodeBox x={R2.netc[0]} y={R2.netc[1]} t={on(L.w(4, 'NETC'))} label="NPCI · NETC" icon="switch" color={U.saffron} w={190} />
          <NodeBox x={R2.iss[0]} y={R2.iss[1]} t={on(L.w(4, 'Issuer'))} label="Issuer Bank" sub="wallet debited" icon="wallet" color={U.green} w={190} active={f >= L.w(4, 'Debit')} />
          <Packet f={f} pts={[R2.acq, R2.netc, R2.iss]} a={L.w(4, 'NETC')} b={L.w(4, 'Debit')} color={U.cyan} label="₹" />
        </div>
      )}
      {C > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: C}}>
          <div style={{position: 'absolute', left: 880, top: 330, width: 980, textAlign: 'center'}}>
            <div style={{fontFamily: UF.head, fontWeight: 800, fontSize: 80, letterSpacing: 2, whiteSpace: 'nowrap', color: U.ink, opacity: on(L.c(5)), textShadow: '0 10px 40px rgba(255,255,255,0.9)'}}>
              HOW <span style={{background: `linear-gradient(90deg, ${U.blue}, ${U.green})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>FASTag</span> WORKS
            </div>
            <div style={{fontFamily: UF.ui, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: '#0F3A8A', marginTop: 18, opacity: on(L.c(5) + 10)}}>ONE SMALL STICKER · ONE BIG NETWORK</div>
          </div>
          <div style={{position: 'absolute', left: 880, top: 600, width: 980, display: 'flex', justifyContent: 'center', gap: 26, fontFamily: UF.ui}}>
            <span style={{padding: '16px 34px', borderRadius: 40, background: U.blue, color: '#fff', fontWeight: 800, fontSize: 30, opacity: like, transform: `scale(${0.8 + 0.2 * like})`}}>👍 Like</span>
            <span style={{padding: '16px 34px', borderRadius: 40, background: U.red, color: '#fff', fontWeight: 800, fontSize: 30, opacity: sub, transform: `scale(${0.8 + 0.2 * sub})`}}>🔔 Subscribe</span>
          </div>
          <div style={{position: 'absolute', left: 880, top: 740, width: 980, textAlign: 'center', fontFamily: UF.head, fontWeight: 800, fontSize: 56, color: deep(U.green), opacity: ty, transform: `translateY(${(1 - ty) * 14}px)`}}>Thank you!</div>
        </div>
      )}
    </>
  );
};
