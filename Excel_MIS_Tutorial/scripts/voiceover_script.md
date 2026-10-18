# Voiceover Script — Sales MIS Report (Hinglish, for a human narrator)

**How to use this file:** Record with a real human voice. Natural, clear, professional, conversational — the way an Excel trainer actually speaks to learners. Do **not** use a synthesized/AI voice and present it as a human recording. Keep a relaxed pace (~130–150 words/min). Pause briefly at each `/` marker. Save takes into `audio/` as `vo_sceneNN.wav` (48 kHz, mono, 24-bit).

> Audio production status: **PENDING** — no human recording exists yet. Once recorded, note each scene's real start/end timecodes so `subtitles/subtitles.srt` can be synchronized (see the subtitle file header).

---

**VO-01 (Intro)**
"Namaskaar doston, aur swagat hai aapka is channel par. / Aaj hum banayenge ek complete, professional Sales MIS Report — bilkul usi tarah jaise companies mein MIS executives banate hain. / MIS ka matlab hai Management Information System — raw transaction data ko aise summarise karna ki management ek nazar mein decision le sake. / Video ke end tak aapke paas hoga ek live dashboard — Total Sales, Total Orders, region aur product analysis, Pivot Tables, charts aur interactive slicers. / Main ek-ek formula samjhaunga bhi. Toh chaliye shuru karte hain."

**VO-02 (Raw data)**
"Sabse pehle data samajhte hain. / Yeh Raw_Data sheet hai — October 2026 ki 180 sales transactions. / Columns: Date, Invoice No, Region, Salesperson, Product, Qty, Unit Price, Sales Amount, aur Payment Status. / Ek important baat — ek row ka matlab ek unique invoice. Har Invoice No bhara hua aur unique hai, yeh assumption Read_Me sheet mein likhi hai."

**VO-03 (Excel Table)**
"Ab raw data ko Excel Table mein convert karenge. / Fayda — formulas readable ban jaate hain aur ranges automatically expand hoti hain. / Data cell par click karke Control plus T dabaiye, 'My table has headers' tick ho, OK. / Phir Table Design tab mein table ka naam rakhiye SalesData. Yahi naam har formula mein kaam aayega."

**VO-04 (Sales Amount)**
"Ab Sales Amount. / Table ke andar hum structured references use karte hain — column naam se, cell address se nahi. / Likhiye equals, bracket at Qty, star, bracket at bracket Unit Price. / Enter dabate hi Excel poore column mein formula bhar deta hai — ek baar likho, 180 rows calculate. / Unit Price do shabdon ka naam hai, isliye double brackets."

**VO-05 (KPIs)**
"Ab dashboard ka dil — KPI cards. Final values kabhi haath se type nahi karte. / Total Sales — SUMIFS se sirf October ka Sales Amount — 14,28,190. / Total Orders — ek row ek invoice, isliye COUNTIFS se non-blank invoices — 180. / Total Units Sold — Qty ka SUMIFS — 11,834. / Average Sales per Order — Total Sales divide Total Orders, IFERROR ke saath taaki divide-by-zero error na aaye — lagbhag 7,934. / Pending Sales Amount — Payment Status Pending ka SUMIFS — 3,72,985. / Ise Pending Sales Amount kehte hain, Outstanding Receivables nahi, kyunki is data mein payment received ya balance ki field nahi hai."

**VO-06 (Region SUMIFS)**
"Ab region-wise. / Wahi SUMIFS, lekin ek extra condition — Region, jise hum cell se reference karte hain. / East 3,51,030, West 3,83,675 — sabse strong, North 3,55,130, South 3,38,355. / Chaaron ka total aana chahiye wahi 14,28,190 — yeh hamara cross-check hai."

**VO-07 (Pivot Table)**
"Ab Pivot Table — drag and drop se instant summary. / SalesData ke cell par click, Insert, PivotTable, From Table/Range, New Worksheet, OK. / Region ko Rows mein, Sales Amount ko Values mein. / Common galti — Count aa jaata hai; Value Field Settings mein Sum select kijiye. / Date ko Filters mein daal kar October 2026. Aise hi doosra pivot Product ke liye."

**VO-08 (Charts)**
"Visuals se management ko turant samajh aata hai. / Region pivot par PivotChart, Clustered Column. / Product pivot par Pie ya Bar. / Right-click karke Add Data Labels. / Titles meaningful rakhiye — Region-wise Sales Performance aur Product-wise Sales Analysis."

**VO-09 (Slicers)**
"Ab interactive banate hain slicers se. / Pivot par PivotTable Analyze, Insert Slicer, Region aur Product tick. / Ek slicer se dono pivots control karne ke liye — right-click, Report Connections, dono pivots tick. / Dhyaan — slicer sirf same data source wale pivots jodta hai. West par click karte hi dono pivots aur charts filter ho jaayenge."

**VO-10 (Formatting)**
"Ab formatting — zyada decoration nahi, clarity. / Title bold aur bada, KPI cards ek consistent colour band, numbers par thousands separator. / View tab se gridlines off. / Ek font, consistent spacing, do-teen colours. Readability sabse upar — report manager ke liye hai."

**VO-11 (Refresh & Validate)**
"Report tab tak bharosemand nahi jab tak refresh aur validation na ho. / Table hone ki wajah se SUMIFS aur COUNTIFS naya data khud pakad lenge. / Pivot Tables manually refresh — right-click Refresh, ya PivotTable Analyze, Refresh All, Control Alt F5. / Teen cross-check — region total, product total, aur pivot ka October sum, teeno Total Sales ke barabar. Match hue toh report reconcile ho gayi."

**VO-12 (Conclusion)**
"Toh doston, aaj humne zero se complete Sales MIS Report banayi — table, structured formulas, KPIs, analysis, pivots, charts, slicers — aur har number validate kiya. / Yahi aapko professional MIS executive banata hai. / Video useful laga toh Like kijiye, Subscribe kijiye, aur comment mein agli video ka topic bataiye. / Milte hain agli video mein — tab tak, happy Excel-ing!"
