#!/usr/bin/env python3
"""
Excel 365 UI recreation (HTML/CSS) used by build_video.py.

Layout is matched to a real Excel 365 desktop screenshot supplied as the
design reference: white title bar with AutoSave / quick-access / search /
window controls, full ribbon tab strip with Comments + Share, a real ribbon
with labelled groups, the Name Box / fx formula bar, a 26-row x 18-column
grid, sheet-tab strip with navigation arrows, and the light status bar.

Vertical budget (1080):
  title 42 | tabs 36 | ribbon 100 | formula 32 | grid 806 | sheettabs 32 | status 32
Grid internals: column-header row 26px, then 26 rows x 30px = 780.
Horizontal (1920): row-header 42 + A..I (1045) + J..R (833).
"""

# ---------------------------------------------------------------- geometry
TITLE_H, TABS_H, RIBBON_H, FBAR_H = 42, 36, 100, 32
GRID_TOP = TITLE_H + TABS_H + RIBBON_H + FBAR_H          # 210
COLHDR_H, ROW_H, N_ROWS = 26, 30, 26
ROWS_TOP = GRID_TOP + COLHDR_H                            # 236
ROWH_W = 42
COL_W = [120, 150, 100, 150, 100, 70, 100, 125, 130]      # A..I  = 1045
EXTRA_W = [93, 93, 93, 93, 93, 93, 93, 93, 89]            # J..R  = 833
ALL_W = COL_W + EXTRA_W
LETTERS = [chr(ord('A') + i) for i in range(len(ALL_W))]  # A..R

def col_x(letter):
    """Left pixel of a column."""
    i = LETTERS.index(letter)
    return ROWH_W + sum(ALL_W[:i])

def col_w(letter):
    return ALL_W[LETTERS.index(letter)]

def row_y(n):
    """Top pixel of sheet row n (1-based)."""
    return ROWS_TOP + (n - 1) * ROW_H

