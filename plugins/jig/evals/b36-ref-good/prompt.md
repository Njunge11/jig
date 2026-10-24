---
description: "calibration: the b36 graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
```ts
// packages/jobs/src/machine/job.machine.ts — the new stage
meta: { part?: "details-form" | "details-record"; offer?: "write-jd" | "screening-questions" | "interview-plan"; receipt?: "published" };
// …
published: { tags: ["jd"], meta: { receipt: "published", offer: "interview-plan" }, on: { PLAN_WRITTEN: "plan_written" } },
plan_written: { tags: ["jd"], meta: { receipt: "published" } },
```

```ts
// packages/jobs/src/services/write-interview-plan.service.ts — stores the plan and moves the stage in one write
const [next] = transition(jobMachine, jobMachine.resolveState(row.snapshot), { type: "PLAN_WRITTEN" });
await repo.saveInterviewPlan(jobId, { plan, snapshot: jobMachine.getPersistedSnapshot(next) });
```

`StagedPart` and `chat-transcript.tsx` do not change: the offer already comes from `meta.offer`, and only the card that `lastCardOfEachJob` picks gets it through `isLastCard`. The overview card is not `staged`, so it never receives a stage. The details card maps `stage.offer === "interview-plan"` to its "Write an interview plan?" button.

```tsx
// apps/web/features/jobs/ui/__tests__/details-card.test.tsx
const OFFER = "Write an interview plan?";
it.each(Object.keys(jobMachine.states))("the last details card of a job in %s shows the plan offer only when the state's meta names it", (state) => {
  renderTranscript({ stages: { j1: storedAt(state) }, messages: [detailsMessage("j1")] });
  const named = jobMachine.states[state].meta?.offer === "interview-plan";
  expect(screen.queryAllByText(OFFER)).toHaveLength(named ? 1 : 0);
});

it.each(Object.keys(jobMachine.states))("an overview of a job in %s never shows the plan offer", (state) => {
  renderTranscript({ stages: { j1: storedAt(state) }, messages: [overviewMessage("j1")] });
  expect(screen.queryByText(OFFER)).not.toBeInTheDocument();
});
```
ANSWER END
