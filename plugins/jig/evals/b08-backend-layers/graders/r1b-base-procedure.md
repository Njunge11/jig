---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does `orders.cancel` take its authentication and authorization from a composed base procedure (such as `orgProcedure`, `protectedProcedure` or a permission-gated procedure), rather than from a session or permission check written inside its own handler?

PASS if the procedure is built on such a base procedure and its handler holds no session or permission check. FAIL if the procedure is built on `publicProcedure` with no check, or its handler checks the session, the role or a permission itself.
