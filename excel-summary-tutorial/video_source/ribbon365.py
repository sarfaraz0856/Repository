# Microsoft 365-style window chrome (title bar, ribbon, formula bar frame, tabs bar, status bar).
from PIL import Image, ImageDraw, ImageFont
FD = "/usr/share/fonts/truetype/"
def F(n, s): return ImageFont.truetype(FD + n, s)
CAR, CARB, SANS, SANSB = "crosextra/Carlito-Regular.ttf", "crosextra/Carlito-Bold.ttf", "dejavu/DejaVuSans.ttf", "dejavu/DejaVuSans-Bold.ttf"
W = 1920
TITLE = (16, 124, 65); XL = (16, 124, 65); BG = (243, 242, 241); TXT = (36, 36, 36); MUTE = (97, 97, 97); LINE = (225, 223, 221)
f15, f16, f17b, f13 = F(CAR, 16), F(CAR, 17), F(CARB, 17), F(CAR, 14)
sym14, sym16, sym18 = F(SANS, 13), F(SANS, 15), F(SANS, 18)
BTN = {}
RIB_H = 192

def chev(d, x, y, c=MUTE): d.line([(x - 4, y - 2), (x, y + 2), (x + 4, y - 2)], fill=c, width=2)

def lines_icon(d, x, y, kind):
    for i, w in enumerate([18, 12, 18, 12]):
        if kind == "left": x0 = x
        elif kind == "center": x0 = x + (18 - w) / 2
        elif kind == "right": x0 = x + 18 - w
        else: x0 = x; w = 18
        d.line([(x0, y + i * 4), (x0 + w, y + i * 4)], fill=TXT, width=2)

def small(d, x, y, label, icon=None, drop=False, w=None):
    """small ribbon button: optional icon fn + label; returns width"""
    tw = f15.getlength(label) if label else 0
    ww = w or (8 + (22 if icon else 0) + tw + (16 if drop else 0) + 6)
    if icon: icon(d, x + 6, y)
    if label: d.text((x + 8 + (22 if icon else 0), y), label, font=f15, fill=TXT, anchor="lm")
    if drop: chev(d, x + ww - 10, y)
    return ww

