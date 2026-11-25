# Fukushima: cut one chapter (or the cold open) from the rendered shots, place the narration, add the chapter card
# and captions, synthesise the score, mix and encode. Usage: python3 fk_cut.py fk3 [fk4 ...]   (run from chernobyl/)
# Output: out/fkcut/<sec>.mp4 (1080p, -15 LUFS) and out/fkcut/<sec>.json (timing, used for the subtitles).
import sys, os, json, glob, subprocess
import numpy as np
from PIL import Image, ImageFilter
from scipy.io import wavfile
sys.path.insert(0, os.getcwd())
from titles2 import layer
S = '/tmp/claude-0/-home-user-Repository/b4b3560f-6a95-5352-8f12-41136e99024b/scratchpad'; DOC = f'{S}/doc'
OUT = 'out/fkcut'; os.makedirs(OUT, exist_ok=True)
SB, MD, RG = 'InterDisplay-SemiBold.otf', 'InterDisplay-Medium.otf', 'InterDisplay-Regular.otf'
DURS = dict(FK1=14, FK1B=18, FK1C=18, FK1D=18, FK2A=18, FK2B=14, FK3A=16, FK3B=18, FK3C=18, FK3D=18, FK4A=18, FK4B=22, FK4C=16,
            FK5A=18, FK5B=18, FK5C=18, FK6A=16, FK6B=16, FK6C=16, FK7A=18, FK7B=18, FK7C=14, FK8A=20, FKMAP=14)
