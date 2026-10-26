---
type: regex
target: {source: file, path: .eval/diff.txt}
pattern: '^diff --git a/(?!docs/)'
flags: m
match: not_contains
weight: 1
---
