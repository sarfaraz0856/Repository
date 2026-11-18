import React from 'react';

/** Non-functional demonstration QR pattern (random modules – cannot be scanned or paid). */
export const DemoQR: React.FC<{size: number; color?: string; seed?: number}> = ({size, color = '#0F172A', seed = 7}) => {
  const N = 29;
  const cell = size / N;
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  const center = (x: number, y: number) => x > 10 && x < 18 && y > 10 && y < 18;
  const rects: React.ReactNode[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const v = rnd();
      if (inFinder(x, y) || center(x, y)) continue;
      if (v > 0.52) rects.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.3} height={cell + 0.3} fill={color} />);
    }
  const finder = (fx: number, fy: number) => (
    <g key={`${fx}${fy}`}>
      <rect x={fx * cell} y={fy * cell} width={7 * cell} height={7 * cell} fill={color} rx={cell * 1.2} />
      <rect x={(fx + 1) * cell} y={(fy + 1) * cell} width={5 * cell} height={5 * cell} fill="#fff" rx={cell * 0.9} />
      <rect x={(fx + 2) * cell} y={(fy + 2) * cell} width={3 * cell} height={3 * cell} fill={color} rx={cell * 0.6} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" />
      {rects}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
      <rect x={10.5 * cell} y={12 * cell} width={8 * cell} height={5 * cell} rx={cell} fill="#fff" stroke={color} strokeWidth={cell * 0.35} />
      <text x={size / 2} y={15.2 * cell} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={cell * 2.1} fill={color}>DEMO</text>
    </svg>
  );
};
