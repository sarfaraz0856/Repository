"""Build Hinglish SRT + caption JSON (for burned-in captions) from the narration phrase timings."""
import json, sys
tim = json.load(open(sys.argv[1]))["timings"]; srt_out, json_out = sys.argv[2], sys.argv[3]
caps = []
for i, p in enumerate(tim):
    nxt = tim[i + 1]["start"] if i + 1 < len(tim) else 60.0
    hold = min(p["end"] + 0.35, nxt - 0.06, 60.0)
    caps.append({"start": p["start"], "end": p["end"], "hold": round(hold, 3), "text": p["text"]})
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
with open(srt_out, "w") as f:
    for i, c in enumerate(caps, 1):
        f.write(f"{i}\n{ts(c['start'])} --> {ts(c['hold'])}\n{c['text']}\n\n")
json.dump(caps, open(json_out, "w"), indent=1, ensure_ascii=False)
print(len(caps), "captions")
