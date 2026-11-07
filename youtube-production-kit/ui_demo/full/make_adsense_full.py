#!/usr/bin/env python3
"""Full AdSense for YouTube tutorial (PC version, ~13 min). Reuses make_full's helpers and builder.
Run: SHIFT=0 OUT_SUB=adsense_full TL_NAME=timeline_deskfull.js FIRST_SCREEN=studio KOKORO_DIR=... python make_adsense_full.py"""
import make_full as M
from make_full import B, P, Y, press, tapgo, typ
M.BEATS.clear()
G = "#1fb866"; R = "#e0002b"
def bl(*items, start=0.8, step=1.4):
    M.BEATS[-1]["bl"] = [(start + i * step, t[0] if isinstance(t, tuple) else t, isinstance(t, tuple)) for i, t in enumerate(items)]

# ---- Intro ----
B("यूट्यूब से पैसे कमाने का सपना हर क्रिएटर का होता है। लेकिन ये पैसा आपके बैंक तक पहुँचता कैसे है? इसका जवाब है — गूगल ऐडसेंस।",
  "Every creator dreams of earning from YouTube. But how does the money reach your bank? The answer: Google AdSense.",
  panel=P("ADSENSE · FULL GUIDE 2026", f"Set Up {Y('AdSense')} for YouTube", "From applying to your first payment"), ch="Introduction")
B("इस वीडियो में मैं आपको शुरू से आख़िर तक पूरा प्रोसेस दिखाऊँगा — पार्टनर प्रोग्राम के लिए अप्लाई करना, ऐडसेंस अकाउंट बनाना, पिन वेरिफ़िकेशन, बैंक अकाउंट जोड़ना, और टैक्स की जानकारी भरना।",
  "I'll show the whole process: applying to the Partner Program, creating AdSense, PIN verification, adding your bank and tax info.",
  panel=P("WHAT YOU'LL LEARN", f"The {Y('complete')} process"), pad=0.4)
bl("Apply to the Partner Program", "Create your AdSense account", "Verify your address (PIN)", "Add your bank account", "Submit US tax info", start=0.8, step=1.5)
B("और हर स्टेप पर बताऊँगा कि लोग कहाँ गलती करते हैं, ताकि आपका पेमेंट कभी न अटके। तो चलिए, शुरू करते हैं।",
  "And I'll show where people go wrong, so your payment never gets stuck. Let's begin.", pad=1.0)

# ---- Ch1 money flow ----
B("सबसे पहले समझिए कि पैसा आता कैसे है। यूट्यूब आपकी वीडियो पर ऐड दिखाता है, और उस कमाई का एक हिस्सा आपको देता है।",
  "First, how the money flows: YouTube shows ads on your videos and shares part of that revenue with you.",
  panel=P("CHAPTER 1", f"How YouTube {Y('pays you')}"), b="YouTube shows ads → you get a share", ch="How YouTube Pays You")
B("ये कमाई सीधे आपके बैंक में नहीं आती। पहले ये 'ऐडसेंस फ़ॉर यूट्यूब' अकाउंट में जमा होती है, और वहाँ से हर महीने आपके बैंक में भेजी जाती है।",
  "It doesn't go straight to your bank. It collects in your AdSense for YouTube account, then gets sent to your bank every month.")
bl("Earnings collect in AdSense for YouTube", "AdSense pays your bank, monthly", start=1.6, step=3.2)
B("अब ये हिस्सा कितना होता है? लंबी वीडियो पर ऐड की कमाई का लगभग पचपन प्रतिशत आपको मिलता है, और शॉर्ट्स पर पैंतालीस प्रतिशत।",
  "How big is your share? About 55% of the ad revenue on long videos, and 45% on Shorts.", panel=P("YOUR SHARE", f"{Y('55%')} long videos · {Y('45%')} Shorts"))
B("कमाई इस पर भी निर्भर करती है कि आपका टॉपिक क्या है, और आपके दर्शक किस देश से हैं — इसलिए हर चैनल की कमाई अलग-अलग होती है।",
  "Earnings also depend on your topic and where your viewers are — so every channel earns differently.", b="Topic + audience country affect earnings")
B("इसलिए ऐडसेंस को बस एक फ़ॉर्म मत समझिए — ये आपकी कमाई का लॉकर है। इसमें भरी हर जानकारी बिल्कुल सही होनी चाहिए।",
  "So don't treat AdSense as just a form — it's the locker for your earnings. Every detail in it must be correct.", b="Every detail must be correct", pad=1.0)

