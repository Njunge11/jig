---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if every call the service makes — each repo method it calls and the `email.send` — is wrapped in `trace("calling <name> to <purpose>", () => ...)`, where the name is the real function's name (for example `repo.closeJob`, `repo.rejectNewApplications`, `email.send`) and the purpose says in words what the call is for. FAIL if any repo call or the email send runs without a `trace` line, or if a line has no purpose clause.
