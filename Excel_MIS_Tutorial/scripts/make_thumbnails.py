#!/usr/bin/env python3
"""
YouTube thumbnails (1280x720 JPG) for the Sales MIS Report video.

The screenshots inside the thumbnails are rendered by the same code as the
video (scripts/build_video.py), so they show the real workbook numbers.
Three designs are produced for YouTube's "Test & compare":
  A  RAW DATA -> DASHBOARD transformation
  B  KPI dashboard hero with the Total Sales value circled
  C  Interactive Pivot + Slicer, with a click on "West"
Fonts: Anton and Montserrat (SIL Open Font License, assets/fonts/).
All on-screen text is English.

Usage: python3 scripts/make_thumbnails.py
"""
import os, subprocess, sys

os.environ["MIS_MODE"] = "novoice"          # watermark without "AI voice"
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_video as bv                     # noqa: E402  (frames + workbook-driven views)
from PIL import Image                        # noqa: E402

ROOT = os.path.dirname(HERE)
FONTS = f"{ROOT}/assets/fonts"
OUTDIR = f"{ROOT}/output/thumbnails"
WORK = f"{bv.SCR}/thumb"
os.makedirs(OUTDIR, exist_ok=True)
os.makedirs(WORK, exist_ok=True)


def frame_png(frame, name):
    """Render a full 1920x1080 app frame with no caption and no scene badge."""
    p = bv.render_png(frame.html("", ""))
    im = Image.open(p).convert("RGB").crop((0, 0, 1920, 1080))
    out = f"{WORK}/{name}.png"
    im.save(out)
    return out


def crop(src, box, name):
    out = f"{WORK}/{name}.png"
    Image.open(src).crop(box).save(out)
    return out


# ---------------------------------------------------------------- source shots
dash = frame_png(bv.dash("K3"), "src_dash")
raw = frame_png(bv.raw("A3"), "src_raw")
west = frame_png(bv.pv("p2", sel="A5", objs=bv.charts(west=False) + bv.slicers(), pane=False), "src_charts")

DASH_FULL = crop(dash, (60, 236, 1400, 900), "c_dash_full")       # title .. footnote
DASH_KPI = crop(dash, (60, 250, 1380, 640), "c_dash_kpi")         # title + KPI cards + pending
RAW_TBL = crop(raw, (0, 210, 1120, 640), "c_raw")                  # headers + first rows
CHARTS = crop(west, (0, 210, 1900, 930), "c_charts")               # pivots + charts + slicers
CURSOR, _ = bv.make_cursor_assets()

CSS = f"""
@font-face{{font-family:Anton;src:url('file://{FONTS}/anton-latin-400-normal.woff2')}}
@font-face{{font-family:Mont;font-weight:800;src:url('file://{FONTS}/montserrat-latin-800-normal.woff2')}}
@font-face{{font-family:Mont;font-weight:900;src:url('file://{FONTS}/montserrat-latin-900-normal.woff2')}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1280px;height:720px;overflow:hidden}}
body{{position:relative;background:#0a1a33;font-family:Mont,sans-serif}}
.abs{{position:absolute}}
.big{{font-family:Anton;line-height:.92;letter-spacing:1px;text-transform:uppercase}}
.y{{color:#FFD60A}} .w{{color:#fff}}
.sh{{text-shadow:0 6px 0 rgba(0,0,0,.55),0 0 30px rgba(0,0,0,.6)}}
.pill{{display:inline-block;font-weight:900;color:#fff;border-radius:14px;padding:8px 22px}}
.shot{{border:6px solid #fff;border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.6);background:#fff;overflow:hidden}}
.shot img{{display:block;width:100%}}
.chip{{font-weight:900;color:#fff;font-size:30px;padding:6px 16px;border-radius:10px;box-shadow:0 6px 14px rgba(0,0,0,.45)}}
"""


def page(body, bg):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head>'
            f'<body style="background:{bg}">{body}</body></html>')


GRID_BG = ("radial-gradient(circle at 75% 40%,#1d4d8f 0%,#0e2a55 45%,#071428 100%)")

# ---------------------------------------------------------------- A: transformation
A = page(f"""
<div class="abs" style="left:46px;top:40px">
  <div class="big w sh" style="font-size:118px">Sales</div>
  <div class="big y sh" style="font-size:150px">MIS Report</div>
  <div class="pill sh" style="background:#107C41;font-size:58px;margin-top:14px">IN EXCEL</div>
  <div class="w sh" style="font-weight:900;font-size:34px;margin-top:34px;line-height:1.25">COMPLETE<br>STEP-BY-STEP</div>
</div>
<div class="abs" style="left:46px;bottom:40px;display:flex;gap:12px">
  <span class="chip" style="background:#C0392B">SUMIFS</span>
  <span class="chip" style="background:#1F6FB2">PIVOT</span>
  <span class="chip" style="background:#7D3C98">SLICER</span>
</div>
<div class="abs shot" style="left:735px;top:34px;width:430px;transform:rotate(4deg)"><img src="file://{RAW_TBL}"></div>
<span class="abs chip" style="left:760px;top:24px;background:#C0392B;transform:rotate(4deg)">RAW DATA</span>
<svg class="abs" style="left:625px;top:150px" width="260" height="210" viewBox="0 0 260 210">
  <path d="M215 40 C 120 40, 95 105, 120 178" fill="none" stroke="#FFD60A" stroke-width="17" stroke-linecap="round"/>
  <path d="M88 150 L 121 186 L 152 146" fill="none" stroke="#FFD60A" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<div class="abs shot" style="left:600px;top:330px;width:640px;transform:rotate(-3deg)"><img src="file://{DASH_FULL}"></div>
<span class="abs chip" style="left:1010px;top:322px;background:#107C41;transform:rotate(-3deg)">DASHBOARD</span>
""", GRID_BG)

