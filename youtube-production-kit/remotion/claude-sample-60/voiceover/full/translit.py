"""Turn the mixed Devanagari + English script into TTS input: English words are written in Devanagari
(the Hindi voice model pronounces those far more naturally). Writes narration_full.json:
[{scene, sub (on-screen subtitle, original text), tts (Devanagari)}]"""
import json, re, sys
D = {
"account":"अकाउंट","accuracy":"एक्यूरेसी","accurately":"एक्यूरेटली","actual":"एक्चुअल","add":"ऐड","advanced":"एडवांस्ड","age":"एज","ai":"ए-आई","ai-generated":"ए-आई जनरेटेड",
"analysis":"एनालिसिस","analytics":"एनालिटिक्स","analyze":"एनालाइज़","and":"एंड","anthropic":"एंथ्रोपिक","assistant":"असिस्टेंट","audience":"ऑडियंस","automatically":"ऑटोमैटिकली",
"availability":"अवेलेबिलिटी","available":"अवेलेबल","background":"बैकग्राउंड","balance":"बैलेंस","beginners":"बिगिनर्स","benefit":"बेनिफ़िट","better":"बेटर","brainstorm":"ब्रेनस्टॉर्म",
"brainstorming":"ब्रेनस्टॉर्मिंग","brand":"ब्रांड","by":"बाय","card":"कार्ड","channel":"चैनल","channel-related":"चैनल से जुड़े","chat":"चैट","chatbot":"चैटबॉट","chats":"चैट्स","choose":"चूज़",
"clarity":"क्लैरिटी","claude":"क्लॉड","clear":"क्लियर","clearly":"क्लियरली","click-through":"क्लिक थ्रू","clickbait":"क्लिकबेट","colors":"कलर्स","compare":"कंपेयर","compelling":"कंपेलिंग",
"composition":"कंपोज़िशन","concept":"कॉन्सेप्ट","concepts":"कॉन्सेप्ट्स","consistent":"कंसिस्टेंट","content":"कंटेंट","context":"कॉन्टेक्स्ट","conversational":"कन्वर्सेशनल","create":"क्रिएट",
"creation":"क्रिएशन","creative":"क्रिएटिव","creativity":"क्रिएटिविटी","creator":"क्रिएटर","csv":"सी-एस-वी","ctr":"सी-टी-आर","curiosity":"क्यूरियोसिटी","custom":"कस्टम","data":"डेटा",
"date":"डेट","decisions":"डिसीज़न्स","dedicated":"डेडिकेटेड","define":"डिफ़ाइन","demand":"डिमांड","depend":"डिपेंड","detailed":"डिटेल्ड","details":"डिटेल्स","develop":"डेवलप",
"different":"डिफ़रेंट","direct":"डायरेक्ट","documentary-style":"डॉक्यूमेंट्री स्टाइल","documents":"डॉक्यूमेंट्स","download":"डाउनलोड","drafting":"ड्राफ़्टिंग","educational":"एजुकेशनल",
"elements":"एलिमेंट्स","engaging":"एंगेजिंग","entertaining":"एंटरटेनिंग","environment":"एनवायरनमेंट","evaluate":"इवैल्यूएट","example":"एग्ज़ाम्पल","examples":"एग्ज़ाम्पल्स","explain":"एक्सप्लेन",
"explanation":"एक्सप्लेनेशन","explanations":"एक्सप्लेनेशन्स","explore":"एक्सप्लोर","export":"एक्सपोर्ट","face":"फ़ेस","facts":"फ़ैक्ट्स","feature":"फ़ीचर","features":"फ़ीचर्स","feedback":"फ़ीडबैक",
"file":"फ़ाइल","files":"फ़ाइल्स","final":"फ़ाइनल","for":"फ़ॉर","formal":"फ़ॉर्मल","generate":"जनरेट","generation":"जनरेशन","goals":"गोल्स","guarantee":"गारंटी","guaranteed":"गारंटीड",
"help":"हेल्प","high-quality":"हाई क्वालिटी","hindi-hinglish":"हिंदी हिंग्लिश","hook":"हुक","hooks":"हुक्स","idea":"आइडिया","ideal":"आइडियल","ideas":"आइडियाज़","ideation":"आइडिएशन",
"identity":"आइडेंटिटी","important":"इम्पॉर्टेंट","impressions":"इम्प्रेशन्स","improve":"इम्प्रूव","improvement":"इम्प्रूवमेंट","information":"इन्फ़ॉर्मेशन","informed":"इन्फ़ॉर्म्ड",
"instruction":"इंस्ट्रक्शन","instructions":"इंस्ट्रक्शन्स","interest":"इंटरेस्ट","interesting":"इंटरेस्टिंग","intro":"इंट्रो","introduction":"इंट्रोडक्शन","journey":"जर्नी","judgment":"जजमेंट",
"language":"लैंग्वेज","like":"लाइक","main":"मेन","manage":"मैनेज","material":"मटीरियल","materials":"मटीरियल्स","me":"मी","metrics":"मेट्रिक्स","mode":"मोड","multiple":"मल्टिपल","my":"माय",
"natural":"नेचुरल","niche":"नीश","normal":"नॉर्मल","normally":"नॉर्मली","numbers":"नंबर्स","observation":"ऑब्ज़र्वेशन","opening":"ओपनिंग","opportunities":"अपॉर्चुनिटीज़","option":"ऑप्शन",
"options":"ऑप्शन्स","organize":"ऑर्गनाइज़","organized":"ऑर्गनाइज़्ड","original":"ओरिजिनल","outline":"आउटलाइन","output":"आउटपुट","particular":"पर्टिकुलर","partner":"पार्टनर","patterns":"पैटर्न्स",
"perform":"परफ़ॉर्म","performance":"परफ़ॉर्मेंस","personal":"पर्सनल","plan":"प्लान","planning":"प्लानिंग","practical":"प्रैक्टिकल","predictions":"प्रेडिक्शन्स","preferences":"प्रेफ़रेंसेज़",
"private":"प्राइवेट","problem":"प्रॉब्लम","problem-solution":"प्रॉब्लम सॉल्यूशन","problems":"प्रॉब्लम्स","process":"प्रोसेस","product":"प्रोडक्ट","project":"प्रोजेक्ट","projects":"प्रोजेक्ट्स",
"prompt":"प्रॉम्प्ट","publish":"पब्लिश","purpose":"पर्पज़","question-based":"क्वेश्चन बेस्ड","range":"रेंज","rate":"रेट","readability":"रीडेबिलिटी","readable":"रीडेबल","reference":"रेफ़रेंस",
"relevance":"रेलेवेंस","relevant":"रेलेवेंट","remove":"रिमूव","repeat":"रिपीट","repeatable":"रिपीटेबल","repeated":"रिपीटेड","repetitive":"रिपिटिटिव","replace":"रिप्लेस","report":"रिपोर्ट",
"reporting":"रिपोर्टिंग","represent":"रिप्रेज़ेंट","research":"रिसर्च","resources":"रिसोर्सेज़","reusable":"रीयूज़ेबल","review":"रिव्यू","role":"रोल","sample":"सैंपल","saved":"सेव्ड",
"scores":"स्कोर्स","script":"स्क्रिप्ट","scripts":"स्क्रिप्ट्स","scriptwriting":"स्क्रिप्ट राइटिंग","search":"सर्च","search-friendly":"सर्च फ़्रेंडली","seconds":"सेकंड्स","section":"सेक्शन",
"select":"सेलेक्ट","selected":"सेलेक्टेड","sensitive":"सेंसिटिव","sentences":"सेंटेंसेज़","setup":"सेटअप","share":"शेयर","short":"शॉर्ट","skills":"स्किल्स","source":"सोर्स","specific":"स्पेसिफ़िक",
"specify":"स्पेसिफ़ाई","step":"स्टेप","storytelling":"स्टोरीटेलिंग","strategy":"स्ट्रैटेजी","streamline":"स्ट्रीमलाइन","structure":"स्ट्रक्चर","structured":"स्ट्रक्चर्ड","studio":"स्टूडियो",
"style":"स्टाइल","subject":"सब्जेक्ट","subscribe":"सब्सक्राइब","subscriber":"सब्सक्राइबर","subscribers":"सब्सक्राइबर्स","successful":"सक्सेसफ़ुल","suggest":"सजेस्ट","suggestions":"सजेशन्स",
"suitable":"सूटेबल","summarize":"समराइज़","surprising":"सरप्राइज़िंग","system":"सिस्टम","task":"टास्क","tasks":"टास्क्स","technology":"टेक्नोलॉजी","testing":"टेस्टिंग","text":"टेक्स्ट",
"theory":"थ्योरी","thumbnail":"थंबनेल","thumbnails":"थंबनेल्स","time":"टाइम","time-consuming":"टाइम कंज़्यूमिंग","title":"टाइटल","titles":"टाइटल्स","tools":"टूल्स","topic":"टॉपिक",
"topics":"टॉपिक्स","traffic":"ट्रैफ़िक","trending":"ट्रेंडिंग","tutorial":"ट्यूटोरियल","tutorials":"ट्यूटोरियल्स","understand":"अंडरस्टैंड","unnecessary":"अननेसेसरी","upload":"अपलोड",
"useful":"यूज़फ़ुल","verify":"वेरिफ़ाई","video":"वीडियो","videos":"वीडियोज़","viewer":"व्यूअर","viewers":"व्यूअर्स","views":"व्यूज़","visual":"विज़ुअल","voice":"वॉइस","watch":"वॉच",
"wording":"वर्डिंग","workflow":"वर्कफ़्लो","workflows":"वर्कफ़्लोज़","workspace":"वर्कस्पेस","writer":"राइटर","writing":"राइटिंग","youtube":"यूट्यूब",
}
out, scene, miss = [], None, set()
for line in open("script_full.txt", encoding="utf-8"):
    line = line.strip()
    if not line: continue
    if line.startswith("##"): scene = int(line[2:]); continue
    def rep(m):
        w = m.group(0); k = w.lower()
        if k in D: return D[k]
        miss.add(w); return w
    tts = re.sub(r"[A-Za-z][A-Za-z\-]*", rep, line)
    tts = tts.replace("Help me research, plan and create", "हेल्प मी रिसर्च, प्लान एंड क्रिएट")
    out.append(dict(scene=scene, sub=line, tts=tts))
if miss: sys.exit(f"missing: {sorted(miss)}")
json.dump(out, open("narration_full.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump([o["tts"] for o in out], open("tts_texts.json", "w", encoding="utf-8"), ensure_ascii=False)
print(len(out), "lines;", sum(len(o["tts"]) for o in out), "chars")
