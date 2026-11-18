import React from 'react';
import {EIO, EO, ip} from '../anim';
import {U, UF} from './theme';
import {BT} from './timeline';
import {DemoQR} from './QR';

const SW = 402, SH = 852;
export const MERCHANT = {name: 'Sharma General Store', short: 'SG', vpa: 'sharma.store@demo'};

const StatusBar: React.FC<{dark?: boolean}> = ({dark}) => {
  const c = dark ? U.ink : '#fff';
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: SW, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 34px 0', boxSizing: 'border-box', fontFamily: UF.ui, fontWeight: 600, fontSize: 16, color: c, zIndex: 5}}>
      <span>9:41</span>
      <span style={{display: 'flex', gap: 6, alignItems: 'center'}}>
        <svg width="18" height="12" viewBox="0 0 18 12">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 4.6} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="1" fill={c} />)}</svg>
        <span style={{width: 26, height: 12, border: `1.5px solid ${c}`, borderRadius: 4, padding: 1.5, boxSizing: 'border-box'}}><span style={{display: 'block', width: '78%', height: '100%', background: c, borderRadius: 1.5}} /></span>
      </span>
    </div>
  );
};

const Ripple: React.FC<{x: number; y: number; f: number; at: number; color?: string}> = ({x, y, f, at, color = U.blue}) => {
  const t = ip(f, [at, at + 18], [0, 1], EO);
  if (f < at - 6 || t >= 1) return null;
  const press = Math.sin(Math.PI * ip(f, [at - 6, at + 6], [0, 1], EIO));
  return (
    <>
      <div style={{position: 'absolute', left: x - 24, top: y - 24, width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.6)', border: '2px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', opacity: press}} />
      {f >= at && <div style={{position: 'absolute', left: x - 24, top: y - 24, width: 48, height: 48, borderRadius: 24, border: `3px solid ${color}`, opacity: 1 - t, transform: `scale(${1 + t * 1.4})`}} />}
    </>
  );
};

/** Camera scanning the shop's QR standee */
export const ScannerScreen: React.FC<{f: number}> = ({f}) => {
  const det = ip(f, [BT.scanDetect, BT.scanDetect + 8], [0, 1]);
  const focus = ip(f, [0, 22], [6, 0], EIO);
  const box = {x: 76, y: 250, s: 250};
  const scanP = ((f % 46) / 46);
  const frameCol = det > 0.5 ? U.green : U.cyan;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#1B2433', overflow: 'hidden', fontFamily: UF.ui}}>
      {/* camera feed: counter + standee */}
      <div style={{position: 'absolute', inset: -20, filter: `blur(${focus}px)`}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#3B4656 0%, #2A3342 55%, #8A6A4A 56%, #6E5236 100%)'}} />
        <div style={{position: 'absolute', left: 70, top: 160, width: 302, height: 470, borderRadius: 18, background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.45)'}}>
          <div style={{height: 70, borderRadius: '18px 18px 0 0', background: U.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22}}>Scan & Pay</div>
          <div style={{position: 'absolute', left: 26, top: 110}}><DemoQR size={250} /></div>
          <div style={{position: 'absolute', bottom: 22, width: '100%', textAlign: 'center', fontSize: 17, fontWeight: 700, color: U.ink}}>{MERCHANT.name}</div>
        </div>
      </div>
      {/* darkening mask with clear window */}
      <svg width={SW} height={SH} style={{position: 'absolute', inset: 0}}>
        <defs><mask id="win"><rect width={SW} height={SH} fill="#fff" /><rect x={box.x} y={box.y} width={box.s} height={box.s} rx={22} fill="#000" /></mask></defs>
        <rect width={SW} height={SH} fill="rgba(5,10,20,0.62)" mask="url(#win)" />
        {[[0, 0], [1, 0], [1, 1], [0, 1]].map(([cx, cy], i) => {
          const x = box.x + cx * box.s, y = box.y + cy * box.s, L = 38, sx = cx ? -1 : 1, sy = cy ? -1 : 1;
          return <path key={i} d={`M${x},${y + sy * L} L${x},${y} L${x + sx * L},${y}`} stroke={frameCol} strokeWidth={6} fill="none" strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${frameCol})`}} />;
        })}
      </svg>
      {det < 0.5 && (
        <div style={{position: 'absolute', left: box.x + 10, width: box.s - 20, top: box.y + 10 + scanP * (box.s - 20), height: 3, background: `linear-gradient(90deg, transparent, ${U.cyan}, transparent)`, boxShadow: `0 0 16px 4px ${U.cyan}88`}} />
      )}
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', color: '#fff', fontSize: 19, fontWeight: 700}}>Scan any UPI QR code</div>
      <div style={{position: 'absolute', top: box.y + box.s + 34, width: '100%', display: 'flex', justifyContent: 'center', opacity: det}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 24, background: U.green, color: '#fff', fontWeight: 700, fontSize: 17, boxShadow: '0 8px 20px rgba(34,197,94,0.4)'}}>✓ QR detected · {MERCHANT.short === 'SG' ? MERCHANT.name : ''}</span>
      </div>
      <StatusBar />
    </div>
  );
};

const Key: React.FC<{label: string; active: boolean}> = ({label, active}) => (
  <div style={{height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 600, color: U.ink, background: active ? '#DCE8FF' : 'transparent', transform: `scale(${active ? 0.94 : 1})`}}>{label}</div>
);

const MerchantHead: React.FC<{f: number; dark?: boolean}> = ({f, dark}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px'}}>
    <div style={{width: 56, height: 56, borderRadius: 28, background: `linear-gradient(135deg, ${U.saffron}, #F97316)`, color: '#fff', fontWeight: 800, fontSize: 21, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{MERCHANT.short}</div>
    <div>
      <div style={{fontSize: 19, fontWeight: 800, color: dark ? '#fff' : U.ink}}>{MERCHANT.name}</div>
      <div style={{fontSize: 13.5, color: dark ? 'rgba(255,255,255,0.7)' : U.sub, marginTop: 2}}>{MERCHANT.vpa}</div>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 13, fontWeight: 700, color: U.green, opacity: ip(f, [BT.amountScreen + 8, BT.amountScreen + 18], [0, 1])}}>
        <span style={{width: 16, height: 16, borderRadius: 8, background: U.green, color: '#fff', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>✓</span> Verified merchant
      </div>
    </div>
  </div>
);

export const AmountScreen: React.FC<{f: number}> = ({f}) => {
  const n = BT.digits.filter((d) => f >= d).length;
  const amount = ['', '1', '10', '100'][n];
  const keyActive = (k: string) => BT.digits.some((d, i) => (i === 0 ? k === '1' : k === '0') && f >= d - 2 && f < d + 4);
  const payPress = Math.sin(Math.PI * ip(f, [BT.payTap - 4, BT.payTap + 6], [0, 1], EIO));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <StatusBar dark />
      <div style={{position: 'absolute', top: 64, left: 24, fontSize: 15, fontWeight: 700, color: U.sub, letterSpacing: 1}}>PAYING</div>
      <div style={{position: 'absolute', top: 96, width: '100%'}}><MerchantHead f={f} /></div>
      <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center'}}>
        <div style={{fontSize: 74, fontWeight: 800, color: U.ink, letterSpacing: -2, fontVariantNumeric: 'tabular-nums'}}>
          <span style={{color: n ? U.ink : '#CBD5E1'}}>₹</span>{amount || <span style={{color: '#CBD5E1'}}>0</span>}
          <span style={{display: 'inline-block', width: 3, height: 60, marginLeft: 4, background: U.blue, verticalAlign: 'middle', opacity: Math.floor(f / 15) % 2 && f < BT.payTap ? 1 : 0}} />
        </div>
        <div style={{display: 'inline-block', marginTop: 4, padding: '6px 14px', borderRadius: 14, background: '#E2E8F0', fontSize: 14, color: U.sub}}>Add a note</div>
      </div>
      <div style={{position: 'absolute', left: 20, right: 20, top: 392, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6}}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => <Key key={k} label={k} active={keyActive(k)} />)}
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 690, height: 64, borderRadius: 32, background: n === 3 ? U.blue : '#94A3B8', color: '#fff', fontSize: 21, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: n === 3 ? '0 10px 24px rgba(49,133,255,0.45)' : undefined, transform: `scale(${1 - 0.05 * payPress})`}}>
        Pay ₹{amount || '0'}
      </div>
      <div style={{position: 'absolute', top: 772, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Illustrative demo · not a real merchant</div>
      {BT.digits.map((d, i) => <Ripple key={i} x={i === 0 ? 75 : 201} y={i === 0 ? 421 : 613} f={f} at={d} />)}
      <Ripple x={201} y={722} f={f} at={BT.payTap} />
    </div>
  );
};

export const PinScreen: React.FC<{f: number}> = ({f}) => {
  const filled = BT.pinTaps.filter((t) => f >= t).length;
  const submit = Math.sin(Math.PI * ip(f, [BT.pinSubmit - 4, BT.pinSubmit + 6], [0, 1], EIO));
  const tapPos: [number, number][] = [[201, 520], [75, 584], [327, 648], [201, 712]];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: UF.ui}}>
      <div style={{position: 'absolute', inset: '0 0 auto 0', height: 300, background: `linear-gradient(160deg, ${U.navy2}, #13306B)`}} />
      <StatusBar />
      <div style={{position: 'absolute', top: 66, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', color: '#fff'}}>
        <span style={{fontSize: 15, fontWeight: 700, opacity: 0.85}}>Sender Bank ••••1234</span>
        <span style={{fontSize: 15, fontWeight: 800}}>₹100</span>
      </div>
      <div style={{position: 'absolute', top: 104, width: '100%'}}><MerchantHead f={999999} dark /></div>
      <div style={{position: 'absolute', top: 212, width: '100%', textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: 800}}>ENTER UPI PIN</div>
      <div style={{position: 'absolute', top: 254, width: '100%', display: 'flex', justifyContent: 'center', gap: 22}}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{width: 22, height: 22, borderRadius: 11, border: '2.5px solid #fff', background: i < filled ? '#fff' : 'transparent', transform: `scale(${i === filled - 1 ? 1 + 0.25 * ip(f, [BT.pinTaps[i], BT.pinTaps[i] + 6], [1, 0]) : 1})`}} />
        ))}
      </div>
      <div style={{position: 'absolute', top: 318, left: 24, right: 24, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: '#FFF7ED', color: '#9A3412', fontSize: 13.5, lineHeight: 1.35}}>
        <span style={{fontSize: 18}}>🔒</span> UPI PIN is entered only to authorise a payment. Never share it.
      </div>
      <div style={{position: 'absolute', left: 20, right: 20, top: 400 + 88, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6}}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => (
          <div key={k} style={{height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 600, color: k === '✓' ? '#fff' : U.ink, background: k === '✓' ? (filled === 4 ? U.green : '#94A3B8') : 'transparent', transform: k === '✓' ? `scale(${1 - 0.08 * submit})` : undefined}}>{k}</div>
        ))}
      </div>
      {BT.pinTaps.map((t, i) => <Ripple key={i} x={tapPos[i][0]} y={tapPos[i][1]} f={f} at={t} color={U.navy2} />)}
      <Ripple x={327} y={712} f={f} at={BT.pinSubmit} color={U.green} />
      <div style={{position: 'absolute', top: 800, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Masked PIN · illustrative demo</div>
    </div>
  );
};

