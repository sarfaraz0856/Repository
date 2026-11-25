import React from 'react';
import {U, UF, deep} from '../../../upi/theme';
import {sc, loc} from '../tl';
import {SmsRead} from '../screens';
import {Header, OnText, Panel, Row} from '../../../upi/full/kit';
import {EO, ip} from '../../../anim';

const S = sc('s9'); const L = loc(S);

export const Screen: React.FC<{f: number}> = ({f}) => <SmsRead f={f} amtAt={L.w(2, 'Amount')} unknownAt={L.c(3)} />;

export const Stage: React.FC<{f: number}> = ({f}) => {
  const on = (a: number) => ip(f, [a, a + 14], [0, 1], EO);
  const rows: [string, boolean, number][] = [
    ['Never share your OTP – with anyone', false, L.c(1)],
    ['Read the SMS: check amount & merchant', true, L.c(2)],
    ["Didn't start a payment? Ignore & tell the bank", true, L.c(3)],
    ['Keep a screen lock on your phone', true, L.c(4)],
    ['Keep your registered mobile number updated', true, L.c(5)],
    ['Turn on authenticator-app 2FA where offered', true, L.c(6)],
    ['Never switch off bank alerts', true, L.c(8)],
  ];
  const help = on(L.c(7));
  return (
    <>
      <Header f={f} dur={L.dur} n="09" title="OTP SAFETY TIPS" />
      <OnText f={f} a={6} y={150} size={44} color={U.green} text="STAY SAFE" />
      <Panel x={940} y={220} w={860} t={on(L.c(1) - 6)}>
        {rows.map(([text, ok, at]) => <Row key={text} t={on(at)} ok={ok} text={text} size={24} color={U.green} />)}
      </Panel>
      <div style={{position: 'absolute', left: 1370 - 300, top: 810, width: 600, padding: '18px 0', borderRadius: 22, background: '#0F172A', color: '#fff', textAlign: 'center', fontFamily: UF.ui, opacity: help, transform: `scale(${0.9 + 0.1 * help})`, boxShadow: '0 20px 40px rgba(15,23,42,0.3)'}}>
        <div style={{fontSize: 18, letterSpacing: 2, opacity: 0.8}}>FRAUD HAPPENED? TELL YOUR BANK + CALL</div>
        <div style={{fontFamily: UF.head, fontSize: 60, fontWeight: 800, color: '#93C5FD'}}>1930 <span style={{fontSize: 22, color: '#fff', fontWeight: 600}}>Cyber Crime Helpline</span></div>
      </div>
    </>
  );
};
