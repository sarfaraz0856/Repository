#!/usr/bin/env python3
"""
Build the animated Excel-365 Sales MIS tutorial video (1920x1080, 30 fps, MP4).

HONEST SCOPE
- This is an ANIMATED RECREATION of the Excel 365 interface (HTML/CSS rendered
  to frames by headless Chromium), NOT a live Microsoft Excel screen recording.
  Every frame carries a watermark saying so.
- All content - formulas, KPI values, region/product totals - is the real,
  independently validated data from workbook/Sales_MIS_Report.xlsx.
- No audio track: no local TTS is installed and the vidIQ credit balance was
  insufficient to synthesize voice/music. The full Hinglish narration is burned
  in as on-screen captions, paced at natural speaking speed so the file doubles
  as a sync bed for a voiceover added later.

The UI chrome lives in scripts/excel_ui.py and is matched to a real Excel 365
desktop screenshot supplied as the design reference.
"""
import os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import excel_ui as ui
from excel_ui import col_x, col_w, row_y, hl, sel, cap, page, ROW_H

SCR = "/tmp/claude-0/-home-user-Repository/33d85502-7cf9-5098-8064-f58aa938ec5b/scratchpad/video"
HTML, PNG, CLIPS, ASSETS = f"{SCR}/html", f"{SCR}/png", f"{SCR}/clips", f"{SCR}/assets"
for d in (HTML, PNG, CLIPS, ASSETS):
    os.makedirs(d, exist_ok=True)
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FPS = 30
TARGET = 810.0  # seconds -> 13.5 min, inside the 12-15 min brief
OUT = "/home/user/Repository/Excel_MIS_Tutorial/output/mis_tutorial_animated.mp4"

# ---------------------------------------------------------------- real data
COLS = ["Date", "Invoice No", "Region", "Salesperson", "Product",
        "Qty", "Unit Price", "Sales Amount", "Payment Status"]
DATA = [
 ["01-Oct-2026","INV-2026-0001","South","Arjun Reddy","Tea A",55,"120","6,600","Paid"],
 ["01-Oct-2026","INV-2026-0002","West","Amit Patel","Tea A",40,"120","4,800","Pending"],
 ["01-Oct-2026","INV-2026-0003","East","Pooja Nair","Tea A",89,"120","10,680","Paid"],
 ["01-Oct-2026","INV-2026-0004","North","Vikram Singh","Tea A",83,"120","9,960","Paid"],
 ["02-Oct-2026","INV-2026-0005","East","Pooja Nair","Tea C",62,"150","9,300","Paid"],
 ["02-Oct-2026","INV-2026-0006","West","Amit Patel","Tea C",35,"150","5,250","Paid"],
 ["02-Oct-2026","INV-2026-0007","North","Neha Gupta","Tea C",101,"150","15,150","Pending"],
 ["02-Oct-2026","INV-2026-0008","West","Amit Patel","Tea B",59,"95","5,605","Pending"],
 ["03-Oct-2026","INV-2026-0009","North","Neha Gupta","Tea A",47,"120","5,640","Paid"],
 ["03-Oct-2026","INV-2026-0010","West","Amit Patel","Tea B",107,"95","10,165","Paid"]]

RAW_PLAIN = ui.data_grid(COLS, DATA, styled=False)   # before Ctrl+T
RAW_TABLE = ui.data_grid(COLS, DATA, styled=True)    # after Ctrl+T
BLANK = ui.empty_grid()

