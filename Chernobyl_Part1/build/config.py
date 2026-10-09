"""
Chernobyl documentary - Part 1 "Soviet Sapna" (88 s test video).

All settings live here: scenes, voice lines, screen text, sounds, levels.
Times in this file are the ORIGINAL timeline (88 s). If a voice line is too
long, make_part1.py extends that scene and shifts everything after it; every
timed item below is stored relative to its scene, so it moves with it.
"""
from pathlib import Path

# ----------------------------------------------------------------- paths ---
BUILD = Path(__file__).resolve().parent
PROJECT = BUILD.parent                      # .../Chernobyl_Part1
IMAGES = PROJECT / "images"
CLIPS = PROJECT / "clips"
SFX_DIR = PROJECT / "sfx"
MUSIC_DIR = PROJECT / "music"
WORK = BUILD / "work"                       # temporary files (safe to delete)
PREVIEWS = BUILD / "previews"
STEMS = BUILD / "stems"
FONTS = BUILD / "fonts"
TTS_MODELS = BUILD / "tts_models"           # only used by the offline fallback voice
OUTPUT = PROJECT / "Part1_Soviet_Sapna.mp4"
REPORT = PROJECT / "report.txt"

# ---------------------------------------------------------------- format ---
W, H = 1920, 1080
FPS = 30
SR = 48000
VIDEO_CRF = 18
VIDEO_MAXRATE = "8M"        # keeps the file < 100 MB; YouTube recommends 8 Mbps for 1080p30
AUDIO_BITRATE = "320k"

# ----------------------------------------------------------------- voice ---
EDGE_VOICE = "hi-IN-MadhurNeural"
EDGE_RATE = "-6%"
EDGE_PITCH = "-2Hz"
VOICE_LUFS = -16.0           # the reference level (100 %)
VOICE_LEAD_IN = 0.4          # line starts 0.4 s after scene start
VOICE_TAIL = 0.4             # and must end 0.4 s before scene end
MAX_ATEMPO = 1.10

# Offline fallback (only used when edge-tts cannot reach Microsoft's server)
KOKORO_VOICE = "hm_omega"    # Hindi male voice in Kokoro v1.0
KOKORO_SPEED = 0.94          # ~ the same as rate -6 %
KOKORO_URLS = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}

