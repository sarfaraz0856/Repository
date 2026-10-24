"""Scene 02 (0:05-0:10) audio: abandoned-building room tone (12 %), book page flutter
at 0:08 (20 %), narration at 100 %, with the hook's wind and drone continuing from 0:05.

Usage: scene02_audio.py WORK_DIR OUT_DIR
WORK_DIR needs voice_proc_s02.wav, wind_hook.wav and music_hook.wav (from audio_synth.py).
"""
import sys
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import ndimage, signal

from audio_synth import SR, reverb_ir, convolve_stereo, smooth_random  # noqa: E402

work, out = sys.argv[1], sys.argv[2]
rng = np.random.default_rng(502)
meter = pyln.Meter(SR)
REF = -16.0
MASTER_DB = 1.98          # Scene 01 master gain, so the wind/drone bed stays seamless across the cut
START, SCENE = 5.0, 5.0   # scene starts at 0:05 on the hook timeline
VOICE_AT, FLUTTER_AT = 0.30, 3.0


def room_tone(duration):
    """Empty concrete building: low rumble, faint room modes, airy hiss, slow breathing."""
    n = int(duration * SR)
    breathe = 0.8 + 0.2 * smooth_random(int(duration / 2) + 2, duration, 1.2, rng)
    chans = []
    for ch in range(2):
        b, a = signal.butter(2, 180 / (SR / 2))
        rumble = signal.lfilter(b, a, np.cumsum(rng.standard_normal(n)) * 0.02)
        b, a = signal.butter(2, 25 / (SR / 2), "high")
        rumble = signal.lfilter(b, a, rumble)
        modes = np.zeros(n)
        for f0, q in ((63.0, 9), (98.0, 11), (141.0, 12), (212.0, 10)):
            bb, aa = signal.iirpeak(f0 / (SR / 2), q)
            modes += signal.lfilter(bb, aa, rng.standard_normal(n))
        b, a = signal.butter(2, [400 / (SR / 2), 3500 / (SR / 2)], "band")
        air = signal.lfilter(b, a, rng.standard_normal(n))
        y = rumble / np.std(rumble) + 0.45 * modes / np.std(modes) + 0.18 * air / np.std(air)
        chans.append(y * breathe)
    y = np.stack(chans, 1)
    t = np.arange(n) / SR
    y *= (np.clip(t / 0.4, 0, 1) * np.clip((duration - t) / 0.3, 0, 1))[:, None]
    return y / np.max(np.abs(y)) * 0.89


def page_flutter():
    """A page lifting in the draught: a few quick paper flaps, a whoosh, then a soft settle."""
    total = int(2.2 * SR)
    dry = np.zeros(total)

    def burst(at, dur, amp, lo, hi):
        m = int(dur * SR)
        tt = np.arange(m) / SR
        env = np.minimum(1, tt / 0.003) * np.exp(-tt / (dur * 0.35))
        b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
        x = signal.lfilter(b, a, rng.standard_normal(m))
        clicks = (rng.random(m) < 600 / SR) * rng.standard_normal(m) * 6
        bh, ah = signal.butter(2, 2500 / (SR / 2), "high")
        x = x / np.std(x) + signal.lfilter(bh, ah, clicks)
        s = int(at * SR)
        dry[s:s + m] += amp * x * env

    for at, amp in ((0.00, 1.0), (0.085, 0.85), (0.16, 0.75), (0.25, 0.55), (0.37, 0.35)):
        burst(at + 0.01 + rng.uniform(-0.008, 0.008), 0.045, amp, 1200, 7000)
    m = int(0.45 * SR)
    tt = np.arange(m) / SR
    b, a = signal.butter(2, [250 / (SR / 2), 1100 / (SR / 2)], "band")
    whoosh = signal.lfilter(b, a, rng.standard_normal(m))
    dry[:m] += 0.5 * whoosh / np.std(whoosh) * np.sin(np.pi * tt / 0.45) ** 2
    burst(0.85, 0.06, 0.45, 300, 3500)                          # page settles back
    b, a = signal.butter(2, 9000 / (SR / 2))
    dry = signal.lfilter(b, a, dry)
    st = np.stack([dry * 0.55, dry * 0.45], 1)
    wet = convolve_stereo(st, reverb_ir(1.6, 1.2, rng, lp_start=7000, lp_end=1500, predelay=0.012))
    y = st + 0.5 * wet * (np.sqrt(np.mean(st ** 2)) / np.sqrt(np.mean(wet ** 2)))
    t = np.arange(total) / SR
    y *= np.clip((2.2 - t) / 0.4, 0, 1)[:, None]
    return y / np.max(np.abs(y)) * 0.89


def load(name):
    y, sr = sf.read(f"{work}/{name}", always_2d=True)
    assert sr == SR, (name, sr)
    return y if y.shape[1] == 2 else np.repeat(y, 2, 1)


def match(y, active=None):
    seg = y if active is None else y[: int(active * SR)]
    return y * 10 ** ((REF - meter.integrated_loudness(seg)) / 20)


def place(y, at):
    buf = np.zeros((int(SCENE * SR), 2))
    s = int(at * SR)
    k = min(len(y), len(buf) - s)
    buf[s:s + k] = y[:k]
    return buf


n = int(SCENE * SR)
s0 = int(START * SR)
voice = place(match(load("voice_proc_s02.wav")), VOICE_AT)
room = match(room_tone(SCENE)) * 0.12
flutter = place(match(page_flutter()), FLUTTER_AT) * 0.20
wind = match(load("wind_hook.wav"))[s0:s0 + n] * 0.15
music = match(load("music_hook.wav"), active=42.0)[s0:s0 + n] * 0.10

master = 10 ** (MASTER_DB / 20)
sfx = room + flutter
bed = wind + music


def limit(y, ceiling):
    # transparent peak limiter: 5 ms look-ahead, gain never above what each peak needs
    need = np.minimum(1, ceiling / np.maximum(np.max(np.abs(y), 1), 1e-9))
    need = ndimage.minimum_filter1d(need, 481)
    return y * ndimage.uniform_filter1d(need, 241)[:, None]


raw_voice = voice
ceiling = np.max(np.abs(raw_voice))
while np.max(np.abs((voice + sfx + bed) * master)) > 0.84:   # peak <= -1.5 dBFS
    ceiling *= 0.97
    voice = limit(raw_voice, ceiling)
with_voice = (voice + sfx + bed) * master
peak = np.max(np.abs(with_voice))
print("Scene 02: %.1f LUFS, peak %.2f dBFS" % (meter.integrated_loudness(with_voice), 20 * np.log10(peak)))
assert peak < 0.89


def write(name, y):
    sf.write(f"{out}/{name}", (y * master).astype(np.float32), SR, subtype="PCM_24")


write("Scene02_mix_WITH_VOICE.wav", voice + sfx + bed)
write("Scene02_mix_NO_VOICE.wav", sfx + bed)
write("stems/Scene02_voice_at_0.30s.wav", voice)
write("stems/Scene02_room_tone_12pct.wav", room)
write("stems/Scene02_page_flutter_at_3.00s.wav", flutter)
