"""Segment timeline from voice line durations.  python build_timeline.py <voice_dir|--estimate> <out.json>"""
import json, os, sys, wave

HERE = os.path.dirname(os.path.abspath(__file__))
script = json.load(open(f"{HERE}/script.json"))
ORDER = ["A", "B", "C", "D", "E", "F", "G", "F2", "H", "I"]
CARDS = {"A", "F", "F2", "I"}
MIN_SLOT = {  # seconds from a line's start to the next line's start (room for on-screen actions)
    "B": {0: 2.8}, "C": {0: 1.8}, "D": {0: 1.5},
    "E": {1: 2.3, 2: 2.9, 4: 4.7, 5: 1.2, 8: 5.1, 10: 1.7, 11: 2.3, 13: 1.4},
    "G": {0: 1.5}, "H": {1: 1.6, 2: 3.0},
}
GAP, TAIL = 0.42, 0.75
src = sys.argv[1]
idx = 0
segs, flat = {}, []
for name in ORDER:
    n = sum(1 for x in script if x[0] == name)
    lead = 0.35 if name in CARDS else (0.3 if name == "B" else 0.55)
    t, lines = lead, []
    for k in range(n):
        if src == "--estimate":
            d = len(script[idx][1]) / 14.5
        else:
            with wave.open(f"{src}/line_{idx + 1:03d}.wav") as w:
                d = w.getnframes() / w.getframerate()
        lines.append({"start": round(t, 3), "end": round(t + d, 3), "idx": idx, "dur": round(d, 3)})
        t += max(d + GAP, MIN_SLOT.get(name, {}).get(k, 0))
        idx += 1
    dur = round(lines[-1]["end"] + TAIL, 3)
    segs[name] = {"dur": dur, "lines": lines}
off = 0.0
for name in ORDER:
    segs[name]["offset"] = round(off, 3)
    off += segs[name]["dur"]
json.dump({"order": ORDER, "total": round(off, 3), "segments": segs}, open(sys.argv[2], "w"), indent=1, ensure_ascii=False)
print("total", round(off, 1), "s raw ->", round(off / 1.1, 1), "s at 1.1x")
