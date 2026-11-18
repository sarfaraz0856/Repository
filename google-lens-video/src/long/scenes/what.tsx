import React from 'react';
import {C, FONT_UI} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Bar, Brackets, Card, CheckDot, ChromeShade, Dot, Feed, IconTile, LensBottom, LensMode, LensTop, Outline, ScreenChip, Sheet, Sparks, Tap, vis} from '../kit';
import {BOXES, Gallery, Kind, ptsIn, ResultGrid, SheetHeader, Subject, SubjectSeq, seqBox, seqKind} from '../subjects';
import {LensGlyph, SearchIcon} from '../../components/Icons';
import {PALETTES, Sneaker} from '../../components/Sneaker';

const S = sceneById('what');
const L = local(S);
const TYPED = 'white sneaker with red curved stripe';

const capSeq = (): [number, Kind][] => [
  [0, 'sneaker'],
  [L.w(3, 'इमारतों'), 'landmark'],
  [L.w(3, 'टेक्स्ट'), 'page'],
  [L.w(3, 'अनुवाद'), 'sign'],
  [L.w(3, 'प्रोडक्ट्स'), 'sneaker'],
];

/** Google-style text search page (typing a description) */
const TextSearch: React.FC<{f: number; a: number}> = ({f, a}) => {
  const n = Math.round(ip(f, [a + 6, a + 70], [0, TYPED.length], (v) => v));
  const caret = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: FONT_UI}}>
      <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontSize: 44, fontWeight: 700, letterSpacing: -1}}>
        <span style={{color: C.blue}}>S</span><span style={{color: C.red}}>e</span><span style={{color: C.yellow}}>a</span><span style={{color: C.blue}}>r</span><span style={{color: C.green}}>c</span><span style={{color: C.red}}>h</span>
      </div>
      <div style={{position: 'absolute', left: 22, top: 300, width: 358, height: 58, borderRadius: 29, border: '1px solid #DADCE0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', boxSizing: 'border-box'}}>
        <SearchIcon size={20} color="#5f6675" />
        <span style={{flex: 1, fontSize: 15.5, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden'}}>{TYPED.slice(0, n)}{caret ? '|' : ' '}</span>
        <LensGlyph size={28} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: 30, top: 390 + i * 54, display: 'flex', alignItems: 'center', gap: 12, opacity: ip(f, [a + 40 + i * 8, a + 52 + i * 8], [0, 0.8])}}>
          <SearchIcon size={16} color="#9AA0A6" />
          <div style={{width: 220 - i * 40, height: 10, borderRadius: 5, background: '#E8EAED'}} />
        </div>
      ))}
    </div>
  );
};

