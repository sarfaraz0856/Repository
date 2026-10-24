#!/usr/bin/env bash
# v3 demo B (runs inside xterm): real bug -> Claude Code fix -> git diff review -> re-run.
LOG="$1"; cd "$2" || exit 1
export PYTHONDONTWRITEBYTECODE=1 GIT_PAGER=cat
P=$'\e[1;32mdemo@laptop\e[0m:\e[1;34m~/todo-app\e[0m$ '
mark(){ echo "$1 $(date +%s.%N)" >> "$LOG"; }
type_cmd(){ printf '%s' "$P"; sleep 0.5; local s="$1"; for ((i=0;i<${#s};i++)); do printf '%s' "${s:i:1}"; sleep 0.045; done; sleep 0.35; printf '\n'; }
run(){ mark "type:$1"; type_cmd "$1"; mark "run:$1"; eval "$1" < /dev/null; mark "done:$1"; sleep 1.0; }
clear; mark start; sleep 0.8
run "python3 app.py"
run 'claude -p "python3 app.py crashes with a KeyError. Find and fix the bug." --allowedTools "Edit"'
sleep 1.5; clear; mark clear1
run "git diff"
run "python3 app.py"
printf '%s' "$P"; sleep 4; mark end
