---
type: regex
target: {source: file, path: .eval/pr.txt}
pattern: '^## Verification\b(?=(?:(?!^## )[\s\S])*/members)(?=(?:(?!^## )[\s\S])*[Rr]esend)'
flags: m
weight: 1
---
