// Frame-by-frame capture of the REAL Protean pages for one segment (CDP JPEG screenshots -> ffmpeg).
// Nothing is ever submitted: no captcha solving, no OTP, no payment.
// Usage: node capture.js <segmentName> <timeline.json> <out.mp4>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');

const [SEG, TL, OUT] = process.argv.slice(2);
const T = JSON.parse(fs.readFileSync(TL, 'utf8')).segments[SEG]; // {dur, lines:[{start,end}]}
const FPS = 30, VW = 1152, VH = 648, DSF = 1920 / 1152, ADDR = 44;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

const OVERLAY = (ADDR) => {
  const st = document.createElement('style');
  st.textContent = `
   body{ margin-top:${ADDR}px !important; }
   #ov-addr{position:fixed;left:0;top:0;right:0;height:${ADDR}px;background:#fff;border-bottom:1px solid #DADCE0;z-index:2147483600;display:flex;align-items:center;gap:12px;padding:0 12px;font-family:Inter,Arial,sans-serif}
   #ov-addr .nav{color:#777;font-size:16px;letter-spacing:6px}
   #ov-addr .bar{flex:1;height:30px;border-radius:15px;background:#F1F3F4;display:flex;align-items:center;padding:0 14px;font-size:14px;color:#202124;white-space:nowrap;overflow:hidden}
   #ov-cover{position:fixed;left:0;right:0;top:${ADDR}px;bottom:0;background:#fff;z-index:2147483500}
   #ov{position:fixed;inset:0;z-index:2147483646;pointer-events:none;font-family:Inter,Arial,sans-serif}
   #ov-cur{position:absolute;width:24px;height:30px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
   .ov-rip{position:absolute;border:3px solid #FF6A00;border-radius:50%}
   .ov-hl{position:absolute;border:3px solid #E11D2E;border-radius:7px;box-shadow:0 0 14px rgba(225,29,46,.5)}
   .ov-call{position:absolute;background:#E11D2E;color:#fff;border-radius:11px;padding:10px 16px;font-weight:800;font-size:19px;box-shadow:0 8px 22px rgba(0,0,0,.28);max-width:400px;line-height:1.3}
   .ov-call small{display:block;font-weight:600;font-size:14.5px;opacity:.95;margin-top:3px}
   .ov-call.g{background:#0B7A3E}.ov-call.b{background:#0A1A33}
   #ov-step{position:absolute;right:14px;bottom:14px;display:flex;border-radius:9px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.3);font-weight:800;font-size:16px}
   #ov-step b{background:#FF8A00;color:#1B1300;padding:7px 11px}
   #ov-step span{background:#0A1A33;color:#fff;padding:7px 13px}`;
  document.head.appendChild(st);
  // keep fixed/sticky site headers below the fake address bar
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if ((cs.position === 'fixed' || cs.position === 'sticky') && parseFloat(cs.top) < 5) el.style.top = ADDR + 'px';
  }
  const a = document.createElement('div'); a.id = 'ov-addr';
  a.innerHTML = '<span class="nav">←→⟳</span><div class="bar"><span style="margin-right:8px;font-size:12px">🔒</span><span id="ov-url"></span><span id="ov-caret" style="width:2px;height:17px;background:#202124;margin-left:1px"></span></div>';
  document.body.appendChild(a);
  const c = document.createElement('div'); c.id = 'ov-cover'; document.body.appendChild(c);
  const o = document.createElement('div'); o.id = 'ov';
  o.innerHTML = '<div id="ov-hls"></div><div id="ov-calls"></div><div id="ov-step" style="display:none"><b></b><span></span></div><div id="ov-rips"></div>' +
    '<svg id="ov-cur" viewBox="0 0 22 26"><path d="M2 1.5v19l5-4.5 3.4 7.4 3.3-1.5-3.3-7.2 6.8-.3z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  document.body.appendChild(o);
  window.__ov = (s) => {
    document.getElementById('ov-url').textContent = s.url;
    document.getElementById('ov-caret').style.display = s.caret ? 'inline-block' : 'none';
    const cv = document.getElementById('ov-cover'); cv.style.opacity = s.cover; cv.style.display = s.cover > 0 ? 'block' : 'none';
    const cur = document.getElementById('ov-cur'); cur.style.left = s.cx + 'px'; cur.style.top = s.cy + 'px'; cur.style.opacity = s.cur;
    document.getElementById('ov-rips').innerHTML = s.rips.map(r => `<div class="ov-rip" style="left:${r.x - r.r}px;top:${r.y - r.r}px;width:${2 * r.r}px;height:${2 * r.r}px;opacity:${r.o}"></div>`).join('');
    document.getElementById('ov-hls').innerHTML = s.hls.map(h => `<div class="ov-hl" style="left:${h.x}px;top:${h.y}px;width:${h.w}px;height:${h.h}px;opacity:${h.o};border-color:${h.c || '#E11D2E'}"></div>`).join('');
    document.getElementById('ov-calls').innerHTML = s.calls.map(k => `<div class="ov-call ${k.cls || ''}" style="left:${k.x}px;top:${k.y}px;opacity:${k.o};transform:translateY(${(1 - k.o) * 8}px)">${k.html}</div>`).join('');
    const sp = document.getElementById('ov-step');
    if (s.step) { sp.style.display = 'flex'; sp.querySelector('b').textContent = s.step[0]; sp.querySelector('span').textContent = s.step[1]; } else sp.style.display = 'none';
  };
};

