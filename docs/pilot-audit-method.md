# Pilot Audit Method

The standard for auditing a pilot run of the next-trpc-drizzle skills. Run after every pilot; output one audit doc per pilot in `docs/audits/<pilot>.md`. The audit is a row-by-row walk of the governing skills against evidence — never spot-checks, never impressions.

## 1. Locate the pilot transcript

Every session writes `~/.claude/projects/<project-slug>/<session-id>.jsonl` (for ajiri-monorepo: `-Users-njungenjenga-Personal-ajiri-monorepo`). Newest file after the run:

```
ls -t ~/.claude/projects/<project-slug>/*.jsonl | head -3
```

Confirm identity by grepping the candidate for the exact `/goal` or `/implementation-planner` command the developer pasted.

## 2. Extract facts from the transcript

Pull with `jq`/grep; each extraction answers a specific audit question:

- **`Skill` tool invocations** — was the prescribed skill (implementation-planner, build-backend-feature) actually invoked, and at what point in the run?
- **Bash calls + results, in order** — did each test run red *before* the implementing edit (the failing run must precede it in the stream)? one commit per behavior? hooks never bypassed (`--no-verify` absent)? no migration applied?
- **Write/Edit calls** — only prescribed paths touched? checklist file never reworded (it is immutable — only `[ ]` → `[x]`)?
- **Goal-evaluator turns** — what it rejected and why, and whether it cleared only on real pasted proof (green suite output, git log, PR URL actually present in the transcript at clear time).

## 3. Collect hard artifacts independently

Cross-check the transcript's claims against reality — never take the transcript's word:

- Generated files (tracker, checklists, handoff) read from disk.
- `git log --oneline main..<branch>` and `git diff main` on the actual branch.
- `gh pr view <url>` for the PR body.
- A fresh local suite run by the auditor.

Any claim in the transcript contradicted by an artifact is itself a finding.

## 4. Walk each governing skill as a literal table

One row per rule, for every skill that governed the run:

- **implementation-planner** — grounding (no unverified path/command/version), no invented semantics, lane classification, checklist format, run commands.
- **backend-tests** — the loop (red → self-check → green → refactor → commit → tick) plus its 10-item test review checklist, applied per test.
- **backend-standards** — the 24-item review checklist against the final diff.
- **open-feature-pr** — branch naming, title, What/Why/How/Verification body.

Verdict per row: **conformed / deviated / can't determine from evidence** — with the transcript line or artifact cited. "Can't determine" is a finding too: it means the skill or Done section failed to force observable proof.

## 5. Classify deviations and fix

Every deviation gets exactly one cause and its fix:

| Cause | Fix |
| ----------------------------- | ----------------------------------------------------------------------- |
| Rule missing from the skill | Add the rule |
| Rule ambiguous | Tighten the wording |
| Rule clear but ignored | Strengthen the instruction, or move enforcement into the `## Done` gates |
| Checklist itself wrong | Implementation-planner bug — fix the implementation-planner skill |

Commit the fixes to the plugin, update the installed plugin, run the next pilot. Each pilot is an iteration on the skills, not just a build.

## Output format

`docs/audits/<pilot>.md`: run metadata (date, session id, command pasted, plugin commit), the rule-by-rule table per skill, the deviation → cause → fix list, and the resulting plugin commits.
