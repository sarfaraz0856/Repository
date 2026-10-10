# Narration Script & Shot List — Excel Raw Data se Automatic Summary (SUMIF & SUMIFS)

**For the human narrator and the screen-recording editor.** Read each scene's voiceover aloud while (or after) the Excel actions are recorded. Timings match `subtitles_hinglish.srt` and add up to 11:00.

Workbook to record from: `Raw_Data_to_Summary.xlsx` (All Data + finished Summary, all values formula-calculated).

## Recording notes

- **Voice:** natural Indian Hindi/Hinglish male trainer, medium pace, ~1 s pause after each formula and each result. Explain, don't just read symbols. When reading a formula, say e.g. *"bracket, single quote All Data single quote, exclamation, dollar D colon dollar D…"* only once (Scene 6); afterwards say *"sum range column E, baaki same"*.

- **Mic:** record WAV 48 kHz/24-bit in a quiet, soft-furnished room; −18 to −12 dBFS peaks; one take per scene so retakes are easy.

- **Screen capture:** Excel Desktop (Windows) at 1920×1080, 100–125 % zoom in Excel, OBS 30 fps. Start from a copy of the workbook with the Summary sheet **deleted**, so you build it live. Enable cursor highlight (e.g. PowerToys Mouse Highlighter).

- **Mix:** VO −14 LUFS integrated; music bed −32 to −28 LUFS (duck under VO); key/click SFX only on real on-screen actions; soft confirmation chime only on 190, the fill-down, and the Grand Totals.

- **Ctrl+T note (Scene 12):** the supplied All Data is already an Excel Table. For the live demo, either record Part A with plain formatting and convert in Scene 12, or show Table Design ▸ Convert to Range first and then Ctrl+T.

## Verified results (recalculated from the workbook)

| Employee | Stock | In | Out | Amount |
|---|---|--:|--:|--:|
| Rahul Sharma | Laptop | 190 | 45 | 9,500 |
| Rahul Sharma | Tablet | 30 | 8 | 3,600 |
| Priya Das | Mobile | 145 | 21 | 11,600 |
| Aman Khan | Tablet | 80 | 17 | 9,600 |
| Aman Khan | Laptop | 70 | 20 | 3,500 |
| **GRAND TOTAL** | | **515** | **111** | **37,800** |

| Employee (SUMIF) | In | Out | Amount |
|---|--:|--:|--:|
| Rahul Sharma | 220 | 53 | 13,100 |
| Priya Das | 145 | 21 | 11,600 |
| Aman Khan | 150 | 37 | 13,100 |
| **GRAND TOTAL** | **515** | **111** | **37,800** |

## Scene 1 — Powerful Introduction (00:00–00:35)

**On screen:** All Data tab: zoom on repeated Rahul Sharma / Laptop rows → zoom out → click + to reveal blank sheet. Title card: RAW DATA → AUTOMATIC SUMMARY.

**Text overlay:** EXCEL RAW DATA TO SUMMARY | FORMULA-BASED AUTOMATIC REPORT

**Voiceover:**

> Namaskar dosto! Aaj ki video mein hum Excel ka ek bahut hi useful practical kaam seekhne wale hain.
>
> Maan lijiye aapke paas All Data naam ki ek sheet hai, jismein employees ke naam, stock items, In Quantity, Out Quantity aur Amount ka bahut saara data diya hua hai.
>
> Ab aapko ek alag Summary sheet banani hai, jahan har employee aur har stock item ka total automatically calculate ho.
>
> Aapko baar-baar manually filter lagakar total nikalne ki zarurat nahi padegi. Hum formulas ka use karke poori summary report banayenge.
>
> Chaliye, isko actual Excel mein step by step karte hain.
>

## Scene 2 — Understand the All Data (00:35–01:20)

**On screen:** Highlight columns B, C, D, E, F one at a time. Circle rows 2, 4, 10 (Rahul Sharma).

**Text overlay:** OLD DATA = ORIGINAL TRANSACTIONS | SUMMARY = TOTALS AND REPORTING

**Voiceover:**

> Sabse pehle hamare paas All Data sheet hai.
>
> Column A mein Date hai, column B mein Employee Name, column C mein Stock Item, column D mein In Quantity, column E mein Out Quantity aur column F mein Amount hai.
>
> Ab dhyan se dekhiye, Rahul Sharma ka naam ek se zyada baar aa raha hai. Isi tarah ek hi employee alag-alag stock items ke saath bhi aa sakta hai.
>
> Humein har row ko alag-alag calculate nahi karna. Humein same employee aur same stock item ko ek saath group karke uska total nikalna hai.
>
> Iske liye hum Summary naam ki doosri worksheet ka use karenge.
>

