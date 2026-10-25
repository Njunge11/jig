---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the diff's `next.config.ts` set `experimental.staleTimes.dynamic` to a number of seconds greater than 0?

PASS if the code sets `staleTimes` under `experimental` with a `dynamic` value greater than 0, written as a literal, a named constant, or an expression (such as `5 * 60`). The other config keys may stay. FAIL if the diff does not change `next.config.ts`, sets no `staleTimes.dynamic`, or sets it to 0.
