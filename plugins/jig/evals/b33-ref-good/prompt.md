---
description: "calibration: the b33 graders on a fixed good answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
I couldn't find the existing stage copies, because the repo isn't in this working directory. My grep for `needs_review`, `longlisted` and `Needs review` returned nothing. Before merging, search your checkout for any other map, list or union of stage names and make each one import from the reader module below. Nothing has been written or run.

**1. Machine.** The names, the URL tab keys and the tab sets go into `meta` and `tags`. The label for `needs_review` becomes "Longlisted", and the stored status values stay the same.

```ts
// packages/applications/src/machine/application-stage.machine.ts
export const applicationStageMachine = setup({
  types: {} as { events: StageEvent; tags: "candidatesTab" | "jobTab" },
}).createMachine({
  id: "applicationStage",
  initial: "new",
  states: {
    new: { meta: { label: "New" }, on: { SCREENED: { target: "needs_review" } } },
    needs_review: {
      tags: ["candidatesTab", "jobTab"],
      meta: { label: "Longlisted", tab: "longlisted" },
      on: { SHORTLISTED: { target: "shortlisted" }, REJECTED: { target: "not_a_match" } },
    },
    shortlisted: {
      tags: ["candidatesTab", "jobTab"],
      meta: { label: "Shortlisted", tab: "shortlisted" },
      on: { LONGLISTED: { target: "needs_review" }, REJECTED: { target: "not_a_match" } },
    },
    not_a_match: {
      tags: ["candidatesTab"],
      meta: { label: "Not a match", tab: "not-a-match" },
      on: { RESTORED: { target: "needs_review" } },
    },
  },
});
```

I also changed the string shorthand transitions to full objects, as the skill requires.

**2. Reader module.** Every screen imports stage names and tab sets from here.

```ts
// packages/applications/src/machine/application-stage.reader.ts
import { applicationStageMachine } from "./application-stage.machine";
import type { ApplicationStatus } from "../types";

type Tag = "candidatesTab" | "jobTab";

const nodes = Object.values(applicationStageMachine.states);

const stagesTagged = (tag: Tag) =>
  nodes
    .filter((node) => node.tags.includes(tag))
    .map((node) => ({
      status: node.key as ApplicationStatus,
      label: node.meta.label as string,
      tab: node.meta.tab as string,
    }));

export const CANDIDATE_STAGES = stagesTagged("candidatesTab");
export const JOB_STAGE_LIST = stagesTagged("jobTab");

export const stageLabel = (status: ApplicationStatus): string =>
  applicationStageMachine.states[status].meta.label;
```

**3. Job page file.** I removed its own copy and kept its exports and URL keys, so saved links still work.

```tsx
// apps/dashboard/features/job/ui/stage-tabs.tsx
import { JOB_STAGE_LIST } from "@acme/applications/machine/application-stage.reader";

export const JOB_STAGES = JOB_STAGE_LIST.map((stage) => stage.tab);
const STAGE_LABEL = Object.fromEntries(JOB_STAGE_LIST.map((stage) => [stage.tab, stage.label]));
// the rest of the file reads JOB_STAGES and STAGE_LABEL as before
```

**4. `StageTabs` for the candidates page.**

```tsx
// apps/dashboard/features/candidates/ui/stage-tabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CANDIDATE_STAGES } from "@acme/applications/machine/application-stage.reader";
import type { ApplicationStatus } from "@acme/applications";

export function StageTabs({
  counts,
  active,
  onChange,
}: {
  counts: Record<ApplicationStatus, number>;
  active: string; // the tab key from the URL
  onChange: (tab: string) => void;
}) {
  return (
    <Tabs value={active} onValueChange={onChange}>
      <TabsList>
        {CANDIDATE_STAGES.map((stage) => (
          <TabsTrigger key={stage.tab} value={stage.tab}>
            {stage.label}
            <span className="ml-2 text-muted-foreground tabular-nums">{counts[stage.status]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
```

The page that owns the URL should map the tab key to a status with `CANDIDATE_STAGES.find((s) => s.tab === active)?.status`. It should fall back to the first stage when the key is unknown.

**5. `StageBadge` for the home page.** It shows the name for any status, including `new`.

```tsx
// apps/dashboard/features/home/ui/stage-badge.tsx
import { Badge } from "@/components/ui/badge";
import { stageLabel } from "@acme/applications/machine/application-stage.reader";
import type { ApplicationStatus } from "@acme/applications";

export function StageBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant="secondary">{stageLabel(status)}</Badge>;
}
```

**Tests to add** (not written):
- A machine test that iterates `Object.keys(applicationStageMachine.states)`. It checks that every state has a label, and that every state in `CANDIDATE_STAGES` has a tab key.
- A render test for `StageTabs` that checks each tab's label and count on screen.
- A render test for `StageBadge` that iterates every state and checks its label on screen.

**Assumptions I made:**
- The package import paths (`@acme/applications/...`) and the `ApplicationStatus` import path are guesses. Adjust them to your repo.
- `not-a-match` is a new URL key I chose for the third tab.

ANSWER END
