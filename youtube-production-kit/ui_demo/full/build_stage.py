#!/usr/bin/env python3
"""Builds full_stage.html: the v3 look (iPhone frame, cream bg, English panel) plus all screens
needed for the full tutorial, driven by a data timeline (timeline.js -> window.TL)."""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
v3 = open(os.path.join(HERE, "..", "ui_sample_v3.html"), encoding="utf-8").read()
style = v3[v3.index("<style>") + 7: v3.index("</style>")]
m = re.search(r'<div class="sb" style="color:#0f0f0f"><span>10:31</span>(<span class="ic">.*?</svg></span>)</div>', v3, re.S)
IOS = m.group(1)
def SB(time="10:31", color="#0f0f0f"): return f'<div class="sb" style="color:{color}"><span>{time}</span>{IOS}</div>'
def grab(id_):  # copy an existing screen block from v3
    a = v3.index(f'<div class="scr" id="{id_}"'); depth = 0; i = a
    while True:
        o = v3.find("<div", i); c = v3.find("</div>", i)
        if o != -1 and o < c: depth += 1; i = o + 4
        else:
            depth -= 1; i = c + 6
            if depth == 0: return v3[a:i]
home, splash, feed, you, sheet, channel = [grab(x) for x in ["home", "splash", "feed", "you", "sheet", "channel"]]
# --- adapt existing screens ---
you = you.replace('<div class="nav" id="nav2"></div>', '''<div class="nav" id="nav2"></div>
  <div class="full ov" id="acctov"><div class="dim"></div><div class="bsheet" id="acctsheet" style="top:488px">
   <div class="grab"></div><div class="bst">Accounts</div>
   <div class="arow" style="top:60px"><span class="aav" style="background:#7b1fa2">R</span><div><b>Rahul Sharma</b><br><small>rahul.sharma•••@gmail.com</small></div><span class="tick">✓</span></div>
   <div class="arow" style="top:130px"><span class="aav" style="background:#00897b">P</span><div><b>Priya Studio</b><br><small>priya•••@gmail.com</small></div></div>
   <div class="arow" style="top:200px"><span class="aav" style="background:#e8eaed;color:#444">+</span><div>Add account</div></div>
   <div class="arow" style="top:262px"><span class="aav" style="background:#e8eaed;color:#444">⎋</span><div>Use YouTube signed out</div></div>
  </div></div>''')
sheet = sheet.replace('<div class="help" id="hhelp" style="top:446px"></div>', '<div class="help" id="hhelp" style="top:446px"></div>')
sheet = sheet.replace('<span id="vname"></span>', '<span id="v_name"></span>').replace('<span id="vhandle"></span>', '<span id="v_handle"></span>')
channel = channel.replace('<div class="chav">S</div>', '<div class="chav" style="background:#7b1fa2">R</div>')
feed = feed.replace('<div class="nav" id="nav1"></div>', '''<div class="nav" id="nav1"></div>
  <div class="full ov" id="cmenuov"><div class="dim"></div><div class="bsheet" style="top:578px">
   <div class="grab"></div><div class="bst">Create</div>
   <div class="mrow" style="top:58px"><span class="mic">▶</span>Create a Short</div>
   <div class="mrow" style="top:116px"><span class="mic">⬆</span>Upload a video</div>
   <div class="mrow" style="top:174px"><span class="mic">◉</span>Go live</div>
   <div class="mrow" style="top:232px"><span class="mic">✎</span>Create a post</div>
  </div></div>''')

