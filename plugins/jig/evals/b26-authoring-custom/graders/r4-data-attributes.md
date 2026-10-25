---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: do the items expose their selected state as a `data-state` attribute (for example `checked` / `unchecked`, or `on` / `off`), with no per-state className prop?

PASS if yes. FAIL if items have no `data-state`, or state styling comes through props such as `activeClassName` / `selectedClassName`.
