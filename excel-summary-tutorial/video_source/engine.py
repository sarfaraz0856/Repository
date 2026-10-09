# Excel-style spreadsheet renderer + state machine for the tutorial video.
import re, copy, math
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
FD = "/usr/share/fonts/truetype/"
def F(name, size): return ImageFont.truetype(FD + name, size)
CAR = "crosextra/Carlito-Regular.ttf"; CARB = "crosextra/Carlito-Bold.ttf"
MONO = "dejavu/DejaVuSansMono.ttf"; MONOB = "dejavu/DejaVuSansMono-Bold.ttf"
SANS = "dejavu/DejaVuSans.ttf"; SANSB = "dejavu/DejaVuSans-Bold.ttf"
f_cell, f_cellb = F(CAR, 21), F(CARB, 21)
f_hdr = F(CAR, 17); f_ui = F(CAR, 17); f_uib = F(CARB, 17); f_small = F(CAR, 14)
f_title = F(CARB, 28); f_fbar = F(CAR, 21); f_tab = F(CAR, 18); f_tabb = F(CARB, 18)

GREEN = (33, 115, 70); GRID = (218, 220, 224); HDRBG = (243, 243, 243)
TOP_COLHDR = 204; COLHDR_H = 28; ROW_H = 34; ROW0 = TOP_COLHDR + COLHDR_H; RH_W = 56
TABS_Y = 1006; STATUS_Y = 1044

WIDTHS = {"Old Data": [150, 190, 150, 110, 110, 120],
          "Summary": [200, 150, 140, 150, 150, 40, 190, 140, 150, 150]}
NCOLS = 16

def col_w(sheet, c):
    w = WIDTHS.get(sheet, [])
    return w[c - 1] if c - 1 < len(w) else 110
def col_x(sheet, c):
    x = RH_W
    for i in range(1, c): x += col_w(sheet, i)
    return x
def row_y(r): return ROW0 + (r - 1) * ROW_H
def L(c): return chr(64 + c)
def parse(a):
    m = re.fullmatch(r"\$?([A-Z])\$?(\d+)", a); return int(m.group(2)), ord(m.group(1)) - 64
def rng(s):
    if ":" in s:
        a, b = s.split(":"); (r1, c1), (r2, c2) = parse(a), parse(b)
    else: r1, c1 = r2, c2 = parse(s)
    return min(r1, r2), min(c1, c2), max(r1, r2), max(c1, c2)
def cell_rect(sheet, r1, c1, r2=None, c2=None):
    r2 = r2 or r1; c2 = c2 or c1
    return col_x(sheet, c1), row_y(r1), col_x(sheet, c2 + 1), row_y(r2 + 1)

# ---------------- formula evaluation (real calculation, not pasted numbers) -------------
def split_args(s):
    out, depth, cur, q = [], 0, "", False
    for ch in s:
        if ch == "'": q = not q
        if ch == "," and depth == 0 and not q: out.append(cur); cur = ""; continue
        if ch == "(": depth += 1
        if ch == ")": depth -= 1
        cur += ch
    out.append(cur); return out

def evaluate(st, sheet, f):
    m = re.fullmatch(r"=([A-Z]+)\((.*)\)", f)
    fn, args = m.group(1), split_args(m.group(2))
    def colvals(a):
        mm = re.fullmatch(r"'(.+)'!\$([A-Z]):\$([A-Z])", a)
        sh, c = mm.group(1), ord(mm.group(2)) - 64
        cells = st["sheets"][sh]
        rows = sorted({r for (r, cc) in cells if cc == c})
        return {r: value(st, sh, r, c) for r in rows}
    def scal(a):
        r, c = parse(a); return value(st, sheet, r, c)
    if fn == "SUM":
        r1, c1, r2, c2 = rng(args[0]); t = 0
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                v = value(st, sheet, r, c)
                if isinstance(v, (int, float)): t += v
        return t
    if fn == "SUMIFS":
        sumr = colvals(args[0]); conds = [(colvals(args[i]), scal(args[i + 1])) for i in range(1, len(args), 2)]
    elif fn == "SUMIF":
        conds = [(colvals(args[0]), scal(args[1]))]; sumr = colvals(args[2])
    t = 0
    for r, v in sumr.items():
        if not isinstance(v, (int, float)): continue
        if all(isinstance(cr.get(r), str) and isinstance(cv, str) and cr.get(r).lower() == cv.lower() for cr, cv in conds):
            t += v
    return t

