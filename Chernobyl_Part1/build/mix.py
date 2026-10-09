"""
Audio: voice placement, wind bed, timed SFX, music (with ducking), final mix,
two-pass loudnorm mastering, stems and the 'voice is always on top' check.
"""
import numpy as np

import config as C
import sfx_synth as S
from audio_utils import (SR, automation, db, fade, fit_len, loudnorm_two_pass, lufs, limiter, momentary,
                         normalize_lufs, place, read_audio, secs, stereo, write_wav)
from voice import PRE_ROLL

AUDIO_EXT = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac", ".aiff", ".aif"}
LOOPED = {"flags", "crowd_far", "construction", "city", "square", "hum_plant", "powerline",
          "reactor_hall", "room_tone", "wind", "music_nostalgic", "music_dark"}


# ------------------------------------------------------------- user files ---
def find_file(folder, keys, exclude=()):
    if not folder.exists():
        return None
    files = [p for p in sorted(folder.iterdir()) if p.suffix.lower() in AUDIO_EXT]
    for k in keys:
        for p in files:
            name = p.stem.lower()
            if k in name and not any(x in name for x in exclude):
                return p
    return None


def _loop_to(x, n, xf=0.5):
    """Repeat a recording with 0.5 s crossfades until it is n samples long."""
    if len(x) >= n:
        return x[:n]
    k = min(secs(xf), len(x) // 3)
    out = x.copy()
    ramp = np.sin(np.linspace(0, np.pi / 2, k))[:, None] ** 2
    while len(out) < n:
        head = x.copy()
        out[-k:] = out[-k:] * (1 - ramp) + head[:k] * ramp
        out = np.concatenate([out, head[k:]])
    return out[:n]


def load_user_sound(path, name, dur):
    x = read_audio(path, channels=2).astype(np.float64)
    n = secs(dur)
    if name == "clock" and len(x) < secs(2.0):          # a single tick -> one per second
        tick = x
        x = np.zeros((n, 2))
        for k in range(int(round(dur))):
            place(x, tick, k)
        return x
    if name in LOOPED or name.startswith("music"):
        return _loop_to(x, n)
    return fit_len(x, n)


# ------------------------------------------------------------- the timeline ---
class Timeline:
    """Scene starts after any extensions. Converts ORIGINAL times to the new ones."""

    def __init__(self, scenes):
        self.scenes = scenes
        self.base_starts = np.cumsum([0] + [10.0] * 8)                  # 0, 10, ... 80
        t = 0.0
        for sc in scenes:
            sc["start"] = round(t, 4)
            t += sc["dur"]
            sc["end"] = round(t, 4)
        self.total = round(t, 4)

    def scene_at_base(self, t):
        i = int(np.searchsorted(self.base_starts, t + 1e-9, side="right") - 1)
        return min(max(i, 0), len(self.scenes) - 1)

    def map(self, t):
        """Original absolute time -> new absolute time (moves with its scene)."""
        i = self.scene_at_base(t)
        return self.scenes[i]["start"] + (t - self.base_starts[i])

    def by_id(self, sid):
        return next(s for s in self.scenes if s["id"] == sid)


def resolve_event(tl, ev):
    t0 = tl.map(ev["t"])
    i = tl.scene_at_base(ev["t"])
    sc = tl.scenes[i]
    if ev.get("dur") == "scene":
        t0 = sc["start"] - (C.XFADE / 2 if i > 0 else 0.0)
        t1 = sc["end"] + (C.XFADE / 2 if i < len(tl.scenes) - 1 and sc.get("xout") else 0.0)
        return t0, t1 - t0
    if ev.get("dur") == "to_end":
        return t0, tl.total - t0
    if "until" in ev:
        return t0, tl.map(ev["until"]) - t0
    return t0, float(ev["dur"])


# ------------------------------------------------------------------ ducking ---
def duck_gain(voice, depth_db, attack, release, lookahead=0.1, hold=0.25):
    hop = secs(0.005)
    m = np.max(np.abs(voice), axis=1)
    k = len(m) // hop
    rms = np.sqrt(np.mean(m[:k * hop].reshape(k, hop) ** 2, axis=1))
    act = (rms > rms.max() * db(-32)).astype(float)
    la = int(lookahead / 0.005)
    act = np.concatenate([act[la:], np.zeros(la)])
    aa, ar = np.exp(-0.005 / attack), np.exp(-0.005 / release)
    env = np.zeros(k)
    state, hold_n, h = 0.0, int(hold / 0.005), 0
    for i in range(k):
        if act[i] > 0:
            h = hold_n
        target = 1.0 if h > 0 else 0.0
        h -= 1
        state = target + (state - target) * (aa if target > state else ar)
        env[i] = state
    g = db(depth_db * env)
    return np.interp(np.arange(len(voice)), np.arange(k) * hop + hop / 2, g)


# --------------------------------------------------------------------- build ---
def build_audio(tl, lines, log=print):
    N = secs(tl.total)
    voice = np.zeros((N, 2))
    for sc in tl.scenes:
        place(voice, stereo(lines[sc["id"]]["audio"]), sc["start"] + C.VOICE_LEAD_IN - PRE_ROLL)

    sources = []
    amb = np.zeros((N, 2))           # wind bed + room tone
    sfx = np.zeros((N, 2))
    music = np.zeros((N, 2))

    # ---- wind bed
    wf = find_file(C.SFX_DIR, C.WIND["keys"], exclude=("gust",))
    if wf:
        wind = load_user_sound(wf, "wind", tl.total)
        sources.append(("wind bed", f"file {wf.name}"))
    else:
        wind = S.wind_bed(tl.total)
        sources.append(("wind bed", "synthesized"))
    wind = normalize_lufs(fade(wind, 0.4, 0.0), C.VOICE_LUFS)
    rise = tl.map(C.WIND["rise_at"])
    fade_from = tl.map(C.WIND["fade_from"])
    lvl = automation(N, [(0, db(C.PCT_DB[C.WIND["pct_start"]])), (rise, db(C.PCT_DB[C.WIND["pct_start"]])),
                         (rise + C.WIND["rise_len"], db(C.PCT_DB[C.WIND["pct_end"]])),
                         (fade_from, db(C.PCT_DB[C.WIND["pct_end"]])), (tl.total, 0.0)])
    amb += wind * lvl[:, None]

    # ---- timed sounds
    for ev in C.SFX_EVENTS:
        t0, dur = resolve_event(tl, ev)
        name = ev["name"]
        f = find_file(C.SFX_DIR, ev["keys"], exclude=("gust",) if name != "gust" else ())
        offset = 0.0
        if f:
            snd = load_user_sound(f, name, dur)
            src = f"file {f.name}"
            if name in ("drawer", "key"):              # line the hit up with the event time
                mono = np.max(np.abs(snd), axis=1)
                idx = int(np.argmax(mono)) if name == "drawer" else int(np.argmax(mono > mono.max() * db(-30)))
                offset = idx / SR
        elif name == "drawer":
            snd, offset = S.drawer()
            src = "synthesized"
        else:
            snd = S.SYNTHS[name](dur)
            src = "synthesized"
        fin = 0.0 if name in C.NO_FADE else (0.4 if dur >= 2 else 0.3)
        fout = ev.get("fout", 0.4 if dur >= 2 else 0.3)
        snd = fade(fit_len(snd, secs(dur + offset)), fin, fout)
        snd = normalize_lufs(snd, C.VOICE_LUFS) * db(C.PCT_DB[ev["pct"]])
        place(amb if name == "room_tone" else sfx, snd, t0 - offset)
        sources.append((f"{name} at {t0:.1f} s ({ev['pct']}%)", src))
    # wind + room tone fade to zero at the end
    amb *= automation(N, [(0, 1), (fade_from, 1), (tl.total, 0)])[:, None]

    # ---- music
    mc = C.MUSIC
    s17 = tl.by_id("S17")["start"]
    xf_end = s17 + mc["crossfade"]
    nf = find_file(C.MUSIC_DIR, mc["nostalgic"]["keys"])
    if nf:
        nos = load_user_sound(nf, "music_nostalgic", xf_end)
        sources.append(("music nostalgic", f"file {nf.name}"))
    else:
        nos = S.nostalgic_music(xf_end + 0.5)
        sources.append(("music nostalgic", "synthesized (piano Am-F-C-G + strings)"))
    nos = fit_len(nos, secs(xf_end))
    nos = fade(nos, mc["nostalgic"]["fade_in"], 0.0)
    k = secs(mc["crossfade"])
    nos[-k:] *= (np.cos(np.linspace(0, np.pi / 2, k)) ** 2)[:, None]
    nos = normalize_lufs(nos, C.VOICE_LUFS) * db(C.PCT_DB[mc["nostalgic"]["pct"]])
    place(music, nos, 0.0)

    dark_end = tl.map(mc["dark"]["fade_out_to"])
    dark_fade = tl.map(mc["dark"]["t1"])
    df = find_file(C.MUSIC_DIR, mc["dark"]["keys"])
    if df:
        dark = load_user_sound(df, "music_dark", dark_end - s17)
        sources.append(("music dark", f"file {df.name}"))
    else:
        dark = S.dark_drone(dark_end - s17)
        sources.append(("music dark", "synthesized (55/82 Hz drone)"))
    dark = fit_len(dark, secs(dark_end - s17))
    dark[:k] *= (np.sin(np.linspace(0, np.pi / 2, k)) ** 2)[:, None]
    kf = secs(dark_end - dark_fade)
    dark[-kf:] *= (np.cos(np.linspace(0, np.pi / 2, kf)) ** 2)[:, None]
    dark = normalize_lufs(dark, C.VOICE_LUFS) * db(C.PCT_DB[mc["dark"]["pct"]])
    place(music, dark, s17)

    music *= duck_gain(voice, mc["duck_db"], mc["duck_attack"], mc["duck_release"])[:, None]
    return dict(voice=voice, amb=amb, sfx=sfx, music=music, sources=sources)


def protect_voice(stems, margin_db=6.5, log=print):
    """Safety net: wherever wind+effects+music come within `margin_db` of the speaking
    voice, lower the effects and wind just there (fast attack, slow release)."""
    from scipy.ndimage import maximum_filter1d
    hop = 0.05
    v = stems["voice"]
    mv = momentary(v, hop)
    speaking = mv > lufs(v) - 8
    total = np.zeros(len(v))
    for _ in range(3):
        mb = momentary(stems["amb"] + stems["sfx"] + stems["music"], hop)
        need = np.where(speaking, np.maximum(0.0, mb - (mv - margin_db)), 0.0)
        if need.max() < 0.25:
            break
        k = int(round(0.4 / hop))
        need = maximum_filter1d(need, size=k, origin=(k - 1) // 2)   # each 400 ms block -> all of its samples
        need = maximum_filter1d(need, size=3) * 1.3 + 0.3 * (need > 0)
        a_rel = np.exp(-hop / 0.25)
        env = np.zeros_like(need)
        s = 0.0
        for i, x in enumerate(need):
            s = x if x > s else x + (s - x) * a_rel
            env[i] = s
        g_db = np.interp(np.arange(len(v)) / SR, np.arange(len(env)) * hop, env)
        total += g_db
        g = db(-g_db)[:, None]
        stems["sfx"] = stems["sfx"] * g
        stems["amb"] = stems["amb"] * g
    if total.max() > 0.1:
        t = np.argmax(total) / SR
        log(f"    voice protection: effects lowered by up to {total.max():.1f} dB (most at {t:.1f} s)")
    return float(total.max()), float(np.argmax(total) / SR)


def master(stems, log=print):
    """Sum, bring to -14 LUFS with a true-peak limiter, then ffmpeg loudnorm (two passes)."""
    mix = stems["voice"] + stems["amb"] + stems["sfx"] + stems["music"]
    pre_l = lufs(mix)
    g = C.MASTER_LUFS - pre_l
    pre, min_gain = limiter(mix * db(g), ceiling_db=-2.0)
    C.WORK.mkdir(parents=True, exist_ok=True)
    pre_path, master_path = C.WORK / "premaster.wav", C.WORK / "master.wav"
    write_wav(pre_path, pre, "FLOAT")
    p1, p2 = loudnorm_two_pass(str(pre_path), str(master_path), C.MASTER_LUFS, -1.5, 20.0)
    linear = p2.get("normalization_type") == "linear"
    total_gain = g + (C.MASTER_LUFS - float(p1["input_i"]) if linear else 0.0)
    log(f"    mix before mastering {pre_l:.1f} LUFS, gain {g:+.1f} dB, limiter max reduction "
        f"{-20 * np.log10(min_gain):.1f} dB, loudnorm mode: {p2.get('normalization_type')}")
    return dict(master=master_path, pre_lufs=pre_l, gain_db=total_gain, loudnorm=p2, limiter_db=-20 * np.log10(min_gain))


def export_stems(stems, gain_db, log=print):
    g = db(gain_db)
    files = {
        C.STEMS / "01_voice.wav": stems["voice"],
        C.STEMS / "02_wind_and_room_tone.wav": stems["amb"],
        C.STEMS / "03_sfx.wav": stems["sfx"],
        C.STEMS / "04_music_ducked.wav": stems["music"],
        C.BUILD / "voice_only.wav": stems["voice"],
        C.BUILD / "sfx_music_only.wav": stems["amb"] + stems["sfx"] + stems["music"],
    }
    for p, x in files.items():
        fmt = write_wav(p, x * g)
        log(f"    wrote {p.relative_to(C.PROJECT)} ({'24-bit' if fmt == 'PCM_24' else '32-bit float'})")
    return list(files)


def voice_check(stems):
    """Is the voice clearly louder than everything else at every point?"""
    v = stems["voice"]
    bed = stems["amb"] + stems["sfx"] + stems["music"]
    mv, mb = momentary(v), momentary(bed)
    vi = lufs(v)
    speaking = mv > vi - 8
    margin = mv[speaking] - mb[speaking]
    worst = int(np.argmin(np.where(speaking, mv - mb, 99)))
    return dict(voice_lufs=vi, min_margin=float(margin.min()), median_margin=float(np.median(margin)),
                worst_time=worst * 0.1, bed_max=float(mb.max()), bed_max_time=float(np.argmax(mb) * 0.1),
                bed_lufs=lufs(bed))
