"""Synthesises the 6-minute English narration with the SAME voice as the 15 s video
(Piper hi_IN-pratham-medium) and the same post-processing chain, one WAV per sentence.
Output: public/long/vo/<scene>_<n>.wav (48 kHz mono) + narration/durations.json
Usage: PIPER_MODEL_DIR=/path python3 scripts/make_narration_6min.py [--speed 0.85]
"""
import json, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.join(os.path.dirname(__file__), '..')
MODEL = os.path.join(os.environ.get('PIPER_MODEL_DIR', '/tmp/piper'), 'hi_IN-pratham-medium.onnx')
SPEED = float(sys.argv[sys.argv.index('--speed') + 1]) if '--speed' in sys.argv else 0.85
OUT = os.path.join(ROOT, 'public', 'long', 'vo')
os.makedirs(OUT, exist_ok=True)
script = json.load(open(os.path.join(ROOT, 'narration', 'script_6min.json')))
CHAIN = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,'
         'aresample=48000:resampler=soxr')

jobs = []
for s in script['scenes']:
    for i, line in enumerate(s['lines']):
        jobs.append((f"{s['id']}_{i + 1}", line['say']))


def synth(job):
    name, text = job
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        subprocess.run([sys.executable, '-m', 'piper', '-m', MODEL, '--length-scale', str(SPEED), '-f', tmp.name],
                       input=text.encode(), check=True, capture_output=True)
        dst = os.path.join(OUT, name + '.wav')
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp.name, '-af', CHAIN, '-ac', '1', dst], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst],
                             capture_output=True, text=True).stdout)
    return name, round(d, 3)


with ThreadPoolExecutor(4) as ex:
    durs = dict(ex.map(synth, jobs))
json.dump({'speed': SPEED, 'durations': durs}, open(os.path.join(ROOT, 'narration', 'durations.json'), 'w'), indent=1)
print(f'{len(durs)} lines, total speech {sum(durs.values()):.1f}s at length-scale {SPEED}')
