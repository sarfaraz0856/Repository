#!/usr/bin/env bash
# v3 demo A (runs inside xterm): every command is typed on screen exactly as it is executed.
LOG="$1"; cd "$2" || exit 1
export PYTHONDONTWRITEBYTECODE=1 GIT_PAGER=cat
P=$'\e[1;32mdemo@laptop\e[0m:\e[1;34m~/todo-app\e[0m$ '
mark(){ echo "$1 $(date +%s.%N)" >> "$LOG"; }
type_cmd(){ printf '%s' "$P"; sleep 0.5; local s="$1"; for ((i=0;i<${#s};i++)); do printf '%s' "${s:i:1}"; sleep 0.045; done; sleep 0.35; printf '\n'; }
run(){ mark "type:$1"; type_cmd "$1"; mark "run:$1"; eval "$1" < /dev/null; mark "done:$1"; sleep 1.0; }
clear; mark start; sleep 0.8
run "claude --version"
run "ls"
run 'claude -p "Explain the files in this project in 3 short bullet points"'
printf '%s' "$P"; sleep 4; mark end
