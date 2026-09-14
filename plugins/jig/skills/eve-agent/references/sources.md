# Sources

Provenance for the rules in `SKILL.md`: the doc page and section behind each rule, and what was observed.

## Primary source

- eve `0.47.6`, the docs shipped in the package at `node_modules/eve/docs/`. The map in `eve-docs-map.md` lists the pages read.

## Rule to source

Page paths are under `node_modules/eve/docs/`.

| Rule | Page and section |
| ---- | ---------------- |
| The body shape is the eve entry of `backend-standards` (the name rule) | `tools/overview.mdx` § "Define a tool" |
| Run `pnpm exec eve info` from the app root that installs `eve` | `reference/cli.md` § "eve info" |
| Find the project's eval script | `evals/running.mdx` § "Exit codes" |
| `agent/instructions.md` holds identity and standing rules, and nothing else | `instructions.mdx` § "Author instructions" and § "Instructions vs skills" |
| A model call is a decision | `concepts/execution-model-and-durability.mdx` § "Sessions, turns, and steps" |
| Declare `outputSchema` on a tool whose raw output a client, a hook or a mapping reads | `tools/overview.mdx` § "Define a tool", the paragraph on `outputSchema` |
| Project the result for the model with `toModelOutput` | `tools/overview.mdx` § "Shape what the model sees with `toModelOutput`" |
| Return JSON only | `tools/overview.mdx`, the paragraph after `toModelOutput` |
| Gate an irreversible or external side effect with `approval` | `tools/human-in-the-loop.md` § "Approvals" |
| Make every write safe to run twice | `tools/overview.mdx` § "When a tool throws" |
| A thrown error is a tool error the model reads | `tools/overview.mdx` § "When a tool throws" |
| Pass `ctx.abortSignal` to work that can be cancelled | `tools/overview.mdx` § "The `ctx` parameter" |
| Disable every default the agent must not have | `concepts/built-in-tools.md` § "Default tools" and § "Disable a default" |
| A hook observes. It never blocks and never adds context | `guides/hooks.md` § "Define a hook" and § "Execution order" |
| A screen that must block sits on the model, not in a hook | `agent-config.md` § "Set the model"; `guides/hooks.md` § "Define a hook" ("Handlers are observe-only") |
| Wrap a hook body in `try`/`catch` | `guides/hooks.md` § "What happens when a hook throws" |
| A hook runs at least once per event | `guides/hooks.md` § "Persist events to your own database" |
| Time a turn from the events | `concepts/sessions-runs-and-streaming.md` § "The event envelope"; `guides/hooks.md` § "Define a hook" |
| What the agent must remember lives in `defineState` | `concepts/state.md` |
| `clientContext` lasts one model call | `guides/frontend/overview.mdx` § "Attach page context per turn" |
| State never reaches a subagent | `concepts/state.md` § "State is never shared with subagents" |
| Count the steps of a lane | `concepts/execution-model-and-durability.mdx` § "Sessions, turns, and steps" |
| A subagent costs a session and a sandbox | `subagents/index.mdx` § "When to split" |
| `approval` and `ask_question` park the turn the same way | `tools/human-in-the-loop.md` § "How pause and resume works" |
| The client reads the request from the part | `guides/frontend/overview.mdx` § "Human-in-the-loop prompts" |
| `useEveAgent` from `eve/react` is the client | `guides/frontend/overview.mdx` § "Basic chat (React)" |
| Resume a thread with `resume: true` and `initialSession` | `guides/frontend/overview.mdx` § "Resumable sessions" |
| `evals/evals.config.ts` exists, and one `.eval.ts` file is one case | `evals/overview.mdx` § "`evals.config.ts`"; `evals/cases.mdx` |
| One eval per tool runs on the compiled build | `evals/overview.mdx` § "Deterministic fixture models"; `backend-standards` Review item 27 |
| A lane eval asserts the exact tool list, in order, and the budget | `evals/assertions.mdx` § "Scoped assertions" |
| Tag the evals that need a real model `live`, and exclude the tag in the default script | `evals/running.mdx` |
| A judge sees the criteria and `on`, nothing else | `evals/judge.mdx` § "The graders" |
| A bar is `.gate(n)` | `evals/judge.mdx` § "Soft scoring and thresholds" |
| A live seed ensures reference rows and never deletes them | `evals/running.mdx`, the opening paragraph ("runs the evals concurrently") |
| Read the turn from its trace | `reference/cli.md` § "eve traces" |
| The trace counts model steps and tool calls, not statements | `reference/cli.md` § "eve traces" — span rows carry token counts, gateway cost and the tool name of `execute_tool` spans; no span carries a statement count |
| `eve info` says no eve project contains the directory, or reports a version the app does not install | `reference/cli.md`, the opening paragraph ("from the application root or any directory beneath it") |
| `eve eval` reports a dev server already running | `reference/cli.md` § "eve dev", the paragraph on `dev-server-state.v1.json` |

## Observations that motivated a rule

Each observation was made on a Next.js app with one eve agent, in September 2026. The rule stands on the doc; the observation says why the rule is in the skill.

| Rule | Observation |
| ---- | ----------- |
| Tools: body shape | A tool whose `execute` was declared inside a factory compiled, then threw `ReferenceError` on its first call. `eve build` and Vitest did not catch it. One eval per tool on the compiled build did. |
| Built-in tools: disable the defaults | A trace showed the model running `env`, `ps aux` and `cat /proc/net/tcp` through the default `bash` tool, unprompted. |
| Hooks: observe only; a blocking screen wraps the model | A scope screen was first attempted in a hook. Hooks cannot refuse a turn. The screen moved to AI SDK middleware on the model. |
| Hooks vs channel events | A channel's `events` handlers did not receive `message.received`. A hook did. Anything that must see user text server-side is a hook. |
| Instructions: never chain tools | The instructions told the model to call three tools in a row after every typed answer. Each was a durable step with its own model call. |
| Tools: `outputSchema` | No tool declared the shape it returned. The card mapping narrowed untyped JSON with one `if` chain per tool result, and a tool could change its result without a type error at the mapping. |
| Tools: `toModelOutput` | No tool projected its result. The model read every option list, prefilled value and JD body. |
| Execution: count the steps | eve re-enters the model after every tool result. A lane that ends on a card still pays a closing model call. |
| Evals: `live` tag | Evals that need a real model failed without credentials in the shell; the test runner does not load `.env`. |
| Common failures: dev server already running | `eve eval` refused to start while the Next.js dev server, which `withEve` wraps, was running. The record in `.eve/dev-server-state.v1.json` named it. Stopping that server killed the user's dev session. |
| Evals: fixtures copy a trace | Stream fixtures streamed the words before the tool result. The real agent calls the tool first. Forty-five tests stayed green while every form arrived read-only. |
| Measure: the trace counts steps and tools, not statements | A tRPC procedure of the same app logged 10.4 s in one step with 2 statements, and another logged 7 statements at 300–500 ms each on a remote database. `eve traces` showed a tool's duration and tokens but could not tell statement time from model time. The statement count came from the db client's logger, the same counter `backend-tests` § "Statement counter" describes. |
| Version pin | eve `0.48` scans the app for `"use workflow"` files under stricter rules than Vercel's `withWorkflow`. An app with its own workflows could not upgrade. |
