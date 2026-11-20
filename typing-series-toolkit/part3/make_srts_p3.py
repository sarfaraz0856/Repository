import json, sys
sys.path.insert(0, '../voice')
from lines_p3 import LINES
LEAD, SPEED = 2.0, 1.1
W = json.load(open('words.json'))
# one cue per script line (word timings come straight from the voiceover assembly)
cues, i = [], 0
for roman, _ in LINES:
    n = len(roman.split()); ws = W[i:i + n]; i += n
    cues.append([ws[0]['s'], ws[-1]['e'], roman])
GROUPS = [[k] for k in range(14)] + [[14, 15]] + [[k] for k in range(16, 24)] + [[24, 25]] + [[k] for k in range(26, 30)]
EN = ["Hello friends!", "In the last two videos we learned the home row\nand the finger position for every key.", "Today we'll take a typing test\nand see how to reach 50 WPM.", "First, understand what WPM is.", "WPM means words per minute —\nhow many words you type in one minute.", "In a typing test, five letters\ncount as one word.", "To take a test, open typingtest.com or monkeytype.com,", "and choose the one-minute test.", "Put your fingers on the home row.", "The timer starts as soon as you press the first letter.", "During the test, look at the screen,\nnot at the keyboard.", "If you make a mistake, don't stop.", "Don't delete the whole word for one mistake —\njust keep going.", "After one minute, you'll get your result.", "Check two things: WPM and accuracy.", "Accuracy should be at least 95 percent.", "If accuracy is low,\nincreasing speed is no use.", "Beginners usually start at 20 to 30 WPM.", "40 WPM is a good speed,\nand above 50 WPM you're quite fast.", "A simple plan to reach 50 WPM:", "10 minutes of practice daily,\nand two tests a day.", "Note your best score every week.", "Even if you improve by 5 WPM a week,\nyou'll see a big difference in a month.", "And one tip: practise short common words\nlike the, and, is more,", "because they come up again and again.", "Tell us your first test score in the comments.", "If you liked the video, like and subscribe.", "See you in the next video!"]
HI = ["नमस्ते दोस्तों!", "पिछले दो वीडियो में हमने होम रो और\nसारी कीज़ की फिंगर पोज़ीशन सीखी।", "आज हम टाइपिंग टेस्ट देंगे,\nऔर देखेंगे कि 50 WPM तक कैसे पहुंचें।", "सबसे पहले समझो WPM क्या है।", "WPM मतलब वर्ड्स पर मिनट, यानी एक मिनट में\nआप कितने शब्द टाइप करते हो।", "टाइपिंग टेस्ट में पांच लेटर्स को\nएक वर्ड माना जाता है।", "टेस्ट देने के लिए typingtest.com या monkeytype.com खोलो,", "और वन मिनट का टेस्ट चुनो।", "उंगलियां होम रो पे रखो।", "पहला लेटर दबाते ही टाइमर शुरू हो जाता है।", "टेस्ट के टाइम स्क्रीन पे देखो,\nकीबोर्ड पे नहीं।", "अगर गलती हो जाए, तो रुको मत।", "एक गलती के लिए पूरा वर्ड मत मिटाओ,\nबस आगे बढ़ते रहो।", "एक मिनट बाद रिज़ल्ट आएगा।", "दो चीज़ें देखो: WPM और एक्यूरेसी।", "एक्यूरेसी कम से कम 95 परसेंट होनी चाहिए।", "एक्यूरेसी कम है, तो स्पीड\nबढ़ाने का कोई फायदा नहीं।", "बिगिनर्स अक्सर 20 से 30 WPM से शुरू करते हैं।", "40 WPM अच्छी स्पीड है,\nऔर 50 WPM से ऊपर आप काफी फास्ट हो।", "50 WPM तक पहुंचने का सिंपल प्लान:", "रोज़ दस मिनट प्रैक्टिस,\nऔर दिन में दो टेस्ट।", "हर हफ्ते अपना बेस्ट स्कोर नोट करो।", "हर हफ्ते पांच WPM भी बढ़े,\nतो एक महीने में बड़ा फर्क दिखेगा।", "और एक टिप: the, and, is जैसे छोटे\nकॉमन वर्ड्स की प्रैक्टिस ज़्यादा करो,", "क्योंकि ये बार-बार आते हैं।", "अपना पहला टेस्ट स्कोर कमेंट में ज़रूर बताओ।", "वीडियो पसंद आए तो लाइक और सब्सक्राइब करो।", "मिलते हैं अगले वीडियो में!"]
assert len(GROUPS) == len(EN) == len(HI) == 28
out = []
for g in GROUPS:
    out.append([cues[g[0]][0], cues[g[-1]][1], ' '.join(cues[k][2] for k in g)])
for k in range(len(out)):
    nxt = out[k + 1][0] - 0.05 if k + 1 < len(out) else out[k][1] + 1.5
    out[k][1] = min(nxt, out[k][1] + 0.6)
def ts(x):
    x = (x + LEAD) / SPEED; ms = round(x * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
def wrap(t, n=48):
    if len(t) <= n: return t
    cut = t.rfind(' ', 0, len(t) // 2 + 10); return t[:cut] + '\n' + t[cut + 1:]
for name, texts in [('part3_subtitles_english.srt', EN), ('part3_subtitles_hindi.srt', HI), ('part3_subtitles_hinglish_hi-Latn.srt', [wrap(c[2]) for c in out])]:
    with open(name, 'w', encoding='utf-8') as f:
        for k, ((s, e, _), t) in enumerate(zip(out, texts), 1):
            f.write(f"{k}\n{ts(s)} --> {ts(e)}\n{t}\n\n")
print(len(out), 'cues, last ends', ts(out[-1][1]))
