#!/usr/bin/env bash
# Runs INSIDE xterm on the virtual display. Types commands visibly, then really executes them.
# Each step's wall-clock time is logged so the editor can line the clip up with the narration.
LOG="$1"; cd "$2" || exit 1
P=$'\e[1;32mdemo@laptop\e[0m:\e[1;34m~/todo-app\e[0m$ '
mark(){ echo "$1 $(date +%s.%N)" >> "$LOG"; }
type_cmd(){ printf '%s' "$P"; sleep 0.5; local s="$1"; for ((i=0;i<${#s};i++)); do printf '%s' "${s:i:1}"; sleep 0.045; done; sleep 0.35; printf '\n'; }
clear; mark start; sleep 0.8
mark ls_type;  type_cmd "ls";                 ls --color=always; sleep 0.9
mark ver_type; type_cmd "claude --version";   claude --version; sleep 0.9
mark ask_type; type_cmd 'claude -p "Is project ki files 3 short points mein explain karo"'
mark ask_run;  claude -p "Is project ki files 3 short points mein explain karo. Simple Hinglish mein, har point ek line. Kuch bhi modify mat karna." --allowedTools "Read,Glob" < /dev/null
mark ask_done; printf '%s' "$P"; sleep 4; mark end
