# Audit — pilot 39 (soft delete at the root, and delete_job)

Run: `/goal` on `docs/mcp-server/checklists/39-soft-delete-job.md`, ajiri-monorepo worktree `ajiri-39`, branch `feat/job-soft-delete-mcp`, PR [#96](https://github.com/Njunge11/ajiri-monorepo/pull/96). A `review-backend-feature` run passed both findings below before the rules existed. The developer raised both by reading the diff.

## Deviations → cause → fix

| # | Deviation | Cause (per method taxonomy) | Fix |
| - | --------- | --------------------------- | --- |
| 1 | Two service tests ("leaves the deleted job out of get_job / list_jobs") asserted filtering that exists only inside an inline stateful fake. The fake re-implements the repo's stamp-and-filter logic, so the tests stay green even when the real repo loses its `isNull(deletedAt)` filter. The service's own success answer (`{ status: "deleted" }`) was asserted nowhere. The codebase's `<x>.repo.fake.ts` + contract-test convention was ignored. | Rule missing from the skill — no item named "the assertion observes the fake's logic" | **Landed:** backend-tests review checklist item 13, with a wrong/right example taken from this file. A stateful fake lives in `<source>.repo.fake.ts` with a contract test. |
| 2 | `registerDeleteJob` passed a multi-line config object and a multi-line handler inline into one `register(...)` call — sixty lines inside one call expression, with no named parts. The developer rejected the shape: decompose, then pass names. | Rule missing from the skill | **Landed:** backend-standards review checklist item 25 and a "Pass a name, never a body" rule in `## Control flow`, with the wrong/right example taken from this handler. |

## Reviewer note

The independent review walked every existing item and still passed both findings, because neither rule existed. The rubric is the reviewer's whole judgment: a missing rule is an invisible defect. Each developer rejection therefore lands as a checklist item before the next run.