TOPB = lambda title, right="": f'<div class="top tb"><span class="back">←</span><span class="tbt">{title}</span><span class="tbr">{right}</span></div>'
new_screens = f'''
 <!-- SEARCH -->
 <div class="scr" id="search" style="background:#fff">{SB("10:30")}
  <div class="top"><span class="back">←</span><div class="sbox"><span id="v_q"></span><span class="caret" id="c_q"></span><span class="ph" id="ph_q">Search YouTube</span></div><span style="font-size:20px">🎙️</span></div>
  <div id="sres" style="position:absolute;left:0;right:0;top:0;bottom:0">
   <div class="crow" style="top:106px"><span class="cav" style="background:#e53935">T</span><div class="cinfo"><b>Tech Tips Hindi</b><small>@TechTipsHindi · 85K subscribers</small></div><span class="subb">Subscribe</span></div>
   <div class="card" style="top:190px"><div class="thumb" style="background:linear-gradient(135deg,#29b6f6,#1565c0)"><span class="dur">9:42</span></div>
    <div class="meta"><div class="av" style="background:#6d4c41">S</div><div><div class="tt">5 Phone Settings Every Student Should Change</div><div class="st">Smart Tech Guru · 1.2L views · 2 weeks ago</div></div></div></div>
   <div class="crow" style="top:520px"><span class="cav" style="background:#3949ab">L</span><div class="cinfo"><b>Learn Tech Hindi</b><small>@LearnTechHindi · 22K subscribers</small></div><span class="subb">Subscribe</span></div>
   <div class="card" style="top:604px"><div class="thumb" style="background:linear-gradient(135deg,#ffb74d,#e65100)"></div></div>
  </div>
 </div>

 <!-- OTHER CHANNEL -->
 <div class="scr" id="otherch" style="background:#fff">{SB("10:30")}
  <div class="top"><span class="back">←</span><div class="icons" id="ocicons"></div></div>
  <div class="obanner"><b>TECH TIPS HINDI</b><span>New videos every Monday</span></div>
  <div class="chav" style="top:158px;background:#e53935">T</div>
  <div class="chname" style="top:160px">Tech Tips Hindi</div>
  <div class="ohandle">@TechTipsHindi</div>
  <div class="chsub" style="top:214px">85K subscribers · 320 videos</div>
  <div class="osub">Subscribe</div>
  <div class="tabs" style="top:300px"><div class="on">Home</div><div>Videos</div><div>Shorts</div><div>Playlists</div><div>Posts</div></div>
  <div class="card" style="top:352px"><div class="thumb" style="background:linear-gradient(135deg,#66bb6a,#1b5e20)"><span class="dur">11:05</span></div></div>
 </div>

 <!-- EDIT CHANNEL -->
 <div class="scr" id="edit" style="background:#fff">{SB("10:33")}
  {TOPB("Edit channel")}
  <div class="ebanner" id="ebanner"><span class="ecam" style="right:16px;top:12px">📷</span></div>
  <div class="eav" id="eav"><span id="eavtxt">R</span><span class="ecam" style="right:-4px;bottom:0">📷</span></div>
  <div class="erow" style="top:290px"><small>Name</small><span>Smart Learning Hindi</span><i>✎</i></div>
  <div class="erow" style="top:354px"><small>Handle</small><span>@SmartLearningHindi</span><i>✎</i></div>
  <div class="erow" style="top:418px"><small>Description</small><span id="edesc" class="grey">Add description</span><i>✎</i></div>
  <div class="erow" style="top:482px"><small>Links</small><span class="grey">Add links</span><i>✎</i></div>
  <div class="erow" style="top:546px"><small>Contact info</small><span class="grey">Add a business email</span><i>✎</i></div>
 </div>

 <!-- GALLERY -->
 <div class="scr" id="gallery" style="background:#fff">{SB("10:33")}
  <div class="top tb"><span class="back">✕</span><span class="tbt">Recents ▾</span><span class="tbr"></span></div>
  <div id="ggrid"></div>
 </div>

 <!-- CROP PROFILE -->
 <div class="scr" id="crop" style="background:#000">{SB("10:34","#fff")}
  <div class="top tb dark"><span class="back" style="color:#fff">Cancel</span><span class="tbt" style="color:#fff">Move and scale</span><span class="tbr sv">Save</span></div>
  <div class="cropimg" id="cropimg"><div class="logo big">SL<small>HINDI</small></div></div>
  <div class="cropmask"></div>
 </div>

 <!-- CROP BANNER -->
 <div class="scr" id="bcrop" style="background:#111">{SB("10:34","#fff")}
  <div class="top tb dark"><span class="back" style="color:#fff">Cancel</span><span class="tbt" style="color:#fff">Preview</span><span class="tbr sv">Save</span></div>
  <div class="bprev"><div class="bimg"><b>SMART LEARNING HINDI</b><span>Tech · YouTube · Online Earning</span></div><div class="safe"><em>Visible on all devices</em></div></div>
  <div class="devs"><span>📺 TV</span><span>💻 Desktop</span><span>📱 Mobile</span></div>
 </div>

 <!-- DESCRIPTION -->
 <div class="scr" id="desc" style="background:#fff">{SB("10:35")}
  <div class="top tb"><span class="back">←</span><span class="tbt">Description</span><span class="tbr sv2">Save</span></div>
  <div class="tarea"><span id="v_desc"></span><span class="caret" id="c_desc"></span></div>
  <div class="cnt" id="dcnt">0/1000</div>
  <div class="kbd" id="kbd"></div>
 </div>

 <!-- CHANNEL CUSTOMIZED -->
 <div class="scr" id="channel2" style="background:#fff">{SB("10:36")}
  <div class="top"><div style="font-size:24px;color:#0f0f0f">←</div><div class="icons" id="ch2icons"></div></div>
  <div class="cbanner"><b>SMART LEARNING HINDI</b><span>Tech · YouTube · Online Earning</span></div>
  <div class="logo sm" style="position:absolute;left:16px;top:196px">SL<small>HINDI</small></div>
  <div class="chname" style="top:198px;left:110px">Smart Learning Hindi</div>
  <div class="chsub" style="top:228px;left:110px">@SmartLearningHindi<br>No subscribers · No videos</div>
  <div class="c2desc">Namaste! Smart Learning Hindi par aapko technology aur YouTube ke… <b>more</b></div>
  <div class="c2link">instagram.com/smartlearninghindi</div>
  <div class="mng" style="top:340px"><div>Manage videos</div><div class="ed">✏️</div></div>
  <div class="tabs" style="top:390px"><div class="on">Home</div><div>Videos</div><div>Shorts</div><div>Playlists</div><div>Posts</div></div>
  <div class="empty" style="top:470px"><div class="ill">🎬</div><h4>Create content on any device</h4><p>Upload and record at home or on the go.</p></div>
  <div class="nav" id="nav4"></div><div class="gest"></div>
 </div>

 <!-- GOOGLE SECURITY -->
 <div class="scr" id="security" style="background:#fff">{SB("10:37")}
  <div class="top tb"><span class="back">✕</span><span class="tbt">Google Account</span><span class="tbr"><span class="aav sm" style="background:#7b1fa2">R</span></span></div>
  <div class="gtabs"><span>Home</span><span>Personal info</span><span class="on">Security</span><span>Data</span></div>
  <div class="gh">How you sign in to Google</div>
  <div class="gcard">
   <div class="grow"><span>🛡️</span><div><b>2-Step Verification</b><small id="svst">Off</small></div><i>›</i></div>
   <div class="grow"><span>🔑</span><div><b>Password</b><small>Last changed Jan 12</small></div><i>›</i></div>
   <div class="grow"><span>📱</span><div><b>Recovery phone</b><small>+91 ••••• ••321</small></div><i>›</i></div>
  </div>
  <div class="toast" id="svtoast">✓ 2-Step Verification is on</div>
 </div>

 <!-- STUDIO FEATURE ELIGIBILITY -->
 <div class="scr" id="studio" style="background:#f9f9f9">{SB("10:38")}
  <div class="top tb" style="background:#fff"><span class="back">←</span><span class="tbt">Feature eligibility</span><span class="tbr"></span></div>
  <div class="fcard" style="top:92px"><b>Standard features</b><span class="ok">✓ Enabled</span><p>Upload videos, create playlists, add Shorts</p></div>
  <div class="fcard" style="top:200px;height:170px"><b>Intermediate features</b><span id="imst" class="pend">Requires phone verification</span>
   <p>Videos longer than 15 minutes · Custom thumbnails · Live streaming</p><div class="vbtn" id="vbtn">Verify phone number</div></div>
  <div class="fcard" style="top:386px"><b>Advanced features</b><span class="pend">Requires more verification</span><p>Higher daily limits, extra features</p></div>
  <div class="toast" id="vtoast">✓ Phone number verified</div>
 </div>

 <!-- ADD DETAILS -->
 <div class="scr" id="details" style="background:#fff">{SB("10:39")}
  <div class="top tb"><span class="back">←</span><span class="tbt">Add details</span><span class="tbr"><span class="nextb">Next</span></span></div>
  <div class="vprev"><span>▶</span></div>
  <div class="dfld" style="top:306px"><small>Title</small><span id="v_vtitle"></span><span class="caret" id="c_vtitle"></span><span class="ph" id="ph_vtitle">Create a title</span></div>
  <div class="dfld" style="top:376px;height:62px"><small>Description</small><span id="v_vdesc"></span><span class="caret" id="c_vdesc"></span><span class="ph" id="ph_vdesc">Add description</span></div>
  <div class="drow" style="top:458px"><span>👁️</span>Visibility<b id="visval">Public</b></div>
  <div class="drow" style="top:510px"><span>📍</span>Location<b></b></div>
  <div class="drow" style="top:562px"><span>☰</span>Add to playlists<b></b></div>
  <div class="drow" style="top:614px"><span>💬</span>Comments<b>On</b></div>
  <div class="full ov" id="visov"><div class="dim"></div><div class="bsheet" style="top:538px">
   <div class="grab"></div><div class="bst">Visibility</div>
   <div class="vrow" style="top:56px" id="vr_Public"><i></i><div><b>Public</b><small>Everyone can watch your video</small></div></div>
   <div class="vrow" style="top:126px" id="vr_Unlisted"><i></i><div><b>Unlisted</b><small>Anyone with the video link can watch</small></div></div>
   <div class="vrow" style="top:196px" id="vr_Private"><i></i><div><b>Private</b><small>Only you can watch</small></div></div>
  </div></div>
 </div>

 <!-- AUDIENCE -->
 <div class="scr" id="audience" style="background:#fff">{SB("10:39")}
  {TOPB("Select audience")}
  <div class="aq">Is this video made for kids? (required)</div>
  <div class="atx">You're legally required to tell us whether your videos are made for kids, no matter where you're located.</div>
  <div class="vrow plain" style="top:250px" id="ar_yes"><i></i><div><b>Yes, it's made for kids</b></div></div>
  <div class="vrow plain" style="top:306px" id="ar_no"><i></i><div><b>No, it's not made for kids</b></div></div>
  <div class="upb">Upload video</div>
 </div>

 <!-- YOUR VIDEOS / UPLOADING -->
 <div class="scr" id="uploads" style="background:#fff">{SB("10:40")}
  {TOPB("Your videos")}
  <div class="uprow"><div class="upth">▶</div><div class="upinfo"><b>Mobile Se YouTube Channel Kaise Banaye 2026</b><small id="upst">Uploading… 0%</small><div class="pbar"><div id="pfill"></div></div></div></div>
 </div>
'''

