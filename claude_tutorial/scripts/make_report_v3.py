"""Builds output/QC_report_v3_A4.pdf (A4) and output/UPLOAD_KIT_v3.md for the full episode."""
import json, subprocess, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
qc = json.load(open(ROOT / "output/qc_results_v3.json")); tim = json.load(open(ROOT / "voiceover/narration_timings_v3_hm_omega.json"))
sp = qc["specs"]; ld = qc["loudness"]; SC = {s["id"]: s for s in tim["scenes"]}
def mm(x): return f"{int(x//60)}:{int(x%60):02d}"
CH = [("intro","Intro"),("home","01 Home screen"),("new","02 Sidebar: New"),("search","02 Search"),("projects","02 Projects"),("artifacts","02 Artifacts"),
      ("code","02 Code (Claude Code on the web)"),("customize","02 Customize"),("usage","02 Usage"),("history","02 Chats and tasks"),("account","02 Account & Settings"),
      ("incognito","02 Incognito chat"),("msgbox","03 Message box"),("plus","03 + menu (files)"),("cowork","03 Chat vs Cowork"),("model","04 Model & effort"),
      ("voice","03 Voice & quick starts"),("cc_intro","05 Claude Code: install"),("cc_explain","05 Claude Code: explain a project"),("cc_fix","05 Claude Code: fix a bug"),
      ("cc_modes","05 Permission modes"),("limits","06 Limits & safe use"),("outro","Outro")]
