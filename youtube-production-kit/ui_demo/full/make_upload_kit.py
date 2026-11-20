#!/usr/bin/env python3
"""After make_*.py has built a video: write YouTube upload extras from <OUT>/lines.json + chapters.json.
  subtitles_hi.srt / subtitles_en.srt : upload as closed captions (helps search + accessibility; nothing burned in)
  chapters.txt                        : paste into the description (first stamp must be 0:00)
Usage: python make_upload_kit.py <OUT dir> <dest dir>"""
import json, os, re, sys

src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
lines = json.load(open(os.path.join(src, "lines.json"))); chapters = json.load(open(os.path.join(src, "chapters.json")))

def chunks(text, maxc):
    """Split at sentence / clause marks, then wrap anything still too long at word boundaries."""
    parts = [p.strip() for p in re.split(r"(?<=[।?!.,;:—])\s+", text) if p.strip()]
    out = []
    for p in parts:
        words, cur = p.split(), ""
        for w in words:
            if cur and len(cur) + 1 + len(w) > maxc: out.append(cur); cur = w
            else: cur = (cur + " " + w).strip()
        if cur: out.append(cur)
    merged = []
    for c in out:  # glue very short tails onto the previous cue
        if merged and len(c) < 12 and len(merged[-1]) + len(c) < maxc + 10: merged[-1] += " " + c
        else: merged.append(c)
    return merged

def ts(x):
    h, m, s = int(x // 3600), int(x % 3600 // 60), x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}"

for key, maxc in (("hi", 48), ("en", 42)):
    cues = []
    for ln in lines:
        cs = chunks(ln[key], maxc); total = sum(len(c) for c in cs); t = ln["s"]; span = ln["e"] - ln["s"]
        for c in cs:
            d = span * len(c) / total; cues.append((t, t + d, c)); t += d
    with open(os.path.join(dst, f"subtitles_{key}.srt"), "w", encoding="utf-8") as f:
        for i, (a, b, c) in enumerate(cues, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{c}\n\n")
    print(key, len(cues), "cues")

with open(os.path.join(dst, "chapters.txt"), "w", encoding="utf-8") as f:
    for i, c in enumerate(chapters):
        t = 0 if i == 0 else c["t"]
        f.write(f"{int(t // 60)}:{int(t % 60):02d} {c['title']}\n")
print(open(os.path.join(dst, "chapters.txt")).read())
