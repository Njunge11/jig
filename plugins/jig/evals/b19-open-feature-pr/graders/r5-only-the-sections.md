---
type: regex
target: {source: file, path: .eval/pr.txt}
pattern: '^## (?!(?:What|Why|How|Verification)\s*$)'
flags: m
match: not_contains
weight: 1
---