def value(st, sheet, r, c):
    cell = st["sheets"][sheet].get((r, c))
    if not cell: return None
    if cell.get("f"): return evaluate(st, sheet, cell["f"])
    return cell.get("v")

def shift_formula(f, dr):
    def rep(m):
        if m.group(0).startswith("'"): return m.group(0)
        col, dollar, row = m.group(1), m.group(2), int(m.group(3))
        return f"{col}{dollar}{row if dollar else row + dr}"
    return re.sub(r"'[^']*'|(\$?[A-Z])(\$?)(\d+)", lambda m: m.group(0) if m.group(1) is None else rep(m), f)

# ---------------- state ----------------
def initial_state():
    od = {}
    hdr = ["Date", "Employee Name", "Stock Item", "In Qty", "Out Qty", "Amount"]
    data = [("01-Oct-2026","Rahul Sharma","Tea Bags",100,20,5000),("01-Oct-2026","Priya Das","Green Tea",80,10,6400),
            ("02-Oct-2026","Rahul Sharma","Tea Bags",50,15,2500),("02-Oct-2026","Aman Khan","Coffee",60,12,7200),
            ("03-Oct-2026","Priya Das","Green Tea",40,5,3200),("03-Oct-2026","Rahul Sharma","Coffee",30,8,3600),
            ("04-Oct-2026","Aman Khan","Tea Bags",70,20,3500),("04-Oct-2026","Priya Das","Green Tea",25,6,2000),
            ("05-Oct-2026","Rahul Sharma","Tea Bags",40,10,2000),("05-Oct-2026","Aman Khan","Coffee",20,5,2400)]
    for c, h in enumerate(hdr, 1): od[(1, c)] = {"v": h, "b": True}
    for r, row in enumerate(data, 2):
        for c, v in enumerate(row, 1): od[(r, c)] = {"v": v}
    return {"sheets": {"Old Data": od}, "order": ["Old Data"], "active": "Old Data",
            "sel": {"Old Data": (1, 1, 1, 1)}, "edit": None, "tabedit": None, "hl": {}, "call": {},
            "banner": None, "title": None, "zoom": (960, 540, 1.0), "cur": (1100, 700), "ring": None,
            "drag": None, "dialog": None, "ants": None, "table": False, "fmt": 0, "check": None}

# ---------------- ops ----------------
def ease(p): return p * p * (3 - 2 * p)

def target_xy(st, t):
    sh = st["active"]
    if isinstance(t, tuple) and isinstance(t[0], (int, float)): return t
    if isinstance(t, tuple) and t[0] == "tab": return tab_center(st, t[1])
    if t == "plus": return plus_pos(st)
    if t == "fbar": return (560, 180)
    if isinstance(t, tuple) and t[0] == "corner":
        r1, c1, r2, c2 = rng(t[1]); x0, y0, x1, y1 = cell_rect(sh, r1, c1, r2, c2); return (x1, y1)
    r1, c1, r2, c2 = rng(t); x0, y0, x1, y1 = cell_rect(sh, r1, c1, r2, c2)
    return ((x0 + x1) / 2, (y0 + y1) / 2)

def zoom_center(st, t):
    if t == "fbar": return (620, 200)
    return target_xy(st, t)

def tab_layout(st):
    x = 90; out = []
    for name in st["order"]:
        txt = name
        if st["tabedit"] and st["tabedit"][0] == name: txt = st["tabedit"][1] or " "
        w = int(f_tabb.getlength(txt)) + 44; out.append((name, x, w, txt)); x += w
    return out, x
def tab_center(st, name):
    for n, x, w, _ in tab_layout(st)[0]:
        if n == name: return (x + w / 2, TABS_Y + 19)
def plus_pos(st): return (tab_layout(st)[1] + 26, TABS_Y + 19)

def commit(st, sheet, r, c, text):
    cells = st["sheets"][sheet]
    if text == "": cells.pop((r, c), None); return
    old = cells.get((r, c), {})
    new = {k: v for k, v in old.items() if k not in ("v", "f")}
    if text.startswith("="): new["f"] = text
    elif re.fullmatch(r"\d+", text): new["v"] = int(text)
    else: new["v"] = text
    cells[(r, c)] = new

