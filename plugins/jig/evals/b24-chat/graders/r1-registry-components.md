---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: are the transcript, each message, the composer and the markdown text rendering all built from AI Elements components — `Conversation` / `ConversationContent`, `Message` / `MessageContent`, `PromptInput`, and `MessageResponse` (its older name is `Response`)?

PASS if all four come from AI Elements. FAIL if any of them is hand-made markup (own bubbles, own scroll container, own textarea form, own markdown renderer).
