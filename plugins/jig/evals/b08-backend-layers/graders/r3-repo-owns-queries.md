---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: does every Drizzle query (`select`, `update`, `insert`, `delete`, `db.query`) live in the repository, which receives the db or tx handle as an argument of its method or of its factory?

PASS if every query is in the repository file and the repository takes the handle as an argument. A `.transaction(...)` call, in the service or in the entry's binding of a `write` dependency, is not a query, and an `sql` fragment inside a repository query is still in the repository. FAIL if the service or the router writes a Drizzle query, or the repository imports the db client instead of receiving the handle.
