# Sources

Provenance for the rules in `SKILL.md`. The agent-facing text cites doc pages only; this file records where each rule came from and what was observed.

## Primary source

- eve `0.47.6`, the docs shipped in the package at `node_modules/eve/docs/`. Every rule in `SKILL.md` names its page and section there. The map in `eve-docs-map.md` lists the pages read.

## Observations that motivated a rule

Each observation was made on a Next.js app with one eve agent, in September 2026. The rule stands on the doc; the observation says why the rule is in the skill.

| Rule | Observation |
| ---- | ----------- |
| Tools: body shape | A tool whose `execute` was declared inside a factory compiled, then threw `ReferenceError` on its first call. `eve build` and Vitest did not catch it. One eval per tool on the compiled build did. |
| Built-in tools: disable the defaults | A trace showed the model running `env`, `ps aux` and `cat /proc/net/tcp` through the default `bash` tool, unprompted. |
| Hooks: observe only; a blocking screen wraps the model | A scope screen was first attempted in a hook. Hooks cannot refuse a turn. The screen moved to AI SDK middleware on the model. |
| Hooks vs channel events | A channel's `events` handlers did not receive `message.received`. A hook did. Anything that must see user text server-side is a hook. |
| Instructions: never chain tools | The instructions told the model to call three tools in a row after every typed answer. Each was a durable step with its own model call. |
| Tools: `toModelOutput` | No tool projected its result. The model read every option list, prefilled value and JD body. |
| Execution: count the steps | eve re-enters the model after every tool result. A lane that ends on a card still pays a closing model call. |
| Evals: `live` tag | Evals that need a real model failed without credentials in the shell; the test runner does not load `.env`. |
| Common failures: dev server already running | `eve eval` refused to start while the Next.js dev server, which `withEve` wraps, was running. The record in `.eve/dev-server-state.v1.json` named it. Stopping that server killed the user's dev session. |
| Evals: fixtures copy a trace | Stream fixtures streamed the words before the tool result. The real agent calls the tool first. Forty-five tests stayed green while every form arrived read-only. |
| Version pin | eve `0.48` scans the app for `"use workflow"` files under stricter rules than Vercel's `withWorkflow`. An app with its own workflows could not upgrade. |
