# Generate the Scene 01 Hindi line with Kokoro (hm_omega), tighten the "..." pause, trim edges.
import sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
models, out = sys.argv[1], sys.argv[2]
k = Kokoro(models + "/kokoro-v1.0.onnx", models + "/voices-v1.0.bin")
text = "यह एक ऐसा शहर है... जहाँ चालीस साल से कोई नहीं रहता।"
a, sr = k.create(text, voice="hm_omega", speed=0.97, lang="hi")
a = a.astype(np.float64)
w = int(0.01 * sr)
env = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, len(a) - w, w)])
voiced = env > 0.012
idx = np.where(voiced)[0]
start, end = idx[0], idx[-1] + 1
# longest silent run inside the speech = the "..." pause
best, cur, best_rng = 0, 0, None
for i in range(start, end):
    if not voiced[i]:
        cur += 1
        if cur > best:
            best, best_rng = cur, (i - cur + 1, i + 1)
    else:
        cur = 0
print("speech %.2fs, pause %.2fs" % ((end - start) * w / sr, best * w / sr))
keep_pause = int(0.36 * sr)
p0, p1 = best_rng[0] * w, best_rng[1] * w
pre = a[max(0, start * w - int(0.03 * sr)):p0]
post = a[p1:min(len(a), end * w + int(0.12 * sr))]
mid = np.zeros(keep_pause)
fade = int(0.015 * sr)
pre[-fade:] *= np.linspace(1, 0, fade); post[:fade] *= np.linspace(0, 1, fade)
y = np.concatenate([pre, mid, post])
y[-int(0.05 * sr):] *= np.linspace(1, 0, int(0.05 * sr))
sf.write(out, y.astype(np.float32), sr)
print("final %.2fs" % (len(y) / sr))
