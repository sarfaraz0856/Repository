"""Full hook timeline and mix for the edit, following the script's Notes:

- voice 100 %, ~150 wpm, half-second "..." pauses; each scene starts at its script time or,
  if the previous line is still running, right after it ("clip ko voice ke hisaab se khisko")
- music (dark drone) 10 % under the voice, ducking up ~3 dB in gaps, 20 % in the 2 s pause,
  ending on the title hit; wind 15 % for the whole hook
- room tone 12 %, small SFX 16-25 %, the blast 75 % (big hit, no voice over it)
- every SFX faded in/out, voice peaks <= -3.5 dBFS, mix about -14 LUFS

Usage: hook_audio.py VOICE_DIR OUT_DIR
VOICE_DIR holds v_01.wav ... v_08b.wav (Kokoro lines through the voice.py ffmpeg chain).
Writes OUT_DIR/timeline.json, OUT_DIR/HOOK_mix_*.wav and OUT_DIR/stems/HOOK_*.wav.
"""
import json
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import ndimage

import audio_synth as A
import scene02_audio as S2
import sfx_hook as X

SR = 48000
FPS = 25
LEAD, GAP = 0.30, 0.45            # cut -> voice, end of one line -> start of the next
SCRIPT = {"01": 0, "02": 5, "03": 10, "04": 15, "05": 20, "06": 25, "07": 30, "08": 35, "09": 42}
TITLE_LEN = 4.0
REF, TARGET = -16.0, -14.0
VOICE_PEAK = 10 ** (-3.5 / 20)
MIX_PEAK = 10 ** (-1.0 / 20)
meter = pyln.Meter(SR)


def snap(t):
    return round(t * FPS) / FPS


def voiced(path):
    a, sr = sf.read(path, always_2d=True)
    assert sr == SR
    m = a[:, 0]
    w = int(0.01 * sr)
    e = np.array([np.sqrt(np.mean(m[i:i + w] ** 2)) for i in range(0, len(m) - w, w)])
    v = e > e.max() * 0.03
    idx = np.nonzero(v)[0]
    best, cur, rng_ = 0, 0, None
    for i in range(idx[0], idx[-1] + 1):
        cur = cur + 1 if not v[i] else 0
        if cur > best:
            best, rng_ = cur, ((i - cur + 1) * 0.01, (i + 1) * 0.01)
    return np.repeat(a, 2, 1) if a.shape[1] == 1 else a, idx[0] * 0.01, (idx[-1] + 1) * 0.01, rng_


def build_timeline(vdir):
    V = {k: voiced(f"{vdir}/v_{k}.wav") for k in ("01", "02", "03", "04", "05", "06a", "06b", "07", "08a", "08b")}
    tl = {"scenes": {}, "voices": {}, "events": {}}

    def put(key, start):
        _, v0, v1, _ = V[key]
        tl["voices"][key] = dict(file=f"v_{key}.wav", at=round(start - v0, 3), start=round(start, 3),
                                 end=round(start + v1 - v0, 3))
        return start + v1 - v0

    def next_scene(key, end):
        s = snap(max(SCRIPT[key], end + GAP - LEAD))
        tl["scenes"][key] = s
        return s

    tl["scenes"]["01"] = 0.0
    end = put("01", LEAD)
    for k in ("02", "03", "04", "05"):
        end = put(k, next_scene(k, end) + LEAD)
    s = next_scene("06", end)
    boom = snap(put("06a", s + LEAD) + 0.20)
    tl["events"]["boom"] = boom
    end = put("06b", boom + 1.5)
    end = put("07", next_scene("07", end) + LEAD)
    s = next_scene("08", end)
    e08a = put("08a", s + LEAD)
    tl["events"]["pause"] = [round(e08a, 3), round(e08a + 2.0, 3)]
    end = put("08b", e08a + 2.0)
    title = snap(max(SCRIPT["09"], end + 0.8))
    tl["scenes"]["09"] = title
    tl["end"] = title + TITLE_LEN
    p0, p1 = V["05"][3]                      # the "..." in line 05: cut to the dosimeter there
    tl["events"]["cut05"] = snap(tl["voices"]["05"]["at"] + 0.5 * (p0 + p1))
    return tl, V


def momentary_max(y):
    """Loudest 400 ms block (LUFS) - a fair level reference for short or sparse effects."""
    w, hop = int(0.4 * SR), int(0.1 * SR)
    if len(y) < w:
        y = np.vstack([y, np.zeros((w - len(y), 2))])
    vals = [meter.integrated_loudness(y[i:i + w]) for i in range(0, len(y) - w + 1, hop)]
    return max(v for v in vals if np.isfinite(v))


PEAK_REF = 0.5        # narration peak before the master gain (about -6 dBFS)


def to_ref(y, mode="integrated"):
    """Scale to the narration reference: integrated or loudest-400 ms loudness, or peak for
    sub-heavy effects whose loudness reading would hugely overstate their safe level."""
    if mode == "peak":
        return y * PEAK_REF / np.max(np.abs(y))
    lv = meter.integrated_loudness(y) if mode == "integrated" else momentary_max(y)
    return y * 10 ** ((REF - lv) / 20)


def limit(y, ceiling):
    need = np.minimum(1, ceiling / np.maximum(np.max(np.abs(y), 1), 1e-9))
    need = ndimage.minimum_filter1d(need, 481)
    return y * ndimage.uniform_filter1d(need, 241)[:, None]


