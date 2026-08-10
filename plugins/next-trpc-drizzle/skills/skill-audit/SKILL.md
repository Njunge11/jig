---
name: skill-audit
description: Audits a skill against Anthropic's skill-authoring guide and fixes the failures. Checks structure, frontmatter, body, category techniques, and loading paths, fixes each failure, and re-audits until every item passes. Use when the developer asks to audit, review, fix, or check a skill, a SKILL.md, or a plugin's skills against the guide.
argument-hint: [path-to-skill-folder]
---

# Skill Audit

Audit one skill at a time, fix every failure, and prove the result with a re-audit.

## Instructions

### Step 1: Read the skill and find its consumers

The skill under audit is the folder at `$ARGUMENTS`. If you did not get a path, ask the developer which skill to audit.

Read the skill's `SKILL.md` and every file in its folder (`references/`, `scripts/`, `assets/`). Then find every consumer: grep the plugin's `skills/`, `agents/`, and `commands/` for the skill's name. A consumer is anything that loads the skill or names it.

### Step 2: Classify the skill

Assign one guide category. The category decides which technique checks apply in Step 3.

- **Document & asset creation** — the skill produces output (documents, code, designs) to a standard.
- **Workflow automation** — the skill drives a multi-step process.
- **MCP enhancement** — the skill guides the use of an MCP server's tools.

### Step 3: Walk the checklist

Walk the audit checklist below row by row. Give every item a verdict: **pass** or **fail**, with `file:line` evidence. Never skip a row. Never substitute a grep for reading the file.

### Step 4: Fix every failure

Fix each failing item in the skill's files. Two limits:

- Change only what the failing item requires. Do not rewrite passing content.
- A fix that changes the skill's meaning or scope — what it does, when it triggers, who consumes it — is the developer's decision. Ask first, with the failing item and your proposed fix.

### Step 5: Re-audit and report

Walk the checklist again on the fixed files. Repeat Steps 4–5 until every item passes. Then report: the category you assigned and why; each item that failed, its evidence, and the fix applied; and the final all-pass verdict.

## Audit checklist

### Structure

1. The folder name is kebab-case, and `SKILL.md` is spelled exactly so. No `README.md` inside the skill folder.
2. Each optional folder holds only its own kind: `scripts/` executable code, `references/` documentation loaded as needed, `assets/` templates used in output.

### Frontmatter

3. `name` is kebab-case and matches the folder name.
4. `description` states both WHAT the skill does and WHEN to use it, with specific trigger phrases a user would say. Under 1024 characters. No XML angle brackets. Not vague ("Helps with projects"), not trigger-less, not implementation jargon.
5. The description's scope is bounded. When an adjacent skill covers a neighboring task, the description says which skill handles what — otherwise the skill over-triggers.

### Body

6. Progressive disclosure holds: the body carries only the instructions every run needs. Material consulted only sometimes lives in `references/`, and the body link says what the file contains and when to load it. Body under 5,000 words.
7. The critical instructions sit at the top, not buried mid-file.
8. Every instruction is specific and actionable — a command to run, a condition to check, an output to expect. No "validate things properly" language an agent can read two ways.
9. The body is concise: numbered steps and bullets, one home per rule, no restated content.
10. The body shows examples of correct output or correct calls, and names the common failure cases with their fixes, where the skill acts on anything that can fail.
11. The skill composes: it does not assume it is the only skill loaded, and it does not duplicate content that another skill owns — it names that skill instead.

### Category techniques (apply the matching row only)

12. **Document & asset creation:** the standards are embedded (style guide, format rules), the output has a template, and a quality checklist runs before the output is final.
13. **Workflow automation:** the steps are explicit and ordered, each step has a validation gate before the next, and the workflow has a defined end state.
14. **MCP enhancement:** the MCP calls are sequenced explicitly, domain expertise is embedded, and common MCP errors have handling instructions.

### Loading

15. Every consumer has a real loading path: user invocation (`/name`), the description's triggers, an agent-frontmatter preload, or an explicit instruction to invoke the skill. A skill name mentioned in prose loads nothing.
16. The description triggers on the obvious task and on paraphrases of it, and does not trigger on unrelated topics. Judge this by reading the description against 3 sample requests of each kind.
