import React from 'react';
import {C} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Brackets, Card, ChromeShade, Feed, LensBottom, LensTop, Outline, Pill, ScreenChip, Sheet, StatusPill, Tap, vis} from '../kit';
import {BOXES, Gallery, HomeScreen, LENS_ICON, ResultGrid, Reveal, SheetHeader, Subject} from '../subjects';

const S = sceneById('howto');
const L = local(S);
const B = BOXES.sneaker;
const ACTIONS = [{w: 'प्रोडक्ट्स', t: 'Products'}, {w: 'कॉपी', t: 'Copy text'}, {w: 'अनुवाद', t: 'Translate'}, {w: 'और जानकारी', t: 'Learn more'}];

export const Screen: React.FC<{f: number}> = ({f}) => {
  const tapAt = L.w(1, 'आइकॉन');
  const rev: [number, number] = [tapAt + 6, tapAt + 34];
  const galAt = L.w(2, 'मौजूदा');
  const gal = Math.min(ip(f, [galAt + 4, galAt + 24], [0, 1], EIO), ip(f, [L.c(3) - 6, L.c(3) + 10], [1, 0], EIO));
  const capAt = L.w(3, 'कैप्चर');
  const flash = Math.sin(Math.PI * ip(f, [capAt, capAt + 10], [0, 1]));
  const res = ip(f, [L.c(4) + 30, L.c(4) + 54], [0, 1], EIO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      {f < rev[1] + 2 && <HomeScreen f={f} tapAt={tapAt} />}
      <Tap x={LENS_ICON.x} y={LENS_ICON.y} f={f} at={tapAt} />
      <Reveal f={f} a={rev[0]} b={rev[1]}>
        <div style={{position: 'absolute', inset: 0, transformOrigin: `201px ${B.y + B.h / 2}px`, transform: `translateY(${-160 * res}px) scale(${1 - 0.16 * res})`}}>
          <Feed blur={ip(f, [rev[1], rev[1] + 20], [6, 0], EIO)}><Subject kind="sneaker" /></Feed>
          <Brackets box={{x: B.x - 10, y: B.y - 12, w: B.w + 20, h: B.h + 24}} t={ip(f, [L.c(3), L.c(3) + 30], [0, 1], EIO)} op={vis(f, L.c(3) - 4, L.c(4) + 30, 10, 10)} />
          <ScreenChip cx={201} y={B.y - 58} t={vis(f, L.c(3) + 20, capAt + 4, 10, 8)} dot={C.yellow}>Keep the object inside the frame</ScreenChip>
          <Outline box={B} draw={ip(f, [L.c(4), L.c(4) + 26], [0, 1], EIO)} f={f} />
        </div>
        <ChromeShade />
        <LensTop />
        <LensBottom op={1 - res} galleryHi={Math.sin(Math.PI * ip(f, [galAt - 4, galAt + 12], [0, 1]))} press={Math.sin(Math.PI * ip(f, [capAt - 4, capAt + 8], [0, 1]))} />
        <Tap x={69} y={713} f={f} at={galAt} />
        <Tap x={201} y={732} f={f} at={capAt} />
        <Sheet t={gal} top={300}>
          <div style={{padding: '12px 18px 0', fontSize: 19, fontWeight: 700, color: C.ink}}>Choose a photo</div>
          <Gallery f={f} pickAt={galAt + 40} />
        </Sheet>
        <Tap x={78} y={420} f={f} at={galAt + 40} />
        <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.75}} />
        <StatusPill t={vis(f, L.c(4), L.c(4) + 40)} text="Analyzing…" f={f} />
        <Sheet t={res} top={400}>
          <SheetHeader title="Results" tabs={['Products', 'Text', 'Translate', 'About']} active={0} />
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 16px 0'}}>
            {ACTIONS.map((a) => {
              const on = f >= L.w(5, a.w) && f < L.w(5, a.w) + 40;
              return <Pill key={a.t} text={a.t} size={14} bg={on ? C.blue : '#F1F3F6'} color={on ? '#fff' : C.ink} style={{transform: `scale(${on ? 1.06 : 1})`}} />;
            })}
          </div>
          <ResultGrid f={f} a={L.c(4) + 50} />
        </Sheet>
      </Reveal>
    </div>
  );
};

const STEPS = [
  {cue: 1, t: 'Open the Google app', d: 'Or another place where Lens is available, then tap the Lens icon'},
  {cue: 2, t: 'Point the camera', d: 'Or choose an existing picture from your device'},
  {cue: 3, t: 'Frame the object clearly', d: 'Capture or select the image'},
  {cue: 4, t: 'Lens analyzes it', d: 'Relevant options and results appear'},
  {cue: 5, t: 'Explore the results', d: 'Products, copy text, translate, learn more'},
];
const COLORS = [C.blue, C.red, C.yellow, C.green, C.blue];

export const Side: React.FC<{f: number}> = ({f}) => (
  <Card x={1290} y={170} w={510} t={vis(f, 4, L.dur, 16, 14)} pad={26}>
    <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase', marginBottom: 8}}>Step by step</div>
    {STEPS.map((s, i) => {
      const a = L.c(s.cue);
      const b = i < 4 ? L.c(STEPS[i + 1].cue) : L.dur;
      const active = f >= a - 4 && f < b;
      const done = f >= b;
      const t = ip(f, [10 + i * 8, 26 + i * 8], [0, 1]);
      return (
        <div key={s.t} style={{display: 'flex', gap: 16, padding: '14px 12px', borderRadius: 16, background: active ? `${COLORS[i]}14` : 'transparent', boxShadow: active ? `inset 0 0 0 2px ${COLORS[i]}55` : undefined, opacity: t * (active || done ? 1 : 0.5), marginTop: 4}}>
          <span style={{width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: active || done ? COLORS[i] : 'rgba(30,40,70,0.1)', color: '#fff', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{done ? '✓' : i + 1}</span>
          <div>
            <div style={{fontSize: 22, fontWeight: 700, color: C.ink}}>{s.t}</div>
            <div style={{fontSize: 16, color: C.sub, marginTop: 3, lineHeight: 1.4}}>{s.d}</div>
          </div>
        </div>
      );
    })}
  </Card>
);
