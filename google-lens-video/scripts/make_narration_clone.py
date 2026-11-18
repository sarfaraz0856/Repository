"""Generates the 6-minute narration in the creator's own cloned voice with Chatterbox Multilingual
(Resemble AI, MIT license - commercial use allowed), language 'hi', from a short clean reference
clip of the creator's voice. One WAV per sentence -> public/long/vo/<scene>_<n>.wav (48 kHz mono),
same post-processing chain as before; durations -> narration/durations.json.

Run inside a venv with:  pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
                         pip install chatterbox-tts==0.1.7
Usage: python scripts/make_narration_clone.py --ref /path/to/your_voice_reference.wav
Outputs carry Resemble's inaudible Perth watermark (built into Chatterbox)."""
import json, os, subprocess, sys, tempfile, time
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

ROOT = os.path.join(os.path.dirname(__file__), '..')
REF = sys.argv[sys.argv.index('--ref') + 1]
OUT = os.path.join(ROOT, 'public', 'long', 'vo')
CHAIN = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,'
         'aresample=48000:resampler=soxr')
torch.set_num_threads(4)
script = json.load(open(os.path.join(ROOT, 'narration', 'script_6min.json')))
model = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
model.prepare_conditionals(REF, exaggeration=0.5)


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)


durs = {}
t0 = time.time()
for s in script['scenes']:
    for i, line in enumerate(s['lines']):
        name = f"{s['id']}_{i + 1}"
        text = line['say']
        expect = len(text) / 14.5          # rough chars-per-second of natural Hindi speech
        best = None
        for attempt in range(4):
            torch.manual_seed(1000 + attempt * 17 + i)
            wav = model.generate(text, language_id='hi', exaggeration=0.5, cfg_weight=0.5, temperature=0.7)
            with tempfile.NamedTemporaryFile(suffix='.wav') as raw, tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as fin:
                ta.save(raw.name, wav, model.sr)
                subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', raw.name, '-af', CHAIN, '-ac', '1', fin.name], check=True)
                d = dur(fin.name)
            ratio = d / expect
            score = abs(ratio - 1)
            if best is None or score < best[0]:
                if best: os.remove(best[1])
                best = (score, fin.name, d, ratio)
            else:
                os.remove(fin.name)
            if 0.65 <= ratio <= 1.45:   # plausible length: no truncation / no rambling
                break
        os.replace(best[1], os.path.join(OUT, name + '.wav'))
        durs[name] = round(best[2], 3)
        print(f'{name:10s} {best[2]:5.1f}s  ratio {best[3]:.2f}  tries {attempt + 1}  elapsed {time.time() - t0:5.0f}s', flush=True)
json.dump({'engine': 'chatterbox-multilingual (voice clone)', 'durations': durs}, open(os.path.join(ROOT, 'narration', 'durations.json'), 'w'), indent=1)
print('total speech', round(sum(durs.values()), 1), 's')
