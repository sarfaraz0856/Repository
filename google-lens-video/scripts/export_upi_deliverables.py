"""Writes the UPI documentary text deliverables into ../UPI_Documentary/:
UPI_Documentary_Subtitles.srt, UPI_Complete_Voiceover_Script.txt, UPI_Research_References.txt"""
import json, os, textwrap

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, '..', 'UPI_Documentary')
os.makedirs(OUT, exist_ok=True)
FT = json.load(open(os.path.join(ROOT, 'src', 'upi', 'full_timeline.json')))
FPS = FT['fps']


def ts(frames, sep=','):
    ms = int(round(frames / FPS * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'


def two_lines(t, width=52):
    lines = textwrap.wrap(t, width)
    if len(lines) <= 2: return lines
    half = len(t) // 2; cut = t.rfind(' ', 0, half + 10)
    return [t[:cut].strip(), t[cut:].strip()]


cues = [c for s in FT['scenes'] for c in s['cues']]
srt = []
for i, c in enumerate(cues):
    end = min(cues[i + 1]['from'] - 1, c['from'] + c['dur'] + 18) if i < len(cues) - 1 else c['from'] + c['dur'] + 18
    srt.append(f"{i + 1}\n{ts(c['from'])} --> {ts(end)}\n" + '\n'.join(two_lines(c['text'])) + '\n')
open(os.path.join(OUT, 'UPI_Documentary_Subtitles.srt'), 'w', encoding='utf-8').write('\n'.join(srt))

lines = ['HOW UPI WORKS – The Technology Behind Instant Money Transfers', 'Complete voiceover script (Hindi-Hinglish) with timings', '',
         "Narration: creator's cloned voice (Chatterbox Multilingual, MIT license). Times are mm:ss from the start of the video.", '']
for s in FT['scenes']:
    lines += [f"[{ts(s['from'], '.')[3:8]} – {ts(s['from'] + s['dur'], '.')[3:8]}]  SCENE {s['id'][1:]} · {s['title']}", '']
    for c in s['cues']:
        lines.append(f"  {ts(c['from'], '.')[3:8]}  {c['text']}")
    lines.append('')
open(os.path.join(OUT, 'UPI_Complete_Voiceover_Script.txt'), 'w', encoding='utf-8').write('\n'.join(lines))

refs = """UPI DOCUMENTARY – RESEARCH REFERENCES & VERIFICATION NOTES
==========================================================

Primary sources to verify against (official):
  1. NPCI – UPI FAQs ............ https://www.npci.org.in/what-we-do/upi/faqs
  2. NPCI – UPI overview ........ https://www.npci.org.in/what-we-do/upi/product-overview
  3. NPCI – UPI settlement ...... https://www.npci.org.in/uploads/UPI_Settlement_Process_256f73e1df.pdf
  4. Reserve Bank of India ...... https://www.rbi.org.in/
  5. NPCI ....................... https://www.npci.org.in/

IMPORTANT – verification status
  During production these official websites could NOT be opened from the build environment
  (npci.org.in refused automated access with HTTP 403; it was not bypassed). So none of the
  statements below could be checked live against the pages above. Please open the links
  yourself and confirm before publishing.

How the script was kept safe
  - The narration follows the brief's own carefully worded script and avoids specific numbers:
    no transaction limits, processing times, settlement schedules, cycle counts, volumes or
    security-protocol names are stated.
  - Wording such as "can", "may", "usually", "simplified" is used where behaviour varies.
  - The "2 seconds" idea is shown only as an illustrative hook, with on-screen notes:
    "Illustrative transaction timing. Actual processing time may vary."

Statements made in the video (to confirm on the sources above)
  [1] UPI = Unified Payments Interface, developed by NPCI (National Payments Corporation of India).
  [1][2] A PSP (Payment Service Provider) connects UPI apps to the UPI network.
  [1] Payments can be initiated with a UPI ID (VPA), a mobile number linked to UPI, or a QR code.
  [1] In a regular bank-account UPI payment the money stays in the linked bank account
      (the app is an interface, not a wallet). Some UPI products work differently.
  [1] The UPI PIN authorises a payment; it is NOT needed to receive money.
  [1] Payments can be declined for wrong PIN, insufficient balance, limits, or failed checks.
  [3][4] Customer credit happens in real time, while interbank settlement is a separate,
      netted process computed by NPCI and settled through the RBI settlement system
      (shown conceptually; no schedule is claimed).
  [1] Pending/failed transactions: status is verified by the network and banks; if money was
      debited for a failed payment, a reversal may happen as per applicable rules.

Illustrative content (NOT real data)
  - Merchant "Sharma General Store", UPI IDs ending in "@demo", transaction ID "DEMO 0000 1234",
    balances ₹5,000 / ₹4,900 / ₹2,000 / ₹2,100, settlement figures ₹10,000 / ₹7,000 / ₹3,000.
  - All QR codes are random demonstration patterns marked "DEMO" and cannot be scanned or paid.
  - App names Google Pay, PhonePe, BHIM and Paytm appear only as text examples of UPI apps
    (no logos). The payment app shown on the phone is a fictional demo app.
"""
open(os.path.join(OUT, 'UPI_Research_References.txt'), 'w', encoding='utf-8').write(refs)
print('wrote deliverables to', os.path.abspath(OUT))
