---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the client code create or run an actor of `productDraftMachine` in the browser (`useMachine`, `useActor`, `useActorRef`, `createActor`, or `createActorContext`)?

PASS if no client code does. FAIL if any does.