extra_css = r'''
.scr>:not(.sb):not(#loading):not(.full){transform:translateY(18px);}
.full{position:absolute;inset:0;}
.ov{opacity:0;z-index:30}
.ov .dim{position:absolute;inset:0;background:rgba(0,0,0,.45)}
.bsheet{position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:18px 18px 0 0}
.grab{width:40px;height:4px;border-radius:2px;background:#ccc;margin:10px auto 0}
.bst{position:absolute;left:24px;top:24px;font-size:18px;font-weight:700;color:#0f0f0f}
.arow{position:absolute;left:20px;right:20px;height:56px;display:flex;align-items:center;gap:14px;font-size:15px;color:#0f0f0f}
.arow small{color:#606060;font-size:12.5px}
.aav{width:38px;height:38px;border-radius:50%;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none}
.aav.sm{width:28px;height:28px;font-size:13px}
.tick{margin-left:auto;color:#065fd4;font-weight:800;font-size:18px}
.mrow{position:absolute;left:24px;right:24px;height:44px;display:flex;align-items:center;gap:18px;font-size:16px;color:#0f0f0f}
.mic{width:36px;height:36px;border-radius:50%;background:#f2f2f2;display:flex;align-items:center;justify-content:center;font-size:15px}
.tb{justify-content:flex-start;gap:16px}
.back{font-size:22px;color:#0f0f0f;min-width:22px}
.tbt{font-size:18px;font-weight:700;color:#0f0f0f}
.tbr{margin-left:auto;display:flex;align-items:center}
.sv{color:#3ea6ff;font-weight:700;font-size:16px}
.sv2{color:#065fd4;font-weight:700;font-size:16px}
.sbox{flex:1;margin:0 12px;height:38px;border-radius:19px;background:#f2f2f2;display:flex;align-items:center;padding:0 16px;font-size:15px;color:#0f0f0f;position:relative}
.ph{color:#909090}
.crow{position:absolute;left:16px;right:16px;height:70px;display:flex;align-items:center;gap:14px}
.cav{width:64px;height:64px;border-radius:50%;color:#fff;font-weight:700;font-size:26px;display:flex;align-items:center;justify-content:center;flex:none}
.cinfo{display:flex;flex-direction:column;font-size:16px;color:#0f0f0f;gap:3px}.cinfo small{font-size:12.5px;color:#606060}
.subb{margin-left:auto;background:#0f0f0f;color:#fff;border-radius:18px;padding:8px 14px;font-size:13px;font-weight:600}
.obanner{position:absolute;left:12px;right:12px;top:58px;height:88px;border-radius:12px;background:linear-gradient(120deg,#b71c1c,#e53935 60%,#ff7043);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}
.obanner b{font-size:22px;letter-spacing:1px}.obanner span{font-size:11px;opacity:.9}
.ohandle{position:absolute;left:116px;top:190px;font-size:14px;font-weight:600;color:#0f0f0f}
.osub{position:absolute;left:16px;right:16px;top:252px;height:36px;border-radius:18px;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600}
.ebanner{position:absolute;left:0;right:0;top:80px;height:120px;background:#e9e9ee;overflow:hidden}
.ebanner.on{background:linear-gradient(120deg,#1f3a93,#4a1d8f 55%,#6c2bd9)}
.ebanner.on:before{content:"SMART LEARNING HINDI";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px;letter-spacing:1px}
.ecam{position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,.2)}
.eav{position:absolute;left:156px;top:156px;width:100px;height:100px;border-radius:50%;background:#7b1fa2;color:#fff;font-size:44px;display:flex;align-items:center;justify-content:center;border:4px solid #fff}
.erow{position:absolute;left:0;right:0;height:64px;border-bottom:1px solid #eee;padding:10px 56px 0 20px;display:flex;flex-direction:column;font-size:16px;color:#0f0f0f;overflow:hidden;white-space:nowrap}
.erow small{font-size:12px;color:#606060;margin-bottom:3px}.erow i{position:absolute;right:20px;top:22px;font-style:normal;color:#606060}
.grey{color:#909090}
.cell{position:absolute;width:136px;height:136px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.cell .dur{position:absolute;right:6px;bottom:6px}
.logo{border-radius:50%;background:linear-gradient(135deg,#d31027,#8a0b1c);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;border:3px solid #fff;box-shadow:0 0 0 1px #ddd}
.logo small{color:#ffd400;font-weight:800;letter-spacing:2px}
.logo.big{width:330px;height:330px;font-size:150px;line-height:.85;border-width:8px}.logo.big small{font-size:28px}
.logo.sm{width:80px;height:80px;font-size:34px;line-height:.85}.logo.sm small{font-size:9px;letter-spacing:1px}
.logo.md{width:100px;height:100px;font-size:42px;line-height:.85}.logo.md small{font-size:10px}
.cropimg{position:absolute;left:41px;top:250px;width:330px;height:330px;display:flex;align-items:center;justify-content:center}
.cropmask{position:absolute;left:0;right:0;top:160px;height:510px;background:radial-gradient(circle at 50% 50%,transparent 0,transparent 160px,rgba(0,0,0,.6) 161px);pointer-events:none}
.cropmask:after{content:"";position:absolute;left:46px;top:95px;width:320px;height:320px;border-radius:50%;border:2px solid rgba(255,255,255,.9)}
.top.dark{background:transparent}
.bprev{position:absolute;left:0;right:0;top:250px;height:232px}
.bimg{position:absolute;inset:0;background:linear-gradient(120deg,#1f3a93,#4a1d8f 55%,#6c2bd9);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}
.bimg b{font-size:21px;letter-spacing:1px}.bimg span{font-size:10px;opacity:.9;margin-top:3px}
.safe{position:absolute;left:81px;top:82px;width:249px;height:68px;border:2px dashed #ffd400;border-radius:4px}
.safe em{position:absolute;top:-22px;left:0;right:0;text-align:center;color:#ffd400;font-size:11px;font-style:normal;font-weight:700}
.devs{position:absolute;left:0;right:0;top:520px;display:flex;justify-content:center;gap:22px;color:#ddd;font-size:14px}
.tarea{position:absolute;left:16px;right:16px;top:84px;height:300px;border:2px solid #065fd4;border-radius:10px;padding:14px;font-size:15px;line-height:1.5;color:#0f0f0f;white-space:pre-wrap}
.cnt{position:absolute;right:20px;top:392px;font-size:12px;color:#606060}
.kbd{position:absolute;left:0;right:0;top:620px;height:292px;background:#d1d4db;padding:10px 4px}
.kr{display:flex;justify-content:center;gap:6px;margin:8px 0}.kr span{height:42px;flex:0 0 33px;background:#fff;border-radius:6px;box-shadow:0 1px 0 #999;display:flex;align-items:center;justify-content:center;font-size:18px;color:#111}
.kr span.w{flex:0 0 190px}.kr span.g{background:#adb2bc;flex:0 0 44px;font-size:13px}
.cbanner{position:absolute;left:12px;right:12px;top:62px;height:110px;border-radius:12px;background:linear-gradient(120deg,#1f3a93,#4a1d8f 55%,#6c2bd9);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cbanner b{font-size:21px;letter-spacing:1px}.cbanner span{font-size:10px;opacity:.9;margin-top:3px}
.c2desc{position:absolute;left:16px;right:16px;top:284px;font-size:13px;color:#606060;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.c2desc b{color:#0f0f0f}
.c2link{position:absolute;left:16px;top:306px;font-size:13px;color:#065fd4;font-weight:500}
.gtabs{position:absolute;left:0;right:0;top:84px;display:flex;gap:22px;padding:0 20px;border-bottom:1px solid #e0e0e0;font-size:14px;color:#5f6368;font-weight:500}
.gtabs span{padding:10px 0}.gtabs .on{color:#1a73e8;border-bottom:3px solid #1a73e8}
.gh{position:absolute;left:20px;top:146px;font-size:20px;color:#202124}
.gcard{position:absolute;left:16px;right:16px;top:186px;border:1px solid #dadce0;border-radius:12px;overflow:hidden}
.grow{display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid #eee;font-size:15px;color:#202124}
.grow div{display:flex;flex-direction:column}.grow small{font-size:13px;color:#5f6368;margin-top:2px}.grow i{margin-left:auto;font-style:normal;color:#5f6368;font-size:20px}
.grow small.on{color:#188038;font-weight:600}
.toast{position:absolute;left:24px;right:24px;top:800px;background:#323232;color:#fff;border-radius:10px;padding:13px 16px;font-size:14px;opacity:0}
.fcard{position:absolute;left:16px;right:16px;height:96px;background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:14px 16px}
.fcard b{font-size:16px;color:#0f0f0f;display:block}.fcard p{font-size:12.5px;color:#606060;margin-top:6px}
.fcard span{font-size:13px;font-weight:600;display:block;margin-top:4px}
.ok{color:#188038}.pend{color:#b06000}
.vbtn{position:absolute;left:16px;top:116px;background:#065fd4;color:#fff;border-radius:18px;padding:8px 18px;font-size:14px;font-weight:600}
.nextb{background:#065fd4;color:#fff;border-radius:16px;padding:6px 16px;font-size:14px;font-weight:600}
.vprev{position:absolute;left:0;right:0;top:80px;height:206px;background:linear-gradient(135deg,#ef5350,#880e4f);display:flex;align-items:center;justify-content:center;color:#fff;font-size:44px}
.dfld{position:absolute;left:16px;right:16px;height:54px;border:1px solid #ccc;border-radius:8px;padding:6px 12px;font-size:15px;color:#0f0f0f;overflow:hidden;line-height:1.35}
.dfld small{display:block;font-size:11px;color:#606060}
.drow{position:absolute;left:0;right:0;height:50px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:16px;padding:0 20px;font-size:15px;color:#0f0f0f}
.drow b{margin-left:auto;font-weight:500;color:#606060}
.vrow{position:absolute;left:20px;right:20px;height:56px;display:flex;align-items:center;gap:16px;font-size:15px;color:#0f0f0f}
.vrow small{display:block;font-size:12.5px;color:#606060;margin-top:2px}
.vrow i{width:20px;height:20px;border-radius:50%;border:2px solid #606060;flex:none;position:relative}
.vrow.sel i{border-color:#065fd4}.vrow.sel i:after{content:"";position:absolute;inset:3px;border-radius:50%;background:#065fd4}
.aq{position:absolute;left:20px;right:20px;top:96px;font-size:17px;font-weight:700;color:#0f0f0f}
.atx{position:absolute;left:20px;right:20px;top:130px;font-size:13px;color:#606060;line-height:1.5}
.upb{position:absolute;left:24px;right:24px;top:820px;height:42px;border-radius:21px;background:#065fd4;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600}
.uprow{position:absolute;left:16px;right:16px;top:92px;display:flex;gap:12px}
.upth{width:150px;height:84px;border-radius:8px;background:linear-gradient(135deg,#ef5350,#880e4f);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;flex:none}
.upinfo{display:flex;flex-direction:column;gap:6px;font-size:14px;color:#0f0f0f}.upinfo small{font-size:12.5px;color:#606060}
.pbar{height:4px;background:#e5e5e5;border-radius:2px;width:200px}#pfill{height:4px;background:#065fd4;border-radius:2px;width:0}
#pwrap{position:absolute;left:0;right:0;top:150px}
.bul{display:flex;gap:14px;align-items:flex-start;font-size:29px;font-weight:600;margin-top:16px;color:#14141c;opacity:0}
.bul i{flex:none;width:34px;height:34px;border-radius:50%;background:#1fb866;color:#fff;font-style:normal;font-size:20px;display:flex;align-items:center;justify-content:center;margin-top:2px}
.bul.neg i{background:#e0002b}
.bul code{font-family:Consolas,monospace;background:rgba(255,255,255,.7);padding:0 8px;border-radius:6px;font-size:27px}
#pb{margin-top:10px}
#cap{font-size:31px !important}
.ptitle{font-size:58px !important}
'''

# panel: dynamic
panel_old = v3[v3.index('<div id="panel">'): v3.index('<div id="cap">')]
panel_new = '''<div id="panel">
 <div id="pwrap"><span class="kick" id="pk"></span><div class="ptitle" id="pt"></div><div class="psub" id="ps"></div><div id="pb"></div></div>
 <div id="dots"></div>
 <div id="confw"></div>
</div>
'''
body_start = v3.index("<body>"); content_start = v3.index('<div id="content">') + len('<div id="content">')
hl_idx = v3.index('<div class="hl" id="hl"></div>')
screens_html = "\n".join([home, splash, feed, you, sheet, channel]) + new_screens
html = (v3[:v3.index("<style>")] + "<style>" + style + extra_css + "</style></head>" +
        v3[body_start: content_start] + "\n" + screens_html + "\n " + v3[hl_idx: v3.index('<div id="panel">')] +
        panel_new + v3[v3.index('<div id="cap">'): v3.index("<script>")] +
        '<script src="timeline.js"></script>\n<script src="engine.js"></script></body></html>')
html = html.replace("ui_sample", "full_stage")
open(os.path.join(HERE, "full_stage.html"), "w", encoding="utf-8").write(html)
print("full_stage.html written", len(html))
