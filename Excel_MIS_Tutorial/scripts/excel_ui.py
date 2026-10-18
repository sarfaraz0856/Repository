#!/usr/bin/env python3
"""
Excel 365 desktop UI recreation (HTML/CSS) for the animated tutorial.

Matched to a real Excel 365 screenshot supplied as the design reference.
Worksheets are rendered from the real workbook (openpyxl): column widths, row
heights, merges, fills, fonts, borders and number formats come from the file,
and the formula bar shows the cell's real formula.

Page budget (1920 x 1080):
  title 42 | tabs 36 | ribbon 100 | formula bar 32 | grid 806 | sheet tabs 32 | status 32
"""
import datetime as _dt
import html as _html

W, H = 1920, 1080
GRID_Y = 210
GRID_BOTTOM = 1016
GRID_H = GRID_BOTTOM - GRID_Y
GREEN = "#107C41"
ACCENT1 = "#4F81BD"          # workbook theme accent1 (classic Office theme)
BAND = "#DCE6F1"             # TableStyleMedium2 row stripe for accent1


def esc(s):
    return _html.escape("" if s is None else str(s), quote=False)


# =================================================================== CSS
CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html{width:1920px;height:1080px;overflow:hidden}
body{width:1920px;height:1080px;overflow:hidden;background:#fff;position:relative;
  font-family:'Carlito','Calibri','Segoe UI','DejaVu Sans',sans-serif;color:#1a1a1a}

/* title bar */
.tbar{height:42px;background:#fff;border-bottom:1px solid #e1dfdd;display:flex;
  align-items:center;padding:0 10px;gap:10px;font-size:13px;color:#333}
.xicon{width:22px;height:22px;background:#107C41;color:#fff;border-radius:3px;display:flex;
  align-items:center;justify-content:center;font-weight:800;font-size:14px}
.autosave{display:flex;align-items:center;gap:6px;font-size:12px;color:#555;
  border:1px solid #e1dfdd;border-radius:20px;padding:3px 10px}
.toggle{width:26px;height:14px;background:#d9d9d9;border-radius:10px;position:relative}
.toggle i{position:absolute;left:2px;top:2px;width:10px;height:10px;background:#fff;
  border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,.3)}
.qa{display:flex;align-items:center;gap:9px;color:#555;font-size:14px}
.fname{margin-left:14px;font-size:14px;color:#222}
.search{width:430px;margin-left:120px;height:26px;border:1px solid #e1dfdd;border-radius:4px;
  background:#f6f6f6;display:flex;align-items:center;gap:8px;padding:0 10px;color:#888;font-size:13px}
.scene{margin-left:auto;display:flex;align-items:center;gap:10px}
.scene .sb{background:#1F3864;color:#fff;font-size:13px;font-weight:700;padding:4px 12px;border-radius:12px}
.scene .wm{color:#8a8a8a;font-size:11.5px}
.tright{margin-left:24px;display:flex;align-items:center;gap:14px;color:#555}
.acct{width:24px;height:24px;border-radius:50%;border:1px solid #c9c9c9;display:flex;
  align-items:center;justify-content:center;font-size:12px;color:#666}
.wctl{display:flex;gap:16px;font-size:12px;color:#444;margin-left:4px}

/* tab strip */
.tabs{height:36px;background:#fff;display:flex;align-items:center;padding:0 8px;gap:2px;
  font-size:13.5px;color:#444;border-bottom:1px solid #e1dfdd}
.tabs .tb{padding:7px 11px;border-radius:4px;white-space:nowrap}
.tabs .tb.ctx{color:#107C41}
.tabs .tb.on{color:#107C41;font-weight:700;box-shadow:inset 0 -2px 0 #107C41}
.tabs .right{margin-left:auto;display:flex;align-items:center;gap:10px}
.cmt{display:flex;align-items:center;gap:6px;border:1px solid #e1dfdd;border-radius:4px;
  padding:4px 10px;font-size:12.5px;color:#444}
.share{background:#107C41;color:#fff;border-radius:4px;padding:5px 16px;font-size:12.5px;font-weight:600}

/* ribbon */
.ribbon{height:100px;background:#fff;border-bottom:1px solid #e1dfdd;display:flex;
  align-items:stretch;padding:0 4px;overflow:hidden}
.rg{display:flex;flex-direction:column;justify-content:space-between;padding:5px 9px 2px;
  border-right:1px solid #ededed;flex:0 0 auto}
.rg .lbl{font-size:10.5px;color:#777;text-align:center;padding-top:2px;white-space:nowrap}
.rr{display:flex;align-items:center;gap:5px}
.rc{display:flex;flex-direction:column;gap:2px}
.bigb{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
  min-width:50px;font-size:10.5px;color:#444;gap:3px;text-align:center;line-height:1.15;padding:2px 3px;border-radius:3px}
.bigb .g{font-size:22px;color:#107C41;line-height:1;height:26px;display:flex;align-items:center}
.sm{font-size:11px;color:#444;display:flex;align-items:center;gap:4px;padding:1px 3px;white-space:nowrap;border-radius:3px}
.sm .g{color:#107C41}
.ctl{border:1px solid #dcdcdc;border-radius:3px;background:#fff;font-size:11.5px;color:#333;
  padding:2px 6px;display:flex;align-items:center;gap:5px;white-space:nowrap}
.sq{width:24px;height:22px;border:1px solid #e3e3e3;border-radius:3px;display:flex;
  align-items:center;justify-content:center;font-size:12px;color:#444}
.chk{font-size:11px;color:#333;display:flex;align-items:center;gap:5px;white-space:nowrap;padding:1px 2px}
.chk i{width:12px;height:12px;border:1px solid #888;border-radius:2px;display:inline-flex;
  align-items:center;justify-content:center;font-style:normal;font-size:10px;line-height:1;background:#fff}
.chk i.on{background:#107C41;border-color:#107C41;color:#fff}
.stylebox{width:92px;height:21px;border:1px solid #d6d6d6;font-size:11px;display:flex;
  align-items:center;justify-content:center}
.s-norm{background:#fff}.s-bad{background:#FFC7CE;color:#9C0006}
.s-good{background:#C6EFCE;color:#006100}.s-neut{background:#FFEB9C;color:#9C6500}
.gal{display:flex;gap:4px}
.gal b{display:block;width:34px;height:26px;border:1px solid #cfcfcf;border-radius:2px;
  background:repeating-linear-gradient(#fff 0 5px,#DCE6F1 5px 10px)}
.gal b.hd{background:linear-gradient(#4F81BD 0 6px,transparent 6px),repeating-linear-gradient(#fff 0 5px,#DCE6F1 5px 10px)}
.gal b.sel{outline:2px solid #107C41}
.inp{border:1px solid #9a9a9a;background:#fff;font-size:12px;padding:2px 6px;min-width:120px;color:#111}
.rhl{outline:3px solid #E8A200;outline-offset:1px;background:rgba(232,162,0,.15)}

/* formula bar */
.fbar{height:32px;background:#fff;border-bottom:1px solid #e1dfdd;display:flex;align-items:center;font-size:13.5px}
.nbox{width:150px;height:100%;border-right:1px solid #e1dfdd;display:flex;align-items:center;
  justify-content:space-between;padding:0 8px 0 12px;color:#222}
.nbox .cv{font-size:12px;color:#888}
.fmid{display:flex;align-items:center;gap:12px;padding:0 12px;color:#bbb;font-size:13px;
  border-right:1px solid #e1dfdd;height:100%}
.fmid.ed span.x{color:#c42b1c}.fmid.ed span.ok{color:#107C41}
.ftext{flex:1;padding:0 12px;font-size:14px;color:#111;white-space:nowrap;overflow:hidden;
  font-family:'Carlito','Calibri',sans-serif}
.fchev{padding:0 12px;color:#888;font-size:11px}
.caret{display:inline-block;width:1.5px;height:16px;background:#111;vertical-align:-3px;margin-left:1px}

/* grid */
.grid{position:absolute;left:0;top:210px;height:806px;overflow:hidden;background:#fff}
.c{position:absolute;overflow:hidden;white-space:nowrap;display:flex;line-height:1.15}
.c.ov{overflow:visible;z-index:2}
.ch,.rh{position:absolute;background:#F3F3F3;color:#555;display:flex;align-items:center;
  justify-content:center;border-right:1px solid #D4D4D4;border-bottom:1px solid #D4D4D4}
.ch.s,.rh.s{background:#D2D2D2;color:#107C41;font-weight:700}
.ch.s{box-shadow:inset 0 -2px 0 #107C41}.rh.s{box-shadow:inset -2px 0 0 #107C41}
.corner{position:absolute;left:0;top:0;background:#F3F3F3;border-right:1px solid #D4D4D4;border-bottom:1px solid #D4D4D4}
.fz{position:absolute;background:#9a9a9a;z-index:5}
.acell{position:absolute;border:2px solid #107C41;z-index:20}
.acell i{position:absolute;right:-5px;bottom:-5px;width:7px;height:7px;background:#107C41;border:1px solid #fff}
.rng{position:absolute;background:rgba(0,0,0,.075);border:2px solid #107C41;z-index:19}
.ants{position:absolute;border:2px dashed #107C41;z-index:21}
.farr{position:absolute;right:3px;bottom:3px;width:17px;height:17px;border:1px solid #ababab;
  background:#fff;color:#555;font-size:10px;display:flex;align-items:center;justify-content:center;border-radius:2px}
.edit{background:#fff !important;z-index:22;box-shadow:0 0 0 2px #107C41}
.hl{position:absolute;border:3px solid #E8A200;border-radius:4px;background:rgba(232,162,0,.12);z-index:30}

/* floating objects */
.obj{position:absolute;background:#fff;z-index:40}
.chart{border:1px solid #c8c8c8;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.chart.sel{border:1px solid #9a9a9a;outline:1px solid #bdbdbd}
.hdl{position:absolute;width:9px;height:9px;background:#fff;border:1px solid #777;border-radius:50%}
.fbtn{position:absolute;font-size:12px;background:#f2f2f2;border:1px solid #c6c6c6;padding:2px 7px;color:#333;border-radius:2px;white-space:nowrap}
.slicer{border:1px solid #c6c6c6;box-shadow:0 1px 4px rgba(0,0,0,.1)}
.slicer .sh{display:flex;align-items:center;justify-content:space-between;padding:8px 10px 6px;font-size:15px;color:#1F3864;font-weight:700}
.slicer .sh span{font-weight:400;color:#666;font-size:13px;display:flex;gap:9px}
.slicer .si{margin:5px 10px;padding:7px 10px;font-size:14px;border:1px solid #c9d3e3;background:#fff;color:#222;border-radius:2px}
.slicer .si.on{background:#B8CCE4;border-color:#4F81BD;color:#000;font-weight:600}
.slicer .si.off{background:#fff;color:#a0a0a0;border-color:#e2e2e2}

/* dialogs */
.dim{position:absolute;inset:0;background:rgba(0,0,0,.06);z-index:70}
.dlg{position:absolute;z-index:71;background:#fff;border:1px solid #9a9a9a;border-radius:8px;
  box-shadow:0 12px 40px rgba(0,0,0,.28);font-size:14px;color:#222;overflow:hidden}
.dlg .dt{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;font-size:14px;color:#222}
.dlg .dt b{font-weight:600}
.dlg .db{padding:6px 18px 12px}
.dlg .dbtns{display:flex;justify-content:flex-end;gap:10px;padding:10px 16px 14px}
.btn{min-width:86px;text-align:center;padding:5px 14px;border:1px solid #adadad;border-radius:4px;background:#fdfdfd;font-size:13px}
.btn.pri{border:2px solid #107C41;background:#fff}
.dfield{border:1px solid #8a8a8a;padding:5px 8px;font-size:14px;margin:6px 0 10px;background:#fff}
.dlist{border:1px solid #bdbdbd;margin:6px 0;max-height:none}
.dlist div{padding:5px 10px;font-size:14px}
.dlist div.on{background:#CCE4F7}
.radio{display:inline-block;width:13px;height:13px;border:1px solid #666;border-radius:50%;margin-right:6px;vertical-align:-2px;position:relative}
.radio.on::after{content:'';position:absolute;left:3px;top:3px;width:5px;height:5px;border-radius:50%;background:#222}
.cb{display:inline-flex;width:14px;height:14px;border:1px solid #666;border-radius:2px;margin-right:8px;vertical-align:-2px;
  align-items:center;justify-content:center;font-size:11px;line-height:1}
.cb.on{background:#107C41;border-color:#107C41;color:#fff}

/* task pane */
.pane{position:absolute;right:0;top:210px;width:340px;height:838px;background:#fff;border-left:1px solid #d6d6d6;z-index:45;font-size:13.5px;color:#222}
.pane .pt{display:flex;justify-content:space-between;padding:12px 14px 6px;font-size:16px;font-weight:600}
.pane .ps{padding:0 14px 6px;color:#666;font-size:12.5px}
.pane .srch{margin:4px 14px 8px;border:1px solid #c8c8c8;padding:4px 8px;color:#999;font-size:12.5px}
.pane .fl{margin:0 14px;border:1px solid #e3e3e3;padding:4px 0}
.pane .fl div{padding:4px 10px;display:flex;align-items:center}
.pane .ah{margin:10px 14px 2px;color:#666;font-size:12.5px}
.pane .areas{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 14px}
.pane .area{border:1px solid #d6d6d6;min-height:96px;padding:4px}
.pane .area .an{font-size:12px;color:#555;padding:2px 2px 6px;border-bottom:1px solid #eee;margin-bottom:4px}
.pane .chip{background:#f3f6fb;border:1px solid #c5d1e3;padding:4px 7px;font-size:12.5px;margin:3px 0;display:flex;justify-content:space-between}

/* sheet tabs + status */
.stabs{position:absolute;left:0;right:0;bottom:32px;height:32px;background:#f5f5f5;border-top:1px solid #e1dfdd;
  display:flex;align-items:center;padding:0 6px;gap:3px;font-size:13px;color:#555;z-index:46}
.navarr{display:flex;gap:12px;color:#9a9a9a;font-size:11px;padding:0 8px}
.stabs .st{padding:5px 14px;border-radius:3px 3px 0 0;white-space:nowrap}
.stabs .st.on{background:#fff;color:#107C41;font-weight:700;box-shadow:inset 0 2px 0 #107C41;border:1px solid #e1dfdd;border-bottom:none}
.plus{padding:0 10px;color:#666;font-size:15px}
.hscroll{margin-left:auto;width:560px;height:11px;background:#e9e9e9;border-radius:6px;position:relative}
.hscroll i{position:absolute;left:0;top:0;height:11px;width:300px;background:#c7c7c7;border-radius:6px}
.sbar{position:absolute;left:0;right:0;bottom:0;height:32px;background:#f5f5f5;border-top:1px solid #e1dfdd;
  display:flex;align-items:center;padding:0 14px;gap:26px;font-size:12.5px;color:#444;z-index:46}
.sbar .r{margin-left:auto;display:flex;align-items:center;gap:14px}
.vbtn{display:flex;gap:8px;font-size:13px;color:#555}.vbtn b{color:#107C41}
.zoom{width:120px;height:4px;background:#d4d4d4;border-radius:3px;position:relative}
.zoom i{position:absolute;top:-5px;width:3px;height:14px;background:#777}

/* caption */
.cap{position:absolute;left:0;right:0;bottom:74px;display:flex;justify-content:center;z-index:90;pointer-events:none}
.cap .box{max-width:1560px;background:rgba(14,22,40,.92);color:#fff;font-size:27px;line-height:1.38;
  padding:12px 30px;border-radius:10px;text-align:center;box-shadow:0 6px 22px rgba(0,0,0,.3)}
.cap .box b{color:#8fe0b0}
"""

# =================================================================== chrome
TOPTABS = ["File", "Home", "Insert", "Draw", "Page Layout", "Formulas",
           "Data", "Review", "View", "Automate", "Help"]
CONTEXT = {
    "Table Design": ["Table Design"],
    "PivotTable Analyze": ["PivotTable Analyze", "Design"],
    "Chart Design": ["PivotChart Analyze", "Design", "Format"],
    "Slicer": ["Slicer"],
}


def title_bar(badge=""):
    return ('<div class="tbar"><div class="xicon">X</div>'
            '<div class="autosave">AutoSave<div class="toggle"><i></i></div>Off</div>'
            '<div class="qa"><span>&#128190;</span><span>&#8630;&#9662;</span>'
            '<span>&#8631;&#9662;</span><span>&#9662;</span></div>'
            '<div class="fname">Sales_MIS_Report - Excel</div>'
            '<div class="search">&#128269; Search</div>'
            '<div class="scene">'
            + (f'<span class="sb">{badge}</span>' if badge else '')
            + '<span class="wm">Animated recreation &bull; AI voice</span></div>'
            '<div class="tright"><div class="acct">&#128100;</div>'
            '<div class="wctl"><span>&#8212;</span><span>&#9633;</span><span>&#10005;</span></div></div></div>')


def tab_strip(active, context=None):
    ctx = CONTEXT.get(context or active, [])
    out = "".join(f'<div class="tb{" on" if t == active else ""}" data-id="tab-{t}">{t}</div>'
                  for t in TOPTABS)
    out += "".join(f'<div class="tb ctx{" on" if t == active else ""}" data-id="tab-{t}">{t}</div>'
                   for t in ctx)
    return (f'<div class="tabs">{out}<div class="right"><div class="cmt">&#128172; Comments</div>'
            '<div class="share">&#8599; Share</div></div></div>')


def _g(label, inner):
    return f'<div class="rg">{inner}<div class="lbl">{label}</div></div>'


def _bb(icon, label, did="", hl=None):
    c = " rhl" if did and did == hl else ""
    return f'<div class="bigb{c}" data-id="{did}"><div class="g">{icon}</div>{label}</div>'


def _sm(icon, label, did="", hl=None):
    c = " rhl" if did and did == hl else ""
    return f'<div class="sm{c}" data-id="{did}"><span class="g">{icon}</span>{label}</div>'


def _ck(on, label, did="", hl=None):
    c = " rhl" if did and did == hl else ""
    return f'<div class="chk{c}" data-id="{did}"><i class="{"on" if on else ""}">{"&#10003;" if on else ""}</i>{label}</div>'


def rib_home(hl=None, **k):
    return "".join([
        _g("Clipboard &#9662;", '<div class="rr">' + _bb("&#128203;", "Paste&#9662;")
           + '<div class="rc">' + _sm("&#9986;", "Cut") + _sm("&#10697;", "Copy")
           + _sm("&#128396;", "Format Painter") + '</div></div>'),
        _g("Font &#9662;", '<div class="rc"><div class="rr"><div class="ctl">Calibri&#9662;</div>'
           '<div class="ctl">11&#9662;</div><div class="sq">A&#9650;</div><div class="sq">A&#9660;</div></div>'
           '<div class="rr"><div class="sq"><b>B</b></div><div class="sq"><i>I</i></div><div class="sq"><u>U</u></div>'
           '<div class="sq">&#9638;&#9662;</div><div class="sq">&#9671;&#9662;</div><div class="sq">A&#9662;</div></div></div>'),
        _g("Alignment &#9662;", '<div class="rc"><div class="rr"><div class="sq">&#8801;</div><div class="sq">&#8803;</div>'
           '<div class="sq">&#8802;</div><div class="ctl">Wrap Text</div></div><div class="rr"><div class="sq">&#8676;</div>'
           '<div class="sq">&#8677;</div><div class="ctl">Merge &amp; Center&#9662;</div></div></div>'),
        _g("Number &#9662;", '<div class="rc"><div class="ctl" style="width:128px">' + k.get("numfmt", "General")
           + '&#9662;</div><div class="rr"><div class="sq">$&#9662;</div><div class="sq">%</div>'
           '<div class="sq" data-id="rb-comma">,</div><div class="sq">.0</div><div class="sq">.00</div></div></div>'),
        _g("Styles", '<div class="rr">' + _bb("&#9636;", "Conditional<br>Formatting&#9662;")
           + _bb("&#9638;", "Format as<br>Table&#9662;", "rb-fmt-table", hl)
           + '<div class="rc"><div class="rr"><div class="stylebox s-norm">Normal</div><div class="stylebox s-bad">Bad</div></div>'
           '<div class="rr"><div class="stylebox s-good">Good</div><div class="stylebox s-neut">Neutral</div></div></div></div>'),
        _g("Cells", '<div class="rr">' + _bb("&#8862;", "Insert&#9662;") + _bb("&#8863;", "Delete&#9662;")
           + _bb("&#9707;", "Format&#9662;") + '</div>'),
        _g("Editing", '<div class="rr"><div class="rc">' + _sm("&#931;", "AutoSum&#9662;") + _sm("&#8615;", "Fill&#9662;")
           + _sm("&#10006;", "Clear&#9662;") + '</div>' + _bb("&#8693;", "Sort &amp;<br>Filter&#9662;")
           + _bb("&#128269;", "Find &amp;<br>Select&#9662;") + '</div>'),
        _g("Add-ins", _bb("&#9707;", "Add-ins")),
        _g("Copilot", _bb("&#10022;", "Copilot")),
    ])


def rib_insert(hl=None, **k):
    return "".join([
        _g("Tables", '<div class="rr">' + _bb("&#9638;", "PivotTable&#9662;", "rb-pivot", hl)
           + _bb("&#9707;", "Recommended<br>PivotTables") + _bb("&#9636;", "Table", "rb-table", hl) + '</div>'),
        _g("Illustrations", _bb("&#9673;", "Illustrations&#9662;")),
        _g("Charts", '<div class="rr">' + _bb("&#128202;", "Recommended<br>Charts")
           + '<div class="rc"><div class="rr"><div class="sq">&#9601;&#9603;</div><div class="sq">&#8599;</div><div class="sq">&#9684;</div></div>'
           '<div class="rr"><div class="sq">&#9636;</div><div class="sq">&#8728;</div><div class="sq">&#9650;</div></div></div>'
           + _bb("&#128202;", "PivotChart&#9662;", "rb-pivotchart", hl) + '</div>'),
        _g("Sparklines", '<div class="rc">' + _sm("&#8605;", "Line") + _sm("&#9601;", "Column") + _sm("&#9645;", "Win/Loss") + '</div>'),
        _g("Filters", '<div class="rc">' + _sm("&#9707;", "Slicer", "rb-ins-slicer", hl) + _sm("&#9719;", "Timeline") + '</div>'),
        _g("Links", _bb("&#128279;", "Link")),
        _g("Comments", _bb("&#128172;", "Comment")),
        _g("Text", _bb("A", "Text&#9662;")),
        _g("Symbols", '<div class="rc">' + _sm("&#960;", "Equation&#9662;") + _sm("&#937;", "Symbol") + '</div>'),
    ])


def rib_table_design(hl=None, table_name="Table1", banded=True, **k):
    return "".join([
        _g("Properties", '<div class="rc"><div class="sm">Table Name:</div>'
           f'<div class="inp{" rhl" if hl == "rb-tablename" else ""}" data-id="rb-tablename">{esc(table_name)}</div>'
           + _sm("&#9707;", "Resize Table") + '</div>'),
        _g("Tools", '<div class="rr"><div class="rc">' + _sm("&#9638;", "Summarize with PivotTable")
           + _sm("&#10006;", "Remove Duplicates") + _sm("&#8644;", "Convert to Range") + '</div>'
           + _bb("&#9707;", "Insert<br>Slicer", "rb-tbl-slicer", hl) + '</div>'),
        _g("External Table Data", '<div class="rr">' + _bb("&#8599;", "Export&#9662;") + _bb("&#8635;", "Refresh&#9662;")
           + '<div class="rc">' + _sm("", "Properties") + _sm("", "Open in Browser") + _sm("", "Unlink") + '</div></div>'),
        _g("Table Style Options", '<div class="rr"><div class="rc">' + _ck(True, "Header Row") + _ck(False, "Total Row")
           + _ck(banded, "Banded Rows", "rb-banded", hl) + '</div><div class="rc">' + _ck(False, "First Column")
           + _ck(False, "Last Column") + _ck(False, "Banded Columns") + '</div><div class="rc">'
           + _ck(True, "Filter Button") + '</div></div>'),
        _g("Table Styles", '<div class="gal"><b class="hd"></b><b class="hd sel"></b><b class="hd"></b><b class="hd"></b>'
           '<b></b><b></b><b></b></div>'),
    ])


def rib_pivot(hl=None, **k):
    return "".join([
        _g("PivotTable", '<div class="rc"><div class="sm">PivotTable Name:</div>'
           f'<div class="inp">{k.get("pt_name", "PivotTable1")}</div>' + _sm("&#9881;", "Options&#9662;") + '</div>'),
        _g("Active Field", '<div class="rc"><div class="sm">Active Field:</div>'
           f'<div class="inp">{k.get("active_field", "Sum of Sales Amount")}</div>'
           + _sm("&#9881;", "Field Settings", "rb-fieldsettings", hl) + '</div>'),
        _g("Group", '<div class="rc">' + _sm("&#8594;", "Group Selection") + _sm("&#8592;", "Ungroup") + _sm("&#9707;", "Group Field") + '</div>'),
        _g("Filter", '<div class="rr">' + _bb("&#9707;", "Insert<br>Slicer", "rb-insslicer", hl)
           + _bb("&#9719;", "Insert<br>Timeline") + _bb("&#9776;", "Filter<br>Connections") + '</div>'),
        _g("Data", '<div class="rr">' + _bb("&#8635;", "Refresh&#9662;", "rb-refresh", hl)
           + _bb("&#9707;", "Change Data<br>Source&#9662;") + '</div>'),
        _g("Actions", '<div class="rc">' + _sm("&#10006;", "Clear&#9662;") + _sm("&#8689;", "Select&#9662;") + _sm("&#8644;", "Move PivotTable") + '</div>'),
        _g("Calculations", _bb("fx", "Fields, Items,<br>&amp; Sets&#9662;")),
        _g("Tools", '<div class="rr">' + _bb("&#128202;", "PivotChart", "rb-pivotchart2", hl)
           + _bb("&#9707;", "Recommended<br>PivotTables") + '</div>'),
        _g("Show", '<div class="rr">' + _bb("&#9776;", "Field<br>List", "rb-fieldlist", hl)
           + _bb("&#177;", "+/-<br>Buttons") + _bb("&#9636;", "Field<br>Headers") + '</div>'),
    ])


def rib_chart(hl=None, **k):
    return "".join([
        _g("Chart Layouts", '<div class="rr">' + _bb("&#10010;", "Add Chart<br>Element&#9662;", "rb-addelem", hl)
           + _bb("&#9638;", "Quick<br>Layout&#9662;") + '</div>'),
        _g("&nbsp;", _bb("&#127912;", "Change<br>Colors&#9662;")),
        _g("Chart Styles", '<div class="gal"><b style="background:linear-gradient(90deg,#4F81BD 30%,#fff 30% 40%,#4F81BD 40% 70%,#fff 70%)"></b>'
           '<b class="sel" style="background:linear-gradient(90deg,#4F81BD 30%,#fff 30% 40%,#4F81BD 40% 70%,#fff 70%)"></b>'
           '<b style="background:#dde6f3"></b><b style="background:#e9eef6"></b><b></b><b></b></div>'),
        _g("Data", '<div class="rr">' + _bb("&#8644;", "Switch Row/<br>Column") + _bb("&#9638;", "Select<br>Data") + '</div>'),
        _g("Type", _bb("&#128202;", "Change<br>Chart Type")),
        _g("Location", _bb("&#8689;", "Move<br>Chart")),
    ])


def rib_view(hl=None, gridlines=True, **k):
    return "".join([
        _g("Sheet View", '<div class="rc">' + _sm("&#128065;", "Default&#9662;") + _sm("&#10003;", "Keep") + _sm("&#9707;", "Options") + '</div>'),
        _g("Workbook Views", '<div class="rr">' + _bb("&#9638;", "Normal") + _bb("&#9707;", "Page Break<br>Preview")
           + _bb("&#9636;", "Page<br>Layout") + _bb("&#9776;", "Custom<br>Views") + '</div>'),
        _g("Show", '<div class="rr"><div class="rc">' + _ck(False, "Ruler") + _ck(gridlines, "Gridlines", "rb-gridlines", hl)
           + '</div><div class="rc">' + _ck(True, "Formula Bar") + _ck(True, "Headings") + '</div></div>'),
        _g("Zoom", '<div class="rr">' + _bb("&#128269;", "Zoom") + _bb("100", "100%") + _bb("&#9707;", "Zoom to<br>Selection") + '</div>'),
        _g("Window", '<div class="rr">' + _bb("&#9707;", "New<br>Window") + _bb("&#9638;", "Arrange<br>All")
           + _bb("&#10052;", "Freeze<br>Panes&#9662;") + '<div class="rc">' + _sm("", "Split") + _sm("", "Hide") + _sm("", "Unhide") + '</div>'
           + _bb("&#8644;", "Switch<br>Windows&#9662;") + '</div>'),
        _g("Macros", _bb("&#9654;", "Macros&#9662;")),
    ])


def rib_data(hl=None, **k):
    return "".join([
        _g("Get &amp; Transform Data", '<div class="rr">' + _bb("&#9707;", "Get<br>Data&#9662;")
           + '<div class="rc">' + _sm("&#128196;", "From Text/CSV") + _sm("&#127760;", "From Web") + _sm("&#9638;", "From Table/Range") + '</div></div>'),
        _g("Queries &amp; Connections", '<div class="rr">' + _bb("&#8635;", "Refresh<br>All&#9662;", "rb-refreshall", hl)
           + '<div class="rc">' + _sm("", "Queries &amp; Connections") + _sm("", "Properties") + _sm("", "Workbook Links") + '</div></div>'),
        _g("Data Types", '<div class="rr">' + _bb("&#127963;", "Stocks") + _bb("&#127757;", "Geography") + '</div>'),
        _g("Sort &amp; Filter", '<div class="rr"><div class="rc">' + _sm("A&#8595;", "") + _sm("Z&#8595;", "") + '</div>'
           + _bb("&#8693;", "Sort") + _bb("&#9660;", "Filter") + '<div class="rc">' + _sm("", "Clear") + _sm("", "Reapply") + _sm("", "Advanced") + '</div></div>'),
        _g("Data Tools", '<div class="rr">' + _bb("&#9707;", "Text to<br>Columns") + '<div class="rc">' + _sm("", "Flash Fill")
           + _sm("", "Remove Duplicates") + _sm("", "Data Validation") + '</div></div>'),
        _g("Forecast", '<div class="rr">' + _bb("?", "What-If<br>Analysis&#9662;") + _bb("&#128200;", "Forecast<br>Sheet") + '</div>'),
        _g("Outline", _bb("&#9707;", "Outline&#9662;")),
    ])


def rib_slicer(hl=None, caption="Region", **k):
    return "".join([
        _g("Slicer", '<div class="rc"><div class="sm">Slicer Caption:</div>'
           f'<div class="inp">{caption}</div><div class="rr">' + _sm("&#9776;", "Report Connections", "rb-reportconn", hl)
           + _sm("&#9881;", "Slicer Settings") + '</div></div>'),
        _g("Slicer Styles", '<div class="gal"><b class="hd sel"></b><b class="hd"></b><b class="hd"></b><b class="hd"></b><b></b></div>'),
        _g("Arrange", '<div class="rr">' + _bb("&#9650;", "Bring<br>Forward&#9662;") + _bb("&#9660;", "Send<br>Backward&#9662;")
           + _bb("&#9776;", "Selection<br>Pane") + '</div>'),
        _g("Buttons", '<div class="rc"><div class="sm">Columns: <span class="inp" style="min-width:40px">1</span></div>'
           '<div class="sm">Height: <span class="inp" style="min-width:60px">0.26&quot;</span></div></div>'),
        _g("Size", '<div class="rc"><div class="sm">&#8597; <span class="inp" style="min-width:60px">2.62&quot;</span></div>'
           '<div class="sm">&#8596; <span class="inp" style="min-width:60px">1.8&quot;</span></div></div>'),
    ])


RIBBONS = {"Home": rib_home, "Insert": rib_insert, "Table Design": rib_table_design,
           "PivotTable Analyze": rib_pivot, "Chart Design": rib_chart, "View": rib_view,
           "Data": rib_data, "Slicer": rib_slicer}


def ribbon(tab, hl=None, **k):
    return f'<div class="ribbon">{RIBBONS.get(tab, rib_home)(hl=hl, **k)}</div>'


def formula_bar(namebox, text, editing=False):
    caret = '<span class="caret"></span>' if editing else ''
    return (f'<div class="fbar"><div class="nbox" data-id="fb-namebox"><span>{esc(namebox)}</span><span class="cv">&#9662;</span></div>'
            f'<div class="fmid{" ed" if editing else ""}"><span>&#8942;</span><span class="x">&#10005;</span>'
            '<span class="ok">&#10003;</span><span style="color:#555"><i>fx</i></span></div>'
            f'<div class="ftext" data-id="fb-text">{esc(text)}{caret}</div><div class="fchev">&#9662;</div></div>')


def sheet_tabs(names, active):
    t = "".join(f'<div class="st{" on" if s == active else ""}" data-id="sheet-{s}">{s}</div>' for s in names)
    return ('<div class="stabs"><div class="navarr"><span>&#9664;</span><span>&#9654;</span></div>'
            f'{t}<div class="plus">&#43;</div><div class="plus">&#8942;</div><div class="hscroll"><i></i></div></div>')


def status_bar(mode="Ready", info="", zoom=100):
    zx = int(52 + (zoom - 100) * 0.35)
    return (f'<div class="sbar"><span>{mode}</span><span>&#9855; Accessibility: Good to go</span>'
            f'<div class="r"><span>{info}</span><div class="vbtn"><b>&#9636;</b><span>&#9638;</span><span>&#9707;</span></div>'
            f'<span>&#8722;</span><div class="zoom"><i style="left:{zx}px"></i></div><span>&#43;</span>'
            f'<span>{zoom}%</span></div></div>')


# =================================================================== number formats
def fmt(v, nf):
    if v is None:
        return ""
    if isinstance(v, (_dt.datetime, _dt.date)):
        if "mmm" in (nf or ""):
            return v.strftime("%d-%b-%Y")
        return v.strftime("%d-%m-%Y")
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        nf = nf or "General"
        if nf == "#,##0.00":
            return f"{v:,.2f}"
        if nf == "#,##0":
            return f"{v:,.0f}"
        if nf == "0.0%":
            return f"{v * 100:.1f}%"
        if nf == "0.00":
            return f"{v:.2f}"
        if float(v).is_integer():
            return str(int(v))
        return f"{v:.10g}"
    return str(v)


def _rgb(c):
    try:
        if c is not None and c.type == "rgb" and c.rgb and isinstance(c.rgb, str):
            return "#" + c.rgb[-6:]
    except Exception:
        pass
    return None


def col_letter(n):
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def parse_ref(ref):
    i = 0
    while ref[i].isalpha():
        i += 1
    col = 0
    for ch in ref[:i]:
        col = col * 26 + ord(ch.upper()) - 64
    return int(ref[i:]), col


def parse_range(rng):
    a, b = rng.split(":") if ":" in rng else (rng, rng)
    r1, c1 = parse_ref(a)
    r2, c2 = parse_ref(b)
    return min(r1, r2), min(c1, c2), max(r1, r2), max(c1, c2)


# =================================================================== cell sources
class XlsxSource:
    """Reads layout/styles/formulas from the real workbook; values from a recalculated copy."""

    def __init__(self, ws_style, ws_vals):
        self.s, self.v = ws_style, ws_vals
        self.merges = [(m.min_row, m.min_col, m.max_row, m.max_col) for m in ws_style.merged_cells.ranges]
        self.overrides = {}

    def col_px(self, c):
        d = self.s.column_dimensions.get(col_letter(c))
        w = d.width if (d is not None and d.width) else 8.43
        return int(round(w * 7 + 5))

    def row_px(self, r):
        d = self.s.row_dimensions.get(r)
        h = d.height if (d is not None and d.height) else 15
        return int(round(h * 4 / 3))

    def formula(self, r, c):
        v = self.s.cell(row=r, column=c).value
        if (r, c) in self.overrides:
            return self.overrides[(r, c)].get("formula", "")
        return "" if v is None else (fmt(v, self.s.cell(row=r, column=c).number_format) if not isinstance(v, str) else v)

    def info(self, r, c):
        cs = self.s.cell(row=r, column=c)
        val = self.v.cell(row=r, column=c).value
        if (r, c) in self.overrides and "value" in self.overrides[(r, c)]:
            val = self.overrides[(r, c)]["value"]
        f = cs.font
        a = cs.alignment
        fill = _rgb(cs.fill.fgColor) if (cs.fill is not None and cs.fill.fill_type == "solid") else None
        b = cs.border
        brd = {}
        for side in ("left", "right", "top", "bottom"):
            sd = getattr(b, side)
            if sd is not None and sd.style:
                brd[side] = _rgb(sd.color) or "#000000"
        is_num = isinstance(val, (int, float, _dt.date, _dt.datetime)) and not isinstance(val, bool)
        return dict(text=fmt(val, cs.number_format), num=is_num, fill=fill,
                    bold=bool(f.b), italic=bool(f.i), size=float(f.sz or 11),
                    color=_rgb(f.color) or "#000000",
                    h=a.horizontal, v=a.vertical, wrap=bool(a.wrap_text), indent=int(a.indent or 0),
                    border=brd)


class DictSource:
    """Hand-built sheet (used for the new PivotTable sheet)."""

    def __init__(self, cells, colw=None, rowh=None, merges=None):
        self.cells, self.colw, self.rowh = cells, colw or {}, rowh or {}
        self.merges = merges or []
        self.formulas = {}

    def col_px(self, c):
        return int(round(self.colw.get(c, 8.43) * 7 + 5))

    def row_px(self, r):
        return int(round(self.rowh.get(r, 15) * 4 / 3))

    def formula(self, r, c):
        if (r, c) in self.formulas:
            return self.formulas[(r, c)]
        d = self.cells.get((r, c))
        return d.get("text", "") if d else ""

    def info(self, r, c):
        d = dict(text="", num=False, fill=None, bold=False, italic=False, size=11.0, color="#000000",
                 h=None, v=None, wrap=False, indent=0, border={})
        d.update(self.cells.get((r, c), {}))
        return d


# =================================================================== sheet view
class SheetView:
    def __init__(self, src, zoom=1.0, width=W, top_row=1, frozen_rows=0, max_cols=40, max_rows=200):
        self.src, self.z, self.width = src, zoom, width
        self.top_row, self.frozen = top_row, frozen_rows
        self.hdr_h = round(20 * zoom)
        self.rh_w = round(30 * zoom)
        self.cols = []
        x = self.rh_w
        for c in range(1, max_cols + 1):
            w = round(src.col_px(c) * zoom)
            self.cols.append((c, x, w))
            x += w
            if x > width:
                break
        rows = list(range(1, frozen_rows + 1)) + list(range(max(top_row, frozen_rows + 1), max_rows + 1))
        self.rows = []
        y = self.hdr_h
        for r in rows:
            h = round(src.row_px(r) * zoom)
            self.rows.append((r, y, h))
            y += h
            if y > GRID_H:
                break
        self.colx = {c: (x, w) for c, x, w in self.cols}
        self.rowy = {r: (y, h) for r, y, h in self.rows}
        self.merge_at = {}
        self.merged = set()
        for (r1, c1, r2, c2) in src.merges:
            self.merge_at[(r1, c1)] = (r2, c2)
            for r in range(r1, r2 + 1):
                for c in range(c1, c2 + 1):
                    if (r, c) != (r1, c1):
                        self.merged.add((r, c))

    # rect in GRID coordinates
    def _rect(self, r1, c1, r2, c2):
        xs = [self.colx[c] for c in range(c1, c2 + 1) if c in self.colx]
        ys = [self.rowy[r] for r in range(r1, r2 + 1) if r in self.rowy]
        if not xs or not ys:
            return None
        x0 = xs[0][0]
        y0 = ys[0][0]
        return x0, y0, xs[-1][0] + xs[-1][1] - x0, ys[-1][0] + ys[-1][1] - y0

    def rect(self, ref):
        """Page-coordinate rect (x, y, w, h) of a cell (merge-aware) or range."""
        r1, c1, r2, c2 = parse_range(ref)
        if r1 == r2 and c1 == c2 and (r1, c1) in self.merge_at:
            r2, c2 = self.merge_at[(r1, c1)]
        rc = self._rect(r1, c1, r2, c2)
        if rc is None:
            return None
        x, y, w, h = rc
        return x, y + GRID_Y, w, h

    def center(self, ref):
        x, y, w, h = self.rect(ref)
        return int(x + w / 2), int(y + h / 2)

    def html(self, *, gridlines=True, table=None, sel=None, rng=None, ants=None,
             edit=None, blank=None, hls=(), freeze_line=False):
        z = self.z
        out = []
        blank = blank or set()
        tbl = None
        if table:
            tr1, tc1, tr2, tc2 = parse_range(table["ref"])
            tbl = (tr1, tc1, tr2, tc2)
        sel_rows, sel_cols = set(), set()
        if rng:
            a, b, c, d = parse_range(rng)
            sel_rows.update(range(a, c + 1))
            sel_cols.update(range(b, d + 1))
        if sel:
            a, b = parse_ref(sel)
            sel_rows.add(a)
            sel_cols.add(b)
        out.append(f'<div class="corner" style="width:{self.rh_w}px;height:{self.hdr_h}px"></div>')
        fs = 12 * z
        for c, x, w in self.cols:
            s = " s" if c in sel_cols else ""
            out.append(f'<div class="ch{s}" style="left:{x}px;top:0;width:{w}px;height:{self.hdr_h}px;font-size:{fs:.1f}px">{col_letter(c)}</div>')
        for r, y, h in self.rows:
            s = " s" if r in sel_rows else ""
            out.append(f'<div class="rh{s}" style="left:0;top:{y}px;width:{self.rh_w}px;height:{h}px;font-size:{fs:.1f}px">{r}</div>')

        grid_col = "#DADCE0"
        for r, y, h in self.rows:
            for c, x, w in self.cols:
                if (r, c) in self.merged:
                    continue
                cw, chh = w, h
                if (r, c) in self.merge_at:
                    r2, c2 = self.merge_at[(r, c)]
                    rc = self._rect(r, c, r2, c2)
                    if rc:
                        _, _, cw, chh = rc
                inf = self.src.info(r, c)
                if (r, c) in blank:
                    inf["text"] = ""
                fill = inf["fill"]
                in_tbl = tbl and tbl[0] <= r <= tbl[2] and tbl[1] <= c <= tbl[3]
                if in_tbl and table.get("banded") and r > tbl[0] and not fill and (r - tbl[0]) % 2 == 1:
                    fill = BAND
                style = [f"left:{x}px", f"top:{y}px"]
                brd = inf["border"]
                if brd:
                    style += [f"width:{cw + 1}px", f"height:{chh + 1}px"]
                    for side in ("left", "right", "top", "bottom"):
                        if side in brd:
                            style.append(f"border-{side}:1px solid {brd[side]}")
                else:
                    style += [f"width:{cw}px", f"height:{chh}px"]
                    if gridlines and not fill:
                        style.append(f"border-right:1px solid {grid_col};border-bottom:1px solid {grid_col}")
                if fill:
                    style.append(f"background:{fill}")
                text = inf["text"]
                cls = "c"
                if text:
                    hal = inf["h"] or ("right" if inf["num"] else "left")
                    jus = {"left": "flex-start", "right": "flex-end", "center": "center",
                           "centerContinuous": "center", "general": "flex-start"}.get(hal, "flex-start")
                    val = inf["v"] or "bottom"
                    ali = {"top": "flex-start", "center": "center", "bottom": "flex-end"}.get(val, "flex-end")
                    pad = 3 * z + inf["indent"] * 9 * z
                    style.append(f"justify-content:{jus};align-items:{ali};padding:{2*z:.1f}px {3*z:.1f}px {2*z:.1f}px {pad:.1f}px")
                    style.append(f"font-size:{inf['size'] * 4 / 3 * z:.2f}px;color:{inf['color']}")
                    if inf["bold"]:
                        style.append("font-weight:700")
                    if inf["italic"]:
                        style.append("font-style:italic")
                    if inf["wrap"]:
                        style.append("white-space:normal;text-align:" + ("center" if hal == "center" else "left"))
                    elif hal in ("left", None, "general") and (r, c) not in self.merge_at and not inf["num"]:
                        cls += " ov"
                inner = esc(text)
                if inf.get("arrow") or (in_tbl and table.get("arrows") and r == tbl[0]):
                    inner += '<span class="farr">&#9662;</span>'
                    style.append(f"padding-right:{24*z:.0f}px")
                out.append(f'<div class="{cls}" style="{";".join(style)}">{inner}</div>')

        if freeze_line and self.frozen:
            fy = self.rowy[self.frozen][0] + self.rowy[self.frozen][1]
            out.append(f'<div class="fz" style="left:0;top:{fy}px;width:{self.width}px;height:1px"></div>')
        if rng:
            rc = self._rect(*parse_range(rng)) or None
            if rc:
                x, y, w, h = rc
                out.append(f'<div class="rng" style="left:{x-1}px;top:{y-1}px;width:{w+2}px;height:{h+2}px"></div>')
        if ants:
            rc = self._rect(*parse_range(ants))
            if rc:
                x, y, w, h = rc
                out.append(f'<div class="ants" style="left:{x-1}px;top:{y-1}px;width:{w+2}px;height:{h+2}px"></div>')
        if sel:
            r, c = parse_ref(sel)
            rr = self.merge_at.get((r, c), (r, c))
            rc = self._rect(r, c, rr[0], rr[1])
            if rc:
                x, y, w, h = rc
                if edit:
                    inf = self.src.info(r, c)
                    out.append(f'<div class="c edit" style="left:{x}px;top:{y}px;min-width:{w}px;height:{h}px;'
                               f'align-items:flex-end;padding:{2*z:.1f}px {3*z:.1f}px;font-size:{inf["size"]*4/3*z:.2f}px;'
                               f'color:{inf["color"]};font-weight:{700 if inf["bold"] else 400};'
                               f'overflow:visible">{esc(edit)}<span class="caret"></span></div>')
                else:
                    if rng:
                        out.append(f'<div class="c" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:transparent;'
                                   f'box-shadow:inset 0 0 0 {w}px rgba(255,255,255,.0);z-index:19"></div>')
                    out.append(f'<div class="acell" style="left:{x-1}px;top:{y-1}px;width:{w+2}px;height:{h+2}px"><i></i></div>')
        for ref in hls:
            rc = self._rect(*parse_range(ref))
            if rc:
                x, y, w, h = rc
                out.append(f'<div class="hl" style="left:{x-2}px;top:{y-2}px;width:{w+4}px;height:{h+4}px"></div>')
        return f'<div class="grid" style="width:{self.width}px">' + "".join(out) + '</div>'


# =================================================================== floating objects
def obj_handles(w, h):
    pts = [(0, 0), (w / 2, 0), (w, 0), (0, h / 2), (w, h / 2), (0, h), (w / 2, h), (w, h)]
    return "".join(f'<div class="hdl" style="left:{x-5:.0f}px;top:{y-5:.0f}px"></div>' for x, y in pts)


def column_chart(x, y, w, h, cats, vals, title, selected=False, labels=True, field="Region", did="chart1"):
    vmax = max(vals) if vals else 1
    step = 50000
    top = step * (int(vmax / step) + 1)
    pl, pt, pr, pb = 92, 74, 26, 64
    pw, ph = w - pl - pr, h - pt - pb
    g = []
    n = 4 if top >= 200000 else 2
    nt = int(top / step)
    every = max(1, nt // 9 + (1 if nt > 9 else 0))
    for i in range(0, nt + 1, every):
        v = i * step
        yy = pt + ph - ph * v / top
        g.append(f'<div style="position:absolute;left:{pl}px;top:{yy:.1f}px;width:{pw}px;height:1px;background:#d9d9d9"></div>')
        g.append(f'<div style="position:absolute;left:0;top:{yy-9:.1f}px;width:{pl-8}px;text-align:right;font-size:12px;color:#595959">{v}</div>')
    slot = pw / max(1, len(cats))
    bw = slot * 0.40
    for i, (cname, v) in enumerate(zip(cats, vals)):
        bh = ph * v / top
        bx = pl + slot * i + (slot - bw) / 2
        by = pt + ph - bh
        g.append(f'<div style="position:absolute;left:{bx:.1f}px;top:{by:.1f}px;width:{bw:.1f}px;height:{bh:.1f}px;background:#4F81BD"></div>')
        if labels:
            g.append(f'<div style="position:absolute;left:{bx-20:.1f}px;top:{by-20:.1f}px;width:{bw+40:.1f}px;text-align:center;font-size:13px;color:#404040">{v}</div>')
        g.append(f'<div style="position:absolute;left:{pl+slot*i:.1f}px;top:{pt+ph+6}px;width:{slot:.1f}px;text-align:center;font-size:13px;color:#595959">{cname}</div>')
    g.append(f'<div style="position:absolute;left:{pl}px;top:{pt+ph}px;width:{pw}px;height:1px;background:#bfbfbf"></div>')
    g.append(f'<div style="position:absolute;left:0;right:0;top:30px;text-align:center;font-size:18px;color:#404040">{title}</div>')
    g.append('<div class="fbtn" style="left:8px;top:6px">Sum of Sales Amount</div>')
    g.append(f'<div class="fbtn" style="left:8px;bottom:6px">{field} &#9662;</div>')
    if selected:
        g.append(obj_handles(w, h))
    return (f'<div class="obj chart{" sel" if selected else ""}" data-id="{did}" '
            f'style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">{"".join(g)}</div>')


def pie_chart(x, y, w, h, cats, vals, title, selected=False, did="chart2"):
    import math
    cols = ["#4F81BD", "#C0504D", "#9BBB59", "#8064A2"]
    tot = sum(vals) or 1
    cx, cy, rad = w * 0.38, h * 0.56, min(w, h) * 0.31
    a0 = -math.pi / 2
    paths, labels = [], []
    for i, v in enumerate(vals):
        a1 = a0 + 2 * math.pi * v / tot
        large = 1 if (a1 - a0) > math.pi else 0
        x0, y0 = cx + rad * math.cos(a0), cy + rad * math.sin(a0)
        x1, y1 = cx + rad * math.cos(a1), cy + rad * math.sin(a1)
        if v >= tot:
            paths.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{rad:.1f}" fill="{cols[i%4]}" stroke="#fff" stroke-width="2"/>')
        elif v > 0:
            paths.append(f'<path d="M{cx:.1f},{cy:.1f} L{x0:.1f},{y0:.1f} A{rad:.1f},{rad:.1f} 0 {large} 1 {x1:.1f},{y1:.1f} Z" '
                         f'fill="{cols[i%4]}" stroke="#fff" stroke-width="2"/>')
        am = (a0 + a1) / 2
        if v > 0:
            lx, ly = cx + rad * 0.62 * math.cos(am), cy + rad * 0.62 * math.sin(am)
            labels.append(f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="middle" font-size="14" fill="#fff" font-weight="700">{v*100/tot:.1f}%</text>')
        a0 = a1
    leg = "".join(f'<div style="display:flex;align-items:center;gap:6px;margin:6px 0;font-size:13px;color:#404040">'
                  f'<i style="width:11px;height:11px;background:{cols[i%4]};display:inline-block"></i>{c}</div>'
                  for i, c in enumerate(cats))
    svg = (f'<svg width="{w}" height="{h}" style="position:absolute;left:0;top:0">'
           + "".join(paths) + "".join(labels) + '</svg>')
    body = (svg + f'<div style="position:absolute;left:0;right:0;top:30px;text-align:center;font-size:18px;color:#404040">{title}</div>'
            f'<div style="position:absolute;left:{w*0.74:.0f}px;top:{h*0.42:.0f}px">{leg}</div>'
            '<div class="fbtn" style="left:8px;top:6px">Sum of Sales Amount</div>'
            '<div class="fbtn" style="left:8px;bottom:6px">Product &#9662;</div>')
    if selected:
        body += obj_handles(w, h)
    return (f'<div class="obj chart{" sel" if selected else ""}" data-id="{did}" '
            f'style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">{body}</div>')


def slicer(x, y, w, title, items, selected=None, did="slicer", sel_obj=False):
    """items: list of (name, has_data)."""
    rows = []
    for name, has in items:
        if selected is None:
            cls = "on"
        elif name in selected:
            cls = "on"
        else:
            cls = "" if has else "off"
        rows.append(f'<div class="si {cls}" data-id="{did}-{name}">{name}</div>')
    h = 44 + len(items) * 41 + 10
    extra = obj_handles(w, h) if sel_obj else ""
    clear_col = "#c42b1c" if selected else "#bbb"
    return (f'<div class="obj slicer" data-id="{did}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">'
            f'<div class="sh">{title}<span><span>&#8801;&#10003;</span>'
            f'<span data-id="{did}-clear" style="color:{clear_col}">&#9660;&#10005;</span></span></div>'
            + "".join(rows) + extra + '</div>')


def dialog(title, body, x, y, w, ok="OK", cancel="Cancel", hl_ok=False):
    okc = "btn pri" + (" rhl" if hl_ok else "")
    btns = f'<div class="{okc}" data-id="dlg-ok">{ok}</div>' + (f'<div class="btn" data-id="dlg-cancel">{cancel}</div>' if cancel else "")
    return ('<div class="dim"></div>'
            f'<div class="dlg" style="left:{x}px;top:{y}px;width:{w}px">'
            f'<div class="dt"><b>{title}</b><span>?&nbsp;&nbsp;&#10005;</span></div>'
            f'<div class="db">{body}</div><div class="dbtns">{btns}</div></div>')


def pivot_pane(checked, filters=(), rows=(), values=(), hl=None, title="PivotTable Fields"):
    fields = ["Date", "Invoice No", "Region", "Salesperson", "Product", "Qty",
              "Unit Price", "Sales Amount", "Payment Status"]
    fl = "".join(f'<div data-id="pf-{f}"><span class="cb{" on" if f in checked else ""}">{"&#10003;" if f in checked else ""}</span>{f}</div>'
                 for f in fields)

    def area(name, items, did):
        c = " rhl" if hl == did else ""
        chips = "".join(f'<div class="chip">{i}<span>&#9662;</span></div>' for i in items)
        return f'<div class="area{c}" data-id="{did}"><div class="an">{name}</div>{chips}</div>'

    return (f'<div class="pane"><div class="pt">{title}<span>&#9881;&nbsp;&#9662;&nbsp;&#10005;</span></div>'
            '<div class="ps">Choose fields to add to report:</div><div class="srch">Search</div>'
            f'<div class="fl">{fl}</div><div class="ah">Drag fields between areas below:</div>'
            '<div class="areas">' + area("&#9660; Filters", filters, "pa-filters") + area("&#8214; Columns", [], "pa-cols")
            + area("&#8801; Rows", rows, "pa-rows") + area("&Sigma; Values", values, "pa-values") + '</div></div>')


# =================================================================== page
def page(*, view_html, sheet_names, sheet, tab="Home", context=None, rib=None, rib_hl=None, rib_kw=None,
         namebox="A1", formula="", editing=False, mode="Ready", status_info="", zoom=100,
         overlay="", caption="", badge=""):
    rib_kw = rib_kw or {}
    return ('<!doctype html><html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>'
            + title_bar(badge)
            + tab_strip(tab, context)
            + ribbon(rib or tab, rib_hl, **rib_kw)
            + formula_bar(namebox, formula, editing)
            + view_html
            + sheet_tabs(sheet_names, sheet)
            + status_bar(mode, status_info, zoom)
            + overlay
            + (f'<div class="cap"><div class="box">{caption}</div></div>' if caption else '')
            + '</body></html>')
