// Shared demo content (fictional examples; analytics numbers are sample data, not real).
export const NAME = "YouTube Content Assistant";
export const PURPOSE = "Help me research, plan and create high-quality YouTube content for my audience.";
export const ROLE =
  "Role: Tum mere YouTube content strategy assistant ho. Tumhara kaam hai mujhe engaging scripts, better video ideas, compelling titles aur thumbnail concepts banane mein madad karna.";
export const BASICS = "\n\nNiche: Technology (mobile, apps, AI tools)\nAudience: Beginners\nLanguage: Hindi-Hinglish\nWriting style: Short sentences, easy examples";
export const SEGS5 = [
  { t: "\n\nIdeal viewer:", at: 262, cps: 18 },
  { t: "\n- Problem: naya channel hai, tech settings confusing lagti hain\n- Kyun dekhta hai: simple, step-by-step help\n- Seekhna chahiye: khud setup kar sake", at: 370, cps: 18 },
  { t: "\n\nBrand voice:", at: 640, cps: 18 },
  { t: "\n- Educational + friendly", at: 728, cps: 16 },
  { t: "\n- Conversational Hinglish, short sentences, real examples", at: 946, cps: 16 },
  { t: "\n\nWorkflow help:", at: 1180, cps: 18 },
  { t: "\n- Research, scriptwriting, title generation, analytics analysis", at: 1312, cps: 18 },
];
export const INSTR = ROLE + BASICS + SEGS5.map((s) => s.t).join("");
export const SCRIPTS = ["best-video-1-script.txt", "best-video-2-script.txt", "best-video-3-script.txt"];
export const FILES = [...SCRIPTS.map((name) => ({ name })), { name: "channel-analytics.csv" }];
