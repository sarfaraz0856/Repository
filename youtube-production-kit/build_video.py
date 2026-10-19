#!/usr/bin/env python3
"""Build a 1080p/30fps animated base video (12:00) from the production kit.
Renders each scene as an HTML -> PNG (Chromium), then ffmpeg adds slow zoom +
fades and concatenates. Audio is a clean silent track (add VO + music in edit)."""
import os, subprocess, textwrap

ROOT = os.path.dirname(os.path.abspath(__file__))
SCN  = os.path.join(ROOT, "video_build", "scenes")
FRM  = os.path.join(ROOT, "video_build", "frames")
CLP  = os.path.join(ROOT, "video_build", "clips")
for d in (SCN, FRM, CLP): os.makedirs(d, exist_ok=True)
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;}
html,body{width:1920px;height:1080px;overflow:hidden;
 font-family:"Segoe UI",system-ui,Arial,"Noto Color Emoji",sans-serif;color:#fff;}
.stage{position:fixed;inset:0;display:flex;flex-direction:column;
 align-items:center;justify-content:center;padding:90px;text-align:center;}
.kicker{font-size:34px;font-weight:800;letter-spacing:6px;text-transform:uppercase;opacity:.85;}
.tc{position:absolute;top:46px;right:60px;font-family:Consolas,monospace;font-size:30px;
 font-weight:700;background:rgba(255,255,255,.16);padding:8px 20px;border-radius:12px;}
.step{position:absolute;top:46px;left:60px;font-size:30px;font-weight:800;
 background:#ffd400;color:#13131f;padding:8px 22px;border-radius:12px;}
h1{font-size:120px;font-weight:900;line-height:1;text-shadow:0 10px 30px rgba(0,0,0,.35);}
h2{font-size:84px;font-weight:900;line-height:1.05;}
.sub{font-size:52px;font-weight:700;margin-top:26px;}
.yellow{color:#ffd400;}
.list{text-align:left;font-size:50px;font-weight:700;line-height:1.7;}
.list div{margin:10px 0;}
.chk{color:#39d98a;}.cross{color:#ff5a5a;}
.card{background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);
 border-radius:28px;padding:40px 54px;margin:16px;font-size:44px;font-weight:700;}
.row{display:flex;gap:30px;align-items:stretch;justify-content:center;flex-wrap:wrap;}
.phone{width:300px;height:600px;border:14px solid rgba(255,255,255,.9);border-radius:46px;
 background:rgba(255,255,255,.1);display:flex;flex-direction:column;align-items:center;
 justify-content:center;gap:24px;}
.rec{font-size:64px;font-weight:900;color:#ff5a5a;}
.dim{font-size:40px;opacity:.9;}
.pill{display:inline-block;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.4);
 border-radius:40px;padding:14px 40px;font-size:40px;font-weight:700;margin:10px;}
.badge{position:absolute;bottom:60px;font-size:34px;opacity:.8;}
table{border-collapse:collapse;font-size:40px;}
td,th{border:2px solid rgba(255,255,255,.35);padding:18px 30px;}
th{background:rgba(255,255,255,.14);}
.safebox{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
 width:1160px;height:320px;border:4px dashed rgba(255,255,255,.75);border-radius:14px;
 display:flex;flex-direction:column;align-items:center;justify-content:center;}
</style></head><body>"""

# Gradients per mood
G_RED   = "background:linear-gradient(135deg,#d31027,#8a0b1c);"
G_BLUE  = "background:linear-gradient(135deg,#1f3a93,#122258);"
G_PURP  = "background:linear-gradient(135deg,#4a1d8f,#6c2bd9);"
G_DARK  = "background:radial-gradient(circle at 50% 30%,#2a2a40,#0d0d16);"
G_GREEN = "background:linear-gradient(135deg,#0f7a43,#0a4d2b);"
G_TEAL  = "background:linear-gradient(135deg,#0b6b74,#083d44);"

def placeholder(step, tc, title, bullets):
    items = "".join(f"<div>• {b}</div>" for b in bullets)
    return G_DARK, f"""
    <div class="step">{step}</div><div class="tc">{tc}</div>
    <div class="row" style="gap:70px;">
      <div class="phone"><div class="rec">▶ REC</div><div style="font-size:44px;">📱</div>
        <div class="dim" style="padding:0 16px;">Your phone<br>screen here</div></div>
      <div style="text-align:left;max-width:1000px;">
        <h2 style="font-size:66px;">{title}</h2>
        <div class="list" style="font-size:42px;margin-top:24px;">{items}</div>
      </div>
    </div>
    <div class="badge">⬆ Replace this panel with your real screen recording</div>"""

# ---- Scene definitions: (dur_seconds, gradient, inner_html) ----
scenes = []
def S(dur, grad, html): scenes.append((dur, grad, html))

# 01 Intro
S(30, G_RED, """
 <div class="kicker">Full HD · Hindi / Hinglish · 2026</div>
 <h1>MOBILE SE<br><span class="yellow">YOUTUBE CHANNEL</span></h1>
 <div class="sub">Kaise Banaye — Step by Step 📱</div>
 <div style="margin-top:40px;"><span class="pill">✔ Channel</span><span class="pill">✔ Naam</span>
 <span class="pill">✔ Photo</span><span class="pill">✔ Banner</span><span class="pill">✔ Settings</span></div>
 <div class="badge">Sirf mobile se — computer ki zaroorat nahi</div>""")

# 02a What you need - checklist
S(23, G_BLUE, """
 <div class="tc">0:30</div><div class="kicker">Aapko Kya Chahiye</div>
 <div class="list" style="font-size:56px;margin-top:30px;">
  <div>📱 Android Smartphone</div><div>🌐 Internet Connection</div>
  <div>📧 Google Account (Gmail)</div><div>▶️ YouTube App</div>
  <div>✍️ Ek achha Channel Naam</div><div style="opacity:.8;">🖼️ Photo + Banner (optional)</div></div>""")
# 02b Google vs Channel
S(22, G_BLUE, """
 <div class="tc">0:55</div>
 <h2>Google Account <span class="yellow">≠</span> YouTube Channel</h2>
 <div class="row" style="margin-top:40px;">
  <div class="card">🔑<br>Google Account<br><span class="dim">= Aapka Login</span></div>
  <div class="card" style="align-self:center;font-size:60px;">➜</div>
  <div class="card">🚪<br>YouTube Channel<br><span class="dim">= Uske andar banta hai</span></div></div>""")

# 03 Install YouTube (placeholder)
g,h = placeholder("STEP 1", "1:15", "Play Store → Install YouTube",
  ["Play Store kholein → search 'YouTube'","Publisher: Google LLC ✅ (official app)",
   "Install / Update par tap karein","App kholein → profile icon (top-right)"]) ; S(45,g,h)

# 04a Sign in (placeholder)
g,h = placeholder("STEP 2", "2:00", "Google Account se Sign In",
  ["Profile icon par tap karein","Sahi Google account choose karein",
   "Sign in nahi? → 'Sign in' par tap","Account nahi? → 'Create account'"]) ; S(42,g,h)
# 04b privacy
S(18, G_RED, """
 <div class="tc">2:45</div><div style="font-size:120px;">🔒</div>
 <h2 style="margin-top:20px;">Privacy Reminder</h2>
 <div class="sub">Apna <span class="yellow">real password / email</span> kabhi record mat karein</div>
 <div class="pill" style="margin-top:30px;">Filming ke liye ek demo account use karein</div>""")

# 05a Create channel (hero placeholder)
g,h = placeholder("STEP 3 ★", "3:00", "YouTube Channel Create Karein",
  ["Profile → 'Your channel'","Channel ka NAAM type karein",
   "Ek HANDLE choose karein (@...)","'Create channel' par tap — ho gaya! 🎉",
   "App me na mile? → browser me youtube.com (Desktop site)"]) ; S(55,g,h)
# 05b example
S(20, G_PURP, """
 <div class="tc">4:00</div><div class="kicker">Example</div>
 <div class="card" style="font-size:56px;margin-top:20px;">Channel Naam:<br><span class="yellow">Smart Learning Hindi</span></div>
 <div class="card" style="font-size:56px;">Handle:<br><span class="yellow">@SmartLearningHindi</span></div>
 <div class="badge">Handle hamesha unique hota hai · availability YouTube decide karta hai</div>""")

# 06a name checklist
S(30, G_TEAL, """
 <div class="tc">4:15</div><h2>Achha Channel Naam Kaise Chunein?</h2>
 <div class="list" style="font-size:50px;margin-top:30px;">
  <div class="chk">✔ Yaad rakhne mein aasaan</div><div class="chk">✔ Bolne mein simple</div>
  <div class="chk">✔ Topic se related</div><div class="chk">✔ Chhota &amp; professional</div>
  <div class="chk">✔ Unique</div></div>""")
# 06b name examples
S(30, G_TEAL, """
 <div class="tc">4:45</div><div class="kicker">Niche ke Examples</div>
 <table style="margin-top:30px;">
  <tr><th>Niche</th><th>Example Naam</th></tr>
  <tr><td>Education</td><td class="yellow">Smart Learning Hindi</td></tr>
  <tr><td>Technology</td><td class="yellow">Tech Gyaan Hindi</td></tr>
  <tr><td>Gaming</td><td class="yellow">GameVeer India</td></tr>
  <tr><td>Vlogging</td><td class="yellow">Daily Life with Raj</td></tr>
  <tr><td>Finance</td><td class="yellow">Paisa Samajh</td></tr></table>""")

# 07a profile pic (placeholder)
g,h = placeholder("STEP 4", "5:15", "Profile Picture Lagayein",
  ["'Your channel' → ✏️ Edit → Profile photo","Gallery se clear image choose karein",
   "Best size: 800 × 800 px (square)","❌ Doosron ka copyright logo use na karein"]) ; S(25,g,h)
# 07b logo large/small
S(20, G_DARK, """
 <div class="tc">5:40</div><div class="kicker">Chhoti size me bhi saaf dikhe</div>
 <div class="row" style="align-items:center;margin-top:30px;gap:80px;">
  <div style="width:260px;height:260px;border-radius:50%;background:linear-gradient(135deg,#d31027,#6c2bd9);
   display:flex;align-items:center;justify-content:center;font-size:120px;font-weight:900;">SL</div>
  <div style="font-size:80px;">➜</div>
  <div style="width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,#d31027,#6c2bd9);
   display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;">SL</div>
  <div class="dim" style="max-width:360px;text-align:left;">Logo comment-size par bhi clear hona chahiye</div></div>""")

# 08 Banner (with safe area)
S(60, G_PURP, """
 <div class="tc">6:00</div><div class="kicker" style="position:absolute;top:120px;">Channel Banner</div>
 <div class="safebox">
   <div style="font-size:30px;opacity:.85;">SAFE AREA · 1546 × 423</div>
   <div style="font-size:72px;font-weight:900;margin-top:8px;">SMART LEARNING HINDI</div>
   <div class="dim">Important text/logo hamesha center me rakhein</div></div>
 <div class="badge" style="bottom:90px;">Upload: 2560 × 1440 px · Safe area: 1546 × 423 px · Max 6 MB</div>""")

# 09 Customize - description
S(60, G_BLUE, """
 <div class="tc">7:00</div><h2>Channel Customize Karein</h2>
 <div style="margin-top:20px;"><span class="pill">Description</span><span class="pill">Photo</span>
 <span class="pill">Banner</span><span class="pill">Links</span><span class="pill">Contact</span></div>
 <div class="card" style="font-size:40px;max-width:1400px;text-align:left;line-height:1.5;margin-top:30px;">
  "Namaste! Smart Learning Hindi mein aapka swagat hai. Yahaan technology, YouTube aur online
  earning ke aasaan tutorials milenge — simple Hindi mein. <span class="yellow">Har hafte nayi video.</span>
  Abhi subscribe kijiye!"</div>
 <div class="badge">Poori customization ke liye: YouTube Studio app / browser desktop mode</div>""")

# 10 Settings
S(60, G_GREEN, """
 <div class="tc">8:00</div><h2>Zaroori Channel Settings</h2>
 <div class="list" style="font-size:46px;margin-top:26px;">
  <div>🌍 Content Visibility — Public</div>
  <div>👶 Audience — "Made for Kids" (<span class="yellow">sach-sach</span> select karein)</div>
  <div>🔒 2-Step Verification — ON karein</div>
  <div>🎛️ YouTube Studio — aapka control room</div>
  <div>✅ Kuch features ke liye verification chahiye</div></div>""")

# 11a Upload (placeholder)
g,h = placeholder("STEP 5", "9:00", "Pehli Video Upload Karein",
  ["YouTube app → ➕ Create → Upload a video","Gallery se video choose karein",
   "Title + Description + Audience set karein","Visibility choose karein → Upload"]) ; S(35,g,h)
# 11b visibility
S(25, G_DARK, """
 <div class="tc">9:35</div><div class="kicker">Visibility Options</div>
 <div class="row" style="margin-top:30px;">
  <div class="card">🔒<br>Private<br><span class="dim">Sirf aap</span></div>
  <div class="card">🔗<br>Unlisted<br><span class="dim">Link waale</span></div>
  <div class="card">🌍<br>Public<br><span class="dim">Sabko dikhegi</span></div></div>
 <div class="badge">Upload se apne-aap views/subscribers/paise nahi aate — consistency zaroori hai</div>""")

# 12 SEO before/after
S(45, G_BLUE, """
 <div class="tc">10:00</div><h2>Basic YouTube SEO</h2>
 <div class="list" style="font-size:40px;margin-top:16px;">
  <div>Clear title · Useful description · Accurate thumbnail · Natural keywords</div></div>
 <div class="card" style="border-color:#ff5a5a;font-size:44px;margin-top:24px;"><span class="cross">❌</span> "My video"</div>
 <div class="card" style="border-color:#39d98a;font-size:44px;"><span class="chk">✅</span> "Mobile Se YouTube Channel Kaise Banaye 2026 — Full Guide"</div>
 <div class="badge">Tags koi jaadu nahi — viral results ki guarantee nahi</div>""")

# 13 Mistakes
S(45, G_RED, """
 <div class="tc">10:45</div><h2>Common Beginner Mistakes</h2>
 <div class="list" style="font-size:40px;margin-top:20px;">
  <div class="cross">❌ Confusing channel naam</div><div class="cross">❌ Copyright content upload</div>
  <div class="cross">❌ Misleading thumbnail</div><div class="cross">❌ Audience setting ignore</div>
  <div class="cross">❌ Private info share karna</div><div class="cross">❌ Fake subscribers/views kharidna</div>
  <div class="cross">❌ Jaldi give up / instant paise ki ummeed</div></div>""")

# 14 Recap + CTA
S(30, G_PURP, """
 <div class="tc">11:30</div><div class="kicker">Recap</div>
 <h2 style="margin-top:16px;">Sign in → Create → Naam + Photo → Customize → Upload</h2>
 <div style="margin-top:40px;font-size:70px;font-weight:900;">👍 LIKE &nbsp; 🔔 SUBSCRIBE &nbsp; ↗️ SHARE</div>
 <div class="sub">Seekhte rahiye, aage badhte rahiye!</div>""")

# ---- Render each scene to PNG, then to a clip ----
total = sum(s[0] for s in scenes)
print(f"{len(scenes)} scenes, total {total}s ({total//60}:{total%60:02d})")
assert total == 720, f"duration must be 720s, got {total}"

clip_list = os.path.join(ROOT, "video_build", "clips.txt")
with open(clip_list, "w") as cf:
    for i,(dur,grad,html) in enumerate(scenes):
        sid = f"s{i:02d}"
        htmlpath = os.path.join(SCN, sid+".html")
        with open(htmlpath,"w") as f:
            f.write(HEAD + f'<div class="stage" style="{grad}">' + html + "</div></body></html>")
        png = os.path.join(FRM, sid+".png")
        subprocess.run([CHROME,"--headless","--no-sandbox","--disable-gpu","--hide-scrollbars",
            "--force-device-scale-factor=1","--window-size=1920,1080",
            f"--screenshot={png}", "file://"+htmlpath], check=True,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # zoom direction alternates
        zexpr = "min(zoom+0.00035,1.09)" if i%2==0 else "if(lte(zoom,1.0),1.09,max(1.001,zoom-0.00035))"
        clip = os.path.join(CLP, sid+".mp4")
        vf = (f"scale=2400:-2,zoompan=z='{zexpr}':d={dur*30}:"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,"
              f"fade=t=in:st=0:d=0.5,fade=t=out:st={dur-0.5}:d=0.5,format=yuv420p")
        subprocess.run(["ffmpeg","-y","-loop","1","-framerate","30","-t",str(dur),
            "-i",png,"-vf",vf,"-c:v","libx264","-preset","medium","-crf","20","-r","30",
            clip], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        cf.write(f"file '{clip}'\n")
        print(f"  {sid}: {dur}s rendered")

# ---- Concat video + add silent audio track ----
silent_concat = os.path.join(ROOT, "video_build", "video_noaudio.mp4")
subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",clip_list,
    "-c","copy", silent_concat], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

out = os.path.join(ROOT, "YouTube-Channel-Tutorial-VIDEO-1080p.mp4")
subprocess.run(["ffmpeg","-y","-i",silent_concat,
    "-f","lavfi","-i","anullsrc=channel_layout=stereo:sample_rate=48000",
    "-c:v","copy","-c:a","aac","-b:a","192k","-shortest",
    "-movflags","+faststart", out], check=True)
print("DONE:", out)
