# Soft dark band behind the lower caption, used by assemble8.sh over the bright core map (shot W3).
# Writes out/part8/capband.png (1920x1080 RGBA).
import numpy as np
from PIL import Image
W, H = 1920, 1080
y = np.arange(H) / H; x = np.arange(W) / W
a = np.exp(-((y - 0.795) / 0.07) ** 2)[:, None] * (0.6 + 0.35 * np.exp(-((x - 0.5) / 0.3) ** 2))[None, :]
img = np.zeros((H, W, 4), np.uint8); img[..., 3] = (np.clip(a, 0, 0.92) * 255).astype(np.uint8)
Image.fromarray(img, 'RGBA').save('out/part8/capband.png')