# ---------------------------------------------------------------- scenes ---
# id, base duration, look, Ken Burns motion, placeholder caption, description
SCENES = [
    dict(id="S10", dur=10.0, look="warm", motion="tilt_up", caption="1970s Soviet city, mosaic mural",
         text="उन्नीस सौ सत्तर के दशक में, सोवियत यूनियन दुनिया को दिखाना चाहता था कि वो साइंस में किसी से पीछे नहीं।",
         hinglish="1970 ke dashak mein Soviet Union duniya ko dikhana chahta tha ki woh science mein kisi se peeche nahi."),
    dict(id="S11", dur=10.0, look="warm", motion="push_center", caption="aerial nuclear plant under construction",
         text="नॉर्दर्न यूक्रेन में, बेलारूस बॉर्डर के पास, एक विशाल न्यूक्लियर पावर प्लांट बनाया गया। लोग इसे चेर्नोबिल कहते थे।",
         hinglish="Northern Ukraine mein, Belarus border ke paas, ek vishaal nuclear power plant banaya gaya. Log ise Chernobyl kehte the."),
    dict(id="S12", dur=10.0, look="warm", motion="glide_lr", caption="aerial new Soviet town",
         text="प्लांट के वर्कर्स के लिए, बगल में एक नया शहर बसाया गया... प्रिप्यत। करीब उनचास हज़ार लोग। एवरेज उम्र, सिर्फ़ छब्बीस साल।",
         hinglish="Plant ke workers ke liye bagal mein ek naya shehar basaya gaya, Pripyat. Kareeb 49,000 log. Average umar sirf 26 saal."),
    dict(id="S13", dur=10.0, look="warm", motion="push_gentle", caption="central square, palace of culture",
         text="यहाँ स्विमिंग पूल थे, सिनेमा था, कल्चर पैलेस था। उस ज़माने में प्रिप्यत, सोवियत यूनियन के सबसे अच्छे शहरों में गिना जाता था।",
         hinglish="Yahan swimming pool the, cinema tha, culture palace tha. Us zamaane mein Pripyat Soviet Union ke sabse achhe shehron mein gina jaata tha."),
    dict(id="S14", dur=10.0, look="warm", motion="push_top_right", caption="playground, plant chimney on horizon",
         text="बच्चे पार्क्स में खेलते थे, और खिड़कियों से दूर, प्लांट की चिमनी दिखती थी। सब को लगता था... भविष्य यहीं है।",
         hinglish="Bachche parks mein khelte the, aur khidkiyon se door plant ki chimney dikhti thi. Sab ko lagta tha, bhavishya yahin hai."),
    dict(id="S15", dur=10.0, look="warm", motion="pan_rl", caption="nuclear plant, four reactor units",
         text="उन्नीस सौ छियासी तक यहाँ चार रिएक्टर चल रहे थे, और दो और बन रहे थे। ये रिएक्टर्स एक ख़ास डिज़ाइन के थे... आर. बी. एम. के.।",
         hinglish="1986 tak yahan chaar reactor chal rahe the, aur do aur ban rahe the. Yeh reactors ek khaas design ke the. RBMK."),
    dict(id="S16", dur=10.0, look="neutral_cool", motion="drift_down", caption="RBMK reactor hall floor",
         text="सस्ते, बड़े, और ताक़तवर। रिएक्टर हॉल के फ़र्श पर करीब दो हज़ार छोटे ढक्कन, और उनके नीचे... यूरेनियम का दिल।",
         hinglish="Saste, bade, aur taaqatwar. Reactor hall ke farsh par kareeb do hazaar chhote dhakkan, aur unke neeche uranium ka dil."),
    dict(id="S17", dur=10.0, look="cold_dark", motion="push_center_slow", caption="dim Soviet office at night, secret folder",
         text="लेकिन इस डिज़ाइन में एक ख़ामी थी। एक ऐसी ख़ामी, जिसके बारे में ऊपर के अफ़सर जानते थे...",
         hinglish="Lekin is design mein ek khaami thi. Ek aisi khaami jiske baare mein upar ke afsar jaante the..."),
    dict(id="S18", dur=8.0, look="cold_dark", motion="push_flicker", caption="hand locks folder in metal drawer",
         text="...पर रिएक्टर चलाने वालों को, पूरी तरह कभी बताया नहीं गया।",
         hinglish="...par reactor chalaane waalon ko poori tarah kabhi bataya nahi gaya."),
]

XFADE = 0.5                  # crossfade length S10->S11->...->S17
HARD_CUTS = {("S17", "S18")}  # straight cut
FADE_IN = 0.5                # picture fade from black at the start
# S18: fade to black 84.6 -> 85.3 (relative to S18 start: 4.6 -> 5.3)
S18_BLACK_FROM, S18_BLACK_TO = 4.6, 5.3

# Ken Burns: zoom (start, end), position u/v (0 = left/top, 1 = right/bottom of the free space)
MOTIONS = {
    "tilt_up":          dict(z=(1.06, 1.075), u=(0.5, 0.5), v=(1.0, 0.0)),
    "push_center":      dict(z=(1.0, 1.08), u=(0.5, 0.5), v=(0.5, 0.5)),
    "glide_lr":         dict(z=(1.07, 1.07), u=(0.0, 1.0), v=(0.5, 0.5)),
    "push_gentle":      dict(z=(1.0, 1.06), u=(0.5, 0.5), v=(0.55, 0.5)),
    "push_top_right":   dict(z=(1.0, 1.08), u=(0.5, 0.9), v=(0.5, 0.15)),
    "pan_rl":           dict(z=(1.07, 1.07), u=(1.0, 0.0), v=(0.5, 0.5)),
    "drift_down":       dict(z=(1.07, 1.07), u=(0.5, 0.5), v=(0.0, 1.0)),
    "push_center_slow": dict(z=(1.0, 1.07), u=(0.5, 0.5), v=(0.5, 0.5)),
    "push_flicker":     dict(z=(1.0, 1.06), u=(0.5, 0.5), v=(0.5, 0.5)),
}

