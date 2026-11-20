import json, subprocess
T = json.load(open('../ui/src/p3timing.json'))
SPEED, LEAD, TOTAL = 1.1, T['lead'], T['total']
f = [
    f"[1:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(LEAD*1000)}|{int(LEAD*1000)},apad=whole_dur={TOTAL},asplit=2[vo][sc]",
    f"[2:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:{TOTAL},volume=0.35,afade=t=in:st=0:d=0.6,afade=t=out:st={TOTAL-3}:d=3[mu]",
    "[mu][sc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=450[duck]",
    "[3:a]aformat=channel_layouts=stereo,volume=0.8[kx]",
    f"[vo][duck][kx]amix=inputs=3:normalize=0,atrim=0:{TOTAL},atempo={SPEED}[aout]",
    f"[0:v]setpts=PTS/{SPEED}[vout]",
]
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "../ui/out/Part3.mp4", "-i", "vo_p3.mp3",
    "-stream_loop", "-1", "-i", "../music.wav", "-i", "keys.wav", "-filter_complex", ";".join(f),
    "-map", "[vout]", "-map", "[aout]", "-t", f"{TOTAL/SPEED:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    "-r", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "typing_test_part3.mp4"], check=True)
