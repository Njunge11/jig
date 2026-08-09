---
name: open-feature-pr
description: Use to open a feature's pull request at goal exit. Use it after the builder writes the handoff and flips the tracker row. The skill owns the branch/title/body conventions and the language rules. The skill opens the PR with gh and returns the URL.
---

# Open Feature PR

Open the pull request for a completed feature. Make sure that these conditions are true before you start. Every checklist behavior is `[x]`. The suite is green. The file `handoffs/NN-<feature>.md` exists. The tracker row is flipped.

## Branch and title

- Branch: use `<type>/<feature-slug>` with a Conventional Commits type. Examples: `feat/invitations-schema`, `fix/draft-resume`.
- Title: use the Conventional Commits format. Write the title in the imperative. Use a maximum of 72 characters. Example: `feat(invitations): add invitations schema and repo`. The title must stay a valid commit message after a squash-merge.

## Body template

Use exactly these sections:

```
## What
1–3 sentences. What this PR does. Imperative, active voice.

## Why
The problem it solves. Name the checklist (docs/<project>/checklists/NN-<feature>.md).

## How
Only what the diff cannot show: approach chosen over alternatives, tradeoffs, limitations,
deviations from the checklist. Omit this section if there is nothing.

## Verification
The checklist's Manual verification steps, plus the test evidence (suite command and result).
```

## Language rules (title and body)

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
