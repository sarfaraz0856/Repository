# Microsoft 365 Excel window chrome (light title bar, ribbon card, styles gallery).
from PIL import Image, ImageDraw, ImageFont
FD = "/usr/share/fonts/truetype/"
def F(n, s): return ImageFont.truetype(FD + n, s)
CAR, CARB, CARI = "crosextra/Carlito-Regular.ttf", "crosextra/Carlito-Bold.ttf", "crosextra/Carlito-Italic.ttf"
SANS, SANSB = "dejavu/DejaVuSans.ttf", "dejavu/DejaVuSans-Bold.ttf"
W = 1920; RIB_H = 192
XL = (16, 124, 65); BG = (243, 243, 243); TXT = (36, 36, 36); MUTE = (96, 96, 96); LINE = (224, 224, 224); BLUE = (0, 103, 192)
f14, f15, f16, f17, f17b = F(CAR, 14), F(CAR, 15), F(CAR, 16), F(CAR, 17), F(CARB, 17)
s13, s15, s17, s20 = F(SANS, 13), F(SANS, 15), F(SANS, 17), F(SANS, 20)
BTN = {}

def chev(d, x, y, c=MUTE, s=4): d.line([(x - s, y - s / 2), (x, y + s / 2), (x + s, y - s / 2)], fill=c, width=1)
def launcher(d, x, y):
    d.line([(x - 4, y - 4), (x + 3, y - 4)], fill=MUTE); d.line([(x - 4, y - 4), (x - 4, y + 3)], fill=MUTE)
    d.line([(x - 1, y - 1), (x + 4, y + 4)], fill=MUTE); d.line([(x + 4, y), (x + 4, y + 4), (x, y + 4)], fill=MUTE)
def glabel(d, cx, t, lx=None):
    d.text((cx, 168), t, font=f14, fill=MUTE, anchor="mm")
    if lx: launcher(d, lx, 168)
def sep(d, x): d.line([(x, 88), (x, 174)], fill=LINE)
def big_label(d, cx, l1, l2=None, drop=True):
    d.text((cx, 129), l1, font=f15, fill=TXT, anchor="mm")
    if l2: d.text((cx - (5 if drop else 0), 144), l2, font=f15, fill=TXT, anchor="mm"); chev(d, cx + f15.getlength(l2) / 2 + 2, 145) if drop else None
    elif drop: chev(d, cx, 146)

