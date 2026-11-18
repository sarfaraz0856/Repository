import React from 'react';
import {C, FONT_UI} from '../../theme';
import {EIO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Bar, Brackets, Card, CheckDot, ChromeShade, Feed, IconTile, LensBottom, LensTop, Pill, ScanLine, ScreenChip, Sheet, Tap, vis} from '../kit';
import {BOXES} from '../subjects';
import {DeskBg, PAGE_LINES, PrintedPage, SIGN_TEXT, Sign, WallBg} from '../art';

const S = sceneById('text');
const L = local(S);
const PG = {x: 51, y: 200};
const ACT = [{word: 'कॉपी', label: 'Copy text', x: 92}, {word: 'सर्च कर', label: 'Search', x: 201}, {word: 'अनुवाद', label: 'Translate', x: 310}];
const OCR_TEXT = PAGE_LINES.map((l) => l.text).join(' ');

const Page: React.FC<{hi: number[]}> = ({hi}) => (
  <>
    <DeskBg />
    <div style={{position: 'absolute', left: PG.x, top: PG.y}}><PrintedPage width={300} hi={hi} /></div>
  </>
);

export const Screen: React.FC<{f: number}> = ({f}) => {
  const signOn = ip(f, [L.c(3) - 4, L.c(3) + 12], [0, 1], EIO) * (1 - ip(f, [L.c(5) - 4, L.c(5) + 12], [0, 1], EIO));
  const trAt = L.w(4, 'अनुवाद');
  const tr = ip(f, [trAt, trAt + 26], [0, 1], EIO);
  const mode = f >= L.c(3) && f < L.c(5) ? 'Translate' : 'Text';
  // OCR line boxes (sentence 2)
  const boxes = PAGE_LINES.map((l, i) => {
    const t = vis(f, L.c(1) + 10 + i * 5, L.c(3), 10, 10);
    return {t, x: PG.x + 20, y: PG.y + l.y - l.h - 1, w: l.w + 12, h: l.h + 9};
  });
  // copy highlight: sentence 3 on "copy", again in sentence 6
  const copyAt = L.w(2, 'कॉपी');
  const hi = PAGE_LINES.map((_, i) => Math.max(
    f < L.c(3) ? ip(f, [copyAt + i * 3, copyAt + 10 + i * 3], [0, 1]) : 0,
    ip(f, [L.c(5) + 16 + i * 4, L.c(5) + 26 + i * 4], [0, 1]),
  ));
  const actions = vis(f, L.c(2) + 20, L.c(3) + 2, 14, 10);
  const toast = vis(f, copyAt + 22, copyAt + 70, 10, 10);
  const clip = ip(f, [L.w(5, 'कॉपी') + 4, L.w(5, 'कॉपी') + 26], [0, 1], EIO);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      <Feed>
        <Page hi={hi} />
        <div style={{position: 'absolute', inset: 0, opacity: signOn}}>
          <WallBg />
          <div style={{position: 'absolute', left: 36, top: 276}}><Sign width={330} t={tr} /></div>
        </div>
      </Feed>
      <Brackets box={{x: 30, y: 176, w: 342, h: 440}} t={ip(f, [6, 34], [0, 1], EIO)} op={vis(f, 0, L.c(1) + 6, 10, 10)} />
      <ScanLine box={{x: 40, y: 186, w: 322, h: 420}} p={ip(f, [L.c(1), L.c(1) + 50], [0, 1], EIO)} op={vis(f, L.c(1), L.c(1) + 52, 8, 8)} />
      {boxes.map((b, i) => b.t > 0.01 && (
        <div key={i} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 5, border: `2px solid ${C.blue}`, background: 'rgba(66,133,244,0.10)', opacity: b.t * (1 - signOn)}} />
      ))}
      <ScreenChip cx={201} y={128} t={vis(f, L.c(1) + 40, L.c(2) + 20, 10, 10)}>9 lines of text detected</ScreenChip>
      <Brackets box={{x: BOXES.sign.x - 6, y: BOXES.sign.y - 8, w: BOXES.sign.w + 12, h: BOXES.sign.h + 16}} t={1} op={vis(f, L.c(3) + 8, L.c(5) - 2, 10, 10)} />
      <ScreenChip cx={201} y={128} t={vis(f, trAt + 6, L.c(5) - 2, 10, 10)} dot={C.blue}>Spanish → English</ScreenChip>
      <ChromeShade />
      <LensTop />
      <LensBottom mode={mode} op={1 - actions} />
      {/* action chips */}
      {actions > 0.01 && (
        <div style={{position: 'absolute', left: 0, top: 724, width: 402, display: 'flex', justifyContent: 'center', gap: 10, opacity: actions, transform: `translateY(${(1 - actions) * 20}px)`}}>
          {ACT.map((a) => {
            const at = L.w(2, a.word);
            const on = f >= at && f < at + 30;
            return <Pill key={a.label} text={a.label} size={15} bg={on ? C.blue : 'rgba(255,255,255,0.95)'} color={on ? '#fff' : C.ink} style={{boxShadow: '0 6px 16px rgba(0,0,0,0.25)', transform: `scale(${on ? 1.06 : 1})`}} />;
          })}
        </div>
      )}
      {ACT.map((a) => <Tap key={a.label} x={a.x} y={741} f={f} at={L.w(2, a.word) + 2} />)}
      {toast > 0.01 && (
        <div style={{position: 'absolute', left: 0, top: 650, width: 402, display: 'flex', justifyContent: 'center', opacity: toast}}>
          <Pill text="✓ Text copied" bg="#202124" color="#fff" size={15} />
        </div>
      )}
      <Sheet t={clip * (f >= L.c(5) ? 1 : 0)} top={560}>
        <div style={{padding: '12px 18px 0', fontSize: 17, fontWeight: 700, color: C.ink}}>Copied to clipboard</div>
        <div style={{margin: '10px 16px', padding: 12, borderRadius: 12, background: '#F1F3F6', fontSize: 13, lineHeight: 1.5, color: C.sub, height: 120, overflow: 'hidden'}}>{OCR_TEXT}</div>
      </Sheet>
    </div>
  );
};