## Scene 3 — Create the Second Worksheet (01:20–02:00)

**On screen:** Click + beside tabs → double-click new tab → type Summary → Enter. A1: EMPLOYEE AND STOCK SUMMARY REPORT. A2:E2 headings.

**Text overlay:** STEP 1: CREATE SUMMARY SHEET

**Voiceover:**

> Ab neeche plus button par click karke ek nayi worksheet banaiye.
>
> Is sheet ka naam Summary rakhiye.
>
> Ab hum ismein apni final report ka structure banayenge.
>
> Column A mein Employee Name, column B mein Stock Item, column C mein Total In Quantity, column D mein Total Out Quantity aur column E mein Total Amount rakhenge.
>
> Yahan hum sirf un employee aur stock combinations ko rakhenge jinka total humein chahiye.
>
> Dhyan rahe, All Data original data ke liye hai, aur Summary hamari final report ke liye hai.
>

## Scene 4 — Enter Employee and Stock Combinations (02:00–02:45)

**On screen:** Type A3:B7 one row at a time (Rahul Sharma/Laptop, Rahul Sharma/Tablet, Priya Das/Mobile, Aman Khan/Tablet, Aman Khan/Laptop).

**Text overlay:** STEP 2: DEFINE THE SUMMARY ROWS

**Voiceover:**

> Ab Summary sheet mein hum employee aur stock item ke combinations enter karenge.
>
> Pehli row mein Rahul Sharma aur Laptop.
>
> Doosri row mein Rahul Sharma aur Tablet.
>
> Teesri row mein Priya Das aur Mobile.
>
> Chauthi row mein Aman Khan aur Tablet.
>
> Aur paanchvi row mein Aman Khan aur Laptop.
>
> Ye hamari summary report ke lookup combinations hain.
>
> Ab agle steps mein Excel in combinations ke hisaab se All Data se totals automatically calculate karega.
>

## Scene 5 — Understand SUMIFS (02:45–03:35)

**On screen:** All Data: highlight rows 2, 4, 10 (Rahul Sharma + Laptop); grey out row 7 (Rahul Sharma + Tablet). Animate 3 rows → 1 summary row.

**Text overlay:** SUMIFS = SUM A VALUE WHEN MULTIPLE CONDITIONS MATCH | EMPLOYEE NAME + STOCK ITEM

**Voiceover:**

> Ab samajhte hain ki hum SUMIFS formula kyun use kar rahe hain.
>
> Hamare example mein Rahul Sharma ke naam par Laptop ki teen entries hain.
>
> In teeno entries ki In Quantity ko add karna hai, lekin Rahul Sharma ke Tablet records ko include nahi karna.
>
> Isi tarah humein sirf usi employee aur usi stock item ki entries select karni hain.
>
> SUMIFS formula mein hum pehle batate hain ki kaunsi values add karni hain. Phir hum pehli condition dete hain, jaise Employee Name Rahul Sharma. Uske baad doosri condition dete hain, jaise Stock Item Laptop.
>
> Excel dono conditions match karne wali rows ka total nikal deta hai.
>
> Yaani hum ek saath do conditions ke basis par total calculate karenge.
>

## Scene 6 — Calculate Total In Quantity (03:35–04:40)

**On screen:** Select Summary!C3, type =SUMIFS('All Data'!$D:$D,'All Data'!$B:$B,$A3,'All Data'!$C:$C,$B3), Enter → 190. Cut to All Data D2, D4, D10: 100 + 50 + 40 = 190.

**Text overlay:** Sum Range: All Data column D | Condition 1: Employee Name | Condition 2: Stock Item | RESULT: 190

**Voiceover:**

> Ab formula practically lagate hain.
>
> Summary sheet mein C3 cell select kijiye, kyunki yahan Total In Quantity chahiye.
>
> Ab ye formula enter kijiye:
>
    =SUMIFS('All Data'!$D:$D,'All Data'!$B:$B,$A3,'All Data'!$C:$C,$B3)

> Chaliye, isko samajhte hain.
>
> Sabse pehle humne All Data sheet ka column D select kiya hai, kyunki isi column mein In Quantity hai. Ye values add hongi.
>
> Uske baad All Data ka column B hai, jismein Employee Name hai. Excel isko Summary sheet ke A3 wale employee name se match karega.
>
> Phir All Data ka column C hai, jismein Stock Item hai. Excel isko Summary sheet ke B3 wale stock item se match karega.
>
> A3 mein Rahul Sharma hai aur B3 mein Laptop hai.
>
> Ab Excel sirf Rahul Sharma aur Laptop wali entries ki In Quantity add karega.
>
> Result aaya 190.
>
> Dekhiye, original data mein 100 plus 50 plus 40, total 190 hota hai.
>
> Yaani formula sahi kaam kar raha hai.
>

