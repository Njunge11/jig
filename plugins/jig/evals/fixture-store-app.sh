#!/bin/bash
# Scaffold for the b cases, sourced by each case's fixture.sh: an APFS clone of
# the fixture store app (with its node_modules), less the paths the case's
# remove.txt lists, then the case's own start/ files on top, committed as the
# base the harness diffs against.
set -euo pipefail
app="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../evals-fixture/store-app" && pwd)"
case_dir="$(cd "$(dirname "$0")" && pwd)"
cp -Rc "$app/." .
rm -rf .eval .next tsconfig.tsbuildinfo
if [ -f "$case_dir/remove.txt" ]; then xargs rm -f < "$case_dir/remove.txt"; fi
if [ -d "$case_dir/start" ]; then cp -R "$case_dir/start/." .; fi
git init -q -b main
git add -A
git -c user.name=eval -c user.email=eval@example.invalid commit -q -m "fixture store app"
