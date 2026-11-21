// Usage: node render.js <shot> [--frames a:b] [--stills f1,f2,..] [--out file] [--w W --h H]
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { start } = require('./server');

const args = process.argv.slice(2);
const shot = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const W = +opt('w', 1920), H = +opt('h', 1080);
const port = +opt('port', 8765 + Math.floor(Math.random() * 1000));

(async () => {
  const srv = await start(port);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-watchdog', '--js-flags=--max-old-space-size=8192'] });
  const page = await browser.newPage({ viewport: { width: Math.min(W, 1920), height: Math.min(H, 1920) } });
  page.on('console', m => { const t = m.text(); if (!/GPU stall|ReadPixels/.test(t)) console.log('PAGE:', t); });
  page.on('pageerror', e => console.log('PAGEERR:', e.message));
  page.setDefaultTimeout(0);
  await page.goto(`http://localhost:${port}/web/index.html?shot=${shot}&w=${W}&h=${H}${opt('extra', '') ? '&' + opt('extra', '') : ''}`);
  await page.waitForFunction(() => window.ready || window.initError, null, { timeout: 0, polling: 200 });
  const err = await page.evaluate(() => window.initError);
  if (err) { console.log('INIT FAILED', err); await browser.close(); srv.close(); process.exit(1); }
  const info = await page.evaluate(() => window.shotInfo);
  const stills = opt('stills', null);
  if (stills) {
    const outDir = opt('outdir', path.join(__dirname, 'out', 'stills'));
    fs.mkdirSync(outDir, { recursive: true });
    for (const f of stills.split(',').map(Number)) {
      const t0 = Date.now();
      const b64 = await page.evaluate(f => window.renderFrame(f), f);
      const raw = Buffer.from(b64, 'base64');
      const file = path.join(outDir, `${shot}_${String(f).padStart(4, '0')}.png`);
      await new Promise((res, rej) => {
        const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-', '-vf', 'vflip', '-frames:v', '1', file]);
        ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c)));
        ff.stdin.end(raw);
      });
      console.log(`still ${shot} f${f} ${(Date.now() - t0) / 1000}s -> ${file}`);
    }
  } else {
    const [a, b] = (opt('frames', `0:${info.frames}`)).split(':').map(Number);
    const out = opt('out', path.join(__dirname, 'out', `${shot}.mov`));
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '24', '-i', '-',
      '-vf', 'vflip', '-c:v', 'libx264', '-preset', 'medium', '-crf', '9', '-pix_fmt', 'yuv444p', '-profile:v', 'high444', out]);
    ff.stderr.on('data', d => process.stderr.write(d));
    const t0 = Date.now();
    for (let f = a; f < b; f++) {
      const b64 = await page.evaluate(f => window.renderFrame(f), f);
      const raw = Buffer.from(b64, 'base64');
      if (!ff.stdin.write(raw)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - a) % 12 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${shot} frame ${f}/${b} elapsed ${el.toFixed(0)}s (${(el / (f - a + 1)).toFixed(2)} s/f)`); }
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
