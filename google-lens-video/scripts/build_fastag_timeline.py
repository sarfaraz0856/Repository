"""Builds src/fastag/timeline.json for the FASTag documentary sample (exactly 900 frames @ 30 fps):
narration cue positions + every visual / sound 'beat' derived from the spoken words, so the animation
(TypeScript) and the sound effects (Python) share one source of truth."""
import json, math, os, subprocess

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS, TOTAL = 30, 900
lines = json.load(open(os.path.join(ROOT, 'fastag', 'narration', 'scene1.json')))['scenes'][0]['lines']
VO = os.path.join(ROOT, 'public', 'fastag', 'vo')


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


LEAD, GAP = 0.8, 0.85
cues, t = [], LEAD
for i, l in enumerate(lines):
    d = dur(os.path.join(VO, f's1_{i + 1}.wav'))
    cues.append({'file': f'fastag/vo/s1_{i + 1}.wav', 'text': l['hi'], 'from': round(t * FPS), 'dur': math.ceil(d * FPS)})
    t += d + GAP
end_speech = cues[-1]['from'] + cues[-1]['dur']
assert end_speech <= TOTAL - 45, f'narration too long for 30 s: {end_speech} frames'


def w(i, word):
    c = cues[i]; idx = max(c['text'].find(word), 0)
    return round(c['from'] + c['dur'] * idx / len(c['text']))


c = [q['from'] for q in cues]
B = {}
B['gantry'] = w(0, 'Toll') - 8          # toll plaza fades in as it is mentioned
B['read'] = w(0, 'बिना') - 2            # reader reads the windshield tag
B['ok'] = B['read'] + 10                # tag verified
B['barrierUp'] = B['read'] + 3
B['carOut'] = w(0, 'निकल') + 2          # car speeds through
B['chip'] = c[1] + 2                    # payment chip flies from plaza to phone
B['sms'] = w(1, 'SMS')                  # SMS notification lands on the phone
B['debit'] = w(1, 'कट')                 # amount highlighted
B['roadOut'] = c[2] - 6                 # road scene leaves
B['cash'] = w(2, 'Cash')
B['card'] = w(2, 'Card')
B['stop'] = w(2, 'रुके')
B['how'] = w(2, 'कैसे')
B['qOut'] = c[3] - 6
B['windshield'] = c[3] - 2
B['sticker'] = w(3, 'Sticker')
B['title'] = c[4] + 6
B['end'] = TOTAL
out = {'fps': FPS, 'durationInFrames': TOTAL, 'cues': cues, 'beats': B}
json.dump(out, open(os.path.join(ROOT, 'src', 'fastag', 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in B.items(): print(f'{k:12s} {v:4d} ({v / FPS:.2f}s)')
print(f'speech ends {end_speech / FPS:.1f} s')
