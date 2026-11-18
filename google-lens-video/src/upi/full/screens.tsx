import React from 'react';
import {EIO, EO, ip} from '../../anim';
import {U, UF} from '../theme';
import {DemoQR} from '../QR';
import {MERCHANT} from '../screens';

export const SW = 402, SH = 852;

export const Bar: React.FC<{dark?: boolean}> = ({dark}) => {
  const c = dark ? U.ink : '#fff';
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: SW, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 34px 0', boxSizing: 'border-box', fontFamily: UF.ui, fontWeight: 600, fontSize: 16, color: c, zIndex: 5}}>
      <span>9:41</span>
      <span style={{width: 26, height: 12, border: `1.5px solid ${c}`, borderRadius: 4, padding: 1.5, boxSizing: 'border-box'}}><span style={{display: 'block', width: '78%', height: '100%', background: c, borderRadius: 1.5}} /></span>
    </div>
  );
};

export const Tap: React.FC<{x: number; y: number; f: number; at: number; color?: string}> = ({x, y, f, at, color = U.blue}) => {
  const t = ip(f, [at, at + 18], [0, 1], EO);
  if (f < at - 6 || t >= 1) return null;
  const press = Math.sin(Math.PI * ip(f, [at - 6, at + 6], [0, 1], EIO));
  return (
    <>
      <div style={{position: 'absolute', left: x - 24, top: y - 24, width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.6)', border: '2px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', opacity: press, zIndex: 9}} />
      {f >= at && <div style={{position: 'absolute', left: x - 24, top: y - 24, width: 48, height: 48, borderRadius: 24, border: `3px solid ${color}`, opacity: 1 - t, transform: `scale(${1 + t * 1.4})`, zIndex: 9}} />}
    </>
  );
};

const Avatar: React.FC<{t: string; c: string; s?: number}> = ({t, c, s = 52}) => (
  <div style={{width: s, height: s, borderRadius: s / 2, background: c, color: '#fff', fontWeight: 800, fontSize: s * 0.38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{t}</div>
);

/** UPI app home. hi = index of highlighted tile (-1 none) */
export const AppHome: React.FC<{f: number; hi?: number; showBank?: number}> = ({f, hi = -1, showBank = 1}) => {
  const tiles: [string, string, string][] = [['⌗', 'Scan any QR', U.blue], ['👤', 'Pay contacts', '#7C5CFF'], ['📱', 'Pay phone number', U.saffron], ['🏦', 'Bank transfer', U.green], ['₹', 'Check balance', U.cyan], ['@', 'Pay UPI ID', '#EC4899']];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <div style={{position: 'absolute', inset: '0 0 auto 0', height: 230, background: `linear-gradient(160deg, ${U.navy2}, #163A7A)`}} />
      <Bar />
      <div style={{position: 'absolute', top: 66, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff'}}>
        <div><div style={{fontSize: 14, opacity: 0.75}}>Good evening</div><div style={{fontSize: 22, fontWeight: 800}}>UPI Pay <span style={{fontSize: 12, fontWeight: 700, opacity: 0.7}}>(demo app)</span></div></div>
        <Avatar t="ME" c={U.blue} s={44} />
      </div>
      <div style={{position: 'absolute', top: 132, left: 20, right: 20, padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', opacity: showBank}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 14}}><span style={{opacity: 0.8}}>Linked account</span><span style={{fontWeight: 700}}>Sender Bank ••••1234</span></div>
        <div style={{fontSize: 13, marginTop: 6, opacity: 0.75}}>Money stays in your bank account</div>
      </div>
      <div style={{position: 'absolute', top: 262, left: 20, right: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10}}>
        {tiles.map(([ic, t, c], i) => (
          <div key={t} style={{height: 112, borderRadius: 18, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: i === hi ? `0 0 0 3px ${c}, 0 12px 24px ${c}44` : '0 4px 12px rgba(15,23,42,0.06)', transform: `scale(${i === hi ? 1.05 : 1})`}}>
            <div style={{width: 46, height: 46, borderRadius: 14, background: `${c}22`, color: c, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{ic}</div>
            <div style={{fontSize: 13, fontWeight: 700, color: U.ink, textAlign: 'center', padding: '0 4px'}}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 520, left: 24, fontSize: 15, fontWeight: 800, color: U.ink}}>Recent</div>
      {[['SG', MERCHANT.name, '−₹100', U.saffron], ['RK', 'Ravi K. (demo)', '+₹250', U.green], ['AM', 'Asha M. (demo)', '−₹40', '#7C5CFF']].map(([a, n, amt, c], i) => (
        <div key={n} style={{position: 'absolute', top: 552 + i * 70, left: 20, right: 20, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: '#fff'}}>
          <Avatar t={a} c={c} s={40} />
          <span style={{flex: 1, fontSize: 15, fontWeight: 600, color: U.ink}}>{n}</span>
          <span style={{fontSize: 15, fontWeight: 800, color: amt.startsWith('+') ? U.green : U.ink}}>{amt}</span>
        </div>
      ))}
      <div style={{position: 'absolute', top: 790, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Illustrative demo app</div>
    </div>
  );
};

/** Scanner with detect time */
export const Scanner: React.FC<{f: number; det: number; dynamic?: boolean}> = ({f, det, dynamic}) => {
  const d = ip(f, [det, det + 8], [0, 1]);
  const box = {x: 76, y: 250, s: 250};
  const col = d > 0.5 ? U.green : U.cyan;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#1B2433', fontFamily: UF.ui, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#3B4656 0%, #2A3342 55%, #8A6A4A 56%, #6E5236 100%)'}} />
      <div style={{position: 'absolute', left: 70, top: 160, width: 262, height: 430, borderRadius: 18, background: '#fff'}}>
        <div style={{height: 64, borderRadius: '18px 18px 0 0', background: U.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20}}>Scan & Pay</div>
        <div style={{position: 'absolute', left: 11, top: 96}}><DemoQR size={240} seed={dynamic ? 19 : 7} /></div>
      </div>
      <svg width={SW} height={SH} style={{position: 'absolute', inset: 0}}>
        <defs><mask id="w2"><rect width={SW} height={SH} fill="#fff" /><rect x={box.x} y={box.y} width={box.s} height={box.s} rx={22} fill="#000" /></mask></defs>
        <rect width={SW} height={SH} fill="rgba(5,10,20,0.6)" mask="url(#w2)" />
        {[[0, 0], [1, 0], [1, 1], [0, 1]].map(([cx, cy], i) => {
          const x = box.x + cx * box.s, y = box.y + cy * box.s, L = 38, sx = cx ? -1 : 1, sy = cy ? -1 : 1;
          return <path key={i} d={`M${x},${y + sy * L} L${x},${y} L${x + sx * L},${y}`} stroke={col} strokeWidth={6} fill="none" strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${col})`}} />;
        })}
      </svg>
      {d < 0.5 && <div style={{position: 'absolute', left: box.x + 10, width: box.s - 20, top: box.y + 10 + ((f % 46) / 46) * (box.s - 20), height: 3, background: `linear-gradient(90deg, transparent, ${U.cyan}, transparent)`, boxShadow: `0 0 16px 4px ${U.cyan}88`}} />}
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', color: '#fff', fontSize: 19, fontWeight: 700}}>Scan any UPI QR code</div>
      <div style={{position: 'absolute', top: box.y + box.s + 34, width: '100%', display: 'flex', justifyContent: 'center', opacity: d}}>
        <span style={{padding: '10px 18px', borderRadius: 24, background: U.green, color: '#fff', fontWeight: 700, fontSize: 17}}>✓ QR read · payment details found</span>
      </div>
      <div style={{position: 'absolute', bottom: 60, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 14}}>Demo QR · not payable</div>
      <Bar />
    </div>
  );
};

/** Pay screen: merchant + amount + Pay button */
export const PayScreen: React.FC<{f: number; amount?: string; prefilled?: boolean; payAt?: number; verifyHi?: number; name?: string; vpa?: string}> = ({f, amount = '100', prefilled, payAt = 1e9, verifyHi = 0, name = MERCHANT.name, vpa = MERCHANT.vpa}) => {
  const press = Math.sin(Math.PI * ip(f, [payAt - 4, payAt + 6], [0, 1], EIO));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 64, left: 24, fontSize: 15, fontWeight: 700, color: U.sub, letterSpacing: 1}}>PAYING</div>
      <div style={{position: 'absolute', top: 96, left: 20, right: 20, display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 18, background: '#fff', boxShadow: verifyHi > 0 ? `0 0 0 ${3 * verifyHi}px ${U.green}` : undefined}}>
        <Avatar t={name.split(' ').map((x) => x[0]).slice(0, 2).join('')} c={U.saffron} s={54} />
        <div>
          <div style={{fontSize: 18, fontWeight: 800, color: U.ink}}>{name}</div>
          <div style={{fontSize: 13.5, color: U.sub, marginTop: 2}}>{vpa}</div>
          <div style={{fontSize: 13, fontWeight: 700, color: U.green, marginTop: 4}}>✓ Name shown by the network</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center'}}>
        <div style={{fontSize: 74, fontWeight: 800, color: U.ink, letterSpacing: -2}}>₹{amount}</div>
        {prefilled !== undefined && <div style={{display: 'inline-block', marginTop: 6, padding: '6px 14px', borderRadius: 14, background: prefilled ? '#DCFCE7' : '#E0E7FF', color: prefilled ? '#166534' : '#3730A3', fontSize: 14, fontWeight: 700}}>{prefilled ? 'Amount pre-filled by QR' : 'You enter the amount'}</div>}
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 420, padding: 16, borderRadius: 16, background: '#FFF7ED', color: '#9A3412', fontSize: 14.5, lineHeight: 1.45}}>⚠️ Check the receiver's name and amount before you pay.</div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 690, height: 64, borderRadius: 32, background: U.blue, color: '#fff', fontSize: 21, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(49,133,255,0.45)', transform: `scale(${1 - 0.05 * press})`}}>Pay ₹{amount}</div>
      <Tap x={201} y={722} f={f} at={payAt} />
      <div style={{position: 'absolute', top: 772, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Illustrative demo</div>
    </div>
  );
};

/** PIN pad with masked entry */
export const PinPad: React.FC<{f: number; taps: number[]; submit: number; wrong?: boolean}> = ({f, taps, submit, wrong}) => {
  const filled = taps.filter((t) => f >= t).length;
  const pos: [number, number][] = [[201, 520], [75, 584], [327, 648], [201, 712], [75, 520], [327, 584]];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: UF.ui}}>
      <div style={{position: 'absolute', inset: '0 0 auto 0', height: 300, background: `linear-gradient(160deg, ${U.navy2}, #13306B)`}} />
      <Bar />
      <div style={{position: 'absolute', top: 66, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 15, fontWeight: 700}}><span style={{opacity: 0.85}}>Sender Bank ••••1234</span><span>₹100</span></div>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: '#fff', fontSize: 17, opacity: 0.85}}>Paying {MERCHANT.name}</div>
      <div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: 800}}>ENTER UPI PIN</div>
      <div style={{position: 'absolute', top: 244, width: '100%', display: 'flex', justifyContent: 'center', gap: 22}}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{width: 22, height: 22, borderRadius: 11, border: '2.5px solid #fff', background: i < filled ? '#fff' : 'transparent'}} />)}
      </div>
      <div style={{position: 'absolute', top: 318, left: 24, right: 24, padding: '12px 14px', borderRadius: 14, background: '#FFF7ED', color: '#9A3412', fontSize: 13.5}}>🔒 PIN is masked. The app does not show or store it.</div>
      <div style={{position: 'absolute', left: 20, right: 20, top: 488, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6}}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => (
          <div key={k} style={{height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 600, color: k === '✓' ? '#fff' : U.ink, background: k === '✓' ? (filled === 4 ? U.green : '#94A3B8') : 'transparent'}}>{k}</div>
        ))}
      </div>
      {taps.map((t, i) => <Tap key={i} x={pos[i % 6][0]} y={pos[i % 6][1]} f={f} at={t} color={U.navy2} />)}
      <Tap x={327} y={712} f={f} at={submit} color={U.green} />
      {wrong && f >= submit + 8 && (
        <div style={{position: 'absolute', left: 24, right: 24, top: 400, padding: 14, borderRadius: 14, background: '#FEE2E2', color: '#991B1B', fontSize: 15, fontWeight: 700, opacity: ip(f, [submit + 8, submit + 16], [0, 1])}}>✕ Incorrect UPI PIN · payment declined (demo)</div>
      )}
    </div>
  );
};

export const Processing: React.FC<{f: number; a: number; label?: string}> = ({f, a, label = 'Processing payment…'}) => (
  <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
    <Bar dark />
    <div style={{position: 'absolute', top: 190, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <svg width={150} height={150} viewBox="0 0 150 150"><circle cx={75} cy={75} r={60} stroke="#E2E8F0" strokeWidth={10} fill="none" /><circle cx={75} cy={75} r={60} stroke={U.blue} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="95 280" transform={`rotate(${(f - a) * 9} 75 75)`} /></svg>
    </div>
    <div style={{position: 'absolute', top: 380, width: '100%', textAlign: 'center', fontSize: 24, fontWeight: 800, color: U.ink}}>{label}</div>
    <div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontSize: 16, color: U.sub}}>₹100 to {MERCHANT.name}</div>
    <div style={{position: 'absolute', top: 690, width: '100%', display: 'flex', justifyContent: 'center'}}><span style={{padding: '9px 16px', borderRadius: 18, background: '#E0F2FE', color: '#0369A1', fontSize: 14.5, fontWeight: 700}}>🔒 Encrypted · Secure</span></div>
  </div>
);

export type Kind = 'success' | 'pending' | 'failed' | 'received';
export const StatusScreen: React.FC<{f: number; a: number; kind: Kind; sub?: string}> = ({f, a, kind, sub}) => {
  const pop = ip(f, [a, a + 14], [0, 1], EO);
  const cfg = {
    success: {bg: `linear-gradient(170deg,#16A34A,${U.green})`, icon: '✓', title: 'Payment Successful', note: `Paid to ${MERCHANT.name}`},
    pending: {bg: 'linear-gradient(170deg,#D97706,#F59E0B)', icon: '⏳', title: 'Payment Pending', note: 'Awaiting final confirmation'},
    failed: {bg: 'linear-gradient(170deg,#B91C1C,#EF4444)', icon: '✕', title: 'Payment Failed', note: 'If money was debited, a reversal may follow'},
    received: {bg: `linear-gradient(170deg,#1D4ED8,${U.blue})`, icon: '↓', title: 'Money Received', note: 'No UPI PIN needed to receive'},
  }[kind];
  return (
    <div style={{position: 'absolute', inset: 0, background: cfg.bg, fontFamily: UF.ui, color: '#fff'}}>
      <Bar />
      <div style={{position: 'absolute', top: 160, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 140, height: 140, borderRadius: 70, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * pop})`}}>
          <div style={{width: 100, height: 100, borderRadius: 50, background: '#fff', color: kind === 'pending' ? '#D97706' : kind === 'failed' ? '#DC2626' : kind === 'received' ? U.blue : U.green, fontSize: 52, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{cfg.icon}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontSize: 26, fontWeight: 800, opacity: pop}}>{cfg.title}</div>
      <div style={{position: 'absolute', top: 372, width: '100%', textAlign: 'center', fontSize: 62, fontWeight: 800, opacity: pop}}>₹100</div>
      <div style={{position: 'absolute', top: 462, left: 30, right: 30, textAlign: 'center', fontSize: 17, opacity: 0.92}}>{sub ?? cfg.note}</div>
      <div style={{position: 'absolute', top: 772, width: '100%', textAlign: 'center', fontSize: 12.5, opacity: 0.85}}>Illustrative demo transaction</div>
    </div>
  );
};

/** Fake cashback request (scam example) */
export const ScamScreen: React.FC<{f: number; warnAt: number}> = ({f, warnAt}) => {
  const w = ip(f, [warnAt, warnAt + 12], [0, 1]);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 70, left: 20, right: 20, padding: 18, borderRadius: 20, background: 'linear-gradient(135deg,#FDE68A,#FCA5A5)'}}>
        <div style={{fontSize: 14, fontWeight: 700, color: '#7C2D12'}}>🎁 Congratulations!</div>
        <div style={{fontSize: 24, fontWeight: 800, color: '#7C2D12', marginTop: 4}}>₹500 Cashback</div>
        <div style={{fontSize: 14, color: '#7C2D12', marginTop: 4}}>Scan & enter UPI PIN to receive</div>
      </div>
      <div style={{position: 'absolute', top: 230, left: 20, right: 20, padding: 16, borderRadius: 18, background: '#fff'}}>
        <div style={{fontSize: 14, color: U.sub}}>Request from</div>
        <div style={{fontSize: 18, fontWeight: 800, color: U.ink}}>unknown.reward@demo</div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 16}}><span style={{color: U.sub}}>Type</span><b style={{color: '#DC2626'}}>Collect request (you PAY)</b></div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 16}}><span style={{color: U.sub}}>Amount</span><b>₹500</b></div>
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 690, height: 60, borderRadius: 30, background: '#94A3B8', color: '#fff', fontSize: 19, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Enter PIN to receive</div>
      <div style={{position: 'absolute', inset: 0, background: `rgba(127,29,29,${0.55 * w})`}} />
      <div style={{position: 'absolute', left: 24, right: 24, top: 430, padding: 20, borderRadius: 20, background: '#fff', border: '3px solid #DC2626', opacity: w, transform: `scale(${0.9 + 0.1 * w})`}}>
        <div style={{fontSize: 22, fontWeight: 800, color: '#DC2626'}}>⚠️ Stop! This is a scam pattern</div>
        <div style={{fontSize: 15, color: U.ink, marginTop: 8, lineHeight: 1.45}}>Entering your UPI PIN authorises a payment. You never need a PIN to receive money.</div>
      </div>
      <div style={{position: 'absolute', top: 790, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub, zIndex: 3}}>Fictional example</div>
    </div>
  );
};

/** Transaction history with statuses */
export const History: React.FC<{f: number; hi?: number; reversedAt?: number}> = ({f, hi = -1, reversedAt = 1e9}) => {
  const rows: [string, string, string, string][] = [
    ['Payment to Sharma General Store', '−₹100', 'Pending', '#D97706'],
    ['Refund (auto-reversal)', '+₹100', 'Credited', U.green],
    ['Payment to Ravi K. (demo)', '−₹250', 'Successful', U.green],
    ['Payment to Asha M. (demo)', '−₹40', 'Failed · not debited', '#DC2626'],
  ];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 66, left: 24, fontSize: 24, fontWeight: 800, color: U.ink}}>Transaction History</div>
      <div style={{position: 'absolute', top: 104, left: 24, fontSize: 14, color: U.sub}}>Check status before retrying</div>
      {rows.map(([t, a, s, c], i) => {
        if (i === 1 && f < reversedAt) return null;
        return (
          <div key={t} style={{position: 'absolute', top: 150 + i * 96, left: 18, right: 18, padding: 14, borderRadius: 16, background: '#fff', boxShadow: i === hi ? `0 0 0 3px ${U.blue}` : '0 4px 12px rgba(15,23,42,0.05)', opacity: i === 1 ? ip(f, [reversedAt, reversedAt + 12], [0, 1]) : 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{fontSize: 15, fontWeight: 700, color: U.ink}}>{t}</span><span style={{fontSize: 16, fontWeight: 800, color: a.startsWith('+') ? U.green : U.ink}}>{a}</span></div>
            <div style={{marginTop: 6, fontSize: 13.5, fontWeight: 700, color: c}}>● {s}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', top: 772, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Illustrative entries</div>
    </div>
  );
};

/** sequence of screens with cross-slide */
export const ScreenSeq: React.FC<{f: number; seq: [number, React.ReactNode][]}> = ({f, seq}) => {
  let k = 0;
  seq.forEach(([s], i) => { if (f >= s) k = i; });
  const t = ip(f, [seq[k][0], seq[k][0] + 9], [0, 1], EIO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      {k > 0 && t < 1 && <div style={{position: 'absolute', inset: 0}}>{seq[k - 1][1]}</div>}
      <div style={{position: 'absolute', inset: 0, opacity: k === 0 ? 1 : t, transform: k === 0 ? undefined : `translateX(${(1 - t) * 40}px)`}}>{seq[k][1]}</div>
    </div>
  );
};
