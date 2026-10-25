---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Do the form's resolver and the `products.create` procedure input use one exported Zod schema?

PASS if one module exports the schema, `zodResolver(...)` uses it, and the procedure's `.input(...)` uses the same export. FAIL if the form declares a schema of its own, or the procedure input keeps a separate schema, or the diff does not change the procedure to use the export.
