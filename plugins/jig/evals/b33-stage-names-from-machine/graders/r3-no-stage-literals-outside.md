---
type: llm
weight: 1
---

Judge only the one question below. Read only the code in the answer. If the answer has no code that decides the question, the verdict is FAIL.

Question: outside the machine file, does any file write stage values (`needs_review`, `shortlisted`, `not_a_match`) or tab keys (`longlisted`, ...) as literals in a list, array, tuple, union or record that decides which tabs show or what a stage is called?

PASS if no file does. Only code inside code blocks counts: prose, notes, and descriptions of tests to add do not. Importing a type, naming a tag, casting a type, or a test do not count. FAIL if one file does.
