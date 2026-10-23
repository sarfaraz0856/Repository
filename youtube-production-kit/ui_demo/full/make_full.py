#!/usr/bin/env python3
"""Full tutorial builder: script (Hindi VO + English captions + on-phone actions) -> Kokoro TTS at 1.15x
-> timeline.js for engine.js, full soundtrack (voice + SFX + ducked music, -14 LUFS) and chapters.json.
Env: KOKORO_DIR (model folder). Run with a Python that has kokoro-onnx, soundfile, numpy."""
import os, json, subprocess
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "video_build", "full"); os.makedirs(OUT, exist_ok=True)
SR = 48000; SPEED = 1.15; VOICE = "hm_omega"; SHIFT = 18   # status-bar shift used by the stage

# ---------------- helpers for the script ----------------
def O(x):  # offset: number = seconds from beat start, "e+0.4" = from end of voice line
    if isinstance(x, tuple): return x
    if isinstance(x, str): return ("e", float(x[1:] or 0))
    return ("s", float(x))
def add(o, d): o = O(o); return (o[0], o[1] + d)
def press(off, x, y, z=1.7, ox=None, oy=None, box=None, to=None, hold=1.3, after=None):
    a = [("zoom", off, ox if ox is not None else x, oy if oy is not None else y, z, hold)]
    if box: a.append(("hl", add(off, .5), *box, hold - .1))
    a.append(("tap", add(off, .6 + hold - .35), x, y))
    if to: a.append(("scr", add(off, .6 + hold + .15), to))
    if after: a += [(k[0], add(off, .6 + hold + k[1]), *k[2:]) for k in after]
    return a
def tapgo(off, x, y, to=None, box=None, extra=()):
    a = []
    if box: a.append(("hl", add(off, -0.6), *box, 1.0))
    a.append(("tap", off, x, y))
    if to: a.append(("scr", add(off, .3), to))
    return a + list(extra)
def typ(off, field, text, cps=9.0, frm=None):
    return [("set", off, "focus", field), ("type", off, field, text, max(.5, len(text) / cps), frm)]

BEATS = []
def B(vo, cap, acts=(), panel=None, b=None, ch=None, pad=0.75):
    BEATS.append(dict(vo=vo, cap=cap, acts=list(acts), panel=panel, b=b, ch=ch, pad=pad))
def P(kick, title, sub="", kc=None): return dict(kick=kick, title=title, sub=sub, kc=kc)
Y = lambda s: f'<span class="y">{s}</span>'

# ======================= SCRIPT =======================
# ---- Chapter 0: Intro ----
B("अगर आप अपना यूट्यूब चैनल शुरू करना चाहते हैं, लेकिन समझ नहीं आ रहा कि शुरुआत कहाँ से करें — तो यह वीडियो बिल्कुल आपके लिए है।",
  "Want to start your own YouTube channel but not sure where to begin? This video is made for you.",
  [("scr", 0, "home")], panel=P("COMPLETE GUIDE · 2026", f"How to Create a {Y('YouTube Channel')} on Your Phone", "From zero to your first upload"), ch="Introduction")
B("आज मैं आपको सिर्फ़ अपने मोबाइल फ़ोन से, बिल्कुल शुरू से, एक प्रोफ़ेशनल यूट्यूब चैनल बनाकर दिखाऊँगा।",
  "Today I'll show you how to build a professional YouTube channel from scratch — using only your phone.")
B("और सिर्फ़ ये नहीं कि कौन सा बटन दबाना है — बल्कि हर स्टेप क्यों ज़रूरी है, वो भी समझाऊँगा। ताकि आप वो गलतियाँ न करें, जो ज़्यादातर नए क्रिएटर्स करते हैं।",
  "Not just which button to tap — I'll explain why each step matters, so you avoid the mistakes most beginners make.")
B("इस वीडियो में हम चैनल का नाम, हैंडल, प्रोफ़ाइल फ़ोटो, बैनर, डिस्क्रिप्शन, ज़रूरी सेटिंग्स, और आपकी पहली वीडियो — सब कुछ एक-एक करके करेंगे।",
  "We'll cover the name, handle, profile photo, banner, description, key settings and your first upload — one by one.",
  panel=P("WHAT YOU'LL LEARN", f"Everything, {Y('step by step')}"), pad=0.4)
for i, t in enumerate(["Channel name &amp; @handle", "Profile photo &amp; banner", "Description &amp; links", "Security &amp; key settings", "First upload &amp; ranking tips"]):
    BEATS[-1].setdefault("bl", []).append((0.6 + i * 1.2, t, False))
B("तो वीडियो को आख़िर तक ज़रूर देखिए — क्योंकि आख़िर में मैं वो टिप्स बताऊँगा, जिनसे आपकी वीडियो रैंक करने में मदद मिलती है।",
  "Watch till the end — I'll share the tips that actually help your videos rank.", pad=1.0)

# ---- Chapter 1: Google account vs channel ----
B("चलिए, शुरू करते हैं। सबसे पहले एक बात साफ़ कर लेते हैं — गूगल अकाउंट और यूट्यूब चैनल, ये दो अलग-अलग चीज़ें हैं।",
  "Let's start. First, an important point: a Google account and a YouTube channel are two different things.",
  panel=P("CHAPTER 1", f"Google Account vs {Y('YouTube Channel')}"), ch="Google Account vs YouTube Channel")
B("गूगल अकाउंट, यानी आपकी जीमेल आईडी — ये आपकी पहचान है। इससे आप यूट्यूब पर वीडियो देख सकते हैं, लाइक और कमेंट कर सकते हैं।",
  "Your Google account — your Gmail — is your identity. With it you can watch, like and comment.", b="Google account = your login (Gmail)")
B("लेकिन वीडियो अपलोड करने के लिए, उसी अकाउंट के अंदर एक चैनल बनाना पड़ता है। चैनल ही वो चीज़ है, जो दुनिया को दिखती है।",
  "But to upload videos, you create a channel inside that account. The channel is what the world sees.", b="Channel = your public identity")
B("अब एक प्रो टिप — अगर आगे चलकर कोई टीम या एडिटर भी आपका चैनल संभालेगा, तो कंप्यूटर से 'ब्रांड अकाउंट' वाला चैनल बनाना बेहतर रहता है।",
  "Pro tip: if a team or editor will manage your channel later, a Brand Account channel — made on a computer — is better.", b="Team later? → Brand Account")
B("लेकिन अगर आप अकेले शुरू कर रहे हैं, तो मोबाइल से बना चैनल बिल्कुल ठीक है। आज हम वही बनाएँगे।",
  "Starting on your own? A channel made on your phone is perfectly fine — that's what we'll build today.", b="Solo creator → phone is perfect")
B("बस एक बात पक्की कर लीजिए — जिस जीमेल से चैनल बनाएँगे, उसका पासवर्ड और रिकवरी नंबर आपके पास होना चाहिए। आगे यही आपके चैनल की सुरक्षा करेगा।",
  "Just make sure you know that Gmail's password and recovery number — they'll protect your channel later.", b="Keep password &amp; recovery number ready", pad=1.0)

