# 2 takes per line in the user's own cloned voice (user confirmed the reference voice is theirs).
import sys, os, json, torch, numpy as np, soundfile as sf
from TTS.api import TTS
torch.set_num_threads(4)
S = sys.argv[1]
lines = json.load(open(f"{S}/s30/lines.json"))
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
refs = [f"{S}/ref/ref_best.wav"]  # 2:11-2:25 clip chosen by the user
for i, (hi, _h, _e) in enumerate(lines):
    for k, temp in enumerate([0.6, 0.75]):
        out = f"{S}/s30/l{i:02d}_t{k}.wav"
        if os.path.exists(out): continue
        torch.manual_seed(100 + i * 7 + k)
        wav = tts.tts(text=hi, language="hi", speaker_wav=refs, split_sentences=True, temperature=temp, speed=1.0)
        sf.write(out, np.array(wav, dtype=np.float32), 24000)
        print("done", out, flush=True)
