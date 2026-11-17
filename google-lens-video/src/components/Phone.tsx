import React from 'react';
import {PHONE} from '../theme';
import {LensScreen} from './LensScreen';

/** Realistic modern smartphone shell (original CSS design) */
export const Phone: React.FC = () => {
  const {w, h, inset} = PHONE;
  return (
    <div style={{position: 'absolute', left: PHONE.x, top: PHONE.y, width: w, height: h}}>
      {/* ground shadow */}
      <div style={{position: 'absolute', left: 30, right: 30, bottom: -40, height: 60, borderRadius: '50%', background: 'rgba(30,40,80,0.22)', filter: 'blur(26px)'}} />
      {/* side buttons */}
      <div style={{position: 'absolute', left: -4, top: 180, width: 5, height: 36, borderRadius: 3, background: 'linear-gradient(90deg,#4a4f5a,#2a2e36)'}} />
      <div style={{position: 'absolute', left: -4, top: 236, width: 5, height: 64, borderRadius: 3, background: 'linear-gradient(90deg,#4a4f5a,#2a2e36)'}} />
      <div style={{position: 'absolute', left: -4, top: 312, width: 5, height: 64, borderRadius: 3, background: 'linear-gradient(90deg,#4a4f5a,#2a2e36)'}} />
      <div style={{position: 'absolute', right: -4, top: 260, width: 5, height: 100, borderRadius: 3, background: 'linear-gradient(270deg,#4a4f5a,#2a2e36)'}} />
      {/* frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 68,
          background: 'linear-gradient(145deg, #5A606C 0%, #2B2F37 30%, #1A1D23 60%, #474D58 100%)',
          boxShadow: '0 50px 100px rgba(30,45,90,0.28), 0 18px 40px rgba(30,45,90,0.18), inset 0 0 0 1.5px rgba(255,255,255,0.18)',
        }}
      />
      <div style={{position: 'absolute', inset: 4, borderRadius: 64, background: '#0B0C0F'}} />
      {/* screen */}
      <div style={{position: 'absolute', left: inset, top: inset, width: w - inset * 2, height: h - inset * 2, borderRadius: 56, overflow: 'hidden', transform: 'translateZ(0)'}}>
        <LensScreen />
        {/* glass reflection */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 28%, transparent 40%)', pointerEvents: 'none'}} />
      </div>
      {/* dynamic island */}
      <div style={{position: 'absolute', left: w / 2 - 62, top: inset + 12, width: 124, height: 34, borderRadius: 18, background: '#000'}}>
        <div style={{position: 'absolute', right: 14, top: 10, width: 14, height: 14, borderRadius: 7, background: 'radial-gradient(circle at 35% 35%, #2b3550, #05070c)'}} />
      </div>
    </div>
  );
};
