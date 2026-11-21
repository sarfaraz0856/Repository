#!/bin/bash
# Renders 2 test stills (start and end) for every extended-cut shot into out/cxstills.
cd "$(dirname "$0")"; mkdir -p out/cxstills
for s in "$@"; do timeout 1200 node render.js $s --stills 10,350 --outdir out/cxstills 2>&1 | grep -E "still|ERR|FAIL" ; done
