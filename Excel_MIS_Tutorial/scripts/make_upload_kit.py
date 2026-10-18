#!/usr/bin/env python3
"""
YouTube upload kit (A4 PDF) for output/mis_tutorial_no_voice.mp4:
titles, description with chapters, tags, hashtags, upload settings,
thumbnail previews and caption files.

Chapter times come from the no-voice build timeline. YouTube rejects "<" and
">" in titles, descriptions and tags, so the checks below enforce that.

Usage: python3 scripts/make_upload_kit.py
"""
import html, json, os, subprocess, sys

os.environ["MIS_MODE"] = "novoice"
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_video as bv   # noqa: E402

ROOT = os.path.dirname(HERE)
OUTDIR = f"{ROOT}/output/youtube"
os.makedirs(OUTDIR, exist_ok=True)
FONTS = f"{ROOT}/assets/fonts"

# ---------------------------------------------------------------- chapters
timeline = json.load(open(f"{bv.WORK}/timeline_novoice.json", encoding="utf-8"))
CHAPTER_NAMES = {
    1: "Introduction", 2: "Understanding the raw data", 3: "Convert data to an Excel Table (Ctrl + T)",
    4: "Sales Amount with structured references", 5: "KPI cards: SUMIFS, COUNTIFS, IFERROR",
    6: "Region-wise & product-wise analysis", 7: "Create a Pivot Table", 8: "Pivot Charts (column + pie)",
    9: "Slicers & Report Connections", 10: "Dashboard formatting", 11: "Refresh & validate the report",
    12: "Summary",
}
starts = {}
for row in timeline:
    starts.setdefault(row["scene"], row["start"])
starts[1] = 0.0                      # YouTube requires the first chapter at 0:00
chapters = [f"{int(t // 60)}:{int(t % 60):02d} {CHAPTER_NAMES[s]}" for s, t in sorted(starts.items())]

# ---------------------------------------------------------------- copy
TITLE = "MIS Report in Excel | Sales Dashboard Step by Step (Pivot + Slicer)"
ALT_TITLES = [
    "How to Make MIS Report in Excel | Sales Dashboard from Raw Data",
    "Excel MIS Report for Beginners | SUMIFS, COUNTIFS, Pivot Table & Slicers",
    "Sales Dashboard in Excel | MIS Executive Skills | Raw Data to Report",
    "MIS Report in Excel: Pivot Table + Slicer Dashboard (Step by Step)",
]

DESCRIPTION = "\n".join([
    "Learn how to build a complete Sales MIS Report in Excel, step by step: from 180 rows of raw sales data "
    "to a clean, interactive MIS dashboard with KPIs, Pivot Tables, Pivot Charts and Slicers.",
    "Turn on CC for English or Hinglish subtitles. (Hinglish subtitles available: CC on karein.)",
    "",
    "📥 FREE practice file (Excel): PASTE-YOUR-LINK-HERE",
    "Same 180-row sales data as the video. Yellow cells to fill, step-by-step tasks with video times, "
    "and a self-check sheet that scores your answers out of 16. The finished solution file is included.",
    "",
    "In this tutorial:",
    "✔ Convert raw data into an Excel Table (Ctrl + T) and name it SalesData",
    "✔ Sales Amount with a structured reference: =[@Qty]*[@[Unit Price]]",
    "✔ KPI cards with SUMIFS, COUNTIFS and IFERROR: Total Sales, Total Orders, Units Sold, Average Sales per Order, Pending Sales Amount",
    "✔ Region-wise and product-wise summary with % of total",
    "✔ Pivot Tables and Pivot Charts (clustered column + pie)",
    "✔ Slicers with Report Connections: one click filters every pivot and chart",
    "✔ Dashboard formatting, Refresh All (Ctrl + Alt + F5) and a 3-way validation of the totals",
    "",
    "Chapters",
    *chapters,
    "",
    "Formulas used",
    "• Sales Amount: =[@Qty]*[@[Unit Price]]",
    "• Total Sales: SUMIFS on SalesData[Sales Amount] with an October 2026 date range built using DATE()",
    "• Total Orders: COUNTIFS on non-blank SalesData[Invoice No] in the same date range",
    "• Average Sales per Order: =IFERROR(B6/D6,0)",
    "• Pending Sales Amount: SUMIFS with Payment Status = \"Pending\"",
    "",
    "How to practise: download the files, open Sales_MIS_Practice.xlsx in Excel 365, start on the Start_Here sheet "
    "and pause the video at each chapter. Stuck? Open Sales_MIS_Solution.xlsx.",
    "",
    "Useful for MIS executives, accounts and sales teams, Excel beginners and office job interview preparation.",
    "",
    "Note: this video is an animated walkthrough of Microsoft Excel 365 with background music and sound effects "
    "(no voiceover). The sample data is fictional.",
    "",
    "#MISReport #ExcelDashboard #ExcelTutorial",
])

