// Frame-by-frame capture of the REAL Protean PAN application page (CDP screenshots piped to ffmpeg).
// Read-only demo: only sample details are typed, the form is never submitted.
// Usage: node capture_sample.js <out.mp4> <timeline.json>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');

const OUT = process.argv[2];
const T = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')); // { total, lines:[{start,end}], ... }
const FPS = 30;
const URL = 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html';
const ADDR_H = 46;

const fr = (s) => Math.round(s * FPS);
const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

const OVERLAY = `
(() => {
  const st = document.createElement('style');
  st.textContent = \`
   .navbar-fixed-top{ top:${ADDR_H}px !important; }
   body{ margin-top:${ADDR_H}px !important; }
   #ov-addr{position:fixed;left:0;top:0;right:0;height:${ADDR_H}px;background:#fff;border-bottom:1px solid #DADCE0;z-index:2147483600;display:flex;align-items:center;gap:12px;padding:0 14px;font-family:Inter,Arial,sans-serif}
   #ov-addr .nav{color:#777;font-size:17px;letter-spacing:6px}
   #ov-addr .bar{flex:1;height:32px;border-radius:16px;background:#F1F3F4;display:flex;align-items:center;padding:0 14px;font-size:15px;color:#202124;white-space:nowrap;overflow:hidden}
   #ov-addr .lock{margin-right:8px;font-size:13px}
   #ov-cover{position:fixed;left:0;right:0;top:${ADDR_H}px;bottom:0;background:#fff;z-index:2147483500;display:flex;align-items:center;justify-content:center;color:#5F6368;font:600 24px Inter,Arial}
   #ov{position:fixed;inset:0;z-index:2147483646;pointer-events:none;font-family:Inter,Arial,sans-serif}
   #ov-cur{position:absolute;width:26px;height:32px}
   .ov-rip{position:absolute;border:3px solid #FF6A00;border-radius:50%}
   #ov-hl{position:absolute;border:4px solid #E11D2E;border-radius:8px;box-shadow:0 0 18px rgba(225,29,46,.55)}
   .ov-call{position:absolute;background:#E11D2E;color:#fff;border-radius:12px;padding:12px 18px;font-weight:800;font-size:21px;box-shadow:0 10px 26px rgba(0,0,0,.3);max-width:430px;line-height:1.3}
   .ov-call small{display:block;font-weight:600;font-size:16px;opacity:.95;margin-top:4px}
   #ov-tag{position:absolute;background:#0A7A3D;color:#fff;font-weight:800;font-size:16px;padding:6px 12px;border-radius:8px}
   #ov-step{position:absolute;right:16px;bottom:16px;display:flex;border-radius:10px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.3);font-weight:800;font-size:17px}
   #ov-step b{background:#FF8A00;color:#1B1300;padding:8px 12px}
   #ov-step span{background:#0A1A33;color:#fff;padding:8px 14px}
  \`;
  document.head.appendChild(st);
  const a = document.createElement('div'); a.id='ov-addr';
  a.innerHTML = '<span class="nav">←→⟳</span><div class="bar"><span class="lock">🔒</span><span id="ov-url"></span><span id="ov-caret" style="width:2px;height:18px;background:#202124;margin-left:1px"></span></div>';
  document.body.appendChild(a);
  const c = document.createElement('div'); c.id='ov-cover'; c.textContent='New Tab'; document.body.appendChild(c);
  const o = document.createElement('div'); o.id='ov';
  o.innerHTML = '<div id="ov-hl" style="display:none"></div><div id="ov-calls"></div><div id="ov-tag" style="display:none">Sample details</div><div id="ov-step" style="display:none"><b></b><span></span></div><div id="ov-rips"></div>' +
    '<svg id="ov-cur" viewBox="0 0 22 26"><path d="M2 1.5v19l5-4.5 3.4 7.4 3.3-1.5-3.3-7.2 6.8-.3z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  document.body.appendChild(o);
  window.__ov = (s) => {
    document.getElementById('ov-url').textContent = s.url;
    document.getElementById('ov-caret').style.display = s.caret ? 'inline-block' : 'none';
    const cv = document.getElementById('ov-cover'); cv.style.opacity = s.cover; cv.style.display = s.cover > 0 ? 'flex' : 'none';
    const cur = document.getElementById('ov-cur'); cur.style.left = s.cx + 'px'; cur.style.top = s.cy + 'px'; cur.style.opacity = s.cur;
    document.getElementById('ov-rips').innerHTML = s.rips.map(r => '<div class="ov-rip" style="left:'+(r.x-r.r)+'px;top:'+(r.y-r.r)+'px;width:'+(2*r.r)+'px;height:'+(2*r.r)+'px;opacity:'+r.o+'"></div>').join('');
    const hl = document.getElementById('ov-hl');
    if (s.hl) { hl.style.display='block'; Object.assign(hl.style,{left:s.hl.x+'px',top:s.hl.y+'px',width:s.hl.w+'px',height:s.hl.h+'px',opacity:s.hl.o}); } else hl.style.display='none';
    document.getElementById('ov-calls').innerHTML = s.calls.map(k => '<div class="ov-call" style="left:'+k.x+'px;top:'+k.y+'px;opacity:'+k.o+';transform:translateY('+((1-k.o)*10)+'px)">'+k.html+'</div>').join('');
    const tg = document.getElementById('ov-tag');
    if (s.tag) { tg.style.display='block'; tg.style.left=s.tag.x+'px'; tg.style.top=s.tag.y+'px'; tg.style.opacity=s.tag.o; } else tg.style.display='none';
    const sp = document.getElementById('ov-step');
    if (s.step) { sp.style.display='flex'; sp.querySelector('b').textContent=s.step[0]; sp.querySelector('span').textContent=s.step[1]; } else sp.style.display='none';
  };
})();`;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
  await p.evaluate(OVERLAY);
  await p.waitForTimeout(500);
  const cdp = await ctx.newCDPSession(p);

  const L = T.lines; // seconds (raw)
  const box = async (sel) => { const r = await p.locator(sel).first().boundingBox(); return r; };

  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', OUT]);
  ff.stderr.on('data', (d) => process.stderr.write(d));

  const url = 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html';
  const t0 = T.siteStart;
  const N = fr(T.total - t0);
  // keyframes for cursor (seconds absolute, positions resolved lazily)
  let sel2 = await box('.select2-selection');
  const cursorKeys = [];
  const clicks = [];
  let state = { cx: 900, cy: 500 };
  let curFrom = { x: 900, y: 500 }, curTo = null, curT0 = 0, curT1 = 0;
  const moveTo = (x, y, at, dur = 0.7) => { cursorKeys.push({ x, y, at, dur }); };

  // schedule (absolute raw seconds)
  const typeStart = L[1].start + 0.1, typeEnd = typeStart + 1.9;
  const coverOut = typeEnd + 0.3;
  const clickSelect = L[2].start + 2.2;
  const clickOpt = L[3].start + 5.4;
  const scrollStart = L[6].start + 0.05, scrollEnd = scrollStart + 1.0, SCROLL = 230;
  const clickName = L[6].start + 1.5;
  const typeNameStart = clickName + 0.35;
  const NAME = 'RAHUL';
  let did = {};
  let optBox = null, selBoxAfter = null, nameBox = null;
  let typedName = 0;
  let cur = { x: 900, y: 520 };
  let target = null;

  for (let i = 0; i < N; i++) {
    const t = t0 + i / FPS;
    // ---------- real interactions ----------
    if (!did.open && t >= clickSelect) { did.open = 1; await p.mouse.click(sel2.x + sel2.width / 2, sel2.y + sel2.height / 2); await p.waitForTimeout(400); optBox = await box('.select2-results__option:has-text("Form No. 93")'); clicks.push({ at: t, x: sel2.x + sel2.width / 2, y: sel2.y + sel2.height / 2 }); }
    if (!did.pick && t >= clickOpt) { did.pick = 1; clicks.push({ at: t, x: optBox.x + 140, y: optBox.y + optBox.height / 2 }); await p.mouse.click(optBox.x + 140, optBox.y + optBox.height / 2); await p.waitForTimeout(600); selBoxAfter = await box('.select2-selection'); }
    if (t >= scrollStart && t <= scrollEnd + 0.05) { const y = SCROLL * ease((t - scrollStart) / (scrollEnd - scrollStart)); await p.evaluate((y) => window.scrollTo(0, y), y); }
    if (!did.name && t >= clickName) { did.name = 1; nameBox = await box('#f_name_end'); clicks.push({ at: t, x: nameBox.x + 120, y: nameBox.y + nameBox.height / 2 }); await p.mouse.click(nameBox.x + 120, nameBox.y + nameBox.height / 2); }
    if (did.name && typedName < NAME.length && t >= typeNameStart + typedName * 0.16) { await p.keyboard.type(NAME[typedName]); typedName++; }

    // ---------- cursor path ----------
    if (t < L[2].start + 0.8) target = { x: 900, y: 520 };
    else if (t < clickOpt - 1.2) target = { x: sel2.x + sel2.width / 2, y: sel2.y + sel2.height / 2 };
    else if (t < L[4].start) target = optBox ? { x: optBox.x + 140, y: optBox.y + optBox.height / 2 } : target;
    else if (t < L[6].start + 0.6) target = selBoxAfter ? { x: selBoxAfter.x + selBoxAfter.width - 40, y: selBoxAfter.y + selBoxAfter.height + 26 } : target;
    else target = nameBox ? { x: nameBox.x + 120, y: nameBox.y + nameBox.height / 2 } : { x: 300, y: 420 };
    cur.x += (target.x - cur.x) * 0.16; cur.y += (target.y - cur.y) * 0.16;
    if (t > L[2].start) await p.mouse.move(cur.x, cur.y);

    // ---------- overlay state ----------
    const nT = Math.floor(lerp(0, url.length, ease((t - typeStart) / (typeEnd - typeStart))));
    const s = {
      url: t < typeStart ? '' : url.slice(0, Math.max(0, nT)),
      caret: t < coverOut,
      cover: t < coverOut ? 1 : Math.max(0, 1 - (t - coverOut) / 0.35),
      cx: cur.x - 3, cy: cur.y - 2, cur: t > L[1].start + 0.2 ? 1 : 0,
      rips: clicks.filter(c => t >= c.at && t < c.at + 0.6).map(c => { const q = (t - c.at) / 0.6; return { x: c.x, y: c.y, r: 6 + 30 * q, o: 1 - q }; }),
      hl: null, calls: [], tag: null,
      step: t <= coverOut ? null : t < L[6].start ? ['STEP 1', 'Select PAN Application Type'] : ['STEP 2', 'Applicant Information'],
    };
    const fade = (a, z) => Math.max(0, Math.min(1, (t - a) / 0.3, (z - t) / 0.3));
    if (t > L[3].start + 0.3 && t < L[3].end + 0.2 && optBox && !did.pick) s.hl = { x: optBox.x - 4, y: optBox.y - 3, w: optBox.width + 8, h: optBox.height + 6, o: fade(L[3].start + 0.3, L[3].end + 0.2) };
    if (t > L[4].start && t < L[5].end + 0.3 && selBoxAfter) {
      s.hl = { x: selBoxAfter.x - 6, y: selBoxAfter.y - 6, w: selBoxAfter.width + 12, h: selBoxAfter.height + 12, o: fade(L[4].start, L[5].end + 0.3) };
    }
    if (selBoxAfter && t > L[4].start + 0.2 && t < L[4].end + 0.3) s.calls.push({ x: selBoxAfter.x + selBoxAfter.width + 30, y: selBoxAfter.y - 34, o: fade(L[4].start + 0.2, L[4].end + 0.3), html: '1 April 2026 se naya form<small>New PAN – Form No. 93 (Indian Citizen)</small>' });
    if (selBoxAfter && t > L[5].start + 1.0 && t < L[5].end + 0.3) s.calls.push({ x: selBoxAfter.x + selBoxAfter.width + 30, y: selBoxAfter.y - 34, o: fade(L[5].start + 1.0, L[5].end + 0.3), html: '"Applicant Category" dropdown hat gaya<small>Form 93 chunne ke baad ye field nahi dikhta</small>' });
    if (nameBox && t > clickName) s.tag = { x: nameBox.x, y: nameBox.y - 58, o: Math.min(1, (t - clickName) / 0.3) };

    await p.evaluate((s) => window.__ov(s), s);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
    if (!ff.stdin.write(Buffer.from(shot.data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log('frame', i, '/', N);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await b.close();
  console.log('done');
})();
