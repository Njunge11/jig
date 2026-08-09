---
name: open-feature-pr
description: Use to open a row's pull request at goal exit — feature or chore/refactor lane. The skill owns the branch/title/body conventions and the language rules. The skill opens the PR with gh and returns the URL.
---

# Open Feature PR

Open the pull request for a completed tracker row. Make sure that the lane's conditions are true before you start.

- **Feature lane:** every checklist behavior is `[x]`. The suite is green. The file `handoffs/NN-<feature>.md` exists. The tracker row is flipped.
- **Chore/refactor lane:** the transcript shows the output of every `## Done` item. The tracker row is flipped. This lane has no handoff file and no behavior boxes.

## Branch and title

- Branch: use `<type>/<slug>` with a Conventional Commits type. Examples: `feat/invitations-schema`, `chore/packages-db`.
- Title: use the Conventional Commits format. Write the title in the imperative. Use a maximum of 72 characters. Example: `feat(invitations): add invitations schema and repo`. The title must stay a valid commit message after a squash-merge.

## Body template

The body follows Google's CL-description guidance (google.github.io/eng-practices). State what changed and why. Write complete sentences. Give enough context for a reader who did not see this session. Use exactly these sections:

```
## What
1–3 sentences. What this PR does. Imperative, active voice.

## Why
The problem it solves. Name the checklist (docs/<project>/checklists/NN-<slug>.md).

## How
One line per decision. Each line states a choice and its reason: approach chosen over
alternatives, tradeoffs, limitations, deviations from the checklist. Apply this test to
each line: can a reviewer see this in the diff? If yes, delete the line.
Omit this section if there is nothing.

## Verification
Feature lane: the checklist's Manual verification steps, plus the suite command and result.
Chore/refactor lane: one row per gate — the command, its result, and what it proves.
```

## Verification audience rule

Write the Verification section for a reviewer who did not see this session. Do not write relative words such as "baseline" or "same as before" without the values. Write "test counts equal main: 1762 passed, 1 skipped". Do not copy tool noise such as "3 successful, 3 total". State each check and its result in plain words. Do not describe detours from the run. The PR records the result, not the run.

## Language rules (title and body)

- Write complete sentences, each with a subject and a verb. Do not write fragments ("No shims.").
- Use the active voice. Use the imperative for the title and the What section.
- Write one idea per sentence. Use a maximum of 20 words per sentence.
- Use simple tenses only. Do not write noun stacks of more than 3 words.
- Never restate the diff file-by-file. The diff is on the PR.
- Do not use self-praise adjectives ("comprehensive", "robust", "significantly improves"). State what changed. Do not state how good it is.
- Do not include attribution lines or AI references.

## Open it

1. Push the branch.
2. Run `gh pr create --title "<title>" --body "<body>"` against the default branch.
3. Show the PR URL in your output. A transcript-only watcher (e.g. `/goal`) verifies it.
