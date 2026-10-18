#!/usr/bin/env python3
"""
Pronunciation lexicon for the Hindi TTS voice.

The voice is a Hindi model. English words left in Latin script are spoken
with English phonemes, which this voice renders less clearly (A/B-tested with
Whisper back-translation: "pivot" -> heard as "wire"/"plant"; "Pie chart" ->
"pie shot"; "bars" -> "boss"). Writing those words the way Indian trainers say
them, in Devanagari, was understood correctly in every test pair. Hindi number
words such as "इक्यावन" were also misheard, while Indian-English numbers in
Devanagari ("थ्री लाख फ़िफ़्टी वन थाउज़ंड थर्टी") came back exact.

This only changes the audio. On-screen captions keep the normal spelling.
"""
import re

PHRASES = {
    # UI commands / dialog names
    "Add Data Labels": "ऐड डेटा लेबल्स", "PivotTable Analyze": "पिवट टेबल एनालाइज़",
    "PivotTable Fields": "पिवट टेबल फ़ील्ड्स", "Value Field Settings": "वैल्यू फ़ील्ड सेटिंग्स",
    "Report Connections": "रिपोर्ट कनेक्शन्स", "Insert Slicer": "इन्सर्ट स्लाइसर",
    "Clustered Column": "क्लस्टर्ड कॉलम", "Grand Total": "ग्रैंड टोटल", "Refresh All": "रिफ़्रेश ऑल",
    "Clear Filter": "क्लियर फ़िल्टर", "From Table or Range": "फ़्रॉम टेबल ऑर रेंज",
    "Table or Range": "टेबल ऑर रेंज", "New Worksheet": "न्यू वर्कशीट", "Table Design": "टेबल डिज़ाइन",
    "Table Name": "टेबल नेम", "Create Table": "क्रिएट टेबल", "My table has headers": "माई टेबल हैज़ हेडर्स",
    "Excel Table": "एक्सेल टेबल", "Sales Data": "सेल्स डेटा", "Raw Data": "रॉ डेटा", "Read Me": "रीड मी",
    "Sum of Sales Amount": "सम ऑफ़ सेल्स अमाउंट", "Count of": "काउंट ऑफ़",
    "management information system": "मैनेजमेंट इन्फ़ॉर्मेशन सिस्टम",
    "Outstanding Receivables": "आउटस्टैंडिंग रिसीवेबल्स", "DATE function": "डेट फ़ंक्शन",
    "structured reference": "स्ट्रक्चर्ड रेफ़रेंस", "structured references": "स्ट्रक्चर्ड रेफ़रेंसेज़",
    "sum ifs": "सम इफ़्स", "count ifs": "काउंट इफ़्स", "if error": "इफ़ एरर",
    "Tea A": "टी ए", "Tea B": "टी बी", "Tea C": "टी सी",
    # keyboard shortcuts
    "control plus T": "कंट्रोल प्लस टी", "control shift one": "कंट्रोल शिफ़्ट वन",
    "control alt F five": "कंट्रोल प्लस ऑल्ट प्लस एफ़ फ़ाइव की", "control और down arrow": "कंट्रोल और डाउन ऐरो",
    # cell references
    "H three": "एच थ्री", "B six": "बी सिक्स", "B thirteen": "बी थर्टीन", "C thirteen": "सी थर्टीन",
    "C seventeen": "सी सेवेंटीन",
    # acronyms
    "KPIs": "के पी आईज़", "KPI": "के पी आई", "MIS": "एम आई एस", "OK": "ओके", "Excel-ing": "एक्सेलिंग",
    "Qty": "क्यू टी वाई",
}

