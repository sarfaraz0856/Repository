"""Builds output/QC_report_A4.pdf (HTML -> PDF via Playwright Chromium) from qc_results.json + narration timings."""
import json, subprocess, html, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
qc = json.load(open(ROOT / "output/qc_results.json")); tim = json.load(open(ROOT / "voiceover/narration_timings_hm_omega.json"))
sp = qc["specs"]; ld = qc["loudness"]
def mmss(x): return f"{int(x//60)}:{x%60:05.2f}"
qc_rows = "".join(f"<tr><td>{html.escape(c['check'])}</td><td class='{'ok' if c['pass'] else 'bad'}'>{'PASS' if c['pass'] else 'FAIL'}</td><td>{html.escape(c['detail'])}</td></tr>" for c in qc["checks"])
nar_rows = "".join(f"<tr><td>{i+1}</td><td>{t['scene']}</td><td>{mmss(t['start'])}–{mmss(t['end'])}</td><td>{html.escape(t['text'])}</td></tr>" for i, t in enumerate(tim["timings"]))
speeds = ", ".join(f"{s['scene']} {s['speed']}×" for s in tim["scenes"])
H = f"""<!doctype html><html><head><meta charset="utf-8"><title>Claude Tutorial Sample – QC Report</title><style>
@page {{ size: A4; margin: 16mm 15mm 16mm 15mm; }}
body {{ font-family: Inter, sans-serif; color:#1b1d23; font-size:10pt; line-height:1.45; }}
h1 {{ font-size:20pt; margin:0 0 2mm; letter-spacing:-.01em }} h2 {{ font-size:13pt; margin:7mm 0 2.5mm; padding-bottom:1.5mm; border-bottom:2px solid #FF6A3D }}
h3 {{ font-size:11pt; margin:4mm 0 1.5mm }}
.sub {{ color:#5a6070; font-size:10.5pt; margin-bottom:5mm }}
table {{ width:100%; border-collapse:collapse; margin:1mm 0 2mm; font-size:9pt; page-break-inside:auto }} tr {{ page-break-inside:avoid }}
th,td {{ text-align:left; vertical-align:top; padding:1.4mm 2mm; border-bottom:1px solid #e3e5ea }} th {{ background:#f3f4f7; font-weight:700 }}
td.ok {{ color:#15803d; font-weight:800 }} td.bad {{ color:#b91c1c; font-weight:800 }}
.box {{ border:1.5px solid #e3e5ea; border-radius:3mm; padding:3mm 4mm; margin:2mm 0 }}
.warn {{ border-color:#f59e0b; background:#fffbeb }} .good {{ border-color:#22c55e; background:#f0fdf4 }}
.kpis {{ display:flex; gap:3mm; margin:3mm 0 }} .kpi {{ flex:1; background:#0B1020; color:#fff; border-radius:3mm; padding:3mm }}
.kpi b {{ display:block; font-size:14pt; color:#FFB547 }} .kpi span {{ font-size:8.5pt; color:#c6cde0 }}
code {{ font-family:"JetBrains Mono",monospace; font-size:8.5pt; background:#f3f4f7; padding:.3mm 1mm; border-radius:1mm }}
img {{ width:100%; border-radius:2mm }} ul {{ margin:1mm 0 2mm 5mm; padding:0 }} li {{ margin:.6mm 0 }}
.pb {{ page-break-before:always }}
</style></head><body>
<h1>Claude AI &amp; Claude Code Tutorial — 60-second sample</h1>
<div class="sub">Sample episode: “Claude AI Interface Explained: Where to Find Every Important Option” · production &amp; QC report · 24 Oct 2026</div>
<div class="kpis">
 <div class="kpi"><b>{sp['container_duration']:.3f} s</b><span>{sp['frames']} frames @ {sp['fps'].split('/')[0]} fps</span></div>
 <div class="kpi"><b>{sp['width']}×{sp['height']}</b><span>H.264 {sp['profile']} · {sp['pix_fmt']}</span></div>
 <div class="kpi"><b>{ld['integrated_lufs']} LUFS</b><span>true peak {ld['true_peak_dbfs']} dBTP · AAC {sp['sample_rate']} Hz</span></div>
 <div class="kpi"><b>{sum(c['pass'] for c in qc['checks'])}/{len(qc['checks'])} PASS</b><span>automated QC checks</span></div>
</div>
<div class="box warn"><b>Read first: what is real and what is not.</b>
<ul><li><b>0:00–0:30 (Claude AI web interface) is an illustrative DEMO UI, not a screen recording.</b> claude.ai is blocked by this
environment's network policy (HTTP 403), and no Claude account is logged in, so the real web interface could not be opened.
The demo layout uses only elements confirmed in Anthropic's Help Center. It carries a "DEMO UI" label on screen the whole time. Replace it with your own recordings before publishing (section 5).</li>
<li><b>0:30–0:43 (Claude Code) is a genuine screen recording:</b> Claude Code CLI v2.1.310 really running in a terminal
(Xvfb + xterm, captured with FFmpeg x11grab) on a fictional demo project. Its Hinglish answer is Claude Code's real, unedited output. The 12 s wait for the response is compressed to 1 s and labelled "Fast-forward".</li>
<li><b>The narration is synthetic</b> (offline Kokoro TTS, Hindi voice <code>hm_omega</code>). I couldn't listen to it, and no speech-recognition model could be downloaded here, so its pronunciation has <b>not</b> been checked by ear. Please review it, or replace it with a human Hindi voice-over (a no-voice version is provided).</li>
<li>Your Claude account wasn't accessed, your screen wasn't recorded, and no private data was used.</li></ul></div>

<h2>1. Environment inspection</h2>
<table><tr><th>Item</th><th>Finding</th><th>Used?</th></tr>
<tr><td>OS / project</td><td>Ubuntu 24.04 cloud container; repo had one earlier project (<code>fact-arcana-short/</code>), left untouched</td><td>—</td></tr>
<tr><td>Claude Code</td><td>CLI v2.1.310 installed and working (<code>claude -p</code> tested on a fictional project)</td><td>Yes: genuine recording</td></tr>
<tr><td>Browser</td><td>Playwright + Chromium pre-installed</td><td>Yes: rendering motion graphics</td></tr>
<tr><td>claude.ai web app</td><td>Blocked by network policy (403); no logged-in account</td><td>No: demo UI used instead</td></tr>
<tr><td>Screen recording</td><td>Xvfb virtual display + xterm + FFmpeg x11grab available</td><td>Yes: terminal recording</td></tr>
<tr><td>FFmpeg</td><td>6.1.1 (libx264, AAC, loudnorm, ebur128, blackdetect, freezedetect)</td><td>Yes</td></tr>
<tr><td>Text-to-speech</td><td>No system TTS. Google/Microsoft TTS and HuggingFace blocked. vidIQ voiceover needs ~14 credits (account has 4). Kokoro TTS (open weights, from GitHub releases) runs offline with 4 Hindi voices</td><td>Yes: Kokoro <code>hm_omega</code></td></tr>
<tr><td>Speech recognition (for QC)</td><td>Whisper model hosts blocked</td><td>No: pronunciation unverified</td></tr>
<tr><td>Graphics / subtitles</td><td>Inter, Inter Display, JetBrains Mono fonts; ImageMagick; Python PIL/numpy; libass</td><td>Yes</td></tr>
<tr><td>Music</td><td>No stock library used. Original music bed generated procedurally (numpy)</td><td>Yes</td></tr></table>

<h2>2. Automated QC (final file)</h2>
<table><tr><th>Check</th><th>Result</th><th>Detail</th></tr>{qc_rows}</table>
<p>Music vs voice: the music sits <b>≈19.9 dB below the narration</b> while speaking (envelope-follower ducking), and percussion drops out during the terminal demo.
A/V sync holds by construction: narration phrases, captions, highlights and clicks are all placed on the same 60 s timeline from the TTS timing file.
Captions are burned into a reserved bottom band. The demo-UI zooms and the terminal window were laid out so no button, menu or terminal output sits under them (checked frame by frame on 20+ stills).</p>
<p><b>Visually checked by me, not by a tool:</b> no captions over buttons or terminal output, text readable at 1080p, highlights land on the right controls.
<b>Not verified:</b> how the TTS voice sounds (see above).</p>

<h2 class="pb">3. Key frames (from the final MP4)</h2>
<img src="{ROOT}/graphics/keyframes_contact_sheet.jpg">
<p style="font-size:8.5pt;color:#5a6070">Frames at 1.5, 4.2, 10.6, 13.2, 17.6, 21.4, 26.0, 28.5, 34.5, 38.0, 40.5, 46.5, 51.0, 54.8, 58.6 and 59.95 s. The last frame is a full end card (no fade to black).</p>
<h3>Thumbnail concept</h3>
<img src="{ROOT}/graphics/thumbnail_concept_1280x720.png" style="width:62%">

<h2 class="pb">4. Narration &amp; subtitles (Hinglish)</h2>
<p>{len(tim['timings'])} caption lines = {len(tim['timings'])} narration phrases. TTS speed per scene: {speeds}. Full Devanagari TTS script and wording changes: <code>voiceover/narration.md</code>. SRT: <code>subtitles/claude_ai_interface_sample_60s.hinglish.srt</code>.</p>
<table><tr><th>#</th><th>Scene</th><th>Time</th><th>Line</th></tr>{nar_rows}</table>
<div class="box"><b>Wording changes from the brief.</b> The brief's lines need about 69 s of natural speech for a 60 s video, so the hook (S1), S3, S5 and S6 lines were shortened
without changing their meaning (e.g. S1 → “Claude AI aur Claude Code ka har option samajhna hai? Toh ye tutorial aapke liye hai!”). Before/after table in <code>narration.md</code>.</div>

<div style="break-inside:avoid"><h2>5. Missing recordings / assets (before publishing)</h2>
<table><tr><th>Needed</th><th>Replaces</th><th>Notes</th></tr>
<tr><td>Real Claude home screen, still (<code>rec_s1_home_clean.mp4</code>)</td><td>0:00–0:06 demo UI</td><td>The edit adds the zoom</td></tr>
<tr><td>Sidebar / New chat / history / initials → Settings (<code>rec_s2_sidebar.mp4</code>)</td><td>0:06–0:18</td><td>Use demo chats only; hide your email and name</td></tr>
<tr><td>"+" menu: Add files or photos, available tools (<code>rec_s3_plus_menu.mp4</code>)</td><td>0:18–0:24</td><td>Note your exact labels; new Claude experience has no web search toggle</td></tr>
<tr><td>Model menu next to send (<code>rec_s3_model_menu.mp4</code>)</td><td>0:24–0:30</td><td>Models differ by plan and admin settings</td></tr>
<tr><td>Human Hindi voice-over (recommended)</td><td>TTS narration</td><td>Record over <code>…_music_sfx_only.mp4</code> using the timings above</td></tr>
<tr><td>Channel logo / brand colours (optional)</td><td>Generic title styling</td><td>No Anthropic logos were used</td></tr></table>
<p>Step-by-step instructions: <code>recording_checklist.md</code>.</p></div>

<h2>6. Interface facts used and their sources</h2>
<table><tr><th>Shown</th><th>Source (Claude Help Center / docs, checked 24 Oct 2026)</th></tr>
<tr><td>"+" button lower-left of the chat box → “Add files or photos”</td><td>support.claude.com · Upload files to Claude (8241126)</td></tr>
<tr><td>“Web search” in the "+" menu; Team/Enterprise owners must enable it; new Claude experience has no toggle</td><td>Enable and use web search (10684626)</td></tr>
<tr><td>Model name next to the send button → model menu, “More models”; admins may hide models</td><td>Change the model, effort, and thinking settings (8664678); Get started with Claude (8114491)</td></tr>
<tr><td>Left sidebar, “Chats and tasks” for full history</td><td>Delete or rename a conversation (8230524)</td></tr>
<tr><td>Initials or name at the bottom-left → Settings</td><td>Customizing your appearance settings (8887527)</td></tr>
<tr><td>Claude Code: terminal / IDE / desktop / web; reads the codebase, edits files, runs commands; needs a subscription or Console account</td><td>code.claude.com/docs/en/overview</td></tr></table>
<p>Not claimed: pricing, exact visual styling, or any menu item that couldn't be confirmed.</p>

<h2>7. Deliverables</h2>
<table><tr><th>File</th><th>Contents</th></tr>
<tr><td><code>output/claude_ai_interface_sample_60s.mp4</code></td><td>Main sample, burned-in captions ({sp['size_mb']} MB)</td></tr>
<tr><td><code>output/claude_ai_interface_sample_60s_clean_softsub.mp4</code></td><td>No burned captions; Hinglish SRT as a selectable track</td></tr>
<tr><td><code>output/claude_ai_interface_sample_60s_music_sfx_only.mp4</code></td><td>No narration, for a human voice-over</td></tr>
<tr><td><code>subtitles/…hinglish.srt</code> · <code>voiceover/narration.md</code> · <code>storyboard.md</code> · <code>recording_checklist.md</code></td><td>Subtitles, narration, shot-by-shot storyboard, recording checklist</td></tr>
<tr><td><code>recordings/claude_code_terminal_raw.mp4</code></td><td>Genuine raw terminal recording (25.8 s)</td></tr>
<tr><td><code>scripts/</code> · <code>graphics/</code> · <code>assets/</code></td><td>All build scripts, scene renderer, thumbnail, demo project, music and SFX stems</td></tr></table>
<p>The full series hasn't been started, as requested.</p>
</body></html>"""
(ROOT / "graphics/_report.html").write_text(H, encoding="utf-8")
js = f"""const {{ chromium }} = require('playwright');
(async()=>{{ const b=await chromium.launch(); const p=await b.newPage(); await p.goto('file://{ROOT}/graphics/_report.html');
await p.evaluate(()=>document.fonts.ready); await p.pdf({{path:'{ROOT}/output/QC_report_A4.pdf', format:'A4', printBackground:true,
displayHeaderFooter:true, headerTemplate:'<span></span>', footerTemplate:'<div style="font-size:7pt;width:100%;text-align:center;color:#888">Claude tutorial sample · QC report · page <span class=pageNumber></span>/<span class=totalPages></span></div>',
margin:{{top:'16mm',bottom:'16mm',left:'15mm',right:'15mm'}}}}); await b.close(); }})();"""
pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/_pdf.js").write_text(js)
subprocess.run(["node", sys.argv[1] if len(sys.argv) > 1 else "/tmp/_pdf.js"], check=True)
(ROOT / "graphics/_report.html").unlink()
print("wrote", ROOT / "output/QC_report_A4.pdf")
