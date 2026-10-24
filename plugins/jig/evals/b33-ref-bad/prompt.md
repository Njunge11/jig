---
description: "calibration: the b33 graders on a fixed bad answer"
tags: [calibration]
runs: 1
max_turns: 2
timeout_seconds: 120
allowed_tools: []
---

Reply with exactly the text between the ANSWER markers, word for word, and nothing else. Do not add or change anything.

ANSWER START
```tsx
// apps/dashboard/features/candidates/ui/stage-tabs.tsx
const TABS = [
  { key: "longlisted", status: "needs_review", label: "Longlisted" },
  { key: "shortlisted", status: "shortlisted", label: "Shortlisted" },
  { key: "not-a-match", status: "not_a_match", label: "Not a match" },
] as const;

export function StageTabs({ counts, active, onChange }: StageTabsProps) {
  return (
    <Tabs value={active} onValueChange={onChange}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>{t.label} {counts[t.status]}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

// apps/dashboard/features/home/ui/stage-badge.tsx
const LABEL: Record<ApplicationStatus, string> = { new: "New", needs_review: "Longlisted", shortlisted: "Shortlisted", not_a_match: "Not a match" };
export function StageBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant="secondary">{LABEL[status]}</Badge>;
}
```
ANSWER END
