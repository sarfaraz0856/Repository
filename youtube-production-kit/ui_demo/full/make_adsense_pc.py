#!/usr/bin/env python3
"""1-minute sample, PC version: create an AdSense for YouTube account in a desktop browser.
Run: SHIFT=0 OUT_SUB=adsense_pc TL_NAME=timeline_desk.js FIRST_SCREEN=studio KOKORO_DIR=... python make_adsense_pc.py"""
import make_full as M
from make_full import B, P, Y, press, tapgo, typ
M.BEATS.clear()

B("यूट्यूब की कमाई पहले गूगल ऐडसेंस अकाउंट में आती है, फिर आपके बैंक में। और ऐडसेंस बनाने का सबसे आसान तरीका है — कंप्यूटर।",
  "YouTube pays you through Google AdSense first, then to your bank. The easiest way to set it up is on a computer.",
  [("hl", 1.4, 280, 220, 960, 130, 0.01)],
  panel=P("ADSENSE · 2026", f"Create an {Y('AdSense Account')} on PC"), ch="AdSense for YouTube (PC)", pad=0.35)
B("ब्राउज़र में यूट्यूब स्टूडियो खोलिए, और बाईं तरफ़ 'अर्न' पर क्लिक कीजिए। ऐडसेंस हमेशा यहीं से बनाइए, किसी बाहरी लिंक से नहीं।",
  "Open YouTube Studio in your browser and click “Earn” on the left. Always create AdSense from here — never from outside links.",
  [("hl", 0.3, 96, 46, 1110, 32, 1.6), ("zoom", 2.0, 120, 670, 1.6, 1.6), ("hl", 2.5, 8, 648, 224, 44, 1.2), ("tap", 3.4, 120, 670), ("set", 3.55, "stab", "earn")],
  panel=P("STEP 1", f"Studio → {Y('Earn')}", "studio.youtube.com"), b="Only via YouTube Studio → Earn", pad=0.35)
B("चैनल एलिजिबल होते ही यहाँ 'साइन अप फ़ॉर ऐडसेंस' का स्टेप आता है। 'स्टार्ट' पर क्लिक कीजिए।",
  "Once you're eligible, you'll see “Sign up for AdSense for YouTube”. Click “START”.",
  [("hl", 0.3, 280, 462, 960, 96, 2.0)] + press(("e", -1.3), 1166, 510, z=1.7, box=(1106, 490, 120, 40), to="gacct"),
  panel=P("STEP 2", f"Click {Y('“START”')}"), pad=0.35)
B("अपना गूगल अकाउंट चुनिए। याद रखिए — एक नाम पर सिर्फ़ एक ही ऐडसेंस अकाउंट बनता है।",
  "Choose your Google account. Remember: only one AdSense account is allowed per payee name.",
  tapgo(("e", -0.4), 640, 417, to="ads1", box=(330, 384, 620, 66)),
  panel=P("STEP 3", f"Choose your {Y('Google account')}"), b="One payee name = one AdSense account", pad=0.35)
B("चैनल अपने आप भरा होता है। देश में 'इंडिया' चुनिए, टर्म्स पर टिक कीजिए, और 'कंटिन्यू' पर क्लिक कीजिए।",
  "Your channel is already filled in. Select India, accept the terms, and click “Continue”.",
  [("hl", 0.3, 340, 240, 600, 58, 1.6), ("hl", 2.0, 340, 320, 600, 58, 1.2), ("tap", 2.4, 640, 349), ("set", 2.6, "country", "India"),
   ("hl", 3.6, 334, 398, 612, 38, 1.2), ("tap", 4.0, 351, 417), ("set", 4.1, "agree", 1)] + tapgo(("e", 0.2), 430, 494, to="ads2", box=(340, 472, 180, 44)),
  panel=P("STEP 4", f"Country: {Y('India')}", "Accept the terms → Continue"), pad=0.4)
B("अब नाम — बिल्कुल वैसा लिखिए, जैसा बैंक अकाउंट में है। वरना पेमेंट अटक सकता है।",
  "Enter your name exactly as on your bank account — a mismatch can hold your payment.",
  [("hl", 0.4, 340, 230, 600, 40, 2.0), ("zoom", 2.2, 340, 385, 1.5, 3.2)] + tapgo(2.6, 640, 385) + typ(2.9, "pname", "Rahul Sharma", cps=7),
  panel=P("STEP 5", f"Payee {Y('information')}"), b="Name = exactly as in your bank account", pad=0.35)
B("पता और पिन कोड सही डालिए — गूगल इसी पते पर छह अंकों का पिन डाक से भेजता है।",
  "Enter your real address and PIN code — Google mails a 6-digit PIN here when you reach the threshold.",
  [("tap", 0.4, 640, 457)] + typ(0.5, "paddr", "12, MG Road, Sector 5", cps=11) + [("tap", 2.6, 485, 529)] + typ(2.7, "pcity", "New Delhi", cps=9) +
  [("tap", 3.9, 795, 529)] + typ(4.0, "ppin", "110001", cps=7) + [("set", 5.0, "focus", "")] +
  press(5.2, 430, 606, z=1.5, box=(340, 584, 180, 44), to="studio", after=[("set", .25, "as2", 1), ("sfx", .3, "chime")]),
  b="Real address — the PIN letter comes by post", pad=0.4)
B("बस! ऐडसेंस लिंक हो गया, अब यूट्यूब आपका चैनल रिव्यू करेगा। पिन और बैंक सेटअप — फ़ुल वीडियो में बताऊँगा।",
  "Done! AdSense is linked and YouTube will review your channel. PIN & bank setup — in the full video.",
  [("conf", 0.0), ("hl", 0.8, 280, 462, 960, 96, 1.8), ("hl", 2.8, 280, 558, 960, 96, 2.0)],
  panel=P("DONE 🎉", f"AdSense {Y('linked!')}", "Next: PIN verification &amp; bank account", kc="#1fb866"), pad=1.0)

if __name__ == "__main__":
    M.main()
