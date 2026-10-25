---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: Does the table scroll sideways inside its own container on a narrow screen?

Fact: the kit `Table` from `@/components/ui/table` renders its `<table>` inside a `div` with `overflow-x-auto`.

PASS if the table renders through the kit `Table`, or sits in a wrapper with an `overflow-x-auto` or `overflow-x-scroll` class. FAIL if the diff renders the table in a way that makes the page itself scroll sideways, such as a fixed width with no scrolling wrapper.
