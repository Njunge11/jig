---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the first argument of every `trace(...)` call that the diff adds (a `+` line) hold only `calling <name> to <purpose>` text, with no id value, email address or user-written text, and no result word such as `success` or `failed`?

PASS if every line string the diff adds holds only the name and the purpose. A `describe` callback is not a line string, and a log call is not a trace line. FAIL if any added line string interpolates an id, an email address or user text, or writes `success` or `failed` into the line.
