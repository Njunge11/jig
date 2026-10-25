---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does the draft preview avoid loading the public product page (the `/shop/[productId]` route) in an iframe?

PASS if no iframe loads a `/shop` URL, and no `postMessage` syncs the draft. A sandboxed `srcDoc` iframe for the pasted HTML is fine, and so is a same-origin preview route that renders only the shared component for a device-width toggle. FAIL if the preview loads the public page's route in an iframe, or syncs the draft with `postMessage`.
