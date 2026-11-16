# Runs, on the real build before a push, the Playwright end-to-end tests
# that the push adds or changes. A failed test refuses the push. The full
# suite is `pnpm flows:all`. LEFTHOOK=0 skips every hook.

# In a linked worktree, git gives a hook GIT_DIR and no work tree. A git
# command in a subfolder then takes that subfolder as the top of the repo
# (git-config, core.worktree), so `--only-changed` reads each flow file as
# new and picks every flow. Measured: 88 tests with GIT_DIR, 43 without.
# Each name is one word.
# shellcheck disable=SC2046
unset $(git rev-parse --local-env-vars)

base=origin/main

# The refs of this push, from git: `<local ref> <local sha> <remote ref> <remote sha>`.
to_main=0
sends=0
while read -r _ _ remote_ref _; do
  sends=1
  if [ "$remote_ref" = refs/heads/main ]; then to_main=1; fi
done

# git lists only the refs that it sends. A ref that the remote refuses is not
# in the list: when main moved, the list is empty, and git refuses the push
# after the hook. Measured: a push that was 17 commits behind main ran 59
# flows for 7 minutes and was refused then. With no ref to send, a run
# proves nothing, so the hook stops here.
if [ "$sends" = 0 ]; then
  echo "pre-push: git sends no ref: main moved. Run: git pull --rebase origin main. Then push again."
  exit 1
fi

# One push at a time on this machine. Builders push from parallel worktrees,
# and main moved while a push ran its flows: git refused that push after the
# run (measured: a run of 7 minutes, 2 times in one hour). A push waits here
# for the push before it, and the check below then sees the new main and
# refuses in a second. The lock is a folder in the shared git folder, with
# the process number of its hook. A lock whose process ended is taken.
push_lock="$(git rev-parse --path-format=absolute --git-common-dir)/push.lock"
waited=0
until mkdir "$push_lock" 2>/dev/null; do
  holder="$(cat "$push_lock/pid" 2>/dev/null || true)"
  if [ -n "$holder" ] && ! kill -0 "$holder" 2>/dev/null; then
    rm -rf "$push_lock"
    continue
  fi
  if [ "$waited" = 0 ]; then
    echo "pre-push: another push is active on this machine. This push waits for it."
  fi
  waited=1
  sleep 5
done
echo $$ >"$push_lock/pid"
trap 'rm -rf "$push_lock"' EXIT
trap 'exit 1' INT TERM
# git sends the commits of the push before this one after its hook ends.
if [ "$waited" = 1 ]; then sleep 10; fi

if git fetch --quiet origin main 2>/dev/null; then
  # The remote refuses a push to main that does not hold origin/main, but
  # only after the run. So the hook refuses it before the run.
  if [ "$to_main" = 1 ] && ! git merge-base --is-ancestor "$base" HEAD; then
    echo "pre-push: main moved. Run: git pull --rebase origin main. Then push again."
    exit 1
  fi
  # A push of documents or of unit tests, with their fixtures and their
  # setup, changes no built app and no flow: it has nothing to run.
  if git diff --quiet "$base"...HEAD -- apps packages package.json \
    pnpm-lock.yaml pnpm-workspace.yaml turbo.json \
    ':(exclude,glob)**/__tests__/**' ':(exclude,glob)**/__fixtures__/**' \
    ':(exclude,glob)*/*/test/**' ':(exclude,glob)**/*.test.ts' \
    ':(exclude,glob)**/*.test.tsx' ':(exclude,glob)**/*.md'; then
    echo "pre-push: the push changes no built app and no flow. No end-to-end run."
    exit 0
  fi
  # turbo names each package that the push changes, and each package that
  # depends on one. When it gives no answer, each app runs.
  affected="$(TURBO_SCM_BASE="$base" pnpm exec turbo ls --affected --output=json 2>/dev/null || true)"
  # The setup of a run reaches each flow of each app.
  if ! git diff --quiet "$base"...HEAD -- packages/e2e/playwright.config.ts \
    packages/e2e/package.json packages/e2e/support/apps.ts \
    packages/e2e/support/session.setup.ts packages/e2e/support/run.ts \
    packages/e2e/support/test-database.ts; then
    affected=""
  fi
else
  # The first push of a repo has no origin/main to compare with: each app runs.
  affected=""
fi

# The run of a push is short. For each app that the push reaches it runs the
# flow files that the push adds or changes, and the smoke set: the tests with
# the tag @smoke, one per main flow of the app. It does not follow the imports
# of a flow: one changed line of a shared helper then selected most flows
# (measured: 127 of 168 tests). The full suite, `pnpm flows:all`, runs one
# time after a checklist is on main, outside a push.
apps="{{APP_NAMES}}"

# The flow files of app $1 that the push adds or changes, as names with no ending.
changed_flows() {
  git diff --name-only --diff-filter=d "$base"...HEAD -- "packages/e2e/flows/$1" |
    sed -n 's|.*/\([^/]*\)\.spec\.ts$|\1|p'
}

# A changed helper of the flows reaches each app.
helpers=0
if ! git diff --quiet "$base"...HEAD -- packages/e2e ':(exclude)packages/e2e/flows'; then
  helpers=1
fi

plan=""
for app in $apps; do
  ls "packages/e2e/flows/$app"/*.spec.ts >/dev/null 2>&1 || continue
  if [ -n "$(changed_flows "$app")" ] || [ "$helpers" = 1 ] || [ -z "$affected" ] ||
    printf '%s' "$affected" | grep -q "\"apps/$app\""; then
    plan="$plan $app"
  fi
done

if [ -z "$plan" ]; then
  echo "pre-push: the push changes no app that has a flow. No end-to-end run."
  exit 0
fi
echo "pre-push: the end-to-end run of this push: the smoke set and the changed flow files of$plan. The full suite is: pnpm flows:all"

# One run at a time on this machine: `pnpm flows` waits for the run that
# holds the lock (`packages/e2e/support/run.ts`).
for app in $plan; do
  # Playwright tests the expression against the file name, the name and the
  # tags of each test. The character before a file name is a space or "/".
  select="@smoke"
  for file in $(changed_flows "$app"); do
    select="$select|[^a-z-]$file\\.spec\\.ts"
  done
  APP="$app" pnpm flows --grep "$select" || {
    echo "pre-push: an end-to-end test of $app failed. Open packages/e2e/.output/report/$app-flows/index.html."
    exit 1
  }
done