# ---- Chapter 2: Plan topic & name ----
B("अब चैनल बनाने से पहले, दो मिनट रुककर दो चीज़ें तय कर लीजिए — पहला, आपका टॉपिक; और दूसरा, आपके चैनल का नाम।",
  "Before creating anything, pause and decide two things: your topic and your channel name.",
  panel=P("CHAPTER 2 · PLAN FIRST", f"Pick your {Y('topic')} and {Y('name')}"), ch="Plan Your Topic & Channel Name")
B("टॉपिक यानी आप किस बारे में वीडियो बनाएँगे — जैसे टेक्नोलॉजी, पढ़ाई, कुकिंग या फ़ाइनेंस। जब आप एक टॉपिक पर टिके रहते हैं, तो यूट्यूब को भी समझ आता है कि आपकी वीडियो किसे दिखानी है।",
  "Stick to one topic — tech, study, cooking or finance. Then YouTube understands exactly who to show your videos to.", b="One clear topic")
B("इसके लिए यूट्यूब ऐप खोलिए, और अपना टॉपिक सर्च करके देखिए।",
  "Open the YouTube app and search your topic.",
  press(0.4, 157, 527, z=1.6, box=(119, 490, 76, 76), to="splash") + [("scr", 3.6, "feed")] +
  press(4.6, 386, 53, z=1.8, ox=398, oy=53, box=(366, 33, 40, 40), to="search", hold=1.0) +
  typ(7.3, "q", "tech tips in hindi", cps=8) + [("set", 9.9, "searchRes", 1), ("set", 9.9, "focus", "")], pad=0.9)
B("देखिए — यहाँ आपके टॉपिक वाले चैनल्स और उनके नाम दिख रहे हैं। इससे दो फ़ायदे होते हैं।",
  "Look — here are channels in your topic and the names they use. This helps you in two ways.",
  [("hl", 0.3, 16, 106, 380, 70, 2.2), ("hl", 2.8, 16, 520, 380, 70, 2.0)])
B("एक, आपको आइडिया मिलता है कि लोग कैसे नाम रख रहे हैं। और दो, आप गलती से ऐसा नाम नहीं रखेंगे, जो पहले से किसी बड़े चैनल का हो।",
  "You get naming ideas — and you won't accidentally pick a name a big channel already uses.", b="Research your niche first")
B("अब अच्छा नाम कैसा होना चाहिए? मेरा सीधा फ़ॉर्मूला है — छोटा हो, बोलने में आसान हो, याद रह जाए, और सुनते ही पता चल जाए कि चैनल किस बारे में है।",
  "What makes a good name? Short, easy to say, easy to remember — and it hints at your topic.",
  panel=P("GOOD CHANNEL NAME", f"Short. Clear. {Y('Memorable.')}"))
for i, t in enumerate(["Short &amp; easy to say", "Easy to remember", "Hints at your topic"]):
    BEATS[-1].setdefault("bl", []).append((1.5 + i * 1.6, t, False))
B("जैसे 'स्मार्ट लर्निंग हिंदी' — नाम सुनते ही समझ आ जाता है कि यहाँ हिंदी में कुछ सीखने को मिलेगा।",
  "Example: “Smart Learning Hindi” — you instantly know you'll learn something, in Hindi.", b="e.g. <code>Smart Learning Hindi</code>")
B("और ऐसे नामों से बचिए — जिनमें बहुत सारे नंबर हों, अजीब स्पेलिंग हो, या किसी दूसरे ब्रांड का नाम हो। इससे लोगों का भरोसा कम होता है, और कॉपीराइट की दिक्कत भी आ सकती है।",
  "Avoid lots of numbers, odd spellings or other brands' names — they hurt trust and can cause copyright trouble.", pad=1.0)
BEATS[-1]["bl"] = [(1.0, "No random numbers or odd spellings", True), (3.5, "No other brand names", True)]

# ---- Chapter 3: Handle ----
B("अब बात करते हैं हैंडल की — जिसे ज़्यादातर लोग हल्के में ले लेते हैं, और बाद में पछताते हैं।",
  "Now the handle — something most beginners take lightly, and regret later.",
  tapgo(1.0, 48, 140, to="otherch", box=(16, 106, 380, 70)),
  panel=P("CHAPTER 3 · @HANDLE", f"What is a {Y('YouTube handle?')}"), ch="YouTube Handle Explained")
B("नाम के नीचे यह जो '@' से शुरू होने वाला नाम दिख रहा है — यही हैंडल है। ये आपके चैनल का यूनिक पता होता है।",
  "See the name starting with “@” under the channel name? That's the handle — your channel's unique address.",
  [("zoom", 0.4, 104, 196, 1.6, 4.2), ("hl", 1.0, 100, 184, 140, 26, 3.4)])
B("चैनल का नाम दो लोगों का एक जैसा हो सकता है, लेकिन हैंडल पूरी दुनिया में सिर्फ़ एक ही होता है।",
  "Two channels can have the same name — but a handle exists only once in the whole world.", b="Name can repeat — handle can't")
B("लोग इसी हैंडल से आपको सर्च करते हैं, कमेंट्स में टैग करते हैं, और यही आपके चैनल के लिंक में भी आता है।",
  "People search you with it, tag you in comments — and it's part of your channel link.", b="<code>youtube.com/@YourHandle</code>")
B("हैंडल बनाने के कुछ नियम हैं। ये तीन से तीस अक्षर का हो सकता है, और इसमें सिर्फ़ अक्षर, नंबर, अंडरस्कोर, हाइफ़न और डॉट चलते हैं। स्पेस नहीं चलता।",
  "Handle rules: 3 to 30 characters — only letters, numbers, underscore, hyphen and period. No spaces.",
  panel=P("HANDLE RULES", f"Know the {Y('rules')}"))
BEATS[-1]["bl"] = [(1.6, "3 to 30 characters", False), (3.4, "Letters, numbers, <code>_</code> <code>-</code> <code>.</code>", False), (6.6, "No spaces", True), (7.4, "Must be unique", False)]
B("अब असली परेशानी — जो हैंडल आप चाहते हैं, ज़्यादातर बार वो पहले से किसी ने ले रखा होता है। तब क्या करें? मैं आपको तीन तरीके बताता हूँ।",
  "The real problem: the handle you want is often already taken. So what now? Here are three fixes.",
  panel=P("HANDLE TAKEN?", f"Try these {Y('3 fixes')}"))
B("पहला तरीका — अपने टॉपिक या भाषा का शब्द जोड़ दीजिए। जैसे 'स्मार्टलर्निंग' नहीं मिला, तो 'स्मार्टलर्निंगहिंदी'।",
  "Fix 1: add your topic or language. @SmartLearning taken? Try @SmartLearningHindi.", b="<code>@SmartLearningHindi</code>")
B("दूसरा — बीच में एक डॉट या अंडरस्कोर लगा दीजिए। जैसे 'स्मार्ट डॉट लर्निंग'।",
  "Fix 2: add a period or underscore — like @Smart.Learning or @Smart_Learning.", b="<code>@Smart.Learning</code>")
B("तीसरा — 'विद' और अपना नाम जोड़ दीजिए, जैसे 'लर्न विद राहुल'। इससे चैनल पर्सनल भी लगता है।",
  "Fix 3: add “with” plus your name — like @LearnWithRahul. It feels personal too.", b="<code>@LearnWithRahul</code>")
