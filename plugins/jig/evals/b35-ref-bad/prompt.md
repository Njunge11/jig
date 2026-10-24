---
description: "calibration: the b35 graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
Fix: the overview must never show the receipt.

```tsx
// apps/web/channels/web/ui/staged-part.tsx
export function StagedPart({ card, part, isLastCard }: StagedPartProps) {
  const snapshot = jobMachine.resolveState(useJobStage(card.staged(part)));
  const meta = snapshot.getMeta()[`job.${snapshot.value}`];
  const stage = {
    draws: meta?.part,
    receipt: card === overviewCard ? null : isLastCard && snapshot.hasTag("jd") ? (snapshot.context.version ?? null) : null,
    offer: isLastCard ? (meta?.offer ?? null) : null,
  };
  return <card.Component part={part} stage={stage} />;
}
```

```tsx
// apps/web/channels/web/ui/__tests__/staged-part.test.tsx
it("an overview of a published job shows no receipt", () => {
  renderStaged({ card: overviewCard, stored: storedAt("published"), isLastCard: true });
  expect(screen.queryByText("The job description is written · v1")).not.toBeInTheDocument();
});
```
ANSWER END