const SEGMENTS = require('./segments.js');

(async () => {
  const cfg = SEGMENTS[SEG](T.lines);
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DSF });
  const p = await ctx.newPage();
  await p.goto(cfg.url, { waitUntil: 'networkidle', timeout: 120000 });
  await p.waitForTimeout(800);
  await p.evaluate(OVERLAY, ADDR);
  if (cfg.prep) await cfg.prep(p);
  await p.waitForTimeout(300);
  const cdp = await ctx.newCDPSession(p);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', OUT]);
  ff.stderr.on('data', (d) => process.stderr.write(d));

  const box = async (sel) => { try { return await p.locator(sel).first().boundingBox({ timeout: 2000 }); } catch { return null; } };
  const N = Math.round(T.dur * FPS);
  const clicks = [];
  const done = new Set();
  const jobs = (cfg.type || []).map((j) => ({ ...j, n: 0, started: false }));
  let cur = { ...(cfg.cursorStart || { x: VW * 0.7, y: VH * 0.7 }) };
  let scrollY = 0;
  const typeUrl = cfg.typeUrl; // {a, z}
  const coverOut = typeUrl ? typeUrl.z + 0.25 : 0.0;

  for (let i = 0; i < N; i++) {
    const t = i / FPS;
    // one-shot actions
    for (const [k, act] of (cfg.actions || []).entries()) {
      if (!done.has(k) && t >= act.at) {
        done.add(k);
        if (act.click) { const bx = await box(act.click); if (bx) { const c = { x: bx.x + (act.dx ?? bx.width / 2), y: bx.y + bx.height / 2 }; clicks.push({ at: t, ...c }); if (!act.fake) await p.mouse.click(c.x, c.y); await p.waitForTimeout(act.wait || 300); } }
        if (act.run) await act.run(p);
        if (act.blur) await p.evaluate((s) => { const e = document.querySelector(s); if (e) e.style.filter = 'blur(6px)'; }, act.blur);
      }
    }
    // scroll tweens (to absolute y or to put a selector near a viewport fraction)
    for (const s of cfg.scrolls || []) {
      if (t >= s.a && t <= s.z + 1 / FPS) {
        if (s.fromY === undefined) s.fromY = await p.evaluate(() => window.scrollY);
        if (s.toY === undefined) {
          if (s.sel) { const bx = await box(s.sel); s.toY = Math.max(0, s.fromY + (bx ? bx.y : 0) - (s.frac ?? 0.3) * VH); }
          else s.toY = s.y;
        }
        scrollY = lerp(s.fromY, s.toY, ease((t - s.a) / (s.z - s.a)));
        await p.evaluate((y) => window.scrollTo(0, y), scrollY);
      }
    }
    // typing jobs
    for (const j of jobs) {
      if (!j.started && t >= j.at) {
        j.started = true; const bx = await box(j.sel);
        if (bx) { const c = { x: bx.x + Math.min(120, bx.width / 2), y: bx.y + bx.height / 2 }; clicks.push({ at: t, ...c }); await p.mouse.click(c.x, c.y); }
      }
      if (j.started && j.n < j.text.length && t >= j.at + 0.3 + j.n * j.gap) {
        await p.keyboard.type(j.text[j.n]); j.n++;
        if (j.n === j.text.length) { if (j.esc) { await p.keyboard.press('Escape'); await p.mouse.click(VW - 20, VH * 0.6); } if (j.blur) await p.evaluate((s) => { const e = document.querySelector(s); if (e) e.style.filter = 'blur(6px)'; }, j.sel); }
      }
    }
    // cursor: latest target whose time has come (or upcoming typing job)
    let tgt = null;
    for (const c of cfg.cursor || []) if (t >= c.at) tgt = c;
    const nextJob = jobs.find((j) => !j.started && t >= j.at - 0.6);
    if (nextJob) tgt = { sel: nextJob.sel, dx: 120 };
    if (tgt) {
      let pt = null;
      if (tgt.sel) { const bx = await box(tgt.sel); if (bx) pt = { x: bx.x + (tgt.dx ?? bx.width / 2), y: bx.y + bx.height / 2 + (tgt.dy || 0) }; }
      else pt = { x: tgt.x, y: tgt.y };
      if (pt) { cur.x += (pt.x - cur.x) * 0.15; cur.y += (pt.y - cur.y) * 0.15; }
    }
    if (cfg.hover !== false && t > (coverOut || 0)) await p.mouse.move(cur.x, cur.y);

    // overlay
    const fade = (a, z) => Math.max(0, Math.min(1, (t - a) / 0.3, (z - t) / 0.3));
    const hls = [], calls = [];
    for (const h of cfg.hl || []) {
      if (t < h.a || t > h.z) continue;
      const sels = Array.isArray(h.sel) ? h.sel : [h.sel];
      for (const sel of sels) {
        const bx = await box(sel); if (!bx) continue; const pad = h.pad ?? 5;
        hls.push({ x: bx.x - pad, y: bx.y - pad, w: bx.width + 2 * pad, h: bx.height + 2 * pad, o: fade(h.a, h.z), c: h.color });
      }
    }
    for (const k of cfg.calls || []) {
      if (t < k.a || t > k.z) continue;
      let x = k.x, y = k.y;
      if (k.sel) { const bx = await box(k.sel); if (!bx) continue; const pos = k.pos || 'right';
        if (pos === 'right') { x = bx.x + bx.width + 22; y = bx.y - 6; }
        if (pos === 'below') { x = bx.x + (k.ox || 0); y = bx.y + bx.height + 14; }
        if (pos === 'above') { x = bx.x + (k.ox || 0); y = bx.y - 78; }
        if (pos === 'left') { x = bx.x - 420; y = bx.y - 6; }
        x = Math.min(Math.max(8, x), VW - 410); y = Math.min(Math.max(ADDR + 8, y), VH - 110);
      }
      calls.push({ x, y, o: fade(k.a, k.z), html: k.html, cls: k.cls });
    }
    const url = cfg.urlShown || cfg.url;
    const nT = typeUrl ? Math.floor(lerp(0, url.length, ease((t - typeUrl.a) / (typeUrl.z - typeUrl.a)))) : url.length;
    const s = {
      url: typeUrl && t < typeUrl.a ? '' : url.slice(0, nT),
      caret: typeUrl ? t < coverOut : false,
      cover: typeUrl ? (t < coverOut ? 1 : Math.max(0, 1 - (t - coverOut) / 0.35)) : Math.max(0, 1 - t / 0.35),
      cx: cur.x - 3, cy: cur.y - 2, cur: t > (cfg.cursorFrom ?? 0.3) ? 1 : 0,
      rips: clicks.filter((c) => t >= c.at && t < c.at + 0.6).map((c) => { const q = (t - c.at) / 0.6; return { x: c.x, y: c.y, r: 6 + 28 * q, o: 1 - q }; }),
      hls, calls,
      step: (cfg.steps || []).filter((st) => t >= st.at).map((st) => st.v).pop() || null,
    };
    await p.evaluate((s) => window.__ov(s), s);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
    if (!ff.stdin.write(Buffer.from(shot.data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  fs.writeFileSync(OUT + '.clicks.json', JSON.stringify(clicks.map((c) => c.at)));
  await b.close();
  console.log('done', SEG, N, 'frames');
})();