B("लेकिन एक गलती बिल्कुल मत कीजिए — रैंडम नंबर लगाना, जैसे 'स्मार्टलर्निंग चार सात दो नौ'। ये न याद रहता है, न प्रोफ़ेशनल लगता है।",
  "But don't add random numbers like @SmartLearning4729 — hard to remember, and it looks unprofessional.", b=("<code>@SmartLearning4729</code>", True))
B("और कोशिश कीजिए कि यही हैंडल आपके इंस्टाग्राम और बाकी सोशल मीडिया पर भी एक जैसा हो, ताकि लोग हर जगह आपको आसानी से ढूँढ लें।",
  "Try to keep the same handle on Instagram and other platforms, so people find you everywhere.",
  panel=P("PRO TIPS", f"Choose it {Y('once')}, choose it right"), b="Same handle on every platform")
B("हैंडल बाद में बदला जा सकता है, लेकिन यूट्यूब इसकी एक लिमिट रखता है, और पुराने लिंक काम करना बंद कर सकते हैं। इसलिए शुरू में ही सोच-समझकर चुनिए।",
  "You can change it later, but YouTube limits how often — and old links may break. So choose carefully now.", b="Changeable — but limited", pad=1.0)

# ---- Chapter 4: Create the channel ----
B("चलिए, अब चैनल बनाते हैं। लेकिन 'क्रिएट' दबाने से पहले एक चीज़ ज़रूर चेक कीजिए — कि आप सही जीमेल से लॉग-इन हैं।",
  "Now let's create the channel. But before tapping “Create”, check you're signed in with the right Gmail.",
  [("scr", 0.5, "feed")], panel=P("CHAPTER 4 · CREATE", f"Let's {Y('create')} your channel"), ch="Create Your Channel (Step by Step)")
B("इसके लिए नीचे दाएँ कोने में अपनी प्रोफ़ाइल फ़ोटो पर टैप कीजिए, जहाँ 'यू' लिखा है।",
  "Tap your profile picture in the bottom-right corner — it says “You”.",
  press(0.8, 370.8, 868, z=1.75, ox=370, oy=868, box=(340, 846, 62, 46), to="you"), panel=P("STEP 1", f"Tap {Y('“You”')}", "Bottom-right corner of the app"))
B("सबसे ऊपर आपका नाम दिख रहा है। अगर फ़ोन में एक से ज़्यादा अकाउंट हैं, तो 'स्विच अकाउंट' पर टैप करके देख लीजिए कि सही अकाउंट चुना हुआ है।",
  "Your name is at the top. Have more than one account? Tap “Switch account” and make sure the right one is selected.",
  [("hl", 0.6, 98, 84, 220, 36, 1.8)] + press(2.8, 86, 193, z=1.6, ox=40, oy=193, box=(16, 176, 140, 34), hold=1.1, after=[("set", .1, "acct", 1)]) +
  [("hl", "e+0.2", 20, 548, 372, 56, 1.4), ("tap", "e+1.5", 206, 576), ("set", "e+1.8", "acct", 0)],
  panel=P("STEP 2", f"Check the {Y('right account')}", "The account you use will own the channel"), pad=0.9)
B("ये इसलिए ज़रूरी है, क्योंकि जिस अकाउंट पर चैनल बनेगा, वही उसका मालिक होगा। गलत अकाउंट पर बन गया, तो बाद में उसे बदलना काफ़ी मुश्किल होता है।",
  "This matters: the account you use becomes the channel's owner. Moving it later is difficult.")
B("सही अकाउंट है? बढ़िया। अब अपने नाम के ठीक नीचे 'क्रिएट अ चैनल' पर टैप कीजिए।",
  "Right account? Great. Now tap “Create a channel” right below your name.",
  press(0.9, 168, 133, z=1.85, ox=160, oy=133, box=(98, 118, 142, 30), to="sheet"), panel=P("STEP 3", f"Tap {Y('“Create a channel”')}", "Right below your name"))
B("अब यह स्क्रीन खुली है, जिसमें तीन चीज़ें हैं — प्रोफ़ाइल फ़ोटो, नाम, और हैंडल।",
  "This screen has three things: a profile picture, a name and a handle.",
  [("hl", 0.6, 140, 104, 132, 132, 1.5), ("hl", 2.2, 24, 300, 364, 56, 1.3), ("hl", 3.6, 24, 384, 364, 56, 1.3)],
  panel=P("STEP 4", f"Fill in your {Y('details')}"))
B("फ़ोटो अभी छोड़ सकते हैं — इसे हम थोड़ी देर में अच्छे से लगाएँगे। पहले 'नेम' वाले बॉक्स पर टैप कीजिए, और अपने चैनल का नाम लिखिए।",
  "You can skip the photo — we'll add it properly in a moment. Tap “Name” and type your channel name.",
  [("zoom", "e-1.6", 30, 330, 1.5, 3.4)] + tapgo(("e", -1.0), 206, 328) + typ(("e", -0.7), "name", "Smart Learning Hindi", cps=8.5), pad=2.0)
B("अब 'हैंडल' बॉक्स में अपना हैंडल लिखिए। मैं पहले '@स्मार्टलर्निंग' ट्राई करता हूँ, देखते हैं मिलता है या नहीं।",
  "Now type your handle. Let me first try @SmartLearning and see if it's free.",
  [("zoom", "e-1.4", 30, 420, 1.5, 4.6)] + tapgo(("e", -0.9), 206, 412) + typ(("e", -0.6), "handle", "@SmartLearning", cps=8) +
  [("set", "e+1.2", "hstate", "checking"), ("set", "e+2.0", "hstate", "taken"), ("sfx", "e+2.0", "err")], pad=1.2,
  panel=P("STEP 5", f"Choose your {Y('@handle')}"))
B("देखिए — लाल रंग में लिखा आ गया, 'दिस हैंडल इज़न्ट अवेलेबल'। यानी ये हैंडल किसी और ने पहले ही ले रखा है।",
  "See? In red: “This handle isn't available.” Someone already owns it.",
  [("zoom", 0.2, 30, 440, 1.6, 3.6), ("hl", 0.8, 24, 440, 364, 26, 3.0)], b=("<code>@SmartLearning</code> — taken", True))
B("कोई बात नहीं। जैसा मैंने पहले बताया था, मैं इसमें अपनी भाषा जोड़ देता हूँ — '@स्मार्टलर्निंगहिंदी'।",
  "No problem. Just like I said earlier, I'll add my language: @SmartLearningHindi.",
  [("zoom", "e-1.0", 30, 420, 1.5, 4.2), ("set", "e-0.6", "hstate", ""), ("type", ("e", -0.6), "handle", "@SmartLearningHindi", .9, "@SmartLearning"),
   ("set", "e+0.6", "hstate", "checking"), ("set", "e+1.4", "hstate", "available"), ("sfx", "e+1.4", "ping")], pad=1.4)
