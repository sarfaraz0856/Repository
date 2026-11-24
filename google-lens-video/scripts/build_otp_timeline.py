"""Builds src/otp/timeline.json for the OTP documentary sample (exactly 900 frames @ 30 fps):
narration cue positions + every visual / sound 'beat' derived from the spoken words, so the animation
(TypeScript) and the sound effects (Python) share one source of truth."""
import json, math, os, subprocess

ROOT = os.path.join(os.path.dirname(__file__), '..')
FPS, TOTAL = 30, 900
lines = json.load(open(os.path.join(ROOT, 'otp', 'narration', 'scene1.json')))['scenes'][0]['lines']
VO = os.path.join(ROOT, 'public', 'otp', 'vo')


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


LEAD, GAP = 0.8, 0.85
cues, t = [], LEAD
for i, l in enumerate(lines):
    d = dur(os.path.join(VO, f's1_{i + 1}.wav'))
    cues.append({'file': f'otp/vo/s1_{i + 1}.wav', 'text': l['hi'], 'from': round(t * FPS), 'dur': math.ceil(d * FPS)})
    t += d + GAP
end_speech = cues[-1]['from'] + cues[-1]['dur']
assert end_speech <= TOTAL - 45, f'narration too long for 30 s: {end_speech} frames'


def w(i, word):
    c = cues[i]; idx = max(c['text'].find(word), 0)
    return round(c['from'] + c['dur'] * idx / len(c['text']))


c = [q['from'] for q in cues]
B = {}
B['checkout'] = 6                       # shopping checkout on the phone
B['tap'] = w(0, 'Tap') + 2              # tap on Pay
B['otpScreen'] = B['tap'] + 8           # 'Enter OTP' screen
B['sms'] = w(0, 'SMS')                  # SMS notification arrives
B['code'] = w(1, 'Code')                # the 6-digit code highlighted (stage card)
B['timer'] = w(1, 'minutes')            # validity timer
B['type'] = w(2, 'Enter') - 4           # digits typed
B['digits'] = [B['type'] + 4 * k for k in range(6)]
B['verify'] = w(2, 'Confirm') - 4       # verifying...
B['success'] = w(2, 'Confirm') + 8      # payment successful
B['smsOut'] = c[3] - 6
B['q1'] = w(3, 'बनता')
B['q2'] = w(3, 'पहुँचता')
B['q3'] = w(3, 'सही')
B['title'] = c[4] + 6
B['end'] = TOTAL
out = {'fps': FPS, 'durationInFrames': TOTAL, 'cues': cues, 'beats': B}
json.dump(out, open(os.path.join(ROOT, 'src', 'otp', 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in B.items(): print(f'{k:12s} {v}')
print(f'speech ends {end_speech / FPS:.1f} s')
