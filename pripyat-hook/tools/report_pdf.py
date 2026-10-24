"""A4 review report for the Chernobyl hook (Hinglish)."""
import json
import sys

import numpy as np
import soundfile as sf
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

tl_path, seg_path, voice_dir, sheet, bebas, out = sys.argv[1:7]
tl = json.load(open(tl_path))
segs = json.load(open(seg_path))

pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Bebas", bebas))

INK = colors.HexColor("#1d2421")
MUTED = colors.HexColor("#5b6660")
ACCENT = colors.HexColor("#6f7d2b")
RULE = colors.HexColor("#c9cfc8")
FILL = colors.HexColor("#eef1ec")
OK = colors.HexColor("#2f6b3a")
FIX = colors.HexColor("#9a5b12")

h1 = ParagraphStyle("h1", fontName="Bebas", fontSize=30, leading=32, textColor=INK, spaceAfter=2)
h2 = ParagraphStyle("h2", fontName="Bebas", fontSize=17, leading=20, textColor=ACCENT, spaceBefore=10, spaceAfter=4)
body = ParagraphStyle("b", fontName="DV", fontSize=9, leading=12.5, textColor=INK, alignment=TA_LEFT)
small = ParagraphStyle("s", parent=body, fontSize=7.8, leading=10.2)
muted = ParagraphStyle("m", parent=body, textColor=MUTED, fontSize=8.5)
cell = ParagraphStyle("c", parent=body, fontSize=7.8, leading=10)
cellb = ParagraphStyle("cb", parent=cell, fontName="DVB")


def P(t, st=body):
    return Paragraph(t, st)


def fmt(t):
    m, s = divmod(t, 60)
    return f"{int(m)}:{s:05.2f}"


def table(rows, widths, head=True, zebra=True):
    data = [[P(c, cellb if (head and r == 0) else cell) if isinstance(c, str) else c for c in row]
            for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if head else 0)
    style = [("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, 0), 0.8, INK),
             ("LINEBELOW", (0, 1), (-1, -1), 0.3, RULE), ("LEFTPADDING", (0, 0), (-1, -1), 4),
             ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 3),
             ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]
    if zebra:
        style += [("BACKGROUND", (0, r), (-1, r), FILL) for r in range(2, len(rows), 2)]
    t.setStyle(TableStyle(style))
    return t


def wpm(path, words, pause_cut=0.15):
    a, sr = sf.read(path)
    a = a[:, 0] if a.ndim > 1 else a
    w = int(0.01 * sr)
    e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, len(a) - w, w)])
    v = e > e.max() * 0.03
    idx = np.nonzero(v)[0]
    runs, cur, longest = 0.0, 0, 0.0
    for i in range(idx[0], idx[-1] + 1):
        if not v[i]:
            cur += 1
        else:
            if cur * 0.01 >= pause_cut:
                runs += cur * 0.01
                longest = max(longest, cur * 0.01)
            cur = 0
    speech = (idx[-1] + 1 - idx[0]) * 0.01 - runs
    return words / speech * 60, longest


LINES = {
    "01": ("Yeh ek aisa shehar hai... jahan chaalis saal se koi nahi rehta.", 11),
    "02": ("School mein bachchon ki kitaabein... aaj bhi khuli padi hain.", 9),
    "03": ("Mez par chai ke cup rakhe hain. Zameen par ek family ki tasveer.", 12),
    "04": ("Bachchon ke khilaune... sab wahin ruke hain, jahan chhode gaye the.", 11),
    "05": ("Kyunki is hawa mein kuch aisa hai... jo aankhon se dikhta nahi.", 11),
    "06a": ("26 April 1986. Raat ek baj kar teis minute.", 11),
    "06b": ("[dhamaka] Ek reactor phata.", 3),
    "07": ("Kareeb pachaas hazaar log... sirf teen din ke liye ghar chhod kar nikle.", 13),
    "08a": ("Woh kabhi laut kar nahi aaye.", 6),
    "08b": ("[2 sec ruko] Yeh kahani hai... Chernobyl ki.", 5),
}
SHOT = {"01": "Avenue (khaali sadak, blocks)", "02": "Classroom", "03": "Ghar: mez, chai ke cup, tasveer",
        "04": "Amusement park (Ferris wheel, bumper cars)", "05": "Dosimeter DP-5V", "06": "Reactor, raat, dhuaan",
        "07": "Buses aur saaman", "08": "Ferris wheel"}