B("और यह रहा — हरे रंग का टिक, यानी हैंडल उपलब्ध है। साथ ही नीचे 'क्रिएट चैनल' बटन भी अब नीले रंग में चालू हो गया है।",
  "There it is — a green tick: the handle is available. And the “Create channel” button is now active (blue).",
  [("hl", 0.5, 24, 440, 364, 26, 2.2), ("zoom", 3.4, 398, 840, 1.6, 2.0), ("hl", 3.9, 236, 818, 162, 44, 1.6)], b="<code>@SmartLearningHindi</code> — available ✅")
B("नीचे छोटे अक्षरों में लिखी बात भी एक बार पढ़ लीजिए — आपका नाम और हैंडल यूट्यूब पर सबको दिखेगा।",
  "Read the small note too — your name and handle will be visible to everyone on YouTube.",
  [("hl", 0.6, 24, 536, 364, 44, 2.6), ("set", 0.2, "focus", "")])
B("सब ठीक है, तो 'क्रिएट चैनल' पर टैप कर दीजिए।",
  "Everything looks good — tap “Create channel”.",
  press(0.6, 316, 840, z=1.7, ox=398, oy=840, box=(236, 818, 162, 44), after=[("set", -0.1, "loading", 1)]) + [("scr", 4.4, "channel"), ("set", 4.6, "loading", 0)],
  panel=P("STEP 6", f"Tap {Y('“Create channel”')}"), pad=0.3)
B("और बधाई हो! आपका यूट्यूब चैनल बन गया है।",
  "And congratulations! Your YouTube channel is live. 🎉",
  [("conf", 0.0), ("sfx", 0.0, "chime")], panel=P("DONE 🎉", f"Your channel is {Y('live!')}", "Now let's make it look professional", kc="#1fb866"), pad=1.2)

# ---- Chapter 5: Channel tour + profile photo ----
B("ये है आपका चैनल पेज। यहाँ आपका नाम, हैंडल, और सब्सक्राइबर्स व वीडियो की गिनती दिखती है।",
  "This is your channel page: your name, handle, and subscriber and video counts.",
  [("zoom", 0.4, 0, 150, 1.15, 3.4), ("hl", 1.0, 110, 92, 290, 70, 2.8)],
  panel=P("CHAPTER 5 · PROFILE PHOTO", f"Make it look {Y('professional')}"), ch="Channel Page & Profile Photo")
B("अभी ये थोड़ा खाली-खाली लग रहा है। तो इसे प्रोफ़ेशनल बनाते हैं। 'मैनेज वीडियोज़' के बगल में पेंसिल वाले आइकन पर टैप कीजिए।",
  "It looks a bit empty, so let's fix that. Tap the pencil icon next to “Manage videos”.",
  press("e-1.2", 378, 230, z=1.8, ox=378, oy=230, box=(358, 210, 40, 40), to="edit"), pad=1.4)
B("यहाँ से आप बैनर, प्रोफ़ाइल फ़ोटो, नाम, हैंडल, डिस्क्रिप्शन और लिंक्स — सब कुछ बदल सकते हैं।",
  "From here you can change the banner, profile photo, name, handle, description and links.",
  [("hl", 0.6, 0, 80, 412, 120, 1.2), ("hl", 1.9, 150, 152, 112, 112, 1.0), ("hl", 3.0, 0, 290, 412, 128, 1.4), ("hl", 4.5, 0, 418, 412, 128, 1.4)])
B("सबसे पहले प्रोफ़ाइल फ़ोटो। ये आपके चैनल का चेहरा है — हर वीडियो के नीचे, और हर कमेंट के साथ यही दिखती है।",
  "First, the profile photo. It's your channel's face — shown under every video and next to every comment.",
  panel=P("PROFILE PHOTO", f"Your channel's {Y('face')}"))
B("इसके लिए आठ सौ बाय आठ सौ पिक्सल की चौकोर फ़ोटो सबसे अच्छी रहती है। और याद रखिए, ये गोल आकार में और काफ़ी छोटी दिखती है।",
  "Use a square image — 800 × 800 px is ideal. Remember, it's shown as a small circle.", b="800 × 800 px, square")
B("इसलिए इसमें ज़्यादा टेक्स्ट मत डालिए। या तो अपनी एक साफ़ फ़ोटो लगाइए, या फिर एक सिंपल सा लोगो।",
  "So skip the small text. Use a clear photo of your face, or a simple logo.", b="Clear face or simple logo")
BEATS[-1]["bl"] = [(0.3, "No small text — it won't be readable", True)]
B("फ़ोटो पर बने कैमरा आइकन पर टैप कीजिए, और गैलरी से अपना लोगो चुनिए।",
  "Tap the camera icon on the photo and pick your logo from the gallery.",
  press(0.5, 246, 246, z=1.7, box=(226, 226, 40, 40), to="gallery", after=[("set", -0.2, "galMode", "photo")]) +
  tapgo(4.6, 206, 152, to="crop", box=(138, 84, 136, 136)) + [("tw", 5.0, "cropS", 1.3, 1.0, 1.4)], pad=1.6)
B("अब इसे गोल घेरे के अंदर सही से एडजस्ट कीजिए, ताकि लोगो बीच में रहे — और 'सेव' कर दीजिए।",
  "Fit it inside the circle so the logo stays centred — then tap “Save”.",
  [("hl", 0.6, 46, 255, 320, 320, 2.0)] + tapgo(("e", 0.2), 370, 53, to="edit", box=(340, 38, 60, 30), extra=[("set", ("e", 0.3), "logo", 1)]), pad=1.6)

# ---- Chapter 6: Banner ----
B("अब बैनर। ये आपके चैनल पेज के सबसे ऊपर लगी चौड़ी इमेज होती है, जो नए विज़िटर को पहली नज़र में बता देती है कि चैनल किस बारे में है।",
  "Next, the banner — the wide image at the top that tells new visitors what your channel is about.",
  [("hl", 0.8, 0, 80, 412, 120, 2.6)], panel=P("CHAPTER 6 · BANNER", f"Your channel's {Y('billboard')}"), ch="Channel Banner (Size & Safe Area)")
B("बैनर का साइज़ दो हज़ार पाँच सौ साठ बाय एक हज़ार चार सौ चालीस पिक्सल रखिए, और फ़ाइल छह एमबी से छोटी होनी चाहिए।",
  "Banner size: 2560 × 1440 px, and the file must be under 6 MB.", b="2560 × 1440 px · under 6 MB")
B("अब सबसे ज़रूरी बात — बैनर हर डिवाइस पर अलग तरह से कटता है। टीवी पर पूरा दिखता है, लेकिन मोबाइल पर सिर्फ़ बीच की एक पट्टी दिखती है।",
  "Key point: the banner crops differently on each device. TV shows it all — mobile shows only a strip in the middle.", b="Mobile shows only the centre")
B("इसलिए अपना नाम और ज़रूरी टेक्स्ट हमेशा बीच वाले 'सेफ़ एरिया' में रखिए — जो लगभग पंद्रह सौ छियालीस बाय चार सौ तेईस पिक्सल का होता है।",
  "So keep your name and key text inside the centre safe area — about 1546 × 423 px.", b="Text inside 1546 × 423 safe area")
