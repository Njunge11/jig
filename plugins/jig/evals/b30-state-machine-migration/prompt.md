---
description: "state-machines: the machine keeps a road forward for every stage value it has ever stored"
tags: [obedience, backend]
runs: 1
max_turns: 8
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The server owns this XState v5 machine. Each `job_drafts` row stores `{ value, context }` of its snapshot in a `stage` jsonb column. The service restores it with `machine.resolveState(row.stage)`, moves it with `transition(machine, restored, event)`, and stores the next `{ value, context }` with a compare-and-set on the old value. The app is in production.

```ts
// features/job-draft/machine/job-draft.setup.ts
export const draftSetup = setup({
  types: {
    context: {} as { missing: string[] },
    events: {} as { type: "DETAILS_SAVED"; missing: string[] },
    tags: {} as "saved",
  },
  guards: { detailsMissing: ({ context }) => context.missing.length > 0 },
  actions: { recordMissing: assign({ missing: (_, params: { missing: string[] }) => params.missing }) },
});

// features/job-draft/machine/job-draft.states.ts
export const detailsPending = draftSetup.createStateConfig({
  meta: { form: "details" },
  on: {
    DETAILS_SAVED: [
      { guard: "detailsMissing", target: "details_pending", actions: { type: "recordMissing", params: ({ event }) => ({ missing: event.missing }) } },
      { target: "details_complete", actions: { type: "recordMissing", params: ({ event }) => ({ missing: event.missing }) } },
    ],
  },
});
export const detailsComplete = draftSetup.createStateConfig({
  tags: ["saved"],
  meta: { form: "details" },
});

// features/job-draft/machine/job-draft.machine.ts
export const draftMachine = draftSetup.createMachine({
  id: "draft",
  initial: "details_pending",
  context: { missing: [] },
  states: { details_pending: detailsPending, details_complete: detailsComplete },
});
```

Add a role stage. After the details are complete, the recruiter fills a role form (`industry`, `years`). A `ROLE_SAVED` event carries `roleMissing: string[]`. The stage `role_pending` shows `meta.form: "role"`; `ROLE_SAVED` keeps it there while a role field is missing, else moves it to `role_complete`, tagged `saved`. Once the details are complete, the draft is in the role stage.

Do not write any file. Reply with the path of every file you add or change, and what each one does in one sentence. Give the full code of the test files and of every file that is not a machine file; for the setup, states and machine files, the list is enough.
