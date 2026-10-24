# Manual recording checklist (needed before publishing)

## Why manual recordings are needed

The production machine is a cloud container. Its network policy blocks `claude.ai` (HTTP 403), and it has no
logged-in Claude account. Scenes 1–3 therefore use an **illustrative demo UI**, labelled "DEMO UI" on screen.
Its layout follows the Claude Help Center articles listed in `storyboard.md`. **Replace those scenes with your own
real screen recordings before you publish.**

Scene 4 (Claude Code) is already a **genuine recording**: Claude Code CLI v2.1.310 running in a real terminal,
captured with FFmpeg from a virtual display, on a fictional demo project. It can stay as is.
You can also re-record it on your own machine with `scripts/record_terminal.sh`.

## Recording setup

- [ ] 1920×1080 display (or browser window at 1920×1080); 100 % zoom; light theme (it matches the edit). Dark theme also works.
- [ ] Use a **fresh or demo account view**: hide or rename private chats. Create 5–6 harmless demo chats first,
      e.g. "Python loop samjhao", "Leave application draft", "Excel VLOOKUP help".
- [ ] Hide your email, real name, organisation name, API keys and notifications (Do Not Disturb on).
      Blur anything left over in the edit.
- [ ] Turn on cursor highlighting if your recorder supports it. Move the mouse slowly and deliberately; pause about 1 s on each target.
- [ ] Record at 30 fps (OBS: Output → Recording → MP4/MKV, CRF ≈ 18; or the Windows/macOS built-in recorder).
- [ ] Save files into `claude_tutorial/recordings/` with the names below. Don't overwrite the existing files.

## Shots to record (matching the sample timeline)

| File name | For scene | What to capture (about 15–20 s each, with spare handles) |
|---|---|---|
| `rec_s1_home_clean.mp4` | S1 0:00–0:06 | Claude home screen with nothing open, mouse still for 5 s (the edit zooms in toward the message box, sidebar and model menu). |
| `rec_s2_sidebar.mp4` | S2 0:06–0:18 | Hover over the left sidebar → hover/click **New chat** → hover the conversation list and **Chats and tasks** → hover the message box → hover the **"+"** button → click your **initials/name (bottom-left)** so the menu with **Settings** shows → close it. |
| `rec_s3_plus_menu.mp4` | S3 0:18–0:24 | Click **"+"** (lower-left of the chat box). Hover **Add files or photos**, then the tool options your account shows (e.g. **Web search**, if listed). Close the menu. Don't actually upload a private file. |
| `rec_s3_model_menu.mp4` | S3 0:24–0:30 | Click the **model name next to the send button**. Hover the models your plan shows, and **More models** if present. Close without changing anything. |
| `rec_s4_claude_code.mp4` (optional) | S4 0:30–0:43 | Terminal or VS Code in the fictional demo project (`assets/demo_project_todo-app`). Run `ls`, then `claude --version`, then `claude -p "Is project ki files 3 short points mein explain karo"`. Keep your login and account details off screen. |

## Things to note while recording (put them in the next episode's script)

- [ ] Exact labels in **your** "+" menu (they vary by plan, by organisation settings, and between the classic and new Claude experience).
      The Help Center notes that in the new Claude experience there is **no web search toggle**; Claude searches when it judges it helpful.
- [ ] Which models appear in your model menu (Enterprise admins can hide models and effort levels).
- [ ] Your plan (Free / Pro / Max / Team / Enterprise). Mention it on screen whenever a feature depends on it.

## After recording

1. Copy the clips into `recordings/`.
2. Replace the demo-UI time ranges (0:00–0:30) in the edit. Keep the same highlight boxes and captions.
   The coordinates are in `graphics/scenes.html`, so they can be moved to match the real UI.
3. Run `scripts/assemble_video.sh` again (it refuses to overwrite: rename the old outputs first).
