---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the server page render the client part inside `HydrateClient` and a `Suspense` boundary whose fallback is a skeleton?

PASS if the client part sits inside `<HydrateClient>` and a `<Suspense>` whose fallback is a skeleton component. FAIL if `HydrateClient` or the `Suspense` is missing, or the fallback is `null`, text or a bare spinner.
