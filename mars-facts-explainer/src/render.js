// Renders mars.html frame by frame into an H.264 MP4 using parallel workers.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const FPS = 30, DUR = 90, TOTAL = FPS * DUR, WORKERS = +(process.env.WORKERS || 4);
const outDir = process.argv[2];
async function worker(w) {
  const a = Math.floor(TOTAL * w / WORKERS), b = Math.floor(TOTAL * (w + 1) / WORKERS);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), `${outDir}/part${w}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'mars.html'));
  await p.evaluate(() => document.fonts.ready);
  for (let f = a; f < b; f++) {
    await p.evaluate(t => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 150 === 0) console.log(`worker ${w}: ${f - a}/${b - a}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
}
(async () => {
  await Promise.all([...Array(WORKERS).keys()].map(worker));
  fs.writeFileSync(`${outDir}/parts.txt`, [...Array(WORKERS).keys()].map(w => `file 'part${w}.mp4'`).join('\n'));
  console.log('done');
})();
