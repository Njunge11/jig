---
type: llm
weight: 1
---

Judge only the one question below. Ignore every other fault the review names or misses.

Question: does the review name the page of its own in `app/orders/error.tsx` as a fault, and give as the fix the one export of the shared error page (`export { RouteError as default } from "@/components/ui/route-error";`)?

PASS if yes. FAIL if the review does not name this fault.
