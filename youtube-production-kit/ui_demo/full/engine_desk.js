// Desktop (laptop + browser) renderer: window.render(t) from window.TL. Taps are mouse clicks with a moving cursor.
const TL = window.TL, $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const seg = (t, a, b) => clamp((t - a) / (b - a));
function lastIdx(arr, t, get) { let lo = 0, hi = arr.length - 1, ans = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (get(arr[m]) <= t) { ans = m; lo = m + 1; } else hi = m - 1; } return ans; }
const MENU = [['⊞','Dashboard'],['▷','Content'],['▥','Analytics'],['☷','Community'],['≡','Subtitles'],['©','Copyright'],['$','Earn'],['✎','Customization'],['♫','Audio library']];
$('menu').innerHTML = MENU.map(([i, n], k) => `<div class="mi" id="mi${k}" style="top:${244 + k * 44}px"><i>${i}</i>${n}</div>`).join('');
const states = {}; TL.sets.forEach(([t, k, v]) => (states[k] = states[k] || []).push([t, v])); for (const k in states) states[k].sort((a, b) => a[0] - b[0]);
const DEF = { stab: 'dash', as2: 0, agree: 0, country: '', focus: '' };
const S = (k, t) => { const a = states[k]; if (!a) return DEF[k]; const i = lastIdx(a, t, x => x[0]); return i < 0 ? DEF[k] : a[i][1]; };
const ST = (k, t) => { const a = states[k]; if (!a) return null; const i = lastIdx(a, t, x => x[0]); return i < 0 ? null : a[i][0]; };
const typeBy = {}; TL.types.forEach(e => (typeBy[e.f] = typeBy[e.f] || []).push(e));
function TV(f, t) { let val = ''; for (const e of (typeBy[f] || [])) { if (e.a > t) break; const n = Math.floor(seg(t, e.a, e.b) * e.text.length); val = e.text.slice(0, n); } return val; }
const isTyping = (f, t) => (typeBy[f] || []).some(e => t >= e.a && t <= e.b);
const conf = []; let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const ccol = ['#ffd400', '#1fb866', '#ff3b5c', '#4fc3f7', '#ce93d8', '#ff7a00'];
for (let k = 0; k < 40; k++) { const c = document.createElement('div'); c.className = 'conf'; c.style.background = ccol[k % 6]; $('confw').appendChild(c);
  conf.push({ el: c, x: rnd() * 480, y0: -40 - rnd() * 300, v: 260 + rnd() * 260, rot: rnd() * 360, vr: (rnd() - .5) * 720, sway: rnd() * 40 }); }
const PAGES = [...document.querySelectorAll('.page')].map(p => p.id);
const URL = { dash: ['studio.youtube.com/channel/UCxx/', 'Channel dashboard - YouTube Studio', ''], earn: ['studio.youtube.com/channel/UCxx/<b>monetization</b>', 'Earn - YouTube Studio', ''],
  gacct: ['accounts.google.com/<b>v3/signin/accountchooser</b>', 'Sign in - Google Accounts', 'g'], ads1: ['adsense.google.com/<b>adsense/signup</b>', 'AdSense for YouTube', 'g'], ads2: ['adsense.google.com/<b>adsense/signup/payee</b>', 'AdSense for YouTube', 'g'],
  adhome: ['adsense.google.com/adsense/<b>youtube/home</b>', 'Home - AdSense for YouTube', 'g'], adpay: ['adsense.google.com/adsense/<b>youtube/payments</b>', 'Payments - AdSense for YouTube', 'g'],
  adtax: ['adsense.google.com/adsense/<b>youtube/payments/tax-info</b>', 'Tax info - AdSense for YouTube', 'g'] };
