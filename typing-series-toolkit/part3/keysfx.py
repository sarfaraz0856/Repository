import json, math, random, struct, wave
T = json.load(open('../ui/src/p3timing.json'))
SR, DUR = 44100, T['total']
n = int(SR * DUR); buf = [0.0] * n; random.seed(7)
for e in T['ev']:
    start = int(e['t'] * SR); amp = 0.55 + 0.15 * random.random(); f0 = 150 + 50 * random.random()
    for i in range(int(0.07 * SR)):
        x = i / SR
        s = amp * (0.55 * (random.random() * 2 - 1) * math.exp(-x * 380) + 0.45 * math.sin(2 * math.pi * f0 * x) * math.exp(-x * 70))
        if start + i < n: buf[start + i] += s
with wave.open('keys.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 32767 * 0.6)) for v in buf))
print('key sounds', len(T['ev']))
