---
type: llm
weight: 1
---

Judge only one fact: what the answer does with the job page's existing `STAGE_LABEL` in `apps/dashboard/features/job/ui/stage-tabs.tsx`. Ignore every other part of the answer.

PASS if the answer gives code for that file that takes the names from a module that reads the machine: an import from that module that replaces `STAGE_LABEL`, or a `STAGE_LABEL` computed from it. A code comment such as `// delete: const STAGE_LABEL ...` beside that import counts as the change. FAIL if the answer leaves `STAGE_LABEL` with its literal names: it says it did not change the file, leaves it for later or a follow-up, describes a change with no code for that file, or does not mention the file.
