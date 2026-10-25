#!/bin/bash
# Records the outcome of one eval run in the fixture workspace: the diff from the
# scaffold's commit (whole, and without any tests), and the exit status of `pnpm typecheck` and `pnpm lint`.
# It prints nothing and exits 0, so the agent never sees it.
cd "${CLAUDE_PROJECT_DIR:-$PWD}" || exit 0
[ -f package.json ] && [ -d .git ] || exit 0
mkdir -p .eval
git add -A >/dev/null 2>&1
root=$(git rev-list --max-parents=0 HEAD 2>/dev/null | tail -1)
git diff --cached "$root" -- . ':(exclude).eval' > .eval/diff.txt 2>&1
# The app code alone, for the llm graders.
git diff --cached "$root" -- . ':(exclude).eval' ':(exclude)test/**' ':(glob,exclude)**/__tests__/**' > .eval/diff-app.txt 2>&1
pnpm typecheck > .eval/typecheck.txt 2>&1
echo "exit $?" >> .eval/typecheck.txt
pnpm lint > .eval/lint.txt 2>&1
echo "exit $?" >> .eval/lint.txt
exit 0
