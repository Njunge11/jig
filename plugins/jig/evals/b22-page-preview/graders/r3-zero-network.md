---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does typing update the preview from the form's live values, with no network request?

PASS if the preview gets the live form values (`watch`, `useWatch`, component state) as props. FAIL if a change saves a draft, or fetches, to refresh the preview.
