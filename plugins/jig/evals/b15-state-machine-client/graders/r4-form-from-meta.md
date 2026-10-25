---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: is the form component chosen from the `form` value in the current state's `meta` (read through `getMeta()`), mapped to `DetailsForm`, `ReviewForm` or `SummaryView`?

PASS if yes. FAIL if a `switch`, an `if` chain or a table keyed by the state name (`collecting`, `reviewing`, `published`) picks the form.
