---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: can the rating be operated by keyboard alone, per the radio group pattern: the group is one Tab stop, and the arrow keys move focus and the selection between the items?

PASS if yes — a roving tabindex (`0` on the checked or first item, `-1` on the rest) with arrow-key handling, or native radio inputs sharing one `name`. FAIL if the items are click-only, or each item is its own Tab stop with no arrow-key handling.
