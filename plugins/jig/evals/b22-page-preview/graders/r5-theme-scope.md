---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

The public page's theme scope is the `data-theme="storefront"` attribute that `app/shop/layout.tsx` sets, with the tokens and font of `app/shop/storefront.css`, which that layout imports.

Question: is the preview wrapped in that theme scope, with the stylesheet loaded where the preview renders, so the preview's tokens and fonts resolve as on the real page?

PASS if yes, including through a wrapper component that both the shop layout and the preview use. FAIL if the preview renders with the admin page's own theme, or sets `data-theme="storefront"` without the stylesheet that gives it its tokens.
