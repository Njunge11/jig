---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does every guard and action the diff adds work on a row stored before the change, whose context holds only `missing`?

`resolveState` keeps a stored row's context as it is and does not fill in the machine's initial `context`, so a context field the diff adds is `undefined` on such a row.

PASS if each guard and action the diff adds reads its input from the event through `params`, or reads a context field that stored rows already have, or gives a field the diff adds a default where it is read (`context.pricingMissing ?? []`). PASS too if the diff adds no context field. FAIL if a guard or action the diff adds reads a context field that the diff adds with no default, such as `context.pricingMissing.length`.
