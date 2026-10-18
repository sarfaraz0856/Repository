import sys, re, numpy as np, soundfile as sf, sherpa_onnx
sys.path.insert(0, "/home/user/Repository/Excel_MIS_Tutorial/scripts")
import build_video as bv, audio_fx as A, pronunciation
D = f"{bv.SCR}/tts/sherpa-onnx-whisper-small"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{D}/small-encoder.int8.onnx", decoder=f"{D}/small-decoder.int8.onnx",
        tokens=f"{D}/small-tokens.txt", language="hi", task="translate", num_threads=4)
v = A.Voice(bv.TTS_MODELS, f"{bv.WORK}/tts", voice=bv.VOICE, speed=bv.VOICE_SPEED)
rows = []
for i, b in enumerate(bv.BEATS, 1):
    w, s = v.say(pronunciation.apply(b["tts"]))
    a, sr = sf.read(w, dtype="float32")
    n = int(len(a) * 16000 / sr); a = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype("float32")
    st = rec.create_stream(); st.accept_waveform(16000, a); rec.decode_stream(st)
    cap = re.sub(r"<[^>]+>", "", b["caption"])
    rows.append((i, b["scene"], s, cap, st.result.text.strip()))
    print(i, "|", st.result.text.strip()[:110], flush=True)
with open("/home/user/Repository/Excel_MIS_Tutorial/scripts/voice_qa.md", "w") as f:
    f.write("# Voice QA - Whisper back-translation of every narration clip\n\n")
    f.write(f"Voice: Kokoro-82M `{bv.VOICE}` (AI text-to-speech, offline), speed {bv.VOICE_SPEED}.\n\n")
    f.write("Method: each generated clip was transcribed by Whisper-small (sherpa-onnx, offline) with "
            "`language=hi, task=translate`, i.e. translated to English *from the audio alone*. If the English "
            "matches the on-screen caption's meaning, the voice is intelligible. Whisper-small is not perfect "
            "at Hindi, so small wording/number slips in the right column can come from the recognizer, not the voice. "
            "Validated on an English control clip first (exact transcript).\n\n")
    f.write("| # | Scene | Sec | On-screen caption | Heard (Whisper EN translation) |\n|---|---|---|---|---|\n")
    for i, sc, s, cap, tr in rows:
        f.write(f"| {i} | {sc} | {s:.1f} | {cap.replace('|','/')} | {tr.replace('|','/')} |\n")
print("WROTE voice_qa.md")
