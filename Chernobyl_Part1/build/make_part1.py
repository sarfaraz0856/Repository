"""
Chernobyl documentary - Part 1 "Soviet Sapna" (88 s test video)
================================================================
Run from anywhere:   python Chernobyl_Part1/build/make_part1.py

Needs: Python 3.9+, ffmpeg + ffprobe on PATH, and
       pip install edge-tts numpy scipy soundfile pillow
       (optional offline voice fallback: pip install kokoro-onnx)

Drop your own material in and re-run:
  clips/   scene video clips  (any file name containing the scene number, e.g. scene12.mp4)
  images/  scene stills       (e.g. scene12.png / scene12.jpg)
  sfx/     real sound files   (names containing crowd, kids, car, construction, wind, ...)
  music/   music_nostalgic.*, music_dark.*

Options:
  --tts auto|edge|kokoro|espeak   voice engine (auto = edge-tts, fallbacks only if it fails)
  --workers N                     parallel render processes (default: CPU count, max 6)
  --stills-only                   only render the 4 check frames (fast look at the picture)
  --force                         re-render the picture even if nothing changed (it is cached)
"""
import argparse
import json
import os
import platform
import shutil
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config as C                                            # noqa: E402
from audio_utils import ebur128, ffmpeg_bin, run              # noqa: E402


def log(msg):
    print(msg, flush=True)


def step(title):
    log("\n=== " + title)


def check_setup():
    step("0. Setup")
    log(f"    Python {platform.python_version()} on {platform.system()}")
    if sys.version_info < (3, 9):
        sys.exit("Python 3.9 or newer is needed.")
    missing = [b for b in ("ffmpeg", "ffprobe") if not shutil.which(b)]
    if missing:
        sys.exit("ffmpeg/ffprobe not found. Install it with:\n    winget install Gyan.FFmpeg\n"
                 "then CLOSE and REOPEN the terminal (so PATH is refreshed) and run this script again.")
    v = run([ffmpeg_bin(), "-version"], capture=True).stdout.splitlines()[0]
    log(f"    {v}")
    for mod in ("edge_tts", "numpy", "scipy", "soundfile", "PIL"):
        try:
            __import__(mod)
        except ImportError:
            sys.exit(f"Python package missing: {mod}.  Run:  pip install edge-tts numpy scipy soundfile pillow")
    for d in (C.IMAGES, C.CLIPS, C.SFX_DIR, C.MUSIC_DIR, C.BUILD, C.WORK, C.PREVIEWS, C.STEMS):
        d.mkdir(parents=True, exist_ok=True)


