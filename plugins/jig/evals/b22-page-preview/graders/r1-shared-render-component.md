---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Before the change, the public product page (`app/shop/[productId]/page.tsx`) renders `StorefrontProduct`, which reads the product with a query and writes the page's markup in the same component. After the change, `StorefrontProduct` (or any wrapper) may still read the product, if it passes the product to the shared component.

Question: does the page's markup live in one component that takes the product as props and fetches nothing, and do both the public product page and the preview beside the product edit form render that component?

PASS if yes. FAIL if the preview renders its own lookalike markup, or the component with the markup fetches data itself.