B("बैनर आप कैनवा जैसे किसी भी ऐप में फ़्री में बना सकते हैं। बन जाए, तो बैनर पर बने कैमरा आइकन पर टैप करके उसे चुनिए।",
  "Make one free in an app like Canva. Then tap the camera icon on the banner and choose it.",
  press("e-1.6", 374, 104, z=1.7, box=(356, 86, 36, 36), to="gallery") + tapgo(("e", 2.6), 68, 290, to="bcrop", box=(0, 222, 136, 136)), pad=1.8)
B("यहाँ प्रीव्यू में ये पीली डैश वाली लाइन देखिए — यही सेफ़ एरिया है। चेक कर लीजिए कि आपका टेक्स्ट इसके अंदर है, और 'सेव' कर दीजिए।",
  "See the yellow dashed box in the preview? That's the safe area. Make sure your text is inside, then tap “Save”.",
  [("zoom", 0.4, 206, 376, 1.5, 3.6), ("hl", 1.0, 81, 332, 249, 68, 3.0)] + tapgo(("e", 0.2), 370, 53, to="edit", box=(340, 38, 60, 30), extra=[("set", ("e", 0.3), "banner", 1)]), pad=1.6)

# ---- Chapter 7: Description & links ----
B("अब डिस्क्रिप्शन। बहुत लोग इसे खाली छोड़ देते हैं — लेकिन यही यूट्यूब और गूगल, दोनों को बताता है कि आपका चैनल किस बारे में है।",
  "Now the description. Many people leave it empty — but it tells both YouTube and Google what your channel is about.",
  tapgo(("e", -0.6), 206, 450, to="desc", box=(0, 418, 412, 64)), panel=P("CHAPTER 7 · DESCRIPTION", f"Tell people {Y('why to subscribe')}"), ch="Channel Description & Links", pad=1.0)
B("इसकी पहली दो लाइनें सबसे ज़रूरी हैं, क्योंकि सर्च में यही दिखती हैं। इनमें साफ़ लिखिए कि आपका चैनल क्या है, और किसके लिए है।",
  "The first two lines matter most — they show in search. Say clearly what your channel is and who it's for.",
  typ(0.6, "desc", "Namaste! Smart Learning Hindi par aapko technology, YouTube aur online earning ke aasaan tutorials milenge — bilkul simple Hindi mein.\n\n", cps=22),
  b="First 2 lines = most important")
B("फिर बताइए कि नई वीडियो कब आती है, और बिज़नेस के लिए एक ईमेल दे दीजिए। अपने टॉपिक के कीवर्ड्स नैचुरली लिखिए — ज़बरदस्ती भरने से कोई फ़ायदा नहीं।",
  "Then add when new videos come out and a business email. Use topic keywords naturally — stuffing them doesn't help.",
  [("type", 0.5, "desc", "Namaste! Smart Learning Hindi par aapko technology, YouTube aur online earning ke aasaan tutorials milenge — bilkul simple Hindi mein.\n\n🎬 Har Monday aur Thursday nayi video.\n📩 Business: hello@smartlearninghindi.in", 4.0,
    "Namaste! Smart Learning Hindi par aapko technology, YouTube aur online earning ke aasaan tutorials milenge — bilkul simple Hindi mein.\n\n")])
BEATS[-1]["bl"] = [(0.8, "Upload schedule", False), (3.0, "Business email", False), (5.0, "Keywords — naturally", False)]
B("लिखने के बाद ऊपर 'सेव' पर टैप कीजिए।",
  "When you're done, tap “Save” at the top.",
  tapgo(1.2, 370, 53, to="edit", box=(340, 38, 60, 30), extra=[("set", 1.3, "desc", 1), ("set", 1.2, "focus", "")]), pad=1.0)
B("इसी पेज पर 'लिंक्स' में आप अपना इंस्टाग्राम या वेबसाइट जोड़ सकते हैं, और 'कॉन्टैक्ट इन्फ़ो' में बिज़नेस ईमेल — ये सब आपके चैनल पेज पर दिखते हैं।",
  "Here, under “Links”, add Instagram or your website, and a business email under “Contact info” — they show on your channel page.",
  [("hl", 1.4, 0, 482, 412, 64, 2.0), ("hl", 4.4, 0, 546, 412, 64, 2.0)], b="Add Instagram / website links")
B("अब वापस जाकर देखिए — चैनल कितना प्रोफ़ेशनल लगने लगा है!",
  "Now go back and look — your channel already looks so much more professional!",
  tapgo(0.6, 24, 53, to="channel2"), pad=2.2)

# ---- Chapter 8: Security & settings ----
B("अब कुछ ऐसी सेटिंग्स, जिन्हें नज़रअंदाज़ करना सबसे बड़ी गलती होती है। पहली — सिक्योरिटी।",
  "Now a few settings you should never ignore. First: security.",
  [("scr", "e+0.2", "security")], panel=P("CHAPTER 8 · SAFETY", f"Protect your {Y('channel')}"), ch="Security, Verification & Audience Settings")
B("आजकल यूट्यूब चैनल हैक होने के बहुत मामले आते हैं। इसलिए अपने गूगल अकाउंट में 'टू-स्टेप वेरिफ़िकेशन' ज़रूर ऑन कीजिए।",
  "Channel hacks are very common today, so turn on 2-Step Verification in your Google account.",
  [("hl", 1.6, 16, 186, 380, 60, 2.4)] + press(("e", -1.0), 206, 214, z=1.5, ox=30, oy=214, box=(16, 186, 380, 60), after=[("set", .1, "sv", 1)]), pad=1.0)
B("इससे अगर किसी को आपका पासवर्ड पता भी चल जाए, तब भी वो आपके फ़ोन पर आए कोड के बिना लॉग-इन नहीं कर पाएगा।",
  "Then even if someone gets your password, they can't sign in without the code on your phone.", b="2-Step Verification: ON")
B("और किसी अनजान ईमेल में आए 'स्पॉन्सरशिप' या 'कॉपीराइट' वाले लिंक से कभी लॉग-इन मत कीजिए — ज़्यादातर चैनल ऐसे ही हैक होते हैं।",
  "And never sign in through unknown “sponsorship” or “copyright” email links — that's how most channels get hacked.", b=("Never trust unknown email links", True), pad=1.0)
B("दूसरी सेटिंग — फ़ोन नंबर वेरिफ़िकेशन। यूट्यूब स्टूडियो में सेटिंग्स, फिर चैनल, और फिर 'फ़ीचर एलिजिबिलिटी' में जाइए।",
  "Second: phone verification. In YouTube Studio go to Settings → Channel → Feature eligibility.",
  [("scr", 0.6, "studio")], panel=P("PHONE VERIFICATION", f"Unlock {Y('more features')}", "Studio → Settings → Channel → Feature eligibility"))
B("यहाँ 'इंटरमीडिएट फ़ीचर्स' में 'वेरिफ़ाई फ़ोन नंबर' पर टैप करके, अपने नंबर पर आया कोड डाल दीजिए।",
  "Under “Intermediate features”, tap “Verify phone number” and enter the code you receive.",
  [("hl", 0.6, 16, 200, 380, 170, 1.8)] + press(("e", -1.4), 126, 322, z=1.6, ox=40, oy=322, box=(32, 304, 190, 36), after=[("set", .2, "verified", 1), ("sfx", .2, "ping")]), pad=1.2)