# ---------------------------------------------------------------- panels
PANEL_CSS = """
<style>
.dh{background:#1F3864;color:#fff;text-align:center;font-size:34px;font-weight:800;
  padding:13px;letter-spacing:.5px}
.ds{color:#2E5496;text-align:center;font-size:19px;font-weight:700;padding:7px}
.kr{display:flex;gap:20px;justify-content:center;margin-top:14px}
.kc{width:330px;height:112px;border-radius:10px;overflow:hidden;
  box-shadow:0 2px 10px rgba(31,56,100,.14);border:1px solid #e3e9f3}
.kc .l{background:#2E5496;color:#fff;font-size:15px;font-weight:600;padding:9px;text-align:center}
.kc .v{color:#1F3864;font-size:36px;font-weight:800;text-align:center;padding:14px 6px}
.tw{display:flex;gap:50px;justify-content:center;margin-top:24px}
.sb{width:780px;border-radius:8px;overflow:hidden;border:1px solid #e3e9f3;
  box-shadow:0 2px 10px rgba(31,56,100,.1)}
.sb .h{background:#2E5496;color:#fff;font-size:17px;font-weight:700;padding:10px 16px}
.sb table{width:100%;border-collapse:collapse}
.sb td{font-size:16px;height:44px;padding:0 16px;border-bottom:1px solid #eef1f6;color:#1a1a1a}
.sb td.n{text-align:right;font-variant-numeric:tabular-nums}
.sb tr.t td{background:#D9E1F2;font-weight:800;color:#1F3864}
.pv{display:flex;height:100%}
.pvl{padding:22px 26px}
.pvt{border-collapse:collapse}
.pvt td,.pvt th{border:1px solid #d7d7d7;font-size:15px;padding:7px 16px;text-align:left}
.pvt th{background:#f3f3f3;font-weight:700}
.pvt td.n{text-align:right;font-variant-numeric:tabular-nums}
.pvt tr.g td{font-weight:800;background:#fafafa}
.fields{width:330px;margin-left:auto;border-left:1px solid #e1dfdd;padding:14px;
  background:#fbfbfb;font-size:13px;color:#333}
.fields .ft{font-weight:700;font-size:15px;margin-bottom:10px;color:#222}
.fields .fi{padding:5px 8px;border:1px solid #e8e8e8;background:#fff;margin:4px 0;border-radius:3px}
.fields .area{margin-top:10px;border-top:1px solid #e8e8e8;padding-top:8px}
.fields .ah{color:#777;font-size:12px}
.fields .chip{background:#eef3fb;border:1px solid #cdd9ec;border-radius:3px;
  padding:4px 8px;margin:4px 0;display:inline-block}
.chart{margin:24px;border:1px solid #d7d7d7;border-radius:4px;padding:18px 26px;
  box-shadow:0 2px 8px rgba(0,0,0,.07);background:#fff}
.chart .ct{font-size:20px;font-weight:700;color:#1F3864;text-align:center;margin-bottom:10px}
.bars{display:flex;align-items:flex-end;gap:70px;height:330px;
  border-left:2px solid #b0b0b0;border-bottom:2px solid #b0b0b0;padding:0 60px}
.bars .b{text-align:center;font-size:15px;color:#333}
.bars .b i{display:block;width:118px}
.sl{width:216px;border:1px solid #cfcfcf;border-radius:7px;padding:11px;
  box-shadow:0 2px 8px rgba(0,0,0,.09);background:#fff;margin-left:18px}
.sl .st{font-weight:700;color:#1F3864;margin-bottom:9px;font-size:15px;
  display:flex;justify-content:space-between}
.sl .si{background:#eef1f6;border:1px solid #dde3ec;padding:9px;border-radius:4px;
  margin:6px 0;font-size:14px}
.sl .si.on{background:#4472C4;color:#fff;border-color:#3a5ca8;font-weight:600}
</style>"""

KPIS = [("Total Sales", "14,28,190"), ("Total Orders", "180"),
        ("Total Units Sold", "11,834"), ("Avg Sales / Order", "7,934"),
        ("Pending Sales Amt", "3,72,985")]
REGION = [("East", "3,51,030"), ("West", "3,83,675"),
          ("North", "3,55,130"), ("South", "3,38,355")]
PRODUCT = [("Tea A", "3,85,320"), ("Tea B", "4,32,820"), ("Tea C", "6,10,050")]


def dashboard():
    k = "".join(f'<div class="kc"><div class="l">{l}</div><div class="v">{v}</div></div>'
                for l, v in KPIS)
    rr = "".join(f'<tr><td>{a}</td><td class="n">{b}</td></tr>' for a, b in REGION)
    rr += '<tr class="t"><td>Total</td><td class="n">14,28,190</td></tr>'
    pr = "".join(f'<tr><td>{a}</td><td class="n">{b}</td></tr>' for a, b in PRODUCT)
    pr += '<tr class="t"><td>Total</td><td class="n">14,28,190</td></tr>'
    return (PANEL_CSS
            + '<div class="dh">SALES MIS REPORT</div>'
            + '<div class="ds">Reporting Period: October 2026</div>'
            + f'<div class="kr">{k}</div>'
            + '<div class="tw">'
            + f'<div class="sb"><div class="h">REGION-WISE SALES</div><table>{rr}</table></div>'
            + f'<div class="sb"><div class="h">PRODUCT-WISE SALES</div><table>{pr}</table></div>'
            + '</div>')


def pivot(rows_field="Region", data=REGION, show_fields=True, values_label="Sum of Sales Amount"):
    body = "".join(f'<tr><td>{a}</td><td class="n">{b}</td></tr>' for a, b in data)
    body += '<tr class="g"><td>Grand Total</td><td class="n">14,28,190</td></tr>'
    fields = ""
    if show_fields:
        items = "".join(f'<div class="fi">{f}</div>' for f in
                        ["Date", "Invoice No", "Region", "Salesperson",
                         "Product", "Qty", "Unit Price", "Sales Amount"])
        fields = ('<div class="fields"><div class="ft">PivotTable Fields</div>'
                  + items
                  + '<div class="area"><div class="ah">Filters</div>'
                    '<div class="chip">Date</div></div>'
                  + f'<div class="area"><div class="ah">Rows</div>'
                    f'<div class="chip">{rows_field}</div></div>'
                  + f'<div class="area"><div class="ah">Values</div>'
                    f'<div class="chip">{values_label}</div></div></div>')
    return (PANEL_CSS + '<div class="pv"><div class="pvl">'
            '<table class="pvt"><tr><th>Row Labels</th>'
            f'<th>{values_label}</th></tr>{body}</table></div>'
            + fields + '</div>')