export const Side: React.FC<{f: number}> = ({f}) => {
  const nChars = Math.round(ip(f, [L.c(1) + 30, L.c(2) + 10], [0, OCR_TEXT.length], (v) => v));
  const trAt = L.w(4, 'अनुवाद');
  const tr = ip(f, [trAt, trAt + 26], [0, 1], EIO);
  return (
    <>
      <Card x={1290} y={170} w={510} t={vis(f, L.c(0) + 4, L.c(3), 16, 14)} pad={26}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase', marginBottom: 6}}>OCR · Optical character recognition</div>
        {[['Detect text regions', C.blue], ['Recognize characters', C.red], ['Understand language', C.green]].map(([t, c], i) => {
          const a = L.c(1) + i * 30;
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderTop: i ? '1px solid rgba(30,40,70,0.07)' : undefined}}>
              <IconTile color={c} size={40}><span style={{fontSize: 16, fontWeight: 800}}>{i + 1}</span></IconTile>
              <div style={{flex: 1}}>
                <div style={{fontSize: 20, fontWeight: 700, color: C.ink}}>{t}</div>
                <div style={{marginTop: 7}}><Bar p={ip(f, [a, a + 40], [0, 1], EIO)} color={c} h={5} /></div>
              </div>
              <CheckDot on={f > a + 40} size={26} />
            </div>
          );
        })}
      </Card>
      <Card x={1290} y={520} w={510} h={250} t={vis(f, L.c(1) + 24, L.c(3), 16, 14)} pad={24}>
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: 2.2, color: C.faint, textTransform: 'uppercase'}}>Recognized text</div>
        <div style={{marginTop: 10, fontSize: 18, lineHeight: 1.5, color: C.ink, height: 140, overflow: 'hidden'}}>{OCR_TEXT.slice(0, nChars)}<span style={{color: C.blue}}>{nChars < OCR_TEXT.length ? '▍' : ''}</span></div>
      </Card>
      <div style={{position: 'absolute', left: 1290, top: 790, display: 'flex', gap: 10, opacity: vis(f, L.c(2), L.c(3), 12, 12)}}>
        {ACT.map((a) => {
          const on = f >= L.w(2, a.word);
          return <Pill key={a.label} text={(on ? '✓ ' : '') + a.label} size={18} bg={on ? C.blue : 'rgba(255,255,255,0.8)'} color={on ? '#fff' : C.sub} style={{boxShadow: '0 8px 20px rgba(30,45,90,0.12)'}} />;
        })}
      </div>
      <Card x={1290} y={210} w={510} t={vis(f, L.c(3) - 2, L.c(5), 16, 14)} pad={28}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Pill text="Spanish" bg="#F1F3F6" color={C.ink} size={17} />
          <span style={{fontSize: 24, color: C.blue}}>→</span>
          <Pill text="English" bg={tr > 0.5 ? C.blue : '#F1F3F6'} color={tr > 0.5 ? '#fff' : C.ink} size={17} />
        </div>
        {SIGN_TEXT.es.map((es, i) => (
          <div key={i} style={{padding: '14px 0', borderTop: '1px solid rgba(30,40,70,0.07)', marginTop: i ? 0 : 18}}>
            <div style={{fontSize: 18, color: C.faint, fontWeight: 500}}>{es}</div>
            <div style={{fontSize: 23, fontWeight: 700, color: C.ink, marginTop: 4, opacity: ip(f, [trAt + i * 6, trAt + 16 + i * 6], [0, 1])}}>{SIGN_TEXT.en[i]}</div>
          </div>
        ))}
      </Card>
      {[['Books', 'किताबों', C.blue], ['Notes', 'नोट्स', C.yellow], ['Documents', 'डॉक्यूमेंट्स', C.green]].map(([t, w, c], i) => {
        const at = L.w(5, w as string);
        return (
          <Card key={t as string} x={1290} y={250 + i * 150} w={510} h={128} t={vis(f, at - 4, L.dur, 14, 14)} style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <IconTile color={c as string} size={62}>
              <svg width="30" height="30" viewBox="0 0 24 24">{i === 0 ? <path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z M12 6v14" stroke="#fff" strokeWidth="2" fill="none" /> : i === 1 ? <path d="M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4" stroke="#fff" strokeWidth="2" fill="none" /> : <path d="M6 3h8l4 4v14H6z M14 3v4h4" stroke="#fff" strokeWidth="2" fill="none" />}</svg>
            </IconTile>
            <div style={{flex: 1}}>
              <div style={{fontSize: 24, fontWeight: 700, color: C.ink}}>{t}</div>
              <div style={{fontSize: 17, color: C.sub, marginTop: 2}}>Copy text without retyping</div>
            </div>
            <CheckDot on={f > at + 12} size={30} />
          </Card>
        );
      })}
    </>
  );
};
