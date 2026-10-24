# Pripyat Hook: Scene 01 (0:00 – 0:05)

> **"Yeh ek aisa shehar hai... jahan chaalis saal se koi nahi rehta."**

**Format:** 1920×1080 (16:9), 30 fps, 5.0 s, H.264 + AAC 48 kHz. Mix at −14 LUFS (YouTube standard), peak −2.5 dBFS.

## Files

| File | Kya hai |
|---|---|
| `Scene01_preview_WITH_VOICE.mp4` | Poora scene: visual, AI voice, wind, crow aur drone |
| `Scene01_preview_NO_VOICE.mp4` | Same, bina voice ke. Apni awaaz isi timing par record karo |
| `Scene01_mix_WITH_VOICE.wav` | Scene 01 ka final audio (apne Clip 1 ke neeche lagao) |
| `Scene01_mix_NO_VOICE.wav` | Same mix, voice ke bina |
| `stems/Scene01_voice_at_0.40s.wav` | Sirf voice, 0:00.40 par placed (5 s file) |
| `stems/Scene01_crow_at_3.00s.wav` | Sirf crow caw, 0:03 par placed (5 s file) |
| `stems/HOOK_wind_howl_0-46s.wav` | **Poore hook** ka wind bed: 2 s fade-in, 0:00 se 0:46 tak |
| `stems/HOOK_dark_drone_0-46s_ends_0-42.wav` | **Poore hook** ka dark ambient drone: 0:00 se shuru, 0:42 par title hit ke saath khatam |
| `thumbnail_frame.jpg` | Placeholder visual ka ek still |

## Cue sheet (exact timing)

| Time | Video | Audio |
|---|---|---|
| 0:00.00 | Black screen | Wind fade-in shuru (2 s), drone shuru |
| 0:00.00 – 0:00.50 | Black se 0.5 s fade-in | |
| 0:00.40 | | Voice: "Yeh ek aisa shehar hai..." |
| 0:02.00 | | Wind poori level (15%) par |
| 0:02.15 – 0:02.50 | | "..." wala dramatic pause |
| 0:03.00 | | Crow caw, door se, ek baar (10%), buildings ki echo ke saath |
| 0:04.87 | | Voice khatam: "...koi nahi rehta." |
| 0:05.00 | Scene 02 par cut | Wind aur drone chalte rehte hain (HOOK stems) |

Screen par koi text nahi hai, jaisa sheet mein likha tha.

## Editor mein kaise lagana hai (CapCut / Premiere)

1. **V1:** Apna Clip 1, 0:00 se 0:05. Start par 0.5 s ka fade-in from black.
2. **A1:** `stems/Scene01_voice_at_0.40s.wav` 0:00 par (voice file ke andar hi 0.40 s par hai), ya apni recorded voice 0:00.40 par.
3. **A2:** `stems/Scene01_crow_at_3.00s.wav` 0:00 par.
4. **A3:** `stems/HOOK_wind_howl_0-46s.wav` 0:00 par, poore hook ke neeche chalne do.
5. **A4:** `stems/HOOK_dark_drone_0-46s_ends_0-42.wav` 0:00 par. Ye 0:42 par khud ruk jaata hai.

**Levels:** Saare stems pehle se balanced hain (wind 15%, crow 10%, music 10%, voice ke hisaab se), isliye editor mein **sab 100% par rakho**. Agar library ka koi aur music ya SFX use karo, tab sheet wale % lagao.

## Apni awaaz record karni ho to

- `Scene01_preview_NO_VOICE.mp4` chalao aur 0:00.40 par bolna shuru karo.
- "shehar hai..." ke baad ~0.35 s ruko, aur ~0:04.9 tak line khatam kar do.
- Dheemi, neechi, thehri hui tone rakho, jaise documentary narrator bolta hai.

## Zaroori notes

- **Visual sirf placeholder hai.** Ye code se render kiya gaya 3D scene hai (empty avenue, 16-storey panel blocks, overgrown trees, geeli toot-phooti sadak, puddles, rusty lamps, fog, slow forward dolly), photoreal AI image nahi. Is session mein image-generation available nahi tha. Final video ke liye apna Clip 1 (ChatGPT image + image-to-video motion prompt) iski jagah lagao. Timing same rahegi.
- **AI voice:** Kokoro TTS (open-source, Apache-2.0, commercial use allowed), Hindi male voice `hm_omega`, 1.5 semitone neeche kiya gaya hai taaki zyada gehri lage. Ye synthetic hai, isliye asli insaan jaisi natural nahi lagegi. Final ke liye apni awaaz behtar rahegi.
- **Music, wind aur crow** sab code se synthesize kiye gaye hain, koi sample ya library track use nahi hua. Isliye copyright ya Content ID claim ka koi risk nahi. Crow synthetic hai. Agar zyada real chahiye to library ka "crow caw distant" 0:03 par usi level par laga do.
- **Fact check:** Reactor accident 26 April 1986 ko hua tha aur Pripyat 27 April 1986 ko khaali karaya gaya. 2026 mein ye 40 saal hote hain, isliye "chaalis saal" sahi hai. Pripyat mein aaj koi resident nahi hai; zone ke workers Chernobyl town mein rukte hain, Pripyat mein nahi.
