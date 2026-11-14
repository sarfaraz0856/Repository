#!/usr/bin/env python3
"""Put YOUR voice-over onto the Claude AI Ep 01 video (v4), line by line, in sync with the visuals.

Needs only Python 3 (standard library) and FFmpeg/ffprobe on PATH.

Inputs
  --video    claude_ep01_v4_music_only.mp4   (picture + background music/SFX, no voice)
  --script   voiceover_script_v4.json        (beat ids with start/end times)
  --voice    a folder with one audio file per line, named by beat id: i1.wav, i2.mp3, h1.m4a, ...
             (any format FFmpeg reads). A missing line is simply left silent and reported.
  --out      output file, e.g. claude_ep01_final_with_my_voice.mp4
  --captions optional: subtitles .ass file to burn English captions in (claude_ep01_v4.en.ass)

What it does
  1. Places every voice clip at its line's start time.
  2. If a clip is longer than its slot, speeds it up slightly (max 1.15x); if it is much shorter,
     slows it down slightly (min 0.94x) so speech stays continuous. Anything still too long is reported.
  3. Ducks the background music under the voice, normalises loudness to -14 LUFS (YouTube),
     and muxes the result with the original video stream (no video re-encode unless captions are burned).
"""
import argparse, json, os, subprocess, sys, tempfile, glob

EXTS = (".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus", ".webm")
def run(cmd): r = subprocess.run(cmd, capture_output=True, text=True); return r
def dur(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(r.stdout.strip())

ap = argparse.ArgumentParser()
ap.add_argument("--video", required=True); ap.add_argument("--script", required=True)
ap.add_argument("--voice", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--captions"); ap.add_argument("--voice-gain-db", type=float, default=0.0)
a = ap.parse_args()

S = json.load(open(a.script, encoding="utf-8")); beats = S["lines"]; total = S["total_seconds"]
files = {os.path.splitext(os.path.basename(f))[0]: f for f in glob.glob(os.path.join(a.voice, "*")) if f.lower().endswith(EXTS)}
tmp = tempfile.mkdtemp(prefix="voice_")
placed, report = [], []
for b in beats:
    f = files.get(b["id"])
    if not f: report.append(f"MISSING  {b['id']}  (slot {b['slot_seconds']:.1f}s) -> left silent"); continue
    d = dur(f); slot = b["slot_seconds"]
    tempo = 1.0
    if d > slot: tempo = min(d / slot, 1.15)
    elif d < slot * 0.88: tempo = max(d / (slot * 0.97), 0.94)
    out = os.path.join(tmp, b["id"] + ".wav")
    af = f"atempo={tempo:.4f}," if abs(tempo - 1) > 0.005 else ""
    run(["ffmpeg", "-v", "error", "-y", "-i", f, "-af", af + "aresample=48000,aformat=channel_layouts=mono", out])
    nd = dur(out); placed.append((b["start"], out))
    note = "" if nd <= slot + 0.05 else f"  OVERRUNS by {nd - slot:.1f}s (shorten this line or record it a bit faster)"
    report.append(f"ok       {b['id']:<7} clip {d:5.1f}s  slot {slot:5.1f}s  tempo {tempo:.2f}{note}")

if not placed: sys.exit("No voice files found. Name them by line id, e.g. i1.wav, h1.wav ...")
# build the voice track: each clip delayed to its start, then mixed
inputs, filt = [], []
for k, (st, f) in enumerate(placed):
    inputs += ["-i", f]; ms = int(round(st * 1000)); filt.append(f"[{k}:a]adelay={ms}|{ms}[v{k}]")
mix = "".join(f"[v{k}]" for k in range(len(placed)))
filt.append(f"{mix}amix=inputs={len(placed)}:normalize=0:dropout_transition=0,apad,atrim=0:{total},volume={a.voice_gain_db}dB[vo]")
voice = os.path.join(tmp, "voice_track.wav")
r = run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[vo]", "-ar", "48000", voice])
if r.returncode: sys.exit(r.stderr)
# loudness-normalise the voice alone first (-16 LUFS), then duck the music under it and normalise the mix
voice_n = os.path.join(tmp, "voice_norm.wav")
run(["ffmpeg", "-v", "error", "-y", "-i", voice, "-af", "loudnorm=I=-16:TP=-2:LRA=11", "-ar", "48000", voice_n])
mixf = ("[0:a]aresample=48000,aformat=channel_layouts=stereo[bed];[1:a]aformat=channel_layouts=stereo,asplit=2[vo][sc];"
        "[bed][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];"
        "[duck][vo]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")
cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.video, "-i", voice_n, "-filter_complex", mixf, "-map", "0:v:0", "-map", "[a]"]
if a.captions:
    cmd += ["-vf", f"ass={a.captions}", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p"]
else:
    cmd += ["-c:v", "copy"]
cmd += ["-c:a", "aac", "-b:a", "192k", "-t", str(total), "-movflags", "+faststart", a.out]
r = run(cmd)
if r.returncode: sys.exit(r.stderr)
print("\n".join(report)); print(f"\nDone: {a.out}")
