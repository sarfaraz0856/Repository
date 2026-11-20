import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Ev, ev, glowFor, Hands, Keyboard, makeLayout, pressAmount} from './kb';
import TIMING from './p3timing.json';

const FONT = 'Inter, "Segoe UI", Arial, sans-serif';
const MONO = '"DejaVu Sans Mono", ui-monospace, monospace';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = TIMING.anch as Record<string, number>;
const win = (t: number, a: number, b: number, f = 0.3) => interpolate(t, [a, a + f, b - f, b], [0, 1, 1, 0], clamp);
const ease = (t: number, a: number, d = 0.6) => interpolate(t, [a, a + d], [0, 1], clamp);

// ---- the live typing test (events come from p3timing.json, shared with the key-sound track) ----
const TEST_TEXT = TIMING.testText as string;
const toEv = (e: {t: number; ch: string}) => ev(e.t, e.ch);
const testEvs: Ev[] = (TIMING.testEv as {t: number; ch: string}[]).map(toEv);
const WRONG_AT = 20; // "and" typed as "atd" — the one deliberate mistake
const commonEvs: Ev[] = (TIMING.commonEv as {t: number; ch: string}[]).map(toEv);

const CAPTIONS: [number, number, string, string?][] = [
	[N.homeRow, N.timer, 'Fingers on the HOME ROW', '#fdba74'],
	[N.timer, N.screen, 'The timer starts with your FIRST key ⏱', '#ffd60a'],
	[N.screen, N.mistake, 'Eyes on the SCREEN, not the keyboard 👀'],
	[N.mistake, N.keepGoing, 'Made a mistake? DON’T stop!', '#f87171'],
	[N.keepGoing, N.result, 'Don’t delete the whole word — keep going ➜', '#4ade80'],
	[N.tip, N.comment, 'Practise short common words: the · and · is', '#4ade80'],
];

