# Entry — Workflow (`workflows/<name>/`)

The rules for the durable-workflow entry point. Load this file when the feature has a workflow. It backs items 5, 6, and 7 of the Review checklist in `SKILL.md`.

Use a workflow for multi-step work that must survive crashes and waits — LLM calls, external APIs, human approval.

- **`index.ts` — the workflow function**, marked `"use workflow"`. **Does:** it orchestrates the steps and branches on their results. The runtime sandboxes this function and replays it from the event log. Thus the function must be **deterministic**: no I/O, no clock, no randomness, no service calls.
  **Never:** business logic or side effects — put those in steps.
- **`steps.ts` — step functions**, marked `"use step"`. A step has the full Node runtime. The step is the place that calls the services. The step performs the router's role: it composes the real service and invokes it. Steps retry automatically — 3 attempts by default. Adjust the count per step with `fn.maxRetries = n`. Keep the steps in a file separate from the workflow function — this prevents bundler issues.
- **Orchestrator state comes only from the step returns and the triggering input** — branch on nothing else. Every side effect lives inside a step. Each step checks whether its work is already complete before it does the work. A retried step executes again from the top, so error classification alone does not make a retry safe.
- **Classify errors inside steps** (`import { FatalError, RetryableError } from "workflow"`). Throw `FatalError` for failures with no recovery (a bad credential) — it stops the retries. Throw `RetryableError` with `retryAfter` (a duration string, ms, or a Date) for rate limits and custom backoff. An error that you do not classify consumes the default retries.
- **Pause** with `await sleep("30d")` — this suspends the workflow and consumes no resources. Or pause with `createWebhook()` — the workflow resumes on external input. This is the human-approval pattern.
- **Start** runs from the application code: call `start(workflow, [input])` from `"workflow/api"`. The result is `await run.returnValue`.
