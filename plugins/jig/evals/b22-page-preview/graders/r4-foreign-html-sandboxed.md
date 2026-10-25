---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: before the pasted description HTML is rendered, is it either sanitized with an allowlist sanitizer (DOMPurify, sanitize-html) or contained in a sandboxed `srcDoc` iframe?

PASS if yes. FAIL if the raw pasted HTML reaches `dangerouslySetInnerHTML` or `innerHTML` with no sanitizer and no sandbox.
