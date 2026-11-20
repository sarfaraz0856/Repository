#!/usr/bin/env python3
"""Zero-shot voice clone TTS (Chatterbox Multilingual, MIT) for the tutorial voice-over.

Usage: python clone_tts.py texts.json ref.wav out_dir [--only N]
  texts.json : JSON list of Hindi lines (the beats' `vo` strings)
  ref.wav    : ~10-15 s clean sample of the speaker
  out_dir    : writes md5(text).wav per line (resumable; existing files are skipped)
Feed out_dir to make_full.py via CLONE_DIR=out_dir.
"""
import hashlib, json, os, re, sys, time
import torch, torchaudio as ta

texts, ref, out = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
if "--only" in sys.argv: texts = texts[: int(sys.argv[sys.argv.index("--only") + 1])]
os.makedirs(out, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)
EXAG = float(os.environ.get("EXAG", "0.5")); CFG = float(os.environ.get("CFG", "0.5")); TEMP = float(os.environ.get("TEMP", "0.7"))

from chatterbox.mtl_tts import ChatterboxMultilingualTTS
model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
model.prepare_conditionals(ref, exaggeration=EXAG)

def parts(t, minc=30):
    """Split at sentence ends (। ? !) so each generation stays short and stable.
    Very short pieces (e.g. "सब ठीक है?") make the model mumble, so they are merged into a neighbour."""
    t = re.sub(r"['\"‘’“”]", "", t).replace(" — ", ", ")   # a comma keeps the dash's pause
    bits = [b.strip() for b in re.split(r"(?<=[।?!])\s+", t) if b.strip()]
    merged = []
    for b in bits:
        if merged and (len(b) < minc or len(merged[-1]) < minc): merged[-1] += " " + b
        else: merged.append(b)
    return merged or [t]

t0 = time.time()
for i, text in enumerate(texts):
    fp = os.path.join(out, hashlib.md5(text.encode()).hexdigest() + ".wav")
    if os.path.exists(fp): continue
    torch.manual_seed(1234 + i)
    segs = []
    for p in parts(text):
        w = model.generate(p, language_id="hi", exaggeration=EXAG, cfg_weight=CFG, temperature=TEMP)
        segs += [w, torch.zeros(1, int(model.sr * 0.22))]
    ta.save(fp + ".tmp.wav", torch.cat(segs[:-1], dim=1), model.sr); os.replace(fp + ".tmp.wav", fp)
    print(f"[{i + 1}/{len(texts)}] {time.time() - t0:.0f}s  {text[:40]}", flush=True)
print("DONE", flush=True)
