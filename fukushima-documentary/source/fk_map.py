# Fukushima evacuation map (chapter 6): the coast of Fukushima Prefecture around the plant, the evacuation rings
# growing 2 km -> 3 km -> 10 km -> 20 km, town names. 14 s, 1920x1080, 24 fps -> out/fk/FKMAP.mov
import subprocess, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H, FPS, DUR = 1920, 1080, 24, 14.0
IN = '/usr/share/fonts/opentype/inter/'
f_big = ImageFont.truetype(IN + 'InterDisplay-SemiBold.otf', 34); f_sm = ImageFont.truetype(IN + 'InterDisplay-Medium.otf', 26)
f_ring = ImageFont.truetype(IN + 'InterDisplay-SemiBold.otf', 30); f_cap = ImageFont.truetype(IN + 'InterDisplay-SemiBold.otf', 52); f_sub = ImageFont.truetype(IN + 'InterDisplay-Regular.otf', 30)
PX = 21.0                         # pixels per km at the end of the move
P = (1150, 560)                   # the plant, on the coast
def ll(lat, lon):                 # degrees -> km from the plant (east, north)
    return ((lon - 141.033) * 88.2, (lat - 37.421) * 111.0)
TOWNS = [('FUTABA', 37.449, 141.012), ('OKUMA', 37.404, 140.985), ('NAMIE', 37.495, 140.995), ('TOMIOKA', 37.334, 141.008),
         ('NARAHA', 37.283, 140.996), ('MINAMISOMA', 37.642, 140.957), ('KAWAUCHI', 37.337, 140.808), ('TAMURA', 37.443, 140.70)]
# coastline: x (km east of the plant) as a function of y (km north), gently wavy
def coast_x(y): return 0.6 + 0.9 * math.sin(y * 0.11) + 0.35 * math.sin(y * 0.37) + (-1.5 if y > 18 else 0) * min(1, (y - 18) / 10)
def frame(t):
    z = 1.35 - 0.35 * (1 - math.exp(-t / 5))          # slow zoom out
    s = PX * z
    cx, cy = P
    def xy(e, n): return (cx + e * s, cy - n * s)
    img = Image.new('RGB', (W, H), (14, 24, 38)); d = ImageDraw.Draw(img)
    # land west of the coast
    pts = [xy(coast_x(y), y) for y in np.linspace(-60, 60, 240)]
    land = [(-10, pts[0][1])] + pts + [(-10, pts[-1][1])]
    d.polygon(land, fill=(38, 44, 40))
    # faint grid and roads
    for k in range(-60, 61, 5):
        a = xy(-60, k); b = xy(10, k); d.line([a, b], fill=(44, 50, 46), width=1)
        a = xy(k, -60); b = xy(k, 60); d.line([a, b], fill=(44, 50, 46) if k < 1 else (20, 32, 48), width=1)
    rd = [xy(coast_x(y) - 2.5 - 0.6 * math.sin(y * 0.2), y) for y in np.linspace(-60, 60, 120)]
    d.line(rd, fill=(70, 74, 66), width=3)
    d.line(pts, fill=(120, 140, 150), width=2)
    # rings
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    RINGS = [(2, 1.5, '2 KM'), (3, 3.2, '3 KM'), (10, 5.4, '10 KM'), (20, 7.8, '20 KM')]
    for r, t0, lab in RINGS[::-1]:
        k = min(1, max(0, (t - t0) / 1.2)); k = 1 - (1 - k) ** 3
        if k <= 0: continue
        rr = r * s * k
        od.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=(200, 30, 30, int(34 * k)), outline=(240, 70, 60, int(230 * k)), width=4)
    img = Image.alpha_composite(img.convert('RGBA'), ov); d = ImageDraw.Draw(img)
    for r, t0, lab in RINGS:
        k = min(1, max(0, (t - t0 - 0.6) / 0.6))
        if r < 10 and t > (3.2 if r == 2 else 5.4) + 0.4: k = 0
        if k > 0: d.text((cx - r * s * 0.72 - 6, cy - r * s * 0.72 - 6), lab, font=f_ring, fill=(255, 120, 110, int(255 * k)), anchor='rb')
    for name, la, lo in TOWNS:
        e, n = ll(la, lo); x, y = xy(e, n)
        if -50 < x < W + 50 and -50 < y < H + 50:
            d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(225, 225, 215)); d.text((x - 12, y), name, font=f_sm, fill=(210, 210, 200), anchor='rm')
    # the plant
    pul = 0.5 + 0.5 * math.sin(t * 4)
    d.ellipse((cx - 11 - 6 * pul, cy - 11 - 6 * pul, cx + 11 + 6 * pul, cy + 11 + 6 * pul), outline=(255, 210, 60), width=3)
    d.ellipse((cx - 9, cy - 9, cx + 9, cy + 9), fill=(255, 200, 40))
    d.text((cx + 26, cy), 'FUKUSHIMA DAIICHI', font=f_big, fill=(255, 220, 120), anchor='lm')
    d.text((W - 260, 200), 'PACIFIC OCEAN', font=f_sm, fill=(90, 120, 150), anchor='mm')
    # compass and scale bar
    d.text((150, 140), 'N', font=f_big, fill=(200, 200, 190), anchor='mm'); d.polygon([(150, 160), (140, 190), (160, 190)], fill=(200, 200, 190))
    d.line([(110, 980), (110 + 10 * s, 980)], fill=(200, 200, 190), width=4); d.text((110 + 5 * s, 1000), '10 KM', font=f_sm, fill=(200, 200, 190), anchor='ma')
    # caption: dates
    cap = '11 MARCH: 2 KM, THEN 3 KM' if t < 5.4 else '12 MARCH: 10 KM, THEN 20 KM'
    k = min(1, max(0, (t - 1.0) / 0.6))
    if k > 0:
        d.text((W // 2, 60), 'THE EVACUATION ZONE', font=f_cap, fill=(255, 250, 242, int(255 * k)), anchor='ma')
        d.text((W // 2, 128), cap, font=f_sub, fill=(255, 250, 242, int(230 * k)), anchor='ma')
    a = min(1, t / 0.6, (DUR - t) / 0.6)
    return (np.asarray(img.convert('RGB'), dtype=np.float32) * max(0, a)).astype(np.uint8)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                      '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv444p', 'out/fk/FKMAP.mov'], stdin=subprocess.PIPE)
for f in range(int(DUR * FPS)): p.stdin.write(frame(f / FPS).tobytes())
p.stdin.close(); p.wait()
Image.fromarray(frame(10.0)).save('out/fk/FKMAP_check.jpg', quality=85)
