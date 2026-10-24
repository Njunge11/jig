---
description: "calibration: the b35 graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
Cause: the overview is `staged`, so it counts as the job's last card. It takes the receipt and the offer from the details card.

```ts
// packages/jobs/src/machine/job.machine.ts — meta per kind of card
details_pending: { meta: { acting: { part: "details-form" }, reading: {} }, on: { DETAILS_SAVED: "details_saved" } },
details_saved: { meta: { acting: { part: "details-record", offer: "write-jd" }, reading: { part: "details-record" } }, on: { JD_WRITTEN: "jd_written" } },
jd_written: { meta: { acting: { part: "details-record", offer: "screening-questions", receipt: true }, reading: { part: "details-record" } }, on: { PUBLISHED: "published" } },
published: { meta: { acting: { receipt: true }, reading: { part: "details-record" } } },
```

```ts
// apps/web/channels/web/ui/last-card-of-each-job.ts — counts acting cards only
export function lastCardOfEachJob(messages: ChatMessage[]): Set<ChatPart> {
  const last = new Map<string, ChatPart>();
  for (const part of messages.flatMap((m) => m.parts)) {
    const card = cardFor(part);
    if (card.staged && card.kind === "acting") last.set(card.staged(part), part);
  }
  return new Set(last.values());
}
```

```tsx
// apps/web/channels/web/ui/staged-part.tsx
export function StagedPart({ card, part, isLastCard }: StagedPartProps) {
  const snapshot = jobMachine.resolveState(useJobStage(card.staged(part)));
  const meta = snapshot.getMeta()[`job.${snapshot.value}`]?.[card.kind];
  const picked = card.kind === "acting" && isLastCard;
  const stage = {
    draws: meta?.part,
    receipt: picked && meta?.receipt ? (snapshot.context.version ?? null) : null,
    offer: picked ? (meta?.offer ?? null) : null,
  };
  return <card.Component part={part} stage={stage} />;
}
// details card: { kind: "acting", staged: (part) => part.data.jobId, Component: DetailsCard }
// overview card: { kind: "reading", staged: (part) => part.data.jobId, Component: OverviewCard } — it no longer renders <VersionReceipt>
```

```tsx
// apps/web/channels/web/ui/__tests__/chat-transcript.test.tsx
const RECEIPT = "The job description is written · v1";
const OFFER = /\?$/;

it.each(Object.keys(jobMachine.states))("an overview of a job in %s shows no receipt and no offer", (state) => {
  renderTranscript({ stages: { j1: storedAt(state) }, messages: [overviewMessage("j1")] });
  expect(screen.queryByText(RECEIPT)).not.toBeInTheDocument();
  expect(screen.queryByText(OFFER)).not.toBeInTheDocument();
});

it("the details card keeps its offer after an overview of the same job", () => {
  renderTranscript({ stages: { j1: storedAt("jd_written") }, messages: [detailsMessage("j1"), overviewMessage("j1")] });
  expect(screen.getByText("Add screening questions?")).toBeInTheDocument();
  expect(screen.getAllByText(RECEIPT)).toHaveLength(1);
});
```
ANSWER END
