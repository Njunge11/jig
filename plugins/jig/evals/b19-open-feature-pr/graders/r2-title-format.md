---
type: regex
target: {source: file, path: .eval/pr.txt}
pattern: '^title: (?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([a-z0-9-]+\))?: [a-z]'
flags: m
weight: 1
---
