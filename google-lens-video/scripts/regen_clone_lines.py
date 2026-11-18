"""Re-generates selected narration lines in the cloned voice, several takes each.
Long sentences are synthesised in comma-sized chunks and joined with short pauses, which avoids
dropped or truncated words. Takes are written as public/long/vo/<name>.take<k>.wav for review.
Usage: python scripts/regen_clone_lines.py --ref ref.wav --takes 3 name1 name2 ..."""
import json, os, re, subprocess, sys, tempfile
import numpy as np, torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

ROOT = os.path.join(os.path.dirname(__file__), '..')
args = sys.argv[1:]
REF = args[args.index('--ref') + 1]
EXAG = float(args[args.index('--exag') + 1]) if '--exag' in args else 0.45
TAKES = int(args[args.index('--takes') + 1]) if '--takes' in args else 3
names = [a for a in args if '_' in a and not a.endswith('.wav') and not a.startswith('--')]
CHAIN = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,aresample=48000:resampler=soxr')
torch.set_num_threads(4)
script = json.load(open(os.path.join(ROOT, 'narration', 'script_6min.json')))
lines = {f"{s['id']}_{i + 1}": l['say'] for s in script['scenes'] for i, l in enumerate(s['lines'])}
model = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
model.prepare_conditionals(REF, exaggeration=EXAG if '--exag' in args else 0.5)


MINLEN = int(args[args.index('--minlen') + 1]) if '--minlen' in args else 38
TEMP = float(args[args.index('--temp') + 1]) if '--temp' in args else 0.65


def chunks(text, minlen=None):
    minlen = minlen or MINLEN
    parts = [p.strip() for p in re.split(r'(?<=[,।?!])\s+', text) if p.strip()]
    out, cur = [], ''
    for p in parts:
        cur = f'{cur} {p}'.strip()
        if len(cur) >= minlen:
            out.append(cur); cur = ''
    if cur:
        if out and len(cur) < 20: out[-1] += ' ' + cur
        else: out.append(cur)
    return out


def trim(w, thr=10 ** (-45 / 20)):
    idx = np.where(np.abs(w) > thr)[0]
    w = w[max(0, idx[0] - 240): idx[-1] + 2400] if len(idx) else w
    f = min(len(w) // 4, 480)  # 20 ms fades so chunk joins never click
    w = w.copy(); w[:f] *= np.linspace(0, 1, f); w[-f:] *= np.linspace(1, 0, f)
    return w


for name in names:
    for k in range(TAKES):
        torch.manual_seed(5000 + 31 * k + len(name))
        pieces = []
        for c in chunks(lines[name]):
            w = model.generate(c, language_id='hi', exaggeration=EXAG, cfg_weight=0.6, temperature=TEMP)[0].numpy()
            pieces += [trim(w), np.zeros(int(0.14 * model.sr))]
        wav = np.concatenate(pieces[:-1])
        with tempfile.NamedTemporaryFile(suffix='.wav') as raw:
            ta.save(raw.name, torch.from_numpy(wav).unsqueeze(0), model.sr)
            subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', raw.name, '-af', CHAIN, '-ac', '1',
                            os.path.join(ROOT, 'public', 'long', 'vo', f'{name}.take{k}.wav')], check=True)
        print(name, 'take', k, flush=True)
