"""v2 report: builds output/QC_report_v2_A4.pdf (HTML -> PDF via Playwright Chromium) from qc_results.json + narration timings."""
import json, subprocess, html, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
qc = json.load(open(ROOT / "output/qc_results_v2.json")); tim = json.load(open(ROOT / "voiceover/narration_timings_v2_hm_omega.json"))
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
<h1>Claude AI &amp; Claude Code Tutorial — 60-second sample (v2)</h1>
<div class="sub">Sample episode: “Claude AI Interface Explained: Where to Find Every Important Option” · production &amp; QC report · 24 Oct 2026</div>
<div class="kpis">
 <div class="kpi"><b>{sp['container_duration']:.3f} s</b><span>{sp['frames']} frames @ {sp['fps'].split('/')[0]} fps</span></div>
 <div class="kpi"><b>{sp['width']}×{sp['height']}</b><span>H.264 {sp['profile']} · {sp['pix_fmt']}</span></div>
 <div class="kpi"><b>{ld['integrated_lufs']} LUFS</b><span>true peak {ld['true_peak_dbfs']} dBTP · AAC {sp['sample_rate']} Hz</span></div>
 <div class="kpi"><b>{sum(c['pass'] for c in qc['checks'])}/{len(qc['checks'])} PASS</b><span>automated QC checks</span></div>
</div>
<div class="box good"><b>What changed in v2 (your feedback: "v1 looked AI-generated")</b>
<ul><li><b>Built on your real Claude screen.</b> The illustrative demo UI from v1 is gone. Every Claude AI shot uses your own home-screen screenshot (sidebar, Chat / Cowork, quick-start chips, greeting) as the base footage, with camera zooms, a cursor, hover states and labels on top.</li>
<li><b>Shown as Pro, per your request.</b> "Sujan · Free" → "Sujan · Pro"; the Free-plan "Free plan · Upgrade" pill and the "Upgrade" badge next to Code were removed; the model selector shows <b>Opus 5.5 · Medium</b>. The original "5.5" and "Medium" pixels were kept, so the label lines up exactly.</li>
<li><b>Styled like Claude:</b> its own dark palette and orange accent, a serif title font similar to the greeting, slim highlight outlines, a Windows-style cursor. No glossy gradients or "demo" badges.</li>
<li><b>Narration rewritten for your screen</b> (New, Search, Projects, Artifacts, Code, the name → Settings menu, +, Chat / Cowork, Opus 5.5) and spoken slower: 1.0–1.16× instead of up to 1.22×.</li>
<li><b>Claude Code (0:34–0:43)</b> is still the genuine CLI recording, unedited apart from a labelled fast-forward of the wait.</li></ul></div>
<div class="box warn"><b>Please check</b>
<ul><li>I assumed the Pro screen looks like your Free screen without the upgrade prompts. If your Pro screen shows something else (e.g. a different item at the top), send a Pro screenshot and I'll match it exactly.</li>
<li>The voice is still offline text-to-speech (Kokoro, Hindi). I couldn't play it to listen, so please review it, or record your own voice over <code>…_v2_music_sfx_only.mp4</code>.</li>
<li>Menus that open (+, model selector, name menu) are only pointed at, not opened, because I don't have screenshots of them yet.</li></ul></div>
<h2>1. Environment inspection</h2>
<table><tr><th>Item</th><th>Finding</th><th>Used?</th></tr>
<tr><td>OS / project</td><td>Ubuntu 24.04 cloud container; repo had one earlier project (<code>fact-arcana-short/</code>), left untouched</td><td>—</td></tr>
<tr><td>Claude Code</td><td>CLI v2.1.310 installed and working (<code>claude -p</code> tested on a fictional project)</td><td>Yes: genuine recording</td></tr>
<tr><td>Browser</td><td>Playwright + Chromium pre-installed</td><td>Yes: rendering motion graphics</td></tr>
<tr><td>claude.ai web app</td><td>Blocked from this environment (403). <b>Your screenshot</b> was used as real footage instead</td><td>Yes: your screenshot</td></tr>
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
Captions are burned into the bottom band. The zooms on your screen and the terminal window were laid out so no button, menu or terminal output sits under a caption (checked on 20 stills).</p>
<p><b>Visually checked by me, not by a tool:</b> no captions over buttons or terminal output, text readable at 1080p, highlights land on the right controls.
<b>Not verified:</b> how the TTS voice sounds (see above).</p>

<h2 class="pb">3. Key frames (from the final MP4)</h2>
<img src="{ROOT}/graphics/keyframes_contact_sheet_v2.jpg">
<p style="font-size:8.5pt;color:#5a6070">16 frames taken from the final v2 MP4, from 0:01.5 to 0:59.95. The last frame is a full end card (no fade to black).</p>
<h3>Thumbnail concept</h3>
<img src="{ROOT}/graphics/thumbnail_concept_v2_1280x720.png" style="width:62%">