chap = [(0.0 if i == 0 else SC[k]["start"] - 0.3, n) for i, (k, n) in enumerate(CH)]
chap_txt = "\n".join(f"{mm(t)} {n}" for t, n in chap)
qc_rows = "".join(f"<tr><td>{html.escape(c['check'])}</td><td class='{'ok' if c['pass'] else 'bad'}'>{'PASS' if c['pass'] else 'FAIL'}</td><td>{html.escape(c['detail'])}</td></tr>" for c in qc["checks"])
ch_rows = "".join(f"<tr><td>{mm(t)}</td><td>{html.escape(n)}</td></tr>" for t, n in chap)
npass = sum(c["pass"] for c in qc["checks"])
H = f"""<!doctype html><html><head><meta charset="utf-8"><title>Claude AI Guide Ep 01 – Report</title><style>
@page {{ size: A4; margin: 16mm 15mm 16mm 15mm; }}
body {{ font-family: Inter, sans-serif; color:#1b1d23; font-size:10pt; line-height:1.45; }}
h1 {{ font-size:20pt; margin:0 0 2mm }} h2 {{ font-size:13pt; margin:7mm 0 2.5mm; padding-bottom:1.5mm; border-bottom:2px solid #D97757; break-after:avoid }}
.sub {{ color:#5a6070; font-size:10.5pt; margin-bottom:5mm }}
table {{ width:100%; border-collapse:collapse; margin:1mm 0 2mm; font-size:9pt }} tr {{ break-inside:avoid }}
th,td {{ text-align:left; vertical-align:top; padding:1.3mm 2mm; border-bottom:1px solid #e3e5ea }} th {{ background:#f3f4f7 }}
td.ok {{ color:#15803d; font-weight:800 }} td.bad {{ color:#b91c1c; font-weight:800 }}
.box {{ border:1.5px solid #e3e5ea; border-radius:3mm; padding:3mm 4mm; margin:2mm 0 }} .warn {{ border-color:#f59e0b; background:#fffbeb }} .good {{ border-color:#22c55e; background:#f0fdf4 }}
.kpis {{ display:flex; gap:3mm; margin:3mm 0 }} .kpi {{ flex:1; background:#191919; color:#fff; border-radius:3mm; padding:3mm }}
.kpi b {{ display:block; font-size:14pt; color:#D97757 }} .kpi span {{ font-size:8.5pt; color:#c6cde0 }}
code,pre {{ font-family:"JetBrains Mono",monospace; font-size:8.5pt; background:#f3f4f7; border-radius:1mm }} code {{ padding:.3mm 1mm }} pre {{ padding:2mm 3mm; white-space:pre-wrap }}
img {{ width:100%; border-radius:2mm }} ul {{ margin:1mm 0 2mm 5mm; padding:0 }} li {{ margin:.6mm 0 }} .pb {{ break-before:page }}
.cols {{ display:flex; gap:5mm }} .cols > div {{ flex:1 }}
</style></head><body>
<h1>Claude AI Complete Guide — Episode 01 (final video)</h1>
<div class="sub">Interface, tools &amp; Claude Code · Hindi narration, English on-screen text · production &amp; QC report · 24 Oct 2026</div>
<div class="kpis"><div class="kpi"><b>{mm(sp['container_duration'])}</b><span>{sp['container_duration']:.3f} s · {sp['frames']} frames @ 30 fps</span></div>
<div class="kpi"><b>{sp['width']}×{sp['height']}</b><span>H.264 {sp['profile']} · AAC {sp['sample_rate']} Hz</span></div>
<div class="kpi"><b>{ld['integrated_lufs']} LUFS</b><span>true peak {ld['true_peak_dbfs']} dBTP</span></div>
<div class="kpi"><b>{npass}/{len(qc['checks'])} PASS</b><span>automated QC checks</span></div></div>
<div class="box good"><b>What this final video does</b><ul>
<li><b>Explains every option on your real Claude screen:</b> what it is, how to use it, and its limits (New, Search, Projects, Artifacts, Code, Customize, Usage, Chats and tasks, Account/Settings, Incognito, the message box, the + menu, Chat vs Cowork, Model &amp; effort, Voice, quick starts).</li>
<li><b>All on-screen text is English:</b> highlight labels, info cards, steps, notes and the burned-in captions. The spoken narration is Hindi/Hinglish. A Hinglish subtitle file is included as well.</li>
<li><b>Two genuine Claude Code demos</b> (CLI v2.1.310, fictional project): explaining a project (Claude also spotted a bug) and fixing that bug, with the permission system shown for real, a <code>git diff</code> review, and the app working afterwards. Every command on screen is exactly what ran.</li>
<li><b>Accurate:</b> every feature claim was checked against Anthropic's Help Center and Claude Code docs (sources on the last page).</li></ul></div>
<div class="box warn"><b>Please check before publishing</b><ul>
<li>The narration is offline text-to-speech (Kokoro, Hindi voice). I couldn't play it to listen, so pronunciation hasn't been checked by ear. A human voice-over is recommended; use <code>…_music_sfx_only.mp4</code> and the timings in <code>voiceover/narration_v3.md</code>.</li>
<li>Your screen is shown as <b>Pro</b> with <b>Opus 5.5</b>, as you asked. Menus that open (+, model, name) are explained with cards, not shown open, because I don't have screenshots of them.</li>
<li>In the bug demo, the Python traceback shows the build machine's folder path (<code>/tmp/claude-0/demo2/…</code>). It's harmless, but differs from the <code>~/todo-app</code> prompt.</li></ul></div>

<h2>Chapters (for the YouTube description)</h2>
<table><tr><th>Time</th><th>Chapter</th></tr>{ch_rows}</table>

<h2 class="pb">Automated QC (final file)</h2>
<table><tr><th>Check</th><th>Result</th><th>Detail</th></tr>{qc_rows}</table>
<p>Music sits about 19 dB below the narration while speaking (automatic ducking). Captions sit in the bottom band; the camera framing and cards were laid out so they don't cover the explained controls, and in the account scene the captions are shifted right. Visual layout checked on 40+ full-size stills.</p>

<h2>Key frames</h2><img src="{ROOT}/graphics/keyframes_contact_sheet_v3.jpg">

<h2 class="pb">Deliverables</h2>
<table><tr><th>File</th><th>Contents</th></tr>
<tr><td><code>output/claude_ai_full_episode01_v3.mp4</code></td><td><b>Final video</b>: English captions burned in ({sp['size_mb']} MB)</td></tr>
<tr><td><code>output/claude_ai_full_episode01_v3_softsubs.mp4</code></td><td>No burned captions; English + Hinglish subtitle tracks</td></tr>
<tr><td><code>output/claude_ai_full_episode01_v3_music_sfx_only.mp4</code></td><td>No narration, for a human voice-over</td></tr>
<tr><td><code>subtitles/claude_ai_full_episode01_v3.en.srt / .hinglish.srt</code></td><td>Subtitles for YouTube upload</td></tr>
<tr><td><code>output/UPLOAD_KIT_v3.md</code></td><td>Title, description, chapters, tags</td></tr>
<tr><td><code>voiceover/narration_v3.md</code> · <code>storyboard_v3.md</code></td><td>Full script (3 languages) and shot list</td></tr>
<tr><td><code>recordings/claude_code_v3_*.mp4</code></td><td>Genuine raw terminal recordings</td></tr></table>

<h2>Sources (checked 24 Oct 2026)</h2>
<p style="font-size:9pt">support.claude.com articles: Projects 9517075, 9519177 · Artifacts 17153992 · Chat search &amp; memory 11817273 · Incognito 12260368 ·
Cowork 13345190, 16761823 · Model, effort &amp; thinking 8664678 · Upload files 8241126 · Pro plan 8325606 · Usage 12429409 ·
Customize directory 14328846 · Rename/delete chats 8230524 · Settings path 8887527. Claude Code: code.claude.com/docs/en/overview, /web-quickstart, /permissions.</p>
</body></html>"""
(ROOT / "graphics/_report_v3.html").write_text(H, encoding="utf-8")
js = f"""const {{ chromium }} = require('playwright');
(async()=>{{ const b=await chromium.launch(); const p=await b.newPage(); await p.goto('file://{ROOT}/graphics/_report_v3.html');
await p.evaluate(()=>document.fonts.ready); await p.pdf({{path:'{ROOT}/output/QC_report_v3_A4.pdf', format:'A4', printBackground:true,
displayHeaderFooter:true, headerTemplate:'<span></span>', footerTemplate:'<div style="font-size:7pt;width:100%;text-align:center;color:#888">Claude AI Guide Ep 01 · report v3 · page <span class=pageNumber></span>/<span class=totalPages></span></div>',
margin:{{top:'16mm',bottom:'16mm',left:'15mm',right:'15mm'}}}}); await b.close(); }})();"""
pathlib.Path("/tmp/claude-0/pdf3.js").write_text(js); subprocess.run(["node", "/tmp/claude-0/pdf3.js"], check=True)
(ROOT / "graphics/_report_v3.html").unlink()
(ROOT / "output/UPLOAD_KIT_v3.md").write_text(f"""# Upload kit: Claude AI Complete Guide, Episode 01

**File:** `claude_ai_full_episode01_v3.mp4` ({mm(sp['container_duration'])}, 1080p). **Thumbnail:** `graphics/thumbnail_concept_v2_1280x720.png`

## Title (pick one)
1. Claude AI Complete Guide in Hindi | Every Option Explained + Claude Code Demo
2. Claude AI Kaise Use Karein? Full Interface Tutorial (Hindi) | Projects, Artifacts, Cowork, Claude Code
3. Claude AI Tutorial for Beginners (Hindi) | Sidebar, Models, Effort & Real Claude Code Demo

## Description
```
Claude AI ka poora interface step by step, Hindi mein! Har option kya hai, kaise use karte hain, aur uski limitations.
End mein Claude Code ka REAL terminal demo: project explain karna aur ek bug fix karna.

Chapters:
{chap_txt}

Note: Options aapke plan, account aur app version ke hisaab se alag ho sakte hain. Video Pro plan par based hai.
Sources: Anthropic Help Center (support.claude.com) and Claude Code docs (code.claude.com/docs).

#ClaudeAI #ClaudeCode #AITutorial #Hindi #Anthropic
```

## Tags
claude ai, claude ai hindi, claude ai tutorial, how to use claude ai, claude code, claude code tutorial, claude projects, claude artifacts, claude cowork, opus 5.5, ai tutorial hindi, anthropic claude

## Subtitles
Upload `subtitles/claude_ai_full_episode01_v3.en.srt` (English) and `subtitles/claude_ai_full_episode01_v3.hinglish.srt` (Hinglish, as Hindi).
If you upload the main file (English captions already burned in), you can skip uploading the English SRT.
""", encoding="utf-8")
print("report + upload kit written")
