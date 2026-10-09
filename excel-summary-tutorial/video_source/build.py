import json, engine as E, script
from engine import f_sub

def wrap(text, maxw=1560):
    words = text.split(" "); lines = []; cur = ""
    for w in words:
        t = (cur + " " + w).strip()
        if f_sub.getlength(t) > maxw and cur: lines.append(cur); cur = w
        else: cur = t
    lines.append(cur); return lines

def build(durs):
    ops, sfx, voice, subs, scene_marks = [], [], [], [], []
    t = 0.0
    seq = [0]
    def add(start, dur, kind, **a):
        ops.append((start, dur, kind, a, seq[0])); seq[0] += 1
    st_probe = None
    for si, (banner, lines) in enumerate(script.SCENES):
        scene_marks.append(t)
        if si > 0: sfx.append((t, "whoosh"))
        if banner is not None: add(t, 0, "banner", text=banner)
        for li, (sub, sp, acts) in enumerate(lines):
            adur = durs[f"{si}_{li}"]; t0 = t; ta = t0
            for act in acts:
                name = act[0]; par = name.startswith("&"); name = name.lstrip("&"); start = ta; adv = 0
                if name == "move":
                    to = E.ok_button() if act[1] == "ok" else act[1]
                    add(start, act[2], "move", to=to); adv = act[2]
                elif name == "drag":
                    add(start, act[2], "move", to=act[1], dragsel=True); adv = act[2]
                elif name == "click":
                    add(start, 0.45, "click"); sfx.append((start, "click")); adv = 0.25
                elif name == "click_sfx": sfx.append((start, "click")); adv = 0
                elif name == "clickcell":
                    add(start, 0.55, "move", to=act[1]); add(start + 0.55, 0.45, "click", cell=act[1])
                    sfx.append((start + 0.55, "click")); adv = 0.8
                elif name == "tab":
                    add(start, 0.6, "move", to=("tab", act[1])); add(start + 0.6, 0.45, "click")
                    add(start + 0.62, 0, "sheet", name=act[1]); sfx.append((start + 0.6, "click")); adv = 0.9
                elif name == "type":
                    text, opt, d = act[1], act[2], act[3]
                    add(start, d, "type", text=text, **opt)
                    n = max(1, len(text))
                    for i in range(n): sfx.append((start + d * i / n, "key"))
                    if not opt.get("hold"): sfx.append((start + d, "key"))
                    adv = d + 0.15
                elif name == "enter": add(start, 0, "enter"); sfx.append((start, "key")); adv = 0.2
                elif name == "newsheet": add(start, 0, "newsheet", name=act[1]); adv = 0.3
                elif name == "rename":
                    add(start, act[3], "rename", old=act[1], new=act[2])
                    for i in range(len(act[2]) + 1): sfx.append((start + act[3] * i / len(act[2]), "key"))
                    adv = act[3] + 0.1
                elif name == "style": add(start, 0, "style", r=act[1], s=act[2])
                elif name == "fill":
                    add(start, act[3], "fill", src=act[1], to=act[2]); adv = act[3] + 0.2
                elif name == "clear": add(start, 0, "clear", r=act[1]); sfx.append((start, "key")); adv = 0.3
                elif name == "hl": add(start, 0.35, "hl", id=act[1], r=act[2], color=act[3]); adv = 0.1
                elif name == "unhl": add(start, 0, "unhl", ids=act[1])
                elif name == "call":
                    add(start, 0.35, "call", id=act[1], lines=act[2], style=act[3], pos=act[4]); adv = 0.1
                elif name == "uncall": add(start, 0.25, "uncall", ids=act[1]); adv = 0.1
                elif name == "banner": add(start, 0, "banner", text=act[1])
                elif name == "title":
                    add(start, act[3], "title", lines=act[1], sub=act[2]); adv = act[3]
                elif name == "untitle": add(start, act[1], "untitle"); adv = act[1]
                elif name == "zoom":
                    add(start, act[3], "zoom", to=act[1], s=act[2]); adv = act[3]
                elif name == "wait": adv = act[1]
                elif name == "set": add(start, 0, "set", key=act[1], val=act[2])
                elif name == "chime": sfx.append((start, "chime"))
                elif name == "dialog": add(start, 0, "dialog", name=act[1]); adv = 0.1
                elif name == "ants": add(start, 0, "ants", r=act[1])
                elif name == "check": add(start, 0, "check", items=act[1], n=act[2]); sfx.append((start, "tick")) if act[2] else None
                else: raise ValueError(name)
                if not par: ta += adv
            vs = t0 + 0.2
            voice.append((vs, f"vo/{si:02d}_{li:02d}.wav"))
            # subtitles: wrap, two lines per cue, timed proportionally to characters
            wl = wrap(sub); cues = ["\n".join(wl[i:i + 2]) for i in range(0, len(wl), 2)]
            tot = sum(len(c) for c in cues); ct = vs
            for c in cues:
                cd = adur * len(c) / tot; subs.append((ct, ct + cd, c)); ct += cd
            t = max(vs + adur + 0.45, ta + 0.3)
        t += 0.6
    ops.sort(key=lambda o: (o[0], o[4]))
    return ops, sfx, voice, subs, t

if __name__ == "__main__":
    durs = json.load(open("vo/durs.json"))
    ops, sfx, voice, subs, total = build(durs)
    print("total", total)
