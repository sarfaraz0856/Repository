// Renders graphics/scenes.html at 30 fps with Playwright (pre-installed Chromium) and pipes PNG frames
// into FFmpeg. Produces two silent masters in one pass: with burned-in captions and without.
// Scene file: graphics/$SCENES_HTML (default scenes.html).
// Usage: node render_frames.js <captions.json> <terminal_frames_dir> <out_with_caps.mp4> <out_clean.mp4> [t0 t1]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const [capsFile, termDir, outCaps, outClean, t0s, t1s] = process.argv.slice(2);
const FPS = 30, T0 = parseFloat(t0s || '0'), T1 = parseFloat(t1s || '60');
const ff = out => spawn('ffmpeg', ['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',
  '-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-r',String(FPS),'-movflags','+faststart', out], { stdio: ['pipe','inherit','inherit'] });
const write = (p, buf) => new Promise(r => p.stdin.write(buf) ? r() : p.stdin.once('drain', r));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, '../graphics', process.env.SCENES_HTML || 'scenes.html'));
  await page.evaluate(([caps, dir]) => { window.CAPS = caps; window.TERM_DIR = 'file://' + dir; }, [JSON.parse(fs.readFileSync(capsFile)), path.resolve(termDir)]);
  await page.evaluate(() => document.fonts.ready);
  const a = ff(outCaps), b = ff(outClean);
  const n = Math.round((T1 - T0) * FPS);
  for (let i = 0; i < n; i++) {
    const t = T0 + i / FPS;
    await page.evaluate(t => { window.SHOW_CAPS = false; return window.render(t); }, t);
    await write(b, await page.screenshot({ type: 'png' }));
    await page.evaluate(t => { window.SHOW_CAPS = true; return window.render(t); }, t);
    await write(a, await page.screenshot({ type: 'png' }));
    if (i % 150 === 0) console.log(`frame ${i}/${n}  t=${t.toFixed(2)}s`);
  }
  a.stdin.end(); b.stdin.end();
  await Promise.all([a, b].map(p => new Promise(r => p.on('close', r))));
  await browser.close();
})();