def apply(st, op, p):
    k, a = op[2], op[3]
    sh = st["active"]
    if k == "move":
        x0, y0 = st["cur"]; x1, y1 = target_xy(st, a["to"]); e = ease(p)
        st["cur"] = (x0 + (x1 - x0) * e, y0 + (y1 - y0) * e)
        if a.get("dragsel") and p > 0:
            r1, c1, _, _ = st["sel"][sh]
            # extend selection to the cell under the cursor
            cx, cy = st["cur"]; c = 1
            while c < NCOLS and col_x(sh, c + 1) <= cx: c += 1
            r = max(1, int((cy - ROW0) // ROW_H) + 1)
            st["sel"][sh] = (r1, c1, max(r1, r), max(c1, c))
    elif k == "click":
        if p < 1: st["ring"] = (st["cur"][0], st["cur"][1], p)
        if a.get("cell"): r, c = parse(a["cell"]); st["sel"][sh] = (r, c, r, c)
    elif k == "sel": st["sel"][sh] = rng(a["r"])
    elif k == "type":
        r, c = st["sel"][sh][:2]; text = a["text"]; n = int(round(len(text) * p))
        if p < 1 or a.get("hold"): st["edit"] = (r, c, text[:n])
        else:
            st["edit"] = None; commit(st, sh, r, c, text)
            if a.get("next") == "right": st["sel"][sh] = (r, c + 1, r, c + 1)
            elif a.get("next") == "stay": pass
            elif a.get("next") == "home": st["sel"][sh] = (r + 1, a["home"], r + 1, a["home"])
            else: st["sel"][sh] = (r + 1, c, r + 1, c)
    elif k == "enter":
        if st["edit"]:
            r, c, text = st["edit"]; st["edit"] = None; commit(st, sh, r, c, text); st["sel"][sh] = (r + 1, c, r + 1, c)
    elif k == "sheet":
        st["active"] = a["name"]; st["sel"].setdefault(a["name"], (1, 1, 1, 1))
    elif k == "newsheet":
        st["sheets"][a["name"]] = {}; st["order"].append(a["name"]); st["active"] = a["name"]
        st["sel"][a["name"]] = (1, 1, 1, 1)
    elif k == "rename":
        text = a["new"]; n = int(round(len(text) * p))
        if p < 1: st["tabedit"] = (a["old"], text[:n])
        else:
            st["tabedit"] = None; old = a["old"]
            st["sheets"][text] = st["sheets"].pop(old); st["sel"][text] = st["sel"].pop(old)
            st["order"] = [text if x == old else x for x in st["order"]]
            if st["active"] == old: st["active"] = text
    elif k == "style":
        r1, c1, r2, c2 = rng(a["r"])
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                if (r, c) in st["sheets"][sh]: st["sheets"][sh][(r, c)].update(a["s"])
    elif k == "fill":
        r1, c1, r2, c2 = rng(a["src"]); to = a["to"]
        cur_row = r2 + (to - r2) * ease(p)
        x0, y0, x1, y1 = cell_rect(sh, r1, c1, r2, c2)
        st["cur"] = (x1, row_y(1) + cur_row * ROW_H)
        if p < 1: st["drag"] = (sh, r1, c1, max(r2, int(round(cur_row))), c2)
        else:
            st["drag"] = None
            for r in range(r2 + 1, to + 1):
                for c in range(c1, c2 + 1):
                    src = st["sheets"][sh][(r1, c)]
                    st["sheets"][sh][(r, c)] = {"f": shift_formula(src["f"], r - r1)}
            st["sel"][sh] = (r1, c1, to, c2)
    elif k == "clear":
        r1, c1, r2, c2 = rng(a["r"])
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1): st["sheets"][sh].pop((r, c), None)
    elif k == "hl":
        r1, c1, r2, c2 = rng(a["r"]); st["hl"][a["id"]] = (a.get("sheet", sh), r1, c1, r2, c2, a["color"], min(1, p * 2))
    elif k == "unhl":
        for i in (a["ids"] if a["ids"] != "all" else list(st["hl"])): st["hl"].pop(i, None)
    elif k == "call":
        d = dict(a); d["alpha"] = p; st["call"][a["id"]] = d
    elif k == "uncall":
        for i in (a["ids"] if a["ids"] != "all" else list(st["call"])):
            if i in st["call"]:
                if p < 1: st["call"][i]["alpha"] = 1 - p
                else: st["call"].pop(i)
    elif k == "banner": st["banner"] = a["text"]
    elif k == "title":
        st["title"] = (a["lines"], p if a.get("fadein", True) else 1, a.get("sub"))
    elif k == "untitle":
        if st["title"]:
            if p < 1: st["title"] = (st["title"][0], 1 - p, st["title"][2])
            else: st["title"] = None
    elif k == "zoom":
        cx0, cy0, s0 = st["zoom"]
        if a["s"] == 1: cx1, cy1 = 960, 540
        else: cx1, cy1 = zoom_center(st, a["to"])
        e = ease(p); st["zoom"] = (cx0 + (cx1 - cx0) * e, cy0 + (cy1 - cy0) * e, s0 + (a["s"] - s0) * e)
    elif k == "dialog": st["dialog"] = a["name"]
    elif k == "ants": st["ants"] = a["r"]
    elif k == "set": st[a["key"]] = a["val"]
    elif k == "check": st["check"] = (a["items"], a["n"]) if a["items"] else None

def state_at(ops, T):
    st = initial_state()
    for op in ops:
        if op[0] > T: break
        p = 1.0 if op[1] <= 0 else min(1.0, (T - op[0]) / op[1])
        apply(st, op, p)
    return st

# ---------------- drawing ----------------
def fmt_val(st, sheet, r, c, v, cell):
    if isinstance(v, (int, float)):
        if (sheet == "Summary" and st["fmt"] >= 2 and cell.get("f")) or (sheet == "Old Data" and c == 6 and st["fmt"] >= 2):
            return f"{int(v):,}"
        return str(int(v))
    return "" if v is None else str(v)

def draw_ribbon(d):
    d.rectangle([0, 0, W, 36], fill=GREEN)
    d.text((W / 2, 18), "Raw_Data_to_Summary.xlsx  -  Excel", font=f_uib, fill="white", anchor="mm")
    for i, (x, sym) in enumerate([(20, "⟲"), (50, "⟳")]): pass
    d.rectangle([0, 36, W, 68], fill=(245, 245, 245))
    x = 20
    for t in ["File", "Home", "Insert", "Page Layout", "Formulas", "Data", "Review", "View", "Help"]:
        w = f_ui.getlength(t)
        d.text((x, 52), t, font=f_uib if t == "Home" else f_ui, fill=GREEN if t == "Home" else (60, 60, 60), anchor="lm")
        if t == "Home": d.rectangle([x, 64, x + w, 67], fill=GREEN)
        x += w + 34
    d.rectangle([0, 68, W, 158], fill=(250, 250, 250)); d.line([0, 158, W, 158], fill=(210, 210, 210))
    groups = [("Clipboard", ["Paste"]), ("Font", ["Calibri", "11", "B", "I", "U"]), ("Alignment", ["Left", "Center", "Wrap"]),
              ("Number", ["General", "%", ","]), ("Styles", ["Conditional", "Format as Table", "Cell Styles"]),
              ("Cells", ["Insert", "Delete", "Format"]), ("Editing", ["AutoSum Σ", "Sort & Filter"])]
    x = 14
    for g, items in groups:
        x0 = x
        for it in items:
            w = max(34, f_small.getlength(it) + 18)
            d.rounded_rectangle([x, 80, x + w, 122], radius=4, outline=(215, 215, 215), fill="white")
            d.text((x + w / 2, 101), it, font=f_small if len(it) > 1 else f_uib, fill=(50, 50, 50), anchor="mm")
            x += w + 6
        d.text(((x0 + x) / 2, 142), g, font=f_small, fill=(110, 110, 110), anchor="mm")
        x += 14; d.line([x - 8, 78, x - 8, 150], fill=(220, 220, 220))

def draw_screen(st):
    img = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(img)
    draw_ribbon(d)
    sh = st["active"]; cells = st["sheets"][sh]; sel = st["sel"][sh]
    ar, ac = sel[0], sel[1]
    # formula bar
    d.rectangle([0, 158, W, 202], fill=(250, 250, 250))
    d.rectangle([8, 166, 128, 196], outline=(190, 190, 190), fill="white")
    d.text((16, 181), f"{L(ac)}{ar}", font=f_fbar, fill="black", anchor="lm")
    d.text((150, 181), "✕   ✓   fx", font=F(SANS, 16), fill=(110, 110, 110), anchor="lm")
    d.rectangle([236, 166, W - 8, 196], outline=(190, 190, 190), fill="white")
    if st["edit"]: ftxt = st["edit"][2]
    else:
        cell = cells.get((ar, ac), {})
        ftxt = cell.get("f") or ("" if cell.get("v") is None else str(cell.get("v")))
    d.text((246, 181), ftxt, font=f_fbar, fill="black", anchor="lm")
    if st["edit"]:
        cx = 246 + f_fbar.getlength(ftxt) + 1; d.line([cx, 170, cx, 192], fill="black", width=2)
    # headers
    d.rectangle([0, TOP_COLHDR, W, ROW0], fill=HDRBG)
    d.rectangle([0, ROW0, RH_W, TABS_Y], fill=HDRBG)
    sr1, sc1, sr2, sc2 = sel
    for c in range(1, NCOLS + 1):
        x0 = col_x(sh, c); x1 = x0 + col_w(sh, c)
        if x0 > W: break
        if sc1 <= c <= sc2:
            d.rectangle([x0, TOP_COLHDR, x1, ROW0], fill=(210, 210, 210)); d.line([x0, ROW0 - 2, x1, ROW0 - 2], fill=GREEN, width=3)
        d.text(((x0 + x1) / 2, TOP_COLHDR + 14), L(c), font=f_hdr, fill=(70, 70, 70), anchor="mm")
        d.line([x1, TOP_COLHDR, x1, TABS_Y], fill=GRID)
    nrows = (TABS_Y - ROW0) // ROW_H + 1
    for r in range(1, nrows + 1):
        y0 = row_y(r); y1 = y0 + ROW_H
        if sr1 <= r <= sr2:
            d.rectangle([0, y0, RH_W, y1], fill=(210, 210, 210)); d.line([RH_W - 2, y0, RH_W - 2, y1], fill=GREEN, width=3)
        d.text((RH_W / 2, y0 + ROW_H / 2), str(r), font=f_hdr, fill=(70, 70, 70), anchor="mm")
        d.line([0, y1, W, y1], fill=GRID)
    d.line([RH_W, TOP_COLHDR, RH_W, TABS_Y], fill=(190, 190, 190)); d.line([0, ROW0, W, ROW0], fill=(190, 190, 190))
    # cell backgrounds / formatting
    def fill_rect(r1, c1, r2, c2, color):
        x0, y0, x1, y1 = cell_rect(sh, r1, c1, r2, c2); d.rectangle([x0 + 1, y0 + 1, x1 - 1, y1 - 1], fill=color)
    def border(r1, c1, r2, c2, color=(150, 150, 150)):
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                x0, y0, x1, y1 = cell_rect(sh, r, c); d.rectangle([x0, y0, x1, y1], outline=color)
    hdr_white = set()
    if sh == "Old Data":
        last = max(r for (r, c) in cells) if cells else 1
        if st["table"]:
            fill_rect(1, 1, 1, 6, (68, 114, 196)); hdr_white = {(1, c) for c in range(1, 7)}
            for r in range(2, 12):
                if r % 2 == 0: fill_rect(r, 1, r, 6, (217, 225, 242))
        else:
            fill_rect(1, 1, 1, 6, (221, 235, 247)); border(1, 1, 11, 6, (170, 170, 170))
    if sh == "Summary":
        f = st["fmt"]
        tables = [(2, 1, 8, 5), (2, 7, 6, 10)]
        for (r1, c1, r2, c2) in tables:
            if f >= 1 and (r1, c1) in cells:
                fill_rect(r1, c1, r1, c2, (31, 78, 120)); hdr_white |= {(r1, c) for c in range(c1, c2 + 1)}
            if f >= 4 and (r2, c1) in cells: fill_rect(r2, c1, r2, c2, (221, 235, 247))
            if f >= 3 and (r1, c1) in cells: border(r1, c1, r2, c2)
    # highlights (under text)
    for hid, (hs, r1, c1, r2, c2, color, al) in st["hl"].items():
        if hs != sh: continue
        x0, y0, x1, y1 = cell_rect(sh, r1, c1, r2, c2)
        ov = Image.new("RGBA", (x1 - x0, y1 - y0), color + (int(70 * al),))
        img.paste(ov, (int(x0), int(y0)), ov)
    d = ImageDraw.Draw(img)
    # text
    edit = st["edit"]
    for (r, c), cell in sorted(cells.items()):
        if edit and (r, c) == (edit[0], edit[1]): continue
        if row_y(r) > TABS_Y - ROW_H: continue
        v = value(st, sh, r, c); txt = fmt_val(st, sh, r, c, v, cell)
        if txt == "": continue
        bold = cell.get("b") or (sh == "Summary" and ((st["fmt"] >= 1 and r == 2) or (st["fmt"] >= 4 and ((r == 8 and c <= 5) or (r == 6 and c >= 7)))))
        fnt = F(CARB, cell["size"]) if cell.get("size") else (f_cellb if bold else f_cell)
        color = (255, 255, 255) if (r, c) in hdr_white else tuple(cell.get("color", (0, 0, 0)))
        x0, y0, x1, y1 = cell_rect(sh, r, c); ym = (y0 + y1) / 2
        if isinstance(v, (int, float)): d.text((x1 - 8, ym), txt, font=fnt, fill=color, anchor="rm")
        elif (r, c) in hdr_white: d.text(((x0 + x1) / 2, ym), txt, font=fnt, fill=color, anchor="mm")
        else: d.text((x0 + 7, ym), txt, font=fnt, fill=color, anchor="lm")
        if sh == "Old Data" and st["table"] and r == 1:
            d.rectangle([x1 - 24, y0 + 6, x1 - 4, y1 - 6], fill="white", outline=(150, 150, 150))
            d.polygon([(x1 - 19, ym - 2), (x1 - 9, ym - 2), (x1 - 14, ym + 4)], fill=(80, 80, 80))
    # highlight borders
    for hid, (hs, r1, c1, r2, c2, color, al) in st["hl"].items():
        if hs != sh: continue
        x0, y0, x1, y1 = cell_rect(sh, r1, c1, r2, c2); d.rectangle([x0, y0, x1, y1], outline=color, width=3)
    # selection
    x0, y0, x1, y1 = cell_rect(sh, sr1, sc1, sr2, sc2)
    if (sr1, sc1) != (sr2, sc2):
        ov = Image.new("RGBA", (int(x1 - x0), int(y1 - y0)), (0, 0, 0, 22)); img.paste(ov, (int(x0), int(y0)), ov)
        ax0, ay0, ax1, ay1 = cell_rect(sh, ar, ac); d.rectangle([ax0 + 2, ay0 + 2, ax1 - 2, ay1 - 2], fill="white")
        v = value(st, sh, ar, ac); cell = cells.get((ar, ac), {})
        if v is not None:
            t = fmt_val(st, sh, ar, ac, v, cell)
            d.text((ax1 - 8, (ay0 + ay1) / 2), t, font=f_cell, fill="black", anchor="rm") if isinstance(v, (int, float)) else d.text((ax0 + 7, (ay0 + ay1) / 2), t, font=f_cell, fill="black", anchor="lm")
    d.rectangle([x0 - 1, y0 - 1, x1 + 1, y1 + 1], outline=GREEN, width=3)
    d.rectangle([x1 - 4, y1 - 4, x1 + 4, y1 + 4], fill=GREEN, outline="white")
    # in-cell editing
    if edit:
        er, ec, t = edit; ex0, ey0, ex1, ey1 = cell_rect(sh, er, ec)
        tw = f_cell.getlength(t) + 18; ex1 = max(ex1, ex0 + tw)
        d.rectangle([ex0, ey0, ex1, ey1], fill="white", outline=GREEN, width=3)
        d.text((ex0 + 7, (ey0 + ey1) / 2), t, font=f_cell, fill="black", anchor="lm")
        cx = ex0 + 7 + f_cell.getlength(t) + 1; d.line([cx, ey0 + 6, cx, ey1 - 6], fill="black", width=2)
    # fill-handle drag preview / marching ants
    for spec, col in ((st["drag"], (90, 90, 90)), (("ants",) if st["ants"] else None, GREEN)):
        if not spec: continue
        if spec[0] == "ants": r1, c1, r2, c2 = rng(st["ants"])
        else: _, r1, c1, r2, c2 = spec
        x0, y0, x1, y1 = cell_rect(sh, r1, c1, r2, c2)
        for (a, b) in [((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))]:
            n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1])) // 8)
            for i in range(0, n, 2):
                p0 = (a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n)
                p1 = (a[0] + (b[0] - a[0]) * (i + 1) / n, a[1] + (b[1] - a[1]) * (i + 1) / n)
                d.line([p0, p1], fill=col, width=3)
    # sheet tabs
    d.rectangle([0, TABS_Y, W, STATUS_Y], fill=(240, 240, 240)); d.line([0, TABS_Y, W, TABS_Y], fill=(200, 200, 200))
    d.text((24, TABS_Y + 19), "◀  ▶", font=F(SANS, 14), fill=(150, 150, 150), anchor="lm")
    tabs, endx = tab_layout(st)
    for name, x, w, txt in tabs:
        act = name == st["active"]
        d.rectangle([x, TABS_Y, x + w, STATUS_Y - 2], fill="white" if act else (240, 240, 240), outline=(200, 200, 200))
        if act: d.line([x + 4, STATUS_Y - 4, x + w - 4, STATUS_Y - 4], fill=GREEN, width=3)
        if st["tabedit"] and st["tabedit"][0] == name:
            tw = f_tabb.getlength(txt); d.rectangle([x + 18, TABS_Y + 7, x + 24 + tw, STATUS_Y - 9], fill=(200, 220, 240))
        d.text((x + 22, TABS_Y + 19), txt, font=f_tabb if act else f_tab, fill=GREEN if act else (60, 60, 60), anchor="lm")
    px, py = plus_pos(st)
    d.ellipse([px - 13, py - 13, px + 13, py + 13], outline=(120, 120, 120), width=2)
    d.text((px, py - 1), "+", font=f_uib, fill=(80, 80, 80), anchor="mm")
    # status bar
    d.rectangle([0, STATUS_Y, W, H], fill=(243, 243, 243))
    d.text((16, STATUS_Y + 18), "Edit" if edit else "Ready", font=f_ui, fill=(80, 80, 80), anchor="lm")
    if (sr1, sc1) != (sr2, sc2):
        vals = [value(st, sh, r, c) for r in range(sr1, sr2 + 1) for c in range(sc1, sc2 + 1)]
        nums = [v for v in vals if isinstance(v, (int, float))]
        if nums:
            s = f"Average: {sum(nums)/len(nums):,.0f}     Count: {len([v for v in vals if v is not None])}     Sum: {sum(nums):,}"
            d.text((W - 300, STATUS_Y + 18), s, font=f_ui, fill=(60, 60, 60), anchor="rm")
    d.text((W - 30, STATUS_Y + 18), "100%", font=f_ui, fill=(80, 80, 80), anchor="rm")
    # dialog
    if st["dialog"] == "table":
        bx, by = 760, 330
        d.rectangle([bx + 6, by + 6, bx + 466, by + 236], fill=(170, 170, 170))
        d.rectangle([bx, by, bx + 460, by + 230], fill="white", outline=(120, 120, 120))
        d.text((bx + 20, by + 26), "Create Table", font=f_uib, fill="black", anchor="lm")
        d.text((bx + 20, by + 70), "Where is the data for your table?", font=f_ui, fill="black", anchor="lm")
        d.rectangle([bx + 20, by + 88, bx + 440, by + 118], outline=(150, 150, 150))
        d.text((bx + 30, by + 103), "=$A$1:$F$11", font=f_ui, fill="black", anchor="lm")
        d.rectangle([bx + 20, by + 136, bx + 38, by + 154], outline=(80, 80, 80), fill=GREEN)
        d.text((bx + 29, by + 145), "✓", font=F(SANSB, 16), fill="white", anchor="mm")
        d.text((bx + 48, by + 145), "My table has headers", font=f_ui, fill="black", anchor="lm")
        for i, t in enumerate(["OK", "Cancel"]):
            x = bx + 250 + i * 100
            d.rectangle([x, by + 182, x + 88, by + 212], outline=GREEN if t == "OK" else (150, 150, 150), width=2)
            d.text((x + 44, by + 197), t, font=f_ui, fill="black", anchor="mm")
    return img

