"""Regenerate given lines: N seeds each, Whisper-score each candidate, keep the best."""
import sys, json, hashlib, re, difflib, subprocess, numpy as np, torch, torchaudio as ta
src=open("/home/user/Repository/youtube-production-kit/ui_demo/voice/clone_tts.py").read(); exec(src[src.index("def parts"):src.index("t0 = time.time()")])
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
import os
OUT=os.environ["OUT"];EX=float(os.environ["EX"]);CFG=float(os.environ["CFG"]);TMP=float(os.environ["TMP"]);os.makedirs(OUT,exist_ok=True)
T=json.load(open(__import__("os").environ.get("TEXTS","adsense_texts.json"))); idx=[int(x) for x in sys.argv[2].split(",")]; N=int(sys.argv[3])
m=ChatterboxMultilingualTTS.from_pretrained(device="cpu"); m.prepare_conditionals(sys.argv[1], exaggeration=EX)
w=WhisperModel('medium',device='cpu',compute_type='int8')
norm=lambda s: re.sub(r"[^ऀ-ॿ]","",s).replace("़","").replace("ँ","ं")
def score(t,wav):
    a=ta.functional.resample(wav,m.sr,16000)[0].numpy()
    h=" ".join(s.text for s in w.transcribe(a,language="hi",beam_size=1,initial_prompt="यह हिंदी वीडियो है, अंग्रेज़ी शब्द भी देवनागरी में लिखे हैं।")[0])
    hw_=[x.strip('।,.?!') for x in h.split()]
    ref=norm(t); hyp=norm(h); sw=len(t.split()); hw=len(h.split())
    rep=max([h.split().count(x) for x in set(h.split())] or [0])
    return difflib.SequenceMatcher(None,ref,hyp).ratio()-abs(1-hw/sw)*0.5-(0.2 if rep>3 else 0)-(0.4 if any(hw_[k]==hw_[k+1] and len(hw_[k])>2 for k in range(len(hw_)-1)) else 0), h
for i in idx:
    t=T[i]; best=None
    if os.path.exists(OUT+"/"+hashlib.md5(t.encode()).hexdigest()+".wav"): print(f"#{i} exists",flush=True); continue
    for k in range(N):
        torch.manual_seed(9000+i*31+k); segs=[]
        for p in parts(t):
            segs+=[m.generate(p,language_id="hi",exaggeration=EX,cfg_weight=CFG,temperature=TMP),torch.zeros(1,int(m.sr*0.22))]
        wav=torch.cat(segs[:-1],1); sc,h=score(t,wav)
        print(f"#{i} try{k} score={sc:.3f} {h[:80]}",flush=True)
        if best is None or sc>best[0]: best=(sc,wav,h)
        if best[0]>=0.85: break
    ta.save(OUT+"/"+hashlib.md5(t.encode()).hexdigest()+".wav",best[1],m.sr); print(f"#{i} KEEP {best[0]:.3f}",flush=True)
