---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does each field render through react-hook-form `Controller` with the kit's `Field` parts, a label tied to the control, and `aria-invalid` on the control?

PASS if every field (title and size) renders through `<Controller>` inside the kit's `Field` parts, its label is tied to the control (`htmlFor` paired with the control's `id`, or a `FieldSet` legend for a radio group), and the control carries `aria-invalid`. FAIL if a field skips `Controller` or the `Field` parts, lacks the label pairing or `aria-invalid`, or the form keeps field values in `useState`.
