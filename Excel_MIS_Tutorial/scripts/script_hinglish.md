# Sales MIS Report in Excel 365 — Full Hinglish Video Script

- **Project:** Create a Professional MIS Report in Excel 365
- **Language:** Hinglish (Hindi explanation + English technical terms)
- **Format:** YouTube tutorial, 1920×1080, 30 fps, 16:9
- **Target duration:** 12–15 minutes
- **Workbook used on screen:** `workbook/Sales_MIS_Report.xlsx`
- **Sheets referenced:** `Read_Me`, `Raw_Data`, `MIS_Dashboard`, `Pivot_Analysis`
- **Table name:** `SalesData` (on `Raw_Data`)
- **Verified October 2026 numbers** (open in Excel 365 to confirm): Total Sales **14,28,190**, Total Orders **180**, Total Units **11,834**, Avg/Order **7,934.39**, Pending **3,72,985**.

> Narration note: numbers are read in the Indian style (lakh) in Hindi speech but the workbook cells show plain grouping. Read "14,28,190" as "chaudah lakh, atthais hazaar, ek sau nabbe".

---

## SCENE 1 — Introduction to MIS Reporting
**Duration:** ~0:50 | **Worksheet:** MIS_Dashboard (final result shown first as a teaser)

**Voiceover (exact):**
"Namaskaar doston, aur swagat hai aapka is channel par. Aaj hum banayenge ek complete, professional **Sales MIS Report** — bilkul usi tarah jaise companies mein MIS executives banate hain. MIS ka matlab hai **Management Information System** — yaani raw transaction data ko aise summarise karna ki management ek nazar mein decision le sake. Is video ke end tak aapke paas hoga ek live dashboard jisme Total Sales, Total Orders, region-wise aur product-wise analysis, Pivot Tables, charts aur interactive slicers — sab kuch hoga. Main aap ko sirf dikhaunga nahi, ek-ek formula samjhaunga bhi. Toh chaliye shuru karte hain."

**Excel actions:** Open `Sales_MIS_Report.xlsx`, land on `MIS_Dashboard` to flash the finished look, then move to `Read_Me`.
**Keyboard shortcuts:** `Ctrl+PageDown` / `Ctrl+PageUp` to switch sheets.
**On screen:** Finished dashboard title "SALES MIS REPORT", KPI cards, then the Read_Me assumptions.
**Editing:** Open on a 2–3 second slow zoom into the dashboard title, then cut to Read_Me.
**Validation:** Confirm the file opens without a Protected View / repair prompt before recording.

---

## SCENE 2 — Understanding Raw Data
**Duration:** ~1:00 | **Worksheet:** Raw_Data

**Voiceover (exact):**
"Sabse pehle data ko samajhte hain. Yeh `Raw_Data` sheet hai, aur isme hain October 2026 ki **180 sales transactions**. Har column ka ek clear matlab hai: **Date** — invoice ki tareekh; **Invoice No** — har bill ka unique number; **Region** — East, West, North ya South; **Salesperson**; **Product** — Tea A, Tea B ya Tea C; **Qty** — kitne units bike; **Unit Price** — ek unit ka daam; **Sales Amount** — total value; aur **Payment Status** — Paid ya Pending. Ek bahut important baat: is tutorial mein **ek row ka matlab ek unique invoice** hai. Har Invoice No bhara hua hai aur repeat nahi hota — yeh assumption humne `Read_Me` sheet mein likh rakhi hai, aur aage order count isi par based hoga."

**Excel actions:** Scroll through Raw_Data; click one header; point to columns in order.
**Keyboard shortcuts:** `Ctrl+Down` to jump to the last row (shows 180 rows), `Ctrl+Up` to return.
**On screen:** The column headers and a few sample rows; the Read_Me assumption line about one row = one invoice.
**Formula:** none in this scene.
**Editing:** Add a caption strip listing the 9 columns as the narrator names them.
**Validation:** `Ctrl+Down` should stop at the final data row (no blank gaps in the middle).