const clicks = TL.taps.map(([t, x, y]) => ({ t, x, y })).sort((a, b) => a.t - b.t);
let builtPanel = -1;
const FIELDS = [...document.querySelectorAll('[id^="v_"]')].map(el => el.id.slice(2)).filter(f => f !== 'country');
const IFS = [...document.querySelectorAll('[data-if]')], IFNOTS = [...document.querySelectorAll('[data-ifnot]')], ONS = [...document.querySelectorAll('[data-on]')];
window.render = function (t) {
  const D = TL.duration; $('fade').style.opacity = Math.max(1 - seg(t, 0, .6), seg(t, D - .8, D));
  const pe = ease(seg(t, .3, 1.3)); $('lap').style.opacity = pe; $('lap').style.transform = `translateY(${(1 - pe) * 40}px)`;
  const si = lastIdx(TL.screens, t, x => x[0]); const cur = si >= 0 ? TL.screens[si][1] : 'studio'; const prev = si > 0 ? TL.screens[si - 1][1] : null;
  const p = si >= 0 ? seg(t, TL.screens[si][0], TL.screens[si][0] + .3) : 1;
  for (const id of PAGES) $(id).style.opacity = id === cur ? p : (id === prev && prev !== cur ? 1 - p : 0);
  const stab = S('stab', t); $('dash').style.display = stab === 'dash' ? 'block' : 'none'; $('earnv').style.display = stab === 'earn' ? 'block' : 'none';
  MENU.forEach((m, k) => $('mi' + k).className = 'mi' + ((stab === 'dash' && k === 0) || (stab === 'earn' && k === 6) ? ' on' : ''));
  const u = URL[cur === 'studio' ? stab : cur] || URL.dash; $('urlt').innerHTML = u[0]; $('tabt').textContent = u[1]; $('fav').className = 'fav' + (u[2] ? ' g' : '');
  // zoom
  let s = 1, ox = 640, oy = 400;
  for (const z of TL.zooms) { if (t >= z.a && t <= z.a + 1.2 + z.hold) { ox = z.ox; oy = z.oy;
    s = t < z.a + .6 ? 1 + (z.z - 1) * ease(seg(t, z.a, z.a + .6)) : t <= z.a + .6 + z.hold ? z.z : 1 + (z.z - 1) * (1 - ease(seg(t, z.a + .6 + z.hold, z.a + 1.2 + z.hold))); } }
  $('content').style.transformOrigin = `${ox}px ${oy}px`; $('content').style.transform = `scale(${s})`;
  let ho = 0; for (const [a, x, y, w, h, d] of TL.hls) { if (t >= a && t <= a + d) { ho = Math.min(seg(t, a, a + .25), 1 - seg(t, a + d - .25, a + d)); Object.assign($('hl').style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); } }
  $('hl').style.opacity = ho * (.75 + .25 * Math.sin(t * 8));
  // cursor: glide to each click target, rest after
  let cx = 900, cy = 520; const k = clicks.findIndex(c => c.t >= t);
  const prevC = k === -1 ? clicks[clicks.length - 1] : (k > 0 ? clicks[k - 1] : null); const nextC = k === -1 ? null : clicks[k];
  const from = prevC ? [prevC.x, prevC.y] : [900, 520];
  if (nextC) { const a0 = Math.max(prevC ? prevC.t + .25 : 0, nextC.t - 1.0), q = ease(seg(t, a0, nextC.t - .08)); cx = from[0] + (nextC.x - from[0]) * q; cy = from[1] + (nextC.y - from[1]) * q; }
  else { const q = prevC ? ease(seg(t, prevC.t + .9, prevC.t + 1.8)) : 0; cx = from[0] + (1150 - from[0]) * q; cy = from[1] + (735 - from[1]) * q; }
  let press = 1; for (const c of clicks) { const dt = t - c.t; if (dt > -.08 && dt < .18) press = .82; }
  $('cursor').style.transform = `translate(${cx - 3}px,${cy - 2}px) scale(${press})`; $('cursor').style.opacity = t > .8 ? 1 : 0;
  let rp = null; for (const c of clicks) if (t >= c.t && t < c.t + .6) rp = c;
  if (rp) { const q = (t - rp.t) / .6, R = 8 + 30 * q; Object.assign($('rip').style, { left: (rp.x - R) + 'px', top: (rp.y - R) + 'px', width: 2 * R + 'px', height: 2 * R + 'px', opacity: 1 - q }); } else $('rip').style.opacity = 0;
  // adsense states
  const a2 = S('as2', t); $('st2').className = 'stc' + (a2 ? ' ok2' : ''); $('st2').textContent = a2 ? '✓' : '2';
  $('startb').className = 'startb' + (a2 ? ' done' : ''); $('startb').textContent = a2 ? 'DONE' : 'START';
  $('st3s').textContent = a2 ? 'In review · usually takes about a month' : 'Complete the steps above first';
  const a2t = ST('as2', t); $('astoast').style.opacity = a2 && a2t !== null ? Math.min(seg(t, a2t, a2t + .3), 1 - seg(t, a2t + 3, a2t + 3.4)) : 0;
  const cty = S('country', t); $('v_country').textContent = cty || 'Select'; $('v_country').className = cty ? '' : 'grey';
  const ag = S('agree', t); $('agreebox').className = 'box' + (ag ? ' on' : ''); $('agreebox').textContent = ag ? '✓' : '';
  $('as1btn').style.background = ag ? '#065fd4' : '#e5e5e5'; $('as1btn').style.color = ag ? '#fff' : '#909090';
  const focus = S('focus', t), blink = Math.floor(t * 2.2) % 2 === 0;
  for (const f of FIELDS) { const v = TV(f, t); $('v_' + f).textContent = v; const ph = $('ph_' + f); if (ph) ph.style.display = v ? 'none' : 'inline';
    const c = $('c_' + f); if (c) c.style.display = focus === f && (blink || isTyping(f, t)) ? 'inline-block' : 'none'; const fe = $('f_' + f); if (fe) fe.classList.toggle('focus', focus === f); }
  for (const el of IFS) { const k = el.dataset.if, [key, val] = k.split('='); const v = S(key, t); el.style.display = (val === undefined ? !!v : String(v) === val) ? '' : 'none'; }
  for (const el of IFNOTS) el.style.display = S(el.dataset.ifnot, t) ? 'none' : '';
  for (const el of ONS) { const on = !!S(el.dataset.on, t); el.classList.toggle('on', on); if (el.classList.contains('box')) el.textContent = on ? '✓' : ''; }
  // panel
  const pi = lastIdx(TL.panels, t, x => x.t);
  if (pi >= 0) { const P = TL.panels[pi];
    if (builtPanel !== pi) { builtPanel = pi; $('pk').innerHTML = P.kick; $('pk').style.background = P.kc || ''; $('pt').innerHTML = P.title; $('ps').innerHTML = P.sub || '';
      $('pb').innerHTML = TL.bullets.filter(b => b.p === pi).map(b => `<div class="bul${b.neg ? ' neg' : ''}" data-t="${b.t}"><i>${b.neg ? '✕' : '✓'}</i><span>${b.text}</span></div>`).join(''); }
    const o = ease(seg(t, P.t, P.t + .45)); $('pwrap').style.opacity = o; $('pwrap').style.transform = `translateY(${(1 - o) * 26}px)`;
    $('pb').querySelectorAll('.bul').forEach(b => { const bt = +b.dataset.t, kk = ease(seg(t, bt, bt + .4)); b.style.opacity = kk; b.style.transform = `translateX(${(1 - kk) * 30}px)`; }); }
  let ct = '', co = 0; for (const [a, b, x] of TL.caps) { if (t >= a - .05 && t <= b) { const o = Math.min(seg(t, a, a + .25), 1 - seg(t, b - .2, b)); if (o >= co) { co = o; ct = x; } } }
  if ($('captxt').textContent !== ct) $('captxt').textContent = ct; $('cap').style.opacity = ct ? co : 0;
  let ctime = null; for (const c of TL.confetti) if (t >= c && t <= c + 6) ctime = c;
  for (const c of conf) { if (ctime === null) { c.el.style.opacity = 0; continue; } const dt = t - ctime;
    c.el.style.opacity = dt > 5 ? 1 - (dt - 5) : 1; c.el.style.transform = `translate(${c.x + Math.sin(dt * 3 + c.rot) * c.sway}px,${c.y0 + c.v * dt}px) rotate(${c.rot + c.vr * dt}deg)`; }
};
