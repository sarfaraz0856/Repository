"""Vertical OTP Short (1080x1920): re-uses the already-checked narration lines of the OTP documentary
+ one new closing line. Builds src/otp/short/timeline.json (cues + word-anchored beats)."""
import json, math, os, subprocess

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS = 30
d = json.load(open(os.path.join(ROOT, 'otp', 'narration', 'script_full.json')))
H = {f"{s['id']}_{i+1}": l['hi'] for s in d['scenes'] for i, l in enumerate(s['lines'])}
LINES = ['s1_1', 's1_2', 's4_2', 's5_2', 's5_3', 's6_3', 's6_4', 's8_4', 's9_2', 'cta']
CTA = 'पूरा Process समझने के लिए, Full Video ज़रूर देखिए। Thank you!'


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


LEAD, GAP, TAIL = 0.5, 0.34, 1.6
cues, t = [], LEAD
for n in LINES:
    f = 'otp/short/cta.wav' if n == 'cta' else f'otp/vo/{n}.wav'
    dd = dur(os.path.join(ROOT, 'public', f))
    cues.append({'id': n, 'file': f, 'text': CTA if n == 'cta' else H[n], 'from': round(t * FPS), 'dur': math.ceil(dd * FPS)})
    t += dd + (GAP if n not in ('s1_2', 's4_2', 's5_3', 's6_4', 's8_4') else GAP + 0.25)   # a beat more between topics
total = round((t - GAP + TAIL) * FPS)


def w(i, word):
    c = cues[i]; idx = max(c['text'].find(word), 0)
    return round(c['from'] + c['dur'] * idx / len(c['text']))


c = [q['from'] for q in cues]
B = {'tap': w(0, 'Tap'), 'sms': w(0, 'SMS'), 'code': w(1, 'Code'), 'timer': w(1, 'minutes'),
     'make': c[2], 'random': w(2, 'Random'), 'route': c[3], 'gw': w(3, 'Gateway'), 'op': w(4, 'Operator'), 'net': w(4, 'Network'),
     'check': c[5], 'expire': w(6, 'Expire'), 'used': w(6, 'पहले'), 'type': c[5] - 10, 'ok': c[6] + cues[6]['dur'] - 6,
     'warn': c[7], 'never': w(7, 'कभी'), 'share': c[8], 'cta': c[9], 'end': total}
out = {'fps': FPS, 'durationInFrames': total, 'cues': cues, 'beats': B}
os.makedirs(os.path.join(ROOT, 'src', 'otp', 'short'), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, 'src', 'otp', 'short', 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print(f'total {total} frames = {total / FPS:.1f} s'); print(B)
