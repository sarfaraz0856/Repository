"""Mix Scene 01 (0:00-0:05) per the cue sheet and export premixed stems.

Levels follow the sheet as linear gains relative to the narration (all stems first
loudness-matched to the same reference): wind 15 %, crow 10 %, music 10 %.
"""
import sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import ndimage

SR = 48000
work, out = sys.argv[1], sys.argv[2]
meter = pyln.Meter(SR)
REF = -16.0           # every stem is matched to this before the sheet's % is applied
TARGET = -14.0        # YouTube loudness for the finished mix
SCENE = 5.0
VOICE_AT, CROW_AT = 0.40, 3.0


def load(name):
    y, sr = sf.read(f"{work}/{name}", always_2d=True)
    assert sr == SR, (name, sr)
    return y if y.shape[1] == 2 else np.repeat(y, 2, 1)


def match(y, active=None):
    seg = y if active is None else y[: int(active * SR)]
    return y * 10 ** ((REF - meter.integrated_loudness(seg)) / 20)


voice = match(load("voice_proc.wav"))
crow = match(load("crow.wav"))
wind = match(load("wind_hook.wav"))
music = match(load("music_hook.wav"), active=42.0)

wind *= 0.15
crow *= 0.10
music *= 0.10


def place(y, at, length):
    buf = np.zeros((int(length * SR), 2))
    s = int(at * SR)
    n = min(len(y), len(buf) - s)
    buf[s:s + n] = y[:n]
    return buf


n = int(SCENE * SR)
v_s = place(voice, VOICE_AT, SCENE)
c_s = place(crow, CROW_AT, SCENE)
bed = wind[:n] + music[:n]


def limit(y, ceiling):
    # transparent peak limiter: 5 ms look-ahead, gain never above what each peak needs
    need = np.minimum(1, ceiling / np.maximum(np.max(np.abs(y), 1), 1e-9))
    need = ndimage.minimum_filter1d(need, 481)
    return y * ndimage.uniform_filter1d(need, 241)[:, None]


for _ in range(4):
    with_voice = v_s + c_s + bed
    master = 10 ** ((TARGET - meter.integrated_loudness(with_voice)) / 20)
    peak = np.max(np.abs(with_voice * master))
    if peak < 0.85:
        break
    v_s = limit(v_s, 0.82 / master - np.max(np.abs(c_s + bed)))
print("master gain %.2f dB, peak %.2f dBFS" % (20 * np.log10(master), 20 * np.log10(peak)))
assert peak < 0.89, "needs limiting"

fade = np.ones((n, 1))
fade[-int(0.015 * SR):, 0] = np.linspace(1, 0, int(0.015 * SR))


def write(name, y, end_fade=True):
    y = y * master
    if end_fade:
        y = y * fade
    sf.write(f"{out}/{name}", y.astype(np.float32), SR, subtype="PCM_24")
    print(name, "%.2fs" % (len(y) / SR), "%.1f LUFS" % meter.integrated_loudness(y) if len(y) > SR else "")


write("Scene01_mix_WITH_VOICE.wav", with_voice)
write("Scene01_mix_NO_VOICE.wav", c_s + bed)
write("stems/Scene01_voice_at_0.40s.wav", v_s)
write("stems/Scene01_crow_at_3.00s.wav", c_s)
write("stems/HOOK_wind_howl_0-46s.wav", wind, end_fade=False)
write("stems/HOOK_dark_drone_0-46s_ends_0-42.wav", music, end_fade=False)
