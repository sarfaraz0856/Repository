// Full-length renderer (v3): renders graphics/scenes_v3.html frames [f0, f1) at 30 fps into one H.264 segment.
// Run several in parallel for different frame ranges, then concat (see render_all_v3.sh).
// Usage: node render_frames_v3.js <timings.json> <framesA_dir> <framesB_dir> <out.mp4> <f0> <f1> [stillsDir t1,t2,...]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'); const fs = require('fs');
const [tim, dirA, dirB, out, f0s, f1s, stillsDir, stillTimes] = process.argv.slice(2);
const FPS = 30;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, '../graphics/scenes_v3.html'));
  await page.evaluate(([T, a, b]) => { window.TIM = T; window.DIR_A = 'file://' + a; window.DIR_B = 'file://' + b; window.init(); },
    [JSON.parse(fs.readFileSync(tim)), path.resolve(dirA), path.resolve(dirB)]);
  await page.evaluate(() => document.fonts.ready);
  if (stillsDir) {               // preview mode: write PNG stills at the given times and exit
    for (const t of stillTimes.split(',').map(Number)) { await page.evaluate(t => window.render(t), t); await page.screenshot({ path: `${stillsDir}/s_${t.toFixed(2).padStart(7, '0')}.png` }); }
    await browser.close(); return;
  }
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium',
    '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-g', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = buf => new Promise(r => ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r));
  const f0 = +f0s, f1 = +f1s;
  for (let i = f0; i < f1; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    await write(await page.screenshot({ type: 'png' }));
    if ((i - f0) % 300 === 0) console.log(`${path.basename(out)} frame ${i - f0}/${f1 - f0}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
})();