const Card: React.FC<{children: React.ReactNode; o: number}> = ({children, o}) =>
	o <= 0 ? null : (
		<AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - Math.min(1, o * 1.5)) * 30}px)`}}>
			{children}
		</AbsoluteFill>
	);

export const Part3Scene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	const intro = win(t, 0, N.wpm - 0.1, 0.4);
	const wpmCard = win(t, N.wpm, N.test - 0.1);
	const testScene = win(t, N.test, N.result - 0.05);
	const resultCard = win(t, N.result, N.levels - 0.1);
	const levelsCard = win(t, N.levels, N.plan - 0.1);
	const planCard = win(t, N.plan, N.tip - 0.1);
	const tipScene = win(t, N.tip, N.comment - 0.05);
	const outro = interpolate(t, [N.comment, N.comment + 0.4], [0, 1], clamp);

	const typedTest = testEvs.filter((e) => e.t <= t);
	const elapsed = Math.max(3, t - N.timer);
	const wpmLive = t > N.timer + 1 ? Math.round(typedTest.length / 5 / (elapsed / 60)) : 0;
	const timerLeft = t < N.timer ? 60 : Math.max(0, Math.round(60 - ((t - N.timer) * 60) / (N.result - N.timer)));
	const caret = Math.floor(t * 2.2) % 2 === 0;

	const kbTest = makeLayout(54, (1920 - 15 * 54) / 2, 612);
	const kbTip = makeLayout(70, (1920 - 15 * 70) / 2, 430);
	const handsTest = spring({frame: frame - N.test * fps, fps, config: {damping: 18}});
	const handsTip = spring({frame: frame - N.tip * fps, fps, config: {damping: 18}});

	return (
		<AbsoluteFill style={{background: 'radial-gradient(1200px 700px at 50% 0%, #1e293b 0%, #0b1220 70%, #060a12 100%)', fontFamily: FONT, color: '#fff'}}>
			<div style={{position: 'absolute', top: 26, left: 40, background: '#ffd60a', color: '#000', fontWeight: 800, fontSize: 24, padding: '6px 16px', borderRadius: 10, letterSpacing: 1, zIndex: 5}}>TYPING TEST · PART 3</div>

			<Card o={intro}>
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: 40, fontWeight: 800, color: '#ffd60a', letterSpacing: 3}}>PART 3</div>
					<div style={{fontSize: 96, fontWeight: 900, lineHeight: 1.05}}>Typing Test:<br />How to Reach <span style={{color: '#4ade80'}}>50 WPM</span></div>
					<div style={{display: 'flex', gap: 24, justifyContent: 'center', marginTop: 40, fontSize: 32, fontWeight: 700}}>
						{[['Part 1 · Home Row', 3.2, '#22c55e'], ['Part 2 · All Keys', 4.4, '#22c55e'], ['Part 3 · Typing Test', 5.6, '#ffd60a']].map(([s, a, c]) => (
							<div key={s as string} style={{opacity: ease(t, a as number, 0.4), padding: '10px 22px', borderRadius: 12, border: `2px solid ${c}`, color: c as string}}>
								{c === '#22c55e' ? '✔ ' : '➜ '}{s}
							</div>
						))}
					</div>
				</div>
			</Card>

			<Card o={wpmCard}>
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: 92, fontWeight: 900}}><span style={{color: '#ffd60a'}}>WPM</span> = Words Per Minute</div>
					<div style={{opacity: ease(t, N.paanch), marginTop: 50}}>
						<div style={{fontSize: 44, fontWeight: 800, color: '#cbd5e1'}}>In a typing test, <span style={{color: '#4ade80'}}>1 word = 5 characters</span></div>
						<div style={{display: 'flex', gap: 12, justifyContent: 'center', marginTop: 26}}>
							{'hello'.split('').map((c, i) => (
								<div key={i} style={{width: 90, height: 90, borderRadius: 14, background: '#22c55e', color: '#04210f', fontFamily: MONO, fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${ease(t, N.paanch + 0.3 + i * 0.15, 0.25)})`}}>{c}</div>
							))}
							<div style={{fontSize: 52, fontWeight: 900, alignSelf: 'center', marginLeft: 20, opacity: ease(t, N.paanch + 1.2)}}>= 1 word</div>
						</div>
						<div style={{fontSize: 46, fontWeight: 800, marginTop: 40, opacity: ease(t, N.paanch + 2.0)}}>
							250 characters in 1 minute → 250 ÷ 5 = <span style={{color: '#ffd60a'}}>50 WPM</span>
						</div>
					</div>
				</div>
			</Card>

			{testScene > 0 ? (
				<AbsoluteFill style={{opacity: testScene}}>
					<div style={{position: 'absolute', left: 300, top: 150, width: 1320, height: 420, borderRadius: 16, overflow: 'hidden', border: '2px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,.5)'}}>
						<div style={{height: 58, background: '#1f2937', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px'}}>
							{['#ef4444', '#f59e0b', '#22c55e'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
							<div style={{marginLeft: 20, flex: 1, height: 36, borderRadius: 18, background: '#0f172a', display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 23, color: '#cbd5e1'}}>
								<span style={{color: '#22c55e', marginRight: 10}}>🔒</span><span style={{color: '#64748b'}}>https://</span><span style={{fontWeight: 700, color: '#fff'}}>typingtest.com</span>
							</div>
						</div>
						<div style={{height: 362, background: '#eef2f7', padding: '28px 56px', color: '#1e293b'}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
								<div style={{fontSize: 34, fontWeight: 900, flex: 1}}>Typing Speed Test</div>
								{['30 sec', '1 min', '3 min'].map((d) => {
									const on = d === '1 min' && t >= N.oneMin;
									return <div key={d} style={{padding: '8px 18px', borderRadius: 12, fontSize: 24, fontWeight: 800, background: on ? '#1d4ed8' : '#fff', color: on ? '#fff' : '#475569', boxShadow: on ? '0 0 0 4px rgba(29,78,216,.25)' : 'none'}}>{d}</div>;
								})}
								<div style={{background: '#fff', borderRadius: 12, padding: '8px 18px', fontSize: 26, fontWeight: 800, color: t >= N.timer ? '#dc2626' : '#334155'}}>⏱ 0:{String(timerLeft).padStart(2, '0')}</div>
								<div style={{background: '#16a34a', borderRadius: 12, padding: '8px 18px', fontSize: 26, fontWeight: 800, color: '#fff', minWidth: 130, textAlign: 'center'}}>{wpmLive} WPM</div>
							</div>
							<div style={{marginTop: 30, background: '#fff', borderRadius: 16, padding: '26px 34px', fontFamily: MONO, fontSize: 38, lineHeight: 1.5, boxShadow: '0 6px 20px rgba(15,23,42,.08)'}}>
								{TEST_TEXT.split('').map((c, i) => {
									const e = typedTest[i];
									const wrong = e && e.ch !== c;
									return (
										<span key={i} style={{color: e ? (wrong ? '#fff' : '#0f172a') : '#94a3b8', background: wrong ? '#dc2626' : 'transparent', borderRadius: 4, position: 'relative'}}>
											{i === typedTest.length ? <span style={{position: 'absolute', left: -2, top: 6, width: 3, height: 44, background: caret ? '#1d4ed8' : 'transparent'}} /> : null}
											{e ? e.ch : c}
										</span>
									);
								})}
							</div>
						</div>
					</div>
					<Keyboard L={kbTest} glow={glowFor(testEvs, t, 0.28, (e) => (testEvs[WRONG_AT] && e === testEvs[WRONG_AT] ? '#ef4444' : undefined))} pressed={pressAmount(testEvs, t)} />
					<Hands L={kbTest} t={t} evs={testEvs} enterL={handsTest} enterR={handsTest} />
				</AbsoluteFill>
			) : null}

			<Card o={resultCard}>
				<div style={{background: '#fff', color: '#0f172a', borderRadius: 28, padding: '46px 90px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>
					<div style={{fontSize: 36, fontWeight: 800, color: '#16a34a'}}>✔ Test Complete</div>
					<div style={{display: 'flex', gap: 70, marginTop: 20, justifyContent: 'center'}}>
						<div>
							<div style={{fontSize: 30, fontWeight: 700, color: '#64748b'}}>SPEED</div>
							<div style={{fontSize: 140, fontWeight: 900, color: '#1d4ed8', lineHeight: 1}}>{Math.round(42 * ease(t, N.result + 0.3, 1.0))}<span style={{fontSize: 46}}> WPM</span></div>
						</div>
						<div style={{borderRadius: 20, padding: '0 20px', boxShadow: t >= N.accuracy ? '0 0 0 6px #22c55e' : 'none'}}>
							<div style={{fontSize: 30, fontWeight: 700, color: '#64748b'}}>ACCURACY</div>
							<div style={{fontSize: 140, fontWeight: 900, color: '#16a34a', lineHeight: 1}}>{Math.round(96 * ease(t, N.result + 0.3, 1.0))}<span style={{fontSize: 46}}>%</span></div>
						</div>
					</div>
					<div style={{marginTop: 30, fontSize: 38, fontWeight: 800, background: '#dcfce7', color: '#166534', borderRadius: 14, padding: '10px 24px', opacity: ease(t, N.ninety, 0.4)}}>🎯 Target: 95% accuracy or more</div>
					<div style={{marginTop: 16, fontSize: 34, fontWeight: 800, color: '#dc2626', opacity: ease(t, N.noUse, 0.4)}}>Low accuracy? Then speed is useless ❌</div>
				</div>
			</Card>

			{levelsCard > 0 ? (() => {
				const target = t < N.forty ? 25 : t < N.fiftyUp ? 40 : 55;
				const prev = t < N.forty ? 0 : t < N.fiftyUp ? 25 : 40;
				const at = t < N.forty ? N.levels : t < N.fiftyUp ? N.forty : N.fiftyUp;
				const v = prev + (target - prev) * ease(t, at + 0.2, 0.8);
				const X0 = 260, W = 1400, MAX = 70;
				const zones: [number, number, string, string, number][] = [[0, 30, '#ef4444', 'Beginner · 20–30', N.levels], [30, 45, '#f59e0b', 'Good · 40', N.forty], [45, 70, '#22c55e', 'Fast · 50+ 🚀', N.fiftyUp]];
				return (
					<AbsoluteFill style={{opacity: levelsCard}}>
						<div style={{position: 'absolute', top: 150, width: 1920, textAlign: 'center', fontSize: 80, fontWeight: 900}}>Typing Speed <span style={{color: '#ffd60a'}}>Levels</span></div>
						{zones.map(([a, b, c, label, show]) => (
							<React.Fragment key={label}>
								<div style={{position: 'absolute', left: X0 + (a / MAX) * W, top: 520, width: ((b - a) / MAX) * W - 6, height: 80, background: c, borderRadius: 12, opacity: 0.35 + 0.65 * ease(t, show, 0.4)}} />
								<div style={{position: 'absolute', left: X0 + (a / MAX) * W, top: 620, width: ((b - a) / MAX) * W, textAlign: 'center', fontSize: 38, fontWeight: 800, color: c, opacity: ease(t, show, 0.4)}}>{label}</div>
							</React.Fragment>
						))}
						{[0, 10, 20, 30, 40, 50, 60, 70].map((x) => (
							<div key={x} style={{position: 'absolute', left: X0 + (x / MAX) * W - 30, top: 470, width: 60, textAlign: 'center', fontSize: 26, color: '#94a3b8'}}>{x}</div>
						))}
						<div style={{position: 'absolute', left: X0 + (v / MAX) * W - 4, top: 500, width: 8, height: 120, background: '#fff', borderRadius: 4, boxShadow: '0 0 20px #fff'}} />
						<div style={{position: 'absolute', left: X0 + (v / MAX) * W - 90, top: 360, width: 180, textAlign: 'center', fontSize: 56, fontWeight: 900}}>{Math.round(v)}<span style={{fontSize: 28}}> WPM</span></div>
					</AbsoluteFill>
				);
			})() : null}

			<Card o={planCard}>
				<div style={{display: 'flex', gap: 80, alignItems: 'center'}}>
					<div>
						<div style={{fontSize: 64, fontWeight: 900, marginBottom: 30}}>Plan to <span style={{color: '#4ade80'}}>50 WPM</span></div>
						{[['10 minutes practice daily', N.daily], ['2 typing tests a day', N.daily + 1.6], ['Note your best score every week', N.note]].map(([s, a]) => (
							<div key={s as string} style={{fontSize: 40, fontWeight: 700, margin: '18px 0', opacity: ease(t, a as number, 0.4), display: 'flex', gap: 16}}>
								<span style={{color: '#22c55e'}}>✔</span>{s}
							</div>
						))}
					</div>
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 22, height: 460, opacity: ease(t, N.growth - 0.3, 0.4)}}>
						{[30, 35, 40, 45, 50].map((w, i) => {
							const h = (w / 50) * 380 * ease(t, N.growth + i * 0.45, 0.5);
							return (
								<div key={i} style={{textAlign: 'center'}}>
									<div style={{fontSize: 30, fontWeight: 900, marginBottom: 8, color: i === 4 ? '#4ade80' : '#fff'}}>{w}</div>
									<div style={{width: 96, height: h, borderRadius: '12px 12px 0 0', background: i === 4 ? '#22c55e' : '#3b82f6'}} />
									<div style={{fontSize: 24, color: '#94a3b8', marginTop: 8}}>Week {i + 1}</div>
								</div>
							);
						})}
					</div>
				</div>
			</Card>

			{tipScene > 0 ? (
				<AbsoluteFill style={{opacity: tipScene}}>
					<div style={{position: 'absolute', top: 200, width: 1920, display: 'flex', justifyContent: 'center', gap: 20}}>
						{['the', 'and', 'is', 'to', 'of', 'in', 'it', 'you'].map((w, i) => (
							<div key={w} style={{fontFamily: MONO, fontSize: 44, fontWeight: 900, padding: '10px 26px', borderRadius: 14, background: i < 3 ? '#22c55e' : '#1f2937', color: i < 3 ? '#04210f' : '#cbd5e1', transform: `scale(${ease(t, N.tip + 0.2 + i * 0.12, 0.3)})`}}>{w}</div>
						))}
					</div>
					<div style={{position: 'absolute', top: 310, width: 1920, textAlign: 'center', fontFamily: MONO, fontSize: 56}}>
						<span style={{color: '#4ade80'}}>{commonEvs.filter((e) => e.t <= t).map((e) => e.ch).join('')}</span>
						<span style={{color: caret ? '#ffd60a' : 'transparent'}}>|</span>
					</div>
					<Keyboard L={kbTip} glow={glowFor(commonEvs, t)} pressed={pressAmount(commonEvs, t)} />
					<Hands L={kbTip} t={t} evs={commonEvs} enterL={handsTip} enterR={handsTip} />
				</AbsoluteFill>
			) : null}

			{CAPTIONS.map(([a, b, text, col], i) => {
				const o = win(t, a, b, 0.25);
				if (o <= 0) return null;
				return (
					<div key={i} style={{position: 'absolute', top: N.tip <= a ? 100 : 80, width: 1920, display: 'flex', justifyContent: 'center', opacity: o, zIndex: 4}}>
						<div style={{background: 'rgba(15,23,42,.9)', border: `2px solid ${col ?? '#334155'}`, color: col ?? '#f1f5f9', fontSize: 38, fontWeight: 800, padding: '8px 28px', borderRadius: 14}}>{text}</div>
					</div>
				);
			})}

			{outro > 0 ? (
				<AbsoluteFill style={{background: `rgba(6,10,18,${0.88 * outro})`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: outro}}>
					<div style={{textAlign: 'center'}}>
						{t < N.subscribe ? (
							<>
								<div style={{fontSize: 84, fontWeight: 900}}>What’s your <span style={{color: '#ffd60a'}}>first score?</span></div>
								<div style={{fontSize: 48, fontWeight: 800, color: '#cbd5e1', marginTop: 20}}>Comment your WPM below 👇</div>
							</>
						) : (
							<>
								<div style={{fontSize: 96, fontWeight: 900, color: '#ffd60a'}}>Like &amp; Subscribe!</div>
								<div style={{fontSize: 42, fontWeight: 700, color: '#e2e8f0', marginTop: 16}}>for more typing &amp; computer tips 🔔</div>
							</>
						)}
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