# ---- Ch2 eligibility ----
B("अब सवाल — ऐडसेंस कब बनाएँ? जब आपका चैनल यूट्यूब पार्टनर प्रोग्राम, यानी वाई-पी-पी, के लिए एलिजिबल हो जाए। यूट्यूब स्टूडियो में बाईं तरफ़ 'अर्न' पर क्लिक कीजिए।",
  "When should you set up AdSense? Once your channel is eligible for the YouTube Partner Program (YPP). In YouTube Studio, click Earn on the left.",
  [("zoom", "e-1.6", 120, 594, 1.6, 1.6), ("hl", "e-1.1", 8, 572, 224, 44, 1.2), ("tap", "e-0.2", 120, 594), ("set", "e-0.05", "stab", "earn")],
  panel=P("CHAPTER 2", f"Are you {Y('eligible?')}", "YouTube Partner Program (YPP)"), ch="YPP Eligibility (2026)", pad=1.0)
B("यहाँ आपको अपने चैनल की प्रोग्रेस दिखती है। अभी के नियमों में पार्टनर प्रोग्राम के दो लेवल हैं।",
  "Here you can see your channel's progress. Under current rules, the Partner Program has two levels.",
  [("hl", 0.5, 280, 220, 960, 130, 3.4), ("zoom", 0.3, 760, 285, 1.3, 3.0)])
B("पहला लेवल — पाँच सौ सब्सक्राइबर्स, पिछले नब्बे दिनों में तीन पब्लिक वीडियो, और साथ में या तो पिछले बारह महीनों में तीन हज़ार घंटे का वॉच टाइम, या नब्बे दिनों में तीस लाख शॉर्ट्स व्यूज़।",
  "Level 1: 500 subscribers, 3 public uploads in 90 days, plus 3,000 watch hours in 12 months or 3M Shorts views in 90 days.",
  panel=P("LEVEL 1 · FAN FUNDING", f"{Y('500')} subscribers"))
bl("3 public uploads (last 90 days)", "3,000 watch hours (12 months)", "or 3M Shorts views (90 days)", start=2.6, step=2.6)
B("इसमें मेंबरशिप और सुपर थैंक्स जैसी फ़ैन फ़ंडिंग मिलती है — लेकिन ऐड से कमाई नहीं।",
  "This unlocks fan funding like memberships and Super Thanks — but not ad revenue.", b=("No ad revenue at this level", True))
B("ऐड से कमाई के लिए दूसरा लेवल चाहिए — एक हज़ार सब्सक्राइबर्स, और या तो पिछले बारह महीनों में चार हज़ार घंटे का वॉच टाइम, या नब्बे दिनों में एक करोड़ शॉर्ट्स व्यूज़।",
  "For ad revenue you need level 2: 1,000 subscribers plus 4,000 watch hours in 12 months, or 10M Shorts views in 90 days.",
  [("hl", 2.0, 300, 290, 920, 58, 3.4), ("zoom", 1.8, 760, 300, 1.35, 3.2)], panel=P("LEVEL 2 · AD REVENUE", f"{Y('1,000')} subscribers"))
bl("4,000 watch hours (12 months)", "or 10M Shorts views (90 days)", start=3.2, step=2.8)
B("वॉच टाइम में सिर्फ़ पब्लिक लंबी वीडियो के घंटे गिने जाते हैं। शॉर्ट्स, प्राइवेट, अनलिस्टेड या डिलीट की हुई वीडियो के घंटे इसमें नहीं जुड़ते।",
  "Only public long-form watch hours count — not Shorts, private, unlisted or deleted videos.", b="Only public long-video hours count")
B("और अगर अभी एलिजिबल नहीं हैं, तो इसी पेज पर 'गेट नोटिफ़ाइड' पर क्लिक कर दीजिए — लिमिट पूरी होते ही यूट्यूब आपको ईमेल कर देगा।",
  "Not eligible yet? Click 'Get notified' on this page and YouTube will email you once you are.", b="Not yet? Click 'Get notified'")
B("ध्यान रखिए, वॉच टाइम और शॉर्ट्स व्यूज़ आपस में नहीं जुड़ते — दोनों में से कोई एक पूरा करना होगा। और यूट्यूब ये नियम समय-समय पर बदलता है, इसलिए स्टूडियो में ज़रूर चेक कीजिए।",
  "Watch hours and Shorts views don't add up — complete one of them. YouTube changes these rules over time, so always check in Studio.",
  b="Rules change — always check Studio", pad=1.0)

