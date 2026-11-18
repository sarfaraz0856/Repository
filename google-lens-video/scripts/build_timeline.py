"""Builds the frame-accurate timeline (src/long/timeline.json) from the narration durations.
Targets the scene lengths of the brief and shifts boundaries only where the narration needs it,
keeping the total at exactly 10,800 frames (360 s @ 30 fps)."""
import json, math, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS, TOTAL = 30, 10800
script = json.load(open(os.path.join(ROOT, 'narration', 'script_6min.json')))
durs = json.load(open(os.path.join(ROOT, 'narration', 'durations.json')))['durations']
TARGET = {'intro': 30, 'what': 45, 'scan': 45, 'ai': 50, 'results': 45, 'text': 45, 'uses': 45, 'howto': 35, 'outro': 20}
LEAD = {'intro': 3.0, 'outro': 1.0}   # intro: phone + title appear first
TAIL = {'outro': 5.5}                  # outro: final title hold + fade-out
GAP = 0.5

need = {}
for s in script['scenes']:
    sid = s['id']
    speech = sum(durs[f'{sid}_{i + 1}'] for i in range(len(s['lines'])))
    need[sid] = LEAD.get(sid, 1.2) + speech + GAP * (len(s['lines']) - 1) + TAIL.get(sid, 1.0)

# start from targets, grow scenes that need more, take the time back from scenes with the most slack
length = {k: max(TARGET[k], need[k]) for k in TARGET}
over = sum(length.values()) - 360
while over > 1e-6:
    k = max(length, key=lambda x: length[x] - need[x])
    take = min(over, length[k] - need[k], 0.5)
    if take <= 0:
        raise SystemExit('narration does not fit in 360 s')
    length[k] -= take
    over -= take

frames = {k: round(v * FPS) for k, v in length.items()}
frames['outro'] += TOTAL - sum(frames.values())

out = {'fps': FPS, 'durationInFrames': TOTAL, 'scenes': []}
cur = 0
for s in script['scenes']:
    sid = s['id']
    slack = frames[sid] / FPS - need[sid]
    gap = GAP + (slack * 0.5) / max(1, len(s['lines']) - 1)  # spread half of the slack between sentences
    t = cur / FPS + LEAD.get(sid, 1.2) + slack * 0.2
    cues = []
    for i, line in enumerate(s['lines']):
        name = f'{sid}_{i + 1}'
        d = durs[name]
        cues.append({'file': f'long/vo/{name}.wav', 'text': line['en'], 'from': round(t * FPS), 'dur': math.ceil(d * FPS)})
        t += d + gap
    out['scenes'].append({'id': sid, 'title': s['title'], 'from': cur, 'dur': frames[sid], 'cues': cues})
    print(f"{sid:8s} {cur / FPS:6.1f}s -> {(cur + frames[sid]) / FPS:6.1f}s  len {frames[sid] / FPS:5.1f}s  narration needs {need[sid]:5.1f}s")
    cur += frames[sid]
assert cur == TOTAL
os.makedirs(os.path.join(ROOT, 'src', 'long'), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, 'src', 'long', 'timeline.json'), 'w'), indent=1, ensure_ascii=False)
print('total', cur, 'frames')
