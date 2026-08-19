# Audit — pilot 38 (job-lifecycle cores in packages/job-drafts)

Run: `/goal` on `docs/mcp-server/checklists/38-job-lifecycle-cores.md`, ajiri-monorepo worktree `ajiri-38`, branch `refactor/job-lifecycle-cores`, PR [#95](https://github.com/Njunge11/ajiri-monorepo/pull/95). Plugin commit at run time: `292ab2a`.

This audit records one finding only. The developer raised it by reading the diff, before any rule walk. A full rule walk is still outstanding.

## Deviations → cause → fix

| # | Deviation | Cause (per method taxonomy) | Fix |
| - | --------- | --------------------------- | --- |
| 1 | The builder shared the ownership check and the `try/catch` through a higher-order `onOwnedJob(id, companyId, write)` helper. Both service writes became a callback passed into it, so neither method read top to bottom. The developer rejected the shape on sight. | Rule missing from the skill | **Landed:** backend-standards gains a `## Control flow` section and review checklist item 22. A shared prologue must be a function that returns a value the caller checks, never one that takes the rest of the method as a callback. |

| 2 | The builder wrapped one validation function in a `makeJobValidator(reader)` factory, so a function returned a function to bind a single argument. The developer rejected it as the same class of indirection. | Rule missing from the skill | **Landed:** the factory rule in `## Structure` now states its own limit — only a service or a repository is a factory; everything else takes its dependencies as parameters. Review checklist item 23 enforces it. |

| 3 | The dashboard jobs service writes twelve method bodies inside the object it returns, so the file has no readable public surface. The builder left that shape in place while editing the file. The developer rejected the shape itself. | Rule missing from the skill — its own service example taught the shape | **Landed:** a factory now returns a list of named functions. Review checklist item 24 enforces it, and the `makeInvitesService` example in `## Structure` was rewritten to obey it. |

## Related builder deviations, self-corrected in the same session

These never reached a rule change; the existing rules already covered them, and the developer caught each one in review.

- Two type parameters on the factory, so the host kept its own row and patch types. Checklist item 21 already forbids a hand-written type where Drizzle inference exists. The fix derived both types from the schema.
- A per-field `pick` helper in the merge, in place of the RFC 7396 filter-then-spread. No rule covers merge-patch shape; the developer asked for the simplification directly.

## Outstanding

- The rule walk for backend-tests, backend-standards items 1–21, and open-feature-pr has not run for this pilot.