# ---- Ch3 before applying ----
B("अप्लाई करने से पहले तीन चीज़ें पक्की कर लीजिए।",
  "Before applying, make sure of three things.", panel=P("CHAPTER 3", f"Before you {Y('apply')}"), ch="Before You Apply", pad=0.5)
B("पहली — आपके गूगल अकाउंट में टू-स्टेप वेरिफ़िकेशन ऑन होना चाहिए।",
  "One: 2-Step Verification must be on for your Google account.", b="2-Step Verification ON")
B("दूसरी — चैनल पर कोई एक्टिव कम्युनिटी गाइडलाइन स्ट्राइक नहीं होनी चाहिए।",
  "Two: no active Community Guidelines strikes on your channel.", b="No active strikes")
B("और तीसरी, सबसे ज़रूरी — कंटेंट ओरिजिनल होना चाहिए। दूसरों की वीडियो या बार-बार एक जैसा कंटेंट डालने पर, यानी 'रीयूज़्ड कंटेंट' की वजह से, सबसे ज़्यादा चैनल रिजेक्ट होते हैं।",
  "Three, most important: original content. 'Reused content' is the most common reason channels get rejected.", b="Original content — no reused content", pad=1.0)
B("रिव्यू में यूट्यूब आपका पूरा चैनल देखता है — चैनल का मुख्य टॉपिक, सबसे ज़्यादा देखी गई वीडियो, सबसे नई वीडियो, और टाइटल-डिस्क्रिप्शन भी।",
  "Reviewers look at your whole channel: its main theme, most-viewed and newest videos, and titles and descriptions too.",
  panel=P("WHAT REVIEWERS CHECK", f"Your {Y('whole channel')}"))
bl("Main theme of the channel", "Most-viewed videos", "Newest videos", "Titles, thumbnails, descriptions", start=1.6, step=1.6)
B("इसलिए अप्लाई करने से पहले, पुरानी कॉपी की हुई वीडियो, या गलत टाइटल वाली वीडियो — हटा दीजिए, या प्राइवेट कर दीजिए।",
  "So before applying, delete or make private any old copied videos or misleading titles.", b="Clean up copied / misleading videos", pad=1.0)

# ---- Ch4 terms ----
B("सब ठीक है? तो अब अप्लाई करते हैं। पहला स्टेप है — पार्टनर प्रोग्राम की शर्तें। 'रिव्यू पार्टनर प्रोग्राम टर्म्स' के आगे 'स्टार्ट' पर क्लिक कीजिए।",
  "All set? Let's apply. Step one is the Partner Program terms — click START next to 'Review Partner Program terms'.",
  [("hl", 0.6, 280, 366, 960, 96, 2.4)] + press(("e", -1.2), 1166, 414, z=1.6, box=(1106, 394, 120, 40), after=[("set", .1, "termsmodal", 1)]),
  panel=P("CHAPTER 4 · APPLY", f"Step 1: {Y('Accept the terms')}"), ch="Apply: Accept the YPP Terms", pad=0.8)
B("इनमें बताया गया है कि यूट्यूब कमाई कैसे बाँटता है, और आपको किन नियमों का पालन करना है। एक बार ध्यान से पढ़िए, फिर 'एक्सेप्ट' कीजिए।",
  "They explain how revenue is shared and which rules you must follow. Read them once, then click Accept.",
  [("hl", 0.5, 340, 160, 600, 480, 2.6)] + press(("e", -1.0), 855, 596, z=1.5, box=(800, 576, 110, 40), after=[("set", .1, "termsmodal", 0), ("set", .1, "s1", 1), ("sfx", .1, "ping")]), pad=1.0)

# ---- Ch5 AdSense sign-up ----
B("अब दूसरा स्टेप — 'साइन अप फ़ॉर ऐडसेंस फ़ॉर यूट्यूब'। यहाँ 'स्टार्ट' पर क्लिक कीजिए।",
  "Step two: Sign up for AdSense for YouTube. Click START.",
  [("hl", 0.4, 280, 462, 960, 96, 1.8)] + press(("e", -1.0), 1166, 510, z=1.6, box=(1106, 490, 120, 40), to="gacct"),
  panel=P("CHAPTER 5", f"Step 2: {Y('Sign up for AdSense')}"), ch="Create Your AdSense Account", pad=0.8)