export const ProcessingScreen: React.FC<{f: number}> = ({f}) => {
  const a = BT.processing;
  const secs = Math.min(1.8, Math.max(0, (f - a) / 30) * (1.8 / ((BT.success - a) / 30)));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <StatusBar dark />
      <div style={{position: 'absolute', top: 170, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <svg width={170} height={170} viewBox="0 0 170 170">
          <circle cx={85} cy={85} r={70} stroke="#E2E8F0" strokeWidth={10} fill="none" />
          <circle cx={85} cy={85} r={70} stroke={U.blue} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="110 330" transform={`rotate(${(f - a) * 9} 85 85)`} />
          <text x={85} y={96} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={34} fill={U.ink}>{secs.toFixed(1)}s</text>
        </svg>
      </div>
      <div style={{position: 'absolute', top: 370, width: '100%', textAlign: 'center', fontSize: 24, fontWeight: 800, color: U.ink}}>Processing payment…</div>
      <div style={{position: 'absolute', top: 410, width: '100%', textAlign: 'center', fontSize: 16, color: U.sub}}>₹100 to {MERCHANT.name}</div>
      <div style={{position: 'absolute', top: 470, left: 40, right: 40}}>
        {[['Request sent securely', a + 6], ['Bank authorisation', BT.debit], ['Receiver credited', BT.credit]].map(([t, at], i) => {
          const done = f >= (at as number);
          return (
            <div key={t as string} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? '1px solid #E2E8F0' : undefined, opacity: ip(f, [a + i * 6, a + 10 + i * 6], [0, 1])}}>
              <span style={{width: 26, height: 26, borderRadius: 13, background: done ? U.green : '#E2E8F0', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{done ? '✓' : ''}</span>
              <span style={{fontSize: 17, fontWeight: 600, color: done ? U.ink : U.sub}}>{t}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 18, background: '#E0F2FE', color: '#0369A1', fontSize: 14.5, fontWeight: 700}}>🔒 Encrypted · Secure</span>
      </div>
      <div style={{position: 'absolute', top: 772, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Illustrative timing · actual time may vary</div>
    </div>
  );
};

export const SuccessScreen: React.FC<{f: number}> = ({f}) => {
  const a = BT.success;
  const pop = ip(f, [a, a + 16], [0, 1], EO);
  const draw = ip(f, [a + 6, a + 22], [0, 1], EIO);
  return (
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg, #16A34A, ${U.green} 60%, #15803D)`, fontFamily: UF.ui, color: '#fff'}}>
      <StatusBar />
      <div style={{position: 'absolute', top: 150, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 150, height: 150, borderRadius: 75, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * pop})`}}>
          <svg width={110} height={110} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff" /><path d="M6.5 12.5l3.6 3.6L17.5 8.6" stroke={U.green} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - draw)} /></svg>
        </div>
      </div>
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontSize: 26, fontWeight: 800, opacity: pop}}>Payment Successful</div>
      <div style={{position: 'absolute', top: 372, width: '100%', textAlign: 'center', fontSize: 64, fontWeight: 800, letterSpacing: -1, opacity: pop}}>₹100</div>
      <div style={{position: 'absolute', top: 462, width: '100%', textAlign: 'center', fontSize: 17, opacity: 0.92}}>Paid to {MERCHANT.name}</div>
      <div style={{position: 'absolute', top: 530, left: 34, right: 34, padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.16)', fontSize: 14.5, lineHeight: 1.7, opacity: ip(f, [a + 14, a + 26], [0, 1])}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{opacity: 0.8}}>UPI Txn ID</span><b>DEMO 0000 1234</b></div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{opacity: 0.8}}>From</span><b>Sender Bank ••••1234</b></div>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><span style={{opacity: 0.8}}>To</span><b>{MERCHANT.vpa}</b></div>
      </div>
      <div style={{position: 'absolute', top: 772, width: '100%', textAlign: 'center', fontSize: 12.5, opacity: 0.85}}>Illustrative demo transaction</div>
    </div>
  );
};

/** Screen router for the sample */
export const UPIScreen: React.FC<{f: number}> = ({f}) => {
  const layers: [number, React.FC<{f: number}>][] = [[0, ScannerScreen], [BT.amountScreen, AmountScreen], [BT.pinScreen, PinScreen], [BT.processing, ProcessingScreen], [BT.success, SuccessScreen]];
  let k = 0;
  layers.forEach(([s], i) => { if (f >= s) k = i; });
  const Cur = layers[k][1];
  const t = ip(f, [layers[k][0], layers[k][0] + 9], [0, 1], EIO);
  const Prev = k > 0 ? layers[k - 1][1] : null;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      {Prev && t < 1 && <Prev f={f} />}
      <div style={{position: 'absolute', inset: 0, opacity: k === 0 ? 1 : t, transform: k === 0 ? undefined : `translateX(${(1 - t) * 40}px)`}}><Cur f={f} /></div>
    </div>
  );
};