# per chapter: card (None for the cold open), shots [(shot, in, out)], captions [(title, sub, at fraction of the chapter)],
# score spec, events in SHOT time [(kind, shot, t, arg)]
C = {
 'fk0': dict(card=None, shots=[('FK3B', 4, 12), ('FK3A', 9, 15), ('FK5B', 2.5, 9), ('FK1C', 6, 12)], caps=[('11 MARCH 2011', '14:46', 0.08)],
             mood='dark', amb=['sea'], ev=[('quake', 'FK3B', 4, 5), ('wave', 'FK3A', 9, 6), ('boom', 'FK5B', 4, 1.4)], t0=0.6, title='FUKUSHIMA'),
 'fk1': dict(card=('CHAPTER 1', 'THE QUIET COAST'), shots=[('FK1', 0, 9), ('FK1B', 2, 10), ('FK1C', 4, 12), ('FK1D', 6, 14), ('FK7A', 4, 18)],
             caps=[('FUKUSHIMA DAIICHI', 'SIX REACTORS ON THE PACIFIC COAST', 0.18), ('11 MARCH 2011', 'UNITS 1–3 RUNNING · UNITS 4–6 SHUT FOR INSPECTION', 0.45), ('FUTABA', '"NUCLEAR POWER: ENERGY FOR A BRIGHT FUTURE"', 0.84)],
             mood='calm', amb=['sea', 'birds']),
 'fk2': dict(card=('CHAPTER 2', 'THE GREAT EARTHQUAKE'), shots=[('FK2B', 0, 14), ('FK2A', 0, 18), ('FK1B', 4, 12)],
             caps=[('14:46', 'MAGNITUDE 9.0', 0.12), ('THE REACTORS SHUT DOWN', 'THE EMERGENCY DIESEL GENERATORS START', 0.62)],
             mood='tense', amb=['room'], ev=[('quake', 'FK2B', 2.4, 11.6), ('quake', 'FK2A', 2.4, 15.6), ('alarm', 'FK2A', 5, 13)]),
 'fk3': dict(card=('CHAPTER 3', 'THE WAVE'), shots=[('FK3A', 0, 16), ('FK3B', 0, 18), ('FK3C', 0, 18), ('FK3D', 0, 18)],
             caps=[('15:35 · THE TSUNAMI ARRIVES', 'THE MAIN WAVE WAS ABOUT 14–15 M HIGH', 0.2), ('THE GENERATORS FLOOD', 'THEY STOOD IN THE TURBINE HALL BASEMENTS', 0.7)],
             mood='dark', amb=['sea'], ev=[('wave', 'FK3A', 5, 11), ('wave', 'FK3B', 2, 14), ('wave', 'FK3C', 0, 16)]),
 'fk4': dict(card=('CHAPTER 4', 'STATION BLACKOUT'), shots=[('FK4A', 0, 18), ('FK2A', 13, 18), ('FK4B', 0, 9)],
             caps=[('15:41 · STATION BLACKOUT', 'UNITS 1–4 LOSE ALL POWER', 0.15), ('DECAY HEAT', 'THE SHUT-DOWN FUEL KEEPS MAKING HEAT', 0.6)],
             mood='dark', amb=['room'], ev=[('tick', 'FK4A', 0, 18), ('hit', 'FK4A', 0.2, 0)]),
 'fk5': dict(card=('CHAPTER 5', 'THE MELTDOWN'), shots=[('FK4B', 4, 22), ('FK4C', 0, 16)],
             caps=[('THE CORE IS UNCOVERED', 'OVER 2,000 °C', 0.25), ('HYDROGEN', 'IT GATHERS UNDER THE ROOF OF THE REACTOR BUILDING', 0.72)],
             mood='dark', amb=[], ev=[('riser', 'FK4B', 12, 9)]),
 'fk6': dict(card=('CHAPTER 6', 'THE FIRST EXPLOSION'), shots=[('FK5A', 0, 18), ('FKMAP', 0, 14)],
             caps=[('12 MARCH · 15:36', 'UNIT 1 EXPLODES', 0.12)],
             mood='tense', amb=['wind'], ev=[('boom', 'FK5A', 5, 0.9)]),
 'fk7': dict(card=('CHAPTER 7', 'THREE REACTORS'), shots=[('FK5B', 0, 18), ('FK5C', 0, 18)],
             caps=[('14 MARCH · 11:01', 'UNIT 3 EXPLODES', 0.08), ('15 MARCH', 'UNIT 4 EXPLODES · UNIT 2 RELEASES THE MOST RADIATION', 0.55)],
             mood='tense', amb=['wind'], ev=[('boom', 'FK5B', 4, 1.5)]),
 'fk8': dict(card=('CHAPTER 8', 'THE FUKUSHIMA 50'), shots=[('FK6C', 0, 16), ('FK4A', 0, 14)],
             caps=[('THE FUKUSHIMA 50', 'THE WORKERS WHO STAYED', 0.12), ('MASAO YOSHIDA', 'PLANT MANAGER · KEPT PUMPING SEA WATER IN', 0.64)],
             mood='tense', amb=['wind'], ev=[('tick', 'FK6C', 0, 16)]),
 'fk9': dict(card=('CHAPTER 9', 'WATER FROM THE SKY'), shots=[('FK6A', 0, 16), ('FK6B', 0, 16)],
             caps=[('17 MARCH', 'CH-47 HELICOPTERS DROP SEA WATER ON UNIT 3', 0.12), ('FIRE ENGINES AND BOOM TRUCKS', 'SPRAYING THE SPENT FUEL POOLS', 0.6)],
             mood='tense', amb=['wind'], ev=[('heli', 'FK6A', 0, 16), ('spray', 'FK6B', 0, 16)]),
 'fk10': dict(card=('CHAPTER 10', 'THE EMPTY TOWNS'), shots=[('FK7A', 0, 18), ('FK1', 2, 12)],
             caps=[('~154,000 EVACUATED', 'FROM THE TOWNS AROUND THE PLANT', 0.18), ('12 APRIL 2011', 'RATED INES LEVEL 7 · THE SAME AS CHERNOBYL', 0.72)],
             mood='calm', amb=['wind', 'birds']),
 'fk11': dict(card=('CHAPTER 11', 'THE WATER PROBLEM'), shots=[('FK7B', 0, 18), ('FK7C', 0, 14)],
             caps=[('1,000+ WATER TANKS', 'FILLED WITH CONTAMINATED WATER', 0.2), ('THE ICE WALL', 'FROZEN SOIL AROUND THE REACTOR BUILDINGS', 0.55), ('24 AUGUST 2023', 'THE RELEASE OF TREATED WATER BEGINS', 0.8)],
             mood='calm', amb=['wind']),
 'fk12': dict(card=('CHAPTER 12', 'THE LESSON'), shots=[('FK1C', 0, 18), ('FK8A', 0, 20)],
             caps=[('DECOMMISSIONING', 'EXPECTED TO TAKE 30–40 YEARS', 0.5)],
             mood='hope', amb=['sea'], endcard=True),
}
def shot_file(s):
    if s == 'FKMAP': return 'out/fk/FKMAP.mov'
    fs = sorted(glob.glob(f'out/fk/{s}_*.mov')); n = sum(1 for f in fs if os.path.exists(f[:-4] + '.done'))
    need = -(-int(DURS[s] * 24) // 168)
    if n < need: raise SystemExit(f'{s}: {n}/{need} chunks rendered')
    lst = f'out/fkcut/{s}.txt'; open(lst, 'w').write(''.join(f"file '{os.path.abspath(f)}'\n" for f in fs[:need])); return lst
def still(rows, yc, path, shadow=0.5, glow=1.0):
    base = layer(rows, yc); A = np.asarray(base, np.float32) / 255
    G = np.asarray(base.filter(ImageFilter.GaussianBlur(9)), np.float32) / 255 * 0.34 * glow + np.asarray(base.filter(ImageFilter.GaussianBlur(30)), np.float32) / 255 * 0.2 * glow
    Wt = np.clip(A + G * (1 - A), 0, 1); Sh = np.clip(np.asarray(base.filter(ImageFilter.GaussianBlur(22)), np.float32) / 255 * 2.2, 0, 1) * shadow
    al = np.clip(Wt + Sh * (1 - Wt), 0, 1); wf = np.where(al > 1e-4, Wt / np.maximum(al, 1e-4), 1)
    rgba = np.zeros((1080, 1920, 4), np.uint8); rgba[..., 0] = 255 * wf; rgba[..., 1] = 250 * wf; rgba[..., 2] = 242 * wf; rgba[..., 3] = al * 255
    Image.fromarray(rgba, 'RGBA').save(path)
def build(sec):
    c = C[sec]; L = json.load(open(f'{DOC}/lines.json'))
    lines = L[sec]; dur = [len(wavfile.read(f'{DOC}/G_{sec}_{i}.wav')[1]) / 48000 for i in range(len(lines))]
    T0 = c.get('t0', 3.4); GAP = 0.55; st = []; s = T0
    for d in dur: st.append(round(s, 3)); s += d + GAP
    LC = round(st[-1] + dur[-1] + (6.0 if c.get('endcard') else 2.2), 2)
    if c['card'] is None: LC = max(LC, st[-1] + dur[-1] + 3.4)
    L[sec] = [[st[i], lines[i][1]] for i in range(len(lines))]; json.dump(L, open(f'{DOC}/lines.json', 'w'), ensure_ascii=False, indent=0)
    # picture: one playback rate for the chapter, the last shot held if needed
    P = sum(b - a for _, a, b in c['shots']); r = min(1.25, max(0.72, P / LC))
    segs = []; acc = 0.0
    for sh, a, b in c['shots']:
        d = (b - a) / r
        if acc + d > LC: d = LC - acc
        if d <= 0.05: break
        segs.append((sh, a, d)); acc += d
    hold = max(0.0, LC - acc)
    cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-y']; fc = []; starts = {}
    t = 0.0
    for k, (sh, a, d) in enumerate(segs):
        f = shot_file(sh)
        cmd += (['-f', 'concat', '-safe', '0'] if f.endswith('.txt') else []) + ['-ss', f'{a:.3f}', '-t', f'{d * r + 0.1:.3f}', '-i', f]
        pad = f',tpad=stop_mode=clone:stop_duration={hold:.3f}' if k == len(segs) - 1 and hold > 0 else ''
        fc.append(f'[{k}:v]setpts=(PTS-STARTPTS)/{r:.5f},fps=24,trim=0:{d:.3f},setpts=PTS-STARTPTS{pad},format=yuv444p[v{k}]')
        starts.setdefault(sh, (t, a)); t += d
    fc.append(''.join(f'[v{k}]' for k in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=0[base]')
    n = len(segs); last = 'base'; ov = []
    W = f'{OUT}/{sec}'; os.makedirs(W, exist_ok=True)
    if c['card']:
        still([(c['card'][0], MD, 36, 0.5, 26), (c['card'][1], SB, 96, 0.22, 0)], 0.46, f'{W}/card.png'); ov.append((f'{W}/card.png', 0.5, 3.6))
    if c.get('title'):
        still([(c['title'], SB, 130, 0.3, 30), ('THE REAL STORY · DOCUMENTARY', MD, 34, 0.5, 0)], 0.46, f'{W}/title.png'); ov.append((f'{W}/title.png', LC - 3.6, 3.2))
    for j, (tt, sub, at) in enumerate(c['caps']):
        still([(tt, SB, 50, 0.3, 22), (sub, RG, 30, 0.3, 0)], 0.82, f'{W}/cap{j}.png'); a0 = max(4.0 if c['card'] else 0.5, at * LC); ov.append((f'{W}/cap{j}.png', a0, 5.0))
    if c.get('endcard'):
        still([('FUKUSHIMA', SB, 110, 0.3, 30), ('11 MARCH 2011', MD, 36, 0.5, 0)], 0.46, f'{W}/end.png'); ov.append((f'{W}/end.png', LC - 5.6, 5.0))
    for j, (png, a0, d) in enumerate(ov):
        cmd += ['-loop', '1', '-t', f'{a0 + d + 0.1:.2f}', '-i', png]
        fc.append(f'[{n + j}:v]format=rgba,fade=t=in:st={a0:.2f}:d=0.8:alpha=1,fade=t=out:st={a0 + d - 0.9:.2f}:d=0.9:alpha=1[o{j}];[{last}][o{j}]overlay=0:0:eof_action=pass:format=auto[l{j}]')
        last = f'l{j}'
    fin = 0.6 if c['card'] is None else 1.0
    fc.append(f'[{last}]fade=t=in:st=0:d={fin},fade=t=out:st={LC - 1.0:.2f}:d=1.0,format=yuv420p[vout]')
    # score + sound
    ev = []
    for kind, sh, ts, arg in c.get('ev', []):
        if sh in starts: t_sh, a = starts[sh]; ev.append([kind, round(t_sh + (ts - a) / r, 2), arg if kind != 'quake' and kind not in ('wave', 'heli', 'alarm', 'spray', 'tick', 'riser') else arg / r])
    ev.append(['hit', 0.3, 0]) if c['card'] else None
    spec = dict(dur=LC, key={'calm': 0, 'tense': 1, 'dark': -2, 'hope': 0}[c['mood']], mood=c['mood'], amb=c['amb'], events=ev)
    json.dump(spec, open(f'{W}/spec.json', 'w'))
    subprocess.run(['python3', 'fk_audio.py', f'{W}/spec.json', f'{W}/score.wav'], check=True)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{W}/score.wav', '-af', 'loudnorm=I=-19:TP=-3:LRA=20,aresample=48000', '-ac', '2', '-c:a', 'pcm_f32le', f'{DOC}/bed_{sec}.wav'], check=True)
    env = dict(os.environ, GAP='0.3')
    subprocess.run(['python3', 'mix.py', 'G', sec, f'bed_{sec}.wav', os.path.abspath(f'{W}/mix.wav'), '0.045', '0', 'full'], cwd=DOC, env=env, check=True, stdout=subprocess.DEVNULL)
    os.remove(f'{DOC}/bed_{sec}.wav')
    cmd += ['-i', f'{W}/mix.wav', '-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', f'{n + len(ov)}:a', '-t', f'{LC:.3f}',
            '-af', 'alimiter=limit=0.85:attack=5:release=120:level=disabled,loudnorm=I=-15:TP=-1.5:LRA=18,aresample=48000',
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-tune', 'grain',
            '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', f'{OUT}/{sec}.mp4']
    subprocess.run(cmd, check=True)
    json.dump(dict(LC=LC, starts=st, dur=dur, rate=r, hold=hold), open(f'{OUT}/{sec}.json', 'w'))
    print(sec, 'LC', LC, 'rate', round(r, 3), 'hold', round(hold, 2))
for sec in sys.argv[1:]: build(sec)
