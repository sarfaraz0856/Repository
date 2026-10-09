import json, pickle, build, audio
SPEED = 1.15
durs = json.load(open("vo2/durs.json"))
ops, sfx, voice, subs, total = build.build({k: v * SPEED for k, v in durs.items()})
k = 1 / SPEED
ops = [(o[0] * k, o[1] * k) + tuple(o[2:]) for o in ops]
sfx = [(t * k, n) for t, n in sfx]
voice = [(t * k, p.replace("vo/", "vo2/")) for t, p in voice]
subs = [(a * k, b * k, t) for a, b, t in subs]
total *= k
print("total", total)
pickle.dump({"ops": ops, "subs": subs, "total": total}, open("tl.pkl", "wb"))
audio.mix(voice, sfx, total, "mix.wav")