def chrome():
    img = Image.new("RGB", (W, RIB_H), BG); d = ImageDraw.Draw(img)
    # ---------------- title bar
    d.rounded_rectangle([12, 14, 32, 34], radius=3, fill=XL); d.rectangle([22, 17, 30, 31], fill=(33, 163, 102))
    d.text((19, 24), "x", font=F(SANSB, 13), fill="white", anchor="mm")
    d.text((48, 24), "AutoSave", font=f16, fill=TXT, anchor="lm")
    d.rounded_rectangle([118, 14, 162, 34], radius=10, outline=(80, 80, 80), width=1); d.ellipse([123, 19, 133, 29], fill=(60, 60, 60))
    d.text((139, 24), "Off", font=f14, fill=TXT, anchor="lm")
    d.rectangle([175, 16, 191, 32], outline=(112, 48, 160), width=2); d.rectangle([179, 16, 187, 21], fill=(112, 48, 160)); d.rectangle([179, 26, 187, 32], fill=(112, 48, 160))
    d.text((214, 24), "↶", font=s20, fill=(110, 110, 110), anchor="mm"); chev(d, 230, 25, s=3)
    d.text((254, 24), "↷", font=s20, fill=(170, 170, 170), anchor="mm"); chev(d, 270, 25, s=3)
    d.line([(286, 19), (296, 19)], fill=MUTE); chev(d, 291, 26, s=3)
    d.text((322, 24), "Raw_Data_to_Summary  -  Excel", font=f16, fill=TXT, anchor="lm")
    d.rounded_rectangle([785, 9, 1150, 39], radius=4, fill="white", outline=(205, 205, 205))
    d.ellipse([800, 16, 812, 28], outline=MUTE, width=2); d.line([(810, 27), (815, 32)], fill=MUTE, width=2)
    d.text((826, 24), "Search", font=f16, fill=MUTE, anchor="lm")
    d.ellipse([1739, 11, 1765, 37], outline=XL, width=2); d.ellipse([1747, 15, 1757, 25], outline=XL, width=2); d.arc([1743, 24, 1761, 40], 200, 340, fill=XL, width=2)
    d.line([(1792, 24), (1806, 24)], fill=TXT); d.rectangle([1840, 18, 1852, 30], outline=TXT); d.line([(1843, 15), (1855, 15), (1855, 27)], fill=TXT)
    d.text((1896, 24), "✕", font=s15, fill=TXT, anchor="mm")
    # ---------------- tabs row
    x = 22
    for t in ["File", "Home", "Insert", "Draw", "Page Layout", "Formulas", "Data", "Review", "View", "Automate", "Help"]:
        w = f16.getlength(t)
        d.text((x, 63), t, font=f17b if t == "Home" else f16, fill=TXT, anchor="lm")
        if t == "Home": d.rounded_rectangle([x - 1, 74, x + w + 3, 77], radius=2, fill=XL)
        x += w + 29
    d.rounded_rectangle([1722, 52, 1829, 75], radius=4, outline=(138, 138, 138), fill="white")
    d.rectangle([1730, 58, 1742, 67], outline=TXT); d.polygon([(1732, 67), (1732, 71), (1736, 67)], fill=TXT)
    d.text((1788, 63), "Comments", font=f15, fill=TXT, anchor="mm")
    d.rounded_rectangle([1837, 52, 1908, 75], radius=4, fill=XL)
    d.text((1867, 63), "Share", font=f16, fill="white", anchor="mm"); chev(d, 1898, 64, c="white", s=3)
    # ---------------- ribbon card
    d.rounded_rectangle([8, 82, W - 8, 180], radius=8, fill="white", outline=LINE)
    r1, r2, r3 = 97, 122, 147
    # Clipboard
    d.rounded_rectangle([28, 90, 52, 116], radius=2, fill=(200, 160, 90)); d.rectangle([34, 87, 46, 93], fill=(110, 110, 110))
    d.rectangle([40, 98, 58, 120], fill="white", outline=(110, 110, 110))
    for i in range(3): d.line([(43, 104 + i * 5), (55, 104 + i * 5)], fill=(160, 160, 160))
    d.text((41, 130), "Paste", font=f15, fill=TXT, anchor="mm"); chev(d, 41, 146)
    d.text((76, r1), "✂", font=s15, fill=BLUE, anchor="mm"); d.text((89, r1), "Cut", font=f15, fill=TXT, anchor="lm")
    d.rectangle([69, r2 - 6, 79, r2 + 6], outline=TXT); d.rectangle([73, r2 - 9, 83, r2 + 3], outline=TXT, fill="white")
    d.text((89, r2), "Copy", font=f15, fill=TXT, anchor="lm"); chev(d, 136, r2)
    d.polygon([(70, r3 + 5), (78, r3 - 5), (83, r3 - 2), (75, r3 + 8)], fill=(214, 140, 40)); d.rectangle([77, r3 - 9, 85, r3 - 4], fill=(150, 90, 30))
    d.text((89, r3), "Format Painter", font=f15, fill=TXT, anchor="lm")
    glabel(d, 90, "Clipboard", 176); sep(d, 184)
    # Font
    d.rounded_rectangle([190, 87, 313, 108], radius=3, outline=(180, 180, 180)); d.text((196, 97), "Aptos Narrow", font=f15, fill=TXT, anchor="lm"); chev(d, 304, 97)
    d.rounded_rectangle([317, 87, 358, 108], radius=3, outline=(180, 180, 180)); d.text((322, 97), "11", font=f15, fill=TXT, anchor="lm"); chev(d, 350, 97)
    d.text((371, 98), "A", font=F(CAR, 19), fill=TXT, anchor="mm"); d.text((380, 92), "^", font=f14, fill=TXT, anchor="mm")
    d.text((397, 99), "A", font=f16, fill=TXT, anchor="mm"); d.text((405, 93), "ˇ", font=f14, fill=TXT, anchor="mm")
    for g, fnt, cx in [("B", F(CARB, 18), 203), ("I", F(CARI, 18), 229), ("U", f17, 255)]:
        d.text((cx, r2 + 3), g, font=fnt, fill=TXT, anchor="mm")
        BTN[{"B": "bold", "I": "italic", "U": "underline"}[g]] = (cx, r2 + 3)
    d.line([(250, r2 + 12), (260, r2 + 12)], fill=TXT); chev(d, 273, r2 + 3)
    d.rectangle([290, r2 - 5, 306, r2 + 11], outline=(150, 150, 150)); d.line([(298, r2 - 5), (298, r2 + 11)], fill=(170, 170, 170), width=1); d.line([(290, r2 + 3), (306, r2 + 3)], fill=(170, 170, 170)); d.line([(290, r2 + 11), (306, r2 + 11)], fill=TXT, width=2); chev(d, 317, r2 + 3)
    d.polygon([(336, r2 + 2), (343, r2 - 5), (350, r2 + 2), (343, r2 + 8)], outline=TXT); d.rectangle([334, r2 + 10, 352, r2 + 13], fill=(255, 230, 0)); chev(d, 361, r2 + 3)
    d.text((384, r2 + 1), "A", font=f17, fill=TXT, anchor="mm"); d.rectangle([375, r2 + 10, 393, r2 + 13], fill=(220, 30, 30)); chev(d, 402, r2 + 3)
    glabel(d, 293, "Font", 410); sep(d, 420)
    # Alignment
    for i, k in enumerate(["top", "mid", "bot"]):
        cx = 429 + i * 26
        if k == "bot": d.rounded_rectangle([cx - 3, r1 - 11, cx + 21, r1 + 11], radius=3, fill=(225, 225, 225), outline=(170, 170, 170))
        ys = {"top": [r1 - 6, r1 - 2, r1 + 2], "mid": [r1 - 4, r1, r1 + 4], "bot": [r1 - 2, r1 + 2, r1 + 6]}[k]
        for j, yy in enumerate(ys): d.line([(cx + (0 if j != 1 else 3), yy), (cx + (18 if j != 1 else 15), yy)], fill=TXT, width=1)
        gy = {"top": r1 - 9, "mid": None, "bot": r1 + 9}[k]
        if gy: d.line([(cx, gy), (cx + 18, gy)], fill=TXT, width=2)
    d.text((517, r1), "ab", font=f14, fill=TXT, anchor="mm"); d.line([(524, r1 + 4), (532, r1 - 6)], fill=BLUE, width=2); chev(d, 539, r1)
    d.text((586, r1), "↵", font=s13, fill=BLUE, anchor="mm"); d.text((595, r1), "Wrap Text", font=f15, fill=TXT, anchor="lm")
    for i, k in enumerate(["left", "center", "right"]):
        cx = 431 + i * 26
        for j, w in enumerate([16, 10, 16, 10]):
            x0 = cx if k == "left" else cx + (16 - w) / 2 if k == "center" else cx + 16 - w
            d.line([(x0, r2 - 6 + j * 4 + 3), (x0 + w, r2 - 6 + j * 4 + 3)], fill=TXT, width=1)
    for cx, arrow in [(519, "◂"), (545, "▸")]:
        for j in range(4): d.line([(cx - 2, r2 - 3 + j * 4), (cx + 9, r2 - 3 + j * 4)], fill=TXT)
        d.text((cx - 7, r2 + 3), arrow, font=s13, fill=BLUE, anchor="mm")
    d.rectangle([576, r2 - 4, 592, r2 + 10], outline=TXT); d.line([(579, r2 + 3), (589, r2 + 3)], fill=BLUE, width=2)
    d.text((598, r2 + 3), "Merge & Center", font=f15, fill=TXT, anchor="lm"); chev(d, 708, r2 + 3)
    glabel(d, 561, "Alignment", 712); sep(d, 722)
    # Number
    d.rounded_rectangle([729, 87, 874, 108], radius=3, outline=(180, 180, 180)); d.text((735, 97), "General", font=f15, fill=TXT, anchor="lm"); chev(d, 866, 97)
    d.text((741, r2 + 3), "$", font=F(CAR, 20), fill=TXT, anchor="mm"); chev(d, 759, r2 + 3)
    d.text((782, r2 + 3), "%", font=F(CAR, 20), fill=TXT, anchor="mm")
    d.text((808, r2 + 1), "9", font=F(CARB, 19), fill=TXT, anchor="mm"); BTN["comma"] = (808, r2 + 3)
    for cx, a, b in [(836, "←", ".0"), (863, "→", ".00")]:
        d.text((cx, r2 - 3), b, font=F(CAR, 11), fill=TXT, anchor="mm"); d.text((cx, r2 + 8), a, font=F(SANS, 10), fill=BLUE, anchor="mm")
    glabel(d, 794, "Number", 875); sep(d, 884)
    # Styles
    d.rectangle([914, 89, 942, 113], fill="white", outline=(150, 150, 150))
    for i, (c, w) in enumerate([((220, 60, 60), 20), ((220, 60, 60), 12), ((60, 120, 210), 22), ((60, 120, 210), 8)]):
        d.rectangle([917, 92 + i * 5, 917 + w, 95 + i * 5], fill=c)
    big_label(d, 928, "Conditional", "Formatting")
    d.rectangle([982, 89, 1010, 113], fill=(222, 235, 247), outline=(68, 114, 196)); d.rectangle([982, 89, 1010, 95], fill=(68, 114, 196))
    for i in range(1, 4): d.line([(982, 95 + i * 5), (1010, 95 + i * 5)], fill=(150, 175, 220))
    d.line([(996, 95), (996, 113)], fill=(150, 175, 220)); d.polygon([(1004, 104), (1012, 112), (1006, 114)], fill=BLUE)
    big_label(d, 996, "Format as", "Table")
    BTN["fat"] = (996, 101)
    gal = [("Normal", "white", TXT, (1031, 92)), ("Bad", (255, 199, 206), (156, 0, 6), (1138, 92)),
           ("Good", (198, 239, 206), (0, 97, 0), (1031, 120)), ("Neutral", (255, 235, 156), (156, 101, 0), (1138, 120))]
    d.rectangle([1028, 89, 1268, 150], outline=(200, 200, 200))
    for lab, bg, fg, (gx, gy) in gal:
        d.rectangle([gx, gy, gx + 103, gy + 24], fill=bg, outline=(60, 60, 60) if lab == "Normal" else bg)
        d.text((gx + 6, gy + 12), lab, font=f16, fill=fg, anchor="lm")
    BTN["good"] = (1082, 132); BTN["cellstyles"] = BTN["good"]
    d.line([(1245, 89), (1245, 150)], fill=(200, 200, 200)); chev(d, 1256, 100, s=3); chev(d, 1256, 116, s=3)
    d.line([(1252, 130), (1260, 130)], fill=MUTE); chev(d, 1256, 136, s=3)
    glabel(d, 1080, "Styles"); sep(d, 1278)
    # Cells
    for cx, lab, key in [(1306, "Insert", "insert"), (1350, "Delete", "delete"), (1395, "Format", "format")]:
        d.rectangle([cx - 14, 90, cx + 14, 112], fill="white", outline=(140, 140, 140))
        for j in range(1, 3): d.line([(cx - 14, 90 + j * 7), (cx + 14, 90 + j * 7)], fill=(170, 170, 170))
        for j in range(1, 3): d.line([(cx - 14 + j * 9, 90), (cx - 14 + j * 9, 112)], fill=(170, 170, 170))
        if key == "insert": d.rectangle([cx - 14, 97, cx + 14, 104], fill=(170, 205, 240)); d.polygon([(cx - 20, 100), (cx - 12, 96), (cx - 12, 104)], fill=BLUE)
        if key == "delete": d.line([(cx - 8, 94), (cx + 8, 108)], fill=(210, 40, 40), width=2); d.line([(cx + 8, 94), (cx - 8, 108)], fill=(210, 40, 40), width=2)
        if key == "format": d.rectangle([cx - 14, 90, cx + 14, 96], fill=(170, 205, 240))
        big_label(d, cx, lab, None); BTN[key] = (cx, 101)
    glabel(d, 1351, "Cells"); sep(d, 1426)
    # Editing
    d.text((1445, r1), "Σ", font=F(SANS, 17), fill=TXT, anchor="mm"); d.text((1457, r1), "AutoSum", font=f15, fill=TXT, anchor="lm"); chev(d, 1527, r1)
    d.rectangle([1438, r2 - 7, 1452, r2 + 7], outline=BLUE); d.text((1445, r2), "↓", font=s13, fill=BLUE, anchor="mm"); d.text((1457, r2), "Fill", font=f15, fill=TXT, anchor="lm"); chev(d, 1481, r2)
    d.polygon([(1438, r3 + 5), (1446, r3 - 6), (1453, r3 - 2), (1445, r3 + 8)], fill=(214, 70, 140)); d.text((1457, r3), "Clear", font=f15, fill=TXT, anchor="lm"); chev(d, 1492, r3)
    d.text((1554, 95), "A", font=F(CARB, 13), fill=BLUE, anchor="mm"); d.text((1554, 107), "Z", font=F(CARB, 13), fill=TXT, anchor="mm")
    d.polygon([(1563, 90), (1579, 90), (1572, 101)], outline=TXT); d.line([(1572, 101), (1572, 112)], fill=TXT, width=2)
    big_label(d, 1563, "Sort &", "Filter")
    d.ellipse([1600, 88, 1618, 106], outline=TXT, width=2); d.line([(1604, 104), (1596, 114)], fill=TXT, width=3)
    big_label(d, 1609, "Find &", "Select")
    glabel(d, 1533, "Editing"); sep(d, 1645)
    # Add-ins
    for i in range(4): d.rectangle([1661 + (i % 2) * 12, 89 + (i // 2) * 12, 1670 + (i % 2) * 12, 98 + (i // 2) * 12], outline=(220, 90, 30), width=2)
    big_label(d, 1672, "Add-ins", None, drop=False); glabel(d, 1672, "Add-ins"); sep(d, 1706)
    # Copilot
    for (cx, cy, c) in [(1726, 96, (0, 120, 212)), (1738, 96, (150, 80, 220)), (1726, 107, (40, 180, 140)), (1738, 107, (240, 140, 40))]:
        d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=c)
    d.ellipse([1724, 94, 1740, 110], fill="white"); d.ellipse([1727, 97, 1737, 107], fill=(120, 110, 230))
    big_label(d, 1732, "Copilot", None); glabel(d, 1732, "Copilot")
    chev(d, 1896, 164, s=5)
    return img

CHROME = chrome()
