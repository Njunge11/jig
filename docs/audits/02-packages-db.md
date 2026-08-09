# Audit — Pilot 02: packages/db extraction (chore lane)

First pilot of the chore/refactor lane. The run produced correct work. The goal never cleared, because the checklist carried one unsatisfiable gate and one fragile gate. Both defects trace to the initializer: it did not run the gate commands before it wrote them.

## Run metadata

| Item                | Value                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Date                | 2026-08-09                                                                                     |
| Spec                | `docs/packages-db-extraction.md` (ajiri-monorepo)                                              |
| Checklist           | `docs/mcp-server/checklists/02-packages-db.md`, tracker row 02                                 |
| Initializer session | `46eddce0-6078-4514-85ca-e5dcecdca87f` (Fable 5; first invocation interrupted by model switch) |
| Build session       | `c095f8f4-d508-4e44-82ec-d169827f94c3` (Opus 5, 1M context), 408 Bash calls                    |
| Command pasted      | `/goal every step and every Done item in docs/mcp-server/checklists/02-packages-db.md is shown satisfied in the transcript, including pasted green output for each gate` — verbatim match with the tracker |
| Plugin commit       | `6910077` (cache `69100778ebd5`)                                                               |
| Result              | PR [#43](https://github.com/Njunge11/ajiri-monorepo/pull/43) open. Tracker row flipped to Done. Goal **not** cleared — 2 evaluator rejections, session ended mid-remediation. |

## Auditor cross-check (fresh runs, 2026-08-09)

Every transcript claim held against independent artifacts:

| Claim                                        | Auditor result                                                      |
| -------------------------------------------- | ------------------------------------------------------------------- |
| Dashboard suite at baseline counts           | Green: 194 files +1 skipped, 1762 tests +1 skipped — exact match     |
| Admin suite at baseline counts               | Green: 34 files, 312 tests — exact match                             |
| Root typecheck / `@ajiri/db` typecheck       | Both exit 0                                                          |
| `db:generate` no-op, tree clean after        | `No schema changes, nothing to migrate 😴`; `git status` clean       |
| Drizzle move is renames only                 | 143 lines, all `R100`                                                |
| Greps: `@/lib/db`, screening aliases, admin  | 0 / 0 / **1** (gate 10 still red — see finding 2)                    |
| `pnpm knip` "clean"                          | Exits 1 today, on findings that predate the branch (gate 7 — finding 1) |
| No migration applied                         | Journal byte-identical to main (sha256 match in transcript), 71 entries both sides |
| PR open with What/Why/How/Verification       | Confirmed via `gh pr view 43`                                        |

No transcript claim was contradicted by an artifact. The builder's honesty held under pressure: it refused to edit the stale file that broke gate 10 ("doctoring a generated artifact to satisfy a grep would be dishonest").

## Rule walk — initializer

| Rule                                                             | Verdict       | Evidence                                                                                                    |
| ---------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| Read the full spec before anything else                          | conformed     | First tool call is `Read docs/packages-db-extraction.md`                                                     |
| No invented semantics; ask when undecided                        | conformed     | Checklist content traces to the spec; the one open question ("why is it 02?") was answered from the design doc |
| Verify each **path** and **version** against the repo            | conformed     | Importer counts (18, 17), drizzle file count (143), dep versions, tsconfig, CI workflows all read in-session |
| Verify each **command** against the repo                         | **deviated**  | Script names were read from package.json, but no gate command was ever **executed**. `pnpm knip` was never run — it exits 1 on main. Gates 7 and 10 shipped unsatisfiable/fragile. |
| Chore lane: first step is a baseline shown green                 | **defect in the rule** | The rule assumes the baseline IS green. On this repo one baseline check was red before the work began.       |
| `## Done`: gate only on what the transcript can show             | **deviated**  | "pnpm knip clean" and the admin grep → 0 could never be shown green. Justification is not green output.       |
| Run command matches the chore-lane template, < 4,000 chars       | conformed     | Verbatim template match                                                                                      |
| Only author documents; no code, no branches                      | conformed     | Two Writes only: tracker.md, checklist. (Files left uncommitted; the build session committed them — acceptable, but unowned.) |
| Checklist speaks only to the builder; no provenance notes        | conformed     | Checklist is instructions and gates only                                                                     |

## Rule walk — build run (the checklist is the procedure)

| Rule / step                                                       | Verdict      | Evidence                                                                                              |
| ----------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| Steps 1–10 executed in order                                      | conformed    | Bash stream: baseline (cmds 4–15) → package (16–20) → `git mv` (21–53) → rewrites (54–163) → CI (170–175) → knip (196–203) |
| Baseline recorded before any edit                                 | conformed    | Both suite counts and a knip snapshot captured before the first move                                   |
| Only prescribed paths touched                                     | deviated (minor) | Extra edits: dashboard `CLAUDE.md`, admin partners `DESIGN.md` (doc refs to moved paths), `.prettierignore`. All correct; none prescribed. |
| Checklist never reworded                                          | conformed    | Zero Edit calls against the checklist file                                                             |
| Gates ticked `[ ]` → `[x]` as satisfied                           | **can't determine — no rule exists** | All 13 Done boxes are still `[ ]` on disk. No skill text tells the chore-lane builder to tick them.     |
| Hooks never bypassed                                              | conformed    | Zero `--no-verify`, zero `--passWithNoTests` in the transcript                                          |
| No migration applied                                              | conformed    | Only `drizzle-kit generate` ran; journal identical; `db:migrate`/`db:push` absent from the stream       |
| Honest failure reporting                                          | conformed    | Both non-green gates stated plainly, with cause, in the final report                                    |
| Recovery under harness pressure                                   | conformed (notable) | lint-staged prettier reformatted the moved drizzle snapshots; the builder caught it via the R100 gate, restored bytes from `main`, added `.prettierignore` |

## Rule walk — open-feature-pr

| Rule                                                    | Verdict      | Evidence                                                                       |
| ------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| Skill invoked in-transcript                             | conformed    | One `Skill: next-trpc-drizzle:open-feature-pr` call                            |
| Precondition: every behavior `[x]`                      | **inapplicable — lane mismatch** | Chore lane has no behavior list; boxes were unticked                            |
| Precondition: `handoffs/NN-<feature>.md` exists         | **inapplicable — lane mismatch** | Chore lane defines no handoff; none exists                                     |
| Branch `<type>/<slug>`; conventional title ≤ 72 chars   | conformed    | `chore/packages-db`; `refactor(db): extract lib/db into packages/db`           |
| Body: What/Why/How/Verification, names the checklist    | conformed    | All four sections; Why names checklist + tracker row                           |
| Verification = "the checklist's Manual verification steps" | adapted   | Chore checklists have no Manual-verification section; builder substituted the gates table — the right call, but outside the letter |
| Language rules; no AI attribution                       | conformed    | Checked the full body                                                          |

## Rule walk — /goal machinery

Both rejections were **correct literal readings of the condition**. The machinery worked; the authored condition was the problem.

- **Rejection 1:** tail-truncated suite output is not "pasted green output". Forced full re-runs with complete output, turbo cache defeated. Legitimate, but expensive — the condition never defined what "pasted output" suffices.
- **Rejection 2:** gates 7 and 10 are not green and cannot be. "Justification does not satisfy the condition's literal requirement." Correct — and a dead end. The goal could never clear.
- **End state:** session cut off while fixing gate 10, with gate 7 awaiting a user decision. The tracker says Done, but Done was the builder's claim, not the evaluator's clearance. The stale `apps/admin/.tend/report.json` is still present today; gate 10 still reads 1.

## Deviations → cause → fix

| # | Deviation                                                                 | Cause (per method taxonomy)        | Fix |
| - | ------------------------------------------------------------------------- | ---------------------------------- | --- |
| 1 | Gate 7 "`pnpm knip` clean" unsatisfiable — knip exits 1 on main            | Checklist wrong → **initializer bug** | **Decided 2026-08-09:** knip is not a gate. Repo-hygiene tools run in the developer's separate workflow, outside the row. The skill's chore-lane gate list now excludes them. Additionally proposed: the initializer executes every remaining Done-gate command during the audit and records the actual baseline result. |
| 2 | Gate 10 grep counts an untracked stale artifact (`.tend/report.json`)      | Same initializer bug               | Covered by fix 1 (running the gate surfaces the 1 immediately). Also: author tracked-file assertions as `git grep`, not working-tree `grep`. |
| 3 | Evaluator loop over output verbosity; full 1,762-test output demanded      | Rule ambiguous                     | Chore-lane run-command/Done template defines sufficiency: "paste the command, its final summary lines, and its exit code". |
| 4 | Done checkboxes never ticked while tracker says Done                       | Rule missing                       | Chore-lane rule: tick each gate when its output is pasted — or drop checkboxes from chore-lane Done sections. |
| 5 | open-feature-pr preconditions/Verification assume the feature lane         | Rule missing                       | **Landed 2026-08-09:** lane-aware preconditions and Verification added to the skill. |
| 5b | PR body drifts from Google CL guidance: sentence fragments, diff restatement in How, session-relative jargon in Verification ("same as baseline", "3 successful, 3 total", knip narrative) | Rule missing / rule ambiguous | **Landed 2026-08-09:** open-feature-pr now cites Google's CL guidance, requires complete sentences, adds a delete-if-diff-shows-it test for How, and a Verification audience rule (written for a reviewer who never saw the session, values instead of "baseline"). |
| 6 | Goal never cleared, tracker flipped anyway; remediation half-landed        | Consequence of 1–2                 | With fix 1 the condition is satisfiable. Additionally: order Done so the tracker flip is the **last** item, after every gate is shown. |
| 7 | lint-staged prettier rewrote moved generated files; unplanned recovery     | Checklist gap (foreseeable repo fact) | Initializer chore-lane audit records the hook chain's effect on moved generated files; prescribe the ignore entry in the move step. |
| 8 | Unprescribed doc edits (CLAUDE.md, DESIGN.md)                              | Rule missing (minor)               | Chore-lane step template: "update in-repo docs that reference moved paths" — or explicitly leave to builder judgment. |

## Effectiveness verdict

The skills produced a correct, honest, well-evidenced refactor: behavior provably unchanged, invariants intact, clean recovery from an unanticipated hook interaction, and a PR that follows the template. What failed was **closure**: the initializer wrote gates it never ran, so the goal condition was unsatisfiable from the moment it was authored, and the run ended blocked instead of clearing. Every fix lands in the initializer and open-feature-pr skills; the build-side conduct needs no correction.

## Resulting plugin commits

- Fix 1 (knip removed from the chore-lane gate list) — committed with this audit.
- Fixes 2–5 and 7 remain proposed against the initializer and open-feature-pr skills.

## Outstanding repo actions (ajiri-monorepo)

- ~~`apps/admin/.tend/report.json` trips gate 10's working-tree grep.~~ Deleted 2026-08-09 (backup saved first); gate 10 now reads 0.
- The 13 Done boxes in `docs/mcp-server/checklists/02-packages-db.md` are unticked. Tick them or accept the tracker as the record.