def main():
    ap = argparse.ArgumentParser(description="Build Part 1 'Soviet Sapna' (88 s).")
    ap.add_argument("--tts", default="auto", choices=["auto", "edge", "kokoro", "espeak"])
    ap.add_argument("--workers", type=int, default=min(6, os.cpu_count() or 2))
    ap.add_argument("--stills-only", action="store_true")
    ap.add_argument("--force", action="store_true", help="re-render the picture even if nothing changed")
    args = ap.parse_args()
    try:
        sys.stdout.reconfigure(errors="replace")
    except Exception:
        pass
    t_start = time.time()
    check_setup()

    import mix
    import placeholders
    import visuals
    import voice

    scenes = [dict(sc) for sc in C.SCENES]
    base_durs = {sc["id"]: sc["dur"] for sc in scenes}

    step("1. Font for screen text")
    font_path, font_name = visuals.get_font(log)
    log(f"    using {font_name}: {font_path}")

    step("2. Voiceover")
    files, engine, tts_notes = voice.synthesize_all(scenes, args.tts, log)
    log(f"    engine: {voice.ENGINES[engine][2]}")
    lines = voice.prepare_lines(scenes, files, log)

    step("3. Timeline")
    tl = mix.Timeline(scenes)
    for i, sc in enumerate(scenes):
        prev_id = scenes[i - 1]["id"] if i else None
        next_id = scenes[i + 1]["id"] if i + 1 < len(scenes) else None
        sc["xin"] = bool(prev_id) and (prev_id, sc["id"]) not in C.HARD_CUTS
        sc["xout"] = bool(next_id) and (sc["id"], next_id) not in C.HARD_CUTS
        sc["ext_start"] = sc["start"] - (C.XFADE / 2 if sc["xin"] else 0)
        sc["ext_end"] = sc["end"] + (C.XFADE / 2 if sc["xout"] else 0)
        log(f"    {sc['id']}: {sc['start']:6.2f} - {sc['end']:6.2f} s" +
            (f"   (extended by {sc['dur'] - base_durs[sc['id']]:.2f} s)" if sc["dur"] > base_durs[sc["id"]] else ""))
    log(f"    total length {tl.total:.2f} s")

    step("4. Pictures")
    sources = visuals.find_sources(scenes)
    (C.WORK / "placeholders").mkdir(parents=True, exist_ok=True)
    (C.WORK / "clips").mkdir(parents=True, exist_ok=True)
    pic_report = {}
    for sc in scenes:
        s = sources[sc["id"]]
        sc["kind"] = s["kind"]
        if s["kind"] == "clip":
            out = C.WORK / "clips" / f"{sc['id']}.mp4"
            pic_report[sc["id"]] = "YOUR " + visuals.conform_clip(s["path"], sc["ext_end"] - sc["ext_start"], out)
            sc["render_path"], sc["src_file"] = str(out), s["path"]
        elif s["kind"] == "image":
            sc["render_path"] = sc["src_file"] = s["path"]
            pic_report[sc["id"]] = f"YOUR image {os.path.basename(s['path'])} (Ken Burns: {sc['motion']})"
        else:
            out = C.WORK / "placeholders" / f"{sc['id']}.png"
            placeholders.make_placeholder(sc["id"], sc["caption"], out, font_path)
            sc["render_path"] = sc["src_file"] = str(out)
            pic_report[sc["id"]] = f"PLACEHOLDER (generated, Ken Burns: {sc['motion']})"
        log(f"    {sc['id']}: {pic_report[sc['id']]}")
    texts = []
    for t in C.TEXTS:
        sc = tl.by_id(t["scene"])
        texts.append(dict(t, abs0=sc["start"] + t["t0"], abs1=sc["start"] + t["t1"]))
    tdir = C.WORK / "text"
    layout = visuals.render_text_pngs(texts, font_path, tdir)
    log(f"    screen text: {len(layout)} transparent PNG layers in {tdir.relative_to(C.PROJECT)}")
    plan = dict(scenes=[{k: sc[k] for k in ("id", "start", "end", "ext_start", "ext_end", "kind", "render_path",
                                             "src_file", "look", "motion")} for sc in scenes],
                total_frames=int(round(tl.total * C.FPS)), text_dir=str(tdir), text_layout=layout)
    check_times = [tl.map(t) for t in (5.0, 25.0, 55.0, 75.0)]
    if args.stills_only:
        paths = visuals.render_stills(plan, check_times + [tl.map(t) for t in (15.0, 35.0, 45.0, 65.0, 83.0)],
                                      C.PREVIEWS / "stills")
        log("    stills written:\n      " + "\n      ".join(str(p) for p in paths))
        return
    chunk_list = visuals.render_video(plan, args.workers, log, force=args.force)

    step("5. Sound: voice, wind, effects, music, mix")
    stems = mix.build_audio(tl, lines, log)
    protect = mix.protect_voice(stems, log=log)
    m = mix.master(stems, log)
    mix.export_stems(stems, m["gain_db"], log)
    vc = mix.voice_check({k: v * (10 ** (m["gain_db"] / 20)) for k, v in stems.items() if k != "sources"})

    step("6. Final encode")
    visuals.final_encode(chunk_list, m["master"], C.OUTPUT, tl.total, log)
    log(f"    wrote {C.OUTPUT}")

    step("7. Checks")
    probe = json.loads(run([ffmpeg_bin("ffprobe"), "-v", "error", "-show_entries",
                            "format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,r_frame_rate,"
                            "pix_fmt,sample_rate,channels,bit_rate,duration,nb_frames",
                            "-of", "json", C.OUTPUT], capture=True).stdout)
    fmt = probe["format"]
    vs = next(s for s in probe["streams"] if s["codec_type"] == "video")
    au = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    log(f"    duration {float(fmt['duration']):.3f} s, size {int(fmt['size']) / 1e6:.1f} MB")
    log(f"    video: {vs['codec_name']} {vs['width']}x{vs['height']} {vs['r_frame_rate']} fps {vs['pix_fmt']}, "
        f"{vs.get('nb_frames')} frames, {int(vs.get('bit_rate', 0)) / 1e6:.1f} Mbps")
    log(f"    audio: {au['codec_name']} {au['sample_rate']} Hz {au['channels']} ch {int(au.get('bit_rate', 0)) / 1000:.0f} kbps")
    previews = []
    for t_orig, t in zip((5, 25, 55, 75), check_times):
        p = C.PREVIEWS / f"preview_{t_orig:02d}s.jpg"
        run([ffmpeg_bin(), "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", C.OUTPUT, "-frames:v", "1", "-q:v", "2", p])
        previews.append(p)
    log("    previews: " + ", ".join(p.name for p in previews))
    loud = ebur128(str(C.OUTPUT))
    log(f"    final loudness {loud['I']:.1f} LUFS integrated, true peak {loud['TP']:.1f} dBTP, LRA {loud['LRA']:.1f} LU")
    log(f"    voice check: voice is at least {vc['min_margin']:.1f} dB above everything else while speaking "
        f"(median {vc['median_margin']:.1f} dB); loudest non-voice moment {vc['bed_max'] - vc['voice_lufs']:+.1f} dB "
        f"vs the voice level (at {vc['bed_max_time']:.1f} s)")

    write_report(dict(engine=engine, tts_notes=tts_notes, lines=lines, scenes=scenes, base_durs=base_durs,
                      tl=tl, pics=pic_report, sources=stems["sources"], font=font_name, master=m, loud=loud,
                      vc=vc, protect=protect, probe=(fmt, vs, au), previews=previews, minutes=(time.time() - t_start) / 60))
    log(f"\nDONE in {(time.time() - t_start) / 60:.1f} min ->  {C.OUTPUT}")


