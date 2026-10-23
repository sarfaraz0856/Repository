// Deterministic renderer for the full tutorial: window.render(t) draws the frame at time t from window.TL.
const TL = window.TL;
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const seg = (t, a, b) => clamp((t - a) / (b - a));
function lastIdx(arr, t, get) { let lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (get(arr[m]) <= t) { ans = m; lo = m + 1; } else hi = m - 1; } return ans; }

// ---------- icons & static chrome ----------
const S_ = 'stroke="#0f0f0f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const I = {
 cast:`<svg width="24" height="24" viewBox="0 0 24 24" ${S_}><path d="M3 8V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-6"/><path d="M3 12a7 7 0 0 1 7 7M3 16a3 3 0 0 1 3 3"/></svg>`,
 bell:`<svg width="24" height="24" viewBox="0 0 24 24" ${S_}><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/></svg>`,
 search:`<svg width="24" height="24" viewBox="0 0 24 24" ${S_}><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>`,
 gear:`<svg width="24" height="24" viewBox="0 0 24 24" ${S_}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>`,
 more:`<svg width="24" height="24" viewBox="0 0 24 24" fill="#0f0f0f"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>`,
 home:f=>`<svg width="24" height="24" viewBox="0 0 24 24" ${S_} ${f?'fill="#0f0f0f"':''}><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>`,
 shorts:`<svg width="24" height="24" viewBox="0 0 24 24" ${S_}><rect x="6" y="3" width="12" height="18" rx="5"/><path d="M10.5 9.5l4 2.5-4 2.5z"/></svg>`,
 plus:`<svg width="38" height="38" viewBox="0 0 38 38" ${S_}><circle cx="19" cy="19" r="16"/><path d="M19 12v14M12 19h14"/></svg>`,
 subs:`<svg width="24" height="24" viewBox="0 0 24 24" ${S_}><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M6 5h12M8 2h8"/><path d="M10.5 12l4 2.5-4 2.5z"/></svg>`,
};
const navHTML = (youOn, homeOn, logo) => `<div>${I.home(homeOn)}Home</div><div>${I.shorts}Shorts</div><div style="gap:0">${I.plus}</div><div>${I.subs}Subscriptions</div>
 <div><span style="width:26px;height:26px;border-radius:50%;background:#7b1fa2;color:#fff;font-size:13px;display:flex;align-items:center;justify-content:center;${youOn?'box-shadow:0 0 0 2px #fff,0 0 0 4px #0f0f0f;':''}">R</span><b style="font-weight:${youOn?700:400}">You</b></div>`;
$('nav1').innerHTML = navHTML(false, true); $('nav2').innerHTML = navHTML(true, false);
$('nav3').innerHTML = navHTML(true, false); $('nav4').innerHTML = navHTML(true, false);
$('topicons').innerHTML = I.cast + I.bell + I.search; $('youicons').innerHTML = I.cast + I.search + I.gear;
$('chicons').innerHTML = I.cast + I.search + I.more; $('ocicons').innerHTML = I.cast + I.search + I.more;
$('ch2icons').innerHTML = I.cast + I.search + I.more;
// gallery cells
(function () {
  const g = $('ggrid'); const cols = ['#90caf9,#1e88e5','#a5d6a7,#2e7d32','#ffcc80,#ef6c00','#ce93d8,#6a1b9a','#80deea,#00838f','#ef9a9a,#c62828','#fff59d,#f9a825','#bcaaa4,#5d4037','#b0bec5,#37474f'];
  let h = '';
  for (let i = 0; i < 15; i++) { const c = i % 3, r = Math.floor(i / 3); const x = c * 138, y = 84 + r * 138;
    let inner = '';
    if (i === 1) inner = '<div class="logo" style="width:110px;height:110px;font-size:46px;line-height:.85">SL<small style="font-size:10px">HINDI</small></div>';
    else if (i === 3) inner = '<div style="width:136px;height:76px;background:linear-gradient(120deg,#1f3a93,#4a1d8f 55%,#6c2bd9);color:#fff;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center">SMART LEARNING HINDI</div>';
    h += `<div class="cell" id="cell${i}" style="left:${x}px;top:${y}px;background:${i===3?'#222':`linear-gradient(135deg,${cols[i % cols.length]})`}">${inner}<span class="dur gdur" style="display:none">${['2:45','0:58','4:12','1:30','6:05','0:34'][i % 6]}</span></div>`; }
  g.innerHTML = h;
  const k = $('kbd'); const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  k.innerHTML = rows.map((r, i) => `<div class="kr">${i === 2 ? '<span class="g">⇧</span>' : ''}${[...r].map(c => `<span>${c}</span>`).join('')}${i === 2 ? '<span class="g">⌫</span>' : ''}</div>`).join('') +
    '<div class="kr"><span class="g">123</span><span class="g">🙂</span><span class="w">space</span><span class="g" style="flex:0 0 80px">return</span></div>';
})();

