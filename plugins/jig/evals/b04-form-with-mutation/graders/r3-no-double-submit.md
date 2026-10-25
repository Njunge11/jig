---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Is the submit button disabled while the mutation is pending?

PASS if the submit button's `disabled` is bound to the mutation's pending state (`mutation.isPending`, or `formState.isSubmitting` around an awaited `mutateAsync`). FAIL if the button stays enabled while the mutation runs.
