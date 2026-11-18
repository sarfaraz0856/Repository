import React from 'react';
import {ip} from '../../../anim';
import {U, UF, deep} from '../../theme';
import {sc, loc} from '../tl';
import {History, PayScreen, PinPad, ScamScreen, ScreenSeq, StatusScreen} from '../screens';
import {Header, Icon, OnText, Panel, Row, X0, XW, vis} from '../kit';

const S = sc('s11'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => (
  <ScreenSeq f={f} seq={[
    [0, <PinPad f={f} taps={[]} submit={1e9} />],
    [L.c(3), <StatusScreen f={f} a={L.c(3)} kind="received" />],
    [L.c(4), <ScamScreen f={f} warnAt={L.w(4, 'Verify')} />],
    [L.c(6), <History f={f} reversedAt={0} hi={2} />],
    [L.c(7), <PayScreen f={f} verifyHi={0.6 + 0.4 * Math.sin(f / 5)} />],
  ]} />
);

export const Stage: React.FC<{f: number}> = ({f}) => {
  const layers: [string, string][] = [['Authentication', 'Authentication'], ['Protected communication', 'Protected'], ['Banking security checks', 'Banking']];
  return (
    <>
      <Header f={f} dur={L.dur} n="11" title="HOW SAFE IS UPI?" />
      {f < L.c(2) && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, 4, L.c(2), 14, 12)}}>
          {layers.map(([t, w], i) => (
            <div key={t} style={{position: 'absolute', left: 1370 - (300 - i * 70), top: 470 - (300 - i * 70), width: 2 * (300 - i * 70), height: 2 * (300 - i * 70), borderRadius: '50%', border: `3px solid ${[U.blue, U.cyan, U.green][i]}`, opacity: ip(f, [L.w(0, w), L.w(0, w) + 14], [0, 1]), boxShadow: `0 0 30px ${[U.blue, U.cyan, U.green][i]}55`}}>
              <div style={{position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', padding: '4px 12px', borderRadius: 12, background: '#fff', color: U.ink, boxShadow: '0 4px 12px rgba(30,45,90,0.12)', fontFamily: UF.ui, fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap'}}>{t}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 1370 - 80, top: 470 - 80, width: 160, height: 160, borderRadius: 80, background: `${U.green}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ip(f, [L.c(1), L.c(1) + 14], [0, 1])}}><Icon k="user" s={80} /></div>
          <OnText f={f} a={L.c(1) + 10} y={840} size={28} color={U.green} text="+ YOUR CAUTION" />
        </div>
      )}
      <Panel x={X0 + 120} y={230} w={720} t={vis(f, L.c(2) - 2, L.c(3), 14, 12)} glow={U.red}>
        <div style={{fontFamily: UF.head, fontSize: 38, fontWeight: 800, color: U.red}}>NEVER SHARE YOUR UPI PIN</div>
        {['UPI PIN  • • • •', 'OTP  • • • • • •', 'Banking password'].map((t) => <Row key={t} t={1} ok={false} text={`Don't share: ${t}`} />)}
      </Panel>
      <Panel x={X0 + 120} y={230} w={720} t={vis(f, L.c(3) - 2, L.c(4), 14, 12)} glow={U.green}>
        <div style={{fontFamily: UF.head, fontSize: 32, fontWeight: 800, color: deep(U.green), lineHeight: 1.25}}>PIN IS NOT REQUIRED TO RECEIVE A NORMAL UPI TRANSFER</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 24, fontSize: 22, fontWeight: 700}}>
          <span style={{fontSize: 40}}>↓ ₹</span> Money received → <span style={{color: deep(U.green)}}>no PIN entered</span>
        </div>
      </Panel>
      <Panel x={X0 + 120} y={230} w={720} t={vis(f, L.c(4) - 2, L.c(5), 14, 12)} glow={U.saffron}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{fontSize: 44}}>⚠️</div>
          <div><div style={{fontSize: 26, fontWeight: 800}}>“Refund / Cashback / Reward”</div><div style={{fontSize: 18, color: U.slate}}>…asks you to scan a QR and enter your PIN?</div></div>
        </div>
        {['Stop', 'Verify the full details', 'Remember: PIN = you are paying'].map((t, i) => <Row key={t} t={ip(f, [L.c(4) + 20 + i * 10, L.c(4) + 32 + i * 10], [0, 1])} ok={i ? true : false} text={t} />)}
      </Panel>
      {f >= L.c(5) - 4 && f < L.c(7) && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(5) - 4, L.c(7), 14, 12)}}>
          <div style={{position: 'absolute', left: X0 + 60, top: 230, width: 380, height: 520, borderRadius: 30, background: `linear-gradient(170deg,#16A34A,${U.green})`, transform: 'rotate(-4deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: UF.ui, color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'}}>
            <div style={{fontSize: 60}}>✓</div><div style={{fontSize: 26, fontWeight: 800}}>Payment Successful</div><div style={{fontSize: 44, fontWeight: 800}}>₹2,000</div>
            <div style={{position: 'absolute', top: 210, left: -20, right: -20, padding: '10px 0', textAlign: 'center', background: U.red, fontSize: 26, fontWeight: 800, transform: 'rotate(-12deg)'}}>SCREENSHOT ≠ PROOF</div>
          </div>
          <Panel x={X0 + 500} y={300} w={420} t={ip(f, [L.c(6), L.c(6) + 14], [0, 1])} glow={U.green}>
            <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: deep(U.green)}}>CHECK THE REAL STATUS</div>
            <Row t={1} ok={true} text="In your bank account" />
            <Row t={1} ok={true} text="In your payment app" />
          </Panel>
        </div>
      )}
      <Panel x={X0 + 120} y={230} w={720} t={vis(f, L.c(7) - 2, L.c(8), 14, 12)} glow={U.cyan}>
        <div style={{fontFamily: UF.head, fontSize: 40, fontWeight: 800, color: deep(U.cyan)}}>VERIFY BEFORE PAYING</div>
        <Row t={1} ok={true} text="Receiver name: Sharma General Store" />
        <Row t={1} ok={true} text="Amount: ₹100" />
      </Panel>
      {f >= L.c(8) - 4 && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(8) - 4, L.dur, 14, 12)}}>
          <div style={{position: 'absolute', left: 1370 - 110, top: 260, width: 220, height: 220, borderRadius: 110, background: `${U.green}22`, border: `4px solid ${U.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 60px ${U.green}66`}}><Icon k="shield" s={120} /></div>
          <OnText f={f} a={L.c(8) + 6} y={540} size={40} text="TECHNOLOGY + YOUR ALERTNESS" />
          <OnText f={f} a={L.c(8) + 14} y={610} size={28} color={U.green} text="= SAFER PAYMENTS" />
        </div>
      )}
    </>
  );
};