SCRIPT = {"01": (0, 5), "02": (5, 10), "03": (10, 15), "04": (15, 20), "05": (20, 25), "06": (25, 30),
          "07": (30, 35), "08": (35, 42), "09": (42, 46)}

sc, ev, st = tl["scenes"], tl["events"], tl["stats"]
end = tl["end"]
story = []

story += [P("Chernobyl Hook · Review &amp; Fix Report", h1),
          P(f"Aapka export.mp4 (0:00–0:45.5) script ke hisaab se check kiya aur theek kiya. "
            f"24 October 2026 · Final: <b>HOOK_FINAL_WITH_VOICE.mp4</b> ({end:.1f} s)", muted), Spacer(1, 6)]

story += [P("Short mein", h2)]
summary = [
    "Aapke shots ka order script jaisa hi hai, aur saare shots achhe hain. Koi shot badla nahi gaya, sirf unki timing aur finishing theek ki hai.",
    "Export mein <b>audio bilkul nahi tha</b> (−91 dB, yaani khaali). Ab poora audio hai: 8 lines ki voice, music, hawa aur har scene ke SFX.",
    f"Script ki 140–150 wpm speed aur \"...\" ke aadhe second ke pause ke saath lines bolne par hook <b>{end:.1f} s</b> ka banta hai, 46 s ka nahi. "
    "Notes kehte hain \"voice ko tez mat karo, clip ko voice ke hisaab se khisko\", isliye shots khiske hain. Part 1 ab "
    f"<b>{fmt(end)}</b> par shuru hoga (+{end - 46:.1f} s).",
    "Jo cheezein add ki gayi: shuru mein black se 0.5 s fade-in, <b>CHERNOBYL title card</b> aur Geiger click, dhamake par flash aur shake, "
    "poore video mein ek jaisa halka thanda grade, halka vignette aur grain.",
    f"Export ab script ke hisaab se hai: 1920×1080, 25 fps, H.264 14 Mbps, AAC 320 kbps / 48 kHz, loudness {st['lufs']} LUFS, "
    f"voice peak {st['voice_peak_db']} dB.",
]
story += [P("• " + s) for s in summary]

story += [P("Script ke rules vs aapka export", h2)]
rows = [["Rule (script / Notes)", "Export mein", "Ab"]]
rows += [
    ["Scene 01: video black se, 0.5 s fade-in", "Nahi tha", "Add kiya"],
    ["Voice 140–150 wpm, \"...\" par aadha second pause", "Audio nahi tha", "10 lines, 144–157 wpm; \"...\" 0.48–0.50 s"],
    ["Voice peak −6 se −3 dB", "—", f"{st['voice_peak_db']} dB"],
    ["Music 10–14% voice ke neeche, ducking 3–4 dB, pause mein 20–25% tak", "—",
     "Drone 10% voice ke neeche, gaps mein 14.5% (+3.2 dB), 2 s pause mein 20%, title hit par khatam"],
    ["Ambience 8–20%", "—", "Wind 15%, room tone 12%, bus engines 12%"],
    ["Chhote SFX 20–35%", "—", "16–25% (crow 10% jaisa card mein tha)"],
    ["Bada hit 50–90%, sirf jahan voice nahi", "—", f"Dhamaka 75% at {fmt(ev['boom'])} (do lines ke beech), title hit 60%"],
    ["Har SFX mein 0.3–0.5 s fade", "—", "Saare SFX mein fade hai"],
    ["Final loudness lagbhag −14 LUFS", "—", f"{st['lufs']} LUFS"],
    ["Clip speed 70–80%, 50% se kam nahi", "—", "Sabse slow 66% (park) aur 67% (ghar), frame blending ke saath"],
    ["Transition: seedha cut", "Seedhe cuts", "Waise hi rakhe"],
    ["Ek thanda faded look + halka vignette", "Rang alag-alag (reactor neon)", "Halka grade: saturation 86%, thanda balance, halka vignette, fine grain"],
    ["Scene 09: Title CHERNOBYL + Geiger click", "Nahi tha", f"Bebas Neue, safed, {fmt(sc['09'])}–{fmt(end)}, 3 Geiger clicks"],
    ["Export: 1080p, ek fps, H.264 12–16 Mbps, AAC 48 kHz 320 kbps", "25 fps, 5.0 Mbps, audio nahi", "25 fps, 14 Mbps, AAC 320k 48 kHz"],
    ["Insaan door se / chehre nahi", "Theek (sirf dastane wala haath)", "Theek"],
]
story += [table(rows, [62 * mm, 40 * mm, 76 * mm])]

