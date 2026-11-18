---
type: regex
target: {source: file, path: .eval/diff-app.txt}
pattern: '^\+.*toast\.error'
flags: m
match: not_contains
weight: 1
---