## Scene 7 — Calculate Total Out Quantity (04:40–05:25)

**On screen:** Select D3, type =SUMIFS('All Data'!$E:$E,'All Data'!$B:$B,$A3,'All Data'!$C:$C,$B3), Enter → 45. Show All Data E2, E4, E10: 20 + 15 + 10 = 45.

**Text overlay:** TOTAL OUT QUANTITY = 45

**Voiceover:**

> Ab humein Total Out Quantity nikalni hai.
>
> Pichhle formula mein hum column D ki In Quantity add kar rahe the.
>
> Ab Out Quantity ke liye All Data ka column E use karenge.
>
> Formula hai:
>
    =SUMIFS('All Data'!$E:$E,'All Data'!$B:$B,$A3,'All Data'!$C:$C,$B3)

> Conditions wahi rahengi. Employee Name bhi same rahega aur Stock Item bhi same rahega.
>
> Sirf Sum Range badal gaya hai.
>
> Enter press karne ke baad result 45 aata hai.
>
> Yaani Rahul Sharma ke Laptop ki total Out Quantity 45 hai.
>

## Scene 8 — Calculate Total Amount (05:25–06:10)

**On screen:** Select E3, type =SUMIFS('All Data'!$F:$F,'All Data'!$B:$B,$A3,'All Data'!$C:$C,$B3), Enter → 9500. Show All Data F2, F4, F10: 5000 + 2500 + 2000 = 9500.

**Text overlay:** TOTAL AMOUNT = 9500

**Voiceover:**

> Ab teesra total hai Amount.
>
> Amount All Data sheet ke column F mein hai. Isliye hum Sum Range mein column F use karenge.
>
> Formula hai:
>
    =SUMIFS('All Data'!$F:$F,'All Data'!$B:$B,$A3,'All Data'!$C:$C,$B3)

> Dono conditions wahi hain. Employee Name aur Stock Item.
>
> Enter press kijiye.
>
> Result aaya 9500.
>
> Original data mein 5000 plus 2500 plus 2000, total 9500 hota hai.
>
> Ab hamari pehli summary row complete ho gayi hai. Employee Name, Stock Item, Total In Qty, Total Out Qty aur Total Amount sab formula se aa rahe hain.
>

## Scene 9 — Copy Formulas to All Rows (06:10–07:00)

**On screen:** Select C3:E3 → drag fill handle to row 7. Click C5 to show the Formula Bar now reads $A5/$B5.

**Text overlay:** COPY FORMULAS WITH THE FILL HANDLE | DO NOT CALCULATE TOTALS MANUALLY

**Voiceover:**

> Ab har row mein alag-alag formula type karne ki zarurat nahi hai.
>
> C3 se E3 tak ke formulas select kijiye.
>
> Selection ke bottom-right corner par chhota sa square hota hai, jise Fill Handle kehte hain.
>
> Isko drag karke row 7 tak le jaiye.
>
> Excel har row ke employee name aur stock item ko read karke corresponding totals calculate kar dega.
>
> Ab dekhiye, Rahul Sharma ke Tablet ka total alag aa gaya. Priya Das ke Mobile ka total alag aa gaya. Aman Khan ki Tablet aur Laptop ki entries bhi alag calculate ho gayi hain.
>
> Is tarah humne five rows ki summary report formulas se complete kar li.
>

## Scene 10 — Add a Grand Total Row (07:00–07:35)

**On screen:** A8: GRAND TOTAL; C8 =SUM(C3:C7); D8 =SUM(D3:D7); E8 =SUM(E3:E7) → 515 | 111 | 37,800.

**Text overlay:** GRAND TOTAL 515 | 111 | 37800

**Voiceover:**

> Ab report ke last mein Grand Total add karte hain.
>
> A8 mein Grand Total likhiye.
>
> C8 mein ye formula lagaiye:
>
    =SUM(C3:C7)

> D8 mein:
>
    =SUM(D3:D7)

> Aur E8 mein:
>
    =SUM(E3:E7)

> Ab hamare total In Quantity 515, total Out Quantity 111, aur total Amount 37800 aa gaya hai.
>
> Dhyan rahe, ye Grand Total hamari summary ki values ko add karke aa raha hai.
>
> Agar aapka source data bahut bada hai, toh aap apni reporting requirements ke hisaab se totals ko source data se independently verify bhi kar sakte hain.
>

## Scene 11 — Employee-wise Summary Using SUMIF (07:35–08:40)

**On screen:** G2:J2 headings; G3:G5 names; G6 GRAND TOTAL. H3 =SUMIF('All Data'!$B:$B,$G3,'All Data'!$D:$D); I3 and J3 same with $E:$E and $F:$F. Fill H3:J3 to row 5; H6:J6 =SUM(...).