story += [P("Naya timeline (har scene)", h2)]
rows = [["#", "Script", "Ab", "Shot (aapke export se)", "Speed", "Note"]]
by = {s["key"]: s for s in segs}
nxt = {"01": "02", "02": "03", "03": "04", "04": "05", "05": "06", "06": "07", "07": "08", "08": "09"}
for k in ("01", "02", "03", "04", "05", "06", "07", "08"):
    a, b = sc[k], sc[nxt[k]]
    s = by[k]
    note = ""
    if k == "04":
        note = f"Park shot {fmt(ev['cut05'])} tak chalta hai (scene 05 ki pehli line ke neeche)"
    if k == "05":
        note = f"Dosimeter par cut {fmt(ev['cut05'])}, \"...\" wale pause par (J-cut)"
    if k == "06":
        note = f"Dhamaka + flash {fmt(ev['boom'])}, reactor ke laal peak par"
    if k in ("03", "04"):
        note = (note + "; " if note else "") + "70% se thoda kam speed"
    src = f"{SHOT[k]} · src {fmt(s['src'][0])}–{fmt(s['src'][1])}"
    rows.append([k, f"0:{SCRIPT[k][0]:02d}–0:{SCRIPT[k][1]:02d}", f"{fmt(a)}–{fmt(b)}", src, f"{s['speed'] * 100:.0f}%", note])
rows.append(["09", "0:42–0:46", f"{fmt(sc['09'])}–{fmt(end)}", "Black + CHERNOBYL title", "—", "Title hit, drone yahin khatam"])
story += [table(rows, [7 * mm, 18 * mm, 31 * mm, 49 * mm, 14 * mm, 59 * mm])]
story += [Spacer(1, 5), Image(sheet, width=178 * mm, height=178 * mm * 864 / 2304),
          P("Har cut ke theek pehle/baad ke frames aur title. Kahin bhi agle shot ka frame nahi ghusa.", small)]

story += [P("Voice lines (exact times)", h2)]
rows = [["#", "Line", "Start–End", "wpm", "\"...\" pause"]]
for k, (text, words) in LINES.items():
    v = tl["voices"][k]
    w, longest = wpm(f"{voice_dir}/v_{k}.wav", words)
    has = "..." in text and not text.startswith("[")
    rows.append([k, text, f"{fmt(v['start'])}–{fmt(v['end'])}", f"{w:.0f}", f"{longest:.2f} s" if has or k == "08b" else "—"])
story += [table(rows, [10 * mm, 92 * mm, 32 * mm, 12 * mm, 22 * mm])]
story += [P("Line 06b aur 08b chhoti aur dramatic lines hain, isliye thodi dheemi hain (112 / 133 wpm). "
            "Voice: Kokoro TTS (open-source, Apache-2.0) ki Hindi male voice <i>hm_omega</i>, 1.5 semitone neeche. "
            "\"Chernobyl\" ko \"Cher-no-bil\" bolta hai, jaisa aapke pronunciation table mein hai.", small)]

story += [P("Sound cue sheet", h2)]
rows = [["Time", "Awaaz", "Level"]]
rows.append(["0:00.00–end", "Hawa (wind howl), 2 s fade-in", "15%"])
rows.append([f"0:00.00–{fmt(sc['09'])}", "Dark ambient drone, ducking ke saath, title hit par khatam", "10% / 14.5% / 20%"])
for c in tl["cues"]:
    rows.append([fmt(c["at"]), c["name"], c["level"]])
story += [table(rows, [28 * mm, 110 * mm, 40 * mm])]
story += [P("Saari awaazein code se synthesize ki gayi hain, koi sample use nahi hua, isliye copyright ya Content ID ka risk nahi hai.", small)]

