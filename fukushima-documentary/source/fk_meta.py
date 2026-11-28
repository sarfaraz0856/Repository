# Fukushima upload text: title options, description with chapter timestamps, tags, pinned comment, upload notes.
import sys, json
OUT = sys.argv[1]; T = json.load(open(f'{OUT}/timing.json'))
mmss = lambda x: f'{int(x // 60)}:{int(x % 60):02d}'
CH = '\n'.join(f'{mmss(o)} {n}' for o, n in T['chapters'])
tot = T['total']
txt = f"""FUKUSHIMA 2011: Japan's Nuclear Disaster | Full Documentary in Hindi
================================================================

TITLE (pick one)
----------------
1. Fukushima Ki Asli Kahani | Japan Ka Parmanu Haadsa – Full Documentary (Hindi)   <- recommended
2. Fukushima 2011: Bhukamp, Sunami Aur Meltdown | Hindi Documentary
3. 11 March 2011: Fukushima Mein Kya Hua? | Fukushima Nuclear Disaster Explained in Hindi


DESCRIPTION
-----------
11 मार्च 2011, दोपहर 2:46 बजे जापान में 9.0 तीव्रता का भूकंप आया। उसके बाद 14–15 मीटर ऊँची सुनामी ने फ़ुकुशिमा दाइची परमाणु प्लांट की बिजली छीन ली। तीन रिएक्टर पिघल गए, चार इमारतों में हाइड्रोजन धमाके हुए, और क़रीब 1.5 लाख लोगों को अपने घर छोड़ने पड़े।

On 11 March 2011 a magnitude 9.0 earthquake and a 14–15 m tsunami knocked out the power at the Fukushima Daiichi nuclear plant in Japan. Three reactors melted down, hydrogen explosions tore through the reactor buildings, and about 154,000 people were evacuated. This {mmss(tot)}-minute documentary, narrated in Hindi, tells the whole story:
- the earthquake and the tsunami
- the station blackout and the meltdown
- the explosions in units 1, 3 and 4
- the Fukushima 50, the helicopters and the fire engines
- the empty towns, the water tanks and the ice wall
- the lesson the world took from it

A cinematic historical reconstruction (CGI). The narration is in Hindi, and English subtitles are available.

CHAPTERS
{CH}

#Fukushima #FukushimaDisaster #HistoryInHindi #Japan #NuclearDisaster #Documentary


TAGS
----
fukushima, fukushima disaster, fukushima in hindi, fukushima nuclear disaster, fukushima 2011, fukushima documentary hindi, japan tsunami 2011, japan earthquake 2011, nuclear disaster hindi, fukushima daiichi, fukushima meltdown, fukushima 50, chernobyl vs fukushima, parmanu haadsa, history in hindi, hindi documentary


PINNED COMMENT
--------------
फ़ुकुशिमा और चेर्नोबिल में आपको कौन सा हादसा ज़्यादा डरावना लगा? कमेंट में बताइए 👇 चेर्नोबिल की पूरी कहानी भी इसी चैनल पर है।


UPLOAD SETTINGS
---------------
• Video: Fukushima-Documentary-in-Hindi-1080p.mp4 (upload this one). The 720p file is a smaller copy for sharing.
• Thumbnail: Fukushima-Documentary-Thumbnail-A.jpg (recommended). B and C are for an A/B test ("Test & compare" in YouTube Studio).
• Subtitles: YouTube Studio > Subtitles > Add language > Hindi > Upload file > "With timing" > Fukushima-Subtitles-Hindi.srt. Then English with Fukushima-Subtitles-English.srt.
• Chapters: they come from the timestamps in the description (the first must be 0:00, which it is).
• Altered or synthetic content: YES (3D animation and a cloned narration voice).
• Audience: "No, it's not made for kids". Language: Hindi. Category: Education.
• End screen: add the Chernobyl and Bhopal documentaries and a Subscribe element over the last 20 seconds.
"""
open(f'{OUT}/Fukushima-Title-Tags-Description.txt', 'w').write(txt)
print(CH)