**Text overlay:** SUMIF = ONE CONDITION | SUMIFS = MULTIPLE CONDITIONS

**Voiceover:**

> Ab maan lijiye ki humein sirf employee-wise total chahiye aur stock item ko alag-alag show nahi karna.
>
> Iske liye hum SUMIF formula use karenge.
>
> SUMIF ek condition ke basis par values add karta hai.
>
> H3 mein formula likhiye:
>
    =SUMIF('All Data'!$B:$B,$G3,'All Data'!$D:$D)

> Yahan pehla range Employee Name ka hai, doosra criteria cell G3 hai, aur last range In Quantity ka hai.
>
> Excel Rahul Sharma ki sabhi entries ki In Quantity add karega.
>
> Ab isi tarah Out Quantity aur Amount ke formulas lagaiye.
>
> Formula ko neeche copy kar dijiye.
>
> Dekhiye, Rahul Sharma ka total In Quantity 220, Out Quantity 53 aur Amount 13100 hai.
>
> Priya Das aur Aman Khan ke totals bhi aa gaye.
>
> Toh difference samajh lijiye: SUMIF ek condition ke liye useful hai, aur SUMIFS multiple conditions ke liye useful hai.
>

## Scene 12 — Professional Formatting and Dynamic Data Tip (08:40–09:45)

**On screen:** Bold headers, header fill, #,##0, borders, bold totals, freeze panes. All Data: Ctrl+T demo (see note).

**Text overlay:** CLEAN REPORT | FORMULA-BASED TOTALS | CHECK NEW EMPLOYEES AND NEW STOCK ITEMS

**Voiceover:**

> Ab final report ko professional look dete hain.
>
> Headings ko bold karte hain, columns ki width adjust karte hain, Amount ko number format dete hain, aur Grand Total row ko highlight karte hain.
>
> Ab ek useful baat samajhiye. Hamare formulas All Data ke poore columns ko reference kar rahe hain. Isliye agar aap neeche koi naya transaction add karte hain, toh woh bhi calculation mein include ho sakta hai, jab tak data sahi columns mein enter kiya gaya ho.
>
> Bade aur regularly update hone wale datasets ke liye aap All Data ko Excel Table mein convert kar sakte hain. Data select karke Ctrl plus T press kijiye aur confirm kijiye ki table mein headers hain.
>
> Excel Table se data manage karna aur naye records add karna aasaan ho sakta hai.
>
> Lekin dhyan rahe, Summary sheet mein employee aur stock combinations bhi update hone chahiye, agar koi naya employee ya naya stock item add hua hai.
>

## Scene 13 — Common Mistakes and Final Check (09:45–10:35)

**On screen:** Checklist overlay; point to sheet name in Formula Bar, a misspelt name (e.g. 'Rahul Sharma ' with trailing space → 0), wrong column, numbers-as-text green triangle.

**Text overlay:** FINAL CHECKLIST

**Voiceover:**

> Final report save karne se pehle kuch important checks zaroor kariye.
>
> Pehla, sheet ka naam formula mein sahi hona chahiye. Hamare formulas mein sheet ka naam All Data hai.
>
> Doosra, Employee Name aur Stock Item ki spelling source data aur summary dono mein match honi chahiye.
>
> Teesra, In Quantity, Out Quantity aur Amount ke sum ranges sahi columns ko refer karne chahiye.
>
> Chautha, agar koi naya employee ya naya stock item add hota hai, toh summary mein us combination ko include karna na bhoolein.
>
> Aur paanchva, verify karein ki source data ki quantity aur amount columns mein actual numeric values hain.
>
> In basic checks se aapki summary report zyada reliable rahegi.
>

## Scene 14 — Professional Outro (10:35–11:00)

**On screen:** Zoom out to full Summary sheet (both tables) → zoom in on totals → end screen.

**Text overlay:** RAW DATA → AUTOMATIC SUMMARY | SUMIF • SUMIFS • EXCEL REPORTING | LIKE • SHARE • SUBSCRIBE

**Voiceover:**

> Toh dosto, aaj humne seekha ki Excel mein All Data sheet se doosri Summary sheet kaise banate hain.
>
> Humne SUMIFS se employee aur stock item ke combination ka total nikala, SUMIF se employee-wise summary banayi, formulas ko copy kiya aur Grand Total calculate kiya.
>
> Ab isi technique ko aap apne office reports, employee records, inventory, stock registers aur sales data mein use kar sakte hain.
>
> Agar video helpful laga, toh ise like karein, Excel seekhne wale doston ke saath share karein aur aise hi practical tutorials ke liye channel ko subscribe karein.
>
> Milte hain agle video mein. Thank you!
>
