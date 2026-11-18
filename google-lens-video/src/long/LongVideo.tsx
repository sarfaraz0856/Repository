import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/noto-sans-devanagari/400.css';
import '@fontsource/noto-sans-devanagari/500.css';
import '@fontsource/noto-sans-devanagari/600.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT_HEAD, FONT_UI, PHONE} from '../theme';
import {EIO, ip} from '../anim';
import {Phone} from '../components/Phone';
import {SCENES, TL} from './timeline';
import {SCENE_COMPONENTS} from './scenes';

export const PHONE_SCALE = 1.19; // ~20 % larger than the 15 s video, still fully inside the frame

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const fam = ['400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '800 20px "Plus Jakarta Sans"', '700 20px "Plus Jakarta Sans"', '400 20px "Noto Sans Devanagari"', '500 20px "Noto Sans Devanagari"', '600 20px "Noto Sans Devanagari"'];
    // make sure the Devanagari glyph subset is actually fetched
    const probe = 'सोचिए आप अपने स्मार्टफ़ोन';
    Promise.all(fam.map((x) => document.fonts.load(x, probe))).then(() => document.fonts.ready).finally(() => continueRender(handle));
  }, [handle]);
};

// Static backdrop (no drifting shapes in the long version)
const StillBackground: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(135deg, #F8FAFD 0%, #EEF2F9 48%, #F5F2FA 100%)'}}>
    {[[260, 180, 900, C.blue], [1700, 240, 760, C.green], [1600, 940, 820, C.yellow], [360, 980, 760, C.red]].map(([x, y, s, c], i) => (
      <div key={i} style={{position: 'absolute', left: (x as number) - (s as number) / 2, top: (y as number) - (s as number) / 2, width: s as number, height: s as number, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 68%)`, opacity: 0.2}} />
    ))}
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(60,80,120,0.16) 1.3px, transparent 1.4px)', backgroundSize: '32px 32px', WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, #000 0%, transparent 85%)', opacity: 0.5}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(40,55,90,0.10) 100%)'}} />
  </AbsoluteFill>
);

const TITLES: Record<string, string[]> = {
  intro: ['HOW GOOGLE', 'LENS WORKS'],
  what: ['WHAT IS', 'GOOGLE LENS?'],
  scan: ['HOW IMAGE', 'SCANNING', 'WORKS'],
  ai: ['AI & OBJECT', 'RECOGNITION'],
  results: ['VISUAL SEARCH', '& MATCHING'],
  text: ['TEXT', 'RECOGNITION', '& TRANSLATION'],
  uses: ['REAL-WORLD', 'APPLICATIONS'],
  howto: ['HOW TO USE', 'GOOGLE LENS'],
  outro: ['GOOGLE LENS'],
};
const CHAPTER: Record<string, string> = {
  intro: 'Introduction', what: 'What is Google Lens?', scan: 'Image scanning', ai: 'AI & object recognition', results: 'Visual search & results',
  text: 'Text recognition & translation', uses: 'Real-world applications', howto: 'How to use Google Lens', outro: 'Conclusion',
};
const ACCENT = [C.blue, C.red, C.yellow, C.green];

const LeftPanel: React.FC<{f: number}> = ({f}) => {
  return (
    <>
      {SCENES.map((s, k) => {
        const lf = f - s.from;
        if (lf < -2 || lf > s.dur + 2) return null;
        const accent = ACCENT[k % 4];
        const exit = k === SCENES.length - 1 ? 0 : ip(lf, [s.dur - 14, s.dur], [0, 1], EIO);
        const item = (d: number): React.CSSProperties => {
          const t = ip(lf, [d, d + 18], [0, 1]);
          return {opacity: t * (1 - exit), transform: `translateY(${(1 - t) * 30 - exit * 14}px)`, filter: t < 1 || exit > 0 ? `blur(${(1 - t) * 7 + exit * 5}px)` : undefined};
        };
        const lines = TITLES[s.id];
        const longest = Math.max(...lines.map((l) => l.length));
        const size = s.id === 'intro' ? 70 : Math.min(60, 540 / (longest * 0.64));
        // active subtitle
        const last = s.cues[s.cues.length - 1];
        const finalT = s.id === 'outro' ? ip(f, [last.from + last.dur + 6, last.from + last.dur + 30], [0, 1]) : 0;
        let sub: React.ReactNode = null;
        s.cues.forEach((c, i) => {
          const next = s.cues[i + 1];
          const end = next ? next.from - 2 : c.from + c.dur + 40;
          const t = Math.min(ip(f, [c.from - 6, c.from + 8], [0, 1]), ip(f, [end - 8, end], [1, 0]));
          if (t > 0.001)
            sub = (
              <div key={i} style={{position: 'absolute', top: 0, left: 0, width: 540, opacity: t * (1 - exit) * (1 - finalT), transform: `translateY(${(1 - t) * 10}px)`, fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif", fontSize: 24, fontWeight: 500, lineHeight: 1.62, color: C.sub}}>
                {c.text}
              </div>
            );
        });
        return (
          <div key={s.id} style={{position: 'absolute', left: 96, top: 0, width: 560, height: 1080}}>
            <div style={{position: 'absolute', top: 196, ...item(4), display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: 10, height: 10, borderRadius: 5, background: accent, boxShadow: `0 0 12px ${accent}`}} />
              <span style={{fontFamily: FONT_UI, fontSize: 16, fontWeight: 600, letterSpacing: 2.4, textTransform: 'uppercase', color: C.sub}}>
                {k === 0 ? 'A visual search documentary' : `Chapter ${String(k + 1).padStart(2, '0')} · ${CHAPTER[s.id]}`}
              </span>
            </div>
            <div style={{position: 'absolute', top: 246}}>
              {lines.map((l, i) => (
                <div key={i} style={{...item(8 + i * 4), fontFamily: FONT_HEAD, fontWeight: 800, fontSize: s.id === 'outro' ? 70 * (1 + 0.0 * finalT) : size, lineHeight: 1.05, letterSpacing: -1.2, color: C.ink, whiteSpace: 'nowrap'}}>{l}</div>
              ))}
              {s.id === 'outro' && (
                <div style={{display: 'flex', gap: 18, marginTop: 18, fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 40, color: C.ink, letterSpacing: -0.5}}>
                  {['SCAN', 'SEARCH', 'DISCOVER'].map((w, i) => {
                    const t = ip(f, [last.from + last.dur + 10 + i * 8, last.from + last.dur + 28 + i * 8], [0, 1]);
                    return <span key={w} style={{opacity: t, transform: `translateY(${(1 - t) * 16}px)`, filter: t < 1 ? `blur(${(1 - t) * 6}px)` : undefined}}>{w}<span style={{color: [C.blue, C.red, C.green][i]}}>.</span></span>;
                  })}
                </div>
              )}
            </div>
            <div style={{position: 'absolute', top: 246 + lines.length * size * 1.05 + 40}}>{sub}</div>
          </div>
        );
      })}
    </>
  );
};

const ChapterBar: React.FC<{f: number}> = ({f}) => {
  const op = ip(f, [30, 60], [0, 1]) * ip(f, [TL.durationInFrames - 120, TL.durationInFrames - 60], [1, 0]);
  return (
    <div style={{position: 'absolute', left: 96, top: 1000, display: 'flex', gap: 8, opacity: op}}>
      {SCENES.map((s, k) => {
        const p = ip(f, [s.from, s.from + s.dur], [0, 1], (v) => v);
        return (
          <div key={s.id} style={{width: 52, height: 5, borderRadius: 3, background: 'rgba(30,40,70,0.10)', overflow: 'hidden'}}>
            <div style={{width: `${p * 100}%`, height: '100%', background: ACCENT[k % 4]}} />
          </div>
        );
      })}
    </div>
  );
};

const ScreenRouter: React.FC<{f: number}> = ({f}) => {
  const k = SCENES.findIndex((s) => f >= s.from && f < s.from + s.dur);
  const idx = k < 0 ? SCENES.length - 1 : k;
  const s = SCENES[idx];
  const lf = f - s.from;
  const Cur = SCENE_COMPONENTS[s.id].Screen;
  const xf = 16;
  if (idx > 0 && lf < xf) {
    const p = SCENES[idx - 1];
    const Prev = SCENE_COMPONENTS[p.id].Screen;
    return (
      <div style={{position: 'absolute', inset: 0, fontFamily: FONT_UI}}>
        <Prev f={f - p.from} />
        <div style={{position: 'absolute', inset: 0, opacity: ip(lf, [0, xf], [0, 1], EIO)}}>
          <Cur f={lf} />
        </div>
      </div>
    );
  }
  return <div style={{position: 'absolute', inset: 0, fontFamily: FONT_UI}}><Cur f={lf} /></div>;
};

const SideRouter: React.FC<{f: number}> = ({f}) => (
  <>
    {SCENES.map((s) => {
      const lf = f - s.from;
      if (lf < 0 || lf >= s.dur) return null;
      const Side = SCENE_COMPONENTS[s.id].Side;
      return <Side key={s.id} f={lf} />;
    })}
  </>
);

export const LongVideo: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const enter = ip(f, [0, 36], [0, 1]);
  const fadeOut = ip(f, [TL.durationInFrames - 48, TL.durationInFrames - 1], [0, 1], EIO);
  const fadeIn = ip(f, [0, 14], [1, 0]);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Audio src={staticFile('long/soundtrack_6min.wav')} />
      <StillBackground />
      <AbsoluteFill style={{opacity: enter, transform: `scale(${0.985 + 0.015 * enter})`, transformOrigin: '960px 540px'}}>
        <Phone x={PHONE.x} y={PHONE.y} scale={PHONE_SCALE} screen={<ScreenRouter f={f} />} />
      </AbsoluteFill>
      <SideRouter f={f} />
      <LeftPanel f={f} />
      <ChapterBar f={f} />
      <AbsoluteFill style={{background: '#F8FAFD', opacity: fadeIn}} />
      <AbsoluteFill style={{background: '#05070C', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
