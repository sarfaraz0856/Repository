# Storyboard v3: full episode (6:34) "Claude AI Complete Guide – Ep 01"

1920×1080 · 30 fps · H.264 + AAC. **All on-screen text is English**; narration is Hindi/Hinglish; English captions are burned in.
Every visual cue is timed from the narration timing file (`voiceover/narration_timings_v3_hm_omega.json`), so the
highlight, cursor and info card for each option appear exactly while it is being explained.

**Footage**
- Claude AI scenes: the user's **real Claude home screen**: `graphics/claude_home_pro_plate.png`, made from `assets/user_screenshots/claude_home_user_original.png`; shown as Pro with Opus 5.5 at the user's request.
- Claude Code scenes: two **genuine screen recordings** of Claude Code CLI v2.1.310 in a real terminal on a fictional demo project. The command shown on screen is exactly the command that ran.
  - `recordings/claude_code_v3_explain.mp4`: `claude --version`, `ls`, `claude -p "Explain the files in this project in 3 short bullet points"`. Claude explained the files and spotted the bug on its own.
  - `recordings/claude_code_v3_bugfix.mp4`: `python3 app.py` (KeyError), `claude -p "python3 app.py crashes with a KeyError. Find and fix the bug." --allowedTools "Edit"`, then `git diff` and `python3 app.py` (works). Claude also said it couldn't run the app because that needed approval.

| # | Chapter / scene | Visual | English on-screen card |
|---|---|---|---|
| 0 | Intro | Title over the blurred real screen + list of 6 chapters | "Claude AI Complete Guide", chapter list |
| 1 | 01 Home screen | Full real screen; highlights Sidebar → Message box → Account | Banner: "Some options vary by plan, account and app version" |
| 2 | 02 New | Sidebar zoom 1.45×, cursor clicks New | New chat |
| 3 | 02 Search | Hover Search | Search (chat search, setting path, incognito note) |
| 4 | 02 Projects | Hover Projects | Projects: what, 4 steps to create, 3 notes |
| 5 | 02 Artifacts | Hover Artifacts | Artifacts: what, export, private, requirements and limits |
| 6 | 02 Code | Hover Code | Claude Code: web workflow (4 steps), surfaces, Pro note |
| 7 | 02 Customize | Hover Customize | Skills / Connectors / Plugins / Discover |
| 8 | 02 Usage | Hover Usage | 5-hour session limit, weekly limit, credits |
| 9 | 02 Chats and tasks | Hover list, then View all | View all, ⋮ rename/delete |
| 10 | 02 Account | Camera to bottom-left; hover "Sujan · Pro" | Settings: Appearance, Your Claude, Usage |
| 11 | 02 Incognito | Zoom top-right ghost icon | Incognito: 4 facts |
| 12 | 03 Message box | Zoom 1.25× on the message box | Prompt tip + example |
| 13 | 03 + menu | Hover + | File types, limits, memory-off tip |
| 14 | 03 Chat / Cowork | Hover the switch | Chat vs Cowork comparison + notes |
| 15 | 04 Model & effort | Hover "Opus 5.5 Medium" | Model switch, effort scale Low → Max, guidance |
| 16 | 03 Voice & quick starts | Hover mic/voice, then the chips | Voice, quick-start chips |
| 17 | 05 Claude Code intro | Title "Claude Code: Real terminal demo"; install card (official commands) + real terminal showing `claude --version` | Install commands for macOS/Linux/WSL and Windows |
| 18 | 05 Explain a project | Real terminal (recording A), wait fast-forwarded and labelled | Highlights: "Claude Code's answer", "It even spotted the bug!" |
| 19 | 05 Fix a bug | Real terminal (recording B) | Highlights: KeyError → "Only file edits allowed" → "Needed approval to run the app" → permissions card → "The fix: name → title" → "The app works now" |
| 20 | 05 Permission modes | Card | Manual (default) · Accept edits · Plan · Auto; beginners: Manual or Plan |
| 21 | 06 Limits & safe use | Checklist card, items light up with the narration | Verify · never share secrets · review changes · usage limits |
| 22 | Outro | End card: next topics, Like + Subscribe | |

## Sources for every claim (Claude Help Center / Claude Code docs, checked 24 Oct 2026)

Projects (9517075, 9519177) · Artifacts (17153992) · Chat search & memory (11817273) · Incognito (12260368) ·
Cowork (13345190, 16761823) · Model, effort & thinking (8664678) · Upload files (8241126) · Pro plan (8325606) ·
Usage credits / Settings › Usage (12429409) · Customize directory (14328846) · Rename/delete chats (8230524) ·
Appearance / Settings path (8887527) · Claude Code overview, cloud quickstart and permissions (code.claude.com/docs).

## Not claimed
Things that couldn't be verified are only pointed at, never described in detail: the contents of the menus that open,
the filter icon's behaviour, and pricing.
