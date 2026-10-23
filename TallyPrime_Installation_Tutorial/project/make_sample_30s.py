#!/usr/bin/env python3
"""30-second animated UI sample for the TallyPrime install tutorial.

Wireframe-style illustration (labelled as such) — it does NOT reproduce the
real TallyPrime interface. Frames are rendered with PIL and piped to ffmpeg.
Usage: python3 make_sample_30s.py <output.mp4>
"""
import math, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else "sample_30s.mp4"
W, H, FPS, DUR = 1920, 1080, 30, 30.0

FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
_fc = {}
def f(p, s):
    if (p, s) not in _fc: _fc[(p, s)] = ImageFont.truetype(p, s)
    return _fc[(p, s)]

TXT, MUT = (255, 255, 255), (176, 198, 224)
GOLD, TEAL, NAVY = (245, 179, 1), (48, 198, 198), (9, 27, 54)
WIN, WIN_BAR, LINE = (244, 247, 251), (225, 231, 240), (205, 214, 226)
SKEL, INK, BLUE = (214, 221, 232), (40, 52, 70), (0, 103, 192)

# (start, end, step label, caption) for each scene
SCENES = [
    (0.0, 3.0, None, None),
    (3.0, 8.0, "STEP 1", "Sirf official site se download: tallysolutions.com"),
    (8.0, 12.5, "STEP 2", "Downloads folder kholiye -> setup file par double-click"),
    (12.5, 16.5, "STEP 3", "Admin permission maange to 'Yes' dabaiye"),
    (16.5, 23.0, "STEP 4", "Install New -> Path (default) -> Install"),
    (23.0, 27.0, "STEP 5", "Start TallyPrime -> Educational Mode se practice"),
    (27.0, 30.0, None, None),
]
# click times (seconds) — reused for the click sounds
CLICKS = [6.5, 10.75, 10.95, 15.3, 18.0, 20.0]

def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def prog(t, a, b): return ease((t - a) / (b - a))
def lerp(a, b, k): return a + (b - a) * k

def make_bg():
    top, bot = (9, 27, 54), (14, 46, 84)
    img = Image.new("RGB", (W, H)); d = ImageDraw.Draw(img)
    for y in range(H):
        k = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(lerp(top[i], bot[i], k)) for i in range(3)))
    return img
BG = make_bg()

def window(d, box, title):
    x0, y0, x1, y1 = box
    d.rounded_rectangle([x0 + 10, y0 + 14, x1 + 10, y1 + 14], 18, fill=(5, 15, 32))  # shadow
    d.rounded_rectangle(box, 18, fill=WIN)
    d.rounded_rectangle([x0, y0, x1, y0 + 64], 18, fill=WIN_BAR)
    d.rectangle([x0, y0 + 40, x1, y0 + 64], fill=WIN_BAR)
    for i, c in enumerate([(237, 106, 94), (245, 191, 79), (98, 197, 84)]):
        d.ellipse([x0 + 24 + i * 34, y0 + 22, x0 + 44 + i * 34, y0 + 42], fill=c)
    d.text((x0 + 140, y0 + 18), title, font=f(FB, 26), fill=INK)

