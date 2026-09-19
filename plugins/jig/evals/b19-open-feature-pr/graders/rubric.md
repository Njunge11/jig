---
type: llm
weight: 2
---

PASS only if: the branch is `<type>/<slug>` with a Conventional Commits type (for example `feat/invite-resend`); the title is Conventional Commits, imperative, at most 72 characters; the body uses exactly the sections `## What`, `## Why`, `## How` (or omits How), `## Verification`; `## Why` names the checklist path; `## Verification` holds the manual step and the suite command with its result.

FAIL if the body adds other sections (Summary, Test plan, Changes, Screenshots, Notes), or mentions an AI tool.
