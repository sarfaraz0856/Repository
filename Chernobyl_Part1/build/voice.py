"""
Voiceover: one file per scene with edge-tts (hi-IN-MadhurNeural, rate -6 %, pitch -2 Hz).

If Microsoft's TTS server cannot be reached, ALL lines switch together to an
offline fallback so the voice stays consistent:
  1) Kokoro (neural, Hindi male voice "hm_omega"; models auto-download ~350 MB)
  2) espeak-ng (robotic, last resort)
The engine that was used is written to report.txt.
"""
import asyncio
import hashlib
import json
import os
import shutil
import subprocess
import urllib.request

import numpy as np
import soundfile as sf

import config as C
from audio_utils import SR, ffmpeg_bin, highpass, lufs, read_audio, run, secs, stereo

VOICE_DIR = C.WORK / "voice"
PRE_ROLL = 0.03          # kept before the first voiced sample after trimming


# ------------------------------------------------------------------ engines ---
async def _edge_save(text, path):
    import edge_tts
    kw = dict(rate=C.EDGE_RATE, pitch=C.EDGE_PITCH)
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    if proxy:
        kw["proxy"] = proxy
    await edge_tts.Communicate(text, C.EDGE_VOICE, **kw).save(str(path))


def _tts_edge(text, path):
    last = None
    for _ in range(3):
        try:
            asyncio.run(asyncio.wait_for(_edge_save(text, path), timeout=90))
            if path.exists() and path.stat().st_size > 2000:
                return
        except Exception as e:                    # network / service problems
            last = e
    path.unlink(missing_ok=True)
    raise RuntimeError(f"edge-tts failed: {type(last).__name__}: {str(last)[:200]}")


def _kokoro_models():
    C.TTS_MODELS.mkdir(parents=True, exist_ok=True)
    paths = []
    for fn, url in C.KOKORO_URLS.items():
        p = C.TTS_MODELS / fn
        if not p.exists() or p.stat().st_size < 10000:
            print(f"    downloading offline voice model {fn} ...")
            tmp = p.with_suffix(p.suffix + ".part")
            urllib.request.urlretrieve(url, tmp)
            tmp.replace(p)
        paths.append(p)
    return paths


_KOKORO = None


def _tts_kokoro(text, path):
    global _KOKORO
    if _KOKORO is None:
        from kokoro_onnx import Kokoro          # pip install kokoro-onnx
        model, voices = _kokoro_models()
        _KOKORO = Kokoro(str(model), str(voices))
    samples, sr = _KOKORO.create(text, voice=C.KOKORO_VOICE, speed=C.KOKORO_SPEED, lang="hi")
    sf.write(str(path), samples, sr)


def _tts_espeak(text, path):
    exe = shutil.which("espeak-ng") or shutil.which("espeak")
    if not exe:
        raise RuntimeError("espeak-ng not installed")
    subprocess.run([exe, "-v", "hi", "-s", "140", "-p", "40", "-w", str(path), text], check=True)


ENGINES = {
    "edge": (_tts_edge, ".mp3", f"edge-tts {C.EDGE_VOICE} (rate {C.EDGE_RATE}, pitch {C.EDGE_PITCH})"),
    "kokoro": (_tts_kokoro, ".wav", f"Kokoro offline neural TTS, Hindi voice {C.KOKORO_VOICE} (speed {C.KOKORO_SPEED})"),
    "espeak": (_tts_espeak, ".wav", "espeak-ng Hindi (robotic fallback)"),
}


def _signature(engine, text):
    blob = json.dumps([engine, text, C.EDGE_VOICE, C.EDGE_RATE, C.EDGE_PITCH, C.KOKORO_VOICE, C.KOKORO_SPEED])
    return hashlib.sha1(blob.encode("utf-8")).hexdigest()


def _cached(engine, sid, text):
    _, ext, _ = ENGINES[engine]
    audio = VOICE_DIR / f"{sid}_{engine}{ext}"
    meta = VOICE_DIR / f"{sid}_{engine}.json"
    if audio.exists() and meta.exists():
        try:
            if json.loads(meta.read_text(encoding="utf-8")).get("sig") == _signature(engine, text):
                return audio
        except Exception:
            pass
    return None