---

## SCENE 3 — Converting Raw Data into an Excel Table
**Duration:** ~1:15 | **Worksheet:** Raw_Data

**Voiceover (exact):**
"Ab hum is raw data ko ek **Excel Table** mein convert karenge. Table banane ka sabse bada fayda yeh hai ki formulas readable ban jaate hain aur data badhne par ranges automatically expand ho jaati hain. Kisi bhi data cell par click kijiye, phir dabaiye **Control plus T**. Excel apne aap range detect kar leta hai — dhyaan rakhiye ki **'My table has headers'** tick ho. OK dabate hi table ban gaya. Ab Table Design tab mein jaa kar, upar left mein table ka naam badal dijiye **SalesData**. Yeh naam hi aage har formula mein kaam aayega — isliye naam saaf aur meaningful hona chahiye."

**Excel actions:** Click inside data → `Ctrl+T` → confirm "My table has headers" → OK → Table Design tab → set Table Name to `SalesData`.
**Keyboard shortcuts:** `Ctrl+T` (create table). In the delivered file the table already exists and is named `SalesData` — if re-recording from scratch use this step; otherwise show the existing name on the Table Design tab.
**On screen:** The Create Table dialog, then the Table Name box showing `SalesData`.
**Editing:** Zoom into the Table Name box when it changes to `SalesData`.
**Validation:** Table Design tab must show Table Name = `SalesData` with no typo/space.

---

## SCENE 4 — Calculating Sales Amount
**Duration:** ~1:10 | **Worksheet:** Raw_Data
**Formula:** `=[@Qty]*[@[Unit Price]]`

**Voiceover (exact):**
"Ab Sales Amount nikaalte hain. Table ke andar formulas **structured references** use karte hain — column ke naam se, cell address se nahi. Sales Amount column ke pehle cell mein likhiye: **equals, bracket at Qty, close bracket, star, bracket at bracket Unit Price**. Poora formula banta hai `=[@Qty]*[@[Unit Price]]`. Yahan `@` ka matlab hai *isi row ka* value. Enter dabate hi ek khaas baat hoti hai — Excel yeh formula **poore column mein apne aap bhar deta hai**. Yani ek hi baar likho, saari 180 rows calculate ho gayi. Dhyaan dijiye: Unit Price ka column naam do shabdon ka hai, isliye uske around **double brackets** lagte hain."

**Excel actions:** Click first Sales Amount cell → type `=[@Qty]*[@[Unit Price]]` → Enter → show auto-fill down the column.
**Keyboard shortcuts:** After typing, `Enter`. Use `Ctrl+Down` to show the formula filled across all rows.
**On screen:** The formula in the formula bar, and the whole column filling in one shot.
**Editing:** Freeze-frame on the formula bar; add a caption "@ = this row".
**Validation:** Spot-check one row manually — e.g. Qty × Unit Price must equal the shown Sales Amount. (In the delivered data row 1 is 55 × 120 = 6,600.)

---

## SCENE 5 — Creating the Monthly KPI Summary
**Duration:** ~1:40 | **Worksheet:** MIS_Dashboard
**Formulas:**
- Total Sales: `=SUMIFS(SalesData[Sales Amount],SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))`
- Total Orders: `=COUNTIFS(SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1),SalesData[Invoice No],"<>")`
- Total Units: `=SUMIFS(SalesData[Qty],SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))`
- Average per Order: `=IFERROR(TotalSalesCell/TotalOrdersCell,0)`
- Pending: `=SUMIFS(SalesData[Sales Amount],SalesData[Payment Status],"Pending",SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))`

**Voiceover (exact):**
"Ab aata hai dashboard ka dil — **KPI cards**. Yaad rakhiye, hum final values kabhi haath se type nahi karte; sab kuch formula se nikalta hai taaki data badalte hi number khud update ho jaaye.