B("अब गूगल अकाउंट चुनने को कहा जाएगा। यहाँ एक बहुत ज़रूरी नियम है — एक नाम पर सिर्फ़ एक ही ऐडसेंस अकाउंट हो सकता है।",
  "Now pick a Google account. A key rule: only one AdSense account is allowed per payee name.",
  [("hl", 1.0, 330, 384, 620, 66, 2.4), ("zoom", 0.8, 640, 417, 1.4, 2.6)], b="One payee name = one AdSense account")
B("अगर आपका पहले से ऐडसेंस अकाउंट है — जैसे किसी वेबसाइट के लिए — तो नया मत बनाइए। उसी जीमेल को चुनिए, और पुराना अकाउंट ही लिंक कर दीजिए।",
  "Already have AdSense, say for a website? Don't create a new one — choose that Gmail and link the existing account.", b="Already have one? Link it")
B("मेरे पास पहले से नहीं है, तो मैं अपने चैनल वाला अकाउंट चुनता हूँ।",
  "I don't have one, so I'll pick my channel's account.", tapgo(("e", 0.1), 640, 417, to="ads1", box=(330, 384, 620, 66)), pad=1.0)
B("यहाँ आपका चैनल अपने आप भरा होता है। अब देश में 'इंडिया' चुनिए — ये बाद में बदला नहीं जा सकता, इसलिए ध्यान से।",
  "Your channel is already filled in. Choose India as the country — it can't be changed later, so be careful.",
  [("hl", 0.4, 340, 240, 600, 58, 1.8), ("hl", 2.6, 340, 320, 600, 58, 1.6), ("zoom", 2.2, 640, 349, 1.4, 2.4), ("tap", 3.0, 640, 349), ("set", 3.2, "country", "India")],
  b="Country can't be changed later")
B("फिर टर्म्स पढ़कर टिक कीजिए, और 'कंटिन्यू' पर क्लिक कीजिए।",
  "Then accept the terms and click Continue.",
  [("tap", 1.2, 351, 417), ("set", 1.3, "agree", 1)] + tapgo(("e", 0.3), 430, 494, to="ads2", box=(340, 472, 180, 44)), pad=1.0)

# ---- Ch6 payee ----
B("अब पेई इन्फ़ॉर्मेशन — यानी जिसे पैसा मिलेगा, उसकी जानकारी। अकाउंट टाइप 'इंडिविजुअल' ही रखिए।",
  "Now the payee information — details of who gets paid. Keep the account type as Individual.",
  [("hl", 1.6, 340, 284, 600, 58, 2.0)], panel=P("CHAPTER 6", f"Payee {Y('information')}"), ch="Payee Information")
B("नाम बिल्कुल वैसा लिखिए, जैसा आपके बैंक अकाउंट में है — स्पेलिंग तक एक जैसी। नाम मैच नहीं हुआ, तो पेमेंट होल्ड पर चला जाता है।",
  "Type your name exactly as in your bank account — same spelling. A mismatch puts your payment on hold.",
  [("hl", 0.4, 340, 230, 600, 40, 1.8), ("zoom", 2.2, 340, 385, 1.5, 3.4)] + tapgo(2.6, 640, 385) + typ(2.9, "pname", "Rahul Sharma", cps=7),
  b="Name exactly as in your bank")
B("पता वही डालिए जहाँ आप सच में रहते हैं, और जहाँ डाक आती है — क्योंकि गूगल यहीं एक पिन वाली चिट्ठी भेजेगा। पी-ओ बॉक्स का पता मत डालिए।",
  "Use the address where you actually live and get post — Google will mail a PIN letter here. No P.O. box.",
  [("tap", 0.6, 640, 457)] + typ(0.7, "paddr", "12, MG Road, Sector 5", cps=10) + [("tap", 3.2, 485, 529)] + typ(3.3, "pcity", "New Delhi", cps=8) +
  [("tap", 4.8, 795, 529)] + typ(4.9, "ppin", "110001", cps=6) + [("set", 6.2, "focus", "")], b="Real address — no P.O. box")
B("अगर फ़ोन नंबर माँगा जाए, तो अपना चालू नंबर डालिए — वेरिफ़िकेशन का कोड उसी पर आ सकता है।",
  "If a phone number is asked, enter your active number — a verification code may be sent to it.", b="Active phone number")
