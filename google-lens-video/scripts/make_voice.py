"""
Same-voice generator (Chatterbox Multilingual voice clone) – exact settings used for the Google Lens video.

SETUP (once, Python 3.10–3.13, CPU is fine):
    python -m venv cbx && . cbx/bin/activate
    pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
    pip install chatterbox-tts==0.1.7
    (ffmpeg must be installed)

USAGE:
    python make_voice.py --ref voice_reference.wav --text script.txt --out out_dir [--takes 3]

script.txt = one sentence per line, written in DEVANAGARI (also English words!),
e.g.  "गूगल लेंस, गूगल का बनाया हुआ एक विज़ुअल सर्च टूल है।"
Output: out_dir/line_001.wav ... (48 kHz mono, cleaned) + out_dir/all_lines.wav (joined).

License: Chatterbox code + weights are MIT (commercial use allowed). Outputs carry an inaudible Perth watermark.
"""
import argparse, os, re, subprocess, tempfile
import numpy as np, torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

ap = argparse.ArgumentParser()
ap.add_argument('--ref', required=True)
ap.add_argument('--text', required=True)
ap.add_argument('--out', default='voice_out')
ap.add_argument('--takes', type=int, default=3)
a = ap.parse_args()

# ---- EXACT SETTINGS (do not change for the same voice) ----
LANG = os.environ.get('VOICE_LANG', 'hi')   # 'en' for the English dub
COND_EXAGGERATION = 0.5     # used when reading the reference clip
EXAGGERATION = 0.45         # 0.40 for a softer, more polite tone
CFG_WEIGHT = 0.6
TEMPERATURE = 0.55
CHUNK_MIN_CHARS = 26        # long sentences are split at commas / । into chunks
CHUNK_GAP_S = 0.14          # pause between chunks
SENTENCE_GAP_S = 0.30       # pause between sentences in all_lines.wav
CHAIN = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,'
         'aresample=48000')

torch.set_num_threads(int(os.environ.get('VOICE_THREADS', max(1, os.cpu_count() or 4))))
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = ChatterboxMultilingualTTS.from_pretrained(device=device)
model.prepare_conditionals(a.ref, exaggeration=COND_EXAGGERATION)
os.makedirs(a.out, exist_ok=True)


def chunks(text):
    parts = [p.strip() for p in re.split(r'(?<=[,।?!])\s+', text) if p.strip()]
    out, cur = [], ''
    for p in parts:
        cur = f'{cur} {p}'.strip()
        if len(cur) >= CHUNK_MIN_CHARS:
            out.append(cur); cur = ''
    if cur:
        if out and len(cur) < 15: out[-1] += ' ' + cur
        else: out.append(cur)
    return out


def trim(w, thr=10 ** (-45 / 20)):
    idx = np.where(np.abs(w) > thr)[0]
    w = w[max(0, idx[0] - 240): idx[-1] + 2400] if len(idx) else w
    f = min(len(w) // 4, 480)
    w = w.copy(); w[:f] *= np.linspace(0, 1, f); w[-f:] *= np.linspace(1, 0, f)
    return w


def synth(text, seed):
    torch.manual_seed(seed)
    pieces = []
    for c in chunks(text):
        w = model.generate(c, language_id=LANG, exaggeration=EXAGGERATION, cfg_weight=CFG_WEIGHT, temperature=TEMPERATURE)[0].numpy()
        pieces += [trim(w), np.zeros(int(CHUNK_GAP_S * model.sr))]
    return np.concatenate(pieces[:-1])


lines = [l.strip() for l in open(a.text, encoding='utf-8') if l.strip()]
finals = []
for n, line in enumerate(lines, 1):
    expect = len(line) / 14.5                      # natural Hindi pace (seconds)
    best = None
    for k in range(a.takes):
        wav = synth(line, 1000 + 37 * k + n)
        d = len(wav) / model.sr
        score = abs(d / expect - 1)                # reject truncated / rambling takes
        if best is None or score < best[0]:
            best = (score, wav)
    dst = os.path.join(a.out, f'line_{n:03d}.wav')
    with tempfile.NamedTemporaryFile(suffix='.wav') as raw:
        ta.save(raw.name, torch.from_numpy(best[1]).unsqueeze(0), model.sr)
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', raw.name, '-af', CHAIN, '-ac', '1', dst], check=True)
    finals.append(dst)
    print(f'line {n}/{len(lines)} done -> {dst}', flush=True)

# joined file
lst = os.path.join(a.out, 'list.txt')
gap = os.path.join(a.out, '_gap.wav')
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'anullsrc=r=48000:cl=mono', '-t', str(SENTENCE_GAP_S), gap], check=True)
with open(lst, 'w') as fh:
    for i, f in enumerate(finals):
        fh.write(f"file '{os.path.abspath(f)}'\n")
        if i < len(finals) - 1: fh.write(f"file '{os.path.abspath(gap)}'\n")
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(a.out, 'all_lines.wav')], check=True)
os.remove(lst); os.remove(gap)
print('done:', os.path.join(a.out, 'all_lines.wav'))
