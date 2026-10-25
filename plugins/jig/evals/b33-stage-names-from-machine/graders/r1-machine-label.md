---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: after the diff, is the `meta.label` of the `needs_packing` state "To pack"?

PASS if the diff changes the label in the `meta` of the `needs_packing` state (its state config, `needsPacking` in `order-status.states.ts`) to "To pack", with any quote style and in any key order. FAIL if that label stays "Needs packing", or the diff renames the stage only in the reader module or on a screen.
