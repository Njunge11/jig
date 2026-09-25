---
type: llm
weight: 1
---

Judge only the one point below. Ignore every other quality of the answer. Do not fail the answer for a fault that this point does not name.

PASS if the answer includes a test that turns the trace on (`TRACE_LOG=1` or the same switch), collects the printed block through a `log` it passes in, calls `jobs.close` once, and asserts the block as a list of lines in call order: the root, each repo call and the email send under it, and the `query <verb> <table>` line the client prints under each repo call that runs a statement. FAIL if there is no test of the trace block, if the test asserts only that some text was logged, or if its expected list leaves out the query lines while the prompt says the client prints one per statement.