// ---------- indexes ----------
const states = {}; TL.sets.forEach(([t, k, v]) => (states[k] = states[k] || []).push([t, v]));
for (const k in states) states[k].sort((a, b) => a[0] - b[0]);
const DEF = { acct: 0, hstate: '', cmenu: 0, vis: 0, visSel: 'Public', aud: '', logo: 0, banner: 0, desc: 0, sv: 0,
  verified: 0, searchRes: 0, galMode: 'photo', loading: 0, focus: '' };
function S(k, t) { const a = states[k]; if (!a) return DEF[k]; const i = lastIdx(a, t, x => x[0]); return i < 0 ? DEF[k] : a[i][1]; }
function ST(k, t) { const a = states[k]; if (!a) return null; const i = lastIdx(a, t, x => x[0]); return i < 0 ? null : a[i][0]; }
function OV(k, t) { const v = S(k, t), s = ST(k, t); if (s === null) return 0; return v ? ease(seg(t, s, s + .35)) : 1 - ease(seg(t, s, s + .3)); }
function TW(k, t, d) { let v = d; for (const w of TL.tweens) if (w.k === k && t >= w.a) v = t >= w.b ? w.to : w.from + (w.to - w.from) * ease(seg(t, w.a, w.b)); return v; }
const typeBy = {}; TL.types.forEach(e => (typeBy[e.f] = typeBy[e.f] || []).push(e));
function TV(f, t) { const a = typeBy[f]; if (!a) return ''; let val = '';
  for (const e of a) { if (e.a > t) break; const from = e.from || ''; let L = 0;
    while (L < from.length && L < e.text.length && from[L] === e.text[L]) L++;
    const del = from.length - L, add = e.text.length - L, n = Math.floor(seg(t, e.a, e.b) * (del + add));
    val = n <= del ? from.slice(0, from.length - n) : e.text.slice(0, L + (n - del)); }
  return val; }
const isTyping = (f, t) => (typeBy[f] || []).some(e => t >= e.a && t <= e.b);

// taps/hl elements
const tapEls = TL.taps.map(([tt, x, y]) => { const d = document.createElement('div'); d.className = 'touch'; d.style.left = x + 'px'; d.style.top = y + 'px';
  const r = document.createElement('div'); r.className = 'ripple'; $('taps').appendChild(d); $('taps').appendChild(r); return { d, r, tt, x, y }; });
const conf = []; let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const ccol = ['#ffd400', '#1fb866', '#ff3b5c', '#4fc3f7', '#ce93d8', '#ff7a00'];
for (let k = 0; k < 46; k++) { const c = document.createElement('div'); c.className = 'conf'; c.style.background = ccol[k % ccol.length]; $('confw').appendChild(c);
  conf.push({ el: c, x: rnd() * 820, y0: -40 - rnd() * 300, v: 260 + rnd() * 260, rot: rnd() * 360, vr: (rnd() - .5) * 720, sway: rnd() * 40 }); }
$('dots').innerHTML = TL.chapters.map(() => '<div></div>').join('');
const screenIds = [...document.querySelectorAll('.scr')].map(e => e.id);
let builtPanel = -1;

