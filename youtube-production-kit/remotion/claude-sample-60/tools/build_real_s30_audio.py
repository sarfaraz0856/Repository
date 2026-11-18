"""Audio for the 30 s 'real Claude screen' sample: the full mix from Scene 4's start (frame 5301)
plus mouse clicks and soft key taps that match the on-screen cursor and typing (src/real/Sample30.tsx)."""
import os, subprocess, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, FPS, START, DUR = 48000, 30, 5301, 930
CLICKS = [118, 168, 210, 372, 688, 798]
TYPING = [("YouTube Content Assistant", 222, 14), ("Help me research, plan and create high-quality YouTube content for my audience.", 528, 16),
          ("Role: Tum mere YouTube content strategy assistant ho. Tumhara kaam hai mujhe engaging scripts, better video ideas, compelling titles aur thumbnail concepts banane mein madad karna.", 830, 20)]
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{START / FPS:.4f}", "-t", f"{DUR / FPS:.4f}", "-i", os.path.join(ROOT, "public/audio/full_mix.wav"),
                      "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
mix = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
N = len(mix); rng = np.random.default_rng(3); sfx = np.zeros(N, np.float32)
def burst(ln, amp, dec, lp):
    t = np.arange(int(ln * SR)) / SR; x = rng.standard_normal(len(t)).astype(np.float32)
    x = np.convolve(x, np.ones(lp) / lp, mode="same"); return (x * amp * np.exp(-dec * t)).astype(np.float32)
def put(sig, fr, g=1.0):
    a = int(fr / FPS * SR); b = min(N, a + len(sig))
    if a < N: sfx[a:b] += g * sig[:b - a]
for c in CLICKS:
    put(burst(.025, .55, 260, 3), c); put(burst(.03, .35, 220, 3), c + 3)          # press + release
for txt, at, cps in TYPING:
    for k, ch in enumerate(txt):
        fr = at + k * 30 / cps
        if fr >= DUR - 2: break
        put(burst(.03, .16 if ch != " " else .22, 300, 5 if ch != " " else 9), fr, 0.8 + 0.4 * rng.random())
out = mix + sfx[:, None] * 0.5
t = np.arange(N) / SR; fade = np.minimum(1, t / 0.25) * np.minimum(1, (DUR / FPS - t) / 0.45)
out *= fade[:, None]; out /= max(1.0, np.abs(out).max() / 0.89)
sf.write(os.path.join(ROOT, "public/audio/real_s30.wav"), out.astype(np.float32), SR)
print("ok", round(N / SR, 2), "s")
