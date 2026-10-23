// Renders ui_sample.html frame-by-frame (deterministic window.render(t)) and streams JPEGs to stdout.
const path = require('path');
const { chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'));
const FPS = 30, DUR = Number(process.env.DUR || 60), START = Number(process.env.START || 0);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.join(__dirname, process.env.PAGE || 'ui_sample.html'));
  await page.evaluate(() => document.fonts.ready);
  if (errs.length) { console.error('PAGE ERRORS:', errs); process.exit(1); }
  const shots = process.env.SHOTS ? process.env.SHOTS.split(',').map(Number) : null;
  if (shots) {
    for (const t of shots) { await page.evaluate(x => window.render(x), t);
      await page.screenshot({ path: path.join(process.env.OUTDIR, `t${String(t).replace('.', '_')}.png`) }); }
  } else {
    for (let f = Math.round(START * FPS); f < Math.round((START + DUR) * FPS); f++) {
      await page.evaluate(x => window.render(x), f / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
      await new Promise(r => process.stdout.write(buf, r));
    }
  }
  if (errs.length) console.error('PAGE ERRORS:', errs);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
