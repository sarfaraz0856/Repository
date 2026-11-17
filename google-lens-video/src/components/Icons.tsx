import React from 'react';
import {C} from '../theme';

/** Original four-colour lens glyph (inspired, not a reproduction of any logo) */
export const LensGlyph: React.FC<{size: number; stroke?: number}> = ({size, stroke = 3.2}) => {
  const r = 9;
  const c = 2 * Math.PI * r;
  const seg = c / 4;
  const colors = [C.blue, C.red, C.yellow, C.green];
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      {colors.map((col, i) => (
        <circle
          key={col}
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={stroke}
          strokeDasharray={`${seg - 2.2} ${c - seg + 2.2}`}
          strokeDashoffset={-i * seg}
          strokeLinecap="round"
          transform="rotate(-45 14 14)"
        />
      ))}
      <circle cx="14" cy="14" r="3.2" fill={C.blue} />
    </svg>
  );
};

export const SearchIcon: React.FC<{size: number; color?: string; sw?: number}> = ({size, color = '#fff', sw = 2.4}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth={sw} />
    <path d="M15.5 15.5L20 20" stroke={color} strokeWidth={sw} strokeLinecap="round" />
  </svg>
);

export const MicIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="3" width="6" height="11" rx="3" fill={C.blue} />
    <path d="M6 11a6 6 0 0 0 12 0" stroke={C.red} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 17v4" stroke={C.green} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Check: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.2 4.2L19 7" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconBox: React.FC<{kind: 'detect' | 'brain' | 'search'; size: number}> = ({kind, size}) => {
  const s = size;
  if (kind === 'detect')
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" fill="#fff" />
      </svg>
    );
  if (kind === 'brain')
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {[[6, 7], [6, 17], [12, 12], [18, 7], [18, 17], [12, 4], [12, 20]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="#fff" />
        ))}
        <path d="M6 7L12 12L18 7M6 17L12 12L18 17M12 4V12V20" stroke="#fff" strokeWidth="1.3" opacity="0.8" />
      </svg>
    );
  return <SearchIcon size={s} />;
};

export const Stars: React.FC<{size: number}> = ({size}) => (
  <span style={{color: C.yellow, fontSize: size, letterSpacing: 1}}>★★★★★</span>
);
