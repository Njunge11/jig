---
description: "state-machines: a list page's stage tabs and labels come from the machine, not a copy"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The server owns this XState v5 machine. The `applications.status` column stores the value of each application's stage.

```ts
// packages/applications/src/machine/application-stage.machine.ts
export const applicationStageMachine = setup({
  types: {} as { events: StageEvent },
}).createMachine({
  id: "applicationStage",
  initial: "new",
  states: {
    new: { meta: { label: "New" }, on: { SCREENED: "needs_review" } },
    needs_review: { meta: { label: "Needs review" }, on: { SHORTLISTED: "shortlisted", REJECTED: "not_a_match" } },
    shortlisted: { meta: { label: "Shortlisted" }, on: { LONGLISTED: "needs_review", REJECTED: "not_a_match" } },
    not_a_match: { meta: { label: "Not a match" }, on: { RESTORED: "needs_review" } },
  },
});
```

The job page already has this file:

```tsx
// apps/dashboard/features/job/ui/stage-tabs.tsx
const STAGE_LABEL = { longlisted: "Longlisted", shortlisted: "Shortlisted" } as const;
export const JOB_STAGES = ["longlisted", "shortlisted"] as const;
```

The candidates list page reads `trpc.candidatesList.list`, which answers `{ rows: { id: string; name: string; status: ApplicationStatus }[]; counts: Record<ApplicationStatus, number> }`. The page never resolves a snapshot; it has only each row's status.

The product names the stages Longlisted (`needs_review`), Shortlisted and Not a match, on every screen.

Write two React parts for the dashboard:

1. `StageTabs({ counts, active, onChange })` for the candidates page: one tab for each of the three stages, each with its count. The active tab's key is in the URL.
2. `StageBadge({ status })` for the home page: it names an application's stage.

Change any other file you need to. Do not write any file. Reply with the code.
