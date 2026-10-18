#!/usr/bin/env python3
"""
Final delivery package: every upload file in one folder + one ZIP, with a
one-page guide (A4 PDF, Hinglish) that says what each file is and the upload order.

  output/Final_Guide.pdf                       - the guide (also inside the ZIP)
  <scratchpad>/Sales_MIS_Final_Package.zip     - everything below, ready to download

Run after build_video.py (both modes), make_thumbnails.py, make_subtitles.py,
make_practice_file.py and make_upload_kit.py.

Usage: python3 scripts/make_final_package.py
"""
import html, json, os, shutil, subprocess, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.environ["MIS_MODE"] = "novoice"
import build_video as bv   # noqa: E402  (paths only)

ROOT = os.path.dirname(HERE)
FONTS = f"{ROOT}/assets/fonts"
PKG = f"{bv.SCR}/Sales_MIS_Final_Package"
ZIP = f"{bv.SCR}/Sales_MIS_Final_Package.zip"
GUIDE = f"{ROOT}/output/Final_Guide.pdf"

# (folder in the package, source file)
FILES = [
    ("1_Video_Without_Voice", "output/mis_tutorial_no_voice.mp4"),
    ("2_Video_With_Voice", "output/mis_tutorial_animated.mp4"),
    ("2_Video_With_Voice", "subtitles/subtitles.srt"),
    ("3_Thumbnails", "output/thumbnails/thumbnail_A_raw_to_dashboard.jpg"),
    ("3_Thumbnails", "output/thumbnails/thumbnail_B_kpi_dashboard.jpg"),
    ("3_Thumbnails", "output/thumbnails/thumbnail_C_pivot_slicer.jpg"),
    ("4_SEO_Upload_Kit", "output/youtube/YouTube_Upload_Kit.pdf"),
    ("4_SEO_Upload_Kit", "output/youtube/YouTube_Copy_Paste.txt"),
    ("5_Subtitles", "subtitles/youtube_english.srt"),
    ("5_Subtitles", "subtitles/youtube_hinglish.srt"),
    ("6_Practice_Files", "practice/Sales_MIS_Practice.xlsx"),
    ("6_Practice_Files", "practice/Sales_MIS_Solution.xlsx"),
]


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height,r_frame_rate",
                          "-of", "json", path], capture_output=True, text=True, check=True).stdout
    d = json.loads(out)
    v = next(s for s in d["streams"] if "width" in s)
    secs = float(d["format"]["duration"])
    return f"{v['width']}×{v['height']} · {eval(v['r_frame_rate']):.0f} fps · {int(secs // 60)}:{int(secs % 60):02d}"


def size(path):
    b = os.path.getsize(path)
    return f"{b / 2**20:.1f} MB" if b > 2**20 else f"{max(1, b // 1024)} KB"


def cues(path):
    return sum(1 for line in open(path, encoding="utf-8") if "-->" in line)


e = html.escape
NV, WV = f"{ROOT}/output/mis_tutorial_no_voice.mp4", f"{ROOT}/output/mis_tutorial_animated.mp4"
DESC = {
    "mis_tutorial_no_voice.mp4": f"Main upload. Sirf music + sound effects, koi voice nahi, screen par subtitles nahi. {probe(NV)}",
    "mis_tutorial_animated.mp4": f"AI Hindi voice + Hinglish captions screen par. {probe(WV)}",
    "subtitles.srt": "Voice wale video ki Hinglish captions (video mein pehle se jali hui hain; upload optional)",
    "thumbnail_A_raw_to_dashboard.jpg": "1280×720 · Raw data → Dashboard (pehle isse lagayein)",
    "thumbnail_B_kpi_dashboard.jpg": "1280×720 · KPI dashboard",
    "thumbnail_C_pivot_slicer.jpg": "1280×720 · Pivot + Slicer",
    "YouTube_Upload_Kit.pdf": "Title, description, chapters, tags, hashtags, settings, practice-file steps (A4)",
    "YouTube_Copy_Paste.txt": "Wahi title / description (dono videos ke liye) / tags / pinned comment, seedha copy-paste",
    "youtube_english.srt": f"English subtitles, {cues(f'{ROOT}/subtitles/youtube_english.srt')} cues, dono videos par fit",
    "youtube_hinglish.srt": f"Hinglish subtitles, {cues(f'{ROOT}/subtitles/youtube_hinglish.srt')} cues, bina voice wale video ke liye",
    "Sales_MIS_Practice.xlsx": "Viewers ke liye: same data, yellow cells bharne hain, Start_Here par tasks + 16-point self-check",
    "Sales_MIS_Solution.xlsx": "Video wala finished workbook (answer key)",
}

