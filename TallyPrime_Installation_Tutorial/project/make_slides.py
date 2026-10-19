#!/usr/bin/env python3
"""Generate professional explainer slides (PNG) for the TallyPrime install video.
Honest explainer design — NO fake TallyPrime UI. Hinglish (Roman) text."""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "slides")
os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080

FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

def f(path, size): return ImageFont.truetype(path, size)

# palette
C_TXT = (255, 255, 255)
C_MUT = (176, 198, 224)
C_GOLD = (245, 179, 1)
C_TEAL = (48, 198, 198)
C_CARD = (18, 50, 92)
C_BORDER = (30, 74, 130)

def gradient_bg():
    top = (9, 27, 54); bot = (14, 46, 84)
    bg = Image.new("RGB", (W, H), top)
    d = ImageDraw.Draw(bg)
    for y in range(H):
        t = y / H
        r = int(top[0] + (bot[0]-top[0])*t)
        g = int(top[1] + (bot[1]-top[1])*t)
        b = int(top[2] + (bot[2]-top[2])*t)
        d.line([(0, y), (W, y)], fill=(r, g, b))
    # subtle accent corner glow
    glow = Image.new("RGB", (W, H), (0,0,0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W-700, -300, W+300, 500], fill=(20, 60, 110))
    bg = Image.blend(bg, Image.composite(glow, bg, glow.convert("L").point(lambda p: min(p,60))), 0.0)
    return bg

def wrap(draw, text, font, maxw):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= maxw:
            cur = test
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def header(d, kicker, step):
    d.text((110, 70), kicker, font=f(FB, 30), fill=C_TEAL)
    if step:
        tw = d.textlength(step, font=f(FB, 30))
        d.text((W-110-tw, 70), step, font=f(FB, 30), fill=C_GOLD)
    d.line([(110, 120), (W-110, 120)], fill=C_BORDER, width=2)

def footer(d, note):
    d.line([(110, H-110), (W-110, H-110)], fill=C_BORDER, width=2)
    d.text((110, H-88), note, font=f(FR, 24), fill=C_MUT)

def badge(d, cx, cy, r, text):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=C_GOLD)
    tw = d.textlength(text, font=f(FB, int(r*1.1)))
    d.text((cx-tw/2, cy-r*0.72), text, font=f(FB, int(r*1.1)), fill=(9,27,54))

def save(img, name):
    img.save(os.path.join(OUT, name))
    print("wrote", name)

def slide_title(name, big1, big2, sub, tag, foot):
    bg = gradient_bg(); d = ImageDraw.Draw(bg)
    header(d, "TALLYPRIME  •  INSTALLATION GUIDE", "HINDI / HINGLISH")
    d.text((110, 300), big1, font=f(FB, 108), fill=C_TXT)
    d.text((110, 420), big2, font=f(FB, 108), fill=C_GOLD)
    # accent bar
    d.rectangle([110, 560, 430, 574], fill=C_TEAL)
    for i, line in enumerate(wrap(d, sub, f(FR, 44), W-260)):
        d.text((110, 610 + i*62), line, font=f(FR, 44), fill=C_MUT)
    # tag pill
    tw = d.textlength(tag, font=f(FB, 30))
    d.rounded_rectangle([110, 820, 110+tw+60, 884], 32, fill=C_CARD, outline=C_TEAL, width=2)
    d.text((140, 835), tag, font=f(FB, 30), fill=C_TEAL)
    footer(d, foot)
    save(bg, name)

def slide_points(name, step, title, subtitle, points, foot, cmd=None, warn=None):
    bg = gradient_bg(); d = ImageDraw.Draw(bg)
    header(d, "TALLYPRIME INSTALLATION", step)
    y = 170
    if step.startswith("STEP"):
        badge(d, 150, 215, 56, step.split()[1].split("/")[0])
        d.text((230, 168), title, font=f(FB, 72), fill=C_TXT)
        y = 300
    else:
        d.text((110, 168), title, font=f(FB, 72), fill=C_TXT)
        y = 290
    if subtitle:
        d.text((110, y), subtitle, font=f(FR, 36), fill=C_TEAL); y += 72
    y += 10
    for p in points:
        d.text((120, y+6), "\u2713", font=f(FB, 40), fill=C_TEAL)
        lines = wrap(d, p, f(FR, 40), W-320)
        for j, line in enumerate(lines):
            d.text((185, y + j*54), line, font=f(FR, 40), fill=C_TXT)
        y += max(len(lines)*54, 54) + 26
    if cmd:
        cw = d.textlength(cmd, font=f(FM, 34))
        d.rounded_rectangle([120, y+4, 120+cw+60, y+74], 14, fill=(6, 18, 36), outline=C_BORDER, width=2)
        d.text((150, y+18), cmd, font=f(FM, 34), fill=C_GOLD)
        y += 100
    if warn:
        for j, line in enumerate(wrap(d, warn, f(FB, 32), W-320)):
            d.text((120, y + j*46), line, font=f(FB, 32), fill=C_GOLD)
    footer(d, foot)
    save(bg, name)

DISC = "Educational explainer. Independent — not endorsed by Tally. Download only from tallysolutions.com."

# 1 Intro
slide_title("s01.png", "TallyPrime", "Install Kaise Kare?",
    "Download se Install tak — A to Z, beginners ke liye. Simple Hindi/Hinglish mein.",
    "COMPLETE BEGINNER TUTORIAL", DISC)

