---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does each exported part component (the root, the item) pass the caller's `className` prop into `cn(...)` as the last argument on the element it renders, so the caller's classes win?

PASS if every exported part does. Inner elements that are not exported parts (an icon, a hidden input) take no caller `className` and do not count. A `{...props}` spread after `className={cn(...)}` is fine when `className` was destructured out of the props first. FAIL if an exported part ignores the caller's `className`, puts it before its own classes, or sets a fixed `className` after a spread that carries the caller's one.
