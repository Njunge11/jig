---
description: "recipe-rich-text: stream to a read-only view, convert once, store JSON"
tags: [obedience, frontend, regression]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

If a skill named `recipe-rich-text` is available to you, invoke it with the Skill tool before you start. If it is not available, work without it.

The working directory is a store app: Next.js App Router, tRPC v11, TanStack Query v5, Drizzle, react-hook-form, shadcn/ui and Lexical. The app has one Lexical editor component, `RichTextEditor` in `components/ui/rich-text-editor.tsx`. The product edit page, `app/products/[productId]/edit/page.tsx`, uses it for the product's description. `trpc.ai.improveDescription({ markdown })` streams the improved description from the server as markdown chunks.

Add an "Improve with AI" button to the description editor: the streamed text appears while it arrives, and the result becomes the editor's content. Also add a Save button that stores the description in the product's `description` column.

Do not write or change tests.
