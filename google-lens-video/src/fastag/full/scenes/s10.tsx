import React from 'react';
import {U, UF} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {ScamSms} from '../screens';
import {Header, OnText, Panel, Row} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s10'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <ScamSms f={f} warnAt={L.w(2, 'OTP')} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const rows: [string, boolean, number][] = [
    ['Get FASTag only from a bank, official app or authorised point', true, L.c(1)],
    ['Never share OTP / PIN on calls or links about "FASTag KYC"', false, L.c(2)],
    ["Don't move the tag to another vehicle", false, L.c(3)],
    ['Selling the car? Close the old FASTag', true, L.c(4)],
    ['Keep SMS alerts ON for every deduction', true, L.c(5)],
    ['Tag lost or stolen? Ask your issuer bank to block it', true, L.c(6)],
  ];
  return (
    <>
      <Header f={f} dur={L.dur} n="10" title="FASTAG SAFETY TIPS" />
      <OnText f={f} a={6} y={170} size={48} color={U.green} text="STAY SAFE" />
      <Panel x={950} y={260} w={840} t={on(L.c(1) - 6)}>
        {rows.map(([text, ok, at]) => <Row key={text} t={on(at)} ok={ok} text={text} size={25} color={U.green} />)}
      </Panel>
      <div style={{position: 'absolute', left: 950, top: 840, width: 840, textAlign: 'center', fontFamily: UF.ui, fontSize: 16, color: U.slate, opacity: on(L.c(2))}}>✓ = do this · ✕ = never do this</div>
    </>
  );
};
