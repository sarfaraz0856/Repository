# Pripyat Hook: Scene 02 (0:05 – 0:10)

> **"School mein bachchon ki kitaabein... aaj bhi khuli padi hain."**

**Format:** 1920×1080 (16:9), 30 fps, 5.0 s, H.264 + AAC 48 kHz. Mix at −14.1 LUFS, peak −1.5 dBFS. Look and grade same as Scene 01.

## Files

| File | Kya hai |
|---|---|
| `Scene02_preview_WITH_VOICE.mp4` | Poora scene: visual, voice, room tone, page flutter, wind aur drone |
| `Scene02_preview_NO_VOICE.mp4` | Same, bina voice ke |
| `Scene02_mix_WITH_VOICE.wav` | Scene 02 ka final audio (apne Clip 2 ke neeche, 0:05 par) |
| `Scene02_mix_NO_VOICE.wav` | Same mix, voice ke bina |
| `stems/Scene02_voice_at_0.30s.wav` | Sirf voice (5 s file, voice 0.30 s par) |
| `stems/Scene02_room_tone_12pct.wav` | Khaali building ka room tone, 12% (0.4 s fade-in, 0.3 s fade-out) |
| `stems/Scene02_page_flutter_at_3.00s.wav` | Panna phadphadane ki awaaz, 20%, file ke andar 3.00 s par (yaani 0:08) |
| `thumbnail_frame.jpg` | Uthe hue panne wala still |

Wind aur drone ke liye Scene 01 wale **HOOK stems** hi chalte rahenge (`../scene-01/stems/HOOK_*.wav`, 0:00 se). Scene 02 ka bed unhi ka 0:05–0:10 wala hissa hai, isliye cut par koi jump nahi aata.

## Cue sheet

| Hook time | Scene time | Video | Audio |
|---|---|---|---|
| 0:05.00 | 0.00 | Scene 01 se **seedha cut** | Room tone shuru (0.4 s fade-in, 12%); wind + drone chalte rehte hain |
| 0:05.33 | 0.33 | | Voice: "School mein bachchon ki kitaabein..." |
| 0:07.19 – 0:07.68 | 2.19 – 2.68 | | "..." wala aadha second ka pause |
| 0:07.95 | 2.95 | Kitaab ka ek panna uthna shuru | |
| 0:08.00 | 3.00 | | Page flutter (20%) |
| 0:08.43 | 3.43 | Panna sabse upar | |
| 0:08.85 – 0:08.90 | 3.85 – 3.90 | Panna wapas baith jaata hai | Panne ke baithne ki halki awaaz |
| 0:08.96 | 3.96 | | Voice khatam: "...aaj bhi khuli padi hain." |
| 0:09.70 – 0:10.00 | 4.70 – 5.00 | | Room tone 0.3 s mein fade-out |
| 0:10.00 | 5.00 | Scene 03 par cut | |

Poore shot mein chalkboard ki taraf slow push-in hota hai (0.15 m), aur window ki roshni mein dhool udti rehti hai. Screen par koi text nahi hai.

## Editor mein kaise lagana hai

1. **V1:** Apna Clip 2, 0:05 se 0:10, Scene 01 ke baad seedha cut (koi transition nahi).
2. **A1:** `stems/Scene02_voice_at_0.30s.wav` 0:05 par, ya apni recorded voice 0:05.33 par.
3. **A2:** `stems/Scene02_room_tone_12pct.wav` 0:05 par.
4. **A5:** `stems/Scene02_page_flutter_at_3.00s.wav` 0:05 par. Panne ki awaaz khud 0:08 par aayegi. Agar aapke Clip 2 mein panna kisi aur waqt hilta hai, to is file ko utna khisko do.
5. Wind (A3) aur drone (A4) Scene 01 se hi chalte rahenge, unhe chhedna nahi hai.

**Levels:** Saare stems pehle se balanced hain, isliye sab 100% par rakho. Scene 01 wala hi master gain laga hai, taaki dono scene ek jaisi awaaz mein judein.

## Apni awaaz record karni ho to

- `Scene02_preview_NO_VOICE.mp4` chalao aur 0:00.33 (hook mein 0:05.33) par bolna shuru karo.
- "kitaabein..." ke baad aadha second ruko, jaisa script ke Notes mein likha hai.
- Line ~0:09.0 tak khatam ho jaaye.

## Zaroori notes

- **Visual sirf placeholder hai.** Code se render kiya gaya classroom hai, photoreal nahi. Isme:
  - Floor ke paas se 28mm low angle, aur foreground mein floor par khuli textbook (sharp)
  - Ulti-padi desks aur kursiyan, aur bikhre kaagaz aur kitaabein
  - Peeche soft green chalkboard, aur jahan portrait tanga tha wahan halka nishaan
  - Peeling green paint, aur floorboards ke beech ghaas
  - Left ki gandi windows se roshni ki shafts, aur hawa mein dhool

  Final ke liye apna Clip 2 (aapke card wala ChatGPT prompt + motion prompt) iski jagah lagao.
- **Room tone aur page flutter** dono code se synthesize kiye gaye hain, isliye copyright-free hain. Library wali awaaz lagani ho to keywords `abandoned building room tone` aur `book page flutter` hain, aur level wahi 12% aur 20% rakho.
- **Voice** wahi Kokoro `hm_omega` hai jo Scene 01 mein thi, same speed aur processing ke saath.
