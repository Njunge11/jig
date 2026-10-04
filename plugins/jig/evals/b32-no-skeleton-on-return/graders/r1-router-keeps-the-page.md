---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer sets `experimental.staleTimes.dynamic` in `next.config.ts` to a value greater than 0, so the router keeps a dynamic page it has shown and a return to it shows no skeleton. FAIL if the answer does not set `staleTimes.dynamic`, sets it to 0, or tells the developer not to configure it.
