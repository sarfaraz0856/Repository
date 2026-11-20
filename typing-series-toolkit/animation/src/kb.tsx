import React from 'react';

export type KeyDef = {id: string; label: string; w: number};
const k = (id: string, label?: string, w = 1): KeyDef => ({id, label: label ?? id, w});
const letters = (s: string) => s.split('').map((c) => k(c));

export const ROWS: KeyDef[][] = [
	[k('`'), ...letters('1234567890'), k('-'), k('='), k('BKSP', '⌫', 2)],
	[k('TAB', 'Tab', 1.5), ...letters('QWERTYUIOP'), k('['), k(']'), k('\\', '\\', 1.5)],
	[k('CAPS', 'Caps', 1.75), ...letters('ASDFGHJKL'), k(';'), k("'"), k('ENTER', 'Enter', 2.25)],
	[k('LSHIFT', 'Shift', 2.25), ...letters('ZXCVBNM'), k(','), k('.'), k('/'), k('RSHIFT', 'Shift', 2.75)],
	[
		k('LCTRL', 'Ctrl', 1.25), k('LWIN', 'Win', 1.25), k('LALT', 'Alt', 1.25), k('SPACE', '', 6.25),
		k('RALT', 'Alt', 1.25), k('RWIN', 'Win', 1.25), k('MENU', 'Menu', 1.25), k('RCTRL', 'Ctrl', 1.25),
	],
];

export type KeyGeom = {id: string; label: string; x: number; y: number; w: number; h: number; cx: number; cy: number};
export type Layout = {U: number; ox: number; oy: number; map: Record<string, KeyGeom>; list: KeyGeom[]; width: number; height: number};

export const makeLayout = (U: number, ox: number, oy: number): Layout => {
	const gap = Math.max(4, Math.round(U * 0.11));
	const map: Record<string, KeyGeom> = {};
	const list: KeyGeom[] = [];
	ROWS.forEach((row, r) => {
		let x = 0;
		row.forEach((kd) => {
			const g: KeyGeom = {id: kd.id, label: kd.label, x: ox + x * U + gap / 2, y: oy + r * U + gap / 2, w: kd.w * U - gap, h: U - gap, cx: 0, cy: 0};
			g.cx = g.x + g.w / 2;
			g.cy = g.y + g.h / 2;
			map[kd.id] = g;
			list.push(g);
			x += kd.w;
		});
	});
	return {U, ox, oy, map, list, width: 15 * U, height: 5 * U};
};

export type Finger = 'LP' | 'LR' | 'LM' | 'LI' | 'RI' | 'RM' | 'RR' | 'RP' | 'LT' | 'RT';
const FKEYS: Record<Finger, string[]> = {
	LP: ['`', '1', 'Q', 'A', 'Z', 'TAB', 'CAPS', 'LSHIFT', 'LCTRL'],
	LR: ['2', 'W', 'S', 'X'],
	LM: ['3', 'E', 'D', 'C'],
	LI: ['4', '5', 'R', 'T', 'F', 'G', 'V', 'B'],
	RI: ['6', '7', 'Y', 'U', 'H', 'J', 'N', 'M'],
	RM: ['8', 'I', 'K', ','],
	RR: ['9', 'O', 'L', '.'],
	RP: ['0', '-', '=', 'P', '[', ']', '\\', ';', "'", '/', 'ENTER', 'RSHIFT', 'BKSP'],
	LT: [],
	RT: ['SPACE'],
};
export const KEY_FINGER: Record<string, Finger> = {};
(Object.keys(FKEYS) as Finger[]).forEach((f) => FKEYS[f].forEach((id) => (KEY_FINGER[id] = f)));

export const HOME: Record<Finger, string> = {LP: 'A', LR: 'S', LM: 'D', LI: 'F', RI: 'J', RM: 'K', RR: 'L', RP: ';', LT: 'SPACE', RT: 'SPACE'};
export const FINGER_COLOR: Record<Finger, string> = {
	LP: '#a855f7', RP: '#a855f7', LR: '#3b82f6', RR: '#3b82f6', LM: '#22c55e', RM: '#22c55e', LI: '#f97316', RI: '#f97316', LT: '#94a3b8', RT: '#94a3b8',
};
export const FINGER_NAME: Record<Finger, string> = {
	LP: 'Pinky', LR: 'Ring', LM: 'Middle', LI: 'Index', RI: 'Index', RM: 'Middle', RR: 'Ring', RP: 'Pinky', LT: 'Thumb', RT: 'Thumb',
};

export const charKey = (c: string) => (c === ' ' ? 'SPACE' : c === '\b' ? 'BKSP' : c.toUpperCase());