story += [P("Aapke decision ke liye", h2)]
notes = [
    f"<b>Hook length.</b> {end:.1f} s, jabki script mein 46 s tha. Agar theek 0:46 chahiye to do raaste hain: (a) lines chhoti karo, main chhote versions likh sakta hoon; "
    "ya (b) voice ko lagbhag 170 wpm par karo, jo aapke Notes ke khilaaf hai. Abhi wala version Notes ke hisaab se hai.",
    "<b>Scenes 03–09 ke SFX.</b> PDF mein in scenes ke cards band (collapsed) the, isliye SFX maine Notes ke volume rules ke hisaab se chune hain. "
    "Inme parda, metal creak, Geiger, rumble, dhamaka, bus engine, hawa ka jhonka aur title hit hain. Aapke cards mein kuch aur likha ho to bhej do, badal dunga.",
    "<b>Scene 02 ka page flutter (0:08).</b> Card kehta hai \"jab video mein panna hilta hai\", lekin aapke classroom clip mein panna nahi hilta. "
    "Awaaz halki (20%) rakhi hai, hawa mein kaagaz ki sarsarahat jaisi. Chaho to panna hilne wala clip dobara banao, ya ye SFX hata do.",
    "<b>Dosimeter shot sirf 2 s ka hai.</b> Isliye park ka shot \"Kyunki is hawa mein kuch aisa hai...\" ke neeche chalta hai, aur \"...\" par dosimeter par cut hota hai. "
    "Agar dosimeter 0:21.6 se chahiye to 5–6 s ka dosimeter clip bana lo.",
    "<b>Scene 03 aur 04 ki speed 66–67% hai.</b> Ye Notes ke 70–80% se thodi kam aur 50% ki limit se upar hai, frame blending ke saath. "
    "Sabse achhi quality ke liye ghar wala clip 6 s ka aur park wala 9 s ka generate karo.",
    "<b>AI voice.</b> Ye synthetic awaaz hai. Apni awaaz lagani ho to HOOK_FINAL_video_only.mp4 aur HOOK_mix_NO_VOICE.wav editor mein rakho, "
    "aur upar ki voice table ke times par bolo.",
    "<b>Sunna zaroori hai.</b> Maine sab kuch measurement aur spectrogram se check kiya hai, kyunki main sun nahi sakta. "
    "Notes ke mutabik ek baar headphone par aur ek baar phone speaker par suno, khaas kar 0:32.5 ka dhamaka.",
    "<b>YouTube.</b> Upload par \"Altered or synthetic content\" = Yes chunna (Notes, point 8).",
]
story += [P("• " + n) for n in notes]

story += [P("Files (repo: pripyat-hook/hook-final/)", h2)]
rows = [["File", "Kya hai"],
        ["HOOK_FINAL_WITH_VOICE.mp4", "Final hook: video, voice, music, SFX (upload ke liye)"],
        ["HOOK_FINAL_video_only.mp4", "Sirf video (re-timed, grade, title). Editor mein V1 par"],
        ["HOOK_mix_WITH_VOICE.wav / HOOK_mix_NO_VOICE.wav", "Poora audio, voice ke saath / bina voice"],
        ["stems/HOOK_voice, _sfx, _music_ducked, _wind.wav", "Alag tracks. Sab 100% par rakhne se upar wala mix banta hai"],
        ["voice_lines/v_01 … v_08b.wav", "Har line alag file mein"],
        ["timeline.json, segments.json", "Saare exact times aur clip speeds"]]
story += [table(rows, [80 * mm, 98 * mm])]
story += [Spacer(1, 4), P("Pehle wale scene-01/ aur scene-02/ drafts ab iske neeche aa gaye hain. Final ke liye hook-final/ use karo.", small)]


def page(canvas, doc):
    canvas.saveState()
    canvas.setFont("DV", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "Chernobyl documentary · Hook review")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"{doc.page}")
    canvas.restoreState()


doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=14 * mm,
                        bottomMargin=16 * mm, title="Chernobyl Hook Review", author="Claude")
doc.build(story, onFirstPage=page, onLaterPages=page)
print("ok", out)
