#!/usr/bin/env python3
"""
Build an animated Excel-365-style tutorial video (1920x1080, 30 fps, MP4).

HONEST SCOPE:
- This is an ANIMATED RECREATION of Excel 365 (HTML/CSS rendered to frames),
  not a live Microsoft Excel screen recording. Every frame carries a watermark
  saying so. All content (formulas, numbers) is the real, validated workbook data.
- No audio track: no local TTS is available and the vidIQ credit balance is
  insufficient to synthesize voice/music. The full Hinglish narration is burned
  in as on-screen captions. Voice can be muxed later (see editing_guide.md).

Pipeline: define beats -> render each to PNG via headless Chromium ->
per-beat ffmpeg clip with a moving cursor overlay -> concat -> final MP4.
"""
import os, subprocess, math, json, shutil

SCR = "/tmp/claude-0/-home-user-Repository/33d85502-7cf9-5098-8064-f58aa938ec5b/scratchpad/video"
HTML = f"{SCR}/html"; PNG = f"{SCR}/png"; CLIPS = f"{SCR}/clips"; ASSETS = f"{SCR}/assets"
for d in (HTML, PNG, CLIPS, ASSETS):
    os.makedirs(d, exist_ok=True)
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
FPS = 30
OUT = "/home/user/Repository/Excel_MIS_Tutorial/output/mis_tutorial_animated.mp4"

# ---------------------------------------------------------------- real data
DATA = [["01-Oct-2026","INV-2026-0001","South","Arjun Reddy","Tea A",55,"120","6,600","Paid"],
["01-Oct-2026","INV-2026-0002","West","Amit Patel","Tea A",40,"120","4,800","Pending"],
["01-Oct-2026","INV-2026-0003","East","Pooja Nair","Tea A",89,"120","10,680","Paid"],
["01-Oct-2026","INV-2026-0004","North","Vikram Singh","Tea A",83,"120","9,960","Paid"],
["02-Oct-2026","INV-2026-0005","East","Pooja Nair","Tea C",62,"150","9,300","Paid"],
["02-Oct-2026","INV-2026-0006","West","Amit Patel","Tea C",35,"150","5,250","Paid"],
["02-Oct-2026","INV-2026-0007","North","Neha Gupta","Tea C",101,"150","15,150","Pending"],
["02-Oct-2026","INV-2026-0008","West","Amit Patel","Tea B",59,"95","5,605","Pending"],
["03-Oct-2026","INV-2026-0009","North","Neha Gupta","Tea A",47,"120","5,640","Paid"],
["03-Oct-2026","INV-2026-0010","West","Amit Patel","Tea B",107,"95","10,165","Paid"]]