WORDS = {
    "address": "एड्रेस", "all": "ऑल", "alt": "ऑल्ट", "amount": "अमाउंट", "analysis": "एनालिसिस",
    "analyze": "एनालाइज़", "area": "एरिया", "around": "अराउंड", "arrow": "ऐरो", "assumption": "असम्पशन",
    "at": "ऐट", "average": "एवरेज", "balance": "बैलेंस", "banded": "बैंडेड", "bar": "बार", "bars": "बार्स",
    "based": "बेस्ड", "bill": "बिल", "blank": "ब्लैंक", "bold": "बोल्ड", "box": "बॉक्स", "bracket": "ब्रैकेट",
    "brackets": "ब्रैकेट्स", "button": "बटन", "calculation": "कैलकुलेशन", "cards": "कार्ड्स", "cell": "सेल",
    "channel": "चैनल", "chart": "चार्ट", "charts": "चार्ट्स", "check": "चेक", "choose": "चूज़",
    "clarity": "क्लैरिटी", "clean": "क्लीन", "clear": "क्लियर", "click": "क्लिक", "close": "क्लोज़",
    "colour": "कलर", "colours": "कलर्स", "column": "कॉलम", "comment": "कमेंट", "companies": "कंपनीज़",
    "complete": "कम्प्लीट", "condition": "कंडीशन", "connections": "कनेक्शन्स", "consistent": "कंसिस्टेंट",
    "control": "कंट्रोल", "convert": "कन्वर्ट", "copy": "कॉपी", "count": "काउंट", "create": "क्रिएट",
    "cross": "क्रॉस", "cursor": "कर्सर", "dashboard": "डैशबोर्ड", "data": "डेटा", "date": "डेट",
    "decision": "डिसीज़न", "decoration": "डेकोरेशन", "design": "डिज़ाइन", "divide": "डिवाइड",
    "double": "डबल", "down": "डाउन", "drag": "ड्रैग", "drop": "ड्रॉप", "east": "ईस्ट", "end": "एंड",
    "enter": "एंटर", "equals": "इक्वल्स", "error": "एरर", "exact": "एग्ज़ैक्ट", "excel": "एक्सेल",
    "executive": "एग्ज़ीक्यूटिव", "executives": "एग्ज़ीक्यूटिव्स", "expand": "एक्सपैंड", "extra": "एक्स्ट्रा",
    "field": "फ़ील्ड", "fields": "फ़ील्ड्स", "filter": "फ़िल्टर", "filters": "फ़िल्टर्स", "final": "फ़ाइनल",
    "finishing": "फ़िनिशिंग", "font": "फ़ॉन्ट", "formatting": "फ़ॉर्मेटिंग", "formula": "फ़ॉर्मूला",
    "formulas": "फ़ॉर्मूलाज़", "function": "फ़ंक्शन", "gridlines": "ग्रिडलाइन्स", "happy": "हैप्पी",
    "header": "हेडर", "headers": "हेडर्स", "important": "इम्पॉर्टेंट", "insert": "इन्सर्ट",
    "instant": "इंस्टेंट", "interactive": "इंटरैक्टिव", "invoice": "इनवॉइस", "invoices": "इनवॉइसेज़",
    "labels": "लेबल्स", "like": "लाइक", "live": "लाइव", "look": "लुक", "management": "मैनेजमेंट",
    "manager": "मैनेजर", "match": "मैच", "name": "नेम", "non": "नॉन", "north": "नॉर्थ", "november": "नवंबर",
    "number": "नंबर", "numbers": "नंबर्स", "october": "अक्टूबर", "or": "ऑर", "order": "ऑर्डर",
    "orders": "ऑर्डर्स", "paid": "पेड", "pane": "पेन", "payment": "पेमेंट", "pending": "पेंडिंग",
    "per": "पर", "performance": "परफ़ॉर्मेंस", "pie": "पाई", "pivot": "पिवट", "pivots": "पिवट्स",
    "pivottable": "पिवट टेबल", "pivottables": "पिवट टेबल्स", "pivotchart": "पिवट चार्ट", "plus": "प्लस",
    "price": "प्राइस", "product": "प्रोडक्ट", "professional": "प्रोफ़ेशनल", "quantity": "क्वांटिटी",
    "range": "रेंज", "raw": "रॉ", "readability": "रीडेबिलिटी", "readable": "रीडेबल", "received": "रिसीव्ड",
    "reconcile": "रिकंसाइल", "refresh": "रिफ़्रेश", "region": "रीजन", "repeat": "रिपीट", "report": "रिपोर्ट",
    "result": "रिज़ल्ट", "ribbon": "रिबन", "right": "राइट", "row": "रो",   # "rows" stays English: Devanagari "रोज़" reads as the Hindi word for "daily" "sales": "सेल्स",
    "salesperson": "सेल्सपर्सन", "same": "सेम", "select": "सिलेक्ट", "separator": "सेपरेटर",
    "settings": "सेटिंग्स", "share": "शेयर", "sheet": "शीट", "shift": "शिफ़्ट", "shortcut": "शॉर्टकट",
    "side": "साइड", "slicer": "स्लाइसर", "slicers": "स्लाइसर्स", "sold": "सोल्ड", "source": "सोर्स",
    "south": "साउथ", "spacing": "स्पेसिंग", "star": "स्टार", "status": "स्टेटस", "strong": "स्ट्रॉन्ग",
    "subscribe": "सब्सक्राइब", "sum": "सम", "summarise": "समराइज़", "summary": "समरी", "system": "सिस्टम",
    "tab": "टैब", "table": "टेबल", "tables": "टेबल्स", "thousands": "थाउज़ंड्स", "tick": "टिक",
    "title": "टाइटल", "topic": "टॉपिक", "total": "टोटल", "totals": "टोटल्स", "touch": "टच",
    "transactions": "ट्रांज़ैक्शन्स", "type": "टाइप", "unique": "यूनीक", "unit": "यूनिट", "units": "यूनिट्स",
    "update": "अपडेट", "use": "यूज़", "useful": "यूज़फ़ुल", "validate": "वैलिडेट", "validation": "वैलिडेशन",
    "value": "वैल्यू", "values": "वैल्यूज़", "video": "वीडियो", "view": "व्यू", "visuals": "विज़ुअल्स",
    "west": "वेस्ट", "wise": "वाइज़", "worksheet": "वर्कशीट", "zero": "ज़ीरो", "two": "टू", "five": "फ़ाइव",
    "add": "ऐड", "and": "एंड",
}

_L = r"(?<![A-Za-z])"
_R = r"(?![A-Za-z])"


def apply(text):
    for k in sorted(PHRASES, key=len, reverse=True):
        text = re.sub(_L + re.escape(k) + _R, PHRASES[k], text)
    def w(m):
        return WORDS.get(m.group(0).lower(), m.group(0))
    return re.sub(r"[A-Za-z][A-Za-z\-]*", w, text)


def leftovers(text):
    """English words that would still be spoken with English phonemes."""
    return re.findall(r"[A-Za-z][A-Za-z\-']*", apply(text))
