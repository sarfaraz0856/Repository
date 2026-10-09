const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [,, out, ...times] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'mars.html'));
  await p.evaluate(() => document.fonts.ready);
  for (const t of times) {
    await p.evaluate(t => render(t), +t);
    await p.screenshot({ path: `${out}/t${t}.png` });
  }
  await b.close();
})();
