---
type: regex
target: {source: file, path: .eval/pr.txt}
pattern: '^## Verification\b(?=(?:(?!^## )[\s\S])*pnpm vitest)(?=(?:(?!^## )[\s\S])*1802)'
flags: m
weight: 1
---
