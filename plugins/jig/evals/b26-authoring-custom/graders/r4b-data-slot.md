---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does each exported part component put a kebab-case `data-slot` attribute, named by its purpose, on the element it renders (for example `data-slot="rating"` on the root, `data-slot="rating-item"` on each item)?

PASS if every exported part does. Inner elements that are not exported parts (a hidden input, an icon, a wrapper inside a part) do not need one. FAIL if an exported part renders no `data-slot`, or a name is not kebab-case.
