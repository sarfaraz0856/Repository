import React from 'react';
import {EIO, ip} from '../../../anim';
import {U, UF} from '../../theme';
import {sc, loc} from '../tl';
import {PinPad, Processing, ScreenSeq, StatusScreen} from '../screens';
import {Edges, Header, Icon, NodeBox, OnText, Packet, Panel, Row, X0, XW, vis, P} from '../kit';

const S = sc('s5'); const L = loc(S);
const taps = [0, 6, 12, 18].map((k) => L.w(0, 'PIN') + k);
const sub = taps[3] + 9;
const wtaps = [0, 5, 10, 15].map((k) => L.c(7) + 4 + k);
const wsub = wtaps[3] + 8;

export const Screen: React.FC<{f: number}> = ({f}) => (
  <ScreenSeq f={f} seq={[
    [0, <PinPad f={f} taps={taps} submit={sub} />],
    [L.c(3), <Processing f={f} a={L.c(3)} label="Securing request…" />],
    [L.w(6, 'Verify'), <StatusScreen f={f} a={L.w(6, 'Verify')} kind="success" sub="Authorised by your bank" />],
    [L.c(7), <PinPad f={f} taps={wtaps} submit={wsub} wrong />],
    [L.c(8), <StatusScreen f={f} a={L.c(8)} kind="success" sub="PIN = your authorisation" />],
  ]} />
);

const HEX = ['7F2A 9C1E 44B0', 'E91D 03AF 6C2B', 'A0C4 5E77 1D9F'];

export const Stage: React.FC<{f: number}> = ({f}) => {
  const card = vis(f, L.c(1) - 4, L.c(5), 14, 14);
  const enc = ip(f, [L.w(4, 'Encryption'), L.w(4, 'Encryption') + 24], [0, 1], EIO);
  const shield = ip(f, [L.c(2), L.c(2) + 30], [0, 1], EIO);
  const rows: [string, string][] = [['To', 'sharma.store@demo'], ['Amount', '₹100'], ['UPI PIN', '• • • •']];
  const ph: P = [1080, 760], bank: P = [1720, 760];
  return (
    <>
      <Header f={f} dur={L.dur} n="05" title="WHAT HAPPENS WHEN YOU ENTER YOUR UPI PIN?" />
      <OnText f={f} a={L.c(1)} b={L.c(5)} y={140} size={44} text="PAYMENT AUTHORIZATION" />
      {card > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: card}}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path d="M1370 225 L1610 290 L1610 470 C1610 580 1500 650 1370 690 C1240 650 1130 580 1130 470 L1130 290 Z" fill={`${U.cyan}12`} stroke={U.cyan} strokeWidth={4} strokeDasharray="1500" strokeDashoffset={1500 * (1 - shield)} style={{filter: `drop-shadow(0 0 14px ${U.cyan})`}} />
          </svg>
          <div style={{position: 'absolute', left: 1190, top: 330, width: 360, fontFamily: UF.ui}}>
            {rows.map(([k, v], i) => (
              <div key={k} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 16px', marginTop: 8, borderRadius: 12, background: 'rgba(7,17,31,0.85)', border: `1px solid ${enc > 0.5 ? U.cyan : 'rgba(255,255,255,0.2)'}`, fontSize: 20, color: '#fff'}}>
                <span style={{color: 'rgba(255,255,255,0.6)'}}>{enc > 0.5 ? 'block ' + (i + 1) : k}</span>
                <b style={{fontFamily: enc > 0.5 ? 'monospace' : UF.ui, color: enc > 0.5 ? U.cyan : '#fff'}}>{enc > 0.5 ? HEX[i] : v}</b>
              </div>
            ))}
          </div>
          <OnText f={f} a={L.c(4)} b={L.c(5)} y={720} size={36} color={U.cyan} text="SECURE AUTHENTICATION · ENCRYPTED" />
          <div style={{position: 'absolute', left: X0, top: 700, width: XW, textAlign: 'center', fontFamily: UF.ui, fontSize: 19, color: 'rgba(255,255,255,0.75)', opacity: ip(f, [L.c(2), L.c(2) + 14], [0, 1]) * (1 - ip(f, [L.c(4) - 4, L.c(4)], [0, 1]))}}>Your bank uses it to confirm the payment is approved by you</div>
        </div>
      )}
      {/* PIN never shown / stored */}
      <Panel x={X0 + 120} y={240} w={720} t={vis(f, L.c(5) - 2, L.c(6), 14, 12)} glow={U.red}>
        <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: U.saffron}}>PROTECTED</div>
        <Row t={1} ok={true} text="PIN shown only as masked dots" />
        <Row t={ip(f, [L.w(5, 'पढ़ने'), L.w(5, 'पढ़ने') + 12], [0, 1])} ok={false} text="A regular UPI app cannot read your PIN" />
        <Row t={ip(f, [L.w(5, 'Store'), L.w(5, 'Store') + 12], [0, 1])} ok={false} text="A regular UPI app cannot store your PIN" />
      </Panel>
      {/* bank checks */}
      {f >= L.c(6) - 4 && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(6) - 4, L.c(8), 14, 14)}}>
          <Edges f={f} live edges={[[ph, bank, L.c(6)]]} />
          <NodeBox x={ph[0]} y={ph[1]} t={1} label="Your phone" sub="encrypted request" icon="phone" color={U.blue} w={210} />
          <NodeBox x={bank[0]} y={bank[1]} t={1} label="Your Bank" sub="verifies" icon="bank" color={f >= L.c(7) ? U.red : U.green} active w={210} />
          <Packet f={f} pts={[ph, bank]} a={L.c(6)} b={L.c(6) + 30} color={U.cyan} />
          <Panel x={X0 + 120} y={190} w={720} t={1} glow={f >= L.c(7) ? U.red : U.green}>
            {f < L.c(7) ? (
              <>
                <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: U.green}}>BANK CHECKS</div>
                {['UPI PIN correct', 'Enough balance', 'Security checks passed'].map((t, i) => <Row key={t} t={ip(f, [L.c(6) + 20 + i * 10, L.c(6) + 32 + i * 10], [0, 1])} ok={f >= L.c(6) + 30 + i * 10 ? true : null} text={t} />)}
                <div style={{marginTop: 10, fontFamily: UF.head, fontSize: 30, fontWeight: 800, color: U.green, opacity: ip(f, [L.c(6) + 60, L.c(6) + 72], [0, 1])}}>APPROVED ✓</div>
              </>
            ) : (
              <>
                <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: U.red}}>PAYMENT MAY BE DECLINED IF…</div>
                {[['Wrong UPI PIN', 'PIN'], ['Insufficient balance', 'Balance'], ['A security check fails', 'Security']].map(([t, w]) => <Row key={t} t={ip(f, [L.w(7, w), L.w(7, w) + 12], [0, 1])} ok={false} text={t} />)}
              </>
            )}
          </Panel>
        </div>
      )}
      <OnText f={f} a={L.c(8)} y={360} size={56} text="UPI PIN" />
      <OnText f={f} a={L.c(8) + 10} y={450} size={34} color={U.cyan} text="= TRANSACTION AUTHORIZATION" />
      <div style={{position: 'absolute', left: X0, top: 540, width: XW, display: 'flex', justifyContent: 'center', opacity: ip(f, [L.c(8) + 20, L.c(8) + 34], [0, 1])}}><div style={{width: 110, height: 110, borderRadius: 55, background: `${U.green}33`, border: `3px solid ${U.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="shield" s={60} /></div></div>
    </>
  );
};