B("इससे पंद्रह मिनट से लंबी वीडियो, कस्टम थंबनेल, और लाइव स्ट्रीम जैसे फ़ीचर्स खुल जाते हैं। ध्यान रखिए, एक नंबर से साल में ज़्यादा से ज़्यादा दो चैनल वेरिफ़ाई होते हैं।",
  "That unlocks videos over 15 minutes, custom thumbnails and live streaming. Note: one number can verify up to 2 channels a year.",
  [("hl", 0.8, 16, 200, 380, 170, 3.0)])
BEATS[-1]["bl"] = [(1.0, "Videos longer than 15 min", False), (2.2, "Custom thumbnails", False), (3.4, "Live streaming", False)]
B("तीसरी सेटिंग — ऑडियंस। हर वीडियो पर यूट्यूब पूछता है कि क्या ये बच्चों के लिए बनी है। इसका जवाब हमेशा सच-सच दीजिए।",
  "Third: audience. For every video, YouTube asks if it's made for kids. Always answer honestly.",
  panel=P("MADE FOR KIDS?", f"Always answer {Y('honestly')}"))
B("अगर आपकी वीडियो सच में बच्चों के लिए है, तभी 'हाँ' चुनिए। सिर्फ़ व्यूज़ के लिए गलत जवाब देंगे, तो चैनल पर कार्रवाई भी हो सकती है।",
  "Choose “Yes” only if it's truly for kids. A false answer just for views can lead to action on your channel.", b=("Wrong answer = risk to your channel", True), pad=1.0)

# ---- Chapter 9: First upload ----
B("अब आपकी पहली वीडियो। होम स्क्रीन पर नीचे बीच में प्लस वाले बटन पर टैप कीजिए।",
  "Now your first video. On the home feed, tap the plus (+) button at the bottom centre.",
  [("scr", 0.4, "feed")] + press(("e", -1.4), 206, 868, z=1.7, ox=206, oy=868, box=(180, 846, 52, 46), after=[("set", .1, "cmenu", 1)]),
  panel=P("CHAPTER 9 · FIRST UPLOAD", f"Upload your {Y('first video')}"), ch="Upload Your First Video", pad=1.0)
B("यहाँ शॉर्ट, वीडियो अपलोड, लाइव और पोस्ट के ऑप्शन हैं। हम 'अपलोड अ वीडियो' चुनेंगे, और गैलरी से अपनी वीडियो सेलेक्ट करेंगे।",
  "You'll see Short, Upload a video, Go live and Post. Choose “Upload a video” and pick your video from the gallery.",
  [("hl", 0.8, 16, 690, 380, 44, 2.0), ("tap", 3.2, 206, 712), ("set", 3.4, "galMode", "video"), ("scr", 3.5, "gallery"), ("set", 3.6, "cmenu", 0)] +
  tapgo(("e", 0.4), 68, 152, to="details", box=(0, 84, 136, 136)), pad=1.4)
B("अब टाइटल — और ये सबसे ज़रूरी है। टाइटल में वही शब्द लिखिए, जो लोग सर्च करते हैं, और साफ़ बताइए कि वीडियो देखने से क्या मिलेगा।",
  "Now the title — the most important part. Use the words people actually search, and make the benefit clear.",
  tapgo(("e", -2.0), 206, 333, box=(16, 306, 380, 54)) + typ(("e", -1.6), "vtitle", "Mobile Se YouTube Channel Kaise Banaye 2026 | Full Guide", cps=13),
  panel=P("TITLE &amp; DESCRIPTION", f"Write for {Y('search')}"), b="Use words people search", pad=2.6)
B("डिस्क्रिप्शन में दो-तीन लाइनों में बताइए कि वीडियो में क्या-क्या है।",
  "In the description, explain in two or three lines what the video covers.",
  tapgo(0.8, 206, 408, box=(16, 376, 380, 62)) + typ(1.1, "vdesc", "Is video mein seekhiye mobile se YouTube channel banana — naam, handle, logo, banner aur settings.", cps=24), pad=1.6)
B("अब 'विज़िबिलिटी'। पब्लिक मतलब सब देख सकते हैं; अनलिस्टेड मतलब सिर्फ़ वो लोग, जिनके पास लिंक है; और प्राइवेट मतलब सिर्फ़ आप।",
  "Visibility: Public — everyone. Unlisted — only people with the link. Private — only you.",
  [("set", 0.2, "focus", "")] + tapgo(0.9, 206, 485, box=(0, 458, 412, 50), extra=[("set", 1.1, "vis", 1), ("hl", 3.0, 20, 594, 372, 56, 1.4), ("hl", 4.8, 20, 664, 372, 56, 2.0), ("hl", 7.2, 20, 734, 372, 56, 1.4)]),
  panel=P("VISIBILITY", f"Public, Unlisted or {Y('Private?')}"), pad=0.6)
BEATS[-1]["bl"] = [(2.8, "Public — everyone", False), (4.6, "Unlisted — link only", False), (7.0, "Private — only you", False)]
B("मेरी सलाह — पहली बार वीडियो को अनलिस्टेड रखकर, एक बार ख़ुद चेक कर लीजिए; फिर पब्लिक कर दीजिए। अभी मैं पब्लिक चुन रहा हूँ।",
  "My tip: upload as Unlisted first, check it yourself, then make it Public. For now, I'll choose Public.",
  [("tap", "e-0.6", 206, 594), ("set", "e-0.5", "visSel", "Public"), ("set", "e+0.2", "vis", 0)], pad=1.0)
B("अब 'नेक्स्ट' दबाइए, और ऑडियंस में सच-सच चुनिए। मेरी वीडियो बच्चों के लिए नहीं है, इसलिए मैं 'नो' चुनूँगा।",
  "Tap “Next” and choose the audience honestly. My video isn't for kids, so I'll pick “No”.",
  tapgo(0.9, 363, 53, to="audience", box=(330, 38, 66, 30)) + tapgo(("e", -0.4), 40, 334, box=(16, 306, 380, 56), extra=[("set", ("e", -0.3), "aud", "no")]),
  panel=P("AUDIENCE", f"Made for kids? {Y('Be honest')}"), pad=1.2)
B("आख़िर में 'अपलोड वीडियो' पर टैप कीजिए — और आपकी पहली वीडियो अपलोड होना शुरू हो जाएगी।",
  "Finally, tap “Upload video” — and your first video starts uploading.",
  press(0.8, 206, 840, z=1.5, ox=206, oy=840, box=(24, 820, 364, 42), to="uploads") + [("tw", 3.4, "upl", 0, 100, 4.0), ("tw", 7.4, "proc", 0, 1, 1.2), ("sfx", 8.6, "chime")],
  panel=P("UPLOAD", f"Tap {Y('“Upload video”')}", "Your first video goes live"), pad=4.0)
B("एक बात और — कस्टम थंबनेल के लिए फ़ोन वेरिफ़िकेशन ज़रूरी है, जो हमने पहले ही कर लिया है। और अच्छा थंबनेल ही सबसे ज़्यादा क्लिक दिलाता है।",
  "One more thing: custom thumbnails need phone verification — which we've already done. A good thumbnail drives most clicks.", b="Thumbnail = more clicks", pad=1.0)

