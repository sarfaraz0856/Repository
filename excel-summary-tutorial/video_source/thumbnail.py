from PIL import Image, ImageDraw, ImageFont
W, H = 1280, 720
FD = "/usr/share/fonts/truetype/"
def F(p, s): return ImageFont.truetype(FD + p, s)
SANSB = "dejavu/DejaVuSans-Bold.ttf"; SANS = "dejavu/DejaVuSans.ttf"
DEVB = "noto/NotoSansDevanagari-Bold.ttf"
CARB = "crosextra/Carlito-Bold.ttf"; CAR = "crosextra/Carlito-Regular.ttf"
GREEN = (16, 124, 65); DARK = (13, 30, 22); YELLOW = (255, 214, 10); WHITE = (255, 255, 255)


def mixed(d, cx, cy, parts, fill):
    """parts = [(text, font), ...] drawn in a row, whole row centred on cx."""
    total = sum(f.getlength(t) for t, f in parts)
    x = cx - total / 2
    for t, f in parts:
        d.text((x, cy), t, font=f, fill=fill, anchor="lm"); x += f.getlength(t)

img = Image.new("RGB", (W, H), DARK); d = ImageDraw.Draw(img)
# background gradient
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(10 + 10 * t), int(38 + 30 * t), int(28 + 14 * t)))
# green accent corner glow
gl = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(gl)
gd.ellipse([-260, -300, 520, 300], fill=(16, 160, 85, 70))
gd.ellipse([W - 420, H - 330, W + 240, H + 230], fill=(16, 160, 85, 55))
img = Image.alpha_composite(img.convert("RGBA"), gl).convert("RGB"); d = ImageDraw.Draw(img)

# ---------- top headline ----------
f_big = F(SANSB, 86); f_dev = F(DEVB, 60); f_mid = F(SANSB, 46)
d.text((54, 44), "SUMIF", font=f_big, fill=WHITE)
w1 = f_big.getlength("SUMIF")
d.text((54 + w1 + 22, 60), "&", font=F(SANSB, 56), fill=YELLOW)
w2 = f_big.getlength("SUMIF") + 22 + F(SANSB, 56).getlength("&") + 20
d.text((54 + w2, 44), "SUMIFS", font=f_big, fill=YELLOW)
d.text((56, 146), "एक्सेल में हिंदी", font=f_dev, fill=(190, 235, 205))

# ---------- the transformation strip ----------
TY = 250
def panel(x, y, w, h, title, tcol):
    d.rounded_rectangle([x + 5, y + 6, x + w + 5, y + h + 6], radius=14, fill=(0, 0, 0))
    d.rounded_rectangle([x, y, x + w, y + h], radius=14, fill=(255, 255, 255))
    d.rounded_rectangle([x, y, x + w, y + 42], radius=14, fill=tcol)
    d.rectangle([x, y + 28, x + w, y + 42], fill=tcol)
    d.text((x + w / 2, y + 21), title, font=F(CARB, 24), fill=WHITE, anchor="mm")

f_cell = F(CAR, 20); f_cellb = F(CARB, 20)
# RAW DATA panel
px, py, pw, ph = 54, TY, 430, 330
panel(px, py, pw, ph, "RAW DATA  (All Data)", (90, 90, 95))
raw = [("Rahul Sharma", "Laptop", "100"), ("Priya Das", "Mobile", "80"), ("Rahul Sharma", "Laptop", "50"),
       ("Aman Khan", "Tablet", "60"), ("Priya Das", "Mobile", "40"), ("Rahul Sharma", "Laptop", "40")]
for i, (a, b, c) in enumerate(raw):
    yy = py + 60 + i * 44
    if i % 2 == 0: d.rectangle([px + 8, yy - 15, px + pw - 8, yy + 21], fill=(243, 246, 243))
    hl = a == "Rahul Sharma" and b == "Laptop"
    if hl: d.rectangle([px + 8, yy - 15, px + pw - 8, yy + 21], fill=(205, 240, 215))
    d.text((px + 18, yy + 3), a, font=f_cellb if hl else f_cell, fill=(25, 25, 25), anchor="lm")
    d.text((px + 228, yy + 3), b, font=f_cellb if hl else f_cell, fill=(25, 25, 25), anchor="lm")
    d.text((px + pw - 20, yy + 3), c, font=f_cellb if hl else f_cell, fill=(25, 25, 25), anchor="rm")
mixed(d, px + pw / 2, py + ph - 20, [("बार-बार जोड़ना ", F(DEVB, 22)), ("\u2717", F(SANSB, 24))], (185, 40, 40))

# ARROW
ax = px + pw + 34
d.polygon([(ax, TY + 150), (ax + 86, TY + 150), (ax + 86, TY + 122), (ax + 148, TY + 172),
           (ax + 86, TY + 222), (ax + 86, TY + 194), (ax, TY + 194)], fill=YELLOW)

# SUMMARY panel
qx = ax + 176; qw = W - qx - 54
panel(qx, TY, qw, ph, "AUTO SUMMARY", GREEN)
rows = [("Rahul Sharma", "190", "9,500"), ("Priya Das", "145", "11,600"), ("Aman Khan", "150", "13,100")]
for i, (a, b, c) in enumerate(rows):
    yy = TY + 70 + i * 52
    d.text((qx + 18, yy), a, font=F(CARB, 24), fill=(25, 25, 25), anchor="lm")
    d.text((qx + qw - 128, yy), b, font=F(CARB, 24), fill=(25, 25, 25), anchor="rm")
    d.text((qx + qw - 18, yy), c, font=F(CARB, 24), fill=(25, 25, 25), anchor="rm")
gy = TY + 70 + 3 * 52 + 6
d.rectangle([qx + 8, gy - 20, qx + qw - 8, gy + 60], fill=(198, 239, 206))
d.text((qx + 18, gy + 6), "GRAND TOTAL", font=F(CARB, 24), fill=(0, 97, 0), anchor="lm")
d.text((qx + qw - 18, gy + 6), "37,800", font=F(CARB, 34), fill=(0, 97, 0), anchor="rm")
mixed(d, qx + qw / 2, gy + 48, [("सिर्फ़ एक ", F(DEVB, 22)), ("FORMULA ", F(SANSB, 21)), ("\u2713", F(SANSB, 24))], (0, 110, 50))

# ---------- bottom ribbon ----------
d.rounded_rectangle([54, H - 86, 700, H - 20], radius=12, fill=YELLOW)
d.text((76, H - 53), "FREE PRACTICE FILE", font=F(SANSB, 34), fill=(20, 20, 20), anchor="lm")
bx = 76 + F(SANSB, 34).getlength("FREE PRACTICE FILE") + 18
d.text((bx, H - 50), "नीचे लिंक", font=F(DEVB, 26), fill=(20, 20, 20), anchor="lm")
d.text((W - 54, H - 53), "STEP BY STEP", font=F(SANSB, 30), fill=WHITE, anchor="rm")

img.save("thumbnail.png"); img.save("thumbnail.jpg", quality=92)
print("thumbnail saved", img.size)