# ---------------------------------------------------------------- B: KPI hero
# Left half of the dashboard, enlarged; ring around the Total Sales value.
# Value centre in the source frame: (242, 470). Crop origin (60, 250), 700 px wide -> 900 px.
DASH_LEFT = crop(dash, (60, 250, 760, 640), "c_dash_left")
_bx, _by, _bw = 470, 150, 900
_k = _bw / 700
_vx, _vy = _bx + (242 - 60) * _k, _by + (470 - 250) * _k
B = page(f"""
<div class="abs shot" style="left:{_bx - 6}px;top:{_by - 6}px;width:{_bw + 12}px"><img src="file://{DASH_LEFT}"></div>
<div class="abs" style="left:0;top:0;width:560px;height:720px;
     background:linear-gradient(90deg,#071428 62%,rgba(7,20,40,0))"></div>
<div class="abs" style="left:48px;top:48px">
  <div class="pill" style="background:#E8373A;font-size:34px">STEP BY STEP</div>
  <div class="big y sh" style="font-size:160px;margin-top:22px">MIS</div>
  <div class="big w sh" style="font-size:112px">Dashboard</div>
  <div class="big w sh" style="font-size:74px;margin-top:12px">in <span style="color:#3ddc84">Excel</span></div>
</div>
<svg class="abs" style="left:{_vx - 190:.0f}px;top:{_vy - 78:.0f}px" width="380" height="156" viewBox="0 0 380 156">
  <ellipse cx="190" cy="78" rx="180" ry="66" fill="none" stroke="#FFD60A" stroke-width="11"/>
</svg>
<div class="abs" style="left:48px;bottom:44px;display:flex;gap:12px">
  <span class="chip" style="background:#1F6FB2">KPIs</span>
  <span class="chip" style="background:#107C41">REGION</span>
  <span class="chip" style="background:#7D3C98">PRODUCT</span>
</div>
""", GRID_BG)

# ---------------------------------------------------------------- C: pivot + slicer
# Charts + slicers only (bigger, more readable). "West" slicer item centre in the
# source frame: (1465, 821). Crop origin (700, 236), 1200 px wide -> 860 px.
CH_ONLY = crop(west, (700, 236, 1900, 920), "c_charts_only")
_cx, _cy, _cw = 400, 40, 860
_q = _cw / 1200
_wx, _wy = _cx + (1465 - 700) * _q, _cy + (821 - 236) * _q
C = page(f"""
<div class="abs shot" style="left:{_cx - 6}px;top:{_cy - 6}px;width:{_cw + 12}px"><img src="file://{CH_ONLY}"></div>
<div class="abs" style="left:0;top:0;width:520px;height:720px;
     background:linear-gradient(90deg,#071428 62%,rgba(7,20,40,0))"></div>
<div class="abs" style="left:46px;top:56px">
  <div class="big w sh" style="font-size:112px">Excel</div>
  <div class="big y sh" style="font-size:134px">Pivot +</div>
  <div class="big y sh" style="font-size:134px">Slicer</div>
  <div class="pill sh" style="background:#107C41;font-size:42px;margin-top:16px">MIS REPORT</div>
</div>
<div class="abs" style="left:46px;bottom:42px">
  <span class="chip" style="background:#E8373A">1 CLICK FILTER</span>
</div>
<div class="abs" style="left:{_wx - 108:.0f}px;top:{_wy - 26:.0f}px;width:216px;height:52px;border:7px solid #FFD60A;border-radius:12px"></div>
<svg class="abs" style="left:{_wx + 20:.0f}px;top:{_wy - 2:.0f}px" width="120" height="150" viewBox="0 0 44 60">
  <path d="M2 2 L2 44 L12 35 L19 51 L27 48 L20 32 L34 32 Z" fill="#fff" stroke="#000" stroke-width="2.6" stroke-linejoin="round"/>
</svg>
<svg class="abs" style="left:{_wx - 10:.0f}px;top:{_wy - 50:.0f}px" width="60" height="60" viewBox="0 0 60 60">
  <g stroke="#FFD60A" stroke-width="6" stroke-linecap="round"><path d="M30 4 L30 18"/><path d="M8 14 L18 24"/><path d="M52 14 L42 24"/></g>
</svg>
""", GRID_BG)


def render(name, html):
    hp = f"{WORK}/{name}.html"
    open(hp, "w").write(html)
    png = f"{WORK}/{name}_t.png"
    # render taller than 720: headless Chromium under-paints the bottom of the viewport
    subprocess.run([bv.CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=1", "--window-size=1280,820", "--virtual-time-budget=1500",
                    f"--screenshot={png}", f"file://{hp}"], capture_output=True, check=True)
    out = f"{OUTDIR}/{name}.jpg"
    Image.open(png).convert("RGB").crop((0, 0, 1280, 720)).save(out, quality=92, optimize=True)
    print(f"{out}  {os.path.getsize(out) // 1024} KB")


if __name__ == "__main__":
    render("thumbnail_A_raw_to_dashboard", A)
    render("thumbnail_B_kpi_dashboard", B)
    render("thumbnail_C_pivot_slicer", C)
