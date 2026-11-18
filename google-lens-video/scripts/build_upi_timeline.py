"""Builds src/upi/timeline.json for the UPI documentary sample (exactly 900 frames @ 30 fps):
narration cue positions + every visual/sound 'beat' derived from the spoken words, so the animation
(TypeScript) and the sound effects (Python) share one source of truth."""
import json, math, os, subprocess

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS, TOTAL = 30, 900
script = json.load(open(os.path.join(ROOT, 'upi', 'narration', 'scene1.json')))
lines = script['scenes'][0]['lines']
VO = os.path.join(ROOT, 'public', 'upi', 'vo')


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


LEAD, GAP = 0.45, 0.32
cues, t = [], LEAD
for i, l in enumerate(lines):
    d = dur(os.path.join(VO, f's1_{i + 1}.wav'))
    cues.append({'file': f'upi/vo/s1_{i + 1}.wav', 'text': l['hi'], 'from': round(t * FPS), 'dur': math.ceil(d * FPS)})
    t += d + GAP
end_speech = cues[-1]['from'] + cues[-1]['dur']
assert end_speech <= TOTAL - 12, f'narration too long for 30 s: {end_speech} frames'


def w(i, word, nth=0):
    c = cues[i]; txt = c['text']; idx = -1
    for _ in range(nth + 1):
        idx = txt.find(word, idx + 1)
    idx = max(idx, 0)
    return round(c['from'] + c['dur'] * idx / len(txt))


c = [q['from'] for q in cues]
B = {}
B['scanDetect'] = w(0, 'Scan') + 4
B['amountScreen'] = w(0, 'सौ') - 6
B['digits'] = [w(0, 'सौ') + k for k in (0, 4, 8)]
B['payTap'] = w(0, 'Enter') + 6
B['pinScreen'] = B['payTap'] + 7
pin0 = max(w(0, 'PIN') - 6, B['pinScreen'] + 6)
B['pinTaps'] = [pin0 + k * 5 for k in range(4)]
B['pinSubmit'] = B['pinTaps'][-1] + 7
B['processing'] = B['pinSubmit'] + 5
B['packetsOut'] = B['processing'] + 8
B['shopOut'] = c[1] + 10
B['network'] = c[2] - 4
B['mobile'] = w(2, 'मोबाइल')
B['nodeApp'] = w(2, 'Payment')
B['nodePSP'] = w(2, 'Payment') + 10
B['nodeNPCI'] = w(2, 'NPCI')
B['nodeBanks'] = w(2, 'Banks')
B['flow'] = w(2, 'Communicate') - 4
B['debit'] = c[3] + 4
B['credit'] = c[3] + 18
B['confirm'] = c[3] + 26
B['success'] = c[3] + 34
B['title'] = c[4] + 8
B['end'] = TOTAL
json.dump({'fps': FPS, 'durationInFrames': TOTAL, 'cues': cues, 'beats': B}, open(os.path.join(ROOT, 'src', 'upi', 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in B.items():
    print(f'{k:13s}', v if isinstance(v, list) else f'{v} ({v / FPS:.2f}s)')
print('speech ends', round(end_speech / FPS, 2), 's')
