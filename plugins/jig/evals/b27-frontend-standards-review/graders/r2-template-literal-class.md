---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other fault the review names or misses.

Question: does the review name `text-${tone}-600` as a fault because Tailwind cannot see a class built from a template literal, and give a fix that writes each tone's complete class string (a lookup object, CVA variants, or a conditional between full class names)?

PASS if yes. FAIL if the review does not name this fault, or its fix still builds the class name from pieces.