Pehla KPI — **Total Sales**. Hum `SUMIFS` use karenge jo sirf October 2026 ka Sales Amount joregi. Date condition hum `DATE` function se dete hain: October ek tareekh se bada ya barabar, aur November ek se chhota. Result aata hai **chaudah lakh, atthais hazaar, ek sau nabbe** — 14,28,190.

Doosra — **Total Orders**. Kyunki ek row ek unique invoice hai, hum `COUNTIFS` se October ke un rows ko ginte hain jinka Invoice No blank nahi hai. Yeh `"<>"` condition blank ko chhod deti hai. Total orders — **180**.

Teesra — **Total Units Sold** — wahi date condition par Qty ka SUMIFS. Jawab — **11,834 units**.

Chautha — **Average Sales per Order** — bas Total Sales divide by Total Orders, lekin hum ise `IFERROR` mein lapet dete hain taaki agar kabhi orders zero ho toh divide-by-zero error na aaye. Result — lagbhag **7,934 rupaye per order**.

Paanchva — **Pending Sales Amount** — SUMIFS jisme Payment Status 'Pending' ho, October ke andar. Yeh banta hai **3,72,985**. Ek zaroori baat: ise hum **Pending Sales Amount** keh rahe hain, **Outstanding Receivables** nahi — kyunki is data mein actual payment received ya balance ki koi field nahi hai. Terminology hamesha data ke hisaab se honi chahiye."

**Excel actions:** Type each KPI formula into its value cell; show live result; wrap the average in IFERROR; point to the Pending label.
**Keyboard shortcuts:** `F4` if you need to lock references (not required here as the table handles ranges); `Enter` to commit.
**On screen:** Each formula in the formula bar and the resulting KPI value in its card.
**Editing:** Lower-third caption for each KPI name and its verified value; highlight the word "Pending" vs "Outstanding".
**Validation:** Compare on-screen values to the verified set (14,28,190 / 180 / 11,834 / 7,934.39 / 3,72,985).

---

## SCENE 6 — Region-wise Sales Analysis using SUMIFS
**Duration:** ~1:20 | **Worksheet:** MIS_Dashboard
**Formula (per region cell, e.g. East in B-row):**
`=SUMIFS(SalesData[Sales Amount],SalesData[Region],<region cell>,SalesData[Date],">="&DATE(2026,10,1),SalesData[Date],"<"&DATE(2026,11,1))`

**Voiceover (exact):**
"Ab region-wise todte hain. Management ko dekhna hota hai ki kaunsa region sabse aage hai. Hum wahi `SUMIFS` use karenge, lekin ab ek extra condition — Region. Region ke naam ko hum ek cell se reference karte hain taaki formula copy ho sake. East, West, North, South — chaaron ke saamne same formula. Dekhiye: East **3,51,030**, West **3,83,675** — yeh sabse strong region hai, North **3,55,130**, aur South **3,38,355**. Aur in chaaron ka total aana chahiye wahi **14,28,190** jo Total Sales KPI mein tha — yeh hamara cross-check hai ki numbers reconcile ho rahe hain."

**Excel actions:** Build the Region table; drag the SUMIFS formula down the four regions; show the Total row equals Total Sales.
**Keyboard shortcuts:** Fill handle drag, or `Ctrl+D` to copy down.
**On screen:** Four region rows with values and the reconciling Total.
**Editing:** Side caption "Sum of regions = Total Sales ✔".
**Validation:** East+West+North+South must equal 14,28,190.

---

## SCENE 7 — Creating a Native Pivot Table
**Duration:** ~1:40 | **Worksheet:** Raw_Data → new sheet / Pivot_Analysis

