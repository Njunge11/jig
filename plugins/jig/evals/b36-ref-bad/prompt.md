---
description: "calibration: the b36 graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
```tsx
// apps/web/features/jobs/ui/cards/details-card.tsx
const { data: job } = useSuspenseQuery(trpc.jobs.get.queryOptions({ id: part.data.jobId }));
const showPlanOffer = job.status === "published" && job.interviewPlan === null && isLastCard;
// …
{showPlanOffer && <Button>Write an interview plan?</Button>}

// apps/web/features/jobs/ui/cards/overview-card.tsx
{job.interviewPlan === null && <Button>Write an interview plan?</Button>}
```

```tsx
it("shows the plan offer on a published job", () => {
  renderDetails({ status: "published", interviewPlan: null });
  expect(screen.getByText("Write an interview plan?")).toBeInTheDocument();
});
```
ANSWER END
