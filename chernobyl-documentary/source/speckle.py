# Radiation "snow" for the roof shot: the real 1986 film of the roof is pocked with white flecks
# and short streaks where particles hit the emulsion. RGBA PNG sequence, 1920x1080.
import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H, N = 1920, 1080, 312
out = 'out/part3/speckle'; os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(1986)
for f in range(N):
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
    for _ in range(rng.integers(25, 60)):
        x, y = rng.uniform(0, W), rng.uniform(0, H); r = rng.choice([0.8, 1.2, 1.8, 2.6], p=[0.45, 0.3, 0.18, 0.07])
        d.ellipse([x - r, y - r, x + r, y + r], fill=int(rng.uniform(150, 255)))
    for _ in range(rng.integers(0, 4)):
        x, y = rng.uniform(0, W), rng.uniform(0, H); a = rng.uniform(0, np.pi); L = rng.uniform(6, 26)
        d.line([x, y, x + np.cos(a) * L, y + np.sin(a) * L], fill=int(rng.uniform(140, 230)), width=1)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    A = np.asarray(im)
    rgba = np.zeros((H, W, 4), np.uint8); rgba[..., :3] = 255; rgba[..., 3] = A
    Image.fromarray(rgba, 'RGBA').save(f'{out}/{f:04d}.png', compress_level=1)
print('ok')