def chart():
    bars = [("East", "3,51,030", 268, "#4472C4"), ("West", "3,83,675", 300, "#ED7D31"),
            ("North", "3,55,130", 272, "#A5A5A5"), ("South", "3,38,355", 256, "#FFC000")]
    b = "".join(f'<div class="b"><i style="height:{h}px;background:{c}"></i>{n}<br>{v}</div>'
                for n, v, h, c in bars)
    return (PANEL_CSS + '<div class="chart">'
            '<div class="ct">Region-wise Sales Performance</div>'
            f'<div class="bars">{b}</div></div>')


def slicers():
    reg = "".join(f'<div class="si{" on" if n == "East" else ""}">{n}</div>'
                  for n, _ in REGION)
    pro = "".join(f'<div class="si">{n}</div>' for n, _ in PRODUCT)
    return (PANEL_CSS + '<div class="pv" style="padding:20px">'
            + pivot().split('<div class="pv">')[1].replace('</div>', '', 0).split('<div class="fields">')[0]
            + f'<div class="sl"><div class="st">Region <span>&#9875;</span></div>{reg}</div>'
            + f'<div class="sl"><div class="st">Product <span>&#9875;</span></div>{pro}</div>'
            + '</div>')


DASH, PIVOT_R, PIVOT_P, CHART, SLICE = dashboard(), pivot(), pivot("Product", PRODUCT), chart(), slicers()

# ---------------------------------------------------------------- beats
beats = []
def _wc(t): return len(re.sub(r"<[^>]+>", "", t).split())
def dur_raw(t): return round(max(5.0, _wc(t) / 2.15 + 1.0), 2)

BADGE = [""]
_seq = [0]
def addf(caption, cur, *, sheet="MIS_Dashboard", tab="Home", nb="A1", fb="",
         grid=None, panel=None, ov=""):
    _seq[0] += 1
    html = page(sheet_tab=sheet, ribbon_tab=tab, namebox=nb, formula=fb,
                grid_html=(BLANK if panel else (grid if grid is not None else RAW_PLAIN)),
                caption=cap(caption), badge=BADGE[0], overlays=ov, panel_html=panel)
    beats.append((f"n{_seq[0]:02d}", html, dur_raw(caption), cur))

def addcard(bid, html, dur, cur):
    beats.append((bid, html, dur, cur))

# geometry shortcuts
HDR_ROW = hl(col_x('A'), row_y(1), sum(ui.COL_W), ROW_H)
COL_B   = hl(col_x('B'), row_y(1), col_w('B'), ROW_H * 11)
COL_C   = hl(col_x('C'), row_y(1), col_w('C'), ROW_H * 11)
COL_DE  = hl(col_x('D'), row_y(1), col_w('D') + col_w('E'), ROW_H * 11)
COL_FG  = hl(col_x('F'), row_y(1), col_w('F') + col_w('G'), ROW_H * 11)
COL_H   = hl(col_x('H'), row_y(1), col_w('H'), ROW_H * 11)
COL_HI  = hl(col_x('H'), row_y(1), col_w('H') + col_w('I'), ROW_H * 11)
CELL_H2 = sel(col_x('H'), row_y(2), col_w('H'), ROW_H)
FBAR_HL = hl(300, ui.GRID_TOP - ui.FBAR_H, 1150, ui.FBAR_H)
NBOX_HL = hl(0, ui.GRID_TOP - ui.FBAR_H, 150, ui.FBAR_H)
ALLDATA = hl(col_x('A'), row_y(1), sum(ui.COL_W), ROW_H * 11)
F_SA = "=[@Qty]*[@[Unit Price]]"

# dashboard cursor anchors
K = [(116 + i * 350 + 165, 406) for i in range(5)]
REG_T, PRO_T = (560, 600), (1390, 600)

