---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does each server request get its own QueryClient (the server `getQueryClient` wrapped in React `cache`), while the browser reuses one module-level QueryClient?

PASS if both hold. FAIL if one QueryClient is shared across server requests (a module-level client used on the server), or the browser makes a new client on each render.