TAGS = [
    "mis report in excel", "sales mis report", "mis report", "mis report kaise banaye", "excel dashboard",
    "sales dashboard in excel", "excel mis report", "mis report format in excel", "mis executive",
    "excel sales report", "pivot table in excel", "slicer in excel", "sumifs formula in excel",
    "countifs in excel", "excel table", "structured references excel", "pivot chart", "kpi dashboard excel",
    "excel for beginners", "advanced excel", "excel tutorial", "excel 365", "data analysis in excel",
    "excel practice file",
]
HASHTAGS = ["#MISReport", "#ExcelDashboard", "#ExcelTutorial"]
PINNED = ("📥 Free practice file + solution: PASTE-YOUR-LINK-HERE  |  Which part should I explain in more detail next: monthly MIS automation, a Power Query version, "
          "or an XLOOKUP dashboard? Comment below 👇")

# ---------------------------------------------------------------- checks
tags_csv = ", ".join(TAGS)
for label, text in [("title", TITLE), ("description", DESCRIPTION), ("tags", tags_csv)] + \
                   [(f"alt title {i}", t) for i, t in enumerate(ALT_TITLES, 1)]:
    assert "<" not in text and ">" not in text, f"YouTube rejects < or > in the {label}"
assert len(TITLE) <= 100 and all(len(t) <= 100 for t in ALT_TITLES)
assert len(DESCRIPTION) <= 5000
assert len(tags_csv) <= 500, len(tags_csv)

# ---------------------------------------------------------------- PDF
e = html.escape
thumbs = [("A", "thumbnail_A_raw_to_dashboard.jpg", "Raw data → dashboard (recommended first)"),
          ("B", "thumbnail_B_kpi_dashboard.jpg", "KPI dashboard, Total Sales circled"),
          ("C", "thumbnail_C_pivot_slicer.jpg", "Pivot + Slicer, one-click filter")]
thumb_html = "".join(
    f'<figure><img src="file://{ROOT}/output/thumbnails/{f}"><figcaption><b>{k}</b> · {e(c)}<br>'
    f'<code>output/thumbnails/{f}</code></figcaption></figure>' for k, f, c in thumbs)
alt_html = "".join(f"<li>{e(t)} <span class='n'>({len(t)} chars)</span></li>" for t in ALT_TITLES)