# ---- intro card ----
CARD_CSS = ui.CSS + """
.hero{position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;color:#fff;text-align:center}
.hero h1{font-size:88px;font-weight:900;letter-spacing:1px;text-shadow:0 4px 18px rgba(0,0,0,.4)}
.hero h2{font-size:37px;font-weight:600;margin-top:12px;color:#bfe3cc}
.hero .pill{margin-top:32px;background:rgba(255,255,255,.14);padding:13px 30px;
  border-radius:40px;font-size:25px}
.hero .sub{margin-top:24px;font-size:23px;opacity:.9}
.hero .list{margin-top:22px;font-size:27px;line-height:1.7;color:#dceee3}
.hero .cta{margin-top:36px;font-size:33px;background:#e8373a;padding:15px 44px;
  border-radius:50px;font-weight:800}
"""
INTRO = ('<!doctype html><html><head><meta charset="utf-8"><style>' + CARD_CSS +
  '</style></head><body><div class="hero" style="background:linear-gradient(135deg,#102a43,#1F3864 55%,#107C41)">'
  '<h1>SALES MIS REPORT</h1><h2>Microsoft Excel 365 &mdash; Full Tutorial (Hinglish)</h2>'
  '<div class="pill">Table &bull; SUMIFS / COUNTIFS &bull; Pivot &bull; Charts &bull; Slicers</div>'
  '<div class="sub">October 2026 &bull; 180 transactions &bull; fully validated</div></div>'
  '<div class="wm">Animated recreation &mdash; not a live Excel recording</div></body></html>')
OUTRO = ('<!doctype html><html><head><meta charset="utf-8"><style>' + CARD_CSS +
  '</style></head><body><div class="hero" style="background:linear-gradient(135deg,#107C41,#1F3864 60%,#102a43)">'
  '<h1>Ho Gaya! &#10003;</h1>'
  '<div class="list">Table &bull; Structured formulas &bull; KPIs &bull; Region/Product analysis<br>'
  'Pivot Tables &bull; Charts &bull; Slicers &mdash; sab <b>validated</b></div>'
  '<div class="cta">Like &bull; Subscribe &bull; Comment</div>'
  '<div class="sub">Happy Excel-ing! &mdash; milte hain agli video mein</div></div>'
  '<div class="wm">Animated recreation &mdash; not a live Excel recording</div></body></html>')
addcard("b00_intro", INTRO, 7, (600, 900, 1300, 520))

# ---- Scene 1 ----
BADGE[0] = "Scene 1 &bull; Introduction"
addf("Namaskaar doston, aur swagat hai aapka is channel par.", (300,700)+K[0], panel=DASH, tab="View")
addf("Aaj hum banayenge ek complete, professional <b>Sales MIS Report</b> &mdash; bilkul usi tarah jaise companies mein MIS executives banate hain.", K[0]+K[2], panel=DASH, tab="View")
addf("<b>MIS</b> ka matlab hai <b>Management Information System</b> &mdash; raw transaction data ko aise summarise karna ki management ek nazar mein decision le sake.", K[2]+K[1], panel=DASH, tab="View")
addf("Is video ke end tak aapke paas hoga ek live dashboard &mdash; Total Sales, Total Orders, region aur product analysis, Pivot Tables, charts aur interactive slicers.", K[0]+K[4], panel=DASH, tab="View")
addf("Main aapko sirf dikhaunga nahi, ek-ek formula samjhaunga bhi. Toh chaliye shuru karte hain.", K[4]+REG_T, panel=DASH, tab="View")

# ---- Scene 2 : Raw data (plain headers, not yet a Table) ----
BADGE[0] = "Scene 2 &bull; Raw Data"
addf("Sabse pehle data ko samajhte hain. Yeh <b>Raw_Data</b> sheet hai, aur isme hain October 2026 ki <b>180 sales transactions</b>.",
     (300,700,560,row_y(1)+15), sheet="Raw_Data", nb="A1", fb="Date", grid=RAW_PLAIN, ov=HDR_ROW)
addf("Har column ka ek clear matlab hai: <b>Date</b> invoice ki tareekh, <b>Invoice No</b> har bill ka unique number, <b>Region</b> East, West, North ya South.",
     (560,row_y(1)+15,col_x('C')+50,row_y(5)), sheet="Raw_Data", nb="C3", fb="East", grid=RAW_PLAIN, ov=COL_B+COL_C)
addf("Phir <b>Salesperson</b>, <b>Product</b> &mdash; Tea A, Tea B ya Tea C, <b>Qty</b> kitne units bike, aur <b>Unit Price</b> ek unit ka daam.",
     (col_x('C')+50,row_y(5),col_x('E')+50,row_y(5)), sheet="Raw_Data", nb="E3", fb="Tea A", grid=RAW_PLAIN, ov=COL_DE+COL_FG)
addf("<b>Sales Amount</b> total value, aur <b>Payment Status</b> &mdash; Paid ya Pending.",
     (col_x('E')+50,row_y(5),col_x('H')+60,row_y(5)), sheet="Raw_Data", nb="H3", fb="6600", grid=RAW_PLAIN, ov=COL_HI)
addf("Ek bahut important baat: is tutorial mein <b>ek row ka matlab ek unique invoice</b> hai. Har Invoice No bhara hua hai aur repeat nahi hota.",
     (col_x('H')+60,row_y(5),col_x('B')+70,row_y(6)), sheet="Raw_Data", nb="B3", fb="INV-2026-0002", grid=RAW_PLAIN, ov=COL_B)

