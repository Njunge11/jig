---
type: regex
target: {source: file, path: docs/flows/order-cancellation.json}
pattern: '(?:[^\s.?!:"\\]+\s+){25,}[^\s.?!:"\\]+[.?!]'
match: not_contains
weight: 1
---
