# Voice QA - Whisper back-translation of every narration clip

Voice: Kokoro-82M `hm_psi` (AI text-to-speech, offline), speed 1.135.

Method: each generated clip was transcribed by Whisper-small (sherpa-onnx, offline) with `language=hi, task=translate`, i.e. translated to English *from the audio alone*. If the English matches the on-screen caption's meaning, the voice is intelligible. Whisper-small is not perfect at Hindi, so small wording/number slips in the right column can come from the recognizer, not the voice. Validated on an English control clip first (exact transcript).

| # | Scene | Sec | On-screen caption | Heard (Whisper EN translation) |
|---|---|---|---|---|
| 1 | 1 | 3.4 | Namaskaar doston, aur swagat hai aapka is channel par. | Namaskar friends and welcome to this channel. |
| 2 | 1 | 10.2 | Aaj hum banayenge ek complete, professional Sales MIS Report — bilkul usi tarah jaise companies mein MIS executives banate hain. | Today we will make a complete professional sales MIS report, just like MIS executives in companies. |
| 3 | 1 | 10.3 | MIS ka matlab hai Management Information System — raw data ko aise summarise karna ki management ek nazar mein decision le sake. | MIS means Management Information System. That is, summarize raw data so that management can take a decision in a way. |
| 4 | 1 | 9.6 | Video ke end tak aapke paas hoga ek live dashboard — KPIs, region aur product analysis, Pivot Tables, charts aur slicers. | You will have a live dashboard with a video end to date. |
| 5 | 1 | 5.4 | Main sirf dikhaunga nahi, har formula samjhaunga bhi. Toh chaliye shuru karte hain! | I will not only show you, I will also explain the formula. So let's start. |
| 6 | 2 | 9.1 | Sabse pehle data samajhte hain. Yeh Raw_Data sheet hai — isme October 2026 ki 180 transactions hain. | First of all, we understand data. This is the raw data sheet and it has a total of 180 transactions of October 2026. |
| 7 | 2 | 7.3 | Date invoice ki tareekh hai, Invoice No har bill ka unique number, aur Region — East, West, North ya South. | The date is the date of the invoice. The invoice number is the unique number of each bill and region east, west, north, south. |
| 8 | 2 | 6.8 | Phir Salesperson, Product — Tea A, Tea B ya Tea C, Qty yaani kitne units bike, aur Unit Price. | Then Cells person, product, TA, TB or TC, quantity i.e. how many units are sold and unit price. |
| 9 | 2 | 7.9 | Sales Amount abhi khaali hai — ise hum formula se bharenge. Aur Payment Status batata hai — Paid ya Pending. | The column of the sales amount is empty now. We will fill it with the formula. And the payment status tells us whether the tree is green or not. |
| 10 | 2 | 12.2 | Shortcut: Ctrl + ↓ — cursor seedha aakhri row 182 par. Yaani header ke neeche 180 data rows. | A useful shortcut, control and down arrow. The cursor directly reaches the final row, i.e. 182. Meaning, the error is 180 data rows. |
| 11 | 2 | 9.6 | Important: ek row = ek unique invoice. Har Invoice No bhara hua hai aur kabhi repeat nahi hota. | A very important thing is that in this data, a row means a unique invoice. Every invoice is filled with numbers and never repeats. |
| 12 | 2 | 7.7 | Yeh assumption humne Read_Me sheet mein likh rakhi hai — aage Total Orders isi par based hoga. | This assumption is written in the Read Me sheet. And the total orders calculation will be based on this. |
| 13 | 3 | 10.5 | Ab is data ko Excel Table mein convert karte hain — formulas readable bante hain aur range apne aap expand hoti hai. | Now convert this data into an Excel table. Formulas are made readable by this and the range becomes expanded by the new data. |
| 14 | 3 | 4.2 | Data ke kisi bhi cell par click karke Ctrl + T dabaiye. | Click on the cell to click on Control + T. |
| 15 | 3 | 10.3 | Create Table mein range =$A$2:$I$182 aa gayi. 'My table has headers' tick hona chahiye — phir OK. | The range of the box is now available. From A2 to I182. Be careful, my table has a header stick. Press OK. |
| 16 | 3 | 8.9 | Table ban gaya — banded rows, har header par filter button, aur ribbon mein Table Design tab. | The table is ready. Look at the bandaid rose again. The filter button has been added to the header. And the table design tab has been opened in the ribbon. |
| 17 | 3 | 7.6 | Table Name box mein likhiye SalesData aur Enter. Yahi naam aage har formula mein use hoga. | Now, write the name in the box, the sales data and press Enter. This name will be used in the next formula. |
| 18 | 4 | 9.2 | Ab Sales Amount. Table ke andar formulas structured references use karte hain — cell address nahi, column ka naam. | Now, we will remove the sales amount. In the table, we use Formulas, Structured, References. This means that the sale is not an address but a column name. |
| 19 | 4 | 10.1 | H3 mein type kijiye: =[@Qty]*[@[Unit Price]] | Type in H3 cell equals bracket at QTY, close bracket star, then bracket at bracket unit price or brackets close. |
| 20 | 4 | 8.6 | @ ka matlab — isi row ki value. Unit Price do shabdon ka naam hai, isliye uske around double brackets. | The meaning of the ad here is the value of this row. And the unit is the name of the price of two words. That's why its around double brackets look like this. |
| 21 | 4 | 7.6 | Enter dabaate hi formula poore column mein apne aap fill — saari 180 rows ek saath. | Enter the form while pressing the Enter button. Excel gives the form in the entire column. All 180 rows are together. |
| 22 | 4 | 13.0 | Check: row 3 mein 55 × 120.00 = 6,600.00 ✔. Column select karein toh status bar mein Sum: 1,428,190.00. | Check and take the number of 5 times 120 in row 3. 6600 is equal to 6600. And if you select the entire column, the sum of the total numbers in the status bar is 14,28,190. |
| 23 | 5 | 7.8 | Ab dashboard ka dil — KPI cards. Yaad rakhiye, final values kabhi haath se type nahi karte. | Now comes the heart of the dashboard, the PI cars. Remember, we never type the final values with our hands. |
| 24 | 5 | 5.8 | Sab kuch formula se aata hai — data badla, toh number apne aap update. | Everything comes from the formula so that the number updates itself as soon as the data changes. |
| 25 | 5 | 15.1 | Total Sales (B6): SUMIFS sirf October ka Sales Amount jodta hai — date range DATE() se di hai. | The first PI is Total Sales. In the B6, there is a sum ifs formula which only combines the sale amount of October. We have given the date range from the date function, a smaller or larger than October and a smaller than November. |
| 26 | 5 | 4.1 | Result: 1,428,190.00 — yaani chaudah lakh, atthais hazaar, ek sau nabbe. | The result is 14,28,192. |
| 27 | 5 | 10.2 | Total Orders (D6): ek row = ek invoice, isliye COUNTIFS se October ke non-blank invoices — 180. | Second, Total Orders. Because each row has a unique invoice. We count the non-blank invoices from the count if. Total is 180. |
| 28 | 5 | 8.6 | Total Units Sold (F6): wahi date condition, Qty ka SUMIFS — 11,834. | Third, Total Unit Soul. Same date condition, but the sum of the quantity ifs. The answer is 11,834 units. |
| 29 | 5 | 14.7 | Average Sales / Order (H6): =IFERROR(B6/D6,0) — orders zero hon toh bhi error nahi. Result 7,934.39. | Fourth, order on average sales. Divide the total sales from total orders and if error is missed, so that the orders are never zero, then the error is not there. The answer is approximately 7,934. |
| 30 | 5 | 12.2 | Pending Sales Amount (B9): Payment Status = "Pending" wala SUMIFS — 372,985.00. | 5. Pairing Sales Amount. This includes an extra condition of IFS, Pairing Status. Pairing Sales Amount is 3,72985. |
| 31 | 5 | 12.1 | Naam jaan-boojhkar Pending Sales Amount rakha hai, 'Outstanding Receivables' nahi — data mein payment received ya balance ki field hi nahi hai. | Pay attention to the fact that we have intentionally named this as a pairing sale amount. Outstanding receivable is not there. Because there is no feeling of payment received or balance in this data. |
| 32 | 6 | 6.7 | Ab region-wise analysis — management dekhna chahta hai kaunsa region aage hai. | Now, Region-wise Analysis Management wants to see which region is ahead. |
| 33 | 6 | 11.7 | C13 mein wahi SUMIFS + ek condition: SalesData[Region] = B13. Region cell se aata hai, isliye formula neeche copy ho jaata hai. | The same sum ifs are in the T13. With an extra condition, region is equal to B13. The region's name comes from the sale. This is why this formula is copied below. |
| 34 | 6 | 17.7 | East 351,030 • West 383,675 (sabse strong) • North 355,130 • South 338,355. | East 3.5 million, 51,030. West 3.83 million, 675. This is the strongest region. North 3.55 million, 130. South 3.38 million, 355. |
| 35 | 6 | 9.3 | Total (C17) = 1,428,190.00 — bilkul Total Sales ke barabar. Yahi hamara cross-check hai ✔ | and the total sales of these four in C17 is exactly the same as the total sales. This is our cross check that the numbers are being written. |
| 36 | 6 | 10.8 | Isi tarah Product-wise: Tea A 385,320 • Tea B 432,820 • Tea C 610,050 — total phir se 1,428,190.00 ✔ | In the same way, Product wise, TATB and TC. TC is the most sold and its total is also the same. 14,28,190. |
| 37 | 7 | 5.8 | Formulas ke saath Pivot Table bhi seekhte hain — drag-and-drop se instant summary. | Along with formulas, we also learn pivot tables. Drag and drop an instant summary. |
| 38 | 7 | 6.9 | SalesData ke kisi cell par click → Insert → PivotTable → From Table/Range. | Click on the sales data on a table. Then insert the Pivot Table from Table or Ramp in the Insert Tab. |
| 39 | 7 | 6.5 | Table/Range mein SalesData already aa gaya. New Worksheet choose karke OK. | The sales data has already been sent to the table and range. Choose the New Worksheet and press OK. |
| 40 | 7 | 10.7 | Nayi sheet bani — right side PivotTable Fields. Region ko Rows mein, Sales Amount ko Values mein drag kijiye. | The new sheet is ready and the pivot table field pane is open on the right side. Now drag the region into the Rouse area and the sales amount into the Values area. |
| 41 | 7 | 10.1 | Dhyaan: Values mein Sum of Sales Amount hona chahiye. 'Count of' dikhe toh → Value Field Settings → Sum. | Pay attention that some of the sales amount should be in the values. If you see the count off, then select some of the value field settings. |
| 42 | 7 | 11.1 | Date ko Filters mein daaliye, October 2026 rakhiye. Grand Total = 1428190 — dashboard se match ✔ | Add the update to the filters area and select October 2026. The grand total is matching with the total sales of the dashboard. |
| 43 | 7 | 6.2 | Isi tarah doosra pivot — Product Rows mein, Sales Amount Values mein. | Similarly, make another pivot. Product in rows and sales amount in values. |
| 44 | 8 | 5.6 | Ab charts — visuals se management ko baat turant samajh aati hai. | Now let's make the charts because the management immediately understands the conversation from the visual. |
| 45 | 8 | 7.5 | Region pivot select → PivotTable Analyze → PivotChart → Clustered Column → OK. | Click on the Pivot tab. In Pivot Table Analyze, choose Pivot Chart and choose Clustered Column. |
| 46 | 8 | 11.0 | Chart aa gaya. Right-click → Add Data Labels — har bar par exact value. Title: Region-wise Sales Performance. | The chart is here. Now right-click on the bars to add data labels so that you can see the exact value on every bar. And keep the title Region-wise Sales Performance. |
| 47 | 8 | 9.3 | Product pivot ke liye Pie chart — Product-wise Sales Analysis. Tea C ka share sabse bada. | For the product's pivot, we will make a pie chart. Keep the title, Product Y Sales Analysis. See, the share of TC is the biggest. |
| 48 | 9 | 4.2 | Ab report ko interactive banate hain — slicers se. | Now let's make this report interactive with the help of SlySIRS. |
| 49 | 9 | 7.1 | Pivot select → PivotTable Analyze → Insert Slicer → Region aur Product tick → OK. | Click on Pivot. Insert Slicer in Pivot Table Analyze. Then, tick Region and Product. |
| 50 | 9 | 10.5 | Ek slicer se dono pivots: slicer par right-click → Report Connections → dono PivotTables tick. | To control both the pivots from the slicer, right-click on the slicer, go to report connections and tap both the pivots. |
| 51 | 9 | 7.2 | Yaad rakhiye: slicer sirf same data source (SalesData) wale pivots ko jod sakta hai. | Remember, slicer can only connect the same data source, i.e. cells, from data. |
| 52 | 9 | 6.2 | Ab West par click — dono pivots aur charts turant West ke liye filter ho gaye! | Now click on the Waste. Both the products and the charts will filter for Waste. |
| 53 | 9 | 6.5 | Filter hatane ke liye slicer ka Clear Filter button — totals wapas poore. | To remove the filter, press the 'Clear' button to clear the slicer. The totals are returned. |
| 54 | 10 | 7.4 | Ab finishing — professional dashboard ka matlab decoration nahi, clarity. | Now finishing touch, formatting. Professional, the meaning of Dashboard is not much, but it is a clarity. |
| 55 | 10 | 9.0 | Bold title, KPI cards ka consistent colour, aur numbers par thousands separator — Ctrl + Shift + 1. | The title is bold and big, the color of the AI cars is consistent and the numbers are thousands of separators. Shortcut is Control Shift 1. |
| 56 | 10 | 5.4 | View tab → Gridlines untick — look ekdum clean. | Go to View Tab and remove the grid lines. The look becomes very clean. |
| 57 | 10 | 7.7 | Ek font, consistent spacing, do-teen colours — report manager ke liye hai, readability sabse upar. | A font, consistent spacing and just a few colors. The report is for the manager, so the readability is the highest. |
| 58 | 11 | 6.8 | Report tab tak bharosemand nahi jab tak refresh aur validation na ho. | Till then, no MIS report will be reliable until its refresh and validation is done. |
| 59 | 11 | 8.3 | Raw_Data mein nayi row aaye — Table hone se SUMIFS / COUNTIFS use apne aap pakad lete hain. | If there is a new row error in raw data, then because of the table, we take some ifs and count ifs. |
| 60 | 11 | 8.6 | Pivot Tables ko refresh karna padta hai: Data → Refresh All — ya Ctrl + Alt + F5. | But the pivot tables have to be refreshed. In the Data tab, refresh all or shortcut Ctrl + Alt + A5 key. |
| 61 | 11 | 9.2 | Teen cross-check: Region total = Product total = Pivot Grand Total = Total Sales 1,428,190. | and for validation, 3 cross checks, region total, product total and the grand total of the pivot should be equal to the total sales. |
| 62 | 11 | 4.8 | Teeno match ✔ — report reconciled. | The three match-ups have been reconciled. |
| 63 | 12 | 5.1 | Toh doston, aaj humne zero se ek complete Sales MIS Report banayi. | So friends, today we have made a complete cell MIS report from zero. |
| 64 | 12 | 10.1 | Excel Table, structured formula, SUMIFS / COUNTIFS KPIs, region-product analysis, Pivot, charts aur slicers. | Excel Table Structured Reference Formula Some Ifs or Count Ifs, region or product analysis Pivot tables, charts or slicers |
| 65 | 12 | 8.6 | Aur sabse zaroori — har number ko validate kiya. Yahi aapko professional MIS executive banata hai. | And most importantly, we validated every number. This is what makes you a professional MIS executive. |
| 66 | 12 | 11.8 | Video achhi lagi toh Like, Subscribe aur comment mein agla topic bataiye. Happy Excel-ing! | If you like the video, then like it, subscribe to the channel and tell me in the comment which topic the next video will be. See you in the next video. Happy Excelling! |

## Notes

- The voice text passes through `scripts/pronunciation.py` before synthesis. English technical words and large numbers are written in Devanagari the way Indian trainers say them. In A/B tests with this Whisper check, that was clearer than English spelling. Exception: "rows" stays English, because "रोज़" reads as the Hindi word for "daily".
- The video plays at 1.15x the earlier pace (voice speed 1.135, calibrated so total narration is exactly 1/1.15). Commas inside large amounts add short pauses, so the numbers stay clear at this speed.
- Whisper writes lakh amounts in odd forms. "3.5 million, 51,030" and "3,72985" here mean 3,51,030 and 3,72,985.
- Known residuals (judged to be the recognizer, not the voice):
  - Clip 60: the full clip comes back as "Ctrl + Alt + A5". The same shortcut phrase on its own comes back as "Ctrl + Alt + F5".
  - "Pending" is sometimes written as "Pairing".
  - English "rows" is sometimes written as "rose".
- Reproduce: `python3 scripts/voice_qa.py`.
