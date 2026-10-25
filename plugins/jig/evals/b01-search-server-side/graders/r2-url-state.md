---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the committed search term live in the URL through one nuqs parsers module that both the server page and the client import?

PASS if a single module defines the nuqs parser for the term, the server page parses `searchParams` with it (a `createLoader` loader or a search-params cache), and the client reads and writes the term with `useQueryState`/`useQueryStates` and the same parsers. FAIL if the term lives only in React state, or the server page and the client each declare their own parser for it.