# ---------------------------------------------------------------- shared CSS
CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;font-family:'Carlito','Calibri','DejaVu Sans',sans-serif;background:#e6e6e6;overflow:hidden}
.title-bar{height:40px;background:#217346;color:#fff;display:flex;align-items:center;padding:0 16px;font-size:16px}
.title-bar .fname{font-weight:600}.title-bar .dot{opacity:.7;margin-left:12px;font-size:13px}
.ribbon-tabs{height:38px;background:#f3f2f1;display:flex;align-items:flex-end;padding:0 10px;border-bottom:1px solid #d6d6d6}
.ribbon-tabs .tab{padding:8px 16px;font-size:15px;color:#444}
.ribbon-tabs .tab.active{background:#fff;border:1px solid #d6d6d6;border-bottom:2px solid #217346;border-radius:4px 4px 0 0;color:#217346;font-weight:600}
.ribbon{height:92px;background:#fff;border-bottom:1px solid #d6d6d6;display:flex;align-items:center;padding:0 14px;gap:22px}
.rgrp{display:flex;flex-direction:column;align-items:center;font-size:12px;color:#555}
.rgrp .ico{width:46px;height:46px;border:1px solid #e3e3e3;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#217346;background:#fafafa}
.formula-row{height:34px;background:#fff;display:flex;align-items:center;border-bottom:1px solid #d6d6d6;font-size:15px}
.namebox{width:150px;height:100%;border-right:1px solid #d6d6d6;display:flex;align-items:center;padding:0 12px;color:#333}
.fx{width:40px;text-align:center;color:#888;font-style:italic}
.fbar{flex:1;padding:0 12px;font-family:'DejaVu Sans Mono',monospace;font-size:15px;color:#111}
.grid{background:#fff;height:706px;overflow:hidden;position:relative}
table{border-collapse:collapse;width:100%;table-layout:fixed}
th.rowh,td.rowh{width:46px;background:#f3f2f1;border:1px solid #d6d6d6;color:#666;text-align:center;font-size:13px;font-weight:normal}
th.colh{background:#f3f2f1;border:1px solid #d6d6d6;color:#444;text-align:center;font-size:13px;height:26px;font-weight:normal}
td{border:1px solid #e3e6ea;height:30px;font-size:14px;padding:0 8px;white-space:nowrap;overflow:hidden;color:#1a1a1a}
.tblhdr td{background:#4472C4;color:#fff;font-weight:600;text-align:center;border-color:#3b63ad}
.stripe td{background:#D9E1F2}
.num{text-align:right}.ctr{text-align:center}
.paid{color:#548235;font-weight:600}.pending{color:#BF8F00;font-weight:600}
.status-bar{height:30px;background:#217346;color:#fff;display:flex;align-items:center;padding:0 16px;font-size:13px;gap:26px}
.tabs{height:34px;background:#f3f2f1;display:flex;align-items:center;padding:0 8px;gap:2px;border-top:1px solid #d6d6d6}
.tabs .t{padding:6px 16px;font-size:14px;color:#555;border:1px solid transparent}
.tabs .t.active{background:#fff;color:#217346;font-weight:700;border:1px solid #d6d6d6;border-bottom:2px solid #fff}
.caption{position:absolute;left:0;right:0;bottom:64px;display:flex;justify-content:center;z-index:50}
.caption .box{max-width:1500px;background:rgba(15,25,45,.92);color:#fff;font-size:30px;line-height:1.4;padding:18px 34px;border-radius:12px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.35)}
.caption .box b{color:#7fd1a0}
.wm{position:absolute;right:16px;top:150px;z-index:60;background:rgba(0,0,0,.55);color:#fff;font-size:13px;padding:5px 10px;border-radius:5px;letter-spacing:.3px}
.scene-badge{position:absolute;left:28px;top:150px;z-index:60;background:#1F3864;color:#fff;font-size:17px;font-weight:700;padding:8px 16px;border-radius:8px}
.hl{position:absolute;border:3px solid #E8A200;border-radius:6px;background:rgba(232,162,0,.12);z-index:40}
/* dashboard */
.dash{position:absolute;inset:0;background:#f7f9fc;padding:0}
.dtitle{background:#1F3864;color:#fff;text-align:center;font-size:40px;font-weight:800;padding:16px}
.dsub{color:#2E5496;text-align:center;font-size:22px;font-weight:700;padding:8px}
.kpis{display:flex;gap:20px;justify-content:center;padding:18px 40px;flex-wrap:wrap}
.kpi{width:300px;background:#fff;border-radius:12px;box-shadow:0 3px 14px rgba(31,56,100,.12);overflow:hidden}
.kpi .k-l{background:#2E5496;color:#fff;font-size:17px;font-weight:600;padding:12px;text-align:center}
.kpi .k-v{color:#1F3864;font-size:40px;font-weight:800;text-align:center;padding:20px 8px}
.twocol{display:flex;gap:40px;justify-content:center;padding:6px 60px}
.sumtbl{background:#fff;border-radius:10px;box-shadow:0 3px 14px rgba(31,56,100,.1);overflow:hidden;width:560px}
.sumtbl .h{background:#2E5496;color:#fff;font-size:20px;font-weight:700;padding:12px 18px}
.sumtbl table{width:100%}.sumtbl td{font-size:18px;height:40px;border-color:#eef1f6}
.sumtbl .tot td{background:#D9E1F2;font-weight:800;color:#1F3864}
"""

TABS = [("Read_Me",0),("Raw_Data",0),("MIS_Dashboard",0),("Pivot_Analysis",0)]
RIBBON = [("Insert","➕"),("Table","▦"),("PivotTable","▤"),
          ("Chart","\U0001F4CA"),("Slicer","✂"),("Refresh","↻")]
TOPTABS = ["File","Home","Insert","Draw","Page Layout","Formulas","Data","Review","View"]

def chrome_html(active_tab, active_top, namebox, fbar, body, caption, badge,
                highlights="", dash=False):
    tabs_html = "".join(
        f'<div class="t {"active" if n==active_tab else ""}">{n}</div>'
        for n,_ in TABS)
    top_html = "".join(
        f'<div class="tab {"active" if t==active_top else ""}">{t}</div>'
        for t in TOPTABS)
    rib = "".join(f'<div class="rgrp"><div class="ico">{i}</div>{n}</div>'
                  for n,i in RIBBON)
    grid = body if not dash else f'<div class="grid"><div class="dash">{body}</div>{highlights}{caption}</div>'
    if not dash:
        grid = f'<div class="grid">{body}{highlights}{caption}</div>'
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head>
<body>
<div class="title-bar"><span class="fname">Sales_MIS_Report.xlsx</span>
  <span class="dot">• Saved to this PC • Excel 365</span></div>
<div class="ribbon-tabs">{top_html}</div>
<div class="ribbon">{rib}</div>
<div class="formula-row"><div class="namebox">{namebox}</div><div class="fx">fx</div>
  <div class="fbar">{fbar}</div></div>
{grid}
<div class="tabs">{tabs_html}</div>
<div class="status-bar"><span>Ready</span><span>October 2026</span>
  <span>180 records</span><span style="margin-left:auto">100%</span></div>
<div class="scene-badge">{badge}</div>
<div class="wm">Animated recreation — not a live Excel recording</div>
</body></html>"""

def data_table(cols_hdr, rows, highlight_col=None, stripe=True, show_rows=10):
    # column widths tuned to the 9 columns
    colw = [46,110,140,110,140,100,70,90,120,110]
    cells = '<col style="width:46px">' + "".join(
        f'<col style="width:{w}px">' for w in [110,140,110,140,100,70,90,120,110])
    head = '<tr><th class="rowh"></th>' + "".join(
        f'<th class="colh">{c}</th>' for c in "ABCDEFGHI") + "</tr>"
    hdr = '<tr class="tblhdr"><td class="rowh">1</td>' + "".join(
        f"<td>{h}</td>" for h in cols_hdr) + "</tr>"
    body_rows = ""
    for i,r in enumerate(rows[:show_rows]):
        cls = "stripe" if (stripe and i%2==1) else ""
        tds = f'<td class="rowh">{i+2}</td>'
        for j,v in enumerate(r):
            extra = ""
            if j in (5,): extra=' class="num"'
            if j in (6,7): extra=' class="num"'
            if j==8:
                sc = "paid" if v=="Paid" else "pending"
                extra = f' class="ctr {sc}"'
            if j==1: extra=' class="ctr"'
            tds += f"<td{extra}>{v}</td>"
        body_rows += f'<tr class="{cls}">{tds}</tr>'
    return f'<table>{cells}{head}{hdr}{body_rows}</table>'

COLS = ["Date","Invoice No","Region","Salesperson","Product","Qty","Unit Price","Sales Amount","Payment Status"]

def cap(text):
    return f'<div class="caption"><div class="box">{text}</div></div>'

def hl(x,y,w,h):
    return f'<div class="hl" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>'

# ---------------------------------------------------------------- dashboard body
def dashboard_body(highlight=None):
    kpis = [("Total Sales","14,28,190"),("Total Orders","180"),
            ("Total Units Sold","11,834"),("Avg Sales / Order","7,934"),
            ("Pending Sales Amt","3,72,985")]
    kcards = "".join(
        f'<div class="kpi"><div class="k-l">{l}</div><div class="k-v">{v}</div></div>'
        for l,v in kpis)
    region = [("East","3,51,030"),("West","3,83,675"),("North","3,55,130"),
              ("South","3,38,355")]
    product = [("Tea A","3,85,320"),("Tea B","4,32,820"),("Tea C","6,10,050")]
    rrows = "".join(f'<tr><td>{a}</td><td class="num">{b}</td></tr>' for a,b in region)
    rrows += '<tr class="tot"><td>Total</td><td class="num">14,28,190</td></tr>'
    prows = "".join(f'<tr><td>{a}</td><td class="num">{b}</td></tr>' for a,b in product)
    prows += '<tr class="tot"><td>Total</td><td class="num">14,28,190</td></tr>'
    return f"""<div class="dtitle">SALES MIS REPORT</div>
<div class="dsub">Reporting Period: October 2026</div>
<div class="kpis">{kcards}</div>
<div class="twocol">
  <div class="sumtbl"><div class="h">REGION-WISE SALES</div><table>{rrows}</table></div>
  <div class="sumtbl"><div class="h">PRODUCT-WISE SALES</div><table>{prows}</table></div>
</div>"""

# ---------------------------------------------------------------- BEATS
# each beat: id, html, caption already embedded, duration sec, cursor (x0,y0,x1,y1)
beats = []
def add(bid, html, dur, cur=(960,300,960,300)):
    beats.append((bid, html, dur, cur))

# Beat 0 - intro title card
intro = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
.hero{{position:absolute;inset:0;background:linear-gradient(135deg,#102a43,#1F3864 55%,#217346);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}}
.hero h1{{font-size:92px;font-weight:900;letter-spacing:1px;text-shadow:0 4px 18px rgba(0,0,0,.4)}}
.hero h2{{font-size:40px;font-weight:600;margin-top:10px;color:#bfe3cc}}
.hero .pill{{margin-top:34px;background:rgba(255,255,255,.14);padding:14px 30px;border-radius:40px;font-size:26px}}
.hero .sub{{margin-top:26px;font-size:24px;opacity:.9}}
</style></head><body><div class="hero">
<h1>SALES MIS REPORT</h1><h2>Microsoft Excel 365 — Full Tutorial (Hinglish)</h2>
<div class="pill">Table • SUMIFS / COUNTIFS • Pivot • Charts • Slicers</div>
<div class="sub">October 2026 • 180 transactions • fully validated</div>
</div>
<div class="wm">Animated recreation — not a live Excel recording</div></body></html>"""
add("b00_intro", intro, 7, (600,900,1300,520))

# ---- full-narration driven beats (paced at speaking speed, auto-scaled) ----
import re
def _wc(t): return len(re.sub(r"<[^>]+>", "", t).split())
def dur_raw(t): return round(max(5.0, _wc(t)/2.15 + 1.0), 2)

DASH = dashboard_body()
RAW = data_table(COLS, DATA)
pivot_body = """<table><col style="width:46px"><col style="width:260px"><col style="width:260px">
<tr><th class="rowh"></th><th class="colh">A</th><th class="colh">B</th></tr>
<tr class="tblhdr"><td class="rowh">3</td><td>Row Labels</td><td>Sum of Sales Amount</td></tr>
<tr><td class="rowh">4</td><td>East</td><td class="num">3,51,030</td></tr>
<tr class="stripe"><td class="rowh">5</td><td>West</td><td class="num">3,83,675</td></tr>
<tr><td class="rowh">6</td><td>North</td><td class="num">3,55,130</td></tr>
<tr class="stripe"><td class="rowh">7</td><td>South</td><td class="num">3,38,355</td></tr>
<tr><td class="rowh">8</td><td><b>Grand Total</b></td><td class="num"><b>14,28,190</b></td></tr></table>"""
chart_body = """<div style="position:absolute;inset:0;background:#fff;padding:30px 60px">
<div style="font-size:26px;font-weight:700;color:#1F3864;margin-bottom:6px">Region-wise Sales Performance</div>
<div style="display:flex;align-items:flex-end;gap:60px;height:420px;border-left:3px solid #999;border-bottom:3px solid #999;padding:0 50px">
  <div style="text-align:center"><div style="width:120px;background:#4472C4;height:300px"></div>East<br>3,51,030</div>
  <div style="text-align:center"><div style="width:120px;background:#ED7D31;height:330px"></div>West<br>3,83,675</div>
  <div style="text-align:center"><div style="width:120px;background:#A5A5A5;height:305px"></div>North<br>3,55,130</div>
  <div style="text-align:center"><div style="width:120px;background:#FFC000;height:290px"></div>South<br>3,38,355</div>
</div></div>"""
slicer_body = """<div style="position:absolute;inset:0;background:#fff;display:flex;padding:30px;gap:30px">
<div style="flex:1">""" + pivot_body + """</div>
<div style="width:230px;border:2px solid #cfcfcf;border-radius:8px;padding:12px;box-shadow:0 3px 10px rgba(0,0,0,.08)">
<div style="font-weight:700;color:#1F3864;margin-bottom:10px">Region</div>
<div style="background:#4472C4;color:#fff;padding:10px;border-radius:5px;margin:6px 0">East</div>
<div style="background:#D9E1F2;padding:10px;border-radius:5px;margin:6px 0">West</div>
<div style="background:#D9E1F2;padding:10px;border-radius:5px;margin:6px 0">North</div>
<div style="background:#D9E1F2;padding:10px;border-radius:5px;margin:6px 0">South</div></div>
<div style="width:230px;border:2px solid #cfcfcf;border-radius:8px;padding:12px;box-shadow:0 3px 10px rgba(0,0,0,.08)">
<div style="font-weight:700;color:#1F3864;margin-bottom:10px">Product</div>
<div style="background:#D9E1F2;padding:10px;border-radius:5px;margin:6px 0">Tea A</div>
<div style="background:#D9E1F2;padding:10px;border-radius:5px;margin:6px 0">Tea B</div>
<div style="background:#D9E1F2;padding:10px;border-radius:5px;margin:6px 0">Tea C</div></div></div>"""

BADGE = [""]
_seq = [0]
def addf(caption, cur, *, tab="MIS_Dashboard", top="Home", nb="A1", fb="",
         body=None, hls="", dash=False):
    _seq[0] += 1
    bid = f"n{_seq[0]:02d}"
    b = DASH if body is None else body
    html = chrome_html(tab, top, nb, fb, b, cap(caption), BADGE[0], hls, dash)
    add(bid, html, dur_raw(caption), cur)

# ---- Scene 1 : Introduction ----
BADGE[0] = "Scene 1 • Introduction"
addf("Namaskaar doston, aur swagat hai aapka is channel par.", (300,760,760,420), dash=True)
addf("Aaj hum banayenge ek complete, professional <b>Sales MIS Report</b> — bilkul usi tarah jaise companies mein MIS executives banate hain.", (760,420,960,470), dash=True)
addf("<b>MIS</b> ka matlab hai <b>Management Information System</b> — raw transaction data ko aise summarise karna ki management ek nazar mein decision le sake.", (960,470,640,470), dash=True)
addf("Is video ke end tak aapke paas hoga ek live dashboard — Total Sales, Total Orders, region aur product analysis, Pivot Tables, charts aur interactive slicers.", (320,470,1600,470), dash=True)
addf("Main aapko sirf dikhaunga nahi, ek-ek formula samjhaunga bhi. Toh chaliye shuru karte hain.", (1600,470,360,760), dash=True)

# ---- Scene 2 : Understanding Raw Data ----
BADGE[0] = "Scene 2 • Raw Data"
addf("Sabse pehle data ko samajhte hain. Yeh <b>Raw_Data</b> sheet hai, aur isme hain October 2026 ki <b>180 sales transactions</b>.", (300,760,540,155), body=RAW, tab="Raw_Data", nb="A1", fb="Date", hls=hl(92,138,1050,30))
addf("Har column ka ek clear matlab hai: <b>Date</b> invoice ki tareekh, <b>Invoice No</b> har bill ka unique number, <b>Region</b> East, West, North ya South.", (540,155,240,340), body=RAW, tab="Raw_Data", nb="C3", fb="East", hls=hl(298,138,140,336))
addf("Phir <b>Salesperson</b>, <b>Product</b> — Tea A, Tea B ya Tea C, <b>Qty</b> kitne units bike, aur <b>Unit Price</b> ek unit ka daam.", (240,340,700,340), body=RAW, tab="Raw_Data", nb="E3", fb="Tea A", hls=hl(578,138,310,336))
addf("<b>Sales Amount</b> total value, aur <b>Payment Status</b> — Paid ya Pending.", (700,340,1200,340), body=RAW, tab="Raw_Data", nb="H3", fb="6600", hls=hl(888,138,320,336))
addf("Ek bahut important baat: is tutorial mein <b>ek row ka matlab ek unique invoice</b> hai. Har Invoice No bhara hua hai aur repeat nahi hota.", (1200,340,240,420), body=RAW, tab="Raw_Data", nb="B3", fb="INV-2026-0002", hls=hl(138,168,160,300))

# ---- Scene 3 : Convert to Excel Table ----
BADGE[0] = "Scene 3 • Excel Table"
addf("Ab is raw data ko ek <b>Excel Table</b> mein convert karenge. Isse formulas readable ban jaate hain aur ranges automatically expand hoti hain.", (300,760,600,300), body=RAW, tab="Raw_Data", nb="A2", fb="Date", hls=hl(92,138,1050,366))
addf("Kisi bhi data cell par click kijiye, phir dabaiye <b>Control plus T</b>. Excel apne aap range detect kar leta hai.", (600,300,900,300), body=RAW, tab="Raw_Data", nb="A2", fb="Date", hls=hl(92,138,1050,366))
addf("Dhyaan rakhiye ki <b>'My table has headers'</b> tick ho. OK dabate hi table ban gaya.", (900,300,500,250), body=RAW, tab="Raw_Data", nb="A2", fb="Date")
addf("Ab Table Design tab mein table ka naam badal dijiye <b>SalesData</b>. Yahi naam aage har formula mein kaam aayega, isliye saaf aur meaningful rakhiye.", (500,250,80,210), body=RAW, tab="Table Design", nb="SalesData", fb="", hls=hl(0,196,150,34))

# ---- Scene 4 : Sales Amount ----
BADGE[0] = "Scene 4 • Sales Amount"
addf("Ab Sales Amount nikaalte hain. Table ke andar formulas <b>structured references</b> use karte hain — column ke naam se, cell address se nahi.", (300,760,960,120), body=RAW, tab="Raw_Data", nb="H2", fb="=[@Qty]*[@[Unit Price]]", hls=hl(300,0,1200,34))
addf("Sales Amount column ke pehle cell mein likhiye — equals, bracket at Qty, close bracket, star, bracket at bracket Unit Price.", (960,120,960,168), body=RAW, tab="Raw_Data", nb="H2", fb="=[@Qty]*[@[Unit Price]]", hls=hl(300,0,1200,34)+hl(930,168,90,30))
addf("Poora formula banta hai <b>=[@Qty]*[@[Unit Price]]</b>. Yahan <b>at</b> ka matlab hai isi row ka value.", (960,168,980,183), body=RAW, tab="Raw_Data", nb="H2", fb="=[@Qty]*[@[Unit Price]]", hls=hl(930,168,90,30))
addf("Enter dabate hi Excel yeh formula <b>poore column</b> mein apne aap bhar deta hai. Ek baar likho, saari 180 rows calculate ho gayi.", (980,183,980,480), body=RAW, tab="Raw_Data", nb="H2", fb="=[@Qty]*[@[Unit Price]]", hls=hl(930,168,90,336))
addf("Row ek mein: <b>55 × 120 = 6,600</b>. Unit Price do shabdon ka naam hai, isliye uske around <b>double brackets</b> lagte hain.", (980,480,980,200), body=RAW, tab="Raw_Data", nb="H2", fb="=[@Qty]*[@[Unit Price]]", hls=hl(930,168,90,30))

# ---- Scene 5 : Monthly KPI Summary ----
BADGE[0] = "Scene 5 • KPI Summary"
addf("Ab aata hai dashboard ka dil — <b>KPI cards</b>. Yaad rakhiye, final values hum kabhi haath se type nahi karte.", (300,760,320,470), dash=True)
addf("Sab kuch formula se nikalta hai taaki data badalte hi number khud update ho jaaye.", (320,470,320,470), dash=True)
addf("Pehla KPI <b>Total Sales</b>. SUMIFS sirf October 2026 ka Sales Amount joregi, DATE function ki date condition ke saath.", (320,470,320,470), nb="B6", fb='=SUMIFS(SalesData[Sales Amount],SalesData[Date],"&gt;="&amp;DATE(2026,10,1),SalesData[Date],"&lt;"&amp;DATE(2026,11,1))', dash=True)
addf("Result aata hai <b>chaudah lakh, atthais hazaar, ek sau nabbe</b> — 14,28,190.", (320,470,320,470), nb="B6", fb='=SUMIFS(SalesData[Sales Amount], ... October 2026 ...)', dash=True)
addf("Doosra <b>Total Orders</b>. Kyunki ek row ek unique invoice hai, hum COUNTIFS se October ke non-blank invoices ginte hain. Total <b>180</b>.", (320,470,640,470), nb="D6", fb='=COUNTIFS(SalesData[Date], ... Oct ... ,SalesData[Invoice No],"&lt;&gt;")', dash=True)
addf("Teesra <b>Total Units Sold</b> — wahi date condition par Qty ka SUMIFS. Jawab <b>11,834 units</b>.", (640,470,960,470), nb="F6", fb='=SUMIFS(SalesData[Qty], ... October 2026 ...)', dash=True)
addf("Chautha <b>Average Sales per Order</b> — Total Sales divide by Total Orders, <b>IFERROR</b> mein lapet kar taaki divide-by-zero error na aaye. Lagbhag <b>7,934</b>.", (960,470,1280,470), nb="H6", fb='=IFERROR(B6/D6,0)', dash=True)
addf("Paanchva <b>Pending Sales Amount</b> — SUMIFS jisme Payment Status Pending ho, October ke andar. Yeh banta hai <b>3,72,985</b>.", (1280,470,1600,470), nb="B9", fb='=SUMIFS(SalesData[Sales Amount],SalesData[Payment Status],"Pending", ... Oct)', dash=True)
addf("Ise hum <b>Pending Sales Amount</b> keh rahe hain, Outstanding Receivables nahi — kyunki is data mein payment received ya balance ki koi field nahi hai.", (1600,470,1600,470), nb="B9", fb='=SUMIFS(SalesData[Sales Amount],SalesData[Payment Status],"Pending", ... Oct)', dash=True)

# ---- Scene 6 : Region-wise SUMIFS ----
BADGE[0] = "Scene 6 • Region Analysis"
addf("Ab region-wise todte hain. Management ko dekhna hota hai ki kaunsa region sabse aage hai.", (300,760,480,760), dash=True)
addf("Hum wahi SUMIFS use karenge, lekin ab ek extra condition — Region, jise hum ek cell se reference karte hain taaki formula copy ho sake.", (480,760,560,760), nb="C12", fb='=SUMIFS(SalesData[Sales Amount],SalesData[Region],B12, ... Oct)', dash=True)
addf("East <b>3,51,030</b>, West <b>3,83,675</b> — yeh sabse strong region hai, North <b>3,55,130</b>, aur South <b>3,38,355</b>.", (560,760,560,840), nb="C12", fb='=SUMIFS(SalesData[Sales Amount],SalesData[Region],B12, ... Oct)', dash=True)
addf("In chaaron ka total aana chahiye wahi <b>14,28,190</b> jo Total Sales KPI mein tha — yeh hamara <b>cross-check</b> hai ki numbers reconcile ho rahe hain.", (560,840,320,470), nb="C16", fb='=SUM(C12:C15)', dash=True)

# ---- Scene 7 : Native Pivot Table ----
BADGE[0] = "Scene 7 • Pivot Table"
addf("Formulas ke saath MIS mein <b>Pivot Tables</b> bhi zaroori hain, kyunki yeh drag-and-drop se instant summary deti hain.", (300,760,300,110), body=pivot_body, tab="Pivot_Analysis", top="Insert", nb="A3", hls=hl(0,0,150,34))
addf("SalesData table ke kisi cell par click kijiye, phir <b>Insert</b> tab, <b>PivotTable</b>, From Table slash Range. Source apne aap SalesData dikhayega.", (300,110,560,250), body=pivot_body, tab="Pivot_Analysis", top="Insert", nb="A3", hls=hl(0,0,150,34))
addf("New Worksheet choose karke OK. Ab <b>Region</b> ko Rows area mein drag kijiye, aur <b>Sales Amount</b> ko Values area mein.", (560,250,420,180), body=pivot_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="A4", hls=hl(92,100,420,120))
addf("Ek common galti — Excel kabhi Sales Amount ka <b>Count</b> dikha deta hai. Us field par click karke <b>Value Field Settings</b> mein <b>Sum</b> select kijiye.", (420,180,560,130), body=pivot_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="B3", hls=hl(284,100,228,30))
addf("Filter ke liye <b>Date</b> ko Filters area mein daal kar October 2026 set kar dijiye. Isi tarah ek doosra pivot <b>Product</b> ke liye banaiye.", (560,130,900,130), body=pivot_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="B3")

# ---- Scene 8 : Charts ----
BADGE[0] = "Scene 8 • Charts"
addf("Numbers ke saath visuals management ko turant samajh aate hain.", (300,760,700,400), body=chart_body, tab="Pivot_Analysis", top="Insert", nb="Chart 1")
addf("Region wale pivot par <b>PivotChart</b> choose kijiye aur <b>Clustered Column</b> select kijiye — yeh region-wise performance clearly dikhata hai.", (700,400,1100,400), body=chart_body, tab="Pivot_Analysis", top="Insert", nb="Chart 1")
addf("Product wale pivot ke liye <b>Pie chart</b> ya <b>Bar</b> accha rehta hai taaki har tea ka share dikhe.", (1100,400,700,500), body=chart_body, tab="Pivot_Analysis", top="Chart Design", nb="Chart 2")
addf("Chart par right-click karke <b>Add Data Labels</b> laga dijiye. Title meaningful rakhiye — jaise 'Region-wise Sales Performance'.", (700,500,500,250), body=chart_body, tab="Pivot_Analysis", top="Chart Design", nb="Chart 1")

# ---- Scene 9 : Slicers ----
BADGE[0] = "Scene 9 • Slicers"
addf("Ab isse <b>interactive</b> banate hain slicers ke saath.", (300,760,1500,300), body=slicer_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="Region")
addf("Pivot par click karke <b>PivotTable Analyze</b> tab mein <b>Insert Slicer</b> dabaiye. Region aur Product tick kijiye — do slicers ban gaye.", (1500,300,1600,160), body=slicer_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="Slicer", hls=hl(1498,110,440,500))
addf("Ab magic — ek hi slicer se dono pivots control karna. Slicer par right-click karke <b>Report Connections</b> mein saari PivotTables tick kar dijiye.", (1600,160,1600,160), body=slicer_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="Slicer")
addf("Dhyaan rakhiye — slicer sirf un pivots ko jodta hai jo <b>same data source</b>, yaani humari SalesData table se bane hain.", (1600,160,1498,130), body=slicer_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="Slicer")
addf("Ab <b>West</b> par click karte hi dono pivots aur charts turant filter ho jaayenge.", (1498,160,1600,220), body=slicer_body, tab="Pivot_Analysis", top="PivotTable Analyze", nb="Slicer", hls=hl(1498,180,210,50))

# ---- Scene 10 : Formatting ----
BADGE[0] = "Scene 10 • Formatting"
addf("Ab finishing touch — formatting. Professional dashboard ka matlab zyada decoration nahi, balki <b>clarity</b>.", (300,760,960,90), dash=True, tab="MIS_Dashboard", top="View")
addf("Title ko bold aur bada rakhiye, KPI cards ko ek consistent colour band dijiye, numbers par <b>thousands separator</b> wala format lagaiye.", (960,90,320,470), dash=True, tab="MIS_Dashboard", top="View")
addf("Gridlines ko <b>View</b> tab se off kar dijiye taaki look clean rahe. Ek hi font family, consistent spacing, aur bas do-teen colours kaafi hain.", (320,470,1600,470), dash=True, tab="MIS_Dashboard", top="View")
addf("Yaad rakhiye: MIS report padhne waale manager ke liye hai, isliye <b>readability</b> sabse upar.", (1600,470,960,560), dash=True, tab="MIS_Dashboard", top="View")

# ---- Scene 11 : Refresh & Validate ----
BADGE[0] = "Scene 11 • Refresh & Validate"
addf("MIS report tab tak bharosemand nahi jab tak refresh aur validation na ho.", (300,760,760,110), dash=True, tab="MIS_Dashboard", top="PivotTable Analyze")
addf("Agar aap Raw_Data mein naya transaction add karein — kyunki yeh ek Table hai, SUMIFS aur COUNTIFS <b>apne aap</b> naya data pakad lenge.", (760,110,760,110), dash=True, tab="MIS_Dashboard", top="PivotTable Analyze")
addf("Lekin Pivot Tables manually refresh karni padti hain: pivot par right-click <b>Refresh</b>, ya saare ek saath <b>Refresh All</b>, shortcut <b>Control plus Alt plus F5</b>.", (760,110,760,110), dash=True, tab="MIS_Dashboard", top="PivotTable Analyze")
addf("Validation ke liye teen cross-check: region-wise total Total Sales ke barabar, product-wise total bhi barabar, aur pivot ka October sum bhi wahi number.", (760,110,360,760), dash=True, tab="MIS_Dashboard", top="PivotTable Analyze")
addf("Agar teeno match karte hain — <b>14,28,190</b> — toh aapki report <b>reconcile</b> ho gayi. ✔", (360,760,1120,760), dash=True, tab="MIS_Dashboard", top="PivotTable Analyze")

# ---- Scene 12 : Conclusion ----
BADGE[0] = "Scene 12 • Conclusion"
addf("Toh doston, aaj humne zero se ek complete <b>Sales MIS Report</b> banayi.", (300,760,960,300), dash=True)
addf("Raw data se Excel Table, structured-reference Sales Amount, KPI cards SUMIFS aur COUNTIFS se, region aur product analysis, native Pivot Tables, charts aur slicers.", (960,300,320,470), dash=True)
addf("Aur sabse zaroori — humne har number ko validate kiya. Yahi cheez aapko ek professional <b>MIS executive</b> banati hai.", (320,470,1600,470), dash=True)
addf("Agar video useful laga toh <b>Like</b> kijiye, channel <b>Subscribe</b> kijiye, aur comment mein bataiye agli video kis topic par chahiye.", (1600,470,960,560), dash=True)

# Scene12 outro
outro = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
.hero{{position:absolute;inset:0;background:linear-gradient(135deg,#217346,#1F3864 60%,#102a43);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}}
.hero h1{{font-size:76px;font-weight:900}}
.hero .list{{margin-top:24px;font-size:28px;line-height:1.7;text-align:center;color:#d8ead f}}
.hero .cta{{margin-top:40px;font-size:34px;background:#e8373a;padding:16px 44px;border-radius:50px;font-weight:800}}
.hero .sub{{margin-top:22px;font-size:22px;opacity:.9}}
</style></head><body><div class="hero">
<h1>Ho Gaya! ✅</h1>
<div class="list">Table • Structured formulas • KPIs • Region/Product analysis<br>Pivot Tables • Charts • Slicers — sab <b>validated</b></div>
<div class="cta">\U0001F44D Like • Subscribe • Comment</div>
<div class="sub">Happy Excel-ing! — milte hain agli video mein</div>
</div>
<div class="wm">Animated recreation — not a live Excel recording</div></body></html>"""
add("b12_outro", outro, 7, (760,560,1160,560))

# ---------------------------------------------------------------- pace to target
TARGET = 810.0  # ~13.5 min, inside the 12-15 min window
CARDS = {"b00_intro", "b12_outro"}
card_sum = sum(d for b, h, d, c in beats if b in CARDS)
narr_sum = sum(d for b, h, d, c in beats if b not in CARDS)
factor = (TARGET - card_sum) / narr_sum
factor = min(2.2, max(0.85, factor))
beats = [(b, h, (d if b in CARDS else round(d * factor, 2)), c) for b, h, d, c in beats]
total = sum(d for _, _, d, _ in beats)
print(f"beats={len(beats)}  scale={factor:.3f}  total={total:.1f}s = {total/60:.2f} min")

# ---------------------------------------------------------------- render PNGs
def render(bid, html):
    hp = f"{HTML}/{bid}.html"; pp = f"{PNG}/{bid}.png"
    with open(hp,"w") as f: f.write(html)
    subprocess.run([CHROME,"--headless","--no-sandbox","--disable-gpu",
        "--hide-scrollbars","--force-device-scale-factor=1",
        "--window-size=1920,1080",f"--screenshot={pp}",f"file://{hp}"],
        check=True, capture_output=True)
    return pp

# cursor sprite (SVG -> PNG via chrome)
cursor_svg = """<!doctype html><html><head><meta charset=utf-8><style>html,body{margin:0;background:transparent}</style></head>
<body><svg width="44" height="60" viewBox="0 0 44 60" xmlns="http://www.w3.org/2000/svg">
<path d="M4 2 L4 44 L14 34 L21 50 L28 47 L21 31 L36 31 Z" fill="white" stroke="black" stroke-width="2.5" stroke-linejoin="round"/>
</svg></body></html>"""
with open(f"{HTML}/cursor.html","w") as f: f.write(cursor_svg)
subprocess.run([CHROME,"--headless","--no-sandbox","--disable-gpu",
    "--hide-scrollbars","--force-device-scale-factor=1","--default-background-color=00000000",
    "--window-size=44,60",f"--screenshot={ASSETS}/cursor.png",f"file://{HTML}/cursor.html"],
    check=True, capture_output=True)

print("Rendering", len(beats), "beats ...")
for bid, html, dur, cur in beats:
    render(bid, html)
print("PNGs done.")

# ---------------------------------------------------------------- per-beat clips
concat_lines = []
for bid, html, dur, cur in beats:
    pp = f"{PNG}/{bid}.png"; cp = f"{CLIPS}/{bid}.mp4"
    x0,y0,x1,y1 = cur
    # cursor eases from start to end over first 60% of beat, then rests
    tmove = max(0.1, dur*0.6)
    xexpr = f"if(lt(t,{tmove}),{x0}+({x1-x0})*(t/{tmove}),{x1})"
    yexpr = f"if(lt(t,{tmove}),{y0}+({y1-y0})*(t/{tmove}),{y1})"
    show_cursor = not (bid.endswith("intro") or bid.endswith("outro"))
    if show_cursor:
        fc = (f"[0:v]fps={FPS},format=yuva420p[bg];"
              f"[bg][1:v]overlay=x='{xexpr}':y='{yexpr}':eval=frame,"
              f"fade=t=in:st=0:d=0.3,format=yuv420p[v]")
        cmd = ["ffmpeg","-y","-loop","1","-t",str(dur),"-i",pp,
               "-i",f"{ASSETS}/cursor.png","-filter_complex",fc,"-map","[v]",
               "-r",str(FPS),"-c:v","libx264","-crf","20","-preset","veryfast",
               "-pix_fmt","yuv420p",cp]
    else:
        cmd = ["ffmpeg","-y","-loop","1","-t",str(dur),"-i",pp,
               "-vf",f"fps={FPS},fade=t=in:st=0:d=0.4,fade=t=out:st={dur-0.4}:d=0.4,format=yuv420p",
               "-r",str(FPS),"-c:v","libx264","-crf","20","-preset","veryfast",
               "-pix_fmt","yuv420p",cp]
    subprocess.run(cmd, check=True, capture_output=True)
    concat_lines.append(f"file '{cp}'")

with open(f"{CLIPS}/list.txt","w") as f: f.write("\n".join(concat_lines)+"\n")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",f"{CLIPS}/list.txt",
    "-c","copy",OUT], check=True, capture_output=True)

dur = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
    "-of","default=np=1:nk=1",OUT], capture_output=True, text=True).stdout.strip()
print("DONE:", OUT)
print("Total duration (s):", dur, "=", f"{float(dur)/60:.2f} min")