DOC = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Mont;font-weight:800;src:url('file://{FONTS}/montserrat-latin-800-normal.woff2')}}
@page{{size:A4;margin:16mm 15mm 16mm 15mm}}
body{{font-family:Carlito,Calibri,'DejaVu Sans',sans-serif;font-size:10.5pt;color:#1b1b1b;line-height:1.38}}
h1{{font-family:Mont,sans-serif;font-size:21pt;color:#0f2b55;margin:0 0 2mm}}
h2{{font-family:Mont,sans-serif;font-size:12.5pt;color:#107C41;margin:6mm 0 2mm;border-bottom:1px solid #d9e2ec;padding-bottom:1mm}}
.sub{{color:#555;margin-bottom:4mm}}
table{{border-collapse:collapse;width:100%;font-size:9.8pt}}
td,th{{border:1px solid #d6dde6;padding:4px 7px;text-align:left;vertical-align:top}}
th{{background:#eef3f8}}
.copy{{border:1px solid #c9d6e4;background:#f7fafc;border-radius:5px;padding:7px 9px;white-space:pre-wrap;
      font-family:'DejaVu Sans Mono',monospace;font-size:8.6pt;line-height:1.42}}
.title{{font-size:13pt;font-weight:700;color:#0f2b55}}
.n{{color:#777;font-size:9pt}}
.thumbs{{display:grid;grid-template-columns:1fr 1fr;gap:5mm}}
figure{{margin:0}} figure img{{width:100%;border:1px solid #ccd;border-radius:4px}}
figcaption{{font-size:9pt;color:#444;margin-top:1mm}}
.note{{background:#fff8e1;border-left:4px solid #e8a200;padding:6px 9px;font-size:9.6pt}}
.pb{{page-break-before:always}}
ul{{margin:1mm 0 1mm 5mm;padding-left:3mm}} li{{margin:1mm 0}}
code{{font-family:'DejaVu Sans Mono',monospace;font-size:8.6pt}}
</style></head><body>
<h1>YouTube Upload Kit: Sales MIS Report in Excel</h1>
<div class="sub">For <code>output/mis_tutorial_no_voice.mp4</code> · 1920×1080 · 30 fps · 10:54 · no voiceover, no burned-in subtitles · music + sound effects</div>

<h2>1. Files to upload</h2>
<table><tr><th>What</th><th>File</th><th>Where in YouTube Studio</th></tr>
<tr><td>Video</td><td><code>output/mis_tutorial_no_voice.mp4</code></td><td>Upload</td></tr>
<tr><td>Thumbnails (3)</td><td><code>output/thumbnails/thumbnail_A/B/C_*.jpg</code></td><td>Details → Thumbnail → <b>Test &amp; compare</b> (upload all three)</td></tr>
<tr><td>English subtitles</td><td><code>subtitles/youtube_english.srt</code></td><td>Subtitles → Add language: <b>English</b> → Upload file → With timing</td></tr>
<tr><td>Hinglish subtitles</td><td><code>subtitles/youtube_hinglish.srt</code></td><td>Subtitles → Add language: <b>Hindi (Latin)</b> if listed, otherwise <b>Hindi</b> → Upload file → With timing</td></tr>
<tr><td>Practice file</td><td><code>practice/Sales_MIS_Practice.xlsx</code></td><td rowspan="2">Not uploaded to YouTube. Share both from Google Drive (steps in section 2) and paste the link where the description and pinned comment say PASTE-YOUR-LINK-HERE</td></tr>
<tr><td>Solution file</td><td><code>practice/Sales_MIS_Solution.xlsx</code></td></tr>
</table>

<h2>2. Practice files (new)</h2>
<table>
<tr><th>File</th><th>What the viewer gets</th></tr>
<tr><td><code>Sales_MIS_Practice.xlsx</code></td><td>The same workbook as the video with the work removed. <b>Start_Here</b>: 9 tasks in video order, each with its chapter time. <b>Raw_Data</b>: the same 180 rows, not yet a Table, column H (Sales Amount) empty. <b>MIS_Dashboard</b>: same layout, every result cell empty. Light-yellow cells are the ones to fill. A <b>self-check</b> marks each answer ✔ Correct or ✘ Check again and shows a score out of 16.</td></tr>
<tr><td><code>Sales_MIS_Solution.xlsx</code></td><td>The finished workbook from the video: Table <i>SalesData</i>, all formulas, the dashboard. Excel 365 calculates everything when the file opens.</td></tr>
</table>
<p style="margin:2mm 0 1mm"><b>Share them for free with Google Drive</b></p>
<ul>
<li>drive.google.com → New → Folder "Sales MIS Practice Files" → upload both .xlsx files into it.</li>
<li>Right-click the folder → Share → General access: <b>Anyone with the link</b> → role <b>Viewer</b> → Copy link.</li>
<li>Paste the link in place of <b>PASTE-YOUR-LINK-HERE</b> in the description and in the pinned comment.</li>
<li>Open the link in a private/incognito window once, to confirm it opens without asking for access.</li>
</ul>
<div class="note">Tested here: on the blank practice file the score shows 0 / 16. With every answer filled correctly it shows 16 / 16. With one deliberate mistake (Units Sold counted as rows instead of summing Qty) it flags just that line and shows 15 / 16. Formula check: 0 errors. The solution file's data and formulas are identical to the video workbook.</div>

<h2>3. Title</h2>
<div class="title">{e(TITLE)}</div><div class="n">{len(TITLE)} characters. The main search phrase "MIS Report in Excel" comes first, so it survives truncation in search results.</div>
<p style="margin:2mm 0 0">Alternatives (rotate later, or keep for the next video in the series):</p><ul>{alt_html}</ul>

<h2>4. Tags</h2>
<div class="copy">{e(tags_csv)}</div><div class="n">{len(tags_csv)} / 500 characters. Paste as-is into the Tags box. YouTube splits on commas.</div>

<h2>5. Hashtags</h2>
<div class="copy">{e(" ".join(HASHTAGS))}</div><div class="n">Already at the end of the description. YouTube shows the first three above the title.</div>

<h2 class="pb">6. Description (copy everything in the box)</h2>
<div class="copy">{e(DESCRIPTION)}</div>
<div class="n">{len(DESCRIPTION)} / 5000 characters. Chapters start at 0:00 and each is longer than 10 s, so YouTube will create them automatically.
YouTube rejects "&lt;" and "&gt;" in descriptions, so the SUMIFS date range is written in words.</div>

<h2>7. Upload settings</h2>
<table>
<tr><th>Setting</th><th>Value</th></tr>
<tr><td>Audience</td><td>No, it's not made for kids</td></tr>
<tr><td>Category</td><td>Education</td></tr>
<tr><td>Video language</td><td>English (the on-screen text is English; there is no speech)</td></tr>
<tr><td>Caption certification</td><td>None</td></tr>
<tr><td>Altered or synthetic content</td><td>Likely "No": it is an animated software walkthrough with no voice and no realistic people or events. The description also says it is an animated walkthrough.</td></tr>
<tr><td>Pinned comment</td><td>{e(PINNED)}</td></tr>
<tr><td>End screen</td><td>Subscribe element + "Best for viewer" video, last 20 s (the closing card runs about 6 s, so the end screen overlaps the summary too)</td></tr>
</table>

<h2>8. How good is this SEO? (please read)</h2>
<div class="note">The title, tags and description follow standard YouTube SEO practice: the exact search phrase first, matching chapter titles, and related phrases people use for this topic ("sales dashboard in excel", "pivot table", "slicer", "mis report kaise banaye").
<b>They are not checked against live search-volume data.</b> vidIQ keyword research needs 5 credits and the account has 4 until 31 Oct 2026, and YouTube's search-suggestion service is blocked from this build machine.
Before publishing, type "mis report in excel" into the YouTube search box: if a different phrasing shows up first in the suggestions, swap it into the title. No title can guarantee ranking; click-through rate and watch time decide most of it, which is why the Test &amp; compare thumbnails matter.</div>

<h2>9. Thumbnails</h2>
<div class="thumbs">{thumb_html}</div>
<p class="n">1280×720 JPG, each under 2 MB (YouTube's limit). Fonts: Anton and Montserrat (SIL Open Font License, included in <code>assets/fonts/</code>). The screenshots inside are rendered from the same workbook as the video.</p>
</body></html>"""

hp = f"{bv.SCR}/upload_kit.html"
open(hp, "w", encoding="utf-8").write(DOC)
pdf = f"{OUTDIR}/YouTube_Upload_Kit.pdf"
subprocess.run([bv.CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                "--virtual-time-budget=2000", f"--print-to-pdf={pdf}", f"file://{hp}"],
               capture_output=True, check=True)
print(pdf, os.path.getsize(pdf) // 1024, "KB")
print("TITLE:", TITLE, len(TITLE))
print("TAGS:", len(tags_csv), "chars")