# ---- Scene 3 : Excel Table ----
BADGE[0] = "Scene 3 &bull; Excel Table"
addf("Ab is raw data ko ek <b>Excel Table</b> mein convert karenge. Isse formulas readable ban jaate hain aur ranges automatically expand hoti hain.",
     (300,700,700,row_y(4)), sheet="Raw_Data", nb="A2", fb="Date", grid=RAW_PLAIN, ov=ALLDATA)
addf("Kisi bhi data cell par click kijiye, phir dabaiye <b>Control plus T</b>. Excel apne aap range detect kar leta hai.",
     (700,row_y(4),620,row_y(3)), sheet="Raw_Data", nb="A2", fb="Date", grid=RAW_PLAIN, ov=ALLDATA)
addf("Dhyaan rakhiye ki <b>'My table has headers'</b> tick ho. OK dabate hi table ban gaya &mdash; banded rows aur filter arrows aa jaate hain.",
     (620,row_y(3),500,row_y(2)), sheet="Raw_Data", tab="Table Design", nb="A2", fb="Date", grid=RAW_TABLE, ov=HDR_ROW)
addf("Ab Table Design tab mein table ka naam badal dijiye <b>SalesData</b>. Yahi naam aage har formula mein kaam aayega, isliye saaf aur meaningful rakhiye.",
     (500,row_y(2),80,ui.GRID_TOP-16), sheet="Raw_Data", tab="Table Design", nb="SalesData", fb="", grid=RAW_TABLE, ov=NBOX_HL)

# ---- Scene 4 : Sales Amount ----
BADGE[0] = "Scene 4 &bull; Sales Amount"
addf("Ab Sales Amount nikaalte hain. Table ke andar formulas <b>structured references</b> use karte hain &mdash; column ke naam se, cell address se nahi.",
     (300,700,860,ui.GRID_TOP-16), sheet="Raw_Data", nb="H2", fb=F_SA, grid=RAW_TABLE, ov=FBAR_HL)
addf("Sales Amount column ke pehle cell mein likhiye &mdash; equals, bracket at Qty, close bracket, star, bracket at bracket Unit Price.",
     (860,ui.GRID_TOP-16,col_x('H')+60,row_y(2)+15), sheet="Raw_Data", nb="H2", fb=F_SA, grid=RAW_TABLE, ov=FBAR_HL+CELL_H2)
addf("Poora formula banta hai <b>=[@Qty]*[@[Unit Price]]</b>. Yahan <b>at</b> ka matlab hai isi row ka value.",
     (col_x('H')+60,row_y(2)+15,col_x('H')+60,row_y(2)+15), sheet="Raw_Data", nb="H2", fb=F_SA, grid=RAW_TABLE, ov=CELL_H2)
addf("Enter dabate hi Excel yeh formula <b>poore column</b> mein apne aap bhar deta hai. Ek baar likho, saari 180 rows calculate ho gayi.",
     (col_x('H')+60,row_y(2)+15,col_x('H')+60,row_y(11)), sheet="Raw_Data", nb="H2", fb=F_SA, grid=RAW_TABLE, ov=COL_H)
addf("Row ek mein: <b>55 &times; 120 = 6,600</b>. Unit Price do shabdon ka naam hai, isliye uske around <b>double brackets</b> lagte hain.",
     (col_x('H')+60,row_y(11),col_x('F')+35,row_y(2)+15), sheet="Raw_Data", nb="H2", fb=F_SA, grid=RAW_TABLE, ov=CELL_H2)

