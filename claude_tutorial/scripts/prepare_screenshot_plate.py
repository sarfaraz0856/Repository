"""Turns the user's real Claude home-screen screenshot (1920x929) into a 1920x1080 video plate.
- crops the browser-chrome strips (rows 0-6 and 926-928),
- extends the empty middle band (copies of row 620, which is plain background in both sidebar and main area),
- per the user's request (their account is Pro), removes Free-plan-only elements: the "Free plan · Upgrade" pill,
  the "Upgrade" badge next to Code, and changes "Sujan · Free" to "Sujan · Pro".
- per the user's request, the model selector shows "Opus 5.5" instead of "Sonnet 5.5" (original "5.5" and "Medium" pixels kept).
Coordinates: y_plate = y_orig - 7 for y_orig < 620, y_orig + 154 otherwise.
Usage: python3 prepare_screenshot_plate.py <in.png> <out.png>
"""
import sys
from PIL import Image, ImageDraw, ImageFont
src = Image.open(sys.argv[1]).convert("RGB")
im = src.copy(); d = ImageDraw.Draw(im); px = src.load()
SIDE, MAIN = (31, 31, 31), (25, 25, 25)
d.rectangle((1026, 58, 1184, 93), fill=MAIN)            # "Free plan · Upgrade" pill
d.rectangle((207, 195, 278, 222), fill=SIDE)            # "Upgrade" badge next to Code
# footer: "Sujan · Free ⌄" -> "Sujan · Pro ⌄"
grey = max((px[x, y] for x in range(91, 117) for y in range(896, 911)), key=sum)
chev = src.crop((121, 893, 135, 913))
d.rectangle((89, 892, 136, 914), fill=SIDE)
f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Medium.otf", 14)
d.text((91, 908), "Pro", font=f, fill=grey, anchor="ls")
w = d.textlength("Pro", font=f)
im.paste(chev, (int(91 + w + 6), 893))
# model selector: "Sonnet 5.5 Medium" -> "Opus 5.5 Medium" (the word is right-aligned to the original "5.5")
BOX = (48, 48, 48)
d.rectangle((1186, 446, 1245, 470), fill=BOX)
fo = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Medium.otf", 31)   # draw 2x, then scale down (x 0.9 to match the narrower UI font)
w2 = int(d.textlength("Opus", font=fo)) + 4
tmp = Image.new("RGB", (w2, 44), BOX); ImageDraw.Draw(tmp).text((1, 34), "Opus", font=fo, fill=(240, 240, 240), anchor="ls")
tmp = tmp.resize((int(w2 * 0.45), 22), Image.LANCZOS)
im.paste(tmp, (1244 - tmp.width + 1, 447))
top = im.crop((0, 7, 1920, 620)); row = im.crop((0, 620, 1920, 621)); bot = im.crop((0, 620, 1920, 926))
out = Image.new("RGB", (1920, 1080))
out.paste(top, (0, 0)); y = top.height
for _ in range(1080 - top.height - bot.height): out.paste(row, (0, y)); y += 1
out.paste(bot, (0, y)); out.save(sys.argv[2]); print("plate", out.size, "inserted rows", 1080 - top.height - bot.height, "grey", grey)