window.render = function (t) {
  const D = TL.duration;
  $('fade').style.opacity = Math.max(1 - seg(t, 0, .6), seg(t, D - .8, D));
  const pe = ease(seg(t, .3, 1.3)); $('frame').style.opacity = pe; $('frame').style.transform = `translateY(${(1 - pe) * 50}px)`;
  // screens with crossfade
  const si = lastIdx(TL.screens, t, x => x[0]); const cur = si >= 0 ? TL.screens[si][1] : 'home';
  const prev = si > 0 ? TL.screens[si - 1][1] : null; const p = si >= 0 ? seg(t, TL.screens[si][0], TL.screens[si][0] + .3) : 1;
  for (const id of screenIds) $(id).style.opacity = id === cur ? p : (id === prev ? 1 - p : 0);
  $('splogo').style.transform = `scale(${.7 + .3 * ease(seg(t, si >= 0 ? TL.screens[si][0] : 0, (si >= 0 ? TL.screens[si][0] : 0) + .8))})`;
  // zoom
  let s = 1, ox = 206, oy = 465;
  for (const z of TL.zooms) { const up = .6, dn = .6; if (t >= z.a && t <= z.a + up + z.hold + dn) { ox = z.ox; oy = z.oy;
    s = t < z.a + up ? 1 + (z.z - 1) * ease(seg(t, z.a, z.a + up)) : t <= z.a + up + z.hold ? z.z : 1 + (z.z - 1) * (1 - ease(seg(t, z.a + up + z.hold, z.a + up + z.hold + dn))); } }
  $('content').style.transformOrigin = `${ox}px ${oy}px`; $('content').style.transform = `scale(${s})`;
  // highlight
  let ho = 0; for (const [a, x, y, w, h, d] of TL.hls) { if (t >= a && t <= a + d) { ho = Math.min(seg(t, a, a + .25), 1 - seg(t, a + d - .25, a + d));
    Object.assign($('hl').style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); } }
  $('hl').style.opacity = ho * (.75 + .25 * Math.sin(t * 8));
  for (const e of tapEls) { const dt = t - e.tt;
    e.d.style.opacity = (dt > -.35 && dt < .25) ? (dt < 0 ? clamp((dt + .35) / .15) : 1 - clamp(dt / .25)) : 0;
    if (dt >= 0 && dt < .6) { const q = dt / .6, R = 10 + 40 * q; Object.assign(e.r.style, { left: (e.x - R) + 'px', top: (e.y - R) + 'px', width: 2 * R + 'px', height: 2 * R + 'px', opacity: 1 - q }); }
    else e.r.style.opacity = 0; }
  const blink = Math.floor(t * 2.2) % 2 === 0, focus = S('focus', t);
  const caret = f => { const c = $('c_' + f); if (c) c.style.display = focus === f && (blink || isTyping(f, t)) ? 'inline-block' : 'none'; };
  // --- create sheet ---
  const vN = TV('name', t), vH = TV('handle', t);
  $('v_name').textContent = vN; $('v_handle').textContent = vH;
  $('fname').classList.toggle('focus', focus === 'name'); $('fhandle').classList.toggle('focus', focus === 'handle');
  $('lname').className = 'lab ' + ((focus === 'name' || vN) ? 'up' : 'dn'); $('lhandle').className = 'lab ' + ((focus === 'handle' || vH) ? 'up' : 'dn');
  $('cname').style.display = focus === 'name' && (blink || isTyping('name', t)) ? 'inline-block' : 'none';
  $('chandle').style.display = focus === 'handle' && (blink || isTyping('handle', t)) ? 'inline-block' : 'none';
  const hs = S('hstate', t);
  $('hhelp').innerHTML = hs === 'checking' ? `<span style="display:inline-flex;gap:8px;align-items:center;color:#606060"><span class="spin" style="width:14px;height:14px;border-width:2px;transform:rotate(${t * 720}deg)"></span>Checking availability…</span>`
    : hs === 'taken' ? '<span style="color:#d93025;font-weight:600">✕ This handle isn\'t available</span>' : hs === 'available' ? '<span style="color:#1e8e3e;font-weight:600">✓ Handle available</span>' : '';
  $('fhandle').style.borderColor = hs === 'taken' ? '#d93025' : ''; 
  const ready = hs === 'available'; $('cbtn').style.background = ready ? '#065fd4' : '#e5e5e5'; $('cbtn').style.color = ready ? '#fff' : '#909090';
  const ls = ST('loading', t); $('loading').style.opacity = S('loading', t) ? seg(t, ls, ls + .2) : 0; $('spin2').style.transform = `rotate(${t * 540}deg)`;
  // overlays
  $('acctov').style.opacity = OV('acct', t); $('acctsheet').style.transform = `translateY(${(1 - OV('acct', t)) * 300}px)`;
  $('cmenuov').style.opacity = OV('cmenu', t); $('visov').style.opacity = OV('vis', t);
  // search
  const q = TV('q', t); $('v_q').textContent = q; $('ph_q').style.display = q ? 'none' : 'inline'; caret('q');
  const sr = ST('searchRes', t); $('sres').style.opacity = S('searchRes', t) && sr !== null ? seg(t, sr, sr + .4) : 0;
  // edit / gallery / crop
  const logo = S('logo', t), banner = S('banner', t), desc = S('desc', t);
  $('eav').innerHTML = (logo ? '<div class="logo md" style="position:absolute;left:-4px;top:-4px">SL<small>HINDI</small></div>' : '<span>R</span>') + '<span class="ecam" style="right:-4px;bottom:0;z-index:2">📷</span>';
  $('ebanner').className = 'ebanner' + (banner ? ' on' : '');
  $('edesc').textContent = desc ? 'Namaste! Smart Learning Hindi par aapko…' : 'Add description'; $('edesc').className = desc ? '' : 'grey';
  const gm = S('galMode', t); document.querySelectorAll('.gdur').forEach(e => e.style.display = gm === 'video' ? 'block' : 'none');
  for (const c of ['cell1','cell3']) { const el = $(c); el.classList.toggle('vid', gm === 'video'); }
  $('cropimg').style.transform = `scale(${TW('cropS', t, 1)})`;
  // description
  const dv = TV('desc', t); $('v_desc').textContent = dv; $('dcnt').textContent = dv.length + '/1000'; caret('desc');
  // security / studio
  const sv = S('sv', t); $('svst').textContent = sv ? '✓ On' : 'Off'; $('svst').className = sv ? 'on' : '';
  const svt = ST('sv', t); $('svtoast').style.opacity = sv && svt !== null ? Math.min(seg(t, svt, svt + .3), 1 - seg(t, svt + 2.6, svt + 3)) : 0;
  const vf = S('verified', t); $('imst').textContent = vf ? '✓ Enabled' : 'Requires phone verification'; $('imst').className = vf ? 'ok' : 'pend';
  $('vbtn').style.display = vf ? 'none' : 'block';
  const vft = ST('verified', t); $('vtoast').style.opacity = vf && vft !== null ? Math.min(seg(t, vft, vft + .3), 1 - seg(t, vft + 2.6, vft + 3)) : 0;
  // details
  for (const f of ['vtitle', 'vdesc']) { const v = TV(f, t); $('v_' + f).textContent = v; $('ph_' + f).style.display = v ? 'none' : 'inline'; caret(f); }
  const vs = S('visSel', t); $('visval').textContent = vs;
  for (const o of ['Public', 'Unlisted', 'Private']) $('vr_' + o).classList.toggle('sel', vs === o);
  const au = S('aud', t); $('ar_yes').classList.toggle('sel', au === 'yes'); $('ar_no').classList.toggle('sel', au === 'no');
  const up = TW('upl', t, 0); $('pfill').style.width = (2 * up) + 'px';
  $('upst').textContent = up < 100 ? `Uploading… ${Math.round(up)}%` : (TW('proc', t, 0) < 1 ? 'Processing… (HD will be ready soon)' : '✓ Published · Public');
  // panel
  const pi = lastIdx(TL.panels, t, x => x.t);
  if (pi >= 0) { const P = TL.panels[pi];
    if (builtPanel !== pi) { builtPanel = pi; $('pk').innerHTML = P.kick; $('pk').style.background = P.kc || ''; $('pt').innerHTML = P.title; $('ps').innerHTML = P.sub || '';
      $('pb').innerHTML = TL.bullets.filter(b => b.p === pi).map(b => `<div class="bul${b.neg ? ' neg' : ''}" data-t="${b.t}"><i>${b.neg ? '✕' : '✓'}</i><span>${b.text}</span></div>`).join(''); }
    const o = ease(seg(t, P.t, P.t + .45)); $('pwrap').style.opacity = o; $('pwrap').style.transform = `translateY(${(1 - o) * 26}px)`;
    $('pb').querySelectorAll('.bul').forEach(b => { const bt = +b.dataset.t, k = ease(seg(t, bt, bt + .4)); b.style.opacity = k; b.style.transform = `translateX(${(1 - k) * 30}px)`; });
  }
  const chi = lastIdx(TL.chapters, t, x => x.t);
  [...$('dots').children].forEach((d, k) => d.className = k < chi ? 'done' : (k === chi ? 'on' : ''));
  // captions
  let ct = '', co = 0; for (const [a, b, x] of TL.caps) { if (t >= a - .05 && t <= b) { const o = Math.min(seg(t, a, a + .25), 1 - seg(t, b - .2, b)); if (o >= co) { co = o; ct = x; } } }
  if ($('captxt').textContent !== ct) $('captxt').textContent = ct; $('cap').style.opacity = ct ? Math.max(co, .0) : 0;
  // confetti
  let ctime = null; for (const c of TL.confetti) if (t >= c && t <= c + 6) ctime = c;
  for (const c of conf) { if (ctime === null) { c.el.style.opacity = 0; continue; } const dt = t - ctime;
    const y = c.y0 + c.v * dt, x = c.x + Math.sin(dt * 3 + c.rot) * c.sway; c.el.style.opacity = dt > 5 ? 1 - (dt - 5) : 1;
    c.el.style.transform = `translate(${x}px,${y}px) rotate(${c.rot + c.vr * dt}deg)`; }
};
window.TL_READY = true;
