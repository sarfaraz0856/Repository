"""Automated QC for the sample video. Writes output/qc_results.json.
Checks: container/stream specs, exact duration, black frames, frozen frames, loudness/true peak,
voice-vs-music level, caption <-> narration match, SRT timing sanity, and a test decode of every frame.
Usage: python3 qc_check.py <video.mp4> <srt> <narration_timings.json> <out.json>
"""
import json, re, subprocess, sys

video, srt, timings, out = sys.argv[1:5]
R = {"file": video, "checks": []}
def check(name, ok, detail): R["checks"].append({"check": name, "pass": bool(ok), "detail": detail}); print(("PASS " if ok else "FAIL ") + name + " — " + detail)
def run(cmd): return subprocess.run(cmd, capture_output=True, text=True)

p = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video]).stdout)
v = next(s for s in p["streams"] if s["codec_type"] == "video"); a = next(s for s in p["streams"] if s["codec_type"] == "audio")
dur = float(p["format"]["duration"]); vd = float(v["duration"]); ad = float(a["duration"])
nb = int(run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", video]).stdout.strip())
R["specs"] = {"container_duration": dur, "video_duration": vd, "audio_duration": ad, "frames": nb, "width": v["width"], "height": v["height"],
              "fps": v["r_frame_rate"], "vcodec": v["codec_name"], "profile": v.get("profile"), "pix_fmt": v["pix_fmt"],
              "acodec": a["codec_name"], "sample_rate": a["sample_rate"], "channels": a["channels"], "size_mb": round(int(p["format"]["size"]) / 1e6, 2)}
check("Resolution 1920x1080", v["width"] == 1920 and v["height"] == 1080, f'{v["width"]}x{v["height"]}')
check("Frame rate 30 fps", v["r_frame_rate"] == "30/1", v["r_frame_rate"])
check("Video codec H.264 (yuv420p)", v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p", f'{v["codec_name"]} {v.get("profile")} {v["pix_fmt"]}')
check("Audio codec AAC", a["codec_name"] == "aac", f'{a["codec_name"]} {a["sample_rate"]} Hz {a["channels"]} ch')
check("Exactly 1800 frames (60.000 s @ 30 fps)", nb == 1800, f"{nb} frames, video stream {vd:.3f} s")
check("Duration 60 s (±0.05 s)", abs(dur - 60) <= 0.05 and abs(ad - 60) <= 0.05, f"container {dur:.3f} s, audio {ad:.3f} s")

bd = run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "blackdetect=d=0.03:pix_th=0.08", "-an", "-f", "null", "-"]).stderr
blacks = re.findall(r"black_start:(\S+) black_end:(\S+)", bd)
check("No black frames / segments", not blacks, f"{len(blacks)} black segments" + (f": {blacks}" if blacks else ""))
fz = run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "freezedetect=n=0.0005:d=2.5", "-an", "-f", "null", "-"]).stderr
freezes = re.findall(r"freeze_start: (\S+).*?freeze_duration: (\S+)", fz, re.S)
check("No static shot longer than 2.5 s", not freezes, f"{len(freezes)} frozen spans" + (f": {freezes}" if freezes else ""))

eb = run(["ffmpeg", "-hide_banner", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
I = float(re.findall(r"I:\s+(-?\d+\.\d) LUFS", eb)[-1]); TP = float(re.findall(r"Peak:\s+(-?\d+\.\d) dBFS", eb)[-1]); LRA = float(re.findall(r"LRA:\s+(-?\d+\.\d) LU", eb)[-1])
R["loudness"] = {"integrated_lufs": I, "true_peak_dbfs": TP, "lra": LRA}
check("Loudness ≈ -14 LUFS (YouTube)", abs(I + 14) <= 1.0, f"{I} LUFS integrated, LRA {LRA} LU")
check("True peak ≤ -1.0 dBTP", TP <= -1.0, f"{TP} dBTP")

dec = run(["ffmpeg", "-v", "error", "-i", video, "-f", "null", "-"])
check("Full decode without errors", dec.returncode == 0 and not dec.stderr.strip(), "clean" if not dec.stderr.strip() else dec.stderr[:300])

tim = json.load(open(timings))["timings"]
blocks = [b.strip().split("\n") for b in open(srt, encoding="utf-8").read().strip().split("\n\n")]
def sec(x): h, m, s = x.replace(",", ".").split(":"); return int(h) * 3600 + int(m) * 60 + float(s)
srt_items = [(sec(b[1].split(" --> ")[0]), sec(b[1].split(" --> ")[1]), " ".join(b[2:])) for b in blocks]
text_ok = len(srt_items) == len(tim) and all(s[2] == t["text"] for s, t in zip(srt_items, tim))
check("Captions text == narration lines", text_ok, f"{len(srt_items)} captions / {len(tim)} narration phrases")
sync = max(abs(s[0] - t["start"]) for s, t in zip(srt_items, tim))
cover = all(s[1] >= t["end"] for s, t in zip(srt_items, tim))
overlap = any(srt_items[i][1] > srt_items[i + 1][0] for i in range(len(srt_items) - 1))
check("Captions in sync with voice", sync <= 0.05 and cover and not overlap, f"max start offset {sync*1000:.0f} ms; every caption covers its phrase; overlaps: {overlap}")
last = max(t["end"] for t in tim)
check("Narration ends before 60 s", last < 60, f"last word ends {last:.2f} s")
cps = max(len(s[2]) / (s[1] - s[0]) for s in srt_items)
check("Caption reading speed ≤ 21 chars/s", cps <= 21, f"max {cps:.1f} chars/s")
R["all_pass"] = all(c["pass"] for c in R["checks"])
json.dump(R, open(out, "w"), indent=1, ensure_ascii=False)
print("ALL PASS" if R["all_pass"] else "SOME CHECKS FAILED")