def skel(d, x, y, w, h=18):
    d.rounded_rectangle([x, y, x + w, y + h], h // 2, fill=SKEL)

def button(d, box, label, color, pressed=False, txt=TXT):
    x0, y0, x1, y1 = box
    if pressed:
        x0 += 4; y0 += 4; x1 -= 4; y1 -= 4
    d.rounded_rectangle([x0, y0, x1, y1], 14, fill=color)
    fnt = f(FB, 32)
    tw = d.textlength(label, font=fnt)
    d.text(((x0 + x1) / 2 - tw / 2, (y0 + y1) / 2 - 20), label, font=fnt, fill=txt)

def cursor(d, x, y):
    pts = [(0, 0), (0, 46), (12, 35), (21, 56), (30, 52), (21, 32), (37, 32)]
    d.polygon([(x + px, y + py) for px, py in pts], fill=(255, 255, 255), outline=(0, 0, 0))

def ripple(d, x, y, t, tc):
    k = (t - tc) / 0.45
    if 0 <= k <= 1:
        r = 14 + 46 * k
        a = int(255 * (1 - k))
        d.ellipse([x - r, y - r, x + r, y + r], outline=(GOLD[0], GOLD[1], GOLD[2]), width=max(1, int(6 * (1 - k)) + 1))
        _ = a

def move(t, pts):
    """pts: list of (time, x, y); returns eased position."""
    if t <= pts[0][0]: return pts[0][1], pts[0][2]
    for (t0, x0, y0), (t1, x1, y1) in zip(pts, pts[1:]):
        if t <= t1:
            k = ease((t - t0) / (t1 - t0))
            return lerp(x0, x1, k), lerp(y0, y1, k)
    return pts[-1][1], pts[-1][2]

def chrome(d, t, step, caption, s0):
    d.text((80, 50), "TALLYPRIME  \u2022  INSTALL SAMPLE", font=f(FB, 28), fill=TEAL)
    lab = "ILLUSTRATION \u2022 actual screens may differ"
    tw = d.textlength(lab, font=f(FB, 22))
    d.rounded_rectangle([W - 80 - tw - 40, 42, W - 80, 88], 23, outline=GOLD, width=2)
    d.text((W - 80 - tw - 20, 52), lab, font=f(FB, 22), fill=GOLD)
    if caption:
        k = prog(t, s0 + 0.15, s0 + 0.6)
        y = int(lerp(1010, 930, k))
        cap_f = f(FB, 36)
        sw = d.textlength(step, font=f(FB, 30))
        cw = d.textlength(caption, font=cap_f)
        bw = sw + cw + 110
        x0 = (W - bw) / 2
        d.rounded_rectangle([x0, y, x0 + bw, y + 84], 42, fill=(6, 18, 36), outline=(30, 74, 130), width=2)
        d.rounded_rectangle([x0 + 14, y + 14, x0 + sw + 54, y + 70], 28, fill=GOLD)
        d.text((x0 + 34, y + 24), step, font=f(FB, 30), fill=NAVY)
        d.text((x0 + sw + 80, y + 21), caption, font=cap_f, fill=TXT)
    # timeline bar
    d.rectangle([0, H - 8, W, H], fill=(20, 45, 80))
    d.rectangle([0, H - 8, int(W * t / DUR), H], fill=TEAL)

def scene_title(d, t):
    k1, k2, k3 = prog(t, 0.1, 0.8), prog(t, 0.4, 1.1), prog(t, 0.8, 1.5)
    d.text((W / 2 - d.textlength("TallyPrime", font=f(FB, 130)) / 2, lerp(380, 330, k1)),
           "TallyPrime", font=f(FB, 130), fill=tuple(int(c * k1 + NAVY[i] * (1 - k1)) for i, c in enumerate(GOLD)))
    s = "Install Kaise Kare?"
    d.text((W / 2 - d.textlength(s, font=f(FB, 84)) / 2, lerp(530, 490, k2)), s, font=f(FB, 84),
           fill=tuple(int(255 * k2 + NAVY[i] * (1 - k2)) for i in range(3)))
    if k3 > 0:
        p = "30 SECOND SAMPLE  \u2022  STEP-BY-STEP"
        pw = d.textlength(p, font=f(FB, 32))
        d.rounded_rectangle([W / 2 - pw / 2 - 34, 640, W / 2 + pw / 2 + 34, 706], 33, outline=TEAL, width=3)
        d.text((W / 2 - pw / 2, 654), p, font=f(FB, 32), fill=TEAL)

def scene_browser(d, t):
    box = (260, 150, 1660, 830)
    window(d, box, "Browser")
    # address bar with padlock + typed URL
    d.rounded_rectangle([300, 230, 1620, 290], 30, fill=(255, 255, 255), outline=LINE, width=2)
    d.rounded_rectangle([332, 252, 352, 272], 4, fill=(46, 160, 67))
    d.arc([334, 238, 350, 260], 180, 360, fill=(46, 160, 67), width=4)
    url = "https://tallysolutions.com/download"
    n = int(len(url) * prog(t, 3.5, 5.0))
    d.text((372, 242), url[:n], font=f(FM, 30), fill=INK)
    if n < len(url) and int(t * 4) % 2 == 0:
        x = 372 + d.textlength(url[:n], font=f(FM, 30))
        d.line([(x + 2, 244), (x + 2, 280)], fill=INK, width=3)
    # skeleton page (deliberately schematic)
    skel(d, 340, 350, 620, 34); skel(d, 340, 420, 900); skel(d, 340, 460, 820); skel(d, 340, 500, 860)
    pressed = 6.5 <= t <= 6.68
    button(d, (340, 580, 760, 670), "Download", GOLD, pressed, NAVY)
    if t >= 6.6:
        k = prog(t, 6.6, 7.8)
        d.rounded_rectangle([1130, 700, 1620, 800], 16, fill=(255, 255, 255), outline=LINE, width=2)
        d.text((1160, 714), "Downloading setup..." if k < 1 else "Download complete \u2713", font=f(FB, 24), fill=INK)
        d.rounded_rectangle([1160, 760, 1590, 776], 8, fill=SKEL)
        d.rounded_rectangle([1160, 760, 1160 + int(430 * k), 776], 8, fill=TEAL)
    cx, cy = move(t, [(3.0, 1400, 760), (5.0, 1400, 760), (6.3, 560, 630)])
    ripple(d, 560, 630, t, 6.5)
    cursor(d, cx, cy)

def scene_explorer(d, t):
    box = (300, 170, 1620, 820)
    window(d, box, "File Explorer \u2014 Downloads")
    d.rectangle([300, 234, 620, 820], fill=(234, 239, 246))
    for i, lab in enumerate(["Desktop", "Downloads", "Documents", "Pictures"]):
        y = 280 + i * 70
        if lab == "Downloads":
            d.rounded_rectangle([320, y - 12, 600, y + 46], 10, fill=(207, 226, 247))
        d.text((350, y), lab, font=f(FR if lab != "Downloads" else FB, 28), fill=INK)
    # file icon
    hl = t >= 10.7
    if hl:
        d.rounded_rectangle([760, 330, 1060, 640], 14, fill=(207, 226, 247))
    d.rounded_rectangle([840, 360, 980, 530], 10, fill=(255, 255, 255), outline=(150, 165, 190), width=3)
    d.polygon([(940, 360), (980, 400), (940, 400)], fill=(200, 210, 225))
    d.rounded_rectangle([862, 450, 958, 500], 8, fill=BLUE)
    d.text((880, 455), "EXE", font=f(FB, 30), fill=TXT)
    for i, s in enumerate(["TallyPrime", "Setup"]):
        tw = d.textlength(s, font=f(FB, 28))
        d.text((910 - tw / 2, 550 + i * 38), s, font=f(FB, 28), fill=INK)
    if t >= 11.4:
        k = prog(t, 11.4, 12.0)
        d.text((700, 720), "Opening setup...", font=f(FB, 28), fill=tuple(int(lerp(244, 40, k)) for _ in range(3)))
    cx, cy = move(t, [(8.0, 1450, 760), (8.8, 1450, 760), (10.5, 900, 470)])
    ripple(d, 900, 470, t, 10.75); ripple(d, 900, 470, t, 10.95)
    cursor(d, cx, cy)

def scene_uac(d, t, img):
    overlay = Image.new("RGB", (W, H), (0, 0, 0))
    img.paste(Image.blend(img, overlay, 0.45))
    d = ImageDraw.Draw(img)
    k = prog(t, 12.6, 13.1)
    y0 = int(lerp(300, 250, k))
    box = (510, y0, 1410, y0 + 520)
    d.rounded_rectangle([box[0] + 10, box[1] + 14, box[2] + 10, box[3] + 14], 12, fill=(5, 15, 32))
    d.rounded_rectangle(box, 12, fill=(255, 255, 255))
    d.rounded_rectangle([box[0], box[1], box[2], box[1] + 80], 12, fill=BLUE)
    d.rectangle([box[0], box[1] + 60, box[2], box[1] + 80], fill=BLUE)
    d.text((box[0] + 40, box[1] + 22), "User Account Control", font=f(FB, 30), fill=TXT)
    d.text((box[0] + 40, box[1] + 120), "Do you want to allow this app to make", font=f(FB, 32), fill=INK)
    d.text((box[0] + 40, box[1] + 165), "changes to your device?", font=f(FB, 32), fill=INK)
    d.text((box[0] + 40, box[1] + 240), "Publisher: (verify on your PC)", font=f(FR, 26), fill=(100, 112, 130))
    pressed = 15.3 <= t <= 15.48
    button(d, (box[0] + 40, box[1] + 390, box[0] + 420, box[1] + 470), "Yes", BLUE, pressed)
    button(d, (box[0] + 480, box[1] + 390, box[0] + 860, box[1] + 470), "No", (226, 231, 238), False, INK)
    bx, by = box[0] + 230, box[1] + 430
    cx, cy = move(t, [(12.5, 1300, 900), (13.4, 1300, 900), (15.1, bx, by)])
    ripple(d, bx, by, t, 15.3)
    cursor(d, cx, cy)
    return d

def scene_setup(d, t):
    box = (360, 150, 1560, 850)
    window(d, box, "Setup Wizard (illustration)")
    d.text((420, 250), "Choose an option", font=f(FB, 36), fill=INK)
    opts = ["Install New", "Other options (existing users)"]
    sel = t >= 18.0
    for i, o in enumerate(opts):
        y = 320 + i * 80
        active = sel and i == 0
        d.rounded_rectangle([420, y, 1060, y + 62], 12, fill=(207, 226, 247) if active else (255, 255, 255),
                            outline=BLUE if active else LINE, width=3 if active else 2)
        d.ellipse([440, y + 17, 468, y + 45], outline=INK, width=3)
        if active: d.ellipse([447, y + 24, 461, y + 38], fill=BLUE)
        d.text((490, y + 14), o, font=f(FB if i == 0 else FR, 28), fill=INK if i == 0 else (120, 130, 148))
    d.text((420, 510), "Application Path", font=f(FB, 28), fill=INK)
    d.rounded_rectangle([420, 550, 1500, 610], 10, fill=(255, 255, 255), outline=LINE, width=2)
    d.text((440, 562), "C:\\Program Files\\TallyPrime", font=f(FM, 30), fill=INK)
    d.text((440, 620), "(default \u2014 zyada tar ke liye theek hai)", font=f(FR, 24), fill=(110, 122, 140))
    pressed = 20.0 <= t <= 20.18
    if t < 20.2:
        button(d, (1180, 700, 1500, 790), "Install", BLUE, pressed)
    else:
        k = prog(t, 20.2, 22.6)
        d.text((420, 690), f"Installing...  {int(k * 100)}%" if k < 1 else "Installed \u2713", font=f(FB, 30), fill=INK)
        d.rounded_rectangle([420, 745, 1500, 775], 15, fill=SKEL)
        d.rounded_rectangle([420, 745, 420 + int(1080 * k), 775], 15, fill=TEAL)
    cx, cy = move(t, [(16.5, 1400, 880), (17.0, 1400, 880), (17.8, 560, 351), (18.6, 560, 351), (19.8, 1340, 745), (21.0, 1340, 745), (22.6, 1700, 900)])
    ripple(d, 560, 351, t, 18.0); ripple(d, 1340, 745, t, 20.0)
    cursor(d, cx, cy)

def scene_done(d, t):
    cx, cy, r = W / 2, 360, 120
    k = prog(t, 23.1, 23.8)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=TEAL, width=10)
    if k > 0:
        a, b, c = (cx - 55, cy + 5), (cx - 15, cy + 45), (cx + 60, cy - 45)
        if k < 0.5:
            m = k / 0.5; d.line([a, (lerp(a[0], b[0], m), lerp(a[1], b[1], m))], fill=GOLD, width=16)
        else:
            m = (k - 0.5) / 0.5
            d.line([a, b], fill=GOLD, width=16)
            d.line([b, (lerp(b[0], c[0], m), lerp(b[1], c[1], m))], fill=GOLD, width=16)
    s = "Installation Complete!"
    k2 = prog(t, 23.6, 24.2)
    d.text((W / 2 - d.textlength(s, font=f(FB, 76)) / 2, lerp(560, 530, k2)), s, font=f(FB, 76),
           fill=tuple(int(255 * k2 + NAVY[i] * (1 - k2)) for i in range(3)))
    items = ["Start TallyPrime  ->  Gateway of Tally", "Educational Mode: free learning (date limits)", "Install \u2260 License activation"]
    for i, it in enumerate(items):
        k3 = prog(t, 24.3 + i * 0.5, 24.8 + i * 0.5)
        if k3 <= 0: continue
        y = 660 + i * 62
        x = 560 + (1 - k3) * 40
        d.text((x, y), "\u2713", font=f(FB, 38), fill=TEAL)
        d.text((x + 56, y), it, font=f(FR, 38), fill=tuple(int(255 * k3 + NAVY[j] * (1 - k3)) for j in range(3)))

