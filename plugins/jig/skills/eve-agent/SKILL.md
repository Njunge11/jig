---
name: eve-agent
description: The rules for an eve agent — the files under agent/ (instructions, tools, hooks, state, agent config), the evals under evals/, and the useEveAgent client. Every gate is an eve command. Use when you add or change an eve agent tool under agent/tools, the agent's instructions.md, an agent hook under agent/hooks, defineState session state, a scope screen on the agent's model, an eve eval under evals/, or a chat UI built on useEveAgent, or when you review a diff that touches agent/ or evals/.
---

# eve agent

This skill holds the rules for the agent as a whole. The body of one tool file is the eve entry of the `backend-standards` skill (its section "Entry — eve agent tool", Review items 26–27); this skill does not restate it.

## Before you change anything under `agent/`

1. **Open the doc page for the slot you change.** The docs ship with the package at `node_modules/eve/docs/`. The **eve docs map** section at the end of this skill maps each slot to its page and section. Read the page for the installed version, not a memory of eve. A rule that the installed docs do not state is not a rule.
2. **Run `pnpm exec eve info` from the app root that installs `eve`.** It prints the discovered surface and the diagnostics. Never use `npx eve`: when the working directory has no `eve` installed, `npx` downloads the newest release and runs that version against the app. Fix every diagnostic before you write code.
3. **Find the project's eval script** in `package.json`. Every change below ends with that script green.

## Rules

`references/sources.md` records the doc page and the observation behind each rule; load it only when a rule's ground is questioned.

### Instructions

- **`agent/instructions.md` holds identity and standing rules, and nothing else.** System-role instructions ride every model call, so keep them short and stable. A procedure the model needs only sometimes is a skill under `agent/skills/`. Static instructions never run code.
- **A model call is a decision.** A step is one model call and the tool calls it makes, and every call resends the conversation. Put the model only where the next step is a choice. Three shapes are not choices: a button that always opens the same card, a tool that always follows another tool, and a fixed sentence after a card. The client draws the card, the two tools are one tool whose result carries what the turn shows, and the client shows the line. Before you add a tool, write down the decision the model makes by calling it.

### Tools

- **The body shape is the eve entry of `backend-standards`.** One file per tool under `agent/tools/`, the file name is the tool name, `execute` is a named function at module scope, expected failures are return values.
- **Declare `outputSchema` on a tool whose raw output a client, a hook or a mapping reads.** eve types the `execute` return from it, so the tool cannot return a shape the readers do not parse, and a mapping that narrows the result at runtime reads the same schema instead of a chain of `if` checks.
- **Project the result for the model with `toModelOutput`.** A result that a client renders holds options, prefilled values or long text. The model needs the status, the ids and the field names. Return `{ type: "json", value }` with only those. Hooks and the client still receive the full result on `action.result`.

  ```ts
  // agent/tools/update_job_draft.ts — the client renders `output`; the model reads the projection
  toModelOutput(output) {
    return { type: "json", value: { status: output.status, draft_id: output.draftId, missing: output.missing.map((f) => f.name) } };
  },
  ```
- **Return JSON only.** Convert `Date`, `Map`, `Set` and cyclic objects before you return them.
- **Gate an irreversible or external side effect with `approval`.** Import `always()` or `once()` from `eve/tools/approval`. An omitted `approval` is `never()`.
- **Make every write safe to run twice.** An interrupted step re-runs, so a tool can execute again after its first request reached the service. Use an idempotency key, or a recorded operation the tool checks, or approval.
- **A thrown error is a tool error the model reads.** eve does not retry a thrown tool. Throw only for a broken call.
- **Pass `ctx.abortSignal` to work that can be cancelled.**

### Built-in tools

- **Disable every default the agent must not have.** eve gives every agent `bash`, `read_file`, `write_file`, `web_fetch`, `web_search`, `todo`, `ask_question` and `agent`. Export `disableTool()` from `agent/tools/<slug>.ts` for each one the agent does not need. A slug that matches no built-in fails the build. Do this before the first run on a real model.

  ```ts
  // agent/tools/bash.ts — one file per default the agent must not have
  import { disableTool } from "eve/tools";
  export default disableTool();
  ```

### Hooks

- **A hook observes. It never blocks and never adds context.** A hook runs after the event is durably written.
- **A screen that must block sits on the model, not in a hook.** `defineAgent.model` accepts a provider-authored `LanguageModel`, so a wrapped model with middleware is the seam that can refuse a turn before the model runs.
- **Wrap a hook body in `try`/`catch`.** A thrown hook fails the turn.
- **A hook runs at least once per event.** Key a once-per-turn side effect on `turnId`, `stepIndex` and `sequence`. Key stored content on `meta.id`.
- **Time a turn from the events.** Every event carries `meta.at`. A hook on `step.started`, `step.completed`, `actions.requested`, `action.result` and `turn.completed` gives the model time, the tool time and the total per turn.

