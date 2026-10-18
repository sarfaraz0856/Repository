# Recording Guide — Sales MIS Report (Microsoft Excel 365 Desktop)

**Important:** This tutorial requires **real screen recordings of the Microsoft Excel 365 desktop app.**
This project was built in a headless Linux environment where **Excel and a screen-recording GUI are not available**, so the recordings themselves cannot be produced here. Record on a Windows or Mac machine with Excel 365 installed, following the exact steps below. Save every clip into `recordings/`.

## 0. Recording setup (do once)
- **Screen / canvas:** 1920×1080, 16:9. Set display scaling to 100% so text stays crisp.
- **Frame rate:** 30 fps. **Bitrate:** 12–20 Mbps for clean text.
- **Recorder:** OBS Studio (free) or the built-in Xbox Game Bar (`Win+G`) on Windows; QuickTime on Mac.
- **Excel view:** maximize the window; `View` tab → uncheck **Gridlines** and **Headings** only when showing the final dashboard (keep them on while demonstrating data).
- **Zoom level:** 120–130% inside Excel so formulas are readable on screen.
- **Mouse:** enable click-highlighting in the recorder if available.
- **Audio:** record a silent reference take; final narration is added per `voiceover_script.md`.
- Open `workbook/Sales_MIS_Report.xlsx` before you start.

For every step below: **click** = what to click, **type** = what to type, **appear** = what should show, **verify** = confirm before moving on.

---

### Clip 01 — Opening the workbook
- **click:** File Explorer → double-click `Sales_MIS_Report.xlsx`. If a Protected View bar appears, click **Enable Editing**.
- **appear:** Workbook opens; sheet tabs `Read_Me`, `Raw_Data`, `MIS_Dashboard`, `Pivot_Analysis` visible at the bottom.
- **verify:** No "repair" prompt; `Read_Me` shows the assumptions text.

### Clip 02 — Showing the raw data
- **click:** `Raw_Data` tab. Click cell `A2` (header), then press `Ctrl+Down`.
- **appear:** Cursor jumps to the last transaction (row 182 = 180 data rows).
- **verify:** 180 rows, 9 columns, no blank Invoice No cells. Press `Ctrl+Up` to return.

### Clip 03 — Converting data to an Excel Table
- (The delivered file already has the table.) To demonstrate on a fresh copy: **click** any data cell → **type** `Ctrl+T` → in the dialog ensure **My table has headers** is ticked → click **OK**.
- **click:** Table Design tab → **Table Name** box → **type** `SalesData` → `Enter`.
- **appear:** Banded table style; Table Name shows `SalesData`.
- **verify:** Table Design tab shows Table Name = `SalesData` (no spaces/typos).

### Clip 04 — Demonstrating the Sales Amount formula
- **click:** first `Sales Amount` cell (`H3`).
- **type:** `=[@Qty]*[@[Unit Price]]` then `Enter`.
- **appear:** Formula fills the entire column automatically (all 180 rows).
- **verify:** Row 3 shows `6600` (55 × 120). Formula bar shows the structured reference.

### Clip 05 — Creating the monthly KPI summary
- **click:** `MIS_Dashboard` tab → the Total Sales value cell.
- **type (Total Sales):** `=SUMIFS(SalesData[Sales Amount],SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))`
- **type (Total Orders):** `=COUNTIFS(SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1),SalesData[Invoice No],"<>")`
- **type (Total Units):** `=SUMIFS(SalesData[Qty],SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))`
- **type (Average):** `=IFERROR(<TotalSalesCell>/<TotalOrdersCell>,0)`
- **type (Pending):** `=SUMIFS(SalesData[Sales Amount],SalesData[Payment Status],"Pending",SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))`
- **appear / verify:** 14,28,190 · 180 · 11,834 · 7,934.39 · 3,72,985.

### Clip 06 — Demonstrating SUMIFS (Region-wise)
- **click:** first region value cell next to "East".
- **type:** `=SUMIFS(SalesData[Sales Amount],SalesData[Region],<region label cell>,SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))` → copy down for all four regions.
- **appear:** East 3,51,030 · West 3,83,675 · North 3,55,130 · South 3,38,355.
- **verify:** Sum of the four = 14,28,190 (matches Total Sales).

### Clip 07 — Creating a native Pivot Table
- **click:** any cell in `SalesData` → Insert → PivotTable → From Table/Range → **New Worksheet** → OK.
- **drag:** Region → Rows; Sales Amount → Values.
- **click:** the Values field → **Value Field Settings** → **Sum** → OK.
- **drag:** Date → Filters; set filter to October 2026.
- Repeat with **Product** in Rows for the second pivot.
- **verify:** Value shows **Sum of Sales Amount** (not Count); October total = 14,28,190.

### Clip 08 — Creating charts
- **click:** region pivot → PivotTable Analyze → **PivotChart** → **Clustered Column** → OK.
- **click:** product pivot → PivotChart → **Pie** (or Bar).
- **right-click** a series → **Add Data Labels**; rename chart titles to "Region-wise Sales Performance" / "Product-wise Sales Analysis".
- **verify:** Chart bars/slices reflect the pivot totals.

### Clip 09 — Adding slicers
- **click:** a pivot → PivotTable Analyze → **Insert Slicer** → tick **Region** and **Product** → OK.
- **appear:** Two slicer panels.
- **verify:** Slicers render with all four regions / three products.

### Clip 10 — Testing slicer filters
- **right-click** the Region slicer → **Report Connections** → tick both PivotTables → OK.
- **click:** "West" in the slicer.
- **appear:** Both pivots and both charts filter to West instantly.
- **verify:** Clearing the slicer (filter-clear icon) restores totals to 14,28,190.

### Clip 11 — Refreshing Pivot Tables
- **click:** PivotTable Analyze → **Refresh All** (`Ctrl+Alt+F5`).
- (Optional) add a demo row in Raw_Data, show KPIs auto-update, then `Ctrl+Z` to undo.
- **verify:** After refresh the pivot totals still reconcile to the dashboard.

### Clip 12 — Showing the final dashboard
- **click:** `MIS_Dashboard` → `View` tab → uncheck **Gridlines**.
- **appear:** Clean dashboard with title, KPI cards, region & product tables.
- **verify:** No `####` cells; numbers use thousands separators; totals unchanged.

---

## If you cannot access the Excel GUI
If recording on an Excel desktop machine is not possible for you right now:
1. The workbook (`workbook/Sales_MIS_Report.xlsx`) and all steps are ready — hand them to anyone with Excel 365 to record.
2. Alternatively record in Excel for the web (office.com) — Pivot Tables and slicers are more limited there; prefer the desktop app for the pivot/slicer clips.
3. Do **not** fabricate screenshots or simulate the Excel UI. Leave `recordings/` empty until real clips exist; the editing step depends on them.