# ---- Chapter 10: Ranking ----
B("अब सबसे ज़रूरी सवाल — वीडियो रैंक कैसे करे? सीधी बात है — यूट्यूब उन्हीं वीडियो को आगे बढ़ाता है, जिन पर लोग क्लिक करते हैं, और जिन्हें आख़िर तक देखते हैं।",
  "The big question: how do videos rank? Simple — YouTube promotes videos people click on and watch till the end.",
  [("scr", 0.6, "channel2")], panel=P("CHAPTER 10 · RANKING", f"How videos {Y('rank')} on YouTube"), ch="How to Rank Your Videos")
B("इसलिए टाइटल और थंबनेल ऐसा हो कि क्लिक करने का मन करे — लेकिन झूठा क्लिकबेट नहीं। जो दिखाइए, वही वीडियो में दीजिए।",
  "So make the title and thumbnail click-worthy — but never fake clickbait. Deliver what you promise.", b="Honest, clickable title + thumbnail")
B("वीडियो के पहले तीस सेकंड में ही बता दीजिए कि दर्शक को क्या मिलेगा, ताकि वो बीच में छोड़कर न जाए।",
  "In the first 30 seconds, tell viewers what they'll get — so they don't leave.", b="Strong first 30 seconds")
B("एक तय शेड्यूल रखिए — हफ़्ते में एक या दो वीडियो, लेकिन लगातार। कंसिस्टेंसी से ही चैनल बढ़ता है।",
  "Keep a fixed schedule — one or two videos a week, but consistently. Consistency grows channels.", b="Consistency beats volume")
B("साथ में शॉर्ट्स भी बनाइए — इनसे नए लोग आपके चैनल तक पहुँचते हैं।",
  "Make Shorts too — they bring new people to your channel.", b="Shorts bring new viewers")
B("और यूट्यूब स्टूडियो में एनालिटिक्स देखते रहिए — कौन सी वीडियो चल रही है, और लोग कहाँ छोड़ रहे हैं। वहीं से सीखिए, और अगली वीडियो बेहतर बनाइए।",
  "And check analytics in YouTube Studio — what works, where viewers drop off. Learn and improve every video.", b="Learn from analytics", pad=1.0)

# ---- Chapter 11: Mistakes, recap, CTA ----
B("आख़िर में, तीन गलतियाँ जिनसे हर हाल में बचना है। पहली — दूसरों की वीडियो या म्यूज़िक बिना परमिशन मत लगाइए, इससे कॉपीराइट स्ट्राइक आ सकती है।",
  "Finally, three mistakes to avoid. One: never use others' videos or music without permission — it can bring a copyright strike.",
  panel=P("AVOID THESE", f"3 mistakes that {Y('kill channels')}", kc="#e0002b"), b=("Copyrighted videos or music", True), ch="Mistakes to Avoid & Recap")
B("दूसरी — फ़ेक सब्सक्राइबर्स या व्यूज़ कभी मत ख़रीदिए। इससे चैनल को फ़ायदा नहीं, उल्टा नुकसान होता है।",
  "Two: never buy fake subscribers or views — it hurts your channel instead of helping.", b=("Buying fake subs or views", True))
B("और तीसरी — दो-चार वीडियो के बाद हार मत मानिए। हर बड़ा चैनल, ज़ीरो से ही शुरू हुआ था।",
  "Three: don't give up after a few videos. Every big channel started from zero.", b=("Giving up too early", True), pad=1.0)
B("तो एक बार जल्दी से दोहरा लेते हैं — सही अकाउंट से लॉग-इन, अच्छा नाम और हैंडल, प्रोफ़ाइल फ़ोटो और बैनर, डिस्क्रिप्शन, सिक्योरिटी — और फिर आपकी पहली वीडियो।",
  "Quick recap: right account, a good name and handle, photo and banner, description, security — then your first video.",
  panel=P("RECAP", f"You're {Y('ready')} to start"))
BEATS[-1]["bl"] = [(1.6 + i * 1.3, t, False) for i, t in enumerate(["Right Google account", "Good name &amp; @handle", "Profile photo &amp; banner", "Description &amp; links", "Security &amp; first upload"])]
B("अगर ये वीडियो आपके काम की लगी, तो इसे लाइक कीजिए, चैनल को सब्सक्राइब कीजिए, और कमेंट में बताइए कि आप किस टॉपिक पर चैनल बना रहे हैं — मैं हर कमेंट का जवाब दूँगा।",
  "Found this helpful? Like, subscribe, and tell me in the comments what your channel is about — I'll reply to every comment.",
  panel=P("THANK YOU", f"👍 Like · 🔔 {Y('Subscribe')} · 💬 Comment"))
B("मिलते हैं अगली वीडियो में। तब तक — सीखते रहिए, और आगे बढ़ते रहिए!",
  "See you in the next video. Until then — keep learning and keep growing!", pad=2.0)

