import json, soundfile as sf, script
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.int8.onnx", "voices-v1.0.bin")
durs = {}
for si, (_, lines) in enumerate(script.SCENES):
    for li, (sub, sp, acts) in enumerate(lines):
        a, sr = k.create(sp, voice="hm_omega", speed=1.0, lang="hi")
        sf.write(f"vo/{si:02d}_{li:02d}.wav", a, sr); durs[f"{si}_{li}"] = len(a) / sr
json.dump(durs, open("vo/durs.json", "w"))
print(sum(durs.values()))
