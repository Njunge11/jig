---
type: regex
target: {source: file, path: docs/flows/refund-request.json}
pattern: '(?:[^\s.?!:"\\]+\s+){25,}[^\s.?!:"\\]+[.?!]'
match: not_contains
weight: 1
---
