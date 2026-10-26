---
name: open-feature-pr
description: Owns the branch, title, and body conventions for a pull request, plus the language rules. Use when an implementation checklist's work is complete and its PR must be opened. The skill opens the PR with gh and returns the URL.
---

# Open Feature PR

Open the pull request for a completed implementation checklist. The checklist's kind sets the entry conditions. Make sure they are true before you start.

- **TDD implementation checklists:** every task in every section is `[x]`. The branch's test files are green; the full suite runs once, in the push. The file `docs/<project>/handoffs/NN-<slug>.md` exists. The tracker Status is flipped. A checklist with both a `## Backend` and a `## Frontend + Integration` section gets one PR, opened by the frontend run; the backend run only commits locally. The review verdict's `fail` lines are fixed and committed before the push. The branch is pushed once, when the PR opens; a later fix waits in a local commit for the next push.
- **Step implementation checklists:** the transcript shows the output of every `## Done` item. The tracker Status is flipped. These checklists have no handoff file and no task boxes.

## Branch and title

- Branch: use `<type>/<slug>` with a Conventional Commits type. Examples: `feat/invitations-schema`, `chore/packages-db`.
- Title: use the Conventional Commits format: `<type>(<scope>): <description>`. The type is one of `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`. Start the description in lower case: commitlint's `config-conventional` rejects a sentence-case subject. Write the title in the imperative. Use a maximum of 72 characters. Example: `feat(invitations): add invitations schema and repo`. The title must stay a valid commit message after a squash-merge.

## Body template

State what changed and why. Give enough context for a reader who did not see this session. The language rules below apply to every section. Use exactly these sections:

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

## When a step fails

- **`git push` is rejected as non-fast-forward.** The remote branch moved. Run `git pull --rebase`. Run the branch's test files again. Then push again: the push runs the full suite.
- **A pre-push hook fails.** The hook failure is part of the work. Read the cause in the push's output file; never push again only to see the output, because each push runs the full suite. Fix the cause, then push again. Never pass `--no-verify`.
- **`gh` says to run `gh auth login`.** It is not authenticated. Run `gh auth status`. Ask the developer to run `gh auth login`. Do not open the PR by another route.
- **`gh` reports "no commits between main and the branch".** You are on `main`, or the branch holds no commit. Run `git log main..HEAD` to confirm. Commit the work on the feature branch, then push again.
- **`gh` reports that a pull request for the branch already exists.** The PR is open. Run `gh pr view --json url -q .url` and show that URL. Never open a second PR.