# ----------------------------------------------------------- screen text ---
# (scene, start offset, end offset, kind, lines)
TEXTS = [
    dict(name="T1", scene="S10", t0=1.0, t1=6.0, title="1970s · SOVIET UNION", size=40),
    dict(name="T2", scene="S11", t0=1.0, t1=6.0, title="CHERNOBYL, UKRAINE (USSR)", size=40),
    dict(name="T3", scene="S12", t0=2.0, t1=8.0, title="PRIPYAT", size=70,
         sub="49,000 log · Average umar 26 saal", sub_size=38,
         count=dict(value=49000, seconds=1.5)),
    dict(name="T4", scene="S15", t0=1.0, t1=6.0, title="4 REACTOR CHALU · 2 BAN RAHE", size=40),
    dict(name="T5", scene="S15", t0=6.5, t1=9.5, title="RBMK", size=40),
]
TEXT_MARGIN = 80
TEXT_OPACITY = 0.88
TEXT_FADE = 0.4
FONT_URLS = [
    "https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf",
    "https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/Oswald%5Bwght%5D.ttf",
]
FONT_FALLBACKS = [
    r"C:\Windows\Fonts\arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
]

# ---------------------------------------------------------------- sounds ---
# Level as % of the voice -> dB (the table from the brief)
PCT_DB = {35: -9.0, 30: -10.5, 25: -12.0, 20: -14.0, 15: -16.5, 12: -18.5,
          10: -20.0, 8: -22.0, 6: -24.0, 5: -26.0}

# Timed sounds, ORIGINAL absolute times. dur="scene" = the whole scene (overlapping the
# 0.5 s picture crossfades), "to_end" = until the end, until=T = up to that time.
# keys = words looked for in file names inside sfx/ (first match wins).
SFX_EVENTS = [
    dict(name="flags",        t=0.0,  dur="scene", pct=12, keys=["flag"]),
    dict(name="crowd_far",    t=2.0,  dur=8.0,     pct=8,  keys=["crowd", "murmur", "walla"]),
    dict(name="construction", t=10.0, dur="scene", pct=12, keys=["construction"]),
    dict(name="crane",        t=14.0, dur=3.0,     pct=10, keys=["crane"]),
    dict(name="city",         t=20.0, dur="scene", pct=10, keys=["city", "traffic", "birds"]),
    dict(name="car",          t=24.0, dur=4.0,     pct=12, keys=["car"]),
    dict(name="square",       t=30.0, dur="scene", pct=10, keys=["square", "kids", "children", "laugh", "crowd"]),
    dict(name="swing",        t=40.0, dur=8.0,     pct=12, keys=["swing", "creak"], fout=1.0),   # fades out 47-48 s under the gust
    dict(name="gust",         t=47.0, dur=2.8,     pct=15, keys=["gust"]),
    dict(name="hum_plant",    t=50.0, dur="scene", pct=12, keys=["industrial", "factory"]),
    dict(name="powerline",    t=52.0, dur=6.0,     pct=8,  keys=["powerline", "power_line", "power-line", "power line", "electric", "buzz"]),
    dict(name="reactor_hall", t=60.0, dur="scene", pct=15, keys=["reactor", "hall"]),
    dict(name="footsteps",    t=62.0, dur=4.0,     pct=15, keys=["footstep", "steps"]),
    dict(name="clock",        t=70.0, until=85.0,  pct=10, keys=["clock", "tick"]),
    dict(name="paper",        t=73.0, dur=0.8,     pct=15, keys=["paper", "rustle"]),
    dict(name="key",          t=82.0, dur=0.9,     pct=30, keys=["key", "lock"]),
    dict(name="drawer",       t=85.0, dur=1.5,     pct=35, keys=["drawer"]),       # t = moment of impact
    dict(name="room_tone",    t=70.0, dur="to_end", pct=6, keys=["roomtone", "room_tone", "room tone"]),
]
# clicks and slams keep their natural attack (no fade-in)
NO_FADE = {"footsteps", "clock", "key", "drawer"}

WIND = dict(pct_start=6, pct_end=10, rise_at=70.0, rise_len=2.0, fade_from=85.3, keys=["wind"])

MUSIC = dict(
    nostalgic=dict(pct=12, t0=0.0, t1=70.0, fade_in=1.0, keys=["music_nostalgic", "nostalgic"]),
    dark=dict(pct=10, t0=70.0, t1=85.0, fade_out_to=87.0, keys=["music_dark", "dark", "drone"]),
    crossfade=2.0,
    duck_db=-4.0, duck_attack=0.15, duck_release=0.40,
)

MASTER_LUFS = -14.0
MASTER_TP = -1.0
