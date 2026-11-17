import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT_UI, T} from '../theme';
import {ip, mblur} from '../anim';
import {glass} from './Glass';
import {PALETTES, Sneaker} from './Sneaker';

const ITEMS = [
  {pal: 'hero', name: 'AeroRun Knit Sneaker', store: 'Stridewear', rating: '4.8', price: '$89.99', match: 98},
  {pal: 'sky', name: 'CloudStep Runner', store: 'RunHub', rating: '4.7', price: '$112.50', match: 94},
  {pal: 'sand', name: 'Velocity Low Trainer', store: 'Footlane', rating: '4.6', price: '$74.00', match: 91},
];

const X = 1250;
const W = 560;

export const ResultsPanel: React.FC = () => {
  const f = useCurrentFrame();
  const A = T.resultsStart + 10;
  if (f < A) return null;
  const head = ip(f, [A, A + 18], [0, 1]);
  return (
    <div style={{position: 'absolute', left: X, top: 0, width: W, fontFamily: FONT_UI}}>
      <div style={{position: 'absolute', top: 236, opacity: head, transform: `translateY(${(1 - head) * 20}px)`}}>
        <div style={{fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: -0.5}}>Matching results</div>
        <div style={{fontSize: 19, color: C.sub, marginTop: 6}}>
          <span style={{color: C.green, fontWeight: 700}}>●</span>&nbsp; 4 visual matches found in 0.4 s
        </div>
      </div>
      {ITEMS.map((it, i) => {
        const s = A + 8 + i * 7;
        const xOf = (fr: number) => ip(fr, [s, s + 24], [120, 0]);
        const t = ip(f, [s, s + 18], [0, 1]);
        const blur = mblur(xOf, f, 0.35, 9);
        const bar = ip(f, [s + 12, s + 40], [0, it.match / 100]);
        return (
          <div key={it.name} style={{position: 'absolute', top: 340 + i * 172, width: W, height: 150, borderRadius: 28, boxSizing: 'border-box', padding: 14, display: 'flex', gap: 22, alignItems: 'center', opacity: t, transform: `translateX(${xOf(f)}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, ...glass}}>
            <div style={{width: 180, height: 122, borderRadius: 20, flexShrink: 0, background: 'linear-gradient(160deg,#FFFFFF,#E9EDF4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(30,40,70,0.05)'}}>
              <Sneaker id={`rp${i}`} width={156} palette={PALETTES[it.pal]} />
            </div>
            <div style={{flex: 1, paddingRight: 12}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: 22, fontWeight: 700, color: C.ink}}>{it.name}</span>
              </div>
              <div style={{fontSize: 16, color: C.sub, marginTop: 4}}>
                {it.store} · <span style={{color: '#E3A600'}}>★</span> {it.rating}
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12}}>
                <span style={{fontSize: 26, fontWeight: 800, color: C.ink}}>{it.price}</span>
                <span style={{fontSize: 15, fontWeight: 700, color: i === 0 ? '#fff' : C.green, background: i === 0 ? C.green : 'rgba(52,168,83,0.12)', padding: '5px 12px', borderRadius: 14}}>{it.match}% match</span>
              </div>
              <div style={{height: 5, borderRadius: 3, background: 'rgba(30,40,70,0.07)', marginTop: 10, overflow: 'hidden'}}>
                <div style={{width: `${bar * 100}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${C.blue}, ${C.green})`}} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