# ---- Scene 5 : KPIs ----
BADGE[0] = "Scene 5 &bull; KPI Summary"
F_TS = '=SUMIFS(SalesData[Sales Amount],SalesData[Date],"&gt;="&amp;DATE(2026,10,1),SalesData[Date],"&lt;"&amp;DATE(2026,11,1))'
F_TO = '=COUNTIFS(SalesData[Date],"&gt;="&amp;DATE(2026,10,1),SalesData[Date],"&lt;"&amp;DATE(2026,11,1),SalesData[Invoice No],"&lt;&gt;")'
F_TU = '=SUMIFS(SalesData[Qty],SalesData[Date],"&gt;="&amp;DATE(2026,10,1),SalesData[Date],"&lt;"&amp;DATE(2026,11,1))'
F_PD = '=SUMIFS(SalesData[Sales Amount],SalesData[Payment Status],"Pending",SalesData[Date],"&gt;="&amp;DATE(2026,10,1),SalesData[Date],"&lt;"&amp;DATE(2026,11,1))'
addf("Ab aata hai dashboard ka dil &mdash; <b>KPI cards</b>. Yaad rakhiye, final values hum kabhi haath se type nahi karte.", (300,700)+K[0], panel=DASH)
addf("Sab kuch formula se nikalta hai taaki data badalte hi number khud update ho jaaye.", K[0]+K[0], panel=DASH)
addf("Pehla KPI <b>Total Sales</b>. SUMIFS sirf October 2026 ka Sales Amount joregi, DATE function ki date condition ke saath.", K[0]+K[0], nb="B6", fb=F_TS, panel=DASH)
addf("Result aata hai <b>chaudah lakh, atthais hazaar, ek sau nabbe</b> &mdash; 14,28,190.", K[0]+K[0], nb="B6", fb=F_TS, panel=DASH)
addf("Doosra <b>Total Orders</b>. Kyunki ek row ek unique invoice hai, hum COUNTIFS se October ke non-blank invoices ginte hain. Total <b>180</b>.", K[0]+K[1], nb="D6", fb=F_TO, panel=DASH)
addf("Teesra <b>Total Units Sold</b> &mdash; wahi date condition par Qty ka SUMIFS. Jawab <b>11,834 units</b>.", K[1]+K[2], nb="F6", fb=F_TU, panel=DASH)
addf("Chautha <b>Average Sales per Order</b> &mdash; Total Sales divide by Total Orders, <b>IFERROR</b> mein lapet kar taaki divide-by-zero error na aaye. Lagbhag <b>7,934</b>.", K[2]+K[3], nb="H6", fb="=IFERROR(B6/D6,0)", panel=DASH)
addf("Paanchva <b>Pending Sales Amount</b> &mdash; SUMIFS jisme Payment Status Pending ho, October ke andar. Yeh banta hai <b>3,72,985</b>.", K[3]+K[4], nb="B9", fb=F_PD, panel=DASH)
addf("Ise hum <b>Pending Sales Amount</b> keh rahe hain, Outstanding Receivables nahi &mdash; kyunki is data mein payment received ya balance ki koi field nahi hai.", K[4]+K[4], nb="B9", fb=F_PD, panel=DASH)

# ---- Scene 6 : Region ----
BADGE[0] = "Scene 6 &bull; Region Analysis"
F_RG = '=SUMIFS(SalesData[Sales Amount],SalesData[Region],B12,SalesData[Date],"&gt;="&amp;DATE(2026,10,1),SalesData[Date],"&lt;"&amp;DATE(2026,11,1))'
addf("Ab region-wise todte hain. Management ko dekhna hota hai ki kaunsa region sabse aage hai.", (300,700)+REG_T, panel=DASH)
addf("Hum wahi SUMIFS use karenge, lekin ab ek extra condition &mdash; Region, jise hum ek cell se reference karte hain taaki formula copy ho sake.", REG_T+REG_T, nb="C12", fb=F_RG, panel=DASH)
addf("East <b>3,51,030</b>, West <b>3,83,675</b> &mdash; yeh sabse strong region hai, North <b>3,55,130</b>, aur South <b>3,38,355</b>.", REG_T+(560,700), nb="C12", fb=F_RG, panel=DASH)
addf("In chaaron ka total aana chahiye wahi <b>14,28,190</b> jo Total Sales KPI mein tha &mdash; yeh hamara <b>cross-check</b> hai ki numbers reconcile ho rahe hain.", (560,700)+K[0], nb="C16", fb="=SUM(C12:C15)", panel=DASH)

# ---- Scene 7 : Pivot ----
BADGE[0] = "Scene 7 &bull; Pivot Table"
addf("Formulas ke saath MIS mein <b>Pivot Tables</b> bhi zaroori hain, kyunki yeh drag-and-drop se instant summary deti hain.",
     (300,700,420,120), sheet="Pivot_Analysis", tab="Insert", nb="A3", panel=PIVOT_R)
addf("SalesData table ke kisi cell par click kijiye, phir <b>Insert</b> tab, <b>PivotTable</b>, From Table slash Range. Source apne aap SalesData dikhayega.",
     (420,120,620,330), sheet="Pivot_Analysis", tab="Insert", nb="A3", panel=PIVOT_R)
addf("New Worksheet choose karke OK. Ab <b>Region</b> ko Rows area mein drag kijiye, aur <b>Sales Amount</b> ko Values area mein.",
     (1700,520,1700,700), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="A4", panel=PIVOT_R)
addf("Ek common galti &mdash; Excel kabhi Sales Amount ka <b>Count</b> dikha deta hai. Us field par click karke <b>Value Field Settings</b> mein <b>Sum</b> select kijiye.",
     (1700,700,420,290), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="B3", panel=PIVOT_R)
addf("Filter ke liye <b>Date</b> ko Filters area mein daal kar October 2026 set kar dijiye. Isi tarah ek doosra pivot <b>Product</b> ke liye banaiye.",
     (420,290,620,330), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="B3", panel=PIVOT_P)

# ---- Scene 8 : Charts ----
BADGE[0] = "Scene 8 &bull; Charts"
addf("Numbers ke saath visuals management ko turant samajh aate hain.",
     (300,700,700,520), sheet="Pivot_Analysis", tab="Insert", nb="Chart 1", panel=CHART)
