---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the component is a compound: a `Root` that owns shared state in Context, and named parts (such as `Item`) that read it; one exported part wraps one element. FAIL if it is one monolithic component configured by props.
