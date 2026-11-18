import React from 'react';
import {EIO, ip} from '../../../anim';
import {U, UF} from '../../theme';
import {sc, loc} from '../tl';
import {PayScreen, Scanner, ScreenSeq} from '../screens';
import {DemoQR} from '../../QR';
import {Edges, Header, Icon, NodeBox, OnText, Packet, Panel, X0, XW, vis, P} from '../kit';

const S = sc('s4'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => {
  const det = L.w(0, 'Scan') + 16;
  const pre = f >= L.w(2, 'पहले') && f < L.w(2, 'खुद');
  return <ScreenSeq f={f} seq={[[0, <Scanner f={f} det={det} dynamic={f >= L.c(2)} />], [L.c(1), <PayScreen f={f} prefilled={f >= L.c(2) ? pre : undefined} verifyHi={f >= L.c(6) ? 0.6 + 0.4 * Math.sin(f / 5) : 0} />]]} />;
};

export const Stage: React.FC<{f: number}> = ({f}) => {
  const qrT = vis(f, 6, L.c(2), 14, 14);
  const split = ip(f, [L.c(1), L.c(1) + 20], [0, 1], EIO);
  const fields: [string, string, string, string][] = [['pa', 'Payee Address', 'sharma.store@demo', 'UPI ID'], ['pn', 'Merchant Name', 'Sharma General Store', 'दुकानदार'], ['am', 'Amount (if included)', '100', 'Details']];
  return (
    <>
      <Header f={f} dur={L.dur} n="04" title="HOW QR CODES AND UPI IDS WORK" />
      {qrT > 0.01 && (
        <div style={{position: 'absolute', inset: 0, opacity: qrT}}>
          <div style={{position: 'absolute', left: 1020 - split * 70, top: 230, width: 340, height: 340, borderRadius: 24, overflow: 'hidden', boxShadow: `0 0 50px ${U.cyan}55`, transform: `scale(${1 - 0.15 * split})`}}>
            <DemoQR size={340} />
            {f < L.c(1) && <div style={{position: 'absolute', left: 0, right: 0, top: ((f % 50) / 50) * 340, height: 4, background: U.cyan, boxShadow: `0 0 20px 6px ${U.cyan}`}} />}
          </div>
          <OnText f={f} a={L.c(0) + 30} b={L.c(2)} y={640} size={40} x={X0} w={560} color={U.cyan} text="QR CODE = PAYMENT INFORMATION" />
          <Panel x={1360} y={190} w={480} t={split} glow={U.cyan}>
            <div style={{fontFamily: 'monospace', fontSize: 15, color: U.cyan, wordBreak: 'break-all'}}>upi://pay?pa=sharma.store@demo&amp;pn=Sharma%20General%20Store&amp;am=100</div>
            {fields.map(([k, n, v, w], i) => (
              <div key={k} style={{marginTop: 14, padding: '10px 14px', borderRadius: 14, background: 'rgba(0,217,255,0.08)', border: `1px solid ${U.cyan}44`, opacity: ip(f, [L.c(1) + 10 + i * 10, L.c(1) + 24 + i * 10], [0, 1])}}>
                <div style={{fontSize: 13.5, color: 'rgba(255,255,255,0.6)'}}><b style={{color: U.cyan, fontFamily: 'monospace'}}>{k}=</b> {n}</div>
                <div style={{fontSize: 21, fontWeight: 700}}>{v}</div>
              </div>
            ))}
            <div style={{fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12}}>Illustrative demo fields</div>
          </Panel>
        </div>
      )}
      {/* static vs dynamic */}
      {[['STATIC QR', 'You enter the amount', 'खुद', 'Same QR for every customer', U.blue], ['DYNAMIC QR', 'Amount already included', 'पहले', 'Generated for one bill', U.green]].map(([t, d, w, s, c], i) => (
        <Panel key={t} x={X0 + 20 + i * 470} y={260} w={440} t={vis(f, L.c(2) + i * 8, L.c(3), 14, 12)} glow={f >= L.w(2, w) ? c : undefined}>
          <div style={{display: 'flex', justifyContent: 'center'}}><div style={{borderRadius: 14, overflow: 'hidden'}}><DemoQR size={170} seed={i ? 19 : 7} /></div></div>
          <div style={{fontFamily: UF.head, fontSize: 30, fontWeight: 800, marginTop: 16, textAlign: 'center', color: c}}>{t}</div>
          <div style={{fontSize: 21, fontWeight: 700, textAlign: 'center', marginTop: 6}}>{d}</div>
          <div style={{fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4}}>{s}</div>
        </Panel>
      ))}
      {/* UPI ID as address */}
      {f >= L.c(3) - 4 && f < L.c(5) + 10 && (
        <div style={{position: 'absolute', inset: 0, opacity: vis(f, L.c(3) - 4, L.c(5) + 10, 14, 14)}}>
          <OnText f={f} a={L.c(3)} y={180} size={48} text="UPI ID = DIGITAL PAYMENT ADDRESS" />
          <div style={{position: 'absolute', left: X0, top: 300, width: XW, textAlign: 'center', fontFamily: 'monospace', fontSize: 56, fontWeight: 800, color: '#fff', opacity: ip(f, [L.c(3) + 10, L.c(3) + 24], [0, 1])}}>
            <span style={{color: U.cyan}}>sharma.store</span><span style={{color: U.saffron}}>@demo</span>
          </div>
          <div style={{position: 'absolute', left: X0, top: 380, width: XW, display: 'flex', justifyContent: 'center', gap: 160, fontFamily: UF.ui, fontSize: 17, color: 'rgba(255,255,255,0.6)', opacity: ip(f, [L.c(3) + 20, L.c(3) + 34], [0, 1])}}><span>name</span><span>handle</span></div>
          {[['mail', 'friend@email.com', '→ reaches an inbox', 'Email'], ['bank', 'sharma.store@demo', '→ reaches a bank account', 'UPI']].map(([ic, a, b, w], i) => (
            <Panel key={a} x={X0 + 40 + i * 460} y={470} w={420} t={ip(f, [L.w(4, w), L.w(4, w) + 14], [0, 1])}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{width: 54, height: 54, borderRadius: 16, background: i ? U.green : U.blue, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={ic} s={30} /></div>
                <div><div style={{fontFamily: 'monospace', fontSize: 20, fontWeight: 700}}>{a}</div><div style={{fontSize: 16, color: 'rgba(255,255,255,0.65)'}}>{b}</div></div>
              </div>
            </Panel>
          ))}
          {f >= L.c(5) - 4 && (() => {
            const a: P = [1000, 760], b: P = [1370, 760], c: P = [1740, 760];
            return (
              <>
                <Edges f={f} live edges={[[a, b, L.c(5)], [b, c, L.c(5) + 8]]} />
                <NodeBox x={a[0]} y={a[1]} t={ip(f, [L.c(5), L.c(5) + 12], [0, 1])} label="UPI ID" sub="sharma.store@demo" icon="user" color={U.blue} w={210} />
                <NodeBox x={b[0]} y={b[1]} t={ip(f, [L.c(5) + 6, L.c(5) + 18], [0, 1])} label="Network resolves" sub="PSP / NPCI lookup" icon="switch" color={U.saffron} w={210} />
                <NodeBox x={c[0]} y={c[1]} t={ip(f, [L.c(5) + 12, L.c(5) + 24], [0, 1])} label="Bank account" sub="Receiver ••••5678" icon="bank" color={U.green} w={210} />
                <Packet f={f} pts={[a, b, c]} a={L.c(5) + 20} b={L.c(5) + 60} color={U.cyan} label="@" />
              </>
            );
          })()}
        </div>
      )}
      {/* verify receiver */}
      <Panel x={X0 + 140} y={260} w={680} t={vis(f, L.c(6) - 2, L.dur, 14, 14)} glow={U.saffron}>
        <div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: U.saffron}}>BEFORE YOU PAY</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, padding: 16, borderRadius: 16, background: 'rgba(34,197,94,0.1)', border: `1.5px solid ${U.green}`}}>
          <div style={{width: 56, height: 56, borderRadius: 28, background: U.saffron, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20}}>SG</div>
          <div style={{flex: 1}}><div style={{fontSize: 24, fontWeight: 800}}>Sharma General Store</div><div style={{fontSize: 16, color: 'rgba(255,255,255,0.6)'}}>Is this the person you want to pay?</div></div>
          <div style={{fontSize: 34, color: U.green}}>✓</div>
        </div>
        <div style={{marginTop: 16, fontSize: 19, lineHeight: 1.5, color: '#FFD7A8', opacity: ip(f, [L.w(6, 'गलत'), L.w(6, 'गलत') + 14], [0, 1])}}>⚠️ Money sent to the wrong person is not always easy to get back.</div>
      </Panel>
      <OnText f={f} a={L.c(6) + 10} y={640} size={42} color={U.saffron} text="VERIFY THE RECEIVER'S NAME" />
    </>
  );
};