### State and context

- **What the agent must remember lives in `defineState`.** Declare the handle once at module scope, from `eve/context`, and import it in tools and hooks. `get()` and `update()` work only inside eve-managed code.
- **`clientContext` lasts one model call.** It never enters durable history. Send an id through it, then store it in state from the first tool that reads it.
- **State never reaches a subagent.**
- **The conversation's stage is an XState machine, not a field in `defineState`.** The `state-machines` skill owns the machine, the server that moves it, and the client that renders it.

### Execution

- **Count the steps of a lane.** A step is one model call and the tool calls it makes. Every turn ends with a model step. A lane's exact tool list, in order, and its step count are the budget its eval asserts.
- **A subagent costs a session and a sandbox.** Split one out only for a different prompt or a narrower tool surface.

### Human in the loop

- **`approval` and `ask_question` park the turn the same way.** Both emit `input.requested`. The client answers through `respond()` with the `requestId`.
- **The client reads the request from the part.** The pending request sits at `part.toolMetadata.eve.inputRequest` on a `dynamic-tool` part. Scan every message.

### Client

- **`useEveAgent` from `eve/react` is the client.** Render `data.messages`, steer on `status`, send with `send()`.
- **Resume a thread with `resume: true` and `initialSession`.** Persist the cursor from `onSessionChange`. Remount the chat on a thread switch with a `key`.

### Evals

- **`evals/evals.config.ts` exists, and one `.eval.ts` file is one case.**
- **One eval per tool runs on the compiled build.** A scripted `mockModel` turns one message into the one tool call. This is the only test that sees what the eve compiler breaks.
- **A lane eval asserts the exact tool list, in order, and the budget.** Use `t.toolOrder([...])` and `t.maxToolCalls(n)`, so a chain that grows by one tool fails.
- **Tag the evals that need a real model `live`, and exclude the tag in the default script.** A `--tag` that matches nothing is a configuration error. The live script loads its own keys (`dotenv -e .env -- eve eval --tag live`). It bills a real model for every case, so a builder never runs it: the developer runs it by hand, when they choose.
- **A judge sees the criteria and `on`, nothing else.** Every fact the criteria name (the JD, the brief, the reference) goes inside the `on` value; the reply carries none of it.
- **A bar is `.gate(n)`.** `.atLeast(n)` is soft: a missed score marks the case `scored` and the run still exits `0`.
- **A live seed ensures reference rows and never deletes them.** Cases run concurrently against one database, so a seed inserts a unique row with `onConflictDoNothing` and its cleanup removes only the rows the case owns.
- **A client stream fixture copies a real trace.** The `frontend-tests` Review checklist owns that rule. Capture the trace with `eve traces` (below).

### Measure

- **Read the turn from its trace.** `pnpm exec eve traces` prints the span tree of the last turn: each model step with its tokens, each `execute_tool` span with its tool name and duration. Set `EVE_TRACES_CONTENT=on` in `.env.local` to capture prompts and tool payloads.
- **The trace counts model steps and tool calls, not statements.** A tool's statements are its service's statement budget, asserted by the budget test `backend-standards` § "Queries & performance" demands. A lane is within budget when both hold: the trace's tool list and step count, and each tool's statement count.

## Common failures

- **`eve eval` reports a dev server already running.** The record in `.eve/dev-server-state.v1.json` points at the project's dev server. Move the file aside for the eval run and put it back. Never stop that server; it belongs to whoever runs `dev`.
- **A tool throws `ERR_INVALID_THIS` on the compiled build only.** A method was passed bare (`uuid: crypto.randomUUID`) and lost its `this`; the unit tests inject a fake and never see it. Wrap it: `uuid: () => crypto.randomUUID()`.

## Gates

Run all of these before a commit that touches `agent/`, `evals/` or a `useEveAgent` client. Paste the output in the proof.

1. `pnpm exec eve info`, run from the app root, prints no diagnostic.
2. The project's eval script (mock model, `--exclude-tag live`) exits `0`.
3. The project's live eval script was not run. It bills a real model for every case, and one builder that reran it after every fix cost a day's model budget in an evening. The handoff names it under manual verification for the developer, who runs it by hand before the merge.
4. For a lane change, `pnpm exec eve traces` of one real turn, with the count of model calls equal to the lane's budget.
5. `pnpm lint` exits `0` in the app root. It proves every Review item that ends with `Gate:`; walk the other items by hand.
6. For a change under `agent/` or in a feature's `api/` that a tool calls: the call-trace block of one real turn with `TRACE_LOG=1`, pasted, with one line per call the change adds or moves (`backend-standards` § "The call trace").

## Review checklist

Reject the change if any item is true. Walk it against every changed file under `agent/`, `evals/` and every client file that imports `eve/react`. Skip the walk when the diff touches none of them.

