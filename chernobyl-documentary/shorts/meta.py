import json
COMMON = """
------------------------------------------------------------
UPLOAD SETTINGS
------------------------------------------------------------
• Video: upload the MP4 in this folder (vertical 1080x1920; it is under 60 s, so YouTube treats it as a Short).
• Title: copy the TITLE above as it is. The first words carry the main keyword, so the title stays short enough to show fully in the Shorts feed.
• Description: paste the DESCRIPTION above. The first three hashtags appear above the title.
• Tags: paste the TAGS line into "Tags" (YouTube Studio > Show more).
• Thumbnail: in the YouTube app's Shorts upload, tap "Thumbnail". Pick the strongest frame, or upload the Thumbnail.jpg in this folder if your app shows that option.
• Subtitles: YouTube Studio > Subtitles > the Short > Add language > Hindi > Upload file > "With timing" > Hindi.srt. Do the same for English with English.srt.
• Related video: link your full Chernobyl documentary, so a link to it appears under the Short.
• Altered or synthetic content: choose YES (3D animation and a cloned narration voice).
• Audience: "No, it's not made for kids".
• Language: Hindi. Category: Education.

------------------------------------------------------------
DO
------------------------------------------------------------
• Keep one clear keyword ("Chernobyl ...") at the start of the title and the first line of the description.
• Use 3–5 relevant hashtags only, and put #Shorts plus the topic first.
• Post one Short a day, at the same time each day. Evening (6–9 pm IST) is a good starting point; check your own Analytics after a week.
• Reply to the first comments in the first hour, and pin one comment with a question.

DON'T
------------------------------------------------------------
• Don't put more than 15 hashtags anywhere. Above 15, YouTube ignores all of them.
• Don't use unrelated or generic tags (#viral, #fyp, #trending). They don't help, and irrelevant tags can be treated as spam.
• Don't repeat the keyword over and over in the description.
• Don't promise in the title something the video doesn't show (clickbait). Viewers swipe away, and that hurts the Short.
• Don't delete and re-upload a Short that starts slowly. Shorts often pick up views days later.
"""
M = {
 'bio': dict(name='Chernobyl-Short-2-Bio-Robots',
  title='Chernobyl Bio Robots: 90 सेकंड की मौत 😨 #shorts',
  alts=['चेर्नोबिल की छत पर 90 सेकंड… Bio Robots की असली कहानी', 'Chernobyl Bio Robots Story in Hindi | जब मशीनें भी फेल हो गईं'],
  desc='Chernobyl bio robots की असली कहानी। 1986 में चेर्नोबिल की छत पर रेडिएशन इतना था कि रोबोट भी फेल हो गए। फिर क़रीब चार हज़ार सैनिकों को भेजा गया। हर आदमी के पास सिर्फ़ 90 सेकंड थे।',
  tags='chernobyl bio robots, chernobyl biorobots, chernobyl hindi, chernobyl story in hindi, chernobyl 1986, chernobyl roof, chernobyl liquidators, chernobyl documentary hindi, chernobyl facts, history in hindi',
  hash='#Shorts #Chernobyl #ChernobylHindi #BioRobots #HistoryInHindi',
  pin='क्या आप 90 सेकंड के लिए उस छत पर जाते? 🤔 कमेंट में बताइए 👇'),
 'foot': dict(name='Chernobyl-Short-3-Elephants-Foot',
  title="Chernobyl Elephant's Foot: दुनिया की सबसे ख़तरनाक चीज़ ☢️ #shorts",
  alts=["Elephant's Foot क्या है? चेर्नोबिल का पिघला हुआ कोर", "Chernobyl Elephant's Foot in Hindi | 5 मिनट में मौत"],
  desc="Chernobyl Elephant's Foot क्या है? 1986 में रिएक्टर का कोर पिघलकर लावा बन गया और नीचे के कमरों में जम गया। शुरू में उसके पास सिर्फ़ 5 मिनट खड़े रहना जानलेवा था। पूरी Chernobyl documentary इसी चैनल पर है।",
  tags="chernobyl elephant's foot, elephants foot chernobyl, chernobyl hindi, elephant foot kya hai, chernobyl 1986, chernobyl reactor, nuclear disaster hindi, chernobyl documentary hindi, chernobyl facts, history in hindi",
  hash="#Shorts #Chernobyl #ElephantsFoot #ChernobylHindi #HistoryInHindi",
  pin="पूरी Chernobyl documentary देखने के लिए ऊपर वाले लिंक पर टैप कीजिए 👆"),
 'city': dict(name='Chernobyl-Short-4-Pripyat',
  title='Pripyat: 50,000 लोगों का शहर एक दोपहर में ख़ाली 😱 #shorts',
  alts=['Chernobyl का भूतिया शहर Pripyat | वो शहर जो कभी नहीं लौटा', 'Pripyat Ghost City in Hindi | 3 दिन बोलकर निकाला, कभी नहीं लौटे'],
  desc='Pripyat, Chernobyl का भूतिया शहर। 1986 में 50,000 लोगों को कहा गया कि बस 3 दिन की बात है, और वे कभी वापस नहीं लौटे। आज जंगल इस शहर को निगल रहा है। पूरी Chernobyl documentary इसी चैनल पर है।',
  tags='pripyat, pripyat ghost city, chernobyl pripyat, pripyat hindi, chernobyl ghost town, abandoned city, chernobyl hindi, chernobyl 1986, chernobyl documentary hindi, history in hindi',
  hash='#Shorts #Pripyat #Chernobyl #GhostCity #HistoryInHindi',
  pin='पूरी Chernobyl documentary देखने के लिए ऊपर वाले लिंक पर टैप कीजिए 👆'),
 'fire': dict(name='Chernobyl-Short-5-Firefighters',
  title='Chernobyl Firefighters: जो कभी घर नहीं लौटे 💔 #shorts',
  alts=['Chernobyl के असली हीरो | "आम आग है" बोलकर भेजा गया', 'Chernobyl Firefighters Story in Hindi | Hospital No. 6'],
  desc='Chernobyl firefighters की सच्ची कहानी। 26 अप्रैल 1986 को उन्हें बताया गया कि यह छत की एक आम आग है। बिना सुरक्षा के वे खुले रिएक्टर के पास पहुँचे, और कुछ ही हफ़्तों में कई की मौत हो गई। उन्होंने अपनी जान देकर लाखों लोगों को बचाया।',
  tags='chernobyl firefighters, chernobyl heroes, chernobyl hindi, chernobyl story in hindi, chernobyl 1986, hospital no 6, mitino cemetery, chernobyl documentary hindi, chernobyl facts, history in hindi',
  hash='#Shorts #Chernobyl #ChernobylHeroes #ChernobylHindi #HistoryInHindi',
  pin='इन हीरोज़ को एक ❤️ ज़रूर दीजिए। आप इनके बारे में पहले से जानते थे? 👇'),
}
for k, m in M.items():
    t = f"""{m['name']} – YouTube Short
============================================================

TITLE (use this one)
------------------------------------------------------------
{m['title']}

Other title options
• {m['alts'][0]}
• {m['alts'][1]}

DESCRIPTION (paste as it is)
------------------------------------------------------------
{m['desc']}

{m['hash']}

TAGS (paste into Tags, comma separated)
------------------------------------------------------------
{m['tags']}

PINNED COMMENT
------------------------------------------------------------
{m['pin']}
{COMMON}"""
    open(f'meta_{k}.txt', 'w').write(t); json.dump(m, open(f'meta_{k}.json', 'w'), ensure_ascii=False)
    print(k, len(m['title']), len(m['tags']))