def chrome():
    img = Image.new("RGB", (W, RIB_H), BG); d = ImageDraw.Draw(img)
    # ---- title bar
    d.rectangle([0, 0, W, 42], fill=TITLE)
    d.text((18, 21), "AutoSave", font=f16, fill="white", anchor="lm")
    d.rounded_rectangle([92, 12, 134, 30], radius=9, outline="white", width=2); d.ellipse([97, 16, 107, 26], fill="white")
    d.text((140, 21), "Off", font=f15, fill="white", anchor="lm")
    d.rectangle([178, 13, 194, 29], outline="white", width=2); d.rectangle([182, 13, 190, 19], fill="white")
    d.text((214, 21), "↶", font=sym18, fill="white", anchor="mm"); d.text((244, 21), "↷", font=sym18, fill=(170, 210, 185), anchor="mm")
    d.text((272, 21), "∨", font=sym14, fill="white", anchor="mm")
    d.text((310, 21), "Raw_Data_to_Summary  •  Saved to this PC", font=f16, fill="white", anchor="lm")
    d.rounded_rectangle([760, 7, 1250, 35], radius=6, fill=(56, 150, 98))
    d.ellipse([776, 14, 788, 26], outline="white", width=2); d.line([(787, 25), (793, 31)], fill="white", width=2)
    d.text((802, 21), "Search (Alt+Q)", font=f16, fill=(230, 245, 236), anchor="lm")
    d.ellipse([1690, 8, 1716, 34], fill=(220, 236, 226)); d.ellipse([1698, 12, 1708, 22], fill=TITLE); d.pieslice([1694, 22, 1712, 40], 180, 360, fill=TITLE)
    for i, g in enumerate(["—", "☐", "✕"]):
        d.text((1770 + i * 56, 21), g, font=sym16, fill="white", anchor="mm")
    # ---- tabs row
    x = 16
    for t in ["File", "Home", "Insert", "Draw", "Page Layout", "Formulas", "Data", "Review", "View", "Automate", "Help"]:
        w = f16.getlength(t)
        d.text((x, 60), t, font=f17b if t == "Home" else f16, fill=XL if t == "Home" else TXT, anchor="lm")
        if t == "Home": d.rounded_rectangle([x, 72, x + w, 75], radius=2, fill=XL)
        x += w + 30
    d.rounded_rectangle([1640, 47, 1752, 73], radius=4, outline=(138, 136, 134), fill="white")
    d.text((1696, 60), "Comments", font=f15, fill=TXT, anchor="mm")
    d.rounded_rectangle([1766, 47, 1900, 73], radius=4, fill=XL)
    d.text((1833, 60), "Share", font=f17b, fill="white", anchor="mm")
    # ---- ribbon card
    d.rounded_rectangle([8, 80, W - 8, 186], radius=8, fill="white", outline=LINE)
    gl = 172; r1, r2, r3 = 98, 124, 150
    x = 22
    def label(x0, x1, t):
        d.text(((x0 + x1) / 2, gl + 3), t, font=f13, fill=MUTE, anchor="mm")
        d.line([(x1 + 8, 90), (x1 + 8, 178)], fill=LINE)
    # Clipboard
    x0 = x
    d.rounded_rectangle([x + 8, 90, x + 34, 122], radius=3, fill=(214, 179, 120)); d.rectangle([x + 14, 86, x + 28, 94], fill=(120, 120, 120))
    d.rectangle([x + 18, 100, x + 38, 128], fill="white", outline=(120, 120, 120))
    for i in range(3): d.line([(x + 21, 107 + i * 6), (x + 35, 107 + i * 6)], fill=(160, 160, 160))
    d.text((x + 22, 142), "Paste", font=f15, fill=TXT, anchor="mm"); chev(d, x + 22, 155)
    d.text((x + 64, r1), "✂", font=sym16, fill=TXT, anchor="mm")
    d.rectangle([x + 57, r2 - 6, x + 67, r2 + 5], outline=TXT); d.rectangle([x + 61, r2 - 9, x + 71, r2 + 2], outline=TXT, fill="white")
    d.polygon([(x + 58, r3 + 4), (x + 66, r3 - 6), (x + 70, r3 - 3), (x + 62, r3 + 6)], fill=(200, 140, 40))
    x += 82; label(x0, x, "Clipboard"); x += 18
    # Font
    x0 = x
    d.rounded_rectangle([x, r1 - 12, x + 150, r1 + 12], radius=3, outline=(190, 190, 190)); d.text((x + 8, r1), "Aptos Narrow", font=f15, fill=TXT, anchor="lm"); chev(d, x + 138, r1)
    d.rounded_rectangle([x + 156, r1 - 12, x + 206, r1 + 12], radius=3, outline=(190, 190, 190)); d.text((x + 164, r1), "11", font=f15, fill=TXT, anchor="lm"); chev(d, x + 194, r1)
    d.text((x + 226, r1), "A", font=f17b, fill=TXT, anchor="mm"); d.text((x + 234, r1 - 6), "^", font=f13, fill=TXT, anchor="mm")
    d.text((x + 254, r1), "A", font=f15, fill=TXT, anchor="mm"); d.text((x + 262, r1 - 4), "ˇ", font=f13, fill=TXT, anchor="mm")
    bx = x
    for i, (g, fnt) in enumerate([("B", F(CARB, 19)), ("I", F("crosextra/Carlito-Italic.ttf", 19)), ("U", f16)]):
        cx = bx + 12 + i * 32; d.text((cx, r2 + 2), g, font=fnt, fill=TXT, anchor="mm")
        if g == "U": d.line([(cx - 6, r2 + 11), (cx + 6, r2 + 11)], fill=TXT)
        BTN[{"B": "bold", "I": "italic", "U": "underline"}[g]] = (cx, r2 + 2 + 0)
    cx = bx + 112; d.rectangle([cx - 8, r2 - 7, cx + 8, r2 + 9], outline=TXT); d.line([(cx, r2 - 7), (cx, r2 + 9)], fill=(170, 170, 170)); d.line([(cx - 8, r2 + 1), (cx + 8, r2 + 1)], fill=(170, 170, 170)); chev(d, cx + 18, r2)
    cx = bx + 160; d.polygon([(cx - 7, r2 - 2), (cx, r2 - 9), (cx + 7, r2 - 2), (cx, r2 + 5)], outline=TXT); d.rectangle([cx - 9, r2 + 8, cx + 9, r2 + 11], fill=(255, 230, 0)); chev(d, cx + 18, r2)
    cx = bx + 208; d.text((cx, r2), "A", font=f17b, fill=TXT, anchor="mm"); d.rectangle([cx - 9, r2 + 8, cx + 9, r2 + 11], fill=(220, 40, 40)); chev(d, cx + 18, r2)
    x += 270; label(x0, x, "Font"); x += 18
    # Alignment
    x0 = x
    for i, k in enumerate(["top", "mid", "bot"]):
        cx = x + 6 + i * 30; d.line([(cx, r1 - 8 + (0 if k == "top" else 8 if k == "mid" else 16)), (cx + 18, r1 - 8 + (0 if k == "top" else 8 if k == "mid" else 16))], fill=TXT, width=2)
        d.rectangle([cx + 5, r1 - 6 + (0 if k == "top" else 3 if k == "mid" else 6), cx + 13, r1 + 2 + (0 if k == "top" else 3 if k == "mid" else 6)], fill=(120, 120, 120))
    d.text((x + 106, r1), "ab↗", font=sym14, fill=TXT, anchor="mm"); chev(d, x + 128, r1)
    small(d, x + 140, r1, "Wrap Text", icon=lambda d_, a, b: d_.text((a + 8, b), "↵", font=sym14, fill=TXT, anchor="mm"))
    for i, k in enumerate(["left", "center", "right"]): lines_icon(d, x + 6 + i * 30, r2 - 6, k)
    d.text((x + 104, r2), "⇤", font=sym14, fill=TXT, anchor="mm"); d.text((x + 126, r2), "⇥", font=sym14, fill=TXT, anchor="mm")
    small(d, x + 140, r2, "Merge & Center", icon=lambda d_, a, b: d_.rectangle([a, b - 7, a + 16, b + 7], outline=TXT), drop=True)
    x += 310; label(x0, x, "Alignment"); x += 18
    # Number
    x0 = x
    d.rounded_rectangle([x, r1 - 12, x + 150, r1 + 12], radius=3, outline=(190, 190, 190)); d.text((x + 8, r1), "General", font=f15, fill=TXT, anchor="lm"); chev(d, x + 138, r1)
    items = [("$", 28), ("%", 26), (",", 26), (".0←", 34), ("→.00", 36)]
    cx = x + 4
    for g, w in items:
        d.text((cx + w / 2, r2), g, font=f17b if g in "$%," else f13, fill=TXT, anchor="mm")
        if g == ",": BTN["comma"] = (cx + w / 2, r2)
        if g == "$": chev(d, cx + w + 2, r2)
        cx += w + (10 if g == "$" else 2)
    x += 160; label(x0, x, "Number"); x += 18
    # Styles
    x0 = x
    def cf(d_, a, b):
        d_.rectangle([a, b - 8, a + 16, b + 8], outline=(150, 150, 150))
        for i, (c, w) in enumerate([((0, 120, 215), 12), ((220, 50, 50), 7), ((0, 160, 80), 10)]): d_.rectangle([a + 2, b - 6 + i * 5, a + 2 + w, b - 3 + i * 5], fill=c)
    def ft(d_, a, b):
        d_.rectangle([a, b - 8, a + 16, b + 8], fill=(222, 235, 247), outline=(68, 114, 196)); d_.rectangle([a, b - 8, a + 16, b - 3], fill=(68, 114, 196))
    def cs(d_, a, b):
        for i, c in enumerate([(198, 239, 206), (255, 235, 156), (255, 199, 206), (189, 215, 238)]): d_.rectangle([a + (i % 2) * 9, b - 8 + (i // 2) * 9, a + 7 + (i % 2) * 9, b - 1 + (i // 2) * 9], fill=c)
    for (lab, ic, yy, key) in [("Conditional Formatting", cf, r1, "cond"), ("Format as Table", ft, r2, "fat"), ("Cell Styles", cs, r3, "cellstyles")]:
        w = small(d, x, yy, lab, icon=ic, drop=True); BTN[key] = (x + w / 2, yy)
    x += 210; label(x0, x, "Styles"); x += 18
    # Cells
    x0 = x
    def ins(d_, a, b): d_.rectangle([a, b - 7, a + 16, b + 7], outline=TXT); d_.text((a + 8, b), "+", font=sym14, fill=(16, 124, 65), anchor="mm")
    def dele(d_, a, b): d_.rectangle([a, b - 7, a + 16, b + 7], outline=TXT); d_.text((a + 8, b), "×", font=sym14, fill=(200, 40, 40), anchor="mm")
    def fmt(d_, a, b): d_.rectangle([a, b - 7, a + 16, b + 7], outline=TXT); d_.line([(a, b), (a + 16, b)], fill=TXT); d_.line([(a + 8, b - 7), (a + 8, b + 7)], fill=TXT)
    for (lab, ic, yy, key) in [("Insert", ins, r1, "insert"), ("Delete", dele, r2, "delete"), ("Format", fmt, r3, "format")]:
        w = small(d, x, yy, lab, icon=ic, drop=True); BTN[key] = (x + w / 2, yy)
    x += 104; label(x0, x, "Cells"); x += 18
    # Editing
    x0 = x
    small(d, x, r1, "AutoSum", icon=lambda d_, a, b: d_.text((a + 8, b), "Σ", font=F(SANSB, 16), fill=TXT, anchor="mm"), drop=True)
    small(d, x, r2, "Fill", icon=lambda d_, a, b: d_.text((a + 8, b), "↓", font=sym16, fill=(0, 120, 215), anchor="mm"), drop=True)
    small(d, x, r3, "Clear", icon=lambda d_, a, b: d_.polygon([(a + 2, b + 6), (a + 10, b - 6), (a + 16, b - 2), (a + 8, b + 8)], fill=(230, 120, 160)), drop=True)
    for i, (lab1, lab2, kind) in enumerate([("Sort &", "Filter", "sort"), ("Find &", "Select", "find")]):
        cx = x + 150 + i * 70
        if kind == "sort":
            d.text((cx - 8, 104), "A", font=F(CARB, 13), fill=(0, 120, 215), anchor="mm"); d.text((cx - 8, 116), "Z", font=F(CARB, 13), fill=TXT, anchor="mm")
            d.polygon([(cx + 2, 100), (cx + 16, 100), (cx + 10, 110)], outline=TXT); d.line([(cx + 10, 110), (cx + 10, 120)], fill=TXT, width=2)
        else:
            d.ellipse([cx - 10, 98, cx + 6, 114], outline=TXT, width=2); d.line([(cx + 4, 112), (cx + 12, 122)], fill=TXT, width=3)
        d.text((cx, 136), lab1, font=f15, fill=TXT, anchor="mm"); d.text((cx, 152), lab2, font=f15, fill=TXT, anchor="mm")
    x += 270; label(x0, x, "Editing"); x += 18
    # Analysis
    x0 = x
    for i, (h, c) in enumerate([(14, (16, 124, 65)), (24, (0, 120, 215)), (18, (16, 124, 65))]):
        d.rectangle([x + 18 + i * 9, 122 - h, x + 24 + i * 9, 122], fill=c)
    d.text((x + 32, 136), "Analyze", font=f15, fill=TXT, anchor="mm"); d.text((x + 32, 152), "Data", font=f15, fill=TXT, anchor="mm")
    x += 64; d.text(((x0 + x) / 2, gl + 3), "Analysis", font=f13, fill=MUTE, anchor="mm")
    d.text((W - 30, gl + 3), "∨", font=sym14, fill=MUTE, anchor="mm")
    return img

CHROME = chrome()
