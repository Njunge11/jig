---
description: "state-machines: render from hasTag and meta, no stage table"
tags: [obedience, frontend]
runs: 1
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The server owns this XState v5 machine and stores its snapshot in the database. The page component receives the stored snapshot as a prop.

```ts
// features/job-draft/machine/job-draft.machine.ts
export const jobDraftMachine = setup({ types: {} as { events: DraftEvent } }).createMachine({
  id: "jobDraft",
  initial: "collecting",
  states: {
    collecting: { tags: ["editable"], meta: { form: "details" }, on: { SUBMIT: "reviewing" } },
    reviewing:  { tags: ["editable"], meta: { form: "review" },  on: { APPROVE: "published", BACK: "collecting" } },
    published:  { meta: { form: "summary" } },
  },
});
```

Write the React client part `JobDraftPanel({ snapshot })`. It shows the form of the current state (`DetailsForm`, `ReviewForm` or `SummaryView`) and an Edit button only while the draft can be edited. A click on Submit must move the draft. `trpc.jobDraft.send({ event })` exists.

Do not write any file. Reply with the code.
