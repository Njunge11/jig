---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other fault the review names or misses.

Question: does the review name the hand-written failure toasts of the archive mutation (`toast.error` in `onSuccess` and in `onError`, with the failure status read from the data of the mutation) as a fault, and give as the fix a `meta` on the mutation with a failure title (`meta: { failureTitle: "..." }`), so that the one handler of the query client shows the toast?

PASS if yes. FAIL if the review does not name this fault, or its fix keeps a `toast.error` call in the component.
