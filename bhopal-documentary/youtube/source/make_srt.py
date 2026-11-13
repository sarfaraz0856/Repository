# Builds the Hindi and English SRT files and the Hindi narration script for the full 15-chapter Bhopal film.
# Chapters are 60 s each, back to back. A cue starts where mix.py places the line: at its time in lines.json,
# or 0.36 s after the previous line ends, whichever is later. It ends 0.25 s after the spoken line.
# Usage: python3 make_srt.py LINES_JSON VOICE_DIR   (VOICE_DIR holds qf_bhN_i.wav, one Piper line per file)
import json, wave, sys, textwrap, os
H = json.load(open(sys.argv[1])); V = sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(HERE)
E = json.load(open(os.path.join(HERE, 'en.json')))
T = ['THE NIGHT', 'WHAT WENT WRONG', 'THE ESCAPE', 'THE STATION', 'THE HOSPITAL', 'THE MORNING', 'THE TOLL', 'WARREN ANDERSON',
     'THE SETTLEMENT', 'THE POISON STAYS', 'THE NEXT GENERATION', 'THE FIGHT', 'THE MEMORIAL', 'THE LESSON', 'EPILOGUE']
def dur(p):
    with wave.open(p) as w: return w.getnframes() / w.getframerate()
def ts(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
def wrap(txt, n):
    lines = textwrap.wrap(txt, n)
    if len(lines) > 2: lines = textwrap.wrap(txt, int(len(txt) / 2) + 4)
    return '\n'.join(lines)
hi, en = [], []
script = ['BHOPAL GAS TRAGEDY – HINDI NARRATION SCRIPT (आपकी आवाज़ में बोली गई पूरी narration)',
          '=' * 85, '']
k = 0
for c in range(1, 16):
    sec = f'bh{c}'; off = (c - 1) * 60.0; prev = -1.0
    script += ['', f'■ {T[c - 1]}  ({c - 1}:00)', '']
    assert len(E[sec]) == len(H[sec]), sec
    for i, (t0, txt) in enumerate(H[sec]):
        d = dur(os.path.join(V, f'qf_{sec}_{i}.wav'))
        a = max(t0, prev + 0.36); prev = a + d
        k += 1; h = ' '.join(txt.replace('|', ' ').split())
        A, B = off + a, off + a + d + 0.25
        hi.append(f'{k}\n{ts(A)} --> {ts(B)}\n{wrap(h, 42)}\n'); en.append(f'{k}\n{ts(A)} --> {ts(B)}\n{wrap(E[sec][i], 44)}\n')
        mm, ss = divmod(A, 60); script.append(f'[{int(mm)}:{ss:04.1f}]  {h}')
open(os.path.join(OUT, 'Bhopal-Subtitles-Hindi.srt'), 'w').write('\n'.join(hi))
open(os.path.join(OUT, 'Bhopal-Subtitles-English.srt'), 'w').write('\n'.join(en))
open(os.path.join(OUT, 'Bhopal-Narration-Script-Hindi.txt'), 'w').write('\n'.join(script) + '\n')
print(k, 'cues')
