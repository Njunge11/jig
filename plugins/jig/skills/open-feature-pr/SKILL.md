---
name: open-feature-pr
description: Owns the branch, title, and body conventions for a pull request, plus the language rules, and the push straight to main for a repo that has no PRs. Use when an implementation checklist's work is complete and its PR must be opened, or its commits pushed to main. The skill opens the PR with gh and returns the URL, or pushes to main and returns the commit.
---

# Open Feature PR

Open the pull request for a completed implementation checklist. The checklist's kind sets the entry conditions. Make sure they are true before you start.

- **TDD implementation checklists:** every task in every section is `[x]`. The branch's test files are green; the full suite runs once, in the push. The file `docs/<project>/handoffs/NN-<slug>.md` exists. The tracker Status is flipped. A checklist with both a `## Backend` and a `## Frontend + Integration` section gets one PR, opened by the frontend run; the backend run only commits locally. The review verdict's `fail` lines are fixed and committed before the push. The branch is pushed once, when the PR opens; a later fix waits in a local commit for the next push.
- **Step implementation checklists:** the transcript shows the output of every `## Done` item. The tracker Status is flipped. These checklists have no handoff file and no task boxes.

## Straight to main

When the repo's `CLAUDE.md` says work goes straight to main, no PR opens, and this section replaces **Body template** through **Open it**. The branch name and the language rules still apply to each commit message. The entry conditions above still hold, with "the push" in place of "the PR".

1. Invoke the `manual-qa` skill with the Skill tool before the push. Its **Straight to main** section links the sheet in the handoff file and commits that link, so the one push carries it.
2. Rebase onto main: `git pull --rebase origin main`. When the rebase conflicts on a drizzle `meta/_journal.json` or `meta/NNNN_snapshot.json`, another task took the same migration number. Keep main's journal and snapshot: during a rebase `--ours` is main, so run `git checkout --ours -- <journal> <snapshot>`. Delete the branch's own `.sql` file of that number with `git rm`, then `git rebase --continue`. When the rebase ends, run the repo's `drizzle-kit generate` and commit the new migration. Never merge two journals by hand: drizzle skips a migration whose `when` is older than one it already ran, with no error.
3. When the rebase pulled new commits, run this checklist's test files again by name.
4. Push, and send the output to a file: `git push origin HEAD:main > <scratch>/push.log 2>&1`. The repo's pre-push hook runs the checks. When the push is refused because main moved, go back to step 2.
5. Show `git log --oneline -1 origin/main` in your output: that commit is the shipped work, and a transcript-only watcher (e.g. `/goal`) verifies it. A checklist's PR Done item is met by this commit.
6. When the work holds a migration, run the staging migrate command that the repo's `CLAUDE.md` names, after the push succeeds and never before.
7. Watch the CI run of that commit: `gh run list --branch main --commit <sha> --json databaseId -q '.[0].databaseId'`, then `gh run watch <id> --exit-status`. A run that a newer push replaced shows as cancelled; the newer run covers this commit, so watch that one. A failed run is this task's to fix at once, in a new commit and push: main stays green.
8. Deploy when the feature is whole. Read the tracker that lists this checklist. When every row's Status is `Done`, with this checklist's row ticked, run the deploy command the repo's `CLAUDE.md` names (for example `gh workflow run main.yml -f deploy=true`) and show its output. A tracker with an open row deploys nothing: a feature ships once, when its last checklist lands, never checklist by checklist. When `CLAUDE.md` names no deploy command, skip this step. **Gate:** the transcript shows the tracker's Status column and either the deploy command's output or the open row that stopped it.

## Branch and title

- Branch: use `<type>/<slug>` with a Conventional Commits type. Examples: `feat/invitations-schema`, `chore/packages-db`.
- Title: use the Conventional Commits format: `<type>(<scope>): <description>`. The type is one of `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`. Start the description in lower case: commitlint's `config-conventional` rejects a sentence-case subject. Write the title in the imperative. Use a maximum of 72 characters. Example: `feat(invitations): add invitations schema and repo`. The title must stay a valid commit message after a squash-merge.

## Body template

State what changed and why. Give enough context for a reader who did not see this session. The language rules below apply to every section. Use exactly these sections. The `manual-qa` skill adds its own section after the PR opens:

```
## What
1–3 sentences. What this PR does.

## Why
The problem it solves. Name the checklist (docs/<project>/checklists/NN-<slug>.md).

## How
One line per decision. Each line states a choice and its reason: approach chosen over
alternatives, tradeoffs, limitations, deviations from the checklist. Apply this test to
each line: can a reviewer see this in the diff? If yes, delete the line.
Omit this section if there is nothing.

## Verification
TDD checklists: the checklist's Manual verification steps, plus the test summary the push printed.
Step checklists: one line per Done item — the command, its result, and what it proves.
```

### A filled body

```
## What
Add the invitations table and its repository. The repository creates, reads, and
revokes one invitation.

## Why
The signup flow needs a stored invitation before it can send one. The checklist is
docs/growth/checklists/03-invitations-schema.md.

## How
The table stores the token as a hash, because a leaked row must not grant access.
The repository takes the transaction as an argument, so the service composes it with the
account write.

## Verification
The developer opens /invite and sees the new invitation in the list.
The command `pnpm vitest --project backend` passes: 1762 passed, 1 skipped. Main passes
with the same counts.
```

## Verification audience rule

Write the Verification section for a reviewer who did not see this session. Do not write relative words such as "baseline" or "same as before" without the values. Write "test counts equal main: 1762 passed, 1 skipped". Do not copy tool noise such as "3 successful, 3 total". State each check and its result in plain words. Do not describe detours from the run. The PR records the result, not the run.

## Language rules (title and body)

- Write complete sentences, each with a subject and a verb. Do not write fragments: not "No new dependencies.", but "This PR adds no new dependencies."
- Use the active voice. Use the imperative for the title and the What section.
- Write one idea per sentence. Use a maximum of 20 words per sentence.
- Use simple tenses only. Do not write noun stacks of more than 3 words.
- Never restate the diff file-by-file. The diff is on the PR.
- Do not use self-praise adjectives ("comprehensive", "robust", "significantly improves"). State what changed. Do not state how good it is.
- Do not include attribution lines or AI references.

## Check before you open

Check the title and the body against this list. Fix each failure before you run `gh`.

1. The title meets **Branch and title** above.
2. The body has the What, Why, and Verification sections. The body has the How section, or the How section has nothing to state.
3. Every How line passes the diff test in the template.
4. The Verification section meets the **Verification audience rule** above.
5. The title and the body meet every **Language rule** above.

## Open it

1. Push the branch, and send the output to a file: `git push -u origin HEAD > <scratch>/push.log 2>&1`. The repo's pre-push hook runs the full suite. When the repo has no pre-push hook that runs the tests, run the full suite once before the push instead. Copy the test summary into the Verification section.
2. Run `gh pr create` against the default branch, with the body read from a quoted heredoc. A body passed in `--body "…"` runs every backtick span in it as a shell command.

```bash
gh pr create --title "<title>" --body-file - <<'EOF'
<body>
EOF
```

3. Show the PR URL in your output. A transcript-only watcher (e.g. `/goal`) verifies it.
4. Invoke the `manual-qa` skill with the Skill tool. It writes the PR's manual QA sheet and adds a `## Manual QA` section to the body. **Gate:** the transcript shows the Skill call, then the sheet link or that skill's line that says why no sheet exists.

## When a step fails

- **The pre-push hook says origin/main has new commits.** Another task pushed first. Go back to step 2 of **Straight to main**.
- **`git push` is rejected as non-fast-forward.** The remote branch moved. Run `git pull --rebase`. Run the branch's test files again. Then push again: the push runs the full suite.
- **A pre-push hook fails.** The hook failure is part of the work. Read the cause in the push's output file; never push again only to see the output, because each push runs the full suite. Fix the cause, then push again. Never pass `--no-verify`.
- **`gh` says to run `gh auth login`.** It is not authenticated. Run `gh auth status`. Ask the developer to run `gh auth login`. Do not open the PR by another route.
- **`gh` reports "no commits between main and the branch".** You are on `main`, or the branch holds no commit. Run `git log main..HEAD` to confirm. Commit the work on the feature branch, then push again.
- **`gh` reports that a pull request for the branch already exists.** The PR is open. Run `gh pr view --json url -q .url` and show that URL. Never open a second PR.