def scene_outro(d, t):
    k = prog(t, 27.1, 27.7)
    s1, s2 = "Full Tutorial Jald Aa Raha Hai", "Like  \u2022  Share  \u2022  Subscribe"
    col = tuple(int(255 * k + NAVY[i] * (1 - k)) for i in range(3))
    d.text((W / 2 - d.textlength(s1, font=f(FB, 80)) / 2, lerp(420, 390, k)), s1, font=f(FB, 80), fill=col)
    k2 = prog(t, 27.6, 28.2)
    if k2 > 0:
        sw = d.textlength(s2, font=f(FB, 48))
        d.rounded_rectangle([W / 2 - sw / 2 - 50, 540, W / 2 + sw / 2 + 50, 630], 45, fill=GOLD)
        d.text((W / 2 - sw / 2, 558), s2, font=f(FB, 48), fill=NAVY)
    s3 = "Download only from tallysolutions.com  \u2022  Independent tutorial, not endorsed by Tally"
    d.text((W / 2 - d.textlength(s3, font=f(FR, 28)) / 2, 720), s3, font=f(FR, 28), fill=MUT)

def frame(t):
    img = BG.copy(); d = ImageDraw.Draw(img)
    idx = next(i for i, s in enumerate(SCENES) if t < s[1] or i == len(SCENES) - 1)
    s0, s1, step, cap = SCENES[idx]
    if idx == 0: scene_title(d, t)
    elif idx == 1: scene_browser(d, t)
    elif idx == 2: scene_explorer(d, t)
    elif idx == 3:
        scene_explorer(d, 12.49)  # keep explorer behind the prompt
        d = scene_uac(d, t, img)
    elif idx == 4: scene_setup(d, t)
    elif idx == 5: scene_done(d, t)
    else: scene_outro(d, t)
    chrome(d, t, step, cap, s0)
    # short dip at scene boundaries (not before the UAC overlay, which should pop over explorer)
    fade = min(t - s0, s1 - t)
    if fade < 0.25 and idx != 3 and not (idx == 2 and s1 - t < 0.25):
        img = Image.blend(Image.new("RGB", (W, H), (5, 14, 30)), img, clamp(fade / 0.25))
    return img

def audio_expr():
    pad = "0.05*(sin(2*PI*261.63*t)+0.8*sin(2*PI*329.63*t)+0.6*sin(2*PI*392.0*t)+0.4*sin(2*PI*130.81*t))*(0.75+0.25*sin(2*PI*0.25*t))"
    env = "min(1,t/1.5)*min(1,(30-t)/2)"
    clicks = "+".join(f"0.35*gte(t,{c})*exp(-max(t-{c},0)*90)*sin(2*PI*1500*t)" for c in CLICKS)
    return f"({pad})*{env}+{clicks}"

def main():
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-f", "lavfi", "-i", f"aevalsrc='{audio_expr()}':s=44100:d={DUR}",
           "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(int(DUR * FPS)):
        p.stdin.write(frame(i / FPS).tobytes())
    p.stdin.close()
    sys.exit(p.wait())

if __name__ == "__main__":
    main()
