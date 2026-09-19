---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer runs `pnpm exec eve info` from the app root that installs eve. FAIL if it uses `npx eve`, or does not run `eve info`.