B("सब कुछ एक बार चेक कीजिए, और 'सबमिट' कर दीजिए।",
  "Check everything once, then click Submit.",
  press(("e", -0.4), 430, 606, z=1.5, box=(340, 584, 180, 44), to="studio", after=[("set", .25, "as2", 1), ("sfx", .3, "chime")]), pad=1.4)

# ---- Ch7 review ----
B("बढ़िया! ऐडसेंस लिंक हो गया। अब तीसरा स्टेप है — 'गेट रिव्यूड'। यूट्यूब की टीम आपके चैनल को देखेगी।",
  "AdSense is linked. Step three: Get reviewed — YouTube's team will look at your channel.",
  [("hl", 0.6, 280, 462, 960, 96, 1.6), ("hl", 2.6, 280, 558, 960, 96, 2.2)],
  panel=P("CHAPTER 7", f"Step 3: {Y('Get reviewed')}"), ch="Review & Approval")
B("इसमें आम तौर पर लगभग एक महीना लगता है। इस दौरान वीडियो डालते रहिए, और नियमों का पालन कीजिए।",
  "This usually takes about a month. Keep uploading and follow the rules meanwhile.", b="Review: usually about a month")
B("रिव्यू का स्टेटस आप स्टूडियो के इसी 'अर्न' पेज पर देख सकते हैं — और फ़ैसला होते ही यूट्यूब आपको ईमेल भी करता है।",
  "You can track the review on this same Earn page — and YouTube emails you the decision.", b="Track status on the Earn page")
B("अगर रिजेक्ट हो जाए, तो घबराइए मत। इक्कीस दिनों के अंदर अपील कर सकते हैं, या तीस दिन बाद, कंटेंट सुधारकर दोबारा अप्लाई कर सकते हैं।",
  "If rejected, don't panic: appeal within 21 days, or improve your content and reapply after 30 days.", b="Rejected? Appeal (21 days) or reapply (30 days)")
B("और जब अप्रूव हो जाएगा — तो कुछ ऐसा दिखेगा! अब आपकी वीडियो पर ऐड चलने लगेंगे।",
  "And once you're approved, you'll see this! Ads can now run on your videos.",
  [("set", 2.2, "approved", 1), ("conf", 2.2), ("sfx", 2.2, "chime")],
  panel=P("APPROVED 🎉", f"You're in the {Y('Partner Program!')}", kc=G), pad=1.6)

# ---- Ch8 PIN ----
B("अब आता है अगला ज़रूरी स्टेप — पिन वेरिफ़िकेशन। इसके लिए ऐडसेंस फ़ॉर यूट्यूब खोलिए।",
  "Next important step: PIN verification. Open AdSense for YouTube.",
  [("scr", "e+0.1", "adhome")], panel=P("CHAPTER 8", f"Verify your {Y('address (PIN)')}"), ch="PIN Verification", pad=0.8)
B("जब आपकी कमाई एक छोटी सी लिमिट पार कर लेती है, तो गूगल आपके पते पर छह अंकों का पिन डाक से भेजता है। ये चिट्ठी आने में आम तौर पर दो से चार हफ़्ते लगते हैं।",
  "Once your earnings pass a small threshold, Google posts a 6-digit PIN to your address. It usually takes 2–4 weeks to arrive.",
  [("hl", 0.6, 240, 270, 1020, 80, 3.0), ("zoom", 0.4, 750, 310, 1.3, 3.0)], b="6-digit PIN by post (2–4 weeks)")
B("चिट्ठी आ जाए, तो यहाँ 'वेरिफ़ाई एड्रेस' पर क्लिक कीजिए, और अपना पिन डालिए।",
  "When it arrives, click Verify address and enter your PIN.",
  press(0.6, 1170, 310, z=1.6, box=(1090, 290, 160, 40), after=[("set", .1, "pinmodal", 1)]) + [("tap", "e+0.0", 640, 404)] + typ(("e", 0.2), "pin", "482915", cps=4), pad=1.0)
B("सबमिट करते ही पता वेरिफ़ाई हो जाता है। ध्यान रखिए — पिन डालने के लिए चार महीने मिलते हैं, और तीन बार गलत पिन डाला तो पेमेंट रुक सकता है। चिट्ठी न आए, तो ऐडसेंस से नया पिन मँगवा सकते हैं।",
  "Submit, and your address is verified. You get 4 months to enter the PIN; 3 wrong tries can stop payments. No letter? Request a new PIN in AdSense.",
  [("set", 0.2, "focus", ""), ("tap", 0.8, 805, 506), ("set", 1.0, "pinmodal", 0), ("set", 1.0, "pinok", 1), ("sfx", 1.0, "ping")],
  panel=P("PIN RULES", f"Don't {Y('lose')} the PIN"))
