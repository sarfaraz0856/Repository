// Export the S8 lamp flicker intensity (same formula as the shot) at 1 kHz for the audio buzz.
import { fbm1, noise1 } from './web/lib/util.js';
import fs from 'fs';
const out = [];
for (let i = 0; i < 5000; i++) {
  const t = i / 1000;
  const f = fbm1(t * 7, 91, 2), f2 = noise1(t * 23, 92);
  const on = (t % 5.0 > 1.2 && t % 5.0 < 3.9) ? 1 : 0.15;
  out.push(Math.max(0, on * (0.55 + 0.45 * f) * (f2 > -0.65 ? 1 : 0.08)));
}
fs.writeFileSync('out/lamp_curve.json', JSON.stringify(out));
console.log('ok', out.length);