rows = "".join(
    f"<tr><td><b>{e(folder)}</b></td><td><code>{e(os.path.basename(src))}</code></td>"
    f"<td>{e(DESC[os.path.basename(src)])}</td><td class='n'>{size(f'{ROOT}/{src}')}</td></tr>"
    for folder, src in FILES)

DOC = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Mont;font-weight:800;src:url('file://{FONTS}/montserrat-latin-800-normal.woff2')}}
@page{{size:A4;margin:14mm 14mm 14mm 14mm}}
body{{font-family:Carlito,Calibri,'DejaVu Sans',sans-serif;font-size:10.2pt;color:#1b1b1b;line-height:1.36}}
h1{{font-family:Mont,sans-serif;font-size:19pt;color:#0f2b55;margin:0 0 1mm}}
h2{{font-family:Mont,sans-serif;font-size:11.5pt;color:#107C41;margin:5mm 0 1.5mm;border-bottom:1px solid #d9e2ec;padding-bottom:1mm}}
.sub{{color:#555;margin-bottom:3mm}}
table{{border-collapse:collapse;width:100%;font-size:9.2pt}}
td,th{{border:1px solid #d6dde6;padding:3px 6px;text-align:left;vertical-align:top}}
th{{background:#eef3f8}}
code{{font-family:'DejaVu Sans Mono',monospace;font-size:8.2pt}}
.n{{color:#666;white-space:nowrap}}
ol,ul{{margin:1mm 0 1mm 5mm;padding-left:3mm}} li{{margin:.8mm 0}}
.note{{background:#fff8e1;border-left:4px solid #e8a200;padding:5px 8px;font-size:9.6pt}}
.pb{{page-break-before:always}}
</style></head><body>
<h1>Sales MIS Report: Final Package</h1>
<div class="sub">Sab files ek jagah: <code>Sales_MIS_Final_Package.zip</code>. Har folder mein kya hai, kaunsa upload karna hai, aur kis order mein.</div>

<h2>1. Package mein kya hai</h2>
<table><tr><th>Folder</th><th>File</th><th>Kya hai</th><th>Size</th></tr>{rows}
<tr><td><b>(root)</b></td><td><code>Final_Guide.pdf</code></td><td>Yeh guide</td><td></td></tr></table>

<h2>2. Kaunsa video upload karein</h2>
<ul>
<li><b>Recommended: bina voice wala video</b> (<code>1_Video_Without_Voice</code>). Saath mein English aur Hinglish dono SRT upload karein; viewer CC se language chun leta hai.</li>
<li><b>Voice wala video</b> lagana ho to description <code>YouTube_Copy_Paste.txt</code> ke "WITH voice" section se lein. Isme likha hai ki voice AI-generated hai. Hinglish captions video mein pehle se hain; sirf English SRT upload karein.</li>
<li>Dono videos ki length (10:45) aur har step ka time bilkul same hai, isliye chapters aur English SRT dono par sahi baithte hain.</li>
<li>Ek hi channel par dono ek saath publish na karein; YouTube same content ko duplicate maan sakta hai. Doosra wala alag channel ya baad mein "voice version" ke roop mein.</li>
</ul>

<h2>3. Upload ka order (YouTube Studio)</h2>
<ol>
<li><b>Practice files pehle:</b> Google Drive par folder banao → dono .xlsx upload → Share → <b>Anyone with the link</b>, role <b>Viewer</b> → Copy link. Incognito window mein khol kar check karo.</li>
<li><b>Create → Upload video</b> → video file chuno.</li>
<li><b>Title:</b> <code>YouTube_Copy_Paste.txt</code> se. <b>Description:</b> wahi file se; <b>PASTE-YOUR-LINK-HERE</b> ki jagah Drive link daalo.</li>
<li><b>Thumbnail:</b> Test &amp; compare mein A, B, C teeno daalo (ya sirf A).</li>
<li><b>Show more → Tags:</b> tags paste karo. Language: Hindi. Category: Education.</li>
<li><b>Subtitles:</b> Add language → English → Upload file → With timing → <code>youtube_english.srt</code>. Phir Hindi (Latin) / Hindi → <code>youtube_hinglish.srt</code>.</li>
<li>Audience: "No, it's not made for kids". End screen: Subscribe + ek video.</li>
<li>Publish ke baad <b>pinned comment</b> post karke pin karo (usme bhi Drive link daalo).</li>
</ol>

<h2>4. Zaroori notes (publish se pehle padhein)</h2>
<ul>
<li><b>Animated recreation:</b> video Excel 365 ka animated recreation hai (HTML se frame-by-frame bana), asli screen recording nahi. Har frame ke title bar par "Animated recreation" likha hai. Saare numbers asli workbook se aate hain.</li>
<li><b>AI voice:</b> voice wale video ki awaaz Kokoro-82M text-to-speech (open source) ki hai, insaan ki nahi. Description mein yeh likha hai; isse hatana nahi.</li>
<li><b>Music aur sound effects</b> script se khud banaye gaye hain, koi copyright track nahi. Fonts (Anton, Montserrat) SIL Open Font License ke hain.</li>
<li><b>Sample data fictional hai</b> (180 October 2026 transactions); koi asli company ka data nahi.</li>
<li><b>Pivot Tables / Charts / Slicers:</b> video mein dikhaye gaye hain, par .xlsx files mein native pivots nahi hain (unhe Python se banana sambhav nahi). Viewers practice file ke Start_Here tasks se Excel mein khud banate hain; Pivot_Analysis sheet mein steps likhe hain.</li>
<li><b>Solution file mein Read_Me sheet hai</b>; video mein nahi dikhti. Practice file mein uski jagah Start_Here sheet hai.</li>
<li><b>SEO:</b> title, tags, description standard YouTube practice par bane hain, par live search-volume data se check nahi hue (vidIQ credits kam the). Publish se pehle YouTube search box mein "mis report in excel" type karke suggestions dekh lein.</li>
<li><b>Check kiya gaya:</b> dono videos 645.5 s; bina voice wala −16.0 LUFS / peak −3.2 dBFS, voice wala −14.8 LUFS / peak −2.3 dBFS. Practice self-check: khaali file 0/16, sahi answers 16/16, ek galat answer 15/16.</li>
</ul>

<h2>5. Workbook ke sahi answers (October 2026)</h2>
<table>
<tr><th>Total Sales</th><th>Total Orders</th><th>Units Sold</th><th>Avg Sales / Order</th><th>Pending Sales Amount</th></tr>
<tr><td>1,428,190</td><td>180</td><td>11,834</td><td>7,934.39</td><td>372,985</td></tr></table>
<table style="margin-top:2mm">
<tr><th>East</th><th>West</th><th>North</th><th>South</th><th>Tea A</th><th>Tea B</th><th>Tea C</th></tr>
<tr><td>351,030</td><td>383,675</td><td>355,130</td><td>338,355</td><td>385,320</td><td>432,820</td><td>610,050</td></tr></table>
<p class="n">Region total = Product total = Pivot Grand Total = Total Sales = 1,428,190.</p>
</body></html>"""

if __name__ == "__main__":
    hp = f"{bv.SCR}/final_guide.html"
    open(hp, "w", encoding="utf-8").write(DOC)
    subprocess.run([bv.CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    "--virtual-time-budget=2000", f"--print-to-pdf={GUIDE}", f"file://{hp}"],
                   capture_output=True, check=True)
    print(GUIDE, size(GUIDE))

    shutil.rmtree(PKG, ignore_errors=True)
    for folder, src in FILES:
        os.makedirs(f"{PKG}/{folder}", exist_ok=True)
        shutil.copy2(f"{ROOT}/{src}", f"{PKG}/{folder}/")
    shutil.copy2(GUIDE, f"{PKG}/Final_Guide.pdf")
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for d, _, names in sorted(os.walk(PKG)):
            for n in sorted(names):
                p = f"{d}/{n}"
                z.write(p, os.path.relpath(p, os.path.dirname(PKG)))
    with zipfile.ZipFile(ZIP) as z:
        print(f"{ZIP}  {size(ZIP)}, {len(z.namelist())} files")
        for n in z.namelist():
            print("  ", n)
