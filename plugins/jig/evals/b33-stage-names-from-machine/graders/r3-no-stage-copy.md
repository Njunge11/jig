---
type: llm
focus: {source: file, path: .eval/diff-app.txt}
weight: 1
---

Judge only the one question below. The input is the git diff of the change the agent made to the app code, without its tests. If the diff has no code that decides the question, the verdict is FAIL.

Question: outside the machine's files and the one module that reads the stages from the machine, does the diff add no map of stage names, no list of stages and no union of stage values?

The machine's files are every file under `features/orders/machine/`: the setup, the states and the machine. The meta type that the setup declares in `types.meta` is where the tab keys' type belongs, so a union of tab keys in it is part of the machine.

The stage names are "To pack", "Shipped" and "Cancelled"; the stage values are `"needs_packing"`, `"shipped"` and `"cancelled"`, and the tab keys that the machine's `meta` holds (`"to_pack"`, …) count as stage values. A map is an object keyed by stage values or tab keys; a list is an array of them; a union is a type written as a union of them; a `switch` with a `case` label per stage counts as a list.

PASS if `StageTabs`, `StageBadge`, the URL parsers and every other file the diff adds or changes outside the machine's files and the reader write none of these. One stage value used on its own, such as the URL's default tab, is not a map, a list or a union. Comments and lines the diff removes do not count. FAIL if a file the diff adds or changes outside the machine's files and the reader writes such a map, list or union.
