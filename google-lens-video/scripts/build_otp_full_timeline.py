"""Timeline for the full OTP documentary: scene 1 = the approved 30 s sample (900 frames, unchanged),
scenes 2-12 laid out from the real narration durations (natural pacing, no speed-up).
Output: src/otp/full_timeline.json"""
import json, math, os, subprocess, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS = 30
script = json.load(open(os.path.join(ROOT, 'otp', 'narration', 'script_full.json')))
sample = json.load(open(os.path.join(ROOT, 'src', 'otp', 'timeline.json')))
VO = os.path.join(ROOT, 'public', 'otp', 'vo')
LEAD, GAP, TAIL = 0.75, 0.58, 1.45
TAIL_LAST = 7.5   # final title + subscribe + fade-out


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


scenes = [{'id': 's1', 'title': script['scenes'][0]['title'], 'from': 0, 'dur': 900, 'cues': sample['cues']}]
cur = 900
for si, s in enumerate(script['scenes'][1:]):
    t = cur / FPS + LEAD
    cues = []
    for i, l in enumerate(s['lines']):
        name = f"{s['id']}_{i + 1}"
        fp = os.path.join(VO, name + '.wav')
        d = dur(fp) if os.path.exists(fp) else len(l['say']) / 14.5   # estimate until the line is recorded
        if not os.path.exists(fp): print('  (estimated)', name)
        cues.append({'file': f'otp/vo/{name}.wav', 'text': l['hi'], 'from': round(t * FPS), 'dur': math.ceil(d * FPS)})
        t += d + GAP
    end = t - GAP + (TAIL_LAST if si == len(script['scenes']) - 2 else TAIL)
    n = round(end * FPS) - cur
    scenes.append({'id': s['id'], 'title': s['title'], 'from': cur, 'dur': n, 'cues': cues})
    cur += n
out = {'fps': FPS, 'durationInFrames': cur, 'scenes': scenes}
json.dump(out, open(os.path.join(ROOT, 'src', 'otp', 'full_timeline.json'), 'w'), ensure_ascii=False, indent=1)
for s in scenes:
    print(f"{s['id']:4s} {s['from'] / FPS / 60:5.2f}m  len {s['dur'] / FPS:5.1f}s  {s['title']}")
print('total', cur, 'frames =', f'{cur / FPS / 60:.2f} min')
