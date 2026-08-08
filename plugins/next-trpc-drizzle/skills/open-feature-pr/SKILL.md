---
name: open-feature-pr
description: Use to open a feature's pull request at goal exit — after the handoff is written and the tracker row is flipped. Owns the branch/title/body conventions and the language rules; opens the PR with gh and returns the URL.
---

# Open Feature PR

Open the pull request for a completed feature. Preconditions: every checklist behavior is `[x]`, the suite is green, `handoffs/NN-<feature>.md` exists, the tracker row is flipped.

## Branch and title

- Branch: `<type>/<feature-slug>` with a Conventional Commits type — `feat/invitations-schema`, `fix/draft-resume`.
- Title: Conventional Commits format, imperative, ≤72 characters — `feat(invitations): add invitations schema and repo`. The title must survive a squash-merge as a valid commit message.

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

- Active voice. Imperative for the title and the What section.
- One idea per sentence. Maximum 20 words per sentence.
- Simple tenses only. No noun stacks over 3 words.
- Never restate the diff file-by-file — the diff is on the PR.
- No self-praise adjectives ("comprehensive", "robust", "significantly improves"). State what changed, not how good it is.
- No attribution lines or AI references.

## Open it

1. Push the branch.
2. `gh pr create --title "<title>" --body "<body>"` against the default branch.
3. Show the PR URL in your output — a transcript-only watcher (e.g. `/goal`) verifies it.
