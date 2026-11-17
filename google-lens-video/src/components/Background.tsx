import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';

const Blob: React.FC<{x: number; y: number; size: number; color: string; drift: number; phase: number}> = ({x, y, size, color, drift, phase}) => {
  const f = useCurrentFrame();
  // Very slow, smooth drift (no shake)
  const dx = Math.sin(f / 90 + phase) * drift;
  const dy = Math.cos(f / 110 + phase) * drift;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2 + dx,
        top: y - size / 2 + dy,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        opacity: 0.22,
      }}
    />
  );
};

export const Background: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(135deg, #F8FAFD 0%, #EEF2F9 48%, #F5F2FA 100%)'}}>
    <Blob x={260} y={180} size={900} color={C.blue} drift={18} phase={0} />
    <Blob x={1700} y={240} size={760} color={C.green} drift={16} phase={1.4} />
    <Blob x={1600} y={940} size={820} color={C.yellow} drift={14} phase={2.6} />
    <Blob x={360} y={980} size={760} color={C.red} drift={12} phase={4.1} />
    <AbsoluteFill
      style={{
        backgroundImage: 'radial-gradient(rgba(60,80,120,0.16) 1.3px, transparent 1.4px)',
        backgroundSize: '32px 32px',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, #000 0%, transparent 85%)',
        opacity: 0.55,
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(40,55,90,0.10) 100%)'}} />
  </AbsoluteFill>
);
