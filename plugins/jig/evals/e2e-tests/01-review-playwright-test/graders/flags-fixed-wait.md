---
type: llm
weight: 1
---

PASS if the review names `waitForTimeout(2000)` or the manual `expect(await ...isVisible()).toBe(true)` as a fault and asks for an assertion that waits and retries (for example `await expect(locator).toBeVisible()`).
FAIL if the review names neither.