# ======================= BUILD =======================
def main():
    from kokoro_onnx import Kokoro
    kd = os.environ["KOKORO_DIR"]
    k = Kokoro(os.path.join(kd, "kokoro-v1.0.int8.onnx"), os.path.join(kd, "voices-v1.0.bin"))
    import hashlib
    cache = os.path.join(OUT, "tts_cache"); os.makedirs(cache, exist_ok=True)
    def tts(text):
        cf = os.path.join(cache, hashlib.md5(f"{VOICE}|{SPEED}|{text}".encode()).hexdigest() + ".npy")
        if os.path.exists(cf): return np.load(cf)
        b = _tts(text); np.save(cf, b); return b
    def _tts(text):
        a, sr = k.create(text, voice=VOICE, speed=SPEED, lang="hi")
        raw, out = os.path.join(OUT, "_in.wav"), os.path.join(OUT, "_out.wav")
        sf.write(raw, a, sr); subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-ar", str(SR), "-ac", "1", out], check=True)
        b, _ = sf.read(out, dtype="float32")
        # trim leading/trailing near-silence
        nz = np.where(np.abs(b) > 0.01)[0]
        if len(nz): b = b[max(0, nz[0] - 600): nz[-1] + 1800]
        return b / (np.abs(b).max() + 1e-9) * 0.9
    TL = dict(screens=[], taps=[], zooms=[], hls=[], types=[], sets=[], tweens=[], panels=[], bullets=[], caps=[], confetti=[], chapters=[])
    voice_clips, sfx_ev, t = [], [], 0.6
    for bi, bt in enumerate(BEATS):
        clip = tts(bt["vo"]); d = len(clip) / SR
        vs = t + 0.15; ve = vs + d
        res = lambda o: (t + O(o)[1]) if O(o)[0] == "s" else (ve + O(o)[1])
        end = ve
        if bt["ch"]: TL["chapters"].append(dict(t=round(t, 2), title=bt["ch"]))
        if bt["panel"]:
            TL["panels"].append(dict(t=round(t, 2), **bt["panel"])); sfx_ev.append((t, "pop"))
        pidx = len(TL["panels"]) - 1
        if bt["b"]:
            txt, neg = (bt["b"] if isinstance(bt["b"], tuple) else (bt["b"], False))
            TL["bullets"].append(dict(t=round(t + .3, 2), p=pidx, text=txt, neg=neg))
        for (off, txt, neg) in bt.get("bl", []):
            TL["bullets"].append(dict(t=round(t + off, 2), p=pidx, text=txt, neg=neg))
        for a in bt["acts"]:
            kind, at = a[0], res(a[1])
            if kind == "scr": TL["screens"].append([round(at, 3), a[2]]); sfx_ev.append((at, "whoosh")); end = max(end, at + .4)
            elif kind == "tap": TL["taps"].append([round(at, 3), a[2], a[3] + SHIFT]); sfx_ev.append((at, "tap")); end = max(end, at + .5)
            elif kind == "zoom":
                TL["zooms"].append(dict(a=round(at, 3), ox=a[2], oy=a[3] + SHIFT, z=a[4], hold=a[5])); sfx_ev.append((at, "swish")); end = max(end, at + 1.2 + a[5])
            elif kind == "hl": TL["hls"].append([round(at, 3), a[2], a[3] + SHIFT, a[4], a[5], a[6]]); end = max(end, at + a[6])
            elif kind == "type":
                text, dur, frm = a[3], a[4], (a[5] if len(a) > 5 else None)
                TL["types"].append(dict(f=a[2], a=round(at, 3), b=round(at + dur, 3), text=text, **({"from": frm} if frm else {})))
                L = 0
                if frm:
                    while L < min(len(frm), len(text)) and frm[L] == text[L]: L += 1
                steps = (len(frm) - L if frm else 0) + len(text) - L
                for i in range(1, steps + 1): sfx_ev.append((at + dur * i / steps, "tick"))
                end = max(end, at + dur + .3)
            elif kind == "set": TL["sets"].append([round(at, 3), a[2], a[3]])
            elif kind == "tw": TL["tweens"].append(dict(k=a[2], a=round(at, 3), b=round(at + a[5], 3), **{"from": a[3]}, to=a[4])); end = max(end, at + a[5])
            elif kind == "conf": TL["confetti"].append(round(at, 3))
            elif kind == "sfx": sfx_ev.append((at, a[2]))
        bend = end + bt["pad"]
        TL["caps"].append([round(t, 2), round(bend, 2), bt["cap"]])
        voice_clips.append((vs, clip))
        t = bend
    D = round(t + 1.2, 2); TL["duration"] = D
    TL["screens"].insert(0, [0, "home"]); TL["screens"].sort(key=lambda x: x[0])
    for key in ("taps", "hls", "sets"): TL[key].sort(key=lambda x: x[0])
    TL["types"].sort(key=lambda x: x["a"]); TL["zooms"].sort(key=lambda x: x["a"])
    open(os.path.join(HERE, "timeline.js"), "w", encoding="utf-8").write("window.TL=" + json.dumps(TL, ensure_ascii=False) + ";")
    json.dump(TL["chapters"], open(os.path.join(OUT, "chapters.json"), "w"), ensure_ascii=False, indent=1)

    # ---------- audio ----------
    N = int(D * SR); voice = np.zeros(N, np.float32); vmask = np.zeros(N, np.float32)
    for vs, c in voice_clips:
        s = int(vs * SR); e = min(N, s + len(c)); voice[s:e] += c[:e - s]; vmask[s:e] = 1
    rng = np.random.default_rng(3); sfx = np.zeros(N, np.float32)
    def put(sig, at, g=1.0):
        s = int(at * SR); e = min(N, s + len(sig))
        if s < N: sfx[s:e] += g * sig[:e - s]
    def tone(f, amp, dec, ln, f2=None):
        tt = np.arange(int(ln * SR)) / SR; fr = f if f2 is None else f + (f2 - f) * tt / ln
        return (amp * np.sin(2 * np.pi * np.cumsum(np.full_like(tt, 1.0) * fr) / SR) * np.exp(-dec * tt)).astype(np.float32)
    def noise(ln, lo, hi, amp):
        n = int(ln * SR); x = rng.standard_normal(n); X = np.fft.rfft(x); fq = np.fft.rfftfreq(n, 1 / SR)
        X[(fq < lo) | (fq > hi)] = 0; y = np.fft.irfft(X, n); env = np.sin(np.linspace(0, np.pi, n)) ** 2
        return (y / (np.abs(y).max() + 1e-9) * env * amp).astype(np.float32)
    LIB = {"tap": tone(1900, .26, 70, .09) + np.pad(tone(950, .15, 50, .09), (0, 0)),
           "tick": tone(3400, .07, 140, .04), "whoosh": noise(.5, 300, 4000, .14), "swish": noise(.4, 700, 6000, .07),
           "pop": tone(660, .12, 30, .12, 990), "ping": tone(1320, .12, 12, .3),
           "err": np.concatenate([tone(330, .16, 8, .14), tone(260, .16, 8, .2)])}
    chime = np.zeros(int(1.4 * SR), np.float32)
    for i, f in enumerate([784, 988, 1175, 1568]):
        c = tone(f, .14, 5, .9); s = int(i * .11 * SR); chime[s:s + len(c)] += c
    LIB["chime"] = chime
    for at, kind in sfx_ev: put(LIB[kind], at)
    # music: gentle pad + arpeggio, progression changes per chapter
    beat = 60 / 92; bar = 4 * beat
    progs = [[[130.81,164.81,196.0],[98.0,123.47,146.83],[110.0,130.81,164.81],[87.31,110.0,130.81]],
             [[110.0,130.81,164.81],[87.31,110.0,130.81],[130.81,164.81,196.0],[98.0,123.47,146.83]]]
    music = np.zeros(N, np.float32); nb = int(D / bar) + 1
    for ci in range(nb):
        s = int(ci * bar * SR)
        if s >= N: break
        prog = progs[(ci // 16) % 2]; ch = prog[ci % 4]; e = min(N, s + int(bar * SR)); tt = np.arange(e - s) / SR
        env = np.minimum(1, tt / .5) * np.minimum(1, (bar - tt) / .6)
        pad = sum(np.sin(2*np.pi*f*tt) + .5*np.sin(2*np.pi*f*1.003*tt) + .2*np.sin(2*np.pi*2*f*tt) for f in ch)
        music[s:e] += (pad * env * .04).astype(np.float32)
        for j in range(8):
            f = ch[j % 3] * (4 if j % 4 == 3 else 2); ps = s + int(j * beat / 2 * SR); pl = tone(f, .04, 6, .5); pe = min(N, ps + len(pl))
            if ps < N: music[ps:pe] += pl[:pe - ps]
    ker = np.ones(int(.3 * SR)) / int(.3 * SR); vm = np.convolve(vmask, ker, mode="same")
    music *= (1 - .7 * np.clip(vm, 0, 1)).astype(np.float32)
    ta = np.arange(N) / SR; music *= (np.minimum(1, ta / 1.5) * np.minimum(1, (D - ta) / 2.0)).astype(np.float32)
    mix = voice + sfx * .85 + music * .5; mix = mix / (np.abs(mix).max() + 1e-9) * .95
    raw = os.path.join(OUT, "mix_raw.wav"); sf.write(raw, np.stack([mix, mix], 1), SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), os.path.join(OUT, "mix.wav")], check=True)
    print(json.dumps({"duration": D, "mmss": f"{int(D//60)}:{int(D%60):02d}", "beats": len(BEATS), "chapters": TL["chapters"]}, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