addf("Region wale pivot par <b>PivotChart</b> choose kijiye aur <b>Clustered Column</b> select kijiye &mdash; yeh region-wise performance clearly dikhata hai.",
     (700,520,1100,480), sheet="Pivot_Analysis", tab="Insert", nb="Chart 1", panel=CHART)
addf("Product wale pivot ke liye <b>Pie chart</b> ya <b>Bar</b> accha rehta hai taaki har tea ka share dikhe.",
     (1100,480,800,620), sheet="Pivot_Analysis", tab="Chart Design", nb="Chart 2", panel=CHART)
addf("Chart par right-click karke <b>Add Data Labels</b> laga dijiye. Title meaningful rakhiye &mdash; jaise 'Region-wise Sales Performance'.",
     (800,620,640,300), sheet="Pivot_Analysis", tab="Chart Design", nb="Chart 1", panel=CHART)

# ---- Scene 9 : Slicers ----
BADGE[0] = "Scene 9 &bull; Slicers"
addf("Ab isse <b>interactive</b> banate hain slicers ke saath.",
     (300,700,1200,400), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="Region", panel=SLICE)
addf("Pivot par click karke <b>PivotTable Analyze</b> tab mein <b>Insert Slicer</b> dabaiye. Region aur Product tick kijiye &mdash; do slicers ban gaye.",
     (1200,400,1240,330), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="Slicer", panel=SLICE)
addf("Ab magic &mdash; ek hi slicer se dono pivots control karna. Slicer par right-click karke <b>Report Connections</b> mein saari PivotTables tick kar dijiye.",
     (1240,330,1240,330), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="Slicer", panel=SLICE)
addf("Dhyaan rakhiye &mdash; slicer sirf un pivots ko jodta hai jo <b>same data source</b>, yaani humari SalesData table se bane hain.",
     (1240,330,1240,380), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="Slicer", panel=SLICE)
addf("Ab <b>East</b> par click karte hi dono pivots aur charts turant filter ho jaayenge.",
     (1240,380,1240,380), sheet="Pivot_Analysis", tab="PivotTable Analyze", nb="Slicer", panel=SLICE)

# ---- Scene 10 : Formatting ----
BADGE[0] = "Scene 10 &bull; Formatting"
addf("Ab finishing touch &mdash; formatting. Professional dashboard ka matlab zyada decoration nahi, balki <b>clarity</b>.", (300,700,960,280), panel=DASH, tab="View")
addf("Title ko bold aur bada rakhiye, KPI cards ko ek consistent colour band dijiye, numbers par <b>thousands separator</b> wala format lagaiye.", (960,280)+K[0], panel=DASH, tab="View")
addf("Gridlines ko <b>View</b> tab se off kar dijiye taaki look clean rahe. Ek hi font family, consistent spacing, aur bas do-teen colours kaafi hain.", K[0]+K[4], panel=DASH, tab="View")
addf("Yaad rakhiye: MIS report padhne waale manager ke liye hai, isliye <b>readability</b> sabse upar.", K[4]+REG_T, panel=DASH, tab="View")

# ---- Scene 11 : Refresh & validate ----
BADGE[0] = "Scene 11 &bull; Refresh &amp; Validate"
addf("MIS report tab tak bharosemand nahi jab tak refresh aur validation na ho.", (300,700,700,100), panel=DASH, tab="PivotTable Analyze")
addf("Agar aap Raw_Data mein naya transaction add karein &mdash; kyunki yeh ek Table hai, SUMIFS aur COUNTIFS <b>apne aap</b> naya data pakad lenge.", (700,100,700,100), panel=DASH, tab="PivotTable Analyze")
addf("Lekin Pivot Tables manually refresh karni padti hain: pivot par right-click <b>Refresh</b>, ya saare ek saath <b>Refresh All</b>, shortcut <b>Control plus Alt plus F5</b>.", (700,100,700,100), panel=DASH, tab="PivotTable Analyze")
addf("Validation ke liye teen cross-check: region-wise total Total Sales ke barabar, product-wise total bhi barabar, aur pivot ka October sum bhi wahi number.", (700,100)+REG_T, panel=DASH, tab="PivotTable Analyze")
addf("Agar teeno match karte hain &mdash; <b>14,28,190</b> &mdash; toh aapki report <b>reconcile</b> ho gayi.", REG_T+PRO_T, panel=DASH, tab="PivotTable Analyze")

