---
name: eve-agent
description: The rules for an eve agent — the files under agent/ (instructions, tools, hooks, state, agent config), the evals under evals/, and the useEveAgent client. Every rule cites the eve docs installed in node_modules, and every gate is an eve command. Use when you add or change an eve agent tool under agent/tools, the agent's instructions.md, an agent hook under agent/hooks, defineState session state, a scope screen on the agent's model, an eve eval under evals/, or a chat UI built on useEveAgent, or when you review a diff that touches agent/ or evals/.
---

# eve agent

eve is a framework with its own compiler, durable runtime and eval runner. A rule about eve has one source, the docs the installed version ships, and one proof, an eve command. This skill holds the rules for the agent as a whole. The body of one tool file is the eve entry of the `backend-standards` skill (`references/eve-entry.md`, Review items 26–27); this skill does not restate it.

## Before you change anything under `agent/`

1. **Open the doc page for the slot you change.** The docs ship with the package at `node_modules/eve/docs/`. `references/eve-docs-map.md` maps each slot to its page and section. Read the page for the installed version, not a memory of eve. A rule that the installed docs do not state is not a rule.
2. **Run `pnpm exec eve info` from the app root that installs `eve`.** It prints the discovered surface and the diagnostics. Never use `npx eve`: when the working directory has no `eve` installed, `npx` downloads the newest release and runs that version against the app. Fix every diagnostic before you write code. Source: `reference/cli.md` § "eve info".
3. **Find the project's eval script** in `package.json`. Every change below ends with that script green. Source: `evals/running.mdx` § "Exit codes".

## Rules

Each rule names its doc page under `node_modules/eve/docs/`. `references/sources.md` records the observation behind each rule; load it only when a rule's ground is questioned.

### Instructions

- **`agent/instructions.md` holds identity and standing rules, and nothing else.** System-role instructions ride every model call, so keep them short and stable. A procedure the model needs only sometimes is a skill under `agent/skills/`. Static instructions never run code. Source: `instructions.mdx` § "Author instructions" and § "Instructions vs skills".
- **A model call is a decision.** A step is one model call and the tool calls it makes, and every call resends the conversation. Put the model only where the next step is a choice. Three shapes are not choices: a button that always opens the same card, a tool that always follows another tool, and a fixed sentence after a card. The client draws the card, the two tools are one tool whose result carries what the turn shows, and the client shows the line. Before you add a tool, write down the decision the model makes by calling it. Source: `concepts/execution-model-and-durability.mdx` § "Sessions, turns, and steps".

### Tools

- **The body shape is the eve entry of `backend-standards`.** One file per tool under `agent/tools/`, the file name is the tool name, `execute` is a named function at module scope, expected failures are return values. Source for the name rule: `tools/overview.mdx` § "Define a tool".
- **Project the result for the model with `toModelOutput`.** A result that a client renders holds options, prefilled values or long text. The model needs the status, the ids and the field names. Return `{ type: "json", value }` with only those. Hooks and the client still receive the full result on `action.result`. Source: `tools/overview.mdx` § "Shape what the model sees with `toModelOutput`".

  ```ts
  // agent/tools/update_job_draft.ts — the client renders `output`; the model reads the projection
  toModelOutput(output) {
    return { type: "json", value: { status: output.status, draft_id: output.draftId, missing: output.missing.map((f) => f.name) } };
  },
  ```
- **Return JSON only.** Convert `Date`, `Map`, `Set` and cyclic objects before you return them. Source: `tools/overview.mdx`, the paragraph after `toModelOutput`.
- **Gate an irreversible or external side effect with `approval`.** Import `always()` or `once()` from `eve/tools/approval`. An omitted `approval` is `never()`. Source: `tools/human-in-the-loop.md` § "Approvals".
- **Make every write safe to run twice.** An interrupted step re-runs, so a tool can execute again after its first request reached the service. Use an idempotency key, or a recorded operation the tool checks, or approval. Source: `tools/overview.mdx` § "When a tool throws".
- **A thrown error is a tool error the model reads.** eve does not retry a thrown tool. Throw only for a broken call. Source: `tools/overview.mdx` § "When a tool throws".
- **Pass `ctx.abortSignal` to work that can be cancelled.** Source: `tools/overview.mdx` § "The `ctx` parameter".

### Built-in tools

- **Disable every default the agent must not have.** eve gives every agent `bash`, `read_file`, `write_file`, `web_fetch`, `web_search`, `todo`, `ask_question` and `agent`. Export `disableTool()` from `agent/tools/<slug>.ts` for each one the agent does not need. A slug that matches no built-in fails the build. Do this before the first run on a real model. Source: `concepts/built-in-tools.md` § "Default tools" and § "Disable a default".

  ```ts
  // agent/tools/bash.ts — one file per default the agent must not have
  import { disableTool } from "eve/tools";
  export default disableTool();
  ```

### Hooks

