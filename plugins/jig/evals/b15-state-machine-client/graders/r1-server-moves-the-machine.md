---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if a user action calls the server (`trpc.jobDraft.send`) and the client does not drive its own running copy of the machine (no `useMachine`, `useActor` or `createActor(...).start()` that moves the draft in the browser). FAIL if a browser-side actor moves the draft.
