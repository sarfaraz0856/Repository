import json, pickle, build, audio
SPEED = 1.15
durs = json.load(open("vo3/durs.json"))
ops, sfx, voice, subs, total = build.build({k: v * SPEED for k, v in durs.items()})
k = 1 / SPEED
ops = [(o[0] * k, o[1] * k) + tuple(o[2:]) for o in ops]
sfx = [(t * k, n) for t, n in sfx]
voice = [(t * k, p.replace("vo/", "vo3/")) for t, p in voice]
subs = [(a * k, b * k, t) for a, b, t in subs]
total *= k
print("total", total)
pickle.dump({"ops": ops, "subs": subs, "total": total}, open("tl.pkl", "wb"))
audio.mix(voice, sfx, total, "mix.wav")


# --- also emit an English subtitle track with identical timing ---
try:
    import en_subs, script
    order = [(si, li) for si, (_, lines) in enumerate(script.SCENES) for li in range(len(lines))]
    def _ts(t):
        h, r = divmod(t, 3600); mm, s = divmod(r, 60); ms = min(int(round((s - int(s)) * 1000)), 999)
        return f"{int(h):02}:{int(mm):02}:{int(s):02},{ms:03}"
    ecues = []
    for (si, li), (vt, _) in zip(order, voice):
        vs = vt * k; window = durs[f"{si}_{li}"]; text = en_subs.EN[f"{si}_{li}"]
        cs = build.balanced_cues(text); tot = sum(len(c) for c in cs); ct = vs
        for c in cs:
            cd = window * len(c) / tot; ecues.append((ct, ct + cd, c)); ct += cd
    open("subtitles_english.srt", "w").write("\n".join(f"{i}\n{_ts(a)} --> {_ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(ecues, 1)))
    print("wrote subtitles_english.srt")
except Exception as e:
    print("english srt skipped:", e)