export type Ev = {t: number; ch: string; key: string; finger: Finger; hold?: number};
export const ev = (t: number, ch: string): Ev => {
	const key = charKey(ch);
	return {t, ch, key, finger: KEY_FINGER[key] ?? 'RI'};
};
// A non-character key (e.g. LSHIFT) pressed at t and held down for `hold` seconds.
export const keyEv = (t: number, key: string, hold = 0): Ev => ({t, ch: '', key, finger: KEY_FINGER[key] ?? 'RI', hold});
// Deterministic, slightly uneven rhythm so typing looks human.
export const typeText = (text: string, start: number, cps: number): Ev[] => {
	const out: Ev[] = [];
	let t = start;
	for (let i = 0; i < text.length; i++) {
		out.push(ev(t, text[i]));
		t += (0.7 + 0.6 * (((i * 7919) % 17) / 17)) / cps;
	}
	return out;
};

const PRE = 0.09;
const POST = 0.16;
export const fingerMove = (evs: Ev[], f: Finger, t: number) => {
	let m = 0;
	let key: string | null = null;
	for (const e of evs) {
		if (e.finger !== f) continue;
		const hold = e.hold ?? 0;
		const a = e.t - PRE;
		const b = e.t + hold + POST;
		if (t < a || t > b) continue;
		const v = t < e.t ? (t - a) / PRE : t <= e.t + hold ? 1 : 1 - (t - e.t - hold) / POST;
		if (v > m) {
			m = v;
			key = e.key;
		}
	}
	return {m: Math.max(0, Math.min(1, m)), key};
};
export const pressAmount = (evs: Ev[], t: number) => {
	const r: Record<string, number> = {};
	for (const e of evs) {
		const hold = e.hold ?? 0;
		if (t >= e.t && t <= e.t + hold + 0.14) r[e.key] = Math.max(r[e.key] ?? 0, t <= e.t + hold ? 1 : 1 - ((t - e.t - hold) / 0.14) * 0.5);
	}
	return r;
};
export const glowFor = (evs: Ev[], t: number, win = 0.28, override?: (e: Ev) => string | undefined) => {
	const g: Record<string, string> = {};
	for (const e of evs) if (t >= e.t && t <= e.t + win + (e.hold ?? 0)) g[e.key] = override?.(e) ?? FINGER_COLOR[e.finger];
	return g;
};

const FONT = 'Inter, "Segoe UI", Arial, sans-serif';

export const Keyboard: React.FC<{
	L: Layout;
	tint?: Record<string, string>;
	pressed?: Record<string, number>;
	glow?: Record<string, string>;
	dim?: number;
	opacity?: number;
	bumpPulse?: number;
}> = ({L, tint = {}, pressed = {}, glow = {}, dim = 1, opacity = 1, bumpPulse = 0}) => {
	const U = L.U;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity}}>
			<div
				style={{
					position: 'absolute', left: L.ox - U * 0.28, top: L.oy - U * 0.28, width: L.width + U * 0.56, height: L.height + U * 0.56,
					borderRadius: U * 0.3, background: '#111827', border: '2px solid #263244', boxShadow: '0 30px 60px rgba(0,0,0,.55)',
				}}
			/>
			{L.list.map((g) => {
				const p = pressed[g.id] ?? 0;
				const tc = tint[g.id];
				const gl = glow[g.id];
				const small = g.label.length > 1;
				return (
					<div
						key={g.id}
						style={{
							position: 'absolute', left: g.x, top: g.y + p * U * 0.05, width: g.w, height: g.h, borderRadius: U * 0.16,
							background: gl && !tc ? '#3a475e' : tc ?? '#283142',
							borderBottom: `${Math.max(3, U * 0.06)}px solid ${tc ? 'rgba(0,0,0,.35)' : '#1a2230'}`,
							boxShadow: gl ? `0 0 ${U * 0.45}px ${gl}, 0 0 0 3px ${gl}` : 'none',
							opacity: dim < 1 && !tc && !gl ? dim : 1,
							display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: U * 0.1, boxSizing: 'border-box',
							fontFamily: FONT, fontWeight: 800, fontSize: small ? U * 0.24 : U * 0.34, color: tc ? '#0b1220' : '#cbd5e1',
						}}
					>
						{g.label}
						{p > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: U * 0.16, background: `rgba(255,255,255,${0.45 * p})`}} /> : null}
						{g.id === 'F' || g.id === 'J' ? (
							<div
								style={{
									position: 'absolute', left: '50%', top: g.h * 0.56, width: U * 0.3, height: Math.max(3, U * 0.06), marginLeft: -U * 0.15,
									borderRadius: 3, background: bumpPulse ? '#ffd60a' : 'rgba(0,0,0,.55)',
									boxShadow: bumpPulse ? `0 0 ${U * 0.3 * bumpPulse}px #ffd60a` : 'none',
								}}
							/>
						) : null}
					</div>
				);
			})}
		</div>
	);
};

