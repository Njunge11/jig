---
description: "state-machines: a new stage's card part is named in meta and tested in every state"
tags: [obedience, frontend]
runs: 3
max_turns: 8
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `state-machines` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The server owns this XState v5 machine. Each job row stores its snapshot. The chat reads every job's stored snapshot in one request.

```ts
// packages/jobs/src/machine/job.machine.ts
export const jobMachine = setup({
  types: {} as {
    context: { version?: number };
    events: JobEvent;
    meta: { part?: "details-form" | "details-record"; offer?: "write-jd" | "screening-questions"; receipt?: "published" };
    tags: "jd";
  },
}).createMachine({
  id: "job",
  initial: "details_pending",
  states: {
    details_pending: { meta: { part: "details-form" }, on: { DETAILS_SAVED: "details_saved" } },
    details_saved: { meta: { part: "details-record", offer: "write-jd" }, on: { JD_WRITTEN: "jd_written" } },
    jd_written: { tags: ["jd"], meta: { part: "details-record", offer: "screening-questions" }, on: { PUBLISHED: "published" } },
    published: { tags: ["jd"], meta: { receipt: "published" } },
  },
});
```

A chat shows one card per tool result. Several cards can be about the same job: the card of the turn that created the job, the card of a turn that reopened its form, and so on. The transcript code today:

```tsx
// apps/web/channels/web/ui/chat-transcript.tsx
// The last part of each job whose card is `staged`.
const lastCards = lastCardOfEachJob(messages);
// …for each part:
const card = cardFor(part);
if (card.staged) return <StagedPart card={card} part={part} isLastCard={lastCards.has(part)} />;
return <card.Component part={part} />;

// apps/web/channels/web/ui/staged-part.tsx
export function StagedPart({ card, part, isLastCard }: StagedPartProps) {
  const stored = useJobStage(card.staged(part));
  const snapshot = jobMachine.resolveState(stored);
  const meta = snapshot.getMeta()[`job.${snapshot.value}`];
  const stage = {
    draws: meta?.part,
    receipt: isLastCard && snapshot.hasTag("jd") ? (snapshot.context.version ?? null) : null,
    offer: isLastCard ? (meta?.offer ?? null) : null,
  };
  return <card.Component part={part} stage={stage} />;
}

// apps/web/features/jobs/ui/cards/details-card.tsx — `staged: (part) => part.data.jobId`
// It draws the form or the record `stage.draws` names, then <VersionReceipt version={stage.receipt} />
// ("The job description is written · v1") when `stage.receipt !== null`, then the offer `stage.offer` names.
```

The overview card is also in the chat. It is a card that only reads the job's stage: it is not `staged`, and it shows the job's details only.

New feature: once a job is published, the chat offers "Write an interview plan?" under the published receipt. When the plan is written, the offer goes. The job's row has a new column `interview_plan jsonb null`.

Build the stage and the client part. Change every file you need, and write the tests. Do not write any file. Reply with the code.
