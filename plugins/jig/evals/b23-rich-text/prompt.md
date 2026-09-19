---
description: "recipe-rich-text: stream to a read-only view, convert once, store JSON"
tags: [obedience, frontend]
runs: 1
max_turns: 10
timeout_seconds: 420
allowed_tools: [Read, Glob, Grep, Skill]
---

If a skill named `recipe-rich-text` is available to you, invoke it with the Skill tool before you answer. If it is not available, answer without it.

The app is Next.js App Router + tRPC v11 + TanStack Query v5 + Drizzle + shadcn/ui. The app has one Lexical editor component `RichTextEditor`, used for the job description. `ai.improveDescription` streams markdown text from the server.

Add an "Improve with AI" button: the streamed text appears while it arrives, and the result becomes the editor's content. Also show how the description is stored on save.

Do not write any file. Reply with the full code of every file you add or change.
