# Speaker similarity of each output line vs voice_reference.wav (Chatterbox VoiceEncoder cosine).
import sys, glob, numpy as np, librosa, torch
from chatterbox.models.voice_encoder import VoiceEncoder
ve = VoiceEncoder()
ve.load_state_dict(torch.load(sys.argv[1], map_location="cpu"))
ve.eval()
def emb(p):
    w, _ = librosa.load(p, sr=16000)
    e = ve.embeds_from_wavs([w], sample_rate=16000)
    e = np.asarray(e).reshape(-1)
    return e / np.linalg.norm(e)
ref = emb(sys.argv[2])
for p in sorted(glob.glob(sys.argv[3])):
    print(p.split("/")[-1], round(float(np.dot(ref, emb(p))), 3))