1. A rule or an API in the diff is not in the installed `node_modules/eve/docs/`.
2. `agent/instructions.md` holds a procedure, a tool chain, or a rule that changes per session.
3. A tool result that the client renders has no `toModelOutput`, or the projection carries option lists, prefilled values or long text.
4. A tool with an irreversible or external side effect has no `approval` and no idempotency key.
5. A default built-in tool the agent does not need is still enabled.
6. A hook blocks, injects context, or has an unguarded body.
7. A value the agent must remember across turns rides `clientContext` instead of `defineState`.
8. A lane has no eval that asserts its tool order and its call budget, or the eval is not tagged for the model it needs.
9. A `useEveAgent` client resumes a thread without `initialSession` and `resume: true`, or reuses one store across threads. Gate for the `resume: true` clause: `pnpm lint`, rule `no-restricted-syntax (eve-agent 9)`; walk the rest by hand.
10. A gate in the Gates section was not run, or its output is not in the proof.
11. A judge assertion's `on` lacks a fact its criteria name, or a threshold the spec states rides `.atLeast` instead of `.gate`.
12. A tool whose raw output a client, a hook or a mapping reads has no `outputSchema`. Gate: `pnpm lint`, rule `no-restricted-syntax (eve-agent new)`.
13. A tool's `execute` body runs outside the tool's trace root, or a call under it runs outside `trace`, so the turn's block misses it (`backend-standards` Review item 35).

## eve docs map

Load this file to find the doc page for the slot you change. Every path is under `node_modules/eve/docs/` in the app that installs `eve`. Open the page before you write. Check the installed version in `package.json` first; the pages describe that version.

| Slot | Page | Sections to read |
| ---- | ---- | ---------------- |
| Agent config, model, reasoning, limits | `agent-config.md` | "Set the model", "Reasoning effort", "Runtime limits" |
| Instructions | `instructions.mdx` | "Author instructions", "System and user roles", "Instructions vs skills" |
| What the model sees, and where each kind of context goes | `concepts/context-control.md` | "Recommended context layout" |
| Tool definition, `outputSchema`, `toModelOutput`, throws, `ctx` | `tools/overview.mdx` | "Define a tool", "The `ctx` parameter", "When a tool throws", "Shape what the model sees with `toModelOutput`" |
| Approval, `ask_question`, pause and resume | `tools/human-in-the-loop.md` | "Approvals", "Questions", "How pause and resume works" |
| Default tools, override, disable | `concepts/built-in-tools.md` | "Default tools", "Override a default", "Disable a default" |
| Hooks | `guides/hooks.md` | "Define a hook", "Persist events to your own database", "Execution order", "What happens when a hook throws" |
| Durable state | `concepts/state.md` | whole page |
| `ctx.session`, where runtime APIs work | `guides/session-context.md` | "`ctx.session`", "Where these APIs work" |
| Sessions, turns, steps, replay, steering | `concepts/execution-model-and-durability.mdx` | "Sessions, turns, and steps", "Resuming after a crash", "Message delivery and steering" |
| Stream events and the envelope | `concepts/sessions-runs-and-streaming.md` | "Stream a session", "The event envelope" |
| Compaction | `concepts/default-harness.md` | "Compaction" |
| Subagents | `subagents/index.mdx` | "The isolation boundary", "When to split" |
| Dynamic tools, instructions, model per session | `guides/dynamic-capabilities.md` | whole page |
| Skills the model loads on demand | `skills.mdx` | whole page |
| Client hook | `guides/frontend/overview.mdx` | "Basic chat (React)", "Returned state", "Human-in-the-loop prompts", "Attach page context per turn", "Resumable sessions" |
| Next.js mount | `guides/frontend/nextjs.mdx` | "Wrap the Next.js config", "Dev vs deploy topology" |
| Auth on the eve routes | `guides/auth-and-route-protection.md` | whole page |
| Evals: shape and `t` | `evals/overview.mdx` | "`defineEval`", "`evals.config.ts`", "Deterministic fixture models", "Gate vs soft" |
| Evals: assertions | `evals/assertions.mdx` | "Scoped assertions", "The matcher mini-language" |
| Evals: multi-turn, in-flight, datasets | `evals/cases.mdx` | "Multi-turn evals", "In-flight turns" |
| Evals: CLI, tags, exit codes, artifacts | `evals/running.mdx` | whole page |
| CLI: `info`, `build`, `dev`, `logs`, `traces`, `eval` | `reference/cli.md` | "eve info", "eve build", "eve dev", "eve logs", "eve traces", "eve eval", "Recommended loop" |
| Tracing and the error catalog | `guides/instrumentation.md` | whole page |
| Sandbox | `sandbox.mdx` | whole page |
| Channels | `channels/overview.mdx`, `channels/eve.mdx` | the page of the channel in use |