def main(vdir, out):
    tl, V = build_timeline(vdir)
    sc, ev = tl["scenes"], tl["events"]
    T = tl["end"]
    N = int(T * SR)

    def place(buf, y, at):
        s = int(round(at * SR))
        a0 = max(0, -s)
        s = max(s, 0)
        k = min(len(y) - a0, N - s)
        if k > 0:
            buf[s:s + k] += y[a0:a0 + k]

    voice = np.zeros((N, 2))
    for key, v in tl["voices"].items():
        place(voice, to_ref(V[key][0]), v["at"])

    wind = to_ref(A.wind(duration=T)) * 0.15
    drone = A.music(duration=T, end_at=sc["09"])
    drone = drone * 10 ** ((REF - meter.integrated_loudness(drone[: int(sc["09"] * SR)])) / 20)

    # ducking: 10 % under the voice, 14.5 % in gaps (0.6 s hold), 20 % in the dramatic pause
    hop = SR // 100
    act = np.array([np.sqrt(np.mean(voice[i:i + hop, 0] ** 2)) for i in range(0, N, hop)]) > 0.003
    act = ndimage.binary_dilation(act, np.ones(121, bool))
    tgt = np.where(act, 0.10, 0.145)
    p0, p1 = ev["pause"]
    tgt[int((p0 + 0.25) * 100):int((p1 - 0.25) * 100)] = 0.20
    g = np.empty_like(tgt)
    g[0] = tgt[0]
    for i in range(1, len(tgt)):
        k = 0.12 if tgt[i] < g[i - 1] else 0.022        # ~80 ms down, ~450 ms up
        g[i] = g[i - 1] + k * (tgt[i] - g[i - 1])
    music = drone * np.interp(np.arange(N) / SR, np.arange(len(g)) / 100, g)[:, None]

    sfx = np.zeros((N, 2))
    cues = []

    def cue(name, y, at, pct, mode="momentary"):
        place(sfx, to_ref(y, mode) * pct, at)
        cues.append(dict(name=name, at=round(at, 2), level=f"{round(pct * 100)}%"))

    cue("Crow caw (distant)", A.crow(), 3.0, 0.10)
    cue("Room tone (abandoned building)", S2.room_tone(sc["04"] - sc["02"]), sc["02"], 0.12, "integrated")
    cue("Book page flutter", S2.page_flutter(), 8.0, 0.20)
    cue("Curtain flutter", X.curtain_flutter(2.4), sc["03"] + 1.2, 0.20)
    cue("Rusty metal creak", X.metal_creak(1.5), sc["04"] + 1.6, 0.22)
    cue("Rusty metal creak (far)", X.metal_creak(1.2, 14, 40, 0.8), sc["04"] + 4.4, 0.16)
    cue("Geiger counter", X.geiger(sc["06"] - ev["cut05"] + 0.4), ev["cut05"], 0.25, "peak")
    cue("Rumble build", X.rumble(ev["boom"] - sc["06"]), sc["06"], 0.30, "peak")
    cue("Reactor blast", X.boom(), ev["boom"], 0.75)
    cue("Distant bus engines", X.engine_hum(sc["08"] - sc["07"]), sc["07"], 0.12, "peak")
    cue("Ferris wheel creak", X.metal_creak(1.8, 10, 30, 0.9), sc["08"] + 1.0, 0.18)
    cue("Wind gust (2 s pause)", X.gust(2.6), p0 - 0.2, 0.20)
    cue("Title hit", X.title_hit(), sc["09"] - X.TITLE_PRE, 0.60)
    cue("Geiger clicks (title)", X.geiger_ticks([0.9, 1.6, 2.7], 3.4), sc["09"], 0.30, "peak")

    bed = wind + music
    G = 10 ** (2.0 / 20)
    v = voice
    for _ in range(6):
        v = limit(voice, VOICE_PEAK / G)
        lv = meter.integrated_loudness((v + sfx + bed) * G)
        G *= 10 ** ((TARGET - lv) / 20)
    v = limit(voice, VOICE_PEAK / G)
    # keep the mix under -1 dBFS by turning down only the effects (the blast), never the voice
    room = np.maximum(MIX_PEAK / G - np.max(np.abs(v + bed), 1), 0)
    need = np.minimum(1, room / np.maximum(np.max(np.abs(sfx), 1), 1e-9))
    need = ndimage.uniform_filter1d(ndimage.minimum_filter1d(need, 481), 241)
    sfx = sfx * need[:, None]
    total = (v + sfx + bed) * G

    stats = dict(lufs=round(meter.integrated_loudness(total), 2),
                 voice_peak_db=round(20 * np.log10(np.max(np.abs(v * G))), 2),
                 mix_peak_db=round(20 * np.log10(np.max(np.abs(total))), 2), master_db=round(20 * np.log10(G), 2))
    tl["cues"] = cues
    tl["stats"] = stats
    print(json.dumps(stats))

    def write(name, y):
        sf.write(f"{out}/{name}", y.astype(np.float32), SR, subtype="PCM_24")

    write("HOOK_mix_WITH_VOICE.wav", total)
    write("HOOK_mix_NO_VOICE.wav", (sfx + bed) * G)
    write("stems/HOOK_voice.wav", v * G)
    write("stems/HOOK_sfx.wav", sfx * G)
    write("stems/HOOK_music_ducked.wav", music * G)
    write("stems/HOOK_wind.wav", wind * G)
    with open(f"{out}/timeline.json", "w") as fh:
        json.dump(tl, fh, indent=1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
