#!/usr/bin/env python3
"""
Separate YouTube caption files for the no-voice video (output/mis_tutorial_no_voice.mp4).

  subtitles/youtube_hinglish.srt  - the on-screen Hinglish lines (romanised Hindi)
  subtitles/youtube_english.srt   - English translation, same cues and timings

The video has no narration, so each cue stays on screen for its whole step
(beat), not just the length of a spoken sentence. Timings are read from the
timeline written by `MIS_MODE=novoice python3 scripts/build_video.py`.

Usage: python3 scripts/make_subtitles.py
"""
import json, os, re, sys

os.environ["MIS_MODE"] = "novoice"
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_video as bv   # noqa: E402

ROOT = os.path.dirname(HERE)
TIMELINE = f"{bv.WORK}/timeline_novoice.json"

ENGLISH = [
    "Hello friends, and welcome to the channel.",
    "Today we'll build a complete, professional Sales MIS Report — exactly the way MIS executives build it in companies.",
    "MIS means Management Information System — summarising raw data so management can make a decision at a glance.",
    "By the end of this video you'll have a live dashboard — KPIs, region and product analysis, Pivot Tables, charts and slicers.",
    "I won't just show it — every formula is explained too. Let's get started!",
    "First, let's understand the data. This is the Raw_Data sheet — it holds 180 transactions for October 2026.",
    "Date is the invoice date, Invoice No is each bill's unique number, and Region is East, West, North or South.",
    "Then Salesperson, Product — Tea A, Tea B or Tea C, Qty (units sold) and Unit Price.",
    "Sales Amount is empty for now — we'll fill it with a formula. Payment Status shows Paid or Pending.",
    "Shortcut: Ctrl + ↓ — the cursor jumps straight to the last row, 182. So there are 180 data rows below the header.",
    "Important: one row = one unique invoice. Every Invoice No is filled in and never repeats.",
    "Now let's convert this data into an Excel Table — formulas become readable and the range expands automatically.",
    "Click any cell in the data and press Ctrl + T.",
    "Create Table picks up the range =$A$2:$I$182. 'My table has headers' must be ticked — then OK.",
    "The table is ready — banded rows, a filter button on every header, and a Table Design tab in the ribbon.",
    "In the Table Name box type SalesData and press Enter. Every formula from here on uses this name.",
    "Now Sales Amount. Inside a table, formulas use structured references — the column name, not the cell address.",
    "In H3 type: =[@Qty]*[@[Unit Price]]",
    "@ means the value from this same row. Unit Price is two words, so it needs double brackets.",
    "Press Enter and the formula fills the whole column automatically — all 180 rows at once.",
    "Check: row 3 is 55 × 120.00 = 6,600.00 ✔. Select the column and the status bar shows Sum: 1,428,190.00.",
    "Now the heart of the dashboard — KPI cards. Remember: never type final values by hand.",
    "Everything comes from formulas — when the data changes, the numbers update by themselves.",
    "Total Sales (B6): SUMIFS adds only October's Sales Amount — the date range comes from DATE().",
    "Result: 1,428,190.00 — that's 14 lakh 28 thousand 190.",
    "Total Orders (D6): one row = one invoice, so COUNTIFS counts October's non-blank invoices — 180.",
    "Total Units Sold (F6): same date condition, SUMIFS on Qty — 11,834.",
    "Average Sales / Order (H6): =IFERROR(B6/D6,0) — no error even if orders are zero. Result 7,934.39.",
    "Pending Sales Amount (B9): SUMIFS where Payment Status = \"Pending\" — 372,985.00.",
    "It's deliberately called Pending Sales Amount, not 'Outstanding Receivables' — the data has no payment-received or balance field.",
    "Now region-wise analysis — management wants to see which region is ahead.",
    "C13 has the same SUMIFS plus one condition: SalesData[Region] = B13. The region comes from a cell, so the formula copies down.",
    "East 351,030 • West 383,675 (strongest) • North 355,130 • South 338,355.",
    "Total (C17) = 1,428,190.00 — exactly equal to Total Sales. That's our cross-check ✔",
    "Same for Product-wise: Tea A 385,320 • Tea B 432,820 • Tea C 610,050 — the total is again 1,428,190.00 ✔",
    "Along with formulas, let's learn Pivot Tables — an instant summary with drag-and-drop.",
    "Click any cell in SalesData → Insert → PivotTable → From Table/Range.",
    "Table/Range already shows SalesData. Choose New Worksheet and click OK.",
    "A new sheet appears with PivotTable Fields on the right. Drag Region to Rows and Sales Amount to Values.",
    "Note: Values should say Sum of Sales Amount. If you see 'Count of' → Value Field Settings → Sum.",
    "Put Date in Filters and keep October 2026. Grand Total = 1428190 — matches the dashboard ✔",
    "Build a second pivot the same way — Product in Rows, Sales Amount in Values.",
    "Now charts — visuals make the point to management instantly.",
    "Select the Region pivot → PivotTable Analyze → PivotChart → Clustered Column → OK.",
    "The chart is in. Right-click → Add Data Labels — the exact value on every bar. Title: Region-wise Sales Performance.",
    "For the Product pivot, a Pie chart — Product-wise Sales Analysis. Tea C has the biggest share.",
    "Now let's make the report interactive — with slicers.",
    "Select a pivot → PivotTable Analyze → Insert Slicer → tick Region and Product → OK.",
    "One slicer for both pivots: right-click the slicer → Report Connections → tick both PivotTables.",
    "Remember: a slicer can only connect pivots built from the same data source (SalesData).",
    "Now click West — both pivots and both charts filter to West instantly!",
    "To remove the filter, use the slicer's Clear Filter button — the totals are back in full.",
    "Now the finishing — a professional dashboard means clarity, not decoration.",
    "Bold title, consistent colour for the KPI cards, and a thousands separator on numbers — Ctrl + Shift + 1.",
    "View tab → untick Gridlines — the look becomes perfectly clean.",
    "One font, consistent spacing, two or three colours — the report is for a manager, so readability comes first.",
    "A report isn't trustworthy until it's refreshed and validated.",
    "When a new row lands in Raw_Data, the Table makes SUMIFS / COUNTIFS pick it up automatically.",
    "Pivot Tables must be refreshed: Data → Refresh All — or Ctrl + Alt + F5.",
    "Three cross-checks: Region total = Product total = Pivot Grand Total = Total Sales 1,428,190.",
    "All three match ✔ — the report is reconciled.",
    "So friends, today we built a complete Sales MIS Report from scratch.",
    "Excel Table, structured formula, SUMIFS / COUNTIFS KPIs, region and product analysis, Pivot, charts and slicers.",
    "And most important — we validated every number. That's what makes you a professional MIS executive.",
    "Enjoyed the video? Like, Subscribe, and tell us your next topic in the comments. Happy Excel-ing!",
]


