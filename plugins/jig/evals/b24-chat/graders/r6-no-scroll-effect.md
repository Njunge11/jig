---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests.

Question: does any code scroll the transcript by hand (an effect or handler calling `scrollIntoView`, setting `scrollTop`, or calling `scrollTo`)?

PASS if no code does. FAIL if a hand-written scroll exists.
