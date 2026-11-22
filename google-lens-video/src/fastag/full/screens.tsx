import React from 'react';
import {EIO, EO, ip} from '../../anim';
import {U, UF} from '../../upi/theme';
import {Bar, Tap} from '../../upi/full/screens';

/** Illustrative FASTag wallet app (issuer bank app). All names, numbers and IDs are demo values. */
export const DEMO = {bank: 'Demo Bank', plate: 'DEMO 1234', tid: '34161FA8 2032 9E30 0000 1234', cls: 'VC4 · Car / Jeep / Van'};
type Status = 'active' | 'low' | 'blacklisted';
const ST: Record<Status, [string, string, string]> = {
  active: ['Active', U.green, '#DCFCE7'], low: ['Low balance', '#D97706', '#FEF3C7'], blacklisted: ['Blacklisted', U.red, '#FEE2E2'],
};

const Pill: React.FC<{s: Status}> = ({s}) => (
  <span style={{padding: '4px 12px', borderRadius: 14, background: ST[s][2], color: ST[s][1], fontWeight: 800, fontSize: 14}}>● {ST[s][0]}</span>
);

const Top: React.FC<{title: string}> = ({title}) => (
  <div style={{position: 'absolute', top: 54, left: 0, right: 0, height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', boxSizing: 'border-box'}}>
    <div style={{width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${U.blue}, ${U.green})`, color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>TAG</div>
    <div><div style={{fontSize: 19, fontWeight: 800, color: U.ink}}>{title}</div><div style={{fontSize: 12.5, color: U.sub}}>{DEMO.bank} · illustrative app</div></div>
  </div>
);

/** wallet home: balance (animates from -> to at `at`), status, actions */
export const AppHome: React.FC<{f: number; from?: number; to?: number; at?: number; status?: Status; statusAt?: number; status2?: Status; hi?: string}> = ({f, from = 500, to = from, at = 1e9, status = 'active', statusAt = 1e9, status2 = 'active', hi}) => {
  const p = ip(f, [at, at + 22], [0, 1], EIO);
  const bal = Math.round(from + (to - from) * p);
  const s = f >= statusAt ? status2 : status;
  const flash = Math.sin(Math.PI * ip(f, [at, at + 20], [0, 1]));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <Top title="FASTag Wallet" />
      <div style={{position: 'absolute', top: 136, left: 18, right: 18, padding: 22, borderRadius: 26, background: 'linear-gradient(140deg,#1E3A8A,#2563EB 60%,#0EA5E9)', color: '#fff', boxShadow: '0 16px 34px rgba(37,99,235,0.35)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: 15, opacity: 0.85}}>Vehicle</span><Pill s={s} />
        </div>
        <div style={{fontSize: 26, fontWeight: 800, letterSpacing: 1, marginTop: 4}}>{DEMO.plate}</div>
        <div style={{fontSize: 14, opacity: 0.85, marginTop: 16}}>Wallet balance</div>
        <div style={{fontSize: 44, fontWeight: 800, fontVariantNumeric: 'tabular-nums', textShadow: flash > 0 ? `0 0 ${20 * flash}px rgba(255,255,255,0.8)` : undefined}}>₹{bal}</div>
      </div>
      <div style={{position: 'absolute', top: 372, left: 18, right: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
        {[['⚡', 'Recharge'], ['🧾', 'History'], ['🏷️', 'Tag details']].map(([i, l]) => (
          <div key={l} style={{padding: '16px 0', borderRadius: 18, background: '#fff', textAlign: 'center', boxShadow: '0 6px 16px rgba(30,45,90,0.08)', border: hi === l ? `2px solid ${U.blue}` : '2px solid transparent'}}>
            <div style={{fontSize: 26}}>{i}</div><div style={{fontSize: 14, fontWeight: 700, color: U.ink, marginTop: 4}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 500, left: 18, right: 18, padding: 18, borderRadius: 20, background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.08)'}}>
        <div style={{fontSize: 14, color: U.sub, fontWeight: 600}}>Tag ID</div>
        <div style={{fontSize: 16, fontWeight: 700, color: U.ink, fontFamily: 'monospace', marginTop: 4}}>{DEMO.tid}</div>
        <div style={{fontSize: 14, color: U.sub, fontWeight: 600, marginTop: 12}}>Vehicle class</div>
        <div style={{fontSize: 16, fontWeight: 700, color: U.ink, marginTop: 4}}>{DEMO.cls}</div>
      </div>
      <div style={{position: 'absolute', bottom: 30, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Demo values for explanation only</div>
    </div>
  );
};

type Tx = {t: string; place: string; amt: string; col?: string; flag?: string; at?: number};
/** transaction history list; rows can appear at given frames */
export const History: React.FC<{f: number; rows: Tx[]; title?: string}> = ({f, rows, title = 'Toll history'}) => (
  <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
    <Bar dark />
    <Top title={title} />
    <div style={{position: 'absolute', top: 136, left: 16, right: 16}}>
      {rows.map((r, i) => {
        const e = r.at === undefined ? 1 : ip(f, [r.at, r.at + 14], [0, 1], EO);
        if (e <= 0.01) return null;
        return (
          <div key={i} style={{marginBottom: 12, padding: '14px 16px', borderRadius: 18, background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.08)', border: r.flag ? `2px solid ${r.col ?? U.red}` : '2px solid transparent', opacity: e, transform: `translateY(${(1 - e) * 14}px)`}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span style={{fontSize: 16, fontWeight: 700, color: U.ink}}>{r.place}</span>
              <span style={{fontSize: 17, fontWeight: 800, color: r.col ?? U.ink}}>{r.amt}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 13, color: U.sub}}>
              <span>{r.t}</span>{r.flag && <span style={{fontWeight: 800, color: r.col ?? U.red}}>{r.flag}</span>}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/** recharge flow: amount -> pay via UPI (tap at payAt) -> success at okAt */
export const Recharge: React.FC<{f: number; payAt: number; okAt: number}> = ({f, payAt, okAt}) => {
  const ok = ip(f, [okAt, okAt + 14], [0, 1], EO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <Top title="Recharge FASTag" />
      <div style={{position: 'absolute', top: 140, left: 18, right: 18, padding: 22, borderRadius: 22, background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.08)'}}>
        <div style={{fontSize: 14, color: U.sub}}>Vehicle</div><div style={{fontSize: 20, fontWeight: 800, color: U.ink}}>{DEMO.plate}</div>
        <div style={{fontSize: 14, color: U.sub, marginTop: 16}}>Amount</div><div style={{fontSize: 52, fontWeight: 800, color: U.ink}}>₹500</div>
        <div style={{display: 'flex', gap: 10, marginTop: 10}}>{['₹200', '₹500', '₹1000'].map((a) => <span key={a} style={{padding: '6px 14px', borderRadius: 14, background: a === '₹500' ? '#DBEAFE' : '#F1F5F9', color: a === '₹500' ? U.blue : U.sub, fontWeight: 700, fontSize: 15}}>{a}</span>)}</div>
      </div>
      <div style={{position: 'absolute', top: 430, left: 18, right: 18, padding: '16px 20px', borderRadius: 18, background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontSize: 16, fontWeight: 700, color: U.ink}}>Pay using</span><span style={{fontSize: 16, fontWeight: 800, color: U.blue}}>UPI ▾</span>
      </div>
      <div style={{position: 'absolute', top: 720, left: 18, right: 18, padding: '18px 0', borderRadius: 18, background: U.blue, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 20}}>Pay ₹500</div>
      <Tap x={201} y={750} f={f} at={payAt} />
      {ok > 0.01 && (
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg,#16A34A,${U.green})`, color: '#fff', opacity: ok, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 220}}>
          <div style={{width: 110, height: 110, borderRadius: 55, background: '#fff', color: U.green, fontSize: 60, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.7 + 0.3 * ok})`}}>✓</div>
          <div style={{fontSize: 26, fontWeight: 800, marginTop: 30}}>Recharge Successful</div>
          <div style={{fontSize: 56, fontWeight: 800, marginTop: 8}}>₹500</div>
          <div style={{fontSize: 16, opacity: 0.9, marginTop: 10, textAlign: 'center', padding: '0 30px'}}>Balance may take a little time to update</div>
        </div>
      )}
    </div>
  );
};

/** fake "KYC expired" scam message with a warning overlay at warnAt */
export const ScamSms: React.FC<{f: number; warnAt: number}> = ({f, warnAt}) => {
  const w = ip(f, [warnAt, warnAt + 12], [0, 1], EO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
      <Bar dark />
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontSize: 15, color: U.sub}}>Messages · Unknown sender</div>
      <div style={{position: 'absolute', top: 120, left: 18, right: 60, padding: '16px 18px', borderRadius: '20px 20px 20px 6px', background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.1)', fontSize: 17, lineHeight: 1.5, color: U.ink}}>
        URGENT: Your FASTag KYC has expired and the tag will be blocked today. Update now: <span style={{color: U.blue, textDecoration: 'underline'}}>fastag-kyc-update.example</span> and share the OTP.
      </div>
      {w > 0.01 && (
        <div style={{position: 'absolute', top: 330, left: 18, right: 18, padding: 22, borderRadius: 22, background: '#FEF2F2', border: `2px solid ${U.red}`, opacity: w, transform: `scale(${0.9 + 0.1 * w})`}}>
          <div style={{fontSize: 22, fontWeight: 800, color: '#B91C1C'}}>⚠️ Possible scam</div>
          <div style={{fontSize: 16, color: U.ink, marginTop: 10, lineHeight: 1.5}}>Never share OTP / PIN. Use only your bank's official app or website.</div>
        </div>
      )}
      <div style={{position: 'absolute', bottom: 30, width: '100%', textAlign: 'center', fontSize: 12.5, color: U.sub}}>Illustrative example of a fake message</div>
    </div>
  );
};

/** SMS inbox with toll debit messages */
export const SmsInbox: React.FC<{f: number; msgs: {at: number; text: string; col?: string}[]}> = ({f, msgs}) => (
  <div style={{position: 'absolute', inset: 0, background: '#F4F7FC', fontFamily: UF.ui}}>
    <Bar dark />
    <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontSize: 15, color: U.sub}}>Messages · {DEMO.bank}</div>
    <div style={{position: 'absolute', top: 120, left: 18, right: 50}}>
      {msgs.map((m, i) => {
        const e = ip(f, [m.at, m.at + 14], [0, 1], EO);
        if (e <= 0.01) return null;
        return <div key={i} style={{marginBottom: 14, padding: '14px 16px', borderRadius: '20px 20px 20px 6px', background: '#fff', boxShadow: '0 6px 16px rgba(30,45,90,0.1)', fontSize: 16, lineHeight: 1.45, color: U.ink, borderLeft: `5px solid ${m.col ?? U.blue}`, opacity: e, transform: `translateY(${(1 - e) * 16}px)`}}>{m.text}</div>;
      })}
    </div>
  </div>
);