def _make(engine, sid, text):
    fn, ext, _ = ENGINES[engine]
    audio = VOICE_DIR / f"{sid}_{engine}{ext}"
    fn(text, audio)
    (VOICE_DIR / f"{sid}_{engine}.json").write_text(json.dumps({"sig": _signature(engine, text)}), encoding="utf-8")
    return audio


def synthesize_all(scenes, engine_pref="auto", log=print):
    """Return ({scene_id: audio path}, engine_name, notes)."""
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    order = ["edge", "kokoro", "espeak"] if engine_pref == "auto" else [engine_pref]
    notes = []
    for engine in order:
        files = {}
        try:
            for sc in scenes:
                path = _cached(engine, sc["id"], sc["text"])
                if path is None:
                    log(f"    {sc['id']}: generating with {engine} ...")
                    path = _make(engine, sc["id"], sc["text"])
                files[sc["id"]] = path
            return files, engine, notes
        except Exception as e:
            msg = f"{engine} could not be used: {str(e)[:220]}"
            log("    !! " + msg)
            notes.append(msg)
    raise RuntimeError("No TTS engine worked. Check your internet connection (edge-tts) and try again.")


# --------------------------------------------------------------- processing ---
def _trim(x):
    win = secs(0.01)
    k = len(x) // win
    r = np.sqrt(np.mean(x[:k * win].reshape(k, win) ** 2, axis=1))
    on = np.where(r > r.max() * 10 ** (-40 / 20))[0]
    a = max(0, on[0] * win - secs(PRE_ROLL))
    b = min(len(x), (on[-1] + 1) * win + secs(0.08))
    return x[a:b]


def _atempo(x, tempo):
    tmp_in, tmp_out = VOICE_DIR / "_atempo_in.wav", VOICE_DIR / "_atempo_out.wav"
    sf.write(str(tmp_in), x.astype(np.float32), SR, subtype="FLOAT")
    run([ffmpeg_bin(), "-v", "error", "-y", "-i", tmp_in, "-af", f"atempo={tempo:.4f}", "-ar", str(SR), tmp_out])
    y = read_audio(tmp_out, channels=1)[:, 0].astype(np.float64)
    tmp_in.unlink(missing_ok=True)
    tmp_out.unlink(missing_ok=True)
    return y


def prepare_lines(scenes, files, log=print):
    """Trim, fit to the scene (atempo <= 1.10, else extend the scene), normalise to -16 LUFS.
    Mutates scene durations when an extension is needed. Returns per-scene line info."""
    lines = {}
    avail_pad = C.VOICE_LEAD_IN + C.VOICE_TAIL
    for sc in scenes:
        x = read_audio(files[sc["id"]], channels=1)[:, 0].astype(np.float64)
        x = _trim(x)
        speech = len(x) / SR - PRE_ROLL
        avail = sc["dur"] - avail_pad
        tempo, ext = 1.0, 0.0
        if speech > avail:
            need = speech / avail
            tempo = min(need * 1.003, C.MAX_ATEMPO)
            x = _atempo(x, tempo)
            speech = len(x) / SR - PRE_ROLL
            if speech > avail:
                ext = np.ceil((speech - avail) * C.FPS + 1e-6) / C.FPS
                sc["dur"] = round(sc["dur"] + ext, 4)
        x = highpass(x, 70)
        x[:secs(0.005)] *= np.linspace(0, 1, secs(0.005))
        x[-secs(0.02):] *= np.linspace(1, 0, secs(0.02))
        x *= 10 ** ((C.VOICE_LUFS - lufs(stereo(x))) / 20)          # dual-mono stereo at -16 LUFS
        lines[sc["id"]] = dict(audio=x, speech=speech, tempo=tempo, ext=ext, raw_len=len(x) / SR)
        log(f"    {sc['id']}: {speech:5.2f} s of speech (room {sc['dur'] - avail_pad:4.1f} s)"
            + (f", sped up x{tempo:.3f}" if tempo > 1 else "") + (f", scene extended +{ext:.2f} s" if ext else ""))
    return lines
