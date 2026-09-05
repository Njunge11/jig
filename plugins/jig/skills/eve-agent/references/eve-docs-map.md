# eve docs map

Load this file to find the doc page for the slot you change. Every path is under `node_modules/eve/docs/` in the app that installs `eve`. Open the page before you write. Check the installed version in `package.json` first; the pages describe that version.

| Slot | Page | Sections to read |
| ---- | ---- | ---------------- |
| Agent config, model, reasoning, limits | `agent-config.md` | "Set the model", "Reasoning effort", "Runtime limits" |
| Instructions | `instructions.mdx` | "Author instructions", "System and user roles", "Instructions vs skills" |
| What the model sees, and where each kind of context goes | `concepts/context-control.md` | "Recommended context layout" |
| Tool definition, `toModelOutput`, throws, `ctx` | `tools/overview.mdx` | "Define a tool", "The `ctx` parameter", "When a tool throws", "Shape what the model sees with `toModelOutput`" |
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