# ---------------------------------------------------------------- palette
GREEN      = "#107C41"
GREEN_DK   = "#0E6B38"
TXT        = "#1a1a1a"
BORDER     = "#e1dfdd"
GRIDLINE   = "#d7d7d7"
HDRBG      = "#f5f5f5"
HDRTXT     = "#505050"
NAVY       = "#1F3864"
BLUE       = "#2E5496"
TBLBLUE    = "#4472C4"
BAND       = "#D9E1F2"

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html{width:1920px;height:1080px;overflow:hidden}
body{width:1920px;height:1080px;overflow:hidden;background:#fff;position:relative;
  font-family:'Carlito','Calibri','Segoe UI','DejaVu Sans',sans-serif;color:#1a1a1a}

/* ---------- title bar ---------- */
.tbar{height:42px;background:#fff;border-bottom:1px solid #e1dfdd;
  display:flex;align-items:center;padding:0 10px;gap:10px;font-size:13px;color:#333}
.xicon{width:22px;height:22px;background:#107C41;color:#fff;border-radius:3px;
  display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px}
.autosave{display:flex;align-items:center;gap:6px;font-size:12px;color:#555;
  border:1px solid #e1dfdd;border-radius:20px;padding:3px 10px}
.toggle{width:26px;height:14px;background:#d9d9d9;border-radius:10px;position:relative}
.toggle i{position:absolute;left:2px;top:2px;width:10px;height:10px;background:#fff;
  border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,.3)}
.qa{display:flex;align-items:center;gap:9px;color:#555;font-size:14px}
.fname{margin-left:14px;font-size:14px;color:#222}
.search{flex:1;max-width:430px;margin:0 auto;height:26px;border:1px solid #e1dfdd;
  border-radius:4px;background:#f6f6f6;display:flex;align-items:center;gap:8px;
  padding:0 10px;color:#888;font-size:13px}
.tright{margin-left:auto;display:flex;align-items:center;gap:14px;color:#555}
.acct{width:24px;height:24px;border-radius:50%;border:1px solid #c9c9c9;
  display:flex;align-items:center;justify-content:center;font-size:12px;color:#666}
.wctl{display:flex;gap:16px;font-size:12px;color:#444;margin-left:4px}

/* ---------- ribbon tab strip ---------- */
.tabs{height:36px;background:#fff;display:flex;align-items:center;
  padding:0 8px;gap:2px;font-size:13.5px;color:#444;border-bottom:1px solid #e1dfdd}
.tabs .tb{padding:7px 11px;border-radius:4px}
.tabs .tb.on{color:#107C41;font-weight:700;box-shadow:inset 0 -2px 0 #107C41}
.tabs .right{margin-left:auto;display:flex;align-items:center;gap:10px}
.cmt{display:flex;align-items:center;gap:6px;border:1px solid #e1dfdd;
  border-radius:4px;padding:4px 10px;font-size:12.5px;color:#444}
.share{background:#107C41;color:#fff;border-radius:4px;padding:5px 16px;
  font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:6px}

/* ---------- ribbon ---------- */
.ribbon{height:100px;background:#fff;border-bottom:1px solid #e1dfdd;
  display:flex;align-items:stretch;padding:0 4px}
.rg{display:flex;flex-direction:column;justify-content:space-between;
  padding:5px 9px 2px;border-right:1px solid #ededed}
.rg .lbl{font-size:10.5px;color:#777;text-align:center;padding-top:2px}
.rr{display:flex;align-items:center;gap:5px}
.bigb{display:flex;flex-direction:column;align-items:center;justify-content:center;
  width:50px;font-size:10.5px;color:#444;gap:2px}
.bigb .g{font-size:21px;color:#107C41;line-height:1}
.sm{font-size:11px;color:#444;display:flex;align-items:center;gap:4px;padding:1px 0}
.ctl{border:1px solid #dcdcdc;border-radius:3px;background:#fff;
  font-size:11.5px;color:#333;padding:2px 6px;display:flex;align-items:center;gap:5px}
.sq{width:24px;height:22px;border:1px solid #e3e3e3;border-radius:3px;
  display:flex;align-items:center;justify-content:center;font-size:12px;color:#444}
.stylebox{width:92px;height:21px;border:1px solid #d6d6d6;font-size:11px;
  display:flex;align-items:center;justify-content:center}
.s-norm{background:#fff;color:#222}
.s-bad{background:#FFC7CE;color:#9C0006}
.s-good{background:#C6EFCE;color:#006100}
.s-neut{background:#FFEB9C;color:#9C6500}

/* ---------- formula bar ---------- */
.fbar{height:32px;background:#fff;border-bottom:1px solid #e1dfdd;
  display:flex;align-items:center;font-size:13.5px}
.nbox{width:150px;height:100%;border-right:1px solid #e1dfdd;display:flex;
  align-items:center;justify-content:space-between;padding:0 8px 0 12px;color:#222}
.nbox .cv{font-size:12px;color:#888}
.fmid{display:flex;align-items:center;gap:12px;padding:0 12px;color:#999;font-size:13px;
  border-right:1px solid #e1dfdd;height:100%}
.ftext{flex:1;padding:0 12px;font-size:13.5px;color:#111;white-space:nowrap;overflow:hidden}
.fchev{padding:0 12px;color:#888;font-size:11px}

/* ---------- grid ---------- */
.grid{height:806px;position:relative;background:#fff;overflow:hidden}
table.sheet{border-collapse:collapse;table-layout:fixed;width:1920px}
table.sheet th.ch{height:26px;background:#f5f5f5;border:1px solid #d7d7d7;
  font-weight:400;font-size:12px;color:#505050}
table.sheet td.rh{height:30px;background:#f5f5f5;border:1px solid #d7d7d7;
  font-size:12px;color:#505050;text-align:center}
table.sheet td{height:30px;border:1px solid #e4e4e4;font-size:13.5px;
  padding:0 7px;white-space:nowrap;overflow:hidden;color:#1a1a1a}
td.num{text-align:right}
td.ctr{text-align:center}
tr.hdr-plain td{font-weight:700;color:#000;background:#fff;border:1px solid #d7d7d7}
tr.hdr-tbl td{background:#4472C4;color:#fff;font-weight:600;border:1px solid #3a5ca8}
tr.band td{background:#D9E1F2}
.paid{color:#1f7a3d;font-weight:600}
.pend{color:#9C6500;font-weight:600}

/* overlays inside grid */
.layer{position:absolute;left:0;top:0;width:1920px;height:1080px;
  pointer-events:none;z-index:50}
.sel{position:absolute;border:2px solid #107C41;z-index:30;pointer-events:none}
.sel::after{content:'';position:absolute;right:-4px;bottom:-4px;width:7px;height:7px;
  background:#107C41;border:1px solid #fff}
.hl{position:absolute;border:2.5px solid #E8A200;border-radius:4px;
  background:rgba(232,162,0,.13);z-index:28}

/* panel (dashboard / pivot / chart) drawn over the cell area, gridlines off */
.panel{position:absolute;left:42px;top:26px;right:0;bottom:0;background:#fff;z-index:20;overflow:hidden}

/* ---------- sheet tabs + status ---------- */
.stabs{position:absolute;left:0;right:0;bottom:32px;z-index:10;height:32px;background:#f5f5f5;border-top:1px solid #e1dfdd;
  display:flex;align-items:center;padding:0 6px;gap:3px;font-size:13px;color:#555}
.navarr{display:flex;gap:12px;color:#9a9a9a;font-size:11px;padding:0 8px}
.stabs .st{padding:5px 14px;border-radius:3px 3px 0 0}
.stabs .st.on{background:#fff;color:#107C41;font-weight:700;
  box-shadow:inset 0 2px 0 #107C41;border:1px solid #e1dfdd;border-bottom:none}
.plus{padding:0 10px;color:#666;font-size:15px}
.hscroll{margin-left:auto;width:560px;height:11px;background:#e9e9e9;border-radius:6px;position:relative}
.hscroll i{position:absolute;left:0;top:0;height:11px;width:300px;background:#c7c7c7;border-radius:6px}
.sbar{position:absolute;left:0;right:0;bottom:0;z-index:10;height:32px;background:#f5f5f5;border-top:1px solid #e1dfdd;
  display:flex;align-items:center;padding:0 14px;gap:26px;font-size:12.5px;color:#444}
.sbar .r{margin-left:auto;display:flex;align-items:center;gap:14px}
.vbtn{display:flex;gap:8px;font-size:13px;color:#555}
.vbtn b{color:#107C41}
.zoom{width:120px;height:4px;background:#d4d4d4;border-radius:3px;position:relative}
.zoom i{position:absolute;left:52px;top:-5px;width:3px;height:14px;background:#777}

/* ---------- caption / badges ---------- */
.cap{position:absolute;left:0;right:0;bottom:128px;display:flex;justify-content:center;z-index:60}
.cap .box{max-width:1480px;background:rgba(14,22,40,.93);color:#fff;font-size:29px;
  line-height:1.42;padding:17px 32px;border-radius:12px;text-align:center;
  box-shadow:0 8px 28px rgba(0,0,0,.35)}
.cap .box b{color:#7fd1a0}
.badge{position:absolute;left:22px;top:972px;z-index:62;background:rgba(31,56,100,.93);
  color:#fff;font-size:15px;font-weight:700;padding:6px 14px;border-radius:7px}
.wm{position:absolute;left:250px;top:976px;z-index:62;background:rgba(0,0,0,.45);
  color:#fff;font-size:11.5px;padding:4px 10px;border-radius:5px}
"""

TOPTABS = ["File", "Home", "Insert", "Draw", "Page Layout", "Formulas",
           "Data", "Review", "View", "Automate", "Help"]

SHEETS = ["Read_Me", "Raw_Data", "MIS_Dashboard", "Pivot_Analysis"]


def _title_bar(fname="Sales_MIS_Report"):
    return (
      '<div class="tbar">'
      '<div class="xicon">X</div>'
      '<div class="autosave">AutoSave<div class="toggle"><i></i></div>Off</div>'
      '<div class="qa"><span>&#128190;</span><span>&#8630;&#9662;</span>'
      '<span>&#8631;&#9662;</span><span>&#9662;</span></div>'
      f'<div class="fname">{fname} - Excel</div>'
      '<div class="search">&#128269; Search</div>'
      '<div class="tright"><div class="acct">&#128100;</div>'
      '<div class="wctl"><span>&#8212;</span><span>&#9633;</span><span>&#10005;</span></div>'
      '</div></div>')


def _tab_strip(active):
    tabs = "".join(
        f'<div class="tb{" on" if t == active else ""}">{t}</div>' for t in TOPTABS)
    return (f'<div class="tabs">{tabs}'
            '<div class="right"><div class="cmt">&#128172; Comments</div>'
            '<div class="share">&#8599; Share</div></div></div>')


def _ribbon():
    g = []
    g.append('<div class="rg"><div class="rr">'
             '<div class="bigb"><div class="g">&#128203;</div>Paste&#9662;</div>'
             '<div><div class="sm">&#9986; Cut</div><div class="sm">&#10697; Copy</div>'
             '<div class="sm">&#128396; Format Painter</div></div>'
             '</div><div class="lbl">Clipboard &#9662;</div></div>')
    g.append('<div class="rg"><div class="rr">'
             '<div class="ctl">Aptos Narrow&#9662;</div><div class="ctl">11&#9662;</div>'
             '<div class="sq">A&#9650;</div><div class="sq">A&#9660;</div></div>'
             '<div class="rr"><div class="sq"><b>B</b></div><div class="sq"><i>I</i></div>'
             '<div class="sq"><u>U</u>&#9662;</div><div class="sq">&#9638;&#9662;</div>'
             '<div class="sq">&#9671;&#9662;</div><div class="sq">A&#9662;</div></div>'
             '<div class="lbl">Font &#9662;</div></div>')
    g.append('<div class="rg"><div class="rr">'
             '<div class="sq">&#8801;</div><div class="sq">&#8803;</div><div class="sq">&#8802;</div>'
             '<div class="ctl">&#8676;&#8677; Wrap Text</div></div>'
             '<div class="rr"><div class="sq">&#8676;</div><div class="sq">&#8677;</div>'
             '<div class="ctl">&#9707; Merge &amp; Center&#9662;</div></div>'
             '<div class="lbl">Alignment &#9662;</div></div>')
    g.append('<div class="rg"><div class="rr"><div class="ctl" style="width:128px">General&#9662;</div></div>'
             '<div class="rr"><div class="sq">$&#9662;</div><div class="sq">%</div>'
             '<div class="sq">,</div><div class="sq">.0</div><div class="sq">.00</div></div>'
             '<div class="lbl">Number &#9662;</div></div>')
    g.append('<div class="rg"><div class="rr">'
             '<div class="bigb"><div class="g">&#9636;</div>Conditional<br>Formatting&#9662;</div>'
             '<div class="bigb"><div class="g">&#9638;</div>Format as<br>Table&#9662;</div>'
             '<div><div class="rr"><div class="stylebox s-norm">Normal</div>'
             '<div class="stylebox s-bad">Bad</div></div>'
             '<div class="rr"><div class="stylebox s-good">Good</div>'
             '<div class="stylebox s-neut">Neutral</div></div></div></div>'
             '<div class="lbl">Styles</div></div>')
    g.append('<div class="rg"><div class="rr">'
             '<div class="bigb"><div class="g">&#8862;</div>Insert&#9662;</div>'
             '<div class="bigb"><div class="g">&#8863;</div>Delete&#9662;</div>'
             '<div class="bigb"><div class="g">&#9707;</div>Format&#9662;</div></div>'
             '<div class="lbl">Cells</div></div>')
    g.append('<div class="rg">'
             '<div class="sm">&#931; AutoSum&#9662;</div><div class="sm">&#8615; Fill&#9662;</div>'
             '<div class="sm">&#10006; Clear&#9662;</div>'
             '<div class="lbl">Editing</div></div>')
    g.append('<div class="rg"><div class="rr">'
             '<div class="bigb"><div class="g">&#8681;&#9699;</div>Sort &amp;<br>Filter&#9662;</div>'
             '<div class="bigb"><div class="g">&#128269;</div>Find &amp;<br>Select&#9662;</div></div>'
             '<div class="lbl">&nbsp;</div></div>')
    g.append('<div class="rg"><div class="rr">'
             '<div class="bigb"><div class="g">&#9707;</div>Add-ins</div></div>'
             '<div class="lbl">Add-ins</div></div>')
    g.append('<div class="rg"><div class="rr">'
             '<div class="bigb"><div class="g">&#10022;</div>Copilot</div></div>'
             '<div class="lbl">Copilot</div></div>')
    return '<div class="ribbon">' + "".join(g) + '</div>'


def _formula_bar(namebox, formula):
    return (f'<div class="fbar"><div class="nbox"><span>{namebox}</span>'
            '<span class="cv">&#9662;</span></div>'
            '<div class="fmid"><span>&#8942;</span><span>&#10005;</span>'
            '<span>&#10003;</span><span><i>fx</i></span></div>'
            f'<div class="ftext">{formula}</div><div class="fchev">&#9662;</div></div>')


def _sheet_tabs(active):
    t = "".join(f'<div class="st{" on" if s == active else ""}">{s}</div>' for s in SHEETS)
    return ('<div class="stabs"><div class="navarr"><span>&#9664;</span><span>&#9654;</span></div>'
            f'{t}<div class="plus">&#43;</div><div class="plus">&#8942;</div>'
            '<div class="hscroll"><i></i></div></div>')


def _status_bar(records="180 records"):
    return ('<div class="sbar"><span>Ready</span>'
            '<span>&#9855; Accessibility: Good to go</span>'
            f'<span>October 2026</span><span>{records}</span>'
            '<div class="r"><div class="vbtn"><b>&#9636;</b><span>&#9638;</span>'
            '<span>&#9707;</span></div><span>&#8722;</span>'
            '<div class="zoom"><i></i></div><span>&#43;</span><span>100%</span>'
            '</div></div>')


# ---------------------------------------------------------------- grid cells
def empty_grid(n_rows=N_ROWS):
    """Full empty sheet: column headers + row numbers + blank cells."""
    cols = "".join(f'<col style="width:{w}px">' for w in [ROWH_W] + ALL_W)
    head = '<tr><th class="ch"></th>' + "".join(
        f'<th class="ch">{L}</th>' for L in LETTERS) + '</tr>'
    body = ""
    for r in range(1, n_rows + 1):
        body += (f'<tr><td class="rh">{r}</td>'
                 + "".join('<td></td>' for _ in ALL_W) + '</tr>')
    return f'<table class="sheet"><colgroup>{cols}</colgroup>{head}{body}</table>'


def data_grid(headers, rows, styled=False, n_rows=N_ROWS):
    """Sheet with the sales data in A1:I11, remaining cells blank.

    styled=False -> plain bold header (data not yet converted to a Table)
    styled=True  -> blue Table header + banded rows (after Ctrl+T)
    """
    cols = "".join(f'<col style="width:{w}px">' for w in [ROWH_W] + ALL_W)
    head = '<tr><th class="ch"></th>' + "".join(
        f'<th class="ch">{L}</th>' for L in LETTERS) + '</tr>'
    pad = len(ALL_W) - len(headers)

    hdr_cls = "hdr-tbl" if styled else "hdr-plain"
    body = (f'<tr class="{hdr_cls}"><td class="rh">1</td>'
            + "".join(f'<td class="ctr">{h}</td>' for h in headers)
            + "".join('<td></td>' for _ in range(pad)) + '</tr>')

    for i, r in enumerate(rows):
        band = " band" if (styled and i % 2 == 1) else ""
        tds = ""
        for j, v in enumerate(r):
            cls = ""
            if j in (5, 6, 7):
                cls = ' class="num"'
            elif j == 1:
                cls = ' class="ctr"'
            elif j == 8:
                cls = f' class="ctr {"paid" if v == "Paid" else "pend"}"'
            tds += f'<td{cls}>{v}</td>'
        body += (f'<tr class="{band.strip()}"><td class="rh">{i+2}</td>{tds}'
                 + "".join('<td></td>' for _ in range(pad)) + '</tr>')

    for r in range(len(rows) + 2, n_rows + 1):
        body += (f'<tr><td class="rh">{r}</td>'
                 + "".join('<td></td>' for _ in ALL_W) + '</tr>')
    return f'<table class="sheet"><colgroup>{cols}</colgroup>{head}{body}</table>'


# ---------------------------------------------------------------- overlays
def hl(x, y, w, h):
    return f'<div class="hl" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>'


def sel(x, y, w, h):
    return f'<div class="sel" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>'


def cap(text):
    return f'<div class="cap"><div class="box">{text}</div></div>'


# ---------------------------------------------------------------- page
def page(*, sheet_tab, ribbon_tab, namebox, formula, grid_html,
         caption="", badge="", overlays="", panel_html=None,
         records="180 records"):
    """Assemble one full 1920x1080 Excel 365 frame."""
    panel = f'<div class="panel">{panel_html}</div>' if panel_html else ""
    return (
        '<!doctype html><html><head><meta charset="utf-8"><style>' + CSS +
        '</style></head><body>'
        + _title_bar()
        + _tab_strip(ribbon_tab)
        + _ribbon()
        + _formula_bar(namebox, formula)
        + '<div class="grid">' + grid_html + panel + '</div>'
        + _sheet_tabs(sheet_tab)
        + _status_bar(records)
        + '<div class="layer">' + overlays + caption
        + (f'<div class="badge">{badge}</div>' if badge else "")
        + '<div class="wm">Animated recreation &mdash; not a live Excel recording</div>'
        + '</div>'
        + '</body></html>')
