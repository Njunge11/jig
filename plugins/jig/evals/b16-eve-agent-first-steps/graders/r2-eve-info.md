---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer lists `pnpm exec eve info`, run from the app root that installs eve, as a step. The prompt says to list the steps and change no file, so a step the answer names and has not run yet passes. FAIL if it uses `npx eve`, or does not run `eve info`.