def ok_button(): return (760 + 250 + 44, 330 + 197)

def draw_cursor(img, st):
    d = ImageDraw.Draw(img, "RGBA"); x, y = st["cur"]
    d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=(255, 214, 0, 70))
    if st["ring"]:
        rx, ry, p = st["ring"]; rr = 12 + 34 * p; a = int(220 * (1 - p))
        d.ellipse([rx - rr, ry - rr, rx + rr, ry + rr], outline=(230, 60, 40, a), width=4)
    pts = [(0, 0), (0, 26), (6, 20), (11, 31), (15, 29), (10, 19), (18, 19)]
    d.polygon([(x + a, y + b) for a, b in pts], fill="white", outline="black")

# ---------------- overlays (not zoomed) ----------------
f_call = F(SANSB, 30); f_callr = F(SANS, 27); f_callm = F(MONOB, 24); f_sub = F(SANSB, 34)
f_big = F(SANSB, 76); f_med = F(SANSB, 40); f_banner = F(SANSB, 24)

def blend(img, box, color, alpha, radius=16):
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.rounded_rectangle(box, radius=radius, fill=color + (int(alpha),)); img.alpha_composite(ov)

def draw_overlays(img, st, sub):
    img = img.convert("RGBA")
    for cid, c in st["call"].items():
        al = c["alpha"]; lines = c["lines"]; style = c.get("style", "note")
        fnt = f_callm if style == "formula" else f_call
        tw = max(fnt.getlength(l) for l in lines) + 60; th = len(lines) * 46 + 34
        x, y = c.get("pos", (W - tw - 40, 230))
        if x == "c": x = (W - tw) / 2
        bg = {"note": (255, 255, 255), "formula": (30, 30, 30), "result": (33, 115, 70), "warn": (192, 57, 43), "info": (31, 78, 120)}[style]
        fg = (255, 255, 255) if style != "note" else (25, 25, 25)
        blend(img, [x + 6, y + 8, x + tw + 6, y + th + 8], (0, 0, 0), 60 * al)
        blend(img, [x, y, x + tw, y + th], bg, 245 * al)
        if style == "note": blend(img, [x, y, x + 10, y + th], (33, 115, 70), 255 * al, radius=4)
        d = ImageDraw.Draw(img)
        for i, l in enumerate(lines):
            d.text((x + 30, y + 17 + i * 46 + 23), l, font=fnt, fill=fg + (int(255 * al),), anchor="lm")
    if st["check"]:
        items, n = st["check"]; x, y = 1000, 470; tw, th = 880, 80 + len(items) * 58
        blend(img, [x, y, x + tw, y + th], (255, 255, 255), 245); blend(img, [x, y, x + tw, y + 58], (31, 78, 120), 255)
        d = ImageDraw.Draw(img); d.text((x + 24, y + 29), "FINAL CHECKLIST", font=f_call, fill="white", anchor="lm")
        for i, it in enumerate(items):
            yy = y + 92 + i * 58; done = i < n
            d.rounded_rectangle([x + 24, yy - 18, x + 60, yy + 18], radius=6, outline=(33, 115, 70), width=3, fill=(33, 115, 70) if done else None)
            if done: d.line([(x + 31, yy), (x + 40, yy + 9), (x + 54, yy - 10)], fill="white", width=4)
            d.text((x + 80, yy), it, font=F(SANS, 25), fill=(25, 25, 25) if done or i == n else (150, 150, 150), anchor="lm")
    if st["banner"]:
        d = ImageDraw.Draw(img); tw = f_banner.getlength(st["banner"]) + 40
        blend(img, [W - tw - 30, 76, W - 30, 120], (33, 115, 70), 240, radius=22)
        d = ImageDraw.Draw(img); d.text((W - 30 - tw / 2, 98), st["banner"], font=f_banner, fill="white", anchor="mm")
    if st["title"]:
        lines, al, subl = st["title"]
        ov = Image.new("RGBA", img.size); od = ImageDraw.Draw(ov)
        for yy in range(0, H, 6):
            t = yy / H; col = (int(12 + 10 * t), int(40 + 50 * t), int(70 - 20 * t))
            od.rectangle([0, yy, W, yy + 6], fill=col + (int(255 * al),))
        n = len(lines); y0 = H / 2 - (n * 100) / 2 + 30 - (40 if subl else 0)
        for i, l in enumerate(lines):
            fnt = f_big if i == 0 else f_med
            od.text((W / 2, y0 + i * 100), l, font=fnt, fill=(255, 255, 255, int(255 * al)) if i == 0 else (180, 230, 200, int(255 * al)), anchor="mm")
        if subl:
            od.text((W / 2, y0 + n * 100 + 30), subl, font=f_callr, fill=(220, 220, 220, int(255 * al)), anchor="mm")
        od.rectangle([W / 2 - 160, y0 + 52, W / 2 + 160, y0 + 58], fill=(33, 160, 90, int(255 * al)))
        img.alpha_composite(ov)
    if sub:
        d = ImageDraw.Draw(img); lines = sub.split("\n")
        tw = max(f_sub.getlength(l) for l in lines) + 50; th = len(lines) * 48 + 20
        x0 = (W - tw) / 2; y0 = 985 - th
        blend(img, [x0, y0, x0 + tw, y0 + th], (0, 0, 0), 175, radius=10)
        d = ImageDraw.Draw(img)
        for i, l in enumerate(lines): d.text((W / 2, y0 + 10 + i * 48 + 24), l, font=f_sub, fill=(255, 255, 255), anchor="mm")
    return img.convert("RGB")

def render_frame(st, sub, cache):
    key = repr({k: v for k, v in st.items() if k not in ("cur", "ring", "zoom", "call", "banner", "title", "check")})
    if cache.get("k") != key: cache["k"] = key; cache["base"] = draw_screen(st)
    img = cache["base"].copy(); draw_cursor(img, st)
    cx, cy, s = st["zoom"]
    if s > 1.001:
        w, h = W / s, H / s; x0 = min(max(cx - w / 2, 0), W - w); y0 = min(max(cy - h / 2, 0), H - h)
        img = img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + w, y0 + h))
    return draw_overlays(img, st, sub)
