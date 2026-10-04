---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the side menu's `Link`s prefetch the full route: `prefetch={true}` (or the bare `prefetch` prop) on each `Link`, so the first click on a menu item shows the page with no skeleton. A hover `router.prefetch` with no `prefetch={true}` on the `Link`s does not pass. FAIL if the `Link`s keep the default prefetch, or set `prefetch={false}`.
