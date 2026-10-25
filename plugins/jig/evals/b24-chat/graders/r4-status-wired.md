---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: while `status` is `"submitted"` or `"streaming"`, is the send control replaced by, or disabled beside, a stop control that calls `stop()`?

PASS if yes (for example `<PromptInputSubmit status={status} onStop={stop} />`, or a separate stop button that calls `stop()` while send is disabled). FAIL if send stays active while streaming, or nothing calls `stop()`.
