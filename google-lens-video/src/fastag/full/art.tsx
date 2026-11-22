import React from 'react';
import {U, UF} from '../../upi/theme';

/** generic illustrative FASTag sticker. cut = 0..1 reveals the RFID chip + antenna inside */
export const Sticker: React.FC<{w?: number; glow?: number; cut?: number; chipGlow?: number}> = ({w = 300, glow = 0, cut = 0, chipGlow = 0}) => {
  const h = w * 0.62;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.06, background: '#fff', overflow: 'hidden', fontFamily: UF.ui, boxShadow: `0 0 ${40 * glow}px rgba(34,197,94,${0.7 * glow}), 0 20px 44px rgba(30,45,90,0.22)`}}>
      <div style={{height: h * 0.27, background: `linear-gradient(90deg, ${U.blue}, ${U.green})`, color: '#fff', fontWeight: 800, fontSize: w * 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 1}}>FASTag</div>
      <svg width={w} height={h * 0.73} viewBox="0 0 160 74">
        {Array.from({length: 22}).map((_, i) => <rect key={i} x={10 + i * 4.5} y={12} width={i % 3 ? 2 : 3} height={34} fill="#0F172A" />)}
        <rect x={116} y={12} width={34} height={34} rx={4} fill="none" stroke={U.saffron} strokeWidth={2} />
        <rect x={124} y={20} width={18} height={18} rx={2} fill={U.saffron} opacity={0.8} />
        <text x={80} y={64} textAnchor="middle" fontSize={9} fill="#64748B" fontFamily="Inter">illustrative tag</text>
      </svg>
      {/* cut-away: the inlay inside the sticker */}
      {cut > 0.01 && (
        <svg width={w} height={h} viewBox="0 0 200 124" style={{position: 'absolute', inset: 0, opacity: cut}}>
          <rect x={0} y={0} width={200} height={124} fill="rgba(241,245,249,0.96)" />
          {/* dipole-style antenna */}
          <path d="M14 62 h40 v-26 h22 v52 h-22 v-26 M186 62 h-40 v-26 h-22 v52 h22 v-26" fill="none" stroke="#B45309" strokeWidth={4} strokeLinejoin="round" />
          <path d="M76 62 h48" stroke="#B45309" strokeWidth={4} />
          <rect x={90} y={52} width={20} height={20} rx={3} fill="#0F172A" stroke={chipGlow > 0 ? U.cyan : '#334155'} strokeWidth={2 + 2 * chipGlow} />
          {chipGlow > 0.02 && <circle cx={100} cy={62} r={14 + 10 * chipGlow} fill="none" stroke={U.cyan} strokeWidth={2} opacity={chipGlow} />}
          <text x={100} y={100} textAnchor="middle" fontSize={11} fill="#0F172A" fontFamily="Inter" fontWeight={700}>chip</text>
          <text x={34} y={24} textAnchor="middle" fontSize={11} fill="#B45309" fontFamily="Inter" fontWeight={700}>antenna</text>
          <text x={166} y={24} textAnchor="middle" fontSize={11} fill="#B45309" fontFamily="Inter" fontWeight={700}>antenna</text>
        </svg>
      )}
    </div>
  );
};

/** radio wave arcs travelling from (x, y) in direction dir (1 down / -1 up) */
export const Waves: React.FC<{f: number; x: number; y: number; on: boolean; dir?: number; color?: string; len?: number}> = ({f, x, y, on, dir = 1, color = U.cyan, len = 160}) => {
  if (!on) return null;
  return (
    <>
      {[0, 1, 2].map((k) => {
        const t = ((f / 12) + k / 3) % 1;
        const r = 30 + t * len;
        return <div key={k} style={{position: 'absolute', left: x - r, top: dir > 0 ? y + t * len * 0.6 - r * 0.2 : y - t * len * 0.6 - r * 0.8, width: r * 2, height: r, borderRadius: '50%', [dir > 0 ? 'borderBottom' : 'borderTop']: `4px solid ${color}`, opacity: 1 - t} as React.CSSProperties} />;
      })}
    </>
  );
};
