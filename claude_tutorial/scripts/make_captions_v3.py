"""Captions for the full episode: English SRT + Hinglish SRT, and an ASS file (English) for burning in.
Usage: python3 make_captions_v3.py <timings.json> <out_prefix>   -> <prefix>.en.srt, <prefix>.hinglish.srt, <prefix>.en.ass
"""
import json, sys
tim = [p for p in json.load(open(sys.argv[1]))["timings"] if not p.get("pause")]
pre = sys.argv[2]
def hold(i):
    nxt = tim[i + 1]["start"] if i + 1 < len(tim) else tim[i]["end"] + 1.0
    return min(tim[i]["end"] + 0.35, nxt - 0.06)
def srt_ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
def ass_ts(x):
    cs = int(round(x * 100)); h, cs = divmod(cs, 360000); m, cs = divmod(cs, 6000); s, cs = divmod(cs, 100)
    return f"{h}:{m:02}:{s:02}.{cs:02}"
for key, name in (("en", "en"), ("text", "hinglish")):
    with open(f"{pre}.{name}.srt", "w", encoding="utf-8") as f:
        for i, p in enumerate(tim):
            f.write(f"{i+1}\n{srt_ts(p['start'])} --> {srt_ts(hold(i))}\n{p[key]}\n\n")
with open(f"{pre}.en.ass", "w", encoding="utf-8") as f:
    f.write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter SemiBold,40,&H00FFFFFF,&H00FFFFFF,&H3A000000,&H3A000000,0,0,0,0,100,100,0,0,3,14,0,2,300,300,34,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
    for i, p in enumerate(tim):
        ml = 840 if p["scene"] == "account" else 0   # keep clear of the zoomed account row (bottom-left)
        f.write(f"Dialogue: 0,{ass_ts(p['start']-0.05)},{ass_ts(hold(i))},Cap,,{ml},0,0,,{{\\fad(80,80)}}{p['en']}\n")
print(len(tim), "captions")