def write_report(r):
    fmt, vs, au = r["probe"]
    L = []
    add = L.append
    add("CHERNOBYL - PART 1 \"SOVIET SAPNA\" - BUILD REPORT")
    add("=" * 52)
    add(f"Output file : {C.OUTPUT.name}")
    add(f"Length      : {float(fmt['duration']):.2f} s   ({vs['width']}x{vs['height']}, {vs['r_frame_rate']} fps, "
        f"H.264 {vs['pix_fmt']}, AAC {au['sample_rate']} Hz stereo, {C.AUDIO_BITRATE}bps setting)")
    add(f"File size   : {int(fmt['size']) / 1e6:.1f} MB")
    add("")
    add("1. VOICE")
    add(f"   Engine: {voice_engine_text(r['engine'])}")
    if r["engine"] != "edge":
        add("   NOTE: This is NOT the Madhur voice. edge-tts could not reach Microsoft's server")
        add("   when this build ran, so the offline fallback voice was used. Run")
        add("   build/make_part1.py again on a PC with normal internet and it will")
        add("   automatically use hi-IN-MadhurNeural (rate -6%, pitch -2Hz).")
        for n in r["tts_notes"]:
            add(f"   ({n})")
    add("   Each line starts 0.4 s after its scene starts and ends at least 0.4 s before")
    add("   the scene ends. Voice normalised to -16 LUFS (the 100% reference level).")
    for sc in r["scenes"]:
        ln = r["lines"][sc["id"]]
        extra = []
        if ln["tempo"] > 1.0:
            extra.append(f"sped up x{ln['tempo']:.3f} (atempo)")
        if ln["ext"] > 0:
            extra.append(f"scene extended by {ln['ext']:.2f} s")
        add(f"   {sc['id']}: {ln['speech']:.2f} s of speech" + (" - " + ", ".join(extra) if extra else ""))
    add("")
    add("2. TIMING")
    changed = [sc for sc in r["scenes"] if sc["dur"] > r["base_durs"][sc["id"]]]
    if not changed:
        add("   No timing changes. All scenes kept their planned times (total 88.0 s).")
    else:
        add("   Some lines were too long even at 1.10x speed, so these scenes were extended")
        add("   and everything after them moved later. NEW TIMINGS:")
    for sc in r["scenes"]:
        add(f"   {sc['id']}: {sc['start']:6.2f} - {sc['end']:6.2f} s")
    add(f"   Total: {r['tl'].total:.2f} s")
    add("")
    add("3. PICTURES (your clip > your image > placeholder)")
    for sc in r["scenes"]:
        add(f"   {sc['id']}: {r['pics'][sc['id']]}")
    add("   Look: S10-S15 warm/soft (sat 0.85), S16 neutral-cool, S17-S18 cold/dark (sat 0.6);")
    add("   light film grain + vignette on everything; 0.5 s crossfades S10..S17; straight cut")
    add("   S17->S18; fade in from black 0-0.5 s; fade to black in S18 (84.6-85.3 s), black to the end.")
    add(f"   Screen text font: {r['font']} (rendered as transparent PNGs with Pillow).")
    add("")
    add("4. SOUNDS (file from sfx/ or music/ if found, otherwise synthesized in Python)")
    for name, src in r["sources"]:
        add(f"   {name:34s} {src}")
    add("   Levels are % of the voice (35% = -9 dB ... 6% = -24 dB): each sound is first brought")
    add("   to the voice loudness (-16 LUFS), then that gain is applied. Music is ducked by 4 dB")
    add("   under the voice (150 ms attack / 400 ms release). Ambiences that last a whole scene")
    add("   start 0.25 s early / end 0.25 s late so they crossfade together with the picture.")
    if r["protect"][0] > 0.1:
        add("   Voice protection: where an effect came too close to the narration, effects+wind")
        add(f"   were lowered automatically just there - by up to {r['protect'][0]:.1f} dB (biggest at {r['protect'][1]:.1f} s).")
    add("")
    add("5. FINAL LOUDNESS")
    m = r["master"]
    add(f"   Integrated loudness : {r['loud']['I']:.1f} LUFS   (target -14)")
    add(f"   True peak           : {r['loud']['TP']:.1f} dBTP  (limit -1.0)")
    add(f"   Loudness range      : {r['loud']['LRA']:.1f} LU")
    add(f"   ffmpeg loudnorm two-pass, mode: {m['loudnorm'].get('normalization_type')} "
        f"(mix was {m['pre_lufs']:.1f} LUFS before mastering)")
    vc = r["vc"]
    add(f"   Voice on top check  : while the narrator speaks, the voice is at least {vc['min_margin']:.1f} dB")
    add(f"                         louder than wind+effects+music together (median {vc['median_margin']:.1f} dB).")
    add(f"                         Loudest non-voice moment is {vc['bed_max'] - vc['voice_lufs']:+.1f} dB vs the voice level.")
    add("")
    add("6. FILES")
    add("   Part1_Soviet_Sapna.mp4        final video")
    add("   build/voice_only.wav          narration only (same level as in the final mix)")
    add("   build/sfx_music_only.wav      everything except the narration")
    add("   build/stems/                  01_voice, 02_wind_and_room_tone, 03_sfx, 04_music_ducked")
    add("                                 (the 4 stems add up to the final mix)")
    add("   build/previews/               frames at 5, 25, 55, 75 s")
    add("   build/*.py                    the scripts - run build/make_part1.py to rebuild")
    add("")
    add("7. HOW TO REBUILD WITH YOUR OWN MATERIAL")
    add("   Put clips in clips/ (e.g. scene12.mp4) or images in images/ (e.g. scene12.png),")
    add("   real sounds in sfx/ (e.g. crowd.wav, kids_laughing.wav, car.wav) and music in")
    add("   music/ (music_nostalgic.mp3, music_dark.mp3), then run:")
    add("       python build/make_part1.py")
    add(f"\n(Build took {r['minutes']:.1f} minutes.)")
    C.REPORT.write_text("\n".join(L) + "\n", encoding="utf-8")
    log(f"    report written: {C.REPORT}")


def voice_engine_text(engine):
    import voice
    return voice.ENGINES[engine][2]


if __name__ == "__main__":
    main()
