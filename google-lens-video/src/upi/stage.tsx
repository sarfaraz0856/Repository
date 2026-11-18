import React from 'react';
import {EIO, EO, ip} from '../anim';
import {U, UF} from './theme';
import {BT, UT} from './timeline';
import {DemoQR} from './QR';
import {MERCHANT} from './screens';

// ---------------------------------------------------------------- icons
export const BankIcon: React.FC<{s?: number; c?: string}> = ({s = 40, c = '#fff'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 2L2 7v2h20V7zM4 10h3v8H4zm6.5 0h3v8h-3zM17 10h3v8h-3zM2 19h20v3H2z" fill={c} /></svg>
);
const PhoneIcon: React.FC<{s?: number}> = ({s = 40}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="3" fill="none" stroke="#fff" strokeWidth="2" /><text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily="Inter">₹</text></svg>
);
const ServerIcon: React.FC<{s?: number}> = ({s = 40}) => (
  <svg width={s} height={s} viewBox="0 0 24 24">{[3, 10, 17].map((y) => <g key={y}><rect x="3" y={y} width="18" height="5" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.8" /><circle cx="7" cy={y + 2.5} r="1" fill="#fff" /></g>)}</svg>
);
const SwitchIcon: React.FC<{s?: number}> = ({s = 56}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="#fff" />{[[12, 2], [22, 12], [12, 22], [2, 12]].map(([x, y], i) => <g key={i}><line x1="12" y1="12" x2={x} y2={y} stroke="#fff" strokeWidth="1.8" /><circle cx={x} cy={y} r="1.8" fill="#fff" /></g>)}</svg>
);

// ---------------------------------------------------------------- shop scene (0 .. shopOut)
export const Shop: React.FC<{f: number}> = ({f}) => {
  const out = ip(f, [BT.shopOut, BT.shopOut + 16], [1, 0], EIO);
  const enter = ip(f, [0, 20], [0, 1]);
  if (out <= 0.01) return null;
  const steps: [string, number][] = [['Scan', BT.scanDetect], ['Amount', BT.payTap], ['PIN', BT.pinSubmit], ['Pay', BT.processing]];
  return (
    <div style={{position: 'absolute', left: 900, top: 120, width: 940, height: 800, opacity: out * enter, filter: out < 1 ? `blur(${(1 - out) * 6}px)` : undefined, fontFamily: UF.ui}}>
      {/* shop facade */}
      <div style={{position: 'absolute', left: 120, top: 40, width: 700, height: 520, borderRadius: 28, background: 'linear-gradient(180deg,#14233D,#0E1A2E)', border: `1px solid ${U.line}`, overflow: 'hidden'}}>
        <div style={{display: 'flex', height: 70}}>{Array.from({length: 14}).map((_, i) => <div key={i} style={{flex: 1, background: [U.saffron, '#F8FAFC', U.green][i % 3], borderRadius: '0 0 30px 30px'}} />)}</div>
        <div style={{position: 'absolute', top: 92, width: '100%', textAlign: 'center', fontFamily: UF.head, fontWeight: 800, fontSize: 30, color: '#fff', letterSpacing: 1}}>{MERCHANT.name.toUpperCase()}</div>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{position: 'absolute', left: 40, right: 40, top: 160 + r * 90, height: 70, borderBottom: '6px solid #2B3B57', display: 'flex', alignItems: 'flex-end', gap: 10, paddingLeft: 10}}>
            {Array.from({length: 11}).map((_, i) => <div key={i} style={{width: 38, height: 34 + ((i * 7 + r * 5) % 4) * 8, borderRadius: 5, background: [U.blue, U.saffron, U.green, '#E2E8F0', U.red][(i + r * 2) % 5], opacity: 0.85}} />)}
          </div>
        ))}
      </div>
      {/* counter */}
      <div style={{position: 'absolute', left: 60, top: 520, width: 820, height: 150, borderRadius: 20, background: 'linear-gradient(180deg,#8B5E34,#6B4423)', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}} />
      {/* QR standee */}
      <div style={{position: 'absolute', left: 340, top: 250, width: 260, height: 350, borderRadius: 20, background: '#fff', boxShadow: '0 24px 50px rgba(0,0,0,0.5)', transform: `scale(${1 + 0.04 * Math.sin(Math.PI * ip(f, [BT.scanDetect - 6, BT.scanDetect + 10], [0, 1]))})`}}>
        <div style={{height: 54, borderRadius: '20px 20px 0 0', background: U.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20}}>Scan & Pay</div>
        <div style={{position: 'absolute', left: 30, top: 74}}><DemoQR size={200} /></div>
        <div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', fontSize: 14, fontWeight: 700, color: U.sub}}>Demo QR · not payable</div>
        {f >= BT.scanDetect && <div style={{position: 'absolute', inset: -8, borderRadius: 26, border: `4px solid ${U.green}`, opacity: ip(f, [BT.scanDetect, BT.scanDetect + 30], [1, 0]), boxShadow: `0 0 30px ${U.green}`}} />}
      </div>
      {/* step chips */}
      <div style={{position: 'absolute', left: 0, top: 700, width: 940, display: 'flex', justifyContent: 'center', gap: 14}}>
        {steps.map(([t, at], i) => {
          const done = f >= at;
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 30, background: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', border: `1.5px solid ${done ? U.green : U.line}`, color: done ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 21, fontWeight: 700}}>
              <span style={{width: 26, height: 26, borderRadius: 13, background: done ? U.green : 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14}}>{done ? '✓' : i + 1}</span>{t}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- network
type P = [number, number];
export const NODE: Record<string, P> = {
  phone: [800, 470],
  app: [1050, 290],
  psp: [1050, 650],
  npci: [1390, 470],
  sbank: [1735, 290],
  rbank: [1735, 650],
};
const appearAt = (k: string) => (k === 'app' ? BT.nodeApp : k === 'psp' ? BT.nodePSP : k === 'npci' ? BT.nodeNPCI : k === 'phone' ? BT.network : BT.nodeBanks);
const EDGES: [string, string][] = [['phone', 'app'], ['app', 'psp'], ['psp', 'npci'], ['npci', 'sbank'], ['npci', 'rbank']];

// packet route: request (cyan) -> debit at sender bank -> credit at receiver bank -> confirmation (green) back
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const pathPos = (pts: P[], t: number): P => {
  const segs = pts.length - 1;
  const x = Math.min(segs - 1e-6, Math.max(0, t * segs));
  const i = Math.floor(x);
  return lerp(pts[i], pts[i + 1], EIO(x - i));
};

const Node: React.FC<{k: string; f: number; label: string; sub: string; icon: React.ReactNode; color: string; big?: boolean; dim: number}> = ({k, f, label, sub, icon, color, big, dim}) => {
  const a = appearAt(k);
  const t = ip(f, [a, a + 14], [0, 1], EO);
  if (t <= 0.01) return null;
  const [x, y] = NODE[k];
  const w = big ? 250 : 210;
  const active = (k === 'sbank' && f >= BT.debit - 4 && f < BT.debit + 24) || (k === 'rbank' && f >= BT.credit - 4 && f < BT.credit + 24) || (k === 'npci' && f >= BT.flow && f < BT.success);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - (big ? 75 : 62), width: w, height: big ? 150 : 124, borderRadius: 22, background: 'linear-gradient(160deg, rgba(20,38,70,0.95), rgba(10,22,42,0.95))', border: `1.5px solid ${active ? color : 'rgba(120,160,255,0.28)'}`, boxShadow: active ? `0 0 34px ${color}66, inset 0 0 18px ${color}22` : '0 16px 40px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: t * dim, transform: `scale(${0.85 + 0.15 * t})`, fontFamily: UF.ui}}>
      <div style={{width: big ? 64 : 50, height: big ? 64 : 50, borderRadius: 16, background: `linear-gradient(140deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${color}55`}}>{icon}</div>
      <div style={{fontSize: big ? 24 : 20, fontWeight: 800, color: '#fff'}}>{label}</div>
      <div style={{fontSize: 13.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600}}>{sub}</div>
    </div>
  );
};

const Ledger: React.FC<{x: number; y: number; from: number; to: number; at: number; f: number; dim: number}> = ({x, y, from, to, at, f, dim}) => {
  const vis = ip(f, [BT.nodeBanks + 6, BT.nodeBanks + 18], [0, 1]);
  if (vis <= 0.01) return null;
  const t = ip(f, [at, at + 22], [0, 1], EIO);
  const val = Math.round(from + (to - from) * t);
  const delta = to - from;
  const col = delta < 0 ? U.red : U.green;
  return (
    <div style={{position: 'absolute', left: x - 105, top: y, width: 210, padding: '10px 14px', borderRadius: 16, background: 'rgba(7,17,31,0.9)', border: `1.5px solid ${f >= at ? col : 'rgba(120,160,255,0.25)'}`, fontFamily: UF.ui, opacity: vis * dim, boxSizing: 'border-box'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600}}><span>{delta < 0 ? 'Sender A/c' : 'Receiver A/c'}</span><span>ledger</span></div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4}}>
        <span style={{fontSize: 24, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums'}}>₹{val.toLocaleString('en-IN')}</span>
        <span style={{fontSize: 17, fontWeight: 800, color: col, opacity: ip(f, [at, at + 8], [0, 1])}}>{delta < 0 ? '−' : '+'}₹{Math.abs(delta)}</span>
      </div>
    </div>
  );
};

export const Network: React.FC<{f: number}> = ({f}) => {
  if (f < BT.network - 2) return null;
  const dim = 1 - 0.75 * ip(f, [BT.title - 6, BT.title + 14], [0, 1], EIO);
  const blur = 5 * ip(f, [BT.title - 6, BT.title + 14], [0, 1], EIO);
  const req: P[] = [NODE.phone, NODE.app, NODE.psp, NODE.npci, NODE.sbank];
  const mid: P[] = [NODE.sbank, NODE.npci, NODE.rbank];
  const back: P[] = [NODE.rbank, NODE.npci, NODE.psp, NODE.app, NODE.phone];
  const packets: {pts: P[]; a: number; b: number; col: string; lock?: boolean}[] = [
    {pts: req, a: BT.flow, b: BT.debit - 2, col: U.cyan, lock: true},
    {pts: mid, a: BT.debit + 4, b: BT.credit - 2, col: U.blue, lock: true},
    {pts: back, a: BT.credit + 4, b: BT.success - 2, col: U.green},
  ];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: dim, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={U.blue} /><stop offset="1" stopColor={U.cyan} /></linearGradient>
        </defs>
        {EDGES.map(([a, b]) => {
          const t = ip(f, [Math.max(appearAt(a), appearAt(b)), Math.max(appearAt(a), appearAt(b)) + 14], [0, 1], EIO);
          const [x1, y1] = NODE[a], [x2, y2] = NODE[b];
          const live = f >= BT.flow && f < BT.success + 10;
          return (
            <g key={a + b}>
              <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} stroke="url(#edge)" strokeOpacity={0.35} strokeWidth={8} strokeLinecap="round" />
              <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} stroke={live ? U.cyan : '#5B7CC9'} strokeWidth={2.5} strokeDasharray="8 8" strokeDashoffset={live ? -(f * 2) % 16 : 0} />
            </g>
          );
        })}
      </svg>
      {/* header + question while the network assembles */}
      <div style={{position: 'absolute', left: 900, top: 120, width: 940, textAlign: 'center', fontFamily: UF.ui, fontSize: 22, fontWeight: 700, letterSpacing: 6, color: U.cyan, opacity: ip(f, [BT.network, BT.network + 14], [0, 1])}}>BEHIND THE SCREEN</div>
      {(() => {
        const q = Math.min(ip(f, [BT.network + 2, BT.network + 16], [0, 1], EO), ip(f, [BT.nodeApp - 6, BT.nodeApp + 8], [1, 0], EIO));
        return q > 0.01 ? <div style={{position: 'absolute', left: 900, top: 330, width: 940, textAlign: 'center', fontFamily: UF.head, fontWeight: 800, fontSize: 220, color: '#fff', opacity: q * 0.9, transform: `scale(${0.8 + 0.2 * q})`, textShadow: `0 0 60px ${U.blue}`}}>?</div> : null;
      })()}
      {(() => {
        const g = Math.sin(Math.PI * ip(f, [BT.mobile - 4, BT.mobile + 26], [0, 1]));
        return g > 0.01 ? <div style={{position: 'absolute', left: 540 - 270, top: 8, width: 540, height: 1064, borderRadius: 84, boxShadow: `0 0 0 6px ${U.cyan}, 0 0 70px ${U.cyan}`, opacity: g * 0.8}} /> : null;
      })()}
      <Node k="app" f={f} label="UPI App" sub="Payment request" icon={<PhoneIcon s={30} />} color={U.blue} dim={1} />
      <Node k="psp" f={f} label="PSP" sub="Payment Service Provider" icon={<ServerIcon s={28} />} color="#7C5CFF" dim={1} />
      <Node k="npci" f={f} label="NPCI" sub="UPI Switch" icon={<SwitchIcon s={40} />} color={U.saffron} big dim={1} />
      <Node k="sbank" f={f} label="Sender Bank" sub="Remitter" icon={<BankIcon s={28} />} color={U.cyan} dim={1} />
      <Node k="rbank" f={f} label="Receiver Bank" sub="Beneficiary" icon={<BankIcon s={28} />} color={U.green} dim={1} />
      <Ledger x={NODE.sbank[0]} y={NODE.sbank[1] + 78} from={5000} to={4900} at={BT.debit} f={f} dim={1} />
      <Ledger x={NODE.rbank[0]} y={NODE.rbank[1] + 78} from={2000} to={2100} at={BT.credit} f={f} dim={1} />
      {packets.map((p, i) => {
        if (f < p.a || f > p.b + 6) return null;
        const t = ip(f, [p.a, p.b], [0, 1], (v) => v);
        const [x, y] = pathPos(p.pts, t);
        return (
          <div key={i} style={{position: 'absolute', left: x - 26, top: y - 18, width: 52, height: 36, borderRadius: 10, background: p.col, boxShadow: `0 0 24px ${p.col}, 0 0 50px ${p.col}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: U.navy, fontWeight: 800, fontFamily: UF.ui}}>
            {p.lock ? '🔒' : '✓'}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 900, top: 880, width: 940, textAlign: 'center', fontFamily: UF.ui, fontSize: 15, color: 'rgba(255,255,255,0.5)', opacity: ip(f, [BT.flow, BT.flow + 12], [0, 1])}}>
        Simplified, illustrative transaction flow
      </div>
    </div>
  );
};

/** 'Instant payment' teaser between the shop and the network: phone -> shopkeeper's bank, encrypted packets + timer */
export const PacketsOut: React.FC<{f: number}> = ({f}) => {
  const a = BT.shopOut + 4;
  const t = Math.min(ip(f, [a, a + 16], [0, 1], EO), ip(f, [BT.network - 6, BT.network + 10], [1, 0], EIO));
  if (t <= 0.01) return null;
  const secs = Math.min(1.8, Math.max(0, (f - BT.processing) / 30) * (1.8 / ((BT.success - BT.processing) / 30)));
  const x0 = 1030, x1 = 1710, y = 520;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: t, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined, fontFamily: UF.ui}}>
      <div style={{position: 'absolute', left: 900, top: 230, width: 940, textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: 6, color: U.cyan}}>INSTANT PAYMENT</div>
      <div style={{position: 'absolute', left: 900, top: 268, width: 940, textAlign: 'center', fontFamily: UF.head, fontSize: 96, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', textShadow: `0 0 40px ${U.blue}88`}}>{secs.toFixed(1)}<span style={{fontSize: 48, color: 'rgba(255,255,255,0.6)'}}> sec</span></div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={x0 + 70} y1={y} x2={x1 - 70} y2={y} stroke={U.blue} strokeOpacity={0.35} strokeWidth={10} strokeLinecap="round" />
        <line x1={x0 + 70} y1={y} x2={x1 - 70} y2={y} stroke={U.cyan} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-(f * 3) % 20} />
      </svg>
      {[[x0, 'You', 'Payer phone', U.blue, <span key="p" style={{fontSize: 34}}>📱</span>], [x1, "Shopkeeper's Bank", 'Receiver', U.green, <BankIcon key="b" s={40} />]].map(([x, l, sub, c, icon]) => (
        <div key={l as string} style={{position: 'absolute', left: (x as number) - 110, top: y - 70, width: 220, textAlign: 'center'}}>
          <div style={{width: 120, height: 120, margin: '0 auto', borderRadius: 60, background: `radial-gradient(circle, ${c as string}55, ${c as string}22)`, border: `2px solid ${c as string}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${c as string}55`, color: '#fff'}}>{icon as React.ReactNode}</div>
          <div style={{fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 12}}>{l as string}</div>
          <div style={{fontSize: 15, color: 'rgba(255,255,255,0.6)'}}>{sub as string}</div>
        </div>
      ))}
      {[0, 1, 2].map((i) => {
        const pa = BT.packetsOut + i * 14;
        const pt = ((f - pa) / 42);
        if (f < pa) return null;
        const u = pt % 1;
        const x = x0 + 90 + u * (x1 - x0 - 180);
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 18, width: 100, height: 36, borderRadius: 10, background: 'rgba(0,217,255,0.16)', border: `1.5px solid ${U.cyan}`, color: U.cyan, fontFamily: 'monospace', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 18px ${U.cyan}66`, opacity: Math.sin(Math.PI * u)}}>
            🔒 {['A9F3', '7C1E', 'E04B', '5D2A'][i]}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 900, top: 700, width: 940, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.75)'}}>
        Encrypted payment data leaves your phone
      </div>
      <div style={{position: 'absolute', left: 900, top: 740, width: 940, textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.45)'}}>Illustrative timing · actual processing time may vary</div>
    </div>
  );
};

// ---------------------------------------------------------------- title + subtitles
export const Title: React.FC<{f: number}> = ({f}) => {
  const a = BT.title;
  const t1 = ip(f, [a, a + 20], [0, 1], EO);
  const t2 = ip(f, [a + 10, a + 30], [0, 1], EO);
  const line = ip(f, [a + 6, a + 34], [0, 1], EIO);
  if (f < a) return null;
  return (
    <div style={{position: 'absolute', left: 880, top: 330, width: 980, textAlign: 'center'}}>
      <div style={{fontFamily: UF.head, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: '#fff', opacity: t1, transform: `translateY(${(1 - t1) * 30}px)`, filter: t1 < 1 ? `blur(${(1 - t1) * 10}px)` : undefined, textShadow: '0 10px 50px rgba(0,0,0,0.6)'}}>
        HOW <span style={{background: `linear-gradient(90deg, ${U.cyan}, ${U.green})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>UPI</span> WORKS
      </div>
      <div style={{height: 4, width: 520 * line, margin: '10px auto 0', borderRadius: 2, background: `linear-gradient(90deg, ${U.saffron}, #fff, ${U.green})`}} />
      <div style={{fontFamily: UF.ui, fontWeight: 700, fontSize: 28, letterSpacing: 7, color: U.cyan, marginTop: 24, opacity: t2, transform: `translateY(${(1 - t2) * 16}px)`}}>THE TECHNOLOGY BEHIND INSTANT PAYMENTS</div>
      <div style={{fontFamily: UF.ui, fontSize: 16, color: 'rgba(255,255,255,0.55)', marginTop: 40, opacity: t2}}>Illustrative transaction timing. Actual processing time may vary.</div>
    </div>
  );
};

export const Subtitles: React.FC<{f: number}> = ({f}) => {
  const cues = UT.cues;
  return (
    <>
      {cues.map((c, i) => {
        const end = i < cues.length - 1 ? cues[i + 1].from - 2 : c.from + c.dur + 18;
        const t = Math.min(ip(f, [c.from - 4, c.from + 6], [0, 1]), ip(f, [end - 6, end], [1, 0]));
        if (t <= 0.01) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 880, width: 980, bottom: 46, display: 'flex', justifyContent: 'center', opacity: t}}>
            <div style={{maxWidth: 940, padding: '12px 24px', borderRadius: 14, background: 'rgba(5,10,20,0.72)', fontFamily: UF.hi, fontWeight: 600, fontSize: 30, lineHeight: 1.45, color: '#fff', textAlign: 'center'}}>{c.text}</div>
          </div>
        );
      })}
    </>
  );
};
