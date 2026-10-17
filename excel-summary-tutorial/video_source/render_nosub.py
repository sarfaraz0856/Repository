import sys, json, subprocess, pickle
import engine as E
FPS = 30
def run(idx, f0, f1, ops, subs):
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", f"chunks_nosub/c{idx:02d}.mp4"]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE); cache = {}; last = None; si = 0
    for f in range(f0, f1):
        T = f / FPS; st = E.state_at(ops, T)
        sub = None
        for a, b, txt in subs:
            if a <= T < b: sub = txt; break
        key = (repr(st), sub)
        if key != last:
            frame = E.render_frame(st, sub, cache).tobytes(); last = key
        p.stdin.write(frame)
    p.stdin.close(); p.wait()
if __name__ == "__main__":
    d = pickle.load(open("tl_nosub.pkl", "rb")); i, n = int(sys.argv[1]), int(sys.argv[2])
    N = int(d["total"] * FPS); f0 = N * i // n; f1 = N * (i + 1) // n
    run(i, f0, f1, d["ops"], d["subs"])
