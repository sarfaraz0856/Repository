import sys, numpy as np, soundfile as sf, noisereduce as nr
x, sr = sf.read(sys.argv[1])
noise = x[int(0.3 * sr):int(3.2 * sr)]            # leading stretch before speech starts
y = nr.reduce_noise(y=x, sr=sr, y_noise=noise, stationary=True, prop_decrease=0.95, n_fft=2048)
y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
sf.write(sys.argv[2], y, sr)