def plain(caption):
    return re.sub(r"<[^>]+>", "", caption).replace("&amp;", "&")


def wrap(text, width=58):
    """Two-line captions read best on YouTube; break at the space nearest the middle."""
    if len(text) <= width:
        return text
    mid = len(text) // 2
    spaces = [i for i, ch in enumerate(text) if ch == " "]
    cut = min(spaces, key=lambda i: abs(i - mid))
    return text[:cut] + "\n" + text[cut + 1:]


def ts(sec):
    ms = int(round(sec * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def write(path, lines, timeline):
    out = []
    for i, (row, text) in enumerate(zip(timeline, lines), 1):
        start = row["start"] + 0.15
        end = row["start"] + row["dur"] - 0.10
        out.append(f"{i}\n{ts(start)} --> {ts(end)}\n{wrap(text)}\n")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"{path}  ({len(out)} cues)")


if __name__ == "__main__":
    timeline = json.load(open(TIMELINE, encoding="utf-8"))
    hinglish = [plain(b["caption"]) for b in bv.BEATS]
    assert len(timeline) == len(hinglish) == len(ENGLISH), (len(timeline), len(hinglish), len(ENGLISH))
    write(f"{ROOT}/subtitles/youtube_hinglish.srt", hinglish, timeline)
    write(f"{ROOT}/subtitles/youtube_english.srt", ENGLISH, timeline)
