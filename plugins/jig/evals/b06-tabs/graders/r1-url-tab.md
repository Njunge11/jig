---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the active tab live in the URL through a nuqs parsers module that both the server page and the client import?

PASS if one module defines the `tab` parser, the server page parses `searchParams` with it, and the client binds the `Tabs` value to `useQueryState`/`useQueryStates` with the same parsers. FAIL if the tab lives only in React state, or the server and the client each declare their own parser for it.