export const Screen: React.FC<{f: number}> = ({f}) => {
  const camAt = L.w(1, 'कैमरे');
  const galAt = L.w(1, 'मौजूदा');
  const showText = f >= L.c(1) - 4 && f < camAt + 14;
  const camOn = ip(f, [camAt, camAt + 14], [0, 1], EIO);
  const galSheet = Math.min(ip(f, [galAt + 6, galAt + 26], [0, 1], EIO), ip(f, [L.c(2) - 10, L.c(2) + 8], [1, 0], EIO));
  // capabilities
  const sq = capSeq();
  const inCaps = f >= L.c(3) - 4 && f < L.c(4);
  const kind = inCaps ? seqKind(f, sq) : 'sneaker';
  const box = inCaps ? seqBox(f, sq) : BOXES.sneaker;
  const mode: LensMode = inCaps && (kind === 'page') ? 'Text' : inCaps && kind === 'sign' ? 'Translate' : 'Search';
  const signT = ip(f, [L.w(3, 'अनुवाद') + 14, L.w(3, 'अनुवाद') + 34], [0, 1], EIO);
  const prodSheet = Math.min(ip(f, [L.w(3, 'प्रोडक्ट्स') + 10, L.w(3, 'प्रोडक्ट्स') + 30], [0, 1], EIO), ip(f, [L.c(4) - 4, L.c(4) + 12], [1, 0], EIO));
  // image as query (c4+)
  const q = ip(f, [L.c(4) + 4, L.c(4) + 30], [0, 1], EIO);
  const qSheet = ip(f, [L.c(4) + 20, L.c(4) + 44], [0, 1], EIO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <Feed>
        {inCaps ? <SubjectSeq f={f} seq={sq} extra={{sign: {t: signT}}} /> : <Subject kind="sneaker" />}
      </Feed>
      <Sparks pts={ptsIn(BOXES.sneaker, 18, 3)} f={f} a={L.c(2) + 4} op={vis(f, L.c(2), L.c(3) + 4)} />
      <ScreenChip cx={201} y={BOXES.sneaker.y - 56} t={vis(f, L.c(2) + 30, L.c(3))}>Analyzing what Lens sees…</ScreenChip>
      <Brackets box={{x: box.x - 10, y: box.y - 12, w: box.w + 20, h: box.h + 24}} t={1} op={vis(f, L.c(3) - 2, L.c(4), 10, 10)} />
      {inCaps && kind === 'sneaker' && f < L.w(3, 'इमारतों') && <Outline box={BOXES.sneaker} draw={ip(f, [L.c(3), L.c(3) + 24], [0, 1], EIO)} f={f} />}
      <ScreenChip cx={201} y={box.y - 58} t={vis(f, L.c(3) + 6, L.c(4), 10, 10)}>
        {kind === 'landmark' ? 'Landmark' : kind === 'page' ? 'Text found' : kind === 'sign' ? 'Translated · ES → EN' : f >= L.w(3, 'प्रोडक्ट्स') ? 'Similar products' : 'Object detected'}
      </ScreenChip>
      <ChromeShade />
      <LensTop />
      <LensBottom mode={mode} galleryHi={Math.sin(Math.PI * ip(f, [galAt - 4, galAt + 12], [0, 1]))} />
      <Tap x={69} y={713} f={f} at={galAt} />
      <Sheet t={galSheet} top={300}>
        <div style={{padding: '12px 18px 0', fontSize: 19, fontWeight: 700, color: C.ink}}>Choose a photo</div>
        <Gallery f={f} pickAt={galAt + 34} />
      </Sheet>
      <Tap x={78} y={420} f={f} at={galAt + 34} />
      <Sheet t={prodSheet} top={430}>
        <SheetHeader title="Visual matches" active={1} />
        <ResultGrid f={f} a={L.w(3, 'प्रोडक्ट्स') + 18} />
      </Sheet>
      {/* text search page for sentence 2, before the camera opens */}
      {showText && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - camOn, transform: `scale(${1 - 0.04 * camOn})`}}>
          <TextSearch f={f} a={L.c(1)} />
          <Tap x={354} y={329} f={f} at={camAt - 4} />
        </div>
      )}
      {/* image becomes the query */}
      {f >= L.c(4) && (
        <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${qSheet})`}}>
          <div style={{position: 'absolute', left: 22 + (1 - q) * 30, top: 120 + (1 - q) * 260, width: 358 - (1 - q) * 60, height: 64 + (1 - q) * 200, borderRadius: 32 - (1 - q) * 10, background: '#fff', border: '1px solid #DADCE0', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px', boxSizing: 'border-box', fontFamily: FONT_UI, overflow: 'hidden'}}>
            <div style={{width: 44 + (1 - q) * 240, height: 44 + (1 - q) * 160, borderRadius: 12, background: 'linear-gradient(160deg,#F4F6FA,#E6EAF1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Sneaker id="qthumb" width={40 + (1 - q) * 220} palette={PALETTES.hero} shadow={false} />
            </div>
            <span style={{flex: 1, fontSize: 15, color: '#80868B', opacity: q}}>Add to your search</span>
            <div style={{opacity: q}}><LensGlyph size={26} /></div>
          </div>
          <div style={{position: 'absolute', top: 210, left: 0, width: '100%', opacity: qSheet}}>
            <SheetHeader title="Search results" active={0} />
            <ResultGrid f={f} a={L.c(4) + 40} />
          </div>
        </div>
      )}
    </div>
  );
};

const CAPS = [
  {word: 'चीज़ों', title: 'Recognize objects', color: C.blue},
  {word: 'इमारतों', title: 'Identify landmarks', color: C.yellow},
  {word: 'टेक्स्ट', title: 'Extract text', color: C.red},
  {word: 'अनुवाद', title: 'Translate signs', color: C.green},
  {word: 'प्रोडक्ट्स', title: 'Find similar products', color: C.blue},
];

export const Side: React.FC<{f: number}> = ({f}) => {
  const end = L.dur;
  return (
    <>
      {/* definition */}
      <Card x={1290} y={176} w={510} t={vis(f, L.c(0) - 6, L.c(3), 16, 14)} pad={28}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <LensGlyph size={52} />
          <div>
            <div style={{fontSize: 30, fontWeight: 800, color: C.ink}}>Google Lens</div>
            <div style={{fontSize: 19, color: C.sub, marginTop: 2}}>A visual search tool by Google</div>
          </div>
        </div>
        <div style={{display: 'flex', gap: 10, marginTop: 18}}>
          {['Camera', 'Photos', 'Screenshots'].map((t, i) => (
            <span key={t} style={{fontSize: 16, fontWeight: 600, padding: '7px 14px', borderRadius: 16, background: ['#E8F0FE', '#E6F4EA', '#FEF7E0'][i], color: [C.blue, '#188038', '#B06000'][i]}}>{t}</span>
          ))}
        </div>
      </Card>
      {/* text search vs visual search */}
      <Card x={1290} y={420} w={510} t={vis(f, L.c(1) - 4, L.c(3), 16, 14)} pad={26}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase'}}>Two ways to search</div>
        {[
          {t: 'Type words', d: 'Describe it in a search bar', c: C.faint, on: f < L.w(1, 'कैमरे')},
          {t: 'Use your camera', d: 'Point at what you see', c: C.blue, on: f >= L.w(1, 'कैमरे') && f < L.w(1, 'मौजूदा')},
          {t: 'Use an existing image', d: 'Photo or screenshot from your device', c: C.green, on: f >= L.w(1, 'मौजूदा')},
        ].map((r, i) => (
          <div key={r.t} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, opacity: ip(f, [L.c(1) + i * 10, L.c(1) + 14 + i * 10], [0, 1]) * (r.on ? 1 : 0.55)}}>
            <Dot c={r.c} s={14} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 21, fontWeight: 700, color: C.ink}}>{r.t}</div>
              <div style={{fontSize: 16, color: C.sub}}>{r.d}</div>
            </div>
            {r.on && <CheckDot on size={28} color={r.c} />}
          </div>
        ))}
      </Card>
      {/* analyze -> results flow */}
      <Card x={1290} y={762} w={510} t={vis(f, L.c(2) - 2, L.c(3), 16, 14)} pad={22} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {[['Image', C.blue], ['Analyze', C.red], ['Results', C.green]].map(([t, c], i) => (
          <React.Fragment key={t}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: ip(f, [L.c(2) + i * 12, L.c(2) + 14 + i * 12], [0.2, 1])}}>
              <IconTile color={c} size={44}><span style={{fontSize: 18, fontWeight: 800}}>{i + 1}</span></IconTile>
              <span style={{fontSize: 19, fontWeight: 700, color: C.ink}}>{t}</span>
            </div>
            {i < 2 && <span style={{fontSize: 24, color: C.faint}}>→</span>}
          </React.Fragment>
        ))}
      </Card>
      {/* capabilities */}
      {CAPS.map((c, i) => {
        const at = L.w(3, c.word);
        const t = vis(f, at - 6, L.c(4) + 4, 14, 12);
        const next = i < 4 ? L.w(3, CAPS[i + 1].word) : L.c(4);
        const active = f >= at && f < next;
        return (
          <Card key={c.title} x={1290} y={200 + i * 132} w={510} h={110} t={t} style={{display: 'flex', alignItems: 'center', gap: 20, boxShadow: active ? `0 20px 50px ${c.color}33, 0 0 0 2px ${c.color}77` : undefined}}>
            <IconTile color={c.color} size={58}><span style={{fontSize: 22, fontWeight: 800}}>{i + 1}</span></IconTile>
            <span style={{flex: 1, fontSize: 24, fontWeight: 700, color: C.ink}}>{c.title}</span>
            <CheckDot on={f >= at + 10} size={30} />
          </Card>
        );
      })}
      {/* image = query */}
      <Card x={1290} y={250} w={510} t={vis(f, L.c(4) - 2, end, 16, 14)} pad={30}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase'}}>The idea</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 18}}>
          <div style={{width: 130, height: 96, borderRadius: 18, background: 'linear-gradient(160deg,#FFFFFF,#E9EDF4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Sneaker id="ideaS" width={120} shadow={false} />
          </div>
          <span style={{fontSize: 40, fontWeight: 800, color: C.blue}}>=</span>
          <div style={{flex: 1, padding: '14px 16px', borderRadius: 18, background: '#E8F0FE', color: C.blue, fontSize: 22, fontWeight: 700}}>Your search query</div>
        </div>
      </Card>
      <Card x={1290} y={520} w={510} t={vis(f, L.c(5) - 2, end, 16, 14)} pad={26}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase', marginBottom: 14}}>Why it feels natural</div>
        <div style={{padding: '14px 16px', borderRadius: 16, background: 'rgba(234,67,53,0.08)', color: '#A50E0E', fontSize: 18, lineHeight: 1.45}}>
          “white low-top sneaker, red curved stripe, knit upper, thick sole…?”
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, padding: '14px 16px', borderRadius: 16, background: 'rgba(52,168,83,0.10)', color: '#137333', fontSize: 20, fontWeight: 700, opacity: ip(f, [L.c(5) + 40, L.c(5) + 56], [0, 1])}}>
          <CheckDot on size={26} /> Just show it to the camera
        </div>
        <div style={{marginTop: 18, opacity: ip(f, [L.c(5) + 50, L.c(5) + 70], [0, 1])}}>
          <Bar p={ip(f, [L.c(5) + 50, L.c(5) + 110], [0, 1], EIO)} color={C.green} h={6} />
        </div>
      </Card>
    </>
  );
};