**Voiceover (exact):**
"Formulas ke saath-saath, MIS mein **Pivot Tables** bhi zaroori hain — kyunki yeh drag-and-drop se instant summary deti hain. SalesData table ke kisi bhi cell par click kijiye, phir **Insert** tab, **PivotTable**, **From Table/Range**. Source apne aap 'SalesData' dikhayega. New Worksheet choose karke OK. Ab right side ke field list mein se **Region** ko **Rows** area mein drag kijiye, aur **Sales Amount** ko **Values** area mein. Ek bahut common galti — kabhi-kabhi Excel Sales Amount ka **Count** dikha deta hai Sum ke bajaye. Toh Values mein us field par click karke **Value Field Settings** mein jaa kar **Sum** select kijiye. Aur filter ke liye **Date** ko **Filters** area mein daal kar October 2026 set kar dijiye. Isi tarah ek doosra pivot **Product** ke liye banaiye."

**Excel actions:** Insert → PivotTable → From Table/Range (SalesData) → New Worksheet → Region to Rows, Sales Amount to Values → Value Field Settings → Sum → Date to Filters → October 2026. Repeat for Product.
**Keyboard shortcuts:** `Alt+N+V` opens Insert PivotTable in many builds.
**On screen:** The PivotTable Fields pane and the resulting summary; the Sum (not Count) confirmation.
**Formula:** none (pivot aggregation).
**Editing:** Zoom into "Value Field Settings → Sum".
**Validation:** Pivot's Region sum for October must match the dashboard's 14,28,190.

> Honesty note for the creator: Pivot Tables are built live in Excel 365 during recording. The delivered `.xlsx` ships the ready `SalesData` source and the exact steps on the `Pivot_Analysis` sheet; it does not contain pre-fabricated fake pivots.

---

## SCENE 8 — Creating Charts
**Duration:** ~1:05 | **Worksheet:** pivot sheets

**Voiceover (exact):**
"Numbers ke saath visuals management ko turant samajh aate hain. Region wale pivot par click karke **PivotChart** choose kijiye, aur **Clustered Column** select kijiye — yeh region-wise performance clearly dikhata hai. Product wale pivot ke liye **Pie chart** ya **Bar** acha rehta hai taaki har tea ka share dikhe. Chart par right-click karke **Add Data Labels** laga dijiye taaki exact values upar dikhein. Title ko meaningful rakhiye — jaise 'Region-wise Sales Performance' aur 'Product-wise Sales Analysis'."

**Excel actions:** Select pivot → PivotChart → Clustered Column (region) / Pie (product) → right-click series → Add Data Labels → rename chart titles.
**On screen:** Both charts with titles and data labels.
**Editing:** Clean cut between the two charts; avoid spinning/animated transitions.
**Validation:** Chart totals visually match the pivot and dashboard numbers.

---

## SCENE 9 — Adding Interactive Slicers
**Duration:** ~1:10 | **Worksheet:** pivot sheets

**Voiceover (exact):**
"Ab isse **interactive** banate hain — slicers ke saath. Pivot par click karke **PivotTable Analyze** tab mein **Insert Slicer** dabaiye. Yahan se **Region** aur **Product** tick kijiye — do slicers ban gaye. Ab magic yeh hai: ek hi slicer se dono pivots ko control karna. Slicer par right-click karke **Report Connections** mein jaaiye aur un saari PivotTables ko tick kar dijiye jinhe aap control karna chahte hain. Dhyaan rakhiye — slicer sirf un pivots ko jodta hai jo **same data source** — yaani humari SalesData table — se bane hain. Ab 'West' par click karte hi dono pivots aur charts turant filter ho jaayenge."

**Excel actions:** PivotTable Analyze → Insert Slicer → tick Region & Product → right-click slicer → Report Connections → tick both pivots → click a value to demo cross-filter.
**On screen:** Both slicers, and live filtering of pivots + charts on click.
**Editing:** Capture the click → instant filter moment at full frame rate (30 fps) so motion is smooth.
**Validation:** Selecting one region filters both pivots identically; clearing the slicer restores totals to 14,28,190.

---

## SCENE 10 — Formatting the Final Dashboard
**Duration:** ~1:05 | **Worksheet:** MIS_Dashboard