# 2 Disclaimer / Windows-only
slide_points("s02.png", "PEHLE JAAN LIJIYE", "Zaroori Baatein", "Before we start",
    ["TallyPrime sirf WINDOWS par chalta hai (Windows 7+, 64-bit).",
     "Hamesha OFFICIAL site se download kijiye: tallysolutions.com",
     "Cracked / unofficial / 'free activation' kabhi use na karein.",
     "Ye video ek guide hai — asli install screens apne PC par dikhenge."],
    DISC, warn="Install karna = License activation NAHI. Dono alag hain.")

# 3 What is Tally
slide_points("s03.png", "CONCEPT", "TallyPrime Kya Hai?", "Accounting software",
    ["Business ke paise ka hisaab-kitaab rakhne wala software.",
     "Accounting, Sales, Purchase, Inventory aur GST ke kaam ke liye.",
     "Students, accountants aur office staff ise seekhte hain.",
     "Features aapke version aur license par depend karte hain."],
    DISC)

# 4 System prep
slide_points("s04.png", "STEP 1/8", "System Taiyaari", "Apna Windows check karein",
    ["Keyboard par Windows + R dabaiye.",
     "Type kijiye winver aur Enter — version box khulega.",
     "Zaroori kaam save kijiye, extra apps band kijiye.",
     "Version ke exact RAM/disk requirements official page par confirm karein."],
    DISC, cmd="Win + R  ->  winver  ->  Enter")

# 5 Official site
slide_points("s05.png", "STEP 2/8", "Official Website", "Sahi source pehchaanein",
    ["Browser mein kholiye: tallysolutions.com",
     "Address bar mein domain aur lock (https) icon check kijiye.",
     "'Download' section par jaiye.",
     "Unofficial download sites se bachiye — virus/legal risk."],
    DISC, cmd="https://tallysolutions.com/download")

# 6 Download
slide_points("s06.png", "STEP 3/8", "Download Karna", "Setup file lena",
    ["Download page par current version dikhega — jo likha ho wahi dekhiye.",
     "'Download' button dabaiye; setup file download hogi.",
     "File aapke Downloads folder mein jaati hai.",
     "File Explorer kholne ke liye: Win + E -> Downloads."],
    DISC, cmd="Win + E  ->  Downloads folder")

# 7 Verify
slide_points("s07.png", "STEP 4/8", "Setup File Verify", "Security check (official)",
    ["Tally officially SHA-256 checksum verify karne ko kehta hai.",
     "PowerShell mein neeche wali command chalaiye.",
     "Jo value aaye, use official page ki value se match kijiye.",
     "Properties -> Digital Signatures se publisher 'Tally' bhi dekh sakte hain."],
    DISC, cmd="Get-FileHash -Algorithm SHA256 \"<setup file path>\"")

# 8 Install
slide_points("s08.png", "STEP 5/8", "Installation", "Setup chalana",
    ["Setup file par double-click kijiye.",
     "'User Account Control' prompt par YES dabaiye (admin permission).",
     "Naye user ke liye 'Install New' choose kijiye.",
     "Application Path default: C:\\Program Files\\TallyPrime  ->  Install.",
     "Install hone par 'Start TallyPrime' aayega."],
    DISC, warn="Antivirus / Windows security band MAT kijiye.")

# 9 First launch
slide_points("s09.png", "STEP 6/8", "Pehli Baar Launch", "Install vs Activation",
    ["'Start TallyPrime' ya Start menu se kholiye.",
     "Software install hona aur license activate hona alag cheezein hain.",
     "Startup par jo options actually dikhein, unhi ko follow kijiye.",
     "Kisi bhi license bypass ki zaroorat nahi — na karein."],
    DISC)

# 10 Education mode
slide_points("s10.png", "STEP 7/8", "Educational Mode", "Free learning mode",
    ["Bina license, free mein Tally seekhne ka tareeka.",
     "Limitation: aam taur par sirf 1, 2 aur 31 tareekh par voucher entry.",
     "Exact rule apne version ki official docs se confirm karein.",
     "Ye payment bypass NAHI hai — sirf practice ke liye."],
    DISC)

# 11 Company setup
slide_points("s11.png", "STEP 8/8", "Sample Company", "Practice setup",
    ["Gateway of Tally par company create/select ka option hota hai.",
     "Sirf practice ke liye ek SAMPLE company banaiye.",
     "Real bank / tax / personal details MAT daaliye.",
     "Installation complete karne ke liye company banana zaroori nahi."],
    DISC)

# 12 Verify + troubleshoot
slide_points("s12.png", "CHECK", "Installation Verify", "Sab theek hai?",
    ["Gateway of Tally screen dikhe = install successful.",
     "Open na ho -> Run as administrator / PC restart try kijiye.",
     "Shortcut na mile -> Start menu mein 'TallyPrime' search kijiye.",
     "Fixes ke liye official help: help.tallysolutions.com"],
    DISC)

# 13 Mistakes
slide_points("s13.png", "TIPS", "Common Galtiyan", "In se bachiye",
    ["Unofficial / cracked site se download karna.",
     "Galat ya incompatible version lena.",
     "Install ko activation samajh lena.",
     "Education mode ki date-limit ignore karna.",
     "Data ka backup na rakhna."],
    DISC)

# 14 Next steps
slide_points("s14.png", "LEARNING PATH", "Aage Kya Seekhein?", "Install to bas shuruaat hai",
    ["Interface + Company creation",
     "Ledgers, Groups aur Voucher entry",
     "Sales / Purchase entries + Inventory basics",
     "GST configuration & reporting (jahan applicable)",
     "Backup & Restore"],
    DISC)

# 15 Outro
slide_title("s15.png", "Shukriya!", "Like & Subscribe",
    "Agli video: Company Creation in TallyPrime. Comments mein topic bataiye.",
    "HAPPY LEARNING", DISC)

print("ALL SLIDES DONE")