bl("4 months to enter it", ("3 wrong tries can stop payments", True), "No letter? Request a new PIN", start=3.0, step=3.0)
B("पिन वाली चिट्ठी गूगल की तरफ़ से एक साधारण सी चिट्ठी होती है। इसे फेंकिए मत — कई लोग इसे विज्ञापन समझकर फेंक देते हैं।",
  "The PIN arrives as a plain letter from Google. Don't throw it away — many people mistake it for junk mail.", b="Plain letter from Google — keep it", pad=1.0)

# ---- Ch9 bank ----
B("अब बैंक अकाउंट जोड़ते हैं। बाईं तरफ़ 'पेमेंट्स' पर क्लिक कीजिए।",
  "Now let's add your bank account. Click Payments on the left.",
  tapgo(("e", -0.4), 122, 224, to="adpay", box=(12, 204, 208, 40)),
  panel=P("CHAPTER 9", f"Add your {Y('bank account')}"), ch="Add Your Bank Account", pad=1.0)
B("यहाँ 'हाउ यू गेट पेड' में 'ऐड पेमेंट मेथड' पर क्लिक कीजिए। भारत में पैसा सीधे आपके बैंक अकाउंट में आता है।",
  "Under How you get paid, click Add payment method. In India, money comes straight into your bank account.",
  press(("e", -1.4), 857, 366, z=1.6, box=(757, 346, 200, 40), after=[("set", .1, "bankform", 1)]), pad=1.0)
B("अकाउंट होल्डर का नाम — वही, जो ऐडसेंस में डाला था। फिर बैंक का नाम, और आई-एफ़-एस-सी कोड, जो आपकी पासबुक या चेकबुक पर लिखा होता है।",
  "Account holder name — the same as in AdSense. Then the bank name and IFSC code, found on your passbook or cheque book.",
  [("tap", 0.4, 640, 203)] + typ(0.5, "bname", "Rahul Sharma", cps=8) + [("tap", 3.4, 640, 265)] + typ(3.5, "bbank", "State Bank of India", cps=10) +
  [("tap", 6.4, 640, 327)] + typ(6.5, "bifsc", "SBIN0001234", cps=7), b="Same name as in AdSense")
B("अब अकाउंट नंबर दो बार डालिए, 'सेट ऐज़ प्राइमरी' पर टिक कीजिए, और 'सेव' कर दीजिए।",
  "Enter the account number twice, tick Set as primary, and click Save.",
  [("tap", 0.3, 640, 389)] + typ(0.4, "bacc", "30012345674321", cps=9) + [("tap", 2.3, 640, 451)] + typ(2.4, "bacc2", "30012345674321", cps=9) +
  [("set", 4.2, "focus", ""), ("tap", 4.4, 391, 507), ("set", 4.5, "primary", 1)] +
  press(("e", 0.1), 845, 602, z=1.5, box=(790, 582, 110, 40), after=[("set", .1, "bankform", 0), ("set", .1, "bankok", 1), ("sfx", .2, "ping")]),
  b="IFSC + account number (twice)", pad=1.2)
B("ध्यान रखिए — बैंक अकाउंट आपके अपने नाम पर होना चाहिए, वही नाम जो ऐडसेंस में है। किसी और के अकाउंट में पेमेंट मत मँगवाइए।",
  "Remember: the bank account must be in your own name — the same as in AdSense. Never use someone else's account.", b=("Someone else's bank account", True))
B("पैसा डॉलर में भेजा जाता है, और आपके बैंक में रुपयों में बदलकर आता है। इस पर बैंक थोड़ा सा चार्ज भी काट सकता है।",
  "Money is sent in dollars and arrives in your bank converted to rupees; your bank may deduct a small fee.", b="Sent in $ → arrives in ₹", pad=1.0)

