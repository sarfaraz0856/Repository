#!/usr/bin/env python3
"""Synthesize the UI sample's SFX track: tap clicks, key ticks while typing, success chime (60s, 48kHz stereo)."""
import math, struct, wave, os
SR, DUR = 48000, 60.0
buf = [0.0] * int(SR * DUR)
def burst(t0, freq, amp, decay, length):
    s = int(t0 * SR)
    for i in range(int(length * SR)):
        if s + i < len(buf):
            tt = i / SR
            buf[s + i] += amp * math.sin(2 * math.pi * freq * tt) * math.exp(-decay * tt)
for t in [9.0, 20.0, 27.0, 30.6, 36.6, 46.0]:            # taps (match ui_sample.html)
    burst(t, 1900, 0.32, 70, 0.09); burst(t, 950, 0.18, 50, 0.09)
def ticks(a, b, n):
    for k in range(1, n + 1): burst(a + k * (b - a) / n, 3400, 0.10, 140, 0.04)
ticks(31.2, 34.8, len("Smart Learning Hindi"))
ticks(37.4, 40.2, len("@SmartLearningHindi"))
burst(40.6, 1320, 0.10, 12, 0.25)                         # "available" ping
for k, f in enumerate([784, 988, 1175, 1568]):            # success chime
    burst(48.8 + k * 0.11, f, 0.16, 5, 0.9)
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "video_build", "ui_sfx.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<hh", v, v) for v in (int(max(-1, min(1, x)) * 32767) for x in buf)))
print("audio ok", out)
