"""Quality control for the narration: transcribes every line with Whisper (base.en) and
re-synthesises (same voice, same settings) any line whose word error rate is above the
threshold, keeping the best take. Requires: pip install faster-whisper
Usage: PIPER_MODEL_DIR=/path python3 scripts/qc_narration.py [--max-tries 6]
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
from faster_whisper import WhisperModel

ROOT = os.path.join(os.path.dirname(__file__), '..')
MODEL = os.path.join(os.environ.get('PIPER_MODEL_DIR', '/tmp/piper'), 'hi_IN-pratham-medium.onnx')
TRIES = int(sys.argv[sys.argv.index('--max-tries') + 1]) if '--max-tries' in sys.argv else 6
script = json.load(open(os.path.join(ROOT, 'narration', 'script_6min.json')))
durfile = os.path.join(ROOT, 'narration', 'durations.json')
meta = json.load(open(durfile))
SPEED = meta['speed']
CHAIN = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,'
         'aresample=48000:resampler=soxr')
asr = WhisperModel('base.en', device='cpu', compute_type='int8',
                   download_root=os.environ.get('WHISPER_DIR', '/tmp/whisper'), cpu_threads=8)
CONTR = {"we'll": 'we will', "you're": 'you are', "isn't": 'is not', "don't": 'do not', "let's": 'let us',
         'colours': 'colors', 'analyses': 'analyzes'}


def norm(s):
    s = s.lower().replace('-', ' ')
    for a, b in CONTR.items():
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9 ]", ' ', s).split()


def wer(r, h):
    d = np.zeros((len(r) + 1, len(h) + 1), int)
    d[:, 0] = range(len(r) + 1)
    d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[-1, -1] / len(r)


def transcribe(path):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True).stdout
    segs, _ = asr.transcribe(np.frombuffer(raw, np.int16).astype(np.float32) / 32768, language='en', beam_size=5)
    return ' '.join(s.text.strip() for s in segs)


def synth(text, dst):
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        subprocess.run([sys.executable, '-m', 'piper', '-m', MODEL, '--length-scale', str(SPEED), '-f', tmp.name],
                       input=text.encode(), check=True, capture_output=True)
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', tmp.name, '-af', CHAIN, '-ac', '1', dst], check=True)


report = {}
for s in script['scenes']:
    for i, line in enumerate(s['lines']):
        name = f"{s['id']}_{i + 1}"
        path = os.path.join(ROOT, 'public', 'long', 'vo', name + '.wav')
        ref = norm(line['en'])
        hyp = transcribe(path)
        best = wer(ref, norm(hyp))
        tries = 0
        while best > 0.06 and tries < TRIES:
            tries += 1
            cand = path + '.cand.wav'
            synth(line['say'], cand)
            h = transcribe(cand)
            w = wer(ref, norm(h))
            if w < best:
                os.replace(cand, path)
                best, hyp = w, h
            elif os.path.exists(cand):
                os.remove(cand)
        d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                                 capture_output=True, text=True).stdout)
        meta['durations'][name] = round(d, 3)
        report[name] = {'wer': round(best, 3), 'asr': hyp, 'retakes': tries}
        print(f'{name:10s} WER {best:.2f} retakes {tries} | {hyp}', flush=True)
json.dump(meta, open(durfile, 'w'), indent=1)
json.dump(report, open(os.path.join(ROOT, 'narration', 'qc_report.json'), 'w'), indent=1)
print('mean WER', round(float(np.mean([r['wer'] for r in report.values()])), 4),
      '| total speech', round(sum(meta['durations'].values()), 1), 's')