# ---- Ch10 tax ----
B("अब वो स्टेप, जिसे ज़्यादातर लोग भूल जाते हैं — यू-एस टैक्स इन्फ़ो। अमेरिका के दर्शकों से होने वाली कमाई पर अमेरिका में टैक्स कटता है।",
  "Next, the step most people skip: US tax info. Earnings from US viewers are taxed in the US.",
  [("hl", 0.8, 240, 440, 980, 80, 2.0)] + tapgo(("e", 0.0), 1123, 480, to="adtax", box=(1048, 460, 160, 40)),
  panel=P("CHAPTER 10", f"US {Y('tax info')}"), ch="US Tax Info (Save Tax)", pad=1.0)
B("अगर ये जानकारी नहीं भरी, तो आपकी पूरी कमाई से चौबीस प्रतिशत तक कट सकता है। लेकिन भरने पर, भारत और अमेरिका की टैक्स संधि की वजह से, सिर्फ़ अमेरिका वाली कमाई पर पंद्रह प्रतिशत कटता है।",
  "If it's missing, up to 24% of your total earnings can be withheld. With it, thanks to the India–US treaty, only US-viewer earnings are taxed at 15%.",
  [("hl", 0.6, 240, 270, 1020, 80, 2.6), ("zoom", 0.4, 750, 302, 1.3, 3.4)], panel=P("WHY IT MATTERS", f"{Y('24%')} vs {Y('15%')}"))
bl(("Not submitted: up to 24% of ALL earnings", True), "Submitted: 15% on US-viewer earnings only", start=1.2, step=5.0)
B("'ऐड टैक्स इन्फ़ो' पर क्लिक कीजिए। इंडिविजुअल चुनिए, यू-एस पर्सन में 'नो' — और आपका फ़ॉर्म होगा डब्ल्यू-एट-बी-ई-एन।",
  "Click Add tax info. Choose Individual, US person: No — your form is W-8BEN.",
  [("tap", 0.6, 1173, 310), ("set", 0.8, "taxform", 1), ("tap", 2.6, 970, 373), ("set", 2.7, "t1", 1), ("tap", 4.4, 970, 419), ("set", 4.5, "t2", 1),
   ("tap", "e-0.2", 970, 465), ("set", "e-0.1", "t3", 1)], b="Form: W-8BEN", pad=1.0)
B("टैक्स ट्रीटी में 'इंडिया' और आर्टिकल बारह चुनिए, अपना पैन नंबर डालिए, और अपना नाम लिखकर सबमिट कर दीजिए।",
  "Claim treaty benefits for India, Article 12, enter your PAN, sign with your name and submit.",
  [("tap", 1.0, 970, 511), ("set", 1.1, "t4", 1), ("tap", 3.0, 970, 557)] + typ(3.1, "pan", "ABCDE1234F", cps=7) + [("tap", 4.8, 900, 603)] + typ(4.9, "tsign", "Rahul Sharma", cps=8) +
  [("set", 6.6, "focus", "")] + press(("e", 0.3), 1125, 607, z=1.5, box=(1060, 587, 130, 40), after=[("set", .1, "taxform", 0), ("set", .1, "taxok", 1), ("sfx", .2, "chime")]),
  b="India · Article 12 · PAN", pad=1.2)
B("बस — अब अमेरिका वाली कमाई पर सिर्फ़ पंद्रह प्रतिशत कटेगा। ये टैक्स आप भारत में अपने आई-टी-आर में क्रेडिट के रूप में ले सकते हैं — इसके लिए अपने सी-ए से बात कर लीजिए।",
  "Done — only 15% is now withheld on US earnings. You can claim it as a credit in your Indian tax return — ask your CA.",
  [("hl", 0.6, 240, 270, 1020, 80, 2.6)], b="Claim it as credit in your ITR (ask a CA)", pad=1.0)

# ---- Ch11 payments ----
B("अब सबसे मज़ेदार सवाल — पैसा कब आएगा? हर महीने की शुरुआत में पिछले महीने की कमाई फ़ाइनल होती है।",
  "Now the fun question: when do you get paid? At the start of each month, last month's earnings are finalised.",
  [("scr", 0.5, "adpay")], panel=P("CHAPTER 11", f"When do you {Y('get paid?')}"), ch="Payment Threshold & Dates")
B("अगर आपका बैलेंस पेमेंट थ्रेशोल्ड, यानी लगभग सौ डॉलर, पार कर गया है, और कोई होल्ड नहीं है, तो पेमेंट हर महीने की इक्कीस से छब्बीस तारीख़ के बीच आ जाता है।",
  "If your balance is over the payment threshold — about $100 — with no holds, you're paid between the 21st and 26th of the month.",
  [("hl", 0.6, 240, 270, 480, 150, 2.6), ("zoom", 0.4, 480, 345, 1.35, 3.0), ("hl", 4.4, 740, 270, 480, 150, 2.6)])
