// Capture real Protean website pages (full-page screenshots + element boxes) for the video.
// Read-only: nothing is submitted, no OTP, no payment.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2];
const VW = 1472, VH = 712, DSF = 1.25;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: DSF });
  const meta = {};
  async function boxes(names) {
    const r = {};
    for (const [k, sel] of Object.entries(names)) {
      const el = p.locator(sel).first();
      try { r[k] = await el.boundingBox(); const s = await p.evaluate(() => window.scrollY); if (r[k]) r[k].y += s; } catch (e) { r[k] = null; }
    }
    return r;
  }
  // 1. PAN apply-online page
  await p.goto('https://tinpan.proteantech.in/services/pan/pan-index.html', { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/home.png`, fullPage: true });
  meta.home = {
    url: p.url(),
    height: await p.evaluate(() => document.documentElement.scrollHeight),
    boxes: await boxes({
      services: 'text=Services >> visible=true',
      sidebar: '.panel, aside, .left-menu, .sidebar >> visible=true',
      applyOnline: 'text=Apply Online >> visible=true',
      knowStatus: 'text=Know Status of Your Application >> visible=true',
      aoCodes: 'text=AO Codes >> visible=true',
      docsReq: 'text=Documents Required >> visible=true',
      form93: 'text=Application for allotment of New PAN (Form No. 93 >> visible=true',
      notice: 'text=With effect from April 01, 2026 >> visible=true',
      applyLink: 'a:text-is("Apply") >> visible=true',
    }),
  };
  // 2. Online application (registration) page
  await p.goto('https://onlineservices.proteantech.in/paam/endUserRegisterContact.html', { waitUntil: 'networkidle', timeout: 90000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/reg.png`, fullPage: true });
  meta.reg = { url: p.url(), height: await p.evaluate(() => document.documentElement.scrollHeight) };
  fs.writeFileSync(`${OUT}/site.json`, JSON.stringify({ VW, VH, DSF, ...meta }, null, 1));
  console.log(JSON.stringify(meta, null, 1));
  await b.close();
})();
