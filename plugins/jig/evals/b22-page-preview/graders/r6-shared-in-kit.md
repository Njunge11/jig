---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

The public product page belongs to the storefront feature (`features/storefront/`). The product editor belongs to the products feature (`features/products/`).

Question: do the shared component that renders the product page, and the storefront theme scope that the preview renders in, live in `components/ui/`, so that no file under `features/products/` imports from `features/storefront/`, and no file under `features/storefront/` imports from `features/products/`?

PASS if both live under `components/ui/` and no such import across the two features exists. FAIL if either lives in a feature folder, or a file of one feature imports a file of the other.
