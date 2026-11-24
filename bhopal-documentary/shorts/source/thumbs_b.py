from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
HI = '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'; IN = '/usr/share/fonts/opentype/inter/'
Y, W, RED = (255, 214, 0), (255, 255, 255), (214, 30, 30)
T = {'night': ('एक टैंक ने', 'शहर मार दिया', 'BHOPAL 1984', 1.6), 'station': ('उसने ट्रेन', 'बचा ली', 'STATION HERO', 1.3),
     'hospital': ('डॉक्टर भी', 'नहीं जानते थे', 'BHOPAL GAS', 1.2), 'anderson': ('उसी दिन', 'भाग गया', 'WARREN ANDERSON', 1.1), 'poison': ('ज़हर आज भी', 'यहीं है', 'BHOPAL TODAY', 1.2)}
def fit(d, txt, path, size, maxw):
    while d.textlength(txt, font=ImageFont.truetype(path, size)) > maxw: size -= 4
    return ImageFont.truetype(path, size)
for k, (l1, l2, tag, br) in T.items():
    im = Image.open(f'f_{k}.png').convert('RGB')
    im = ImageEnhance.Brightness(im).enhance(br); im = ImageEnhance.Contrast(im).enhance(1.25); im = ImageEnhance.Color(im).enhance(1.2)
    sh = Image.new('L', im.size, 0); sd = ImageDraw.Draw(sh)
    for y in range(1920): sd.line([(0, y), (1080, y)], fill=int(min(255, max(0, 1 - y / 700) ** 1.4 * 200 + min(1, max(0, (y - 1240) / 160)) * 255)))
    im = Image.composite(Image.new('RGB', im.size), im, sh); d = ImageDraw.Draw(im)
    f1 = fit(d, l1, HI, 170, 1000); f2 = fit(d, l2, HI, 170, 1000)
    for (txt, f, y, c) in [(l1, f1, 150, W), (l2, f2, 360, Y)]:
        g = Image.new('RGBA', im.size, (0, 0, 0, 0)); ImageDraw.Draw(g).text((548, y + 10), txt, font=f, fill=(0, 0, 0, 220), anchor='ma', stroke_width=10, stroke_fill=(0, 0, 0, 220))
        im.paste(g.filter(ImageFilter.GaussianBlur(10)), (0, 0), g.filter(ImageFilter.GaussianBlur(10)))
        d.text((540, y), txt, font=f, fill=c, anchor='ma', stroke_width=9, stroke_fill=(0, 0, 0))
    ft = fit(d, tag, IN + 'Inter-Black.otf', 72, 900); l, t, r, b = d.textbbox((540, 1610), tag, font=ft, anchor='ma')
    d.rectangle((l - 30, t - 18, r + 30, b + 18), fill=RED); d.text((540, 1610), tag, font=ft, fill=W, anchor='ma')
    im.save(f'Thumbnail-{k}.jpg', quality=92)
s = Image.new('RGB', (5 * 360, 640)); [s.paste(Image.open(f'Thumbnail-{k}.jpg').resize((360, 640)), (i * 360, 0)) for i, k in enumerate(T)]; s.save('prev.jpg')