bl("Threshold ≈ $100 (₹ amount varies)", "Paid between the 21st and 26th", start=1.0, step=3.6)
B("जैसे — अक्टूबर की कमाई नवंबर की शुरुआत में फ़ाइनल होगी, और अगर थ्रेशोल्ड पार है, तो इक्कीस से छब्बीस नवंबर के बीच आपके बैंक में आ जाएगी।",
  "For example: October's earnings are finalised in early November and reach your bank around 21–26 November.", b="Oct earnings → paid ~21–26 Nov")
B("और अगर सौ डॉलर नहीं हुए, तो कमाई अगले महीने में जुड़ती रहती है — कुछ भी नहीं खोता।",
  "Below the threshold? Your earnings simply roll over to next month — nothing is lost.", b="Below threshold → rolls over", pad=1.0)
B("और अगर कभी पेमेंट अटक जाए, तो ऐडसेंस में 'पेमेंट होल्ड' वाला मैसेज देखिए — ज़्यादातर बार वजह पिन, टैक्स इन्फ़ो, या बैंक डिटेल्स में गलती होती है।",
  "If a payment ever gets stuck, look for a 'payment hold' message in AdSense — usually it's the PIN, tax info or bank details.", b="Stuck? Check for a payment hold", pad=1.0)

# ---- Ch12 mistakes + recap ----
B("आख़िर में, वो गलतियाँ जिनसे पेमेंट अटकता है। पहली — दूसरा ऐडसेंस अकाउंट बना लेना।",
  "Finally, the mistakes that block payments. One: creating a second AdSense account.",
  panel=P("AVOID THESE", f"Mistakes that {Y('block payments')}", kc=R), b=("A second AdSense account", True), ch="Mistakes to Avoid & Recap")
B("दूसरी — ऐडसेंस और बैंक में अलग-अलग नाम। और तीसरी — गलत पता, जिससे पिन ही नहीं आता।",
  "Two: different names in AdSense and the bank. Three: a wrong address, so the PIN never arrives.")
bl(("Name mismatch: AdSense vs bank", True), ("Wrong address → no PIN", True), start=0.5, step=3.2)
B("और चौथी — टैक्स इन्फ़ो न भरना, जिससे बेवजह ज़्यादा टैक्स कटता है।",
  "Four: skipping tax info, so extra tax gets deducted.", b=("No tax info → extra tax", True), pad=1.0)
B("और एक सुरक्षा टिप — 'ऐडसेंस अप्रूवल' या 'जल्दी मोनेटाइज़ेशन' का दावा करने वालों से बचिए। अपना ऐडसेंस या जीमेल का पासवर्ड कभी किसी को मत दीजिए।",
  "A safety tip: avoid anyone promising 'AdSense approval' or fast monetization. Never share your AdSense or Gmail password.",
  panel=P("STAY SAFE", f"Never share your {Y('password')}", kc=R), b=("'Approval' services & password sharing", True), pad=1.0)
B("तो एक बार दोहरा लेते हैं — एलिजिबिलिटी, टर्म्स, ऐडसेंस अकाउंट, रिव्यू, पिन वेरिफ़िकेशन, बैंक अकाउंट, और टैक्स इन्फ़ो।",
  "Quick recap: eligibility, terms, AdSense account, review, PIN, bank account and tax info.",
  panel=P("RECAP", f"Your AdSense {Y('checklist')}"))
bl("Eligible for YPP", "Terms accepted + AdSense linked", "PIN verified", "Bank account added", "US tax info submitted", start=1.0, step=1.3)
B("अगर इस वीडियो से आपको मदद मिली, तो लाइक कीजिए, चैनल सब्सक्राइब कीजिए, और कोई सवाल हो तो कमेंट में पूछिए — मैं जवाब दूँगा। मिलते हैं अगली वीडियो में!",
  "Found this helpful? Like, subscribe, and ask any question in the comments — I'll reply. See you in the next video!",
  panel=P("THANK YOU", f"👍 Like · 🔔 {Y('Subscribe')} · 💬 Comment"), pad=float(__import__("os").environ.get("END_PAD", "2.0")))

if __name__ == "__main__":
    M.main()
