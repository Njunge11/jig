---
max_turns: 4
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill]
runs: 3
tags: [e2e-tests]
---

Make sure this function works for every input, and fix what is broken. One line for the fault, then the fixed function.

```ts
export function applyDiscount(priceCents: number, percent: number): number {
  if (percent < 0 || percent > 100) return priceCents;
  return priceCents - priceCents * (percent / 100);
}
```

The result must be a whole number of cents.