- **A hook observes. It never blocks and never adds context.** A hook runs after the event is durably written. Source: `guides/hooks.md` § "Define a hook" and § "Execution order".
- **A screen that must block sits on the model, not in a hook.** `defineAgent.model` accepts a provider-authored `LanguageModel`, so a wrapped model with middleware is the seam that can refuse a turn before the model runs. Source: `agent-config.md` § "Set the model"; `guides/hooks.md` § "Define a hook" ("Handlers are observe-only").
- **Wrap a hook body in `try`/`catch`.** A thrown hook fails the turn. Source: `guides/hooks.md` § "What happens when a hook throws".
- **A hook runs at least once per event.** Key a once-per-turn side effect on `turnId`, `stepIndex` and `sequence`. Key stored content on `meta.id`. Source: `guides/hooks.md` § "Persist events to your own database".
- **Time a turn from the events.** Every event carries `meta.at`. A hook on `step.started`, `step.completed`, `actions.requested`, `action.result` and `turn.completed` gives the model time, the tool time and the total per turn. Source: `concepts/sessions-runs-and-streaming.md` § "The event envelope"; `guides/hooks.md` § "Define a hook".

### State and context

- **What the agent must remember lives in `defineState`.** Declare the handle once at module scope, from `eve/context`, and import it in tools and hooks. `get()` and `update()` work only inside eve-managed code. Source: `concepts/state.md`.
- **`clientContext` lasts one model call.** It never enters durable history. Send an id through it, then store it in state from the first tool that reads it. Source: `guides/frontend/overview.mdx` § "Attach page context per turn".
- **State never reaches a subagent.** Source: `concepts/state.md` § "State is never shared with subagents".

### Execution

- **Count the steps of a lane.** A step is one model call and the tool calls it makes. Every turn ends with a model step. A lane's exact tool list, in order, and its step count are the budget its eval asserts. Source: `concepts/execution-model-and-durability.mdx` § "Sessions, turns, and steps".
- **A subagent costs a session and a sandbox.** Split one out only for a different prompt or a narrower tool surface. Source: `subagents/index.mdx` § "When to split".

### Human in the loop

- **`approval` and `ask_question` park the turn the same way.** Both emit `input.requested`. The client answers through `respond()` with the `requestId`. Source: `tools/human-in-the-loop.md` § "How pause and resume works".
- **The client reads the request from the part.** The pending request sits at `part.toolMetadata.eve.inputRequest` on a `dynamic-tool` part. Scan every message. Source: `guides/frontend/overview.mdx` § "Human-in-the-loop prompts".

### Client

- **`useEveAgent` from `eve/react` is the client.** Render `data.messages`, steer on `status`, send with `send()`. Source: `guides/frontend/overview.mdx` § "Basic chat (React)".
- **Resume a thread with `resume: true` and `initialSession`.** Persist the cursor from `onSessionChange`. Remount the chat on a thread switch with a `key`. Source: `guides/frontend/overview.mdx` § "Resumable sessions".

### Evals

- **`evals/evals.config.ts` exists, and one `.eval.ts` file is one case.** Source: `evals/overview.mdx` § "`evals.config.ts`"; `evals/cases.mdx`.
- **One eval per tool runs on the compiled build.** A scripted `mockModel` turns one message into the one tool call. This is the only test that sees what the eve compiler breaks. Source: `evals/overview.mdx` § "Deterministic fixture models"; `backend-standards` Review item 27.
- **A lane eval asserts the exact tool list, in order, and the budget.** Use `t.toolOrder([...])` and `t.maxToolCalls(n)`, so a chain that grows by one tool fails. Source: `evals/assertions.mdx` § "Scoped assertions".
- **Tag the evals that need a real model `live`, and exclude the tag in the default script.** A `--tag` that matches nothing is a configuration error. Source: `evals/running.mdx`.
- **A client stream fixture copies a real trace.** The `frontend-tests` Review checklist owns that rule. Capture the trace with `eve traces` (below).

### Measure

- **Read the turn from its trace.** `pnpm exec eve traces` prints the span tree of the last turn: each model step with its tokens, each `execute_tool` span with its tool name and duration. Set `EVE_TRACES_CONTENT=on` in `.env.local` to capture prompts and tool payloads. Source: `reference/cli.md` § "eve traces".

## Common failures

- **`eve info` says no eve project contains the directory, or reports a version the app does not install.** The command ran outside the app root, or through `npx`. Run `pnpm exec eve info` from the app root. Source: `reference/cli.md`, the opening paragraph ("from the application root or any directory beneath it").

- **`eve eval` reports a dev server already running.** The record in `.eve/dev-server-state.v1.json` points at the project's dev server. Move the file aside for the eval run and put it back. Never stop that server; it belongs to whoever runs `dev`. Source: `reference/cli.md` § "eve dev", the paragraph on `dev-server-state.v1.json`.
- **A tool compiles and throws `ReferenceError` on its first call.** Its `execute` sits inside a function body. Move it to module scope. See `backend-standards` `references/eve-entry.md`.
- **A model runs `bash` or reads the environment unprompted.** A default tool is still on. Disable it (Built-in tools).
- **The model repeats ids or option lists back.** The tool has no `toModelOutput` (Tools).
- **Every typed answer costs three model calls.** A model call sits on a step the instructions fix (Instructions).

## Gates

Run all of these before a commit that touches `agent/`, `evals/` or a `useEveAgent` client. Paste the output in the proof.

1. `pnpm exec eve info`, run from the app root, prints no diagnostic.
2. The project's eval script (mock model, `--exclude-tag live`) exits `0`.
3. `pnpm exec eve eval --tag live` exits `0` when model credentials are in the shell. Say so when they are not.
4. For a lane change, `pnpm exec eve traces` of one real turn, with the count of model calls equal to the lane's budget.

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
9. A `useEveAgent` client resumes a thread without `initialSession` and `resume: true`, or reuses one store across threads.
10. A gate in the Gates section was not run, or its output is not in the proof.
