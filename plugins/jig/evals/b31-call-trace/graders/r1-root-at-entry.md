---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the new `cancel` procedure get its call-trace root from the base procedure, with its purpose stated in `.meta({ purpose: "<words>" })`, and with no second root opened?

The base procedure's first middleware already opens the root (`traceBlock` in `lib/trpc/init.ts`), with the line `calling <path> to <meta.purpose>`.

PASS if `cancel` is built on `orgProcedure` (or another procedure built on `publicProcedure`), sets `.meta({ purpose: ... })` with words that say what the procedure does, and the diff adds no `traceBlock`, `traceRoot` or other root helper in the router, the service or the repo. FAIL if `cancel` has no `.meta({ purpose })`, or the diff opens a second root anywhere.
