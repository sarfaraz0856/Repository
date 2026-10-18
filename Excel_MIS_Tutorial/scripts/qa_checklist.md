# QA Checklist — Sales_MIS_Report.xlsx

Validation was run with two independent scripts:
- `scripts/validate_workbook.py` — structural checks + an independent Python recomputation of every KPI straight from the raw data (does not rely on any formula engine).
- LibreOffice headless recalculation — a cross-check copy (Sales Amount as plain `=F*G` references, because LibreOffice does not evaluate Excel's `[@…]` structured-reference syntax) was recalculated so the SUMIFS/COUNTIFS results could be compared to the Python numbers.

**Result: 19 / 19 checks PASSED.** Reproduce with `python3 scripts/validate_workbook.py`.

## Structural checks
| Check | Result |
|---|---|
| Worksheet names = Read_Me, Raw_Data, MIS_Dashboard, Pivot_Analysis | PASS |
| Required columns present (Date, Invoice No, Region, Salesperson, Product, Qty, Unit Price, Sales Amount, Payment Status) | PASS |
| `SalesData` Excel Table exists | PASS |
| Row count within 150–200 (actual: 180) | PASS |
| All Invoice No non-blank | PASS |
| All Invoice No unique (0 duplicates) | PASS |
| All Qty numeric | PASS |
| All Unit Price numeric | PASS |
| All Date values are real dates | PASS |
| Unit prices match product map (Tea A 120 / Tea B 95 / Tea C 150) | PASS |
| All dates fall within October 2026 | PASS |

## KPI reconciliation (independently computed from raw data)
| KPI | Value | How verified |
|---|---|---|
| Monthly Total Sales | **14,28,190.00** | Σ October Sales Amount; LibreOffice SUMIFS = 1428190 ✔ |
| Monthly Total Orders | **180** | Count of valid unique invoices in October; = unique invoice count because 1 row = 1 invoice; LibreOffice COUNTIFS = 180 ✔ |
| Monthly Total Units Sold | **11,834** | Σ October Qty; LibreOffice SUMIFS = 11834 ✔ |
| Average Sales per Order | **7,934.39** | 1428190 / 180, via IFERROR; LibreOffice = 7934.3889 ✔ |
| Pending Sales Amount | **3,72,985.00** | Σ October Sales Amount where Payment Status = Pending; LibreOffice SUMIFS = 372985 ✔ |

## Region-wise totals (October 2026)
| Region | Sales Amount |
|---|---|
| East | 3,51,030.00 |
| West | 3,83,675.00 |
| North | 3,55,130.00 |
| South | 3,38,355.00 |
| **Total** | **14,28,190.00** |
Region total reconciles to Monthly Total Sales ✔

## Product-wise totals (October 2026)
| Product | Sales Amount |
|---|---|
| Tea A | 3,85,320.00 |
| Tea B | 4,32,820.00 |
| Tea C | 6,10,050.00 |
| **Total** | **14,28,190.00** |
Product total reconciles to Monthly Total Sales ✔

## Independent reconciliation statements (all confirmed)
- Monthly Total Sales **equals** the sum of October Sales Amount. ✔
- Monthly Total Units Sold **equals** the sum of October Qty. ✔
- Monthly Total Orders **equals** the number of valid unique invoice numbers in October (180). ✔
- Pending Sales Amount **equals** the sum of October Sales Amount where Payment Status = Pending. ✔
- Region-wise and Product-wise totals **both reconcile** to Monthly Total Sales. ✔

## Features requiring manual testing in Microsoft Excel 365
The following cannot be verified in this Linux environment and **must be confirmed by opening the file in Excel 365**:
1. The `=[@Qty]*[@[Unit Price]]` structured-reference formula recalculates and auto-fills the Sales Amount column. (Valid Excel 365 syntax; LibreOffice cannot evaluate this specific syntax, which is why the cross-check used `=F*G`.)
2. All SUMIFS/COUNTIFS KPI cells display the values in the table above (Excel recalculates on open).
3. Native Pivot Tables (Region-wise, Product-wise) built per the `Pivot_Analysis` sheet steps — including Sum (not Count) on Sales Amount.
4. Native Charts (Clustered Column, Pie/Bar) from those pivots.
5. Native Slicers (Region, Product) and their Report Connections cross-filtering both pivots.
6. `Refresh All` (Ctrl+Alt+F5) updates pivots after a data change.

> Note: Pivot Tables and Slicers were **not fabricated** by the build script — openpyxl cannot create genuine native ones. The source table and exact manual steps are provided instead.

## Known environment limitation
Excel formula recalculation cannot be performed natively here (no Excel on Linux). The numbers above are proven by independent Python computation and by LibreOffice recalculation of an equivalent-reference copy. To confirm the **displayed** results in the delivered file, open `workbook/Sales_MIS_Report.xlsx` in Microsoft Excel 365.

## Animated tutorial video QA (`output/mis_tutorial_animated.mp4`)

Measured on the final file with ffprobe / ffmpeg `ebur128`:

| Check | Result |
|---|---|
| Video stream | H.264 High, 1920×1080, 30 fps, yuv420p |
| Audio stream | AAC-LC, 48 kHz, stereo |
| Duration | 754.8 s (12.58 min). Video and audio durations match to 6 ms |
| Integrated loudness | −14.8 LUFS (YouTube target −14 ±1) |
| True peak | −2.2 dBFS |
| Music bed under narration | about 23 dB below the voice (stems: voice −20.0 LUFS, ducked music −43.3 LUFS) |
| Title / end cards (music only) | −21.7 / −22.6 LUFS |
| Subtitles | 66 cues, monotonic and non-overlapping, timed from the real voice-clip lengths |
| Voice intelligibility | All 66 clips back-translated by Whisper from audio alone. See `scripts/voice_qa.md` |
| On-screen numbers | Sheets are rendered from the workbook. Pivot, chart and slicer figures are aggregated from the same rows (e.g. West = 142,320 + 87,305 + 154,050 = 383,675) |
| Cursor / clicks | Verified on extracted frames: halo and click ring land on the dialog OK button and on the slicer item at click time |

Scope: this video is an **animated recreation** of Excel 365 with an **AI voice**. The frames say so, and so does `output/README.txt`. It does not verify the native Excel features listed above under "Features requiring manual testing". Those still need a real Excel 365 session.
