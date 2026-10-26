---
type: regex
target: {source: file, path: .eval/pr.txt}
pattern: 'Co-Authored-By|Generated (with|by)|Claude|ChatGPT|Copilot|\bAI\b|\bLLM\b|🤖'
flags: i
match: not_contains
weight: 1
---
