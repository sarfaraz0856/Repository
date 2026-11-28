#!/usr/bin/env python3
"""1-minute sample: how to create an AdSense for YouTube account. Reuses make_full's helpers and builder.
Run: OUT_SUB=adsense TL_NAME=timeline_adsense.js FIRST_SCREEN=earn KOKORO_DIR=... python make_adsense.py"""
import make_full as M
from make_full import B, P, Y, press, tapgo, typ
M.BEATS.clear()

B("यूट्यूब की कमाई पहले गूगल ऐडसेंस अकाउंट में आती है, फिर आपके बैंक में। इसलिए ऐडसेंस सबसे ज़रूरी है।",
  "YouTube pays your earnings through Google AdSense first, then to your bank. That's why AdSense matters.",
  [("hl", 1.2, 16, 88, 380, 132, 2.4)],
  panel=P("ADSENSE · 2026", f"How to Create an {Y('AdSense Account')} for YouTube"), ch="AdSense for YouTube", pad=0.35)
B("ऐडसेंस किसी बाहरी लिंक से नहीं — सिर्फ़ यूट्यूब स्टूडियो के 'अर्न' सेक्शन से बनाइए।",
  "Create it only from YouTube Studio's Earn section — never from outside links.",
  [("hl", 1.0, 16, 236, 380, 300, 2.6)], b="Only via YouTube Studio → Earn", pad=0.35)
B("चैनल एलिजिबल होते ही यहाँ 'साइन अप फ़ॉर ऐडसेंस' का स्टेप आता है। 'स्टार्ट' पर टैप कीजिए।",
  "Once you're eligible, you'll see “Sign up for AdSense for YouTube”. Tap “Start”.",
  [("hl", 0.4, 16, 320, 380, 104, 2.0)] + press(("e", -1.3), 345, 372, z=1.7, ox=390, oy=372, box=(300, 354, 90, 36), to="gchoose"),
  panel=P("STEP 1", f"Tap {Y('“Start”')}", "Studio → Earn → Sign up for AdSense for YouTube"), pad=0.35)
B("अपना गूगल अकाउंट चुनिए। याद रखिए — एक नाम पर सिर्फ़ एक ही ऐडसेंस अकाउंट बनता है।",
  "Choose your Google account. Remember: only one AdSense account is allowed per payee name.",
  tapgo(("e", -0.4), 206, 220, to="as1", box=(20, 190, 372, 60)),
  panel=P("STEP 2", f"Choose your {Y('Google account')}"), b="One payee name = one AdSense account", pad=0.35)
B("चैनल अपने आप भरा होता है। देश में 'इंडिया' चुनिए, टर्म्स पर टिक कीजिए, और 'कंटिन्यू' दबाइए।",
  "Your channel is already filled in. Select India, accept the terms, and tap “Continue”.",
  [("hl", 0.3, 16, 140, 380, 54, 1.6), ("tap", 2.4, 206, 243), ("set", 2.6, "country", "India"), ("hl", 2.0, 16, 216, 380, 54, 1.2),
   ("tap", 4.0, 31, 311), ("set", 4.1, "agree", 1), ("hl", 3.6, 16, 294, 380, 50, 1.2)] + tapgo(("e", 0.2), 206, 421, to="as2", box=(24, 400, 364, 42)),
  panel=P("STEP 3", f"Country: {Y('India')}", "Accept the terms → Continue"), pad=0.4)
B("अब नाम — बिल्कुल वैसा लिखिए, जैसा बैंक अकाउंट में है। वरना पेमेंट अटक सकता है।",
  "Enter your name exactly as on your bank account — a mismatch can hold your payment.",
  [("hl", 0.4, 16, 118, 380, 36, 2.2), ("zoom", 2.2, 30, 182, 1.3, 3.2)] + tapgo(2.6, 206, 269) + typ(2.9, "pname", "Rahul Sharma", cps=7),
  panel=P("STEP 4", f"Payee {Y('information')}"), b="Name = exactly as in your bank account", pad=0.35)
B("पता और पिन कोड सही डालिए — गूगल इसी पते पर छह अंकों का पिन डाक से भेजता है।",
  "Enter your real address and PIN code — Google mails a 6-digit PIN here when you reach the threshold.",
  typ(0.5, "paddr", "12, MG Road, Sector 5", cps=11) + typ(2.7, "pcity", "New Delhi", cps=9) + typ(4.0, "ppin", "110001", cps=7) +
  [("set", 5.0, "focus", "")] + press(5.2, 206, 551, z=1.5, ox=206, oy=551, box=(24, 530, 364, 42), to="earn", after=[("set", .25, "as2", 1), ("sfx", .3, "chime")]),
  b="Real address — the PIN letter comes by post", pad=0.4)
B("बस! ऐडसेंस लिंक हो गया, अब यूट्यूब आपका चैनल रिव्यू करेगा। पिन और बैंक सेटअप — फ़ुल वीडियो में बताऊँगा।",
  "Done! AdSense is linked and YouTube will review your channel. PIN & bank setup — in the full video.",
  [("conf", 0.0), ("hl", 0.8, 16, 320, 380, 104, 1.8), ("hl", 2.8, 16, 432, 380, 84, 2.0)],
  panel=P("DONE 🎉", f"AdSense {Y('linked!')}", "Next: PIN verification &amp; bank account", kc="#1fb866"), pad=1.0)

if __name__ == "__main__":
    M.main()