<h2 class="pb">4. Narration &amp; subtitles (Hinglish)</h2>
<p>{len(tim['timings'])} caption lines = {len(tim['timings'])} narration phrases. TTS speed per scene: {speeds}. Full Devanagari TTS script: <code>voiceover/narration_v2.md</code>. SRT: <code>subtitles/claude_ai_interface_sample_60s_v2.hinglish.srt</code>.</p>
<table><tr><th>#</th><th>Scene</th><th>Time</th><th>Line</th></tr>{nar_rows}</table>
<div style="break-inside:avoid"><h2>5. Missing recordings / assets (before publishing)</h2>
<table><tr><th>Needed (optional, for the 1–2 min version)</th><th>Why</th></tr>
<tr><td>A screenshot of your Pro home screen</td><td>Confirms the Pro layout exactly (v2 assumes the upgrade prompts are gone)</td></tr>
<tr><td>Screenshots, or a short screen recording, with these menus open: <b>+</b>, the model selector (Opus 5.5 / effort), the name menu → Settings, Customize, Usage</td><td>So the video can show what's inside each menu, not just point at it</td></tr>
<tr><td>A short screen recording of you typing one message and getting a reply</td><td>Real motion footage for "how to chat"</td></tr>
<tr><td>A human Hindi voice-over (recommended)</td><td>More natural than text-to-speech</td></tr></table>
<p>Recording tips: <code>recording_checklist.md</code> (hide your email and private chats).</p></div>

<h2>6. Interface facts used and their sources</h2>
<table><tr><th>Shown</th><th>Source (Claude Help Center / docs, checked 24 Oct 2026)</th></tr>
<tr><td>"+" button lower-left of the chat box → “Add files or photos”</td><td>support.claude.com · Upload files to Claude (8241126)</td></tr>
<tr><td>Model name next to the send button → model menu, “More models”; admins may hide models</td><td>Change the model, effort, and thinking settings (8664678); Get started with Claude (8114491)</td></tr>
<tr><td>Sidebar items, Chat / Cowork, quick-start chips, model + effort label</td><td>Your own screenshot (24 Oct 2026)</td></tr><tr><td>Left sidebar, “Chats and tasks” for full history</td><td>Delete or rename a conversation (8230524)</td></tr>
<tr><td>Initials or name at the bottom-left → Settings</td><td>Customizing your appearance settings (8887527)</td></tr>
<tr><td>Claude Code: terminal / IDE / desktop / web; reads the codebase, edits files, runs commands; needs a subscription or Console account</td><td>code.claude.com/docs/en/overview</td></tr></table>
<p>Not claimed: pricing, exact visual styling, or any menu item that couldn't be confirmed.</p>

<h2>7. Deliverables</h2>
<table><tr><th>File</th><th>Contents</th></tr>
<tr><td><code>output/claude_ai_interface_sample_60s_v2.mp4</code></td><td>v2 main sample, burned-in captions ({sp['size_mb']} MB)</td></tr>
<tr><td><code>output/claude_ai_interface_sample_60s_v2_clean_softsub.mp4</code></td><td>No burned captions; Hinglish SRT as a selectable track</td></tr>
<tr><td><code>output/claude_ai_interface_sample_60s_v2_music_sfx_only.mp4</code></td><td>No narration, for a human voice-over</td></tr>
<tr><td><code>subtitles/…_v2.hinglish.srt</code> · <code>voiceover/narration_v2.md</code> · <code>storyboard_v2.md</code></td><td>Subtitles, narration, shot-by-shot storyboard, recording checklist</td></tr>
<tr><td><code>recordings/claude_code_terminal_raw.mp4</code></td><td>Genuine raw terminal recording (25.8 s)</td></tr>
<tr><td><code>scripts/</code> · <code>graphics/</code> · <code>assets/</code></td><td>All build scripts, scene renderer, thumbnail, demo project, music and SFX stems</td></tr></table>
<p>v1 files are kept for comparison. The 1–2 minute version and the full series haven't been started; they wait for your OK on this sample.</p>
</body></html>"""
(ROOT / "graphics/_report_v2.html").write_text(H, encoding="utf-8")
js = f"""const {{ chromium }} = require('playwright');
(async()=>{{ const b=await chromium.launch(); const p=await b.newPage(); await p.goto('file://{ROOT}/graphics/_report_v2.html');
await p.evaluate(()=>document.fonts.ready); await p.pdf({{path:'{ROOT}/output/QC_report_v2_A4.pdf', format:'A4', printBackground:true,
displayHeaderFooter:true, headerTemplate:'<span></span>', footerTemplate:'<div style="font-size:7pt;width:100%;text-align:center;color:#888">Claude tutorial sample · QC report v2 · page <span class=pageNumber></span>/<span class=totalPages></span></div>',
margin:{{top:'16mm',bottom:'16mm',left:'15mm',right:'15mm'}}}}); await b.close(); }})();"""
pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/_pdf.js").write_text(js)
subprocess.run(["node", sys.argv[1] if len(sys.argv) > 1 else "/tmp/_pdf.js"], check=True)
(ROOT / "graphics/_report_v2.html").unlink()
print("wrote", ROOT / "output/QC_report_v2_A4.pdf")
