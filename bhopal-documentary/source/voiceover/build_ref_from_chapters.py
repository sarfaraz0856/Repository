# Rebuilds the FreeVC voice reference from the finished chapters 1-8, for when the private 54 s recording is not available.
# It cuts every narrated line out of the chapter MP4s (with the timing mix.py uses) and joins them into one ~260 s file.
# Tested on chapter 9: the re-narrated chapter matched the original at 0.976 (Resemblyzer cosine), the same as
# original chapter 8 vs original chapter 9.
# Usage: python3 build_ref_from_chapters.py LINES_JSON QF_DIR CHAPTERS_DIR OUT_WAV
import json, wave, subprocess, glob, sys, os, tempfile
L = json.load(open(sys.argv[1])); QF, CH, OUT = sys.argv[2], sys.argv[3], sys.argv[4]
tmp = tempfile.mkdtemp(); parts = []
for c in range(1, 9):
    mp4 = glob.glob(os.path.join(CH, f'chapter{c}', '*.mp4'))[0]; prev = -1.0
    for i, (t0, _) in enumerate(L[f'bh{c}']):
        with wave.open(os.path.join(QF, f'qf_bh{c}_{i}.wav')) as w: d = w.getnframes() / w.getframerate()
        a = max(t0, prev + 0.36); prev = a + d
        f = os.path.join(tmp, f'seg_{c}_{i}.wav'); parts.append(f)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a + 0.05:.2f}', '-t', f'{d - 0.1:.2f}', '-i', mp4, '-ac', '1', '-ar', '24000', f], check=True)
lst = os.path.join(tmp, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, OUT], check=True)
print(len(parts), 'lines ->', OUT)
