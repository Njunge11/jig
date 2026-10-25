# jig evals — pending

Cost per item, measured by `claude plugin eval` for the item's run (3 runs per case):

- **Agent:** what Claude Opus 5.5 spends doing the case's task.
- **Judge:** what Claude Sonnet 5.5 spends grading the code (3 votes per llm grader).

An item with no eval run has no measured cost (—).

| Done | Item | Agent | Judge |
|---|---|---|---|
| [x] | b02-search-keeps-old-list: run again with `--keep-temp`; find why run 3 failed lint | $0.81 | $0.09 |
| [x] | b07-data-table: run | $2.43 | $0.75 |
| [ ] | b08-backend-layers: run | | |
| [ ] | b20-edit-surfaces: run | | |
| [ ] | b21-expanded-panel: run | | |
| [ ] | b32-no-skeleton-on-return: run | | |
| [ ] | Verify the 20 uncommitted skill edits in `plugins/jig/skills` | — | — |
| [ ] | Verify or discard the uncommitted changes in the old cases (a, b, c, d folders not yet committed) | — | — |
| [ ] | Fixture `tsconfig.json`: ship `"jsx": "react-jsx"` and the `.next/dev/types` include that `next build` writes | — | — |
| [ ] | Convert the code cases to the store-app design: b09, b10, b11, b14, b15, b22, b23, b24, b25, b26, b28, b29, b30, b31, b33, b35, b36 | | |
| [ ] | Decide b17 (planner writes a checklist) and b19 (open-feature-pr): grade the reply, or a written file | — | — |
| [ ] | Remove each converted case's `-ref-good` / `-ref-bad` folders | — | — |
| [ ] | Remove the old `/private/tmp/e-*` workspaces | — | — |

**Total so far:** agent $3.24, judge $0.84, together $4.08.