# ---- Scene 12 : Conclusion ----
BADGE[0] = "Scene 12 &bull; Conclusion"
addf("Toh doston, aaj humne zero se ek complete <b>Sales MIS Report</b> banayi.", (300,700,960,330), panel=DASH)
addf("Raw data se Excel Table, structured-reference Sales Amount, KPI cards SUMIFS aur COUNTIFS se, region aur product analysis, native Pivot Tables, charts aur slicers.", (960,330)+K[0], panel=DASH)
addf("Aur sabse zaroori &mdash; humne har number ko validate kiya. Yahi cheez aapko ek professional <b>MIS executive</b> banati hai.", K[0]+K[4], panel=DASH)
addf("Agar video useful laga toh <b>Like</b> kijiye, channel <b>Subscribe</b> kijiye, aur comment mein bataiye agli video kis topic par chahiye.", K[4]+REG_T, panel=DASH)

addcard("b12_outro", OUTRO, 7, (760, 560, 1160, 560))

# ---------------------------------------------------------------- pace
CARDS = {"b00_intro", "b12_outro"}
card_sum = sum(d for b, h, d, c in beats if b in CARDS)
narr_sum = sum(d for b, h, d, c in beats if b not in CARDS)
factor = min(2.2, max(0.85, (TARGET - card_sum) / narr_sum))
beats = [(b, h, (d if b in CARDS else round(d * factor, 2)), c) for b, h, d, c in beats]
total = sum(d for _, _, d, _ in beats)
print(f"beats={len(beats)}  scale={factor:.3f}  total={total:.1f}s = {total/60:.2f} min", flush=True)

# ---------------------------------------------------------------- render
RENDER_H = 1180  # headroom: headless Chromium under-paints a 1080 viewport
def shot(bid, html, w=1920, h=RENDER_H, bg=None):
    hp, pp = f"{HTML}/{bid}.html", f"{PNG}/{bid}.png"
    open(hp, "w").write(html)
    cmd = [CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
           "--force-device-scale-factor=1", f"--window-size={w},{h}",
           f"--screenshot={pp}", f"file://{hp}"]
    if bg:
        cmd.insert(2, f"--default-background-color={bg}")
    subprocess.run(cmd, check=True, capture_output=True)
    return pp

shot("cursor", '<!doctype html><html><head><meta charset=utf-8>'
     '<style>html,body{margin:0;background:transparent}</style></head><body>'
     '<svg width="44" height="60" viewBox="0 0 44 60" xmlns="http://www.w3.org/2000/svg">'
     '<path d="M4 2 L4 44 L14 34 L21 50 L28 47 L21 31 L36 31 Z" fill="white" '
     'stroke="black" stroke-width="2.5" stroke-linejoin="round"/></svg></body></html>',
     44, 60, bg="00000000")
subprocess.run(["cp", f"{PNG}/cursor.png", f"{ASSETS}/cursor.png"], check=True)

print(f"Rendering {len(beats)} frames ...", flush=True)
for bid, html, dur, cur in beats:
    shot(bid, html)

# ---------------------------------------------------------------- clips
lines = []
for bid, html, dur, cur in beats:
    pp, cp = f"{PNG}/{bid}.png", f"{CLIPS}/{bid}.mp4"
    x0, y0, x1, y1 = cur
    tm = max(0.1, dur * 0.55)
    xe = f"if(lt(t,{tm}),{x0}+({x1-x0})*(t/{tm}),{x1})"
    ye = f"if(lt(t,{tm}),{y0}+({y1-y0})*(t/{tm}),{y1})"
    if bid in CARDS:
        cmd = ["ffmpeg", "-y", "-loop", "1", "-t", str(dur), "-i", pp, "-vf",
               f"crop=1920:1080:0:0,fps={FPS},fade=t=in:st=0:d=0.4,"
               f"fade=t=out:st={dur-0.4}:d=0.4,format=yuv420p",
               "-r", str(FPS), "-c:v", "libx264", "-crf", "20", "-preset", "veryfast",
               "-pix_fmt", "yuv420p", cp]
    else:
        fc = (f"[0:v]crop=1920:1080:0:0,fps={FPS},format=yuva420p[bg];"
              f"[bg][1:v]overlay=x='{xe}':y='{ye}':eval=frame,"
              f"fade=t=in:st=0:d=0.25,format=yuv420p[v]")
        cmd = ["ffmpeg", "-y", "-loop", "1", "-t", str(dur), "-i", pp,
               "-i", f"{ASSETS}/cursor.png", "-filter_complex", fc, "-map", "[v]",
               "-r", str(FPS), "-c:v", "libx264", "-crf", "20", "-preset", "veryfast",
               "-pix_fmt", "yuv420p", cp]
    subprocess.run(cmd, check=True, capture_output=True)
    lines.append(f"file '{cp}'")

open(f"{CLIPS}/list.txt", "w").write("\n".join(lines) + "\n")
subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i",
                f"{CLIPS}/list.txt", "-c", "copy", OUT], check=True, capture_output=True)
d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=np=1:nk=1", OUT], capture_output=True, text=True).stdout.strip()
dur_s = float(d) if d else 0.0
print("DONE:", OUT, (f"| {dur_s:.1f}s = {dur_s/60:.2f} min" if dur_s else "| (probe empty)"), flush=True)
