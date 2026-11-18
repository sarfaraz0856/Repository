import React from 'react';
import {C, FONT_UI} from '../../theme';
import {EIO, EO, ip} from '../../anim';
import {sceneById, local} from '../timeline';
import {Card, CheckDot, IconTile, SW, Tap, vis} from '../kit';
import {LensGlyph} from '../../components/Icons';

const S = sceneById('endcard');
const L = local(S);
const LIKE = () => L.w(0, 'like');
const SHARE = () => L.w(0, 'share');
const SUB = () => L.w(0, 'subscribe');
const BYE = () => L.w(0, 'Thank');

const ThumbIcon: React.FC<{c: string; s?: number}> = ({c, s = 30}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M7 21H4V10h3zm2 0h8.5a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 19 10h-5l.8-4.2A1.8 1.8 0 0 0 13 4l-4 6z" fill={c} /></svg>
);
const ShareIcon: React.FC<{c: string; s?: number}> = ({c, s = 30}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M14 5l7 7-7 7v-4c-5 0-8 1.5-11 5 1-5 4-10 11-11z" fill={c} /></svg>
);
const BellIcon: React.FC<{c: string; s?: number}> = ({c, s = 30}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5-6.7V3.5a2 2 0 0 0-4 0v.8A7 7 0 0 0 5 11v5l-2 2v1h18v-1z" fill={c} /></svg>
);

export const Screen: React.FC<{f: number}> = ({f}) => {
  const enter = ip(f, [0, 20], [0, 1]);
  const liked = f >= LIKE() + 4;
  const subbed = f >= SUB() + 6;
  const pulse = (at: number) => 1 + 0.12 * Math.sin(Math.PI * ip(f, [at - 2, at + 12], [0, 1], EIO));
  const ring = (at: number) => ip(f, [at, at + 24], [0, 1], EO);
  const btn = (y: number, at: number, active: boolean, content: React.ReactNode, bg: string) => (
    <div style={{position: 'absolute', left: 46, top: y, width: SW - 92, height: 74, borderRadius: 37, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 22, fontWeight: 800, color: active ? '#fff' : C.ink, boxShadow: active ? '0 12px 30px rgba(0,0,0,0.18)' : '0 6px 18px rgba(30,40,70,0.10)', transform: `scale(${pulse(at)})`, opacity: ip(f, [8 + (y - 380) / 20, 24 + (y - 380) / 20], [0, 1])}}>
      {content}
      {f >= at && ring(at) < 1 && <div style={{position: 'absolute', inset: -4, borderRadius: 41, border: `3px solid ${C.blue}`, opacity: 1 - ring(at), transform: `scale(${1 + 0.15 * ring(at)})`}} />}
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #FFFFFF 0%, #EEF3FC 55%, #F6EFFA 100%)', fontFamily: FONT_UI, opacity: enter}}>
      <div style={{position: 'absolute', top: 120, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{width: 120, height: 120, borderRadius: 60, background: '#fff', boxShadow: '0 16px 40px rgba(66,133,244,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * enter})`}}>
          <LensGlyph size={84} stroke={2.6} />
        </div>
        <div style={{fontSize: 30, fontWeight: 800, color: C.ink, marginTop: 8}}>Thanks for watching!</div>
        <div style={{fontSize: 17, color: C.sub}}>How Google Lens Works</div>
      </div>
      {btn(390, LIKE(), liked, <><ThumbIcon c={liked ? '#fff' : C.ink} /> {liked ? 'Liked' : 'Like'}</>, liked ? C.blue : '#fff')}
      {btn(486, SHARE(), f >= SHARE() + 4, <><ShareIcon c={f >= SHARE() + 4 ? '#fff' : C.ink} /> Share</>, f >= SHARE() + 4 ? C.green : '#fff')}
      {btn(582, SUB(), !subbed, subbed ? <><BellIcon c={C.ink} /> Subscribed ✓</> : <>Subscribe</>, subbed ? '#E8EAED' : C.red)}
      <Tap x={201} y={427} f={f} at={LIKE()} />
      <Tap x={201} y={523} f={f} at={SHARE()} />
      <Tap x={201} y={619} f={f} at={SUB()} />
      <div style={{position: 'absolute', top: 700, width: '100%', textAlign: 'center', fontSize: 24, fontWeight: 800, color: C.ink, opacity: ip(f, [BYE(), BYE() + 16], [0, 1]), transform: `translateY(${(1 - ip(f, [BYE(), BYE() + 16], [0, 1])) * 14}px)`}}>
        Good night <span style={{color: C.yellow}}>☾</span>
      </div>
    </div>
  );
};

const ITEMS = [
  {at: LIKE, t: 'Like', d: 'If this video helped you', c: C.blue, el: <ThumbIcon c="#fff" />},
  {at: SHARE, t: 'Share', d: 'With friends and family', c: C.green, el: <ShareIcon c="#fff" />},
  {at: SUB, t: 'Subscribe', d: 'For more tech explainers', c: C.red, el: <BellIcon c="#fff" />},
];

export const Side: React.FC<{f: number}> = ({f}) => (
  <>
    {ITEMS.map((it, i) => {
      const at = it.at();
      const active = f >= at && (i === 2 ? f < BYE() : f < ITEMS[i + 1].at());
      return (
        <Card key={it.t} x={1290} y={250 + i * 150} w={510} h={124} t={vis(f, 6 + i * 6, L.dur + 60, 16, 1)} style={{display: 'flex', alignItems: 'center', gap: 20, boxShadow: active ? `0 20px 50px ${it.c}33, 0 0 0 2px ${it.c}88` : undefined, transform: `scale(${active ? 1.03 : 1})`}}>
          <IconTile color={it.c} size={62}>{it.el}</IconTile>
          <div style={{flex: 1}}>
            <div style={{fontSize: 26, fontWeight: 800, color: C.ink}}>{it.t}</div>
            <div style={{fontSize: 17, color: C.sub, marginTop: 2}}>{it.d}</div>
          </div>
          <CheckDot on={f >= at + 6} size={30} color={it.c} />
        </Card>
      );
    })}
  </>
);