**Voiceover (exact):**
"Ab finishing touch — formatting. Professional dashboard ka matlab zyada decoration nahi, balki **clarity**. Title ko bold aur bada rakhiye, KPI cards ko ek consistent colour band dijiye, numbers par proper number format lagaiye — thousands separator ke saath. Gridlines ko **View** tab se off kar dijiye taaki look clean rahe. Ek hi font family, consistent spacing, aur bas do-teen colours — navy aur light blue — kaafi hain. Yaad rakhiye: MIS report padhne waale manager ke liye hai, isliye readability sabse upar."

**Excel actions:** Bold title, apply fills to KPI cards, number format with thousands separator, View → uncheck Gridlines.
**Keyboard shortcuts:** `Ctrl+Shift+1` for number format with separator; `Ctrl+B` bold.
**On screen:** The dashboard transforming into the clean final look.
**Editing:** Before/after wipe is fine; avoid flashy effects.
**Validation:** Gridlines off; all monetary cells use the thousands separator; no cell shows `####` (columns wide enough).

---

## SCENE 11 — Refreshing and Validating the Report
**Duration:** ~1:10 | **Worksheet:** Raw_Data → MIS_Dashboard → pivots

**Voiceover (exact):**
"MIS report tab tak bharosemand nahi jab tak refresh aur validation na ho. Agar aap Raw_Data mein koi naya transaction add karein — kyunki yeh ek Table hai, SUMIFS aur COUNTIFS **apne aap** naya data pakad lenge. Lekin Pivot Tables manually refresh karni padti hain: kisi pivot par right-click karke **Refresh**, ya saare ek saath — **PivotTable Analyze → Refresh All**, shortcut **Control plus Alt plus F5**. Validation ke liye teen cross-check yaad rakhiye: ek — region-wise ka total Total Sales ke barabar ho; do — product-wise ka total bhi Total Sales ke barabar; teen — pivot ka October sum bhi wahi number de. Agar teeno match karte hain, aapki report reconcile ho gayi."

**Excel actions:** Add a sample row (optional) → show KPIs update → PivotTable Analyze → Refresh All → confirm totals reconcile.
**Keyboard shortcuts:** `Ctrl+Alt+F5` (Refresh All).
**On screen:** The refresh action and the matching totals.
**Editing:** Caption the three reconciliation checks as ticks.
**Validation:** All three totals equal; if a demo row was added, mention it is temporary and undo with `Ctrl+Z` so delivered numbers stay as documented.

---

## SCENE 12 — Conclusion
**Duration:** ~0:45 | **Worksheet:** MIS_Dashboard

**Voiceover (exact):**
"Toh doston, aaj humne zero se ek complete **Sales MIS Report** banayi — raw data se Excel Table, structured-reference Sales Amount, KPI cards SUMIFS aur COUNTIFS se, region aur product analysis, native Pivot Tables, charts, aur interactive slicers — aur sabse zaroori, humne har number ko validate kiya. Yahi cheez aapko ek normal Excel user se ek professional MIS executive banati hai. Is workbook ko aap apne real sales data par bhi apply kar sakte hain. Agar video useful laga toh **Like** kijiye, channel ko **Subscribe** kijiye, aur comment mein bataiye ki agli video kis topic par chahiye. Milte hain agli video mein — tab tak ke liye, happy Excel-ing!"

**Excel actions:** End on the completed dashboard; optional slow zoom-out.
**On screen:** Final dashboard + subscribe prompt overlay.
**Editing:** Outro card with subscribe/like; keep under 5 seconds.
**Validation:** Final frame shows the documented totals unchanged.

---

### Total estimated runtime
0:50 + 1:00 + 1:15 + 1:10 + 1:40 + 1:20 + 1:40 + 1:05 + 1:10 + 1:05 + 1:10 + 0:45 ≈ **13:50**, within the 12–15 minute target.
