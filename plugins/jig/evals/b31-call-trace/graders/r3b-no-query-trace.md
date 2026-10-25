---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: are the Drizzle statements left for the db client to trace, with no repository and no service wrapping a statement in `trace` or a `traceQuery`-style helper by hand?

PASS if no repository and no service wraps a Drizzle statement in a trace helper; a `trace` line around a call to a repo method is not a wrapped statement. FAIL if a repository or a service wraps a Drizzle statement in a trace helper itself.
