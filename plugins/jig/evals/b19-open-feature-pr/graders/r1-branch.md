---
type: regex
target: {source: file, path: .eval/pr.txt}
pattern: '^head: ((?:feat|fix|chore|refactor|docs|test|perf|build|ci|style|revert)/[a-z0-9]+(?:-[a-z0-9]+)*)$[\s\S]*\trefs/heads/\1$'
flags: m
weight: 1
---