const SKIN = '#e9b893';
const SKIN_D = '#9b6a4b';
const NAIL = '#f8dccb';

export const Hands: React.FC<{L: Layout; evs?: Ev[]; t: number; enterL?: number; enterR?: number; rings?: boolean}> = ({
	L, evs = [], t, enterL = 1, enterR = 1, rings = false,
}) => {
	const U = L.U;
	const sp = L.map.SPACE;
	const hand = (side: 'L' | 'R', enter: number) => {
		if (enter <= 0.001) return null;
		const fs: Finger[] = side === 'L' ? ['LP', 'LR', 'LM', 'LI'] : ['RI', 'RM', 'RR', 'RP'];
		const homes = fs.map((f) => L.map[HOME[f]]);
		const sgn = side === 'L' ? 1 : -1;
		const cx = (homes[0].cx + homes[3].cx) / 2 + sgn * 0.3 * U;
		const cy = homes[0].cy + 2.5 * U;
		const thumb: Finger = side === 'L' ? 'LT' : 'RT';
		const fingers = [...fs, thumb].map((f) => {
			const isThumb = f === 'LT' || f === 'RT';
			const homeX = isThumb ? sp.cx - sgn * 1.25 * U : L.map[HOME[f]].cx;
			const homeY = isThumb ? sp.cy + 0.05 * U : L.map[HOME[f]].cy + 0.28 * U;
			const mv = fingerMove(evs, f, t);
			let tx = homeX;
			let ty = homeY;
			if (mv.key && !isThumb) {
				const g = L.map[mv.key];
				tx = homeX + (g.cx - homeX) * mv.m;
				ty = homeY + (g.cy + 0.28 * U - homeY) * mv.m;
			}
			if (isThumb) ty += mv.m * 0.08 * U;
			const base = isThumb ? 0.6 : f.endsWith('P') ? 0.44 : f.endsWith('R') ? 0.5 : 0.54;
			const press = mv.m > 0.6 ? (mv.m - 0.6) / 0.4 : 0;
			const width = base * U * (1 - 0.07 * press);
			const bx = isThumb ? cx + sgn * 0.6 * U : cx + (homeX - cx) * 0.62;
			const by = isThumb ? cy + 0.25 * U : cy - (f.endsWith('P') ? 0.65 : 0.95) * U;
			return {f, bx, by, tx, ty, width};
		});
		const ax = cx - sgn * 0.55 * U;
		const ay = cy + 6 * U;
		const dy = (1 - enter) * 650;
		return (
			<g key={side} transform={`translate(0 ${dy})`} opacity={Math.min(1, enter * 1.3)}>
				<line x1={cx} y1={cy} x2={ax} y2={ay} stroke={SKIN_D} strokeWidth={2.35 * U + 6} strokeLinecap="round" />
				<ellipse cx={cx} cy={cy} rx={1.72 * U + 3} ry={1.3 * U + 3} fill={SKIN_D} />
				{fingers.map((p) => (
					<line key={p.f + 'o'} x1={p.bx} y1={p.by} x2={p.tx} y2={p.ty} stroke={SKIN_D} strokeWidth={p.width + 6} strokeLinecap="round" />
				))}
				<line x1={cx} y1={cy} x2={ax} y2={ay} stroke={SKIN} strokeWidth={2.35 * U} strokeLinecap="round" />
				<ellipse cx={cx} cy={cy} rx={1.72 * U} ry={1.3 * U} fill={SKIN} />
				{fingers.map((p) => (
					<line key={p.f + 'f'} x1={p.bx} y1={p.by} x2={p.tx} y2={p.ty} stroke={SKIN} strokeWidth={p.width} strokeLinecap="round" />
				))}
				{fingers.map((p) => {
					const dx = p.tx - p.bx;
					const dyy = p.ty - p.by;
					const len = Math.hypot(dx, dyy) || 1;
					const nx = p.tx - (dx / len) * p.width * 0.1;
					const ny = p.ty - (dyy / len) * p.width * 0.1;
					return (
						<ellipse
							key={p.f + 'n'} cx={nx} cy={ny} rx={p.width * 0.27} ry={p.width * 0.33} fill={NAIL} opacity={0.9}
							transform={`rotate(${(Math.atan2(dyy, dx) * 180) / Math.PI + 90} ${nx} ${ny})`}
						/>
					);
				})}
				{rings
					? fingers.map((p) => (
							<circle key={p.f + 'r'} cx={p.tx} cy={p.ty} r={p.width * 0.7} fill="none" stroke={FINGER_COLOR[p.f]} strokeWidth={Math.max(3, U * 0.05)} />
						))
					: null}
			</g>
		);
	};
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
			{hand('L', enterL)}
			{hand('R', enterR)}
		</svg>
	);
};
